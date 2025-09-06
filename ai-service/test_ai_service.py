#!/usr/bin/env python3
"""
Test script for Valenor AI Service
Tests the proposal analysis logic without requiring FastAPI dependencies
"""

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

def test_ai_service():
    """Test the AI service with various proposal examples"""
    
    test_cases = [
        {
            "name": "Education Proposal",
            "text": "Fund education initiative to support 500 students in underserved communities with scholarships and learning materials",
            "expected_score": "high"
        },
        {
            "name": "Healthcare Proposal", 
            "text": "Establish mobile healthcare units in rural areas to provide essential medical services and emergency care",
            "expected_score": "high"
        },
        {
            "name": "Environmental Proposal",
            "text": "Support environmental cleanup initiative focusing on climate action and sustainability in the Pacific region",
            "expected_score": "high"
        },
        {
            "name": "Food Security Proposal",
            "text": "Fund agriculture and food security programs to combat hunger and malnutrition in developing regions",
            "expected_score": "high"
        },
        {
            "name": "Infrastructure Proposal",
            "text": "Build new roads and improve transportation infrastructure in the community",
            "expected_score": "medium"
        },
        {
            "name": "Technology Proposal",
            "text": "Develop digital innovation and software solutions for community development",
            "expected_score": "medium"
        },
        {
            "name": "Social Development Proposal",
            "text": "Provide community support and training programs for employment and skill development",
            "expected_score": "medium"
        },
        {
            "name": "Low Priority Proposal",
            "text": "Organize a community festival and entertainment event for local residents",
            "expected_score": "low"
        },
        {
            "name": "Empty Proposal",
            "text": "",
            "expected_score": "low"
        }
    ]
    
    print("🧪 Testing Valenor AI Service")
    print("=" * 50)
    
    passed = 0
    total = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. {test_case['name']}")
        print(f"   Text: {test_case['text'][:60]}{'...' if len(test_case['text']) > 60 else ''}")
        
        result = analyze_proposal(test_case['text'])
        
        print(f"   Score: {result['score']}")
        print(f"   Confidence: {result['confidence']}")
        print(f"   Reasoning: {result['reasoning']}")
        
        if result['score'] == test_case['expected_score']:
            print("   ✅ PASS")
            passed += 1
        else:
            print(f"   ❌ FAIL - Expected: {test_case['expected_score']}, Got: {result['score']}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! AI service is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == total

if __name__ == "__main__":
    test_ai_service()

