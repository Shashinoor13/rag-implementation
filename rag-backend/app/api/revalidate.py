from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db.models import Query,User, Revalidation
from app.db.database import db
from app.services.rag_service import handle_query

revalidate_bp = Blueprint("revalidate", __name__)

@revalidate_bp.route("/", methods=["POST"])
@jwt_required()
def revalidate():
    try:
        data = request.get_json()
        query_id = data.get("query_id")
        username = get_jwt_identity()
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Find the target query
        target_query = Query.query.filter_by(id=query_id, user_id=user.id).first()
        if not target_query:
            return jsonify({"msg": "Query not found"}), 404

        # Get the chat and all queries up to and including this one, ordered by created_at
        chat = target_query.chat
        if not chat:
            return jsonify({"msg": "Chat not found"}), 404

        # Get all queries in this chat up to and including the target query
        queries = (
            Query.query
            .filter(Query.chat_id == chat.id, Query.created_at <= target_query.created_at)
            .order_by(Query.created_at)
            .all()
        )

        # Build the context (e.g., concatenate all user and AI messages up to this point)
        context_parts = []
        for q in queries:
            if q.type == "query":
                # Extract query text from JSONB
                query_text = q.query_text.get("query", str(q.query_text)) if isinstance(q.query_text, dict) else str(q.query_text)
                context_parts.append(f"User: {query_text}")
            elif q.type == "response":
                # For responses, the query_text contains the actual response
                response_text = str(q.query_text)
                context_parts.append(f"AI: {response_text}")
        
        context = "\n".join(context_parts)

        # Get all previous revalidations for this query
        last_reval = (
            db.session.query(Revalidation)
            .filter_by(query_id=target_query.id)
            .order_by(Revalidation.version.desc())
            .first()
        )
        next_version = 2 if not last_reval else last_reval.version + 1

        # Extract the original query text from the target query
        original_query = target_query.query_text.get("query", str(target_query.query_text)) if isinstance(target_query.query_text, dict) else str(target_query.query_text)

        # Regenerate the answer using your LLM service
        updated_query = original_query + "Your last response was not satisfactory could you change your approach to answer."
        updated_context = context 
        regenerated_response_obj = handle_query(query=original_query, context=updated_context, user_id=user.id)
        
        # Extract just the answer text from the response object
        regenerated_response_text = regenerated_response_obj.get("answer", str(regenerated_response_obj))

        # Store the new revalidation
        reval = Revalidation(
            query_id=target_query.id,
            version=next_version,
            regenerated_response=regenerated_response_text,
        )
        db.session.add(reval)
        db.session.commit()

        return jsonify({
            "query_id": str(target_query.id),
            "version": next_version,
            "regenerated_response": regenerated_response_text,
            "regenerated_at": reval.regenerated_at.isoformat() + "Z"
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in revalidate endpoint: {e}")
        return jsonify({"msg": f"Internal server error: {str(e)}"}), 500