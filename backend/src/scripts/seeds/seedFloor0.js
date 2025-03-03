import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Location from '../../models/Location.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: new URL('../../../.env', import.meta.url) });

const API_URL = 'http://localhost:5000/api/locations';

// Giữ nguyên hàm tính toán từ seedFloor1.js
function calculateTravelInfo(from, to, isMainPath = false) {
  const distance = Math.sqrt(
    Math.pow(to.position.x - from.position.x, 2) + 
    Math.pow(to.position.y - from.position.y, 2)
  );
  
  const speed = isMainPath ? 1.8 : 1.4;
  const travelTime = Math.round(distance / speed);
  
  return {
    distance: Math.round(distance * 10) / 10,
    travelTime
  };
}

const floor0Locations = [
  // Cửa hàng thời trang
  {
    name: 'UNIQLO',
    description: 'Cửa hàng thời trang Nhật Bản UNIQLO',
    type: 'shop',
    category: 'fashion',
    position: { x: 150, y: 400 },
    floor: 0,
    shopNumber: 'GF-01',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/uniqlo.jpg'
  },
  {
    name: 'CAFE MÈO',
    description: 'Quán cafe với không gian thú cưng',
    type: 'restaurant',
    category: 'food',
    position: { x: 250, y: 400 },
    floor: 0,
    shopNumber: 'GF-02',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/cafe-meo.jpg'
  },
  {
    name: 'PEDRO',
    description: 'Cửa hàng giày dép và phụ kiện PEDRO',
    type: 'shop',
    category: 'fashion',
    position: { x: 350, y: 400 },
    floor: 0,
    shopNumber: 'GF-03',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/pedro.jpg'
  },
  {
    name: 'MANGO',
    description: 'Thời trang nữ MANGO',
    type: 'shop',
    category: 'fashion',
    position: { x: 450, y: 400 },
    floor: 0,
    shopNumber: 'GF-04',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/mango.jpg'
  },
  {
    name: 'H&M',
    description: 'Cửa hàng thời trang H&M',
    type: 'shop',
    category: 'fashion',
    position: { x: 550, y: 400 },
    floor: 0,
    shopNumber: 'GF-05',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/h&m.jpg'
  },
  // Khu vực bên phải
  {
    name: 'QB HOUSE',
    description: 'Salon tóc QB HOUSE',
    type: 'service',
    category: 'service',
    position: { x: 750, y: 300 },
    floor: 0,
    shopNumber: 'GF-06',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/shops/qb-house.jpg'
  },
  {
    name: 'GARDEN TERRACE',
    description: 'Khu vực nghỉ ngơi ngoài trời',
    type: 'service',
    category: 'service',
    position: { x: 900, y: 350 },
    floor: 0,
    shopNumber: 'GF-07',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/facilities/garden.jpg'
  },
  // Thang máy
  {
    name: 'Thang máy',
    description: 'Thang máy chính',
    type: 'elevator',
    category: 'service',
    position: { x: 777, y: 640 },
    floor: 0,
    shopNumber: 'ELE-01-GF',
    openTime: '10:00',
    closeTime: '22:00',
    imageUrl: '/images/facilities/elevator.jpg'
  },
  // Điểm đường chính
  {
    name: 'Đường chính 1',
    description: 'Điểm đường chính gần UNIQLO',
    type: 'mainPath',
    category: 'service',
    position: { x: 150, y: 310 },
    floor: 0,
    shopNumber: 'MP-1-GF',
    isActive: true
  },
  {
    name: 'Đường chính 2',
    description: 'Điểm đường chính gần CAFE MÈO',
    type: 'mainPath',
    category: 'service',
    position: { x: 250, y: 310 },
    floor: 0,
    shopNumber: 'MP-2-GF',
    isActive: true
  },
  {
    name: 'Đường chính 3',
    description: 'Điểm đường chính gần PEDRO',
    type: 'mainPath',
    category: 'service',
    position: { x: 350, y: 310 },
    floor: 0,
    shopNumber: 'MP-3-GF',
    isActive: true
  },
  {
    name: 'Đường chính 4',
    description: 'Điểm đường chính gần MANGO',
    type: 'mainPath',
    category: 'service',
    position: { x: 450, y: 310 },
    floor: 0,
    shopNumber: 'MP-4-GF',
    isActive: true
  },
  {
    name: 'Đường chính 5',
    description: 'Điểm đường chính gần H&M',
    type: 'mainPath',
    category: 'service',
    position: { x: 550, y: 310 },
    floor: 0,
    shopNumber: 'MP-5-GF',
    isActive: true
  }
];

const floor0Connections = [
  // Kết nối đường chính (trục ngang)
  { from: 'MP-1-GF', to: ['MP-2-GF'], isMainPath: true },
  { from: 'MP-2-GF', to: ['MP-1-GF', 'MP-3-GF'], isMainPath: true },
  { from: 'MP-3-GF', to: ['MP-2-GF', 'MP-4-GF'], isMainPath: true },
  { from: 'MP-4-GF', to: ['MP-3-GF', 'MP-5-GF'], isMainPath: true },
  { from: 'MP-5-GF', to: ['MP-4-GF'], isMainPath: true },

  // Kết nối cửa hàng với đường chính
  { from: 'GF-01', to: ['MP-1-GF'] }, // UNIQLO
  { from: 'GF-02', to: ['MP-2-GF'] }, // CAFE MÈO
  { from: 'GF-03', to: ['MP-3-GF'] }, // PEDRO
  { from: 'GF-04', to: ['MP-4-GF'] }, // MANGO
  { from: 'GF-05', to: ['MP-5-GF'] }, // H&M
  { from: 'GF-06', to: ['MP-5-GF'] }, // QB HOUSE
  { from: 'GF-07', to: ['MP-5-GF'] }, // GARDEN TERRACE

  // Kết nối thang máy
  { from: 'ELE-01-GF', to: ['MP-5-GF'] }
];

// Giữ nguyên các hàm từ seedFloor1.js
async function clearExistingData() {
  try {
    // Chỉ xóa các địa điểm của tầng 0 (giữ lại các tiện ích chung)
    const result = await Location.deleteMany({
      floor: 0,
      shopNumber: { $regex: '^GF-' } // Chỉ xóa các địa điểm có mã bắt đầu bằng GF-
    });
    console.log(`Đã xóa ${result.deletedCount} địa điểm của tầng trệt`);
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu cũ:', error);
    throw error;
  }
}


// Thay đổi phần cuối file
async function createConnections(locations) {
  console.log('Bắt đầu tạo kết nối...');
  
  const locationMap = new Map(
    locations.map(loc => [loc.shopNumber, loc])
  );

  for (const conn of floor0Connections) {
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
        const travelInfo = calculateTravelInfo(fromLocation, toLocation, conn.isMainPath);

        fromLocation.connections.push({
          locationId: toLocation._id,
          travelTime: travelInfo.travelTime,
          distance: travelInfo.distance,
          isMainPathConnection: conn.isMainPath
        });

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
export const seedFloor0 = async () => {
  let mongoConnection;
  try {
    mongoConnection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Đã kết nối với MongoDB');

    await clearExistingData();

    console.log('\nThêm các địa điểm tầng trệt...');
    const createdLocations = [];
    
    for (const locationData of floor0Locations) {
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

    console.log('\nHoàn thành thêm dữ liệu tầng trệt!');
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
seedFloor0().catch(console.error);
