/**
*
*   Abacus
*   A combinatorics library for Node.js / Browser / XPCOM Javascript, PHP, Python, Java, C/C++
*   @version: 0.9.1
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

var  Abacus = {VERSION: "0.9.1"}, stdMath = Math, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array.prototype.slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,log2 = stdMath.log2 || function(x) { return stdMath.log(x) / stdMath.LN2; }
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim ? function( s ){ return s.trim(); } : function( s ){ return s.replace(trim_re, ''); }
    ,pos_re = /\[(\d+)\]/g, pos_test_re = /\[(\d+)\]/
    ,in_set_re = /^\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/, not_in_set_re = /^!\{(\d+(?:(?:\.\.\d+)?|(?:,\d+)*))\}$/

    ,Extend = Object.create
    ,Merge = function Merge(a, b) {
        for (var p in b) if (HAS.call(b,p)) a[p] = b[p];
        return a;
    }
    ,Class = function Class(s, c) {
        if ( 1 === arguments.length ) { c = s; s = Object; }
        var ctor = c[CLASS];
        if ( HAS.call(c,'__static__') ) { ctor = Merge(ctor, c.__static__); delete c.__static__; }
        ctor[PROTO] = Merge(Extend(s[PROTO]), c);
        return ctor;
    }
    ,V_EQU=1, V_DIFF=-1, V_INC=3, V_DEC=-3, V_NONINC=-2, V_NONDEC=2

    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED

    ,CombinatorialIterator, Tensor, Permutation, Combination, Subset, Partition
    ,LatinSquare, MagicSquare
;

// utility methods
function NotImplemented( )
{
    throw new Error("Method not implemented!");
}
function is_array( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
//function is_obj( x ) { return (x instanceof Object) || ('[object Object]' === toString.call(x)); }
function is_string( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
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
        rem, last = null, x_array = x && is_array(x);
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
    var x = is_array(n) ? n : ((n=(n|0)) > 0 ? new Array(n) : []);
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
    }) : ((n===+n)&&(n0===+n0) ? (n0-n) : Abacus.Arithmetic.sub(Abacus.Arithmetic.N(n0),n));
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
function binarysearch( v, a, dir, a0, a1 )
{
    // binary search O(logn)
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var l=a0, r=a1, m, am;
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
    return -1;
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
    return operate(Abacus.Arithmetic.add, Abacus.Arithmetic.O, x, i0, i1, ik);
}
function product( x, i0, i1, ik )
{
    return operate(Abacus.Arithmetic.mul, Abacus.Arithmetic.I, x, i0, i1, ik);
}
function pow2( n )
{
    var Arithmetic = Abacus.Arithmetic;
    return /*Arithmetic.isDefault() ? ((1<<Arithmetic.N(n))>>>0) : */Arithmetic.shl(Arithmetic.I, Arithmetic.N(n));
}
function exp( n, k )
{
    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.N;
    return Arithmetic.pow(N(n), N(k));
}
function factorial( n, m )
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
        NUM = Arithmetic.N, add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul, key;

    if ( null == m )
    {
        // http://www.luschny.de/math/factorial/index.html
        // https://en.wikipedia.org/wiki/Factorial
        // simple factorial = F(n) = n F(n-1) = n!
        if ( 10 >= n ) return 0 > n ? O : (0 === n ? I : NUM(([1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800])[n-1]));
        key = String(n)/*+'!'*/;
        if ( null == factorial.mem1[key] )
            //factorial.mem1[key] = operate(mul, I, null, 2, n);
            factorial.mem1[key] = mul(factorial(n-1),n);
        return factorial.mem1[key];
    }
    else if ( false === m )
    {
        // http://mathworld.wolfram.com/Subfactorial.html
        // https://en.wikipedia.org/wiki/Derangement
        // https://en.wikipedia.org/wiki/Rencontres_numbers
        // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
        // for given number of fixed points k > 0: D(n,k) = C(n,k) D(n-k)
        if ( 10 >= n ) return 2 > n ? O : NUM(([1, 2, 9, 44, 265, 1854, 14833, 133496, 1334961])[n-2]);
        key = '!'+String(n);
        if ( null == factorial.mem2[key] )
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            /*factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);*/
            factorial.mem2[key] = add(n&1 ? J : I, mul(factorial(n-1,false),n));
        return factorial.mem2[key];
    }
    else if ( true === m )
    {
        // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
        if ( 10 >= n ) return 0 > n ? O : (0 === n ? I : NUM(([1, 2, 4, 10, 26, 76, 232, 764, 2620, 9496])[n-1]));
        key = 'I'+String(n);
        if ( null == factorial.mem2[key] )
            factorial.mem2[key] = add(factorial(n-1,true), mul(factorial(n-2,true),n-1));
        return factorial.mem2[key];
    }
    else if ( is_array(m) )
    {
        // https://en.wikipedia.org/wiki/Multinomial_theorem
        // multinomial = n!/m1!..mk!
        if ( !m.length ) return 0 > n ? O : factorial(n);
        else if ( 0 > n ) return O;
        key = String(n)+'@'+mergesort(m.slice(),1,true).join(',');
        if ( null == factorial.mem3[key] )
            factorial.mem3[key] = div(factorial(n), operate(function(N,mk){
                return mul(N, factorial(mk));
            }, factorial(m[m.length-1]), m, m.length-2, 0));
        return factorial.mem3[key];
    }
    else if ( m === +m )
    {
        if ( 0 > m )
        {
            // selections, ie m!C(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if ( -m >= n ) return -m === n ? factorial(n) : O;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
                factorial.mem3[key] = operate(mul, I, null, n+m+1, n);
            return factorial.mem3[key];
        }
        // https://en.wikipedia.org/wiki/Binomial_coefficient
        // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
        if ( (0 > m) || (1 > n) || (m > n) ) return O;
        if ( m+m > n  ) m = n-m; // take advantage of symmetry
        if ( (0 === m) || (1 === n) ) return I;
        else if ( 1 === m ) return NUM(n);
        key = String(n)+'@'+String(m);
        if ( null == factorial.mem3[key] )
            factorial.mem3[key] = Arithmetic.isDefault() ? stdMath.round(operate(function(Cnm,i){
                // this is faster and will not overflow unnecesarily for default arithmetic
                return Cnm*(1+n/i);
            }, (n=n-m)+1, null, 2, m)) : add(factorial(n-1,m-1),factorial(n-1,m))/*div(factorial(n,-m), factorial(m))*/;
        return factorial.mem3[key];
    }
    return O;
}
factorial.mem1 = {};
factorial.mem2 = {};
factorial.mem3 = {};
function stirling( n, k, s )
{
    // https://en.wikipedia.org/wiki/Stirling_number
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_first_kind
    // https://en.wikipedia.org/wiki/Stirling_numbers_of_the_second_kind
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, V = Arithmetic.V,
        add = Arithmetic.add, mul = Arithmetic.mul, key;

    if ( 0 > n || 0 > k ) return O;
    if ( 2 === s )
    {
        // second kind: S{n,k} = k S{n-1,k} + S{n-1,k-1}
        if ( (n === k) || (1 === k && 0 > n) ) return I;
        else if ( 0 === n || 0 === k ) return O;
        key = String(n)+','+String(k);
        if ( null == stirling.mem2[key] )
            stirling.mem2[key] = add(stirling(n-1,k-1,2), mul(stirling(n-1,k,2),k));
        return stirling.mem2[key];
    }
    else if ( -1 === s )
    {
        // signed first kind: S[n,k] = -(n-1) S[n-1,k] + S[n-1,k-1]
        if ( (k > n) || (0 === k && 0 > n) ) return O;
        else if ( n === k ) return I;
        key = '-'+String(n)+','+String(k);
        if ( null == stirling.mem1[key] )
            stirling.mem1[key] = add(stirling(n-1,k-1,-1), mul(stirling(n-1,k,-1),-n+1));
        return stirling.mem1[key];
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
        return (n-k)&1 ? V(stirling(n,k,-1)) : stirling(n,k,-1);
    }
}
stirling.mem1 = {};
stirling.mem2 = {};
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
p_nkab.mem = {};
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
partitions.mem = {};
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
    //if ( a+1 === b ) return factorial(k,n-k*a);
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
c_nkab.mem = {};
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
            compositions.mem[key] = K*M===n ? I : c_nkab(n, K, 1, M)/*(function(c,n,k,M){
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
compositions.mem = {};
function catalan( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.N, div = Arithmetic.div, mul = Arithmetic.mul, key;
    // https://en.wikipedia.org/wiki/Catalan_number
    // catalan numbers C(n) = (4n+2)C(n-1)/(n+1)
    if ( 14 >= n ) return 0 > n ? O : NUM(([1,1,2,5,14,42,132,429,1430,4862,16796,58786,208012,742900])[n]);
    key = String(n);
    if ( null == catalan.mem[key] )
        /*catalan.mem[key] = operate(function(c,i){return add(c,mul(catalan(i),catalan(n-1-i)));},O,null,0,n-1,1);*/
        catalan.mem[key] = div(mul(catalan(n-1),4*n-2),n+1);/* n -> n-1 */
    return catalan.mem[key];
}
catalan.mem = {};
function bell( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.N, add = Arithmetic.add, mul = Arithmetic.mul, key;
    // https://en.wikipedia.org/wiki/Bell_number
    // bell numbers B(n) = SUM[k:0->n-1] ( C(n-1,k) B(k) )
    if ( 12 >= n ) return 0 > n ? O : NUM(([1,1,2,5,15,52,203,877,4140,21147,115975,678570])[n]);
    key = String(n);
    if ( null == bell.mem[key] )
        bell.mem[key] = operate(function(b,k){return add(b,mul(factorial(n-1,k),bell(k)));},O,null,0,n-1,1);
    return bell.mem[key];
}
bell.mem = {};
function fibonacci( n )
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
        NUM = Arithmetic.N, add = Arithmetic.add, key;
    // http://en.wikipedia.org/wiki/Fibonacci_number
    // fibonacci numbers F(n) = F(n-1) + F(n-2)
    if ( 29 >= n ) return 0 > n ? O : NUM(([0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765, 10946,17711,28657,46368,75025,121393,196418,317811])[n]);
    key = String(n);
    if ( null == fibonacci.mem[key] )
        fibonacci.mem[key] = add(fibonacci(n-1),fibonacci(n-2));
    return fibonacci.mem[key];
}
fibonacci.mem = {};


