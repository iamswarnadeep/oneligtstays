from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import smtplib
import asyncio
import secrets
import random
import re
from datetime import datetime, timezone, timedelta, date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# -----------------------------------------------------------------------------
# Setup
# -----------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"

logger = logging.getLogger("onelightstays")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI(title="OneLightStays API")
api = APIRouter(prefix="/api")


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
def hash_password(pwd: str) -> str:
    return bcrypt.hashpw(pwd.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pwd: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pwd.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str, kind: str = "access") -> str:
    delta = timedelta(minutes=60 * 24) if kind == "access" else timedelta(days=7)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": kind,
        "exp": datetime.now(timezone.utc) + delta,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
    return s or secrets.token_hex(4)


def serialize(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    for k, v in list(doc.items()):
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(401, "User not found")
    user.pop("password_hash", None)
    return serialize(user)


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin access required")
    return user


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True,
                        samesite="none", max_age=60 * 60 * 24, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True,
                        samesite="none", max_age=60 * 60 * 24 * 7, path="/")


# -----------------------------------------------------------------------------
# Email (SMTP w/ demo mode)
# -----------------------------------------------------------------------------
def _send_email_sync(to: str, subject: str, html: str):
    host = os.environ.get("SMTP_HOST", "")
    port = int(os.environ.get("SMTP_PORT", "587") or "587")
    user = os.environ.get("SMTP_USER", "")
    password = os.environ.get("SMTP_PASSWORD", "")
    sender = os.environ.get("SMTP_FROM", "no-reply@onelightstays.com")
    sender_name = os.environ.get("SMTP_FROM_NAME", "OneLightStays")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{sender}>"
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(host, port, timeout=20) as smtp:
        smtp.starttls()
        if user and password:
            smtp.login(user, password)
        smtp.sendmail(sender, [to], msg.as_string())


async def send_email(to: str, subject: str, html: str, otp: Optional[str] = None):
    demo = (os.environ.get("SMTP_DEMO_MODE", "demo") or "").lower() == "demo"
    if demo:
        logger.info("[DEMO EMAIL] To=%s Subject=%s OTP=%s", to, subject, otp)
        return
    try:
        await asyncio.to_thread(_send_email_sync, to, subject, html)
    except Exception as e:
        logger.error("SMTP send failed: %s", e)


# -----------------------------------------------------------------------------
# Models
# -----------------------------------------------------------------------------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class VerifyOTPIn(BaseModel):
    email: EmailStr
    otp: str
    purpose: str = "register"  # register | reset


class ResendOTPIn(BaseModel):
    email: EmailStr
    purpose: str = "register"


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(min_length=6)


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class UpdateProfileIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class PropertyIn(BaseModel):
    title: str
    destination: str
    property_type: str  # villa | resort | homestay | cottage | hotel
    description: str
    location: str
    latitude: float = 0.0
    longitude: float = 0.0
    starting_price: float
    images: List[str] = []
    amenities: List[str] = []
    highlights: List[str] = []
    policies: List[str] = []
    house_rules: List[str] = []
    faqs: List[dict] = []
    is_featured: bool = False
    status: str = "active"


class RoomIn(BaseModel):
    property_id: str
    room_name: str
    description: str
    max_adults: int = 2
    max_children: int = 0
    room_size: str = ""
    price_per_night: float
    images: List[str] = []
    amenities: List[str] = []
    total_rooms: int = 5


class BookingIn(BaseModel):
    property_id: str
    room_id: str
    checkin: str  # YYYY-MM-DD
    checkout: str
    guests: int = 1
    guest_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[EmailStr] = None


class ReviewIn(BaseModel):
    property_id: str
    rating: int = Field(ge=1, le=5)
    review: str


class WishlistIn(BaseModel):
    property_id: str


class DestinationIn(BaseModel):
    name: str
    image: str
    description: str = ""
    property_count: int = 0


# -----------------------------------------------------------------------------
# Auth Endpoints
# -----------------------------------------------------------------------------
def _gen_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


