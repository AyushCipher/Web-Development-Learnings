"""
==============================================================================
         17. PGVECTOR WITH FASTAPI, SQLALCHEMY & POSTGRESQL (FULL EDITION)
==============================================================================

CORE TOPICS COVERED:
1. Foundations of AI with Postgres & The Rise of the AI Engineer
2. Vector Database Concepts (Embeddings, Approximate Nearest Neighbor)
3. 4 Major Application Types: Semantic Search, RAG, AI Agents, Text-to-SQL
4. The 3 Postgres AI Extensions: pgvector, pgvectorscale, pgai
5. Vector Search Indexes: IVFFlat, HNSW, StreamingDiskANN

ADVANCED TOPICS COVERED (FROM ADVANCED AI WITH POSTGRES):
1. Evaluation-driven development (Hit Rate @ K, MRR, RAG Triad)
2. Filtered search: Combining vector search with filters / WHERE clauses
3. Hybrid search: Combining vector and full-text keyword search (RRF)
4. Multi-tenancy for RAG apps: Row-Level Security (RLS) & Isolation
5. Text to SQL and AI Agents with Tool Calling
==============================================================================
"""

import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Header
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

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 1. Standard Document Model
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    author = Column(String(50), default="System")
    embedding = Column(Vector(3), nullable=False)

# 2. Multi-Tenant Document Model (for RLS & Multi-Tenancy RAG)
class TenantDocument(Base):
    __tablename__ = "tenant_documents"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String(50), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(3), nullable=False)

# Pydantic Request Schemas
class DocumentCreate(BaseModel):
    title: str = Field(..., example="FastAPI & Microservices")
    content: str = Field(..., example="Building asynchronous REST APIs with Python and PostgreSQL")
    category: str = Field(..., example="backend")
    author: Optional[str] = Field("Ayush", example="Ayush")
    embedding: List[float] = Field(..., example=[0.15, 0.92, 0.20])

class FilteredSearchRequest(BaseModel):
    query_vector: List[float] = Field(..., example=[0.15, 0.90, 0.20])
    category: Optional[str] = Field("backend", example="backend")
    author: Optional[str] = Field(None, example="Ayush")
    top_k: int = Field(3, ge=1, le=10)

class HybridSearchRequest(BaseModel):
    query_text: str = Field(..., example="Postgres microservices")
    query_vector: List[float] = Field(..., example=[0.15, 0.92, 0.20])
    top_k: int = Field(3, ge=1, le=10)

class AgentPromptRequest(BaseModel):
    prompt: str = Field(..., example="How many backend articles are currently stored?")

class EvalTestCase(BaseModel):
    query: str
    expected_doc_id: int

