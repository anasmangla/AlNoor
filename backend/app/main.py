import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products, orders, auth, pos, contact, admin, reviews
from app.database import init_db, seed_if_empty

app = FastAPI(title="Al Noor Farm API", version="0.1.0")

# CORS (adjust origins for production)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
    if not allowed_origins:
        allowed_origins = ["*"]
else:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="")
app.include_router(orders.router, prefix="")
app.include_router(auth.router, prefix="")
app.include_router(pos.router, prefix="")
app.include_router(contact.router, prefix="")
app.include_router(reviews.router, prefix="")
app.include_router(admin.router, prefix="")
app.include_router(feedback.router, prefix="")


@app.get("/")
def root():
    return {"message": "Al Noor Farm API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
async def on_startup():
    await init_db()
    await seed_if_empty()
