import React from 'react';
import { Link, Head } from "@inertiajs/react";


const DashboardLayoutUser = () => {
  return (
    <div className="nav-section nav-fixed">
      {/* Top Bar */}
      <div className="nav-main-topbar">
        <div className="nav-topbar" style={{maxWidth: '1138px', padding: '0'}}>
          <div className="nav-topbar-left">
            <a href="/app" className="nav-topbar-url">
              <img 
                alt="Icon Smartphone"
                src="/general/img/pictures/navbar/ic_smartphone.svg"
              />
              <span className="nav-topbar-label">Download App</span>
            </a>
            <a href="/booking" className="nav-topbar-url">
              <img
                alt="Icon Sewa Kos" 
                src="/general/img/pictures/navbar/ic_calendar.svg"
              />
              <span className="nav-topbar-label">Sewa Kos</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-main-container">
        <div className="nav-container" style={{maxWidth: '1138px', padding: '0'}}>
          <a href="/" className="nav-brand">
            <img
              title="Mamikos"
              src="/assets/logo/svg/logo_mamikos_green_v2.svg"
              alt="Mamikos Logo"
              className="nav-brand-img"
            />
          </a>

          <nav id="globalNavbar" className="nav-main-navbar">
            <ul className="nav-main-ul">
              {/* Cari Apa Dropdown */}
              <div className="nav-main-li bg-c-dropdown">
                <div role="button" className="bg-c-dropdown__trigger">
                  <div className="nav-main-link">
                    Cari Apa?
                    <svg role="img" className="nav-main-link__trigger-icon bg-c-icon bg-c-icon--xs">
                      <title>dropdown-down</title>
                      <use href="#basic-dropdown-down" />
                    </svg>
                  </div>
                </div>
                {/* Dropdown Menu Items */}
                <DropdownMenu />
              </div>

              {/* Navigation Links */}
              <NavigationLinks />

              {/* User Profile Dropdown */}
              <UserProfileDropdown />
            </ul>
          </nav>

          <span className="overlay-background" />
        </div>
      </div>
    </div>
  );
};

// Component untuk Dropdown Menu
const DropdownMenu = () => {
  return (
    <div className="bg-c-dropdown__menu bg-c-dropdown__menu--fixed bg-c-dropdown__menu--text-lg">
      <ul>
        <DropdownItem 
          href="/cari"
          icon="bed"
          title="Kos"
        />
        <DropdownItem 
          href="/kos/singgahsini"
          imgSrc="/general/img/logo/icon-singgahsini.svg"
          title="Kos Singgahsini & Apik"
        />
        <DropdownItem 
          href="/kos/andalan"
          imgSrc="/general/img/logo/icon-kos-andalan.svg"
          title="Kos Andalan"
        />
        <DropdownItem 
          href="/apartemen"
          icon="apartment"
          title="Apartemen"
        />
      </ul>
    </div>
  );
};

// Component untuk Navigation Links
const NavigationLinks = () => {
  return (
    <>
      <li className="nav-main-li">
        <a href="/history/favourite?nav-source=homepage" className="nav-main-link">
          Favorit
        </a>
      </li>
      <li className="nav-main-li">
        <a href="#" className="nav-main-link">
          Chat
          <div className="floating-label outline" style={{top: '11px', right: '-10px'}}>
            1
          </div>
        </a>
      </li>
      {/* Notification Center dan Menu Lainnya bisa ditambahkan di sini */}
    </>
  );
};

// Component untuk User Profile Dropdown
const UserProfileDropdown = () => {
  return (
    <div className="user-profile-dropdown bg-c-dropdown">
      <div role="button" className="bg-c-dropdown__trigger">
        <div className="user-profile-dropdown__trigger">
          <div className="bg-c-avatar bg-c-avatar--sm">
            <img 
              src="https://static.mamikos.com/uploads/cache/data/user/2024-11-30/HnU8WKcC-240x320.jpg"
              alt="User Photo"
              className="bg-c-avatar__image"
            />
          </div>
          <span 
            className="bg-c-red-dot user-profile-dropdown__red-dot"
            data-testid="navbarRedDot-avatar"
            style={{position: 'absolute', top: 0, right: 2}}
          />
        </div>
      </div>
      {/* Profile Dropdown Menu */}
      <ProfileDropdownMenu />
    </div>
  );
};

export default DashboardLayoutUser;