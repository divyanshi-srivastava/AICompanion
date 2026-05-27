# AI Companion 🤖

An AI-powered companion chatbot with voice synthesis and animated character, built with Flask and Google ADK (Agent Development Kit).

## Features

- 💬 **Conversational AI** — powered by Gemini 2.5 Flash via Google ADK
- 🔍 **Google Search** tool integration for real-time information
- 🗣️ **Text-to-Speech** — browser-native voice synthesis with lip-sync animation
- 🎨 **Dark mode UI** — sleek, responsive design with Inter font

## Prerequisites

- Python 3.11+
- A [Gemini API Key](https://aistudio.google.com/apikey)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AICompanion.git
cd AICompanion
```

### 2. Set up a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run the app

```bash
python app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

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