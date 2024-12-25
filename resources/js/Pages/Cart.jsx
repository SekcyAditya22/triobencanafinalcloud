import React, { useState } from 'react';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FloatingChat from '@/Components/FloatingChat';

const Cart = ({ auth, cart: initialCart }) => {
    const [cartItems, setCartItems] = useState(initialCart);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [dateError, setDateError] = useState('');

    const updateQuantity = async (cartId, newQuantity, maxUnit) => {
        if (newQuantity < 1 || newQuantity > maxUnit) return;
        
        try {
            await axios.patch(route('cart.update', cartId), {
                quantity: newQuantity
            });
            
            // Update state lokal
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.id === cartId 
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            // Update cart count di navbar
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Gagal mengubah jumlah unit');
        }
    };

    const removeFromCart = async (cartId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
        
        try {
            const response = await axios.delete(route('cart.remove', cartId));
            
            if (response.data.success) {
                // Update state lokal
                setCartItems(prevItems => prevItems.filter(item => item.id !== cartId));
                
                // Update cart count di navbar
                window.dispatchEvent(new CustomEvent('cart-updated'));
                
                // Optional: Tampilkan notifikasi sukses
                alert(response.data.message);
            } else {
                alert(response.data.message || 'Gagal menghapus item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert(error.response?.data?.message || 'Gagal menghapus item');
        }
    };

    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const calculateTotal = () => {
        const days = calculateDays();
        return cartItems.reduce((total, item) => {
            return total + (item.kendaraan.price_per_day * item.quantity * days);
        }, 0);
    };

    const handleCheckout = async () => {
        if (!startDate || !endDate) {
            setDateError('Silakan pilih tanggal sewa');
            return;
        }

        try {
            // Langsung buat transaksi
            const response = await axios.post(route('cart.process-checkout'), {
                items: cartItems,
                start_date: startDate,
                end_date: endDate,
                total_days: calculateDays(),
                total_amount: calculateTotal()
            });

            if (response.data.success) {
                // Redirect ke halaman transaksi
                window.location.href = `/transactions/${response.data.transaction_id}`;
            } else {
                alert('Gagal melakukan checkout');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Gagal melakukan checkout');
        }
    };

    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <h1 className="mb-8 text-2xl font-bold">Keranjang Sewa</h1>
                    
                    {cartItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="p-6 mb-4 bg-white rounded-lg shadow-md">
                                        <div className="flex gap-4">
                                            <img 
                                                src={(() => {
                                                    try {
                                                        const photos = item.kendaraan.photos;
                                                        if (!photos) return '/assets/default-vehicle.jpg';
                                                        return typeof photos === 'string' 
                                                            ? `/storage/${JSON.parse(photos)[0]}`
                                                            : `/storage/${photos[0]}`;
                                                    } catch (e) {
                                                        console.error('Error parsing photos:', e);
                                                        return '/assets/default-vehicle.jpg';
                                                    }
                                                })()}
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
                                                        className="text-red-500 transition-colors duration-200 hover:text-red-700"
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
                                    
                                    {/* Date Picker */}
                                    <div className="mb-4">
                                        <div className="mb-3">
                                            <label className="block mb-1 text-sm text-gray-600">
                                                Tanggal Mulai
                                            </label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={date => {
                                                    setStartDate(date);
                                                    setDateError('');
                                                }}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={new Date()}
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholderText="Pilih tanggal mulai"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block mb-1 text-sm text-gray-600">
                                                Tanggal Selesai
                                            </label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={date => {
                                                    setEndDate(date);
                                                    setDateError('');
                                                }}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate || new Date()}
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholderText="Pilih tanggal selesai"
                                            />
                                        </div>
                                        {dateError && (
                                            <p className="mt-1 text-sm text-red-500">{dateError}</p>
                                        )}
                                    </div>

                                    {/* Summary Details */}
                                    <div className="p-4 mb-4 rounded-lg bg-gray-50">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Durasi Sewa</span>
                                            <span>{calculateDays()} hari</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Total Item</span>
                                            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} unit</span>
                                        </div>
                                        <div className="flex justify-between pt-2 mt-2 border-t">
                                            <span className="font-semibold">Total</span>
                                            <span className="font-semibold">
                                                Rp {calculateTotal().toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleCheckout}
                                        disabled={!startDate || !endDate}
                                        className={`w-full px-4 py-2 text-white rounded-lg ${
                                            !startDate || !endDate 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
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
            <FloatingChat />
        </>
    );
};

export default Cart;
