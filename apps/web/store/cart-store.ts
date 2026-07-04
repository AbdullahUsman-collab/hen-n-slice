import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartStoreItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  modifiers?: Record<string, string[]>;
}

interface CartStore {
  items: CartStoreItem[];
  branchId: string | null;
  addItem: (item: CartStoreItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      branchId: null,

      addItem: (item) => {
        const { items, branchId } = get();
        const currentBranchId = (() => {
          try {
            const raw = localStorage.getItem('hen-n-slice-branch');
            return raw ? JSON.parse(raw).branchId : null;
          } catch {
            return null;
          }
        })();

        if (currentBranchId && branchId && branchId !== currentBranchId) {
          console.warn(
            '[HenNSlice] Branch changed since cart was created — clearing cart',
          );
          set({ items: [item], branchId: currentBranchId });
          return;
        }

        const existing = items.find((i) => i.menuItemId === item.menuItemId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
            branchId: currentBranchId ?? branchId,
          });
        } else {
          set({
            items: [...items, item],
            branchId: currentBranchId ?? branchId,
          });
        }
      },

      removeItem: (menuItemId) => {
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
      },

      updateQuantity: (menuItemId, qty) => {
        if (qty <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: qty } : i,
          ),
        });
      },

      clearCart: () => set({ items: [], branchId: null }),
    }),
    { name: 'hen-n-slice-cart' },
  ),
);
