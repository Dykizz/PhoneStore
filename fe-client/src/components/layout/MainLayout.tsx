import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "sonner";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" richColors />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
