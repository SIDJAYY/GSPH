<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and return token
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ], [
            'username.required' => 'Username or email is required.',
            'password.required' => 'Password is required.',
        ]);

        // Try to find user by citizen_id or email
        $user = User::where('citizen_id', $request->username)
                   ->orWhere('email', $request->username)
                   ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid username/email or password'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                ],
                'token' => $token
            ]
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                ]
            ]
        ]);
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'middleName' => 'nullable|string|max:255',
            'suffix' => 'nullable|string|max:10',
            'birthdate' => 'required|date|before:today',
            'regEmail' => 'required|email|unique:users,email',
            'mobile' => 'required|string|regex:/^09[0-9]{9}$/',
            'address' => 'required|string|max:500',
            'houseNumber' => 'required|string|max:50',
            'street' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'regPassword' => 'required|string|min:10',
            'confirmPassword' => 'required|string|min:10|same:regPassword',
        ], [
            'regEmail.unique' => 'This email is already registered.',
            'mobile.regex' => 'Mobile number must be in format 09XXXXXXXXX.',
            'regPassword.min' => 'Password must be at least 10 characters.',
            'confirmPassword.same' => 'Password confirmation does not match.',
            'birthdate.before' => 'Birthdate must be before today.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate citizen ID
        $citizenId = 'CC' . date('Y') . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT);

        // Create user
        $user = User::create([
            'citizen_id' => $citizenId,
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'middle_name' => $request->middleName,
            'extension_name' => $request->suffix,
            'email' => $request->regEmail,
            'mobile' => $request->mobile,
            'birthdate' => $request->birthdate,
            'address' => $request->address,
            'house_number' => $request->houseNumber,
            'street' => $request->street,
            'barangay' => $request->barangay,
            'password' => Hash::make($request->regPassword),
            'role' => 'student',
            'status' => 'pending_verification',
            'email_verification_token' => Str::random(60),
        ]);

        // Send verification email
        try {
            Mail::send('emails.verification', [
                'user' => $user,
                'verificationUrl' => url("/verify-email/{$user->email_verification_token}")
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Verify Your Email Address - GoServePH');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please check your email for verification.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'status' => $user->status,
                ]
            ]
        ], 201);
    }

    /**
     * Verify email address
     */
    public function verifyEmail(Request $request, $token)
    {
        $user = User::where('email_verification_token', $token)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification token'
            ], 400);
        }

        $user->update([
            'status' => 'active',
            'email_verification_token' => null,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Google OAuth callback
     */
    public function googleCallback(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        try {
            // Exchange authorization code for access token
            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'client_id' => env('GOOGLE_CLIENT_ID'),
                    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
                    'code' => $request->code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
                ]
            ]);

            $tokenData = json_decode($response->getBody(), true);
            $accessToken = $tokenData['access_token'];

            // Get user info from Google
            $userResponse = $client->get('https://www.googleapis.com/oauth2/v2/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ]
            ]);

            $googleUser = json_decode($userResponse->getBody(), true);

            // Find or create user
            $user = User::where('email', $googleUser['email'])->first();

            if (!$user) {
                $user = User::create([
                    'citizen_id' => 'CC' . date('Y') . str_pad(rand(1, 999999), 6, '0', STR_PAD_LEFT),
                    'first_name' => $googleUser['given_name'],
                    'last_name' => $googleUser['family_name'],
                    'email' => $googleUser['email'],
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'role' => 'student',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'google_id' => $googleUser['id'],
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'citizen_id' => $user->citizen_id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ],
                    'token' => $token,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Google OAuth error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed'
            ], 400);
        }
    }

    /**
     * Send OTP for verification
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();
        
        if ($user->status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is already verified'
            ], 400);
        }

        // Generate OTP
        $otp = OtpVerification::generateOtp($user->id, 'email_verification');

        // Send OTP via email (in a real app, you might use SMS)
        try {
            Mail::send('emails.otp', [
                'user' => $user,
                'otp_code' => $otp->otp_code,
                'expires_at' => $otp->expires_at
            ], function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Your OTP Code - GoServePH');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            'expires_in' => 300 // 5 minutes
        ]);
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp_code' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();
        
        $otp = OtpVerification::where('user_id', $user->id)
            ->where('otp_code', $request->otp_code)
            ->where('type', 'email_verification')
            ->where('is_used', false)
            ->first();

        if (!$otp || !$otp->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP'
            ], 400);
        }

        // Mark OTP as used
        $otp->markAsUsed();

        // Activate user account
        $user->update([
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Account verified successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'status' => $user->status,
                ]
            ]
        ]);
    }
}
