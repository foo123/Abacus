# Abacus
A combinatorics library for Node/XPCOM/JS, PHP, Python, C/C++, Java


(php/python/java/c implementations in progress)


**version 0.7.6** (~ 39kB minified, ~ 12kB zipped)

![abacus combinatorial numbers](/abacus.jpg)

[Abacus.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.js),  [Abacus.min.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.min.js)


`Abacus` is a small generic library containing methods and associated math utilities for (fast) combinatorial object computation. It builds on (and extends) a [deprecated previous project for PHP, Simulacra](https://github.com/foo123/Simulacra).

`Abacus` uses (for the most part) self-contained and standalone methods, so they can be easily copy-pasted in other projects, in case only a few methods are needed and not the whole library.


[![Abacus Live](/abacus-live.png)](https://foo123.github.io/examples/abacus)


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

* [Live Playground Example](https://foo123.github.io/examples/abacus)
* [Features](#features)
* [Performance](#performance)
* [Credits and References](#credits-and-references)
* [Example API](#example-api)
* [Todo](#todo)


###Features

**Supports:** (see: `test/test.bat`)

* `Tensor` (`test/tensors.js`)
* `Tuple` (`test/tuples.js`)
* `Permutation` (`test/permutations.js`, `test/permutations-bigint.js`)
* `CyclicPermutation` (`test/cyclic_permutations.js`)
* `MultisetPermutation` (`test/multiset_permutations.js`) **rank/unrank methods missing**
* `DerangementPermutation` (`test/derangements.js`) **rank/unrank methods missing**
* `InvolutionPermutation` (`test/involutions.js`) **only counting &amp; random generation**
* `UnorderedCombination` (`test/combinations.js`)
* `OrderedCombination` (`test/ordered_combinations.js`)
* `UnorderedRepeatedCombination` (`test/combinations_repeats.js`)
* `OrderedRepeatedCombination` (`test/ordered_combinations_repeats.js`)
* `Subset` (`test/subsets.js`)
* `Partition` (`test/partitions.js`) **rank/unrank methods missing**
* `RestrictedPartition` (`test/restricted_partitions.js`) **partialy complete**
* `SetPartition` (`test/set_partitions.js`) **partialy complete**
* algebraic composition of combinatorial objects (of fixed dimensions at present) to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`, see `test/permutations_of_combinations.js` and `test/permutations_of_permutations.js`)
* multiple (combined) iterator orderings &amp; traversals: **lex**, **colex**, **random**, **reversed**, **reflected**, **minimal** (not implemented yet). For example: `"revlex"` (equivalent to `"lex,reversed"`), `"refcolex"`  (equivalent to `"colex,reflected"`), and so on..


###Performance

(almost) all algorithms:

* are **linear** `O(n)` (or log-linear `O(nlgn)`) **time and space** algorithms
* are **statisticaly unbiased** (i.e uniform sampling methods)
* use **efficient successor methods** (e.g loopless, CAT/constant delay methods) to generate next/prev object from current object (supporting multiple combinatorial orderings along the way, see above)
* **avoid big-integer arithmetic and computational overhead** (except if explicit ranking / unranking is needed and objects are large)
* arithmetic routines are **pluggable** so biginteger arithmetic can be used via external implementations. 

**Note** that the lib can generate **very large** (and in most cases also **randomised**) combinatorial objects **without ever using** biginteger arithmetic due to design and implementation except if arbitrary random, ranking and unranking have to be used (see above)


###Credits and References

See the comments in the code for algorithms and references used.

A variety of combinatorial algorithms &amp; statistics are given, for example, in:

* The Art of Computer Programming, Donald Knuth
* [FXT library, Joerg Arndt](http://www.jjj.de/fxt/) and his [PhD thesis](https://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf)
* [Combinatorial Algorithms, Albert Nijenhuis, Herbert Wilf](https://www.math.upenn.edu/~wilf/website/CombAlgDownld.html)
* [Combinatorial Generation, Frank Ruskey](http://www.1stworks.com/ref/ruskeycombgen.pdf)
* [Generating Functionology, Herbert Wilf](http://www.math.upenn.edu/%7Ewilf/gfologyLinked2.pdf)
* [Permutation Generation Methods, Robert Sedgewick](http://homepage.math.uiowa.edu/~goodman/22m150.dir/2007/Permutation%20Generation%20Methods.pdf)
* [A Versatile Algorithm to Generate Various Combinatorial Structures, Pramod Ganapathi, Rama B](http://arxiv.org/abs/1009.4214v2)
* [Generating All and Random Instances of a Combinatorial Object, Ivan Stojmenovic](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576)
* [Analytic Combinatorics, Philippe Flajolet, Robert Sedgewick](http://algo.inria.fr/flajolet/Publications/book.pdf) can also be used to produce combinatorial generation algorithms instead of just generating functions for counting and statistics
* [Gray Code, wikipedia](https://en.wikipedia.org/wiki/Gray_code)
* [A Survey of Combinatorial Gray Codes, Carla Savage](http://www4.ncsu.edu/~savage/AVAILABLE_FOR_MAILING/survey.pdf)
* [Combinatorial Generation by Fusing Loopless Algorithms, Tadao Takaoka, Stephen Violich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.490.1604&rep=rep1&type=pdf)


###Example API

**permutations** (see `test/permutations.js`)

```text
Abacus.Permutations (VERSION = 0.5.1)
---
o = Abacus.Permutation(4)
o.total()
24
o.next()
[ 0, 1, 2, 3 ]
o.hasNext()
true
o.next()
[ 0, 1, 3, 2 ]
default order is "lex", lexicographic-order
o.rewind()
[ [ 0, 1, 2, 3 ],
  'index          : 0',
  'rank           : 0',
  'unrank         : 0,1,2,3',
  'is_permutation : yes',
  'is_identity    : yes',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 0, 1, 3, 2 ],
  'index          : 1',
  'rank           : 1',
  'unrank         : 0,1,3,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 0, 2, 1, 3 ],
  'index          : 2',
  'rank           : 2',
  'unrank         : 0,2,1,3',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 0, 2, 3, 1 ],
  'index          : 3',
  'rank           : 3',
  'unrank         : 0,2,3,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 0, 3, 1, 2 ],
  'index          : 4',
  'rank           : 4',
  'unrank         : 0,3,1,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 0, 3, 2, 1 ],
  'index          : 5',
  'rank           : 5',
  'unrank         : 0,3,2,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 1, 0, 2, 3 ],
  'index          : 6',
  'rank           : 6',
  'unrank         : 1,0,2,3',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 1, 0, 3, 2 ],
  'index          : 7',
  'rank           : 7',
  'unrank         : 1,0,3,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 1, 2, 0, 3 ],
  'index          : 8',
  'rank           : 8',
  'unrank         : 1,2,0,3',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 1, 2, 3, 0 ],
  'index          : 9',
  'rank           : 9',
  'unrank         : 1,2,3,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 1, 3, 0, 2 ],
  'index          : 10',
  'rank           : 10',
  'unrank         : 1,3,0,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 1, 3, 2, 0 ],
  'index          : 11',
  'rank           : 11',
  'unrank         : 1,3,2,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 2, 0, 1, 3 ],
  'index          : 12',
  'rank           : 12',
  'unrank         : 2,0,1,3',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 2, 0, 3, 1 ],
  'index          : 13',
  'rank           : 13',
  'unrank         : 2,0,3,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 2, 1, 0, 3 ],
  'index          : 14',
  'rank           : 14',
  'unrank         : 2,1,0,3',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 2, 1, 3, 0 ],
  'index          : 15',
  'rank           : 15',
  'unrank         : 2,1,3,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 2, 3, 0, 1 ],
  'index          : 16',
  'rank           : 16',
  'unrank         : 2,3,0,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 2, 3, 1, 0 ],
  'index          : 17',
  'rank           : 17',
  'unrank         : 2,3,1,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 3, 0, 1, 2 ],
  'index          : 18',
  'rank           : 18',
  'unrank         : 3,0,1,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 3, 0, 2, 1 ],
  'index          : 19',
  'rank           : 19',
  'unrank         : 3,0,2,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 3, 1, 0, 2 ],
  'index          : 20',
  'rank           : 20',
  'unrank         : 3,1,0,2',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : no',
  'is_connected   : yes' ]
[ [ 3, 1, 2, 0 ],
  'index          : 21',
  'rank           : 21',
  'unrank         : 3,1,2,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : no',
  'is_involution  : yes',
  'is_connected   : no' ]
[ [ 3, 2, 0, 1 ],
  'index          : 22',
  'rank           : 22',
  'unrank         : 3,2,0,1',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : no',
  'is_connected   : no' ]
[ [ 3, 2, 1, 0 ],
  'index          : 23',
  'rank           : 23',
  'unrank         : 3,2,1,0',
  'is_permutation : yes',
  'is_identity    : no',
  'is_derangement : yes',
  'is_involution  : yes',
  'is_connected   : no' ]
backwards
o.rewind(-1)
[ 3, 2, 1, 0 ]
[ 3, 2, 0, 1 ]
[ 3, 1, 2, 0 ]
[ 3, 1, 0, 2 ]
[ 3, 0, 2, 1 ]
[ 3, 0, 1, 2 ]
[ 2, 3, 1, 0 ]
[ 2, 3, 0, 1 ]
[ 2, 1, 3, 0 ]
[ 2, 1, 0, 3 ]
[ 2, 0, 3, 1 ]
[ 2, 0, 1, 3 ]
[ 1, 3, 2, 0 ]
[ 1, 3, 0, 2 ]
[ 1, 2, 3, 0 ]
[ 1, 2, 0, 3 ]
[ 1, 0, 3, 2 ]
[ 1, 0, 2, 3 ]
[ 0, 3, 2, 1 ]
[ 0, 3, 1, 2 ]
[ 0, 2, 3, 1 ]
[ 0, 2, 1, 3 ]
[ 0, 1, 3, 2 ]
[ 0, 1, 2, 3 ]
o.order("lex,reflected")
[ 3, 2, 1, 0 ]
[ 2, 3, 1, 0 ]
[ 3, 1, 2, 0 ]
[ 1, 3, 2, 0 ]
[ 2, 1, 3, 0 ]
[ 1, 2, 3, 0 ]
[ 3, 2, 0, 1 ]
[ 2, 3, 0, 1 ]
[ 3, 0, 2, 1 ]
[ 0, 3, 2, 1 ]
[ 2, 0, 3, 1 ]
[ 0, 2, 3, 1 ]
[ 3, 1, 0, 2 ]
[ 1, 3, 0, 2 ]
[ 3, 0, 1, 2 ]
[ 0, 3, 1, 2 ]
[ 1, 0, 3, 2 ]
[ 0, 1, 3, 2 ]
[ 2, 1, 0, 3 ]
[ 1, 2, 0, 3 ]
[ 2, 0, 1, 3 ]
[ 0, 2, 1, 3 ]
[ 1, 0, 2, 3 ]
[ 0, 1, 2, 3 ]
o.order("lex,reversed")
[ 3, 2, 1, 0 ]
[ 3, 2, 0, 1 ]
[ 3, 1, 2, 0 ]
[ 3, 1, 0, 2 ]
[ 3, 0, 2, 1 ]
[ 3, 0, 1, 2 ]
[ 2, 3, 1, 0 ]
[ 2, 3, 0, 1 ]
[ 2, 1, 3, 0 ]
[ 2, 1, 0, 3 ]
[ 2, 0, 3, 1 ]
[ 2, 0, 1, 3 ]
[ 1, 3, 2, 0 ]
[ 1, 3, 0, 2 ]
[ 1, 2, 3, 0 ]
[ 1, 2, 0, 3 ]
[ 1, 0, 3, 2 ]
[ 1, 0, 2, 3 ]
[ 0, 3, 2, 1 ]
[ 0, 3, 1, 2 ]
[ 0, 2, 3, 1 ]
[ 0, 2, 1, 3 ]
[ 0, 1, 3, 2 ]
[ 0, 1, 2, 3 ]
o.order("colex")
[ 3, 2, 1, 0 ]
[ 2, 3, 1, 0 ]
[ 3, 1, 2, 0 ]
[ 1, 3, 2, 0 ]
[ 2, 1, 3, 0 ]
[ 1, 2, 3, 0 ]
[ 3, 2, 0, 1 ]
[ 2, 3, 0, 1 ]
[ 3, 0, 2, 1 ]
[ 0, 3, 2, 1 ]
[ 2, 0, 3, 1 ]
[ 0, 2, 3, 1 ]
[ 3, 1, 0, 2 ]
[ 1, 3, 0, 2 ]
[ 3, 0, 1, 2 ]
[ 0, 3, 1, 2 ]
[ 1, 0, 3, 2 ]
[ 0, 1, 3, 2 ]
[ 2, 1, 0, 3 ]
[ 1, 2, 0, 3 ]
[ 2, 0, 1, 3 ]
[ 0, 2, 1, 3 ]
[ 1, 0, 2, 3 ]
[ 0, 1, 2, 3 ]
o.order("colex,reflected")
[ 0, 1, 2, 3 ]
[ 0, 1, 3, 2 ]
[ 0, 2, 1, 3 ]
[ 0, 2, 3, 1 ]
[ 0, 3, 1, 2 ]
[ 0, 3, 2, 1 ]
[ 1, 0, 2, 3 ]
[ 1, 0, 3, 2 ]
[ 1, 2, 0, 3 ]
[ 1, 2, 3, 0 ]
[ 1, 3, 0, 2 ]
[ 1, 3, 2, 0 ]
[ 2, 0, 1, 3 ]
[ 2, 0, 3, 1 ]
[ 2, 1, 0, 3 ]
[ 2, 1, 3, 0 ]
[ 2, 3, 0, 1 ]
[ 2, 3, 1, 0 ]
[ 3, 0, 1, 2 ]
[ 3, 0, 2, 1 ]
[ 3, 1, 0, 2 ]
[ 3, 1, 2, 0 ]
[ 3, 2, 0, 1 ]
[ 3, 2, 1, 0 ]
o.order("colex,reversed")
[ 0, 1, 2, 3 ]
[ 1, 0, 2, 3 ]
[ 0, 2, 1, 3 ]
[ 2, 0, 1, 3 ]
[ 1, 2, 0, 3 ]
[ 2, 1, 0, 3 ]
[ 0, 1, 3, 2 ]
[ 1, 0, 3, 2 ]
[ 0, 3, 1, 2 ]
[ 3, 0, 1, 2 ]
[ 1, 3, 0, 2 ]
[ 3, 1, 0, 2 ]
[ 0, 2, 3, 1 ]
[ 2, 0, 3, 1 ]
[ 0, 3, 2, 1 ]
[ 3, 0, 2, 1 ]
[ 2, 3, 0, 1 ]
[ 3, 2, 0, 1 ]
[ 1, 2, 3, 0 ]
[ 2, 1, 3, 0 ]
[ 1, 3, 2, 0 ]
[ 3, 1, 2, 0 ]
[ 2, 3, 1, 0 ]
[ 3, 2, 1, 0 ]
o.order("random")
[ 1, 3, 0, 2 ]
[ 0, 2, 3, 1 ]
[ 2, 3, 1, 0 ]
[ 0, 2, 1, 3 ]
[ 0, 1, 3, 2 ]
[ 1, 2, 0, 3 ]
[ 0, 3, 2, 1 ]
[ 2, 3, 0, 1 ]
[ 0, 1, 2, 3 ]
[ 1, 0, 2, 3 ]
[ 3, 2, 1, 0 ]
[ 1, 0, 3, 2 ]
[ 3, 1, 0, 2 ]
[ 2, 0, 1, 3 ]
[ 1, 2, 3, 0 ]
[ 1, 3, 2, 0 ]
[ 3, 0, 2, 1 ]
[ 2, 0, 3, 1 ]
[ 3, 1, 2, 0 ]
[ 2, 1, 3, 0 ]
[ 0, 3, 1, 2 ]
[ 3, 2, 0, 1 ]
[ 3, 0, 1, 2 ]
[ 2, 1, 0, 3 ]
o.random()
[ 0, 1, 3, 2 ]
o.order("colex").range(-5, -1)
[ 1, 2, 0, 3 ]
[ 2, 0, 1, 3 ]
[ 0, 2, 1, 3 ]
[ 1, 0, 2, 3 ]
[ 0, 1, 2, 3 ]
o.dispose()
```

**big-integer arithmetic permutations** (see `test/permutations-bigint.js`)

```text
Abacus.Permutations (VERSION = 0.5.0)
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


###Todo

* apply built-in language `iterator`/`iterable` patterns (e.g ES6 `iterator` protocol, Python `__iter__` interface, PHP `Iterator` interface, ..). Combinatorial objects additionaly support a `doubly-linked list`-like interface, i.e `prev`/`next` accessors [DONE]
* support `biginteger` combinatorial computations e.g large factorials [DONE, the lib **does not support** biginteger arithmetic, but arithmetic routines have been made **dynamicaly pluggable** and one can use an external implementation to support combinatorics with bigintegers where needed as needed, see test examples for an example]
* support **efficient ranking / unranking algorithms** and associated methods (of `O(n)` or `O(nlgn)` complexity) for supported orderings [DONE]
* support **multiple combined custom iterator orderings**, i.e  `lex`, `colex`, `reversed`, `reflected`, `random` seamlessly and uniformly, both forward and backward [DONE, `random` ordering may be optimised further]
* support **unique and uniform random ordering traversals** for all combinatorial objects, so that the space of a combinatorial object can be traversed in **any random ordering uniquely and unbiasedly** (useful in some applications, eg backtracking) [DONE, see reference, used as custom iterator ordering, see above, may be optimised further]
* make sure the `.random` methods **uniformly and unbiasedly sample the combinatorial object space** (methods use unbiased sampling algorithms, however results in certain cases might depend on [quality of PRNGs](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)) [DONE]
* support algebraic composition/cascading of combinatorial objects (of fixed dimensions at present) to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`) [DONE]
* add efficient `rank`/`unrank` methods for `MultisetPermutation`, `DerangementPermutation` &amp; `Partition` (TODO)
* support `minimal`/`gray` ordering for all supported combinatorial objects (TODO)
* add `InvolutionPermutation` (TODO)
* add `LatinSquare`, `MagicSquare` algorithms (TODO)
* support generation of supported combinatorial objects with additional **user-defined patterns/templates of constraints** to satisfy e.g *"only combinatorial objects matching `'(n)(m)(1){2}(){3}(0)((n+1))((n+m)){4}'`"* pattern.. (TODO?)
* support generation (and counting) of combinatorial objects (including the basic supported ones) based on **generic user-defined symbolic constraints / symmetries / rules** to satisfy, for example `permutations` defined symbolicaly and directly by their *symmetries / constraints* instead of being hardcoded as elementary objects (TODO?)
* support *graph-based* combinatorial objects like `Graph`, `Grammar`,.. (TODO?) (for regular grammars and expressions see [RegexAnalyzer](https://github.com/foo123/RegexAnalyzer) for an example)
