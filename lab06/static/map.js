//zoom=2 → дэлхийн хэмжээний зураг
//zoom=12 → хотын хэмжээ
//zoom=16 → гудамж, барилга тод харагдана
//zoom=0-22
var map = L.map('map').setView([47.92, 106.92], 16);  // түр зуурын төв
map.fitBounds(window.bounds);  // дараа нь extent-ийг өгөгдлөөр тохируулна

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Зам болон барилгын өгөгдлийг Flask-аас дамжуулсан JSON-оос авна
var roads = window.roadsData || [];
var buildings = window.buildingsData || [];

var roadLayer = L.layerGroup();
var buildingLayer = L.layerGroup();

roads.forEach(function(path) {
  L.polyline(path, {color: 'blue'}).addTo(roadLayer);
});

buildings.forEach(function(area) {
  L.polygon(area, {color: 'green'}).addTo(buildingLayer);
});

document.getElementById("loadBtn").addEventListener("click", function() {
  document.getElementById("infoBox").value = "Ачаалж байна...";

  // Layer-уудыг map-аас хасах
  map.removeLayer(roadLayer);
  map.removeLayer(buildingLayer);

  const selected = document.getElementById("layerSelect").value;

  if (selected === "roads") {
    roadLayer.addTo(map);
    document.getElementById("infoBox").value = "Замын polyline-уудыг харуулж байна.";
  } else if (selected === "buildings") {
    buildingLayer.addTo(map);
    document.getElementById("infoBox").value = "Барилгын polygon-уудыг харуулж байна.";
  } else if (selected === "both") {
    roadLayer.addTo(map);
    buildingLayer.addTo(map);
    document.getElementById("infoBox").value = "Зам болон барилгуудыг давхар харуулж байна.";
  } else {
    document.getElementById("infoBox").value = "Давхарга байхгүй.";
  }
});

