from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from enum import Enum
import re

class ProposalCategory(str, Enum):
    EDUCATION = "education"
    HEALTHCARE = "healthcare"
    ENVIRONMENT = "environment"
    COMMUNITY = "community"
    TECHNOLOGY = "technology"
    OTHER = "other"

class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class AnalysisRequest(BaseModel):
    title: str = Field(..., min_length=10, max_length=100, description="Proposal title")
    description: str = Field(..., min_length=50, max_length=2000, description="Proposal description")
    amount: float = Field(..., gt=0, description="Funding amount in ETH")
    category: Optional[ProposalCategory] = Field(None, description="Proposal category")
    
    @validator('title')
    def validate_title(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        if v > 1000:  # Reasonable upper limit
            raise ValueError('Amount seems unreasonably high')
        return v

class AIAnalysis(BaseModel):
    sentiment: SentimentType
    impact_score: float = Field(..., ge=0, le=10, description="Social impact score (0-10)")
    feasibility_score: float = Field(..., ge=0, le=10, description="Feasibility score (0-10)")
    clarity_score: float = Field(..., ge=0, le=10, description="Clarity and detail score (0-10)")
    budget_appropriateness: float = Field(..., ge=0, le=10, description="Budget appropriateness score (0-10)")
    summary: str = Field(..., max_length=500, description="AI-generated summary")
    recommendations: List[str] = Field(default_factory=list, description="Improvement recommendations")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risk factors")
    strengths: List[str] = Field(default_factory=list, description="Proposal strengths")

class AnalysisResponse(BaseModel):
    score: float = Field(..., ge=0, le=10, description="Overall AI score (0-10)")
    sentiment: SentimentType
    impact_score: float = Field(..., ge=0, le=10)
    feasibility_score: float = Field(..., ge=0, le=10)
    clarity_score: float = Field(..., ge=0, le=10)
    budget_appropriateness: float = Field(..., ge=0, le=10)
    summary: str
    recommendations: List[str]
    risk_factors: List[str]
    strengths: List[str]
    confidence: float = Field(..., ge=0, le=1, description="Analysis confidence level")
    processing_time: float = Field(..., description="Analysis processing time in seconds")

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    environment: str
    services: Dict[str, Any]

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None

class BatchAnalysisRequest(BaseModel):
    proposals: List[AnalysisRequest] = Field(..., max_items=10, description="List of proposals to analyze")

class BatchAnalysisResponse(BaseModel):
    results: List[AnalysisResponse]
    total_processed: int
    processing_time: float
