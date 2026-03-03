import httpx
import asyncio

async def get_weather(city_name: str) -> dict:
    """
    Fetch weather data for a given city using Open-Meteo APIs.
    Returns a standardized dictionary.
    """
    try:
        async with httpx.AsyncClient() as client:
            # Step 1: Geocode city name to lat/lon
            geo_url = "https://geocoding-api.open-meteo.com/v1/search"
            geo_params = {
                "name": city_name,
                "count": 1,
                "language": "en",
                "format": "json"
            }
            geo_resp = await client.get(geo_url, params=geo_params, timeout=10)
            geo_resp.raise_for_status()
            geo_data = geo_resp.json()
    
            if "results" not in geo_data or len(geo_data["results"]) == 0:
                return {
                    "status": "error",
                    "message": f"Could not find coordinates for city: {city_name}"
                }
    
            lat = geo_data["results"][0]["latitude"]
            lon = geo_data["results"][0]["longitude"]
        resolved_city = geo_data["results"][0].get("name", city_name)
        country = geo_data["results"][0].get("country", "")

        async with httpx.AsyncClient() as client:
            # Step 2: Fetch weather using lat/lon
            weather_url = "https://api.open-meteo.com/v1/forecast"
            weather_params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,weather_code",
            }
            weather_resp = await client.get(weather_url, params=weather_params, timeout=10)
            weather_resp.raise_for_status()
            weather_data = weather_resp.json()

        # Basic mapping of WMO Weather interpretation codes
        weather_code = weather_data["current"]["weather_code"]
        conditions = "Clear/Sunny" if weather_code <= 1 else \
                     "Cloudy" if weather_code <= 3 else \
                     "Rain/Showers" if weather_code <= 69 else \
                     "Snow" if weather_code <= 79 else \
                     "Stormy"

        return {
            "status": "success",
            "data": {
                "city": f"{resolved_city}, {country}".strip(', '),
                "temperature": f"{weather_data['current']['temperature_2m']} °C",
                "conditions": conditions
            }
        }

    except httpx.HTTPError as e:
        return {
            "status": "error",
            "message": f"Weather API error: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Weather API error: {str(e)}"
        }

if __name__ == "__main__":
    import json
    print("Testing get_weather('London')...")
    result = asyncio.run(get_weather("London"))
    print("\nResult:")
    print(json.dumps(result, indent=2))
