<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Enums\ChatStatus;
use App\Enums\MessageType;
use App\Events\MessageSent;
use App\Models\Chat;
use App\Repositories\Contracts\ChatRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Services\Helpdesk\AIService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAIResponse implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Chat $chat,
        public string $userMessage
    ) {}

    public function middleware(): array
    {
        return [new RateLimited('ai-processing')];
    }

    public function handle(
        AIService $aiService,
        MessageRepositoryInterface $messageRepository,
        ChatRepositoryInterface $chatRepository
    ): void {
        // Update status to AI_HANDLING
        $chatRepository->updateStatus($this->chat, ChatStatus::AI_HANDLING);
        
        $chatHistory = $this->chat->messages()
            ->orderBy('created_at')
            ->get()
            ->map(fn($msg) => [
                'type' => $msg->type->value,
                'content' => $msg->content,
            ])
            ->toArray();

        $aiResponse = $aiService->generateResponse(
            $this->userMessage,
            $chatHistory
        );

        $message = $messageRepository->create([
            'chat_id' => $this->chat->id,
            'user_id' => null,
            'type' => MessageType::AI,
            'content' => $aiResponse,
        ]);

        // Update status back to OPEN if not transferred
        $freshChat = $this->chat->fresh();
        if ($freshChat->status === ChatStatus::AI_HANDLING) {
            $chatRepository->updateStatus($freshChat, ChatStatus::OPEN);
        }

        broadcast(new MessageSent($message, $freshChat));
    }

    public function failed(\Throwable $exception): void
    {
        // Log failure and notify user
        Log::error('AI processing failed', [
            'chat_id' => $this->chat->id,
            'error' => $exception->getMessage(),
        ]);

        // Use repository for consistency
        $chatRepository = app(ChatRepositoryInterface::class);
        $messageRepository = app(MessageRepositoryInterface::class);
        
        $freshChat = $this->chat->fresh();
        $chatRepository->updateStatus($freshChat, ChatStatus::OPEN);
        
        $messageRepository->create([
            'chat_id' => $freshChat->id,
            'user_id' => null,
            'type' => MessageType::SYSTEM,
            'content' => 'AI service is temporarily unavailable. Please try again or request a human agent.',
        ]);
    }
}
