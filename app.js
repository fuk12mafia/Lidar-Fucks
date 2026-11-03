const endpoint = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage';
const sampleEndpoint = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/getSamples';
const watershedEndpoint = 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/6/query';
const waterDataEndpoint = 'https://api.waterdata.usgs.gov/ogcapi/v1/collections/continuous/items';
const monitoringLocationsEndpoint = 'https://api.waterdata.usgs.gov/ogcapi/v1/collections/monitoring-locations/items';
const countyQueryEndpoint = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/55/query';
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
const mapCaption = document.querySelector('#map-caption');
const searchElement = document.querySelector('#place-search');
const listElement = document.querySelector('#place-list');
const opacityInput = document.querySelector('#terrain-opacity');
const opacityValue = document.querySelector('#opacity-value');
const profileStartButton = document.querySelector('#profile-start');
const profileFinishButton = document.querySelector('#profile-finish');
const profileClearButton = document.querySelector('#profile-clear');
const profileHint = document.querySelector('#profile-hint');
const profilePanel = document.querySelector('#profile-panel');
const profileCanvas = document.querySelector('#profile-chart');
const profileSummary = document.querySelector('#profile-summary');
const profileListenButton = document.querySelector('#profile-listen');
const profileDownloadButton = document.querySelector('#profile-download');
const questStartButton = document.querySelector('#quest-start');
const questPanel = document.querySelector('#quest-panel');
const questProgress = document.querySelector('#quest-progress');
const questClue = document.querySelector('#quest-clue');
const questFocusButton = document.querySelector('#quest-focus');
const questAnswers = document.querySelector('#quest-answers');
const questCheckButton = document.querySelector('#quest-check');
const questFeedback = document.querySelector('#quest-feedback');
const questNextButton = document.querySelector('#quest-next');
const probeToggle = document.querySelector('#probe-toggle');
const probePanel = document.querySelector('#probe-panel');
const probeResult = document.querySelector('#probe-result');
const probeMeta = document.querySelector('#probe-meta');
const probeCopyButton = document.querySelector('#probe-copy');
const watershedToggle = document.querySelector('#watershed-toggle');
const watershedPanel = document.querySelector('#watershed-panel');
const watershedResult = document.querySelector('#watershed-result');
const watershedMeta = document.querySelector('#watershed-meta');
const watershedClearButton = document.querySelector('#watershed-clear');
const riverToggle = document.querySelector('#river-toggle');
const riverPanel = document.querySelector('#river-panel');
const riverResult = document.querySelector('#river-result');
const riverReadings = document.querySelector('#river-readings');
const riverClearButton = document.querySelector('#river-clear');
const countyToggle = document.querySelector('#county-toggle');
const countyPanel = document.querySelector('#county-panel');
const countyResult = document.querySelector('#county-result');
const countyMeta = document.querySelector('#county-meta');
const countyClearButton = document.querySelector('#county-clear');
const swipeToggle = document.querySelector('#swipe-toggle');
const imageryDateLabel = document.querySelector('#imagery-date-label');
const imageryDate = document.querySelector('#imagery-date');
const historyControls = document.querySelector('#history-controls');
const historyPlayButton = document.querySelector('#history-play');
const historyRange = document.querySelector('#history-range');
const historyDate = document.querySelector('#history-date');
const swipeRangeLabel = document.querySelector('#swipe-range-label');
const swipeRange = document.querySelector('#swipe-range');
const swipeValue = document.querySelector('#swipe-value');
const swipeDivider = document.querySelector('#swipe-divider');

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
  const terrainStyles = [
    { name: 'Hillshade', rasterFunction: 'Hillshade Gray' },
    { name: 'Multidirectional hillshade', rasterFunction: 'Hillshade Multidirectional' },
    { name: 'Tinted elevation', rasterFunction: 'Hillshade Elevation Tinted' },
    { name: 'Slope', rasterFunction: 'Slope Map' },
    { name: 'Aspect', rasterFunction: 'Aspect Map' },
    { name: '25 ft contours', rasterFunction: 'Contour 25' }
  ];
  const terrainLayers = new Map();
  const mapStyles = new Map();
  terrainStyles.forEach(style => {
    const layer = L.tileLayer('', {
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
    layer.getTileUrl = coords => {
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
        renderingRule: JSON.stringify({ rasterFunction: style.rasterFunction })
      });
      return `${endpoint}?${params.toString()}`;
    };
    terrainLayers.set(style.name, layer);
    mapStyles.set(style.name, L.layerGroup([streetLayer, layer]));
  });
  const mapStyleChoices = { 'Street map': streetLayer };
  mapStyles.forEach((layerGroup, name) => { mapStyleChoices[name] = layerGroup; });
  const mapStyleNames = new Map([...mapStyles].map(([name, layer]) => [layer, name]));
  let loadedTerrain = false;
  terrainLayers.forEach((layer, name) => {
    layer.on('tileload', () => {
      if (!map.hasLayer(layer)) return;
      loadedTerrain = true;
      if (!isProbingElevation && !isFindingWatershed) {
        statusElement.textContent = `USGS 3DEP ${name.toLowerCase()} active`;
      }
    });
    layer.on('tileerror', () => {
      if (map.hasLayer(layer) && !loadedTerrain) statusElement.textContent = 'USGS terrain tiles are temporarily unavailable. The street map is still usable.';
    });
  });
  mapStyles.get('Hillshade').addTo(map);
  L.control.layers(mapStyleChoices, {}, { collapsed: false, position: 'topright' }).addTo(map);
  map.on('baselayerchange', event => {
    const styleName = mapStyleNames.get(event.layer);
    if (styleName) {
      statusElement.textContent = `USGS 3DEP ${styleName.toLowerCase()} selected`;
      mapCaption.textContent = `USGS 3DEP · ${styleName.toUpperCase()}`;
    } else {
      statusElement.textContent = 'Street map selected';
      mapCaption.textContent = 'OPENSTREETMAP BASEMAP';
    }
    map.invalidateSize();
  });

  opacityInput.addEventListener('input', () => {
    const opacity = Number(opacityInput.value) / 100;
    terrainLayers.forEach(layer => layer.setOpacity(opacity));
    opacityValue.textContent = `${opacityInput.value}%`;
  });

  const comparePane = map.createPane('comparePane');
  comparePane.style.zIndex = '415';
  comparePane.style.pointerEvents = 'none';
  const watershedPane = map.createPane('watershedPane');
  watershedPane.style.zIndex = '425';
  const riverPane = map.createPane('riverPane');
  riverPane.style.zIndex = '435';
  const countyPane = map.createPane('countyPane');
  countyPane.style.zIndex = '440';
  const waybackReleases = new Map([
    ['43291', '2026-10-29'],
    ['16453', '2024-12-12'],
    ['45134', '2022-12-14'],
    ['29260', '2020-12-16'],
    ['23448', '2018-12-14'],
    ['18966', '2016-12-20'],
    ['5844', '2014-12-30']
  ]);
  const archivedReleaseIds = [...waybackReleases.keys()].reverse();
  const currentImageryUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const waybackImageryUrl = 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{release}/{z}/{y}/{x}';
  let imageryLayer;
  function createImageryLayer() {
    const release = imageryDate.value;
    const isCurrent = release === 'current';
    const url = isCurrent ? currentImageryUrl : waybackImageryUrl.replace('{release}', release);
    const date = waybackReleases.get(release);
    const attribution = isCurrent
      ? 'Imagery &copy; Esri, Vantor, Earthstar Geographics, and the GIS User Community'
      : `Imagery &copy; <a href="https://livingatlas.arcgis.com/wayback/" target="_blank" rel="noreferrer">Esri World Imagery Wayback</a> · Release ${date}`;
    return L.tileLayer(url, {
      pane: 'comparePane',
      maxZoom: 19,
      attribution
    });
  }
  imageryLayer = createImageryLayer();
  let timeLapseTimer;
  function stopTimeLapse() {
    if (timeLapseTimer) window.clearInterval(timeLapseTimer);
    timeLapseTimer = undefined;
    historyPlayButton.textContent = '▶ Play time-lapse';
    historyPlayButton.setAttribute('aria-pressed', 'false');
  }
  function syncHistoryControls() {
    const releaseIndex = archivedReleaseIds.indexOf(imageryDate.value);
    historyRange.value = String(releaseIndex < 0 ? archivedReleaseIds.length - 1 : releaseIndex);
    historyDate.value = releaseIndex < 0 ? '—' : waybackReleases.get(imageryDate.value);
    historyPlayButton.disabled = releaseIndex < 0;
  }
  function updateImageryLabel() {
    const option = imageryDate.options[imageryDate.selectedIndex];
    swipeDivider.querySelector('span').textContent = `← ${option.textContent.replace('Wayback release · ', 'WAYBACK · ').replace(' (latest)', '')}`;
  }
  updateImageryLabel();
  syncHistoryControls();
  function selectImagery(release, stopPlayback = true) {
    if (stopPlayback) stopTimeLapse();
    imageryDate.value = release;
    syncHistoryControls();
    updateImageryLabel();
    const enabled = map.hasLayer(imageryLayer);
    if (enabled) map.removeLayer(imageryLayer);
    imageryLayer = createImageryLayer();
    if (!enabled) return;
    imageryLayer.addTo(map);
    statusElement.textContent = imageryDate.value === 'current'
      ? 'Current Esri imagery shown in comparison'
      : `Esri Wayback imagery release ${waybackReleases.get(imageryDate.value)} shown`;
  }
  imageryDate.addEventListener('change', () => selectImagery(imageryDate.value));
  historyRange.addEventListener('input', () => {
    selectImagery(archivedReleaseIds[Number(historyRange.value)]);
  });
  historyPlayButton.addEventListener('click', () => {
    if (timeLapseTimer) {
      stopTimeLapse();
      return;
    }
    let releaseIndex = archivedReleaseIds.indexOf(imageryDate.value);
    if (releaseIndex < 0 || releaseIndex === archivedReleaseIds.length - 1) {
      releaseIndex = 0;
      selectImagery(archivedReleaseIds[releaseIndex], false);
    }
    historyPlayButton.textContent = 'Ⅱ Pause time-lapse';
    historyPlayButton.setAttribute('aria-pressed', 'true');
    timeLapseTimer = window.setInterval(() => {
      releaseIndex += 1;
      if (releaseIndex >= archivedReleaseIds.length) {
        stopTimeLapse();
        return;
      }
      selectImagery(archivedReleaseIds[releaseIndex], false);
    }, 2400);
  });
  function updateSwipe(position) {
    comparePane.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    swipeDivider.style.left = `${position}%`;
    swipeValue.textContent = `${position}%`;
  }
  updateSwipe(Number(swipeRange.value));
  swipeRange.addEventListener('input', () => updateSwipe(Number(swipeRange.value)));
  swipeToggle.addEventListener('click', () => {
    const enabled = !map.hasLayer(imageryLayer);
    if (enabled) imageryLayer.addTo(map);
    else map.removeLayer(imageryLayer);
    swipeToggle.setAttribute('aria-pressed', String(enabled));
    swipeToggle.textContent = enabled ? 'Hide imagery comparison' : 'Compare imagery ↔ terrain';
    imageryDateLabel.hidden = !enabled;
    historyControls.hidden = !enabled;
    swipeRangeLabel.hidden = !enabled;
    swipeDivider.hidden = !enabled;
    if (enabled) map.invalidateSize();
    else stopTimeLapse();
  });

  const profileLayer = L.featureGroup().addTo(map);
  const riverMarkerLayer = L.featureGroup().addTo(map);
  let isDrawingProfile = false;
  let isProbingElevation = false;
  let isFindingWatershed = false;
  let isFindingRivers = false;
  let isFindingCounty = false;
  let probeRequestId = 0;
  let watershedRequestId = 0;
  let riverRequestId = 0;
  let countyRequestId = 0;
  let lastProbeCoordinates;
  let stateRing;
  let probeMarker;
  let watershedLayer;
  let countyShape;
  let countyMarker;
  let watershedShape;
  let profilePoints = [];
  let profileRequestId = 0;
  let profileSamples = [];
  let profileAudioContext;
  let profileAudioNodes = [];
  let profileAudioTimer;
  function stopProfileAudio() {
    if (profileAudioTimer) window.clearTimeout(profileAudioTimer);
    profileAudioTimer = undefined;
    profileAudioNodes.forEach(node => {
      if (!node.ended) node.oscillator.stop();
    });
    profileAudioNodes = [];
    profileListenButton.textContent = '♫ Listen to the land';
    profileListenButton.setAttribute('aria-pressed', 'false');
  }
  function drawProfileLine() {
    profileLayer.clearLayers();
    profilePoints.forEach(point => L.circleMarker(point, {
      radius: 5, color: '#25392d', weight: 2, fillColor: '#bdcd72', fillOpacity: 1
    }).addTo(profileLayer));
    if (profilePoints.length > 1) {
      L.polyline(profilePoints, { color: '#bdcd72', weight: 3, opacity: 1 }).addTo(profileLayer);
    }
  }
  function startProfile() {
    profileRequestId += 1;
    stopProfileAudio();
    profileSamples = [];
    profileListenButton.disabled = true;
    profileDownloadButton.disabled = true;
    profilePoints = [];
    profileLayer.clearLayers();
    profilePanel.hidden = true;
    profileHint.textContent = 'Click along the map to draw a line. Choose at least two points.';
    profileStartButton.textContent = 'Drawing… click map';
    profileStartButton.disabled = true;
    profileFinishButton.disabled = false;
    profileClearButton.disabled = false;
    isDrawingProfile = true;
    map.doubleClickZoom.disable();
  }
  async function finishProfile() {
    if (!isDrawingProfile) return;
    isDrawingProfile = false;
    map.doubleClickZoom.enable();
    profileStartButton.disabled = false;
    profileStartButton.textContent = '＋ Draw elevation profile';
    profileFinishButton.disabled = true;
    if (profilePoints.length < 2) {
      profileHint.textContent = 'Add at least two points to sample the terrain.';
      return;
    }
    const requestId = ++profileRequestId;
    profilePanel.hidden = false;
    profileSummary.textContent = 'Sampling up to 32 USGS elevation points along your line…';
    profileHint.textContent = 'Line complete. Draw another to replace this profile.';
    try {
      const geometry = JSON.stringify({
        paths: [profilePoints.map(point => [point.lng, point.lat])],
        spatialReference: { wkid: 4326 }
      });
      const params = new URLSearchParams({
        geometry,
        geometryType: 'esriGeometryPolyline',
        sampleCount: '32',
        interpolation: 'RSP_BilinearInterpolation',
        outSR: '4326',
        returnFirstValueOnly: 'true',
        f: 'json'
      });
      const response = await fetch(`${sampleEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error(`Elevation request failed (${response.status})`);
      const result = await response.json();
      if (requestId !== profileRequestId) return;
      const samples = (result.samples || [])
        .filter(sample => Number.isFinite(Number(sample.value)))
        .sort((a, b) => a.locationId - b.locationId)
        .map(sample => ({
          elevation: Number(sample.value) * 3.28084,
          lat: sample.location.y,
          lon: sample.location.x
        }));
      if (samples.length < 2) throw new Error('Not enough elevation samples were available for this line.');
      let distance = 0;
      samples.forEach((sample, index) => {
        if (index) distance += distanceBetween(samples[index - 1], sample);
        sample.distance = distance;
      });
      profileSamples = samples;
      drawElevationChart(samples);
      const minimum = Math.min(...samples.map(sample => sample.elevation));
      const maximum = Math.max(...samples.map(sample => sample.elevation));
      profileSummary.textContent = `${(distance / 1609.344).toFixed(2)} mi · ${Math.round(minimum)}–${Math.round(maximum)} ft · ${samples.length} USGS samples`;
      profileListenButton.disabled = false;
      profileDownloadButton.disabled = false;
      profileHint.textContent = 'Elevation profile ready. Click “Draw elevation profile” to start a new line.';
    } catch (error) {
      if (requestId !== profileRequestId) return;
      console.error('Unable to build elevation profile:', error);
      profileSummary.textContent = error.message || 'Unable to load elevation samples.';
      profileHint.textContent = 'Could not load profile data. Please try a shorter line.';
    }
  }
  function distanceBetween(first, second) {
    const radians = value => value * Math.PI / 180;
    const dLat = radians(second.lat - first.lat);
    const dLon = radians(second.lon - first.lon);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(radians(first.lat)) * Math.cos(radians(second.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function isInsideSouthCarolina(lat, lon) {
    if (!stateRing) return false;
    let inside = false;
    for (let current = 0, previous = stateRing.length - 1; current < stateRing.length; previous = current++) {
      const [currentLat, currentLon] = stateRing[current];
      const [previousLat, previousLon] = stateRing[previous];
      const crossesLatitude = (currentLat > lat) !== (previousLat > lat);
      if (crossesLatitude && lon < (previousLon - currentLon) * (lat - currentLat) / (previousLat - currentLat) + currentLon) {
        inside = !inside;
      }
    }
    return inside;
  }
  async function sampleElevationAt(latlng) {
    const requestId = ++probeRequestId;
    const latitude = latlng.lat;
    const longitude = latlng.lng;
    if (!isInsideSouthCarolina(latitude, longitude)) {
      probeResult.textContent = 'That point is outside the South Carolina boundary. Tap the land inside the outline.';
      probeMeta.textContent = '';
      probeCopyButton.disabled = true;
      return;
    }
    lastProbeCoordinates = { latitude, longitude };
    probeResult.textContent = 'Sampling USGS 3DEP elevation…';
    probeMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
    probeCopyButton.disabled = true;
    const geometry = JSON.stringify({
      x: longitude,
      y: latitude,
      spatialReference: { wkid: 4326 }
    });
    const params = new URLSearchParams({
      geometry,
      geometryType: 'esriGeometryPoint',
      sampleCount: '1',
      interpolation: 'RSP_BilinearInterpolation',
      outSR: '4326',
      returnFirstValueOnly: 'true',
      f: 'json'
    });
    try {
      const response = await fetch(`${sampleEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error(`Elevation request failed (${response.status})`);
      const result = await response.json();
      if (requestId !== probeRequestId) return;
      const sample = (result.samples || []).find(item => Number.isFinite(Number(item.value)));
      if (!sample) throw new Error('No elevation sample is available at this point.');
      const elevationFeet = Number(sample.value) * 3.28084;
      const nearest = places
        .map(place => ({ place, distance: distanceBetween({ lat: latitude, lon: longitude }, place) }))
        .sort((first, second) => first.distance - second.distance)[0];
      probeResult.textContent = `${Math.round(elevationFeet).toLocaleString()} ft elevation`;
      probeMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W · about ${(nearest.distance / 1609.344).toFixed(1)} mi from ${nearest.place.name}`;
      probeCopyButton.disabled = false;
      if (probeMarker) map.removeLayer(probeMarker);
      probeMarker = L.circleMarker([latitude, longitude], {
        radius: 7, color: '#18231c', weight: 2, fillColor: '#bdcd72', fillOpacity: 1
      }).bindPopup(`<strong>${Math.round(elevationFeet).toLocaleString()} ft elevation</strong><br><span>USGS 3DEP</span>`).addTo(map);
      statusElement.textContent = 'USGS 3DEP point elevation sampled';
    } catch (error) {
      if (requestId !== probeRequestId) return;
      console.error('Unable to sample map-point elevation:', error);
      probeResult.textContent = error.message || 'Unable to sample elevation at this point.';
      probeMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
      probeCopyButton.disabled = false;
    }
  }
  async function findWatershedAt(latlng) {
    const requestId = ++watershedRequestId;
    const latitude = latlng.lat;
    const longitude = latlng.lng;
    if (watershedShape) map.removeLayer(watershedShape);
    if (watershedLayer) map.removeLayer(watershedLayer);
    watershedShape = undefined;
    watershedLayer = undefined;
    if (!isInsideSouthCarolina(latitude, longitude)) {
      watershedResult.textContent = 'That point is outside South Carolina. Click the land inside the state outline.';
      watershedMeta.textContent = '';
      return;
    }
    watershedResult.textContent = 'Tracing the upstream drainage area…';
    watershedMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
    const params = new URLSearchParams({
      geometry: JSON.stringify({
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }),
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'huc12,name,areasqkm,tohuc,states',
      returnGeometry: 'true',
      outSR: '4326',
      maxAllowableOffset: '0.0005',
      f: 'json'
    });
    try {
      const response = await fetch(`${watershedEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error(`Watershed request failed (${response.status})`);
      const result = await response.json();
      if (requestId !== watershedRequestId) return;
      if (result.error) throw new Error(result.error.message || 'The USGS watershed service returned an error.');
      const feature = (result.features || [])
        .filter(item => item.geometry && item.attributes && item.attributes.huc12)
        .sort((first, second) => Number(first.attributes.areasqkm) - Number(second.attributes.areasqkm))[0];
      if (!feature) throw new Error('No HUC 12 watershed boundary was found at this point.');
      if (watershedShape) map.removeLayer(watershedShape);
      watershedShape = L.geoJSON({
        type: 'Feature',
        properties: feature.attributes,
        geometry: {
          type: 'MultiPolygon',
          coordinates: feature.geometry.rings.map(ring => [ring.map(([x, y]) => [x, y])])
        }
      }, {
        pane: 'watershedPane',
        style: { color: '#bdcd72', weight: 3, opacity: 1, fillColor: '#bdcd72', fillOpacity: 0.22 }
      }).addTo(map);
      const attrs = feature.attributes;
      const areaSquareMiles = Number(attrs.areasqkm) * 0.386102;
      watershedResult.textContent = attrs.name || 'Unnamed subwatershed';
      watershedMeta.textContent = `HUC 12 · ${attrs.huc12} · ${areaSquareMiles.toLocaleString(undefined, { maximumFractionDigits: 1 })} sq mi · downstream HUC ${attrs.tohuc || 'not listed'}`;
      watershedLayer = L.circleMarker([latitude, longitude], {
        radius: 5, color: '#18231c', weight: 2, fillColor: '#f0efe8', fillOpacity: 1
      }).addTo(map);
      watershedShape.bindPopup(`<strong>${attrs.name || 'Unnamed subwatershed'}</strong><br><span>HUC 12 · ${attrs.huc12}</span>`);
      if (map.getZoom() < 9) map.flyTo([latitude, longitude], 9, { duration: 0.8 });
      statusElement.textContent = 'USGS HUC 12 watershed boundary shown';
    } catch (error) {
      if (requestId !== watershedRequestId) return;
      console.error('Unable to find USGS watershed boundary:', error);
      watershedResult.textContent = error.message || 'Unable to load the watershed boundary.';
      watershedMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
    }
  }
  async function findRiversAt(latlng) {
    const requestId = ++riverRequestId;
    riverMarkerLayer.clearLayers();
    riverReadings.replaceChildren();
    const latitude = latlng.lat;
    const longitude = latlng.lng;
    if (!isInsideSouthCarolina(latitude, longitude)) {
      riverResult.textContent = 'That point is outside South Carolina. Click the land inside the state outline.';
      return;
    }
    riverResult.textContent = 'Searching for recent USGS stream gauges within 30 miles…';
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const halfLatitude = 0.46;
    const halfLongitude = 0.56;
    const bbox = [
      longitude - halfLongitude,
      latitude - halfLatitude,
      longitude + halfLongitude,
      latitude + halfLatitude
    ].map(value => value.toFixed(5)).join(',');
    const requestObservations = async parameterCode => {
      const params = new URLSearchParams({
        f: 'json',
        limit: '3000',
        bbox,
        parameter_code: parameterCode,
        datetime: `${start.toISOString()}/${now.toISOString()}`,
        sortby: '-time'
      });
      const response = await fetch(`${waterDataEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error(`USGS gauge request failed (${response.status})`);
      const result = await response.json();
      if (result.code || result.type === 'InvalidParameterValue') {
        throw new Error(result.description || result.detail || 'The USGS water-data service returned an error.');
      }
      return result.features || [];
    };
    try {
      const [flowFeatures, stageFeatures] = await Promise.all([
        requestObservations('00060'),
        requestObservations('00065')
      ]);
      if (requestId !== riverRequestId) return;
      const latestBySite = new Map();
      flowFeatures.concat(stageFeatures).forEach(feature => {
        const properties = feature.properties || {};
        const coordinates = feature.geometry && feature.geometry.coordinates;
        if (!properties.monitoring_location_id || !coordinates || coordinates.length < 2) return;
        const key = `${properties.monitoring_location_id}:${properties.parameter_code}`;
        const observation = latestBySite.get(key);
        if (!observation || Date.parse(properties.time) > Date.parse(observation.properties.time)) {
          latestBySite.set(key, feature);
        }
      });
      const stations = new Map();
      latestBySite.forEach(feature => {
        const properties = feature.properties;
        const [lon, lat] = feature.geometry.coordinates;
        const site = stations.get(properties.monitoring_location_id) || {
          id: properties.monitoring_location_id,
          latitude: lat,
          longitude: lon
        };
        if (properties.parameter_code === '00060') site.flow = properties;
        if (properties.parameter_code === '00065') site.stage = properties;
        stations.set(site.id, site);
      });
      const nearby = [...stations.values()]
        .map(site => ({
          ...site,
          distance: distanceBetween(
            { lat: latitude, lon: longitude },
            { lat: site.latitude, lon: site.longitude }
          )
        }))
        .filter(site => site.flow && site.distance <= 30 * 1609.344)
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 3);
      if (!nearby.length) {
        riverResult.textContent = 'No stream gauges with readings in the past 24 hours were found within 30 miles. Try another point.';
        return;
      }
      const metadata = await Promise.all(nearby.map(async site => {
        const params = new URLSearchParams({ f: 'json', limit: '1', id: site.id });
        const response = await fetch(`${monitoringLocationsEndpoint}?${params.toString()}`);
        if (!response.ok) throw new Error(`USGS station-details request failed (${response.status})`);
        const result = await response.json();
        return result.features && result.features[0] && result.features[0].properties;
      }));
      if (requestId !== riverRequestId) return;
      riverResult.textContent = `Nearest reporting gauges · within 30 miles of ${latitude.toFixed(4)}° N, ${Math.abs(longitude).toFixed(4)}° W`;
      nearby.forEach((site, index) => {
        const details = metadata[index];
        const name = details && details.monitoring_location_name
          ? details.monitoring_location_name
          : `USGS site ${site.id}`;
        const card = document.createElement('article');
        card.className = 'river-card';
        const heading = document.createElement('h4');
        heading.textContent = name;
        card.append(heading);
        const values = document.createElement('p');
        const flowValue = Number(site.flow.value);
        const flowText = Number.isFinite(flowValue)
          ? `${flowValue.toLocaleString()} ${site.flow.unit_of_measure || 'ft^3/s'} flow`
          : `Flow ${site.flow.value} ${site.flow.unit_of_measure || ''}`;
        const stageValue = site.stage && Number(site.stage.value);
        const stageText = site.stage
          ? ` · ${Number.isFinite(stageValue) ? stageValue.toLocaleString() : site.stage.value} ${site.stage.unit_of_measure || 'ft'} stage`
          : '';
        values.textContent = `${flowText}${stageText}`;
        card.append(values);
        const observedAt = document.createElement('p');
        const observedDate = new Date(site.flow.time);
        const approval = site.flow.approval_status || 'Status not reported';
        observedAt.textContent = `${(site.distance / 1609.344).toFixed(1)} mi away · ${Number.isNaN(observedDate.getTime()) ? 'observation time unavailable' : observedDate.toLocaleString()} · ${approval}`;
        card.append(observedAt);
        const link = document.createElement('a');
        const siteNumber = /^USGS-(\d+)$/.exec(site.id);
        if (siteNumber) {
          link.href = `https://waterdata.usgs.gov/nwis/uv?site_no=${siteNumber[1]}`;
          link.target = '_blank';
          link.rel = 'noreferrer';
          link.textContent = `USGS site ${siteNumber[1]} ↗`;
          card.append(link);
        } else {
          const siteLabel = document.createElement('p');
          siteLabel.textContent = site.id;
          card.append(siteLabel);
        }
        riverReadings.append(card);
        L.circleMarker([site.latitude, site.longitude], {
          pane: 'riverPane', radius: 6, color: '#18231c', weight: 2, fillColor: '#d88753', fillOpacity: 1
        }).addTo(riverMarkerLayer);
      });
      statusElement.textContent = 'Nearby USGS river-gauge readings shown';
    } catch (error) {
      if (requestId !== riverRequestId) return;
      console.error('Unable to load nearby USGS river gauges:', error);
      riverResult.textContent = error.message || 'Unable to load nearby USGS river gauges.';
    }
  }
  function clearRiverPulse() {
    riverRequestId += 1;
    riverMarkerLayer.clearLayers();
    riverReadings.replaceChildren();
    riverResult.textContent = 'Turn on River pulse, then click a point inside South Carolina.';
    riverPanel.hidden = !isFindingRivers;
  }
  function clearCounty() {
    countyRequestId += 1;
    if (countyShape) map.removeLayer(countyShape);
    if (countyMarker) map.removeLayer(countyMarker);
    countyShape = undefined;
    countyMarker = undefined;
    countyResult.textContent = 'Turn on County Explorer, then click a point inside South Carolina.';
    countyMeta.textContent = '';
    countyPanel.hidden = !isFindingCounty;
  }
  async function findCountyAt(latlng) {
    const requestId = ++countyRequestId;
    if (countyShape) map.removeLayer(countyShape);
    if (countyMarker) map.removeLayer(countyMarker);
    countyShape = undefined;
    countyMarker = undefined;
    const latitude = latlng.lat;
    const longitude = latlng.lng;
    if (!isInsideSouthCarolina(latitude, longitude)) {
      countyResult.textContent = 'That point is outside South Carolina. Click the land inside the state outline.';
      countyMeta.textContent = '';
      return;
    }
    countyResult.textContent = 'Looking up the 2020 Census county…';
    countyMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
    const params = new URLSearchParams({
      geometry: JSON.stringify({
        x: longitude,
        y: latitude,
        spatialReference: { wkid: 4326 }
      }),
      geometryType: 'esriGeometryPoint',
      inSR: '4326',
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'NAME,GEOID,POP100,AREALAND',
      returnGeometry: 'true',
      outSR: '4326',
      maxAllowableOffset: '0.005',
      f: 'geojson'
    });
    try {
      const response = await fetch(`${countyQueryEndpoint}?${params.toString()}`);
      if (!response.ok) throw new Error(`Census county request failed (${response.status})`);
      const result = await response.json();
      if (requestId !== countyRequestId) return;
      if (result.error) throw new Error(result.error.message || 'The Census county service returned an error.');
      const feature = (result.features || []).find(item =>
        item.geometry && item.properties && item.properties.GEOID
      );
      if (!feature) throw new Error('No Census county boundary was found at this point.');
      countyShape = L.geoJSON(feature, {
        pane: 'countyPane',
        style: { color: '#f0a36f', weight: 3, opacity: 1, fillColor: '#f0a36f', fillOpacity: 0.2 },
        interactive: false
      }).addTo(map);
      countyMarker = L.circleMarker([latitude, longitude], {
        radius: 5, color: '#18231c', weight: 2, fillColor: '#f0efe8', fillOpacity: 1
      }).addTo(map);
      const attrs = feature.properties;
      const population = Number(attrs.POP100);
      const landAreaSquareMiles = Number(attrs.AREALAND) / 2589988.110336;
      const populationDensity = population / landAreaSquareMiles;
      countyResult.textContent = attrs.NAME || 'Unnamed county';
      countyMeta.textContent = [
        `2020 population · ${Number.isFinite(population) ? population.toLocaleString() : 'not reported'}`,
        `land area · ${Number.isFinite(landAreaSquareMiles) ? landAreaSquareMiles.toLocaleString(undefined, { maximumFractionDigits: 1 }) : 'not reported'} sq mi`,
        `density · ${Number.isFinite(populationDensity) ? Math.round(populationDensity).toLocaleString() : 'not reported'} people/sq mi`,
        `GEOID ${attrs.GEOID}`
      ].join(' · ');
      statusElement.textContent = `${attrs.NAME || 'Census county'} boundary shown`;
    } catch (error) {
      if (requestId !== countyRequestId) return;
      console.error('Unable to find Census county:', error);
      countyResult.textContent = error.message || 'Unable to load the Census county boundary.';
      countyMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W`;
    }
  }
  function clearWatershed() {
    watershedRequestId += 1;
    if (watershedShape) map.removeLayer(watershedShape);
    if (watershedLayer) map.removeLayer(watershedLayer);
    watershedShape = undefined;
    watershedLayer = undefined;
    watershedResult.textContent = 'Turn on the finder, then click a point inside South Carolina.';
    watershedMeta.textContent = '';
    watershedPanel.hidden = !isFindingWatershed;
  }
  watershedToggle.addEventListener('click', () => {
    const enabled = watershedToggle.getAttribute('aria-pressed') !== 'true';
    isFindingWatershed = enabled;
    if (!enabled) watershedRequestId += 1;
    probeRequestId += 1;
    isFindingCounty = false;
    countyToggle.setAttribute('aria-pressed', 'false');
    countyToggle.textContent = '▧ County Explorer';
    countyToggle.disabled = enabled;
    clearCounty();
    isFindingRivers = false;
    riverToggle.setAttribute('aria-pressed', 'false');
    riverToggle.textContent = '〰 River pulse';
    riverToggle.disabled = enabled;
    riverPanel.hidden = true;
    clearRiverPulse();
    watershedToggle.setAttribute('aria-pressed', String(enabled));
    watershedToggle.textContent = enabled ? '× Stop watershed finder' : '⌁ Watershed finder';
    isProbingElevation = false;
    probeToggle.setAttribute('aria-pressed', 'false');
    probeToggle.textContent = '⌖ Probe elevation';
    probePanel.hidden = true;
    isDrawingProfile = false;
    map.doubleClickZoom.enable();
    profileStartButton.disabled = enabled;
    profileStartButton.textContent = '＋ Draw elevation profile';
    profileFinishButton.disabled = true;
    probeToggle.disabled = enabled || !stateRing;
    watershedPanel.hidden = !enabled && !watershedShape;
    if (enabled) {
      watershedPanel.hidden = false;
      watershedResult.textContent = 'Click inside South Carolina to trace its HUC 12 drainage area.';
      watershedMeta.textContent = '';
      profileHint.textContent = 'Click a place inside South Carolina to trace its watershed boundary.';
    } else {
      profileHint.textContent = 'Draw a line on the map to see its elevation.';
    }
  });
  watershedClearButton.addEventListener('click', clearWatershed);
  riverToggle.addEventListener('click', () => {
    const enabled = riverToggle.getAttribute('aria-pressed') !== 'true';
    isFindingRivers = enabled;
    probeRequestId += 1;
    isFindingCounty = false;
    countyToggle.setAttribute('aria-pressed', 'false');
    countyToggle.textContent = '▧ County Explorer';
    countyToggle.disabled = enabled;
    clearCounty();
    riverToggle.setAttribute('aria-pressed', String(enabled));
    riverToggle.textContent = enabled ? '× Stop River pulse' : '〰 River pulse';
    riverPanel.hidden = !enabled;
    isProbingElevation = false;
    probeToggle.setAttribute('aria-pressed', 'false');
    probeToggle.textContent = '⌖ Probe elevation';
    probeToggle.disabled = enabled;
    probePanel.hidden = true;
    isFindingWatershed = false;
    watershedToggle.setAttribute('aria-pressed', 'false');
    watershedToggle.textContent = '⌁ Watershed finder';
    watershedToggle.disabled = enabled;
    clearWatershed();
    isDrawingProfile = false;
    map.doubleClickZoom.enable();
    profileStartButton.disabled = enabled;
    profileStartButton.textContent = '＋ Draw elevation profile';
    profileFinishButton.disabled = true;
    if (enabled) {
      clearRiverPulse();
      riverPanel.hidden = false;
      profileHint.textContent = 'Click inside South Carolina to find nearby USGS stream gauges.';
    } else {
      probeToggle.disabled = !stateRing;
      watershedToggle.disabled = !stateRing;
      profileHint.textContent = 'Draw a line on the map to see its elevation.';
    }
  });
  riverClearButton.addEventListener('click', clearRiverPulse);
  countyToggle.addEventListener('click', () => {
    const enabled = countyToggle.getAttribute('aria-pressed') !== 'true';
    isFindingCounty = enabled;
    isProbingElevation = false;
    probeRequestId += 1;
    probeToggle.setAttribute('aria-pressed', 'false');
    probeToggle.textContent = '⌖ Probe elevation';
    probeToggle.disabled = enabled;
    probePanel.hidden = true;
    isFindingWatershed = false;
    watershedRequestId += 1;
    watershedToggle.setAttribute('aria-pressed', 'false');
    watershedToggle.textContent = '⌁ Watershed finder';
    watershedToggle.disabled = enabled;
    clearWatershed();
    isFindingRivers = false;
    riverToggle.setAttribute('aria-pressed', 'false');
    riverToggle.textContent = '〰 River pulse';
    riverToggle.disabled = enabled;
    clearRiverPulse();
    isDrawingProfile = false;
    map.doubleClickZoom.enable();
    profileStartButton.disabled = enabled;
    profileStartButton.textContent = '＋ Draw elevation profile';
    profileFinishButton.disabled = true;
    countyToggle.setAttribute('aria-pressed', String(enabled));
    countyToggle.textContent = enabled ? '× Stop County Explorer' : '▧ County Explorer';
    if (enabled) {
      clearCounty();
      countyPanel.hidden = false;
      countyResult.textContent = 'Click anywhere inside South Carolina to identify its county.';
      countyMeta.textContent = '';
      profileHint.textContent = 'Click a place inside South Carolina to explore its Census county.';
    } else {
      probeToggle.disabled = !stateRing;
      watershedToggle.disabled = !stateRing;
      riverToggle.disabled = !stateRing;
      profileHint.textContent = 'Draw a line on the map to see its elevation.';
    }
    countyPanel.hidden = !enabled && !countyShape;
  });
  countyClearButton.addEventListener('click', clearCounty);
  probeToggle.addEventListener('click', () => {
    isProbingElevation = !isProbingElevation;
    watershedRequestId += 1;
    isFindingCounty = false;
    countyRequestId += 1;
    countyToggle.setAttribute('aria-pressed', 'false');
    countyToggle.textContent = '▧ County Explorer';
    countyToggle.disabled = isProbingElevation;
    countyPanel.hidden = true;
    if (isProbingElevation && isDrawingProfile) {
      isDrawingProfile = false;
      map.doubleClickZoom.enable();
      profileStartButton.textContent = '＋ Draw elevation profile';
    }
    probeToggle.setAttribute('aria-pressed', String(isProbingElevation));
    probeToggle.textContent = isProbingElevation ? '× Stop elevation probe' : '⌖ Probe elevation';
    watershedToggle.setAttribute('aria-pressed', 'false');
    watershedToggle.textContent = '⌁ Watershed finder';
    isFindingWatershed = false;
    watershedToggle.disabled = isProbingElevation;
    isFindingRivers = false;
    riverToggle.setAttribute('aria-pressed', 'false');
    riverToggle.textContent = '〰 River pulse';
    riverToggle.disabled = isProbingElevation;
    riverPanel.hidden = true;
    clearRiverPulse();
    profileStartButton.disabled = isProbingElevation;
    profileFinishButton.disabled = isProbingElevation || !isDrawingProfile;
    profileHint.textContent = isProbingElevation
      ? 'Tap a point inside South Carolina to sample its ground elevation.'
      : 'Draw a line on the map to see its elevation.';
    probePanel.hidden = !isProbingElevation && !lastProbeCoordinates;
    if (isProbingElevation) {
      probePanel.hidden = false;
      probeResult.textContent = 'Tap a point inside South Carolina to sample its elevation.';
      probeMeta.textContent = '';
    }
  });
  probeCopyButton.addEventListener('click', async () => {
    if (!lastProbeCoordinates) return;
    const { latitude, longitude } = lastProbeCoordinates;
    try {
      await navigator.clipboard.writeText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      probeMeta.textContent = `${latitude.toFixed(5)}° N, ${Math.abs(longitude).toFixed(5)}° W · coordinates copied`;
    } catch (error) {
      console.error('Unable to copy probe coordinates:', error);
      probeMeta.textContent = 'Copy failed. Select coordinates: ' +
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  });
  function drawElevationChart(samples) {
    const context = profileCanvas.getContext('2d');
    const bounds = profileCanvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    profileCanvas.width = Math.max(1, Math.round(bounds.width * ratio));
    profileCanvas.height = Math.max(1, Math.round(bounds.height * ratio));
    context.scale(ratio, ratio);
    const width = bounds.width;
    const height = bounds.height;
    const padding = { top: 16, right: 18, bottom: 32, left: 48 };
    const values = samples.map(sample => sample.elevation);
    const minimum = Math.floor(Math.min(...values) / 50) * 50;
    const maximum = Math.ceil(Math.max(...values) / 50) * 50 || minimum + 50;
    const range = Math.max(maximum - minimum, 50);
    const x = value => padding.left + value / Math.max(samples[samples.length - 1].distance, 1) * (width - padding.left - padding.right);
    const y = value => height - padding.bottom - (value - minimum) / range * (height - padding.top - padding.bottom);
    context.clearRect(0, 0, width, height);
    context.font = '9px "DM Mono", monospace';
    context.fillStyle = '#777c70';
    context.strokeStyle = 'rgba(19,24,19,.14)';
    context.lineWidth = 1;
    for (let tick = 0; tick <= 2; tick += 1) {
      const elevation = minimum + range * tick / 2;
      const posY = y(elevation);
      context.beginPath();
      context.moveTo(padding.left, posY);
      context.lineTo(width - padding.right, posY);
      context.stroke();
      context.fillText(`${Math.round(elevation)} ft`, 2, posY + 3);
    }
    const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(189,205,114,.38)');
    gradient.addColorStop(1, 'rgba(189,205,114,.02)');
    context.beginPath();
    samples.forEach((sample, index) => {
      const pointX = x(sample.distance);
      const pointY = y(sample.elevation);
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    });
    context.lineTo(x(samples[samples.length - 1].distance), height - padding.bottom);
    context.lineTo(x(0), height - padding.bottom);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();
    context.beginPath();
    samples.forEach((sample, index) => {
      if (index === 0) context.moveTo(x(sample.distance), y(sample.elevation));
      else context.lineTo(x(sample.distance), y(sample.elevation));
    });
    context.strokeStyle = '#52623e';
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = '#52623e';
    context.textAlign = 'left';
    context.fillText('0 mi', padding.left, height - 8);
    context.textAlign = 'right';
    context.fillText(`${(samples[samples.length - 1].distance / 1609.344).toFixed(1)} mi`, width - padding.right, height - 8);
  }
  profileListenButton.addEventListener('click', async () => {
    if (profileAudioNodes.length) {
      stopProfileAudio();
      profileSummary.textContent = 'Terrain soundscape stopped.';
      return;
    }
    if (profileSamples.length < 2) return;
    profileListenButton.disabled = true;
    try {
      const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextConstructor) throw new Error('This browser does not support audio playback.');
      profileAudioContext = profileAudioContext || new AudioContextConstructor();
      await profileAudioContext.resume();
      const minElevation = Math.min(...profileSamples.map(sample => sample.elevation));
      const elevationRange = Math.max(...profileSamples.map(sample => sample.elevation)) - minElevation;
      const startTime = profileAudioContext.currentTime + 0.08;
      const interval = 0.22;
      profileAudioNodes = profileSamples.map((sample, index) => {
        const oscillator = profileAudioContext.createOscillator();
        const gain = profileAudioContext.createGain();
        const panner = profileAudioContext.createStereoPanner();
        const normalizedElevation = elevationRange
          ? (sample.elevation - minElevation) / elevationRange
          : 0.5;
        const noteStart = startTime + index * interval;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220 + normalizedElevation * 440, noteStart);
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.055, noteStart + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.19);
        panner.pan.setValueAtTime(profileSamples.length > 1 ? index / (profileSamples.length - 1) * 2 - 1 : 0, noteStart);
        oscillator.connect(gain).connect(panner).connect(profileAudioContext.destination);
        const node = { oscillator, ended: false };
        oscillator.onended = () => {
          node.ended = true;
          if (profileAudioNodes.length && profileAudioNodes.every(item => item.ended)) stopProfileAudio();
        };
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.21);
        return node;
      });
      profileListenButton.textContent = '■ Stop soundscape';
      profileListenButton.disabled = false;
      profileListenButton.setAttribute('aria-pressed', 'true');
      profileSummary.textContent = 'Listening: low ground sounds low; higher terrain rises in pitch and moves along the route.';
      profileAudioTimer = window.setTimeout(stopProfileAudio, profileSamples.length * interval * 1000 + 500);
    } catch (error) {
      stopProfileAudio();
      profileListenButton.disabled = profileSamples.length < 2;
      console.error('Unable to play the terrain soundscape:', error);
      profileSummary.textContent = error.message || 'Unable to play audio in this browser.';
    }
  });
  profileDownloadButton.addEventListener('click', () => {
    if (profileSamples.length < 2) return;
    const rows = [
      'distance_miles,elevation_feet,latitude,longitude',
      ...profileSamples.map(sample => [
        (sample.distance / 1609.344).toFixed(4),
        sample.elevation.toFixed(2),
        sample.lat.toFixed(6),
        sample.lon.toFixed(6)
      ].join(','))
    ];
    const file = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'south-carolina-elevation-profile.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  map.on('click', event => {
    if (isFindingCounty) {
      findCountyAt(event.latlng);
      return;
    }
    if (isFindingRivers) {
      findRiversAt(event.latlng);
      return;
    }
    if (isFindingWatershed) {
      findWatershedAt(event.latlng);
      return;
    }
    if (isProbingElevation) {
      sampleElevationAt(event.latlng);
      return;
    }
    if (!isDrawingProfile) return;
    if (profilePoints.length >= 20) {
      profileHint.textContent = 'Line point limit reached. Finish the profile or clear it to start again.';
      return;
    }
    profilePoints.push(event.latlng);
    drawProfileLine();
    profileHint.textContent = `${profilePoints.length} point${profilePoints.length === 1 ? '' : 's'} added. Continue drawing or choose “Finish line”.`;
  });
  map.on('dblclick', () => {
    if (isDrawingProfile) finishProfile();
  });
  profileStartButton.addEventListener('click', startProfile);
  profileFinishButton.addEventListener('click', finishProfile);
  profileClearButton.addEventListener('click', () => {
    profileRequestId += 1;
    stopProfileAudio();
    profileSamples = [];
    isDrawingProfile = false;
    map.doubleClickZoom.enable();
    profilePoints = [];
    profileLayer.clearLayers();
    profilePanel.hidden = true;
    profileSummary.textContent = 'Draw at least two points to sample the terrain.';
    profileListenButton.disabled = true;
    profileDownloadButton.disabled = true;
    profileHint.textContent = 'Draw a line on the map to see its elevation.';
    profileStartButton.disabled = false;
    profileStartButton.textContent = '＋ Draw elevation profile';
    profileFinishButton.disabled = true;
    profileClearButton.disabled = true;
  });

  const markerIcon = L.divIcon({ className: 'place-pin-shell', html: '<span class="place-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
  const markers = places.map(place => {
    const marker = L.marker([place.lat, place.lon], { icon: markerIcon, title: `${place.name}, ${place.region}` });
    marker.bindPopup(`<strong>${place.name}</strong><br><span>${place.region} · ${place.note}</span>`, { maxWidth: 250 });
    marker.on('click', () => map.setView([place.lat, place.lon], Math.max(map.getZoom(), 11)));
    marker.addTo(map);
    return marker;
  });

  const terrainQuest = [
    {
      place: 1,
      clue: 'Up in the Blue Ridge, look for a narrow high crest with steep, branching valleys dropping away on both sides.',
      question: 'Which landform pattern best fits this terrain?',
      choices: ['A mountain ridge cut by stream valleys', 'A flat coastal floodplain', 'A tidal creek marsh'],
      answer: 0,
      note: 'The Blue Ridge edge has the state’s strongest relief: steep slopes and ridgelines stand out clearly in hillshade.'
    },
    {
      place: 4,
      clue: 'In the Midlands, the ground opens into a broad, low, nearly level basin, crossed by a wandering river and traces of older channels.',
      question: 'What landscape is the terrain revealing?',
      choices: ['A barrier island dune field', 'A river floodplain', 'A mountain gap'],
      answer: 1,
      note: 'Congaree’s floodplain is shaped by periodic river flooding. Subtle abandoned channels and natural levees can appear in detailed elevation data.'
    },
    {
      place: 7,
      clue: 'On the coast, many thin, branching channels lace through an exceptionally flat landscape before reaching open water.',
      question: 'What carved this branching pattern?',
      choices: ['Tidal creeks crossing a salt marsh', 'A glacial meltwater fan', 'A steep mountain stream network'],
      answer: 0,
      note: 'The Santee Delta’s tidal creek network drains and floods the surrounding marsh; the fine texture contrasts with the flatter marsh surfaces.'
    },
    {
      place: 9,
      clue: 'In the Lowcountry, three named rivers wind through one vast coastal basin toward the sea.',
      question: 'Which rivers give this basin its name?',
      choices: ['Broad, Saluda, and Catawba', 'Ashepoo, Combahee, and Edisto', 'Congaree, Wateree, and Pee Dee'],
      answer: 1,
      note: 'ACE stands for Ashepoo, Combahee, and Edisto. Their connected tidal river basin is a defining Lowcountry landscape.'
    }
  ];
  let questIndex = 0;
  let questScore = 0;
  let selectedQuestAnswer = -1;
  function renderQuest() {
    const stop = terrainQuest[questIndex];
    const place = places[stop.place];
    selectedQuestAnswer = -1;
    questProgress.textContent = `FIELD STOP ${questIndex + 1} / ${terrainQuest.length} · ${questScore} FOUND`;
    questClue.textContent = stop.clue;
    questFocusButton.textContent = `Scout near ${place.name} ↗`;
    questAnswers.innerHTML = `<p class="quest-question">${stop.question}</p>${stop.choices.map((choice, index) => `
      <button class="quest-choice" type="button" data-choice="${index}" aria-pressed="false">${choice}</button>`).join('')}`;
    questAnswers.querySelectorAll('.quest-choice').forEach(button => button.addEventListener('click', () => {
      if (!questNextButton.hidden) return;
      selectedQuestAnswer = Number(button.dataset.choice);
      questAnswers.querySelectorAll('.quest-choice').forEach(choice => {
        choice.setAttribute('aria-pressed', String(choice === button));
      });
      questCheckButton.disabled = false;
    }));
    questCheckButton.disabled = true;
    questCheckButton.hidden = false;
    questNextButton.hidden = true;
    questFeedback.textContent = '';
  }
  questStartButton.addEventListener('click', () => {
    questIndex = 0;
    questScore = 0;
    questPanel.hidden = false;
    questStartButton.textContent = '↻ Restart terrain quest';
    renderQuest();
    questPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  questFocusButton.addEventListener('click', () => {
    const placeIndex = terrainQuest[questIndex].place;
    const place = places[placeIndex];
    map.flyTo([place.lat, place.lon], 12, { duration: 0.8 });
    markers[placeIndex].openPopup();
  });
  questCheckButton.addEventListener('click', () => {
    if (selectedQuestAnswer < 0) return;
    const stop = terrainQuest[questIndex];
    const correct = selectedQuestAnswer === stop.answer;
    if (correct) questScore += 1;
    questProgress.textContent = `FIELD STOP ${questIndex + 1} / ${terrainQuest.length} · ${questScore} FOUND`;
    questFeedback.textContent = `${correct ? 'You read it right.' : `Not quite — the answer is “${stop.choices[stop.answer]}.”`} ${stop.note}`;
    questCheckButton.hidden = true;
    questNextButton.hidden = false;
    questNextButton.textContent = questIndex === terrainQuest.length - 1
      ? `Finish quest · ${questScore}/${terrainQuest.length} found`
      : 'Next field stop →';
  });
  questNextButton.addEventListener('click', () => {
    if (questIndex === terrainQuest.length - 1) {
      questPanel.hidden = true;
      questStartButton.textContent = `✦ Quest complete · ${questScore}/${terrainQuest.length}`;
      return;
    }
    questIndex += 1;
    renderQuest();
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
      stateRing = stateFeature.geometry.coordinates[0].map(([longitude, latitude]) => [latitude, longitude]);
      probeToggle.disabled = false;
      watershedToggle.disabled = false;
      riverToggle.disabled = false;
      countyToggle.disabled = false;
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