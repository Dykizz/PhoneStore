export interface ProductType {
  id: string;
  name: string;
  description?: string;
  defaultSpecifications?: string[];
  createdAt: Date;
  updatedAt: Date;
}
