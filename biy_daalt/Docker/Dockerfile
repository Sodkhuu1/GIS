FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libexpat1 && \
    pip install osmium geojson

COPY extract_bus_stops.py .

CMD ["python", "extract_bus_stops.py"]
