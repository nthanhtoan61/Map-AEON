import Location from '../models/Location.js';

// Hàm tính khoảng cách giữa hai điểm
function calculateDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + 
    Math.pow(point2.y - point1.y, 2)
  );
}

// Thuật toán Dijkstra tìm đường đi ngắn nhất
async function findShortestPath(start, end) {
  try {
    // Kiểm tra nếu điểm đầu và điểm cuối giống nhau
    if (start.shopNumber === end.shopNumber) {
      return {
        path: [start],
        totalDistance: 0,
        totalTime: 0
      };
    }

    // Lấy tất cả các địa điểm active và populate connections
    const allLocations = await Location.find({ isActive: true })
      .populate({
        path: 'connections.locationId',
        select: 'shopNumber name position type category'
      });

    // Tạo map để truy cập nhanh location bằng shopNumber
    const locationMap = new Map(
      allLocations.map(loc => [loc.shopNumber, loc])
    );

    // Khởi tạo các biến cho thuật toán Dijkstra
    const distances = new Map(); // Khoảng cách ngắn nhất từ điểm bắt đầu
    const previous = new Map(); // Lưu đường đi
    const unvisited = new Set(); // Tập các điểm chưa thăm

    // Khởi tạo khoảng cách ban đầu
    allLocations.forEach(loc => {
      distances.set(loc.shopNumber, Infinity);
      unvisited.add(loc.shopNumber);
    });
    distances.set(start.shopNumber, 0);

    while (unvisited.size > 0) {
      // Tìm điểm chưa thăm có khoảng cách nhỏ nhất
      let currentShopNumber = null;
      let minDistance = Infinity;

      for (const shopNumber of unvisited) {
        const distance = distances.get(shopNumber);
        if (distance < minDistance) {
          minDistance = distance;
          currentShopNumber = shopNumber;
        }
      }

      // Nếu không tìm thấy đường đi hoặc đã đến đích
      if (currentShopNumber === null || currentShopNumber === end.shopNumber) {
        break;
      }

      // Xóa điểm hiện tại khỏi tập chưa thăm
      unvisited.delete(currentShopNumber);
      const currentLocation = locationMap.get(currentShopNumber);

      // Duyệt qua các điểm kề
      for (const connection of currentLocation.connections) {
        const neighborId = connection.locationId.shopNumber;
        
        if (!unvisited.has(neighborId)) continue;

        const neighbor = locationMap.get(neighborId);
        
        // Tính khoảng cách thực tế giữa hai điểm
        const distance = calculateDistance(
          currentLocation.position,
          neighbor.position
        );

        // Tính thời gian di chuyển (giả sử tốc độ trung bình là 1.4m/s)
        const travelTime = connection.travelTime || Math.round(distance / 1.4);
        
        // Tính tổng khoảng cách mới
        const alt = distances.get(currentShopNumber) + travelTime;

        // Nếu tìm thấy đường đi ngắn hơn
        if (alt < distances.get(neighborId)) {
          distances.set(neighborId, alt);
          previous.set(neighborId, currentShopNumber);
        }
      }
    }

    // Nếu không tìm thấy đường đi
    if (distances.get(end.shopNumber) === Infinity) {
      return null;
    }

    // Tạo đường đi từ điểm cuối về điểm đầu
    const path = [];
    let current = end.shopNumber;
    let totalDistance = 0;

    while (current !== undefined) {
      const location = locationMap.get(current);
      path.unshift(location);
      
      // Tính tổng khoảng cách thực tế
      if (previous.has(current)) {
        const prevLocation = locationMap.get(previous.get(current));
        totalDistance += calculateDistance(
          prevLocation.position,
          location.position
        );
      }
      
      current = previous.get(current);
    }

    return {
      path,
      totalDistance: Math.round(totalDistance) / 10, // Làm tròn 1 chữ số thập phân
      totalTime: distances.get(end.shopNumber)
    };
  } catch (error) {
    console.error('Lỗi trong thuật toán tìm đường:', error);
    return null;
  }
}

