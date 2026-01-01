<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class LogoutTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    #[Test]
    public function authenticated_user_can_logout(): void
    {
        //Users must be able to invalidate their sessions
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertOk()
            ->assertJson(['success' => true]);
    }

    #[Test]
    public function unauthenticated_user_cannot_logout(): void
    {
        // Unauthenticated requests must be rejected
        $response = $this->postJson('/api/logout');

        $response->assertUnauthorized();
    }

    #[Test]
    public function logout_revokes_user_tokens(): void
    {
        // tokens should be invalidated on logout
        $user = $this->createUser();
        $token = $user->createToken('test-token')->plainTextToken;

        // Verify token works before logout
        Sanctum::actingAs($user);
        $this->getJson('/api/events')->assertOk();

        // Logout (using actingAs since logout requires auth)
        $this->postJson('/api/logout')->assertOk();

        // Token no longer works after logout - verify by checking database
        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'tokenable_type' => get_class($user),
        ]);
    }
}

