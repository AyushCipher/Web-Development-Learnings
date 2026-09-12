/**
 * ============================================================================
 *   ADVANCED TOPIC 1: EVALUATION-DRIVEN DEVELOPMENT (EDD FOR AI & RAG)
 * ============================================================================
 * 
 * Q. WHAT IS EVALUATION-DRIVEN DEVELOPMENT?
 * ANS: Moving away from subjective "vibe checks" to automated, mathematical
 * benchmarking of your Vector Search and RAG pipelines.
 * 
 * CORE METRICS IN RETRIEVAL EVALUATION:
 * 1. Hit Rate @ K:
 *    - Formula: Percentage of test queries where the correct ground-truth chunk is in the Top-K results.
 * 2. Mean Reciprocal Rank (MRR):
 *    - Formula: (1 / rank of the first relevant result).
 *    - Measures how high up the correct result appears. (e.g. rank 1 = 1.0, rank 2 = 0.5, rank 3 = 0.33).
 * 3. Faithfulness (RAG Triad):
 *    - Did the LLM answer strictly using the retrieved context, or did it hallucinate?
 * 4. Answer Relevance:
 *    - Did the generated answer directly address the user query?
 */

function evaluateRetrievalPipeline(testCases, retrievalFunction) {
  console.log("\n========================================================");
  console.log(" ADVANCED 1: EVALUATION-DRIVEN DEVELOPMENT BENCHMARK   ");
  console.log("========================================================");

  let hitsAt3 = 0;
  let reciprocalRankSum = 0;

  testCases.forEach((tc, idx) => {
    const retrieved = retrievalFunction(tc.query);
    const foundIndex = retrieved.findIndex((r) => r.id === tc.expectedDocId);

    if (foundIndex !== -1 && foundIndex < 3) {
      hitsAt3++;
      reciprocalRankSum += 1.0 / (foundIndex + 1);
    }

    console.log(
      `Test #${idx + 1}: Query: "${tc.query}" -> Expected Doc #${tc.expectedDocId} | Found Rank: ${
        foundIndex === -1 ? "MISS" : foundIndex + 1
      }`
    );
  });

  const hitRateAt3 = (hitsAt3 / testCases.length) * 100;
  const mrr = reciprocalRankSum / testCases.length;

  console.log("\n--- BENCHMARK RESULTS ---");
  console.log(`✓ Hit Rate @ 3: ${hitRateAt3.toFixed(1)}%`);
  console.log(`✓ Mean Reciprocal Rank (MRR): ${mrr.toFixed(3)} (Max: 1.000)`);

  return { hitRateAt3, mrr };
}

module.exports = { evaluateRetrievalPipeline };
