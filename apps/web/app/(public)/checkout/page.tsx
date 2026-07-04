'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useAuthGuard } from '../../../lib/auth-guard';
import { useCartStore } from '../../../store/cart-store';
import { useAppStore } from '../../../store/app-store';
import { useAuthStore } from '../../../store/auth-store';
import { setAccessToken } from '@hen-n-slice/api-client';
import type { PaymentMethod, OrderItem } from '@hen-n-slice/types';

export default function CheckoutPage() {
  useAuthGuard();
  const { getToken } = useAuth();

  const router = useRouter();
  const { items, branchId, clearCart } = useCartStore();
  const { branchName, orderType, deliveryArea, customerLocation } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (orderType !== 'delivery' || !customerLocation) return;
    const { lat, lng } = customerLocation;

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.display_name) {
          setAddress(data.display_name);
        }
      })
      .catch(() => {});
  }, [orderType, customerLocation]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? 99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user || !branchId || items.length === 0) return;
    setError('');
    setPlacing(true);

    try {
      const token = await getToken().catch(() => null);
      setAccessToken(token ?? undefined);
      console.log('[Checkout] Token before createOrder:', !!token, token ? `len=${token.length} prefix=${token.slice(0, 10)}...` : 'NONE');

      const { ordersApi } = await import('@hen-n-slice/api-client');

      const orderItems: OrderItem[] = items.map((i) => ({
        menu_item_id: i.menuItemId,
        name: i.name,
        qty: i.quantity,
        unit_price: i.price,
        modifiers: i.modifiers ?? null,
        subtotal: i.price * i.quantity,
      }));

      const order = await ordersApi.createOrder({
        user_id: user.id,
        branch_id: branchId,
        type: orderType ?? 'pickup',
        items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_address:
          orderType === 'delivery' && address.trim()
            ? {
                text: address.trim(),
                lat: customerLocation?.lat ?? 0,
                lng: customerLocation?.lng ?? 0,
              }
            : null,
        notes: notes.trim() || null,
        payment_method: paymentMethod,
      });

      if (order) {
        clearCart();
        router.push(`/orders/${order.id}`);
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (err) {
      console.error('[HenNSlice] Checkout error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-container px-4 py-20 text-center">
        <div className="mb-4 text-6xl">🛒</div>
        <p className="text-lg text-text-muted">Your cart is empty</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-md bg-brand-purple px-6 py-2.5 text-sm font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90"
        >
          Browse Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-text-secondary">
        {orderType === 'delivery'
          ? `Delivery from ${branchName ?? 'your branch'}`
          : `Pickup from ${branchName ?? 'your branch'}`}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* Items summary */}
          <section className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold">Order Summary</h2>
            <div className="mt-4 divide-y divide-border-light">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-purple/5 text-xl">
                        🍗
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-text-muted">
                        PKR {item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-heading font-bold text-brand-purple">
                    PKR {item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery address */}
          {orderType === 'delivery' && (
            <section className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold">
                Delivery Address
              </h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, landmark..."
                rows={3}
                className="mt-3 w-full rounded-md border border-border-light bg-surface-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
              />
            </section>
          )}

          {/* Pickup info */}
          {orderType === 'pickup' && (
            <section className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold">Pickup Details</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Pick up your order at{' '}
                <span className="font-semibold text-text-primary">
                  {branchName ?? 'your selected branch'}
                </span>
                .
              </p>
              <p className="mt-1 text-xs text-text-muted">
                We will notify you when your order is ready for pickup.
              </p>
            </section>
          )}

          {/* Payment method */}
          <section className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold">Payment Method</h2>
            <div className="mt-3 flex flex-col gap-3">
              {(['cash', 'card', 'wallet'] as PaymentMethod[]).map((method) => {
                const comingSoon = method !== 'cash';
                return (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors ${
                      paymentMethod === method
                        ? 'border-brand-purple bg-brand-purple/5'
                        : 'border-border-light'
                    } ${comingSoon ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => {
                        if (comingSoon) {
                          setPaymentMethod('cash');
                        } else {
                          setPaymentMethod(method);
                        }
                      }}
                      disabled={comingSoon}
                      className="accent-brand-purple"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium capitalize">
                        {method}
                      </span>
                      {comingSoon && (
                        <span className="ml-2 text-xs text-text-muted">
                          — Coming soon
                        </span>
                      )}
                    </div>
                    <span className="text-lg">
                      {method === 'cash' ? '💵' : method === 'card' ? '💳' : '📱'}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold">
              Special Instructions
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or dietary notes..."
              rows={2}
              className="mt-3 w-full rounded-md border border-border-light bg-surface-background px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
          </section>
        </div>

        {/* Sidebar */}
        <div className="sticky top-24 self-start">
          <div className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold">Total</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-semibold">PKR {subtotal}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery Fee</span>
                  <span className="font-semibold">PKR {deliveryFee}</span>
                </div>
              )}
              <hr className="border-border-light" />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-heading font-bold text-brand-purple">
                  PKR {total}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || items.length === 0 || !user}
              className="mt-6 w-full rounded-md bg-brand-purple py-3 text-sm font-bold text-text-on-brand transition-colors hover:bg-brand-purple/90 disabled:opacity-60"
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>

            {error && (
              <p className="mt-3 text-center text-xs text-red-500">{error}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
