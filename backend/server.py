from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Mock Data Generation
STAFF_DATA = [
    {
        "name": "Dr. Sarah Johnson",
        "role": "counselor",
        "specialization": "Behavioral Psychology",
        "email": "s.johnson@rehab.com",
        "phone": "+1 (555) 123-4567",
        "caseload": 12,
        "sessionsThisWeek": 8,
        "experience": 8,
        "performanceRating": 94,
        "workloadStatus": "Optimal",
        "certifications": ["LMHC", "CBT", "Trauma-Informed Care"]
    },
    {
        "name": "Michael Chen",
        "role": "therapist",
        "specialization": "Substance Abuse Counseling",
        "email": "m.chen@rehab.com",
        "phone": "+1 (555) 234-5678",
        "caseload": 15,
        "sessionsThisWeek": 12,
        "experience": 6,
        "performanceRating": 91,
        "workloadStatus": "High",
        "certifications": ["CADC", "MINT", "Crisis Intervention"]
    },
    {
        "name": "Emily Rodriguez",
        "role": "educator",
        "specialization": "Adult Education",
        "email": "e.rodriguez@rehab.com",
        "phone": "+1 (555) 345-6789",
        "caseload": 10,
        "sessionsThisWeek": 6,
        "experience": 5,
        "performanceRating": 89,
        "workloadStatus": "Optimal",
        "certifications": ["GED Instructor", "ESL", "Vocational Training"]
    },
    {
        "name": "David Martinez",
        "role": "coordinator",
        "specialization": "Program Management",
        "email": "d.martinez@rehab.com",
        "phone": "+1 (555) 456-7890",
        "caseload": 8,
        "sessionsThisWeek": 5,
        "experience": 10,
        "performanceRating": 96,
        "workloadStatus": "Optimal",
        "certifications": ["PMP", "Case Management", "Risk Assessment"]
    }
]


def generate_mock_inmates():
    """Generate mock inmate data for demo purposes"""
    names = [
        "John Doe", "Michael Smith", "David Johnson", "James Wilson",
        "Robert Brown", "William Jones", "Richard Davis", "Charles Miller",
        "Thomas Moore", "Christopher Taylor", "Daniel Anderson", "Matthew Thomas"
    ]
    risk_levels = ["low", "medium", "high"]
    programs = [
        ["Anger Management", "Life Skills"],
        ["Vocational Training", "Counseling"],
        ["Substance Abuse", "Educational"],
        ["Therapy", "Work Program"],
        ["Counseling", "GED Prep"]
    ]
    
    inmates = []
    for i, name in enumerate(names):
        inmate = {
            "id": str(uuid.uuid4()),
            "name": name,
            "inmateId": f"INM-{1000 + i}",
            "riskLevel": random.choice(risk_levels),
            "attendance": random.randint(60, 98),
            "behaviorScore": random.randint(65, 95),
            "attendanceTrend": random.choice(["up", "down"]),
            "behaviorTrend": random.choice(["up", "down"]),
            "programs": random.choice(programs),
            "completedPrograms": random.randint(0, 5),
            "timeInProgram": f"{random.randint(3, 24)}mo",
            "riskNotes": "Assessment based on recent behavioral patterns and attendance trends.",
            "recentNotes": [
                {
                    "author": "Dr. Sarah Johnson",
                    "date": "2024-01-15",
                    "content": "Showing good progress in counseling sessions. Engagement has improved."
                },
                {
                    "author": "Michael Chen",
                    "date": "2024-01-10",
                    "content": "Completed anger management module successfully."
                }
            ]
        }
        inmates.append(inmate)
    return inmates


def generate_mock_staff():
    """Generate mock staff data from predefined template"""
    return [
        {**member, "id": str(uuid.uuid4())} 
        for member in STAFF_DATA
    ]


def generate_mock_sessions():
    """Generate mock session data for demo purposes"""
    session_types = ["counseling", "vocational", "educational", "therapy"]
    sessions = []
    dates = ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18", "2024-01-19"]
    
    for i in range(20):
        session = {
            "id": str(uuid.uuid4()),
            "title": f"Session {i+1}",
            "type": random.choice(session_types),
            "date": random.choice(dates),
            "time": f"{random.randint(8, 16):02d}:00",
            "location": f"Room {random.randint(101, 110)}",
            "staff": random.choice(["Dr. Sarah Johnson", "Michael Chen", "Emily Rodriguez", "David Martinez"]),
            "capacity": random.randint(8, 15),
            "enrolled": random.randint(4, 12),
            "notes": "Regular session focused on skill development and progress tracking."
        }
        sessions.append(session)
    return sessions


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Rehabilitation Dashboard API"}


