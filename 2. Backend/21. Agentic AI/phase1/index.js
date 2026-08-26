// PHASE 1 - LangChain + LangGraph: a tool-calling agent with memory.
//
// Q. WHAT PROBLEM DOES THIS FILE SOLVE THAT A PLAIN "CALL THE LLM" ENDPOINT
//    DOESN'T?
// ANS: A raw LLM call (see the commented-out "without langchain" block
// below) only ever does one thing: read the prompt, generate text, done. It
// can't look anything up, it forgets everything between requests, and it
// has no way to decide "I should use a tool here" vs "I can just answer".
// An AGENT built with LangGraph adds a loop around the LLM call: the model
// itself decides whether to call a tool (web search, a database lookup,
// etc.), the tool result gets fed back in, and the model is asked again -
// repeating until it's ready to give a final answer. That decide -> act ->
// observe -> decide-again loop is what "agentic" means here.
//
// Q. LANGCHAIN VS LANGGRAPH - WHAT'S THE DIFFERENCE, AND WHY ARE BOTH USED
//    TOGETHER HERE?
// ANS: LangChain is the toolkit of building blocks - chat model wrappers
// (ChatGroq, ChatGoogleGenerativeAI), tool wrappers (TavilySearch), message
// types, etc. It doesn't by itself define control flow. LangGraph is the
// orchestration layer built on top: it models your agent as a graph of
// nodes ("agent" = ask the LLM, "tools" = run whatever tool the LLM asked
// for) and edges (including CONDITIONAL edges - "if the LLM asked for a
// tool, go run it; otherwise, stop"). LangChain gives you the pieces;
// LangGraph gives you the loop that wires them into an actual agent.
import express from "express"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatGroq } from "@langchain/groq"
import { Annotation, MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";

// Reads GOOGLE_API_KEY / GROQ_API_KEY / TAVILY_API_KEY from .env into
// process.env - every SDK below (ChatGroq, TavilySearch, ...) reads its key
// straight from process.env itself, so nothing further needs to be passed
// explicitly.
//
// Q. WHAT DOES SETTING LANGCHAIN_TRACING_V2/LANGCHAIN_API_KEY/
//    LANGCHAIN_PROJECT IN .env ACTUALLY DO - WHY ISN'T THERE ANY LANGSMITH
//    CODE HERE?
// ANS: There doesn't need to be any. LangSmith is LangChain's own hosted
// observability platform - once these three env vars are present,
// LangChain's internals detect them and automatically report every LLM
// call, tool call, and graph step to your LangSmith project as a trace
// (nested, with inputs/outputs/timing/token counts for each step). This
// matters specifically for agents because a single /ai request here can
// involve several hidden steps (agent -> tool -> agent again) - without
// tracing, if the agent behaves oddly you're stuck adding console.logs
// everywhere; with it, you get a visual timeline of exactly what the LLM
// saw and decided at each node, for free, with zero code changes. Sign up
// at https://smith.langchain.com, create an API key, and set
// LANGCHAIN_TRACING_V2=true in .env to turn it on.
dotenv.config()
const app = express()
const port = 5000
app.use(express.json())

// ---------------------------------------------------------------------
// WITHOUT LangChain - a raw Gemini call, kept here for contrast with the
// agent below. This has no memory (every request starts from a blank
// slate) and no tools (it can only answer from what the model already
// knows) - compare this to the /ai route further down.
// Model name: check https://ai.google.dev/gemini-api/docs/models for the
// current Gemini model list before uncommenting - names get renamed/
// deprecated over time, so treat the one below as illustrative.
// ---------------------------------------------------------------------

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// })

// app.post("/ai", async (req, res) => {
//     const { input } = req.body
//     const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents: [
//             {
//                 role: "system",
//                 parts: [{ text: "you are a assistant and your name is jarvis.if you don't know the answer then don't give incorrect answer" }]
//             },
//             {
//                 role: "user",
//                 parts: [{ text: input }]
//             }
//         ]
//     })

//     return res.status(200).json({ "ai:": response.text })
// })

// ---------------------------------------------------------------------
// WITH LangChain + LangGraph
// ---------------------------------------------------------------------

// A LangChain-wrapped web search tool (Tavily is a search API built
// specifically for LLM agents - results come back pre-cleaned for an LLM to
// read, unlike scraping raw search-engine HTML). maxResults caps how many
// results come back per search so the tool's output doesn't blow the LLM's
// context on its own.
const tool = new TavilySearch({
    maxResults: 5,
    topic: "general",
});

// Q. WHAT IS MemorySaver, AND WHERE DOES THE MEMORY ACTUALLY LIVE?
// ANS: MemorySaver is LangGraph's simplest CHECKPOINTER - after every step
// of the graph, it saves the full running state (the message list so far)
// keyed by a "thread_id" you choose per conversation (see the /ai route
// below). The next request that reuses the same thread_id resumes from
// that saved state instead of starting blank - that's the entire memory
// mechanism. MemorySaver keeps this all in plain in-process memory, so it's
// wiped on every server restart and never shared across multiple server
// instances - fine for this demo/course exercise, but a real deployment
// would swap this for a persistent checkpointer (LangGraph ships Postgres/
// SQLite/Redis-backed checkpointer implementations) so conversations
// survive restarts and scale past one process.
const checkPointer = new MemorySaver()


const tools = [tool]
// ToolNode is a ready-made LangGraph node that takes whatever tool_calls
// the LLM asked for (see callLLM below) and actually executes them against
// the matching tool in this array, turning the result back into a message
// the LLM can read on its next turn.
const toolNode = new ToolNode(tools)

// ChatGoogleGenerativeAI (imported above) is a drop-in alternative to
// ChatGroq - both implement the same LangChain chat-model interface, so you
// could swap `llm` to use Gemini instead of Groq's hosted Llama with no
// other code changes, which is the point of LangChain's model-wrapper
// abstraction.
// Q. WHY openai/gpt-oss-120b INSTEAD OF llama-3.3-70b-versatile (THE MODEL
//    NAME THIS EXERCISE ORIGINALLY SHIPPED WITH)?
// ANS: Groq periodically retires models from its hosted lineup - by the
// time this was verified, llama-3.3-70b-versatile had been removed and
// requests to it failed with a 404 model_not_found error. Groq's hosted
// model list changes over time; run `curl https://api.groq.com/openai/v1/
// models -H "Authorization: Bearer $GROQ_API_KEY"` to see what's currently
// available before assuming any specific model name still works.
// Q. WHY maxTokens: 512 INSTEAD OF THE ORIGINAL 100?
// ANS: 100 tokens is enough for a short plain-text reply, but a TOOL CALL
// response isn't plain text - the model has to emit a structured JSON
// payload (tool name + arguments) before it's said anything toward an
// actual answer. Capping generation at 100 tokens cut that JSON off
// mid-object, which made it unparseable and the whole request fail with a
// "Failed to parse tool call arguments as JSON" error. 512 leaves enough
// room for a tool-call payload AND a normal final answer.
const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.7,
    maxTokens: 512,
    maxRetries: 2
}).bindTools(tools)
// .bindTools(tools) is what actually gives the LLM the ABILITY to ask for a
// tool call - it tells the model "here are the tools available, their
// names, and their input schemas" so the model can emit a structured
// tool_calls entry in its response instead of only ever emitting plain
// text.



