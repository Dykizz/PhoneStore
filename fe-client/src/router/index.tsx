import { MainLayout } from "@/components/layout/MainLayout";
import CartPage from "@/pages/CartPage";

import CheckoutPage2 from "@/pages/CheckoutPage/checkout2";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import ProductDetail from "@/pages/ProductDetail";
import ProductsPage from "@/pages/Products";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter } from "react-router-dom";
// import { ProductDetail } from "@/pages/ProductDetail";
// import { CheckoutPage } from "@/pages/CheckoutPage/checkout1";
import Profile from "@/pages/Profile";
import CheckoutPage from "@/pages/CheckoutPage";
import PaymentResult from "@/pages/PaymentResult";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/Orders/OrderDetail";

// const isAuthenticated = () => {
//   return true;
// };

// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }
//   return children; // Nếu đã đăng nhập, cho phép truy cập
// };

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
        children: [
          {
            path: "con",
          },
        ],
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      // {
      //   path: "checkout",
      //   element: <CheckoutPage />,
      // },
      {
        path: "profile",
        element: <Profile />,
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
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "checkout-page2",
        element: <CheckoutPage2 />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
      {
        path: "payment/result",
        element: <PaymentResult />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "orders/:id",
        element: <OrderDetailPage />,
      },
    ],
  },
]);
