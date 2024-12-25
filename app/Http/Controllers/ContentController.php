<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\ContentImage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AdminTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContentController extends Controller
{
    private function checkApprovedTransaction()
    {
        if (auth()->user()->hasRole('super-admin')) {
            return ['allowed' => true, 'message' => ''];
        }

        // Cek transaksi yang approved DAN paid
        $transaction = AdminTransaction::where('admin_id', auth()->id())
            ->where('status', 'approved')
            ->where('payment_status', 'paid')
            ->latest()
            ->first();

        // Debug: Log transaction info
        \Log::info('Found transaction:', [
            'transaction' => $transaction ? $transaction->toArray() : null
        ]);

        // Jika tidak ada transaksi
        if (!$transaction) {
            return [
                'allowed' => false,
                'message' => 'Silakan ajukan permohonan akses dan lakukan pembayaran terlebih dahulu.'
            ];
        }

        // Jika sudah approved dan paid, izinkan akses
        if ($transaction->status === 'approved' && $transaction->payment_status === 'paid') {
            \Log::info('Transaction is approved and paid, allowing access');
            return ['allowed' => true, 'message' => ''];
        }

        return [
            'allowed' => false,
            'message' => 'Status permohonan atau pembayaran Anda belum valid. Silakan cek status pembayaran Anda.'
        ];
    }

    public function index()
    {
        $contentQuery = Content::query()->with(['user', 'images']);

        // Cek apakah user sudah memiliki konten
        $hasExistingContent = Content::where('user_id', auth()->id())->exists();

        // Handle search
        $contentQuery->when(request('search'), function ($query, $search) {
            return $query->where('title', 'LIKE', '%' . $search . '%')
                ->orWhere('description', 'LIKE', '%' . $search . '%')
                ->orWhere('status', 'LIKE', '%' . $search . '%');
        });

        // Default sorting
        $contentQuery->orderBy('created_at', 'desc');

        $contents = $contentQuery->get();

        // Load regency dan district data untuk setiap konten
        foreach ($contents as $content) {
            if ($content->regency_id) {
                $content->regency = Cache::remember("regency_{$content->regency_id}", 60*60*24, function () use ($content) {
                    $response = Http::withoutVerifying()
                        ->get("https://www.emsifa.com/api-wilayah-indonesia/api/regency/{$content->regency_id}.json");
                    return $response->successful() ? $response->json() : null;
                });
            }
            
            if ($content->district_id) {
                $content->district = Cache::remember("district_{$content->district_id}", 60*60*24, function () use ($content) {
                    $response = Http::withoutVerifying()
                        ->get("https://www.emsifa.com/api-wilayah-indonesia/api/district/{$content->district_id}.json");
                    return $response->successful() ? $response->json() : null;
                });
            }
        }

        // Tambahkan data transaksi untuk pengecekan
        $transactions = [];
        if (!auth()->user()->hasRole('super-admin')) {
            $transactions = AdminTransaction::where('admin_id', auth()->id())
                ->where(function($query) {
                    $query->where('status', 'approved')
                        ->where('payment_status', 'paid');
                })
                ->get();
        }

        return Inertia::render('Content/Awal', [
            'contents' => $contents,
            'can' => [
                'view_all_content' => auth()->user()->hasRole('super-admin'),
                'create_content' => !$hasExistingContent
            ],
            'filters' => request()->only(['search']),
            'transactions' => $transactions
        ]);
    }

    public function create()
    {
        // Cek apakah user sudah memiliki konten
        $existingContent = Content::where('user_id', auth()->id())->first();
        
        if ($existingContent) {
            return redirect()->route('dashboard.content.index')
                ->with('error', 'Anda sudah memiliki konten. Tidak dapat membuat konten baru.');
        }

        // Cek transaksi hanya jika bukan super-admin
        if (!auth()->user()->hasRole('super-admin')) {
            $check = $this->checkApprovedTransaction();
            if (!$check['allowed']) {
                return redirect()
                    ->route('dashboard.admin-transactions')
                    ->with('error', 'Silakan ajukan permohonan akses dan lakukan pembayaran dan menunggu status.');
            }
        }

        return Inertia::render('Content/Create', [
            'regencies' => [
                ['id' => 3471, 'name' => 'KOTA YOGYAKARTA'],
                ['id' => 3402, 'name' => 'KABUPATEN BANTUL'],
                ['id' => 3403, 'name' => 'KABUPATEN GUNUNGKIDUL'],
                ['id' => 3404, 'name' => 'KABUPATEN SLEMAN'],
                ['id' => 3401, 'name' => 'KABUPATEN KULON PROGO'],
            ]
        ]);
    }

    public function store(Request $request)
    {
        // Cek apakah user sudah memiliki konten
        $existingContent = Content::where('user_id', auth()->id())->first();
        
        if ($existingContent) {
            return redirect()->route('dashboard.content.index')
                ->with('error', 'Anda sudah memiliki konten. Tidak dapat membuat konten baru.');
        }

        // Cek role dan transaksi
        if (!auth()->user()->hasRole('super-admin')) {
            $check = $this->checkApprovedTransaction();
            if (!$check['allowed']) {
                return redirect()
                    ->route('dashboard.admin-transactions')
                    ->with('error', $check['message']);
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'province' => 'required|string',
            'regency_id' => 'nullable|exists:regencies,id',
            'district_id' => 'nullable|exists:districts,id',
            'address' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // max 2MB per image
            'images' => 'nullable|array|max:2', // max 2 images
        ]);

        $content = Content::create([
            'user_id' => auth()->id(),
            ...$validated
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('content-images', 'public');
                
                ContentImage::create([
                    'content_id' => $content->id,
                    'url' => Storage::url($path),
                    'path' => $path,
                ]);
            }
        }

        return redirect()->route('dashboard.content.index')
            ->with('success', 'Konten berhasil dibuat');
    }

    public function edit(Content $content)
    {
        $content->load('images');
        
        $regencies = [
            ['id' => 1, 'name' => 'Kota Yogyakarta'],
            ['id' => 2, 'name' => 'Kabupaten Sleman'],
            ['id' => 3, 'name' => 'Kabupaten Bantul'],
            ['id' => 4, 'name' => 'Kabupaten Gunungkidul'],
            ['id' => 5, 'name' => 'Kabupaten Kulon Progo'],
        ];

        if (!$this->checkApprovedTransaction()) {
            return redirect()
                ->route('dashboard.admin-transactions')
                ->with('error', 'Anda harus memiliki permohonan yang disetujui sebelum dapat mengedit konten.');
        }

        if (!auth()->user()->hasRole('super-admin') && $content->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Content/Edit', [
            'content' => $content,
            'regencies' => $regencies
        ]);
    }

    public function update(Request $request, Content $content)
    {
        if (!$this->checkApprovedTransaction()) {
            return redirect()
                ->route('dashboard.admin-transactions')
                ->with('error', 'Anda harus memiliki permohonan yang disetujui sebelum dapat mengupdate konten.');
        }

        if (!auth()->user()->hasRole('super-admin') && $content->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'status' => 'required|in:draft,published,archived',
            'province' => 'required|string',
            'regency_id' => 'nullable|exists:regencies,id',
            'district_id' => 'nullable|exists:districts,id',
            'address' => 'nullable|string',
            'latitude' => 'nullable|string',
            'longitude' => 'nullable|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'images' => 'nullable|array|max:2',
        ]);

        $content->update($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            // Delete old images
            foreach ($content->images as $image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            }

            // Upload new images
            foreach ($request->file('images') as $image) {
                $path = $image->store('content-images', 'public');
                
                ContentImage::create([
                    'content_id' => $content->id,
                    'url' => Storage::url($path),
                    'path' => $path,
                ]);
            }
        }

        return redirect()->route('dashboard.content.index')
            ->with('success', 'Konten berhasil diperbarui');
    }

    public function destroy(Content $content)
    {
        if (!auth()->user()->hasRole('super-admin') && $content->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete associated images from storage
        foreach ($content->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $content->delete();

        return redirect()->route('dashboard.content.index')
            ->with('success', 'Konten berhasil dihapus');
    }

    public function show(Content $content)
    {
        // Load user dan images data
        $content->load(['user', 'images']);
        
        // Get regency name
        if ($content->regency_id) {
            $regencyResponse = Http::withoutVerifying()
                ->get("https://www.emsifa.com/api-wilayah-indonesia/api/regency/{$content->regency_id}.json");
            if ($regencyResponse->successful()) {
                $content->regency = $regencyResponse->json();
            }
        }
        
        // Get district name
        if ($content->district_id) {
            $districtResponse = Http::withoutVerifying()
                ->get("https://www.emsifa.com/api-wilayah-indonesia/api/district/{$content->district_id}.json");
            if ($districtResponse->successful()) {
                $content->district = $districtResponse->json();
            }
        }

        return inertia('Content/Show', [
            'content' => $content
        ]);
    }
}