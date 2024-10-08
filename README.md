# Abacus

A **Combinatorics** and **Algebraic Number Theory** Symbolic Computation library for Javascript, Python


**version 1.0.9 in progress** (~ 331kB minified)

![abacus combinatorial numbers](/abacus.jpg)

[Abacus.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.js),  [Abacus.min.js](https://raw.githubusercontent.com/foo123/Abacus/master/src/js/Abacus.min.js)


`Abacus` is a flexible library containing methods and associated math utilities for (fast) combinatorial object computation and integer / number theoretic computation. It builds on (and extends) a [deprecated previous project for PHP, Simulacra](https://github.com/foo123/Simulacra).

`Abacus` uses (for the most part) self-contained and standalone methods, so they can be easily copy-pasted in other projects, in case only a few methods are needed and not the whole library.


[![Abacus Live](/abacus-live.png)](https://foo123.github.io/examples/abacus)


**see also:**

* [Abacus](https://github.com/foo123/Abacus) advanced Combinatorics and Algebraic Number Theory Symbolic Computation library for JavaScript, Python
* [TensorView](https://github.com/foo123/TensorView) view array data as multidimensional tensors of various shapes efficiently
* [Geometrize](https://github.com/foo123/Geometrize) Computational Geometry and Rendering Library for JavaScript
* [Plot.js](https://github.com/foo123/Plot.js) simple and small library which can plot graphs of functions and various simple charts and can render to Canvas, SVG and plain HTML
* [CanvasLite](https://github.com/foo123/CanvasLite) an html canvas implementation in pure JavaScript
* [Rasterizer](https://github.com/foo123/Rasterizer) stroke and fill lines, rectangles, curves and paths, without canvas
* [Gradient](https://github.com/foo123/Gradient) create linear, radial, conic and elliptic gradients and image patterns without canvas
* [css-color](https://github.com/foo123/css-color) simple class to parse and manipulate colors in various formats
* [MOD3](https://github.com/foo123/MOD3) 3D Modifier Library in JavaScript
* [HAAR.js](https://github.com/foo123/HAAR.js) image feature detection based on Haar Cascades in JavaScript (Viola-Jones-Lienhart et al Algorithm)
* [HAARPHP](https://github.com/foo123/HAARPHP) image feature detection based on Haar Cascades in PHP (Viola-Jones-Lienhart et al Algorithm)
* [FILTER.js](https://github.com/foo123/FILTER.js) video and image processing and computer vision Library in pure JavaScript (browser and node)
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support), based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for PHP, JavaScript, Python
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) grammar-based templating for PHP, JavaScript, Python
* [codemirror-grammar](https://github.com/foo123/codemirror-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for CodeMirror editor
* [ace-grammar](https://github.com/foo123/ace-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for ACE editor
* [prism-grammar](https://github.com/foo123/prism-grammar) transform a formal grammar in JSON format into a syntax-highlighter for Prism code highlighter
* [highlightjs-grammar](https://github.com/foo123/highlightjs-grammar) transform a formal grammar in JSON format into a syntax-highlight mode for Highlight.js code highlighter
* [syntaxhighlighter-grammar](https://github.com/foo123/syntaxhighlighter-grammar) transform a formal grammar in JSON format to a highlight brush for SyntaxHighlighter code highlighter
* [SortingAlgorithms](https://github.com/foo123/SortingAlgorithms) implementations of Sorting Algorithms in JavaScript
* [PatternMatchingAlgorithms](https://github.com/foo123/PatternMatchingAlgorithms) implementations of Pattern Matching Algorithms in JavaScript


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
* `DerangementPermutation` (`test/derangements.js`)
* `InvolutionPermutation` (`test/involutions.js`) **supported order is LEX of swaps**
* `ConnectedPermutation` (`test/connected_permutations.js`) **supported order is LEX of cycle**
* `UnorderedCombination` / `Combination` (`test/combinations.js`)
* `OrderedCombination` / `Variation` / `kPermutation` (`test/ordered_combinations.js`)
* `UnorderedRepeatedCombination` / `RepeatedCombination` (`test/combinations_repeats.js`)
* `OrderedRepeatedCombination` / `RepeatedVariation` / `kTuple` (`test/ordered_combinations_repeats.js`)
* `Subset` (`test/subsets.js`)
* `Partition` (`test/partitions.js`) **partial support for COLEX**
* `Composition` (`test/compositions.js`) **partial support for COLEX**
* `RestrictedPartition` (`test/restricted_partitions.js`) **partial support for COLEX**
* `RestrictedComposition` (`test/restricted_compositions.js`) **partial support for COLEX**
* `SetPartition` (`test/setpartitions.js`) **rank/unrank methods missing, only LEX/REVLEX order**
* `RestrictedSetPartition` (`test/setpartitions.js`) **exactly K #parts, rank/unrank methods missing, only LEX/REVLEX order**
* `CatalanWord` (eg balanced parentheses) (`test/paren.js`) **rank/unrank methods missing**
* `LatinSquare` (`test/latin_squares.js`)
* `MagicSquare` (`test/magic_squares.js`)

* **algebraic composition** and **sequences** of combinatorial objects to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`, see `test/permutations_of_combinations.js` and `test/permutations_of_permutations.js`, `k-Derangements` = `(n,k) Combinations` **combined With** `(n-k) Derangements`, see `test/k-derangements.js` or `all subsets` = `(n,0)Combinations + (n,1)Combinations + .. + (n,n-1)Combinations + (n,n)Combinations`, see `test/combination_subsets.js`)
* custom and built-in **filters** which can select and generate any custom and complex combinatorial object from filtering other combinatorial objects as efficiently as possible (e.g see `test/filtered.js`, `test/filtered_partitions.js`). Also **algebraic / boolean composition of filters** (i.e `.NOT()`, `.AND()`, `.OR()` and so on..). **Note** that filtering should be **used with caution and only if no other method is currently possible** to generate the desired combinatorial object as **filtering is equivalent to exhaustive search** over the space of the original combinatorial object and as such can be an inefficient way to generate a combinatorial object (e.g see `test/filtered.js`). **Note2** with filtering applied some methods like `.total()`, `.hasNext()` still return data of the original object **not** the filtered object since that would require to pre-generate all the data and filter them afterwards instead of doing it one-by-one on each generation and would be impractical and unachievable for very large combinatorial objects, so be careful when using, for example, `.total()` with fitering applied
* **multiple (combined) iterator orderings &amp; traversals**: `lex`, `colex`, `random`, `reversed`, `reflected`, `minimal` (not implemented yet). For example: `"revlex"` (equivalent to `"lex,reversed"`), `"refcolex"`  (equivalent to `"colex,reflected"`), and so on..
* **arbitrary range** of combinatorial objects in a number of supported orderings (ie `lex`, `colex`, `random`,..) (and with filtering applied, if set). **Note** `unrank` methods have to be implemented for this feature to work
* **efficient and unbiased generation, (un)ranking, succession &amp; random methods** for supported combinatorial objects (see below)

**Algebraic Number Theory**
* Numbers, eg `fibonacci`, `catalan`, `bell`, `factorial`, `partition`, `polygonal`, .. (`test/numbers.js`)
* Number Theory Functions, eg `gcd` / `xgcd` / `polygcd` / `polyxgcd` / `groebner`, `divisors`, `moebius`, `legendre`, `jacobi`, `isqrt`, `ikthroot`, .. (`test/number_theory.js`)
* `Integer` (`test/integers.js`), `Rational` (`test/rationals.js`), `Complex` (`test/complex.js`) **supporting arbitrary precision arithmetic**
* `Polynomial`, `MultiPolynomial` (`test/polynomials.js`, `test/multivariate.js`) **univariate / multivariate with coefficients from a Ring/Field**
* `RationalFunc` (`test/ratfuncs.js`) **Rational functions as fractions of multivariate polynomials**
* Algebraic `Ring`s / `Field`s eg. `Ring.Z(), Ring.Q(), Ring.C(), Ring.Q("x","y"), ..` (`test/polynomials.js`, `test/multivariate.js`, `test/ratfuncs.js`)
* `Matrix` (`test/matrices.js`) **with coefficients from a Ring (default: Integer Ring.Z())**
* `Progression` (Infinite, Arithmetic, Geometric) (`test/progressions.js`)
* `PrimeSieve`, Primality Tests, Prime Factorisation (`test/primes.js`)
* `Diophantine`, Linear Equations, Linear Congruences, Pythagorean n-Tuples (`test/diophantine.js`)

* `big-integer arithmetic`, `PRNG`s and other `math` utilities can be **dynamicaly pluggable using external implementations**, making the lib very flexible especialy with respect to handling big-integers &amp; (pseudo-)random number generators (eg examples and tests use the excellent [BigInteger.js](https://github.com/peterolson/BigInteger.js))


### Performance

* `first`/`last`, `random`, `rank`/`unrank` methods use **efficient linear** `O(n)` (or **log-linear** `O(nlgn)`) **time and space** algorithms (**note** a couple of rank/unrank methods are of `O(n^2)` or higher order)
* `random` methods are **statisticaly unbiased** (ie uniform sampling methods, see below as well)
* `successor` methods use **efficient CAT (ie constant amortized time) or Loopless (ie strictly constant time)** algorithms to generate next/prev object from current object (supporting multiple combinatorial orderings along the way, see above) (**note** a couple of methods are **linear time** algorithms because the lib does not use extra space to store information between successive runs and also support static random access to successors so any extra is computed at `run-time`, but can easily be made `CAT` or even `Loopless` by storing extra information, eg current index position)
* **avoid big-integer arithmetic and computational overhead** (except if explicit `ranking` / `unranking` is needed and objects are large)
* symbolic polynomials use efficient sparse representation
* number-theoretic/math computations support pluggable arithmetics (thus if used can compute with arbitrary precision arithmetic), algorithms implemented are efficient but not necessarily the most efficient version (theoretically) possible (eg default Euclidean algorithm for `gcd` used, although optimised), possible to implement even faster algorithms in future verions

**Note** that the lib can generate **very large** (and also **randomised**) combinatorial objects **without ever using** biginteger arithmetic due to design and implementation except if arbitrary `random`, `ranking` and `unranking` have to be used (see above)


### Credits and References

See the comments in the code for algorithms and references used.

* [The Art of Computer Programming, Donald Knuth](http://www-cs-faculty.stanford.edu/~uno/taocp.html)
* [FXT library, Joerg Arndt](http://www.jjj.de/fxt/) and his [PhD thesis](https://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf)
* [Combinatorial Algorithms, Albert Nijenhuis, Herbert Wilf](https://www.math.upenn.edu/~wilf/website/CombAlgDownld.html)
* [Combinatorial Generation, Frank Ruskey](http://www.1stworks.com/ref/ruskeycombgen.pdf)
* [Generating Functionology, Herbert Wilf](http://www.math.upenn.edu/%7Ewilf/gfologyLinked2.pdf)
* [A unified setting for sequencing, ranking, and selection algorithms for combinatorial objects, Herbert Wilf](https://www.sciencedirect.com/science/article/pii/S0001870877800467)
* [Permutation Generation Methods, Robert Sedgewick](http://homepage.math.uiowa.edu/~goodman/22m150.dir/2007/Permutation%20Generation%20Methods.pdf)
* [A Versatile Algorithm to Generate Various Combinatorial Structures, Pramod Ganapathi, Rama B](http://arxiv.org/abs/1009.4214v2)
* [Generating All and Random Instances of a Combinatorial Object, Ivan Stojmenovic](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576) including the section on random generation **without large integers** &amp; **with only one `PRNG` call**
* [Efficient Generation of Set Partitions, Michael Orlov](https://www.informatik.uni-ulm.de/ni/Lehre/WS03/DMM/Software/partitions.pdf)
* [Algorithms for Unranking Combinations and Other Related Choice Functions, Zbigniew Kokosinski](http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
* [Analytic Combinatorics, Philippe Flajolet, Robert Sedgewick](http://algo.inria.fr/flajolet/Publications/book.pdf) can also be used to produce combinatorial generation algorithms instead of just generating functions for counting and statistics
* [Gray Code, wikipedia](https://en.wikipedia.org/wiki/Gray_code)
* [A Survey of Combinatorial Gray Codes, Carla Savage](http://www4.ncsu.edu/~savage/AVAILABLE_FOR_MAILING/survey.pdf)
* [Generalized  Gray  Codes  with  Applications, DAH-JYH GUAN](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.119.1344&rep=rep1&type=pdf)
* [A SIMPLE SEQUENCING AND RANKING METHOD THAT WORKS ON ALMOST ALL GRAY CODES, Timothy R. Walsh](http://www.info2.uqam.ca/~walsh_t/papers/sequencing_and_ranking.pdf)
* [Gray Code Enumeration of Families of Integer Partitions, David Rasmussen, Carla D. Savage, Douglas B. West](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.212.4134&rep=rep1&type=pdf)
* [A GRAY CODE FOR SET PARTITIONS, Richard KAYE](http://www.kaye.to/rick/A%20Gray%20Code%20For%20Set%20Partitions.pdf)
* [Combinatorial Generation by Fusing Loopless Algorithms, Tadao Takaoka, Stephen Violich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.490.1604&rep=rep1&type=pdf)
* [Make good (Pseudo-)Random Number Generators](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)
* [Handbook of Applied Cryptography, Chapter 4](http://cacr.uwaterloo.ca/hac/)
* [The Quadratic Sieve Factoring Algorithm, Eric Landquist](http://www.cs.virginia.edu/crab/QFS_Simple.pdf)
* [A Beginner’s Guide To The General Number Field Sieve, Michael Case](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.219.2389&rep=rep1&type=pdf)
* [Implementation of a New Primality Test, H. Cohen, A.K. Lenstra](https://pdfs.semanticscholar.org/76bb/023a666615ad2d28d4cc9c24068e45a94337.pdf)
* [Integer Algorithms to solve Diophantine Linear Equations and Systems, Florentin Smarandache](https://arxiv.org/ftp/math/papers/0010/0010134.pdf)
* [Linear Diophantine Equations, William J. Gilbert, Anu Pathria](https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf)
* [Chinese Remainder Theorem, wikipedia](https://en.wikipedia.org/wiki/Chinese_remainder_theorem)
* [A multivariable Chinese remainder theorem, Oliver Knill](http://www.math.harvard.edu/~knill/preprints/linear.pdf)
* [Solving a System of Linear Diophantine Equations with Lower and Upper Bounds on the Variables, K. Aardal, C.A.J. Hurkens, A.K. Lenstra](https://www.jstor.org/stable/3690477?seq=1#page_scan_tab_contents)
* [Integer Programming with a Fixed Number of Variables, H.W. Lenstra](https://people.csail.mit.edu/rrw/presentations/Lenstra81.pdf)
* [Integer Programming with 2-Variable Equations and 1-Variable Inequalities, Bodirsky, Nordh, Von Oertzen](http://www.lix.polytechnique.fr/~bodirsky/publications/2var.pdf)
* [Fourier-Motzkin Elimination, wikipedia](https://en.wikipedia.org/wiki/Fourier%E2%80%93Motzkin_elimination)
* [Fourier's Elimination: Which to Choose?, Jean-Louis Imbert](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.51.493&rep=rep1&type=pdf)
* [Complexity Estimates for Fourier-Motzkin Elimination, Rui-Juan Jing, Marc Moreno-Maza, Delaram Talaashrafi](https://arxiv.org/abs/1811.01510v2)
* [Fourier-Motzkin Elimination Extension to Integer Programming Problems , H.P. Williams](https://core.ac.uk/download/pdf/82527959.pdf)
* [Affine Monoids, Hilbert Bases and Hilbert Functions, Robert Koch (PhD thesis)](https://pdfs.semanticscholar.org/ed79/7e8d8a3316f227cb9f180538d3d2150a900d.pdf)
* [Numerical algorithms for the computation of the Smith normal form of integral matrices, C. Koukouvinos, M. Mitrouli, J. Seberry](https://ro.uow.edu.au/cgi/viewcontent.cgi?referer=https://www.google.com/&httpsredir=1&article=2173&context=infopapers)
* [Computational solutions of matrix problems over an integral domain, Erwin H. Bareiss](http://citeseerx.ist.psu.edu/viewdoc/citations;jsessionid=E96A31F468282BD6A13CF5BBE30060DB?doi=10.1.1.909.6404)
* [Fraction-free matrix factors: new forms for LU and QR factors, Wenqin ZHOU, David J. JEFFREY](http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf)
* [Fraction-Free Methods for Determinants, Deanna Richelle Leggett (MSc thesis)](https://pdfs.semanticscholar.org/4188/73bbcad4e7bcdcf14475b4616febbdc729f2.pdf)
* [Moore-Penrose Generalised Inverse, wikipedia](https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse)
* [The Moore-Penrose Pseudoinverse. A Tutorial Review of the Theory, J.C.A. Barata, M.S. Hussein](https://arxiv.org/abs/1110.6882v1)
* [A general matrix eigenvalue algorithm, Charles F. Van Loan](https://www.cs.cornell.edu/cv/ResearchPDF/Gen.Matrix.EigenV.Algorithm.pdf)
* [Algorithms and Data Structures for Sparse Polynomial Arithmetic, M. Asadi, A. Brandt, R. H. C. Moir, M. M. Maza](https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic)
* [High Performance Sparse Multivariate Polynomials: Fundamental Data Structures and Algorithms, Alex Brandt (MSc thesis)](https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1)
* [GCDHEU: Heuristic Polynomial GCD Algorithm Based On Integer GCD Computation, B. W. Char, K. O. Geddes and G. H. Gonnet](https://www.researchgate.net/publication/221149887_GCDHEU_Heuristic_Polynomial_GCD_Algorithm_Based_on_Integer_GCD_Computation)
* [An improved EZ-GCD algorithm for multivariate polynomials, Kuniaki Tsuji](https://core.ac.uk/download/pdf/82335256.pdf)
* [The EEZ-GCD algorithm, Paul S. Wang](https://www.researchgate.net/publication/316347952_The_EEZ-GCD_algorithm)
* [Three new algorithms for multivariate polynomial GCD, T. Sasaki and M. Suzuki](https://www.sciencedirect.com/science/article/pii/S0747717108801058)
* [Greedy Algorithms for Optimizing Multivariate Horner Schemes, M. Ceberio and V. Kreinovich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.330.7430&rep=rep1&type=pdf)
* [Gröbner basis, wikipedia](https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis)
* [Buchberger's algorithm, wikipedia](https://en.wikipedia.org/wiki/Buchberger%27s_algorithm)
* [Faugère's F4 and F5 algorithms, wikipedia](https://en.wikipedia.org/wiki/Faug%C3%A8re%27s_F4_and_F5_algorithms)
* [A Note on Multivariate Polynomial Division and Gröbner Bases, A. T. Lipkovski and S. Zeada](http://elib.mi.sanu.ac.rs/files/journals/publ/117/n111p043.pdf)
* [Roots of multivariate polynomials, Chapter 11](https://www.math.usm.edu/perry/old_classes/mat681sp14/gbasis_notes.pdf)
* [Algorithms for Normal Forms for Matrices of Polynomials and Ore Polynomials, Howard Cheng (PhD thesis)](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.9.4150&rep=rep1&type=pdf)
* [Fast Methods for Large Scale Singular Value Decomposition, Nela Bosner (PhD thesis)](https://web.math.pmf.unizg.hr/~nela/doktorat.pdf)
* [Square-free Decomposition, wikipedia](https://en.wikipedia.org/wiki/Square-free_polynomial)
* [Partial Fraction Decomposition, wikipedia](https://en.wikipedia.org/wiki/Partial_fraction_decomposition)
* [Geometrical properties of polynomial roots, wikipedia](https://en.wikipedia.org/wiki/Geometrical_properties_of_polynomial_roots)
* [Newton's method, wikipedia](https://en.wikipedia.org/wiki/Newton%27s_method)
* [Aberth method, wikipedia](https://en.wikipedia.org/wiki/Aberth_method)
* [Numerical computation of polynomial zeros by means of Aberth's method, D. A. Bini](https://www.researchgate.net/publication/225654837_Numerical_computation_of_polynomial_zeros_by_means_of_Aberth's_method)
* [General Complex Polynomial Root Solver and Its Further Optimization for Binary Microlenses, Jan Skowron and Andrew Gould](http://www.astronomy.ohio-state.edu/~jskowron/paper/paper.pdf)

### Example API

```javascript
let o = Abacus.Permutation(4);
console.log(String(o.total()));
console.log('---');
for (let item of o)
{
    console.log(item.join(','));
}
```

```text
24
---
0,1,2,3
0,1,3,2
0,2,1,3
0,2,3,1
0,3,1,2
0,3,2,1
1,0,2,3
1,0,3,2
1,2,0,3
1,2,3,0
1,3,0,2
1,3,2,0
2,0,1,3
2,0,3,1
2,1,0,3
2,1,3,0
2,3,0,1
2,3,1,0
3,0,1,2
3,0,2,1
3,1,0,2
3,1,2,0
3,2,0,1
3,2,1,0
```

```javascript
let o = Abacus.Partition(6);
console.log(String(o.total()));
console.log('---');
for (let item of o)
{
    console.log(item.join('+'));
}
```

```text
11
---
1+1+1+1+1+1
2+1+1+1+1
2+2+1+1
2+2+2
3+1+1+1
3+2+1
3+3
4+1+1
4+2
5+1
6
```

```javascript
let field = Abacus.Ring.Q("x").associatedField();

let m = Abacus.Matrix(field, [
    [field.fromString("x-1"), field.fromString("x^2-1")],
    [field.fromString("x^2-1"), field.fromString("x-1")]
]);

console.log(m.toString());
console.log(m.inv().toString());
console.log(m.inv().mul(m).toString());
```

```text
|  x-1 x^2-1|
|x^2-1   x-1|

|   -1/(x^3+x^2-2*x) (x+1)/(x^3+x^2-2*x)|
|(x+1)/(x^3+x^2-2*x)    -1/(x^3+x^2-2*x)|

|1 0|
|0 1|
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
* support algebraic composition/cascading of combinatorial objects to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`) **[DONE]**
* support generation of supported combinatorial objects with additional **user-defined patterns/templates of constraints** to satisfy e.g *"only combinatorial objects matching `'(n)(m)(1){2}(){3}(0)((n+1))((n+m)){4}'`"* pattern.. **[DONE]**
* add `LatinSquare`, `MagicSquare` algorithms **[DONE]**
* add run-time/lazy custom and/or built-in filtering support (with support for filter composition as well) to generate and select custom and complex combinatorial objects from filtering other combinatorial objects as efficiently as possible **[DONE]**
* support efficient primality tests and prime sieves **[DONE]**
* support efficient integer factorization algorithms **[DONE PARTIALY]**
* support solutions of (systems of) **linear diophantine and linear congruence equations** (with one or many variables) **[DONE]**
* add Rank Factorisation **[DONE]**
* fix `ginv` (Moore-Penrose Inverse) computation **[DONE]**
* implement (faster) numeric `EVD/SVD` computation (TODO)
* support general and least-squares solutions of arbitrary linear systems **[DONE]**
* use sparse representation for polynomials (univariate and multivariate) instead of the, in general, inefficient dense representation (and optimise associated arithmetic operations) **[DONE]**
* support (univariate) polynomial (partial) factorisation, (rational) root finding **[DONE]**
* support multivariate polynomial, multivariate operations **[DONE]**
* support multivariate polynomial GCD, (approximate) root finding (TODO)
* implement `Aberth` polynomial root finding algorithm (TODO)
* implement `LLL` algorithm (TODO)
* implement groebner basis computations (`Buchberger` algorithm) **[DONE]**
* support generic algebraic Rings and Fields (including rings of polynomials and fraction fields of polynomials) **[DONE]**
* use faster number-theoretic/integer algorithms (maybe fine-tuned further based on if BigInteger Arithmetic is used) if worth the trouble (eg `fibonacci`, `factorial`, `gcd`, ..) **[DONE PARTIALY]**
* full support for `colex` ordering `Composition` &amp; `Partition` **[DONE PARTIALY]**
* add efficient `rank`/`unrank` methods for `Composition` &amp; `Partition` **[DONE]**
* add efficient `rank`/`unrank` methods for `DerangementPermutation`  **[DONE]**
* add efficient `rank`/`unrank` methods for `ConnectedPermutation` **[DONE]**
* add efficient `rank`/`unrank` methods for `InvolutionPermutation` **[DONE] (not very efficient)**
* support `minimal`/`gray` ordering (and successor) for all supported combinatorial objects (TODO)
* support generation (and counting) of combinatorial objects (including the basic supported ones) based on **generic user-defined symbolic constraints / symmetries / rules** to satisfy, for example `permutations` defined symbolicaly and directly by their *symmetries / constraints* instead of being hardcoded as elementary objects (TODO?, see using `filtering` as a similar alternative to this approach)
* support *graph-based* combinatorial objects like `Graph`, `Grammar`,.. (TODO?) (for regular grammars and expressions see [RegexAnalyzer](https://github.com/foo123/RegexAnalyzer) for an example)
