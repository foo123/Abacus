/**
*
*   Abacus
*   A combinatorics and number theory library for Node.js / Browser / XPCOM Javascript, Python, Java
*   @version: 0.9.8
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

var  Abacus = {VERSION: "0.9.8"}, stdMath = Math, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array.prototype.slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,log2 = stdMath.log2 || function(x) { return stdMath.log(x) / stdMath.LN2; }
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim ? function( s ){ return s.trim(); } : function( s ){ return s.replace(trim_re, ''); }
    ,pos_re = /\[(\d+)\]/g, pos_test_re = /\[(\d+)\]/
    ,in_set_re = /^\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/, not_in_set_re = /^!\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/

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
        if ( 1 === arguments.length ) { c = s; s = Object; }
        var ctor = c[CLASS];
        if ( HAS.call(c,'__static__') ) { ctor = Merge(ctor, c.__static__); delete c.__static__; }
        ctor[PROTO] = Merge(Extend(s[PROTO]), c);
        return ctor;
    }

    ,MAX_DEFAULT = 2147483647 // maximum integer for default arithmetic

    ,V_EQU=1, V_DIFF=-1, V_INC=3, V_DEC=-3, V_NONINC=-2, V_NONDEC=2

    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED

    ,Iterator, CombinatorialIterator, DefaultArithmetic
    ,Filter, Node, /*Cache,*/ HashSieve, Term, Expr, Polynomial, Matrix
    ,Tensor, Permutation, Combination, Subset, Partition
    ,LatinSquare, MagicSquare, Progression, PrimeSieve, Diophantine
;

