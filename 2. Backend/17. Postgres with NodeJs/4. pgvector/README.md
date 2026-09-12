# 4. PostgreSQL with pgvector (Complete Guide & Hands-on Tutorial)

A comprehensive guide and runnable Node.js project covering **pgvector** — the industry-standard PostgreSQL extension for vector embeddings, similarity search, indexing (HNSW & IVFFlat), Semantic Search, RAG (Retrieval-Augmented Generation), and Hybrid Search.

---

## 📚 What is covered in this module?

1. **pgvector Fundamentals & Architecture**
   - What are vector embeddings? (Mathematical representation of semantic meaning)
   - Storing `vector(n)` dimensions in PostgreSQL
   - Why PostgreSQL + pgvector is chosen over standalone vector DBs (Pinecone, Chroma, Qdrant)
2. **Vector Distance Metrics & Operators**
   - `<=>` **Cosine Distance** (Angle between vectors, standard for NLP/RAG)
   - `<->` **L2 / Euclidean Distance** (Straight-line spatial distance)
   - `<#>` **Negative Inner Product** (Dot product, fast for normalized vectors)
   - `<+>` **L1 / Taxicab Distance** (Manhattan distance)
3. **High-Performance Vector Indexing (ANN)**
   - **HNSW (Hierarchical Navigable Small World)**: Multi-layer graph index, top-tier speed & recall
   - **IVFFlat (Inverted File Flat)**: Inverted list / K-means clustering index
   - Parameter tuning: `m`, `ef_construction`, `hnsw.ef_search`, `lists`, `ivfflat.probes`
4. **Semantic Search & RAG Architecture**
   - Generating embeddings, inserting, and querying top-K context chunks
   - Unified relational + vector filtering (`WHERE category = '...' AND price < 100`)
   - Prompt injection for grounded AI answers without hallucinations
5. **Hybrid Search with Reciprocal Rank Fusion (RRF)**
   - Combining PostgreSQL Full-Text Search (`tsvector`, `GIN` index) with semantic vector search in a single SQL query.

---

## 🚀 Quick Start & Running the Project

### 1. Start a PostgreSQL database with pgvector enabled

Using Docker:
```bash
docker run --name pgvector-demo -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pgvector_learning_db -p 5432:5432 -d pgvector/pgvector:pg16
```
*(Or use any cloud provider with pgvector pre-installed, e.g. Neon, Supabase, AWS RDS).*

### 2. Install dependencies & run

```bash
cd "2. Backend/17. Postgres with NodeJs/4. pgvector"
npm install
npm start
```

---

## 🧠 Core Theory & Interview Cheat Sheet

### 1. Distance Metric Selection Guide
| Distance Metric | Operator | Formula | Best Used For |
|---|---|---|---|
| **Cosine Distance** | `<=>` | $1 - \frac{A \cdot B}{\|A\| \|B\|}$ | Text embeddings (OpenAI, Gemini), document search, RAG |
| **Euclidean (L2)** | `<->` | $\sqrt{\sum (A_i - B_i)^2}$ | Computer vision, spatial features, normalized coordinate data |
| **Inner Product** | `<#>` | $-(A \cdot B)$ | Normalized vectors (where $\|A\|=1$), recommendation systems |

### 2. HNSW vs IVFFlat Indexing
| Feature | HNSW | IVFFlat |
|---|---|---|
| **Underlying Structure** | Multi-layer proximity graph | Voronoi K-means cluster lists |
| **Query Latency** | Ultra-low (sub-millisecond) | Low to moderate (depends on `probes`) |
| **Recall Rate** | $>98\%$ | $85-95\%$ |
| **Can build on empty table?** | **Yes** (updates incrementally) | **No** (needs representative training data) |
| **Memory Consumption** | Higher | Lower |
| **Verdict** | **Default choice for 95% of AI workloads** | Use when server RAM is strictly limited |
