/* eslint-disable @typescript-eslint/no-unused-vars */
import { href, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, Search, LogOut, ShoppingCart, X } from "lucide-react";
import { showToast } from "@/utils/toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CartPopover } from "@/components/cartPopover";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const navigation = [
    { name: "Trang chủ", href: "/" },
    {
      name: "Điện thoại",
      href: "/products?category=phone",
    },
    {
      name: "Phụ kiện",
      href: "/products?category=accessory",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">PS</span>
          </div>
          <span className="font-bold text-xl">Phone Store</span>
        </Link>

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

        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <div
              className={`
                flex items-center gap-2
                absolute right-10 h-10
                px-3
                rounded-full
                border bg-background/60 backdrop-blur-xl shadow-md // THAY ĐỔI: border-gray-200 và bg-white/60
                transition-all duration-300 ease-out
                ${
                  showSearch
                    ? "w-80 opacity-100"
                    : "w-0 opacity-0 pointer-events-none"
                }
              `}
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />

              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/products?search=${searchText}`);
                    setSearchText("");
                    setShowSearch(false);
                  }
                }}
                autoFocus={showSearch}
                placeholder="Tìm iPhone, phụ kiện..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="p-1 rounded-full hover:bg-accent transition"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (showSearch && !searchText) setShowSearch(false);
                else setShowSearch(true);
              }}
              className="relative z-20"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {user && <CartPopover />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt="User Avatar" />
                    <AvatarFallback>
                      {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
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
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Đăng nhập</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Đăng ký</Link>
              </Button>
            </div>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 pt-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-lg font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t">
                    <Button
                      variant="outline"
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

                {user && (
                  <div className="flex flex-col space-y-1 pt-4 border-t">
                    {/* Thông tin user */}
                    <div className="flex items-center space-x-2 p-2 mb-2">
                      <Avatar className="h-9 w-9">
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
                    <Button
                      variant="ghost"
                      className="justify-start"
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
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive hover:text-destructive"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
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
