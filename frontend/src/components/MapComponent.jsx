// src/components/MapComponent.jsx
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import { FaBuilding, FaMapMarkerAlt, FaInfoCircle, FaMapMarker } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import { divIcon } from 'leaflet';

const MapComponent = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Tạo custom icon sử dụng ReactIcon
  const customMarkerIcon = divIcon({
    html: renderToStaticMarkup(
      <FaMapMarker 
        style={{ 
          color: '#e74c3c', // Màu đỏ cho icon
          fontSize: '35px' 
        }} 
      />
    ),
    className: 'custom-marker-icon',
    iconSize: [35, 35],
    iconAnchor: [40, 10],
    popupAnchor: [0, -35]
  });

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
    image: "https://lh5.googleusercontent.com/p/AF1QipOGipRExPV3KpQ-kzgmJOsChGIk6pOt5ygcAEiU=w408-h306-k-no" // Thêm hình ảnh thực tế của AEON Mall
  };

  // Xử lý khi click vào "Xem bản đồ bên trong"
  const handleViewIndoorMap = () => {
    navigate('/indoor-map');
  };

  return (
    <div className="map-container" style={{ height: "1000px", width: "100%" }}>
      <MapContainer
        center={aeonMallInfo.coordinates}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={aeonMallInfo.coordinates}
          icon={customMarkerIcon} // Sử dụng custom icon
          eventHandlers={{
            click: () => setSelectedLocation(aeonMallInfo)
          }}
        >
          <Popup className="custom-popup">
            <div className="popup-content">
              <h3 className="popup-title">
                <FaBuilding className="icon" /> {aeonMallInfo.name}
              </h3>
              <div className="popup-info">
                <p>
                  <FaMapMarkerAlt className="icon" /> {aeonMallInfo.address}
                </p>
                <p>
                  <FaInfoCircle className="icon" /> Giờ mở cửa:
                  <br />
                  - Thứ 2 - Thứ 6: {aeonMallInfo.openingHours.weekday}
                  <br />
                  - Thứ 7, CN & ngày lễ: {aeonMallInfo.openingHours.weekend}
                </p>
                {aeonMallInfo.image && (
                  <img 
                    src='https://lh5.googleusercontent.com/p/AF1QipOGipRExPV3KpQ-kzgmJOsChGIk6pOt5ygcAEiU=w408-h306-k-no' 
                    alt={aeonMallInfo.name}
                    className="popup-image"
                  />
                )}
                <button 
                  className="view-indoor-btn"
                  onClick={handleViewIndoorMap}
                >
                  Xem bản đồ bên trong
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <style jsx>{`
        .map-container {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .custom-popup {
          min-width: 300px;
        }

        .popup-content {
          padding: 10px;
        }

        .popup-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .popup-info {
          font-size: 14px;
        }

        .icon {
          color: #3498db;
        }

        .popup-image {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
          margin: 10px 0;
        }

        .view-indoor-btn {
          width: 100%;
          padding: 8px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .view-indoor-btn:hover {
          background-color: #2980b9;
        }

        // Thêm style cho custom marker
        :global(.custom-marker-icon) {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
