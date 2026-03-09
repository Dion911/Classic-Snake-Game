# Snake

Minimal, static Snake game built for GitHub Pages. The app uses plain HTML, CSS, and JavaScript so it can run directly in the browser without a build step.

## Run locally

From `/Users/macbookair/Documents/CODEX`:

```bash
python3 -m http.server 4173
```

Open:

- `http://localhost:4173/` for the game
- `http://localhost:4173/test.html` for the logic checks

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository settings, open **Pages**.
3. Set the source to deploy from the main branch root.
4. Save, then wait for the site URL to be published by GitHub.

## Controls

- Arrow keys or `W`, `A`, `S`, `D`
- Swipe on the board on touch devices
- On-screen direction buttons for mobile
- `Space` to pause/resume
- `Enter` to restart after game over or a win

## Manual checklist

- Start the game with keyboard input, swipe, and on-screen buttons.
- Confirm the snake moves one grid cell per tick and cannot reverse into itself.
- Eat food and verify the score increments and the snake grows.
- Hit a wall and the snake body to confirm game-over behavior.
- Pause and resume with the button and the space bar.
- Restart and confirm the score and board reset cleanly.
