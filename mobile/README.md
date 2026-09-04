# My Store Asap Seller (mobile)

Expo/React Native app for sellers to manage their My Store Asap stores from their phone: login/register, switch between stores, manage products, manage orders, view subscription usage.

Talks to the Laravel backend's token-authenticated API at `routes/api.php` (`/api/v1/...`, Sanctum bearer tokens).

## Setup

```sh
cd mobile
npm install
cp .env.example .env   # point EXPO_PUBLIC_API_URL at your Laravel dev server
npx expo start
```

On a physical device or emulator, `EXPO_PUBLIC_API_URL` must be your machine's LAN IP (not `localhost`/`127.0.0.1`), since the phone can't reach your computer's loopback address.

The Laravel API must be running (`php artisan serve`) and migrated (`php artisan migrate`) with Sanctum installed.

## Structure

- `app/` — expo-router file-based routes only.
  - `(auth)/` — login, register (shown when signed out).
  - `(app)/` — bottom tabs: dashboard, products, orders, subscription, account (shown when signed in).
- `src/api/` — typed request functions per resource + the axios client.
- `src/lib/session.tsx` — auth state (token + user), persisted via `expo-secure-store`.
- `src/lib/active-store.tsx` — which of the seller's stores is currently selected, persisted via AsyncStorage.
- `src/components/` — shared UI (Button, TextField, ProductForm).

## Out of scope for v1

See the "Explicitly out of scope" section of the implementation plan: in-app subscription purchase (deep-links to the web checkout instead), push notifications, camera image upload (product images are URL-only for now), sub-user roles.
