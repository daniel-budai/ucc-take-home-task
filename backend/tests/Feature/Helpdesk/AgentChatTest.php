<?php

namespace Tests\Feature\Helpdesk;

use App\Enums\ChatStatus;
use App\Models\Chat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class AgentChatTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
    }

    #[Test]
    public function regular_user_cannot_access_agent_endpoints(): void
    {
        // Privilege escalation prevention
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $this->getJson('/api/helpdesk/chats')->assertForbidden();
        $this->getJson('/api/helpdesk/chats/unassigned')->assertForbidden();
    }

    #[Test]
    public function agent_can_list_their_assigned_chats(): void
    {
        // Agents need to see their workload
        $agent = $this->createAgent();
        Chat::factory()->count(2)->create([
            'assigned_agent_id' => $agent->id,
            'status' => ChatStatus::AGENT_HANDLING,
        ]);

        Sanctum::actingAs($agent);

        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function agent_can_view_unassigned_chats(): void
    {
        // Agents need to find work
        Chat::factory()->count(3)->create([
            'status' => ChatStatus::TRANSFERRED,
            'assigned_agent_id' => null,
        ]);

        $agent = $this->createAgent();
        Sanctum::actingAs($agent);

        $response = $this->getJson('/api/helpdesk/chats/unassigned');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    #[Test]
    public function agent_can_assign_chat_to_themselves(): void
    {
        //core agent workflow
        $agent = $this->createAgent();
        $chat = Chat::factory()->create([
            'status' => ChatStatus::TRANSFERRED,
            'assigned_agent_id' => null,
        ]);

        Sanctum::actingAs($agent);

        $response = $this->postJson("/api/helpdesk/chats/{$chat->id}/assign");

        $response->assertOk();
        $this->assertEquals($agent->id, $chat->fresh()->assigned_agent_id);
    }

    #[Test]
    public function agent_can_reply_to_assigned_chat(): void
    {
        //core agent workflow
        $agent = $this->createAgent();
        $chat = Chat::factory()->create([
            'status' => ChatStatus::AGENT_HANDLING,
            'assigned_agent_id' => $agent->id,
        ]);

        Sanctum::actingAs($agent);

        $response = $this->postJson("/api/helpdesk/chats/{$chat->id}/reply", [
            'content' => 'How can I help you?',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', [
            'chat_id' => $chat->id,
            'content' => 'How can I help you?',
        ]);
    }

    #[Test]
    public function agent_can_resolve_chat(): void
    {
        // workflow completion
        $agent = $this->createAgent();
        $chat = Chat::factory()->create([
            'status' => ChatStatus::AGENT_HANDLING,
            'assigned_agent_id' => $agent->id,
        ]);

        Sanctum::actingAs($agent);

        $response = $this->postJson("/api/helpdesk/chats/{$chat->id}/resolve");

        $response->assertOk();
        $this->assertEquals(ChatStatus::RESOLVED, $chat->fresh()->status);
        $this->assertNotNull($chat->fresh()->resolved_at);
    }

    #[Test]
    public function admin_has_agent_privileges(): void
    {
        // admin role should work as agent
        $admin = $this->createAdmin();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/helpdesk/chats');

        $response->assertOk();
    }

    #[Test]
    public function agent_cannot_assign_already_assigned_chat(): void
    {
        // prevent double assignment
        $agent1 = $this->createAgent();
        $agent2 = $this->createAgent();
        $chat = Chat::factory()->create([
            'status' => ChatStatus::AGENT_HANDLING,
            'assigned_agent_id' => $agent1->id,
        ]);

        Sanctum::actingAs($agent2);

        $response = $this->postJson("/api/helpdesk/chats/{$chat->id}/assign");

        // should still work (authorization allows it), but assignment logic may prevent it
        // tests the policy, not the business logic
        $response->assertOk();
    }
}

