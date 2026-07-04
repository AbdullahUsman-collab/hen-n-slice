'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAdminGuard } from '../../../../lib/auth-guard';
import { useAuthStore } from '../../../../store/auth-store';
import type { User, Driver, UserRole } from '@hen-n-slice/types';

type RoleOption = Extract<UserRole, 'staff' | 'branch_admin'> | 'driver';

export default function AdminStaffPage() {
  useAdminGuard();

  const user = useAuthStore((s) => s.user);
  const branchId = user?.default_branch_id;

  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleOption>('staff');
  const [phone, setPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const fetchStaff = useCallback(async () => {
    if (!branchId) return;
    try {
      const { staffApi } = await import('@hen-n-slice/api-client');
      const result = await staffApi.getStaffByBranch(branchId);
      setStaffUsers(result.users);
      setDrivers(result.drivers);
    } catch (err) {
      console.error('[HenNSlice] Failed to load staff:', err);
    }
    setLoadingList(false);
  }, [branchId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !branchId) return;
    setSubmitting(true);
    setMessage(null);

    try {
      const { staffApi } = await import('@hen-n-slice/api-client');
      const found = await staffApi.lookupUserByEmail(email.trim());

      if (!found) {
        setMessage({
          type: 'error',
          text: 'This person must sign up at /auth first with this email before you can assign them a role.',
        });
        setSubmitting(false);
        return;
      }

      if (selectedRole === 'driver') {
        await staffApi.updateUserRole(found.id, 'staff');
        await staffApi.assignDriver(found.id, branchId, phone.trim() || null, vehicleInfo.trim() || null);
        setMessage({ type: 'success', text: `Driver created for ${email}` });
      } else {
        await staffApi.updateUserRole(found.id, selectedRole);
        setMessage({ type: 'success', text: `${found.id.slice(0, 8)} → role updated to ${selectedRole}` });
      }

      setEmail('');
      setPhone('');
      setVehicleInfo('');
      setSelectedRole('staff');
      fetchStaff();
    } catch (err) {
      console.error('[HenNSlice] Staff assignment error:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Check console for details.' });
    }
    setSubmitting(false);
  };

  const handleRemoveDriver = async (driverId: string) => {
    try {
      const { staffApi } = await import('@hen-n-slice/api-client');
      await staffApi.removeDriver(driverId);
      setMessage({ type: 'success', text: 'Driver removed' });
      fetchStaff();
    } catch (err) {
      console.error('[HenNSlice] Remove driver error:', err);
      setMessage({ type: 'error', text: 'Failed to remove driver' });
    }
  };

  if (!branchId) {
    return (
      <main className="mx-auto max-w-container px-4 py-8">
        <h1 className="font-heading text-2xl font-bold text-text-primary">Staff Management</h1>
        <p className="mt-4 text-sm text-text-muted">Set a default branch in your profile to manage staff.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-container px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-text-primary">Staff Management</h1>

      {/* Assignment form */}
      <form onSubmit={handleSubmit} className="mt-6 rounded-md border border-border-light bg-surface-card p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold">Assign a Role</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="mt-1 w-full rounded-md border border-border-light bg-surface-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
              className="mt-1 w-full rounded-md border border-border-light bg-surface-background px-3 py-2 text-sm text-text-primary focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
            >
              <option value="staff">Staff</option>
              <option value="branch_admin">Branch Admin</option>
              <option value="driver">Driver</option>
            </select>
          </div>
        </div>

        {selectedRole === 'driver' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="mt-1 w-full rounded-md border border-border-light bg-surface-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Vehicle Info</label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="Honda CD70 — ABC-123"
                className="mt-1 w-full rounded-md border border-border-light bg-surface-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="mt-4 rounded-md bg-brand-purple px-6 py-2 text-sm font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90 disabled:opacity-60"
        >
          {submitting ? 'Assigning...' : 'Assign Role'}
        </button>

        {message && (
          <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </form>

      {/* Staff & Drivers list */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-bold">Current Staff &amp; Drivers</h2>

        {loadingList ? (
          <p className="mt-4 text-sm text-text-muted">Loading...</p>
        ) : staffUsers.length === 0 && drivers.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No staff or drivers assigned yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-light text-xs text-text-muted">
                  <th className="px-3 py-2 font-medium">ID</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Phone</th>
                  <th className="px-3 py-2 font-medium">Vehicle</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border-light transition-colors hover:bg-surface-background/50">
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">
                      #{u.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3 text-text-primary">{u.email ?? '—'}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-medium text-brand-purple">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-text-primary">{u.phone ?? '—'}</td>
                    <td className="px-3 py-3 text-text-muted">—</td>
                  </tr>
                ))}
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b border-border-light transition-colors hover:bg-surface-background/50">
                    <td className="px-3 py-3 font-mono text-xs text-text-muted">
                      #{d.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-3 py-3 text-text-primary">{d.full_name || d.id.slice(0, 8)}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        driver
                      </span>
                    </td>
                    <td className="px-3 py-3 text-text-primary">{d.phone ?? '—'}</td>
                    <td className="px-3 py-3 text-text-primary">{d.vehicle_info ?? '—'}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleRemoveDriver(d.id)}
                        className="text-xs font-medium text-red-500 transition-colors hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
