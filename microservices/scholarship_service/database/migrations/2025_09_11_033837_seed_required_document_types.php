<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert required document types for scholarship applications
        $documentTypes = [
            [
                'name' => 'Transcript of Records (Latest)',
                'description' => 'Official transcript showing your latest academic performance and grades',
                'category' => 'academic',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Certificate of Good Moral',
                'description' => 'Certificate from your school confirming your good moral character',
                'category' => 'academic',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Income Certificate',
                'description' => 'Official document showing your family\'s income status from BIR or barangay',
                'category' => 'financial',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Barangay Certificate',
                'description' => 'Certificate from your barangay confirming your residency',
                'category' => 'personal',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Valid ID (Government-issued)',
                'description' => 'Government-issued identification document (Driver\'s License, Passport, etc.)',
                'category' => 'personal',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Birth Certificate',
                'description' => 'Official birth certificate from PSA (Philippine Statistics Authority)',
                'category' => 'personal',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Proof of Residency',
                'description' => 'Document proving your current address (utility bill, lease agreement, etc.)',
                'category' => 'personal',
                'is_required' => true,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Insert document types, ignoring duplicates
        foreach ($documentTypes as $docType) {
            DB::table('document_types')->updateOrInsert(
                ['name' => $docType['name']],
                $docType
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the seeded document types
        $documentTypeNames = [
            'Transcript of Records (Latest)',
            'Certificate of Good Moral',
            'Income Certificate',
            'Barangay Certificate',
            'Valid ID (Government-issued)',
            'Birth Certificate',
            'Proof of Residency',
        ];

        DB::table('document_types')->whereIn('name', $documentTypeNames)->delete();
    }
};