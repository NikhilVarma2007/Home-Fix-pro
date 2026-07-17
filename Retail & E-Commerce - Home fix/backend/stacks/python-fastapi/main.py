from copy import deepcopy
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

seed_data: dict[str, Any] = {
    "user": {
        "id": "user-1",
        "name": "Priya Menon",
        "phone": "+91 98765 43210",
        "avatar": "/images/user-avatar.jpg",
        "addresses": [
            {
                "id": "addr-1",
                "label": "Home",
                "full": "42, 4th Cross, Jayanagar 4th Block, Bangalore - 560011",
                "lat": 12.9279,
                "lng": 77.5831,
            }
        ],
    },
    "categories": [],
    "professionals": [],
    "bookings": [],
    "chatThreads": [],
}

state = deepcopy(seed_data)
app = FastAPI(title="HomeFix Pro FastAPI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BookingPayload(BaseModel):
    booking: dict[str, Any]


@app.get("/health")
def health():
    return {"ok": True, "stack": "python-fastapi", "source": "local"}


@app.get("/api/bootstrap")
def bootstrap():
    return state


@app.get("/api/stats")
def stats():
    active = [
        booking
        for booking in state["bookings"]
        if booking.get("status") in ["pending", "confirmed", "in_progress"]
    ]
    return {
        "source": "local",
        "stack": "python-fastapi",
        "totalBookings": len(state["bookings"]),
        "activeBookings": len(active),
        "totalProfessionals": len(state["professionals"]),
        "totalCategories": len(state["categories"]),
        "lastUpdated": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/bookings", status_code=201)
def create_booking(payload: BookingPayload):
    booking = payload.booking
    if not booking.get("id"):
        raise HTTPException(status_code=400, detail="booking is required")

    state["bookings"] = [booking] + [
        item for item in state["bookings"] if item.get("id") != booking["id"]
    ]
    return {"booking": booking}


@app.patch("/api/bookings/{booking_id}")
def update_booking(booking_id: str, payload: BookingPayload):
    booking = payload.booking
    if not booking.get("id"):
        raise HTTPException(status_code=400, detail="booking is required")

    if not any(item.get("id") == booking_id for item in state["bookings"]):
        raise HTTPException(status_code=404, detail="Booking not found")

    state["bookings"] = [
        booking if item.get("id") == booking_id else item for item in state["bookings"]
    ]
    return {"booking": booking}
