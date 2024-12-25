import React from 'react';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import { Link } from '@inertiajs/react';
import axios from 'axios';

const Cart = ({ auth, cart }) => {
    const updateQuantity = async (cartId, newQuantity, maxUnit) => {
        if (newQuantity < 1 || newQuantity > maxUnit) return;
        
        try {
            await axios.patch(route('cart.update', cartId), {
                quantity: newQuantity
            });
            window.location.reload();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Gagal mengubah jumlah unit');
        }
    };

    const removeFromCart = async (cartId) => {
        try {
            await axios.delete(route('cart.remove', cartId));
            window.location.reload();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Gagal menghapus item');
        }
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            return total + (item.kendaraan.price_per_day * item.quantity);
        }, 0);
    };

    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <h1 className="mb-8 text-2xl font-bold">Keranjang Sewa</h1>
                    
                    {cart.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                {cart.map((item) => (
                                    <div key={item.id} className="p-6 mb-4 bg-white rounded-lg shadow-md">
                                        <div className="flex gap-4">
                                            <img 
                                                src={item.kendaraan.photos ? `/storage/${JSON.parse(item.kendaraan.photos)[0]}` : '/assets/default-vehicle.jpg'}
                                                alt={item.kendaraan.title}
                                                className="object-cover w-32 h-32 rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{item.kendaraan.title}</h3>
                                                        <p className="mt-1 text-sm text-gray-600">
                                                            Rp {item.kendaraan.price_per_day?.toLocaleString('id-ID')}/hari
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="flex items-center mt-4">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.kendaraan.unit)}
                                                        className="px-2 py-1 text-gray-600 border rounded-l hover:bg-gray-100"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-4 py-1 text-center border-t border-b">
                                                        {item.quantity}
                                                    </span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.kendaraan.unit)}
                                                        className="px-2 py-1 text-gray-600 border rounded-r hover:bg-gray-100"
                                                    >
                                                        +
                                                    </button>
                                                    <span className="ml-2 text-sm text-gray-500">
                                                        (Tersedia: {item.kendaraan.unit} unit)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="lg:col-span-1">
                                <div className="p-6 bg-white rounded-lg shadow-md">
                                    <h3 className="mb-4 text-lg font-semibold">Ringkasan Sewa</h3>
                                    <div className="mb-4">
                                        <div className="flex justify-between mb-2">
                                            <span>Total</span>
                                            <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = route('cart.checkout')}
                                        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white rounded-lg shadow-md">
                            <p className="mb-4 text-gray-600">Keranjang Anda masih kosong</p>
                            <Link
                                href="/"
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Mulai Menyewa
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            <Footergabungan />
        </>
    );
};

export default Cart; 