from flask import Flask
from .api import register_routes
from .db.database import init_db
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import JWT_SECRET_KEY

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_SECURE"] = False
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    
    # Configure CORS to allow the frontend origin
    # CORS(app, 
    #      origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    #      supports_credentials=True,
    #      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    #      allow_headers=["Content-Type", "Authorization"])
    CORS(app, 
    resources={r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "supports_credentials": True,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})
    
    JWTManager(app)
    init_db(app)
    register_routes(app)
    return app