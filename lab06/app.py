from flask import Flask, render_template
import osmium, statistics

app = Flask(__name__)

# OSM өгөгдлийг унших класс
class OSMHandler(osmium.SimpleHandler):
    def __init__(self):
        super(OSMHandler, self).__init__()
        self.nodes = []

    def node(self, n):
        self.nodes.append((n.location.lat, n.location.lon))

# Зам, барилгын өгөгдлийг цуглуулах класс
class WayCollector(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.roads = []
        self.buildings = []

    def way(self, w):
        tags = dict(w.tags)
        nodes = [
            (n.location.lat, n.location.lon)
            for n in w.nodes
            if n.location and n.location.valid()
        ]
        if "highway" in tags and nodes:
            self.roads.append(nodes)
        if "building" in tags and nodes:
            self.buildings.append(nodes)

@app.route("/")
def index():
    handler = OSMHandler()
    handler.apply_file("osm/map.osm") # /osm фолдер дотроос уншина
    coords = handler.nodes[:100]  # эхний 100 цэгийг л харуулах

    if coords:
        # Бүх цэгүүдийн төв цэгийг тооцоолно
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        center = (statistics.mean(lats), statistics.mean(lons))  # дундаж цэг
    else:
        center = (47.92, 106.92) # Улаанбаатарыг төв болгох

    return render_template("index.html", coords=coords, center=center)

@app.route("/layout")
def view_layout():
    handler = OSMHandler()
    handler.apply_file("osm/map.osm") # /osm фолдер дотроос уншина
    coords = handler.nodes[:100]  # эхний 100 цэгийг л харуулъя

    if coords:
        # Бүх цэгүүдийн дундажийг тооцоолно
        lats = [c[0] for c in coords]
        lons = [c[1] for c in coords]
        center = (statistics.mean(lats), statistics.mean(lons))  # дундаж цэг
    else:
        center = (47.92, 106.92) # Улаанбаатарыг төв болгох

    return render_template("layout.html", coords=coords, center=center)

@app.route("/layer")
def view_layer():
    handler = WayCollector()
    handler.apply_file("osm/map.osm", locations = True) # /osm фолдер дотроос уншина

    roads = handler.roads
    buildings = handler.buildings

    # Бүх координатыг нэгтгэх
    all_coords = [pt for way in roads + buildings for pt in way if pt]

    if all_coords:
        lats = [lat for lat, lon in all_coords]
        lons = [lon for lat, lon in all_coords]
        bounds = [[min(lats), min(lons)], [max(lats), max(lons)]]
    else:
        bounds = [[47.91, 106.89], [47.93, 106.94]]  # fallback

    return render_template("layer.html",
                        roads=roads[:100],
                        buildings=buildings[:100],
                        bounds=bounds)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
