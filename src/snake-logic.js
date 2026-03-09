export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";

export const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export function positionsEqual(a, b) {
  return Boolean(a) && Boolean(b) && a.x === b.x && a.y === b.y;
}

export function createInitialState(options = {}) {
  const gridSize = options.gridSize ?? GRID_SIZE;
  const center = Math.floor(gridSize / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  const baseState = {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    queuedDirection: INITIAL_DIRECTION,
    food: null,
    score: 0,
    status: "ready",
  };

  return {
    ...baseState,
    food: spawnFood(baseState, options.rng),
  };
}

export function startGame(state) {
  if (state.status === "ready" || state.status === "paused") {
    return { ...state, status: "running" };
  }

  return state;
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }

  if (state.status === "paused" || state.status === "ready") {
    return { ...state, status: "running" };
  }

  return state;
}

export function restartGame(state, rng = Math.random) {
  return createInitialState({ gridSize: state.gridSize, rng });
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  const activeDirection = state.queuedDirection ?? state.direction;
  const isReversal =
    state.snake.length > 1 &&
    OPPOSITE_DIRECTIONS[activeDirection] === nextDirection;

  if (isReversal) {
    return state;
  }

  return { ...state, queuedDirection: nextDirection };
}

export function spawnFood(state, rng = Math.random) {
  const openCells = [];
  const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));

  for (let y = 0; y < state.gridSize; y += 1) {
    for (let x = 0; x < state.gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const randomValue = Math.max(0, Math.min(0.999999, rng()));
  const index = Math.floor(randomValue * openCells.length);
  return openCells[index];
}

export function stepGame(state, rng = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.queuedDirection ?? state.direction;
  const vector = DIRECTION_VECTORS[direction];
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + vector.x,
    y: currentHead.y + vector.y,
  };

  if (isOutOfBounds(nextHead, state.gridSize)) {
    return {
      ...state,
      direction,
      queuedDirection: direction,
      status: "gameover",
    };
  }

  const willEat = positionsEqual(nextHead, state.food);
  const occupiedSegments = willEat ? state.snake : state.snake.slice(0, -1);

  if (occupiedSegments.some((segment) => positionsEqual(segment, nextHead))) {
    return {
      ...state,
      direction,
      queuedDirection: direction,
      status: "gameover",
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEat) {
    nextSnake.pop();
  }

  const nextState = {
    ...state,
    snake: nextSnake,
    direction,
    queuedDirection: direction,
    score: willEat ? state.score + 1 : state.score,
    status: "running",
  };

  if (!willEat) {
    return nextState;
  }

  const food = spawnFood(nextState, rng);
  if (!food) {
    return { ...nextState, food: null, status: "won" };
  }

  return { ...nextState, food };
}

function isOutOfBounds(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}
