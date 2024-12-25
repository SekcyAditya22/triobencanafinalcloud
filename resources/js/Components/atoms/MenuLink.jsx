import { Link, usePage } from "@inertiajs/react";
import React from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function MenuLink({ title, link, icon, items = [], isOpen, onMenuClick }) {
    const { url } = usePage();

    if (items.length > 0) {
        return (
            <li>
                <details open={isOpen} className="group">
                    <summary 
                        onClick={(e) => {
                            e.preventDefault();
                            onMenuClick?.();
                        }}
                        className="flex items-center justify-between px-3 py-2 text-gray-300 rounded-lg cursor-pointer hover:bg-[#2a2a3c] hover:text-white"
                    >
                        <div className="flex items-center">
                            {icon}
                            <span className="ml-3 font-medium">{title}</span>
                        </div>
                        <HiChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </summary>
                    <ul className="pl-6 mt-1 space-y-1">
                        {items.map((item, index) => {
                            const isActive = url.startsWith(item.link);
                            return (
                                <li key={`menu-item-${index}`}>
                                    <Link 
                                        href={item.link}
                                        className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                                            isActive 
                                                ? 'bg-[#2a2a3c] text-white font-medium' 
                                                : 'text-gray-300 hover:bg-[#2a2a3c] hover:text-white'
                                        }`}
                                    >
                                        <span className="ml-3">{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </details>
            </li>
        );
    }

    return (
        <li>
            <Link 
                href={link}
                className={`flex items-center px-3 py-2 rounded-lg ${
                    url === link 
                        ? 'bg-[#2a2a3c] text-white font-medium' 
                        : 'text-gray-300 hover:bg-[#2a2a3c] hover:text-white'
                }`}
            >
                {icon}
                <span className="ml-3">{title}</span>
            </Link>
        </li>
    );
}
