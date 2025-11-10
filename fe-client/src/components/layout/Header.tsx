/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// SỬA 1: Xóa ShoppingCart khỏi đây nếu CartPopover không dùng nó
import { Menu, User, Search, LogOut, ShoppingCart } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

// SỬA 2: Import CartPopover
import { CartPopover } from '@/components/cartPopover';

export function Header() {
  const [isOpen, setIsOpen] = useState(false); // State cho mobile menu
  const { user, logout } = useAuth(); // Lấy thông tin user và hàm logout

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        type: "success",
        title: "Đăng xuất thành công",
      });
    } catch (error) {
      showToast({
        type: "error",
        title: "Đăng xuất thất bại",
        description: "Có lỗi xảy ra khi đăng xuất",
      });
    }
  };

  // Danh sách các mục điều hướng
  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/products" },
    // Thêm các mục khác nếu cần
  ];

  return (
    // Header chính, cố định ở trên cùng
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo và Tên cửa hàng */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Icon logo đơn giản */}
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">PS</span>
          </div>
          <span className="font-bold text-xl">Phone Store</span>
        </Link>

        {/* Navigation cho Desktop */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Các nút hành động bên phải */}
        <div className="flex items-center space-x-2">
          {/* Nút tìm kiếm (ví dụ) */}
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>

          {/* SỬA 3: Thay thế nút giỏ hàng cũ bằng CartPopover */}
          {/* Nút giỏ hàng cũ đã bị xóa */}
          {/* <Button variant="ghost" size="icon">
            <ShoppingCart className="h-4 w-4" />
          </Button> */}
          {/* Sử dụng CartPopover component */}
          <CartPopover />

          {/* Menu User hoặc Nút Đăng nhập/Đăng ký */}
          {user ? (
            // Nếu đã đăng nhập -> Hiển thị Dropdown Menu User
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt="User Avatar" />
                    {/* Fallback nếu không có ảnh */}
                    <AvatarFallback>
                      {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              {/* Nội dung Dropdown */}
              <DropdownMenuContent className="w-56" align="end" forceMount>
                {/* Thông tin User */}
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.userName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                {/* Các mục menu */}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="w-full">
                    <User className="mr-2 h-4 w-4" /> Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Đơn hàng
                  </Link>
                </DropdownMenuItem>
                {/* Nút đăng xuất */}
                <DropdownMenuItem
                  onClick={handleLogout} // Gọi hàm xử lý đăng xuất
                  className="text-red-500 cursor-pointer focus:bg-red-50 focus:text-red-600" // Thêm style
                >
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Nếu chưa đăng nhập -> Hiển thị nút Đăng nhập / Đăng ký
            <div className="hidden md:flex items-center space-x-2"> {/* Ẩn trên mobile vì đã có trong sheet */}
              <Button variant="ghost" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          {/* Nút mở Menu Mobile (chỉ hiển thị trên màn hình nhỏ) */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden"> {/* md:hidden để ẩn trên desktop */}
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            {/* Nội dung Menu Mobile (Sheet) */}
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 pt-6"> {/* Thêm padding top */}
                {/* Lặp qua các mục điều hướng */}
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary" // Tăng cỡ chữ
                    onClick={() => setIsOpen(false)} // Đóng sheet khi click
                  >
                    {item.name}
                  </Link>
                ))}
                {/* Các nút Đăng nhập/Đăng ký cho Mobile (nếu chưa đăng nhập) */}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button
                      variant="outline" // Đổi thành outline
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/login">Đăng nhập</Link>
                    </Button>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link to="/register">Đăng ký</Link>
                    </Button>
                  </div>
                )}
                {/* Menu User cho Mobile (nếu đã đăng nhập) */}
                {user && (
                  <div className="flex flex-col space-y-1 pt-4 border-t">
                    {/* Thông tin user */}
                    <div className="flex items-center space-x-2 p-2 mb-2">
                      <Avatar className="h-9 w-9"> {/* Tăng cỡ Avatar */}
                        <AvatarImage src={user?.avatar} alt="User Avatar" />
                        <AvatarFallback>
                          {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {/* Các link menu */}
                    <Button
                      variant="ghost"
                      className="justify-start" // Căn trái
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" /> Hồ sơ
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link to="/orders">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Đơn hàng
                      </Link>
                    </Button>
                    {/* Nút đăng xuất */}
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600 hover:text-red-700" // Màu đỏ
                      onClick={() => {
                        handleLogout(); // Gọi hàm đăng xuất
                        setIsOpen(false); // Đóng sheet
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}