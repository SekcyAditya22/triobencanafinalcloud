<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Permission::insert([
            [
                'name' => 'permission-view',
                'display_name' => 'Delete Media',
                'group_name' => 'Media',
                'guard_name' => 'web'
            ],
        ]);
    }
}
