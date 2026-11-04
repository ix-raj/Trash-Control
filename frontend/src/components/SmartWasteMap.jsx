import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getCurrentLocation } from '../services/locationService';
import { classifyWaste, getAiHotspots, getCleanupEvents, optimizeWasteRoute, predictWasteRisk } from '../services/api';
import { AlertCircle, Calendar, Compass, Fuel, Layers, MapPin, Navigation, Recycle, Route, Settings, TriangleAlert, Truck, Users } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map controller to adjust view dynamically
const FlyToUser = ({ coords, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, zoom, { animate: true });
    }
  }, [coords, zoom, map]);
  return null;
};

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click(event) {
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
};

const MapRegionSelector = ({ active, onSelect }) => {
  useMapEvents({
    click(event) {
      if (active) onSelect?.(event.latlng.lat, event.latlng.lng);
    }
  });
  return null;
};

const MapViewportListener = ({ onZoom }) => {
  useMapEvents({ zoomend: (event) => onZoom?.(event.target.getZoom()) });
  return null;
};

const CampaignIcon = L.divIcon({
  className: 'campaign-div-icon',
  html: '<div style="background:#4d9b68;color:white;width:25px;height:25px;border-radius:8px;border:2px solid white;box-shadow:0 4px 12px rgba(77,155,104,.35);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800">&#128197;</div>',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

const AggregateHubIcon = L.divIcon({
  className: 'hub-cluster-div-icon',
  html: '<div style="background:#1f6e5f;color:white;width:34px;height:34px;border-radius:50%;border:2px solid white;box-shadow:0 4px 12px rgba(31,110,95,.35);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800">&#9851;</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const getRouteStopIcon = (number, depot = false) => L.divIcon({
  className: 'route-stop-div-icon',
  html: `<div style="background:${depot ? '#173d32' : '#227c70'};color:white;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(23,61,50,.32);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">${depot ? 'S' : number}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const DynamicHeatmapCircle = ({ hotspot, onSelect }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on('zoomend', updateZoom);
    return () => map.off('zoomend', updateZoom);
  }, [map]);

  const density = Math.max(1, hotspot.incident_density || 1);
  const zoomScale = 95000 / (2 ** Math.max(0, zoom - 5));
  const radius = Math.min(140000, Math.max(650, zoomScale)) * (0.8 + Math.min(density, 10) * 0.12);
  const color = hotspot.risk_level === 'High' || hotspot.risk_level === 'Critical' ? '#c75c3b' : '#c99535';

  return (
    <Circle
      center={[hotspot.latitude, hotspot.longitude]}
      pathOptions={{ fillColor: color, fillOpacity: 0.28, color, weight: 2, opacity: 0.75 }}
      eventHandlers={{ click: () => onSelect?.(hotspot) }}
      radius={radius}
    >
      <Popup>
        <div className="min-w-[150px] text-xs text-[#24483b]">
          <strong className="block text-[10px] uppercase tracking-wide text-[#1f6e5f]">AI hotspot</strong>
          <span>{density} active reports · {hotspot.risk_level} risk</span>
        </div>
      </Popup>
    </Circle>
  );
};

// Recycling center icon (Green)
const RecyclingIcon = L.divIcon({
  className: 'recycling-div-icon',
  html: '<div style="background-color:#1f6e5f;color:white;width:25px;height:25px;border-radius:8px;border:2px solid white;box-shadow:0 4px 12px rgba(31,110,95,.35);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800">&#9851;</div>',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

const HubLayer = ({ centers, visible }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on('zoomend', updateZoom);
    map.on('moveend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
      map.off('moveend', updateZoom);
    };
  }, [map]);

  if (!visible) return null;
  const inViewport = centers.filter((center) => map.getBounds().contains(center.coords));

  if (zoom < 8) {
    return inViewport.length > 0 ? (
      <Marker position={map.getCenter()} icon={AggregateHubIcon}>
        <Popup>
          <div className="text-xs text-[#24483b]">
            <strong className="block text-[10px] uppercase tracking-wide text-[#1f6e5f]">Collection hubs</strong>
            <span>{inViewport.length} service hubs in this map area. Zoom in to inspect individual facilities.</span>
          </div>
        </Popup>
      </Marker>
    ) : null;
  }

  return inViewport.map((center) => (
    <Marker key={center.id} position={center.coords} icon={RecyclingIcon}>
      <Popup>
        <div className="text-xs text-[#24483b]">
          <strong className="block text-[10px] uppercase tracking-wide text-[#1f6e5f]">Collection service hub</strong>
          <h4 className="mb-1 font-bold">{center.name}</h4>
          <p className="text-[10px] text-[#71887a]">{center.address}</p>
          <p className="mt-1 text-[10px] font-semibold text-[#4d8a73]">Drop-off · sorting · recovery</p>
        </div>
      </Popup>
    </Marker>
  ));
};

// Dynamic cluster marker generator
const getClusterIcon = (count) => {
  return L.divIcon({
    className: 'cluster-div-icon',
    html: `<div style="background: rgba(189, 0, 255, 0.2); border: 2px solid #bd00ff; color: #fff; width: 32px; height: 32px; border-radius: 50%; font-weight: bold; font-size: 11px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #bd00ff">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const truckIcon = L.divIcon({
  className: 'truck-div-icon',
  html: `<div style="background-color: #00f0ff; font-size: 16px; padding: 4px; border-radius: 50%; border: 2px solid #030712; box-shadow: 0 0 12px #00f0ff; display: flex; align-items: center; justify-content: center;">🚛</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const localityNames = [
  'mumbai', 'bengaluru', 'bangalore', 'agartala', 'tripura', 'new delhi', 'delhi',
  'chennai', 'kolkata', 'hyderabad', 'pune', 'ludhiana', 'mysuru', 'kochi', 'ahmedabad',
  'jaipur', 'lucknow'
];

const getLocality = (report) => {
  const address = report.location?.address?.toLowerCase() || '';
  return localityNames.find((name) => address.includes(name)) || 'other';
};

const distanceSquared = (a, b) => ((a[0] - b[0]) ** 2) + ((a[1] - b[1]) ** 2);
const distanceKm = (a, b) => {
  const toRadians = (value) => value * Math.PI / 180;
  const dLat = toRadians(b[0] - a[0]);
  const dLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(value));
};
const EMPTY_REPORTS = [];

const SmartWasteMap = ({ reports = EMPTY_REPORTS, selectMode = false, onMapClick, selectedCoords, center, zoom = 2, adminMode = false }) => {
  const defaultCenter = [20.5937, 78.9629]; // India view by default
  const [gpsCoords, setGpsCoords] = useState(null);
  const [showRecycling, setShowRecycling] = useState(!adminMode);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClusters, setShowClusters] = useState(false);
  const [showTruck, setShowTruck] = useState(false);
  const [truckCoords, setTruckCoords] = useState(defaultCenter);
  const [showRoute, setShowRoute] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [routeMetrics, setRouteMetrics] = useState(null);
  const [showRouteStops, setShowRouteStops] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [aiHotspots, setAiHotspots] = useState([]);
  const [hotspotError, setHotspotError] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaigns, setShowCampaigns] = useState(!adminMode);
  const [selectedReport, setSelectedReport] = useState(null);
  const [priorityAssessment, setPriorityAssessment] = useState(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [populationDensity, setPopulationDensity] = useState('');
  const [selectingRegion, setSelectingRegion] = useState(false);
  const [regionCenter, setRegionCenter] = useState(null);
  const [regionRadiusKm, setRegionRadiusKm] = useState(null);
  const [riskSelecting, setRiskSelecting] = useState(false);
  const [mapZoom, setMapZoom] = useState(zoom);
  
  // Geo-fencing alerts
  const [showGeoAlert, setShowGeoAlert] = useState(false);
  const [geoAlertMsg, setGeoAlertMsg] = useState('');

  useEffect(() => {
    if (selectMode) return undefined;
    let cancelled = false;
    getCleanupEvents()
      .then((data) => {
        if (!cancelled) setCampaigns(data.success ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) setCampaigns([]);
      });
    return () => { cancelled = true; };
  }, [selectMode]);

  // Check for geo-fencing entry when center shifts
  useEffect(() => {
    if (center && reports.length > 0) {
      const closeHotspot = reports.find(r => {
        const coords = r.location?.coordinates;
        if (!coords || r.status === 'resolved') return false;
        const d = Math.sqrt((center[0] - coords[1])**2 + (center[1] - coords[0])**2);
        return d < 0.009; // within ~900m
      });

      if (closeHotspot) {
        setGeoAlertMsg(`You are entering a high waste accumulation zone near ${closeHotspot.location.address}. Suggestion: Check nearby recycling hubs or join community cleanups.`);
        setShowGeoAlert(true);
      } else {
        setShowGeoAlert(false);
      }
    }
  }, [center, reports]);

  // Setup interval to simulate truck movement towards the first unresolved report
  useEffect(() => {
    let interval;
    if (showTruck) {
      const activeReport = reports.find(r => r.status === 'approved' || r.status === 'pending');
      const targetCoords = activeReport?.location?.coordinates;
      
      if (targetCoords) {
        const targetLat = targetCoords[1];
        const targetLng = targetCoords[0];
        
        // Start truck at a small offset if just initialized
        if (truckCoords[0] === defaultCenter[0] && truckCoords[1] === defaultCenter[1]) {
          setTruckCoords([targetLat + 0.02, targetLng - 0.02]);
        }

        interval = setInterval(() => {
          setTruckCoords((prev) => {
            const currentLat = prev[0];
            const currentLng = prev[1];
            
            // Move 10% closer to target coordinates
            const nextLat = currentLat + (targetLat - currentLat) * 0.12;
            const nextLng = currentLng + (targetLng - currentLng) * 0.12;
            
            return [nextLat, nextLng];
          });
        }, 1200);
      }
    }
    return () => clearInterval(interval);
  }, [showTruck, reports]);

  // Mock recycling centers
  const recyclingCenters = [
    { id: 'rc1', name: 'Delhi E-Waste Recovery Hub', coords: [28.6304, 77.2177], address: 'Connaught Place, New Delhi' },
    { id: 'rc2', name: 'Mumbai Circular Materials Centre', coords: [19.0176, 72.8562], address: 'Dadar East, Mumbai' },
    { id: 'rc3', name: 'Bengaluru Composting Facility', coords: [12.9719, 77.6412], address: 'Indiranagar, Bengaluru' },
    { id: 'rc4', name: 'Hyderabad Green Recovery Hub', coords: [17.4483, 78.3915], address: 'Hitech City, Hyderabad' },
    { id: 'rc5', name: 'Chennai Plastic Sorting Centre', coords: [13.0418, 80.2341], address: 'T. Nagar, Chennai' },
    { id: 'rc6', name: 'Kolkata Reuse and Repair Depot', coords: [22.5867, 88.4171], address: 'Salt Lake, Kolkata' },
    { id: 'rc7', name: 'Pune Eco Drop-off Centre', coords: [18.5308, 73.8475], address: 'Shivajinagar, Pune' },
    { id: 'rc8', name: 'Ahmedabad Dry Waste Hub', coords: [23.0330, 72.5460], address: 'Navrangpura, Ahmedabad' },
    { id: 'rc9', name: 'Jaipur Community Recycling Point', coords: [26.9124, 75.7873], address: 'C-Scheme, Jaipur' },
    { id: 'rc10', name: 'Kochi Coastal Waste Centre', coords: [9.9670, 76.2454], address: 'Fort Kochi, Kerala' },
    { id: 'rc11', name: 'Lucknow Municipal Eco Depot', coords: [26.8467, 80.9462], address: 'Gomti Nagar, Lucknow' },
  ];

  const handleGpsDetect = async () => {
    try {
      const location = await getCurrentLocation();
      setGpsCoords([location.latitude, location.longitude]);
      if (selectMode && onMapClick) {
        onMapClick(location.latitude, location.longitude);
      }
    } catch (err) {
      setGeoAlertMsg("Location access denied. Please enable location services in your browser settings to use this feature.");
      setShowGeoAlert(true);
      setTimeout(() => setShowGeoAlert(false), 5000);
    }
  };

  const handleReportSelect = async (report) => {
    setSelectedReport(report);
    setPriorityAssessment(null);
    if (!adminMode) return;
    setAssessmentLoading(true);
    try {
      const result = await classifyWaste({ waste_type: report.wasteType, description: report.description || '' });
      setPriorityAssessment(result);
    } catch (error) {
      setPriorityAssessment({ classified_priority: 'Unavailable', audit_trail: [error.response?.data?.message || 'Assessment service unavailable.'] });
    } finally {
      setAssessmentLoading(false);
    }
  };

  const handleRiskStart = () => {
    setShowRoute(false);
    setRiskAssessment(null);
    setRegionCenter(null);
    setRegionRadiusKm(null);
    setRiskSelecting(true);
    setSelectingRegion(true);
    setRouteError('Click an area centre, then click its boundary.');
  };

  const handleRiskAssessment = async () => {
    if (!regionCenter || !regionRadiusKm || !populationDensity) return;
    const areaReports = reports.filter((report) => {
      const [lng, lat] = report.location?.coordinates || [];
      return Number.isFinite(lat) && distanceKm(regionCenter, [lat, lng]) <= regionRadiusKm;
    });
    try {
      const result = await predictWasteRisk({
        latitude: regionCenter[0],
        longitude: regionCenter[1],
        month: new Date().getMonth() + 1,
        population_density: Number(populationDensity),
        complaint_count: areaReports.length
      });
      setRiskAssessment(result);
    } catch (error) {
      setRiskAssessment({ error: error.response?.data?.message || 'Risk assessment service unavailable.' });
    }
  };

  const getPriorityColor = (status, type) => {
    if (status === 'resolved') return '#00f5d4'; // Green (Resolved)
    if (type === 'Hazardous' || status === 'pending') return '#ef4444'; // Red (High Priority)
    return '#facc15'; // Orange / Yellow (Medium Priority)
  };

  const getMarkerIcon = (status, type) => {
    const color = getPriorityColor(status, type);
    return L.divIcon({
      className: 'waste-div-icon',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #030712; box-shadow: 0 0 10px ${color}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  // Group coordinates into basic grid-based clusters for clustering mode
  const getClusteredReports = () => {
    const clusteringEnabled = showClusters || (!adminMode && reports.length > 8 && mapZoom < 11);
    if (!clusteringEnabled) return { clusters: [], singles: reports };

    const grid = {};
    const singles = [];
    const threshold = 0.015; // Grid distance threshold

    reports.forEach((report) => {
      const coords = report.location?.coordinates;
      if (!coords) return;
      const lat = coords[1];
      const lng = coords[0];

      const gridLat = Math.round(lat / threshold) * threshold;
      const gridLng = Math.round(lng / threshold) * threshold;
      const key = `${gridLat.toFixed(4)},${gridLng.toFixed(4)}`;

      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(report);
    });

    const clusters = [];
    Object.keys(grid).forEach((key) => {
      const list = grid[key];
      if (list.length > 1) {
        // Calculate average coords
        let sumLat = 0, sumLng = 0;
        list.forEach(r => {
          sumLat += r.location.coordinates[1];
          sumLng += r.location.coordinates[0];
        });
        clusters.push({
          id: key,
          coords: [sumLat / list.length, sumLng / list.length],
          count: list.length,
          reports: list
        });
      } else {
        singles.push(list[0]);
      }
    });

    return { clusters, singles };
  };

  const { clusters, singles } = getClusteredReports();

  useEffect(() => {
    if (!showRoute || selectMode) {
      setOptimizedRoute([]);
      setRouteMetrics(null);
      setRouteError('');
      return undefined;
    }

    const activeReports = reports.filter((report) =>
      report.status === 'approved' &&
      report.location?.coordinates?.length === 2
    );

    if (activeReports.length === 0) {
      setOptimizedRoute([]);
      setRouteMetrics(null);
      setRouteError('No active reports are available for routing.');
      return undefined;
    }

    if (!regionCenter || !regionRadiusKm) {
      setOptimizedRoute([]);
      setRouteMetrics(null);
      setRouteError('Place a region on the map: click a centre, then click its boundary.');
      return undefined;
    }

    const regionReports = activeReports.filter((report) => {
      const [lng, lat] = report.location.coordinates;
      return distanceKm(regionCenter, [lat, lng]) <= regionRadiusKm;
    });

    if (regionReports.length === 0) {
      setOptimizedRoute([]);
      setRouteMetrics(null);
      setRouteError('No active reports were found inside this region.');
      return undefined;
    }

    const grouped = regionReports.reduce((groups, report) => {
      const locality = getLocality(report);
      groups[locality] = groups[locality] || [];
      groups[locality].push(report);
      return groups;
    }, {});

    // A route is always local: use the locality nearest the focused map area,
    // or the busiest locality when the map is showing the national overview.
    const groupsWithPoints = Object.entries(grouped).map(([locality, group]) => ({
      locality,
      reports: group,
      centroid: group.reduce((sum, report) => {
        const [lng, lat] = report.location.coordinates;
        return [sum[0] + lat / group.length, sum[1] + lng / group.length];
      }, [0, 0])
    }));
    const focusedGroup = regionCenter
      ? { locality: 'selected operating region', reports: regionReports, centroid: regionCenter }
      : center && zoom >= 10
      ? groupsWithPoints.reduce((nearest, group) => (
        !nearest || distanceSquared(group.centroid, center) < distanceSquared(nearest.centroid, center)
          ? group
          : nearest
      ), null)
      : groupsWithPoints.sort((a, b) => b.reports.length - a.reports.length)[0];
    const routeReports = focusedGroup.reports;
    const points = routeReports.map((report) => {
      const [lng, lat] = report.location.coordinates;
      return [lat, lng];
    });
    const start = center && zoom >= 10 && distanceSquared(focusedGroup.centroid, center) < 4
      ? center
      : points[0];

    let cancelled = false;
    setRouteLoading(true);
    setRouteError('');
    optimizeWasteRoute(points, start, { center: regionCenter, radius_km: regionRadiusKm })
      .then((data) => {
        if (cancelled) return;
        setOptimizedRoute(data.optimized_route || []);
        setRouteMetrics({ ...data, locality: focusedGroup.locality });
      })
      .catch((error) => {
        if (cancelled) return;
        setOptimizedRoute([]);
        setRouteMetrics(null);
        setRouteError(error.response?.data?.message || 'AI route service is unavailable.');
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });

    return () => { cancelled = true; };
  }, [center, regionCenter, regionRadiusKm, reports, selectMode, showRoute, zoom]);

  useEffect(() => {
    if (!showHeatmap || selectMode || reports.length === 0) {
      setAiHotspots([]);
      setHotspotError('');
      return undefined;
    }

    let cancelled = false;
    getAiHotspots(reports)
      .then((data) => {
        if (!cancelled) {
          setAiHotspots(data.hotspots || []);
          setHotspotError('');
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAiHotspots([]);
          setHotspotError(error.response?.data?.message || 'Waste density analysis is unavailable.');
        }
      });

    return () => { cancelled = true; };
  }, [reports, selectMode, showHeatmap]);

  const [showTools, setShowTools] = useState(false);

  const handleRegionClick = (lat, lng) => {
    if (!regionCenter) {
      setRegionCenter([lat, lng]);
      setRouteError('Now click the edge of the operating region.');
      return;
    }

    const radius = distanceKm(regionCenter, [lat, lng]);
    if (radius < 0.2) {
      setRouteError('Make the region larger than 200 metres.');
      return;
    }
    setRegionRadiusKm(radius);
    setSelectingRegion(false);
    if (riskSelecting) {
      setRouteError('Area selected. Enter population density to run the assessment.');
    } else {
      setRouteError('');
    }
  };

  const handleOptimizerToggle = () => {
    if (showRoute) {
      setShowRoute(false);
      setSelectingRegion(false);
      return;
    }
    setShowRoute(true);
    setRegionCenter(null);
    setRegionRadiusKm(null);
    setRiskSelecting(false);
    setOptimizedRoute([]);
    setRouteMetrics(null);
    setShowRouteStops(false);
    setSelectingRegion(true);
    setRouteError('Click a region centre, then click its boundary.');
  };

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-[#cdddcf] bg-[#dce8df] shadow-[0_14px_34px_rgba(29,83,68,.12)] sm:h-[620px] xl:h-[690px]">
      {/* Dynamic Action HUD - Grouped into a list */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
        
        {/* Main Toggle Button */}
        <button 
          onClick={() => setShowTools(!showTools)}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#b7d5bd] bg-white/95 px-3 py-2.5 text-xs font-bold text-[#245b4b] shadow-lg backdrop-blur hover:border-[#227c70] hover:bg-white"
          title="Toggle Map Tools"
        >
          <Settings className="h-4 w-4" /> Map Tools
        </button>

        {/* Dropdown List of Tools */}
        {showTools && (
          <div className="flex w-44 flex-col gap-1 rounded-xl border border-[#d5e2d5] bg-white/95 p-2 shadow-xl backdrop-blur-md">
            <button 
              onClick={handleGpsDetect}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent p-2.5 text-xs font-semibold text-[#506c5e] hover:border-[#c9dfcc] hover:bg-[#f0f7ef] hover:text-[#1f6e5f]"
            >
              <Compass className="h-3.5 w-3.5" /> Locate Me
            </button>

            {!selectMode && (
              <>
                {adminMode && <>
                  <button 
                    onClick={() => {
                      setShowHeatmap(!showHeatmap);
                      if (!showHeatmap) setShowClusters(false);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      showHeatmap ? 'bg-neon-pink/15 border-neon-pink text-neon-pink' : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-pink'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" /> AI hotspots
                  </button>

                  <button 
                    onClick={() => {
                      setShowClusters(!showClusters);
                      if (!showClusters) setShowHeatmap(false);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      showClusters ? 'bg-neon-purple/15 border-neon-purple text-neon-purple' : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-purple'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" /> Cluster reports
                  </button>
                </>}

                <button 
                  onClick={() => setShowRecycling(!showRecycling)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                    showRecycling 
                      ? 'bg-neon-teal/15 border-neon-teal text-neon-teal' 
                      : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-teal'
                  }`}
                >
                  <Recycle className="h-3.5 w-3.5" /> Hubs
                </button>

                {adminMode && <button
                  onClick={() => setShowCampaigns(!showCampaigns)}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                    showCampaigns ? 'bg-neon-teal/15 border-neon-teal text-neon-teal' : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-teal'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" /> Campaigns
                </button>}

                {adminMode && <>
                  <button 
                    onClick={() => setShowTruck(!showTruck)}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      showTruck ? 'bg-neon-blue/15 border-neon-blue text-neon-blue animate-pulse' : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-blue'
                    }`}
                  >
                    <Truck className="h-3.5 w-3.5" /> Truck tracking
                  </button>

                  <button 
                    onClick={handleOptimizerToggle}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      showRoute ? 'bg-neon-teal/15 border-neon-teal text-neon-teal animate-pulse' : 'bg-dark-bg border-dark-border text-gray-300 hover:text-neon-teal'
                    }`}
                  >
                    <Navigation className="h-3.5 w-3.5" /> {showRoute ? 'Reset region' : 'Optimize region'}
                  </button>

                  <button
                    onClick={handleRiskStart}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-dark-bg p-2.5 text-xs font-semibold text-gray-300 hover:border-neon-teal hover:text-neon-teal"
                  >
                    <TriangleAlert className="h-3.5 w-3.5" /> Assess area risk
                  </button>
                </>}
              </>
            )}
          </div>
        )}
      </div>

      <MapContainer 
        center={center || defaultCenter} 
        zoom={zoom} 
        className="w-full h-full"
      >
        {selectMode && <MapClickHandler onMapClick={onMapClick} />}
        <MapViewportListener onZoom={setMapZoom} />
        <MapRegionSelector active={selectingRegion} onSelect={handleRegionClick} />
        {regionCenter && (
          <Circle
            center={regionCenter}
            radius={(regionRadiusKm || 0.5) * 1000}
            pathOptions={{ color: '#1f6e5f', weight: 2, dashArray: '8, 8', fillColor: '#9fc3a7', fillOpacity: 0.12 }}
          />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToUser coords={gpsCoords || center} zoom={gpsCoords ? 14 : zoom} />

        {/* Live Tracking Cleaning Truck */}
        {showTruck && truckCoords && (
          <Marker position={truckCoords} icon={truckIcon}>
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-neon-blue uppercase text-[9px] block mb-1">Live Tracking</span>
                <p className="font-bold text-[#24483b]">Smart Clean Truck #08</p>
                <p className="text-[10px] text-[#71887a]">En route to reported waste heap...</p>
              </div>
            </Popup>
          </Marker>
        )}

        {!selectMode && <HubLayer centers={recyclingCenters} visible={showRecycling} />}

        {!selectMode && showCampaigns && campaigns.map((campaign) => {
          const coords = campaign.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          return (
            <Marker key={campaign._id} position={[coords[1], coords[0]]} icon={CampaignIcon}>
              <Popup>
                <div className="min-w-[180px] text-xs text-[#24483b]">
                  <strong className="block text-[10px] uppercase tracking-wide text-[#4d9b68]">Cleanup campaign</strong>
                  <h4 className="mb-1 font-bold">{campaign.title}</h4>
                  <p className="text-[10px] text-[#71887a]">{campaign.location?.address}</p>
                  <p className="mt-1 text-[10px] text-[#5d7568]">{new Date(campaign.date).toLocaleString()}</p>
                  <p className="mt-1 text-[10px] text-[#5d7568]">{campaign.volunteers?.length || 0} volunteers</p>
                  <a href="/events" className="mt-2 inline-flex items-center gap-1 font-bold text-[#1f6e5f]">View campaign <Users className="h-3 w-3" /></a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Selected Map Coordinates Flag */}
        {selectMode && selectedCoords && (
          <Marker position={selectedCoords}>
            <Popup>
              <div className="text-xs font-bold">Pin Location</div>
            </Popup>
          </Marker>
        )}

        {/* Standard Single Markers Layer */}
        {!selectMode && !showHeatmap && singles.map((report) => {
          const coords = report.location?.coordinates;
          if (!coords || coords.length !== 2) return null;
          return (
            <Marker 
              key={report._id} 
              position={[coords[1], coords[0]]} 
              icon={getMarkerIcon(report.status, report.wasteType)}
              eventHandlers={{ click: () => handleReportSelect(report) }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <span className={`font-extrabold uppercase text-[9px] tracking-wider block mb-1`} style={{ color: getPriorityColor(report.status, report.wasteType) }}>
                    {report.wasteType} ({report.status})
                  </span>
                  <p className="mb-1 font-bold text-[#24483b]">{report.description || 'No description'}</p>
                  <p className="text-[10px] text-[#71887a]">{report.location.address}</p>
                  <p className="mt-1 text-[10px] text-[#71887a]">Reported {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'date unavailable'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Clustered Markers Layer */}
        {!selectMode && showClusters && clusters.map((cluster) => (
          <Marker 
            key={cluster.id} 
            position={cluster.coords}
            icon={getClusterIcon(cluster.count)}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-neon-purple uppercase text-[10px] tracking-wider block mb-1">Cluster</span>
                <p className="mb-1 font-bold text-[#24483b]">{cluster.count} reports in this area.</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotspots returned by the Flask AI service */}
        {!selectMode && showHeatmap && aiHotspots.length > 0 && aiHotspots.map((hotspot) => (
          <DynamicHeatmapCircle key={`${hotspot.latitude}-${hotspot.longitude}`} hotspot={hotspot} onSelect={setSelectedHotspot} />
        ))}

        {/* Route Optimization Polyline path returned by the Flask AI service */}
        {!selectMode && showRoute && optimizedRoute.length > 1 && (
          <Polyline 
            positions={optimizedRoute}
            pathOptions={{ color: '#00f0ff', weight: 4, dashArray: '8, 8', opacity: 0.8 }} 
          />
        )}

        {!selectMode && showRoute && optimizedRoute.map((point, index) => (
          <Marker key={`route-stop-${point[0]}-${point[1]}-${index}`} position={point} icon={getRouteStopIcon(index, index === 0)}>
            <Popup>
              <div className="text-xs text-[#24483b]">
                <strong className="block text-[10px] uppercase tracking-wide text-[#1f6e5f]">{index === 0 ? 'Route start' : `Cleanup stop ${index}`}</strong>
                <span>{point[0].toFixed(5)}, {point[1].toFixed(5)}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedReport && (
        <div className="absolute left-4 top-4 z-[500] max-w-[290px] rounded-xl border border-[#b7d5bd] bg-white/96 p-4 text-left shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#1f6e5f]"><MapPin className="h-3.5 w-3.5" /> Waste report</div>
            <button onClick={() => setSelectedReport(null)} className="text-xs font-bold text-[#71887a]">Close</button>
          </div>
          <p className="mt-2 font-bold text-[#173d32]">{selectedReport.wasteType} waste</p>
          <p className="mt-1 text-xs text-[#5d7568]">{selectedReport.description || 'No description provided.'}</p>
          <dl className="mt-3 space-y-1 text-xs text-[#35594c]">
            <div className="flex justify-between gap-3"><dt>Status</dt><dd className="font-bold uppercase">{selectedReport.status}</dd></div>
            <div className="flex justify-between gap-3"><dt>Location</dt><dd className="max-w-[175px] text-right">{selectedReport.location?.address}</dd></div>
            <div className="flex justify-between gap-3"><dt>Reported</dt><dd>{selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : 'Unavailable'}</dd></div>
          </dl>
          {adminMode && (
            <div className="mt-3 border-t border-[#e1e9df] pt-3">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide text-[#1f6e5f]"><TriangleAlert className="h-3 w-3" /> Automated priority assessment</div>
              {assessmentLoading && <p className="mt-1 text-xs text-[#71887a]">Assessing report...</p>}
              {priorityAssessment && !assessmentLoading && <>
                <p className="mt-1 text-sm font-extrabold text-[#a04d32]">{priorityAssessment.classified_priority}</p>
                <ul className="mt-1 list-disc pl-4 text-xs text-[#5d7568]">{(priorityAssessment.audit_trail || []).map((reason) => <li key={reason}>{reason}</li>)}</ul>
              </>}
            </div>
          )}
        </div>
      )}

      {adminMode && selectedHotspot && (
        <div className="absolute left-4 top-4 z-[500] mt-[220px] max-w-[270px] rounded-xl border border-[#e7c88a] bg-white/96 p-4 text-left shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#a36d1e]"><TriangleAlert className="h-3.5 w-3.5" /> Waste hotspot</div>
            <button onClick={() => setSelectedHotspot(null)} className="text-xs font-bold text-[#71887a]">Close</button>
          </div>
          <p className="mt-2 text-sm font-extrabold uppercase text-[#a04d32]">{selectedHotspot.risk_level} risk</p>
          <p className="mt-1 text-xs text-[#35594c]">{selectedHotspot.incident_density} reports grouped in this area.</p>
          <p className="mt-2 text-[10px] text-[#71887a]">This is geographic density analysis, not a predictive model.</p>
        </div>
      )}

      {adminMode && showHeatmap && hotspotError && (
        <div className="absolute left-4 top-4 z-[500] mt-[220px] max-w-[270px] rounded-xl border border-[#e7b6a3] bg-white/96 p-4 text-xs text-[#a04d32] shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 font-extrabold uppercase tracking-wide"><TriangleAlert className="h-3.5 w-3.5" /> Analysis unavailable</div>
          <p className="mt-1">{hotspotError}</p>
        </div>
      )}

      {adminMode && riskSelecting && (
        <div className="absolute bottom-4 left-4 z-[500] max-w-[290px] rounded-xl border border-[#b7d5bd] bg-white/96 p-4 text-left shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#1f6e5f]"><TriangleAlert className="h-3.5 w-3.5" /> Area risk assessment</div>
          {!regionRadiusKm ? <p className="mt-1 text-xs text-[#5d7568]">Click a centre and boundary on the map to define the area.</p> : <>
            <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-[#71887a]">Population density</label>
            <input type="number" min="0" value={populationDensity} onChange={(event) => setPopulationDensity(event.target.value)} placeholder="Required input" className="mt-1 w-full rounded-lg border border-[#d4e1d4] bg-[#f8faf7] px-3 py-2 text-xs text-[#24483b]" />
            <button onClick={handleRiskAssessment} disabled={!populationDensity} className="mt-2 w-full rounded-lg bg-[#1f6e5f] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Assess selected area</button>
          </>}
          {riskAssessment && !riskAssessment.error && <div className="mt-3 border-t border-[#e1e9df] pt-3 text-xs text-[#35594c]"><p className="font-bold text-[#173d32]">{riskAssessment.predicted_waste_volume_tons} tons predicted</p><p className="mt-1 font-extrabold uppercase text-[#a04d32]">{riskAssessment.predicted_risk_level} risk</p><p className="mt-1 text-[10px] text-[#71887a]">Engine: {riskAssessment.engine}</p></div>}
          {riskAssessment?.error && <p className="mt-2 text-xs text-[#a04d32]">{riskAssessment.error}</p>}
        </div>
      )}

      {/* Geo-fencing alert overlay banner toast */}
      {showGeoAlert && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] flex items-start gap-3 rounded-xl border border-[#e7b6a3] bg-[#fff7f2]/95 p-4 text-[#713b2a] shadow-lg backdrop-blur">
          <AlertCircle className="h-5 w-5 text-neon-pink shrink-0 mt-0.5" />
          <div className="text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neon-pink block mb-1">Geo-fencing accumulation warning</span>
            <p className="text-xs leading-normal text-[#713b2a]">{geoAlertMsg}</p>
          </div>
        </div>
      )}

      {showRoute && (routeLoading || routeError || routeMetrics) && (
        <div className="absolute bottom-4 right-4 z-[400] max-w-[280px] rounded-xl border border-[#b7d5bd] bg-white/95 p-3 text-left shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#1f6e5f]">
            <Route className="h-3.5 w-3.5" /> Cleanup route
          </div>
          {routeLoading && <p className="mt-1 text-xs text-[#5d7568]">Calculating the local collection route...</p>}
          {routeError && <p className="mt-1 text-xs text-[#9a4d2d]">{routeError}</p>}
          {routeMetrics && !routeLoading && (
            <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#35594c]">
              <p className="font-bold text-[#173d32]">{routeMetrics.locality}</p>
              <p>{routeMetrics.stops || Math.max(0, optimizedRoute.length - 1)} collection stops · {routeMetrics.total_distance_km} km</p>
              <p className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {routeMetrics.estimated_completion_minutes} min estimated · {routeMetrics.fuel_saved_liters} L projected saving</p>
              <p className="pt-1 text-[10px] uppercase tracking-wide text-[#71887a]">{routeMetrics.optimization_method || 'AI route plan'}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setShowRouteStops(!showRouteStops)} className="rounded-md border border-[#c9dbca] px-2 py-1 text-[10px] font-bold text-[#1f6e5f]">{showRouteStops ? 'Hide stops' : 'View stops'}</button>
                <button onClick={handleOptimizerToggle} className="rounded-md border border-[#e7b6a3] px-2 py-1 text-[10px] font-bold text-[#a04d32]">Clear route</button>
              </div>
              {showRouteStops && <ol className="mt-2 space-y-1 border-t border-[#e1e9df] pt-2 text-[10px]">{optimizedRoute.slice(1).map((point, index) => <li key={`${point[0]}-${point[1]}-${index}`}><span className="font-bold text-[#1f6e5f]">{index + 1}.</span> {point[0].toFixed(4)}, {point[1].toFixed(4)}</li>)}</ol>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartWasteMap;
