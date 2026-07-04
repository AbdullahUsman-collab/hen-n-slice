'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '../../../store/app-store';
import { useCartStore } from '../../../store/cart-store';

export default function CartPage() {
  const router = useRouter();
  const { branchId, branchName, orderType, hasSelectedBranch, openModal } =
    useAppStore();
  const { items, branchId: cartBranchId, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const [fee, setFee] = useState<number | null>(null);
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    if (!hasSelectedBranch) {
      openModal();
      router.push('/');
    }
  }, [hasSelectedBranch, openModal, router]);

  useEffect(() => {
    if (orderType !== 'delivery' || items.length === 0) {
      setFee(null);
      return;
    }

    setFeeLoading(true);
    const stored = localStorage.getItem('hen-n-slice-branch');
    const deliveryArea = stored ? JSON.parse(stored).deliveryArea : null;

    if (deliveryArea) {
      setFee(0);
      setFeeLoading(false);
    } else {
      async function fetchFee() {
        try {
          const { deliveryApi } = await import('@hen-n-slice/api-client');
          const result = await deliveryApi.checkDeliveryAvailability(
            branchId!,
            24.8607,
            67.0011,
          );
          setFee(result.fee ?? 99);
        } catch {
          setFee(99);
        }
        setFeeLoading(false);
      }
      fetchFee();
    }
  }, [orderType, items.length, branchId]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = (() => {
    if (orderType === 'delivery') {
      return subtotal + (fee ?? 99);
    }
    return subtotal;
  })();

  if (!hasSelectedBranch) return null;

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <h1 className="font-heading text-3xl font-bold">Your Cart</h1>
      <p className="mt-1 text-text-secondary">
        {orderType === 'delivery'
          ? `Delivery from ${branchName ?? 'your branch'}`
          : `Pickup from ${branchName ?? 'your branch'}`}
      </p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <p className="text-lg text-text-muted">Your cart is empty</p>
          <Link
            href="/menu"
            className="mt-6 inline-block rounded-md bg-brand-purple px-6 py-2.5 text-sm font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-4 rounded-md border border-border-light bg-surface-card p-4 shadow-sm"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-brand-purple/5 text-2xl">
                    🍗
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-heading font-semibold">{item.name}</h3>
                  <p className="text-sm text-text-secondary">
                    PKR {item.price} each
                  </p>
                  {item.modifiers && (
                    <p className="mt-1 text-xs text-text-muted">
                      {Object.entries(item.modifiers)
                        .map(([, vals]) => vals.join(', '))
                        .join(' | ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border-light text-sm font-semibold transition-colors hover:bg-surface-background"
                  >
                    −
                  </button>
                  <span className="min-w-[2ch] text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border-light text-sm font-semibold transition-colors hover:bg-surface-background"
                  >
                    +
                  </button>
                </div>
                <p className="min-w-[5rem] text-right font-heading font-bold text-brand-purple">
                  PKR {item.price * item.quantity}
                </p>
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-sm text-text-muted transition-colors hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="self-start text-sm font-medium text-text-muted transition-colors hover:text-red-500"
            >
              Clear Cart
            </button>
          </div>

          <div className="sticky top-24 self-start">
            <div className="rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
              <h2 className="font-heading text-lg font-bold">Order Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-semibold">PKR {subtotal}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Delivery Fee</span>
                    <span className="font-semibold">
                      {feeLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : fee != null ? (
                        `PKR ${fee}`
                      ) : (
                        'PKR —'
                      )}
                    </span>
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
                onClick={() => router.push('/checkout')}
                className="mt-6 w-full rounded-md bg-brand-purple py-3 text-sm font-bold text-text-on-brand transition-colors hover:bg-brand-purple/90"
              >
                Proceed to Checkout
              </button>
              {!cartBranchId && (
                <p className="mt-3 text-xs text-text-muted">
                  Please select a branch before checking out.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
