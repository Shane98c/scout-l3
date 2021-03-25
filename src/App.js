import "./App.css";
import mapboxgl from "mapbox-gl/dist/mapbox-gl-dev";
import { useEffect, useState, useRef } from "react";
import auth from "@planet/client/api/auth";
import filter from "@planet/client/api/filter";
import items from "@planet/client/api/items";
import { email, password, key, mbAccess } from "./_config";

mapboxgl.accessToken = mbAccess;

const App = () => {
  const mapContainer = useRef();

  const getFootprints = async (map) => {
    const url =
      "https://api.planet.com/data/v1/quick-search?_sort=acquired asc&_page_size=5";

    await auth.login(email, password);
    await auth.setKey(key);
    const footprints = await items.search({
      types: ["PSScene4Band"],
      filter: {
        config: [
          {
            config: {
              coordinates: [
                [
                  [-97.082983, 48.891166],
                  [-95.555521, 48.004066],
                  [-95.314343, 47.685243],
                  [-94.459257, 47.384255],
                  [-93.706489, 46.956977],
                  [-92.902562, 46.942009],
                  [-92.149793, 46.872107],
                  [-92.931795, 46.415522],
                  [-94.744286, 46.72702],
                  [-95.248567, 47.071586],
                  [-96.07442, 47.690162],
                  [-96.651786, 48.07248],
                  [-97.082983, 48.891166],
                ],
              ],
              type: "Polygon",
            },
            field_name: "geometry",
            type: "GeometryFilter",
          },
          {
            config: [
              {
                config: [
                  {
                    config: ["PSScene4Band"],
                    field_name: "item_type",
                    type: "StringInFilter",
                  },
                ],
                type: "AndFilter",
              },
            ],
            type: "OrFilter",
          },
          {
            config: [
              {
                config: {
                  gte: "2021-01-08T00:00:00.000Z",
                  lte: "2021-01-09T23:59:59.999Z",
                },
                field_name: "acquired",
                type: "DateRangeFilter",
              },
            ],
            type: "OrFilter",
          },
        ],
        type: "AndFilter",
      },
    });
    console.log(footprints);
    let tileUrl = "https://tiles2.planet.com/data/v1/PSScene4Band/";
    footprints.map((fp) => {
      tileUrl += fp.id + ",";
    });
    tileUrl += "/{z}/{x}/{y}.png?api_key=";
    tileUrl += key;
    console.log(tileUrl);
    addPlanetLayer(map, tileUrl);
  };
  //"https://tiles{0-3}.planet.com/basemaps/v1/planet-tiles/{mosaic_name}/gmap/{z}/{x}/{y}.png?api_key={api-key}"
  //https://tiles2.planet.com/data/v1/PSScene4Band/20210109_170342_1011,20210109_170343_1011,20210109_170344_1011,20210109_170345_1011,20210109_170346_1011,20210109_170347_1011,20210109_170348_1011,20210109_170349_1011,20210109_170350_1011,20210109_170351_1011,20210109_171516_55_227b,20210109_171629_12_2403,20210109_171631_40_2403,20210109_171633_68_2403,20210109_194608_0f4c,20210109_194609_0f4c,20210109_194610_0f4c,20210109_194611_0f4c/8/61/90.png?api_key=cd01598deab44a948b808cf6443b3528

  const addPlanetLayer = (map, url) => {
    console.log("tst");
    map.addSource("Planet", {
      type: "raster",
      tiles: [url],
      minzoom: 0,
      maxzoom: 16,
    });
    map.addLayer({
      id: "planet-layer",
      type: "raster",
      source: "Planet",
      minzoom: 0,
      maxzoom: 18,
      layout: {
        visibility: "visible",
      },
    });
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/shane98c/ckg018j041tc119p6tgqsg9mm",
    });
    map.on("load", () => {
      getFootprints(map);
    });
    return () => map.remove();
  }, []);

  return <div className="map-container" ref={mapContainer}></div>;
};

export default App;
