import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showToast } from "@/utils/toast";
import { resetPassword } from "@/apis/forgot-pasword.api";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("emai"); // note: typo in URL, should be "email"
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      showToast({
        type: "error",
        title: "Lỗi",
        description: "Token không hợp lệ",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, data.newPassword);
      if (!response.success) {
        showToast({
          type: "error",
          title: "Lỗi",
          description: response.message || "Có lỗi xảy ra",
        });
        return;
      }

      showToast({
        type: "success",
        title: "Thành công",
        description: "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.",
      });

      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      showToast({
        type: "error",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đặt lại mật khẩu",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="shadow-sm w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Link không hợp lệ. Vui lòng kiểm tra lại email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PS</span>
            </div>
            <span className="font-bold text-2xl text-foreground">
              Phone Store
            </span>
          </div>

          <p className="text-muted-foreground">Đặt lại mật khẩu của bạn</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Đặt lại mật khẩu
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Nhập mật khẩu mới"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="Nhập lại mật khẩu"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pt-6">
            <div className="text-center text-sm text-muted-foreground">
              Quay lại{" "}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                đăng nhập
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
