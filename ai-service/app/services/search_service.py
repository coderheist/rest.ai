"""
Search Service
Handles semantic search and candidate ranking using FAISS
"""
import logging
from typing import List, Dict, Optional, Tuple
import numpy as np
import faiss
from pathlib import Path

from app.config import settings
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)


class SearchService:
    """Service for semantic search and ranking"""
    
    def __init__(self):
        """Initialize search service"""
        self.index = None
        self.resume_ids = []
        self.resume_texts = []
        self.index_path = settings.VECTOR_STORE_DIR / "faiss_index.bin"
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index"""
        try:
            # Create index with specified dimension
            self.index = faiss.IndexFlatL2(settings.VECTOR_DIM)
            logger.info(f"Initialized FAISS index with dimension {settings.VECTOR_DIM}")
            
            # Try to load existing index
            if self.index_path.exists():
                self.load_index()
        except Exception as e:
            logger.error(f"Error initializing FAISS index: {e}")
    
    def add_resume(self, resume_id: str, resume_text: str, embedding: Optional[List[float]] = None):
        """
        Add resume to search index
        
        Args:
            resume_id: Unique resume identifier
            resume_text: Resume text content
            embedding: Pre-computed embedding (optional)
        """
        try:
            # Generate embedding if not provided
            if embedding is None:
                embedding = embedding_service.generate_embedding(resume_text)
            
            # Convert to numpy array
            vector = np.array([embedding], dtype=np.float32)
            
            # Add to index
            self.index.add(vector)
            self.resume_ids.append(resume_id)
            self.resume_texts.append(resume_text)
            
            logger.info(f"Added resume {resume_id} to index. Total resumes: {len(self.resume_ids)}")
        except Exception as e:
            logger.error(f"Error adding resume to index: {e}")
            raise
    
    def search_similar_resumes(
        self,
        job_description: str,
        top_k: int = 10,
        job_embedding: Optional[List[float]] = None
    ) -> List[Dict]:
        """
        Search for similar resumes to job description
        
        Args:
            job_description: Job description text
            top_k: Number of top results to return
            job_embedding: Pre-computed job embedding (optional)
            
        Returns:
            List of matched resumes with scores
        """
        try:
            if self.index.ntotal == 0:
                logger.warning("Index is empty, no resumes to search")
                return []
            
            # Generate job embedding if not provided
            if job_embedding is None:
                job_embedding = embedding_service.generate_embedding(job_description)
            
            # Convert to numpy array
            query_vector = np.array([job_embedding], dtype=np.float32)
            
            # Search
            k = min(top_k, self.index.ntotal)
            distances, indices = self.index.search(query_vector, k)
            
            # Format results
            results = []
            for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
                if idx < len(self.resume_ids):
                    # Convert L2 distance to similarity score (0-1)
                    similarity = 1 / (1 + distance)
                    
                    results.append({
                        "rank": i + 1,
                        "resume_id": self.resume_ids[idx],
                        "similarity_score": float(similarity),
                        "distance": float(distance)
                    })
            
            logger.info(f"Found {len(results)} similar resumes")
            return results
        except Exception as e:
            logger.error(f"Error searching resumes: {e}")
            raise
    
    def rank_candidates(
        self,
        job_description: str,
        candidates: List[Dict],
        top_n: Optional[int] = None
    ) -> List[Dict]:
        """
        Rank candidates against job description
        
        Args:
            job_description: Job description text
            candidates: List of candidates with 'id' and 'text' keys
            top_n: Return top N candidates (optional)
            
        Returns:
            Ranked list of candidates with scores
        """
        try:
            if not candidates:
                return []
            
            # Generate job embedding
            job_embedding = embedding_service.generate_embedding(job_description)
            job_vector = np.array(job_embedding)
            
            # Generate embeddings for all candidates
            candidate_texts = [c.get('text', '') for c in candidates]
            candidate_embeddings = embedding_service.generate_embeddings_batch(candidate_texts)
            
            # Compute similarities
            ranked = []
            for candidate, embedding in zip(candidates, candidate_embeddings):
                candidate_vector = np.array(embedding)
                
                # Cosine similarity
                similarity = np.dot(job_vector, candidate_vector) / (
                    np.linalg.norm(job_vector) * np.linalg.norm(candidate_vector)
                )
                
                # Normalize to 0-1
                similarity_score = float((similarity + 1) / 2)
                
                ranked.append({
                    "candidate_id": candidate.get('id'),
                    "similarity_score": similarity_score,
                    "resume_text": candidate.get('text', '')[:200] + "..."  # Truncate for response
                })
            
            # Sort by similarity score
            ranked.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Add ranks
            for i, item in enumerate(ranked):
                item['rank'] = i + 1
            
            # Return top N if specified
            if top_n:
                ranked = ranked[:top_n]
            
            logger.info(f"Ranked {len(ranked)} candidates")
            return ranked
        except Exception as e:
            logger.error(f"Error ranking candidates: {e}")
            raise
    
    def save_index(self):
        """Save FAISS index to disk"""
        try:
            if self.index and self.index.ntotal > 0:
                faiss.write_index(self.index, str(self.index_path))
                logger.info(f"Saved index with {self.index.ntotal} vectors")
        except Exception as e:
            logger.error(f"Error saving index: {e}")
    
    def load_index(self):
        """Load FAISS index from disk"""
        try:
            if self.index_path.exists():
                self.index = faiss.read_index(str(self.index_path))
                logger.info(f"Loaded index with {self.index.ntotal} vectors")
        except Exception as e:
            logger.error(f"Error loading index: {e}")
    
    def get_stats(self) -> Dict:
        """
        Get index statistics
        
        Returns:
            Dictionary with index stats
        """
        return {
            "total_resumes": len(self.resume_ids),
            "index_size": self.index.ntotal if self.index else 0,
            "dimension": settings.VECTOR_DIM,
            "index_type": "Flat (L2)"
        }
    
    def clear_index(self):
        """Clear the index"""
        self.index.reset()
        self.resume_ids = []
        self.resume_texts = []
        logger.info("Index cleared")


# Global instance
search_service = SearchService()