async def _create_and_send_otp(email: str, purpose: str):
    otp = _gen_otp()
    await db.otps.update_one(
        {"email": email, "purpose": purpose},
        {"$set": {
            "email": email,
            "purpose": purpose,
            "otp": otp,
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    subject = "Your OneLightStays Verification Code"
    html = f"""
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h2 style="color:#4A5D23">OneLightStays</h2>
          <p>Your verification code is:</p>
          <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1C1917">{otp}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
    """
    await send_email(email, subject, html, otp=otp)
    return otp


@api.post("/auth/register")
async def register(payload: RegisterIn):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing and existing.get("email_verified"):
        raise HTTPException(400, "Email already registered")
    pwd_hash = hash_password(payload.password)
    doc = {
        "email": email,
        "name": payload.name,
        "phone": payload.phone or "",
        "password_hash": pwd_hash,
        "role": "user",
        "email_verified": False,
        "wishlist": [],
        "created_at": datetime.now(timezone.utc),
    }
    if existing:
        await db.users.update_one({"_id": existing["_id"]}, {"$set": doc})
    else:
        await db.users.insert_one(doc)
    otp = await _create_and_send_otp(email, "register")
    demo = (os.environ.get("SMTP_DEMO_MODE", "demo") or "").lower() == "demo"
    return {"message": "Registration successful. OTP sent to your email.",
            "email": email,
            "demo_otp": otp if demo else None}


@api.post("/auth/verify-otp")
async def verify_otp(payload: VerifyOTPIn, response: Response):
    email = payload.email.lower()
    record = await db.otps.find_one({"email": email, "purpose": payload.purpose})
    if not record:
        raise HTTPException(400, "OTP not found. Please request a new one.")
    expires = record["expires_at"]
    if isinstance(expires, str):
        expires = datetime.fromisoformat(expires)
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired")
    if record["otp"] != payload.otp:
        raise HTTPException(400, "Invalid OTP")
    await db.otps.delete_one({"_id": record["_id"]})

    if payload.purpose == "register":
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(404, "User not found")
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"email_verified": True}})
        access = create_token(str(user["_id"]), email, user.get("role", "user"))
        refresh = create_token(str(user["_id"]), email, user.get("role", "user"), "refresh")
        set_auth_cookies(response, access, refresh)
        u = serialize(user)
        u.pop("password_hash", None)
        u["email_verified"] = True
        return {"message": "Email verified", "user": u, "access_token": access}
    return {"message": "OTP verified"}


