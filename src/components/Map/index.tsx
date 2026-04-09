"use client"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useState, useEffect } from "react"

function MapController({ coords, setCoords, interactive, zoom }: any) {
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
            <div style="background:white; padding:0.2em 0.5em; border-radius:0.25em; border:0.125em solid #2563eb; font-weight:bold; margin-bottom:0.25em; white-space:nowrap; font-size:1em; color:#000; box-shadow: 0 0.125em 0.25em rgba(0,0,0,0.2);">
                عنوان استلام الطلب
            </div>`
                    : ""
            }
            <img 
                src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png" 
                style="width:1.5625em; height:2.5625em; filter:drop-shadow(0 0.125em 0.25em rgba(0,0,0,0.4));" 
            />
        </div>`,
        className: "",
        // Leaflet expects numbers here, but these numbers represent the total
        // footprint of your HTML div in pixels relative to the font-size.
        iconSize: [100, 100], // A large enough container to prevent clipping
        iconAnchor: [50, interactive ? 90 : 45], // This is the horizontal center and vertical tip
    })

    return coords ? <Marker position={coords} icon={customDivIcon} /> : null
}

export default function Map({
    center,
    onLocationSelect,
    selectedCoords,
    interactive = true,
    zoom = 13,
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
            />
        </MapContainer>
    )
}
