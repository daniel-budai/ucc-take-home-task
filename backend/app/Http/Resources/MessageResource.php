<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chat_id' => $this->chat_id,
            'type' => $this->type->value,
            'content' => $this->content,
            'user' => new UserResource($this->whenLoaded('user')),
            'is_transfer_request' => $this->is_transfer_request,
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
