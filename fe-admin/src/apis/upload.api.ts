import type { ApiResponse } from "@/interfaces/apiResponse.interface";
import apiClient from "@/utils/apiClient";
import imageCompression from "browser-image-compression";

export async function getSignature(): Promise<
  ApiResponse<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  }>
> {
  return await apiClient.get<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
  }>(`/upload/signature`);
}
export async function uploadImages(files: File[]): Promise<string[]> {
  const res = await getSignature();
  if (!res.success) {
    throw new Error("Lấy chữ ký upload ảnh thất bại");
  }

  const { signature, timestamp, cloudName, apiKey } = res.data;

  const uploadPromises = Array.from(files).map(async (file) => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", "uploads");
    formData.append("upload_preset", "ml_default");
    formData.append("access_mode", "public");

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await uploadRes.json();
    if (!uploadRes.ok) {
      console.error("Upload error:", data);
      throw new Error(data.error?.message || "Upload ảnh thất bại");
    }
    return data.secure_url;
  });

  const results = await Promise.allSettled(uploadPromises);

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r: PromiseFulfilledResult<string>) => r.value);
}
