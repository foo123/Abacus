# Abacus
A combinatorics library for Node/JS, PHP, Python, ActionScript

**update in progress do not use**


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
* [Dialect](https://github.com/foo123/Dialect) a simple cross-platform SQL construction for PHP, Python, Node/JS
* [Simulacra](https://github.com/foo123/Simulacra) a simulation, algebraic, probability and combinatorics PHP package for scientific computations
* [Asynchronous](https://github.com/foo123/asynchronous.js) a simple manager for async, linearised, parallelised, interleaved and sequential tasks for JavaScript

###Contents

* [Example API](#example-api)
* [Tests](#tests)
* [Performance](#performance)
* [Todo](#todo)


###Example API

**output** (see `test/combinations.js`)

```text
Note: Due to the large number of combinatorial samples,
Abacus combinatorics use an Iterator pattern to succesively and consistently
generate all combinatorial objects without storing all of them in memory at once


Abacus.Combinations
---
o = Abacus.Combination(6,3)
o.total()
20
o.next()
[ 0, 1, 2 ]
o.hasNext()
true
o.next()
[ 0, 1, 3 ]
o.rewind()
[ 0, 1, 2 ]
[ 0, 1, 3 ]
[ 0, 1, 4 ]
[ 0, 1, 5 ]
[ 0, 2, 3 ]
[ 0, 2, 4 ]
[ 0, 2, 5 ]
[ 0, 3, 4 ]
[ 0, 3, 5 ]
[ 0, 4, 5 ]
[ 1, 2, 3 ]
[ 1, 2, 4 ]
[ 1, 2, 5 ]
[ 1, 3, 4 ]
[ 1, 3, 5 ]
[ 1, 4, 5 ]
[ 2, 3, 4 ]
[ 2, 3, 5 ]
[ 2, 4, 5 ]
[ 3, 4, 5 ]
o.order("revlex")
[ 3, 4, 5 ]
[ 2, 4, 5 ]
[ 2, 3, 5 ]
[ 2, 3, 4 ]
[ 1, 4, 5 ]
[ 1, 3, 5 ]
[ 1, 3, 4 ]
[ 1, 2, 5 ]
[ 1, 2, 4 ]
[ 1, 2, 3 ]
[ 0, 4, 5 ]
[ 0, 3, 5 ]
[ 0, 3, 4 ]
[ 0, 2, 5 ]
[ 0, 2, 4 ]
[ 0, 2, 3 ]
[ 0, 1, 5 ]
[ 0, 1, 4 ]
[ 0, 1, 3 ]
[ 0, 1, 2 ]
o.order("colex")
[ 0, 1, 2 ]
[ 0, 1, 3 ]
[ 0, 2, 3 ]
[ 1, 2, 3 ]
[ 0, 1, 4 ]
[ 0, 2, 4 ]
[ 1, 2, 4 ]
[ 0, 3, 4 ]
[ 1, 3, 4 ]
[ 2, 3, 4 ]
[ 0, 1, 5 ]
[ 0, 2, 5 ]
[ 1, 2, 5 ]
[ 0, 3, 5 ]
[ 1, 3, 5 ]
[ 2, 3, 5 ]
[ 0, 4, 5 ]
[ 1, 4, 5 ]
[ 2, 4, 5 ]
[ 3, 4, 5 ]
o.order("revcolex")
[ 3, 4, 5 ]
[ 2, 4, 5 ]
[ 1, 4, 5 ]
[ 0, 4, 5 ]
[ 2, 3, 5 ]
[ 1, 3, 5 ]
[ 0, 3, 5 ]
[ 1, 2, 5 ]
[ 0, 2, 5 ]
[ 0, 1, 5 ]
[ 2, 3, 4 ]
[ 1, 3, 4 ]
[ 0, 3, 4 ]
[ 1, 2, 4 ]
[ 0, 2, 4 ]
[ 0, 1, 4 ]
[ 1, 2, 3 ]
[ 0, 2, 3 ]
[ 0, 1, 3 ]
[ 0, 1, 2 ]
o.random()
[ 3, 4, 5 ]
o.order("random")
[ 1, 2, 5 ]
[ 1, 3, 4 ]
[ 0, 3, 5 ]
[ 1, 4, 5 ]
[ 1, 3, 5 ]
[ 0, 3, 4 ]
[ 0, 1, 5 ]
[ 2, 4, 5 ]
[ 2, 3, 4 ]
[ 0, 4, 5 ]
[ 1, 2, 4 ]
[ 3, 4, 5 ]
[ 0, 1, 3 ]
[ 0, 2, 4 ]
[ 0, 1, 2 ]
[ 0, 1, 4 ]
[ 0, 2, 5 ]
[ 1, 2, 3 ]
[ 2, 3, 5 ]
[ 0, 2, 3 ]
o.order("colex").range(-5, -1)
[ [ 2, 3, 5 ], [ 0, 4, 5 ], [ 1, 4, 5 ], [ 2, 4, 5 ], [ 3, 4, 5 ] ]
o.dispose()
```

###Tests

see: `test/test.bat`

* `test/permutations.js`
* `test/combinations.js`
* `test/combinations_repeats.js`
* `test/powersets.js`
* `test/partitions.js`
* `test/tensors.js`
* `test/tuples.js`


###Performance

most algorithms are linear `O(n)` (or log-linear `O(nlgn)`) time algorithms, plus statisticaly unbiased, and the author hopes to remain so


###Todo

* support **multiple custom iterator orderings**, i.e  `LEX`, `COLEX`, `REVLEX`, `REVCOLEX`, `RANDOM`, `STOCHASTIC` (where applicable) seamlessly and uniformly [ALMOST DONE, NEW FEATURE]
* support **efficient ranking / unranking algorithms** and associated methods (preferably of `O(n)` or `O(nlgn)` complexity) for  supported orderings [DONE]
* support **unique and uniform random ordering traversals** for all combinatorial objects, so that the space of a combinatorial object can be traversed in any random ordering uniquely and unbiasedly (useful in some applications, eg backtracking) [DONE, see reference, used as custom iterator ordering, see above]
* make sure the `.random` methods **uniformly and unbiasedly sample the combinatorial object space** (methods use unbiased sampling algorithms, however results in certain cases might depend on [quality of PRNGs](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)) [DONE]
* add `Combinadic`, `Factoradic` transformations [DONE]
* add `Derangement`, `RestrictedPartition` [IN PROGRESS]
* add magic squares algorithms [IN PROGRESS, NEW FEATURE]
* support generic *rule-based* `Combinatorial` objects like `Grammar`, and so on (TODO)
* add `Fibonacci`, `Catalan`, `Bell` number computations (TODO?)
* support `biginteger` computations e.g factorials??
