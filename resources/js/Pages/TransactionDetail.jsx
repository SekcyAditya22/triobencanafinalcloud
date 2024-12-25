import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import axios from 'axios';
import { router } from '@inertiajs/react';
import { toast } from 'react-hot-toast';

const TransactionDetail = ({ auth, transaction }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Load Midtrans Snap
        const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const myMidtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY;

        let scriptTag = document.createElement('script');
        scriptTag.src = midtransScriptUrl;
        scriptTag.setAttribute('data-client-key', myMidtransClientKey);

        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            paid: 'bg-blue-100 text-blue-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            let snapToken = transaction.snap_token;
            
            // Jika tidak ada snap token, minta yang baru
            if (!snapToken) {
                const response = await axios.post(`/transactions/${transaction.id}/pay`);
                if (!response.data.success || !response.data.snap_token) {
                    throw new Error(response.data.message || 'Gagal mendapatkan token pembayaran');
                }
                snapToken = response.data.snap_token;
            }
            
            // Pastikan window.snap sudah dimuat
            if (typeof window.snap === 'undefined') {
                throw new Error('Midtrans Snap belum dimuat');
            }

            window.snap.pay(snapToken, {
                onSuccess: function(result) {
                    console.log('Payment success:', result);
                    window.location.href = route('transaction.payment.success', transaction.id);
                },
                onPending: function(result) {
                    console.log('Payment pending:', result);
                    window.location.reload();
                },
                onError: function(result) {
                    console.error('Payment error:', result);
                    toast.error('Pembayaran gagal, silakan coba lagi');
                },
                onClose: function() {
                    console.log('Payment popup closed');
                    window.location.reload();
                }
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || error.message || 'Gagal memproses pembayaran');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <h1 className="mb-8 text-2xl font-bold">Detail Transaksi</h1>
                    
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Transaction Details */}
                        <div className="lg:col-span-2">
                            <div className="p-6 bg-white rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold">Detail Pesanan</h3>
                                {transaction.details.map((detail) => (
                                    <div key={detail.id} className="flex gap-4 pb-4 mb-4 border-b">
                                        <img 
                                            src={(() => {
                                                try {
                                                    const photos = detail.kendaraan.photos;
                                                    if (!photos) return '/assets/default-vehicle.jpg';
                                                    return typeof photos === 'string' 
                                                        ? `/storage/${JSON.parse(photos)[0]}`
                                                        : `/storage/${photos[0]}`;
                                                } catch (e) {
                                                    return '/assets/default-vehicle.jpg';
                                                }
                                            })()}
                                            alt={detail.kendaraan.title}
                                            className="object-cover w-24 h-24 rounded-lg"
                                        />
                                        <div>
                                            <h4 className="font-semibold">{detail.kendaraan.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {detail.quantity} unit × Rp {detail.price_per_day?.toLocaleString('id-ID')}/hari
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4">
                                    <div className="flex justify-between mb-2">
                                        <span>Tanggal Sewa</span>
                                        <span>
                                            {new Date(transaction.start_date).toLocaleDateString('id-ID')} - 
                                            {new Date(transaction.end_date).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status and Payment */}
                        <div className="lg:col-span-1">
                            <div className="p-6 bg-white rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold">Status Transaksi</h3>
                                
                                <div className="p-4 mb-4 rounded-lg bg-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <span>Status Persetujuan</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.approval_status)}`}>
                                            {transaction.approval_status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Status Pembayaran</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.payment_status)}`}>
                                            {transaction.payment_status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 mb-4 rounded-lg bg-gray-50">
                                    <div className="flex justify-between mb-2">
                                        <span>Total Pembayaran</span>
                                        <span className="font-semibold">
                                            Rp {transaction.total_amount?.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                {transaction.approval_status === 'approved' && transaction.payment_status === 'pending' && (
                                    <button 
                                        onClick={handlePayment}
                                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footergabungan />
        </>
    );
};

export default TransactionDetail; 