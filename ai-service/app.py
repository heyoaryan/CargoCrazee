from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json
from datetime import datetime, timedelta
import os
from typing import Optional, List, Dict
from dotenv import load_dotenv

# Load environment variables from config.env
load_dotenv('config.env')

app = FastAPI(title="CargoCrazee AI Service", version="1.0.0")

# CORS setup (allow dynamic origins from env)
cors_env = os.getenv("CORS_ORIGINS", "").strip()
allowed_origins = [o.strip() for o in cors_env.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Keys from environment variables
OPENROUTE_API_KEY = os.getenv("OPENROUTE_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# Validate API keys
if not OPENROUTE_API_KEY:
    raise ValueError("OPENROUTE_API_KEY environment variable is required")
if not OPENWEATHER_API_KEY:
    raise ValueError("OPENWEATHER_API_KEY environment variable is required")

# Delhi Industrial Hubs Dataset
DELHI_INDUSTRIAL_HUBS = {
    "Okhla Industrial Area": {
        "name": "Okhla Industrial Area",
        "coordinates": {"lat": 28.5275, "lon": 77.2750},
        "type": "Electronics & Textiles",
        "traffic_level": "High",
        "peak_hours": ["09:00-11:00", "17:00-19:00"]
    },
    "Naraina Industrial Area": {
        "name": "Naraina Industrial Area", 
        "coordinates": {"lat": 28.6167, "lon": 77.1167},
        "type": "Engineering & Manufacturing",
        "traffic_level": "Medium",
        "peak_hours": ["08:00-10:00", "16:00-18:00"]
    },
    "Wazirpur Industrial Area": {
        "name": "Wazirpur Industrial Area",
        "coordinates": {"lat": 28.7000, "lon": 77.1000},
        "type": "Steel & Engineering",
        "traffic_level": "High",
        "peak_hours": ["07:00-09:00", "15:00-17:00"]
    },
    "Mayapuri Industrial Area": {
        "name": "Mayapuri Industrial Area",
        "coordinates": {"lat": 28.6333, "lon": 77.1167},
        "type": "Automotive & Spare Parts",
        "traffic_level": "Medium",
        "peak_hours": ["08:00-10:00", "16:00-18:00"]
    },
    "Kirti Nagar Industrial Area": {
        "name": "Kirti Nagar Industrial Area",
        "coordinates": {"lat": 28.6500, "lon": 77.1333},
        "type": "Furniture & Wood",
        "traffic_level": "Low",
        "peak_hours": ["09:00-11:00", "17:00-19:00"]
    },
    "Lawrence Road Industrial Area": {
        "name": "Lawrence Road Industrial Area",
        "coordinates": {"lat": 28.6833, "lon": 77.1167},
        "type": "Textiles & Garments",
        "traffic_level": "High",
        "peak_hours": ["08:00-10:00", "16:00-18:00"]
    },
    "Shahdara Industrial Area": {
        "name": "Shahdara Industrial Area",
        "coordinates": {"lat": 28.6833, "lon": 77.2833},
        "type": "Electronics & Plastic",
        "traffic_level": "Medium",
        "peak_hours": ["07:00-09:00", "15:00-17:00"]
    },
    "Patparganj Industrial Area": {
        "name": "Patparganj Industrial Area",
        "coordinates": {"lat": 28.6167, "lon": 77.3167},
        "type": "Pharmaceuticals & Chemicals",
        "traffic_level": "Low",
        "peak_hours": ["09:00-11:00", "17:00-19:00"]
    },
    "Bawana Industrial Area": {
        "name": "Bawana Industrial Area",
        "coordinates": {"lat": 28.8000, "lon": 77.0333},
        "type": "Food Processing & Textiles",
        "traffic_level": "Medium",
        "peak_hours": ["08:00-10:00", "16:00-18:00"]
    },
    "Narela Industrial Area": {
        "name": "Narela Industrial Area",
        "coordinates": {"lat": 28.8500, "lon": 77.1000},
        "type": "Heavy Industries & Manufacturing",
        "traffic_level": "Low",
        "peak_hours": ["07:00-09:00", "15:00-17:00"]
    }
}

# Request/Response models
class RouteRequest(BaseModel):
    origin: dict
    destination: dict
    departure_time: Optional[str] = None

class WeatherData(BaseModel):
    temperature: float
    condition: str
    humidity: int
    wind_speed: float
    visibility: float

def get_real_weather_data(lat: float, lon: float) -> dict:
    """Get real weather data from OpenWeather API"""
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract weather information
        weather_info = {
            "temperature": data["main"]["temp"],
            "condition": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "visibility": data.get("visibility", 10000) / 1000,  # Convert to km
            "pressure": data["main"]["pressure"],
            "feels_like": data["main"]["feels_like"]
        }
        
        # Get forecast for tomorrow
        forecast_url = f"https://api.openweathermap.org/data/2.5/forecast"
        forecast_params = {
            "lat": lat,
            "lon": lon,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric"
        }
        
        forecast_response = requests.get(forecast_url, params=forecast_params, timeout=10)
        if forecast_response.status_code == 200:
            forecast_data = forecast_response.json()
            # Get tomorrow's forecast (24 hours from now)
            tomorrow_forecast = forecast_data["list"][8]  # 24 hours = 8 * 3 hour intervals
            weather_info["precipitation_chance"] = tomorrow_forecast.get("pop", 0) * 100
        else:
            weather_info["precipitation_chance"] = 0
            
        return weather_info
        
    except Exception as e:
        print(f"Weather API error: {e}")
        # Fallback weather data
        return {
            "temperature": 32.5,
            "condition": "Partly Cloudy",
            "description": "partly cloudy",
            "humidity": 65,
            "wind_speed": 12.5,
            "visibility": 8.2,
            "pressure": 1013,
            "feels_like": 34.2,
            "precipitation_chance": 20
        }

def get_real_route_data(origin: dict, destination: dict, departure_time: str = None) -> dict:
    """Get real route data from OpenRoute API"""
    try:
        url = "https://api.openrouteservice.org/v2/directions/driving-car"
        
        headers = {
            "Authorization": OPENROUTE_API_KEY,
            "Content-Type": "application/json"
        }
        
        body = {
            "coordinates": [
                [origin["lon"], origin["lat"]],
                [destination["lon"], destination["lat"]]
            ],
            "instructions": True,
            "geometry": True,
            "preference": "fastest",
            "units": "km"
        }
        
        if departure_time:
            body["departure"] = departure_time
        
        response = requests.post(url, headers=headers, json=body, timeout=15)
        response.raise_for_status()
        
        data = response.json()
        
        if "features" in data and len(data["features"]) > 0:
            route = data["features"][0]["properties"]["segments"][0]
            
            return {
                "distance_km": route["distance"] / 1000,  # Convert to km
                "estimated_time_minutes": route["duration"] / 60,  # Convert to minutes
                "steps": route.get("steps", []),
                "geometry": data["features"][0]["geometry"]
            }
        else:
            raise Exception("No route found")
            
    except Exception as e:
        print(f"Route API error: {e}")
        # Try OSRM public API as a secondary fallback for routing
        try:
            osrm_url = "https://router.project-osrm.org/route/v1/driving/"
            coords = f"{origin['lon']},{origin['lat']};{destination['lon']},{destination['lat']}"
            osrm_params = {
                "overview": "false",
                "alternatives": "false",
                "steps": "false"
            }
            osrm_resp = requests.get(osrm_url + coords, params=osrm_params, timeout=10)
            if osrm_resp.status_code == 200:
                osrm_data = osrm_resp.json()
                if osrm_data.get("routes"):
                    r = osrm_data["routes"][0]
                    return {
                        "distance_km": round((r.get("distance", 0) / 1000.0), 2),
                        "estimated_time_minutes": round((r.get("duration", 0) / 60.0), 1),
                        "steps": [],
                        "geometry": None
                    }
        except Exception as osrm_err:
            print(f"OSRM fallback error: {osrm_err}")

        # Final numeric fallback based on lat/lon delta
        lat_diff = abs(origin["lat"] - destination["lat"])
        lon_diff = abs(origin["lon"] - destination["lon"])
        distance = (lat_diff + lon_diff) * 111  # Rough km conversion

        return {
            "distance_km": round(distance, 2),
            "estimated_time_minutes": round(distance * 2.5, 1),
            "steps": [],
            "geometry": None
        }

def find_nearest_industrial_hub(lat: float, lon: float) -> dict:
    """Find the nearest industrial hub to given coordinates"""
    min_distance = float('inf')
    nearest_hub = None
    
    for hub_name, hub_data in DELHI_INDUSTRIAL_HUBS.items():
        hub_lat = hub_data["coordinates"]["lat"]
        hub_lon = hub_data["coordinates"]["lon"]
        
        # Calculate distance (simplified)
        distance = ((lat - hub_lat) ** 2 + (lon - hub_lon) ** 2) ** 0.5
        
        if distance < min_distance:
            min_distance = distance
            nearest_hub = hub_data
    
    return nearest_hub

def analyze_weather_impact(weather: dict) -> dict:
    """Analyze how weather affects delivery"""
    impact = {
        "severity": "low",
        "factors": [],
        "estimated_delay": 0
    }
    
    if weather.get("precipitation_chance", 0) > 50:
        impact["severity"] = "high"
        impact["factors"].append("Rain expected")
        impact["estimated_delay"] += 30
    
    if weather.get("visibility", 10) < 5:
        impact["severity"] = "medium"
        impact["factors"].append("Low visibility")
        impact["estimated_delay"] += 15
    
    if weather.get("wind_speed", 0) > 20:
        impact["factors"].append("High winds")
        impact["estimated_delay"] += 10
    
    if weather.get("temperature", 25) > 35:
        impact["factors"].append("High temperature")
        impact["estimated_delay"] += 5
    
    return impact

def generate_ai_suggestions(weather: dict, route_data: dict, origin_hub: dict = None, dest_hub: dict = None) -> List[str]:
    """Generate AI-powered suggestions based on real data"""
    suggestions = []
    
    # Route-based suggestions
    if route_data["estimated_time_minutes"] > 120:
        suggestions.append("Consider breaking journey into segments")
        suggestions.append("Plan for fuel stops along the way")
    
    # Weather-based suggestions
    if weather.get("precipitation_chance", 0) > 50:
        suggestions.append("Pack waterproof covers for cargo")
        suggestions.append("Allow extra time for loading/unloading")
    
    if weather.get("temperature", 25) > 35:
        suggestions.append("Ensure proper ventilation for perishable goods")
        suggestions.append("Monitor temperature-sensitive cargo")
    
    if weather.get("visibility", 10) < 5:
        suggestions.append("Use fog lights and drive carefully")
        suggestions.append("Consider delaying delivery if possible")
    
    # Industrial hub specific suggestions
    if origin_hub:
        if origin_hub["traffic_level"] == "High":
            suggestions.append(f"High traffic expected at {origin_hub['name']} during peak hours")
        suggestions.append(f"Industrial hub type: {origin_hub['type']} - ensure appropriate packaging")
    
    if dest_hub:
        if dest_hub["traffic_level"] == "High":
            suggestions.append(f"Plan arrival at {dest_hub['name']} outside peak hours: {dest_hub['peak_hours']}")
    
    # General suggestions
    suggestions.append("Use real-time traffic updates for dynamic routing")
    suggestions.append("Consider micro-warehouses for last-mile delivery")
    suggestions.append("Monitor air quality for delivery personnel safety")
    
    return suggestions

def calculate_risk_score(weather: dict, route_data: dict, origin_hub: dict = None, dest_hub: dict = None) -> int:
    """Calculate delivery risk score (0-100)"""
    risk = 20  # Base risk
    
    # Weather risks
    if weather.get("precipitation_chance", 0) > 50:
        risk += 25
    if weather.get("visibility", 10) < 5:
        risk += 20
    if weather.get("wind_speed", 0) > 20:
        risk += 15
    if weather.get("temperature", 25) > 35:
        risk += 10
    
    # Route risks
    if route_data["estimated_time_minutes"] > 180:  # More than 3 hours
        risk += 15
    
    # Traffic risks
    if origin_hub and origin_hub["traffic_level"] == "High":
        risk += 10
    if dest_hub and dest_hub["traffic_level"] == "High":
        risk += 10
    
    return min(risk, 100)

@app.get("/")
async def root():
    return {"message": "CargoCrazee AI Service is running!", "version": "1.0.0"}

@app.get("/weather/delhi")
async def get_delhi_weather():
    """Get Delhi weather forecast using OpenWeather API"""
    delhi_coords = {"lat": 28.6139, "lon": 77.2090}  # Delhi center
    weather_data = get_real_weather_data(delhi_coords["lat"], delhi_coords["lon"])
    
    return {
        "location": "Delhi, India",
        "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "weather": weather_data,
        "forecast_source": "OpenWeather API",
        "last_updated": datetime.now().isoformat()
    }

@app.post("/route/optimize")
async def optimize_delivery_route(request: RouteRequest):
    """AI-powered route optimization with real weather and route data"""
    
    try:
        # Get real weather data for origin and destination
        weather_origin = get_real_weather_data(request.origin["lat"], request.origin["lon"])
        weather_destination = get_real_weather_data(request.destination["lat"], request.destination["lon"])
        
        # Get real route data
        route_data = get_real_route_data(request.origin, request.destination, request.departure_time)
        
        # Find nearest industrial hubs
        origin_hub = find_nearest_industrial_hub(request.origin["lat"], request.origin["lon"])
        dest_hub = find_nearest_industrial_hub(request.destination["lat"], request.destination["lon"])
        
        # Analyze weather impact based on origin weather (as starting conditions)
        weather_impact = analyze_weather_impact(weather_origin)
        
        # Generate AI suggestions
        ai_suggestions = generate_ai_suggestions(weather_origin, route_data, origin_hub, dest_hub)
        
        # Calculate risk score (use origin weather as baseline)
        risk_score = calculate_risk_score(weather_origin, route_data, origin_hub, dest_hub)
        
        # Build optimization result
        optimization_result = {
            "optimized_route": {
                "distance_km": round(route_data["distance_km"], 2),
                "estimated_time_minutes": round(route_data["estimated_time_minutes"], 1),
                "weather_impact": weather_impact,
                "recommendations": ai_suggestions[:3]  # Top 3 recommendations
            },
            "ai_suggestions": ai_suggestions,
            "risk_score": risk_score,
            "confidence": 0.92 if route_data.get("geometry") else 0.75
        }
        
        # Add industrial hub information
        hub_info = {}
        if origin_hub:
            hub_info["origin_hub"] = {
                "name": origin_hub["name"],
                "type": origin_hub["type"],
                "traffic_level": origin_hub["traffic_level"],
                "peak_hours": origin_hub["peak_hours"]
            }
        if dest_hub:
            hub_info["destination_hub"] = {
                "name": dest_hub["name"],
                "type": dest_hub["type"],
                "traffic_level": dest_hub["traffic_level"],
                "peak_hours": dest_hub["peak_hours"]
            }
        
        result = {
            "status": "success",
            "optimization": optimization_result,
            "weather_context": {
                "pickup_location": {
                    "coordinates": request.origin,
                    "weather": weather_origin
                },
                "delivery_location": {
                    "coordinates": request.destination,
                    "weather": weather_destination
                },
                "forecast": weather_destination,
                "impact_analysis": "Weather conditions analyzed for optimal routing"
            },
            "industrial_hubs": hub_info,
            "ai_insights": {
                "route_efficiency": "Optimized for current weather and traffic conditions",
                "risk_assessment": f"Risk score: {risk_score}/100",
                "recommendations_count": len(ai_suggestions),
                "data_source": "OpenWeather + OpenRoute APIs"
            }
        }
        
        return result
        
    except Exception as e:
        # Best-effort fallback so UI can still render metrics
        try:
            print(f"AI optimization error: {e}")
            # Fallback weather for both points
            weather_origin = get_real_weather_data(request.origin.get("lat", 0), request.origin.get("lon", 0))
            weather_destination = get_real_weather_data(request.destination.get("lat", 0), request.destination.get("lon", 0))

            # Fallback route from lat/lon deltas
            lat_diff = abs(request.origin.get("lat", 0) - request.destination.get("lat", 0))
            lon_diff = abs(request.origin.get("lon", 0) - request.destination.get("lon", 0))
            distance = (lat_diff + lon_diff) * 111
            route_data = {
                "distance_km": round(distance, 2),
                "estimated_time_minutes": round(distance * 2.5, 1),
                "steps": [],
                "geometry": None,
            }

            origin_hub = find_nearest_industrial_hub(request.origin.get("lat", 0), request.origin.get("lon", 0))
            dest_hub = find_nearest_industrial_hub(request.destination.get("lat", 0), request.destination.get("lon", 0))
            weather_impact = analyze_weather_impact(weather_origin)
            ai_suggestions = generate_ai_suggestions(weather_origin, route_data, origin_hub, dest_hub)
            risk_score = calculate_risk_score(weather_origin, route_data, origin_hub, dest_hub)

            optimization_result = {
                "optimized_route": {
                    "distance_km": route_data["distance_km"],
                    "estimated_time_minutes": route_data["estimated_time_minutes"],
                    "weather_impact": weather_impact,
                    "recommendations": ai_suggestions[:3]
                },
                "ai_suggestions": ai_suggestions,
                "risk_score": risk_score,
                "confidence": 0.7
            }

            hub_info = {}
            if origin_hub:
                hub_info["origin_hub"] = {
                    "name": origin_hub["name"],
                    "type": origin_hub["type"],
                    "traffic_level": origin_hub["traffic_level"],
                    "peak_hours": origin_hub["peak_hours"],
                }
            if dest_hub:
                hub_info["destination_hub"] = {
                    "name": dest_hub["name"],
                    "type": dest_hub["type"],
                    "traffic_level": dest_hub["traffic_level"],
                    "peak_hours": dest_hub["peak_hours"],
                }

            return {
                "status": "success",
                "optimization": optimization_result,
                "weather_context": {
                    "pickup_location": {"coordinates": request.origin, "weather": weather_origin},
                    "delivery_location": {"coordinates": request.destination, "weather": weather_destination},
                    "forecast": weather_destination,
                    "impact_analysis": "Weather conditions analyzed for optimal routing (fallback)",
                },
                "industrial_hubs": hub_info,
                "ai_insights": {
                    "route_efficiency": "Fallback route metrics computed",
                    "risk_assessment": f"Risk score: {risk_score}/100",
                    "recommendations_count": len(ai_suggestions),
                    "data_source": "OpenWeather + OSRM/Heuristic",
                },
            }
        except Exception as inner_e:
            print(f"Fallback assembly error: {inner_e}")
            raise HTTPException(status_code=500, detail="AI optimization failed")

@app.get("/industrial-hubs")
async def get_industrial_hubs():
    """Get all Delhi industrial hubs"""
    return {
        "status": "success",
        "hubs": DELHI_INDUSTRIAL_HUBS,
        "count": len(DELHI_INDUSTRIAL_HUBS)
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "CargoCrazee AI",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Real-time Route Optimization",
            "Live Weather Analysis", 
            "Industrial Hub Intelligence",
            "Risk Assessment",
            "AI Suggestions"
        ],
        "apis": {
            "weather": "OpenWeather API",
            "routing": "OpenRoute API"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
