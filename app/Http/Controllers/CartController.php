<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Kendaraan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use Carbon\Carbon;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::with(['kendaraan' => function($query) {
            $query->select('id', 'title', 'price_per_day', 'unit', 'photos');
        }])
        ->where('user_id', auth()->id())
        ->get()
        ->map(function ($item) {
            if ($item->kendaraan->photos) {
                try {
                    $photos = is_string($item->kendaraan->photos) 
                        ? json_decode($item->kendaraan->photos, true) 
                        : $item->kendaraan->photos;
                    $item->kendaraan->photos = $photos;
                } catch (\Exception $e) {
                    $item->kendaraan->photos = null;
                }
            }
            return $item;
        });

        return Inertia::render('Cart', [
            'auth' => [
                'user' => auth()->user()
            ],
            'cart' => $cart
        ]);
    }

    public function add(Kendaraan $kendaraan)
    {
        try {
            $existingCart = Cart::where('user_id', auth()->id())
                ->where('kendaraan_id', $kendaraan->id)
                ->first();

            if (!$existingCart) {
                Cart::create([
                    'user_id' => auth()->id(),
                    'kendaraan_id' => $kendaraan->id,
                    'quantity' => 1
                ]);
            } else {
                $existingCart->update([
                    'quantity' => $existingCart->quantity + 1
                ]);
            }

            $cartCount = Cart::where('user_id', auth()->id())->count();
            
            return response()->json([
                'success' => true,
                'message' => 'Kendaraan berhasil ditambahkan ke keranjang',
                'cartCount' => $cartCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan ke keranjang: ' . $e->getMessage()
            ], 500);
        }
    }

    public function remove(Cart $cart)
    {
        if ($cart->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $cart->delete();
            return response()->json([
                'success' => true,
                'message' => 'Item berhasil dihapus dari keranjang'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus item dari keranjang'
            ], 500);
        }
    }

    public function checkout(Request $request)
    {
        // Jika ada transaction_id, ambil data transaksi
        if ($request->has('transaction_id')) {
            $transaction = Transaction::with(['details.kendaraan'])
                ->where('user_id', auth()->id())
                ->findOrFail($request->transaction_id);

            return Inertia::render('Checkout', [
                'auth' => [
                    'user' => auth()->user()
                ],
                'transaction' => $transaction,
                'rental_details' => [
                    'start_date' => $transaction->start_date,
                    'end_date' => $transaction->end_date,
                    'total_amount' => $transaction->total_amount
                ]
            ]);
        }

        // Kode existing untuk checkout dari cart
        $cart = Cart::with(['kendaraan' => function($query) {
            $query->select('id', 'title', 'price_per_day', 'unit', 'photos');
        }])
        ->where('user_id', auth()->id())
        ->get()
        ->map(function ($item) {
            if ($item->kendaraan->photos) {
                try {
                    $photos = is_string($item->kendaraan->photos) 
                        ? json_decode($item->kendaraan->photos, true) 
                        : $item->kendaraan->photos;
                    $item->kendaraan->photos = $photos;
                } catch (\Exception $e) {
                    $item->kendaraan->photos = null;
                }
            }
            return $item;
        });

        if ($cart->isEmpty()) {
            return redirect()->route('cart.index')
                ->with('error', 'Keranjang kosong');
        }

        return Inertia::render('Checkout', [
            'auth' => [
                'user' => auth()->user()
            ],
            'cart' => $cart,
            'rental_details' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'total_days' => $request->total_days,
                'total_amount' => $request->total_amount
            ]
        ]);
    }

    public function processCheckout(Request $request)
    {
        try {
            DB::beginTransaction();

            // Hitung jumlah hari dengan benar
            $startDate = \Carbon\Carbon::parse($request->start_date)->startOfDay();
            $endDate = \Carbon\Carbon::parse($request->end_date)->startOfDay();
            $totalDays = max(1, $endDate->diffInDays($startDate) + 1);

            \Log::info('Checkout request data:', [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'total_days' => $totalDays,
                'total_amount' => $request->total_amount,
                'items' => $request->items
            ]);

            // Gunakan total amount dari request (yang sudah dihitung di frontend)
            $totalAmount = $request->total_amount;

            // Buat transaksi baru dengan total amount yang benar
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'total_amount' => $totalAmount,
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

            // Siapkan item details untuk Midtrans
            $itemDetails = [];
            foreach ($request->items as $item) {
                $pricePerDay = abs((int) $item['kendaraan']['price_per_day']);
                $quantity = abs((int) $item['quantity']);
                $pricePerItem = $pricePerDay * $totalDays;
                
                $itemDetails[] = [
                    'id' => 'VEHICLE-' . $item['kendaraan_id'],
                    'price' => $pricePerItem,
                    'quantity' => $quantity,
                    'name' => $item['kendaraan']['title'] . ' (' . $totalDays . ' hari)'
                ];
            }

            // Set up Midtrans
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = false;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            \Midtrans\Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json']
            ];

            $params = [
                'transaction_details' => [
                    'order_id' => 'TRX-' . $transaction->id . '-' . time(),
                    'gross_amount' => (int) $totalAmount
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ],
                'item_details' => $itemDetails
            ];

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                
                // Update transaksi dengan snap token
                $transaction->update(['snap_token' => $snapToken]);
                
                // Hapus item dari cart
                Cart::where('user_id', auth()->id())->delete();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Checkout berhasil',
                    'transaction_id' => $transaction->id,
                    'snap_token' => $snapToken,
                    'redirect_url' => route('cart.checkout.landing')
                ]);

            } catch (\Exception $e) {
                DB::rollback();
                \Log::error('Midtrans Error:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Checkout error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan checkout: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCartCount()
    {
        $count = 0;
        if (auth()->check()) {
            $count = Cart::where('user_id', auth()->id())->count();
        }
        return response()->json($count);
    }

    public function update(Request $request, Cart $cart)
    {
        if ($cart->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $kendaraan = Kendaraan::find($cart->kendaraan_id);
        if ($request->quantity > $kendaraan->unit) {
            return response()->json(['message' => 'Jumlah melebihi unit yang tersedia'], 400);
        }

        $cart->update([
            'quantity' => $request->quantity
        ]);

        return response()->json(['message' => 'Cart updated successfully']);
    }

    public function checkoutLanding()
    {
        // Ambil semua transaksi user
        $transactions = Transaction::with(['details.kendaraan'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                // Format foto kendaraan
                $transaction->details->each(function ($detail) {
                    if ($detail->kendaraan->photos) {
                        try {
                            $photos = is_string($detail->kendaraan->photos) 
                                ? json_decode($detail->kendaraan->photos, true) 
                                : $detail->kendaraan->photos;
                            $detail->kendaraan->photos = $photos;
                        } catch (\Exception $e) {
                            $detail->kendaraan->photos = null;
                        }
                    }
                });
                return $transaction;
            });

        return Inertia::render('CheckoutLanding', [
            'auth' => [
                'user' => auth()->user()
            ],
            'transactions' => $transactions
        ]);
    }

    public function processPayment(Request $request, $transactionId)
    {
        try {
            $transaction = Transaction::with(['details.kendaraan'])
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

            // Hitung jumlah hari
            $startDate = \Carbon\Carbon::parse($transaction->start_date)->startOfDay();
            $endDate = \Carbon\Carbon::parse($transaction->end_date)->startOfDay();
            $totalDays = max(1, $endDate->diffInDays($startDate) + 1);

            // Set up Midtrans
            \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = false;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            \Midtrans\Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json']
            ];

            // Siapkan item details
            $itemDetails = [];
            foreach ($transaction->details as $detail) {
                $pricePerDay = abs((int) $detail->price_per_day);
                $quantity = abs((int) $detail->quantity);
                $pricePerItem = $pricePerDay * $totalDays;
                
                $itemDetails[] = [
                    'id' => 'VEHICLE-' . $detail->kendaraan_id,
                    'price' => $pricePerItem,
                    'quantity' => $quantity,
                    'name' => $detail->kendaraan->title . ' (' . $totalDays . ' hari)'
                ];
            }

            // Gunakan total amount yang sudah tersimpan di database
            $totalAmount = $transaction->total_amount;

            \Log::info('Payment final calculation:', [
                'transaction_id' => $transactionId,
                'total_days' => $totalDays,
                'items' => $itemDetails,
                'total_amount' => $totalAmount
            ]);

            $params = [
                'transaction_details' => [
                    'order_id' => 'TRX-' . $transaction->id . '-' . time(),
                    'gross_amount' => (int) $totalAmount
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ],
                'item_details' => $itemDetails
            ];

            try {
                $snapToken = \Midtrans\Snap::getSnapToken($params);
                
                // Update transaction
                $transaction->update([
                    'snap_token' => $snapToken,
                    'total_amount' => $totalAmount // Update total amount yang sudah dihitung ulang
                ]);

                return response()->json([
                    'success' => true,
                    'snap_token' => $snapToken,
                    'transaction' => $transaction
                ]);

            } catch (\Exception $e) {
                \Log::error('Midtrans Error:', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Payment Processing Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'transaction_id' => $transactionId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }
}