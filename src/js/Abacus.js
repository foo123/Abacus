/**
*
*   Abacus
*   A combinatorics and number theory library for Node.js / Browser / XPCOM Javascript, PHP, Python, Java, C/C++
*   @version: 0.9.8
*   https://github.com/foo123/Abacus
**/
!function( root, name, factory ){
"use strict";
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.$deps = root.$deps||{}) && (root.EXPORTED_SYMBOLS = [name]) && (root[name] = root.$deps[name] = factory.call(root));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('undefined'!==typeof System)&&('function'===typeof System.register)&&('function'===typeof System['import']) ) /* ES6 module */
    System.register(name,[],function($__export){$__export(name, factory.call(root));});
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          this,
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
    ,Filter, Node, HashSieve, Term, Expr, Polynomial
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
            else if ( (1===dir && Arithmetic.lt(v,am)) || (-1===dir && Arithmetic.gt(v,am)) ) r = m-1;
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
    var i, j, l, l2;
    if ( is_array(x) )
    {
        l = x.length
        if ( 1 === l ) return true;
        for(l2=l>>1,i=0,j=l-1; i<l2; i++,j--)
            if ( x[i] !== x[j] )
                return false;
    }
    else
    {
        x = String(x); l = x.length;
        if ( 1 === l ) return true;
        for(l2=l>>1,i=0,j=l-1; i<l2; i++,j--)
            if ( x.charAt(i) !== x.charAt(j) )
                return false;
    }
    return true;
}

