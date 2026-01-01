<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Chat;
use App\Models\Message;
use App\Repositories\Contracts\MessageRepositoryInterface;
use Illuminate\Support\Collection;

class MessageRepository implements MessageRepositoryInterface
{
    public function create(array $data): Message
    {
        return Message::create($data);
    }

    public function findByChat(Chat $chat): Collection
    {
        return $chat->messages()
            ->with('user')
            ->orderBy('created_at')
            ->get();
    }

    public function getChatHistory(Chat $chat, int $limit = 10): Collection
    {
        return $chat->messages()
            ->latest()
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }
}

