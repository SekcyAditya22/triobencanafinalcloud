<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AdminTransaction;

class CheckAdminApproval
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->user()->hasRole('admin')) {
            $hasApprovedTransaction = AdminTransaction::where('admin_id', auth()->id())
                ->where('status', 'approved')
                ->exists();

            if (!$hasApprovedTransaction) {
                return redirect()->route('admin-transactions.index')
                    ->with('error', 'Anda harus mendapatkan persetujuan super-admin terlebih dahulu.');
            }
        }

        return $next($request);
    }
} 