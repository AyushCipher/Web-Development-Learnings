// PHASE 2 - RAG (Retrieval-Augmented Generation) + a vector database.
//
// Q. WHAT PROBLEM DOES RAG SOLVE THAT PHASE 1's AGENT DOESN'T?
// ANS: Phase 1's agent can reach for a live web search tool, but it has no
// way to answer questions about YOUR OWN private/local documents (a PDF on
// disk, internal docs, etc.) - the model was never trained on them and
// there's no tool that reads them. RAG closes that gap: instead of asking
// the LLM to answer from memory, you first RETRIEVE the most relevant
// chunks of your own document(s), stuff them into the prompt as context,
// and then ask the LLM to answer using ONLY that context. The LLM never
// needs to have "seen" the document during training - it just needs the
// relevant piece of it handed to it at question time.
//
// Q. WHY CAN'T YOU JUST PASTE THE WHOLE PDF INTO THE PROMPT AND SKIP ALL
//    THIS CHUNKING/EMBEDDING/VECTOR-SEARCH MACHINERY?
// ANS: Two reasons. First, context windows are finite and expensive - a
// large PDF (or a whole knowledge base) may not fit, and even when it does,
// stuffing in irrelevant pages wastes tokens and can distract the model
// from the part that actually answers the question. Second, cost/latency -
// sending the entire document on every single question is wasteful when
// most of it is irrelevant to any given question. RAG's job is to find just
// the few paragraphs that are actually relevant and send only those.
import express from "express"
import dotenv from "dotenv"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"
import fs from "fs"
import { PDFParse } from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant"
import { QdrantClient } from "@qdrant/js-client-rest"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
dotenv.config()
const app = express()
const port = 5000
app.use(express.json())


const llm = new ChatGroq({
    model: "openai/gpt-oss-120b", // see phase1/index.js for why this replaced llama-3.3-70b-versatile
    temperature: 0.7,
    maxTokens: 512, // was 100 in the original exercise - too small even for a normal answer once real PDF context is included; see phase1 for the same fix and why it matters
    maxRetries: 2
})


// Q. WHAT IS AN "EMBEDDING", AND WHY gemini-embedding-001 SPECIFICALLY?
// ANS: An embedding model turns a piece of text into a fixed-length vector
// of numbers (an array of floats) that captures its MEANING - texts with
// similar meaning end up as vectors that are close together in that
// vector space, even if they don't share any exact words. That's what
// makes "search by meaning" (semantic search) possible instead of just
// keyword matching. gemini-embedding-001 is Google's embedding model;
// TaskType.RETRIEVAL_DOCUMENT tells it "this text is a document being
// stored for later retrieval" (as opposed to RETRIEVAL_QUERY, for the
// question being asked) - some embedding models produce subtly better
// vectors when told which side of the search they're embedding for.
//
// Q. THE COMMENT ON THIS MODEL SAYS "768 dimensions" - IS THAT RIGHT?
// ANS: No - verified live against the real API, gemini-embedding-001
// actually returns 3072-dimensional vectors by default. This matters a lot
// here specifically: Qdrant collections are created with a FIXED vector
// size, and every vector you add to that collection must match it exactly
// or the insert is rejected. The collection below is created with size:
// 3072 for exactly this reason - using the commented "768" would have
// made every single addDocuments() call fail.
const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001", // 3072 dimensions (verified) - see collection setup below
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
});

const COLLECTION_NAME = "grocery-store"
const EMBEDDING_DIMENSIONS = 3072

// Q. THE ORIGINAL EXERCISE CALLED `QdrantVectorStore.fromExistingCollection`
//    DIRECTLY - WHAT WAS WRONG WITH THAT?
// ANS: fromExistingCollection does exactly what its name says - it connects
// to a collection that's assumed to ALREADY exist in Qdrant. On a fresh
// Qdrant project (or the first time anyone runs this exercise), the
// "grocery-store" collection has never been created, so that call throws
// immediately and the server never starts. The exercise also defined an
// `upload()` function to parse the PDF and add it to the store, but never
// actually CALLED it anywhere - so even with an existing empty collection,
// similaritySearch would always return nothing to answer from. The
// setupVectorStore() function below fixes both: it checks whether the
// collection exists (creating it with the right vector size if not), and
// seeds it from knowledge.pdf the first time the collection is empty.
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
})

