import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link } from "@inertiajs/react";
import { FiEdit, FiClock, FiMapPin, FiUser, FiFileText, FiTag } from "react-icons/fi";

export default function Show({ content }) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="mb-2 page-title">Detail Konten</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href={route("dashboard.index")}>Dashboard</Link></li>
                            <li><Link href={route("dashboard.content.index")}>Semua Konten</Link></li>
                            <li>Detail Konten</li>
                        </ul>
                    </div>
                </div>
                <Link
                    href={route('dashboard.content.edit', content.id)}
                    className="gap-2 btn btn-primary"
                >
                    <FiEdit className="w-4 h-4" />
                    Edit Konten
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Kolom Kiri - Informasi Utama */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="shadow-xl card bg-base-100">
                        <div className="card-body">
                            <h2 className="mb-4 text-2xl card-title">{content.title}</h2>
                            
                            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <FiUser className="w-4 h-4" />
                                    <span>{content.user.name}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FiClock className="w-4 h-4" />
                                    <span>{new Date(content.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FiTag className="w-4 h-4" />
                                    <span className={`badge ${
                                        content.status === 'published' ? 'badge-success' :
                                        content.status === 'draft' ? 'badge-warning' :
                                        'badge-error'
                                    }`}>
                                        {content.status}
                                    </span>
                                </div>
                            </div>
                            
                            {content.description && (
                                <div className="mb-6 prose max-w-none">
                                    <h3 className="mb-2 text-lg font-semibold">Deskripsi</h3>
                                    <p className="text-gray-600">{content.description}</p>
                                </div>
                            )}
                            
                            <div className="prose max-w-none">
                                <h3 className="mb-2 text-lg font-semibold">Konten</h3>
                                <div className="p-4 rounded-lg bg-gray-50">
                                    <p className="text-gray-600 whitespace-pre-wrap">{content.content}</p>
                                </div>
                            </div>

                            {content.images && content.images.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="mb-4 text-lg font-semibold">Gambar</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {content.images.map((image, index) => (
                                            <img 
                                                key={index}
                                                src={image.url} 
                                                alt={`Gambar ${index + 1}`}
                                                className="w-full h-64 object-cover rounded-lg shadow-md"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan - Informasi Tambahan */}
                <div className="space-y-6">
                    {/* Card Lokasi */}
                    <div className="shadow-xl card bg-base-100">
                        <div className="card-body">
                            <h3 className="mb-4 text-lg card-title">
                                <FiMapPin className="w-5 h-5" />
                                Lokasi
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">Provinsi</span>
                                    <p className="font-medium">{content.province}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Kabupaten/Kota</span>
                                    <p className="font-medium">{content.regency?.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Kecamatan</span>
                                    <p className="font-medium">{content.district?.name || '-'}</p>
                                </div>
                                {content.address && (
                                    <div>
                                        <span className="text-sm text-gray-500">Alamat Lengkap</span>
                                        <p className="font-medium">{content.address}</p>
                                    </div>
                                )}
                                {(content.latitude && content.longitude) && (
                                    <div>
                                        <span className="text-sm text-gray-500">Lokasi GPS</span>
                                        <div className="mt-1">
                                            <a
                                                href={`https://www.google.com/maps?q=${content.latitude},${content.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                            >
                                                <FiMapPin className="w-4 h-4 mr-1" />
                                                Lihat di Google Maps
                                            </a>
                                            <p className="text-sm text-gray-500 mt-1">
                                                ({content.latitude}, {content.longitude})
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Timestamp */}
                    <div className="shadow-xl card bg-base-100">
                        <div className="card-body">
                            <h3 className="mb-4 text-lg card-title">
                                <FiClock className="w-5 h-5" />
                                Timestamp
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm text-gray-500">Dibuat pada</span>
                                    <p className="font-medium">
                                        {new Date(content.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Terakhir diupdate</span>
                                    <p className="font-medium">
                                        {new Date(content.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 