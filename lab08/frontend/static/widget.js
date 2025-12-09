(function() {
  // Анхдагч төв (энэ нь Монгол Улсын Улаанбаатар орчим санамсаргүй координатууд)
  var initialLatLng = [47.92, 106.92];
  var initialZoom = 16;

  // Simple sample data: roads (polyline) болон buildings (polygon)
  var sampleRoads = [
    // зам 1 (polyline)
    [
      [47.9235, 106.9170],
      [47.9242, 106.9200],
      [47.9250, 106.9250]
    ],
    // зам 2
    [
      [47.9190, 106.9150],
      [47.9205, 106.9180],
      [47.9220, 106.9195]
    ]
  ];

  var sampleBuildings = [
    // барилга 1 (polygon)
    [
      [47.9210, 106.9210],
      [47.9218, 106.9222],
      [47.9212, 106.9231],
      [47.9205, 106.9220]
    ],
    // барилга 2
    [
      [47.9240, 106.9185],
      [47.9246, 106.9196],
      [47.9237, 106.9202],
      [47.9232, 106.9190]
    ]
  ];

  // Инициализаци: map
  var map = null; // will be set in DOMContentLoaded/init

  function initMap() {
    var m = L.map('map', {
      center: initialLatLng,
      zoom: initialZoom,
      zoomControl: true
    });

    // OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(m);

    return m;
  }

  // Create layer groups from sample data
  function createSampleLayers() {
    var roadsLayer = L.layerGroup();
    sampleRoads.forEach(function(path) {
      L.polyline(path, { color: '#1f78b4', weight: 4 }).addTo(roadsLayer);
    });

    var buildingsLayer = L.layerGroup();
    sampleBuildings.forEach(function(poly) {
      L.polygon(poly, { color: '#b21f1f', fillColor: '#ff8f5a', fillOpacity: 0.5 }).addTo(buildingsLayer);
    });

    return {
      roadsLayer: roadsLayer,
      buildingsLayer: buildingsLayer
    };
  }

  // Main: hookup events
  document.addEventListener('DOMContentLoaded', function() {
    map = initMap();

    // Make layers variable available to other scopes (and to the CreateSampleLayers global)
    var layers = null;

    // Expose a global CreateSampleLayers function so parent frames or external scripts
    // can call it. By default this will NOT add layers to the map unless addToMap=true.
    window.CreateSampleLayers = function(addToMap) {
      // ensure map exists
      if (!map) {
        map = initMap();
      }

      layers = createSampleLayers();

      var overlays = {
        "Зам (Lines)": layers.roadsLayer,
        "Барилга (Polygons)": layers.buildingsLayer
      };

      // Add the layer control (note: calling multiple times will add multiple controls)
      L.control.layers(null, overlays, { collapsed: false }).addTo(map);

      // Fit map to sample data bounds
      var allCoords = sampleRoads.flat().concat(sampleBuildings.flat());
      if (allCoords.length) {
        var bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds.pad(0.5));
      }

      // If caller wants the layers added immediately, do so (default: false)
      if (addToMap === true) {
        layers.roadsLayer.addTo(map);
        layers.buildingsLayer.addTo(map);
      }

      // Return the layers so external callers can interact with them
      return layers;
    };

    // Call once to register overlays and compute bounds, but do not add layers by default
    layers = window.CreateSampleLayers(false);

    // Button listener: select дээр тулгуурлан давхаргыг харуулах
    var loadBtn = document.getElementById('loadBtn');
    var layerSelect = document.getElementById('layerSelect');

    loadBtn.addEventListener('click', function() {
      if (!layers) {
        layers = window.CreateSampleLayers(false);
      }

      map.removeLayer(layers.roadsLayer);
      map.removeLayer(layers.buildingsLayer);

      var val = layerSelect.value;
      if (val === 'roads') {
        layers.roadsLayer.addTo(map);
      } else if (val === 'buildings') {
        layers.buildingsLayer.addTo(map);
      } else if (val === 'both') {
        layers.roadsLayer.addTo(map);
        layers.buildingsLayer.addTo(map);
      }
    });

    // Сонголт өөрчлөгдөхөд товчлуургүйгээр шууд үзүүлэхийг хүсвэл:
    layerSelect.addEventListener('change', function() {
      // автоматаар товч дарагдсан мэт үйлдэл хийх бол доорх мөрийн комментийг хүлээнэ:
      // loadBtn.click();
    });
  });
})();