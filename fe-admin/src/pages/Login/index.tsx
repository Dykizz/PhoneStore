import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import * as z from "zod";
import { Button, Input, Card, Form, Checkbox, message } from "antd";
import { login } from "@/apis/auth.api";
import { useAuth } from "@/hooks/useAuth";

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (!response.success) {
        console.log("🔴 Login failed:", response);
        const errorMsg = response.message || "Có lỗi xảy ra";
        const { statusCode } = response;
        if (statusCode === 400) {
          message.error("Đăng nhập thất bại: " + errorMsg);
          console.warn("🔴 Unauthorized login attempt");
        } else {
          message.error("Lỗi hệ thống: " + errorMsg);
        }
        return;
      }

      authLogin(response.data.user, response.data.accessToken);

      message.success("Đăng nhập thành công! Chào mừng bạn trở lại!");

      navigate("/");
    } catch (error) {
      console.error("🔴 Login error:", error);
      message.error("Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <PhoneOutlined className="text-2xl text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">PhoneStore</h1>
          </div>
          <p className="text-gray-600">Chào mừng bạn trở lại!</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Đăng nhập</h2>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{
              email: "",
              password: "",
              remember: false,
            }}
          >
            {/* Email Field */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email là bắt buộc" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                size="large"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Mật khẩu là bắt buộc" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-4">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
