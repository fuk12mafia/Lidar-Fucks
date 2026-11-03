const endpoint = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage';
const stateBounds = [[32.0, -83.5], [35.35, -78.3]];
const places = [
  { name: 'Greenville', region: 'Upstate', lat: 34.8526, lon: -82.3940, note: 'At the foot of the Blue Ridge foothills.' },
  { name: 'Table Rock State Park', region: 'Blue Ridge', lat: 35.0243, lon: -82.7040, note: 'Ridges, streams, and steep mountain terrain.' },
  { name: 'Jocassee Gorges', region: 'Blue Ridge', lat: 35.0657, lon: -82.8877, note: 'A rugged landscape of forests, rivers, and coves.' },
  { name: 'Columbia', region: 'Midlands', lat: 34.0007, lon: -81.0348, note: 'The capital city near the center of the state.' },
  { name: 'Congaree National Park', region: 'Midlands', lat: 33.7948, lon: -80.7821, note: 'Floodplain forest shaped by the Congaree and Wateree rivers.' },
  { name: 'Sumter National Forest', region: 'Piedmont', lat: 34.3715, lon: -82.0630, note: 'Forested ridges and reservoirs across the western Piedmont.' },
  { name: 'Myrtle Beach', region: 'Grand Strand', lat: 33.6891, lon: -78.8867, note: 'The Atlantic shoreline and its coastal plain.' },
  { name: 'Santee Delta', region: 'Lowcountry', lat: 33.1800, lon: -79.3500, note: 'A broad network of tidal channels and marshes.' },
  { name: 'Charleston', region: 'Lowcountry', lat: 32.7765, lon: -79.9311, note: 'Harbor, barrier islands, and a low-lying coastal plain.' },
  { name: 'ACE Basin', region: 'Lowcountry', lat: 32.6000, lon: -80.4500, note: 'The Ashepoo, Combahee, and Edisto rivers meet tidal wetlands.' },
  { name: 'Beaufort', region: 'Sea Islands', lat: 32.4316, lon: -80.6698, note: 'Sea islands, estuaries, and the southern coast.' },
  { name: 'Edisto Island', region: 'Sea Islands', lat: 32.5580, lon: -80.2850, note: 'Barrier island shoreline and coastal lowlands.' }
];
const mapElement = document.querySelector('#state-map');
const statusElement = document.querySelector('#map-status');
const searchElement = document.querySelector('#place-search');
const listElement = document.querySelector('#place-list');
const opacityInput = document.querySelector('#terrain-opacity');
const opacityValue = document.querySelector('#opacity-value');

