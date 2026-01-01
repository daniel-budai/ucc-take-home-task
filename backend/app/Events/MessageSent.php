<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
        public Chat $chat
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("chat.{$this->chat->id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'chat_id' => $this->message->chat_id,
                'type' => $this->message->type->value,
                'content' => $this->message->content,
                'user_id' => $this->message->user_id,
                'is_transfer_request' => $this->message->is_transfer_request,
                'created_at' => $this->message->created_at->toISOString(),
            ],
        ];
    }
}
