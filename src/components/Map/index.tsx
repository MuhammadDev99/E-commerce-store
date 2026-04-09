"use client"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect } from "react"

function MapController({
    coords,
    setCoords,
}: {
    coords: [number, number] | null
    setCoords: (coords: [number, number]) => void
}) {
    const map = useMap()

    // Function to jump to user's current GPS location
    const handleLocate = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        map.locate().on("locationfound", (e) => {
            const newCoords: [number, number] = [e.latlng.lat, e.latlng.lng]
            setCoords(newCoords)
            map.flyTo(newCoords, 18, { animate: true })
        })
    }

    useEffect(() => {
        if (coords) {
            // Zoom 18 is perfect for seeing individual houses
            map.flyTo(coords, 18, { animate: true })
        }
    }, [coords, map])

    useMapEvents({
        click(e) {
            setCoords([e.latlng.lat, e.latlng.lng])
        },
    })

    const customDivIcon = L.divIcon({
        html: `
        <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
            <div style="background: white; padding: 4px 10px; border-radius: 8px; border: 2px solid #2563eb; font-weight: bold; margin-bottom: 5px; white-space: nowrap; font-size:16px; color: #000;">
                عنوان استلام الطلب
            </div>
            <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style="width: 25px; height: 41px;" />
        </div>
    `,
        className: "",
        iconSize: [120, 70],
        iconAnchor: [60, 70],
    })

    return (
        <>
            {/* "Locate Me" Button Overlay */}
            <div style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000 }}>
                <button
                    onClick={handleLocate}
                    style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                    }}
                >
                    📍 تحديد موقعي الحالي
                </button>
            </div>

            {coords !== null && <Marker position={coords} icon={customDivIcon} />}
        </>
    )
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
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            {/* Google Hybrid: Satellite + Street Names */}
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />

            <MapController coords={selectedCoords} setCoords={onLocationSelect} />
        </MapContainer>
    )
}
