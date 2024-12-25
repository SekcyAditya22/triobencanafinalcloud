<?php

namespace App\Http\Controllers;

use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Models\Village;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;


use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Validation\Rule;
use App\Models\UserDetail;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller implements HasMiddleware
{
    /**
     * Display the user's profile form.
     */

    public static function middleware(): array
    {
        return [];
    }

    public function edit(Request $request): Response
    {

        $user = User::with('detail')->find(auth()->id());

        return Inertia::render('Dashboard/Profile/Edit', compact('user'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . auth()->id(),
            'profile_picture' => 'nullable|string|max:255',
            'province_id' => 'nullable|exists:provinces,id',
            'regency_id' => 'nullable|exists:regencies,id',
            'district_id' => 'nullable|exists:districts,id',
            'village_id' => 'nullable|exists:villages,id',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|digits_between:10,15',
        ]);

        $user = auth()->user();
        $data = $request->only('profile_picture', 'province_id', 'regency_id', 'district_id', 'village_id', 'address', 'phone');

        if (isset($data['province_id'])) {
            $province = Province::find($data['province_id']);
            $data['province_name'] = $province->name;
        }

        if (isset($data['regency_id'])) {
            $regency = Regency::find($data['regency_id']);
            $data['regency_name'] = $regency->name;
        }

        if (isset($data['district_id'])) {
            $district = District::find($data['district_id']);
            $data['district_name'] = $district->name;
        }

        if (isset($data['village_id'])) {
            $village = Village::find($data['village_id']);
            $data['village_name'] = $village->name;
        }

        $user->update(request()->only('name', 'email'));

        $user->detail()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );


        session()->flash('success', 'Profile updated successfully.');

        return Redirect::route('dashboard.profile.edit');
    }

    public function show(Request $request)
    {
        try {
            $user = User::with(['detail', 'roles'])->find(auth()->id());
            
            return Inertia::render('Dashboard/Profile/Show', [
                'user' => $user,
                'auth' => [
                    'user' => $user
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in profile show:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function customerShow(Request $request)
    {
        try {
            $user = $request->user()->load(['detail', 'roles']);
            
            return Inertia::render('ShowProfile', [
                'auth' => [
                    'user' => $user,
                ],
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load profile.');
        }
    }

    public function customerEdit(Request $request)
    {
        try {
            $user = $request->user()->load('detail');
            
            return Inertia::render('EditProfile', [
                'auth' => [
                    'user' => $user,
                ],
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load profile editor.');
        }
    }

    public function customerUpdate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->user()->id,
            'profile_picture' => 'nullable|string|max:255',
            'ktp_number' => 'nullable|string|max:16',
            'ktp_picture' => 'nullable|string',
            'province_id' => 'nullable|exists:provinces,id',
            'regency_id' => 'nullable|exists:regencies,id',
            'district_id' => 'nullable|exists:districts,id',
            'village_id' => 'nullable|exists:villages,id',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|digits_between:10,15',
        ]);

        try {
            DB::beginTransaction();
            
            $user = $request->user();
            $data = $request->only([
                'profile_picture',
                'ktp_number',
                'ktp_picture',
                'province_id',
                'regency_id',
                'district_id',
                'village_id',
                'address',
                'phone'
            ]);

            // Get region names
            if (isset($data['province_id'])) {
                $province = Province::find($data['province_id']);
                $data['province_name'] = $province->name;
            }

            if (isset($data['regency_id'])) {
                $regency = Regency::find($data['regency_id']);
                $data['regency_name'] = $regency->name;
            }

            if (isset($data['district_id'])) {
                $district = District::find($data['district_id']);
                $data['district_name'] = $district->name;
            }

            if (isset($data['village_id'])) {
                $village = Village::find($data['village_id']);
                $data['village_name'] = $village->name;
            }

            // Update user basic info
            $user->update($request->only('name', 'email'));

            // Update or create user detail
            $userDetail = $user->detail()->updateOrCreate(
                ['user_id' => $user->id],
                $data
            );

            // Log untuk debugging
            \Log::info('Profile Update Data:', [
                'user_id' => $user->id,
                'ktp_number' => $data['ktp_number'] ?? null,
                'ktp_picture' => $data['ktp_picture'] ?? null,
                'all_data' => $data
            ]);

            DB::commit();
            session()->flash('success', 'Profile updated successfully.');
            return Redirect::route('customer.profile.show');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Profile update error:', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);
            return redirect()->back()->with('error', 'Failed to update profile. Please try again.');
        }
    }
}
