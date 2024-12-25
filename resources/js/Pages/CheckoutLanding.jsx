import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { HiOutlineShoppingCart, HiOutlineCalendar, HiOutlineCash, HiOutlineClipboardCheck, HiOutlineTrash } from 'react-icons/hi';
import Navbargabungan from '@/Components/Navbargabungan';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import FloatingChat from '@/Components/FloatingChat';
import Footergabungan from '@/Components/Footergabungan';

const CheckoutLanding = ({ auth, transactions }) => {
    const [loadingStates, setLoadingStates] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return format(new Date(date), 'd MMMM yyyy', { locale: id });
    };

    const handleDelete = async (transactionId) => {
        if (!confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) return;

        setLoadingStates(prev => ({ ...prev, [transactionId]: true }));
        
        try {
            const response = await axios.delete(route('transaction.cancel', transactionId));
            
            if (response.data.success) {
                toast.success('Transaksi berhasil dibatalkan');
                window.dispatchEvent(new Event('transaction-updated'));
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Gagal membatalkan transaksi');
        } finally {
            setLoadingStates(prev => ({ ...prev, [transactionId]: false }));
        }
    };

    // Filter transaksi berdasarkan status
    const pendingTransactions = transactions.filter(t => t.payment_status === 'pending');
    const completedTransactions = transactions.filter(t => t.payment_status === 'paid');
    const justCompletedTransaction = transactions.find(t => 
        t.payment_status === 'paid' && 
        new Date(t.updated_at) > new Date(Date.now() - 5 * 60 * 1000) // 5 menit terakhir
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    {/* Jika tidak ada transaksi sama sekali */}
                    {(!transactions || transactions.length === 0) && (
                        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
                            <div className="flex flex-col items-center justify-center">
                                <HiOutlineShoppingCart className="w-20 h-20 mb-4 text-gray-400" />
                                <h2 className="mb-2 text-2xl font-bold text-gray-800">
                                    Belum Ada Transaksi
                                </h2>
                                <p className="mb-6 text-gray-600">
                                    Anda belum menambahkan kendaraan ke keranjang. Silakan pilih kendaraan terlebih dahulu.
                                </p>
                                <Link
                                    href={route('home')}
                                    className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Pilih Kendaraan
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Transaksi yang Baru Selesai */}
                    {justCompletedTransaction && (
                        <div className="mb-8">
                            <div className="p-4 mb-4 bg-green-100 rounded-lg">
                                <h2 className="mb-2 text-lg font-semibold text-green-800">
                                    🎉 Pembayaran Berhasil!
                                </h2>
                                <p className="text-green-700">
                                    Terima kasih telah melakukan pembayaran. Berikut adalah detail transaksi Anda:
                                </p>
                            </div>
                            
                            <div className="overflow-hidden bg-white rounded-lg shadow-lg">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Detail Transaksi #{justCompletedTransaction.id}</h3>
                                            <p className="text-gray-600">
                                                Tanggal Sewa: {formatDate(justCompletedTransaction.start_date)} - {formatDate(justCompletedTransaction.end_date)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="px-3 py-1 mb-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                                Disetujui
                                            </span>
                                            <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                                Sudah Dibayar
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detail Kendaraan */}
                                    <div className="space-y-4">
                                        {justCompletedTransaction.details.map((detail) => (
                                            <div key={detail.id} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-16 h-16 overflow-hidden bg-gray-200 rounded-lg">
                                                        <img 
                                                            src={(() => {
                                                                try {
                                                                    const photos = detail.kendaraan.photos;
                                                                    return typeof photos === 'string' 
                                                                        ? `/storage/${JSON.parse(photos)[0]}`
                                                                        : `/storage/${photos[0]}`;
                                                                } catch (e) {
                                                                    return '/assets/default-vehicle.jpg';
                                                                }
                                                            })()}
                                                            alt={detail.kendaraan.title}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <h4 className="font-medium">{detail.kendaraan.title}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {detail.quantity} unit × {formatCurrency(detail.price_per_day)}/hari
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 text-lg font-bold">
                                        Total: {formatCurrency(justCompletedTransaction.total_amount)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transaksi yang Menunggu Pembayaran */}
                    {pendingTransactions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-bold text-gray-800">Transaksi yang Menunggu Pembayaran atau Persetujuan</h2>
                            <div className="overflow-hidden bg-white rounded-lg shadow-lg">
                                {pendingTransactions.map((transaction) => (
                                    <div key={transaction.id} className="p-6 border-b last:border-b-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Detail Transaksi #{transaction.id}</h3>
                                                <p className="text-gray-600">
                                                    Tanggal Sewa: {formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                                                    transaction.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    transaction.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.approval_status === 'pending' ? 'Menunggu Persetujuan' :
                                                    transaction.approval_status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    transaction.payment_status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                                    transaction.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.payment_status === 'pending' ? 'Belum Dibayar' :
                                                    transaction.payment_status === 'paid' ? 'Sudah Dibayar' : 'Pembayaran Gagal'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detail Kendaraan */}
                                        <div className="space-y-4">
                                            {transaction.details.slice(0, 1).map((detail) => (
                                                <div key={detail.id} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-16 h-16 overflow-hidden bg-gray-200 rounded-lg">
                                                            <img 
                                                                src={(() => {
                                                                    try {
                                                                        const photos = detail.kendaraan.photos;
                                                                        return typeof photos === 'string' 
                                                                            ? `/storage/${JSON.parse(photos)[0]}`
                                                                            : `/storage/${photos[0]}`;
                                                                    } catch (e) {
                                                                        return '/assets/default-vehicle.jpg';
                                                                    }
                                                                })()}
                                                                alt={detail.kendaraan.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <h4 className="font-medium">{detail.kendaraan.title}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {detail.quantity} unit × {formatCurrency(detail.price_per_day)}/hari
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-lg font-bold">
                                                Total: {formatCurrency(transaction.total_amount)}
                                            </div>
                                            <div className="flex space-x-2">
                                                {transaction.approval_status === 'pending' && (
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        disabled={loadingStates[transaction.id]}
                                                        className="flex items-center px-4 py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                                                    >
                                                        <HiOutlineTrash className="w-5 h-5 mr-2" />
                                                        {loadingStates[transaction.id] ? 'Membatalkan...' : 'Batalkan'}
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('transaction.customer.show', transaction.id)}
                                                    className="flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                                >
                                                    <HiOutlineClipboardCheck className="w-5 h-5 mr-2" />
                                                    {transaction.approval_status === 'approved' ? 'Lihat Detail & Bayar' : 'Lihat Detail'}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Riwayat Transaksi Selesai */}
                    {completedTransactions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-bold text-gray-800">Riwayat Transaksi Selesai</h2>
                            <div className="overflow-hidden bg-white rounded-lg shadow-lg">
                                {completedTransactions.map((transaction) => (
                                    <div key={transaction.id} className="p-6 border-b last:border-b-0">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Detail Transaksi #{transaction.id}</h3>
                                                <p className="text-gray-600">
                                                    Tanggal Sewa: {formatDate(transaction.start_date)} - {formatDate(transaction.end_date)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-3 py-1 mb-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                                    Disetujui
                                                </span>
                                                <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                                                    Sudah Dibayar
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detail Kendaraan */}
                                        <div className="space-y-4">
                                            {transaction.details.map((detail) => (
                                                <div key={detail.id} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="w-16 h-16 overflow-hidden bg-gray-200 rounded-lg">
                                                            <img 
                                                                src={(() => {
                                                                    try {
                                                                        const photos = detail.kendaraan.photos;
                                                                        return typeof photos === 'string' 
                                                                            ? `/storage/${JSON.parse(photos)[0]}`
                                                                            : `/storage/${photos[0]}`;
                                                                    } catch (e) {
                                                                        return '/assets/default-vehicle.jpg';
                                                                    }
                                                                })()}
                                                                alt={detail.kendaraan.title}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <h4 className="font-medium">{detail.kendaraan.title}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {detail.quantity} unit × {formatCurrency(detail.price_per_day)}/hari
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4 text-lg font-bold">
                                            Total: {formatCurrency(transaction.total_amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footergabungan />
            <FloatingChat auth={auth} />

        </div>
    );
};

export default CheckoutLanding; 