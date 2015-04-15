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

echo('Note: Due to the large number of combinatorial samples,');
echo('Abacus combinatorics use an Iterator pattern to succesively and consistently');
echo('generate all combinatorial objects without storing all of them in memory at once');
echo("\n\n");

echo("\n\n");
echo('Abacus.Permutations');
echo('---');

// Permutations
echo('perm = Abacus.Permutation(3)');
var perm = Abacus.Permutation(3);

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

// compute inverse permutation (http://mathworld.wolfram.com/InversePermutation.html)
echo('compute inverse permutation');
echo('p = [2,7,4,9,8,3,5,0,6,1]')
p = [2,7,4,9,8,3,5,0,6,1];
echo('Abacus.Permutation.inverse(10, p)');
echo(Abacus.Permutation.inverse(10, p));
//
//output:
//[ 2, 7, 4, 9, 8, 3, 5, 0, 6, 1 ]
//[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]

// permute an array, using the permutation
echo('permute an array, using the permutation');
echo('arr = ["a","b","c"]');
var arr = ["a","b","c"];
echo('Abacus.Permutation.permute(arr, perm.next())');
echo(Abacus.Permutation.permute(arr, perm.next()));
//
//sample  output:
//["b","a","c"]


echo('perm.rewind()');
perm.rewind();
echo('perm.all()');
echo(perm.all());
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


echo('perm.random()');
echo(perm.random());
//
//sample output:
//[2,0,1]

echo('Abacus.Permutation.shuffle(arr)');
echo(Abacus.Permutation.shuffle(arr));
//
//sample  output:
//["b","c","a"]

// dispose
echo('perm.dispose()');
perm.dispose();


echo("\n\n");
echo('Abacus.Partitions');
echo('---');

// Partitions
echo('part = Abacus.Partition(3)');
var part = Abacus.Partition(3);

echo('part.total()');
echo(part.total());
//
//output 3 = num of (distinct) partitions of 3:
//3


echo('part.next()');
echo(part.next());
//
//output:
//[3]


echo('part.hasNext()');
echo(part.hasNext());
echo('part.next()');
echo(part.next());
//
//output:
//true
//[2,1]


echo('part.rewind()');
part.rewind();
echo('part.all()');
echo(part.all());
//
//output (in index-lexicographic order):
//[
//[3]
//[2,1]
//[1,1,1]
//]


echo('part.random()');
echo(part.random());
//
//sample output:
//[2,1]


// dispose
echo('part.dispose()');
part.dispose();

echo("\n\n");
echo('Abacus.Combinations');
echo('---');

// Combinations
echo('comb = Abacus.Combination(3, 2)');
var comb = Abacus.Combination(3, 2);

echo('comb.total()');
echo(comb.total());
//
//output 3 = num of (distinct) combinations 3!/2!x1!:
//3


echo('comb.next()');
echo(comb.next());
//
//output:
//[0,1]


echo('comb.hasNext()');
echo(comb.hasNext());
echo('comb.next()');
echo(comb.next());
//
//output:
//true
//[0,2]

// choose from array, using the combination
echo('choose from array, using the combination');
echo('arr = ["a","b","c"]');
echo('c = comb.next()');
var arr = ["a","b","c"], c = comb.next();
echo('Abacus.Combination.choose(arr, c)');
echo(Abacus.Combination.choose(arr, c));
echo('c');
echo(c);
echo('Abacus.Combination.complement(3, 2, c)');
echo(Abacus.Combination.complement(3, 2, c));
//
//sample  output:
//["b","c"]
//[1,2]
//[0]

echo('comb.rewind()');
comb.rewind();
echo('comb.all()');
echo(comb.all());
//
//output (in index-lexicographic order):
//[
//[0,1]
//[0,2]
//[1,2]
//]


echo('comb.random()');
echo(comb.random());
//
//sample output:
//[0,2]


// dispose
echo('comb.dispose()');
comb.dispose();


echo("\n\n");
echo('Abacus.PowerSets');
echo('---');

// PowerSets
echo('pset = Abacus.PowerSet(3)');
var pset = Abacus.PowerSet(3);

echo('pset.total()');
echo(pset.total());
//
//output 8 = cardinality of power set 2^3:
//8


