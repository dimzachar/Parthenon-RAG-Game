🏗️ Overview

> Most of the frontend parts were built using AI (LLMs).

The frontend of this project consists of two main components:

1. **Landing Page** 🏠
   - Built with Next.js
   - Features buttons that route to `/game`
   - Includes pricing options and an email waitlist signup
   - Responsive design with animated sections

2. **Game Interface** 🎮
   - Built using Phaser.js for 2D game mechanics
   - Integrates with the backend for dynamic content and interactions

## 🧩 Key Components

| Component | Description |
|-----------|-------------|
| `Game.tsx` | Main game component initializing Phaser and managing game scenes |
| `MainScene.ts` | Primary game scene handling player movement, NPC interactions, and world physics |
| `NPCManager.ts` | Manages NPC behaviors, movements, and interaction zones |
| `MapManager.ts` | Handles creation and management of the game world, including tilesets and layers |
| `InitialPopup.tsx` | Fetches random facts about the Movement ecosystem from the backend, with Twitter integration |
| `InteractionPopup.tsx` | Manages the chat interface for in-depth conversations with the knowledge base |
| `LandingPage.tsx` | Implements the responsive landing page with animated sections and navigation |

## 🌍 Game World Creation

The 2D world map is crafted using:
- Tiles
- Tilesets
- Sprites

Tool of choice: [Tiled Map Editor](https://thorbjorn.itch.io/tiled)

> This setup allows for easy customization and expansion of the game world.

## 🕹️ Game Mechanics

1. **Player Movement**
   - Controlled using arrow keys
   - Implemented in `MainScene.ts`

2. **NPC Interactions**
   - Triggered by proximity and 'E' key press
   - Managed by `NPCManager.ts`

3. **Dialogue System**
   - Uses RAG system for contextual responses
   - Displayed in `InteractionPopup.tsx`

## 🎨 Styling and Animations

- **Tailwind CSS**: For responsive styling
- **Framer Motion**: Smooth animations and transitions
- **Custom SVG Animations**: Enhance visual appeal of the landing page

## 🔄 RAG System Flow

1. Player interacts with an NPC in the game world.
2. Frontend sends a query to the backend API (`/question` endpoint in `app.py`).
3. `rag.py` processes the query:
   - Searches for relevant context using Elasticsearch.
   - Constructs a prompt using the retrieved information.
   - Sends the prompt to the OpenAI API for response generation.
4. The generated response is sent back to the frontend and displayed in the game interface.
