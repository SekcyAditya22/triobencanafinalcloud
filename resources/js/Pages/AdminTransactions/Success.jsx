import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link } from "@inertiajs/react";
import React from "react";
import { FiCheckCircle } from "react-icons/fi";

export default function Success({ transaction_id }) {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <FiCheckCircle className="w-20 h-20 mx-auto text-success" />
                    <h1 className="mt-4 text-2xl font-bold">Pembayaran Berhasil!</h1>
                    <p className="mt-2 text-gray-600">
                        Transaksi Anda telah berhasil diproses.
                    </p>
                    <div className="mt-6">
                        <Link
                            href={route("dashboard.admin-transactions")}
                            className="btn btn-primary"
                        >
                            Kembali ke Daftar Transaksi
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
