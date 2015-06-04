# Abacus
A combinatorics library for Node/JS, PHP, Python, ActionScript

(php/python implementations in progress)

**version 0.1**

![abacus combinatorial numbers](/abacus.jpg)

[Abacus.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.js),  [Abacus.min.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.min.js)


Abacus is a small library containing methods and associated math utilities for (fast) combinatorial scientific computation. It builds on (and extends) a [previous project for PHP, Simulacra](https://github.com/foo123/Simulacra).

Abacus uses (for the most part) self-contained and standalone methods, so they can be easily copy-pasted in other projects, in case only a few methods are needed and not the whole library.


**see also:**  

* [Contemplate](https://github.com/foo123/Contemplate) a fast and light-weight Template Engine for Node/JS, PHP, Python
* [Tao](https://github.com/foo123/Tao.js) A simple, tiny, isomorphic, precise and fast template engine for handling both string and live dom based templates
* [ModelView](https://github.com/foo123/modelview.js) a light-weight and flexible MVVM framework for JavaScript/HTML5
* [ModelView MVC jQueryUI Widgets](https://github.com/foo123/modelview-widgets) plug-n-play, state-full, full-MVC widgets for jQueryUI using modelview.js (e.g calendars, datepickers, colorpickers, tables/grids, etc..) (in progress)
* [Dromeo](https://github.com/foo123/Dromeo) a flexible, agnostic router for Node/JS, PHP, Python, ActionScript
* [PublishSubscribe](https://github.com/foo123/PublishSubscribe) a simple and flexible publish-subscribe pattern implementation for Node/JS, PHP, Python, ActionScript
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for Node/JS, PHP, Python, ActionScript
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support) for PHP, Python, Node/JS, ActionScript
* [Dialect](https://github.com/foo123/Dialect) a simple cross-platform SQL construction for PHP, Python, Node/JS, ActionScript (in progress)
* [Simulacra](https://github.com/foo123/Simulacra) a simulation, algebraic, probability and combinatorics PHP package for scientific computations
* [Asynchronous](https://github.com/foo123/asynchronous.js) a simple manager for async, linearised, parallelised, interleaved and sequential tasks for JavaScript

###Contents

* [Example API](#example-api)
* [Tests](#tests)
* [Performance](#performance)
* [Todo](#todo)


###Example API

**(javascript)**

```javascript
var isNode = 'undefined' !== typeof global && '[object global]' === {}.toString.call(global);
var Abacus = isNode ? require('../src/js/Abacus.js') : window.Abacus, echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once
var p, c, perm;
var arr = ["a","b","c"];

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");


echo("\n\n");
echo('Abacus.Permutations');
echo('---');

// Permutations
echo('perm = Abacus.Permutation(4)');
perm = Abacus.Permutation(4);

echo('perm.total()'); 
echo(perm.total());
//
//output 6 = 3!:
//6

echo('perm.next()'); 
echo(perm.next());
//
//output:
//[0,1,2]


echo('perm.hasNext()');
echo(perm.hasNext());
echo('perm.next()');
echo(perm.next());
//
//output:
//true
//[0,2,1]


/*echo('perm.all()');
echo(perm.all());*/
perm.rewind();
while (perm.hasNext()) 
    echo([
    p=perm.next(), 
    c=Abacus.Permutation.index(p,4),
    Abacus.Permutation.item(c,4)
    ]);
//
//output (in index-lexicographic order):
//[
//[0,1,2]
//[0,2,1]
//[1,0,2]
//[1,2,0]
//[2,0,1]
//[2,1,0]
//]

echo('perm.forward()');
echo('while (perm.hasPrev()) echo(perm.prev())');
perm.forward();
while (perm.hasPrev()) 
    echo([
    p=perm.prev(), 
    c=Abacus.Permutation.index(p,4)
    ]);
//
// output
/*
[ 2, 1, 0 ]
[ 2, 0, 1 ]
[ 1, 2, 0 ]
[ 1, 0, 2 ]
[ 0, 2, 1 ]
[ 0, 1, 2 ]
*/


echo('perm.random()');
echo(perm.random());
//
//sample output:
//[2,0,1]

// dispose
echo('perm.dispose()');
perm.dispose();

echo('perm = Abacus.Permutation(15)');
perm = Abacus.Permutation(15);

echo('perm.total()'); 
echo(perm.total());

echo('get just last 5 permutations'); 
echo('perm.range(-5,-1)');
echo(perm.range(-5,-1));


// permute an array, using a permutation
echo('permute an array, using a permutation');
echo('Abacus.Permutation.permute(["a","b","c"], [2,0,1])');
echo(Abacus.Permutation.permute(["a","b","c"], [2,0,1]));
//
//sample  output:
//["c","a","b"]

echo('Abacus.Permutation.shuffle(["a","b","c"])');
echo(Abacus.Permutation.shuffle(["a","b","c"]));
//
//sample  output:
//["b","c","a"]

// compute inverse permutation (http://mathworld.wolfram.com/InversePermutation.html)
echo('compute inverse permutation');
echo('Abacus.Permutation.inverse([2,7,4,9,8,3,5,0,6,1], 10)');
echo(Abacus.Permutation.inverse([2,7,4,9,8,3,5,0,6,1], 10));
//
//output:
//[ 2, 7, 4, 9, 8, 3, 5, 0, 6, 1 ]
//[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]

// factor permutation into cycles
echo('factor permutation into cycles');
echo('Abacus.Permutation.toCycles([2,7,5,6,3,0,4,1], 8)');
echo(Abacus.Permutation.toCycles([2,7,5,6,3,0,4,1], 8));
//
//output:
//[ [0,2,5], [1,7], [3,6,4] ]

echo('Abacus.Permutation.toCycles([5,4,1,3,2,0], 6)');
echo(Abacus.Permutation.toCycles([5,4,1,3,2,0], 6));
//
//output:
//[ [0,5], [1,4,2], [3] ]

echo('Abacus.Permutation.fromCycles([ [0,5], [1,4,2], [3] ], 6)');
echo(Abacus.Permutation.fromCycles([ [0,5], [1,4,2], [3] ], 6));
//
//output:
//[5,4,1,3,2,0]

// factor permutation into swaps
echo('factor permutation into swaps');
echo('Abacus.Permutation.toSwaps([2,7,5,6,3,0,4,1], 8)');
echo(Abacus.Permutation.toSwaps([2,7,5,6,3,0,4,1], 8));
//
//output:
//[ [0,5], [0,2], [1,7], [3,4], [3,6] ]

// permutation from swaps
echo('permutation from swaps');
echo('Abacus.Permutation.fromSwaps([ [0,5], [0,2], [1,7], [3,4], [3,6] ], 8)');
echo(Abacus.Permutation.fromSwaps([ [0,5], [0,2], [1,7], [3,4], [3,6] ], 8));
//
//output:
//[2,7,5,6,3,0,4,1]

// permutation to permutation matrix
echo('permutation to permutation matrix');
echo('Abacus.Permutation.toMatrix([2,0,1], 3)');
echo(Abacus.Permutation.toMatrix([2,0,1], 3));
//
//output:
//[ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]

// permutation matrix to permutation
echo('permutation matrix to permutation');
echo('Abacus.Permutation.fromMatrix([ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ], 3)');
echo(Abacus.Permutation.fromMatrix([ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]/*[ [ 0, 1, 0 ], [ 0, 0, 1 ], [ 1, 0, 0 ] ]*/, 3));
//
//output:
//[2,0,1]
```

**output** (see `test/permutations.js`)

```text
Note: Due to the large number of combinatorial samples,
Abacus combinatorics use an Iterator pattern to succesively and consistently
generate all combinatorial objects without storing all of them in memory at once






Abacus.Permutations
---
perm = Abacus.Permutation(4)
perm.total()
24
perm.next()
[ 0, 1, 2, 3 ]
perm.hasNext()
true
perm.next()
[ 0, 1, 3, 2 ]
[ [ 0, 1, 2, 3 ], 0, [ 0, 1, 2, 3 ] ]
[ [ 0, 1, 3, 2 ], 1, [ 0, 1, 3, 2 ] ]
[ [ 0, 2, 1, 3 ], 2, [ 0, 2, 1, 3 ] ]
[ [ 0, 2, 3, 1 ], 3, [ 0, 2, 3, 1 ] ]
[ [ 0, 3, 1, 2 ], 4, [ 0, 3, 1, 2 ] ]
[ [ 0, 3, 2, 1 ], 5, [ 0, 3, 2, 1 ] ]
[ [ 1, 0, 2, 3 ], 6, [ 1, 0, 2, 3 ] ]
[ [ 1, 0, 3, 2 ], 7, [ 1, 0, 3, 2 ] ]
[ [ 1, 2, 0, 3 ], 8, [ 1, 2, 0, 3 ] ]
[ [ 1, 2, 3, 0 ], 9, [ 1, 2, 3, 0 ] ]
[ [ 1, 3, 0, 2 ], 10, [ 1, 3, 0, 2 ] ]
[ [ 1, 3, 2, 0 ], 11, [ 1, 3, 2, 0 ] ]
[ [ 2, 0, 1, 3 ], 12, [ 2, 0, 1, 3 ] ]
[ [ 2, 0, 3, 1 ], 13, [ 2, 0, 3, 1 ] ]
[ [ 2, 1, 0, 3 ], 14, [ 2, 1, 0, 3 ] ]
[ [ 2, 1, 3, 0 ], 15, [ 2, 1, 3, 0 ] ]
[ [ 2, 3, 0, 1 ], 16, [ 2, 3, 0, 1 ] ]
[ [ 2, 3, 1, 0 ], 17, [ 2, 3, 1, 0 ] ]
[ [ 3, 0, 1, 2 ], 18, [ 3, 0, 1, 2 ] ]
[ [ 3, 0, 2, 1 ], 19, [ 3, 0, 2, 1 ] ]
[ [ 3, 1, 0, 2 ], 20, [ 3, 1, 0, 2 ] ]
[ [ 3, 1, 2, 0 ], 21, [ 3, 1, 2, 0 ] ]
[ [ 3, 2, 0, 1 ], 22, [ 3, 2, 0, 1 ] ]
[ [ 3, 2, 1, 0 ], 23, [ 3, 2, 1, 0 ] ]
perm.forward()
while (perm.hasPrev()) echo(perm.prev())
[ [ 3, 2, 1, 0 ], 23 ]
[ [ 3, 2, 0, 1 ], 22 ]
[ [ 3, 1, 2, 0 ], 21 ]
[ [ 3, 1, 0, 2 ], 20 ]
[ [ 3, 0, 2, 1 ], 19 ]
[ [ 3, 0, 1, 2 ], 18 ]
[ [ 2, 3, 1, 0 ], 17 ]
[ [ 2, 3, 0, 1 ], 16 ]
[ [ 2, 1, 3, 0 ], 15 ]
[ [ 2, 1, 0, 3 ], 14 ]
[ [ 2, 0, 3, 1 ], 13 ]
[ [ 2, 0, 1, 3 ], 12 ]
[ [ 1, 3, 2, 0 ], 11 ]
[ [ 1, 3, 0, 2 ], 10 ]
[ [ 1, 2, 3, 0 ], 9 ]
[ [ 1, 2, 0, 3 ], 8 ]
[ [ 1, 0, 3, 2 ], 7 ]
[ [ 1, 0, 2, 3 ], 6 ]
[ [ 0, 3, 2, 1 ], 5 ]
[ [ 0, 3, 1, 2 ], 4 ]
[ [ 0, 2, 3, 1 ], 3 ]
[ [ 0, 2, 1, 3 ], 2 ]
[ [ 0, 1, 3, 2 ], 1 ]
[ [ 0, 1, 2, 3 ], 0 ]
perm.random()
[ 2, 3, 0, 1 ]
perm.dispose()
perm = Abacus.Permutation(15)
perm.total()
1307674368000
get just last 5 permutations
perm.range(-5,-1)
[ [ 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 0, 2, 1 ],
  [ 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 0, 2 ],
  [ 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 2, 0 ],
  [ 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 0, 1 ],
  [ 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ] ]
permute an array, using a permutation
Abacus.Permutation.permute(["a","b","c"], [2,0,1])
[ 'c', 'a', 'b' ]
Abacus.Permutation.shuffle(["a","b","c"])
[ 'a', 'c', 'b' ]
compute inverse permutation
Abacus.Permutation.inverse([2,7,4,9,8,3,5,0,6,1], 10)
[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]
factor permutation into cycles
Abacus.Permutation.toCycles([2,7,5,6,3,0,4,1], 8)
[ [ 0, 2, 5 ], [ 1, 7 ], [ 3, 6, 4 ] ]
Abacus.Permutation.toCycles([5,4,1,3,2,0], 6)
[ [ 0, 5 ], [ 1, 4, 2 ], [ 3 ] ]
Abacus.Permutation.fromCycles([ [0,5], [1,4,2], [3] ], 6)
[ 5, 4, 1, 3, 2, 0 ]
factor permutation into swaps
Abacus.Permutation.toSwaps([2,7,5,6,3,0,4,1], 8)
[ [ 0, 5 ], [ 0, 2 ], [ 1, 7 ], [ 3, 4 ], [ 3, 6 ] ]
permutation from swaps
Abacus.Permutation.fromSwaps([ [0,5], [0,2], [1,7], [3,4], [3,6] ], 8)
[ 2, 7, 5, 6, 3, 0, 4, 1 ]
permutation to permutation matrix
Abacus.Permutation.toMatrix([2,0,1], 3)
[ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ]
permutation matrix to permutation
Abacus.Permutation.fromMatrix([ [ 0, 0, 1 ], [ 1, 0, 0 ], [ 0, 1, 0 ] ], 3)
[ 2, 0, 1 ]
```

###Tests

see: `test/test.bat`

* `test/permutations.js`
* `test/combinations.js`
* `test/combinations_repeats.js`
* `test/powersets.js`
* `test/partitions.js`


###Performance

most algorithms are linear (or log-linear) time algorithms and the author hopes to remain so


###Todo

* add ranking / unranking algorithms and associated methods (preferably of O(n) or O(nlgn) complexity) both for lexicographic order, random order and reverse-lexicographic order (IN PROGRESS)
* add `Derangement`, `RestrictedPartition` [IN PROGRESS]
* add `Combinadic`, `Factoradic` transformations [DONE]
* add `Fibonacci`, `Catalan`, `Bell` number computations [IN PROGRESS]
* make sure the `.random` methods uniformly and unbiasedly sample the combinatorial object space (Partition.random is not unbiased right now, in progress)
* allow iterator pattern to produce unique and uniform random ordering traversals for all combinatorial objects, so that the space of a combinatorial object can be traversed in any random ordering uniquely and unbiasedly (useful in some applications, eg backracking) (IN PROGRESS)