@api_router.post("/auth/login")
async def login(credentials: dict):
    """Authenticate user - Demo implementation"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    # Demo authentication - in production, use proper auth with hashed passwords
    demo_users = {
        "admin@rehab.com": {"role": "admin", "name": "Admin User"},
        "counselor@rehab.com": {"role": "counselor", "name": "Sarah Johnson"},
        "manager@rehab.com": {"role": "manager", "name": "Michael Chen"},
    }
    
    if email in demo_users and password == "demo123":
        user_data = demo_users[email]
        return {
            "email": email,
            "name": user_data["name"],
            "role": user_data["role"]
        }
    
    # Return 401 for invalid credentials
    from fastapi import HTTPException
    raise HTTPException(status_code=401, detail="Invalid credentials")


@api_router.get("/dashboard/overview")
async def get_dashboard_overview():
    """Get overview dashboard data"""
    return {
        "stats": {
            "totalInmates": 156,
            "inmatesChange": 12,
            "avgAttendance": 82,
            "attendanceChange": -3,
            "activePrograms": 8,
            "programsChange": 15,
            "highRiskCases": 12
        },
        "attendanceData": [
            {"week": "W1", "attendance": 90, "behavior": 75},
            {"week": "W2", "attendance": 88, "behavior": 78},
            {"week": "W3", "attendance": 85, "behavior": 72},
            {"week": "W4", "attendance": 82, "behavior": 70},
            {"week": "W5", "attendance": 78, "behavior": 68},
            {"week": "W6", "attendance": 75, "behavior": 71},
            {"week": "W7", "attendance": 80, "behavior": 74},
            {"week": "W8", "attendance": 82, "behavior": 76}
        ],
        "riskData": [
            {"level": "Low", "count": 89},
            {"level": "Medium", "count": 55},
            {"level": "High", "count": 12}
        ],
        "recentAlerts": [
            {
                "id": "1",
                "severity": "high",
                "title": "Attendance Drop Alert",
                "message": "John Doe has missed 3 consecutive counseling sessions",
                "time": "2 hours ago"
            },
            {
                "id": "2",
                "severity": "medium",
                "title": "Behavioral Incident",
                "message": "Minor incident reported in vocational training session",
                "time": "5 hours ago"
            },
            {
                "id": "3",
                "severity": "high",
                "title": "Risk Level Change",
                "message": "2 inmates escalated to high-risk status",
                "time": "1 day ago"
            }
        ]
    }


@api_router.get("/inmates")
async def get_inmates():
    """Get all inmates"""
    # Always return mock data to avoid MongoDB ObjectId serialization issues
    inmates = generate_mock_inmates()
    return inmates


@api_router.get("/staff")
async def get_staff():
    """Get all staff members"""
    # Always return mock data to avoid MongoDB ObjectId serialization issues
    staff = generate_mock_staff()
    return staff


@api_router.get("/sessions")
async def get_sessions():
    """Get all sessions"""
    # Always return mock data to avoid MongoDB ObjectId serialization issues
    sessions = generate_mock_sessions()
    return sessions


@api_router.get("/reports/analytics")
async def get_analytics(
    timeRange: str = Query("30days"),
    reportType: str = Query("all")
):
    """Get analytics data for reports"""
    return {
        "totalParticipants": 156,
        "completionRate": 78,
        "avgAttendance": 82,
        "successRate": 85,
        "participationTrend": [
            {"month": "Jul", "participants": 120},
            {"month": "Aug", "participants": 135},
            {"month": "Sep", "participants": 142},
            {"month": "Oct", "participants": 148},
            {"month": "Nov", "participants": 152},
            {"month": "Dec", "participants": 156}
        ],
        "riskDistribution": [
            {"name": "Low", "value": 89},
            {"name": "Medium", "value": 55},
            {"name": "High", "value": 12}
        ],
        "attendanceData": [
            {"week": "W1", "attended": 140, "absent": 16},
            {"week": "W2", "attended": 138, "absent": 18},
            {"week": "W3", "attended": 135, "absent": 21},
            {"week": "W4", "attended": 128, "absent": 28}
        ],
        "programPerformance": [
            {"program": "Vocational Training", "completionRate": 94},
            {"program": "Counseling", "completionRate": 87},
            {"program": "Educational", "completionRate": 82},
            {"program": "Substance Abuse", "completionRate": 78},
            {"program": "Life Skills", "completionRate": 91}
        ],
        "behaviorTrend": [
            {"month": "Jul", "avgScore": 68, "target": 75},
            {"month": "Aug", "avgScore": 70, "target": 75},
            {"month": "Sep", "avgScore": 72, "target": 75},
            {"month": "Oct", "avgScore": 74, "target": 75},
            {"month": "Nov", "avgScore": 76, "target": 75},
            {"month": "Dec", "avgScore": 78, "target": 75}
        ]
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()