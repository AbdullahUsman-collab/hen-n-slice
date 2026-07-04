'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminGuard } from '../../../../lib/auth-guard';
import { useAuthStore } from '../../../../store/auth-store';
import type { Order, OrderStatus, Driver } from '@hen-n-slice/types';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'completed',
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminOrdersPage() {
  useAdminGuard();

  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === 'super_admin';
  const defaultBranchId = user?.default_branch_id ?? undefined;

  const [orders, setOrders] = useState<Order[]>([]);
  const [userMap, setUserMap] = useState<
    Record<string, { email: string | null; full_name: string | null }>
  >({});
  const [loading, setLoading] = useState(true);
  const [driversMap, setDriversMap] = useState<Record<string, Driver[]>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {},
  );

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      const { ordersApi } = await import('@hen-n-slice/api-client');
      const data = await ordersApi.getAdminOrders(
        isSuperAdmin ? undefined : defaultBranchId,
      );
      setOrders(data);

      const userIds = [...new Set(data.map((o) => o.user_id))];
      if (userIds.length > 0) {
        const users = await ordersApi.getUsersByIds(userIds);
        setUserMap(
          Object.fromEntries(users.map((u) => [u.id, { email: u.email, full_name: u.full_name }])),
        );
      }
    } catch (err) {
      console.error('[HenNSlice] Failed to load admin orders:', err);
    }
    setLoading(false);
  }, [user, isSuperAdmin, defaultBranchId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    setAssigning((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { ordersApi } = await import('@hen-n-slice/api-client');
      const updated = await ordersApi.assignDriver(orderId, driverId);
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o)),
        );
      }
    } catch (err) {
      console.error('[HenNSlice] Failed to assign driver:', err);
    }
    setAssigning((prev) => ({ ...prev, [orderId]: false }));
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: true }));
    try {
      const { ordersApi } = await import('@hen-n-slice/api-client');
      const updated = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o)),
        );
      }
    } catch (err) {
      console.error('[HenNSlice] Failed to update status:', err);
    }
    setUpdatingStatus((prev) => ({ ...prev, [orderId]: false }));
  };

  const loadDrivers = async (branchId: string) => {
    if (driversMap[branchId]) return;
    try {
      const { ordersApi } = await import('@hen-n-slice/api-client');
      const drivers = await ordersApi.getAvailableDrivers(branchId);
      setDriversMap((prev) => ({ ...prev, [branchId]: drivers }));
    } catch (err) {
      console.error('[HenNSlice] Failed to load drivers:', err);
    }
  };

  const getCustomerLabel = (order: Order) => {
    const info = userMap[order.user_id];
    return info?.full_name ?? info?.email ?? order.user_id.slice(0, 8);
  };

  const needsDriver = (order: Order) =>
    order.type === 'delivery' &&
    (order.status === 'confirmed' || order.status === 'preparing') &&
    !order.driver_id;

  if (loading) {
    return (
      <main className="mx-auto max-w-container px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Orders</h1>
        <p className="mt-2 text-sm text-text-muted">Loading orders...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-text-primary">
        Orders
        {!isSuperAdmin && <span className="ml-2 text-sm font-normal text-text-muted">(your branch)</span>}
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No orders found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-light text-xs text-text-muted">
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Driver</th>
                <th className="px-3 py-2 font-medium">Navigate</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const currentIdx = STATUS_FLOW.indexOf(order.status);
                const nextStatuses = STATUS_FLOW.slice(currentIdx + 1);
                const drivers = driversMap[order.branch_id];

                return (
                  <tr key={order.id} className="border-b border-border-light transition-colors hover:bg-surface-background/50">
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3 text-text-primary">
                      {getCustomerLabel(order)}
                    </td>
                    <td className="px-3 py-3 text-text-primary">
                      {order.items.length}
                    </td>
                    <td className="px-3 py-3 font-semibold text-text-primary">
                      PKR {order.total}
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple">
                        {order.type}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-primary">
                      {order.driver_id ? (
                        <span className="text-xs text-text-muted">
                          #{order.driver_id.slice(0, 8).toUpperCase()}
                        </span>
                      ) : needsDriver(order) ? (
                        <div className="flex items-center gap-1">
                          <select
                            defaultValue=""
                            className="max-w-[110px] rounded border border-border-light bg-surface-background px-1 py-0.5 text-xs"
                            onFocus={() => loadDrivers(order.branch_id)}
                          >
                            <option value="" disabled>
                              {drivers ? 'Select driver' : 'Loading...'}
                            </option>
                            {(drivers ?? []).map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name ?? d.id.slice(0, 8)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              const sel = e.currentTarget
                                .previousElementSibling as HTMLSelectElement;
                              if (sel.value) {
                                handleAssignDriver(order.id, sel.value);
                              }
                            }}
                            disabled={assigning[order.id]}
                            className="rounded bg-brand-purple px-2 py-0.5 text-xs font-medium text-text-on-brand transition-colors hover:bg-brand-purple/90 disabled:opacity-60"
                          >
                            {assigning[order.id] ? '...' : 'Assign'}
                          </button>
                        </div>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                    </td>
                    <td className="px-3 py-3">
                      {order.type === 'delivery' &&
                      order.delivery_address &&
                      typeof (
                        order.delivery_address as {
                          lat?: number;
                          lng?: number;
                        }
                      ).lat === 'number' ? (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${(order.delivery_address as { lat: number; lng: number }).lat},${(order.delivery_address as { lng: number }).lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple transition-colors hover:bg-brand-purple/20"
                        >
                          Navigate
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {order.status !== 'cancelled' && order.status !== 'completed' && nextStatuses.length > 0 && (
                        <div className="flex items-center gap-1">
                          <select
                            defaultValue=""
                            className="rounded border border-border-light bg-surface-background px-1 py-0.5 text-xs"
                          >
                            <option value="" disabled>
                              Update...
                            </option>
                            {nextStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={(e) => {
                              const sel = e.currentTarget
                                .previousElementSibling as HTMLSelectElement;
                              if (sel.value) {
                                handleUpdateStatus(
                                  order.id,
                                  sel.value as OrderStatus,
                                );
                              }
                            }}
                            disabled={updatingStatus[order.id]}
                            className="rounded border border-border-light px-2 py-0.5 text-xs transition-colors hover:bg-surface-background disabled:opacity-60"
                          >
                            {updatingStatus[order.id] ? '...' : 'Go'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
