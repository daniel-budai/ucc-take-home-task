<?php

namespace Tests\Feature\Event;

use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Tests\Traits\CreatesTestUsers;

class EventCrudTest extends TestCase
{
    use RefreshDatabase, CreatesTestUsers;

    #[Test]
    public function user_can_list_their_events(): void
    {
        //core listing functionality
        $user = $this->createUser();
        Event::factory()->count(3)->create(['user_id' => $user->id]);
        
        // Create events for another user (should NOT appear)
        Event::factory()->count(2)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/events');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    #[Test]
    public function user_can_create_event(): void
    {
        //core creation functionality
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $eventData = [
            'title' => 'Team Meeting',
            'occurrence' => now()->addDay()->toISOString(),
            'description' => 'Quarterly planning session',
        ];

        $response = $this->postJson('/api/events', $eventData);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Team Meeting');

        $this->assertDatabaseHas('events', [
            'title' => 'Team Meeting',
            'user_id' => $user->id,
        ]);
    }

    #[Test]
    public function event_requires_title_and_future_occurrence(): void
    {
        //validation rules
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/events', [
            'title' => '',
            'occurrence' => now()->subDay()->toISOString(),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'occurrence']);
    }

    #[Test]
    public function user_can_view_their_event(): void
    {
        //core view functionality
        $user = $this->createUser();
        $event = Event::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/events/{$event->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $event->id)
            ->assertJsonPath('data.title', $event->title);
    }

    #[Test]
    public function user_can_update_their_event(): void
    {
        //core update functionality
        $user = $this->createUser();
        $event = Event::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/events/{$event->id}", [
            'description' => 'Updated description',
        ]);

        $response->assertOk();
        $this->assertEquals('Updated description', $event->fresh()->description);
    }

    #[Test]
    public function user_cannot_update_others_event(): void
    {
        //Authorization - data isolation
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $event = Event::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($otherUser);

        $response = $this->putJson("/api/events/{$event->id}", [
            'description' => 'Hacked!',
        ]);

        $response->assertForbidden();
    }

    #[Test]
    public function user_cannot_view_others_event(): void
    {
        // authorization - data isolation
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $event = Event::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/events/{$event->id}");

        $response->assertForbidden();
    }

    #[Test]
    public function user_can_delete_their_event(): void
    {
        // Core delete functionality
        $user = $this->createUser();
        $event = Event::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('events', ['id' => $event->id]);
    }

    #[Test]
    public function user_cannot_delete_others_event(): void
    {
        // data isolation
        $owner = $this->createUser();
        $otherUser = $this->createUser();
        $event = Event::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($otherUser);

        $response = $this->deleteJson("/api/events/{$event->id}");

        $response->assertForbidden();
    }

    #[Test]
    public function unauthenticated_user_cannot_access_events(): void
    {
        //Auth guard working
        $response = $this->getJson('/api/events');

        $response->assertUnauthorized();
    }

    #[Test]
    public function event_occurrence_must_be_valid_iso_format(): void
    {
        //invalid date format
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/events', [
            'title' => 'Meeting',
            'occurrence' => 'not-a-date',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['occurrence']);
    }

    #[Test]
    public function event_title_has_maximum_length(): void
    {
        // title length limit
        $user = $this->createUser();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/events', [
            'title' => str_repeat('a', 256), // 255 max
            'occurrence' => now()->addDay()->toISOString(),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function event_resource_has_correct_structure(): void
    {
        $user = $this->createUser();
        $event = Event::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/events/{$event->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'description',
                    'occurrence',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }
}

