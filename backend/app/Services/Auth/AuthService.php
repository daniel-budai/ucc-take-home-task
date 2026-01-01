<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $email, string $password, bool $remember = false): array
    {
        $user = User::where('email', strtolower($email))->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('The provided credentials are incorrect.'),
            ]);
        }

        // Generate API token (Sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function requestPasswordReset(string $email): void
    {
        $status = Password::sendResetLink(
            ['email' => strtolower($email)]
        );

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    public function resetPassword(string $email, string $password, string $token): void
    {
        $status = Password::reset(
            [
                'email' => strtolower($email),
                'password' => $password,
                'token' => $token,
            ],
            function (User $user, string $password) {
                $user->password = Hash::make($password);
                $user->save();
                
                // Revoke all existing tokens for security
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    public function logout(User $user): void
    {
        $user->tokens()->delete();
    }
}