<?php

declare(strict_types=1);

return [
    'rate_limiting' => [
        'max_messages' => (int) env('CHAT_RATE_LIMIT_MAX', 10),
        'decay_seconds' => (int) env('CHAT_RATE_LIMIT_DECAY', 60),
    ],
];

