from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, set_access_cookies
)
from werkzeug.security import generate_password_hash, check_password_hash
from app.db.models import User
from app.db.database import db
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({"msg": "Username, email, and password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409
    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "Registration successful"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=username, expires_delta=datetime.timedelta(hours=1))
        response = jsonify({
            "msg": "Login successful",
            "username": user.username,
            "user_id": str(user.id)
        })
        set_access_cookies(response, access_token)
        return response, 200
    return jsonify({"msg": "Bad username or password"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200
