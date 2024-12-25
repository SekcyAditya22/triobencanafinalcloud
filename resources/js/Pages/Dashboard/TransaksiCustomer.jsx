import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';
import { HiOutlineClipboardList, HiOutlineCalendar, HiOutlineCash, HiOutlineUser } from 'react-icons/hi';

const TransaksiCustomer = ({ transactions, userRole, debug }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async (transactionId) => {
        if (!confirm('Apakah Anda yakin ingin menyetujui transaksi ini?')) return;
        
        setIsLoading(true);
        try {
            await router.post(route('dashboard.transactions.approve', transactionId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Transaksi berhasil disetujui');
                    setIsLoading(false);
                },
                onError: () => {
                    toast.error('Gagal menyetujui transaksi');
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Terjadi kesalahan');
            setIsLoading(false);
        }
    };

    const handleReject = async (transactionId) => {
        if (!confirm('Apakah Anda yakin ingin menolak transaksi ini?')) return;
        
        setIsLoading(true);
        try {
            await router.post(route('dashboard.transactions.reject', transactionId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Transaksi berhasil ditolak');
                    setIsLoading(false);
                },
                onError: () => {
                    toast.error('Gagal menolak transaksi');
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Terjadi kesalahan');
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const getStatusBadgeClass = (status, type = 'approval') => {
        const baseClasses = "px-3 py-1 text-xs font-medium rounded-full";
        
        if (type === 'approval') {
            switch (status) {
                case 'pending':
                    return `${baseClasses} bg-yellow-100 text-yellow-800`;
                case 'approved':
                    return `${baseClasses} bg-green-100 text-green-800`;
                case 'rejected':
                    return `${baseClasses} bg-red-100 text-red-800`;
                default:
                    return `${baseClasses} bg-gray-100 text-gray-800`;
            }
        } else {
            switch (status) {
                case 'pending':
                    return `${baseClasses} bg-blue-100 text-blue-800`;
                case 'paid':
                    return `${baseClasses} bg-green-100 text-green-800`;
                case 'failed':
                    return `${baseClasses} bg-red-100 text-red-800`;
                default:
                    return `${baseClasses} bg-gray-100 text-gray-800`;
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 bg-[#1e1e2d]">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="mb-2 text-2xl font-bold text-white">Transaksi Customer</h1>
                    <p className="text-gray-400">Kelola transaksi penyewaan kendaraan</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                    <div className="bg-[#2B2B40] rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Total Transaksi</p>
                                <p className="text-2xl font-bold">{transactions?.length || 0}</p>
                            </div>
                            <HiOutlineClipboardList className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>
                    {/* Add more stat cards as needed */}
                </div>

                {/* Transactions Table */}
                <div className="bg-[#2B2B40] rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#323248]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Kendaraan
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Tanggal Sewa
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {transactions?.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-[#323248] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10">
                                                    <div className="flex items-center justify-center w-10 h-10 bg-gray-600 rounded-full">
                                                        <HiOutlineUser className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">
                                                        {transaction.user?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {transaction.user?.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {transaction.details?.map((detail) => (
                                                <div key={detail.id} className="mb-2">
                                                    <div className="text-sm font-medium text-white">
                                                        {detail.kendaraan?.title}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {detail.quantity} unit × {formatCurrency(detail.price_per_day)}/hari
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">
                                                {formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white">
                                                {formatCurrency(transaction.total_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                <span className={getStatusBadgeClass(transaction.approval_status, 'approval')}>
                                                    {transaction.approval_status === 'pending' ? 'Menunggu Persetujuan' :
                                                     transaction.approval_status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                </span>
                                                <span className={getStatusBadgeClass(transaction.payment_status, 'payment')}>
                                                    {transaction.payment_status === 'pending' ? 'Belum Dibayar' :
                                                     transaction.payment_status === 'paid' ? 'Sudah Dibayar' : 'Gagal'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            {transaction.approval_status === 'pending' && !isLoading && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(transaction.id)}
                                                        className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                                                        disabled={isLoading}
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(transaction.id)}
                                                        className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                                                        disabled={isLoading}
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                            {isLoading && (
                                                <span className="text-gray-400">Memproses...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {!transactions || transactions.length === 0 && (
                    <div className="text-center py-8 bg-[#2B2B40] rounded-lg">
                        <p className="text-gray-400">Belum ada transaksi</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TransaksiCustomer; 