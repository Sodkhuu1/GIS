window.onload = init;

function init(){

  // HTML element
  const mapElement = document.getElementById('mapid');

  // Basemaps
  const Stadiamaps = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    noWrap: true,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',

  })

  var OpenStreetMapStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  


  // Leaflet map object
  const mymap = L.map(mapElement, {
    center: [46.91, 106.91],
    zoom: 5,
    minZoom: 2,
    zoomSnap: 0.25,
    zoomDelta:0.25,

    easeLinearity: 0.1,
    worldCopyJump: true,
    layers: [OpenStreetMapStandard]
  })


  // Overlays
  const perthBaseMapImage = './Data/khuvsgul_aimag.png';
  const perthBaseMapBounds = [[48.0, 100.0], [52.0, 108.0]];
  const imagePerthOverlay = L.imageOverlay(perthBaseMapImage, perthBaseMapBounds)

  const perthBaseMapImage2 = './Data/dornod_aimag.png';
  const perthBaseMapBounds2 = [[50.53, 111.43], [46.28, 119.98]]
  const imagePerthOverlay2 = L.imageOverlay(perthBaseMapImage2, perthBaseMapBounds2)

  const perthBaseMapImage3 = './Data/bayanulgii_aimag.png';
  const perthBaseMapBounds3 = [[45.58, 87.73], [50.03, 92.22]]
  const imagePerthOverlay3 = L.imageOverlay(perthBaseMapImage3, perthBaseMapBounds3)

  // Overlay object
  const overlayerLayers = {
    'Khuvsgul Aimag image': imagePerthOverlay,
    'Dornod Aimag image': imagePerthOverlay2,
    'BayanUlgii Aimag image': imagePerthOverlay3,
    'Odoogiin bairlal': mymap.locate({setView:true, maxZoom: 6})
  } 

  

  // Baselayers object
  const baseLayers = {
    '<b>OpenStreetMapStandard</b>': OpenStreetMapStandard,
    'StadiaMaps': Stadiamaps
  }

  // Map layer control
  const layerControls = L.control.layers(baseLayers, overlayerLayers, {
    collapsed: false,
    position: 'topright'
  }).addTo(mymap)


  // Perth Marker
  const perthMarker = L.marker([49.63, 100.15],{
    title: 'Murun coming from the marker',
    alt: 'test of alt',
    opacity: 1,
  }).addTo(mymap)

  const perthMarkerPopup = perthMarker.bindPopup('Popup');
  perthMarker.bindTooltip('Tooltip');


  mymap.locate({setView:true, maxZoom: 6})

  function onLocationFound(e){
    var radius = e.accuracy.toFixed(2);

    var locationMarker = L.marker(e.latlng).addTo(mymap)
      .bindPopup('You are within ' + radius + ' metres from this point').openPopup()
    
    var locationCircle = L.circle(e.latlng, radius).addTo(mymap)    
  }

  mymap.on('locationfound', onLocationFound)



  function onLocationError(e){
    window.alert(e.message)  }

  mymap.on('locationerror', onLocationError)


  // Distance calculation demo
  // New code
  var myCustomIcon = L.icon({
    iconUrl: '../Data/icon_point.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -15],
  })

  
  var myDivIcon = L.divIcon({
    className: 'my-div-icon',
    iconSize: 30,
  })

  var counter = 0;
  var coordinates = [];

  mymap.on('click', function (e) {
    counter += 1;
    let latlng = e.latlng;
    coordinates.push(latlng)

    let popup = L.popup({
      autoClose: false,
      closeOnClick: false,
    }).setContent(String(counter))
    
    L.marker(latlng, {icon: myDivIcon})
      .addTo(mymap)    
      .bindPopup(popup)
      .openPopup()      
    
    if (counter >= 2) {
      let distance = mymap.distance(coordinates[0], coordinates[1])
      console.log(`The distance between ${counter - 1} and ${counter} is ${distance}` , )
      coordinates.shift()
    }
  })
  
}