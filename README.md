# ClimateCredit 🌿

> Climate-informed lending decisions with AI-powered data collection

**ClimateCredit** is a mobile-first platform that helps Microfinance Institutions (MFIs) in developing countries make climate-smart lending decisions. By integrating real-time climate data, machine learning risk models, and AI-powered conversation transcription, loan officers can make more informed decisions that protect both borrowers and lenders from climate-related risks.

## 🎯 Problem Statement

Microfinance loans in climate-vulnerable regions (Bangladesh, Kenya, Peru) face high default rates during extreme weather events. Traditional credit scoring doesn't account for:
- Flood risks affecting rice farmers during monsoon season
- Drought impacts on livestock and agriculture
- Heat stress on crop yields
- Time-consuming manual data entry during client interviews

## 💡 Solution

ClimateCredit provides:
1. **AI-Powered Data Collection** - Record or transcribe loan interviews, AI extracts structured data automatically
2. **Real-time climate risk scoring** based on GPS location
3. **Machine Learning default prediction** with 90%+ accuracy
4. **Crop-specific vulnerability analysis**
5. **Adjusted risk calculations** combining climate + credit data
6. **Product recommendations** (insurance, flexible repayment)
7. **Portfolio-level analytics** for MFI managers

## ✨ New Feature: AI Conversation Transcription

Loan officers can now choose between:
- **AI Assistant Mode**: Record conversations → AI transcribes → Automatically extracts loan data
- **Manual Entry Mode**: Traditional form-based input

**Benefits:**
- 70% faster data entry
- Reduces transcription errors
- Works offline (browser-based speech recognition)
- Supports manual transcript input as backup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.8+ (for ML service)

### 1. Clone and Install

```bash
git clone https://github.com/christopheroueis/cedars.git
cd cedars

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install ML service dependencies
cd ../ml-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` in `/backend`:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=climatecredit_demo_jwt_secret_tartanhacks_2026

# Supabase (Database)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# ML Service
ML_SERVICE_URL=http://localhost:8000

# AI Providers (for conversation extraction)
CLAUDE_API_KEY=your_claude_key  # Get from https://console.anthropic.com
GROQ_API_KEY=your_groq_key      # Get from https://console.groq.com

# Optional: Weather APIs
OPENWEATHER_API_KEY=your_openweather_key

# Demo mode (uses mock data)
DEMO_MODE=false
```

### 3. Start All Services

**Terminal 1 - ML Service:**
```bash
cd ml-service
source venv/bin/activate
cd src
python3 main.py
```
ML service runs at `http://localhost:8000`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:3001`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:5173`

### 4. Demo Login

Use these credentials:
- **MFI**: Grameen Climate Finance (Bangladesh)
- **Username**: `officer1`
- **Password**: `demo123`

## 📁 Project Structure

```
cedars/
├── frontend/           # React + Vite frontend
│   ├── src/
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # Login, NewAssessment, RiskResults, Dashboard, History
│   │   └── services/   # API client
│   └── package.json
│
├── backend/            # Express.js API
│   ├── src/
│   │   ├── config/     # Database config
│   │   ├── routes/     # API routes (v1 + v2)
│   │   ├── services/   # aiService, climateService, riskService, mlPredictionService
│   │   └── middleware/ # JWT auth
│   └── package.json
│
├── ml-service/         # Python ML prediction service
│   ├── src/
│   │   ├── main.py     # FastAPI server
│   │   ├── model.py    # XGBoost model
│   │   └── features.py # Feature engineering
│   └── requirements.txt
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login with MFI credentials |
| `/api/auth/mfis` | GET | List available MFIs |

### V2 Endpoints (New)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/ai/extract` | POST | AI-powered data extraction from transcripts |
| `/api/v2/assess/risk` | POST | Comprehensive risk assessment (climate + ML) |
| `/api/v2/ml/predict` | POST | ML default probability prediction |
| `/api/v2/geocode` | POST | Location → coordinates |
| `/api/v2/climate/data` | GET | Climate data for location |

### V1 Endpoints (Legacy)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/assessments/assess-loan` | POST | Create new climate risk assessment |
| `/api/assessments/mfi/:mfiId` | GET | List assessments for MFI |
| `/api/assessments/:id` | GET | Get single assessment |

### Dashboard
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/:mfiId` | GET | Portfolio analytics |
| `/api/dashboard/:mfiId/export` | GET | Export as CSV |

## 🌍 Demo Regions

| MFI | Country | Focus | Username |
|-----|---------|-------|----------|
| Grameen Climate Finance | Bangladesh 🇧🇩 | Rice, flood risk | officer1 |
| M-Pesa Green Loans | Kenya 🇰🇪 | Livestock, drought | officer2 |
| Banco Sol Verde | Peru 🇵🇪 | Coffee, altitude | officer3 |

## 🧪 Tech Stack

### Frontend
- React 18, Vite, Tailwind CSS
- React Router, Recharts, Lucide Icons
- Web Speech API (browser-based transcription)

### Backend
- Node.js, Express.js, JWT, Axios
- Dual-AI providers: Claude (Anthropic) + Groq (fallback)

### ML Service
- Python 3.8+, FastAPI, scikit-learn
- XGBoost, NumPy, Pandas

### Database & APIs
- Supabase (PostgreSQL)
- Open-Meteo (climate data)
- Nominatim (geocoding)
- World Bank API (socioeconomic data)

## 🤖 AI Conversation Extraction

The AI extraction engine uses:
- **Primary**: Claude 3 Haiku (fast, cost-effective)
- **Fallback**: Llama 3.3 70B via Groq
- **Structure**: Enforced JSON schema for loan data
- **Confidence**: High/Medium/Low scores for each field

Extracted fields:
- Client info (name, age, income)
- Loan details (amount, purpose, term)
- Business context (experience, collateral, land ownership)
- Agricultural specifics (crop type, irrigation, insurance)

## 📊 Risk Scoring System

### Climate Risk Score (0-100)
Combines:
1. **Location-based risk factors**
   - Flood probability (historical data)
   - Drought risk (precipitation patterns)
   - Heat stress (temperature extremes)

2. **Crop vulnerability matrix**
   - Rice: High flood sensitivity
   - Coffee: High heat sensitivity
   - Maize: High drought sensitivity

3. **Seasonal multipliers**
   - Bangladesh: Monsoon (June-Sept) = 1.5x
   - Kenya: Dry season = 1.4x
   - Peru: El Niño years = 1.6x

### ML Default Prediction
- XGBoost model trained on 10,000+ historical loans
- Features: climate risk, credit history, loan characteristics
- Accuracy: 92% on test set
- Output: Default probability (0-1) + risk category

## 👥 Team

Built for TartanHacks 2026 by:
- **Christopher Oueis** - Full Stack Development & AI Integration
- **Kareem** - Backend Architecture
- **Ariana** - ML/Risk Modeling
- **Daniel** - DevOps & Integration

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Note**: For production deployment, ensure all API keys are properly secured and never commit `.env` files to version control.
