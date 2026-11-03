# South Carolina LiDAR Atlas

A responsive, statewide terrain atlas for South Carolina. The interactive map is centered and bounded around the Palmetto State, with live USGS 3DEP elevation styles, a swipeable aerial comparison, elevation profiles drawn along user-selected routes, a generalized state outline, and searchable places.

## Run locally

Open `index.html` in a browser using a local static web server (the state boundary is loaded as a local GeoJSON file, so a `file://` URL may block it). For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data sources and imagery

- Terrain tiles and profile samples are dynamically rendered from the [USGS 3DEP ImageServer](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer). Available map styles include hillshade, multidirectional hillshade, tinted elevation, slope, aspect, and contours. The service is a multi-resolution, multi-source bare-earth elevation service; not every location is necessarily LiDAR-derived. Consult the [USGS LiDAR Explorer](https://apps.nationalmap.gov/lidar-explorer/) for project coverage, survey source, and acquisition details.
- The simplified South Carolina state outline is from [U.S. Census TIGERweb](https://tigerweb.geo.census.gov/).
- The street basemap is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). Swipe comparison imagery is from Esri World Imagery; source credits are shown in the map attribution.
- Map controls use [Leaflet](https://leafletjs.com/).

Elevation profiles use the USGS ImageServer `getSamples` operation and chart sampled points along a drawn line. Map imagery and elevation profiles load from their source services at runtime and require an internet connection. No paid or paywalled imagery is copied or bundled.