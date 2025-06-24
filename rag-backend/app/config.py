import os
from dotenv import load_dotenv
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_URL = os.getenv("DATABASE_URL")
EMBEDDING_DIM = 384
MIN_SIMILARITY_SCORE = 0.5
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
