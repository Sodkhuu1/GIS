const map = L.map("map").setView([47.918, 106.917], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

let start = null, end = null, stops = [], layers = [];

fetch("bus_stops.geojson")
  .then(r => r.json())
  .then(j => stops = j.features);

function dist(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const x =
    Math.sin(dLat/2)**2 +
    Math.cos(a.lat*Math.PI/180) *
    Math.cos(b.lat*Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function nearest(p) {
  let min = 1e9, n = null;
  stops.forEach(s => {
    const [lng, lat] = s.geometry.coordinates;
    const d = dist(p, {lat, lng});
    if (d < min) { min = d; n = {lat, lng}; }
  });
  return { n, d: min };
}

map.on("click", e => {
  if (!start) {
    start = e.latlng;
    L.marker(start).addTo(map).bindPopup("Эхлэх").openPopup();
  } else if (!end) {
    end = e.latlng;
    L.marker(end).addTo(map).bindPopup("Төгсөх").openPopup();
    draw();
  }
});

function draw() {
  layers.forEach(l => map.removeLayer(l));
  layers = [];

  const s1 = nearest(start);
  const s2 = nearest(end);

  // явган зам
  layers.push(
    L.polyline([start, s1.n], { dashArray:"5,5", color:"blue" }).addTo(map),
    L.polyline([s2.n, end], { dashArray:"5,5", color:"blue" }).addTo(map)
  );

  // автобус (OSRM)
  drawBusRoute(s1.n, s2.n, (line, busDistance) => {
    layers.push(line);

    const t1 = s1.d / 5 * 60;
    const t2 = busDistance / 20 * 60;
    const t3 = s2.d / 5 * 60;

    document.getElementById("result").innerHTML = `
      Явган (эхлэх → буудал): ${t1.toFixed(1)} мин<br>
      Автобус: ${t2.toFixed(1)} мин<br>
      Явган (буудал → төгсөх): ${t3.toFixed(1)} мин<br>
      <b>Нийт: ${(t1+t2+t3).toFixed(1)} мин</b>
    `;
  });
}

