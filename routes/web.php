<?php

use App\Http\Controllers\Admin\PermissionCrudController;
use App\Http\Controllers\Admin\PermissionGroupCrudController;
use App\Http\Controllers\Admin\RoleCrudController;
use App\Http\Controllers\Admin\UserCrudController;
use App\Http\Controllers\MediaCrudController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RegionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Content;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\VehicleCategoryController;
use App\Http\Controllers\VehicleAttributeController;
use App\Http\Controllers\KendaraanController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\AdminTransactionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AboutController;

Route::post('callback', [AdminTransactionController::class, 'handlePaymentCallback'])
    ->name('payment.callback')
    ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

Route::get('/', function () {
    $contents = Content::with(['kendaraans' => function($query) {
        $query->orderBy('price_per_day', 'asc');
    }, 'images', 'user'])
    ->where('status', 'published')
    ->get();
    
    return Inertia::render('Gabungan', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'auth' => [
            'user' => Auth::user(),
        ],
        'contents' => $contents,
    ]);
})->name('home');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->prefix('dashboard')->as('dashboard.')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Dashboard');
    })->name('index');


    Route::resource('users', UserCrudController::class)->names([
        'index' => 'users',
        'create' => 'users.create',
        'store' => 'users.store',
        'show' => 'users.show',
        'edit' => 'users.edit',
        'update' => 'users.update',
        'destroy' => 'users.destroy',
    ]);

    Route::resource('roles', RoleCrudController::class)->names([
        'index' => 'roles',
        'create' => 'roles.create',
        'store' => 'roles.store',
        'show' => 'roles.show',
        'edit' => 'roles.edit',
        'update' => 'roles.update',
        'destroy' => 'roles.destroy',
    ]);
    Route::resource('permissions', PermissionCrudController::class)->names([
        'index' => 'permissions',
        'create' => 'permissions.create',
        'store' => 'permissions.store',
        'show' => 'permissions.show',
        'edit' => 'permissions.edit',
        'update' => 'permissions.update',
        'destroy' => 'permissions.destroy',
    ]);
    Route::resource('permission-groups', PermissionGroupCrudController::class)->names([
        'index' => 'permission-groups',
        'create' => 'permission-groups.create',
        'store' => 'permission-groups.store',
        'show' => 'permission-groups.show',
        'edit' => 'permission-groups.edit',
        'update' => 'permission-groups.update',
        'destroy' => 'permission-groups.destroy',
    ]);

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/media', [MediaCrudController::class, 'index'])->name('media.index');
    Route::delete('/medias/{media}', [MediaCrudController::class, 'destroy'])->name('medias.destroy');

    Route::get('/profile-test', function() {
        return response()->json([
            'message' => 'Route berfungsi'
        ]);
    })->middleware('auth')->name('profile.test');

    Route::resource('content', ContentController::class)
        ->middleware(['auth']);

    Route::middleware(['auth'])->group(function () {
        Route::resource('vehicle-categories', VehicleCategoryController::class);
        Route::resource('vehicle-attributes', VehicleAttributeController::class);

        // Media routes
        Route::post('/dashboard/media', [MediaCrudController::class, 'store'])->name('media.store');
        Route::get('/dashboard/media', [MediaCrudController::class, 'index'])->name('media.index');
        Route::delete('/dashboard/media/{media}', [MediaCrudController::class, 'destroy'])->name('media.destroy');
    });

    // Vehicle Management Routes
    Route::controller(VehicleCategoryController::class)->group(function () {
        Route::get('/vehicle-categories', 'index')
            ->name('vehicle-categories.index');
            
        Route::get('/vehicle-categories/create', 'create')
            ->name('vehicle-categories.create');
            
        Route::post('/vehicle-categories', 'store')
            ->name('vehicle-categories.store');
            
        Route::get('/vehicle-categories/{category}/edit', 'edit')
            ->name('vehicle-categories.edit');
            
        Route::put('/vehicle-categories/{category}', 'update')
            ->name('vehicle-categories.update');
            
        Route::delete('/vehicle-categories/{category}', 'destroy')
            ->name('vehicle-categories.destroy');
    });

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::resource('kendaraan', KendaraanController::class)
            ->middleware('role:super-admin|admin');
        
        Route::controller(AdminTransactionController::class)->group(function () {
            Route::get('admin-transactions', 'index')->name('admin-transactions');
            Route::get('admin-transactions/create', 'create')->name('admin-transactions.create');
            Route::post('admin-transactions', 'store')->name('admin-transactions.store');
            Route::delete('admin-transactions/{transaction}', 'destroy')->name('admin-transactions.destroy');
            Route::post('admin-transactions/{transaction}/approve', 'approve')->name('admin-transactions.approve');
            Route::post('admin-transactions/{transaction}/reject', 'reject')->name('admin-transactions.reject');
            Route::post('admin-transactions/{transaction}/pay', 'processPayment')
                ->name('admin-transactions.pay');
            Route::get('admin-transactions/success/{transaction_id}', 'success')
                ->name('admin-transactions.success');
            Route::post('admin-transactions/{transaction}/payment-success', 'paymentSuccess')
                ->name('admin-transactions.payment-success');
        })->middleware('role:admin|super-admin');
    });

    Route::get('/dashboard/content/{content}', [ContentController::class, 'show'])
        ->name('dashboard.content.show');

    // Route untuk transaksi
    Route::middleware(['auth', 'verified'])->group(function () {
        // Route untuk customer
        Route::get('/transactions/{transaction}', [TransactionController::class, 'customerShow'])
            ->name('transaction.customer.show');
        Route::get('/transactions', [TransactionController::class, 'customerTransactions'])
            ->name('transaction.customer.index');
        Route::post('/transactions/{transaction}/pay', [TransactionController::class, 'processPayment'])
            ->name('transaction.pay');

        // Route untuk admin/super-admin
        Route::middleware(['role:admin|super-admin'])->group(function () {
            Route::get('/customer-transactions', [TransactionController::class, 'adminIndex'])
                ->name('customer-transactions');
            Route::post('/transactions/{transaction}/approve', [TransactionController::class, 'approve'])
                ->name('transactions.approve');
            Route::post('/transactions/{transaction}/reject', [TransactionController::class, 'reject'])
                ->name('transactions.reject');
        });
    });

    Route::middleware(['auth', 'verified', 'role:admin|super-admin'])->group(function () {
        Route::get('/dashboard/customer-transactions', [TransactionController::class, 'adminIndex'])
            ->name('dashboard.customer-transactions');
        Route::post('/dashboard/transactions/{transaction}/approve', [TransactionController::class, 'approve'])
            ->name('dashboard.transactions.approve');
        Route::post('/dashboard/transactions/{transaction}/reject', [TransactionController::class, 'reject'])
            ->name('dashboard.transactions.reject');
    });
});

