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
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

async function saveCurrentCafe(cafeId) {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    const setCafeAddressDto = {
      userId,
      cafeId
    };
    const response = await axios.post(host + `/profile/set-address`, setCafeAddressDto);
    if (response.status !== 200) {
      console.log(response.status);
    }
  } catch (err) {
    console.log(err);
  }
}

async function getCurrentCafe() {
  try {
    const initData = window.Telegram.WebApp.initData;
    const params = new URLSearchParams(initData);
    const userId = JSON.parse(params.get('user')).id;
    const response = await axios.get(host + `/profile/get-address/${userId}`);
    if (response.status !== 200) {
      console.log(response.status);
    } else {
      return response.data;
    }
  } catch (err) {
    console.log(err);
  }
}

function MapPage({ onClose }) {
  const [points, setPoints] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmCafe, setConfirmCafe] = useState(null);
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const inputRef = useRef(null);
  const [coordinates, setCoordinates] = useState([55.75, 37.57]);
  const [cafes, setCafes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setCafes(await getCafes());
    };
    fetchData();
  }, [cafes]);

  useEffect(() => {
    const fetchData = async () => {
      setConfirmedAddress(await getCurrentCafe());
    };

    fetchData();
  }, [confirmedAddress]);

  const fetchCoordinates = async (ymaps) => {
    const newPoints = [];
    for (const cafe of cafes) {
      try {
        const res = await ymaps.geocode(cafe.address);
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          newPoints.push({ ...cafe, coordinates: coords });
        } else {
          console.warn(`Не удалось найти координаты для: ${cafe.address}`);
        }
      } catch (error) {
        console.error(`Ошибка при геокодировании: ${cafe.address}`, error);
      }
    }
    setPoints(newPoints);
  };

  const handleMapLoad = (ymaps) => {
    fetchCoordinates(ymaps);

    if (inputRef.current) {
      const provider = {
        suggest: function (request, options) {
          const results = cafes
            .filter(cafe =>
              cafe.address.toLowerCase().includes(request.toLowerCase())
            )
            .map(cafe => ({
              displayName: cafe.address,
              value: cafe.address,
            }));
          return ymaps.vow.resolve(results);
        },
      };

      const suggestView = new ymaps.SuggestView(inputRef.current, { provider });
      suggestView.events.add("select", (e) => {
        const address = e.get("item").value;
        const cafe = cafes.find(cafe => cafe.address === address);
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
    await saveCurrentCafe(confirmCafe.id);
    setConfirmedAddress(confirmCafe);
    setIsModalVisible(false);
    onClose();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="map-overlay">
      <div className="map-fullscreen">
        <YMaps
          query={{
            apikey: map_api_key,
            suggest_apikey: suggest_api_key,
            load: "geocode,SuggestView",
            lang: "ru_RU",
          }}
        >
          <Map
            defaultState={{ center: coordinates, zoom: 11 }}
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
                  preset:
                    confirmedAddress.id === cafe.id
                      ? "islands#orangeIcon"
                      : "islands#greyIcon",
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
          />
        </div>
        <button className="close-map-button" onClick={onClose}>
          X
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
              <button className="cancel-button" onClick={handleCancel}>
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
