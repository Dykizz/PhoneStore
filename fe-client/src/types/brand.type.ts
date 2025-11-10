export interface Brand {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrand {
  name: string;
  description?: string;
  image?: string | File; 
}

export type UpdateBrand = Partial<CreateBrand>;
