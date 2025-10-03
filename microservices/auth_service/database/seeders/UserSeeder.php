<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'citizen_id' => 'ADMIN-001',
            'email' => 'admin@caloocan.gov.ph',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create staff user
        User::create([
            'citizen_id' => 'STAFF-001',
            'email' => 'staff@caloocan.gov.ph',
            'password' => Hash::make('staff123'),
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'M',
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create test student user
        User::create([
            'citizen_id' => 'CITIZEN-001',
            'email' => 'student@example.com',
            'password' => Hash::make('student123'),
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'middle_name' => 'Cruz',
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}