if (typeof L === 'undefined') {
  statusElement.textContent = 'The map library did not load. Check your connection and reload the page.';
} else {
  const map = L.map(mapElement, {
    minZoom: 6,
    maxZoom: 17,
    maxBounds: stateBounds,
    maxBoundsViscosity: 0.85,
    zoomControl: false,
    scrollWheelZoom: true
  });
  map.fitBounds([[32.02, -83.36], [35.22, -78.54]], { padding: [14, 14] });
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.control.scale({ imperial: false, position: 'bottomright' }).addTo(map);

  const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const halfWorld = 20037508.342789244;
  const terrainPane = map.createPane('terrainPane');
  terrainPane.style.zIndex = '410';
  terrainPane.style.pointerEvents = 'none';
  const terrainLayer = L.tileLayer('', {
    pane: 'terrainPane',
    minZoom: 6,
    maxZoom: 17,
    tileSize: 256,
    opacity: Number(opacityInput.value) / 100,
    updateWhenIdle: true,
    keepBuffer: 2,
    crossOrigin: true,
    attribution: '<a href="https://www.usgs.gov/3d-elevation-program">USGS 3DEP elevation</a>'
  });
  terrainLayer.getTileUrl = function (coords) {
    const tilesAtZoom = Math.pow(2, coords.z);
    const span = (2 * halfWorld) / tilesAtZoom;
    const xmin = -halfWorld + coords.x * span;
    const ymax = halfWorld - coords.y * span;
    const bbox = [xmin, ymax - span, xmin + span, ymax].map(value => value.toFixed(2)).join(',');
    const params = new URLSearchParams({
      bbox,
      bboxSR: '3857',
      size: '256,256',
      imageSR: '3857',
      format: 'jpgpng',
      f: 'image',
      renderingRule: JSON.stringify({ rasterFunction: 'Hillshade Gray' })
    });
    return `${endpoint}?${params.toString()}`;
  };
  terrainLayer.addTo(map);
  let loadedTerrain = false;
  terrainLayer.on('tileload', () => {
    loadedTerrain = true;
    statusElement.textContent = 'USGS 3DEP terrain layer active';
  });
  let failedTiles = 0;
  terrainLayer.on('tileerror', () => {
    failedTiles += 1;
    if (!loadedTerrain && failedTiles >= 4) {
      statusElement.textContent = 'USGS terrain tiles are temporarily unavailable. The street map is still usable.';
    }
  });
  map.on('baselayerchange', event => { if (event.layer === streetLayer) map.invalidateSize(); });

  opacityInput.addEventListener('input', () => {
    const opacity = Number(opacityInput.value) / 100;
    terrainLayer.setOpacity(opacity);
    opacityValue.textContent = `${opacityInput.value}%`;
  });

  const markerIcon = L.divIcon({ className: 'place-pin-shell', html: '<span class="place-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
  const markers = places.map(place => {
    const marker = L.marker([place.lat, place.lon], { icon: markerIcon, title: `${place.name}, ${place.region}` });
    marker.bindPopup(`<strong>${place.name}</strong><br><span>${place.region} · ${place.note}</span>`, { maxWidth: 250 });
    marker.on('click', () => map.setView([place.lat, place.lon], Math.max(map.getZoom(), 11)));
    marker.addTo(map);
    return marker;
  });

  function renderPlaces() {
    const query = searchElement.value.trim().toLowerCase();
    const matches = places.map((place, index) => ({ place, index }))
      .filter(({ place }) => `${place.name} ${place.region} ${place.note}`.toLowerCase().includes(query));
    listElement.innerHTML = matches.map(({ place, index }) => `
      <button class="place-link" type="button" data-index="${index}">
        <span class="place-link-copy"><strong>${place.name}</strong><span>${place.region}</span></span>
        <span class="place-arrow" aria-hidden="true">↗</span>
      </button>`).join('') || '<p class="place-empty">No places found. Try another search.</p>';
    listElement.querySelectorAll('.place-link').forEach(button => button.addEventListener('click', () => {
      const place = places[Number(button.dataset.index)];
      map.flyTo([place.lat, place.lon], 12, { duration: 0.7 });
      markers[Number(button.dataset.index)].openPopup();
    }));
  }
  searchElement.addEventListener('input', renderPlaces);
  renderPlaces();

  fetch('data/south-carolina.geojson')
    .then(response => {
      if (!response.ok) throw new Error(`Boundary request failed (${response.status})`);
      return response.json();
    })
    .then(geojson => {
      const stateFeature = geojson.features.find(feature => feature.properties && feature.properties.GEOID === '45');
      if (!stateFeature) throw new Error('South Carolina boundary is missing from the boundary data');
      const stateRing = stateFeature.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]);
      const maskPane = map.createPane('stateMaskPane');
      maskPane.style.zIndex = '420';
      const worldRing = [[-85, -180], [-85, 180], [85, 180], [85, -180], [-85, -180]];
      L.polygon([worldRing, stateRing], {
        pane: 'stateMaskPane',
        stroke: false,
        fillColor: '#101510',
        fillOpacity: 0.58,
        fillRule: 'evenodd',
        interactive: false
      }).addTo(map);
      const outlinePane = map.createPane('stateOutlinePane');
      outlinePane.style.zIndex = '430';
      L.geoJSON(geojson, {
        pane: 'stateOutlinePane',
        interactive: false,
        style: { color: '#bdcd72', weight: 2, opacity: 0.95, fillOpacity: 0 }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Unable to load the South Carolina boundary:', error);
      statusElement.textContent = 'State outline could not load; pan and zoom within the highlighted map bounds.';
    });
}

document.querySelector('#hero-image').src = `${endpoint}?${new URLSearchParams({
  bbox: '-82.95,34.9,-82.55,35.18', bboxSR: '4326', size: '1800,1100', imageSR: '4326',
  format: 'jpgpng', f: 'image', renderingRule: JSON.stringify({ rasterFunction: 'Hillshade Gray' })
})}`;
document.querySelector('#method-image').src = `${endpoint}?${new URLSearchParams({
  bbox: '-80.95,33.55,-80.6,33.9', bboxSR: '4326', size: '1100,800', imageSR: '4326',
  format: 'jpgpng', f: 'image', renderingRule: JSON.stringify({ rasterFunction: 'Hillshade Gray' })
})}`;