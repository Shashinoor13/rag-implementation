from flask import Blueprint, request, jsonify, current_app
from app.db.models import Document, User
from app.db.database import db
from app.services.embedding_service import get_embedding
from app.utils.file_storage import save_txt_file
from flask_jwt_extended import get_jwt_identity, jwt_required
import threading
from datetime import datetime

upload_bp = Blueprint('upload', __name__)


def process_embedding_async(app, document_id, content):
    """Background task to generate embeddings"""
    with app.app_context():
        try:
            # Update status to processing
            doc = Document.query.get(document_id)
            if not doc:
                print(f"Document {document_id} not found")
                return
                
            doc.status = 'processing'
            db.session.commit()
            
            # Generate embeddings
            embeddings = get_embedding(content)
            
            # Update document with embeddings
            doc.embedding = embeddings
            doc.status = 'completed'
            doc.processed_at = datetime.utcnow()
            db.session.commit()
            
            print(f"Document {document_id} processed successfully")
                    
        except Exception as e:
            # Handle errors
            try:
                doc = Document.query.get(document_id)
                if doc:
                    doc.status = 'failed'
                    doc.error_message = str(e)
                    doc.processed_at = datetime.utcnow()
                    db.session.commit()
                    
                    print(f"Error processing document {document_id}: {e}")
            except Exception as inner_e:
                print(f"Failed to update error status for document {document_id}: {inner_e}")
                db.session.rollback()
            db.session.rollback()

@upload_bp.route('/document', methods=['POST'])
@jwt_required()
def upload_document():
    print("Uploading document")
    
    if 'file' not in request.files:
        return jsonify({'msg': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'msg': 'No selected file'}), 400
    
    if not file.filename.lower().endswith('.txt'):
        return jsonify({'msg': 'Only .txt files are allowed'}), 400
    
    # Save file
    file_path = save_txt_file(file)
    
    # Read content
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Get user
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    # Create document record with pending status
    doc = Document(
        content=content,
        embedding=None,  # Will be set later
        file_path=file_path,
        user_id=user.id,
        status='pending',
        created_at=datetime.utcnow()
    )
    
    db.session.add(doc)
    db.session.commit()
    
    # Start background embedding generation
    thread = threading.Thread(
        target=process_embedding_async,
        args=(current_app._get_current_object(), doc.id, content)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'msg': 'Document uploaded successfully',
        'id': str(doc.id),
        'file_path': file_path,
        'status': 'pending'
    }), 201

@upload_bp.route('/document/<document_id>/status', methods=['GET'])
@jwt_required()
def get_document_status(document_id):
    """Check the processing status of a document"""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    doc = Document.query.filter_by(id=document_id, user_id=user.id).first()
    
    if not doc:
        return jsonify({'msg': 'Document not found'}), 404
    
    response_data = {
        'id': str(doc.id),
        'status': doc.status,
        'created_at': doc.created_at.isoformat() if doc.created_at else None,
        'processed_at': doc.processed_at.isoformat() if doc.processed_at else None
    }
    
    if doc.status == 'failed' and doc.error_message:
        response_data['error'] = doc.error_message
    
    return jsonify(response_data), 200

@upload_bp.route('/documents/status', methods=['GET'])
@jwt_required()
def get_all_documents_status():
    """Get status of all user's documents"""
    username = get_jwt_identity()
    user = User.query.filter_by(username=username).first()
    
    documents = Document.query.filter_by(user_id=user.id).all()
    
    docs_status = []
    for doc in documents:
        doc_data = {
            'id': str(doc.id),
            'status': doc.status,
            'created_at': doc.created_at.isoformat() if doc.created_at else None,
            'processed_at': doc.processed_at.isoformat() if doc.processed_at else None,
            'file_path': doc.file_path
        }
        
        if doc.status == 'failed' and doc.error_message:
            doc_data['error'] = doc.error_message
            
        docs_status.append(doc_data)
    
    return jsonify({'documents': docs_status}), 200