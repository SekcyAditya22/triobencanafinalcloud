import React from 'react';
import { Link } from '@inertiajs/react';
import Navbargabungan from '@/Components/Navbargabungan';
import { HiOutlineCheckCircle } from 'react-icons/hi';

const PaymentSuccess = ({ auth, transaction }) => {
    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <HiOutlineCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Pembayaran Berhasil!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Terima kasih telah melakukan pembayaran. Transaksi Anda telah berhasil diproses.
                        </p>
                        <div className="space-y-4">
                            <Link
                                href={route('transaction.customer.show', transaction.id)}
                                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Lihat Detail Transaksi
                            </Link>
                            <Link
                                href={route('home')}
                                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentSuccess; 