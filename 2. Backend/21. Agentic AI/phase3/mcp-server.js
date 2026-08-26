// PHASE 3 - Model Context Protocol (MCP): the tool SERVER half.
//
// Q. WHAT IS MCP, AND WHY DOES IT MATTER BEYOND WHAT PHASE 1 ALREADY DID
//    WITH .bindTools()?
// ANS: In phase 1, the Tavily search tool was wired directly into that ONE
// LangChain agent, in that ONE codebase - if you wanted the same tool
// available to a different agent, a different framework, or a colleague's
// project, you'd have to re-import and re-wire it there too. MCP (created
// by Anthropic, now an open standard used across the industry) defines a
// standard PROTOCOL for exposing tools/data/prompts from a separate SERVER
// process, so ANY MCP-compatible client - LangChain, Claude Desktop, an
// IDE's AI assistant, a completely different framework - can discover and
// call those same tools without any framework-specific integration code on
// the server side. This file (an MCP server) doesn't import LangChain at
// all - it doesn't know or care what will eventually call it. index.js in
// this same folder is the client side: it connects to this server and
// exposes its tools to a LangGraph agent, exactly like the Tavily tool was
// exposed in phase 1, but sourced from a standard protocol instead of a
// framework-specific package.
//
// Q. WHY TWO SEPARATE FILES (THIS ONE + index.js) INSTEAD OF ONE?
// ANS: This is the actual point being demonstrated, not just code
// organization - MCP servers and their clients are supposed to be
// independent processes that only talk over a protocol boundary (stdio
// here; MCP also supports HTTP for remote servers). index.js spawns this
// file as a CHILD PROCESS and talks to it over stdin/stdout using the MCP
// message format - it never directly calls a function defined in this
// file. That's what makes this genuinely different from just importing a
// tools.js file.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const server = new McpServer({
    name: "agentic-ai-phase3-tools",
    version: "1.0.0",
})

// Q. WHY A CALCULATOR TOOL - ISN'T ARITHMETIC SOMETHING AN LLM CAN ALREADY
//    DO?
// ANS: LLMs generate text token-by-token from learned patterns, not by
// actually executing math - they're right on simple sums often enough to
// seem reliable, then confidently wrong on anything with enough digits or
// steps, because there's no real calculation happening, just pattern
// completion. A calculator TOOL hands the actual arithmetic to real code
// that computes an exact answer, and the LLM's job shrinks to the part
// it's actually good at: understanding the question and deciding to reach
// for this tool with the right expression.
server.registerTool(
    "calculator",
    {
        title: "Calculator",
        description: "Evaluates a basic arithmetic expression (+, -, *, /, parentheses) and returns the exact numeric result.",
        inputSchema: {
            expression: z.string().describe("An arithmetic expression, e.g. \"(12 + 8) * 3\""),
        },
    },
    async ({ expression }) => {
        // Q. WHY NOT JUST eval(expression)?
        // ANS: The expression here ultimately originates from whatever the
        // LLM decided to send - eval() would run ANY JavaScript it
        // produced, not just arithmetic (arbitrary code execution). This
        // allowlist-based check only permits digits, the four basic
        // operators, decimal points, parentheses, and whitespace before
        // ever reaching eval(), so even if the model emitted something
        // unexpected, anything outside plain arithmetic gets rejected
        // first.
        if (!/^[\d\s+\-*/().]+$/.test(expression)) {
            return {
                content: [{ type: "text", text: "Error: expression contains characters outside basic arithmetic (digits, + - * / ( ) and whitespace only)." }],
                isError: true,
            }
        }
        try {
            // eslint-disable-next-line no-eval
            const result = eval(expression)
            return { content: [{ type: "text", text: String(result) }] }
        } catch (e) {
            return { content: [{ type: "text", text: `Error: could not evaluate "${expression}"` }], isError: true }
        }
    }
)

// A second, even simpler tool - deliberately trivial so the example stays
// about the MCP wiring, not about the tool's own complexity. An LLM has no
// reliable notion of "right now" (its knowledge has a training cutoff and
// it doesn't have a clock), so even something this small is a genuine gap
// a tool fills.
server.registerTool(
    "get_current_time",
    {
        title: "Get Current Time",
        description: "Returns the current server date and time in ISO 8601 format.",
        inputSchema: {},
    },
    async () => {
        return { content: [{ type: "text", text: new Date().toISOString() }] }
    }
)

// StdioServerTransport reads MCP protocol messages from this process's
// stdin and writes responses to stdout - which is exactly the channel
// index.js's MultiServerMCPClient talks over when it spawns this file as a
// child process (see the "stdio" connection config there). Nothing else
// in this file needs to know that detail; connecting the transport is the
// only wiring required to make the tools above reachable.
const transport = new StdioServerTransport()
await server.connect(transport)
