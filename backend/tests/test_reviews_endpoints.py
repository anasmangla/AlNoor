import pytest


@pytest.mark.asyncio
async def test_review_create_and_list(client):
    payload = {
        "name": "Test Customer",
        "location": "Lewiston, NY",
        "rating": 5,
        "message": "Loved the fresh produce and friendly service!",
        "photo_url": "https://example.com/review.jpg",
    }

    resp = await client.post("/reviews", json=payload)
    assert resp.status_code == 201
    created = resp.json()
    assert created["name"] == payload["name"]
    assert created["location"] == payload["location"]
    assert created["rating"] == payload["rating"]
    assert created["photo_url"] == payload["photo_url"]
    assert created["message"].startswith("Loved the fresh produce")

    resp = await client.get("/reviews")
    assert resp.status_code == 200
    reviews = resp.json()
    assert any(review["id"] == created["id"] for review in reviews)


@pytest.mark.asyncio
async def test_review_rating_validation(client):
    payload = {
        "name": "Unhappy",
        "rating": 7,
        "message": "The rating value should be within the accepted range.",
    }
    resp = await client.post("/reviews", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_review_rejects_blank_message(client):
    payload = {
        "message": "          ",
    }
    resp = await client.post("/reviews", json=payload)
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Review message cannot be empty."
