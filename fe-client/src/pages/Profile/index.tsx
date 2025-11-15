"use client"

import { useState } from "react"
import { users } from "@/data"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

const customer = users.find((u) => u.role === "customer")!

export default function ProfilePage() {
  const [form, setForm] = useState({
    userName: customer.userName,
    email: customer.email,
    defaultAddress: customer.defaultAddress ?? "",
    contactPhoneNumber: "",
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    old: "",
    newPw: "",
    confirm: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900 transition-all duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-14">

        {/* HEADER */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-center">
            Tài khoản Phone Store
          </h1>
          <p className="text-center text-slate-600 mt-2 text-base md:text-lg">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">

          {/* LEFT — AVATAR + BASIC INFO */}
          <div className="bg-white/70 border border-white/40 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 animate-slideUp">
            
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="Avatar"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-white/70 shadow-lg object-cover"
                />
                <div className="absolute -bottom-1 -right-1 px-2 py-1 rounded-full bg-emerald-500 text-[10px] font-medium text-white shadow-md">
                  Hoạt động
                </div>
              </div>

              <p className="mt-4 text-lg font-medium">{customer.userName}</p>
              <p className="text-sm text-slate-500">Thành viên Phone Store</p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 rounded-full border-slate-300 bg-white/80 text-sm hover:bg-slate-50"
              >
                Đổi Avatar
              </Button>
            </div>

            {/* INFO */}
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Thông tin khách hàng
            </h2>

            <div className="space-y-4 text-sm md:text-base leading-relaxed">
              <InfoRow label="Họ tên" value={customer.userName} />
              <InfoRow label="Email" value={customer.email} />
              <InfoRow
                label="Địa chỉ"
                value={customer.defaultAddress ?? "Chưa cập nhật"}
              />
              <InfoRow label="Quyền" value={customer.role} />
            </div>
          </div>

          {/* RIGHT — EDIT INFO + PASSWORD */}
          <div className="lg:col-span-2 space-y-10">

            {/* EDIT INFO */}
            <div className="bg-white/80 border border-white/60 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_22px_80px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 animate-slideUp delay-200">
              <h2 className="text-lg md:text-xl font-semibold mb-6">
                Chỉnh sửa thông tin
              </h2>

              <div className="space-y-6">
                <FormRow label="Họ tên">
                  <Input
                    name="userName"
                    value={form.userName}
                    onChange={handleChange}
                    className="bg-slate-100/70 border-none"
                  />
                </FormRow>

                <FormRow label="Email">
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="bg-slate-100/70 border-none"
                  />
                </FormRow>

                <FormRow label="Địa chỉ mặc định">
                  <Input
                    name="defaultAddress"
                    value={form.defaultAddress}
                    onChange={handleChange}
                    className="bg-slate-100/70 border-none"
                  />
                </FormRow>

                <FormRow label="Số điện thoại">
                  <Input
                    name="contactPhoneNumber"
                    value={form.contactPhoneNumber}
                    onChange={handleChange}
                    className="bg-slate-100/70 border-none"
                  />
                </FormRow>

                <Button className="bg-black text-white w-full md:w-auto px-8 py-5 text-sm rounded-full hover:bg-gray-900">
                  Lưu thay đổi
                </Button>
              </div>
            </div>

            {/* PASSWORD */}
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
                <div className="mt-6 space-y-5 animate-fadeIn">
                  <FormRow label="Mật khẩu hiện tại">
                    <Input
                      type="password"
                      name="old"
                      value={passwords.old}
                      onChange={handlePasswordChange}
                      className="bg-slate-100/70 border-none"
                    />
                  </FormRow>

                  <FormRow label="Mật khẩu mới">
                    <Input
                      type="password"
                      name="newPw"
                      value={passwords.newPw}
                      onChange={handlePasswordChange}
                      className="bg-slate-100/70 border-none"
                    />
                  </FormRow>

                  <FormRow label="Nhập lại mật khẩu mới">
                    <Input
                      type="password"
                      name="confirm"
                      value={passwords.confirm}
                      onChange={handlePasswordChange}
                      className="bg-slate-100/70 border-none"
                    />
                  </FormRow>

                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-sm rounded-full">
                    Xác nhận đổi mật khẩu
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ------------------ COMPONENT: INFO ROW ------------------ */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 border-b border-white/60 pb-2 text-sm md:text-base">
      <span className="text-slate-600">{label}:</span>
      <span className="font-medium text-right">{value}</span>
    </p>
  )
}

/* ------------------ COMPONENT: FORM ROW ------------------ */
function FormRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-slate-700">{label}</Label>
      {children}
    </div>
  )
}
