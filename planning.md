Here is the **Revised Product Requirement Document (PRD)** incorporating your specific constraints regarding the API strategy, image consistency, and development setup.

---

# Product Requirement Document (PRD): GenAI Interactive Storyteller (v1.1)

| **Project Name** | GenAI Storyteller MVP |
| --- | --- |
| **Version** | 1.1 (Revised) |
| **Platform** | Web (Mobile-First / Responsive) |
| **Primary Model** | Google Gemini API (Text & Vision) |
| **Backup Model** | OpenAI GPT/DALL-E API |
| **Dev Context** | Developer's own API keys used via Environment Variables |

---

## 1. Executive Summary

We are building a web-based interactive fiction application where the user plays the protagonist in a 10-turn story. The narrative and visuals are generated in real-time. The application operates entirely on the frontend.
**Key Technical Constraint:** The system prioritizes the **Google Gemini API** for all generations. If Gemini is unavailable or returns an error, the system automatically falls back to the **OpenAI API**.
**Visual Constraint:** While every story can have a unique look, the artistic style must remain consistent *within* a single session (e.g., if Turn 1 is "Cyberpunk Anime," Turn 10 must also be "Cyberpunk Anime").

---

## 2. Product Architecture & Flow

### 2.1. Core Loop

1. **Initialization:** App loads API keys from local environment variables.
2. **Style Definition:** Upon story start, a specific visual style is locked in (based on genre).
3. **Generate (Dual-Model Strategy):**
* **Attempt 1:** Send prompt to **Gemini API**.
* **Fallback:** If Gemini fails (5xx error or timeout), send the exact same prompt to **GPT/DALL-E**.


4. **Visualize:** Display the generated image and text.
5. **Interact:** User selects 1 of 3 choices.
6. **Progress:** Repeat until Turn 10 (Epilogue).

### 2.2. Narrative Structure (Hardcoded Logic)

* **Turns 1–6:** Introduction & Rising Action.
* **Turn 7 (Climax):** High tension/conflict.
* **Turn 9 (Prep):** Preparation for the conclusion.
* **Turn 10 (Conclusion):** Final outcome.
* **Post-Game:** Epilogue.

---

## 3. User Stories & Acceptance Criteria

### Epic 1: Configuration & Setup

**User Story:** As a developer/user, I want the app to initialize using pre-configured keys so I can test immediately without manual input.

| ID | Acceptance Criteria | Priority |
| --- | --- | --- |
| **1.1** | The app reads API keys from a `.env` file (or local equivalent) at startup. | P0 |
| **1.2** | **Fallback Logic:** If the Primary API (Gemini) returns an error, the system automatically attempts the request using the Secondary API (OpenAI). | P0 |
| **1.3** | Users can select a Genre/Theme (e.g., "Space Opera," "Noir Mystery"). | P1 |
| **1.4** | **Style Locking:** Selecting a genre automatically assigns a visual style prompt (e.g., "Noir" → "Black and white, high contrast ink style") that persists for the session. | P0 |

### Epic 2: The Gameplay Loop (The Turn)

**User Story:** As a user, I want a seamless experience where the text and images feel cohesive.

| ID | Acceptance Criteria | Priority |
| --- | --- | --- |
| **2.1** | **Visuals:** Every turn *must* generate and display an image. (No skip option). | P0 |
| **2.2** | **Consistency:** The image at Turn X must match the artistic style of Turn 1. | P0 |
| **2.3** | **Narrative:** Text describes the situation (100-150 words) relative to the previous choice. | P0 |
| **2.4** | **Choices:** Three distinct actionable buttons appear at the bottom. | P0 |
| **2.5** | **Loading State:** A visual indicator (spinner/skeleton) appears while the API is generating. | P0 |

### Epic 3: Game Logic & Pacing

**User Story:** As a user, I want the story to follow a dramatic arc (Climax at Turn 7).

| ID | Acceptance Criteria | Priority |
| --- | --- | --- |
| **3.1** | System tracks Turn Number (1 to 10). | P0 |
| **3.2** | **Turn 7 Logic:** The prompt sent to the API explicitly requests a "Climax/Crisis" scenario. | P0 |
| **3.3** | **Turn 9 Logic:** The prompt requests a "Resolution setup." | P0 |
| **3.4** | **Turn 10 Logic:** The API generates the ending; no new choices are provided. | P0 |

---

## 4. Technical Specifications

### 4.1. Tech Stack

* **Framework:** React, Vue, or Svelte (Frontend only).
* **Primary API:** Google Gemini Pro (Text) + Gemini Pro Vision / Imagen (Image).
* **Secondary API:** OpenAI GPT-4o (Text) + DALL-E 3 (Image).
* **Storage:** `localStorage` (to save current turn if browser is refreshed).

### 4.2. Data Model (State Management)

The frontend state must track the "Art Style" to ensure consistency.

```json
{
  "config": {
    "geminiKey": "AIza...",
    "openaiKey": "sk-..."
  },
  "storyState": {
    "currentTurn": 3,
    "maxTurns": 10,
    "genre": "Cyberpunk",
    "artStylePrompt": "Digital art, neon palette, glitched edges, synthwave aesthetic",
    "history": [ ... ]
  }
}

```

### 4.3. Prompt Engineering Strategy (Consistency)

To ensure the images don't change style (e.g., jumping from "Photo-realistic" to "Cartoon"), we must append the `artStylePrompt` to **every** image generation request.

**System Prompt Structure:**

> "You are a Storytelling AI.
> **Current Context:** [HISTORY]
> **Genre:** [GENRE]
> **Visual Style:** [ART_STYLE_PROMPT]
> **Task:**
> 1. Write the next story segment (Turn [X]/10).
> 2. Create an image prompt for this scene. **CRITICAL:** The image prompt MUST start with the phrase: '[ART_STYLE_PROMPT]'.
> 3. Provide 3 choices."
> 
> 

---

## 5. Potential Risks & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| **Security (Key Exposure)** | Since there is no backend, API keys in the code/build are visible to anyone who inspects the source. | **During Dev:** Use `.env.local`. <br>

<br>**Production Warning:** Do not host publicly without a password or backend proxy if you want to protect your quota. |
| **API Fallback Latency** | If Gemini times out (e.g., 10s) and then we try GPT (10s), the user waits 20s. | Set a strict timeout for Gemini (e.g., 5s). If no response by 5s, immediately trigger GPT. |
| **Inconsistent Visuals** | The AI might ignore the style instruction. | Pre-pend the style string strictly in the code before sending the prompt to the Image API, rather than trusting the LLM to include it. |

---

## 6. Next Steps for Developers

1. **Environment Setup:** Create a `.env` file with `VITE_GEMINI_API_KEY` and `VITE_OPENAI_API_KEY`.
2. **Service Layer:** Write a `generateStoryContent()` function that:
* Tries `callGemini()`.
* Catches error -> Tries `callOpenAI()`.


3. **Style Dictionary:** Create a simple mapping of Genres to Visual Styles (e.g., Horror -> "Gritty, dark, film grain, photorealistic").
4. **UI Implementation:** Build the mobile-width container and chat interface.