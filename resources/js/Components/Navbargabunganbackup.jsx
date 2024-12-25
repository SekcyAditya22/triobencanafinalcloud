import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import './Navbargabungan.css';
import RegisterModal from '@/Components/RegisterModal';

const Navbargabungan = ({ auth }) => {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light sticky-top custom-navbar">
                <div className="container">
                    <Link className="px-2 navbar-brand fw-bold fs-4 d-flex align-items-center" href="/">
                        <img 
                            src="/assets/p.png"
                            alt="Logo" 
                            height="40" 
                            className="d-inline-block me-2"
                            style={{ objectFit: "contain" }}
                        />
                        <span className="brand-text">Trio Bencana</span>
                    </Link>
                    
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarSupportedContent" 
                        aria-controls="navbarSupportedContent" 
                        aria-expanded="false" 
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="mx-auto mb-2 navbar-nav mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" href="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href="/product">Rental</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href="/about">About</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href="/contact">Contact</Link>
                            </li>
                        </ul>
                        <div className="flex-wrap buttons d-flex justify-content-center">
                            {auth?.user ? (
                                <Link 
                                    href="/dashboard" 
                                    className="mb-2 btn custom-btn-cart mb-lg-0"
                                >
                                    <i className="fa fa-tachometer-alt me-1"></i> Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="mb-2 btn custom-btn me-2 mb-lg-0">
                                        <i className="fa fa-sign-in-alt me-1"></i> Login
                                    </Link>
                                    <button 
                                        onClick={() => setIsRegisterModalOpen(true)} 
                                        className="mb-2 btn custom-btn me-2 mb-lg-0"
                                    >
                                        <i className="fa fa-user-plus me-1"></i> Register
                                    </button>
                                    <Link href="/cart" className="mb-2 btn custom-btn-cart mb-lg-0">
                                        <i className="fa fa-cart-shopping me-1"></i> Cart 
                                    </Link>
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
        </>
    );
}

export default Navbargabungan;
