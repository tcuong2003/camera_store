# 📷 MÁY ẢNH TOP 1 - HỆ THỐNG WEB CATALOG TRƯNG BÀY MÁY ẢNH CŨ SÀI GÒN

> **Website:** `sp.mayanhtop1.com`  
> **Hotline / Zalo Chốt Đơn:** **0986.834.449**  
> **Định vị:** Chuyên máy ảnh cũ Sài Gòn, máy ảnh lướt, ống kính và phụ kiện. Trưng bày theo phong cách Album ảnh thực tế, lọc nhanh theo tầm giá và thương hiệu. Không giỏ hàng rườm rà — khách xem ưng ý bấm chat Zalo hoặc chụp màn hình gửi chủ shop chốt đơn tức thì.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Giao diện Khách hàng (Client Portal)
- **Header & Tìm kiếm:** Logo nhận diện thương hiệu "MÁY ẢNH TOP 1", thanh tìm kiếm nhanh theo tên máy (Canon 60D, Sony A6000, Fuji X-T20...), nút gọi Hotline và nút Chat Zalo trực tiếp.
- **Bộ lọc Album trực quan (Filter Bar):**
  - **Tầm giá:** Dưới 3 triệu, 3 - 5 triệu, 5 - 10 triệu, Trên 10 triệu.
  - **Thương hiệu:** Canon, Sony, Nikon, Fujifilm, Lumix, Olympus, Ricoh, Casio...
  - **Phân loại:** Máy ảnh cũ, Máy ảnh chính hãng, Ống kính (Lens), Phụ kiện, Mirrorless, DSLR, Compact/Y2K.
  - **Sắp xếp:** Mới cập nhật, Giá tăng dần, Giá giảm dần.
- **Lưới hiển thị dạng Album ảnh (Product Grid / Album View):**
  - Ảnh đại diện sắc nét, tỷ lệ 4:3 chuẩn nhiếp ảnh.
  - Thẻ nhãn tình trạng máy (99% Likenew, 98% Đẹp...).
  - Số lượng ảnh thật có trong album (VD: 5 ảnh, 8 ảnh).
  - Giá bán rõ ràng (VNĐ) kèm giá niêm yết cũ.
  - Nút **"Xem máy"** & **"Nhắn Zalo"** kèm lời nhắn định sẵn.
- **Trang Chi tiết Sản phẩm (Product Detail Page):**
  - **Bộ sưu tập ảnh (Image Carousel / Gallery):** Lướt xem kỹ từ 5 - 10 ảnh ngoại hình tự chụp tại shop, chế độ phóng to toàn màn hình (Fullscreen).
  - **Nút Tải ảnh về máy:** Cho phép khách hàng lưu ảnh về điện thoại/máy tính để gửi lại qua Zalo cho chủ shop.
  - **Thông số minh bạch:** Tình trạng sensor, ngoại hình %, phụ kiện đi kèm (pin, sạc, thẻ nhớ, túi, dây đeo), thời hạn bảo hành (06 tháng, 1 đổi 1 trong 7 ngày).
  - **Call-to-Action chính:** Nút bấm **"Nhắn Zalo Tư Vấn / Chốt Đơn Máy Này"** tự động dẫn tới `https://zalo.me/0986834449` với nội dung máy cần hỏi.

### 2. Trang Quản trị (Admin Portal - `/admin`)
- **Bảo mật:** Đăng nhập an toàn bằng tài khoản Quản trị & JWT Authentication.
- **Quản lý Sản phẩm (Product CRUD):** Thêm mới, chỉnh sửa thông tin, xóa sản phẩm khỏi kho.
- **Upload Đa Ảnh Kéo Thả (Cloudinary Multi-Image Upload):**
  - Hỗ trợ kéo thả trực tiếp cùng lúc **10 - 15 hình ảnh** ngoại hình máy ảnh.
  - Thanh tiến trình upload trực quan (Upload Progress Bar).
  - Xem trước danh sách thumbnail thu nhỏ, xóa bớt ảnh lỗi, hoặc thêm URL ảnh ngoài.
- **Quản lý Danh mục & Nhãn (Category CRUD):** Tạo thêm/sửa nhãn phân loại theo tầm giá, thương hiệu, loại máy.
- **Thống kê nhanh:** Tổng số máy, số máy đang có sẵn, số máy đã bán, số lượng thương hiệu.

