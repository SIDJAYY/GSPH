<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class CreateCitizenUser extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = 'cj@gmail.com';
        $data = [
            'citizen_id' => 'CITIZEN-CJ-001',
            'email' => $email,
            'password' => Hash::make('password123'),
            'first_name' => 'CJ',
            'last_name' => 'User',
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ];

        $existing = User::where('email', $email)->first();
        if ($existing) {
            $existing->fill($data)->save();
        } else {
            User::create($data);
        }
    }
}