// utility methods
function NotImplemented( ) { throw new Error("Method not implemented!"); }
function ID( x ) { return x; }
function is_array( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
function is_args( x ) { return ('[object Arguments]' === toString.call(x)) && (null != x.length); }
function is_obj( x ) { return /*(x instanceof Object) ||*/ ('[object Object]' === toString.call(x)); }
function is_string( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
function is_number( x ) { return "number" === typeof x; }
function is_callable( x ) { return "function"===typeof x; }
function to_fixed_binary_string_32( b )
{
    var bs = b.toString( 2 ), n = 32-bs.length;
    return n > 0 ? new Array(n+1).join('0') + bs : bs;
}

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
function sortedrun( a, a0, a1, index, indices )
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
    if ( 0 === d0 ) d0 = 1;
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
        if ( 0 === d1 ) d1 = 1;
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
            sortedrun(a, a0, a1, index, indices);
            if ( -1 === index[3] )
            {
                // already sorted, reflect if sorted reversely
                // O(n)
                if ( dir !== index[2] && a0 < a1 ) reflection(a, a, a0, a1);
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
function binarysearch( v, a, dir, a0, a1, Arithmetic )
{
    // binary search O(logn)
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var l=a0, r=a1, m, am;
    if ( Arithmetic )
    {
        if ( Arithmetic.equ(v, a[l]) ) return l;
        if ( Arithmetic.equ(v, a[r]) ) return r;
        while(l<r)
        {
            m = l+((r-l+1)>>>1);
            am = a[m];
            if ( Arithmetic.equ(v, am) ) return m;
            else if ( (1===dir && Arithmetic.lt(v, am)) || (-1===dir && Arithmetic.gt(v, am)) ) r = m-1;
            else l = m+1;
        }
    }
    else
    {
        if ( v === a[l] ) return l;
        if ( v === a[r] ) return r;
        while(l<r)
        {
            m = l+((r-l+1)>>>1);
            am = a[m];
            if ( v === am ) return m;
            else if ( (1===dir && v<am) || (-1===dir && v>am) ) r = m-1;
            else l = m+1;
        }
    }
    return -1;
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
    return Arithmetic ? function(a, b){return Arithmetic.equ(a, b) ? 0 : (Arithmetic.lt(a, b) ? -1 : 1);} : function(a, b){return a===b ? 0 : (a<b ? -1 : 1);};
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
    return operate(Arithmetic.add, Arithmetic.O, x, i0, i1, ik);
}
function product( x, i0, i1, ik )
{
    var Arithmetic = Abacus.Arithmetic;
    return operate(Arithmetic.mul, Arithmetic.I, x, i0, i1, ik);
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
    while (!Arithmetic.equ(r2, O))
    {
        q = Arithmetic.div(r1, r2);
        r = Arithmetic.mod(r1, r2);
        r1 = r2;
        r2 = r;

        t = Arithmetic.sub(t1, Arithmetic.mul(q, t2));
        t1 = t2;
        t2 = t;
    }
    if (Arithmetic.equ(r1, I)) inv = t1;
    if (Arithmetic.lt(inv, O)) inv = Arithmetic.add(inv, m);
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
function ikthroot( n, k )
{
    // Return the integer k-th root of a number by Newton's method
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, I = Arithmetic.I,
        u, r, t, k_1;

    k = +k; // assume small integer
    //n = N(n);
    if ( 1 > k ) return null; // undefined
    else if ( (1 === k) || Arithmetic.equ(n, Arithmetic.O) || Arithmetic.equ(n, I) ) return n;

    k_1 = k-1;
    u = n;
    r = Arithmetic.add(n, I);
    while ( Arithmetic.lt(u, r) )
    {
        r = u;
        t = Arithmetic.add(Arithmetic.mul(r, k_1), Arithmetic.div(n, Arithmetic.pow(r, k_1)));
        u = Arithmetic.div(t, k);
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
        // a list of the first primes up to a limit (first 1000 primes)
        small_primes.list = [N(2),N(3),N(5),N(7),N(11),N(13),N(17),N(19),N(23),N(29),N(31),N(37),N(41),N(43),N(47),N(53),N(59),N(61),N(67),N(71),N(73),N(79),N(83),N(89),N(97),N(101),N(103),N(107),N(109),N(113),N(127),N(131),N(137),N(139),N(149),N(151),N(157),N(163),N(167),N(173),N(179),N(181),N(191),N(193),N(197),N(199),N(211),N(223),N(227),N(229),N(233),N(239),N(241),N(251),N(257),N(263),N(269),N(271),N(277),N(281),N(283),N(293),N(307),N(311),N(313),N(317),N(331),N(337),N(347),N(349),N(353),N(359),N(367),N(373),N(379),N(383),N(389),N(397),N(401),N(409),N(419),N(421),N(431),N(433),N(439),N(443),N(449),N(457),N(461),N(463),N(467),N(479),N(487),N(491),N(499),N(503),N(509),N(521),N(523),N(541),N(547),N(557),N(563),N(569),N(571),N(577),N(587),N(593),N(599),N(601),N(607),N(613),N(617),N(619),N(631),N(641),N(643),N(647),N(653),N(659),N(661),N(673),N(677),N(683),N(691),N(701),N(709),N(719),N(727),N(733),N(739),N(743),N(751),N(757),N(761),N(769),N(773),N(787),N(797),N(809),N(811),N(821),N(823),N(827),N(829),N(839),N(853),N(857),N(859),N(863),N(877),N(881),N(883),N(887),N(907),N(911),N(919),N(929),N(937),N(941),N(947),N(953),N(967),N(971),N(977),N(983),N(991),N(997),N(1009),N(1013),N(1019),N(1021),N(1031),N(1033),N(1039),N(1049),N(1051),N(1061),N(1063),N(1069),N(1087),N(1091),N(1093),N(1097),N(1103),N(1109),N(1117),N(1123),N(1129),N(1151),N(1153),N(1163),N(1171),N(1181),N(1187),N(1193),N(1201),N(1213),N(1217),N(1223),N(1229),N(1231),N(1237),N(1249),N(1259),N(1277),N(1279),N(1283),N(1289),N(1291),N(1297),N(1301),N(1303),N(1307),N(1319),N(1321),N(1327),N(1361),N(1367),N(1373),N(1381),N(1399),N(1409),N(1423),N(1427),N(1429),N(1433),N(1439),N(1447),N(1451),N(1453),N(1459),N(1471),N(1481),N(1483),N(1487),N(1489),N(1493),N(1499),N(1511),N(1523),N(1531),N(1543),N(1549),N(1553),N(1559),N(1567),N(1571),N(1579),N(1583),N(1597),N(1601),N(1607),N(1609),N(1613),N(1619),N(1621),N(1627),N(1637),N(1657),N(1663),N(1667),N(1669),N(1693),N(1697),N(1699),N(1709),N(1721),N(1723),N(1733),N(1741),N(1747),N(1753),N(1759),N(1777),N(1783),N(1787),N(1789),N(1801),N(1811),N(1823),N(1831),N(1847),N(1861),N(1867),N(1871),N(1873),N(1877),N(1879),N(1889),N(1901),N(1907),N(1913),N(1931),N(1933),N(1949),N(1951),N(1973),N(1979),N(1987),N(1993),N(1997),N(1999),N(2003),N(2011),N(2017),N(2027),N(2029),N(2039),N(2053),N(2063),N(2069),N(2081),N(2083),N(2087),N(2089),N(2099),N(2111),N(2113),N(2129),N(2131),N(2137),N(2141),N(2143),N(2153),N(2161),N(2179),N(2203),N(2207),N(2213),N(2221),N(2237),N(2239),N(2243),N(2251),N(2267),N(2269),N(2273),N(2281),N(2287),N(2293),N(2297),N(2309),N(2311),N(2333),N(2339),N(2341),N(2347),N(2351),N(2357),N(2371),N(2377),N(2381),N(2383),N(2389),N(2393),N(2399),N(2411),N(2417),N(2423),N(2437),N(2441),N(2447),N(2459),N(2467),N(2473),N(2477),N(2503),N(2521),N(2531),N(2539),N(2543),N(2549),N(2551),N(2557),N(2579),N(2591),N(2593),N(2609),N(2617),N(2621),N(2633),N(2647),N(2657),N(2659),N(2663),N(2671),N(2677),N(2683),N(2687),N(2689),N(2693),N(2699),N(2707),N(2711),N(2713),N(2719),N(2729),N(2731),N(2741),N(2749),N(2753),N(2767),N(2777),N(2789),N(2791),N(2797),N(2801),N(2803),N(2819),N(2833),N(2837),N(2843),N(2851),N(2857),N(2861),N(2879),N(2887),N(2897),N(2903),N(2909),N(2917),N(2927),N(2939),N(2953),N(2957),N(2963),N(2969),N(2971),N(2999),N(3001),N(3011),N(3019),N(3023),N(3037),N(3041),N(3049),N(3061),N(3067),N(3079),N(3083),N(3089),N(3109),N(3119),N(3121),N(3137),N(3163),N(3167),N(3169),N(3181),N(3187),N(3191),N(3203),N(3209),N(3217),N(3221),N(3229),N(3251),N(3253),N(3257),N(3259),N(3271),N(3299),N(3301),N(3307),N(3313),N(3319),N(3323),N(3329),N(3331),N(3343),N(3347),N(3359),N(3361),N(3371),N(3373),N(3389),N(3391),N(3407),N(3413),N(3433),N(3449),N(3457),N(3461),N(3463),N(3467),N(3469),N(3491),N(3499),N(3511),N(3517),N(3527),N(3529),N(3533),N(3539),N(3541),N(3547),N(3557),N(3559),N(3571),N(3581),N(3583),N(3593),N(3607),N(3613),N(3617),N(3623),N(3631),N(3637),N(3643),N(3659),N(3671),N(3673),N(3677),N(3691),N(3697),N(3701),N(3709),N(3719),N(3727),N(3733),N(3739),N(3761),N(3767),N(3769),N(3779),N(3793),N(3797),N(3803),N(3821),N(3823),N(3833),N(3847),N(3851),N(3853),N(3863),N(3877),N(3881),N(3889),N(3907),N(3911),N(3917),N(3919),N(3923),N(3929),N(3931),N(3943),N(3947),N(3967),N(3989),N(4001),N(4003),N(4007),N(4013),N(4019),N(4021),N(4027),N(4049),N(4051),N(4057),N(4073),N(4079),N(4091),N(4093),N(4099),N(4111),N(4127),N(4129),N(4133),N(4139),N(4153),N(4157),N(4159),N(4177),N(4201),N(4211),N(4217),N(4219),N(4229),N(4231),N(4241),N(4243),N(4253),N(4259),N(4261),N(4271),N(4273),N(4283),N(4289),N(4297),N(4327),N(4337),N(4339),N(4349),N(4357),N(4363),N(4373),N(4391),N(4397),N(4409),N(4421),N(4423),N(4441),N(4447),N(4451),N(4457),N(4463),N(4481),N(4483),N(4493),N(4507),N(4513),N(4517),N(4519),N(4523),N(4547),N(4549),N(4561),N(4567),N(4583),N(4591),N(4597),N(4603),N(4621),N(4637),N(4639),N(4643),N(4649),N(4651),N(4657),N(4663),N(4673),N(4679),N(4691),N(4703),N(4721),N(4723),N(4729),N(4733),N(4751),N(4759),N(4783),N(4787),N(4789),N(4793),N(4799),N(4801),N(4813),N(4817),N(4831),N(4861),N(4871),N(4877),N(4889),N(4903),N(4909),N(4919),N(4931),N(4933),N(4937),N(4943),N(4951),N(4957),N(4967),N(4969),N(4973),N(4987),N(4993),N(4999),N(5003),N(5009),N(5011),N(5021),N(5023),N(5039),N(5051),N(5059),N(5077),N(5081),N(5087),N(5099),N(5101),N(5107),N(5113),N(5119),N(5147),N(5153),N(5167),N(5171),N(5179),N(5189),N(5197),N(5209),N(5227),N(5231),N(5233),N(5237),N(5261),N(5273),N(5279),N(5281),N(5297),N(5303),N(5309),N(5323),N(5333),N(5347),N(5351),N(5381),N(5387),N(5393),N(5399),N(5407),N(5413),N(5417),N(5419),N(5431),N(5437),N(5441),N(5443),N(5449),N(5471),N(5477),N(5479),N(5483),N(5501),N(5503),N(5507),N(5519),N(5521),N(5527),N(5531),N(5557),N(5563),N(5569),N(5573),N(5581),N(5591),N(5623),N(5639),N(5641),N(5647),N(5651),N(5653),N(5657),N(5659),N(5669),N(5683),N(5689),N(5693),N(5701),N(5711),N(5717),N(5737),N(5741),N(5743),N(5749),N(5779),N(5783),N(5791),N(5801),N(5807),N(5813),N(5821),N(5827),N(5839),N(5843),N(5849),N(5851),N(5857),N(5861),N(5867),N(5869),N(5879),N(5881),N(5897),N(5903),N(5923),N(5927),N(5939),N(5953),N(5981),N(5987),N(6007),N(6011),N(6029),N(6037),N(6043),N(6047),N(6053),N(6067),N(6073),N(6079),N(6089),N(6091),N(6101),N(6113),N(6121),N(6131),N(6133),N(6143),N(6151),N(6163),N(6173),N(6197),N(6199),N(6203),N(6211),N(6217),N(6221),N(6229),N(6247),N(6257),N(6263),N(6269),N(6271),N(6277),N(6287),N(6299),N(6301),N(6311),N(6317),N(6323),N(6329),N(6337),N(6343),N(6353),N(6359),N(6361),N(6367),N(6373),N(6379),N(6389),N(6397),N(6421),N(6427),N(6449),N(6451),N(6469),N(6473),N(6481),N(6491),N(6521),N(6529),N(6547),N(6551),N(6553),N(6563),N(6569),N(6571),N(6577),N(6581),N(6599),N(6607),N(6619),N(6637),N(6653),N(6659),N(6661),N(6673),N(6679),N(6689),N(6691),N(6701),N(6703),N(6709),N(6719),N(6733),N(6737),N(6761),N(6763),N(6779),N(6781),N(6791),N(6793),N(6803),N(6823),N(6827),N(6829),N(6833),N(6841),N(6857),N(6863),N(6869),N(6871),N(6883),N(6899),N(6907),N(6911),N(6917),N(6947),N(6949),N(6959),N(6961),N(6967),N(6971),N(6977),N(6983),N(6991),N(6997),N(7001),N(7013),N(7019),N(7027),N(7039),N(7043),N(7057),N(7069),N(7079),N(7103),N(7109),N(7121),N(7127),N(7129),N(7151),N(7159),N(7177),N(7187),N(7193),N(7207),N(7211),N(7213),N(7219),N(7229),N(7237),N(7243),N(7247),N(7253),N(7283),N(7297),N(7307),N(7309),N(7321),N(7331),N(7333),N(7349),N(7351),N(7369),N(7393),N(7411),N(7417),N(7433),N(7451),N(7457),N(7459),N(7477),N(7481),N(7487),N(7489),N(7499),N(7507),N(7517),N(7523),N(7529),N(7537),N(7541),N(7547),N(7549),N(7559),N(7561),N(7573),N(7577),N(7583),N(7589),N(7591),N(7603),N(7607),N(7621),N(7639),N(7643),N(7649),N(7669),N(7673),N(7681),N(7687),N(7691),N(7699),N(7703),N(7717),N(7723),N(7727),N(7741),N(7753),N(7757),N(7759),N(7789),N(7793),N(7817),N(7823),N(7829),N(7841),N(7853),N(7867),N(7873),N(7877),N(7879),N(7883),N(7901),N(7907),N(7919)];
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
    sqrt = isqrt(n); //ikthroot(n, 2);
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
    sqrt = isqrt(n); //ikthroot(n, 2);
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
    sqrt = isqrt(n); //ikthroot(n, 2);
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
    for (i=0,l=stdMath.min(primes.length,50); i<l; i++)
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
    for (i=0,l=stdMath.min(primes.length,100); i<l; i++)
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
    if ( ndigits <= 8 )
    {
        // deterministic test
        return wheel_trial_div_test(n);
    }
    else if ( ndigits <= 1000 )
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
        /*if ( Arithmetic.lt(n, N(1373653)) )
            return miller_rabin_test(n, [two, N(3)]);
        else if ( Arithmetic.lt(n, N("25326001")) )
            return miller_rabin_test(n, [two, N(3), N(5)]);
        else*/ if ( Arithmetic.lt(n, N("25000000000")) )
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
            if ( is_prime(x) ) return x;
    }
    else
    {
        // next prime
        if ( Arithmetic.lt(n, two) ) return two; // first prime
        for(x=Arithmetic.add(n, Arithmetic.equ(O, Arithmetic.mod(n, two)) ? I : two);;x=Arithmetic.add(x,two))
            if ( is_prime(x) ) return x;
    }
}
function pollard_rho( n, s, a, retries, max_steps, F )
{
    // find a non-trivial factor of n using the Pollard-Rho heuristic
    // http://en.wikipedia.org/wiki/Pollard%27s_rho_algorithm
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
        three, five, seven, four, six, eight, ten, inc, i, p, p2, fac;

    // trial division with a wheel of {2,3,5,7}, faster than simple trial division
    if ( !trial_div_fac.wheel )
    {
        // compute only once
        four = N(4); six = N(6); eight = N(8); ten = N(10);
        trial_div_fac.wheel = {
            base: [two, N(3), N(5), N(7)],
            next: N(11), /* next prime */
            next2: N(121), /* next prime squared */
            inc: [two,four,two,four,six,two,six,four,two,four,six,six,two,six,four,two,six,four,six,eight,four,two,four,
            two,four,eight,six,four,six,two,four,six,two,six,six,four,two,four,six,two,six,four,two,four,two,ten,two,ten]
        };
    }
    three = trial_div_fac.wheel.base[1];
    five = trial_div_fac.wheel.base[2];
    seven = trial_div_fac.wheel.base[3];

    if ( Arithmetic.lt(n, two) ||
        Arithmetic.equ(n, two) ||
        Arithmetic.equ(n, three) ||
        Arithmetic.equ(n, five) ||
        Arithmetic.equ(n, seven)
    ) return [[n, I]];

    factors = null; f1 = null; L = 0;

    e = O;
    while( Arithmetic.equ(O, Arithmetic.mod(n, two)) )
    {
        e = Arithmetic.add(I, e);
        n = Arithmetic.div(n, two);
    }
    if ( Arithmetic.gt(e, O) )
    {
        f = new Node([two, e]);
        factors = f1 = f;
        L++;
    }

    e = O;
    while( Arithmetic.equ(O, Arithmetic.mod(n, three)) )
    {
        e = Arithmetic.add(I, e);
        n = Arithmetic.div(n, three);
    }
    if ( Arithmetic.gt(e, O) )
    {
        // add last
        f = new Node([three, e]);
        f.l = f1;
        if ( f1 ) f1.r = f;
        f1 = f; L++;
        if ( !factors ) factors = f1;
    }

    e = O;
    while( Arithmetic.equ(O, Arithmetic.mod(n, five)) )
    {
        e = Arithmetic.add(I, e);
        n = Arithmetic.div(n, five);
    }
    if ( Arithmetic.gt(e, O) )
    {
        // add last
        f = new Node([five, e]);
        f.l = f1;
        if ( f1 ) f1.r = f;
        f1 = f; L++;
        if ( !factors ) factors = f1;
    }

    e = O;
    while( Arithmetic.equ(O, Arithmetic.mod(n, seven)) )
    {
        e = Arithmetic.add(I, e);
        n = Arithmetic.div(n, seven);
    }
    if ( Arithmetic.gt(e, O) )
    {
        // add last
        f = new Node([seven, e]);
        f.l = f1;
        if ( f1 ) f1.r = f;
        f1 = f; L++;
        if ( !factors ) factors = f1;
    }

    inc = trial_div_fac.wheel.inc; i = 0;
    p = trial_div_fac.wheel.next; p2 = trial_div_fac.wheel.next2;
    while (Arithmetic.lte(p2, n) && (null==maxlimit || Arithmetic.lte(p2, maxlimit)))
    {
        e = O;
        while ( Arithmetic.equ(O, Arithmetic.mod(n, p)) )
        {
            e = Arithmetic.add(I, e);
            n = Arithmetic.div(n, p);
        }
        if ( Arithmetic.gt(e, O) )
        {
            // add last
            f = new Node([p, e]);
            f.l = f1;
            if ( f1 ) f1.r = f;
            f1 = f; L++;
            if ( !factors ) factors = f1;
        }
        p = Arithmetic.add(p, inc[i++]);
        if ( i === inc.length ) i = 0;
        p2 = Arithmetic.mul(p, p);
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
    var Arithmetic = Abacus.Arithmetic, ndigits, f;
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if ( ndigits <= 10 )
    {
        // trial division for small numbers
        return trial_div_fac(n);
    }
    else if ( ndigits <= 500 )
    {
        // recursive (heuristic) factorization for medium-to-large numbers
        f = pollard_rho(n, Arithmetic.II, Arithmetic.I, 5, 100, null);
        // try another heuristic as well
        if ( null == f ) f = pollard_pm1(n, Arithmetic.num(10), Arithmetic.II, 5);
        if ( null == f ) return [[n, Arithmetic.I]];
        else return merge_factors(factorize(f), factorize(Arithmetic.div(n, f)));
    }
    else
    {
        // quadratic sieve for (very) large numbers
        return siqs_fac(n);
    }
}
function gcd( /* args */ )
{
    // https://en.wikipedia.org/wiki/Greatest_common_divisor
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // supports Exact Big Integer Arithmetic if plugged in
    // note: returns always positive gcd (even of negative numbers)
    // note2: any zero arguments are skipped
    // note3: gcd(0,0,..,0) is conventionaly set to 0
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, a, b, t, i, zeroes,
        Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I;
    if ( 0 === c ) return O;

    /*zeroes = 0;
    for(i=0; i<c; i++)
    {
        //args[i] = Arithmetic.abs(args[i]); // not mutate passed array, may break original caller
        // break early
        if ( Arithmetic.equ(I, Arithmetic.abs(args[i])) ) return I;
        else if ( Arithmetic.equ(O, args[i]) ) zeroes++;
    }
    if ( zeroes === c ) return O;*/

    i = 0;
    while (i<c && Arithmetic.equ(a=args[i++], O) );
    a = Arithmetic.abs(a);
    while (i<c)
    {
        // break early
        if ( Arithmetic.equ(a, I) ) return I;
        while (i<c && Arithmetic.equ(b=args[i++], O) );
        b = Arithmetic.abs(b);
        // break early
        if ( Arithmetic.equ(b, I) ) return I;
        if ( Arithmetic.equ(b, O) ) break;
        // swap them (a >= b)
        if ( Arithmetic.lt(a, b) ) { t=b; b=a; a=t; }
        while (!Arithmetic.equ(b, O)) { t = b; b = Arithmetic.mod(a, t); a = t; }
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
        i, l = args.length, LCM;
    if ( 1 >= l ) return 1===l ? args[0] : Abacus.Arithmetic.O;
    LCM = lcm2(args[0], args[1]);
    for(i=2; i<l; i++) LCM = lcm2(LCM, args[i]);
    return LCM;
}
function xgcd( /* args */ )
{
    // https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Integer_relation_algorithm
    // supports Exact Big Integer Arithmetic if plugged in
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        a, b, a1 = I, b1 = O, a2 = O, b2 = I, quot, gcd, asign = I, bsign = I;

    if ( 0 === k ) return;

    a = /*N(*/args[0]/*)*/;
    if ( Arithmetic.lt(a, O) ) {a = Arithmetic.abs(a); asign = J;}
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
        gcd = 2 === k ? [/*N(*/args[1]/*)*/, I] : xgcd(slice.call(args, 1));
        b = gcd[0];
        if ( Arithmetic.lt(b, O) ) {b = Arithmetic.abs(b); bsign = J;}

        // gcd with zero factor, take into account
        if ( Arithmetic.equ(a, O) )
            return array(gcd.length+1,function(i){
                return 0===i ? b : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });
        else if ( Arithmetic.equ(b, O) )
            return array(gcd.length+1,function(i){
                return 0===i ? a : (1===i ? asign : Arithmetic.mul(bsign, gcd[i-1]));
            });

        for(;;)
        {
            quot = Arithmetic.div(a, b);
            a = Arithmetic.mod(a, b);
            a1 = Arithmetic.sub(a1, Arithmetic.mul(quot, a2));
            b1 = Arithmetic.sub(b1, Arithmetic.mul(quot, b2));
            if ( Arithmetic.equ(a, O) )
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
            if ( Arithmetic.equ(b, O) )
            {
                a1 = Arithmetic.mul(a1, asign); b1 = Arithmetic.mul(b1, bsign);
                return array(gcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : Arithmetic.mul(b1, gcd[i-1]));
                });
            }
        }
    }
}
function polygcd( /* args */ )
{
    // Generalization of Euclid GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor
    // https://en.wikipedia.org/wiki/Euclidean_division_of_polynomials
    // https://en.wikipedia.org/wiki/Polynomial_long_division
    // should be a generalisation of number gcd, meaning for constant polynomials should coincide with gcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, zeroes = 0, a, b, a0, b0, t, qr, i;

    if ( 0 === c ) return Polynomial.C(O);
    /*for(i=0; i<c; i++)
    {
        if ( Arithmetic.gt(O, args[i].lead()) ) args[i] = args[i].mul(J);
        if ( args[i].equ(O) ) zeroes++;
    }
    if ( zeroes === c ) return Polynomial.C(O, args[0].symbol);*/
    i = 0;
    while(i<c && (a=args[i++]).equ(O)) ;
    if ( Arithmetic.gt(O, a.lead()) ) a = a.mul(J);
    while (i<c)
    {
        while(i<c && (b=args[i++]).equ(O)) ;
        if ( b.equ(O) ) break;
        if ( Arithmetic.gt(O, b.lead()) ) b = b.mul(J);
        // swap them (a >= b)
        if ( (a.deg() < b.deg()) ||
            ((a.deg() === b.deg()) && Arithmetic.lt(a.lead(), b.lead())) ) { t=b; b=a; a=t; }
        while ( !b.equ(O) /*0 < b.deg()*/)
        {
            a0 = a; b0 = b;
            qr = a.div(b, true); a = b; b = qr[1];
            if ( a.equ(b0) && b.equ(a0) ) break; // will not change anymore
        }
    }
    // simplify and monic, NO we work with integer coefficients ONLY
    //if ( 0 < a.deg() ) a = a.div(gcd(a.coeff));
    return a;
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
        i, l = args.length, LCM;
    if ( 1 >= l ) return 1===l ? args[0] : Polynomial.C(Abacus.Arithmetic.O);
    LCM = polylcm2(args[0], args[1]);
    for(i=2; i<l; i++) LCM = polylcm2(LCM, args[i]);
    return LCM;
}
function polyxgcd( /* args */ )
{
    // Generalization of Extended GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
    // should be a generalisation of number xgcd, meaning for constant polynomials should coincide with xgcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, asign = I, bsign = I,
        a, b, a0, b0, a1, b1, a2, b2,
        qr, xgcd;

    if ( 0 === k ) return;

    a = args[0];

    a1 = Polynomial.C(I, a.symbol);
    b1 = Polynomial.C(O, a.symbol);
    a2 = Polynomial.C(O, a.symbol);
    b2 = Polynomial.C(I, a.symbol);

    if ( Arithmetic.gt(O, a.lead()) ) {a = a.mul(J); asign = J;}
    if ( 1 === k )
    {
        return [a, Polynomial.C(asign, a.symbol)];
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
        xgcd = 2 === k ? [args[1], Polynomial.C(I, a.symbol)] : polyxgcd(slice.call(args, 1));
        b = xgcd[0];
        if ( Arithmetic.gt(O, b.lead()) ) {b = b.mul(J); bsign = J;}

        // gcd with zero factor, take into account
        if ( a.equ(O) )
            return array(xgcd.length+1,function(i){
                return 0===i ? b : (1===i ? Polynomial.C(asign, a.symbol) : xgcd[i-1].mul(bsign));
            });
        else if ( b.equ(O) )
            return array(xgcd.length+1,function(i){
                return 0===i ? a : (1===i ? Polynomial.C(asign, a.symbol) : xgcd[i-1].mul(bsign));
            });

        for(;;)
        {
            a0 = a; b0 = b;

            qr = a.div(b, true);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if ( a.equ(O) /*0 === a.deg()*/ )
            {
                a2 = a2.mul(asign); b2 = b2.mul(bsign);
                return array(xgcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : xgcd[i-1].mul(b2));
                });
            }

            qr = b.div(a, true);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if( b.equ(O) /*0 === b.deg()*/ )
            {
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(xgcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : xgcd[i-1].mul(b1));
                });
            }

            if ( a.equ(a0) && b.equ(b0) )
            {
                // will not change anymore
                a1 = a1.mul(asign); b1 = b1.mul(bsign);
                return array(xgcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : xgcd[i-1].mul(b1));
                });
            }
        }
    }
}
function divisors( n, as_generator )
{
    // time+space O(sqrt(n)) to find all distinct divisors of n (including 1 and n itself)
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
        list = null, D2 = null, D1 = null, L1 = 0, L2 = 0, node, sqrn, i, n_i, next;
    //n = Arithmetic.num(n);
    n = Arithmetic.abs(n);
    sqrn = isqrt(n);
    if ( as_generator )
    {
        i = I; next = null;
        // return iterator/generator
        return Iterator(function(k, dir, state, first){
            // note will NOT return divisors sorted in order
            if ( 0 > dir ) return null; // only forward
            if ( first )
            {
                i = I;
                if ( !Arithmetic.equ(I, n) ) next = n;
                return I;
            }
            if ( next )
            {
                k = next;
                next = null;
                return k;
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
                    return i;
                }
                i = Arithmetic.add(i, I);
            }
            return null;
        });
    }
    else
    {
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
            var curr = list, item = curr.v; // get current list item
            list = curr.r; // shift list to next item in order from left to right
            curr.dispose(); // dispose previous list item
            if ( list ) list.l = null;
            return item;
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
    /*if ( !moebius.wheel )
    {
        // compute only once
        four = N(4); six = N(6); eight = N(8); ten = N(10);
        moebius.wheel = {
            base: [two, N(3), N(5), N(7)],
            next: N(11), next2: N(121),
            inc:  [two,four,two,four,six,two,six,four,two,four,six,six,two,six,four,two,six,four,six,eight,four,two,four,
            two,four,eight,six,four,six,two,four,six,two,six,six,four,two,four,six,two,six,four,two,four,two,ten,two,ten]
        };
    }
    three = moebius.wheel.base[1];
    five = moebius.wheel.base[2];
    seven = moebius.wheel.base[3];

    if ( Arithmetic.lt(n, two) ||
        Arithmetic.equ(n, two) ||
        Arithmetic.equ(n, three) ||
        Arithmetic.equ(n, five) ||
        Arithmetic.equ(n, seven)
    ) return I;

    // trial division with a wheel of {2,3,5,7}, faster than simple trial division
    m = 0;
    if( Arithmetic.equ(O, Arithmetic.mod(n, two)) )
    {
        n = Arithmetic.div(n, two);
        m++;
        // If p^2 also divides N
        if ( Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return O;
    }

    if( Arithmetic.equ(O, Arithmetic.mod(n, three)) )
    {
        n = Arithmetic.div(n, three);
        m++;
        // If p^2 also divides N
        if ( Arithmetic.equ(O, Arithmetic.mod(n, three)) ) return O;
    }

    if( Arithmetic.equ(O, Arithmetic.mod(n, five)) )
    {
        n = Arithmetic.div(n, five);
        m++;
        // If p^2 also divides N
        if ( Arithmetic.equ(O, Arithmetic.mod(n, five)) ) return O;
    }

    if( Arithmetic.equ(O, Arithmetic.mod(n, seven)) )
    {
        n = Arithmetic.div(n, seven);
        m++;
        // If p^2 also divides N
        if ( Arithmetic.equ(O, Arithmetic.mod(n, seven)) ) return O;
    }

    inc = moebius.wheel.inc; i = 0;
    p = moebius.wheel.next; /* next prime * / p2 = moebius.wheel.next2;
    while (Arithmetic.lte(p2, n))
    {
        if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) )
        {
            n = Arithmetic.div(n, p);
            m++;
            // If p^2 also divides N
            if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return O;
        }
        p = Arithmetic.add(p, inc[i++]);
        if ( i === inc.length ) i = 0;
        p2 = Arithmetic.mul(p, p);
    }
    if ( 0 === m ) m = 1; /*is prime up to now* /
    return m & 1 ? I : Arithmetic.J;*/
}
function dotp( a, b, Arithmetic )
{
    Arithmetic = Arithmetic || Abacus.DefaultArithmetic;
    var c = Arithmetic.O, n = stdMath.min(a.length, b.length), i;
    for(i=0; i<n; i++)
    {
        // support dot product of polynomials as well
        if ( c instanceof Polynomial )
        {
            if ( a[i] instanceof Polynomial )
                c = c.add(a[i].mul(b[i]));
            else if ( b[i] instanceof Polynomial )
                c = c.add(b[i].mul(a[i]));
            else
                c = c.add(Arithmetic.mul(a[i], b[i]));
        }
        else
        {
            if ( a[i] instanceof Polynomial )
                c = a[i].mul(b[i]).add(c);
            else if ( b[i] instanceof Polynomial )
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
    var Arithmetic = Abacus.Arithmetic, n = v.length,
        u = new Array(n), pjj = new Array(n), ui, uj, vi, pij, i, j, k, kl, g;
    // O(k*n^2)
    for(i=0; i<n; i++)
    {
        vi = v[i]; u[i] = ui = vi.slice();
        kl = ui.length;
        for(j=0; j<i; j++)
        {
            uj = u[j]; pij = dotp(/*0===j?*/vi/*:u[j-1]*//*modified g-s*/, uj, Arithmetic);
            for(k=0; k<kl; k++) ui[k] = Arithmetic.sub(Arithmetic.mul(pjj[j], ui[k]), Arithmetic.mul(pij, uj[k]));
        }
        g = gcd(ui);
        if ( Arithmetic.gt(g, Arithmetic.I) )
            for(k=0; k<kl; k++) ui[k] = Arithmetic.div(ui[k], g);
        pjj[i] = dotp(ui, ui, Arithmetic);
    }
    return u;
}
/*function solvemod1( a, c, b, m )
{
    // solve general linear congruence equation in 1 variable:
    // ax + c = b (mod m)
    var Arithmetic = Abacus.Arithmetic,
        N = Arithmetic.num, O = Arithmetic.O,
        d, a1, b1, m1;
    // convert to appropriate numbers
    a = N(a); b = N(b||0); c = N(c||0); m = N(m);

    // simplify constant factor
    if ( !Arithmetic.equ(c, O) )
    {
        b = Arithmetic.sub(b, c);
        c = O;
        if ( Arithmetic.lt(b, O) ) b = Arithmetic.add(b, m);
    }

    // no solutions exist
    if ( Arithmetic.equ(Arithmetic.mod(m, b), O) ) return null;

    d = gcd(a, m);

    // no solutions exist
    if ( Arithmetic.equ(Arithmetic.mod(d, b), O) ) return null;

    // simplify to relative primes modulo m
    a1 = Arithmetic.div(a, d);
    b1 = Arithmetic.div(b, d);
    m1 = Arithmetic.div(m, d);

    // infinite solution(s)
    //x = x0 + a * k, k=any integer
    return [Arithmetic.mod(Arithmetic.mul(b1, invm(a1, m1)), m1), m1];
}*/
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
    Expr(xp[0], Term(param, x0[0])),
    Expr(xp[1], Term(param, x0[1]))
    ];
}
function solvedioph( a, b, with_param )
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
        pos = [], ab, sol2, tot_x, tot_y, solutions, parameters,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if ( !ok ) return null;

    // filter out zero coefficients and mark positions of non-zero coeffs to restore later
    a = a.filter(function(ai, i){
        var NZ = !Arithmetic.equ(ai, O);
        if ( NZ ) pos.push(i);
        return NZ;
    });
    k = a.length;

    if ( 0 === k )
    {
        // degenerate case where all coefficients are 0, either infinite or no solutions depending on value of b
        index = 0;
        solutions = Arithmetic.equ(b, O) ? array(ok, function(i){
            return Expr(Term(symbol+'_'+(++index)));
        }) /* infinite */ : null /* none */;
    }

    else if ( 1 === k )
    {
        // equation of 1 variable has infinite (if other zero variables) or only 1 (if only 1 variable) or 0 solutions
        index = 0;
        solutions = Arithmetic.equ(O, Arithmetic.mod(b, a[0])) ? array(ok, function(i){
            return i===pos[0] ? Expr(Arithmetic.div(b, a[0])) : Expr(Term(symbol+'_'+(++index)));
        }) /* one/infinite */: null /* none */
    }

    else if ( 2 === k )
    {
        // equation with only 2 (non-zero) variables
        sol2 = solvedioph2(a, b, symbol+'_1');
        p = 0; index = 0;
        solutions = null == sol2 ? null : array(ok, function(i){
            if ( p < pos.length && i === pos[p] )
            {
                p++;
                return sol2[p-1];
            }
            else
            {
                return Expr(Term(symbol+'_'+(pos.length+(index++))));
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
                n = b.terms[symbols[j]].c();
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
                    sol2[0] = Expr(Term(p, sol2[0].c()), sol2[0].terms[pnew]);
                    sol2[1] = Expr(Term(p, sol2[1].c()), sol2[1].terms[pnew]);
                }

                tot_x.push(sol2[0]); tot_y.push(sol2[1]);
            }
            solutions.push(Expr(tot_x));
            b = Expr(tot_y);
        }
        solutions.push(b);

        p = 0; index = 0;
        solutions = array(ok, function(i){
            if ( p < pos.length && i === pos[p] )
            {
                p++;
                return solutions[p-1];
            }
            else
            {
                return Expr(Term(symbol+'_'+(pos.length+(index++))));
            }
        });
    }

    return null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c();
    }) : solutions);
}
function solvediophs( a, b, with_param )
{
    // solve general system of m linear diophantine equations in k variables
    // a11 x_1 + a12 x_2 + a13 x_3 + .. + a1k x_k = b1, a21 x_1 + a22 x_2 + a23 x_3 + .. + a2k x_k = b2,..
    // where a is m x k-matrix of (integer) coefficients: [[a11, a12, a13, .. , a1k],..,[am1, am2, am3, .. , amk]]
    // and b is m-array right hand side factor (default [0,..,0])
    // https://arxiv.org/ftp/math/papers/0010/0010134.pdf
    // https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
        m, k, solutions = null, symbol = is_string(with_param) && with_param.length ? with_param : 'i',
        tmp, ref, pivots, rank, Rt, Tt, i, j, t, p;

    if ( !(a instanceof Matrix) ) a = Matrix(a);
    m = a.nr; if ( !m ) return null;
    k = a.nc; if ( !k ) return null;
    if ( b instanceof Matrix ) b = b.array();
    // concat with zeroes
    if ( m > b.length ) b = b.concat(array(m-b.length, function(i){return O;}));
    // A*X = B <=> iref(A.t|I) = R|T <=> iif R.t*P = B has int solutions P => X = T.t*P
    tmp = a.t().concat(Matrix.I(k)).ref(true, [k, m]);
    ref = tmp[0]; pivots = tmp[1]; rank = pivots.length;
    Tt = ref.slice(0,m,-1,-1).t(); Rt = ref.slice(0,0,k-1,m-1).t();
    p = new Array(k);

    // R.t*P can be easily solved by substitution
    for(i=0; i<k; i++)
    {
        if ( i >= rank )
        {
            p[i] = Expr(Term(symbol+'_'+(i-rank+1), I)); // free variable
        }
        else
        {
            t = O;
            for(j=0; j<i; j++)
                t = Arithmetic.add(t, Arithmetic.mul(Rt.val[i][j], p[j].c()));
            p[i] = Arithmetic.sub(b[i], t);
            if ( Arithmetic.equ(O, Rt.val[i][i]) )
            {
                if ( Arithmetic.equ(O, p[i]) ) p[i] = Expr(Term(symbol+'_'+(i+1), I)); // free variable
                else return null; // no integer solution
            }
            else if ( Arithmetic.equ(O, Arithmetic.mod(p[i], Rt.val[i][i])) )
            {
                p[i] = Expr(Arithmetic.div(p[i], Rt.val[i][i]));
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

    /*
    // solve by successive substitution
    // solve 1st equation
    var x, ith, i, e, lhs, rhs;
    lhs = a.row(0); rhs = b[0];
    x = solvedioph(lhs, rhs, symbol);
    if ( null == x ) return null; // no solution
    console.log('Eq 1: '+x.map(function(xe,ii){return 'x_'+(ii+1)+' = '+xe.toString();}).join(', '));
    for(i=1; i<m; i++)
    {
        // substitute solution of prev equation into next equation
        e = Expr(array(k, function(j){
            return j >= a.val[i].length ? O : x[j].mul(a.coeff(i,j));
        }));
        rhs = Arithmetic.sub(b[i], e.c()); e = e.sub(e.c()); // move constant term to rhs
        if ( e.equ(rhs) ) continue; // satisfied trivially, redundant equation
        else if ( e.equ(O) ) return null; // no solution
        lhs = array(k, function(j){
            var s_j = symbol+'_'+(j+1);
            // return coefficient of symbol j
            return e.terms[s_j] ? e.terms[s_j].c() : O;
        });
        console.log('Reduced '+i+': '+lhs.map(function(ai,ii){return '('+ai+'*i_'+(ii+1)+'\')';}).join(' + ')+' = '+rhs);
        ith = solvedioph(lhs, rhs, symbol); // solve new equation
        if ( null == ith ) return null; // no solution
        console.log('Reduced '+i+': '+ith.map(function(ii, jj){
            return symbol+'_'+(jj+1)+'\' = '+ii.toString();
        }).join(', '));
        // re-express original solution in terms of new reduced solution
        x = array(k, function(j){
            return Expr(array(k+1, function(n){
                var s_n = symbol+'_'+n; // nth symbol
                return 0 === n ? x[j].c() : (n<=ith.length && x[j].terms[s_n] ? ith[n-1].mul(x[j].terms[s_n].c()) : O);
            }));
        });
        console.log('Eq '+(i+1)+': '+x.map(function(xe,ii){return 'x_'+(ii+1)+' = '+xe.toString();}).join(', '));
    }
    solutions = x;
    */

    return null==solutions ? null : (false===with_param ? solutions.map(function(x){
        // return particular solution (as number), not general (as expression)
        return x.c();
    }) : solutions);
}
function solvecongr( a, b, m, with_param )
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution;
    if ( !a.length ) return null;
    solution = solvedioph(a.concat(m), b, with_param);
    // skip last variable
    return null==solution ? null : array(solution.length-1, function(i){
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
            if ( Arithmetic.gt(O, x.c()) )
                x = x.add(m);
        }
        return x;
    });

}
function solvecongrs( a, b, m, with_param )
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution, M;
    if ( !(a instanceof Matrix) ) a = Matrix(a);
    if ( !a.nr || !a.nc ) return null;
    if ( !is_array(m) && !is_args(m) && !(m instanceof Matrix) )
    {
        m = Arithmetic.num(m);
        m = array(a.nr, function(i){return m;});
    }
    if ( is_array(m) || is_args(m) ) m = Matrix(m);
    solution = solvediophs(a.concat(m), b, with_param);
    // skip last variable
    M = lcm(m.col(0));
    return null==solution ? null : array(solution.length-1, function(i){
        // make positive constant terms modulo LCM(m)
        var x = solution[i];
        if ( false === with_param )
        {
            // a particular solution (as number)
            if ( Arithmetic.gt(O, x) )
                x = Arithmetic.add(x, M);
        }
        else
        {
            // general solution (as expression)
            if ( Arithmetic.gt(O, x.c()) )
                x = x.add(M);
        }
        return x;
    });

}
function sign( x )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    return Arithmetic.equ(O, x) ? 0 : (Arithmetic.gt(O, x) ? -1 : 1);
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
            Expr(Term(param[0], s[1])),
            Expr(Term(param[0], s[0]))
        ];

    // k >= 3
    if ( 0 > sign(a[0])+sign(a[1])+sign(a[2]) )
        a = a.map(function(ai){return Arithmetic.mul(J, ai); });

    index = 0;
    for (i=0; i<k; i++)
        if ( -1 === sign(a[i]) )
            index = i; // find last negative coefficient, to be solved with respect to that

    ith = Expr(array(param.length, function(i){return Term(param[i]+'^2');}));
    L = [
        Expr([ith, Term(param[k-2]+'^2', Arithmetic.mul(J, two))])
    ].concat(array(k-2, function(i){
        return Expr(Term([param[i],param[k-2]], two));
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
    var Arithmetic = Abacus.Arithmetic;
    return Arithmetic.shl(Arithmetic.I, Arithmetic.num(n));
}
function exp( n, k )
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num;
    return Arithmetic.pow(N(n), N(k));
}
/*function fproduct( n, m )
{
    // fproduct(n,m) is a kind of factorial, n*(n-m)*(n-2m)* .....,  fproduct(n,1) is n!
    // split product of n n+1, .., m to smaller products of about equal size numbers
    // memoized and also uses pre-computed lookuptable when m=1 and n <= 12
    // https://people.eecs.berkeley.edu/~fateman/papers/factorial.pdf
    var Arithmetic = Abacus.Arithmetic, key, m2;
    if ( n <= m ) return Arithmetic.num(n);
    key = String(n);
    if ( 1 === m )
    {
        // it is already pre-computed
        if ( (12 >= n) || (null != factorial.mem1[key]) )
            return factorial(n);
    }
    key += ','+String(m);
    if ( null == fproduct.mem[key] )
    {
        m2 = m << 1;
        fproduct.mem[key] = Arithmetic.mul(fproduct(n, m2), fproduct(n-m, m2));
    }
    return fproduct.mem[key];
}
fproduct.mem = {};*/
function factorial( n, m )
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        NUM = Arithmetic.num, add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul,
        key, Nn = NUM(n), res = O, MAXMEM = Abacus.Options.MAXMEM;

    if ( null == m )
    {
        // http://www.luschny.de/math/factorial/index.html
        // https://en.wikipedia.org/wiki/Factorial
        // simple factorial = F(n) = n F(n-1) = n!
        if ( 12 >= n ) return 0 > n ? O : NUM(([1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600 /*MAX: 2147483647*/])[n]);
        key = String(n)/*+'!'*/;
        if ( null == factorial.mem1[key] )
        {
            // iterative
            //res = operate(mul, I, null, 2, n);
            // recursive and memoized
            // simple factorial = F(n) = n F(n-1) = n!
            res = mul(factorial(n-1),n);
            // https://people.eecs.berkeley.edu/~fateman/papers/factorial.pdf
            //res = fproduct(n, 1);
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn,MAXMEM) )
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
        if ( 12 >= n ) return 2 > n ? O : NUM(([1,2,9,44,265,1854,14833,133496,1334961,14684570,176214841])[n-2]);
        key = '!'+String(n);
        if ( null == factorial.mem2[key] )
        {
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            /*factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);*/
            // recursive and memoized
            // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
            res = add(n&1 ? J : I, mul(factorial(n-1,false),n));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn,MAXMEM) )
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
        if ( 18 >= n ) return 0 > n ? O : NUM(([1,1,2,4,10,26,76,232,764,2620,9496,35696,140152,568504,2390480,10349536,46206736,211799312,997313824])[n]);
        key = 'I'+String(n);
        if ( null == factorial.mem2[key] )
        {
            // recursive and memoized
            // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
            res = add(factorial(n-1,true), mul(factorial(n-2,true),n-1));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn,MAXMEM) )
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
        if ( !m.length ) return 0 > n ? O : factorial(n);
        else if ( 0 > n ) return O;
        key = String(n)+'@'+mergesort(m.slice(),1,true).join(',');
        if ( null == factorial.mem3[key] )
        {
            res = div(factorial(n), operate(function(N,mk){
                return mul(N, factorial(mk));
            }, factorial(m[m.length-1]), m, m.length-2, 0));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn,MAXMEM) )
                factorial.mem3[key] = res;
        }
        else
        {
            res = factorial.mem3[key];
        }
    }
    else if ( m === +m )
    {
        if ( 0 > m )
        {
            // selections, ie m!C(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if ( -m >= n ) return -m === n ? factorial(n) : O;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
            {
                res = operate(mul, I, null, n+m+1, n);
                // memoize only up to MAXMEM results
                if ( Arithmetic.lt(Nn,MAXMEM) )
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
            if ( (0 > m) || (1 > n) || (m > n) ) return O;
            if ( (m<<1) > n  ) m = n-m; // take advantage of symmetry
            if ( (0 === m) || (1 === n) ) return I;
            else if ( 1 === m ) return Nn;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
            {
                // recursive and memoized
                // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
                res = Arithmetic.isDefault() ? stdMath.round(operate(function(Cnm,i){
                    // this is faster and will not overflow unnecesarily for default arithmetic
                    return Cnm*(1+n/i);
                }, (n=n-m)+1, null, 2, m)) : add(factorial(n-1,m-1),factorial(n-1,m))/*div(factorial(n,-m), factorial(m))*/;
                // memoize only up to MAXMEM results
                if ( Arithmetic.lt(Nn,MAXMEM) )
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
        add = Arithmetic.add, mul = Arithmetic.mul,
        key, Nn = Arithmetic.num(n), res = O, MAXMEM = Abacus.Options.MAXMEM;

    if ( 0 > n || 0 > k ) return O;
    if ( 2 === s )
    {
        // second kind: S{n,k} = k S{n-1,k} + S{n-1,k-1}
        if ( (n === k) || (1 === k && 0 > n) ) return I;
        else if ( 0 === n || 0 === k ) return O;
        key = String(n)+','+String(k);
        if ( null == stirling.mem2[key] )
        {
            res = add(stirling(n-1,k-1,2), mul(stirling(n-1,k,2),k));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn, MAXMEM) )
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
        if ( (k > n) || (0 === k && 0 > n) ) return O;
        else if ( n === k ) return I;
        key = String(n)+','+String(k)+'-';
        if ( null == stirling.mem1[key] )
        {
            res = add(stirling(n-1,k-1,-1), mul(stirling(n-1,k,-1),-n+1));
            // memoize only up to MAXMEM results
            if ( Arithmetic.lt(Nn, MAXMEM) )
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
        if ( (k > n) || (0 === k && 0 > n) ) return O;
        else if ( n === k ) return I;
        else if ( 1 === k ) return factorial(n-1);
        /*key = '+'+String(n)+','+String(k);
        if ( null == stirling.mem1[key] )
            stirling.mem1[key] = add(stirling(n-1,k-1,1), mul(stirling(n-1,k,1),n-1));
        return stirling.mem1[key];*/
        res = (n-k)&1 ? Arithmetic.neg(stirling(n,k,-1)) : stirling(n,k,-1);
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
        add = Arithmetic.add, I = Arithmetic.I,
        p = Arithmetic.O, key, key2;
    if ( (0 > n) || (0 >= k) || (a > b) || (a+k > n+1) || (k*b < n) ) return p;
    if ( ((b === n) && (1 === k)) || ((k === n) && (1 === b)) ) return I;
    //if ( a === b ) return k*a === n ? Arithmetic.I : p;
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == p_nkab.mem[key] )
    {
        // compute it directly
        //p_nkab(n-k*(a-1), k, 1, b-a+1);
        n = n-k*(a-1); b = b-a+1;
        key2 = String(n)+','+String(k)+','+String(a)+','+String(b);
        if ( null == p_nkab.mem[key2] )
            p_nkab.mem[key2] = operate(function(p,j){
                return add(p, p_nkab(n-b, k-1, 1, j));
            }, p, null, stdMath.max(1, stdMath.ceil((n-b)/(k-1))), stdMath.min(b, n-b-k+2), 1);
        p_nkab.mem[key] = p_nkab.mem[key2];
    }
    return p_nkab.mem[key];
}
p_nkab.mem = Obj();
function partitions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    K = null == K ? null : (K|0); M = null == M ? null : (M|0);
    var Arithmetic = Abacus.Arithmetic,
        add = Arithmetic.add,
        m0 = M ? M : 0, m1 = M ? M : 1,
        k0 = K ? K : 1, k1 = K ? K : n,
        p = Arithmetic.O, k, m, key;
    if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (M && M > n) || (K && K > n) ) return p;
    if ( M && !K ) { m0 = 0; m1 = 1; k0 = M; k1 = M; K = M; M = null; } // count the conjugates, same
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == partitions.mem[key] )
    {
        partitions.mem[key] = operate(function(p,k){
            return operate(function(pk,m){
                return add(pk, p_nkab(n, k, 1, m));
            }, p, null, m1, m0?m0:n-k+1, 1);
        }, p, null, k0, k1, 1);
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
        add = Arithmetic.add, //mul = Arithmetic.mul,
        c = Arithmetic.O, I = Arithmetic.I, key;
    if ( (0 > n) || (0 >= k) || (a > b) || (a*k > n) || (k*b < n) ) return c;
    if ( 1 === k ) return a<=n && n<=b ? I : c;
    if ( n === k ) return a<=1 && 1<=b ? I : c;
    if ( a === b ) return k*a === n ? I : c;
    if ( n === b ) return factorial(n-k*a+k-1,k-1);
    if ( a+1 === b ) return factorial(k,n-k*a);
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == c_nkab.mem[key] )
    {
        // compute it directly
        c_nkab.mem[key] = operate(function(c,m){
            return add(c, c_nkab(m, k-1, a, b));
        }, c, null, stdMath.max(n-b,0), n-a, 1);
    }
    return c_nkab.mem[key];
}
c_nkab.mem = Obj();
function compositions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    K = null == K ? null : (K|0); M = null == M ? null : (M|0);
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        add = Arithmetic.add, mul = Arithmetic.mul,
        div = Arithmetic.div,
        c = O, nm, j, k, key;
    if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (M && M > n) || (K && K > n) ) return c;
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == compositions.mem[key] )
    {
        if ( K && M )
            compositions.mem[key] = K*M===n ? I : mul(c_nkab(n-M, K-1, 1, M), K)/*has some duplicates*//*(function(c,n,k,M){
                c = add(c, mul(c_nkab(n, k, 1, M-1), k+1));
                var nm = n-M, j = 1, jj = 2,
                    kk = k*(k+1), kj = k-j;
                while(0<=nm && 1<=kj)
                {
                    c = add(c, 0 === nm ? (1===kj ? I : O) : div(mul(c_nkab(nm, kj, 1, M-1), kk), jj));
                    nm-=M; j++; kj--; kk*=1+kj; jj*=1+j;
                }
                return c;
            })(c,n-M,K-1,M)*/;
        else if ( K )
            compositions.mem[key] = c_nkab(n, K, 1, n);
        else if ( M )
            compositions.mem[key] = n===M ? I : operate(function(c,k){
                return add(c, c_nkab(n, k, 1, M));
            },c,null,stdMath.ceil(n/M),n-M+1,1)/*operate(function(c,k){
                c = add(c, mul(c_nkab(n-M, k, 1, M-1), k+1));
                if ( n === k+M )
                {
                    var nm = n-M-M, j = 1, jj = 2,
                        kk = k*(k+1), kj = k-j;
                    while(0<=nm && 1<=kj)
                    {
                        c = add(c, 0 === nm ? (1===kj ? I : O) : div(mul(c_nkab(nm, kj, 1, M-1), k-j), 1));
                        nm-=M; j++; kj--; kk*=1+kj; jj*=1+j;
                    }
                }
                return c;
            },c,null,n-M,stdMath.ceil(n/M)-1,-1)*/;
        else
            compositions.mem[key] = 1 <= n ? pow2(n-1) : I;
    }
    return compositions.mem[key];
}
compositions.mem = Obj();
function catalan( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.num, div = Arithmetic.div, mul = Arithmetic.mul,
        key, Nn, res = O, MAXMEM = Abacus.Options.MAXMEM;
    // https://en.wikipedia.org/wiki/Catalan_number
    // https://rosettacode.org/wiki/Catalan_numbers
    // https://anonymouscoders.wordpress.com/2015/07/20/its-all-about-catalan/
    // catalan numbers C(n) = (4n+2)C(n-1)/(n+1)
    if ( 17 >= n ) return 0 > n ? O : NUM(([1,1,2,5,14,42,132,429,1430,4862,16796,58786,208012,742900,2674440,9694845,35357670,129644790])[n]);
    key = String(n);
    if ( null == catalan.mem[key] )
    {
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(NUM(n), MAXMEM) )
        {
            /*res = operate(function(c,i){return add(c,mul(catalan(i),catalan(n-1-i)));},O,null,0,n-1,1);*/
            res = div(mul(catalan(n-1),4*n-2),n+1);/* n -> n-1 */
            catalan.mem[key] = res;
        }
        else
        {
            res = div(factorial(2*n, n), n+1) /*operate(function(c, k){
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
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.num, add = Arithmetic.add, mul = Arithmetic.mul,
        key, Nn, res = O, MAXMEM = Abacus.Options.MAXMEM;
    // https://en.wikipedia.org/wiki/Bell_number
    // https://en.wikipedia.org/wiki/Bell_triangle
    // http://fredrikj.net/blog/2015/08/computing-bell-numbers/
    // bell numbers B(n) = SUM[k:0->n-1] ( C(n-1,k) B(k) )
    if ( 14 >= n ) return 0 > n ? O : NUM(([1,1,2,5,15,52,203,877,4140,21147,115975,678570,4213597,27644437,190899322])[n]);
    key = String(n);
    if ( null == bell.mem[key] )
    {
        res = operate(function(b,k){return add(b,mul(factorial(n-1,k),bell(k)));},O,null,0,n-1,1);
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(NUM(n), MAXMEM) )
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
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.num, k, f1, f0,
        key, Nn, res = O, MAXMEM = Abacus.Options.MAXMEM;
    // http://en.wikipedia.org/wiki/Fibonacci_number
    // fibonacci numbers F(n) = F(n-1) + F(n-2)
    if ( 36 >= n ) return 0 > n ? O : NUM(([0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765,10946,17711,28657,46368,75025,121393,196418,317811,514229,832040,1346269,2178309,3524578,5702887,9227465,14930352])[n]);
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
        k = n >>> 1;
        f1 = fibonacci(k+1); f0 = fibonacci(k);
        if ( n&1 ) // 2k+1
            res = Arithmetic.add(Arithmetic.mul(f1,f1), Arithmetic.mul(f0,f0));
        else // 2k
            res = Arithmetic.mul(f0, Arithmetic.sub(Arithmetic.mul(f1, Arithmetic.II), f0));
        // memoize only up to MAXMEM results
        if ( Arithmetic.lt(NUM(n), MAXMEM) )
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
    k = +k;
    if ( 3 > k ) return null;
    n = NUM(n);
    number = Arithmetic.div(Arithmetic.mul(n, Arithmetic.sub(Arithmetic.mul(n, k-2), k-4)), two);
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
/*function parse_combinatorial_tpl( tpl )
{
    tpl = String(tpl||'');
    var l = tpl.length, i, j, k, p, c, s, n, m,
        paren, N = 0, data = [], position = [];

    i = 0; p = 0;
    while( i < l )
    {
        c = tpl.charAt(i++);
        if ( '(' === c )
        {
            paren = 1; s = '';
            while( i < l )
            {
                c = tpl.charAt(i++);
                if ( '(' === c )
                {
                    paren++;
                }
                else if ( ')' === c )
                {
                    paren--;
                    if ( 0 === paren ) break;
                }
                s += c;
            }
            s = trim(s);
            m = s.length ? (s.match(not_in_set_re) || s.match(in_set_re) || pos_test_re.test(s)) : null;

            if ( !m )
            {
                // any term
                n = 1;
                if ( '{' === tpl.charAt(i) )
                {
                    // repeat
                    i += 1; s = '';
                    while( i < l )
                    {
                        c = tpl.charAt(i++);
                        if ( '}' === c ) break;
                        s += c;
                    }
                    s = trim(s); n = s.length ? (parseInt(s,10)||1) : 1;
                }
                p += n; N = p+1;
            }
            else
            {
                // conditional term at position p
                data.push(s); position.push(p++); N = p;
            }
        }
    }
    return {n:N, data:data, position:position};
}*/
function summation( a, b, Arithmetic, do_subtraction )
{
    // O(max(n1,n2))
    var i, j, n1 = a.length, n2 = b.length, c;
    if ( Arithmetic )
    {
        c = array(stdMath.max(n1, n2), do_subtraction ? function(i){
            return i >= n1 ? Arithmetic.mul(Arithmetic.J, b[i]) : (i >= n2 ? a[i] : Arithmetic.sub(a[i], b[i]));
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
    if ( Arithmetic )
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
/*function swap( M, i, j, axis )
{
    var n = M.length, m = M[0].length, t, k, l;
    axis = (axis || "rows").toLowerCase();
    if ( "rows" === axis )
    {
        for(k=0; k<m; k++)
        {
            t = M[i][k];
            M[i][k] = M[j][k];
            M[j][k] = t;
        }
    }
    else if ( ("cols" === axis) || ("columns" === axis) )
    {
        for(k=0; k<n; k++)
        {
            t = M[k][i];
            M[k][i] = M[k][j];
            M[k][j] = t;
        }
    }
    return M;
}*/
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
function rndInt( m, M )
{
    return stdMath.round( (M-m)*Abacus.Math.rnd( ) + m );
}

Abacus.Class = Class;

// options
Abacus.Options = {
    MAXMEM: 1000000,
    RANDOM: "index"
};

DefaultArithmetic = Abacus.DefaultArithmetic = { // keep default arithmetic as distinct

 // whether using default arithmetic or using external implementation (eg big-int or other)
 isDefault: function( ){ return true; }
,isNumber: function( x ) {
    var Arithmetic = this;
    if ( Arithmetic.isDefault() ) return is_number(x);
    return is_number(x) || (x instanceof Arithmetic.O[CLASS]);
}

,J: -1
,O: 0
,I: 1
,II: 2
,INF: {valueOf: function(){return Infinity;}, toString: function(){return "Infinity";}} // a representation of Infinity
,NINF: {valueOf: function(){return -Infinity;}, toString: function(){return "-Infinity";}} // a representation of -Infinity

,nums: function( a ) {
    if ( is_array(a) || is_args(a) )
    {
        for(var i=0,l=a.length; i<l; i++) a[i] = this.nums(a[i]); // recursive
        return a;
    }
    return this.num(a);
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
    return powsq(Arithmetic.num(b), Arithmetic.num(e));
}
,addm: function( a, b, m ) {
    var Arithmetic = Abacus.Arithmetic;
    return addm(Arithmetic.num(a), Arithmetic.num(b), Arithmetic.num(m));
}
,negm: function( a, m ) {
    var Arithmetic = Abacus.Arithmetic;
    return negm(Arithmetic.num(a), Arithmetic.num(m));
}
,mulm: function( a, b, m ) {
    var Arithmetic = Abacus.Arithmetic;
    return mulm(Arithmetic.num(a), Arithmetic.num(b), Arithmetic.num(m));
}
,invm: function( a, m ) {
    var Arithmetic = Abacus.Arithmetic;
    return invm(Arithmetic.num(a), Arithmetic.num(m));
}
,powm: function( a, b, m ) {
    var Arithmetic = Abacus.Arithmetic;
    return powm(Arithmetic.num(a), Arithmetic.num(b), Arithmetic.num(m));
}
,isqrt: function( a ) {
    var Arithmetic = Abacus.Arithmetic;
    return isqrt(Arithmetic.num(a));
}
,ikthroot: function( a, k ) {
    var Arithmetic = Abacus.Arithmetic;
    return ikthroot(Arithmetic.num(a), +k);
}
,isqrtp: function( a, p ) {
    var Arithmetic = Abacus.Arithmetic;
    return isqrtp(Arithmetic.num(a), Arithmetic.num(p));
}
,ilog: function( x, b ) {
    var Arithmetic = Abacus.Arithmetic;
    return ilog(Arithmetic.num(x), Arithmetic.num(b));
}
,gcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return gcd(Arithmetic.nums(args));
}
,xgcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return xgcd(Arithmetic.nums(args));
}
,polygcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return polygcd(array(args.length, function(i){return !(args[i] instanceof Polynomial) ? new Polynomial([Arithmetic.num(args[i])]) : args[i];}));
}
,polyxgcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return polyxgcd(array(args.length, function(i){return !(args[i] instanceof Polynomial) ? new Polynomial([Arithmetic.num(args[i])]) : args[i];}));
}
,lcm: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return lcm(Arithmetic.nums(args));
}
,polylcm: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && (is_array(arguments[0])||is_args(arguments[0])) ? arguments[0] : arguments;
    return polylcm(array(args.length, function(i){return !(args[i] instanceof Polynomial) ? new Polynomial([Arithmetic.num(args[i])]) : args[i];}));
}
,dotp: function( a, b ) {
    var Arithmetic = Abacus.Arithmetic;
    return (is_array(a)||is_args(a)) && (is_array(b)||is_args(b)) ? dotp(a, b, Arithmetic) : Arithmetic.O;
}
,gramschmidt: function( v ) {
    return (is_array(v)||is_args(v)) && v.length ? gramschmidt(v) : [];
}
,divisors: function( n, as_generator ) {
    var Arithmetic = Abacus.Arithmetic;
    return divisors(Arithmetic.num(n), as_generator);
}
,legendre: function( a, p ) {
    var Arithmetic = Abacus.Arithmetic;
    return legendre_symbol(Arithmetic.num(a), Arithmetic.num(p));
}
,jacobi: function( a, n ) {
    var Arithmetic = Abacus.Arithmetic;
    return jacobi_symbol(Arithmetic.num(a), Arithmetic.num(n));
}
,moebius: function( n ) {
    var Arithmetic = Abacus.Arithmetic;
    return moebius(Arithmetic.num(n));
}
,pollardRho: function( n, s, a, retries, max_steps, F ) {
    var N = Abacus.Arithmetic.num;
    return pollard_rho(N(n), null==s?null:N(s), null==a?null:N(a), retries, max_steps||null, F||null);
}
,factorize: function( n ) {
    return factorize(Abacus.Arithmetic.num(n));
}
,isProbablePrime: function( n ) {
    var Arithmetic = Abacus.Arithmetic;
    return is_probable_prime(Arithmetic.num(n));
}
,isPrime: function( n ) {
    var Arithmetic = Abacus.Arithmetic;
    return is_prime(Arithmetic.num(n));
}
,nextPrime: function( n, dir ) {
    var Arithmetic = Abacus.Arithmetic;
    return next_prime(Arithmetic.num(n), dir);
}

,diophantine: function( a, b, with_param ) {
    var Arithmetic = Abacus.Arithmetic;
    if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
    return solvedioph(Arithmetic.nums(a), Arithmetic.num(b||0), with_param);
}
,diophantines: function( a, b, with_param ) {
    var Arithmetic = Abacus.Arithmetic;
    if ( !(a instanceof Matrix) && !is_array(a) && !is_args(a) ) return null;
    if ( (a instanceof Matrix) && (!a.nr || !a.nc) ) return null;
    if ( !(a instanceof Matrix) && !a.length ) return null;
    a = a instanceof Matrix ? a : Arithmetic.nums(a);
    if ( !(b instanceof Matrix) && !is_array(b) && !is_args(b) ) b = array(a instanceof Matrix ? a.nr : a.length, function(){return b||0;});
    b = b instanceof Matrix ? b : Arithmetic.nums(b);
    return solvediophs(a, b, with_param);
}
,congruence: function( a, b, m, with_param ) {
    var Arithmetic = Abacus.Arithmetic;
    if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
    return solvecongr(Arithmetic.nums(a), Arithmetic.num(b||0), Arithmetic.num(m||0), with_param);
}
,congruences: function( a, b, m, with_param ) {
    var Arithmetic = Abacus.Arithmetic;
    if ( !(a instanceof Matrix) && !is_array(a) && !is_args(a) ) return null;
    if ( (a instanceof Matrix) && (!a.nr || !a.nc) ) return null;
    if ( !(a instanceof Matrix) && !a.length ) return null;
    a = a instanceof Matrix ? a : Arithmetic.nums(a);
    if ( !(b instanceof Matrix) && !is_array(b) && !is_args(b) ) b = array(a instanceof Matrix ? a.nr : a.length, function(){return b||0;});
    b = b instanceof Matrix ? b : Arithmetic.nums(b);
    if ( !(m instanceof Matrix) && !is_array(m) && !is_args(m) ) m = array(a instanceof Matrix ? a.nr : a.length, function(){return m||0;});
    m = m instanceof Matrix ? m : Arithmetic.nums(m);
    return solvecongrs(a, b, m, with_param);
}
,pythagorean: function( a, with_param ) {
    var Arithmetic = Abacus.Arithmetic;
    if ( (!is_array(a) && !is_args(a)) || !a.length ) return null;
    return solvepythag(Arithmetic.nums(a), with_param)
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
,search: binarysearch
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

};

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

// Abacus.Node, Node class which can represent (dynamic) Linked Lists, Binary Trees and similar structures
Node = Abacus.Node = function Node(value, left, right, top) {
    var self = this;
    if ( !(self instanceof Node) ) return new Node(value, left, right, top);

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

/*Cache = Abacus.Cache = function Cache(MAX_ITEMS, MAX_TIME) {
    var self = this, storage, nitems;
    if ( !(self instanceof Cache) ) return new Cache(MAX_ITEMS, MAX_TIME);

    MAX_ITEMS = null == MAX_ITEMS ? Infinity : +MAX_ITEMS;
    MAX_TIME = null == MAX_TIME ? null : (+MAX_TIME)*1000;
    storage = Obj(); nitems = 0;

    self.dispose = function( ) {
        storage = null;
        nitems = 0;
        return self;
    };
    self.set = function( key, val ) {
        key = String(key);
        if ( !storage[key] && (nitems+1 >= MAX_ITEMS) )
        {
            // which one to delete
        }
        if ( !storage[key] ) nitems++;
        storage[key] = [val, null==MAX_TIME ? null : new Date().getTime()+MAX_TIME];
    };
    self.get = function( key ) {
    };
    self.has = function( key ) {
    };
    self.del = function( key ) {
        key = String(key);
        if ( storage[key] )
        {
            delete storage[key];
            nitems--;
        }
        return self;
    };
};*/

// Abacus.Term, represents multiplicative terms in (linear) algebraic expressions, including terms with mixed factors of (powers of) symbolic variables
Term = Abacus.Term = Class({

    constructor: function Term( s, c ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !(self instanceof Term) ) return new Term(s, c);

        self.factors = Obj();
        self.factors['1'] = null == c ? Arithmetic.I : c; // default
        if ( !Arithmetic.equ(Arithmetic.O, self.factors['1']) ) Term.Merge(s, self);
        Term.Symbol(self);
    }

    ,__static__: {
        Merge: function( factors, T, remove ) {
            var Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                keys, i, l;

            function merge_factor( f, e ) {
                var i = f.indexOf('^'); // eg x^2
                e = e || O;
                if ( -1 !== i )
                {
                    e = /*Arithmetic.add(e,*/Arithmetic.num(f.slice(i+1))/*)*/;
                    f = f.slice(0, i);
                }
                if ( ('1' === f) || !f.length ) return; // handled elsewhere
                if ( -1 === remove )
                {
                    if ( T.factors[f] )
                    {
                        T.factors[f] = Arithmetic.sub(T.factors[f], e);
                        if ( Arithmetic.gte(O, T.factors[f]) ) delete T.factors[f];
                    }
                }
                else
                {
                    if ( !T.factors[f] ) T.factors[f] = e;
                    else T.factors[f] = Arithmetic.add(T.factors[f], e);
                    //if ( Arithmetic.gte(O, T.factors[f]) ) delete T.factors[f];
                }
            };

            if ( is_array(factors) || is_args(factors) )
            {
                for(i=0,l=factors.length; i<l; i++)
                    merge_factor(String(factors[i]), I);
            }
            else if ( /*Arithmetic.isNumber(factors)*/('1' === factors) || (1 === factors) || (Arithmetic.isNumber(factors) && Arithmetic.equ(I, factors)) )
            {
                // skip, handled elsewhere
                //merge_factor(String(factors), I);
            }
            else if ( is_string(factors) )
            {
                merge_factor(factors, I);
            }
            else if ( is_obj(factors) )
            {
                for(keys=KEYS(factors),i=0,l=keys.length; i<l; i++)
                    merge_factor(keys[i], Arithmetic.num(factors[keys[i]]));
            }
            return T;
        }
        ,Symbol: function( T ) {
            var Arithmetic = Abacus.Arithmetic, I = Arithmetic.I;
            T._symb = null;
            T.symbol = T.symbols().reduce(function(s, f){
                var e = T.factors[f];
                return s + ('1' === f ? '' : ((s.length ? '*' : '') + (Arithmetic.equ(I, e) ? f : (f+'^'+String(e)))));
            }, '');
            if ( !T.symbol.length ) T.symbol = '1'; // default constant term
            return T;
        }
    }

    ,factors: null
    ,symbol: null
    ,_str: null
    ,_n: null
    ,_symb: null

    ,dispose: function( ) {
        var self = this;
        self.factors = null;
        self.symbol = null;
        self._str = null;
        self._n = null;
        self._symb = null;
        return self;
    }

    ,clone: function( ) {
        var f = this.factors;
        return new Term(f, f['1']);
    }

    ,symbols: function( ) {
        var self = this;
        if ( null == self._symb ) self._symb = KEYS(self.factors).sort();
        return self._symb;
    }
    ,c: function( ) {
        return this.factors['1'];
    }
    ,equ: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if ( Arithmetic.isNumber(a) )
            return Arithmetic.equ(O, a) ? Arithmetic.equ(O, self.factors['1']) : (('1' === self.symbol) && Arithmetic.equ(self.factors['1'], a));
        else if ( a instanceof Term )
            return (a.equ(O) && self.equ(O)) || ((self.symbol === a.symbol) && Arithmetic.equ(self.factors['1'], a.factors['1']));
        else if ( (a instanceof Expr) || (a instanceof Polynomial) )
            return a.equ(self);
        else if ( is_string(a) )
            return a === self.toString();
        return false;
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = Term(self.factors, Arithmetic.neg(self.factors['1']));
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) )
            return Term(self.factors, Arithmetic.add(self.factors['1'], a));
        else if ( a instanceof Term )
            return self.symbol===a.symbol ? Term(self.factors, Arithmetic.add(self.factors['1'], a.factors['1'])) : Expr([self, a]);
        else if ( a instanceof Expr )
            return a.add(self);
        else if ( a instanceof Polynomial )
            return a.toExpr().add(self);
        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) )
            return Term(self.factors, Arithmetic.sub(self.factors['1'], a));
        else if ( a instanceof Term )
            return self.symbol===a.symbol ? Term(self.factors, Arithmetic.sub(self.factors['1'], a.factors['1'])) : Expr([self, a.neg()]);
        else if ( a instanceof Expr )
            return Expr([self, a.neg()]);
        else if ( a instanceof Polynomial )
            return Expr([self, a.neg().toExpr()]);
        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, T;
        if ( Arithmetic.isNumber(a) )
        {
            return Term(self.factors, Arithmetic.mul(self.factors['1'], a));
        }
        else if ( a instanceof Term )
        {
            T = Term(self.factors,  Arithmetic.mul(self.factors['1'], a.factors['1']));
            if ( !Arithmetic.equ(O, T.factors['1']) ) Term.Merge(a.factors, T);
            Term.Symbol(T);
            return T;
        }
        else if ( (a instanceof Expr) || (a instanceof Polynomial) )
        {
            return a.mul(self);
        }
        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, T;
        if ( Arithmetic.isNumber(a) )
        {
            return Term(self.factors, Arithmetic.div(self.factors['1'], a));
        }
        else if ( a instanceof Term )
        {
            T = Term(self.factors, Arithmetic.div(self.factors['1'], a.factors['1']));
            if ( !Arithmetic.equ(O, T.factors['1']) ) Term.Merge(a.factors, T, -1);
            Term.Symbol(T);
            return T;
        }
        return self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        if ( Arithmetic.isNumber(n) )
        {
            if ( Arithmetic.gt(O, n) ) return null;
            if ( self.equ(O) ) return Term(1, O);
            if ( Arithmetic.equ(O, n) ) return Term(1, I);
            if ( Arithmetic.equ(I, n) ) return Term(self.factors, self.factors['1']);
            factors = {};
            for(f in self.factors)
            {
                if ( !HAS.call(self.factors, f) || ('1' === f) ) continue;
                factors[f] = Arithmetic.mul(self.factors[f], n);
            }
            return Term(factors, Arithmetic.pow(self.factors['1'], n));
        }
        return self;
    }
    ,valueOf: function( symbolValues ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, res;
        symbolValues = symbolValues || {};
        if ( '1'===self.symbol ) res = self.factors['1'];
        else res = self.symbols().reduce(function(r, f){
            if ( Arithmetic.equ(O, r) ) return O;
            var e = self.factors[f], x = symbolValues[f] || O,
                t = '1' === f ? e : (Arithmetic.equ(O, x) ? O : (Arithmetic.equ(I, e) ? x : Arithmetic.pow(x, e)));
            return Arithmetic.mul(r, t);
        }, I);
        return res;
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._str )
        {
            self._str = ('1'===self.symbol) ? String(self.factors['1']) : ((Arithmetic.equ(Arithmetic.J, self.factors['1']) ? '-' : (Arithmetic.equ(Arithmetic.I, self.factors['1']) ? '' : (String(self.factors['1'])+'*'))) + self.symbol);
        }
        return self._str;
    }
});
// Abacus.Expr, represents (symbolic) (linear) algebraic expressions of sums of (multiplicative) terms
Expr = Abacus.Expr = Class({

    constructor: function Expr( /* args */ ) {
        var self = this, i, l,
            terms = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;

        if ( !(self instanceof Expr) ) return new Expr(terms);

        self.terms = Obj();
        self.terms['1'] = Term(1, Abacus.Arithmetic.O); // constant term is default
        for(i=0,l=terms.length; i<l; i++) Expr.Merge(terms[i], self);
    }

    ,__static__: {
        Merge: function Merge( x, E ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            if ( Arithmetic.isNumber(x) )
            {
                if ( E.terms['1'] )
                {
                    E.terms['1'] = E.terms['1'].add(x);
                }
                else
                {
                    E.terms['1'] = Term(1, x);
                }
            }
            else if ( x instanceof Term )
            {
                if ( E.terms[x.symbol] )
                {
                    E.terms[x.symbol] = E.terms[x.symbol].add(x);
                    if ( '1' !== x.symbol && Arithmetic.equ(O, E.terms[x.symbol].factors['1']) ) delete E.terms[x.symbol];
                }
                else if ( ('1' === x.symbol) || !Arithmetic.equ(O, x.factors['1']) )
                {
                    E.terms[x.symbol] = x;
                }
            }
            else if ( (x instanceof Expr) || (x instanceof Polynomial) )
            {
                if ( x instanceof Polynomial ) x = x.toExpr();
                for(var i=0,keys=x.symbols(),l=keys.length; i<l; i++)
                    Merge(x.terms[keys[i]], E);
            }
            return E;
        }
    }

    ,terms: null
    ,_str: null
    ,_n: null
    ,_symb: null

    ,dispose: function( ) {
        var self = this;
        self.terms = null;
        self._str = null;
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
    ,c: function( ) {
        return this.terms['1'].c();
    }
    ,equ: function ( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, l, keys;
        if ( Arithmetic.isNumber(a) )
        {
            return (1 === self.symbols().length) && self.terms['1'].equ(a);
        }
        else if ( a instanceof Term )
        {
            return '1' === a.symbol ? ((1 === self.symbols().length) && self.terms['1'].equ(a)) : (HAS.call(self.terms, a.symbol) && (2 === self.symbols().length) && self.terms['1'].equ(O) && self.terms[a.symbol].equ(a));
        }
        else if ( (a instanceof Expr) || (a instanceof Polynomial) )
        {
            if ( a instanceof Polynomial ) a = a.toExpr();
            keys = a.symbols(); l = keys.length;
            if ( self.symbols().length !== l ) return false;
            for(i=0; i<l; i++)
                if ( !HAS.call(self.terms, keys[i]) || !a.terms[keys[i]].equ(self.terms[keys[i]]) )
                    return false;
            return true;
        }
        else if ( is_string(a) )
        {
            return a === self.toString();
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
    ,inv: NotImplemented

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return Arithmetic.isNumber(x) || (x instanceof Term) || (x instanceof Expr) || (x instanceof Polynomial) ? Expr([self, x]) : self;
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(x) ) return self.add(Arithmetic.neg(x));
        else if ( (x instanceof Term) || (x instanceof Expr) || (x instanceof Polynomial) ) return self.add(x.neg());
        return self;
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            symbols, symbols2;
        if ( Arithmetic.isNumber(x) || (x instanceof Term) )
        {
            if ( self.equ(O) || ((x instanceof Term) && x.equ(O)) || (Arithmetic.isNumber(x) && Arithmetic.equ(O, x)) ) return Expr();
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].mul(x);
            }));
        }
        else if ( (x instanceof Expr) || (x instanceof Polynomial) )
        {
            if ( x instanceof Polynomial ) x = x.toExpr();
            if ( self.equ(O) || x.equ(O) ) return Expr();
            symbols = self.symbols(); symbols2 = x.symbols();
            return Expr(array(symbols.length*symbols2.length, function(k){
                var i = ~~(k/symbols2.length), j = k%symbols2.length;
                return self.terms[symbols[i]].mul(x.terms[symbols2[j]]);
            }));
        }
        return self;
    }
    ,div: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, symbols;
        if ( Arithmetic.isNumber(x) || (x instanceof Term) )
        {
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].div(x);
            }));
        }
        return self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, pow, e;
        if ( Arithmetic.isNumber(n) )
        {
            if ( Arithmetic.gt(O, n) || Arithmetic.gt(n, MAX_DEFAULT) ) return null;
            if ( self.equ(O) ) return Expr();
            if ( Arithmetic.equ(O, n) ) return Expr([Term(1, I)]);
            if ( Arithmetic.equ(I, n) ) return Expr(self.args());
            n = Arithmetic.val(n);
            e = self; pow = Expr([Term(1, I)]);
            while( 0 !== n )
            {
                // exponentiation by squaring
                if ( n & 1 ) pow = pow.mul(e);
                n >>= 1;
                e = e.mul(e);
            }
            return pow;
        }
        return self;
    }
    ,valueOf: function( symbolValues ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        symbolValues = symbolValues || {};
        return self.symbols().reduce(function(r, t){
            return Arithmetic.add(r, self.terms[t].valueOf(symbolValues));
        }, O);
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            keys, i, l, out = '', prev = false;
        if ( null == self._str )
        {
            keys = self.symbols(); l = keys.length;
            for(i=0; i<l; i++)
            {
                if ( self.terms[keys[i]].equ(O) ) continue;
                out += (prev && Arithmetic.lt(O, self.terms[keys[i]].factors['1']) ? '+' : '') + self.terms[keys[i]].toString();
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
});
// Abacus.Polynomial, represents a (univariate) polynomial
Polynomial = Abacus.Polynomial = Class({

    constructor: function Polynomial( coeff, symbol ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;

        if ( !(self instanceof Polynomial) ) return new Polynomial(coeff, symbol);

        if ( is_obj(coeff) )
            // sparse representation, object with keys only to existing powers
            // convert to dense coefficient representation
            self.coeff = array(KEYS(coeff).reduce(function(M, k){k = +k; return k > M ? k : M;}, 0)+1, function(i){
                return HAS.call(coeff, i) ? coeff[i] : O;
            });
        else
            // dense representation, array with all powers
            self.coeff = coeff && coeff.length ? (is_args(coeff) ? slice.call(coeff) : coeff) : [O];

        self.symbol = String(symbol || 'x');

        Polynomial.Degree(self);
    }

    ,__static__: {
        Degree: function( P ) {
            var Arithmetic = Abacus.Arithmetic, i = P.coeff.length-1;
            while(0<i && Arithmetic.equ(Arithmetic.O, P.coeff[i])) i--;
            // truncate to first non-zero coefficient
            P.coeff.length = i+1;
            return P;
        }

        ,Add: function( x, P, do_sub ) {
            var Arithmetic = Abacus.Arithmetic;
            if ( do_sub )
            {
                // substraction
                if ( Arithmetic.isNumber(x) )
                {
                    // O(1)
                    P.coeff[0] = Arithmetic.sub(P.coeff[0], x);
                }
                else if ( x instanceof Polynomial )
                {
                    // O(max(n1,n2))
                    P.coeff = summation(P.coeff, x.coeff, Arithmetic, true);
                    Polynomial.Degree(P);
                }
                return P;
            }
            if ( Arithmetic.isNumber(x) )
            {
                // O(1)
                P.coeff[0] = Arithmetic.add(P.coeff[0], x);
            }
            else if ( x instanceof Polynomial )
            {
                P.coeff = summation(P.coeff, x.coeff, Arithmetic);
                Polynomial.Degree(P);
            }
            return P;
        }

        ,Mul: function( x, P ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i;
            if ( Arithmetic.isNumber(x) )
            {
                // O(n)
                if ( Arithmetic.equ(O, x) )
                {
                    P.coeff = [O];
                }
                else if ( Arithmetic.equ(Arithmetic.I, x) )
                {
                    // do nothing
                }
                else
                {
                    for(i=P.coeff.length-1; i>=0; i--)
                        P.coeff[i] = Arithmetic.mul(P.coeff[i], x);
                }
            }
            else if ( x instanceof Polynomial )
            {
                P.coeff = convolution(P.coeff, x.coeff, Arithmetic);
                Polynomial.Degree(P);
            }
            return P;
        }

        ,C: function( c, x ) {
            return new Polynomial([c || Abacus.Arithmetic.O], x || 'x');
        }

        ,fromExpr: function( e, x ) {
            if ( !(e instanceof Expr) ) return null;
            x = String(x || 'x');
            var symbols = e.symbols(), i, s, t, coeff = {};
            for(i=symbols.length-1; i>=0; i--)
            {
                s = symbols[i]; t = e.terms[s];
                if ( '1' === s )
                    coeff['0'] = t.c();
                else if ( x === s )
                    coeff['1'] = t.c();
                else if ( (s.length > x.length+1) && (x+'^' === s.slice(0, x.length+1)) && (-1===s.indexOf('*')) )
                    coeff[s.slice(x.length+1)] = t.c();
            }
            return new Polynomial(coeff, x);
        }
    }

    ,coeff: null
    ,symbol: null
    ,_str: null
    ,_n: null
    ,_expr: null

    ,dispose: function( ) {
        var self = this;
        self.coeff = null;
        self.symbol = null;
        self._str = null;
        self._n = null;
        //if ( self._expr ) self._expr.dispose();
        self._expr = null;
        return self;
    }

    ,clone: function( symbol ) {
        var self = this;
        return new Polynomial(self.coeff.slice(), symbol || self.symbol);
    }

    ,deg: function( ) {
        // polynomial degree
        return this.coeff.length-1;
    }
    ,lead: function( ) {
        // leading coefficient
        var c = this.coeff;
        return c[c.length-1];
    }
    ,c: function( ) {
        // constant coefficient
        return this.coeff[0];
    }
    ,equ: function( p ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            c = self.coeff, cp, s, i;
        if ( Arithmetic.isNumber(p) )
        {
            return (1===c.length) && Arithmetic.equ(c[0], p);
        }
        else if ( p instanceof Polynomial )
        {
            cp = p.coeff;
            if ( c.length !== cp.length ) return false;
            for(i=c.length-1; i>=0; i--)
                if ( !Arithmetic.equ(c[i], cp[i]) )
                    return false;
            return true;
        }
        else if ( p instanceof Term )
        {
            s = 1 === c.length ? '1' : (2 === c.length ? self.symbol : (self.symbol+'^'+(c.length-1)));
            if ( (s !== p.symbol) || !Arithmetic.equ(c[c.length-1], p.c()) ) return false;
            for(i=c.length-2; i>=0; i--)
                if ( !Arithmetic.equ(Arithmetic.O, c[i]) )
                    return false;
            return true;
        }
        else if ( p instanceof Expr )
        {
            return self.toExpr().equ(p);
        }
        else if ( is_string(p) )
        {
            return p === self.toString();
        }
        return false;
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = Polynomial(array(self.coeff.length, function(i){return Arithmetic.neg(self.coeff[i]);}), self.symbol);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return ((x instanceof Expr) || (x instanceof Term)) ? self.toExpr().add(x) : (Arithmetic.isNumber(x) || (x instanceof Polynomial) ? Polynomial.Add(x, Polynomial(self.coeff.slice(), self.symbol)) : self);
    }
    ,sub: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return ((x instanceof Expr) || (x instanceof Term)) ? self.toExpr().sub(x) : (Arithmetic.isNumber(x) || (x instanceof Polynomial) ? Polynomial.Add(x, Polynomial(self.coeff.slice(), self.symbol), true) : self);
    }
    ,mul: function( x ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return ((x instanceof Expr) || (x instanceof Term)) ? self.toExpr().mul(x) : (Arithmetic.isNumber(x) || (x instanceof Polynomial) ? Polynomial.Mul(x, Polynomial(self.coeff.slice(), self.symbol)) : self);
    }
    ,div: function( x, q_and_r ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I,
            q, r, r0, d, diff, diff0;
        if ( Arithmetic.isNumber(x) )
        {
            q = Polynomial(Arithmetic.equ(I, x) ? self.coeff.slice() : array(self.coeff.length, function(i){
                return Arithmetic.div(self.coeff[i], x);
            }), self.symbol);
            return q_and_r ? [q, Polynomial([O], self.symbol)] : q;
        }
        else if ( x instanceof Polynomial )
        {
            // polynomial division
            r = Polynomial(self.coeff.slice(), self.symbol);
            diff = r.deg()-x.deg();
            if ( 0 <= diff )
            {
                q = array(diff+1, function(){return O;});
                while ( 0 <= diff )
                {
                    /*r0 = r;*/ diff0 = diff;
                    d = x.shift(diff);
                    q[diff] = Arithmetic.div(r.lead(), d.lead());
                    r = r.sub( d.mul( q[diff] ) );
                    diff = r.deg()-x.deg();
                    if ( (diff === diff0) /* || r.equ(r0)*/ ) break; // remainder won't change anymore
                }
            }
            else
            {
                q = [O];
            }
            q = Polynomial(q, self.symbol);
            // return both quotient and remainder if requested
            return q_and_r ? [q, r] : q;
        }
        return self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        if ( !Arithmetic.isNumber(n) || Arithmetic.gt(Arithmetic.O, n) || Arithmetic.gt(n, MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n);
        if ( 0 === n )
        {
            return Polynomial([Arithmetic.I], self.symbol);
        }
        else if ( 1 === n )
        {
            return Polynomial(self.coeff.slice(), self.symbol);
        }
        else if ( 2 === n )
        {
            return Polynomial.Mul(self, Polynomial(self.coeff, self.symbol));
        }
        else
        {
            // exponentiation by squaring
            pow = Polynomial([Arithmetic.I], self.symbol);
            b = Polynomial(self.coeff, self.symbol);
            while ( 0 !== n )
            {
                if ( n & 1 ) pow = Polynomial.Mul(b, pow);
                n >>= 1;
                b = Polynomial.Mul(b, b);
            }
            return pow;
        }
    }
    ,shift: function( s ) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, Arithmetic = Abacus.Arithmetic;
        s = Arithmetic.val(s);
        if ( 0 === s )
            return Polynomial(self.coeff.slice(), self.symbol);
        else if ( 0 > s )
            return Polynomial(array(stdMath.max(0,self.coeff.length+s), function(i){
                return self.coeff[i-s];
            }), self.symbol);
        //else if ( 0 < s )
        return Polynomial(array(self.coeff.length+s, function(i){
            return i < s ? Arithmetic.O : self.coeff[i-s];
        }), self.symbol);
    }
    ,deriv: function( ) {
        // polynomial derivative
        var self = this, Arithmetic = Abacus.Arithmetic;
        return Polynomial(array(stdMath.max(0, self.coeff.length-1), function(i){
            return Arithmetic.mul(self.coeff[i+1], i+1);
        }), self.symbol);
    }
    ,valueOf: function( x ) {
        // Horner's algorithm for fast evaluation
        // https://en.wikipedia.org/wiki/Horner%27s_method
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            c = self.coeff, i, v;
        x = x || O;
        if ( Arithmetic.equ(O, x) ) return c[0];
        i = c.length-1; v = c[i];
        while(i--) v = Arithmetic.add(c[i], Arithmetic.mul(v, x));
        return v;
    }
    ,toString: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            c, x, i, out = '', prev = false;
        if ( null == self._str )
        {
            c = self.coeff; x = self.symbol;
            for(i=c.length-1; i>=0; i--)
            {
                if ( Arithmetic.equ(O, c[i]) ) continue;
                out += (prev && Arithmetic.lt(O, c[i]) ? '+' : '') + (0===i ? c[i].toString() : (Arithmetic.equ(Arithmetic.I, c[i]) ? '' : (Arithmetic.equ(Arithmetic.J, c[i]) ? '-' : (c[i].toString()+'*')))) + (0!==i ? (x+(1!==i?('^'+String(i)):'')) : '');
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toExpr: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            c, x, i, terms;
        if ( null == self._expr )
        {
            x = self.symbol; c = self.coeff; terms = [];
            for(i=c.length-1; i>=0; i--)
            {
                if ( Arithmetic.equ(O, c[i]) ) continue;
                terms.push(Term(0===i?'1':(1===i?x:(x+'^'+String(i))), c[i]));
            }
            if ( !terms.length ) terms.push(Term(1, O));
            self._expr = Expr(terms);
        }
        return self._expr;
    }
});
// Abacus.Matrix, represents a (2-dimensional) matrix with integer coefficients
Matrix = Abacus.Matrix = Class({

    constructor: function Matrix( r, c ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !(self instanceof Matrix) ) return new Matrix(r, c);

        if ( is_array(r) || is_args(r) )
        {
            if ( !is_array(r[0]) && !is_args(r[0]) )
            {
                self.val = c ? /*row*/array(1, function(i){
                    return array(r.length, function(j){
                        return r[j];
                    });
                }) : /*column*/array(r.length, function(i){
                    return array(1, function(j){
                        return r[i];
                    });
                });
            }
            else
            {
                if ( is_args(r) ) r = slice.call(r);
                if ( is_args(r[0]) ) r = r.map(function(ri){return slice.call(ri);});
                self.val = r;
            }
        }
        else //if ( is_number(r) && is_number(c) )
        {
            if ( null == c ) c = r; // square
            r = +(r||0); c = +(c||0);
            self.val = array(r, function(i){
                return array(c, function(j){
                    return Arithmetic.O;
                });
            });
        }
        self.nr = self.val.length;
        self.nc = self.nr ? self.val[0].length : 0;
    }

    ,__static__: {
        C: function( r, c, v ) {
            var Arithmetic = Abacus.Arithmetic;
            v = v || Arithmetic.O;
            if ( null == c ) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(array(r, function(i){
                return array(c, function(j){
                    return v;
                });
            }));
        }
        ,D: function( r, c, v ) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            v = v || O;
            if ( null == c ) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(array(r, function(i){
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
        ,I: function( n ) {
            return Matrix.D(n, n, Abacus.Arithmetic.I);
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
        ,ARR: function( a, r, c ) {
            // shape 1-D array into an r x c matrix
            return Matrix(array(r, function(i){
                return array(c, function(j){
                    var k = i*c + j;
                    return k < a.length ? a[k] : Abacus.Arithmetic.O;
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
        ,ADDR: function( m, i, j, a, b, k0 ) {
            // add (a multiple of) row j to (a multiple of) row i
            var Arithmetic = Abacus.Arithmetic, k, n = m[0].length;
            if ( null == a ) a = Arithmetic.I;
            if ( null == b ) b = Arithmetic.I;
            for(k=k0||0; k<n; k++)
                m[i][k] = Arithmetic.add(Arithmetic.mul(b, m[i][k]), Arithmetic.mul(a, m[j][k]));
            return m;
        }
        ,ADDC: function( m, i, j, a, b, k0 ) {
            // add (a multiple of) column j to (a multiple of) column i
            var Arithmetic = Abacus.Arithmetic, k, n = m.length;
            if ( null == a ) a = Arithmetic.I;
            if ( null == b ) b = Arithmetic.I;
            for(k=k0||0; k<n; k++)
                m[k][i] = Arithmetic.add(Arithmetic.mul(b, m[k][i]), Arithmetic.mul(a, m[k][j]));
            return m;
        }
        ,MULR: function( m, i0, i1, a, b, c, d ) {
            var Arithmetic = Abacus.Arithmetic, j, l = m[0].length, x, y;
            for (j=0; j<l; j++)
            {
                x = m[i0][j]; y = m[i1][j];
                m[i0][j] = Arithmetic.add(Arithmetic.mul(a, x), Arithmetic.mul(b, y));
                m[i1][j] = Arithmetic.add(Arithmetic.mul(c, x), Arithmetic.mul(d, y));
            }
            return m;
        }
        ,MULC: function( m, j0, j1, a, b, c, d ) {
            var Arithmetic = Abacus.Arithmetic, i, l = m.length, x, y;
            for (i=0; i<l; i++)
            {
                x = m[i][j0]; y = m[i][j1];
                m[i][j0] = Arithmetic.add(Arithmetic.mul(a, x), Arithmetic.mul(c, y));
                m[i][j1] = Arithmetic.add(Arithmetic.mul(b, x), Arithmetic.mul(d, y));
            }
            return m;
        }
    }

    ,nr: 0
    ,nc: 0
    ,val: null
    ,_str: null
    ,_n: null
    ,_t: null
    ,_snf: null
    ,_ref: null
    ,_rref: null
    ,_rn: null
    ,_ln: null
    ,_rs: null
    ,_cs: null
    ,_tr: null
    ,_det: null

    ,dispose: function( ) {
        var self = this;
        self._str = null;
        self._n = null;
        self._t = null;
        self._snf = null;
        self._ref = null;
        self._rref = null;
        self._rn = null;
        self._ln = null;
        self._rs = null;
        self._cs = null;
        self._tr = null;
        self._det = null;
        self.nr = null;
        self.nc = null;
        self.val = null;
        return self;
    }

    ,clone: function( raw ) {
        var m = this.val.map(function(vi){return vi.slice();});
        return raw ? m : Matrix(m);
    }
    ,row: function( r ) {
        var self = this;
        return 0<=r && r<self.nr ? array(self.nc, function(j){return self.val[r][j];}) : null;
    }
    ,col: function( c ) {
        var self = this;
        return 0<=c && c<self.nc ? array(self.nr, function(i){return self.val[i][c];}) : null;
    }
    ,array: function( ) {
        var self = this;
        // return matrix as 1-D array of stacking row after row
        return array(self.nr*self.nc, function(k){
            return self.val[~~(k / self.nc)][k % self.nc];
        });
    }
    ,diag: function( k ) {
        // k = 0 chooses center diagonal, k>0 chooses diagonal to the right, k<0 diagonal to the left
        var self = this, r, c;
        k = k || 0; r = 0 < k ? 0 : -k; c = r ? 0 : k;
        return 0<=c && c<self.nc && 0<=r && r<self.nr ? array(stdMath.min(self.nr-r, self.nc-c), function(i){return self.val[r+i][c+i];}) : null;
    }
    ,coeff: function( r, c, v ) {
        var self = this, rows = self.nr, columns = self.nc;
        if ( 0 > r ) r += rows;
        if ( 0 > c ) c += columns;
        if ( !(0<=r && r<rows && 0<=c && c<columns) ) return null==v ? null : self;
        if ( null != v )
        {
            if ( self.val[r][c] !== v )
            {
                // force update of associated cached entries
                self._str = null;
                self._n = null;
                self._t = null;
                self._snf = null;
                self._ref = null;
                self._rref = null;
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

    ,equ: function( a, eq_all ) {
        var self = this, Arithmetic = Abacus.Arithmetic, i, j, r = self.nr, c = self.nc;
        if ( Arithmetic.isNumber(a) )
        {
            if ( eq_all )
            {
                for(i=0; i<r; i++)
                    for(j=0; j<c; j++)
                        if ( !Arithmetic.equ(self.val[i][j], a) )
                            return false;
                return true;
            }
            else
            {
                return (1===r) && (1===c) && Arithmetic.equ(self.val[0][0], a);
            }
        }
        else if ( a instanceof Matrix )
        {
            if ( (r !== a.nr) || (c !== a.nc) ) return false;
            for(i=0; i<r; i++)
                for(j=0; j<c; j++)
                    if ( !Arithmetic.equ(self.val[i][j], a.val[i][j]) )
                        return false;
            return true;
        }
        return false;
    }
    ,t: function( ) {
        // transpose
        var self = this;
        if ( null == self._t )
        {
            self._t = Matrix(Matrix.T(self.val));
            self._t._t = self; // avoid recomputations we have it already
            self._t._tr = self._tr; // same for transpose
            self._t._det = self._det; // same for transpose
        }
        return self._t;
    }
    ,neg: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( null == self._n )
        {
            self._n = Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.neg(vij);
                });
            }));
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) )
        {
            return Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.add(vij, a);
                });
            }));
        }
        else if ( a instanceof Matrix )
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= a.nr ) return self.val[i].slice();
                else if ( i >= self.nr ) return a.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= a.nc ) return self.val[i][j];
                    else if ( j >= self.nc ) return a.val[i][j];
                    return Arithmetic.add(self.val[i][j], a.val[i][j]);
                });
            }));
        }
        return self;
    }
    ,sub: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, J = Arithmetic.J;
        if ( Arithmetic.isNumber(a) )
        {
            return Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.sub(vij, a);
                });
            }));
        }
        else if ( a instanceof Matrix )
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= a.nr ) return self.val[i].slice();
                else if ( i >= self.nr ) return a.val[i].map(function(aij){return Arithmetic.mul(J, aij);});
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= a.nc ) return self.val[i][j];
                    else if ( j >= self.nc ) return Arithmetic.mul(J, a.val[i][j]);
                    return Arithmetic.sub(self.val[i][j], a.val[i][j]);
                });
            }));
        }
        return self;
    }
    ,mul: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, n;
        if ( Arithmetic.isNumber(a) )
        {
            return Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.mul(vij, a);
                });
            }));
        }
        else if ( a instanceof Matrix )
        {
            //if ( self.nc !== a.nr ) return null; // dims do not match for multiplication
            n = stdMath.min(self.nc, a.nr); // generalise multiplication
            return Matrix(array(self.nr, function(i){
                return array(a.nc, function(j){
                    for(var d=Arithmetic.O,k=0; k<n; k++)
                        d = Arithmetic.add(d, Arithmetic.mul(self.val[i][k], a.val[k][j]));
                    return d;
                });
            }));
        }
        return self;
    }
    ,dot: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        // pointwise multiplication
        if ( Arithmetic.isNumber(a) )
        {
            return self.mul(a);
        }
        else if ( a instanceof Matrix )
        {
            return Matrix(array(stdMath.max(self.nr, a.nr), function(i){
                if ( i >= self.nr ) return a.val[i].slice();
                else if ( i >= a.nr ) return self.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j){
                    if ( j >= self.nc ) return a.val[i][j];
                    else if ( j >= a.nc ) return self.val[i][j];
                    return Arithmetic.mul(self.val[i][j], a.val[i][j]);
                })
            }));
        }
        return self;
    }
    ,kron: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic, r1, c1, r2, c2, r, c;
        // kronecker product
        if ( Arithmetic.isNumber(a) )
        {
            return self.mul(a);
        }
        else if ( a instanceof Matrix )
        {
            r1 = self.nr; c1 = self.nc;
            r2 = a.nr; c2 = a.nc;
            r = r1*r2; c = c1*c2;
            return Matrix(array(r, function(i){
                var i1 = ~~(i / r2), i2 = i % r2;
                return array(c, function(j){
                    var j1 = ~~(j / c2), j2 = j % c2;
                    return Arithmetic.mul(self.val[i1][j1], a.val[i2][j2]);
                });
            }));
        }
        return self;
    }
    ,div: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) )
        {
            return Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.div(vij, a);
                });
            }));
        }
        return self;
    }
    ,mod: function( a ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( Arithmetic.isNumber(a) )
        {
            return Matrix(self.val.map(function(vi){
                return vi.map(function(vij){
                    return Arithmetic.mod(vij, a);
                });
            }));
        }
        return self;
    }
    ,pow: function( n ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        if ( !Arithmetic.isNumber(n) || Arithmetic.gt(Arithmetic.O, n) || Arithmetic.gt(n, MAX_DEFAULT) ) return null;
        n = Arithmetic.val(n);
        if ( 0 === n )
        {
            return Matrix.I(/*stdMath.min(self.nr,*/ self.nc/*)*/);
        }
        else if ( 1 === n )
        {
            return self.clone();
        }
        else if ( 2 === n )
        {
            return self.mul(self);
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
    /*,ge2: function( ) {
        // reduced form of gaussian elimination
        // https://www.cs.umd.edu/~gasarch/TOPICS/factoring/fastgauss.pdf
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, two = Arithmetic.II,
            n = self.nr, m = self.nc, M = self.clone(true), i, j, k, l, row, marks, num, sol_rows;
        marks = new Array(m);

        for (i=0; i<n; i++) //do for all rows
        {
            row = M[i];
            for (j=0; j<m; j++) //search for pivot
            {
                num = row[j];
                if ( Arithmetic.equ(I, num) )
                {
                    marks[j] = true;
                    for (k=0; k<n; k++) //search for other 1s in the same column
                    {
                        if ( i === k ) continue;
                        if ( Arithmetic.equ(I, M[k][j]) )
                            for (l=0; l<m; l++)
                                M[k][l] = Arithmetic.mod(Arithmetic.add(M[k][l], row[l]), two);
                    }
                    break;
                }
            }
        }

        M = Matrix.T(M);

        sol_rows = [];
        for (i=0; i<m; i++) //find free columns (which have now become rows)
            if ( !marks[i] )
                sol_rows.push([M[i], i]);

        return [Matrix(M), sol_rows.length ? sol_rows : null, marks];
    }
    ,ge: function( b ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, j, k, p, t,
            n = stdMath.min(self.nr, self.nc), a = self.clone(true);
        // fraction-free gaussian elimination with exact integer arithmetic
        // O(n^3)
        if ( is_array(b) )
        {
            // if solving system
            b = b.slice();
            n = stdMath.min(n, b.length);
        }
        else
        {
            b = null;
        }
        for(i=0; i<n-1; i++)
        {
            if ( Arithmetic.equ(O, a[i][i]) )
            {
                // search for pivot
                p = -1;
                for(k=i+1; k<n; k++)
                {
                    if ( !Arithmetic.equ(O, a[k][i]) )
                    {
                        p = k;
                        break;
                    }
                }
                if ( -1 === p ) break;
                Matrix.SWAPR(a, i, p);
                if ( b )
                {
                    t = b[i];
                    b[i] = b[p];
                    b[p] = t;
                }
            }
            for(j=i+1; j<n; j++)
            {
                // if solving system
                if ( b ) b[j] = Arithmetic.sub(Arithmetic.mul(a[i][i], b[j]), Arithmetic.mul(a[j][i], b[i]));
                for(k=i+1; k<n; k++)
                    a[j][k] = Arithmetic.sub(Arithmetic.mul(a[i][i], a[j][k]), Arithmetic.mul(a[j][i], a[i][k]));
                a[j][i] = O;
            }
            if ( /*2* /1 <= i )
            {
                // removal of common factors
                for(j=i+1; j<n; j++)
                {
                    if ( b ) b[j] = Arithmetic.div(b[j], a[i-1][i-1]);
                    for(k=i+1; k<n; k++)
                        a[j][k] = Arithmetic.div(a[j][k], a[i-1][i-1]);
                }
            }
        }
        return b ? [Matrix(a), b] : Matrix(a);
    }*/
    ,fwdsub: function( b ) {
        // self is assumed lower triangular
        var self = this, Arithmetic = Abacus.Arithmetic, i, j, t, L = self.val,
            n = stdMath.min(self.nr, self.nc, b.length), x = new Array(n);
        // fraction-free forward substitution
        for(i=0; i<n; i++)
        {
            t = Arithmetic.O;
            for(j=0; j<i; j++)
                t = Arithmetic.add(t, Arithmetic.mul(L[i][j], x[j]));
            x[i] = Arithmetic.sub(Arithmetic.mul(L[i][i], b[i]), t);
            //x[i] = Arithmetic.div(x[i], L[i][i]);
        }
        return x;
    }
    ,backsub: function( b ) {
        // self is assumed upper triangular
        var self = this, Arithmetic = Abacus.Arithmetic, i, j, t, U = self.val,
            n = stdMath.min(self.nr, self.nc, b.length), x = new Array(n);
        // fraction-free back substitution
        for(i=n-1; i>=0; i--)
        {
            t = Arithmetic.O;
            for(j=n-1; j>i; j--)
                t = Arithmetic.sub(t, Arithmetic.mul(U[i][j], x[j]));
            x[i] = Arithmetic.sub(Arithmetic.mul(U[i][i], b[i]), t);
            //x[i] = Arithmetic.div(x[i], U[i][i]);
        }
        return x;
    }
    ,snf: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            rows = self.nr, columns = self.nc, dim, m, left, right, last_j,
            i, j, upd, ii, jj, non_zero, i1, i0, g, coef1, coef2, coef3, coef4, coef5, tmp, tmp2;
        // smith normal form
        // adapted from Smith Normal Form with sympy (https://gist.github.com/qnighy/ec08799484080343a2da297657ccba65)
        if ( null == self._snf )
        {
            dim = stdMath.min(rows, columns);
            m = self.clone(); left = Matrix.I(rows); right = Matrix.I(columns)
            last_j = -1;
            for(i=0; i<rows; i++)
            {
                non_zero = false;
                for(j=last_j+1; j<columns; j++)
                {
                    for(i0=0; i0<rows; i0++)
                        if ( !Arithmetic.equ(O, m.val[i0][j]) )
                            break;
                    if ( i0 < rows )
                    {
                        non_zero = true;
                        break;
                    }
                }
                if ( !non_zero ) break;

                if ( Arithmetic.equ(O, m.val[i][j]) )
                {
                    for(ii=0; ii<rows; ii++)
                        if ( !Arithmetic.equ(O, m.val[ii][j]) )
                            break;
                    Matrix.MULR(m.val, i, ii, O, I, I, O);
                    Matrix.MULC(left.val, i, ii, O, I, I, O);
                }
                Matrix.MULC(m.val, j, i, O, I, I, O);
                Matrix.MULR(right.val, j, i, O, I, I, O);
                j = i;
                upd = true;
                while ( upd )
                {
                    upd = false;
                    for(ii=i+1; ii<rows; ii++)
                    {
                        if ( Arithmetic.equ(O, m.val[ii][j]) ) continue;
                        upd = true;
                        if ( !Arithmetic.equ(O, Arithmetic.mod(m.val[ii][j], m.val[i][j])) )
                        {
                            g = xgcd(m.val[i][j], m.val[ii][j]);
                            coef1 = g[1]; coef2 = g[2];
                            coef3 = Arithmetic.div(m.val[ii][j], g[0]);
                            coef4 = Arithmetic.div(m.val[i][j], g[0]);
                            Matrix.MULR(m.val, i, ii, coef1, coef2, Arithmetic.mul(J, coef3), coef4);
                            Matrix.MULC(left.val, i, ii, coef4, Arithmetic.mul(J, coef2), coef3, coef1);
                        }
                        coef5 = Arithmetic.div(m.val[ii][j], m.val[i][j]);
                        Matrix.MULR(m.val, i, ii, I, O, -coef5, I);
                        Matrix.MULC(left.val, i, ii, I, O, coef5, I);
                    }
                    for(jj=j+1; jj<columns; jj++)
                    {
                        if ( Arithmetic.equ(O, m.val[i][jj]) ) continue;
                        upd = true;
                        if ( !Arithmetic.equ(O, Arithmetic.mod(m.val[i][jj], m.val[i][j])) )
                        {
                            g = xgcd(m.val[i][j], m.val[i][jj]);
                            coef1 = g[1]; coef2 = g[2];
                            coef3 = Arithmetic.div(m.val[i][jj], g[0]);
                            coef4 = Arithmetic.div(m.val[i][j], g[0]);
                            Matrix.MULC(m.val, j, jj, coef1, Arithmetic.mul(J, coef3), coef2, coef4);
                            Matrix.MULR(right.val, j, jj, coef4, coef3, Arithmetic.mul(J, coef2), coef1);
                        }
                        coef5 = Arithmetic.div(m.val[i][jj], m.val[i][j]);
                        Matrix.MULC(m.val, j, jj, I, Arithmetic.mul(J, coef5), O, I);
                        Matrix.MULR(right.val, j, jj, I, coef5, O, I);
                    }
                }
                last_j = j;
            }
            for(i1=0; i1<dim; i1++)
            {
                for(i0=i1-1; i0>=0; i0--)
                {
                    g = xgcd(m.val[i0][i0], m.val[i1][i1]);
                    if ( Arithmetic.equ(O, g[0]) ) continue;
                    coef1 = g[1]; coef2 = g[2];
                    coef3 = Arithmetic.div(m.val[i1][i1], g[0]);
                    coef4 = Arithmetic.div(m.val[i0][i0], g[0]);
                    tmp = Arithmetic.mul(coef2, coef3);
                    tmp2 = Arithmetic.sub(I, Arithmetic.mul(coef1, coef4));
                    Matrix.MULR(m.val, i0, i1, I, coef2, coef3, Arithmetic.sub(tmp, I));
                    Matrix.MULC(left.val, i0, i1, Arithmetic.sub(I, tmp), coef2, coef3, J);
                    Matrix.MULC(m.val, i0, i1, coef1, tmp2, I, Arithmetic.mul(J, coef4));
                    Matrix.MULR(right.val, i0, i1, coef4, tmp2, I, Arithmetic.mul(J, coef1));
                }
            }
            self._snf = [m/*diagonal center matrix*/, left/*left matrix*/, right/*right matrix*/];
        }
        return self._snf.slice();
    }
    ,ref: function( with_pivots, odim ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            rows = self.nr, columns = self.nc, dim, pivots, det, pl = 0, r, i, i0, p0, lead, imin, im, min, a, z, m;
        // integer row echelon form (ref)
        if ( null == self._ref )
        {
            dim = columns;
            // original dimensions, eg when having augmented matrix
            if ( is_array(odim) ) dim = stdMath.min(dim, odim[1]);
            m = self.clone(true);
            pivots = new Array(dim);
            lead = 0; det = I;
            function find_dupl( k0, k ) {
                k = k || 0;
                for(var p=pl-1; p>=0; p--)
                    if ( k0===pivots[p][k] )
                        return p;
                return -1;
            }
            for (r=0; r<rows; r++)
            {
                if ( dim <= lead ) break;

                i = r;
                while ( Arithmetic.equ(O, m[i][lead]) )
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
                    a = Arithmetic.abs(m[i][lead]);
                    if ( Arithmetic.equ(O, a) ) z++;
                    else if ( (null == min) || Arithmetic.lt(a, min) ) { min = a; imin = i; }
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
                            det = Arithmetic.neg(det);
                        }
                        if ( Arithmetic.gt(O, m[r][lead]) )
                        {
                            Matrix.ADDR(m, r, r, O, J, lead); // make it positive
                            // determinant is multiplied by same constant for row multiplication, here simply changes sign
                            det = Arithmetic.mul(J, det);
                        }
                        i = imin; i0 = r;
                        while ( (0<=i) && (-1!==(p0=find_dupl(i))) ){ i0 -= pl-p0; i = i0; }
                        pivots[pl++] = [i, lead]; // row/column of pivot
                        // update determinant
                        det = r<dim ? Arithmetic.mul(det, m[r][r/*lead*/]) : O;
                        break;
                    }
                    else
                    {
                        z = 0; im = imin;
                        for(i=i0; i<rows; i++)
                        {
                            if ( i === im ) continue;
                            // subtract min row from other rows
                            Matrix.ADDR(m, i, im, Arithmetic.mul(J, Arithmetic.div(m[i][lead], m[imin][lead])), I, lead);
                            // determinant does not change for this operation

                            // find again row with min abs value for this column as well for next round
                            a = Arithmetic.abs(m[i][lead]);
                            if ( Arithmetic.equ(O, a) ) z++;
                            else if ( Arithmetic.lt(a, min) ) { min = a; imin = i; }
                        }
                    }
                }while(true);

                lead++;
            }
            if ( !pl ) det = O;

            m = new Matrix(m);
            // truncate if needed
            if ( pivots.length > pl ) pivots.length = pl;

            self._ref = [m, pivots, det];
        }
        return with_pivots ? self._ref.slice() : self._ref[0];
    }
    ,rref: function( with_pivots, odim ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            rows = self.nr, columns = self.nc, dim, pivots, det, pl,
            lead, r, i, j, a, g, ref;
        // integer reduced row echelon form (rref)
        if ( null == self._rref )
        {
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
                    if ( Arithmetic.equ(O, a.val[i][lead]) ) continue;

                    Matrix.ADDR(a.val, i, r, Arithmetic.mul(J, a.val[i][lead]), a.val[r][lead]);
                    // are following 2 lines redundant since we are already in REF??
                    if ( Arithmetic.gt(O, a.val[i][pivots[i][1]]) ) // 1 make leading entry positive again
                        Matrix.ADDR(a.val, i, i, O, J, pivots[i][1]);
                    if ( Arithmetic.lt(I, g=gcd(a.val[i])) ) // 2 remove any common factor, simplify
                        for (j=0; j<columns; j++) a.val[i][j] = Arithmetic.div(a.val[i][j], g);
                }
            }
            self._rref = [a, pivots, det];

            /*
            // compute rref directly
            // adapted from http://people.sc.fsu.edu/~jburkardt%20/py_src/row_echelon_integer/row_echelon_integer.html
            dim = columns; //stdMath.min(rows, columns);
            // original dimensions, eg when having augmented matrix
            if ( is_array(odim) ) dim = stdMath.min(dim, /*odim[0],* / odim[1]);
            a = self.clone(true);
            pivots = new Array(dim);
            lead = 0;
            for (r=0; r<rows; r++)
            {
                if ( dim <= lead ) break;
                //  Start I at row R, and search for nonzero pivot entry A(I,LEAD).
                i = r;
                while ( Arithmetic.equ(O, a[i][lead]) )
                {
                    i++;
                    //  If reach last row, reset I to R, and increment LEAD.
                    if ( rows <= i )
                    {
                        i = r;
                        lead++;
                        //  If reach last column, we can find no more pivots.
                        if ( dim <= lead )
                        {
                            lead = -1;
                            break;
                        }
                    }
                }
                if ( 0 > lead ) break; // nothing to do

                pivots[pl++] = [i, lead];

                //  Move pivot I into row R.
                if ( i !== r ) Matrix.SWAPR(a, i, r);

                //  Ensure pivot is positive.
                if ( Arithmetic.gt(O, a[r][lead]) ) Matrix.ADDR(a, r, r, O, J);

                //  Remove any common factor from row R.
                if ( Arithmetic.lt(I, g=gcd(a[r])) )
                    for (j=0; j<columns; j++)
                        a[r][j] = Arithmetic.div(a[r][j], g);

                //  Use a multiple of A(R,LEAD) to eliminate A(R+1:M,LEAD).
                for (i=0; i<rows; i++)
                {
                    if ( i == r ) continue;
                    Matrix.ADDR(a, i, r, Arithmetic.mul(J, a[i][lead]), a[r][lead]);
                    if ( Arithmetic.lt(I, g=gcd(a[i])) )
                        for (j=0; j<columns; j++)
                            a[i][j] = Arithmetic.div(a[i][j], g);
                }
                lead++;
            }
            a = new Matrix(a);
            // truncate if needed
            if ( pivots.length > pl ) pivots.length = pl;
            self._rref = [a, pivots];*/
        }
        return with_pivots ? self._rref.slice() : self._rref[0];
    }
    ,rank: function( ) {
        var pivots = this.ref(true);
        return pivots[1].length;
    }
    ,tr: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, n, i;
        // trace
        if ( null == self._tr )
        {
            n = stdMath.min(self.nr, self.nc);
            self._tr = Arithmetic.O;
            for(i=0; i<n; i++) self._tr = Arithmetic.add(self._tr, self.val[i][i]);
        }
        return self._tr;
    }
    ,det: function( ) {
        var self = this, ref;
        // determinant
        if ( null == self._det )
        {
            if ( self.nr !== self.nc )
            {
                self._det = Abacus.Arithmetic.O;
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
        var self = this, Arithmetic = Abacus.Arithmetic, pivots;
        // rowspace
        if ( null == self._rs )
        {
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._rs = gramschmidt(pivots[1].map(function(p){
                return /*Matrix([*/self.row(p[0])/*])*/;
            })).map(function(vec){
                return Matrix([vec]);
            }); // row vector
        }
        return self._rs.slice();
    }
    ,colspace: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, pivots;
        // columnspace
        if ( null == self._cs )
        {
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._cs = gramschmidt(pivots[1].map(function(p){
                return /*Matrix(*/self.col(p[1])/*)*/;
            })).map(function(vec){
                return Matrix(vec);
            }); // column vector
        }
        return self._cs.slice();
    }
    ,nullspace: function( left_else_right ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            columns = self.nc, rref, pivots, free_vars, pl, tmp, LCM;

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
                tmp = self.rref(true); rref = tmp[0]; pivots = tmp[1];
                pl = pivots.length;
                free_vars = complement(columns, pivots.map(function(p){return p[1];}));
                // exact integer rref, find LCM of pivots
                LCM = pl ? lcm(pivots.map(function(p, i){return rref.val[i][p[1]];})) : I;
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
                            vec[i] = Arithmetic.sub(vec[i], Arithmetic.mul(Arithmetic.div(LCM, rref.val[p][i]), rref.val[p][free_var]));
                        }
                    }
                    if ( !Arithmetic.equ(O, g=gcd(vec)) )
                        // remove common factors, simplify
                        for(i=0; i<columns; i++) vec[i] = Arithmetic.div(vec[i], g);

                    return Matrix(vec); // column vector
                });
            }
            return self._rn.slice();
        }
    }
    ,slice: function( r1, c1, r2, c2 ) {
        var self = this, rows = self.nr, columns = self.nc;
        if ( !rows || !columns ) return Matrix();
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
        return r1<=r2 && c1<=c2 ? Matrix(array(r2-r1+1, function(i){
            return array(c2-c1+1, function(j){
                return self.val[r1+i][c1+j];
            });
        })) : Matrix();
    }
    ,concat: function( a, axis ) {
        var self = this, O = Abacus.Arithmetic.O;
        if ( !(a instanceof Matrix) ) return self;
        axis = axis || 'horizontal';
        if ( 'vertical' === axis )
        {
            // | self |
            // | ---- |
            // |  a   |
            return Matrix(array(self.nr+a.nr, function(i){
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
            return Matrix(array(stdMath.max(self.nr, a.nr), function(i){
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
    ,toString: function( ) {
        var self = this, max;
        if ( null == self._str )
        {
            // compute length of greatest num in matrix so to pad other nums same to aling properly
            max = self.val.reduce(function(max, vi){
                return vi.reduce(function(max, vij){
                    var sij = String(vij);
                    if ( sij.length > max ) max = sij.length;
                    return max;
                }, max);
            }, 0);
            self._str = self.val.map(function(vi){
                return vi.map(function(vij){
                    return pad(String(vij), max);
                }).join(' ');
            }).join("\n");
        }
        return self._str;
    }
});

// Abacus.BiArray, Packed Bit Array Implementation
Abacus.BitArray = Class({

    constructor: function BitArray(n) {
        var self = this;
        if ( !(self instanceof BitArray) ) return new BitArray(n);
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
        var a = this.toArray( ), i, l;
        for(i=0,l=a.length; i<l; i++) a[i] = to_fixed_binary_string_32(a[i]);
        return a.join('');
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

// Abacus.Filter, Filter class used to define and combine filters to filter combinatorial object by them
Filter = Abacus.Filter = Class({

    constructor: function Filter( filter ) {
        var self = this;
        if ( !(self instanceof Filter) ) return new Filter(filter);
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
        if ( is_callable(otherFilter) || (otherFilter instanceof Filter) )
        {
            if ( !(otherFilter instanceof Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) || otherFilter.apply(item, this); });
        }
        return self;
    }

    ,XOR: function( otherFilter ) {
        var self = this;
        if ( is_callable(otherFilter) || (otherFilter instanceof Filter) )
        {
            if ( !(otherFilter instanceof Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){
                var r1 = self.apply(item, this), r2 = otherFilter.apply(item, this);
                return (r1 && !r2) || ((!r1) && r2);
            });
        }
        return self;
    }

    ,AND: function( otherFilter ) {
        var self = this;
        if ( is_callable(otherFilter) || (otherFilter instanceof Filter) )
        {
            if ( !(otherFilter instanceof Filter) ) otherFilter = Filter(otherFilter);
            return Filter(function(item){ return self.apply(item, this) && otherFilter.apply(item, this); });
        }
        return self;
    }
});


// Base Iterator Interface & Abstract Class
Iterator = Abacus.Iterator = Class({

    constructor: function Iterator( name, $ ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if ( !(self instanceof Iterator) ) return new Iterator( name, $ );
        if ( (is_array(name) || is_args(name)) && (name[0] instanceof Iterator || name[name.length-1] instanceof Iterator) )
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
            if ( !(self instanceof Iterable) ) return new Iterable(iter, dir);
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
        else if ( (filter instanceof Filter) || is_callable(filter) )
        {
            $.filter = filter instanceof Filter ? filter : Filter(filter);
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
        else if ( (iter instanceof Iterator) && is_callable(method) )
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
        if ( !(self instanceof CombinatorialIterator) ) return new CombinatorialIterator(name, n, $, sub);
        klass = self[CLASS];
        if ( (is_array(name) || is_args(name)) && (name[0] instanceof CombinatorialIterator || name[name.length-1] instanceof CombinatorialIterator) )
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
        if ( sub && (sub.iter instanceof CombinatorialIterator) )
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
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                var reflected = -1===dir;
                complementation(item, item, N, reflected ? n-(item[n]||1) : 0, reflected ? n-1 : item[n]-1);
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
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                var itemlen, reflected = -1===dir;
                item = reflected ? item.slice(n-item[n],n) : item.slice(0,item[n]);
                item = complement(N, item, true);
                itemlen = item.length;
                if ( itemlen<n ) item[reflected?"unshift":"push"].apply(item, new Array(n-itemlen));
                item.push(itemlen);
            }
            else
            {
                item = complement(N, item);
            }
            return item;
         }
        ,P: function( item, n, dir ) {
            // P process / symmetry, ie Reflection/Parity, PP = I
            if ( n+1===item.length )
            {
                // fixed-length item, with effective length as extra last pos
                if ( -1===dir )
                    item = shift(item, reflection(item, item, n, n-(item[n]||1), n-1), -n+item[n], n-(item[n]||1), n-1);
                else
                    item = shift(item, reflection(item, item, n, 0, item[n]-1), n-item[n], 0, item[n]-1);
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
        else if ( (combIter instanceof CombinatorialIterator) && is_callable(method) )
        {
            if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
            $.subpos = pos || self.position();
            $super.call(self, method, combIter, dir);
        }
        return self;
    }

    ,multiplyWith: function( combIter, pos, dir ) {
        var self = this, $ = self.$;
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        if ( combIter instanceof CombinatorialIterator )
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
        // compute and store any extra item information
        // needed between successive runs to run faster, eg cat or loopless, instead of linear
        this.item__ = null;
        return this;
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
        if ( !arguments.length ) return this.$.sub /*&& !non_recursive*/ ? this._subindex : this._index;

        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            n = self.n, $ = self.$, tot = $.sub && !non_recursive ? $.subcount : $.count,
            curindex = $.sub && !non_recursive ? self._subindex : self._index,
            order = $.order, tot_1/*, dir = REVERSED & order ? -1 : 1*/; // T

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
});

// a iterator for arithmetic progressions from MIN up to MAX, by step=STEP
Progression = Abacus.Progression = Class(Iterator, {

    constructor: function Progression( min, step, max, $ ) {
        var self = this, Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
            O = Arithmetic.O, I = Arithmetic.I;
        if ( !(self instanceof Progression) ) return new Progression(min, step, max, $);
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
        self._min = N(min||0);
        self._step = N(null==step?1:step);
        self._max = null==max ? Arithmetic.INF : (Arithmetic.INF===max ? max : N(max));

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

                self._item = self.output(self.__item);
            }
        }
        else
        {
            self.__item = self._min;
            self._item = self.output(self.__item);
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
                self._item = null==self.__item ? null : self.output(self.__item);
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
});

HashSieve = function HashSieve( ) {
    var self = this, _hash = null;

    if ( !(self instanceof HashSieve) ) return new HashSieve();

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
        var first = iter.next(), key/*, Arithmetic = Abacus.Arithmetic*/;
        /*if ( null != number )
        {
            while((null!=first) && Arithmetic.lt(first, number) )
                first = iter.next();
        }*/
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

        if ( !(self instanceof PrimeSieve) ) return new PrimeSieve($);

        $ = $ || {};
        $.type = String($.type || "eratosthenes").toLowerCase();
        $.count = Arithmetic.I; // infinite

        // (Eratosthenes) Sieve with pre-computed small primes list
        self._multiples = new HashSieve();
        self._small_primes = small_primes();
        if ( !self._small_primes.length ) self._small_primes = [Arithmetic.II]; // first prime
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

            output = self.output(prime);
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
        $ = n.length && !(n[n.length-1] instanceof CombinatorialIterator) && !is_array(n[n.length-1]) && (n[n.length-1] !== +n[n.length-1]) ? n.pop( ) || {} : {};
        if ( n.length && is_array(n[0]) ) n = n[0];
        if ( !n || !n.length ) n = [];
        if ( !(self instanceof Tensor) ) return new Tensor(n, $);

        $.type = String($.type || "tensor").toLowerCase();
        $.order = $.order || LEX;
        $.rand = $.rand || {};

        if ( "partial" === $.type )
        {
            n = is_array(n)&&n.length ? n[0] : n;
            var nsub = -1, data = $.data||[], pos = $.position||null;

            if ( n instanceof CombinatorialIterator )
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
                if ( n[0] instanceof CombinatorialIterator )
                {
                    sub = n[0];
                    n[0] = sub.dimension();
                }
                else if ( n[1] instanceof CombinatorialIterator )
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
        //,parse: parse_combinatorial_tpl
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
/*function next_conditional_tensor( item, N, dir, order, is_valid, TI )
{
    var n = N, k=n.length, i, j, i0, i1, DI, a, b, MIN, MAX, invalid;
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

    if ( 0 > dir )
    {
        invalid = false;
        do{
            i = i0;
            while(MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if ( MIN<=i && MAX>=i )
            {
                for(item[i]=item[i]-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n[a*j+b]-1;
                invalid = !is_valid(item);
            }
            //else last item
            else item = null;
        }while(item && invalid);
    }
    else
    {
        invalid = false;
        do{
            i = i0;
            while(MIN<=i && MAX>=i && item[i]+1===n[a*i+b]) i-=DI;
            if ( MIN<=i && MAX>=i )
            {
                for(item[i]=item[i]+1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
                invalid = !is_valid(item);
            }
            //else last item
            else item = null;
        }while(item && invalid);
    }
    return item;
}*/

// https://en.wikipedia.org/wiki/Permutations
Permutation = Abacus.Permutation = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Permutation( n, $ ) {
        var self = this, sub = null;
        if ( !(self instanceof Permutation) ) return new Permutation(n, $);
        $ = $ || {}; $.type = String($.type || "permutation").toLowerCase();
        n = n||0;
        if ( n instanceof CombinatorialIterator )
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
        if ( !(self instanceof Combination) ) return new Combination(n, k, $);
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

        if ( k instanceof CombinatorialIterator )
        {
            sub = k;
            k = sub.dimension();
        }
        else if ( n instanceof CombinatorialIterator )
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
        if ( !(self instanceof Subset) ) return new Subset(n, $);
        $ = $ || {}; n = n||0;
        if ( n instanceof CombinatorialIterator )
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
        var self = this, sub = null;
        if ( !(self instanceof Partition) ) return new Partition(n, $);
        $ = $ || {}; $.type = $.type || "partition";
        n = n||1;
        if ( n instanceof CombinatorialIterator )
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        var M = $["max="] ? $["max="]|0 : null, K = $["parts="] ? $["parts="]|0 : null,
            k1 = K ? K : (M ? n-M+1 : n), k0 = K ? K : (M ? stdMath.ceil(n/M) : 1);
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
                M = $ && $["max="] ? $["max="]|0 : null, K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( K || M ) return item;
            if ( LEN+1===item.length )
            {
                var reflected = -1===dir, itemlen;
                item = reflected ? item.slice(LEN-item[LEN],LEN) : item.slice(0,item[LEN]);
                item = conjugatepartition(is_composition, item, dir);
                itemlen = item.length;
                if ( itemlen<LEN ) item[reflected?"unshift":"push"].apply(item, new Array(LEN-itemlen));
                item.push(itemlen);
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
            item = new Array(LEN+1); item[LEN] = 0;
            if ( K && M )
            {
                item[LEN] = K;
                // restricted partition n into exactly K parts with largest part=M
                // equivalent to partition n-M into K-1 parts with largest part<=M
                if ( 1 === K )
                {
                    item[0] = M;//[M];
                }
                if ( is_composition )
                {
                    m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                    item = operate(function(item,ai,i){
                        item[i] = ai; return item;
                    }, item, [((n-M)%m)||m].concat(array(K-2, m, 0)).concat([M]));
                    if ( 0 > dir ) reflection(item,item,K,0,K-1);
                }
                else if ( 0 > dir )
                {
                    k = stdMath.min(K, stdMath.floor(n/M)||1); n-=k*M; K-=k;
                    if ( (0===n) && (0<K) ) { k--; K++; n+=M; }
                    item = operate(function(item,ai,i){
                        item[i] = ai; return item;
                    }, item, [M].concat(array(k-1, M, 0)).concat((0<n)&&(0<K)?[n-K+1].concat(array(K-1, 1, 0)) : []));
                }
                else
                {
                    m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                    item = operate(function(item,ai,i){
                        item[i] = ai; return item;
                    }, item, [M].concat(array(K-2, m, 0).concat([((n-M)%m)||m])));
                }
            }
            else
            {
                if ( K )
                {
                    item[LEN] = K;
                    // restricted partition n to exactly K parts
                    // equivalent to conjugate to partition n into parts with largest part=K
                    if ( is_composition )
                    {
                        item = operate(function(item,ai,i){
                            item[i] = ai; return item;
                        }, item, array(K-1, 1, 0).concat([n-K+1]));
                        if ( 0 > dir ) reflection(item,item,K,0,K-1);
                    }
                    else
                    {
                        m = stdMath.ceil(n/K); k = (n%m)||m;
                        item = operate(function(item,ai,i){
                            item[i] = ai; return item;
                        }, item, 0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K-1, m, 0).concat([k]));
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
                            item[i] = ai; item[LEN]++; return item;
                        }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : array(n-M, 1, 0).concat([M]));
                        //if ( 0 > dir ) reflection(item,item);
                    }
                    else
                    {
                        item = operate(function(item,ai,i){
                            item[i] = ai; item[LEN]++; return item;
                        }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0)));
                    }
                }
                else
                {
                    // unrestricted partition/composition
                    item = operate(function(item,ai,i){
                        item[i] = ai; item[LEN]++; return item;
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
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                list, item, m, x, y, y1 = 0, yn = 0,
                itemlen, LEN = K ? K : (M ? n-M+1 : n),
                is_composition = "composition" === type, conj = false;

            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;

            if ( K && M )
            {
                // not implemented
                return null;
            }

            if ( M && !K ){ K=M; conj=true; }

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

            itemlen = item.length;
            if ( itemlen<LEN ) item.push.apply(item, new Array(LEN-itemlen));
            item.push(itemlen);

            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
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
        var self = this;
        self.item__ = part_item_(self.__item, self.n, self.$.order, self.$.type, self.$);
        return self;
    }
    ,output: function( item ) {
        if ( null == item ) return null;
        var $ = this.$, n = this.n, M = $["max="] ? $["max="]|0 : null,
            K = $["parts="] ? $["parts="]|0 : null,
            order = null!=$.order ? $.order : LEX,
            LEN = K ? K : (M ? n-M+1 : n);
        if ( LEN+1===item.length )
        {
            var //is_composition = $ && "composition"===$.type,
                is_reflected = REFLECTED & order, is_colex = COLEX & order;
            item = /*(is_composition && (is_reflected && !is_colex || is_colex && !is_reflected)) ||*/ (is_reflected /*&& !is_composition*/) ? item.slice(LEN-item[LEN],LEN) : item.slice(0,item[LEN]);
        }
        return CombinatorialIterator[PROTO].output.call(this, item);
    }
});
// aliases
Partition.transpose = Partition.conjugate;
function part_item_(item, n, order, type, $)
{
    return null;
    /*if ( null == item ) return null;
    var PI = null;
    if ( "composition" === type )
    {
        if ( $ && null!=$['max='] )
        {
            PI = [0];
            var i, l = item.length, M = $['max='];
            for(i=0; i<l; i++) if ( M === item[i] ) PI[0]++;
        }
    }
    return PI;*/
}
function next_partition( item, N, dir, K, M, order, PI )
{
    //maybe "use asm"
    var n = N, LEN = K ? K : (M ? n-M+1 : n),
        i, j, i0, i1, k, m, d, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    //MIN = 0; MAX = item.length-1;
    //i0 = MIN; i1 = MAX;
    DI = 1;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; //i0 = MAX-i0; i1 = MAX-i1;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if ( 0 > DI )
    {
        MIN = LEN-(item[LEN]||1); MAX = LEN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if ( 0 > dir )
    {
        // compute prev partition
        if ( K )
        {
            // TODO
            item = null;
            /*if ( M )
            {
            }
            else
            {
                m = stdMath.ceil(n/K);
                k = (n%m) || m;
                j = i0;
            }
            if ( item[j] > m )
            {
                i = i1; rem = 0;
                while( MIN<=i && i<=MAX && item[i]-1 >= item[i] )
                {
                    item[i]
                    rem++;
                    i+=DI;
                }
                item[i+DI]++; rem--;
                while( MIN<=i && i<=MAX && MIN<=i+DI && i+DI<=MAX && DI*(i-j) >= 0 && item[i] === item[i+DI] )
                {
                    i-=DI;
                }
                while( MIN<=i && i<=MAX && MIN<=i+DI && i+DI<=MAX && DI*(i-j) >= 0 && 0 > rem && item[i]-1 >= item[i+DI] )
                {
                    item[i]--; rem++;
                    i-=DI;
                }
            }
            else item = null;*/
        }
        else
        {
            if ( COLEX & order )
            {
                item = null;
            }
            else
            {
                j = M ? i0+DI : i0;
                if ( (MIN<=j && j<=MAX) && (item[j] > 1) )
                {
                    i = i1; rem = 0;
                    while((MIN<=i && i<=MAX) && (DI*(i-j) >= 0) && (1 === item[i])) { rem+=item[i]; i-=DI; }
                    m = item[i]-1; rem++; item[i] = m;
                    //item = 0 > DI ? item.slice(i) : item.slice(0, i+1);
                    item[LEN] = 0 > DI ? LEN-i : i+1;
                    if ( m < rem )
                    {
                        j = rem%m;
                        //item = 0 > DI ? (j?[j]:[]).concat(array(stdMath.floor(rem/m), m)).concat(item) : item.concat(array(stdMath.floor(rem/m), m)).concat(j?[j]:[]);
                        /*operate(function(item,ai){
                            i+=DI; item[i] = ai; item[LEN]++; return item;
                        }, item, array(stdMath.floor(rem/m), m).concat(j?[j]:[]));*/
                        rem = stdMath.floor(rem/m);
                        while(0<rem--){ i+=DI; item[i] = m; item[LEN]++; }
                        if ( 0<j ) { i+=DI; item[i] = j; item[LEN]++; }
                    }
                    else if ( 0 < rem )
                    {
                        //item = 0 > DI ? [rem].concat(item) : item.concat([rem]);
                        i+=DI; item[i] = rem; item[LEN]++;
                    }
                }
                // if partition is all ones (so first element is also one) it is the final partition
                //else last item
                else item = null;
            }
        }
    }
    else
    {
        // compute next partition
        if ( K )
        {
            // TODO
            item = null;
            /*if ( M )
            {
                m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                //k = ((n-M)%m)||m;
                j = i0+DI;
                d = n-M-item[j];
            }
            else
            {
                m = n-K+1;
                //k = 1;
                j = i0;
                d = n-item[j];
            }
            if ( m > item[j] )
            {
                i = /*k === item[i] ? i1-DI :* / i1; rem = 0; k = K-1-(M?1:0);
                while( MIN<=i && i<=MAX && DI*(i-j)>0 && (1 === item[i] || d >= k*(item[i]+1)) )
                {
                    d-=item[i]; i-=DI; k--;
                }
                item[i]--; rem++; i-=DI;
                while( MIN<=i && i<=MAX && DI*(i-j)>=0 && 0<rem )
                {
                    k = item[i]+1;
                    if ( MIN<=i-DI && i-DI<=MAX && k<=item[i-DI] ){ item[i]=k; rem--; }
                    i-=DI;
                }
                if ( 0 < rem ) item[j]+=rem;
            }
            else item = null;*/
        }
        else
        {
            if ( COLEX & order )
            {
                item = null;
            }
            else
            {
                if ( M )
                {
                    m = stdMath.min(M,n-M);
                    k = stdMath.floor(n/M)+(n%M?1:0)-1;
                    m = /*MAX*/item[LEN]-1 > k || item[i0+(k-1)*DI] < m;
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
                    while((MIN<=i && i<=MAX) && (MIN<=i-DI && i-DI<=MAX) && (DI*(i-j) > 0) && (item[i] === item[i-DI])) { rem+=item[i]; i-=DI; }
                    item[i]++; rem--;
                    item[LEN] = 0 > DI ? LEN-i : i+1;
                    //if ( 0 < rem )
                        //item = 0 > DI ? array(rem, 1).concat(item.slice(i)) : item.slice(0, i+1).concat(array(rem, 1));
                        /*operate(function(item,ai){
                            i+=DI; item[i] = ai; item[LEN]++; return item;
                        }, item, array(rem, 1, 0));*/
                    while(0<rem--){ i+=DI; item[i] = 1; item[LEN]++; }
                    //else
                        //item = 0 > DI ? item.slice(i) : item.slice(0, i+1);
                }
                // if partition is the number itself it is the final partition
                //else last item
                else item = null;
            }
        }
    }
    return item;
}
function next_composition( item, N, dir, K, M, order, PI )
{
    //maybe "use asm"
    var n = N, LEN = K ? K : (M ? n-M+1 : n),
        i, j, i0, i1, k, m, d, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    //MIN = 0; MAX = item.length-1;
    //i0 = MIN; i1 = MAX;
    DI = 1;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; //i0 = MAX-i0; i1 = MAX-i1;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if ( 0 > DI )
    {
        MIN = LEN-(item[LEN]||1); MAX = LEN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if ( 0 > dir )
    {
        // compute prev composition
        if ( K )
        {
            if ( M )
            {
                // TODO
                item = null;
            }
            else
            {
                // adapted from FXT lib
                if ( COLEX & order )
                {
                    m = item[i0];
                    if ( n-K+1 > m )
                    {
                        item[i0] = 1; i = i0+DI;
                        while(MIN<=i && i<=MAX && 1===item[i] ) i+=DI;
                        item[i]--;
                        if (MIN<=i-DI && i-DI<=MAX) item[i-DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    m = item[i1];
                    if ( n-K+1 > m )
                    {
                        item[i1] = 1; i = i1;
                        while( MIN<=i && i<=MAX && 1===item[i] ) i-=DI;
                        item[i]--;
                        if (MIN<=i+DI && i+DI<=MAX) item[i+DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if ( M )
            {
                item = null;
                /*
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( null == PI ) PI = part_item_(item, n, order, "composition", {'max=':M});
                    if ( n!==MAX+M || M!==item[i1] )
                    {
                        i = i1; rem = 0; j = 0;
                        while(MIN<=i && i<=MAX && 1===item[i] ){ rem++; i-=DI; j++; }
                        d = M === item[i];
                        if ( d && (2>PI[0]) && (rem+1<M))
                        {
                            if ( 0<rem )
                            {
                                item[i] = rem;
                                item[i+DI] = M;
                                i+=DI; j--;
                                rem = 0;
                            }
                            else
                            {
                                i = i-DI; j++; rem+=M;
                                while(MIN<=i && i<=MAX && 1===item[i]) { rem++; i-=DI; j++; }
                                item[i]--; rem++; PI[0]=0;
                            }
                        }
                        else
                        {
                            item[i]--; rem++;
                            if ( d ) PI[0]--;
                        }
                        if ( 0>PI[0] ) PI[0]=0;

                        if ( 0 < rem )
                        {
                            if ( MIN<=i+DI && i+DI<=MAX )
                            {
                                i+=DI; j--;
                                item[i]=stdMath.min(M,rem); rem-=item[i];
                                if ( M === item[i] ) PI[0]++;
                                if ( 0 < j )
                                {
                                    if ( 0 > DI ) item.splice(0, j);
                                    else item.splice(i+1, j);
                                }
                                if ( 0 < rem )
                                {
                                    k = stdMath.floor(rem/M); PI[0]+=k;
                                    if ( 0 > DI ) item.unshift.apply(item, (rem>k*M?[rem-k*M]:[]).concat(array(k, M, 0)));
                                    else item.push.apply(item, array(k, M, 0).concat(rem>k*M?[rem-k*M]:[]));
                                }
                            }
                            else
                            {
                                if ( 0 < rem )
                                {
                                    k = stdMath.floor(rem/M); PI[0]+=k;
                                    if ( 0 > DI ) item.unshift.apply(item, (rem>k*M?[rem-k*M]:[]).concat(array(k, M, 0)));
                                    else item.push.apply(item, array(k, M, 0).concat(rem>k*M?[rem-k*M]:[]));
                                }
                            }
                        }
                        else
                        {
                            if ( 0 < j )
                            {
                                if ( 0 > DI ) item.splice(0, j);
                                else item.splice(i+1, j);
                            }
                        }
                    }
                    // last
                    else item = null;
                }*/
            }
            else
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( n > item[LEN]/*item.length*/ )
                    {
                        i = i1; rem = 0;
                        while(MIN<=i && i<=MAX && 1===item[i] ){ i-=DI; rem++; }
                        m = item[i]-1; item[i] = m; rem++;
                        if ( 0 < rem )
                        {
                            if ( MIN<=i+DI && i+DI<=MAX )
                            {
                                i+=DI; item[i]=rem; rem=0;
                                //if ( 0 > DI ) item = item.slice(i);
                                //else item = item.slice(0,i+1);
                                item[LEN] = 0 > DI ? LEN-i : i+1;
                            }
                            else
                            {
                                //if ( 0 > DI ) item = array(rem, 1, 0).concat(item);
                                //else  item = item.concat(array(rem, 1, 0));
                                /*operate(function(item,ai){
                                    i+=DI; item[i] = ai; item[LEN]++; return item;
                                }, item, array(rem, 1, 0));*/
                                while(0<rem--){ i+=DI; item[i] = 1; item[LEN]++; }
                            }
                        }
                    }
                    // last
                    else item = null;
                }
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
                // TODO
                item = null;
            }
            else
            {
                // adapted from FXT lib
                if ( COLEX & order )
                {
                    if ( n-K+1 > item[i1] )
                    {
                        i = i0;
                        while( MIN<=i && i<=MAX && 1===item[i] ) i+=DI;
                        m = item[i]; item[i] = 1; item[i0] = m-1;
                        if ( MIN<=i+DI && i+DI<=MAX ) item[i+DI]++;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    if ( n-K+1 > item[i0] )
                    {
                        i = i1;
                        while( MIN<=i && i<=MAX && 1===item[i] ) i-=DI;
                        m = item[i]; item[i] = 1; item[i1] = m-1;
                        if (MIN<=i-DI && i-DI<=MAX) item[i-DI]++;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if ( M )
            {
                item = null;
                /*if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( null == PI ) PI = part_item_(item, n, order, "composition", {'max=':M});
                    k = stdMath.ceil(n/M);
                    m = (n%M)||M;
                    if ( k!==item.length || m!==item[i1] )
                    {
                        rem = item[i1];
                        k = i1-DI;
                        m = item[k];
                        j = 1; i = k;
                        if ( m+1<=M )
                        {
                            if ( (M===rem) && (m+1<M) )
                            {
                                if ( 2>PI[0] )
                                {
                                    rem = m; item[k] = M;
                                }
                                else
                                {
                                    item[k] = m+1; rem--;
                                    PI[0]=0;
                                }
                            }
                            else
                            {
                                item[k] = m+1; rem--;
                            }
                        }
                        else
                        {
                            while(MIN<=i && i<=MAX && item[i]+1>M)
                            {
                                rem+=item[i]; i-=DI;
                                j++; PI[0]--;
                            }
                            if ( 0>PI[0] ) PI[0]=0;
                            item[i]++; rem--;
                            if ( M === item[i] ) PI[0]++;
                        }
                        if ( 0 > DI )
                        {
                            if ( 0 < j ) item.splice(0, j);
                            if ( 0 < rem )
                            {
                                if ( (0>=PI[0]) && (M<=rem) )
                                {
                                    item.unshift.apply(item, [M].concat(array(rem-M, 1, 0)));
                                    PI[0] = 1;
                                }
                                else
                                {
                                    item.unshift.apply(item, array(rem, 1, 0));
                                }
                            }
                        }
                        else
                        {
                            if ( 0 < j ) item.splice(i+1, j);
                            if ( 0 < rem )
                            {
                                if ( (0>=PI[0]) && (M<=rem) )
                                {
                                    item.push.apply(item, array(rem-M, 1, 0).concat([M]));
                                    PI[0] = 1;
                                }
                                else
                                {
                                    item.push.apply(item, array(rem, 1, 0));
                                }
                            }
                        }
                    }
                    // last
                    else item = null;
                }*/
            }
            else
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( n>item[i0] )
                    {
                        rem = item[i1]; item[i1-DI]++;
                        item[LEN]--; i = i1-DI;
                        rem--;
                        while(0<rem--){ i+=DI; item[i] = 1; item[LEN]++; }
                        /*operate(function(item,ai){
                            i+=DI; item[i] = ai; item[LEN]++; return item;
                        }, item, array(rem-1, 1, 0));*/
                        /*if ( 0 > DI )
                        {
                            item.shift();
                            item.unshift.apply(item, array(rem-1, 1, 0));
                        }
                        else
                        {
                            item.pop();
                            item.push.apply(item, array(rem-1, 1, 0));
                        }*/
                    }
                    // last
                    else item = null;
                }
            }
        }
    }
    return item;
}

LatinSquare = Abacus.LatinSquare = Class({
    constructor: function LatinSquare( n ) {
        var self = this;
        if ( !(self instanceof LatinSquare) ) return new LatinSquare(n);
        self.n = n;
    }

    ,__static__: {
        isLatin: is_latin
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
    }

    ,n: null

    ,dispose: function( ) {
        var self = this;
        self.n = null;
        return self;
    }
});

MagicSquare = Abacus.MagicSquare = Class({
    constructor: function MagicSquare( n ) {
        var self = this;
        if ( !(self instanceof MagicSquare) ) return new MagicSquare(n);
        self.n = n;
    }

    ,__static__: {
        isMagic: is_magic
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
    }

    ,n: null

    ,dispose: function( ) {
        var self = this;
        self.n = null;
        return self;
    }
});

// export it
return Abacus;
});
