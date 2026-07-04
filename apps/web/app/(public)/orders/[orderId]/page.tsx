'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthGuard } from '../../../../lib/auth-guard';
import OrderStepper from '../../../../components/OrderStepper';
import type { Order } from '@hen-n-slice/types';

export default function OrderTrackingPage() {
  useAuthGuard();

  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) return;

    let unsubscribe: (() => void) | null = null;

    async function init() {
      try {
        const { ordersApi, realtimeApi } = await import(
          '@hen-n-slice/api-client'
        );

        const data = await ordersApi.getOrder(orderId);
        if (!data) {
          setError('Order not found.');
          setLoading(false);
          return;
        }
        setOrder(data);

        unsubscribe = realtimeApi.subscribeToOrderStatus(
          orderId,
          (newStatus) => {
            setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
          },
        );
      } catch (err) {
        console.error('[HenNSlice] Failed to load order:', err);
        setError('Failed to load order.');
      }
      setLoading(false);
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-container px-4 py-20">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
          <span className="ml-3 text-sm text-text-secondary">
            Loading order...
          </span>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-container px-4 py-20 text-center">
        <p className="text-lg text-text-muted">{error ?? 'Order not found.'}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-brand-purple"
        >
          ← Back to Home
        </Link>
      </main>
    );
  }

  const createdAt = new Date(order.created_at);
  const estimatedReady = order.estimated_ready_at
    ? new Date(order.estimated_ready_at)
    : null;

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold">Order Status</h1>
        <p className="mt-1 text-sm text-text-muted">
          Order #{order.id.slice(0, 8).toUpperCase()}
          {' — '}
          {order.type === 'delivery' ? 'Delivery' : 'Pickup'}
        </p>
      </div>

      {/* Stepper */}
      <div className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
        <OrderStepper
          currentStatus={order.status}
          orderType={order.type}
        />
      </div>

      {/* Info cards */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Items */}
        <div className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold">Items</h2>
          <div className="mt-3 divide-y divide-border-light">
            {order.items.map((item, i) => (
              <div
                key={`${item.menu_item_id}-${i}`}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-text-muted">
                    × {item.qty}
                  </span>
                </div>
                <span className="font-semibold">PKR {item.subtotal}</span>
              </div>
            ))}
          </div>
          <hr className="my-2 border-border-light" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>PKR {order.subtotal}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Delivery Fee</span>
                <span>PKR {order.delivery_fee}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-purple">PKR {order.total}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold">Details</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Status</dt>
              <dd className="font-medium capitalize">{order.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Payment</dt>
              <dd className="font-medium capitalize">
                {order.payment_method}
                {' — '}
                <span
                  className={
                    order.payment_status === 'paid'
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }
                >
                  {order.payment_status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Placed at</dt>
              <dd className="font-medium">
                {createdAt.toLocaleString('en-PK', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </dd>
            </div>
            {estimatedReady && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Estimated ready</dt>
                <dd className="font-medium">
                  {estimatedReady.toLocaleString('en-PK', {
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            )}
            {order.type === 'delivery' && order.delivery_address && (
              <div className="flex justify-between">
                <dt className="text-text-secondary">Delivering to</dt>
                <dd className="max-w-[180px] text-right font-medium">
                  {order.delivery_address.text}
                </dd>
              </div>
            )}
            {order.notes && (
              <div>
                <dt className="text-text-secondary">Notes</dt>
                <dd className="mt-1 text-text-primary">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6">
        <Link
          href="/menu"
          className="text-sm font-semibold text-brand-purple transition-colors hover:text-brand-purple/80"
        >
          ← Continue ordering
        </Link>
      </div>
    </main>
  );
}
