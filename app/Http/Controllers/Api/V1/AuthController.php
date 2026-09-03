<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new seller (company) account. Mirrors the web registration
     * flow in Auth\RegisteredUserController::store() so mobile-created
     * accounts behave identically (default plan, role/settings, first store).
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'store_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'phone' => 'required|string|max:30',
            'country_code' => 'required|string|max:10',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $defaultPlan = Plan::where('price', 0)->first() ?? Plan::first();

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => trim($request->country_code . ' ' . $request->phone),
            'country_code' => $request->country_code,
            'password' => Hash::make($request->password),
            'type' => 'company',
            'is_active' => 1,
            'is_enable_login' => 1,
            'created_by' => 0,
            'plan_id' => $defaultPlan ? $defaultPlan->id : null,
            'plan_is_active' => 1,
            'is_trial' => ($defaultPlan && $defaultPlan->trial_day > 0) ? 1 : 0,
            'trial_expire_date' => ($defaultPlan && $defaultPlan->trial_day > 0) ? now()->addDays($defaultPlan->trial_day) : null,
        ]);

        // Also creates the user's first Store via User model's `created` boot hook.
        defaultRoleAndSetting($user);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user->fresh()),
        ], 201);
    }

    /**
     * Log in and issue a bearer token for the mobile app.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => [__('These credentials do not match our records.')],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if (!$user->is_enable_login) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => [__('This account has been disabled.')],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => __('Logged out.')]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'type' => $user->type,
            'current_store' => $user->current_store,
            'needs_plan_subscription' => $user->needsPlanSubscription(),
        ];
    }
}
