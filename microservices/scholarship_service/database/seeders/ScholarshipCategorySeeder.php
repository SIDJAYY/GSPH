<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ScholarshipCategory;
use App\Models\ScholarshipSubcategory;

class ScholarshipCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Scholarship Categories
        $categories = [
            [
                'name' => 'SCHOLARSHIP FOR TERTIARY STUDENTS',
                'description' => 'Scholarship program for college and university students',
                'type' => 'merit',
                'is_active' => true,
                'subcategories' => [
                    [
                        'name' => 'Academic Excellence Scholarship',
                        'description' => 'For students with outstanding academic performance',
                        'amount' => 50000.00,
                        'type' => 'merit',
                        'requirements' => ['GWA of 1.75 or higher', 'No failing grades', 'Full-time enrollment'],
                        'benefits' => ['Full tuition coverage', 'Monthly allowance', 'Book allowance'],
                    ],
                    [
                        'name' => 'Financial Assistance Scholarship',
                        'description' => 'For students with financial need',
                        'amount' => 30000.00,
                        'type' => 'need_based',
                        'requirements' => ['Family income below 300,000', 'GWA of 2.0 or higher', 'Full-time enrollment'],
                        'benefits' => ['Partial tuition coverage', 'Monthly allowance'],
                    ],
                ]
            ],
            [
                'name' => 'SCHOLARSHIP FOR SENIOR HIGH SCHOOL STUDENTS',
                'description' => 'Scholarship program for senior high school students',
                'type' => 'merit',
                'is_active' => true,
                'subcategories' => [
                    [
                        'name' => 'Academic Merit Scholarship',
                        'description' => 'For senior high students with excellent grades',
                        'amount' => 25000.00,
                        'type' => 'merit',
                        'requirements' => ['GWA of 90 or higher', 'No failing grades', 'Full-time enrollment'],
                        'benefits' => ['Full tuition coverage', 'Monthly allowance', 'Uniform allowance'],
                    ],
                ]
            ],
            [
                'name' => 'SPECIAL SCHOLARSHIP PROGRAMS',
                'description' => 'Special scholarship programs for specific groups',
                'type' => 'special',
                'is_active' => true,
                'subcategories' => [
                    [
                        'name' => 'PWD Scholarship',
                        'description' => 'For students with disabilities',
                        'amount' => 40000.00,
                        'type' => 'special',
                        'requirements' => ['PWD ID', 'Medical certificate', 'GWA of 2.5 or higher'],
                        'benefits' => ['Full tuition coverage', 'Monthly allowance', 'Transportation allowance'],
                    ],
                    [
                        'name' => 'Solo Parent Scholarship',
                        'description' => 'For children of solo parents',
                        'amount' => 35000.00,
                        'type' => 'special',
                        'requirements' => ['Solo parent ID', 'GWA of 2.0 or higher', 'Full-time enrollment'],
                        'benefits' => ['Partial tuition coverage', 'Monthly allowance', 'Book allowance'],
                    ],
                ]
            ],
            [
                'name' => 'RENEWAL SCHOLARSHIPS',
                'description' => 'Scholarship renewal programs for continuing students',
                'type' => 'renewal',
                'is_active' => true,
                'subcategories' => [
                    [
                        'name' => 'Academic Renewal Scholarship',
                        'description' => 'Renewal for students maintaining good academic standing',
                        'amount' => 45000.00,
                        'type' => 'renewal',
                        'requirements' => ['GWA of 2.0 or higher', 'No failing grades', 'Previous scholarship recipient'],
                        'benefits' => ['Full tuition coverage', 'Monthly allowance', 'Book allowance'],
                    ],
                ]
            ],
        ];

        foreach ($categories as $categoryData) {
            $subcategories = $categoryData['subcategories'];
            unset($categoryData['subcategories']);

            $category = ScholarshipCategory::create($categoryData);

            foreach ($subcategories as $subcategoryData) {
                $subcategoryData['category_id'] = $category->id;
                ScholarshipSubcategory::create($subcategoryData);
            }
        }
    }
}
