<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class MoneyFusionPaymentController extends Controller
{
    /**
     * Money Fusion only provides a static payment link (no API/webhook), so the
     * plan order is created as pending, like a bank transfer, and the
     * superadmin approves it once the payment is received.
     */
    public function processPayment(Request $request)
    {
        $validated = validatePaymentRequest($request, [
            'amount' => 'required|numeric|min:0',
        ]);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);

            $planOrder = createPlanOrder([
                'user_id' => auth()->id(),
                'plan_id' => $plan->id,
                'billing_cycle' => $validated['billing_cycle'],
                'payment_method' => 'moneyfusion',
                'coupon_code' => $validated['coupon_code'] ?? null,
                'payment_id' => 'MFUSION_' . strtoupper(uniqid()),
                'status' => 'pending',
            ]);

            return response()->json([
                'success' => true,
                'message' => __('Payment request submitted successfully! Your plan will be activated after payment verification. Order Number: :order', ['order' => $planOrder->order_number]),
                'order_number' => $planOrder->order_number,
            ]);
        } catch (\Exception $e) {
            \Log::error('Money Fusion plan payment error', ['error' => $e->getMessage(), 'user_id' => auth()->id()]);
            return response()->json([
                'success' => false,
                'message' => __('Payment processing failed. Please try again.'),
            ], 422);
        }
    }
}
