import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            Accept: 'application/json'
        }
    }
});

// Debug Pusher
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Pusher Connected:', window.Echo.connector.pusher.connection.state);
});

window.Echo.connector.pusher.connection.bind('error', (error) => {
    console.error('❌ Pusher Error:', error);
});

window.Echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('🔄 Pusher state changed:', {
        from: states.previous,
        to: states.current
    });
});

// Enable Pusher debug mode
Pusher.logToConsole = true;
