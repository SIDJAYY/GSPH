<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Address;
use App\Models\FamilyMember;
use App\Models\FinancialInformation;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     */
    public function index(Request $request): JsonResponse
    {
        $query = Student::with([
            'addresses',
            'familyMembers',
            'financialInformation',
            'academicRecords',
            'currentAcademicRecord.school'
        ]);

        // Get authenticated user from middleware
        $authUser = $request->get('auth_user');
        if ($authUser && isset($authUser['id'])) {
            $isAdmin = isset($authUser['role']) && strtolower($authUser['role']) === 'admin';
            if (!$isAdmin) {
                // Non-admins: only see their own records
                $userId = $authUser['id'];
                $query->where('user_id', $userId);
            }
        } else {
            // If no authenticated user, return empty results
            $query->where('id', 0); // This will return no results
        }

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('student_id_number', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_pwd')) {
            $query->where('is_pwd', $request->boolean('is_pwd'));
        }

        if ($request->has('is_solo_parent')) {
            $query->where('is_solo_parent', $request->boolean('is_solo_parent'));
        }

        if ($request->has('is_currently_enrolled')) {
            $query->where('is_currently_enrolled', $request->boolean('is_currently_enrolled'));
        }

        $students = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'citizen_id' => 'required|string|max:64',
            'user_id' => 'nullable|integer',
            'student_id_number' => 'nullable|string|max:255|unique:students,student_id_number',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex' => 'required|in:Male,Female',
            'civil_status' => 'required|in:Single,Married,Widowed,Divorced,Separated',
            'nationality' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'is_pwd' => 'boolean',
            'pwd_specification' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'contact_number' => 'nullable|string|max:255',
            'email_address' => 'nullable|email|max:255',
            'is_employed' => 'boolean',
            'is_job_seeking' => 'boolean',
            'is_currently_enrolled' => 'boolean',
            'is_graduating' => 'boolean',
            'is_solo_parent' => 'boolean',
            'is_indigenous_group' => 'boolean',
            'is_registered_voter' => 'boolean',
            'voter_nationality' => 'nullable|string|max:255',
            'has_paymaya_account' => 'boolean',
            'preferred_mobile_number' => 'nullable|string|max:255',

            // Address data
            'addresses' => 'nullable|array',
            'addresses.*.type' => 'required_with:addresses|in:present,permanent,school',
            'addresses.*.address_line_1' => 'required_with:addresses|string|max:255',
            'addresses.*.address_line_2' => 'nullable|string|max:255',
            'addresses.*.barangay' => 'nullable|string|max:255',
            'addresses.*.district' => 'nullable|string|max:255',
            'addresses.*.city' => 'nullable|string|max:255',
            'addresses.*.province' => 'nullable|string|max:255',
            'addresses.*.region' => 'nullable|string|max:255',
            'addresses.*.zip_code' => 'nullable|string|max:20',

            // Family members data
            'family_members' => 'nullable|array',
            'family_members.*.relationship' => 'required_with:family_members|in:father,mother,guardian,sibling,spouse',
            'family_members.*.first_name' => 'required_with:family_members|string|max:255',
            'family_members.*.last_name' => 'required_with:family_members|string|max:255',
            'family_members.*.middle_name' => 'nullable|string|max:255',
            'family_members.*.extension_name' => 'nullable|string|max:255',
            'family_members.*.contact_number' => 'nullable|string|max:255',
            'family_members.*.employer' => 'nullable|string|max:255',
            'family_members.*.monthly_income' => 'nullable|numeric|min:0',
            'family_members.*.is_alive' => 'boolean',
            'family_members.*.is_employed' => 'boolean',
            'family_members.*.is_ofw' => 'boolean',
            'family_members.*.is_pwd' => 'boolean',
            'family_members.*.pwd_specification' => 'nullable|string|max:255',

            // Financial information data
            'financial_information' => 'nullable|array',
            'financial_information.total_annual_income' => 'nullable|numeric|min:0',
            'financial_information.monthly_income' => 'nullable|numeric|min:0',
            'financial_information.number_of_children' => 'nullable|integer|min:0',
            'financial_information.number_of_siblings' => 'nullable|integer|min:0',
            'financial_information.home_ownership_status' => 'nullable|in:owned,rented,borrowed,other',
            'financial_information.is_4ps_beneficiary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create student
            $studentData = $request->only([
                'citizen_id', 'user_id', 'student_id_number', 'first_name', 'last_name',
                'middle_name', 'extension_name', 'sex', 'civil_status', 'nationality',
                'birth_place', 'birth_date', 'is_pwd', 'pwd_specification', 'religion',
                'height_cm', 'weight_kg', 'contact_number', 'email_address', 'is_employed',
                'is_job_seeking', 'is_currently_enrolled', 'is_graduating', 'is_solo_parent',
                'is_indigenous_group', 'is_registered_voter', 'voter_nationality',
                'has_paymaya_account', 'preferred_mobile_number'
            ]);

            // Set user_id and citizen_id from authenticated user if not provided
            if ($request->has('auth_user')) {
                $authUser = $request->get('auth_user');
                if (!isset($studentData['user_id']) || !$studentData['user_id']) {
                    $studentData['user_id'] = $authUser['id'];
                }
                if (!isset($studentData['citizen_id']) || !$studentData['citizen_id'] || str_starts_with($studentData['citizen_id'], 'temp-citizen-')) {
                    $studentData['citizen_id'] = $authUser['citizen_id'];
                }
            }

            $student = Student::create($studentData);

            // Create addresses
            if ($request->has('addresses')) {
                foreach ($request->addresses as $addressData) {
                    $addressData['student_id'] = $student->id;
                    Address::create($addressData);
                }
            }

            // Create family members
            if ($request->has('family_members')) {
                foreach ($request->family_members as $familyData) {
                    $familyData['student_id'] = $student->id;
                    FamilyMember::create($familyData);
                }
            }

            // Create financial information
            if ($request->has('financial_information')) {
                $financialData = $request->financial_information;
                $financialData['student_id'] = $student->id;
                FinancialInformation::create($financialData);
            }

            DB::commit();

            // Load relationships
            $student->load([
                'addresses',
                'familyMembers',
                'financialInformation',
                'academicRecords',
                'currentAcademicRecord.school'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully',
                'data' => $student
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create student', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student
     */
    public function show(Student $student): JsonResponse
    {
        $student->load([
            'addresses',
            'familyMembers',
            'financialInformation',
            'academicRecords.school',
            'currentAcademicRecord.school',
            'scholarshipApplications.category',
            'scholarshipApplications.subcategory',
            'scholarshipApplications.school',
            'documents.documentType'
        ]);

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, Student $student): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex' => 'sometimes|required|in:Male,Female',
            'civil_status' => 'sometimes|required|in:Single,Married,Widowed,Divorced,Separated',
            'nationality' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'is_pwd' => 'boolean',
            'pwd_specification' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'contact_number' => 'nullable|string|max:255',
            'email_address' => 'nullable|email|max:255',
            'is_employed' => 'boolean',
            'is_job_seeking' => 'boolean',
            'is_currently_enrolled' => 'boolean',
            'is_graduating' => 'boolean',
            'is_solo_parent' => 'boolean',
            'is_indigenous_group' => 'boolean',
            'is_registered_voter' => 'boolean',
            'voter_nationality' => 'nullable|string|max:255',
            'has_paymaya_account' => 'boolean',
            'preferred_mobile_number' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $student->update($request->only([
                'first_name', 'last_name', 'middle_name', 'extension_name', 'sex',
                'civil_status', 'nationality', 'birth_place', 'birth_date', 'is_pwd',
                'pwd_specification', 'religion', 'height_cm', 'weight_kg', 'contact_number',
                'email_address', 'is_employed', 'is_job_seeking', 'is_currently_enrolled',
                'is_graduating', 'is_solo_parent', 'is_indigenous_group', 'is_registered_voter',
                'voter_nationality', 'has_paymaya_account', 'preferred_mobile_number'
            ]));

            $student->load([
                'addresses',
                'familyMembers',
                'financialInformation',
                'academicRecords.school',
                'currentAcademicRecord.school'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $student
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student
     */
    public function destroy(Student $student): JsonResponse
    {
        try {
            $student->delete();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
