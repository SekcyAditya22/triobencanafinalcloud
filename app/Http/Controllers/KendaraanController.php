<?php

namespace App\Http\Controllers;

use App\Models\Kendaraan;
use App\Models\VehicleCategory;
use App\Models\VehicleAttribute;
use App\Models\Content;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KendaraanController extends Controller
{
    public function index()
    {
        $query = Kendaraan::with(['user', 'content']);

        $query->when(request('search'), function($query, $search) {
            $query->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });

        if (!auth()->user()->hasRole('super-admin')) {
            $query->whereHas('content', function($q) {
                $q->where('user_id', auth()->id());
            });
        }

        $vehicles = $query->latest()
            ->get()
            ->map(function ($vehicle) {
                return [
                    'id' => $vehicle->id,
                    'title' => $vehicle->title,
                    'description' => $vehicle->description,
                    'category' => $vehicle->vehicle_category_id,
                    'unit' => $vehicle->unit,
                    'price_per_day' => $vehicle->price_per_day,
                    'photos' => $vehicle->photos ? collect($vehicle->photos)->map(fn($photo) => asset('storage/' . $photo)) : [],
                    'selected_attributes' => $vehicle->selected_attributes,
                    'status' => $vehicle->status,
                    'created_at' => $vehicle->created_at,
                    'content' => [
                        'id' => $vehicle->content->id,
                        'name' => $vehicle->content->title
                    ],
                    'user' => [
                        'id' => $vehicle->user->id,
                        'name' => $vehicle->user->name,
                        'email' => $vehicle->user->email
                    ]
                ];
            });

        return Inertia::render('Content/Kendaraan/Index', [
            'vehicles' => $vehicles,
            'filters' => request()->all('search'),
            'can' => [
                'view_all_content' => auth()->user()->hasRole('super-admin')
            ],
            'vehicleCategories' => [
                'mobil' => 'Mobil',
                'motor' => 'Motor',
                'truk' => 'Truk',
                'bus' => 'Bus',
            ],
            'vehicleAttributes' => VehicleAttribute::all()
                ->pluck('name', 'id')
                ->toArray()
        ]);
    }

    public function create()
    {
        $userContents = Content::where('user_id', auth()->id())->get();

        $vehicleCategories = [
            ['id' => 'mobil', 'name' => 'Mobil'],
            ['id' => 'motor', 'name' => 'Motor'],
            ['id' => 'truk', 'name' => 'Truk'],
            ['id' => 'bus', 'name' => 'Bus'],
        ];

        return Inertia::render('Content/Kendaraan/Create', [
            'vehicleCategories' => $vehicleCategories,
            'contents' => $userContents,
            'vehicleAttributes' => VehicleAttribute::with('category')
                ->get()
                ->map(function ($attribute) {
                    return [
                        'id' => $attribute->id,
                        'name' => $attribute->name,
                        'category' => $attribute->category->name,
                        'required' => $attribute->required
                    ];
                })
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_id' => 'required|exists:contents,id',
            'vehicle_category_id' => 'required|string',
            'unit' => 'required|integer|min:1',
            'price_per_day' => 'required|numeric|min:0',
            'photos.*' => 'nullable|image|max:2048',
            'selected_attributes' => 'required|array'
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'active';

        // Handle foto upload
        if ($request->hasFile('photos')) {
            $photos = [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('kendaraan-photos', 'public');
                $photos[] = $path;
            }
            $validated['photos'] = $photos;
        }

        Kendaraan::create($validated);

        return redirect()
            ->route('dashboard.kendaraan.index')
            ->with('success', 'Kendaraan berhasil ditambahkan');
    }

    public function edit(Kendaraan $kendaraan)
    {
        $userContents = Content::where('user_id', auth()->id())->get();
        
        return Inertia::render('Content/Kendaraan/Edit', [
            'kendaraan' => array_merge($kendaraan->toArray(), [
                'photos' => $kendaraan->photos ? collect($kendaraan->photos)->map(fn($photo) => asset('storage/' . $photo)) : [],
                'selected_attributes' => $kendaraan->selected_attributes ?? [],
            ]),
            'vehicleCategories' => [
                ['id' => 'mobil', 'name' => 'Mobil'],
                ['id' => 'motor', 'name' => 'Motor'],
                ['id' => 'truk', 'name' => 'Truk'],
                ['id' => 'bus', 'name' => 'Bus'],
            ],
            'contents' => $userContents,
            'vehicleAttributes' => VehicleAttribute::with('category')
                ->get()
                ->map(function ($attribute) {
                    return [
                        'id' => $attribute->id,
                        'name' => $attribute->name,
                        'category' => $attribute->category->name,
                        'required' => $attribute->required
                    ];
                })
        ]);
    }

    public function update(Request $request, Kendaraan $kendaraan)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content_id' => 'required|exists:contents,id',
            'vehicle_category_id' => 'required|string',
            'unit' => 'required|integer|min:1',
            'price_per_day' => 'required|numeric|min:0',
            'photos.*' => 'nullable|image|max:2048',
            'existing_photos' => 'nullable|string',
            'selected_attributes' => 'required|array'
        ]);

        // Handle existing photos
        if ($request->has('existing_photos')) {
            $photos = collect(json_decode($request->existing_photos))
                ->map(function ($photoUrl) {
                    return str_replace(asset('storage/'), '', $photoUrl);
                })
                ->toArray();
        } else {
            $photos = [];
        }

        // Handle new photo uploads
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('kendaraan-photos', 'public');
                $photos[] = $path;
            }
        }

        // Update data kendaraan
        $kendaraan->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'content_id' => $validated['content_id'],
            'vehicle_category_id' => $validated['vehicle_category_id'],
            'unit' => $validated['unit'],
            'price_per_day' => $validated['price_per_day'],
            'photos' => $photos,
            'selected_attributes' => $request->selected_attributes
        ]);

        return redirect()
            ->route('dashboard.kendaraan.index')
            ->with('success', 'Kendaraan berhasil diperbarui');
    }

    public function destroy(Kendaraan $kendaraan)
    {
        $kendaraan->delete();

        return redirect()
            ->route('dashboard.kendaraan.index')
            ->with('success', 'Kendaraan berhasil dihapus');
    }
} 