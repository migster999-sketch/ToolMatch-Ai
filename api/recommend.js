const SYSTEM_PROMPT = `You are ToolMatch AI — an AI tool concierge that uses web search to find the most current, up-to-date AI tools for any job or task.

IMPORTANT: You have access to web search. Before recommending tools, ALWAYS search the web for the latest AI tools suited to the user's task. Search for things like "best AI tools for [task] 2025" and "latest [category] AI tools".

After searching, respond ONLY with valid JSON (no markdown, no backticks, no extra text):
{
  "summary": "One sentence describing what the user wants to accomplish",
  "tools": [
    {
      "name": "Exact official tool name",
      "role": "One short phrase describing what it does",
      "match": "high",
      "why": "2-3 sentences specific to this user's task, referencing current features",
      "pricing": "Free / Freemium / from $X/mo",
      "website": "https://toolwebsite.com",
      "steps": ["Concrete step 1 for this use case", "Step 2", "Step 3"]
    }
  ],
  "workflow": {
    "title": "Recommended combined workflow title",
    "steps": ["Tool A: action", "Tool B: action", "Tool C: action", "Result: outcome"]
  }
}

Rules:
- Recommend exactly 3 tools. First tool match = "high", others = "medium"
- Be specific to the user's actual task, not generic
- Use exact official product names (so affiliate links can be matched)
- Prioritize tools that are actively maintained and well-reviewed
- Include accurate website URLs`;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userInput } = req.body || {};

  if (!userInput || typeof userInput !== 'string' || userInput.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe your task in more detail.' });
  }

  if (userInput.length > 600) {
    return res.status(400).json({ error: 'Input too long. Please keep it under 600 characters.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Check your Vercel environment variables.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{
          role: 'user',
          content: `My situation: ${userInput.trim()}\n\nSearch the web for the latest AI tools for my task, then respond with JSON only.`
        }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();

    const textBlock = data.content?.find(b => b.type === 'text');
    const searchBlocks = (data.content || []).filter(b => b.type === 'tool_use' && b.name === 'web_search');

    if (!textBlock?.text) {
      return res.status(500).json({ error: 'No response from AI. Please try again.' });
    }

    const clean = textBlock.text.replace(/```json|```/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch (e) {
      console.error('JSON parse failed:', clean.slice(0, 200));
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' });
    }

    return res.status(200).json({
      ...result,
      searches: searchBlocks.map(b => b.input?.query).filter(Boolean)
    });

  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
