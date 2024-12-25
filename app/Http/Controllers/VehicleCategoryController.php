<?php

namespace App\Http\Controllers;

use App\Models\VehicleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VehicleCategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('view-vehicle-categories');

        $categories = VehicleCategory::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when(
                $request->has('sortField'),
                fn ($query) => $query->orderBy(
                    $request->sortField,
                    $request->sortDirection === 'desc' ? 'desc' : 'asc'
                )
            )
            ->paginate($request->perPage ?? 10)
            ->withQueryString();

        return Inertia::render('Vehicle/Categories/Index', compact('categories'));
    }

    public function create()
    {
        $this->authorize('create-vehicle-categories');
        
        return Inertia::render('Vehicle/Categories/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create-vehicle-categories');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = \Str::slug($validated['name']);
        
        VehicleCategory::create($validated);

        return redirect()
            ->route('dashboard.vehicle-categories.index')
            ->with('success', 'Kategori berhasil dibuat');
    }

    public function edit(VehicleCategory $vehicleCategory)
    {
        return inertia('Vehicle/Categories/Edit', [
            'category' => $vehicleCategory
        ]);
    }

    public function update(Request $request, VehicleCategory $vehicleCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $vehicleCategory->update($validated);

        return redirect()
            ->route('dashboard.vehicle-categories.index')
            ->with('success', 'Kategori berhasil diperbarui');
    }

    public function destroy(VehicleCategory $vehicleCategory)
    {
        $vehicleCategory->delete();

        return redirect()
            ->route('dashboard.vehicle-categories.index')
            ->with('success', 'Kategori berhasil dihapus');
    }
} 