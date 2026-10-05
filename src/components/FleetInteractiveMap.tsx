import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Vehicle } from '../types';
import { Navigation, Zap, ArrowRight, Eye, Layers, Compass, MapPin, ExternalLink } from 'lucide-react';

interface FleetInteractiveMapProps {
  vehicles: Vehicle[];
  currency: 'INR' | 'USD';
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBookVehicle: (vehicle: Vehicle) => void;
}

interface VehicleGpsLocation {
  vehicleId: string;
  cityName: 'Bangalore' | 'Mumbai' | 'Delhi' | 'Goa';
  hubName: string;
  address: string;
  lat: number;
  lng: number;
  fuelLevel: number;
  statusText: string;
  speedKmh: number;
}

// Real-world GPS coordinates for fleet hubs across India
const FLEET_GPS_LOCATIONS: Record<string, VehicleGpsLocation> = {
  'porsche-911-gt3': {
    vehicleId: 'porsche-911-gt3',
    cityName: 'Bangalore',
    hubName: 'Bangalore Int. Airport (BLR T2 VIP Curbside)',
    address: 'Terminal 2 VIP Arrival Lane, Devanahalli, Bangalore 560300',
    lat: 13.2005,
    lng: 77.7100,
    fuelLevel: 100,
    statusText: 'Parked at VIP Lane · Ready for Handover',
    speedKmh: 0
  },
  'rolls-royce-ghost': {
    vehicleId: 'rolls-royce-ghost',
    cityName: 'Mumbai',
    hubName: 'Mumbai BKC Signature Pavilion',
    address: 'Grand Pavilion Towers, Ground Floor, G-Block, BKC, Mumbai',
    lat: 19.0657,
    lng: 72.8687,
    fuelLevel: 95,
    statusText: 'White-Glove Chauffeur Standing By',
    speedKmh: 0
  },
  'bentley-continental-gt': {
    vehicleId: 'bentley-continental-gt',
    cityName: 'Bangalore',
    hubName: 'Bangalore Signature Pavilion — Indiranagar',
    address: '100ft Road VIP Pavilion, Indiranagar, Bangalore',
    lat: 12.9784,
    lng: 77.6408,
    fuelLevel: 98,
    statusText: 'Available for Immediate Dispatch',
    speedKmh: 0
  },
  'bmw-m5-competition': {
    vehicleId: 'bmw-m5-competition',
    cityName: 'Delhi',
    hubName: 'Delhi NCR VIP Hub — Aerocity',
    address: 'Worldmark 1, Hospitality District, Aerocity, New Delhi',
    lat: 28.5518,
    lng: 77.1219,
    fuelLevel: 92,
    statusText: 'Detailed & Inspected · Available Now',
    speedKmh: 0
  },
  'toyota-fortuner-legender': {
    vehicleId: 'toyota-fortuner-legender',
    cityName: 'Bangalore',
    hubName: 'Bangalore Prestige Tech Cloud Hub — Whitefield',
    address: 'Velox Private Pavilion, Prestige Tech Cloud, Bangalore',
    lat: 12.9698,
    lng: 77.7500,
    fuelLevel: 100,
    statusText: 'Ready for Hill-Station or Convoy Dispatch',
    speedKmh: 0
  },
  'mercedes-amg-a35': {
    vehicleId: 'mercedes-amg-a35',
    cityName: 'Mumbai',
    hubName: 'Mumbai Int. Airport (BOM T2 VIP Lane)',
    address: 'Terminal 2 Curbside VIP Departure/Arrival, Sahar, Mumbai',
    lat: 19.0974,
    lng: 72.8744,
    fuelLevel: 96,
    statusText: 'Curbside Valet Ready · Instant Unlock',
    speedKmh: 0
  },
  'mini-cooper-s': {
    vehicleId: 'mini-cooper-s',
    cityName: 'Goa',
    hubName: 'Goa Coastal Pavilion — MOPA & Dabolim',
    address: 'VIP Arrival Lounge, Goa International Airport',
    lat: 15.3803,
    lng: 73.8314,
    fuelLevel: 88,
    statusText: 'Coastal Tour in Progress · Reserved',
    speedKmh: 42
  }
};

