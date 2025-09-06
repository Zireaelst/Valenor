from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
import re
import uvicorn

app = FastAPI(
    title="Valenor AI Service",
    description="AI-powered proposal analysis service for Valenor DAO",
    version="1.0.0"
)

# Request/Response Models
class ProposalRequest(BaseModel):
    text: str

class ProposalResponse(BaseModel):
    score: Literal["low", "medium", "high"]
    confidence: float
    reasoning: str

# Keyword-based scoring rules for demo
HIGH_PRIORITY_KEYWORDS = [
    # Education keywords
    "education", "school", "student", "learning", "teacher", "academic", "university", "college",
    "literacy", "scholarship", "curriculum", "classroom", "tutoring", "mentoring",
    
    # Healthcare keywords
    "health", "medical", "healthcare", "hospital", "clinic", "doctor", "nurse", "medicine",
    "treatment", "therapy", "vaccination", "mental health", "wellness", "emergency",
    "ambulance", "pharmacy", "surgery", "diagnosis", "prevention", "rehabilitation",
    
    # Environmental keywords
    "environment", "climate", "sustainability", "renewable", "clean energy", "pollution",
    "conservation", "biodiversity", "ecosystem", "green", "carbon", "emission",
    "recycling", "waste management", "water conservation", "air quality",
    
    # Food security keywords
    "food", "hunger", "nutrition", "agriculture", "farming", "crop", "harvest",
    "food security", "malnutrition", "famine", "drought", "irrigation", "seeds",
    "livestock", "fishing", "aquaculture", "food bank", "community garden"
]

MEDIUM_PRIORITY_KEYWORDS = [
    # Infrastructure keywords
    "infrastructure", "road", "bridge", "building", "construction", "housing",
    "transportation", "public transport", "electricity", "water supply", "sanitation",
    
    # Technology keywords
    "technology", "digital", "internet", "computer", "software", "innovation",
    "research", "development", "automation", "artificial intelligence", "data",
    
    # Social keywords
    "community", "social", "welfare", "support", "assistance", "development",
    "empowerment", "training", "skill", "employment", "job", "economic"
]

def analyze_proposal(text: str) -> dict:
    """
    Analyze proposal text using keyword-based scoring rules.
    Returns score, confidence, and reasoning.
    """
    if not text or not text.strip():
        return {
            "score": "low",
            "confidence": 0.0,
            "reasoning": "Empty or invalid proposal text"
        }
    
    # Convert to lowercase for case-insensitive matching
    text_lower = text.lower()
    
    # Count keyword matches
    high_matches = []
    medium_matches = []
    
    for keyword in HIGH_PRIORITY_KEYWORDS:
        if keyword in text_lower:
            high_matches.append(keyword)
    
    for keyword in MEDIUM_PRIORITY_KEYWORDS:
        if keyword in text_lower:
            medium_matches.append(keyword)
    
    # Calculate score based on matches
    total_high = len(high_matches)
    total_medium = len(medium_matches)
    total_keywords = total_high + total_medium
    
    # Determine score
    if total_high >= 2 or (total_high >= 1 and total_medium >= 2):
        score = "high"
        confidence = min(0.9, 0.6 + (total_high * 0.1) + (total_medium * 0.05))
    elif total_high >= 1 or total_medium >= 2:
        score = "medium"
        confidence = min(0.8, 0.4 + (total_high * 0.15) + (total_medium * 0.1))
    else:
        score = "low"
        confidence = max(0.1, 0.3 - (total_keywords * 0.05))
    
    # Generate reasoning
    reasoning_parts = []
    if high_matches:
        reasoning_parts.append(f"High-priority keywords found: {', '.join(high_matches[:3])}")
    if medium_matches:
        reasoning_parts.append(f"Medium-priority keywords found: {', '.join(medium_matches[:3])}")
    
    if not reasoning_parts:
        reasoning_parts.append("No priority keywords detected")
    
    reasoning = ". ".join(reasoning_parts) + f". Total keyword matches: {total_keywords}"
    
    return {
        "score": score,
        "confidence": round(confidence, 2),
        "reasoning": reasoning
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Valenor AI Service is running",
        "version": "1.0.0",
        "endpoints": {
            "analyze_proposal": "POST /analyze_proposal",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "valenor-ai-service",
        "version": "1.0.0"
    }

@app.post("/analyze_proposal", response_model=ProposalResponse)
async def analyze_proposal_endpoint(request: ProposalRequest):
    """
    Analyze a proposal text and return a score (low/medium/high).
    
    The scoring is based on keyword analysis:
    - High: Education, healthcare, environment, food security keywords
    - Medium: Infrastructure, technology, social development keywords
    - Low: Other or no priority keywords
    """
    try:
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Proposal text must be at least 10 characters long"
            )
        
        if len(request.text) > 10000:
            raise HTTPException(
                status_code=400,
                detail="Proposal text must be less than 10,000 characters"
            )
        
        result = analyze_proposal(request.text)
        
        return ProposalResponse(
            score=result["score"],
            confidence=result["confidence"],
            reasoning=result["reasoning"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/keywords")
async def get_keywords():
    """Get the list of keywords used for scoring (for debugging/testing)"""
    return {
        "high_priority": HIGH_PRIORITY_KEYWORDS,
        "medium_priority": MEDIUM_PRIORITY_KEYWORDS,
        "total_high": len(HIGH_PRIORITY_KEYWORDS),
        "total_medium": len(MEDIUM_PRIORITY_KEYWORDS)
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )