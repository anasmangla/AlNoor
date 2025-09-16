import pytest


async def login_admin(client):
    resp = await client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_feedback_submission_and_summary(client):
    payload = {
        "name": "Test Visitor",
        "email": "visitor@example.com",
        "rating": 5,
        "interest": "Browsing halal meats",
        "comments": "Looks great!",
    }
    resp = await client.post("/feedback", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["rating"] == payload["rating"]
    assert data["interest"] == payload["interest"]

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    list_resp = await client.get("/admin/feedback", headers=headers)
    assert list_resp.status_code == 200
    entries = list_resp.json()
    assert len(entries) == 1
    assert entries[0]["email"] == payload["email"]

    summary_resp = await client.get("/admin/feedback/summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["total_submissions"] == 1
    assert summary["average_rating"] == pytest.approx(5.0)
    assert summary["interest_breakdown"][0]["count"] == 1
    assert summary["last_submission"] is not None
    assert summary["next_quarterly_review"]


@pytest.mark.asyncio
async def test_feedback_admin_endpoints_require_auth(client):
    resp = await client.get("/admin/feedback")
    assert resp.status_code == 401
    resp = await client.get("/admin/feedback/summary")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_delete_feedback(client):
    create_resp = await client.post(
        "/feedback",
        json={
            "name": "Another Visitor",
            "rating": 4,
            "interest": "Visiting the farm",
        },
    )
    assert create_resp.status_code == 201
    entry_id = create_resp.json()["id"]

    token = await login_admin(client)
    headers = {"Authorization": f"Bearer {token}"}

    delete_resp = await client.delete(f"/admin/feedback/{entry_id}", headers=headers)
    assert delete_resp.status_code == 204

    list_resp = await client.get("/admin/feedback", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json() == []
