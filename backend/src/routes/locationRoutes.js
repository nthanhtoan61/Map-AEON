import express from 'express';
import {
  getAllLocations,
  findPath,
  getFilteredLocations,
  addConnection,
  removeConnection
} from '../controllers/locationController.js';

const router = express.Router();

// Route lấy tất cả địa điểm
router.get('/', getAllLocations);

// Route tìm đường đi
router.get('/path/find', findPath);

// Route lọc địa điểm theo tầng và danh mục
router.get('/search', getFilteredLocations);

// Route thêm kết nối giữa hai địa điểm
router.post('/connection/add', addConnection);

// Route xóa kết nối giữa hai địa điểm
router.post('/connection/remove', removeConnection);

export default router; 