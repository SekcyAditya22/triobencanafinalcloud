import FormInput from "@/Components/atoms/FormInput";
import FormSelect from "@/Components/atoms/FormSelect";
import MediaLibrary from "@/Components/organisms/MediaLibrary";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    getDistricts,
    getProvinces,
    getRegencies,
    getVillages,
} from "@/services/region.services";
import { Link, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { HiArrowUpTray } from "react-icons/hi2";

export default function EditProfile() {
    const page = usePage().props;
    const { user } = page;
    const { data, setData, patch, processing, errors } = useForm({
        profile_picture: user?.detail?.profile_picture ?? "https://ui-avatars.com/api/?name=" + user?.name,
        name: user?.name ?? "",
        email: user?.email ?? "",
        phone: user?.detail?.phone ?? "",
        address: user?.detail?.address ?? "",
        province_id: user?.detail?.province_id ?? "",
        regency_id: user?.detail?.regency_id ?? "",
        district_id: user?.detail?.district_id ?? "",
        village_id: user?.detail?.village_id ?? "",
    });

    const [provinces, setProvinces] = useState([]);
    const [regencies, setRegencies] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Load initial data
    useEffect(() => {
        getProvinces().then(res => setProvinces(res.data));
        
        if (data.province_id) {
            getRegencies(data.province_id).then(res => setRegencies(res.data));
        }
        
        if (data.regency_id) {
            getDistricts(data.regency_id).then(res => setDistricts(res.data));
        }
        
        if (data.district_id) {
            getVillages(data.district_id).then(res => setVillages(res.data));
        }
    }, []);

    // Handle province change
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setData(data => ({
            ...data,
            province_id: provinceId,
            regency_id: '',
            district_id: '',
            village_id: ''
        }));
        
        if (provinceId) {
            getRegencies(provinceId).then(res => setRegencies(res.data));
            setDistricts([]);
            setVillages([]);
        }
    };

    // Handle regency change
    const handleRegencyChange = (e) => {
        const regencyId = e.target.value;
        setData(data => ({
            ...data,
            regency_id: regencyId,
            district_id: '',
            village_id: ''
        }));
        
        if (regencyId) {
            getDistricts(regencyId).then(res => setDistricts(res.data));
            setVillages([]);
        }
    };

    // Handle district change
    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        setData(data => ({
            ...data,
            district_id: districtId,
            village_id: ''
        }));
        
        if (districtId) {
            getVillages(districtId).then(res => setVillages(res.data));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route("dashboard.profile.update"));
    };

    const handleConfirmMedia = (selectedMedia) => {
        setData("profile_picture", selectedMedia);
        const previewImage = document.getElementById('profile-preview');
        if (previewImage) {
            previewImage.src = selectedMedia;
        }

        // Tambahkan notifikasi yang lebih menarik
        const notification = document.createElement('div');
        notification.className = 'fixed z-50 top-4 right-4 animate-slide-in';
        notification.innerHTML = `
            <div class="alert alert-success shadow-lg flex items-centergap-2 min-w-[320px] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex flex-col">
                    <span class="font-bold">Berhasil!</span>
                    <span class="text-sm">Gambar berhasil dipilih, silahkan klik save untuk menerapkan.</span>
                </div>
                <button onclick="this.parentElement.remove()" class="btnbtn-ghost btn-sm">✕</button>
            </div>
        `;

        // Tambahkan style untuk animasi
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in {
                0% { transform: translateX(100%); opacity:0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out forwards;
            }
            @keyframes slide-out {
                0% { transform: translateX(0); opacity: 1;}
                100% { transform: translateX(100%);opacity: 0; }
            }
            .animate-slide-out {
                animation: slide-out 0.3s ease-in forwards;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Hapus notifikasi dengan animasi setelah3 detik
        setTimeout(() => {
            notification.classList.add('animate-slide-out');
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Edit Profile</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href={route("dashboard.profile.show")}>
                                    Profile
                                </Link>
                            </li>
                            <li>Edit Profile</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="page-section">
                <div className="page-section__header">
                    <h3 className="page-section__title">
                        Customize your profile
                    </h3>
                </div>
                <div className="page-section__body">
                    <form onSubmit={handleSubmit} className="p-4 form-wrapper">
                        <div style={{ marginLeft: '20px' }}>
                            <img
                                id="profile-preview"
                                className="object-cover w-32 h-32 rounded-full"
                                src={data.profile_picture ?? `https://ui-avatars.com/api/?name=${user.name}`}
                                alt={user.name}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                document
                                    .getElementById("media-library-modal")
                                    .showModal()
                            }
                            className="mt-4 btn btn-primary btn-outline"
                        >
                            <HiArrowUpTray />
                            Upload Your Photo
                        </button>
                        <div className="grid grid-cols-2 gap-5 my-3 space-y-1">
                            <div>
                                <FormInput
                                    label="Name"
                                    value={data.name}
                                    onChange={e => setData("name", e.target.value)}
                                    error={errors.name}
                                />
                                <FormInput
                                    label="Email Address"
                                    value={data.email}
                                    onChange={e => setData("email", e.target.value)}
                                    error={errors.email}
                                />
                                <FormInput
                                    label="Phone"
                                    value={data.phone}
                                    onChange={e => setData("phone", e.target.value)}
                                    error={errors.phone}
                                />
                            </div>
                            <div>
                                <FormInput
                                    label="Address"
                                    value={data.address}
                                    onChange={e => setData("address", e.target.value)}
                                    error={errors.address}
                                />
                                <div>
                                    <FormSelect
                                        label="Province"
                                        options={provinces.map(province => ({
                                            label: province.name,
                                            value: province.id,
                                        }))}
                                        value={data.province_id}
                                        onChange={handleProvinceChange}
                                        error={errors.province_id}
                                    />
                                    <FormSelect
                                        label="Regency"
                                        options={regencies.map(regency => ({
                                            label: regency.name,
                                            value: regency.id,
                                        }))}
                                        value={data.regency_id}
                                        onChange={handleRegencyChange}
                                        error={errors.regency_id}
                                    />
                                    <FormSelect
                                        label="District"
                                        options={districts.map(district => ({
                                            label: district.name,
                                            value: district.id,
                                        }))}
                                        value={data.district_id}
                                        onChange={handleDistrictChange}
                                        error={errors.district_id}
                                    />
                                    <FormSelect
                                        label="Village"
                                        options={villages.map(village => ({
                                            label: village.name,
                                            value: village.id,
                                        }))}
                                        value={data.village_id}
                                        onChange={e => setData("village_id", e.target.value)}
                                        error={errors.village_id}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <button className="btn btn-primary">Save</button>
                        </div>
                    </form>
                </div>
            </div>
            <MediaLibrary multiple={false} onConfirm={handleConfirmMedia} />
        </DashboardLayout>
    );
}