Abacus.Class = Class;

// options
Abacus.Options = {
    MAXMEM: 1000000,
    RANDOM: "index"
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

// math/rnd utilities
Abacus.Math = {

 O: 0
,I: 1
,J: -1

,N: function( a ) { return Abacus.Arithmetic.add(Abacus.Arithmetic.O, a); }
,V: function( a ){ return Abacus.Arithmetic.sub(Abacus.Arithmetic.O, a); }

,rnd: stdMath.random
,rndInt: function( m, M ) { return Abacus.Math.round( (M-m)*Abacus.Math.rnd( ) + m ); }

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
,div: function( a, b ){ return Abacus.Math.floor(a/b); }
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
,floor: stdMath.floor
,ceil: stdMath.ceil
,round: stdMath.round

,num: function( a ) { return "number" === typeof a ? Abacus.Math.floor(a) : parseInt(a,10); }
,val: function( a ) { return Abacus.Math.floor(a.valueOf()); }

,sum: sum
,product: product
,pow2: pow2
,exp: exp
,factorial: factorial
,stirling: stirling
,partitions: partitions
,compositions: compositions
,bell: bell
,catalan: catalan
,fibonacci: fibonacci
};

// pluggable arithmetics, eg biginteger Arithmetic
Abacus.Arithmetic = {

 // whether using default arithmetic or using external implementation (eg big-int or other)
 isDefault: function( ){return (0 === Abacus.Arithmetic.O) && (Abacus.Arithmetic.add === addn);}

,O: 0
,I: 1
,J: -1
,N: Abacus.Math.N
,V: Abacus.Math.V

,equ: Abacus.Math.equ
,gte: Abacus.Math.gte
,lte: Abacus.Math.lte
,gt: Abacus.Math.gt
,lt: Abacus.Math.lt

,inside: Abacus.Math.inside
,clamp: Abacus.Math.clamp
,wrap: Abacus.Math.wrap
,wrapR: Abacus.Math.wrapR

,add: Abacus.Math.add
,sub: Abacus.Math.sub
,mul: Abacus.Math.mul
,div: Abacus.Math.div
,mod: Abacus.Math.mod
,pow: Abacus.Math.pow

,shl: Abacus.Math.shl
,shr: Abacus.Math.shr
,bor: Abacus.Math.bor
,band: Abacus.Math.band
,xor: Abacus.Math.xor

,abs: Abacus.Math.abs
,min: Abacus.Math.min
,max: Abacus.Math.max
,floor: Abacus.Math.floor
,ceil: Abacus.Math.ceil
,round: Abacus.Math.round
,rnd: Abacus.Math.rndInt

,num: Abacus.Math.num
,val: Abacus.Math.val

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
,sort: mergesort
,shuffle: shuffle
,pick: pick
,pluck: pluck

};

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

// combinatorial utilities, available as static methods of respective objects
function kronecker( /* var args here */ )
{
    var nv = arguments.length, k, a, r, l, i, j,
        vv, tensor, tl, kl, product;

    if ( !nv ) return [];

    if ( true === arguments[0] )
    {
        // flat tensor product
        for(kl=arguments[1].length,k=2; k<nv; k++) kl *= arguments[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = 0;
            for(j=1,r=k,a=1; a<nv; a++)
            {
                l = arguments[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = arguments[ a ][ i ];
                tensor += j*vv;
                j *= l;
            }
            product[ k ] = tensor;
        }
    }
    else
    {
        // component tensor product
        for(kl=arguments[0].length,k=1; k<nv; k++) kl *= arguments[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = new Array(nv); tl = 0;
            for(r=k,a=nv-1; a>=0; a--)
            {
                l = arguments[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = arguments[ a ][ i ];
                if ( is_array(vv) )
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
        return (min<=v[i0] && v[i0]<=max) && options.extra_conditions(v,i0,i1);
    } : function(v,i0,i1){
        return (min<=v[i0] && v[i0]<=max);
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
    return "<="===compare ? ncycles<=kcycles : (">="===compare ? ncycles>=kcycles : ncycles===kcycles);
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

// Abacus.CombinatorialIterator, Combinatorial Base Class and Iterator Interface
// NOTE: by substituting usual Arithmetic ops with big-integer ops,
// big-integers can be handled transparently throughout all the combinatorial algorithms
CombinatorialIterator = Abacus.CombinatorialIterator = Class({

    constructor: function CombinatorialIterator( name, n, $, sub ) {
        var self = this, klass, Arithmetic = Abacus.Arithmetic;
        if ( !(self instanceof CombinatorialIterator) ) return new CombinatorialIterator(name, n, $, sub);
        klass = self[CLASS];
        if ( is_array(name) && (name[0] instanceof CombinatorialIterator || name[name.length-1] instanceof CombinatorialIterator) )
        {
            // combinatorial sequence iterator instance
            self.$ = $ = n || {};
            $.seq = name; name = null;
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
            self.$ = $ = $ || {};
        }

        self.name = name || "CombinatorialIterator";
        $.type = String($.type || "default").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.rand = $.rand || {};
        $.sub = null;
        $.instance = self;

        self.init().order($.order);
        if ( sub && (sub.iter instanceof CombinatorialIterator) ) self.fuse(sub.method, sub.iter, sub.pos, sub.cascade);
    }

    ,__static__: {
         Iterable: function CombinatorialIterable( iter, dir ) {
            var self = this;
            if ( !(self instanceof CombinatorialIterable) ) return new CombinatorialIterable(iter, dir);
            dir = -1 === dir ? -1 : 1;
            self.next = function( ) {
                return iter.hasNext(dir) ? {value: iter.next(dir)/*, key: iter.index( )*/} : {done: true};
            };
        }

        // some C-P-T dualities, symmetries & processes at play here :))
        ,C: function( item, N, n, dir ){
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
                O = Arithmetic.O, N, index, seq, i, l;

            if ( $ && ("sequence"===$.type) )
            {
                seq = $.seq;
                if ( !seq || !seq.length ) return null;
                // uniform random sampling, taking into account the count of each iterator
                N = null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
                index = Arithmetic.rnd(O, N); i = 0; l = seq.length;
                while(Arithmetic.gte(index, seq[i].total()) )
                {
                    index = Arithmetic.sub(index, seq[i].total());
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
        ,rank: NotImplemented
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
            if ( -1 === DIR ) { var t = item; item = subitem; subitem = t; }
            if ( null == item || null == subitem ) return item || subitem || null;
            if ( "multiply" === method )
            {
                // O(n1 * n2)
                return kronecker(true, item, subitem);
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
        ,output: function( item, index, n, $ ) {
            var type = $ && $.type ? $.type : null, output = $ && null!=$.output ? $.output : null;
            return null == item ? null : (null == output ? ("sequence"===type ? item : item.slice()) : (is_callable(output) ? output(item,n) : (is_array(output) ? operate(function(a,ii,i){
                a[i] = 0<=ii && ii<output.length ? output[ii] : ii; return a;
            },new Array(item.length),item) : (is_string(output) ? operate(function(s,ii,i){
                s += 0<=ii && ii<output.length ? output.charAt(ii) : String(ii); return s;
            },"",item) : ("sequence"===type ? item : item.slice())))));
        }
    }

    ,name: "CombinatorialIterator"
    ,n: 0
    //,m: null
    //,i: null
    ,$: null
    ,__index: null
    ,_index: null
    ,__item: null
    ,item__: null
    ,_item: null
    ,__subindex: null
    ,_subindex: null
    ,__subitem: null
    ,_subitem: null
    ,_prev: null
    ,_next: null
    ,_traversed: null

    ,dispose: function( non_recursive ) {
        var self = this;
        if ( (true !== non_recursive) && self.$.sub )
        {
            self.$.sub.dispose();
            self.$.sub = null;
        }
        if ( "sequence" === self.$.type && self.$.seq && self.$.seq.length )
            operate(function(_,iter){iter.dispose();}, null, self.$.seq);

        self.name = null;
        self.n = null;
        //self.m = null;
        //self.i = null;
        self.$ = null;
        self.__index = null;
        self._index = null;
        self.__item = null;
        self.item__ = null;
        self._item = null;
        self.__subindex = null;
        self._subindex = null;
        self.__subitem = null;
        self._subitem = null;
        self._prev = null;
        self._next = null;
        if ( self._traversed )
        {
            self._traversed.dispose( );
            self._traversed = null;
        }
        return self;
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
            method = String(method||"project").toLowerCase();
            pos = pos || null; dir = -1===dir?-1:1;
            $.sub = combIter; $.submethod = method;
            $.subpos = pos; $.subcascade = dir;
            $.subcount = Abacus.Arithmetic.mul($.count, $.sub.total());
            if ( ("multiply" === method) )
                $.subdimension = $.dimension*$.sub.dimension();
            else if ( ("add" === method) || ("connect" === method) || ("concat" === method) || ("complete" === method) || ("interleave" === method) || ("join" === method) || ("combine" === method) )
                $.subdimension = $.dimension+$.sub.dimension();
            else
                $.subdimension = $.dimension;
            self.rewind();
        }
        return self;
    }

    ,unfuse: function( ) {
        return this.fuse(false);
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

    ,projectOn: function( combIter, dir ) {
        return this.fuse("project", combIter, null, dir);
    }

    ,base: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subbase || $.base || 0) : ($.base || 0);
    }

    ,dimension: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subdimension || $.dimension || 0) : ($.dimension || 0);
    }

    ,position: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subposition || $.position || null) : ($.position || null);
    }

    ,total: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subcount || $.count || 0) : ($.count || 0);
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

        self._item = klass.output(self.__item, self.__index, n, $);
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
        non_recursive = true === non_recursive;
        if ( !arguments.length ) return this.$.sub /*&& !non_recursive*/ ? this._subindex : this._index;

        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            n = self.n, $ = self.$, tot = $.sub && !non_recursive ? $.subcount : $.count,
            curindex = $.sub && !non_recursive ? self._subindex : self._index,
            order = $.order, tot_1/*, dir = REVERSED & order ? -1 : 1*/; // T

        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);

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
                self._item = klass.output(self.__item, self.__index, n, $);
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
            self._item = klass.output(self.__item, self.__index, n, $);

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

        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);

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
                item =  klass.output(
                    /*klass.unrank(indx, n, $)*/
                    klass.rand(n, $)
                    , indx, n, $
                );
                $.order = o;
                if ( $.sub ) item = klass.fusion($.submethod, item, subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
                return item;
            }
            else
            {
                indx = index;
                o = $.order; $.order = order;
                item = klass.output(Arithmetic.equ(O, index)
                ? klass.initial(n, $, 1)
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial(n, $, -1)
                : klass.unrank(indx, n, $)), indx, n, $);
                $.order = o;
                if ( $.sub ) item = klass.fusion($.submethod, item, subitem, self.dimension(), self.base(), $.subpos, $.subcascade);
                return item;
            }
        }
        return null;
    }

    ,random: function( type, m, M, non_recursive ) {
        var self = this, klass = self[CLASS], $ = self.$, item, o = $.order;
        non_recursive = true === non_recursive;
        if ( "index" === type )
        {
            var Arithmetic = Abacus.Arithmetic,
                N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
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
        $.order |= RANDOM;
        item = klass.rand(self.n, $);
        $.order = o;
        item = klass.output(item, null, self.n, $);
        return $.sub && !non_recursive ? klass.fusion($.submethod, item, $.sub.random(), self.dimension(), self.base(), $.subpos, $.subcascade) : item;
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
            current = $.sub ? self._subitem : self._item,
            has_curr = null != current, has_next;

        dir = -1 === dir ? -1 : 1;
        // random order has no prev
        if ( (0 > dir) && (RANDOM & order) ) return null;

        dI = 0 > dir ? J : I;
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
                if ( "sequence" === $.type && $.seq && $.seq.length )
                    for(i=0,l=$.seq.length; i<l; i++) $.seq[i].rewind(dir);
                self._reset(dir);
                has_next = null != self.__item;
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

        self._item = klass.output(self.__item, self.__index, n, $);

        if ( $.sub )
        {
            has_next = has_next && (null != self.__subitem);
            self._subindex = has_next ? Arithmetic.add(Arithmetic.mul(self.__subindex,tot), self._index) : null;
            self._subitem = has_next ? klass.fusion($.submethod, self._item, self.__subitem, self.dimension(), self.base(), $.subpos, $.subcascade) : null;
            if ( 0 > dir ) self._prev = has_next;
            else self._next = has_next;
        }

        return current;
    }

    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.sub ? $.subcount : $.count,
            tot_1 = $.sub ? Arithmetic.sub(tot,I) : $.last,
            range, count, i, iter_state, dir = 1,
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
            range = operate(function(range,ri,i){
                range[i] = self.next( ); return range;
            }, new Array(count+1), null, 0>dir?count:0, 0>dir?0:count, 0>dir?-1:1);

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

    // javascript @@iterator/@@iterable interface, if supported
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
    ,__iter__: function( ) {
        return new CombinatorialIterator.Iterable( this );
    }
});
if ( ('undefined' !== typeof Symbol) && ('undefined' !== typeof Symbol.iterator) )
{
    // add javascript-specific iterator interface, if supported
    CombinatorialIterator[PROTO][Symbol.iterator] = CombinatorialIterator[PROTO].__iter__;
}

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
            return "partial"===type ? ($.data&&$.data.length ? Abacus.Arithmetic.N($.data.length) : O) : ("tuple"===type ? (!n || (0 >= n[0]) ? O : Abacus.Math.exp(n[1], n[0])) : (!n || !n.length ? O : Abacus.Math.product(n)));
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
                order = $ && null!=$.order ? $.order : LEX;
            dir = -1 === dir ? -1 : 1;
            if ( "partial" === type )
            {
                if ( !$.data || !$.data.length ) return null;
                if ( REVERSED & order ) dir = -dir;
                var i = null == index ? $.data.indexOf(item) : Abacus.Arithmetic.val(index);
                return 0>dir ? (0<=i-1 ? $.data[i-1] : null) : (0<=i && i+1<$.data.length ? $.data[i+1] : null);
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
                index = Arithmetic.O, J = Arithmetic.J, index, nd, i;

            if ( "partial" === type )
            {
                index = Arithmetic.N($.data&&$.data.length ? $.data.indexOf(item) : -1);
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
        ,output: CombinatorialIterator.output
        ,gray: function(item, n) {
            return gray(new Array(item.length), item, n);
        }
        ,product: kronecker
        ,directsum: cartesian
        ,component: function( comp, base ) {
            return null == comp ? null : (null == base ? comp : array(comp.length, function(i){
                return i<base.length && 0<=comp[i] && comp[i]<base[i].length ? base[i][comp[i]] : comp[i];
            }));
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
                factorial = Abacus.Math.factorial, stirling = Abacus.Math.stirling,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if ( 0 > n )
                return O;
            else if ( "cyclic" === type )
                return Arithmetic.N(n);
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
                index = Arithmetic.NUM(item[0]);
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
                N = $ && null!=$.count ? $.count : Abacus.Math.factorial(n,M);
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
                N = $ && null!=$.count ? $.count : Abacus.Math.factorial(n,M);
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
        ,output: CombinatorialIterator.output
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
        ,is_permutation: is_permutation
        ,is_identity: is_identity
        ,is_cyclic: is_cyclic
        ,is_derangement: is_derangement
        ,is_involution: is_involution
        ,is_kthroot: is_kthroot
        ,is_connected: is_connected
        ,is_kcycle: is_kcycle
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
// Unordered Combinations, Ordered Combinations, Repeated Combinations, Ordered Repeated Combinations
Combination = Abacus.Combination = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k, $ ) {
        var self = this, sub = null;
        if ( !(self instanceof Combination) ) return new Combination(n, k, $);
        if ( is_array(n) )
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
        $.type = String($.type || "unordered").toLowerCase();
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
             var factorial = Abacus.Math.factorial,
                type = $ && $.type ? $.type : "unordered";
             return "ordered+repeated" === type ? (
                Abacus.Math.exp(n[0], n[1])
            ) : ("repeated" === type ? (
                factorial(n[0]+n[1]-1, n[1])
            ) : ("ordered" === type ? (
                factorial(n[0], -n[1])
            ) : (
                factorial(n[0], n[1])
            )));
         }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "unordered",
                order = $ && null!=$.order ? $.order : LEX;
            if ( 0===n[1] ) return [];

            dir = -1 === dir ? -1 : 1;
            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;

            // O(k)
            item = ("ordered+repeated" === type) || ("repeated" === type) ? (
                0 > dir ? array(n[1], n[0]-1, 0) : array(n[1], 0, 0)
            ) : ("ordered" === type ? (
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
            return next_combination(item, n, dir, $ && $.type ? $.type : "unordered", $ && null!=$.order ? $.order : LEX, CI);
        }
        ,rand: function( n, $ ) {
            var klass = this, type = $ && $.type ? $.type : "unordered",
                item, i, k = n[1], n_k, c,
                selected, rndInt = Abacus.Math.rndInt;
            if ( 0===k ) return [];

            n = n[0]; n_k = n-k; c = n-1;
            // O(klogk) worst/average-case, unbiased
            if ( ("repeated" === type) || ("ordered+repeated" === type) )
            {
                // p ~ 1 / n^k (ordered+repeated), p ~ 1 / binom(n+k-1,k) (repeated)
                item = 1 === k ? [rndInt(0, c)] : array(k, function(){return rndInt(0, c);});
                if ( (1 < k) && ("repeated" === type) ) mergesort(item, 1, true);
            }
            else if ( "ordered" === type )
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
            else//if ( ("unordered" === type) || ("binary" === type) )
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
                type = $ && $.type ? $.type : "unordered", factorial = Abacus.Math.factorial;

            if ( 0===k ) return O;
            item = klass.DUAL(item, n, $);

            if ( "ordered+repeated" === type )
            {
                // O(k)
                N = n[0];
                for(i=0; i<k; i++) index = add(mul(index, N), item[i]);
            }
            else if ( "repeated" === type )
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
            else if ( "ordered" === type )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // rank(ordered) = rank(k-n-permutation)
                // O(klgk)
                N = n[0]; item = permutation2inversion(null, item, N);
                for(i=0; i<k; i++) index = add(mul(index, N-i), item[ i ]);
            }
            else//if ( ("unordered" === type) || ("binary" === type) )
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
                type = $ && $.type ? $.type : "unordered", repeated,
                order = $ && null!=$.order ? $.order : LEX;
            n = n[0];

            if ( null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)) )
                return null;

            if ( 0===k ) return [];

            if ( (!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            item = array(k);
            if ( "ordered+repeated" === type )
            {
                // O(k)
                for(m=index,p=k-1; p>=0; p--)
                {
                    t = mod(m, n); m = div(m, n);
                    item[p] = val(t);
                }
            }
            else if ( "ordered" === type )
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
            else//if ( ("repeated" === type) || ("unordered" === type) || ("binary" === type) )
            {
                // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                // adjust the order to match MSB to LSB
                // O(k)
                repeated = "repeated" === type;
                N = repeated ? n+k-1 : n;
                binom = $ && $.count ? $.count : Abacus.Math.factorial(N, k);
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
        ,output: CombinatorialIterator.output
        ,complement: function( alpha, n, ordered ) {
            return true === ordered ? shuffle(complement(n, alpha, true)) : complement(n, alpha);
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
        ,pick: function( a, k, type ) {
            return (0 < k) && a.length ? pick(a, k, ("ordered+repeated"!==type)&&("ordered"!==type), ("ordered+repeated"===type)||("repeated"===type), new Array(k)) : [];
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
    if ( 'ordered' === type ) for(CI={},i=0; i<k; i++) CI[item[i]] = 1;
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
        if ( "ordered+repeated" === type )
        {
            i = i0;
            while( (MIN<=i && i<=MAX) && (item[i] === 0) ) i-=DI;
            if ( MIN<=i && i<=MAX )
                for(n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else if ( "ordered" === type )
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
        else//if ( ("unordered" === type) || ("repeated" === type) )
        {
            repeated = "repeated" === type; inc = repeated ? 0 : 1;
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
        if ( "ordered+repeated" === type )
        {
            i = i0;
            while( (MIN<=i && i<=MAX) && (item[i]+1 === n) ) i-=DI;
            if ( MIN<=i && i<=MAX )
                for(item[i]=item[i]+1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else if ( "ordered" === type )
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
        else//if ( ("unordered" === type) || ("repeated" === type) )
        {
            repeated = "repeated" === type; inc = repeated ? 0 : 1;
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
             return Abacus.Math.pow2(n);
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
        ,output: function output( item, index, n, $ ) {
            if ( null == item ) return null;
            if ( n+1===item.length )
            {
                var order = $&&null!=$.order ? $.order : LEX,
                    is_binary = $ && "binary"===$.type,
                    is_reflected = ((COLEX&order) && !(REFLECTED&order)) || ((REFLECTED&order) && !(COLEX&order));
                item = (is_binary && !is_reflected) || (is_reflected && !is_binary) ? item.slice(n-item[n],n) : item.slice(0,item[n]);
            }
            return CombinatorialIterator.output.call(this, item, index, n, $);
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
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
            return "composition"===type ? Abacus.Math.compositions(n, K, M) : Abacus.Math.partitions(n, K, M);
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
        ,output: function( item, index, n, $ ) {
            if ( null == item ) return null;
            var M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                order = $ && null!=$.order ? $.order : LEX,
                LEN = K ? K : (M ? n-M+1 : n);
            if ( LEN+1===item.length )
            {
                var //is_composition = $ && "composition"===$.type,
                    is_reflected = REFLECTED & order, is_colex = COLEX & order;
                item = /*(is_composition && (is_reflected && !is_colex || is_colex && !is_reflected)) ||*/ (is_reflected /*&& !is_composition*/) ? item.slice(LEN-item[LEN],LEN) : item.slice(0,item[LEN]);
            }
            return CombinatorialIterator.output.call(this, item, index, n, $);
        }
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
        isLatinSquare: is_latin
        ,make: function( n ) {
            var i, j, k=1, s = new Array(n);
            //s[0] = new Array(n); for (j=0; j<n; j++) s[0][j] = j+1;
            for (i=0; i<n; i++)
            {
                s[i] = new Array(n);
                for (j=0; j<n; j++) s[i][j] = (j+i)%n + 1;
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
        isMagicSquare: is_magic
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
