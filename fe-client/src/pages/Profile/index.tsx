"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import type { DetailUser, UpdateUser } from "@/types/user.type";
import { changePassword, getMyProfile, updateProfile } from "@/apis/user.api";
import { showToast } from "@/utils/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AddressSelect from "../CheckoutPage/AddressSelect";
import { uploadImages } from "@/apis/upload.api";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileFormSchema = z.object({
  userName: z
    .string()
    .min(1, "Tên đăng nhập là bắt buộc")
    .min(6, "Tên đăng nhập phải có ít nhất 6 ký tự")
    .max(20, "Tên đăng nhập không được vượt quá 20 ký tự"),
  phoneNumber: z.string().optional(),
  city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
  street: z.string().min(1, "Vui lòng nhập số nhà, tên đường"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z
  .object({
    old: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPw: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirm: z.string(),
  })
  .refine((data) => data.newPw === data.confirm, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirm"],
  });

type PasswordFormData = z.infer<typeof passwordFormSchema>;

interface AddressOption {
  value: string;
  label: string;
  children?: AddressOption[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<DetailUser | null>(null);
  const [cityOptions, setCityOptions] = useState<AddressOption[]>([]);
  const [forceLoad, setForceLoad] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      userName: "",
      phoneNumber: "",
      city: "",
      district: "",
      ward: "",
      street: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      old: "",
      newPw: "",
      confirm: "",
    },
  });

  const watchedCity = useWatch({
    control: profileForm.control,
    name: "city",
  });
  const watchedDistrict = useWatch({
    control: profileForm.control,
    name: "district",
  });

  const getSelectedProvince = () =>
    cityOptions.find((p) => p.value === watchedCity);
  const getSelectedDistrict = () =>
    getSelectedProvince()?.children?.find((d) => d.value === watchedDistrict);

  // Effect để xử lý đóng popover (giữ nguyên)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        showAvatarEditor &&
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        setShowAvatarEditor(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setShowAvatarEditor(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [showAvatarEditor]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (user?.avatar) setAvatarPreview(user.avatar);
  }, [user?.avatar]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        const formattedData = data.map((province: any) => ({
          value: String(province.code),
          label: province.name,
          children: province.districts.map((district: any) => ({
            value: String(district.code),
            label: district.name,
            children: district.wards.map((ward: any) => ({
              value: String(ward.code),
              label: ward.name,
            })),
          })),
        }));
        setCityOptions(formattedData);
      })
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMyProfile();
        if (response.success) {
          setUser(response.data);
          setAvatarPreview(response.data.avatar || "");
        } else {
          showToast({
            type: "error",
            description: "Không thể tải thông tin người dùng.",
            title: "Lỗi",
          });
        }
      } catch (error) {
        showToast({
          type: "error",
          title: "Lỗi",
          description:
            (error as Error).message || "Lỗi khi tải thông tin người dùng.",
        });
      }
    };

    fetchUserData();
  }, [forceLoad]);

  useEffect(() => {
    if (!user || cityOptions.length === 0) {
      return;
    }

    const defaultFormValues: ProfileFormData = {
      userName: user.userName,
      phoneNumber: user.phoneNumber || "",
      city: "",
      district: "",
      ward: "",
      street: "",
    };

    const addressParts = user.defaultAddress
      ? user.defaultAddress.split(", ")
      : [];

    if (addressParts.length === 4) {
      const street = addressParts[0];
      const wardLabel = addressParts[1];
      const districtLabel = addressParts[2];
      const cityLabel = addressParts[3];

      const foundCity = cityOptions.find((c) => c.label === cityLabel);
      if (foundCity) {
        const foundDistrict = foundCity.children?.find(
          (d) => d.label === districtLabel
        );
        if (foundDistrict) {
          const foundWard = foundDistrict.children?.find(
            (w) => w.label === wardLabel
          );
          if (foundWard) {
            defaultFormValues.city = foundCity.value;
            defaultFormValues.district = foundDistrict.value;
            defaultFormValues.ward = foundWard.value;
            defaultFormValues.street = street;
          }
        }
      }
    }

    if (profileForm.getValues("city") !== defaultFormValues.city) {
      profileForm.reset(defaultFormValues);
    }
  }, [user, cityOptions, profileForm.getValues, profileForm.reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAvatarFile(f);
    if (avatarPreview && avatarPreview.startsWith("blob:"))
      URL.revokeObjectURL(avatarPreview);
    if (f) {
      const url = URL.createObjectURL(f);
      setAvatarPreview(url);
    } else {
      setAvatarPreview(user?.avatar || "");
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsProfileLoading(true);
      const cityLabel =
        cityOptions.find((c) => c.value === data.city)?.label || "";
      const districtLabel =
        getSelectedProvince()?.children?.find((d) => d.value === data.district)
          ?.label || "";
      const wardLabel =
        getSelectedDistrict()?.children?.find((w) => w.value === data.ward)
          ?.label || "";

      const defaultAddress = `${data.street}, ${wardLabel}, ${districtLabel}, ${cityLabel}`;
      const formSave: UpdateUser = {
        userName: data.userName,
        phoneNumber: data.phoneNumber,
        defaultAddress: defaultAddress,
      };

      if (avatarPreview.startsWith("blob:") && avatarFile) {
        const [url] = await uploadImages([avatarFile]);
        formSave.avatar = url;
      } else {
        formSave.avatar = avatarPreview;
      }

      const response = await updateProfile(formSave);
      if (response.success) {
        showToast({
          type: "success",
          title: "Thành công",
          description: "Đã lưu thông tin.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Lỗi",
        description:
          (error as Error).message || "Không thể lưu thông tin người dùng.",
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsPasswordLoading(true);
      const response = await changePassword({
        currentPassword: data.old,
        newPassword: data.newPw,
      });

      if (response.success)
        showToast({
          type: "success",
          title: "Đổi mật khẩu ",
          description: "Đổi mật khẩu thành công.",
        });
      else {
        throw new Error(response.message);
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Lỗi",
        description:
          error instanceof Error ? error.message : "Lỗi khi đổi mật khẩu.",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium">
            Đang tải thông tin người dùng...
          </p>
          <p className="text-sm">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 transition-all duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-14">
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-center">
            Tài khoản Phone Store
          </h1>
          <p className="text-center text-slate-600 mt-2 text-base md:text-lg">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          <div className="bg-white/70 border border-white/40 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 animate-slideUp">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <Avatar className="size-28 md:size-32 rounded-full border border-white/70 shadow-lg">
                  <AvatarImage src={avatarPreview} alt="User Avatar" />
                  <AvatarFallback>
                    {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 px-2 py-1 rounded-full bg-emerald-500 text-[10px] font-medium text-white shadow-md">
                  Hoạt động
                </div>
              </div>

              <p className="mt-4 text-lg font-medium">{user?.userName}</p>
              <p className="text-sm text-slate-500">Thành viên Phone Store</p>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-slate-300 bg-white/80 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setShowAvatarEditor(true);
                  }}
                >
                  Đổi Avatar
                </Button>

                <Dialog
                  open={showAvatarEditor}
                  onOpenChange={setShowAvatarEditor}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Đổi ảnh đại diện</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Label className="text-sm text-slate-700">
                        Xem trước
                      </Label>
                      <div className="flex justify-center">
                        <Avatar className="size-28 md:size-32 rounded-full border border-white/70 shadow-lg">
                          <AvatarImage
                            src={avatarPreview || user?.avatar}
                            alt="User Avatar"
                          />
                          <AvatarFallback>
                            {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div>
                        <Label className="text-sm text-slate-700">
                          Sử dụng link ảnh
                        </Label>
                        <Input
                          placeholder="Nhập link ảnh bạn muốn sử dụng"
                          value={
                            avatarPreview?.startsWith("blob:")
                              ? ""
                              : avatarPreview
                          }
                          onChange={(e) => setAvatarPreview(e.target.value)}
                          className="bg-slate-100/70 border-none mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-sm text-slate-700">
                          Hoặc tải lên từ máy
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-2 cursor-pointer"
                        />

                        {avatarFile && (
                          <p className="text-sm text-slate-600 mt-1">
                            Đã chọn: {avatarFile.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => setShowAvatarEditor(false)}
                      >
                        Đóng
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed">
              <InfoRow label="Họ tên" value={user.userName} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow
                label="Địa chỉ"
                value={user.defaultAddress ?? "Chưa cập nhật"}
              />
              <InfoRow label="Quyền" value={user.role} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="bg-white/80 border border-white/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 animate-slideUp delay-200"
              >
                <h2 className="text-lg md:text-xl font-semibold mb-6">
                  Chỉnh sửa thông tin
                </h2>
                <div className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-100/70 border-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-1">
                    <Label className="text-sm text-slate-700">Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-slate-100/70 border-none cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AddressSelect
                              value={field.value}
                              label="Tỉnh / Thành phố"
                              placeholder="Chọn tỉnh/thành phố"
                              options={cityOptions}
                              onValueChange={(newValue: string) => {
                                if (newValue && newValue !== field.value) {
                                  profileForm.setValue("district", "");
                                  profileForm.setValue("ward", "");
                                  field.onChange(newValue);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AddressSelect
                              value={field.value}
                              label="Quận / Huyện"
                              placeholder="Chọn quận/huyện"
                              options={getSelectedProvince()?.children || []}
                              onValueChange={(newValue: string) => {
                                if (newValue && newValue !== field.value) {
                                  profileForm.setValue("ward", "");
                                  field.onChange(newValue);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="ward"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AddressSelect
                              value={field.value}
                              label="Phường / Xã"
                              placeholder="Chọn phường/xã"
                              options={getSelectedDistrict()?.children || []}
                              onValueChange={(newValue: string) => {
                                if (newValue) field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số nhà, tên đường</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-100/70 border-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-100/70 border-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isProfileLoading}
                      className="bg-black text-white w-full md:w-auto px-8 py-5 text-sm rounded-full hover:bg-gray-900 disabled:opacity-50"
                    >
                      {isProfileLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>
              </form>
            </Form>

            <div className="bg-white/80 border border-white/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 animate-slideUp delay-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
                  <Lock className="w-4 h-4" />
                </div>

                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    Bảo mật tài khoản
                  </h2>
                  <p className="text-sm text-slate-500">
                    Đổi mật khẩu để bảo vệ tài khoản của bạn.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                className="bg-black text-white w-full md:w-auto px-6 py-3 text-sm rounded-full"
                onClick={() => setShowPasswordForm((prev) => !prev)}
              >
                {showPasswordForm ? "Đóng" : "Đổi mật khẩu"}
              </Button>

              {showPasswordForm && (
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="mt-6 space-y-5 animate-fadeIn"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="old"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu hiện tại</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="bg-slate-100/70 border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPw"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="bg-slate-100/70 border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              className="bg-slate-100/70 border-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-sm rounded-full disabled:opacity-50"
                    >
                      {isPasswordLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Xác nhận đổi mậtẩu
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 border-b border-white/60 pb-2 text-sm md:text-base">
      <span className="text-slate-600">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </p>
  );
}
