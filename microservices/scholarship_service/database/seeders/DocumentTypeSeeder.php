<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentType;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documentTypes = [
            // Personal Documents
            [
                'name' => 'Birth Certificate',
                'description' => 'PSA-authenticated birth certificate',
                'is_required' => true,
                'category' => 'personal',
                'is_active' => true,
            ],
            [
                'name' => 'Valid ID',
                'description' => 'Government-issued valid ID (Driver\'s License, Passport, etc.)',
                'is_required' => true,
                'category' => 'personal',
                'is_active' => true,
            ],
            [
                'name' => 'Passport Photo',
                'description' => '2x2 passport-sized photo (recent)',
                'is_required' => true,
                'category' => 'personal',
                'is_active' => true,
            ],
            [
                'name' => 'Barangay Certificate',
                'description' => 'Certificate of residency from barangay',
                'is_required' => true,
                'category' => 'personal',
                'is_active' => true,
            ],
            [
                'name' => 'PWD ID',
                'description' => 'Person with Disability ID (if applicable)',
                'is_required' => false,
                'category' => 'personal',
                'is_active' => true,
            ],
            [
                'name' => 'Solo Parent ID',
                'description' => 'Solo Parent ID (if applicable)',
                'is_required' => false,
                'category' => 'personal',
                'is_active' => true,
            ],

            // Academic Documents
            [
                'name' => 'High School Diploma',
                'description' => 'High school diploma or certificate of graduation',
                'is_required' => true,
                'category' => 'academic',
                'is_active' => true,
            ],
            [
                'name' => 'High School Transcript of Records',
                'description' => 'Official transcript of records from high school',
                'is_required' => true,
                'category' => 'academic',
                'is_active' => true,
            ],
            [
                'name' => 'College Transcript of Records',
                'description' => 'Official transcript of records from college/university',
                'is_required' => false,
                'category' => 'academic',
                'is_active' => true,
            ],
            [
                'name' => 'Certificate of Enrollment',
                'description' => 'Current certificate of enrollment',
                'is_required' => true,
                'category' => 'academic',
                'is_active' => true,
            ],
            [
                'name' => 'Certificate of Good Moral Character',
                'description' => 'Certificate of good moral character from school',
                'is_required' => true,
                'category' => 'academic',
                'is_active' => true,
            ],
            [
                'name' => 'Admission Test Result',
                'description' => 'College admission test result',
                'is_required' => false,
                'category' => 'academic',
                'is_active' => true,
            ],

            // Financial Documents
            [
                'name' => 'Income Tax Return (ITR)',
                'description' => 'Latest income tax return of parents/guardian',
                'is_required' => true,
                'category' => 'financial',
                'is_active' => true,
            ],
            [
                'name' => 'Certificate of Employment',
                'description' => 'Certificate of employment and compensation from employer',
                'is_required' => false,
                'category' => 'financial',
                'is_active' => true,
            ],
            [
                'name' => 'Certificate of No Income',
                'description' => 'Certificate of no income (if unemployed)',
                'is_required' => false,
                'category' => 'financial',
                'is_active' => true,
            ],
            [
                'name' => 'Bank Statement',
                'description' => 'Bank statement for the last 3 months',
                'is_required' => false,
                'category' => 'financial',
                'is_active' => true,
            ],
            [
                'name' => '4Ps Certificate',
                'description' => 'Pantawid Pamilyang Pilipino Program certificate (if applicable)',
                'is_required' => false,
                'category' => 'financial',
                'is_active' => true,
            ],

            // Other Documents
            [
                'name' => 'Medical Certificate',
                'description' => 'Medical certificate from licensed physician',
                'is_required' => false,
                'category' => 'other',
                'is_active' => true,
            ],
            [
                'name' => 'Police Clearance',
                'description' => 'Police clearance certificate',
                'is_required' => false,
                'category' => 'other',
                'is_active' => true,
            ],
            [
                'name' => 'NBI Clearance',
                'description' => 'National Bureau of Investigation clearance',
                'is_required' => false,
                'category' => 'other',
                'is_active' => true,
            ],
            [
                'name' => 'Voter\'s ID',
                'description' => 'Voter\'s identification card',
                'is_required' => false,
                'category' => 'other',
                'is_active' => true,
            ],
        ];

        foreach ($documentTypes as $documentTypeData) {
            DocumentType::create($documentTypeData);
        }
    }
}
