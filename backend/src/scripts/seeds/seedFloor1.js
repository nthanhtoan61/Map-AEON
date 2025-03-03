import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Location from '../../models/Location.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: new URL('../../../.env', import.meta.url) });

const API_URL = 'http://localhost:5000/api/locations';

// Hàm tính khoảng cách và thời gian di chuyển giữa hai điểm
function calculateTravelInfo(from, to, isMainPath = false) {
  const distance = Math.sqrt(
    Math.pow(to.position.x - from.position.x, 2) + 
    Math.pow(to.position.y - from.position.y, 2)
  );
  
  // Tốc độ di chuyển khác nhau cho đường chính và phụ
  const speed = isMainPath ? 1.8 : 1.4;
  const travelTime = Math.round(distance / speed);
  
  return {
    distance: Math.round(distance * 10) / 10,
    travelTime
  };
}

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
    position: { x: 475, y: 400 },
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
  },
  // Thêm các điểm đường chính
  {
    name: 'Đường chính 1',
    description: 'Điểm đường chính gần FAMASA',
    type: 'mainPath',
    category: 'service',
    position: { x: 150, y: 310 },
    floor: 1,
    shopNumber: 'MP-1',
    isActive: true
  },
  {
    name: 'Đường chính 2',
    description: 'Điểm đường chính gần CRCS',
    type: 'mainPath',
    category: 'service',
    position: { x: 300, y: 310 },
    floor: 1,
    shopNumber: 'MP-2',
    isActive: true
  },
  {
    name: 'Đường chính 3',
    description: 'Điểm đường chính gần PUMA',
    type: 'mainPath',
    category: 'service',
    position: { x: 450, y: 310 },
    floor: 1,
    shopNumber: 'MP-3',
    isActive: true
  },
  {
    name: 'Đường chính 4',
    description: 'Điểm đường chính gần COUPLE TX',
    type: 'mainPath',
    category: 'service',
    position: { x: 600, y: 310 },
    floor: 1,
    shopNumber: 'MP-4',
    isActive: true
  },
  {
    name: 'Đường chính 5',
    description: 'Điểm đường chính gần NIKE',
    type: 'mainPath',
    category: 'service',
    position: { x: 750, y: 310 },
    floor: 1,
    shopNumber: 'MP-5',
    isActive: true
  },
  // Thêm 3 điểm đường chính mới
  {
    name: 'Đường chính 6',
    description: 'Điểm đường chính phía Nam NIKE',
    type: 'mainPath',
    category: 'service',
    position: { x: 750, y: 420 },
    floor: 1,
    shopNumber: 'MP-6',
    isActive: true
  },
  {
    name: 'Đường chính 7',
    description: 'Điểm đường chính gần KPUB',
    type: 'mainPath',
    category: 'service',
    position: { x: 940, y: 470 },
    floor: 1,
    shopNumber: 'MP-7',
    isActive: true
  },
];

// Cập nhật locationConnections với thông tin di chuyển
const locationConnections = [
  // 1. Kết nối đường chính chính (trục ngang)
  { from: 'MP-1', to: ['MP-2'], isMainPath: true },
  { from: 'MP-2', to: ['MP-1', 'MP-3'], isMainPath: true },
  { from: 'MP-3', to: ['MP-2', 'MP-4'], isMainPath: true },
  { from: 'MP-4', to: ['MP-3', 'MP-5'], isMainPath: true },
  { from: 'MP-5', to: ['MP-4', 'MP-6'], isMainPath: true },
  
  // 2. Kết nối đường chính phụ (trục dọc)
  { from: 'MP-6', to: ['MP-5', 'MP-7'], isMainPath: true },
  { from: 'MP-7', to: ['MP-6'], isMainPath: true },

  // 3. Kết nối cửa hàng với điểm đường chính gần nhất
  // Khu vực bên trái
  { from: 'PARK-01', to: ['MP-1'] },
  { from: '1F-01', to: ['MP-1'] }, // MUJI
  { from: '1F-04', to: ['MP-1'] }, // FAHASA
  
  // Khu vực giữa
  { from: '1F-02', to: ['MP-2'] }, // CROCS
  { from: '1F-07', to: ['MP-2'] }, // XStep
  { from: '1F-03', to: ['MP-3'] }, // COUPLE TX
  { from: '1F-05', to: ['MP-3'] }, // MAXX SPORT
  
  // Khu vực bên phải
  { from: '1F-06', to: ['MP-5'] }, // KPUB
  { from: '1F-08', to: ['MP-5'] }, // GONTAN
  
  // 4. Kết nối tiện ích với điểm đường chính gần nhất
  { from: 'WC-01', to: ['MP-7'] },
  { from: 'WC-02', to: ['MP-2'] },
  { from: 'WC-03', to: ['MP-4'] },
  { from: 'ELE-01', to: ['MP-6'] }
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

async function createConnections(locations) {
  console.log('Bắt đầu tạo kết nối...');
  
  // Tạo map để truy cập nhanh location bằng shopNumber
  const locationMap = new Map(
    locations.map(loc => [loc.shopNumber, loc])
  );

  for (const conn of locationConnections) {
    const fromLocation = locationMap.get(conn.from);
    
    if (!fromLocation) {
      console.error(`Không tìm thấy địa điểm gốc: ${conn.from}`);
      continue;
    }

    for (const toShopNumber of conn.to) {
      const toLocation = locationMap.get(toShopNumber);
      
      if (!toLocation) {
        console.error(`Không tìm thấy địa điểm đích: ${toShopNumber}`);
        continue;
      }

      try {
        // Tính toán thông tin di chuyển
        const travelInfo = calculateTravelInfo(fromLocation, toLocation, conn.isMainPath);

        // Tạo kết nối hai chiều
        // Từ điểm A đến điểm B
        fromLocation.connections.push({
          locationId: toLocation._id,
          travelTime: travelInfo.travelTime,
          distance: travelInfo.distance,
          isMainPathConnection: conn.isMainPath
        });

        // Từ điểm B đến điểm A
        toLocation.connections.push({
          locationId: fromLocation._id,
          travelTime: travelInfo.travelTime,
          distance: travelInfo.distance,
          isMainPathConnection: conn.isMainPath
        });

        await Promise.all([
          fromLocation.save(),
          toLocation.save()
        ]);

        console.log(`Đã tạo kết nối: ${conn.from} <-> ${toShopNumber} (${travelInfo.distance}m, ${travelInfo.travelTime}s)`);
      } catch (error) {
        console.error(`Lỗi khi tạo kết nối ${conn.from} <-> ${toShopNumber}:`, error);
      }
    }
  }
}

// Export hàm seed
export const seedFloor1 = async () => {
  let mongoConnection;
  try {
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Đã kết nối với MongoDB');

    await clearExistingData();

    console.log('\nThêm các địa điểm tầng 1...');
    const createdLocations = [];
    
    for (const locationData of aeonLocations) {
      try {
        const location = new Location({
          ...locationData,
          connections: [],
          isActive: true
        });
        await location.save();
        createdLocations.push(location);
        console.log(`Đã thêm: ${locationData.name}`);
      } catch (error) {
        console.error(`Lỗi khi thêm ${locationData.name}:`, error.message);
      }
    }

    await createConnections(createdLocations);

    console.log('\nHoàn thành thêm dữ liệu tầng 1!');
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error.message);
  } finally {
    if (mongoConnection) {
      await mongoConnection.disconnect();
      console.log('Đã đóng kết nối MongoDB');
    }
  }
};

// Chạy trực tiếp
seedFloor1().catch(console.error); 