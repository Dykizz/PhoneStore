import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Phone Store</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted destination for the latest smartphones and
              accessories.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/products/iphone"
                  className="text-muted-foreground hover:text-foreground"
                >
                  iPhone
                </Link>
              </li>
              <li>
                <Link
                  to="/products/samsung"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Samsung
                </Link>
              </li>
              <li>
                <Link
                  to="/products/accessories"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Phụ kiện
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Warranty
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2024 Phone Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
