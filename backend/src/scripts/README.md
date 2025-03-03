# Hướng dẫn cài đặt và chạy project Indoor Map

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- MongoDB (v4.4 trở lên)
- npm hoặc yarn

## 1. Cài đặt dependencies

### Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các dependencies
npm install
```

### Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các dependencies
npm install
```

## 2. Cấu hình MongoDB

### Import dữ liệu mẫu

```bash
# Di chuyển vào thư mục database trong backend
cd backend/src/database

# Import collection locations
mongoimport --db indoor-map --collection locations --file locations.json --jsonArray

# Import collection categories (nếu có)
mongoimport --db indoor-map --collection categories --file categories.json --jsonArray
```

### Cấu hình môi trường

Tạo file `.env` trong thư mục backend với nội dung:

```env
MONGODB_URI=mongodb://localhost:27017/indoor-map
PORT=5000
```

## 3. Chạy project

### Chạy Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Chạy server trong môi trường development
npm run dev

# Hoặc chạy server trong môi trường production
npm start
```

Server sẽ chạy tại: http://localhost:5000

### Chạy Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Chạy ứng dụng React
npm start
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 4. Kiểm tra kết nối

### API endpoints có thể test:

- GET http://localhost:5000/api/locations - Lấy danh sách địa điểm
- GET http://localhost:5000/api/locations/search - Tìm kiếm địa điểm
- GET http://localhost:5000/api/locations/path/find - Tìm đường đi

### Các tính năng chính trên frontend:

1. Xem bản đồ tổng thể AEON Mall
2. Xem bản đồ trong nhà (Indoor Map)
3. Tìm kiếm địa điểm
4. Tìm đường đi giữa hai điểm

## 5. Xử lý lỗi thường gặp

### Lỗi kết nối MongoDB

```bash
# Kiểm tra MongoDB đã chạy chưa
mongosh

# Kiểm tra database đã được import chưa
show dbs
use indoor-map
show collections
```

### Lỗi port đã được sử dụng

```bash
# Kiểm tra và kill process đang sử dụng port
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

## 6. Cấu trúc thư mục

project/

├── backend/

│ ├── src/

│ │ ├── controllers/

│ │ ├── models/

│ │ ├── routes/

│ │ ├── database/

│ │ └── scripts/

│ ├── package.json

│ └── .env

└── frontend/

├── src/

│ ├── components/

│ ├── pages/

│ └── services/

└── package.json

## 7. Scripts hữu ích

### Backend

```bash
npm run dev      # Chạy development server
npm start        # Chạy production server
npm run lint     # Kiểm tra lỗi code
```

### Frontend

```bash
npm start        # Chạy development server
npm run build    # Build production
npm run test     # Chạy tests
```

## 8. Lưu ý quan trọng

1. Đảm bảo MongoDB đã được cài đặt và chạy trước khi khởi động backend
2. Kiểm tra file .env đã được cấu hình đúng
3. Nếu thay đổi port backend, cần cập nhật lại baseURL trong frontend
4. Đảm bảo đã import đầy đủ dữ liệu mẫu vào database

## 9. Hỗ trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra logs trong console
2. Đọc error message
3. Kiểm tra kết nối database
4. Kiểm tra các API endpoints bằng Postman
