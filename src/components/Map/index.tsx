"use client"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect } from "react"

// Fix for default Leaflet icons
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function LocationMarker({ setCoords }: { setCoords: (coords: [number, number]) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null)

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng)
            setCoords([e.latlng.lat, e.latlng.lng])
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : <Marker position={position} icon={icon} />
}

export default function Map({ center = [24.7136, 46.6753], onLocationSelect }: any) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <MapContainer
            center={center as any}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setCoords={onLocationSelect} />
        </MapContainer>
    )
}
