from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import User, Chat, Query


history_bp = Blueprint("history", __name__)

@history_bp.route("/", methods=["GET"])
@jwt_required()
def history():
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    chats = Chat.query.filter_by(user_id=user.id).all()
    chat_list = [{"id": str(chat.id), "title": chat.title} for chat in chats]
    return jsonify({"chats": chat_list})

@history_bp.route("/chat/<chat_id>", methods=["GET"])
@jwt_required()
def chat_history(chat_id):
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404
    chat = Chat.query.filter_by(id=chat_id, user_id=user.id).first()
    if not chat:
        return jsonify({"msg": "Chat not found"}), 404
    queries = Query.query.filter_by(chat_id=chat.id).order_by(Query.created_at).all()
    queries_list = [
        {
            "id": str(q.id),
            "text": q.query_text,
            "type": q.type,
            "created_at": q.created_at.isoformat() if q.created_at else None
        }
        for q in queries
    ]
    return jsonify({"chat_id": str(chat.id), "title": chat.title, "queries": queries_list})
