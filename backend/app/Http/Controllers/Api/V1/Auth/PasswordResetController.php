<?php

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
        $this->authService->requestPasswordReset($request->validated()['email']);

        return response()->json([
            'success' => true,
            'message' => 'Password reset link sent to your email',
        ], 200);
    }

    public function reset(PasswordResetConfirmRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            email: $request->validated()['email'],
            password: $request->validated()['password'],
            token: $request->validated()['token']
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset successful',
        ], 200);
    }
}