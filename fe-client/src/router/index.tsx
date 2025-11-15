import { MainLayout } from "@/components/layout/MainLayout";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/Orders/OrderDetail";
import PaymentResult from "@/pages/PaymentResult";
import ProductDetail from "@/pages/ProductDetail";
import ProductsPage from "@/pages/Products";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter  } from "react-router-dom";

// const isAuthenticated = () => {
//   return true;
// };

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
        path:"products",
        element: <ProductsPage/>
      },
      {
        path: "product/:id",
        element: <ProductDetail />,
      },
      // {
      //   path: "checkout",
      //   element: <CheckoutPage />,
      // },
      // {
      //   path: "profile",
      //   element: <Profile />,
      // },
      // {
      //   path: "checkout",
      //   element: (
      //     <ProtectedRoute>
      //       <CheckoutPage />
      //     </ProtectedRoute>
      //   ),
      // },
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
        path: "cart",
        element: <CartPage />,
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
        path: "orders/:id",
        element: <OrderDetailPage />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />
      }
      
    ],
  },
]);
