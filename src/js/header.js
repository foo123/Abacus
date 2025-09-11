/**
*
*   Abacus
*   Combinatorics and Algebraic Number Theory Symbolic Computation library for JavaScript
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

    ,PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array[PROTO].slice
    ,HAS = Object[PROTO].hasOwnProperty
    ,KEYS = Object.keys
    ,def = Object.defineProperty
    ,toString = Object[PROTO].toString
    ,stdMath = Math, log2 = stdMath.log2 || function(x) {return stdMath.log(x) / stdMath.LN2;}

    ,trim_re = /^\s+|\s+$/g
    ,trim = String[PROTO].trim ? function(s) {return s.trim();} : function(s) {return s.replace(trim_re, '');}

    ,pos_re = /\[(\d+)\]/g, pos_test_re = /\[(\d+)\]/
    ,in_set_re = /^\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/, not_in_set_re = /^!\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/
    ,dec_pattern = /^(-)?(\d+)(\.(\d+)?(\[\d+\])?)?(e-?\d+)?$/

    ,MAX_DEFAULT = 2147483647 // maximum integer for default arithmetic, cmp Number.MAX_SAFE_INTEGER
    ,EPSILON = 1e-6 //Number.EPSILON // maximum precision (ie 6 significant decimal digits) for irrational floating point operations, eg kthroot

    ,V_EQU = 1, V_DIFF = -1, V_INC = 3, V_DEC = -3, V_NONINC = -2, V_NONDEC = 2

    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED

    ,LEFT = -2, RIGHT = 2, PREFIX = 2, INFIX = 4, POSTFIX = 8

    ,Obj = function() {return Object.create(null);}
    ,NOP = function() {}

    ,Node, Heap, ListSet
    ,DefaultArithmetic, INUMBER, INumber
    // numerics
    ,Numeric, Integer, IntegerMod, Rational, Complex
    // symbolics
    ,Symbolic, Expr, Poly, UniPolyTerm, MultiPolyTerm
    ,PiecewisePolynomial, Polynomial, MultiPolynomial, RationalFunc
    ,Ring, Matrix
    // iterators
    ,Iterator, CombinatorialIterator, CombinatorialProxy, Filter
    // progressions, sieves
    ,Progression, HashSieve, PrimeSieve, Diophantine
    // combinatorics
    ,Tensor, Permutation, Combination
    ,Subset, Partition, SetPartition
    ,CatalanWord, LatinSquare, MagicSquare
;

function Merge(/* args */)
{
    var args = arguments, l = args.length, a, b, i, p;
    a = (l ? args[0] : {}) || {}; i = 1;
    for (;i<l;++i)
    {
        b = args[i];
        if (null == b) continue;
        for (p in b) if (HAS.call(b, p)) a[p] = b[p];
    }
    return a;
}
function Class(supr, proto)
{
    if (1 === arguments.length) {proto = supr; supr = null;/*Object;*/}
    supr = supr || null;
    var klass = proto[CLASS] || function() {};
    if (!proto[CLASS]) proto[CLASS] = klass;
    if (HAS.call(proto, '__static__')) {klass = Merge(klass, proto.__static__); delete proto.__static__;}
    klass[PROTO] = supr ? Merge(Object.create(supr[PROTO]), proto) : proto;
    return klass;
}
