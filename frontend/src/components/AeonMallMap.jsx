// src/components/MapComponent.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, ImageOverlay, useMapEvents, Polyline, useMap, CircleMarker } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaBuilding, FaMapMarkerAlt, FaInfoCircle, FaStore, FaUtensils, FaParking, FaBell, FaRestroom, FaArrowsAltV, FaClock, FaSearch, FaDirections } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import axios from 'axios';

// Cấu hình icon mặc định cho marker
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Hàm tạo icon tùy chỉnh cho từng loại địa điểm
const createCustomIcon = (IconComponent, color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: white; border-radius: 50%; padding: 5px; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; color: ${color}; font-size: 18px;">
      ${ReactDOMServer.renderToString(<IconComponent />)}
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
};

// Định nghĩa màu cho từng loại địa điểm
const typeColors = {
  shop: '#2ecc71',      // Xanh lá cho cửa hàng
  restaurant: '#e74c3c', // Đỏ cho nhà hàng
  parking: '#3498db',    // Xanh dương cho bãi đỗ xe
  elevator: '#9b59b6',   // Tím cho thang máy
  bathroom: '#f1c40f',   // Vàng cho nhà vệ sinh
  info: '#95a5a6'        // Xám cho thông tin
};

// Hàm lấy icon dựa trên loại địa điểm
const getIconForType = (type) => {
  switch (type) {
    case 'shop':
      return FaStore;
    case 'restaurant':
      return FaUtensils;
    case 'parking':
      return FaParking;
    case 'elevator':
      return FaArrowsAltV;
    case 'bathroom':
      return FaRestroom;
    case 'service':
      return FaBell;
    default:
      return FaMapMarkerAlt;
  }
};

