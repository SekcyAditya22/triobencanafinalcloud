import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { HiOutlinePencilSquare, HiOutlineTrash, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { getAllQueryParams } from "@/utils";

export default function KendaraanIndex({ auth, vehicles = [], vehicleCategories, vehicleAttributes, can, filters }) {
    const page = usePage().props;
    const queryParams = getAllQueryParams();
    const [searchQuery, setSearchQuery] = useState(page.filters?.search || '');

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) {
            router.delete(route('dashboard.kendaraan.destroy', id));
        }
    };

    const handleSearch = () => {
        router.get(route("dashboard.kendaraan.index"), {
            ...queryParams,
            search: searchQuery,
        });
    };

    const handleReset = () => {
        setSearchQuery('');
        router.get(route("dashboard.kendaraan.index"));
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Daftar Kendaraan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li><Link href={route("dashboard.index")}>Dashboard</Link></li>
                            <li>Kendaraan</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <Link
                        href={route("dashboard.kendaraan.create")}
                        className="btn btn-primary btn-outline btn-sm"
                    >
                        Tambah Kendaraan Baru
                    </Link>
                </div>
            </div>

            <div className="page-section">
                <div className="page-section__header">
                    <div className="flex items-center justify-between">
                        <h3 className="page-section__title">Daftar Kendaraan</h3>
                        <div className="flex items-center gap-4">
                            <div className="join">
                                <div className="relative join-item">
                                    <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-500 pointer-events-none">
                                        <HiMagnifyingGlass className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari kendaraan..."
                                        className="w-full max-w-xs pl-10 input input-bordered"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyUp={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch();
                                            }
                                        }}
                                    />
                                </div>
                                <button className="btn join-item" onClick={handleSearch}>
                                    <HiMagnifyingGlass className="w-5 h-5" />
                                </button>
                                {searchQuery && (
                                    <button className="btn join-item" onClick={handleReset}>
                                        <HiXMark className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="page-section__body">
                    <div className="space-y-4">
                        {vehicles.length > 0 ? (
                            vehicles.map((vehicle) => (
                                <div 
                                    key={vehicle.id} 
                                    className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex gap-4 mb-4">
                                                {vehicle.photos.map((photo, index) => (
                                                    <img
                                                        key={index}
                                                        src={photo}
                                                        alt={`${vehicle.title} - ${index + 1}`}
                                                        className="object-cover w-32 h-24 rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                            <h4 className="mb-2 text-lg font-semibold">
                                                {vehicle.title}
                                            </h4>
                                            {vehicle.description && (
                                                <p className="mb-2 text-gray-600">
                                                    {vehicle.description}
                                                </p>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                <p>Kategori: {vehicleCategories[vehicle.category]}</p>
                                                <p>Jumlah Unit: {vehicle.unit} unit</p>
                                                <p className="font-semibold text-primary">
                                                    Rp {Number(vehicle.price_per_day).toLocaleString('id-ID')}/hari
                                                </p>
                                                <div className="mt-2">
                                                    <p className="font-semibold">Atribut:</p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {vehicle.selected_attributes.map((attrId) => (
                                                            <span 
                                                                key={attrId}
                                                                className="px-2 py-1 text-xs rounded-full bg-primary/10"
                                                            >
                                                                {vehicleAttributes[attrId]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-2">Dibuat pada: {new Date(vehicle.created_at).toLocaleDateString()}</p>
                                                <p>Perusahaan/Pemilik: {vehicle.content.name}</p>
                                                {can.view_all_content && (
                                                    <>
                                                        <p>Dibuat oleh: {vehicle.user.name}</p>
                                                        <p>Email: {vehicle.user.email}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {(can.view_all_content || vehicle.user.id === auth.user.id) && (
                                                <>
                                                    <Link
                                                        href={route('dashboard.kendaraan.edit', vehicle.id)}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        <HiOutlinePencilSquare />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(vehicle.id)}
                                                        className="btn btn-sm btn-error"
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-4 text-center text-gray-500">
                                Belum ada kendaraan yang tersedia.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
