import MenuLink from "@/Components/atoms/MenuLink";
import { Link, router, usePage, Head } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { 
    HiOutlineHome, 
    HiOutlineUser, 
    HiOutlineUsers, 
    HiOutlineTruck, 
    HiOutlineCog,
    HiOutlineClipboardList,
    HiOutlineClipboardCheck
} from "react-icons/hi";
import { BiBuildingHouse } from "react-icons/bi";
import { toast } from "sonner";
import { BsCardImage } from "react-icons/bs";
import { Toaster } from 'react-hot-toast';
import FloatingChat from '@/Components/FloatingChat';

export default function DashboardLayout({ children }) {
    const { flash, auth } = usePage().props;
    const [openMenus, setOpenMenus] = useState(() => {
        const stored = localStorage.getItem('openMenus');
        return stored ? JSON.parse(stored) : {};
    });

    console.log('Auth data:', auth);
    console.log('User roles:', auth.user?.roles);

    const hasAdminAccess = () => {
        return auth.user.roles.some(
            (role) => role.name === "super-admin" || role.name === "admin"
        );
    };

    const handleMenuClick = (menuTitle) => {
        const newOpenMenus = { ...openMenus };
        
        if (newOpenMenus[menuTitle]) {
            delete newOpenMenus[menuTitle];
        } else {
            newOpenMenus[menuTitle] = true;
        }

        setOpenMenus(newOpenMenus);
        localStorage.setItem('openMenus', JSON.stringify(newOpenMenus));
    };

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const { pathname } = window.location;
        const newOpenMenus = { ...openMenus };
        
        if (Object.keys(newOpenMenus).length === 0) {
            if (pathname.includes('/dashboard/users') || 
                pathname.includes('/dashboard/roles') || 
                pathname.includes('/dashboard/permissions')) {
                newOpenMenus['Authentication'] = true;
            } 
            if (pathname.includes('/dashboard/vehicle-categories') || 
                pathname.includes('/dashboard/vehicle-attributes')) {
                newOpenMenus['KendaraanAdmin'] = true;
            }
            if (pathname.includes('/dashboard/kendaraan')) {
                newOpenMenus['KendaraanUser'] = true;
            }

            setOpenMenus(newOpenMenus);
            localStorage.setItem('openMenus', JSON.stringify(newOpenMenus));
        }
    }, []);

    const isAdmin = () => {
        return auth.user.roles.some(role => role.name === "admin");
    };

    return (
        <>
            <Head>
                <meta name="csrf-token" content={usePage().props.csrf_token} />
            </Head>
            <div className="min-h-screen bg-gray-100">
                <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md navbar">
                    <div className="flex-1">
                        <a className="text-xl font-bold text-primary btn btn-ghost">Trio Bencana</a>
                    </div>
                    <div className="flex-none">
                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-ghost btn-circle avatar"
                            >
                                <div className="w-10 rounded-full ring ring-primary ring-offset-2">
                                    <img
                                        alt="User Avatar"
                                        src={
                                            auth?.user?.detail?.profile_picture ??
                                            "https://ui-avatars.com/api/?name=" +
                                                auth?.user?.name
                                        }
                                    />
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                <li>
                                    <Link
                                        href={route("dashboard.profile.show")}
                                        className="justify-between"
                                    >
                                        Profile
                                        
                                        <span className="badge">Edit</span> 
                                    </Link>
                                </li>

                                <li>
                                    <a onClick={() => router.post(route("logout"))}>
                                        Logout
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </header>

                <aside className="fixed top-0 left-0 z-50 flex flex-col h-full bg-[#1e1e2d] w-[250px]">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                                <span className="text-lg font-bold text-[#1e1e2d]">TB</span>
                            </div>
                            <a className="text-xl font-bold text-white">Trio Bencana</a>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#1e1e2d]">
                        <div className="p-4">
                            <div className="mb-4">
                                <div className="px-3 mb-2 text-xs font-semibold tracking-wider uppercase text-white/60">
                                    Menu Utama
                                </div>
                                <ul className="space-y-1">
                                    <MenuLink
                                        icon={<HiOutlineHome className="w-5 h-5" />}
                                        link="/dashboard"
                                        title="Dashboard"
                                    />
                                    <MenuLink
                                        icon={<HiOutlineCog className="w-5 h-5" />}
                                        link="/dashboard/profile"
                                        title="Profile"
                                    />
                                    <MenuLink
                                        icon={<BiBuildingHouse className="w-5 h-5" />}
                                        link="/dashboard/content"
                                        title="Pemilik"
                                    />
                                </ul>
                            </div>

                            {hasAdminAccess() && (
                                <div className="mb-4">
                                    <div className="px-3 mb-2 text-xs font-semibold tracking-wider uppercase text-white/60">
                                        Transaksi
                                    </div>
                                    <ul className="space-y-1">
                                        {auth.user.roles.some(role => role.name === "super-admin") && (
                                            <>
                                                <MenuLink
                                                    icon={<HiOutlineClipboardCheck className="w-5 h-5" />}
                                                    link={route("dashboard.admin-transactions")}
                                                    title="Persetujuan Admin"
                                                />
                                                <MenuLink
                                                    icon={<HiOutlineClipboardList className="w-5 h-5" />}
                                                    link={route("dashboard.customer-transactions")}
                                                    title="Transaksi Customer"
                                                />
                                            </>
                                        )}
                                        {auth.user.roles.some(role => role.name === "admin") && (
                                            <>
                                                <MenuLink
                                                    icon={<HiOutlineClipboardList className="w-5 h-5" />}
                                                    link={route("dashboard.admin-transactions")}
                                                    title="Permohonan Akses"
                                                />
                                                <MenuLink
                                                    icon={<HiOutlineClipboardList className="w-5 h-5" />}
                                                    link={route("dashboard.customer-transactions")}
                                                    title="Transaksi Customer"
                                                />
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="mb-4">
                                <div className="px-3 mb-2 text-xs font-semibold tracking-wider uppercase text-white/60">
                                    Kendaraan
                                </div>
                                <ul className="space-y-1">
                                    <MenuLink
                                        icon={<HiOutlineTruck className="w-5 h-5" />}
                                        title="Kendaraan"
                                        isOpen={openMenus['KendaraanUser']}
                                        onMenuClick={() => handleMenuClick("KendaraanUser")}
                                        items={[
                                            {
                                                link: route("dashboard.kendaraan.index"),
                                                title: "Daftar Kendaraan",
                                            },
                                            {
                                                link: route("dashboard.kendaraan.create"),
                                                title: "Tambah Kendaraan",
                                            },
                                        ]}
                                    />
                                </ul>
                            </div>

                            {auth.user.roles.some(role => role.name === "super-admin") && (
                                <div className="mb-4">
                                    <div className="px-3 mb-2 text-xs font-semibold tracking-wider uppercase text-white/60">
                                        Admin Area
                                    </div>
                                    <ul className="space-y-1">
                                        <MenuLink
                                            icon={<HiOutlineUsers className="w-5 h-5" />}
                                            title="Authentication"
                                            isOpen={openMenus['Authentication']}
                                            onMenuClick={() => handleMenuClick("Authentication")}
                                            items={[
                                                {
                                                    link: route("dashboard.users"),
                                                    title: "All Users",
                                                },
                                                {
                                                    link: "/dashboard/roles",
                                                    title: "Roles",
                                                },
                                                {
                                                    link: "/dashboard/permissions",
                                                    title: "Permissions",
                                                },
                                            ]}
                                        />
                                        <MenuLink
                                            icon={<HiOutlineTruck className="w-5 h-5" />}
                                            title="Kendaraan Management"
                                            isOpen={openMenus['KendaraanAdmin']}
                                            onMenuClick={() => handleMenuClick("KendaraanAdmin")}
                                            items={[
                                                {
                                                    link: route("dashboard.vehicle-categories.index"),
                                                    title: "Kategori Kendaraan",
                                                },
                                                {
                                                    link: route("dashboard.vehicle-attributes.index"),
                                                    title: "Atribut Kendaraan",
                                                },
                                            ]}
                                        />
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <div className="main-content w-full pl-[250px] pt-[90px] bg-gray-50">
                    <div className="p-6 custom-container space-y-4 min-h-[100vh]">
                        {children}
                    </div>
                </div>

                {isAdmin() && <FloatingChat isAdmin={true} adminId={auth.user.id} />}
            </div>
            <Toaster />
        </>
    );
}
