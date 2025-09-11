from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products, orders, auth, pos, contact
from app.database import init_db, seed_if_empty

app = FastAPI(title="Al Noor Farm API", version="0.1.0")

# CORS (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="")
app.include_router(orders.router, prefix="")
app.include_router(auth.router, prefix="")
app.include_router(pos.router, prefix="")
app.include_router(contact.router, prefix="")


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
