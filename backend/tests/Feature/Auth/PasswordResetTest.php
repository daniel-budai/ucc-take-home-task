<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_can_request_password_reset(): void
    {
        //Core password reset flow
        Notification::fake();
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
        ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    #[Test]
    public function password_reset_request_requires_valid_email(): void
    {
        
        $response = $this->postJson('/api/password/reset', [
            'email' => 'invalid-email',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function password_reset_request_handles_non_existent_email(): void
    {
        //laravel validates email exists, but we test the endpoint behavior
        Notification::fake();

        $response = $this->postJson('/api/password/reset', [
            'email' => 'nonexistent@example.com',
        ]);

        // Laravel's Password facade validates email exists, so this will fail validation
        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        // Don't leak user existence via email timing
        Notification::assertNothingSent();
    }

    #[Test]
    public function user_can_reset_password_with_valid_token(): void
    {
        //Core password reset functionality
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
    }

    #[Test]
    public function password_reset_fails_with_invalid_token(): void
    {
        // invalid tokens must be rejected
        $user = User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => 'invalid-token',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function password_reset_requires_password_confirmation(): void
    {
        //Validation
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'DifferentPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    #[Test]
    #[DataProvider('weakPasswordProvider')]
    public function password_reset_requires_strong_password(string $weakPassword): void
    {
        // password strength requirements
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => $weakPassword,
            'password_confirmation' => $weakPassword,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public static function weakPasswordProvider(): array
    {
        return [
            'too short' => ['weak'],
            'no uppercase' => ['password123!'],
            'no lowercase' => ['PASSWORD123!'],
            'no numbers' => ['Password!'],
            'no special chars' => ['Password123'],
        ];
    }

    #[Test]
    public function password_reset_token_expires_after_one_hour(): void
    {
        // Tokens must expire for security
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        // Simulate time passing (61 minutes)
        $this->travel(61)->minutes();

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function password_reset_token_can_only_be_used_once(): void
    {
        //token reuse prevention
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        // First use - succeeds
        $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertOk();

        // Second use with same token - fails validation
        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $token,
            'password' => 'DifferentPassword456!',
            'password_confirmation' => 'DifferentPassword456!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function password_reset_revokes_all_tokens(): void
    {
        //verify tokens are revoked after password reset
        $user = User::factory()->create(['email' => 'test@example.com']);
        $user->createToken('old-session');
        $user->createToken('another-session');
        
        // Verify tokens exist before reset
        $this->assertCount(2, $user->fresh()->tokens);
    
        $resetToken = Password::createToken($user);
    
        // Reset password
        $this->postJson('/api/password/reset/confirm', [
            'email' => 'test@example.com',
            'token' => $resetToken,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertOk();
        
        // Verify all tokens were deleted from database
        $this->assertCount(0, $user->fresh()->tokens);
    }

    #[Test]
    public function password_reset_is_case_insensitive_for_email(): void
    {
        //users shouldn't fail due to case
        $user = User::factory()->create(['email' => 'test@example.com']);
        $token = Password::createToken($user);

        $response = $this->postJson('/api/password/reset/confirm', [
            'email' => 'TEST@EXAMPLE.COM',
            'token' => $token,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertOk();
    }

    #[Test]
    public function password_reset_request_sends_email_notification(): void
    {
        //Users must receive reset link
        Notification::fake();
        
        $user = User::factory()->create(['email' => 'test@example.com']);

        $this->postJson('/api/password/reset', [
            'email' => 'test@example.com',
        ]);

        Notification::assertSentTo($user, ResetPassword::class);
    }
}

