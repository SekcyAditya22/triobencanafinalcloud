import React, { useRef, useState } from 'react';
import { HiArrowUpTray } from "react-icons/hi2";
import axios from 'axios';

export default function KTPUploader({ onImageSelected, initialPreview = null }) {
    const [preview, setPreview] = useState(initialPreview);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef();

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("File terlalu besar. Maksimal 2MB");
            return;
        }

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'ktp');

        try {
            console.log('Uploading file:', file.name, 'size:', file.size);
            
            const response = await axios.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            });

            console.log('Upload response:', response.data);

            const { data } = response;

            if (data.success && data.url) {
                setPreview(data.url);
                onImageSelected(data.url);

                // Notifikasi sukses
                const notification = document.createElement('div');
                notification.className = 'fixed z-50 top-4 right-4 animate-slide-in';
                notification.innerHTML = `
                    <div class="alert alert-success shadow-lg flex items-center gap-2 min-w-[320px]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="flex flex-col">
                            <span class="font-bold">Berhasil!</span>
                            <span class="text-sm">Foto KTP berhasil diupload.</span>
                        </div>
                        <button onclick="this.parentElement.remove()" class="btn btn-ghost btn-sm">✕</button>
                    </div>
                `;
                document.body.appendChild(notification);
                setTimeout(() => notification.remove(), 3000);
            } else {
                console.error('Upload response invalid:', data);
                throw new Error(data.message || 'Server tidak mengembalikan URL file');
            }

        } catch (error) {
            console.error('Upload failed:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setError(errorMessage);
            alert('Gagal mengupload foto KTP: ' + errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                Foto KTP
            </label>
            <div className="flex flex-col items-start space-y-2">
                {preview && (
                    <div className="relative w-full">
                        <img
                            src={preview}
                            alt="KTP Preview"
                            className="object-cover w-full h-48 rounded-lg"
                        />
                    </div>
                )}
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <HiArrowUpTray className="w-5 h-5" />
                    <span>{uploading ? 'Mengupload...' : (preview ? 'Ganti Foto KTP' : 'Upload KTP')}</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/jpeg,image/png"
                    className="hidden"
                />
            </div>
        </div>
    );
} 