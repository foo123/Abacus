/**
*
*   Abacus
*   Combinatorics and Algebraic Number Theory Symbolic Computation library for Node.js/Browser/XPCOM Javascript, Python, Java
*   @version: 1.0.6
*   https://github.com/foo123/Abacus
**/
!function( root, name, factory ){
"use strict";
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.$deps = root.$deps||{}) && (root.EXPORTED_SYMBOLS = [name]) && (root[name] = root.$deps[name] = factory.call(root));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "Abacus",
    /* module factory */        function ModuleFactory__Abacus( undef ){
"use strict";

var  Abacus = {VERSION: "1.0.6"}, stdMath = Math, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array[PROTO].slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,log2 = stdMath.log2 || function(x) { return stdMath.log(x) / stdMath.LN2; }
    ,trim_re = /^\s+|\s+$/g
    ,trim = String[PROTO].trim ? function( s ){ return s.trim(); } : function( s ){ return s.replace(trim_re, ''); }
    ,pos_re = /\[(\d+)\]/g, pos_test_re = /\[(\d+)\]/
    ,in_set_re = /^\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/, not_in_set_re = /^!\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/
    ,dec_pattern = /^(-)?(\d+)(\.(\d+)?(\[\d+\])?)?(e-?\d+)?$/

    ,Obj = function( ){ return Object.create(null); }
    ,Extend = Object.create, KEYS = Object.keys
    ,Merge = function Merge(/* args */) {
        var args = arguments, l = args.length, a, b, i, p;
        a = (l ? args[0] : {}) || {}; i = 1;
        while(i<l)
        {
            b = args[i++];
            if ( null == b ) continue;
            for (p in b) if (HAS.call(b,p)) a[p] = b[p];
        }
        return a;
    }
    ,Class = function Class(s, c) {
        if ( 1 === arguments.length ) { c = s; s = null;/*Object;*/ }
        s = s || null;
        var ctor = c[CLASS] || function(){};
        if ( HAS.call(c,'__static__') ) { ctor = Merge(ctor, c.__static__); delete c.__static__; }
        ctor[PROTO] = s ? Merge(Extend(s[PROTO]), c) : c;
        return ctor;
    }

    ,MAX_DEFAULT = 2147483647 // maximum integer for default arithmetic, cmp Number.MAX_SAFE_INTEGER
    ,EPSILON = 1e-6 //Number.EPSILON // maximum precision (ie 6 significant decimal digits) for irrational floating point operations, eg kthroot

    ,V_EQU=1, V_DIFF=-1, V_INC=3, V_DEC=-3, V_NONINC=-2, V_NONDEC=2

    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED

    ,Node, Heap
    ,DefaultArithmetic, INUMBER, INumber, Numeric, Integer, IntegerMod, Rational, Complex
    ,Symbolic, SymbolTerm, PowTerm, MulTerm, AddTerm, Expr, RationalExpr, Op, RelOp, Func
    ,UniPolyTerm, MultiPolyTerm, Poly, PiecewisePolynomial, Polynomial, MultiPolynomial, RationalFunc
    ,Ring, Matrix
    ,Iterator, CombinatorialIterator, Filter
    ,Progression, HashSieve, PrimeSieve, Diophantine
    ,Tensor, Permutation, Combination, Subset, Partition, SetPartition, CatalanWord
    ,LatinSquare, MagicSquare
;

// utility methods
function NotImplemented( ) { throw new Error("Method not implemented!"); }
function ID( x ) { return x; }
function is_array( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
function is_args( x ) { return ('[object Arguments]' === toString.call(x)) && (null != x.length); }
function is_obj( x ) { return /*(x instanceof Object) ||*/ ('[object Object]' === toString.call(x)); }
function is_string( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
function is_number( x ) { return "number"===typeof x; }
function is_callable( x ) { return "function"===typeof x; }
function is_class( C1, C2 )
{
    // C1 is same class as C2, or is a subclass of C2
    if ( is_callable(C1) )
    {
        if ( is_array(C2) )
        {
            for(var i=0,n=C2.length; i<n; i++)
            {
                if ( is_callable(C2[i]) && ((C1===C2[i]) || (C1[PROTO] instanceof C2[i])) )
                    return true;

            }
        }
        else if ( is_callable(C2) )
        {
            return (C1===C2) || (C1[PROTO] instanceof C2);
        }
    }
    return false;
}
function is_instance( x, C )
{
    // x is object of class C
    if ( is_array(C) )
    {
        for(var i=0,n=C.length; i<n; i++)
        {
            if ( is_callable(C[i]) && (x instanceof C[i]) )
                return true;

        }
    }
    else if ( is_callable(C) )
    {
        return (x instanceof C);
    }
    return false;
}
function to_fixed_binary_string_32( b )
{
    var bs = b.toString( 2 ), n = 32-bs.length;
    return n > 0 ? new Array(n+1).join('0') + bs : bs;
}
function to_tex( s )
{
    var p = String(s).split('_');
    return p[0] + (p.length > 1 ? ('_{'+p[1]+'}') : '');
}
function Tex( s ) { return is_callable(s.toTex) ? s.toTex() : String(s); }

// https://github.com/foo123/FnList.js
function operate( F, F0, x, i0, i1, ik, strict )
{
    var Fv = F0, i, ii, ikk, di, i0r, i00, i11,
        rem, last = null, x_array = x && (is_array(x) || is_args(x));
    if ( x_array )
    {
        if ( null == i0 ) i0 = 0;
        if ( null == i1 ) i1 = x.length-1;
    }
    if ( null == ik ) ik = i0 > i1 ? -1 : 1;
    if ( (0 === ik) || (x_array && !x.length) || (0 >= stdMath.floor((i1-i0)/ik)+1) ) return Fv;

    if ( 0 > ik )
    {
        // remove not reachable range (not multiple of step ik)
        rem = (i0-i1)%(-ik); if ( rem ) last = i1;
        i1 += rem; i00 = i1; i11 = i0;
        di = -1; ikk = -((-ik) << 4);
    }
    else
    {
        // remove not reachable range (not multiple of step ik)
        rem = (i1-i0)%ik; if ( rem ) last = i1;
        i1 -= rem; i00 = i0; i11 = i1;
        di = 1; ikk = (ik << 4);
    }
    // unroll the rest range mod 16 + remainder
    i0r = i0+ik*(stdMath.floor((i1-i0)/ik+1)&15);

    if ( x_array )
    {
        i00 = stdMath.max(0,i00); i11 = stdMath.min(x.length-1,i11);
        for(i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv,x[i],i);
        for(ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
            i+=ik; Fv = F(Fv,x[i],i);
        }
        if ( (true===strict) && (null!==last) && (0<=last && last<x.length) ) Fv = F(Fv,x[last],last);
    }
    else
    {
        for(i=i0; i00<=i && i<=i11 && 0<di*(i0r-i); i+=ik) Fv = F(Fv,i,i);
        for(ii=i0r; i00<=ii && ii<=i11; ii+=ikk)
        {
            i =ii; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
            i+=ik; Fv = F(Fv,i,i);
        }
        if ( (true===strict) && (null!==last) ) Fv = F(Fv,last,last);
    }
    return Fv;
}
function array( n, x0, xs )
{
    var x = is_args(n) ? slice.call(n) : (is_array(n) ? n : ((n=(n|0)) > 0 ? new Array(n) : []));
    n = x.length;
    if ( (0 < n) && (null != x0) )
    {
        xs = xs||0;
        var xk = x0;
        operate(is_callable(x0) ? function(x,xi,i){
            x[i] = x0(i); return x;
        } : (x0 === +x0 ? function(x,xi,i){
            x[i] = xk; xk += xs; return x;
        } : function(x,xi,i){
            x[i] = x0; return x;
        }), x, x);
    }
    return x;
}
function pluck( b, a, k )
{
    return operate(function(b, ai, i){
        b[i] = ai[k]; return b;
    }, b, a);
}
function complementation( b, a, n, a0, a1 )
{
    if ( null == a ) return b;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i]-1-ai; return b;
    } : function(b, ai, i){
        b[i] = n-1-ai; return b;
    }, b, a, a0, a1);
}
function reflection( b, a, n, a0, a1 )
{
    if ( null == a ) return b;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( b!==a || a0<a1 ) for(var t,l=a0,r=a1; l<=r; l++,r--) { t = a[l]; b[l] = a[r]; b[r] = t; }
    return b;
}
function reversion( n, n0 )
{
    if ( null == n0 ) n0 = 0;
    return is_array(n) ? array(n, is_array(n0) ? function(i){
        return n0[i]-1-n[n.length-1-i];
    } : function(i){
        return n0-n[i];
    }) : ((n===+n)&&(n0===+n0) ? (n0-n) : Abacus.Arithmetic.sub(Abacus.Arithmetic.num(n0),n));
}
function gray( b, a, n, a0, a1 )
{
    // adapted from https://en.wikipedia.org/wiki/Gray_code#n-ary_Gray_code
    if ( null == a ) return b;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i]>0 ? (ai + s) % n[i] : 0; s += n[i]-b[i]; return b;
    } : function(b, ai, i){
        b[i] = (ai + s) % n; s += n-b[i]; return b;
    }, b, a, a0, a1);
}
function shift( b, a, k, a0, a1 )
{
    if ( null == a ) return b;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == a0 ) a0 = 0;
    return b!==a || 0!==k ? operate(function(b,ai,i){
        b[i+k] = ai; return b;
    }, b, a, 0>k?a0:a1, 0>k?a1:a0, 0>k?1:-1) : b;
}
function fdiff/*finite_difference*/( b, a, c1, c0, a0, a1, b0, b1 )
{
    if ( null == a ) return null;
    if ( null == c1 ) c1 = 1;
    if ( null == c0 ) c0 = 0;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = a0;
    if ( null == b1 ) b1 = a1;
    var d0 = 0, bk = b0 > b1 ? -1 : 1, bi = b0;
    return operate(function(b, ai, i){
        ai=c0+c1*ai; b[bi] = ai-d0; d0 = ai; bi+=bk; return b;
    }, b, a, a0, a1);
}
function psum/*partial_sum*/( b, a, c1, c0, a0, a1, b0, b1 )
{
    if ( null == a ) return null;
    if ( null == c1 ) c1 = 1;
    if ( null == c0 ) c0 = 0;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = a0;
    if ( null == b1 ) b1 = a1;
    var s = 0, bk = b0 > b1 ? -1 : 1, bi = b0;
    return operate(function(b, ai, i){
        s+=ai; b[bi] = c0+c1*s; bi+=bk; return b;
    }, b, a, a0, a1);
}
function unique( a, a0, a1 )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;

    var n = a1-a0+1, dict, key, uniq, ul;
    if ( 1 >= n ) return 1 === n ? [a[a0]] : [];
    dict = Obj(); uniq = new Array(n); ul = 0;
    while(a0 <= a1)
    {
        key = String(a[a0]);
        if ( !dict[key] ) { uniq[ul++] = a[a0]; dict[key] = 1; }
        a0++;
    }
    // truncate if needed
    if ( uniq.length > ul ) uniq.length = ul;
    return uniq;
}
function intersection( comm, a, b, dir, a0, a1, b0, b1 )
{
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b.length-1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, il = 0;
    if ( null == comm ) comm = new Array(stdMath.min(al,bl));
    if ( 0 === comm.length ) return comm;

    // O(min(al,bl))
    // assume lists are already sorted ascending/descending (indepentantly)
    while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
    {
        if      ( (1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]) )
        {
            ai+=ak;
        }
        else if ( (1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]) )
        {
            bi+=bk;
        }
        else // they're equal
        {
            comm[il++] = a[ ai ];
            ai+=ak; bi+=bk;
        }
    }
    // truncate if needed
    if ( il < comm.length ) comm.length = il;
    return comm;
}
function difference/*complement*/( diff, a, b, dir, a0, a1, b0, b1, duplicates )
{
    duplicates = true === duplicates;
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a === +a ? a-1 : a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b ? b.length-1 : -1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, dl = 0;
    if ( !b || !b.length ) return a === +a ? array(a, a0, ak) : (a ? a.slice() : a);
    if ( null == diff ) diff = new Array(duplicates?2*al:al);

    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    if ( a === +a )
    {
        while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
        {
            if      ( ai === b[bi] )
            {
                if ( duplicates ) diff[dl++] = ai;
                ai+=ak; bi+=bk;
            }
            else if ( (1===dir && ai>b[bi]) || (-1===dir && ai<b[bi]) )
            {
                bi+=bk;
            }
            else//if ( (1===dir && ai<b[bi]) || (-1===dir && ai>b[bi]) )
            {
                diff[dl++] = ai; ai+=ak;
            }
        }
        while( 0 <= ak*(a1-ai) ) { diff[dl++] = ai; ai+=ak; }
    }
    else
    {
        while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
        {
            if      ( a[ai] === b[bi] )
            {
                if ( duplicates ) diff[dl++] = a[ai];
                ai+=ak; bi+=bk;
            }
            else if ( (1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]) )
            {
                bi+=bk;
            }
            else//if ( (1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]) )
            {
                diff[dl++] = a[ ai ]; ai+=ak;
            }
        }
        while( 0 <= ak*(a1-ai) ) { diff[dl++] = a[ai]; ai+=ak; }
    }
    // truncate if needed
    if ( dl < diff.length ) diff.length = dl;
    return diff;
}
function multi_difference( diff, mult, a, b, a0, a1, b0, b1 )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b ? b.length-1 : -1;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = b0, dl = 0;
    if ( !b || !b.length ) return a ? a.slice() : a;
    if ( null == diff ) diff = new Array(al);

    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
    {
        if      ( a[ai] === b[bi] )
        {
            if( 1 < mult[a[ai]] )
            {
                mult[a[ai]]--;
            }
            else
            {
                ai+=ak;
                bi+=bk;
            }
        }
        else if ( a[ai]>b[bi] )
        {
            bi+=bk;
        }
        else//if ( a[ai]<b[bi] )
        {
            diff[dl++] = a[ai];
            mult[a[ai]]--;
            ai+=ak;
        }
    }
    while( 0 <= ak*(a1-ai) )
    {
        if( 0 < mult[a[ai]] ) diff[dl++] = a[ai];
        mult[a[ai]]--; ai+=ak;
    }
    // truncate if needed
    if ( dl < diff.length ) diff.length = dl;
    return diff;
}
function merge/*union*/( union, a, b, dir, a0, a1, b0, b1, indices, unique, inplace )
{
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b.length-1;
    if ( true === indices )
    {
        unique = false;
    }
    else
    {
        indices = false;
        unique = false !== unique;
    }
    inplace = true === inplace;

    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ul = al+bl,
        ai = a0, bi = b0, ui = 0, last = null, with_duplicates = !unique;
    if ( null == union ) union = new Array(ul);
    if ( 0 === union.length ) return inplace ? a : union;

    // O(al+bl)
    // assume lists are already sorted ascending/descending (independantly), even with duplicate values
    while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
    {
        if      (unique && ui) // handle any possible duplicates inside SAME list
        {
            if ( a[ai] === last )
            {
                ai+=ak;
                continue;
            }
            else if ( b[bi] === last )
            {
                bi+=bk;
                continue;
            }
        }
        if ( indices )
        {
            if      ( (1===dir && a[ai][0]<b[bi][0]) || (-1===dir && a[ai][0]>b[bi][0]) )
            {
                union[ui++] = last=a[ai];
                ai+=ak;
            }
            else if ( (1===dir && a[ai][0]>b[bi][0]) || (-1===dir && a[ai][0]<b[bi][0]) )
            {
                union[ui++] = last=b[bi];
                bi+=bk;
            }
            else // they're equal, push one unique
            {
                // make it stable
                if ( (1===dir && a[ai][1]<b[bi][1]) || (-1===dir && a[ai][1]>b[bi][1]) )
                {
                    union[ui++] = last=a[ai];
                    if ( with_duplicates ) union[ui++] = b[bi];
                }
                else
                {
                    union[ui++] = last=b[bi];
                    if ( with_duplicates ) union[ui++] = a[ai];
                }
                ai+=ak; bi+=bk;
            }
        }
        else
        {
            if      ( (1===dir && a[ai]<b[bi]) || (-1===dir && a[ai]>b[bi]) )
            {
                union[ui++] = last=a[ai];
                ai+=ak;
            }
            else if ( (1===dir && a[ai]>b[bi]) || (-1===dir && a[ai]<b[bi]) )
            {
                union[ui++] = last=b[bi];
                bi+=bk;
            }
            else // they're equal, push one unique
            {
                union[ui++] = last=a[ai];
                if ( with_duplicates ) union[ui++] = b[bi];
                ai+=ak; bi+=bk;
            }
        }
    }
    while( 0 <= ak*(a1-ai) )
    {
        if ( with_duplicates || (a[ai]!==last) )
        {
            union[ui++] = last=a[ai];
            ai+=ak;
        }
    }
    while( 0 <= bk*(b1-bi) )
    {
        if ( with_duplicates || (b[bi]!==last) )
        {
            union[ui++] = last=b[bi];
            bi+=bk;
        }
    }
    if ( inplace )
    {
        // move the merged back to the a array
        for(ai=0>ak?a1:a0,ui=0; ui<ul; ui++,ai++) a[ai] = union[ui];
        return a;
    }
    else
    {
        // truncate if needed
        if ( ui < union.length ) union.length = ui;
        return union;
    }
}
function sortedrun( a, a0, a1, index, indices, dir )
{
    // findout already sorted chunks either ascending or descending
    var ap, ai, i, i0, i1, d0, i2, i3, d1;
    index[0] = -1; index[1] = -1; index[2] = 0;
    index[3] = -1; index[4] = -1; index[5] = 0;
    d0 = 0; d1 = 0;
    i0 = a0; i1 = -1;
    for(ap=indices?a[i0][0]:a[i0],i=i0+1; i<=a1; i++)
    {
        ai = indices?a[i][0]:a[i];
        if ( ap < ai )
        {
            if ( -1 === d0 ) { i1 = i-1; break; }
            else if ( 0 === d0 ) d0 = 1;
        }
        else if ( ap > ai )
        {
            if ( 1 === d0 ) { i1 = i-1; break; }
            else if ( 0 === d0 ) d0 = -1;
        }
        ap = ai;
    }
    if ( 0 === d0 ) d0 = dir;
    if ( -1 === i1 )
    {
        i1 = a1; index[0] = i0; index[1] = i1; index[2] = d0;
    }
    else
    {
        i2 = i1+1; i3 = -1;
        for(ap=indices?a[i2][0]:a[i2],i=i2+1; i<=a1; i++)
        {
            ai = indices?a[i][0]:a[i];
            if ( ap < ai )
            {
                if ( -1 === d1 ) { i3 = i-1; break; }
                else if ( 0 === d1 ) d1 = 1;
            }
            else if ( ap > ai )
            {
                if ( 1 === d1 ) { i3 = i-1; break; }
                else if ( 0 === d1 ) d1 = -1;
            }
            ap = ai;
        }
        if ( -1 === i3 ) i3 = a1;
        if ( 0 === d1 ) d1 = dir;
        index[0] = i0; index[1] = i1; index[2] = d0;
        index[3] = i2; index[4] = i3; index[5] = d1;
    }
}
function mergesort( a, dir, natural, indices, a0, a1 )
{
    // http://en.wikipedia.org/wiki/Merge_sort
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var ak = a0 > a1 ? -1 : 1, N = ak*(a1-a0)+1;
    indices = true === indices;
    // in-place
    if ( 1 >= N ) return indices ? (1 === N ? [a0] : []) : a;
    dir = -1 === dir ? -1 : 1;
    var logN = N, size = 1, size2 = 2, min = stdMath.min, aux = new Array(N),
        index, i0, i1, i0p, i1p;
    if ( indices )
    {
        a = operate(function(b,ai,i){b[i-a0]=[ai,i]; return b;}, new Array(N), a, a0, a1, 1);
        a0 = 0; a1 = N-1;
    }
    if ( true === natural )
    {
        // O(N) average, O(NlgN) worst case
        i0p = a0; i1p = -1;
        index = [-1,-1,0,-1,-1,0];
        do{
            // find already sorted chunks
            // O(n)
            sortedrun(a, a0, a1, index, indices, dir);
            if ( -1 === index[3] )
            {
                // already sorted, reflect if sorted reversely
                // O(n)
                if ( dir !== index[2] && a0 < a1 ) reflection(a, a, 0/*dummy*/, a0, a1);
                i0 = a0; i1 = a1;
            }
            else
            {
                // merge partialy sorted chunks appropriately into one run
                // O(n)
                index[2] = dir!==index[2]?1:0; index[5] = dir!==index[5]?1:0;
                merge(aux, a, a, dir, index[2]?index[1]:index[0], index[2]?index[0]:index[1], index[5]?index[4]:index[3], index[5]?index[3]:index[4], indices, false, true);
                i0 = index[0]; i1 = index[4];
            }
            // merge with the previous run
            // O(n)
            if ( -1 !== i1p ) merge(aux, a, a, dir, i0p, i1p, i0, i1, indices, false, true);
            // update starting point for next chunk
            i1p = i1; a0 = i1+1;
        }while( a0 <= a1 );
    }
    else
    {
        // O(NlgN)
        while( 0 < logN )
        {
            operate(function(_,j){
                merge(aux, a, a, dir, a0+ak*j, a0+ak*(j+size-1), a0+ak*(j+size), a0+ak*min(j+size2-1, N-1), indices, false, true);
            }, null, null, 0, N-size-1, size2);
            size <<= 1; size2 <<= 1; logN >>= 1;
        }
    }
    return indices ? pluck(a, a, 1) : a;
}
function is_sorted( a, dir, a0, a1 )
{
    var i, ap, ai, n = a.length, N;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = n-1;
    // O(n)
    if ( null == dir || 0 === dir )
    {
        // findout if and how it is sorted
        dir = 0;
        for(ap=a[a0],i=a0+1; i<=a1; i++)
        {
            ai = a[i];
            if ( ap < ai )
            {
                if ( -1 === dir ) return 0;
                else if ( 0 === dir ) dir = 1;
            }
            else if ( ap > ai )
            {
                if ( 1 === dir ) return 0;
                else if ( 0 === dir ) dir = -1;
            }
            ap = ai;
        }
        return 0 === dir ? 1 : dir;
    }
    else
    {
        // check that it is sorted by dir
        dir = -1 === dir ? -1 : 1;
        if ( a0 >= a1 ) return dir;
        if ( -1 === dir )
        {
            // reverse sorted, descending
            for(ap=a[a0],i=a0+1; i<=a1; i++)
            {
                ai = a[i];
                if ( ap < ai ) return 0;
                else ap = ai;
            }
        }
        else
        {
            // sorted, ascending
            for(ap=a[a0],i=a0+1; i<=a1; i++)
            {
                ai = a[i];
                if ( ap > ai ) return 0;
                else ap = ai;
            }
        }
        return dir;
    }
}
function shuffle( a, connected, a0, a1 )
{
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
    var rndInt = Abacus.Math.rndInt, N, offset = true === connected ? 1 : 0;
    // O(n)
    if ( is_array(a0) )
    {
        if ( 1 < (N=a0.length) ) operate(function(a){
            if ( offset < N-- )
            {
                var perm = rndInt(0, N-offset), swap = a[ a0[N] ];
                a[ a0[N] ] = a[ a0[perm] ]; a[ a0[perm] ] = swap;
            }
            return a;
        }, a, a0, 0, N-1);
    }
    else
    {
        if ( null == a0 ) a0 = 0;
        if ( null == a1 ) a1 = a.length-1;
        if ( 1 < (N=a1-a0+1) ) operate(function(a){
            if ( offset < N-- )
            {
                var perm = rndInt(0, N-offset), swap = a[ a0+N ];
                a[ a0+N ] = a[ a0+perm ]; a[ a0+perm ] = swap;
            }
            return a;
        }, a, a, 0, N-1);
    }
    return a;
}
function pick( a, k, sorted, repeated, backup, a0, a1 )
{
    // http://stackoverflow.com/a/32035986/3591273
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var rndInt = Abacus.Math.rndInt,
        picked, i, selected, value, n = a1-a0+1;
    k = stdMath.min( k, n );
    sorted = true === sorted;

    picked = new Array(k);
    if ( true === repeated )
    {
        n = n-1;
        for(i=0; i<k; i++) // O(k) times
            picked[ i ] = a[ a0+rndInt( 0, n ) ];
        if ( sorted ) mergesort( picked );// O(klogk) times, average/worst-case
        return picked;
    }

    // partially shuffle the array, and generate unbiased selection simultaneously
    // this is a variation on fisher-yates-knuth shuffle
    for(i=0; i<k; i++) // O(k) times
    {
        selected = rndInt( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
        value = a[ a0+selected ];
        a[ a0+selected ] = a[ a0+n ];
        a[ a0+n ] = value;
        picked[ i ] = value;
        backup && (backup[ i ] = selected);
    }
    if ( backup )
    {
        // restore partially shuffled input array from backup
        for(i=k-1; i>=0; i--) // O(k) times
        {
            selected = backup[ i ];
            value = a[ a0+n ];
            a[ a0+n ] = a[ a0+selected ];
            a[ a0+selected ] = value;
            n++;
        }
    }
    if ( sorted ) mergesort( picked );// O(klogk) times, average/worst-case
    return picked;
}
function binarysearch( v, a, dir, a0, a1, eq, lt )
{
    // binary search O(logn)
    eq = eq || function(a, b){return a==b;};
    lt = lt || function(a, b){return a<b;};
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var l=stdMath.max(a0, 0), r=stdMath.min(a1, a.length-1), m, am;

    if ( l>r || lt(v, a[l]) || lt(a[r], v) ) return -1;
    else if (  eq(v, a[l]) ) return l;
    else if ( eq(v, a[r]) ) return r;

    if ( -1===dir )
    {
        while(l<r)
        {
            m = ((l+r)>>>1); am = a[m];
            if ( eq(v, am) ) return m;
            else if ( lt(am, v) ) r = m-1;
            else l = m+1;
        }
    }
    else
    {
        while(l<r)
        {
            m = ((l+r)>>>1); am = a[m];
            if ( eq(v, am) ) return m;
            else if ( lt(v, am) ) r = m-1;
            else l = m+1;
        }
    }
    return -1;
}
function bisect( list, item, dir, lo, hi, lt )
{
    // binary search O(logn) for point of insertion (either left or right depending on dir)
    // adapted from python's c source code, module bisect
    // https://github.com/python/cpython/blob/master/Modules/_bisectmodule.c
    lt = lt || function(a, b){return a<b};
    if ( null == lo ) lo = 0;
    if ( null == hi ) hi = list.length;
    dir = -1 === dir ? -1 : 1; // left, else right bisection
    var mid, litem;
    if ( 0 > lo ) return -1;
    if ( -1===dir )
    {
        while( lo < hi )
        {
            mid = ((lo+hi)>>>1); litem = list[mid];
            if ( lt(litem, item) ) lo = mid+1;
            else hi = mid;
        }
    }
    else
    {
        while( lo < hi )
        {
            mid = ((lo+hi)>>>1); litem = list[mid];
            if ( lt(item, litem) ) hi = mid;
            else lo = mid+1;
        }
    }
    return lo;
}
function bitreverse( b, nbits )
{
    b = +b;
    var r = b & 1;
    if ( null == nbits )
        while (b >>= 1) { r <<= 1; r |= b & 1; }
    else
        while (--nbits) { r <<= 1; b >>= 1; r |= b & 1; }
    return r;
}
function is_mirror_image( x )
{
    var i, j;
    if ( is_array(x) || is_args(x) )
    {
        if ( 1 >= x.length ) return true;
        for(i=0,j=x.length-1; i<j; i++,j--)
            if ( x[i] !== x[j] )
                return false;
    }
    else
    {
        x = String(x);
        if ( 1 >= x.length ) return true;
        for(i=0,j=x.length-1; i<j; i++,j--)
            if ( x.charAt(i) !== x.charAt(j) )
                return false;
    }
    return true;
}

function sorter( Arithmetic )
{
    return true===Arithmetic ? function(a, b){return a.equ(b) ? 0 : (a.lt(b) ? -1 : 1);} : (Arithmetic ? function(a, b){return Arithmetic.equ(a, b) ? 0 : (Arithmetic.lt(a, b) ? -1 : 1);} : function(a, b){return a===b ? 0 : (a<b ? -1 : 1);});
}
function pad( x, n, s )
{
    var l = x.length;
    s = s || ' ';
    return l < n ? (new Array(n-l+1).join(s)+x) : x;
}
function addn( s, a )
{
    return s+a;
}
function muln( p, a )
{
    return p*a;
}
function sum( x, i0, i1, ik )
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(s, x){
        return s instanceof INumber ? s.add(x) : (x instanceof INumber ? x.add(s) : Arithmetic.add(s, x));
    }, Arithmetic.O, x, i0, i1, ik);
}
function product( x, i0, i1, ik )
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(function(p, x){
        return p instanceof INumber ? p.mul(x) : (x instanceof INumber ? x.mul(p) : Arithmetic.mul(p, x));
    }, Arithmetic.I, x, i0, i1, ik);
}
// modular arithmetic
function negm( a, m )
{
    // modulo additive inverse, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic;
    //m = Arithmetic.num(m);
    if ( Arithmetic.equ(m, Arithmetic.I) ) return Arithmetic.O;
    return Arithmetic.mod(Arithmetic.sub(m, a), m);
}
function addm( a, b, m )
{
    // modulo addition, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    //m = N(m);
    if ( Arithmetic.equ(m, Arithmetic.I) ) return Arithmetic.O;
    return Arithmetic.mod(Arithmetic.add(/*N(*/a/*)*/, /*N(*/b/*)*/), m);
}
function mulm( a, b, m )
{
    // modulo multiplication, supports Exact Big Integer Arithmetic if plugged in
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    //m = N(m);
    if ( Arithmetic.equ(m, Arithmetic.I) ) return Arithmetic.O;
    a = Arithmetic.mod(/*N(*/a/*)*/, m);
    b = Arithmetic.mod(/*N(*/b/*)*/, m);
    return Arithmetic.mod(Arithmetic.mul(a, b), m);
}
function invm( a, m )
{
    // modulo multiplicative inverse, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Modular_multiplicative_inverse
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, N = Arithmetic.num,
        inv = Arithmetic.J, q, r, r1, r2, t, t1 = O, t2 = I;

    //a = N(a); m = N(m);
    r1 = m; r2 = a;
    while (!Arithmetic.equ(O, r2))
    {
        q = Arithmetic.div(r1, r2);
        r = Arithmetic.mod(r1, r2);
        r1 = r2;
        r2 = r;

        t = Arithmetic.sub(t1, Arithmetic.mul(q, t2));
        t1 = t2;
        t2 = t;
    }
    if (Arithmetic.equ(I, r1)) inv = t1;
    if (Arithmetic.gt(O, inv)) inv = Arithmetic.add(inv, m);
    return inv;
}
function powm( b, e, m )
{
    // modulo power, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Modular_exponentiation#Pseudocode
    // https://en.wikipedia.org/wiki/Exponentiation_by_squaring
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        N = Arithmetic.num, two, pow;

    //b = N(b); m = N(m); e = N(e);
    if ( Arithmetic.equ(I, m) ) return O;
    else if ( Arithmetic.equ(O, e) ) return I;
    pow = I;
    b = Arithmetic.mod(b, m);
    if ( Arithmetic.gt(O, e) )
    {
        e = Arithmetic.abs(e);
        b = invm(b, m);
    }
    if ( Arithmetic.equ(I, e) ) return b;
    if ( Arithmetic.isDefault() || Arithmetic.lte(e, MAX_DEFAULT) )
    {
        // use bitwise operators for usual (small integer) exponents
        e = Arithmetic.val(e);
        while ( 0 !== e )
        {
            if ( e & 1 ) pow = mulm(pow, b, m);
            e >>= 1;
            b = mulm(b, b, m);
        }
    }
    else
    {
        two = Arithmetic.II;
        while ( !Arithmetic.equ(e, O) )
        {
            if ( Arithmetic.equ(I, Arithmetic.mod(e, two)) ) pow = mulm(pow, b, m);
            e = Arithmetic.div(e, two);
            b = mulm(b, b, m);
        }
    }
    return pow;
}
function powsq( b, e )
{
    // power, supports Exact Big Integer Arithmetic if plugged in
    // https://en.wikipedia.org/wiki/Exponentiation_by_squaring
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        N = Arithmetic.num, two, pow;

    //b = N(b); e = N(e);

    if ( Arithmetic.gt(O, e) ) return null; // does not support negative powers for integers
    else if ( Arithmetic.equ(O, e) ) return I;
    else if ( Arithmetic.equ(I, e) ) return b;

    pow = I;
    if ( Arithmetic.isDefault() || Arithmetic.lte(e, MAX_DEFAULT) )
    {
        // use bitwise operators for usual (small integer) exponents
        e = Arithmetic.val(e);
        while ( 0 !== e )
        {
            if ( e & 1 ) pow = Arithmetic.mul(pow, b);
            e >>= 1;
            b = Arithmetic.mul(b, b);
        }
    }
    else
    {
        two = Arithmetic.II;
        while ( !Arithmetic.equ(O, e) )
        {
            if ( Arithmetic.equ(I, Arithmetic.mod(e, two)) ) pow = Arithmetic.mul(pow, b);
            e = Arithmetic.div(e, two);
            b = Arithmetic.mul(b, b);
        }
    }
    return pow;
}
function isqrt( n )
{
    // integer square root
    // https://en.wikipedia.org/wiki/Integer_square_root
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
        start, end, mid, mid2, sqrt, two;
    //n = N(n);
    //n = Arithmetic.abs(n);

    if ( Arithmetic.equ(n, O) || Arithmetic.equ(n, I) ) return n;

    // for default arithmetic and numbers use built-in square root, floored
    if ( Arithmetic.isDefault() || Arithmetic.lte(n, MAX_DEFAULT) )
        return Arithmetic.num(stdMath.floor(stdMath.sqrt(Arithmetic.val(n))));

    two = Arithmetic.II;
    // Binary Search ( O(logn) )
    start = I; end = Arithmetic.div(n, two); sqrt = start;
    while (Arithmetic.lte(start, end))
    {
        mid = Arithmetic.div(Arithmetic.add(start, end), two);
        mid2 = Arithmetic.mul(mid, mid);

        if ( Arithmetic.equ(mid2, n) ) return mid;

        if (Arithmetic.lt(mid2, n))
        {
            start = Arithmetic.add(mid, I);
            sqrt = mid;
        }
        else
        {
            end = Arithmetic.sub(mid, I);
        }
    }
    return sqrt;
}
function jskthroot( x, k )
{
    var kg, r, p;
    k = +k;
    if ( 0 === k ) return null;
    if ( 0 > k )
    {
        x = 1.0/x;
        k = -k;
    }
    if ( 1 === k ) return x;
    kg = k & 1;
    if ( (1===kg) && (0>x) ) x = -x;
    r = stdMath.pow(x, 1.0/k); p = stdMath.pow(r, k);

    if ( (stdMath.abs(x-p)<1.0) && ((0<x) === (0<p)) )
        return kg && (0>x) ? -r : r;
    return 1;
}
function ikthroot( n, k )
{
    // Return the integer k-th root of a number by Newton's method
    var Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, u, r, k_1;

    if ( Arithmetic.gt(I, k) ) return null; // undefined
    else if ( Arithmetic.equ(I, k) || Arithmetic.equ(n, I) || Arithmetic.equ(n, Arithmetic.O) ) return n;

    if ( Arithmetic.isDefault() || Arithmetic.lte(n, MAX_DEFAULT) )
        return Arithmetic.num(stdMath.floor(jskthroot(Arithmetic.val(n), Arithmetic.val(k))));

    k_1 = Arithmetic.sub(k, I);
    u = n;
    r = Arithmetic.add(n, I);
    while ( Arithmetic.lt(u, r) )
    {
        r = u;
        u = Arithmetic.div(Arithmetic.add(Arithmetic.mul(r, k_1), Arithmetic.div(n, Arithmetic.pow(r, k_1))), k);
    }
    return r;
}
function polykthroot( p, k, limit )
{
    // Return the (possibly truncated) k-th root of a polynomial
    // https://math.stackexchange.com/questions/324385/algorithm-for-finding-the-square-root-of-a-polynomial
    // https://planetmath.org/SquareRootOfPolynomial
    // https://math.stackexchange.com/questions/3550942/algorithm-to-compute-nth-root-radical-sqrtnpx-of-polynomial
    // similarities with modified Newton's algorithm adapted for polynomials
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        PolynomialClass, k_1, r, rk, d, q, deg, nterms = 0;

    if ( k.lt(I) ) return null; // undefined
    else if ( (k.equ(I)) || p.equ(O) || p.equ(I) ) return p;

    PolynomialClass = p[CLASS];

    if ( null == limit ) limit = 6;
    limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    // using tail term .ttm(), correctly computes (taylor) power series approximation if p is not perfect kth power
    r = new PolynomialClass(p.ttm().rad(k), p.symbol, p.ring);
    deg = p.maxdeg(true); rk = r.pow(k_1); d = p.sub(rk.mul(r));
    while ( !d.equ(O) )
    {
        q = d.ttm(true).div(rk.mul(k).ttm(true));
        if ( q.equ(O) ) break; // no update anymore
        /*d = d.sub(q.mul(rk.add(q.pow(k_1))));*/ r = r.add(q); rk = r.pow(k_1); d = p.sub(rk.mul(r));
        // compute only up to some terms of power series (truncated power series approximation)
        // if p is not a perfect kth power and root begins to have powers not belonging to the root of p
        if ( r.maxdeg(true)*k > deg ) { nterms++; if ( (r.terms.length >= limit) || (nterms >= limit) ) break; }
    }
    // normalise r to have positive lead coeff
    // if k is multiple of 2 (since then both r and -r are roots)
    // and is not a (truncated) power series approximation
    return (0===nterms) && k.mod(two).equ(O) ? r.abs() : r;
}
function kthroot( x, k, limit )
{
    // https://en.wikipedia.org/wiki/Nth_root_algorithm
    // https://en.wikipedia.org/wiki/Shifting_nth_root_algorithm
    // Return the approximate k-th root of a rational number by Newton's method
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        ObjectClass, r, d, k_1, tries = 0, epsilon = Rational.Epsilon();
    if ( k.equ(O) ) return null;
    if ( (is_instance(x, Numeric) && (x.equ(O) || x.equ(I))) || (Arithmetic.isNumber(x) && (Arithmetic.equ(O, x) || Arithmetic.equ(I, x))) ) return x;
    ObjectClass = Arithmetic.isNumber(x) || is_instance(x, Integer) ? Rational :  x[CLASS];
    x = ObjectClass.cast(x);
    if ( is_class(ObjectClass, Rational) && x.lt(O) && k.mod(two).equ(O) )
    {
        // square root of negative real number, transform to complex
        ObjectClass = Complex;
        x = ObjectClass.cast(x);
    }
    if ( k.lt(O) )
    {
        x = x.inv();
        k = k.neg();
    }
    if ( k.equ(I) ) return x;

    if ( is_class(ObjectClass, RationalFunc) )
    {
        r = new ObjectClass(polykthroot(x.num, k), polykthroot(x.den, k));
    }
    else if ( is_class(ObjectClass, Rational) )
    {
        r = new ObjectClass(ikthroot(x.num, k.num), ikthroot(x.den, k.num));
    }
    else if ( is_class(ObjectClass, Complex) )
    {
        if ( x.isReal() && (x.real().gte(O) || !k.mod(two).equ(O)) )
        {
            r = new ObjectClass(Rational(ikthroot(x.real().num, k.num), ikthroot(x.real().den, k.num)), Rational.Zero());
        }
        else
        {
            r = new ObjectClass(I, I); // make sure a complex is used, not strictly real or imag
        }
    }
    else
    {
        r = ObjectClass.One();
    }
    //if ( null == limit ) limit = 6; // for up to 6 tries Newton method converges with 64bit precision
    //limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    if ( is_class(ObjectClass, Complex) )
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if ( d.real().abs().lte(epsilon) && d.imag().abs().lte(epsilon) ) break;
            r = r.add(d);
        } while( true );
    }
    else
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if ( d.abs().lte(epsilon) ) break;
            r = r.add(d);
        } while( true );
    }
    return r;
}
/*function quadres( a, n )
{
    // https://en.wikipedia.org/wiki/Quadratic_residue
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        q, x, z;
    a = N(a); n = N(n);
    q = Arithmetic.div(Arithmetic.sub(n, I), two);
    x = q; //Arithmetic.pow(q, I);
    if ( Arithmetic.equ(x, O) ) return I;

    a = Arithmetic.mod(a, n);
    z = I;
    while ( !Arithmetic.equ(x, O) )
    {
        if ( Arithmetic.equ(O, Arithmetic.mod(x, two)) )
        {
            a = Arithmetic.mod(Arithmetic.mul(a, a), n);
            x = Arithmetic.div(x, two);
        }
        else
        {
            x = Arithmetic.sub(x, I);
            z = Arithmetic.mod(Arithmetic.mul(z, a), n);
        }
    }
    return z;
}*/
function jacobi_symbol( m, n, g )
{
    // https://en.wikipedia.org/wiki/Jacobi_symbol
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O,
        J = Arithmetic.J, I = Arithmetic.I, two = Arithmetic.II,
        j, t, three, four, five, eight;

    if ( Arithmetic.lt(n, O) || Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return null; //n should be an odd positive integer
    if ( Arithmetic.lt(m, O) || Arithmetic.gt(m, n) ) m = Arithmetic.mod(m, n);
    if ( Arithmetic.equ(O, m) ) return Arithmetic.equ(I, n) ? I : O;
    if ( Arithmetic.equ(I, n) || Arithmetic.equ(I, m) ) return I;
    if ( null == g ) g = gcd(m, n);
    if ( !Arithmetic.equ(I, g) ) return O;

    three = N(3); four = N(4); five = N(5); eight = N(8);
    j = I;
    if ( Arithmetic.lt(m, O) )
    {
        m = Arithmetic.mul(J, m);
        if ( Arithmetic.equ(Arithmetic.mod(n, four), three) ) j = Arithmetic.mul(J, j);
    }
    while ( !Arithmetic.equ(O, m) )
    {
        while ( Arithmetic.gt(m, O) && Arithmetic.equ(O, Arithmetic.mod(m, two)) )
        {
            m = Arithmetic.div(m, two);
            t = Arithmetic.mod(n, eight);
            if ( Arithmetic.equ(t, three) || Arithmetic.equ(t, five) ) j = Arithmetic.mul(J, j);
        }
        t = m; m = n; n = t;
        if ( Arithmetic.equ(three, Arithmetic.mod(m, four)) && Arithmetic.equ(three, Arithmetic.mod(n, four)) ) j = Arithmetic.mul(J, j);
        m = Arithmetic.mod(m, n);
    }
    if ( !Arithmetic.equ(I, n) ) j = O;

    return j;
}
function legendre_symbol( a, p )
{
    // https://en.wikipedia.org/wiki/Legendre_symbol
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, I = Arithmetic.I, two = Arithmetic.II;
    //a = N(a); p = N(p);
    // built-in powm uses exponention by squaring thus is efficient
    return powm(a, Arithmetic.div(Arithmetic.sub(p, I), two), p);
}
function isqrtp( n, p )
{
    // square root modulo prime p
    // https://en.wikipedia.org/wiki/Quadratic_residue
    // https://en.wikipedia.org/wiki/Tonelli%E2%80%93Shanks_algorithm
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
    two, p_1, q, s, z, c, r, r2, t, m, t2, b, i;

    //n = N(n); p = N(p);

    if ( !Arithmetic.equ(I, legendre_symbol(n, p)) ) return null; // not a square (mod p)

    two = Arithmetic.II;
    p_1 = Arithmetic.sub(p, I);
    q = p_1;
    s = 0
    while (Arithmetic.equ(O, Arithmetic.mod(q, two)))
    {
        q  = Arithmetic.div(q, two);
        s += 1;
    }
    if ( 1 === s ) return powm(n, Arithmetic.div(Arithmetic.add(p, I), 4), p);

    for (z=O; Arithmetic.lt(z, p); z=Arithmetic.add(z, I))
    {
        if ( Arithmetic.equ(p_1, legendre_symbol(z, p)) )
            break;
    }
    c = powm(z, q, p);
    r = powm(n, Arithmetic.div(Arithmetic.add(q, I), two), p);
    t = powm(n, q, p);
    m = s;
    t2 = O
    while ( !Arithmetic.equ(O, Arithmetic.mod(Arithmetic.sub(t, I), p)) )
    {
        t2 = mulm(t, t, p);
        for (i=1; i<m; i++)
        {
            if ( Arithmetic.equ(O, Arithmetic.mod(Arithmetic.sub(t2, I), p)) ) break;
            t2 = mulm(t2, t2, p);
        }
        b = powm(c, Arithmetic.shl(I, m-i-1), p);
        r = mulm(r, b, p);
        c = mulm(b, b, p);
        t = mulm(t, c, p);
        m = i
    }
    // r and p-r are roots, return smallest
    r2 = Arithmetic.sub(p, r);
    return Arithmetic.lt(r2, r) ? r2 : r;
}
function ikthrootp( n, k, p )
{
    // kth root of n modulo prime p
    // https://www3.nd.edu/~sevens/13187unit16.pdf
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, g;

    //if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return null; // not supported
    g = xgcd(k, Arithmetic.sub(p, I));
    //if ( !Arithmetic.equ(I, g[0]) ) return null; // not supported
    return powm(n, g[1], p);
}
function ilog( x, b )
{
    // integer logarithm, greatest integer l such that b^l <= x.
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, log = O;

    if ( Arithmetic.lt(b, Arithmetic.II) ) return O; // 0 or 1 as base, return 0

    if ( Arithmetic.lte(x, b) ) return Arithmetic.equ(x, b) ? I : O; // base greater or equal to x, either 0 or 1

    if ( Arithmetic.isDefault() || Arithmetic.lte(x, MAX_DEFAULT) )
        return Arithmetic.num(stdMath.floor(stdMath.log(Arithmetic.val(x))/stdMath.log(Arithmetic.val(b))));

    while ( Arithmetic.gte(x, b) )
    {
        x = Arithmetic.div(x, b);
        log = Arithmetic.add(log, I);
    }
    return log;
}
function trailing_zeroes( n, bits, with_remaining )
{
    var Arithmetic = Abacus.Arithmetic, z = 0, i;
    bits = bits || Arithmetic.digits(n, 2);
    i = bits.length-1;
    while(0<=i && '0'===bits.charAt(i) ) { i--; z++; }
    return with_remaining ? [z, 0 > i ? '0' : bits.slice(0, i+1)] : z;
}
function small_primes( )
{
    var N = Abacus.Arithmetic.num;
    if ( !small_primes.list )
    {
        // a list of the first primes up to a limit (first 2000 primes)
        small_primes.list = [N(2),N(3),N(5),N(7),N(11),N(13),N(17),N(19),N(23),N(29),N(31),N(37),N(41),N(43),N(47),N(53),N(59),N(61),N(67),N(71),N(73),N(79),N(83),N(89),N(97),N(101),N(103),N(107),N(109),N(113),N(127),N(131),N(137),N(139),N(149),N(151),N(157),N(163),N(167),N(173),N(179),N(181),N(191),N(193),N(197),N(199),N(211),N(223),N(227),N(229),N(233),N(239),N(241),N(251),N(257),N(263),N(269),N(271),N(277),N(281),N(283),N(293),N(307),N(311),N(313),N(317),N(331),N(337),N(347),N(349),N(353),N(359),N(367),N(373),N(379),N(383),N(389),N(397),N(401),N(409),N(419),N(421),N(431),N(433),N(439),N(443),N(449),N(457),N(461),N(463),N(467),N(479),N(487),N(491),N(499),N(503),N(509),N(521),N(523),N(541),N(547),N(557),N(563),N(569),N(571),N(577),N(587),N(593),N(599),N(601),N(607),N(613),N(617),N(619),N(631),N(641),N(643),N(647),N(653),N(659),N(661),N(673),N(677),N(683),N(691),N(701),N(709),N(719),N(727),N(733),N(739),N(743),N(751),N(757),N(761),N(769),N(773),N(787),N(797),N(809),N(811),N(821),N(823),N(827),N(829),N(839),N(853),N(857),N(859),N(863),N(877),N(881),N(883),N(887),N(907),N(911),N(919),N(929),N(937),N(941),N(947),N(953),N(967),N(971),N(977),N(983),N(991),N(997),N(1009),N(1013),N(1019),N(1021),N(1031),N(1033),N(1039),N(1049),N(1051),N(1061),N(1063),N(1069),N(1087),N(1091),N(1093),N(1097),N(1103),N(1109),N(1117),N(1123),N(1129),N(1151),N(1153),N(1163),N(1171),N(1181),N(1187),N(1193),N(1201),N(1213),N(1217),N(1223),N(1229),N(1231),N(1237),N(1249),N(1259),N(1277),N(1279),N(1283),N(1289),N(1291),N(1297),N(1301),N(1303),N(1307),N(1319),N(1321),N(1327),N(1361),N(1367),N(1373),N(1381),N(1399),N(1409),N(1423),N(1427),N(1429),N(1433),N(1439),N(1447),N(1451),N(1453),N(1459),N(1471),N(1481),N(1483),N(1487),N(1489),N(1493),N(1499),N(1511),N(1523),N(1531),N(1543),N(1549),N(1553),N(1559),N(1567),N(1571),N(1579),N(1583),N(1597),N(1601),N(1607),N(1609),N(1613),N(1619),N(1621),N(1627),N(1637),N(1657),N(1663),N(1667),N(1669),N(1693),N(1697),N(1699),N(1709),N(1721),N(1723),N(1733),N(1741),N(1747),N(1753),N(1759),N(1777),N(1783),N(1787),N(1789),N(1801),N(1811),N(1823),N(1831),N(1847),N(1861),N(1867),N(1871),N(1873),N(1877),N(1879),N(1889),N(1901),N(1907),N(1913),N(1931),N(1933),N(1949),N(1951),N(1973),N(1979),N(1987),N(1993),N(1997),N(1999),N(2003),N(2011),N(2017),N(2027),N(2029),N(2039),N(2053),N(2063),N(2069),N(2081),N(2083),N(2087),N(2089),N(2099),N(2111),N(2113),N(2129),N(2131),N(2137),N(2141),N(2143),N(2153),N(2161),N(2179),N(2203),N(2207),N(2213),N(2221),N(2237),N(2239),N(2243),N(2251),N(2267),N(2269),N(2273),N(2281),N(2287),N(2293),N(2297),N(2309),N(2311),N(2333),N(2339),N(2341),N(2347),N(2351),N(2357),N(2371),N(2377),N(2381),N(2383),N(2389),N(2393),N(2399),N(2411),N(2417),N(2423),N(2437),N(2441),N(2447),N(2459),N(2467),N(2473),N(2477),N(2503),N(2521),N(2531),N(2539),N(2543),N(2549),N(2551),N(2557),N(2579),N(2591),N(2593),N(2609),N(2617),N(2621),N(2633),N(2647),N(2657),N(2659),N(2663),N(2671),N(2677),N(2683),N(2687),N(2689),N(2693),N(2699),N(2707),N(2711),N(2713),N(2719),N(2729),N(2731),N(2741),N(2749),N(2753),N(2767),N(2777),N(2789),N(2791),N(2797),N(2801),N(2803),N(2819),N(2833),N(2837),N(2843),N(2851),N(2857),N(2861),N(2879),N(2887),N(2897),N(2903),N(2909),N(2917),N(2927),N(2939),N(2953),N(2957),N(2963),N(2969),N(2971),N(2999),N(3001),N(3011),N(3019),N(3023),N(3037),N(3041),N(3049),N(3061),N(3067),N(3079),N(3083),N(3089),N(3109),N(3119),N(3121),N(3137),N(3163),N(3167),N(3169),N(3181),N(3187),N(3191),N(3203),N(3209),N(3217),N(3221),N(3229),N(3251),N(3253),N(3257),N(3259),N(3271),N(3299),N(3301),N(3307),N(3313),N(3319),N(3323),N(3329),N(3331),N(3343),N(3347),N(3359),N(3361),N(3371),N(3373),N(3389),N(3391),N(3407),N(3413),N(3433),N(3449),N(3457),N(3461),N(3463),N(3467),N(3469),N(3491),N(3499),N(3511),N(3517),N(3527),N(3529),N(3533),N(3539),N(3541),N(3547),N(3557),N(3559),N(3571),N(3581),N(3583),N(3593),N(3607),N(3613),N(3617),N(3623),N(3631),N(3637),N(3643),N(3659),N(3671),N(3673),N(3677),N(3691),N(3697),N(3701),N(3709),N(3719),N(3727),N(3733),N(3739),N(3761),N(3767),N(3769),N(3779),N(3793),N(3797),N(3803),N(3821),N(3823),N(3833),N(3847),N(3851),N(3853),N(3863),N(3877),N(3881),N(3889),N(3907),N(3911),N(3917),N(3919),N(3923),N(3929),N(3931),N(3943),N(3947),N(3967),N(3989),N(4001),N(4003),N(4007),N(4013),N(4019),N(4021),N(4027),N(4049),N(4051),N(4057),N(4073),N(4079),N(4091),N(4093),N(4099),N(4111),N(4127),N(4129),N(4133),N(4139),N(4153),N(4157),N(4159),N(4177),N(4201),N(4211),N(4217),N(4219),N(4229),N(4231),N(4241),N(4243),N(4253),N(4259),N(4261),N(4271),N(4273),N(4283),N(4289),N(4297),N(4327),N(4337),N(4339),N(4349),N(4357),N(4363),N(4373),N(4391),N(4397),N(4409),N(4421),N(4423),N(4441),N(4447),N(4451),N(4457),N(4463),N(4481),N(4483),N(4493),N(4507),N(4513),N(4517),N(4519),N(4523),N(4547),N(4549),N(4561),N(4567),N(4583),N(4591),N(4597),N(4603),N(4621),N(4637),N(4639),N(4643),N(4649),N(4651),N(4657),N(4663),N(4673),N(4679),N(4691),N(4703),N(4721),N(4723),N(4729),N(4733),N(4751),N(4759),N(4783),N(4787),N(4789),N(4793),N(4799),N(4801),N(4813),N(4817),N(4831),N(4861),N(4871),N(4877),N(4889),N(4903),N(4909),N(4919),N(4931),N(4933),N(4937),N(4943),N(4951),N(4957),N(4967),N(4969),N(4973),N(4987),N(4993),N(4999),N(5003),N(5009),N(5011),N(5021),N(5023),N(5039),N(5051),N(5059),N(5077),N(5081),N(5087),N(5099),N(5101),N(5107),N(5113),N(5119),N(5147),N(5153),N(5167),N(5171),N(5179),N(5189),N(5197),N(5209),N(5227),N(5231),N(5233),N(5237),N(5261),N(5273),N(5279),N(5281),N(5297),N(5303),N(5309),N(5323),N(5333),N(5347),N(5351),N(5381),N(5387),N(5393),N(5399),N(5407),N(5413),N(5417),N(5419),N(5431),N(5437),N(5441),N(5443),N(5449),N(5471),N(5477),N(5479),N(5483),N(5501),N(5503),N(5507),N(5519),N(5521),N(5527),N(5531),N(5557),N(5563),N(5569),N(5573),N(5581),N(5591),N(5623),N(5639),N(5641),N(5647),N(5651),N(5653),N(5657),N(5659),N(5669),N(5683),N(5689),N(5693),N(5701),N(5711),N(5717),N(5737),N(5741),N(5743),N(5749),N(5779),N(5783),N(5791),N(5801),N(5807),N(5813),N(5821),N(5827),N(5839),N(5843),N(5849),N(5851),N(5857),N(5861),N(5867),N(5869),N(5879),N(5881),N(5897),N(5903),N(5923),N(5927),N(5939),N(5953),N(5981),N(5987),N(6007),N(6011),N(6029),N(6037),N(6043),N(6047),N(6053),N(6067),N(6073),N(6079),N(6089),N(6091),N(6101),N(6113),N(6121),N(6131),N(6133),N(6143),N(6151),N(6163),N(6173),N(6197),N(6199),N(6203),N(6211),N(6217),N(6221),N(6229),N(6247),N(6257),N(6263),N(6269),N(6271),N(6277),N(6287),N(6299),N(6301),N(6311),N(6317),N(6323),N(6329),N(6337),N(6343),N(6353),N(6359),N(6361),N(6367),N(6373),N(6379),N(6389),N(6397),N(6421),N(6427),N(6449),N(6451),N(6469),N(6473),N(6481),N(6491),N(6521),N(6529),N(6547),N(6551),N(6553),N(6563),N(6569),N(6571),N(6577),N(6581),N(6599),N(6607),N(6619),N(6637),N(6653),N(6659),N(6661),N(6673),N(6679),N(6689),N(6691),N(6701),N(6703),N(6709),N(6719),N(6733),N(6737),N(6761),N(6763),N(6779),N(6781),N(6791),N(6793),N(6803),N(6823),N(6827),N(6829),N(6833),N(6841),N(6857),N(6863),N(6869),N(6871),N(6883),N(6899),N(6907),N(6911),N(6917),N(6947),N(6949),N(6959),N(6961),N(6967),N(6971),N(6977),N(6983),N(6991),N(6997),N(7001),N(7013),N(7019),N(7027),N(7039),N(7043),N(7057),N(7069),N(7079),N(7103),N(7109),N(7121),N(7127),N(7129),N(7151),N(7159),N(7177),N(7187),N(7193),N(7207),N(7211),N(7213),N(7219),N(7229),N(7237),N(7243),N(7247),N(7253),N(7283),N(7297),N(7307),N(7309),N(7321),N(7331),N(7333),N(7349),N(7351),N(7369),N(7393),N(7411),N(7417),N(7433),N(7451),N(7457),N(7459),N(7477),N(7481),N(7487),N(7489),N(7499),N(7507),N(7517),N(7523),N(7529),N(7537),N(7541),N(7547),N(7549),N(7559),N(7561),N(7573),N(7577),N(7583),N(7589),N(7591),N(7603),N(7607),N(7621),N(7639),N(7643),N(7649),N(7669),N(7673),N(7681),N(7687),N(7691),N(7699),N(7703),N(7717),N(7723),N(7727),N(7741),N(7753),N(7757),N(7759),N(7789),N(7793),N(7817),N(7823),N(7829),N(7841),N(7853),N(7867),N(7873),N(7877),N(7879),N(7883),N(7901),N(7907),N(7919),N(7927),N(7933),N(7937),N(7949),N(7951),N(7963),N(7993),N(8009),N(8011),N(8017),N(8039),N(8053),N(8059),N(8069),N(8081),N(8087),N(8089),N(8093),N(8101),N(8111),N(8117),N(8123),N(8147),N(8161),N(8167),N(8171),N(8179),N(8191),N(8209),N(8219),N(8221),N(8231),N(8233),N(8237),N(8243),N(8263),N(8269),N(8273),N(8287),N(8291),N(8293),N(8297),N(8311),N(8317),N(8329),N(8353),N(8363),N(8369),N(8377),N(8387),N(8389),N(8419),N(8423),N(8429),N(8431),N(8443),N(8447),N(8461),N(8467),N(8501),N(8513),N(8521),N(8527),N(8537),N(8539),N(8543),N(8563),N(8573),N(8581),N(8597),N(8599),N(8609),N(8623),N(8627),N(8629),N(8641),N(8647),N(8663),N(8669),N(8677),N(8681),N(8689),N(8693),N(8699),N(8707),N(8713),N(8719),N(8731),N(8737),N(8741),N(8747),N(8753),N(8761),N(8779),N(8783),N(8803),N(8807),N(8819),N(8821),N(8831),N(8837),N(8839),N(8849),N(8861),N(8863),N(8867),N(8887),N(8893),N(8923),N(8929),N(8933),N(8941),N(8951),N(8963),N(8969),N(8971),N(8999),N(9001),N(9007),N(9011),N(9013),N(9029),N(9041),N(9043),N(9049),N(9059),N(9067),N(9091),N(9103),N(9109),N(9127),N(9133),N(9137),N(9151),N(9157),N(9161),N(9173),N(9181),N(9187),N(9199),N(9203),N(9209),N(9221),N(9227),N(9239),N(9241),N(9257),N(9277),N(9281),N(9283),N(9293),N(9311),N(9319),N(9323),N(9337),N(9341),N(9343),N(9349),N(9371),N(9377),N(9391),N(9397),N(9403),N(9413),N(9419),N(9421),N(9431),N(9433),N(9437),N(9439),N(9461),N(9463),N(9467),N(9473),N(9479),N(9491),N(9497),N(9511),N(9521),N(9533),N(9539),N(9547),N(9551),N(9587),N(9601),N(9613),N(9619),N(9623),N(9629),N(9631),N(9643),N(9649),N(9661),N(9677),N(9679),N(9689),N(9697),N(9719),N(9721),N(9733),N(9739),N(9743),N(9749),N(9767),N(9769),N(9781),N(9787),N(9791),N(9803),N(9811),N(9817),N(9829),N(9833),N(9839),N(9851),N(9857),N(9859),N(9871),N(9883),N(9887),N(9901),N(9907),N(9923),N(9929),N(9931),N(9941),N(9949),N(9967),N(9973),N(10007),N(10009),N(10037),N(10039),N(10061),N(10067),N(10069),N(10079),N(10091),N(10093),N(10099),N(10103),N(10111),N(10133),N(10139),N(10141),N(10151),N(10159),N(10163),N(10169),N(10177),N(10181),N(10193),N(10211),N(10223),N(10243),N(10247),N(10253),N(10259),N(10267),N(10271),N(10273),N(10289),N(10301),N(10303),N(10313),N(10321),N(10331),N(10333),N(10337),N(10343),N(10357),N(10369),N(10391),N(10399),N(10427),N(10429),N(10433),N(10453),N(10457),N(10459),N(10463),N(10477),N(10487),N(10499),N(10501),N(10513),N(10529),N(10531),N(10559),N(10567),N(10589),N(10597),N(10601),N(10607),N(10613),N(10627),N(10631),N(10639),N(10651),N(10657),N(10663),N(10667),N(10687),N(10691),N(10709),N(10711),N(10723),N(10729),N(10733),N(10739),N(10753),N(10771),N(10781),N(10789),N(10799),N(10831),N(10837),N(10847),N(10853),N(10859),N(10861),N(10867),N(10883),N(10889),N(10891),N(10903),N(10909),N(10937),N(10939),N(10949),N(10957),N(10973),N(10979),N(10987),N(10993),N(11003),N(11027),N(11047),N(11057),N(11059),N(11069),N(11071),N(11083),N(11087),N(11093),N(11113),N(11117),N(11119),N(11131),N(11149),N(11159),N(11161),N(11171),N(11173),N(11177),N(11197),N(11213),N(11239),N(11243),N(11251),N(11257),N(11261),N(11273),N(11279),N(11287),N(11299),N(11311),N(11317),N(11321),N(11329),N(11351),N(11353),N(11369),N(11383),N(11393),N(11399),N(11411),N(11423),N(11437),N(11443),N(11447),N(11467),N(11471),N(11483),N(11489),N(11491),N(11497),N(11503),N(11519),N(11527),N(11549),N(11551),N(11579),N(11587),N(11593),N(11597),N(11617),N(11621),N(11633),N(11657),N(11677),N(11681),N(11689),N(11699),N(11701),N(11717),N(11719),N(11731),N(11743),N(11777),N(11779),N(11783),N(11789),N(11801),N(11807),N(11813),N(11821),N(11827),N(11831),N(11833),N(11839),N(11863),N(11867),N(11887),N(11897),N(11903),N(11909),N(11923),N(11927),N(11933),N(11939),N(11941),N(11953),N(11959),N(11969),N(11971),N(11981),N(11987),N(12007),N(12011),N(12037),N(12041),N(12043),N(12049),N(12071),N(12073),N(12097),N(12101),N(12107),N(12109),N(12113),N(12119),N(12143),N(12149),N(12157),N(12161),N(12163),N(12197),N(12203),N(12211),N(12227),N(12239),N(12241),N(12251),N(12253),N(12263),N(12269),N(12277),N(12281),N(12289),N(12301),N(12323),N(12329),N(12343),N(12347),N(12373),N(12377),N(12379),N(12391),N(12401),N(12409),N(12413),N(12421),N(12433),N(12437),N(12451),N(12457),N(12473),N(12479),N(12487),N(12491),N(12497),N(12503),N(12511),N(12517),N(12527),N(12539),N(12541),N(12547),N(12553),N(12569),N(12577),N(12583),N(12589),N(12601),N(12611),N(12613),N(12619),N(12637),N(12641),N(12647),N(12653),N(12659),N(12671),N(12689),N(12697),N(12703),N(12713),N(12721),N(12739),N(12743),N(12757),N(12763),N(12781),N(12791),N(12799),N(12809),N(12821),N(12823),N(12829),N(12841),N(12853),N(12889),N(12893),N(12899),N(12907),N(12911),N(12917),N(12919),N(12923),N(12941),N(12953),N(12959),N(12967),N(12973),N(12979),N(12983),N(13001),N(13003),N(13007),N(13009),N(13033),N(13037),N(13043),N(13049),N(13063),N(13093),N(13099),N(13103),N(13109),N(13121),N(13127),N(13147),N(13151),N(13159),N(13163),N(13171),N(13177),N(13183),N(13187),N(13217),N(13219),N(13229),N(13241),N(13249),N(13259),N(13267),N(13291),N(13297),N(13309),N(13313),N(13327),N(13331),N(13337),N(13339),N(13367),N(13381),N(13397),N(13399),N(13411),N(13417),N(13421),N(13441),N(13451),N(13457),N(13463),N(13469),N(13477),N(13487),N(13499),N(13513),N(13523),N(13537),N(13553),N(13567),N(13577),N(13591),N(13597),N(13613),N(13619),N(13627),N(13633),N(13649),N(13669),N(13679),N(13681),N(13687),N(13691),N(13693),N(13697),N(13709),N(13711),N(13721),N(13723),N(13729),N(13751),N(13757),N(13759),N(13763),N(13781),N(13789),N(13799),N(13807),N(13829),N(13831),N(13841),N(13859),N(13873),N(13877),N(13879),N(13883),N(13901),N(13903),N(13907),N(13913),N(13921),N(13931),N(13933),N(13963),N(13967),N(13997),N(13999),N(14009),N(14011),N(14029),N(14033),N(14051),N(14057),N(14071),N(14081),N(14083),N(14087),N(14107),N(14143),N(14149),N(14153),N(14159),N(14173),N(14177),N(14197),N(14207),N(14221),N(14243),N(14249),N(14251),N(14281),N(14293),N(14303),N(14321),N(14323),N(14327),N(14341),N(14347),N(14369),N(14387),N(14389),N(14401),N(14407),N(14411),N(14419),N(14423),N(14431),N(14437),N(14447),N(14449),N(14461),N(14479),N(14489),N(14503),N(14519),N(14533),N(14537),N(14543),N(14549),N(14551),N(14557),N(14561),N(14563),N(14591),N(14593),N(14621),N(14627),N(14629),N(14633),N(14639),N(14653),N(14657),N(14669),N(14683),N(14699),N(14713),N(14717),N(14723),N(14731),N(14737),N(14741),N(14747),N(14753),N(14759),N(14767),N(14771),N(14779),N(14783),N(14797),N(14813),N(14821),N(14827),N(14831),N(14843),N(14851),N(14867),N(14869),N(14879),N(14887),N(14891),N(14897),N(14923),N(14929),N(14939),N(14947),N(14951),N(14957),N(14969),N(14983),N(15013),N(15017),N(15031),N(15053),N(15061),N(15073),N(15077),N(15083),N(15091),N(15101),N(15107),N(15121),N(15131),N(15137),N(15139),N(15149),N(15161),N(15173),N(15187),N(15193),N(15199),N(15217),N(15227),N(15233),N(15241),N(15259),N(15263),N(15269),N(15271),N(15277),N(15287),N(15289),N(15299),N(15307),N(15313),N(15319),N(15329),N(15331),N(15349),N(15359),N(15361),N(15373),N(15377),N(15383),N(15391),N(15401),N(15413),N(15427),N(15439),N(15443),N(15451),N(15461),N(15467),N(15473),N(15493),N(15497),N(15511),N(15527),N(15541),N(15551),N(15559),N(15569),N(15581),N(15583),N(15601),N(15607),N(15619),N(15629),N(15641),N(15643),N(15647),N(15649),N(15661),N(15667),N(15671),N(15679),N(15683),N(15727),N(15731),N(15733),N(15737),N(15739),N(15749),N(15761),N(15767),N(15773),N(15787),N(15791),N(15797),N(15803),N(15809),N(15817),N(15823),N(15859),N(15877),N(15881),N(15887),N(15889),N(15901),N(15907),N(15913),N(15919),N(15923),N(15937),N(15959),N(15971),N(15973),N(15991),N(16001),N(16007),N(16033),N(16057),N(16061),N(16063),N(16067),N(16069),N(16073),N(16087),N(16091),N(16097),N(16103),N(16111),N(16127),N(16139),N(16141),N(16183),N(16187),N(16189),N(16193),N(16217),N(16223),N(16229),N(16231),N(16249),N(16253),N(16267),N(16273),N(16301),N(16319),N(16333),N(16339),N(16349),N(16361),N(16363),N(16369),N(16381),N(16411),N(16417),N(16421),N(16427),N(16433),N(16447),N(16451),N(16453),N(16477),N(16481),N(16487),N(16493),N(16519),N(16529),N(16547),N(16553),N(16561),N(16567),N(16573),N(16603),N(16607),N(16619),N(16631),N(16633),N(16649),N(16651),N(16657),N(16661),N(16673),N(16691),N(16693),N(16699),N(16703),N(16729),N(16741),N(16747),N(16759),N(16763),N(16787),N(16811),N(16823),N(16829),N(16831),N(16843),N(16871),N(16879),N(16883),N(16889),N(16901),N(16903),N(16921),N(16927),N(16931),N(16937),N(16943),N(16963),N(16979),N(16981),N(16987),N(16993),N(17011),N(17021),N(17027),N(17029),N(17033),N(17041),N(17047),N(17053),N(17077),N(17093),N(17099),N(17107),N(17117),N(17123),N(17137),N(17159),N(17167),N(17183),N(17189),N(17191),N(17203),N(17207),N(17209),N(17231),N(17239),N(17257),N(17291),N(17293),N(17299),N(17317),N(17321),N(17327),N(17333),N(17341),N(17351),N(17359),N(17377),N(17383),N(17387),N(17389)];
    }
    return small_primes.list;
}
/*function fermat_test( n, k )
{
    // https://en.wikipedia.org/wiki/Fermat_primality_test
    // https://en.wikipedia.org/wiki/Fermat_pseudoprime
    var Arithmetic = Abacus.Arithmetic,
        I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, i, kl, a;

    if ( Arithmetic.lt(n, two) ) return false;
    else if ( Arithmetic.equ(n, two) || Arithmetic.equ(n, 3) ) return true;

    n_1 = Arithmetic.sub(n, I);

    if ( null == k ) k = 3;
    if ( is_array(k) )
    {
        for(i=0,kl=k.length; i<kl; i++)
        {
            if ( !Arithmetic.equ(I, powm(k[i], n_1, n)) )
                return false;
        }
    }
    else
    {
        k = +k;
        n_2 = Arithmetic.sub(n, two);
        for(i=0; i<k; i++)
        {
            a = Arithmetic.rnd(two, n_2);
            if ( !Arithmetic.equ(I, gcd(a, n)) || !Arithmetic.equ(I, powm(a, n_1, n)) ) return false;
        }
    }
    return true;
}
function euler_test( n, k )
{
    // https://en.wikipedia.org/wiki/Euler_pseudoprime
    var Arithmetic = Abacus.Arithmetic,
        I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, n_12, i, kl, a, m;

    if ( Arithmetic.lt(n, two) ) return false;
    else if ( Arithmetic.equ(n, two) || Arithmetic.equ(n, 3) ) return true;

    n_1 = Arithmetic.sub(n, I);
    n_12 = Arithmetic.div(n_1, two);

    if ( null == k ) k = 3;
    if ( is_array(k) )
    {
        for(i=0,kl=k.length; i<kl; i++)
        {
            m = powm(k[i], n_12, n);
            if ( !Arithmetic.equ(I, m) || !Arithmetic.equ(n_1, m) )
                return false;
        }
    }
    else
    {
        k = +k;
        n_2 = Arithmetic.sub(n, two);
        for(i=0; i<k; i++)
        {
            a = Arithmetic.rnd(two, n_2);
            if ( !Arithmetic.equ(I, gcd(a, n)) )
                return false;
            m = powm(a, n_12, n);
            if ( !Arithmetic.equ(I, m) || !Arithmetic.equ(n_1, m) )
                return false;
        }
    }
    return true;
}*/
function miller_rabin_test( n, k, kextra )
{
    // https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test
    //  O(num_trials*log^3(n))
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, n_1, n_2, s, d, q, r, i, kl;

    // write n-1 as 2^s * d
    // repeatedly try to divide n-1 by 2
    n_1 = Arithmetic.sub(n, I);
    n_2 = Arithmetic.sub(n_1, I);
    d = n_1;
    s = 0;//O;
    for(;;)
    {
        q = Arithmetic.div(d, two);
        r = Arithmetic.mod(d, two);
        if ( Arithmetic.equ(r, I) ) break;
        s = s+1;//Arithmetic.add(s, I);
        d = q;
    }

    // test the base a to see whether it is a witness for the compositeness of n
    function try_composite( a ) {
        var x, r;
        x = powm(a, d, n);
        if ( Arithmetic.equ(x, I) || Arithmetic.equ(x, n_1) ) return false;
        for (r=1; r<s; r++)
        {
            x = Arithmetic.mod(Arithmetic.mul(x, x), n);
            if ( Arithmetic.equ(x, I) ) return true;
            else if ( Arithmetic.equ(x, n_1) ) return false;
        }
        return true; // n is definitely composite
    };

    if ( null == k ) k = 5;

    if ( is_array(k) )
    {
        for (i=0,kl=k.length; i<kl; i++)
            if ( try_composite(k[i]) )
                return false;
        // extra tests
        if ( null != kextra )
        {
            kextra = +kextra;
            for (i=0; i<kextra; i++)
                if ( try_composite(Arithmetic.rnd(two, n_2)) )
                    return false;
        }
    }
    else
    {
        k = +k;
        for (i=0; i<k; i++)
            if ( try_composite(Arithmetic.rnd(two, n_2)) )
                return false;
    }
    return true; // no base tested showed n as composite
}
function lucas_sequence( n, P, Q, k, bits )
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, D, U, V, U0, V0, Qk, b, bit;

    //if ( Arithmetic.lt(n, two) ) return null; //n must be >= 2
    //else if ( Arithmetic.lt(k, O) ) return null; //k must be >= 0

    D = Arithmetic.sub(Arithmetic.mul(P, P), Arithmetic.mul(Q, 4));

    if ( Arithmetic.equ(O, D) ) return null; //D must not be zero

    bits = bits || Arithmetic.digits(k, 2);
    if ( '0'===bits /*|| Arithmetic.equ(O, k)*/ ) return [O, two, Q];

    U = I; V = P; Qk = Q;
    b = bits.length;

    if ( Arithmetic.equ(I, Q) )
    {
        // Optimization for extra strong tests.
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
            //b -= 1;
            if ( '1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/ )
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(Arithmetic.mul(U0, P), V0);
                V = Arithmetic.add(Arithmetic.mul(V0, P), Arithmetic.mul(U0, D));
                if ( Arithmetic.equ(I, Arithmetic.mod(U, two)) ) U = Arithmetic.add(U, n);
                if ( Arithmetic.equ(I, Arithmetic.mod(V, two)) ) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
            }
        }
    }
    else if ( Arithmetic.equ(I, P) && Arithmetic.equ(J, Q) )
    {
        // Small optimization for 50% of Selfridge parameters.
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            if ( Arithmetic.equ(I, Qk) )
            {
                V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
            }
            else
            {
                V = Arithmetic.mod(Arithmetic.add(Arithmetic.mul(V, V), two), n);
                Qk = I;
            }
            //b -= 1;
            if ( '1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/ )
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(U0, V0);
                V = Arithmetic.add(V0, Arithmetic.mul(U0, D));
                if ( Arithmetic.equ(I, Arithmetic.mod(U, two)) ) U = Arithmetic.add(U, n);
                if ( Arithmetic.equ(I, Arithmetic.mod(V, two)) ) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
                Qk = J;
            }
        }
    }
    else
    {
        // The general case with any P and Q.
        for (bit=1; bit<b; bit++)/*while (1 < b)*/
        {
            U = Arithmetic.mod(Arithmetic.mul(U, V), n);
            V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), Arithmetic.mul(two, Qk)), n);
            Qk = Arithmetic.mul(Qk, Qk);
            //b -= 1;
            if ( '1' === bits.charAt(bit) /*(k >> (b - 1)) & 1*/ )
            {
                U0 = U; V0 = V;
                U = Arithmetic.add(Arithmetic.mul(U0, P), V0);
                V = Arithmetic.add(Arithmetic.mul(V0, P), Arithmetic.mul(U0, D));
                if ( Arithmetic.equ(I, Arithmetic.mod(U, two)) ) U = Arithmetic.add(U, n);
                if ( Arithmetic.equ(I, Arithmetic.mod(V, two)) ) V = Arithmetic.add(V, n);
                U = Arithmetic.div(U, two);
                V = Arithmetic.div(V, two);
                Qk = Arithmetic.mul(Qk, Q);
            }
            Qk = Arithmetic.mod(Qk, n);
        }
    }
    return [Arithmetic.mod(U, n), Arithmetic.mod(V, n), Qk];
}
/*function lucas_selfridge_params( n )
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, D, g;

    D = Arithmetic.num(5);
    for(;;)
    {
        g = gcd(D, n);
        if ( Arithmetic.gt(g, I) && !Arithmetic.equ(g, n) ) return [O, O, O];
        if ( Arithmetic.equ(J, jacobi_symbol(D, n, g)) ) break;
        D = Arithmetic.gt(D, O) ? Arithmetic.sub(Arithmetic.mul(J, D), two) : Arithmetic.add(Arithmetic.mul(J, D), two);
    }
    return [D, I, Arithmetic.div(Arithmetic.sub(I, D), 4)];
}*/
function lucas_extrastrong_params( n )
{
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, J = Arithmetic.J,
        I = Arithmetic.I, two = Arithmetic.II, P, Q, D, g, four = N(4);
    P = N(3); Q = I; D = N(5);
    for(;;)
    {
        g = gcd(D, n);
        if ( Arithmetic.gt(g, I) && !Arithmetic.equ(g, n) ) return [O, O, O];
        if ( Arithmetic.equ(J, jacobi_symbol(D, n, g)) ) break;
        P = Arithmetic.add(P, I);
        D = Arithmetic.sub(Arithmetic.mul(P, P), four);
    }
    return [D, P, Q];
}
/*function lucas_test( n )
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV;

    //if ( Arithmetic.equ(n, two) ) return true;
    //if ( Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if ( Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt)) ) return false;

    PQ = lucas_selfridge_params(n);
    if ( Arithmetic.equ(O, PQ[0]) ) return false;

    UV = lucas_sequence(n, PQ[1], PQ[2], Arithmetic.add(n, I));
    return Arithmetic.equ(O, U[0]);
}
function strong_lucas_test( n )
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV, U, V, Qk, s, k, r, bits_k, n_1;

    //if ( Arithmetic.equ(n, two) ) return true;
    //if ( Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if ( Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt)) ) return false;

    PQ = lucas_selfridge_params(n);
    if ( Arithmetic.equ(O, PQ[0]) ) return false;

    // remove powers of 2 from n+1 (= k * 2**s)
    n_1 = Arithmetic.add(n, I);
    s = trailing_zeroes(n_1, null, true);
    bits_k = s[1]; s = s[0];
    k = O; //Arithmetic.shr(n_1, s);

    UV = lucas_sequence(n, PQ[1], PQ[2], k, bits_k);
    U = UV[0]; V = UV[1]; Qk = UV[2];

    if ( Arithmetic.equ(O, U) || Arithmetic.equ(O, V) ) return true;
    for (r=1; r<s; r++)
    {
        V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), Arithmetic.mul(two, Qk)), n);
        if ( Arithmetic.equ(O, V) ) return true;
        Qk = Arithmetic.mod(Arithmetic.mul(Qk, Qk), n);
    }
    return false;
}*/
function extra_strong_lucas_test( n )
{
    // https://en.wikipedia.org/wiki/Lucas_primality_test
    // https://en.wikipedia.org/wiki/Lucas_pseudoprime
    // http://mpqs.free.fr/LucasPseudoprimes.pdf
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        sqrt, PQ, UV, U, V, s, k, r, bits_k, n_1;

    //if ( Arithmetic.equ(n, two) ) return true;
    //if ( Arithmetic.lt(n, two) || Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return false;

    // Check that the number isn't a square number, as this will throw out
    // calculating the correct value of D later on (and means we have a composite number)
    sqrt = isqrt(n); //ikthroot(n, two);
    if ( Arithmetic.equ(n, Arithmetic.mul(sqrt, sqrt)) ) return false;

    PQ = lucas_extrastrong_params(n);
    if ( Arithmetic.equ(O, PQ[0]) ) return false;

    // remove powers of 2 from n+1 (= k * 2**s)
    n_1 = Arithmetic.add(n, I);
    s = trailing_zeroes(n_1, null, true);
    bits_k = s[1]; s = s[0];
    k = O; //Arithmetic.shr(n_1, s);

    UV = lucas_sequence(n, PQ[1], PQ[2], k, bits_k);
    U = UV[0]; V = UV[1];

    if ( Arithmetic.equ(O, U) && (Arithmetic.equ(two, V) || Arithmetic.equ(V, Arithmetic.sub(n, two))) ) return true;
    if ( Arithmetic.equ(O, V) ) return true;
    for (r=1; r<s; r++)
    {
        V = Arithmetic.mod(Arithmetic.sub(Arithmetic.mul(V, V), two), n);
        if ( Arithmetic.equ(O, V) ) return true;
    }
    return false;
}
function baillie_psw_test( n, extra_mr )
{
    // https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, two = Arithmetic.II,
        i, l, p, primes = small_primes();

    // Check divisibility by a short list of small primes
    if ( Arithmetic.lt(n, primes[0]) ) return false;
    for (i=0,l=stdMath.min(primes.length,100); i<l; i++)
    {
        p = primes[i];
        if ( Arithmetic.equ(n, p) ) return true;
        else if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return false;
    }

    // Perform the Miller-Rabin primality test with base 2 (plus any extra miller-rabin tests as well)
    if ( !miller_rabin_test(n, [two], extra_mr||null) ) return false;

    // Finally perform the (strong) Lucas primality test
    return extra_strong_lucas_test(n);
}
function is_probable_prime( n )
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://primes.utm.edu/prove/prove2_3.html#quick
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        i, l, p, primes = small_primes();

    // Check divisibility by a short list of small primes
    if ( Arithmetic.lt(n, primes[0]) ) return false;
    for (i=0,l=stdMath.min(primes.length,50); i<l; i++)
    {
        p = primes[i];
        if ( Arithmetic.equ(n, p) ) return true;
        else if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return false;
    }
    // do a sufficient miller-rabin probabilistic test
    return miller_rabin_test(n, 7);
}
function wheel( /* args */ )
{
    var base = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments,
        w, j, k, l = base.length, all, prod;

    if ( !l || !base[0] ) return null;

    prod = 1;
    for(k=0; k<l; k++) prod *= base[k];
    w = [];

    prod += 1;
    for (j=base[0]; j<=prod; j++)
    {
        all = true;
        for(k=0; k<l; k++)
        {
            if ( !(j % base[k]) )
            {
                all = false;
                break;
            }
        }
        if ( all )
        {
            w.push(j);
        }
    }
    return [w, array(w.length, function(i){return i+1<w.length ? w[i+1]-w[i] : w[0]+prod-1-w[i];})];
}
function wheel_trial_div_test( n )
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://en.wikipedia.org/wiki/Trial_division
    // https://en.wikipedia.org/wiki/Wheel_factorization
    // O(sqrt(n)), sufficiently fast for small numbers ie less than 20 digits
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, sqrt,
        three, five, seven, four, six, eight, ten, inc, i, p;

    // trial division with a wheel of {2,3,5,7}, faster than simple trial division
    if ( !wheel_trial_div_test.wheel )
    {
        // compute only once
        four = N(4); six = N(6); eight = N(8); ten = N(10);
        wheel_trial_div_test.wheel = {
            base: [two, N(3), N(5), N(7)],
            next: N(11), next2: N(121),
            inc: [two,four,two,four,six,two,six,four,two,four,six,six,two,six,four,two,six,four,six,eight,four,two,four,
            two,four,eight,six,four,six,two,four,six,two,six,six,four,two,four,six,two,six,four,two,four,two,ten,two,ten]
        };
    }
    three = wheel_trial_div_test.wheel.base[1];
    five = wheel_trial_div_test.wheel.base[2];
    seven = wheel_trial_div_test.wheel.base[3];

    if ( Arithmetic.lt(n, two) ) return false;
    else if ( Arithmetic.equ(n, two) ) return true;
    else if ( Arithmetic.equ(n, three) ) return true;
    else if ( Arithmetic.equ(n, five) ) return true;
    else if ( Arithmetic.equ(n, seven) ) return true;
    else if ( Arithmetic.equ(O, Arithmetic.mod(n, two)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, three)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, five)) ||
            Arithmetic.equ(O, Arithmetic.mod(n, seven)) ) return false;

    if ( Arithmetic.lt(n, wheel_trial_div_test.wheel.next2) ) return true;

    inc = wheel_trial_div_test.wheel.inc; i = 0;
    p = wheel_trial_div_test.wheel.next; sqrt = isqrt(n);
    while (Arithmetic.lte(p, sqrt))
    {
        if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return false;
        p = Arithmetic.add(p, inc[i++]);
        if ( i === inc.length ) i = 0;
    }
    return true; // is definately prime
}
function apr_cl_test( n )
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://en.wikipedia.org/wiki/Adleman%E2%80%93Pomerance%E2%80%93Rumely_primality_test
    // O(log(n)^(log log log (n))), sufficiently fast for medium numbers ie less than 2000 digits
    // TODO
    return true;
}
function is_prime( n )
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://primes.utm.edu/prove/prove2_3.html#quick
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, two = Arithmetic.II, ndigits, r;
    //n = Arithmetic.abs(/*N(*/n/*)*/);
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if ( ndigits <= 6 )
    {
        // deterministic test
        return wheel_trial_div_test(n);
    }
    else if ( ndigits <= 20 )
    {
        // deterministic test
        /*
        If n < 1373653 is a both 2 and 3-SPRP, then n is prime [PSW80].
        If n < 25326001 is a 2, 3 and 5-SPRP, then n is prime [PSW80].
        If n < 25000000000 is a 2, 3, 5 and 7-SPRP, then either n = 3215031751 or n is prime [PSW80]. (This is actually true for n < 118670087467 [Jaeschke93].)
        If n < 2152302898747 is a 2, 3, 5, 7 and 11-SPRP, then n is prime [Jaeschke93].
        If n < 3474749660383 is a 2, 3, 5, 7, 11 and 13-SPRP, then n is prime [Jaeschke93].
        If n < 341550071728321 is a 2, 3, 5, 7, 11, 13 and 17-SPRP, then n is prime [Jaeschke93].
        */
        if ( Arithmetic.lt(n, N(1373653)) )
            return miller_rabin_test(n, [two, N(3)]);
        else if ( Arithmetic.lt(n, N("25326001")) )
            return miller_rabin_test(n, [two, N(3), N(5)]);
        else if ( Arithmetic.lt(n, N("25000000000")) )
            return Arithmetic.equ(n, N("3215031751")) ? false : miller_rabin_test(n, [two, N(3), N(5), N(7)]);
        else if ( Arithmetic.lt(n, N("2152302898747")) )
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11)]);
        else if ( Arithmetic.lt(n, N("3474749660383")) )
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11), N(13)]);
        else if ( Arithmetic.lt(n, N("341550071728321")) )
            return miller_rabin_test(n, [two, N(3), N(5), N(7), N(11), N(13), N(17)]);

        //return apr_cl_test(n);
        return baillie_psw_test(n, 7);
    }
    else
    {
        // fast deterministic test, TODO
        //return apr_cl_test( n );
        // strong probabilistic test for very large numbers ie > 1000 digits
        return baillie_psw_test(n, 7);
    }
}
function next_prime( n, dir )
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, x;
    //n = Arithmetic.abs(/*N(*/n/*)*/);
    dir = -1 === dir ? -1 : 1;

    if ( 0 > dir )
    {
        // previous prime
        if ( Arithmetic.lte(n, two) ) return null; // no previous prime
        else if ( Arithmetic.equ(n, 3) ) return two; // first prime

        for(x=Arithmetic.sub(n, Arithmetic.equ(O, Arithmetic.mod(n, two)) ? I : two);;x=Arithmetic.sub(x,two))
            if ( is_probable_prime(x) && is_prime(x) ) return x;
    }
    else
    {
        // next prime
        if ( Arithmetic.lt(n, two) ) return two; // first prime
        for(x=Arithmetic.add(n, Arithmetic.equ(O, Arithmetic.mod(n, two)) ? I : two);;x=Arithmetic.add(x,two))
            if ( is_probable_prime(x) && is_prime(x) ) return x;
    }
}
function pollard_rho( n, s, a, retries, max_steps, F )
{
    // find a non-trivial factor of n using the Pollard-Rho heuristic
    // http://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm
    // https://en.wikipedia.org/wiki/Pohlig%E2%80%93Hellman_algorithm
    // https://en.wikipedia.org/wiki/Pollard%27s_kangaroo_algorithm
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        two = Arithmetic.II, V, U, i, j, g, n_1, n_3;

    if ( Arithmetic.lte(n, 5) ) return Arithmetic.equ(n, 4) ? two : n; // 0,1,2,3,4(=2*2),5

    if ( null == s ) s = two;
    if ( null == a ) a = I;
    if ( null == retries ) retries = 5;

    n_1 = Arithmetic.sub(n, I);
    n_3 = Arithmetic.sub(n, 3);
    retries = +(retries || 0);
    max_steps = max_steps || null;
    F = F || null;

    V = s;
    for(i=0; i<=retries; i++)
    {
        U = V;
        j = 0;
        if ( !is_callable(F) )
            F = function( x ) {
                return Arithmetic.mod(Arithmetic.add(Arithmetic.mod(Arithmetic.mul(x, x), n), a), n);
            };
        for(;;)
        {
            if ( (null!=max_steps) && (j>max_steps) ) break;
            j += 1;
            U = F(U);
            V = F(F(V));  // V is 2x further along than U
            g = gcd(Arithmetic.sub(U, V), n);
            if ( Arithmetic.equ(I, g) ) continue;
            if ( Arithmetic.equ(n, g) ) break;
            return g;
        }
        V = Arithmetic.rnd(O, n_1);
        a = Arithmetic.rnd(I, n_3)  // for x^2 + a, a%n should not be 0 or -2
        F = null;
    }
    return null;
}
function pollard_pm1( n, B, a, retries )
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        i, aM, p, e, g, n_2, B_1, ip,
        primes = small_primes(), pl = primes.length;

    if ( null == retries ) retries = 0;
    if ( null == a ) a = two;
    if ( null == B ) B = N(10);
    retries = +retries;
    //a = N(a); B = N(B);

    if ( Arithmetic.lt(n, 4) || Arithmetic.lt(B, 3) ) return null;

    n_2 = Arithmetic.sub(n, two); //B_1 = Arithmetic.add(B, I);
    // computing a**lcm(1,2,3,..B) % n for B > 2
    // it looks weird, but it's right: primes run [2, B]
    // and the answer's not right until the loop is done.
    for (i=0; i<=retries; i++)
    {
        aM = a;
        for (ip=0; ip<pl; ip++)
        {
            // these are pre-computed (small) primes and may not cover whole range up to B
            // for small values of B, no problem, else it will cover up to largest pre-computed small prime
            p = primes[ip];
            if ( Arithmetic.gt(p, B) ) break;
            e = ilog(B, p);
            aM = powm(aM, Arithmetic.pow(p, e), n);
        }
        g = gcd(Arithmetic.sub(aM, I), n);
        if ( Arithmetic.gt(g, I) && Arithmetic.lt(g, n) ) return g;

        // get a new a:
        // since the exponent, lcm(1..B), is even, if we allow 'a' to be 'n-1'
        // then (n - 1)**even % n will be 1 which will give a g of 0 and 1 will
        // give a zero, too, so we set the range as [2, n-2]. Some references
        // say 'a' should be coprime to n, but either will detect factors.
        a = Arithmetic.rnd(two, n_2);
    }
    return null;
}
function trial_div_fac( n, maxlimit )
{
    // https://en.wikipedia.org/wiki/Trial_division
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, factors, f, e, f1, L,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        /*three, five, seven, four, six, eight, ten, inc,*/ n0, i, l, p, p2, fac,
        primes = small_primes();

    if ( !primes.length ) primes = [two, N(3)];
    if ( Arithmetic.equ(primes[primes.length-1], two) ) primes.push(N(3));

    factors = null; f1 = null; L = 0;

    n0 = n;
    for(i=0,l=primes.length; i<l; i++)
    {
        p = primes[i];
        if ( Arithmetic.equ(n0, p) ) return [[p, I]];

        p2 = Arithmetic.mul(p, p);

        if ( Arithmetic.gt(p2, n) || (null!=maxlimit && Arithmetic.gt(p2, maxlimit)) ) break;

        if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) )
        {
            e = I; n = Arithmetic.div(n, p);
            while( Arithmetic.equ(O, Arithmetic.mod(n, p)) )
            {
                e = Arithmetic.add(I, e);
                n = Arithmetic.div(n, p);
            }
            // add last
            f = new Node([p, e]);
            f.l = f1;
            if ( f1 ) f1.r = f;
            f1 = f; L++;
            if ( !factors ) factors = f1;
        }
    }
    if ( i >= l )
    {
        p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        while (Arithmetic.lte(p2, n) && (null==maxlimit || Arithmetic.lte(p2, maxlimit)))
        {
            e = O;
            while ( Arithmetic.equ(O, Arithmetic.mod(n, p)) )
            {
                e = Arithmetic.add(I, e);
                n = Arithmetic.div(n, p);
            }
            if ( Arithmetic.lt(O, e) )
            {
                // add last
                f = new Node([p, e]);
                f.l = f1;
                if ( f1 ) f1.r = f;
                f1 = f; L++;
                if ( !factors ) factors = f1;
            }
            p = Arithmetic.add(p, two); p2 = Arithmetic.mul(p, p);
        }
    }
    if ( (null==maxlimit) && Arithmetic.gt(n, I) )
    {
        // add last
        f = new Node([n, I]);
        f.l = f1;
        if ( f1 ) f1.r = f;
        f1 = f; L++;
        if ( !factors ) factors = f1;
    }

    // traverse list of factors and return array
    fac = array(L, function(){
        var f = factors, factor = f.v;
        factors = factors.r;
        f.dispose(); // dispose
        if ( factors ) factors.l = null;
        return factor;
    });
    return null == maxlimit ? fac : [fac, n]; // return factorization up to limit + remainder
}
function siqs_fac( n )
{
    // https://en.wikipedia.org/wiki/Quadratic_sieve
    // TODO
    return [[n, Abacus.Arithmetic.I]];
}
function merge_factors( f1, f2 )
{
    var Arithmetic = Abacus.Arithmetic, i1 = 0, i2 = 0, l1 = f1.length, l2 = f2.length, l = 0, f12;
    f12 = new Array(l1+l2);
    while(i1 < l1 && i2 < l2)
    {
        if ( Arithmetic.equ(f1[i1][0], f2[i2][0]) )
        {
            if ( l && Arithmetic.equ(f12[l-1][0], f1[i1][0]) )
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], Arithmetic.add(f1[i1][1], f2[i2][1]));
            }
            else
            {
                f12[l++] = [f1[i1][0], Arithmetic.add(f1[i1][1], f2[i2][1])];
            }
            i1++; i2++;
        }
        else if ( Arithmetic.lt(f1[i1][0], f2[i2][0]) )
        {
            if ( l && Arithmetic.equ(f12[l-1][0], f1[i1][0]) )
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], f1[i1][1]);
            }
            else
            {
                f12[l++] = f1[i1];
            }
            i1++;
        }
        else //if ( Arithmetic.gt(f1[i1][0], f2[i2][0]) )
        {
            if ( l && Arithmetic.equ(f12[l-1][0], f2[i2][0]) )
            {
                f12[l-1][1] = Arithmetic.add(f12[l-1][1], f2[i2][1]);
            }
            else
            {
                f12[l++] = f2[i2];
            }
            i2++;
        }
    }
    while(i1 < l1)
    {
        if ( l && Arithmetic.equ(f12[l-1][0], f1[i1][0]) )
        {
            f12[l-1][1] = Arithmetic.add(f12[l-1][1], f1[i1][1]);
        }
        else
        {
            f12[l++] = f1[i1];
        }
        i1++;
    }
    while(i2 < l2)
    {
        if ( l && Arithmetic.equ(f12[l-1][0], f2[i2][0]) )
        {
            f12[l-1][1] = Arithmetic.add(f12[l-1][1], f2[i2][1]);
        }
        else
        {
            f12[l++] = f2[i2];
        }
        i2++;
    }
    // truncate if needed
    if ( f12.length > l ) f12.length = l;
    return f12;
}
function factorize( n )
{
    // https://en.wikipedia.org/wiki/Integer_factorization
    var Arithmetic = Abacus.Arithmetic, INT = null, ndigits, f, factors;
    if ( is_instance(n, Integer) )
    {
        INT = n[CLASS];
        n = n.num;
    }
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if ( ndigits <= 20 )
    {
        // trial division for small numbers
        factors = trial_div_fac(n);
    }
    else //if ( ndigits <= 1000 )
    {
        // recursive (heuristic) factorization for medium-to-large numbers
        f = pollard_rho(n, Arithmetic.II, Arithmetic.I, 5, 100, null);
        // try another heuristic as well
        if ( null == f ) f = pollard_pm1(n, Arithmetic.num(10), Arithmetic.II, 5);
        if ( null == f ) factors = [[n, Arithmetic.I]];
        else factors = merge_factors(factorize(f), factorize(Arithmetic.div(n, f)));
    }
    /*else
    {
        // self-initialising quadratic sieve for (very) large numbers TODO
        factors = siqs_fac(n);
    }*/
    return INT ? factors.map(function(f){return [new INT(f[0]), new INT(f[1])];}) : factors;
}
function dec2frac( dec, simplify )
{
    // compute fraction (num/denom) for given decimal number (can include repeating decimals through special notation)
    // eg -123.23[456] , last 456 digits are repeating infinitely
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        i, n, d, m, g, k, e, ten, fraction, N = Arithmetic.num,
        is_neg = false, is_zero, non_repeating = null, repeating = null;

    dec = trim(String(dec)); // convert to string if not already
    m = dec.match(dec_pattern);
    if ( !m ) return null; // not valid decimal

    if ( m[1] ) is_neg = true; // negative number, keep track

    i = N(m[2]); // integer part

    fraction = [O, I];
    ten = N(10);

    if ( !m[3] || (!m[4] && !m[5]) )
    {
        fraction[0] = is_neg ? Arithmetic.neg(i) : i;
        if ( m[6] )
        {
            e = N(m[6].slice(1));
            if ( Arithmetic.lt(e, O) ) fraction[1] = Arithmetic.pow(ten, Arithmetic.neg(e));
            else fraction[0] = Arithmetic.mul(fraction[0], Arithmetic.pow(ten, e));
        }
        return fraction; // just integer, no decimal part
    }

    if ( m[4] )
    {
        non_repeating = m[4];
    }
    if ( m[5] )
    {
        repeating = m[5].slice(1,-1); // remove surrounding brackets
        is_zero = true;
        for(k=repeating.length-1; k>=0; k--)
        {
            if ( repeating.charAt(k) !== '0' )
            {
                is_zero = false;
                break;
            }
        }
        if ( is_zero ) repeating = null; // repeating zeroes are trivial
    }

    if ( !repeating )
    {
        // no repeating decimals
        // remove unnecessary trailing zeroes
        while( non_repeating && (non_repeating.slice(-1)==='0') ) non_repeating = non_repeating.slice(0, -1);
        if ( !non_repeating || !non_repeating.length )
        {
            d = I;
            n = i; // only integer part
        }
        else
        {
            d = Arithmetic.pow(ten, non_repeating.length);
            n = Arithmetic.add(Arithmetic.mul(d, i), N(non_repeating));
        }
        if ( m[6] )
        {
            e = N(m[6].slice(1));
            if ( Arithmetic.lt(e, O) ) d = Arithmetic.mul(d, Arithmetic.pow(ten, Arithmetic.neg(e)));
            else n = Arithmetic.mul(n, Arithmetic.pow(ten, e));
        }
    }
    else
    {
        // with repeating decimals
        if ( non_repeating )
        {
            // remove common repeating digits from non_repeating digits, in case they are included
            while( (non_repeating.length>=repeating.length) && (non_repeating.slice(-repeating.length)===repeating) )
                non_repeating = non_repeating.slice(0, -repeating.length);
            if ( !non_repeating.length ) non_repeating = null;
        }
        d = Arithmetic.sub(Arithmetic.pow(ten, (non_repeating ? non_repeating.length : 0)+repeating.length), non_repeating ? Arithmetic.pow(ten, non_repeating.length) : I);
        n = Arithmetic.add(Arithmetic.mul(d, i), Arithmetic.sub(N((non_repeating ? non_repeating : '')+repeating), non_repeating ? N(non_repeating) : O));
    }

    if ( false !== simplify )
    {
        // remove common factors, simplify
        g = gcd(n, d);
        n = Arithmetic.div(n, g);
        d = Arithmetic.div(d, g);
    }
    fraction[0] = is_neg ? Arithmetic.neg(n) : n;
    fraction[1] = d;
    return fraction;
}
function default_eq( a, b )
{
    // default equality between a and b
    return a===b;
}
function floyd_cycle_detection( f, x0, eq )
{
    // https://en.wikipedia.org/wiki/Cycle_detection#Floyd's_Tortoise_and_Hare
    // floyd tortoise-hare algorithm for cycle detection
    var tortoise, hare, mu, lam;
    eq = eq || default_eq;
    tortoise = f(x0); hare = f(tortoise);
    while ( !eq(tortoise, hare) )
    {
        tortoise = f(tortoise);
        hare = f(f(hare));
    }
    mu = 0;
    tortoise = x0;
    while ( !eq(tortoise, hare) )
    {
        tortoise = f(tortoise);
        hare = f(hare);
        mu++;
    }
    lam = 1;
    hare = f(tortoise);
    while ( !eq(tortoise, hare) )
    {
        hare = f(hare);
        lam++;
    }
    return [lam/*period*/, mu/*first_repeat*/];
}
function frac2dec( n, d )
{
    // fraction to decimal, with optional repeating digits
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        q, r, t, decimal, period, i, c, ten,
        dot, whole, repeating, non_repeating, is_neg = false, is_zero;

    if ( Arithmetic.equ(O, d) ) return null; // not valid fraction

    is_neg = (Arithmetic.lt(O, n) && Arithmetic.gt(O, d)) || (Arithmetic.lt(O, d) && Arithmetic.gt(O, n)); // keep track if negative number

    n = Arithmetic.abs(n); d = Arithmetic.abs(d);
    q = Arithmetic.div(n, d); r = Arithmetic.mod(n, d);

    whole = (is_neg ? '-' : '') + String(q); decimal = [];

    ten = Arithmetic.num(10);
    period = floyd_cycle_detection(
        function( r ) {
            return Arithmetic.mod(Arithmetic.mul(ten, r), d);
        },
        r,
        function( a, b ) {
            return Arithmetic.equ(a, b);
        }
    );

    for (i=0,c=period[0]+period[1]; i<c; i++)
    {
        // long division up to repeating digits
        t = Arithmetic.mul(ten, r);
        q = Arithmetic.div(t, d);
        r = Arithmetic.mod(t, d);
        decimal.push(String(q));
    }

    repeating = decimal.slice(period[1]).join('');
    if ( repeating.length )
    {
        is_zero = true;
        for(i=repeating.length-1; i>=0; i--)
        {
            if ( repeating.charAt(i) !== '0' )
            {
                is_zero = false;
                break;
            }
        }
        if ( is_zero ) repeating = ''; // repeating zeroes are trivial
        else repeating = '['+repeating+']';
    }

    non_repeating = decimal.slice(0, period[1]).join('');
    if ( non_repeating.length )
    {
        is_zero = true;
        for(i=non_repeating.length-1; i>=0; i--)
        {
            if ( non_repeating.charAt(i) !== '0' )
            {
                is_zero = false;
                break;
            }
        }
        if ( is_zero && !repeating.length ) non_repeating = ''; // zeroes are trivial
    }

    dot = non_repeating.length || repeating.length ? '.' : '';
    return whole + dot + non_repeating + repeating;
}
function gcd( /* args */ )
{
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Greatest_common_divisor
    // supports Exact Big Integer Arithmetic if plugged in
    // note: returns always positive gcd (even of negative numbers)
    // note2: any zero arguments are skipped
    // note3: gcd(0,0,..,0) is conventionaly set to 0
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, a, b, t, i, zeroes,
        Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I;
    if ( 0 === c ) return O;

    i = 0;
    while (i<c && Arithmetic.equ(O, a=args[i++]) );
    a = Arithmetic.abs(a);
    while (i<c)
    {
        // break early
        if ( Arithmetic.equ(a, I) ) return I;
        while (i<c && Arithmetic.equ(O, b=args[i++]) );
        b = Arithmetic.abs(b);
        // break early
        if ( Arithmetic.equ(b, I) ) return I;
        else if ( Arithmetic.equ(b, a) ) continue;
        else if ( Arithmetic.equ(b, O) ) break;
        // swap them (a >= b)
        if ( Arithmetic.lt(a, b) ) { t=b; b=a; a=t; }
        while (!Arithmetic.equ(O, b)) { t = b; b = Arithmetic.mod(a, t); a = t; }
    }
    return a;
}
function lcm2( a, b )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, aa = Arithmetic.abs(a), bb = Arithmetic.abs(b);
    if ( Arithmetic.equ(aa, bb) ) return sign(a) === sign(b) ? aa : Arithmetic.neg(aa);
    return Arithmetic.mul(Arithmetic.div(a, gcd(a, b)), b);
}
function lcm( /* args */ )
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    if ( 1 >= l ) return 1===l ? args[0] : O;
    if ( Arithmetic.equ(O, args[0]) || Arithmetic.equ(O, args[1]) ) return O;
    LCM = lcm2(args[0], args[1]);
    for(i=2; i<l; i++)
    {
        if ( Arithmetic.equ(O, args[i]) ) return O;
        LCM = lcm2(LCM, args[i]);
    }
    return LCM;
}
function xgcd( /* args */ )
{
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Integer_relation_algorithm
    // supports Exact Big Integer Arithmetic if plugged in
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        a, b, a1 = I, b1 = O, a2 = O, b2 = I, quot, gcd, asign = I, bsign = I;

    if ( 0 === k ) return;

    a = args[0];
    if ( Arithmetic.gt(O, a) ) {a = Arithmetic.abs(a); asign = J;}
    if ( 1 === k )
    {
        return [a, asign];
    }
    else //if ( 2 <= k )
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        // for coefficients this translates to:
        // gcd(a,b,c,..) = ax + by + cz + .. =
        // gcd(a, gcd(b, c, ..)) = ax + k gcd(b,c,..) = (given gcd(b,c,..) = nb + mc + ..)
        // gcd(a, gcd(b, c, ..)) = ax + k (nb + mc + ..) = ax + b(kn) + c(km) + .. = ax + by +cz + ..
        // also for possible negative numbers we can do (note gcd(a,b,c,..) is always positive):
        // a*(sign(a)*x) + b*(sign(b)*y) + c*(sign(c)*z) + .. = gcd(|a|,|b|,|c|,..) so factors are same only adjusted by sign(.) to match always positive GCD
        // note: returns always positive gcd (even of negative numbers)
        // note2: any zero arguments are skipped and do not break xGCD computation
        // note3: gcd(0,0,..,0) is conventionaly set to 0 with 1's as factors
        gcd = 2 === k ? [args[1], I] : xgcd(slice.call(args, 1));
        b = gcd[0];
        if ( Arithmetic.gt(O, b) ) {b = Arithmetic.abs(b); bsign = J;}

        // gcd with zero factor, take into account
        if ( Arithmetic.equ(O, a) )
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });
        else if ( Arithmetic.equ(O, b) )
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });

        for(;;)
        {
            quot = Arithmetic.div(a, b);
            a = Arithmetic.mod(a, b);
            a1 = Arithmetic.sub(a1, Arithmetic.mul(quot, a2));
            b1 = Arithmetic.sub(b1, Arithmetic.mul(quot, b2));
            if ( Arithmetic.equ(O, a) )
            {
                a2 = Arithmetic.mul(a2, asign); b2 = Arithmetic.mul(b2, bsign);
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : Arithmetic.mul(b2, gcd[i-1]));
                });
            }

            quot = Arithmetic.div(b, a);
            b = Arithmetic.mod(b, a);
            a2 = Arithmetic.sub(a2, Arithmetic.mul(quot, a1));
            b2 = Arithmetic.sub(b2, Arithmetic.mul(quot, b1));
            if ( Arithmetic.equ(O, b) )
            {
                a1 = Arithmetic.mul(a1, asign); b1 = Arithmetic.mul(b1, bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : Arithmetic.mul(b1, gcd[i-1]));
                });
            }
        }
    }
}
function igcd( /* args */ )
{
    // gcd of Integer numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return Integer(gcd(array(args.length, function(i){return args[i].num;})));
}
function ilcm( /* args */ )
{
    // lcm of Integer numbers
    // https://math.stackexchange.com/questions/44836/rational-numbers-lcm-and-hcf
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return Integer(lcm(array(args.length, function(i){return args[i].num;})));
}
function ixgcd( /* args */ )
{
    // xgcd of Integer numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    if ( !args.length ) return;
    return xgcd(array(args.length, function(i){return args[i].num;})).map(function(g){return Integer(g);});
}
function ngcd( /* args */ )
{
    // gcd of Integer modulo numbers = min(n1,n2,..nk)
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, gcd = null, i, l = args.length;
    for(i=0; i<l; i++)
    {
        if ( !args[i].equ(O) && (null==gcd || args[i].lt(gcd)) )
            gcd = args[i];
    }
    return null==gcd ? args[0] : gcd;
}
function nxgcd( /* args */ )
{
    // xgcd of Integer modulo numbers = min(n1,n2,..nk)
    var args = slice.call(arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments),
        Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, index = -1, gcd = null, i, l = args.length;
    if ( !args.length ) return;
    for(i=0; i<l; i++)
    {
        if ( !args[i].equ(O) && (null==gcd || args[i].lt(gcd)) )
        {
            gcd = args[i];
            index = i;
        }
    }
    return null==gcd ? array(args.length+1, function(i){
        return 0===i ? args[0] : (1===i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
    }) : array(args.length+1, function(i){
        return 0===i ? gcd : (index+1===i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
    });
}
function nlcm( /* args */ )
{
    // least common multiple of Integers modulo = max(n1,n2,..nk)
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O;
    if ( 1 >= l ) return 1===l ? args[0] : IntegerMod.Zero(2);
    if ( args[0].equ(O) || args[1].equ(O) ) return IntegerMod.Zero(args[0].m);
    LCM = nmax(args[0], args[1]);
    for(i=2; i<l; i++)
    {
        if ( args[i].equ(O) ) return IntegerMod.Zero(args[0].m);
        LCM = nmax(LCM, args[i]);
    }
    return LCM;
}
function rgcd( /* args */ )
{
    // gcd of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, denom;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
    return Rational(gcd(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
}
function rxgcd( /* args */ )
{
    // xgcd of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, denom;
    if ( !args.length ) return;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, I, args);
    return xgcd(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})).map(function(g, i){return 0===i ? Rational(g, denom) : Rational(g, I, true);});
}
function rlcm( /* args */ )
{
    // lcm of Rational numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, denom;
    denom = operate(function(p, r){return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
    return Rational(lcm(array(args.length, function(i){return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
}
function cgcd( /* args */ )
{
    // Generalization of Euclid GCD Algorithm for complex numbers
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, a0, b0, a, b, t, r, i;

    if ( 0 === c ) return Complex.Zero();

    i = 0;
    while(i<c && (a=args[i++]).equ(O)) ;
    while (i<c)
    {
        while(i<c && (b=args[i++]).equ(O)) ;
        if ( b.equ(a) ) continue;
        else if ( b.equ(O) ) break;
        // swap them (a >= b)
        if ( b.norm().gt(a.norm()) ) { t=b; b=a; a=t; }
        while ( !b.equ(O) )
        {
            //a0 = a; b0 = b;
            r = a.mod(b); a = b; b = r;
            //if ( a.equ(b0) && b.equ(a0) ) break; // will not change anymore
        }
    }
    // normalize it
    if ( a.real().abs().lt(a.imag().abs()) ) a = a.mul(Complex.Img());
    if ( a.real().lt(O) ) a = a.neg();
    return a;
}
function cxgcd( /* args */ )
{
    // Generalization of Extended GCD Algorithm for complex numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, i, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        asign = Complex.One(), bsign = Complex.One(), t, a, b, a0, b0, a1, b1, a2, b2, qr, gcd;

    if ( 0 === k ) return;

    a = args[0];

    if ( 1 === k )
    {
        // normalize it
        if ( a.real().abs().lt(a.imag().abs()) ) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img()); }
        if ( a.real().lt(O) ) { a = a.neg(); asign = asign.neg(); }
        return [a, asign];
    }
    else //if ( 2 <= k )
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        gcd = 2===k ? [args[1], Complex.One()] : cxgcd(slice.call(args, 1));
        b = gcd[0];

        // gcd with zero factor, take into account
        if ( a.equ(O) )
        {
            // normalize it
            if ( b.real().abs().lt(b.imag().abs()) ) { b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
            if ( b.real().lt(O) ) { b = b.neg(); asign = asign.neg(); bsign = bsign.neg(); }
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? asign : gcd[i-1].mul(bsign));
            });
        }
        else if ( b.equ(O) )
        {
            // normalize it
            if ( a.real().abs().lt(a.imag().abs()) ) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
            if ( a.real().lt(O) ) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? asign : gcd[i-1].mul(bsign));
            });
        }

        a1 = Complex.One();
        b1 = Complex.Zero();
        a2 = Complex.Zero();
        b2 = Complex.One();

        for(;;)
        {
            //a0 = a; b0 = b;

            qr = a.divmod(b);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if ( a.equ(O) )
            {
                // normalize it
                if ( b.real().abs().lt(b.imag().abs()) ) { b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if ( b.real().lt(O) ) { b = b.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a2 = a2.mul(asign); b2 = b2.mul(bsign);
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : gcd[i-1].mul(b2));
                });
            }

            qr = b.divmod(a);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if( b.equ(O) )
            {
                // normalize it
                if ( a.real().abs().lt(a.imag().abs()) ) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if ( a.real().lt(O) ) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }

            /*if ( a.equ(a0) && b.equ(b0) )
            {
                // will not change anymore
                if ( a.real().abs().lt(a.imag().abs()) ) { a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img()); }
                if ( a.real().lt(O) ) { a = a.neg(); asign = asign.neg(); bsign = bsign.neg(); }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }*/
        }
    }
}
function clcm2( a, b )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = cgcd(a, b);
    return g.equ(O) ? g : a.div(g).mul(b);
}
function clcm( /* args */ )
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O;
    if ( 1 >= l ) return 1===l ? args[0] : Complex.Zero();
    if ( args[0].equ(O) || args[1].equ(O) ) return Complex.Zero();
    LCM = clcm2(args[0], args[1]);
    for(i=2; i<l; i++)
    {
        if ( args[i].equ(O) ) return Complex.Zero();
        LCM = clcm2(LCM, args[i]);
    }
    return LCM;
}
function polygcd( /* args */ )
{
    // Generalization of Euclid GCD Algorithm for polynomials
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor
    // https://en.wikipedia.org/wiki/Euclidean_division_of_polynomials
    // https://en.wikipedia.org/wiki/Polynomial_long_division
    // should be a generalisation of number gcd, meaning for constant polynomials should coincide with gcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, a, b, a0, b0, t, r, i, p, q, field;

    if ( 0 === c ) return PolynomialClass.Zero();
    PolynomialClass = args[0][CLASS];

    for(i=0; i<c; i++)
    {
        if ( !args[i].isConst() )
        {
            are_const = false;
            break;
        }
    }
    // defer to gcd of coefficients and transform back to polynomial
    if ( are_const ) return PolynomialClass(args[0].ring.gcd(array(args.length, function(i){return args[i].cc();})), args[0].symbol, args[0].ring);

    // Generalization of Euclid GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if ( is_class(args[0].ring.NumberClass, Integer) )
    {
        a = args[0];
        if ( 1 == c )
        {
            return a.monic();
        }
        else //if ( 2 <= c )
        {
            field = a.ring.associatedField(); // Q[X]
            p = PolynomialClass(a, a.symbol, field);
            q = PolynomialClass(2===c ? args[1] : polygcd(slice.call(args, 1)), a.symbol, field);
            return PolynomialClass(polygcd(p, q).primitive().mul(field.gcd(p.content(), q.content())), a.symbol, a.ring);
        }
    }

    i = 0;
    while(i<c && (a=args[i++]).equ(O)) ;
    if ( a.lc().lt(O) ) a = a.neg();
    while (i<c)
    {
        if ( a.equ(I) ) return PolynomialClass.One(a.symbol, a.ring);
        while(i<c && (b=args[i++]).equ(O)) ;
        if ( b.lc().lt(O) ) b = b.neg();
        if ( b.equ(I) ) return PolynomialClass.One(a.symbol, a.ring);
        else if ( b.equ(a) ) continue;
        else if ( b.equ(O) ) break;
        // swap them (a >= b)
        if ( 0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true) ) { t=b; b=a; a=t; }
        while ( !b.equ(O) )
        {
            //a0 = a; b0 = b;
            r = a.mod(b); a = b; b = r;
            //if ( a.equ(b0) && b.equ(a0) ) break; // will not change anymore
        }
    }
    // simplify, positive and monic
    a = a.monic();
    return a;
}
function polyxgcd( /* args */ )
{
    // Generalization of Extended GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
    // should be a generalisation of number xgcd, meaning for constant polynomials should coincide with xgcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, i, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, asign, bsign,
        a, b, a0, b0, a1, b1, a2, b2, lead,
        qr, gcd, g, f, p, q, field;

    if ( 0 === k ) return;

    a = args[0];
    PolynomialClass = a[CLASS];

    for(i=0; i<k; i++)
    {
        if ( !args[i].isConst() )
        {
            are_const = false;
            break;
        }
    }
    // defer to xgcd of coefficients and transform back to polynomial
    if ( are_const ) return a.ring.xgcd(array(args.length, function(i){return args[i].cc();})).map(function(g){return PolynomialClass(g, a.symbol, a.ring);});


    // Generalization of Euclid extended GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if ( is_class(a.ring.NumberClass, Integer) )
    {
        field = a.ring.associatedField(); // Q[X]
        asign = field.One(); bsign = asign;
        if ( 1 == k )
        {
            // normalize it
            lead = a.lc();
            if ( lead.divides(asign) )
            {
                a = a.monic();
                if ( !lead.equ(a.lc()) ) {asign = asign.mul(a.lc()).div(lead);}
            }
            else if ( lead.lt(O) )
            {
                a = a.neg(); asign = asign.neg();
            }
            return [a, PolynomialClass(asign, a.symbol, field)];
        }
        else //if ( 2 <= k )
        {
            gcd = 2===k ? [args[1], PolynomialClass.One(a.symbol, field)] : polyxgcd(slice.call(args, 1));
            b = gcd[0];
            p = PolynomialClass(a, a.symbol, field);
            q = PolynomialClass(b, a.symbol, field);
            g = polyxgcd(p, q);
            f = field.gcd(p.content(), q.content());
            // Bezout's Identity for Polynomials works only for polys over a field, not simply a ring, like Z
            // thus the coefficients are in general polys over Q ie Q[x]
            // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity#For_polynomials
            g[0] = g[0].primitive().mul(f); g[1] = g[1].mul(f); g[2] = g[2].mul(f);
            return array(gcd.length+1, function(i){
                return 0===i ? PolynomialClass(g[0], a.symbol, a.ring) : (1===i ? g[1] : gcd[i-1].mul(g[2]));
            });
        }
    }

    asign = a.ring.One(); bsign = asign;
    if ( 1 === k )
    {
        // normalize it
        lead = a.lc();
        if ( lead.divides(asign) )
        {
            a = a.monic();
            if ( !lead.equ(a.lc()) ) {asign = asign.mul(a.lc()).div(lead);}
        }
        else if ( lead.lt(O) )
        {
            a = a.neg(); asign = asign.neg();
        }
        return [a, PolynomialClass(asign, a.symbol, a.ring)];
    }
    else //if ( 2 <= k )
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        // for coefficients this translates to:
        // gcd(a,b,c,..) = ax + by + cz + .. =
        // gcd(a, gcd(b, c, ..)) = ax + k gcd(b,c,..) = (given gcd(b,c,..) = nb + mc + ..)
        // gcd(a, gcd(b, c, ..)) = ax + k (nb + mc + ..) = ax + b(kn) + c(km) + .. = ax + by +cz + ..
        // note2: any zero arguments are skipped and do not break xGCD computation
        // note3: gcd(0,0,..,0) is conventionaly set to 0 with 1's as factors
        gcd = 2===k ? [args[1], PolynomialClass.One(a.symbol, a.ring)] : polyxgcd(slice.call(args, 1));
        b = gcd[0];

        // gcd with zero factor, take into account
        if ( a.equ(O) )
        {
            // normalize it
            lead = b.lc();
            if ( lead.divides(asign) && lead.divides(bsign) )
            {
                b = b.monic();
                if ( !lead.equ(b.lc()) ) {asign = asign.mul(b.lc()).div(lead); bsign = bsign.mul(b.lc()).div(lead);}
            }
            else if ( lead.lt(O) )
            {
                b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
            });
        }
        else if ( b.equ(O) )
        {
            // normalize it
            lead = a.lc();
            if ( lead.divides(asign) && lead.divides(bsign) )
            {
                a = a.monic();
                if ( !lead.equ(a.lc()) ) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
            }
            else if ( lead.lt(O) )
            {
                a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
            });
        }

        a1 = PolynomialClass.One(a.symbol, a.ring);
        b1 = PolynomialClass.Zero(a.symbol, a.ring);
        a2 = Polynomial.Zero(a.symbol, a.ring);
        b2 = Polynomial.One(a.symbol, a.ring);

        for(;;)
        {
            //a0 = a; b0 = b;

            qr = a.divmod(b);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if ( a.equ(O) )
            {
                // normalize it
                lead = b.lc();
                if ( lead.divides(asign) && lead.divides(bsign) )
                {
                    b = b.monic();
                    if ( !lead.equ(b.lc()) ) {asign = asign.mul(b.lc()).div(lead); bsign = bsign.mul(b.lc()).div(lead);}
                }
                else if ( lead.lt(O) )
                {
                    b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a2 = a2.mul(asign); b2 = b2.mul(bsign);
                return array(gcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : gcd[i-1].mul(b2));
                });
            }

            qr = b.divmod(a);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if( b.equ(O) )
            {
                // normalize it
                lead = a.lc();
                if ( lead.divides(asign) && lead.divides(bsign) )
                {
                    a = a.monic();
                    if ( !lead.equ(a.lc()) ) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
                }
                else if ( lead.lt(O) )
                {
                    a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }

            /*if ( a.equ(a0) && b.equ(b0) )
            {
                // will not change anymore
                // normalize it
                lead = a.lc();
                if ( lead.divides(asign) && lead.divides(bsign) )
                {
                    a = a.monic();
                    if ( !lead.equ(a.lc()) ) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
                }
                else if ( lead.lt(O) )
                {
                    a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                }
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : gcd[i-1].mul(b1));
                });
            }*/
        }
    }
}
function polylcm2( a, b )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = polygcd(a, b);
    return g.equ(O) ? g : a.div(g).mul(b);
}
function polylcm( /* args */ )
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O, PolynomialClass = Polynomial;
    if ( 1 >= l ) return 1===l ? args[0] : PolynomialClass.Zero();
    PolynomialClass = args[0][CLASS];
    if ( args[0].equ(O) || args[1].equ(O) ) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
    LCM = polylcm2(args[0], args[1]);
    for(i=2; i<l; i++)
    {
        if ( args[i].equ(O) ) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
        LCM = polylcm2(LCM, args[i]);
    }
    return LCM;
}
function rfgcd( /* args */ )
{
    // gcd of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return RationalFunc(polygcd(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})), denom);
}
function rfxgcd( /* args */ )
{
    // xgcd of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    if ( !args.length ) return;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return polyxgcd(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})).map(function(g, i){return 0===i ? RationalFunc(g, denom) : RationalFunc(g);});
}
function rflcm( /* args */ )
{
    // lcm of Rational Functions
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        denom;
    denom = operate(function(p, r){return r.den.mul(p);}, Abacus.Arithmetic.I, args);
    return RationalFunc(polylcm(array(args.length, function(i){return args[i].num.mul(denom.div(args[i].den));})), denom);
}
function divisors( n, as_generator )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        list = null, D2 = null, D1 = null, L1 = 0, L2 = 0, node, sqrn, i, n_i, next, factors, INT = null;

    if ( is_instance(n, Integer) ) { INT = n[CLASS]; n = n.num; }

    n = Arithmetic.abs(n);
    if ( true===as_generator )
    {
        if ( Arithmetic.gte(n, 10000) )
        {
            // for very large numbers,
            // compute divisors through prime factorisation
            // using a tensor combinatorial iterator/generator
            factors = factorize(n);
            return Tensor(factors.map(function(factor){
                return Arithmetic.val(factor[1])+1;
            })).mapTo(function(selection){
                var d = selection.reduce(function(divisor, e, i){
                    return 0 === e ? divisor : Arithmetic.mul(divisor, Arithmetic.pow(factors[i][0], e));
                }, I);
                return INT ? new INT(d) : d;
            });
        }
        else
        {
            // time+space O(sqrt(n)) to find all distinct divisors of n (including 1 and n itself)
            sqrn = isqrt(n);
            i = I; next = null;
            // return iterator/generator
            return Iterator(function(k, dir, state, first){
                // note will NOT return divisors sorted in order
                if ( 0 > dir ) return null; // only forward
                if ( first )
                {
                    i = I;
                    if ( !Arithmetic.equ(I, n) ) next = n;
                    return INT ? new INT(I) : I;
                }
                if ( next )
                {
                    k = next;
                    next = null;
                    return INT ? new INT(k) : k;
                }
                i = Arithmetic.add(i, I);
                while(Arithmetic.lte(i,sqrn))
                {
                    if ( Arithmetic.equ(O, Arithmetic.mod(n, i)) )
                    {
                        n_i = Arithmetic.div(n, i);
                        if ( !Arithmetic.equ(n_i, i) )
                        {
                            // two distinct divisors
                            next = n_i;
                        }
                        return INT ? new INT(i) : i;
                    }
                    i = Arithmetic.add(i, I);
                }
                return null;
            });
        }
    }
    else
    {
        // time+space O(sqrt(n)) to find all distinct divisors of n (including 1 and n itself)
        sqrn = isqrt(n);
        for (i=I; Arithmetic.lte(i,sqrn); i=Arithmetic.add(i,I))
        {
            if ( Arithmetic.equ(O, Arithmetic.mod(n, i)) )
            {
                n_i = Arithmetic.div(n, i);
                if ( Arithmetic.equ(n_i, i) )
                {
                    // one distinct divisor, add to small list (after current)
                    node = new Node(i, D1, null); L1++;
                    if ( D1 ) D1.r = node;
                    D1 = node;
                }
                else
                {
                    // two distinct divisors, add to small list (after current) and add to large list (before current)
                    node = new Node(i, D1, null); L1++;
                    if ( D1 ) D1.r = node;
                    D1 = node;
                    node = new Node(n_i, null, D2); L2++;
                    if ( D2 ) D2.l = node;
                    D2 = node;
                }
                // take note of the start of the divisors list
                if ( !list ) list = D1;
            }
        }
        if ( D1 )
        {
            // connect the two lists (small then large)
            D1.r = D2;
            if ( D2 ) D2.l = D1;
        }
        D1 = null; D2 = null;
        // return all divisors sorted from smaller to larger (traverse divisors list and return items in order)
        return array(L1+L2, function(){
            var curr = list, divisor = curr.v; // get current list item
            list = curr.r; // shift list to next item in order from left to right
            curr.dispose(); // dispose previous list item
            if ( list ) list.l = null;
            return INT ? new INT(divisor) : divisor;
        });
    }
}
function moebius( n )
{
    // https://en.wikipedia.org/wiki/M%C3%B6bius_function
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        three, five, seven, four, six, eight, ten, inc, i, p, p2, m;

    // use factorization of n
    p = factorize(n); m = p.length;
    for(i=0; i<m; i++)
        if ( Arithmetic.lt(I, p[i][1]) )
            return O; // is not square-free
    return m & 1 ? I : Arithmetic.J;
}
function dotp( a, b, Arithmetic )
{
    Arithmetic = Arithmetic || Abacus.DefaultArithmetic;
    var c = Arithmetic.O, n = stdMath.min(a.length, b.length), i;
    for(i=0; i<n; i++)
    {
        // support dot product of numeric/symbolic as well
        if ( is_instance(c, INumber) )
        {
            if ( is_instance(a[i], INumber) )
                c = c.add(a[i].mul(b[i]));
            else if ( is_instance(b[i], INumber) )
                c = c.add(b[i].mul(a[i]));
            else
                c = c.add(Arithmetic.mul(a[i], b[i]));
        }
        else
        {
            if ( is_instance(a[i], INumber) )
                c = a[i].mul(b[i]).add(c);
            else if ( is_instance(b[i], INumber) )
                c = b[i].mul(a[i]).add(c);
            else
                c = Arithmetic.add(c, Arithmetic.mul(a[i], b[i]));
        }
    }
    return c;
}
function gramschmidt( v )
{
    // https://en.wikipedia.org/wiki/Gram%E2%80%93Schmidt_process
    // exact integer fraction-free, only orthogonal basis not necessarily orthonormal
    if ( !v.length ) return [];
    var Arithmetic = Abacus.Arithmetic, n = v.length, igcd,
        u = new Array(n), pjj = new Array(n), ui, uj, vi, pij, i, j, k, kl, g;
    // O(k*n^2)
    if ( is_instance(v[0][0], INumber) )
    {
        igcd = v[0][0][CLASS].gcd || gcd;
        for(i=0; i<n; i++)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for(j=0; j<i; j++)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for(k=0; k<kl; k++) ui[k] = pjj[j].mul(ui[k]).sub(pij.mul(uj[k]));
            }
            g = igcd(ui);
            if ( g.gt(Arithmetic.I) )
                for(k=0; k<kl; k++) ui[k] = ui[k].div(g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    else
    {
        igcd = gcd;
        for(i=0; i<n; i++)
        {
            vi = v[i]; u[i] = ui = vi.slice();
            kl = ui.length;
            for(j=0; j<i; j++)
            {
                uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
                for(k=0; k<kl; k++) ui[k] = Arithmetic.sub(Arithmetic.mul(pjj[j], ui[k]), Arithmetic.mul(pij, uj[k]));
            }
            g = igcd(ui);
            if ( Arithmetic.gt(g, Arithmetic.I) )
                for(k=0; k<kl; k++) ui[k] = Arithmetic.div(ui[k], g);
            pjj[i] = dotp(ui, ui, Arithmetic);
        }
    }
    return u;
}
function indexOf( item, set )
{
    var i, l = set.length, eq;
    if ( !l ) return -1;
    eq = is_instance(item, INumber) ? function(it, si){return it.equ(si);} : function(it, si){return it===si;};
    for(i=0; i<l; i++)
        if ( eq(item, set[i]) )
            return i;
    return -1;
}
function spoly( f, g )
{
    var PolynomialClass = f[CLASS],
        flt = f.ltm(), glt = g.ltm(), num = PolynomialClass.Term.lcm(flt, glt);

    return f.mul(PolynomialClass([num.div(flt)], f.symbol)).sub(g.mul(PolynomialClass([num.div(glt)], g.symbol)));
}
function buchberger_groebner( Basis )
{
    // https://en.wikipedia.org/wiki/Gr%C3%B6bner_basis
    // https://en.wikipedia.org/wiki/Buchberger%27s_algorithm
    /*
    Return the unique reduced Groebner basis for (multivariate) polynomial set Basis.

    Uses Buchberger's algorithm to build a Groebner basis, then minimizes
    and reduces the basis. This is not a high-performance implementation.
    (adapted from https://github.com/tim-becker/pyalgebra)
    */
    var Arithmetic = Abacus.Arithmetic, PolynomialClass = MultiPolynomial,
        pairs, pair, extraBasis, newBasis, s, f, g, i, n, found, others, lt, lts;

    Basis = Basis.map(function(b){return b.monic();});
    if ( 1 < Basis.length )
    {
        PolynomialClass = Basis[0][CLASS];

        // Build a Groebner basis using Buchberger's algorithm.
        pairs = Combination(Basis.length, 2).mapTo(function(i){return [Basis[i[0]], Basis[i[1]]];});
        while( true )
        {
            newBasis = [];
            while( pairs.hasNext() )
            {
                pair = pairs.next();
                f = pair[0]; g = pair[1];
                s = spoly(f, g).multimod(Basis);
                if ( !s.equ(Arithmetic.O) )
                {
                    s = s.monic();
                    if ( (-1 === indexOf(s, newBasis)) && (-1 === indexOf(s, Basis)) )
                        newBasis.push(s);
                }
            }
            pairs.dispose(true);

            // We've stabilized.
            if ( !newBasis.length ) break;

            extraBasis = newBasis;
            pairs = 1 === extraBasis.length ? Tensor(Basis.length, extraBasis.length).mapTo(function(i){return [Basis[i[0]], extraBasis[i[1]]];}) : CombinatorialIterator([
                Tensor(Basis.length, extraBasis.length).mapTo(function(i){return [Basis[i[0]], extraBasis[i[1]]];}),
                Combination(extraBasis.length, 2).mapTo(function(i){return [extraBasis[i[0]], extraBasis[i[1]]];})
            ]);
            Basis = Basis.concat(extraBasis);
        }

        // Minimize it.
        lts = Basis.map(function(g){return g.ltm(true);});
        while( lts.length )
        {
            found = false;
            for(i=0,n=lts.length; i<n; i++)
            {
                lt = lts[i];
                others = lts.slice(0, i).concat(lts.slice(i+1));
                if ( others.length && lt.multimod(others).equ(Arithmetic.O) )
                {
                    lts = others;
                    Basis.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if ( !found ) break;
        }

        // Reduce it.
        for(i=0,n=Basis.length; i<n; i++)
        {
            g = Basis[i];
            others = Basis.slice(0,i).concat(Basis.slice(i+1));
            if ( others.length ) Basis[i] = g.multimod(others);
        }

        // Sort it.
        Basis = Basis.sort(function(a, b){
            return PolynomialClass.Term.cmp(b.ltm(), a.ltm(), true);
        });
    }
    return Basis;
}
function solvedioph2( a, b, param )
{
    // solve general linear diophantine equation in 2 variables
    // a1 x_1 + a2 x_2 = b
    // https://en.wikipedia.org/wiki/Diophantine_equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, d, x0, xp;

    // assume all coefficients are already non-zero, does not handle this case, handled in general solution below
    d = gcd(a);

    // no solution
    if ( !Arithmetic.equ(O, Arithmetic.mod(b, d)) ) return null;

    // infinite solutions parametrized by 1 free parameter
    if ( !Arithmetic.equ(I, d) )
    {
        a = [Arithmetic.div(a[0], d), Arithmetic.div(a[1], d)];
        b = Arithmetic.div(b, d);
    }

    if ( Arithmetic.equ(b, O) )
    {
        // homogeneous
        xp = [O, O];
    }
    else
    {
        // non-homogeneous
        xp = xgcd(a);
        xp = [Arithmetic.mul(b, xp[1]), Arithmetic.mul(b, xp[2])];
    }
    // fix sign to be always positive for 1st variable
    if ( Arithmetic.gt(O, a[1]) ) { a[0] = Arithmetic.neg(a[0]); a[1] = Arithmetic.neg(a[1]); }
    x0 = [a[1], Arithmetic.neg(a[0])];

    return [
    // general solution = any particular solution of non-homogeneous + general solution of homogeneous
    Expr(xp[0], MulTerm(SymbolTerm(param), x0[0])),
    Expr(xp[1], MulTerm(SymbolTerm(param), x0[1]))
    ];
}
function solvedioph( a, b, with_param, with_free_vars )
{
    // solve general linear diophantine equation in k variables
    // a1 x_1 + a2 x_2 + a3 x_3 + .. + ak x_k = b
    // where a is k-array of (integer) coefficients: [a1, a2, a3, .. , ak]
    // and b is (integer) right hand side factor (default 0)
    // https://en.wikipedia.org/wiki/Diophantine_equation
    // https://arxiv.org/ftp/math/papers/0010/0010134.pdf
    // solution adapted from sympy/solvers/diophantine.py
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        ok = a.length, k = ok, d, p, index, i, j, m, n, l, symbols, pnew,
        pos = [], ab, sol2, tot_x, tot_y, solutions, parameters, free_vars,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if ( !ok ) return null;

    // filter out zero coefficients and mark positions of non-zero coeffs to restore later
    a = a.filter(function(ai, i){
        var NZ = !Arithmetic.equ(O, ai);
        if ( NZ ) pos.push(i);
        return NZ;
    });
    k = a.length;
    free_vars = [];

    if ( 0 === k )
    {
        // degenerate case where all coefficients are 0, either infinite or no solutions depending on value of b
        index = 0;
        solutions = Arithmetic.equ(O, b) ? array(ok, function(i){
            var param = symbol+'_'+(++index);
            free_vars.push(param);
            return Expr(MulTerm(SymbolTerm(param)));
        }) /* infinite */ : null /* none */;
    }

    else if ( 1 === k )
    {
        // equation of 1 variable has infinite (if other zero variables) or only 1 (if only 1 variable) or 0 solutions
        index = 0;
        solutions = Arithmetic.equ(O, Arithmetic.mod(b, a[0])) ? array(ok, function(i){
            var param;
            if ( (1 < ok) && i!==pos[0] )
            {
                param = symbol+'_'+(++index);
                free_vars.push(param);
            }
            return i===pos[0] ? Expr(Arithmetic.div(b, a[0])) : Expr(MulTerm(SymbolTerm(param)));
        }) /* one/infinite */: null /* none */
    }

    else if ( 2 === k )
    {
        // equation with only 2 (non-zero) variables
        sol2 = solvedioph2(a, b, symbol+'_1');
        p = 0; index = 0;
        if ( sol2 ) free_vars.push(symbol+'_1');
        solutions = null == sol2 ? null : array(ok, function(i){
            var param;
            if ( p < pos.length && i === pos[p] )
            {
                p++;
                return sol2[p-1];
            }
            else
            {
                param = symbol+'_'+(pos.length+(index++));
                free_vars.push(param);
                return Expr(MulTerm(SymbolTerm(param)));
            }
        });
    }

    else
    {
        /*
        more than 2 variables,
        recursive method based on recursive property of gcd and decomposition of equation (adapted from sympy)

        Consider the following:
        a_0*x_0 + a_1*x_1 + a_2*x_2 = c
        which can be re-written as:
        a_0*x_0 + g_0*y_0 = c
        where
        g_0 = gcd(a_1, a_2)
        and
        y = (a_1*x_1)/g_0 + (a_2*x_2)/g_0
        Consider the trivariate linear equation:
        4*x_0 + 6*x_1 + 3*x_2 = 2
        This can be re-written as:
        4*x_0 + 3*y_0 = 2
        where
        y_0 = 2*x_1 + x_2
        (Note that gcd(3, 6) = 3)
        The complete integral solution to this equation is:
        x_0 =  2 + 3*t_0
        y_0 = -2 - 4*t_0
        where 't_0' is any integer.
        Now that we have a solution for 'x_0', find 'x_1' and 'x_2':
        2*x_1 + x_2 = -2 - 4*t_0
        We can then solve for '-2' and '-4' independently,
        and combine the results:
        2*x_1a + x_2a = -2
        x_1a = 0 + t_0
        x_2a = -2 - 2*t_0
        2*x_1b + x_2b = -4*t_0
        x_1b = 0*t_0 + t_1
        x_2b = -4*t_0 - 2*t_1
        ==>
        x_1 = t_0 + t_1
        x_2 = -2 - 6*t_0 - 2*t_1
        where 't_0' and 't_1' are any integers.
        Note that:
        4*(2 + 3*t_0) + 6*(t_0 + t_1) + 3*(-2 - 6*t_0 - 2*t_1) = 2
        for any integral values of 't_0', 't_1'; as required.
        This method is generalised for many variables, below.
        */
        ab = [gcd(a[k-2], a[k-1])];
        a[k-2] = Arithmetic.div(a[k-2], ab[0]);
        a[k-1] = Arithmetic.div(a[k-1], ab[0]);
        for(i=k-3; i>0; i--)
        {
            d = gcd(ab[0], a[i]);
            ab[0] = Arithmetic.div(ab[0], d);
            a[i] = Arithmetic.div(a[i], d);
            ab.unshift(d);
        }
        ab.push(a[k-1]);

        solutions = [];
        parameters = array(k, function(i){ return symbol+'_'+(i+1); });
        b = Expr(b);
        for(i=0,l=ab.length; i<l; i++)
        {
            tot_x = []; tot_y = [];
            symbols = b.symbols();
            for(j=0,m=symbols.length; j<m; j++)
            {
                n = b.terms[symbols[j]].c().real().num; // expressions/terms use complex numbers by default
                if ( '1' === symbols[j] )
                {
                    // constant term
                    p = '1';
                    pnew = parameters[0];
                }
                else
                {
                    // parameter term
                    p = symbols[j];
                    pnew = parameters[parameters.indexOf(p)+1];
                }

                sol2 = solvedioph2([a[i], ab[i]], n, pnew);
                if ( null == sol2 ) return null; // no solutions

                if ( '1' !== p )
                {
                    // re-express partial solution in terms of original symbol
                    sol2[0] = Expr(MulTerm(SymbolTerm(p), sol2[0].c()), sol2[0].terms[pnew]);
                    sol2[1] = Expr(MulTerm(SymbolTerm(p), sol2[1].c()), sol2[1].terms[pnew]);
                }
                if ( -1 === free_vars.indexOf(pnew) ) free_vars.push(pnew);

                tot_x.push(sol2[0]); tot_y.push(sol2[1]);
            }
            solutions.push(Expr(tot_x));
            b = Expr(tot_y);
        }
        solutions.push(b);

        p = 0; index = 0;
        solutions = array(ok, function(i){
            var param;
            if ( p < pos.length && i === pos[p] )
            {
                p++;
                return solutions[p-1];
            }
            else
            {
                param = symbol+'_'+(pos.length+(index++));
                free_vars.push(param);
                return Expr(MulTerm(SymbolTerm(param)));
            }
        });
    }

    solutions = null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c().real().num; // expressions/terms use complex numbers by default
    }) : solutions);
    free_vars.symbol = symbol;
    return null==solutions ? null : (true===with_free_vars ? [solutions, free_vars] : solutions);
}
function solvediophs( a, b, with_param, with_free_vars )
{
    // solve general system of m linear diophantine equations in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k = b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k = b2,..
    // where a is m x k-matrix of (integer) coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // https://arxiv.org/ftp/math/papers/0010/0010134.pdf
    // https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf
    var ring = Ring.Z(), O = ring.Zero(), I = ring.One(),
        m, k, solutions = null, symbol = is_string(with_param) && with_param.length ? with_param : 'i',
        tmp, ref, pivots, rank, Rt, Tt, i, j, t, p, free_vars;

    if ( !is_instance(a, Matrix) ) a = Matrix(ring, a);
    else if ( !is_class(a.ring.NumberClass, Integer) ) a = Matrix(ring, a);
    m = a.nr; if ( !m ) return null;
    k = a.nc; if ( !k ) return null;
    if ( is_instance(b, Matrix) ) b = b.col(0);
    b = ring.cast(b);
    // concat with zeroes
    if ( m > b.length ) b = b.concat(array(m-b.length, function(i){return O;}));
    // A*X = B <=> iref(A.t|I) = R|T <=> iif R.t*P = B has int solutions P => X = T.t*P
    tmp = a.t().concat(Matrix.I(ring, k)).ref(true, [k, m]);
    ref = tmp[0]; pivots = tmp[1]; rank = pivots.length;
    Tt = ref.slice(0,m,-1,-1).t(); Rt = ref.slice(0,0,k-1,m-1).t();
    p = new Array(k); free_vars = new Array(k-rank);

    // R.t*P can be easily solved by substitution
    for(i=0; i<k; i++)
    {
        if ( i >= rank )
        {
            free_vars[i-rank] = symbol+'_'+(i-rank+1);
            p[i] = Expr(MulTerm(SymbolTerm(free_vars[i-rank]), I)); // free variable
        }
        else
        {
            for(t=O,j=0; j<i; j++) t = t.add(Rt.val[i][j].mul(p[j].c().real().num)); // expressions/terms use complex numbers by default
            p[i] = b[i].sub(t);
            if ( Rt.val[i][i].equ(O) )
            {
                if ( p[i].equ(O) ) p[i] = Expr(MulTerm(SymbolTerm(symbol+'_'+(i+1)), I)); // free variable
                else return null; // no integer solution
            }
            else if ( Rt.val[i][i].divides(p[i]) )
            {
                p[i] = Expr(p[i].div(Rt.val[i][i]));
            }
            else
            {
                // no integer solution
                return null;
            }
        }
    }
    // X = T.t*P
    solutions = array(k, function(i){
        return Expr(array(k, function(j){
            return p[j].mul(Tt.val[i][j]);
        }));
    });

    // if over-determined system (m > k)
    // check if additional rows are satisfied by solution as well
    for(i=k; i<m; i++)
        if ( !Expr(solutions.map(function(xj){return xj.mul(a.val[i][j]);})).equ(b[i]) )
            return null; // no solution

    solutions = null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c().real().num; // expressions/terms use complex numbers by default
    }) : solutions);
    free_vars.symbol = symbol;
    return null==solutions ? null : (true===with_free_vars ? [solutions, free_vars] : solutions);
}
function solvecongr( a, b, m, with_param, with_free_vars )
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution, free_vars;
    if ( !a.length ) return null;
    with_free_vars = (true===with_free_vars);
    solution = solvedioph(a.concat(m), b, with_param, with_free_vars);
    if ( solution && with_free_vars )
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null==solution ? null : array(solution.length-1, function(i){
        // make positive constant terms modulo m
        var x = solution[i];
        if ( false === with_param )
        {
            // a particular solution (as number)
            if ( Arithmetic.gt(O, x) )
                x = Arithmetic.add(x, m);
        }
        else
        {
            // general solution (as expression)
            if ( x.c().real().lt(O) ) // expressions/terms use complex numbers by default
                x = x.add(m);
        }
        return x;
    });

    return null==solution ? null : (with_free_vars ? [solution, free_vars] : solution);
}
function solvecongrs( a, b, m, with_param, with_free_vars )
{
    // solve linear congruence using the associated linear diophantine equation
    var ring = Ring.Z(), Arithmetic = Abacus.Arithmetic, O = ring.Zero(), solution, M, MM, mc, free_vars;
    if ( !is_instance(a, Matrix) ) a = Matrix(ring, a);
    else if ( !is_class(a.ring.NumberClass, Integer) ) a = Matrix(ring, a);
    if ( !a.nr || !a.nc ) return null;
    if ( !is_array(m) && !is_args(m) && !is_instance(m, Matrix) )
    {
        //m = cast(m);
        m = array(a.nr, function(i){return m;});
    }
    if ( is_array(m) || is_args(m) ) m = Matrix(ring, m);
    if ( is_array(b) || is_args(b) ) b = Matrix(ring, b);
    // convert to equivalent system of congruences but with single modulus = LCM(m[1..n])
    // http://www.math.harvard.edu/~knill/preprints/linear.pdf
    mc = m.col(0); M = ring.lcm(mc);
    a = a.concat(m);
    with_free_vars = (true===with_free_vars);
    solution = solvediophs(a, b, with_param, true);
    if ( null != solution )
    {
        free_vars = solution[1];
        // skip last variable
        //free_vars.pop();
        solution = solution[0];
    }
    // skip last variable
    solution = null==solution ? null : array(solution.length-1, function(i){
        // make positive constant terms modulo LCM(m)
        var x = solution[i], add_M = true, t, param;
        if ( false === with_param )
        {
            // a particular solution (as number)
            if ( Arithmetic.gt(Arithmetic.O, x) )
                x = Arithmetic.add(x, M.num);
        }
        else
        {
            // general solution (as expression)
            // expressions/terms use complex numbers by default
            for(t in x.terms)
            {
                if ( !HAS.call(x.terms, t) || ('1' === t) ) continue;
                if ( Arithmetic.equ(Arithmetic.O, Arithmetic.mod(M.num, x.terms[t].c().real().num)) )
                {
                    add_M = false;
                    break;
                }
            }
            if ( add_M )
            {
                param = free_vars.symbol+'_'+(free_vars.length+1);
                free_vars.push(param);
                x = x.add(MulTerm(SymbolTerm(param), M))
            }
            if ( x.c().real().lt(O) )
                x = x.add(M);
        }
        return x;
    });

    return null==solution ? null : (with_free_vars ? [solution, free_vars] : solution);
}
function solvelinears( a, b, x )
{
    // solve general arbitrary system of m linear equations in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k = b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k = b2,..
    // where a is m x k-matrix of coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // can also produce least-squares solution to given system
    // https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse#Applications
    var apinv, bp, ns;

    if ( !is_instance(a, Matrix) ) a = Matrix(Ring.Q(), a);
    else if ( !a.ring.isField() ) a = Matrix(a.ring.associatedField(), a);
    if ( !a.nr || !a.nc ) return null;
    b = Matrix(a.ring, b);
    apinv = a.ginv(); bp = apinv.mul(b);
    if ( true===x ) return bp.col(0); // least squares solution
    else if ( !a.mul(bp).equ(b) ) return null; // no solutions exist
    if ( false===x )
    {
        // particular solution
        return bp.col(0);
    }
    else
    {
        // general solution(s)
        ns = Matrix.I(a.ring, bp.nr).sub(apinv.mul(a));
        if ( is_string(x) ) x = array(ns.nc, function(i){return x+'_'+(i+1);});
        else if ( is_array(x) && ns.nc>x.length ) x = x.concat(array(ns.nc-x.length, function(i){return x[x.length-1].split('_')[0]+'_'+(x.length+i+1);}));
        return array(bp.nr, function(i){
            return Expr(array(ns.nc, function(j){
                return MulTerm(SymbolTerm(x[j]), ns.val[i][j]);
            })).add(bp.val[i][0]);
        });
    }
}
function solvelineqs( a, b, x )
{
    // solve general arbitrary system of m linear inequalities in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k <= b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k <= b2,..
    // where a is m x k-matrix of coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // https://en.wikipedia.org/wiki/Fourier%E2%80%93Motzkin_elimination
    var rel0, rel, sol, k, m, i, j, l, p, n, z, pi, ni;

    if ( !is_instance(a, Matrix) ) a = Matrix(Ring.Q(), a);
    if ( !a.nr || !a.nc || a.ring !== Ring.Q() ) return null;
    b = Matrix(a.ring, b).col(0);
    k = a.nc; m = a.nr;

    if ( !x ) x = 'x';
    if ( is_string(x) ) x = array(k, function(i){return x+'_'+(i+1);});
    else if ( is_array(x) && k>x.length ) x = x.concat(array(k-x.length, function(i){return x[x.length-1].split('_')[0]+'_'+(x.length+i+1);}));

    rel0 = array(m, function(j){
        return RelOp.LTE(Expr(a.row(j).map(function(v, i){return MulTerm(SymbolTerm(x[i]), v);})), Expr(b[j]));
    });

    sol = [];
    rel = rel0.slice();
    for(i=k-1; i>=0; i--)
    {
        p = []; n = [], z = [];
        rel.forEach(function(s){
            var f = s.lhs.term(x[i]).c().sub(s.rhs.term(x[i]).c()),
                e = s.rhs.sub(s.rhs.term(x[i])).sub(s.lhs.sub(s.lhs.term(x[i])));
            if ( f.gt(0) ) p.push(e.div(f));
            else if ( f.lt(0) ) n.push(e.div(f));
            else z.push(e);
        });
        if ( !p.length || !n.length )
        {
            l = z.length;
            rel = new Array(l);
            for(j=0; j<l; j++)
            {
                if ( z[j].isConst() && z[j].lt(0) ) return null; // no solution
                rel[j] = RelOp.LTE(Expr(), z[j]);
            }
            if ( p.length || n.length )
            {
                sol.unshift(p.length ? [RelOp.LTE(Expr(SymbolTerm(x[i])), Func.MIN(p))] : (n.length ? [RelOp.LTE(Func.MAX(n), Expr(SymbolTerm(x[i])))] : []));
            }
        }
        else
        {
            l = p.length*n.length+z.length;
            rel = new Array(l);
            for(j=0; j<l; j++)
            {
                if ( j < z.length )
                {
                    if ( z[j].isConst() && z[j].lt(0) ) return null; // no solution
                    rel[j] = RelOp.LTE(Expr(), z[j]);
                }
                /*else if ( !p.length )
                {
                    rel[j] = RelOp.LTE(n[j-z.length], Expr(SymbolTerm(x[i])));
                }
                else if ( !n.length )
                {
                    rel[j] = RelOp.LTE(Expr(SymbolTerm(x[i])), p[j-z.length]);
                }*/
                else
                {
                    pi = stdMath.floor((j-z.length)/n.length);
                    ni = (j-z.length) % n.length;
                    if ( p[pi].isConst() && n[ni].isConst() && p[pi].lt(n[ni]) ) return null; // no solution
                    rel[j] = RelOp.LTE(n[ni], p[pi]);
                }
            }
            sol.unshift([
                RelOp.LTE(Func.MAX(n), Expr(SymbolTerm(x[i]))),
                RelOp.LTE(Expr(SymbolTerm(x[i])), Func.MIN(p))
            ]);
        }
    }
    return sol;
}
function sign( x )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    if ( is_instance(x, INumber) ) return x.equ(O) ? 0 : (x.lt(O) ? -1 : 1);
    else return Arithmetic.equ(O, x) ? 0 : (Arithmetic.gt(O, x) ? -1 : 1);
}
function solvepythag( a, with_param )
{
    // solve pythagorean diophantine equation in k variables
    // a1^2 x_1^2 + a2^2 x_2^2 + a3&2 x_3^2 + .. + a{k-1}^2 x_{k-1}^2 - ak^2x_k = 0
    // where a is k-array of (integer) coefficients: [a1^2, a2^2, a3^2, .. , ak^2]
    // eg. to generate pythagorean triples solve for [1,1,-1] ==> x^2 + y^2 - z^2 = 0
    // solution adapted from sympy/solvers/diophantine.py
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        k = a.length, index, solutions, sol, param, i, ith, L, ilcm, s, pos, neg, //z,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if ( !k ) return null;

    // NOTE: assume all coefficients are perfect squares and non-zero
    pos = a.filter(function(ai){return 1 === sign(ai);}).length;
    neg = a.filter(function(ai){return -1 === sign(ai);}).length;
    //z = k-pos-neg;

    if ( (1===k) || (0===pos) || (0===neg) )
        // trivial solution: sum of (same sign) integer squares to be zero, all terms have to be zero
        return array(k, function(){return Expr(); /* zero */});

    s = array(k, function(i){return isqrt(Arithmetic.abs(a[i]));});

    if ( k !== a.filter(function(ai,i){return Arithmetic.equ(Arithmetic.abs(ai), Arithmetic.mul(s[i], s[i]));}).length )
        // no general solution in integers, coefficients are not perfect squares, return trivial solution
        return array(k, function(){return Expr(); /* zero */});

    param = array(k-1, function(i){return symbol+'_'+(i+1);});

    if ( 2 === k )
        // different sign, parametrised solution:
        // a1^2 x1^2 = a2^2 x2^2 ==> x1 = a2*i_1, x2 = a1*i_1
        return [
            Expr(MulTerm(SymbolTerm(param[0]), s[1])),
            Expr(MulTerm(SymbolTerm(param[0]), s[0]))
        ];

    // k >= 3
    if ( 0 > sign(a[0])+sign(a[1])+sign(a[2]) )
        a = a.map(function(ai){return Arithmetic.neg(ai); });

    index = 0;
    for (i=0; i<k; i++)
        if ( -1 === sign(a[i]) )
            index = i; // find last negative coefficient, to be solved with respect to that

    ith = Expr(array(param.length, function(i){return MulTerm(param[i]+'^2');}));
    L = [
        Expr([ith, MulTerm(param[k-2]+'^2', Arithmetic.mul(J, two))])
    ].concat(array(k-2, function(i){
        return Expr(MulTerm(param[i]+'*'+param[k-2], two));
    }));
    solutions = L.slice(0, index).concat(ith).concat(L.slice(index));

    ilcm = I;
    for(i=0; i<k; i++)
    {
        if ( i === index || (index > 0 && i === 0) || (index === 0 && i === 1) )
            ilcm = lcm(ilcm, s[i]);
        else
            ilcm = lcm(ilcm, Arithmetic.equ(O, Arithmetic.mod(s[i], two)) ? Arithmetic.div(s[i], two) : s[i]);
    }
    for(i=0; i<k; i++)
    {
        sol = solutions[i];
        solutions[i] = solutions[i].mul(Arithmetic.div(ilcm, s[i]));
        // has a remainder, since it is always a multiple of 2, add 1 only
        if ( !Arithmetic.equ(O, Arithmetic.mod(ilcm, s[i])) )
            solutions[i] = solutions[i].add(sol.div(two));
    }
    return solutions;
}
function pow2( n )
{
    if ( is_instance(n, Integer) )
        return new n[CLASS](pow2(n.num));
    else if ( is_instance(n, Rational) )
        return new n[CLASS](pow2(n.num), pow2(n.den));
    var Arithmetic = Abacus.Arithmetic;
    return Arithmetic.shl(Arithmetic.I, Arithmetic.num(n));
}
function exp( n, k )
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    k = is_instance(k, Integer) ? k.num : N(k);
    if ( is_instance(n, Integer) )
        return new n[CLASS](exp(n.num, k));
    else if ( is_instance(n, Rational) )
        return new n[CLASS](exp(n.num, k), exp(n.den, k));
    return Arithmetic.pow(N(n), k);
}
/*function prime_factorial( n )
{
    // compute factorial by its prime factorization
    // eg https://janmr.com/blog/2010/10/prime-factors-of-factorial-numbers/
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        fac = Arithmetic.I, e, p, pp, d, i, l, primes_up_to_n = PrimeSieve();

    // compute exponents for each prime of the prime factorisation of n!
    p = primes_up_to_n.next();
    while( null!=p && Arithmetic.lte(p, n) )
    {
        e = O; pp = p; d = Arithmetic.div(n, pp);
        while( !Arithmetic.equ(O, d) )
        {
            e = Arithmetic.add(e, d);
            pp = Arithmetic.mul(pp, p);
            d = Arithmetic.div(n, pp);
        }
        if ( !Arithmetic.equ(O, e) )
            fac = Arithmetic.mul(fac, Arithmetic.pow(p, e));

        // get next prime up to n
        p = primes_up_to_n.next();
    }
    primes_up_to_n.dispose();

    return fac;
}*/
function split_product( list, start, end )
{
    var Arithmetic = Abacus.Arithmetic;
    if (start > end) return Arithmetic.I;
    if (start === end) return list[start];
    var middle = ((start + end) >>> 1);
    return Arithmetic.mul(split_product(list, start, middle), split_product(list, middle+1, end));
}
function dsc_factorial( n )
{
    // divide-swing-conquer fast factorial computation
    // https://oeis.org/A000142/a000142.pdf
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        I = Arithmetic.I, two = Arithmetic.II, three = Arithmetic.num(3),
        swing, odd_factorial, bits, primes, sieve;

    swing = function swing( m, primes ) {
        var s, d, e, g, factors, prime, p, q, i;
        if ( Arithmetic.lt(m, 4) ) return ([I,I,I,three])[Arithmetic.val(m)];
        s = bisect(primes, Arithmetic.add(I, isqrt(m)), -1, null, null, Arithmetic.lt);
        d = bisect(primes, Arithmetic.add(I, Arithmetic.div(m, three)), -1, null, null, Arithmetic.lt);
        e = bisect(primes, Arithmetic.add(I, Arithmetic.div(m, two)), -1, null, null, Arithmetic.lt);
        g = bisect(primes, Arithmetic.add(I, m), -1, null, null, Arithmetic.lt);
        factors = primes.slice(e, g).concat(primes.slice(s, d).filter(function(p){return Arithmetic.equ(I, Arithmetic.mod(Arithmetic.div(m, p), two));}));
        for (i=1; i<s; i++)
        {
            prime = primes[i]; // prime in primes[1:s]
            p = I; q = m;
            while (true)
            {
                q = Arithmetic.div(q, prime);
                if ( Arithmetic.equ(O, q) ) break;
                if ( !Arithmetic.equ(O, Arithmetic.mod(q, two)) ) p = Arithmetic.mul(p, prime);
            }
            if ( Arithmetic.gt(p, I) ) factors.push(p);
        }
        return split_product(factors, 0, factors.length-1);
    };

    odd_factorial = function odd_factorial( n, primes ) {
        if ( Arithmetic.lt(n, two) ) return I;
        var f = odd_factorial(Arithmetic.div(n, two), primes);
        return Arithmetic.mul(Arithmetic.mul(f, f), swing(n, primes));
    };

    if ( Arithmetic.lt(n, two) ) return I;
    bits = Arithmetic.sub(n, Arithmetic.digits(n, 2).split('').reduce(function(s, d){return Arithmetic.add(s, '1'===d?I:O);}, O));
    sieve = PrimeSieve();
    primes = sieve.get(function(p){return Arithmetic.lte(p, n);});
    sieve.dispose();
    return Arithmetic.mul(odd_factorial(n, primes), pow2(bits));
}
function factorial( n, m )
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul, mod = Arithmetic.mod,
        key, res = O, i, MAXMEM = Abacus.Options.MAXMEM;

    if ( is_instance(n, Integer) ) return new n[CLASS](factorial(n.num, m));

    n = NUM(n);

    if ( null == m )
    {
        // http://www.luschny.de/math/factorial/index.html
        // https://en.wikipedia.org/wiki/Factorial
        // simple factorial = F(n) = n F(n-1) = n!
        if ( Arithmetic.lte(n, 12) ) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600 /*MAX: 2147483647*/])[VAL(n)]);

        // for large factorials, use the swinging factorial or the prime factorisation of n!
        if ( Arithmetic.gte(n, 100) ) return dsc_factorial(n); //prime_factorial(n);

        key = String(n)/*+'!'*/;
        if ( null == factorial.mem1[key] )
        {
            // iterative
            //res = operate(mul, I, null, 2, n);
            // recursive and memoized
            // simple factorial = F(n) = n F(n-1) = n!
            res = mul(factorial(sub(n, I)), n);
            //res = fproduct(n, 1);
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                factorial.mem1[key] = res;
        }
        else
        {
            res = factorial.mem1[key];
        }
    }
    else if ( false === m )
    {
        // http://mathworld.wolfram.com/Subfactorial.html
        // https://en.wikipedia.org/wiki/Derangement
        // https://en.wikipedia.org/wiki/Rencontres_numbers
        // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
        // for given number of fixed points k > 0: D(n,k) = C(n,k) D(n-k)
        if ( Arithmetic.lte(n, 12) ) return Arithmetic.lt(n, two) ? O : NUM(([1,2,9,44,265,1854,14833,133496,1334961,14684570,176214841])[VAL(sub(n, two))]);
        key = '!'+String(n);
        if ( null == factorial.mem2[key] )
        {
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            /*factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);*/
            // recursive and memoized
            // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
            res = add(Arithmetic.equ(O, mod(n, two)) ? I : J, mul(factorial(sub(n, I), false), n));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                factorial.mem2[key] = res;
        }
        else
        {
            res = factorial.mem2[key];
        }
    }
    else if ( true === m )
    {
        // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
        if ( Arithmetic.lte(n, 18) ) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,4,10,26,76,232,764,2620,9496,35696,140152,568504,2390480,10349536,46206736,211799312,997313824])[VAL(n)]);
        key = 'I'+String(n);
        if ( null == factorial.mem2[key] )
        {
            // recursive and memoized
            // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
            res = add(factorial(sub(n, I), true), mul(factorial(sub(n, two), true), sub(n, I)));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                factorial.mem2[key] = res;
        }
        else
        {
            res = factorial.mem2[key];
        }
    }
    else if ( is_array(m) )
    {
        // https://en.wikipedia.org/wiki/Multinomial_theorem
        // multinomial = n!/m1!..mk!
        if ( !m.length ) return Arithmetic.lt(n, O) ? O : factorial(n);
        else if ( Arithmetic.lt(n, O) ) return O;
        key = String(n)+'@'+mergesort(m.map(String),1,true).join(',');
        if ( null == factorial.mem3[key] )
        {
            res = div(factorial(n), operate(function(N,mk){
                return mul(N, factorial(mk));
            }, factorial(m[m.length-1]), m, m.length-2, 0));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                factorial.mem3[key] = res;
        }
        else
        {
            res = factorial.mem3[key];
        }
    }
    else if ( Arithmetic.isNumber(m) || is_instance(m, Integer) )
    {
        m = is_instance(m, Integer) ? m.num : NUM(m);

        if ( Arithmetic.lt(m, O) )
        {
            // selections, ie m!C(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if ( Arithmetic.lte(n, Arithmetic.neg(m)) ) return Arithmetic.equ(n, Arithmetic.neg(m)) ? factorial(n) : O;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
            {
                i = add(add(n, m), I); res = i;
                while( Arithmetic.lt(i, n) )
                {
                    i = add(i, I);
                    res = mul(res, i);
                }
                // memoize only up to MAXMEM results
                if ( Arithmetic.lt(n, MAXMEM) )
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
        else
        {
            // https://en.wikipedia.org/wiki/Binomial_coefficient
            // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
            if ( Arithmetic.lt(m, O) || Arithmetic.lt(n, I) || Arithmetic.gt(m, n) ) return O;
            if ( Arithmetic.lt(n, mul(m, two))  ) m = sub(n, m); // take advantage of symmetry
            if ( Arithmetic.equ(m, O) || Arithmetic.equ(n, I) ) return I;
            else if ( Arithmetic.equ(m, I) ) return n;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
            {
                // recursive and memoized
                // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
                if ( Arithmetic.lte(n, 10) )
                {
                    res = add(factorial(sub(n, I), sub(m, I)), factorial(sub(n, I), m));/*div(factorial(n,-m), factorial(m))*/
                }
                else if ( Arithmetic.isDefault() )
                {
                    res = stdMath.round(operate(function(Cnm,i){
                        // this is faster and will not overflow unnecesarily for default arithmetic
                        return Cnm*(1+n/i);
                    }, (n=n-m)+1, null, 2, m));
                }
                else
                {
                    i = add(sub(n, m), I); res = i;
                    while( Arithmetic.lt(i, n) ) { i = add(i, I); res = mul(res, i); }
                    res = div(res, factorial(m));
                }
                // memoize only up to MAXMEM results
                if ( Arithmetic.lt(n, MAXMEM) )
                    factorial.mem3[key] = res;
            }
            else
            {
                res = factorial.mem3[key];
            }
        }
    }
    return res;
}
factorial.mem1 = Obj();
factorial.mem2 = Obj();
factorial.mem3 = Obj();
function stirling( n, k, s )
{
    // https://en.wikipedia.org/wiki/Stirling_number
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_first_kind
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_second_kind
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;

    if ( is_instance(n, Integer) ) return new n[CLASS](stirling(n.num, is_instance(k, Integer) ? k.num : k, s));

    if ( is_instance(k, Integer) ) k = k.num;

    n = Arithmetic.num(n); k = Arithmetic.num(k); s = +s;

    if ( Arithmetic.lt(n, O) || Arithmetic.lt(k, O) ) return O;
    if ( 2 === s )
    {
        // second kind: S{n,k} = k S{n-1,k} + S{n-1,k-1}
        if ( Arithmetic.equ(n, k) || (Arithmetic.equ(k, I) && Arithmetic.lt(n, O)) ) return I;
        else if ( Arithmetic.equ(n, O) || Arithmetic.equ(k, O) ) return O;
        key = String(n)+','+String(k);
        if ( null == stirling.mem2[key] )
        {
            res = add(stirling(sub(n, I), sub(k, I), 2), mul(stirling(sub(n, I), k, 2), k));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                stirling.mem2[key] = res;
        }
        else
        {
            res = stirling.mem2[key];
        }
    }
    else if ( -1 === s )
    {
        // signed first kind: S[n,k] = -(n-1) S[n-1,k] + S[n-1,k-1]
        if ( Arithmetic.gt(k, n) || (Arithmetic.equ(k, O) && Arithmetic.lt(n, O)) ) return O;
        else if ( Arithmetic.equ(n, k) ) return I;
        key = String(n)+','+String(k)+'-';
        if ( null == stirling.mem1[key] )
        {
            res = add(stirling(sub(n, I), sub(k, I), -1), mul(stirling(sub(n, I), k, -1), sub(I, n)));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(n, MAXMEM) )
                stirling.mem1[key] = res;
        }
        else
        {
            res = stirling.mem1[key];
        }
    }
    else //if ( 1 === s )
    {
        // unsigned first kind: S[n,k] = (n-1) S[n-1,k] + S[n-1,k-1]
        if ( Arithmetic.gt(k, n) || (Arithmetic.equ(k, O) && Arithmetic.lt(n, O)) ) return O;
        else if ( Arithmetic.equ(n, k) ) return I;
        else if ( Arithmetic.equ(k, I) ) return factorial(sub(n, I));
        /*key = '+'+String(n)+','+String(k);
        if ( null == stirling.mem1[key] )
            stirling.mem1[key] = add(stirling(n-1,k-1,1), mul(stirling(n-1,k,1),n-1));
        return stirling.mem1[key];*/
        res = Arithmetic.equ(O, Arithmetic.mod(sub(n, k), Arithmetic.II)) ? stirling(n, k, -1) : Arithmetic.neg(stirling(n, k, -1));
    }
    return res;
}
stirling.mem1 = Obj();
stirling.mem2 = Obj();
function p_nkab( n, k, a, b )
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // CLOSED FORM FORMULA FOR THE NUMBER OF RESTRICTED COMPOSITIONS (http://www.fmf.uni-lj.si/~jaklicg/papers/compositions_revision.pdf)
    // compute number of integer partitions of n
    // into exactly k parts having summands between a and b (inclusive)
    // a + k-1 <= n <= k*b
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        p = O, key, key2, j0, j1;

    if ( Arithmetic.lt(n, O) || Arithmetic.lte(k, O) || Arithmetic.gt(a, b) || Arithmetic.gt(add(a, k), add(n, I)) || Arithmetic.lt(mul(k, b), n) ) return p;
    if ( (Arithmetic.equ(b, n) && Arithmetic.equ(k, I)) || (Arithmetic.equ(k, n) && Arithmetic.equ(b, I)) ) return I;
    //if ( a === b ) return k*a === n ? Arithmetic.I : p;
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == p_nkab.mem[key] )
    {
        // compute it directly
        //p_nkab(n-k*(a-1), k, 1, b-a+1);
        n = sub(n, mul(k, sub(a, I))); b = add(sub(b, a), I);
        key2 = String(n)+','+String(k)+','+String(a)+','+String(b);
        if ( null == p_nkab.mem[key2] )
        {
            j0 = Arithmetic.max(I, Arithmetic.divceil(sub(n, b), sub(k, I)));
            j1 = Arithmetic.min(b, add(sub(sub(n, b), k), two));
            while( Arithmetic.lte(j0, j1) )
            {
                p = add(p, p_nkab(sub(n, b), sub(k, I), I, j0));
                j0 = add(j0, I);
            }
            p_nkab.mem[key2] = p;
        }
        p_nkab.mem[key] = p_nkab.mem[key2];
    }
    return p_nkab.mem[key];
}
p_nkab.mem = Obj();
function partitions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    if ( is_instance(n, Integer) ) return new n[CLASS](partitions(n.num, K, M));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        m0, m1, k0, k1, p = O, k, m, key;

    if ( is_instance(K, Integer) ) K = K.num;
    if ( is_instance(M, Integer) ) M = M.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    n = N(n);
    m0 = null!=M /*&& !Arithmetic.equ(M, O)*/ ? M : O;
    m1 = null!=M /*&& !Arithmetic.equ(M, O)*/ ? M : I;
    k0 = null!=K /*&& !Arithmetic.equ(K, O)*/ ? K : I;
    k1 = null!=K /*&& !Arithmetic.equ(K, O)*/ ? K : n;

    if ( Arithmetic.lt(n, O) || (null!=K && null!=M && (Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n))) || (null!=M && Arithmetic.gt(M, n)) || (null!=K && Arithmetic.gt(K, n)) ) return p;
    if ( null!=M && null==K ) { m0 = O; m1 = I; k0 = M; k1 = M; K = M; M = null; } // count the conjugates, same
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == partitions.mem[key] )
    {
        k = k0;
        while( Arithmetic.lte(k, k1) )
        {
            m0 = Arithmetic.equ(O, m0) ? add(sub(n, k), I) : m0;
            m = m1;
            while( Arithmetic.lte(m, m0) )
            {
                p = add(p, p_nkab(n, k, I, m));
                m = add(m, I);
            }
            k = add(k, I);
        }
        partitions.mem[key] = p;
    }
    return partitions.mem[key];
}
partitions.mem = Obj();
function c_nkab( n, k, a, b )
{
    // recursively compute the composition count using the recursive relation:
    // CLOSED FORM FORMULA FOR THE NUMBER OF RESTRICTED COMPOSITIONS (http://www.fmf.uni-lj.si/~jaklicg/papers/compositions_revision.pdf)
    // compute number of integer compositions of n
    // into exactly k parts having summands between a and b (inclusive)
    var Arithmetic = Abacus.Arithmetic,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        O = Arithmetic.O, I = Arithmetic.I, c = O, m, m1, key;
    if ( Arithmetic.lt(n, O) || Arithmetic.lte(k, O) || Arithmetic.gt(a, b) || Arithmetic.gt(mul(a, k), n) || Arithmetic.lt(mul(k, b), n) ) return c;
    if ( Arithmetic.equ(k, I) ) return Arithmetic.lte(a, n) && Arithmetic.lte(n, b) ? I : c;
    if ( Arithmetic.equ(n, k) ) return Arithmetic.lte(a, I) && Arithmetic.lte(I, b) ? I : c;
    if ( Arithmetic.equ(a, b) ) return Arithmetic.equ(mul(k, a), n) ? I : c;
    if ( Arithmetic.equ(n, b) ) return factorial(add(sub(n, mul(k, a)), sub(k, I)), sub(k, I));
    if ( Arithmetic.equ(add(a, I), b) ) return factorial(k, sub(n, mul(k, a)));
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == c_nkab.mem[key] )
    {
        // compute it directly
        m1 = sub(n, a);
        m = Arithmetic.max(O, sub(n, b));
        k = sub(k, I);
        while( Arithmetic.lte(m, m1) )
        {
            c = add(c, c_nkab(m, k, a, b));
            m = add(m, I);
        }
        c_nkab.mem[key] = c;
    }
    return c_nkab.mem[key];
}
c_nkab.mem = Obj();
function compositions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    if ( is_instance(n, Integer) ) return new n[CLASS](compositions(n.num, K, M));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, sub = Arithmetic.sub,
        mul = Arithmetic.mul, div = Arithmetic.div, mod = Arithmetic.mod,
        c = O, j, k, m, kk, nm, key;

    if ( is_instance(K, Integer) ) K = K.num;
    if ( is_instance(M, Integer) ) M = M.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    n = N(n);

    if ( Arithmetic.lt(n, O) || (null!=K && null!=M && (Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n))) || (null!=M && Arithmetic.gt(M, n)) || (null!=K && Arithmetic.gt(K, n)) ) return c;
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == compositions.mem[key] )
    {
        if ( null!=K && null!=M )
        {
            if ( Arithmetic.equ(mul(K, M), n) )
            {
                c = I;
            }
            else
            {
                j = I; nm = M; m = sub(M, I);
                while( Arithmetic.lte(nm, n) )
                {
                    kk = c_nkab(sub(n, nm), sub(K, j), I, m);
                    if ( !Arithmetic.equ(O, kk) ) c = add(c, mul(kk, factorial(K, j)));
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else if ( null!=K )
        {
            c = c_nkab(n, K, I, n);
        }
        else if ( null!=M )
        {
            if ( Arithmetic.equ(M, n) )
            {
                c = I;
            }
            else
            {

                if ( Arithmetic.equ(O, mod(n, M)) ) c = I;
                j = I; nm = M; m = sub(M, I);
                while( Arithmetic.lte(nm, n) )
                {
                    k = I; K = sub(n, j);
                    while( Arithmetic.lte(k, K) )
                    {
                        kk = c_nkab(sub(n, nm), k, I, m);
                        if ( !Arithmetic.equ(O, kk) ) c = add(c, mul(kk, factorial(add(k, j), j)));
                        k = add(k, I);
                    }
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else
        {
            c = Arithmetic.gte(n, I) ? pow2(sub(n, I)) : I;
        }
        compositions.mem[key] = c;
    }
    return compositions.mem[key];
}
compositions.mem = Obj();
function catalan( n )
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;

    // https://en.wikipedia.org/wiki/Catalan_number
    // https://rosettacode.org/wiki/Catalan_numbers
    // https://anonymouscoders.wordpress.com/2015/07/20/its-all-about-catalan/
    // catalan numbers C(n) = (4n+2)C(n-1)/(n+1)
    if ( is_instance(n, Integer) ) return new n[CLASS](catalan(n.num));

    n = NUM(n);
    if ( Arithmetic.lte(n, 17) ) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,5,14,42,132,429,1430,4862,16796,58786,208012,742900,2674440,9694845,35357670,129644790])[VAL(n)]);
    key = String(n);
    if ( null == catalan.mem[key] )
    {
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(n, MAXMEM) )
        {
            /*res = operate(function(c,i){return add(c,mul(catalan(i),catalan(n-1-i)));},O,null,0,n-1,1);*/
            res = div(mul(catalan(sub(n, I)), sub(mul(n, 4), two)), add(n, I));/* n -> n-1 */
            catalan.mem[key] = res;
        }
        else
        {
            res = div(factorial(mul(n, two), n), add(n, I)) /*operate(function(c, k){
                return div(mul(c, k+n), k);
            }, I, null, 2, n)*/;
        }
    }
    else
    {
        res = catalan.mem[key];
    }
    return res;
}
catalan.mem = Obj();
function bell( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        NUM = Arithmetic.num, VAL = Arithmetic.val,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        key, res = O, i, MAXMEM = Abacus.Options.MAXMEM;
    // https://en.wikipedia.org/wiki/Bell_number
    // https://en.wikipedia.org/wiki/Bell_triangle
    // http://fredrikj.net/blog/2015/08/computing-bell-numbers/
    // bell numbers B(n) = SUM[k:0->n-1] ( C(n-1,k) B(k) )
    if ( is_instance(n, Integer) ) return new n[CLASS](bell(n.num));

    n = NUM(n);
    if ( Arithmetic.lte(n, 14) ) return Arithmetic.lt(n, O) ? O : NUM(([1,1,2,5,15,52,203,877,4140,21147,115975,678570,4213597,27644437,190899322])[VAL(n)]);
    key = String(n);
    if ( null == bell.mem[key] )
    {
        res = O; i = O; n = sub(n, I);
        while( Arithmetic.lte(i, n) )
        {
            res = add(res, mul(factorial(n, i), bell(i)));
            i = add(i, I);
        }
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(n, MAXMEM) )
            bell.mem[key] = res;
    }
    else
    {
        res = bell.mem[key];
    }
    return res;
}
bell.mem = Obj();
function fibonacci( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, VAL = Arithmetic.val, k, f1, f0,
        key, res = O, MAXMEM = Abacus.Options.MAXMEM;
    // http://en.wikipedia.org/wiki/Fibonacci_number
    // fibonacci numbers F(n) = F(n-1) + F(n-2)
    if ( is_instance(n, Integer) ) return new n[CLASS](fibonacci(n.num));

    n = NUM(n);
    if ( Arithmetic.lte(n, 36) ) return Arithmetic.lt(n, O) ? O : NUM(([0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946,17711,28657,46368,75025,121393,196418,317811,514229,832040,1346269,2178309,3524578,5702887,9227465,14930352])[VAL(n)]);
    key = String(n);
    if ( null == fibonacci.mem[key] )
    {
        // recursive and memoized
        // fibonacci numbers F(n) = F(n-1) + F(n-2)
        //f1 = fibonacci(n-1); f0 = fibonacci(n-2);
        //res = Arithmetic.add(f1,f0);

        // https://www.nayuki.io/page/fast-fibonacci-algorithms
        // recursive and memoized and fast doubling
        // fibonacci numbers F(2k) = F(k)(2F(k+1)-F(k)), F(2k+1) = F(k+1)^2 + F(k)^2
        k = Arithmetic.div(n, two);
        f1 = fibonacci(Arithmetic.add(k, I)); f0 = fibonacci(k);
        if ( Arithmetic.equ(O, Arithmetic.mod(n, two)) ) // 2k
            res = Arithmetic.mul(f0, Arithmetic.sub(Arithmetic.mul(f1, Arithmetic.II), f0));
        else // 2k+1
            res = Arithmetic.add(Arithmetic.mul(f1, f1), Arithmetic.mul(f0, f0));
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(n, MAXMEM) )
            fibonacci.mem[key] = res;
    }
    else
    {
        res = fibonacci.mem[key];
    }
    return res;
}
fibonacci.mem = Obj();
function polygonal( n, k )
{
    // https://en.wikipedia.org/wiki/Figurate_number
    // https://en.wikipedia.org/wiki/Polygonal_number
    // https://en.wikipedia.org/wiki/Triangular_number
    // https://en.wikipedia.org/wiki/Square_number
    // https://en.wikipedia.org/wiki/Pentagonal_number
    // https://en.wikipedia.org/wiki/Hexagonal_number
    // https://en.wikipedia.org/wiki/Heptagonal_number
    // https://en.wikipedia.org/wiki/Octagonal_number
    // https://en.wikipedia.org/wiki/Nonagonal_number
    // https://en.wikipedia.org/wiki/Decagonal_number
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        NUM = Arithmetic.num, number;
    if ( is_instance(k, Integer) ) k = k.num;
    k = NUM(k); if ( Arithmetic.lt(k, 3) ) return null;
    if ( is_instance(n, Integer) ) return new n[CLASS](polygonal(n.num, k));
    n = NUM(n);
    number = Arithmetic.div(Arithmetic.mul(n, Arithmetic.sub(Arithmetic.mul(n, Arithmetic.sub(k, two)), Arithmetic.sub(k, 4))), two);
    return number;
}
// combinatorial utilities, available as static methods of respective objects
function kronecker( /* var args here */ )
{
    var args = arguments, nv = args.length, k, a, r, l, i, j,
        vv, tensor, tl, kl, product;

    if ( !nv ) return [];

    if ( true === args[0] )
    {
        // flat tensor product
        for(kl=args[1].length,k=2; k<nv; k++) kl *= args[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = 0;
            for(j=1,r=k,a=1; a<nv; a++)
            {
                l = args[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[ a ][ i ];
                tensor += j*vv;
                j *= l;
            }
            product[ k ] = tensor;
        }
    }
    else
    {
        // component tensor product
        for(kl=args[0].length,k=1; k<nv; k++) kl *= args[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = new Array(nv); tl = 0;
            for(r=k,a=nv-1; a>=0; a--)
            {
                l = args[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = args[ a ][ i ];
                if ( is_array(vv) || is_args(vv) )
                {
                    // kronecker can be re-used to create higher-order products
                    // i.e kronecker(alpha, beta, gamma) and kronecker(kronecker(alpha, beta), gamma)
                    // should produce exactly same results
                    for(j=vv.length-1; j>=0; j--) tensor[nv-(++tl)] = vv[ j ];
                }
                else
                {
                    tensor[nv-(++tl)] = vv;
                }
            }
            product[ k ] = tensor;
        }
    }
    return product;
}
function cartesian( /* var args here */ )
{
    // direct sum product, since the final dimensions = sum of component dimensions it is like cartesian product
    // whereas tensor product has final dimensions = product of component dimensions
    var v = arguments, nv = v.length, n=0, k, j;
    for(j=0; j<nv; j++) n += v[j].length;
    k = 0; j = 0;
    return array(n, function(i){
        if ( i >= k+v[j].length ) k+=v[j++].length;
        return k+v[j][i-k];
    });
}
function conditional_combinatorial_tensor( v, value_conditions, extra_conditions )
{
    var k, kl, a, r, l, i, vv, nv = v.length, v0, v1,
        tensor, t0, t1, ok, nvalid, product, p, pv, pe, pea, pl, npv,
        seen = null, valid = null, invalid, expr, e, el;

    if ( !nv ) return [];

    if ( is_callable(extra_conditions) )
    {
        valid = extra_conditions;
        extra_conditions = true;
    }
    else
    {
        extra_conditions = false;
    }

    if ( !(V_EQU===value_conditions || V_DIFF===value_conditions || V_INC===value_conditions || V_DEC===value_conditions || V_NONINC===value_conditions || V_NONDEC===value_conditions) )
    {
        value_conditions = false;
    }

    pe = new Array(nv); pea = []; pl = 0; pv = [];
    for(kl=1,k=0; k<nv; k++)
    {
        if ( is_callable(v[k][0]) )
        {
            // fixed expression for position k, store it to be added after actual values are added
            if ( !v[k][1].length )
            {
                // autonomous expression, which does not depend on any position
                pea.push([v[k][0],k]);
            }
            else
            {
                // depends on one or multiple other positions
                // expr v[k][0] for pos k, depends on value at positions v[k][1][]
                for(e=0,el=v[k][1].length; e<el; e++)
                {
                    if ( null == pe[v[k][1][e]] ) pe[v[k][1][e]] = [[v[k][0],k,v[k][1]]];
                    else pe[v[k][1][e]].push([v[k][0],k,v[k][1]]);
                }
            }
            // this makes the computation faster, since fixed/expression values
            // are not counted as extra and then checked if valid, but generated directly validly
        }
        else
        {
            // values for position k, count them
            pv.push(k);
            kl *= v[k].length;
            if ( !kl || 0>=kl ) return [];
        }
    }
    if ( !pv.length ) return [];

    product = new Array(kl); nvalid = 0;
    t1 = nv-1; npv = pv.length-1;
    // O(kl), count only necessary values, minus any outliers (as few as possible)
    for(k=0; k<kl; k++)
    {
        // O(nv)
        tensor = new Array(nv); invalid = false;
        // explicit tensor values, not expressions
        for(r=k,a=npv; a>=0; a--)
        {
            p = pv[a];
            l = v[p].length;
            i = r % l;
            r = ~~(r / l);
            tensor[p] = v[p][i];
        }
        // evaluate expressions which are autonomous, do not depend on any position
        for(a=0,pl=pea.length; a<pl; a++)
        {
            expr = pea[a];
            tensor[expr[1]] = expr[0]();
        }
        // evaluate expressions now after any explicit tensor values were calculated previously
        for(a=0; a<nv; a++)
        {
            // if expression and not already avaluated (eg by previous expression)
            if ( null != pe[a] )
            {
                // fill-up any pos values which are expressions based on this pos value
                expr = pe[a];
                for(e=0,el=expr.length; e<el; e++)
                {
                    p = expr[e][1];
                    if ( null == tensor[p] )
                    {
                        // not computed already
                        ok = true;
                        vv = expr[e][2].map(function(k){
                            if ( (null == tensor[k]) || isNaN(tensor[k]) ) ok = false; // not computed already, abort
                            return tensor[k];
                        });
                        if ( ok ) tensor[p] = expr[e][0].apply(null, vv);
                    }
                }
            }
        }
        if ( value_conditions || extra_conditions )
        {
            if ( (null == tensor[t1]) || isNaN(tensor[t1]) || extra_conditions && !valid(tensor,t1,t1) )
            {
                invalid = true;
            }
            else
            {
                v1 = tensor[t1];
                if ( V_DIFF === value_conditions ) { seen = {}; seen[v1] = 1; }
                for(t0=t1-1; t0>=0; t0--)
                {
                    v0 = tensor[t0];
                    if (
                        (null == v0) || isNaN(v0) ||
                        (V_EQU === value_conditions && v1 !== v0) ||
                        (V_DIFF === value_conditions && 1 === seen[v0]) ||
                        (V_INC === value_conditions && v0 >= v1) ||
                        (V_DEC === value_conditions && v0 <= v1) ||
                        (V_NONINC === value_conditions && v0 < v1) ||
                        (V_NONDEC === value_conditions && v0 > v1) ||
                        (extra_conditions && !valid(tensor,t0,t1))
                    )
                    {
                        invalid = true;
                        break;
                    }
                    if ( V_DIFF === value_conditions ) seen[v0] = 1;
                    v1 = v0;
                }
            }
        }
        if ( invalid ) continue;
        product[ nvalid++ ] = tensor;
    }
    // truncate if needed
    if ( product.length > nvalid ) product.length = nvalid;
    return product;
}
function gen_combinatorial_data( n, data, pos, value_conditions, options )
{
    options = options || {};
    pos = pos || array(data.length||0, 0, 1);
    // conditions: ALGEBRAIC(STRING EXPR) AND/OR BOOLEAN(POSITIVE / NEGATIVE) => [values] per position
    // NOTE: needs at least one non-autonomous expression or one range of values, else will return empty set
    var min = null==options.min ? 0 : options.min,
        max = null==options.max ? n-1 : options.max,
        nn = max-min+1, D = data, m, d, i, a, j, pi, l = D.length, none = false,
        pos_ref, is_valid, p1, p2, expr, algebraic = [], missing = [], ref = {},
        in_range = function in_range(x){ return min<=x && x<=max; }, additional_conditions;

    data = []; none = false;
    for(pi=0,i=0; i<l; i++,pi++)
    {
        d = D[i];
        if ( is_string(d) )
        {
            if ( m=d.match(not_in_set_re) )
            {
                if ( 0 < m[1].indexOf('..') )
                {
                    m = m[1].split('..').map(Number);
                    if ( m[0]>m[1] )
                        a = complement(n,array(m[0]-m[1]+1,m[1],1).filter(in_range)).reverse();
                    else
                        a = complement(n,array(m[1]-m[0]+1,m[0],1).filter(in_range));
                }
                else
                {
                    a = complement(n,m[1].split(',').map(Number).filter(in_range));
                }
                if ( !a.length ) { none = true; break; }
                data.push(a);
            }
            else if ( m=d.match(in_set_re) )
            {
                if ( 0 < m[1].indexOf('..') )
                {
                    m = m[1].split('..').map(Number);
                    a = (m[0]>m[1]?array(m[0]-m[1]+1,m[0],-1):array(m[1]-m[0]+1,m[0],1)).filter(in_range);
                }
                else
                {
                    a = m[1].split(',').map(Number).filter(in_range);
                }
                if ( !a.length ) { none = true; break; }
                data.push(a);
            }
            else
            {
                is_valid = true; pos_ref = []; expr = null;
                d = d.replace(pos_re, function(m, d){
                    var posref = parseInt(d, 10), varname = 'v'+String(posref);
                    if ( isNaN(posref) || !in_range(posref) ) is_valid = false;
                    if ( is_valid && (-1 === pos_ref.indexOf(posref)) ) pos_ref.push(posref);
                    return varname;
                });
                if ( !is_valid )
                {
                    if ( pos ) pos.splice(pi--, 1);
                    continue;
                }
                pos_ref.sort(sorter());
                try{
                    expr = new Function(pos_ref.map(function(p){return 'v'+String(p);}).join(','),'return Math.floor('+d+');');
                } catch(e){
                    expr = null;
                }
                if ( !is_callable(expr) )
                {
                    if ( pos ) pos.splice(pi--, 1);
                    continue;
                }
                for(j=0; j<pos_ref.length; j++)
                {
                    if ( !ref[pos_ref[j]] ) ref[pos_ref[j]] = [expr];
                    else ref[pos_ref[j]].push(expr);
                    if ( (-1===pos.indexOf(pos_ref[j])) && (-1===missing.indexOf(pos_ref[j])) ) missing.push(pos_ref[j]);
                }
                algebraic.push([expr,null,null,pos_ref,pos[pi]]);
                data.push(algebraic[algebraic.length-1]);
            }
        }
        else if ( is_array(d) )
        {
            a = false===d[0] ? complement(n,d.slice(1).filter(in_range)) : (true===d[0] ? d.slice(1).filter(in_range) : d.filter(in_range));
            if ( !a.length ) { none = true; break; }
            data.push(a);
        }
    }
    if ( none ) data = [];

    if ( missing.length )
    {
        for(i=0,l=missing.length; i<l; i++)
        {
            // add any missing references
            pos.push(missing[i]);
            if ( !none ) data.push(array(nn,min,1));
        }
    }

    // sort positions ascending if needed and re-arrange data
    // two parameters change here, adjust [pos] array IN-PLACE, while simply return the new computed [data]
    i = is_sorted( pos );
    if ( -1 === i )
    {
        reflection(pos, pos);
        if ( !none ) reflection(data, data);
    }
    else if ( 0 === i )
    {
        d = mergesort(pos, 1, false, true);
        permute(pos, d);
        if ( !none ) permute(data, d);
    }
    if ( none ) return [];
    if ( algebraic.length )
    {
        for(i=0,l=algebraic.length; i<l; i++)
        {
            m = algebraic[i];
            // adjust relative positions in algebraic expressions used in data (same reference)
            m[1] = m[3].map(function(m3){return pos.indexOf(m3);});
            m[2] = pos.indexOf(m[4]);
            for(j=0; j<m[3].length; j++)
            {
                // by the way, filter out some invalid values here for all expr on the same pos ref
                // for expr that depend on single position only, else leave for actual combinatorial generation later on
                expr = ref[m[3][j]];
                if ( !is_callable(data[m[1][j]][0]) /*expression does not reference another expression*/)
                {
                    a = data[m[1][j]].filter(function(x){
                        for(var ex,i=0,l=expr.length; i<l; i++)
                        {
                            // for expr that depend on single position only
                            if ( 1 !== expr[i].length /*num of func args*/ ) continue;
                            ex = expr[i](x);
                            if ( isNaN(ex) || min>ex || ex>max ) return false;
                        }
                        return true;
                    });
                    if ( !a.length ) { none = true; break; }
                    else data[m[1][j]] = a;
                }
            }
            if ( none ) break;
        }
    }
    if ( none ) return [];

    // check value conditions
    if ( '=' === value_conditions ) value_conditions = V_EQU;
    else if ( ('!=' === value_conditions) || ('<>' === value_conditions) ) value_conditions = V_DIFF;
    else if ( '<' === value_conditions ) value_conditions = V_INC;
    else if ( ('<=' === value_conditions) || ('=<' === value_conditions) ) value_conditions = V_NONDEC;
    else if ( '>' === value_conditions ) value_conditions = V_DEC;
    else if ( ('>=' === value_conditions) || ('=>' === value_conditions) ) value_conditions = V_NONINC;
    else value_conditions = false;

    // check additional conditions
    additional_conditions = is_callable(options.extra_conditions) ? function(v,i0,i1){
        var v0 = v[i0];
        if (
            // check in range
            (min>v0 || v0>max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0]>v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0]>v0)
        ) return false
        return options.extra_conditions(v,i0,i1);
    } : function(v,i0,i1){
        var v0 = v[i0];
        if (
            // check in range
            (min>v0 || v0>max) ||
            // when strictly increasing sequence then value at pos i cannot be less than i since it has to accomodate the rest values as well before it, complementary for strictly decreasing sequence (for strictly decreasing sequence we do not know the number of elements that come after unlike for strictly increasing sequence where we can know, but as a workaround we can add last possible position in conditions with all possible values simply as a hint/clue on what is last possible position)
            // (assume values in range 0..n-1 for positions 0..n-1 or reverse)
            (V_INC === value_conditions && pos[i0]>v0) ||
            (V_DEC === value_conditions && pos[pos.length-1]-pos[i0]>v0)
        ) return false
        return true;
    };

    // compute valid combinatorial data satisfying conditions
    return true === options.lazy ? data : conditional_combinatorial_tensor(data, value_conditions, additional_conditions);
}
function summation( a, b, Arithmetic, do_subtraction )
{
    // O(max(n1,n2))
    var i, j, n1 = a.length, n2 = b.length, c;
    if ( true===Arithmetic )
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? b[i].neg() : (i >= n2 ? a[i] : a[i].sub(b[i]));
        } : function(i){
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : a[i].add(b[i]));
        });
    }
    else if ( Arithmetic )
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? Arithmetic.neg(b[i]) : (i >= n2 ? a[i] : Arithmetic.sub(a[i], b[i]));
        } : function(i){
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : Arithmetic.add(a[i], b[i]));
        });
    }
    else
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? -b[i] : (i >= n2 ? a[i] : a[i] - b[i]);
        } : function(i){
            return i >= n1 ? b[i] : (i >= n2 ? a[i] : a[i] + b[i]);
        });
    }
    return c;
}
function convolution( a, b, Arithmetic )
{
    // O(n1*n2), can be done a bit faster
    // 1. by using FFT multiplication, not implemented here
    // 2. by Divide&Conquer and using eg. Strassen multiplication, not implemented here
    var i, j, n1 = a.length, n2 = b.length, c;
    if ( true===Arithmetic )
    {
        c = array(n1+n2-1, function(){return 0;});
        for(i=0; i<n1; i++)
            for(j=0; j<n2; j++)
                c[i+j] = 0 === c[i+j] ? a[i].mul(b[j]) : c[i+j].add(a[i].mul(b[j]));
    }
    else if ( Arithmetic )
    {
        c = array(n1+n2-1, function(){return Arithmetic.O;});
        for(i=0; i<n1; i++)
            for(j=0; j<n2; j++)
                c[i+j] = Arithmetic.add(c[i+j], Arithmetic.mul(a[i], b[j]));
    }
    else
    {
        c = array(n1+n2-1, function(){return 0;});
        for(i=0; i<n1; i++)
            for(j=0; j<n2; j++)
                c[i+j] += a[i] * b[j];
    }
    return c;
}
function addition_sparse( a, b, TermClass, do_subtraction, ring )
{
    // O(n1+n2) ~ O(max(n1,n2))
    // assume a, b are arrays of **non-zero only** coeffs of MulTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    do_subtraction = (true===do_subtraction);
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var i = 0, j = 0, k = 0, n1 = a.length, n2 = b.length, c = new Array(n1+n2), res, O = Abacus.Arithmetic.O;
    while( i<n1 && j<n2 )
    {
        if ( 0<TermClass.cmp(a[i], b[j]) )
        {
            res = a[i].cast(ring);
            if ( !res.equ(O) ) c[k++] = res; // check if zero
            i++;
        }
        else if ( 0<TermClass.cmp(b[j], a[i]) )
        {
            res = (do_subtraction ? b[j].neg() : b[j]).cast(ring);
            if ( !res.equ(O) ) c[k++] = res; // check if zero
            j++;
        }
        else //equal
        {
            res = (do_subtraction ? a[i].sub(b[j]) : a[i].add(b[j])).cast(ring);
            if ( !res.equ(O) ) c[k++] = res; // check if cancelled
            i++; j++;
        }
    }
    while( i<n1 )
    {
        res = a[i].cast(ring);
        if ( !res.equ(O) ) c[k++] = res; // check if zero
        i++;
    }
    while( j<n2 )
    {
        res = (do_subtraction ? b[j].neg() : b[j]).cast(ring);
        if ( !res.equ(O) ) c[k++] = res; // check if zero
        j++;
    }
    if ( c.length > k ) c.length = k; // truncate if needed
    return c;
}
function multiplication_sparse( a, b, TermClass, ring )
{
    // O(log(n1)*n1*n2)
    // assume a, b are arrays of **non-zero only** coeffs of MulTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var k, t, n1, n2, c, f, max, heap, O = Abacus.Arithmetic.O;
    if ( a.length > b.length ){ t=a; a=b; b=t;} // swap to achieve better performance
    n1 = a.length; n2 = b.length; c = new Array(n1*n2);
    if ( 0<n1 && 0<n2 )
    {
        k = 0;
        c[0] = TermClass(0, a[0].mul(b[0]).e, ring);
        heap = Heap(array(n1, function(i){
            return [a[i].cast(ring).mul(b[0].cast(ring)), i];
        }), "max", function(a, b){
            return TermClass.cmp(a[0], b[0]);
        });
        f = array(n1, 0);
        while( max=heap.peek() )
        {
            if ( 0!==TermClass.cmp(c[k], max[0]) )
            {
                if ( !c[k].equ(O) ) c[++k] = TermClass(0, 0, ring);
                c[k].e = max[0].e;
            }
            c[k] = c[k].add(max[0]);
            f[max[1]]++;
            if ( f[max[1]] < n2 ) heap.replace([a[max[1]].cast(ring).mul(b[f[max[1]]].cast(ring)), max[1]]);
            else heap.pop();
        }
        heap.dispose();
        if ( c.length > k+1 ) c.length = k+1; // truncate if needed
    }
    return c;
}
function division_sparse( a, b, TermClass, q_and_r, ring )
{
    // sparse polynomial reduction/long division
    // https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    q_and_r = (true===q_and_r);
    TermClass = TermClass===MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var na = a.length, nb = b.length, O = Abacus.Arithmetic.O,
        heap = Heap([], "max", function(a,b){return TermClass.cmp(a.term, b.term);}),
        q = [], r = [], k = 0, d, res, Q, b0;

    if ( !b.length ) return null;
    b0 = b[0].cast(ring);
    while( (d=heap.peek()) || k<na )
    {
        if ( (null == d) || (k<na && 0>TermClass.cmp(d.term, a[k])) )
        {
            res = a[k].cast(ring);
            k++;
        }
        else if ( k<na && 0===TermClass.cmp(d.term, a[k]) )
        {
            res = a[k].cast(ring).sub(d.term);
            if ( nb>d.n )
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
            k++;

            //if ( res.equ(O) ) continue; // zero coefficient, skip
        }
        else
        {
            res = d.term.neg();
            if ( nb>d.n )
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
        }
        if ( res.equ(O) ) continue; // zero coefficient, skip

        if ( b0.divides(res) )
        {
            Q = res.div(b0);
            q = addition_sparse(q, [Q], TermClass, false, ring);
            if ( nb>1 )
                heap.push({term:Q.mul(b[1].cast(ring)), n:2, Q:Q});
        }
        else if ( q_and_r )
        {
            r = addition_sparse(r, [res], TermClass, false, ring);
        }
    }
    heap.dispose();

    return q_and_r ? [q, r] : q;
}
function complement( n, item, sort/*, dupl*/ )
{
    if ( (null == item) || (!item.length) || (1>=item.length) )
        return 1===item.length ? array(n-1, function(i){return i<item[0] ? i : i+1;}) : array(n, 0, 1);
    if ( true === sort )
    {
        var d = is_sorted(item);
        if ( -1 === d ) item = reflection(new Array(item.length), item);
        else if ( 0 === d ) item = mergesort(item.slice(),1,true);
    }
    return difference(null, n, item/*, 1, null, null, null, null, dupl*/);
}
function subset2binary( item, n )
{
    if ( 0 >= n ) return [];
    var binary = array(n, 0, 0), i, l = item.length;
    for(n=n-1,i=0; i<l; i++) binary[n-item[i]] = 1;
    return binary;
}
function binary2subset( item, n )
{
    n = stdMath.min(n||item.length, item.length);
    var subset = [], i;
    for(n=n-1,i=0; i<=n; i++) if ( 0 < item[i] ) subset.push(n-i);
    return subset;
}
function composition2subset( item, n, dir )
{
    if ( null == item ) return null;
    n = n || item.length;
    return psum(new Array(n), item, 1, -1, -1===dir?n-1:0, -1===dir?0:n-1, 0, n-1);
}
function subset2composition( item, n, dir )
{
    if ( null == item ) return null;
    n = n || item.length;
    return fdiff(new Array(n), item, 1, 1, -1===dir?n-1:0, -1===dir?0:n-1, 0, n-1);
}
function conjugatepartition( is_composition, item, dir )
{
    if ( null == item ) return null;
    var conjugate = null, l = item.length, n;
    dir = -1 === dir ? -1 : 1;
    if ( is_composition )
    {
        // On Conjugates for Set Partitions and Integer Compositions (arxiv.org/abs/math/0508052v3)
        n = operate(addn,0,item);
        if ( 1 >= n )
        {
            conjugate = item.slice();
        }
        else
        {
            // get the associated n-composition of the complement(conjugate) of the associated (n-1)-subset
            conjugate = subset2composition(complement(n-1, composition2subset(item, l-1, dir)));
            // add the remainder
            if ( 0 < (n=n-operate(addn,0,conjugate)) ) conjugate.push(n);
            // if reflected, get the reflected composition
            if ( 0>dir ) reflection(conjugate,conjugate);
        }
    }
    else
    {
        // http://mathworld.wolfram.com/ConjugatePartition.html
        var i, ii, j, jj, p, a = 1, b = 0, d = 0, push = "push";
        if ( 0>dir ) { a = -a; b = l-1-b; push = "unshift"; }
        if ( is_array(item[b]) )
        {
            // multiplicity(packed) representation
            p = item[b]; conjugate = [[p[1], p[0]]]; i = 0;
            for(j=1,jj=a+b; j<l; j++,jj+=a)
            {
                p = item[jj]; ii = 0>dir ? 0 : i;
                if ( p[1] === conjugate[ii][0] )
                {
                    // same part increase multiplicity
                    conjugate[ii][1] += p[0];
                }
                else
                {
                    // swap part with multiplicity
                    conjugate[push]([p[1], p[0]]); i++;
                }
            }
        }
        else
        {
            // standard(unpacked) representation
            n = item[b]; conjugate = array(n, 1, 0);
            if ( 0>dir ) d = n-1-d;
            for(j=1,jj=a+b; j<l; j++,jj+=a)
            {
                i = 0; ii = d; p = item[jj];
                while( (i < n) && (p > 0) ) { conjugate[ii]++; p--; i++; ii+=a; }
            }
        }
    }
    return conjugate;
}
function packpartition( partition, dir )
{
    if ( null == partition ) return null;
    var packed = [], i, j, l = partition.length,
        reflected = -1 === dir,
        a = 1, b = 0, push = "push",
        last, part;

    if ( reflected )
    {
        a = -a;
        b = l-1-b;
        push = "unshift";
    }
    for(last=partition[b],part=[last, 1],i=1; i<l; i++)
    {
        j = a*i+b;
        if ( last === partition[j] )
        {
            part[1]++;
        }
        else
        {
            packed[push](part);
            last = partition[j];
            part = [last, 1];
        }
    }
    packed[push](part);
    return packed;
}
function unpackpartition( packed, dir )
{
    if ( null == packed ) return null;
    var partition = [], i, j, k, v, l = packed.length,
        cmp, reflected = -1 === dir,
        a = 1, b = 0, push = "push";
    if ( reflected )
    {
        a = -a;
        b = l-1-b;
        push = "unshift";
    }
    for(i=0; i<l; i++)
    {
        cmp = packed[a*i+b];
        if ( 1 === cmp[1] )
            partition[push](cmp[0]);
        else
            for(k=cmp[1],v=cmp[0],j=0; j<k; j++)
                partition[push](v);
    }
    return partition;
}
function permutation2matrix( matrix, permutation, transposed )
{
    var i, j, n = permutation.length, n2 = n*n;
    matrix = matrix || new Array(n2);
    for(i=0,j=0; i<n2; )
    {
        matrix[i+j] = 0;
        if ( ++j >= n ) { j=0; i+=n; }
    }
    if ( true === transposed ) for(i=0; i<n; i++) matrix[n*permutation[i]+i] = 1;
    else for(i=0,j=0; j<n; j++,i+=n) matrix[i+permutation[i]] = 1;
    return matrix;
}
function matrix2permutation( permutation, matrix, transposed )
{
    var i, j, n2 = matrix.length, n = stdMath.floor(stdMath.sqrt(n2));
    permutation = permutation || new Array(n);
    if ( true === transposed )
    {
        for(i=0,j=0; i<n; )
        {
            if ( matrix[n*i+j] ) permutation[j] = i;
            if ( ++j >= n ) { j=0; i++; }
        }
    }
    else
    {
        for(i=0,j=0; i<n; )
        {
            if ( matrix[i+j] ) permutation[i] = j;
            if ( ++j >= n ) { j=0; i++; }
        }
    }
    return permutation;
}
function multiset( m, n, dir )
{
    var nm = m ? m.length : 0, dk = 1, k = 0,
        ki = 0, mk = ki < nm ? m[ki]||1 : 1;
    if ( -1 === dir ){ dk = -1; k = (nm||n)-1; }
    return operate(function(p,i){
        if ( 0 >= mk )
        {
            ki++; k+=dk;
            mk = ki<nm ? m[ki]||1 : 1;
        }
        mk--; p[i] = k; return p;
    }, new Array(n), null, 0, n-1);
}
function multiset2permutation( multiset )
{
    // O(nlgn) get associated permutation(unique elements) = invpermutation of indices that sorts the multiset
    // from multiset permutation(repeated elements)
    return permutation2inverse(null, mergesort(multiset,1,false,true/*return indices*/));
}
function permutation2multiset( permutation, multiset )
{
    // O(n) get associated multiset permutation(repeated elements) = choose elements by permutation
    // from permutation(unique elements=indices)
    return multiset && multiset.length ? operate(function(p,pi,i){
        p[i] = pi<multiset.length ? multiset[pi] : pi; return p;
    }, permutation, permutation) : permutation;
}
function permutation2inverse( ipermutation, permutation )
{
    return operate(function(ip,pi,i){
        ip[pi] = i; return ip;
    }, ipermutation||new Array(permutation.length), permutation);
}
function permutation2inversion( inversion, permutation, N )
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = permutation.length, k = stdMath.ceil(log2(N||n)),
        twok = 1 << k, Tl = (1<<(1+k))-1, T = array(Tl, 0, 0);

    return operate(function(inv,ctr,i){
        // Starting bottom-up at the leaf associated with pi
        for(var node=ctr+twok,j=0; j<k; j++)
        {
            // 1) if the current node is the right child of its parent then subtract from the counter the value stored at the left child of the parent
            if ( node&1 ) ctr -= T[(node >>> 1) << 1];
            // 2) increase the value stored at the current node.
            T[node] += 1;
            // 3) move-up the tree
            node >>>= 1;
        }
        T[node] += 1; inv[i] = ctr;
        return inv;
    }, inversion||new Array(n), permutation);
}
function inversion2permutation( permutation, inversion, N )
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = inversion.length, k = stdMath.ceil(log2(N||n)),
        i, i2, j, twok = 1 << k, Tl = (1<<(1+k))-1, T = new Array(Tl);

    for(i=0; i<=k; i++)for(j=1,i2=1<<i; j<=i2; j++) T[i2-1+j] = 1 << (k-i);
    return operate(function(perm,digit,i){
        // Starting top-down the tree
        for(var node=1,j=0; j<k; j++)
        {
            T[node] -= 1;
            node <<= 1;
            // next node as the left or right child whether digit is less than the stored value at the left child
            if ( digit >= T[node] )
            {
                // If the next node is the right child, then the value of the left child is subtracted from digit
                digit -= T[node];
                node++;
            }
        }
        T[node] = 0; perm[i] = node - twok;
        return perm;
    }, permutation||new Array(n), inversion);
}
function cycle2swaps( cycle, swaps, slen )
{
    var c = cycle.length, noref = null == swaps, j;
    if ( c > 1 )
    {
        if ( noref )
        {
            swaps = new Array(c-1);
            slen = 0;
        }
        for(j=c-1; j>=1; j--) swaps[slen++] = [cycle[0],cycle[j]];
    }
    else
    {
        if ( noref ) swaps = [];
    }
    return noref ? swaps : slen;
}
function permutation2cycles( permutation, strict )
{
    var n = permutation.length, i, cycles = new Array(n), current, cycle,
        min_cycle = true === strict ? 1 : 0,
        visited = new Array( n ),
        unvisited = 0, clen, cclen = 0;
    for(i=0; i<n; i++) visited[ i ] = 0;
    cycle = new Array(n); clen = 0;
    current = unvisited++;
    cycle[clen++] = current;
    visited[ current ] = 1;
    while ( unvisited < n )
    {
        current = permutation[ current ];
        if ( visited[current] )
        {
            if ( clen > min_cycle )
            {
                cycle.length = clen; // truncate
                cycles[cclen++] = cycle;
            }
            cycle = new Array(n); clen = 0;
            while ( (unvisited < n) && visited[current=unvisited] ) ++unvisited;
        }
        if ( !visited[current] )
        {
            cycle[clen++] = current;
            visited[ current ] = 1;
        }
    }
    if ( clen > min_cycle )
    {
        cycle.length = clen; // truncate
        cycles[cclen++] = cycle;
    }
    if ( cclen < cycles.length ) cycles.length = cclen; // truncate
    return cycles;
}
function permutation2swaps( permutation )
{
    var n = permutation.length, i, l, j, k,
        swaps = new Array(n), slen = 0,
        cycles = permutation2cycles( permutation, true );
    for(i=0,l=cycles.length; i<l; i++) slen = cycle2swaps( cycles[i], swaps, slen );
    if ( slen < swaps.length ) swaps.length = slen; // truncate
    return swaps;
}
function swaps2permutation( swaps, n )
{
    var i, l = swaps.length, permutation = new Array(n), s, t;
    for(i=0; i<n; i++) permutation[i] = i;
    for(i=0; i<l; i++)
    {
        // swap
        swap = s[i];
        t = permutation[s[0]];
        permutation[s[0]] = permutation[s[1]];
        permutation[s[1]] = t;
    }
    return permutation;
}
function permute( a, p, copy )
{
    var n = a.length, m = p.length;
    if ( true === copy )
    {
        // O(n) time, O(n) space
        return operate((
            n < m
            ? function(ap, i){ ap[i] = p[i]<n ? a[p[i]] : a[i]; return ap; }
            : (n > m
            ? function(ap, i){ ap[i] = i<m ? a[p[i]] : a[i]; return ap; }
            : function(ap, i){ ap[i] = a[p[i]]; return ap; }
        )), new Array(n), null, 0, n-1, 1);
    }
    else
    {
        // O(n) time, O(n) space
        for(var aa=a.slice(),i=0; i<n; i++) a[i] = aa[p[i]];
        return a;
    }
}
function permutationproduct( permutations )
{
    return operate(function(prod, perm){
        return permute(prod, perm, true);
    }, permutations.length?permutations[0].slice():[], permutations, 1, permutations.length-1, 1);
}
function permutationdirectsum( permutations )
{
    var nperms = permutations.length, n=0, k, p, pn;
    for(p=0; p<nperms; p++) n += permutations[p].length;
    k = 0; p = 0; pn = nperms ? permutations[p].length : 0;
    return array(n, function(i){
        if ( i >= k+pn ) { k += pn; pn = permutations[++p].length; }
        return k + permutations[p][i-k];
    });
}
function is_permutation( perm, n )
{
    n = n || perm.length;
    if ( n !== perm.length ) return false;
    var cnt = array(n, 0, 0), i, pi;
    // O(n)
    for(i=0; i<n; i++)
    {
        pi = perm[i];
        if ( (0 > pi) || (pi >= n) || (0 < cnt[pi]) ) return false;
        cnt[pi]++;
    }
    for(i=0; i<n; i++) if ( 1 !== cnt[i] ) return false;
    return true;
}
function is_identity( perm )
{
    // O(n)
    for(var n=perm.length,i=0; i<n; i++) if ( perm[i] !== i ) return false;
    return true;
}
function is_involution( perm )
{
    // O(n)
    for(var n=perm.length,i=0,pi=perm[i]; i<n; i++,pi=perm[i])
        if ( (0 > pi) || (n <= pi) || (perm[pi] !== i) ) return false;
    return true;
}
function is_kthroot( perm, k )
{
    k = k || 1; if ( 1 > k ) return false;
    var i, pi, m, n = perm.length;
    // O(kn) worst case
    for(i=0; i<n; i++)
    {
        pi = perm[i]; m = 1;
        while(m<=k && i!==pi){ m++; pi=perm[pi]; }
        // either the kth composition is identity or mth composition is identity where m is a factor of k
        if ( (i!==pi) || ((m!==k) && (m>=k || (0 < (k%m)))) ) return false
    }
    return true;
}
function is_derangement( perm, kfixed, strict )
{
    // O(n)
    kfixed = kfixed|0;
    for(var nfixed=0,n=perm.length,i=0; i<n; i++)
    {
        if ( perm[i] === i ) if ( (++nfixed) > kfixed ) return false;
    }
    return true === strict ? nfixed === kfixed : true;
}
function is_cyclic/*_shift*/( perm )
{
    // O(n)
    for(var n=perm.length,i=1,i0=perm[0]; i<n; i++)
        if ( perm[i] !== ((i0+i)%n) ) return false;
    return true;
}
function is_connected( perm )
{
    // from: http://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf
    // O(n)
    for (var n=perm.length-1,m=-1,i=0,pi=perm[i]; i<n; i++,pi=perm[i])
    {
        // for all proper prefixes, do:
        if ( pi > m ) m = pi; // update max
        if ( m <= i ) return false; // prefix mapped to itself, not connected (is decomposable)
    }
    return true;
}
function is_kcycle( perm, kcycles, compare, fixed )
{
    // O(n) on average, O(n^2) worst-case
    if ( !perm.length || 0>=kcycles ) return false;
    fixed = false !== fixed;
    var n = perm.length, i, pi, ncycles, cycle, done;
    i = 0; ncycles = 0; done = 0; cycle = new Array(n);
    while(done<n)
    {
        pi = perm[i];
        if ( i===pi || 1===cycle[pi] )
        {
            // close cycle
            if ( fixed || i!==pi ) ncycles++;
            cycle[pi] = 1;
            // start next cycle
            i = 0; while(i<n && 1===cycle[perm[i]]) i++;
        }
        else
        {
            // follow cycle
            cycle[pi] = 1;
            i = pi;
        }
        done++;
    }
    return "<="===compare||"=<"===compare ? ncycles<=kcycles : (">="===compare||"=>"===compare ? ncycles>=kcycles : ncycles===kcycles);
}
function is_magic( square )
{
    if ( !square ) return false;
    var n = square.length, n2 = n*n, i, j, k,
        summa_row = 0, summa_col = 0, summa_d1 = 0, summa_d2 = 0,
        summa = (n*n2+n)>>>1, seen = new Array(n2);
    for (i=0; i<n; i++)
    {
        if ( n !== square[i].length ) return false;
        k = square[i][0];
        if ( !seen[k-1] ) seen[k-1] = [i, 0];
        if ( k < 1 || k > n2 || i !== seen[k-1][0] || 0 !== seen[k-1][1] ) return false;
        summa_row = k;
        k = square[0][i];
        if ( !seen[k-1] ) seen[k-1] = [0, i];
        if ( k < 1 || k > n2 || 0 !== seen[k-1][0] || i !== seen[k-1][1] ) return false;
        summa_col = k;
        summa_d1 += square[i][i];
        summa_d2 += square[i][n-1-i];
        for (j=1; j<n; j++)
        {
            k = square[i][j];
            if ( !seen[k-1] ) seen[k-1] = [i, j];
            if ( k < 1 || k > n2 || i !== seen[k-1][0] || j !== seen[k-1][1] ) return false;
            summa_row += k;
            k = square[j][i];
            if ( !seen[k-1] ) seen[k-1] = [j, i];
            if ( k < 1 || k > n2 || j !== seen[k-1][0] || i !== seen[k-1][1] ) return false;
            summa_col += k;
        }
        if ( (summa_row !== summa) || (summa_col !== summa) ) return false;
    }
    if ( (summa_d1 !== summa) || (summa_d2 !== summa) ) return false;
    return true;
}
function is_latin( square )
{
    if ( !square ) return false;
    var n = square.length, i, j, k, m, seen = new Array(n);
    for (i=0; i<n; i++)
    {
        if ( n !== square[i].length ) return false;
        // rows
        for(k=0; k<n; k++)
        {
            // initialize
            seen[k] = 0;
        }
        for(j=0; j<n; j++)
        {
            m = square[i][j];
            k = square[0].indexOf(m);
            if ( 0 > k || 0 < seen[k] ) return false;
            seen[k] = 1;
        }
        // columns
        for(k=0; k<n; k++)
        {
            // initialize
            seen[k] = 0;
        }
        for(j=0; j<n; j++)
        {
            m = square[j][i];
            k = square[0].indexOf(m);
            if ( 0 > k || 0 < seen[k] ) return false;
            seen[k] = 1;
        }
    }
    return true;
}
function find( a, b, nested )
{
    if ( nested )
    {
        if ( !a || !a.length ) return -1;
        var index, found, i, j, k, n = a.length, m = b.length;
        for(i=0; i<n; i++)
        {
            k = a[i];
            found = true;
            for(j=0; j<m; j++)
            {
                if ( b[j] !== k[j] )
                {
                    found = false;
                    break;
                }
            }
            if ( found ) return i;
        }
        return -1;
    }
    else
    {
        return a && a.length ? a.indexOf(b) : -1;
    }
}
function remove_duplicates( a, KEY )
{
    KEY = is_callable(KEY) ? KEY : String;
    var hash = Obj(), dupl = [], k, i, l;
    for(i=0,l=a.length; i<l; i++)
    {
        k = KEY(a[i]);
        if ( HAS.call(hash, k) ) dupl.push(i);
        else hash[k] = i;
    }
    while(dupl.length) a.splice(dupl.pop(), 1);
    return a;
}
function rndInt( m, M )
{
    return stdMath.round( (M-m)*Abacus.Math.rnd( ) + m );
}

Abacus.Class = Class;

// options
Abacus.Options = {
    MAXMEM: 100000,
    RANDOM: "index"
};

DefaultArithmetic = Abacus.DefaultArithmetic = { // keep default arithmetic as distinct
     // whether using default arithmetic or using external implementation (eg big-int or other)
     isDefault: function( ){
         return true;
     }
    ,isNumber: function( x ) {
        var Arithmetic = this;
        if ( Arithmetic.isDefault() ) return is_number(x);
        return is_number(x) || is_instance(x, Arithmetic.O[CLASS]);
    }

    ,J: -1
    ,O: 0
    ,I: 1
    ,II: 2
    ,INF: {valueOf: function(){return Infinity;}, toString: function(){return "Infinity";}, toTex: function(){return "\\infty";}} // a representation of Infinity
    ,NINF: {valueOf: function(){return -Infinity;}, toString: function(){return "-Infinity";}, toTex: function(){return "-\\infty";}} // a representation of -Infinity

    ,nums: function( a ) {
        var Arithmetic = this;
        if ( is_array(a) || is_args(a) )
        {
            for(var i=0,l=a.length; i<l; i++) a[i] = Arithmetic.nums(a[i]); // recursive
            return a;
        }
        return Arithmetic.num(a);
    }
    ,num: function( a ) {
        return is_number(a) ? stdMath.floor(a) : parseInt(a||0,10);
    }
    ,val: function( a ) {
        return stdMath.floor(a.valueOf());
    }
    ,digits: function( a, base ){
        var s = a.toString(+(base||10)); /* default base 10 */
        if ( '-' === s.charAt(0) ) s = s.slice(1); // dont include the sign in digits
        return s;
    }

    ,neg: function( a ) { return -(+a); }
    ,inv: NotImplemented

    ,equ: function( a, b ) { return a===b; }
    ,gte: function( a, b ) { return a>=b; }
    ,lte: function( a, b ) { return a<=b; }
    ,gt: function( a, b ) { return a>b; }
    ,lt: function( a, b ) { return a<b; }

    ,inside: function( a, m, M, closed ) { return closed ? (a >= m) && (a <= M) : (a > m) && (a < M); }
    ,clamp: function( a, m, M ) { return a < m ? m : (a > M ? M : a); }
    ,wrap: function( a, m, M ) { return a < m ? M : (a > M ? m : a); }
    ,wrapR: function( a, M ) { return a < 0 ? a+M : a; }

    ,add: addn
    ,sub: function( a, b ){ return a-b; }
    ,mul: muln
    ,div: function( a, b ){ return stdMath.floor(a/b); }
    ,divceil: function( a, b ){ return stdMath.ceil(a/b); }
    ,mod: function( a, b ){ return a % b; }
    ,pow: stdMath.pow

    ,shl: function( a, b ){ return a << b; }
    ,shr: function( a, b ){ return a >> b; }
    ,bor: function( a, b ){ return a | b; }
    ,band: function( a, b ){ return a & b; }
    ,xor: function( a, b ){ return a ^ b; }

    ,abs: stdMath.abs
    ,min: stdMath.min
    ,max: stdMath.max
    ,rnd: rndInt
};

// pluggable arithmetics, eg biginteger Arithmetic
Abacus.Arithmetic = Merge({}, DefaultArithmetic, {
    isDefault: function( ){return (0 === this.O) && (this.add === addn);}
    ,neg: function( a ){return Abacus.Arithmetic.mul(Abacus.Arithmetic.J, a);}
    ,abs: function( a ){return Abacus.Arithmetic.gt(Abacus.Arithmetic.O, a) ? Abacus.Arithmetic.neg(a) : a;}
    ,min: function( a, b ){return Abacus.Arithmetic.lt(a, b) ? a : b;}
    ,max: function( a, b ){return Abacus.Arithmetic.gt(a, b) ? a : b;}
    ,divceil: function( a, b ){
        if ( null == b ) return a;
        // https://stackoverflow.com/questions/921180/how-can-i-ensure-that-a-division-of-integers-is-always-rounded-up
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            roundedTowardsZeroQuotient, dividedEvenly, wasRoundedDown;

            roundedTowardsZeroQuotient = Arithmetic.div(a, b);
            dividedEvenly = Arithmetic.equ(O, Arithmetic.mod(a, b));
            if ( dividedEvenly ) return roundedTowardsZeroQuotient;
            wasRoundedDown = (Arithmetic.gt(a, O) === Arithmetic.gt(b, O));
            return wasRoundedDown ? Arithmetic.add(roundedTowardsZeroQuotient, I) : roundedTowardsZeroQuotient;
    }
});

// math / num theory utilities
Abacus.Math = {
     rnd: stdMath.random
    ,rndInt: rndInt

    ,factorial: factorial
    ,stirling: stirling
    ,partitions: partitions
    ,compositions: compositions
    ,bell: bell
    ,catalan: catalan
    ,fibonacci: fibonacci
    ,polygonal: polygonal

    ,sum: sum
    ,product: product
    ,pow2: pow2
    ,exp: exp

    ,powsq: function( b, e ) {
        var Arithmetic = Abacus.Arithmetic;
        e = is_instance(e, Integer) ? e.num : Arithmetic.num(e);
        if ( is_instance(b, Integer) ) return new b[CLASS](powsq(b.num, e));
        return powsq(Arithmetic.num(b), e);
    }
    ,addm: function( a, b, m ) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if ( is_instance(a, Integer) ) return new a[CLASS](addm(a.num, b, m));
        return addm(Arithmetic.num(a), b, m);
    }
    ,negm: function( a, m ) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if ( is_instance(a, Integer) ) return new a[CLASS](negm(a.num, m));
        return negm(Arithmetic.num(a), m);
    }
    ,mulm: function( a, b, m ) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if ( is_instance(a, Integer) ) return new a[CLASS](mulm(a.num, b, m));
        return mulm(Arithmetic.num(a), b, m);
    }
    ,invm: function( a, m ) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        if ( is_instance(a, Integer) ) return new a[CLASS](invm(a.num, m));
        return invm(Arithmetic.num(a), m);
    }
    ,powm: function( a, b, m ) {
        var Arithmetic = Abacus.Arithmetic;
        m = is_instance(m, Integer) ? m.num : Arithmetic.num(m);
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if ( is_instance(a, Integer) ) return new a[CLASS](powm(a.num, b, m));
        return powm(Arithmetic.num(a), b, m);
    }
    ,isqrt: function( a ) {
        var Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Integer) ) return new a[CLASS](isqrt(a.num));
        return isqrt(Arithmetic.num(a));
    }
    ,ikthroot: function( a, k ) {
        var Arithmetic = Abacus.Arithmetic;
        k = is_instance(k, Integer) ? k.num : Arithmetic.num(k);
        if ( is_instance(a, Integer) ) return new a[CLASS](ikthroot(a.num, k));
        return ikthroot(Arithmetic.num(a), k);
    }
    ,isqrtp: function( a, p ) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if ( is_instance(a, Integer) ) return new a[CLASS](isqrtp(a.num, p));
        return isqrtp(Arithmetic.num(a), p);
    }
    ,ilog: function( x, b ) {
        var Arithmetic = Abacus.Arithmetic;
        b = is_instance(b, Integer) ? b.num : Arithmetic.num(b);
        if ( is_instance(x, Integer) ) return new x[CLASS](ilog(x.num, b));
        return ilog(Arithmetic.num(x), b);
    }
    ,divisors: function( n, as_generator ) {
        var Arithmetic = Abacus.Arithmetic;
        return divisors(is_instance(n, Integer) ? n : Arithmetic.num(n), true===as_generator);
    }
    ,legendre: function( a, p ) {
        var Arithmetic = Abacus.Arithmetic;
        p = is_instance(p, Integer) ? p.num : Arithmetic.num(p);
        if ( is_instance(a, Integer) ) return new a[CLASS](legendre_symbol(a.num, p));
        return legendre_symbol(Arithmetic.num(a), p);
    }
    ,jacobi: function( a, n ) {
        var Arithmetic = Abacus.Arithmetic;
        n = is_instance(n, Integer) ? n.num : Arithmetic.num(n);
        if ( is_instance(a, Integer) ) return new a[CLASS](jacobi_symbol(a.num, n));
        return jacobi_symbol(Arithmetic.num(a), n);
    }
    ,moebius: function( n ) {
        var Arithmetic = Abacus.Arithmetic;
        if ( is_instance(n, Integer) ) return new n[CLASS](moebius(n.num));
        return moebius(Arithmetic.num(n));
    }
    ,pollardRho: function( n, s, a, retries, max_steps, F ) {
        var N = Abacus.Arithmetic.num, f;
        if ( null != a ) a = is_instance(a, Integer) ? a.num : N(a);
        if ( null != s ) s = is_instance(s, Integer) ? s.num : N(s);
        if ( is_instance(n, Integer) )
        {
            f = pollard_rho(n.num, s, a, retries, max_steps||null, F||null);
            return null==f ? f : new n[CLASS](f);
        }
        return pollard_rho(N(n), s, a, retries, max_steps||null, F||null);
    }
    ,factorize: function( n ) {
        var Arithmetic = Abacus.Arithmetic;
        return factorize(is_instance(n, Integer) ? n : Arithmetic.num(n));
    }
    ,isProbablePrime: function( n ) {
        var Arithmetic = Abacus.Arithmetic;
        return is_probable_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,isPrime: function( n ) {
        var Arithmetic = Abacus.Arithmetic;
        return is_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n));
    }
    ,nextPrime: function( n, dir ) {
        var Arithmetic = Abacus.Arithmetic;
        return next_prime(is_instance(n, Integer) ? n.num : Arithmetic.num(n), -1===dir?-1:1);
    }

    ,gcd: function( /* args */ ) {
        var Arithmetic = Abacus.Arithmetic, args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments), res, INT = null;
        res = gcd(args.map(function(a){
            if ( is_instance(a, Integer) )
            {
                if ( !INT ) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }
    ,xgcd: function( /* args */ ) {
        var Arithmetic = Abacus.Arithmetic, args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments), res, INT = null;
        res = xgcd(args.map(function(a){
            if ( is_instance(a, Integer) )
            {
                if ( !INT ) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT && res ? res.map(function(g){return new INT(g);}) : res;
    }
    ,lcm: function( /* args */ ) {
        var Arithmetic = Abacus.Arithmetic, args = slice.call(arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments), res, INT = null;
        res = lcm(args.map(function(a){
            if ( is_instance(a, Integer) )
            {
                if ( !INT ) INT = a[CLASS];
                return a.num;
            }
            return Arithmetic.num(a);
        }));
        return INT ? new INT(res) : res;
    }

    ,diophantine: function( a, b, with_param, with_free_vars ) {
        var Arithmetic = Abacus.Arithmetic;
        if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
        return solvedioph(Arithmetic.nums(a), Arithmetic.num(b||0), with_param, true===with_free_vars);
    }
    ,diophantines: function( a, b, with_param, with_free_vars ) {
        var ring = Ring.Z();
        if ( !is_instance(a, Matrix) && !is_array(a) && !is_args(a) ) return null;
        if ( is_instance(a, Matrix) && (!a.nr || !a.nc) ) return null;
        if ( !is_instance(a, Matrix) && !a.length ) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if ( !is_instance(b, Matrix) && !is_array(b) && !is_args(b) ) b = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return b||0;});
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvediophs(a, b, with_param, true===with_free_vars);
    }
    ,congruence: function( a, b, m, with_param, with_free_vars ) {
        var Arithmetic = Abacus.Arithmetic;
        if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
        return solvecongr(Arithmetic.nums(a), Arithmetic.num(b||0), Arithmetic.num(m||0), with_param, true===with_free_vars);
    }
    ,congruences: function( a, b, m, with_param, with_free_vars ) {
        var ring = Ring.Z();
        if ( !is_instance(a, Matrix) && !is_array(a) && !is_args(a) ) return null;
        if ( is_instance(a, Matrix) && (!a.nr || !a.nc) ) return null;
        if ( !is_instance(a, Matrix) && !a.length ) return null;
        a = is_instance(a, Matrix) ? a : ring.cast(a);
        if ( !is_instance(b, Matrix) && !is_array(b) && !is_args(b) ) b = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return b||0;});
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        if ( !is_instance(m, Matrix) && !is_array(m) && !is_args(m) ) m = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return m||0;});
        m = is_instance(m, Matrix) ? m : ring.cast(m);
        return solvecongrs(a, b, m, with_param, true===with_free_vars);
    }
    ,pythagorean: function( a, with_param ) {
        var Arithmetic = Abacus.Arithmetic;
        if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
        return solvepythag(Arithmetic.nums(a), with_param)
    }
    ,linears: function( a, b, with_param ) {
        var ring = Ring.Q();
        if ( !is_instance(a, Matrix) && !is_array(a) && !is_args(a) ) return null;
        if ( is_instance(a, Matrix) && (!a.nr || !a.nc) ) return null;
        if ( !is_instance(a, Matrix) && !a.length ) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if ( !is_instance(b, Matrix) && !is_array(b) && !is_args(b) ) b = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return b||0;});
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelinears( a, b, with_param );
    }
    ,lineqs: function( a, b, param ) {
        var ring = Ring.Q();
        if ( !is_instance(a, Matrix) && !is_array(a) && !is_args(a) ) return null;
        if ( is_instance(a, Matrix) && (!a.nr || !a.nc) ) return null;
        if ( !is_instance(a, Matrix) && !a.length ) return null;
        //a = is_instance(a, Matrix) ? a : a;
        if ( !is_instance(b, Matrix) && !is_array(b) && !is_args(b) ) b = array(is_instance(a, Matrix) ? a.nr : a.length, function(){return b||0;});
        b = is_instance(b, Matrix) ? b : ring.cast(b);
        return solvelineqs( a, b, param );
    }
    ,groebner: buchberger_groebner

    ,dotp: function( a, b ) {
        var Arithmetic = Abacus.Arithmetic;
        return (is_array(a)||is_args(a)) && (is_array(b)||is_args(b)) ? dotp(a, b, Arithmetic) : Arithmetic.O;
    }
    ,orthogonalize: function( v ) {
        return (is_array(v)||is_args(v)) && v.length ? gramschmidt(v) : [];
    }
};

// array/list utilities
Abacus.Util = {
     array: array
    ,operate: operate
    ,unique: unique
    ,intersection: intersection
    ,difference: difference
    ,multi_difference: multi_difference
    ,union: merge
    ,bsearch: binarysearch
    ,bisect: bisect
    ,complementation: complementation
    ,reflection: reflection
    ,reversion: reversion
    ,gray: gray
    ,finitedifference: fdiff
    ,partialsum: psum
    ,convolution: convolution
    ,summation: summation
    ,wheel: wheel
    ,sort: mergesort
    ,shuffle: shuffle
    ,pick: pick
    ,pluck: pluck
    ,is_mirror_image: is_mirror_image
    ,cycle_detection: floyd_cycle_detection
};

// Abacus.BitArray, Packed Bit Array Implementation
Abacus.BitArray = Class({

    constructor: function BitArray( n ) {
        var self = this;
        if ( !is_instance(self, BitArray) ) return new BitArray(n);
        self.length = n;
        self.bits = new Uint32Array(stdMath.ceil(n/32));
    }

    ,length: 0
    ,bits: null

    ,dispose: function( ) {
        var self = this;
        self.length = null;
        self.bits = null;
        return self;
    }

    ,clone: function( ) {
        var self = this, c = new Abacus.BitArray(self.length);
        c.bits = new Uint32Array( self.bits );
        return c;
    }

    ,fromArray: function( b ) {
        var self = this;
        self.bits = new Uint32Array( b );
        return self;
    }

    ,toArray: function( ) {
        return slice.call( this.bits );
    }

    ,toString: function( ) {
        return this.toArray().map(to_fixed_binary_string_32).join('');
    }

    ,reset: function( ) {
        var self = this, bits = self.bits, len = bits.length, i;
        for (i=0; i<len; i++) bits[i] = 0;
        return self;
    }

    ,isset: function( bit ) {
        return !!(this.bits[bit>>>5] & (1<<(bit&31)));
    }

    ,set: function( bit ) {
        var self = this;
        self.bits[bit>>>5] |= 1<<(bit&31);
        return self;
    }

    ,unset: function( bit ) {
        var self = this;
        self.bits[bit>>>5] &= ~(1<<(bit&31));
        return self;
    }

    ,toggle: function( bit ) {
        var self = this;
        self.bits[bit>>>5] ^= 1<<(bit&31);
        return self;
    }
});

// Abacus.Node, Node class which can represent (dynamic) Linked Lists, Binary Trees and similar structures
Node = Abacus.Node = function Node( value, left, right, top ) {
    var self = this;
    if ( !is_instance(self, Node) ) return new Node(value, left, right, top);

    self.v = value;
    self.l = left || null;
    self.r = right || null;
    self.t = top || null;

    self.dispose = function( ) {
        self.v = null;
        self.l = null;
        self.r = null;
        self.t = null;
        return self;
    };
};

// min/max Heap / priority queue class, adapted from python's heapq.py
Heap = Abacus.Heap = Class({
    constructor: function Heap(h, type, cmp) {
        var self = this;
        if ( !is_instance(self, Heap) ) return new Heap(h, type, cmp);
        type = String(type||"min").toLowerCase().slice(0, 3);
        self.type = "max" === type ? "max" : "min";
        if ( !is_callable(cmp) ) cmp = Heap.CMP;
        self.cmp = cmp;
        h = h || [];
        self._h = Heap.heapify(h, self.type, self.cmp);
    }

    ,__static__: {
         CMP: function( a, b ) {
             return a<b ? -1 : (a>b ? 1 : 0);
         }

        ,heapify: function( x, type, cmp ) {
            // Transform list into a heap/maxheap, in-place, in O(len(x)) time.
            var n = x.length, i;
            // Transform bottom-up.  The largest index there's any point to looking at
            // is the largest with a child index in-range, so must have 2*i + 1 < n,
            // or i < (n-1)/2.  If n is even = 2*j, this is (2*j-1)/2 = j-1/2 so
            // j-1 is the largest, which is n//2 - 1.  If n is odd = 2*j+1, this is
            // (2*j+1-1)/2 = j so j-1 is the largest, and that's again n//2-1.
            cmp = cmp || Heap.CMP;
            if ( "max" === type )
            {
                for (i=(n>>>1)-1; i>=0; i--)
                    Heap._siftup_max(x, i, cmp);
            }
            else
            {
                for (i=(n>>>1)-1; i>=0; i--)
                    Heap._siftup(x, i, cmp);
            }
            return x;
        }

        ,_siftdown: function( heap, startpos, pos, cmp ) {
            var newitem = heap[pos], parentpos, parent;
            // Follow the path to the root, moving parents down until finding a place
            // newitem fits.
            while (pos > startpos)
            {
                parentpos = (pos - 1) >>> 1;
                parent = heap[parentpos];
                if ( 0 > cmp(newitem, parent) )
                {
                    heap[pos] = parent;
                    pos = parentpos;
                    continue;
                }
                break;
            }
            heap[pos] = newitem;
        }
        ,_siftup: function( heap, pos, cmp ) {
            var endpos = heap.length, startpos = pos, newitem = heap[pos], childpos, rightpos;
            // Bubble up the smaller child until hitting a leaf.
            childpos = 2*pos + 1;    // leftmost child position
            while (childpos < endpos)
            {
                // Set childpos to index of smaller child.
                rightpos = childpos + 1;
                if ( rightpos<endpos && 0<=cmp(heap[childpos], heap[rightpos]) )
                    childpos = rightpos;
                // Move the smaller child up.
                heap[pos] = heap[childpos];
                pos = childpos;
                childpos = 2*pos + 1;
            }
            // The leaf at pos is empty now.  Put newitem there, and bubble it up
            // to its final resting place (by sifting its parents down).
            heap[pos] = newitem;
            Heap._siftdown(heap, startpos, pos, cmp);
        }
        ,_siftdown_max: function( heap, startpos, pos, cmp ) {
            // Maxheap variant of _siftdown
            var newitem = heap[pos], parentpos, parent;
            // Follow the path to the root, moving parents down until finding a place
            // newitem fits.
            while ( pos > startpos )
            {
                parentpos = (pos - 1) >>> 1;
                parent = heap[parentpos];
                if ( 0>cmp(parent, newitem) )
                {
                    heap[pos] = parent;
                    pos = parentpos;
                    continue;
                }
                break;
            }
            heap[pos] = newitem;
        }
        ,_siftup_max: function( heap, pos, cmp ) {
            // Maxheap variant of _siftup
            var endpos = heap.length, startpos = pos, newitem = heap[pos], childpos, rightpos;
            // Bubble up the larger child until hitting a leaf.
            childpos = 2*pos + 1;    // leftmost child position
            while ( childpos < endpos )
            {
                // Set childpos to index of larger child.
                rightpos = childpos + 1;
                if ( rightpos<endpos && 0<=cmp(heap[rightpos], heap[childpos]) )
                    childpos = rightpos;
                // Move the larger child up.
                heap[pos] = heap[childpos];
                pos = childpos;
                childpos = 2*pos + 1;
            }
            // The leaf at pos is empty now.  Put newitem there, and bubble it up
            // to its final resting place (by sifting its parents down).
            heap[pos] = newitem;
            Heap._siftdown_max(heap, startpos, pos, cmp);
        }
    }

    ,_h: null
    ,type: "min"
    ,cmp: null

    ,dispose: function( ) {
        var self = this;
        self._h = null;
        self.cmp = null;
        return self;
    }
    ,peek: function( ) {
        var heap = this._h;
        return heap.length ? heap[0] : null;
    }
    ,push: function( item ) {
        // Push item onto heap, maintaining the heap invariant.
        var self = this;
        self._h.push(item);
        if ( "max" === self.type )
            Heap._siftdown_max(self._h, 0, self._h.length-1, self.cmp);
        else
            Heap._siftdown(self._h, 0, self._h.length-1, self.cmp);
        return self;
    }
    ,pop: function( ) {
        // Pop the smallest item off the heap, maintaining the heap invariant.
        var self = this, lastelt, returnitem;
        lastelt = self._h.pop();
        if ( self._h.length )
        {
            returnitem = self._h[0];
            self._h[0] = lastelt;
            // Maxheap version of a heappop.
            if ( "max" === self.type )
                Heap._siftup_max(self._h, 0, self.cmp);
            else
                Heap._siftup(self._h, 0, self.cmp);
            return returnitem;
        }
        return lastelt;
    }
    ,replace: function( item ) {
        var self = this, returnitem;
        /* Pop and return the current smallest value, and add the new item.

        This is more efficient than heappop() followed by heappush(), and can be
        more appropriate when using a fixed-size heap.  Note that the value
        returned may be larger than item!  That constrains reasonable uses of
        this routine unless written as part of a conditional replacement:

            if item > heap[0]:
                item = heapreplace(heap, item)
        */
        returnitem = self.peek();
        self._h[0] = item;
        // Maxheap version of a heappop followed by a heappush.
        if ( "max" === self.type )
            Heap._siftup_max(self._h, 0, self.cmp);
        else
            Heap._siftup(self._h, 0, self.cmp);
        return returnitem;
    }
});

function nmax( /* args */ )
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(max, a){
        return a.gt(max) ? a : max;
    }, args[0], 1, args.length-1) : null;
}
function nmin( /* args */ )
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(min, a){
        return a.lt(min) ? a : min;
    }, args[0], 1, args.length-1) : null;
}
function typecast( ClassTypeCheck, toClassType )
{
    var ClassType = null;
    if ( is_array(ClassTypeCheck) && is_callable(ClassTypeCheck[0]) )
    {
        ClassType = ClassTypeCheck[0];
        ClassTypeCheck = function(a){return is_instance(a, ClassType);};
        toClassType = is_callable(toClassType) ? toClassType : function(a){return new ClassType(a);};
    }
    else if ( !is_callable(ClassTypeCheck) )
    {
        ClassTypeCheck = function(a){return true;};
        toClassType = function(a){return a;};
    }
    return function type_cast( a ) {
        if ( is_array(a) || is_args(a) )
        {
            for(var i=0,l=a.length; i<l; i++)
                a[i] = type_cast(a[i]);
        }
        else if ( !ClassTypeCheck(a) )
        {
            a = toClassType(a);
        }
        return a;
    };
}

// Abacus.INumber, represents a generic (numeric/symbolic) number interface
INUMBER = {
    isReal: function( ) {
        return true;
    }
    ,isImag: function( ) {
        return false;
    }
    ,equ: function( a ) {
        return is_instance(a, INumber) ? a.equ(this) : (is_string(a) ? (String(this)===a) : (this === a));
    }
    ,gt: function( a ) {
        if ( is_number(a) ) return (this > a);
        else if ( is_instance(a, INumber) ) return a.lt(this);
        return false;
    }
    ,gte: function( a ) {
        if ( is_number(a) ) return (this >= a);
        else if ( is_instance(a, INumber) ) return a.lte(this);
        return false;
    }
    ,lt: function( a ) {
        if ( is_number(a) ) return (this < a);
        else if ( is_instance(a, INumber) ) return a.gt(this);
        return false;
    }
    ,lte: function( a ) {
        if ( is_number(a) ) return (this <= a);
        else if ( is_instance(a, INumber) ) return a.gte(this);
        return false;
    }
    ,real: function( ) {
        return this;
    }
    ,imag: function( ) {
        return 0;
    }
    ,abs: function( ) {
        return stdMath.abs(this);
    }
    ,neg: function( ) {
        return -this;
    }
    ,conj: function( ) {
        return this;
    }
    ,inv: NotImplemented

    ,add: function( a ) {
        return is_instance(a, INumber) ? a.add(this) : (this + a);
    }
    ,sub: function( a ) {
        return is_instance(a, INumber) ? a.neg().add(this) : (this - a);
    }
    ,mul: function( a ) {
        return is_instance(a, INumber) ? a.mul(this) : (this * a);
    }
    ,div: function( a ) {
        if ( is_instance(a, Numeric) ) return a[CLASS](this).div(a);
        return is_instance(a, INumber) ? null : stdMath.floor(this / a);
    }
    ,mod: function( a ) {
        if ( is_instance(a, Numeric) ) return a[CLASS](this).mod(a);
        return is_instance(a, INumber) ? null : (this % a);
    }
    ,divmod: function( a ) {
        return [this.div(a), this.mod(a)];
    }
    ,divides: function( a ) {
        if ( 0 === this ) return false;
        if ( is_number(a) ) return (0 === (a % this));
        else if ( is_instance(a, Integer) ) return a.mod(this).equ(0);
        else if ( is_instance(a, Numeric) ) return true;
        return false;
    }
    ,pow: function( n ) {
        return stdMath.pow(this, +n);
    }
    ,rad: function( n ) {
        return jskthroot(this, n);
   }
};
INumber = Class(Merge({
    constructor: function INumber( ) { }
    ,dispose: function( ) {
        return this;
    }
    ,clone: function( ) {
        return 0 + this;
    }
    ,valueOf: function( ) {
        return 0;
    }
    ,toString: function( ) {
        return '';
    }
    ,toTex: function( ) {
        return this.toString();
    }
}, INUMBER));

// Numeric is INumber that represents strictly constant numbers, eg Integer, Rational, Complex
Numeric = Class(INumber, {
    constructor: function Numeric( ) { }
    ,clone: function( ) {
        return new this[CLASS](this);
    }
    ,isConst: function( ) {
        return true;
    }
    ,isInt: function( ) {
        return false;
    }
    ,real: function( ) {
        return this;
    }
    ,imag: function( ) {
        return this[CLASS].Zero();
    }
});

// Symbolic is INumber that represents generally non-constant symbolic objects, eg Expr, Polynomial, MultiPolynomial, RationalFunc
Symbolic = Class(INumber, {
    constructor: function Symbolic( ) { }
    ,clone: function( ) {
        return new this[CLASS](this);
    }
    ,isConst: function( ) {
        return false;
    }
    ,isInt: function( ) {
        return false;
    }
    ,c: function( ) {
        return 0;
    }
    ,valueOf: function( ) {
        return this.c().valueOf();
    }

    ,gt: NotImplemented
    ,gte: NotImplemented
    ,lt: NotImplemented
    ,lte: NotImplemented

    ,real: function( ) {
        return this;
    }
    ,imag: function( ) {
        return this[CLASS].Zero();
    }
    ,abs: NotImplemented
    ,neg: NotImplemented
    ,conj: NotImplemented
    ,inv: NotImplemented

    ,add: NotImplemented
    ,sub: NotImplemented
    ,mul: NotImplemented
    ,div: NotImplemented
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,pow: NotImplemented
    ,rad: NotImplemented

    ,d: NotImplemented
    ,evaluate: NotImplemented
});

// Poly is represents a polynomial either univariate or multivariate eg Polynomial, MultiPolynomial
Poly = Class(Symbolic, {
    constructor: function Poly( ) { }
});

// Abacus.Integer, represents an integer
Integer = Abacus.Integer = Class(Numeric, {
    constructor: function Integer( num ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !is_instance(self, Integer) ) return new Integer(num);
        if ( is_instance(num, Symbolic) ) num = num.c();
        if ( is_instance(num, Complex) ) num = num.real();
        if ( is_instance(num, Rational) ) num = num.integer(true);
        if ( is_instance(num, Integer) ) self._isp = num._isp;
        if ( is_instance(num, [Integer, IntegerMod]) ) num = num.num;
        self.num = Arithmetic.num(num||0);
    }

    ,__static__: {
        O: null
        ,I: null
        ,J: null
        ,Zero: function( ) {
            if ( null == Integer.O ) Integer.O = Integer(Abacus.Arithmetic.O);
            return Integer.O;
        }
        ,One: function( ) {
            if ( null == Integer.I ) Integer.I = Integer(Abacus.Arithmetic.I);
            return Integer.I;
        }
        ,MinusOne: function( ) {
            if ( null == Integer.J ) Integer.J = Integer(Abacus.Arithmetic.J);
            return Integer.J;
        }

        ,hasInverse: function( ) {
            return false;
        }
        ,cast: null // added below

        ,gcd: igcd
        ,xgcd: ixgcd
        ,lcm: ilcm
        ,max: nmax
        ,min: nmin
        ,rnd: function( m, M ) {
            var Arithmetic = Abacus.Arithmetic, t;
            m = Integer.cast(m); M = Integer.cast(M);
            if ( M.lt(m) ) { t=m; m=M; M=t; }
            return m.equ(M) ? m : Integer(Arithmetic.rnd(m.num, M.num));
        }

        ,fromString: function( s ) {
            s = trim(String(s));
            if ( !s.length ) return Integer.Zero();
            if ( '+' === s.charAt(0) ) s = trim(s.slice(1));
            if ( (-1 !== s.indexOf('e')) || (-1 !== s.indexOf('.')) ) return Integer(Rational.fromString(s));
            return s.length ? Integer(Abacus.Arithmetic.num(s)) : Integer.Zero();
        }
    }

    ,num: null
    ,_n: null
    ,_isp: null
    ,_str: null

    ,dispose: function( ) {
        var self = this;
        if ( self._n && self===self._n._n )
        {
            self._n._n = null;
        }
        self.num = null;
        self._n = null;
        self._str = null;
        return self;
    }

    ,isInt: function( ) {
        return true;
    }
    ,isPrime: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._isp )
            self._isp = is_probable_prime(Arithmetic.abs(self.num)) && is_prime(Arithmetic.abs(self.num));
        return self._isp;
    }

    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.equ(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.equ(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(self.num, a);
        else if ( is_string(a) )
            return a === self.toString();

        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.gt(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.lt(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.gt(self.num, a);

        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.gte(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.lte(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.gte(self.num, a);

        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.lt(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.gt(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.lt(self.num, a);

        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.lte(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.gte(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.lte(self.num, a);

        return false;
    }

    ,abs: function( ) {
        return Integer(Abacus.Arithmetic.abs(this.num));
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = Integer(Abacus.Arithmetic.neg(self.num));
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Integer(Arithmetic.add(self.num, a.num));
        else if ( is_instance(a, INumber) )
            return a.add(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Integer(Arithmetic.add(self.num, a));

        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Integer(Arithmetic.sub(self.num, a.num));
        else if ( is_instance(a, INumber) )
            return a.neg().add(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Integer(Arithmetic.sub(self.num, a));

        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Integer(Arithmetic.mul(self.num, a.num));
        else if ( is_instance(a, INumber) )
            return a.mul(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Integer(Arithmetic.mul(self.num, a));

        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Integer(Arithmetic.div(self.num, a.num));
        else if ( is_instance(a, Complex) )
            return Complex(self).div(a);
        else if ( is_instance(a, Rational) )
            return Rational(self).div(a);
        else if ( Arithmetic.isNumber(a) )
            return Integer(Arithmetic.div(self.num, a));

        return self;
    }
    ,mod: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Integer, IntegerMod]) )
            return Integer(Arithmetic.mod(self.num, a.num));
        else if ( is_instance(a, Complex) )
            return Complex(self).mod(a);
        else if ( is_instance(a, Rational) )
            return Rational(self).mod(a);
        else if ( Arithmetic.isNumber(a) )
            return Integer(Arithmetic.mod(self.num, a));

        return self;
    }
    ,divmod: function( a ) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,divides: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( Arithmetic.equ(O, self.num) ) return false;
        if ( is_instance(a, Integer) )
            return Arithmetic.equ(O, Arithmetic.mod(a.num, self.num));
        else if ( is_instance(a, INumber) )
            return true;
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(O, Arithmetic.mod(Arithmetic.num(a), self.num));

        return false;
    }
    ,integer: function( raw ) {
        var self = this;
        return true===raw ? self.num : self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.O) ) return null; // not supported
        else if ( n.equ(Arithmetic.I) ) return self;
        return Integer(Arithmetic.pow(self.num, n.num));
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.I) ) return null; // not supported
        else if ( n.equ(Arithmetic.I) ) return self;
        return Integer(ikthroot(self.num, n.num));
    }
    ,valueOf: function( ) {
        return Abacus.Arithmetic.val(this.num);
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
            self._str = String(self.num);
        return self._str;
    }
    ,toDec: function( precision ) {
        var dec = this.toString();
        if ( is_number(precision) && 0<precision ) dec += '.'+(new Array(precision+1).join('0'));
        return dec;
    }
});
Integer.cast = typecast([Integer], function(a){
    return is_string(a) ? Integer.fromString(a) : new Integer(a);
});

// Abacus.IntegerMod, represents an Integer modulo M, for prime M IntegerMod numbers constitute a field
IntegerMod = Abacus.IntegerMod = Class(Numeric, {
    constructor: function IntegerMod( num, m, simplified ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !is_instance(self, IntegerMod) ) return new IntegerMod(num, m, simplified);
        if ( is_instance(num, Symbolic) ) num = num.c();
        if ( is_instance(num, Complex) ) num = num.real();
        if ( is_instance(num, Rational) ) num = num.integer(true);
        if ( is_instance(num, Integer) ) num = num.num;
        if ( is_instance(num, IntegerMod) )
        {
            simplified = null == m ? num._simpl : simplified;
            m = m || num.m;
            num = num.num;
        }
        m = Integer.cast(m); num = Arithmetic.num(num||0);
        if ( m.equ(Arithmetic.O) ) throw new Error('Zero modulus in Abacus.IntegerMod!');
        self.num = num; self.m = m;
        if ( simplified ) self._simpl = true;
        else self.simpl();
    }

    ,__static__: {
        Zero: function( m ) {
            return IntegerMod(Abacus.Arithmetic.O, m, true);
        }
        ,One: function( m ) {
            return IntegerMod(Abacus.Arithmetic.I, m);
        }
        ,MinusOne: function( m ) {
            return IntegerMod(Abacus.Arithmetic.J, m);
        }

        ,hasInverse: function( ) {
            return true;
        }
        ,cast: null // added below

        ,gcd: ngcd
        ,xgcd: nxgcd
        ,lcm: nlcm
        ,max: nmax
        ,min: nmin
        ,rnd: function( m, M, mod ) {
            var Arithmetic = Abacus.Arithmetic, t;
            mod = Integer.cast(mod);
            m = Integer.cast(m); M = Integer.cast(M);
            if ( m.lt(0) ) m = Integer.Zero();
            if ( m.gte(mod) ) m = mod.sub(1);
            if ( M.lt(0) ) M = Integer.Zero();
            if ( M.gte(mod) ) M = mod.sub(1);
            if ( M.lt(m) ) { t=m; m=M; M=t; }
            return m.equ(M) ? IntegerMod(m.num, mod, true) : IntegerMod(Arithmetic.rnd(m.num, M.num), mod, true);
        }

        ,fromString: function( s, m ) {
            s = trim(String(s));
            if ( !s.length ) return IntegerMod.Zero(m);
            if ( '+' === s.charAt(0) ) s = trim(s.slice(1));
            if ( (-1 !== s.indexOf('e')) || (-1 !== s.indexOf('.')) ) return IntegerMod(Rational.fromString(s), m);
            return s.length ? IntegerMod(Abacus.Arithmetic.num(s), m) : IntegerMod.Zero(m);
        }
    }

    ,num: null
    ,m: null
    ,_n: null
    ,_i: null
    ,_str: null
    ,_simpl: false

    ,dispose: function( ) {
        var self = this;
        if ( self._n && self===self._n._n )
        {
            self._n._n = null;
        }
        if ( self._i && self===self._i._i )
        {
            self._i._i = null;
        }
        self.num = null;
        self.m = null;
        self._n = null;
        self._i = null;
        self._str = null;
        return self;
    }

    ,isInt: function( ) {
        return true;
    }

    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return Arithmetic.equ(self.num, self.wrap(a.num));
        else if ( is_instance(a, INumber) )
            return a.equ(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(self.num, self.wrap(Arithmetic.num(a)));
        else if ( is_string(a) )
            return a === self.toString();

        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return Arithmetic.gt(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.lt(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.gt(self.num, a);

        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return Arithmetic.gte(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.lte(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.gte(self.num, a);

        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return Arithmetic.lt(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.gt(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.lt(self.num, a);

        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return Arithmetic.lte(self.num, a.num);
        else if ( is_instance(a, INumber) )
            return a.gte(self.num);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.lte(self.num, a);

        return false;
    }

    ,abs: function( ) {
        return this;
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = IntegerMod(negm(self.num, self.m.num), self.m, true);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function( ) {
        var self = this;
        if ( null == self._i )
        {
            self._i = IntegerMod(invm(self.num, self.m.num), self.m, true);
            self._i._i = self;
        }
        return self._i;
    }

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return IntegerMod(addm(self.num, a.num, self.m.num), self.m, true);
        else if ( is_instance(a, INumber) )
            return a.add(self.num);
        else if ( Arithmetic.isNumber(a) )
            return IntegerMod(addm(self.num, Arithmetic.num(a), self.m.num), self.m, true);

        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) || Arithmetic.isNumber(a) )
            return self.add(IntegerMod(a, self.m).neg());
        else if ( is_instance(a, INumber) )
            return a.neg().add(self.num);

        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return IntegerMod(mulm(self.num, a.num, self.m.num), self.m, true);
        else if ( is_instance(a, INumber) )
            return a.mul(self.num);
        else if ( Arithmetic.isNumber(a) )
            return IntegerMod(mulm(self.num, Arithmetic.num(a), self.m.num), self.m, true);

        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) || Arithmetic.isNumber(a) )
            return self.mul(IntegerMod(a, self.m).inv());
        else if ( is_instance(a, Complex) )
            return Complex(self).div(a);
        else if ( is_instance(a, Rational) )
            return Rational(self).div(a);

        return self;
    }
    ,mod: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [IntegerMod, Integer]) )
            return IntegerMod(Arithmetic.mod(self.num, a.num), self.m);
        else if ( is_instance(a, Complex) )
            return Complex(self).mod(a);
        else if ( is_instance(a, Rational) )
            return Rational(self).mod(a);
        else if ( Arithmetic.isNumber(a) )
            return IntegerMod(Arithmetic.mod(self.num, a), self.m);

        return self;
    }
    ,divmod: function( a ) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,divides: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( Arithmetic.equ(O, self.num) ) return false;
        if ( is_instance(a, IntegerMod) && self.m.isPrime() )
            return true;
        else if ( is_instance(a, Integer) )
            return Arithmetic.equ(O, Arithmetic.mod(a.num, self.num));
        else if ( is_instance(a, INumber) )
            return true;
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(O, Arithmetic.mod(Arithmetic.num(a), self.num));

        return false;
    }
    ,integer: function( raw ) {
        var self = this;
        return true===raw ? self.num : self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.O) ) return null; // not supported
        else if ( n.equ(Arithmetic.I) ) return self;
        return IntegerMod(powm(self.num, n.num, self.m.num), self.m, true);
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.I) ) return null; // not supported
        else if ( n.equ(Arithmetic.I) ) return self;
        return IntegerMod(ikthrootp(self.num, n.num, self.m.num), self.m, true);
    }
    ,wrap: function( x ) {
        var self = this, modulo = self.m.num, Arithmetic = Abacus.Arithmetic;
        x = Arithmetic.mod(x, modulo);
        if ( Arithmetic.lt(x, Arithmetic.O) ) x = Arithmetic.add(x, modulo);
        return x;
    }
    ,simpl: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !self._simpl )
        {
            self.num = self.wrap(self.num);
            self._simpl = true;
        }
        return self;
    }
    ,valueOf: function( ) {
        return Abacus.Arithmetic.val(this.num);
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
            self._str = String(self.num);
        return self._str;
    }
    ,toDec: function( precision ) {
        var dec = this.toString();
        if ( is_number(precision) && 0<precision ) dec += '.'+(new Array(precision+1).join('0'));
        return dec;
    }
});
IntegerMod.cast = function(a, m) {
    m = Integer.cast(m);
    var type_cast = typecast(function(a){
        return is_instance(a, IntegerMod) && (m.equ(a.m));
    }, function(a){
        return is_string(a) ? IntegerMod.fromString(a, m) : new IntegerMod(a, m);
    });
    return type_cast(a);
};

// Abacus.Rational, represents a rational number (can support bigInt numerator/denumerator if plugged in, else default numbers)
Rational = Abacus.Rational = Class(Numeric, {

    constructor: function Rational( /*num, den, simplified*/ ) {
        var self = this, args = arguments, num, den, simplified, simplify = Rational.autoSimplify,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;

        if ( args.length && (is_array(args[0]) || is_args(args[0])) ) args = args[0];

        simplified = (2<args.length) && (true===args[2]);

        if ( 1 < args.length )
        {
            num = args[0]; den = args[1];
        }
        else if ( 1 === args.length )
        {
            num = args[0]; den = null;
        }
        else
        {
            num = null; den = null;
        }

        if ( !is_instance(self, Rational) ) return new Rational(num, den, simplified);

        if ( is_instance(num, Symbolic) ) num = num.c();
        if ( is_instance(den, Symbolic) ) den = den.c();
        if ( is_instance(num, [Integer, IntegerMod]) ) num = num.num;
        if ( is_instance(den, [Integer, IntegerMod]) ) den = den.num;
        if ( is_instance(num, Complex) ) num = num.real();
        if ( is_instance(num, Rational) )
        {
            simplified = num._simpl;
            den = num.den;
            num = num.num;
        }

        if ( null == den ) den = I;
        if ( null == num ) num = O;

        num = Arithmetic.num(num);
        den = Arithmetic.num(den);

        if ( Arithmetic.equ(O, den) ) throw new Error('Zero denominator in Abacus.Rational!');

        self.num = Arithmetic.abs(num); self.den = Arithmetic.abs(den);

        if ( Arithmetic.equ(O, self.num) ) self.den = I; // normalise zero representation

        if ( (Arithmetic.lt(O, num) && Arithmetic.gt(O, den)) || (Arithmetic.lt(O, den) && Arithmetic.gt(O, num)) )
            self.num = Arithmetic.neg(self.num); // make numerator carry the sign only

        if ( simplified ) self._simpl = true;
        else if ( simplify ) self.simpl(); // simplify to smallest equivalent representation
    }

    ,__static__: {
        autoSimplify: true
        ,O: null
        ,I: null
        ,J: null
        ,Zero: function( ) {
            if ( null == Rational.O ) Rational.O = Rational(Abacus.Arithmetic.O, Abacus.Arithmetic.I, true);
            return Rational.O;
        }
        ,One: function( ) {
            if ( null == Rational.I ) Rational.I = Rational(Abacus.Arithmetic.I, Abacus.Arithmetic.I, true);
            return Rational.I;
        }
        ,MinusOne: function( ) {
            if ( null == Rational.J ) Rational.J = Rational(Abacus.Arithmetic.J, Abacus.Arithmetic.I, true);
            return Rational.J;
        }
        ,EPS: null
        ,Epsilon: function( newEpsilon ) {
            if ( null != newEpsilon )
            {
                Rational.EPS = true === newEpsilon ? Rational.fromString(EPSILON.toString()) : Rational.fromString(newEpsilon.toString());
            }
            else if ( null == Rational.EPS )
            {
                Rational.EPS = Rational.fromString(EPSILON.toString());
            }
            return Rational.EPS;
        }

        ,hasInverse: function( ) {
            return true;
        }
        ,cast: null // added below

        ,gcd: rgcd
        ,xgcd: rxgcd
        ,lcm: rlcm
        ,max: nmax
        ,min: nmin
        ,rnd01: function( limit ) {
            var Arithmetic = Abacus.Arithmetic, two = Arithmetic.II, tries, lo, hi, mid;
            // geerate random Rational between 0 and 1 uniformly with up to "limit" bits/tries
            if ( null == limit ) limit = 15;
            limit = Abacus.Math.rndInt(0, stdMath.abs(+limit)); tries = 0;
            lo = Rational.Zero(); hi = Rational.One();
            while( tries<limit && lo.lte(hi) )
            {
                mid = hi.add(lo).div(two);
                if ( Abacus.Math.rnd() < 0.5 ) hi = mid;
                else lo = mid;
                tries++;
            }
            return lo;
        }
        ,rnd: function( m, M, limit ) {
            var t;
            m = Rational.cast(m); M = Rational.cast(M);
            if ( M.lt(m) ) { t=m; m=M; M=t; }
            return m.equ(M) ? m : m.add(Rational.rnd01(limit).mul(M.sub(m)));
        }

        ,fromIntRem: function( i, r, m ) {
            var Arithmetic = Abacus.Arithmetic;
            i = Arithmetic.num(i); r = Arithmetic.num(r); m = Arithmetic.num(m);
            return Rational(Arithmetic.add(r, Arithmetic.mul(i, m)), m);
        }
        ,fromContFrac: function( cfr ) {
            // compute rational from continued fraction representation
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, n, d, n0, d0, k;
            n = I; d = O;
            if ( is_array(cfr) )
            {
                k = cfr.length-1;
                while( 0<=k )
                {
                    n0 = n; d0 = d;
                    n = d0; d = n0;
                    n = Arithmetic.add(n, Arithmetic.mul(d, cfr[k--]));
                }
            }
            return Arithmetic.equ(O, d) ? null : Rational(n, d);
        }
        ,fromDec: function( d ) {
            var f = dec2frac(d, true);
            return f ? Rational(f[0], f[1], true) : Rational.Zero();
        }
        ,fromString: function( s ) {
            var Arithmetic = Abacus.Arithmetic, num_denom, m, sign = '+', num, den,
                tex_frac_pattern = /^(-)?\\frac\{(-?\d+)\}\{(-?\d+)\}$/, O = Rational.Zero();
            s = trim(String(s));
            if ( !s.length ) return O;
            if ( ('+' === s.charAt(0)) || ('-' === s.charAt(0)) )
            {
                // get optional sign
                sign = s.charAt(0);
                s = trim(s.slice(1));
            }
            if ( !s.length ) return O;
            if ( ('(' === s.charAt(0)) && (')' === s.charAt(s.length-1)) )
            {
                // remove optional parentheses
                s = trim(s.slice(1, -1));
            }
            if ( !s.length ) return O;
            if ( (-1 !== s.indexOf('.')) || (-1 !== s.indexOf('e')) )
            {
                m = Rational.fromDec(s);
                if ( '-' === sign ) m = m.neg();
                return m;
            }
            else if ( -1 !== s.indexOf('\\frac') )
            {
                m = s.match(tex_frac_pattern);
                if ( !m ) return O;
                if ( '-' === m[1] ) sign = '-' === sign ? '+' : '-';
                num = Arithmetic.num(m[2]);
                den = Arithmetic.num(m[3]);
            }
            else
            {
                num_denom = String(s).split('/');
                num = Arithmetic.num(num_denom[0].length ? num_denom[0] : '0');
                den = 1<num_denom.length ? Arithmetic.num(num_denom[1]) : Arithmetic.I;
            }
            if ( '-' === sign ) num = Arithmetic.neg(num);
            return Rational(num, den);
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_str: null
    ,_strp: null
    ,_tex: null
    ,_cfr: null
    ,_dec: null
    ,_int: null
    ,_rem: null
    ,_simpl: false

    ,dispose: function( ) {
        var self = this;
        if ( self._n && self===self._n._n )
        {
            self._n._n = null;
        }
        if ( self._i && self===self._i._i )
        {
            self._i._i = null;
        }
        self.num = null;
        self.den = null;
        self._n = null;
        self._i = null;
        self._str = null;
        self._strp = null;
        self._tex = null;
        self._cfr = null;
        self._dec = null;
        self._int = null;
        self._rem = null;
        self._simpl = null;
        return self;
    }

    ,isInt: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self._simpl ? Arithmetic.equ(Arithmetic.I, self.den) : Arithmetic.equ(Arithmetic.O, Arithmetic.mod(self.num, self.den));
    }

    ,equ: function( a, strict ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Rational) )
            return true===strict ? (Arithmetic.equ(self.num, a.num) && Arithmetic.equ(self.den, a.den)) : Arithmetic.equ(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return true===strict ? (Arithmetic.equ(self.num, a.num) && Arithmetic.equ(self.den, Arithmetic.I)) : Arithmetic.equ(self.num, Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, INumber) )
            return a.equ(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return true===strict ? (Arithmetic.equ(self.num, a) && Arithmetic.equ(self.den, Arithmetic.I)) : Arithmetic.equ(self.num, Arithmetic.mul(self.den, a));
        else if ( is_string(a) )
            return (a === self.toString()) || (a === self.toTex()) || (a === self.toDec());

        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Rational) )
            return Arithmetic.gt(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.gt(self.num, Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, INumber) )
            return a.lt(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.gt(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Rational) )
            return Arithmetic.gte(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.gte(self.num, Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, INumber) )
            return a.lte(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.gte(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Rational) )
            return Arithmetic.lt(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.lt(self.num, Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, INumber) )
            return a.gt(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.lt(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Rational) )
            return Arithmetic.lte(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.lte(self.num, Arithmetic.mul(a.num, self.den));
        else if ( is_instance(a, INumber) )
            return a.gte(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.lte(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,abs: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return Rational(Arithmetic.abs(self.num), self.den, self._simpl);
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = Rational(Arithmetic.neg(self.num), self.den, self._simpl);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function( ) {
        var self = this;
        if ( null == self._i )
        {
            self._i = Rational(self.den, self.num, self._simpl);
            self._i._i = self;
        }
        return self._i;
    }
    ,rev: function( ) {
        return this.inv();
    }

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( !a.isReal() ) return a.add(self);
            a = a.real();
        }
        if ( is_instance(a, Rational) )
            return Arithmetic.equ(self.den, a.den) ? Rational(Arithmetic.add(self.num, a.num), self.den) : Rational(Arithmetic.add(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den)), Arithmetic.mul(self.den, a.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.add(self.num, a.num), self.den) : Rational(Arithmetic.add(self.num, Arithmetic.mul(self.den, a.num)), self.den);
        else if ( is_instance(a, INumber) )
            return a.add(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.add(self.num, a), self.den) : Rational(Arithmetic.add(self.num, Arithmetic.mul(self.den, a)), self.den);

        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( !a.isReal() ) return Complex(self).sub(a);
            a = a.real();
        }
        if ( is_instance(a, Rational) )
            return Arithmetic.equ(self.den, a.den) ? Rational(Arithmetic.sub(self.num, a.num), self.den) : Rational(Arithmetic.sub(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den)), Arithmetic.mul(self.den, a.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.sub(self.num, a.num), self.den) : Rational(Arithmetic.sub(self.num, Arithmetic.mul(self.den, a.num)), self.den);
        else if ( is_instance(a, INumber) )
            return a.neg().add(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.sub(self.num, a), self.den) : Rational(Arithmetic.sub(self.num, Arithmetic.mul(self.den, a)), self.den);

        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( !a.isReal() ) return a.mul(self);
            a = a.real();
        }
        if ( is_instance(a, Rational) )
            return Rational(Arithmetic.mul(self.num, a.num), Arithmetic.mul(self.den, a.den));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Rational(Arithmetic.mul(self.num, a.num), self.den);
        else if ( is_instance(a, INumber) )
            return a.mul(self);
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Rational(Arithmetic.mul(self.num, a), self.den);

        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( !a.isReal() ) return Complex(self).div(a);
            a = a.real();
        }
        if ( is_instance(a, RationalFunc) )
            return a.inv().mul(self);
        else if ( is_instance(a, Rational) )
            return Rational(Arithmetic.mul(self.num, a.den), Arithmetic.mul(self.den, a.num));
        else if ( is_instance(a, [Integer, IntegerMod]) )
            return Rational(self.num, Arithmetic.mul(self.den, a.num));
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return Rational(self.num, Arithmetic.mul(self.den, a));

        return self;
    }
    ,mod: function( a, q ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) ) a = a.real();

        if ( is_instance(a, [Rational, Integer, IntegerMod]) )
            return self.sub(a.mul(is_instance(q, Rational) ? q : self.div(a).round()));
        else if ( Arithmetic.isNumber(a) ) // assume integer
            return self.sub(Arithmetic.mul(a, is_instance(q, Rational) ? q.num : self.div(a).round().num));

        return self;
    }
    ,divmod: function( a ) {
        var self = this, q = self.div(a).round();
        return [q, self.mod(a, q)];
    }
    ,divides: function( a ) {
        return !this.equ(Abacus.Arithmetic.O);
    }

    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, num, denom;
        n = Integer.cast(n);
        num = self.num; denom = self.den;
        if ( n.lt(O) )
        {
            if ( Arithmetic.equ(O, num) ) throw new Error('Zero denominator from negative power in Abacus.Rational!');
            num = self.den; denom = self.num;
            n = n.neg();
        }
        if ( Arithmetic.equ(O, num) ) return Rational.Zero();
        if ( n.equ(O) ) return Rational.One();
        if ( n.equ(I) ) return Rational(num, denom, self._simpl);
        return Rational(Arithmetic.pow(num, n.num), Arithmetic.pow(denom, n.num), self._simpl);
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) ) return self;
        if ( self.lt(Arithmetic.O) && n.mod(Arithmetic.II).equ(Arithmetic.O) ) return Complex(self).rad(n);
        return kthroot(self, n);
    }
    ,simpl: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, g;
        if ( !self._simpl )
        {
            if ( Arithmetic.equ(Arithmetic.O, self.num) )
            {
                self.den = I;
            }
            else if ( !Arithmetic.equ(Arithmetic.J, self.num) && !Arithmetic.equ(I, self.num) && !Arithmetic.equ(I, self.den) )
            {
                g = gcd(self.num, self.den);
                if ( !Arithmetic.equ(I, g) )
                {
                    self.num = Arithmetic.div(self.num, g);
                    self.den = Arithmetic.div(self.den, g);
                    self._str = null;
                    self._strp = null;
                    self._tex = null;
                }
            }
            self._simpl = true;
        }
        return self;
    }
    ,round: function( absolute ) {
        absolute = false!==absolute;
        var self = this, Arithmetic = Abacus.Arithmetic,
            sign = absolute ? (Arithmetic.gt(Arithmetic.O, self.num) ? Arithmetic.J : Arithmetic.I) : Arithmetic.I;
        return Rational(Arithmetic.mul(sign, Arithmetic.div(Arithmetic.add(Arithmetic.mul(absolute ? Arithmetic.abs(self.num) : self.num, Arithmetic.II), self.den), Arithmetic.mul(self.den, Arithmetic.II))), Arithmetic.I, true);
    }
    ,integer: function( raw ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._int )
            self._int = Rational(Arithmetic.div(self.num, self.den), Arithmetic.I, true); // return integer part
        return true===raw ? self._int.num : self._int;
    }
    ,remainder: function( raw ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._rem )
            self._rem = Rational(Arithmetic.mod(self.num, self.den), Arithmetic.I, true); // return remainder part
        return true===raw ? self._rem.num : self._rem;
    }
    ,approximate: function( bound ) {
        // compute an approximation of given rational with denominator no larger than bound via Farey sequence
        var self = this, nn = self.num, dd = self.den, a, b, c, d, m1, m2, nm, dm, i, neg, rn = null, rd = null,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;

        bound = Arithmetic.num(bound); neg = self.lt(O);
        nn = Arithmetic.abs(nn); i = Arithmetic.div(nn, dd); nn = Arithmetic.mod(nn, dd);
        a = O; b = I; c = I; d = I;
        while ( Arithmetic.lte(b, bound) && Arithmetic.lte(d, bound) )
        {
            m1 = Arithmetic.add(a, c); m2 = Arithmetic.add(b, d);
            nm = Arithmetic.mul(nn, m2); dm = Arithmetic.mul(dd, m1);
            if ( Arithmetic.equ(nm, dm) )
            {
                if ( Arithmetic.lte(m2, bound) )
                {
                    rn = m1; rd = m2;
                    break;
                }
                else if ( Arithmetic.gt(d, b) )
                {
                    rn = c; rd = d;
                    break;
                }
                else
                {
                    rn = a; rd = b;
                    break;
                }
            }
            else if ( Arithmetic.gt(nm, dm) )
            {
                a = m1; b = m2;
            }
            else
            {
                c = m1; d = m2;
            }
        }
        if ( null==rn || null==rd )
        {
            if ( Arithmetic.gt(b, bound) )
            {
                rn = c; rd = d;
            }
            else
            {
                rn = a; rd = b;
            }
        }
        return new Rational(neg ? Arithmetic.neg(Arithmetic.add(rn, Arithmetic.mul(i, rd))) : Arithmetic.add(rn, Arithmetic.mul(i, rd)), rd);
    }
    ,tuple: function( ) {
        return [this.num, this.den];
    }
    ,toContFrac: function( ) {
        // compute continued fraction representation of rational r
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, n, d, n0, d0, i, cfr;
        if ( null == self._cfr )
        {
            n = self.num; d = self.den; cfr = [];
            while( !Arithmetic.equ(O, d) )
            {
                i = Arithmetic.div(n, d); cfr.push(i);
                n0 = n; d0 = d;
                n = d0; d = Arithmetic.sub(n0, Arithmetic.mul(i, d0));
            }
            self._cfr = cfr;
        }
        return self._cfr.slice();
    }
    ,toDec: function( precision ) {
        var self = this, dec, point, repeating, ndigits, digit, d, i, i0, carry;
        if ( null == self._dec )
            self._dec = frac2dec(self.num, self.den); // return **exact** decimal expansion (with optional repeating digits)
        if ( is_number(precision) && 0<=precision )
        {
            precision = stdMath.ceil(precision);
            dec = self._dec;
            point = dec.indexOf('.');
            if ( -1 === point ) return 0<precision ? (dec+'.'+(new Array(precision+1).join('0'))) : dec;
            i = dec.indexOf('[', point+1);
            if ( -1 !== i )
            {
                repeating = dec.slice(i+1, -1);
                dec = dec.slice(0, i)+repeating;
                if ( repeating.length && (dec.length-point-1 <= precision) )
                    dec += new Array(stdMath.floor((precision-(dec.length-point-1))/repeating.length)+2).join(repeating);
            }
            ndigits = dec.length-point-1;
            if ( ndigits < precision )
            {
                dec += new Array(precision-ndigits+1).join('0');
            }
            else if ( ndigits > precision )
            {
                digit = dec.charAt(point+1+precision); d = parseInt(digit, 10);
                dec = dec.slice(0, point+1+precision).split('');
                i = dec.length-1; i0 = '-'===dec[0] ? 1 : 0; carry = (d >= 5);
                if ( point === i ) i--;
                while ( carry && (i >= i0) )
                {
                    d = parseInt(dec[i], 10);
                    carry = (9 === d);
                    dec[i] = String(carry ? 0 : d+1);
                    i--; if ( point === i ) i--;
                }
                if ( carry ) dec.splice(i0, 0, '1');
                if ( '.' === dec[dec.length-1] ) dec.pop();
                dec = dec.join('');
            }
            return dec;
        }
        else
        {
            return self._dec;
        }
    }
    ,valueOf: function( ) {
        var Arithmetic = Abacus.Arithmetic;
        return Arithmetic.val(this.num)/Arithmetic.val(this.den);
    }
    ,toString: function( parenthesized ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
        {
            self._str = String(self.num) + (Arithmetic.equ(Arithmetic.I, self.den) ? '' : ('/'+String(self.den)));
            self._strp = Arithmetic.equ(Arithmetic.I, self.den) ? String(self.num) : ((Arithmetic.gt(Arithmetic.O, self.num) ? '-' : '')+'('+String(Arithmetic.abs(self.num))+'/'+String(self.den)+')');
        }
        return parenthesized ? self._strp : self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._tex )
            self._tex = Arithmetic.equ(Arithmetic.I, self.den) ? Tex(self.num) : ((Arithmetic.gt(Arithmetic.O, self.num) ? '-' : '')+'\\frac{'+Tex(Arithmetic.abs(self.num))+'}{'+Tex(self.den)+'}');
        return self._tex;
    }
});
Rational.cast = typecast([Rational], function(a){
    return is_string(a) ? Rational.fromString(a) : new Rational(a);
});

// Abacus.Complex represents a complex number with Rational parts
Complex = Abacus.Complex = Class(Numeric, {

    constructor: function Complex( /*real, imag*/ ) {
        var self = this, args = arguments, real, imag;

        if ( args.length && (is_array(args[0]) || is_args(args[0])) ) args = args[0];

        if ( 1 < args.length )
        {
            real = args[0]; imag = args[1];
        }
        else if ( 1 === args.length )
        {
            real = args[0]; imag = Rational.Zero();
        }
        else
        {
            real = Rational.Zero(); imag = Rational.Zero();
        }

        if ( is_instance(real, Symbolic) ) real = real.c();
        if ( is_instance(imag, Symbolic) ) imag = imag.c();

        if ( is_instance(real, Complex) )
        {
            imag = real.imag();
            real = real.real();
        }

        if ( !is_instance(self, Complex) ) return new Complex(real, imag);

        self.re = Rational.cast(real);
        self.im = Rational.cast(imag);
    }

    ,__static__: {
        Symbol: 'i'
        ,O: null
        ,I: null
        ,J: null
        ,i: null
        ,j: null
        ,Zero: function( ) {
            if ( null == Complex.O ) Complex.O = Complex(Rational.Zero(), Rational.Zero());
            return Complex.O;
        }
        ,One: function( ) {
            if ( null == Complex.I ) Complex.I = Complex(Rational.One(), Rational.Zero());
            return Complex.I;
        }
        ,MinusOne: function( ) {
            if ( null == Complex.J ) Complex.J = Complex(Rational.MinusOne(), Rational.Zero());
            return Complex.J;
        }
        ,Img: function( ) {
            if ( null == Complex.i ) Complex.i = Complex(Rational.Zero(), Rational.One());
            return Complex.i;
        }
        ,MinusImg: function( ) {
            if ( null == Complex.j ) Complex.j = Complex(Rational.Zero(), Rational.MinusOne());
            return Complex.j;
        }

        ,hasInverse: function( ) {
            return true;
        }
        ,cast: null // added below

        ,gcd: cgcd
        ,xgcd: cxgcd
        ,lcm: clcm
        ,max: nmax
        ,min: nmin
        ,rnd: function( m, M, limit ) {
            m = Complex.cast(m); M = Complex.cast(M);
            return Complex(Rational.rnd(m.real(), M.real(), limit), Rational.rnd(m.imag(), M.imag(), limit));
        }

        ,fromString: function( s ) {
            var m, signre, signim, real, imag, O = Complex.Zero(),
                pattern = /^\(?(?:([\+\-])?\s*\(?((?:\\frac\{-?\d+\}\{-?\d+\})|(?:-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/-?\d+)?))?\)?(\*?[ij])?)(?:\s*([\+\-])?\s*(?:\(?((?:\\frac\{-?\d+\}\{-?\d+\})|(?:-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/-?\d+)?))\)?\*?)?([ij]))?\)?$/;
            s = trim(String(s));
            if ( !s.length ) return O;
            m = s.match(pattern);
            if ( !m ) return O;
            if ( m[3] && !m[6] )
            {
                // given in opposite order or imaginary only
                imag = m[2] ? m[2] : (m[3] ? '1' : '0');
                real = m[5] || '0';
                signim = '-'===m[1] ? '-' : '';
                signre = '-'===m[4] ? '-' : '';
            }
            else
            {
                // given in correct order or real only
                imag = m[5] ? m[5] : (m[6] ? '1' : '0');
                real = m[2] || '0';
                signim = '-'===m[4] ? '-' : '';
                signre = '-'===m[1] ? '-' : '';
            }
            return Complex(Rational.fromString(signre+real), Rational.fromString(signim+imag));
        }
    }

    ,re: null
    ,im: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_strp: null
    ,_tex: null
    ,_dec: null
    ,_norm: null
    ,_int: null
    ,_rem: null
    ,_simpl: false

    ,dispose: function( ) {
        var self = this;
        if ( self._n && self===self._n._n )
        {
            self._n._n = null;
        }
        if ( self._i && self===self._i._i )
        {
            self._i._i = null;
        }
        if ( self._c && self===self._c._c )
        {
            self._c._c = null;
        }
        self.re = null;
        self.im = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._str = null;
        self._strp = null;
        self._tex = null;
        self._dec = null;
        self._norm = null;
        self._int = null;
        self._rem = null;
        return self;
    }

    ,isReal: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.im.equ(Arithmetic.O);
    }
    ,isImag: function( ) {
        var self = this, O = Abacus.Arithmetic.O;
        return self.re.equ(O) && !self.im.equ(O);
    }
    ,isInt: function( ) {
        var self = this;
        return self.isReal() && self.re.isInt();
    }
    ,isGauss: function( ) {
        // is Gaussian integer
        var self = this;
        return self.re.isInt() && self.im.isInt();
    }

    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
            return self.re.equ(a.re) && self.im.equ(a.im);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return self.re.equ(a) && self.im.equ(Arithmetic.O);
        else if ( is_instance(a, INumber) )
            return a.equ(self);
        else if ( is_string(a) )
            return (a === self.toString()) || (a === self.toTex()) || (a === self.toDec());

        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( self.isReal() && a.isReal() ) return self.re.gt(a.re);
            else if ( self.isImag() && a.isImag() ) return self.im.gt(a.im);
            return self.norm().gt(a.norm());
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal() )
        {
            return self.re.gt(a);
        }
        else if ( is_instance(a, INumber) )
        {
            return a.lt(self);
        }
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( self.isReal() && a.isReal() ) return self.re.gte(a.re);
            else if ( self.isImag() && a.isImag() ) return self.im.gte(a.im);
            return self.norm().gte(a.norm());
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal() )
        {
            return self.re.gte(a);
        }
        else if ( is_instance(a, INumber) )
        {
            return a.lte(self);
        }
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( self.isReal() && a.isReal() ) return self.re.lt(a.re);
            else if ( self.isImag() && a.isImag() ) return self.im.lt(a.im);
            return self.norm().lt(a.norm());
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal() )
        {
            return self.re.lt(a);
        }
        else if ( is_instance(a, INumber) )
        {
            return a.gt(self);
        }
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
        {
            if ( self.isReal() && a.isReal() ) return self.re.lte(a.re);
            else if ( self.isImag() && a.isImag() ) return self.im.lte(a.im);
            return self.norm().lte(a.norm());
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal() )
        {
            return self.re.lte(a);
        }
        else if ( is_instance(a, INumber) )
        {
            return a.gte(self);
        }
        return false;
    }

    ,real: function( ) {
        return this.re;
    }
    ,imag: function( ) {
        return this.im;
    }
    ,norm: function( ) {
        var self = this, real, imag, two = Abacus.Arithmetic.II;
        if ( null == self._norm )
        {
            real = self.re; imag = self.im;
            self._norm = real.pow(two).add(imag.pow(two));
        }
        return self._norm;
    }
    ,abs: function( ) {
        var self = this;
        return Complex(self.re.abs(), self.im.abs());
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = Complex(self.re.neg(), self.im.neg());
            self._n._n = self;
        }
        return self._n;
    }
    ,conj: function( ) {
        var self = this;
        if ( null == self._c )
        {
            self._c = Complex(self.re, self.im.neg());
            self._c._c = self;
        }
        return self._c;
    }
    ,rev: function( ) {
        var self = this;
        return Complex(self.im, self.re);
    }
    ,inv: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, m;
        if ( null == self._i )
        {
            if ( self.equ(Arithmetic.O) ) throw new Error('Division by zero in inverse in Abacus.Complex!');
            m = self.norm();
            self._i = Complex(self.re.div(m), self.im.div(m).neg());
            self._i._i = self;
        }
        return self._i;
    }

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
            return Complex(self.re.add(a.re), self.im.add(a.im));
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return Complex(self.re.add(a), self.im);
        else if ( is_instance(a, INumber) )
            return a.add(self);

        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Complex) )
            return Complex(self.re.sub(a.re), self.im.sub(a.im));
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return Complex(self.re.sub(a), self.im);
        else if ( is_instance(a, INumber) )
            return a.neg().add(self);

        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, k1, k2, k3, x1, x2, y1, y2;
        if ( is_instance(a, Complex) )
        {
            if ( self.isReal() )
            {
                return Complex(a.re.mul(self.re), a.im.mul(self.re));
            }
            else if ( self.isImag() )
            {
                return Complex(a.im.mul(self.im).neg(), a.re.mul(self.im));
            }
            else if ( a.isReal() )
            {
                return Complex(self.re.mul(a.re), self.im.mul(a.re));
            }
            else if ( a.isImag() )
            {
                return Complex(self.im.mul(a.im).neg(), self.re.mul(a.im));
            }
            else
            {
                // fast complex multiplication
                x1 = self.re; x2 = a.re; y1 = self.im; y2 = a.im;
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return Complex(self.re.mul(a), self.im.mul(a));
        }
        else if ( is_instance(a, INumber) )
        {
            return a.mul(self);
        }

        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, m, k1, k2, k3, x1, x2, y1, y2;
        if ( is_instance(a, Complex) )
        {
            if ( a.equ(O) )
                throw new Error('Division by zero in Abacus.Complex!');

            if ( a.isReal() )
            {
                return Complex(self.re.div(a.re), self.im.div(a.re));
            }
            else if ( a.isImag() )
            {
                return Complex(self.im.div(a.im), self.re.div(a.im).neg());
            }
            else
            {
                // fast complex multiplication for inverse
                m = a.norm(); x1 = self.re; x2 = a.re.div(m); y1 = self.im; y2 = a.im.div(m).neg();
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            if ( (is_instance(a, Numeric) && a.equ(O)) || (Arithmetic.isNumber(a) && Arithmetic.equ(O, a)) )
                throw new Error('Division by zero in Abacus.Complex!');

            return Complex(self.re.div(a), self.im.div(a));
        }

        return self;
    }
    ,mod: function( a, q ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return self.sub((is_instance(q, Complex) ? q : self.div(a).round()).mul(a));

        return self;
    }
    ,divmod: function( a ) {
        var self = this, q = self.div(a).round();
        return [q, self.mod(a, q)];
    }
    ,divides: function( a ) {
        return !this.equ(Abacus.Arithmetic.O);
    }

    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, pow, e;
        n = Integer.cast(n);
        if ( n.gt(MAX_DEFAULT) ) return null;
        if ( self.equ(O) )
        {
            if ( n.lt(O) ) throw new Error('Zero denominator in negative power in Abacus.Complex!');
            return Complex.Zero();
        }
        if ( n.equ(O) ) return Complex.One();
        if ( n.equ(I) ) return self;
        if ( n.lt(O) )
        {
            self = self.inv();
            n = n.neg();
        }
        n = Arithmetic.val(n.num);
        e = self; pow = Complex.One();
        while( 0 !== n )
        {
            // exponentiation by squaring
            if ( n & 1 ) pow = pow.mul(e);
            n >>= 1;
            e = e.mul(e);
        }
        return pow;
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, norm;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) )
        {
            return self;
        }
        if ( n.equ(Arithmetic.II) )
        {
            // https://en.wikipedia.org/wiki/Complex_number#Square_root
            if ( self.imag().equ(0) )
            {
                return self.real().lt(0) ? Complex(Rational.Zero(), self.real().abs().rad(n)) : Complex(self.real().rad(n), Rational.Zero());
            }
            else
            {
                norm = self.norm().rad(2);
                return Complex(norm.add(self.real()).div(2).rad(n), norm.sub(self.real()).div(2).rad(n).mul(self.imag().lt(0) ? -1 : 1));
            }
        }
        return kthroot(self, n);
    }
    ,simpl: function( ) {
        var self = this;
        if ( !self._simpl )
        {
            // simplify
            self.re.simpl();
            self.im.simpl();
            self._str = null;
            self._strp = null;
            self._tex = null;
            self._simpl = true;
        }
        return self;
    }
    ,round: function( absolute ) {
        absolute = false!==absolute;
        var self = this;
        return Complex(self.re.round(absolute), self.im.round(absolute)); // return integer part
    }
    ,integer: function( ) {
        var self = this;
        if ( null == self._int )
            self._int = Complex(self.re.integer(), self.im.integer()); // return integer part
        return self._int;
    }
    ,remainder: function( ) {
        var self = this;
        if ( null == self._rem )
            self._rem = Complex(self.re.remainder(), self.im.remainder()); // return remainder part
        return self._rem;
    }
    ,tuple: function( ) {
        return [this.re, this.im];
    }
    ,valueOf: function( ) {
        return this.re.valueOf();
    }
    ,toString: function( parenthesized ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr;
        if ( null == self._str )
        {
            zr = self.re.equ(O);
            self._str = (zr ? '' : self.re.toString()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toString(true)+'*'))) + Complex.Symbol));
            if ( !self._str.length ) self._str = '0';
            self._strp = (zr ? '' : self.re.toString(true)) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toString(true)+'*'))) + Complex.Symbol));
            if ( !self._strp.length ) self._strp = '0';
        }
        return parenthesized ? self._strp : self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr;
        if ( null == self._tex )
        {
            zr = self.re.equ(O);
            self._tex = (zr ? '' : self.re.toTex()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : self.im.toTex()))+Complex.Symbol));
            if ( !self._tex.length ) self._tex = '0';
        }
        return self._tex;
    }
    ,toDec: function( precision ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr, dec;
        if ( null == self._dec )
        {
            zr = self.re.equ(O);
            self._dec = (zr ? '' : self.re.toDec()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toDec()))) + Complex.Symbol));
            if ( !self._dec.length ) self._dec = '0';
        }
        if ( is_number(precision) && 0<=precision )
        {
            zr = self.re.equ(O);
            dec = (zr ? '' : self.re.toDec(precision)) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toDec(precision)))) + Complex.Symbol));
            if ( !dec.length )
            {
                dec = '0';
                if ( 0<precision ) dec += '.' + (new Array(precision+1).join('0'));
            }
            return dec;
        }
        else
        {
            return self._dec;
        }
    }
});
Complex.cast = typecast([Complex], function(a){
    return is_string(a) ? Complex.fromString(a) : new Complex(a);
});

// Represents a single symbol
SymbolTerm = Class(Symbolic, {

    constructor: function SymbolTerm( s ) {
        var self = this;
        if ( !is_instance(self, SymbolTerm) ) return new SymbolTerm(s);

        self.sym = is_instance(s, SymbolTerm) ? s.sym : SymbolTerm.fromString(s, false);
    }

    ,__static__: {
        fromString: function( s, as_symbol ) {
            var i;
            s = trim(String(s));
            if ( (-1 !== (i=s.indexOf('_'))) && ('{' === s.charAt(i+1)) && ('}' === s.charAt(s.length-1)) )
                s = s.slice(0, i)+'_'+s.slice(i+2, -1);
            return false !== as_symbol ? new SymbolTerm(s) : s;
        }
    }

    ,sym: null
    ,_tex: null

    ,dispose: function( ) {
        var self = this;
        self.sym = null;
        self._tex = null;
        return self;
    }

    ,c: function( ) {
        return Complex.One();
    }
    ,isConst: function( ) {
        return false;
    }
    ,isReal: function( ) {
        return true;
    }
    ,isImag: function( ) {
        return false;
    }
    ,real: function( ) {
        return this;
    }
    ,imag: function( ) {
        return Expr();
    }

    ,equ: function( a ) {
        var self = this;
        if ( is_instance(a, SymbolTerm) )
            return self.sym === a.sym;
        else if ( is_instance(a, Symbolic) )
            return a.equ(self);
        else if ( is_string(a) )
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,neg: function( ) {
        return MulTerm(this, -1);
    }
    ,inv: function( ) {
        return RationalExpr(1, this);
    }
    ,add: function( a ) {
        return Expr([this, a]);
    }
    ,sub: function( a ) {
        return Expr([this, a.neg()]);
    }
    ,mul: function( a ) {
        var self = this;
        if ( is_instance(a, SymbolTerm) )
            return self.sym===a.sym ? PowTerm(self, 2) : MulTerm([self, a], 1);
        else if ( is_instance(a, Numeric) )
            return MulTerm(self, a);
        else if ( is_instance(a, Symbolic) )
            return a.mul(self);
        return self;
    }
    ,div: function( a ) {
        return RationalExpr(this, a);
    }
    ,pow: function( k ) {
        return PowTerm(this, k);
    }
    ,rad: function( k ) {
        return PowTerm(this, Rational(1, k));
    }
    ,d: function( n ) {
        // nth order formal derivative
        if ( null == n ) n = 1;
        n = +n;
        if ( 0 > n ) return null; // not supported
        return 1 === n ? Complex.One() : Complex.Zero();
    }
    ,evaluate: function( symbolValues ) {
        var self = this;
        symbolValues = symbolValues || {};
        return Complex.cast(symbolValues[self.sym] || 0);
    }
    ,toString: function( ) {
        return this.sym;
    }
    ,toTex: function( ) {
        var self = this;
        if ( null == self._tex )
            self._tex = to_tex(self.sym);
        return self._tex;
    }
});

// Represents a power term in algebraic expressions of general base to some general exponent
PowTerm = Class(Symbolic, {

    constructor: function PowTerm( base, exp ) {
        var self = this, p;
        if ( !is_instance(self, PowTerm) ) return new PowTerm(base, exp);

        if ( is_instance(base, PowTerm) )
        {
            self.base = base.base;
            self.exp = base.exp;
        }
        else if ( is_instance(base, [INumber, Func]) )
        {
            self.base = base;
            self.exp = is_instance(exp, [INumber, Func]) ? exp : Rational.cast(null == exp ? 1 : exp);
        }
        else if ( is_string(base) )
        {
            p = PowTerm.fromString(base, false);
            self.base = p[0];
            self.exp = p[1];
        }
        else
        {
            self.base = Complex.One();
            self.exp = Rational.One();
        }
    }

    ,__static__: {
        Symbol: SymbolTerm

        ,fromString: function( s, as_pow ) {
            var i, b, e;
            s = trim(String(s));
            if ( -1 !== (i=s.indexOf('^')) )
            {
                e = s.slice(i+1);
                if ( ('{' === e.charAt(0)) && ('}' === e.charAt(e.length-1)) ) e = trim(e.slice(1,-1));
                s = s.slice(0, i);
            }
            else
            {
                e = '1';
            }
            b = SymbolTerm.fromString(trim(s));
            e = Rational.fromString(e);
            return false !== as_pow ? new PowTerm(b, e) : [b, e];
        }
    }

    ,base: null
    ,exp: null
    ,_str: null
    ,_tex: null

    ,dispose: function( ) {
        var self = this;
        self.base = null;
        self.exp = null;
        self._str = null;
        self._tex = null;
        return self;
    }

    ,c: function( ) {
        return Complex.One();
    }
    ,isConst: function( ) {
        var self = this;
        return self.base.isConst() && self.exp.isConst();
    }
    ,isReal: function( ) {
        var self = this;
        return self.base.isReal() && self.exp.isReal();
    }
    ,isImag: function( ) {
        var self = this;
        return self.base.isImag() && self.exp.isReal();
    }
    ,real: function( ) {
        var self = this;
        return PowTerm(self.base.real(), self.exp.real());
    }
    ,imag: function( ) {
        var self = this;
        return PowTerm(self.base.imag(), self.exp.imag());
    }

    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return self.base.equ(a.base) && self.exp.equ(a.exp);
        else if ( is_instance(a, [Func, SymbolTerm, Numeric]) || Arithmetic.isNumber(a) )
            return self.base.equ(a) && self.exp.equ(Arithmetic.I);
        else if ( is_instance(a, INumber) )
            return a.equ(self);
        else if ( is_string(a) )
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return (self.exp.equ(a.exp) && self.base.gt(a.base)) || (self.base.equ(a.base) && self.exp.gt(a.exp));
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) && self.exp.gt(Arithmetic.I);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return (self.exp.equ(Arithmetic.I) && self.base.gt(a)) || (self.base.equ(a) && self.exp.gt(Arithmetic.I));
        else if ( is_instance(a, INumber) )
            return a.lt(self);
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return (self.exp.equ(a.exp) && self.base.gte(a.base)) || (self.base.equ(a.base) && self.exp.gte(a.exp));
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) && self.exp.gte(Arithmetic.I);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return (self.exp.equ(Arithmetic.I) && self.base.gte(a)) || (self.base.equ(a) && self.exp.gte(Arithmetic.I));
        else if ( is_instance(a, INumber) )
            return a.lte(self);
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return (self.exp.equ(a.exp) && self.base.lt(a.base)) || (self.base.equ(a.base) && self.exp.lt(a.exp));
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) && self.exp.lt(Arithmetic.I);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return (self.exp.equ(Arithmetic.I) && self.base.lt(a)) || (self.base.equ(a) && self.exp.lt(Arithmetic.I));
        else if ( is_instance(a, INumber) )
            return a.gt(self);
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return (self.exp.equ(a.exp) && self.base.lte(a.base)) || (self.base.equ(a.base) && self.exp.lte(a.exp));
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) && self.exp.lte(Arithmetic.I);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return (self.exp.equ(Arithmetic.I) && self.base.lte(a)) || (self.base.equ(a) && self.exp.lte(Arithmetic.I));
        else if ( is_instance(a, INumber) )
            return a.gte(self);
        return false;
    }

    ,abs: function( ) {
        var self = this;
        return is_instance(self.base, SymbolTerm) ? self : PowTerm(self.base.abs(), self.exp);
    }
    ,neg: function( ) {
        var self = this;
        return MulTerm(self, -1);
    }
    ,conj: function( ) {
        var self = this;
        return is_instance(self.base, SymbolTerm) ? self : PowTerm(self.base.conj(), self.exp);
    }
    ,inv: function( ) {
        var self = this;
        return PowTerm(self.base, self.exp.neg());
    }

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [Numeric, SymbolTerm, PowTerm, MulTerm, Func]) || Arithmetic.isNumber(a) )
            return Expr([self, a]);
        else if ( is_instance(a, INumber) )
            return a.add(self);
        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return Expr([self, Arithmetic.isNumber(a) ? Arithmetic.neg(a) : a.neg()]);
        else if ( is_instance(a, [SymbolTerm, PowTerm, MulTerm, Func]) )
            return Expr([self, a.neg()]);
        else if ( is_instance(a, INumber) )
            return a.neg().add(self);
        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return self.base.equ(a.base) ? PowTerm(self.base, self.exp.add(a.exp)) : MulTerm([self, a]);
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) ? PowTerm(self.base, self.exp.add(Arithmetic.I)) : MulTerm([self, a]);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return MulTerm(self, a);
        else if ( is_instance(a, INumber) )
            return a.mul(self);
        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, PowTerm) )
            return self.base.equ(a.base) ? PowTerm(self.base, self.exp.sub(a.exp)) : MulTerm([self, a.inv()]);
        else if ( is_instance(a, [Func, SymbolTerm]) )
            return self.base.equ(a) ? PowTerm(self.base, self.exp.sub(Arithmetic.I)) : MulTerm([self, PowTerm(a, Rational.MinusOne())]);
        else if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            return MulTerm(self, Arithmetic.isNumber(a) ? Rational(Arithmetic.I, a) : a.inv());
        else if ( is_instance(a, INumber) )
            return a.inv().mul(self);
        return self;
    }
    ,pow: function( n ) {
        var self = this;
        return PowTerm(self.base, self.exp.mul(n));
    }
    ,rad: function( n ) {
        var self = this;
        return PowTerm(self.base, self.exp.div(n));
    }
    ,d: function( n ) {
        // nth order formal derivative
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, d, k;
        if ( null == n ) n = 1;
        n = +n;
        if ( 0 > n ) return null; // not supported
        k = self.exp.sub(n);
        if ( self.exp.lt(O) || !is_instance(k, Numeric) || !k.isReal() || !k.isInt() || k.gte(O) )
        {
            d = MulTerm(PowTerm(self.base, k), operate(function(f, i){
                return self.exp.sub(i).mul(f);
            }, Arithmetic.I, null, 0, n-1, 1));
        }
        else
        {
            d = MulTerm(1, O);
        }
        return d;
    }
    ,evaluate: function( symbolValues ) {
        var self = this, Arithmetic = Abacus.Arithmetic, b, e;
        symbolValues = symbolValues || {};
        e = Rational.cast(is_instance(self.exp, Symbolic) ? self.exp.evaluate(symbolValues) : self.exp).simpl();
        b = Complex.cast(is_instance(self.base, Symbolic) ? self.base.evaluate(symbolValues) : self.base).simpl();
        return b.equ(Arithmetic.O) ? Complex.Zero() : b.pow(e.num).rad(e.den);
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( null == self._str )
            self._str = self.exp.equ(O) ? '1' : (self.exp.equ(Arithmetic.I) ? self.base.toString() : ((is_instance(self.base, SymbolTerm) ? self.base.toString() : '('+self.base.toString()+')') + (is_instance(self.exp, SymbolTerm)||(is_instance(self.exp, Numeric)&&self.exp.isReal())||(is_instance(self.exp, Poly)&&self.exp.isConst(true)&&self.exp.c().isReal()) ? ('^'+self.exp.toString(true)) : ('^('+self.exp.toString()+')'))));
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( null == self._tex )
            self._tex = self.exp.equ(O) ? '1' : (self.exp.equ(Arithmetic.I) ? self.base.toTex() : ((is_instance(self.base, SymbolTerm) ? self.base.toTex() : '('+self.base.toTex()+')') + ('^{'+self.exp.toTex()+'}')));
        return self._tex;
    }
});

// Represents multiplicative terms in (linear) algebraic expressions, including terms with mixed factors of (powers of) symbolic variables
MulTerm = Class(Symbolic, {

    constructor: function MulTerm( s, c ) {
        var self = this, Arithmetic = Abacus.Arithmetic, f, i, l;
        if ( !is_instance(self, MulTerm) ) return new MulTerm(s, c);

        if ( is_instance(s, MulTerm) )
        {
            c = s.factors['1'];
            self.symbol = s.symbol;
            self.symbolTex = s.symbolTex;
            s = s.factors;
            f = c;
            self.factors = Obj(); self.factors['1'] = f;
            if ( !self.factors['1'].equ(Arithmetic.O) ) MulTerm.Merge(s, self);
        }
        else if ( is_instance(s, [SymbolTerm, Func, PowTerm]) )
        {
            if ( is_instance(s, [SymbolTerm, Func]) ) s = PowTerm(s, Arithmetic.I);
            f = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.symbol = s.toString();
            self.symbolTex = s.toTex();
            self.factors = Obj(); self.factors['1'] = f;
            if ( !self.factors['1'].equ(Arithmetic.O) ) MulTerm.Merge(s, self);
        }
        else if ( is_instance(s, Numeric)/* || Arithmetic.isNumber(s)*/ )
        {
            self.symbol = '1';
            self.symbolTex = '1';
            self.factors = Obj(); self.factors['1'] = Complex.cast(s);
        }
        else if ( is_string(s) )
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if ( !self.factors['1'].equ(Arithmetic.O) ) MulTerm.Merge(s, self);
            MulTerm.Symbol(self);
        }
        else if ( is_array(s) )
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if ( !self.factors['1'].equ(Arithmetic.O) )
            {
                for(i=0,l=s.length; i<l; i++)
                    MulTerm.Merge(s[i], self);
            }
            MulTerm.Symbol(self);
        }
        else if ( is_obj(s) )
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if ( !self.factors['1'].equ(Arithmetic.O) ) MulTerm.Merge(s, self);
            MulTerm.Symbol(self);
        }
        else
        {
            self.factors = Obj();
            self.factors['1'] = Complex.cast(null == c ? Arithmetic.I : c); // default;
            MulTerm.Symbol(self);
        }
    }

    ,__static__: {
        Term: PowTerm

        ,Merge: function( factors, T, divide ) {
            var Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                keys, i, l, parts;

            function merge_factor( f ) {
                var sym;
                if ( is_string(f) )
                {
                    if ( ('1' === f) || !f.length ) return; // handled elsewhere
                    f = PowTerm(f);
                }
                if ( !is_instance(f, PowTerm) ) return;

                sym = f.base.toString();
                if ( '1' === sym ) return; // handled elsewhere

                if ( -1 === divide )
                {
                    if ( !T.factors[sym] ) T.factors[sym] = f.inv();
                    else T.factors[sym] = T.factors[sym].div(f);
                }
                else
                {
                    if ( !T.factors[sym] ) T.factors[sym] = f;
                    else T.factors[sym] = T.factors[sym].mul(f);
                }
                if ( T.factors[sym].exp.equ(O) ) delete T.factors[sym];
            };

            if ( ('1' === factors) || (1 === factors) || (Arithmetic.isNumber(factors) && Arithmetic.equ(I, factors)) )
            {
                // skip, handled elsewhere
                //merge_factor(String(factors));
            }
            else if ( is_instance(factors, [SymbolTerm, Func]) )
            {
                merge_factor(PowTerm(factors, I));
            }
            else if ( is_instance(factors, PowTerm) )
            {
                merge_factor(factors);
            }
            else if ( is_string(factors) )
            {
                parts = factors.split('*'); // can be multiple factors eg i_1^2*i_2, split different factors on '*' op
                for(i=0,l=parts.length; i<l; i++)
                    merge_factor(PowTerm(parts[i]));
            }
            else if ( is_array(factors) || is_args(factors) )
            {
                for(i=0,l=factors.length; i<l; i++)
                    merge_factor(factors[i]);
            }
            else if ( is_obj(factors) )
            {
                for(keys=KEYS(factors),i=0,l=keys.length; i<l; i++)
                    merge_factor(is_instance(factors[keys[i]], PowTerm) ? factors[keys[i]] : PowTerm(keys[i], factors[keys[i]]));
            }
            return T;
        }
        ,Symbol: function( T ) {
            var Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, S;
            T._symb = null;
            S = T.symbols().reduce(function(s, f){
                var t = T.factors[f];
                return [
                s[0] + ('1' === f ? '' : ((s[0].length ? '*' : '') + t.toString())),
                s[1] + ('1' === f ? '' : t.toTex())
                ];
            }, ['','']);
            T.symbol = S[0]; T.symbolTex = S[1];
            if ( !T.symbol.length ) T.symbol = '1'; // default constant term
            if ( !T.symbolTex.length ) T.symbolTex = '1'; // default constant term
            return T;
        }
    }

    ,factors: null
    ,symbol: null
    ,symbolTex: null
    ,_str: null
    ,_tex: null
    ,_symb: null

    ,dispose: function( ) {
        var self = this;
        if ( self._n && (self._n._n===self) ) self._n._n = null;
        self.factors = null;
        self.symbol = null;
        self.symbolTex = null;
        self._str = null;
        self._tex = null;
        self._symb = null;
        return self;
    }

    ,symbols: function( ) {
        var self = this;
        if ( null == self._symb ) self._symb = KEYS(self.factors).sort();
        return self._symb;
    }
    ,c: function( ) {
        return this.factors['1'];
    }
    ,isConst: function( ) {
        var self = this;
        return '1'===self.symbol;
    }
    ,isReal: function( ) {
        var self = this, factors = self.factors, f;
        for(f in factors)
        {
            if ( !HAS.call(factors, f) ) continue;
            if ( !factors[f].isReal() ) return false;
        }
        return true;
    }
    ,isImag: function( ) {
        var self = this, factors = self.factors, f;
        for(f in factors)
        {
            if ( !HAS.call(factors, f) ) continue;
            if ( !factors[f].isImag() ) return false;
        }
        return true;
    }
    ,real: function( ) {
        var self = this;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].real();
            return factors;
        }, {}), self.factors['1'].real());
    }
    ,imag: function( ) {
        var self = this;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].imag();
            return factors;
        }, {}), self.factors['1'].imag());
    }
    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( is_instance(a, SymbolTerm) )
            return (a.sym === self.symbol) && self.factors['1'].equ(Arithmetic.I);
        else if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(O, a) ? self.factors['1'].equ(O) : (('1' === self.symbol) && self.factors['1'].equ(a));
        else if ( is_instance(a, Numeric) )
            return a.equ(O) ? self.factors['1'].equ(O) : (('1' === self.symbol) && self.factors['1'].equ(a));
        else if ( is_instance(a, [PowTerm, Func]) )
            return (a.equ(O) && self.equ(O)) || ((self.symbol === a.toString()) && self.factors['1'].equ(Arithmetic.I));
        else if ( is_instance(a, MulTerm) )
            return (a.equ(O) && self.equ(O)) || ((self.symbol === a.symbol) && self.factors['1'].equ(a.factors['1']));
        else if ( is_instance(a, INumber) )
            return a.equ(self);
        else if ( is_string(a) )
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [SymbolTerm, PowTerm, Func]) ) a = MulTerm(a);
        if ( is_instance(a, Expr) )
        {
            return a.lt(self);
        }
        else if ( is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol) )
        {
            return self.c().gt(a.c());
        }
        else if ( ('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)) )
        {
            return self.c().gt(a);
        }
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [SymbolTerm, PowTerm, Func]) ) a = MulTerm(a);
        if ( is_instance(a, Expr) )
        {
            return a.lte(self);
        }
        else if ( is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol) )
        {
            return self.c().gte(a.c());
        }
        else if ( ('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)) )
        {
            return self.c().gte(a);
        }
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [SymbolTerm, PowTerm, Func]) ) a = MulTerm(a);
        if ( is_instance(a, Expr) )
        {
            return a.gt(self);
        }
        else if ( is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol) )
        {
            return self.c().lt(a.c());
        }
        else if ( ('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)) )
        {
            return self.c().lt(a);
        }
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, [SymbolTerm, PowTerm, Func]) ) a = MulTerm(a);
        if ( is_instance(a, Expr) )
        {
            return a.gte(self);
        }
        else if ( is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol) )
        {
            return self.c().lte(a.c());
        }
        else if ( ('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)) )
        {
            return self.c().lte(a);
        }
        return false;
    }

    ,abs: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].abs();
            return factors;
        }, {}), self.factors['1'].abs());
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.factors, self.factors['1'].neg());
    }
    ,conj: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].conj();
            return factors;
        }, {}), self.factors['1'].conj());
    }
    ,inv: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].inv();
            return factors;
        }, {}), self.factors['1'].inv());
    }

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) || is_instance(a, Numeric) )
            return MulTerm(self.factors, self.factors['1'].add(a));
        else if ( is_instance(a, MulTerm) )
            return self.symbol===a.symbol ? MulTerm(self.factors, self.factors['1'].add(a.factors['1'])) : Expr([self, a]);
        else if ( is_instance(a, [Func, PowTerm, SymbolTerm]) )
            return self.symbol===a.toString() ? MulTerm(self.factors, self.factors['1'].add(Arithmetic.I)) : Expr([self, MulTerm(a)]);
        else if ( is_instance(a, [Expr, RationalExpr]) )
            return a.add(self);
        else if ( is_instance(a, Poly) )
            return a.toExpr().add(self);
        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) || is_instance(a, Numeric) )
            return MulTerm(self.factors, self.factors['1'].sub(a));
        else if ( is_instance(a, MulTerm) )
            return self.symbol===a.symbol ? MulTerm(self.factors, self.factors['1'].sub(a.factors['1'])) : Expr([self, a.neg()]);
        else if ( is_instance(a, [Func, PowTerm, SymbolTerm]) )
            return self.symbol===a.toString() ? MulTerm(self.factors, self.factors['1'].sub(Arithmetic.I)) : Expr([self, Multerm(a).neg()]);
        else if ( is_instance(a, Expr) )
            return Expr([self, a.neg()]);
        else if ( is_instance(a, RationalExpr) )
            return a.neg().add(self);
        else if ( is_instance(a, Poly) )
            return Expr([self, a.toExpr().neg()]);
        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, T, s;
        if ( Arithmetic.isNumber(a) || is_instance(a, Numeric) )
        {
            return MulTerm(self.factors, self.factors['1'].mul(a));
        }
        else if ( is_instance(a, MulTerm) )
        {
            T = MulTerm({},  self.factors['1'].mul(a.factors['1']));
            if ( !T.factors['1'].equ(O) )
            {
                MulTerm.Merge(self.factors, T);
                MulTerm.Merge(a.factors, T);
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if ( is_instance(a, [Func, PowTerm, SymbolTerm]) )
        {
            T = MulTerm({},  self.factors['1']);
            if ( !T.factors['1'].equ(O) )
            {
                MulTerm.Merge(self.factors, T);
                a = is_instance(a, SymbolTerm) ? PowTerm(a) : a;
                s = a.base.toString();
                if ( !T.factors[s] ) T.factors[s] = a;
                else T.factors[s] = T.factors[s].mul(a);
                if ( T.factors[s].exp.equ(Arithmetic.O) ) delete T.factors[s];
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if ( is_instance(a, [Expr, RationalExpr]) )
        {
            return a.mul(self);
        }
        else if ( is_instance(a, Poly) )
        {
            return a.toExpr().mul(self);
        }
        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, T;
        if ( Arithmetic.isNumber(a) || is_instance(a, Numeric) )
        {
            return MulTerm(self.factors, self.factors['1'].div(a));
        }
        else if ( is_instance(a, MulTerm) )
        {
            T = MulTerm({}, self.factors['1'].div(a.factors['1']));
            if ( !T.factors['1'].equ(O) )
            {
                MulTerm.Merge(self.factors, T);
                MulTerm.Merge(a.factors, T, -1);
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if ( is_instance(a, [Func, PowTerm, SymbolTerm]) )
        {
            T = MulTerm({},  self.factors['1']);
            if ( !T.factors['1'].equ(O) )
            {
                MulTerm.Merge(self.factors, T);
                a = is_instance(a, SymbolTerm) ? PowTerm(a) : a;
                s = a.base.toString();
                if ( !T.factors[s] ) T.factors[s] = a.inv();
                else T.factors[s] = T.factors[s].div(a);
                if ( T.factors[s].exp.equ(Arithmetic.O) ) delete T.factors[s];
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if ( is_instance(a, [Expr, RationalExpr]) )
        {
            return self;
        }
        else if ( is_instance(a, Poly) )
        {
            return self;
        }
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented

    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if ( self.equ(O) ) return MulTerm(1, O);
        if ( n.equ(O) ) return MulTerm(1, I);
        if ( n.equ(I) ) return self;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].pow(n);
            return factors;
        }, {}), self.factors['1'].pow(n));
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if ( self.equ(O) ) return MulTerm(1, O);
        if ( n.equ(O) ) return null; // undefined
        if ( n.equ(I) ) return self;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ( '1' !== symbol ) factors[symbol] = self.factors[symbol].rad(n);
            return factors;
        }, {}), self.factors['1'].rad(n));
    }
    ,d: function( x, n ) {
        // nth order formal derivative with respect to symbol x
        var self = this, factors = self.factors, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            f, fac, c, d;
        if ( null == n ) n = 1;
        n = +n;
        x = String(x || 'x');
        if ( 0 > n ) return null; // not supported
        if ( factors['1'].equ(O) || ('1' === x) || !HAS.call(factors, x) )
            return MulTerm({}, O);
        fac = {}; c = I;
        for(f in factors)
        {
            if ( !HAS.call(factors, f) || ('1' === f) ) continue;
            if ( x === f )
            {
                d = factors[f].d(n);
                if ( HAS.call(d.factors, f) ) fac[f] = d.factors[f];
                c = d.c().mul(c);
            }
            else
            {
                fac[f] = factors[f];
            }
        }
        return MulTerm(fac, factors['1'].mul(c));
    }
    ,evaluate: function( symbolValues ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, res;
        symbolValues = symbolValues || {};
        if ( '1'===self.symbol ) res = self.factors['1'];
        else res = self.symbols().reduce(function(r, f){
            return r.equ(O) ? Complex.Zero() : r.mul('1'===f ? self.factors['1'] : self.factors[f].evaluate(symbolValues));
        }, Complex.One());
        return res;
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, f1;
        if ( null == self._str )
        {
            f1 = self.factors['1'];
            if ( f1.equ(O) )
                self._str = '0';
            else if ( f1.isReal() )
                self._str = ('1'===self.symbol) ? f1.real().toString() : ((f1.real().equ(Arithmetic.J) ? '-' : (f1.real().equ(Arithmetic.I) ? '' : (f1.real().toString(true)+'*'))) + self.symbol);
            else
                self._str = ('1'===self.symbol) ? ('('+f1.toString()+')') : (('('+f1.toString()+')*') + self.symbol);
        }
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, f1;
        if ( null == self._tex )
        {
            f1 = self.factors['1'];
            if ( f1.equ(O) )
                self._tex = '0';
            else if ( f1.isReal() )
                self._tex = ('1'===self.symbol) ? f1.real().toTex() : ((f1.real().equ(Arithmetic.J) ? '-' : (f1.real().equ(Arithmetic.I) ? '' : f1.real().toTex())) + self.symbolTex);
            else
                self._tex = ('1'===self.symbol) ? ('('+f1.toTex()+')') : (('('+f1.toTex()+')') + self.symbolTex);
        }
        return self._tex;
    }
});

// Abacus.Expr, represents (symbolic) (linear) algebraic expressions of sums of (multiplicative) terms
AddTerm = Expr = Abacus.Expr = Class(Symbolic, {

    constructor: function Expr( /* args */ ) {
        var self = this, i, l,
            terms = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;

        if ( !is_instance(self, Expr) ) return new Expr(terms);

        self.terms = Obj();
        self.terms['1'] = MulTerm(1, Complex.Zero()); // constant term is default
        for(i=0,l=terms.length; i<l; i++) Expr.Merge(terms[i], self);
    }

    ,__static__: {
        Term: MulTerm

        ,Merge: function Merge( x, E ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            if ( Arithmetic.isNumber(x) || is_instance(x, Numeric) )
            {
                if ( E.terms['1'] )
                {
                    E.terms['1'] = E.terms['1'].add(x);
                }
                else
                {
                    E.terms['1'] = MulTerm(1, x);
                }
            }
            else if ( is_instance(x, [SymbolTerm, PowTerm, MulTerm]) )
            {
                if ( is_instance(x, SymbolTerm) ) x = PowTerm(x, Arithmetic.I);
                if ( is_instance(x, PowTerm) ) x = MulTerm(x, Arithmetic.I);
                if ( E.terms[x.symbol] ) E.terms[x.symbol] = E.terms[x.symbol].add(x);
                else if ( ('1' === x.symbol) || !x.factors['1'].equ(O) ) E.terms[x.symbol] = x;
                if ( '1' !== x.symbol && E.terms[x.symbol] && E.terms[x.symbol].factors['1'].equ(O) ) delete E.terms[x.symbol];
            }
            else if ( is_instance(x, [Func]) )
            {
                x = MulTerm(x, Arithmetic.I);
                if ( E.terms[x.symbol] ) E.terms[x.symbol] = E.terms[x.symbol].add(x);
                if ( '1' !== x.symbol && E.terms[x.symbol] && E.terms[x.symbol].factors['1'].equ(O) ) delete E.terms[x.symbol];
            }
            else if ( is_instance(x, [Expr, Poly]) )
            {
                if ( is_instance(x, Poly) ) x = x.toExpr();
                for(var i=0,keys=x.symbols(),l=keys.length; i<l; i++)
                    Merge(x.terms[keys[i]], E);
            }
            return E;
        }
        ,fromString: function( s ) {
            var Arithmetic = Abacus.Arithmetic, terms = [], m, coeff, symbol, n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?(?:\s*\*\s*[a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?)*)?)?/g;
            s = trim(String(s));
            while( (m=term_re.exec(s)) )
            {
                // try to do best possible match of given string of expressionl terms
                if ( !m[0].length )
                {
                    if ( term_re.lastIndex < s.length )
                    {
                        term_re.lastIndex++;
                        continue;
                    }
                    else
                    {
                        break; // match at least sth
                    }
                }
                if ( !trim(m[0]).length ) continue; // matched only spaces, continue

                if ( m[2] )
                {
                    symbol = m[2];
                    coeff = trim(m[1] || '');
                    if ( ('' === coeff) || ('+' === coeff)  ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                }
                else
                {
                    symbol = '1';
                    coeff = trim(m[1] || '');
                    if ( '+' === coeff ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                    else if ( '' === coeff ) coeff = '0';
                }
                // accept generally complex coefficients
                n = Complex.fromString(coeff);
                if ( !n || n.equ(Arithmetic.O) ) continue;
                terms.push(MulTerm(symbol, n));
            }
            return new Expr(terms);
        }

        ,cast: null // added below
    }

    ,terms: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_symb: null

    ,dispose: function( ) {
        var self = this, t;
        if ( self._n && (self._n._n===self) ) self._n._n = null;
        /*if ( self.terms )
        {
            for(t in self.terms)
                if ( HAS.call(self.terms, t) )
                    self.terms[t].dispose();
        }*/
        self.terms = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._symb = null;
        return self;
    }

    ,clone: function( ) {
        return new Expr(this.args());
    }

    ,symbols: function( ) {
        var self = this;
        if ( null == self._symb ) self._symb = KEYS(self.terms).sort();
        return self._symb;
    }
    ,args: function( ) {
        var self = this;
        return self.symbols().map(function(t){return self.terms[t];});
    }
    ,term: function( t ) {
        var self = this;
        t = String(t);
        return HAS.call(self.terms, t) ? self.terms[t] : MulTerm('1', Complex.Zero());
    }
    ,c: function( ) {
        return this.terms['1'].c();
    }
    ,isConst: function( ) {
        var self = this;
        return 1===self.symbols().length;
    }
    ,isReal: function( ) {
        var self = this, terms = self.terms, t;
        for(t in terms)
        {
            if ( !HAS.call(terms, t) ) continue;
            if ( !terms[t].isReal() ) return false;
        }
        return true;
    }
    ,isImag: function( ) {
        var self = this, terms = self.terms, t;
        for(t in terms)
        {
            if ( !HAS.call(terms, t) ) continue;
            if ( !terms[t].isImag() ) return false;
        }
        return true;
    }
    ,real: function( ) {
        var self = this;
        return Expr(self.args().map(function(t){return t.real();}));
    }
    ,imag: function( ) {
        var self = this;
        return Expr(self.args().map(function(t){return t.imag();}));
    }
    ,equ: function ( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, l, keys;
        if ( Arithmetic.isNumber(a) || is_instance(a, Numeric) )
        {
            return (1 === self.symbols().length) && self.terms['1'].equ(a);
        }
        else if ( is_instance(a, [SymbolTerm, PowTerm, MulTerm, Func]) )
        {
            if ( is_instance(a, [SymbolTerm, PowTerm, Func]) ) a = MulTerm(a, Arithmetic.I);
            return '1' === a.symbol ? ((1 === self.symbols().length) && self.terms['1'].equ(a)) : (HAS.call(self.terms, a.symbol) && (2 === self.symbols().length) && self.terms['1'].equ(O) && self.terms[a.symbol].equ(a));
        }
        else if ( is_instance(a, [Expr, Poly]) )
        {
            if ( is_instance(a, Poly) ) a = a.toExpr();
            keys = a.symbols(); l = keys.length;
            if ( self.symbols().length !== l ) return false;
            for(i=0; i<l; i++)
                if ( !HAS.call(self.terms, keys[i]) || !a.terms[keys[i]].equ(self.terms[keys[i]]) )
                    return false;
            return true;
        }
        else if ( is_instance(a, RationalExpr) )
        {
            return a.equ(self);
        }
        else if ( is_string(a) )
        {
            return (a === self.toString()) || (a === self.toTex());
        }
        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if ( is_instance(a, Poly) ) a = a.toExpr();
        if ( is_instance(a, RationalExpr) )
        {
            return a.lt(self);
        }
        else if ( is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]) )
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().gt(Arithmetic.O) : false;
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length) )
        {
            return self.c().gt(a);
        }
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if ( is_instance(a, Poly) ) a = a.toExpr();
        if ( is_instance(a, RationalExpr) )
        {
            return a.lte(self);
        }
        else if ( is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]) )
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().gte(Arithmetic.O) : false;
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length) )
        {
            return self.c().gte(a);
        }
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if ( is_instance(a, Poly) ) a = a.toExpr();
        if ( is_instance(a, RationalExpr) )
        {
            return a.gt(self);
        }
        else if ( is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]) )
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().lt(Arithmetic.O) : false;
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length) )
        {
            return self.c().lt(a);
        }
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if ( is_instance(a, Poly) ) a = a.toExpr();
        if ( is_instance(a, RationalExpr) )
        {
            return a.gte(self);
        }
        else if ( is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]) )
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().lte(Arithmetic.O) : false;
        }
        else if ( (is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length) )
        {
            return self.c().lte(a);
        }
        return false;
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = Expr(self.args().map(function(t){return t.neg();}));
            self._n._n = self;
        }
        return self._n;
    }
    ,conj: function( ) {
        var self = this;
        return Expr(self.args().map(function(t){return t.conj();}));
    }
    ,inv: function( ) {
        return RationalExpr(1, this);
    }

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, RationalExpr) ) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func, Expr, Poly]) ? Expr([self, x]) : self;
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(x) )
        {
            return self.add(Arithmetic.neg(x));
        }
        else if ( is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func, Expr, Poly]) )
        {
            if ( is_instance(x, [SymbolTerm, PowTerm, Func]) ) x = MulTerm(x, Arithmetic.I);
            return self.add(x.neg());
        }
        else if ( is_instance(x, RationalExpr) )
        {
            return x.neg().add(self);
        }
        return self;
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            symbols, symbols2;
        if ( Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func]) )
        {
            if ( is_instance(x, [SymbolTerm, PowTerm, Func]) ) x = MulTerm(x, Arithmetic.I);
            if ( self.equ(O) || ((is_instance(x, [Numeric, MulTerm])) && x.equ(O)) || (Arithmetic.isNumber(x) && Arithmetic.equ(O, x)) ) return Expr();
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].mul(x);
            }));
        }
        else if ( is_instance(x, [Expr, Poly]) )
        {
            if ( is_instance(x, Poly) ) x = x.toExpr();
            if ( self.equ(O) || x.equ(O) ) return Expr();
            symbols = self.symbols(); symbols2 = x.symbols();
            return Expr(array(symbols.length*symbols2.length, function(k){
                var i = ~~(k/symbols2.length), j = k%symbols2.length;
                return self.terms[symbols[i]].mul(x.terms[symbols2[j]]);
            }));
        }
        else if ( is_instance(x, RationalExpr) )
        {
            return x.mul(self);
        }
        return self;
    }
    ,div: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, symbols;
        if ( Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm]) )
        {
            if ( is_instance(x, [SymbolTerm, PowTerm]) ) x = MulTerm(x, Arithmetic.I);
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].div(x);
            }));
        }
        else if ( is_instance(x, RationalExpr) )
        {
            return x.inv().mul(self);
        }
        return RationalExpr(self, x);
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented

    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, pow, e;
        n = Integer.cast(n);
        if ( n.lt(O) || n.gt(MAX_DEFAULT) ) return null;
        if ( self.equ(O) ) return Expr();
        if ( n.equ(O) ) return Expr([MulTerm(1, I)]);
        if ( n.equ(I) ) return self;
        n = Arithmetic.val(n.num);
        e = self; pow = Expr([MulTerm(1, I)]);
        while( 0 !== n )
        {
            // exponentiation by squaring
            if ( n & 1 ) pow = pow.mul(e);
            n >>= 1;
            e = e.mul(e);
        }
        return pow;
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if ( self.equ(O) ) return Expr();
        if ( n.equ(O) ) return null; // undefined
        if ( n.equ(I) ) return self;
        return Expr(1===self.symbols().length ? self.terms['1'].rad(n) : MulTerm(PowTerm(self, Rational(I, n.num)), I));
    }
    ,d: function( x, n ) {
        var self = this;
        // nth order formal derivative with respect to symbol x
        if ( null == n ) n = 1;
        n = +n;
        x = String(x || 'x');
        return 0 > n ? null : Expr(self.symbols().map(function(t){return '1' === t ? Abacus.Arithmetic.O : self.terms[t].d(x, n);}));
    }
    ,evaluate: function( symbolValues ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        symbolValues = symbolValues || {};
        return self.symbols().reduce(function(r, t){
            return r.add(self.terms[t].evaluate(symbolValues));
        }, Complex.Zero());
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            keys, i, l, t, f1, out = '', prev = false;
        if ( null == self._str )
        {
            keys = self.symbols(); l = keys.length;
            for(i=0; i<l; i++)
            {
                t = self.terms[keys[i]];
                if ( t.equ(O) ) continue;
                f1 = t.c();
                out += (prev && (!f1.isReal()||f1.real().gt(O)) ? '+' : '') + t.toString();
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            keys, i, l, t, f1, out = '', prev = false;
        if ( null == self._tex )
        {
            keys = self.symbols(); l = keys.length;
            for(i=0; i<l; i++)
            {
                t = self.terms[keys[i]];
                if ( t.equ(O) ) continue;
                f1 = t.c();
                out += (prev && (!f1.isReal()||f1.real().gt(O)) ? '+' : '') + t.toTex();
                prev = true;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
});
Expr.cast = typecast([Expr], function(a){
    return is_string(a) ? Expr.fromString(a) : new Expr(a);
});

// Abacus.Rationalexpr, represents a rational function/fraction of expressions
RationalExpr = Abacus.RationalExpr = Class(Symbolic, {
    constructor: function RationalExpr( num, den ) {
        var self = this, Arithmetic = Abacus.Arithmetic;

        if ( !is_instance(self, RationalExpr) ) return new RationalExpr(num, den);

        if ( is_instance(num, RationalExpr) )
        {
            den = num.den;
            num = num.num;
        }
        else if ( is_instance(num, RationalFunc) )
        {
            den = num.den.toExpr();
            num = num.num.toExpr();
        }
        if ( null == num ) num = Expr();
        else if ( !is_instance(num, Expr) ) num = Expr(num);

        if ( null == den ) den = Expr(Arithmetic.I);
        else if ( !is_instance(den, Expr) ) den = Expr(den);

        if ( den.equ(Arithmetic.O) ) throw new Error('Zero denominator in Abacus.RationalExpr!');
        if ( num.equ(Arithmetic.O) && !den.equ(Arithmetic.I) ) den = Expr(Arithmetic.I);
        self.num = num;
        self.den = den;
    }

    ,__static__: {
        Term: Expr//AddTerm

        ,fromString: function( s ) {
            var paren = 0, braket = 0, parts = ['', ''], sign = '', is_tex = false,
                i = 0, l, c, j, num, den, space = /\s/;
            s = trim(String(s));
            if ( !s.length ) return RationalExpr();
            if ( ('-' === s.charAt(0)) || ('+' === s.charAt(0)) )
            {
                sign = s.charAt(0);
                s = trim(s.slice(1));
                if ( !s.length ) return RationalExpr();
                sign = '-' === sign ? '-' : '';
            }
            is_tex = ('\\frac' === s.slice(0, 5));
            l = s.length;
            i = is_tex ? 5 : 0;
            j = 0; // parse num
            c = s.charAt(i);
            // skip first braket if tex
            if ( is_tex && ('{' === c) )
            {
                braket++;
                i++;
            }
            while( i<l )
            {
                c = s.charAt(i++);

                if ( space.test(c) )
                {
                    // continue
                }
                else if ( '/' === c )
                {
                    if ( !is_tex && !paren && !braket &&
                        (
                        (parts[j].length && (')' === parts[j].charAt(parts[j].length-1))) ||
                        ((i<l) && ('('===s.charAt(i)))
                        )
                    )
                    {
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else if ( '(' === c )
                {
                    paren++;
                    parts[j] += c;
                }
                else if ( ')' === c )
                {
                    paren--;
                    parts[j] += c;
                    if ( !is_tex && !paren && !braket && ((i>=l) || ('/'===s.charAt(i))) )
                    {
                        if ( (i<l) && ('/'===s.charAt(i)) ) i++;
                        j = 1; // parse den
                    }
                }
                else if ( '{' === c )
                {
                    braket++;
                    parts[j] += c;
                }
                else if ( '}' === c )
                {
                    braket--;
                    if ( !paren && !braket )
                    {
                        if ( is_tex && (i<l) && ('{'===s.charAt(i)) )
                        {
                            braket++;
                            i++;
                        }
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else
                {
                    parts[j] += c;
                }
            }
            if ( paren || braket )
            {
                num = Expr.fromString(parts[0]);
                den = null;
            }
            else
            {
                if ( parts[0].length && parts[1].length && ('(' === parts[0].charAt(0)) && (')'===parts[0].charAt(parts[0].length-1)) )
                {
                    parts[0] = trim(parts[0].slice(1,-1));
                }
                if ( parts[1].length && ('(' === parts[1].charAt(0)) && (')'===parts[1].charAt(parts[1].length-1)) )
                {
                    parts[1] = trim(parts[1].slice(1,-1));
                }
                num = Expr.fromString(parts[0]);
                den = parts[1].length ? Expr.fromString(parts[1]) : null;
            }
            if ( '-' === sign ) num = num.neg();
            return new RationalExpr(num, den);
        }

        ,cast: null // added below
    }

    ,num: null
    ,den: null
    ,_str: null
    ,_tex: null

    ,dispose: function( ) {
        var self = this;
        self.num = null;
        self.den = null;
        self._str = null;
        self._tex = null;
        return self;
    }
    ,c: function( ) {
        var self = this;
        return self.num.c().div(self.den.c());
    }
    ,term: function( t ) {
        var self = this;
        return self.num.term(t);
    }
    ,isConst: function( ) {
        var self = this;
        return self.num.isConst() && self.den.isConst();
    }
    ,isReal: function( ) {
        var self = this;
        return (self.num.isReal() && self.den.isReal()) || (self.num.isImag() && self.den.isImag());
    }
    ,isImag: function( ) {
        var self = this;
        return (self.num.isReal() && self.den.isImag()) || (self.num.isImag() && self.den.isReal());
    }
    ,real: function( ) {
        var self = this;
        return RationalExpr(self.num.real(), self.den.real());
    }
    ,imag: function( ) {
        var self = this;
        return RationalExpr(self.num.imag(), self.den.imag());
    }
    ,neg: function( ) {
        var self = this;
        return RationalExpr(self.num.neg(), self.den);
    }
    ,inv: function( ) {
        var self = this;
        return RationalExpr(self.den, self.num);
    }
    ,conj: function( ) {
        var self = this;
        return RationalExpr(self.num.conj(), self.den.conj());
    }
    ,equ: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x) )
            return self.num.equ(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return self.num.mul(x.den).equ(self.den.mul(x.num));
        else if ( is_string(x) )
            return (x===self.toString()) || (x===self.toTex());
        return false;
    }
    ,gt: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x) )
            return self.num.gt(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return self.num.mul(x.den).gt(self.den.mul(x.num));
        return false;
    }
    ,gte: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x) )
            return self.num.gte(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return self.num.mul(x.den).gte(self.den.mul(x.num));
        return false;
    }
    ,lt: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x) )
            return self.num.lt(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return self.num.mul(x.den).lt(self.den.mul(x.num));
        return false;
    }
    ,lte: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x) )
            return self.num.lte(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return self.num.mul(x.den).lte(self.den.mul(x.num));
        return false;
    }

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]) )
            return RationalExpr(self.num.add(self.den.mul(x)), self.den);
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return RationalExpr(self.num.mul(x.den).add(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]) )
            return RationalExpr(self.num.sub(self.den.mul(x)), self.den);
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return RationalExpr(self.num.mul(x.den).sub(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]) )
            return RationalExpr(self.num.mul(x), self.den);
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return RationalExpr(self.num.mul(x.num), self.den.mul(x.den));
        return self;
    }
    ,div: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]) )
            return RationalExpr(self.num, self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc, RationalExpr]) )
            return RationalExpr(self.num.mul(x.den), self.den.mul(x.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function( x ) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if ( n.gt(MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n.num);
        if ( 0 > n ) { n = -n; t = num; num = den; den = t; }
        if ( 0 === n )
            return RationalExpr(Arithmetic.I);
        else if ( 1 === n )
            return RationalExpr(num, den);
        else
            return RationalExpr(num.pow(n), den.pow(n));
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) ) return self;
        return RationalExpr(self.num.rad(n), self.den.rad(n));
    }
    ,d: function( x, n ) {
        // partial rational (formal) derivative of nth order with respect to symbol x
        var self = this, num, den, d_num, d_den, Arithmetic = Abacus.Arithmetic;
        if ( null == n ) n = 1;
        n = Arithmetic.val(n);
        if ( 0 > n ) return null; // not supported
        else if ( 0 === n ) return self;
        num = self.num; den = self.den;
        while( 0<n && !num.equ(Arithmetic.O) )
        {
            d_num = num.d(x, 1).mul(den).sub(num.mul(den.d(x, 1)));
            d_den = den.pow(2);
            num = d_num; den = d_den; n--;
        }
        return RationalExpr(d_num, d_den);
    }
    ,evaluate: function( symbolValues ) {
        var self = this;
        symbolValues = symbolValues || {};
        return self.num.evaluate(symbolValues).div(self.den.evaluate(symbolValues));
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
            self._str = self.den.equ(Arithmetic.I) ? self.num.toString() : ((1===self.num.symbols().length && self.num.c().isReal() ? self.num.toString(true) : ('('+self.num.toString()+')'))+'/'+(1===self.den.symbols().length && self.den.isReal() ? self.den.toString() : ('('+self.den.toString()+')')));
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._tex )
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{'+self.num.toTex()+'}{'+self.den.toTex()+'}');
        return self._tex;
    }
});
RationalExpr.cast = typecast([RationalExpr], function(a){
    return is_string(a) ? RationalExpr.fromString(a) : new RationalExpr(a);
});

// Abacus.Op, represents an abstract mathematical operator
Op = Abacus.Op = Class({
    constructor: function Op( op ) {
        var self = this;
        if ( !is_instance(self, Op) ) return new Op(op);
        if ( is_instance(op, Op) ) op = op.op;
        self.op = String(op);
    }
    ,op: ''
    ,dispose: function( ) {
        var self = this;
        self.op = null;
        return self;
    }
    ,clone: function( ) {
        var self = this;
        return new self[CLASS](self.op);
    }
    ,evaluate: function( ) {
        return null;
    }
    ,toString: function( ) {
        return self.op;
    }
    ,toTex: function( ) {
        return this.toString();
    }
});

// Abacus.RelOp, represents a relational operator, eg =, <, >, <=, >=, <>
RelOp = Abacus.RelOp = Class(Op, {
    constructor: function RelOp( lhs, op, rhs ) {
        var self = this;
        if ( !is_instance(self, RelOp) ) return new RelOp(lhs, op, rhs);
        if ( is_instance(lhs, RelOp) )
        {
            self.lhs = lhs.lhs;
            self.op = lhs.op;
            self.rhs = lhs.rhs;
        }
        else
        {
            op = String(op||'=').toLowerCase();
            if ( null == lhs ) lhs = RationalExpr();
            if ( null == rhs ) rhs = RationalExpr();
            if ( !is_instance(lhs, [Expr, RationalExpr, Func]) ) lhs = RationalExpr(lhs);
            if ( !is_instance(rhs, [Expr, RationalExpr, Func]) ) rhs = RationalExpr(rhs);
            self.lhs = lhs;
            self.rhs = rhs;
            self.op = RelOp.OP(op)
        }
    }

    ,__static__: {
        OP: function( op ) {
            op = String(op).toLowerCase();
            if ( '<' === op || '\\lt' ===op ) op = '<';
            else if ( '>' === op || '\\gt' ===op ) op = '>';
            else if ( '>=' === op || '=>' === op || '\\le' ===op ) op = '>=';
            else if ( '<=' === op || '=<' === op || '\\ge' ===op ) op = '<=';
            else if ( '<>' === op || '!=' === op || '\\ne' ===op ) op = '<>';
            else if ( '~' === op || '\\sim' ===op ) op = '~';
            else op = '=';
            return op;
        }
        ,DUAL: function( op ) {
            op = RelOp.OP(op);
            if ( '<' === op ) return '>';
            else if ( '>' === op ) return '<';
            else if ( '>=' === op ) return '<=';
            else if ( '<=' === op ) return '>=';
            return op;
        }
        ,EQU: function( lhs, rhs ) {
            return new RelOp(lhs, '=', rhs);
        }
        ,NEQ: function( lhs, rhs ) {
            return new RelOp(lhs, '<>', rhs);
        }
        ,LT: function( lhs, rhs ) {
            return new RelOp(lhs, '<', rhs);
        }
        ,LTE: function( lhs, rhs ) {
            return new RelOp(lhs, '<=', rhs);
        }
        ,GT: function( lhs, rhs ) {
            return new RelOp(lhs, '>', rhs);
        }
        ,GTE: function( lhs, rhs ) {
            return new RelOp(lhs, '>=', rhs);
        }
        ,SIM: function( lhs, rhs ) {
            return new RelOp(lhs, '~', rhs);
        }
        ,fromString: function( s ) {
            var args = String(s).split(/\\sim|\\lt|\\gt|\\le|\\ge|\\ne|\\eq|=<|<=|>=|=>|<>|!=|<|>|=|~/gm),
                op = ['\\sim','\\lt','\\gt','\\le','\\ge','\\ne','\\eq','=<','<=','>=','=>','<>','!=','<','>','=','~'].reduce(function(op, opp){
                    var p = s.indexOf(opp);
                    if ( -1 < p && p < op[1] ) op = [opp, p];
                    return op;
                }, ['=',Infinity])[0];
            return new RelOp(RationalExpr.fromString(args[0]), op, args.length>1?RationalExpr.fromString(args[1]):RationalExpr());
        }
    }

    ,lhs: null
    ,rhs: null

    ,dispose: function( ) {
        var self = this;
        self.lhs = null;
        self.rhs = null;
        self.op = null;
        return self;
    }
    ,clone: function( ) {
        var self = this;
        return new self[CLASS](self.lhs, self.op, self.rhs);
    }
    ,equ: function( rop ) {
        var self = this;
        if ( is_instance(rop, RelOp) )
        {
            if ( self.op===rop.op && self.lhs.equ(rop.lhs) && self.rhs.equ(rop.rhs) )
                return true;
            else if ( self.op===RelOp.DUAL(rop.op) && self.lhs.equ(rop.rhs) && self.rhs.equ(rop.lhs) )
                return true;
        }
        return false;
    }
    ,neg: function( ) {
        var self = this;
        return new RelOp(self.lhs.neg(), RelOp.DUAL(self.op), self.rhs.neg());
    }
    ,add: function( term ) {
        var self = this, op = self.op;
        return new RelOp(self.lhs.add(term), op, self.rhs.add(term));
    }
    ,sub: function( term ) {
        var self = this, op = self.op;
        return new RelOp(self.lhs.sub(term), op, self.rhs.sub(term));
    }
    ,mul: function( term ) {
        var self = this, op = self.op, Arithmetic = Abacus.Arithmetic;
        if ( (Arithmetic.isNumber(term) && Arithmetic.lt(term, 0)) || (is_instance(term, Numeric) && term.lt(0)) )
            op = RelOp.DUAL(op);
        return new RelOp(self.lhs.mul(term), op, self.rhs.mul(term));
    }
    ,div: function( term ) {
        var self = this, op = self.op, Arithmetic = Abacus.Arithmetic;
        if ( (Arithmetic.isNumber(term) && Arithmetic.lt(term, 0)) || (is_instance(term, Numeric) && term.lt(0)) )
            op = RelOp.DUAL(op);
        return new RelOp(self.lhs.div(term), op, self.rhs.div(term));
    }
    ,evaluate: function( symbolValues ) {
        symbolValues = symbolValues || {};
        var self = this, op = self.op, res = false,
            lhs = self.lhs.evaluate(symbolValues), rhs = self.rhs.evaluate(symbolValues);
        if ( '>' === op ) res = lhs.gt(rhs);
        else if ( '<' === op ) res = lhs.lt(rhs);
        else if ( '>=' === op ) res = lhs.gte(rhs);
        else if ( '<=' === op ) res = lhs.lte(rhs);
        else if ( '<>' === op ) res = !lhs.equ(rhs);
        else if ( '~' === op ) res = true;
        else /*if ( '=' === op )*/ res = lhs.equ(rhs);
        return res;
    }
    ,toString: function( ) {
        var self = this, op = self.op;
        return self.lhs.toString()+' '+op+' '+self.rhs.toString();
    }
    ,toTex: function( ) {
        var self = this, op = self.op;
        if ( '>=' === op ) op = '\\ge';
        else if ( '<=' === op ) self.op = '\\le';
        else if ( '<>' === op ) self.op = '\\ne';
        else if ( '~' === op ) op = '\\sim';
        return self.lhs.toTex()+' '+op+' '+self.rhs.toTex();
    }
});

// Abacus.Func, represents a functional operator, eg min, max, exp, log, sin, cos, ..
Func = Abacus.Func = Class(Op, {
    constructor: function Func( func, args, evaluator, derivative ) {
        var self = this;
        if ( !is_instance(self, Func) ) return new Func(func, args, evaluator, derivative);
        if ( is_instance(func, Func) )
        {
            self.func = func.op;
            self.args = func.args;
            self._eval = evaluator || func._eval;
            self._deriv = derivative || func._deriv;
        }
        else
        {
            func = String(func||'').toLowerCase();
            if ( null == args || !args.length ) args = [];
            self.op = func;
            self.args = args.map(function(arg){
                if ( !is_instance(arg, [Expr, RationalExpr, Func]) ) arg = RationalExpr(arg);
                return arg;
            });
            self._eval = evaluator || null;
            self._deriv = derivative || null
        }
    }

    ,__static__: {
        MIN: function( args ) {
            return Func('min', args, nmin);
        }
        ,MAX: function( args ) {
            return Func('max', args, nmax);
        }
    }

    ,args: null
    ,_eval: null
    ,_deriv: null

    ,dispose: function( ) {
        var self = this;
        self._eval = null;
        self._deriv = null;
        self.args = null;
        self.op = null;
        return self;
    }
    ,clone: function( ) {
        var self = this;
        return new self[CLASS](self.op, self.args, self._eval, self._deriv);
    }
    ,isReal: function( ) {
        var args = self.args;
        return args.filter(function(arg){return arg.isReal();}).length===args.length;
    }
    ,isImag: function( ) {
        var args = self.args;
        return args.filter(function(arg){return arg.isImag();}).length===args.length;
    }
    ,real: function( ) {
        var self = this;
        return Func(self.op, self.args.map(function(arg){return arg.real();}), self._eval, self._deriv);
    }
    ,imag: function( ) {
        var self = this;
        return Func(self.op, self.args.map(function(arg){return arg.imag();}), self._eval, self._deriv);
    }
    ,equ: function( term ) {
        var self = this;
        if ( is_instance(term, Func) )
        {
            return self.op === term.op && self.args.filter(function(arg, i){
                return i<terms.args.length && arg.equ(term.args[i]);
            }).length === term.args.length;
        }
        return term.equ(self);
    }
    ,gt: function( term ) {
        return false;
    }
    ,gte: function( term ) {
        return false;
    }
    ,lt: function( term ) {
        return false;
    }
    ,lte: function( term ) {
        return false;
    }
    ,neg: function( ) {
        return Expr([MulTerm(this, -1)]);
    }
    ,add: function( term ) {
        return Expr([this, term]);
    }
    ,sub: function( term ) {
        return Expr([this, term.neg()]);
    }
    ,mul: function( term ) {
        return Expr([MulTerm([this, term])]);
    }
    ,div: function( term ) {
        return RationalExpr(this, term);
    }
    ,pow: function( n ) {
        return Expr([PowTerm(this, n)]);
    }
    ,rad: function( n ) {
        return Expr([PowTerm(this, Rational(n).inv())]);
    }
    ,d: function( x, n ) {
        var self = this, derivative = self._deriv, i, d;
        // nth order formal derivative with respect to symbol x
        if ( null == n ) n = 1;
        n = +n;
        x = String(x || 'x');
        if ( 0 > n && is_callable(derivative) )
        {
            d = derivative.apply(self, self.args);
            if ( 1 < n ) d = d.d(x, n-1);
            return d;
        }
        return self;
    }
    ,evaluate: function( symbolValues ) {
        symbolValues = symbolValues || {};
        var self = this, args = self.args, evaluator = self._eval;
        return is_callable(evaluator) ? evaluator.apply(self, args.map(function(arg){return arg.evaluate(symbolValues);})) : Complex.Zero();
    }
    ,toString: function( ) {
        var self = this, args = self.args, op = self.op;
        if ( ('min' === op || 'max' === op) && 1 === args.length )  return String(args[0]);
        return op+'('+args.map(String).join(',')+')';
    }
    ,toTex: function( ) {
        var self = this, args = self.args, op = self.op;
        if ( ('min' === op || 'max' === op) && 1 === args.length )  return Tex(args[0]);
        return '\\'+op+'('+args.map(Tex).join(',')+')';
    }
});

// Represents a (univariate) polynomial term with coefficient and exponent in Polynomial non-zero sparse representation
UniPolyTerm = Class({
    constructor: function UniPolyTerm( c, e, ring ) {
        var self = this;
        if ( !is_instance(self, UniPolyTerm) ) return new UniPolyTerm(c, e, ring);

        if ( is_instance(c, UniPolyTerm) ){ring = ring || c.ring; e = c.e; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        self.c = is_instance(c, [RationalFunc, RationalExpr]) ? c : self.ring.cast(c||0);
        self.e = +(e||0);
    }

    ,__static__: {
        isNonZero: function( t ) {
            return is_instance(t, UniPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function( t1, t2, full ) {
            var res = t1.e-t2.e;
            if ( (true===full) && (0===res) )
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function( t1, t2 ) {
            return UniPolyTerm.cmp(t2, t1);
        }
        ,gcd: function( t1, t2, full ) {
            return UniPolyTerm(true===full ? (!(is_instance(t1.c, [RationalFunc, RationalExpr]) || is_instance(t2.c, [RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), stdMath.min(t1.e, t2.e));
        }
        ,lcm: function( t1, t2, full ) {
            return UniPolyTerm(true===full ? (!(is_instance(t1.c, [RationalFunc, RationalExpr]) || is_instance(t2.c, [RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), stdMath.max(t1.e, t2.e));
        }
    }

    ,ring: null
    ,c: null
    ,e: null

    ,dispose: function( ) {
        var self = this;
        self.ring = null;
        self.c = null;
        self.e = null;
        return self;
    }
    ,clone: function( ) {
        return new UniPolyTerm(this);
    }
    ,cast: function( ring ) {
        var self = this;
        return ring===self.ring ? self : new UniPolyTerm(self.c, self.e, ring);
    }
    ,equ: function( term ) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? (self.c.equ(term.c) && self.e===term.e) : self.c.equ(term);
    }
    ,neg: function( ) {
        var self = this;
        return UniPolyTerm(self.c.neg(), self.e, self.ring);
    }
    ,add: function( term ) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.add(term.c), self.e, self.ring) : UniPolyTerm(self.c.add(term), self.e, self.ring);
    }
    ,sub: function( term ) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.sub(term.c), self.e, self.ring) : UniPolyTerm(self.c.sub(term), self.e, self.ring);
    }
    ,mul: function( term ) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.mul(term.c), self.e+term.e, self.ring) : UniPolyTerm(self.c.mul(term), self.e, self.ring);
    }
    ,div: function( term ) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.div(term.c), stdMath.max(0, self.e-term.e), self.ring) : UniPolyTerm(self.c.div(term), self.e, self.ring);
    }
    ,divides: function( term ) {
        var self = this;
        return (self.e <= term.e) && self.c.divides(term.c);
    }
    ,pow: function( k ) {
        var self = this;
        k = +k;
        return 1===k ? self : UniPolyTerm(self.c.pow(k), stdMath.floor(self.e*k), self.ring);
    }
    ,rad: function( k ) {
        var self = this;
        k = +k;
        return 1===k ? self : UniPolyTerm(self.c.rad(k), stdMath.max(stdMath.floor(self.e/k), stdMath.min(1, self.e)), self.ring);
    }
    ,toTerm: function( symbol, asTex, monomialOnly, asDec, precision ) {
        var t = this, e = t.e, c = t.c, term, Arithmetic = Abacus.Arithmetic;
        if ( true===asDec )
        {
            term = 0 < e ? (symbol + (1<e ? '^'+String(e) : '')) : '';
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toDec(precision)+')') : (!c.isReal() ? ('('+c.toDec(precision)+')') : c.toDec(precision))))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toDec(precision)+')' : c.toDec(precision));
        }
        else if ( true===asTex )
        {
            term = 0 < e ? (to_tex(symbol) + (1<e ? '^{'+Tex(e)+'}' : '')) : '';
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toTex()+')') : (!c.isReal() ? ('('+c.toTex()+')') : c.toTex())))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toTex()+')' : c.toTex());
        }
        else
        {
            term = 0 < e ? (symbol + (1<e ? '^'+String(e) : '')) : '';
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I)) ? ('('+c.toString()+')*') : (!c.isReal() ? ('('+c.toString()+')*') : (c.toString(true)+'*'))))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toString()+')' : c.toString());
        }
        return term;
    }
    ,toString: function( ) {
        var self = this;
        return '('+self.c.toString()+','+String(self.e)+')';
    }
});
PiecewisePolynomial = Class(Poly, {
    constructor: function PiecewisePolynomial( segments, defaultValue, symbol, ring ) {
        var self = this;
        if ( !is_instance(self, PiecewisePolynomial) ) return new PiecewisePolynomial(segments, defaultValue, symbol, ring);

        self.ring = ring || Ring.Q();
        self.symbol = symbol || 'x';
        self.segments = segments.map(function(s){
            if ( is_instance(s, Polynomial) )
            {
                s = {
                    poly: s,
                    cond: function( x, i, n ){return x.lte(self.ring.create(i+1).div(n));},
                    trans: function( x, i, n ){return x.sub(self.ring.create(i).div(n)).mul(n);}
                };
            }
            else if ( is_obj(s) )
            {
                if ( !is_instance(s.poly, Polynomial) )
                    s.poly = Polynomial([self.ring.cast(s.poly||0)], self.symbol, self.ring);
                if ( is_instance(s.cond, Numeric) )
                    s.cond = (function( x1 ){return function( x, i, n ){return x.lte(x1);};})(self.ring.cast(s.cond||0));
                else if ( !is_callable(s.cond) )
                    s.cond = function( x, i, n ){return x.lte(self.ring.create(i+1).div(n));};
                if ( is_instance(s.trans, Numeric) )
                    s.cond = (function( x1 ){return function( x, i, n ){return x.sub(x1);};})(self.ring.cast(s.trans||0));
                else if ( !is_callable(s.trans) )
                    s.trans = function( x, i, n ){return x.sub(self.ring.create(i).div(n)).mul(n);};
            }
            return s;
        });
        self.defaultValue = self.ring.cast(defaultValue || 0);
    }

    ,segments: null
    ,defaultValue: null
    ,symbol: null
    ,ring: null

    ,dispose: function( ) {
        var self = this;
        self.segments = null;
        self.defaultValue = null;
        self.symbol = null;
        self.ring = null;
        return self;
    }
    ,evaluate: function( x ) {
        var self = this, i, n = self.segments.length, s;
        x = self.ring.cast(x);
        for(i=0; i<n; i++)
        {
            s = self.segments[i];
            if ( s.cond(x, i, n) ) return s.poly.evaluate(s.trans(x, i, n));
        }
        return self.defaultvalue;
    }
    ,toString: function( ) {
        return "{\n"+this.segments.map(function(s){return s.poly.toString();}).join("\n")+"\n}";
    }
    ,toTex: function( ) {
        return "\\begin{cases} "+this.segments.map(function(s, i){return s.poly.toTex()/*+" & "+String(i)*/;}).join("\\\\")+" \\end{cases}";
    }
});

// Abacus.Polynomial, represents a (univariate) polynomial (with Rational coefficients)
// in strict **non-zero sparse** coefficient representation in decreasing exponent order
Polynomial = Abacus.Polynomial = Class(Poly, {

    constructor: function Polynomial( terms, symbol, ring ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i;

        if ( !is_instance(self, Polynomial) ) return new Polynomial(terms, symbol, ring);

        if ( is_instance(terms, [SymbolTerm, PowTerm, MulTerm]) ) terms = Expr(terms);
        if ( is_instance(terms, Expr) ) terms = Polynomial.fromExpr(terms, symbol||'x', ring||Ring.C());

        if ( is_instance(terms, MultiPolynomial) )
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || 'x');
            i = terms.symbol.indexOf(self.symbol); if ( -1===i ) i = 0;
            self.terms = terms.terms.map(function(t){
                return UniPolyTerm(t.c, t.e[i], self.ring);
            }).sort(UniPolyTerm.sortDecr).reduce(function(terms, t){
                if ( !terms.length || (terms[terms.length-1].e!==t.e) ) terms.push(t);
                else terms[terms.length-1] = terms[terms.length-1].add(t);
                return terms;
            }, []).filter(UniPolyTerm.isNonZero);
        }
        else if ( is_instance(terms, Polynomial) )
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || terms.symbol);
            self.terms = self.ring !== terms.ring ? terms.terms.map(function(t){
                return UniPolyTerm(t.c, t.e, self.ring);
            }) : terms.terms.slice();
        }
        else
        {
            self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
            self.symbol = String(symbol || 'x');

            if ( is_instance(terms, Numeric) || Arithmetic.isNumber(terms) || is_string(terms) )
            {
                terms = UniPolyTerm(terms, 0, self.ring);
            }

            // sparse coefficient representation sorted by decreasing exponents, ie coeff[0] is highest exponent
            if ( is_instance(terms, UniPolyTerm) )
            {
                self.terms = terms.c.equ(O) ? [] : [terms];
            }
            else if ( is_array(terms) || is_args(terms) )
            {
                if ( terms.length && !is_instance(terms[0], UniPolyTerm) )
                {
                    // dense representation, array with all powers
                    // convert to sparse representation in decreasing order
                    self.terms = array(terms.length, function(i){return UniPolyTerm(terms[i], i, self.ring);}).filter(UniPolyTerm.isNonZero).reverse();
                }
                else
                {
                    self.terms = is_args(terms) ? slice.call(terms) : terms;
                }
            }
            else if ( is_obj(terms) )
            {
                // sparse representation as object with keys only to existing powers
                // convert to sparse coefficient representation in decreasing order
                self.terms = KEYS(terms).map(function(e){
                    return UniPolyTerm(terms[e], e, self.ring);
                })/*.filter(UniPolyTerm.isNonZero)*/.sort(UniPolyTerm.sortDecr);
            }
            else
            {
                self.terms = [];
            }
        }
    }

    ,__static__: {
        Term: UniPolyTerm
        ,Piecewise: PiecewisePolynomial

        ,Zero: function( symbol, ring ) {
            return new Polynomial([], symbol||'x', ring||Ring.Q());
        }
        ,One: function( symbol, ring ) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.One(), symbol||'x', ring);
        }
        ,MinusOne: function( symbol, ring ) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.MinusOne(), symbol||'x', ring);
        }
        ,hasInverse: function( ) {
            return false;
        }

        ,cast: null // added below

        ,Add: function( x, P, do_sub ) {
            var Arithmetic = Abacus.Arithmetic, res, symbol;
            // O(max(n1,n2))
            if ( is_instance(x, Polynomial) )
            {
                if ( x.symbol === P.symbol )
                {
                    // O(max(n1,n2))
                    if ( x.terms.length )
                        P.terms = addition_sparse(P.terms, x.terms, UniPolyTerm, true===do_sub, P.ring);
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Add(MultiPolynomial(x, symbol, P.ring), MultiPolynomial(P, symbol, P.ring), do_sub);
                }
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                // O(1)
                x = UniPolyTerm(x, 0, P.ring);
                if ( !x.equ(Arithmetic.O) )
                {
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], UniPolyTerm, true===do_sub, P.ring) : [x];
                    P.terms = P.terms.concat(res);
                }
            }
            return P;
        }

        ,Mul: function( x, P ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, symbol;
            if ( !P.terms.length ) return P;

            if ( is_instance(x, Polynomial) )
            {
                if ( x.symbol === P.symbol )
                {
                    // O(n1*n2)
                    P.terms = x.terms.length ? multiplication_sparse(P.terms, x.terms, UniPolyTerm, P.ring) : [];
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Mul(MultiPolynomial(x, symbol, x.ring), MultiPolynomial(P, symbol, P.ring));
                }
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                // O(n)
                /*if ( Arithmetic.isNumber(x) )*/ x = P.ring.cast(x);
                if ( x.equ(O) )
                {
                    P.terms = [];
                }
                else if ( x.equ(Arithmetic.I) )
                {
                    // do nothing
                }
                else
                {
                    for(i=P.terms.length-1; i>=0; i--)
                        P.terms[i] = P.terms[i].mul(x);
                }
            }
            return P;
        }

        ,Div: function( P, x, q_and_r ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, symbol, q/*, r, d, diff, diff0*/;
            q_and_r = (true===q_and_r);

            if ( is_instance(x, Polynomial) )
            {
                if ( !x.terms.length ) throw new Error('Division by zero in Abacus.Polynomial!');
                if ( x.isConst() )
                {
                    // constant polynomial, simple numeric division
                    x = x.cc();
                    q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i){
                        return P.terms[i].div(x);
                    }), P.symbol, P.ring);
                    return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
                }
                // polynomial long division
                // TODO: make it faster
                /*r = Polynomial(P);
                diff = r.deg()-x.deg();
                if ( 0 <= diff )
                {
                    q = array(diff+1, function(){return Rational.Zero();});
                    while ( 0 <= diff )
                    {
                        diff0 = diff;
                        d = x.shift(diff);
                        q[diff] = r.lc().div(d.lc());
                        r = Polynomial.Add(Polynomial.Mul(q[diff], d), r, true);
                        diff = r.deg()-x.deg();
                        if ( (diff === diff0) ) break; // remainder won't change anymore
                    }
                }
                else
                {
                    q = [];
                }
                q = Polynomial(q, self.symbol);*/

                if ( x.symbol === P.symbol )
                {
                    // sparse polynomial reduction/long division
                    q = division_sparse(P.terms, x.terms, UniPolyTerm, q_and_r, P.ring);
                    return q_and_r ? [Polynomial(q[0], P.symbol, P.ring), Polynomial(q[1], P.symbol, P.ring)] : Polynomial(q, P.symbol, P.ring);
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Div(MultiPolynomial(P, symbol, P.ring), MultiPolynomial(x, symbol, x.ring), q_and_r);
                }
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                /*if ( Arithmetic.isNumber(x) )*/ x = P.ring.cast(x);
                if ( x.equ(O) ) throw new Error('Division by zero in Abacus.Polynomial!');
                q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i){
                    return P.terms[i].div(x);
                }), P.symbol, P.ring);
                return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
            }
            return P;
        }

        ,C: function( c, x, ring ) {
            return new Polynomial(c || Abacus.Arithmetic.O, x||'x', ring||Ring.Q());
        }

        ,gcd: polygcd
        ,xgcd: polyxgcd
        ,lcm: polylcm

        ,bezier: function( points, symbol ) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Recursive_definition
            // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
            symbol = String(symbol||'x');
            var ring = Ring.Q(), Bezier = Polynomial.Zero(symbol, ring), n, i, b0, b1, b11;
            if ( is_array(points) && points.length )
            {
                n = points.length;
                b11 = Polynomial([1, -1], symbol, ring);
                b0 = Polynomial.One(symbol, ring).shift(n-1);
                b1 = Polynomial.One(symbol, ring);
                Bezier = Bezier.add(b0.mul(ring.cast(points[n-1])));
                for(i=n-2; i>=0; i--)
                {
                    b0 = b0.shift(-1); b1 = b1.mul(b11);
                    Bezier = Bezier.add(b1.mul(b0).mul(factorial(n-1,i)).mul(ring.cast(points[i])));
                }
            }
            return Bezier;
        }

        ,bezierThrough: function( knots, symbol ) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
            // https://www.particleincell.com/2012/bezier-splines/
            // https://stackoverflow.com/questions/7715788/find-bezier-control-points-for-curve-passing-through-n-points
            symbol = String(symbol||'x');
            var ring = Ring.Q(), i, computePoints, points, segments;
            computePoints = function( knots ) {
                var i, p1, p2, a, b, c, r, m, n = knots.length-1;
                p1 = new Array(n);
                p2 = new Array(n);

                /*rhs vector*/
                a = new Array(n);
                b = new Array(n);
                c = new Array(n);
                r = new Array(n);

                /*left most segment*/
                a[0] = ring.Zero();
                b[0] = ring.create(2);
                c[0] = ring.One();
                r[0] = knots[0].add(knots[1].mul(2));

                /*internal segments*/
                for(i=1; i<n-1; i++)
                {
                    a[i] = ring.One();
                    b[i] = ring.create(4);
                    c[i] = ring.One();
                    r[i] = knots[i].mul(4).add(knots[i+1].mul(2));
                }

                /*right segment*/
                a[n-1] = ring.create(2);
                b[n-1] = ring.create(7);
                c[n-1] = ring.Zero();
                r[n-1] = knots[n-1].mul(8).add(knots[n]);

                /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
                for(i=1; i<n; i++)
                {
                    m = a[i].div(b[i-1]);
                    b[i] = b[i].sub(m.mul(c[i - 1]));
                    r[i] = r[i].sub(m.mul(r[i-1]));
                }

                p1[n-1] = r[n-1].div(b[n-1]);
                for(i=n-2; i>=0; --i)
                    p1[i] = r[i].sub(c[i].mul(p1[i+1])).div(b[i]);

                /*we have p1, now compute p2*/
                for (i=0;i<n-1;i++)
                    p2[i] = knots[i+1].mul(2).sub(p1[i+1]);
                p2[n-1] = knots[n].add(p1[n-1]).div(2);

                return [p1, p2];
            };
            if ( is_array(knots) && knots.length )
            {
                knots = ring.cast(knots);
                if ( 1 === knots.length )
                {
                    segments = [Polynomial(knots[0], symbol, ring)];
                }
                else if ( 2 === knots.length )
                {
                    segments = [Polynomial.bezier([knots[0], knots[1]], symbol)];
                }
                else
                {
                    segments = [];
                    points = computePoints(knots);
                    for(i=0; i<knots.length-1; i++)
                        segments.push(Polynomial.bezier([knots[i], points[0][i], points[1][i], knots[i+1]], symbol));
                }
                return Polynomial.Piecewise(segments, 0, symbol, ring);
            }
            return Polynomial.Piecewise([Polynomial.Zero(symbol, ring)], 0, symbol, ring);
        }

        ,fromValues: function( v, x, ring ) {
            // https://en.wikipedia.org/wiki/Lagrange_polynomial
            // https://en.wikipedia.org/wiki/Newton_polynomial
            ring = ring || Ring.Q();
            var I = ring.One(), n, d, f, vi, hash, dupl;
            x = String(x || 'x');
            if ( !v || !v.length ) return Polynomial([], x, ring);
            if ( is_args(v) ) v = slice.call(v);
            if ( !is_array(v[0]) ) v = [v];
            v = v.map(function(vi){
                return [ring.cast(vi[0]), ring.cast(vi[1])];
            });
            // check and filter out duplicate values
            hash = Obj(); dupl = [];
            for(n=0; n<v.length; n++)
            {
                vi = v[n][0].toString();
                if ( !HAS.call(hash, vi) ) hash[vi] = n;
                else if ( !v[hash[vi]][1].equ(v[n][1]) ) return null; // no polynomial exists
                else dupl.push(n); // duplicate value to be removed
            }
            // remove duplicate values
            while(dupl.length) v.splice(dupl.pop(), 1);
            hash = null; dupl = null; n = v.length;

            // Set-up denominators
            d = array(n, function( j ){
                var i, dj = I;
                for(i=0; i<n; i++)
                {
                    if ( i===j ) continue;
                    dj = dj.mul(v[j][0].sub(v[i][0]));
                }
                dj = v[j][1].div(dj);
                return dj;
            });
            // Set-up numerator factors
            f = array(n, function( i ){
                return Polynomial([v[i][0].neg(), I], x, ring);
            });
            // Produce each Lj in turn, and sum into p
            return operate(function(p, j){
                return Polynomial.Add(operate(function(Lj, i){
                    if ( j !== i ) Lj = Polynomial.Mul(f[i], Lj);
                    return Lj;
                }, Polynomial(d[j], x, ring), null, 0, n-1), p);
            }, Polynomial.Zero(x, ring), null, 0, n-1);
        }

        ,fromExpr: function( e, x, ring ) {
            if ( !is_instance(e, Expr) ) return null;
            ring = ring || Ring.Q();
            x = String(x || 'x');
            var symbols = e.symbols(), i, s, tc, O = Abacus.Arithmetic.O, terms = {};
            for(i=symbols.length-1; i>=0; i--)
            {
                s = symbols[i]; tc = e.terms[s].c();
                if ( tc.equ(O) ) continue;
                if ( ('1' === s) )
                    terms['0'] = tc;
                else if ( (x === s) )
                    terms['1'] = tc;
                else if ( (s.length > x.length+1) && (x+'^' === s.slice(0, x.length+1)) && (-1===s.indexOf('*')) )
                    terms[s.slice(x.length+1)] = tc;
            }
            return new Polynomial(terms, x, ring);
        }
        ,fromString: function( s, symbol, ring ) {
            var Arithmetic = Abacus.Arithmetic, terms = {}, _symbol = null, m, coeff, exp, sym, n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?)(?:\^\{?(\d+)\}?)?)?/g;
            ring = ring || Ring.Q();
            s = trim(String(s)); if ( !s.length ) return Polynomial.Zero(symbol||'x', ring);
            while( (m=term_re.exec(s)) )
            {
                // try to do best possible match of given string of polynomial terms
                if ( !m[0].length )
                {
                    if ( term_re.lastIndex < s.length )
                    {
                        term_re.lastIndex++;
                        continue;
                    }
                    else
                    {
                        break; // match at least sth
                    }
                }
                if ( !trim(m[0]).length ) continue; // matched only spaces, continue

                if ( m[2] )
                {
                    sym = m[2];
                    if ( -1 !== (i=sym.indexOf('_')) )
                    {
                        if ( '{' === sym.charAt(i+1) && '}' === sym.charAt(sym.length-1) )
                            sym = sym.slice(0,i+1)+sym.slice(i+2,-1);
                    }
                    if ( symbol && (sym !== symbol) )
                    {
                        continue; // does not belong to same polynomial, has different symbol
                    }
                    else if ( !symbol )
                    {
                        if ( null == _symbol )
                        {
                            _symbol = sym;
                        }
                        else if ( sym !== _symbol )
                        {
                            continue; // does not belong to same polynomial, has different symbol
                        }
                    }
                    exp = m[3] || '1';
                    coeff = trim(m[1] || '');
                    if ( ('' === coeff) || ('+' === coeff)  ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                }
                else
                {
                    exp = '0';
                    coeff = trim(m[1] || '');
                    if ( '+' === coeff ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                    else if ( '' === coeff ) coeff = '0';
                }
                i = 0;
                while(i<exp.length && ('0'===exp.charAt(i))) i++;
                if ( 0<i ) exp = i<exp.length ? exp.slice(i) : '0';
                n = Complex.fromString(coeff);
                terms[exp] = terms[exp] ? terms[exp].add(n) : n;
            }
            operate(function(_, exp){
                terms[exp] = ring.cast(terms[exp]);
                if ( terms[exp].equ(Arithmetic.O) ) delete terms[exp];
            }, null, KEYS(terms));
            return new Polynomial(terms, symbol || _symbol, ring);
        }
    }

    ,terms: null
    ,symbol: null
    ,ring: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_expr: null
    ,_prim: null
    ,_roots: null
    ,_factors: null

    ,dispose: function( ) {
        var self = this;
        if ( self._n && (self._n._n===self) )
        {
            self._n._n = null;
        }
        if ( self._c && (self._c._c===self) )
        {
            self._c._c = null;
        }
        self.terms = null;
        self.symbol = null;
        self.ring = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._c = null;
        self._expr = null;
        self._prim = null;
        self._roots = null;
        self._factors = null;
        return self;
    }

    ,isInt: function( ) {
        // has integer coefficients
        var self = this, terms = self.terms, i;
        if ( is_class(self.ring.NumberClass, Integer) ) return true;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isInt() ) return false;
        return true;
    }
    ,isReal: function( ) {
        // has real coefficients
        var self = this, terms = self.terms, i;
        if ( !is_class(self.ring.NumberClass, Complex) ) return true;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isReal() ) return false;
        return true;
    }
    ,isImag: function( ) {
        // has imaginary coefficients
        var self = this, terms = self.terms, i;
        if ( !is_class(self.ring.NumberClass, Complex) ) return false;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isImag() ) return false;
        return true;
    }
    ,isMono: function( ) {
        // is monomial
        var terms = this.terms;
        return (1===terms.length) && (0!==terms[0].e);
    }
    ,isConst: function( ) {
        return 0===this.deg();
    }
    ,isUni: function( x, strict ) {
        var self = this;
        x = String(x||'x');
        if ( self.symbol !== x ) return false;
        return true===strict ? (0!==self.deg()) : true;
    }
    ,deg: function( ) {
        // polynomial degree
        var terms = this.terms;
        return terms.length ? terms[0].e : 0;
    }
    ,maxdeg: function( ) {
        // maximum polynomial degree
        return this.deg();
    }
    ,mindeg: function( ) {
        // minimum polynomial degree
        var terms = this.terms;
        //return terms.length ? (0===terms[terms.length-1].e ? (1<terms.length ? terms[terms.length-2].e : 0) : terms[terms.length-1].e) : 0;
        return terms.length ? terms[terms.length-1].e : 0;
    }
    ,term: function( i, as_degree ) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if ( true===as_degree )
            return Polynomial(terms.reduce(function(matched, t){return i===t.e ? [t] : matched;}, []), symbol, ring);
        return Polynomial(0<=i && i<terms.length ? [terms[i]] : [], symbol, ring);
    }
    ,ltm: function( asPoly ) {
        // leading term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if ( true===asPoly ) return Polynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : UniPolyTerm(0, 0, ring);
    }
    ,ttm: function( asPoly ) {
        // tail/last term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if ( true===asPoly ) return Polynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
        return terms.length ? terms[terms.length-1] : UniPolyTerm(0, 0, ring);
    }
    ,lm: function( ) {
        // leading monomial
        return this.ltm(false).e;
    }
    ,lc: function( ) {
        // leading coefficient
        return this.ltm(false).c;
    }
    ,tm: function( ) {
        // tail monomial
        return this.ttm(false).e;
    }
    ,tc: function( ) {
        // tail coefficient
        return this.ttm(false).c;
    }
    ,cc: function( ) {
        // constant coefficient
        var terms = this.terms;
        return terms.length && (0===terms[terms.length-1].e) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function( ) {
        // alias of cc()
        return this.cc();
    }
    ,monic: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if ( lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O) ) return self;
        if ( self.ring.isField() )
        {
            return Polynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring);
        }
        else
        {
            divides = true; t = self.terms;
            for(i=t.length-1; i>0; i--)
            {
                if ( !lc.divides(t[i].c) )
                {
                    divides = false;
                    break;
                }
            }
            // at least make positive
            return divides ? Polynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring) : (lc.lt(Arithmetic.O) ? self.neg() : self);
        }
    }
    ,primitive: function( and_content ) {
        // factorise into content and primitive part
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials#Primitive_part%E2%80%93content_factorization
        var self = this, symbol = self.symbol, ring = self.ring, field = ring.associatedField(), terms = self.terms,
            Arithmetic = Abacus.Arithmetic, coeffp, LCM, content, isReal, isImag;
        if ( null == self._prim )
        {
            if ( !terms.length )
            {
                self._prim = [self, field.One()];
            }
            else if ( is_class(ring.NumberClass, Complex) )
            {
                    isReal = self.isReal(); isImag = self.isImag();
                    if ( !isReal && !isImag )
                    {
                        content = ring.gcd(terms.map(function(t){return t.c;})).simpl();
                        self._prim = [Polynomial(terms.map(function(t){return UniPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
                    }
                    else if ( isImag )
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.imag().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).imag().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
                    }
                    else
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.real().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).real().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                    }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.den);}, Arithmetic.I);
                coeffp = terms.map(function(t){return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                // make positive lead
                if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                {
                    coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true===and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function( ) {
        var p = this.primitive(true);
        return p[1];
    }
    ,roots: function( ) {
        // find all rational roots, if any
        // https://en.wikipedia.org/wiki/Rational_root_theorem
        // https://en.wikipedia.org/wiki/Gauss%27s_lemma_(polynomial)
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            roots, primitive, c, p, d0, dn, iter, comb, root, nroot, rm, nrm, found;

        if ( null == self._roots )
        {
            roots = [];
            // no rational roots or infinite roots for constant polynomials,
            // no rational roots for strictly complex polynomials
            if ( !self.isConst() && (self.isImag() || self.isReal()) )
            {
                primitive = self.primitive();
                c = primitive.terms;
                if( 0<c[c.length-1].e )
                {
                    roots.push([Rational.Zero(), c[c.length-1].e]); // zero root with multiplicity
                }
                if ( 1<c.length )
                {
                    // try all possible rational divisors of c_0(excluding trivial zero terms) and c_n
                    /*if ( primitive.isImag() ) // this never happens for primitive as imaginary unit "i" has been factored out unto content
                    {
                        iter = divisors(c[c.length-1].c.imag().num, true);
                        d0 = iter.get(); iter.dispose();
                        iter = divisors(c[0].c.imag().num, true);
                        dn = iter.get(); iter.dispose();
                    }
                    else
                    {*/
                        iter = divisors(is_class(ring.NumberClass, Complex) ? c[c.length-1].c.real().num : c[c.length-1].c.num, true);
                        d0 = iter.get(); iter.dispose();
                        iter = divisors(is_class(ring.NumberClass, Complex) ? c[0].c.real().num : c[0].c.num, true);
                        dn = iter.get(); iter.dispose();
                    /*}*/

                    iter = Tensor([d0.length, dn.length]);
                    while(iter.hasNext())
                    {
                        comb = iter.next();
                        // positive root
                        root = Rational(d0[comb[0]], dn[comb[1]]).simpl();
                        // negative root
                        nroot = Rational(Arithmetic.neg(d0[comb[0]]), dn[comb[1]]).simpl();
                        rm = 0; nrm = 0;
                        p = primitive; found = true;
                        while( found && (0<p.deg()) )
                        {
                            found = false;
                            // try positive root
                            if ( p.evaluate(root).equ(O) )
                            {
                                rm++; // count multiplicity
                                found = true;
                            }
                            // try negative root
                            if ( p.evaluate(nroot).equ(O) )
                            {
                                nrm++; // count multiplicity
                                found = true;
                            }
                            if ( found ) p = p.d(); // get derivative to check if roots are multiple
                        }
                        if ( 0<rm ) roots.push([root, rm]);
                        if ( 0<nrm ) roots.push([nroot, nrm]);
                    }
                    iter.dispose();
                }
            }
            self._roots = roots;
        }
        return self._roots.map(function(r){return r.slice();});
    }
    ,factors: function( ) {
        // factorise polynomial over Integers/Rationals if factorisable
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials
        var p = this, ring = p.ring, symbol = p.symbol, Arithmetic = Abacus.Arithmetic,
            constant, factors, factor, root, i, n, m, remainder, roots;
        if ( null == p._factors )
        {
            remainder = p.primitive(true);
            roots = p.roots();
            constant = remainder[1];
            remainder = remainder[0];
            factors = [];
            if ( roots.length )
            {
                for(i=0,n=roots.length; i<n; i++)
                {
                    root = roots[i];
                    // use integer coefficients
                    factor = Polynomial([Arithmetic.neg(root[0].num), root[0].den], symbol, ring);
                    factors.push([factor, root[1]]);
                    remainder = remainder.div(factor.pow(root[1]));
                }
                // normalise remainder to have integer coefficients, if not already
                if ( !is_class(ring.NumberClass, Complex) || remainder.isReal()/* || remainder.isImag()*/ )
                {
                    if ( is_class(ring.NumberClass, Integer) )
                    {
                        m = Arithmetic.I;
                    }
                    /*else if ( remainder.isImag() )
                    {
                        m = lcm(remainder.terms.map(function(t){return t.c.imag().den;}));
                    }*/
                    else
                    {
                        m = lcm(remainder.terms.map(is_class(ring.NumberClass, Complex) ? function(t){return t.c.real().den;} : function(t){return t.c.den;}));
                    }
                    if ( !Arithmetic.equ(Arithmetic.I, m) )
                    {
                        constant = constant.div(m);
                        remainder = remainder.mul(m);
                    }
                }
                if ( 0 < remainder.deg() ) factors.push([remainder, 1]);
                else constant = constant.mul(remainder.cc());
            }
            if ( !factors.length ) factors.push([remainder, 1]);
            p._factors = [factors, constant];
        }
        return [p._factors[0].slice(), p._factors[1]];
    }
    ,equ: function( p ) {
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if ( Arithmetic.isNumber(p) )
        {
            return Arithmetic.equ(O, p) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===t[0].e));
        }
        else if ( is_instance(p, Numeric) )
        {
            return p.equ(O) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===t[0].e));
        }
        else if ( is_instance(p, Polynomial) )
        {
            tp = p.terms;
            if ( t.length !== tp.length ) return false;
            for(i=t.length-1; i>=0; i--)
                if ( !t[i].equ(tp[i]) )
                    return false;
            return true;
        }
        else if ( is_instance(p, [MultiPolynomial, RationalFunc]) )
        {
            return p.equ(self);
        }
        else if ( is_instance(p, [SymbolTerm, PowTerm, MulTerm]) )
        {
            if ( is_instance(p, [SymbolTerm, PowTerm]) ) p = MulTerm(p);
            if ( 1 < t.length ) return false;
            else if ( 0 === t.length ) return p.c().equ(O);
            s = t[0].toTerm(self.symbol); if ( !s.length ) s = '1';
            return (s === p.symbol) && p.c().equ(t[0].c);
        }
        else if ( is_instance(p, Expr) )
        {
            return self.toExpr().equ(p);
        }
        else if ( is_string(p) )
        {
            return (p === self.toString()) || (p === self.toTex());
        }
        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return !self.isConst() || self.cc().gt(a);
        }
        else if ( is_instance(a, Polynomial) )
        {
            return 0<UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [RationalFunc, MultiPolynomial]) )
        {
            return a.lt(self);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().gt(a);
        }
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return !self.isConst() || self.cc().gte(a);
        }
        else if ( is_instance(a, Polynomial) )
        {
            return 0<=UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [RationalFunc, MultiPolynomial]) )
        {
            return a.lte(self);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().gte(a);
        }
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return self.isConst() && self.cc().lt(a);
        }
        else if ( is_instance(a, Polynomial) )
        {
            return 0>UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [RationalFunc, MultiPolynomial]) )
        {
            return a.gt(self);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().lt(a);
        }
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return self.isConst() && self.cc().lte(a);
        }
        else if ( is_instance(a, Polynomial) )
        {
            return 0>=UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [RationalFunc, MultiPolynomial]) )
        {
            return a.gte(self);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().lte(a);
        }
        return false;
    }

    ,real: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
        {
            return Polynomial(self.terms.map(function(t){
                return UniPolyTerm(t.c.real(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return self;
        }
    }
    ,imag: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
        {
            return Polynomial(self.terms.map(function(t){
                return UniPolyTerm(t.c.imag(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return Polynomial([], self.symbol, ring);
        }
    }
    ,abs: function( ) {
        var self = this;
        return self.lc().lt(Abacus.Arithmetic.O) ? self.neg() : self;
    }
    ,conj: function( ) {
        var self = this, ring = self.ring;
        if ( null == self._c )
        {
            if ( is_class(ring.NumberClass, Complex) )
            {
                self._c = Polynomial(self.terms.map(function(t){
                    return UniPolyTerm(t.c.conj(), t.e, ring);
                }), self.symbol, ring);
                self._c._c = self;
            }
            else
            {
                self._c = self;
            }
        }
        return self._c;
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = Polynomial(array(self.terms.length, function(i){return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().add(x);
        else if ( is_instance(x, [RationalFunc, MultiPolynomial]) ) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Add(x, self.clone()) : self;
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().sub(x);
        else if ( is_instance(x, [RationalFunc, MultiPolynomial]) ) return x.neg().add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Add(x, self.clone(), true) : self;
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().mul(x);
        else if ( is_instance(x, [RationalFunc, MultiPolynomial]) ) return x.mul(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Mul(x, self.clone()) : self;
    }
    ,div: function( x, q_and_r ) {
        var self = this;
        if ( is_instance(x, RationalFunc) ) return RationalFunc(MultiPolynomial(self, x.num.symbol, x.num.ring)).div(x);
        else if ( is_instance(x, MultiPolynomial) ) return MultiPolynomial(self, x.symbol, x.ring).div(x, q_and_r);
        return is_instance(x, [Polynomial, Numeric]) || Abacus.Arithmetic.isNumber(x) ? Polynomial.Div(self, x, true===q_and_r) : self;
    }
    ,multidiv: function( xs, q_and_r ) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true===q_and_r);
        if ( is_instance(xs, Polynomial) ) xs = [xs];
        if ( !xs || !xs.length ) return q_and_r ? [[], self] : [];

        n = xs.length;
        qs = array(n, function(){return [];});
        r = [];
        p = self.clone();
        while( p.terms.length/*!p.equ(Arithmetic.O)*/ )
        {
            // Try to divide by a polynomial.
            plt = p.ltm(); divides = false;
            for(i=0; i<n; i++)
            {
                xlt = xs[i].ltm();
                if ( xlt.divides(plt) )
                {
                    divides = true;
                    break;
                }
                // If the terms were not divisible, try the next polynomial.
            }
            if ( divides )
            {
                // Perform the division.
                t = plt.div(xlt);
                qs[i] = addition_sparse(qs[i], [t], UniPolyTerm, false, p.ring);
                p.terms = addition_sparse(p.terms, xs[i].terms.map(function(xt){return xt.mul(t);}), UniPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if ( q_and_r ) r = addition_sparse(r, [plt], UniPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi){return Polynomial(qi, p.symbol, p.ring);});
        return q_and_r ? [qs, Polynomial(r, p.symbol, p.ring)] : qs;
    }
    ,mod: function( x ) {
        var qr = this.div(x, true);
        return qr[1];
    }
    ,multimod: function( xs ) {
        var qr = this.multidiv(xs, true);
        return qr[1];
    }
    ,divmod: function( x ) {
        return this.div(x, true);
    }
    ,multidivmod: function( xs ) {
        return this.multidiv(xs, true);
    }
    ,divides: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( self.equ(Arithmetic.O) ) return false;
        if ( is_instance(a, RationalFunc) ) return true;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
            a = Polynomial(a, self.symbol, self.ring);
        if ( is_instance(a, Poly) )
            return a.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n.num);
        if ( 0 === n )
        {
            return Polynomial.One(self.symbol, self.ring);
        }
        else if ( 1 === n )
        {
            return self;
        }
        else if ( 2 === n )
        {
            return Polynomial.Mul(self, self.clone());
        }
        else
        {
            // exponentiation by squaring
            pow = Polynomial.One(self.symbol, self.ring);
            b = self.clone();
            while ( 0 !== n )
            {
                if ( n & 1 ) pow = Polynomial.Mul(b, pow);
                n >>= 1;
                b = Polynomial.Mul(b, b);
            }
            return pow;
        }
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) ) return self;
        return polykthroot(self, n);
    }
    ,compose: function( q ) {
        // functionaly compose one polynomial with another. ie result = P(Q(x))
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, pq, t, i, j;
        if ( is_instance(q, MulTerm) ) q = Expr(q);
        if ( is_instance(q, Expr) ) q = Polynomial.fromExpr(q, self.symbol, self.ring);
        if ( Arithmetic.isNumber(q) || is_instance(q, Numeric) )
        {
            return Polynomial(self.evaluate(q), self.symbol, self.ring);
        }
        else if ( is_instance(q, Polynomial) )
        {
            // Composition through variation of Horner's algorithm for fast evaluation
            // also check http://andy.novocin.com/pro/polycomp_CASC2011.pdf
            if ( !self.terms.length ) return Polynomial.Zero(q.symbol, self.ring);
            if ( 0 === self.deg() ) return Polynomial(self.terms.slice(), q.symbol, self.ring);
            if ( 0 === q.deg() ) return Polynomial(self.evaluate(q.cc()), q.symbol, self.ring);
            t = self.terms;
            i = t[0].e; pq = Polynomial(t[0].c, q.symbol, self.ring); j = 1;
            while(0<i)
            {
                i--; pq = Polynomial.Mul(q, pq);
                if ( j<t.length && i===t[j].e ) pq = Polynomial.Add(t[j++].c, pq);
            }
            return pq;
        }
        return self;
    }
    ,shift: function( s ) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, Arithmetic = Abacus.Arithmetic;
        s = Arithmetic.val(s);
        if ( 0 === s )
            return self;
        else if ( 0 > s ) // division by monomial x^|s|
            return Polynomial(self.terms.map(function(term){
                return term.e < -s ? null : UniPolyTerm(term.c, term.e+s, self.ring);
            }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
        //else if ( 0 < s ) // multiplication by monomial x^s
        return Polynomial(self.terms.map(function(term){
            return UniPolyTerm(term.c, term.e+s, self.ring);
        }), self.symbol, self.ring);
    }
    ,d: function( n ) {
        // polynomial (formal) derivative of nth order
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( null == n ) n = 1;
        n = +n;
        if ( 0 > n ) return null; // not supported
        else if ( 0 === n ) return self;
        if ( 0 === self.terms.length ) return self;
        return n >= self.terms[0].e ? Polynomial.Zero(self.symbol, self.ring) : Polynomial(self.terms.map(function(term){
            if ( n > term.e ) return null;
            for(var c=Arithmetic.I,j=term.e; j+n>term.e; j--) c = Arithmetic.mul(c, j);
            return UniPolyTerm(term.c.mul(c), term.e-n, self.ring);
        }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
    }
    ,polarForm: function( u ) {
        // http://graphics.stanford.edu/courses/cs164-09-spring/Handouts/handout19.pdf
        // http://resources.mpi-inf.mpg.de/departments/d4/teaching/ss2010/geomod/slides_public/08_Blossoming_Polars.pdf
        u = String(u||'u');
        var self = this, ring = self.ring.associatedField(), n = self.deg(), symbol = array(n, function(i){return u+'_'+(i+1);});
        return self.terms.reduce(function(polar, term){
            if ( !term.e ) return polar;
            var combinations = Combination(n, term.e), k = combinations.total();
            return combinations.get().reduce(function(polar, comb){
                return polar.add(MultiPolynomial(MultiPolyTerm(ring.cast(term.c).div(k), array(n, function(i){return -1 === comb.indexOf(i) ? 0 : 1;})), symbol, ring));
            }, polar);
        }, MultiPolynomial(MultiPolyTerm(self.cc(), array(n, 0)), symbol, ring));
    }
    ,evaluate: function( x ) {
        // Horner's algorithm for fast evaluation
        // https://en.wikipedia.org/wiki/Horner%27s_method
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, i, j, v;
        if ( !t.length ) return ring.Zero();
        if ( !is_instance(x, Numeric) && !Arithmetic.isNumber(x) && is_obj(x) ) x = x[self.symbol];
        x = x || O;
        //x = ring.cast(x);
        i = t[0].e; v = t[0].c; j = 1;
        while(0<i)
        {
            i--; v = v.mul(x);
            if ( j<t.length && i===t[j].e ) v = t[j++].c.add(v);
        }
        return v;
    }
    ,toString: function( ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
        {
            t = self.terms; x = self.symbol;
            for(i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x);
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if ( null == self._tex )
        {
            t = self.terms; x = self.symbol;
            for(i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, true);
                prev = true;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
    ,toDec: function( precision ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        t = self.terms; x = self.symbol;
        for(i=0,l=t.length; i<l; i++)
        {
            ti = t[i];
            out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
            prev = true;
        }
        if ( !out.length )
        {
            out = '0';
            if ( is_number(precision) && 0<precision ) out += '.'+(new Array(precision+1).join('0'));
        }
        return out;
    }
    ,toExpr: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t, x, i, terms, term;
        if ( null == self._expr )
        {
            x = self.symbol; t = self.terms; terms = [];
            for(i=t.length-1; i>=0; i--)
            {
                term = t[i].toTerm(x, false, true);
                terms.push(MulTerm(term.length ? term : '1', t[i].c));
            }
            if ( !terms.length ) terms.push(MulTerm(1, O));
            self._expr = Expr(terms);
        }
        return self._expr;
    }
});
Polynomial.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = String(symbol || 'x');
    var type_cast = typecast(function(a){
        return is_instance(a, Polynomial) && (a.ring===ring);
    }, function(a){
        return is_string(a) ? Polynomial.fromString(a, symbol, ring) : new Polynomial(a, symbol, ring);
    });
    return type_cast(a);
};

// Represents a multivariate polynomial term with coefficient and exponents in Polynomial non-zero sparse representation
MultiPolyTerm = Class({
    constructor: function MultiPolyTerm( c, e, ring ) {
        var self = this;
        if ( !is_instance(self, MultiPolyTerm) ) return new MultiPolyTerm(c, e, ring);

        if ( is_instance(c, MultiPolyTerm) ){ring = ring || c.ring; e = c.e.slice(); c = c.c;}
        else if ( is_instance(c, UniPolyTerm) ){ring = ring || c.ring; e = [c.e]; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        if ( is_instance(c, MultiPolynomial) && (c.ring.NumberClass!==self.ring.NumberClass) && !is_class(c.ring.NumberClass, Complex) &&
            is_class(c.ring.NumberClass, [Integer, Rational]) && is_class(self.ring.NumberClass, [Rational, Complex]) )
        {
                c = MultiPolynomial(c, c.symbol, self.ring);
        }
        self.c = is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) ? c : self.ring.cast(c||0);
        self.e = is_array(e) ? e : [+(e||0)];
    }

    ,__static__: {
        isNonZero: function( t ) {
            return is_instance(t, MultiPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function( t1, t2, full ) {
            function cmp_exp_i( e1, e2, i ) {
                if ( i >= e1.length && i >= e2.length )
                    return 0;
                else if ( i >= e2.length )
                    return 0===e1[i] ? cmp_exp_i(e1, e2, i+1) : e1[i];
                else if ( i >= e1.length )
                    return 0===e2[i] ? cmp_exp_i(e1, e2, i+1) : -e2[i];
                else if ( e1[i]===e2[i] )
                    return cmp_exp_i(e1, e2, i+1);
                return e1[i]-e2[i];
            };

            if ( (is_array(t1)||is_args(t1)) && (is_array(t2)||is_args(t2)) ) return cmp_exp_i(t1, t2, 0);

            var res = cmp_exp_i(t1.e, t2.e, 0);
            if ( (true===full) && (0===res) )
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function( t1, t2 ) {
            return MultiPolyTerm.cmp(t2, t1);
        }
        ,gcd: function( t1, t2, full ) {
            return MultiPolyTerm(true===full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc, RationalExpr]) || is_instance(t2.c, [MultiPolynomial, RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), array(stdMath.max(t1.e.length, t2.e.length), function(i){
                return i<t1.e.length && i<t2.e.length ? stdMath.min(t1.e[i], t2.e[i]) : 0;
            }));
        }
        ,lcm: function( t1, t2, full ) {
            return MultiPolyTerm(true===full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc, RationalExpr]) || is_instance(t2.c, [MultiPolynomial, RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), array(stdMath.max(t1.e.length, t2.e.length), function(i){
                return i<t1.e.length && i<t2.e.length ? stdMath.max(t1.e[i], t2.e[i]) : (i<t1.e.length ? t1.e[i] : t2.e[i]);
            }));
        }
    }

    ,ring: null
    ,c: null
    ,e: null

    ,dispose: function( ) {
        var self = this;
        self.ring = null;
        self.c = null;
        self.e = null;
        return self;
    }
    ,clone: function( ) {
        return new MultiPolyTerm(this);
    }
    ,cast: function( ring ) {
        var self = this;
        return ring===self.ring ? self : new MultiPolyTerm(self.c, self.e, ring);
    }
    ,equ: function( term ) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? 0===MultiPolyTerm.cmp(self, term, true) : self.c.equ(term);
    }
    ,neg: function( ) {
        var self = this;
        return MultiPolyTerm(self.c.neg(), self.e.slice(), self.ring);
    }
    ,add: function( term ) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.add(term.c), self.e.slice(), self.ring) : MultiPolyTerm(self.c.add(term), self.e.slice(), self.ring);
    }
    ,sub: function( term ) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.sub(term.c), self.e.slice(), self.ring) : MultiPolyTerm(self.c.sub(term), self.e.slice(), self.ring);
    }
    ,mul: function( term ) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.mul(term.c), array(stdMath.max(self.e.length, term.e.length), function(i){
            return i<self.e.length && i<term.e.length ? self.e[i]+term.e[i] : (i<term.e.length ? term.e[i] : self.e[i]);
        }), self.ring) : MultiPolyTerm(self.c.mul(term), self.e.slice(), self.ring);
    }
    ,div: function( term ) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.div(term.c), array(stdMath.max(self.e.length, term.e.length), function(i){
            return i<self.e.length && i<term.e.length ? stdMath.max(0, self.e[i]-term.e[i]) : (i<term.e.length ? 0 : self.e[i]);
        }), self.ring) :  MultiPolyTerm(self.c.div(term), self.e.slice(), self.ring);
    }
    ,divides: function( term ) {
        var self = this, e1 = self.e, e2 = term.e, i, n = stdMath.max(e1.length, e2.length);
        if ( !self.c.divides(term.c) ) return false;
        for(i=0; i<n; i++)
        {
            if ( i >= e1.length )
            {
                break;
            }
            else if ( i >= e2.length )
            {
                if ( 0 < e1[i] ) return false;
            }
            else if ( e1[i] > e2[i] )
            {
                return false;
            }
        }
        return true;
    }
    ,pow: function( k ) {
        var self = this;
        k = +k;
        return 1===k ? self : MultiPolyTerm(self.c.pow(k), array(self.e.length, function(i){return stdMath.floor(self.e[i]*k);}), self.ring);
    }
    ,rad: function( k ) {
        var self = this;
        k = +k;
        return 1===k ? self : MultiPolyTerm(self.c.rad(k), array(self.e.length, function(i){return stdMath.max(stdMath.floor(self.e[i]/k), stdMath.min(1, self.e[i]));}), self.ring);
    }
    ,toTerm: function( symbol, asTex, monomialOnly, asDec, precision ) {
        var t = this, e = t.e, c = t.c, term, Arithmetic = Abacus.Arithmetic;
        if ( true===asDec )
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1<e[i] ? '^'+String(e[i]) : '')) : monom;
            }, '');
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toDec(precision)+')') : (!c.isReal() ? ('('+c.toDec(precision)+')') : c.toDec(precision))))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toDec(precision)+')' : c.toDec(precision));
        }
        else if ( true===asTex )
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + to_tex(sym) + (1<e[i] ? '^{'+Tex(e[i])+'}' : '')) : monom;
            }, '');
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toTex()+')') : (!c.isReal() ? ('('+c.toTex()+')') : c.toTex())))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toTex()+')' : c.toTex());
        }
        else
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1<e[i] ? '^'+String(e[i]) : '')) : monom;
            }, '');
            if ( true===monomialOnly ) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? ('('+c.toString()+')*') : (!c.isReal() ? ('('+c.toString()+')*') : (c.toString(true)+'*'))))) + term) : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? '('+c.toString()+')' : c.toString());
        }
        return term;
    }
    ,toString: function( ) {
        var self = this;
        return '('+self.c.toString()+',['+self.e.join(',')+'])';
    }
});
// Abacus.MultiPolynomial, represents a multivariate polynomial in sparse representation
MultiPolynomial = Abacus.MultiPolynomial = Class(Poly, {

    constructor: function MultiPolynomial( terms, symbol, ring ) {
        var self = this, Arithmetic = Abacus.Arithmetic, index;

        if ( !is_instance(self, MultiPolynomial) ) return new MultiPolynomial(terms, symbol, ring);

        if ( is_instance(terms, [SymbolTerm, PowTerm, MulTerm]) ) terms = Expr(terms);
        if ( is_instance(terms, Expr) ) terms = MultiPolynomial.fromExpr(terms, symbol||['x'], ring||Ring.C());

        if ( is_instance(terms, MultiPolynomial) )
        {
            self.ring = ring || terms.ring;
            self.symbol = symbol || terms.symbol;
            self.terms = (self.ring !== terms.ring) || (self.symbol.length !== terms.symbol.length) ? terms.terms.map(function(t){
                return MultiPolyTerm(t.c, self.symbol.length <= terms.symbol.length ? t.e.slice(0, self.symbol.length) : t.e.concat(array(self.symbol.length-terms.symbol.length, 0)), self.ring);
            }) : terms.terms.slice();
            self._rsym = terms._rsym ? terms._rsym.slice() : null;
        }
        else if ( is_instance(terms, Polynomial) )
        {
            self.ring = ring || terms.ring;
            self.symbol = is_array(symbol) && symbol.length ? symbol : [terms.symbol];
            index = self.symbol.indexOf(terms.symbol); if ( -1 === index ) index = 0;
            self.terms = terms.terms.map(function(t){
                return MultiPolyTerm(t.c, array(self.symbol.length, function(i){return i===index ? t.e : 0;}), self.ring);
            });
        }
        else
        {
            self.ring = is_instance(ring, Ring) ? ring : Ring.Q();

            symbol = symbol || 'x';
            if ( !is_array(symbol) ) symbol = [String(symbol)];
            else if ( !symbol.length ) symbol = ['x'];
            self.symbol = symbol;

            if ( is_instance(terms, Numeric) || Arithmetic.isNumber(terms) || is_string(terms) )
            {
                terms = MultiPolyTerm(terms, array(self.symbol.length, 0), self.ring);
            }

            if ( is_instance(terms, MultiPolyTerm) )
            {
                self.terms = terms.equ(Arithmetic.O) ? [] : [terms];
            }
            else if ( is_array(terms) || is_args(terms) )
            {
                if ( is_args(terms) ) terms = slice.call(terms);

                if ( terms.length && !is_instance(terms[0], MultiPolyTerm) )
                {
                    self.terms = terms.map(function(c, e){
                        return MultiPolyTerm(c, array(self.symbol.length, function(i){return 0===i ? e : 0;}), self.ring);
                    }).filter(MultiPolyTerm.isNonZero).reverse();
                }
                else
                {
                    self.terms = terms;
                }
            }
            else if ( is_obj(terms) )
            {
                self.terms = KEYS(terms).map(function(k){
                    var e = array(self.symbol.length, 0),
                        c = terms[k], factors = k.split('*'),
                        i, l, ind, mono, symbol, exp;
                    for(i=0,l=factors.length; i<l; i++)
                    {
                        mono = trim(factors[i]);
                        if ( !mono.length || ('1' === mono) )
                        {
                            // constant, do nothing
                        }
                        else
                        {
                            if ( -1 !== (ind=mono.indexOf('^')) )
                            {
                                symbol = mono.slice(0, ind);
                                exp = parseInt(mono.slice(ind+1), 10);
                            }
                            else
                            {
                                symbol = mono;
                                exp = 1;
                            }
                            ind = self.symbol.indexOf(symbol);
                            e[-1===ind?0:ind] = exp;
                        }
                    }
                    return MultiPolyTerm(c, e, self.ring);
                }).sort(MultiPolyTerm.sortDecr);
            }
            else
            {
                self.terms = [];
            }
        }
    }

    ,__static__: {
        Term: MultiPolyTerm

        ,Zero: function( symbol, ring ) {
            return new MultiPolynomial([], symbol||['x'], ring||Ring.Q());
        }
        ,One: function( symbol, ring ) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.One(), symbol||['x'], ring);
        }
        ,MinusOne: function( symbol, ring ) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.MinusOne(), symbol||['x'], ring);
        }

        ,hasInverse: function( ) {
            return false;
        }
        ,cast: null // added below

        ,gcd: polygcd
        ,xgcd: polyxgcd
        ,lcm: polylcm

        ,Add: function( x, P, do_sub, recur ) {
            var Arithmetic = Abacus.Arithmetic, res, rsym;
            if ( is_instance(x, Polynomial) ) x = MultiPolynomial(x, P.symbol, P.ring);

            if ( is_instance(x, MultiPolynomial) )
            {
                // O(max(n1,n2))
                if ( x.terms.length )
                {
                    recur = (true===recur);
                    if ( recur )
                    {
                        rsym = P._rsym;
                        P = P.recur(false);
                        x = x.recur(false);
                    }
                    P.terms = addition_sparse(P.terms, x.terms, MultiPolyTerm, true===do_sub, P.ring);
                    if ( recur && rsym ) P = P.recur(rsym);
                }
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                // O(1)
                x = MultiPolyTerm(x, array(P.symbol.length, 0), P.ring);
                if ( !x.equ(Arithmetic.O) )
                {
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], MultiPolyTerm, true===do_sub, P.ring) : [x];
                    P.terms = P.terms.concat(res);
                }
            }
            return P;
        }

        ,Mul: function( x, P, recur ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, rsym;
            if ( !P.terms.length ) return P;

            if ( is_instance(x, Polynomial) )
                x = MultiPolynomial(x, P.symbol, P.ring);

            if ( is_instance(x, MultiPolynomial) )
            {
                // O(n1*n2)
                if ( x.terms.length )
                {
                    recur = (true===recur);
                    if ( recur )
                    {
                        rsym = P._rsym;
                        P = P.recur(false);
                        x = x.recur(false);
                    }
                    P.terms = multiplication_sparse(P.terms, x.terms, MultiPolyTerm, P.ring);
                    if ( recur && rsym ) P = P.recur(rsym);
                }
                else
                {
                    P.terms = [];
                }
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                // O(n)
                /*if ( Arithmetic.isNumber(x) )*/ x = P.ring.cast(x);
                if ( x.equ(O) )
                {
                    P.terms = [];
                }
                else if ( x.equ(Arithmetic.I) )
                {
                    // do nothing
                }
                else
                {
                    for(i=P.terms.length-1; i>=0; i--)
                        P.terms[i] = P.terms[i].mul(x);
                }
            }
            return P;
        }

        ,Div: function( P, x, q_and_r, recur ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, rsym, q/*, r, d, diff, diff0*/;
            q_and_r = (true===q_and_r);

            if ( is_instance(x, Polynomial) ) x = MultiPolynomial(x, P.symbol, P.ring);

            if ( is_instance(x, MultiPolynomial) )
            {
                if ( !x.terms.length ) throw new Error('Division by zero in Abacus.MultiPolynomial!');

                recur = (true===recur);
                if ( recur ) x = x.recur(false); // convert to flat representation
                if ( x.isConst() )
                {
                    // constant polynomial, simple numeric division
                    x = x.cc();
                    q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i){
                        return P.terms[i].div(x);
                    }), P.symbol, P.ring);
                    return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
                }
                // sparse polynomial reduction/long division
                if ( recur )
                {
                    rsym = P._rsym;
                    P = P.recur(false);
                }
                q = division_sparse(P.terms, x.terms, MultiPolyTerm, q_and_r, P.ring);
                q = q_and_r ? [MultiPolynomial(q[0], P.symbol, P.ring), MultiPolynomial(q[1], P.symbol, P.ring)] : MultiPolynomial(q, P.symbol, P.ring);
                if ( recur && rsym )
                {
                    if ( q_and_r ) { q[0] = q[0].recur(rsym); q[1] = q[1].recur(rsym); }
                    else q = q.recur(rsym);
                }
                return q;
            }
            else if ( is_instance(x, Numeric) || Arithmetic.isNumber(x) )
            {
                /*if ( Arithmetic.isNumber(x) )*/ x = P.ring.cast(x);
                if ( x.equ(O) ) throw new Error('Division by zero in Abacus.MultiPolynomial!');
                q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i){
                    return P.terms[i].div(x);
                }), P.symbol, P.ring);
                return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
            }
            return P;
        }

        ,C: function( c, x, ring ) {
            return new MultiPolynomial(c || Abacus.Arithmetic.O, x||['x'], ring||Ring.Q());
        }

        ,fromExpr: function( e, x, ring ) {
            if ( !is_instance(e, Expr) ) return null;
            ring = ring || Ring.Q();
            x = x || ['x'];
            var symbols = e.symbols(), i, s, tc, O = Abacus.Arithmetic.O, terms = {};
            for(i=symbols.length-1; i>=0; i--)
            {
                s = symbols[i]; tc = e.terms[s].c();
                if ( tc.equ(O) ) continue;
                terms[s] = tc;
            }
            return new MultiPolynomial(terms, x, ring);
        }
        ,fromString: function( s, symbol, ring ) {
            var Arithmetic = Abacus.Arithmetic, terms = {}, m, mm, coeff, sym, found_symbols = [], n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?(?:\s*\*?\s*[a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?)*)?)?/g,
                monomial_re = /([a-zA-Z])(?:_\{?(\d+)\}?)?(?:\^\{?(\d+)\}?)?/g, monomials, ms, me, term;
            ring = ring || Ring.Q();
            s = trim(String(s)); if ( !s.length ) return MultiPolynomial.Zero(symbol||['x'], ring);
            while( (m=term_re.exec(s)) )
            {
                // try to do best possible match of given string of expressionl terms
                if ( !m[0].length )
                {
                    if ( term_re.lastIndex < s.length )
                    {
                        term_re.lastIndex++;
                        continue;
                    }
                    else
                    {
                        break; // match at least sth
                    }
                }
                if ( !trim(m[0]).length ) continue; // matched only spaces, continue

                if ( m[2] )
                {
                    sym = m[2];
                    coeff = trim(m[1] || '');
                    if ( ('' === coeff) || ('+' === coeff)  ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                    monomials = {};
                    // split each monomial symbol from combined term
                    while( (mm=monomial_re.exec(sym)) )
                    {
                        ms = mm[1]+(mm[2]?('_'+mm[2]):'');
                        me = mm[3] ? parseInt(mm[3], 10) : 1;
                        if ( 0 === me )
                        {
                            monomials['1'] = 0;
                        }
                        else
                        {
                            if ( symbol && (-1===symbol.indexOf(ms)) ) continue;
                            if ( !symbol && (-1===found_symbols.indexOf(ms)) ) found_symbols.push(ms);
                            monomials[ms] = HAS.call(monomials, ms) ? (monomials[ms]+me) : me;
                        }
                    }
                    if ( HAS.call(monomials, '1') && (1<KEYS(monomials).length) ) delete monomials['1'];
                }
                else
                {
                    sym = '1';
                    coeff = trim(m[1] || '');
                    if ( '+' === coeff ) coeff = '1';
                    else if ( '-' === coeff ) coeff = '-1';
                    else if ( '' === coeff ) coeff = '0';
                    monomials = {};
                    monomials[sym] = 0;
                }
                n = Complex.fromString(coeff);
                term = operate(function(term, sym){
                    return term + (term.length ? '*' : '') + sym + (1<monomials[sym] ? ('^'+String(monomials[sym])) : '');
                }, '', KEYS(monomials).sort());
                if ( term.length ) terms[term] = HAS.call(terms, term) ? terms[term].add(n) : n;
            }
            operate(function(_, term){
                terms[term] = ring.cast(terms[term]);
                if ( terms[term].equ(Arithmetic.O) ) delete terms[term];
            }, null, KEYS(terms));
            return new MultiPolynomial(terms, symbol || found_symbols.sort(), ring);
        }
    }

    ,terms: null
    ,symbol: null
    ,ring: null
    ,_n: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_expr: null
    ,_prim: null
    ,_flat: null
    ,_recur: null
    ,_rsym: null

    ,dispose: function( ) {
        var self = this;
        self.terms = null;
        self.symbol = null;
        self.ring = null;
        if ( self._n && (self===self._n._n) )
        {
            self._n._n = null;
        }
        if ( self._c && (self===self._c._c) )
        {
            self._c._c = null;
        }
        self._n = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._expr = null;
        self._prim = null;
        self._flat = null;
        self._recur = null;
        self._rsym = null;
        return self;
    }
    ,isInt: function( ) {
        // has integer coefficients
        var self = this, terms = self.terms, i;
        if ( is_class(self.ring.NumberClass, Integer) ) return true;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isInt() ) return false;
        return true;
    }
    ,isReal: function( ) {
        // has real coefficients
        var self = this, terms = self.terms, i;
        if ( !is_class(self.ring.NumberClass, Complex) ) return true;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isReal() ) return false;
        return true;
    }
    ,isImag: function( ) {
        // has imaginary coefficients
        var self = this, terms = self.terms, i;
        if ( !is_class(self.ring.NumberClass, Complex) ) return false;
        for(i=terms.length-1; i>=0; i--)
            if ( !terms[i].c.isImag() ) return false;
        return true;
    }
    ,isMono: function( ) {
        // is monomial
        var terms = this.terms;
        return (1===terms.length) && ((!is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isMono()) && 0!==MultiPolyTerm.cmp(terms[0].e, [0]));
    }
    ,isConst: function( recur ) {
        var terms = this.terms;
        recur = (true===recur);
        return (0===terms.length) || ((1===terms.length) && ((!recur || !is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isConst(recur)) && 0===MultiPolyTerm.cmp(terms[0].e, [0])));
    }
    ,isUni: function( x, strict ) {
        // is univariate on symbol x
        var self = this, terms = self.terms, index, e, i, d;
        index = self.symbol.indexOf(String(x||'x'));
        if ( -1 === index ) return false;
        strict = (true===strict); d = 0;
        for(i=terms.length-1; i>=0; i--)
        {
            e = terms[i].e;
            d = stdMath.max(d, e[index]);
            if ( 0!==MultiPolyTerm.cmp(e.slice(0, index).concat(e.slice(index+1)), [0]) )
                return false;
        }
        return strict ? (0!==d) : true;
    }
    ,isRecur: function( strict ) {
        // is recursive, has coefficients that are multipolynomials on rest variables
        //return (null!=this._rsym) && (0<this._rsym.length);
        strict = false!==strict;
        var terms = this.terms, i;
        for(i=terms.length-1; i>=0; i--)
            if ( is_instance(terms[i].c, MultiPolynomial) && (strict || !terms[i].c.isConst(true)) ) return true;
        return false;
    }
    ,deg: function( x, recur ) {
        // polynomial degree
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if ( arguments.length )
        {
            recur = (true===recur);
            index = symbol.indexOf(String(x||'x'));
            return (-1 === index) || !terms.length ? 0 : (recur && is_instance(term[0].c, MultiPolynomial) ? (terms[0].e[index]+term[0].c.deg(x, recur)) : terms[0].e[index]);
        }
        return terms.length ? terms[0].e : array(symbol.length, 0);
    }
    ,maxdeg: function( x, recur ) {
        // polynomial maximum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true===recur);
        if ( arguments.length && (true===x) )
        {
            return operate(function(max, xi){
                return stdMath.max(max, self.maxdeg(xi));
            }, 0, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x||'x')) : 0;
        if ( (-1 === index) || !terms.length ) return 0;
        x = symbol[index];
        return operate(function(max, t){
            if ( recur && is_instance(t.c, MultiPolynomial) )
                return stdMath.max(max, t.e[index], t.e[index]+t.c.maxdeg(x, recur));
            else
                return stdMath.max(max, t.e[index]);
        }, 0, terms);
    }
    ,mindeg: function( x, recur ) {
        // polynomial minimum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true===recur);
        if ( arguments.length && (true===x) )
        {
            return operate(function(min, xi){
                return -1 === min ? self.mindeg(xi, recur) : stdMath.min(min, self.mindeg(xi, recur));
            }, -1, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x||'x')) : 0;
        if ( (-1 === index) || !terms.length ) return 0;
        x = symbol[index];
        return operate(function(min, t){
            var deg = t.e[index]+(recur && is_instance(t.c, MultiPolynomial) ? t.c.mindeg(x, recur) : 0);
            return -1===min ? deg : stdMath.min(min, deg);
        }, -1, terms);
    }
    ,term: function( i, as_degree ) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if ( true===as_degree )
            return terms.reduce(function(matched, t){
                // amtch all terms which have i as aggregate degree
                if ( i===t.e.reduce(addn, 0) )
                    matched = matched.add(MultiPolynomial([t], symbol, ring));
                return matched;
            }, MultiPolynomial.Zero(symbol, ring));
        return MultiPolynomial(0<=i && i<terms.length ? [terms[i]] : [], symbol, ring);
    }
    ,ltm: function( asPoly, x ) {
        // leading term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if ( 1 < arguments.length )
        {
            index = symbol.indexOf(String(x||'x'));
            if ( (-1 === index) || !terms.length ) return true===asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(max, t){
                if ( (null == max) || (max.e[index] < t.e[index]) ) max = t;
                return max;
            }, null, terms);
            return true===asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if ( true===asPoly ) return MultiPolynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : MultiPolyTerm(0, array(symbol.length, 0), ring);
    }
    ,ttm: function( asPoly, x ) {
        // tail/last term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if ( 1 < arguments.length )
        {
            index = symbol.indexOf(String(x||'x'));
            if ( (-1 === index) || !terms.length ) return true===asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(min, t){
                if ( (null == min) || (min.e[index] > t.e[index]) ) min = t;
                return min;
            }, null, terms);
            return true===asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if ( true===asPoly ) return MultiPolynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
        return terms.length ? terms[terms.length-1] : MultiPolyTerm(0, array(symbol.length, 0), ring);
    }
    ,lm: function( x ) {
        // leading monomial (per symbol)
        var self = this, lt = arguments.length ? self.ltm(false, x) : self.ltm(false);
        return lt.e;
    }
    ,lc: function( x ) {
        // leading coefficient (per symbol)
        var self = this, lt = arguments.length ? self.ltm(false, x) : self.ltm(false);
        return lt.c;
    }
    ,tm: function( x ) {
        // tail monomial (per symbol)
        var self = this, tt = arguments.length ? self.ttm(false, x) : self.ttm(false);
        return tt.e;
    }
    ,tc: function( x ) {
        // tail coefficient (per symbol)
        var self = this, tt = arguments.length ? self.ttm(false, x) : self.ttm(false);
        return tt.c;
    }
    ,cc: function( ) {
        // constant coefficient
        var terms = this.terms;
        return terms.length && (0===MultiPolyTerm.cmp(terms[terms.length-1].e, [0])) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function( ) {
        // alias of cc()
        return this.cc();
    }
    ,recur: function( x ) {
        var self = this, terms = self.terms, symbol = self.symbol, ring = self.ring,
            Arithmetic = Abacus.Arithmetic, index, maxdeg, pr, c = null;
        if ( false === x )
        {
            // make non-recursive
            if ( null == self._flat )
            {
                self._flat = (1 >= symbol.length) || !self.isRecur() ? self : operate(function(p, t){
                    return p._add(is_instance(t.c, MultiPolynomial) ? MultiPolynomial([MultiPolyTerm(ring.One(), t.e, ring)], symbol, ring)._mul(t.c.recur(false)) : MultiPolynomial([t], symbol, ring));
                }, MultiPolynomial.Zero(symbol, ring), terms);
                self._flat._rsym = null;
                self._flat._flat = self._flat;
            }
            return self._flat;
        }
        else if ( true === x )
        {
            // make recursive on all variables succesively
            if ( null == self._recur )
            {
                self._recur = 1 >= symbol.length ? self : operate(function(p, x){return p.recur(x);}, self.recur(false), symbol);
                self._recur._flat = self.recur(false);
                self._recur._recur = self._recur;
            }
            return self._recur;
        }
        else if ( is_array(x) )
        {
            return operate(function(p, xi){return p.recur(xi);}, self, x);
        }
        else if ( x )
        {
            // make recursive on/group by symbol x
            // idempotent if is already grouped on x
            if ( 1 >= symbol.length ) return self;
            x = String(x||'x'); index = symbol.indexOf(x);
            if ( (-1 === index) || (self._rsym && (-1 !== self._rsym.indexOf(x))) ) return self;
            /*if ( self.isUni(x) )
            {
                self._rsym = (self._rsym||[]).concat(x);
                return self;
            }*/
            maxdeg = self.maxdeg(x, true)
            if ( 0 === maxdeg )
            {
                self._rsym = (self._rsym||[]).concat(x);
                return self;
            }
            pr = MultiPolynomial(operate(function(terms, t){
                var e = t.e[index], i = maxdeg-e, tt, p;
                if ( is_instance(t.c, MultiPolynomial) )
                {
                    /*if ( (0 < e) && (0 < t.c.maxdeg(x, true)) )
                    {
                        // messed up, try to regroup
                        tt = t.clone();
                        tt.e[index] = 0;
                        tt.c = t.c.mul(MultiPolynomial([t], symbol, ring)).recur(x);
                        p = MultiPolynomial([tt], symbol, ring);
                    }
                    else */if ( t.c.isUni(x) )
                    {
                        // recursive on same
                        p = MultiPolynomial([t], symbol, ring);
                    }
                    else
                    {
                        // recursive on other
                        tt = t.clone();
                        tt.c = t.c.recur(x);
                        tt.e[index] = 0;
                        p = MultiPolynomial([tt], symbol, ring);
                    }
                }
                else if ( 0 !== e )
                {
                    tt = t.clone();
                    tt.e[index] = 0;
                    p = MultiPolynomial([tt], symbol, ring);
                }
                else
                {
                    p = MultiPolynomial([t], symbol, ring);
                }
                // group by same power/exponent of recursive symbol
                // put them directly in reverse order to avoid reversing later on
                terms[i] = terms[i] ? terms[i]._add(p) : p;
                return terms;
            }, new Array(maxdeg+1), terms).map(function(t, e){
                return t.equ(Arithmetic.O) ? null : MultiPolyTerm(t, array(symbol.length, function(i){return index===i ? maxdeg-e : 0;}));
            }).filter(MultiPolyTerm.isNonZero), symbol, ring);
            while ( pr.isConst() && is_instance(c=pr.cc(), MultiPolynomial) ) pr = c;
            if ( c === pr ) pr = pr.clone(); // copy it to avoid mutating existing poly
            pr._rsym = (self._rsym||[]).concat(x);
            return pr;
        }
        return self;
    }
    ,monic: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if ( lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O) || is_instance(lc, MultiPolynomial) ) return self;
        if ( self.ring.isField() )
        {
            return MultiPolynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring);
        }
        else
        {
            divides = true; t = self.terms;
            for(i=t.length-1; i>0; i--)
            {
                if ( !lc.divides(t[i].c) )
                {
                    divides = false;
                    break;
                }
            }
            // at least make positive
            return divides ? MultiPolynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring) : (lc.lt(Arithmetic.O) ? self.neg() : self);
        }
    }
    ,primitive: function( and_content ) {
        // factorise into content and primitive part
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials#Primitive_part%E2%80%93content_factorization
        var self = this, symbol = self.symbol, ring = self.ring, field = ring.associatedField(), terms = self.terms,
            Arithmetic = Abacus.Arithmetic, coeffp, LCM, content, isReal, isImag;
        if ( null == self._prim )
        {
            if ( !terms.length )
            {
                self._prim = [self, field.One()];
            }
            else if ( self.isRecur() )
            {
                coeffp = terms.reduce(function(coeffp, t){
                    coeffp.push(is_instance(t.c, MultiPolynomial) ? t.c.primitive(true) : [MultiPolynomial([t], symbol, ring), field.One()]);
                    return coeffp;
                }, []);
                content = field.gcd(coeffp.map(function(c){return c[1];}));
                self._prim = [MultiPolynomial(coeffp.map(function(c, i){
                    return MultiPolyTerm(c[0].mul(ring.cast(c[1].div(content))), terms[i].e, ring);
                }), symbol, ring), content];
            }
            else if ( is_class(ring.NumberClass, Complex) )
            {
                    isReal = self.isReal(); isImag = self.isImag();
                    if ( !isReal && !isImag )
                    {
                        content = ring.gcd(terms.map(function(t){return t.c;})).simpl();
                        self._prim = [MultiPolynomial(terms.map(function(t){return MultiPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
                    }
                    else if ( isImag )
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.imag().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).imag().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
                    }
                    else
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.real().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).real().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                    }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.den);}, Arithmetic.I);
                coeffp = terms.map(function(t){return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                // make positive lead
                if ( Arithmetic.gt(Arithmetic.O, coeffp[0]) )
                {
                    coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true===and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function( ) {
        var p = this.primitive(true);
        return p[1];
    }
    ,equ: function( p, strict ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if ( Arithmetic.isNumber(p) )
        {
            return Arithmetic.equ(O, p) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if ( is_instance(p, Numeric) )
        {
            return p.equ(O) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if ( is_instance(p, Poly) )
        {
            strict = (false!==strict);
            p = is_instance(p, Polynomial) ? MultiPolynomial(p, self.symbol, self.ring).terms : p;
            if ( !strict )
            {
                t = self.recur(false).terms;
                p = p.recur(false);
            }
            tp = p.terms;
            if ( t.length !== tp.length ) return false;
            for(i=t.length-1; i>=0; i--)
                if ( !t[i].equ(tp[i]) )
                    return false;
            return true;
        }
        else if ( is_instance(p, RationalFunc) )
        {
            return p.equ(self);
        }
        else if ( is_instance(p, [SymbolTerm, PowTerm, MulTerm]) )
        {
            if ( is_instance(p, [SymbolTerm, PowTerm]) ) p = MulTerm(p);
            if ( 1 < t.length ) return false;
            else if ( 0 === t.length ) return p.c().equ(O);
            s = t[0].toTerm(self.symbol); if ( !s.length ) s = '1';
            return (s === p.symbol) && p.c().equ(t[0].c);
        }
        else if ( is_instance(p, Expr) )
        {
            return self.toExpr().equ(p);
        }
        else if ( is_string(p) )
        {
            return (p === self.toString()) || (p === self.toTex());
        }
        return false;
    }
    ,gt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return !self.isConst(true) || self.cc().gt(a);
        }
        else if ( is_instance(a, RationalFunc) )
        {
            return a.lt(self);
        }
        else if ( is_instance(a, Poly) )
        {
            if ( is_instance(a, Polynomial) ) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0<MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().gt(a);
        }
        return false;
    }
    ,gte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return !self.isConst(true) || self.cc().gte(a);
        }
        else if ( is_instance(a, RationalFunc) )
        {
            return a.lte(self);
        }
        else if ( is_instance(a, Poly) )
        {
            if ( is_instance(a, Polynomial) ) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0<=MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().gte(a);
        }
        return false;
    }
    ,lt: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return self.isConst(true) && self.cc().lt(a);
        }
        else if ( is_instance(a, RationalFunc) )
        {
            return a.gt(self);
        }
        else if ( is_instance(a, Poly) )
        {
            if ( is_instance(a, Polynomial) ) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0>MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().lt(a);
        }
        return false;
    }
    ,lte: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(a, Numeric) || Arithmetic.isNumber(a) )
        {
            return self.isConst(true) && self.cc().lte(a);
        }
        else if ( is_instance(a, RationalFunc) )
        {
            return a.gte(self);
        }
        else if ( is_instance(a, Poly) )
        {
            if ( is_instance(a, Polynomial) ) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0>=MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if ( is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]) )
        {
            return self.toExpr().lte(a);
        }
        return false;
    }

    ,real: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
        {
            return MultiPolynomial(self.terms.map(function(t){
                return MultiPolyTerm(t.c.real(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return self;
        }
    }
    ,imag: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
        {
            return MultiPolynomial(self.terms.map(function(t){
                return MultiPolyTerm(t.c.imag(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return MultiPolynomial([], self.symbol, ring);
        }
    }
    ,abs: function( ) {
        var self = this;
        return self.lc().lt(Abacus.Arithmetic.O) ? self.neg() : self;
    }
    ,conj: function( ) {
        var self = this, ring = self.ring;
        if ( null == self._c )
        {
            if ( is_class(ring.NumberClass, Complex) )
            {
                self._c = MultiPolynomial(self.terms.map(function(t){
                    return MultiPolyTerm(t.c.conj(), t.e, ring);
                }), self.symbol, ring);
                self._c._c = self;
            }
            else
            {
                self._c = self;
            }
        }
        return self._c;
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = MultiPolynomial(array(self.terms.length, function(i){return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().add(x);
        else if ( is_instance(x, RationalFunc) ) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Add(x, self.clone(), false, true) : self;
    }
    ,_add: function( x ) {
        // add as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Add(x, self.clone(), false, false) : self.add(x);
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().sub(x);
        else if ( is_instance(x, RationalFunc) ) return x.neg().add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Add(x, self.clone(), true, true) : self;
    }
    ,_sub: function( x ) {
        // sub as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Add(x, self.clone(), true, false) : self.sub(x);
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm]) ) return self.toExpr().mul(x);
        else if ( is_instance(x, RationalFunc) ) return x.mul(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Mul(x, self.clone(), true) : self;
    }
    ,_mul: function( x ) {
        // mul as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Mul(x, self.clone(), false) : self.mul(x);
    }
    ,div: function( x, q_and_r ) {
        var self = this;
        if ( is_instance(x, RationalFunc) ) return RationalFunc(self).div(x);
        else if ( is_instance(x, [Numeric, Poly]) || Abacus.Arithmetic.isNumber(x) )
            return MultiPolynomial.Div(self, x, true===q_and_r, true);
        return self;
    }
    ,_div: function( x, q_and_r ) {
        // div as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Div(self, x, true===q_and_r, false) : self.div(x, q_and_r);
    }
    ,multidiv: function( xs, q_and_r ) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, rsym = self._rsym, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true===q_and_r);
        if ( is_instance(xs, MultiPolynomial) ) xs = [xs];
        if ( !xs || !xs.length ) return q_and_r ? [[], self] : [];

        n = xs.length;
        qs = array(n, function(){return [];});
        r = [];
        p = self.recur(false).clone();
        xs = xs.map(function(xi){return xi.recur(false);});
        while( p.terms.length/*!p.equ(Arithmetic.O)*/ )
        {
            // Try to divide by a polynomial.
            plt = p.ltm(); divides = false;
            for(i=0; i<n; i++)
            {
                xlt = xs[i].ltm();
                if ( xlt.divides(plt) )
                {
                    divides = true;
                    break;
                }
                // If the terms were not divisible, try the next polynomial.
            }
            if ( divides )
            {
                // Perform the division.
                t = plt.div(xlt);
                qs[i] = addition_sparse(qs[i], [t], MultiPolyTerm, false, p.ring);
                p.terms = addition_sparse(p.terms, xs[i].terms.map(function(xt){return xt.mul(t);}), MultiPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if ( q_and_r ) r = addition_sparse(r, [plt], MultiPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi){
            qi = MultiPolynomial(qi, p.symbol, p.ring);
            if ( rsym ) qi = qi.recur(rsym);
            return qi;
        });
        if ( q_and_r )
        {
            r = MultiPolynomial(r, p.symbol, p.ring);
            if ( rsym ) r = r.recur(rsym);
        }
        return q_and_r ? [qs, r] : qs;
    }
    ,mod: function( x ) {
        var qr = this.div(x, true);
        return qr[1];
    }
    ,_mod: function( x ) {
        var qr = this._div(x, true);
        return qr[1];
    }
    ,multimod: function( xs ) {
        var qr = this.multidiv(xs, true);
        return qr[1];
    }
    ,divmod: function( x ) {
        return this.div(x, true);
    }
    ,_divmod: function( x ) {
        return this._div(x, true);
    }
    ,multidivmod: function( xs ) {
        return this.multidiv(xs, true);
    }
    ,divides: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( self.equ(Arithmetic.O) ) return false;
        if ( is_instance(a, RationalFunc) ) return true;
        if ( is_instance(a, [Polynomial, Numeric]) || Arithmetic.isNumber(a) )
            a = MultiPolynomial(a, self.symbol, self.ring);
        if ( is_instance(a, MultiPolynomial) )
            return a.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b, rsym = self._rsym;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n.num);
        if ( 0 === n )
        {
            return MultiPolynomial.One(self.symbol, self.ring);
        }
        else if ( 1 === n )
        {
            return self;
        }
        else if ( 2 === n )
        {
            return MultiPolynomial.Mul(self, self.clone(), true);
        }
        else
        {
            // exponentiation by squaring
            pow = MultiPolynomial.One(self.symbol, self.ring);
            b = self.recur(false).clone();
            while ( 0 !== n )
            {
                if ( n & 1 ) pow = MultiPolynomial.Mul(b, pow, false);
                n >>= 1;
                b = MultiPolynomial.Mul(b, b, false);
            }
            if ( rsym ) pow = pow.recur(rsym);
            return pow;
        }
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) ) return self;
        return polykthroot(self, n);
    }
    ,compose: function( q ) {
        // composition through variation on recursive Horner scheme
        var self = this, symbol = self.symbol, ring = self.ring, rsym = self._rsym, pq,
            Arithmetic = Abacus.Arithmetic, O = MultiPolynomial.Zero(symbol, ring), horner, memo = Obj();
        horner = function horner( p, q, index ) {
            index = index || 0;
            while ( (index<symbol.length) && (0===p.maxdeg(symbol[index], true)) ) index++;
            if ( index >= symbol.length ) return MultiPolynomial(p.cc(), symbol, ring);
            var s, t = p.terms, i, j, pq, qi, tc;
            if ( !t.length ) return O;
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if ( HAS.call(memo, s) ) return memo[s];
            qi = HAS.call(q, symbol[index]) ? MultiPolynomial(q[symbol[index]]||Arithmetic.O, symbol, ring) : MultiPolynomial([MultiPolyTerm(ring.One(), array(symbol.length, function(i){return i===index ? 1 : 0}), ring)], symbol, ring);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, q, index+1) : MultiPolynomial(t[0].c, symbol, ring);
            i = t[0].e[index]; pq = tc; j = 1;
            while(0<i)
            {
                i--; pq = MultiPolynomial.Mul(qi, pq, false);
                if ( j<t.length && i===t[j].e[index] )
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, q, index+1) : t[j].c;
                    pq = MultiPolynomial.Add(tc, pq, false, false);
                    j++;
                }
            }
            memo[s] = pq;
            return pq;
        };
        pq = horner(self.recur(true), q||{});
        if ( rsym ) pq = pq.recur(rsym);
        return pq;
    }

    ,shift: function( x, s ) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, symbol = self.symbol, ring = self.ring,
            Arithmetic = Abacus.Arithmetic, index;
        x = String(x || symbol[0]); s = s || 0;
        index = symbol.indexOf(x); if ( -1===index ) index = 0;
        x = symbol[index];
        s = Arithmetic.val(s);
        if ( 0 === s )
            return self;
        if ( 0 > s ) // division by monomial x^|s|
        {
            if ( -s > self.maxdeg(x, true) ) return MultiPolynomial.Zero(symbol, ring);
            return MultiPolynomial(self.terms.map(function(term){
                var k, e;
                term = term.clone();
                if ( is_instance(term.c, MultiPolynomial) )
                {
                    e = term.e[index]; k = s;
                    if ( 0 < e )
                    {
                        if ( e >= -k )
                        {
                            term.e[index] += k;
                            k = 0;
                        }
                        else
                        {
                            term.e[index] = 0;
                            k += e;
                        }
                    }
                    if ( 0 > k )
                        term.c = term.c.shift(x, k);
                }
                else
                {
                    if ( term.e[index] >= -s )
                        term.e[index] += s;
                    else
                        term.c = ring.Zero();
                }
                return term;
            }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        }
        //else if ( 0 < s ) // multiplication by monomial x^s
        return MultiPolynomial(self.terms.map(function(term){
            term = term.clone();
            if ( is_instance(term.c, MultiPolynomial) )
            {
                if ( 0 < term.c.maxdeg(x, true) )
                    term.c = term.c.shift(x, s);
                else
                    term.e[index] += s;
            }
            else
            {
                term.e[index] += s;
            }
            return term;
        }).sort(MultiPolyTerm.sortDecr), symbol, ring);
    }
    ,d: function( x, n ) {
        // partial polynomial (formal) derivative of nth order with respect to symbol x
        var self = this, symbol = self.symbol, ring = self.ring, dp,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, index;
        x = String(x || symbol[0]);
        if ( null == n ) n = 1;
        n = Arithmetic.val(n);
        if ( 0 > n ) return null; // not supported
        else if ( 0 === n ) return self;
        index = symbol.indexOf(x); if ( -1===index ) index = 0;
        x = symbol[index];
        if ( n > self.maxdeg(x, true) ) return MultiPolynomial.Zero(symbol, ring);
        dp = MultiPolynomial(self.terms.map(function(term){
            var c, j;
            if ( is_instance(term.c, MultiPolynomial) )
            {
                if ( term.c.isConst(true) )
                {
                    if ( n > term.e[index] )
                    {
                        return null;
                    }
                    else
                    {
                        term = term.clone();
                        for(c=I,j=term.e[index]; j+n>term.e[index]; j--) c = Arithmetic.mul(c, j);
                        term.c = term.c._mul(c); term.e[index] -= n;
                        return term;
                    }
                }
                else
                {
                    term = term.clone(); j = n;
                    do{
                        j--;
                        term.c = term.c.d(x,1)._add(term.c._mul(term.e[index]));
                        term.e[index] = stdMath.max(term.e[index]-1, 0);
                    }while( (0 < j) && !term.c.equ(O) )
                    return term;
                }
            }
            else
            {
                if ( n > term.e[index] )
                {
                    return null;
                }
                else
                {
                    term = term.clone();
                    for(c=I,j=term.e[index]; j+n>term.e[index]; j--) c = Arithmetic.mul(c, j);
                    term.c = term.c.mul(c); term.e[index] -= n;
                    return term;
                }
            }
        }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        return dp;
    }
    ,evaluate: function( x ) {
        // recursive Horner scheme
        var self = this, symbol = self.symbol, ring = self.ring, O = Abacus.Arithmetic.O, horner, memo = Obj();
        horner = function horner( p, x, index ) {
            index = index || 0;
            while ( (index<symbol.length) && (0===p.maxdeg(symbol[index], true)) ) index++;
            if ( index >= symbol.length ) return p.cc();
            var s, t = p.terms, i, j, v, xi, tc;
            if ( !t.length ) return ring.Zero();
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if ( HAS.call(memo, s) ) return memo[s];
            xi = (HAS.call(x, symbol[index]) ? x[symbol[index]] : O) || O;
            //xi = ring.cast(xi);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, x, index+1) : t[0].c;
            i = t[0].e[index]; v = tc; j = 1;
            while(0<i)
            {
                i--; v = v.mul(xi);
                if ( j<t.length && i===t[j].e[index] )
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, x, index+1) : t[j].c;
                    v = tc.add(v);
                    j++;
                }
            }
            memo[s] = v;
            return v;
        };
        return horner(self.recur(true), x||{});
    }
    ,toString: function( ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
        {
            t = self.terms; x = self.symbol;
            for(i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x);
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if ( null == self._tex )
        {
            t = self.terms; x = self.symbol;
            for(i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, true);
                prev = true;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
    ,toDec: function( precision ) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        t = self.terms; x = self.symbol;
        for(i=0,l=t.length; i<l; i++)
        {
            ti = t[i];
            out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
            prev = true;
        }
        if ( !out.length )
        {
            out = '0';
            if ( is_number(precision) && 0<precision ) out += '.'+(new Array(precision+1).join('0'));
        }
        return out;
    }
    ,toExpr: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, t, ti, x, i, l, term, terms;
        if ( null == self._expr )
        {
            if ( self.isRecur() )
            {
                self._expr = self.recur(false).toExpr();
            }
            else
            {
                t = self.terms; x = self.symbol; terms = [];
                for(i=t.length-1; i>=0; i--)
                {
                    ti = t[i]; term = ti.toTerm(x, false, true);
                    terms.push(MulTerm(term.length ? term : '1', ti.c));
                }
                if ( !terms.length ) terms.push(MulTerm(1, O));
                self._expr = Expr(terms);
            }
        }
        return self._expr;
    }
});
MultiPolynomial.cast = function( a, symbol, ring ) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if ( !is_array(symbol) ) symbol = [String(symbol)];
    var type_cast = typecast(function(a){
        return is_instance(a, MultiPolynomial) && (a.ring===ring);
    }, function(a){
        return is_string(a) ? MultiPolynomial.fromString(a, symbol, ring) : new MultiPolynomial(a, symbol, ring);
    });
    return type_cast(a);
};

// Abacus.RationalFunc, represents a rational function/fraction of (multivariate) polynomials
RationalFunc = Abacus.RationalFunc = Class(Symbolic, {
    constructor: function RationalFunc( /*num, den, symbol, ring, simplified*/ ) {
        var self = this, Arithmetic = Abacus.Arithmetic, args = arguments,
            num, den, symbol, ring, simplified, simplify = RationalFunc.autoSimplify;

        simplified = (4<args.length) && (true===args[4]);
        ring = 3<args.length ? (is_instance(args[3], Ring) ? args[3] : null) : null;
        symbol = 2<args.length ? (is_array(args[2]) ? args[2] : args[2]) : null;
        if ( 1<args.length )
        {
            num = args[0];
            den = args[1];
        }
        else if ( 1===args.length )
        {
            num = args[0];
            den = null;
        }
        else
        {
            num = null;
            den = null;
        }

        if ( !is_instance(self, RationalFunc) ) return new RationalFunc(num, den, symbol, ring, simplified);

        if ( is_instance(num, RationalFunc) )
        {
            simplified = num._simpl;
            ring = num.ring;
            symbol = num.symbol;
            den = num.den;
            num = num.num;
        }
        else if ( is_instance(num, Polynomial) )
        {
            ring = ring || num.ring;
            symbol = symbol || [num.symbol];
        }
        ring = is_instance(ring, Ring) ? ring : Ring.Q();
        symbol = is_array(symbol) ? symbol : [String(symbol||'x')];

        if ( null == num ) num = MultiPolynomial.Zero(symbol, ring);
        else if ( !is_instance(num, MultiPolynomial) ) num = MultiPolynomial(num, symbol, ring);

        if ( null == den ) den = MultiPolynomial.One(num.symbol, num.ring);
        else if ( !is_instance(den, MultiPolynomial) ) den = MultiPolynomial(den, num.symbol, num.ring);

        if ( den.equ(Arithmetic.O) ) throw new Error('Zero denominator in Abacus.RationalFunc!');
        if ( num.equ(Arithmetic.O) && !den.equ(Arithmetic.I) ) den = MultiPolynomial.One(num.symbol, num.ring);
        if ( den.lc().lt(Arithmetic.O) ) { den = den.neg(); num = num.neg(); }
        self.num = num;
        self.den = den;

        if ( simplified ) self._simpl = true;
        else if ( simplify ) self.simpl();
    }

    ,__static__: {
        autoSimplify: true
        ,Zero: function( symbol, ring ) {
            return new RationalFunc(MultiPolynomial.Zero(symbol, ring), null, null, null, true);
        }
        ,One: function( symbol, ring ) {
            return new RationalFunc(MultiPolynomial.One(symbol, ring), null, null, null, true);
        }
        ,MinusOne: function( symbol, ring ) {
            return new RationalFunc(MultiPolynomial.MinusOne(symbol, ring), null, null, null, true);
        }
        ,hasInverse: function( ) {
            return true;
        }
        ,cast: null // added below

        ,gcd: rfgcd
        ,xgcd: rfxgcd
        ,lcm: rflcm

        ,fromString: function( s, symbol, ring ) {
            var paren = 0, braket = 0, parts = ['', ''], sign = '', is_tex = false,
                i = 0, l, c, j, num, den, space = /\s/;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if ( !is_array(symbol) ) symbol = [String(symbol)];
            s = trim(String(s));
            if ( !s.length ) return RationalFunc.Zero(symbol, ring);
            if ( ('-' === s.charAt(0)) || ('+' === s.charAt(0)) )
            {
                sign = s.charAt(0);
                s = trim(s.slice(1));
                if ( !s.length ) return RationalFunc.Zero(symbol, ring);
                sign = '-' === sign ? '-' : '';
            }
            is_tex = ('\\frac' === s.slice(0, 5));
            l = s.length;
            i = is_tex ? 5 : 0;
            j = 0; // parse num
            c = s.charAt(i);
            // skip first braket if tex
            if ( is_tex && ('{' === c) )
            {
                braket++;
                i++;
            }
            while( i<l )
            {
                c = s.charAt(i++);

                if ( space.test(c) )
                {
                    // continue
                }
                else if ( '/' === c )
                {
                    if ( !is_tex && !paren && !braket &&
                        (
                        (parts[j].length && (')' === parts[j].charAt(parts[j].length-1))) ||
                        ((i<l) && ('('===s.charAt(i)))
                        )
                    )
                    {
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else if ( '(' === c )
                {
                    paren++;
                    parts[j] += c;
                }
                else if ( ')' === c )
                {
                    paren--;
                    parts[j] += c;
                    if ( !is_tex && !paren && !braket && ((i>=l) || ('/'===s.charAt(i))) )
                    {
                        if ( (i<l) && ('/'===s.charAt(i)) ) i++;
                        j = 1; // parse den
                    }
                }
                else if ( '{' === c )
                {
                    braket++;
                    parts[j] += c;
                }
                else if ( '}' === c )
                {
                    braket--;
                    if ( !paren && !braket )
                    {
                        if ( is_tex && (i<l) && ('{'===s.charAt(i)) )
                        {
                            braket++;
                            i++;
                        }
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else
                {
                    parts[j] += c;
                }
            }
            if ( paren || braket )
            {
                num = MultiPolynomial.fromString(parts[0], symbol, ring);
                den = null;
            }
            else
            {
                if ( parts[0].length && parts[1].length && ('(' === parts[0].charAt(0)) && (')'===parts[0].charAt(parts[0].length-1)) )
                {
                    parts[0] = trim(parts[0].slice(1,-1));
                }
                if ( parts[1].length && ('(' === parts[1].charAt(0)) && (')'===parts[1].charAt(parts[1].length-1)) )
                {
                    parts[1] = trim(parts[1].slice(1,-1));
                }
                num = MultiPolynomial.fromString(parts[0], symbol, ring);
                den = parts[1].length ? MultiPolynomial.fromString(parts[1], symbol, ring) : null;
            }
            if ( '-' === sign ) num = num.neg();
            return new RationalFunc(num, den);
        }
        ,fromExpr: function( e, symbol, ring ) {
            if ( !is_instance(e, Expr) ) return null;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if ( !is_array(symbol) ) symbol = [String(symbol)];
            return new RationalFunc(MultiPolynomial.fromExpr(e, symbol, ring));
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_simpl: false

    ,dispose: function( ) {
        var self = this;
        if ( self._n && self===self._n._n )
        {
            self._n._n = null;
        }
        if ( self._i && self===self._i._i )
        {
            self._i._i = null;
        }
        if ( self._c && self===self._c._c )
        {
            self._c._c = null;
        }
        self.num = null;
        self.den = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        return self;
    }
    ,isInt: function( ) {
        var self = this;
        return self.num.isInt() && self.den.equ(Abacus.Arithmetic.I);
    }
    ,isReal: function( ) {
        var self = this;
        return (self.num.isReal() && self.den.isReal()) || (self.num.isImag() && self.den.isImag());
    }
    ,isImag: function( ) {
        var self = this;
        return (self.num.isReal() && self.den.isImag()) || (self.num.isImag() && self.den.isReal());
    }
    ,isConst: function( recur ) {
        var self = this;
        return self.num.isConst(recur) && self.den.isConst(recur);
    }
    ,c: function( ) {
        var self = this;
        return self.num.c().div(self.den.c());
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = RationalFunc(self.num.neg(), self.den, null, null, self._simpl);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function( ) {
        var self = this;
        if ( null == self._i )
        {
            self._i = RationalFunc(self.den, self.num, null, null, self._simpl);
            self._i._i = self;
        }
        return self._i;
    }
    ,real: function( ) {
        var self = this;
        return RationalFunc(self.num.real(), self.den.real());
    }
    ,imag: function( ) {
        var self = this;
        return RationalFunc(self.num.imag(), self.den.imag());
    }
    ,abs: function( ) {
        var self = this;
        return RationalFunc(self.num.abs(), self.den, null, null, self._simpl);
    }
    ,conj: function( ) {
        var self = this;
        if ( null == self._c )
        {
            self._c = RationalFunc(self.num.conj(), self.den.conj());
            self._c._c = self;
        }
        return self._c;
    }
    ,equ: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x) )
            return self.num.equ(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return self.num.mul(x.den).equ(self.den.mul(x.num));
        else if ( is_string(x) )
            return (x===self.toString()) || (x===self.toTex());
        return false;
    }
    ,gt: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x) )
            return self.num.gt(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return self.num.mul(x.den).gt(self.den.mul(x.num));
        return false;
    }
    ,gte: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x) )
            return self.num.gte(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return self.num.mul(x.den).gte(self.den.mul(x.num));
        return false;
    }
    ,lt: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x) )
            return self.num.lt(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return self.num.mul(x.den).lt(self.den.mul(x.num));
        return false;
    }
    ,lte: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        if ( is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x) )
            return self.num.lte(self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return self.num.mul(x.den).lte(self.den.mul(x.num));
        return false;
    }

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly]) )
            return RationalFunc(self.num.add(self.den.mul(x)), self.den);
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return RationalFunc(self.num.mul(x.den).add(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly]) )
            return RationalFunc(self.num.sub(self.den.mul(x)), self.den);
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return RationalFunc(self.num.mul(x.den).sub(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly]) )
            return RationalFunc(self.num.mul(x), self.den);
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return RationalFunc(self.num.mul(x.num), self.den.mul(x.den));
        return self;
    }
    ,div: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( is_instance(x, Complex) && x.isReal() ) x = x.real();
        else if ( is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x) ) x = Rational(x);
        if ( is_instance(x, [Complex, Poly]) )
            return RationalFunc(self.num, self.den.mul(x));
        else if ( is_instance(x, [Rational, RationalFunc]) )
            return RationalFunc(self.num.mul(x.den), self.den.mul(x.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function( x ) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,compose: function( q ) {
        var self = this;
        // assume q's are simply multipolynomials, NOT rational functions
        return RationalFunc(self.num.compose(q), self.den.compose(q));
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if ( n.gt(MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n.num);
        if ( 0 > n ) { n = -n; t = num; num = den; den = t; }
        if ( 0 === n )
            return RationalFunc.One(num.symbol, num.ring);
        else if ( 1 === n )
            return RationalFunc(num, den, num.symbol, num.ring, self._simpl);
        else
            return RationalFunc(num.pow(n), den.pow(n), num.symbol, num.ring, self._simpl);
    }
    ,rad: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if ( n.equ(Arithmetic.I) ) return self;
        return kthroot(self, n);
    }
    ,shift: function( x, s ) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, Arithmetic = Abacus.Arithmetic;
        x = String(x || self.num.symbol[0]); s = s || 0;
        s = Arithmetic.val(s);
        if ( 0 === s ) return self;
        return 0 > s ? RationalFunc(self.num, self.den.shift(x, -s)) : RationalFunc(self.num.shift(x, s), self.den);
    }
    ,d: function( x, n ) {
        // partial rational (formal) derivative of nth order with respect to symbol x
        var self = this, num, den, d_num, d_den, Arithmetic = Abacus.Arithmetic;
        x = String(x || self.num.symbol[0]);
        if ( null == n ) n = 1;
        n = Arithmetic.val(n);
        if ( 0 > n ) return null; // not supported
        else if ( 0 === n ) return self;
        num = self.num; den = self.den;
        while( 0<n && !num.equ(Arithmetic.O) )
        {
            d_num = num.d(x, 1).mul(den).sub(num.mul(den.d(x, 1)));
            d_den = den.pow(2);
            num = d_num; den = d_den; n--;
        }
        return RationalFunc(d_num, d_den);
    }
    ,simpl: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, num, den, n, d, g, qr;
        if ( !self._simpl )
        {
            if ( self.num.equ(Arithmetic.O) )
            {
                self.den = MultiPolynomial.One(self.num.symbol, self.num.ring);
            }
            else if ( !self.den.equ(Arithmetic.I) )
            {
                // here best if we could use multipolynomial gcd if possible
                if ( (1 === self.num.symbol.length) && (1 === self.den.symbol.length) )
                {
                    qr = polygcd(self.num, self.den); // works correctly for univariate case only
                    self.num = self.num.div(qr);
                    self.den = self.den.div(qr);
                }
                else if ( (qr=self.num.divmod(self.den)) && qr[1].equ(Arithmetic.O) )
                {
                    // den divides num exactly, simplify
                    self.num = qr[0];
                    self.den = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }
                else if ( (qr=self.den.divmod(self.num)) && qr[1].equ(Arithmetic.O) )
                {
                    // den divides num exactly, simplify
                    self.den = qr[0];
                    self.num = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }

                num = self.num.primitive(true);
                den = self.den.primitive(true);
                if ( num[1].equ(den[1]) )
                {
                    self.num = num[0];
                    self.den = den[0];
                }
                else
                {
                    if ( is_class(num[0].ring.NumberClass, Complex) )
                    {
                        if ( num[1].isImag() && den[1].isImag() )
                        {
                            n = Arithmetic.mul(den[1].imag().den, num[1].imag().num);
                            d = Arithmetic.mul(num[1].imag().den, den[1].imag().num);
                            g = gcd(n, d);
                            self.num = num[0].mul(Arithmetic.div(n, g));
                            self.den = den[0].mul(Arithmetic.div(d, g));
                        }
                        else if ( num[1].isReal() && den[1].isReal() )
                        {
                            n = Arithmetic.mul(den[1].real().den, num[1].real().num);
                            d = Arithmetic.mul(num[1].real().den, den[1].real().num);
                            g = gcd(n, d);
                            self.num = num[0].mul(Arithmetic.div(n, g));
                            self.den = den[0].mul(Arithmetic.div(d, g));
                        }
                        else
                        {
                            g = cgcd(num[1], den[1]);
                            self.num = num[0].mul(num[1].div(g));
                            self.den = den[0].mul(den[1].div(g));
                        }
                    }
                    else
                    {
                        n = Arithmetic.mul(den[1].den, num[1].num);
                        d = Arithmetic.mul(num[1].den, den[1].num);
                        g = gcd(n, d);
                        self.num = num[0].mul(Arithmetic.div(n, g));
                        self.den = den[0].mul(Arithmetic.div(d, g));
                    }
                }
            }
            self._simpl = true;
        }
        return self;
    }
    ,evaluate: function( x ) {
        var self = this;
        return self.num.evaluate(x).div(self.den.evaluate(x));
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
            self._str = self.den.equ(Arithmetic.I) ? self.num.toString() : ((self.num.isMono() || (self.num.isConst(true) && (self.num.isReal() || self.num.isImag())) ? self.num.toString() : ('('+self.num.toString()+')'))+'/'+(self.den.isConst(true) && (self.den.isReal()) ? self.den.toString() : ('('+self.den.toString()+')')));
        return self._str;
    }
    ,toTex: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._tex )
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{'+self.num.toTex()+'}{'+self.den.toTex()+'}');
        return self._tex;
    }
    ,toDec: function( precision ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.den.equ(Arithmetic.I) ? self.num.toDec(precision) : ('('+self.num.toDec(precision)+')/('+self.den.toDec(precision)+')');
    }
});
RationalFunc.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if ( !is_array(symbol) ) symbol = [String(symbol)];
    var type_cast = typecast([RationalFunc], function(a){
        return is_string(a) ? RationalFunc.fromString(a, symbol, ring) : new RationalFunc(MultiPolynomial(a, symbol, ring));
    });
    return type_cast(a);
};

// Abacus.Ring represents an algebraic Ring or Field (even Polynomial Ring)
Ring = Abacus.Ring = Class({
    constructor: function Ring( NumberClass, PolynomialSymbol, isFraction ) {
        var self = this;
        if ( !is_instance(self, Ring) ) return new Ring(NumberClass, PolynomialSymbol, isFraction);

        if ( is_array(NumberClass) )
        {
            self.Modulo = Integer.cast(NumberClass[1]);
            NumberClass = NumberClass[0];
        }
        else
        {
            self.Modulo = null;
        }
        if ( !is_class(NumberClass, [Numeric, Expr, RationalExpr]) ) NumberClass = Complex;
        self.NumberClass = NumberClass;
        if ( is_class(self.NumberClass, [Expr, RationalExpr]) ) PolynomialSymbol = null;

        if ( is_array(PolynomialSymbol) && PolynomialSymbol.length )
        {
            PolynomialSymbol = remove_duplicates(PolynomialSymbol.map(String));
            self.CoefficientRing = is_class(self.NumberClass, IntegerMod) && self.Modulo ? (IntegerMod===self.NumberClass ? Ring.Zp(self.Modulo)() : Ring([self.NumberClass, self.Modulo])) : (is_class(self.NumberClass, Integer) ? (Integer===self.NumberClass ? Ring.Z() : Ring(self.NumberClass)) : (is_class(self.NumberClass, Rational) ? (Rational===self.NumberClass ? Ring.Q() : Ring(self.NumberClass)) : (Complex===self.NumberClass ? Ring.C() : Ring(self.NumberClass))));
            if ( true===isFraction )
            {
                self.PolynomialClass = RationalFunc;
                self.PolynomialSymbol = PolynomialSymbol;
            }
            else
            {
                if ( 1===PolynomialSymbol.length )
                {
                    self.PolynomialClass = Polynomial;
                    self.PolynomialSymbol = PolynomialSymbol[0];
                }
                else
                {
                    self.PolynomialClass = MultiPolynomial;
                    self.PolynomialSymbol = PolynomialSymbol;
                }
            }
        }
        else
        {
            if ( true===isFraction )
            {
                if ( is_class(self.NumberClass, Integer) ) self.NumberClass = Rational;
                else if ( is_class(self.NumberClass, Expr) ) self.NumberClass = RationalExpr;
            }
            self.PolynomialClass = null;
            self.CoefficientRing = null;
            self.PolynomialSymbol = null;
        }
    }

    ,__static__: {
        ZZ: null
        ,QQ: null
        ,CC: null
        ,EE: null
        ,RR: null
        ,Z: function( /* "x","y",.. */ ) {
            if ( null == Ring.ZZ ) Ring.ZZ = Ring(Integer);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Integer, args) : Ring.ZZ;
        }
        ,Zn: function( N ) {
            N = Integer.cast(N);
            return function( /* "x","y",.. */ ) {
                var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
                return args.length ? Ring([IntegerMod, N], args) : Ring([IntegerMod, N]);
            };
        }
        ,Q: function( /* "x","y",.. */ ) {
            if ( null == Ring.QQ ) Ring.QQ = Ring(Rational);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Rational, args) : Ring.QQ;
        }
        ,C: function( /* "x","y",.. */ ) {
            if ( null == Ring.CC ) Ring.CC = Ring(Complex);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Complex, args) : Ring.CC;
        }
        ,E: function( /* "x","y",.. */ ) {
            if ( null == Ring.EE ) Ring.EE = Ring(Expr);
            return Ring.EE;
        }
        ,R: function( /* "x","y",.. */ ) {
            if ( null == Ring.RR ) Ring.RR = Ring(RationalExpr);
            return Ring.RR;
        }
    }

    ,NumberClass: null
    ,Modulo: null
    ,PolynomialClass: null
    ,CoefficientRing: null
    ,PolynomialSymbol: null
    ,_str: null
    ,_tex: null

    ,dispose: function( ) {
        var self = this;
        self.NumberClass = null;
        self.Modulo = null;
        self.PolynomialClass = null;
        self.CoefficientRing = null;
        self.PolynomialSymbol = null;
        self._str = null;
        self._tex = null;
        return self;
    }

    ,Zero: function( ) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.Zero(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass() : self.NumberClass.Zero(self.Modulo));
    }
    ,One: function( ) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.One(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass(1) : self.NumberClass.One(self.Modulo));
    }
    ,MinusOne: function( ) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.MinusOne(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass(-1) : self.NumberClass.MinusOne(self.Modulo));
    }

    ,isSymbolic: function( ) {
        var self = this;
        return is_class(self.NumberClass, [Expr, RationalExpr]) || ((null!=self.PolynomialClass) && is_class(self.PolynomialClass, [Polynomial, MultiPolynomial, RationalFunc]));
    }
    ,isReal: function( ) {
        var self = this;
        return !is_class(self.NumberClass, Complex);
    }
    ,isField: function( ) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.hasInverse() : (is_class(self.NumberClass, RationalExpr) ? true : (is_class(self.NumberClass, Expr) ? false : (self.NumberClass.hasInverse() && (self.Modulo ? self.Modulo.isPrime() : true))));
    }
    ,associatedField: function( ) {
        var self = this;
        if ( self.PolynomialClass ) return is_class(self.PolynomialClass, RationalFunc) ? self : Ring(self.Modulo ? [self.NumberClass, self.Modulo] : self.NumberClass, [].concat(self.PolynomialSymbol), true);
        return is_class(self.NumberClass, Expr) ? Ring.R() : (is_class(self.NumberClass, Integer) ? Ring.Q() : (self.isField() ? self : null));
    }

    ,hasGCD: function( ) {
        var self = this;
        return self.PolynomialClass ? ((is_class(self.PolynomialClass, Polynomial) || 1===self.PolynomialSymbol.length) && is_callable(self.PolynomialClass.gcd) && is_callable(self.PolynomialClass.xgcd)) : (is_callable(self.NumberClass.gcd) && is_callable(self.NumberClass.xgcd) && (!self.Modulo || self.Modulo.isPrime()));
    }
    ,gcd: function( /*args*/ ) {
        var self = this, args;
        if ( !self.hasGCD() ) throw new Error('Abacus.Ring instance does not support GCD!');
        return self.PolynomialClass ? self.PolynomialClass.gcd.apply(null, arguments) : self.NumberClass.gcd.apply(null, arguments);
    }
    ,xgcd: function( /*args*/ ) {
        var self = this;
        if ( !self.hasGCD() ) throw new Error('Abacus.Ring instance does not support xGCD!');
        return self.PolynomialClass ? self.PolynomialClass.xgcd.apply(null, arguments) : self.NumberClass.xgcd.apply(null, arguments);
    }
    ,lcm: function( /*args*/ ) {
        var self = this;
        if ( !self.hasGCD() ) throw new Error('Abacus.Ring instance does not support LCM!');
        return self.PolynomialClass ? self.PolynomialClass.lcm.apply(null, arguments) : self.NumberClass.lcm.apply(null, arguments);
    }

    ,cast: function( a ) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.cast(a, self.PolynomialSymbol, self.CoefficientRing) : (self.Modulo ? self.NumberClass.cast(a, self.Modulo) : self.NumberClass.cast(a));
    }
    ,create: function( /*args*/ ) {
        var self = this, args = arguments;
        if ( !args.length ) return self.Zero();
        if ( is_class(self.PolynomialClass, RationalFunc) )
        {
            args = slice.call(args, 0, 2);
            if ( 2 > args.length ) args.push(null);
            return self.PolynomialClass.apply(null, args.concat([self.PolynomialSymbol, self.CoefficientRing]));
        }
        else if ( self.PolynomialClass )
        {
            return self.PolynomialClass.apply(null, [args[0], self.PolynomialSymbol, self.CoefficientRing]);
        }
        return self.NumberClass.apply(null, self.Modulo ? [args[0], self.Modulo] : args);
    }
    ,fromString: function( s ) {
        var self = this;
        s = trim(String(s));
        return s.length ? (self.PolynomialClass ? self.PolynomialClass.fromString(s, self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? self.NumberClass.fromString(s) : self.NumberClass.fromString(s, self.Modulo))) : self.Zero();
    }
    ,fromExpr: function( e ) {
        var self = this;
        if ( !is_instance(e, Expr) ) return null;
        return self.PolynomialClass ? self.PolynomialClass.fromExpr(e, self.PolynomialSymbol, self.CoefficientRing) : self.cast(e.c());
    }
    ,fromValues: function( v ) {
        var self = this;
        return is_class(self.PolynomialClass, Polynomial) ? self.PolynomialClass.fromValues(v, self.PolynomialSymbol, self.CoefficientRing) : null;
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
        {
            self._str = (is_class(self.NumberClass, IntegerMod) ? 'Zn('+self.Modulo.toString()+')(' : (is_class(self.NumberClass, Integer) ? 'Z(' : (is_class(self.NumberClass, Rational) ? 'Q(' : 'C('))) + (self.PolynomialSymbol ? ('"'+[].concat(self.PolynomialSymbol).join('","')+'"') : '') + ')';
            if ( is_class(self.PolynomialClass, RationalFunc) ) self._str += '.associatedField()';
        }
        return self._str;
    }
    ,toTex: function( ) {
        var self = this;
        if ( null == self._tex )
        {
            self._tex = '\\mathbb' + (is_class(self.NumberClass, IntegerMod) ? ('{Z}_{'+self.Modulo.toTex()+'}') : (is_class(self.NumberClass, Integer) ? '{Z}' : (is_class(self.NumberClass, Rational) ? '{Q}' : '{C}'))) + (self.PolynomialSymbol ? ('['+[].concat(self.PolynomialSymbol).map(to_tex).join(',')+']') : '');
            if ( is_class(self.PolynomialClass, RationalFunc) ) self._tex = '\\mathbf{Fr}['+self._tex+']';
        }
        return self._tex;
    }
});

// Abacus.Matrix, represents a (2-dimensional) (dense) matrix with coefficients from a ring, default Ring.Z()
Matrix = Abacus.Matrix = Class(INumber, {

    constructor: function Matrix( ring, r, c, values ) {
        var self = this, k, v, i, j;
        if ( !is_instance(self, Matrix) ) return new Matrix(ring, r, c, values);

        if ( !is_instance(ring, Ring) ) ring = Ring.Z();
        self.ring = ring;

        if ( is_instance(r, Matrix) )
        {
            self.val = r.val.map(function(row){return row.slice()});
            if ( self.ring !== r.ring )
                self.val = self.ring.cast(self.val);
        }
        else if ( is_array(r) || is_args(r) )
        {
            if ( !is_array(r[0]) && !is_args(r[0]) )
            {
                self.val = c ? /*row*/array(1, function(i){
                    return array(r.length, function(j){
                        return self.ring.cast(r[j]);
                    });
                }) : /*column*/array(r.length, function(i){
                    return array(1, function(j){
                        return self.ring.cast(r[i]);
                    });
                });
            }
            else
            {
                if ( is_args(r) ) r = slice.call(r);
                if ( is_args(r[0]) ) r = r.map(function(ri){return slice.call(ri);});
                self.val = self.ring.cast(r);
            }
        }
        else //if ( is_number(r) && is_number(c) )
        {
            if ( null == c ) c = r; // square
            r = (+(r||0))|0; c = (+(c||0))|0;
            if ( 0>r ) r = 0;
            if ( 0>c ) c = 0;
            self.val = array(r, function(i){
                return array(c, function(j){
                    return self.ring.Zero();
                });
            });
            if ( is_obj(values) )
            {
                for(k in values)
                {
                    if ( !HAS.call(values, k) || (-1 === k.indexOf(',')) ) continue;
                    v = values[k];
                    k = k.split(',').map(function(n){return parseInt(trim(n), 10);});
                    i = k[0]; j = k[1];
                    if ( 0<=i && i<self.val.length && 0<=j && j<self.val[0].length )
                        self.val[i][j] = self.ring.cast(v);
                }
            }
        }
        self.nr = self.val.length;
        self.nc = self.nr ? self.val[0].length : 0;
    }

    ,__static__: {
        hasInverse: function( ) {
            return false;
        }
        ,isCommutative: function( ) {
            return false;
        }

        ,Zero: function( ring, r, c ) {
            ring = ring || Ring.Z();
            return Matrix.C(ring, r, c, ring.Zero());
        }
        ,One: function( ring, n ) {
            ring = ring || Ring.Z();
            return Matrix.D(ring, n, n, ring.One());
        }
        ,I: function( ring, n ) {
            return Matrix.One(ring, n);
        }
        ,C: function( ring, r, c, v ) {
            ring = ring || Ring.Z();
            v = v || ring.Zero();
            if ( null == c ) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(ring, array(r, function(i){
                return array(c, function(j){
                    return v;
                });
            }));
        }
        ,D: function( ring, r, c, v ) {
            ring = ring || Ring.Z();
            var O = ring.Zero();
            v = ring.cast(v || O);
            if ( null == c ) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(ring, array(r, function(i){
                return array(c, function(j){
                    if ( i === j )
                    {
                        if ( is_array(v) || is_args(v) )
                            return i < v.length ? v[i] : O;
                        else
                            return v;
                    }
                    else
                    {
                        return O;
                    }
                });
            }));
        }
        ,T: function( m ) {
            // transpose
            var rows = m.length, columns = rows ? m[0].length : 0;
            return array(columns, function(j){
                return array(rows, function(i){
                    return m[i][j];
                });
            });
        }
        ,ARR: function( ring, a, r, c ) {
            // shape 1-D array into an r x c matrix
            ring = ring || Ring.Z();
            return Matrix(ring, array(r, function(i){
                return array(c, function(j){
                    var k = i*c + j;
                    return k < a.length ? ring.cast(a[k]) : ring.Zero();
                });
            }));
        }
        ,SWAPR: function( m, i, j ) {
            // swap rows i and j
            if ( i !== j )
            {
                var t = m[i];
                m[i] = m[j];
                m[j] = t;
            }
            return m;
        }
        ,SWAPC: function( m, i, j ) {
            // swap columns i and j
            if ( i !== j )
            {
                var k, n = m.length, t;
                for(k=0; k<n; k++)
                {
                    t = m[k][i];
                    m[k][i] = m[k][j];
                    m[k][j] = t;
                }
            }
            return m;
        }
        ,ADDR: function( ring, m, i, j, a, b, k0 ) {
            ring = ring || Ring.Z();
            // add (a multiple of) row j to (a multiple of) row i
            var k, n = m[0].length;
            if ( null == a ) a = ring.One();
            if ( null == b ) b = ring.One();
            for(k=k0||0; k<n; k++)
                m[i][k] = ring.cast(b.mul(m[i][k]).add(a.mul(m[j][k])));
            return m;
        }
        ,ADDC: function( ring, m, i, j, a, b, k0 ) {
            ring = ring || Ring.Z();
            // add (a multiple of) column j to (a multiple of) column i
            var k, n = m.length;
            if ( null == a ) a = ring.One();
            if ( null == b ) b = ring.One();
            for(k=k0||0; k<n; k++)
                m[k][i] = ring.cast(b.mul(m[k][i]).add(a.mul(m[k][j])));
            return m;
        }
        ,MULR: function( ring, m, i0, i1, a, b, c, d ) {
            ring = ring || Ring.Z();
            var j, l = m[0].length, x, y;
            for (j=0; j<l; j++)
            {
                x = m[i0][j]; y = m[i1][j];
                m[i0][j] = ring.cast(a.mul(x).add(b.mul(y)));
                m[i1][j] = ring.cast(c.mul(x).add(d.mul(y)));
            }
            return m;
        }
        ,MULC: function( ring, m, j0, j1, a, b, c, d ) {
            ring = ring || Ring.Z();
            var i, l = m.length, x, y;
            for (i=0; i<l; i++)
            {
                x = m[i][j0]; y = m[i][j1];
                m[i][j0] = ring.cast(a.mul(x).add(c.mul(y)));
                m[i][j1] = ring.cast(b.mul(x).add(d.mul(y)));
            }
            return m;
        }

        ,toString: function( m, bar ) {
            if ( !is_array(m) ) return String(m);
            bar = String(bar || '|');
            // compute length of greatest entry in matrix (per column)
            // so to pad other entries (in same column) same to aling properly
            var max = is_array(m[0]) ? array(m[0].length, 0) : 0;
            m = m.map(function(mi, i){
                if ( is_array(mi) )
                {
                    return mi.map(function(mij, j){
                        var s = String(mij);
                        if ( is_array(max) )
                        {
                            if ( s.length > max[j] )
                                max[j] = s.length;
                        }
                        else
                        {
                            if ( s.length > max )
                                max = s.length;
                        }
                        return s;
                    });
                }
                else
                {
                    var s = String(mi);
                    if ( is_array(max) )
                    {
                        if ( s.length > max[0] )
                            max[0] = s.length;
                    }
                    else
                    {
                        if ( s.length > max )
                            max = s.length;
                    }
                    return s;
                }
            });

            return m.map(function(mi, i){
                return bar + (is_array(mi) ? mi.map(function(mij, j){return pad(mij, is_array(max) ? max[j] : max);}).join(' ') : pad(mi, is_array(max) ? max[0] : max)) + bar;
            }).join("\n");
        }
        ,toTex: function( m, type ) {
            if ( !is_array(m) ) return Tex(m);
            type = 'pmatrix'===type ? 'pmatrix' : 'bmatrix';
            return '\\begin{'+type+'}'+m.map(function(x){return is_array(x) ? x.map(function(xi){return Tex(xi);}).join(' & ') : Tex(x);}).join(' \\\\ ')+'\\end{'+type+'}';
        }
        ,toDec: function( m, precision, bar ) {
            if ( !is_array(m) ) return is_callable(m.toDec) ? m.toDec(precision) : String(m);
            bar = String(bar || '|');
            // compute length of greatest entry in matrix (per column)
            // so to pad other entries (in same column) same to aling properly
            var max = is_array(m[0]) ? array(m[0].length, 0) : 0;
            m = m.map(function(mi, i){
                if ( is_array(mi) )
                {
                    return mi.map(function(mij, j){
                        var d = mij.toDec(precision);
                        if ( is_array(max) )
                        {
                            if ( d.length > max[j] )
                                max[j] = d.length;
                        }
                        else
                        {
                            if ( d.length > max )
                                max = d.length;
                        }
                        return d;
                    });
                }
                else
                {
                    var d = mi.toDec(precision);
                    if ( is_array(max) )
                    {
                        if ( d.length > max[0] )
                            max[0] = d.length;
                    }
                    else
                    {
                        if ( d.length > max )
                            max = d.length;
                    }
                    return d;
                }
            });
            return m.map(function(mi, i){
                return bar + (is_array(mi) ? mi.map(function(mij, j){return pad(mij, is_array(max) ? max[j] : max);}).join(' ') : pad(mi, is_array(max) ? max[0] : max)) + bar;
            }).join("\n");
        }
    }

    ,nr: 0
    ,nc: 0
    ,val: null
    ,ring: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_t: null
    ,_h: null
    ,_a: null
    ,_i: null
    ,_gi: null
    ,_p: null
    ,_snf: null
    ,_lu: null
    ,_qr: null
    ,_ldl: null
    ,_ref: null
    ,_rref: null
    ,_rf: null
    ,_evd: null
    ,_svd: null
    ,_rn: null
    ,_ln: null
    ,_rs: null
    ,_cs: null
    ,_tr: null
    ,_det: null

    ,dispose: function( ) {
        var self = this;
        if ( self._n && (self === self._n._n) )
        {
            self._n._n = null;
        }
        if ( self._t && (self === self._t._t) )
        {
            self._t._t = null;
            /*self._t._tr = null;
            self._t._det = null;*/
        }
        if ( self._h && (self === self._h._h) )
        {
            self._h._h = null;
        }
        if ( self._i && (self === self._i._i) )
        {
            self._i._i = null;
        }
        if ( self._gi && (self === self._gi._gi) )
        {
            self._gi._gi = null;
        }
        self.nr = null;
        self.nc = null;
        self.val = null;
        self.ring = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._t = null;
        self._h = null;
        self._a = null;
        self._i = null;
        self._gi = null;
        self._p = null;
        self._snf = null;
        self._lu = null;
        self._qr = null;
        self._ldl = null;
        self._ref = null;
        self._rref = null;
        self._rf = null;
        self._evd = null;
        self._svd = null;
        self._rn = null;
        self._ln = null;
        self._rs = null;
        self._cs = null;
        self._tr = null;
        self._det = null;
        return self;
    }

    ,clone: function( raw ) {
        var self = this, m = self.val.map(function(row){return row.slice();});
        return true===raw ? m : new Matrix(self.ring, m);
    }
    ,map: function( f, raw ) {
        var self = this, m;
        m = self.val.map(function(vi, i){
            return vi.map(function(vij, j){
                return f(vij, [i, j], self);
            });
        });
        return true===raw ? m : new Matrix(self.ring, m);
    }
    ,array: function( column_order ) {
        var self = this;
        // return matrix as 1-D array of stacking row after row or column after column (if column_order)
        return column_order ? array(self.nr*self.nc, function(k){
            return self.val[k % self.nr][~~(k / self.nr)];
        }) : array(self.nr*self.nc, function(k){
            return self.val[~~(k / self.nc)][k % self.nc];
        });
    }
    ,row: function( r ) {
        var self = this;
        return 0<=r && r<self.nr ? self.val[r].slice() : null;
    }
    ,col: function( c ) {
        var self = this;
        return 0<=c && c<self.nc ? array(self.nr, function(i){return self.val[i][c];}) : null;
    }
    ,diag: function( k ) {
        // k = 0 chooses center diagonal, k>0 chooses diagonal to the right, k<0 diagonal to the left
        var self = this, r, c;
        k = k || 0; r = 0 < k ? 0 : -k; c = r ? 0 : k;
        return 0<=c && c<self.nc && 0<=r && r<self.nr ? array(stdMath.min(self.nr-r, self.nc-c), function(i){return self.val[r+i][c+i];}) : null;
    }
    ,entry: function( r, c, v ) {
        var self = this, rows = self.nr, columns = self.nc;
        if ( 0 > r ) r += rows;
        if ( 0 > c ) c += columns;
        if ( !(0<=r && r<rows && 0<=c && c<columns) ) return null==v ? null : self;
        if ( null != v )
        {
            v = self.ring.cast(v);
            if ( !self.val[r][c].equ(v) )
            {
                // force update of associated cached entries
                if ( self._n && (self === self._n._n) )
                {
                    self._n._n = null;
                }
                if ( self._t && (self === self._t._t) )
                {
                    self._t._t = null;
                    //self._t._tr = null;
                    //self._t._det = null;
                }
                if ( self._h && (self === self._h._h) )
                {
                    self._h._h = null;
                }
                if ( self._i && (self === self._i._i) )
                {
                    self._i._i = null;
                }
                if ( self._gi && (self === self._gi._gi) )
                {
                    self._gi._gi = null;
                }
                self._str = null;
                self._tex = null;
                self._n = null;
                self._t = null;
                self._h = null;
                self._a = null;
                self._i = null;
                self._gi = null;
                self._p = null;
                self._snf = null;
                self._lu = null;
                self._qr = null;
                self._ldl = null;
                self._ref = null;
                self._rref = null;
                self._rf = null;
                self._evd = null;
                self._svd = null;
                self._rn = null;
                self._ln = null;
                self._rs = null;
                self._cs = null;
                self._tr = null;
                self._det = null;
                self.val[r][c] = v;
            }
            return self;
        }
        return self.val[r][c];
    }

    ,isSquare: function( ) {
        var self = this;
        return self.nr===self.nc;
    }
    ,isScalar: function( ) {
        var self = this;
        return (1===self.nr) && (1===self.nc);
    }
    ,isInt: function( ) {
        var self = this, r = self.nr, c = self.nc, i, j;
        if ( is_class(self.ring.NumberClass, Integer) ) return true;
        for(i=0; i<r; i++)
        {
            for(j=0; j<c; j++)
            {
                if ( !self.val[i][j].isInt() )
                    return false;
            }
        }
        return true;
    }
    ,isReal: function( ) {
        var self = this, r = self.nr, c = self.nc, i, j;
        if ( !is_class(self.ring.NumberClass, Complex) ) return true;
        for(i=0; i<r; i++)
        {
            for(j=0; j<c; j++)
            {
                if ( !self.val[i][j].isReal() )
                    return false;
            }
        }
        return true;
    }
    ,isImag: function( ) {
        var self = this, r = self.nr, c = self.nc, i, j;
        if ( !is_class(self.ring.NumberClass, Complex) ) return false;
        for(i=0; i<r; i++)
        {
            for(j=0; j<c; j++)
            {
                if ( !self.val[i][j].isImag() )
                    return false;
            }
        }
        return true;
    }

    ,equ: function( a, eq_all ) {
        var self = this, i, j, r = self.nr, c = self.nc;

        if ( is_instance(a, Matrix) )
        {
            if ( (r !== a.nr) || (c !== a.nc) ) return false;
            for(i=0; i<r; i++)
                for(j=0; j<c; j++)
                    if ( !self.val[i][j].equ(a.val[i][j]) )
                        return false;
            return true;
        }
        //a = self.ring.cast(a);
        if ( true===eq_all )
        {
            for(i=0; i<r; i++)
                for(j=0; j<c; j++)
                    if ( !self.val[i][j].equ(a) )
                        return false;
            return true;
        }
        else
        {
            return (1===r) && (1===c) && self.val[0][0].equ(a);
        }
        return false;
    }
    ,gt: function( a ) {
        var self = this;
        if ( 1===self.nr && 1===self.nc ) return self.val[0][0].gt(a);
        return false;
    }
    ,gte: function( a ) {
        var self = this;
        if ( 1===self.nr && 1===self.nc ) return self.val[0][0].gte(a);
        return false;
    }
    ,lt: function( a ) {
        var self = this;
        if ( 1===self.nr && 1===self.nc ) return self.val[0][0].lt(a);
        return false;
    }
    ,lte: function( a ) {
        var self = this;
        if ( 1===self.nr && 1===self.nc ) return self.val[0][0].lte(a);
        return false;
    }

    ,real: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
            return self.map(function(vij){return vij.real();});
        return self;
    }
    ,imag: function( ) {
        var self = this, ring = self.ring;
        if ( is_class(ring.NumberClass, Complex) )
            return self.map(function(vij){return vij.imag();});
        return Matrix.Zero(ring, self.nr, self.nc);
    }
    ,neg: function( ) {
        var self = this;
        if ( null == self._n )
        {
            self._n = self.map(function(vij){return vij.neg();});
            self._n._n = self;
        }
        return self._n;
    }
    ,t: function( ) {
        // transpose
        var self = this;
        if ( null == self._t )
        {
            self._t = Matrix(self.ring, Matrix.T(self.val));
            self._t._t = self; // avoid recomputations we have it already
            self._t._tr = self._tr; // same for transpose
            self._t._det = self._det; // same for transpose
        }
        return self._t;
    }
    ,h: function( ) {
        // hermitian transpose
        var self = this, ring, rows, columns;
        if ( self.ring.NumberClass!==Complex ) return self.t();
        if ( null == self._h )
        {
            ring = self.ring; rows = self.nr; columns = self.nc;
            self._h = Matrix(ring, array(columns, function(j){
                return array(rows, function(i){
                    return self.val[i][j].conj();
                });
            }));
            self._h._h = self;
        }
        return self._h;
    }
    ,inv: function( ) {
        var self = this, rows, columns, ring, field, rref;
        if ( null == self._i )
        {
            rows = self.nr; columns = self.nc;
            if ( rows !== columns )
            {
                // only for square matrices
                self._i = false;
            }
            else
            {
                ring = self.ring;
                // compute inverse through augmented rref (Gauss-Jordan method)
                rref = self.concat(Matrix.I(ring, columns)).rref(false, [rows, columns]);
                if ( rref.val[rows-1][columns-1].equ(ring.Zero()) )
                {
                    // not full-rank, no inverse
                    self._i = false;
                }
                else
                {
                    // full-rank, has inverse, generaly in the field of fractions
                    field = ring.associatedField();
                    self._i = Matrix(field, rref.slice(0, columns, rows-1, 2*columns-1).map(function(rref_ij, ij){
                        return field.cast(rref_ij).div(field.cast(rref.val[ij[0]][ij[0]]));
                    }, true));
                    self._i._i = ring.isField() ? self : Matrix(field, self);
                }
            }
        }
        return self._i;
    }
    ,ginv: function( ) {
        // generalised inverse / Moore-Penrose Inverse
        // https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse
        var A = this, ring, field, rows, columns, rank, rf, C, F;
        if ( null == A._gi )
        {
            rows = A.nr; columns = A.nc;
            ring = A.ring;
            field = ring.associatedField();
            if ( A.equ(ring.Zero(), true) )
            {
                // zero matrix, ginv is transpose
                A._gi = A.t();
            }
            else if ( 1===rows && 1===columns )
            {
                // scalar, ginv is inverse
                A._gi = Matrix(field, [[field.cast(A.val[0][0]).inv()]]);
            }
            else if ( 1===rows || 1===columns )
            {
                // vector, ginv is transpose divided by square norm
                C = field.cast(A.array().reduce(function(s, ai){
                    return s.add(ai.mul(ai.conj()));
                }, ring.Zero()));
                A._gi = Matrix(field, A.h().map(function(aij, ij){
                    return field.cast(aij).div(C);
                }, true));
            }
            else
            {
                rank = A.rank();
                if ( rank === columns )
                {
                    // linearly independent columns
                    if ( rows === columns )
                    {
                        // invertible, ginv is inverse
                        A._gi = A.inv();
                    }
                    else
                    {
                        // A+ = inv(Ah * A) * Ah
                        A._gi = A.h().mul(A).inv().mul(A.h());
                    }
                }
                else if ( rank === rows )
                {
                    // linearly independent rows
                    // A+ = Ah * inv(A * Ah)
                    A._gi = A.h().mul(A.mul(A.h()).inv());
                }
                else
                {
                    // general matrix, through rank factorisation
                    // A = C F <=> A+ = F+ C+
                    // where F+ = Fh * inv(F * Fh) and C+ = inv(Ch * C) * Ch
                    rf = A.rankf(); C = rf[0]; F = rf[1];
                    A._gi = F.h().mul(F.mul(F.h()).inv()).mul(C.h().mul(C).inv().mul(C.h()));
                }
            }
            A._gi._gi = ring.isField() ? A : Matrix(field, A);
        }
        return A._gi;
    }
    ,minor: function( ai, aj, cofactor ) {
        // https://en.wikipedia.org/wiki/Minor_(linear_algebra)
        var self = this, rows = self.nr, columns = self.nc, ring = self.ring, m;
        if ( rows !== columns ) return null;
        if ( 1>=rows ) return ring.Zero();
        ai = +(ai||0); aj = +(aj||0);
        if ( ai<0 || ai>=rows || aj<0 || aj>=columns ) return null;
        m = Matrix(ring, array(rows-1, function(i){
            if ( i>=ai ) i++;
            return array(columns-1, function(j){
                if ( j>=aj ) j++;
                return self.val[i][j];
            });
        })).det();
        if ( (true === cofactor) && ((ai+aj)&1) ) m = m.neg();
        return m;
    }
    ,adj: function( ) {
        // https://en.wikipedia.org/wiki/Adjugate_matrix
        // https://en.wikipedia.org/wiki/Minor_(linear_algebra)#Inverse_of_a_matrix
        // https://en.wikipedia.org/wiki/Cramer%27s_rule
        var self = this, rows, columns, ring;
        if ( null == self._a )
        {
            rows = self.nr; columns = self.nc;
            if ( rows !== columns )
            {
                self._a = false;
            }
            else
            {
                ring = self.ring;
                self._a = Matrix(ring, array(columns, function(j){
                    return array(rows, function(i){
                        return self.minor(i, j, true);
                    });
                }));
            }
        }
        return self._a;
    }
    ,charpoly: function( x ) {
        // https://en.wikipedia.org/wiki/Characteristic_polynomial
        // https://en.wikipedia.org/wiki/Faddeev%E2%80%93LeVerrier_algorithm
        // https://en.wikipedia.org/wiki/Samuelson%E2%80%93Berkowitz_algorithm
        var A = this, rows = A.nr, columns = A.nc, ring, k, n, M, coeff;
        if ( rows !== columns ) return null; // only for square matrices
        if ( null == A._p )
        {
            x = String(x || 'x');
            ring = A.ring;
            n = rows;
            coeff = new Array(n+1);
            M = Matrix(ring, n, n); // zero
            coeff[n] = ring.One();
            for(k=1; k<=n; k++)
            {
                M = A.mul(M).map(function(vij, ij){
                    // .add(I.mul(coeff[n-k+1]))
                    return ij[0]===ij[1] ? vij.add(coeff[n-k+1]) : vij;
                });
                coeff[n-k] = A.mul(M).tr().div(-k);
            }
            A._p = ring.PolynomialClass ? Polynomial(coeff.map(function(c){return RationalFunc(c);}), x, ring.CoefficientRing) : Polynomial(coeff, x, ring);
        }
        return A._p;
    }

    ,add: function( a ) {
        var self = this;

        if ( is_instance(a, Matrix) )
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= a.nr ) return self.val[i].slice();
                else if ( i >= self.nr ) return a.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= a.nc ) return self.val[i][j];
                    else if ( j >= self.nc ) return a.val[i][j];
                    return self.val[i][j].add(a.val[i][j]);
                });
            }));
        }
        if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
        return self.map(function(vij){return vij.add(a);});
    }
    ,sub: function( a ) {
        var self = this;

        if ( is_instance(a, Matrix) )
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= a.nr ) return self.val[i].slice();
                else if ( i >= self.nr ) return a.val[i].map(function(aij){return Arithmetic.neg(aij);});
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= a.nc ) return self.val[i][j];
                    else if ( j >= self.nc ) return Arithmetic.neg(a.val[i][j]);
                    return self.val[i][j].sub(a.val[i][j]);
                });
            }));
        }
        if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
        return self.map(function(vij){return vij.sub(a);});
    }
    ,mul: function( a ) {
        var self = this, n, zero;

        if ( is_instance(a, Matrix) )
        {
            //if ( self.nc !== a.nr ) return null; // dims do not match for multiplication
            n = stdMath.min(self.nc, a.nr); // generalise multiplication
            zero = self.ring.Zero();
            return Matrix(self.ring, array(self.nr, function(i){
                return array(a.nc, function(j){
                    for(var d=zero,k=0; k<n; k++)
                        d = d.add(self.val[i][k].mul(a.val[k][j]));
                    return d;
                });
            }));
        }
        if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
        return self.map(function(vij){return vij.mul(a);});
    }
    ,dot: function( a ) {
        var self = this;
        // pointwise multiplication

        if ( is_instance(a, Matrix) )
        {
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= self.nr ) return a.val[i].slice();
                else if ( i >= a.nr ) return self.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= self.nc ) return a.val[i][j];
                    else if ( j >= a.nc ) return self.val[i][j];
                    return self.val[i][j].mul(a.val[i][j]);
                })
            }));
        }
        if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
        return self.map(function(vij){return vij.mul(a);});
    }
    ,prod: function( a ) {
        var self = this, r1, c1, r2, c2, r, c;
        // kronecker product

        if ( is_instance(a, Matrix) )
        {
            r1 = self.nr; c1 = self.nc;
            r2 = a.nr; c2 = a.nc;
            r = r1*r2; c = c1*c2;
            return Matrix(self.ring, array(r, function(i){
                var i1 = ~~(i / r2), i2 = i % r2;
                return array(c, function(j){
                    var j1 = ~~(j / c2), j2 = j % c2;
                    return self.val[i1][j1].mul(a.val[i2][j2]);
                });
            }));
        }
        if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
        return self.map(function(vij){return vij.mul(a);});
    }
    ,div: function( a ) {
        var self = this;
        if ( is_instance(a, Numeric) || Abacus.Arithmetic.isNumber(a) || is_string(a) )
        {
            if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
            return self.map(function(vij){return vij.div(a);});
        }
        return self;
    }
    ,mod: function( a ) {
        var self = this;
        if ( is_instance(a, Numeric) || Abacus.Arithmetic.isNumber(a) || is_string(a) )
        {
            if ( is_number(a) || is_string(a) ) a = self.ring.cast(a);
            return self.map(function(vij){return vij.mod(a);});
        }
        return self;
    }
    ,divmod: function( a ) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        n = Integer.cast(n);
        if ( n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n.num);
        if ( 0 === n )
        {
            return Matrix.I(self.ring, /*stdMath.min(self.nr,*/ self.nc/*)*/);
        }
        else if ( 1 === n )
        {
            return self;
        }
        else
        {
            // exponentiation by squaring
            pow = null; b = self;
            while ( 0 !== n )
            {
                if ( n & 1 ) pow = null == pow ? b : b.mul(pow);
                n >>= 1;
                b = b.mul(b);
            }
            return pow;
        }
    }
    ,fwdsub: function( b, D ) {
        // self is assumed lower triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, L = self.val, n, x, xi, Lii;
        if ( is_instance(b, Matrix) ) b = b.col(0);
        if ( is_instance(D, Matrix) ) D = D.diag();
        b = ring.cast(b); if ( D ) D = ring.cast(D);
        n = stdMath.min(self.nr, self.nc, b.length);
        x = new Array(n);
        // fraction-free forward substitution
        for(i=0; i<n; i++)
        {
            for(t=O,j=0; j<i; j++) t = t.add(L[i][j].mul(x[j]));
            xi = b[i].sub(t); Lii = L[i][i];
            if ( Lii.equ(O) )
            {
                if ( !xi.equ(O) )
                    return null; // no solution
            }
            else
            {
                if ( D )
                    xi = xi.mul(D[i].div(Lii));
                else if ( Lii.divides(xi)  )
                    xi = xi.div(Lii);
                else
                    return null; // no solution
            }
            x[i] = xi;
        }
        return x;
    }
    ,backsub: function( b, D ) {
        // self is assumed upper triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, U = self.val, n, x, xi, Uii;
        if ( is_instance(b, Matrix) ) b = b.col(0);
        if ( is_instance(D, Matrix) ) D = D.diag();
        b = ring.cast(b); if ( D ) D = ring.cast(D);
        n = stdMath.min(self.nr, self.nc, b.length);
        x = new Array(n);
        // fraction-free back substitution
        for(i=n-1; i>=0; i--)
        {
            for(t=O,j=n-1; j>i; j--) t = t.add(U[i][j].mul(x[j]));
            xi = b[i].sub(t); Uii = U[i][i];
            if ( Uii.equ(O) )
            {
                if ( !xi.equ(O) )
                    return null; // no solution
            }
            else
            {
                if ( D )
                    xi = xi.mul(D[i].div(Uii));
                else if ( Uii.divides(xi) )
                    xi = xi.div(Uii);
                else
                    return null; // no solution
            }
            x[i] = xi;
        }
        return x;
    }
    ,backsuby: function( y ) {
        // self is assumed upper triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, U = self.val, n, x, xi, Uii;
        if ( is_instance(y, Matrix) ) y = y.col(0);
        y = ring.cast(y);
        n = stdMath.min(self.nr, self.nc, y.length);
        x = new Array(n);
        // fraction-free back substitution (alternative version)
        // y is solution of lower triangular system L*inv(D)*y = P*b
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        for(i=n-1; i>=0; i--)
        {
            for(t=O,j=n-1; j>i; j--) t = t.add(U[i][j].mul(x[j]));
            xi = U[n-1][n-1].mul(y[i]).sub(t); Uii = U[i][i];
            if ( !Uii.divides(xi) )
                return null; // no solution
            else
                xi = xi.div(Uii);
            x[i] = xi;
        }
        return x;
    }
    ,snf: function( ) {
        var self = this, ring, O, I, J, rows, columns, dim, m, left, right,
            last_j, i, j, upd, ii, jj, non_zero, i1, i0, g,
            coef1, coef2, coef3, coef4, coef5, tmp, tmp2;
        // smith normal form
        // https://en.wikipedia.org/wiki/Smith_normal_form
        // adapted from Smith Normal Form with sympy (https://gist.github.com/qnighy/ec08799484080343a2da297657ccba65)
        if ( null == self._snf )
        {
            ring = self.ring;
            if ( !ring.hasGCD() )
            {
                self._snf = false;
            }
            else
            {
                O = ring.Zero();
                I = ring.One();
                J = ring.MinusOne();
                rows = self.nr; columns = self.nc;
                dim = stdMath.min(rows, columns);
                m = self.clone(); left = Matrix.I(ring, rows); right = Matrix.I(ring, columns)
                last_j = -1;
                for(i=0; i<rows; i++)
                {
                    non_zero = false;
                    for(j=last_j+1; j<columns; j++)
                    {
                        for(i0=0; i0<rows; i0++)
                            if ( !m.val[i0][j].equ(O) )
                                break;
                        if ( i0 < rows )
                        {
                            non_zero = true;
                            break;
                        }
                    }
                    if ( !non_zero ) break;

                    if ( m.val[i][j].equ(O)  )
                    {
                        for(ii=0; ii<rows; ii++)
                            if ( !m.val[ii][j].equ(O) )
                                break;
                        Matrix.MULR(ring, m.val, i, ii, O, I, I, O);
                        Matrix.MULC(ring, left.val, i, ii, O, I, I, O);
                    }
                    Matrix.MULC(ring, m.val, j, i, O, I, I, O);
                    Matrix.MULR(ring, right.val, j, i, O, I, I, O);
                    j = i;
                    upd = true;
                    while ( upd )
                    {
                        upd = false;
                        for(ii=i+1; ii<rows; ii++)
                        {
                            if ( m.val[ii][j].equ(O) ) continue;
                            upd = true;
                            if ( !m.val[i][j].divides(m.val[ii][j]) )
                            {
                                g = ring.xgcd(m.val[i][j], m.val[ii][j]);
                                coef1 = g[1]; coef2 = g[2];
                                coef3 = m.val[ii][j].div(g[0]);
                                coef4 = m.val[i][j].div(g[0]);
                                Matrix.MULR(ring, m.val, i, ii, coef1, coef2, coef3.neg(), coef4);
                                Matrix.MULC(ring, left.val, i, ii, coef4, coef2.neg(), coef3, coef1);
                            }
                            coef5 = m.val[ii][j].div(m.val[i][j]);
                            Matrix.MULR(ring, m.val, i, ii, I, O, coef5.neg(), I);
                            Matrix.MULC(ring, left.val, i, ii, I, O, coef5, I);
                        }
                        for(jj=j+1; jj<columns; jj++)
                        {
                            if ( m.val[i][jj].equ(O) ) continue;
                            upd = true;
                            if ( !m.val[i][j].divides(m.val[i][jj]) )
                            {
                                g = ring.xgcd(m.val[i][j], m.val[i][jj]);
                                coef1 = g[1]; coef2 = g[2];
                                coef3 = m.val[i][jj].div(g[0]);
                                coef4 = m.val[i][j].div(g[0]);
                                Matrix.MULC(ring, m.val, j, jj, coef1, coef3.neg(), coef2, coef4);
                                Matrix.MULR(ring, right.val, j, jj, coef4, coef3, coef2.neg(), coef1);
                            }
                            coef5 = m.val[i][jj].div(m.val[i][j]);
                            Matrix.MULC(ring, m.val, j, jj, I, coef5.neg(), O, I);
                            Matrix.MULR(ring, right.val, j, jj, I, coef5, O, I);
                        }
                    }
                    last_j = j;
                }
                for(i1=0; i1<dim; i1++)
                {
                    for(i0=i1-1; i0>=0; i0--)
                    {
                        g = ring.xgcd(m.val[i0][i0], m.val[i1][i1]);
                        if ( g[0].equ(O) ) continue;
                        coef1 = g[1]; coef2 = g[2];
                        coef3 = m.val[i1][i1].div(g[0]);
                        coef4 = m.val[i0][i0].div(g[0]);
                        tmp = coef2.mul(coef3);
                        tmp2 = I.sub(coef1.mul(coef4));
                        Matrix.MULR(ring, m.val, i0, i1, I, coef2, coef3, tmp.sub(I));
                        Matrix.MULC(ring, left.val, i0, i1, I.sub(tmp), coef2, coef3, J);
                        Matrix.MULC(ring, m.val, i0, i1, coef1, tmp2, I, coef4.neg());
                        Matrix.MULR(ring, right.val, i0, i1, coef4, tmp2, I, coef1.neg());
                    }
                }
                self._snf = [m/*diagonal center matrix*/, left/*left matrix*/, right/*right matrix*/];
            }
        }
        return self._snf ? self._snf.slice() : self._snf;
    }
    ,evd: function( ) {
        // eigendecomposition (using the power method)
        // https://en.wikipedia.org/wiki/Spectral_theorem
        // https://en.wikipedia.org/wiki/Eigendecomposition_of_a_matrix
        // https://en.wikipedia.org/wiki/Diagonalizable_matrix
        // https://en.wikipedia.org/wiki/Power_iteration
        var self = this, ring = self.ring, m = self.nr, n = self.nc, epsilon, matrixFor1D, e, u, i, j, es, us;
        return null;

        if ( ring.isSymbolic() || (m !== n) || !self.h().equ(self) ) return null; // only for square symmetric/hermitian diagonalisable numeric matrices

        function pow1(A, x, eps, max_iter) {
            var x0 = null, iter = 0, norm;
            if ( is_class(ring.NumberClass, Complex) )
            {
                norm = x.h().mul(x).val[0][0];
                if ( norm.equ(0) ) return null;
                x = x.div(norm.rad(2));
                while(true)
                {
                    iter++;
                    x0= x;
                    x = A.mul(x);
                    norm = x.h().mul(x).val[0][0];
                    if ( norm.equ(0) ) return null;
                    x = x.div(norm.rad(2));
                    if ( (null != max_iter) && (iter >= max_iter) ) break;
                    if ( x.h().mul(x0).val[0][0].norm().add(eps).gt(1) ) break;
                }
            }
            else
            {
                norm = x.t().mul(x).val[0][0];
                if ( norm.equ(0) ) return null;
                x = x.div(norm.rad(2));
                while(true)
                {
                    iter++;
                    x0 = x;
                    x = A.mul(x);
                    norm = x.t().mul(x).val[0][0];
                    if ( norm.equ(0) ) return null;
                    x = x.div(norm.rad(2));
                    if ( (null != max_iter) && (iter >= max_iter) ) break;
                    if ( x.t().mul(x0).val[0][0].abs().add(eps).gt(1) ) break;
                }
            }
            return x;
        }

        if ( null == self._evd )
        {
            if ( !ring.isField() )
            {
                u = Matrix(ring.associatedField(), self);
                u.evd();
                self._evd = u._evd;
            }
            else
            {
                epsilon = Rational.Epsilon();
                es = []; us = [];
                matrixFor1D = self;
                for(i=0; i<n; i++)
                {
                    u = pow1(matrixFor1D, Matrix(ring, self.col(i)), epsilon, 10); // next eigen vector
                    if ( null == u )
                    {
                        self._evd = false; // non diagonalisable
                        break;
                    }
                    e = u.h().mul(self.mul(u)).val[0][0].div(u.h().mul(u).val[0][0]); // next eigen value
                    es.push(e); us.push(u);
                    matrixFor1D = matrixFor1D.sub(u.mul(u.h()).mul(e));
                }
                if ( false!==self._evd ) self._evd = [Matrix(ring, es), Matrix(ring, Matrix.T(us.map(function(u){return u.col(0);})))/*, Matrix(ring, us).inv||.h()*/];
            }
        }
        return false===self._evd ? null : self._evd.slice();
    }
    ,svd: function( ) {
        // singular value decomposition
        // https://en.wikipedia.org/wiki/Singular_value_decomposition
        var self = this, ring = self.ring,
            m = self.nr, n = self.nc, a, nu, ni, s, U, V, e, work, si, i,
            nct, nrt, mrc, k, j, t, p, pp, iter, eps, kase, alpha, ks,
            f, cs, sn, scale, sp, spm1, epm1, sk, ek, b, c, shift, g, MIN_VAL,
            evd, wantu = true, wantv = true, Epsilon, Limit;

        return null;
        // only for real numeric fields (ie Rationals)
        if ( ring.isSymbolic() || !ring.isReal() ) return null;

        if ( null == self._svd )
        {
            // svd from evd of A.T*A or A*A.T
            if ( !ring.isField() )
            {
                self._svd = Matrix(ring.associatedField(), self).svd();
            }
            else if ( m > n )
            {
                // get svd of transpose and transpose
                s = self.t().svd();
                self._svd = [s[0], s[2].t(), s[1].t()];
            }
            else
            {
                evd = self.mul(self.t()).evd();
                U = evd[1];
                V = self.t().mul(U);
                s = array(V.nc, function(i){var vm = Matrix(ring, V.col(i)); return vm.t().mul(vm).val[0][0].rad(2);});
                V = V.map(function(vij, ij){return vij.div(s[ij[1]]);});
                self._svd = [Matrix(ring, s), U.t(), V];
            }
        }
        return self._svd.slice();

        function hypotenuse(a, b) {
            var r;
            if ( a.abs().gt(b.abs()) )
            {
                r = b.div(a);
                return a.abs().mul(r.mul(r).add(ring.One()).rad(2));
            }
            if ( !b.equ(ring.Zero()) )
            {
                r = a.div(b);
                return b.abs().mul(r.mul(r).add(ring.One()).rad(2));
            }
            return ring.Zero();
        }

        if ( null == self._svd )
        {
            if ( !ring.isField() )
            {
                self._svd = Matrix(ring.associatedField(), self).svd();
            }
            else if ( m < n )
            {
                // get svd of transpose and transpose
                s = self.t().svd();
                self._svd = [s[0], s[2].t(), s[1].t()];
            }
            else
            {
                // this version of svd adapted from https://github.com/mljs/matrix
                Epsilon = Rational.Epsilon();
                Limit = Epsilon.inv().integer();

                a = self.clone(true);
                nu = stdMath.min(m, n);
                ni = stdMath.min(m + 1, n);
                s = new Array(ni);
                U = Matrix(ring, m, nu);
                V = Matrix(ring, n, n);

                e = new Array(n);
                work = new Array(m);

                si = new Array(ni);
                for(i=0; i<ni; i++) si[i] = i;

                nct = stdMath.min(m - 1, n);
                nrt = stdMath.max(0, stdMath.min(n - 2, m));
                mrc = stdMath.max(nct, nrt);

                for(k=0; k<mrc; k++)
                {
                    if ( k<nct )
                    {
                        s[k] = ring.Zero();
                        for(i=k; i<m; i++) s[k] = hypotenuse(s[k], a[i][k]);
                        if ( !s[k].equ(0) )
                        {
                            if ( a[k][k].lt(0) ) s[k] = s[k].neg();
                            for(i=k; i<m; i++) a[i][k] = a[i][k].div(s[k]);
                            a[k][k] = a[k][k].add(1);
                        }
                        s[k] = s[k].neg();
                    }

                    for(j=k+1; j<n; j++)
                    {
                        if ( k<nct && !s[k].equ(0) )
                        {
                            t = ring.Zero();
                            for(i=k; i<m; i++) t = t.add(a[i][k].mul(a[i][j]));
                            t = t.neg().div(a[k][k]);
                            for(i=k; i<m; i++) a[i][j] = a[i][j].add(t.mul(a[i][k]));
                        }
                        e[j] = a[k][j];
                    }

                    if ( wantu && k<nct )
                        for(i=k; i<m; i++) U.val[i][k] = a[i][k];

                    if ( k<nrt )
                    {
                        e[k] = ring.Zero();
                        for(i=k+1; i<n; i++) e[k] = hypotenuse(e[k], e[i]);
                        if ( !e[k].equ(0) )
                        {
                            if ( e[k + 1].lt(0) ) e[k] = e[k].neg();
                            for(i=k+1; i<n; i++) e[i] = e[i].div(e[k]);
                            e[k + 1] = e[k + 1].add(1);
                        }
                        e[k] = e[k].neg();
                        if ( k+1<m && !e[k].equ(0) )
                        {
                            for(i=k+1; i<m; i++) work[i] = ring.Zero();
                            for(i=k+1; i<m; i++)
                                for(j=k+1; j<n; j++) work[i] = work[i].add(e[j].mul(a[i][j]));

                            for(j=k+1; j<n; j++)
                            {
                                t = e[j].neg().div(e[k + 1]);
                                for(i=k+1; i<m; i++) a[i][j] = a[i][j].add(t.mul(work[i]));
                            }
                        }
                        if ( wantv )
                        {
                            for(i=k+1; i<n; i++) V.val[i][k] = e[i];
                        }
                    }
                }

                p = stdMath.min(n, m + 1);
                if ( nct<n ) s[nct] = a[nct][nct];
                if ( m<p ) s[p - 1] = ring.Zero();
                if ( nrt+1 < p ) e[nrt] = a[nrt][p - 1];
                e[p - 1] = ring.Zero();

                if ( wantu )
                {
                    for(j=nct; j<nu; j++)
                    {
                        for(i=0; i<m; i++) U.val[i][j] = ring.Zero();
                        U.val[j][j] = ring.One();
                    }
                    for(k=nct-1; k>=0; k--)
                    {
                        if ( !s[k].equ(0) )
                        {
                            for(j=k+1; j<nu; j++)
                            {
                                t = ring.Zero();
                                for(i=k; i<m; i++) t = t.add(U.val[i][k].mul(U.val[i][j]));
                                t = t.neg().div(U.val[k][k]);
                                for(i=k; i<m; i++) U.val[i][j] = U.val[i][j].add(t.mul(U.val[i][k]));
                            }
                            for(i=k; i<m; i++) U.val[i][k] = U.val[i][k].neg();
                            U.val[k][k] = U.val[k][k].add(1);
                            for(i=0; i<k-1; i++) U.val[i][k] = ring.Zero();
                        }
                        else
                        {
                            for(i=0; i<m; i++) U.val[i][k] = ring.Zero();
                            U.val[k][k] = ring.One();
                        }
                    }
                }

                if ( wantv )
                {
                    for(k=n-1; k>=0; k--)
                    {
                        if ( k<nrt && !e[k].equ(0) )
                        {
                            for(j=k+1; j<n; j++)
                            {
                                t = ring.Zero();
                                for(i=k+1; i<n; i++) t = t.add(V.val[i][k].mul(V.val[i][j]));
                                t = t.neg().div(V.val[k + 1][k]);
                                for(i=k+1; i<n; i++) V.val[i][j] = V.val[i][j].add(t.mul(V.val[i][k]));
                            }
                        }
                        for(i=0; i<n; i++) V.val[i][k] = ring.Zero();
                        V.val[k][k] = ring.One();
                    }
                }

                pp = p - 1;
                iter = 0;
                eps = Epsilon;//ring.cast(Number.EPSILON.toString());
                MIN_VAL = ring.Zero();//ring.cast(Number.MIN_VALUE.toString());
                while( p>0 )
                {
                    for(k=p-2; k>=-1; k--)
                    {
                        if ( k === -1 ) break;
                        alpha = MIN_VAL.add(eps.mul(s[k].add(s[k + 1].abs()).abs()));
                        if ( e[k].abs().lte(alpha) /*|| Number.isNaN(e[k].valueOf())*/ )
                        {
                            e[k] = ring.Zero();
                            break;
                        }
                    }
                    if ( k===p-2 )
                    {
                        kase = 4;
                    }
                    else
                    {
                        for(ks=p-1; ks>=k; ks--)
                        {
                            if ( ks===k ) break;
                            t = (ks !== p ? e[ks].abs() : ring.Zero()).add(ks !== k + 1 ? e[ks - 1].abs() : ring.Zero());
                            if ( s[ks].abs().lte(eps.mul(t)) )
                            {
                                s[ks] = ring.Zero();
                                break;
                            }
                        }
                        if ( ks===k )
                        {
                            kase = 3;
                        }
                        else if ( ks===p-1 )
                        {
                            kase = 1;
                        }
                        else
                        {
                            kase = 2;
                            k = ks;
                        }
                    }

                    k++;
                    switch(kase)
                    {
                        case 1:
                            f = e[p - 2];
                            e[p - 2] = ring.Zero();
                            for(j=p-2; j>=k; j--)
                            {
                                t = hypotenuse(s[j], f);
                                cs = s[j].div(t);
                                sn = f.div(t);
                                s[j] = t;
                                if ( j !== k )
                                {
                                    f = sn.neg().mul(e[j - 1]);
                                    e[j - 1] = cs.mul(e[j - 1]);
                                }
                                if ( wantv )
                                {
                                    for(i=0; i<n; i++)
                                    {
                                        t = cs.mul(V.val[i][j]).add(sn.mul(V.val[i][p - 1]));
                                        V.val[i][p - 1] = sn.neg().mul(V.val[i][j]).add(cs.mul(V.val[i][p - 1]));
                                        V.val[i][j] = t;
                                    }
                                }
                            }
                            break;
                        case 2:
                            f = e[k - 1];
                            e[k - 1] = ring.Zero();
                            for(j=k; j<p; j++)
                            {
                                t = hypotenuse(s[j], f);
                                cs = s[j].div(t);
                                sn = f.div(t);
                                s[j] = t;
                                f = sn.neg().mul(e[j]);
                                e[j] = cs.mul(e[j]);
                                if ( wantu )
                                {
                                    for(i=0; i<m; i++)
                                    {
                                        t = cs.mul(U.val[i][j]).add(sn.mul(U.val[i][k - 1]));
                                        U.val[i][k - 1] = sn.neg().mul(U.val[i][j]).add(cs.mul(U.val[i][k - 1]));
                                        U.val[i][j] = t;
                                    }
                                }
                            }
                            break;
                        case 3:
                            scale = nmax(
                                s[p - 1].abs(),
                                s[p - 2].abs(),
                                e[p - 2].abs(),
                                s[k].abs(),
                                e[k].abs()
                            );
                            sp = s[p - 1].div(scale);
                            spm1 = s[p - 2].div(scale);
                            epm1 = e[p - 2].div(scale);
                            sk = s[k].div(scale);
                            ek = e[k].div(scale);
                            b = spm1.add(sp).mul(spm1.sub(sp)).add(epm1.mul(epm1)).div(2);
                            c = sp.mul(epm1).mul(sp.mul(epm1));
                            shift = ring.Zero();
                            if ( !b.equ(0) || !c.equ(0) )
                            {
                                if ( b.lt(0) ) shift = b.mul(b).add(c).rad(2).neg();
                                else shift = b.mul(b).add(c).rad(2);
                                shift = c.div(b.add(shift));
                            }
                            f = sk.add(sp).mul(sk.sub(sp)).add(shift);
                            g = sk.mul(ek);
                            for(j=k; j<p-1; j++)
                            {
                                t = hypotenuse(f, g);
                                if ( t.equ(0) ) t = MIN_VAL;
                                cs = f.div(t);
                                sn = g.div(t);
                                if ( j !== k ) e[j - 1] = t;
                                f = cs.mul(s[j]).add(sn.mul(e[j]));
                                e[j] = cs.mul(e[j]).sub(sn.mul(s[j]));
                                g = sn.mul(s[j + 1]);
                                s[j + 1] = cs.mul(s[j + 1]);
                                if ( wantv )
                                {
                                    for(i=0; i<n; i++)
                                    {
                                        t = cs.mul(V.val[i][j]).add(sn.mul(V.val[i][j + 1]));
                                        V.val[i][j + 1] = sn.neg().mul(V.val[i][j]).add(cs.mul(V.val[i][j + 1]));
                                        V.val[i][j] = t;
                                    }
                                }
                                t = hypotenuse(f, g);
                                if ( t.equ(0) ) t = MIN_VAL;
                                cs = f.div(t);
                                sn = g.div(t);
                                s[j] = t;
                                f = cs.mul(e[j]).add(sn.mul(s[j + 1]));
                                s[j + 1] = sn.neg().mul(e[j]).add(cs.mul(s[j + 1]));
                                g = sn.mul(e[j + 1]);
                                e[j + 1] = cs.mul(e[j + 1]);
                                if ( wantu && j<m-1 )
                                {
                                    for(i=0; i<m; i++)
                                    {
                                        t = cs.mul(U.val[i][j]).add(sn.mul(U.val[i][j + 1]));
                                        U.val[i][j + 1] = sn.neg().mul(U.val[i][j]).add(cs.mul(U.val[i][j + 1]));
                                        U.val[i][j] = t;
                                    }
                                }
                            }
                            e[p - 2] = f;
                            iter = iter + 1;
                            break;
                        case 4:
                            if ( s[k].lte(0) )
                            {
                                s[k] = s[k].lt(0) ? s[k].neg() : ring.Zero();
                                if ( wantv )
                                {
                                    for(i=0; i<=pp; i++) V.val[i][k] = V.val[i][k].neg();
                                }
                            }
                            while( k<pp )
                            {
                                if ( s[k].gte(s[k + 1]) ) break;
                                t = s[k];
                                s[k] = s[k + 1];
                                s[k + 1] = t;
                                if ( wantv && k<n-1 )
                                {
                                    for(i=0; i<n; i++)
                                    {
                                        t = V.val[i][k + 1];
                                        V.val[i][k + 1] = V.val[i][k];
                                        V.val[i][k] = t;
                                    }
                                }
                                if ( wantu && k<m-1 )
                                {
                                    for(i=0; i<m; i++)
                                    {
                                        t = U.val[i][k + 1];
                                        U.val[i][k + 1] = U.val[i][k];
                                        U.val[i][k] = t;
                                    }
                                }
                                k++;
                            }
                            iter = 0;
                            p--;
                            break;
                        // no default
                    }
                }
                self._svd = [Matrix(ring, s), U, V];
            }
        }
        return self._svd.slice();
    }
    ,lu: function( ) {
        var self = this, ring, O, I, J, n, m, dim, P, L, U, DD,
            oldpivot, k, i, j, kpivot, NotFound, Ukk, Uik, defficient;
        // completely fraction-free LU factorisation
        // https://en.wikipedia.org/wiki/LU_decomposition#LDU_decomposition
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        if ( null == self._lu )
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            n = self.nr; m = self.nc;
            /*
            Completely Fraction free LU factoring(CFFLU)
            Input: A nxm matrix A, with m >= n.
            Output: Four matrices P, L, D, U, where:
                P is a nxn permutation matrix,
                L is a nxn lower triangular matrix,
                D is a nxn diagonal matrix,
                U is a nxm upper triangular matrix
                and P*A = L*inv(D)*U
            */
            defficient = false;
            //dim = stdMath.min(n, m);
            U = self.clone();
            L = Matrix.I(ring, n);
            DD = array(n, function(){return O;});
            P = Matrix.I(ring, n);
            oldpivot = I;
            for(k=0; k<n-1; k++)
            {
                if ( U.val[k][k].equ(O)  )
                {
                    kpivot = k+1;
                    NotFound = true;
                    while(kpivot<n && NotFound)
                    {
                        if ( !U.val[kpivot][k].equ(O)  )
                            NotFound = false;
                        else
                            kpivot++;
                    }
                    if ( n <= kpivot )
                    {
                        // matrix is rank-defficient
                        defficient = true;
                        break;
                    }
                    else
                    {
                        Matrix.SWAPR(U.val, k, kpivot);
                        Matrix.SWAPR(P.val, k, kpivot);
                    }
                }
                Ukk = U.val[k][k];
                L.val[k][k] = Ukk;
                DD[k] = oldpivot.mul(Ukk);
                for(i=k+1; i<n; i++)
                {
                    Uik = U.val[i][k];
                    L.val[i][k] = Uik;
                    for(j=k+1; j<m; j++)
                    {
                        U.val[i][j] = Ukk.mul(U.val[i][j]).sub(U.val[k][j].mul(Uik)).div(oldpivot);
                    }
                    U.val[i][k] = O;
                }
                oldpivot = U.val[k][k];
            }
            if ( !defficient )
            {
                DD[n-1] = oldpivot;
                self._lu = [P, L, Matrix.D(ring, n, n, DD), U];
            }
            else
            {
                self._lu = [];
            }
        }
        return self._lu.slice();
    }
    ,qr: function( ) {
        var self = this, n, m, lu;
        // fraction-free QR factorisation
        // https://en.wikipedia.org/wiki/QR_decomposition
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        if ( null == self._qr )
        {
            n = self.nr; m = self.nc;
            /*
            Fraction free QR factoring(FFQR) based on completely fraction-free LU factoring (CFFLU)
            Input: A nxm matrix A.
            Output: Three matrices: Q, D, R where:
                Q is a nxm left orthogonal matrix,
                D is a mxm diagonal matrix,
                R is a mxm upper triangular matrix
                and A = Q*inv(D)*R

                use CFFLU([A.t*A | A.t]) and extract appropriate factors
            */
            lu = self.t().mul(self).concat(self.t()).lu();
            if ( !lu.length )
                self._qr = [];
            else
                self._qr = [lu[3].slice(0, m, -1, -1).t()/*Q*/, lu[2]/*D*/, lu[1].t()/*R*/];
        }
        return self._qr.slice();
    }
    ,ldl: function( ) {
        // https://en.wikipedia.org/wiki/Cholesky_decomposition#LDL_decomposition_2
        var self = this, rows, columns, ring, field, i, j, k, sum, M, D, L;
        if ( null == self._ldl )
        {
            rows = self.nr; columns = self.nc;
            if ( (rows !== columns) || !self.equ(self.h()) )
            {
                self._ldl = false;
            }
            else
            {
                ring = self.ring; field = ring.associatedField();
                M = ring.isField() ? self : Matrix(field, self);
                D = Matrix.Zero(field, rows, rows); // zeroes
                L = Matrix.I(field, rows); // eye

                for(i=0; i<rows; i++)
                {
                    for(j=0; j<i; j++)
                    {
                        for(k=0,sum=field.Zero(); k<j; k++)
                            sum = sum.add(L.val[i][k].mul(L.val[j][k].conj()).mul(D.val[k][k]));

                        L.val[i][j] = M.val[i][j].sub(sum).div(D.val[j][j]);
                    }

                    for(k=0,sum=field.Zero(); k<i; k++)
                        sum = sum.add(L.val[i][k].mul(L.val[i][k].conj()).mul(D.val[k][k]));

                    D.val[i][i] = M.val[i][i].sub(sum);

                    if ( D.val[i][i].lte(0) )
                    {
                        // not positive-definite
                        self._ldl = false;
                        break;
                    }
                }
                if ( false !== self._ldl ) self._ldl = [L, D];
            }
        }
        return self._ldl ? self._ldl.slice() : self._ldl;
    }
    ,ref: function( with_pivots, odim ) {
        var self = this, ring, O, I, J, rows, columns, dim, pivots,
            det, pl = 0, r, i, i0, p0, lead, leadc, imin, im, min,
            a, z, m, find_dupl;
        // fraction-free/integer row echelon form (ref) (also known as Hermite normal form), using fraction-free/integer row reduction or fraction-free gaussian elimination
        // https://en.wikipedia.org/wiki/Row_echelon_form
        // https://en.wikipedia.org/wiki/Gaussian_elimination
        // https://en.wikipedia.org/wiki/Hermite_normal_form
        // https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf
        if ( null == self._ref )
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            rows = self.nr; columns = self.nc;
            dim = columns;
            // original dimensions, eg when having augmented matrix
            if ( is_array(odim) ) dim = stdMath.min(dim, odim[1]);
            m = self.clone(true);
            pivots = new Array(dim);
            lead = 0; leadc = 0; det = I;
            find_dupl = function find_dupl( k0, k ) {
                k = k || 0;
                for(var p=pl-1; p>=0; p--)
                    if ( k0===pivots[p][k] )
                        return p;
                return -1;
            };
            for (r=0; r<rows; r++)
            {
                if ( dim <= lead ) break;

                i = r;
                /*while ( 0<=leadc && leadc<dim && m[i][leadc].equ(O) )
                {
                    leadc++;
                    if ( dim <= leadc )
                    {
                        leadc = -1;
                        break;
                    }
                }*/
                while ( m[i][lead].equ(O) )
                {
                    i++;
                    if ( rows <= i )
                    {
                        i = r; lead++;
                        if ( dim <= lead )
                        {
                            lead = -1;
                            break;
                        }
                    }
                }
                if ( -1 === lead ) break; // nothing to do

                i0 = i;
                imin = -1; min = null; z = 0;
                // find row with min abs leading value non-zero for current column lead
                for(i=i0; i<rows; i++)
                {
                    a = m[i][lead].abs();
                    if ( a.equ(O) ) z++;
                    else if ( (null == min) || a.lt(min) ) { min = a; imin = i; }
                }
                do{
                    if ( -1 === imin ) break; // all zero, nothing else to do
                    if ( rows-i0 === z+1 )
                    {
                        // only one non-zero, swap row to put it first
                        if ( r !== imin )
                        {
                            Matrix.SWAPR(m, r, imin);
                            // determinant changes sign for row swaps
                            det = det.neg();
                        }
                        if ( m[r][lead].lt(O) )
                        {
                            Matrix.ADDR(ring, m, r, r, O, J, lead); // make it positive
                            // determinant is multiplied by same constant for row multiplication, here simply changes sign
                            det = det.mul(J);
                        }
                        i = imin; i0 = r;
                        while ( (0<=i) && (-1!==(p0=find_dupl(i))) ){ i0 -= pl-p0; i = i0; }
                        pivots[pl++] = [i, lead/*, leadc*/]; // row/column/original column of pivot
                        // update determinant
                        det = r<dim ? det.mul(m[r][r/*lead*/]) : O;
                        break;
                    }
                    else
                    {
                        z = 0; im = imin;
                        for(i=i0; i<rows; i++)
                        {
                            if ( i === im ) continue;
                            // subtract min row from other rows
                            Matrix.ADDR(ring, m, i, im, m[i][lead].div(m[im][lead]).neg(), I, lead);
                            // determinant does not change for this operation

                            // find again row with min abs value for this column as well for next round
                            a = m[i][lead].abs();
                            if ( a.equ(O) ) z++;
                            else if ( a.lt(min) ) { min = a; imin = i; }
                        }
                    }
                }while(true);

                lead++; //leadc++;
            }
            if ( pl<dim ) det = O;

            m = new Matrix(ring, m);
            // truncate if needed
            if ( pivots.length > pl ) pivots.length = pl;

            self._ref = [m, pivots, det];
        }
        return with_pivots ? self._ref.slice() : self._ref[0];
    }
    ,rref: function( with_pivots, odim ) {
        var self = this, ring, O, I, J, rows, columns, dim,
            pivots, det, pl, lead, r, i, j, a, g, ref;
        // fraction-free/integer reduced row echelon form (rref), using fraction-free gauss-jordan elimination, or incrementaly from fraction-free row echelon form (gauss elimination)
        // https://en.wikipedia.org/wiki/Row_echelon_form
        if ( null == self._rref )
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            rows = self.nr; columns = self.nc;
            // build rref incrementaly from ref
            ref = self.ref(true, odim);
            a = ref[0].clone();
            pivots = ref[1]; det = ref[2];
            pl = pivots.length;
            for(r=0; r<pl; r++)
            {
                lead = pivots[r][1];
                for (i=0; i<r; i++)
                {
                    if ( a.val[i][lead].equ(O) ) continue;

                    Matrix.ADDR(ring, a.val, i, r, a.val[i][lead].neg(), a.val[r][lead]);
                    // are following 2 lines redundant since we are already in REF??
                    // 1. make leading entry positive again
                    if ( a.val[i][pivots[i][1]].lt(O) )
                        Matrix.ADDR(ring, a.val, i, i, O, J, pivots[i][1]);
                    // 2. remove any common factor, simplify
                    if ( ring.hasGCD() && !O.equ(g=ring.gcd(a.val[i])) && !I.equ(g) )
                        for (j=0; j<columns; j++) a.val[i][j] = a.val[i][j].div(g);
                }
            }
            self._rref = [a, pivots, det];
        }
        return with_pivots ? self._rref.slice() : self._rref[0];
    }
    ,rankf: function( ) {
        // https://en.wikipedia.org/wiki/Rank_factorization
        var self = this, ring, field, rows, columns, rref, pivots, rank, F, C;
        if ( null == self._rf )
        {
            rows = self.nr; columns = self.nc;
            ring = self.ring;
            rref = self.rref(true);
            pivots = rref[1];
            rank = pivots.length;
            field = ring.associatedField();
            C = Matrix(field, self.slice(array(rows, 0, 1), array(rank, function(j){
                return pivots[j][1];
            })));
            F = Matrix(field, rref[0].slice(0, 0, rank-1, columns-1).map(function(rref_ij, ij){
                var i = ij[0], j = i;
                while(j+1<columns && rref[0].val[i][j].equ(0)) j++;
                return field.cast(rref_ij).div(field.cast(rref[0].val[i][j]));
            }));
            self._rf = [C, F];
        }
        return self._rf.slice();
    }
    ,rank: function( ) {
        // https://en.wikipedia.org/wiki/Rank_(linear_algebra)
        var pivots = this.ref(true);
        return pivots[1].length;
    }
    ,tr: function( ) {
        var self = this, ring, n, i;
        // trace
        // https://en.wikipedia.org/wiki/Trace_(linear_algebra)
        if ( null == self._tr )
        {
            ring = self.ring;
            n = stdMath.min(self.nr, self.nc);
            self._tr = ring.Zero();
            for(i=0; i<n; i++) self._tr = self._tr.add(self.val[i][i]);
        }
        return self._tr;
    }
    ,det: function( ) {
        var self = this, ring, ref;
        // determinant
        // https://en.wikipedia.org/wiki/Determinant
        // https://en.wikipedia.org/wiki/Bareiss_algorithm
        if ( null == self._det )
        {
            ring = self.ring;
            if ( self.nr !== self.nc )
            {
                self._det = ring.Zero();
            }
            else
            {
                ref = self.ref(true);
                self._det = ref[2];
            }
        }
        return self._det;
    }
    ,rowspace: function( ) {
        var self = this, ring, pivots;
        // row space
        // https://en.wikipedia.org/wiki/Row_and_column_spaces
        if ( null == self._rs )
        {
            ring = self.ring;
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._rs = /*gramschmidt(*/pivots[1].map(function(p){
                return Matrix(ring, [self.row(p[0])]);
            })/*).map(function(vec){
                return Matrix([vec]);
            })*/; // row vector
        }
        return self._rs.slice();
    }
    ,colspace: function( ) {
        var self = this, ring, pivots;
        // column space
        // https://en.wikipedia.org/wiki/Row_and_column_spaces
        if ( null == self._cs )
        {
            ring = self.ring;
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._cs = /*gramschmidt(*/pivots[1].map(function(p){
                return Matrix(ring, self.col(p[1]));
            })/*).map(function(vec){
                return Matrix(vec);
            })*/; // column vector
        }
        return self._cs.slice();
    }
    ,nullspace: function( left_else_right ) {
        var self = this, ring, O, I, columns, rref, pivots,
            free_vars, pl, tmp, LCM;

        // https://en.wikipedia.org/wiki/Kernel_(linear_algebra)
        if ( left_else_right )
        {
            // left nullspace
            if ( null == self._ln )
            {
                // get right nullspace of transpose matrix and return transposed vectors
                self._ln = self.t().nullspace().map(function(v){return v.t();});
            }
            return self._ln.slice();
        }
        else
        {
            // right nullspace (default)
            if ( null == self._rn )
            {
                ring = self.ring;
                O = ring.Zero();
                I = ring.One();
                columns = self.nc;
                tmp = self.rref(true); rref = tmp[0]; pivots = tmp[1];
                pl = pivots.length;
                free_vars = complement(columns, pivots.map(function(p){return p[1];}));
                // exact integer rref, find LCM of pivots
                LCM = pl ? (ring.hasGCD() ? ring.lcm(pivots.map(function(p, i){return rref.val[i][p[1]];})) : operate(function(LCM, p, i){return LCM.mul(rref.val[i][p[1]]);}, I, pivots)) : I;
                self._rn = free_vars.map(function(free_var){
                    /*
                    If A = (a_{ij}) \in Mat(m x n, F) is a matrix in reduced row echelon form with r nonzero rows and pivots in the columns numbered j_1 < ... < j_r, then the kernel ker(A) is generated by the n-r elements w_k = e_k - \sum\limits_{1 \le i \le r, j_i \le k} a_{ik}/a_{ii}e_{j_i} for k \in {1, .. , n} \ {j_1, .., j_r}, where e_1, .., e_n are the standard generators of F^n.
                    */
                    // for each free variable, we will set it to 1(LCM) and all others
                    // to 0.  Then, we will use back substitution to solve the system
                    var p, g, i, vec = array(columns, function(j){return j===free_var ? LCM : O;});
                    for (p=0; p<pl; p++)
                    {
                        i = pivots[p][1];
                        if ( i <= free_var )
                        {
                            // use exact (fraction-free) integer algorithm, which normalises rref NOT with 1 but with LCM of pivots
                            // https://math.stackexchange.com/a/1521354/139391
                            vec[i] = vec[i].sub(LCM.div(rref.val[p][i]).mul(rref.val[p][free_var]));
                        }
                    }
                    if ( ring.hasGCD() && I.lt(g=ring.gcd(vec)) )
                        // remove common factors, simplify
                        for(i=0; i<columns; i++) vec[i] = vec[i].div(g);

                    return Matrix(ring, vec); // column vector
                });
            }
            return self._rn.slice();
        }
    }
    ,slice: function( r1, c1, r2, c2 ) {
        var self = this, ring = self.ring, rows = self.nr, columns = self.nc;
        if ( !rows || !columns ) return Matrix(ring);
        if ( is_array(r1) && is_array(c1) )
        {
            r1 = r1.filter(function(i){return 0<=i && i<rows;});
            c1 = c1.filter(function(j){return 0<=j && j<columns;});
            return Matrix(ring, array(r1.length, function(i){
                return array(c1.length, function(j){
                    return self.val[r1[i]][c1[j]];
                });
            }));
        }
        else
        {
            if ( null == r1 ) r1 = 0;
            if ( null == c1 ) c1 = 0;
            if ( null == r2 ) r2 = rows-1;
            if ( null == c2 ) c2 = columns-1;
            if ( 0 > r1 ) r1 += rows;
            if ( 0 > c1 ) c1 += columns;
            if ( 0 > r2 ) r2 += rows;
            if ( 0 > c2 ) c2 += columns;
            r1 = stdMath.max(0, stdMath.min(rows-1, r1));
            r2 = stdMath.max(0, stdMath.min(rows-1, r2));
            c1 = stdMath.max(0, stdMath.min(columns-1, c1));
            c2 = stdMath.max(0, stdMath.min(columns-1, c2));
            return r1<=r2 && c1<=c2 ? Matrix(ring, array(r2-r1+1, function(i){
                return array(c2-c1+1, function(j){
                    return self.val[r1+i][c1+j];
                });
            })) : Matrix(ring);
        }
    }
    ,concat: function( a, axis ) {
        var self = this, ring = self.ring, O = ring.Zero();
        if ( !is_instance(a, Matrix) ) return self;
        axis = axis || 'horizontal';
        if ( 'vertical' === axis )
        {
            // | self |
            // | ---- |
            // |  a   |
            return Matrix(ring, array(self.nr+a.nr, function(i){
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= self.nc )
                        return i < self.nr ? O : a.val[i-self.nr][j];
                    else if ( j >= a.nc )
                        return i < self.nr ? self.val[i][j] : O;
                    else
                        return i < self.nr ? self.val[i][j] : a.val[i-self.nr][j];
                });
            }));
        }
        else //if ( 'horizontal' === axis )
        {
            // | self | a |
            return Matrix(ring, array(stdMath.max(self.nr, a.nr), function(i){
                return array(self.nc+a.nc, function(j){
                    if ( i >= self.nr )
                        return j < self.nc ? O : a.val[i][j-self.nc];
                    else if ( i >= a.nr )
                        return j < self.nc ? self.val[i][j] : O;
                    else
                        return j < self.nc ? self.val[i][j] : a.val[i][j-self.nc];
                });
            }));
        }
    }
    ,valueOf: function( r, c ) {
        var self = this, ring = self.ring;
        r = +(r||0); c = +(c||0);
        return (0<=r && r<self.nr && 0<=c && c<self.nc ? self.val[r][c] : ring.Zero()).valueOf();
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
            self._str = Matrix.toString(self.val);
        return self._str;
    }
    ,toTex: function( ) {
        var self = this;
        if ( null == self._tex )
            self._tex = Matrix.toTex(self.val);
        return self._tex;
    }
    ,toDec: function( precision ) {
        return Matrix.toDec(this.val, precision);
    }
});

// combinatorial objects iterator ordering patterns
// https://oeis.org/wiki/Orderings
function ORDER( o )
{
    if ( !arguments.length || null == o ) return LEX; // default
    var order = 0;
    if ( is_string(o) )
    {
        o = o.toUpperCase().split(',');
        for(var i=0,l=o.length; i<l; i++) order |= HAS.call(ORDER,o[i]) ? ORDER[o[i]] : 0;
        //order = ORDERINGS & order;
        if ( (0 < order) && !((LEXICAL|RANDOM) & order) ) order |= LEX;
        if ( 0 >= order ) order = LEX;
    }
    else
    {
        order = ORDERINGS & o ? (ORDERINGS & o) : LEX;
    }
    // only one main ordering
    if ( (RANDOM & order) && (LEXICAL & order) ) order &= ~LEXICAL;
    if ( (MINIMAL & order) && ((COLEX|LEX) & order) ) order &= ~(COLEX|LEX);
    if ( (COLEX & order) && (LEX & order) ) order &= ~LEX;
    // random has no reverse
    if ( RANDOM & order ) order &= ~REVERSED;
    return order;
}
ORDER.LEX = ORDER.LEXICOGRAPHIC = LEX;
ORDER.COLEX = ORDER.COLEXICOGRAPHIC = COLEX;
ORDER.MINIMAL = ORDER.GRAY = MINIMAL;
ORDER.RANDOM = RANDOM;
ORDER.REV = ORDER.ANTI = ORDER.REVERSE = ORDER.REVERSED = REVERSED;
ORDER.REF = ORDER.REFLECT = ORDER.REFLECTED = REFLECTED;
ORDER.REVLEX = ORDER.ANTILEX = ORDER.REVERSELEXICOGRAPHIC = ORDER.ANTILEXICOGRAPHIC = LEX | REVERSED;
ORDER.REFLEX = ORDER.REFLECTEDLEXICOGRAPHIC = LEX | REFLECTED;
ORDER.REVCOLEX = ORDER.ANTICOLEX = ORDER.REVERSECOLEXICOGRAPHIC = ORDER.ANTICOLEXICOGRAPHIC = COLEX | REVERSED;
ORDER.REFCOLEX = ORDER.REFLECTEDCOLEXICOGRAPHIC = COLEX | REFLECTED;
Abacus.ORDER = ORDER;

// Abacus.Filter, Filter class used to define and combine filters to filter combinatorial object by them
Filter = Abacus.Filter = Class({

    constructor: function Filter( filter ) {
        var self = this;
        if ( !is_instance(self, Filter) ) return new Filter(filter);
        self.filter = filter || null;
    }

    ,__static__: {
        UNIQUE: function( ) {
            return Filter(function(item){
                var i, n = item.length, seen = {};
                for(i=0; i<n; i++)
                {
                    if ( 1===seen[item[i]] ) return false;
                    seen[item[i]] = 1;
                }
                return true;
            });
        }
        ,SORTED: function( dir, strict ) {
            if ( 2 > arguments.length || null == strict ) strict = true;
            if ( is_string(dir) )
            {
                if ( "<" === dir )
                {
                    dir = 1;
                    strict = true;
                }
                else if ( ">" === dir )
                {
                    dir = -1;
                    strict = true;
                }
                else if ( "<=" === dir || "=<" === dir )
                {
                    dir = 1;
                    strict = false;
                }
                else if ( ">=" === dir || "=>" === dir )
                {
                    dir = -1;
                    strict = false;
                }
            }
            dir = +dir;
            dir = -1 === dir ? -1 : 1;
            return Filter(-1 === dir ? function(item){
                for(var item0=item[0],i=1,n=item.length; i<n; i++)
                {
                    if ( (strict && item0<=item[i]) || (!strict && item0<item[i]) ) return false;
                    item0 = item[i];
                }
                return true;
            } : function(item){
                for(var item0=item[0],i=1,n=item.length; i<n; i++)
                {
                    if ( (strict && item0>=item[i]) || (!strict && item0>item[i]) ) return false;
                    item0 = item[i];
                }
                return true;
            });
        }
        ,LEN: function( val, comp ) {
            comp = comp || "==";
            val = +val;
            if ( ">=" === comp )
            {
                return Filter(function(item){ return item.length >= val; });
            }
            else if ( ">" === comp )
            {
                return Filter(function(item){ return item.length > val; });
            }
            else if ( "<" === comp )
            {
                return Filter(function(item){ return item.length < val; });
            }
            else if ( "<=" === comp )
            {
                return Filter(function(item){ return item.length <= val; });
            }
            else if ( "!=" === comp )
            {
                return Filter(function(item){ return item.length !== val; });
            }
            else //if ( "==" === comp )
            {
                return Filter(function(item){ return item.length === val; });
            }
        }
        ,VAL: function( pos, val, comp ) {
            comp = comp || "==";
            //val = +val;
            pos = +pos;
            if ( ">=" === comp || "=>" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]>=val; });
            }
            else if ( ">" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]>val; });
            }
            else if ( "<" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]<val; });
            }
            else if ( "<=" === comp || "=<" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]<=val; });
            }
            else if ( "!=" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]!==val; });
            }
            else //if ( "==" === comp )
            {
                return Filter(function(item){ return 0<=pos && pos<item.length && item[pos]===val; });
            }
        }
        ,MAX: function( val, comp ) {
            comp = comp || "==";
            val = +val;
            if ( ">=" === comp || "=>" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) >= val; });
            }
            else if ( ">" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) > val; });
            }
            else if ( "<" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) < val; });
            }
            else if ( "<=" === comp || "=<" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) <= val; });
            }
            else if ( "!=" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) !== val; });
            }
            else //if ( "==" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] > M ) M = item[i];
                    return M;
                }, -Infinity, null, 0, item.length-1, 1) === val; });
            }
        }
        ,MIN: function( val, comp ) {
            comp = comp || "==";
            val = +val;
            if ( ">=" === comp || "=>" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) >= val; });
            }
            else if ( ">" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) > val; });
            }
            else if ( "<" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) < val; });
            }
            else if ( "<=" === comp || "=<" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) <= val; });
            }
            else if ( "!=" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) !== val; });
            }
            else //if ( "==" === comp )
            {
                return Filter(function(item){ return operate(function(M,i){
                    if ( item[i] < M ) M = item[i];
                    return M;
                }, Infinity, null, 0, item.length-1, 1) === val; });
            }
        }
        ,BETWEEN: function( m, M, inclusive ) {
            m = +m; M = +M;
            if ( m > M ){ var t=m; m=M; M=t; }
            if ( 3 > arguments.length || null == inclusive ) inclusive = true;
            return Filter(inclusive ? function(item){
                for(var i=0,n=item.length; i<n; i++)
                {
                    if ( item[i]<m || item[i]>M ) return false;
                }
                return true;
            } : function(item){
                for(var i=0,n=item.length; i<n; i++)
                {
                    if ( item[i]<=m || item[i]>=M ) return false;
                }
                return true;
            });
        }
    }

    ,filter: null

    ,dispose: function( ) {
        var self = this;
        self.filter = null;
        return self;
    }

    ,apply: function( item, inst ) {
        var filter = this.filter;
        return filter && is_callable(filter) ? Boolean(filter.call(inst||null, item)) : true;
    }

    ,NOT: function( ) {
        var self = this;
        return Filter(function(item){ return !self.apply(item, this); });
    }

    ,OR: function( otherFilter ) {
        var self = this;
        if ( is_callable(otherFilter) || is_instance(otherFilter, Filter) )
        {
            if ( !is_instance(otherFilter, Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) || otherFilter.apply(item, this); });
        }
        return self;
    }

    ,XOR: function( otherFilter ) {
        var self = this;
        if ( is_callable(otherFilter) || is_instance(otherFilter, Filter) )
        {
            if ( !is_instance(otherFilter, Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){
                var r1 = self.apply(item, this), r2 = otherFilter.apply(item, this);
                return (r1 && !r2) || ((!r1) && r2);
            });
        }
        return self;
    }

    ,AND: function( otherFilter ) {
        var self = this;
        if ( is_callable(otherFilter) || is_instance(otherFilter, Filter) )
        {
            if ( !is_instance(otherFilter, Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) && otherFilter.apply(item, this); });
        }
        return self;
    }
});

// Base Iterator Interface & Abstract Class
Iterator = Abacus.Iterator = Class({

    constructor: function Iterator( name, $ ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !is_instance(self, Iterator) ) return new Iterator( name, $ );
        if ( (is_array(name) || is_args(name)) && (is_instance(name[0], Iterator) || is_instance(name[name.length-1],  Iterator)) )
        {
            // sequence of iterators
            self.name = "Iterator";
            self.$ = $ || {};
            self.$.seq = is_args(name) ? slice.call(name) : name;
            self.$.count = operate(function(count, iter){
                return Arithmetic.add(count, iter.total());
            }, Arithmetic.O, self.$.seq);
            self.rewind();
        }
        else if ( is_callable(name) )
        {
            // generator function iterator
            self.name = "Generator";
            self.$ = {};
            self.$.generator = name;
            self.$.state = $ || {};
            self.$.count = Arithmetic.I;
            self.rewind();
        }
        else
        {
            // iterator subclass
            self.name = name || "Iterator";
            self.$ = $ || {};
            self.$.count = self.$.count || Arithmetic.O;
        }
    }

    ,__static__: {
         Iterable: function Iterable( iter, dir ) {
            var self = this;
            if ( !is_instance(self, Iterable) ) return new Iterable(iter, dir);
            dir = -1 === dir ? -1 : 1;
            self.next = function( ) {
                var next = iter.hasNext(dir) ? iter.next(dir) : null;
                return null == next ? {done: true} : {value: next};
            };
        }
    }

    ,name: "Iterator"
    ,$: null
    ,__index: null
    ,__item: null
    ,_index: null
    ,_item: null
    ,__subindex: null
    ,_subindex: null
    ,__subitem: null
    ,_subitem: null

    ,dispose: function( ) {
        var self = this;
        if ( self.$.seq && self.$.seq.length )
        {
            operate(function(_,iter){iter.dispose();}, null, self.$.seq);
            self.$.seq = null;
        }
        self.$ = null;
        self.__index = null;
        self.__item = null;
        self._index = null;
        self._item = null;
        self.__subindex = null;
        self._subindex = null;
        self.__subitem = null;
        self._subitem = null;
        return self;
    }
    ,filterBy: function( filter ) {
        var self = this, $ = self.$;
        if ( false === filter )
        {
            // un-filter
            if ( $.filter )
            {
                $.filter = null;
                //self.rewind();
            }
        }
        else if ( is_instance(filter, Filter) || is_callable(filter) )
        {
            $.filter = is_instance(filter, Filter) ? filter : Filter(filter);
            //self.rewind();
        }
        return self;
    }
    ,mapTo: function( output ) {
        var self = this, $ = self.$;
        if ( false === output )
        {
            // clear output
            if ( $.output )
            {
                $.output = null;
            }
        }
        else if ( is_callable(output) )
        {
            $.output = output;
        }
        // re-process current item
        self._item = self.output(self.__item);
        return self;
    }
    ,fuse: function( method, iter, dir ) {
        var self = this, $ = self.$;
        if ( (1 === arguments.length) && (false === method) )
        {
            // un-fuse
            if ( $.sub )
            {
                $.sub = null;
                $.submethod = null;
                $.subcascade = null;
                $.subcount = null;
                self.rewind();
            }
        }
        else if ( is_instance(iter, Iterator) && is_callable(method) )
        {
            $.sub = iter;
            $.submethod = method;
            $.subcascade = -1===dir?-1:1;
            $.subcount = Abacus.Arithmetic.mul($.count, iter.total());
            self.rewind();
        }
        return self;
    }
    ,unfuse: function( ) {
        return this.fuse(false);
    }
    ,juxtaposeWith: function( iter, dir ) {
        return this.fuse(function(item, subitem){
            return [].concat(item).concat(subitem);
        }, iter, dir);
    }
    ,state: function( state ){
        // custom state control for custom generator functions typecasted as iterators
        var self = this;
        if ( !arguments.length ) return self.$.state;
        self.$.state = state;
        return self;
    }
    // override methods
    ,output: function( item ) {
        var output = this.$.output;
        return null == item ? null : (is_callable(output) ? output(item): item);
    }
    ,fusion: function( item, subitem ) {
        var self = this, $ = self.$, t;
        if ( !$.sub ) return item;
        if ( -1 === $.subcascade ){ t = item; item = subitem; subitem = t; }
        if ( null == item || null == subitem ) return item || subitem || null;
        return $.submethod.call(self, item, subitem);
    }
    ,order: function( ) {
        return this;
    }
    ,rewind: function( dir, non_recursive ) {
        var self = this, $ = self.$, i, l, item;
        dir = -1===dir ? -1 : 1;
        if ( is_array($.seq) )
        {
            for(i=0,l=$.seq.length; i<l; i++) $.seq[i].rewind(dir);
            $.seqindex = 0 > dir ? l-1 : 0;
            do{
                item = $.seq[$.seqindex].next(dir);
                if ( null == item ) $.seqindex += dir;
            }while((null==item) && (0<=$.seqindex) && ($.seqindex<$.seq.length));
            self.__item = item;
            self._item = self.output(self.__item);
            if ( $.sub && (true !== non_recursive) )
            {
                $.sub.rewind(dir);
                self.__subitem = $.sub.next(dir);
                self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }
        }
        else if ( is_callable($.generator) )
        {
            self.__item = $.generator.call(self, null, dir, $.state, true/*initial item*/);
            self._item = self.output(self.__item);
            if ( $.sub && (true !== non_recursive) )
            {
                $.sub.rewind(dir);
                self.__subitem = $.sub.next(dir);
                self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }
        }
        return self;
    }
    ,total: function( non_recursive ) {
        var $ = this.$;
        return ($.sub && !non_recursive ? $.subcount : $.count) || Abacus.Arithmetic.O;
    }
    ,index: function( index ) {
        var self = this;
        if ( !arguments.length ) return self._index;
        self._index = index;
        return self;
    }
    ,item: function( item ) {
        var self = this;
        if ( !arguments.length ) return self._item;
        self._item = item;
        return self;
    }
    ,hasNext: function( dir ) {
        var self = this, $ = self.$;
        return $.sub ? (null != self._subitem) : (null != self.__item);
    }
    ,next: function( dir ) {
        var self = this, $ = self.$, curr, next, item;
        dir = -1===dir ? -1 : 1;
        if ( is_array($.seq) )
        {
            do{
                curr = self.__item;
                next = $.sub ? self._subitem : self._item;
                item = null;
                while((null==item) && (0<=$.seqindex) && ($.seqindex<$.seq.length))
                {
                    item = $.seq[$.seqindex].hasNext(dir) ? $.seq[$.seqindex].next(dir) : null;
                    if ( null == item ) $.seqindex += dir;
                }
                if ( (null == item) && (0>$.seqindex || $.seqindex>=$.seq.length) && $.sub && $.sub.hasNext(dir) )
                {
                    self.rewind(dir, true); item = self.__item;
                    self.__subitem = $.sub.next(dir);
                }
                self.__item = item;
                self._item = self.output(self.__item);
                self._subitem = $.sub && (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }while($.filter && (null!=next) && !$.filter.apply(next, self));
            return next;
        }
        else if ( is_callable($.generator) )
        {
            do{
                curr = self.__item;
                next = $.sub ? self._subitem : self._item;
                // generator should return null as result if finished
                self.__item = $.generator.call(self, curr, dir, $.state, false/*next item*/);
                if ( (null == self.__item) && $.sub && $.sub.hasNext(dir) )
                {
                    self.rewind(dir, true);
                    self.__subitem = $.sub.next(dir);
                }
                self._item = self.output(self.__item);
                self._subitem = $.sub && (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
            }while($.filter && (null!=next) && !$.filter.apply(next, self));
            return next;
        }
        else
        {
            return null;
        }
    }
    ,get: function( up_to ) {
        var self = this, list = [], next, all;
        // start from current index and ordering and get up to items matching criteria or up to end,
        // taking into account any filtering applied
        // incrementing current index as well
        if ( is_callable(up_to) )
        {
            while( self.hasNext() )
            {
                next = self.next();
                if ( null == next || !up_to(next) ) break;
                list.push(next);
            }
        }
        else
        {
            all = !arguments.length || null==up_to;
            if ( null != up_to ) up_to = +up_to;
            while( (all || list.length<up_to) && self.hasNext() )
            {
                next = self.next();
                if ( null == next ) break;
                list.push(next);
            }
        }
        return list;
    }
    ,storeState: function( raw ) {
        return null;
    }
    ,resumeState: function( state ) {
        return this;
    }
    // javascript @@iterator/@@iterable interface, if supported
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
    ,__iter__: function( ) {
        return new Iterator.Iterable( this );
    }
});
if ( ('undefined' !== typeof Symbol) && ('undefined' !== typeof Symbol.iterator) )
{
    // add javascript-specific iterator interface, if supported
    Iterator[PROTO][Symbol.iterator] = Iterator[PROTO].__iter__;
}

// Abacus.CombinatorialIterator, Combinatorial Base Class extends and implements Iterator Interface
// NOTE: by substituting usual Arithmetic ops with big-integer ops,
// big-integers can be handled transparently throughout all the combinatorial algorithms
CombinatorialIterator = Abacus.CombinatorialIterator = Class(Iterator, {

    constructor: function CombinatorialIterator( name, n, $, sub ) {
        var self = this, klass, Arithmetic = Abacus.Arithmetic;
        if ( !is_instance(self, CombinatorialIterator) ) return new CombinatorialIterator(name, n, $, sub);
        klass = self[CLASS];
        if ( (is_array(name) || is_args(name)) && (is_instance(name[0], CombinatorialIterator) || is_instance(name[name.length-1], CombinatorialIterator)) )
        {
            // combinatorial sequence iterator instance
            $ = n || {};
            $.seq = is_args(name) ? slice.call(name) : name; name = null;
            self.n = n = $.seq.length;
            $.type = "sequence";
            $.rand = $.rand || {};
            $.rand["sequence"] = 1;
            var minbase=Infinity, maxbase=-Infinity, mindim=Infinity, maxdim=-Infinity;
            operate(function(_,iter){
                var b = iter.base(), d = iter.dimension();
                if ( b > maxbase ) maxbase = b;
                if ( b < minbase ) minbase = b;
                if ( d > maxdim ) maxdim = d;
                if ( d < mindim ) mindim = d;
            }, null, $.seq);
            $.base = $.maxbase = maxbase; $.minbase = minbase;
            $.dimension = $.maxdimension = maxdim; $.mindimension = mindim;
        }
        else
        {
            // base combinatorial class
            self.n = n || 0;
            $ = $ || {};
        }

        name = name || "CombinatorialIterator";
        $.type = String($.type || "default").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.rand = $.rand || {};
        $.sub = null;
        $.instance = self;

        Iterator.call(self, name, $);

        self.init().order($.order);
        if ( sub && is_instance(sub.iter, CombinatorialIterator) )
        {
            sub.method = sub.method || 'project';
            if ( is_callable(sub.method) )
            {
                self.fuse(sub.method, sub.iter, /*sub.pos,*/ sub.cascade);
            }
            else if ( is_string(sub.method) && -1 !== ['multiply','add','concat','connect','join','combine','complete','interleave','juxtapose','intersperse','project'].indexOf(sub.method) )
            {
                var submethod = 'project'===sub.method ? 'projectOn' : (sub.method+'With');
                self[submethod](sub.iter, sub.pos, sub.cascade);
            }
        }
        if ( $.filter ) self.filterBy($.filter);
    }

    ,__static__: {
        // some C-P-T dualities, symmetries & processes at play here :))
         C: function( item, N, n, dir ){
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var reflected = -1===dir, LEN;
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                LEN = is_array(item[n]) ? item[n][0] : item[n];
                complementation(item, item, N, reflected ? n-(LEN||1) : 0, reflected ? n-1 : LEN-1);
            }
            else
            {
                complementation(item, item, N);
            }
            return item;
        }
        ,D: function( item, N, n, dir ) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            // (variation based on complement)
            var itemlen, reflected = -1===dir, INFO, LEN;
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                INFO = item[n]; LEN = is_array(INFO) ? INFO[0] : INFO;
                item = reflected ? item.slice(n-LEN,n) : item.slice(0,LEN);
                item = complement(N, item, true);
                itemlen = item.length;
                if ( itemlen<n ) item[reflected?"unshift":"push"].apply(item, new Array(n-itemlen));
                if ( is_array(INFO) ) INFO[0] = itemlen;
                else INFO = itemlen;
                item.push(INFO);
            }
            else
            {
                item = complement(N, item);
            }
            return item;
         }
        ,P: function( item, n, dir ) {
            // P process / symmetry, ie Reflection/Parity, PP = I
            var LEN;
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                LEN = is_array(item[n]) ? item[n][0] : item[n];
                if ( -1===dir )
                    item = shift(item, reflection(item, item, n, n-(LEN||1), n-1), -n+LEN, n-(LEN||1), n-1);
                else
                    item = shift(item, reflection(item, item, n, 0, LEN-1), n-LEN, 0, LEN-1);
            }
            else
            {
                reflection(item, item);
            }
            return item;
         }
        ,T: function( item, n, dir ){
            // T process / symmetry, ie Reversion/Time, TT = I
            return reversion(item, n);
        }
        ,DUAL: function dual( item, n, $, dir ) {
            if ( null == item ) return null;
            if ( $ && "sequence"===$.type ) return item;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, order = $ && null!=$.order ? $.order : LEX,
                BASE = $ && (null!=$.base) ? $.base : n,
                DIM = $ && (null!=$.dimension) ? $.dimension : n;
            dir = -1===dir ? -1 : 1;
            if ( COLEX & order ) item = REFLECTED & order ? klass.C(item,BASE,DIM,$,dir) : klass.P(klass.C(item,BASE,DIM,$,dir),DIM,dir);
            //else if ( RANDOM & order ) item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            //else if (MINIMAL & order ) item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            else/*if ( LEX & order )*/item = REFLECTED & order ? klass.P(item,DIM,dir) : item;
            return item;
        }
        ,count: function( n, $ ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            return $ && ("sequence"===$.type) && $.seq && $.seq.length ? operate(function(count,iter){return Arithmetic.add(count,iter.total());}, O, $.seq) : O;
        }
        ,initial: function( n, $, dir, as_next ) {
            if ( $ && ("sequence"===$.type) && $.seq && $.seq.length )
            {
                if ( true === as_next ) return this.succ(0, 0, n, $, dir);
                dir = -1 === dir ? -1 : 1;
                return 0>dir || (REVERSED&($ && null!=$.order ? $.order : LEX)) ? $.seq[$.seq.length-1].item0(dir) : $.seq[0].item0(dir);
            }
            return null;
        }
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( (null == n) || (null == item) ) return null;
            var klass = this, Arithmetic = Abacus.Arithmetic, a, b, d, i, seq;
            dir = -1 === dir ? -1 : 1;
            if ( $ && ("sequence"===$.type) )
            {
                seq = $.seq;
                if ( !seq || !seq.length ) return null;
                if ( REVERSED & ($ && null!=$.order ? $.order : LEX) )
                {
                    a = -1;
                    b = seq.length-1;
                }
                else
                {
                    a = 1;
                    b = 0;
                }
                i = a*$.seq_curr+b; d = a*dir;
                while(0<=i && i<seq.length && !seq[i].hasNext(dir) )
                {
                    $.seq_curr += dir;
                    i += d;
                }
                return 0<=i && i<seq.length ? seq[i].next(dir) : null;
            }
            return null == index ? null : klass.unrank(Arithmetic.add(index, 0>dir?Arithmetic.J:Arithmetic.I), n, $);
        }
        ,rand: function( n, $ ) {
            var item, klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, N, index, seq, i, l, tot;

            if ( $ && ("sequence"===$.type) )
            {
                seq = $.seq;
                if ( !seq || !seq.length ) return null;
                // uniform random sampling, taking into account the count of each iterator
                N = null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
                index = Arithmetic.rnd(O, N); i = 0; l = seq.length;
                while(Arithmetic.gte(index, tot=seq[i].total()) )
                {
                    index = Arithmetic.sub(index, tot);
                    i++; if ( i >=l || Arithmetic.lt(index, O) ) break;
                }
                return i<l && Arithmetic.gte(index, O) ? seq[i].random() : null;
                /*
                // NOTE: NOT uniformly distributed unless all iterators have same count,
                // needs to take into account counts per iterator to produce uniform random item
                return $.seq && $.seq.length ? $.seq[Abacus.Math.rndInt(0,$.seq.length-1)].random() : null;
                */
            }

            N = $ && null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
            index = Arithmetic.rnd(O, N);
            item = Arithmetic.equ(O, index) ? (
                klass.initial(n, $, 1)
            ) : (Arithmetic.equ(N, index) ? (
                klass.initial(n, $, -1)
            ) : (
                klass.unrank(index, n, $)
            ));

            return item;
        }
        ,rank: function( item, n, $ ) {
            if ( $ && ("sequence"===$.type) )
            {
                var klass = this, Arithmetic = Abacus.Arithmetic,
                    O = Arithmetic.O, J = Arithmetic.J,
                    seq = $.seq, i, l, m, index, seq_index, sub, found;

                if ( null == item || !seq || !seq.length ) return J;

                l = seq.length; i = 0; seq_index = O;
                m = item.length;
                found = false;
                for(i=0; i<l; i++)
                {
                    sub = seq[i];
                    if ( (m === sub.dimension()) || (m>=sub.$.mindimension && m<=sub.$.maxdimension))
                    {
                        index = sub[CLASS].rank(item, sub.n, sub.$);
                        if ( Arithmetic.gt(index,J) )
                        {
                            found = true;
                            break;
                        }
                        seq_index = Arithmetic.add(seq_index, sub.total());
                    }
                }
                return found ? Arithmetic.add(index, seq_index) : J;
            }
            return NotImplemented();
        }
        ,unrank: function( index, n, $ ) {
            if ( $ && ("sequence"===$.type) )
            {
                var klass = this, Arithmetic = Abacus.Arithmetic,
                    O = Arithmetic.O, seq = $.seq, i, l;

                if ( !seq || !seq.length ) return null;
                if ( null==index || !Arithmetic.inside(index, Arithmetic.J, null!=$.count ? $.count : klass.count(n, $)) ) return null;

                l = seq.length; i = 0;
                while( Arithmetic.gte(index, seq[i].total()) )
                {
                    index = Arithmetic.sub(index, seq[i].total());
                    i++; if ( i >=l || Arithmetic.lt(index, O) ) break;
                }
                return i<l && Arithmetic.gte(index, O) ? seq[i][CLASS].unrank(index, seq[i].n, seq[i].$) : null;
            }
            return NotImplemented();
        }
        ,connect: function( method, item, subitem, DIM, BASE, POS ) {
            //if ( is_callable(method) ) return method(item, subitem, DIM, BASE, POS);
            if ( "multiply" === method )
            {
                // O(n1 * n2)
                return kronecker(true, item, subitem);
            }
            else if ( "intersperse" === method )
            {
                // O(n1 + n2)
                var output = subitem.slice(), n = item.length, i;
                for(i=0; i<n; i++)
                {
                    // POS plays the role of output symbol(s) here, if exists
                    output.splice(output.length-item[i], 0, POS&&POS.length&&i<POS.length?POS[i]:item[i]);
                }
                return output;
            }
            else if ( "juxtapose" === method )
            {
                // O(1)
                // try to produce flat output even if subitem is itself recursively juxtaposed
                // should work fine for supported comb. objects (with default output) as they always produce 1 flat array of numbers
                return subitem && is_array(subitem[0]) ? [item].concat(subitem) : [item, subitem];
            }
            else if ( ("add" === method) || ("connect" === method) || ("concat" === method) )
            {
                // O(n1 + n2)
                var max = item.length ? item[0]+1 : 0;
                return array(item.length+subitem.length, "add" === method ? function(i){
                    // add
                    return i < item.length ? item[i] : item.length+subitem[i-item.length];
                } : ("connect" === method ? function(i){
                    // connect
                    if ( i < item.length )
                    {
                        if ( item[i]+1 > max ) max = item[i]+1;
                        return item[i];
                    }
                    return max+subitem[i-item.length];
                } : function(i){
                    // concat
                    return i < item.length ? item[i] : subitem[i-item.length];
                }));
            }
            else if ( ("complete" === method) || ("interleave" === method) || ("join" === method) || ("combine" === method) )
            {
                // O(n1 + n2)
                var n1 = item.length, n2 = subitem.length,
                    n3 = n1+n2, i2 = 0, i1 = 0, nk = 0,
                    item_i1 = i1<n1 ? item[i1] : -1,
                    pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1,
                    compl = "complete" === method ? complement(BASE, item, true) : null/*array(BASE, 0, 1)*/;
                if ( "combine" === method )
                {
                    var items = array(n3, 0, 1), output = array(n3);
                    for(i1=0; i1<n1; i1++) output[item[i1]] = items[item[i1]];
                    for(i1=n1-1; i1>=0; i1--) items.splice(item[i1], 1);
                    i1=0; i2=0;
                    while(i2 < n2)
                    {
                        while((i1 < n3) && (null != output[i1])) i1++;
                        if ( i1 < n3 ) output[i1] = items[subitem[i2]];
                        i2++;
                    }
                    return output;
                }
                else
                {
                    return array(n3, "complete" === method ? function(ii){
                        // complete
                        var v;
                        if ( pos_i1 === ii )
                        {
                            v = item_i1;
                            i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1;
                        }
                        else
                        {
                            v = compl[subitem[i2++]];
                        }
                        return v;
                    } : ("interleave" === method ? function(ii){
                        // interleave
                        var v;
                        if ( pos_i1 === ii )
                        {
                            v = item_i1;
                            i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            pos_i1 = null!=POS ? (i1<POS.length ? POS[i1] : -1) : item_i1;
                        }
                        else
                        {
                            v = subitem[i2++];
                        }
                        return v;
                    } : function(ii){
                        // join
                        var v;
                        if ( item_i1 === ii )
                        {
                            v = item_i1; i1++;
                            item_i1 = i1<n1 ? item[i1] : -1;
                            nk++;
                        }
                        else
                        {
                            v = nk + subitem[i2++];
                        }
                        return v;
                    }));
                }
            }
            else/*if ( "project" === method )*/
            {
                // O(n1)
                return array(item.length, function(i){
                    return 0<=item[i] && item[i]<subitem.length ? subitem[item[i]] : item[i];
                });
            }
        }
    }

    ,name: "CombinatorialIterator"
    ,n: 0
    ,item__: null
    ,_prev: null
    ,_next: null
    ,_traversed: null

    ,dispose: function( non_recursive ) {
        var self = this;
        if ( (!non_recursive) && self.$.sub )
        {
            self.$.sub.dispose();
            self.$.sub = null;
        }
        if ( "sequence" === self.$.type && self.$.seq && self.$.seq.length )
        {
            operate(function(_,iter){iter.dispose();}, null, self.$.seq);
            self.$.seq = null;
        }

        self.n = null;
        self.item__ = null;
        self._prev = null;
        self._next = null;
        if ( self._traversed )
        {
            self._traversed.dispose( );
            self._traversed = null;
        }
        return Iterator[PROTO].dispose.call(self);
    }

    ,init: function( ) {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n, Arithmetic = Abacus.Arithmetic;
        $.base = $.base || 0;
        $.minbase = null != $.minbase ? $.minbase : $.base;
        $.maxbase = null != $.maxbase ? $.maxbase : $.base;
        $.dimension = $.dimension || 0;
        $.mindimension = null != $.mindimension ? $.mindimension : $.dimension;
        $.maxdimension = null != $.maxdimension ? $.maxdimension : $.dimension;
        $.count = klass.count(n, $);
        $.first = Arithmetic.O;
        $.last = Arithmetic.gt($.count, Arithmetic.O) ? Arithmetic.sub($.count, Arithmetic.I) : Arithmetic.J;
        return self;
    }

    ,fuse: function( method, combIter, pos, dir ) {
        var self = this, $super = Iterator[PROTO].fuse, $ = self.$;
        if ( (1 === arguments.length) && (false === method) )
        {
            // un-fuse
            $.subpos = null;
            $.subdimension = null;
            $.subposition = null;
            $super.call(self, false);
        }
        else if ( is_instance(combIter, CombinatorialIterator) && is_callable(method) )
        {
            if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
            $.subpos = pos || self.position();
            $super.call(self, method, combIter, dir);
        }
        return self;
    }

    ,multiplyWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) )
        {
            $.subdimension = $.dimension*combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("multiply", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,addWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("add", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,connectWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("connect", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,concatWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("concat", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,juxtaposeWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) )
        {
            $.subdimension = 1 + (combIter.$.subdimension || 1);
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("juxtapose", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,completeWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("complete", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,interleaveWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("interleave", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,joinWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("join", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,combineWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("combine", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,intersperseWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        // used especially for Tensors, to generate recursively
        if ( is_instance(combIter, CombinatorialIterator) && (0<combIter.dimension()) )
        {
            if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
            pos = pos || (1===self.dimension() ? [self.base()-1] : array(self.dimension(), 0, 1));
            $.subdimension = $.dimension+combIter.dimension();
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("intersperse", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,projectOn: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( is_instance(combIter, CombinatorialIterator) )
        {
            $.subdimension = $.dimension;
            self.fuse(function(item, subitem, DIM, BASE, POS){
                return CombinatorialIterator.connect("project", item, subitem, DIM, BASE, POS);
            }, combIter, pos, dir);
        }
        return self;
    }

    ,base: function( non_recursive ) {
        var $ = this.$;
        return ($.sub && !non_recursive ? ($.subbase || $.base) : $.base) || 0;
    }

    ,dimension: function( non_recursive ) {
        var $ = this.$;
        return ($.sub && !non_recursive ? ($.subdimension || $.dimension) : $.dimension) || 0;
    }

    ,position: function( non_recursive ) {
        var $ = this.$;
        return ($.sub && !non_recursive ? ($.subposition || $.position) : $.position) || null;
    }

    ,total: function( non_recursive ) {
        var $ = this.$, O = Abacus.Arithmetic.O;
        return ($.sub && !non_recursive ? $.subcount : $.count) || O;
    }

    ,output: function( item ) {
        var self = this, n = self.n, $ = self.$, output = $.output || null, type = $.type || null;
        return null == item ? null : (null == output ? ("sequence"===type ? item : item.slice()) : (is_callable(output) ? output(item,n) : (is_array(output) ? operate(function(a,ii,i){
            a[i] = 0<=ii && ii<output.length ? output[ii] : ii; return a;
        },new Array(item.length),item) : (is_string(output) ? operate(function(s,ii,i){
            s += 0<=ii && ii<output.length ? output.charAt(ii) : String(ii); return s;
        },"",item) : ("sequence"===type ? item : item.slice())))));
    }

    ,fusion: function( item, subitem ) {
        var self = this, $ = self.$, t;
        if ( !$.sub ) return item;
        if ( -1 === $.subcascade ){ t = item; item = subitem; subitem = t; }
        if ( null == item || null == subitem ) return item || subitem || null;
        return $.submethod.call(self, item, subitem, self.dimension(), self.base(), $.subpos);
    }

    ,_reset: function( dir ) {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            order = $.order, r, tot, tot_1;

        self.__index = self._index = O;
        self._item = self.__item = self.item__ = null;
        self._prev = false; self._next = false;
        tot = $.count; tot_1 = $.last;

        if ( "sequence" === $.type )
            $.seq_curr = $.seq && $.seq.length ? (0>dir ? $.seq.length-1 : 0) : -1;

        if ( RANDOM & order )
        {
            // a uniform random traversal over all traversals of the combinatorial space
            if ( ("gen" === Abacus.Options.RANDOM) || (1 === $.rand[$.type]) || Arithmetic.gt(tot, Abacus.Options.MAXMEM) || (Arithmetic.isDefault() && 0 > tot/*has overflowed*/) )
            {
                // no random unranking supported/enabled
                // and/or too big to keep in memory
                // NOTE: given unbiased random generation and large combinatorial sample space (both given)
                // the probability of having duplicates is close to ZERO (and exactly ZERO on average)
                // so it indeed produces uniform random traversals (on average)
                self.__item = klass.rand(n, $);
                self.__index = O;
            }
            else
            {
                // random unranking supported
                // and can keep it in memory => uniform random traversals in all cases
                // lazy init
                if ( self._traversed ) self._traversed.dispose();
                self._traversed = new Abacus.BitArray( Arithmetic.val(tot) );
                r = self.random("index");
                self._traversed.set(+r);
                self.__item = klass.unrank(r, n, $);
                if ( null != self.__item ) self.__index = r;
            }
            self._index = O;
        }
        else
        {
            // get a lexicographic or minimal ordering (eg LEX, COLEX, REVLEX, REVCOLEX, GRAY, etc..)
            self.__item = klass.initial(n, $, dir, true);
            if ( null != self.__item )
            {
                self.__index = 0 > dir ? tot_1 : O;
                // any extra info for fast computation of item succ
                self._update( );
            }
            self._index = self.__index;
        }

        self._item = self.output(self.__item);
        self._prev = (RANDOM & order) || (0 < dir) ? false : null != self.__item;
        self._next = (0 > dir) && !(RANDOM & order) ? false : null != self.__item;

        return self;
    }

    ,_update: function( ) {
        var self = this;
        // compute and store any extra item information
        // needed between successive runs to run faster, eg cat or loopless, instead of linear
        self.item__ = null;
        return self;
    }

    ,order: function( order, reverse ) {
        if ( !arguments.length ) return this._order;

        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, suborder, r, n, $, dir,
            rewind = true === order, i, l;

        reverse = -1 === reverse;
        n = self.n; $ = self.$;

        if ( self._traversed )
        {
            self._traversed.dispose( );
            self._traversed = null;
        }

        if ( rewind )
        {
            order = $.order;
        }
        else if ( is_string(order) )
        {
            if ( -1 < (r=order.indexOf('|')) )
            {
                suborder = order.substr(r+1);
                order = ORDER( order.substr(0, r) );
            }
            else
            {
                suborder = order = ORDER( order );
            }
        }
        else
        {
            suborder = order = ORDER( order );
        }
        //dir = REVERSED & order ? -1 : 1; // T
        dir = reverse ? -1 : 1; // T
        $.order = order;

        if ( $.sub )
        {
            if ( rewind ) $.sub.rewind(dir);
            else $.sub.order(suborder,dir);
            self.__subindex = $.sub.index();
            self.__subitem = $.sub.next(dir);
            self._subindex = null;
            self._subitem = null;
        }
        else
        {
            self.__subindex = null;
            self.__subitem = null;
            self._subindex = null;
            self._subitem = null;
        }

        if ( "sequence" === $.type && $.seq && $.seq.length )
        {
            for(i=0,l=$.seq.length; i<l; i++)
                if ( rewind ) $.seq[i].rewind(dir); else $.seq[i].order(order,dir);
        }
        self._reset(dir);

        if ( $.sub )
        {
            self._prev = self._prev && (null != self.__subitem);
            self._next = self._next && (null != self.__subitem);
            self._subindex = Arithmetic.add(Arithmetic.mul(self.__subindex,$.count), self._index);
            self._subitem = self.fusion(self._item, self.__subitem);
        }
        return self;
    }

    ,index: function( index, non_recursive ) {
        non_recursive = !!non_recursive;
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            n = self.n, $ = self.$, tot = $.sub && !non_recursive ? $.subcount : $.count,
            curindex = $.sub && !non_recursive ? self._subindex : self._index,
            order = $.order, tot_1/*, dir = REVERSED & order ? -1 : 1*/; // T

        if ( !arguments.length )
        {
            index = self.$.sub /*&& !non_recursive*/ ? self._subindex : self._index;
            return /*Arithmetic.sub(*/index/*, self.hasNext()?1:0)*/;
        }

        index = Arithmetic.wrapR(Arithmetic.num( index ), tot);

        if ( !Arithmetic.equ(index, curindex) && Arithmetic.inside(index, J, tot) )
        {
            tot = $.count; tot_1 = $.last;
            if ( $.sub && !non_recursive )
            {
                $.sub.index( Arithmetic.div(index, tot) );
                self.__subindex = $.sub.index();
                self.__subitem = $.sub.item();
                index = Arithmetic.mod(index, tot);
            }

            if ( !(RANDOM & order) )
            {
                self.__index = index;
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? klass.initial(n, $, 1)
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial(n, $, -1)
                : klass.unrank(index, n, $));
                // any extra info for fast computation of item succ
                self._update( );
                self._item = self.output(self.__item);
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }

            if ( $.sub )
            {
                self._prev = self._prev && (null != self.__subitem);
                self._next = self._next && (null != self.__subitem);
                self._subindex = Arithmetic.add(Arithmetic.mul(self.__subindex,tot), self._index);
                self._subitem = self.fusion(self._item, self.__subitem);
            }
        }
        return self;
    }

    ,item0: function( dir ) {
        var self = this;
        return self[CLASS].initial(self.n, self.$, -1===dir?-1:1);
    }

    ,item: function( index, order ) {
        if ( !arguments.length ) return this.$.sub ? this._subitem : this._item;

        var self = this, klass = self[CLASS], n = self.n, $ = self.$,
            tot = $.sub ? $.subcount : $.count, tot_1,
            curindex = $.sub ? self._subindex : self._index, indx,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            dir, o, item, subitem, r, suborder = null;

        if ( is_string(order) )
        {
            if ( -1 < (r=order.indexOf('|')) )
            {
                suborder = order.substr(r+1);
                order = ORDER( order.substr(0, r) );
            }
            else
            {
                suborder = order = ORDER( order );
            }
        }
        else if ( null != order )
        {
            suborder = order = ORDER( order );
        }
        else
        {
            order = $.order;
            suborder = null;
        }
        if ( !$.sub ) suborder = null;

        if ( is_array(index) )
        {
            // set item, instead of index, eg resume from existing item
            tot = $.count;
            tot_1 = $.last;
            o = $.order; $.order = order;

            self.__item = index.slice( );
            // any extra info for fast computation of item succ
            self._update( );
            self.__index = klass.rank(self.__item, n, $);
            self._item = self.output(self.__item);

            if ( RANDOM & order )
            {
                self._index = self.__index;
            }
            else//if ( !(RANDOM & order) )
            {
                self._index = self.__index;
            }
            self._prev = null != self.__item;
            self._next = null != self.__item;
            //$.order = o;
            return self;
        }

        index = Arithmetic.wrapR(Arithmetic.num( index ), tot);

        if ( (order === $.order) && (null === suborder) && Arithmetic.equ(index, curindex) )
            return $.sub ? self._subitem : self._item;

        if ( Arithmetic.inside(index, J, tot) )
        {
            subitem = null;
            tot = $.count; tot_1 = $.last;
            if ( $.sub )
            {
                subitem = $.sub.item( Arithmetic.div(index, tot), suborder );
                index = Arithmetic.mod(index, tot);
            }
            if ( RANDOM & order )
            {
                indx = null;//self.random("index");
                o = $.order; $.order = order;
                item =  self.output(
                    /*klass.unrank(indx, n, $)*/
                    klass.rand(n, $)
                );
                $.order = o;
                if ( $.sub ) item = self.fusion(item, subitem);
                return item;
            }
            else
            {
                indx = index;
                o = $.order; $.order = order;
                item = self.output(Arithmetic.equ(O, index)
                ? klass.initial(n, $, 1)
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial(n, $, -1)
                : klass.unrank(indx, n, $)));
                $.order = o;
                if ( $.sub ) item = self.fusion(item, subitem);
                return item;
            }
        }
        return null;
    }

    ,random: function( type, m, M, non_recursive ) {
        var self = this, klass = self[CLASS], $ = self.$, item, output, o = $.order;
        non_recursive = !!non_recursive;
        if ( "index" === type )
        {
            var Arithmetic = Abacus.Arithmetic,
                N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
                tot, tot_1;

            if ( m === !!m )
            {
                non_recursive = m;
                m = null;
                M = null;
            }
            if ( $.sub && !non_recursive )
            {
                tot = $.subcount;
                tot_1 = Arithmetic.sub(tot, I);
            }
            else
            {
                tot = $.count;
                tot_1 = $.last;
            }

            if ( (null == m) && (null == M)  )
            {
                m = O;
                M = tot_1;
            }
            else if ( null == M )
            {
                m = N( m || 0 );
                M = tot_1;
            }
            else
            {
                m = N( m );
                M = N( M );
            }
            return Arithmetic.rnd( m, M );
        }
        do{
            $.order |= RANDOM;
            item = klass.rand(self.n, $);
            $.order = o;
            item = self.output(item);
            output = $.sub && !non_recursive ? self.fusion(item, $.sub.random()) : item;
        }while($.filter && (null!=output) && !$.filter.apply(output, self)); // if custom filter reject if invalid, try next
        return output;
    }

    ,rewind: function( dir ) {
        var self = this;
        return self.order(true, -1 === dir ? -1 : 1);
    }

    ,hasNext: function( dir ) {
        var self = this;
        return -1 === dir ? (RANDOM & self.$.order ? false : self._prev) : self._next;
    }

    ,next: function( dir ) {
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, dI,
            traversed, r, n = self.n, $ = self.$,
            order = $.order, tot = $.count, tot_1, rs,
            current, has_curr, has_next;

        dir = -1 === dir ? -1 : 1;
        // random order has no prev
        if ( (0 > dir) && (RANDOM & order) ) return null;

        dI = 0 > dir ? J : I;

        do{
            current = $.sub ? self._subitem : self._item;
            has_curr = null != current;

            if ( RANDOM & order )
            {
                tot_1 = $.last;
                if ( Arithmetic.lt(self._index, tot_1) )
                {
                    traversed = self._traversed;
                    if ( !traversed )
                    {
                        // random generation
                        self.__item = klass.rand(n, $);
                        self.__index = null;
                    }
                    else
                    {
                        // random unranking
                        // get next un-traversed index, reject if needed
                        r = self.random("index");
                        rs = Abacus.Math.rnd( ) > 0.5 ? J : I;
                        while ( traversed.isset( +r ) ) r = Arithmetic.wrap( Arithmetic.add(r, rs), O, tot_1 );
                        traversed.set( +r );
                        self.__item = klass.unrank(r, n, $);
                        if ( null != self.__item ) self.__index = r;
                    }
                }
                else
                {
                    self._item = self.__item = null;
                    if ( self._traversed )
                    {
                        self._traversed.dispose( );
                        self._traversed = null;
                    }
                }
            }
            else
            {
                // compute next/prev, using successor methods / loopless algorithms,
                // WITHOUT using big integer arithmetic
                self.__item = klass.succ(self.__item, self.__index, n, $, dir, self.item__);
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, dI);
            }
            has_next = null != self.__item;

            if ( !has_next )
            {
                if ( $.sub && $.sub.hasNext(dir) )
                {
                    self.__subindex = $.sub.index();
                    self.__subitem = $.sub.next(dir);
                    if ( null == self.__subitem )
                    {
                        // maybe subIter has filtering applied, so check actual .next() returns non-null
                        self.__subindex = null;
                        self.__subitem = null;
                        if ( 0 > dir )
                        {
                            self._prev = has_next;
                            self._next = has_curr;
                        }
                        else
                        {
                            self._prev = has_curr;
                            self._next = has_next;
                        }
                    }
                    else
                    {
                        if ( "sequence" === $.type && $.seq && $.seq.length )
                            for(i=0,l=$.seq.length; i<l; i++) $.seq[i].rewind(dir);
                        self._reset(dir);
                        has_next = null != self.__item;
                    }
                }
                else
                {
                    self.__subindex = null;
                    self.__subitem = null;
                    if ( 0 > dir )
                    {
                        self._prev = has_next;
                        self._next = has_curr;
                    }
                    else
                    {
                        self._prev = has_curr;
                        self._next = has_next;
                    }
                }
            }
            else
            {
                self._index = Arithmetic.add(self._index, dI);
                if ( null === self.__index ) self.__index = self._index;
                if ( 0 > dir )
                {
                    self._prev = has_next;
                    self._next = has_curr;
                }
                else
                {
                    self._prev = has_curr;
                    self._next = has_next;
                }
            }

            self._item = self.output(self.__item);

            if ( $.sub )
            {
                has_next = has_next && (null != self.__subitem);
                self._subindex = has_next ? Arithmetic.add(Arithmetic.mul(self.__subindex,tot), self._index) : null;
                self._subitem = has_next ? self.fusion(self._item, self.__subitem) : null;
                if ( 0 > dir ) self._prev = has_next;
                else self._next = has_next;
            }
        }while($.filter && (null!=current) && !$.filter.apply(current, self)); // if custom filter, reject if invalid, try next
        return current;
    }

    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.sub ? $.subcount : $.count,
            tot_1 = $.sub ? Arithmetic.sub(tot,I) : $.last,
            range, count, next, i, k, iter_state, dir = 1,
            argslen = arguments.length, not_randomised = !(RANDOM & $.order);
        if ( argslen < 1 )
        {
            start = O;
            end = tot_1;
        }
        else if ( argslen < 2 )
        {
            start = N( start );
            end = tot_1;
        }
        else
        {
            start = N( start );
            end = N( end );
        }
        start = Arithmetic.wrapR( start, tot );
        end = Arithmetic.wrapR( end, tot );
        if ( Arithmetic.gt(start, end) )
        {
            tmp = start;
            start = end;
            end = tmp;
            dir = -1;
        }
        start = Arithmetic.clamp(start, O, tot_1);
        if ( not_randomised ) end = Arithmetic.clamp(end, O, tot_1);
        if ( Arithmetic.lte(start, end) )
        {
            // store current iterator state
            iter_state = [
                 self.$.order
                ,self.__index
                ,self._index
                ,self.__item&&self.__item.slice()
                ,self._item
                ,self.__subindex
                ,self._subindex
                ,self.__subitem
                ,self._subitem
                ,self._prev
                ,self._next
            ];

            if ( not_randomised ) self.index( start );
            count = Arithmetic.val(Arithmetic.sub(end, start));
            /*operate(function(range,ri,i){
                range[i] = self.next( ); return range;
            }, new Array(count+1), null, 0>dir?count:0, 0>dir?0:count, 0>dir?-1:1);*/
            range = new Array(count+1);
            k = 0;
            // take into account possible filtering applied
            while( k<=count )
            {
                next = self.next();
                if ( null == next ) break;
                range[k++] = next;
            }
            // truncate if needed
            if ( range.length > k ) range.length = k;
            // reverse if needed
            if ( 0 > dir && 1 < range.length ) reflection(range, range);

            // restore previous iterator state
            self.$.order = iter_state[0];
            self.__index = iter_state[1];
            self._index = iter_state[2];
            self.__item = iter_state[3];
            self._item = iter_state[4];
            self.__subindex = iter_state[5];
            self._subindex = iter_state[6];
            self.__subitem = iter_state[7];
            self._subitem = iter_state[8];
            self._prev = iter_state[9];
            self._next = iter_state[10];
            self._update();
        }
        else
        {
            range = [];
        }
        return range;
    }
    ,storeState: function( raw ) {
        var self = this, state;
        state = [
             self.$.order
            ,null == self.__index ? null : self.__index.toString()
            ,null == self._index ? null : self._index.toString()
            ,self.__item
            ,self._item
            ,null == self.__subindex ? null : self.__subindex.toString()
            ,null == self._subindex ? null : self._subindex.toString()
            ,self.__subitem
            ,self._subitem
            ,self._prev
            ,self._next
            ,self.$.sub ? self.$.sub.storeState(true) : null
        ];
        return raw ? state : JSON.stringify(state);
    }
    ,resumeState: function( state ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null != state )
        {
            state = is_string(state) ? JSON.parse(state) : state;
            self.$.order = state[0];
            self.__index = null == state[1] ? null : Arithmetic.num(state[1]);
            self._index = null == state[2] ? null : Arithmetic.num(state[2]);
            self.__item = state[3];
            self._item = state[4];
            self.__subindex = null == state[5] ? null : Arithmetic.num(state[5]);
            self._subindex = null == state[6] ? null : Arithmetic.num(state[6]);
            self.__subitem = state[7];
            self._subitem = state[8];
            self._prev = state[9];
            self._next = state[10];
            if ( self.$.sub && state[11] ) self.$.sub.resumeState(state[11]);
        }
        return self;
    }
});

// a iterator for arithmetic progressions from MIN up to MAX, by step=STEP
Progression = Abacus.Progression = Class(Iterator, {

    constructor: function Progression( min, step, max, $ ) {
        var self = this, Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
            O = Arithmetic.O, I = Arithmetic.I;
        if ( !is_instance(self, Progression) ) return new Progression(min, step, max, $);
        if ( is_array(min) || is_args(min) )
        {
            $ = step || {};
            step = 1<min.length ? min[1] : null;
            max = 2<min.length ? min[2] : null;
            min = 0<min.length ? min[0] : null;
        }
        else
        {
            $ = $ || {};
        }
        $.type = String($.type || "arithmetic").toLowerCase();
        $.NumberClass = is_class($.NumberClass, Integer) ? $.NumberClass : null;
        self._min = is_instance(min, Integer) ? min.num : N(min||0);
        self._step = is_instance(step, Integer) ?  step.num : N(null==step?1:step);
        self._max = null==max ? Arithmetic.INF : (Arithmetic.INF===max ? max : (is_instance(max, Integer) ?  max.num : N(max)));

        if ( !$.NumberClass  && is_instance(min, Integer) ) $.NumberClass = min[CLASS];

        if ( "geometric" === $.type )
        {
            if ( Arithmetic.equ(O, self._min) || Arithmetic.equ(I, self._step) )
                $.count = I;
            else if ( Arithmetic.equ(O, self._step) || Arithmetic.equ(Arithmetic.J, self._step) )
                $.count = Arithmetic.II;
            else
                $.count = Arithmetic.INF === self._max ? I : Arithmetic.add(I, ilog(Arithmetic.div(self._max, self._min), Arithmetic.abs(self._step)));
        }
        else//if ( "arithmetic" === $.type )
        {
            if ( Arithmetic.equ(O, self._step) )
                $.count = I;
            else
                $.count = Arithmetic.INF === self._max ? I : Arithmetic.add(I, Arithmetic.div(Arithmetic.sub(self._max, self._min), Arithmetic.abs(self._step)));
        }
        $.last = Arithmetic.sub($.count, I);
        Iterator.call(self, "Progression", $);
        self.rewind();
    }

    ,_min: null
    ,_step: null
    ,_max: null

    ,dispose: function( ) {
        var self = this;
        self._min = null;
        self._step = null;
        self._max = null;
        return Iterator[PROTO].dispose.call(self);
    }

    ,rewind: function( dir, non_recursive ) {
        dir = -1===dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic;
        if ( 0 > dir )
        {
            if ( Arithmetic.INF === self._max )
            {
                self.__item = null;
                self._item = null;
            }
            else
            {
                if ( 'geometric' === self.$.type )
                    self.__item = Arithmetic.mul(self._min, Arithmetic.pow(self._step, self.$.last));
                else
                    self.__item = Arithmetic.add(self._min, Arithmetic.mul(self._step, self.$.last));

                self._item = self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
            }
        }
        else
        {
            self.__item = self._min;
            self._item = self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
        }
        if ( $.sub && (true !== non_recursive) )
        {
            $.sub.rewind(dir);
            self.__subitem = $.sub.next(dir);
            self._subitem = (null != self._item) && (null != self.__subitem) ? self.fusion(self._item, self.__subitem) : null;
        }
        return self;
    }

    ,hasNext: function( dir ) {
        dir = -1===dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic;
        return Arithmetic.INF === self._max ? ((0 < dir) && ($.sub ? (null != self.__subitem) : true)) : ($.sub ? (null != self._subitem) : (null != self.__item));
    }

    ,next: function( dir ) {
        dir = -1===dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic, current, prev;

        do{
            prev = self.__item; current = $.sub ? self._subitem : self._item;

            if ( null != prev )
            {
                if ( "geometric" === $.type )
                {
                    // geometric progression
                    if ( 0 > dir )
                    {
                        if ( Arithmetic.equ(prev, self._min) )
                            self.__item = null;
                        else
                            self.__item = Arithmetic.div(prev, self._step);
                    }
                    else
                    {
                        if ( (Arithmetic.INF !== self._max) && Arithmetic.equ(prev, self._max) )
                            self.__item = null;
                        else
                            self.__item = Arithmetic.mul(prev, self._step);
                    }
                }
                else
                {
                    // arithmetic progression
                    if ( 0 > dir )
                    {
                        if ( Arithmetic.equ(prev, self._min) )
                            self.__item = null;
                        else
                            self.__item = Arithmetic.sub(prev, self._step);
                    }
                    else
                    {
                        if ( (Arithmetic.INF !== self._max) && Arithmetic.equ(prev, self._max) )
                            self.__item = null;
                        else
                            self.__item = Arithmetic.add(prev, self._step);
                    }
                }
                if ( (null!=self.__item) && (Arithmetic.lt(self.__item, self._min) ||
                    ((Arithmetic.INF !== self._max) && Arithmetic.gt(self.__item, self._max))) )
                {
                    self.__item = null;
                }
                self._item = null==self.__item ? null : self.output($.NumberClass ? new $.NumberClass(self.__item) : self.__item);
            }
            if ( (null == self.__item) && $.sub && $.sub.hasNext(dir) )
            {
                self.rewind(dir, true);
                self.__subitem = $.sub.next(dir);
                self._subitem = null != self._item && null != self.__subitem ? self.fusion(self._item, self.__subitem) : null;
            }
        }while($.filter && (null!=current) && !$.filter.apply(current, self));

        return current;
    }
    ,storeState: function( raw ) {
        var self = this, state;
        state = [
             self._min.toString()
            ,self._step.toString()
            ,self._max.toString()
            ,null == self.__item ? null : self.__item.toString()
            ,null == self._item ? null : self._item.toString()
            ,null == self.__subitem ? null : self.__subitem.toString()
            ,null == self._subitem ? null : self._subitem.toString()
            ,self.$.sub ? self.$.sub.storeState(true) : null
        ];
        return raw ? state : JSON.stringify(state);
    }
    ,resumeState: function( state ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null != state )
        {
            state = is_string(state) ? JSON.parse(state) : state;
            self._min = "-Infinity" === state[0] ? Arithmetic.NINF : ("Infinity" === state[0] ? Arithmetic.INF : Arithmetic.num(state[0]));
            self._step = "-Infinity" === state[1] ? Arithmetic.NINF : ("Infinity" === state[1] ? Arithmetic.INF : Arithmetic.num(state[1]));
            self._max = "-Infinity" === state[2] ? Arithmetic.NINF : ("Infinity" === state[2] ? Arithmetic.INF : Arithmetic.num(state[2]));
            self.__item = null == state[3] ? null : Arithmetic.num(state[3]);
            self._item = null == state[4] ? null : Arithmetic.num(state[4])
            self.__subitem = null == state[5] ? null : Arithmetic.num(state[5])
            self._subitem = null == state[6] ? null : Arithmetic.num(state[6])
            if ( self.$.sub && state[7] ) self.$.sub.resumeState(state[7]);
        }
        return self;
    }
});

HashSieve = function HashSieve( ) {
    var self = this, _hash = null;

    if ( !is_instance(self, HashSieve) ) return new HashSieve();

    _hash = Obj(); //{};

    self.dispose = function( ) {
        self.empty();
        _hash = null;
        return self;
    };

    self.empty = function( ) {
        var i, iter, j, l;
        if ( !_hash ) return self;
        for(i in _hash)
        {
            if ( !HAS.call(_hash, i) || null == _hash[i] ) continue;
            for(iter=_hash[i],j=0,l=iter.length; j<l; j++)
                if ( iter[j] ) iter[j].dispose();
        }
        return self;
    };

    self.reset = function( ) {
        self.empty();
        _hash = Obj();
        return self;
    };

    self.add = function( iter, number ) {
        var first = iter.next(), key;
        if ( null == first )
        {
            iter.dispose();
            return self;
        }

        key = String(first);

        if ( _hash[key] )
            _hash[key].push(iter);
        else
            _hash[key] = [iter];

        return self;
    };

    self.has = function( number ) {
        var key = String(number);
        if ( _hash[key] )
        {
            _remove(number, key);
            return true;
        }
        return false;
    };

    function _remove( number, key ) {
        var iter = _hash[key], i, l;

        if ( null == iter ) return false;

        delete _hash[key];

        for(i=0,l=iter.length; i<l; i++) self.add(iter[i], number);

        return number;
    };
};

// https://en.wikipedia.org/wiki/Generation_of_primes#Prime_sieves
// https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes
// https://en.wikipedia.org/wiki/Sieve_of_Sundaram
// https://en.wikipedia.org/wiki/Sieve_of_Atkin
// An efficient, lazy, "infinite" prime sieve as iterator (supports Eratosthenes' and maybe in future also Atkin's Sieve)
PrimeSieve = Abacus.PrimeSieve = Class(Iterator, {

    // extends and implements Iterator
    constructor: function PrimeSieve( $ ) {
        var self = this, Arithmetic = Abacus.Arithmetic;

        if ( !is_instance(self, PrimeSieve) ) return new PrimeSieve($);

        $ = $ || {};
        $.type = String($.type || "eratosthenes").toLowerCase();
        $.NumberClass = is_class($.NumberClass, Integer) ? $.NumberClass : null;
        $.count = Arithmetic.I; // infinite

        // (Eratosthenes) Sieve with pre-computed small primes list
        self._multiples = new HashSieve();
        self._small_primes = small_primes();
        if ( !self._small_primes || !self._small_primes.length ) self._small_primes = [Arithmetic.II]; // first prime
        self._p = 0;

        Iterator.call(self, "PrimeSieve", $);
    }

    ,_multiples: null
    ,_small_primes: null
    ,_p: 0

    ,dispose: function( ) {
        var self = this;
        if ( self._multiples ) self._multiples.dispose();
        self._multiples = null;
        self._small_primes = null;
        self._p = null;
        return Iterator[PROTO].dispose.call(self);
    }
    ,rewind: function( dir ) {
        var self = this;
        self._multiples.reset();
        self._p = 0;
        return self;
    }
    ,hasNext: function( dir ){
        dir = -1 === dir ? -1 : 1;
        return 0 < dir; /* infinite primes (only forward) */
    }
    ,next: function( dir ) {
        dir = -1 === dir ? -1 : 1;
        if ( 0 > dir ) return null;

        var self = this, $ = self.$, pp, p2, pl, ps,
            multiples = self._multiples, small_primes = self._small_primes,
            Arithmetic = Abacus.Arithmetic, two = Arithmetic.II,
            prime = self.__item, output;

        do{
            // Eratosthenes sieve with pre-computed small primes list
            // O(n log(log(n))) for getting all primes up to n
            if ( self._p < small_primes.length )
            {
                // get primes from the pre-computed list
                //self.__index = Arithmetic.num(self._p);
                prime = small_primes[self._p++];

                // add odd multiples of this prime to the list for crossing out later on,
                // start from p^2 since lesser multiples are already crossed out by previous primes
                if ( Arithmetic.gt(prime, two) )
                {
                    pp = Arithmetic.mul(prime, prime); p2 = Arithmetic.add(prime, prime);
                    pl = small_primes[small_primes.length-1]; // last prime in list
                    if ( Arithmetic.lt(pp, pl) )
                    {
                        // take multiples of this prime AFTER the last prime in list
                        // lesser multiples have already been taken care of
                        ps = Arithmetic.div(Arithmetic.sub(pl, pp), p2);
                        pp = Arithmetic.add(pp, Arithmetic.mul(ps, p2));
                        if ( Arithmetic.lte(pp, pl) ) pp = Arithmetic.add(pp, p2);
                    }
                    multiples.add(new Progression(pp, p2, Arithmetic.INF));
                }
            }
            else
            {
                if ( Arithmetic.equ(prime, two) )
                {
                    // first odd prime
                    prime = Arithmetic.num(3);
                }
                else
                {
                    // check candidate primes, using odd increments, ie avoid multiples of two faster
                    do{

                        prime = Arithmetic.add(prime, two);

                    }while(multiples.has(prime));
                }

                // add odd multiples of this prime to the list for crossing out later on,
                // start from p^2 since lesser multiples are already crossed out by previous primes
                pp = Arithmetic.mul(prime, prime); p2 = Arithmetic.add(prime, prime);
                multiples.add(new Progression(pp, p2, Arithmetic.INF));

                //self.__index = Arithmetic.add(self.__index, Arithmetic.I);
            }

            output = self.output($.NumBerClass ? new $.NumBerClass(prime) : prime);
        }while($.filter && (null!=output) && !$.filter.apply(output, self));

        self.__item = prime;
        self._item = output;
        return prime;
    }
});


// https://en.wikipedia.org/wiki/Outer_product
// https://en.wikipedia.org/wiki/Kronecker_product
// https://en.wikipedia.org/wiki/Tensor_product
// also a combinatorial iterator for partial (explicit and/or as conditional expressions) combinatorial data
Tensor = Abacus.Tensor = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Tensor( /*dims here ..*/ ) {
        var self = this, sub = null, n = slice.call(arguments), $;
        $ = n.length && !is_instance(n[n.length-1], CombinatorialIterator) && !is_array(n[n.length-1]) && (n[n.length-1] !== +n[n.length-1]) ? n.pop( ) || {} : {};
        if ( n.length && is_array(n[0]) ) n = n[0];
        if ( !n || !n.length ) n = [];
        if ( !is_instance(self, Tensor) ) return new Tensor(n, $);

        $.type = String($.type || "tensor").toLowerCase();
        $.order = $.order || LEX;
        $.rand = $.rand || {};

        if ( "partial" === $.type )
        {
            n = is_array(n)&&n.length ? n[0] : n;
            var nsub = -1, data = $.data||[], pos = $.position||null;

            if ( is_instance(n, CombinatorialIterator) )
            {
                sub = n;
                n = sub.base();
                // partial n, needs plus the position data of this instance
                nsub = n;
            }
            else
            {
                sub = $.sub;
            }
            n = (+(n||0))||0;

            if ( is_obj(data) )
            {
                //eg. {0:"{0..4}",1:"[0]+1",..}
                pos = [];
                data = KEYS(data).map(function(p){
                    p = +p;
                    pos.push(p);
                    return data[p];
                });
            }
            if ( is_args(data) ) data = slice.call(data);
            if ( is_args(pos) ) pos = slice.call(pos);
            if ( data.length && (is_string(data[0]) || (data[0].length && (true === data[0][0] || false === data[0][0]))) )
            {
                // conditions: ALGEBRAIC(STRING EXPR) AND/OR BOOLEAN(POSITIVE / NEGATIVE) => [values] per position
                if ( nsub === n ) { n += data.length; nsub = -1; }
                data = Tensor.generate( n, data, pos, $.ordering||null );
            }
            if ( nsub === n ) { n += (data.length?data[0].length:0)||0; nsub = -1; }

            $.data = data; $.position = pos || array((data.length?data[0].length:0)||0, 0, 1);
            $.dimension = $.position.length; $.base = n;
            $.rand["partial"] = 1;
        }
        else
        {
            if ( "tuple" === $.type )
            {
                n[0] = n[0]||1; n[1] = n[1]||1;
                if ( is_instance(n[0], CombinatorialIterator) )
                {
                    sub = n[0];
                    n[0] = sub.dimension();
                }
                else if ( is_instance(n[1], CombinatorialIterator) )
                {
                    sub = n[1];
                    n[1] = sub.base();
                }
                else
                {
                    sub = $.sub;
                }
                $.base = n[1];
                $.dimension = n[0];
                if ( "gray" === $.output ) $.output = function(item, n){ return Tensor.gray(item,n[1]); };
            }
            else
            {
                var m_M = operate(function(m_M, k){
                    if ( k < m_M[0] ) m_M[0] = k;
                    if ( k > m_M[1] ) m_M[1] = k;
                    return m_M;
                }, [Infinity,0], n);
                $.base = n;
                $.minbase = m_M[0]; $.maxbase = m_M[1];
                $.dimension = n.length;
                if ( "gray" === $.output )
                {
                    $.output = function(item, n){ return Tensor.gray(item,n); };
                }
                else if ( "inversion" === $.output )
                {
                    $.output = function(item, n){ return Tensor.inversion(item); };
                }
                else if ( is_array($.output) )
                {
                    var BASE = $.output;
                    $.output = function(item, n){ return Tensor.component(item,BASE); };
                }
            }
        }
        CombinatorialIterator.call(self, "Tensor", n, $, sub?{method:"partial"===$.type?($.submethod||"complete"):$.submethod,iter:sub,pos:"partial"===$.type?($.subpos||$.position):$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function( n, $ ) {
            var O = Abacus.Arithmetic.O, type = $ && $.type ? $.type : "tensor";
            return "partial"===type ? ($.data&&$.data.length ? Abacus.Arithmetic.num($.data.length) : O) : ("tuple"===type ? (!n || (0 >= n[0]) ? O : exp(n[1], n[0])) : (!n || !n.length ? O : product(n)));
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "tensor",
                order = $ && $.order ? $.order : LEX;

            dir = -1 === dir ? -1 : 1;

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;

            if ( "partial" === type )
            {
                // O(1)
                item = $.data&&$.data.length ? (0 > dir ? $.data[$.data.length-1] : $.data[0]) : null;
            }
            else
            {
                // O(n)
                item = "tuple" === type ? (
                    !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
                ) : (
                    !n.length ? [] : (0 > dir ? array(n.length, function(i){return n[i]-1;}): array(n.length, 0, 0))
                );

                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        ,succ: function( item, index, n, $, dir, TI ) {
            if ( !n || (null == item) ) return null;
            var type = $ && $.type ? $.type : "tensor",
                order = $ && null!=$.order ? $.order : LEX,
                Arithmetic = Abacus.Arithmetic, ind;
            dir = -1 === dir ? -1 : 1;
            if ( "partial" === type )
            {
                if ( !$.data || !$.data.length ) return null;
                if ( REVERSED & order )
                {
                    dir = -dir;
                    if ( null != index ) index = Arithmetic.sub(Arithmetic.num($.data.length-1),index);
                }
                if ( null == index ) index = find($.data, item, true);
                ind = Arithmetic.val(index);
                return 0>dir ? (0<=ind-1 ? $.data[ind-1] : null) : (0<=ind && ind+1<$.data.length ? $.data[ind+1] : null);
            }
            return !n[0] || (0 >= n[0]) ? null : next_tensor(item, n, dir, type, order, TI);
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt,
                klass = this, item,
                type = $ && $.type ? $.type : "tensor";

            if ( "partial" === type )
            {
                item = $.data&&$.data.length ? $.data[rndInt(0,$.data.length-1)] : null;
            }
            else
            {
                item = "tuple" === type ? (
                    // p ~ 1 / n^k, O(n)
                    !n[0] ? [] : array(n[0], function(i){return rndInt(0, n[1]-1);})
                ) : (
                    // p ~ 1 / n1*n2*..nk, O(n)
                    !n.length ? [] : array(n.length, function(i){return rndInt(0, n[i]-1);})
                );

                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && null!=$.order?$.order:LEX,
                type = $ && $.type ? $.type : "tensor",
                add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
                index = Arithmetic.O, J = Arithmetic.J, nd, i;

            if ( "partial" === type )
            {
                index = Arithmetic.num(find($.data, item, true));
            }
            else
            {
                // O(n)
                item = klass.DUAL(item, n, $);

                if ( "tuple" === type )
                {
                    nd = n[0];
                    if ( !nd ) return J;
                    for(n=n[1],i=0; i<nd; i++) index = add(mul(index, n), item[i]);
                }
                else
                {
                    nd = n.length;
                    if ( !nd ) return J;
                    for(i=0; i<nd; i++) index = add(mul(index, n[i]), item[i]);
                }
            }

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            return index;
        }
        ,unrank: function( index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && null!=$.order?$.order:LEX,
                type = $ && $.type ? $.type : "tensor",
                sub = Arithmetic.sub, mod = Arithmetic.mod,
                div = Arithmetic.div, val = Arithmetic.val,
                r, b, i, t, item, nd;

            if ( null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)) )
                return null;

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            if ( "partial" === type )
            {
                if ( !$.data || !$.data.length ) return null;
                index = val(index);
                item = 0<=index && index<$.data.length ? $.data[index] : null;
            }
            else
            {
                // O(n)
                if ( "tuple" === type )
                {
                    nd = n[0];
                    if ( !nd ) return [];
                    item = new Array( nd ); b = n[1];
                    for (r=index,i=nd-1; i>=0; i--)
                    {
                        t = mod(r, b); r = div(r, b);
                        item[i] = val(t);
                    }
                }
                else
                {
                    nd = n.length;
                    if ( !nd ) return [];
                    item = new Array( nd );
                    for (r=index,i=nd-1; i>=0; i--)
                    {
                        b = n[i]; t = mod(r, b); r = div(r, b);
                        item[i] = val(t);
                    }
                }

                item = klass.DUAL(item, n, $);
            }

            return item;
        }
        ,gray: function(item, n) {
            return gray(new Array(item.length), item, n);
        }
        ,inversion: function(inv) {
            // assume inv is tensor component of dimensions: (1,2,..,n-1,n) in this order
            var i, n = inv.length, perm = n ? [0] : [];
            for(i=1; i<n; i++) perm.splice(i-inv[i], 0, i);
            return perm;
        }
        ,product: kronecker
        ,directsum: cartesian
        ,component: function( comp, base ) {
            return null == comp ? null : (null == base ? comp : array(comp.length, function(i){
                return i<base.length && 0<=comp[i] && comp[i]<base[i].length ? base[i][comp[i]] : comp[i];
            }));
        },
        affine: function( /* args */ ) {
            // do an affine transformation on each item dimension
            // an affine transform T(x) = T0*x + T1
            var affine = 1===arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
            return affine ? function( item ) {
                return array(item.length, function(i){
                    if ( i >= affine.length || null == affine[i] ) return item[i];
                    var T = affine[i];
                    return is_number(T) ? item[i]+T : T[0]*item[i]+(T[1]||0);
                });
            } : ID;
        }
        ,conditional: conditional_combinatorial_tensor
        ,generate: gen_combinatorial_data
    }
});
function next_tensor( item, N, dir, type, order, TI )
{
    //maybe "use asm"
    var n = N, k, i, j, i0, i1, DI, a, b, MIN, MAX;
    if ( "tuple" === type ) { k=n[0]; n=n[1]; }
    else { k=n.length; }
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; i0 = MAX; i1 = MIN;
    a = 1; b = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
        a = -a; b = MAX-b;
    }
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
        a = -a; b = MAX-b;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT)
    if ( 0 > dir )
    {
        if ( "tuple" === type )
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if ( MIN<=i && MAX>=i )
                for(n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if ( MIN<=i && MAX>=i )
                for(item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n[a*j+b]-1;
            //else last item
            else item = null;
        }
    }
    else
    {
        if ( "tuple" === type )
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]+1===n) i-=DI;
            if ( MIN<=i && MAX>=i )
                for(item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]+1===n[a*i+b]) i-=DI;
            if ( MIN<=i && MAX>=i )
                for(item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
    }
    return item;
}

// https://en.wikipedia.org/wiki/Permutations
Permutation = Abacus.Permutation = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Permutation( n, $ ) {
        var self = this, sub = null;
        if ( !is_instance(self, Permutation) ) return new Permutation(n, $);
        $ = $ || {}; $.type = String($.type || "permutation").toLowerCase();
        n = n||0;
        if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.dimension();
        }
        else
        {
            sub = $.sub;
        }
        $.base = $.dimension = n;
        // random ordering for derangements / involutions / connecteds
        // is based on random generation, instead of random unranking
        $.rand = $.rand || {};
        $.rand["derangement"] = 1; $.rand["involution"] = 1; $.rand["connected"] = 1;
        if ( "multiset" === $.type )
        {
            $.multiplicity = is_array($.multiplicity) && $.multiplicity.length ? $.multiplicity.slice() : array(n, 1, 0);
            $.multiplicity = $.multiplicity.concat(array(n-operate(addn, 0, $.multiplicity), 1, 0));
            $.base = $.multiplicity.length;
            $.multiset = multiset($.multiplicity, n);
        }
        CombinatorialIterator.call(self, "Permutation", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function( n, $ ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                //factorial = Abacus.Math.factorial, stirling = Abacus.Math.stirling,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if ( 0 > n )
                return O;
            else if ( "cyclic" === type )
                return Arithmetic.num(n);
            else if ( "multiset" === type )
                return factorial(n, $.multiplicity);
            else if ( "derangement" === type )
                return kfixed ? (2>n-kfixed ? O : Arithmetic.mul(factorial(n,kfixed),factorial(n-kfixed,false))) : (2>n ? O : factorial(n,false));
            else if ( "involution" === type )
                return factorial(n, true);
            else if ( "connected" === type )
                return factorial(n-1);
            else//if ( "permutation" === type )
                return kcycles ? stirling(n,kcycles,1) : factorial(n);
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "permutation",
                order = $ && null!=-$.order ? $.order : LEX,
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;

            if ( 0===n ) return [];

            dir = -1 === dir ? -1 : 1;
            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            // O(n)
            if ( "cyclic" === type )
            {
                item = 0 > dir ? [n-1].concat(array(n-1, 0, 1)) : array(n, 0, 1);
            }
            else if ( "derangement" === type )
            {
                if ( kfixed || (2>n) ) return null;
                if ( n&1 ) // odd
                {
                    var n_2 = stdMath.floor(n/2);
                    item = 0 > dir ? array(n-n_2-1, n-1, -1).concat([n_2-1,n_2]).concat(array(n_2-1, n_2-2, -1)) : array(n-3, function(i){return i&1?i-1:i+1;}).concat([n-2,n-1,n-3]);
                }
                else // even
                {
                    item = 0 > dir ? array(n, n-1, -1) : array(n, function(i){return i&1?i-1:i+1;});
                }
            }
            else if ( "multiset" === type )
            {
                item = 0 > dir ? $.multiset.slice().reverse() : $.multiset.slice();
            }
            else if ( "connected" === type )
            {
                // TODO
                item = null;
            }
            else if ( "involution" === type )
            {
                item = 0 > dir ? array(n, n-1, -1) : array(n, 0, 1);
            }
            else//if ( "permutation" === type )
            {
                item = kcycles ? null : (0 > dir ? array(n, n-1, -1) : array(n, 0, 1));
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,succ: function( item, index, n, $, dir, PI ) {
            if ( !n || (0 >= n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if ( (("derangement"===type) && kfixed) || (("permutation"===type) && kcycles) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_permutation(item, n, dir, type, $ && null!=$.order ? $.order : LEX, $ && null!=$.base ? $.base : null, PI);
        }
        ,rand: function( n, $ ) {
            var item, rndInt = Abacus.Math.rndInt, klass = this,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if ( 0===n ) return [];

            if ( "cyclic" === type )
            {
                // p ~ 1 / n, O(n)
                var k = rndInt(0, n-1);
                item = 0 < k ? array(n-k, k, 1).concat(array(k, 0, 1)) : array(n, 0, 1);
            }
            else if ( "derangement" === type )
            {
                if ( kfixed ) return null;
                // p ~ 1 / !n = e / n!, O(3n)
                // adapted from http://local.disia.unifi.it/merlini/papers/Derangements.pdf
                item = new Array(n);
                var j, t, p, fixed = false;
                do{
                    for(j=0; j<n; j++) item[j] = j;
                    j = n-1; fixed = false;
                    while ( 0 <= j )
                    {
                        p = rndInt(0, j);
                        if ( item[p] === j )
                        {
                            fixed = true;
                            break;
                        }
                        else
                        {
                            t = item[j];
                            item[j] = item[p];
                            item[p] = t;
                        }
                        j--;
                    }
                    fixed = fixed || (0 === item[0]);
                }while( fixed );
            }
            else if ( "involution" === type )
            {
                // p ~ 1 / I(n), O(n)
                // adapted from http://www.jjj.de/fxt/#fxt (Jörg Arndt)
                item = array(n, 0, 1);
                var rnd = Abacus.Math.rnd,
                    rat = 0.5, n1 = 1.0, nr = n,
                    x1, r1, x2, r2, t, s,
                    // involution branch ratios
                    b = [1.0].concat(array(n-1, function(){
                        var bk = rat;
                        // R(n) = 1 / ( 1 + (n-1) * R(n-1) )
                        // R(n+1) = 1 / ( 1 + n * R(n) )
                        n1 += 1.0;
                        rat = 1.0/( 1.0 + n1*rat );
                        return bk;
                    })), r = array(n, 0, 1);
                    while( 2 <= nr )
                    {
                        x1 = nr-1;   // choose last element
                        r1 = r[x1];  // available position
                        // remove from set:
                        --nr;  // no swap needed if x1==last
                        rat = b[nr];  // probability to choose fixed point
                        t = rnd();  // 0 <= t < 1
                        if ( t > rat )  // 2-cycle
                        {
                            x2 = rndInt(0, nr-1);
                            r2 = r[x2];  // random available position != r1
                            --nr;
                            s = r[x2]; r[x2] = r[nr]; r[nr] = s;  // remove from set
                            s = item[r2]; item[r2] = item[r1]; item[r1] = s;  // create a 2-cycle
                        }
                        // else fixed point, nothing to do
                    }
            }
            else if ( "multiset" === type )
            {
                // p ~ m1!*..*mk! / n!, O(n)
                // fisher-yates-knuth unbiased multiset shuffling
                item = shuffle($.multiset.slice());
            }
            else if ( "connected" === type )
            {
                // p ~ 1 / (n-1)!, O(n)
                // sattolo unbiased shuffling
                item = shuffle(array(n, 0, 1), true);
            }
            else//if ( "permutation" === type )
            {
                if ( kcycles ) return null;
                // p ~ 1 / n!, O(n)
                // fisher-yates-knuth unbiased shuffling
                item = shuffle(array(n, 0, 1));
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                order = $ && null!=-$.order ? $.order : LEX,
                sub = Arithmetic.sub, add = Arithmetic.add,
                mul = Arithmetic.mul, div = Arithmetic.div,
                index = Arithmetic.O, i, ii, m,
                I = Arithmetic.I, J = Arithmetic.J, N, M;

            n = n || item.length;
            if ( !n ) return index;

            item = klass.DUAL(item, n, $);

            if ( "cyclic"=== type )
            {
                // O(1)
                index = Arithmetic.num(item[0]);
            }
            else if ( ("derangement" === type) || ("involution" === type) || ("connected" === type) )
            {
                /*item = permutation2inversion(null, item);
                for(I=n&1?-1:1,i=0; i<n-1; i++,I=-I)
                {
                    index = add(mul(index,n-i), I*(n-i)+item[i]);
                }
                return index;*/
                return NotImplemented();
            }
            else if ( "multiset" === type )
            {
                //item = permutation2inversion(null, multiset2permutation(item));
                // adapted from https://github.com/WoDoInc/FindMultisetRank
                // O(nm) ~ O(n^2) TODO construct O(nlgn) algorithm
                M = $.multiplicity.slice();
                N = $ && null!=$.count ? $.count : factorial(n,M);
                for(m=n-1,i=0; i<m && Arithmetic.gt(N, I); i++)
                {
                    ii = item[i]; index = add(index, div(mul(N, sum(M,0,ii-1,1)), n-i));
                    N = div(mul(N, M[ii]), n-i); M[ii]--;
                }
            }
            else//if ( "permutation" === type )
            {
                if ( kcycles ) return J;
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // O(nlgn)
                item = permutation2inversion(null, item);
                for(m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), item[i]);
            }

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);

            return index;
        }
        ,unrank: function( index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                order = $ && null!=-$.order ? $.order : LEX,
                mod = Arithmetic.mod, div = Arithmetic.div, mul = Arithmetic.mul,
                sub = Arithmetic.sub, val = Arithmetic.val,
                item, r, i, ii, b, t, N, M;

            if ( null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)) )
                return null;

            if ( !n ) return [];

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            if ( "cyclic"=== type )
            {
                // O(n)
                index = val(index);
                item = array(n, function(i){return (index+i)%n});
            }
            else if ( ("derangement" === type) || ("involution" === type) || ("connected" === type) )
            {
                return NotImplemented();
            }
            else if ( "multiset" === type )
            {
                // adapted from https://github.com/WoDoInc/FindMultisetRank
                // O(nm) ~ O(n^2) TODO construct O(nlgn) algorithm
                M = $.multiplicity.slice(); item = array(n);
                N = $ && null!=$.count ? $.count : factorial(n,M);
                for(i=0; i<n; i++)
                {
                    b = 0; ii = 0; r = val(div(mul(index, n-i), N));
                    while(ii<M.length && b+M[ii]<=r) b+=M[ii++];
                    index = sub(index, div(mul(N, b), n-i));
                    N = div(mul(N, M[ii]), n-i); M[ii]--; item[i] = ii;
                }
            }
            else//if ( "permutation" === type )
            {
                if ( kcycles ) return null;
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // O(nlgn)
                item = array(n); item[n-1] = 0;
                for (r=index,i=n-2; i>=0; i--)
                {
                    b = n-i; t = mod(r, b); r = div(r, b);
                    item[i] = val(t);
                }
                inversion2permutation(item, item);
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,permute: permute
        ,shuffle: function( a, type ) {
            if ( "cyclic" === type  )
            {
                var n = a.length, k = Abacus.Math.rndInt(0, n-1);
                if ( 0 < k ) a.push.apply(a, a.splice(0, k));
                return a;
            }
            else if ( "connected" === type )
            {
                return shuffle(a, true);
            }
            else
            {
                return shuffle(a);
            }
        }
        ,product: function( /* permutations */ ) {
            return arguments.length ? permutationproduct(is_array(arguments[0])&&is_array(arguments[0][0]) ? arguments[0] : slice.call(arguments)) : null;
        }
        ,directsum: function( /* permutations */ ) {
            return arguments.length ? permutationdirectsum(is_array(arguments[0])&&is_array(arguments[0][0]) ? arguments[0] : slice.call(arguments)) : null;
        }
        ,cycles: function( item, dir ) {
            return -1 === dir ? cycles2permutation(item) : permutation2cycles(item);
        }
        ,swaps: function( item, dir ) {
            return -1 === dir ? swaps2permutation(item) : permutation2swaps(item);
        }
        ,inversion: function( item, dir ) {
            return -1 === dir ? inversion2permutation(null, item) : permutation2inversion(null, item);
        }
        ,inverse: function( item ) {
            return permutation2inverse(null, item);
        }
        ,multiset: function( item, multi, dir ) {
            if ( item === +item ) return multiset(multi, item, -1===dir?-1:1) /*generate multiset*/;
            return -1 === dir ? multiset2permutation(item) : permutation2multiset(item, multi);
        }
        ,matrix: function( item, transposed, dir ) {
            return -1 === dir ? matrix2permutation(null, item, transposed) : permutation2matrix(null, item, transposed);
        }
        ,parity: NotImplemented
        ,isPermutation: is_permutation
        ,isIdentity: is_identity
        ,isCyclic: is_cyclic
        ,isDerangement: is_derangement
        ,isInvolution: is_involution
        ,isKthroot: is_kthroot
        ,isConnected: is_connected
        ,isKcycle: is_kcycle
    }
    ,_update: function( ) {
        var self = this;
        self.item__ = perm_item_(self.__item, self.n, self.$.order, self.$.type);
        return self;
    }
});
function perm_item_( item, n, order, type )
{
    return null;
    /*
    if ( null == item ) return null;
    var PI = null, i, k, m, s, n2, v;
    if ( 'involution' === type )
    {
        PI = new Array(1+n+n);
        v = new Array(n);
        i = 0; k = 0; m = 0; s = 0;
        while(i<n)
        {
            if ( null == v[i] )
            {
                if ( i !== item[i] )
                {
                    PI[++k] = stdMath.min(i,item[i]);
                    PI[++k] = stdMath.max(i,item[i]);
                    s++;
                }
                else
                {
                    PI[1+n+m] = i;
                    m++;
                }
                v[i] = 1; v[item[i]] = 1;
            }
            i++;
        }
        PI[0] = s;
    }
    return PI;
    */
}
function next_permutation( item, N, dir, type, order, multiplicity, PI )
{
    //maybe "use asm"
    var n = N, m = null == multiplicity ? n : multiplicity,
        k, kl, l, r, s, s0, fixed, k0, DK, a, b, da, db, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = n-1;
    DK = 1; k0 = MAX;
    a = 1; b = 0;
    da = 1; db = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        DK = -DK; k0 = MAX-k0;
        a = -a; b = m-1-b;
        dir = -dir;
    }
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DK = -DK; k0 = MAX-k0;
        da = -1; db = m-1;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT) for permutations & multisets
    // linear worst-case for derangements
    // linear for cyclic shift permutations
    if ( 0 > dir )
    {
        if ( "cyclic" === type )
        {
            k = MAX-k0;
            if ( a*item[k]+b > 0 )
            {
                //item = [item[n-1]].concat(item.slice(0,-1));
                da = n-1; DK = n+DK;
                for(l=0; l<n; l++)
                {
                    s = (a*item[k]+b+da)%n;
                    item[k] = a*s+b;
                    k = (k+DK)%n;
                }
            }
            //else last item
            else item = null;
        }
        else if ( "involution" === type )
        {
            item = null;
        }
        else if ( "connected" === type )
        {
            item = null;
        }
        else//if ( ("multiset" === type) || ("derangement" === type) || ("permutation" === type) )
        {
            do{
            fixed = false;
            //Find the largest index k such that a[k] > a[k + 1].
            // taking into account equal elements, generates multiset permutations
            k = k0-DK;
            while(MIN<=k && k<=MAX && a*item[k]<=a*item[k+DK]) k-=DK;
            // If no such index exists, the permutation is the last permutation.
            if ( MIN<=k && k<=MAX )
            {
                //Find the largest index kl greater than k such that a[k] > a[kl].
                kl = k0;
                while(MIN<=kl && kl<=MAX && DK*(kl-k)>0 && a*item[k]<=a*item[kl]) kl-=DK;
                //Swap the value of a[k] with that of a[l].
                s = item[k]; item[k] = item[kl]; item[kl] = s;
                //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                l = k+DK; r = k0;
                while(MIN<=l && l<=MAX && MIN<=r && r<=MAX && DK*(r-l)>0)
                {
                    s = item[l]; item[l] = item[r]; item[r] = s;
                    fixed = fixed || (da*l+db === item[l]) || (da*r+db === item[r]);
                    l+=DK; r-=DK;
                }
                if ( "derangement" === type )
                {
                    if ( MIN<=kl && kl<=MAX ) fixed = fixed || (da*kl+db === item[kl]);
                    if ( MIN<=r && r<=MAX ) fixed = fixed || (da*r+db === item[r]);
                    // TODO: find a way check for fixed without looping over the range here
                    for(fixed=fixed||(da*k+db === item[k]),l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
                }
                else
                {
                    fixed = false;
                }
            }
            //else last item
            else item = null;
            // every 2-3 permutations is derangement on average, ie p(D) = 1/e
            }while( item && fixed );
        }
    }
    else
    {
        if ( "cyclic" === type )
        {
            k = MAX-k0;
            if ( a*item[k]+b < n-1 )
            {
                //item = item.slice(1).concat([item[0]]);
                da = n+1; DK = n+DK;
                for(l=0; l<n; l++)
                {
                    s = (a*item[k]+b+da)%n;
                    item[k] = a*s+b;
                    k = (k+DK)%n;
                }
            }
            //else last item
            else item = null;
        }
        else if ( "involution" === type )
        {
            /*
            if ( null == PI ) PI = perm_item_(item, n, order, type);
            // generate (lexicographic) involutions by (lexicographic) 0- or 1-cycles
            s = s0 = PI[0]; // how many swaps (1-cycles)
            fixed = true;
            if ( 0 === s )
            {
                if ( 1 < n )
                {
                    l = 1; r = 2; PI[l] = MAX-1; PI[r] = MAX;
                    // new swap (1-cycle)
                    item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s=1;
                }
                fixed = false;
            }
            else
            {
                l = (s<<1)-1;
                while(fixed && l>0)
                {
                    r = l+1;

                    // add new cycle
                    k0 = PI[l]+1;
                    while(k0<=MAX && k0!==item[k0]) k0++;
                    if ( k0<=MAX )
                    {
                        k = k0+1;
                        while(k<=MAX && k!==item[k]) k++;
                        if ( k<=MAX && (s===s0 || k0!==PI[l+2] || k!==PI[l+3]) )
                        {
                            // new swap
                            l+=2; r=l+1; PI[l] = k0; PI[r] = k;
                            item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                            fixed = false;
                            break;
                        }
                    }

                    // restore cycle
                    item[PI[l]] = PI[l]; item[PI[r]] = PI[r]; s--;

                    k = PI[r]+1;
                    while(k<=MAX && k!==item[k] ) k++;
                    if ( k<=MAX )
                    {
                        // extend cycle to right
                        PI[r] = k;
                        item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                        fixed = false;
                        break;
                    }

                    k0 = PI[l]-1;
                    while(MIN<=k0 && k0!==item[k0] ) k0--;
                    if ( MIN<=k0 )
                    {
                        k = k0+1;
                        while(k<=MAX && k!==item[k] ) k++;
                        if ( k<=MAX )
                        {
                            // extend cycle to left
                            PI[l] = k0; PI[r] = k;
                            item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                            fixed = false;
                            break;
                        }
                    }

                    // next cycle
                    l-=2;
                }
            }
            PI[0] = 0 > s ? 0 : s;
            if ( fixed ) item = null;
            */
            // adapted from http://www.jjj.de/fxt/#fxt (Jörg Arndt)
            k = n; fixed = true;
            while( fixed && k-- )
            {
                kl = item[k];   // inverse perm == perm
                item[k] = k; item[kl] = kl;  // undo prior swap

                while( kl-- )
                {
                    if ( item[kl] === kl )
                    {
                        item[k] = kl; item[kl] = k;  // swap
                        fixed = false; break;
                    }
                }
            }
            if ( fixed ) item = null; // last
        }
        else if ( "connected" === type )
        {
            item = null;
        }
        else//if ( ("multiset" === type) || ("derangement" === type) || ("permutation" === type) )
        {
            // variation of  http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
            do{
            fixed = false;
            //Find the largest index k such that a[k] < a[k + 1].
            // taking into account equal elements, generates multiset permutations
            k = k0-DK;
            while(MIN<=k && k<=MAX && a*item[k]>=a*item[k+DK]) k-=DK;
            // If no such index exists, the permutation is the last permutation.
            if ( MIN<=k && k<=MAX )
            {
                //Find the largest index kl greater than k such that a[k] < a[kl].
                kl = k0;
                while(MIN<=kl && kl<=MAX && DK*(kl-k)>0 && a*item[k]>=a*item[kl]) kl-=DK;
                //Swap the value of a[k] with that of a[l].
                s = item[k]; item[k] = item[kl]; item[kl] = s;
                //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                l = k+DK; r = k0;
                while(MIN<=l && l<=MAX && MIN<=r && r<=MAX && DK*(r-l)>0)
                {
                    s = item[l]; item[l] = item[r]; item[r] = s;
                    fixed = fixed || (da*l+db === item[l]) || (da*r+db === item[r]);
                    l+=DK; r-=DK;
                }
                if ( "derangement" === type )
                {
                    if ( MIN<=kl && kl<=MAX ) fixed = fixed || (da*kl+db === item[kl]);
                    if ( MIN<=r && r<=MAX ) fixed = fixed || (da*r+db === item[r]);
                    // TODO: find a way check for fixed without looping over the range here
                    for(fixed=fixed||(da*k+db === item[k]),l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
                }
                else
                {
                    fixed = false;
                }
            }
            //else last item
            else item = null;
            // every 2-3 permutations is derangement on average, ie p(D) = 1/e
            }while( item && fixed );
        }
    }
    return item;
}

// https://en.wikipedia.org/wiki/Combinations
// Unordered Combinations(Combinations), Ordered Combinations(Variations), Repeated Combinations, Ordered Repeated Combinations(Repeated Variations)
Combination = Abacus.Combination = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k, $ ) {
        var self = this, sub = null;
        if ( !is_instance(self, Combination) ) return new Combination(n, k, $);
        if ( is_array(n) || is_args(n) )
        {
            $ = k || {};
            k = n[1]||0;
            n = n[0]||0;
        }
        else
        {
            $ = $ || {};
            n = n||0;
            k = k||0;
        }
        $.type = String($.type || "combination").toLowerCase();
        if ( -1 < $.type.indexOf('+') )
        {
            var a = $.type.split('+');
            a.sort(); $.type = a.join('+');
        }

        if ( is_instance(k, CombinatorialIterator) )
        {
            sub = k;
            k = sub.dimension();
        }
        else if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.base = n; $.dimension = k;
        if ( "binary"===$.output ) $.output = function(item,n){ return Combination.binary(item,n[0],1); };
        else if ( "conjugate"===$.output ) $.output = function(item,n){ return Combination.complement(item,n[0]); };
        CombinatorialIterator.call(self, "Combination", [n, k], $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function( n, $ ) {
             var type = $ && $.type ? $.type : "combination"/*"unordered"*/;
             return ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) ? (
                exp(n[0], n[1])
            ) : (("repeated" === type) || ("combination+repeated" === type) ? (
                factorial(n[0]+n[1]-1, n[1])
            ) : (("ordered" === type) || ("variation" === type) ? (
                factorial(n[0], -n[1])
            ) : (
                factorial(n[0], n[1])
            )));
         }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "combination"/*"unordered"*/,
                order = $ && null!=$.order ? $.order : LEX;
            if ( 0===n[1] ) return [];

            dir = -1 === dir ? -1 : 1;
            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;

            // O(k)
            item = ("repeated+variation" === type) || ("variation+repeated" === type) || ("ordered+repeated" === type) || ("combination+repeated" === type) || ("repeated" === type) ? (
                0 > dir ? array(n[1], n[0]-1, 0) : array(n[1], 0, 0)
            ) : (("ordered" === type) || ("variation" === type) ? (
                0 > dir ? array(n[1], n[0]-1, -1) : array(n[1], 0, 1)
            ) : (
                0 > dir ? array(n[1], n[0]-n[1], 1) : array(n[1], 0, 1)
            ));

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,succ: function( item, index, n, $, dir, CI ) {
            if ( !n || !n[0] || (0 >= n[0]) || (0===n[1]) || (null == item) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_combination(item, n, dir, $ && $.type ? $.type : "combination"/*"unordered"*/, $ && null!=$.order ? $.order : LEX, CI);
        }
        ,rand: function( n, $ ) {
            var klass = this, type = $ && $.type ? $.type : "combination"/*"unordered"*/,
                item, i, k = n[1], n_k, c,
                selected, rndInt = Abacus.Math.rndInt;
            if ( 0===k ) return [];

            n = n[0]; n_k = n-k; c = n-1;
            // O(klogk) worst/average-case, unbiased
            if ( ("repeated" === type) || ("combination+repeated" === type) || ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) )
            {
                // p ~ 1 / n^k (ordered+repeated), p ~ 1 / binom(n+k-1,k) (repeated)
                item = 1 === k ? [rndInt(0, c)] : array(k, function(){return rndInt(0, c);});
                if ( (1 < k) && (("repeated" === type) || ("combination+repeated" === type)) ) mergesort(item, 1, true);
            }
            else if ( ("ordered" === type) || ("variation" === type) )
            {
                // p ~ 1 / k!binom(n,k) = 1 / n*(n-1)*..*(n-k+1)
                selected = {};
                item = 1 === k ? (
                    [rndInt(0, c)]
                ) : (n === k ? (
                    shuffle(array(k, 0, 1))
                ) : (
                    array(k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    })
                ));
            }
            else//if ( ("combination" === type) || ("unordered" === type) || ("binary" === type) )
            {
                // p ~ 1 / binom(n,k)
                selected = {};
                item = 1 === k ? (
                    [rndInt(0, c)]
                ) : (n === k ? (
                    array(k, 0, 1)
                ) : (n_k < k ? (
                    complement(n, array(n_k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    }),true)
                ) : (
                    mergesort(array(k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    }),1,true)
                )));
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                add = Arithmetic.add, sub = Arithmetic.sub,
                mul = Arithmetic.mul, O = Arithmetic.O, I = Arithmetic.I,
                index = O, i, c, j, k = n[1], N, binom,
                order = $ && null!=$.order ? $.order : LEX,
                type = $ && $.type ? $.type : "combination"/*"unordered"*/;

            if ( 0===k ) return O;
            item = klass.DUAL(item, n, $);

            if ( ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) )
            {
                // O(k)
                N = n[0];
                for(i=0; i<k; i++) index = add(mul(index, N), item[i]);
            }
            else if ( ("repeated" === type) || ("combination+repeated" === type) )
            {
                // O(k)
                N = n[0]+k-1; binom = $ && $.count ? $.count : factorial(N, k);
                for(i=1; i<=k; i++)
                {
                    // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                    // adjust the order to match MSB to LSB
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]-i+1; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,I),index);
            }
            else if ( ("ordered" === type) || ("variation" === type) )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // rank(ordered) = rank(k-n-permutation)
                // O(klgk)
                N = n[0]; item = permutation2inversion(null, item, N);
                for(i=0; i<k; i++) index = add(mul(index, N-i), item[ i ]);
            }
            else//if ( ("combination" === type) || ("unordered" === type) || ("binary" === type) )
            {
                // O(k)
                N = n[0];
                binom = $ && $.count ? $.count : factorial(N, k);
                for(i=1; i<=k; i++)
                {
                    // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                    // adjust the order to match MSB to LSB
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,I),index);
            }

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);

            return index;
        }
        ,unrank: function( index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                sub = Arithmetic.sub, div = Arithmetic.div, mod = Arithmetic.mod,
                mul = Arithmetic.mul, lte = Arithmetic.lte, gt = Arithmetic.gt,
                val = Arithmetic.val, item, binom, k = n[1], N, m, t, p,
                type = $ && $.type ? $.type : "combination"/*"unordered"*/, repeated,
                order = $ && null!=$.order ? $.order : LEX;
            n = n[0];

            if ( null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)) )
                return null;

            if ( 0===k ) return [];

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            item = array(k);
            if ( ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) )
            {
                // O(k)
                for(m=index,p=k-1; p>=0; p--)
                {
                    t = mod(m, n); m = div(m, n);
                    item[p] = val(t);
                }
            }
            else if ( ("ordered" === type) || ("variation" === type) )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // unrank(ordered) = unrank(k-n-permutation)
                // O(klgk)
                for(m=index,p=k-1; p>=0; p--)
                {
                    N = n-p; t = mod(m, N); m = div(m, N);
                    item[p] = val(t);
                }
                inversion2permutation(item, item, N);
            }
            else//if ( ("repeated" === type) || ("combination+repeated" === type) || ("combination" === type) || ("unordered" === type) || ("binary" === type) )
            {
                // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                // adjust the order to match MSB to LSB
                // O(k)
                repeated = ("repeated" === type) || ("combination+repeated" === type);
                N = repeated ? n+k-1 : n;
                binom = $ && $.count ? $.count : factorial(N, k);
                index = sub(sub(binom,I),index);
                binom = div(mul(binom,N-k),N);
                t = N-k+1; m = k; p = N-1;
                do {
                    if ( lte(binom, index) )
                    {
                        item[k-m] = repeated ? N-t-k+1 : N-t-m+1;
                        if ( gt(binom, O) )
                        {
                            index = sub(index, binom);
                            binom = div(mul(binom,m),p);
                        }
                        m--; p--;
                    }
                    else
                    {
                        binom = div(mul(binom,p-m),p);
                        t--; p--;
                    }
                } while( m > 0 );
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,complement: function( alpha, n, ordered ) {
            return true === ordered ? shuffle(complement(n, alpha, true)) : complement(n, alpha);
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
        ,pick: function( a, k, type ) {
            return (0 < k) && a.length ? pick(a, k, ("ordered+repeated"!==type)&&("variation+repeated"!==type)&&("repeated+variation"!==type)&&("ordered"!==type)&&("variation"!==type), ("ordered+repeated"===type)||("variation+repeated"===type)||("repeated"===type)||("combination+repeated"===type), new Array(k)) : [];
        }
        ,choose: function( arr, comb ) {
            return comb && comb.length ? array(comb.length, function(i){
                return 0<=comb[i] && comb[i]<arr.length ? arr[comb[i]] : null;
            }) : [];
        }
    }
    ,_update: function( ) {
        var self = this;
        self.item__ = comb_item_(self.__item, self.n[0], self.n[1], self.$.order, self.$.type);
        return self;
    }
});
// aliases
Combination.conjugate = Combination.complement;
Combination.project = Combination.choose;
function comb_item_( item, n, k, order, type )
{
    if ( null == item ) return null;
    var CI = null, i;
    if ( ('ordered' === type) || ('variation' === type) ) for(CI={},i=0; i<k; i++) CI[item[i]] = 1;
    return CI;
}
function next_combination( item, N, dir, type, order, CI )
{
    //maybe "use asm"
    var k = N[1], n = N[0], i, j, index, curr, i0, DI, MIN, MAX, a, b, da, db, inc, repeated;

    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; i0 = MAX;
    a = 1; b = 0;
    da = 1; db = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        a = -a; b = n-1-b;
        DI = -DI; i0 = MAX-i0;
        da = -da; db = MAX-db;
    }
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0;
        da = -da; db = MAX-db;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT) for ordered+repeated (=tuple)
    // constant average delay (CAT) for ordered (or linear if "CI" map is computed at run-time)
    // constant average delay (CAT) for unordered(repated or not) (or linear if "CI" map is computed at run-time)
    if ( 0 > dir )
    {
        // compute prev indexes
        // find index to move
        if ( ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) )
        {
            i = i0;
            while( (MIN<=i && i<=MAX) && (item[i] === 0) ) i-=DI;
            if ( MIN<=i && i<=MAX )
                for(n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else if ( ("ordered" === type) || ("variation" === type) )
        {
            if ( null == CI ) CI = comb_item_(item, n, k, order, type);
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX )
            {
                if ( a*item[i]+b-a >= 0  )
                {
                    for(j=a*item[i]+b-a; 0<=j && j<n; j-=a)
                    {
                        curr = a*j+b;
                        if ( null == CI[curr] )
                        {
                            index = i;
                            CI[curr] = 1;
                            break;
                        }
                    }
                }
                CI[item[i]] = null;
                i-=DI;
            }
            if ( -1 < index )
            {
                item[index] = curr;
                for(j=n-1-b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while( (0<=j && j<n) && (null != CI[curr]) ) { j-=a; curr=a*j+b; }
                    item[i] = curr; CI[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if ( ("combination" === type) || ("unordered" === type) || ("repeated" === type) || ("combination+repeated" === type) )
        {
            repeated = ("repeated" === type) || ("combination+repeated" === type); inc = repeated ? 0 : 1;
            if ( COLEX & order )
            {
                DI = -DI; i0 = MAX-i0; da = -da; db = MAX-db; i = MAX-i0;
                j = 0 > DI ? MIN : MAX;
                if ( (!repeated && item[j]+1>k) || (repeated && item[j]>0) )
                {
                    if ( repeated ) while(MIN<=i && i<=MAX && 0===item[i] ) i+=DI;
                    else while(MIN<=i && i<=MAX && da*i+db===item[i] ) i+=DI;
                    item[i]-=1; i-=DI;
                    // attach rest of low block:
                    while(MIN<=i && i<=MAX) { item[i] = item[i+DI]-inc; i-=DI; }
                }
                else item = null;
            }
            else
            {
                /*if ( null == CI )
                {*/
                    for(index=-1,i=i0; MIN<=i-DI && i-DI<=MAX; i-=DI)
                        if ( item[i]>item[i-DI]+inc ) { index = i; break; }
                /*}
                else
                {
                    index = CI[0];
                }*/
                if (!(MIN<=index && index<=MAX) && 0 < item[0>DI?MAX:MIN]) index = 0>DI?MAX:MIN;
                // adjust next indexes after the moved index
                if ( MIN<=index && index<=MAX )
                {
                    curr = n-1+inc;
                    for (i=i0; MIN<=i && i<=MAX && 0<DI*(i-index); i-=DI)
                    {
                        curr -= inc;
                        item[i] = curr;
                    }
                    item[index]--;
                    //if ( CI ) CI[0] = index+DI;
                }
                else item = null;
            }
        }
    }
    else
    {
        // compute next indexes
        // find index to move
        if ( ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) )
        {
            i = i0;
            while( (MIN<=i && i<=MAX) && (item[i]+1 === n) ) i-=DI;
            if ( MIN<=i && i<=MAX )
                for(item[i]=item[i]+1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else if ( ("ordered" === type) || ("variation" === type) )
        {
            if ( null == CI ) CI = comb_item_(item, n, k, order, type);
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX )
            {
                if ( a*item[i]+b+a < n  )
                {
                    for(j=a*item[i]+b+a; 0<=j && j<n; j+=a)
                    {
                        curr = a*j+b;
                        if ( null == CI[curr] )
                        {
                            index = i;
                            CI[curr] = 1;
                            break;
                        }
                    }
                }
                CI[item[i]] = null;
                i-=DI;
            }
            if ( -1 < index )
            {
                item[index] = curr;
                for(j=b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while( (0<=j && j<n) && (null != CI[curr]) ) { j+=a; curr=a*j+b; }
                    item[i] = curr; CI[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if ( ("combination" === type) || ("unordered" === type) || ("repeated" === type) || ("combination+repeated" === type) )
        {
            repeated = ("repeated" === type) || ("combination+repeated" === type); inc = repeated ? 0 : 1;
            if ( COLEX & order )
            {
                DI = -DI; i0 = MAX-i0; da = -da; db = MAX-db; i = MAX-i0;
                if ( (!repeated && item[i]+k<n) || (repeated && item[i]+1<n) )
                {
                    curr = da*i+db;
                    while(MIN<=i+DI && i+DI<=MAX && item[i]+inc === item[i+DI] )
                    {
                        item[i] = curr; i+=DI; curr += inc;
                    }
                    item[i]+=1;
                }
                else item = null;
            }
            else
            {
                /*if ( null == CI )
                {*/
                    if ( repeated )
                    {
                        for(index=-1,j=n-1,i=i0; MIN<=i && i<=MAX; i-=DI)
                            if ( item[i] < j ) { index = i; break; }
                    }
                    else
                    {
                        for(index=-1,j=n-k,i=i0; MIN<=i && i<=MAX; i-=DI)
                            if ( item[i] < j+da*i+db ) { index = i; break; }
                    }
                /*}
                else
                {
                    index = CI[0];
                }*/
                // adjust next indexes after the moved index
                if ( MIN<=index && index<=MAX )
                {
                    curr = item[index]+1;
                    j = repeated ? n-1 : n-k+da*index+db;
                    if ( curr === j )
                    {
                        item[index] = curr;
                        //if ( CI ) CI[0] = index-DI;
                    }
                    else if ( curr < j )
                    {
                        for(i=index; MIN<=i && i<=MAX; i+=DI) { item[i]=curr; curr+=inc; }
                        //if ( CI ) CI[0] = i0;
                    }
                }
                else item = null;
            }
        }
    }
    return item;
}

// http://en.wikipedia.org/wiki/Power_set
// PowerSet(n) = Combinations(n,0) + Combinations(n,1) + .. + Combinations(n,n-1) + Combinations(n,n)
Subset = Abacus.Powerset = Abacus.Subset = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Subset( n, $ ) {
        var self = this, sub = null;
        if ( !is_instance(self, Subset) ) return new Subset(n, $);
        $ = $ || {}; n = n||0;
        if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.type = $.type || "subset";
        $.rand = $.rand || {};
        $.rand["subset"] = 1;
        $.base = n; $.dimension = n;
        $.mindimension = 0; $.maxdimension = n;
        if ( "binary"===$.output ) $.output = function(item,n){ return Subset.binary(item,n,1); };
        CombinatorialIterator.call(self, "Subset", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.D
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function( item, n, $, dir ) {
            if ( null == item ) return null;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, order, order0 = null;
            if ( $ && "binary"===$.type )
            {
                order = $ && null!=$.order ? $.order : LEX;
                order0 = $.order;
                $.order = REFLECTED & order ? (order & ~REFLECTED) : (order | REFLECTED);
            }
            item = CombinatorialIterator.DUAL.call(klass, item, n, $, dir);
            if ( $ && null!=order0 ) $.order = order0;
            return item;
        }
        ,count: function( n, $ ) {
             return pow2(n);
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, order = $ && null!=$.order ? $.order : LEX;
            dir = -1 === dir ? -1 : 1;
            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;

            // O(n)
            // fixed-length item, with effective length as extra last pos
            item = new Array(n+1); item[n] = 0;
            if ( $ && "binary" === $.type )
            {
                //item = 0 > dir ? array(n, 0, 1) : [];
                if ( 0>dir ) operate(function(_,i){item[i]=i;}, null, null, 0, n, 1);
            }
            else
            {
                if ( 0>dir ) { item[0] = n-1; item[n] = 1; }
            }

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,succ: function( item, index, n, $, dir, SI ) {
            if ( null == item ) return null;
            return $ && "binary" === $.type ? CombinatorialIterator.succ.call(this, item, index, n, $, dir) : next_subset( item, n, -1 === dir ? -1 : 1, $ && null!=$.order?$.order:LEX );
        }
        ,rand: function( n, $ ) {
            var klass = this, rndInt = Abacus.Math.rndInt, item;
            // p ~ 1 / 2^n, O(n)
            for(var list = null,i=n-1; i>=0; i--) if ( rndInt(0,1) )
                list = {len:list?list.len+1:1, k:i, next:list};
            item = list ? array(list.len, function(i){var k = list.k; list = list.next; return k;}): [];

            // fixed-length item, with effective length as extra last pos
            //if ( !$ || "binary" !== $.type )
            item = item.concat(item.length<n?new Array(n-item.length):[]).concat(item.length);

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                add = Arithmetic.add, shl = Arithmetic.shl,
                sub = Arithmetic.sub,
                order = $ && null!=$.order ? $.order : LEX,
                index, i, l;

            if ( !$ || "binary"!==$.type ) return NotImplemented();

            item = klass.DUAL(item, n, $, -1);

            // O(n)
            index = O; i = 0; l = item[n]/*.length*/;
            while( i < l ) index = add(index, shl(I, item[i++]));

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);

            return index;
        }
        ,unrank: function( index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                band = Arithmetic.band, shr = Arithmetic.shr, gt = Arithmetic.gt,
                sub = Arithmetic.sub,
                order = $ && null!=$.order ? $.order : LEX,
                item, i;

            if ( null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)) )
                return null;

            if ( !$ || "binary"!==$.type ) return NotImplemented();

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(count,Arithmetic.I), index);

            // O(n)
            item = new Array(n+1)/*[]*/; item[n] = 0; i = 0;
            while( gt(index, O) )
            {
                // loop unrolling
                if ( gt(band(index,1),O) ) item[item[n]++] = i;//item.push( i );
                if ( gt(band(index,2),O) ) item[item[n]++] = i+1;//item.push( i+1 );
                if ( gt(band(index,4),O) ) item[item[n]++] = i+2;//item.push( i+2 );
                if ( gt(band(index,8),O) ) item[item[n]++] = i+3;//item.push( i+3 );
                if ( gt(band(index,16),O) ) item[item[n]++] = i+4;//item.push( i+4 );
                if ( gt(band(index,32),O) ) item[item[n]++] = i+5;//item.push( i+5 );
                if ( gt(band(index,64),O) ) item[item[n]++] = i+6;//item.push( i+6 );
                if ( gt(band(index,128),O) ) item[item[n]++] = i+7;//item.push( i+7 );
                i+=8; index = shr(index, 8);
            }

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
    }

    ,output: function( item ) {
        if ( null == item ) return null;
        var n = this.n;
        if ( n+1===item.length )
        {
            var $ = this.$, order = $.order || LEX, is_binary = "binary"===$.type,
                is_reflected = ((COLEX&order) && !(REFLECTED&order)) || ((REFLECTED&order) && !(COLEX&order));
            item = (is_binary && !is_reflected) || (is_reflected && !is_binary) ? item.slice(n-item[n],n) : item.slice(0,item[n]);
        }
        return CombinatorialIterator[PROTO].output.call(this, item);
    }
});
function next_subset( item, N, dir, order )
{
    //maybe "use asm"
    var LEN = N, MIN = 0, MAX = N-1, IMIN, IMAX, t, DI, i0, i1, a, b;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    DI = 1; a = 1; b = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        /*
        a = -a; b = MAX-b;
        DI = -DI;
        //dir = -dir;
        */
        return null;
    }
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if ( 0 > DI )
    {
        IMIN = N-(item[LEN]||1); IMAX = N-1;
        i0 = IMAX; i1 = IMIN;
    }
    else
    {
        IMIN = 0; IMAX = item[LEN]-1;
        i0 = IMIN; i1 = IMAX;
    }

    // loopless, item is of fixed dimensions n+1, with effective length item[LEN] as extra last pos (ie N)
    // NOTE: effective item = item.slice(0,item[LEN]) or item.slice(N-item[LEN],N) if reflected
    if ( 0 > dir )
    {
        // NOTE: colex+reversed does not work
        if ( 0 < item[LEN] )
        {
            t = item[i1];
            if ( t > MIN )
            {
                if ( 1 === item[LEN] || t>item[i1-DI]+1 )
                {
                    // extend
                    item[i1] -= 1; item[i1+DI] = MAX;
                    item[LEN]++;
                }
                else
                {
                    // reduce
                    item[LEN]--;
                }
            }
            else
            {
                // empty
                item[LEN] = 0;
            }
        }
        else item = null;
    }
    else
    {
        // adapted from "Generating All and Random Instances of a Combinatorial Object", Ivan Stojmenovic (http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576)
        if ( 0 === item[LEN] )
        {
            // empty
            item[IMIN] = a*MIN+b; item[LEN] = 1;
        }
        else if ( a*item[i0]+b < MAX )
        {
            if ( a*item[i1]+b < MAX )
            {
                // extend
                item[i1+DI] = item[i1]+a; item[LEN]++;
            }
            else
            {
                // reduce
                item[i1-DI] += a; item[LEN]--;
            }
        }
        // last
        else item = null;
    }
    return item;
}

// https://en.wikipedia.org/wiki/Partitions
// https://en.wikipedia.org/wiki/Composition_(combinatorics)
// integer compositions (resp. restricted k-compositions) have bijections ("isomorphisms") to subsets (resp. k-subsets=combinations)
// via "partial-sums mapping": x_1=y_1,..,x_k=y_k-y_{k-1},..,x_m (composition) ::=> y_1=x_1,..,y_k=y_{k-1}+x_k,..,y_m (subset)
Partition = Abacus.Partition = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Partition( n, $ ) {
        var self = this, sub = null, M, K, k1, k0;
        if ( !is_instance(self, Partition) ) return new Partition(n, $);
        $ = $ || {}; $.type = $.type || "partition";
        n = n||1;
        if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        M = $["max="] ? $["max="]|0 : null;
        K = $["parts="] ? $["parts="]|0 : null;
        k1 = K ? K : (M ? n-M+1 : n);
        k0 = K ? K : (M ? stdMath.ceil(n/M) : 1);
        $.base = n;
        $.dimension = K ? K : (M ? n-M+1 : n);
        $.mindimension = stdMath.min(k0,k1);
        $.maxdimension = stdMath.max(k0,k1);
        $.rand = $.rand || {};
        $.rand["partition"] = 1; $.rand["composition"] = 1;
        if ( "conjugate"===$.output ) $.output = function(item,n){
            return conjugatepartition(0, item, (REFLECTED&$.order)&&!(COLEX&$.order) || (COLEX&$.order)&&!(REFLECTED&$.order) ? -1 : 1);
        };
        else if ( "subset"===$.output ) $.output = function(item,n){ return Partition.subset(item,1); };
        else if ( "packed"===$.output ) $.output = function(item,n){ return Partition.pack(item,1); };
        CombinatorialIterator.call(self, "Partition", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: function( item, N, LEN, $, dir ) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var klass = this, is_composition = "composition" === ($ && $.type ? $.type : "partition"),
                M = $ && $["max="] ? $["max="]|0 : null, K = $ && $["parts="] ? $["parts="]|0 : null, reflected = -1===dir, itemlen;
            if ( K || M ) return item;
            if ( LEN+1===item.length )
            {
                item = reflected ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
                item = conjugatepartition(is_composition, item, dir);
                itemlen = item.length;
                if ( itemlen<LEN ) item[reflected?"unshift":"push"].apply(item, new Array(LEN-itemlen));
                item.push([itemlen,0]);
            }
            else
            {
                item = conjugatepartition(is_composition, item, dir);
            }
            return item;
         }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function( item, n, $, dir ) {
            if ( null == item ) return null;
            var klass = this, type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX, order0 = null;
            if ( /*("composition"!==type) &&*/ (COLEX&order) )
            {
                order0 = $.order;
                $.order = REFLECTED & order ? (order & ~REFLECTED) : (order | REFLECTED);
            }
            item = CombinatorialIterator.DUAL.call(klass, item, n, $, dir);
            if ( $ && null!=order0 ) $.order = order0;
            return item;
        }
        ,count: function( n, $ ) {
            var M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                type = $ && $.type ? $.type : "partition";
            return "composition"===type ? compositions(n, K, M) : partitions(n, K, M);
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var klass = this, item, k, m,
                type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                order = $ && null!=$.order ? $.order : LEX,
                LEN = K ? K : (M ? n-M+1 : n),
                is_composition = "composition" === type, conj = false;

            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;

            dir = -1 === dir ? -1 : 1;

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;

            // O(n)
            item = new Array(LEN+1); item[LEN] = [0,0];
            if ( K && M )
            {
                item[LEN][0] = K;
                // restricted partition n into exactly K parts with largest part=M
                // equivalent to partition n-M into K-1 parts with largest part<=M
                if ( 1 === K )
                {
                    item[0] = M;
                    item[LEN][1] = 1;
                }
                if ( is_composition )
                {
                    m = n;
                    item = operate(function(item,ai,i){
                        var index = K-1-i;
                        item[index] = stdMath.min(M, m-index);
                        m -= item[index];
                        if ( M === item[index] ) item[LEN][1]++;
                        return item;
                    }, item, null, 0,K-1,1);
                    if ( 0 > dir ) reflection(item,item,K,0,K-1);
                }
                else if ( 0 > dir )
                {
                    m = n;
                    item = operate(function(item,ai,i){
                        item[i] = stdMath.min(M, m-(K-i-1));
                        if ( M === item[i] ) item[LEN][1]++;
                        m -= item[i];
                        return item;
                    }, item, null, 0,K-1,1);
                }
                else
                {
                    m = stdMath.min(M, stdMath.floor((n-M)/(K-1))); k = (n-M)%(K-1);
                    item = operate(function(item,ai,i){
                        item[i] = 0===i ? M : (i-1<k?m+1:m);
                        if ( M === item[i] ) item[LEN][1]++;
                        return item;
                    }, item, null, 0,K-1,1);
                }
            }
            else
            {
                if ( K )
                {
                    item[LEN][0] = K;
                    // restricted partition n to exactly K parts
                    // equivalent to conjugate to partition n into parts with largest part=K
                    if ( is_composition )
                    {
                        item = operate(function(item,ai,i){
                            item[i] = i+1<K ? 1 : n-K+1;
                            return item;
                        }, item, null, 0,K-1,1/*array(K-1, 1, 0).concat([n-K+1])*/);
                        if ( 0 > dir ) reflection(item,item,K,0,K-1);
                    }
                    else
                    {
                        m = stdMath.floor(n/K); k = n%K;
                        item = operate(function(item,ai,i){
                            item[i] = 0 > dir ? (0===i ? n-K+1 : 1) : (m+(i<k));
                            return item;
                        }, item, null, 0,K-1,1/*0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K, function(i){return m+(i<k);})*/);
                    }
                }
                else if ( M )
                {
                    // restricted partition n into parts with largest part=M
                    // equivalent to conjugate to partition n into exactly M parts
                    k = stdMath.floor(n/M); m = n%M;
                    if ( is_composition )
                    {
                        item = operate(function(item,ai,i){
                            item[i] = ai; item[LEN][0]++;
                            if ( M === item[i] ) item[LEN][1]++;
                            return item;
                        }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : array(n-M, 1, 0).concat([M]));
                    }
                    else
                    {
                        item = operate(function(item,ai,i){
                            item[i] = ai; item[LEN][0]++;
                            if ( M === item[i] ) item[LEN][1]++;
                            return item;
                        }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0)));
                    }
                }
                else
                {
                    // unrestricted partition/composition
                    item = operate(function(item,ai,i){
                        item[i] = ai; item[LEN][0]++; return item;
                    }, item, 0 > dir ? [n] : array(n, 1, 0));
                }
            }

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,succ: function( item, index, n, $, dir, PI ) {
            if ( (null == n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            dir = -1 === dir ? -1 : 1;
            return "composition"===type ? next_composition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, PI) : next_partition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, PI);
        }
        ,rand: function( n, $ ) {
            var klass = this, rndInt = Abacus.Math.rndInt,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && $["max="] ? $["max="]|0 : null, MM = M,
                K = $ && $["parts="] ? $["parts="]|0 : null, KK = K,
                list, item, m, x, y, y1 = 0, yn = 0,
                itemlen, LEN = K ? K : (M ? n-M+1 : n),
                is_composition = "composition" === type, conj = false;

            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;

            do{
                K = KK; M = MM; conj = false;
                if ( M && K ) K = null;
                if ( M && !K ) { K=M; M=null; conj=true; }

                // generate random (k-)composition (resp. diff of (k-)subset)
                // transform to partition (resp. composition) by sorting (resp. shuffling)
                // partition is a sorted composition, composition is a shuffled partition
                if ( K )
                {
                    // random k-composition ~ diff of k-subset
                    if ( 1 === K )
                    {
                        item = [n]; yn = n;
                    }
                    else if ( n === K )
                    {
                        item = array(K,1,0); yn = n;
                    }
                    else
                    {
                        list = {}; m = n-2;
                        item = mergesort(array(K-1, function(){
                            // select uniformly without repetition
                            y = rndInt(0, m);
                            // this is NOT an O(1) look-up operation, in general
                            while( 1 === list[y] ) y = (y+1)%(m+1);
                            list[y] = 1;
                            return y+1;
                        }));
                        array(item, function(i){
                            y = item[i]; x = y-y1;
                            y1 = y; yn += x;
                            return x;
                        });
                    }
                }
                else
                {
                    // random composition ~ diff of subset
                    for(list=null,y=1; y<n; y++) if ( rndInt(0,1) ) {
                        x = y-y1; y1 = y; yn += x;
                        list = {len:list?list.len+1:1, x:x, next:list};
                    }
                    item = list ? array(list.len, function(){x = list.x; list = list.next; return x;}) : [];
                }
                if ( yn < n )
                {
                    if ( item.length ) item.splice(rndInt(0,item.length-1), 0, n-yn);
                    else item.push(n-yn);
                }
                if ( is_composition )
                {
                    // get random conjugate
                    if ( conj ) item = shuffle(conjugatepartition(0,mergesort(item,-1)));
                }
                else
                {
                    // sort it to get associated partition, p ~ 1 / P(n), O(nlgn)
                    item = mergesort(item,-1);
                    // get conjugate
                    if ( conj ) item = conjugatepartition(0,item);
                }
                // for both K & M do trial and rejection until done
            }while(KK && MM && item.length!==KK);

            itemlen = item.length;
            if ( MM )
            {
                for(x=0,y=0; x<itemlen; x++)
                    if ( MM === item[x] ) y++;
            }
            else
            {
                y = 0;
            }
            if ( itemlen<LEN ) item.push.apply(item, new Array(LEN-itemlen));
            item.push([itemlen, y]);

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            // IN PROGRESS !!!
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                index = Arithmetic.O, x, j, i, total;

            if ( REFLECTED & order ) item = item.slice().reverse();

            if ( "composition" === type )
            {
                if ( K )
                {
                    if ( M )
                    {
                        //NotImplemented();
                    }
                    else
                    {
                        while( 1<K && 0<n )
                        {
                            x = item[K-1];
                            for(j=1; j<x; j++) index = Arithmetic.add(index, compositions(n-j, K-1));
                            K--; n-=x;
                        }
                    }
                }
                else
                {
                    K = item.length;
                    if ( M )
                    {
                        //NotImplemented();
                    }
                    else
                    {
                        while( 1<=K && 0<n )
                        {
                            x = item[K-1];
                            for(j=1; j<x; j++) index = Arithmetic.add(index, compositions(n-j));
                            K--; n-=x;
                        }
                    }
                }
            }
            else
            {
                if ( K )
                {
                    if ( M )
                    {
                        //NotImplemented();
                    }
                    else
                    {
                        while( 1<K && 0<n )
                        {
                            x = item[K-1];
                            for(j=1; j<x; j++) index = Arithmetic.add(index, partitions(n-j, K-1));
                            K--; n-=x;
                        }
                    }
                }
                else
                {
                    K = item.length;
                    if ( M )
                    {
                        //NotImplemented();
                    }
                    else
                    {
                        while( 1<=K && 0<n )
                        {
                            x = item[K-1];
                            for(j=1; j<x; j++) index = Arithmetic.add(index, partitions(n-j));
                            K--; n-=x;
                        }
                    }
                }
            }
            if ( REVERSED & order )
            {
                total = $ && null!=$.count ? $.count : klass.count(n, {type:type,"max=":M,"parts=":K});
                index = Arithmetic.sub(Arithmetic.sub(total, 1), index);
            }
            return index;
        }
        ,unrank: NotImplemented
        ,conjugate: function( item, type ) {
            return conjugatepartition("composition"===type, item);
        }
        ,subset: function( item, dir ) {
            return -1 === dir ? subset2composition(item) : composition2subset(item);
        }
        ,pack: function( item, dir ) {
            return -1 === dir ? unpackpartition(item) : packpartition(item)
        }
    }
    ,_update: function( ) {
        var self = this, $ = self.$, n = self.n, item = self.__item,
            type = $ && $.type ? $.type : "partition",
            order = $ && null!=$.order ? $.order : LEX,
            M = $ && $["max="] ? $["max="]|0 : null,
            K = $ && $["parts="] ? $["parts="]|0 : null,
            LEN = K ? K : (M ? n-M+1 : n), itemlen, x, y;
        if ( (null != item) && (LEN+1 !== item.length) )
        {
            itemlen = item.length;
            if ( M )
            {
                for(x=0,y=0; x<itemlen; x++)
                    if ( M === item[x] ) y++;
            }
            else
            {
                y = 0;
            }
            if ( itemlen<LEN )
            {
                if ( REFLECTED & order ) item.unshift.apply(item, new Array(LEN-itemlen));
                else item.push.apply(item, new Array(LEN-itemlen));
            }
            item.push([itemlen, y]);
            self.__item = item;
        }
        return self;
    }
    ,output: function( item ) {
        if ( null == item ) return null;
        var self = this, $ = self.$, n = self.n, M = $["max="] ? $["max="]|0 : null,
            K = $["parts="] ? $["parts="]|0 : null,
            order = null!=$.order ? $.order : LEX,
            LEN = K ? K : (M ? n-M+1 : n);
        if ( LEN+1===item.length )
        {
            item = REFLECTED & order ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
});
// aliases
Partition.transpose = Partition.conjugate;
function next_partition( item, N, dir, K, M, order, PI )
{
    //maybe "use asm"
    var n = N, LN = K ? K : (M ? n-M+1 : n),
        INFO = LN, LEN = 0, NMAX = 1,
        i, j, i0, i1, k, m, d, l, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    DI = 1;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if ( 0 > DI )
    {
        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[INFO][LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if ( COLEX & order )
    {
        return null; // not implemented
    }

    if ( 0 > dir )
    {
        // compute prev partition
        if ( K )
        {
            if ( M )
            {
                rem = n-M; m = rem % (K-1); d = stdMath.min(M, stdMath.floor(rem/(K-1))); k = 0; i = -1;
                for(j=i0+DI; MIN<j && j<=MAX; j+=DI)
                {
                    if ( d+(k<m)<item[j] || stdMath.floor(rem/(K-1-k))+(0<(rem%(K-1-k)))<item[j] ) i = j;
                    k++; rem -= item[j];
                }
                if ( -1 === i || MAX < i+DI || MIN > i+DI )
                {
                    item = null;
                }
                else
                {
                    if ( M===item[i] ) item[INFO][NMAX]--;
                    item[i]--; i += DI;
                    rem = 1; k = 0; j = i;
                    while(MIN<j && j<=MAX) {k++; rem += item[j]; j += DI;}
                    while(MIN<i && i<=MAX)
                    {
                        k--;
                        if ( M===item[i] ) item[INFO][NMAX]--;
                        item[i] = stdMath.min(MIN<=i-DI&&i-DI<=MAX?item[i-DI]:n, stdMath.max(1, rem-k));
                        rem -= item[i];
                        if ( M===item[i] ) item[INFO][NMAX]++;
                        i += DI;
                    }
                }
            }
            else
            {
                rem = n; m = rem % K; d = stdMath.floor(rem/K); k = 0; i = -1;
                for(j=i0; MIN<=j && j<=MAX; j+=DI)
                {
                    if ( d+(k<m)<item[j] || stdMath.floor(rem/(K-k))+(0<(rem%(K-k)))<item[j] ) i = j;
                    k++; rem -= item[j];
                }
                if ( -1 === i || MAX < i+DI || MIN > i+DI )
                {
                    item = null;
                }
                else
                {
                    item[i]--; i += DI;
                    rem = 1; k = 0; j = i;
                    while(MIN<=j && j<=MAX) {k++; rem += item[j]; j += DI;}
                    while(MIN<=i && i<=MAX) {k--; item[i] = stdMath.min(MIN<=i-DI&&i-DI<=MAX?item[i-DI]:n, stdMath.max(1, rem-k)); rem -= item[i]; i += DI;}
                }
            }
        }
        else
        {
            j = M ? i0+DI : i0;
            if ( (MIN<=j && j<=MAX) && (item[j] > 1) )
            {
                i = i1; rem = 0; l = 0;
                while((MIN<=i && i<=MAX) && (DI*(i-j) >= 0) && (1 === item[i]))
                {
                    rem+=item[i];
                    if ( M && M===item[i] ) l++;
                    i-=DI;
                }
                if ( M && M===item[i] ) item[INFO][NMAX]--;
                m = item[i]-1; rem++; item[i] = m;
                item[INFO][LEN] = 0 > DI ? LN-i : i+1;
                item[INFO][NMAX] -= l;
                if ( m < rem )
                {
                    j = rem%m;
                    rem = stdMath.floor(rem/m);
                    while(0<rem--)
                    {
                        i+=DI;
                        item[i] = m;
                        item[INFO][LEN]++;
                        if ( M && M===item[i] ) item[INFO][NMAX]++;
                    }
                    if ( 0<j )
                    {
                        i+=DI;
                        item[i] = j;
                        item[INFO][LEN]++;
                        if ( M && M===item[i] ) item[INFO][NMAX]++;
                    }
                }
                else if ( 0 < rem )
                {
                    i+=DI;
                    item[i] = rem;
                    item[INFO][LEN]++;
                    if ( M && M===item[i] ) item[INFO][NMAX]++;
                }
            }
            // if partition is all ones (so first element is also one) it is the final partition
            //else last item
            else item = null;
        }
    }
    else
    {
        // compute next partition
        if ( K )
        {
            if ( M )
            {
                i = i1;
                while(MIN<=i && i<=MAX && 1===item[i]) i -= DI;
                if ( i<MIN || i>MAX )
                {
                    item = null;
                }
                else
                {
                    if ( M===item[i] ) item[INFO][NMAX]--;
                    item[i]--; i -= DI;
                    if ( i<MIN || i>MAX )
                    {
                        item = null;
                    }
                    else
                    {
                        while(MIN<=i && i<=MAX && (M<item[i]+1 || (MIN<=i-DI && i-DI<=MAX && item[i-DI]<item[i]+1))) i -= DI;
                        if ( i<MIN || i>MAX )
                        {
                            item = null;
                        }
                        else
                        {
                            item[i]++; rem = 0; k = 0; j = i+DI;
                            if ( M===item[i] ) item[INFO][NMAX]++;
                            while(MIN<=j && j<=MAX) {k++; rem += item[j]; j += DI;}
                            m = rem % k; d = stdMath.floor(rem/k); j = 0; i = i+DI;
                            while(MIN<=i && i<=MAX)
                            {
                                if ( M===item[i] ) item[INFO][NMAX]--;
                                item[i] = d+(j<m);
                                if ( M===item[i] ) item[INFO][NMAX]++;
                                j++;
                                i += DI;
                            }
                        }
                    }
                }
            }
            else
            {
                i = i1;
                while(MIN<=i && i<=MAX && 1===item[i]) i -= DI;
                if ( i<MIN || i>MAX )
                {
                    item = null;
                }
                else
                {
                    item[i]--; i -= DI;
                    if ( i<MIN || i>MAX )
                    {
                        item = null;
                    }
                    else
                    {
                        while(MIN<=i && i<=MAX && MIN<=i-DI && i-DI<=MAX && item[i-DI]<item[i]+1) i -= DI;
                        if ( i<MIN || i>MAX )
                        {
                            item = null;
                        }
                        else
                        {
                            item[i]++; rem = 0; k = 0; j = i+DI;
                            while(MIN<=j && j<=MAX) {k++; rem += item[j]; j += DI;}
                            m = rem % k; d = stdMath.floor(rem/k); j = 0; i = i+DI;
                            while(MIN<=i && i<=MAX) {item[i] = j<m ? d+1 : d; j++; i += DI;}
                        }
                    }
                }
            }
        }
        else
        {
            if ( M )
            {
                m = stdMath.min(M,n-M);
                k = stdMath.floor(n/M)+(n%M?1:0)-1;
                m = /*MAX*/item[INFO][LEN]-1 > k || item[i0+(k-1)*DI] < m;
                j = i0+DI;
            }
            else
            {
                m = item[i0] < n;
                j = i0;
            }
            if ( MIN<=j && j<=MAX && m )
            {
                if ( 0 < MAX )
                {
                    i = i1-DI;
                    rem = item[i1];
                }
                else
                {
                    i = i1;
                    rem = 0;
                }
                l = 0;
                while((MIN<=i && i<=MAX) && (MIN<=i-DI && i-DI<=MAX) && (DI*(i-j) > 0) && (item[i] === item[i-DI]))
                {
                    rem+=item[i];
                    if ( M && M===item[i] ) l++;
                    i-=DI;
                }
                item[i]++; rem--;
                item[INFO][LEN] = 0 > DI ? LN-i : i+1;
                item[INFO][NMAX] -= l;
                if ( M && M===item[i] ) item[INFO][NMAX]++;
                while(0<rem--)
                {
                    i+=DI;
                    item[i] = 1;
                    item[INFO][LEN]++;
                    if ( M && M===item[i] ) item[INFO][NMAX]++;
                }
            }
            // if partition is the number itself it is the final partition
            //else last item
            else item = null;
        }
    }
    return item;
}
function next_composition( item, N, dir, K, M, order, PI )
{
    //maybe "use asm"
    var n = N, LN = K ? K : (M ? n-M+1 : n),
        INFO = LN, LEN = 0, NMAX = 1,
        i, j, i0, i1, k, m, d, l, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    DI = 1;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if ( 0 > DI )
    {
        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[INFO][LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if ( 0 > dir )
    {
        // compute prev composition
        if ( K )
        {
            if ( M )
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    i = i1-DI; j = i1; d = item[i1]-1; rem = item[i1]; k = 1;
                    while(MIN<=i && i<=MAX && (1===item[i] || M<item[j]+1)) {rem+=item[i]; k++; j = i; i-=DI;}
                    if ( MIN>i || i>MAX )
                    {
                        item = null;
                    }
                    else
                    {
                        if ( 0<d )
                        {
                            if ( 1===item[INFO][NMAX] && M===item[i] && M>rem-(k-1)+1 )
                            {
                                item[i] = stdMath.max(item[j], item[i1]); rem+=M-item[i];
                                if ( M!==item[i] ) item[INFO][NMAX]--;
                            }
                            else
                            {
                                if ( M===item[i] ) item[INFO][NMAX]--;
                                item[i]--; rem++;
                            }
                            l = 0;
                            while(0<rem && MIN<=j && j<=MAX)
                            {
                                if ( M===item[j] ) item[INFO][NMAX]--;
                                item[j] = stdMath.min(M, rem-(k-l-1));
                                rem -= item[j];
                                if ( M===item[j] ) item[INFO][NMAX]++;
                                j += DI; l++;
                            }
                        }
                        else
                        {
                            if ( 1===item[INFO][NMAX] && M===item[i] && M>item[j]+1 )
                            {
                                item[i] = item[j]; item[j] = M;
                            }
                            else
                            {
                                if ( M===item[i] ) item[INFO][NMAX]--;
                                item[i]--; item[j]++;
                                if ( M===item[j] ) item[INFO][NMAX]++;
                            }
                        }
                    }
                }
            }
            else
            {
                // adapted from FXT lib
                if ( COLEX & order )
                {
                    m = item[i0];
                    if ( n-K+1>m )
                    {
                        item[i0] = 1; i = i0+DI;
                        while(MIN<=i && i<=MAX && 1===item[i]) i+=DI;
                        item[i]--;
                        if ( MIN<=i-DI && i-DI<=MAX ) item[i-DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    m = item[i1];
                    if ( n-K+1>m )
                    {
                        item[i1] = 1; i = i1;
                        while(MIN<=i && i<=MAX && 1===item[i]) i-=DI;
                        item[i]--;
                        if ( MIN<=i+DI && i+DI<=MAX ) item[i+DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if ( COLEX & order )
            {
                item = null;
            }
            else if ( M )
            {
                rem = 0; i = i1; k = item[INFO][LEN]; l = 0;
                while(MIN<=i && i<=MAX && 1===item[i])
                {
                    if ( M===item[i] ) l++;
                    i -= DI;
                    rem++;
                    k--;
                }
                if ( i<MIN || i>MAX )
                {
                    item = null;
                }
                else
                {
                    if ( 1===item[INFO][NMAX] && M===item[i] )
                    {
                        if ( n===M )
                        {
                            item = null;
                        }
                        else if ( M<=rem+1 )
                        {
                            if ( M===item[i] ) item[INFO][NMAX]--;
                            item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                            while(0<rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                item[INFO][LEN]++;
                                if ( M===item[i] ) item[INFO][NMAX]++;
                                rem -= item[i];
                            }
                        }
                        else if ( M<item[i]+rem )
                        {
                            if ( M===item[i] ) item[INFO][NMAX]--;
                            item[i]-=M-rem; rem=M; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                            while(0<rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                item[INFO][LEN]++;
                                if ( M===item[i] ) item[INFO][NMAX]++;
                                rem -= item[i];
                            }
                        }
                        else
                        {
                            if ( M===item[i] ) l++;
                            rem+=item[i]; i-=DI; k--;
                            while(MIN<=i && i<=MAX && 1===item[i])
                            {
                                if ( M===item[i] ) l++;
                                i-=DI;
                                rem++;
                                k--;
                            }
                            if ( i<MIN || i>MAX )
                            {
                                item = null;
                            }
                            else
                            {
                                if ( M===item[i] ) item[INFO][NMAX]--;
                                item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                                while(0<rem)
                                {
                                    i += DI;
                                    item[i] = stdMath.min(M, rem);
                                    item[INFO][LEN]++;
                                    if ( M===item[i] ) item[INFO][NMAX]++;
                                    rem -= item[i];
                                }
                            }
                        }
                    }
                    else
                    {
                        if ( M===item[i] ) item[INFO][NMAX]--;
                        item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                        while(0<rem)
                        {
                            i += DI;
                            item[i] = stdMath.min(M, rem);
                            item[INFO][LEN]++;
                            if ( M===item[i] ) item[INFO][NMAX]++;
                            rem -= item[i];
                        }
                    }
                }
            }
            else
            {
                if ( n>item[INFO][LEN] )
                {
                    i = i1; rem = 0;
                    while(MIN<=i && i<=MAX && 1===item[i]) {i-=DI; rem++;}
                    m = item[i]-1; item[i] = m; rem++;
                    if ( 0<rem )
                    {
                        if ( MIN<=i+DI && i+DI<=MAX )
                        {
                            i+=DI; item[i]=rem; rem=0;
                            item[INFO][LEN] = 0 > DI ? LN-i : i+1;
                        }
                        else
                        {
                            while(0<rem--) {i+=DI; item[i] = 1; item[INFO][LEN]++;}
                        }
                    }
                }
                // last
                else item = null;
            }
        }
    }
    else
    {
        // compute next composition
        if ( K )
        {
            if ( M )
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    i = i1-DI; j = i1; d = M-item[i1]; rem = item[i1]; k = 1;
                    while(MIN<=i && i<=MAX && (M<item[i]+1 || 1===item[j])) {rem+=item[i]; k++; j = i; i-=DI;}
                    if ( MIN>i || i>MAX )
                    {
                        item = null;
                    }
                    else
                    {
                        if ( 0<d )
                        {
                            if ( 1===item[INFO][NMAX] && M===item[j] && M>item[i]+1 && M>rem-(k-1)-1 )
                            {
                                item[j] = item[i]; item[i] = M; rem-=M-item[j];
                            }
                            else
                            {
                                item[i]++; rem--;
                                if ( M===item[i] ) item[INFO][NMAX]++;
                            }
                            l = 0; i = i1;
                            while(0<rem && MIN<=i && i<=MAX)
                            {
                                if ( M===item[i] ) item[INFO][NMAX]--;
                                item[i] = stdMath.min(M, rem-(k-l-1));
                                if ( M===item[i] ) item[INFO][NMAX]++;
                                rem -= item[i];
                                i -= DI; l++;
                            }
                        }
                        else
                        {
                            if ( 1===item[INFO][NMAX] && M===item[j] && M>item[i]+1 )
                            {
                                item[j] = item[i]; item[i] = M;
                            }
                            else
                            {
                                if ( M===item[j] ) item[INFO][NMAX]--;
                                item[i]++; item[j]--;
                                if ( M===item[i] ) item[INFO][NMAX]++;
                            }
                        }
                    }
                }
            }
            else
            {
                // adapted from FXT lib
                if ( COLEX & order )
                {
                    if ( n-K+1>item[i1] )
                    {
                        i = i0;
                        while(MIN<=i && i<=MAX && 1===item[i]) i+=DI;
                        m = item[i]; item[i] = 1; item[i0] = m-1;
                        if ( MIN<=i+DI && i+DI<=MAX ) item[i+DI]++;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    if ( n-K+1>item[i0] )
                    {
                        i = i1;
                        while(MIN<=i && i<=MAX && 1===item[i]) i-=DI;
                        m = item[i]; item[i] = 1; item[i1] = m-1;
                        if ( MIN<=i-DI && i-DI<=MAX ) item[i-DI]++;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if ( COLEX & order )
            {
                item = null;
            }
            else if ( M )
            {
                rem = item[i1]; i = i1-DI; k = item[INFO][LEN]-1;
                if ( 1===item[INFO][NMAX] && rem===M )
                {
                    if ( n===M )
                    {
                        item = null;
                    }
                    else
                    {
                        rem += item[i]-M; item[i] = M; item[INFO][LEN]--;
                        while(0<rem--)
                        {
                            i+=DI;
                            item[i] = 1;
                            item[INFO][LEN]++;
                            if ( M===item[i] ) item[INFO][NMAX]++;
                        }
                    }
                }
                else
                {
                    l = M===rem ? 1 : 0; m = 0;
                    while(MIN<=i && i<=MAX && M<item[i]+1)
                    {
                        /*if ( M===item[i] )*/ l++;
                        m += item[i];
                        i -= DI;
                        k--;
                    }
                    if ( MIN>i || MAX<i )
                    {
                        item = null;
                    }
                    else
                    {
                        item[i]++; rem--; j = i;
                        if ( M===item[i] ) item[INFO][NMAX]++;
                        /*for(i=i+DI; MIN<=i && i<=MAX; i+=DI)
                        {
                            rem += item[i];
                        }
                        rem -= item[i1];*/
                        rem += m;
                        item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                        m = item[INFO][NMAX];
                        if ( !m ) rem -= M;
                        while(0<rem--)
                        {
                            j+=DI;
                            item[j] = 1;
                            item[INFO][LEN]++;
                            if ( M===item[j] ) item[INFO][NMAX]++;
                        }
                        if ( !m )
                        {
                            item[j+DI] = M;
                            item[INFO][LEN]++;
                            item[INFO][NMAX]++;
                        }
                    }
                }
            }
            else
            {
                if ( n>item[i0] )
                {
                    rem = item[i1]; item[i1-DI]++;
                    item[INFO][LEN]--; i = i1-DI; rem--;
                    while(0<rem--) {i+=DI; item[i] = 1; item[INFO][LEN]++;}
                }
                // last
                else item = null;
            }
        }
    }
    return item;
}

// https://en.wikipedia.org/wiki/Partition_of_a_set
// https://en.wikipedia.org/wiki/Bell_number
SetPartition = Abacus.SetPartition = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function SetPartition( n, $ ) {
        var self = this, sub = null, K;
        if ( !is_instance(self, SetPartition) ) return new SetPartition(n, $);
        $ = $ || {}; $.type = "partition";
        n = n||1;
        if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        K = $["parts="] ? $["parts="]|0 : null;
        $.base = n;
        $.dimension = K ? K : n;
        $.mindimension = K ? K : 1;
        $.maxdimension = K ? K : n;
        $.rand = $.rand || {}; $.rand["partition"] = 1;
        CombinatorialIterator.call(self, "SetPartition", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function( item, n, $, dir ) {
            return item;
        }
        ,count: function( n, $ ) {
            var K = $ && $["parts="] ? $["parts="]|0 : null;
            return 0<n ? (K ? stirling(n, K, 2) : bell(n)) : Abacus.Arithmetic.O;
        }
        ,initial: function( n, $, dir ) {
            var klass = this, item, order = $ && null!=$.order ? $.order : LEX,
                K = $ && $["parts="] ? $["parts="]|0 : null;

            if ( (0 >= n) || ( K && K > n) ) return null;

            dir = -1 === dir ? -1 : 1;

            if ( (REVERSED&order) ) dir = -dir;

            // O(n)
            item = new Array(n+1); item[n] = [n, new Array(n)];
            if ( K )
            {
                // restricted setpartition to exactly K parts
                item[n].push(array(K, 0));
                item = operate(function(item,ai,i){
                    if ( 0 > dir )
                    {
                        ai = i <= n-K ? 0 : K-n+i;
                        item[i] = ai;
                        item[n][1][i] = ai;
                        item[n][2][ai]++;
                    }
                    else
                    {
                        ai = i < K ? i : K-1;
                        item[i] = ai;
                        item[n][1][i] = ai;
                        item[n][2][ai]++;
                    }
                    return item;
                }, item, null, 0, n-1, 1);
            }
            else
            {
                // unrestricted setpartition
                item = operate(function(item,ai,i){
                    if ( 0 > dir )
                    {
                        item[i] = 0;
                        item[n][1][i] = 0;
                    }
                    else
                    {
                        item[i] = i;
                        item[n][1][i] = i;
                    }
                    return item;
                }, item, null, 0, n-1, 1);
            }

            return item;
        }
        ,succ: function( item, index, n, $, dir ) {
            if ( (null == n) || (null == item) || (0 >= n) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_setpartition(item, n, $ && $["parts="] ? $["parts="]|0 : null, dir, $ && null!=$.order ? $.order : LEX);
        }
        ,rand: function( n, $ ) {
            var klass = this, K = $ && $["parts="] ? $["parts="]|0 : null,
                rnd = Abacus.Math.rnd, Arithmetic = Abacus.Arithmetic, q, m, l, i, k, prob, cdf;
            if ( 0 >= n || (K && K > n) ) return null;
            q = array(n, 0); m = n; l = 0;
            while(0 < m)
            {
                cdf = Rational.Zero();
                prob = Rational.fromDec(rnd());
                k = 1;
                while(k <= m)
                {
                    cdf = cdf.add(Rational(Arithmetic.mul(factorial(m-1,k-1), klass.count(m-k, {"parts=":K})), klass.count(m, {"parts=":K})));
                    if ( cdf.gte(prob) ) break;
                    k++;
                }
                for(i=m-k; i<m; i++)
                {
                    q[i] = l;
                    if ( K ) l = (l+1) % K;
                }
                l++; if ( K && l>=K ) l = 0;
                m -= k;
            }
            q = shuffle(q);
            return operate(function(partition, i){
                partition[q[i]].push(i);
                return partition;
            }, array(stdMath.max.apply(null, q)+1, function(){return [];}), null, 0, n-1, 1).sort(function(a,b){return a[0]-b[0];});
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
    }
    ,output: function( item ) {
        if ( null == item ) return null;
        var self = this, $ = self.$, n = self.n,
            order = null!=$.order ? $.order : LEX,
            K = $ && $["parts="] ? $["parts="]|0 : null,
            is_reflected = REFLECTED & order;
        if ( n+1===item.length )
        {
            item = operate(function(partition, i){
                partition[item[i]].push(i);
                return partition;
            }, array(stdMath.max.apply(null, item.slice(0, n))+1, function(){return [];}), null, 0, n-1, 1);
            if ( is_reflected ) item = item.reverse();
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
});
function next_setpartition( item, n, K, dir, order )
{
    var i, j, k, l, m, found, pos;
    if ( !(LEX & order) ) return null; // only LEX supported
    if ( REVERSED & order ) dir = -dir;

    m = item[n][1];
    found = false;

    if ( K )
    {
        if ( (1 === K) || (n ===K) ) return null // last

        pos = item[n][2];

        if ( 0 > dir )
        {
            for(i=n-1; i>0; i--)
            {
                if ( item[i]<=m[i-1] && (item[i]!==(i<K?i:K-1)) )
                {
                    pos[item[i]]--;
                    item[i] = stdMath.min(K-1, item[i]+1);
                    m[i] = stdMath.max(item[i], m[i]);
                    pos[item[i]]++;
                    for(j=i+1; j<n; j++)
                    {
                        pos[item[j]]--;
                        item[j] = item[0];
                        pos[item[j]]++;
                        m[j] = m[i];
                    }
                    for(l=n-1,k=K-1; k>0; k--)
                    {
                        if ( !pos[k] )
                        {
                            pos[item[l]]--; pos[k]++;
                            item[l] = k; l--;
                        }
                    }
                    found = true;
                    break;
                }
            }
            if ( !found ) item = null; // last
        }
        else
        {
            for(i=n-1; i>0; i--)
            {
                if ( item[i]>item[0] && (K-n+i<item[i] || 1<pos[item[i]]) )
                {
                    pos[item[i]]--;
                    item[i]--; m[i] = m[i-1];
                    pos[item[i]]++;
                    for(j=i+1; j<n; j++)
                    {
                        if ( 1<pos[item[j]] )
                        {
                            pos[item[j]]--;
                            m[j] = stdMath.min(K-1, m[i]+j-i);
                            item[j] = m[j];
                            pos[item[j]]++;
                        }
                    }
                    found = true;
                    break;
                }
            }
            if ( !found ) item = null; // last
        }
    }
    else
    {
        // adapted from Efficient Generation of Set Partitions, Michael Orlov (https://www.informatik.uni-ulm.de/ni/Lehre/WS03/DMM/Software/partitions.pdf)
        if ( 0 > dir )
        {
            for(i=n-1; i>0; i--)
            {
                if ( item[i]<=m[i-1] )
                {
                    item[i]++; m[i] = stdMath.max(item[i], m[i]);
                    for(j=i+1; j<n; j++)
                    {
                        item[j] = item[0];
                        m[j] = m[i];
                    }
                    found = true;
                    break;
                }
            }
            if ( !found ) item = null; // last
        }
        else
        {
            for(i=n-1; i>0; i--)
            {
                if ( item[i]>item[0] )
                {
                    item[i]--; m[i] = m[i-1];
                    for(j=i+1; j<n; j++)
                    {
                        m[j] = m[i]+j-i;
                        item[j] = m[j];
                    }
                    found = true;
                    break;
                }
            }
            if ( !found ) item = null; // last
        }
    }
    return item;
}

// https://en.wikipedia.org/wiki/Catalan_number
CatalanWord = Abacus.CatalanWord = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function CatalanWord( n, $ ) {
        var self = this, sub = null, K;
        if ( !is_instance(self, CatalanWord) ) return new CatalanWord(n, $);
        $ = $ || {}; $.type = "catalan";
        n = n||1;
        if ( is_instance(n, CombinatorialIterator) )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.base = n;
        $.dimension = 2*n;
        $.mindimension = 2*n;
        $.maxdimension = 2*n;
        $.rand = $.rand || {}; $.rand["catalan"] = 1;
        $.symbols = $.symbols || ['(',')']; if ( is_string($.symbols) ) $.symbols = $.symbols.split('');
        CombinatorialIterator.call(self, "CatalanWord", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function( item, n, $, dir ) {
            return item;
        }
        ,count: function( n, $ ) {
            return 0<n ? catalan(n) : Abacus.Arithmetic.O;
        }
        ,initial: function( n, $, dir ) {
            var klass = this, order = $ && null!=$.order ? $.order : LEX;

            if ( (0 >= n) ) return null;

            dir = -1 === dir ? -1 : 1;

            if ( (REVERSED&order) ) dir = -dir;

            // O(n)
            return array(n, function(i){return 0 > dir ? 2*i : i;});
        }
        ,succ: function( item, index, n, $, dir ) {
            if ( (null == n) || (null == item) || (0 >= n) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_catalan(item, n, dir, $ && null!=$.order ? $.order : LEX);
        }
        ,rand: function( n, $ ) {
            var klass = this, seq, prefix, suffix, word, partial_sum, i, s, nn;
            if ( 0 >= n ) return null;

            // "Generating binary trees at random", Atkinson & Sack, 1992
            // adapted from https://gist.github.com/rygorous/d57941fa5ae6beb59f17bc30793d3d75
            nn = 2*n;
            seq = shuffle(array(nn, function(i){return i < n ? 1 : -1;}));
            prefix = [];
            suffix = [];
            word = [];
            partial_sum = 0;
            for(i=0; i<nn; i++)
            {
                s = seq[i];
                word.push(s)
                partial_sum += s;
                if (0 === partial_sum) // at the end of an irreducible balanced word
                {
                    if (-1 === s)
                    {
                        // it was well-formed! append it.
                        prefix = prefix.concat(word);
                    }
                    else
                    {
                        // it was not well-formed! fix it.
                        prefix.push(1);
                        suffix = [-1].concat(word.slice(1,-1).map(function(x){return -x;})).concat(suffix);
                    }
                    word = [];
                }
            }
            seq = prefix.concat(suffix);

            // convert in FXT format
            return seq.reduce(function(item, x, i){
                if (0 < x) item.push(i);
                return item;
            }, []);
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
    }
    ,output: function( item ) {
        if ( null == item ) return null;
        var self = this, $ = self.$, n = self.n,
            order = null!=$.order ? $.order : LEX,
            symbols = $.symbols, is_reflected = REFLECTED & order, word, j = 0;
        word = array(2*n, function(i){
            if ( j<item.length && i === item[j] ) { j++; return symbols[0]; }
            return symbols[symbols.length-1];
        });
        if ( is_reflected ) word = array(word.length, function(i){return symbols[0]===word[word.length-1-i] ? symbols[symbols.length-1] : symbols[0];});
        return CombinatorialIterator[PROTO].output.call(self, word);
    }
});
function next_catalan( item, n, dir, order )
{
    var i, j, z, m, t, y, d, nn = n<<1;

    if ( n<=1 ) return null;
    if ( REVERSED & order ) dir = -dir;

    // adapted from FXT lib
    if ( 0 > dir )
    {
        if ( COLEX & order )
        {
            j = 0;
            while( j<n && item[j]===j ) ++j;
            if ( n<=j )
            {
                item = null;
            }
            else
            {
                if ( 0<j && 2===item[j]-item[j-1] )
                {
                    --item[j];
                }
                else
                {
                    i = --item[j]; --j; --i;
                    for(; 0<j && 2*i>j;  --i,--j) item[j] = i;
                    for(; 0<i; --i) item[i] = 2*i;
                    item[0] = 0;
                }
            }
        }
        else
        {
            m = nn;
            j = n-1;
            z = item[j];
            y = 0<j ? item[j-1] : 1;
            d = z - y;
            while(true)
            {
                if ( 1 !== d )
                {
                    if ( 0>=j )
                    {
                        item = null;
                        break;
                    }
                    else
                    {
                        item[j] = z - 1;
                        break;
                    }
                }
                m -= 2;
                item[j] = m;
                z = y;
                --j;
                y = 0<j ? item[j-1] : 1;
                d = z - y;
            }
        }
    }
    else
    {
        if ( COLEX & order )
        {
            j = 0;
            if ( 2===item[1] )
            {
                j = 2;
                while( j<n && item[j]===2*j ) ++j;
                if ( n<=j ) item = null;
            }
            if ( item )
            {
                while( j+1<n && 1===(item[j+1]-item[j]) ) ++j;
                ++item[j];
                for(i=0; i<j; ++i) item[i] = i;
            }
        }
        else
        {
            j = n-1; z = item[j]; m = nn-2;
            if ( z < m )
            {
                item[j] = z+1;
            }
            else
            {
                do{
                    --j; m -= 2;
                }while(0<=j && m===item[j]);
                if ( 0 > j )
                {
                    item = null;
                }
                else
                {
                    t = item[j]; i = j;
                    do{
                        item[i++] = ++t;
                    }while(i<n);
                }
            }
        }
    }
    return item;
}

LatinSquare = Abacus.LatinSquare = Class({
    constructor: function LatinSquare( n ) {
        var self = this;
        if ( !is_instance(self, LatinSquare) ) return new LatinSquare(n);
        self.n = +(n||0);
        self.s = LatinSquare.make(self.n);
    }

    ,__static__: {
        isLatin: function( s ) {
            return is_latin(is_instance(s, LatinSquare) ? s.s : s);
        }
        ,make: function( n ) {
            // O(n x n)
            var i, j, k=1, s = new Array(n), a, b, a2, b2, diag, Nn,
                val = Abacus.Arithmetic.val, N = Abacus.Arithmetic.num;
            // try to construct a (pan-)diagonal latin square first
            diag = 0;
            if ( (n&1) /* odd */ && (n%3) /* not divisable by 3 */ )
            {
                a = 2; b = 1;
                diag = 2; // conditions met for (pan-)diagonal square
            }
            else if ( n&1 /* odd */ )
            {
                // else try an exhaustive search over the possible factors
                Nn = N(n);
                for(i=1; i<n; i++)
                {
                    if ( 1 === val(gcd(N(i), Nn)) ) a = i;
                    else continue;
                    for(j=i+1; j<n; j++)
                    {
                        if ( 1 === val(gcd(N(j), Nn)) ) b = j;
                        else continue;
                        a2 = a; b2 = b; // backup partial solution
                        diag = 1;
                        if ( 1 === val(gcd(N(a-b), Nn)) && 1 === val(gcd(N(a+b), Nn)) )
                        {
                            diag = 2; // conditions met for (pan-)diagonal square
                            break;
                        }
                    }
                    if ( 2 === diag ) break;
                }
                if ( diag )
                {
                    // get latest solutions
                    a = a2; b = b2;
                }
            }
            if ( diag )
            {
                for (i=0; i<n; i++)
                {
                    s[i] = new Array(n);
                    for (j=0; j<n; j++) s[i][j] = ((i*b)+(j*a))%n + 1;
                }
            }
            else
            {
                // else default to a normal latin square
                for (i=0; i<n; i++)
                {
                    s[i] = new Array(n);
                    for (j=0; j<n; j++) s[i][j] = (j+i)%n + 1;
                }
            }
            return s;
        }
        ,toString: function( s ) {
            var n, len, out = '', i;
            if ( null == s ) return out;
            n = s.length; len = String(n).length;
            for(i=0; i<n; i++)
                out += s[i].map(function(x){return pad(String(x), len, ' ');}).join(' ') + "\n";
            return out;
        }
    }

    ,n: null
    ,s: null
    ,_str: null

    ,dispose: function( ) {
        var self = this;
        self.n = null;
        self.s = null;
        self._str = null;
        return self;
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
            self._str = self.s ? LatinSquare.toString(self.s) : '';
        return  self._str;
    }
});

MagicSquare = Abacus.MagicSquare = Class({
    constructor: function MagicSquare( n, s ) {
        var self = this;
        if ( !is_instance(self, MagicSquare) ) return new MagicSquare(n, s);
        self.n = +(n||0);
        self.s = is_array(s) ? s : MagicSquare.make(self.n);
    }

    ,__static__: {
        isMagic: function( s ) {
            return is_magic(is_instance(s, MagicSquare) ? s.s : s);
        }
        ,make: function magic_square( n ) {
            // non-existent
            if ( 0 >= n || 2 === n ) return null;
            // trivial
            if ( 1 === n ) return [[1]];

            var i, j, k,
                odd = n&1, even = 1-odd,
                doubly_even = 0 === (/*n%4*/n&3),
                nn = n*n, n2 = (n-odd)>>>1,
                O, o, n22, a, b, c, lc, rc, t,
                n12, n21, magic;

            magic = new Array(n);
            for (i=0; i<n; i++) magic[i] = new Array(n);

            if ( odd ) // odd order
            {
                // O(n^2)
                n12 = n+n2; n21 = n2+odd;
                for (k=0,i=0,j=0; k<nn; k++,j++)
                {
                    if ( j >= n ) { i++; j=0; }
                    magic[i][j] = ((n12+j-i)%n)*n + ((n21+i+j)%n)+1;
                }
            }

            else if ( doubly_even ) // doubly-even order
            {
                // O(n^2)
                for (k=0,i=0,j=0; k<nn; k++,j++)
                {
                    if ( j >= n ) { i++; j=0; }
                    magic[i][j] = (((i+1)/*%4*/&3)>>>1 === ((j+1)/*%4*/&3)>>>1) ? nn-k : k+1;
                }
            }

            else //if ( even ) // singly-even order
            {
                // O((n/2)^2)
                O = magic_square(n2); n22 = n2*n2;
                a = n22; b = a<<1; c = b+n22;
                for (k=0,i=0,j=0; k<n22; k++,j++)
                {
                    if ( j >= n2 ) { i++; j=0; }
                    o = O[i][j];
                    magic[i][j] = o;
                    magic[i+n2][j+n2] = o + a;
                    magic[i+n2][j] = o + b;
                    magic[i][j+n2] = o + c;
                }
                lc = n2>>>1; rc = lc;
                for (j=0; j<n2; j++)
                {
                    for (i=0; i<n; i++)
                    {
                        if ( ((i < lc) || (i > n - rc) || (i === lc && j === lc)) &&
                        !(i === 0 && j === lc) )
                        {
                            t = magic[i][j];
                            magic[i][j] = magic[i][j + n2];
                            magic[i][j + n2] = t;
                        }
                    }
                }
            }
            return magic;
        }
        ,product: function( /* args */) {
            if ( 1 >= arguments.length ) return arguments[0];
            var m = arguments, nm = m.length, m1, m2, mm = m[0], mult, n1, n2, n22, n12, k=1, i, j, i1, i2, j1, j2;
            while (k < nm)
            {
                m1 = mm; m2 = m[k++];
                n1 = m1.length; n2 = m2.length; n22 = n2*n2; n12 = n1*n2;
                mm = new Array(n12);
                for (i=0; i<n12; i++) mm[i] = new Array(n12);
                i1=0; i=0; j1=0; j=0; i2=0; j2=0;
                mult = (m1[i1][j1]-1)*n22;
                while (i1 < n1)
                {
                    mm[i+i2][j+j2] = mult + m2[i2][j2];
                    if ( ++j2 >= n2 )
                    {
                        i2++; j2=0;
                        if ( i2 >= n2 )
                        {
                            j1++; j+=n2; i2=0; j2=0;
                            if ( j1 >= n1 ) { i1++; i+=n2; j1=0; j=0; i2=0; j2=0; }
                            if ( i1 < n1 && j1 < n1 ) mult = (m1[i1][j1]-1)*n22;
                        }
                    }
                }
            }
            return mm;
        }
        ,pythagorean: NotImplemented
        ,toString: function( s ) {
            var n, len, out = '', i;
            if ( null == s ) return out;
            n = s.length; len = String(n*n).length;
            for(i=0; i<n; i++)
                out += s[i].map(function(x){return pad(String(x), len, ' ');}).join(' ') + "\n";
            return out;
        }
    }

    ,n: null
    ,s: null
    ,_str: null

    ,dispose: function( ) {
        var self = this;
        self.n = null;
        self.s = null;
        self._str = null;
        return self;
    }
    ,mul: function( other ) {
        var self = this;
        return MagicSquare(self.n*other.n, self.s && other.s ? MagicSquare.product(self.s, other.s) : null);
    }
    ,toString: function( ) {
        var self = this;
        if ( null == self._str )
            self._str = self.s ? MagicSquare.toString(self.s) : '';
        return  self._str;
    }
});

// export it
return Abacus;
});
