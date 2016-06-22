# Abacus
A combinatorics library for Node/JS, PHP, Python, ActionScript

**update in progress do not use**


(php/python implementations in progress)

**version 0.1.0**

![abacus combinatorial numbers](/abacus.jpg)

[Abacus.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.js),  [Abacus.min.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.min.js)


Abacus is a small library containing methods and associated math utilities for (fast) combinatorial scientific computation. It builds on (and extends) a [previous project for PHP, Simulacra](https://github.com/foo123/Simulacra).

Abacus uses (for the most part) self-contained and standalone methods, so they can be easily copy-pasted in other projects, in case only a few methods are needed and not the whole library.


**see also:**  

* [Contemplate](https://github.com/foo123/Contemplate) a fast and light-weight Template Engine for Node/XPCOM/JS, PHP, Python
* [HtmlWidget](https://github.com/foo123/HtmlWidget) html widgets used as (template) plugins and/or standalone for PHP, Node/XPCOM/JS, Python both client and server-side
* [Tao](https://github.com/foo123/Tao.js) A simple, tiny, isomorphic, precise and fast template engine for handling both string and live dom based templates
* [ModelView](https://github.com/foo123/modelview.js) a light-weight and flexible MVVM framework for JavaScript/HTML5
* [ModelView MVC jQueryUI Widgets](https://github.com/foo123/modelview-widgets) plug-n-play, state-full, full-MVC widgets for jQueryUI using modelview.js (e.g calendars, datepickers, colorpickers, tables/grids, etc..) (in progress)
* [Importer](https://github.com/foo123/Importer) simple class &amp; dependency manager and loader for PHP, Node/XPCOM/JS, Python
* [PublishSubscribe](https://github.com/foo123/PublishSubscribe) a simple and flexible publish-subscribe pattern implementation for Node/XPCOM/JS, PHP, Python, ActionScript
* [Dromeo](https://github.com/foo123/Dromeo) a flexible, agnostic router for Node/XPCOM/JS, PHP, Python, ActionScript
* [Dialect](https://github.com/foo123/Dialect) a simple cross-platform SQL construction for PHP, Python, Node/XPCOM/JS, ActionScript
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support) for PHP, Python, Node/XPCOM/JS, ActionScript
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) versatile and intuitive grammar-based templating for PHP, Python, Node/XPCOM/JS, ActionScript
* [GrammarPattern](https://github.com/foo123/GrammarPattern) versatile grammar-based pattern-matching for Node/XPCOM/JS (IN PROGRESS)
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for Node/XPCOM/JS, PHP, Python, ActionScript
* [DateX](https://github.com/foo123/DateX) eXtended &amp; localised Date parsing, diffing, formatting and validation for Node/XPCOM/JS, Python, PHP, ActionScript
* [RT](https://github.com/foo123/RT) client-side real-time communication for Node/XPCOM/JS with support for Poll/BOSH/WebSockets
* [Asynchronous](https://github.com/foo123/asynchronous.js) a simple manager for async, linearised, parallelised, interleaved and sequential tasks for JavaScript
* [Simulacra](https://github.com/foo123/Simulacra) a simulation, algebraic, probability and combinatorics PHP package for scientific computations


###Contents

* [Example API](#example-api)
* [Tests](#tests)
* [Performance](#performance)
* [Todo](#todo)


###Example API

**combinations** (see `test/combinations.js`)

```text
Note: Due to the large number of combinatorial samples,
Abacus combinatorics use an Iterator pattern to succesively and consistently
generate all combinatorial objects without storing all of them in memory at once


Abacus.Combinations (VERSION = 0.1.0)
---
o = Abacus.Combination(6,3)
o.total()
20
default order is "lex", lexicographic-order
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
o.forward()
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
[ 1, 3, 5 ]
o.order("random")
[ 0, 1, 3 ]
[ 1, 4, 5 ]
[ 1, 3, 5 ]
[ 0, 3, 5 ]
[ 1, 2, 5 ]
[ 0, 4, 5 ]
[ 0, 2, 3 ]
[ 1, 2, 3 ]
[ 0, 2, 4 ]
[ 1, 2, 4 ]
[ 3, 4, 5 ]
[ 2, 3, 4 ]
[ 0, 2, 5 ]
[ 0, 1, 5 ]
[ 2, 4, 5 ]
[ 2, 3, 5 ]
[ 0, 1, 2 ]
[ 0, 1, 4 ]
[ 0, 3, 4 ]
[ 1, 3, 4 ]
o.order("colex").range(-5, -1)
[ [ 2, 3, 5 ], [ 0, 4, 5 ], [ 1, 4, 5 ], [ 2, 4, 5 ], [ 3, 4, 5 ] ]
o.dispose()
```

**big-integer arithmetic permutations** (see `test/permutations-bigint.js`)

```text
Abacus.Permutations (VERSION = 0.1.0)
---
o = Abacus.Permutation(50)
o.total()
30414093201713378043612608166064768844377641568960512000000000000
o.random()
[ 21,14,4,48,13,45,43,42,44,
  38,2,32,7,15,3,30,46,29,24,
  18,23,19,47,39,12,6,11,37,1,
  20,16,5,9,36,8,22,35,49,34,
  28,31,26,10,27,25,0,41,40,33,17 ]
o.item(78043612608166064768844377641568960512000000000000,"lex")
[ 0,1,2,3,4,5,6,7,10,22,36,
  11,30,34,12,27,9,31,26,20,
  48,19,18,47,13,24,14,21,17,
  38,16,15,41,40,43,23,28,39,
  46,37,35,45,8,33,42,29,44,49,25,32 ]
o.item(78043612608166064768844377641568960512000000000000,"colex")
[ 32,25,49,44,29,42,33,8,45,
  35,37,46,39,28,23,43,40,
  41,15,16,38,17,21,14,24,
  13,47,18,19,48,20,26,31,
  9,27,12,34,30,11,36,22,10,7,6,5,4,3,2,1,0 ]
o.item(78043612608166064768844377641568960512000000000000,"revlex")
[ 49,48,47,46,45,44,43,
  42,39,27,13,38,19,15,
  37,22,40,18,23,29,1,
  30,31,2,36,25,35,28,
  32,11,33,34,8,9,6,26,
  21,10,3,12,14,4,41,16,7,20,5,0,24,17 ]
o.item(78043612608166064768844377641568960512000000000000,"revcolex")
[ 17,24,0,5,20,7,16,41,4,14,
  12,3,10,21,26,6,9,8,34,33,
  11,32,28,35,25,36,2,31,30,
  1,29,23,18,40,22,37,15,19,
  38,13,27,39,42,43,44,45,46,47,48,49 ]
o.order("lex").range(30414093201713378043612608166064768844377641568960511999999999998)
[ [ 49,48,47,46,45,44,43,42,41,40,39,38,
    37,36,35,34,33,32,31,30,29,28,27,
    26,25,24,23,22,21,20,19,18,17,16,
    15,14,13,12,11,10,9,8,7,6,5,4,3,2,0,1 ],
  [ 49,48,47,46,45,44,43,42,41,40,39,38,
    37,36,35,34,33,32,31,30,29,28,27,
    26,25,24,23,22,21,20,19,18,17,16,
    15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0 ] ]
o.dispose()
```

###Tests

see: `test/test.bat`

* `test/permutations.js`
* `test/permutations-bigint.js`
* `test/combinations.js`
* `test/combinations_repeats.js`
* `test/powersets.js`
* `test/tensors.js`
* `test/tuples.js`
* `test/partitions.js` **in-complete, in progress**


###Performance

most algorithms:

* are **linear** `O(n)` (or log-linear `O(nlgn)`) time and space algorithms
* are **statisticaly unbiased** (e.g uniform sampling methods)
* use **efficient successor methods** (e.g loopless methods / constant delay methods) to generate next/prev object from current object (supporting multiple combinatorial orderings along the way, see below)
* **avoid big-integer arithmetic and computational overhead** (except if explicit ranking / unranking is needed and objects are large)
* arithmetic routines are **pluggable** so biginteger arithmetic can be used via external implementations. **Note** that the lib can generate **very large** (and in most cases also **randomised**) combinatorial objects **without ever using** biginteger arithmetic due to design and implementation except if arbitrary random, ranking and unranking have to be used (see above)



###Todo

* support **multiple custom iterator orderings**, i.e  `LEX`, `COLEX`, `REVLEX`, `REVCOLEX`, `RANDOM`, `STOCHASTIC` (where applicable) seamlessly and uniformly [ALMOST DONE, NEW FEATURE]
* support **efficient ranking / unranking algorithms** and associated methods (preferably of `O(n)` or `O(nlgn)` complexity) for  supported orderings [DONE]
* support **unique and uniform random ordering traversals** for all combinatorial objects, so that the space of a combinatorial object can be traversed in any random ordering uniquely and unbiasedly (useful in some applications, eg backtracking) [DONE, see reference, used as custom iterator ordering, see above]
* make sure the `.random` methods **uniformly and unbiasedly sample the combinatorial object space** (methods use unbiased sampling algorithms, however results in certain cases might depend on [quality of PRNGs](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)) [DONE]
* support `biginteger` computations e.g factorials?? [DONE, the lib does not support biginteger arithmetic, but arithmetic routines have been made dynamicaly pluggable and one can use an external implementation to support combinatorics with bigintegers where needed as needed, see test examples for an example]
* add `Combinadic`, `Factoradic` transformations [DONE]
* add magic squares algorithms [IN PROGRESS, NEW FEATURE]
* add `Derangement`, `RestrictedPartition` [IN PROGRESS]
* support generation of combinatorial objects based on *patterns/templates of constraints* to satisfy e.g "only combinations with `xx(n)(n+1)x`" pattern and so on.. (TODO)
* add generic *rule-based* `Combinatorial` objects like `Grammar` (TODO)
