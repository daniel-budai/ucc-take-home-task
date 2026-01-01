<?php

namespace App\Enums;

enum MessageType: string
{
    case USER = 'user';
    case AI = 'ai';
    case AGENT = 'agent';
    case SYSTEM = 'system';

    public function label(): string
    {
        return match($this) {
            self::USER => 'User',
            self::AI => 'AI',
            self::AGENT => 'Agent',
            self::SYSTEM => 'System',
        };
    }
}