app = FastAPI(
    title="17. pgvector & AI Engineering with PostgreSQL",
    description="Comprehensive API covering pgvector fundamentals, HNSW/DiskANN, Hybrid Search, RLS Multi-Tenancy, and Text-to-SQL",
    version="2.0.0"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()
        Base.metadata.create_all(bind=engine)

        db = SessionLocal()
        if db.query(Document).count() == 0:
            sample_docs = [
                Document(title="Frontend with React 19 & Next.js", content="Modern UI engineering with Server Components.", category="frontend", author="Sarah", embedding=[0.92, 0.12, 0.08]),
                Document(title="Backend Architecture with PostgreSQL", content="Distributed microservices, transactions, and event streaming.", category="backend", author="Ayush", embedding=[0.15, 0.94, 0.22]),
                Document(title="DevOps, Prometheus & Grafana", content="Observability, container orchestration with Kubernetes and Docker.", category="devops", author="DevOps Team", embedding=[0.10, 0.70, 0.95]),
                Document(title="Neapolitan Pizza Crafting", content="Authentic Italian sourdough fermentation.", category="lifestyle", author="Chef Luigi", embedding=[0.02, 0.04, 0.01])
            ]
            db.add_all(sample_docs)

            # Sample Multi-Tenant Documents
            tenant_docs = [
                TenantDocument(tenant_id="tenant_apple", title="Apple Internal M5 Design", content="Hardware blueprints and silicon architecture.", embedding=[0.12, 0.90, 0.20]),
                TenantDocument(tenant_id="tenant_google", title="Google Gemini Cluster", content="TPU v5p clusters and AI reasoning.", embedding=[0.14, 0.88, 0.22])
            ]
            db.add_all(tenant_docs)
            db.commit()
            print("✓ Seeded sample vector and multi-tenant documents.")
        db.close()
    except Exception as e:
        print(f"⚠️ Startup note (Postgres connection): {e}")

@app.get("/")
def home():
    return {
        "title": "17. pgvector & Advanced AI Engineering with PostgreSQL",
        "swagger_ui": "/docs",
        "foundational_endpoints": [
            "POST /search/cosine",
            "POST /search/l2",
            "POST /rag/ask",
            "GET /indexes/info"
        ],
        "advanced_endpoints": [
            "POST /advanced/eval/benchmark (Evaluation-Driven Development)",
            "POST /advanced/filtered-search (WHERE + Vector Filtering)",
            "POST /advanced/hybrid-search (Full-Text + Vector Search with RRF)",
            "POST /advanced/multi-tenant/search (Row-Level Security & Isolation)",
            "POST /advanced/agent/dispatch (AI Agent Tool Routing & Text-to-SQL)"
        ]
    }

# ============================================================================
# ADVANCED TOPIC 1: EVALUATION-DRIVEN DEVELOPMENT (EDD)
# ============================================================================
@app.post("/advanced/eval/benchmark")
def evaluation_benchmark(test_cases: List[EvalTestCase], db: Session = Depends(get_db)):
    """
    Evaluation-Driven Development:
    Computes Hit Rate @ 3 and Mean Reciprocal Rank (MRR) to mathematically evaluate RAG quality.
    """
    hits_at_3 = 0
    reciprocal_rank_sum = 0.0
    results_detail = []

    for tc in test_cases:
        # Generate mock vector based on query words
        q = tc.query.lower()
        if "frontend" in q or "react" in q:
            qv = [0.90, 0.10, 0.10]
        elif "backend" in q or "postgres" in q:
            qv = [0.15, 0.92, 0.20]
        else:
            qv = [0.10, 0.70, 0.90]

        stmt = select(Document.id).order_by(Document.embedding.cosine_distance(qv)).limit(3)
        retrieved_ids = [row[0] for row in db.execute(stmt).all()]

        if tc.expected_doc_id in retrieved_ids:
            rank = retrieved_ids.index(tc.expected_doc_id) + 1
            hits_at_3 += 1
            reciprocal_rank_sum += 1.0 / rank
        else:
            rank = None

        results_detail.append({
            "query": tc.query,
            "expected_doc_id": tc.expected_doc_id,
            "retrieved_ids": retrieved_ids,
            "found_rank": rank
        })

    total = len(test_cases) or 1
    return {
        "benchmark_summary": {
            "total_test_cases": total,
            "hit_rate_at_3": f"{round((hits_at_3 / total) * 100, 2)}%",
            "mean_reciprocal_rank_mrr": round(reciprocal_rank_sum / total, 3)
        },
        "details": results_detail
    }

# ============================================================================
# ADVANCED TOPIC 2: FILTERED SEARCH (WHERE + VECTORS)
# ============================================================================
@app.post("/advanced/filtered-search")
def filtered_vector_search(req: FilteredSearchRequest, db: Session = Depends(get_db)):
    """
    Filtered Search combines relational metadata filters with vector similarity.
    PostgreSQL optimizes this using Partial HNSW indexes or Iterative Index Scans.
    """
    stmt = select(
        Document,
        Document.embedding.cosine_distance(req.query_vector).label("distance")
    )
    if req.category:
        stmt = stmt.where(Document.category == req.category)
    if req.author:
        stmt = stmt.where(Document.author == req.author)

    stmt = stmt.order_by("distance").limit(req.top_k)
    results = db.execute(stmt).all()

    return {
        "applied_filters": {"category": req.category, "author": req.author},
        "results_count": len(results),
        "results": [
            {
                "id": doc.id,
                "title": doc.title,
                "category": doc.category,
                "author": doc.author,
                "similarity": f"{round((1 - float(dist)) * 100, 2)}%"
            }
            for doc, dist in results
        ]
    }

# ============================================================================
# ADVANCED TOPIC 3: HYBRID SEARCH WITH RECIPROCAL RANK FUSION (RRF)
# ============================================================================
@app.post("/advanced/hybrid-search")
def hybrid_search(req: HybridSearchRequest, db: Session = Depends(get_db)):
    """
    Combines Full-Text Search (keyword exact match) and Semantic Search (pgvector)
    using Reciprocal Rank Fusion (RRF):
    RRF Score = (1 / (60 + semantic_rank)) + (1 / (60 + keyword_rank))
    """
    # 1. Semantic search ranking
    sem_stmt = select(Document.id, Document.title, Document.content).order_by(
        Document.embedding.cosine_distance(req.query_vector)
    ).limit(10)
    sem_docs = db.execute(sem_stmt).all()

    # 2. Simple keyword matching simulation for SQLite/Postgres compatibility
    kw_stmt = select(Document.id, Document.title, Document.content).where(
        Document.content.ilike(f"%{req.query_text.split()[0]}%")
    ).limit(10)
    kw_docs = db.execute(kw_stmt).all()

    # RRF Score aggregation
    scores: Dict[int, Dict[str, Any]] = {}
    for rank, (doc_id, title, content) in enumerate(sem_docs, start=1):
        scores[doc_id] = {
            "id": doc_id,
            "title": title,
            "semantic_rank": rank,
            "keyword_rank": None,
            "rrf_score": 1.0 / (60 + rank)
        }

    for rank, (doc_id, title, content) in enumerate(kw_docs, start=1):
        if doc_id in scores:
            scores[doc_id]["keyword_rank"] = rank
            scores[doc_id]["rrf_score"] += 1.0 / (60 + rank)
        else:
            scores[doc_id] = {
                "id": doc_id,
                "title": title,
                "semantic_rank": None,
                "keyword_rank": rank,
                "rrf_score": 1.0 / (60 + rank)
            }

    ranked = sorted(scores.values(), key=lambda x: x["rrf_score"], reverse=True)[:req.top_k]
    return {
        "search_query": req.query_text,
        "hybrid_results": ranked
    }

# ============================================================================
# ADVANCED TOPIC 4: MULTI-TENANCY FOR RAG (ROW-LEVEL SECURITY ISOLATION)
# ============================================================================
@app.post("/advanced/multi-tenant/search")
def multi_tenant_search(
    query_vector: List[float] = [0.12, 0.90, 0.20],
    x_tenant_id: str = Header(..., example="tenant_apple"),
    db: Session = Depends(get_db)
):
    """
    Multi-Tenancy for Enterprise SaaS RAG:
    Ensures that Tenant A can NEVER search or view Tenant B's embeddings.
    Enforced via tenant header or Postgres Row-Level Security (RLS).
    """
    stmt = select(
        TenantDocument,
        TenantDocument.embedding.cosine_distance(query_vector).label("distance")
    ).where(
        TenantDocument.tenant_id == x_tenant_id
    ).order_by("distance").limit(3)

    results = db.execute(stmt).all()
    return {
        "authenticated_tenant": x_tenant_id,
        "isolated_documents_count": len(results),
        "results": [
            {"id": doc.id, "title": doc.title, "content": doc.content, "tenant_id": doc.tenant_id}
            for doc, _ in results
        ]
    }

# ============================================================================
# ADVANCED TOPIC 5: AI AGENT TOOL CALLING & TEXT-TO-SQL
# ============================================================================
@app.post("/advanced/agent/dispatch")
def agent_dispatch(req: AgentPromptRequest):
    """
    AI Agent Tool Router:
    Inspects user prompt to decide between Vector RAG, Text-to-SQL, or Math tools.
    """
    prompt_lower = req.prompt.lower()

    if any(k in prompt_lower for k in ["how many", "count", "average", "sum", "show all"]):
        tool = "text_to_sql_engine"
        action = {
            "tool": tool,
            "generated_sql": "SELECT category, COUNT(*) as doc_count FROM documents GROUP BY category;",
            "explanation": "Routed to Text-to-SQL because query asks for an analytical aggregate count."
        }
    elif any(k in prompt_lower for k in ["salary", "ctc", "tax", "cost"]):
        tool = "financial_calculator"
        action = {
            "tool": tool,
            "parameters": {"amount": 1200000, "formula": "tax_slab_2026"},
            "explanation": "Routed to Financial Calculator tool."
        }
    else:
        tool = "pgvector_semantic_search"
        action = {
            "tool": tool,
            "vector_query": req.prompt,
            "distance_metric": "cosine (<=>)",
            "explanation": "Routed to Vector Search for unstructured conceptual retrieval."
        }

    return {
        "user_prompt": req.prompt,
        "agent_decision": action
    }
