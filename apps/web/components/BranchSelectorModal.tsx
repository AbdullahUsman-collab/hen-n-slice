'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/app-store';
import type { Branch, BranchWithDistance } from '@hen-n-slice/types';

export default function BranchSelectorModal() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    isModalOpen,
    hasSelectedBranch,
    branchId,
    branchName,
    orderType,
    setBranch,
    setOrderType,
    setCustomerLocation,
    confirmSelection,
  } = useAppStore();

  const [tab, setTab] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [nearestBranch, setNearestBranch] = useState<BranchWithDistance | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | BranchWithDistance | null>(null);
  const [nearestPickupBranchId, setNearestPickupBranchId] = useState<string | null>(null);

  useEffect(() => {
    console.log('[HenNSlice] SUPABASE_URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  }, []);

  useEffect(() => {
    setSelectedBranch(null);
    setNearestBranch(null);
    setNearestPickupBranchId(null);
    setGeoError(null);
  }, [tab]);

  useEffect(() => {
    if (tab === 'delivery') {
      handleDelivery();
    } else {
      loadBranches();
      handlePickupLocation();
      setOrderType('pickup');
    }
  }, [tab]);

  const handleDelivery = useCallback(async () => {
    setLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomerLocation({ lat, lng });
        setOrderType('delivery');

        try {
          const { findNearestBranches } = await import('@hen-n-slice/api-client').then(
            (m) => m.branchesApi,
          );
          const results = await findNearestBranches(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          console.log('[HenNSlice] findNearestBranches results:', results);
          if (results.length > 0) {
            setNearestBranch(results[0]);
            setSelectedBranch(results[0]);
          } else {
            setGeoError('No branches found near your location.');
          }
        } catch {
          setGeoError('Could not check nearby branches. Please try pickup.');
        }
        setLoading(false);
      },
      () => {
        setGeoError('Could not get your location. Please enable location access or choose pickup.');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const { createClient } = await import('@hen-n-slice/api-client').then(
        (m) => m,
      );
      const supabase = createClient();
      const raw = await supabase.from('branches').select('*');
      console.log('[HenNSlice] getActiveBranches raw:', raw);
      const list = raw.data ?? [];
      console.log('[HenNSlice] parsed branches:', list.length, list);
      setBranches(list);
    } catch (err) {
      console.error('[HenNSlice] getActiveBranches error:', err);
      setBranches([]);
    }
    setLoading(false);
  }, []);

  const handlePickupLocation = useCallback(async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { findNearestBranches } = await import('@hen-n-slice/api-client').then(
            (m) => m.branchesApi,
          );
          const results = await findNearestBranches(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          if (results.length > 0) {
            setNearestPickupBranchId(results[0].id);
          }
        } catch {
          // Silently ignore — manual selection is the fallback
        }
      },
      () => {
        // Silently ignore — manual selection is the fallback
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }, []);

  const handleConfirm = () => {
    if (!selectedBranch || !orderType) return;
    setBranch(selectedBranch.id, selectedBranch.name);
    confirmSelection();
  };

  const canConfirm = !!selectedBranch && !!orderType;
  const displayBranch = nearestBranch || selectedBranch;

  if (!mounted || !isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div
        className="mx-4 w-full max-w-lg overflow-hidden rounded-md bg-surface-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-brand-purple p-6 text-center text-text-on-brand">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-2xl">
            🍗
          </div>
          <h2 className="font-heading text-xl font-bold">Welcome to Hen N Slice</h2>
          <p className="mt-1 text-sm text-text-on-brand/70">
            Select your location to see menu and pricing
          </p>
        </div>

        <div className="flex border-b border-border-light">
          <button
            onClick={() => { setTab('delivery'); setOrderType('delivery'); }}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
              tab === 'delivery'
                ? 'border-b-2 border-brand-gold text-brand-purple'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="mr-1.5">🚚</span> Delivery
          </button>
          <button
            onClick={() => { setTab('pickup'); setOrderType('pickup'); }}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
              tab === 'pickup'
                ? 'border-b-2 border-brand-gold text-brand-purple'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span className="mr-1.5">🏪</span> Pickup
          </button>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-6">
          {tab === 'delivery' && (
            <div className="space-y-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
                  <span className="ml-3 text-sm text-text-secondary">
                    Finding nearest branch...
                  </span>
                </div>
              )}

              {geoError && (
                <div className="rounded-md bg-status-error/10 p-4 text-sm text-status-error">
                  {geoError}
                  <p className="mt-2">
                    <button
                      onClick={() => setTab('pickup')}
                      className="font-semibold text-brand-purple underline"
                    >
                      Switch to pickup instead
                    </button>
                  </p>
                </div>
              )}

              {displayBranch && !loading && (
                <div
                  className={`cursor-pointer rounded-md border-2 p-4 transition-colors ${
                    selectedBranch?.id === displayBranch.id
                      ? 'border-brand-gold bg-brand-gold/5'
                      : 'border-border-light hover:border-brand-purple/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary">
                        {displayBranch.name}
                      </h3>
                      {displayBranch.address && (
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {displayBranch.address}
                        </p>
                      )}
                      {'distance_km' in displayBranch && (
                        <p className="mt-1 text-xs text-text-muted">
                          {(displayBranch as BranchWithDistance).distance_km.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-full bg-brand-purple/5 px-3 py-1 text-xs font-semibold text-brand-purple">
                      {displayBranch.delivery_radius_km} km
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                    <span>
                      Min order:{' '}
                      <span className="font-semibold text-text-primary">
                        PKR {displayBranch.min_order_delivery}
                      </span>
                    </span>
                    <span>
                      Delivery fee:{' '}
                      <span className="font-semibold text-text-primary">
                        PKR 80
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {!loading && !displayBranch && !geoError && (
                <p className="py-6 text-center text-sm text-text-muted">
                  Click "Find My Location" to search for nearby branches.
                </p>
              )}

              {!loading && !displayBranch && !geoError && (
                <button
                  onClick={handleDelivery}
                  className="w-full rounded-md bg-brand-purple py-2.5 text-sm font-semibold text-text-on-brand transition-colors hover:bg-brand-purple/90"
                >
                  📍 Find My Location
                </button>
              )}
            </div>
          )}

          {tab === 'pickup' && (
            <div className="space-y-3">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
                  <span className="ml-3 text-sm text-text-secondary">
                    Loading branches...
                  </span>
                </div>
              )}

              {!loading && branches.length === 0 && (
                <p className="py-6 text-center text-sm text-text-muted">
                  No branches available right now.
                </p>
              )}

              {branches.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`cursor-pointer rounded-md border-2 p-4 transition-colors ${
                    selectedBranch?.id === b.id
                      ? 'border-brand-gold bg-brand-gold/5'
                      : nearestPickupBranchId === b.id
                        ? 'border-brand-purple/40 bg-brand-purple/5'
                        : 'border-border-light hover:border-brand-purple/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-text-primary">
                        {b.name}
                      </h3>
                      {b.address && (
                        <p className="mt-0.5 text-sm text-text-secondary">
                          {b.address}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {nearestPickupBranchId === b.id && (
                        <span className="rounded-full bg-brand-purple/10 px-2 py-0.5 text-xs font-semibold text-brand-purple">
                          Nearest
                        </span>
                      )}
                      <span className="shrink-0 rounded-full bg-brand-purple/5 px-3 py-1 text-xs font-semibold text-brand-purple">
                        Pickup
                      </span>
                    </div>
                  </div>
                  {b.phone && (
                    <p className="mt-2 text-xs text-text-muted">{b.phone}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border-light p-4">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`w-full rounded-md py-3 text-sm font-bold transition-colors ${
              canConfirm
                ? 'bg-brand-gold text-text-primary hover:bg-brand-gold/90'
                : 'cursor-not-allowed bg-gray-100 text-text-muted'
            }`}
          >
            {canConfirm
              ? `Confirm — ${orderType === 'delivery' ? '🚚 Delivering to' : '🏪 Pick up at'} ${selectedBranch?.name}`
              : 'Select a branch to continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