function diffn( a, b )
{
    return a-b;
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
    if ( Arithmetic.lt(b, Arithmetic.II) ) return log; // 0 or 1 as base, return 0
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
function miller_rabin_test( n, k )
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
    //if ( !Arithmetic.equ(n_1, Arithmetic.mul(d, Arithmetic.pow(two, s))) ) return false;

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
            if ( '1' === bits.charAt(bit-1) /*(k >> (b - 1)) & 1*/ )
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
            if ( '1' === bits.charAt(bit-1) /*(k >> (b - 1)) & 1*/ )
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
            if ( '1' === bits.charAt(bit-1) /*(k >> (b - 1)) & 1*/ )
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
function lucas_selfridge_params( n )
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
}
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
function lucas_test( n )
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
}
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
function baillie_psw_test( n )
{
    // https://en.wikipedia.org/wiki/Baillie%E2%80%93PSW_primality_test
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, two = Arithmetic.II,
        N = Arithmetic.num, sqrt, i, l, p;

    if ( null == baillie_psw_test.small_primes )
    {
        // compute only once
        // a short list of primes less than 50
        baillie_psw_test.small_primes = [
            two,N(3),N(5),N(7),N(11),N(13),N(17),N(19),N(23),N(29),N(31),N(37),N(41),N(43),N(47)
        ];
    }
    // Check divisibility by a short list of primes
    for (i=0,l=baillie_psw_test.small_primes.length; i<l; i++)
    {
        p = baillie_psw_test.small_primes[i];
        if ( Arithmetic.equ(n, p) ) return true;
        else if ( Arithmetic.equ(O, Arithmetic.mod(n, p)) ) return false;
    }

    // Perform the Miller-Rabin primality test with base 2
    if ( !miller_rabin_test(n, [two]) ) return false;

    // Finally perform the (strong) Lucas primality test
    return extra_strong_lucas_test(n);
}
function is_probable_prime( n )
{
    // https://en.wikipedia.org/wiki/Primality_test
    // https://primes.utm.edu/prove/prove2_3.html#quick
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II;

    //n = Arithmetic.abs(/*N(*/n/*)*/);
    if ( Arithmetic.lte(n, two) ) return Arithmetic.equ(n, two); // dont count 1 as prime, etc

    // ensure n is odd
    if ( Arithmetic.equ(O, Arithmetic.mod(n, two)) ) return false;

    return miller_rabin_test(n, 5);
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
    if ( null == wheel_trial_div_test.wheel )
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
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, two = Arithmetic.II, ndigits;
    //n = Arithmetic.abs(/*N(*/n/*)*/);
    ndigits = Arithmetic.digits(n).length;
    // try to use fastest algorithm based on size of number (number of digits)
    if ( ndigits <= 6 )
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

        return baillie_psw_test(n);//apr_cl_test(n);
    }
    else
    {
        // strong probabilistic test for very large numbers ie > 1000 digits
        return baillie_psw_test(n);
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
function trial_div_fac( n, maxlimit )
{
    // https://en.wikipedia.org/wiki/Trial_division
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num, factors, f, e, f1, L,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        three, five, seven, four, six, eight, ten, inc, i, p, p2, fac;

    // trial division with a wheel of {2,3,5,7}, faster than simple trial division
    if ( null == trial_div_fac.wheel )
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
    if ( ndigits <= 12 )
    {
        // trial division for small numbers
        return trial_div_fac(n);
    }
    else if ( ndigits <= 1000 )
    {
        // recursive (heuristic) factorization for medium-to-large numbers
        f = pollard_rho(n, Arithmetic.II, Arithmetic.I, 5, 100, null);
        if ( null == f )
        {
            return [[n, Arithmetic.I]];
        }
        else
        {
            return merge_factors(factorize(f), factorize(Arithmetic.div(n, f)));
        }
    }
    else
    {
        // quadratic sieve for (very) large numbers
        return siqs_fac(n);
    }
}
/*function tmat( matrix )
{
    // transpose matrix
    var n = matrix.length, m = n ? matrix[0].length : 0;
    return array(m, function(j){
        return array(n, function(i){
            return matrix[i][j];
        });
    });
}
function gauss_elim_GF2( M )
{
    // reduced form of gaussian elimination
    // https://www.cs.umd.edu/~gasarch/TOPICS/factoring/fastgauss.pdf
    var n = M.length, m = M[0].length, i, j, k, l, row, marks, num, sol_rows;
    marks = new Array(m);

    for (i=0; i<n; i++) //do for all rows
    {
        row = M[i];
        for (j=0; j<m; j++) //search for pivot
        {
            num = row[j];
            if ( 1 === num )
            {
                marks[j] = true;
                for (k=0; k<n; k++) //search for other 1s in the same column
                {
                    if ( i === k ) continue;
                    if ( 1 === M[k][j] )
                    {
                        for (l=0; l<m; l++)
                        {
                            M[k][l] = (M[k][l] + row[l]) & 1;
                        }
                    }
                }
                break;
            }
        }
    }

    M = tmat(M);

    sol_rows = [];
    for (i=0; i<m; i++) //find free columns (which have now become rows)
    {
        if ( !marks[i] ) sol_rows.push([M[i],i]);
    }

    return sol_rows.length ? [sol_rows,marks,M] : null;
}*/
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

    zeroes = 0;
    for(i=0; i<c; i++)
    {
        args[i] = Arithmetic.abs(args[i]);
        // break early
        if ( Arithmetic.equ(I, args[i]) ) return I;
        else if ( Arithmetic.equ(O, args[i]) ) zeroes++;
    }
    if ( zeroes === c ) return O;

    i = 0;
    while (i<c && Arithmetic.equ(a=args[i++], O) );
    //a = Arithmetic.abs(a);
    while (i<c)
    {
        // break early
        //if ( Arithmetic.equ(a, I) ) return I;
        while (i<c && Arithmetic.equ(b=args[i++], O) );
        //b = Arithmetic.abs(b);
        // break early
        //if ( Arithmetic.equ(b, I) ) return I;
        if ( Arithmetic.equ(b, O) ) break;
        // swap them (a >= b)
        if ( Arithmetic.lt(a,b) ) { t=b; b=a; a=t; }
        while (!Arithmetic.equ(b, O)) { t = b; b = Arithmetic.mod(a, t); a = t; }
    }
    return a;
}
function lcm( /* args */ )
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = gcd(args);
    return Arithmetic.equ(O, g) ? O : operate(function(a, b){
        if ( g ) { b = Arithmetic.div(b, g); g = null; }
        return Arithmetic.mul(a, b);
    }, Arithmetic.I, args);
}
function xgcd( /* args */ )
{
    // https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Integer_relation_algorithm
    // supports Exact Big Integer Arithmetic if plugged in
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        a, b, a1 = I, b1 = O, a2 = O, b2 = I, tmp, quot, gcd, asign = I, bsign = I;

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

        //if (Arithmetic.gt(b, a)) {tmp = a; a = b; b = tmp;}
        for(;;)
        {
            quot = Arithmetic.div(a, b);
            a = Arithmetic.mod(a, b);
            a1 = Arithmetic.sub(a1, Arithmetic.mul(quot, a2));
            b1 = Arithmetic.sub(b1, Arithmetic.mul(quot, b2));
            if ( Arithmetic.equ(a,O) )
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
            if ( Arithmetic.equ(b,O) )
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
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, zeroes = 0, a, b, a0, b0, t, qr, i;

    if ( 0 === c ) return new Polynomial([O]);
    for(i=0; i<c; i++)
    {
        if ( args[i].equ(O) ) zeroes++;
    }
    if ( zeroes === c ) return new Polynomial([O]);
    i = 0;
    while(i<c && (a=args[i++]).equ(O)) ;
    while (i<c)
    {
        while(i<c && (b=args[i++]).equ(O)) ;
        if ( b.equ(O) ) break;
        // swap them (a >= b)
        if ( a.deg() < b.deg() ) { t=b; b=a; a=t; }
        while ( 0 < b.deg() )
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
function polyxgcd( /* args */ )
{
    // Generalization of Extended GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        a, b, a0, b0, a1 = Polynomial.C(I), b1 = Polynomial.C(O), a2 = Polynomial.C(O), b2 = Polynomial.C(I),
        tmp, qr, xgcd;

    if ( 0 === k ) return;

    a = args[0];
    if ( 1 === k )
    {
        return [a, Polynomial.C(I)];
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
        xgcd = 2 === k ? [args[1], Polynomial.C(I)] : polyxgcd(slice.call(args, 1));
        b = xgcd[0];

        // gcd with zero factor, take into account
        if ( a.equ(O) )
            return array(xgcd.length+1,function(i){
                return 0===i ? b : (1===i ? Polynomial.C(I) : xgcd[i-1]);
            });
        else if ( b.equ(O) )
            return array(xgcd.length+1,function(i){
                return 0===i ? a : (1===i ? Polynomial.C(I) : xgcd[i-1]);
            });

        for(;;)
        {
            a0 = a; b0 = b;

            qr = a.div(b, true);
            a = qr[1];
            a1 = a1.sub(qr[0].mul(a2))
            b1 = b1.sub(qr[0].mul(b2));
            if ( a.equ(O) )
                return array(xgcd.length+1,function(i){
                    return 0===i ? b : (1===i ? a2 : b2.mul(xgcd[i-1]));
                });

            qr = b.div(a, true);
            b = qr[1];
            a2 = a2.sub(qr[0].mul(a1));
            b2 = b2.sub(qr[0].mul(b1));
            if( b.equ(O) )
                return array(xgcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : b1.mul(xgcd[i-1]));
                });

            if ( a.equ(a0) && b.equ(b0) )
                // will not change anymore
                return array(xgcd.length+1, function(i){
                    return 0===i ? a : (1===i ? a1 : b1.mul(xgcd[i-1]));
                });
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

    if ( null == moebius.wheel )
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
    p = moebius.wheel.next; /* next prime */ p2 = moebius.wheel.next2;
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
    return (0===m)/*is prime*/ || (m & 1) ? I : Arithmetic.J;
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
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        d, x0, xp;

    // assume all coefficients are already non-zero, does not handle this case, handled in general solution below
    d = gcd(a);

    // no solution
    if ( !Arithmetic.equ(Arithmetic.mod(b, d), O) ) return null;

    // infinite solutions parametrized by 1 free parameter
    if ( !Arithmetic.equ(d, I) )
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
    x0 = [a[1], Arithmetic.mul(J, a[0])];

    return [
    // general solution = any particular solution of non-homogeneous + general solution of homogeneous
    Expr([Term(1, xp[0]), Term(param, x0[0])]),
    Expr([Term(1, xp[1]), Term(param, x0[1])])
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
    var Arithmetic = Abacus.Arithmetic,
        N = Arithmetic.num, O = Arithmetic.O, I = Arithmetic.I,
        ok = a.length, k = ok, d, p, index, i, j, m, n, l, symbols, pnew,
        pos = [], ab, sol2, tot_x, tot_y, solutions, parameters,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if ( !ok ) return null;

    a = a.map(N); b = N(b||0);
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
            return i===pos[0] ? Expr(Term(1, Arithmetic.div(b, a[0]))) : Expr(Term(symbol+'_'+(++index)));
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
                n = b.terms[symbols[j]].coeff;
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

                sol2 = solvedioph2([a[i],ab[i]], n, pnew);
                if ( null == sol2 ) return null; // no solutions

                if ( '1' !== p )
                {
                    // re-express partial solution in terms of original symbol
                    sol2[0] = Expr([Term(p, sol2[0].terms['1']), sol2[0].terms[pnew]]);
                    sol2[1] = Expr([Term(p, sol2[1].terms['1']), sol2[1].terms[pnew]]);
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
        return x.terms['1'] ? x.terms['1'].coeff : O;
    }) : solutions);
}
function solvecongr( a, b, m, with_param )
{
    // solve linear congruence using the associated linear diophantine equation
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, solution;
    if ( !a.length ) return null;
    m = Arithmetic.num(m);
    solution = solvedioph(a.concat(m), b, with_param);
    // skip last variable
    return null==solution ? null : array(solution.length-1, function(i){
        // make positive constant terms modulo m
        var x = solution[i];
        if ( false === with_param )
        {
            // a particular solution (as number)
            if ( Arithmetic.gt(O, x) )
                x = Arithmetic.add(m, x);
        }
        else
        {
            // general solution (as expression)
            if ( x.terms['1'] && Arithmetic.gt(O, x.terms['1'].coeff) )
                x.terms['1'] = x.terms['1'].add(m);
        }
        return x;
    });

}
function sign( x )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
    return Arithmetic.equ(O, x) ? 0 : (Arithmetic.lt(x, O) ? -1 : 1);
}
/*function solvepythag( a, with_param )
{
    // solve pythagoeran diophantine equation in k variables
    // a1^2 x_1^2 + a2^2 x_2^2 + a3&2 x_3^2 + .. + ak^2 x_k^2 = 0
    // where a is k-array of (integer) coefficients: [a1^2, a2^2, a3^2, .. , ak^2]
    // solution adapted from sympy/solvers/diophantine.py
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, two = Arithmetic.II,
        k = a.length, index, sol, m, i, ith, L, ilcm, s,
        symbol = is_string(with_param) && with_param.length ? with_param : 'i';

    if ( !k ) return null;

    if ( sign(a[0])+sign(a[1])+sign(a[2]) < 0 )
        a = a.map(function(x){return Arithmetic.mul(J, x); });

    index = 0;

    for (i=0; i<k; i++)
        if ( -1 === sign(a[i]) )
            index = i;

    m = array(k, function(i){return symbol+'_'+(i+1);});
    s = array(k, function(i){return isqrt(Arithmetic.abs(a[i]));});
    ith = Expr(array(m.length, function(i){return Term(m[i]+'^2');}));
    L = [Expr([ith, Term(m[k-2]+'^2', -2)])];
    L = L.concat(array(k-2, function(i){return null;}));//[2*m[i]*m[n-2] for i in range(n - 2)])
    //sol = L[:index] + [ith] + L[index:];

    ilcm = I;
    for(i=0; i<k; i++)
    {
        if (i == index || (index > 0 && i == 0) || (index == 0 && i == 1))
            ilcm = lcm(ilcm, s[i]);
        else
            ilcm = lcm(ilcm, Arithmetic.equ(O, Arithmetic.mod(s[i], two)) ? Arithmetic.div(s[i], two) : s[i]);
    }
    for(i=0; i<k; i++)
        sol[i] = sol[i].mul(Arithmetic.div(ilcm, s[i]));

    return sol;
}*/
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
        O = Arithmetic.O, I = Arithmetic.I, V = Arithmetic.V,
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
        res = (n-k)&1 ? V(stirling(n,k,-1)) : stirling(n,k,-1);
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
        tensor, t0, t1, nvalid, product, p, pv, pe, npv,
        seen = null, valid = null, invalid, queue, ql, expr, e, el;

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

    pe = new Array(nv); pv = [];
    for(kl=1,k=0; k<nv; k++)
    {
        if ( is_callable(v[k][0]) )
        {
            // fixed expression for position k, store it to be added after actual values are added
            // expr v[k][0] for pos k, depends on value at pos v[k][1]
            // assume there is dependency only on one position and not multiple positions
            // although do-able but more tedious
            if ( null == pe[v[k][1]] ) pe[v[k][1]] = [[v[k][0],k]];
            else pe[v[k][1]].push([v[k][0],k]);
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
    // pre-allocate queue for speed
    queue = new Array(nv); ql = 0;
    // O(kl), count only necessary values, minus any outliers (as few as possible)
    for(k=0; k<kl; k++)
    {
        // O(nv)
        tensor = new Array(nv); invalid = false;
        for(r=k,a=npv; a>=0; a--)
        {
            p = pv[a];
            l = v[p].length;
            i = r % l;
            r = ~~(r / l);
            tensor[p] = v[p][i];
            if ( null != pe[p] )
            {
                // fill-up any pos values which are expressions based on this pos value
                queue[0] = p; ql = 1;
                do{
                    p = queue[--ql]; expr = pe[p]; vv = tensor[p];
                    for(e=0,el=expr.length; e<el; e++)
                    {
                        p = expr[e][1];
                        tensor[p] = expr[e][0](vv);
                        // add to queue, the new completed pos value, if any others depend on this
                        if ( null != pe[p] ) queue[ql++] = p;
                    }
                }while(0<ql);
            }
        }
        if ( value_conditions || extra_conditions )
        {
            if ( extra_conditions && !valid(tensor,t1,t1) )
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
    var min = null==options.min ? 0 : options.min,
        max = null==options.max ? n-1 : options.max,
        nn = max-min+1, D = data, m, d, i, a, pi, l = D.length, none = false,
        pos_ref, var_name, p1, p2, expr, algebraic = [], missing = [], ref = {},
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
                pos_ref = -1; var_name = null; expr = null;
                d = d.replace(pos_re, function(m, d){
                    if ( null === var_name )
                    {
                        pos_ref = parseInt(d,10);
                        var_name = 'v'+String(pos_ref);
                    }
                    return var_name;
                });
                if ( !in_range(pos_ref) )
                {
                    if ( pos ) pos.splice(pi--, 1);
                    continue;
                }
                try{
                    expr = new Function(var_name,'return Math.floor('+d+');');
                } catch(e){
                    expr = null;
                }
                if ( !is_callable(expr) )
                {
                    if ( pos ) pos.splice(pi--, 1);
                    continue;
                }
                if ( !ref[pos_ref] ) ref[pos_ref] = [expr];
                else ref[pos_ref].push(expr);
                if ( 0>pos.indexOf(pos_ref) ) missing.push(pos_ref);
                algebraic.push([expr,null,null,pos_ref,pos[pi]]);
                data.push(algebraic[algebraic.length-1]);
            }
        }
        else if ( is_array(d) )
        {
            a = false===d[0] ? complement(n,d.slice(1).filter(in_range)) : d.slice(1).filter(in_range);
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
            m[1] = pos.indexOf(m[3]);
            m[2] = pos.indexOf(m[4]);
            expr = ref[m[3]];
            // by the way, filter out some invalid values here for all expr on the same pos ref
            if ( !is_callable(data[m[1]][0]) )
            {
                a = data[m[1]].filter(function(x){
                    for(var ex,i=0,l=expr.length; i<l; i++)
                    {
                        ex = expr[i](x);
                        if ( min>ex || ex>max ) return false;
                    }
                    return true;
                });
                if ( !a.length ) { none = true; break; }
                else data[m[1]] = a;
            }
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

,N: function( a ) { return +a; }
,V: function( a ) { return 0-(+a); }

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
    ,N: function( a ){return Abacus.Arithmetic.add(Abacus.Arithmetic.O, a);}
    ,V: function( a ){return Abacus.Arithmetic.sub(Abacus.Arithmetic.O, a);}
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
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
    return gcd(array(args.length, function(i){return Arithmetic.num(args[i]);}));
}
,xgcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
    return xgcd(array(args.length, function(i){return Arithmetic.num(args[i]);}));
}
,polygcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
    return polygcd(array(args.length, function(i){return !(args[i] instanceof Polynomial) ? new Polynomial(Arithmetic.num(args[i])) : args[i];}));
}
,polyxgcd: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
    return polyxgcd(array(args.length, function(i){return !(args[i] instanceof Polynomial) ? new Polynomial(Arithmetic.num(args[i])) : args[i];}));
}
,lcm: function( /* args */ ) {
    var Arithmetic = Abacus.Arithmetic, args = arguments.length && is_array(arguments[0]) ? arguments[0] : arguments;
    return lcm(array(args.length, function(i){return Arithmetic.num(args[i]);}));
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

,diophantine: solvedioph
,congruence: solvecongr

};

