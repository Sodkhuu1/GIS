import osmium
import geojson

INPUT = "/data/map.osm"
OUTPUT = "/web/bus_stops.geojson"

features = []

class Handler(osmium.SimpleHandler):
    def node(self, n):
        if (
            n.tags.get("highway") == "bus_stop"
            or n.tags.get("public_transport") in ["platform", "stop_position"]
        ):
            if n.location.valid():
                features.append(
                    geojson.Feature(
                        geometry=geojson.Point(
                            (n.location.lon, n.location.lat)
                        ),
                        properties={
                            "name": n.tags.get("name", "Bus stop")
                        }
                    )
                )

handler = Handler()
handler.apply_file(INPUT, locations=True)

fc = geojson.FeatureCollection(features)

with open(OUTPUT, "w", encoding="utf-8") as f:
    geojson.dump(fc, f, ensure_ascii=False, indent=2)

print(f"{len(features)} автобусны буудал олдлоо")
