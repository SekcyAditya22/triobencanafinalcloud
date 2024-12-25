import React, { useEffect, useState, useRef } from 'react';
import { Carousel } from "react-bootstrap";
import { Link } from '@inertiajs/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import styles from './styles/gabungan.module.css';
import Navbargabungan from "@/Components/Navbargabungan";
import Footergabungan from "@/Components/Footergabungan";
import FloatingChat from '@/Components/FloatingChat';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const Gabungan = ({ auth, contents }) => {
    const [index, setIndex] = useState(0);
    
    // Tambahkan ref untuk Featured Section
    const featuredSectionRef = useRef(null);

    // Tambahkan fungsi scroll
    const scrollToFeatured = (e) => {
        e.preventDefault();
        featuredSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
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

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

    // State untuk filter
    const [searchParams, setSearchParams] = useState({
        location: '',
        priceRange: [0, 5000000],
        isFilterVisible: false
    });
    
    // State untuk data yang sudah difilter
    const [filteredContents, setFilteredContents] = useState(contents);

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Handle filter change
    const handleFilterChange = () => {
        const filtered = contents.filter(content => {
            const locationMatch = searchParams.location === '' || 
                getRegencyName(content.regency_id).toLowerCase().includes(searchParams.location.toLowerCase());
            
            const priceMatch = content.kendaraans.some(kendaraan => 
                kendaraan.price_per_day >= searchParams.priceRange[0] &&
                kendaraan.price_per_day <= searchParams.priceRange[1]
            );

            return locationMatch && priceMatch;
        });

        setFilteredContents(filtered);
    };

    // Update filter ketika parameter berubah
    useEffect(() => {
        handleFilterChange();
    }, [searchParams]);

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

        const refreshAOS = () => {
            setTimeout(() => {
                AOS.refresh();
            }, 10);
        };

        refreshAOS();

        window.addEventListener('resize', refreshAOS);
        window.addEventListener('orientationchange', refreshAOS);

        return () => {
            window.removeEventListener('resize', refreshAOS);
            window.removeEventListener('orientationchange', refreshAOS);
        };
    }, [filteredContents]);

    const carouselItems = [
        {
            image: "/assets/merapii.jpg",
            title: "Kendaraan Lengkap Berbagai Penyedia",
            description: "Koleksi lengkap kendaraan untuk berbagai kebutuhan",
            buttonText: "Explore Now"
        },
        {
            image: "/assets/yogya.jpg",
            title: "Kendaraan Yogyakarta Lengkap",
            description: "Darimanapun bisa sewa",
            buttonText: "Discover More"
        }
    ];

    return (
        <>
            <Navbargabungan auth={auth} />
            
            {/* Hero Section dengan Carousel */}
            <div className="pt-16 bg-gradient-to-b from-gray-50 to-white">
                <div 
                    className="relative overflow-hidden shadow-2xl rounded-b-3xl" 
                    data-aos="zoom-out"
                    data-aos-duration="1000"
                    data-aos-anchor-placement="top-bottom"
                >
                    <Carousel 
                        activeIndex={index}
                        onSelect={handleSelect}
                        fade={true}
                        interval={4000} 
                        pause="hover"
                        className={styles.carousel}
                        indicators={false}
                        controls={false}
                    >
                        {carouselItems.map((item, idx) => (
                            <Carousel.Item key={idx} className={styles.carouselItem}>
                                <div className="relative h-[600px]">
                                    <img
                                        className="absolute inset-0 object-cover w-full h-full"
                                        src={item.image}
                                        alt={item.title}
                                    />
                                    <div className="absolute inset-0 bg-black/40" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
                                        <h2 className="mb-4 text-5xl font-bold text-center md:text-6xl animate-fade-in-down">
                                            {item.title}
                                        </h2>
                                        <p className="max-w-2xl mx-auto text-xl text-center md:text-2xl animate-fade-in-up">
                                            {item.description}
                                        </p>
                                        <Link 
                                            href="#featured"
                                            onClick={scrollToFeatured}
                                            className="px-8 py-3 mt-8 font-semibold text-gray-900 transition duration-300 transform bg-white rounded-full hover:bg-gray-100 hover:-translate-y-1 animate-bounce"
                                        >
                                            {item.buttonText}
                                        </Link>
                                    </div>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>

                    {/* Custom Navigation */}
                    <button 
                        className={`${styles.carouselControl} ${styles.prevButton}`}
                        onClick={() => setIndex(index === 0 ? carouselItems.length - 1 : index - 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        className={`${styles.carouselControl} ${styles.nextButton}`}
                        onClick={() => setIndex(index === carouselItems.length - 1 ? 0 : index + 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19l7-7-7-7" />
                        </svg>
                    </button>

                    {/* Custom Indicators */}
                    <div className={styles.carouselIndicators}>
                        {carouselItems.map((_, idx) => (
                            <button
                                key={idx}
                                className={`${styles.indicator} ${idx === index ? styles.active : ''}`}
                                onClick={() => setIndex(idx)}
                            />
                        ))}
                    </div>
                </div>

                {/* Featured Section */}
                <div 
                    ref={featuredSectionRef}
                    id="featured" 
                    className="container px-4 py-16 mx-auto"
                >
                    <div className="mb-12 text-center">
                        <h2 
                            className="mb-4 text-3xl font-bold text-gray-900" 
                            data-aos="fade-down"
                            data-aos-duration="1000"
                            data-aos-anchor-placement="top-center"
                        >
                            Penyedia Kendaraan Terpopuler
                        </h2>
                        <p 
                            className="text-gray-600" 
                            data-aos="fade-up"
                            data-aos-duration="1000"
                            data-aos-delay="200"
                            data-aos-anchor-placement="top-center"
                        >
                            Temukan berbagai pilihan kendaraan dari penyedia terpercaya
                        </p>
                    </div>

                    {/* Filter Search Section - Dipindah ke sini */}
                    <div className="mb-8">
                        <div 
                            className="p-6 bg-white shadow-xl rounded-2xl"
                            data-aos="fade-up"
                            data-aos-duration="1000"
                        >
                            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-3">
                                    {/* Filter Toggle Button */}
                                    <button
                                        onClick={() => setSearchParams(prev => ({ ...prev, isFilterVisible: !prev.isFilterVisible }))}
                                        className="flex items-center justify-center px-4 py-2 space-x-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                        <span>Filter Pencarian</span>
                                    </button>

                                    {/* Reset Filter Button - Dipindah ke sini */}
                                    <button
                                        onClick={() => setSearchParams({
                                            location: '',
                                            priceRange: [0, 5000000],
                                            isFilterVisible: true
                                        })}
                                        className="flex items-center justify-center px-4 py-2 space-x-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Reset Filter</span>
                                    </button>
                                </div>

                                {/* Search Results Count */}
                                <div className="text-gray-600">
                                    Ditemukan {filteredContents.length} penyedia kendaraan
                                </div>
                            </div>

                            {/* Filter Panel */}
                            <div className={`mt-6 transition-all duration-300 ${searchParams.isFilterVisible ? 'block' : 'hidden'}`}>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Location Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Lokasi</label>
                                        <div className="relative">
                                            <select
                                                value={searchParams.location}
                                                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                                                className="w-full px-4 py-3 text-gray-700 transition-all duration-300 bg-white border-2 border-gray-200 appearance-none cursor-pointer rounded-xl hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="" className="py-2">--Semua Lokasi</option>
                                                {[
                                                    { id: 'KULON PROGO', icon: '🌄', desc: 'Wisata Alam & Pantai' },
                                                    { id: 'BANTUL', icon: '🏖️', desc: 'Pantai & Kuliner' },
                                                    { id: 'GUNUNG KIDUL', icon: '⛰️', desc: 'Wisata Goa & Pantai' },
                                                    { id: 'SLEMAN', icon: '🗻', desc: 'Merapi & Wisata Edukasi' },
                                                    { id: 'KOTA YOGYAKARTA', icon: '🏰', desc: 'Pusat Budaya & Wisata' }
                                                ].map((location) => (
                                                    <option 
                                                        key={location.id} 
                                                        value={location.id}
                                                        className="py-2"
                                                    >
                                                        {`${location.icon} ${location.id} - ${location.desc}`}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Custom arrow icon */}
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                                <div className="p-2 transition-colors duration-300 rounded-lg bg-gray-50 group-hover:bg-gray-100">
                                                    <svg 
                                                        className="w-5 h-5 text-gray-600" 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        viewBox="0 0 20 20" 
                                                        fill="currentColor"
                                                    >
                                                        <path 
                                                            fillRule="evenodd" 
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                                                            clipRule="evenodd" 
                                                        />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Decorative elements */}
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <svg 
                                                    className="w-5 h-5 text-gray-500" 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    viewBox="0 0 20 20" 
                                                    fill="currentColor"
                                                >
                                                    <path 
                                                        fillRule="evenodd" 
                                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
                                                        clipRule="evenodd" 
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Location description */}
                                        {searchParams.location && (
                                            <div 
                                                className="p-3 mt-2 text-sm transition-all duration-300 bg-blue-50 rounded-xl"
                                                data-aos="fade-up"
                                                data-aos-duration="500"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">
                                                        {[
                                                            { id: 'KULON PROGO', icon: '🌄' },
                                                            { id: 'BANTUL', icon: '🏖️' },
                                                            { id: 'GUNUNG KIDUL', icon: '⛰️' },
                                                            { id: 'SLEMAN', icon: '🗻' },
                                                            { id: 'KOTA YOGYAKARTA', icon: '🏰' }
                                                        ].find(loc => loc.id === searchParams.location)?.icon}
                                                    </span>
                                                    <div>
                                                        <p className="font-medium text-blue-800">{searchParams.location}</p>
                                                        <p className="text-blue-600">
                                                            {searchParams.location === 'KULON PROGO' && 'Nikmati wisata alam dan pantai yang memukau'}
                                                            {searchParams.location === 'BANTUL' && 'Jelajahi pantai indah dan kuliner lezat'}
                                                            {searchParams.location === 'GUNUNG KIDUL' && 'Telusuri goa dan pantai eksotis'}
                                                            {searchParams.location === 'SLEMAN' && 'Eksplorasi Merapi dan wisata edukasi'}
                                                            {searchParams.location === 'KOTA YOGYAKARTA' && 'Rasakan pesona budaya dan sejarah'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Range Filter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Rentang Harga per Hari</label>
                                        <div className="px-4 pt-4">
                                            <Slider
                                                range
                                                min={0}
                                                max={5000000}
                                                value={searchParams.priceRange}
                                                onChange={(value) => setSearchParams(prev => ({ ...prev, priceRange: value }))}
                                                trackStyle={[{ backgroundColor: '#4F46E5' }]}
                                                handleStyle={[
                                                    { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
                                                    { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                                                ]}
                                                railStyle={{ backgroundColor: '#E5E7EB' }}
                                            />
                                            <div className="flex justify-between mt-2 text-sm text-gray-600">
                                                <span>{formatPrice(searchParams.priceRange[0])}</span>
                                                <span>{formatPrice(searchParams.priceRange[1])}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredContents && filteredContents.length > 0 ? (
                            filteredContents.map((content, index) => (
                                <div 
                                    key={content.id}
                                    className="flex flex-col h-full overflow-hidden transition duration-300 transform bg-white border border-gray-100 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-md"
                                    data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                                    data-aos-delay={index * 50}
                                    data-aos-duration="850"
                                    data-aos-anchor-placement="top-bottom"
                                    data-aos-offset="0"
                                    data-aos-once="false"
                                >
                                    <div className="relative">
                                        <img 
                                            src={content.images[0]?.url || '/assets/default.jpg'} 
                                            alt={content.title}
                                            className="object-cover w-full h-72"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className="px-3 py-1 text-sm font-medium text-white bg-yellow-400 rounded-full shadow-sm">
                                                Verified
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col flex-1 p-6">
                                        <h3 className="mb-3 text-xl font-bold text-gray-800">{content.title}</h3>
                                        
                                        <div className="flex items-center mb-4 space-x-2">
                                            <div className="flex items-center flex-1 space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-sm text-gray-500">{getRegencyName(content.regency_id)}</span>
                                            </div>
                                            <a 
                                                href={`https://www.google.com/maps?q=${content.latitude},${content.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center px-3 py-1 text-sm text-blue-600 transition-colors rounded-full bg-blue-50 hover:bg-blue-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                Lihat Map
                                            </a>
                                        </div>
                                        
                                        <p className="mb-8 text-gray-600 line-clamp-3">{content.description}</p>
                                        
                                        <div className="p-4 mb-8 bg-gray-50 rounded-xl">
                                            <h4 className="mb-3 text-sm font-semibold text-gray-700">Kendaraan Tersedia:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {content.kendaraans?.slice(0, 3).map((kendaraan) => (
                                                    <span 
                                                        key={kendaraan.id}
                                                        className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-full"
                                                    >
                                                        {kendaraan.title}
                                                    </span>
                                                ))}
                                                {content.kendaraans?.length > 3 && (
                                                    <span className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-full">
                                                        +{content.kendaraans.length - 3} lainnya
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6 mt-auto space-y-4 border-t border-gray-100">
                                            <div className="text-center">
                                                <p className="text-sm text-gray-500">Mulai dari</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    Rp {content.kendaraans[0]?.price_per_day?.toLocaleString('id-ID')}
                                                    <span className="text-sm font-normal text-gray-500">/hari</span>
                                                </p>
                                            </div>
                                            <Link 
                                                href={route('content.show', content.id)} 
                                                className="flex items-center justify-center w-full px-6 py-3 text-sm font-medium text-white transition-all duration-300 bg-gray-900 rounded-lg hover:bg-gray-800 hover:scale-105"
                                            >
                                                Lihat Detail
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div 
                                className="p-12 text-center col-span-full bg-gray-50 rounded-xl"
                                data-aos="fade-up"
                                data-aos-duration="400"
                                data-aos-offset="0"
                                data-aos-once="false"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-800">Tidak Ada Hasil</h3>
                                <p className="text-gray-500">Maaf, tidak ada penyedia kendaraan yang sesuai dengan filter yang dipilih.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call to Action Section */}
                <div className="relative py-24 overflow-hidden">
                    {/* Background dengan gradient dan pattern */}
                    <div 
                        className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                        data-aos="fade"
                        data-aos-duration="1500"
                    >
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }} />
                    </div>

                    <div 
                        className="container relative px-4 mx-auto"
                        data-aos="zoom-in"
                        data-aos-duration="1000"
                    >
                        <div className="max-w-5xl mx-auto text-center">
                            <h2 
                                className="mb-8 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text"
                                data-aos="fade-down"
                                data-aos-duration="1000"
                                data-aos-delay="200"
                            >
                                Sing Tenang Ada Kendaraan Sewa
                            </h2>

                            <p 
                                className="mb-12 text-xl text-gray-300 md:text-2xl"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-delay="400"
                            >
                                Kalau ke Jogja Langsung Aja Ke TRIO BENCANA
                            </p>

                            {/* Feature Cards dengan animasi berbeda */}
                            <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-3">
                                <div 
                                    className="p-6 transition-all duration-300 transform bg-white/10 backdrop-blur-lg rounded-2xl hover:scale-105"
                                    data-aos="flip-left"
                                    data-aos-duration="1000"
                                    data-aos-delay="200"
                                >
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Proses Cepat</h3>
                                    <p className="text-gray-300">Booking kendaraan hanya dalam hitungan menit</p>
                                </div>

                                <div 
                                    className="p-6 transition-all duration-300 transform bg-white/10 backdrop-blur-lg rounded-2xl hover:scale-105"
                                    data-aos="flip-up"
                                    data-aos-duration="1000"
                                    data-aos-delay="400"
                                >
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Terpercaya</h3>
                                    <p className="text-gray-300">Kendaraan terawat dan terjamin kualitasnya</p>
                                </div>

                                <div 
                                    className="p-6 transition-all duration-300 transform bg-white/10 backdrop-blur-lg rounded-2xl hover:scale-105"
                                    data-aos="flip-right"
                                    data-aos-duration="1000"
                                    data-aos-delay="600"
                                >
                                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">Support 24/7</h3>
                                    <p className="text-gray-300">Layanan pelanggan siap membantu kapanpun</p>
                                </div>
                            </div>

                            {/* CTA Buttons dengan animasi */}
                            <div 
                                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                                data-aos="fade-up"
                                data-aos-duration="1000"
                                data-aos-delay="800"
                            >
                                <Link 
                                    href="#featured"
                                    onClick={scrollToFeatured}
                                    className="relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 ease-in-out group bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                                >
                                    <span className="absolute inset-0 w-full h-full -mt-1 transition-all duration-300 ease-in-out opacity-0 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 group-hover:opacity-100 group-hover:translate-y-1"></span>
                                    <span className="relative flex items-center">
                                        Mulai Rental
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                </Link>

                                <a 
                                    href="https://github.com/SekcyAditya22" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 ease-in-out border-2 group border-white/50 rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                                >
                                    <span className="relative flex items-center">
                                        Tentang Kami
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 transition-transform duration-300 transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                        <div className="relative h-16">
                            <div className="absolute bottom-0 w-full h-full bg-white/5"></div>
                            <div className="absolute w-full h-px -bottom-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>

            <Footergabungan />

            {/* Tambahkan komponen Chat di sini */}
            
            <FloatingChat auth={auth} />

            {/* Custom animations */}
            <style jsx>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 1s ease-out;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out;
                }
            `}</style>
        </>
    );
};

export default Gabungan;
