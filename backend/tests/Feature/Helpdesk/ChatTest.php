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

class ChatTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake(); // Don't actually process AI jobs
    }

    #[Test]
    public function user_can_create_chat(): void
    {
        //core chat creation
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/chats', [
            'message' => 'I need help with my order',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', ChatStatus::OPEN->value);

        $this->assertDatabaseHas('chats', [
            'user_id' => $user->id,
        ]);
    }

    #[Test]
    public function chat_creation_requires_message(): void
    {
        //validation
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/chats', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['message']);
    }

    #[Test]
    public function user_can_list_their_chats(): void
    {
        // Users should see only their chats
        $user = $this->createUser();
        Chat::factory()->count(2)->create(['user_id' => $user->id]);
        Chat::factory()->count(3)->create(); // Other users' chats

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/chats');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    #[Test]
    public function user_can_view_their_chat(): void
    {
        // View single chat with messages 
        $user = $this->createUser();
        $chat = Chat::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/chats/{$chat->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $chat->id);
    }

    #[Test]
    public function user_cannot_view_others_chat(): void
    {
        // Data isolation
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $chat = Chat::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/chats/{$chat->id}");

        $response->assertForbidden();
    }

    #[Test]
    public function user_can_send_message_to_chat(): void
    {
        // Core messaging functionality   
        $user = $this->createUser();
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'status' => ChatStatus::OPEN,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/chats/{$chat->id}/messages", [
            'content' => 'Follow up question',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', [
            'chat_id' => $chat->id,
            'content' => 'Follow up question',
        ]);
    }

    #[Test]
    public function user_cannot_send_message_to_resolved_chat(): void
    {
        // Business rule - resolved chats are closed
        $user = $this->createUser();
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'status' => ChatStatus::RESOLVED,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/chats/{$chat->id}/messages", [
            'content' => 'Can I add more?',
        ]);

        $response->assertUnprocessable();
    }

    #[Test]
    public function unauthenticated_user_cannot_access_chats(): void
    {
        // Auth guard working
        $response = $this->getJson('/api/chats');

        $response->assertUnauthorized();
    }
}

