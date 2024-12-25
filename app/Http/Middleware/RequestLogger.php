<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class RequestLogger
{
    public function handle($request, Closure $next)
    {
        Log::info('Incoming request', [
            'method' => $request->method(),
            'url' => $request->url(),
            'user' => auth()->id(),
            'headers' => $request->headers->all()
        ]);

        return $next($request);
    }
} 