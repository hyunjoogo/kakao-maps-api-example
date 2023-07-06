import React, { useEffect, useState } from 'react';

const {kakao} = window;

const initial = {center: {lat: 37.394912, lng: 127.111202}};

function App() {
  const [map, setMap] = useState(null);
  const [pointObj, setPointObj] = useState({
    startPoint: {marker: null, lat: null, lng: null},
    endPoint: {marker: null, lat: null, lng: null}
  });

  useEffect(() => {
    const mapContainer = document.getElementById('map');
    const mapOptions = {
      center: new kakao.maps.LatLng(initial.center.lat, initial.center.lng), //지도의 중심좌표.
      level: 3 //지도의 레벨(확대, 축소 정도)
    };

    const kakaoMap = new kakao.maps.Map(mapContainer, mapOptions);
    setMap(kakaoMap);
  }, []);

  useEffect(() => {
    for (const point in pointObj) {
      if (pointObj[point].marker) {
        pointObj[point].marker.setMap(map);
      }
    }
  }, [pointObj]);

  async function getCarDirection() {
    const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';
    const origin = `${pointObj.startPoint.lng},${pointObj.startPoint.lat}`;
    const destination = `${pointObj.endPoint.lng},${pointObj.endPoint.lat}`;

    const headers = {
      Authorization: `KakaoAK ${REST_API_KEY}`,
      'Content-Type': 'application/json'
    };

    const queryParams = new URLSearchParams({
      origin: origin,
      destination: destination
    });

    const requestUrl = `${url}?${queryParams}`;

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const linePath = [];
      data.routes[0].sections[0].roads.forEach(router => {
        router.vertexes.forEach((vertex, index) => {
          if (index % 2 === 0) {
            linePath.push(new kakao.maps.LatLng(router.vertexes[index + 1], router.vertexes[index]));
          }
        });
      });
      var polyline = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#000000',
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
      });

      polyline.setMap(map);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  function setCenter({lat, lng}) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    map.panTo(moveLatLon);
  }

  const setPoint = ({lat, lng}, pointType) => {
    setCenter({lat, lng});
    let marker = new kakao.maps.Marker({position: new kakao.maps.LatLng(lat, lng)});
    setPointObj(prev => {
      if (pointObj[pointType].marker !== null) {
        prev[pointType].marker.setMap(null);
      }
      return {...prev, [pointType]: {marker, lat, lng}};
    });
  };


  return (
    <>
      <div id="map" style={{width: "900px", height: "900px"}}>
      </div>
      <div style={{display: "flex", gap: "10px"}}>
        <button onClick={() => setPoint({lat: 33.452613, lng: 126.570888}, 'startPoint')}>
          출발지1 지정
        </button>
        <button onClick={() => setPoint({lat: 33.45058, lng: 126.574942}, 'endPoint')}>
          목적지1 설정
        </button>
        <button onClick={() => getCarDirection()}>
          경로 구하기
        </button>
      </div>
    </>
  );
}

export default App;

