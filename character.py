import logging
import os
from google.adk.agents.llm_agent import LlmAgent
from google.genai.types import GenerateContentConfig, HttpOptions, HttpRetryOptions
from google.adk.tools import google_search

root_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='companion_agent',
    instruction="""You are a friendly and efficient companion who will interact with user have start a conversation""",
    generate_content_config=GenerateContentConfig(
        http_options=HttpOptions(
            retry_options=HttpRetryOptions(
                attempts=5,
                initial_delay=1.0
            )
        )
    ),
    tools=[google_search],
)
