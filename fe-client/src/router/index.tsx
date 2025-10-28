import { MainLayout } from "@/components/layout/MainLayout";
import { Home } from "@/pages/Home";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import { createBrowserRouter } from "react-router-dom";
import { ProductDetail } from '@/pages/ProductDetail';

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
