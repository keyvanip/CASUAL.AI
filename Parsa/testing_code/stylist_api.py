from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles
import re

# Set working directory (adjust this path if needed)
os.chdir("/Users/parsakeyvani/Downloads/spring-2025-final-project-project-group-4-1")

# Load your backend logic
from my_backend_module import outfit_agent, WeatherTool, parse_occasion

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI()

# Mount static file path (optional if not serving images this way)
app.mount(
    "/images",
    StaticFiles(directory="/Users/parsakeyvani/Downloads/spring-2025-final-project-project-group-4-1/Parsa/parsa's_wardrobe"),
    name="images",
)

# Allow frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define expected input fields
class OutfitRequest(BaseModel):
    message: str
    gender: Optional[str] = "male"
    color: Optional[str] = None
    lock_top: Optional[dict] = None
    lock_bottom: Optional[dict] = None
    user: Optional[str] = "parsa"

# Initialize weather tool
weather_tool = WeatherTool()

@app.post("/generate-outfit")
def generate_outfit(req: OutfitRequest):
    # Determine city and day from user message
    lowered = req.message.lower()

    # Step 1: Detect if 'tomorrow' is mentioned
    forecast_day = 1 if "tomorrow" in lowered else 0

    # Step 2: Detect the city from the message
    city_candidates = re.findall(r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b', req.message)
    default_city = "Washington"

    if city_candidates:
        city = city_candidates[0]
    else:
        city = default_city

    print(f"🌍 Detected city for weather lookup: {city}")

    temperature, detected_city, forecast_date = weather_tool.get_temperature(city=city, forecast_day=forecast_day)

    combos, outfit_descs, final_recommendation = outfit_agent(
        user_input=req.message,
        temperature=(temperature, detected_city, forecast_date),
        gender=req.gender,
        lock_top=req.lock_top,
        lock_bottom=req.lock_bottom,
        color=req.color,
        refresh=True,
        user=req.user
    )

    return {
        "outfits": combos,
        "outfitDescriptions": outfit_descs,
        "message": final_recommendation,
        "temperature": temperature,
        "location": detected_city,
        "forecastDate": forecast_date,
        "occasion": parse_occasion(req.message)
    }