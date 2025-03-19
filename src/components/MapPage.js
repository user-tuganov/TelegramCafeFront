import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "../css/MapPage.css";

const map_api_key = "79bb29c4-85b6-4f7e-9347-017d762bf8ef";
const suggest_api_key = "6f2ea778-ce03-4277-a7cb-c221ce62885e";

const cafes = [
  { id: 1, address: "Москва, Тверская улица, 9" },
  { id: 2, address: "Москва, Улица Шверника, 9" },
];

function MapPage({ onClose }) {
  const [points, setPoints] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmCafe, setConfirmCafe] = useState(null);
  const [confirmedAddress, setConfirmedAddress] = useState(
    localStorage.getItem("highlightedCafeId") || null
  );
  const inputRef = useRef(null);
  const [coordinates, setCoordinates] = useState([55.75, 37.57]);

  useEffect(() => {
    if (confirmedAddress) {
      const cafe = cafes.find((cafe) => cafe.address === confirmedAddress);
      if (cafe) {
        setSelectedCafe(cafe);
      }
    }
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
    console.log("Map loaded and ymaps available");
    fetchCoordinates(ymaps);

    if (inputRef.current) {
      console.log("Initializing SuggestView");
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
          setConfirmCafe({ address });
          setIsModalVisible(true);
        }
      });
    }
  };

  const handlePlacemarkClick = (cafe) => {
    setConfirmCafe(cafe);
    setIsModalVisible(true);
  };

  const handleConfirm = () => {
    setSelectedCafe(confirmCafe);
    setConfirmedAddress(confirmCafe.address);
    localStorage.setItem("highlightedCafeId", confirmCafe.address);
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
                    confirmedAddress === cafe.address
                      ? "islands#orangeIcon"
                      : "islands#greyIcon",
                }}
                onClick={() => handlePlacemarkClick(cafe)}
              />
            ))}
          </Map>
        </YMaps>
        {/* Поле ввода адреса поверх карты */}
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