async function setupVectorStore() {
    const { collections } = await qdrantClient.getCollections()
    const exists = collections.some((c) => c.name === COLLECTION_NAME)

    if (!exists) {
        console.log(`Collection "${COLLECTION_NAME}" not found - creating it...`)
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: { size: EMBEDDING_DIMENSIONS, distance: "Cosine" },
            // Q. WHY "Cosine" DISTANCE?
            // ANS: Cosine similarity measures the ANGLE between two vectors,
            // ignoring their magnitude - which is the standard choice for
            // text embeddings, where what matters is direction (meaning),
            // not vector length. It's also literally what most embedding
            // models (including Gemini's) are trained/normalized to work
            // well with.
        })
    }

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        client: qdrantClient,
        collectionName: COLLECTION_NAME,
    })

    // Only seed the PDF if the collection is genuinely empty - otherwise a
    // server restart would re-embed and re-insert the same document every
    // time, duplicating every chunk (and burning embedding-API quota) on
    // every restart for no benefit.
    const info = await qdrantClient.getCollection(COLLECTION_NAME)
    if (info.points_count === 0) {
        console.log("Collection is empty - seeding it from knowledge.pdf...")
        await upload(vectorStore)
    } else {
        console.log(`Collection already has ${info.points_count} chunks - skipping seed.`)
    }

    return vectorStore
}


// Q. WHY SPLIT THE PDF INTO CHUNKS INSTEAD OF EMBEDDING THE WHOLE DOCUMENT
//    AS ONE VECTOR?
// ANS: One embedding for an entire document would blur together everything
// it discusses into a single average meaning - a search for one specific
// fact inside a 50-page PDF wouldn't stand out. Splitting into chunks (here
// ~1000 characters each) means each chunk gets its OWN embedding, so a
// query can match the one paragraph that's actually relevant instead of
// "the document as a whole". chunkOverlap: 200 means consecutive chunks
// share their last/first 200 characters - without it, a sentence that
// happens to fall exactly on a chunk boundary could get split in half,
// with neither half containing the complete thought.
const upload = async (vectorStore) => {
    const pdfPath = "./knowledge.pdf"
    const buffer = fs.readFileSync(pdfPath)
    const pdfResult = new PDFParse({ data: buffer })
    const result = await pdfResult.getText()
    const text = result.text
    const spilitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
    })
    const docs = await spilitter.createDocuments([text])
    await vectorStore.addDocuments(docs)
    console.log(`Seeded ${docs.length} chunks into "${COLLECTION_NAME}".`)
}


const vectorStore = await setupVectorStore()


app.post("/ai", async (req, res) => {
    const { input } = req.body

    // Q. WHAT DOES similaritySearch ACTUALLY DO HERE?
    // ANS: It embeds `input` (the user's question) into the same 3072-
    // dimensional vector space as the document chunks, then asks Qdrant for
    // the 5 chunks whose vectors are closest (by cosine distance) to the
    // question's vector - i.e. the 5 passages of the PDF that are most
    // semantically related to what was asked, regardless of exact wording.
    const docs = await vectorStore.similaritySearch(input, 5)
    const context = docs.map((d) => d.pageContent).join("/n")

    // Q. WHY THE "STRICT RULES" IN THE SYSTEM PROMPT (ANSWER ONLY FROM
    //    CONTEXT, SAY "I DON'T KNOW" OTHERWISE)?
    // ANS: This is what actually makes it "RAG" rather than just "an LLM
    // call with some extra text pasted in". Without this instruction,
    // nothing stops the model from falling back on its own general
    // training knowledge when the retrieved context doesn't contain the
    // answer - which defeats the purpose of grounding answers in YOUR
    // document and risks a confident-sounding but wrong (hallucinated)
    // answer. Explicitly telling it to refuse when the context doesn't
    // cover the question is a basic but important RAG guardrail.
    const response = await llm.invoke([
        new SystemMessage(`You are a RAG AI assistant.

STRICT RULES:
- Answer ONLY from context
- Do not use outside knowledge
- If answer not found say:
  "I don't know from uploaded PDF."

Context:
${context}`)
        ,
        new HumanMessage(input)
    ])

    console.log(response)


    return res.status(200).json({ ai: response.content })
})




app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(port, () => {
    console.log("server started")
})
