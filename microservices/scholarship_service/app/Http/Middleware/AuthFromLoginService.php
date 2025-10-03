<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthFromLoginService
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // For now, we'll implement a simple authentication check
        // In a real implementation, this would validate JWT tokens from the auth service
        
        $authHeader = $request->header('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Missing or invalid token'
            ], 401);
        }

        $token = substr($authHeader, 7); // Remove 'Bearer ' prefix
        
        // Simple token validation (in production, validate JWT properly)
        if ($token === 'valid-token' || $token === 'test-token') {
            // Mock user data for testing
            $request->merge([
                'auth_user' => [
                    'id' => 1,
                    'email' => 'test@example.com',
                    'name' => 'Test User'
                ]
            ]);
            
            return $next($request);
        }

        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Invalid token'
        ], 401);
    }
}
