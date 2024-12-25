import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import { HiChevronLeft, HiChevronRight, HiX, HiShoppingCart } from "react-icons/hi";
import axios from 'axios';
import FloatingChat from '@/Components/FloatingChat';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Isiperusahaan = ({ auth, content }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const nextImage = () => {
        setCurrentImageIndex((prev) => 
            prev === content.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => 
            prev === 0 ? content.images.length - 1 : prev - 1
        );
    };

    const isProfileComplete = () => {
        const userDetail = auth.user?.detail;
        if (!userDetail) return false;
        
        return userDetail.phone && userDetail.ktp_number && userDetail.ktp_picture;
    };

    const handleIncompleteProfile = () => {
        setShowProfileAlert(true);
    };

    const handleAddToCart = async (kendaraanId) => {
        if (!auth.user) {
            router.visit(route('register.customer'));
            return;
        }

        if (!isProfileComplete()) {
            handleIncompleteProfile();
            return;
        }

        try {
            const response = await axios.post(route('cart.add', { kendaraan: kendaraanId }));
            
            if (response.data.success) {
                window.dispatchEvent(new CustomEvent('cart-updated'));
                alert(response.data.message);
            } else {
                alert('Gagal menambahkan ke keranjang');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
        }
    };

    const handleSewa = async (kendaraanId) => {
        if (!auth.user) {
            router.visit(route('register.customer'));
            return;
        }

        if (!isProfileComplete()) {
            handleIncompleteProfile();
            return;
        }

        try {
            const response = await axios.post(route('cart.add', { kendaraan: kendaraanId }));
            
            if (response.data.success) {
                window.dispatchEvent(new CustomEvent('cart-updated'));
                router.visit(route('cart.index'), {
                    preserveScroll: true,
                    preserveState: true
                });
            } else {
                alert('Gagal menambahkan ke keranjang');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
        }
    };

    const handleStartChat = async () => {
        if (!auth.user) {
            router.visit(route('register.customer'));
            return;
        }

        if (!isProfileComplete()) {
            handleIncompleteProfile();
            return;
        }

        try {
            const response = await axios.post('/api/chats', {
                content_id: content.id
            });
            
            if (response.data.error) {
                throw new Error(response.data.error);
            }

            window.dispatchEvent(new CustomEvent('open-chat', {
                detail: { 
                    chatId: response.data.id,
                    chat: response.data
                }
            }));
        } catch (error) {
            console.error('Error starting chat:', error);
            alert('Gagal memulai chat');
        }
    };

    const handleMapClick = () => {
        if (content.latitude && content.longitude) {
            window.open(`https://www.google.com/maps?q=${content.latitude},${content.longitude}`, '_blank');
        }
    };

    const getRegencyName = (regencyId) => {
        const regencies = {
            '3401': 'KULON PROGO',
            '3402': 'BANTUL',
            '3403': 'GUNUNG KIDUL',
            '3404': 'SLEMAN',
            '3471': 'KOTA YOGYAKARTA'
        };
        return regencies[regencyId] || regencyId;
    };

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            mirror: true,
            offset: 0,
            delay: 0,
            easing: 'ease-out',
            anchorPlacement: 'top-bottom',
            disable: false,
        });
    }, []);

    if (!content) {
        return (
            <>
                <Navbargabungan auth={auth} />
                <div className="min-h-screen pt-20 bg-gradient-to-b from-gray-50 to-white">
                    <div className="container px-4 mx-auto text-center">
                        <p className="text-gray-500">Content tidak ditemukan</p>
                    </div>
                </div>
                <Footergabungan />
            </>
        );
    }

    return (
        <>
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    <div className="flex gap-8">
                        {/* Content Section - Left Side (3/5) */}
                        <div 
                            className="w-3/5"
                            data-aos="fade-right"
                            data-aos-duration="1000"
                        >
                            {/* Image Gallery */}
                            <div className="p-6 mb-6 bg-white shadow-md rounded-xl">
                                <div className="relative">
                                    <img 
                                        src={content.images[currentImageIndex]?.url || '/assets/default.jpg'}
                                        alt={content.title}
                                        className="object-cover w-full transition-transform duration-500 rounded-lg h-96 hover:scale-105"
                                        
                                        data-aos-delay="300"
                                    />
                                    
                                    {/* Navigation Buttons */}
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-0 p-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-r-lg top-1/2 hover:bg-opacity-75"
                                    >
                                        <HiChevronLeft className="w-6 h-6 text-white" />
                                    </button>
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-0 p-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-l-lg top-1/2 hover:bg-opacity-75"
                                    >
                                        <HiChevronRight className="w-6 h-6 text-white" />
                                    </button>

                                    {/* View All Photos Button */}
                                    <button 
                                        onClick={() => setShowGalleryModal(true)}
                                        className="absolute px-4 py-2 text-sm font-medium text-white transition-opacity bg-black rounded-lg bg-opacity-60 bottom-4 right-4 hover:bg-opacity-80"
                                    >
                                        Lihat Semua Foto
                                    </button>
                                </div>
                            </div>

                            {/* Content Info */}
                            <div className="p-6 bg-white shadow-md rounded-xl">
                                {/* Title Section dengan styling yang lebih baik */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between gap-6 mb-4">
                                        <div className="flex-1">
                                            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                                                {content.title}
                                            </h1>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-blue-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                    <span className="font-medium text-blue-700">{content.user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-green-50">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-600">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    <span className="font-medium text-green-700">Terverifikasi</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chat Button dengan styling yang lebih menarik */}
                                        <button
                                            onClick={handleStartChat}
                                            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Chat Sekarang
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        <span>Oleh: {content.user.name}</span>
                                    </div>
                                </div>

                                {/* Location and Map Section */}
                                <div className="p-4 mb-6 transition-all duration-300 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-blue-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-1 text-lg font-semibold text-gray-900">Lokasi Rental</h3>
                                            <div className="mb-3">
                                                <p className="text-gray-700">{content.address}</p>
                                                <p className="text-sm text-blue-600">{getRegencyName(content.regency_id)}</p>
                                            </div>
                                            <button
                                                onClick={handleMapClick}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 transition-all duration-300 rounded-lg bg-blue-50 hover:bg-blue-100 hover:shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                                                </svg>
                                                Lihat di Google Maps
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div className="p-4 mb-6 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                                    <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-900">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                        </svg>
                                        Tentang Rental
                                    </h3>
                                    <p className="leading-relaxed text-gray-600">{content.description}</p>
                                </div>

                                {/* Contact Section */}
                                <div className="grid gap-4 p-4 mb-6 border border-gray-100 rounded-xl">
                                    <h3 className="font-semibold text-gray-900">Informasi Kontak</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 transition-all duration-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                            </svg>
                                            <span className="text-gray-600">{content.phone || 'Hubungi Kami'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 transition-all duration-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                            </svg>
                                            <span className="text-gray-600">{content.email || 'Email Kami'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicles Section - Right Side (2/5) */}
                        <div 
                            className="w-2/5"
                            data-aos="fade-left"
                            data-aos-duration="1000"
                        >
                            <div className="sticky p-6 bg-white shadow-md rounded-xl top-24">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 text-gray-600 bg-gray-100 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold">Daftar Kendaraan</h2>
                                </div>

                                {/* Vehicle List dengan Scroll */}
                                <div className="custom-vehicle-scroll">
                                    <div className="space-y-4">
                                        {content.kendaraans?.map((kendaraan) => {
                                            const getPhotos = (photosData) => {
                                                return typeof photosData === 'string' ? JSON.parse(photosData) : photosData || [];
                                            };

                                            const photos = getPhotos(kendaraan.photos);
                                            const mainPhoto = photos.length > 0 ? `/storage/${photos[0]}` : '/assets/default-vehicle.jpg';

                                            return (
                                                <div 
                                                    key={kendaraan.id} 
                                                    className="p-4 transition-all duration-300 transform rounded-lg bg-gray-50 hover:bg-gray-100 hover:-translate-y-1 hover:shadow-md"
                                                >
                                                    <div className="flex gap-4">
                                                        <img 
                                                            src={mainPhoto}
                                                            alt={kendaraan.title}
                                                            className="object-cover w-24 h-24 rounded-lg"
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="mb-1 text-lg font-semibold">{kendaraan.title}</h3>
                                                            <div className="flex items-center mb-2 space-x-4 text-sm text-gray-600">
                                                                <span>{kendaraan.unit || 'Unit'} Unit</span>
                                                                <span>{kendaraan.transmission || 'Publish'}</span>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-xl font-bold text-gray-900">
                                                                    Rp {kendaraan.price_per_day?.toLocaleString('id-ID')}/hari
                                                                </span>
                                                                <div className="flex gap-2">
                                                                    {auth.user?.roles[0]?.name === 'customer' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleAddToCart(kendaraan.id)}
                                                                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                                                </svg>
                                                                                Add to Cart
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleSewa(kendaraan.id)}
                                                                                className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                                                                            >
                                                                                Sewa Sekarang
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {!auth.user && (
                                                                        <button
                                                                            onClick={() => handleSewa(kendaraan.id)}
                                                                            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700"
                                                                        >
                                                                            Sewa Sekarang
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Modal */}
            {showGalleryModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    onClick={() => setShowGalleryModal(false)}
                >
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-90"
                        aria-hidden="true"
                    />
                    <div 
                        className="relative z-[101] w-full max-w-6xl p-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setShowGalleryModal(false)}
                            className="absolute z-[102] p-2 text-white transition-colors rounded-full top-4 right-4 hover:bg-white/20 focus:outline-none"
                            type="button"
                            aria-label="Close gallery"
                        >
                            <HiX className="w-6 h-6" />
                        </button>

                        <div className="relative">
                            <img 
                                src={content.images[currentImageIndex]?.url || '/assets/default.jpg'}
                                alt={content.title}
                                className="object-contain w-full max-h-[80vh]"
                            />
                            
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-0 p-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-r-lg top-1/2 hover:bg-opacity-75 focus:outline-none"
                                type="button"
                                aria-label="Previous image"
                            >
                                <HiChevronLeft className="w-8 h-8 text-white" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-0 p-2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-l-lg top-1/2 hover:bg-opacity-75 focus:outline-none"
                                type="button"
                                aria-label="Next image"
                            >
                                <HiChevronRight className="w-8 h-8 text-white" />
                            </button>
                        </div>

                        {/* Modal Thumbnails */}
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                            {content.images.map((image, index) => (
                                <img 
                                    key={index}
                                    src={image.url}
                                    alt={`Gallery ${index + 1}`}
                                    className={`object-cover w-20 h-20 rounded cursor-pointer transition-opacity ${
                                        currentImageIndex === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Alert Modal */}
            {showProfileAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                        <div className="mb-4 text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">Lengkapi Profil</h3>
                            <p className="text-sm text-gray-600">
                                Silakan lengkapi profil Anda terlebih dahulu dengan menambahkan:
                            </p>
                            <ul className="mt-2 mb-4 text-sm text-left text-gray-600 list-disc list-inside">
                                {!auth.user?.detail?.phone && <li>Nomor Telepon</li>}
                                {!auth.user?.detail?.ktp_number && <li>Nomor KTP</li>}
                                {!auth.user?.detail?.ktp_picture && <li>Foto KTP</li>}
                            </ul>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowProfileAlert(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Nanti Saja
                            </button>
                            <button
                                onClick={() => {
                                    setShowProfileAlert(false);
                                    router.visit(route('customer.profile.edit'));
                                }}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Lengkapi Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footergabungan />
            <FloatingChat />

            {/* Tambahkan style untuk custom scroll */}
            <style jsx>{`
                .custom-vehicle-scroll {
                    max-height: calc(100vh - 280px);
                    overflow-y: auto;
                    padding-right: 12px;
                    margin-right: -12px;
                }

                .custom-vehicle-scroll::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-vehicle-scroll::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .custom-vehicle-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 3px;
                }

                .custom-vehicle-scroll::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }

                @media (max-height: 768px) {
                    .custom-vehicle-scroll {
                        max-height: calc(100vh - 220px);
                    }
                }
            `}</style>
        </>
    );
};

export default Isiperusahaan;
