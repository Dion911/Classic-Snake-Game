import {
  GRID_SIZE,
  createInitialState,
  queueDirection,
  restartGame,
  startGame,
  stepGame,
  togglePause,
} from "./snake-logic.js";

const TICK_MS = 150;
const statusCopy = {
  ready: "Press an arrow key, use WASD, or tap Play to start.",
  running: "Collect food and avoid the walls and yourself.",
  paused: "Paused. Tap Play or press Space to resume.",
  gameover: "Game over. Tap Restart or press Enter to try again.",
  won: "Board cleared. Tap Restart to play again.",
};

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pauseButton");
const restartButton = document.querySelector("#restartButton");
const controlsElement = document.querySelector(".controls");

let state = createInitialState();
let touchStart = null;

buildBoard(boardElement, GRID_SIZE);
render();

const tickHandle = window.setInterval(() => {
  const nextState = stepGame(state);
  if (nextState !== state) {
    state = nextState;
    render();
  }
}, TICK_MS);

window.addEventListener("keydown", handleKeyDown, { passive: false });
pauseButton.addEventListener("click", handlePause);
restartButton.addEventListener("click", handleRestart);
controlsElement.addEventListener("click", handleDirectionButton);
boardElement.addEventListener("touchstart", handleTouchStart, { passive: true });
boardElement.addEventListener("touchend", handleTouchEnd, { passive: true });
window.addEventListener("beforeunload", () => window.clearInterval(tickHandle));

function render() {
  const snakeLookup = new Set(
    state.snake.slice(1).map((segment) => `${segment.x},${segment.y}`),
  );
  const head = state.snake[0];

  for (const cell of boardElement.children) {
    cell.className = "cell";
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const key = `${x},${y}`;

    if (head && head.x === x && head.y === y) {
      cell.classList.add("cell--head");
      continue;
    }

    if (snakeLookup.has(key)) {
      cell.classList.add("cell--snake");
      continue;
    }

    if (state.food && state.food.x === x && state.food.y === y) {
      cell.classList.add("cell--food");
    }
  }

  scoreElement.textContent = String(state.score);
  statusElement.textContent = statusCopy[state.status];
  pauseButton.textContent = state.status === "running" ? "Pause" : "Play";
}

function buildBoard(board, gridSize) {
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.setAttribute("role", "gridcell");
      board.append(cell);
    }
  }
}

function handlePause() {
  state = togglePause(state);
  render();
}

function handleRestart() {
  state = restartGame(state);
  render();
}

function handleDirectionButton(event) {
  const target = event.target.closest("[data-direction]");
  if (!target) {
    return;
  }

  applyDirection(target.dataset.direction);
}

function handleKeyDown(event) {
  const keyMap = {
    ArrowUp: "up",
    ArrowRight: "right",
    ArrowDown: "down",
    ArrowLeft: "left",
    w: "up",
    d: "right",
    s: "down",
    a: "left",
  };

  if (event.key === " ") {
    event.preventDefault();
    handlePause();
    return;
  }

  if (event.key === "Enter" && (state.status === "gameover" || state.status === "won")) {
    event.preventDefault();
    handleRestart();
    return;
  }

  const direction = keyMap[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
}

function applyDirection(direction) {
  const nextState = queueDirection(state, direction);
  state = startGame(nextState);
  render();
}

function handleTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStart = {
    x: touch.clientX,
    y: touch.clientY,
  };
}

function handleTouchEnd(event) {
  if (!touchStart) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.x;
  const deltaY = touch.clientY - touchStart.y;
  touchStart = null;

  if (Math.abs(deltaX) < 24 && Math.abs(deltaY) < 24) {
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    applyDirection(deltaX > 0 ? "right" : "left");
    return;
  }

  applyDirection(deltaY > 0 ? "down" : "up");
}
