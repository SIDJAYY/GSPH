<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GsmAuthController extends Controller
{
    /**
     * POST /api/gsm/login
     * Accepts { email, password } and returns a response compatible with the legacy gsm_login endpoint.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => [ 'errors' => $validator->errors()->all() ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password) || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
                'data' => null,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $safeUser = [
            'id' => $user->id,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'role' => $user->role,
            'status' => $user->is_active ? 'active' : 'inactive',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $safeUser,
                'token' => $token,
                'redirect' => 'portal',
            ],
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * POST /api/gsm/check-email
     * Accepts { email } and returns { exists }
     */
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => [ 'errors' => $validator->errors()->all() ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        $exists = User::where('email', $request->email)->where('is_active', true)->exists();

        return response()->json([
            'success' => true,
            'message' => 'Email check completed',
            'data' => [ 'exists' => (bool) $exists ],
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);
    }
}