// Component để bắt sự kiện click và hiển thị marker tạm thời
const ClickHandler = () => {
  const [tempMarker, setTempMarker] = useState(null);

  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const roundedLat = Math.round(lat);
      const roundedLng = Math.round(lng);

      console.log(`
=== Thông tin tọa độ ===
Tọa độ chính xác:
x: ${roundedLng}
y: ${roundedLat}

Copy để dùng trong code:
position: { x: ${roundedLng}, y: ${roundedLat} }
      `);

      // Tạo marker mới và xóa marker cũ
      if (tempMarker) {
        map.removeLayer(tempMarker);
      }

      // Tạo marker mới với popup
      const newMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center;">
            <h3>Thông tin tọa độ</h3>
            <p>x: ${roundedLng}, y: ${roundedLat}</p>
            <button onclick="navigator.clipboard.writeText('position: { x: ${roundedLng}, y: ${roundedLat} }')" 
              style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Copy tọa độ
            </button>
          </div>
        `)
        .openPopup();

      setTempMarker(newMarker);
    },
  });

  return null;
};

// Component để cập nhật trung tâm bản đồ
const SetViewOnLocationSelect = ({ location }) => {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.position.y, location.position.x], 0.5);
    }
  }, [location, map]);
  
  return null;
};

// Thêm state và component cho việc chọn tầng
const FloorSelector = ({ currentFloor, onFloorChange }) => {
  const floors = [
    { id: 0, name: 'Tầng trệt' },
    { id: 1, name: 'Tầng 1' },
    { id: 2, name: 'Tầng 2' },
    { id: 3, name: 'Tầng 3' }
  ];

  return (
    <div style={styles.floorSelector}>
      {floors.map((floor) => (
        <button
          key={floor.id}
          onClick={() => onFloorChange(floor.id)}
          style={{
            ...styles.floorButton,
            backgroundColor: currentFloor === floor.id ? '#3498db' : '#fff',
            color: currentFloor === floor.id ? '#fff' : '#333',
          }}
        >
          {floor.name}
        </button>
      ))}
    </div>
  );
};

const AeonMallMap = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [pathPoints, setPathPoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [travelTime, setTravelTime] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(1);

  // Thông tin AEON Mall
  const aeonMallInfo = {
    name: "AEON MALL TÂN PHÚ",
    coordinates: [10.8014965, 106.6174253],
    address: "30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú, TP.HCM",
    phone: "028 3620 2866",
    openingHours: {
      weekday: "10:00 - 22:00",
      weekend: "09:00 - 22:00"
    },
    image: "/images/aeon-mall.jpg"
  };

  const handleViewIndoorMap = () => {
    navigate('/indoor-map');
  };

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/locations');
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu địa điểm');
        }
        const data = await response.json();
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Tìm đường đi giữa hai vị trí
  const findPath = async () => {
    if (!startLocation || !endLocation) {
      alert('Vui lòng chọn điểm bắt đầu và điểm kết thúc');
      return;
    }

    try {
      setLoading(true);
      console.log(`Tìm đường từ ${startLocation.shopNumber} đến ${endLocation.shopNumber}`);
      
      const response = await axios.get(`http://localhost:5000/api/locations/path/find`, {
        params: {
          from: startLocation.shopNumber,
          to: endLocation.shopNumber
        }
      });

      console.log('Kết quả API:', response.data);

      if (response.data && response.data.path && response.data.path.length > 0) {
        // Chuyển đổi path thành tọa độ để vẽ polyline
        const pathCoordinates = response.data.path.map(location => [
          location.position.y,
          location.position.x
        ]);

        setPathPoints(pathCoordinates);
        setTravelTime({
          seconds: response.data.totalTime,
          distance: response.data.totalDistance
        });
      } else {
        alert('Không thể tìm thấy đường đi giữa hai địa điểm này');
      }
    } catch (err) {
      console.error('Lỗi khi tìm đường:', err);
      alert('Đã xảy ra lỗi khi tìm đường: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chọn vị trí bắt đầu
  const handleSelectStart = (location) => {
    setStartLocation(location);
    if (endLocation && location.shopNumber === endLocation.shopNumber) {
      setEndLocation(null);
    }
    setPathPoints([]);
  };

  // Xử lý khi chọn vị trí kết thúc
  const handleSelectEnd = (location) => {
    setEndLocation(location);
    if (startLocation && location.shopNumber === startLocation.shopNumber) {
      setStartLocation(null);
    }
    setPathPoints([]);
  };

  // Lọc địa điểm theo từ khóa tìm kiếm
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thêm component hiển thị thời gian di chuyển
  const TravelTimeInfo = () => {
    if (!travelTime) return null;

    const { seconds, distance } = travelTime;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
      <div style={styles.travelTimeContainer}>
        <div style={styles.travelTimeBox}>
          <FaClock style={styles.travelTimeIcon} />
          <div style={styles.travelTimeText}>
            <strong>Thời gian di chuyển ước tính:</strong>
            <br />
            {minutes > 0 ? `${minutes} phút ` : ''}{remainingSeconds} giây
            <br />
            <span style={{ fontSize: '13px', color: '#666' }}>
              Khoảng cách: {distance.toFixed(1)}m
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Hàm xử lý khi thay đổi tầng
  const handleFloorChange = (floorId) => {
    setCurrentFloor(floorId);
    setPathPoints([]); // Reset đường đi khi đổi tầng
    setStartLocation(null);
    setEndLocation(null);
    setTravelTime(null);
  };

  // Lọc locations theo tầng hiện tại
  const currentFloorLocations = locations.filter(
    location => location.floor === currentFloor
  );

  if (loading && locations.length === 0) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={styles.searchContainer}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <FloorSelector 
          currentFloor={currentFloor}
          onFloorChange={handleFloorChange}
        />
        
        <div style={styles.directionSelector}>
          <div style={styles.locationSelector}>
            <span style={styles.label}>Xuất phát:</span>
            <select
              value={startLocation?.shopNumber || ''}
              onChange={(e) => {
                const selected = locations.find(loc => loc.shopNumber === e.target.value);
                setStartLocation(selected || null);
                setPathPoints([]);
              }}
              style={styles.select}
            >
              <option value="">Chọn điểm xuất phát</option>
              {locations.map(location => (
                <option key={`start-${location.shopNumber}`} value={location.shopNumber}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <div style={styles.locationSelector}>
            <span style={styles.label}>Đích đến:</span>
            <select
              value={endLocation?.shopNumber || ''}
              onChange={(e) => {
                const selected = locations.find(loc => loc.shopNumber === e.target.value);
                setEndLocation(selected || null);
                setPathPoints([]);
              }}
              style={styles.select}
            >
              <option value="">Chọn điểm đích</option>
              {locations.map(location => (
                <option key={`end-${location.shopNumber}`} value={location.shopNumber}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={findPath} 
            disabled={!startLocation || !endLocation}
            style={{
              ...styles.findPathButton,
              backgroundColor: (!startLocation || !endLocation) ? '#cccccc' : '#3498db'
            }}
          >
            <FaDirections style={{ marginRight: '5px' }} /> Tìm đường
          </button>
        </div>
      </div>
      
      {searchTerm && (
        <div style={styles.searchResults}>
          {filteredLocations.length === 0 ? (
            <p>Không tìm thấy địa điểm phù hợp</p>
          ) : (
            filteredLocations.map(location => (
              <div 
                key={location.shopNumber} 
                style={styles.searchResultItem}
                onClick={() => {
                  setSelectedLocation(location);
                  setSearchTerm('');
                }}
              >
                {location.name} ({location.shopNumber})
              </div>
            ))
          )}
        </div>
      )}
      
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[400, 600]}
          zoom={0}
          style={{ height: '100%', width: '100%' }}
          crs={L.CRS.Simple}
          minZoom={-1}
          maxZoom={1}
        >
          <ImageOverlay
            url={`/images/aeon-floor-${currentFloor}.jpg`}
            bounds={[[0, 0], [800, 1200]]}
          />

          {currentFloorLocations.map((location) => {
            const IconComponent = getIconForType(location.type);
            const color = typeColors[location.type] || '#000000';
            let customIcon = createCustomIcon(IconComponent, color);
            
            // Nếu đây là điểm bắt đầu hoặc kết thúc, thay đổi icon
            if (startLocation && location.shopNumber === startLocation.shopNumber) {
              customIcon = createCustomIcon(FaMapMarkerAlt, '#27ae60');
            } else if (endLocation && location.shopNumber === endLocation.shopNumber) {
              customIcon = createCustomIcon(FaMapMarkerAlt, '#e74c3c');
            }

            return (
              <Marker
                key={location._id || location.shopNumber}
                position={[location.position.y, location.position.x]}
                icon={customIcon}
              >
                <Popup>
                  <div style={{ padding: '10px' }}>
                    <h3>{location.name}</h3>
                    <p>{location.description}</p>
                    <p>
                      <FaClock /> Giờ mở cửa: {location.openTime} - {location.closeTime}
                    </p>
                    {location.imageUrl && (
                      <img
                        src={location.imageUrl}
                        alt={location.name}
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
                      />
                    )}
                    <div style={styles.popupButtons}>
                      <button 
                        onClick={() => handleSelectStart(location)} 
                        style={{
                          ...styles.directionButton,
                          backgroundColor: '#27ae60'
                        }}
                      >
                        Đặt làm điểm xuất phát
                      </button>
                      <button 
                        onClick={() => handleSelectEnd(location)}
                        style={{
                          ...styles.directionButton,
                          backgroundColor: '#e74c3c'
                        }}
                      >
                        Đặt làm điểm đến
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {pathPoints.length > 1 && (
            <>
              <Polyline
                positions={pathPoints}
                color="#3498db"
                weight={4}
                opacity={0.8}
                dashArray="10, 10"
              />
              
              {pathPoints.map((point, index) => {
                if (index === 0 || index === pathPoints.length - 1) return null;
                
                return (
                  <CircleMarker
                    key={`waypoint-${index}`}
                    center={point}
                    radius={4}
                    color="#3498db"
                    fillColor="#ffffff"
                    fillOpacity={1}
                    weight={2}
                  >
                    <Popup>
                      <div>Điểm trung gian {index}</div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </>
          )}

          <SetViewOnLocationSelect location={selectedLocation} />
        </MapContainer>

        <TravelTimeInfo />

        <div style={styles.legend}>
          <h4>Chú thích</h4>
          <div style={styles.legendItem}>
            <div style={{...styles.legendIcon, color: typeColors.shop}}><FaStore /></div>
            <span>Cửa hàng</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendIcon, color: typeColors.restaurant}}><FaUtensils /></div>
            <span>Nhà hàng</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendIcon, color: typeColors.parking}}><FaParking /></div>
            <span>Bãi đỗ xe</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendIcon, color: typeColors.elevator}}><FaArrowsAltV /></div>
            <span>Thang máy</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{...styles.legendIcon, color: typeColors.bathroom}}><FaRestroom /></div>
            <span>Nhà vệ sinh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  instructions: {
    padding: '10px',
    marginBottom: '10px',
    background: '#f0f0f0',
    borderRadius: '4px'
  },
  mapContainer: {
    height: '700px',
    width: '100%'
  },
  customPopup: {
    minWidth: '300px'
  },
  popupContent: {
    padding: '10px'
  },
  popupTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#2c3e50',
    marginBottom: '10px'
  },
  popupInfo: {
    fontSize: '14px'
  },
  icon: {
    color: '#3498db'
  },
  popupImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    margin: '10px 0'
  },
  viewIndoorBtn: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  searchContainer: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '5px 15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '10px'
  },
  searchIcon: {
    color: '#7f8c8d',
    marginRight: '10px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '8px 0',
    fontSize: '16px'
  },
  searchResults: {
    position: 'absolute',
    top: '120px',
    left: '15px',
    right: '15px',
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    borderRadius: '4px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  searchResultItem: {
    padding: '10px 15px',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  directionSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  locationSelector: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '10px',
    marginBottom: '5px'
  },
  label: {
    marginRight: '5px',
    fontWeight: 'bold'
  },
  select: {
    padding: '8px 10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    minWidth: '200px'
  },
  findPathButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 15px',
    borderRadius: '4px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '5px'
  },
  popupButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginTop: '10px'
  },
  directionButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'opacity 0.2s',
    ':hover': {
      opacity: 0.9
    }
  },
  legend: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px'
  },
  legendIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    fontSize: '16px'
  },
  travelTimeContainer: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  },
  travelTimeBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  travelTimeIcon: {
    fontSize: '28px',
    color: '#3498db',
    marginRight: '15px',
  },
  travelTimeText: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#333',
  },
  floorSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    padding: '5px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  floorButton: {
    padding: '8px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    flex: 1,
    textAlign: 'center',
    ':hover': {
      backgroundColor: '#f0f0f0',
    },
  },
};

export default AeonMallMap;
