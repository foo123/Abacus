/**
*
*   Abacus
*   Computer Algebra and Symbolic Computations System for Combinatorics and Algebraic Number Theory for JavaScript
*   @version: @@VERSION@@ (@@DATE@@)
*   https://github.com/foo123/Abacus
**/
!function(root, name, factory){
"use strict";
if (('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import'])) /* XPCOM */
    (root.$deps = root.$deps||{}) && (root.EXPORTED_SYMBOLS = [name]) && (root[name] = root.$deps[name] = factory.call(root));
else if (('object'===typeof module)&&module.exports) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if (('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if (!(name in root)) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];});
}(/* current root */          'undefined' !== typeof self ? self : this,
  /* module name */           "Abacus",
  /* module factory */        function ModuleFactory__Abacus(undef) {
"use strict";

var  Abacus = {VERSION: "@@VERSION@@"}

    // stdMath
    ,stdMath = Math

    // consts
    ,MAX_DEFAULT = 2147483647 // maximum integer for default arithmetic, cmp Number.MAX_SAFE_INTEGER
    ,EPSILON = 1e-6 //Number.EPSILON // maximum precision (ie 6 significant decimal digits) for irrational floating point operations, eg kthroot
    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32, GRADED = 64
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,MONOMIAL = LEX | GRADED
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED
    ,LEFT = -2, RIGHT = 2
    ,NONCOMMUTATIVE = 0, COMMUTATIVE = 1, ANTICOMMUTATIVE = -1
    ,PREFIX = 2, INFIX = 4, POSTFIX = 8

    // utils
    ,Node, Heap, ListSet
    ,DefaultArithmetic, INUMBER, INumber

    // numerics
    ,Numeric, Integer, IntegerMod, Rational, Complex, nComplex

    // symbolics
    ,Symbolic, Expr, Poly
    ,Polynomial, MultiPolynomial, RationalFunc, Radical
    ,Ring, Matrix

    // iterators
    ,Iterator, CombinatorialIterator
    ,CombinatorialProxy, Filter

    // progressions, sieves
    ,Progression, PrimeSieve

    // combinatorics
    ,Tensor, Permutation, Combination
    ,Subset, Partition, SetPartition, CatalanWord
    ,Diophantine // TODO
    ,LatinSquare, MagicSquare
;
