const places = [
  { id: 'delta', number: '01', name: 'Mississippi Delta', region: 'Louisiana · USA', category: 'coast', coords: '29.95° N, 90.08° W', bbox: [-91.5, 29.8, -90.5, 30.5], summary: 'Waterways braid across a low, shifting landscape at the edge of the Gulf.', detail: 'A broad view across southeast Louisiana, where the river delta meets the Gulf Coast. Low relief and water define this landscape. The image is a USGS 3DEP hillshade render; check the explorer for local source and acquisition details.', color: 'MOSS / 01' },
  { id: 'olympic', number: '02', name: 'Olympic Peninsula', region: 'Washington · USA', category: 'mountain', coords: '47.80° N, 123.60° W', bbox: [-124.0, 47.4, -123.2, 48.2], summary: 'Dense folds and river valleys gather beneath the Olympic range.', detail: 'The Olympic Peninsula is a meeting of steep relief, deep forest, and the Pacific. Shaded elevation makes the drainage patterns and folds in the terrain easier to read.', color: 'FERN / 02' },
  { id: 'everglades', number: '03', name: 'Everglades Edge', region: 'Florida · USA', category: 'coast', coords: '25.85° N, 80.75° W', bbox: [-81.2, 25.55, -80.3, 26.15], summary: 'A subtle topography where wetlands, coast, and open water blur together.', detail: 'South Florida is famously low and nearly level. Bare-earth elevation models can reveal small changes in slope that shape how water moves across the Everglades and toward the coast.', color: 'SILT / 03' },
  { id: 'appalachia', number: '04', name: 'Appalachian Ridges', region: 'West Virginia · USA', category: 'mountain', coords: '38.30° N, 80.00° W', bbox: [-80.5, 37.9, -79.5, 38.7], summary: 'A long rhythm of parallel ridgelines, hollows, and branching creeks.', detail: 'The folded ridges of the central Appalachians make a compelling study in drainage and slope. This hillshade emphasizes the repeating grain of the land.', color: 'SLATE / 04' },
  { id: 'sanfrancisco', number: '05', name: 'San Francisco Bay', region: 'California · USA', category: 'heritage', coords: '37.77° N, 122.42° W', bbox: [-122.8, 37.55, -122.1, 38.05], summary: 'A meeting of hills, shoreline, and a city built into the contours.', detail: 'The Bay Area combines steep coastal hills with a densely engineered shoreline. Bare-earth models can help distinguish natural relief from the places where the ground has been reshaped.', color: 'BASALT / 05' },
  { id: 'redrock', number: '06', name: 'Red Rock Country', region: 'Utah · USA', category: 'heritage', coords: '37.20° N, 112.98° W', bbox: [-113.4, 36.9, -112.55, 37.5], summary: 'Canyons and plateaus carve a dramatic cross-section through the Colorado Plateau.', detail: 'Southern Utah’s deeply incised terrain shows how water cuts through layered rock. This regional view is useful for exploring relief; it is not a geological interpretation or a claim about a specific LiDAR survey.', color: 'OCHRE / 06' }
];
const endpoint = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage';
function imageUrl(bbox, width = 1100, height = 700) {
  const params = new URLSearchParams({
    bbox: bbox.join(','), bboxSR: '4326', size: `${width},${height}`, imageSR: '4326',
    format: 'jpgpng', f: 'image', renderingRule: JSON.stringify({ rasterFunction: 'Hillshade Gray' })
  });
  return `${endpoint}?${params.toString()}`;
}
const grid = document.querySelector('#card-grid');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty-state');
const count = document.querySelector('#result-count');
const filters = [...document.querySelectorAll('.filter')];
const dialog = document.querySelector('#detail-dialog');
let activeFilter = 'all';
function render() {
  const query = search.value.trim().toLowerCase();
  const filtered = places.filter(place => (activeFilter === 'all' || place.category === activeFilter) && `${place.name} ${place.region} ${place.summary}`.toLowerCase().includes(query));
  grid.innerHTML = filtered.map(place => `
    <article class="place-card" tabindex="0" role="button" aria-label="View ${place.name} details" data-id="${place.id}">
      <div class="card-art"><img src="${imageUrl(place.bbox)}" alt="USGS 3DEP shaded elevation view near ${place.name}" loading="lazy"><span class="card-number">FIELD NOTE ${place.number}</span><span class="image-credit">${place.color} · USGS 3DEP</span><span class="card-open" aria-hidden="true">↗</span></div>
      <div class="card-meta"><div><p class="card-region">${place.region}</p><h3 class="card-title">${place.name}</h3></div><span class="card-coordinate">${place.coords}</span></div>
      <p class="card-summary">${place.summary}</p>
    </article>`).join('');
  count.textContent = String(filtered.length).padStart(2, '0');
  empty.hidden = filtered.length !== 0;
  grid.querySelectorAll('.place-card').forEach(card => {
    const open = () => showPlace(places.find(place => place.id === card.dataset.id));
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
  });
}
function showPlace(place) {
  if (!place) return;
  document.querySelector('#dialog-region').textContent = `${place.region} · FIELD NOTE ${place.number}`;
  document.querySelector('#dialog-title').textContent = place.name;
  document.querySelector('#dialog-description').textContent = place.detail;
  document.querySelector('#dialog-coords').textContent = place.coords;
  document.querySelector('#dialog-image').src = imageUrl(place.bbox, 1300, 900);
  document.querySelector('#dialog-image').alt = `USGS 3DEP hillshade near ${place.name}`;
  const source = document.querySelector('#dialog-source');
  source.href = `https://apps.nationalmap.gov/lidar-explorer/`;
  dialog.showModal();
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(item => { const selected = item === button; item.classList.toggle('active', selected); item.setAttribute('aria-pressed', String(selected)); });
  render();
}));
search.addEventListener('input', render);
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && dialog.open) dialog.close();
});
document.querySelector('#hero-image').src = imageUrl([-113.4, 36.9, -112.55, 37.5], 1800, 1100);
document.querySelector('#method-image').src = imageUrl([-80.5, 37.9, -79.5, 38.7], 1100, 800);
render();
