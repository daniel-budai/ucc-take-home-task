<?php

namespace App\Repositories\Contracts;

use App\Enums\ChatStatus;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Support\Collection;

interface ChatRepositoryInterface
{
    public function create(array $data): Chat;
    
    public function updateStatus(Chat $chat, ChatStatus $status): Chat;
    
    public function assignToAgent(Chat $chat, User $agent): Chat;
    
    public function resolveChat(Chat $chat): Chat;
    
    public function findById(int $id): ?Chat;
    
    public function findByUser(User $user): Collection;
    
    public function findUnassigned(): Collection;
    
    public function getAgentChats(User $agent): Collection;
}

