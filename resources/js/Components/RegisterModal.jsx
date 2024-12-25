import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { router } from '@inertiajs/react';

export default function RegisterModal({ isOpen, closeModal }) {
    const handleRegisterChoice = (type) => {
        closeModal();
        if (type === 'admin') {
            router.get(route('register'));
        } else {
            router.get(route('register.customer'));
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-zinc-800">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                >
                                    Pilih Tipe Registrasi
                                </Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <button
                                        className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                                        onClick={() => handleRegisterChoice('admin')}
                                    >
                                        <div className="font-semibold text-gray-900 dark:text-white">Register sebagai Admin</div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Untuk pemilik kost yang ingin mendaftarkan kostnya</p>
                                    </button>
                                    
                                    <button
                                        className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                                        onClick={() => handleRegisterChoice('customer')}
                                    >
                                        <div className="font-semibold text-gray-900 dark:text-white">Register sebagai Customer</div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Untuk pencari kost yang ingin menyewa</p>
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
} 