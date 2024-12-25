<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaCrudController extends Controller
{
    public function index()
    {
        $medias = Media::paginate(10);

        return Inertia::render('Dashboard/Media/Index', [
            'medias' => $medias
        ]);
    }

    public function store(Request $request)
    {
        try {
            \Log::info('Upload request received', [
                'user' => auth()->id(),
                'type' => $request->input('type'),
                'has_file' => $request->hasFile('file'),
                'file_size' => $request->file('file')?->getSize(),
                'file_mime' => $request->file('file')?->getMimeType()
            ]);

            $request->validate([
                'file' => 'required|file|mimes:jpg,jpeg,png|max:2048',
                'type' => 'nullable|string'
            ]);

            $file = $request->file('file');
            $user = auth()->user();
            
            if (!$file->isValid()) {
                throw new \Exception('File upload failed - file not valid');
            }
            
            // Tentukan path berdasarkan tipe upload
            $uploadPath = $request->input('type') === 'ktp' ? 'ktp' : 'uploads';
            
            // Generate nama file yang unik
            $fileName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) 
                . '-' 
                . time() 
                . '.' 
                . $file->getClientOriginalExtension();
            
            // Simpan file
            $path = $file->storeAs("public/{$uploadPath}/user-{$user->id}", $fileName);
            
            if (!$path) {
                throw new \Exception('Failed to store file');
            }

            // Dapatkan URL publik
            $url = url(Storage::url($path));

            \Log::info('File uploaded successfully', [
                'path' => $path,
                'url' => $url,
                'user_id' => $user->id,
                'file_exists' => Storage::exists($path)
            ]);

            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
                'message' => 'File uploaded successfully'
            ]);

        } catch (ValidationException $e) {
            \Log::error('Validation error:', [
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', array_map(fn($errors) => implode(', ', $errors), $e->errors())),
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('Upload error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'storage_path' => storage_path('app/public'),
                'is_writable' => is_writable(storage_path('app/public'))
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Media $media)
    {
        try {
            if (Storage::exists($media->filepath)) {
                Storage::delete($media->filepath);
            }
            $media->delete();
            return redirect()->back()->with('success', 'Media berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus media');
        }
    }
}
