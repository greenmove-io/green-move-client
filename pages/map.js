import InteractiveMap from "../components/interactiveMap";

import { useEffect, useState } from "react";
import CityData from "./city/[cityName]";

export async function getStaticProps() {
  //get data for all cities
  const res = await fetch("https://api.greenmove.io/places/all");

  const data = await res.json();
  const allPlaces = data.data;

  if (!allPlaces) return { notFound: true };

  return { props: { allPlaces: allPlaces } };
}

export default function MapPage({ allPlaces }) {
  return (
    <InteractiveMap
      longitude={1.7}
      latitude={53.7}
      startingZoom={10}
      showAll={true}
      allPlaces={allPlaces}
    ></InteractiveMap>
  );
}
