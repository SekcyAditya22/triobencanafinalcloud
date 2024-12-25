import React from "react";
import { Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { HiOutlinePencilSquare, HiOutlineTrash } from "react-icons/hi2";

export default function Edit({ attribute, categories }) {
    const { data, setData, put, errors, processing } = useForm({
        name: attribute.name,
        type: attribute.type,
        description: attribute.description,
        required: attribute.required,
        options: attribute.options || [],
        vehicle_category_id: attribute.vehicle_category_id,
    });

    const [newOption, setNewOption] = React.useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("dashboard.vehicle-attributes.update", attribute.id));
    };

    const addOption = () => {
        if (newOption.trim()) {
            setData("options", [...data.options, newOption.trim()]);
            setNewOption("");
        }
    };

    const removeOption = (index) => {
        setData(
            "options",
            data.options.filter((_, i) => i !== index)
        );
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Edit Atribut Kendaraan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>Dashboard</Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.vehicle-attributes.index")}>
                                    Atribut Kendaraan
                                </Link>
                            </li>
                            <li>Edit</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="card bg-base-100">
                <div className="card-body">
                    <h2 className="card-title">Edit Atribut</h2>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="w-full form-control">
                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Nama</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="w-full input input-bordered"
                                    onChange={(e) => setData("name", e.target.value)}
                                />
                                {errors.name && (
                                    <div className="mt-1 text-sm text-error">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Kategori</span>
                                </label>
                                <select
                                    name="vehicle_category_id"
                                    value={data.vehicle_category_id}
                                    className="w-full select select-bordered"
                                    onChange={(e) =>
                                        setData("vehicle_category_id", e.target.value)
                                    }
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle_category_id && (
                                    <div className="mt-1 text-sm text-error">
                                        {errors.vehicle_category_id}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Tipe</span>
                                </label>
                                <select
                                    name="type"
                                    value={data.type}
                                    className="w-full select select-bordered"
                                    onChange={(e) => setData("type", e.target.value)}
                                >
                                    <option value="">Pilih Tipe</option>
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="select">Select</option>
                                    <option value="boolean">Yes/No</option>
                                </select>
                                {errors.type && (
                                    <div className="mt-1 text-sm text-error">
                                        {errors.type}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="justify-start gap-4 cursor-pointer label">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={data.required}
                                        onChange={(e) =>
                                            setData("required", e.target.checked)
                                        }
                                    />
                                    <span className="label-text">Wajib Diisi</span>
                                </label>
                            </div>

                            {data.type === "select" && (
                                <div className="mb-4">
                                    <label className="label">
                                        <span className="label-text">Pilihan</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 input input-bordered"
                                            value={newOption}
                                            onChange={(e) => setNewOption(e.target.value)}
                                            placeholder="Tambah pilihan baru"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={addOption}
                                        >
                                            Tambah
                                        </button>
                                    </div>
                                    <div className="mt-2">
                                        {data.options.map((option, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 mt-1"
                                            >
                                                <span className="flex-1">{option}</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-xs text-error"
                                                    onClick={() => removeOption(index)}
                                                >
                                                    <HiOutlineTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.options && (
                                        <div className="mt-1 text-sm text-error">
                                            {errors.options}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="label">
                                    <span className="label-text">Deskripsi</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={data.description}
                                    className="w-full textarea textarea-bordered"
                                    onChange={(e) => setData("description", e.target.value)}
                                />
                                {errors.description && (
                                    <div className="mt-1 text-sm text-error">
                                        {errors.description}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link
                                    href={route("dashboard.vehicle-attributes.index")}
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