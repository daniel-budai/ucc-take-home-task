<?php

namespace App\Enums;

enum UserRole: string
{
    case USER = 'user';
    case HELPDESK_AGENT = 'helpdesk_agent';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match($this) {
            self::USER => 'User',
            self::HELPDESK_AGENT => 'Helpdesk Agent',
            self::ADMIN => 'Administrator',
        };
    }
}

