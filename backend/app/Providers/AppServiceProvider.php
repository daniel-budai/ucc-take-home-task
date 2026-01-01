<?php

namespace App\Providers;

use App\Models\User;
use App\Repositories\Contracts\EventRepositoryInterface;
use App\Repositories\Eloquent\EventRepository;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind repository interfaces to implementations
        $this->app->bind(EventRepositoryInterface::class, EventRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Configure password reset URL for API-only app
        // This is Laravel's recommended way to customize reset URLs
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return sprintf(
                '%s/reset-password?%s',
                rtrim(config('app.frontend_url'), '/'),
                http_build_query([
                    'token' => $token,
                    'email' => $user->email,
                ])
            );
        });
    }
}
