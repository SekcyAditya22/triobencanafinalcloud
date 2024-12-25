import { useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthLayout";
import FormInput from "@/Components/atoms/FormInput";

export default function RegisterCustomer() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "customer",
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
            title="Welcome Customer!"
            subtitle="Sign Up sebagai Customer dengan email dan password"
        >
            <Head title="Register Customer" />

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

                <div className="flex flex-col items-center justify-end gap-4 mt-4">
                    <button
                        className="w-full btn btn-primary"
                        disabled={processing}
                    >
                        Register sebagai Customer
                    </button>
                    <Link
                        href={route("login")}
                        className="text-sm text-gray-600 underline rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Already registered?
                    </Link>
                    <a
                        href={route('google.login.customer')}
                        className="flex items-center justify-center w-full gap-2 btn btn-outline"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            {/* ... SVG path ... */}
                        </svg>
                        Continue with Google as Customer
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
} 