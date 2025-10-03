<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthFromAuthService
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authorization token required'
            ], 401);
        }

        try {
            // Verify token with auth service
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Accept' => 'application/json'
            ])->get('http://localhost:8000/api/user');

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
            }

            $userData = $response->json();
            
            if (!$userData['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication failed'
                ], 401);
            }

            // Add user data to request for use in controllers
            $request->merge(['auth_user' => $userData['data']['user']]);
            
        } catch (\Exception $e) {
            \Log::error('Exception in AuthFromAuthService: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Authentication service unavailable'
            ], 503);
        }

        return $next($request);
    }
}
