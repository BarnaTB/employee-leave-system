
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
  const result = board.map(row => [...row]);
  const rows = result.length;
  const cols = result[0].length;
  
  // Step 1: Apply gravity (initial falling of boxes)
  applyGravity(result);
  
  // Step 2: Identify explosions and affected cells
  const explosions = findExplosions(result);
  
  // Step 3: Apply explosions if any were found
  if (explosions.length > 0) {
    // Create a set to track cells affected by explosions
    const affectedCells = new Set<string>();
    
    // Mark all cells affected by explosions
    for (const [row, col] of explosions) {
      // Check 3x3 grid centered on the obstacle
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (result[r][c] === '#') {
            // Only mark boxes for removal
            affectedCells.add(`${r},${c}`);
          }
        }
      }
    }
    
    // Remove boxes in affected cells
    for (const cellKey of affectedCells) {
      const [r, c] = cellKey.split(',').map(Number);
      result[r][c] = '-';
    }
    
    // Apply gravity again after explosions
    applyGravity(result);
  }
  
  return result;
}

/**
 * Find obstacles with boxes directly above them that will cause explosions
 */
function findExplosions(board: string[][]): [number, number][] {
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
 * Apply gravity to make all boxes fall down as far as possible.
 * This function modifies the board in-place.
 */
function applyGravity(board: string[][]): void {
  const rows = board.length;
  const cols = board[0].length;
  
  // Process each column independently
  for (let col = 0; col < cols; col++) {
    // Collect all boxes in this column
    const boxes = [];
    
    for (let row = 0; row < rows; row++) {
      if (board[row][col] === '#') {
        boxes.push(row);
        board[row][col] = '-'; // Remove box temporarily
      }
    }
    
    // Place boxes from bottom up
    let currentRow = rows - 1;
    
    while (boxes.length > 0) {
      // If the current cell is empty, place a box
      if (currentRow >= 0 && board[currentRow][col] === '-') {
        board[currentRow][col] = '#';
        boxes.pop(); // Remove one box from our collection
        currentRow--;
      } else if (currentRow >= 0) {
        // Skip occupied cells (obstacles or already placed boxes)
        currentRow--;
      } else {
        // If we've gone above the top of the board, exit the loop
        break;
      }
    }
  }
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
    
    // Debug: Print detailed differences
    console.log("\nDifferences:");
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result[i].length; j++) {
        if (result[i][j] !== expected[i][j]) {
          console.log(`Position [${i},${j}]: Got ${result[i][j]}, Expected ${expected[i][j]}`);
        }
      }
    }
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
