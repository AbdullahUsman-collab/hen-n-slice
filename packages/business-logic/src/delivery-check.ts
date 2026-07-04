import type { DeliveryZone } from '@hen-n-slice/types';

function pointInPolygon(
  lat: number,
  lng: number,
  polygon: [number, number][],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getDeliveryZone(
  branchId: string,
  lat: number,
  lng: number,
  zones: DeliveryZone[],
): DeliveryZone | null {
  const branchZones = zones.filter((z) => z.branch_id === branchId);

  for (const zone of branchZones) {
    if (zone.boundary && zone.boundary.length >= 3) {
      if (pointInPolygon(lat, lng, zone.boundary)) {
        return zone;
      }
    } else {
      return zone;
    }
  }

  return null;
}

export function calculateDeliveryFee(
  zone: DeliveryZone,
  subtotal: number,
): number {
  if (subtotal >= zone.min_order) return 0;
  return zone.fee;
}
