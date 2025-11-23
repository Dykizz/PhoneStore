# 💻 Dự án: Phone Store

## 🛠️ Công Nghệ Sử Dụng

### Backend (BE)

- **Framework**: [NestJS](https://nestjs.com/)
- **Cơ sở dữ liệu**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)

### Frontend (FE)

- **Client**:
  - **Framework**: [React](https://reactjs.org/) (Vite)
  - **UI Library**: [Shadcn UI](https://ui.shadcn.com/)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Admin**:
  - **Framework**: [React](https://reactjs.org/) (Vite)
  - **UI Library**: [Ant Design](https://ant.design/) (Hạn chế sử dụng)
  - **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Chuẩn bị Môi Trường

1.  **Cập nhật Node.js**: Đảm bảo phiên bản Node.js là **v22.20.0** hoặc mới hơn.
    ```bash
    node -v
    ```
2.  **Cài đặt thư viện**: Mở từng thư mục `backend`, `fe-client`, và `fe-admin` và chạy lệnh sau để cài đặt các dependency cần thiết:
    ```bash
    npm install
    ```

### Bước 2: Cấu Hình Môi Trường

1.  Tạo file `.env` trong thư mục `backend` và điền thông tin sau:

    ```ini
    # Cấu hình Database
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=<tài_khoản_của_bạn>
    DATABASE_PASSWORD=<mật_khẩu_của_bạn>
    DATABASE_NAME=phonestore

    # Cấu hình Server & Ports
    PORT=8000
    NODE_ENV=development

    # URLs của các ứng dụng FE
    HOST_ADMIN=http://localhost:3000
    HOST_ADMIN1=http://localhost:3001
    HOST_CLIENT=http://localhost:5173
    HOST_CLIENT1=http://localhost:5174

    # Cấu hình JWT Access Token
    JWT_ACCESS_TOKEN_SECRET=<mật_khẩu_bí_mật_tùy_ý>
    JWT_ACCESS_TOKEN_EXPIRATION=1d

    # Cấu hình JWT Refresh Token
    JWT_REFRESH_TOKEN_SECRET=<mật_khẩu_bí_mật_tùy_ý>
    JWT_REFRESH_TOKEN_EXPIRATION=7d
    JWT_REFRESH_TOKEN_EXPIRATION_REMEMBER=30d
    ```

---

## ⚠️ Quy Tắc và Lưu Ý

- **Môi trường làm việc**: Khi làm việc, chỉ mở **một thư mục con** (`backend`, `fe-client`, hoặc `fe-admin`) trong một cửa sổ VS Code riêng biệt. **Không mở thư mục cha** để tránh các lỗi import không mong muốn.
- **API**: Các API call phải được đặt trong thư mục `apis` và tuân thủ kiểu trả về `ApiResponse<T>`.
- **Truy vấn**: Sử dụng `queryBuilder.ts` trong thư mục `utils` để xây dựng các truy vấn.
