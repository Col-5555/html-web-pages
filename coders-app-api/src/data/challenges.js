// Mock challenge store. Real challenges come from the persistence layer in a
// later assignment; these let the content endpoints return realistic data now.
// Shape matches the create-challenge request from the brief: markdown
// `description`, a `code` object (function_name + per-language code_text +
// inputs), and `tests` (weight + inputs + expected output). Titles/descriptions
// are reused from the coders-app sample challenges.
export const challenges = [
  {
    id: "145",
    title: "Two-sum",
    category: "Data structure",
    level: "Easy",
    description:
      "### Problem Statement\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    code: {
      function_name: "twoSum",
      code_text: [
        { language: "py", text: "def twoSum(nums, target):\n    return []" },
        { language: "js", text: "function twoSum(nums, target) {\n  return [];\n}" },
      ],
      inputs: [
        { name: "nums", type: "array" },
        { name: "target", type: "number" },
      ],
    },
    tests: [
      {
        weight: 0.5,
        inputs: [
          { name: "nums", value: [2, 7, 11, 15] },
          { name: "target", value: 9 },
        ],
        output: [0, 1],
      },
      {
        weight: 0.5,
        inputs: [
          { name: "nums", value: [3, 2, 4] },
          { name: "target", value: 6 },
        ],
        output: [1, 2],
      },
    ],
  },
  {
    id: "146",
    title: "Fibonacci series",
    category: "Data structure",
    level: "Moderate",
    description:
      "### Problem Statement\nThe Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from `0` and `1`. Given `n`, return the `n`-th Fibonacci number.",
    code: {
      function_name: "fib",
      code_text: [
        { language: "py", text: "def fib(n):\n    return 0" },
        { language: "js", text: "function fib(n) {\n  return 0;\n}" },
      ],
      inputs: [{ name: "n", type: "number" }],
    },
    tests: [
      { weight: 0.5, inputs: [{ name: "n", value: 6 }], output: 8 },
      { weight: 0.5, inputs: [{ name: "n", value: 10 }], output: 55 },
    ],
  },
  {
    id: "149",
    title: "Number of islands",
    category: "Graphs",
    level: "Moderate",
    description:
      "### Problem Statement\nGiven an `m x n` 2D grid of `'1'`s (land) and `'0'`s (water), return the number of islands.",
    code: {
      function_name: "numIslands",
      code_text: [
        { language: "py", text: "def numIslands(grid):\n    return 0" },
        { language: "js", text: "function numIslands(grid) {\n  return 0;\n}" },
      ],
      inputs: [{ name: "grid", type: "array" }],
    },
    tests: [
      {
        weight: 1,
        inputs: [
          {
            name: "grid",
            value: [
              ["1", "1", "0"],
              ["1", "0", "0"],
              ["0", "0", "1"],
            ],
          },
        ],
        output: 2,
      },
    ],
  },
  {
    id: "151",
    title: "Factorial",
    category: "Math",
    level: "Hard",
    description:
      "### Problem Statement\nCompute the factorial of a non-negative integer `n`, denoted as `n!`.",
    code: {
      function_name: "factorial",
      code_text: [
        { language: "py", text: "def factorial(n):\n    return 1" },
        { language: "js", text: "function factorial(n) {\n  return 1;\n}" },
      ],
      inputs: [{ name: "n", type: "number" }],
    },
    tests: [{ weight: 0.8, inputs: [{ name: "n", value: 5 }], output: 120 }],
  },
];
