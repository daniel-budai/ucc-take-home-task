<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatTransferRequested implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Chat $chat) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('helpdesk-agents'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.transfer-requested';
    }

    public function broadcastWith(): array
    {
        return [
            'chat' => [
                'id' => $this->chat->id,
                'user_id' => $this->chat->user_id,
                'status' => $this->chat->status->value,
                'subject' => $this->chat->subject,
                'created_at' => $this->chat->created_at->toISOString(),
            ],
        ];
    }
}
