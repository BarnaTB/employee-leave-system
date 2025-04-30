
import { gravitySimulation, testGravitySimulation } from './gravitySimulation';

// Run the test with the example from the problem statement
testGravitySimulation();

// You can also add your own test cases here
const customBoard = [
  ['#', '-', '#'],
  ['-', '*', '-'],
  ['#', '#', '#']
];

console.log("\nTesting custom board:");
const customResult = gravitySimulation(customBoard);
console.log("\nCustom board result:");
for (const row of customResult) {
  console.log(row.join(' '));
}
