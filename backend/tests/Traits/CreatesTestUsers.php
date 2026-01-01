<?php

namespace Tests\Traits;

use App\Enums\UserRole;
use App\Models\User;

trait CreatesTestUsers
{
    protected function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => UserRole::USER,
        ], $attributes));
    }

    protected function createAgent(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => UserRole::HELPDESK_AGENT,
        ], $attributes));
    }

    protected function createAdmin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => UserRole::ADMIN,
        ], $attributes));
    }
}

