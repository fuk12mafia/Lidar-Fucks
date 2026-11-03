# LiDAR Atlas

A responsive, static editorial atlas for exploring the shape of the land. It uses live hillshade images rendered from the USGS 3D Elevation Program (3DEP) ImageServer and links visitors to the USGS LiDAR Explorer.

## Run locally

Open `index.html` in a browser, or serve this directory with any static file server, for example:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Imagery and data notes

Imagery is requested directly from the [USGS 3DEP dynamic image service](https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer), using its `Hillshade Gray` raster function. This is a multi-resolution, multi-source bare-earth elevation service. Coverage and source vary by location; the interface does not claim each featured view is LiDAR-derived. Consult the [USGS LiDAR Explorer](https://apps.nationalmap.gov/lidar-explorer/) for dataset coverage, source, and acquisition details. Images require an internet connection and are subject to USGS service availability.

No local image assets or build dependencies are required.
