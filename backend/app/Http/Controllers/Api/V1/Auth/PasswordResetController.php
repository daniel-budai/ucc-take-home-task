<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordResetConfirmRequest;
use App\Http\Requests\Auth\PasswordResetRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function request(PasswordResetRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $this->authService->requestPasswordReset($validated['email']);

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email',
        ], 200);
    }

    public function reset(PasswordResetConfirmRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $this->authService->resetPassword(
            email: $validated['email'],
            password: $validated['password'],
            token: $validated['token']
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful',
        ], 200);
    }
}