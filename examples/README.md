# Combinatorial Solutions to Popular Problems using Abacus


The solutions, to popular problems, below exhibit the combinatorial capabilities of solving complex combinatorial problems of `Abacus`. Sometimes a solution is found by exhaustive search, other times better than full exhaustive search can be achieved and other times the solution does not require search at all but simply smart composition and manipulation of appropriate combinatorial objects.


### Contents

* [N-Queens Problem](#n-queens)
* [Knapsack Problem](#knapsack)
* [TSP Problem](#tsp)


### N-Queens

[N-Queens Problem, wikipedia](https://en.wikipedia.org/wiki/Eight_queens_puzzle)

see associated file: `examples/n_queens.js`

**Exhaustive Search**

Let's assume we have some utility methods which allow us to check if a certain potential solution configuration is valid `isValid` and also (we need that as well) a method (`toRowColumn`) to map numeric patterns of combinatorial objects to `(row,column)` pairs on a hypothetical `NxN` grid.

With these utitlities available we can start directly using an exhaustive search among all configurations of placing `N` queens on distinct positions on an `NxN` grid.


```javascript
o = Abacus.Combination(N*N, N, {output:toRowColumn}).filterBy(isValid);

echo(''+N+' Queens solutions (exhaustive search): START');
for(let solution of o) echo(solution);
echo(''+N+' Queens solutions (exhaustive search): END');
```

The above (for `N=4`) gives the following output:

```text
4 Queens solutions (exhaustive search): START
[ [ 0, 1 ], [ 1, 3 ], [ 2, 0 ], [ 3, 2 ] ]
[ [ 0, 2 ], [ 1, 0 ], [ 2, 3 ], [ 3, 1 ] ]
4 Queens solutions (exhaustive search): END
```

**Reduced Exhaustive Search**

However searching among all combinations is inefficient, we can be a little smarter and assume from the beginning that each queen is placed on different row (or column). Then we simply check among all permutations of assigning each queen on a specific (different) column.

```javascript
o = Abacus.Permutation(N, {output:toRowColumnP}).filterBy(isValid);

echo(''+N+' Queens solutions (reduced exhaustive search): START');
for(let solution of o) echo(solution);
echo(''+N+' Queens solutions (reduced exhaustive search): END');
```
The above (for `N=4`) gives the following output:

```text
4 Queens solutions (reduced exhaustive search): START
[ [ 0, 1 ], [ 1, 3 ], [ 2, 0 ], [ 3, 2 ] ]
[ [ 0, 2 ], [ 1, 0 ], [ 2, 3 ], [ 3, 1 ] ]
4 Queens solutions (reduced exhaustive search): END
```

**Exploiting Symmetries**

If we only need to find one solution, then there is an interesting connection between **pan-diagonal latin/magic squares** and **n-queens problems**. Specificaly if we have a pan-diagonal latin or magic square of order `N` then we can have (at least) one solution for the `N` Queens problem simply by placing a queen on each cell which contains only the symbol/number `s` (whatever we choose to be).

Since `Abacus` can generate `LatinSquares` and also will try to generate pan-diagonal latin squares if possible (for example for `N=5` it is possible), then we can generate a solution to the 5-Queens problem as follows:

```javascript
o = Abacus.LatinSquare.make(N);
echo(''+N+' Queens solution (pan-diagonal latin square): START');
o.forEach(function(oi){echo(oi.map(function(x){ return N===x ? 'X' : 'O'}).join(' '));});
echo(''+N+' Queen solutions (pan-diagonal latin square): END');
```

For `N=5` we get the following output:

```text
5 Queens solution (pan-diagonal latin square): START
O O X O O
O O O O X
O X O O O
O O O X O
X O O O O
5 Queen solutions (pan-diagonal latin square): END
```

We saw how we can explore and solve the N-Queens problem with a few lines of code using `Abacus` library.


### Knapsack

[Knapsack Problem, wikipedia](https://en.wikipedia.org/wiki/Knapsack_problem)

see associated file: `examples/knapsack.js`

**to be added**


### TSP

[Travelling Salesman Problem, wikipedia](https://en.wikipedia.org/wiki/Travelling_salesman_problem)

see associated file: `examples/tsp.js`

**to be added**
