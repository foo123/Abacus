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
var Abacus = require('../src/js/Abacus.js'),
 echo = console.log;

// Note: Due to the large number of combinatorial samples,
// Abacus combinatorics use an Iterator pattern to succesively and consistently
// generate all combinatorial objects without storing all of them in memory at once


// Permutations
var perm = Abacus.Permutation(3);

echo('Permutation(3)');
echo(perm.total());
//
//output 6 = 3!:
//6


echo(perm.next());
//
//output:
//[0,1,2]


echo(perm.hasNext());
echo(perm.next());
//
//output:
//true
//[0,2,1]

// permute an array, using the permutation
var arr = ["a","b","c","d","e"];
echo(Abacus.permute(arr, perm.next()));
//
//sample  output:
//["b","a","c"]


perm.rewind();
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


echo(perm.random());
//
//sample output:
//[2,0,1]


// dispose
perm.dispose();


// Partitions
var part = Abacus.Partition(3);

echo('Partition(3)');
echo(part.total());
//
//output 3 = num of (distinct) partitions of 3:
//3


echo(part.next());
//
//output:
//[3]


echo(part.hasNext());
echo(part.next());
//
//output:
//true
//[2,1]


part.rewind();
echo(part.all());
//
//output (in index-lexicographic order):
//[
//[3]
//[2,1]
//[1,1,1]
//]


echo(part.random());
//
//sample output:
//[2,1]


// dispose
part.dispose();

// Combinations
var comb = Abacus.Combination(3, 2);

echo('Combination(3, 2)');
echo(comb.total());
//
//output 3 = num of (distinct) combinations 3!/2!x1!:
//3


echo(comb.next());
//
//output:
//[0,1]


echo(comb.hasNext());
echo(comb.next());
//
//output:
//true
//[0,2]

// choose from array, using the combination
var arr = ["a","b","c","d","e"];
echo(Abacus.choose(arr, comb.next()));
//
//sample  output:
//["b","c"]

comb.rewind();
echo(comb.all());
//
//output (in index-lexicographic order):
//[
//[0,1]
//[0,2]
//[1,2]
//]


echo(comb.random());
//
//sample output:
//[0,2]


// dispose
comb.dispose();


// PowerSets
var pset = Abacus.PowerSet(3);

echo('PowerSet(3)');
echo(pset.total());
//
//output 8 = cardinality of power set 2^3:
//8


echo(pset.next());
//
//output i.e empty set:
//[]


echo(pset.hasNext());
echo(pset.next());
//
//output:
//true
//[0]


pset.rewind();
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


echo(pset.random());
//
//sample output:
//[0,2]


// dispose
pset.dispose();
```

###Tests

###Performance

###Todo

