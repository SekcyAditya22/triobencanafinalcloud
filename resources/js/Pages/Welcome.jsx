import { Link, Head } from "@inertiajs/react";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Cari Kost" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
                <div className="relative min-h-screen">
                    {/* Header/Navbar */}
                    <header className="fixed z-50 w-full bg-white shadow-md dark:bg-zinc-900">
                        <div className="px-6 mx-auto max-w-7xl">
                            <div className="flex items-center justify-between h-16">
                                {/* Logo */}
                                <div className="flex items-center">
                                    <Link href="/" className="text-2xl font-bold text-[#FF2D20]">
                                        KostKita
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Hero Section */}
                    <div className="pt-16">
                        <div className="relative bg-gradient-to-r from-[#FF2D20] to-[#FF6B6B] py-32">
                            <div className="px-6 mx-auto max-w-7xl">
                                <div className="text-center text-white">
                                    <h1 className="mb-4 text-4xl font-bold">
                                        Temukan Kost Impianmu
                                    </h1>
                                    <p className="mb-8 text-lg">
                                        Cari kost yang sesuai dengan kebutuhanmu dengan mudah
                                    </p>

                                    {/* Search Bar */}
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex gap-4 p-4 bg-white rounded-lg shadow-lg">
                                            <input
                                                type="text"
                                                placeholder="Masukkan lokasi atau nama kost..."
                                                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF2D20] text-gray-800"
                                            />
                                            <button className="px-6 py-2 bg-[#FF2D20] text-white rounded-md hover:bg-[#FF2D20]/90 transition">
                                                Cari
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Featured Sections */}
                        <div className="px-6 py-16 mx-auto max-w-7xl">
                            <h2 className="mb-8 text-2xl font-semibold text-black dark:text-white">
                                Area Populer
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {['Jakarta', 'Bandung', 'Surabaya'].map((city) => (
                                    <div key={city} className="p-6 transition bg-white rounded-lg shadow-md hover:shadow-lg dark:bg-zinc-900">
                                        <h3 className="mb-2 text-xl font-semibold text-black dark:text-white">
                                            Kost {city}
                                        </h3>
                                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                                            Temukan kost nyaman di {city}
                                        </p>
                                        <Link
                                            href={`/search?city=${city}`}
                                            className="text-[#FF2D20] hover:underline"
                                        >
                                            Lihat Semua
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="bg-white border-t dark:bg-zinc-900 dark:border-zinc-800">
                        <div className="px-6 py-8 mx-auto max-w-7xl">
                            <div className="text-sm text-center text-gray-500">
                                <p>© 2024 KostKita. All rights reserved.</p>
                                <p className="mt-2">
                                    Laravel v{laravelVersion} (PHP v{phpVersion})
                                </p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
