<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Enums\ChatStatus;
use App\Models\Chat;
use App\Models\User;
use App\Repositories\Contracts\ChatRepositoryInterface;
use Illuminate\Support\Collection;

class ChatRepository implements ChatRepositoryInterface
{
    public function create(array $data): Chat
    {
        return Chat::create($data);
    }

    public function updateStatus(Chat $chat, ChatStatus $status): Chat
    {
        $chat->update(['status' => $status]);
        return $chat->fresh();
    }

    public function assignToAgent(Chat $chat, User $agent): Chat
    {
        $chat->update([
            'assigned_agent_id' => $agent->id,
            'status' => ChatStatus::AGENT_HANDLING,
        ]);
        return $chat->fresh(['messages', 'user', 'assignedAgent']);
    }

    public function resolveChat(Chat $chat): Chat
    {
        $chat->update([
            'status' => ChatStatus::RESOLVED,
            'resolved_at' => now(),
        ]);
        return $chat->fresh();
    }

    public function findById(int $id): ?Chat
    {
        return Chat::with(['messages', 'user', 'assignedAgent'])->find($id);
    }

    public function findByUser(User $user): Collection
    {
        return Chat::where('user_id', $user->id)
            ->with(['latestMessage', 'assignedAgent'])
            ->latest()
            ->get();
    }

    public function findUnassigned(): Collection
    {
        return Chat::whereNull('assigned_agent_id')
            ->whereIn('status', [ChatStatus::TRANSFERRED, ChatStatus::OPEN])
            ->with(['latestMessage', 'user'])
            ->oldest('created_at')
            ->get();
    }

    public function getAgentChats(User $agent): Collection
    {
        return Chat::where('assigned_agent_id', $agent->id)
            ->whereIn('status', [ChatStatus::AGENT_HANDLING, ChatStatus::TRANSFERRED])
            ->with(['latestMessage', 'user'])
            ->latest('updated_at')
            ->get();
    }
}

