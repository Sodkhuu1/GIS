// Leaflet санг ашиглан газрын зургийг эхлүүлнэ
function initMap() {
//zoom=2 → дэлхийн хэмжээний зураг
//zoom=12 → хотын хэмжээ
//zoom=16 → гудамж, барилга тод харагдана
//zoom=0-22
  var map = L.map('map').setView([47.92, 106.92], 16);
  map.fitBounds(window.bounds);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  return map;
}

// Зам болон барилгын өгөгдлийг Flask-аас дамжуулсан JSON-оос авна
function createLayers(roads, buildings) {
  var roadLayer = L.layerGroup();
  var buildingLayer = L.layerGroup();

  roads.forEach(function(path) {
    L.polyline(path, {color: 'blue'}).addTo(roadLayer);
  });
  buildings.forEach(function(area) {
    L.polygon(area, {color: 'green'}).addTo(buildingLayer);
  });

  return { roadLayer, buildingLayer };
}

function setInfo(msg) {
  document.getElementById("infoBox").value = msg;
}

// layout.html-д зориулсан map код
function showLayoutMap() {
  var map = initMap();

  // Line layer үүсгэх (roads - L.polyline)
  var roadLayer = L.featureGroup();
  var roads = window.roadsData || [];
  roads.forEach(function(road) {
      // Line зурах (coordinates-ыг [lat, lon] форматтай байлгах)
      var coords = road.map(function(pt) { return [pt[0], pt[1]]; });
      L.polyline(coords, {color: 'blue', weight: 3}).addTo(roadLayer);
  });

  // Polygon layer үүсгэх (buildings - L.polygon)
  var buildingLayer = L.featureGroup();
  var buildings = window.buildingsData || [];
  buildings.forEach(function(building) {
      // Polygon зурах (coordinates-ыг [lat, lon] форматтай байлгах)
      var coords = building.map(function(pt) { return [pt[0], pt[1]]; });
      L.polygon(coords, {color: 'red', fillColor: 'orange', fillOpacity: 0.5}).addTo(buildingLayer);
  });

  // Зурах давхарга үүсгэх
  var drawnItems = L.featureGroup();
  // Шинэ: Draw control үүсгэх (draw болон edit toolbar-уудыг идэвхжүүлэх)
  var drawControl = new L.Control.Draw({
      position: 'topleft',  // Toolbar-ийн байрлал (default: topleft)
      draw: {
          marker: true,     // Point (marker) зурахыг зөвшөөрөх
          polyline: {       // Line (polyline) зурах тохиргоо
              shapeOptions: {
                  color: 'blue',
                  weight: 4
              }
          },
          polygon: {        // Polygon зурах тохиргоо
              allowIntersection: false,  // Өөрийгөө огтлолцуулахгүй
              showArea: true,            // Талбайг харуулах
              shapeOptions: {
                  color: 'red',
                  fillColor: 'green'
              }
          },
          rectangle: true,  // Rectangle зурах
          circle: false,     // Circle зурах
          circlemarker: false  // Circle marker-ийг идэвхгүй болгох (шаардлагагүй бол)
      },
      edit: {
          featureGroup: drawnItems,  // Засварлах өгөгдлийг эндээс авна
          remove: true               // Устгахыг зөвшөөрөх
      }
  });
  map.addControl(drawControl);

  // Event listener нэмэх (map үүсгэсний дараа)
  map.on('draw:created', function(e) {
      var type = e.layerType;  // 'marker', 'polyline', 'polygon' г.м.
      var layer = e.layer;     // Зурсан layer (L.Marker, L.Polyline г.м.)
      
      // Жишээ: Console-д хэвлэх
      console.log('Зурсан төрөл: ' + type);
      console.log('Координатууд: ' + JSON.stringify(layer.toGeoJSON()));  // GeoJSON болгон хөрвүүлэх
      
      // drawnItems-д нэмэх (автоматаар нэмэгдэхгүй бол)
      drawnItems.addLayer(layer);
      
      console.log('Амжилттай хадгалагдлаа')
  });

  // Бусад event-үүд:
  map.on('draw:edited', function(e) {
      var layers = e.layers;  // Засварлагдсан layer-үүд
      layers.eachLayer(function(layer) {
          console.log('Засварлагдсан: ' + JSON.stringify(layer.toGeoJSON()));
      });
  });

  map.on('draw:deleted', function(e) {
      var layers = e.layers;  // Устгагдсан layer-үүд
      console.log('Устгагдсан layer-үүд');
  });

  // Layer control нэмэх (overlay layers)
  var overlays = {
      "Зам (Lines)": roadLayer,
      "Барилга (Polygons)": buildingLayer,
      "Зурах хэсэг": drawnItems
  };
  L.control.layers(null, overlays).addTo(map);

  // Анхдагчаар доорх layer-үүдийг асаах
  roadLayer.addTo(map);
  buildingLayer.addTo(map);
}

// layer.html-д зориулсан map код
function showLayerMap() {
  var map = initMap();
  var roads = window.roadsData || [];
  var buildings = window.buildingsData || [];
  var { roadLayer, buildingLayer } = createLayers(roads, buildings);

  document.getElementById("loadBtn").addEventListener("click", function() {
    setInfo("Ачаалж байна...");

    // Layer-уудыг map-аас хасах
    map.removeLayer(roadLayer);
    map.removeLayer(buildingLayer);

    const selected = document.getElementById("layerSelect").value;

    if (selected === "roads") {
      roadLayer.addTo(map);
      setInfo("Замын polyline-уудыг харуулж байна.");
    } else if (selected === "buildings") {
      buildingLayer.addTo(map);
      setInfo("Барилгын polygon-уудыг харуулж байна.");
    } else if (selected === "both") {
      roadLayer.addTo(map);
      buildingLayer.addTo(map);
      setInfo("Зам болон барилгуудыг давхар харуулж байна.");
    } else {
      setInfo("Давхарга байхгүй.");
    }
  });
}
