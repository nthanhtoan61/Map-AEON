import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/Location.js';

// Đọc biến môi trường
dotenv.config();

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối đến MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Hàm thêm kết nối
async function addConnection(fromShopNumber, toShopNumber) {
  try {
    console.log(`Đang thêm kết nối giữa ${fromShopNumber} và ${toShopNumber}...`);
    
    // Tìm kiếm các địa điểm theo shopNumber
    const [fromLocation, toLocation] = await Promise.all([
      Location.findOne({ shopNumber: fromShopNumber }),
      Location.findOne({ shopNumber: toShopNumber })
    ]);
    
    if (!fromLocation || !toLocation) {
      console.error(`Không tìm thấy địa điểm: ${!fromLocation ? fromShopNumber : ''} ${!toLocation ? toShopNumber : ''}`);
      return false;
    }
    
    console.log(`Đã tìm thấy địa điểm:`);
    console.log(`- ${fromLocation.name} (${fromLocation.shopNumber})`);
    console.log(`- ${toLocation.name} (${toLocation.shopNumber})`);
    
    // Kiểm tra xem kết nối đã tồn tại chưa
    const fromConnections = fromLocation.connections || [];
    const toConnections = toLocation.connections || [];
    
    const toIdStr = toLocation._id.toString();
    const fromIdStr = fromLocation._id.toString();
    
    // Thêm kết nối hai chiều nếu chưa tồn tại
    let updated = false;
    
    if (!fromConnections.some(conn => conn.toString() === toIdStr)) {
      fromConnections.push(toLocation._id);
      fromLocation.connections = fromConnections;
      await fromLocation.save();
      updated = true;
      console.log(`Đã thêm kết nối: ${fromShopNumber} -> ${toShopNumber}`);
    } else {
      console.log(`Kết nối đã tồn tại: ${fromShopNumber} -> ${toShopNumber}`);
    }
    
    if (!toConnections.some(conn => conn.toString() === fromIdStr)) {
      toConnections.push(fromLocation._id);
      toLocation.connections = toConnections;
      await toLocation.save();
      updated = true;
      console.log(`Đã thêm kết nối: ${toShopNumber} -> ${fromShopNumber}`);
    } else {
      console.log(`Kết nối đã tồn tại: ${toShopNumber} -> ${fromShopNumber}`);
    }
    
    if (updated) {
      console.log(`Đã thêm kết nối thành công giữa ${fromShopNumber} và ${toShopNumber}`);
    } else {
      console.log(`Kết nối đã tồn tại giữa ${fromShopNumber} và ${toShopNumber}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Lỗi khi thêm kết nối ${fromShopNumber} <-> ${toShopNumber}:`, error);
    return false;
  }
}

// Thêm kết nối giữa 1F-02 và 1F-03
async function main() {
  try {
    await addConnection('1F-02', '1F-03');
    console.log('\nHoàn thành!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Chạy script
main(); 