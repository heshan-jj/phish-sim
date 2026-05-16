# PhishSim Content Agent (Nasiko A2A)

Generates phishing simulation emails and vishing scripts as JSON — same intent as `lib/ai.ts` in the phish-sim app.

## Zip layout (must match exactly)

Put files at the **root of the zip** (not inside an extra folder):

```
a2a-phish-sim-content/          ← folder on disk; zip root = contents of this folder
├── AgentCard.json              ← edit this file only (source of truth)
│                               (npm run agent:zip also adds Agentcard.json to zip)
├── Dockerfile
├── pyproject.toml
├── docker-compose.yml          ← optional for local test only
├── README.md
└── src/
    ├── __init__.py
    ├── __main__.py             ← includes GET /health
    ├── openai_agent.py
    └── openai_agent_executor.py
```

`Agentcard.json` is duplicated into the zip automatically (Nasiko requires that spelling; Windows cannot hold both filenames in one folder).

## Deploy to Nasiko (VPS)

1. Build the zip from the repo root:

   ```bash
   npm run agent:zip
   ```

   Creates `agents/a2a-phish-sim-content.zip`.

2. In Nasiko UI (`http://<vps>:9100/app/`):

   - **Add Agent → Upload ZIP**
   - Choose `agents/a2a-phish-sim-content.zip`
   - Agent name: **`phish-sim-content`** (must match upload name)

3. Wait until status is **Active** (~1–2 min).

4. Test on the VPS (Kong route uses container name `agent-phish-sim-content`):

   ```bash
   curl -s http://127.0.0.1:9100/agents/agent-phish-sim-content-v2/health
   # expect: {"status":"ok","agent":"phish-sim-content"}
   # Kong route matches the running container name (agent-{upload-name})
   ```

## phish-sim app

With `AI_PROVIDER=nasiko`, set a direct agent URL (recommended — bypasses the Nasiko router LLM):

```env
NASIKO_AGENT_ROUTE=http://<vps>:9100/agents/agent-phish-sim-content-v2
```

## LLM on the VPS

The Nasiko redis listener injects `MINIMAX_API_KEY` from `.nasiko-local.env` into agent containers. Ensure that key is set on the VPS.

## Local test (optional)

```bash
cd agents/a2a-phish-sim-content
export MINIMAX_API_KEY=...
docker compose up --build
```
