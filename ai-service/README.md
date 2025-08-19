# CargoCrazee AI Service

AI-powered route optimization and weather analysis with real API integration for Delhi industrial hubs.

## Features

- **Real Route Optimization**: Using OpenRoute API for accurate routing
- **Live Weather Analysis**: Using OpenWeather API for real-time weather data
- **Industrial Hub Intelligence**: Delhi industrial hubs dataset with traffic patterns
- **Risk Assessment**: Delivery risk scoring based on weather and traffic
- **AI Suggestions**: Smart recommendations for better delivery

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set up environment variables:**
Create a `.env` file in the ai-service directory with your API keys:

```bash
# API Keys for CargoCrazee AI Service
OPENROUTE_API_KEY=your_openroute_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Service Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
```

**Required API Keys:**
- **OpenRoute API Key**: Get from [OpenRoute Service](https://openrouteservice.org/)
- **OpenWeather API Key**: Get from [OpenWeather](https://openweathermap.org/api)

3. **Run the service:**
```bash
python app.py
```

4. **Service will be available at:**
- Main: http://localhost:8000
- Health check: http://localhost:8000/health
- Weather: http://localhost:8000/weather/delhi
- Route optimization: POST http://localhost:8000/route/optimize
- Industrial hubs: GET http://localhost:8000/industrial-hubs

## API Endpoints

### GET /weather/delhi
Get real Delhi weather forecast using OpenWeather API.

### POST /route/optimize
Optimize delivery route with real AI analysis.

**Request Body:**
```json
{
  "origin": {"lat": 28.6139, "lon": 77.2090},
  "destination": {"lat": 28.4595, "lon": 77.0266},
  "departure_time": "2024-01-15T10:00:00Z"
}
```

**Response:**
```json
{
  "status": "success",
  "optimization": {
    "optimized_route": {
      "distance_km": 25.5,
      "estimated_time_minutes": 63.8,
      "weather_impact": {...},
      "recommendations": [...]
    },
    "ai_suggestions": [...],
    "risk_score": 45,
    "confidence": 0.92
  },
  "weather_context": {
    "location": "Delhi",
    "forecast": {...}
  },
  "industrial_hubs": {
    "origin_hub": {...},
    "destination_hub": {...}
  },
  "ai_insights": {
    "route_efficiency": "Optimized for current weather and traffic conditions",
    "risk_assessment": "Risk score: 45/100",
    "recommendations_count": 8,
    "data_source": "OpenWeather + OpenRoute APIs"
  }
}
```

### GET /industrial-hubs
Get all Delhi industrial hubs with traffic patterns and peak hours.

## Delhi Industrial Hubs

The service includes data for 10 major Delhi industrial areas:

1. **Okhla Industrial Area** - Electronics & Textiles
2. **Naraina Industrial Area** - Engineering & Manufacturing
3. **Wazirpur Industrial Area** - Steel & Engineering
4. **Mayapuri Industrial Area** - Automotive & Spare Parts
5. **Kirti Nagar Industrial Area** - Furniture & Wood
6. **Lawrence Road Industrial Area** - Textiles & Garments
7. **Shahdara Industrial Area** - Electronics & Plastic
8. **Patparganj Industrial Area** - Pharmaceuticals & Chemicals
9. **Bawana Industrial Area** - Food Processing & Textiles
10. **Narela Industrial Area** - Heavy Industries & Manufacturing

Each hub includes:
- Coordinates (lat/lon)
- Industry type
- Traffic level (High/Medium/Low)
- Peak hours for delivery planning

## Security

- API keys are stored in environment variables
- No hardcoded credentials in the code
- CORS configured for frontend integration
- Input validation and error handling

## Error Handling

The service includes fallback mechanisms:
- If OpenWeather API fails, uses cached weather data
- If OpenRoute API fails, uses distance calculation
- Graceful degradation with informative error messages
