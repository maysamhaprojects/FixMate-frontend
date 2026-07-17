/**
 * ============================================================
 *  FixMate — מפת אזורי השירות
 *  מפה חינמית (OpenStreetMap דרך Leaflet) עם סימון לכל עיר
 *  שבעל המקצוע נותן בה שירות. אין צורך במפתח API או בכרטיס אשראי.
 *
 *  props:
 *    areas  — מערך של { en, he } (הערים)
 *    isHe   — האם הממשק בעברית (לבחירת שם התווית)
 * ============================================================
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { coordsFor, ISRAEL_CENTER } from "../data/cityCoords";

/* סיכה כחולה בעיצוב FixMate — divIcon כדי לא להיות תלויים בתמונות של Leaflet */
const pinIcon = L.divIcon({
  className: "fm-map-pin",
  html: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#2563EB" stroke="#FFF" stroke-width="1.5">
           <path d="M12 22s8-6 8-13a8 8 0 0 0-16 0c0 7 8 13 8 13z"/>
           <circle cx="12" cy="9" r="3" fill="#FFF"/>
         </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],   // קצה הסיכה מצביע על הנקודה
  popupAnchor: [0, -28],
});

export default function ServiceMap({ areas, isHe }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // יוצרים את המפה פעם אחת
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: ISRAEL_CENTER,
        zoom: 7,
        scrollWheelZoom: false,   // לא "בולעים" את הגלילה של הדף
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // מסירים סימונים קודמים לפני שמציירים מחדש
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // סימון לכל עיר שיש לה קואורדינטות
    const points = [];
    (areas || []).forEach((area) => {
      const coords = coordsFor(area.en) || coordsFor(area.he);
      if (!coords) return;
      points.push(coords);
      L.marker(coords, { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<b>${isHe ? area.he : area.en}</b>`);
    });

    // ממקדים את המפה על הסימונים (או על ישראל אם אין)
    if (points.length === 1) {
      map.setView(points[0], 11);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 12 });
    } else {
      map.setView(ISRAEL_CENTER, 7);
    }

    // Leaflet לפעמים צריך "בעיטה" לחשב מחדש את הגודל אחרי רינדור
    setTimeout(() => map.invalidateSize(), 100);
  }, [areas, isHe]);

  // ניקוי בעת הסרת הרכיב
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="pp-map-real" />;
}
