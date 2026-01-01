<?php

namespace App\Enums;

enum ChatStatus: string
{
    case OPEN = 'open';
    case AI_HANDLING = 'ai_handling';
    case TRANSFERRED = 'transferred';
    case AGENT_HANDLING = 'agent_handling';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match($this) {
            self::OPEN => 'Open',
            self::AI_HANDLING => 'AI Handling',
            self::TRANSFERRED => 'Transferred',
            self::AGENT_HANDLING => 'Agent Handling',
            self::RESOLVED => 'Resolved',
            self::CLOSED => 'Closed',
        };
    }
}

