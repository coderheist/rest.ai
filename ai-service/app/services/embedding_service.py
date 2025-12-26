"""
Embedding Service
Generates vector embeddings using Sentence Transformers
"""
import logging
from typing import List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        """Initialize embedding service"""
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL
        self._load_model()
    
    def _load_model(self):
        """Load sentence transformer model"""
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded embedding model: {self.model_name}")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for single text
        
        Args:
            text: Input text
            
        Returns:
            Embedding vector as list of floats
        """
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        try:
            # Truncate text if too long
            if len(text) > settings.MAX_TEXT_LENGTH:
                text = text[:settings.MAX_TEXT_LENGTH]
                logger.warning(f"Text truncated to {settings.MAX_TEXT_LENGTH} characters")
            
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of embedding vectors
        """
        if not self.model:
            raise RuntimeError("Embedding model not loaded")
        
        try:
            # Truncate texts if needed
            truncated_texts = []
            for text in texts:
                if len(text) > settings.MAX_TEXT_LENGTH:
                    truncated_texts.append(text[:settings.MAX_TEXT_LENGTH])
                else:
                    truncated_texts.append(text)
            
            embeddings = self.model.encode(truncated_texts, convert_to_numpy=True, show_progress_bar=True)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
    
    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Compute cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score (0-1)
        """
        try:
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Cosine similarity
            similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
            
            # Normalize to 0-1 range
            return float((similarity + 1) / 2)
        except Exception as e:
            logger.error(f"Error computing similarity: {e}")
            raise
    
    def get_model_info(self) -> dict:
        """
        Get information about the loaded model
        
        Returns:
            Model information dictionary
        """
        if not self.model:
            return {"error": "Model not loaded"}
        
        return {
            "model_name": self.model_name,
            "dimension": settings.VECTOR_DIM,
            "max_sequence_length": self.model.max_seq_length if hasattr(self.model, 'max_seq_length') else "unknown"
        }


# Global instance
embedding_service = EmbeddingService()
