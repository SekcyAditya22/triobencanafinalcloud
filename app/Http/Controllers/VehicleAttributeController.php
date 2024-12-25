<?php

namespace App\Http\Controllers;

use App\Models\VehicleAttribute;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\VehicleCategory;
use Illuminate\Support\Str;

class VehicleAttributeController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('view-vehicle-attributes');

        $attributes = VehicleAttribute::query()
            ->with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
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

        return Inertia::render('Vehicle/Attributes/Index', compact('attributes'));
    }

    public function create()
    {
        $this->authorize('create-vehicle-attributes');
        
        $categories = VehicleCategory::all();
        return Inertia::render('Vehicle/Attributes/Create', compact('categories'));
    }

    public function store(Request $request)
    {
        $this->authorize('create-vehicle-attributes');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:text,number,select,boolean'],
            'options' => ['nullable', 'array', 'required_if:type,select'],
            'required' => ['boolean'],
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
        ]);
        
        VehicleAttribute::create($validated);

        return redirect()
            ->route('dashboard.vehicle-attributes.index')
            ->with('success', 'Atribut berhasil ditambahkan');
    }

    public function edit(VehicleAttribute $vehicleAttribute)
    {
        return inertia('Vehicle/Attributes/Edit', [
            'attribute' => $vehicleAttribute,
            'categories' => VehicleCategory::all()
        ]);
    }

    public function update(Request $request, VehicleAttribute $vehicleAttribute)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:text,number,select,boolean'],
            'options' => ['nullable', 'array', 'required_if:type,select'],
            'required' => ['boolean'],
            'vehicle_category_id' => ['required', 'exists:vehicle_categories,id'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $vehicleAttribute->update($validated);

        return redirect()
            ->route('dashboard.vehicle-attributes.index')
            ->with('success', 'Atribut berhasil diperbarui');
    }

    public function destroy(VehicleAttribute $vehicleAttribute)
    {
        $vehicleAttribute->delete();

        return redirect()
            ->route('dashboard.vehicle-attributes.index')
            ->with('success', 'Atribut berhasil dihapus');
    }
} 