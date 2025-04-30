
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
  
  // Step 1: Apply gravity - initial falling of boxes
  result = applyGravity(result);
  
  // Step 2: Identify explosions
  const explosions = identifyExplosions(result);
  
  // Step 3: Apply explosions if any were found
  if (explosions.length > 0) {
    result = applyExplosions(result, explosions);
    // Step 4: Reapply gravity after explosions
    result = applyGravity(result);
  }
  
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
    let nextPosition = rows - 1; // Start from the bottom row
    
    // Scan from bottom to top
    for (let row = rows - 1; row >= 0; row--) {
      if (result[row][col] === '#') {
        // Found a box
        result[row][col] = '-'; // Remove from current position
        
        // Find the next available position to place the box
        while (nextPosition >= 0 && (result[nextPosition][col] === '#' || result[nextPosition][col] === '*')) {
          nextPosition--;
        }
        
        if (nextPosition >= 0) {
          // Place the box at the next available position
          result[nextPosition][col] = '#';
          nextPosition--; // Update the next position
        } else {
          // If no position is available, the box disappears (shouldn't normally happen)
          continue;
        }
      } else if (result[row][col] === '*') {
        // Reset the next position to be above this obstacle
        nextPosition = row - 1;
      }
    }
  }
  
  return result;
}

/**
 * Identify explosions by finding obstacles with boxes directly above them
 */
function identifyExplosions(board: string[][]): [number, number][] {
  const rows = board.length;
  const cols = board[0].length;
  const explosions: [number, number][] = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === '*') {
        // Check if there's a box directly above the obstacle
        if (row > 0 && board[row - 1][col] === '#') {
          explosions.push([row, col]);
        }
      }
    }
  }
  
  return explosions;
}

/**
 * Apply explosions to the board
 */
function applyExplosions(board: string[][], explosions: [number, number][]): string[][] {
  const rows = board.length;
  const cols = board[0].length;
  const result = board.map(row => [...row]);
  
  // Create a set to track cells affected by explosions
  const affectedCells = new Set<string>();
  
  // Mark all cells affected by explosions
  for (const [row, col] of explosions) {
    // Check 3x3 grid centered on the obstacle
    for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        affectedCells.add(`${r},${c}`);
      }
    }
  }
  
  // Remove boxes in affected cells
  for (const cellKey of affectedCells) {
    const [r, c] = cellKey.split(',').map(Number);
    if (result[r][c] === '#') {
      result[r][c] = '-';
    }
  }
  
  return result;
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
  
  if (!areEqual(result, expected)) {
    console.log("\nExpected:");
    printBoard(expected);
  }
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
