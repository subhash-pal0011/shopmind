"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "/location.gif",
  iconSize: [50, 50],
});

const ChangeMapView = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), {
        duration: 0.9, 
      });
    }
  }, [position, map]);

  return null;
};

const MapView = ({ position, setPosition }) => {
  if (!position) {
    return (
      <div className="flex items-center text-center justify-center h-75">
        <img src="/map.gif" className="h-15" />
        <p className="font-semibold">Loading map...</p>
      </div>
    );
  }
  return (
    <MapContainer
      center={position}
      // key={position.toString()}
      zoom={13}
      scrollWheelZoom={true}
      className="h-75 md:h-150 w-full rounded-lg shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeMapView position={position} />

      <Marker
        position={position}
        icon={customIcon}
        draggable={true} // IS PROPERT SE HUM LOCATION ICON KO MAP MEA KHI BHI MOVE KRA SKTE HII.
        eventHandlers={{
          // ISSE MAP MOVE HOGA JAHA LOCATION KA ICON JAYEGA.
          dragend: (e) => {
            const marker = e.target;
            const { lat, lng } = marker.getLatLng();
            setPosition([lat, lng]);
          },
        }}
      >
        <Popup>📍 Your Current Location</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
