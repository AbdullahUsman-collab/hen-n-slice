import type { Branch, BranchWithDistance } from '@hen-n-slice/types';

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestBranch(
  userLat: number,
  userLng: number,
  branches: Branch[],
): BranchWithDistance | null {
  const withinRange = branches
    .filter((b) => b.is_active)
    .map((b) => {
      const distance = haversineKm(
        userLat,
        userLng,
        b.location.lat,
        b.location.lng,
      );
      return { ...b, distance_km: Math.round(distance * 100) / 100 };
    })
    .filter((b) => b.distance_km <= b.delivery_radius_km);

  if (withinRange.length === 0) return null;

  withinRange.sort((a, b) => a.distance_km - b.distance_km);
  return withinRange[0];
}
