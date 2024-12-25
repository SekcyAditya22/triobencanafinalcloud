import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import PageSection from "@/Components/atoms/PageSection";
import { BiSave } from "react-icons/bi";
import { toast } from "sonner";

export default function KendaraanCreate({ auth, vehicleCategories, vehicleAttributes, contents }) {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        vehicle_category_id: "",
        content_id: "",
        unit: 1,
        price_per_day: "",
        photos: [],
        selected_attributes: [],
    });

    const [photoPreview, setPhotoPreview] = useState([]);

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('Maksimal 3 foto');
            return;
        }

        setData('photos', files);

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPhotoPreview(previews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        // Tambahkan semua field ke FormData
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('content_id', data.content_id);
        formData.append('vehicle_category_id', data.vehicle_category_id);
        formData.append('unit', data.unit);
        formData.append('price_per_day', data.price_per_day);
        
        // Tambahkan selected_attributes sebagai array
        data.selected_attributes.forEach((attr, index) => {
            formData.append(`selected_attributes[${index}]`, attr);
        });

        // Tambahkan foto-foto
        if (data.photos.length > 0) {
            data.photos.forEach(photo => {
                formData.append('photos[]', photo);
            });
        }

        post(route("dashboard.kendaraan.store"), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Kendaraan berhasil ditambahkan");
            },
        });
    };

    const handleAttributeChange = (attributeId) => {
        const currentAttributes = [...data.selected_attributes];
        const index = currentAttributes.indexOf(attributeId);
        
        if (index === -1) {
            currentAttributes.push(attributeId);
        } else {
            currentAttributes.splice(index, 1);
        }
        
        setData("selected_attributes", currentAttributes);
    };

    // Mengelompokkan atribut berdasarkan kategori
    const attributesByCategory = vehicleAttributes.reduce((acc, attr) => {
        if (!acc[attr.category]) {
            acc[attr.category] = [];
        }
        acc[attr.category].push(attr);
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <div>
                <h1 className="page-title mb-2">Tambah Kendaraan Baru</h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href={route("dashboard.index")}>Dashboard</Link></li>
                        <li><Link href={route("dashboard.kendaraan.index")}>Kendaraan</Link></li>
                        <li>Tambah Baru</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <PageSection 
                    title="Informasi Dasar"
                    header={
                        <div className="flex gap-2">
                            <Link
                                href={route("dashboard.kendaraan.index")}
                                className="btn btn-ghost btn-sm"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-success btn-sm"
                                disabled={processing}
                            >
                                <BiSave />
                                Simpan
                            </button>
                        </div>
                    }
                >
                    <div className="max-w-xl space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Judul</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                            />
                            {errors.title && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.title}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Deskripsi</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                            />
                            {errors.description && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.description}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Pilih Perusahaan/Pemilik</span>
                            </label>
                            <select
                                className="select select-bordered"
                                value={data.content_id}
                                onChange={(e) => setData("content_id", e.target.value)}
                            >
                                <option value="">Pilih Perusahaan/Pemilik</option>
                                {contents.map((content) => (
                                    <option key={content.id} value={content.id}>
                                        {content.title}
                                    </option>
                                ))}
                            </select>
                            {errors.content_id && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.content_id}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Kategori Kendaraan</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {vehicleCategories.map((category) => (
                                    <label 
                                        key={category.id} 
                                        className={`flex items-center gap-2 p-4 border rounded-lg cursor-pointer ${
                                            data.vehicle_category_id === category.id 
                                            ? 'border-primary bg-primary/10' 
                                            : 'border-base-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="vehicle_category_id"
                                            value={category.id}
                                            checked={data.vehicle_category_id === category.id}
                                            onChange={(e) => setData("vehicle_category_id", e.target.value)}
                                            className="radio radio-primary"
                                        />
                                        <span>{category.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.vehicle_category_id && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.vehicle_category_id}
                                    </span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Jumlah Unit</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    className="input input-bordered w-32"
                                    value={data.unit}
                                    onChange={(e) => setData("unit", e.target.value)}
                                />
                                <span className="text-gray-500">unit</span>
                            </div>
                            {errors.unit && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.unit}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Harga Per Hari</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    className="input input-bordered"
                                    value={data.price_per_day}
                                    onChange={(e) => setData("price_per_day", e.target.value)}
                                />
                                <span className="text-gray-500">/hari</span>
                            </div>
                            {errors.price_per_day && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.price_per_day}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Foto Kendaraan (Maksimal 3 foto)</span>
                            </label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="file-input file-input-bordered"
                            />
                            {errors.photos && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.photos}</span>
                                </label>
                            )}
                            {photoPreview.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    {photoPreview.map((url, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </PageSection>

                {data.vehicle_category_id && (
                    <PageSection title="Atribut Kendaraan">
                        <div className="grid grid-cols-2 gap-10">
                            {Object.entries(attributesByCategory).map(([category, attributes]) => (
                                <div key={category} className="space-y-4">
                                    <p className="font-bold pb-2 border-b border-base-200">
                                        {category}
                                    </p>
                                    <div className="space-y-4 pt-3">
                                        {attributes.map((attribute) => (
                                            <label 
                                                key={attribute.id}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.selected_attributes.includes(attribute.id)}
                                                    onChange={() => handleAttributeChange(attribute.id)}
                                                    className="checkbox checkbox-primary"
                                                />
                                                <span>{attribute.name}</span>
                                                {attribute.required && (
                                                    <span className="text-error">*</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PageSection>
                )}

                {errors.error && (
                    <div className="alert alert-error">
                        <span>{errors.error}</span>
                    </div>
                )}
            </form>
        </DashboardLayout>
    );
}