// The "agent" node: ask the LLM what to do next, given the conversation so
// far. `state.messages` already contains every prior human/AI/tool message
// for this thread_id, thanks to the checkpointer - this system prompt is
// the one place that steers WHEN the model should reach for a tool at all.
const callLLM = async (state) => {
    console.log("state:", state)

    const response = await llm.invoke([
        {
            role: "system",
            content: `You are Jarvis AI assistant

Use conversation memory first.

Only use tools when the answer requires
external real-time information like:
weather, news, web search, stock prices etc.

Do NOT call tools for simple conversation,
memory-based questions, greetings,
or personal context`
        },
        ...state.messages
    ])

    return { messages: [response] }
}

// The CONDITIONAL EDGE: after the agent node runs, LangGraph calls this to
// decide where to go next. If the LLM's last response included a
// tool_calls array (it decided it needs the search tool), route to the
// "tools" node; otherwise the LLM gave a final answer, so end the graph run
// here. This is the actual decision point that turns a single LLM call
// into a loop.
const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]
    if (lastMessage.tool_calls.length > 0) {
        return "tools"
    } else {
        return "__end__"
    }
}


// The graph wiring:
// __start__ -> agent            (always ask the LLM first)
// agent -> tools OR __end__     (conditional, decided by shouldContinue)
// tools -> agent                (after running a tool, go ask the LLM again
//                                 with the tool's result added to state)
// This tools -> agent edge (not tools -> __end__) is what allows multiple
// tool calls in a row if the LLM decides it needs to search again after
// seeing the first result, before finally answering.
const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .compile({ checkpointer: checkPointer })




app.post("/ai", async (req, res) => {
    // Q. WHY IS thread_id READ FROM THE REQUEST INSTEAD OF HARDCODED?
    // ANS: The checkpointer (MemorySaver above) keys saved conversation
    // state by thread_id - reusing the same thread_id resumes that
    // conversation's memory, while a new/different thread_id starts a
    // fresh one. A single hardcoded thread_id ("user123") would mean EVERY
    // caller shares the exact same memory, which breaks the moment more
    // than one person/browser tab talks to this server. Accepting an
    // optional threadId from the client (falling back to a default for
    // quick curl testing) is the minimum change needed to give each
    // conversation its own memory - a real app would derive this from an
    // authenticated user/session id instead of trusting the client to send
    // a stable value.
    const { input, threadId } = req.body

    const response = await graph.invoke(
        {
            messages: [
                {
                    role: "user",
                    content: input
                }
            ]
        },
        { configurable: { thread_id: threadId || "default-thread" } }

    )
    console.log(response.messages)

    return res.status(200).json({ "ai:": response.messages[response.messages.length - 1].content })
})




app.get("/", (req, res) => {
    return res.json({ message: "hello from level4" })
})


app.listen(port, () => {
    console.log("server started")
})
