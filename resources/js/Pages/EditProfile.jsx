import React, { useEffect, useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { HiArrowUpTray } from "react-icons/hi2";
import Navbargabungan from '@/Components/Navbargabungan';
import Footergabungan from '@/Components/Footergabungan';
import MediaLibrary from "@/Components/organisms/MediaLibrary";
import FormInput from "@/Components/atoms/FormInput";
import FormSelect from "@/Components/atoms/FormSelect";
import {
    getDistricts,
    getProvinces,
    getRegencies,
    getVillages,
} from "@/services/region.services";
import KTPUploader from "@/Components/atoms/KTPUploader";

export default function EditProfile({ auth, user }) {
    const { data, setData, patch, processing, errors } = useForm({
        profile_picture: user?.detail?.profile_picture ?? `https://ui-avatars.com/api/?name=${user?.name}`,
        ktp_picture: user?.detail?.ktp_picture ?? null,
        ktp_number: user?.detail?.ktp_number ?? "",
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

    // Handle region changes
    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setData(data => ({
            ...data,
            province_id: provinceId,
            regency_id: '',
            district_id: '',
            village_id: ''
        }));
        
        if (provinceId) {
            const response = await getRegencies(provinceId);
            setRegencies(response.data);
            setDistricts([]);
            setVillages([]);
        }
    };

    const handleRegencyChange = async (e) => {
        const regencyId = e.target.value;
        setData(data => ({
            ...data,
            regency_id: regencyId,
            district_id: '',
            village_id: ''
        }));
        
        if (regencyId) {
            const response = await getDistricts(regencyId);
            setDistricts(response.data);
            setVillages([]);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        setData(data => ({
            ...data,
            district_id: districtId,
            village_id: ''
        }));
        
        if (districtId) {
            const response = await getVillages(districtId);
            setVillages(response.data);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);
        patch(route("customer.profile.update"));
    };

    const handleConfirmMedia = (selectedMedia) => {
        setData("profile_picture", selectedMedia);
        const previewImage = document.getElementById('profile-preview');
        if (previewImage) {
            previewImage.src = selectedMedia;
        }

        // Tambahkan notifikasi
        const notification = document.createElement('div');
        notification.className = 'fixed z-50 top-4 right-4 animate-slide-in';
        notification.innerHTML = `
            <div class="alert alert-success shadow-lg flex items-center gap-2 min-w-[320px] transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="flex flex-col">
                    <span class="font-bold">Berhasil!</span>
                    <span class="text-sm">Gambar berhasil dipilih, silahkan klik save untuk menerapkan.</span>
                </div>
                <button onclick="this.parentElement.remove()" class="btn btn-ghost btn-sm">✕</button>
            </div>
        `;

        // Style untuk animasi
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slide-in {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out forwards;
            }
            @keyframes slide-out {
                0% { transform: translateX(0); opacity: 1; }
                100% { transform: translateX(100%); opacity: 0; }
            }
            .animate-slide-out {
                animation: slide-out 0.3s ease-in forwards;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Hapus notifikasi setelah 3 detik
        setTimeout(() => {
            notification.classList.add('animate-slide-out');
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbargabungan auth={auth} />
            
            <div className="min-h-screen pt-20 pb-10 bg-gray-50">
                <div className="container px-4 mx-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
                            <div className="flex items-center mt-2 text-sm text-gray-600">
                                <Link href="/" className="hover:text-gray-800">Home</Link>
                                <span className="mx-2">/</span>
                                <Link href={route('customer.profile.show')} className="hover:text-gray-800">Profile</Link>
                                <span className="mx-2">/</span>
                                <span>Edit Profile</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="overflow-hidden bg-white shadow-lg rounded-xl">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Picture Section */}
                                <div className="flex flex-col items-center space-y-4">
                                    <img
                                        id="profile-preview"
                                        className="object-cover w-32 h-32 rounded-full ring-2 ring-gray-200"
                                        src={data.profile_picture}
                                        alt={user.name}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById("media-library-modal").showModal()}
                                        className="inline-flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 transition duration-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        <HiArrowUpTray className="w-5 h-5" />
                                        <span>Upload Photo</span>
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                        <FormInput
                                            label="Nomor KTP"
                                            value={data.ktp_number}
                                            onChange={e => setData("ktp_number", e.target.value)}
                                            error={errors.ktp_number}
                                            placeholder="Masukkan 16 digit nomor KTP"
                                            maxLength={16}
                                        />
                                        
                                        <KTPUploader 
                                            onImageSelected={(url) => setData('ktp_picture', url)}
                                            initialPreview={data.ktp_picture}
                                        />
                                        
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

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <FormInput
                                            label="Address"
                                            value={data.address}
                                            onChange={e => setData("address", e.target.value)}
                                            error={errors.address}
                                            type="textarea"
                                        />
                                        
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

                                {/* Submit Button */}
                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="btn btn-primary"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footergabungan />
            <MediaLibrary multiple={false} onConfirm={handleConfirmMedia} />
        </div>
    );
}