// MapLibre uses [lng, lat] coordinate order
const CITY_COORDINATES: Record<string, { center: [number, number]; zoom: number }> = {
  'ALL': { center: [78.9629, 20.5937], zoom: 5 },
  'Bangalore': { center: [77.6408, 12.9784], zoom: 11.5 },
  'Mumbai': { center: [72.8687, 19.0760], zoom: 11.5 },
  'Delhi': { center: [77.1219, 28.5518], zoom: 11.5 },
  'Goa': { center: [73.8314, 15.3803], zoom: 11 }
};

export const FleetInteractiveMap: React.FC<FleetInteractiveMapProps> = ({
  vehicles,
  currency,
  onSelectVehicle,
  onBookVehicle
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>('porsche-911-gt3');
  const [mapStyleUrl, setMapStyleUrl] = useState<string>('https://tiles.openfreemap.org/styles/bright');

  const formatPrice = (priceInr: number) => {
    if (currency === 'USD') {
      const usdPrice = Math.round(priceInr / 85);
      return `$${usdPrice.toLocaleString()}`;
    }
    return `₹${priceInr.toLocaleString('en-IN')}`;
  };

  const getVehicleCode = (vehicle: Vehicle) => {
    if (vehicle.id.includes('porsche')) return 'GT3';
    if (vehicle.id.includes('rolls')) return 'RR';
    if (vehicle.id.includes('bentley')) return 'B';
    if (vehicle.id.includes('m5')) return 'M5';
    if (vehicle.id.includes('fortuner')) return '4x4';
    if (vehicle.id.includes('amg')) return 'AMG';
    return 'MINI';
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
    const gps = FLEET_GPS_LOCATIONS[v.id];
    if (selectedCity !== 'ALL' && gps?.cityName !== selectedCity) return false;
    return true;
  });

  // Initialize MapLibre GL Map with OpenFreeMap Bright style
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyleUrl,
        center: [78.9629, 20.5937],
        zoom: 5,
        attributionControl: false
      });

      // Add navigation controls (zoom & compass)
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'bottom-right');

      mapInstanceRef.current = map;
    }

    return () => {
      // Retain instance to avoid map flickering on re-render
    };
  }, []);

  // Update Map Style if changed
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setStyle(mapStyleUrl);
    }
  }, [mapStyleUrl]);

  // Update Markers & Interactions
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    filteredVehicles.forEach(vehicle => {
      const gps = FLEET_GPS_LOCATIONS[vehicle.id];
      if (!gps) return;

      const isAvailable = vehicle.available;
      const isSelected = activeVehicleId === vehicle.id;
      const priceText = formatPrice(vehicle.dailyPrice);

      // Create Custom High-Tech Map Pin element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-fleet-pin';
      markerEl.style.cursor = 'pointer';
      markerEl.innerHTML = `
        <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
          <!-- Pulsing Radar Halo -->
          <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: ${
            isAvailable ? 'rgba(94, 211, 154, 0.35)' : 'rgba(230, 106, 106, 0.35)'
          }; animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          
          <!-- Pin Center Badge -->
          <div style="position: relative; z-index: 10; width: 34px; height: 34px; border-radius: 50%; background: #0A0B0E; border: 2.5px solid ${
            isSelected ? '#C9A45C' : isAvailable ? '#5ED39A' : '#E66A6A'
          }; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${
            isSelected ? 'rgba(201,164,92,0.9)' : isAvailable ? 'rgba(94,211,154,0.7)' : 'rgba(230,106,106,0.7)'
          }; transition: transform 0.2s ease;">
            <span style="font-size: 10px; font-weight: 800; font-family: monospace; color: ${isSelected ? '#C9A45C' : '#FFFFFF'};">
              ${getVehicleCode(vehicle)}
            </span>
          </div>

          <!-- Price Tag Badge -->
          <div style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); background: #000000; border: 1px solid rgba(201, 164, 92, 0.4); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-family: monospace; font-weight: bold; color: #C9A45C; white-space: nowrap; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.8);">
            ${priceText}
          </div>
        </div>
      `;

      // Popup Content DOM
      const popupEl = document.createElement('div');
      popupEl.innerHTML = `
        <div style="background: #0E0F14; color: #FFFFFF; border: 1px solid rgba(201,164,92,0.45); border-radius: 14px; overflow: hidden; font-family: system-ui, -apple-system, sans-serif; min-width: 250px; box-shadow: 0 15px 35px rgba(0,0,0,0.85);">
          <div style="height: 115px; position: relative; overflow: hidden; background: #050505;">
            <img src="${vehicle.imageUrl || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
            <div style="position: absolute; bottom: 6px; left: 8px; background: rgba(0,0,0,0.75); padding: 2px 7px; border-radius: 4px; font-size: 10px; color: ${
              isAvailable ? '#5ED39A' : '#E66A6A'
            }; font-family: monospace; font-weight: bold;">
              ${isAvailable ? '● Ready for Handover' : '● Reserved'}
            </div>
          </div>
          <div style="padding: 10px 14px 12px 14px;">
            <div style="font-size: 14px; font-weight: bold; color: #FFFFFF; margin-bottom: 2px;">${vehicle.name}</div>
            <div style="font-size: 11px; color: #C9A45C; margin-bottom: 6px; font-family: monospace;">${vehicle.horsepower} HP · ${vehicle.fuel}</div>
            <div style="font-size: 11px; color: #888888; margin-bottom: 10px; line-height: 1.3;">📍 ${gps.hubName}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
              <div style="font-size: 14px; font-weight: bold; color: #FFFFFF; font-family: monospace;">${priceText}<span style="font-size: 10px; color: #777;">/day</span></div>
              <button id="maplibre-book-${vehicle.id}" style="background: #C9A45C; color: #050505; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                BOOK NOW
              </button>
            </div>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 24, closeButton: false })
        .setDOMContent(popupEl);

      const marker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
        .setLngLat([gps.lng, gps.lat])
        .setPopup(popup)
        .addTo(map);

      markerEl.addEventListener('click', () => {
        setActiveVehicleId(vehicle.id);
        setTimeout(() => {
          const btn = document.getElementById(`maplibre-book-${vehicle.id}`);
          if (btn) {
            btn.onclick = () => onBookVehicle(vehicle);
          }
        }, 50);
      });

      markersRef.current.push(marker);
    });

    // Fly to city center if selected
    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      const { center, zoom } = CITY_COORDINATES[selectedCity];
      map.flyTo({
        center,
        zoom,
        speed: 1.2,
        essential: true
      });
    }
  }, [selectedCity, selectedCategory, filteredVehicles.length, activeVehicleId, currency]);

  // Active highlighted vehicle
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
  const activeGps = activeVehicle ? FLEET_GPS_LOCATIONS[activeVehicle.id] : null;

  return (
    <div className="relative w-full bg-[#0A0B0E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col mb-12">
      {/* Top Map Toolbar: City Selector, MapLibre Engine Badge, and Telemetry Status */}
      <div className="p-4 md:p-6 bg-[#0E0F14]/90 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#C9A45C]/15 border border-[#C9A45C]/40 text-[#C9A45C]">
            <Navigation className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base md:text-lg font-luxury font-bold text-white tracking-wide">
                Live Fleet Radar & GPS Locations
              </h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#5ED39A]/15 border border-[#5ED39A]/30 text-[10px] font-mono-num text-[#5ED39A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5ED39A] animate-pulse" />
                MAPLIBRE GL · OPENFREEMAP
              </span>
            </div>
            <p className="text-xs text-[#888888] mt-0.5">
              High-performance vector tiles rendered in WebGL across Bangalore, Mumbai, Delhi, and Goa.
            </p>
          </div>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
          {['ALL', 'Bangalore', 'Mumbai', 'Delhi', 'Goa'].map(city => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-num uppercase tracking-wider transition-all cursor-pointer ${
                selectedCity === city
                  ? 'bg-[#C9A45C] text-[#050505] font-bold shadow-md shadow-[#C9A45C]/20'
                  : 'text-[#999999] hover:text-white'
              }`}
            >
              {city === 'ALL' ? 'All Hubs' : city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map View Area with Left/Right Quick Drawer */}
      <div className="relative w-full h-[460px] md:h-[560px]">
        {/* MapLibre Container: matches user specification id="map" */}
        <div id="map" ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Active Vehicle Floating Telemetry Card (Desktop Bottom-Left) */}
        {activeVehicle && activeGps && (
          <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full bg-[#0D0E13]/95 backdrop-blur-xl border border-[#C9A45C]/40 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#C9A45C] font-semibold">
                SELECTED ON RADAR · {activeGps.cityName.toUpperCase()}
              </span>
              <span className="text-[10px] font-mono-num text-[#5ED39A] flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Fuel {activeGps.fuelLevel}%
              </span>
            </div>

            <div className="flex gap-3 items-center mb-3">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-white/10">
                <img
                  src={activeVehicle.imageUrl || ''}
                  alt={activeVehicle.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-sm font-luxury font-bold text-white leading-tight">
                  {activeVehicle.name}
                </h4>
                <div className="text-xs text-[#AAAAAA] mt-0.5 font-mono-num">
                  {activeVehicle.horsepower} HP · {formatPrice(activeVehicle.dailyPrice)}/day
                </div>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-black/60 border border-white/5 text-[11px] text-[#BBBBBB] mb-3 leading-snug">
              <span className="text-white font-semibold">📍 Handover Hub:</span> {activeGps.hubName}
              <div className="text-[10px] text-[#777777] mt-0.5 truncate">{activeGps.address}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectVehicle(activeVehicle)}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#DDDDDD] hover:text-white border border-white/10 font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>SPECS</span>
              </button>

              <button
                type="button"
                onClick={() => onBookVehicle(activeVehicle)}
                className="py-2 px-3 rounded-lg bg-[#C9A45C] hover:bg-[#DFBD78] text-xs text-[#050505] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <span>BOOK NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Category Filters Bar & Map Style Toggle (Top-Right inside map) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-1 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
            {['ALL', 'Sports', 'Luxury', 'Performance', 'Luxury SUV'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-num uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C9A45C] text-[#050505] font-bold shadow'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'All Types' : cat}
              </button>
            ))}
          </div>

          {/* OpenFreeMap Style Switcher */}
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px] font-mono-num shadow-lg">
            <span className="text-[#888888] px-1.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#C9A45C]" /> Style:
            </span>
            {[
              { id: 'bright', name: 'Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
              { id: 'liberty', name: 'Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
              { id: 'positron', name: 'Positron', url: 'https://tiles.openfreemap.org/styles/positron' }
            ].map(style => (
              <button
                key={style.id}
                type="button"
                onClick={() => setMapStyleUrl(style.url)}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  mapStyleUrl === style.url
                    ? 'bg-[#C9A45C] text-[#050505] font-bold'
                    : 'text-[#AAAAAA] hover:text-white'
                }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Legend Indicator (Bottom-Right) */}
        <div className="absolute bottom-4 right-14 z-20 hidden md:flex items-center gap-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] font-mono-num text-[#888888] shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5ED39A]" />
            <span className="text-white">Available (Instant Curbside)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E66A6A]" />
            <span className="text-white">Reserved / Active Drive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
