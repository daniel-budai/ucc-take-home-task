<?php

namespace Tests\Unit\Repositories;

use App\Models\Event;
use App\Models\User;
use App\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class EventRepositoryTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    private EventRepositoryInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = app(EventRepositoryInterface::class);
    }

    #[Test]
    public function creates_event_for_user(): void
    {
        $user = $this->createUser();
        $data = [
            'title' => 'Test Event',
            'description' => 'Test Description',
            'occurrence' => now()->addDay(),
        ];

        $event = $this->repository->create($data, $user);

        $this->assertInstanceOf(Event::class, $event);
        $this->assertEquals($user->id, $event->user_id);
        $this->assertEquals('Test Event', $event->title);
    }

    #[Test]
    public function updates_event(): void
    {
        $event = Event::factory()->create(['title' => 'Old Title']);

        $updated = $this->repository->update($event, ['title' => 'New Title']);

        $this->assertEquals('New Title', $updated->title);
        $this->assertEquals('New Title', $event->fresh()->title);
    }

    #[Test]
    public function deletes_event(): void
    {
        $event = Event::factory()->create();

        $result = $this->repository->delete($event);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    #[Test]
    public function finds_event_by_id(): void
    {
        $event = Event::factory()->create();

        $found = $this->repository->findById($event->id);

        $this->assertInstanceOf(Event::class, $found);
        $this->assertEquals($event->id, $found->id);
    }

    #[Test]
    public function returns_null_when_event_not_found(): void
    {
        $found = $this->repository->findById(99999);

        $this->assertNull($found);
    }

    #[Test]
    public function finds_events_by_user(): void
    {
        $user = $this->createUser();
        Event::factory()->count(3)->create(['user_id' => $user->id]);
        Event::factory()->count(2)->create(); // Other users

        $events = $this->repository->findByUser($user);

        $this->assertCount(3, $events);
        $events->each(fn($event) => $this->assertEquals($user->id, $event->user_id));
    }

    #[Test]
    public function finds_events_ordered_by_occurrence(): void
    {
        $user = $this->createUser();
        $event1 = Event::factory()->create([
            'user_id' => $user->id,
            'occurrence' => now()->addDays(3),
        ]);
        $event2 = Event::factory()->create([
            'user_id' => $user->id,
            'occurrence' => now()->addDay(),
        ]);
        $event3 = Event::factory()->create([
            'user_id' => $user->id,
            'occurrence' => now()->addDays(2),
        ]);

        $events = $this->repository->findByUser($user);

        $this->assertEquals($event2->id, $events[0]->id);
        $this->assertEquals($event3->id, $events[1]->id);
        $this->assertEquals($event1->id, $events[2]->id);
    }

    #[Test]
    public function paginates_events_by_user(): void
    {
        $user = $this->createUser();
        Event::factory()->count(20)->create(['user_id' => $user->id]);

        $paginated = $this->repository->paginateByUser($user, 10);

        $this->assertCount(10, $paginated->items());
        $this->assertEquals(20, $paginated->total());
    }
}

