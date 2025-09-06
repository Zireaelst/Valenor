from fastapi import APIRouter
import time
import psutil
import sys
from typing import Dict, Any

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

@router.get("/")
async def health_check():
    """
    Basic health check endpoint.
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/detailed")
async def detailed_health_check():
    """
    Detailed health check with system information.
    """
    try:
        # System information
        system_info = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "load_average": psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
        }
        
        # Python environment
        python_info = {
            "version": sys.version,
            "platform": sys.platform,
            "executable": sys.executable
        }
        
        # Application configuration
        config_info = {
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "log_level": settings.LOG_LEVEL,
            "max_tokens": settings.MAX_TOKENS,
            "temperature": settings.TEMPERATURE
        }
        
        # Service dependencies
        dependencies = {
            "nltk": _check_nltk(),
            "spacy": _check_spacy(),
            "sklearn": _check_sklearn(),
            "textblob": _check_textblob()
        }
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "version": settings.VERSION,
            "system": system_info,
            "python": python_info,
            "config": config_info,
            "dependencies": dependencies
        }
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "timestamp": time.time(),
            "error": str(e)
        }

def _check_nltk() -> Dict[str, Any]:
    """Check NLTK availability and data."""
    try:
        import nltk
        return {
            "available": True,
            "version": nltk.__version__,
            "data_available": {
                "punkt": _check_nltk_data("tokenizers/punkt"),
                "vader_lexicon": _check_nltk_data("vader_lexicon"),
                "stopwords": _check_nltk_data("corpora/stopwords")
            }
        }
    except ImportError:
        return {"available": False, "error": "NLTK not installed"}

def _check_spacy() -> Dict[str, Any]:
    """Check spaCy availability and model."""
    try:
        import spacy
        return {
            "available": True,
            "version": spacy.__version__,
            "model_loaded": _check_spacy_model()
        }
    except ImportError:
        return {"available": False, "error": "spaCy not installed"}

def _check_sklearn() -> Dict[str, Any]:
    """Check scikit-learn availability."""
    try:
        import sklearn
        return {
            "available": True,
            "version": sklearn.__version__
        }
    except ImportError:
        return {"available": False, "error": "scikit-learn not installed"}

def _check_textblob() -> Dict[str, Any]:
    """Check TextBlob availability."""
    try:
        import textblob
        return {
            "available": True,
            "version": textblob.__version__
        }
    except ImportError:
        return {"available": False, "error": "TextBlob not installed"}

def _check_nltk_data(data_name: str) -> bool:
    """Check if specific NLTK data is available."""
    try:
        import nltk
        nltk.data.find(data_name)
        return True
    except LookupError:
        return False

def _check_spacy_model() -> bool:
    """Check if spaCy model is loaded."""
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        return nlp is not None
    except OSError:
        return False
