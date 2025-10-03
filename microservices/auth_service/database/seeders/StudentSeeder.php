<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\User;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the test student user
        $user = User::where('email', 'student@example.com')->first();
        
        if ($user) {
            Student::create([
                'citizen_id' => 'CITIZEN-001',
                'user_id' => $user->id,
                'student_id_number' => '2024-001',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'middle_name' => 'Cruz',
                'sex' => 'Female',
                'civil_status' => 'Single',
                'nationality' => 'Filipino',
                'birth_place' => 'Caloocan City',
                'birth_date' => '2000-05-15',
                'is_pwd' => false,
                'religion' => 'Catholic',
                'height_cm' => 160.50,
                'weight_kg' => 55.00,
                'contact_number' => '09123456789',
                'email_address' => 'student@example.com',
                'is_employed' => false,
                'is_job_seeking' => false,
                'is_currently_enrolled' => true,
                'is_graduating' => false,
                'is_solo_parent' => false,
                'is_indigenous_group' => false,
                'is_registered_voter' => true,
                'voter_nationality' => 'Filipino',
                'has_paymaya_account' => true,
                'preferred_mobile_number' => '09123456789',
            ]);
        }
    }
}
