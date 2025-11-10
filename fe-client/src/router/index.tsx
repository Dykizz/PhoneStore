import { MainLayout } from "@/components/layout/MainLayout";
import CartPage from "@/pages/CartPage";
import CheckoutPage1 from "@/pages/CheckoutPage/checkout1";
import CheckoutPage2 from "@/pages/CheckoutPage/checkout2";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import ProductDetail from "@/pages/ProductDetail";
import ProductsPage from "@/pages/Products";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter  } from "react-router-dom";
import OrdersPage from "@/pages/Oders/oders";
import OrderDetailPage from "@/pages/Oders/ordersDetail";

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
        path: "products/:id",
        element: <ProductDetail />,
      },
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
        element: <CartPage/>
      },
      {
        path: "checkout-page1",
        element: <CheckoutPage1/>
      },
      {
        path: "checkout-page2",
        element: <CheckoutPage2/>
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/orders/:id",
        element: <OrderDetailPage />,
      },
      
    ],
  },
]);
