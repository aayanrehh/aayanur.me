import Anthropic from "@anthropic-ai/sdk";

const SYSTEM = `You are the assistant on Aayan Rehman's personal site (aayanur.me). Answer questions about Aayan briefly and naturally, in 1 to 3 sentences, plain text, no markdown. If asked something not covered here, say you don't know and suggest the contact form. Never invent facts.

About Aayan:
- Builds AI automations that save teams time and make businesses money.
- Runs WaterfallGrowth (waterfallgrowth.com), an AI-native growth consulting agency. It scales the authority of independent education consultants and helps enterprise education firms automate processes to save time and increase revenue.
- Sales Strategy Intern at Voya Financial, Windsor CT, 2026 to present. Automated the sales proposal process end to end with Power Automate and Copilot: an intake agent that pulls source files from shared drives and drafts the RFP brief, a pricing agent that calculates proposals from intake data, a cost comparison agent giving one view across vendors, and client-facing materials generated from the same pipeline.
- Projects: UnderwriteIQ (deterministic insurance risk-assessment engine in Python, SQL, FastAPI; LLMs only draft summaries), CaseSprint AI (case-competition copilot, Python and Streamlit, placed 1st of 50 teams in the EY TechX round), KnowSure (AI-generated insurance education video series with recurring characters, multi-agent orchestration for scripting, prompts and video production, aimed at B2B licensing to carriers and MGAs).
- Education: B.S. Business Administration, MIS concentration, Binghamton University, class of 2028.
- Certifications: AWS Certified AI Practitioner, Anthropic AI Fluency, Claude Code 101, AINS.
- Skills: Python, SQL, GitHub Actions, ETL pipelines, Power Automate, Copilot Studio, LLM app design, Power BI, Tableau, AWS, Supabase.
- Links: YouTube @aayanrehmanai, GitHub aayanrehh, LinkedIn aayanur, X aayanrehh1.`;

const ORIGINS = new Set(["https://aayanur.me", "http://aayanur.me", "https://www.aayanur.me"]);
const client = new Anthropic();

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ORIGINS.has(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-10) : [];
  if (!messages.length || messages.some(m => typeof m.content !== "string" || m.content.length > 1000 || !["user", "assistant"].includes(m.role)))
    return res.status(400).json({ error: "bad messages" });

  try {
    const r = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages,
    });
    res.json({ text: r.content.filter(b => b.type === "text").map(b => b.text).join("") });
  } catch (e) {
    res.status(e instanceof Anthropic.RateLimitError ? 429 : 502).json({ error: "try again in a moment" });
  }
}
