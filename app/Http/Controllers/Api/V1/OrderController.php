<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\OrderStatusChanged;
use App\Http\Controllers\Api\V1\Concerns\ScopesToOwnedStore;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use ScopesToOwnedStore;

    public function index(Request $request)
    {
        $request->validate(['store_id' => 'required|integer']);
        $store = $this->resolveOwnedStore((int) $request->store_id);

        $query = Order::where('store_id', $store->id)->with('items');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_first_name', 'like', "%{$search}%")
                    ->orWhere('customer_last_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        $perPage = $request->input('per_page', 20);
        $orders = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $orders->getCollection()->transform(fn (Order $order) => $this->formatOrderSummary($order));

        return response()->json([
            'orders' => $orders->items(),
            'pagination' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(int $order)
    {
        $order = Order::with(['items.product', 'shippingMethod'])->findOrFail($order);
        $this->resolveOwnedStore($order->store_id);

        return response()->json(['order' => [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'customer' => [
                'name' => trim($order->customer_first_name . ' ' . $order->customer_last_name),
                'email' => $order->customer_email,
                'phone' => $order->customer_phone,
            ],
            'shipping_address' => $order->shipping_address,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->product_name,
                'sku' => $item->product_sku,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'image' => $item->product->cover_image ?? null,
                'variants' => $item->product_variants,
            ]),
            'summary' => [
                'subtotal' => (float) $order->subtotal,
                'shipping' => (float) $order->shipping_amount,
                'tax' => (float) $order->tax_amount,
                'discount' => (float) $order->discount_amount,
                'total' => (float) $order->total_amount,
            ],
            'shipping_method' => $order->shippingMethod->name ?? null,
            'tracking_number' => $order->tracking_number,
            'created_at' => $order->created_at,
        ]]);
    }

    public function updateStatus(Request $request, int $order)
    {
        $order = Order::findOrFail($order);
        $this->resolveOwnedStore($order->store_id);

        $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,completed,cancelled',
        ]);

        $oldStatus = $order->status;
        $order->status = $request->status;

        if ($request->status === 'completed' && $order->payment_status !== 'paid') {
            $order->payment_status = 'paid';
        }

        $order->save();

        if ($oldStatus !== $request->status) {
            event(new OrderStatusChanged($order, $oldStatus));
        }

        return response()->json(['order' => $this->formatOrderSummary($order)]);
    }

    private function formatOrderSummary(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer' => trim($order->customer_first_name . ' ' . $order->customer_last_name),
            'total' => (float) $order->total_amount,
            'status' => $order->status,
            'payment_status' => $order->payment_status,
            'items_count' => $order->items->count(),
            'created_at' => $order->created_at,
        ];
    }
}
