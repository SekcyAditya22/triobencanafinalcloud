import FormInput from "@/Components/atoms/FormInput";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, useForm } from "@inertiajs/react";
import React, { useEffect } from "react";
import { FiSave } from "react-icons/fi";

export default function CreateTransaction() {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        amount: 500000,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("dashboard.admin-transactions.store"));
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Ajukan Permohonan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.admin-transactions")}>
                                    Transaksi Admin
                                </Link>
                            </li>
                            <li>Ajukan Permohonan</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="page-section">
                <div className="page-section__header">
                    <h3 className="page-section__title">Form Permohonan</h3>
                </div>
                <div className="page-section__body">
                    <form onSubmit={handleSubmit} className="custom-form">
                        <FormInput
                            label="Judul"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            error={errors.title}
                        />
                        <FormInput
                            label="Deskripsi"
                            type="textarea"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            error={errors.description}
                        />
                        
                        <div className="mb-4 alert alert-info">
                            <p>Biaya permohonan: Rp {new Intl.NumberFormat('id-ID').format(data.amount)}</p>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            <FiSave />
                            {processing ? "Menyimpan..." : "Simpan & Lanjut ke Pembayaran"}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
} 