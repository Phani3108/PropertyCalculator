import express, { Request, Response } from "express";
import cors from "cors";
import { AgentExecutor } from "langchain/agents";

/**
 * Create Express server for the chat agent API
 * @param agent The LangChain agent executor (or null if LLM unavailable)
 * @returns Express server instance
 */
export function createExpressServer(agent: AgentExecutor | null) {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      llmEnabled: agent !== null
    });
  });
  
  // Chat endpoint
  app.post("/chat", async (req: Request, res: Response) => {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: "Missing required parameter: message"
      });
    }
    
    try {
      if (!agent) {
        return res.status(503).json({
          error: "LLM service unavailable",
          message: "The AI chat service is currently unavailable. Please try again later."
        });
      }
      
      const result = await agent.invoke({
        input: message
      });
      
      res.json({
        response: result.output,
        metadata: {
          toolCalls: result.intermediateSteps?.length || 0
        }
      });
    } catch (error) {
      console.error("Error processing chat request:", error);
      
      res.status(500).json({
        error: "Failed to process chat request",
        message: "There was an error processing your message. Please try again with a different query."
      });
    }
  });
  
  // Fallback for all other routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: "Not found",
      message: "The requested endpoint does not exist"
    });
  });
  
  return app;
}
