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
            $isStoreRoute = ($request->route() && str_starts_with($request->route()->getName() ?? '', 'store.')) 
                || $request->attributes->has('resolved_store');

            if ($isStoreRoute) {
                // Allow Facebook to frame the store front for Event Setup Tool
                $response->header('Content-Security-Policy', "frame-ancestors 'self' https://*.facebook.com https://*.facebook.net;");
            } else {
                // Anti-clickjacking guards for normal admin/dashboard pages
                $response->header('X-Frame-Options', 'SAMEORIGIN');
                $response->header('Content-Security-Policy', "frame-ancestors 'self';");
            }

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
