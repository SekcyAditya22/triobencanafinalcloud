<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Cart;
use App\Models\Kendaraan;
use App\Models\Content;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function process(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_amount' => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            // Debug request data
            \Log::info('Checkout request data:', $request->all());

            // Konversi total amount ke format yang benar
            $totalAmount = (int) str_replace('.', '', number_format($request->total_amount, 2, '.', ''));

            // Debug amount
            \Log::info('Amount conversion:', [
                'original' => $request->total_amount,
                'converted' => $totalAmount
            ]);

            // Buat transaksi baru
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_amount' => $request->total_amount,
                'payment_status' => 'pending',
                'approval_status' => 'pending'
            ]);

            // Simpan detail transaksi
            foreach ($request->items as $item) {
                $transaction->details()->create([
                    'kendaraan_id' => $item['kendaraan_id'],
                    'quantity' => $item['quantity'],
                    'price_per_day' => $item['kendaraan']['price_per_day']
                ]);
            }

            // Set up Midtrans
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Hitung jumlah hari
            $startDate = \Carbon\Carbon::parse($request->start_date);
            $endDate = \Carbon\Carbon::parse($request->end_date);
            $totalDays = $endDate->diffInDays($startDate) + 1;

            // Siapkan parameter untuk Midtrans
            $params = array(
                'transaction_details' => array(
                    'order_id' => 'TRX-' . $transaction->id,
                    'gross_amount' => $totalAmount,
                ),
                'item_details' => array([
                    'id' => 'RENTAL-' . $transaction->id,
                    'price' => $totalAmount,
                    'quantity' => 1,
                    'name' => sprintf(
                        'Sewa Kendaraan %d Hari (Total Rp %s)', 
                        $totalDays,
                        number_format($totalAmount, 0, ',', '.')
                    ),
                ]),
                'customer_details' => array(
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ),
                'callbacks' => array(
                    'finish' => route('transaction.payment.success', $transaction->id)
                )
            );

            // Debug parameter yang akan dikirim ke Midtrans
            \Log::info('Midtrans parameters:', $params);

            $snapToken = \Midtrans\Snap::getSnapToken($params);

            // Hapus item dari cart
            Cart::where('user_id', auth()->id())->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
                'transaction_id' => $transaction->id,
                'amount' => $totalAmount
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Checkout error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function success($transactionId)
    {
        $transaction = Transaction::with(['details.kendaraan', 'user'])->findOrFail($transactionId);
        $transaction->payment_status = 'paid';
        $transaction->save();

        return Inertia::render('TransactionSuccess', [
            'transaction' => $transaction
        ]);
    }

    public function approve($transactionId)
    {
        try {
            $transaction = Transaction::findOrFail($transactionId);
            $transaction->approval_status = 'approved';
            $transaction->save();

            \Log::info('Transaction approved:', ['id' => $transactionId]);

            return redirect()->back()->with('success', 'Transaksi berhasil disetujui');
        } catch (\Exception $e) {
            \Log::error('Error approving transaction:', [
                'id' => $transactionId,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Gagal menyetujui transaksi');
        }
    }

    public function reject($transactionId)
    {
        try {
            $transaction = Transaction::findOrFail($transactionId);
            $transaction->approval_status = 'rejected';
            $transaction->save();

            \Log::info('Transaction rejected:', ['id' => $transactionId]);

            return redirect()->back()->with('success', 'Transaksi berhasil ditolak');
        } catch (\Exception $e) {
            \Log::error('Error rejecting transaction:', [
                'id' => $transactionId,
                'error' => $e->getMessage()
            ]);
            return redirect()->back()->with('error', 'Gagal menolak transaksi');
        }
    }

    public function customerTransactions()
    {
        $transactions = Transaction::with(['details.kendaraan'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Transaksicustomer', [
            'auth' => [
                'user' => auth()->user()
            ],
            'transactions' => $transactions
        ]);
    }

    public function adminIndex()
    {
        try {
            // Debug user info
            \Log::info('User info:', [
                'user_id' => auth()->id(),
                'name' => auth()->user()->name,
                'roles' => auth()->user()->roles->pluck('name')
            ]);

            // Cek content yang dimiliki admin
            $adminContents = Content::where('user_id', auth()->id())->get();
            \Log::info('Admin contents:', [
                'count' => $adminContents->count(),
                'content_ids' => $adminContents->pluck('id')
            ]);

            if (auth()->user()->hasRole('super-admin')) {
                $transactions = Transaction::with([
                    'user',
                    'details.kendaraan.content'
                ])->orderBy('created_at', 'desc')->get();
            } else {
                // Ambil transaksi berdasarkan kendaraan di content milik admin
                $transactions = Transaction::with([
                    'user',
                    'details.kendaraan.content'
                ])
                ->whereHas('details.kendaraan', function($query) {
                    $query->whereHas('content', function($q) {
                        $q->where('user_id', auth()->id());
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();
            }

            // Debug transactions
            \Log::info('Transactions found:', [
                'count' => $transactions->count(),
                'transactions' => $transactions->map(function($t) {
                    return [
                        'id' => $t->id,
                        'customer' => $t->user->name,
                        'details' => $t->details->map(function($d) {
                            return [
                                'kendaraan' => $d->kendaraan->title,
                                'content_id' => $d->kendaraan->content_id,
                                'content_owner' => $d->kendaraan->content->user_id
                            ];
                        })
                    ];
                })
            ]);

            return Inertia::render('Dashboard/TransaksiCustomer', [
                'transactions' => $transactions,
                'userRole' => auth()->user()->roles->first()->name,
                'debug' => [
                    'userId' => auth()->id(),
                    'contentCount' => $adminContents->count(),
                    'transactionCount' => $transactions->count()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in adminIndex:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Gagal memuat data transaksi');
        }
    }

    public function customerShow($transactionId)
    {
        $transaction = Transaction::with(['details.kendaraan', 'user'])
            ->where('user_id', auth()->id())
            ->findOrFail($transactionId);

        return Inertia::render('TransactionDetail', [
            'auth' => [
                'user' => auth()->user()
            ],
            'transaction' => $transaction
        ]);
    }

    public function processPayment(Request $request, $transactionId)
    {
        try {
            \Log::info('Processing payment for transaction:', ['id' => $transactionId]);

            $transaction = Transaction::with(['details.kendaraan', 'user'])
                ->where('user_id', auth()->id())
                ->findOrFail($transactionId);

            if ($transaction->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi ini sudah dibayar'
                ], 400);
            }

            if ($transaction->approval_status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi belum disetujui'
                ], 400);
            }

            // Set up Midtrans configuration
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = false;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            // Hitung jumlah hari
            $startDate = \Carbon\Carbon::parse($transaction->start_date);
            $endDate = \Carbon\Carbon::parse($transaction->end_date);
            $totalDays = $endDate->diffInDays($startDate) + 1;

            // Ambil total amount dari database dan pastikan dalam format integer
            $totalAmount = (int) str_replace('.', '', number_format($transaction->total_amount, 2, '.', ''));

            // Debug total amount
            \Log::info('Amount details:', [
                'raw_amount' => $transaction->total_amount,
                'formatted_amount' => $totalAmount,
                'total_days' => $totalDays
            ]);

            // Buat order ID yang unik
            $orderId = 'TRX-' . $transaction->id . '-' . time();

            // Siapkan parameter untuk Midtrans dengan nilai yang sudah pasti
            $params = array(
                'transaction_details' => array(
                    'order_id' => $orderId,
                    'gross_amount' => $totalAmount,
                ),
                'item_details' => array([
                    'id' => 'RENTAL-' . $transaction->id,
                    'price' => $totalAmount,
                    'quantity' => 1,
                    'name' => sprintf(
                        'Sewa Kendaraan %d Hari (Total Rp %s)', 
                        $totalDays,
                        number_format($totalAmount, 0, ',', '.')
                    ),
                ]),
                'customer_details' => array(
                    'first_name' => $transaction->user->name,
                    'email' => $transaction->user->email,
                ),
                'callbacks' => array(
                    'finish' => route('transaction.payment.success', $transaction->id)
                )
            );

            // Debug parameter yang akan dikirim ke Midtrans
            \Log::info('Midtrans parameters:', $params);

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                
                // Update transaction dengan snap token
                $transaction->update([
                    'snap_token' => $snapToken
                ]);

                return response()->json([
                    'success' => true,
                    'snap_token' => $snapToken,
                    'transaction' => $transaction,
                    'amount' => $totalAmount
                ]);

            } catch (\Exception $e) {
                \Log::error('Midtrans Error:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'params' => $params
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Payment Processing Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentSuccess($transactionId)
    {
        try {
            $transaction = Transaction::findOrFail($transactionId);
            $transaction->payment_status = 'paid';
            $transaction->save();

            return Inertia::render('PaymentSuccess', [
                'auth' => [
                    'user' => auth()->user()
                ],
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            return redirect()->route('transaction.customer.show', $transactionId)
                ->with('error', 'Gagal memperbarui status pembayaran');
        }
    }

    public function getPendingCount()
    {
        $count = Transaction::where('user_id', auth()->id())
            ->where(function($query) {
                $query->where('payment_status', 'pending')
                      ->orWhere('approval_status', 'pending');
            })
            ->count();

        return response()->json($count);
    }

    public function cancel($id)
    {
        try {
            $transaction = Transaction::where('user_id', auth()->id())
                ->where('approval_status', 'pending')
                ->findOrFail($id);

            // Hapus detail transaksi
            $transaction->details()->delete();
            // Hapus transaksi
            $transaction->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil dibatalkan'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error canceling transaction:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal membatalkan transaksi'
            ], 500);
        }
    }

    public function handleNotification(Request $request)
    {
        try {
            $notificationBody = json_decode($request->getContent(), true);
            $transactionId = str_replace('TRX-', '', $notificationBody['order_id']);
            $transaction = Transaction::find($transactionId);

            if (!$transaction) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            $transactionStatus = $notificationBody['transaction_status'];
            $type = $notificationBody['payment_type'];
            $orderId = $notificationBody['order_id'];
            $fraud = $notificationBody['fraud_status'];

            $status = match($transactionStatus) {
                'capture' => $fraud == 'challenge' ? 'challenge' : 'success',
                'settlement' => 'success',
                'pending' => 'pending',
                'deny', 'expire', 'cancel' => 'failure',
                default => 'pending'
            };

            // Update status pembayaran
            $transaction->update([
                'payment_status' => $status,
                'payment_type' => $type
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }
} 