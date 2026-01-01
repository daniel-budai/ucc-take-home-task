<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\Events\EventService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected EventService $eventService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $events = $this->eventService->getUserEvents(Auth::user());
        
        return EventResource::collection($events);
    }

    public function show(Event $event): JsonResource
    {
        $this->authorize('view', $event);
        
        return new EventResource($event);
    }

    public function store(StoreEventRequest $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validated();
        
        $event = $this->eventService->createEvent($validated, Auth::user());
        
        return (new EventResource($event))
            ->additional(['message' => 'Event created successfully'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResource
    {
        $this->authorize('update', $event);
        
        $validated = $request->validated();
        $event = $this->eventService->updateEventDescription($event, $validated['description']);
        
        return (new EventResource($event))
            ->additional(['message' => 'Event updated successfully']);
    }

    public function destroy(Event $event): Response
    {
        $this->authorize('delete', $event);
        
        $this->eventService->deleteEvent($event);
        
        return response()->noContent();
    }
}

