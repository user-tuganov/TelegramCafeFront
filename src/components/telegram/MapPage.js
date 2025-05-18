import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import axios from 'axios';
import "../../css/MapPage.css";
import config from '../../env.json';

const map_api_key = config.REACT_MAP_API_TOKEN;
const suggest_api_key = config.REACT_SUGGEST_API_TOKEN;
const host = config.REACT_APP_HOST_URL;

async function getCafes() {
  try {
    const response = await axios.get(host + `/map/cafe-addresses`);
    return response.data || [];
  } catch (err) {
    console.error("Error fetching cafes:", err);
    return [];
  }
}

async function saveCurrentCafe(cafeId) {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    
    await axios.post(host + `/profile/set-address`, {
      userId,
      cafeId
    });
  } catch (err) {
    console.error("Error saving cafe:", err);
  }
}

async function getCurrentCafe() {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    
    const response = await axios.get(host + `/profile/get-address/${userId}`);
    return response.data || null;
  } catch (err) {
    console.error("Error fetching current cafe:", err);
    return null;
  }
}

function MapPage({ onClose }) {
  const [points, setPoints] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmCafe, setConfirmCafe] = useState(null);
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cafes, setCafes] = useState([]);
  const inputRef = useRef(null);
  const ymapsRef = useRef(null);

  // Загрузка данных о кафе и выбранном адресе
  useEffect(() => {
    const loadInitialData = async () => {
      const [cafesData, currentAddress] = await Promise.all([
        getCafes(),
        getCurrentCafe()
      ]);
      
      setCafes(cafesData);
      setConfirmedAddress(currentAddress);
    };

    loadInitialData();
  }, []);

  // Геокодирование при изменении списка кафе
  useEffect(() => {
    const geocodeAddresses = async () => {
      if (ymapsRef.current && cafes.length > 0) {
        setIsLoading(true);
        const newPoints = [];
        
        for (const [index, cafe] of cafes.entries()) {
          try {
            await new Promise(resolve => setTimeout(resolve, index * 50));
            
            const res = await ymapsRef.current.geocode(cafe.address);
            const firstGeoObject = res.geoObjects.get(0);
            
            if (firstGeoObject) {
              newPoints.push({
                ...cafe,
                coordinates: firstGeoObject.geometry.getCoordinates()
              });
            }
          } catch (error) {
            console.error(`Geocoding error for: ${cafe.address}`, error);
          }
        }
        
        setPoints(newPoints);
        setIsLoading(false);
      }
    };

    geocodeAddresses();
  }, [cafes]);

  // Обработчик загрузки карты
  const handleMapLoad = (ymaps) => {
    ymapsRef.current = ymaps;
    
    // Инициализация поиска
    if (inputRef.current) {
      const provider = {
        suggest: (request) => {
          const results = cafes
            .filter(cafe => 
              cafe.address.toLowerCase().includes(request.toLowerCase())
            )
            .map(cafe => ({
              displayName: cafe.address,
              value: cafe.address,
            }));
          
          return ymaps.vow.resolve(results);
        }
      };

      const suggestView = new ymaps.SuggestView(inputRef.current, { provider });
      suggestView.events.add("select", (e) => {
        const address = e.get("item").value;
        const cafe = cafes.find(c => c.address === address);
        if (cafe) {
          setConfirmCafe(cafe);
          setIsModalVisible(true);
        }
      });
    }
  };

  const handlePlacemarkClick = (cafe) => {
    setConfirmCafe(cafe);
    setIsModalVisible(true);
  };

  const handleConfirm = async () => {
    if (confirmCafe) {
      await saveCurrentCafe(confirmCafe.id);
      setConfirmedAddress(confirmCafe);
      setIsModalVisible(false);
      onClose();
    }
  };

  return (
    <div className="map-overlay">
      <div className="map-fullscreen">
        {isLoading && (
          <div className="loading-overlay">
            <div className="loader"></div>
          </div>
        )}

        <YMaps
          query={{
            apikey: map_api_key,
            suggest_apikey: suggest_api_key,
            load: "geocode,SuggestView",
            lang: "ru_RU"
          }}
        >
          <Map
            defaultState={{ center: [55.75, 37.57], zoom: 11 }}
            width="100%"
            height="100%"
            onLoad={handleMapLoad}
            options={{ suppressMapOpenBlock: true }}
          >
            {points.map((cafe) => (
              <Placemark
                key={cafe.id}
                geometry={cafe.coordinates}
                properties={{ balloonContent: cafe.address }}
                modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                options={{
                  preset: confirmedAddress?.id === cafe.id
                    ? "islands#orangeIcon"
                    : "islands#greyIcon"
                }}
                onClick={() => handlePlacemarkClick(cafe)}
              />
            ))}
          </Map>
        </YMaps>

        <div className="search-container">
          <input
            ref={inputRef}
            type="text"
            placeholder="Введите адрес кафе"
            disabled={isLoading}
          />
        </div>

        <button className="close-map-button" onClick={onClose}>
          ×
        </button>
      </div>

      {isModalVisible && confirmCafe && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Вы уверены, что хотите выбрать этот адрес?</h3>
            <p>{confirmCafe.address}</p>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                Подтвердить
              </button>
              <button 
                className="cancel-button" 
                onClick={() => setIsModalVisible(false)}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;