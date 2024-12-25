export default function AppLayout({ title, children }) {
    // ... existing code

    const navigation = [
        // ... existing navigation items
        {
            name: 'Kendaraan',
            icon: CarIcon, // Pastikan mengimport CarIcon dari heroicons
            children: [
                {
                    name: 'Kategori',
                    href: route('dashboard.vehicle-categories.index'),
                    can: 'view vehicle categories'
                },
                {
                    name: 'Atribut',
                    href: route('dashboard.vehicle-attributes.index'),
                    can: 'view vehicle attributes'
                }
            ]
        }
    ];

    // ... rest of the component
} 