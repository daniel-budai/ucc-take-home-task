<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Services\Events\EventService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected EventService $eventService
    ) {}

    public function index(): JsonResponse
    {
        $events = $this->eventService->getUserEvents(Auth::user());
        
        return response()->json([
            'success' => true,
            'data' => EventResource::collection($events)
        ], 200);
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);
        
        return response()->json([
            'success' => true,
            'data' => new EventResource($event)
        ], 200);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        $event = $this->eventService->createEvent($validated, Auth::user());
        
        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'data' => new EventResource($event)
        ], 201);
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);
        
        $validated = $request->validated();
        $event = $this->eventService->updateEventDescription($event, $validated['description']);
        
        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'data' => new EventResource($event)
        ], 200);
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);
        
        $this->eventService->deleteEvent($event);
        
        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ], 200);
    }
}

