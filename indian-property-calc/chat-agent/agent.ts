import * as dotenv from "dotenv";
import { createExpressServer } from "./server";
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { createRetrieverTool } from "langchain/tools/retriever";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { 
  getCitiesListTool, 
  estimateFlatCostTool, 
  estimateHouseCostTool, 
  compareLocationsTool 
} from "./tools/propertyTools";

// Load environment variables
dotenv.config();

// Constants
const PORT = process.env.CHAT_PORT || 3003;

/**
 * Create and configure the chat agent
 */
async function createAgent() {
  // Check if API key is available
  const openAIApiKey = process.env.OPENAI_API_KEY;
  if (!openAIApiKey) {
    console.warn("OPENAI_API_KEY not found. LLM functionality will be limited.");
    return null;
  }
  
  try {
    // Initialize the language model
    const model = new ChatOpenAI({
      modelName: "gpt-4",
      temperature: 0.2,
    });
    
    // Create property calculator tools
    const tools: StructuredToolInterface[] = [
      getCitiesListTool,
      estimateFlatCostTool,
      estimateHouseCostTool,
      compareLocationsTool,
    ];
    
    // Add search capability
    try {
      const searchTool = new TavilySearchResults({
        apiKey: process.env.TAVILY_API_KEY,
      });
      tools.push(searchTool as unknown as StructuredToolInterface);
    } catch (error) {
      console.warn("Tavily search tool could not be initialized. Continuing without search capability.");
    }
    
    // Create vector store for property knowledge
    const propertyDocs = [
      new Document({
        pageContent: "PMAY (Pradhan Mantri Awas Yojana) is a government scheme in India that provides subsidies to first-time homebuyers in the EWS (Economically Weaker Section) and LIG (Low Income Group) categories. The subsidy is applied to the interest on home loans.",
        metadata: { source: "property_knowledge", topic: "subsidies" }
      }),
      new Document({
        pageContent: "In India, stamp duty rates vary by state. Many states offer reduced stamp duty rates for women buyers to encourage property ownership among women.",
        metadata: { source: "property_knowledge", topic: "taxes" }
      }),
      new Document({
        pageContent: "GST on under-construction properties in India is 5% for regular housing and 1% for affordable housing projects. No GST is applicable on ready-to-move properties with completion certificate.",
        metadata: { source: "property_knowledge", topic: "taxes" }
      }),
      new Document({
        pageContent: "Construction cost in India typically has a 60:40 ratio between materials and labor, but this can vary based on the type of construction and location.",
        metadata: { source: "property_knowledge", topic: "construction" }
      }),
      new Document({
        pageContent: "In India, Tier 1 cities include Mumbai, Delhi, Bangalore, Chennai, Kolkata, and Hyderabad. Tier 2 cities include Pune, Ahmedabad, Jaipur, and Lucknow. Tier 3 cities are smaller cities and towns.",
        metadata: { source: "property_knowledge", topic: "locations" }
      }),
    ];
    
    const vectorStore = await MemoryVectorStore.fromDocuments(
      propertyDocs,
      new OpenAIEmbeddings()
    );
    
    const retriever = vectorStore.asRetriever();
    const retrieverTool = createRetrieverTool(retriever, {
      name: "property_knowledge",
      description: "Search for information about Indian property market, taxes, subsidies, and construction costs",
    });
    
    tools.push(retrieverTool as unknown as StructuredToolInterface);
    
    // Create the prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are PropertyGuru, an AI assistant specialized in Indian property costs.
      
You can help users with:
1. Estimating flat/apartment costs with taxes and EMI
2. Estimating house construction costs with material and labor breakdown
3. Comparing property costs across different cities, states and regions
4. Explaining subsidies like PMAY and tax benefits
5. Answering questions about the Indian real estate market

Always use Indian Rupees (₹) in your responses. Format large amounts in lakh (L) and crore (Cr) format.
Be conversational but precise with numbers and calculations.

Current date: ${new Date().toLocaleDateString("en-IN")}`],
      ["human", "{input}"],
      ["placeholder", "{agent_scratchpad}"]
    ]);
    
    // Create the agent
    const agent = await createToolCallingAgent({
      llm: model,
      tools,
      prompt
    });
    
    // Create the executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 5,
    });
    
    return agentExecutor;
  } catch (error) {
    console.error("Failed to create agent:", error);
    return null;
  }
}

/**
 * Main function to start the server
 */
async function main() {
  try {
    const agent = await createAgent();
    
    // Create Express server for API
    const server = createExpressServer(agent);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Chat agent server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start chat agent:", error);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

export { createAgent };
