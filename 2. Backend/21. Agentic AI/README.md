# 21. Agentic AI

Sourced from the `level4` module of [Virtualcode-yt/Advanced-Backend--Course](https://github.com/Virtualcode-yt/Advanced-Backend--Course),
extended with a third phase and fixes so every phase actually runs end to
end. Each phase is a standalone Express server on **port 5000** with one
route (`POST /ai`) - run one phase at a time.

## Setup (per phase)

```bash
cd phase1   # or phase2 / phase3
npm install
npm run dev   # nodemon index.js, restarts on save
```

Each phase's `.env` is already filled in with real API keys reused from
this repo's CORTEX AI project (Groq, Google/Gemini, Tavily, Qdrant) - safe
for personal learning; swap in your own keys per phase if you'd rather keep
usage/quota separate.

## Phase 1 - LangChain + LangGraph agent

A tool-calling agent: the LLM (Groq, `openai/gpt-oss-120b`) decides for
itself whether to answer directly or call a live web-search tool
(Tavily), in a loop (`agent -> tools -> agent -> ...`) built with
LangGraph's `StateGraph`. Conversation memory persists per `threadId`
via a `MemorySaver` checkpointer.

**Fixed from the original exercise:**
- `llama-3.3-70b-versatile` was retired from Groq's hosted model list
  (404 `model_not_found`) -> replaced with `openai/gpt-oss-120b`.
- `maxTokens: 100` was too small to hold a tool call's JSON payload,
  causing `Failed to parse tool call arguments as JSON` -> raised to 512.
- `thread_id` was hardcoded to `"user123"` (every caller shared one
  memory) -> now read from the request body, defaulting to
  `"default-thread"` for quick testing.

**Added:** LangSmith tracing support (env vars only, see the Q&A block at
the top of `phase1/index.js` for what it does and why it's worth turning
on for an agent specifically).

```bash
curl -X POST http://localhost:5000/ai -H "Content-Type: application/json" \
  -d '{"input":"What is the weather in Delhi right now?","threadId":"t1"}'
```

## Phase 2 - RAG (Retrieval-Augmented Generation) + Qdrant

Answers questions about `phase2/knowledge.pdf` (a grocery store product
catalog) by embedding the question, retrieving the 5 most relevant chunks
from a Qdrant vector store, and instructing the LLM to answer ONLY from
that retrieved context - refusing ("I don't know from uploaded PDF.")
when the context doesn't cover the question.

**Fixed from the original exercise:**
- `QdrantVectorStore.fromExistingCollection` assumed the `grocery-store`
  collection already existed - on a fresh Qdrant project it doesn't, so
  the server crashed on startup. `setupVectorStore()` now checks for the
  collection and creates it first if missing.
- The `upload()` function (parses the PDF, chunks it, embeds it) was
  defined but never actually called anywhere - the vector store would
  have stayed empty forever. It's now called automatically the first time
  the collection is empty, and skipped on later restarts so the PDF isn't
  re-embedded (and re-billed) every time.
- The embedding model's dimension was documented as 768 in a comment -
  verified live against the real API, `gemini-embedding-001` actually
  returns **3072**-dimensional vectors. The Qdrant collection is created
  with the correct size; using 768 would have made every insert fail.

```bash
curl -X POST http://localhost:5000/ai -H "Content-Type: application/json" \
  -d '{"input":"What fruits does the store sell?"}'
```

## Phase 3 - Model Context Protocol (MCP) *(new)*

Not in the original course - added because MCP is one of the most
important "must-know" agentic-AI concepts right now, and it's genuinely
distinct from LangChain/LangGraph or RAG rather than more of either.

`mcp-server.js` is a standalone MCP server (built with the official
`@modelcontextprotocol/sdk`, no LangChain involved at all) exposing two
tools - `calculator` and `get_current_time` - over the standard MCP
protocol. `index.js` is the SAME agent shape as phase 1, except its tools
are discovered at runtime from that server (spawned as a child process
over stdio) via `@langchain/mcp-adapters`, instead of being imported from
a framework-specific package like `TavilySearch`. See the Q&A comments at
the top of both files for why that separation is the actual point of MCP,
not just a different way to organize the same code.

```bash
curl -X POST http://localhost:5000/ai -H "Content-Type: application/json" \
  -d '{"input":"What is 4237 * 891 - 15?","threadId":"t1"}'
```

## Q&A: agentic AI concepts across all three phases

**Q. What makes something an "agent" rather than just an LLM call?**
A loop where the model's own output can change what happens next -
specifically, deciding to call a tool, seeing the result, and deciding
again - rather than always producing exactly one response per request.
Phase 1 and phase 3's `shouldContinue` conditional edge is that decision
point made explicit as code.

**Q. LangChain vs LangGraph vs MCP - how do these three relate?**
LangChain provides the building blocks (chat model wrappers, tool
wrappers, message types). LangGraph provides the control flow/orchestration
that turns those blocks into a loop (a graph of nodes and edges). MCP is
unrelated to either as a *library* - it's a protocol/standard for exposing
tools from a separate server so ANY client (LangChain-based or not) can
discover and call them. Phase 3 shows LangGraph's orchestration and an
MCP-sourced toolset working together, but they're independent concepts you
could use separately.

**Q. RAG vs an agent with a search tool - when would you use which?**
RAG (phase 2) is for grounding answers in YOUR OWN documents that the
model was never trained on and that don't change from one request to the
next - you control what's indexed. A search tool (phase 1) is for
information that's public and changes over time (news, weather, prices) -
you're querying the live web instead of a fixed, pre-indexed corpus. A
production system often uses both: RAG over internal docs, plus a search
tool for anything current the docs don't cover.

**Q. What is a vector database actually for, beyond "storing embeddings"?**
Fast **similarity search** at scale. Given a query vector, a vector DB
(Qdrant here) finds the nearest vectors among potentially millions using
approximate nearest-neighbor indexing - checking every vector one by one
(brute force) doesn't scale. That's the specific problem Qdrant solves
that a regular database index (built for exact matches/ranges) doesn't.

**Q. What's the actual risk LangSmith (phase 1) and MCP (phase 3) each
address, that the other doesn't?**
LangSmith is about **observability** - seeing what an already-built agent
actually did on a given run (which tool, what arguments, what the model
saw). MCP is about **portability** - how tools are exposed so more than
one agent/client/framework can use them without re-integration. An agent
can have one without the other; production agents typically want both.

**Q. Why do all three phases share the same LLM/tool-calling model
(`openai/gpt-oss-120b` on Groq) instead of using different providers?**
Consistency for comparison while learning - phase 1 and phase 3 use the
literal same graph shape specifically so the only thing that changes
between them is where the tools come from (hardcoded package vs. MCP
server), making that difference the one variable worth focusing on. Any
LangChain-supported chat model (Gemini via `ChatGoogleGenerativeAI`, which
is imported in phase 1 for exactly this reason, OpenAI, Anthropic, etc.)
would drop in with no other code changes - that provider-swapping ease is
one of LangChain's main selling points.
