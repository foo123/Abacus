# Combinatorial Solutions to Popular Problems using Abacus


The solutions, to popular problems, below exhibit the combinatorial capabilities, for solving complex combinatorial problems, of `Abacus` library. Sometimes a solution is found by exhaustive search, other times better than full exhaustive search can be achieved and other times the solution does not require search at all but simply smart composition and manipulation of appropriate combinatorial objects.


### Contents

* [N-Queens Problem](#n-queens)
* [Magic Squares](#magic-squares)
* [Diophantine Equations](#diophantine-equations)
* [Knapsack Problem](#knapsack)
* [TSP Problem](#tsp)


### N-Queens

[N-Queens Problem, wikipedia](https://en.wikipedia.org/wiki/Eight_queens_puzzle)

see associated file: `examples/n_queens.js`

**Exhaustive Search**

Let's assume we have some utility methods which allow us to check if a certain potential solution configuration is valid `is_valid` and also (we need that as well) a method (`row_column`) to map numeric patterns of combinatorial objects to `(row,column)` pairs on a hypothetical `NxN` grid. Also assume we have a utility method to make a `NxN` square grid with symbols `X` on `(row,col)` positions where a Queen is placed (`make_grid`)

With these utilities available we can start directly using an exhaustive search among all configurations of placing `N` queens on distinct positions on an `NxN` grid.


```javascript
solutions = Abacus.Combination(N*N, N, {output:row_column}).filterBy(is_valid).get().map(make_grid);

echo(''+solutions.length+' Solutions for '+N+' Queens (exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));
```

The above (for `N=4`) gives the following output:

```text
2 Solutions for 4 Queens (exhaustive search):
O X O O
O O O X
X O O O
O O X O
---
O O X O
X O O O
O O O X
O X O O
```

**Reduced Exhaustive Search**

However searching among all combinations as above is inefficient, we can be a little smarter and assume from the beginning that each queen is placed on different row (or column). Then we simply check among all permutations of assigning each queen on a specific (different) column.

```javascript
solutions = Abacus.Permutation(N, {output:row_column_perm}).filterBy(is_valid).get().map(make_grid);

echo(''+solutions.length+' Solutions for '+N+' Queens (reduced exhaustive search):');
echo(solutions.map(print_grid).join("\n---\n"));
```
The above (for `N=4`) gives the following output:

```text
2 Solutions for 4 Queens (reduced exhaustive search):
O X O O
O O O X
X O O O
O O X O
---
O O X O
X O O O
O O O X
O X O O
```

By the way let's **prove** there is **no solution for 3-Queens** using previous method. Piece of cake, simply set `N=3`!

```text
0 Solutions for 3 Queens (reduced exhaustive search):
```

Also let us **prove that the number of distinct solutions to the original 8-Queens problem is 92**. Simply set `N=8` to above procedure.

```text
92 Solutions for 8 Queens (reduced exhaustive search):
```


**Exploiting Symmetries**

If we only need to find one solution, any solution, then there is an interesting connection between **pan-diagonal latin/magic squares** and **n-queens problems**. Specificaly if we have a pan-diagonal latin or magic square of order `N` then we can have (at least) one solution for the `N` Queens problem simply by placing a queen on each cell which contains the symbol/number `s` (whatever we choose that to be) from the available `N` different symbols/numbers.

Since `Abacus` can generate `LatinSquare`s and also generates **pan-diagonal latin squares** by default if possible (for example for `N=5` it is possible), then we can generate a solution to the 5-Queens problem as follows:

```javascript
solutions = [from_latin_square(Abacus.LatinSquare.make(N))];

echo(''+solutions.length+' Solution for '+N+' Queens (pan-diagonal latin square):');
echo(solutions.map(print_grid).join("\n---\n"));
```

For `N=5` we get the following output:

```text
1 Solution for 5 Queens (pan-diagonal latin square):
O O X O O
O O O O X
O X O O O
O O O X O
X O O O O
```

We saw how we can explore and solve the N-Queens problem with a two or three lines of code using `Abacus`.


### Magic Squares

[Magic Square, wikipedia](https://en.wikipedia.org/wiki/Magic_square)

see associated file: `examples/magic_squares.js`

Although `Abacus` can compute magic squares for all orders `N` (except `2`), still it only produces one magic square.
Let's try to find all possible magic squares (including rotated and reflected ones) systematically.


**Exhaustive Search**

First we can try an exhaustive search over all permutations of numbers `1..N^2` arranged in a square grid.

```javascript
solutions = Abacus.Permutation(N*N, {output:square}).filterBy(Abacus.MagicSquare.is_magic).get();

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (exhaustive search):');
echo(solutions.map(print_square).join("\n---\n"));
```

The above for 3x3 magic squares gives:

```text
8 Solutions for 3x3 Magic Squares (exhaustive search):
2 7 6
9 5 1
4 3 8
---
2 9 4
7 5 3
6 1 8
---
4 3 8
9 5 1
2 7 6
---
4 9 2
3 5 7
8 1 6
---
6 1 8
7 5 3
2 9 4
---
6 7 2
1 5 9
8 3 4
---
8 1 6
3 5 7
4 9 2
---
8 3 4
1 5 9
6 7 2
```

By the way, let's **prove** that there are no `2x2` magic squares (under standard definition). It's super easy and fast.
Setting `N=2` we get **zero solutions**:

```text
0 Solutions for 2x2 Magic Squares (exhaustive search):
```

**Limited Search**

Exhaustive search is very inefficient as `N` grows (even for small N such as 4 or 5 we get an enormous search space).
We can try something else. We can generate a magic square (for example using `Abacus.MagicSquare.make(N)`) and try to permute its rows and columns and see if we get different magic squares. This is considerably faster, but might not generate all possible magic squares of order `N`.

Let's try this:

```javascript
square = Abacus.MagicSquare.make(N);
solutions = Abacus.Permutation(N).concatWith(Abacus.Permutation(N)).get().reduce(function(solutions, solution){
    var permuted = permute_rows_cols(square, solution.slice(0,N), solution.slice(N));
    if ( Abacus.MagicSquare.is_magic(permuted) ) solutions.push(permuted);
    return solutions;
}, []);

echo(''+solutions.length+' Solutions for '+N+'x'+N+' Magic Squares (limited search):');
echo(solutions.map(print_square).join("\n---\n"));
```

Setting `N=4` we get:

```text
192 Solutions for 4x4 Magic Squares (limited search):
16  2  3 13
 5 11 10  8
 9  7  6 12
 4 14 15  1
---
16  2  3 13
 9  7  6 12
 5 11 10  8
 4 14 15  1
---
 5 11 10  8
16  2  3 13
 4 14 15  1
 9  7  6 12
---
 5 11 10  8
 4 14 15  1
16  2  3 13
 9  7  6 12
---
..etc..
```

Setting `N=6` we get 1440 solutions with our limited search.

We saw how we can investigate properties of magic squares and also enumerate them efficiently using a few lines of code with `Abacus`.

### Diophantine Equations

[Diophantine Equation, wikipedia](https://en.wikipedia.org/wiki/Diophantine_equation)

see associated file: `examples/diophantine.js`

**to be added**


### Knapsack

[Knapsack Problem, wikipedia](https://en.wikipedia.org/wiki/Knapsack_problem)

see associated file: `examples/knapsack.js`

**to be added**


### TSP

[Travelling Salesman Problem, wikipedia](https://en.wikipedia.org/wiki/Travelling_salesman_problem)

see associated file: `examples/tsp.js`

**to be added**
