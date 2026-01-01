<?php

namespace Tests\Unit\Policies;

use App\Enums\UserRole;
use App\Models\Chat;
use App\Models\User;
use App\Policies\ChatPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ChatPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ChatPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new ChatPolicy();
    }

    #[Test]
    public function owner_can_view_their_chat(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $chat = Chat::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->view($user, $chat));
    }

    #[Test]
    public function owner_can_update_their_chat(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $chat = Chat::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->update($user, $chat));
    }

    #[Test]
    public function non_owner_cannot_view_chat(): void
    {
        $owner = User::factory()->create(['role' => UserRole::USER]);
        $otherUser = User::factory()->create(['role' => UserRole::USER]);
        $chat = Chat::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->view($otherUser, $chat));
    }

    #[Test]
    public function non_owner_cannot_update_chat(): void
    {
        $owner = User::factory()->create(['role' => UserRole::USER]);
        $otherUser = User::factory()->create(['role' => UserRole::USER]);
        $chat = Chat::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->update($otherUser, $chat));
    }

    #[Test]
    public function assigned_agent_can_view_chat(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $agent = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'assigned_agent_id' => $agent->id,
        ]);

        $this->assertTrue($this->policy->view($agent, $chat));
    }

    #[Test]
    public function agent_can_view_unassigned_chat(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $agent = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'assigned_agent_id' => null,
        ]);

        $this->assertTrue($this->policy->view($agent, $chat));
    }

    #[Test]
    public function agent_cannot_view_chat_assigned_to_other_agent(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $agent1 = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);
        $agent2 = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'assigned_agent_id' => $agent1->id,
        ]);

        $this->assertFalse($this->policy->view($agent2, $chat));
    }

    #[Test]
    public function only_agents_can_assign_chats(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);
        $agent = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);
        $chat = Chat::factory()->create();

        $this->assertFalse($this->policy->assign($user, $chat));
        $this->assertTrue($this->policy->assign($agent, $chat));
    }

    #[Test]
    public function admin_can_assign_chats(): void
    {
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $chat = Chat::factory()->create();

        $this->assertTrue($this->policy->assign($admin, $chat));
    }
}

