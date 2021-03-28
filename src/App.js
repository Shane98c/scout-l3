import mapboxgl from "mapbox-gl/dist/mapbox-gl-dev";
import { useEffect, useState, useRef } from "react";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";

import auth from "@planet/client/api/auth";
import filter from "@planet/client/api/filter";
import items from "@planet/client/api/items";
import * as topojson from "topojson-client";

import DatePickerContainer from "./DatePicker";
import Loading from "./Loading";

import { email, password, key, mbAccess } from "./_config";

const l3Topo = require("./data/L3PermRoute.json");
const getL3 = () => topojson.feature(l3Topo, "l3PermRtMerge");

const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const geomFilter = filter.geometry("geometry", getL3().features[0].geometry);

const getFilter = (date) => {
  const dateFilter = filter.dates("acquired", {
    gte: date,
    lte: addDays(date, 1),
  });
  return filter.and([dateFilter, geomFilter]);
};

const addPlanetLayer = (map, url) => {
  map.addSource("Planet", {
    type: "raster",
    tiles: [url],
    minzoom: 0,
    maxzoom: 16,
  });
  map.addLayer(
    {
      id: "Planet",
      type: "raster",
      source: "Planet",
      minzoom: 0,
      maxzoom: 18,
      layout: {
        visibility: "visible",
      },
    },
    "l3"
  );
};

const addL3Layer = (map, data) => {
  map.addSource("l3", {
    type: "geojson",
    data: data.features[0],
  });
  map.addLayer({
    id: "l3",
    type: "line",
    source: "l3",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-width": 2,
    },
  });
};

const getPlanetTileUrl = async (queryFilter) => {
  await auth.login(email, password);
  await auth.setKey(key);
  const footprints = await items.search({
    types: ["PSScene4Band"],
    filter: queryFilter,
  });
  let tileUrl = "https://tiles.planet.com/data/v1/PSScene4Band/";
  footprints.map((fp) => {
    tileUrl += fp.id + ",";
  });
  tileUrl += "/{z}/{x}/{y}.png?api_key=";
  tileUrl += key;
  return tileUrl;
};

mapboxgl.accessToken = mbAccess;

const App = () => {
  const mapContainer = useRef();
  const [map, setMap] = useState(null);

  const { promiseInProgress } = usePromiseTracker();

  const updateDate = async (date) => {
    const planetTileURL = await trackPromise(getPlanetTileUrl(getFilter(date)));
    if (map.getLayer("Planet")) map.removeLayer("Planet");
    if (map.getSource("Planet")) map.removeSource("Planet");
    addPlanetLayer(map, planetTileURL);
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/shane98c/ckg018j041tc119p6tgqsg9mm",
      center: [-94.68, 46.72],
      zoom: 6,
    });
    map.on("load", async () => {
      addL3Layer(map, getL3());
      const planetTileURL = await trackPromise(
        getPlanetTileUrl(getFilter(addDays(new Date(), -1)))
      );
      addPlanetLayer(map, planetTileURL);
    });
    setMap(map);
    return () => map.remove();
  }, [setMap]);

  return (
    <div>
      <div className="map-container" ref={mapContainer}></div>
      <DatePickerContainer updateDate={updateDate} />
      {promiseInProgress ? <Loading></Loading> : null}
    </div>
  );
};

export default App;
