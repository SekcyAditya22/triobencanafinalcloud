<?php

namespace Database\Seeders;

use App\Models\Content;
use Illuminate\Database\Seeder;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            [
                'title' => 'Konten Keempat',
                'description' => 'Ini adalah deskripsi konten keempat',
                'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                'user_id' => 14,
                'status' => 'published',
            ],
        ];

        foreach ($contents as $content) {
            Content::create($content);
        }
    }
} 