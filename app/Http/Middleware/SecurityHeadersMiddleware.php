<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if (method_exists($response, 'header')) {
            // Anti-clickjacking guards
            $response->header('X-Frame-Options', 'SAMEORIGIN');
            $response->header('Content-Security-Policy', "frame-ancestors 'self';");

            // Prevent MIME sniffing
            $response->header('X-Content-Type-Options', 'nosniff');

            // Referrer Policy
            $response->header('Referrer-Policy', 'strict-origin-when-cross-origin');

            // Disable browser features we don't use
            $response->header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        }

        return $response;
    }
}
