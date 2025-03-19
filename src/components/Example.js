import React, { useState, useEffect, useRef } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "../css/MapPage.css";

const map_api_key = "79bb29c4-85b6-4f7e-9347-017d762bf8ef";
const suggest_api_key = "6f2ea778-ce03-4277-a7cb-c221ce62885e";

const cafes = [
  { id: 1, name: "Кафе Тверская", address: "Москва, Тверская улица, 9" },
  { id: 2, name: "Кафе Шверника", address: "Москва, Улица Шверника, 9" },
];

function Example({ onClose }) {
  const [selectedAddress, setSelectedAddress] = useState(
    localStorage.getItem("selectedCafeAddress") || ""
  );
  const [coordinates, setCoordinates] = useState([55.75, 37.57]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.ymaps && inputRef.current) {
      const provider = {
        suggest: (request) =>
          new Promise((resolve) => {
            const suggestions = cafes
              .filter((cafe) =>
                cafe.address.toLowerCase().includes(request.toLowerCase())
              )
              .map((cafe) => ({ value: cafe.address }));
            resolve(suggestions);
          }),
      };

      const suggestView = new window.ymaps.SuggestView(inputRef.current, {
        provider,
      });

      suggestView.events.add("select", (e) => {
        const address = e.get("item").value;
        setSelectedAddress(address);
        localStorage.setItem("selectedCafeAddress", address);
        window.ymaps.geocode(address).then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          if (firstGeoObject) {
            setCoordinates(firstGeoObject.geometry.getCoordinates());
          }
        });
      });
    }
  }, []);

  return (
    <div className="map-overlay">
      <div className="map-container" style={{ position: "relative" }}>
        <YMaps
          query={{
            apikey: map_api_key,
            suggest_apikey: suggest_api_key,
            load: "geocode",
            lang: "ru_RU",
          }}
        >
          <Map
            defaultState={{ center: coordinates, zoom: 11 }}
            width="100%"
            height="500px"
          >
            {selectedAddress && (
              <Placemark
                geometry={coordinates}
                properties={{ balloonContent: selectedAddress }}
              />
            )}
          </Map>
        </YMaps>
        {/* Поле ввода позиционируется поверх карты */}
        <div
          className="suggest-input-container"
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "80%",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Введите адрес кафе"
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
            }}
          />
        </div>
      </div>
      <button className="close-map-button" onClick={onClose}>
        X
      </button>
    </div>
  );
}

export default Example;
