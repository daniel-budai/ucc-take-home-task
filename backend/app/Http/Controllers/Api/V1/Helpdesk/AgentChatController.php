<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Helpdesk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Helpdesk\SendMessageRequest;
use App\Http\Resources\ChatResource;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Services\Helpdesk\ChatService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentChatController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ChatService $chatService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $chats = $this->chatService->getAgentChats($request->user());
        
        return ChatResource::collection($chats);
    }

    public function unassigned(): AnonymousResourceCollection
    {
        $chats = $this->chatService->getUnassignedChats();
        
        return ChatResource::collection($chats);
    }

    public function show(Chat $chat): JsonResource
    {
        $this->authorize('view', $chat);
        
        // Load the chat with all relationships
        $chat->load(['messages', 'user', 'assignedAgent']);
        
        return new ChatResource($chat);
    }

    public function assign(Request $request, Chat $chat): JsonResource
    {
        $this->authorize('assign', $chat);
        
        $chat = $this->chatService->assignToAgent($chat, $request->user());
        
        return (new ChatResource($chat))
            ->additional(['message' => 'Chat assigned successfully']);
    }

    public function reply(SendMessageRequest $request, Chat $chat): JsonResource
    {
        $this->authorize('view', $chat);
        
        $validated = $request->validated();
        
        $message = $this->chatService->agentReply(
            $chat,
            $request->user(),
            $validated['content']
        );

        return new MessageResource($message);
    }

    public function resolve(Request $request, Chat $chat): JsonResource
    {
        $this->authorize('view', $chat);
        
        $chat = $this->chatService->resolveChat($chat, $request->user());
        
        return (new ChatResource($chat))
            ->additional(['message' => 'Chat resolved successfully']);
    }
}
