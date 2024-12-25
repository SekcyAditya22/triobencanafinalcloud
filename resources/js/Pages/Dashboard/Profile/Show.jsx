import DashboardLayout from "@/Layouts/DashboardLayout";
import { Link, usePage } from "@inertiajs/react";
import { HiPencil } from "react-icons/hi2";
import { formatDate } from "@/utils";

export default function Show({ auth, user }) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Profile</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>Profile</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <Link href={route("dashboard.profile.edit")}>
                        <button className="inline-flex items-center gap-2 btn btn-primary btn-outline btn-sm">
                            <HiPencil className="w-4 h-4" />
                            Edit Profile
                        </button>
                    </Link>
                </div>
            </div>

            <div className="shadow-xl card bg-base-100">
                <div className="card-body">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex-shrink-0">
                            <img
                                className="object-cover w-32 h-32 rounded-full"
                                src={user.detail?.profile_picture ?? `https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                            />
                        </div>
                        <div>
                            <h2 className="card-title">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <th className="w-1/4">Name</th>
                                    <td>{user.name}</td>
                                </tr>
                                <tr>
                                    <th className="w-1/4">Email</th>
                                    <td>{user.email}</td>
                                </tr>
                                {user.detail && (
                                    <>
                                        {user.detail.phone && (
                                            <tr>
                                                <th className="w-1/4">No. Telp</th>
                                                <td>{user.detail.phone}</td>
                                            </tr>
                                        )}
                                        
                                        {user.detail.province_name && (
                                            <tr>
                                                <th className="w-1/4">Province</th>
                                                <td>{user.detail.province_name}</td>
                                            </tr>
                                        )}
                                        {user.detail.regency_name && (
                                            <tr>
                                                <th className="w-1/4">Regency</th>
                                                <td>{user.detail.regency_name}</td>
                                            </tr>
                                        )}
                                        {user.detail.district_name && (
                                            <tr>
                                                <th className="w-1/4">District</th>
                                                <td>{user.detail.district_name}</td>
                                            </tr>
                                        )}
                                        {user.detail.village_name && (
                                            <tr>
                                                <th className="w-1/4">Village</th>
                                                <td>{user.detail.village_name}</td>
                                            </tr>
                                        )}
                                        {user.detail.address && (
                                            <tr>
                                                <th className="w-1/4">Address</th>
                                                <td>{user.detail.address}</td>
                                            </tr>
                                        )}
                                    
                                        <tr>
                                            <th className="w-1/4">Joined Date</th>
                                            <td>{formatDate(user.created_at)}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
} 