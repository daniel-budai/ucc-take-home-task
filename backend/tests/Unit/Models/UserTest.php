<?php

namespace Tests\Unit\Models;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function user_role_is_not_helpdesk_agent(): void
    {
        $user = User::factory()->create(['role' => UserRole::USER]);

        $this->assertFalse($user->isHelpdeskAgent());
    }

    #[Test]
    public function helpdesk_agent_role_is_helpdesk_agent(): void
    {
        $agent = User::factory()->create(['role' => UserRole::HELPDESK_AGENT]);

        $this->assertTrue($agent->isHelpdeskAgent());
    }

    #[Test]
    public function admin_role_is_helpdesk_agent(): void
    {
        // Admin has agent privileges
        $admin = User::factory()->create(['role' => UserRole::ADMIN]);

        $this->assertTrue($admin->isHelpdeskAgent());
    }
}

