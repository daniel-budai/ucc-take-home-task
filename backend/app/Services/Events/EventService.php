<?php

namespace App\Services\Events;

use App\Models\Event;
use App\Models\User;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EventService
{
    public function __construct(
        protected EventRepositoryInterface $repository
    ) {}

    public function createEvent(array $data, User $user): Event
    {
        return $this->repository->create($data, $user);
    }

    public function updateEventDescription(Event $event, string $description): Event
    {
        return $this->repository->update($event, ['description' => trim($description)]);
    }

    public function deleteEvent(Event $event): bool
    {
        return $this->repository->delete($event);
    }

    public function getUserEvents(User $user): Collection
    {
        return $this->repository->findByUser($user);
    }

    public function getUserEventsPaginated(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateByUser($user, $perPage);
    }

    public function getEventById(int $id): ?Event
    {
        return $this->repository->findById($id);
    }
}

