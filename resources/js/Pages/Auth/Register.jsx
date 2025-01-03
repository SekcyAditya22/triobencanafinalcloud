import { useEffect } from "react";
import InputError from "@/Components/Archived/InputError";
import InputLabel from "@/Components/Archived/InputLabel";
import PrimaryButton from "@/Components/Archived/PrimaryButton";
import TextInput from "@/Components/Archived/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthLayout";
import FormInput from "@/Components/atoms/FormInput";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "admin",
    });

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("register"));
    };

    return (
        <AuthLayout
            title="Welcome Admin!"
            subtitle="Sign Up sebagai Admin dengan email dan password"
        >
            <Head title="Register Admin" />

            <form onSubmit={submit}>
                <FormInput
                    label="Name"
                    value={data.name}
                    type="text"
                    name="name"
                    autoComplete="name"
                    error={errors.name}
                    onChange={(e) => setData("name", e.target.value)}
                />
                <FormInput
                    label="Email"
                    value={data.email}
                    type="email"
                    name="email"
                    autoComplete="email"
                    error={errors.email}
                    onChange={(e) => setData("email", e.target.value)}
                />

                <FormInput
                    label="Password"
                    value={data.password}
                    type="password"
                    name="password"
                    autoComplete="password"
                    error={errors.password}
                    onChange={(e) => setData("password", e.target.value)}
                />

                <FormInput
                    label="Confirm Password"
                    value={data.password_confirmation}
                    type="password"
                    name="password_confirmation"
                    autoComplete="password"
                    error={errors.password_confirmation}
                    onChange={(e) =>
                        setData("password_confirmation", e.target.value)
                    }
                />

                <div className="flex flex-col gap-4 items-center justify-end mt-4">
                    <button
                        className="btn btn-primary w-full"
                        disabled={processing}
                    >
                        Register sebagai Admin
                    </button>

                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <a
                        href={route('google.login.admin')}
                        className="btn btn-outline w-full flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google as Admin
                    </a>

                    <Link
                        href={route("login")}
                        className="underline text-sm text-gray-600 hover:text-gray-900"
                    >
                        Already registered?
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
