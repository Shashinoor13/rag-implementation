from app.services.embedding_service import get_embedding
from app.services.llm_service import generate_answer
from app.db.models import Document
from app.db.database import db
from sqlalchemy import text
import json
from ..config import MIN_SIMILARITY_SCORE



def handle_query(query, context,user_id, k=5):
    try:
        query_embedding = get_embedding(query)
        similar_docs = get_similar_documents(query_embedding, user_id, k)
        
        if not similar_docs:
            return {
                "executiveSummary": ["No relevant documents found"],
                "supportingFacts": [],
                "sources": [],
                "answer": "I couldn't find any relevant documents to answer your query. Please upload some documents first."
            }
        
        context = prepare_context(similar_docs)
        
        answer = generate_answer(query, context)
        sources = [doc['file_path'].split('/')[-1] for doc in similar_docs]  # Get filename from path
        supporting_facts = extract_supporting_facts(similar_docs, query)
        executive_summary = generate_executive_summary(answer, similar_docs)
        
        return {
            "executiveSummary": executive_summary,
            "supportingFacts": supporting_facts,
            "sources": sources,
            "answer": str(answer)
        }
        
    except Exception as e:
        print(f"Error in handle_query: {e}")
        return {
            "executiveSummary": ["Error processing query"],
            "supportingFacts": [],
            "sources": [],
            "answer": f"Sorry, I encountered an error while processing your query: {str(e)}"
        }

def get_similar_documents(query_embedding, user_id, k=5):
    try:
        # Convert embedding to PostgreSQL array format
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        sql_query = text("""
            SELECT 
                id,
                content,
                file_path,
                (1 - (embedding <=> :query_embedding)) as similarity_score
            FROM documents 
            WHERE user_id = :user_id 
                AND status = 'completed'
                AND embedding IS NOT NULL
            ORDER BY embedding <=> :query_embedding
            LIMIT :k
        """)

        result = db.session.execute(sql_query, {
            'query_embedding': embedding_str,
            'user_id': user_id,
            'k': k
        })
        
        documents = []
        for row in result:
            similarity = float(row.similarity_score)
            if similarity >= MIN_SIMILARITY_SCORE:
                documents.append({
                    'id': str(row.id),
                    'content': row.content,
                    'file_path': row.file_path,
                    'similarity_score': similarity
                })
        
        return documents
        
    except Exception as e:
        print(f"Error in get_similar_documents: {e}")
        db.session.rollback()
        return []

def prepare_context(documents):
    context_parts = []
    
    for i, doc in enumerate(documents, 1):
        # Get filename from file path
        filename = doc['file_path'].split('/')[-1] if doc['file_path'] else f"Document {i}"
        
        # Truncate content if too long (adjust as needed)
        content = doc['content']
        if len(content) > 2000:  # Adjust this limit based on your LLM context window
            content = content[:2000] + "..."
        
        context_parts.append(f"Document {i} ({filename}):\n{content}\n")
    
    return "\n".join(context_parts)

def extract_supporting_facts(documents, query):
    supporting_facts = []
    
    for doc in documents:
        filename = doc['file_path'].split('/')[-1] if doc['file_path'] else "Unknown"
        content = doc['content']
        sentences = content.split('. ')
        
        # Take first 2 sentences as supporting facts
        for i, sentence in enumerate(sentences[:2]):
            if sentence.strip() and len(sentence) > 20:
                fact = sentence.strip()
                if not fact.endswith('.'):
                    fact += '.'
                supporting_facts.append(f"{fact} [Source: {filename}]")
        
        # Limit to prevent too many facts
        if len(supporting_facts) >= 5:
            break
    
    return supporting_facts

def generate_executive_summary(answer, documents):

    summary_points = []
    
    sentences = str(answer).split('. ')
    
    for sentence in sentences[:3]: 
        if sentence.strip() and len(sentence) > 30:
            point = sentence.strip()
            if not point.endswith('.'):
                point += '.'
            summary_points.append(point)
    
    # If no good summary points from answer, create generic ones
    if not summary_points:
        summary_points = [
            f"Analysis based on {len(documents)} relevant document(s)",
            "Information extracted from your uploaded documents"
        ]
    
    return summary_points

def get_user_documents_status(user_id):
    try:
        documents = Document.query.filter_by(user_id=user_id).all()
        
        status_counts = {
            'total': len(documents),
            'pending': 0,
            'processing': 0,
            'completed': 0,
            'failed': 0
        }
        
        for doc in documents:
            if doc.status in status_counts:
                status_counts[doc.status] += 1
        
        return status_counts
        
    except Exception as e:
        print(f"Error getting document status: {e}")
        return {'total': 0, 'pending': 0, 'processing': 0, 'completed': 0, 'failed': 0}