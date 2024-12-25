import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, router, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import PageSection from "@/Components/atoms/PageSection";
import { BiSave } from "react-icons/bi";
import { HiXMark } from "react-icons/hi2";
import { toast } from "sonner";

export default function KendaraanEdit({ auth, kendaraan, vehicleCategories, vehicleAttributes, contents }) {
    const { data, setData, post, processing, errors } = useForm({
        title: kendaraan.title,
        description: kendaraan.description,
        vehicle_category_id: kendaraan.vehicle_category_id,
        content_id: kendaraan.content_id,
        unit: kendaraan.unit,
        price_per_day: kendaraan.price_per_day,
        photos: [],
        existing_photos: kendaraan.photos || [],
        selected_attributes: kendaraan.selected_attributes,
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

    const removeExistingPhoto = (index) => {
        const updatedPhotos = [...data.existing_photos];
        updatedPhotos.splice(index, 1);
        setData('existing_photos', updatedPhotos);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        formData.append('_method', 'PUT');
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

        // Tambahkan existing_photos yang masih ada
        if (data.existing_photos && data.existing_photos.length > 0) {
            formData.append('existing_photos', JSON.stringify(data.existing_photos));
        } else {
            formData.append('existing_photos', JSON.stringify([]));
        }

        // Tambahkan foto-foto baru jika ada
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach(photo => {
                formData.append('photos[]', photo);
            });
        }

        router.post(route("dashboard.kendaraan.update", kendaraan.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Kendaraan berhasil diperbarui");
            },
        });
    };

    const handleAttributeChange = (attributeId, category) => {
        // Dapatkan atribut yang sudah dipilih dari kategori lain
        const otherCategoryAttributes = data.selected_attributes.filter(id => {
            // Cari atribut dari ID ini
            const attr = vehicleAttributes.find(a => a.id === id);
            // Jika atribut ditemukan dan kategorinya berbeda, simpan
            return attr && attr.category !== category;
        });

        // Jika checkbox dicentang, tambahkan ke array
        const newAttributes = data.selected_attributes.includes(attributeId)
            ? otherCategoryAttributes // Jika sudah ada, hapus (uncheck)
            : [...otherCategoryAttributes, attributeId]; // Jika belum ada, tambahkan

        setData("selected_attributes", newAttributes);
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
                <h1 className="mb-2 page-title">Edit Kendaraan</h1>
                <div className="text-sm breadcrumbs">
                    <ul>
                        <li><Link href={route("dashboard.index")}>Dashboard</Link></li>
                        <li><Link href={route("dashboard.kendaraan.index")}>Kendaraan</Link></li>
                        <li>Edit</li>
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
                                    className="w-32 input input-bordered"
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
                                <span className="label-text">Foto Kendaraan</span>
                            </label>
                            
                            {/* Existing Photos */}
                            {data.existing_photos.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {data.existing_photos.map((photo, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={photo}
                                                alt={`Existing ${index + 1}`}
                                                className="object-cover w-full h-32 rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingPhoto(index)}
                                                className="absolute -top-2 -right-2 btn btn-error btn-circle btn-xs"
                                            >
                                                <HiXMark className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Photos Upload */}
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
                                                className="object-cover w-full h-32 rounded-lg"
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
                                    <p className="pb-2 font-bold border-b border-base-200">
                                        {category}
                                    </p>
                                    <div className="pt-3 space-y-4">
                                        {attributes.map((attribute) => (
                                            <label 
                                                key={attribute.id}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={data.selected_attributes.includes(attribute.id)}
                                                    onChange={() => handleAttributeChange(attribute.id, category)}
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
            </form>
        </DashboardLayout>
    );
}