echo('pset.next()');
echo(pset.next());
//
//output i.e empty set:
//[]


echo('pset.hasNext()');
echo(pset.hasNext());
echo('pset.next()');
echo(pset.next());
//
//output:
//true
//[0]


echo('pset.rewind()');
pset.rewind();
echo('pset.all()');
echo(pset.all());
//
//output (in index-lexicographic order):
//[
//[]
//[ 0 ]
//[ 1 ]
//[ 1, 0 ]
//[ 2 ]
//[ 2, 0 ]
//[ 2, 1 ]
//[ 2, 1, 0 ]
//]


echo('pset.random()');
echo(pset.random());
//
//sample output:
//[0,2]


// dispose
echo('pset.dispose()');
pset.dispose();
```

**output** (see test/test.js)
```text
Note: Due to the large number of combinatorial samples,
Abacus combinatorics use an Iterator pattern to succesively and consistently
generate all combinatorial objects without storing all of them in memory at once






Abacus.Permutations
---
perm = Abacus.Permutation(3)
perm.total()
6
perm.next()
[ 0, 1, 2 ]
perm.hasNext()
true
perm.next()
[ 0, 2, 1 ]
compute inverse permutation
p = [2,7,4,9,8,3,5,0,6,1]
Abacus.Permutation.inverse(10, p)
[ 7, 9, 0, 5, 2, 6, 8, 1, 4, 3 ]
permute an array, using the permutation
arr = ["a","b","c"]
Abacus.Permutation.permute(arr, perm.next())
[ 'b', 'a', 'c' ]
perm.rewind()
perm.all()
[ [ 0, 1, 2 ],
  [ 0, 2, 1 ],
  [ 1, 0, 2 ],
  [ 1, 2, 0 ],
  [ 2, 0, 1 ],
  [ 2, 1, 0 ] ]
perm.random()
[ 0, 2, 1 ]
Abacus.Permutation.shuffle(arr)
[ 'b', 'c', 'a' ]
perm.dispose()



Abacus.Partitions
---
part = Abacus.Partition(3)
part.total()
3
part.next()
[ 3 ]
part.hasNext()
true
part.next()
[ 2, 1 ]
part.rewind()
part.all()
[ [ 3 ], [ 2, 1 ], [ 1, 1, 1 ] ]
part.random()
[ 2, 1 ]
part.dispose()



Abacus.Combinations
---
comb = Abacus.Combination(3, 2)
comb.total()
3
comb.next()
[ 0, 1 ]
comb.hasNext()
true
comb.next()
[ 0, 2 ]
choose from array, using the combination
arr = ["a","b","c"]
c = comb.next()
Abacus.Combination.choose(arr, c)
[ 'b', 'c' ]
c
[ 1, 2 ]
Abacus.Combination.complement(3, 2, c)
[ 0 ]
comb.rewind()
comb.all()
[ [ 0, 1 ], [ 0, 2 ], [ 1, 2 ] ]
comb.random()
[ 0, 1 ]
comb.dispose()



Abacus.PowerSets
---
pset = Abacus.PowerSet(3)
pset.total()
8
pset.next()
[]
pset.hasNext()
true
pset.next()
[ 0 ]
pset.rewind()
pset.all()
[ [], [ 0 ], [ 1 ], [ 1, 0 ], [ 2 ], [ 2, 0 ], [ 2, 1 ], [ 2, 1, 0 ] ]
pset.random()
[ 1, 0 ]
pset.dispose()
```

###Tests

see test/test.js for some basic tests


###Performance

most algorithms are linear time algorithms and the author hopes to remain so


###Todo

* add ranking / unranking algorithms and associated methods (preferably of O(n) or O(nlgn) complexity) both for lexicographic order, random order and reverse-lexicographic order (IN PROGRESS)
* add Fibonacci, Catalan, Bell number computations
* make sure the .random methods uniformly and unbiasedly sample the combinatorial object space (Partition.random is not unbiased right now, in progress)
* allow iterator pattern to produce unique and uniform random ordering traversals for all combinatorial objects, so that the space of a combinatorial object can be traversed in any random ordering uniquely and unbiasedly (useful in some applications, eg backracking) (IN PROGRESS)
* add Combinadic, Factoradic transformations
