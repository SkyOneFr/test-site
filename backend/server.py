from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, time
import os
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import asyncio

# Database setup
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.lenvers_db

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ReservationRequest(BaseModel):
    name: str
    email: str
    phone: str
    date: str
    time: str
    party_size: int
    special_requests: Optional[str] = None

class EventModel(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    date: str
    time: str
    image_url: Optional[str] = None
    price: Optional[str] = "Entrée libre"
    category: str

class NewsletterSubscription(BaseModel):
    email: str
    name: Optional[str] = None

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "L'envers API"}

@app.post("/api/reservations")
async def create_reservation(reservation: ReservationRequest):
    try:
        # Create reservation record
        reservation_data = {
            "id": str(uuid.uuid4()),
            "name": reservation.name,
            "email": reservation.email,
            "phone": reservation.phone,
            "date": reservation.date,
            "time": reservation.time,
            "party_size": reservation.party_size,
            "special_requests": reservation.special_requests,
            "status": "confirmed",
            "created_at": datetime.now().isoformat()
        }
        
        # Save to database
        await db.reservations.insert_one(reservation_data)
        
        return {
            "success": True,
            "message": "Réservation confirmée ! Nous vous avons envoyé un email de confirmation.",
            "reservation_id": reservation_data["id"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la réservation: {str(e)}")

@app.get("/api/reservations")
async def get_reservations():
    try:
        reservations = await db.reservations.find({}, {"_id": 0}).to_list(100)
        return {"reservations": reservations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération: {str(e)}")

@app.get("/api/events")
async def get_events():
    try:
        events = await db.events.find({}, {"_id": 0}).to_list(50)
        return {"events": events}
    except Exception as e:
        return {"events": []}

@app.post("/api/events")
async def create_event(event: EventModel):
    try:
        event_data = {
            "id": str(uuid.uuid4()),
            "title": event.title,
            "description": event.description,
            "date": event.date,
            "time": event.time,
            "image_url": event.image_url,
            "price": event.price,
            "category": event.category,
            "created_at": datetime.now().isoformat()
        }
        
        await db.events.insert_one(event_data)
        # Remove the MongoDB _id field if it exists before returning
        event_data.pop('_id', None)
        return {"success": True, "event": event_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de l'événement: {str(e)}")

@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(subscription: NewsletterSubscription):
    try:
        # Check if email already exists
        existing = await db.newsletter.find_one({"email": subscription.email})
        if existing:
            return {"success": True, "message": "Vous êtes déjà abonné à notre newsletter !"}
        
        subscription_data = {
            "id": str(uuid.uuid4()),
            "email": subscription.email,
            "name": subscription.name,
            "subscribed_at": datetime.now().isoformat(),
            "active": True
        }
        
        await db.newsletter.insert_one(subscription_data)
        return {"success": True, "message": "Merci pour votre inscription à notre newsletter !"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'inscription: {str(e)}")

@app.post("/api/contact")
async def send_contact_message(contact: ContactMessage):
    try:
        contact_data = {
            "id": str(uuid.uuid4()),
            "name": contact.name,
            "email": contact.email,
            "subject": contact.subject,
            "message": contact.message,
            "sent_at": datetime.now().isoformat(),
            "status": "new"
        }
        
        await db.contact_messages.insert_one(contact_data)
        return {"success": True, "message": "Votre message a été envoyé avec succès ! Nous vous répondrons rapidement."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi: {str(e)}")

# Initialize some sample events
@app.on_event("startup")
async def startup_event():
    # Create some sample events if none exist
    event_count = await db.events.count_documents({})
    if event_count == 0:
        sample_events = [
            {
                "id": str(uuid.uuid4()),
                "title": "Soirée Jazz & Cocktails",
                "description": "Une soirée intimiste avec les meilleurs musiciens de jazz de la région. Ambiance feutrée et cocktails d'exception.",
                "date": "2025-02-15",
                "time": "20:00",
                "image_url": "https://images.unsplash.com/photo-1571950006119-9f047f9d27b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxhcnRpc3RpYyUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2NDd8MA&ixlib=rb-4.1.0&q=85",
                "price": "Entrée libre",
                "category": "Concert",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Exposition Art Local",
                "description": "Découvrez les œuvres d'artistes locaux d'Aubagne et des environs. Vernissage avec animations et dégustations.",
                "date": "2025-02-20",
                "time": "18:30",
                "image_url": "https://images.unsplash.com/photo-1600007525237-3ffb936cd20f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2NDd8MA&ixlib=rb-4.1.0&q=85",
                "price": "Entrée libre",
                "category": "Exposition",
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Soirée DJ Set Electro",
                "description": "Une soirée électro avec les meilleurs DJ de la scène underground marseillaise. Dancefloor jusqu'au bout de la nuit !",
                "date": "2025-02-28",
                "time": "21:00",
                "image_url": "https://images.unsplash.com/photo-1636067017589-269088431994?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxhbHRlcm5hdGl2ZSUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2MzB8MA&ixlib=rb-4.1.0&q=85",
                "price": "10€",
                "category": "Soirée",
                "created_at": datetime.now().isoformat()
            }
        ]
        await db.events.insert_many(sample_events)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)