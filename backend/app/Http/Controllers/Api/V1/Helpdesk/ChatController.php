<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Helpdesk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Helpdesk\SendMessageRequest;
use App\Http\Requests\Helpdesk\StoreChatRequest;
use App\Http\Resources\ChatResource;
use App\Http\Resources\MessageResource;
use App\Models\Chat;
use App\Services\Helpdesk\ChatService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected ChatService $chatService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $chats = $this->chatService->getUserChats($request->user());
        
        return ChatResource::collection($chats);
    }

    public function store(StoreChatRequest $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validated();
        
        $chat = $this->chatService->createChat(
            $request->user(),
            $validated['message']
        );

        return (new ChatResource($chat))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Chat $chat): JsonResource
    {
        $this->authorize('view', $chat);
        
        return new ChatResource($chat->load('messages'));
    }

    public function sendMessage(SendMessageRequest $request, Chat $chat): JsonResource
    {
        $this->authorize('update', $chat);
        
        $validated = $request->validated();
        
        $message = $this->chatService->sendMessage(
            $chat,
            $request->user(),
            $validated['content']
        );

        return new MessageResource($message);
    }
}
