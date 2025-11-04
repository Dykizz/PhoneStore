import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import type { PaginatedResponse } from "@/interfaces/pagination.interface";
import apiClient from "@/utils/apiClient";
import type {
  BaseProduct,
  CreateProduct,
  DetailProduct,
  UpdateProduct,
} from "@/types/product.type";
import { uploadImages } from "./upload.api";

export async function getProducts(
  query: string
): Promise<ApiResponse<PaginatedResponse<BaseProduct>>> {
  return await apiClient.get<PaginatedResponse<BaseProduct>>(
    `/products${query}`
  );
}

export async function getProduct(
  id: string
): Promise<ApiResponse<DetailProduct>> {
  return await apiClient.get<DetailProduct>(`/products/${id}`);
}

export async function createProduct(
  data: CreateProduct
): Promise<ApiResponse<void>> {
  if (data.variants?.length > 0) {
    const imageFiles: File[] = [];
    data.variants.forEach((v) => {
      if (v.image instanceof File) {
        imageFiles.push(v.image);
      }
    });

    if (imageFiles.length > 0) {
      const uploadedImageUrls = await uploadImages(imageFiles);
      let uploadIndex = 0;
      data.variants = data.variants.map((v) => {
        const url = uploadedImageUrls[uploadIndex];
        if (v.image instanceof File) {
          uploadIndex++;
          return { ...v, image: url };
        } else {
          return v;
        }
      });
    }
  }
  return await apiClient.post<void>(`/products`, data);
}

export async function updateProduct(
  id: string,
  data: UpdateProduct
): Promise<ApiResponse<void>> {
  if (data.variants && data.variants?.length > 0) {
    const imageFiles: File[] = [];
    data.variants.forEach((v) => {
      if (v.image instanceof File) {
        imageFiles.push(v.image);
      }
    });

    if (imageFiles.length > 0) {
      const uploadedImageUrls = await uploadImages(imageFiles);
      let uploadIndex = 0;
      data.variants = data.variants.map((v) => {
        const url = uploadedImageUrls[uploadIndex];
        if (v.image instanceof File) {
          uploadIndex++;
          return { ...v, image: url };
        } else {
          return v;
        }
      });
    }
  }
  return await apiClient.patch<void>(`/products/${id}`, data);
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  return await apiClient.delete<null>(`/products/${id}`);
}


