<?php

namespace App\Repositories\Eloquent;

use App\Models\Event;
use App\Models\User;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EventRepository implements EventRepositoryInterface
{
    public function create(array $data, User $user): Event
    {
        return $user->events()->create($data);
    }

    public function update(Event $event, array $data): Event
    {
        $event->update($data);
        return $event->fresh();
    }

    public function delete(Event $event): bool
    {
        return $event->delete();
    }

    public function findById(int $id): ?Event
    {
        return Event::find($id);
    }

    public function findByUser(User $user): Collection
    {
        return Event::where('user_id', $user->id)
            ->orderBy('occurrence', 'asc')
            ->get();
    }

    public function paginateByUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Event::where('user_id', $user->id)
            ->orderBy('occurrence', 'asc')
            ->paginate($perPage);
    }
}

