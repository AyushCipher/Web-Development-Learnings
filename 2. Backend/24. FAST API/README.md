# 24. FastAPI Masterclass & Practical Progression

A structured, hands-on progression through modern Python backend development with **FastAPI** — covering everything from fundamental routing and Pydantic validation to production JWT authentication, SQLAlchemy ORM, file uploads, automated testing with Pytest, web scraping, caching, and rate limiting.

Each numbered subfolder is a self-contained topic with clean implementations and deep explanatory comments throughout.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Python 3.10+ installed.

### 2. Set Up Virtual Environment

```bash
# Navigate to the FastAPI directory
cd "2. Backend/24. FAST API"

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

### 3. Run Any Lesson / Module

```bash
# Example: Running the basics module
uvicorn "1. Basics.main:app" --reload

# Or navigate into the folder and run:
cd "1. Basics"
uvicorn main:app --reload
```

Interactive API documentation will be available live at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 📚 Topics Covered in Progression Order

| # | Folder | Key Concepts & Topics Covered |
|---|---|---|
| **01** | `1. Basics` | FastAPI initialization, basic route decorators (`@app.get`), path parameters, query parameters, first Pydantic model. |
| **02** | `2. HTTP METHODS` | Full REST semantics: `GET`, `POST`, `PUT`, `DELETE`, `PATCH` with status codes and request bodies. |
| **03** | `3. PARAMS` | Advanced parameter validation (`Query`, `Path`), regex pattern matching, default values, optional params, and metadata. |
| **04** | `4. PYDANTIC MODELS` | Request/response data validation, nested models, field constraints (`Field`), data serialization, and response schemas (`response_model`). |
| **05** | `5. EXCEPTIONS` | Centralized error handling, `HTTPException`, custom exception handlers, and custom error response payloads. |
| **06** | `6. DEPENDS & DEPENDENCY INJECTION` | FastAPI's dependency injection system (`Depends`), hierarchical/nested dependencies, shared db/auth logic, and code reusability. |
| **07** | `7. MIDDLEWARES` | Custom request/response middleware, process timing headers, CORS configuration, request logging, and lifecycle hooks. |
| **08** | `8. SQLITE3 LOCALDB` | Raw SQL database interactions with Python's built-in `sqlite3`, cursor management, parameterized queries, and CRUD workflows. |
| **09** | `9. ORM (SqlAlchemy)` | Production database layer using SQLAlchemy 2.0 ORM, Declarative Base, database sessions, relational models, and Pydantic schema mapping. |
| **10** | `10. BASIC AUTH` | HTTP Basic Auth protocol implementation, credential parsing, and security dependencies. |
| **11** | `11. PROD AUTH` | Production-ready authentication: password hashing with `bcrypt`/`passlib`, JWT token generation & verification (`python-jose`), OAuth2 with Password Bearer flow, and route protection. |
| **12** | `12. FILE UPLOAD` | Handling `UploadFile` and `File`, MIME type validation, streaming large uploads, and static file serving. |
| **13** | `13. DOTENV` | Environment variable management using `python-dotenv`, secret separation, and structured configuration. |
| **14** | `14. TESTING` | Automated unit & integration testing using `pytest` and `httpx.AsyncClient` / `TestClient`, mocking responses, and asserting API contracts. |
| **15** | `15. REQUESTS` | Making outbound HTTP calls from FastAPI endpoints to external microservices/APIs using `requests` and `httpx`. |
| **16** | `16. SCRAPING, CACHING & RATE LIMITING` | Data extraction with BeautifulSoup4 (`bs4`), IP/endpoint rate limiting using `slowapi`, and in-memory caching strategies. |
| **17** | `17. pgvector` | Vector Database with pgvector & PostgreSQL: Foundations of AI, vector embeddings, Cosine/L2/Inner Product search, HNSW vs IVFFlat vs StreamingDiskANN, RAG, and Text-to-SQL. |

---

## 🧪 Running Tests

To run the automated test suite in `14. TESTING`:

```bash
pytest "14. TESTING" -v
```

---

## 🛠️ Key Libraries & Tools Used

- **Framework**: `FastAPI` (High performance, async-ready, auto OpenAPI docs)
- **Server**: `Uvicorn` (ASGI web server)
- **Validation**: `Pydantic v2` (Type annotations & runtime data validation)
- **Database & ORM**: `SQLAlchemy`, `SQLite3`, `PostgreSQL`, `pgvector`
- **Security & Auth**: `python-jose` (JWT), `passlib[bcrypt]` (Hashing)
- **Testing**: `pytest`, `httpx`
- **Rate Limiting, AI & Utilities**: `pgvector`, `slowapi`, `beautifulsoup4`, `python-multipart`, `python-dotenv`
