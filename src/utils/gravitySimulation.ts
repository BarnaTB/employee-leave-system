
/**
 * Gravity simulation involving falling boxes and exploding obstacles.
 * 
 * Each cell contains:
 * - '-': Empty cell
 * - '*': Obstacle
 * - '#': Box
 * 
 * Boxes fall down until they hit an obstacle, another grounded box, or the bottom.
 * If a box hits an obstacle, it explodes, destroying itself and any boxes within 
 * eight cells surrounding the obstacle.
 * 
 * @param board The initial state of the board
 * @returns The state of the board after all boxes have fallen
 */
export function gravitySimulation(board: string[][]): string[][] {
  // Create a deep copy of the board to avoid modifying the original
  let result = board.map(row => [...row]);
  const rows = result.length;
  const cols = result[0].length;
  
  // Step 1: Apply gravity - make boxes fall down
  // We need to do this first to determine which boxes will hit obstacles
  result = applyGravity(result);
  
  // Step 2: Find boxes that hit obstacles and mark for explosion
  const explosionMap = findExplosions(result);
  
  // Step 3: Apply explosions to the board
  result = applyExplosions(result, explosionMap);
  
  return result;
}

/**
 * Apply gravity to make all boxes fall down as far as possible
 */
function applyGravity(board: string[][]): string[][] {
  const rows = board.length;
  const cols = board[0].length;
  const result = board.map(row => [...row]);
  
  // Process each column independently
  for (let col = 0; col < cols; col++) {
    // Start from bottom and work upwards
    let emptyRow = rows - 1;
    
    // Find the first empty position from the bottom
    while (emptyRow >= 0 && result[emptyRow][col] !== '-') {
      emptyRow--;
    }
    
    // Scan from bottom to top
    for (let row = rows - 1; row >= 0; row--) {
      if (result[row][col] === '#') {
        // Found a box, move it down to the lowest available position
        result[row][col] = '-'; // Remove from current position
        
        // Find the lowest empty position above an obstacle or the bottom
        while (emptyRow < rows - 1 && 
               result[emptyRow + 1][col] === '-') {
          emptyRow++;
        }
        
        // Place the box at the new position if there's space
        if (emptyRow >= 0) {
          result[emptyRow][col] = '#';
          emptyRow--; // Update the next empty position
        }
      } else if (result[row][col] === '*') {
        // Obstacle - reset the empty row to be above this obstacle
        emptyRow = row - 1;
      }
    }
  }
  
  return result;
}

/**
 * Find all cells that will be affected by explosions
 */
function findExplosions(board: string[][]): boolean[][] {
  const rows = board.length;
  const cols = board[0].length;
  const explosionMap = Array(rows).fill(0).map(() => Array(cols).fill(false));
  
  // Identify obstacles with boxes directly above them
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === '*' && row > 0 && board[row - 1][col] === '#') {
        // Mark the 3x3 grid around the obstacle for explosion
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            explosionMap[r][c] = true;
          }
        }
      }
    }
  }
  
  return explosionMap;
}

/**
 * Apply explosions to the board
 */
function applyExplosions(board: string[][], explosionMap: boolean[][]): string[][] {
  const rows = board.length;
  const cols = board[0].length;
  const result = board.map(row => [...row]);
  
  // Remove boxes in explosion areas
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (explosionMap[row][col] && result[row][col] === '#') {
        result[row][col] = '-';
      }
    }
  }
  
  // Apply gravity again after explosions
  return applyGravity(result);
}

/**
 * Test the gravity simulation with the provided example
 */
export function testGravitySimulation(): void {
  const board = [
    ['#', '-', '#', '#', '*'],
    ['#', '-', '-', '#', '#'],
    ['-', '#', '-', '#', '-'],
    ['-', '-', '#', '-', '#'],
    ['#', '*', '-', '-', '-'],
    ['-', '-', '*', '#', '-']
  ];
  
  console.log("Initial board:");
  printBoard(board);
  
  const result = gravitySimulation(board);
  
  console.log("\nFinal board after simulation:");
  printBoard(result);
  
  // Expected result from the problem statement
  const expected = [
    ['-', '-', '-', '-', '*'],
    ['-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-'],
    ['-', '*', '-', '-', '#'],
    ['#', '-', '*', '-', '#']
  ];
  
  console.log("\nCorrect result? " + areEqual(result, expected));
}

/**
 * Helper function to print the board in a readable format
 */
function printBoard(board: string[][]): void {
  for (const row of board) {
    console.log(row.join(' '));
  }
}

/**
 * Helper function to check if two boards are equal
 */
function areEqual(board1: string[][], board2: string[][]): boolean {
  if (board1.length !== board2.length) return false;
  
  for (let i = 0; i < board1.length; i++) {
    if (board1[i].length !== board2[i].length) return false;
    for (let j = 0; j < board1[i].length; j++) {
      if (board1[i][j] !== board2[i][j]) return false;
    }
  }
  
  return true;
}
