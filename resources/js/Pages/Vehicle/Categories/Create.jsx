import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "sonner";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("dashboard.vehicle-categories.store"), {
            onSuccess: () => {
                toast.success("Kategori berhasil ditambahkan");
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Tambah Kategori" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Tambah Kategori</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.vehicle-categories.index")}>
                                    Kategori Kendaraan
                                </Link>
                            </li>
                            <li>Tambah Kategori</li>
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
                                    <span className="label-text">Nama Kategori</span>
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
                                    <span className="label-text">Deskripsi</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    rows="4"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                {errors.description && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.description}
                                    </div>
                                )}
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
                                    href={route("dashboard.vehicle-categories.index")}
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