Route::prefix('region')->group(function () {
    Route::get('/provinces', [RegionController::class, 'provinces']);
    Route::get('/regencies/{province_id}', [RegionController::class, 'regencies']);
    Route::get('/districts/{regency_id}', [RegionController::class, 'districts']);
    Route::get('/villages/{district_id}', [RegionController::class, 'villages']);
});

Route::get('register/customer', [RegisteredUserController::class, 'createCustomer'])
    ->name('register.customer');

// Google OAuth Routes
Route::prefix('auth/google')->group(function () {
    Route::get('admin', [GoogleController::class, 'redirectToGoogleAdmin'])
        ->name('google.login.admin');
    Route::get('customer', [GoogleController::class, 'redirectToGoogleCustomer'])
        ->name('google.login.customer');
    Route::get('admin/callback', [GoogleController::class, 'handleGoogleCallbackAdmin'])
        ->name('google.callback.admin');
    Route::get('customer/callback', [GoogleController::class, 'handleGoogleCallbackCustomer'])
        ->name('google.callback.customer');
});

Route::get('/content/{content}', function (Content $content) {
    if ($content->status !== 'published') {
        return redirect()->route('home');
    }
    
    $content->load(['kendaraans', 'images', 'user']);
    
    return Inertia::render('Isiperusahaan', [
        'content' => $content,
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('content.show');

// Route untuk customer (di luar group dashboard)
Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    // Profile routes untuk customer
    Route::get('/customer/profile', [ProfileController::class, 'customerShow'])
        ->name('customer.profile.show');
    Route::get('/customer/profile/edit', [ProfileController::class, 'customerEdit'])
        ->name('customer.profile.edit');
    Route::patch('/customer/profile', [ProfileController::class, 'customerUpdate'])
        ->name('customer.profile.update');
    
    // Cart routes yang sudah ada
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::get('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');
    Route::post('/cart/process-checkout', [CartController::class, 'processCheckout'])->name('cart.process-checkout');
    Route::get('/checkout/landing', [CartController::class, 'checkoutLanding'])->name('cart.checkout.landing');
    Route::post('/cart/add/{kendaraan}', [CartController::class, 'add'])->name('cart.add');
    Route::delete('/cart/{cart}', [CartController::class, 'remove'])->name('cart.remove');
    Route::get('/cart/count', [CartController::class, 'getCartCount'])->name('cart.count');
    Route::patch('/cart/{cart}', [CartController::class, 'update'])->name('cart.update');

    // Tambahkan route transactions untuk customer
    Route::get('/transactions/{transaction}', [TransactionController::class, 'customerShow'])
        ->name('transaction.customer.show');
    Route::get('/transactions', [TransactionController::class, 'customerTransactions'])
        ->name('transaction.customer.index');
    Route::post('/transactions/{transaction}/pay', [TransactionController::class, 'processPayment'])
        ->name('transaction.pay');

    Route::get('/cart/checkout-landing', [CartController::class, 'checkoutLanding'])
        ->name('cart.checkout-landing');

    Route::get('/transactions/pending/count', [TransactionController::class, 'getPendingCount'])
        ->name('transaction.pending.count');

    Route::delete('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel'])
        ->name('transaction.cancel');

    Route::get('/transactions/{transaction}/payment/success', [TransactionController::class, 'paymentSuccess'])
        ->name('transaction.payment.success');
});

// Midtrans notification handler
Route::post('midtrans/notification', [TransactionController::class, 'handleNotification']);

// Tambahkan route media di luar group dashboard, tapi tetap dalam middleware auth
Route::middleware(['auth'])->group(function () {
    // Media routes untuk semua user termasuk customer
    Route::controller(MediaCrudController::class)->group(function () {
        Route::post('/media/upload', 'store')->name('media.upload');
        Route::get('/media', 'index')->name('media.index');
        Route::delete('/media/{media}', 'destroy')->name('media.destroy');
    });
});

Route::middleware(['auth'])->group(function () {
    Route::get('/api/chats/unread-count', [ChatController::class, 'getUnreadCount']);
    Route::get('/api/chats', [ChatController::class, 'index']);
    Route::post('/api/chats', [ChatController::class, 'store']);
    Route::get('/api/chats/{chat}/messages', [ChatController::class, 'messages']);
    Route::post('/api/chats/{chat}/messages', [ChatController::class, 'sendMessage']);
});

Route::get('/about', function () {
    return Inertia::render('About/About', [
        'auth' => [
            'user' => auth()->user() ? [
                'id' => auth()->user()->id,
                'name' => auth()->user()->name,
                'email' => auth()->user()->email,
                'roles' => auth()->user()->roles,
                'detail' => auth()->user()->detail
            ] : null
        ]
    ]);
})->name('about');

require __DIR__ . '/auth.php';