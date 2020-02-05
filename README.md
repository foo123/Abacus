# Abacus

A **Combinatorics** and **Algebraic Number Theory** library for Node.js / Browser / XPCOM Javascript, Python, Java


**version 1.0.0** (~ 210kB minified, ~ 60kB zipped)

![abacus combinatorial numbers](/abacus.jpg)

[Abacus.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.js),  [Abacus.min.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.min.js)


`Abacus` is a flexible library containing methods and associated math utilities for (fast) combinatorial object computation and integer / number theoretic computation. It builds on (and extends) a [deprecated previous project for PHP, Simulacra](https://github.com/foo123/Simulacra).

`Abacus` uses (for the most part) self-contained and standalone methods, so they can be easily copy-pasted in other projects, in case only a few methods are needed and not the whole library.


[![Abacus Live](/abacus-live.png)](https://foo123.github.io/examples/abacus)


**see also:**

* [Contemplate](https://github.com/foo123/Contemplate) a fast and light-weight object-oriented Template Engine for Node.js / Browser / XPCOM Javascript, PHP, Python
* [HtmlWidget](https://github.com/foo123/HtmlWidget) html widgets used as (template) plugins and/or standalone for Node.js / Browser / XPCOM Javascript, PHP, Python both client and server-side
* [Tao](https://github.com/foo123/Tao.js) A simple, tiny, isomorphic, precise and fast template engine for handling both string and live dom based templates
* [ModelView](https://github.com/foo123/modelview.js) a light-weight and flexible MVVM framework for JavaScript/HTML5
* [ModelView MVC jQueryUI Widgets](https://github.com/foo123/modelview-widgets) plug-n-play, state-full, full-MVC widgets for jQueryUI using modelview.js (e.g calendars, datepickers, colorpickers, tables/grids, etc..) (in progress)
* [Importer](https://github.com/foo123/Importer) simple class &amp; dependency manager and loader for Node.js / Browser / XPCOM Javascript, PHP, Python
* [PublishSubscribe](https://github.com/foo123/PublishSubscribe) a simple and flexible publish-subscribe pattern implementation for Node.js / Browser / XPCOM Javascript, PHP, Python
* [Dromeo](https://github.com/foo123/Dromeo) a flexible, agnostic router for Node.js / Browser / XPCOM Javascript, PHP, Python
* [Dialect](https://github.com/foo123/Dialect) a simple cross-vendor &amp; cross-platform object-oriented SQL Query Builder for Node.js / Browser / XPCOM Javascript, PHP, Python
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support) for Node.js / Browser / XPCOM Javascript, PHP, Python
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) versatile and intuitive grammar-based templating for Node.js / Browser / XPCOM Javascript, PHP, Python
* [GrammarPattern](https://github.com/foo123/GrammarPattern) versatile grammar-based pattern-matching for Node.js / Browser / XPCOM Javascript (IN PROGRESS)
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for Node.js / Browser / XPCOM Javascript, PHP, Python
* [DateX](https://github.com/foo123/DateX) eXtended &amp; localised Date parsing, diffing, formatting and validation for Node.js / Browser / XPCOM Javascript, PHP, Python
* [RT](https://github.com/foo123/RT) client-side real-time communication for Node/XPCOM/JS with support for Poll / BOSH / WebSockets
* [Asynchronous](https://github.com/foo123/asynchronous.js) a simple manager for async, linearised, parallelised, interleaved and sequential tasks for JavaScript
* [Simulacra](https://github.com/foo123/Simulacra) a simulation, algebraic, probability and combinatorics PHP package for scientific computations (DEPRECATED)


### Contents

* [Live Playground Example](https://foo123.github.io/examples/abacus)
* [Features](#features)
* [Combinatorial and Number Theory Examples](/examples/README.md)
* [Performance](#performance)
* [Credits and References](#credits-and-references)
* [Example API](#example-api)
* [Todo](#todo)


### Features

**Supports:** (see: `test/test.bat`)

**Combinatorics**
* `Tensor` (`test/tensors.js`)
* `Tuple` (`test/tuples.js`)
* `Permutation` (`test/permutations.js`, `test/permutations-bigint.js`)
* `CyclicPermutation` (`test/cyclic_permutations.js`)
* `MultisetPermutation` (`test/multiset_permutations.js`)
* `DerangementPermutation` (`test/derangements.js`) **rank/unrank methods missing**
* `InvolutionPermutation` (`test/involutions.js`) **only counting &amp; random generation**
* `ConnectedPermutation` (`test/connected_permutations.js`) **only counting &amp; random generation**
* `UnorderedCombination` / `Combination` (`test/combinations.js`)
* `OrderedCombination` / `Variation` / `kPermutation` (`test/ordered_combinations.js`)
* `UnorderedRepeatedCombination` / `RepeatedCombination` (`test/combinations_repeats.js`)
* `OrderedRepeatedCombination` / `RepeatedVariation` / `kTuple` (`test/ordered_combinations_repeats.js`)
* `Subset` (`test/subsets.js`)
* `Partition` (`test/partitions.js`) **rank/unrank methods missing, partial support for COLEX**
* `Composition` (`test/compositions.js`) **rank/unrank methods missing, partial support for COLEX**
* `RestrictedPartition` (`test/restricted_partitions.js`) **exactly M max. part**
* `RestrictedComposition` (`test/restricted_compositions.js`) **exactly K #parts**
* `LatinSquare` (`test/latin_squares.js`)
* `MagicSquare` (`test/magic_squares.js`)

* **algebraic composition** (of **fixed** dimensions at present) and **sequences** of combinatorial objects to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`, see `test/permutations_of_combinations.js` and `test/permutations_of_permutations.js`, `k-Derangements` = `(n,k) Combinations` **combined With** `(n-k) Derangements`, see `test/k-derangements.js` or `all subsets` = `(n,0)Combinations + (n,1)Combinations + .. + (n,n-1)Combinations + (n,n)Combinations`, see `test/combination_subsets.js`)
* custom (user-supplied callable) and/or built-in **filters** which can select and generate any custom and complex combinatorial object from filtering other combinatorial objects as efficiently as possible (e.g see `test/filtered.js`, `test/filtered_partitions.js`). Also **algebraic / boolean composition of filters** (i.e `.NOT()`, `.AND()`, `.OR()` and so on..). **Note** that filtering should be **used with caution and only if no other method is currently possible** to generate the desired combinatorial object as **filtering is equivalent to exhaustive search** over the space of the original combinatorial object and as such can be an inefficient way to generate a combinatorial object (e.g see `test/filtered.js`). **Note2** with filtering applied some methods like `.total()`, `.hasNext()` still return data of the original object **not** the filtered object since that would require to pre-generate all the data and filter them afterwards instead of doing it one-by-one on each generation and would be impractical and unachievable for very large combinatorial objects, so be careful when using, for example, `.total()` with fitering applied
* **multiple (combined) iterator orderings &amp; traversals**: `lex`, `colex`, `random`, `reversed`, `reflected`, `minimal` (not implemented yet). For example: `"revlex"` (equivalent to `"lex,reversed"`), `"refcolex"`  (equivalent to `"colex,reflected"`), and so on..
* **arbitrary range** of combinatorial objects in a number of supported orderings (ie `lex`, `colex`, `random`,..) (and with filtering applied, if set). **Note** `rank`/`unrank` methods have to be implemented for this feature to work
* **efficient and unbiased generation, (un)ranking, succession &amp; random methods** for supported combinatorial objects (see below)

**Number Theory / Algebraic Number Theory**
* Numbers, eg `fibonacci`, `catalan`, `bell`, `factorial`, `partition`, `polygonal`, .. (`test/numbers.js`)
* Number Theory Functions, eg `gcd` / `xgcd` / `polygcd` / `polyxgcd` / `groebner`, `divisors`, `moebius`, `legendre`, `jacobi`, `isqrt`, `ikthroot`, .. (`test/number_theory.js`)
* `Integer` (`test/integers.js`), `Rational` (`test/rationals.js`) **supporting arbitrary precision decimals and repeating decimals as well**
* `Complex` (`test/complex.js`) **with Rational arbitrary precision parts**
* `Polynomial`, `MultiPolynomial` (`test/polynomials.js`, `test/multivariate.js`) **univariate/multivariate with Rational coefficients**
* `RationalFunc` (`test/ratfuncs.js`) **Rational functions as fractions of multivariate polynomials**
* `Matrix` (`test/matrices.js`) **with integer coefficients**
* `Progression` (Infinite, Arithmetic, Geometric) (`test/progressions.js`)
* `PrimeSieve`, Primality Tests, Prime Factorisation (`test/primes.js`)
* `Diophantine`, Linear Equations, Linear Congruences, Pythagorean n-Tuples (`test/diophantine.js`)

* `big-integer arithmetic`, `PRNG`s and other `math` utilities can be **dynamicaly pluggable using external implementations**, making the lib very flexible especialy with respect to handling big-integers &amp; (pseudo-)random number generators (eg examples and tests use the excellent [BigInteger.js](https://github.com/peterolson/BigInteger.js))


### Performance

* `first`/`last`, `random`, `rank`/`unrank` methods use **efficient linear** `O(n)` (or **log-linear** `O(nlgn)`) **time and space** algorithms
* `random` methods are **statisticaly unbiased** (ie uniform sampling methods, see below as well)
* `successor` methods use **efficient CAT (ie constant average time) or Loopless (ie strictly constant time)** algorithms to generate next/prev object from current object (supporting multiple combinatorial orderings along the way, see above) (**note** a couple of methods are **linear time** algorithms because the lib does not use extra space to store information between successive runs and also support static random access to successors so any extra is computed at `run-time`, but can easily be made `CAT` or even `Loopless` by storing extra information, eg current index position)
* **avoid big-integer arithmetic and computational overhead** (except if explicit `ranking` / `unranking` is needed and objects are large)
* integer/number-theoretic/math computations support pluggable arithmetics (thus if used can compute with Big Integers), algorithms implemented are efficient but not necessarily the most efficient version (theoritically) possible (eg default `gcd` algorithm used, although optimised), possible to implement even faster algorithms in future verions

**Note** that the lib can generate **very large** (and also **randomised**) combinatorial objects **without ever using** biginteger arithmetic due to design and implementation except if arbitrary `random`, `ranking` and `unranking` have to be used (see above)


### Credits and References

See the comments in the code for algorithms and references used.

A variety of combinatorial algorithms, algebraic number theory algorithms &amp; statistics are given, for example, in:

* [The Art of Computer Programming, Donald Knuth](http://www-cs-faculty.stanford.edu/~uno/taocp.html)
* [FXT library, Joerg Arndt](http://www.jjj.de/fxt/) and his [PhD thesis](https://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf)
* [Combinatorial Algorithms, Albert Nijenhuis, Herbert Wilf](https://www.math.upenn.edu/~wilf/website/CombAlgDownld.html)
* [Combinatorial Generation, Frank Ruskey](http://www.1stworks.com/ref/ruskeycombgen.pdf)
* [Generating Functionology, Herbert Wilf](http://www.math.upenn.edu/%7Ewilf/gfologyLinked2.pdf)
* [Permutation Generation Methods, Robert Sedgewick](http://homepage.math.uiowa.edu/~goodman/22m150.dir/2007/Permutation%20Generation%20Methods.pdf)
* [A Versatile Algorithm to Generate Various Combinatorial Structures, Pramod Ganapathi, Rama B](http://arxiv.org/abs/1009.4214v2)
* [Generating All and Random Instances of a Combinatorial Object, Ivan Stojmenovic](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576) including the section on random generation **without large integers** &amp; **with only one `PRNG` call**
* [Algorithms for Unranking Combinations and Other Related Choice Functions, Zbigniew Kokosinski](http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
* [Analytic Combinatorics, Philippe Flajolet, Robert Sedgewick](http://algo.inria.fr/flajolet/Publications/book.pdf) can also be used to produce combinatorial generation algorithms instead of just generating functions for counting and statistics
* [Gray Code, wikipedia](https://en.wikipedia.org/wiki/Gray_code)
* [A Survey of Combinatorial Gray Codes, Carla Savage](http://www4.ncsu.edu/~savage/AVAILABLE_FOR_MAILING/survey.pdf)
* [Combinatorial Generation by Fusing Loopless Algorithms, Tadao Takaoka, Stephen Violich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.490.1604&rep=rep1&type=pdf)
* [Make good (Pseudo-)Random Number Generators](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)
* [Handbook of Applied Cryptography, Chapter 4](http://cacr.uwaterloo.ca/hac/)
* [The Quadratic Sieve Factoring Algorithm, Eric Landquist](http://www.cs.virginia.edu/crab/QFS_Simple.pdf)
* [A Beginner’s Guide To The General Number Field Sieve, Michael Case](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.219.2389&rep=rep1&type=pdf)
* [Implementation of a New Primality Test, H. Cohen, A.K. Lenstra](https://pdfs.semanticscholar.org/76bb/023a666615ad2d28d4cc9c24068e45a94337.pdf)
* [Integer Algorithms to solve Diophantine Linear Equations and Systems, Florentin Smarandache](https://arxiv.org/ftp/math/papers/0010/0010134.pdf)
* [Linear Diophantine Equations, William J. Gilbert, Anu Pathria](https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf)
* [A multivariable Chinese remainder theorem, Oliver Knill](http://www.math.harvard.edu/~knill/preprints/linear.pdf)
* [Solving a System of Linear Diophantine Equations with Lower and Upper Bounds on the Variables, K. Aardal, C.A.J. Hurkens, A.K. Lenstra](https://www.jstor.org/stable/3690477?seq=1#page_scan_tab_contents)
* [Integer Programming with a Fixed Number of Variables, H.W. Lenstra](https://people.csail.mit.edu/rrw/presentations/Lenstra81.pdf)
* [Integer Programming with 2-Variable Equations and 1-Variable Inequalities, Bodirsky, Nordh, Von Oertzen](http://www.lix.polytechnique.fr/~bodirsky/publications/2var.pdf)
* [Numerical algorithms for the computation of the Smith normal form of integral matrices, C. Koukouvinos, M. Mitrouli, J. Seberry](https://ro.uow.edu.au/cgi/viewcontent.cgi?referer=https://www.google.com/&httpsredir=1&article=2173&context=infopapers)
* [Fraction-free matrix factors: new forms for LU and QR factors, Wenqin ZHOU, David J. JEFFREY](http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf)
* [Algorithms and Data Structures for Sparse Polynomial Arithmetic, M. Asadi, A. Brandt, R. H. C. Moir, M. M. Maza](https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic)
* [High Performance Sparse Multivariate Polynomials: Fundamental Data Structures and Algorithms, Alex Brandt (MSc thesis)](https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1)
* [An improved EZ-GCD algorithm for multivariate polynomials, Kuniaki Tsuji](https://core.ac.uk/download/pdf/82335256.pdf)
* [Greedy Algorithms for Optimizing Multivariate Horner Schemes, M. Ceberio and V. Kreinovich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.330.7430&rep=rep1&type=pdf)
* [Gröbner basis, wikipedia](https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis)
* [Buchberger's algorithm, wikipedia](https://en.wikipedia.org/wiki/Buchberger%27s_algorithm)
* [A Note on Multivariate Polynomial Division and Gröbner Bases, A. T. Lipkovski and S. Zeada](http://elib.mi.sanu.ac.rs/files/journals/publ/117/n111p043.pdf)
* [Algorithms for Normal Forms for Matrices of Polynomials and Ore Polynomials, Howard Cheng (PhD thesis)](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.9.4150&rep=rep1&type=pdf)

### Example API

**permutations** (see `test/permutations.js`)

```text
Abacus.Permutations (VERSION = 0.7.5)
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
Abacus.Permutations (VERSION = 0.7.6)
---
o = Abacus.Permutation(50)
o.total()
30414093201713378043612608166064768844377641568960512000000000000
o.random()
21,14,4,48,13,45,43,42,44,38,2,32,7,15,3,30,46,29,24,18,23,19,47,39,12,6,11,37,1,20,16,5,9,36,8,22,35,49,34,28,31,26,10,27,25,0,41,40,33,17
o.item(78043612608166064768844377641568960512000000000000,"lex")
0,1,2,3,4,5,6,7,10,22,36,11,30,34,12,27,9,31,26,20,48,19,18,47,13,24,14,21,17,38,16,15,41,40,43,23,28,39,46,37,35,45,8,33,42,29,44,49,25,32
o.item(78043612608166064768844377641568960512000000000000,"colex")
32,25,49,44,29,42,33,8,45,35,37,46,39,28,23,43,40,41,15,16,38,17,21,14,24,13,47,18,19,48,20,26,31,9,27,12,34,30,11,36,22,10,7,6,5,4,3,2,1,0
o.item(78043612608166064768844377641568960512000000000000,"revlex")
49,48,47,46,45,44,43,42,39,27,13,38,19,15,37,22,40,18,23,29,1,30,31,2,36,25,35,28,32,11,33,34,8,9,6,26,21,10,3,12,14,4,41,16,7,20,5,0,24,17
o.item(78043612608166064768844377641568960512000000000000,"revcolex")
17,24,0,5,20,7,16,41,4,14,12,3,10,21,26,6,9,8,34,33,11,32,28,35,25,36,2,31,30,1,29,23,18,40,22,37,15,19,38,13,27,39,42,43,44,45,46,47,48,49
o.order("lex").range(30414093201713378043612608166064768844377641568960511999999999998)
49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,0,1
49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0
o.dispose()
```


### Todo

* apply built-in language `iterator`/`iterable` patterns (e.g ES6 `iterator` protocol, Python `__iter__` interface, ..). Combinatorial objects additionaly support a `doubly-linked list`-like interface, i.e `prev`/`next` accessors **[DONE]**
* support `biginteger` combinatorial computations e.g large factorials **[DONE]**, the lib **does not support** biginteger arithmetic, but arithmetic routines have been made **dynamicaly pluggable** and one can use an external implementation to support combinatorics with bigintegers where needed as needed, see test examples for an example
* support **multiple combined custom iterator orderings**, i.e  `lex`, `colex`, `reversed`, `reflected`, `random` seamlessly and uniformly, both forward and backward **[DONE, `random` ordering may be optimised further]**
* support **efficient successor methods** (preferably `CAT/Loopless` methods) to generate next/prev object from current object **[DONE]**
* support **efficient ranking / unranking algorithms** and associated methods (preferably of `O(n)` or `O(nlgn)` complexity) for supported orderings **[DONE]**
* support multiple combinatorial orderings (ie `lex`, `colex`, `reflex`, `refcolex`, `minimal`, ..) **directly in the successor methods**  instead of using post-transformations on object **[DONE]**
* support **unique and uniform random ordering traversals** for all combinatorial objects, so that the space of a combinatorial object can be traversed in **any random ordering uniquely and unbiasedly** (useful in some applications, eg backtracking) **[DONE, see reference, used as custom iterator ordering, see above, may be optimised further]**
* make sure the `.random` methods **uniformly and unbiasedly sample the combinatorial object space** (methods use unbiased sampling algorithms, however results in certain cases might depend on [quality of PRNGs](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)) **[DONE]**
* support algebraic composition/cascading of combinatorial objects (of **fixed** dimensions at present) to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`) **[DONE]**
* support generation of supported combinatorial objects with additional **user-defined patterns/templates of constraints** to satisfy e.g *"only combinatorial objects matching `'(n)(m)(1){2}(){3}(0)((n+1))((n+m)){4}'`"* pattern.. **[DONE]**
* add `LatinSquare`, `MagicSquare` algorithms **[DONE]**
* add run-time/lazy custom and/or built-in filtering support (with support for filter composition as well) to generate and select custom and complex combinatorial objects from filtering other combinatorial objects as efficiently as possible **[DONE]**
* support efficient primality tests and prime sieves **[DONE]**
* support efficient integer factorization algorithms **[DONE PARTIALY]**
* support solutions of (systems of) **linear diophantine and linear congruence equations** (with one or many variables) **[DONE]**
* use sparse representation for polynomials (univariate and multivariate) instead of the, in general, inefficient dense representation (and optimise associated arithmetic operations) **[DONE]**
* support (univariate) polynomial (partial) factorisation, (rational) root finding **[DONE]**
* support multivariate polynomial, multivariate operations **[DONE]** (evaluation/composition missing)
* implement groebner basis computations **[DONE]**
* implement `LLL` algorithm (TODO)
* add efficient `rank`/`unrank` methods for `DerangementPermutation`, `InvolutionPermutation`, `ConnectedPermutation`, `Composition` &amp; `Partition` (TODO)
* full support for `colex` ordering `Composition` &amp; `Partition` **[DONE PARTIALY]**
* support `minimal`/`gray` ordering (and successor) for all supported combinatorial objects (TODO)
* use faster number-theoretic/integer algorithms (maybe fine-tuned further based on if BigInteger Arithmetic is used) if worth the trouble (eg `fibonacci`, `factorial`, `gcd`, ..) **[DONE PARTIALY]**
* use numeric arrays (ie `Uint32`) to store combinatorial items and/or make faster `successor` methods and other numerical routines to `asm.js` (TODO?)
* support generation (and counting) of combinatorial objects (including the basic supported ones) based on **generic user-defined symbolic constraints / symmetries / rules** to satisfy, for example `permutations` defined symbolicaly and directly by their *symmetries / constraints* instead of being hardcoded as elementary objects (TODO?, see using `filtering` as a similar alternative to this approach)
* support *graph-based* combinatorial objects like `Graph`, `Grammar`,.. (TODO?) (for regular grammars and expressions see [RegexAnalyzer](https://github.com/foo123/RegexAnalyzer) for an example)
