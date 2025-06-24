from .database import db
from sqlalchemy.dialects.postgresql import UUID,JSONB
from pgvector.sqlalchemy import Vector
import uuid
from ..config import EMBEDDING_DIM

class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = db.Column(db.Text)
    embedding = db.Column(Vector(EMBEDDING_DIM))
    file_path = db.Column(db.Text)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(32), default='pending')  # pending, processing, completed, failed
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    processed_at = db.Column(db.DateTime, nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    user = db.relationship('User', back_populates='documents')

class Query(db.Model):
    __tablename__ = 'queries'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_text = db.Column(JSONB)
    type = db.Column(db.String(16), nullable=False, default='query')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='queries')
    chat_id = db.Column(UUID(as_uuid=True), db.ForeignKey('chats.id'), nullable=False)
    chat = db.relationship('Chat', back_populates='queries')
    revalidations = db.relationship('Revalidation', back_populates='query', lazy=True, order_by="Revalidation.version")

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    documents = db.relationship('Document', back_populates='user', lazy=True)
    queries = db.relationship('Query', back_populates='user', lazy=True)
    chats = db.relationship('Chat', back_populates='user', lazy=True)

class Chat(db.Model):
    __tablename__ = 'chats'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(128), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    queries = db.relationship('Query', back_populates='chat', lazy=True)
    user = db.relationship('User', back_populates='chats')

class Revalidation(db.Model):
    __tablename__ = 'revalidations'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query_id = db.Column(UUID(as_uuid=True), db.ForeignKey('queries.id'), nullable=False)
    version = db.Column(db.Integer, nullable=False)
    regenerated_response = db.Column(db.Text, nullable=False)
    regenerated_at = db.Column(db.DateTime, server_default=db.func.now())
    query = db.relationship('Query', back_populates='revalidations')