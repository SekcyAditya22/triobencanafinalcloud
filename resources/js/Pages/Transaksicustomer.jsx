import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Transaksicustomer = ({ transactions }) => {
    const [isProcessing, setIsProcessing] = useState({});

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

    const handlePayment = async (transactionId) => {
        setIsProcessing(prev => ({ ...prev, [transactionId]: true }));
        try {
            const response = await axios.post(`/transactions/${transactionId}/pay`);
            
            if (response.data.success && response.data.snap_token) {
                window.snap.pay(response.data.snap_token, {
                    onSuccess: function(result) {
                        console.log('Payment success:', result);
                        window.location.href = route('transaction.payment.success', transactionId);
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
            } else {
                toast.error('Gagal memproses pembayaran');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Gagal memproses pembayaran');
        } finally {
            setIsProcessing(prev => ({ ...prev, [transactionId]: false }));
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'paid':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-semibold">Transaksi Customer</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kendaraan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Sewa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Hari
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Pembayaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status Pembayaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status Persetujuan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {transaction.kendaraan.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(transaction.start_date).toLocaleDateString('id-ID')} - 
                                            {new Date(transaction.end_date).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {transaction.total_days} hari
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Rp {transaction.total_amount.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.payment_status)}`}>
                                                {transaction.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.approval_status)}`}>
                                                {transaction.approval_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={route('dashboard.transactions.show', transaction.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Detail
                                                </Link>
                                                {transaction.approval_status === 'approved' && transaction.payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => handlePayment(transaction.id)}
                                                        disabled={isProcessing[transaction.id]}
                                                        className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                                                    >
                                                        {isProcessing[transaction.id] ? 'Memproses...' : 'Bayar'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Transaksicustomer;
