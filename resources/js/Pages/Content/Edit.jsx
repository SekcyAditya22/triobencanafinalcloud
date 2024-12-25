import DashboardLayout from "@/Layouts/DashboardLayout";
import { useForm, Link } from "@inertiajs/react";
import FormInput from "@/Components/atoms/FormInput";
import FormSelect from "@/Components/atoms/FormSelect";
import { FiSave, FiMapPin, FiImage } from "react-icons/fi";
import { getRegencies, getDistricts } from "@/services/region.services";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function Edit({ auth, content }) {
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);

    useEffect(() => {
        getRegencies(34).then(res => setRegencies(res.data));
        
        if (content.regency_id) {
            getDistricts(content.regency_id).then(res => setDistricts(res.data));
        }
    }, []);

    const { data, setData, put, processing, errors } = useForm({
        title: content.title,
        description: content.description || '',
        content: content.content,
        status: content.status,
        province: content.province || 'DI Yogyakarta',
        regency_id: content.regency_id || '',
        district_id: content.district_id || '',
        address: content.address || '',
        latitude: content.latitude || '',
        longitude: content.longitude || '',
        images: [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('dashboard.content.update', content.id));
    };

    const handleRegencyChange = (e) => {
        const regencyId = e.target.value;
        setData({
            ...data,
            regency_id: regencyId,
            district_id: ''
        });
        
        if (regencyId) {
            getDistricts(regencyId).then(res => setDistricts(res.data));
        }
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation tidak didukung oleh browser Anda');
            return;
        }

        const options = {
            enableHighAccuracy: true,  // Gunakan GPS untuk akurasi tinggi
            timeout: 5000,            // Timeout setelah 5 detik
            maximumAge: 0             // Selalu minta posisi terbaru
        };

        const success = (position) => {
            setData({
                ...data,
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString()
            });
        };

        const error = (err) => {
            switch(err.code) {
                case err.PERMISSION_DENIED:
                    alert("Izin akses lokasi ditolak. Mohon izinkan akses lokasi di browser Anda.");
                    break;
                case err.POSITION_UNAVAILABLE:
                    alert("Informasi lokasi tidak tersedia.");
                    break;
                case err.TIMEOUT:
                    alert("Waktu permintaan lokasi habis.");
                    break;
                default:
                    alert("Terjadi kesalahan: " + err.message);
            }
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length > 2) {
            toast.error('Maksimal 2 gambar yang dapat diunggah');
            return;
        }
        
        setData('images', files);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Edit Konten</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.content.index")}>
                                    Semua Konten
                                </Link>
                            </li>
                            <li>Edit Konten</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="page-section">
                <div className="page-section__header">
                    <h3 className="page-section__title">Form Edit Konten</h3>
                </div>
                <div className="page-section__body">
                    <form onSubmit={submit} className="custom-form">
                        <FormInput
                            label="Judul"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            error={errors.title}
                        />

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Deskripsi</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="h-24 textarea textarea-bordered"
                                placeholder="Deskripsi konten"
                            />
                            {errors.description && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.description}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Konten</span>
                            </label>
                            <textarea
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="h-32 textarea textarea-bordered"
                                placeholder="Isi konten"
                                required
                            />
                            {errors.content && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.content}</span>
                                </label>
                            )}
                        </div>

                        <FormSelect
                            label="Status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            error={errors.status}
                            options={[
                                { value: 'draft', label: 'Draft' },
                                { value: 'published', label: 'Published' },
                                { value: 'archived', label: 'Archived' }
                            ]}
                        />

                        <FormSelect
                            label="Provinsi"
                            value={data.province}
                            onChange={(e) => setData('province', e.target.value)}
                            error={errors.province}
                            options={[
                                { value: 'DI Yogyakarta', label: 'DI Yogyakarta' }
                            ]}
                        />

                        <FormSelect
                            label="Kabupaten/Kota"
                            value={data.regency_id}
                            onChange={handleRegencyChange}
                            error={errors.regency_id}
                            options={[
                                { value: '', label: 'Pilih Kabupaten/Kota' },
                                ...regencies.map(regency => ({
                                    value: regency.id,
                                    label: regency.name
                                }))
                            ]}
                        />

                        <FormSelect
                            label="Kecamatan"
                            value={data.district_id}
                            onChange={(e) => setData('district_id', e.target.value)}
                            error={errors.district_id}
                            options={[
                                { value: '', label: 'Pilih Kecamatan' },
                                ...districts.map(district => ({
                                    value: district.id,
                                    label: district.name
                                }))
                            ]}
                            disabled={!data.regency_id}
                        />

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Alamat Lengkap</span>
                            </label>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="h-24 textarea textarea-bordered"
                                placeholder="Masukkan alamat lengkap"
                            />
                            {errors.address && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.address}</span>
                                </label>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Latitude"
                                type="text"
                                value={data.latitude}
                                onChange={(e) => setData('latitude', e.target.value)}
                                error={errors.latitude}
                                placeholder="Contoh: -7.795580"
                            />
                            <FormInput
                                label="Longitude"
                                type="text"
                                value={data.longitude}
                                onChange={(e) => setData('longitude', e.target.value)}
                                error={errors.longitude}
                                placeholder="Contoh: 110.369490"
                            />
                        </div>

                        <button 
                            type="button" 
                            className="btn btn-secondary btn-sm mb-4"
                            onClick={getCurrentLocation}
                        >
                            <FiMapPin className="w-4 h-4 mr-2" />
                            Gunakan Lokasi Saat Ini
                        </button>

                        <div className="space-y-4">
                            {content.images && content.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {content.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img 
                                                src={image.url} 
                                                alt={`Gambar ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Ganti Gambar (Maksimal 2)</span>
                                </label>
                                <input
                                    type="file"
                                    className="file-input file-input-bordered w-full"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                {errors.images && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.images}</span>
                                    </label>
                                )}
                                <div className="text-sm text-gray-500 mt-1">
                                    <FiImage className="inline mr-1" />
                                    Maksimal 2 gambar
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            <FiSave />
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 