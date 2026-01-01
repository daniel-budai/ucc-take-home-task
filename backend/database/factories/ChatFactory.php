<?php

namespace Database\Factories;

use App\Enums\ChatStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chat>
 */
class ChatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'assigned_agent_id' => null,
            'status' => ChatStatus::OPEN,
            'subject' => fake()->sentence(5),
            'resolved_at' => null,
        ];
    }

    /**
     * Indicate that the chat is resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ChatStatus::RESOLVED,
            'resolved_at' => now(),
        ]);
    }

    /**
     * Indicate that the chat is transferred.
     */
    public function transferred(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ChatStatus::TRANSFERRED,
        ]);
    }

    /**
     * Indicate that the chat is being handled by an agent.
     */
    public function agentHandling(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ChatStatus::AGENT_HANDLING,
        ]);
    }
}

