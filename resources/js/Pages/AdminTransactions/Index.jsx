import DataTable from "@/Components/molecules/DataTable";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { formatDate, getAllQueryParams } from "@/utils";
import { Link, router, usePage } from "@inertiajs/react";
import React, { useEffect } from "react";
import { HiOutlineCheck, HiOutlineXMark, HiOutlineTrash } from "react-icons/hi2";
import { FiCreditCard } from "react-icons/fi";
import axios from "axios";

export default function IndexTransaction() {
    const page = usePage().props;
    const queryParams = getAllQueryParams();
    const { data, ...pagination } = page.transactions || { data: [] };

    const hasApprovedTransaction = data.some(
        transaction => 
            transaction.admin_id === page.auth.user.id && 
            transaction.status === 'approved'
    );

    const hasActiveContent = page.auth.user.contents?.some(
        content => content.status !== 'archived'
    );

    const handleSearch = (search) => {
        router.get(route("dashboard.admin-transactions"), {
            ...queryParams,
            search: search,
        });
    };

    const handleApprove = (id) => {
        const confirmed = confirm("Apakah Anda yakin ingin menyetujui permohonan ini?");
        if (!confirmed) return;

        router.post(route("dashboard.admin-transactions.approve", id));
    };

    const handleReject = (id) => {
        const reason = prompt("Alasan penolakan:");
        if (!reason) return;

        router.post(route("dashboard.admin-transactions.reject", id), {
            rejection_reason: reason
        });
    };

    const handleDelete = (id) => {
        const confirmed = confirm("Apakah Anda yakin ingin menghapus permohonan ini?");
        if (!confirmed) return;

        router.delete(route("dashboard.admin-transactions.destroy", id));
    };

    const handlePayment = (snapToken) => {
        window.snap.pay(snapToken, {
            onSuccess: function(result) {
                console.log('Payment success:', result);
                // Redirect akan ditangani oleh callback finish dari Midtrans
            },
            onPending: function(result) {
                console.log('Payment pending:', result);
                window.location.reload();
            },
            onError: function(result) {
                console.error('Payment error:', result);
                alert('Pembayaran gagal, silakan coba lagi');
            },
            onClose: function() {
                // Jika popup ditutup sebelum pembayaran selesai
                console.log('Payment popup closed');
                window.location.reload();
            }
        });
    };

    useEffect(() => {
        const loadMidtransScript = async () => {
            try {
                const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
                const myMidtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

                let scriptTag = document.createElement('script');
                scriptTag.src = midtransScriptUrl;
                scriptTag.setAttribute('data-client-key', myMidtransClientKey);

                document.body.appendChild(scriptTag);

                return () => {
                    document.body.removeChild(scriptTag);
                };
            } catch (error) {
                console.error('Error loading Midtrans script:', error);
            }
        };

        loadMidtransScript();
    }, []);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">
                        {page.auth.user.roles.some(role => role.name === "super-admin") 
                            ? "Persetujuan Admin" 
                            : "Permohonan Akses"}
                    </h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>Dashboard</Link>
                            </li>
                            <li>Transaksi Admin</li>
                        </ul>
                    </div>
                </div>
                {page.auth.user.roles.some(role => role.name === "admin") && (
                    <div className="flex gap-2">
                        <Link href={route("dashboard.admin-transactions.create")}>
                            <button className="btn btn-primary btn-outline btn-sm">
                                Ajukan Permohonan
                            </button>
                        </Link>
                        
                    
                        
                    </div>
                )}
            </div>

            <DataTable
                title="Daftar Transaksi"
                searchable
                handleSearch={handleSearch}
                columns={[
                    {
                        title: "No",
                        dataIndex: "no",
                        render: (value, index) => index + 1,
                    },
                    {
                        title: "Admin",
                        dataIndex: "admin",
                        render: (_, __, data) => data.admin?.name || 'N/A',
                    },
                    {
                        title: "Judul",
                        dataIndex: "title",
                    },
                    {
                        title: "Status",
                        dataIndex: "status",
                        render: (status) => (
                            <span className={`badge ${
                                status === 'approved' 
                                    ? 'badge-success' 
                                    : status === 'rejected'
                                    ? 'badge-error'
                                    : 'badge-warning'
                            }`}>
                                {status === 'approved' ? 'Disetujui' : 
                                 status === 'rejected' ? 'Ditolak' : 
                                 'Menunggu'}
                            </span>
                        ),
                    },
                    {
                        title: "Tanggal",
                        dataIndex: "created_at",
                        render: (value) => formatDate(value),
                    },
                    {
                        title: "Status Pembayaran",
                        dataIndex: "payment_status",
                        render: (status) => (
                            <span className={`badge ${
                                status === 'paid' 
                                    ? 'badge-success' 
                                    : 'badge-warning'
                            }`}>
                                {status === 'paid' ? 'Dibayar' : 'Belum Dibayar'}
                            </span>
                        ),
                    },
                    {
                        title: "Aksi",
                        dataIndex: "action",
                        render: (_, __, record) => (
                            <div className="flex space-x-2">
                                {record.payment_status === 'unpaid' && (
                                    <button
                                        onClick={() => handlePayment(record.snap_token)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        <FiCreditCard className="w-5 h-5" />
                                        Bayar
                                    </button>
                                )}
                                {page.auth.user.roles.some(role => role.name === "super-admin") && 
                                record.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(record.id)}
                                            className="btn btn-success btn-sm"
                                        >
                                            <HiOutlineCheck className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(record.id)}
                                            className="btn btn-error btn-sm"
                                        >
                                            <HiOutlineXMark className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                
                                {page.auth.user.roles.some(role => role.name === "super-admin") && (
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className="btn btn-error btn-sm"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ),
                    },
                ]}
                dataSource={data || []}
                pagination={pagination}
            />
        </DashboardLayout>
    );
} 