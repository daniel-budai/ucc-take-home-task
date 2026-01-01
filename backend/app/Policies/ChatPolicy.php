<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Chat;
use App\Models\User;

class ChatPolicy
{
    public function view(User $user, Chat $chat): bool
    {
        return $this->isOwner($user, $chat) || $this->canAgentAccess($user, $chat);
    }

    public function update(User $user, Chat $chat): bool
    {
        return $this->view($user, $chat);
    }

    public function assign(User $user, Chat $chat): bool
    {
        return $user->isHelpdeskAgent();
    }

    private function isOwner(User $user, Chat $chat): bool
    {
        return $chat->user_id === $user->id;
    }

    private function canAgentAccess(User $user, Chat $chat): bool
    {
        return $user->isHelpdeskAgent() && 
               ($chat->assigned_agent_id === $user->id || $chat->assigned_agent_id === null);
    }
}
