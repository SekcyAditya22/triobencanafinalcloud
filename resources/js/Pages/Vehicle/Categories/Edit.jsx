import React from "react";
import { Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";

export default function Edit({ category }) {
    const { data, setData, put, errors, processing } = useForm({
        name: category.name,
        description: category.description,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("dashboard.vehicle-categories.update", category.id));
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Edit Kategori Kendaraan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>Dashboard</Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.vehicle-categories.index")}>
                                    Kategori Kendaraan
                                </Link>
                            </li>
                            <li>Edit</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100">
                <div className="card-body">
                    <h2 className="card-title">Edit Kategori</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-control w-full">
                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Nama</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="input input-bordered w-full"
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                                {errors.name && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Deskripsi</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={data.description}
                                    className="textarea textarea-bordered w-full"
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                                {errors.description && (
                                    <div className="text-error text-sm mt-1">
                                        {errors.description}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link
                                    href={route("dashboard.vehicle-categories.index")}
                                    className="btn btn-ghost"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={processing}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 