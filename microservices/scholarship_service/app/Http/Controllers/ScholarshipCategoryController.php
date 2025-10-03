<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ScholarshipCategoryController extends Controller
{
    /**
     * Display a listing of scholarship categories
     */
    public function index(Request $request): JsonResponse
    {
        $query = ScholarshipCategory::with('subcategories');

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $categories = $query->orderBy('name', 'asc')
                           ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Store a newly created scholarship category
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:merit,need_based,special,renewal',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category = ScholarshipCategory::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Scholarship category created successfully',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create scholarship category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified scholarship category
     */
    public function show(ScholarshipCategory $category): JsonResponse
    {
        $category->load(['subcategories', 'scholarshipApplications.student']);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }

    /**
     * Update the specified scholarship category
     */
    public function update(Request $request, ScholarshipCategory $category): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|required|in:merit,need_based,special,renewal',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Scholarship category updated successfully',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update scholarship category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified scholarship category
     */
    public function destroy(ScholarshipCategory $category): JsonResponse
    {
        try {
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Scholarship category deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete scholarship category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
