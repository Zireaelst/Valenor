import time
import re
from typing import Dict, List, Tuple
import numpy as np
from textblob import TextBlob
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings
from app.core.logging import get_logger
from app.models.schemas import AnalysisRequest, AnalysisResponse, SentimentType

logger = get_logger(__name__)

class AIAnalyzer:
    """AI-powered proposal analysis service."""
    
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
        # Download required NLTK data
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('vader_lexicon')
            nltk.data.find('corpora/stopwords')
        except LookupError:
            logger.info("Downloading NLTK data...")
            nltk.download('punkt', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
            nltk.download('stopwords', quiet=True)
        
        # Load spaCy model (fallback to basic if not available)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found, using basic tokenization")
            self.nlp = None
        
        # Initialize reference texts for comparison
        self._init_reference_texts()
    
    def _init_reference_texts(self):
        """Initialize reference texts for quality comparison."""
        self.reference_texts = [
            "This proposal aims to create a community garden that will provide fresh produce to local residents while offering educational opportunities about sustainable agriculture and healthy eating habits.",
            "We propose to establish a digital literacy program for seniors, providing them with essential computer skills, internet safety knowledge, and access to technology resources.",
            "This initiative will support local food banks by providing emergency funding for essential supplies, expanding storage capacity, and improving distribution networks.",
            "Our project focuses on environmental conservation through tree planting, waste reduction programs, and community education about sustainable living practices."
        ]
    
    def analyze_proposal(self, request: AnalysisRequest) -> AnalysisResponse:
        """Analyze a proposal and return comprehensive scoring."""
        start_time = time.time()
        
        try:
            # Combine title and description for analysis
            full_text = f"{request.title}. {request.description}"
            
            # Perform various analyses
            sentiment_score = self._analyze_sentiment(full_text)
            impact_score = self._analyze_impact(full_text, request.category)
            feasibility_score = self._analyze_feasibility(full_text, request.amount)
            clarity_score = self._analyze_clarity(full_text)
            budget_score = self._analyze_budget_appropriateness(request.amount, request.description)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(
                impact_score, feasibility_score, clarity_score, budget_score, sentiment_score
            )
            
            # Generate summary and recommendations
            summary = self._generate_summary(request.title, request.description, overall_score)
            recommendations = self._generate_recommendations(
                impact_score, feasibility_score, clarity_score, budget_score
            )
            risk_factors = self._identify_risk_factors(full_text, request.amount)
            strengths = self._identify_strengths(full_text, overall_score)
            
            # Calculate confidence based on text quality and completeness
            confidence = self._calculate_confidence(full_text, request.amount)
            
            processing_time = time.time() - start_time
            
            return AnalysisResponse(
                score=round(overall_score, 2),
                sentiment=sentiment_score,
                impact_score=round(impact_score, 2),
                feasibility_score=round(feasibility_score, 2),
                clarity_score=round(clarity_score, 2),
                budget_appropriateness=round(budget_score, 2),
                summary=summary,
                recommendations=recommendations,
                risk_factors=risk_factors,
                strengths=strengths,
                confidence=round(confidence, 2),
                processing_time=round(processing_time, 3)
            )
            
        except Exception as e:
            logger.error(f"Error analyzing proposal: {str(e)}")
            # Return default analysis on error
            return self._get_default_analysis(request, time.time() - start_time)
    
    def _analyze_sentiment(self, text: str) -> SentimentType:
        """Analyze sentiment of the proposal text."""
        # Use multiple sentiment analysis methods
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        vader_scores = self.sia.polarity_scores(text)
        compound_score = vader_scores['compound']
        
        # Combine scores
        combined_score = (polarity + compound_score) / 2
        
        if combined_score > 0.1:
            return SentimentType.POSITIVE
        elif combined_score < -0.1:
            return SentimentType.NEGATIVE
        else:
            return SentimentType.NEUTRAL
    
    def _analyze_impact(self, text: str, category: str = None) -> float:
        """Analyze social impact potential."""
        impact_keywords = {
            'education': ['education', 'learning', 'students', 'school', 'knowledge', 'skills'],
            'healthcare': ['health', 'medical', 'wellness', 'treatment', 'care', 'patients'],
            'environment': ['environment', 'sustainability', 'green', 'climate', 'conservation', 'renewable'],
            'community': ['community', 'local', 'residents', 'neighborhood', 'social', 'together'],
            'technology': ['technology', 'digital', 'innovation', 'tech', 'software', 'hardware']
        }
        
        text_lower = text.lower()
        base_score = 5.0
        
        # Category-specific impact scoring
        if category and category in impact_keywords:
            category_words = impact_keywords[category]
            matches = sum(1 for word in category_words if word in text_lower)
            base_score += min(matches * 0.5, 2.0)
        
        # General impact indicators
        impact_indicators = [
            'benefit', 'help', 'support', 'improve', 'enhance', 'create', 'establish',
            'provide', 'offer', 'enable', 'empower', 'transform', 'positive change'
        ]
        
        impact_matches = sum(1 for word in impact_indicators if word in text_lower)
        base_score += min(impact_matches * 0.3, 2.0)
        
        # Scale and reach indicators
        scale_indicators = ['community', 'local', 'regional', 'widespread', 'many', 'multiple']
        scale_matches = sum(1 for word in scale_indicators if word in text_lower)
        base_score += min(scale_matches * 0.2, 1.0)
        
        return min(base_score, 10.0)
    
    def _analyze_feasibility(self, text: str, amount: float) -> float:
        """Analyze feasibility of the proposal."""
        text_lower = text.lower()
        base_score = 5.0
        
        # Feasibility indicators
        feasibility_indicators = [
            'plan', 'timeline', 'schedule', 'steps', 'process', 'methodology',
            'resources', 'team', 'partners', 'budget', 'cost', 'funding'
        ]
        
        feasibility_matches = sum(1 for word in feasibility_indicators if word in text_lower)
        base_score += min(feasibility_matches * 0.4, 2.5)
        
        # Risk indicators (reduce score)
        risk_indicators = [
            'uncertain', 'risky', 'challenging', 'difficult', 'complex', 'unproven',
            'experimental', 'pilot', 'test', 'trial'
        ]
        
        risk_matches = sum(1 for word in risk_indicators if word in text_lower)
        base_score -= min(risk_matches * 0.3, 1.5)
        
        # Amount-based feasibility
        if amount > 10:  # High amount
            base_score -= 1.0
        elif amount < 0.1:  # Very low amount
            base_score += 0.5
        
        return max(min(base_score, 10.0), 0.0)
    
    def _analyze_clarity(self, text: str) -> float:
        """Analyze clarity and detail of the proposal."""
        base_score = 5.0
        
        # Text length analysis
        word_count = len(text.split())
        if word_count > 200:
            base_score += 1.0
        elif word_count < 100:
            base_score -= 1.0
        
        # Structure indicators
        structure_indicators = [
            'objective', 'goal', 'purpose', 'target', 'outcome', 'result',
            'method', 'approach', 'strategy', 'implementation', 'deliverable'
        ]
        
        text_lower = text.lower()
        structure_matches = sum(1 for word in structure_indicators if word in text_lower)
        base_score += min(structure_matches * 0.3, 2.0)
        
        # Specificity indicators
        specificity_indicators = [
            'specific', 'detailed', 'concrete', 'measurable', 'quantifiable',
            'timeline', 'deadline', 'milestone', 'metric', 'kpi'
        ]
        
        specificity_matches = sum(1 for word in specificity_indicators if word in text_lower)
        base_score += min(specificity_matches * 0.4, 2.0)
        
        return min(base_score, 10.0)
    
    def _analyze_budget_appropriateness(self, amount: float, description: str) -> float:
        """Analyze if the budget is appropriate for the proposal."""
        base_score = 5.0
        
        # Amount range analysis
        if 0.1 <= amount <= 5.0:  # Reasonable range
            base_score += 2.0
        elif amount > 10.0:  # Very high
            base_score -= 2.0
        elif amount < 0.01:  # Very low
            base_score -= 1.0
        
        # Budget justification in description
        budget_keywords = ['budget', 'cost', 'funding', 'expense', 'price', 'financial']
        description_lower = description.lower()
        budget_mentions = sum(1 for word in budget_keywords if word in description_lower)
        
        if budget_mentions > 0:
            base_score += 1.0
        
        # Scale indicators
        scale_indicators = ['large', 'small', 'comprehensive', 'basic', 'extensive', 'limited']
        scale_mentions = sum(1 for word in scale_indicators if word in description_lower)
        
        if scale_mentions > 0:
            base_score += 0.5
        
        return max(min(base_score, 10.0), 0.0)
    
    def _calculate_overall_score(self, impact: float, feasibility: float, 
                               clarity: float, budget: float, sentiment: SentimentType) -> float:
        """Calculate weighted overall score."""
        # Weighted average with impact being most important
        weights = {
            'impact': 0.35,
            'feasibility': 0.25,
            'clarity': 0.25,
            'budget': 0.15
        }
        
        base_score = (
            impact * weights['impact'] +
            feasibility * weights['feasibility'] +
            clarity * weights['clarity'] +
            budget * weights['budget']
        )
        
        # Sentiment adjustment
        if sentiment == SentimentType.POSITIVE:
            base_score += 0.5
        elif sentiment == SentimentType.NEGATIVE:
            base_score -= 0.5
        
        return max(min(base_score, 10.0), 0.0)
    
    def _generate_summary(self, title: str, description: str, score: float) -> str:
        """Generate a concise summary of the proposal."""
        if score >= 8.0:
            quality = "high-quality"
        elif score >= 6.0:
            quality = "well-structured"
        elif score >= 4.0:
            quality = "moderate"
        else:
            quality = "needs improvement"
        
        return f"This {quality} proposal titled '{title}' presents a {description[:100]}... The proposal shows {'strong' if score >= 7 else 'moderate' if score >= 5 else 'limited'} potential for social impact."
    
    def _generate_recommendations(self, impact: float, feasibility: float, 
                                clarity: float, budget: float) -> List[str]:
        """Generate improvement recommendations."""
        recommendations = []
        
        if impact < 6.0:
            recommendations.append("Consider emphasizing the social impact and community benefits more clearly")
        
        if feasibility < 6.0:
            recommendations.append("Provide more detailed implementation plans and timeline")
        
        if clarity < 6.0:
            recommendations.append("Add more specific details and measurable outcomes")
        
        if budget < 6.0:
            recommendations.append("Include detailed budget breakdown and cost justification")
        
        if not recommendations:
            recommendations.append("This is a well-structured proposal with good potential")
        
        return recommendations
    
    def _identify_risk_factors(self, text: str, amount: float) -> List[str]:
        """Identify potential risk factors."""
        risks = []
        text_lower = text.lower()
        
        if amount > 5.0:
            risks.append("High funding amount may require additional oversight")
        
        if 'pilot' in text_lower or 'experimental' in text_lower:
            risks.append("Experimental nature may carry implementation risks")
        
        if 'unproven' in text_lower or 'novel' in text_lower:
            risks.append("Unproven approach may have uncertain outcomes")
        
        if len(text.split()) < 150:
            risks.append("Limited detail may indicate insufficient planning")
        
        return risks
    
    def _identify_strengths(self, text: str, score: float) -> List[str]:
        """Identify proposal strengths."""
        strengths = []
        text_lower = text.lower()
        
        if score >= 8.0:
            strengths.append("Comprehensive and well-thought-out proposal")
        
        if 'community' in text_lower and 'benefit' in text_lower:
            strengths.append("Clear community focus and benefit")
        
        if 'timeline' in text_lower or 'schedule' in text_lower:
            strengths.append("Includes implementation timeline")
        
        if 'measurable' in text_lower or 'outcome' in text_lower:
            strengths.append("Defines measurable outcomes")
        
        if not strengths:
            strengths.append("Proposal shows potential for improvement")
        
        return strengths
    
    def _calculate_confidence(self, text: str, amount: float) -> float:
        """Calculate confidence in the analysis."""
        confidence = 0.5  # Base confidence
        
        # Text quality factors
        word_count = len(text.split())
        if word_count > 200:
            confidence += 0.2
        elif word_count < 100:
            confidence -= 0.2
        
        # Amount reasonableness
        if 0.1 <= amount <= 5.0:
            confidence += 0.2
        elif amount > 10.0 or amount < 0.01:
            confidence -= 0.1
        
        # Structure indicators
        structure_words = ['objective', 'plan', 'timeline', 'budget', 'outcome']
        structure_count = sum(1 for word in structure_words if word in text.lower())
        confidence += min(structure_count * 0.05, 0.1)
        
        return max(min(confidence, 1.0), 0.0)
    
    def _get_default_analysis(self, request: AnalysisRequest, processing_time: float) -> AnalysisResponse:
        """Return default analysis when processing fails."""
        return AnalysisResponse(
            score=5.0,
            sentiment=SentimentType.NEUTRAL,
            impact_score=5.0,
            feasibility_score=5.0,
            clarity_score=5.0,
            budget_appropriateness=5.0,
            summary="Analysis temporarily unavailable. Manual review recommended.",
            recommendations=["Review proposal manually", "Consider community feedback"],
            risk_factors=["Analysis service unavailable"],
            strengths=["Proposal submitted for review"],
            confidence=0.3,
            processing_time=processing_time
        )
