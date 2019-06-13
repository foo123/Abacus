# Combinatorial Solutions to Popular Problems using Abacus


The solutions, to popular problems, below exhibit the combinatorial and number theoretic capabilities, for solving complex combinatorial and number theoretic problems, of `Abacus` library. Sometimes a solution is found by exhaustive search, other times better than full exhaustive search can be achieved and other times the solution does not require search at all but simply smart composition and manipulation of appropriate combinatorial objects and functions.


### Contents

* [N-Queens Problem](#n-queens)
* [Magic Squares](#magic-squares)
* [Primes](#primes)
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
solutions = Abacus.Combination(N*N, N).mapTo(row_column).filterBy(is_valid).get().map(make_grid);

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
solutions = Abacus.Permutation(N).mapTo(row_column_perm).filterBy(is_valid).get().map(make_grid);

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
solutions = Abacus.Permutation(N*N).mapTo(square).filterBy(Abacus.MagicSquare.isMagic).get();

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
solutions = Abacus.Permutation(N).juxtaposeWith(Abacus.Permutation(N)).get().reduce(function(solutions, permutation){
    var permuted = permute_rows_cols(square, permutation[0], permutation[1]);
    if ( Abacus.MagicSquare.isMagic(permuted) ) solutions.push(permuted);
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

### Primes

[Prime Number, wikipedia](https://en.wikipedia.org/wiki/Prime_number)

see associated file: `examples/primes.js`

Prime Numbers are very important outside number theory itself. For example they are central to cryptography and secure HTTP protocol which we use every day. Also it is fun as well as difficult problem. So let's try to tackle it.

**Note** since prime numbers, and generally number theoretic computations, can be very large numbers it is better to plug-in a big integer arithmetic in `Abacus`. We do this (using, for example, [BigInteger.js](https://github.com/peterolson/BigInteger.js)) for this example to be on the safe side (see associated example file).


**Exhaustive Search**

First of all we can generate all prime numbers up to some limit simply by exhaustive search, provided we have some method to check if a given number is prime (see `Abacus.Math.isPrime` and `Abacus.Math.isProbablePrime`), so let's start with that.
We use an infinite arithmetic progression which enumerates all numbers `>= 1` and check if each one is prime and return it.

```javascript
primes = Abacus.Progression(1 /*start*/, 1 /*step*/, Abacus.Arithmetic.INF /*end*/).filterBy(Abacus.Math.isPrime).get(N);
```

For `N=100` (first 100 primes) we get:

```text
2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541
```

We can be a **little more efficient** and **check only odd numbers** for primality (since, except `2`, **all other primes are odd**). Let's implement this new exhaustive search with two arithmetic progressions one constant (`2`) and one infinite for all odd numbers `>= 3`).

```javascript
primes = Abacus.Iterator([Abacus.Progression(2, 0, 2)/*only 2*/, Abacus.Progression(3, 2, Abacus.Arithmetic.INF)/*odds >= 3*/]).filterBy(Abacus.Math.isPrime).get(N);
```

For this new exhaustive search for `N=100` (first 100 primes) we get again:

```text
2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541
```

**Prime Sieve**

We can be **even more efficient** and generate prime numbers directly **without using `isPrime`** (which can be inefficient if used over and over) using a Sieve (eg [Prime Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes)). Let's do that:

```javascript
primes = Abacus.PrimeSieve().get(N);
```

For `N=100` (first 100 primes) again we get:

```text
2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541
```

We can even generate all prime numbers less than a given prime. For example let's count how many primes are `< 1000000`. Easy.

```javascript
count = Abacus.PrimeSieve().get(function( prime ){ return Abacus.Arithmetic.lt(prime, 1000000); }).length;
```
We get `78498` primes less than `1000000`.


**Primes in ranges**

There is still another way to generate sequences of primes with `Abacus` which is somewhat slower but more versatile (for example it can generate all primes in an arbitrary range). The trick is to use `Abacus.Math.nextPrime` function. Let's see that in action.

```javascript
function prime_sequence( p, N )
{
    p = Abacus.Arithmetic.num(p)
    var primes = Abacus.Math.isPrime(p) ? [p] : [];
    while( primes.length < N )
    {
        // get next prime from value of previous run and also store it as current value
        primes.push( p=Abacus.Math.nextPrime(p) );
    }
    return primes;
}
echo(prime_sequence(1, N).map(String).join(','));
```

We again get, starting from 1 and getting up to N=100 primes (first 100 primes):

```text
2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541
```

Internaly `nextPrime` does something **similar to exhaustive search**, so its efficiency is similar to exhaustive search. The benefit is that it **can start at an arbitrary starting point** and find the next prime from that point on.


**Mirror-image Primes**

Now let's try something more fun. Let us find all primes (up to a limit) which are also their own mirror image. This means primes of the form `d1 d2 .. dk .. d2 d1` (where `di` means digit `i`).

Let's assume we have a function `is_mirror_image` which checks if a certain number is its own mirror image. Then using a prime sieve we can generate all `N` mirror-image primes by:

```javascript
primes = Abacus.PrimeSieve().filterBy(Abacus.Util.is_mirror_image).get(N);
```

For `N=100` (first 100 primes that are also their own mirror image), we get:

```text
2,3,5,7,11,101,131,151,181,191,313,353,373,383,727,757,787,797,919,929,10301,10501,10601,11311,11411,12421,12721,12821,13331,13831,13931,14341,14741,15451,15551,16061,16361,16561,16661,17471,17971,18181,18481,19391,19891,19991,30103,30203,30403,30703,30803,31013,31513,32323,32423,33533,34543,34843,35053,35153,35353,35753,36263,36563,37273,37573,38083,38183,38783,39293,70207,70507,70607,71317,71917,72227,72727,73037,73237,73637,74047,74747,75557,76367,76667,77377,77477,77977,78487,78787,78887,79397,79697,79997,90709,91019,93139,93239,93739,94049
```

We can also follow another approach which is more combinatorial in nature. Generate directly mirror image numbers (for a given number of digits) using a `Tensor` and **then** simply check if the number generated in this way is also prime. Lets do that.

```javascript
function mirror_image_primes( ndigits )
{
    // since we are looking for mirror images which are also primes
    // and primes are odd, this means the first (and last) digits
    // can only be one of [1,3,5,7,9], the rest can be anything.
    var first = '13579', rest = '0123456789';
    
    // odd number of digits
    return Abacus.Tensor(Abacus.Util.array((ndigits>>1)+1, function(i){return 0===i?first.length:rest.length;}))
        .mapTo(make_mirror_image(ndigits, first, rest))
        .filterBy(Abacus.Math.isPrime)
        .get();
}
echo(mirror_image_primes(ndigits).map(String).join(','));
```

To get the 5-digit primes which are their own mirror image, we get running above:

```text
10301,10501,10601,11311,11411,12421,12721,12821,13331,13831,13931,14341,14741,15451,15551,16061,16361,16561,16661,17471,17971,18181,18481,19391,19891,19991,30103,30203,30403,30703,30803,31013,31513,32323,32423,33533,34543,34843,35053,35153,35353,35753,36263,36563,37273,37573,38083,38183,38783,39293,70207,70507,70607,71317,71917,72227,72727,73037,73237,73637,74047,74747,75557,76367,76667,77377,77477,77977,78487,78787,78887,79397,79697,79997,90709,91019,93139,93239,93739,94049,94349,94649,94849,94949,95959,96269,96469,96769,97379,97579,97879,98389,98689
```

**Goldbach's Conjecture**

[Goldbach's Conjecture](https://en.wikipedia.org/wiki/Goldbach%27s_conjecture) states that every even number greater than 2 is the sum of two primes. Let's **prove** the conjecture for the first `N` even numbers. Using our previous `nextPrime` method it is easy.

```javascript
function sum_of_two_primes( n )
{
    var Arithmetic = Abacus.Arithmetic,
        p1 = Arithmetic.div(n, 2), p2 = p1, sum;
    
    if ( Abacus.Math.isPrime(p1) )
        return String(n)+' = '+String(p1)+'+'+String(p2);
    
    p1 = Abacus.Math.nextPrime(p1, -1); p2 = Abacus.Math.nextPrime(p2);
    do{
        sum = Arithmetic.add(p1, p2);
        if ( Arithmetic.equ(sum, n) ) return String(n)+' = '+String(p1)+'+'+String(p2);
        else if ( Arithmetic.lt(sum, n) ) p2 = Abacus.Math.nextPrime(p2);
        else if ( Arithmetic.gt(sum, n) ) p1 = Abacus.Math.nextPrime(p1, -1);
        if ( null == p1 ) return String(n)+' is not the sum of 2 primes!';
    }while(true);
}
results = Abacus.Progression(4, 2, Abacus.Arithmetic.INF).mapTo(sum_of_two_primes).get(N);
```

For the first 25 even numbers greater than 2 we get:

```text
4 = 2+2
6 = 3+3
8 = 3+5
10 = 5+5
12 = 5+7
14 = 7+7
16 = 5+11
18 = 7+11
20 = 7+13
22 = 11+11
24 = 11+13
26 = 13+13
28 = 11+17
30 = 13+17
32 = 13+19
34 = 17+17
36 = 17+19
38 = 19+19
40 = 17+23
42 = 19+23
44 = 13+31
46 = 23+23
48 = 19+29
50 = 19+31
52 = 23+29
```

We saw how we can generate prime numbers up to a given point or in arbitrary ranges, test if a given number is prime, verify Goldbach's Conjecture in a given range and also generate prime numbers which have additional special properties, for example are their own mirror image, with `Abacus` in a couple of lines of code.


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
