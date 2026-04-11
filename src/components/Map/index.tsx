"use client"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect } from "react"

type Coordinates = [number, number]

interface MapControllerProps {
    coords: Coordinates | null
    setCoords?: (coords: Coordinates) => void
    interactive: boolean
    zoom: number
    isSupported?: boolean
}

function MapController({ coords, setCoords, interactive, zoom, isSupported }: MapControllerProps) {
    const map = useMap()

    useEffect(() => {
        if (!coords) return

        if (interactive) {
            // For the main map: Move to the point but KEEP the user's current zoom
            // This prevents the "zoom back out" behavior
            map.setView(coords, map.getZoom(), { animate: true })
        } else {
            // For the mini-map: Force the specific zoom level provided in props
            map.setView(coords, zoom, { animate: false })
        }
    }, [coords, interactive, zoom, map])

    useMapEvents({
        click(e) {
            if (interactive && setCoords) {
                setCoords([e.latlng.lat, e.latlng.lng])
            }
        },
    })

    const customDivIcon = L.divIcon({
        html: `
        <div style="display:flex; flex-direction:column; align-items:center;">
            ${
                interactive
                    ? `
            <div style="
                background:white; 
                padding:0.2em 0.5em; 
                border-radius:0.5em; 
                border:0.125em solid ${isSupported ? "var(--primary-3)" : "#ff4d4f"}; 
                font-weight:bold; 
                margin-bottom:0.25em; 
                white-space:nowrap; 
                font-size:1em; 
                color:${isSupported ? "#000" : "#ff4d4f"}; 
                box-shadow: 0 0.125em 0.25em rgba(0,0,0,0.2);">
                ${isSupported ? "عنوان استلام الطلب" : "العنوان غير مدعوم"}
            </div>`
                    : ""
            }
            <img 
                src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png" 
                style="
                    width:1.5625em; 
                    height:2.5625em; 
                    filter: ${isSupported ? "none" : "hue-rotate(140deg)"}; 
                    drop-shadow(0 0.125em 0.25em rgba(0,0,0,0.4));" 
            />
        </div>`,
        className: "",
        iconSize: [100, 100],
        iconAnchor: [50, interactive ? 90 : 45],
    })

    return coords ? <Marker position={coords} icon={customDivIcon} /> : null
}

export default function Map({
    center,
    onLocationSelect,
    selectedCoords,
    interactive = true,
    zoom = 13,
    isSupported = true,
}: any) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <MapContainer
            center={selectedCoords || center || [24.7136, 46.6753]}
            zoom={zoom}
            maxZoom={22}
            zoomControl={false}
            scrollWheelZoom={interactive}
            dragging={interactive}
            touchZoom={interactive}
            doubleClickZoom={interactive}
            boxZoom={interactive}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                maxZoom={22}
                maxNativeZoom={20}
            />
            <MapController
                coords={selectedCoords}
                setCoords={onLocationSelect}
                interactive={interactive}
                zoom={zoom}
                isSupported={isSupported}
            />
        </MapContainer>
    )
}
