<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipApplication;
use App\Models\Student;
use App\Models\School;
use App\Models\ScholarshipCategory;
use App\Models\ScholarshipSubcategory;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ScholarshipApplicationController extends Controller
{
    /**
     * Display a listing of applications
     */
    public function index(Request $request): JsonResponse
    {
        $query = ScholarshipApplication::with([
            'student.addresses',
            'student.familyMembers',
            'student.academicRecords',
            'student.currentAcademicRecord',
            'student.financialInformation',
            'category',
            'subcategory',
            'school',
            'documents.documentType'
        ]);

        // Scope results: by default, allow admins/staff to view all.
        // Limit to current user's applications only when explicitly requested
        // via `mine=true` or `scope=student`.
        $authUser = $request->get('auth_user');
        $scopeMine = $request->boolean('mine') || $request->get('scope') === 'student';
        if ($scopeMine && $authUser && isset($authUser['id'])) {
            $userId = $authUser['id'];
            $query->whereHas('student', function($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('student_id_number', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderBy('created_at', 'desc')
                            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Store a newly created application
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'category_id' => 'required|exists:scholarship_categories,id',
            'subcategory_id' => 'required|exists:scholarship_subcategories,id',
            'school_id' => 'required|exists:schools,id',
            'type' => 'required|in:new,renewal',
            'parent_application_id' => 'nullable|string',
            'reason_for_renewal' => 'nullable|string',
            'financial_need_description' => 'required|string',
            'requested_amount' => 'nullable|numeric|min:0',
            'marginalized_groups' => 'nullable|array',
            'digital_wallets' => 'nullable|array',
            'wallet_account_number' => 'nullable|string|max:255',
            'how_did_you_know' => 'nullable|array',
            'is_school_at_caloocan' => 'boolean',
            
            // Academic record data
            'academic_record' => 'required|array',
            'academic_record.educational_level' => 'required|string',
            'academic_record.program' => 'nullable|string|max:255',
            'academic_record.major' => 'nullable|string|max:255',
            'academic_record.track_specialization' => 'nullable|string|max:255',
            'academic_record.area_of_specialization' => 'nullable|string|max:255',
            'academic_record.year_level' => 'required|string|max:255',
            'academic_record.school_year' => 'required|string|max:255',
            'academic_record.school_term' => 'required|string|max:255',
            'academic_record.units_enrolled' => 'nullable|integer|min:0',
            'academic_record.units_completed' => 'nullable|integer|min:0',
            'academic_record.gpa' => 'nullable|numeric|min:0|max:4',
            'academic_record.general_weighted_average' => 'nullable|numeric|min:0|max:4',
            'academic_record.previous_school' => 'nullable|string|max:255',
            'academic_record.is_graduating' => 'boolean',
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

            // Generate application number
            $applicationNumber = 'APP-' . date('Y') . '-' . str_pad(
                ScholarshipApplication::count() + 1, 
                6, 
                '0', 
                STR_PAD_LEFT
            );

            // Create application
            $applicationData = $request->only([
                'student_id', 'category_id', 'subcategory_id', 'school_id',
                'type', 'parent_application_id', 'reason_for_renewal',
                'financial_need_description', 'requested_amount', 'marginalized_groups',
                'digital_wallets', 'wallet_account_number', 'how_did_you_know',
                'is_school_at_caloocan'
            ]);

            // Get subcategory to set the correct requested amount
            $subcategory = ScholarshipSubcategory::find($request->subcategory_id);
            if ($subcategory && $subcategory->amount) {
                // Always use the subcategory amount to ensure consistency
                $applicationData['requested_amount'] = $subcategory->amount;
                
                Log::info('Setting requested amount from subcategory', [
                    'subcategory_id' => $subcategory->id,
                    'subcategory_name' => $subcategory->name,
                    'amount' => $subcategory->amount,
                    'original_requested_amount' => $request->requested_amount
                ]);
            }

            $applicationData['application_number'] = $applicationNumber;
            $applicationData['status'] = 'draft';

            $application = ScholarshipApplication::create($applicationData);

            // Create or update academic record
            if ($request->has('academic_record')) {
                try {
                    $academicData = $request->academic_record;
                    $academicData['student_id'] = $request->student_id;
                    $academicData['school_id'] = $request->school_id;
                    $academicData['is_current'] = true;

                    Log::info('Creating academic record', [
                        'academic_data' => $academicData,
                        'student_id' => $request->student_id
                    ]);

                    // Mark previous records as not current
                    AcademicRecord::where('student_id', $request->student_id)
                                 ->where('is_current', true)
                                 ->update(['is_current' => false]);

                    $academicRecord = AcademicRecord::create($academicData);
                    Log::info('Academic record created successfully', [
                        'academic_record_id' => $academicRecord->id
                    ]);
                } catch (\Exception $academicError) {
                    Log::error('Failed to create academic record', [
                        'error' => $academicError->getMessage(),
                        'trace' => $academicError->getTraceAsString(),
                        'academic_data' => $request->academic_record ?? 'not provided'
                    ]);
                    throw $academicError;
                }
            }

            DB::commit();

            // Try to eager-load relations, but don't fail the request if it errors
            try {
                $application->load([
                    'student',
                    'category',
                    'subcategory',
                    'school'
                ]);
            } catch (\Throwable $loadError) {
                // Log the load error but continue returning success
                Log::warning('Application load failed after create', [
                    'application_id' => $application->id,
                    'error' => $loadError->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Application created successfully',
                'data' => $application
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create application', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified application
     */
    public function show(ScholarshipApplication $application): JsonResponse
    {
        $application->load([
            'student.addresses',
            'student.familyMembers',
            'student.financialInformation',
            'student.currentAcademicRecord.school',
            'category',
            'subcategory',
            'school',
            'documents.documentType',
            'statusHistory.changedBy'
        ]);

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    /**
     * Update the specified application
     */
    public function update(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason_for_renewal' => 'nullable|string',
            'financial_need_description' => 'sometimes|required|string',
            'requested_amount' => 'nullable|numeric|min:0',
            'marginalized_groups' => 'nullable|array',
            'digital_wallets' => 'nullable|array',
            'wallet_account_number' => 'nullable|string|max:255',
            'how_did_you_know' => 'nullable|array',
            'is_school_at_caloocan' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only([
                'reason_for_renewal', 'financial_need_description', 'requested_amount',
                'marginalized_groups', 'digital_wallets', 'wallet_account_number',
                'how_did_you_know', 'is_school_at_qc', 'notes'
            ]);

            // Ensure requested amount matches subcategory amount
            if ($application->subcategory && $application->subcategory->amount) {
                $updateData['requested_amount'] = $application->subcategory->amount;
                
                Log::info('Updating requested amount to match subcategory', [
                    'application_id' => $application->id,
                    'subcategory_id' => $application->subcategory->id,
                    'subcategory_name' => $application->subcategory->name,
                    'amount' => $application->subcategory->amount,
                    'original_requested_amount' => $request->requested_amount
                ]);
            }

            $application->update($updateData);

            $application->load(['student', 'category', 'subcategory', 'school']);

            return response()->json([
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit application for review
     */
    public function submit(Request $request, ScholarshipApplication $application): JsonResponse
    {
        if ($application->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Application can only be submitted from draft status'
            ], 400);
        }

        try {
            $application->submit();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve application
     */
    public function approve(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be submitted or reviewed to be approved'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $approvedBy = $authUser['id'] ?? null;
            $application->approve(
                $request->approved_amount,
                $request->notes,
                $approvedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application approved successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject application
     */
    public function reject(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeRejected()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be submitted or reviewed to be rejected'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;
            $application->reject(
                $request->rejection_reason,
                $reviewedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application rejected',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Review application
     */
    public function review(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeReviewed()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be submitted to be reviewed'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;
            $application->review(
                $request->notes,
                $reviewedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application reviewed successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to review application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process application for disbursement
     */
    public function process(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeProcessed()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be approved to be processed'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $processedBy = $authUser['id'] ?? null;
            $application->process(
                $request->notes,
                $processedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application processing started successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release funds to student
     */
    public function release(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeReleased()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be processing to be released'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $releasedBy = $authUser['id'] ?? null;
            $application->release(
                $request->notes,
                $releasedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Funds released successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to release funds',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified application
     */
    public function destroy(ScholarshipApplication $application): JsonResponse
    {
        if (!$application->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft applications can be deleted'
            ], 400);
        }

        try {
            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
