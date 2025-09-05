from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import products

app = FastAPI(title="Al Noor Farm API", version="0.1.0")

# CORS (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)


@app.get("/")
def root():
    return {"message": "Al Noor Farm API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
