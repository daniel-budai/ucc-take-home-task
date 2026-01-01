<?php

namespace Tests\Unit\Repositories;

use App\Enums\ChatStatus;
use App\Models\Chat;
use App\Models\User;
use App\Repositories\Contracts\ChatRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class ChatRepositoryTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    private ChatRepositoryInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = app(ChatRepositoryInterface::class);
    }

    #[Test]
    public function creates_chat_with_data(): void
    {
        $user = $this->createUser();
        $data = [
            'user_id' => $user->id,
            'status' => ChatStatus::OPEN,
            'subject' => 'Test Subject',
        ];

        $chat = $this->repository->create($data);

        $this->assertInstanceOf(Chat::class, $chat);
        $this->assertEquals($user->id, $chat->user_id);
        $this->assertEquals(ChatStatus::OPEN, $chat->status);
        $this->assertEquals('Test Subject', $chat->subject);
    }

    #[Test]
    public function updates_chat_status(): void
    {
        $chat = Chat::factory()->create(['status' => ChatStatus::OPEN]);

        $updatedChat = $this->repository->updateStatus($chat, ChatStatus::TRANSFERRED);

        $this->assertEquals(ChatStatus::TRANSFERRED, $updatedChat->status);
        $this->assertEquals(ChatStatus::TRANSFERRED, $chat->fresh()->status);
    }

    #[Test]
    public function assigns_chat_to_agent(): void
    {
        $chat = Chat::factory()->create(['assigned_agent_id' => null]);
        $agent = $this->createAgent();

        $updatedChat = $this->repository->assignToAgent($chat, $agent);

        $this->assertEquals($agent->id, $updatedChat->assigned_agent_id);
        $this->assertEquals(ChatStatus::AGENT_HANDLING, $updatedChat->status);
    }

    #[Test]
    public function resolves_chat(): void
    {
        $chat = Chat::factory()->create(['status' => ChatStatus::AGENT_HANDLING]);

        $updatedChat = $this->repository->resolveChat($chat);

        $this->assertEquals(ChatStatus::RESOLVED, $updatedChat->status);
        $this->assertNotNull($updatedChat->resolved_at);
    }

    #[Test]
    public function finds_chat_by_id_with_relations(): void
    {
        $chat = Chat::factory()->create();

        $found = $this->repository->findById($chat->id);

        $this->assertInstanceOf(Chat::class, $found);
        $this->assertEquals($chat->id, $found->id);
        $this->assertTrue($found->relationLoaded('messages'));
        $this->assertTrue($found->relationLoaded('user'));
    }

    #[Test]
    public function finds_chats_by_user(): void
    {
        $user = $this->createUser();
        Chat::factory()->count(3)->create(['user_id' => $user->id]);
        Chat::factory()->count(2)->create(); // Other users

        $chats = $this->repository->findByUser($user);

        $this->assertCount(3, $chats);
        $chats->each(fn($chat) => $this->assertEquals($user->id, $chat->user_id));
    }

    #[Test]
    public function finds_unassigned_chats(): void
    {
        Chat::factory()->count(2)->create([
            'assigned_agent_id' => null,
            'status' => ChatStatus::TRANSFERRED,
        ]);
        Chat::factory()->create([
            'assigned_agent_id' => null,
            'status' => ChatStatus::OPEN,
        ]);
        Chat::factory()->create([
            'assigned_agent_id' => $this->createAgent()->id,
            'status' => ChatStatus::TRANSFERRED,
        ]);

        $unassigned = $this->repository->findUnassigned();

        $this->assertCount(3, $unassigned);
        $unassigned->each(fn($chat) => $this->assertNull($chat->assigned_agent_id));
    }

    #[Test]
    public function gets_agent_chats(): void
    {
        $agent = $this->createAgent();
        Chat::factory()->count(2)->create([
            'assigned_agent_id' => $agent->id,
            'status' => ChatStatus::AGENT_HANDLING,
        ]);
        Chat::factory()->create([
            'assigned_agent_id' => $agent->id,
            'status' => ChatStatus::TRANSFERRED,
        ]);
        Chat::factory()->create([
            'assigned_agent_id' => $agent->id,
            'status' => ChatStatus::RESOLVED,
        ]);

        $chats = $this->repository->getAgentChats($agent);

        $this->assertCount(3, $chats);
        $chats->each(fn($chat) => $this->assertEquals($agent->id, $chat->assigned_agent_id));
    }
}

