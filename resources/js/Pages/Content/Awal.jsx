import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { HiOutlinePencilSquare, HiOutlineTrash, HiMagnifyingGlass, HiXMark } from "react-icons/hi2";
import { getAllQueryParams } from "@/utils";
import { FiMapPin } from "react-icons/fi";
import { toast } from "sonner";

export default function Dashboard({ auth, contents = [], can, filters }) {
    const page = usePage().props;
    const queryParams = getAllQueryParams();
    const [filteredContents, setFilteredContents] = useState([]);
    const [searchQuery, setSearchQuery] = useState(page.filters?.search || '');
    const [regencyData, setRegencyData] = useState({});
    const [districtData, setDistrictData] = useState({});

    useEffect(() => {
        const filterContent = () => {
            if (!contents) return [];
            
            if (can.view_all_content) {
                return contents;
            }
            
            return contents.filter(content => 
                content.user_id === auth.user.id
            );
        };

        setFilteredContents(filterContent());
    }, [contents, auth.user, can]);

    useEffect(() => {
        const loadLocationData = async () => {
            const uniqueRegencyIds = [...new Set(contents.map(c => c.regency_id))];
            const uniqueDistrictIds = [...new Set(contents.map(c => c.district_id))];
            
            // Load semua data regency yang dibutuhkan
            const regencyPromises = uniqueRegencyIds.map(id => 
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regency/${id}.json`)
                    .then(res => res.json())
            );
            
            // Load semua data district yang dibutuhkan
            const districtPromises = uniqueDistrictIds.map(id => 
                fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/district/${id}.json`)
                    .then(res => res.json())
            );
            
            const regencies = await Promise.all(regencyPromises);
            const districts = await Promise.all(districtPromises);
            
            // Simpan dalam state
            setRegencyData(Object.fromEntries(
                regencies.map(r => [r.id, r])
            ));
            setDistrictData(Object.fromEntries(
                districts.map(d => [d.id, d])
            ));
        };
        
        loadLocationData();
    }, []);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
            router.delete(route('dashboard.content.destroy', id));
        }
    };

    const handleSearch = () => {
        router.get(route("dashboard.content.index"), {
            ...queryParams,
            search: searchQuery,
        });
    };

    const handleReset = () => {
        setSearchQuery('');
        router.get(route("dashboard.content.index"));
    };

    const handleAddContent = () => {
        // Jika super-admin, langsung ke halaman create
        if (can.view_all_content) {
            router.get(route("dashboard.content.create"));
            return;
        }

        // Cek apakah ada transaksi yang valid
        router.get(route("dashboard.content.create"), {
            create: true  // Tambahkan parameter create=true
        });
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Semua Konten</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>Semua Konten</li>
                        </ul>
                    </div>
                </div>
                <div>
                    {can.create_content && (
                        <button
                            onClick={handleAddContent}
                            className="btn btn-primary btn-outline btn-sm"
                        >
                            Tambah Konten Baru
                        </button>
                    )}
                </div>
            </div>

            <div className="page-section">
                <div className="page-section__header">
                    <div className="flex items-center justify-between">
                        <h3 className="page-section__title">Daftar Konten</h3>
                        <div className="flex items-center gap-4">
                            <div className="join">
                                <div className="relative join-item">
                                    <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-gray-500 pointer-events-none">
                                        <HiMagnifyingGlass className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cari konten..."
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
                                <button 
                                    className="btn join-item"
                                    onClick={handleSearch}
                                >
                                    <HiMagnifyingGlass className="w-5 h-5" />
                                </button>
                                {searchQuery && (
                                    <button 
                                        className="btn join-item"
                                        onClick={handleReset}
                                    >
                                        <HiXMark className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="page-section__body">
                    <div className="space-y-4">
                        {filteredContents.length > 0 ? (
                            filteredContents.map((content) => (
                                <div 
                                    key={content.id} 
                                    className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="mb-2 text-lg font-semibold">
                                                {content.title}
                                            </h4>
                                            {content.description && (
                                                <p className="mb-2 text-gray-600">
                                                    {content.description}
                                                </p>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                <p>Status: {content.status}</p>
                                                <p>Dibuat pada: {new Date(content.created_at).toLocaleDateString()}</p>
                                                {can.view_all_content && (
                                                    <p>Dibuat oleh: {content.user.name}</p>
                                                )}
                                                <div className="mt-2 space-y-1">
                                                    <p>Provinsi: {content.province}</p>
                                                    <p>Kabupaten/Kota: {content.regency?.name || content.regency_id}</p>
                                                    <p>Kecamatan: {content.district?.name || content.district_id}</p>
                                                    {content.address && (
                                                        <div className="mt-1">
                                                            <span className="font-medium text-gray-600">Alamat Lengkap:</span>
                                                            <p className="mt-1 text-gray-600 whitespace-pre-wrap">{content.address}</p>
                                                        </div>
                                                    )}
                                                    {(content.latitude && content.longitude) && (
                                                        <div className="mt-2">
                                                            <a
                                                                href={`https://www.google.com/maps?q=${content.latitude},${content.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
                                                            >
                                                                <FiMapPin className="w-4 h-4 mr-1" />
                                                                Lihat di Google Maps
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('dashboard.content.show', content.id)}
                                                className="btn btn-sm btn-info"
                                            >
                                                <HiMagnifyingGlass />
                                            </Link>
                                            <Link
                                                href={route('dashboard.content.edit', content.id)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                <HiOutlinePencilSquare />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(content.id)}
                                                className="btn btn-sm btn-error"
                                            >
                                                <HiOutlineTrash />
                                            </button>
                                        </div>
                                    </div>
                                    {content.images && content.images.length > 0 && (
                                        <div className="flex gap-2 mt-2 mb-4">
                                            {content.images.map((image, index) => (
                                                <img 
                                                    key={index}
                                                    src={image.url} 
                                                    alt={`Thumbnail ${index + 1}`}
                                                    className="object-cover w-20 h-20 rounded-lg shadow-sm"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="py-4 text-center text-gray-500">
                                Belum ada konten yang tersedia.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
