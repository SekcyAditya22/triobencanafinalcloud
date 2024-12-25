import React from "react";
import DataTable from "@/Components/molecules/DataTable";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { getAllQueryParams } from "@/utils";
import { Link, router } from "@inertiajs/react";
import {
    HiArrowLeft,
    HiOutlinePencilSquare,
    HiOutlineTrash,
} from "react-icons/hi2";

export default function Index({ attributes }) {
    const queryParams = getAllQueryParams();

    const handleSearch = (search) => {
        router.get(route("dashboard.vehicle-attributes.index"), {
            ...queryParams,
            search: search,
        });
    };

    const handleDelete = (id) => {
        const confirmed = confirm("Apakah Anda yakin ingin menghapus data ini?");
        if (!confirmed) return;

        router.delete(route("dashboard.vehicle-attributes.destroy", id));
    };

    const { data, ...pagination } = attributes;

    const getTypeLabel = (type) => {
        const labels = {
            text: 'Text',
            number: 'Number',
            select: 'Select',
            boolean: 'Yes/No'
        };
        return labels[type] || type;
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 page-title">Atribut Kendaraan</h1>
                    <div className="text-sm breadcrumbs">
                        <ul>
                            <li>
                                <Link href={route("dashboard.index")}>
                                    Dashboard
                                </Link>
                            </li>
                            <li>Atribut Kendaraan</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <Link
                        href={route("dashboard.vehicle-attributes.create")}
                        className="btn btn-primary btn-outline btn-sm"
                    >
                        Tambah Atribut
                    </Link>
                </div>
            </div>

            <DataTable
                title="Daftar Atribut"
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
                        title: "Tipe",
                        dataIndex: "type",
                        render: (type) => getTypeLabel(type),
                        sorter: true,
                    },
                    {
                        title: "Wajib Diisi",
                        dataIndex: "required",
                        render: (required) => required ? "Ya" : "Tidak",
                    },
                    {
                        title: "Pilihan",
                        dataIndex: "options",
                        render: (options) => options ? options.join(", ") : "-",
                    },
                    {
                        title: "Kategori",
                        dataIndex: "category",
                        render: (_, __, record) => record.category?.name || '-',
                        sorter: true,
                    },
                    {
                        title: "Aksi",
                        dataIndex: "action",
                        render: (_, __, record) => (
                            <div className="flex space-x-2">
                                <Link
                                    href={route(
                                        "dashboard.vehicle-attributes.edit",
                                        record.id
                                    )}
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
                    router.get(route("dashboard.vehicle-attributes.index"), {
                        ...queryParams,
                        sortField: column,
                        sortDirection: direction ? direction : "asc",
                    });
                }}
            />

            <div className="text-right">
                <Link
                    href={route("dashboard.vehicle-categories.index")}
                    className="btn btn-link"
                >
                    <HiArrowLeft />
                    Kembali ke Kategori
                </Link>
            </div>
        </DashboardLayout>
    );
} 