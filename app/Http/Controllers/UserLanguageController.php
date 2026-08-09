<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserLanguageController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'language' => 'required|string|max:5'
        ]);

        $user = Auth::user();
        
        // In demo mode, always store in session
        if (config('app.is_demo', false)) {
            session(['locale' => $request->language]);
            return back();
        }
        
        if ($user) {
            // Normal mode: update database
            $user->update(['lang' => $request->language]);
        }
        
        // Store in session for all users (including guests)
        session(['locale' => $request->language]);
        
        return back();
    }
}