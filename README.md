# Abacus

**Computer Algebra System** for Symbolic Computations for Combinatorics and Algebraic Number Theory for JavaScript and Python


**version 2.0.0** almost complete (372 kB minified)

![abacus computer algebra system](/abacus.jpg)


`Abacus` is a relatively small and versatile computer algebra and symbolic computation system containing methods and math utilities for fast combinatorial object computation and algebraic / number theoretic computation. It builds on, and extends, a deprecated previous project `Simulacra`.


[![Abacus Live Demo](/abacus-live.png)](https://foo123.github.io/examples/abacus)


[![Abacus REPL Online](/abacus-repl.png)](https://foo123.github.io/examples/abacus-repl)


### Contents

* [Live Playground Example](https://foo123.github.io/examples/abacus)
* [Online REPL](https://foo123.github.io/examples/abacus-repl)
* [Combinatorial and Number Theory Examples](/examples/README.md)
* [Features](#features)
* [Performance](#performance)
* [Credits and References](#credits-and-references)
* [Example API](#example-api)
* [Todo](#todo)


### Features

**Supports:** (see: `test/test.bat`)

**Combinatorics:**
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

**Symbolic Computations:**
* Numbers, eg `fibonacci`, `catalan`, `bell`, `factorial`, `partition`, `polygonal`, .. (`test/numbers.js`)
* Number Theory Functions, eg `gcd` / `xgcd` / `polygcd` / `polyxgcd` / `groebner`, `divisors`, `moebius`, `legendre`, `jacobi`, `isqrt`, `ikthroot`, .. (`test/number_theory.js`)
* `Integer`, `Rational`, `Complex` **supporting arbitrary precision arithmetic** (`test/integers.js`, `test/rationals.js`, `test/complex.js`)
* `Polynomial`, `MultiPolynomial` **univariate / multivariate with coefficients from a Ring/Field** (`test/polynomials.js`, `test/multivariate.js`)
* `RationalFunc` **Rational functions as fractions of multivariate polynomials** (`test/ratfuncs.js`)
* Algebraic `Rings` and `Fields` eg. `Ring.Z(), Ring.Q(), Ring.C(), Ring.Q("x","y"), ..` (`test/polynomials.js`, `test/multivariate.js`, `test/rings.js`)
* `Matrix` **with coefficients from a Ring/Field**  (`test/matrices.js`)
* `Expr` **general Symbolic Expressions** (`test/expressions.js`)
* `Progression` (Infinite, Arithmetic, Geometric) (`test/progressions.js`)
* `PrimeSieve`, Primality Tests, Prime Factorisation (`test/primes.js`)
* Diophantine Linear Equations, Linear Congruences, Pythagorean n-Tuples (`test/diophantine.js`)
* Linear Systems, Polynomial Systems, Linear Inequalities (`test/linears.js`, `test/polys.js`, `test/lineqs.js`)

* `big-integer arithmetic`, `PRNG`s and other `math` utilities are **pluggable using external implementations**, making the lib very flexible especialy with respect to handling big-integers &amp; (pseudo-)random number generators (examples use the excellent [BigInteger.js](https://github.com/peterolson/BigInteger.js))


### Performance

* `first`/`last`, `random`, `rank`/`unrank` methods use **efficient linear** `O(n)` (or **log-linear** `O(nlgn)`) **time and space** algorithms (**note** a couple of rank/unrank methods are of `O(n^2)` or higher order)
* `random` methods are **statistically unbiased** (ie uniform sampling methods, see below as well)
* `successor` methods use **efficient CAT (ie constant amortized time) or Loopless (ie strictly constant time)** algorithms to generate next/prev object from current object (supporting multiple combinatorial orderings along the way, see above) (**note** a couple of methods are **linear time** algorithms because the lib does not use extra space to store information between successive runs and also support static random access to successors so any extra is computed at `run-time`, but can easily be made `CAT` or even `Loopless` by storing extra information, eg current index position)
* **avoid big-integer arithmetic and computational overhead** (except if explicit `ranking` / `unranking` is needed and objects are large)
* symbolic polynomials use efficient sparse representation
* number-theoretic/math computations support pluggable arithmetics (thus if used can compute with arbitrary precision arithmetic), algorithms implemented are efficient but not necessarily the most efficient version (theoretically) possible (eg default Euclidean algorithm for `gcd` used, although optimized), possible to implement even faster algorithms in future verions

**Note** that `Abacus` can generate **very large**, and also **randomized**, combinatorial objects **without ever using** biginteger arithmetic due to design and implementation, except if arbitrary `random`, `ranking` and `unranking` have to be used (see above)


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
* [Non-modular computation of polynomial GCDS using trial division, Anthony C. Hearn](https://link.springer.com/chapter/10.1007/3-540-09519-5_74)
* [Three new algorithms for multivariate polynomial GCD, T. Sasaki and M. Suzuki](https://www.sciencedirect.com/science/article/pii/S0747717108801058)
* [Greedy Algorithms for Optimizing Multivariate Horner Schemes, M. Ceberio and V. Kreinovich](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.330.7430&rep=rep1&type=pdf)
* [Resultant, wikipedia](https://en.wikipedia.org/wiki/Resultant)
* [Discriminant, wikipedia](https://en.wikipedia.org/wiki/Discriminant)
* [Gröbner basis, wikipedia](https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis)
* [Buchberger's algorithm, wikipedia](https://en.wikipedia.org/wiki/Buchberger%27s_algorithm)
* [Faugère's F4 and F5 algorithms, wikipedia](https://en.wikipedia.org/wiki/Faug%C3%A8re%27s_F4_and_F5_algorithms)
* [Partial Fraction Decomposition, wikipedia](https://en.wikipedia.org/wiki/Partial_fraction_decomposition)
* [A Note on Multivariate Polynomial Division and Gröbner Bases, A. T. Lipkovski and S. Zeada](http://elib.mi.sanu.ac.rs/files/journals/publ/117/n111p043.pdf)
* [Factorization of polynomials, wikipedia](https://en.wikipedia.org/wiki/Factorization_of_polynomials)
* [Rational root theorem, wikipedia](https://en.wikipedia.org/wiki/Rational_root_theorem)
* [Square-free Decomposition, wikipedia](https://en.wikipedia.org/wiki/Square-free_polynomial)
* [Factorization of polynomials over finite fields, wikipedia](https://en.wikipedia.org/wiki/Factorization_of_polynomials_over_finite_fields)
* [Symbolic factoring of polynomials in several variables, Dale E. Jordan, Lewis C. Clapp, Richard Y. Kain](https://dl.acm.org/doi/abs/10.1145/365758.365809)
* [Aberth method, wikipedia](https://en.wikipedia.org/wiki/Aberth_method)
* [Numerical computation of polynomial zeros by means of Aberth's method, D. A. Bini](https://www.researchgate.net/publication/225654837_Numerical_computation_of_polynomial_zeros_by_means_of_Aberth's_method)
* [Improved Aberth-Ehrlich root-finding algorithm and its further application for Binary Microlensing, Hossein Fatheddin, Sedighe Sajadian](https://arxiv.org/abs/2206.00482)
* [Newton's method, wikipedia](https://en.wikipedia.org/wiki/Newton%27s_method)
* [Roots of multivariate polynomials, Chapter 11](https://www.math.usm.edu/perry/old_classes/mat681sp14/gbasis_notes.pdf)
* [Geometrical properties of polynomial roots, wikipedia](https://en.wikipedia.org/wiki/Geometrical_properties_of_polynomial_roots)
* [Solving Systems of Algebraic Equations by Using Gröbner Bases, Michael Kalkbrener](http://kalkbrener.at/Selected_publications_files/Kalkbrener87.pdf)
* [Use Gröbner Bases To Solve Polynomial Equations, Jingnan Shi](https://jingnanshi.com/blog/groebner_basis.html)
* [Faster Linear Unification Algorithm, Dennis de Champeaux](https://raw.githubusercontent.com/ddccc/Unification/a5975a47bca1be3f7bf0afe9ad3595a707a29ea4/LinUnify3.pdf)

### Example API

```javascript
const o = Abacus.Permutation(4);
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
const o = Abacus.Partition(6);
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
const p = Abacus.Expr("ax^2 + bx + c").toPoly("x");
console.log(p.discriminant().toString());

const ring = Abacus.Ring.Q("x", "y");
const p1 = ring.fromString("x^2*y + x^3");
const p2 = ring.fromString("(x + y)^2");
const p3 = ring.fromString("x^2 + x*y^2 + x*y + x + y^3 + y");
console.log(ring.gcd(p1, p2, p3).toString());

console.log(ring.fromString("x^2+y").resultant(ring.fromString("x-2*y"), "x").toString());
console.log(ring.fromString("x^2+y").resultant(ring.fromString("x-2*y"), "y").toString());
```

```text
-4*a*c + b^2

x + y

4*y^2 + y
2*x^2 + x
```

```javascript
const field1 = Abacus.Ring.Q("x").associatedField();

const m1 = Abacus.Matrix(field1, [
    ["x-1", "x^2-1"],
    ["x^2-1", "x-1"]
]);

console.log(m1.toString());
console.log(m1.inv().toString());
console.log(m1.inv().mul(m1).toString());

const field2 = Abacus.Ring.Q("x","y").associatedField();

const m2 = Abacus.Matrix(field2, [
    ["x^2 + x*y", "x*y + y^2"],
    ["x*y + y^2", "x^2 + x*y"]
]);

console.log(m2.toString());
console.log(m2.inv().toString());
console.log(m2.inv().mul(m2).toString());
```

```text
|  x-1 x^2-1|
|x^2-1   x-1|

|   -1/(x^3+x^2-2*x) (x+1)/(x^3+x^2-2*x)|
|(x+1)/(x^3+x^2-2*x)    -1/(x^3+x^2-2*x)|

|1 0|
|0 1|

|x^2 + x*y x*y + y^2|
|x*y + y^2 x^2 + x*y|

| x/(x^3 + x^2*y - x*y^2 - y^3)      -y/(x^3 + x^2*y - x*y^2 - y^3)|
|-y/(x^3 + x^2*y - x*y^2 - y^3) x*y/(x^3*y + x^2*y^2 - x*y^3 - y^4)|

|1 0|
|0 1|
```

### Todo

* apply built-in language `iterator`/`iterable` patterns (ES6 `iterator` protocol). Combinatorial objects additionaly support a `doubly-linked list`-like interface, i.e `prev`/`next` accessors **[DONE]**
* support exact `biginteger` arithmetic computations e.g large factorials **[DONE]**, arithmetic routines have been made **pluggable** and one can use an external implementation, see examples
* support **multiple combined custom iterator orderings**, i.e  `lex`, `colex`, `reversed`, `reflected`, `random` seamlessly and uniformly, both forward and backward **[DONE]**, `random` ordering may be optimized further
* support multiple combinatorial orderings (ie `lex`, `colex`, `reflex`, `refcolex`, `minimal`, ..) **directly in the successor methods**  instead of using post-transformations on object **[DONE]**
* implement **efficient successor methods** (preferably `CAT/Loopless` methods) to generate next/prev object from current object **[DONE]**
* implement **efficient ranking / unranking algorithms** and associated methods (preferably of `O(n)` or `O(nlgn)` complexity) for supported orderings **[DONE]**
* implement efficient `rank`/`unrank` methods for `Composition` &amp; `Partition` **[DONE]**
* implement efficient `rank`/`unrank` methods for `DerangementPermutation`  **[DONE]**
* implement efficient `rank`/`unrank` methods for `ConnectedPermutation` **[DONE]**
* implement efficient `rank`/`unrank` methods for `InvolutionPermutation` **[DONE]** (not very efficient)
* full support for `colex` ordering `Composition` &amp; `Partition` **[DONE PARTIALLY]**
* support `minimal`/`gray` ordering (and successor) for all supported combinatorial objects (TODO)
* support **unique and uniform random ordering traversals** for all combinatorial objects, so that the space of a combinatorial object can be traversed in **any random ordering uniquely and unbiasedly** (useful in some applications, eg backtracking) **[DONE]**, used as custom iterator ordering, may be optimized further
* make sure the `random()` methods **uniformly and unbiasedly sample the combinatorial object space** (methods use unbiased sampling algorithms, however results in certain cases might depend on [quality of PRNGs](http://www0.cs.ucl.ac.uk/staff/d.jones/GoodPracticeRNG.pdf)) **[DONE]**
* support algebraic composition/cascading of combinatorial objects to construct new combinatorial objects (eg `all combinations` = `all permutations` **OF** `all unique combinations`) **[DONE]**
* support generation of supported combinatorial objects with additional **user-defined patterns/templates of constraints** to satisfy e.g *"only combinatorial objects matching `'(n)(m)(1){2}(){3}(0)((n+1))((n+m)){4}'`"* pattern.. **[DONE]**
* implement `LatinSquare`, `MagicSquare` algorithms **[DONE]**
* add run-time/lazy custom and/or built-in filtering support (with support for filter composition as well) to generate and select custom and complex combinatorial objects from filtering other combinatorial objects as efficiently as possible **[DONE]**
* implement efficient primality tests and prime sieves **[DONE PARTIALLY]**
* implement efficient integer factorization algorithms **[DONE PARTIALLY]**
* implement more efficient integer algorithms (maybe fine-tuned if BigInteger Arithmetic is used) (eg `fibonacci`, `factorial`, ..) **[DONE PARTIALLY]**
* implement more efficient integer `GCD` algorithm (TODO)
* implement `Rank Factorisation` **[DONE]**
* implement `GINV` (Moore-Penrose Inverse) computation **[DONE]**
* implement numeric `EVD / SVD` computation  **[DONE]**
* support general symbolic expressions and computations in `Expr` **[DONE]**
* support solutions of systems of **linear diophantine and linear congruence equations** (with one or many variables) **[DONE]**
* support general and least-squares solutions of systems of **arbitrary linear equations** **[DONE]**
* support solutions of systems of **linear inequalities** (with one or many variables) **[DONE]**
* support solutions of systems of **linear diophantine and linear congruence inequalities** (with one or many variables) (TODO)
* support exact rational solutions of systems of **arbitrary multivariate polynomial equations** **[DONE]**
* support all exact solutions of systems of **arbitrary multivariate polynomial equations** **[DONE PARTIALLY]**
* implement multivariate polynomials, multivariate operations, multivariate orderings **[DONE]**
* implement optimized sparse representation and computations for polynomials instead of the inefficient dense representation **[DONE]**
* implement univariate polynomial factorization, rational root finding (`Kronecker` algorithm) **[DONE]**
* implement univariate polynomial exact root finding for solvable polynomials **[DONE]**
* implement univariate polynomial approximate root finding (`Aberth` algorithm) **[DONE]**
* implement multivariate polynomial factorization (recursive `Kronecker` algorithm) **[DONE]**
* implement multivariate polynomial approximate root finding (TODO)
* implement recursive multivariate polynomial `GCD` from univariate polynomial `GCD` **[DONE]**
* implement more efficient polynomial `GCD` algorithm (TODO)
* implement polynomial `Resultant`, `Discriminant` computations **[DONE]**
* implement `Groebner Basis` computations (`Buchberger` algorithm) **[DONE]**
* implement more efficient `Groebner Basis` computations (TODO)
* implement `LLL` algorithm (TODO)
* support generic algebraic Rings and Fields (including rings of polynomials and fraction fields of polynomials) **[DONE]**
* support algebraic sub-Rings and sub-Fields (eg **Q(y,z)(x)** with coefficients from the subring **Q(y,z)**) **[DONE]**
* support *graph* combinatorial objects like `Graph`, `Grammar`,.. (TODO?) (for regular grammars and expressions see [RegexAnalyzer](https://github.com/foo123/RegexAnalyzer) for an example)


**see also:**

* [Abacus](https://github.com/foo123/Abacus) Computer Algebra and Symbolic Computation System for Combinatorics and Algebraic Number Theory for JavaScript and Python
* [SciLite](https://github.com/foo123/SciLite) Scientific Computing Environment similar to Octave/Matlab in pure JavaScript
* [TensorView](https://github.com/foo123/TensorView) view array data as multidimensional tensors of various shapes efficiently
* [FILTER.js](https://github.com/foo123/FILTER.js) video and image processing and computer vision Library in pure JavaScript (browser and nodejs)
* [HAAR.js](https://github.com/foo123/HAAR.js) image feature detection based on Haar Cascades in JavaScript (Viola-Jones-Lienhart et al Algorithm)
* [HAARPHP](https://github.com/foo123/HAARPHP) image feature detection based on Haar Cascades in PHP (Viola-Jones-Lienhart et al Algorithm)
* [Fuzzion](https://github.com/foo123/Fuzzion) a library of fuzzy / approximate string metrics for PHP, JavaScript, Python
* [Matchy](https://github.com/foo123/Matchy) a library of string matching algorithms for PHP, JavaScript, Python
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for PHP, JavaScript, Python
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support), based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) grammar-based templating for PHP, JavaScript, Python
* [codemirror-grammar](https://github.com/foo123/codemirror-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for CodeMirror editor
* [ace-grammar](https://github.com/foo123/ace-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for ACE editor
* [prism-grammar](https://github.com/foo123/prism-grammar) transform a formal grammar in JSON format into a syntax-highlighter for Prism code highlighter
* [highlightjs-grammar](https://github.com/foo123/highlightjs-grammar) transform a formal grammar in JSON format into a syntax-highlight mode for Highlight.js code highlighter
* [syntaxhighlighter-grammar](https://github.com/foo123/syntaxhighlighter-grammar) transform a formal grammar in JSON format to a highlight brush for SyntaxHighlighter code highlighter
* [MOD3](https://github.com/foo123/MOD3) 3D Modifier Library in JavaScript
* [Geometrize](https://github.com/foo123/Geometrize) Computational Geometry and Rendering Library for JavaScript
* [Plot.js](https://github.com/foo123/Plot.js) simple and small library which can plot graphs of functions and various simple charts and can render to Canvas, SVG and plain HTML
* [CanvasLite](https://github.com/foo123/CanvasLite) an html canvas implementation in pure JavaScript
* [Rasterizer](https://github.com/foo123/Rasterizer) stroke and fill lines, rectangles, curves and paths, without canvas
* [Gradient](https://github.com/foo123/Gradient) create linear, radial, conic and elliptic gradients and image patterns without canvas
* [css-color](https://github.com/foo123/css-color) simple class to parse and manipulate colors in various formats
* [PatternMatchingAlgorithms](https://github.com/foo123/PatternMatchingAlgorithms) library of Pattern Matching Algorithms in JavaScript using [Matchy](https://github.com/foo123/Matchy)
* [SortingAlgorithms](https://github.com/foo123/SortingAlgorithms) library of Sorting Algorithms in JavaScript
