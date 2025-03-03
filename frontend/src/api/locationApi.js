// // src/api/locationApi.js
// import axios from "axios";

// const API_URL = "http://localhost:3000/locations";

// export const fetchLocations = async () => {
//   const response = await axios.get(API_URL);
//   return response.data;
// };

import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/locations";

export const fetchLocations = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Hàm tìm đường đi giữa hai địa điểm
export const findPath = async (from, to) => {
  try {
    const response = await axios.get(`${API_URL}/path/find`, {
      params: { from, to }
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tìm đường đi:", error);
    throw error;
  }
};

// Hàm thêm kết nối giữa hai địa điểm
export const addConnection = async (from, to) => {
  try {
    const response = await axios.post(`${API_URL}/connection/add`, { from, to });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm kết nối:", error);
    throw error;
  }
};

// Hàm xóa kết nối giữa hai địa điểm
export const removeConnection = async (from, to) => {
  try {
    const response = await axios.post(`${API_URL}/connection/remove`, { from, to });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa kết nối:", error);
    throw error;
  }
};

// Hàm lấy các địa điểm theo tầng và danh mục
export const getFilteredLocations = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa điểm:", error);
    throw error;
  }
};
