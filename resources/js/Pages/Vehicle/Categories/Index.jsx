import React from "react";
import DataTable from "@/Components/molecules/DataTable";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { getAllQueryParams } from "@/utils";
import { Link, router } from "@inertiajs/react";
import {
    HiArrowRight,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";

export default function Index({ categories }) {
    const queryParams = getAllQueryParams();

    const handleSearch = (search) => {
        router.get(route("dashboard.vehicle-categories.index"), {
            ...queryParams,
            search: search,
        });
    };

    const handleDelete = (id) => {
        const confirmed = confirm("Are you sure you want to delete this data?");
        if (!confirmed) return;

        router.delete(route("dashboard.vehicle-categories.destroy", id));
    };

    const { data, ...pagination } = categories;

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Kategori Kendaraan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>Kategori Kendaraan</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <Link
                        href={route("dashboard.vehicle-categories.create")}
                        className="btn btn-primary btn-outline btn-sm"
                    >
                        Tambah Kategori
                    </Link>
                </div>
            </div>

            <DataTable
                title="Daftar Kategori"
                searchable
                handleSearch={handleSearch}
                columns={[
                    {
                        title: "No",
                        dataIndex: "no",
                        render: (_, index) => index + 1,
                    },
                    {
                        title: "Nama",
                        dataIndex: "name",
                        sorter: true,
                    },
                    {
                        title: "Slug",
                        dataIndex: "slug",
                    },
                    {
                        title: "Deskripsi",
                        dataIndex: "description",
                    },
                    {
                        title: "Aksi",
                        dataIndex: "action",
                        render: (_, __, record) => (
                            <div className="flex space-x-2">
                                <Link
                                    href={route("dashboard.vehicle-categories.edit", record.id)}
                                    className="btn btn-sm btn-primary"
                                >
                                    <HiOutlinePencilSquare />
                                </Link>
                                <button
                                    onClick={() => handleDelete(record.id)}
                                    className="btn btn-sm btn-error"
                                >
                                    <HiOutlineTrash />
                                </button>
                            </div>
                        ),
                    },
                ]}
                dataSource={data}
                pagination={pagination}
                handleSorterColumns={(column, direction) => {
                    router.get(route("dashboard.vehicle-categories.index"), {
                        ...queryParams,
                        sortField: column,
                        sortDirection: direction ? direction : "asc",
                    });
                }}
            />

            <div className="text-right">
                <Link
                    href={route("dashboard.vehicle-attributes.index")}
                    className="btn btn-link"
                >
                    <HiArrowRight />
                    Kelola Atribut Kendaraan
                </Link>
            </div>
        </DashboardLayout>
    );
} 