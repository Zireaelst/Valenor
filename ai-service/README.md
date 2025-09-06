# Valenor AI Service

AI-powered proposal analysis service for the Valenor Decentralized Autonomous Social Fund.

## Overview

This FastAPI service provides intelligent analysis of governance proposals using keyword-based scoring rules. It helps the community evaluate proposals by assigning priority scores based on their alignment with Valenor's core mission areas.

## Features

- **Proposal Analysis**: Analyze proposal text and return priority scores (low/medium/high)
- **Keyword-Based Scoring**: Uses predefined keywords to identify high-priority areas
- **Confidence Scoring**: Provides confidence levels for analysis results
- **Detailed Reasoning**: Explains why a particular score was assigned
- **Health Monitoring**: Built-in health check endpoints

## Priority Categories

### High Priority (Score: "high")
- **Education**: Schools, students, learning, teachers, scholarships
- **Healthcare**: Medical services, hospitals, mental health, emergency care
- **Environment**: Climate action, sustainability, clean energy, conservation
- **Food Security**: Agriculture, hunger relief, nutrition, food banks

### Medium Priority (Score: "medium")
- **Infrastructure**: Roads, buildings, transportation, utilities
- **Technology**: Digital access, innovation, research, automation
- **Social Development**: Community support, training, employment

### Low Priority (Score: "low")
- All other proposals not matching priority keywords

## API Endpoints

### POST /analyze_proposal
Analyze a proposal and return a priority score.

**Request:**
```json
{
  "text": "Fund education initiative to support 500 students in underserved communities"
}
```

**Response:**
```json
{
  "score": "high",
  "confidence": 0.85,
  "reasoning": "High-priority keywords found: education, student. Total keyword matches: 2"
}
```

### GET /health
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "valenor-ai-service",
  "version": "1.0.0"
}
```

### GET /keywords
Get the list of keywords used for scoring (for debugging/testing).

### GET /
Root endpoint with service information.

## Installation

### Local Development

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ai-service
```

2. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run the service:**
```bash
python main.py
```

The service will be available at `http://localhost:8000`

### Docker Deployment

1. **Build the Docker image:**
```bash
docker build -t valenor-ai-service .
```

2. **Run the container:**
```bash
docker run -p 8000:8000 valenor-ai-service
```

## Usage Examples

### Using curl

```bash
# Analyze a proposal
curl -X POST "http://localhost:8000/analyze_proposal" \
     -H "Content-Type: application/json" \
     -d '{"text": "Fund mobile healthcare units for rural communities"}'

# Health check
curl "http://localhost:8000/health"
```

### Using Python requests

```python
import requests

# Analyze a proposal
response = requests.post(
    "http://localhost:8000/analyze_proposal",
    json={"text": "Support environmental cleanup in Pacific region"}
)

result = response.json()
print(f"Score: {result['score']}")
print(f"Confidence: {result['confidence']}")
print(f"Reasoning: {result['reasoning']}")
```

## Configuration

### Environment Variables

- `PORT`: Port to run the service on (default: 8000)
- `HOST`: Host to bind to (default: 0.0.0.0)
- `LOG_LEVEL`: Logging level (default: info)

### Customizing Keywords

To modify the scoring keywords, edit the `HIGH_PRIORITY_KEYWORDS` and `MEDIUM_PRIORITY_KEYWORDS` lists in `main.py`.

## Development

### Project Structure

```
ai-service/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── Dockerfile          # Container configuration
├── README.md           # This file
└── .env.example        # Environment variables template
```

### Adding New Features

1. **New Analysis Methods**: Add new functions in `main.py`
2. **Additional Endpoints**: Create new route handlers
3. **Enhanced Scoring**: Modify the `analyze_proposal` function
4. **Database Integration**: Add database models and connections

### Testing

```bash
# Run the service
python main.py

# Test endpoints
curl -X POST "http://localhost:8000/analyze_proposal" \
     -H "Content-Type: application/json" \
     -d '{"text": "Test proposal text"}'
```

## Deployment

### Production Deployment

1. **Using Docker:**
```bash
docker build -t valenor-ai-service:latest .
docker run -d -p 8000:8000 --name valenor-ai valenor-ai-service:latest
```

2. **Using Docker Compose:**
```yaml
version: '3.8'
services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
    restart: unless-stopped
```

3. **Cloud Deployment:**
   - **Heroku**: Use the included `Dockerfile`
   - **AWS ECS**: Deploy as containerized service
   - **Google Cloud Run**: Serverless container deployment
   - **Azure Container Instances**: Simple container deployment

### Monitoring

The service includes health check endpoints for monitoring:

- `/health`: Basic health status
- `/`: Service information and available endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Valenor ecosystem and follows the same licensing terms.

## Support

For issues and questions:
- Create an issue in the repository
- Contact the Valenor development team
- Check the documentation for common solutions

