# 17. PostgreSQL with pgvector (Foundations & Advanced AI Engineering)

A complete, production-grade guide and runnable application (supporting both **FastAPI Python** and **Node.js**) covering **pgvector**, **pgvectorscale**, **pgai**, and **Advanced Topics for building AI apps with PostgreSQL**.

---

## 📑 Table of Contents

### Part 1: Core Foundations
1. [Foundations of AI with PostgreSQL & The Rise of the AI Engineer](#1-foundations-of-ai-with-postgresql)
2. [Vector Database Concepts (Embeddings, ANN)](#2-vector-database-concepts)
3. [The 4 Major AI Application Types](#3-the-4-major-ai-application-types)
4. [The PostgreSQL AI Extension Trifecta (pgvector, pgvectorscale, pgai)](#4-the-postgresql-ai-extension-trifecta)
5. [Vector Search Indexes: IVFFlat vs HNSW vs StreamingDiskANN](#5-vector-search-indexes-comparison)

### Part 2: Advanced Topics (From Slide)
6. [Advanced 1: Evaluation-Driven Development (EDD for AI & RAG)](#6-advanced-1-evaluation-driven-development)
7. [Advanced 2: Filtered Search (Combining Vector Search with WHERE Clauses)](#7-advanced-2-filtered-search)
8. [Advanced 3: Hybrid Search (Full-Text Search + pgvector with RRF)](#8-advanced-3-hybrid-search)
9. [Advanced 4: Multi-Tenancy for Enterprise RAG (Row-Level Security)](#9-advanced-4-multi-tenancy-for-rag-apps)
10. [Advanced 5: Text-to-SQL & AI Agents with Tool Calling](#10-advanced-5-text-to-sql--ai-agents)
11. [Running the Application (FastAPI & Node.js)](#11-running-the-application)

---

## 1. Foundations of AI with PostgreSQL

### The Paradigm Shift
* **Old World**: Required dedicated data engineering teams, custom machine learning model training, and specialized standalone vector databases (Pinecone, Chroma, Qdrant).
* **Modern World**: Developers can build AI applications using standard PostgreSQL combined with off-the-shelf Foundation Models (OpenAI, Gemini, Claude, Ollama).

### The Rise of the "AI Engineer"
An **AI Engineer** is an application developer who builds AI products by orchestrating:
1. **Foundation Model APIs** (for semantic embeddings and reasoning).
2. **PostgreSQL with pgvector** (as the single source of truth for auth, users, business data, and vector embeddings).
3. **RAG & Agent Workflows** (grounding LLMs with private data).

---

## 2. Vector Database Concepts

* **Vector Data**: Unstructured data (text, PDFs, images) compressed into a multi-dimensional array of floats (e.g. `[0.0124, -0.9120, 0.4431, ... 1536 floats]`).
* **Semantic Proximity**: Items with similar meanings are positioned close together in vector space.
* **Approximate Nearest Neighbor (ANN)**: Searching high-dimensional space in sub-5ms across millions of rows.

---

## 3. The 4 Major AI Application Types

1. **Semantic Search**: Search by concept and intent rather than exact keyword matches.
2. **Retrieval-Augmented Generation (RAG)**: Connects LLMs to private database facts to eliminate hallucinations.
3. **AI Agents**: Stores long-term conversation memory, user profiles, and tool definitions.
4. **Text-to-SQL**: Indexes database table schemas and column comments into vectors so LLMs generate valid SQL.

---

## 4. The PostgreSQL AI Extension Trifecta

| Extension | Core Role | Key Capabilities |
| :--- | :--- | :--- |
| **`pgvector`** | **Core Vector DB** | `vector(n)` type, `<=>` (Cosine), `<->` (L2), `<#>` (Inner Product), HNSW and IVFFlat indexes. |
| **`pgvectorscale`** | **Performance & Scale** | Written in Rust (by Timescale). Adds **StreamingDiskANN** (NVMe SSD storage for 1B+ vectors) and **Statistical Binary Quantization (SBQ)** for 32x memory compression. Solves HNSW filtered search issues. |
| **`pgai`** | **AI Workflow in SQL** | Call OpenAI, Anthropic, Gemini, Cohere, and Ollama directly inside SQL queries and triggers. |

---

## 5. Vector Search Indexes Comparison

*(Based on the slide provided)*

| Vector Index | Best For | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **IVFFLAT** | Medium workloads (100k - 1M vectors) | • Low memory usage<br>• Faster than linear scan | • Updates require rebuilding index every time<br>• Lower accuracy vs HNSW / DiskANN |
| **HNSW** *(Default)* | Real-time search on medium workloads (100k - 1M vectors) | • Good balance between speed and accuracy (>98% recall)<br>• Handles updates without rebuild<br>• Supports Quantization (`halfvec`, PQ, BQ)<br>• Fast (parallel) index build | • Problems with filtered search accuracy<br>• High memory usage (must fit in RAM)<br>• Cost scales with RAM<br>• Scale limitations |
| **StreamingDiskANN** *(pgvectorscale)* | • Real-time search<br>• Filtered search use cases<br>• Large scale workloads (10M+ to 1B+ vectors) | • High accuracy filtered search<br>• Scales to 1B+ vectors on NVMe SSD<br>• Statistical Binary Quantization on by default<br>• Cost scales with disk and RAM (much cheaper)<br>• Handles updates without rebuild | • Longer build times than HNSW |

---

## 6. Advanced 1: Evaluation-Driven Development (EDD)

Moving from "vibe checks" to automated, mathematical testing of RAG pipelines:
- **Hit Rate @ K**: Percentage of test queries where the ground-truth document was inside the top-$K$ retrieved chunks.
- **Mean Reciprocal Rank (MRR)**: $\frac{1}{\text{Rank of First Relevant Result}}$ (Measures if the best answer is at rank 1, 2, or 3).
- **RAG Triad**: Context Relevance, Groundedness (Faithfulness), and Answer Relevance.

---

## 7. Advanced 2: Filtered Search Strategies

Combining vector search with relational `WHERE` clauses:

```sql
-- Partial HNSW Index on active products only:
CREATE INDEX active_products_hnsw_idx 
ON products 
USING hnsw (embedding vector_cosine_ops)
WHERE is_active = true;

-- Query combining relational filters and vector distance:
SELECT id, title, price, (1 - (embedding <=> $1)) as similarity
FROM products
WHERE is_active = true AND price < 100
ORDER BY embedding <=> $1 ASC
LIMIT 5;
```

---

## 8. Advanced 3: Hybrid Search with Reciprocal Rank Fusion (RRF)

Combines Full-Text Keyword Search (`tsvector`) and Semantic Vector Search (`pgvector`) in a single query:

```sql
WITH semantic_search AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1) as rank
  FROM documents ORDER BY embedding <=> $1 LIMIT 20
),
keyword_search AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(fts_tokens, plainto_tsquery('english', $2)) DESC) as rank
  FROM documents WHERE fts_tokens @@ plainto_tsquery('english', $2) LIMIT 20
)
SELECT 
  d.id, d.title, d.content,
  COALESCE(1.0 / (60 + s.rank), 0.0) + COALESCE(1.0 / (60 + k.rank), 0.0) AS rrf_score
FROM documents d
LEFT JOIN semantic_search s ON d.id = s.id
LEFT JOIN keyword_search k ON d.id = k.id
WHERE s.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY rrf_score DESC LIMIT 5;
```

---

## 9. Advanced 4: Multi-Tenancy for RAG Apps (Row-Level Security)

Ensures that Tenant A can NEVER see Tenant B's embeddings in SaaS environments:

```sql
-- Enable Row-Level Security:
ALTER TABLE tenant_documents ENABLE ROW LEVEL SECURITY;

-- Enforce tenant isolation policy:
CREATE POLICY tenant_isolation_policy ON tenant_documents
USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), ''));
```

---

## 10. Advanced 5: Text-to-SQL & AI Agents

1. **AI Agents**: Dynamically inspect user prompt and route to:
   - `pgvector_semantic_search` (unstructured documents).
   - `text_to_sql_engine` (relational aggregate counts and analytics).
   - `math_tool` (calculations).
2. **Text-to-SQL**: Matches natural language prompts to database DDL vectors, feeds schemas to the LLM, and executes verified SQL.

---

## 11. Running the Application

### Option 1: FastAPI (Python)
```bash
cd "2. Backend/24. FAST API/17. pgvector"
pip install -r requirements.txt
uvicorn main:app --reload
```
Open **[http://localhost:8000/docs](http://localhost:8000/docs)** to test all foundational and advanced endpoints.

### Option 2: Node.js (JavaScript)
```bash
npm install
npm start
```
