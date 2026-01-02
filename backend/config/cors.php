<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
    ],

    'allowed_methods' => ['*'],

    /*
     | Flexible: reads from .env with sensible local defaults
     */
    'allowed_origins' => array_values(array_filter(array_merge(
        // Main frontend (required in production)
        env('FRONTEND_URL') ? [env('FRONTEND_URL')] : [],
        
        // Additional origins (comma-separated, optional)
        env('CORS_ALLOWED_ORIGINS')
            ? explode(',', env('CORS_ALLOWED_ORIGINS'))
            : [],
        
        // Local dev defaults (only if APP_ENV is local)
        env('APP_ENV') === 'local'
            ? ['http://localhost:5173', 'http://127.0.0.1:5173']
            : []
    ))),

    'allowed_origins_patterns' => [],

    /*
     | Explicit headers instead of wildcard for better security
     */
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => [],

    /*
     | Cache preflight requests for 24 hours
     */
    'max_age' => 86400,

    'supports_credentials' => true,

];
