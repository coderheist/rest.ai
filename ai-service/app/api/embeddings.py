"""
Embeddings API Routes
Handles embedding generation endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import List
import logging

from app.services.embedding_service import embedding_service
from app.models.common import TextInput, BatchTextInput, EmbeddingVector

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate")
async def generate_embedding(request: TextInput):
    """
    Generate embedding for single text
    
    Args:
        request: Text input
        
    Returns:
        Embedding vector
    """
    try:
        embedding = embedding_service.generate_embedding(request.text)
        
        return {
            "success": True,
            "embedding": embedding,
            "dimension": len(embedding),
            "model": embedding_service.model_name
        }
        
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch")
async def generate_embeddings_batch(request: BatchTextInput):
    """
    Generate embeddings for multiple texts
    
    Args:
        request: Batch text input
        
    Returns:
        List of embedding vectors
    """
    try:
        embeddings = embedding_service.generate_embeddings_batch(request.texts)
        
        return {
            "success": True,
            "embeddings": embeddings,
            "count": len(embeddings),
            "dimension": len(embeddings[0]) if embeddings else 0,
            "model": embedding_service.model_name
        }
        
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/similarity")
async def compute_similarity(embedding1: List[float], embedding2: List[float]):
    """
    Compute similarity between two embeddings
    
    Args:
        embedding1: First embedding vector
        embedding2: Second embedding vector
        
    Returns:
        Similarity score
    """
    try:
        similarity = embedding_service.compute_similarity(embedding1, embedding2)
        
        return {
            "success": True,
            "similarity": similarity
        }
        
    except Exception as e:
        logger.error(f"Error computing similarity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def get_models():
    """Get available embedding models"""
    return {
        "current_model": embedding_service.model_name,
        "info": embedding_service.get_model_info()
    }


@router.get("/health")
async def embeddings_health():
    """Health check for embeddings service"""
    return {
        "status": "healthy",
        "service": "embeddings",
        "model_loaded": embedding_service.model is not None,
        "model": embedding_service.model_name
    }
