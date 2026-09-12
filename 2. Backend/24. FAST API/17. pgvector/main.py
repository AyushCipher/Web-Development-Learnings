"""
==============================================================================
         17. PGVECTOR WITH FASTAPI, SQLALCHEMY & POSTGRESQL
==============================================================================

Q. WHAT IS PGVECTOR?
ANS: pgvector is an open-source extension for PostgreSQL that adds native support
for vector embeddings, vector distance metrics (Cosine <=>, Euclidean <->, Inner Product <#>),
and fast Approximate Nearest Neighbor (ANN) index types (HNSW and IVFFlat).
It enables building AI applications (Semantic Search, RAG, AI Agents, Text-to-SQL)
directly on top of PostgreSQL without needing a separate vector database.

Q. WHAT ARE THE THREE POSTGRESQL AI EXTENSIONS?
1. pgvector: Core vector storage, distance operators, HNSW & IVFFlat indexes.
2. pgvectorscale: StreamingDiskANN (1B+ scale on NVMe SSD), Statistical Binary Quantization (SBQ).
3. pgai: In-database AI functions (generate OpenAI/Ollama embeddings and chat completions in SQL).

Q. VECTOR SEARCH INDEXES COMPARISON:
- IVFFLAT: Low memory, medium workloads (100k-1M), requires rebuilding on updates.
- HNSW: Real-time search, high recall (>98%), updates without rebuild, high RAM usage.
- StreamingDiskANN (pgvectorscale): Scales to 1B+ on NVMe SSD, solves filtered search, handles updates.
==============================================================================
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, select, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pgvector.sqlalchemy import Vector

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pgvector_demo_db"
)

# SQLAlchemy Database Setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Model with pgvector Vector(3) Column
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    author = Column(String(50), default="System")
    # 3-dimensional vector for educational demo (OpenAI uses 1536, Gemini uses 768)
    embedding = Column(Vector(3), nullable=False)

# Pydantic Schemas
class DocumentCreate(BaseModel):
    title: str = Field(..., example="FastAPI & Microservices")
    content: str = Field(..., example="Building asynchronous REST APIs with Python and PostgreSQL")
    category: str = Field(..., example="backend")
    author: Optional[str] = Field("Ayush", example="Ayush")
    embedding: List[float] = Field(..., example=[0.15, 0.92, 0.20])

class SearchQuery(BaseModel):
    query_vector: List[float] = Field(..., example=[0.15, 0.90, 0.25])
    top_k: int = Field(3, ge=1, le=10)
    category_filter: Optional[str] = None

class RAGRequest(BaseModel):
    question: str = Field(..., example="How do I build a scalable backend with PostgreSQL?")
    category_filter: Optional[str] = None

# Initialize FastAPI App
app = FastAPI(
    title="17. pgvector with FastAPI & PostgreSQL",
    description="Hands-on AI Engineering API: Semantic Search, RAG, and Vector Distances with pgvector",
    version="1.0.0"
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Startup event to ensure pgvector extension and seed initial data
@app.on_event("startup")
def startup_event():
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
        Base.metadata.create_all(bind=engine)

        # Seed initial documents if empty
        db = SessionLocal()
        if db.query(Document).count() == 0:
            sample_docs = [
                Document(
                    title="Frontend Engineering with React & Next.js",
                    content="Building interactive, server-rendered UIs with React 19, Next.js, and Tailwind CSS.",
                    category="frontend",
                    author="Sarah",
                    embedding=[0.92, 0.12, 0.08] # Heavy Dim 1 (Frontend)
                ),
                Document(
                    title="Backend & Microservices with PostgreSQL",
                    content="Designing distributed systems, API gateways, database transactions, Kafka, and Redis.",
                    category="backend",
                    author="Ayush",
                    embedding=[0.15, 0.94, 0.22] # Heavy Dim 2 (Backend)
                ),
                Document(
                    title="Cloud DevOps & Observability",
                    content="Docker containers, Kubernetes orchestration, Prometheus metrics, and Grafana dashboards.",
                    category="devops",
                    author="DevOps Team",
                    embedding=[0.10, 0.70, 0.95] # Heavy Dim 3 (DevOps)
                ),
                Document(
                    title="Authentic Neapolitan Pizza",
                    content="Wood-fired sourdough pizza crafting with San Marzano tomatoes and fresh mozzarella.",
                    category="lifestyle",
                    author="Chef Luigi",
                    embedding=[0.02, 0.04, 0.01] # Unrelated
                )
            ]
            db.add_all(sample_docs)
            db.commit()
            print("✓ Seeded sample vector documents into PostgreSQL.")
        db.close()
    except Exception as e:
        print(f"⚠️ Startup note (Postgres connection): {e}")

@app.get("/")
def home():
    return {
        "module": "17. pgvector with FastAPI",
        "description": "PostgreSQL Vector Database API for Semantic Search and RAG",
        "endpoints": {
            "swagger_docs": "/docs",
            "all_documents": "GET /documents",
            "create_document": "POST /documents",
            "cosine_search": "POST /search/cosine",
            "euclidean_search": "POST /search/l2",
            "rag_ask": "POST /rag/ask",
            "indexes_info": "GET /indexes/info"
        }
    }

@app.get("/documents")
def get_all_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return {
        "count": len(docs),
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "category": d.category,
                "author": d.author,
                "content": d.content,
                "embedding": [float(x) for x in d.embedding]
            }
            for d in docs
        ]
    }

@app.post("/documents")
def create_document(doc: DocumentCreate, db: Session = Depends(get_db)):
    new_doc = Document(
        title=doc.title,
        content=doc.content,
        category=doc.category,
        author=doc.author,
        embedding=doc.embedding
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return {"message": "Document and vector embedding stored successfully!", "id": new_doc.id}

# 1. SEMANTIC SEARCH WITH COSINE DISTANCE (<=>)
@app.post("/search/cosine")
def semantic_cosine_search(query: SearchQuery, db: Session = Depends(get_db)):
    """
    Cosine Distance (<=>) measures the angle between vectors.
    Cosine Similarity = 1 - Cosine Distance.
    Best for text embeddings and RAG.
    """
    stmt = select(
        Document,
        Document.embedding.cosine_distance(query.query_vector).label("distance")
    )
    if query.category_filter:
        stmt = stmt.where(Document.category == query.category_filter)

    stmt = stmt.order_by("distance").limit(query.top_k)
    results = db.execute(stmt).all()

    return {
        "metric": "Cosine Distance (<=>)",
        "results": [
            {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "content": doc.content,
                "cosine_distance": round(float(dist), 4),
                "similarity_score": f"{round((1 - float(dist)) * 100, 2)}%"
            }
            for doc, dist in results
        ]
    }

# 2. L2 / EUCLIDEAN DISTANCE SEARCH (<->)
@app.post("/search/l2")
def euclidean_l2_search(query: SearchQuery, db: Session = Depends(get_db)):
    """
    L2 Distance (<->) measures straight-line distance.
    Best for image recognition and physical spatial embeddings.
    """
    stmt = select(
        Document,
        Document.embedding.l2_distance(query.query_vector).label("distance")
    )
    if query.category_filter:
        stmt = stmt.where(Document.category == query.category_filter)

    stmt = stmt.order_by("distance").limit(query.top_k)
    results = db.execute(stmt).all()

    return {
        "metric": "L2 / Euclidean Distance (<->)",
        "results": [
            {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "l2_distance": round(float(dist), 4)
            }
            for doc, dist in results
        ]
    }

# 3. END-TO-END RAG (RETRIEVAL-AUGMENTED GENERATION) PIPELINE
@app.post("/rag/ask")
def rag_ask(req: RAGRequest, db: Session = Depends(get_db)):
    """
    RAG Pipeline:
    1. Converts query to vector embedding.
    2. Retrieves top-2 most relevant chunks from PostgreSQL via pgvector.
    3. Injects retrieved chunks into the LLM system prompt as verified context.
    """
    # Simple embedding mock simulation
    q = req.question.lower()
    if any(w in q for w in ["react", "frontend", "ui", "tailwind"]):
        query_vector = [0.89, 0.11, 0.09]
    elif any(w in q for w in ["backend", "postgres", "microservice", "database", "api"]):
        query_vector = [0.14, 0.91, 0.20]
    elif any(w in q for w in ["docker", "k8s", "kubernetes", "grafana", "devops"]):
        query_vector = [0.12, 0.65, 0.92]
    else:
        query_vector = [0.33, 0.33, 0.33]

    stmt = select(
        Document,
        Document.embedding.cosine_distance(query_vector).label("distance")
    )
    if req.category_filter:
        stmt = stmt.where(Document.category == req.category_filter)

    stmt = stmt.order_by("distance").limit(2)
    results = db.execute(stmt).all()

    context_chunks = [
        f"[Source: {doc.title}] {doc.content}"
        for doc, _ in results
    ]

    constructed_prompt = (
        "SYSTEM: You are a factual AI assistant. Answer using ONLY the provided context.\n\n"
        f"CONTEXT FROM POSTGRESQL:\n{chr(10).join(context_chunks)}\n\n"
        f"USER QUESTION:\n{req.question}\n\n"
        "FACTUAL ANSWER:"
    )

    return {
        "user_question": req.question,
        "retrieved_context_chunks": len(results),
        "sources": [doc.title for doc, _ in results],
        "constructed_augmented_prompt": constructed_prompt
    }

# 4. INDEX COMPARISON INFORMATION
@app.get("/indexes/info")
def get_indexes_comparison():
    return {
        "indexes": [
            {
                "name": "IVFFLAT",
                "best_for": "Medium workloads (100k - 1M vectors) with constrained RAM",
                "pros": ["Low memory usage", "Faster than linear scan"],
                "cons": ["Updates require rebuilding the index", "Lower accuracy vs HNSW/DiskANN"]
            },
            {
                "name": "HNSW",
                "best_for": "Real-time search on medium workloads (100k - 1M vectors)",
                "pros": ["High accuracy (>98% recall)", "Handles updates without rebuild", "Supports quantization (halfvec, PQ, BQ)", "Fast parallel build"],
                "cons": ["Problems with filtered search accuracy", "High RAM consumption", "Cost scales with RAM", "Scale limitations"]
            },
            {
                "name": "StreamingDiskANN (pgvectorscale)",
                "best_for": "Large scale workloads (10M+ to 1B+ vectors) & Filtered search",
                "pros": ["High accuracy filtered search", "Scales to 1B+ on NVMe SSD", "Statistical Binary Quantization (SBQ) by default", "75% cheaper than pure RAM", "Handles updates without rebuild"],
                "cons": ["Longer build times than HNSW"]
            }
        ]
    }
