<?php

declare(strict_types=1);

namespace App\Services\Helpdesk;

use App\Enums\ChatStatus;
use App\Enums\MessageType;
use App\Events\ChatTransferRequested;
use App\Events\MessageSent;
use App\Jobs\ProcessAIResponse;
use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use App\Repositories\Contracts\ChatRepositoryInterface;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ChatService
{
    public function __construct(
        protected ChatRepositoryInterface $chatRepository,
        protected MessageRepositoryInterface $messageRepository,
        protected AIService $aiService
    ) {}

    public function createChat(User $user, string $initialMessage): Chat
    {
        $initialMessage = $this->sanitizeInput($initialMessage);
        
        if (empty(trim($initialMessage))) {
            throw ValidationException::withMessages([
                'message' => 'Message cannot be empty.',
            ]);
        }

        return DB::transaction(function () use ($user, $initialMessage) {
            $chat = $this->chatRepository->create([
                'user_id' => $user->id,
                'status' => ChatStatus::OPEN,
                'subject' => $this->generateSubject($initialMessage),
            ]);

            $message = $this->messageRepository->create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'type' => MessageType::USER,
                'content' => $initialMessage,
            ]);

            // Process with AI asynchronously
            ProcessAIResponse::dispatch($chat, $initialMessage)
                ->onQueue('ai-processing');

            return $chat->fresh(['messages']);
        });
    }

    public function sendMessage(Chat $chat, User $user, string $content): Message
    {
        // Prevent actions on resolved chats
        if ($chat->status === ChatStatus::RESOLVED) {
            throw ValidationException::withMessages([
                'chat' => 'This chat has been resolved. Please create a new chat.',
            ]);
        }

        $content = $this->sanitizeInput($content);
        
        // Rate limiting (only for non-agents)
        if (!$user->isHelpdeskAgent()) {
            $this->checkRateLimit($user, $chat);
        }

        $isAgent = $user->isHelpdeskAgent();
        $isTransferRequest = !$isAgent && $this->aiService->shouldTransferToHuman($content);

        $message = $this->messageRepository->create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'type' => $isAgent ? MessageType::AGENT : MessageType::USER,
            'content' => $content,
            'is_transfer_request' => $isTransferRequest,
        ]);

        // Broadcast to connected clients
        broadcast(new MessageSent($message, $chat))->toOthers();

        if ($isTransferRequest) {
            $this->handleTransferRequest($chat);
        } elseif (!$isAgent && in_array($chat->status, [ChatStatus::OPEN, ChatStatus::AI_HANDLING])) {
            ProcessAIResponse::dispatch($chat, $content)
                ->onQueue('ai-processing');
        }

        return $message;
    }

    protected function handleTransferRequest(Chat $chat): void
    {
        $this->chatRepository->updateStatus($chat, ChatStatus::TRANSFERRED);
        
        $message = $this->createSystemMessage(
            $chat,
            'User requested transfer to human agent. An agent will be with you shortly.'
        );

        broadcast(new MessageSent($message, $chat));
        broadcast(new ChatTransferRequested($chat));
    }

    public function assignToAgent(Chat $chat, User $agent): Chat
    {
        $chat = $this->chatRepository->assignToAgent($chat, $agent);

        $message = $this->createSystemMessage(
            $chat,
            "Agent {$agent->name} has joined the chat"
        );

        broadcast(new MessageSent($message, $chat));

        return $chat;
    }

    public function agentReply(Chat $chat, User $agent, string $content): Message
    {
        return $this->sendMessage($chat, $agent, $content);
    }

    public function resolveChat(Chat $chat, User $resolver): Chat
    {
        $chat = $this->chatRepository->resolveChat($chat);

        $message = $this->createSystemMessage(
            $chat,
            "Chat resolved by {$resolver->name}"
        );

        broadcast(new MessageSent($message, $chat));

        return $chat;
    }

    public function getUserChats(User $user): Collection
    {
        return $this->chatRepository->findByUser($user);
    }

    public function getUnassignedChats(): Collection
    {
        return $this->chatRepository->findUnassigned();
    }

    public function getAgentChats(User $agent): Collection
    {
        return $this->chatRepository->getAgentChats($agent);
    }

    protected function sanitizeInput(string $input): string
    {
        // Escape HTML but preserve user's exact input
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        $input = trim($input);
        
        return Str::limit($input, 5000);
    }

    protected function checkRateLimit(User $user, Chat $chat): void
    {
        $key = "chat:{$chat->id}:user:{$user->id}";
        $maxMessages = config('chat.rate_limiting.max_messages', 10);
        $decaySeconds = config('chat.rate_limiting.decay_seconds', 60);
        
        if (RateLimiter::tooManyAttempts($key, $maxMessages)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'message' => "Too many messages. Please wait {$seconds} seconds.",
            ]);
        }
        
        RateLimiter::hit($key, $decaySeconds);
    }

    protected function createSystemMessage(Chat $chat, string $content): Message
    {
        return $this->messageRepository->create([
            'chat_id' => $chat->id,
            'user_id' => null,
            'type' => MessageType::SYSTEM,
            'content' => $content,
        ]);
    }

    protected function generateSubject(string $message): string
    {
        return Str::limit($message, 50);
    }
}

