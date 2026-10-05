# WalletWise 💰

### AI-Powered Personal Finance Intelligence Platform

WalletWise is a full-stack personal finance management platform that combines **MERN Stack, Machine Learning, Generative AI and Agentic AI** to help users track, analyze, predict and manage their finances.

Instead of functioning only as an expense tracker, WalletWise transforms financial data into actionable insights through analytics, prediction, anomaly detection, AI-powered recommendations and intelligent financial actions.

---

## 🚀 Key Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Protected routes
* Password recovery

### 💰 Transaction Management

* Add income and expenses
* Edit and delete transactions
* Categorize transactions
* Transaction history
* AI-assisted transaction categorization

### 📊 Dashboard

* Total income
* Total expenses
* Current balance
* Budget overview
* Financial statistics
* Spending insights

### 💳 Budget Management

* Create budgets
* Track budget utilization
* Category-based budgeting
* Budget monitoring
* Overspending detection

### 🎯 Financial Goals

* Create financial goals
* Track goal progress
* Monitor target amounts
* Calculate remaining requirements

### 📈 Analytics

* Income vs expense analysis
* Category-wise spending
* Monthly financial trends
* Interactive charts
* Historical financial analysis

### 🤖 Machine Learning

WalletWise includes a Python-based ML service using FastAPI.

ML capabilities include:

* Spending prediction
* Cash-flow prediction
* Expense anomaly detection
* Financial pattern analysis

### 🧠 Generative AI

The AI Advisor provides personalized financial guidance based on the user's financial context.

Examples:

* Spending recommendations
* Budget suggestions
* Financial explanations
* Personalized questions and answers
* Expense insights

### 🤖 Agentic AI

WalletWise extends AI beyond simple chat by introducing an agent-based workflow.

The agent can reason about financial tasks and interact with application tools while respecting the approval workflow for sensitive actions.

### 🧮 What-If Financial Simulator

Users can simulate hypothetical financial scenarios.

For example:

* Increasing monthly income
* Reducing expenses
* Increasing savings
* Changing financial targets

The simulator estimates how these changes could affect future financial outcomes.

### 👤 Profile & Account

* User profile
* Account information
* Personal settings
* Profile avatar
* Account management

---

# 🏗️ System Architecture

```text
                         USER
                           │
                           ▼
                  React + Vite Frontend
                           │
                         Axios
                           │
                           ▼
                  Node.js + Express API
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
          MongoDB      FastAPI ML      AI Layer
                         Service        / Agent
             │             │             │
             ▼             ▼             ▼
       Financial Data   ML Models    AI Decisions
                           │
                           ▼
                    Financial Insights
```

---

# 🛠️ Technology Stack

## Frontend

* React
* Vite
* Axios
* Recharts
* Lucide React
* CSS

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* REST APIs

## Machine Learning

* Python
* FastAPI
* NumPy
* Pandas
* Scikit-learn

## Artificial Intelligence

* Generative AI
* Gemini API
* AI Advisor
* Agentic AI

## DevOps

* Docker
* Docker Compose
* Git
* GitHub

---

# 📁 Project Structure

```text
WalletWise/
├── backend/
├── frontend/
├── ml-service/
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd WalletWise
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## 4. Install ML dependencies

```bash
cd ../ml-service
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Create the required `.env` files using the provided environment variable examples.

Required services may include:

* MongoDB
* Gemini API
* Cloudinary

Never commit actual API keys or passwords to GitHub.

---

# ▶️ Running the Application

## Backend

```bash
cd backend
npm start
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## ML Service

```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

ML service runs on:

```text
http://localhost:8000
```

---

# 🐳 Docker

WalletWise can also be executed using Docker Compose.

```bash
docker compose up --build
```

To stop the services:

```bash
docker compose down
```

---

# 🔄 Application Flow

```text
User
 ↓
React Frontend
 ↓
Express REST API
 ↓
Authentication Middleware
 ↓
Business Logic
 ↓
MongoDB
 ↓
Analytics / ML / AI
 ↓
Personalized Financial Insight
 ↓
React Dashboard
```

---

# 🧠 AI/ML Flow

```text
Financial Transactions
          ↓
     Data Processing
          ↓
       ML Service
          ↓
 ┌────────┼───────────┐
 ↓        ↓           ↓
Prediction Anomaly  Cash Flow
 ↓        ↓           ↓
 └────────┼───────────┘
          ↓
      AI Advisor
          ↓
 Personalized Recommendation
```

---

# 🔒 Security

WalletWise implements several security practices:

* JWT authentication
* Protected API routes
* User-specific database queries
* Environment-based secrets
* Authentication middleware
* Input validation
* CORS configuration
* Centralized error handling

---

# 🎯 Project Objective

The primary objective of WalletWise is to demonstrate how modern full-stack development can be combined with Machine Learning, Generative AI and Agentic AI to build an intelligent financial application.

The system aims to move from:

**Financial Tracking → Financial Analysis → Financial Prediction → Financial Intelligence → Assisted Financial Action**

---

# 🔮 Future Enhancements

Potential future improvements include:

* Bank account integration
* UPI transaction integration
* Real-time financial notifications
* Advanced financial forecasting
* More sophisticated ML models
* Investment portfolio analysis
* Voice-based AI financial assistant
* Mobile application
* Multi-currency support
* Advanced agentic financial automation

---

# 👨‍💻 Developer

**Ekhlaque Ahmed**

B.Tech Computer Science & Engineering
Artificial Intelligence & Machine Learning

---

# ⭐ Project Vision

WalletWise aims to become an intelligent personal financial companion that helps users understand where their money goes, predict what may happen next and make better financial decisions.
