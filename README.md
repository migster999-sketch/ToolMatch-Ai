# ToolMatch AI — Deploy Guide

## You need two things before starting
1. A **Vercel account** → vercel.com (free)
2. An **Anthropic API key** → console.anthropic.com (pay as you go, ~$5-20/month at low traffic)

---

## Deploy in 3 steps

### Step 1 — Upload this folder to GitHub
1. Go to github.com → New repository → name it `toolmatch-ai`
2. Upload all these files (drag and drop works)
3. Click "Commit changes"

### Step 2 — Connect to Vercel
1. Go to vercel.com → Add New Project
2. Import your `toolmatch-ai` GitHub repo
3. Click Deploy (default settings are fine)

### Step 3 — Add your API key
1. In Vercel → your project → Settings → Environment Variables
2. Add a new variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com
3. Click Save → Redeploy

Your live link will be: `https://toolmatch-ai.vercel.app`

---

## Adding affiliate links (this is how you make money)

Open `public/index.html` and find the `AFFILIATES` section near the top of the script.

For each tool, replace `YOUR_REF_ID` with your actual affiliate ID after signing up:

| Tool | Affiliate Program URL |
|---|---|
| Jasper | jasper.ai/affiliate |
| Copy.ai | copy.ai/affiliate |
| Writesonic | writesonic.com/affiliate |
| Notion | notion.so/affiliates |
| Surfer SEO | surferseo.com/affiliate |
| Semrush | semrush.com/affiliates |
| ElevenLabs | elevenlabs.io/affiliate |
| Make.com | make.com/en/affiliates |
| Synthesia | synthesia.io/affiliates |
| Descript | descript.com/affiliates |

Most pay 20-45% recurring commission. Sign up for all of them — it takes 10 minutes per program.

---

## Adding new tools to the affiliate map

In `public/index.html`, find the `AFFILIATES` object and add:
```
'tool name lowercase': 'https://youraffiliate.link',
```

---

## Monitoring costs

Each user search costs roughly $0.01-0.03 in API calls.
- 100 searches/day = ~$1-3/day
- Watch your usage at console.anthropic.com

To add rate limiting later, look into Vercel KV (free tier available).
