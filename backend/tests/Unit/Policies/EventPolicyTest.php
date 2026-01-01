<?php

namespace Tests\Unit\Policies;

use App\Models\Event;
use App\Models\User;
use App\Policies\EventPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class EventPolicyTest extends TestCase
{
    use RefreshDatabase;

    private EventPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new EventPolicy();
    }

    #[Test]
    public function owner_can_view_update_delete_their_event(): void
    {
        $user = User::factory()->create();
        $event = Event::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($this->policy->view($user, $event));
        $this->assertTrue($this->policy->update($user, $event));
        $this->assertTrue($this->policy->delete($user, $event));
    }

    #[Test]
    public function non_owner_cannot_access_event(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $event = Event::factory()->create(['user_id' => $owner->id]);

        $this->assertFalse($this->policy->view($otherUser, $event));
        $this->assertFalse($this->policy->update($otherUser, $event));
        $this->assertFalse($this->policy->delete($otherUser, $event));
    }

    #[Test]
    public function agent_cannot_access_user_event(): void
    {
        $user = User::factory()->create();
        $agent = User::factory()->create();
        $event = Event::factory()->create(['user_id' => $user->id]);

        $this->assertFalse($this->policy->view($agent, $event));
        $this->assertFalse($this->policy->update($agent, $event));
        $this->assertFalse($this->policy->delete($agent, $event));
    }
}

