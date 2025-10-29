import { MainLayout } from "@/components/layout/MainLayout";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter } from "react-router-dom";
import { ProductDetail } from '@/pages/ProductDetail';
import { CheckoutPage } from "@/pages/CheckoutPage";


const isAuthenticated = () => {
  return true;
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children; // Nếu đã đăng nhập, cho phép truy cập
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginPage />,
        children:[
          {
            path: "con",
          }
        ]
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "product/:id",
        element: <ProductDetail />
      },
      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: (
          <div className="container py-8">
            <h1>About</h1>
          </div>
        ),
      },
      {
        path: "contact",
        element: (
          <div className="container py-8">
            <h1>Contact</h1>
          </div>
        ),
      },
    ],
  },
]);
