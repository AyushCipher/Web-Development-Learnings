const { pool } = require("../db/client");

/**
 * ============================================================================
 *   ADVANCED TOPIC 5: AI AGENTS WITH TOOL USE & TEXT-TO-SQL
 * ============================================================================
 * 
 * 1. AI AGENTS WITH TOOL CALLING:
 *    - Modern AI agents do not just chat; they inspect user input and dynamically invoke tools.
 *    - Tool 1: pgvector Semantic Search (for knowledge/documents).
 *    - Tool 2: Text-to-SQL Engine (for analytical/relational numbers).
 * 
 * 2. TEXT-TO-SQL WORKFLOW:
 *    - Store table definitions and schema comments as vector embeddings.
 *    - When a user asks "How many jobs were posted this week?", match the vector against
 *      table schemas, pass the retrieved schema to the LLM, and execute the generated SQL.
 */

const registeredTools = [
  {
    name: "vector_knowledge_search",
    description: "Searches unstructured knowledge base articles, policies, and concepts using pgvector.",
    parameters: ["query_text", "category_filter"],
  },
  {
    name: "text_to_sql_analytics",
    description: "Converts natural language questions into executable SQL queries against structured database tables.",
    parameters: ["question", "table_name"],
  },
  {
    name: "calculate_ctc",
    description: "Calculates take-home salary and taxes for a given CTC amount.",
    parameters: ["ctc_amount", "tax_regime"],
  },
];

async function agentToolRouter(userPrompt) {
  console.log("\n========================================================");
  console.log(" ADVANCED 5: AI AGENT TOOL ROUTING & TEXT-TO-SQL        ");
  console.log("========================================================");
  console.log(`Incoming User Prompt: "${userPrompt}"`);

  let selectedTool;
  let toolArgs;

  if (userPrompt.toLowerCase().includes("how many") || userPrompt.toLowerCase().includes("count") || userPrompt.toLowerCase().includes("average")) {
    selectedTool = "text_to_sql_analytics";
    toolArgs = {
      question: userPrompt,
      generated_sql: "SELECT category, COUNT(*) as total_docs FROM knowledge_base GROUP BY category;",
    };
  } else if (userPrompt.toLowerCase().includes("salary") || userPrompt.toLowerCase().includes("tax")) {
    selectedTool = "calculate_ctc";
    toolArgs = { ctc_amount: 1500000, tax_regime: "new" };
  } else {
    selectedTool = "vector_knowledge_search";
    toolArgs = { query_text: userPrompt, distance_operator: "<=>" };
  }

  console.log(`\n🤖 AI Agent Decision:`);
  console.log(`→ Selected Tool: "${selectedTool}"`);
  console.log(`→ Tool Arguments:`, JSON.stringify(toolArgs, null, 2));

  return { selectedTool, toolArgs };
}

module.exports = { registeredTools, agentToolRouter };
