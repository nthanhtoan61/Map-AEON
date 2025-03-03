import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/Location.js';

dotenv.config();

// Kết nối trực tiếp với MongoDB thay vì qua API
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối với MongoDB'))
  .catch((error) => console.error('Lỗi kết nối MongoDB:', error));

const API_URL = 'http://localhost:5000/api/locations';

const aeonLocations = [
  // Khu vực bên trái
  {
    name: 'MUJI',
    description: 'Cửa hàng đồ dùng và thời trang Nhật Bản MUJI',
    type: 'shop',
    category: 'fashion',
    position: { x: 140, y: 400 }, // Cập nhật tọa độ MUJI
    floor: 1,
    shopNumber: '1F-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/UgOeE7yr5pwHnNgGhIR1itNLVxlf7KWF6kMwiFYo.jpg'
  },
  {
    name: 'CROCS',
    description: 'Cửa hàng giày dép CROCS',
    type: 'shop',
    category: 'fashion',
    position: { x: 300, y: 400 }, // Ngay cạnh MUJI, màu tím nhạt
    floor: 1,
    shopNumber: '1F-02',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/ucGgyxgyUhyGQmAliD1XO3iMeyniBI3fxj94YXNV.jpg'
  },
  {
    name: 'COUPLE TX',
    description: 'Thời trang dành cho cặp đôi',
    type: 'shop',
    category: 'fashion',
    position: { x: 300, y: 225 },
    floor: 1,
    shopNumber: '1F-03',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/nguE1w3Q6c6CC3hMnlzTRbHC8i3se5bIZWcAWei6.jpg'
  },
  {
    name: 'FAHASA',
    description: 'Nhà sách FAHASA',
    type: 'shop',
    category: 'service',
    position: { x: 150, y: 225 }, // Cập nhật tọa độ FAHASA
    floor: 1,
    shopNumber: '1F-04',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/WmqqN9a120mhdhfdnedzn072NOYfMMIzJNr3nI1Y.jpg'
  },
  {
    name: 'MAXX SPORT',
    description: 'Cửa hàng thể thao MAXX SPORT',
    type: 'shop',
    category: 'fashion',
    position: { x: 505, y: 400 }, // Cập nhật tọa độ MAXX SPORT
    floor: 1,
    shopNumber: '1F-05',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/WjHBC8sBrMTjC80HHdH0GsZPjVYylenYdca5N5JF.jpg'
  },
  // Khu vực bên phải
  {
    name: 'KPUB',
    description: 'Nhà hàng ẩm thực Hàn Quốc',
    type: 'restaurant',
    category: 'food',
    position: { x: 900, y: 300 }, // Góc phải, khu vực màu hồng nhạt
    floor: 1,
    shopNumber: '1F-06',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/n2yjk4Yc6VG8q7romOtzSAaMQ4vYuIE9715RZnzA.jpg'
  },
  {
    name: 'XStep',
    description: 'Cửa hàng giày thể thao XStep',
    type: 'shop',
    category: 'fashion',
    position: { x: 355, y: 225 }, // Cập nhật tọa độ XStep
    floor: 1,
    shopNumber: '1F-07',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/hx6nwKteIQk7kp29pUFCiyQZyWygnIx8BUtbz1FY.jpg'
  },
  {
    name: 'GONTAN',
    description: 'Nhà hàng GONTAN',
    type: 'restaurant',
    category: 'food',
    position: { x: 830, y: 250 }, // Thêm mới GONTAN
    floor: 1,
    shopNumber: '1F-08',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/gontan.jpg'
  },
  // Tiện ích
  {
    name: 'Bãi giữ xe ô tô',
    description: 'Bãi đậu xe ô tô',
    type: 'parking',
    category: 'service',
    position: { x: 40, y: 280 }, // Thêm mới bãi giữ xe
    floor: 1,
    shopNumber: 'PARK-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/editors/5trszyW0vDDZJFzfrFgVdGLciXRFZ1G0gQ6xhsdE.jpg'
  },
  {
    name: 'Thang máy',
    description: 'Thang máy',
    type: 'elevator',
    category: 'service',
    position: { x: 777, y: 640 }, // Cập nhật tọa độ thang máy
    floor: 1,
    shopNumber: 'ELE-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/facilites/1az2koIubOPV4UyisC1qmqbmTdKEApcWVL9EcRfI.jpg'
  },
  {
    name: 'Nhà vệ sinh 1',
    description: 'Khu vực nhà vệ sinh công cộng 1',
    type: 'bathroom',
    category: 'service',
    position: { x: 900, y: 640 }, // Cập nhật tọa độ nhà vệ sinh 1
    floor: 1,
    shopNumber: 'WC-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/facilites/pOVcQAdtTOrNprJ3ehArQp5urLUtxD2kxfoA77c0.jpg'
  },
  {
    name: 'Nhà vệ sinh 2',
    description: 'Khu vực nhà vệ sinh công cộng 2',
    type: 'bathroom',
    category: 'service',
    position: { x: 300, y: 140 }, // Cập nhật tọa độ nhà vệ sinh 2
    floor: 1,
    shopNumber: 'WC-02',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/facilities/bathroom.jpg'
  },
  {
    name: 'Nhà vệ sinh 3',
    description: 'Khu vực nhà vệ sinh công cộng 3',
    type: 'bathroom',
    category: 'service',
    position: { x: 690, y: 145 }, // Cập nhật tọa độ nhà vệ sinh 3
    floor: 1,
    shopNumber: 'WC-03',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://aeonmall-review-rikkei.cdn.vccloud.vn/public/wp/16/facilites/8T0mq3WQdAPbSkWCpK4RNaJmSwOy1nefkajgFn4F.jpg'
  },
  // Khu vực thời trang và phụ kiện
  {
    name: 'Khu vực Thời trang & Phụ kiện',
    description: 'Khu vực tập trung các cửa hàng thời trang và phụ kiện',
    type: 'info',
    category: 'fashion',
    position: { x: 1030, y: 500 },
    floor: 1,
    shopNumber: 'ZONE-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8K5NZ2LtHx7JOwH3Njop0vM5lDRkcKc1ccA&s'
  }
];

