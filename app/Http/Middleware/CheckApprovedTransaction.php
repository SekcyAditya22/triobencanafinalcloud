<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckApprovedTransaction
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Jika user adalah super-admin, bypass pengecekan
        if ($user && $user->roles->contains('name', 'super-admin')) {
            return $next($request);
        }

        // Cek apakah admin memiliki transaksi yang disetujui
        if ($user && $user->hasRole('admin')) {
            $hasApprovedTransaction = $user->adminTransactions()
                ->where('status', 'approved')
                ->exists();

            if (!$hasApprovedTransaction) {
                return redirect()
                    ->route('dashboard.admin-transactions')
                    ->with('error', 'Anda harus memiliki permohonan yang disetujui sebelum dapat menambah konten.');
            }
        }

        return $next($request);
    }
} 