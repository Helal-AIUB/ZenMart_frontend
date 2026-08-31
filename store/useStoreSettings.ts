import { create } from 'zustand';
import { apiClient } from '@/services/apiClient';

interface StoreSettingsState {
  currencySymbol: string;
  storeName: string;
  isFetched: boolean;
  fetchSettings: () => Promise<void>;
}

export const useStoreSettings = create<StoreSettingsState>((set, get) => ({
  currencySymbol: '৳',
  storeName: 'PetoraBD',
  isFetched: false,
  
  fetchSettings: async () => {
    if (get().isFetched) return; 

    try {
      const res = await apiClient.get('/store/settings/');
      const data = Array.isArray(res.data) ? res.data[0] : (res.data?.results?.[0] || res.data || {});
      
      if (data) {
        set({
          currencySymbol: data.currency_symbol || '৳',
          storeName: data.store_name || 'Petora BD',
          isFetched: true,
        });
      }
    } catch (error) {
      console.error('Failed to fetch store settings for currency', error);
    }
  },
}));