@api.post("/auth/resend-otp")
async def resend_otp(payload: ResendOTPIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(404, "User not found")
    otp = await _create_and_send_otp(email, payload.purpose)
    demo = (os.environ.get("SMTP_DEMO_MODE", "demo") or "").lower() == "demo"
    return {"message": "OTP sent", "demo_otp": otp if demo else None}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    if not user.get("email_verified") and user.get("role") != "admin":
        otp = await _create_and_send_otp(email, "register")
        demo = (os.environ.get("SMTP_DEMO_MODE", "demo") or "").lower() == "demo"
        raise HTTPException(403, f"Email not verified. New OTP sent.{' Demo OTP: ' + otp if demo else ''}")
    access = create_token(str(user["_id"]), email, user.get("role", "user"))
    refresh = create_token(str(user["_id"]), email, user.get("role", "user"), "refresh")
    set_auth_cookies(response, access, refresh)
    u = serialize(user)
    u.pop("password_hash", None)
    return {"message": "Login successful", "user": u, "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordIn):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal but still respond OK
        return {"message": "If the email exists, an OTP has been sent."}
    otp = await _create_and_send_otp(email, "reset")
    demo = (os.environ.get("SMTP_DEMO_MODE", "demo") or "").lower() == "demo"
    return {"message": "OTP sent to your email", "demo_otp": otp if demo else None}


@api.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordIn):
    email = payload.email.lower()
    record = await db.otps.find_one({"email": email, "purpose": "reset"})
    if not record or record["otp"] != payload.otp:
        raise HTTPException(400, "Invalid OTP")
    expires = record["expires_at"]
    if isinstance(expires, str):
        expires = datetime.fromisoformat(expires)
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP expired")
    await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    await db.otps.delete_one({"_id": record["_id"]})
    return {"message": "Password reset successful"}


@api.post("/auth/change-password")
async def change_password(payload: ChangePasswordIn, user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"_id": ObjectId(user["id"])})
    if not verify_password(payload.current_password, u["password_hash"]):
        raise HTTPException(400, "Current password incorrect")
    await db.users.update_one({"_id": u["_id"]}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    return {"message": "Password updated"}


@api.put("/auth/profile")
async def update_profile(payload: UpdateProfileIn, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": update})
    u = await db.users.find_one({"_id": ObjectId(user["id"])})
    u.pop("password_hash", None)
    return serialize(u)


# -----------------------------------------------------------------------------
# Destinations
# -----------------------------------------------------------------------------
@api.get("/destinations")
async def list_destinations():
    items = await db.destinations.find().to_list(100)
    return [serialize(d) for d in items]


@api.post("/admin/destinations")
async def admin_create_destination(payload: DestinationIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["slug"] = slugify(payload.name)
    doc["created_at"] = datetime.now(timezone.utc)
    res = await db.destinations.insert_one(doc)
    return serialize(await db.destinations.find_one({"_id": res.inserted_id}))


@api.delete("/admin/destinations/{dest_id}")
async def admin_delete_destination(dest_id: str, _: dict = Depends(require_admin)):
    await db.destinations.delete_one({"_id": ObjectId(dest_id)})
    return {"message": "deleted"}


# -----------------------------------------------------------------------------
# Properties
# -----------------------------------------------------------------------------
@api.get("/properties")
async def list_properties(
    destination: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rating: Optional[int] = None,
    q: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: int = 50,
):
    query = {"status": "active"}
    if destination:
        query["destination"] = {"$regex": f"^{destination}$", "$options": "i"}
    if property_type:
        query["property_type"] = property_type
    if min_price is not None or max_price is not None:
        q_price = {}
        if min_price is not None:
            q_price["$gte"] = min_price
        if max_price is not None:
            q_price["$lte"] = max_price
        query["starting_price"] = q_price
    if rating is not None:
        query["avg_rating"] = {"$gte": rating}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"destination": {"$regex": q, "$options": "i"}},
            {"location": {"$regex": q, "$options": "i"}},
        ]
    if featured is not None:
        query["is_featured"] = featured
    items = await db.properties.find(query).limit(limit).to_list(limit)
    return [serialize(p) for p in items]


@api.get("/properties/{slug}")
async def get_property(slug: str):
    p = await db.properties.find_one({"slug": slug})
    if not p:
        # try by id
        try:
            p = await db.properties.find_one({"_id": ObjectId(slug)})
        except Exception:
            pass
    if not p:
        raise HTTPException(404, "Property not found")
    prop = serialize(p)
    rooms = await db.rooms.find({"property_id": prop["id"]}).to_list(100)
    prop["rooms"] = [serialize(r) for r in rooms]
    reviews = await db.reviews.find({"property_id": prop["id"]}).sort("created_at", -1).to_list(50)
    prop["reviews"] = [serialize(r) for r in reviews]
    return prop


@api.post("/admin/properties")
async def admin_create_property(payload: PropertyIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["slug"] = slugify(payload.title) + "-" + secrets.token_hex(3)
    doc["avg_rating"] = 0.0
    doc["review_count"] = 0
    doc["created_at"] = datetime.now(timezone.utc)
    res = await db.properties.insert_one(doc)
    return serialize(await db.properties.find_one({"_id": res.inserted_id}))


@api.put("/admin/properties/{prop_id}")
async def admin_update_property(prop_id: str, payload: PropertyIn, _: dict = Depends(require_admin)):
    await db.properties.update_one({"_id": ObjectId(prop_id)}, {"$set": payload.model_dump()})
    return serialize(await db.properties.find_one({"_id": ObjectId(prop_id)}))


@api.delete("/admin/properties/{prop_id}")
async def admin_delete_property(prop_id: str, _: dict = Depends(require_admin)):
    await db.properties.delete_one({"_id": ObjectId(prop_id)})
    await db.rooms.delete_many({"property_id": prop_id})
    return {"message": "deleted"}


# -----------------------------------------------------------------------------
# Rooms
# -----------------------------------------------------------------------------
@api.post("/admin/rooms")
async def admin_create_room(payload: RoomIn, _: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc)
    res = await db.rooms.insert_one(doc)
    return serialize(await db.rooms.find_one({"_id": res.inserted_id}))


@api.put("/admin/rooms/{room_id}")
async def admin_update_room(room_id: str, payload: RoomIn, _: dict = Depends(require_admin)):
    await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": payload.model_dump()})
    return serialize(await db.rooms.find_one({"_id": ObjectId(room_id)}))


@api.delete("/admin/rooms/{room_id}")
async def admin_delete_room(room_id: str, _: dict = Depends(require_admin)):
    await db.rooms.delete_one({"_id": ObjectId(room_id)})
    return {"message": "deleted"}


@api.get("/admin/rooms")
async def admin_list_rooms(property_id: Optional[str] = None, _: dict = Depends(require_admin)):
    q = {}
    if property_id:
        q["property_id"] = property_id
    items = await db.rooms.find(q).to_list(500)
    return [serialize(r) for r in items]


# -----------------------------------------------------------------------------
# Bookings
# -----------------------------------------------------------------------------
def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


@api.post("/bookings")
async def create_booking(payload: BookingIn, user: dict = Depends(get_current_user)):
    room = await db.rooms.find_one({"_id": ObjectId(payload.room_id)})
    if not room:
        raise HTTPException(404, "Room not found")
    prop = await db.properties.find_one({"_id": ObjectId(payload.property_id)})
    if not prop:
        raise HTTPException(404, "Property not found")
    try:
        ci = _parse_date(payload.checkin)
        co = _parse_date(payload.checkout)
    except Exception:
        raise HTTPException(400, "Invalid date format")
    if co <= ci:
        raise HTTPException(400, "Checkout must be after check-in")
    nights = (co - ci).days
    subtotal = float(room["price_per_night"]) * nights
    taxes = round(subtotal * 0.12, 2)
    total = round(subtotal + taxes, 2)
    booking_number = "OLS" + str(int(datetime.now(timezone.utc).timestamp()))[-8:] + secrets.token_hex(2).upper()

    doc = {
        "booking_number": booking_number,
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user.get("name", ""),
        "property_id": payload.property_id,
        "property_title": prop["title"],
        "property_image": (prop.get("images") or [""])[0] if prop.get("images") else "",
        "property_location": prop.get("location", ""),
        "room_id": payload.room_id,
        "room_name": room["room_name"],
        "checkin": payload.checkin,
        "checkout": payload.checkout,
        "nights": nights,
        "guests": payload.guests,
        "guest_name": payload.guest_name or user.get("name", ""),
        "guest_phone": payload.guest_phone or user.get("phone", ""),
        "guest_email": payload.guest_email or user["email"],
        "price_per_night": room["price_per_night"],
        "subtotal": subtotal,
        "taxes": taxes,
        "amount": total,
        "payment_method": "pay_on_reception",
        "payment_status": "pending",
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.bookings.insert_one(doc)
    # send confirmation
    asyncio.create_task(send_email(
        user["email"],
        f"Booking Confirmed - {booking_number}",
        f"<h2>Booking Confirmed</h2><p>Hi {user.get('name','')},</p>"
        f"<p>Your booking <b>{booking_number}</b> at <b>{prop['title']}</b> "
        f"({payload.checkin} → {payload.checkout}) is confirmed.</p>"
        f"<p>Total: ${total}. Pay at reception on check-in.</p>",
    ))
    return serialize(await db.bookings.find_one({"_id": res.inserted_id}))


@api.get("/bookings/my")
async def my_bookings(user: dict = Depends(get_current_user)):
    items = await db.bookings.find({"user_id": user["id"]}).sort("created_at", -1).to_list(200)
    return [serialize(b) for b in items]


@api.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(404, "Not found")
    if booking["user_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(403, "Forbidden")
    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "cancelled"}})
    return {"message": "Booking cancelled"}


@api.get("/admin/bookings")
async def admin_bookings(_: dict = Depends(require_admin)):
    items = await db.bookings.find().sort("created_at", -1).to_list(500)
    return [serialize(b) for b in items]


@api.put("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, payload: dict, _: dict = Depends(require_admin)):
    allowed = {k: v for k, v in payload.items() if k in {"status", "payment_status"}}
    if allowed:
        await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": allowed})
    return serialize(await db.bookings.find_one({"_id": ObjectId(booking_id)}))


# -----------------------------------------------------------------------------
# Wishlist
# -----------------------------------------------------------------------------
@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"_id": ObjectId(user["id"])})
    ids = u.get("wishlist", [])
    items = []
    for pid in ids:
        try:
            p = await db.properties.find_one({"_id": ObjectId(pid)})
            if p:
                items.append(serialize(p))
        except Exception:
            continue
    return items


