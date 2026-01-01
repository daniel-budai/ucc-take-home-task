<?php

namespace App\Providers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Broadcast::channel('chat.{chatId}', function (User $user, int $chatId) {
            $chat = Chat::findOrFail($chatId);
            
            // User can access their own chats
            if ($chat->user_id === $user->id) {
                return true;
            }
            
            // Agents can access assigned chats or unassigned chats
            if ($user->isHelpdeskAgent()) {
                return $chat->assigned_agent_id === $user->id || 
                       $chat->assigned_agent_id === null;
            }
            
            return false;
        });

        Broadcast::channel('helpdesk-agents', function (User $user) {
            return $user->isHelpdeskAgent();
        });
    }
}
