<?php

namespace Tests\Unit\Services;

use App\Enums\ChatStatus;
use App\Enums\MessageType;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ChatRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Services\Helpdesk\AIService;
use App\Services\Helpdesk\ChatService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class ChatServiceTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    private ChatService $chatService;
    private ChatRepositoryInterface $chatRepository;
    private MessageRepositoryInterface $messageRepository;
    private AIService $aiService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->chatRepository = app(ChatRepositoryInterface::class);
        $this->messageRepository = app(MessageRepositoryInterface::class);
        $this->aiService = app(AIService::class);
        $this->chatService = new ChatService(
            $this->chatRepository,  
            $this->messageRepository,
            $this->aiService
        );
    }

    #[Test]
    public function create_chat_rejects_empty_message(): void
    {
        // Validation - empty messages should be rejected
        $user = $this->createUser();

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $this->expectExceptionMessage('Message cannot be empty.');

        $this->chatService->createChat($user, '   ');
    }

    #[Test]
    public function create_chat_sanitizes_html_content(): void
    {
        // Security - HTML should be escaped
        $user = $this->createUser();
        $message = '<script>alert("xss")</script>Hello';

        $chat = $this->chatService->createChat($user, $message);

        $firstMessage = $chat->messages()->first();
        $this->assertStringNotContainsString('<script>', $firstMessage->content);
        $this->assertStringContainsString('Hello', $firstMessage->content);
    }

    #[Test]
    public function create_chat_truncates_very_long_messages(): void
    {
        // Validation - messages over 5000 chars should be truncated
        $user = $this->createUser();
        $longMessage = str_repeat('a', 6000);

        $chat = $this->chatService->createChat($user, $longMessage);

        $firstMessage = $chat->messages()->first();
        // HTML escaping might add a few chars, so check it's close to 5000
        $this->assertLessThanOrEqual(5010, strlen($firstMessage->content));
        $this->assertGreaterThanOrEqual(4990, strlen($firstMessage->content));
    }

    #[Test]
    public function create_chat_generates_subject_from_message(): void
    {
        // Business logic - subject should be generated
        $user = $this->createUser();
        $message = 'I need help with my order that was delayed';

        $chat = $this->chatService->createChat($user, $message);

        $this->assertNotNull($chat->subject);
        $this->assertLessThanOrEqual(50, strlen($chat->subject));
        $this->assertStringContainsString('I need help', $chat->subject);
    }

    #[Test]
    public function send_message_enforces_rate_limit_for_users(): void
    {
        // Business rule - rate limiting for users
        $user = $this->createUser();
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'status' => ChatStatus::OPEN,
        ]);

        // Set up rate limiter to be at limit - hit it 10 times (the max)
        $key = "chat:{$chat->id}:user:{$user->id}";
        for ($i = 0; $i < 10; $i++) {
            RateLimiter::hit($key, 60);
        }

        $this->expectException(\Illuminate\Validation\ValidationException::class);
        $this->expectExceptionMessage('Too many messages');

        $this->chatService->sendMessage($chat, $user, 'Another message');
    }

    #[Test]
    public function send_message_bypasses_rate_limit_for_agents(): void
    {
        // Business rule - agents should not be rate limited
        $agent = $this->createAgent();
        $chat = Chat::factory()->create([
            'status' => ChatStatus::OPEN,
        ]);

        // Even if rate limit is hit, agent should be able to send
        $key = "chat:{$chat->id}:user:{$agent->id}";
        RateLimiter::hit($key, 60, 10);

        $message = $this->chatService->sendMessage($chat, $agent, 'Agent message');

        $this->assertInstanceOf(Message::class, $message);
        $this->assertEquals('Agent message', $message->content);
    }

    #[Test]
    public function send_message_sanitizes_html_content(): void
    {
        // Security - HTML should be escaped
        $user = $this->createUser();
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'status' => ChatStatus::OPEN,
        ]);

        $htmlContent = '<script>alert("xss")</script>Hello World';
        $message = $this->chatService->sendMessage($chat, $user, $htmlContent);

        $this->assertStringNotContainsString('<script>', $message->content);
        $this->assertStringContainsString('Hello World', $message->content);
    }

    #[Test]
    public function send_message_truncates_very_long_content(): void
    {
                    // Validation - content over 5000 chars should be truncated
        $user = $this->createUser();
        $chat = Chat::factory()->create([
            'user_id' => $user->id,
            'status' => ChatStatus::OPEN,
        ]);

        $longContent = str_repeat('a', 6000);
        $message = $this->chatService->sendMessage($chat, $user, $longContent);

        // HTML escaping might add a few chars, so check it's close to 5000
        $this->assertLessThanOrEqual(5010, strlen($message->content));
        $this->assertGreaterThanOrEqual(4990, strlen($message->content));
    }
}

