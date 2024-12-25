import React from 'react';
import { Link } from '@inertiajs/react';
import { HiPencil } from "react-icons/hi2";
import { formatDate } from "@/utils";
import Navbargabungan from '@/Components/Navbargabungan';
import Footergabungan from '@/Components/Footergabungan';

export default function ShowProfile({ auth, user }) {
    const isCustomer = auth.user.roles[0]?.name === 'customer';

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                                <Link href="/" className="hover:text-gray-800">
                                    Home
                                </Link>
                                <span className="mx-2">/</span>
                                <span>Profile</span>
                            </div>
                        </div>
                        <div>
                            <Link href={isCustomer ? route('customer.profile.edit') : route('dashboard.profile.edit')}>
                                <button className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white transition duration-300 bg-gray-800 rounded-lg hover:bg-gray-700">
                                    <HiPencil className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                        <div className="p-6">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
                                <div className="flex-shrink-0">
                                    <img
                                        className="object-cover w-32 h-32 rounded-full ring-2 ring-gray-200"
                                        src={user.detail?.profile_picture ?? `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt={user.name}
                                    />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                                    <p className="text-gray-600">{user.email}</p>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Member since {formatDate(user.created_at)}
                                    </div>
                                    <div className="mt-2">
                                        <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                                            {user.roles[0]?.name.charAt(0).toUpperCase() + user.roles[0]?.name.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <th className="w-1/4 px-4 py-3 text-left text-gray-600">Name</th>
                                            <td className="px-4 py-3 text-gray-800">{user.name}</td>
                                        </tr>
                                        <tr>
                                            <th className="w-1/4 px-4 py-3 text-left text-gray-600">Email</th>
                                            <td className="px-4 py-3 text-gray-800">{user.email}</td>
                                        </tr>
                                        {user.detail && (
                                            <>
                                                {user.detail.phone && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">Phone Number</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.phone}</td>
                                                    </tr>
                                                )}

                                                {user.detail.ktp_number && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">No KTP</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.ktp_number.substring(0, user.detail.ktp_number.length - 4) + '*****'}</td>
                                                    </tr>
                                                )}

                                                
                                                
                                                {user.detail.province_name && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">Province</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.province_name}</td>
                                                    </tr>
                                                )}
                                                {user.detail.regency_name && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">Regency</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.regency_name}</td>
                                                    </tr>
                                                )}
                                                {user.detail.district_name && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">District</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.district_name}</td>
                                                    </tr>
                                                )}
                                                {user.detail.village_name && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">Village</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.village_name}</td>
                                                    </tr>
                                                )}
                                                {user.detail.address && (
                                                    <tr>
                                                        <th className="w-1/4 px-4 py-3 text-left text-gray-600">Address</th>
                                                        <td className="px-4 py-3 text-gray-800">{user.detail.address}</td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footergabungan />
        </div>
    );
}
