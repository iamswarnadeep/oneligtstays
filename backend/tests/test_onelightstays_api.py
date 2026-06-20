"""OneLightStays backend API tests."""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://resort-finder-21.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@onelightstays.com"
ADMIN_PASSWORD = "Admin@12345"


class NoCookieSession(requests.Session):
    """Session that doesn't persist cookies between calls.

    Backend's get_current_user checks cookies BEFORE the Authorization header,
    so cookies from a previous login can override Bearer-token auth in tests.
    """
    def request(self, *args, **kwargs):
        resp = super().request(*args, **kwargs)
        self.cookies.clear()
        return resp


@pytest.fixture(scope="session")
def http():
    s = NoCookieSession()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def user_session(http):
    """Register and verify a new user. Returns dict with email, password, token."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    password = "Pass@1234"
    r = http.post(f"{API}/auth/register", json={"name": "Test User", "email": email, "password": password})
    assert r.status_code == 200, f"register failed {r.text}"
    data = r.json()
    assert data.get("demo_otp"), "demo_otp missing in response"
    otp = data["demo_otp"]
    r2 = http.post(f"{API}/auth/verify-otp", json={"email": email, "otp": otp, "purpose": "register"})
    assert r2.status_code == 200, f"verify-otp failed {r2.text}"
    body = r2.json()
    assert "access_token" in body
    assert body["user"]["email"] == email
    return {"email": email, "password": password, "token": body["access_token"], "user_id": body["user"]["id"]}


@pytest.fixture(scope="session")
def user_headers(user_session):
    return {"Authorization": f"Bearer {user_session['token']}"}


# --- Health ---
def test_health(http):
    r = http.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# --- Auth ---
def test_auth_me_admin(http, admin_headers):
    r = http.get(f"{API}/auth/me", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["role"] == "admin"


def test_auth_me_user(http, user_headers, user_session):
    r = http.get(f"{API}/auth/me", headers=user_headers)
    assert r.status_code == 200
    assert r.json()["email"] == user_session["email"]


def test_login_wrong_password(http):
    r = http.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_invalid_otp(http):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = http.post(f"{API}/auth/register", json={"name": "X", "email": email, "password": "Pass@1234"})
    assert r.status_code == 200
    r2 = http.post(f"{API}/auth/verify-otp", json={"email": email, "otp": "000000", "purpose": "register"})
    # could be 400 invalid OTP
    assert r2.status_code == 400


def test_otp_not_found(http):
    r = http.post(f"{API}/auth/verify-otp", json={"email": f"noexist_{uuid.uuid4().hex[:6]}@x.com", "otp": "123456", "purpose": "register"})
    assert r.status_code == 400


def test_forgot_and_reset_password(http):
    # register a fresh user first
    email = f"reset_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "OldPass@1"
    r = http.post(f"{API}/auth/register", json={"name": "R", "email": email, "password": pwd})
    otp = r.json()["demo_otp"]
    http.post(f"{API}/auth/verify-otp", json={"email": email, "otp": otp, "purpose": "register"})
    # forgot
    rf = http.post(f"{API}/auth/forgot-password", json={"email": email})
    assert rf.status_code == 200
    reset_otp = rf.json()["demo_otp"]
    assert reset_otp
    # reset
    new_pwd = "NewPass@1"
    rr = http.post(f"{API}/auth/reset-password", json={"email": email, "otp": reset_otp, "new_password": new_pwd})
    assert rr.status_code == 200
    # login with new
    rl = http.post(f"{API}/auth/login", json={"email": email, "password": new_pwd})
    assert rl.status_code == 200


def test_change_password_requires_current(http, user_session):
    h = {"Authorization": f"Bearer {user_session['token']}"}
    r = http.post(f"{API}/auth/change-password", json={"current_password": "wrong", "new_password": "Whatever@1"}, headers=h)
    assert r.status_code == 400


# --- Properties ---
def test_list_properties(http):
    r = http.get(f"{API}/properties")
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 6
    # check no _id leak
    for p in items:
        assert "_id" not in p
        assert "id" in p


def test_filter_properties(http):
    r = http.get(f"{API}/properties", params={"destination": "Goa"})
    assert r.status_code == 200
    items = r.json()
    assert all(p["destination"].lower() == "goa" for p in items)

    r2 = http.get(f"{API}/properties", params={"property_type": "villa"})
    assert all(p["property_type"] == "villa" for p in r2.json())

    r3 = http.get(f"{API}/properties", params={"min_price": 200, "max_price": 300})
    for p in r3.json():
        assert 200 <= p["starting_price"] <= 300

    r4 = http.get(f"{API}/properties", params={"rating": 4})
    for p in r4.json():
        assert p["avg_rating"] >= 4


def test_property_detail_with_rooms_and_reviews(http):
    items = http.get(f"{API}/properties").json()
    slug = items[0]["slug"]
    r = http.get(f"{API}/properties/{slug}")
    assert r.status_code == 200
    body = r.json()
    assert "rooms" in body and isinstance(body["rooms"], list) and len(body["rooms"]) >= 1
    assert "reviews" in body and isinstance(body["reviews"], list)


# --- Admin CRUD: properties/rooms ---
@pytest.fixture(scope="session")
def created_property(http, admin_headers):
    payload = {
        "title": "TEST Property One",
        "destination": "Goa",
        "property_type": "villa",
        "description": "TEST property created for automated tests",
        "location": "Test Beach",
        "latitude": 15.5,
        "longitude": 73.7,
        "starting_price": 199.0,
        "images": ["https://example.com/img.jpg"],
        "amenities": ["Wi-Fi"],
        "highlights": ["h"],
        "policies": ["p"],
        "house_rules": ["r"],
        "faqs": [{"q": "a", "a": "b"}],
        "is_featured": False,
        "status": "active",
    }
    r = http.post(f"{API}/admin/properties", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    return r.json()


def test_admin_property_crud(http, admin_headers, created_property):
    pid = created_property["id"]
    # update
    upd = {**{k: created_property[k] for k in ["title","destination","property_type","description","location","starting_price"]},
           "latitude": 15.5, "longitude": 73.7, "images": [], "amenities": [], "highlights": [], "policies": [],
           "house_rules": [], "faqs": [], "is_featured": True, "status": "active"}
    upd["title"] = "TEST Property One Updated"
    r = http.put(f"{API}/admin/properties/{pid}", json=upd, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["title"] == "TEST Property One Updated"


def test_non_admin_forbidden(http, user_headers):
    payload = {"title": "x", "destination": "Goa", "property_type": "villa", "description": "d",
               "location": "l", "latitude": 0, "longitude": 0, "starting_price": 100, "images": [],
               "amenities": [], "highlights": [], "policies": [], "house_rules": [], "faqs": []}
    r = http.post(f"{API}/admin/properties", json=payload, headers=user_headers)
    assert r.status_code == 403


@pytest.fixture(scope="session")
def created_room(http, admin_headers, created_property):
    payload = {
        "property_id": created_property["id"],
        "room_name": "TEST Room",
        "description": "Test room",
        "max_adults": 2,
        "max_children": 1,
        "room_size": "30 sqm",
        "price_per_night": 150.0,
        "images": [],
        "amenities": ["Wi-Fi"],
        "total_rooms": 3,
    }
    r = http.post(f"{API}/admin/rooms", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    return r.json()


def test_admin_room_update(http, admin_headers, created_room, created_property):
    rid = created_room["id"]
    upd = {**created_room, "property_id": created_property["id"], "room_name": "TEST Room Updated"}
    # remove fields not in RoomIn
    for k in ["id","created_at"]:
        upd.pop(k, None)
    r = http.put(f"{API}/admin/rooms/{rid}", json=upd, headers=admin_headers)
    assert r.status_code == 200
    assert r.json()["room_name"] == "TEST Room Updated"


# --- Bookings ---
@pytest.fixture(scope="session")
def booking(http, user_headers, created_property, created_room):
    payload = {
        "property_id": created_property["id"],
        "room_id": created_room["id"],
        "checkin": "2026-06-01",
        "checkout": "2026-06-04",
        "guests": 2,
    }
    r = http.post(f"{API}/bookings", json=payload, headers=user_headers)
    assert r.status_code == 200, r.text
    b = r.json()
    assert b["nights"] == 3
    assert b["subtotal"] == 450.0
    assert b["taxes"] == 54.0
    assert b["amount"] == 504.0
    assert b["booking_number"].startswith("OLS")
    return b


def test_booking_invalid_dates(http, user_headers, created_property, created_room):
    payload = {
        "property_id": created_property["id"],
        "room_id": created_room["id"],
        "checkin": "2026-06-05",
        "checkout": "2026-06-05",
        "guests": 1,
    }
    r = http.post(f"{API}/bookings", json=payload, headers=user_headers)
    assert r.status_code == 400


def test_my_bookings(http, user_headers, booking):
    r = http.get(f"{API}/bookings/my", headers=user_headers)
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert booking["id"] in ids


def test_cancel_booking_owner(http, user_headers, user_session, created_property, created_room):
    # create new for cancel
    payload = {"property_id": created_property["id"], "room_id": created_room["id"],
               "checkin": "2026-07-10", "checkout": "2026-07-12", "guests": 1}
    r = http.post(f"{API}/bookings", json=payload, headers=user_headers)
    bid = r.json()["id"]
    r2 = http.post(f"{API}/bookings/{bid}/cancel", headers=user_headers)
    assert r2.status_code == 200


def test_cancel_booking_other_user_forbidden(http, booking):
    # register another user
    email = f"other_{uuid.uuid4().hex[:6]}@x.com"
    rr = http.post(f"{API}/auth/register", json={"name": "O", "email": email, "password": "Pass@1234"})
    otp = rr.json()["demo_otp"]
    vr = http.post(f"{API}/auth/verify-otp", json={"email": email, "otp": otp, "purpose": "register"})
    other_token = vr.json()["access_token"]
    r = http.post(f"{API}/bookings/{booking['id']}/cancel",
                  headers={"Authorization": f"Bearer {other_token}"})
    assert r.status_code == 403


# --- Wishlist ---
def test_wishlist_toggle_and_get(http, user_headers, created_property):
    pid = created_property["id"]
    r = http.post(f"{API}/wishlist/toggle", json={"property_id": pid}, headers=user_headers)
    assert r.status_code == 200
    assert r.json()["action"] == "added"
    g = http.get(f"{API}/wishlist", headers=user_headers).json()
    assert any(p["id"] == pid for p in g)
    r2 = http.post(f"{API}/wishlist/toggle", json={"property_id": pid}, headers=user_headers)
    assert r2.json()["action"] == "removed"


# --- Reviews ---
def test_create_review_updates_property(http, user_headers, created_property):
    pid = created_property["id"]
    before = http.get(f"{API}/properties/{created_property['slug']}").json()
    r = http.post(f"{API}/reviews", json={"property_id": pid, "rating": 5, "review": "Excellent stay"}, headers=user_headers)
    assert r.status_code == 200
    after = http.get(f"{API}/properties/{created_property['slug']}").json()
    assert after["review_count"] == before["review_count"] + 1


# --- Admin stats ---
def test_admin_stats(http, admin_headers):
    r = http.get(f"{API}/admin/stats", headers=admin_headers)
    assert r.status_code == 200
    body = r.json()
    for k in ["total_revenue","total_bookings","active_properties","total_customers","occupancy_rate","monthly_revenue"]:
        assert k in body
    assert isinstance(body["monthly_revenue"], list)


# --- Cleanup ---
def test_zzz_cleanup(http, admin_headers, created_property, created_room):
    http.delete(f"{API}/admin/rooms/{created_room['id']}", headers=admin_headers)
    r = http.delete(f"{API}/admin/properties/{created_property['id']}", headers=admin_headers)
    assert r.status_code == 200
