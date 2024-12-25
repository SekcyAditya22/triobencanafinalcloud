<?php

namespace App\Http\Controllers;

use App\Models\AdminTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Midtrans\Config;
use Midtrans\Snap;

class AdminTransactionController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
        
        // Tambahkan konfigurasi CURL untuk menonaktifkan verifikasi SSL
        Config::$curlOptions = [
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_SSL_VERIFYPEER => 0,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json']
        ];
    }

    public function index(Request $request)
    {
        $transactions = AdminTransaction::with('admin')
            ->when(!auth()->user()->hasRole('super-admin'), function ($query) {
                return $query->where('admin_id', auth()->id());
            })
            ->latest()
            ->paginate(10);

        if ($request->has('error')) {
            session()->flash('error', $request->error);
        }

        return Inertia::render('AdminTransactions/Index', [
            'transactions' => $transactions,
        ]);
    }

    public function create()
    {
        // Cek apakah sudah ada transaksi yang pending atau approved
        $existingTransaction = AdminTransaction::where('admin_id', auth()->id())
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existingTransaction) {
            if ($existingTransaction->status === 'pending') {
                return redirect()
                    ->route('dashboard.admin-transactions')
                    ->with('error', 'Anda masih memiliki permohonan yang sedang diproses.');
            }

            if ($existingTransaction->status === 'approved') {
                return redirect()
                    ->route('dashboard.admin-transactions')
                    ->with('error', 'Anda sudah memiliki permohonan yang disetujui.');
            }
        }

        return Inertia::render('AdminTransactions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $transaction = AdminTransaction::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'admin_id' => auth()->id(),
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'amount' => 500000,
        ]);

        $params = [
            'transaction_details' => [
                'order_id' => 'ADM-' . $transaction->id,
                'gross_amount' => 500000,
            ],
            'customer_details' => [
                'first_name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ],
            'callbacks' => [
                'finish' => route('dashboard.admin-transactions.success', ['transaction_id' => $transaction->id]),
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            $transaction->update(['snap_token' => $snapToken]);
            
            return redirect()->route('dashboard.admin-transactions')
                           ->with('success', 'Permohonan berhasil dibuat');
        } catch (\Exception $e) {
            \Log::error('Midtrans Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()
                           ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function processPayment(AdminTransaction $transaction)
    {
        try {
            // Periksa apakah transaksi sudah dibayar
            if ($transaction->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini sudah dibayar'
                ], 400);
            }

            $orderId = 'ADMIN-' . $transaction->id . '-' . time();
            
            // Pastikan amount adalah integer
            $amount = (int) $transaction->amount;
            
            $payload = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $amount,
                ],
                'item_details' => [
                    [
                        'id' => 'ADMIN-ACCESS-' . $transaction->id,
                        'price' => $amount,
                        'quantity' => 1,
                        'name' => 'Biaya Permohonan Admin',
                    ]
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ]
            ];

            \Log::info('Attempting to get snap token with payload:', $payload);

            $snapToken = Snap::getSnapToken($payload);
            
            // Update transaksi dengan snap token
            $transaction->update(['snap_token' => $snapToken]);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken
            ]);

        } catch (\Exception $e) {
            \Log::error('Payment processing error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'transaction_id' => $transaction->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan dalam memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    public function approve(AdminTransaction $transaction)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        $transaction->update([
            'status' => 'approved',
            'approved_at' => now()
        ]);

        return back()->with('success', 'Permohonan disetujui.');
    }

    public function reject(Request $request, AdminTransaction $transaction)
    {
        if (!Auth::user()->hasRole('super-admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string'
        ]);

        $transaction->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'rejected_at' => now()
        ]);

        return back()->with('success', 'Permohonan ditolak.');
    }

    public function destroy(AdminTransaction $transaction)
    {
        \Log::info('Attempting to delete transaction:', [
            'transaction_id' => $transaction->id,
            'user_id' => Auth::id(),
            'user_roles' => Auth::user()->roles->pluck('name')
        ]);

        // Hanya super-admin atau pemilik transaksi yang bisa menghapus
        if (!Auth::user()->hasRole('super-admin') && $transaction->admin_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        try {
            $transaction->delete();
            return back()->with('success', 'Permohonan berhasil dihapus.');
        } catch (\Exception $e) {
            \Log::error('Error deleting transaction:', [
                'error' => $e->getMessage(),
                'transaction' => $transaction->toArray()
            ]);
            return back()->with('error', 'Gagal menghapus permohonan.');
        }
    }

    public function handlePaymentCallback(Request $request)
    {
        \Log::info('Payment callback received:', $request->all());

        try {
            $orderId = $request->order_id;
            $transactionStatus = $request->transaction_status;
            $transactionId = str_replace('ADM-', '', $orderId);

            $transaction = AdminTransaction::findOrFail($transactionId);

            if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
                $transaction->update([
                    'payment_status' => 'paid',
                    'payment_time' => now()
                ]);
                
                \Log::info("Payment completed for transaction {$transactionId}");
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('Payment callback error: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }

    public function success(Request $request, $transaction_id)
    {
        try {
            $transaction = AdminTransaction::findOrFail($transaction_id);
            
            // Update payment status jika belum paid
            if ($transaction->payment_status !== 'paid') {
                $transaction->update([
                    'payment_status' => 'paid',
                    'payment_time' => now()
                ]);
            }

            // Render halaman success
            return Inertia::render('AdminTransactions/Success', [
                'transaction_id' => $transaction_id
            ]);

        } catch (\Exception $e) {
            return redirect()
                ->route('dashboard.admin-transactions')
                ->with('error', 'Terjadi kesalahan dalam memproses pembayaran');
        }
    }
} 