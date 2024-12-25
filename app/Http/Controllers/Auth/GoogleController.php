<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class GoogleController extends Controller
{
    protected function getSocialite()
    {
        $client = new Client([
            'verify' => false,
            'curl' => [
                CURLOPT_SSL_VERIFYPEER => false
            ]
        ]);

        return Socialite::driver('google')->setHttpClient($client);
    }

    public function redirectToGoogleAdmin()
    {
        try {
            $redirectUri = url('auth/google/admin/callback');
            Log::info('Admin Redirect URI:', ['uri' => $redirectUri]);
            
            return $this->getSocialite()
                ->with(['state' => 'admin'])
                ->redirectUrl($redirectUri)
                ->redirect();
        } catch (Exception $e) {
            Log::error('Google Admin Redirect Error:', ['error' => $e->getMessage()]);
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat menghubungi Google.');
        }
    }

    public function redirectToGoogleCustomer()
    {
        try {
            $redirectUri = url('auth/google/customer/callback');
            Log::info('Customer Redirect URI:', ['uri' => $redirectUri]);
            
            return $this->getSocialite()
                ->with(['state' => 'customer'])
                ->redirectUrl($redirectUri)
                ->redirect();
        } catch (Exception $e) {
            Log::error('Google Customer Redirect Error:', ['error' => $e->getMessage()]);
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat menghubungi Google.');
        }
    }

    public function handleGoogleCallbackAdmin()
    {
        try {
            if (request()->get('state') !== 'admin') {
                Log::error('Invalid state for admin callback');
                return redirect()->route('login')
                    ->with('error', 'Invalid authentication state.');
            }

            $redirectUri = url('auth/google/admin/callback');
            Log::info('Processing admin callback', [
                'uri' => $redirectUri,
                'state' => request()->get('state')
            ]);

            $googleUser = $this->getSocialite()
                ->stateless()
                ->redirectUrl($redirectUri)
                ->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                Log::info('Creating new admin user', [
                    'email' => $googleUser->getEmail()
                ]);

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(Str::random(16))
                ]);

                $adminRole = Role::where('name', 'admin')->first();
                if (!$adminRole) {
                    Log::error('Admin role not found');
                    throw new Exception('Admin role not found in database');
                }

                $user->assignRole($adminRole);
                Log::info('Admin role assigned successfully');
            } elseif (!$user->hasRole('admin')) {
                Log::warning('User exists but not admin', [
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()
                ]);
                return redirect()->route('login')
                    ->with('error', 'Akun Google ini sudah terdaftar sebagai customer.');
            }

            Auth::login($user);
            return redirect()->route('dashboard.index');

        } catch (Exception $e) {
            Log::error('Google Admin Callback Error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat login dengan Google.');
        }
    }

    public function handleGoogleCallbackCustomer()
    {
        try {
            $googleUser = $this->getSocialite()
                ->stateless()
                ->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password' => bcrypt(Str::random(16))
                ]);

                $customerRole = Role::where('name', 'customer')->first();
                if ($customerRole) {
                    $user->assignRole($customerRole);
                } else {
                    Log::error('Customer role not found');
                    throw new Exception('Customer role not found in database');
                }
            } elseif (!$user->hasRole('customer')) {
                return redirect()->route('login')
                    ->with('error', 'Akun Google ini sudah terdaftar sebagai admin.');
            }

            Auth::login($user);
            return redirect('/');

        } catch (Exception $e) {
            Log::error('Google Customer Callback Error:', ['error' => $e->getMessage()]);
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat login dengan Google.');
        }
    }
} 