// Cập nhật connections cho phù hợp với vị trí mới
const locationConnections = [
  { from: 'PARK-01', to: ['1F-01', 'WC-02'] }, // Bãi xe kết nối với MUJI và nhà vệ sinh 2
  { from: '1F-01', to: ['1F-04', 'WC-02'] }, // MUJI kết nối với FAHASA và nhà vệ sinh 2
  { from: '1F-04', to: ['1F-07', 'WC-02'] }, // FAHASA kết nối với XStep và nhà vệ sinh 2
  { from: '1F-07', to: ['1F-05', 'WC-03'] }, // XStep kết nối với MAXX SPORT và nhà vệ sinh 3
  { from: '1F-05', to: ['1F-08', 'ELE-01'] }, // MAXX SPORT kết nối với GONTAN và thang máy
  { from: '1F-08', to: ['WC-01', 'ELE-01'] }, // GONTAN kết nối với nhà vệ sinh 1 và thang máy
];

async function clearExistingData() {
  try {
    await Location.deleteMany({});
    console.log('Đã xóa dữ liệu cũ');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu cũ:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('Bắt đầu thêm dữ liệu...');

    // Xóa dữ liệu cũ trước khi thêm mới
    await clearExistingData();

    // Thêm các địa điểm trực tiếp vào MongoDB
    const locationMap = new Map();
    
    for (const locationData of aeonLocations) {
      try {
        const location = new Location(locationData);
        const savedLocation = await location.save();
        locationMap.set(locationData.shopNumber, savedLocation._id);
        console.log(`Đã thêm: ${locationData.name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm ${locationData.name}:`, error.message);
        // Tiếp tục với địa điểm tiếp theo nếu có lỗi
        continue;
      }
    }

    // Cập nhật connections
    for (const conn of locationConnections) {
      try {
        const fromId = locationMap.get(conn.from);
        if (!fromId) {
          console.error(`Không tìm thấy ID cho địa điểm ${conn.from}`);
          continue;
        }

        const toIds = conn.to
          .map(shopNumber => locationMap.get(shopNumber))
          .filter(id => id); // Lọc bỏ các ID không tồn tại

        const location = await Location.findById(fromId);
        if (!location) {
          console.error(`Không tìm thấy địa điểm với ID ${fromId}`);
          continue;
        }

        location.connections = toIds;
        await location.save();
        console.log(`Đã cập nhật connections cho: ${conn.from}`);
      } catch (error) {
        console.error(`Lỗi khi cập nhật connections cho ${conn.from}:`, error.message);
      }
    }

    console.log('Hoàn thành thêm dữ liệu!');
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error.message);
  } finally {
    // Đóng kết nối MongoDB sau khi hoàn thành
    await mongoose.connection.close();
    console.log('Đã đóng kết nối MongoDB');
  }
}

// Chạy script
seedDatabase().catch(console.error); 