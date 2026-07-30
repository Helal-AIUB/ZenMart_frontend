import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useCartStore } from '../../store/useCartStore';

interface AddToCartPayload {
  productId: number;
  quantity: number;
}

export const useAddToCart = () => {
  const { cartId, setCartId } = useCartStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: AddToCartPayload) => {
      let currentCartId = cartId;

      if (!currentCartId) {
        const cartRes = await apiClient.post('/carts/');
        currentCartId = cartRes.data.id;
        setCartId(cartRes.data.id);
      }

      // 2. Add item to cart or update
      const res = await apiClient.post(`/carts/${currentCartId}/items/`, {
        product_id: productId,
        quantity: quantity,
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};