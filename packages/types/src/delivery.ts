export interface DeliveryZone {
  id: string;
  branch_id: string;
  name: string;
  fee: number;
  min_order: number;
  /** Polygon vertices as [lng, lat][] for client-side point-in-polygon checking. Omitted when querying server-side via RPC. */
  boundary?: [number, number][] | null;
}

export interface DeliveryCheckResult {
  available: boolean;
  zone?: DeliveryZone;
  fee?: number;
}