---

## 🛠 TECH STACK & KIẾN TRÚC HỆ THỐNG

| Thành phần | Công nghệ | Nơi triển khai (Deployment) |
| :--- | :--- | :--- |
| **Frontend Client & Admin** | Next.js (App Router, TypeScript, Tailwind CSS, Lucide React) | **Vercel** (`sp.mayanhtop1.com`) |
| **Backend REST API** | Node.js + Express.js (JWT, Mongoose, Multer, Cloudinary SDK) | **Render** |
| **Cơ sở dữ liệu** | MongoDB (MongoDB Atlas Cloud Database) | MongoDB Atlas |
| **Media & Image CDN** | Cloudinary API (Upload Stream) | Cloudinary |

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
camera_store/
├── backend/                        # Node.js + Express API Backend
│   ├── config/
│   │   ├── db.js                   # Kết nối MongoDB Atlas / Local
│   │   └── cloudinary.js           # Cấu hình Cloudinary SDK
│   ├── controllers/
│   │   ├── authController.js       # Xác thực JWT & Đăng nhập Admin
│   │   ├── categoryController.js   # CRUD Danh mục & Nhãn lọc
│   │   ├── productController.js    # CRUD Sản phẩm, Tìm kiếm & Lọc
│   │   └── uploadController.js     # Upload 10-15 ảnh lên Cloudinary
│   ├── middleware/
│   │   ├── auth.js                 # JWT Bearer Token Protect Middleware
│   │   └── upload.js               # Multer Memory Storage Filter
│   ├── models/
│   │   ├── Admin.js                # Schema Tài khoản Quản trị
│   │   ├── Category.js             # Schema Nhãn lọc & Danh mục
│   │   └── Product.js              # Schema Sản phẩm Máy ảnh
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── categoryRoutes.js       # /api/categories
│   │   ├── productRoutes.js        # /api/products
│   │   └── uploadRoutes.js         # /api/upload
│   ├── public/uploads/             # Fallback lưu trữ ảnh local khi test
│   ├── .env.example                # Mẫu biến môi trường Backend
│   ├── render.yaml                 # Blueprint triển khai Render
│   ├── seed.js                     # Script nạp dữ liệu mẫu ban đầu
│   └── server.js                   # Entrypoint server Express
│
├── frontend/                       # Next.js 16 (App Router) Frontend
│   ├── app/
│   │   ├── admin/page.tsx          # Trang Quản trị (Login & Dashboard CRUD)
│   │   ├── san-pham/[slug]/        # Trang Chi tiết Máy ảnh & Image Gallery
│   │   ├── globals.css             # Tailwind CSS & Custom Scrollbar
│   │   ├── layout.tsx              # Root Layout, Navbar, Floating Zalo/Hotline
│   │   └── page.tsx                # Trang chủ trưng bày Album & Bộ lọc
│   ├── components/
│   │   ├── FilterBar.tsx           # Thanh lọc Album (Tầm giá, Hãng, Loại)
│   │   ├── FloatingContact.tsx     # Nút Hotline & Zalo nổi góc màn hình
│   │   ├── Footer.tsx              # Cam kết shop, địa chỉ Sài Gòn, hướng dẫn
│   │   ├── ImageGallery.tsx        # Trình xem 5-10 ảnh chụp thật, tải ảnh, zoom
│   │   ├── Navbar.tsx              # Thanh điều hướng, Tìm kiếm, Hotline
│   │   ├── ProductCard.tsx         # Card Album máy ảnh tối giản
│   │   └── ProductGrid.tsx         # Lưới hiển thị Responsive Mobile-first
│   ├── lib/
│   │   ├── api.ts                  # Gọi REST API Backend & Fallback dự phòng
│   │   └── mockData.ts             # Dữ liệu dự phòng chuẩn bị sẵn
│   ├── .env.example                # Mẫu biến môi trường Frontend
│   ├── next.config.ts              # Cấu hình Next.js & Image Remote Domains
│   └── vercel.json                 # Cấu hình triển khai Vercel
│
└── package.json                    # Root scripts quản lý cả 2 project
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN DƯỚI LOCAL

### Bước 1: Cài đặt dependencies cho cả Backend & Frontend
Mở terminal tại thư mục gốc của dự án:
```bash
# Cài đặt cho Backend
cd backend
npm install

# Cài đặt cho Frontend
cd ../frontend
npm install
```

