// PHASE 3 - Model Context Protocol (MCP): the CLIENT half + agent.
//
// This mirrors phase 1's agent loop almost exactly (same StateGraph shape,
// same conditional-edge pattern, same MemorySaver) - the only real
// difference is WHERE the tools come from: phase 1 imported a
// framework-specific tool package (TavilySearch) directly; here, the tools
// are DISCOVERED at runtime from an MCP server (./mcp-server.js) that this
// file spawns as a child process. If you understand phase 1's graph, this
// file should read as "the same thing, with the tools sourced differently"
// - see mcp-server.js for the deeper "why MCP" explanation.
import express from "express"
import dotenv from "dotenv"
import { ChatGroq } from "@langchain/groq"
import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { MultiServerMCPClient } from "@langchain/mcp-adapters"

dotenv.config()
const app = express()
const port = 5000
app.use(express.json())

// Q. WHAT DOES THIS CONFIG ACTUALLY DO WHEN getTools() IS CALLED?
// ANS: MultiServerMCPClient spawns `node mcp-server.js` as a CHILD PROCESS
// of this one (transport: "stdio" means "talk to it over that child's
// stdin/stdout"), performs the MCP handshake, asks it "what tools do you
// have?", and wraps each answer as a LangChain DynamicStructuredTool -
// same shape as TavilySearch in phase 1, so it can be handed to
// .bindTools()/ToolNode exactly the same way. You could add a second
// entry here for a completely different MCP server (even a remote one over
// HTTP) and its tools would show up alongside these with zero other code
// changes - that's the "any MCP server, one client API" point of the
// adapter package.
const mcpClient = new MultiServerMCPClient({
    "local-tools": {
        transport: "stdio",
        command: "node",
        args: ["./mcp-server.js"],
    },
})

const tools = await mcpClient.getTools()
console.log(`Loaded ${tools.length} tool(s) from MCP server:`, tools.map((t) => t.name))

const toolNode = new ToolNode(tools)
const checkPointer = new MemorySaver()

const llm = new ChatGroq({
    model: "openai/gpt-oss-120b", // see phase1/index.js for why this replaced llama-3.3-70b-versatile
    temperature: 0.7,
    maxTokens: 512,
    maxRetries: 2,
}).bindTools(tools)

const callLLM = async (state) => {
    const response = await llm.invoke([
        {
            role: "system",
            content: `You are a helpful assistant with access to tools served over MCP
(Model Context Protocol) rather than hardcoded into this app.

Use conversation memory first.

Only call a tool when the question genuinely needs it -
exact arithmetic (use "calculator"), or the current date/time
(use "get_current_time"). Do not call tools for greetings,
opinions, or anything you can already answer directly.`,
        },
        ...state.messages,
    ])
    return { messages: [response] }
}

const shouldContinue = async (state) => {
    const lastMessage = state.messages[state.messages.length - 1]
    return lastMessage.tool_calls.length > 0 ? "tools" : "__end__"
}

const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callLLM)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .compile({ checkpointer: checkPointer })

app.post("/ai", async (req, res) => {
    const { input, threadId } = req.body

    const response = await graph.invoke(
        { messages: [{ role: "user", content: input }] },
        { configurable: { thread_id: threadId || "default-thread" } }
    )

    return res.status(200).json({ "ai:": response.messages[response.messages.length - 1].content })
})

app.get("/", (req, res) => {
    return res.json({ message: "hello from phase 3 (MCP)", tools: tools.map((t) => t.name) })
})

// Q. WHY CLOSE THE MCP CLIENT ON SHUTDOWN?
// ANS: mcpClient.getTools() above spawned mcp-server.js as a live child
// process that stays running for the lifetime of this server (so repeated
// tool calls don't pay the spawn/handshake cost every time). Without
// closing it explicitly, that child process would be left orphaned when
// this process exits - closing it here on Ctrl+C ensures the whole tree
// shuts down together during local development.
process.on("SIGINT", async () => {
    await mcpClient.close()
    process.exit(0)
})

app.listen(port, () => {
    console.log("server started")
})
