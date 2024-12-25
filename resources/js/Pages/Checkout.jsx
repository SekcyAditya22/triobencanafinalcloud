import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import axios from 'axios';
import { HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import FloatingChat from '@/Components/FloatingChat';

const Checkout = ({ auth, cart, rental_details, transaction }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const defaultRentalDetails = {
        start_date: new Date(),
        end_date: new Date(),
        total_days: 0,
        total_amount: 0
    };

    const rentalData = rental_details || defaultRentalDetails;

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const response = await axios.post(route('cart.process-checkout'), {
                items: cart,
                start_date: rentalData.start_date,
                end_date: rentalData.end_date,
                total_amount: rentalData.total_amount
            });

            if (response.data.success) {
                window.location.href = route('transaction.success', response.data.transaction_id);
            } else {
                alert('Gagal melakukan checkout');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Gagal melakukan checkout');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelTransaction = async () => {
        if (!confirm('Apakah Anda yakin ingin membatalkan transaksi ini?')) return;

        setIsLoading(true);
        try {
            const response = await axios.delete(route('transaction.cancel', transaction.id));
            
            if (response.data.success) {
                toast.success('Transaksi berhasil dibatalkan');
                // Trigger event untuk update counter
                window.dispatchEvent(new Event('transaction-updated'));
                // Redirect ke halaman checkout landing
                router.visit(route('cart.checkout-landing'));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Gagal membatalkan transaksi');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID');
        } catch (e) {
            return '-';
        }
    };

    const formatNumber = (number) => {
        try {
            return Number(number).toLocaleString('id-ID');
        } catch (e) {
            return '0';
        }
    };

    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('cart.checkout-landing')}
                                className="flex items-center text-gray-600 transition-colors hover:text-gray-800"
                            >
                                <HiOutlineArrowLeft className="w-6 h-6 mr-2" />
                                <span>Kembali</span>
                            </Link>
                            <h1 className="text-2xl font-bold">Konfirmasi Pesanan</h1>
                        </div>
                        
                        {transaction && (
                            <button
                                onClick={handleCancelTransaction}
                                disabled={isLoading || transaction.approval_status !== 'pending'}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${transaction.approval_status === 'pending' 
                                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                <HiOutlineTrash className="w-5 h-5 mr-2" />
                                {isLoading ? 'Membatalkan...' : 'Batalkan Transaksi'}
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Order Details */}
                        <div className="lg:col-span-2">
                            <div className="p-6 bg-white rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold">Detail Penyewa</h3>
                                <div className="mb-6">
                                    <p className="text-gray-600">Nama: {auth.user?.name || '-'}</p>
                                    <p className="text-gray-600">Email: {auth.user?.email || '-'}</p>
                                </div>

                                <h3 className="mb-4 text-lg font-semibold">Detail Pesanan</h3>
                                {cart?.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 mb-4 border-b">
                                        <img 
                                            src={(() => {
                                                try {
                                                    const photos = item.kendaraan.photos;
                                                    if (!photos) return '/assets/default-vehicle.jpg';
                                                    return typeof photos === 'string' 
                                                        ? `/storage/${JSON.parse(photos)[0]}`
                                                        : `/storage/${photos[0]}`;
                                                } catch (e) {
                                                    return '/assets/default-vehicle.jpg';
                                                }
                                            })()}
                                            alt={item.kendaraan.title}
                                            className="object-cover w-24 h-24 rounded-lg"
                                        />
                                        <div>
                                            <h4 className="font-semibold">{item.kendaraan.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} unit x Rp {item.kendaraan.price_per_day?.toLocaleString('id-ID')}/hari
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span>Tanggal Sewa</span>
                                        <span>
                                            {formatDate(rentalData.start_date)} - {formatDate(rentalData.end_date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Durasi Sewa</span>
                                        <span>{rentalData.total_days} hari</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1">
                            <div className="p-6 bg-white rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold">Status Pesanan</h3>
                                {transaction ? (
                                    <>
                                        <div className={`p-4 mb-4 text-center rounded-lg ${
                                            transaction.approval_status === 'pending' 
                                                ? 'bg-yellow-50 text-yellow-800'
                                                : transaction.approval_status === 'approved'
                                                ? 'bg-green-50 text-green-800'
                                                : 'bg-red-50 text-red-800'
                                        }`}>
                                            <p>
                                                {transaction.approval_status === 'pending' && 'Menunggu Persetujuan Admin'}
                                                {transaction.approval_status === 'approved' && 'Pesanan Disetujui'}
                                                {transaction.approval_status === 'rejected' && 'Pesanan Ditolak'}
                                            </p>
                                            <p className="mt-1 text-sm">
                                                {transaction.approval_status === 'pending' && 'Pembayaran dapat dilakukan setelah pesanan disetujui'}
                                                {transaction.approval_status === 'approved' && 'Silakan lakukan pembayaran'}
                                                {transaction.approval_status === 'rejected' && 'Silakan buat pesanan baru'}
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 mb-4 rounded-lg bg-gray-50">
                                            <div className="flex justify-between mb-2">
                                                <span>Total Pembayaran</span>
                                                <span className="font-semibold">
                                                    Rp {formatNumber(transaction.total_amount)}
                                                </span>
                                            </div>
                                        </div>

                                        {transaction.approval_status === 'pending' && (
                                            <button 
                                                onClick={handleCancelTransaction}
                                                disabled={isLoading}
                                                className="w-full px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-gray-400"
                                            >
                                                {isLoading ? 'Membatalkan...' : 'Batalkan Transaksi'}
                                            </button>
                                        )}

                                        {(transaction?.approval_status === 'approved' || process.env.NODE_ENV === 'development') && (
                                            <button 
                                                onClick={handlePayment}
                                                disabled={isProcessing}
                                                className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                            >
                                                {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    // Tampilan untuk checkout baru
                                    <>
                                        <div className="p-4 mb-4 text-center rounded-lg bg-yellow-50">
                                            <p className="text-yellow-800">Menunggu Persetujuan Admin</p>
                                            <p className="mt-1 text-sm text-yellow-600">
                                                Pembayaran dapat dilakukan setelah pesanan disetujui
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={handlePayment}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {isProcessing ? 'Memproses...' : 'Konfirmasi Pesanan'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footergabungan />
            <FloatingChat auth={auth} />

        </>
    );
};

export default Checkout;
