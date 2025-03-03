# Map-AEON - Ứng dụng Bản đồ AEON Mall

## Mô tả

Ứng dụng bản đồ AEON Mall giúp người dùng dễ dàng tìm kiếm và định vị các cửa hàng trong trung tâm thương mại AEON Mall.

## Yêu cầu hệ thống

- Node.js (phiên bản 14.0.0 trở lên)
- npm (Node Package Manager)
- MySQL

## Cài đặt và Chạy ứng dụng

### 1. Clone repository

```bash
git clone https://github.com/nthanhtoan61/Map-AEON
cd Map-AEON
```

### 2. Cài đặt dependencies

```bash
# Cài đặt dependencies cho cả frontend và backend
npm install
```

### 3. Thiết lập Database

```bash
# Import dữ liệu mẫu vào database
npm run seed:floor0
npm run seed:floor1
npm run seed:floor2
npm run seed:floor3
```

### 4. Chạy ứng dụng

```bash
# Chạy ứng dụng ở môi trường development
npm run dev
```

Sau khi chạy lệnh trên:

- Frontend sẽ chạy tại: http://localhost:5173
- Backend API sẽ chạy tại: http://localhost:5000

## Cấu trúc thư mục

```
Map-AEON/
├── frontend/         # Mã nguồn React frontend
├── backend/          # Mã nguồn Node.js backend
├── database/         # Scripts và migrations database
└── README.md
```

## Công nghệ sử dụng

- Frontend: React.js, Next.js
- Backend: Node.js, Express
- Database: MySQL
- UI Library: Material-UI

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ:

- Email: nthanhtoan61@gmail.com
- GitHub: https://github.com/nthanhtoan61
