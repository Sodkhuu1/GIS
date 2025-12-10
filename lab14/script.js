// --- 1. ТОХИРУУЛГА ---
// АНХААР: Өөрийн API KEY-г энд хуулж тавина уу!
const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImNlZDM1NDE2YTg1ZDQ3OWViMjAxYTBkMmZlMzlmNDQ0IiwiaCI6Im11cm11cjY0In0='; 

const startPoint = [106.917572, 47.918466]; // Сүхбаатарын талбай (Lon, Lat)

// Газрын зураг үүсгэх
const map = L.map('map').setView([startPoint[1], startPoint[0]], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Эхлэх цэгийг тэмдэглэх
L.marker([startPoint[1], startPoint[0]])
 .addTo(map)
 .bindPopup("Эхлэх цэг: Сүхбаатарын талбай")
 .openPopup();

// --- 2. ӨГӨГДӨЛ БЭЛТГЭХ (OSM Data Simulation) ---
// Бодит байдал дээр Overpass API-аас татдаг ч, хичээлийн үед 
// сүлжээ тасрахаас сэргийлж "Хиймэл" сургуулиудыг энд үүсгэв.
const mockSchools = {
    "type": "FeatureCollection",
    "features": []
};

// Санамсаргүйгээр 50 ширхэг "Сургууль" цэг үүсгэх
for (let i = 0; i < 50; i++) {
    // Сүхбаатарын талбайг тойроод random координат
    let lon = 106.917572 + (Math.random() - 0.5) * 0.04; 
    let lat = 47.918466 + (Math.random() - 0.5) * 0.03;
    mockSchools.features.push(turf.point([lon, lat], {name: `Сургууль ${i+1}`}));
}

// Сургуулиудыг газрын зураг дээр цэнхэр цэгээр харуулах
const schoolsLayer = L.geoJSON(mockSchools, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#0078A8",
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    },
    onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.name);
    }
}).addTo(map);


// --- 3. ISOCHRONE ТООЦООЛОХ ФУНКЦ ---
async function calculateIsochrones() {

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "Тооцоолж байна...";

    // API Request Body
    let body = {
        "locations": [startPoint], // [Lon, Lat]
        "range": [300, 600, 900],   // 5, 10, 15 минут (секундээр)
        "range_type": "time",
        "attributes": ["area"]      // Талбайн хэмжээг буцаах
    };

    try {
        // Fetch Request
        let response = await fetch('https://api.openrouteservice.org/v2/isochrones/foot-walking', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("API Error: " + response.statusText);

        let data = await response.json();
        
        // Хуучин Isochrone давхарга байвал устгах (давхардахаас сэргийлэх)
        map.eachLayer((layer) => {
            if (layer.options.isIsochrone) {
                map.removeLayer(layer);
            }
        });

        // --- 4. LEAFLET ДЭЭР ДҮРСЛЭХ ---
        // ORS нь том Polygon-оо түрүүлж өгдөг тул давхарлаж зурахад 
        // жижиг нь дарагдчихдаг. Тиймээс эсрэгээр нь эрэмбэлнэ эсвэл style хийнэ.
        
        // Style тохируулах функц
        function getStyle(feature) {
            let range = feature.properties.value; // секундээр ирнэ (300, 600, 900)
            let color = 'red'; // Default 15 min
            if (range <= 300) color = 'green';
            else if (range <= 600) color = 'yellow';
            
            return {
                fillColor: color,
                weight: 2,
                opacity: 1,
                color: 'white',  // Хүрээний өнгө
                dashArray: '3',
                fillOpacity: 0.4,
                isIsochrone: true // Дараа нь таньж устгахад хэрэгтэй
            };
        }

        // Газрын зурагт нэмэх
        let isoLayer = L.geoJSON(data, {
            style: getStyle
        }).addTo(map);
        
        // Газрын зургийг Isochrone руу тааруулж томруулах
        map.fitBounds(isoLayer.getBounds());


        // --- 5. TURF.JS АНАЛИЗ ---
        // Polygon бүрийн дотор хэдэн сургууль байгааг тоолох
        
        let statsHTML = "<h3>Анализын үр дүн:</h3>";
        
        // Хялбар болгох үүднээс эрэмбэлэх:
        data.features.sort((a, b) => a.properties.value - b.properties.value);
        // Одоо [5мин, 10мин, 15мин] гэсэн дараалалтай болно.

        data.features.forEach(function(polygonFeature) {
            let minutes = polygonFeature.properties.value / 60; // Секундийг минут болгох
            
            // Turf ашиглан тоолох
            let ptsWithin = turf.pointsWithinPolygon(mockSchools, polygonFeature);
            let count = ptsWithin.features.length;

            let colorName = minutes === 5 ? "Ногоон" : (minutes === 10 ? "Шар" : "Улаан");

            statsHTML += `
                <div class="stat-item">
                    ${minutes} минутын бүс (${colorName}): <br>
                    👉 ${count} сургууль хамрагдаж байна.
                </div>
            `;
        });

        resultsDiv.innerHTML = statsHTML;

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "Алдаа гарлаа: " + error.message;
    }
}
