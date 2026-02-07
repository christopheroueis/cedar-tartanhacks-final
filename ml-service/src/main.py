"""
ClimateCredit ML Service - Climate Risk Prediction API

Provides machine learning predictions for:
- Climate risk scores
- Default probability modeling
- Crop vulnerability analysis
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import numpy as np
import joblib
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Model path
MODEL_DIR = Path(__file__).parent.parent / "models"

# Global model storage
ml_models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    print("🧠 Loading ML models...")
    
    # Try to load pre-trained model, or create demo model
    model_path = MODEL_DIR / "climate_risk_model.joblib"
    if model_path.exists():
        ml_models["climate_risk"] = joblib.load(model_path)
        print(f"✅ Loaded model from {model_path}")
    else:
        # Create a simple demo model
        ml_models["climate_risk"] = DemoClimateRiskModel()
        print("⚠️ Using demo model (no trained model found)")
    
    yield
    
    # Cleanup
    ml_models.clear()


app = FastAPI(
    title="ClimateCredit ML Service",
    description="Machine learning predictions for climate-informed lending",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic Models ==============

class LocationData(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    
class ClimateInput(BaseModel):
    flood_risk: float = Field(..., ge=0, le=1)
    drought_risk: float = Field(..., ge=0, le=1)
    heatwave_risk: float = Field(..., ge=0, le=1)

class LoanInput(BaseModel):
    amount: float = Field(..., gt=0)
    purpose: str
    crop_type: Optional[str] = None

class ClientInput(BaseModel):
    age: int = Field(..., ge=18, le=100)
    existing_loans: int = Field(default=0, ge=0)
    repayment_history: float = Field(default=95, ge=0, le=100)

class PredictionRequest(BaseModel):
    location: LocationData
    climate: ClimateInput
    loan: LoanInput
    client: ClientInput

class PredictionResponse(BaseModel):
    climate_risk_score: int = Field(..., ge=0, le=100)
    default_probability: Dict[str, float]
    risk_factors: Dict[str, Dict[str, float]]
    recommendation: str
    confidence: float
    model_version: str


# ============== Demo Model ==============

class DemoClimateRiskModel:
    """Simple rule-based model for demo purposes"""
    
    # Crop vulnerability factors
    CROP_VULNERABILITY = {
        "rice": {"flood": 0.9, "drought": 0.7, "heatwave": 0.5},
        "wheat": {"flood": 0.5, "drought": 0.8, "heatwave": 0.7},
        "maize": {"flood": 0.6, "drought": 0.9, "heatwave": 0.8},
        "coffee": {"flood": 0.4, "drought": 0.7, "heatwave": 0.9},
        "tea": {"flood": 0.5, "drought": 0.6, "heatwave": 0.7},
        "sugarcane": {"flood": 0.3, "drought": 0.8, "heatwave": 0.6},
        "vegetables": {"flood": 0.7, "drought": 0.8, "heatwave": 0.7},
        "fruits": {"flood": 0.6, "drought": 0.7, "heatwave": 0.6},
        "cotton": {"flood": 0.5, "drought": 0.9, "heatwave": 0.8},
        "other": {"flood": 0.5, "drought": 0.5, "heatwave": 0.5},
    }
    
    # Purpose weights
    PURPOSE_WEIGHTS = {
        "agriculture": {"flood": 0.4, "drought": 0.4, "heatwave": 0.2},
        "livestock": {"flood": 0.3, "drought": 0.5, "heatwave": 0.2},
        "small_business": {"flood": 0.5, "drought": 0.2, "heatwave": 0.3},
        "housing": {"flood": 0.6, "drought": 0.1, "heatwave": 0.3},
    }
    
    def predict(self, features: dict) -> dict:
        """Generate risk prediction"""
        
        # Extract features
        flood = features["flood_risk"]
        drought = features["drought_risk"]
        heatwave = features["heatwave_risk"]
        purpose = features["purpose"]
        crop_type = features.get("crop_type", "other")
        age = features["age"]
        existing_loans = features["existing_loans"]
        repayment_history = features["repayment_history"]
        
        # Get weights
        weights = self.PURPOSE_WEIGHTS.get(purpose, self.PURPOSE_WEIGHTS["small_business"])
        crop_vuln = self.CROP_VULNERABILITY.get(crop_type, self.CROP_VULNERABILITY["other"])
        
        # Apply crop vulnerability if agriculture
        if purpose == "agriculture" and crop_type:
            flood *= crop_vuln["flood"]
            drought *= crop_vuln["drought"]
            heatwave *= crop_vuln["heatwave"]
        
        # Weighted climate risk
        climate_risk = (
            flood * weights["flood"] +
            drought * weights["drought"] +
            heatwave * weights["heatwave"]
        )
        
        # Scale to 0-100
        risk_score = int(min(100, max(0, climate_risk * 100)))
        
        # Client factors
        client_factor = 1.0
        if age < 25 or age > 60:
            client_factor *= 1.1
        if existing_loans > 2:
            client_factor *= 1.2
        elif existing_loans == 0:
            client_factor *= 0.9
        
        repayment_rate = repayment_history / 100
        client_factor *= (2 - repayment_rate)
        
        # Default probabilities
        base_default = 0.12
        baseline = min(0.5, base_default * client_factor)
        climate_impact = (risk_score / 100) * 0.25
        unadjusted = min(0.65, baseline + climate_impact)
        adjusted = min(0.5, baseline + climate_impact * 0.65)
        
        # Recommendation
        if risk_score <= 35:
            recommendation = "approve"
        elif risk_score <= 65:
            recommendation = "caution"
        else:
            recommendation = "defer"
        
        return {
            "climate_risk_score": risk_score,
            "default_probability": {
                "baseline": round(baseline, 4),
                "unadjusted": round(unadjusted, 4),
                "adjusted": round(adjusted, 4)
            },
            "risk_factors": {
                "flood": {"value": round(flood, 3), "weight": weights["flood"]},
                "drought": {"value": round(drought, 3), "weight": weights["drought"]},
                "heatwave": {"value": round(heatwave, 3), "weight": weights["heatwave"]}
            },
            "recommendation": recommendation,
            "confidence": 0.85,
            "model_version": "demo-1.0"
        }


# ============== API Endpoints ==============

@app.get("/")
async def root():
    return {
        "service": "ClimateCredit ML Service",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "/predict": "POST - Get climate risk prediction",
            "/health": "GET - Health check"
        }
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": "climate_risk" in ml_models
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_climate_risk(request: PredictionRequest):
    """
    Generate climate risk prediction for a loan application.
    
    Takes location, climate data, loan details, and client info
    to produce a risk score and recommendation.
    """
    
    if "climate_risk" not in ml_models:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Prepare features
    features = {
        "latitude": request.location.latitude,
        "longitude": request.location.longitude,
        "flood_risk": request.climate.flood_risk,
        "drought_risk": request.climate.drought_risk,
        "heatwave_risk": request.climate.heatwave_risk,
        "amount": request.loan.amount,
        "purpose": request.loan.purpose,
        "crop_type": request.loan.crop_type,
        "age": request.client.age,
        "existing_loans": request.client.existing_loans,
        "repayment_history": request.client.repayment_history
    }
    
    # Get prediction
    model = ml_models["climate_risk"]
    result = model.predict(features)
    
    return PredictionResponse(**result)


@app.post("/batch-predict")
async def batch_predict(requests: List[PredictionRequest]):
    """Batch predictions for multiple loan applications"""
    
    if "climate_risk" not in ml_models:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    model = ml_models["climate_risk"]
    results = []
    
    for req in requests:
        features = {
            "latitude": req.location.latitude,
            "longitude": req.location.longitude,
            "flood_risk": req.climate.flood_risk,
            "drought_risk": req.climate.drought_risk,
            "heatwave_risk": req.climate.heatwave_risk,
            "amount": req.loan.amount,
            "purpose": req.loan.purpose,
            "crop_type": req.loan.crop_type,
            "age": req.client.age,
            "existing_loans": req.client.existing_loans,
            "repayment_history": req.client.repayment_history
        }
        results.append(model.predict(features))
    
    return {"predictions": results}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
