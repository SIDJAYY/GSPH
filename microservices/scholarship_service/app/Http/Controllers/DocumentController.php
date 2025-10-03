<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Display a listing of documents
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::with(['student', 'application', 'documentType']);

        // Apply filters
        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('application_id')) {
            $query->where('application_id', $request->application_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('document_type_id')) {
            $query->where('document_type_id', $request->document_type_id);
        }

        $documents = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Store a newly created document
     */
    public function store(Request $request): JsonResponse
    {
        // Debug logging
        Log::info('Document upload request received', [
            'student_id' => $request->student_id,
            'application_id' => $request->application_id,
            'document_type_id' => $request->document_type_id,
            'file_name' => $request->file('file')?->getClientOriginalName(),
            'file_size' => $request->file('file')?->getSize(),
        ]);

        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'application_id' => 'nullable|exists:scholarship_applications,id',
            'document_type_id' => 'required|exists:document_types,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx', // 10MB max
        ]);

        if ($validator->fails()) {
            Log::error('Document upload validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            
            // Debug logging for file details
            Log::info('File details:', [
                'original_name' => $file->getClientOriginalName(),
                'extension' => $file->getClientOriginalExtension(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'is_valid' => $file->isValid(),
                'error' => $file->getError(),
                'error_message' => $file->getErrorMessage()
            ]);
            
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::uuid() . '.' . $extension;
            $filePath = 'documents/' . $fileName;

            // Check if document type already exists for this student and application
            $existingDocument = Document::where('student_id', $request->student_id)
                ->where('application_id', $request->application_id)
                ->where('document_type_id', $request->document_type_id)
                ->first();

            if ($existingDocument) {
                // Delete the old file
                if (Storage::disk('public')->exists($existingDocument->file_path)) {
                    Storage::disk('public')->delete($existingDocument->file_path);
                }
                
                // Update the existing document
                $existingDocument->update([
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending', // Reset status when replacing
                    'verification_notes' => null,
                    'verified_by' => null,
                    'verified_at' => null,
                ]);

                // Store the new file
                Log::info('Storing file to: ' . $filePath);
                $fileContents = file_get_contents($file);
                if ($fileContents === false) {
                    throw new \Exception('Failed to read file contents');
                }
                Storage::disk('public')->put($filePath, $fileContents);
                Log::info('File stored successfully');

                $existingDocument->load(['student', 'application', 'documentType']);

                return response()->json([
                    'success' => true,
                    'message' => 'Document replaced successfully',
                    'data' => $existingDocument
                ], 200);
            } else {
                // Store the new file
                Log::info('Storing new file to: ' . $filePath);
                $fileContents = file_get_contents($file);
                if ($fileContents === false) {
                    throw new \Exception('Failed to read file contents');
                }
                Storage::disk('public')->put($filePath, $fileContents);
                Log::info('New file stored successfully');

                $document = Document::create([
                    'student_id' => $request->student_id,
                    'application_id' => $request->application_id,
                    'document_type_id' => $request->document_type_id,
                    'file_name' => $originalName,
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                ]);

                $document->load(['student', 'application', 'documentType']);

                return response()->json([
                    'success' => true,
                    'message' => 'Document uploaded successfully',
                    'data' => $document
                ], 201);
            }

        } catch (\Exception $e) {
            Log::error('Document upload failed: ' . $e->getMessage(), [
                'student_id' => $request->student_id,
                'application_id' => $request->application_id,
                'document_type_id' => $request->document_type_id,
                'file_name' => $request->file('file')?->getClientOriginalName()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified document
     */
    public function show(Document $document): JsonResponse
    {
        $document->load(['student', 'application', 'documentType']);

        return response()->json([
            'success' => true,
            'data' => $document
        ]);
    }

    /**
     * Download the specified document
     */
    public function download(Document $document): BinaryFileResponse|JsonResponse
    {
        try {
            if (!Storage::disk('public')->exists($document->file_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File not found'
                ], 404);
            }

            $filePath = Storage::disk('public')->path($document->file_path);
            $headers = [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'attachment; filename="' . $document->file_name . '"',
            ];

            return response()->download($filePath, $document->file_name, $headers);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to download document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the specified document
     */
    public function verify(Request $request, Document $document): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'verification_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $document->verify(
                $request->verification_notes,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Document verified successfully',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject the specified document
     */
    public function reject(Request $request, Document $document): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'verification_notes' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $document->reject(
                $request->verification_notes,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Document rejected',
                'data' => $document
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified document
     */
    public function destroy(Document $document): JsonResponse
    {
        try {
            // Delete the file from storage
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document types
     */
    public function getDocumentTypes(): JsonResponse
    {
        $documentTypes = DocumentType::active()
                                   ->orderBy('category', 'asc')
                                   ->orderBy('name', 'asc')
                                   ->get();

        return response()->json([
            'success' => true,
            'data' => $documentTypes
        ]);
    }

    /**
     * Get required documents for a specific application type
     */
    public function getRequiredDocuments(Request $request): JsonResponse
    {
        $applicationType = $request->get('application_type', 'new');
        
        $requiredDocuments = DocumentType::active()
                                       ->required()
                                       ->orderBy('category', 'asc')
                                       ->orderBy('name', 'asc')
                                       ->get();

        return response()->json([
            'success' => true,
            'data' => $requiredDocuments
        ]);
    }

    /**
     * Get documents checklist for a specific application
     */
    public function getDocumentsChecklist(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_id' => 'required|exists:scholarship_applications,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $applicationId = $request->application_id;
            
            // Get the application to get student_id
            $application = \App\Models\ScholarshipApplication::find($applicationId);
            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Get all required document types
            $requiredDocumentTypes = DocumentType::active()
                ->required()
                ->orderBy('category', 'asc')
                ->orderBy('name', 'asc')
                ->get();

            // Get submitted documents for this application
            $submittedDocuments = Document::where('application_id', $applicationId)
                ->where('student_id', $application->student_id)
                ->with('documentType')
                ->get()
                ->keyBy('document_type_id');

            // Create checklist
            $checklist = $requiredDocumentTypes->map(function ($docType) use ($submittedDocuments) {
                $submittedDoc = $submittedDocuments->get($docType->id);
                
                return [
                    'id' => $docType->id,
                    'name' => $docType->name,
                    'description' => $docType->description,
                    'category' => $docType->category,
                    'is_required' => $docType->is_required,
                    'is_submitted' => $submittedDoc ? true : false,
                    'status' => $submittedDoc ? $submittedDoc->status : 'missing',
                    'submitted_at' => $submittedDoc ? $submittedDoc->created_at->format('Y-m-d H:i:s') : null,
                    'verified_at' => $submittedDoc && $submittedDoc->verified_at ? $submittedDoc->verified_at->format('Y-m-d H:i:s') : null,
                    'verification_notes' => $submittedDoc ? $submittedDoc->verification_notes : null,
                    'file_name' => $submittedDoc ? $submittedDoc->file_name : null,
                    'file_size' => $submittedDoc ? $submittedDoc->file_size : null,
                    'mime_type' => $submittedDoc ? $submittedDoc->mime_type : null,
                ];
            });

            // Add any submitted documents that aren't in the required list
            $submittedDocuments->each(function ($doc) use ($requiredDocumentTypes, &$checklist) {
                $isInRequired = $requiredDocumentTypes->contains('id', $doc->document_type_id);
                if (!$isInRequired) {
                    $checklist->push([
                        'id' => $doc->document_type_id,
                        'name' => $doc->documentType->name ?? 'Unknown Document',
                        'description' => $doc->documentType->description ?? '',
                        'category' => $doc->documentType->category ?? 'other',
                        'is_required' => false,
                        'is_submitted' => true,
                        'status' => $doc->status,
                        'submitted_at' => $doc->created_at->format('Y-m-d H:i:s'),
                        'verified_at' => $doc->verified_at ? $doc->verified_at->format('Y-m-d H:i:s') : null,
                        'verification_notes' => $doc->verification_notes,
                        'file_name' => $doc->file_name,
                        'file_size' => $doc->file_size,
                        'mime_type' => $doc->mime_type,
                    ]);
                }
            });

            // Calculate statistics
            $requiredCount = $checklist->where('is_required', true)->count();
            $submittedCount = $checklist->where('is_required', true)->where('is_submitted', true)->count();
            $verifiedCount = $checklist->where('is_required', true)->where('status', 'verified')->count();
            $completionPercentage = $requiredCount > 0 ? round(($submittedCount / $requiredCount) * 100) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'checklist' => $checklist,
                    'statistics' => [
                        'required_count' => $requiredCount,
                        'submitted_count' => $submittedCount,
                        'verified_count' => $verifiedCount,
                        'missing_count' => $requiredCount - $submittedCount,
                        'completion_percentage' => $completionPercentage
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get documents checklist: ' . $e->getMessage(), [
                'application_id' => $request->application_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get documents checklist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
