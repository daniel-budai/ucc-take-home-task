<?php

namespace Tests\Unit\Repositories;

use App\Models\Chat;
use App\Models\Message;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MessageRepositoryTest extends TestCase
{
    use RefreshDatabase;

    private MessageRepositoryInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = app(MessageRepositoryInterface::class);
    }

    #[Test]
    public function creates_message_with_data(): void
    {
        $chat = Chat::factory()->create();
        $data = [
            'chat_id' => $chat->id,
            'content' => 'Test message',
            'type' => \App\Enums\MessageType::USER,
        ];

        $message = $this->repository->create($data);

        $this->assertInstanceOf(Message::class, $message);
        $this->assertEquals($chat->id, $message->chat_id);
        $this->assertEquals('Test message', $message->content);
    }

    #[Test]
    public function finds_messages_by_chat(): void
    {
        $chat = Chat::factory()->create();
        Message::factory()->count(3)->create(['chat_id' => $chat->id]);
        Message::factory()->count(2)->create(); // Other chats

        $messages = $this->repository->findByChat($chat);

        $this->assertCount(3, $messages);
        $messages->each(fn($message) => $this->assertEquals($chat->id, $message->chat_id));
    }

    #[Test]
    public function finds_messages_ordered_by_created_at(): void
    {
        $chat = Chat::factory()->create();
        $message1 = Message::factory()->create([
            'chat_id' => $chat->id,
            'created_at' => now()->subHours(2),
        ]);
        $message2 = Message::factory()->create([
            'chat_id' => $chat->id,
            'created_at' => now()->subHour(),
        ]);
        $message3 = Message::factory()->create([
            'chat_id' => $chat->id,
            'created_at' => now(),
        ]);

        $messages = $this->repository->findByChat($chat);

        $this->assertEquals($message1->id, $messages[0]->id);
        $this->assertEquals($message2->id, $messages[1]->id);
        $this->assertEquals($message3->id, $messages[2]->id);
    }

    #[Test]
    public function gets_chat_history_with_limit(): void
    {
        $chat = Chat::factory()->create();
        Message::factory()->count(15)->create(['chat_id' => $chat->id]);

        $history = $this->repository->getChatHistory($chat, 10);

        $this->assertCount(10, $history);
    }

    #[Test]
    public function gets_latest_messages_in_history(): void
    {
        $chat = Chat::factory()->create();
        $oldMessage = Message::factory()->create([
            'chat_id' => $chat->id,
            'created_at' => now()->subDays(2),
        ]);
        $newMessage = Message::factory()->create([
            'chat_id' => $chat->id,
            'created_at' => now(),
        ]);

        $history = $this->repository->getChatHistory($chat, 10);

        $this->assertTrue($history->contains('id', $newMessage->id));
    }
}