// Controller tìm đường
export const findPath = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Tìm điểm đầu và điểm cuối
    const [start, end] = await Promise.all([
      Location.findOne({ shopNumber: from }),
      Location.findOne({ shopNumber: to })
    ]);

    if (!start || !end) {
      return res.status(404).json({ 
        message: 'Không tìm thấy điểm đầu hoặc điểm cuối',
        details: {
          startFound: !!start,
          endFound: !!end,
          fromValue: from,
          toValue: to
        }
      });
    }

    // Tìm đường đi ngắn nhất
    const result = await findShortestPath(start, end);
    
    if (!result) {
      return res.status(404).json({ 
        message: 'Không tìm thấy đường đi',
        details: {
          from: start.name,
          to: end.name
        }
      });
    }

    // Format kết quả trả về
    const response = {
      path: result.path.map(location => ({
        shopNumber: location.shopNumber,
        name: location.name,
        type: location.type,
        category: location.category,
        position: location.position
      })),
      totalDistance: result.totalDistance,
      totalTime: result.totalTime,
      message: `Thời gian di chuyển ước tính: ${result.totalTime} giây (${result.totalDistance}m)`
    };

    res.json(response);
  } catch (error) {
    console.error('Lỗi khi tìm đường:', error);
    res.status(500).json({ 
      message: 'Lỗi khi tìm đường',
      error: error.message 
    });
  }
};

// Lấy tất cả các địa điểm
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy các địa điểm theo filter
export const getFilteredLocations = async (req, res) => {
  try {
    const { floor, category, search } = req.query;
    let query = { isActive: true };

    if (floor) {
      query.floor = parseInt(floor);
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shopNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Location.find(query);
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm kết nối giữa hai địa điểm
export const addConnection = async (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ message: 'Thiếu thông tin kết nối' });
    }
    
    // Tìm kiếm các địa điểm theo shopNumber
    const [fromLocation, toLocation] = await Promise.all([
      Location.findOne({ shopNumber: from }),
      Location.findOne({ shopNumber: to })
    ]);
    
    if (!fromLocation || !toLocation) {
      return res.status(404).json({ 
        message: 'Không tìm thấy một hoặc cả hai địa điểm',
        details: {
          fromFound: !!fromLocation,
          toFound: !!toLocation
        }
      });
    }
    
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
    }
    
    if (!toConnections.some(conn => conn.toString() === fromIdStr)) {
      toConnections.push(fromLocation._id);
      toLocation.connections = toConnections;
      await toLocation.save();
      updated = true;
    }
    
    if (updated) {
      res.json({ 
        message: 'Đã thêm kết nối thành công',
        fromLocation,
        toLocation
      });
    } else {
      res.json({ message: 'Kết nối đã tồn tại' });
    }
    
  } catch (error) {
    console.error('Lỗi khi thêm kết nối:', error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa kết nối giữa hai địa điểm
export const removeConnection = async (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ message: 'Thiếu thông tin kết nối' });
    }
    
    // Tìm kiếm các địa điểm theo shopNumber
    const [fromLocation, toLocation] = await Promise.all([
      Location.findOne({ shopNumber: from }),
      Location.findOne({ shopNumber: to })
    ]);
    
    if (!fromLocation || !toLocation) {
      return res.status(404).json({ 
        message: 'Không tìm thấy một hoặc cả hai địa điểm',
        details: {
          fromFound: !!fromLocation,
          toFound: !!toLocation
        }
      });
    }
    
    // Xóa kết nối hai chiều
    let updated = false;
    
    const toIdStr = toLocation._id.toString();
    const fromIdStr = fromLocation._id.toString();
    
    if (fromLocation.connections) {
      fromLocation.connections = fromLocation.connections.filter(
        conn => conn.toString() !== toIdStr
      );
      await fromLocation.save();
      updated = true;
    }
    
    if (toLocation.connections) {
      toLocation.connections = toLocation.connections.filter(
        conn => conn.toString() !== fromIdStr
      );
      await toLocation.save();
      updated = true;
    }
    
    if (updated) {
      res.json({ 
        message: 'Đã xóa kết nối thành công',
        fromLocation,
        toLocation
      });
    } else {
      res.json({ message: 'Kết nối không tồn tại' });
    }
    
  } catch (error) {
    console.error('Lỗi khi xóa kết nối:', error);
    res.status(500).json({ message: error.message });
  }
}; 