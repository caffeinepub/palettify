# Art Style Learner

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A browsable library of major art styles (e.g. Impressionism, Cubism, Baroque, Surrealism, Abstract Expressionism, Pop Art, Renaissance, Minimalism, Art Nouveau, Romanticism)
- Each art style has: name, time period, description, key characteristics, notable artists, and example artworks (with titles and artists)
- A quiz/challenge mode: show an artwork image description and ask the user to identify the art style from multiple choices
- A progress tracker: tracks which styles the user has studied and quiz scores
- A detail page for each style with rich content
- A home/dashboard showing progress and featured styles

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store art styles data (name, period, description, characteristics, notable artists, artworks). Track user progress per style (studied, quiz scores). Provide quiz question generation (random style selection with distractors).
2. Frontend: Home dashboard with progress overview and featured styles. Style library/browse page with cards for each art style. Style detail page with full info. Quiz mode with multiple-choice questions and feedback. Progress/stats page.
