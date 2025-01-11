// Game state
let board = [];
let selectedPiece = null;
let possibleMoves = [];
let currentPlayer = 'white';
let playerColor = null;
let gameStatus = 'waiting';

// Initialize the board
function initializeBoard() {
  board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }

  // Set up other pieces
  const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], color: 'black' };
    board[7][i] = { type: backRow[i], color: 'white' };
  }
}

// Get piece symbol
function getPieceSymbol(piece) {
  if (!piece) return '';
  
  const symbols = {
    white: {
      pawn: '♙',
      rook: '♖',
      knight: '♘',
      bishop: '♗',
      queen: '♕',
      king: '♔'
    },
    black: {
      pawn: '♟',
      rook: '♜',
      knight: '♞',
      bishop: '♝',
      queen: '♛',
      king: '♚'
    }
  };

  return symbols[piece.color][piece.type];
}

// Get possible moves for a piece
function getPossibleMoves(position) {
  const piece = board[position.y][position.x];
  if (!piece) return [];

  const moves = [];
  
  switch (piece.type) {
    case 'pawn':
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward move
      if (!board[position.y + direction]?.[position.x]) {
        moves.push({ x: position.x, y: position.y + direction });
        
        // Double move from start
        if (position.y === startRow && !board[position.y + 2 * direction]?.[position.x]) {
          moves.push({ x: position.x, y: position.y + 2 * direction });
        }
      }
      
      // Captures
      [-1, 1].forEach(dx => {
        const target = board[position.y + direction]?.[position.x + dx];
        if (target && target.color !== piece.color) {
          moves.push({ x: position.x + dx, y: position.y + direction });
        }
      });
      break;

    case 'rook':
      // Horizontal and vertical moves
      [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
        let x = position.x + dx;
        let y = position.y + dy;
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const target = board[y][x];
          if (!target || target.color !== piece.color) {
            moves.push({ x, y });
          }
          if (target) break;
          x += dx;
          y += dy;
        }
      });
      break;

    case 'knight':
      [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ].forEach(([dx, dy]) => {
        const x = position.x + dx;
        const y = position.y + dy;
        
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const target = board[y][x];
          if (!target || target.color !== piece.color) {
            moves.push({ x, y });
          }
        }
      });
      break;

    case 'bishop':
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dx, dy]) => {
        let x = position.x + dx;
        let y = position.y + dy;
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const target = board[y][x];
          if (!target || target.color !== piece.color) {
            moves.push({ x, y });
          }
          if (target) break;
          x += dx;
          y += dy;
        }
      });
      break;

    case 'queen':
      // Combine rook and bishop moves
      [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ].forEach(([dx, dy]) => {
        let x = position.x + dx;
        let y = position.y + dy;
        
        while (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const target = board[y][x];
          if (!target || target.color !== piece.color) {
            moves.push({ x, y });
          }
          if (target) break;
          x += dx;
          y += dy;
        }
      });
      break;

    case 'king':
      [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ].forEach(([dx, dy]) => {
        const x = position.x + dx;
        const y = position.y + dy;
        
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
          const target = board[y][x];
          if (!target || target.color !== piece.color) {
            moves.push({ x, y });
          }
        }
      });
      break;
  }

  return moves;
}

// Handle square click
function handleSquareClick(x, y) {
  if (gameStatus !== 'playing' || playerColor !== currentPlayer) return;

  const piece = board[y][x];

  if (selectedPiece) {
    if (possibleMoves.some(move => move.x === x && move.y === y)) {
      // Make the move
      board[y][x] = board[selectedPiece.y][selectedPiece.x];
      board[selectedPiece.y][selectedPiece.x] = null;
      
      // Switch turns
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      updateStatus();
    }
    
    selectedPiece = null;
    possibleMoves = [];
  } else if (piece && piece.color === playerColor) {
    selectedPiece = { x, y };
    possibleMoves = getPossibleMoves({ x, y });
  }

  renderBoard();
}

// Render the chess board
function renderBoard() {
  const chessboard = document.getElementById('chessboard');
  chessboard.innerHTML = '';

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const square = document.createElement('div');
      square.className = `square ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
      
      if (selectedPiece?.x === x && selectedPiece?.y === y) {
        square.classList.add('selected');
      }
      
      if (possibleMoves.some(move => move.x === x && move.y === y)) {
        square.classList.add('possible-move');
      }
      
      const piece = board[y][x];
      if (piece) {
        square.textContent = getPieceSymbol(piece);
      }
      
      square.onclick = () => handleSquareClick(x, y);
      chessboard.appendChild(square);
    }
  }
}

// Update game status
function updateStatus() {
  const status = document.getElementById('status');
  if (gameStatus === 'waiting') {
    status.textContent = 'Waiting for opponent...';
  } else if (gameStatus === 'playing') {
    status.textContent = `Current turn: ${currentPlayer === 'white' ? 'White' : 'Black'}`;
    if (playerColor === currentPlayer) {
      status.textContent += ' (Your turn)';
    } else {
      status.textContent += ' (Opponent\'s turn)';
    }
  }
}

// Join game
function joinGame(color) {
  const playerName = document.getElementById('player-name').value.trim();
  if (!playerName) return;

  playerColor = color;
  gameStatus = 'playing';
  
  document.getElementById('join-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  initializeBoard();
  renderBoard();
  updateStatus();
}

// Initialize the game
initializeBoard();
renderBoard();
updateStatus();