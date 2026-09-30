"""Tests for post-restart smoke check:
- Admin dedicated register endpoint (/auth/register-admin) with correct/wrong code
- Regular /auth/register rejects role=admin
- Owner add-bouquet persists primary_flowers[] AND flowers_included
"""
import uuid
import pytest
from conftest import BASE_URL, bearer

ADMIN_CODE = "ELAYA-ADMIN-2026"


# ---------- Admin registration ----------
class TestAdminRegistration:
    def test_register_admin_with_valid_code_succeeds(self, api_client):
        email = f"TEST_uiadmin_{uuid.uuid4().hex[:8]}@elaya.ph"
        payload = {"name": "UI Admin", "email": email, "password": "AdminPass1!",
                   "admin_code": ADMIN_CODE}
        r = api_client.post(f"{BASE_URL}/api/auth/register-admin", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == email.lower()
        assert data["access_token"]
        # verify persisted: login works
        li = api_client.post(f"{BASE_URL}/api/auth/login",
                             json={"email": email, "password": "AdminPass1!"}, timeout=15)
        assert li.status_code == 200
        assert li.json()["user"]["role"] == "admin"

    def test_register_admin_with_wrong_code_is_403(self, api_client):
        email = f"TEST_uiadmin_bad_{uuid.uuid4().hex[:8]}@elaya.ph"
        payload = {"name": "Bad", "email": email, "password": "AdminPass1!",
                   "admin_code": "WRONG-CODE"}
        r = api_client.post(f"{BASE_URL}/api/auth/register-admin", json=payload, timeout=15)
        assert r.status_code == 403, r.text
        # verify not created
        li = api_client.post(f"{BASE_URL}/api/auth/login",
                             json={"email": email, "password": "AdminPass1!"}, timeout=15)
        assert li.status_code == 401

    def test_register_admin_with_empty_code_is_403(self, api_client):
        email = f"TEST_uiadmin_empty_{uuid.uuid4().hex[:8]}@elaya.ph"
        payload = {"name": "Empty", "email": email, "password": "AdminPass1!",
                   "admin_code": ""}
        r = api_client.post(f"{BASE_URL}/api/auth/register-admin", json=payload, timeout=15)
        assert r.status_code == 403

    def test_regular_register_rejects_role_admin(self, api_client):
        email = f"TEST_selfadmin_{uuid.uuid4().hex[:8]}@elaya.ph"
        r = api_client.post(
            f"{BASE_URL}/api/auth/register",
            json={"name": "Self Admin", "email": email, "password": "TestPass1!", "role": "admin"},
            timeout=15,
        )
        assert r.status_code == 400, r.text
        # verify not created
        li = api_client.post(f"{BASE_URL}/api/auth/login",
                             json={"email": email, "password": "TestPass1!"}, timeout=15)
        assert li.status_code == 401


# ---------- Owner add-bouquet with primary_flowers + flowers_included ----------
class TestBouquetPrimaryFlowers:
    def test_add_bouquet_persists_primary_flowers_and_included(self, api_client, owner_auth):
        oh = bearer(owner_auth["access_token"])
        primary = ["Rose", "Tulip", "Lily", "Sunflower"]
        included = ["12 Roses", "3 Tulips", "2 Lilies", "1 Sunflower", "Greenery filler"]
        payload = {
            "name": f"TEST_PF_{uuid.uuid4().hex[:5]}",
            "price": 800,
            "stock": 3,
            "description": "test primary flowers persistence",
            "images": ["https://x/a.jpg", "https://x/b.jpg"],
            "primary_flowers": primary,
            "flowers_included": included,
        }
        c = api_client.post(f"{BASE_URL}/api/owner/products", json=payload, headers=oh, timeout=20)
        assert c.status_code == 200, c.text
        created = c.json()
        pid = created["id"]
        # Immediate response has both fields
        assert created.get("primary_flowers") == primary, created
        assert created.get("flowers_included") == included

        # GET /products/{id} verifies persistence
        g = api_client.get(f"{BASE_URL}/api/products/{pid}", timeout=15)
        assert g.status_code == 200
        d = g.json()
        assert d.get("primary_flowers") == primary, d.get("primary_flowers")
        assert d.get("flowers_included") == included

        # cleanup
        api_client.delete(f"{BASE_URL}/api/owner/products/{pid}", headers=oh, timeout=15)

    def test_add_bouquet_without_primary_flowers_still_works(self, api_client, owner_auth):
        oh = bearer(owner_auth["access_token"])
        payload = {
            "name": f"TEST_NoPF_{uuid.uuid4().hex[:5]}",
            "price": 300, "stock": 2,
            "images": ["https://x/a.jpg", "https://x/b.jpg"],
            "flowers_included": ["Roses only"],
        }
        c = api_client.post(f"{BASE_URL}/api/owner/products", json=payload, headers=oh, timeout=15)
        assert c.status_code == 200, c.text
        created = c.json()
        pid = created["id"]
        # primary_flowers may be None or empty — both acceptable
        assert created.get("primary_flowers") in (None, [])
        assert created.get("flowers_included") == ["Roses only"]
        api_client.delete(f"{BASE_URL}/api/owner/products/{pid}", headers=oh, timeout=15)
