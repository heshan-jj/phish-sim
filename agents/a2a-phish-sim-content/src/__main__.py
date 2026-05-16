import logging
import os

import click
import uvicorn
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import AgentCapabilities, AgentCard, AgentSkill
from dotenv import load_dotenv
from openai_agent import create_agent
from openai_agent_executor import OpenAIAgentExecutor
from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route

load_dotenv()

logging.basicConfig()


@click.command()
@click.option("--host", "host", default="0.0.0.0")
@click.option("--port", "port", default=5000)
def main(host: str, port: int):
    api_key = None
    base_url = None
    model = "gpt-4o"

    if os.getenv("MINIMAX_API_KEY"):
        api_key = os.getenv("MINIMAX_API_KEY")
        base_url = os.getenv("MINIMAX_BASE_URL", "https://api.minimax.io/v1")
        model = os.getenv("MINIMAX_MODEL", "MiniMax-M2.7")
    elif os.getenv("OPENROUTER_API_KEY"):
        api_key = os.getenv("OPENROUTER_API_KEY")
        base_url = "https://openrouter.ai/api/v1"
        model = os.getenv(
            "OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free"
        )
    else:
        api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise ValueError(
            "Set MINIMAX_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY"
        )

    skill = AgentSkill(
        id="phish_sim_content",
        name="PhishSim Content Agent",
        description=(
            "Generate phishing simulation emails and vishing scripts "
            "as JSON for security awareness training"
        ),
        tags=[
            "phishing",
            "security awareness",
            "simulation",
            "email",
            "training",
            "vishing",
        ],
        examples=[
            "Generate a phishing simulation email for security awareness training",
            "Create a medium difficulty IT phishing email as JSON",
        ],
    )

    agent_card = AgentCard(
        name="PhishSim Content Agent",
        description=(
            "Generates realistic phishing simulation content for authorized "
            "employee security training"
        ),
        url=f"http://{host}:{port}/",
        version="1.0.0",
        default_input_modes=["text"],
        default_output_modes=["text"],
        capabilities=AgentCapabilities(streaming=True),
        skills=[skill],
    )

    agent_data = create_agent()
    agent_executor = OpenAIAgentExecutor(
        card=agent_card,
        tools=agent_data["tools"],
        api_key=api_key,
        system_prompt=agent_data["system_prompt"],
        base_url=base_url,
        model=model,
    )

    request_handler = DefaultRequestHandler(
        agent_executor=agent_executor,
        task_store=InMemoryTaskStore(),
    )

    a2a_app = A2AStarletteApplication(
        agent_card=agent_card,
        http_handler=request_handler,
    )

    async def health(_request):
        return JSONResponse({"status": "ok", "agent": "phish-sim-content"})

    app = Starlette(
        routes=[
            Route("/health", health, methods=["GET"]),
            *a2a_app.routes(),
        ]
    )
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    main()