### Bước 2: Thiết lập biến môi trường (.env)

#### 1. Cấu hình Backend (`backend/.env`):
Tạo file `backend/.env` (tham khảo `backend/.env.example`):
```env
PORT=5001
NODE_ENV=development

# Chuỗi kết nối MongoDB Atlas (hoặc MongoDB Local)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/mayanhtop1?retryWrites=true&w=majority

# Chuỗi bảo mật JWT
JWT_SECRET=mayanhtop1_secure_jwt_secret_key_2026_super_strong

# Thông tin tài khoản Cloudinary (để upload ảnh tự chụp)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Tài khoản Admin mặc định
ADMIN_USERNAME=admin
ADMIN_PASSWORD=mayanhtop1@2026

# URL Client
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5001
```

#### 2. Cấu hình Frontend (`frontend/.env.local`):
Tạo file `frontend/.env.local` (tham khảo `frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_HOTLINE=0986834449
NEXT_PUBLIC_ZALO_URL=https://zalo.me/0986834449
NEXT_PUBLIC_SHOP_NAME="MÁY ẢNH TOP 1"
NEXT_PUBLIC_SHOP_TAGLINE="Chuyên máy ảnh cũ Sài Gòn"
```

### Bước 3: Nạp dữ liệu mẫu ban đầu (Seed Database)
Chạy lệnh sau để tự động tạo tài khoản admin và 12 sản phẩm máy ảnh mẫu tuyệt đẹp (Sony A6000, Fuji X-T20, Canon 60D, Ricoh GR III...):
```bash
cd backend
npm run seed
```

### Bước 4: Khởi chạy dự án
Chạy Backend (Port 5001):
```bash
cd backend
npm run dev
# Server lắng nghe tại: http://localhost:5001
# API Health check: http://localhost:5001/api/health
```

Chạy Frontend (Port 3000):
```bash
cd frontend
npm run dev
# Website mở tại: http://localhost:3000
# Trang Quản trị: http://localhost:3000/admin
```

---

## 🔑 TÀI KHOẢN ĐĂNG NHẬP ADMIN

Truy cập đường dẫn: `http://localhost:3000/admin` (hoặc `https://sp.mayanhtop1.com/admin`)
- **Tên đăng nhập:** `admin`
- **Mật khẩu:** `mayanhtop1@2026`

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI PRODUCTION (DEPLOYMENT)

### 1. Triển khai Backend API lên Render
1. Đăng ký/Đăng nhập tại [Render.com](https://render.com).
2. Tạo một **Web Service** mới, liên kết với repository chứa thư mục `/backend`.
3. Cài đặt các thông số:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Trong mục **Environment Variables**, điền các biến từ `backend/.env.example`:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas của bạn.
   - `JWT_SECRET`: Chuỗi khóa bảo mật ngẫu nhiên.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - `FRONTEND_URL`: `https://sp.mayanhtop1.com` (hoặc URL Vercel).
5. Bấm **Deploy**. Sau khi xong, bạn sẽ có URL API dạng: `https://mayanhtop1-backend.onrender.com`.

### 2. Triển khai Frontend lên Vercel
1. Đăng ký/Đăng nhập tại [Vercel.com](https://vercel.com).
2. Tạo **New Project**, chọn repository của bạn.
3. Cài đặt các thông số:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
4. Cấu hình **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://mayanhtop1-backend.onrender.com/api` (URL Render vừa tạo ở trên).
   - `NEXT_PUBLIC_HOTLINE`: `0986834449`
   - `NEXT_PUBLIC_ZALO_URL`: `https://zalo.me/0986834449`
5. Bấm **Deploy**.
6. Trong mục **Settings > Domains**, trỏ tên miền phụ `sp.mayanhtop1.com` về CNAME của Vercel (`cname.vercel-dns.com`).

---

## 📞 THÔNG TIN HỖ TRỢ KỸ THUẬT & LIÊN HỆ CỬA HÀNG

- **Cửa hàng:** MÁY ẢNH TOP 1 - Chuyên máy ảnh cũ Sài Gòn
- **Hotline:** 0986.834.449
- **Zalo:** [zalo.me/0986834449](https://zalo.me/0986834449)
- **Tên miền phụ hệ thống:** `sp.mayanhtop1.com`
