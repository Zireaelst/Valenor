from fastapi import APIRouter, HTTPException, Depends
from typing import List
import time

from app.models.schemas import (
    AnalysisRequest, 
    AnalysisResponse, 
    BatchAnalysisRequest, 
    BatchAnalysisResponse
)
from app.services.ai_analyzer import AIAnalyzer
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Initialize AI analyzer
ai_analyzer = AIAnalyzer()

@router.post("/", response_model=AnalysisResponse)
async def analyze_proposal(request: AnalysisRequest):
    """
    Analyze a single proposal and return AI-powered scoring and insights.
    
    This endpoint provides comprehensive analysis including:
    - Overall quality score (0-10)
    - Sentiment analysis
    - Impact potential assessment
    - Feasibility evaluation
    - Clarity and detail scoring
    - Budget appropriateness analysis
    - AI-generated summary and recommendations
    """
    try:
        logger.info(f"Analyzing proposal: {request.title[:50]}...")
        
        # Perform analysis
        result = ai_analyzer.analyze_proposal(request)
        
        logger.info(f"Analysis completed in {result.processing_time}s with score {result.score}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error analyzing proposal: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/batch", response_model=BatchAnalysisResponse)
async def analyze_proposals_batch(request: BatchAnalysisRequest):
    """
    Analyze multiple proposals in batch for efficiency.
    
    Maximum 10 proposals per batch to ensure reasonable processing time.
    """
    try:
        if len(request.proposals) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 proposals allowed per batch"
            )
        
        logger.info(f"Analyzing batch of {len(request.proposals)} proposals")
        start_time = time.time()
        
        results = []
        for i, proposal in enumerate(request.proposals):
            try:
                result = ai_analyzer.analyze_proposal(proposal)
                results.append(result)
                logger.info(f"Batch item {i+1}/{len(request.proposals)} completed")
            except Exception as e:
                logger.error(f"Error analyzing proposal {i+1}: {str(e)}")
                # Add error result
                results.append(AnalysisResponse(
                    score=0.0,
                    sentiment="neutral",
                    impact_score=0.0,
                    feasibility_score=0.0,
                    clarity_score=0.0,
                    budget_appropriateness=0.0,
                    summary=f"Analysis failed: {str(e)}",
                    recommendations=["Manual review required"],
                    risk_factors=["Analysis error"],
                    strengths=[],
                    confidence=0.0,
                    processing_time=0.0
                ))
        
        total_time = time.time() - start_time
        
        logger.info(f"Batch analysis completed in {total_time:.2f}s")
        
        return BatchAnalysisResponse(
            results=results,
            total_processed=len(results),
            processing_time=total_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch analysis failed: {str(e)}"
        )

@router.get("/health")
async def analysis_health():
    """
    Check the health of the analysis service.
    """
    try:
        # Test with a simple proposal
        test_request = AnalysisRequest(
            title="Test Proposal for Health Check",
            description="This is a test proposal to verify the analysis service is working correctly. It includes basic elements like objectives, timeline, and expected outcomes.",
            amount=1.0,
            category="other"
        )
        
        start_time = time.time()
        result = ai_analyzer.analyze_proposal(test_request)
        processing_time = time.time() - start_time
        
        return {
            "status": "healthy",
            "service": "analysis",
            "test_score": result.score,
            "processing_time": processing_time,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error(f"Analysis health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "analysis",
            "error": str(e),
            "timestamp": time.time()
        }
