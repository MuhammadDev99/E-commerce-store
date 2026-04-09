"use client"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect } from "react"

// Note: If you pass raw data (selectedCoords.value) from the parent,
// you don't strictly need useSignals() inside this specific file.

function MapController({
    coords,
    setCoords,
}: {
    coords: [number, number] | null
    setCoords: (coords: [number, number]) => void
}) {
    const map = useMap()

    // Since you are passing raw data (selectedCoords.value),
    // currentPos IS simply coords.
    const currentPos = coords

    useEffect(() => {
        if (currentPos) {
            map.flyTo(currentPos, 18, { animate: true })
        }
    }, [currentPos, map])

    useMapEvents({
        click(e) {
            setCoords([e.latlng.lat, e.latlng.lng])
        },
    })

    const customDivIcon = L.divIcon({
        html: `
        <div style="display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 0.125em 0.25em rgba(0,0,0,0.5));">
            <div style="background:white; padding:0.25em 0.625em; border-radius:0.5em; border:0.125em solid #2563eb; font-weight:bold; margin-bottom:0.3125em; white-space:nowrap; font-size:1em; color:#000;">
                عنوان استلام الطلب
            </div>
            <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png" style="width:1.5625em; height:2.5625em;" />
        </div>`,
        className: "",
        iconSize: [120, 70],
        iconAnchor: [60, 115],
    })

    return currentPos ? <Marker position={currentPos} icon={customDivIcon} /> : null
}

export default function Map({ center, onLocationSelect, selectedCoords }: any) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <MapContainer
            center={center || [24.7136, 46.6753]}
            zoom={13}
            maxZoom={22}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                maxZoom={22}
                maxNativeZoom={20}
            />
            <MapController coords={selectedCoords} setCoords={onLocationSelect} />
        </MapContainer>
    )
}