// array/list utilities
Abacus.Util = {

 array: array
,operate: operate
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

// Abacus.Term, represents symbolic multiplicative terms in (linear) algebraic expressions, including terms with variables
Term = Abacus.Term = function Term( symb, coeff ) {
    var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;
    if ( !(self instanceof Term) ) return new Term(symb, coeff);

    self.symbol = null == symb ? '1' /* constant term */ : String(symb) /* another symbol */;
    self.coeff = null == coeff ? I : (coeff instanceof Term ? coeff.coeff : coeff);

    self.neg = function( ) {
        return new Term(self.symbol, Arithmetic.mul(Arithmetic.J, self.coeff));
    };
    self.add = function( a ) {
        return new Term(self.symbol, Arithmetic.add(self.coeff, a instanceof Term ? a.coeff : a));
    };
    self.sub = function( a ) {
        return new Term(self.symbol, Arithmetic.sub(self.coeff, a instanceof Term ? a.coeff : a));
    };
    self.mul = function( a ) {
        return new Term(self.symbol, Arithmetic.mul(self.coeff, a instanceof Term ? a.coeff : a));
    };
    self.div = function( a ) {
        return new Term(self.symbol, Arithmetic.div(self.coeff, a instanceof Term ? a.coeff : a));
    };
    self.valueOf = function( x ) {
        if ( (null==x) || ('1'===self.symbol) ) return self.coeff;
        else if ( Arithmetic.equ(O, x) ) return O;
        var p = '1' === self.symbol ? -1 : self.symbol.indexOf('^'); // eg x^2
        return Arithmetic.mul(self.coeff, -1 !== p ? Arithmetic.pow(x, +(self.symbol.slice(p+1))) : x);
    };
    self.toString = function( ) {
        return (Arithmetic.equ(I, self.coeff)&&('1'!==self.symbol) ? '' : String(self.coeff)) + ('1'===self.symbol ? '' : self.symbol);
    };
    self.dispose = function( ) {
        self.symbol = null;
        self.coeff = null;
        return self;
    };
};
// Abacus.Expr, represents symbolic algebraic expressions of sums of (multiplicative) terms
Expr = Abacus.Expr = function Expr( /* args */ ) {
    var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, l, term,
        terms = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;

    if ( !(self instanceof Expr) ) return new Expr(terms);

    self.terms = Obj();
    self.terms['1'] = Term(1, O); // constant term is default
    function _add( x, E )
    {
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
                if ( '1' !== x.symbol && Arithmetic.equ(O, E.terms[x.symbol]) )
                    delete E.terms[x.symbol];
            }
            else if ( ('1' === x.symbol) || !Arithmetic.equ(O, x.coeff) )
            {
                E.terms[x.symbol] = x;
            }
        }
        else if ( x instanceof Expr )
        {
            for(var i=0,keys=x.symbols(),l=keys.length; i<l; i++)
                _add(x.terms[keys[i]], E);
        }
        return E;
    }

    for(i=0,l=terms.length; i<l; i++) _add(terms[i], self);

    self.symbols = function( ) {
        return KEYS(self.terms);
    };
    self.args = function( sorted ) {
        return (sorted ? KEYS(self.terms).sort() : KEYS(self.terms)).map(function(t){return self.terms[t];});
    };
    self.add = function( x ) {
        return Arithmetic.isNumber(x) || (x instanceof Term) || (x instanceof Expr) ? _add(self, _add( x, new Expr() )) : self;
    };
    self.mul = function( x ) {
        if ( Arithmetic.isNumber(x) )
        {
            if ( Arithmetic.equ(O, x) ) return Expr();
            var symbols = KEYS(self.terms);
            return Expr(array(symbols.length, function(i){
                return Term(symbols[i], Arithmetic.mul(self.terms[symbols[i]].coeff, x));
            }));
        }
        return self;
    };
    self.valueOf = function( symbolValues ) {
        symbolValues = symbolValues || {};
        return KEYS(self.terms).reduce(function(r, t){
            var term = self.terms[t];
            return Arithmetic.add(r, term.valueOf(symbolValues[term.symbol]||O));
        }, O);
    };
    self.toString = function( ) {
        var keys = KEYS(self.terms), i, l = keys.length, out = '', prev = false;
        keys.sort();
        for(i=0; i<l; i++)
        {
            if ( Arithmetic.equ(O, self.terms[keys[i]].coeff) ) continue;
            out += (prev && Arithmetic.lt(O, self.terms[keys[i]].coeff) ? '+' : '') + self.terms[keys[i]].toString();
            prev = true;
        }
        return out.length ? out : '0';
    };
    self.dispose = function( ) {
        self.terms = null;
        return self;
    };
};
// Abacus.Polynomial, represents a (univariate) polynomial
Polynomial = Abacus.Polynomial = function Polynomial( /* args */ ) {
    var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, J = Arithmetic.J, I = Arithmetic.I,
        coeffs = arguments.length && (is_array(arguments[0]) || is_args(arguments[0]) || is_obj(arguments[0])) ? arguments[0] : arguments;

    if ( !(self instanceof Polynomial) ) return new Polynomial(coeffs);

    if ( is_obj(coeffs) )
    {
        // sparse representation, object with keys only to existing powers
        // convert to dense coefficient representation
        self.coeff = array(KEYS(coeffs).reduce(function(M, k){k = +k; return k > M ? k : M;}, 0)+1, function(i){
            return HAS.call(coeffs, i) ? coeffs[i] : O;
        });
    }
    else
    {
        // dense representation, array with all powers
        self.coeff = coeffs && coeffs.length ? (is_args(coeffs) ? slice.call(coeffs) : coeffs) : [O];
    }
    _degree(self);

    function _degree( P ) {
        var i = P.coeff.length-1;
        while(0<i && Arithmetic.equ(O, P.coeff[i])) i--;
        // truncate to first non-zero coefficient
        P.coeff.length = i+1;
    }

    function _add( x, P, sub ) {
        if ( sub )
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
                P.coeff = array(stdMath.max(x.coeff.length,P.coeff.length), function(i){
                    if ( i >= P.coeff.length ) return Arithmetic.mul(J, x.coeff[i]);
                    else if ( i >= x.coeff.length ) return P.coeff[i];
                    return Arithmetic.sub(P.coeff[i], x.coeff[i]);
                });
                _degree(P);
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
            // O(max(n1,n2))
            P.coeff = array(stdMath.max(x.coeff.length,P.coeff.length), function(i){
                if ( i >= P.coeff.length ) return x.coeff[i];
                else if ( i >= x.coeff.length ) return P.coeff[i];
                return Arithmetic.add(x.coeff[i], P.coeff[i]);
            });
            _degree(P);
        }
        return P;
    }

    function _mul( x, P ) {
        var i, j, n1, n2, n, c1, c2;
        if ( Arithmetic.isNumber(x) )
        {
            // O(n)
            if ( Arithmetic.equ(O, x) )
            {
                P.coeff = [O];
            }
            else if ( Arithmetic.equ(I, x) )
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
            // O(n1*n2), can be done a bit faster
            // 1. by using FFT multiplication, not implemented here
            // 2. by Divide&Conquer and using eg. Strassen multiplication, not implemented here
            c1 = x.coeff; n1 = c1.length;
            c2 = P.coeff; n2 = c2.length;
            n = n1+n2-1; P.coeff = array(n, function(){return O;});
            for(i=0; i<n1; i++)
                for(j=0; j<n2; j++)
                    P.coeff[i+j] = Arithmetic.add(P.coeff[i+j], Arithmetic.mul(c1[i],c2[j]));
            _degree(P);
        }
        return P;
    }

    self.deg = function( ) {
        // polynomial degree
        return self.coeff.length-1;
    };
    self.lead = function( ) {
        // leading coefficient
        return self.coeff[self.coeff.length-1];
    };
    self.c = function( ) {
        // constant coefficient
        return self.coeff[0];
    };
    self.equ = function( p ) {
        var c = self.coeff, cp, i, n;
        if ( Arithmetic.isNumber(p) )
        {
            return (1===c.length) && Arithmetic.equ(c[0], p);
        }
        else if ( p instanceof Polynomial )
        {
            cp = p.coeff;
            if ( c.length !== cp.length ) return false;
            for(i=0,n=c.length; i<n; i++)
                if ( !Arithmetic.equ(c[i], cp[i]) )
                    return false;
            return true;
        }
        return false;
    };
    self.neg = function( ) {
        return new Polynomial(array(self.coeff.length, function(i){ return Arithmetic.mul(J, self.coeff[i]); }));
    };
    self.add = function( x ) {
        return Arithmetic.isNumber(x) || (x instanceof Polynomial) ? _add( x, new Polynomial(self.coeff.slice()) ) : self;
    };
    self.sub = function( x ) {
        return Arithmetic.isNumber(x) || (x instanceof Polynomial) ? _add( x, new Polynomial(self.coeff.slice()), true ) : self;
    };
    self.mul = function( x ) {
        return Arithmetic.isNumber(x) || (x instanceof Polynomial) ? _mul( x, new Polynomial(self.coeff.slice()) ) : self;
    };
    self.div = function( x, q_and_r ) {
        var q, r, r0, d, diff;
        if ( Arithmetic.isNumber(x) )
        {
            q = new Polynomial(Arithmetic.equ(I, x) ? self.coeff.slice() : array(self.coeff.length, function(i){
                return Arithmetic.div(self.coeff[i], x);
            }));
            return q_and_r ? [q, new Polynomial([O])] : q;
        }
        else if ( x instanceof Polynomial )
        {
            // polynomial division
            r = new Polynomial(self.coeff.slice());
            diff = r.deg()-x.deg();
            if ( 0 <= diff )
            {
                q = array(diff+1, function(){return O;});
                while ( 0 <= diff )
                {
                    r0 = r;
                    d = x.shift(diff);
                    q[diff] = Arithmetic.div(r.lead(), d.lead());
                    r = r.sub( d.mul( q[diff] ) );
                    if ( r.equ(r0) ) break; // remainder won't change anymore
                    diff = r.deg()-x.deg();
                }
            }
            else
            {
                q = [O];
            }
            q = new Polynomial(q);
            // return both quotient and remainder if requested
            return q_and_r ? [q, r] : q;
        }
        return self;
    };
    self.pow = function( n ) {
        if ( !Arithmetic.isNumber(n) || Arithmetic.gt(O, n) || Arithmetic.gt(n, MAX_DEFAULT) ) return null;
        var pow, b;
        n = Arithmetic.val(n);
        if ( 0 === n )
        {
            return new Polynomial([I]);
        }
        else if ( 1 === n )
        {
            return new Polynomial(self.coeff.slice());
        }
        else if ( 2 === n )
        {
            return _mul(self, new Polynomial(self.coeff));
        }
        else
        {
            // exponentiation by squaring
            pow = new Polynomial([I]);
            b = new Polynomial(self.coeff);
            while ( 0 !== n )
            {
                if ( n & 1 ) pow = _mul(b, pow);
                n >>= 1;
                b = _mul(b, b);
            }
            return pow;
        }
    };
    self.shift = function( s ) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        if ( 0 === s )
            return new Polynomial(self.coeff.slice());
        else if ( 0 > s )
            return new Polynomial(array(stdMath.max(0,self.coeff.length+s), function(i){
                return self.coeff[i-s];
            }));
        //else if ( 0 < s )
        return new Polynomial(array(self.coeff.length+s, function(i){
            return i < s ? O : self.coeff[i-s];
        }));
    };
    self.deriv = function( ) {
        // polynomial derivative
        return new Polynomial(array(stdMath.max(0, self.coeff.length-1), function(i){
            return Arithmetic.mul(self.coeff[i+1], i+1);
        }));
    };
    self.valueOf = function( x ) {
        // Horner's algorithm for fast evaluation
        // https://en.wikipedia.org/wiki/Horner%27s_method
        x = x || O;
        var c = self.coeff, i, v;
        if ( Arithmetic.equ(O, x) ) return c[0];
        i = c.length-1; v = c[i];
        while(i--) v = Arithmetic.add(c[i], Arithmetic.mul(v, x));
        return v;
    };
    self.toString = function( ) {
        var c = self.coeff, i, n = c.length, x = 'x', out = '', prev = false;
        for(i=n-1; i>=0; i--)
        {
            if ( Arithmetic.equ(O, c[i]) ) continue;
            out += (prev && Arithmetic.lt(O, c[i]) ? '+' : '') + ((0===i) || !Arithmetic.equ(I, c[i]) ? c[i].toString() : '') + (0!==i ? (x+(1!==i?('^'+String(i)):'')) : '');
            prev = true;
        }
        return out.length ? out : '0';
    };
    self.toExpr = function( x ) {
        x = x || 'x';
        var c = self.coeff, i, terms = [];
        for(i=c.length-1; i>=0; i--)
        {
            if ( Arithmetic.equ(O, c[i]) ) continue;
            terms.push(new Term(0===i?'1':(1===i?x:(x+'^'+i)), c[i]));
        }
        if ( !terms.length ) terms.push(new Term(1, O));
        return new Expr(terms);
    };
    self.dispose = function( ) {
        self.coeff = null;
        return self;
    };
};
Polynomial.C = function( c ) {
    return new Polynomial([c || Abacus.Arithmetic.O]);
};
Polynomial.fromExpr = function( e, x ) {
    if ( !(e instanceof Expr) ) return null;
    x = x || 'x';
    var symbols = e.symbols(), i, s, coeff = {};
    for(i=symbols.length-1; i>=0; i--)
    {
        s = symbols[i];
        if ( '1' === s )
            coeff['0'] = e.terms[s].coeff;
        else if ( x === s )
            coeff['1'] = e.terms[s].coeff;
        else if ( (s.length > x.length+1) && (x+'^' === s.slice(0, x.length+1)) )
            coeff[s.slice(x.length+1)] = e.terms[s].coeff;
    }
    return new Polynomial(coeff);
};

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
    ,order: function( ) {
        return this;
    }
    ,rewind: function( dir ) {
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
        }
        else if ( is_callable($.generator) )
        {
            self.__item = $.generator.call(self, null, dir, $.state, true/*initial item*/);
            self._item = self.output(self.__item);
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
        return null != this.__item;
    }
    ,next: function( dir ) {
        var self = this, $ = self.$, curr, next, item;
        dir = -1===dir ? -1 : 1;
        if ( is_array($.seq) )
        {
            do{
                curr = self.__item;
                next = self._item;
                item = null;
                while((null==item) && (0<=$.seqindex) && ($.seqindex<$.seq.length))
                {
                    item = $.seq[$.seqindex].hasNext(dir) ? $.seq[$.seqindex].next(dir) : null;
                    if ( null == item ) $.seqindex += dir;
                }
                self.__item = item;
                self._item = self.output(self.__item);
            }while($.filter && (null!=next) && !$.filter.apply(next, self));
            return next;
        }
        else if ( is_callable($.generator) )
        {
            do{
                curr = self.__item;
                next = self._item;
                // generator should return null as result if finished
                self.__item = $.generator.call(self, curr, dir, $.state, false/*next item*/);
                self._item = self.output(self.__item);
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
        if ( sub && (sub.iter instanceof CombinatorialIterator) ) self.fuse(sub.method, sub.iter, sub.pos, sub.cascade);
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
        ,fusion: function( method, item, subitem, DIM, BASE, POS, DIR ) {
            if ( is_callable(method) ) return method(item, subitem, DIM, BASE, POS, DIR);
            if ( -1 === DIR ) { var t = item; item = subitem; subitem = t; }
            if ( null == item || null == subitem ) return item || subitem || null;
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
        var self = this, $ = self.$;
        if ( (1 === arguments.length) && (false === method) )
        {
            // un-fuse
            if ( $.sub )
            {
                $.sub = null;
                $.submethod = null;
                $.subpos = null;
                $.subcascade = null;
                $.subcount = null;
                $.subdimension = null;
                $.subposition = null;
                self.rewind();
            }
        }
        else if ( combIter instanceof CombinatorialIterator )
        {
            pos = pos || null; dir = -1===dir?-1:1;
            if ( is_callable(method) )
            {
                $.subdimension = null;
            }
            else
            {
                method = String(method||"project").toLowerCase();
                if ( ("multiply" === method))
                    $.subdimension = $.dimension*combIter.dimension();
                else if ( ("juxtapose" === method))
                    $.subdimension = 1 + (combIter.$.subdimension || 1);
                else if ( ("add" === method) || ("connect" === method) || ("concat" === method) || ("complete" === method) || ("interleave" === method) || ("join" === method) || ("combine" === method) || ("intersperse" === method) )
                    $.subdimension = $.dimension+combIter.dimension();
                else
                    $.subdimension = $.dimension;
            }
            $.sub = combIter; $.submethod = method;
            $.subpos = pos; $.subcascade = dir;
            $.subcount = Abacus.Arithmetic.mul($.count, combIter.total());
            self.rewind();
        }
        return self;
    }

    ,multiplyWith: function( combIter, dir ) {
        return this.fuse("multiply", combIter, null, dir);
    }

    ,addWith: function( combIter, dir ) {
        return this.fuse("add", combIter, null, dir);
    }

    ,connectWith: function( combIter, dir ) {
        return this.fuse("connect", combIter, null, dir);
    }

    ,concatWith: function( combIter, dir ) {
        return this.fuse("concat", combIter, null, dir);
    }

    ,juxtaposeWith: function( combIter, dir ) {
        return this.fuse("juxtapose", combIter, null, dir);
    }

    ,completeWith: function( combIter, pos, dir ) {
        if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
        return this.fuse("complete", combIter, pos||this.position(), dir);
    }

    ,interleaveWith: function( combIter, pos, dir ) {
        if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
        return this.fuse("interleave", combIter, pos||this.position(), dir);
    }

    ,joinWith: function( combIter, pos, dir ) {
        if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
        return this.fuse("join", combIter, pos||this.position(), dir);
    }

    ,combineWith: function( combIter, pos, dir ) {
        if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
        return this.fuse("combine", combIter, pos||this.position(), dir);
    }

    ,intersperseWith: function( combIter, pos, dir ) {
        if ( -1 === pos || 1 === pos ){ dir = pos; pos = null; }
        // used especially for Tensors, to generate recursively
        pos = pos || (1===this.dimension() ? [this.base()-1] : array(this.dimension(), 0, 1));
        return this.fuse("intersperse", combIter, pos, dir);
    }

    ,projectOn: function( combIter, dir ) {
        return this.fuse("project", combIter, null, dir);
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
            self._subitem = klass.fusion($.submethod, self._item, self.__subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
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
                self._subitem = klass.fusion($.submethod, self._item, self.__subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
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
                if ( $.sub ) item = klass.fusion($.submethod, item, subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
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
                if ( $.sub ) item = klass.fusion($.submethod, item, subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
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
            output = $.sub && !non_recursive ? klass.fusion($.submethod, item, $.sub.random(), self.dimension(), self.base(), $.subpos, $.subcascade) : item;
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
                self._subitem = has_next ? klass.fusion($.submethod, self._item, self.__subitem, self.dimension(), self.base(), $.subpos, $.subcascade) : null;
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

    ,rewind: function( dir ) {
        dir = -1===dir ? -1 : 1;
        var self = this, Arithmetic = Abacus.Arithmetic;
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
        return self;
    }

    ,hasNext: function( dir ) {
        dir = -1===dir ? -1 : 1;
        var self = this, Arithmetic = Abacus.Arithmetic;
        return Arithmetic.INF === self._max ? (0 < dir) : (null != self.__item);
    }

    ,next: function( dir ) {
        dir = -1===dir ? -1 : 1;
        var self = this, $ = self.$, Arithmetic = Abacus.Arithmetic, current, prev;

        do{
            prev = self.__item; current = self._item;

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
        var self = this, Arithmetic = Abacus.Arithmetic, two = Arithmetic.II;

        if ( !(self instanceof PrimeSieve) ) return new PrimeSieve($);

        $ = $ || {};
        $.type = String($.type || "eratosthenes").toLowerCase();
        $.count = Arithmetic.I; // infinite

        self._multiples = new HashSieve();
        // a simple wheel of {2}
        self._base = [two]; self._baseNext = Arithmetic.num(3); // is prime
        self._wheel = two;
        self._w = 0; self._p = 0;

        Iterator.call(self, "PrimeSieve", $);
    }

    ,_multiples: null
    ,_wheel: null
    ,_base: null
    ,_baseNext: null
    ,_w: 0
    ,_p: 0

    ,dispose: function( ) {
        var self = this;
        if ( self._multiples ) self._multiples.dispose();
        self._multiples = null;
        self._wheel = null;
        self._base = null;
        self._baseNext = null;
        self._w = null;
        self._p = null;
        return Iterator[PROTO].dispose.call(self);
    }
    ,rewind: function( dir ) {
        var self = this;
        self._multiples.reset();
        self._w = 0; self._p = 0;
        return self;
    }
    ,hasNext: function( dir ){
        dir = -1 === dir ? -1 : 1;
        return 0 < dir; /* infinite primes (only forward) */
    }
    ,next: function( dir ) {
        dir = -1 === dir ? -1 : 1;
        if ( 0 > dir ) return null;

        var self = this, $ = self.$, multiples = self._multiples,
            wheel = self._wheel, base = self._base, baseNext = self._baseNext,
            Arithmetic = Abacus.Arithmetic, prime = self.__item, output;

        do{
            // Eratosthenes sieve with a division wheel
            // O(n log(log(n))) for getting all primes up to n
            if ( self._p < base.length )
            {
                // get primes from the base
                //self.__index = Arithmetic.num(self._p);
                prime = base[self._p++];
            }
            else
            {
                if ( Arithmetic.equ(prime, base[base.length-1]) )
                {
                    // returned last prime from base, start from next prime and count
                    prime = baseNext; // should be prime
                    //self._w = 0;
                }
                else
                {
                    // check candidate primes, using wheel increments, ie avoid multiples of the base faster
                    do{

                        prime = Arithmetic.add(prime, wheel);

                    }while(multiples.has(prime));
                }

                // add (odd/wheel) multiples of this prime to the list for crossing out later on,
                // start from p^2 since lesser multiples are already crossed out by previous primes
                multiples.add(new Progression(Arithmetic.mul(prime, prime), Arithmetic.add(prime, prime), Arithmetic.INF));

                //self.__index = Arithmetic.add(self.__index, Arithmetic.I);
                output = self.output(prime);
            }
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
        ,fusion: CombinatorialIterator.fusion
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
        ,fusion: CombinatorialIterator.fusion
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
        ,fusion: CombinatorialIterator.fusion
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
        ,fusion: CombinatorialIterator.fusion
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
        ,fusion: CombinatorialIterator.fusion
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
            if ( (n&1) /* odd */ && (n%3) /* not divisable by 3 */ )
            {
                a = 2; b = 1;
                diag = 2; // conditions met for (pan-)diagonal square
            }
            else
            {
                // else try an exhaustive search over the possible factors
                Nn = N(n); diag = 0;
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
