<?php

namespace App\Repositories\Contracts;

use App\Models\Event;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface EventRepositoryInterface
{
    public function create(array $data, User $user): Event;
    
    public function update(Event $event, array $data): Event;
    
    public function delete(Event $event): bool;
    
    public function findById(int $id): ?Event;
    
    public function findByUser(User $user): Collection;
    
    public function paginateByUser(User $user, int $perPage = 15): LengthAwarePaginator;
}

