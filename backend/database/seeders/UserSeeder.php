<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::ADMIN,
        ]);

        User::create([
            'name' => 'Helpdesk Agent',
            'email' => 'agent@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::HELPDESK_AGENT,
        ]);

        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);

        User::create([
            'name' => 'Alice Johnson',
            'email' => 'alice@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);

        User::create([
            'name' => 'Bob Smith',
            'email' => 'bob@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);

        User::create([
            'name' => 'Carol Williams',
            'email' => 'carol@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);

        User::create([
            'name' => 'David Brown',
            'email' => 'david@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);

        User::create([
            'name' => 'Emma Davis',
            'email' => 'emma@example.com',
            'password' => Hash::make('SecurePassword123!'),
            'role' => UserRole::USER,
        ]);
    }
}