export interface DiscountPolicy {
  id: string;
  name: string;
  description?: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountPolicy {
  name: string;
  description?: string;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
}

export type UpdateDiscountPolicy = Partial<CreateDiscountPolicy>;
