# South Carolina LiDAR Atlas

A responsive, statewide terrain atlas for South Carolina. The interactive map is centered and bounded around the Palmetto State, with live USGS 3DEP bare-earth hillshade tiles, a generalized state outline, searchable places, and zoomable coverage across the state.

## Run locally

Open `index.html` in a browser using a local static web server (the state boundary is loaded as a local GeoJSON file, so a `file://` URL may block it). For example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data sources and imagery

- Terrain tiles are dynamically rendered from the [USGS 3DEP ImageServer](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer), using the `Hillshade Gray` raster function. This is a multi-resolution, multi-source bare-earth elevation service; not every location is necessarily LiDAR-derived. Consult the [USGS LiDAR Explorer](https://apps.nationalmap.gov/lidar-explorer/) for project coverage, survey source, and acquisition details.
- The simplified South Carolina state outline is from [U.S. Census TIGERweb](https://tigerweb.geo.census.gov/).
- The street basemap is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- Map controls use [Leaflet](https://leafletjs.com/).

Images and map tiles load from their public source services at runtime and require an internet connection. No paid or paywalled imagery is copied or bundled.