// Dummy challenges data (no backend yet).
//
// `description` is markdown (rendered in the workspace's ChallengeDescription)
// and `tests` feeds the workspace's TestCases panel. The home page's
// ChallengesList only reads title/category/difficulty/status/solutionRate, so
// the extra fields don't affect it. `maintainer` mirrors the brief's shape but
// isn't rendered.
export const challenges = [
  {
    id: 145,
    title: "Two-sum",
    category: "Data structure",
    difficulty: "Easy",
    status: "Completed",
    solutionRate: "45%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
Given an array of integers \`nums\` and an integer \`target\`, return indices of
the two numbers such that they add up to \`target\`. You may assume that each
input would have exactly one solution, and you may not use the same element
twice. You can return the answer in any order.

### Example
Input: \`nums = [2,7,11,15]\`, \`target = 9\`
Output: \`[0,1]\`
Explanation: \`nums[0] + nums[1] = 2 + 7 = 9\`, so the answer is \`[0,1]\`.

### Constraints
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.

### Approach
A brute force approach iterates through the array and checks every pair of
elements to see if their sum equals the target — \`O(n^2)\`. A more efficient
approach uses a hash table to store the indices of elements as we iterate, so we
can check if the complement (\`target - current\`) exists in constant time,
reducing the time complexity to \`O(n)\`.`,
    tests: [
      { id: 1, inputText: "[2, 7, 11, 15], 9", outputText: "[0, 1]" },
      { id: 2, inputText: "[3, 2, 4], 6", outputText: "[1, 2]" },
    ],
  },
  {
    id: 146,
    title: "Fibonacci series",
    category: "Data structure",
    difficulty: "Moderate",
    status: "Attempted",
    solutionRate: "45%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
The Fibonacci numbers form a sequence where each number is the sum of the two
preceding ones, starting from \`0\` and \`1\`. Given \`n\`, return the \`n\`-th
Fibonacci number.

### Example
Input: \`n = 6\`
Output: \`8\`
Explanation: The sequence is \`0, 1, 1, 2, 3, 5, 8\`.

### Constraints
- \`0 <= n <= 30\`

### Approach
A naive recursive solution recomputes the same values repeatedly (\`O(2^n)\`).
Use memoization or an iterative bottom-up loop with two running variables for an
\`O(n)\` time, \`O(1)\` space solution.`,
    tests: [
      { id: 1, inputText: "6", outputText: "8" },
      { id: 2, inputText: "10", outputText: "55" },
    ],
  },
  {
    id: 147,
    title: "Skyline problem",
    category: "Data structure",
    difficulty: "Moderate",
    status: "Pending",
    solutionRate: "45%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
Given the locations and heights of buildings, return the *skyline* formed by
these buildings as a list of "key points" — the left endpoint of each horizontal
segment in the silhouette.

### Example
Input: \`[[2,9,10],[3,7,15],[5,12,12]]\`
Output: \`[[2,10],[3,15],[7,12],[12,0]]\`

### Constraints
- \`1 <= buildings.length <= 10^4\`
- Buildings are given as \`[left, right, height]\`.

### Approach
Sweep across the building edges and maintain the current maximum height using a
heap (priority queue). Emit a key point whenever the running maximum height
changes.`,
    tests: [
      {
        id: 1,
        inputText: "[[2,9,10],[3,7,15],[5,12,12]]",
        outputText: "[[2,10],[3,15],[7,12],[12,0]]",
      },
      { id: 2, inputText: "[[0,2,3],[2,5,3]]", outputText: "[[0,3],[5,0]]" },
    ],
  },
  {
    id: 148,
    title: "Course schedule",
    category: "Graphs",
    difficulty: "Hard",
    status: "Pending",
    solutionRate: "22%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
There are \`numCourses\` courses labelled \`0\` to \`numCourses - 1\`. Some
courses have prerequisites given as pairs \`[a, b]\` meaning you must take \`b\`
before \`a\`. Return \`true\` if you can finish all courses.

### Example
Input: \`numCourses = 2\`, \`prerequisites = [[1,0]]\`
Output: \`true\`

### Constraints
- \`1 <= numCourses <= 2000\`

### Approach
This is cycle detection on a directed graph. Use topological sort (Kahn's
algorithm with in-degrees) or DFS with a visited/in-progress marker — if a cycle
exists, the courses can't be completed.`,
    tests: [
      { id: 1, inputText: "2, [[1,0]]", outputText: "true" },
      { id: 2, inputText: "2, [[1,0],[0,1]]", outputText: "false" },
    ],
  },
  {
    id: 149,
    title: "Number of islands",
    category: "Graphs",
    difficulty: "Moderate",
    status: "Completed",
    solutionRate: "38%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
Given an \`m x n\` 2D grid of \`'1'\`s (land) and \`'0'\`s (water), return the
number of islands. An island is surrounded by water and is formed by connecting
adjacent lands horizontally or vertically.

### Example
Input:
\`\`\`
[["1","1","0"],
 ["1","0","0"],
 ["0","0","1"]]
\`\`\`
Output: \`2\`

### Constraints
- \`1 <= m, n <= 300\`

### Approach
Scan every cell; when you hit unvisited land, run a flood fill (DFS or BFS) to
sink the whole island, and increment the count.`,
    tests: [
      {
        id: 1,
        inputText: '[["1","1","0"],["1","0","0"],["0","0","1"]]',
        outputText: "2",
      },
      { id: 2, inputText: '[["0","0"],["0","0"]]', outputText: "0" },
    ],
  },
  {
    id: 150,
    title: "Design a SQL index",
    category: "Databases",
    difficulty: "Hard",
    status: "Attempted",
    solutionRate: "12%",
    maintainer: "Goerge Harvy",
    description: `### Problem Statement
Design a data structure that behaves like a database index: it should support
inserting key/row pairs and returning the rows whose key falls within a given
range \`[low, high]\`, in sorted order.

### Example
Insert \`(5, "a")\`, \`(1, "b")\`, \`(3, "c")\`; query range \`[1, 3]\`.
Output: \`["b", "c"]\`

### Constraints
- Keys are integers; ranges are inclusive.

### Approach
A balanced binary search tree (or a B-tree, as real databases use) keeps keys
ordered and supports \`O(log n)\` insertion and efficient range scans by an
in-order traversal between the two bounds.`,
    tests: [
      { id: 1, inputText: "insert(5,'a'),(1,'b'),(3,'c'); range(1,3)", outputText: "['b', 'c']" },
      { id: 2, inputText: "insert(2,'x'); range(5,9)", outputText: "[]" },
    ],
  },
];
