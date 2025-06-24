import datetime
from flask import Blueprint, request, jsonify
from app.services.rag_service import handle_query
from app.services.llm_service import generate_title
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import User, Query, Chat
from app.db.database import db
from uuid import uuid4

query_bp = Blueprint("query", __name__)

@query_bp.route("/", methods=["POST"])
@jwt_required()
def create_query():
    data = request.get_json()
    query_text = data.get("query_text") or data.get("query")
    chat_id = data.get("chat_id")
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    res_title = generate_title(query_text)
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    # If chat_id is not provided, create a new chat
    if not chat_id:
        res_title = "New Chat"
        try:
            res_title = generate_title(query_text)
            # Ensure title doesn't exceed database limit
            if len(res_title) > 120:  # Leave some buffer
                res_title = res_title[:120] + "..."
            print(res_title)
        except Exception as e:
            res_title = f"Chat {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
        chat = Chat(id=uuid4(), title=res_title, user_id=user.id)
        db.session.add(chat)
        db.session.commit()
    else:
        chat = Chat.query.filter_by(id=chat_id, user_id=user.id).first()
        if not chat:
            # Generate a safe title for existing chat
            try:
                res_title = generate_title(query_text)
                if len(res_title) > 120:
                    res_title = res_title[:120] + "..."
            except Exception as e:
                res_title = f"Chat {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
            chat = Chat(id=chat_id, title=res_title, user_id=user.id)
            db.session.add(chat)
            db.session.commit()

    response = handle_query(query=query_text,context=query_text,user_id=user.id)
    query = Query(query_text={"query":query_text}, user_id=user.id, chat_id=chat.id)
    ai_response = Query(query_text=response, user_id=user.id, chat_id=chat.id, type="response")
    db.session.add(query)
    db.session.add(ai_response)
    db.session.commit()
    return jsonify({'msg': 'Query created', 'id': str(query.id), 'chat_id': str(chat.id), 'text': response, 'type': 'response', 'created_at': datetime.datetime.now().isoformat() + "Z"}), 201