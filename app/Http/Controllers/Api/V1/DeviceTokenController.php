<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Register (or re-associate) an Expo push token for the authenticated
     * seller, so new-order push notifications reach this device.
     */
    public function store(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'nullable|string|in:ios,android',
        ]);

        DeviceToken::updateOrCreate(
            ['token' => $request->token],
            ['user_id' => $request->user()->id, 'platform' => $request->platform]
        );

        return response()->json(['message' => 'Token registered.']);
    }

    /**
     * Stop notifications on this device (e.g. on logout).
     */
    public function destroy(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        DeviceToken::where('user_id', $request->user()->id)
            ->where('token', $request->token)
            ->delete();

        return response()->json(['message' => 'Token removed.']);
    }
}
