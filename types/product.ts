// export interface Product {
//   id: number;
//   title: string;
//   slug: string;
//   description: string | null;
//   unit_price: string | number;
//   inventory: number;
//   collection: number;
// }

export interface ProductImage {
  id: number;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  unit_price: string | number;
  inventory: number;
  collection: number;

  // Multiple product images (optional)
  images?: ProductImage[];
}