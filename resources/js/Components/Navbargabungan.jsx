import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import RegisterModal from '@/Components/RegisterModal';
import axios from 'axios';
import { HiOutlineShoppingCart } from 'react-icons/hi';

const Navbargabungan = ({ auth }) => {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [cartCount, setCartCount] = useState(() => {
        return parseInt(localStorage.getItem('cartCount')) || 0;
    });
    const [pendingTransactions, setPendingTransactions] = useState(() => {
        return parseInt(localStorage.getItem('pendingTransactions')) || 0;
    });

    const navLinkClass = "group relative px-4 py-2.5 text-gray-700 transition duration-300 hover:text-gray-900 rounded-lg text-sm font-medium flex items-center hover:bg-gray-50";
    const navLinkUnderline = "absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-gray-800 to-gray-600 transition-all duration-300 group-hover:w-full";

    const fetchCartAndTransactionCount = async () => {
        if (auth?.user?.roles[0]?.name === 'customer') {
            try {
                const cartResponse = await axios.get(route('cart.count'));
                const newCartCount = cartResponse.data;
                setCartCount(newCartCount);
                localStorage.setItem('cartCount', newCartCount.toString());

                const transactionResponse = await axios.get(route('transaction.pending.count'));
                const newPendingCount = transactionResponse.data;
                setPendingTransactions(newPendingCount);
                localStorage.setItem('pendingTransactions', newPendingCount.toString());
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        }
    };

    useEffect(() => {
        if (auth?.user) {
            fetchCartAndTransactionCount();
        } else {
            setCartCount(0);
            setPendingTransactions(0);
            localStorage.removeItem('cartCount');
            localStorage.removeItem('pendingTransactions');
        }
    }, [auth?.user]);

    useEffect(() => {
        const handleUpdate = () => {
            fetchCartAndTransactionCount();
        };
        
        window.addEventListener('cart-updated', handleUpdate);
        window.addEventListener('transaction-updated', handleUpdate);
        
        const handleNavigation = () => {
            const savedCartCount = parseInt(localStorage.getItem('cartCount')) || 0;
            const savedPendingCount = parseInt(localStorage.getItem('pendingTransactions')) || 0;
            setCartCount(savedCartCount);
            setPendingTransactions(savedPendingCount);
        };

        window.addEventListener('popstate', handleNavigation);
        
        return () => {
            window.removeEventListener('cart-updated', handleUpdate);
            window.removeEventListener('transaction-updated', handleUpdate);
            window.removeEventListener('popstate', handleNavigation);
        };
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const scrollToFeatured = (e) => {
        e.preventDefault();
        const featuredSection = document.getElementById('featured');
        if (featuredSection) {
            featuredSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        } else {
            window.location.href = '/#featured';
        }
    };

    return (
        <>
            <nav className="fixed top-0 z-50 w-full shadow-lg bg-white/90 backdrop-blur-md">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo - ditambahkan pl-4 untuk geser kekiri */}
                        <div className="flex items-center flex-shrink-0 pl-4">
                            <Link 
                                href="/" 
                                className="flex items-center space-x-2 group"
                            >
                                <img 
                                    src="/assets/p1.png"
                                    alt="Logo" 
                                    className="w-auto h-10 transition duration-300 transform group-hover:scale-105"
                                />
                                <span className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                                    Trio Bencana
                                </span>
                            </Link>
                        </div>

                        {/* Desktop menu - diubah margin dan justify-content */}
                        <div className="hidden lg:flex lg:items-center lg:justify-between lg:flex-1 lg:px-16">
                            {/* Menu navigation - ditambahkan justify-center dan flex-1 */}
                            <div className="flex justify-center flex-1 space-x-8">
                                <Link href="/" className={navLinkClass}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>
                                    <span>Home</span>
                                    <div className={navLinkUnderline}></div>
                                </Link>
                                <Link 
                                    href="/#featured"
                                    onClick={scrollToFeatured}
                                    className={navLinkClass}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                                    </svg>
                                    <span>Rental</span>
                                    <div className={navLinkUnderline}></div>
                                </Link>
                                <Link href="/about" className={navLinkClass}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                    </svg>
                                    <span>About</span>
                                    <div className={navLinkUnderline}></div>
                                </Link>
                                
                            </div>

                            {/* Auth buttons */}
                            <div className="flex items-center space-x-4">
                                {auth?.user ? (
                                    <div className="flex items-center space-x-4">
                                        {/* Cart Icon dengan desain yang lebih menarik */}
                                        <div className="relative group">
                                            <Link 
                                                href={route('cart.index')}
                                                className="relative flex items-center gap-2 p-2 pr-4 transition-all duration-300 bg-white border-2 border-gray-800 rounded-xl group hover:bg-gray-800 hover:text-white"
                                                onClick={() => {
                                                    fetchCartAndTransactionCount();
                                                }}
                                            >
                                                <div className="relative">
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        strokeWidth={1.5} 
                                                        stroke="currentColor" 
                                                        className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                    </svg>
                                                    {cartCount > 0 && (
                                                        <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white transition-transform duration-300 transform bg-red-500 rounded-full -top-2 -right-2 group-hover:scale-110 animate-pulse">
                                                            {cartCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span className="text-sm font-medium">Cart</span>
                                                    {cartCount > 0 && (
                                                        <span className="text-xs opacity-75">
                                                            {cartCount} item{cartCount !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 transition-transform duration-300 border-2 border-gray-800 rounded-xl -z-10 group-hover:scale-105"></div>
                                            </Link>

                                            {/* Tooltip/Preview saat hover */}
                                            {cartCount > 0 && (
                                                <div className="absolute right-0 invisible w-64 p-4 mt-2 transition-all duration-300 bg-white border-2 border-gray-800 shadow-xl opacity-0 rounded-xl group-hover:visible group-hover:opacity-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-800">Shopping Cart</span>
                                                        <span className="px-2 py-1 text-xs font-bold text-white bg-gray-800 rounded-full">
                                                            {cartCount} items
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Click to view your cart items
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Profile Dropdown mirip DashboardLayout */}
                                        <div className="dropdown dropdown-end">
                                            <div className="flex items-center space-x-3 group">
                                                <div className="flex-col items-end hidden md:flex">
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                        {auth.user.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {auth.user.roles[0]?.name.charAt(0).toUpperCase() + auth.user.roles[0]?.name.slice(1)}
                                                    </span>
                                                </div>
                                                <div
                                                    tabIndex={0}
                                                    role="button"
                                                    className="relative flex items-center transition-transform duration-300 group-hover:scale-105"
                                                >
                                                    <div className="w-10 h-10 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2">
                                                        <img
                                                            alt="User Avatar"
                                                            src={
                                                                auth?.user?.detail?.profile_picture ??
                                                                "https://ui-avatars.com/api/?name=" +
                                                                    auth?.user?.name
                                                            }
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        viewBox="0 0 20 20" 
                                                        fill="currentColor" 
                                                        className="w-5 h-5 ml-1 text-gray-600 transition-transform duration-300 group-hover:text-gray-900 group-hover:rotate-180"
                                                    >
                                                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Dropdown Menu yang lebih menarik */}
                                            <div tabIndex={0} className="mt-4 shadow-lg dropdown-content menu bg-base-100 rounded-xl w-80">
                                                {/* User Info Header */}
                                                <div className="p-4 border-b border-gray-100">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-16 h-16 overflow-hidden rounded-full ring-2 ring-primary ring-offset-2">
                                                            <img
                                                                src={auth?.user?.detail?.profile_picture ?? `https://ui-avatars.com/api/?name=${auth?.user?.name}`}
                                                                alt="Profile"
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-800">{auth.user.name}</h4>
                                                            <p className="text-sm text-gray-500">{auth.user.email}</p>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                                {auth.user.roles[0]?.name.charAt(0).toUpperCase() + auth.user.roles[0]?.name.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="p-2">
                                                    <Link
                                                        href={auth.user.roles[0]?.name === 'customer' 
                                                            ? route('customer.profile.show')
                                                            : route('dashboard.profile.show')}
                                                        className="flex items-center px-4 py-3 space-x-3 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                                    >
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-700">View Profile</div>
                                                            <div className="text-xs text-gray-500">Manage your account details</div>
                                                        </div>
                                                    </Link>

                                                    {auth.user.roles[0]?.name === 'customer' && (
                                                        <Link
                                                            href={route('cart.checkout-landing')}
                                                            className="flex items-center px-4 py-3 space-x-3 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                                        >
                                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10 text-secondary">
                                                                <svg 
                                                                    xmlns="http://www.w3.org/2000/svg" 
                                                                    viewBox="0 0 24 24" 
                                                                    fill="currentColor" 
                                                                    className="w-6 h-6"
                                                                >
                                                                    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-700">Checkout</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {cartCount + pendingTransactions} items pending
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )}

                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full px-4 py-3 space-x-3 transition-colors duration-200 rounded-lg hover:bg-red-50"
                                                    >
                                                        <div className="flex items-center justify-center w-10 h-10 text-red-600 bg-red-100 rounded-lg">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-red-600">Log Out</div>
                                                            <div className="text-xs text-red-500">Logout from your account</div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Link 
                                            href={route('login')}
                                            className="inline-flex items-center px-6 py-2.5 border-2 border-gray-800 text-gray-800 rounded-full hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:text-white transform hover:-translate-y-0.5 transition duration-300 shadow-md hover:shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                            </svg>
                                            Login
                                        </Link>
                                        <button
                                            onClick={() => setIsRegisterModalOpen(true)}
                                            className="inline-flex items-center px-6 py-2.5 border-2 border-gray-800 text-gray-800 rounded-full hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:text-white transform hover:-translate-y-0.5 transition duration-300 shadow-md hover:shadow-lg"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                            </svg>
                                            Register
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center lg:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 text-gray-700 transition duration-300 rounded-md hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth={1.5} 
                                        stroke="currentColor" 
                                        className="w-6 h-6"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M6 18L18 6M6 6l12 12" 
                                        />
                                    </svg>
                                ) : (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth={1.5} 
                                        stroke="currentColor" 
                                        className="w-6 h-6"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`${isOpen ? 'block' : 'hidden'} lg:hidden`}>
                    <div className="px-4 pt-2 pb-3 space-y-3 bg-white shadow-lg rounded-b-xl">
                        <Link 
                            href="/"
                            className="flex items-center px-4 py-3 text-gray-700 transition duration-300 rounded-lg hover:bg-gray-50 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span>Home</span>
                        </Link>

                        <Link 
                            href="/#featured"
                            onClick={scrollToFeatured}
                            className="flex items-center px-4 py-3 text-gray-700 transition duration-300 rounded-lg hover:bg-gray-50 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
                            </svg>
                            <span>Rental</span>
                        </Link>

                        <Link 
                            href="/about"
                            className="flex items-center px-4 py-3 text-gray-700 transition duration-300 rounded-lg hover:bg-gray-50 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                            <span>About</span>
                        </Link>

                        

                        <div className="pt-4 space-y-3">
                            {auth?.user ? (
                                <>
                                    {/* Cart dan Checkout hanya muncul untuk customer */}
                                    {auth.user.roles[0]?.name === 'customer' && (
                                        <>
                                            <Link 
                                                href={route('cart.index')}
                                                className="relative flex items-center justify-center w-full px-4 py-3 font-medium text-gray-800 transition duration-300 border-2 border-gray-800 rounded-xl hover:bg-gray-800 hover:text-white"
                                                onClick={() => {
                                                    fetchCartAndTransactionCount();
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                </svg>
                                                Cart
                                                {cartCount > 0 && (
                                                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2">
                                                        {cartCount}
                                                    </span>
                                                )}
                                            </Link>

                                            <Link 
                                                href={route('cart.checkout-landing')}
                                                className="flex items-center px-4 py-3 space-x-3 transition-colors duration-200 rounded-lg hover:bg-gray-100"
                                            >
                                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10 text-secondary">
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        viewBox="0 0 24 24" 
                                                        fill="currentColor" 
                                                        className="w-6 h-6"
                                                    >
                                                        <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-700">Checkout</div>
                                                    <div className="text-xs text-gray-500">
                                                        {cartCount + pendingTransactions} items pending
                                                    </div>
                                                </div>
                                            </Link>
                                        </>
                                    )}

                                    {/* Profile Link */}
                                    <Link 
                                        href={auth.user.roles[0]?.name === 'customer' 
                                            ? route('customer.profile.show')
                                            : route('dashboard.profile.show')}
                                        className="flex items-center justify-center w-full px-4 py-3 font-medium text-gray-800 transition duration-300 border-2 border-gray-800 rounded-xl hover:bg-gray-800 hover:text-white"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        Profile
                                    </Link>

                                    {/* Dashboard Button hanya untuk admin/super-admin */}
                                    {(['admin', 'super-admin'].includes(auth.user.roles[0]?.name)) && (
                                        <Link 
                                            href="/dashboard"
                                            className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition duration-300 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-900 hover:to-gray-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                                            </svg>
                                            Dashboard
                                        </Link>
                                    )}

                                    {/* Logout Button */}
                                    <button 
                                        onClick={handleLogout}
                                        className="flex items-center justify-center w-full px-4 py-3 font-medium text-white transition duration-300 bg-red-500 rounded-xl hover:bg-red-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                        </svg>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="grid gap-3">
                                        <Link 
                                            href={route('login')}
                                            className="flex items-center justify-center w-full px-4 py-3 font-medium text-gray-800 transition duration-300 border-2 border-gray-800 rounded-xl hover:bg-gray-800 hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                            </svg>
                                            Login
                                        </Link>

                                        <button
                                            onClick={() => setIsRegisterModalOpen(true)}
                                            className="flex items-center justify-center w-full px-4 py-3 font-medium text-gray-800 transition duration-300 border-2 border-gray-800 rounded-xl hover:bg-gray-800 hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                            </svg>
                                            Register
                                        </button>

                                        <Link 
                                            href="/cart"
                                            className="relative flex items-center justify-center w-full px-4 py-3 font-medium text-white transition duration-300 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-900 hover:to-gray-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                            </svg>
                                            Cart
                                            <span className="absolute flex items-center justify-center w-5 h-5 text-xs bg-red-500 rounded-full -top-2 -right-2">
                                                0
                                            </span>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <RegisterModal 
                isOpen={isRegisterModalOpen}
                closeModal={() => setIsRegisterModalOpen(false)}
            />

            {/* Tambahkan style untuk animasi */}
            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-pulse {
                    animation: pulse 2s infinite;
                }
                .dropdown-content {
                    @apply invisible opacity-0 transition-all duration-300 transform scale-95 origin-top-right;
                }
                .dropdown.dropdown-open .dropdown-content,
                .dropdown:focus-within .dropdown-content {
                    @apply visible opacity-100 scale-100;
                }
            `}</style>
        </>
    );
};

export default Navbargabungan;
