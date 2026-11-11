# South Carolina LiDAR Atlas

A responsive, statewide terrain atlas for South Carolina. The interactive map is centered and bounded around the Palmetto State, with live USGS 3DEP elevation styles, a tap-to-sample elevation probe, neighborhood Terrain DNA fingerprints, an opt-in isometric terrain model, a USGS HUC 12 watershed finder, nearby USGS streamflow and river-stage readings, a Census county explorer, active National Weather Service flood alerts, a swipeable current or historical imagery comparison with a playable archive time-lapse, a four-stop terrain-reading quest, playable sonification and CSV export for elevation profiles, a generalized state outline, and searchable places.

## Run locally

Open `index.html` in a browser using a local static web server (the state boundary is loaded as a local GeoJSON file, so a `file://` URL may block it). For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data sources and imagery

- Terrain tiles and profile samples are dynamically rendered from the [USGS 3DEP ImageServer](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer). Available map styles include hillshade, multidirectional hillshade, tinted elevation, slope, aspect, and contours. The service is a multi-resolution, multi-source bare-earth elevation service; not every location is necessarily LiDAR-derived. Consult the [USGS LiDAR Explorer](https://apps.nationalmap.gov/lidar-explorer/) for project coverage, survey source, and acquisition details.
- Terrain flyover samples a 25 × 25 point grid over an approximately 1.5 km footprint with the USGS 3DEP ImageServer `getSamples` operation, then draws a rotatable isometric surface in the browser. The view exaggerates vertical relief for legibility; source resolution varies by location, and the model is exploratory rather than survey-grade.
- The simplified South Carolina state outline is from [U.S. Census TIGERweb](https://tigerweb.geo.census.gov/).
- The watershed finder queries USGS [Watershed Boundary Dataset](https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer) 12-digit subwatershed polygons and reports the mapped name, HUC, area, and downstream HUC. WBD boundaries are for geographic display and analysis, not site-specific regulatory determinations.
- River Pulse queries the USGS [Water Data APIs](https://api.waterdata.usgs.gov/ogcapi/v1/collections/continuous) for recent streamflow and gage-height observations, then shows the nearest reporting gauges within 30 miles of a clicked in-state point. Results are observations, may be provisional, and are not flood warnings or safety guidance.
- County Explorer identifies the 2020 Census county at a clicked in-state point, highlights its boundary, and reports decennial population, land area, and derived population density from [U.S. Census TIGERweb](https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer). Population is a 2020 Census snapshot, not a current estimate.
- Flood Watch fetches active flood-related alerts and mapped alert areas from the [National Weather Service API](https://api.weather.gov/alerts/active?area=SC) on demand. It is an awareness layer only, not a forecast or emergency service; follow official NWS instructions and local authorities.
- The street basemap is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Swipe comparison imagery can use current Esri World Imagery or dated releases from [Esri World Imagery Wayback](https://livingatlas.arcgis.com/wayback/); source credits are shown in the map attribution. Wayback release dates are archive version dates, not necessarily image acquisition dates, and imagery coverage and capture dates vary by location.
- The imagery time-lapse scrubs and plays the archive releases included in the comparison. It is a sequence of archive versions, not a continuous annual record; use the displayed release dates as version dates rather than capture dates.
- The terrain quest is a curated educational activity about recognizable South Carolina landforms at the Blue Ridge, Congaree floodplain, Santee Delta, and ACE Basin. It is an interpretation guide, not a survey or a substitute for source data.
- Map controls use [Leaflet](https://leafletjs.com/).

Elevation profiles use the USGS ImageServer `getSamples` operation and chart sampled points along a drawn line. Map imagery and elevation profiles load from their source services at runtime and require an internet connection. No paid or paywalled imagery is copied or bundled.

The profile soundscape uses browser-generated tones rather than a recording: pitch follows sampled elevation and stereo position follows progress along the route. Profile CSV downloads include cumulative distance, elevation, and sample coordinates.

The elevation probe uses the USGS ImageServer `getSamples` point operation for clicks inside South Carolina, converts returned meters to feet, and reports the nearest curated atlas place. It does not claim sub-meter accuracy; resolution varies across the statewide service.

Terrain DNA samples a 7 × 7 grid from the USGS 3DEP ImageServer around a clicked point, colors a compact neighborhood fingerprint, and summarizes local relief and average neighboring elevation change. The grid covers roughly 1.5 km, filters samples outside the state, and is exploratory rather than survey-grade; resolution varies across the statewide service.