import React, { useState, useEffect } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "../css/MapPage.css";

const map_api_key = "79bb29c4-85b6-4f7e-9347-017d762bf8ef";

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

  const [searchQuery, setSearchQuery] = useState(""); 
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (confirmedAddress) {
      const confirmedCafe = cafes.find((cafe) => cafe.address === confirmedAddress);
      if (confirmedCafe) {
        setSelectedCafe(confirmedCafe);
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
          const coordinates = firstGeoObject.geometry.getCoordinates();
          newPoints.push({ ...cafe, coordinates });
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



  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const ymaps = window.ymaps;
      const suggest = new ymaps.suggest(query);
      suggest.search().then((res) => {
        const results = res.result.map((item) => ({
          address: item.displayName,
          coordinates: item.geometry.getCoordinates(),
        }));
        setSearchResults(results);
      });
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchResultClick = (result) => {
    setSearchQuery(result.address);
    setSearchResults([]);
    setConfirmedAddress(result.address);

    // Устанавливаем маркер на выбранный адрес
    setPoints([{ address: result.address, coordinates: result.coordinates }]);
  };


  return (
    <div className="map-overlay">
      <div className="map-fullscreen">
        <YMaps query={{ apikey: map_api_key, load: "geocode", lang: "ru_RU" }}>
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
                properties={{ balloonContent: cafe.name }}
                modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
                options={{
                  preset: confirmedAddress === cafe.address ? "islands#orangeIcon" : "islands#greyIcon",
                }}
                onClick={() => handlePlacemarkClick(cafe)}
              />
            ))}
          </Map>
        </YMaps>
        <button className="close-map-button" onClick={onClose}>
          X
        </button>
      </div>


      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Введите адрес"
        />
        {searchQuery && (
          <div className="search-results">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => handleSearchResultClick(result)}
              >
                {result.address}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalVisible && confirmCafe && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Вы уверены, что хотите выбрать этот адрес?</h3>
            <p>{confirmCafe.address}</p>
            <div className="modal-buttons">
              <button className="confirm-button" onClick={handleConfirm}>Подтвердить</button>
              <button className="cancel-button" onClick={handleCancel}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;
