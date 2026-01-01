<?php

namespace Tests\Feature\Middleware;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class EnsureHelpdeskAgentTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    #[Test]
    public function middleware_blocks_regular_users(): void
    {
        // Security - regular users cannot access agent endpoints
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertForbidden()
            ->assertJson(['message' => 'Access denied. Helpdesk agent privileges required.']);
    }

    #[Test]
    public function middleware_allows_agents(): void
    {
        // Agents should have access
        $agent = $this->createAgent();
        Sanctum::actingAs($agent);

        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertOk();
    }

    #[Test]
    public function middleware_allows_admins(): void
    {
        // Admins should have agent privileges
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertOk();
    }

    #[Test]
    public function middleware_handles_unauthenticated_requests(): void
    {
        // Unauthenticated requests must be rejected
        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertUnauthorized();
    }
}

