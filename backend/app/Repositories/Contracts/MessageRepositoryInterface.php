<?php

namespace App\Repositories\Contracts;

use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Collection;

interface MessageRepositoryInterface
{
    public function create(array $data): Message;
    
    public function findByChat(Chat $chat): Collection;
    
    public function getChatHistory(Chat $chat, int $limit = 10): Collection;
}

