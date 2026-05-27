# AI Companion 🤖

An AI-powered companion chatbot with voice synthesis and animated character, built with Flask and Google ADK (Agent Development Kit).

<img width="920" height="1081" alt="Screenshot 2026-05-27 at 2 20 38 PM" src="https://github.com/user-attachments/assets/27e81c36-2685-4c57-b22f-7c33276b06aa" />


## Features

- 💬 **Conversational AI** — powered by Gemini 2.5 Flash via Google ADK
- 🔍 **Google Search** tool integration for real-time information
- 🗣️ **Text-to-Speech** — browser-native voice synthesis with lip-sync animation
- 🎨 **Dark mode UI** — sleek, responsive design with Inter font

## Project Structure

```
AICompanion/
├── app.py              # Flask server & ADK runner
├── character.py        # AI agent definition (model, tools, persona)
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── templates/
│   └── index.html      # Main chat UI
└── static/
    ├── app.js          # Frontend logic (voice, lip-sync, chat)
    ├── style.css       # Dark mode styles
    └── images/         # Character sprites
```

## Customizing the Character

Edit [`character.py`](character.py) to change the AI's persona, model, or tools:

```python
root_agent = LlmAgent(
    model='gemini-2.5-flash',
    name='companion_agent',
    instruction="Your custom persona here...",
    tools=[google_search],
)
```

## Deployment

For production deployment, use [Gunicorn](https://gunicorn.org/):

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

Or deploy to [Google Cloud Run](https://cloud.google.com/run) using the included `Dockerfile`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Your Gemini API key from AI Studio |
| `FLASK_ENV` | No | `development` or `production` (default: production) |
| `FLASK_DEBUG` | No | `true` or `false` (default: false) |
| `SECRET_KEY` | No | Flask secret key for sessions |

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