@api.post("/wishlist/toggle")
async def toggle_wishlist(payload: WishlistIn, user: dict = Depends(get_current_user)):
    u = await db.users.find_one({"_id": ObjectId(user["id"])})
    wishlist = u.get("wishlist", [])
    if payload.property_id in wishlist:
        wishlist.remove(payload.property_id)
        action = "removed"
    else:
        wishlist.append(payload.property_id)
        action = "added"
    await db.users.update_one({"_id": u["_id"]}, {"$set": {"wishlist": wishlist}})
    return {"action": action, "wishlist": wishlist}


# -----------------------------------------------------------------------------
# Reviews
# -----------------------------------------------------------------------------
@api.post("/reviews")
async def create_review(payload: ReviewIn, user: dict = Depends(get_current_user)):
    doc = {
        "property_id": payload.property_id,
        "user_id": user["id"],
        "user_name": user.get("name", "Guest"),
        "rating": payload.rating,
        "review": payload.review,
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.reviews.insert_one(doc)
    # update property avg
    reviews = await db.reviews.find({"property_id": payload.property_id}).to_list(1000)
    avg = sum(r["rating"] for r in reviews) / len(reviews)
    await db.properties.update_one(
        {"_id": ObjectId(payload.property_id)},
        {"$set": {"avg_rating": round(avg, 2), "review_count": len(reviews)}},
    )
    return serialize(await db.reviews.find_one({"_id": res.inserted_id}))


# -----------------------------------------------------------------------------
# Admin Dashboard
# -----------------------------------------------------------------------------
@api.get("/admin/stats")
async def admin_stats(_: dict = Depends(require_admin)):
    total_revenue = 0.0
    async for b in db.bookings.find({"status": {"$ne": "cancelled"}}):
        total_revenue += float(b.get("amount", 0))
    total_bookings = await db.bookings.count_documents({})
    active_properties = await db.properties.count_documents({"status": "active"})
    total_customers = await db.users.count_documents({"role": "user"})
    occupancy = 0
    if active_properties:
        occupancy = min(100, round((total_bookings / max(1, active_properties * 30)) * 100))

    # monthly revenue
    monthly = {}
    async for b in db.bookings.find({"status": {"$ne": "cancelled"}}):
        d = b.get("created_at")
        if isinstance(d, str):
            try:
                d = datetime.fromisoformat(d)
            except Exception:
                continue
        if not d:
            continue
        key = d.strftime("%Y-%m")
        monthly[key] = monthly.get(key, 0) + float(b.get("amount", 0))
    monthly_revenue = [{"month": k, "revenue": v} for k, v in sorted(monthly.items())]

    return {
        "total_revenue": round(total_revenue, 2),
        "total_bookings": total_bookings,
        "active_properties": active_properties,
        "total_customers": total_customers,
        "occupancy_rate": occupancy,
        "monthly_revenue": monthly_revenue,
    }


@api.get("/admin/users")
async def admin_users(_: dict = Depends(require_admin)):
    users = await db.users.find({"role": "user"}).to_list(500)
    out = []
    for u in users:
        u.pop("password_hash", None)
        out.append(serialize(u))
    return out


# -----------------------------------------------------------------------------
# Seed
# -----------------------------------------------------------------------------
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@onelightstays.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "name": "OneLightStays Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "email_verified": True,
            "wishlist": [],
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded admin user: %s", admin_email)
    else:
        # ensure verified & password matches env
        update = {"email_verified": True, "role": "admin"}
        if not verify_password(admin_password, existing.get("password_hash", "")):
            update["password_hash"] = hash_password(admin_password)
        await db.users.update_one({"_id": existing["_id"]}, {"$set": update})


SEED_DESTINATIONS = [
    {"name": "Goa", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=80", "description": "Sun-soaked beaches and Portuguese heritage", "property_count": 24},
    {"name": "Manali", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&q=80", "description": "Snow-kissed peaks and pine valleys", "property_count": 18},
    {"name": "Udaipur", "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&q=80", "description": "City of lakes and royal palaces", "property_count": 12},
    {"name": "Coorg", "image": "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=900&q=80", "description": "Coffee plantations and misty hills", "property_count": 15},
    {"name": "Munnar", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=80", "description": "Endless tea gardens of Kerala", "property_count": 10},
    {"name": "Lonavala", "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=900&q=80", "description": "Weekend retreat in the Sahyadris", "property_count": 21},
]

SEED_PROPERTIES = [
    {
        "title": "Olive Grove Villa",
        "destination": "Goa",
        "property_type": "villa",
        "location": "North Goa, Assagao",
        "description": "A serene private villa set amidst olive trees and sun-drenched courtyards. Featuring a private pool, sun-deck, and contemporary interiors with curated artwork. Ideal for families and intimate getaways.",
        "starting_price": 320,
        "latitude": 15.5937,
        "longitude": 73.7405,
        "is_featured": True,
        "images": [
            "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=1400&q=85",
            "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=1400&q=85",
            "https://images.pexels.com/photos/28736656/pexels-photo-28736656.jpeg?w=1400",
            "https://images.unsplash.com/photo-1692736933760-8a8a9b8c1b6f?w=1400&q=85",
        ],
        "amenities": ["Private Pool", "Wi-Fi", "Air Conditioning", "Chef on Request", "Garden", "Parking", "Pet Friendly", "Breakfast"],
        "highlights": ["Private infinity pool", "Floor-to-ceiling windows", "In-house chef", "Daily housekeeping"],
        "policies": ["Check-in 2 PM", "Check-out 11 AM", "No smoking indoors", "Cancellation: free up to 48h"],
        "house_rules": ["No loud music after 10 PM", "Pets allowed on request", "Smoking only in open areas"],
        "faqs": [
            {"q": "Is breakfast included?", "a": "Yes, complimentary continental breakfast for all guests."},
            {"q": "Do you allow pets?", "a": "Yes, on request and with a small refundable deposit."},
        ],
        "rooms": [
            {"room_name": "Garden Deluxe Room", "description": "King bed, garden view, en-suite marble bath.", "max_adults": 2, "max_children": 1, "room_size": "32 sqm", "price_per_night": 320, "total_rooms": 4, "amenities": ["King Bed", "Garden View", "Smart TV", "Mini Bar"], "images": ["https://images.unsplash.com/photo-1750420556288-d0e32a6f517b?w=1200&q=85"]},
            {"room_name": "Poolside Premium", "description": "Direct pool access with private deck.", "max_adults": 2, "max_children": 2, "room_size": "42 sqm", "price_per_night": 480, "total_rooms": 2, "amenities": ["Pool Access", "King Bed", "Deck", "Bathtub"], "images": ["https://images.unsplash.com/photo-1720420021124-4e18564e070f?w=1200&q=85"]},
        ],
    },
    {
        "title": "Cedarwood Estate",
        "destination": "Manali",
        "property_type": "resort",
        "location": "Old Manali, Himachal Pradesh",
        "description": "A cedar-wood resort tucked into pine forests with panoramic views of the Beas valley. Authentic Himachali cuisine, indoor fireplaces, and curated mountain experiences.",
        "starting_price": 240,
        "latitude": 32.2432,
        "longitude": 77.1892,
        "is_featured": True,
        "images": [
            "https://images.pexels.com/photos/28054849/pexels-photo-28054849.jpeg?w=1400",
            "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1400&q=85",
            "https://images.unsplash.com/photo-1551776235-dde6d4829808?w=1400&q=85",
        ],
        "amenities": ["Mountain View", "Fireplace", "Wi-Fi", "Restaurant", "Bonfire", "Spa", "Heating", "Parking"],
        "highlights": ["Panoramic Beas valley views", "Open-air jacuzzi", "Curated treks"],
        "policies": ["Check-in 3 PM", "Check-out 12 PM", "Cancellation: 72h"],
        "house_rules": ["Quiet hours after 10 PM", "Bonfire allowed in designated area"],
        "faqs": [{"q": "Is the resort kid-friendly?", "a": "Yes, with dedicated activities."}],
        "rooms": [
            {"room_name": "Forest Cottage", "description": "Standalone cottage with valley view.", "max_adults": 2, "max_children": 1, "room_size": "28 sqm", "price_per_night": 240, "total_rooms": 6, "amenities": ["Forest View", "Heater", "Tea Kettle"], "images": ["https://images.pexels.com/photos/34574606/pexels-photo-34574606.jpeg?w=1200"]},
            {"room_name": "Valley Suite", "description": "Premium suite with jacuzzi and fireplace.", "max_adults": 2, "max_children": 2, "room_size": "55 sqm", "price_per_night": 420, "total_rooms": 3, "amenities": ["Jacuzzi", "Fireplace", "Valley View"], "images": ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=85"]},
        ],
    },
    {
        "title": "Lakefront Haveli",
        "destination": "Udaipur",
        "property_type": "homestay",
        "location": "Lake Pichola, Udaipur",
        "description": "A restored Rajputana haveli with handcrafted jharokhas overlooking Lake Pichola. Step into a world of fresco-painted ceilings and royal hospitality.",
        "starting_price": 280,
        "latitude": 24.5713,
        "longitude": 73.6800,
        "is_featured": True,
        "images": [
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=85",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1400&q=85",
        ],
        "amenities": ["Lake View", "Heritage", "Wi-Fi", "Restaurant", "Cultural Experiences", "Spa"],
        "highlights": ["Frescoed ceilings", "Private boat ride", "Rooftop dining"],
        "policies": ["Check-in 2 PM", "Check-out 11 AM"],
        "house_rules": ["No loud music", "Respect heritage decor"],
        "faqs": [{"q": "Boat ride included?", "a": "Yes, one complimentary sunset ride."}],
        "rooms": [
            {"room_name": "Heritage Room", "description": "Antique decor with lake-facing window.", "max_adults": 2, "max_children": 1, "room_size": "30 sqm", "price_per_night": 280, "total_rooms": 5, "amenities": ["Lake View", "Antique Decor"], "images": ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85"]},
            {"room_name": "Maharani Suite", "description": "Royal suite with private balcony.", "max_adults": 2, "max_children": 2, "room_size": "60 sqm", "price_per_night": 520, "total_rooms": 2, "amenities": ["Private Balcony", "King Bed", "Soaking Tub"], "images": ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=85"]},
        ],
    },
    {
        "title": "Misty Coffee Cottage",
        "destination": "Coorg",
        "property_type": "cottage",
        "location": "Madikeri, Coorg",
        "description": "A cosy cottage in a working coffee plantation. Wake up to birdsong, sip fresh-brewed coffee, and walk through misty estates.",
        "starting_price": 180,
        "latitude": 12.4244,
        "longitude": 75.7382,
        "is_featured": True,
        "images": [
            "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1400&q=85",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&q=85",
        ],
        "amenities": ["Plantation View", "Wi-Fi", "Bonfire", "Breakfast", "Hiking", "Pet Friendly"],
        "highlights": ["Estate walks", "Home-style Kodava meals"],
        "policies": ["Check-in 2 PM", "Check-out 11 AM"],
        "house_rules": ["No littering in plantation"],
        "faqs": [{"q": "Are estate tours included?", "a": "Yes, daily morning tours."}],
        "rooms": [
            {"room_name": "Plantation Studio", "description": "Studio with private veranda.", "max_adults": 2, "max_children": 1, "room_size": "26 sqm", "price_per_night": 180, "total_rooms": 4, "amenities": ["Veranda", "Coffee Maker"], "images": ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=85"]},
        ],
    },
    {
        "title": "Tea Valley Bungalow",
        "destination": "Munnar",
        "property_type": "homestay",
        "location": "Munnar, Kerala",
        "description": "A colonial-era bungalow surrounded by emerald tea estates, with a fireplace lounge and panoramic verandahs.",
        "starting_price": 210,
        "latitude": 10.0889,
        "longitude": 77.0595,
        "is_featured": False,
        "images": [
            "https://images.unsplash.com/photo-1597211833712-5e41faa202ea?w=1400&q=85",
            "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1400&q=85",
        ],
        "amenities": ["Tea Estate View", "Fireplace", "Wi-Fi", "Breakfast", "Yoga Deck"],
        "highlights": ["Tea-tasting sessions", "Estate hikes"],
        "policies": ["Check-in 2 PM", "Check-out 11 AM"],
        "house_rules": ["No smoking indoors"],
        "faqs": [],
        "rooms": [
            {"room_name": "Colonial Room", "description": "Wood-panelled with estate views.", "max_adults": 2, "max_children": 1, "room_size": "30 sqm", "price_per_night": 210, "total_rooms": 4, "amenities": ["Wood Floors", "Estate View"], "images": ["https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=85"]},
        ],
    },
    {
        "title": "Highland Mist Resort",
        "destination": "Lonavala",
        "property_type": "resort",
        "location": "Tungarli, Lonavala",
        "description": "A modernist resort with infinity pool and panoramic ghat views — perfect for weekend escapes from Mumbai and Pune.",
        "starting_price": 260,
        "latitude": 18.7546,
        "longitude": 73.4062,
        "is_featured": True,
        "images": [
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1400&q=85",
            "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1400&q=85",
        ],
        "amenities": ["Infinity Pool", "Wi-Fi", "Spa", "Restaurant", "Parking", "Bar"],
        "highlights": ["Infinity pool", "Spa", "Ghat views"],
        "policies": ["Check-in 3 PM", "Check-out 12 PM"],
        "house_rules": ["Pool open 7 AM – 9 PM"],
        "faqs": [],
        "rooms": [
            {"room_name": "Mist Room", "description": "Comfortable room with ghat-facing balcony.", "max_adults": 2, "max_children": 1, "room_size": "28 sqm", "price_per_night": 260, "total_rooms": 8, "amenities": ["Balcony", "Smart TV"], "images": ["https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200&q=85"]},
            {"room_name": "Cliff Suite", "description": "Suite with pool access and ghat views.", "max_adults": 3, "max_children": 1, "room_size": "50 sqm", "price_per_night": 460, "total_rooms": 4, "amenities": ["Pool Access", "Living Area"], "images": ["https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=85"]},
        ],
    },
]


async def seed_data():
    if await db.destinations.count_documents({}) == 0:
        for d in SEED_DESTINATIONS:
            doc = dict(d)
            doc["slug"] = slugify(d["name"])
            doc["created_at"] = datetime.now(timezone.utc)
            await db.destinations.insert_one(doc)
        logger.info("Seeded %d destinations", len(SEED_DESTINATIONS))

    if await db.properties.count_documents({}) == 0:
        for p in SEED_PROPERTIES:
            rooms_seed = p.pop("rooms", [])
            doc = {**p}
            doc["slug"] = slugify(p["title"])
            doc["status"] = "active"
            doc["avg_rating"] = round(random.uniform(4.5, 4.95), 2)
            doc["review_count"] = random.randint(12, 80)
            doc["faqs"] = doc.get("faqs", [])
            doc["created_at"] = datetime.now(timezone.utc)
            res = await db.properties.insert_one(doc)
            pid = str(res.inserted_id)
            for r in rooms_seed:
                r2 = dict(r)
                r2["property_id"] = pid
                r2["created_at"] = datetime.now(timezone.utc)
                await db.rooms.insert_one(r2)
        logger.info("Seeded %d properties", len(SEED_PROPERTIES))


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.otps.create_index("expires_at", expireAfterSeconds=0)
    await db.properties.create_index("slug")
    await db.rooms.create_index("property_id")
    await db.bookings.create_index("user_id")
    await seed_admin()
    await seed_data()


@api.get("/")
async def root():
    return {"app": "OneLightStays", "status": "ok"}


# Register router & CORS
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_event():
    client.close()
