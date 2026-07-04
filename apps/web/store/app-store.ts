import { create } from 'zustand';

export type OrderType = 'delivery' | 'pickup';

interface CustomerLocation {
  lat: number;
  lng: number;
}

interface AppState {
  branchId: string | null;
  branchName: string | null;
  orderType: OrderType | null;
  deliveryArea: string | null;
  customerLocation: CustomerLocation | null;
  isModalOpen: boolean;
  hasSelectedBranch: boolean;

  setBranch: (id: string, name: string) => void;
  setDeliveryArea: (area: string) => void;
  setOrderType: (type: OrderType) => void;
  setCustomerLocation: (loc: CustomerLocation) => void;
  openModal: () => void;
  confirmSelection: () => void;
}

function loadPersisted() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('hen-n-slice-branch');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const persisted = loadPersisted();

export const useAppStore = create<AppState>((set, get) => ({
  branchId: persisted?.branchId ?? null,
  branchName: persisted?.branchName ?? null,
  orderType: persisted?.orderType ?? null,
  deliveryArea: persisted?.deliveryArea ?? null,
  customerLocation: persisted?.customerLocation ?? null,
  isModalOpen: !persisted,
  hasSelectedBranch: !!persisted,

  setBranch: (id, name) => set({ branchId: id, branchName: name }),

  setDeliveryArea: (area) => {
    set({ deliveryArea: area });
    const { branchId, branchName, orderType, customerLocation } = get();
    localStorage.setItem(
      'hen-n-slice-branch',
      JSON.stringify({ branchId, branchName, orderType, deliveryArea: area, customerLocation }),
    );
  },

  setOrderType: (type) => set({ orderType: type }),

  setCustomerLocation: (loc) => set({ customerLocation: loc }),

  openModal: () => set({ isModalOpen: true }),

  confirmSelection: () => {
    const { branchId, branchName, orderType, deliveryArea, customerLocation } = get();
    if (!branchId || !orderType) return;

    localStorage.setItem(
      'hen-n-slice-branch',
      JSON.stringify({ branchId, branchName, orderType, deliveryArea, customerLocation }),
    );
    set({ hasSelectedBranch: true, isModalOpen: false });
  },
}));
