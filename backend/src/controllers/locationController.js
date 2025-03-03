import Location from '../models/Location.js';

// Lấy tất cả các địa điểm
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm đường đi giữa hai điểm
export const findPath = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Tìm kiếm theo shopNumber thay vì _id
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

    // Thuật toán tìm đường đi ngắn nhất (BFS)
    const path = await findShortestPath(start, end);
    
    if (!path) {
      return res.status(404).json({ message: 'Không tìm thấy đường đi' });
    }
    
    res.json({ path });
  } catch (error) {
    console.error('Lỗi khi tìm đường:', error);
    res.status(500).json({ message: error.message });
  }
};

// Thuật toán BFS tìm đường đi ngắn nhất
async function findShortestPath(start, end) {
  // Nếu start và end là cùng một vị trí
  if (start.shopNumber === end.shopNumber) {
    return [start.shopNumber];
  }

  // Lấy tất cả các connections từ database
  const allLocations = await Location.find({ isActive: true });
  
  // Tạo map các connections
  const connections = {};
  allLocations.forEach(loc => {
    connections[loc.shopNumber] = [];
  });

  // Tạo map để lưu trữ shopNumber theo _id
  const locationIdToShopNumber = {};
  allLocations.forEach(loc => {
    locationIdToShopNumber[loc._id.toString()] = loc.shopNumber;
  });

  // Thêm các liên kết hai chiều
  for (const location of allLocations) {
    if (location.connections && location.connections.length > 0) {
      // Chuyển đổi ObjectId thành shopNumber
      const shopNumberConnections = location.connections.map(connId => {
        // Nếu connId là ObjectId hoặc chuỗi ObjectId
        if (typeof connId === 'object' || (typeof connId === 'string' && connId.length === 24)) {
          const connIdStr = connId.toString();
          return locationIdToShopNumber[connIdStr];
        }
        // Nếu connId đã là shopNumber
        return connId;
      }).filter(Boolean); // Lọc bỏ các giá trị undefined/null
      
      connections[location.shopNumber] = shopNumberConnections;
      
      // Thêm liên kết ngược lại
      for (const connectedShopNumber of shopNumberConnections) {
        if (connections[connectedShopNumber] && 
            !connections[connectedShopNumber].includes(location.shopNumber)) {
          connections[connectedShopNumber].push(location.shopNumber);
        }
      }
    }
  }

  // Ghi log để debug
  console.log('Connections map:', JSON.stringify(connections, null, 2));
  console.log('Start:', start.shopNumber, 'End:', end.shopNumber);

  // BFS
  const queue = [[start.shopNumber]];
  const visited = new Set([start.shopNumber]);
  
  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];
    
    if (currentNode === end.shopNumber) {
      return path;
    }
    
    for (const neighbor of connections[currentNode] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  
  return null; // Không tìm thấy đường đi
}

// Lấy các địa điểm theo tầng và danh mục
export const getFilteredLocations = async (req, res) => {
  try {
    const { floor, category, search } = req.query;
    let query = { isActive: true };

    // Lọc theo tầng
    if (floor) {
      query.floor = parseInt(floor);
    }

    // Lọc theo danh mục
    if (category && category !== 'all') {
      query.category = category;
    }

    // Tìm kiếm theo từ khóa
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