<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class LoginTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    #[Test]
    public function user_can_login_with_valid_credentials(): void
    {
    //authentication flow must work
        User::factory()->withCredentials('test@example.com', 'password123')->create();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token'],
            ])
            ->assertJson(['success' => true]);
    }

    #[Test]
    public function login_fails_with_invalid_credentials(): void
    {
        // invalid credentials must be rejected
        User::factory()->withCredentials('test@example.com', 'password123')->create();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function login_requires_email_and_password(): void
    {
        // Validation must work
        $response = $this->postJson('/api/login', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);
    }

    #[Test]
    public function login_email_is_case_insensitive(): void
    {
        // users shouldn't be locked out due to case
        User::factory()->withCredentials('test@example.com', 'password123')->create();

        $response = $this->postJson('/api/login', [
            'email' => 'TEST@EXAMPLE.COM',
            'password' => 'password123',
        ]);

        $response->assertOk();
    }

    #[Test]
    public function login_returns_token_for_api_access(): void
    {
        //Token generation must work for API authentication
        User::factory()->withCredentials('test@example.com', 'password123')->create();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('data.token'));
    }
}

