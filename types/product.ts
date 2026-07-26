export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  unit_price: string | number;
  inventory: number;
  collection: number;
}