<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHelpdeskAgent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isHelpdeskAgent()) {
            abort(403, 'Access denied. Helpdesk agent privileges required.');
        }

        return $next($request);
    }
}
