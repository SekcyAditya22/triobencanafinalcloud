import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";

export default function Create({ categories }) {
    const [showOptions, setShowOptions] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        type: "text",
        required: false,
        options: [],
        vehicle_category_id: "",
    });

    const handleTypeChange = (e) => {
        const type = e.target.value;
        setData('type', type);
        setShowOptions(type === 'select');
    };

    const handleOptionsChange = (e) => {
        const options = e.target.value.split(',').map(opt => opt.trim());
        setData('options', options);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("dashboard.vehicle-attributes.store"), {
            onSuccess: () => {
                toast.success("Atribut berhasil ditambahkan");
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Atribut" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Tambah Atribut</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.vehicle-attributes.index")}>
                                    Atribut Kendaraan
                                </Link>
                            </li>
                            <li>Tambah Atribut</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <form onSubmit={submit} className="p-6">
                        <div className="max-w-xl">
                            <div className="mb-5">
                                <label className="label">
                                    <span className="label-text">Kategori Kendaraan</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.vehicle_category_id}
                                    onChange={(e) => setData('vehicle_category_id', e.target.value)}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle_category_id && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.vehicle_category_id}
                                    </div>
                                )}
                            </div>

                            <div className="mb-5">
                                <label className="label">
                                    <span className="label-text">Nama Atribut</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="mb-5">
                                <label className="label">
                                    <span className="label-text">Tipe</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={data.type}
                                    onChange={handleTypeChange}
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Select</option>
                                    <option value="boolean">Yes/No</option>
                                </select>
                                {errors.type && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.type}
                                    </div>
                                )}
                            </div>

                            {showOptions && (
                                <div className="mb-5">
                                    <label className="label">
                                        <span className="label-text">Pilihan (pisahkan dengan koma)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={data.options.join(', ')}
                                        onChange={handleOptionsChange}
                                        placeholder="Contoh: Merah, Hijau, Biru"
                                    />
                                    {errors.options && (
                                        <div className="text-error text-sm mt-1">
                                            {errors.options}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-5">
                                <label className="label cursor-pointer justify-start gap-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={data.required}
                                        onChange={(e) => setData('required', e.target.checked)}
                                    />
                                    <span className="label-text">Wajib Diisi</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    Simpan
                                </button>
                                <Link
                                    href={route("dashboard.vehicle-attributes.index")}
                                    className="btn btn-ghost"
                                >
                                    Batal
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 