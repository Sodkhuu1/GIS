function drawBusRoute(start, end, onDone) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start.lng},${start.lat};${end.lng},${end.lat}` +
    `?overview=full&geometries=geojson`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const route = data.routes[0];
      const geo = route.geometry;

      const line = L.geoJSON(geo, {
        style: { color: "red", weight: 4 }
      }).addTo(map);

      // OSRM зай → км
      const distanceKm = route.distance / 1000;

      onDone(line, distanceKm);
    });
}
