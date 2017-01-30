/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python, Java, C/C++
*   @version: 0.8.2
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

var  Abacus = {VERSION: "0.8.2"}, stdMath = Math, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array.prototype.slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,log2 = stdMath.log2 || function(x) { return stdMath.log(x) / stdMath.LN2; }
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim ? function( s ){ return s.trim(); } : function( s ){ return s.replace(trim_re, ''); }
    
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
    
    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32
    ,LEXICAL = LEX | COLEX | MINIMAL
    ,ORDERINGS = LEXICAL | RANDOM | REVERSED | REFLECTED
    
    ,CombinatorialIterator, Tensor, Permutation, Combination, Subset, Partition
;

// utility methods
function NotImplemented( )
{
    throw new Error("Method not implemented!");
}
function is_array( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
function is_string( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
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
        operate("function" === typeof x0 ? function(x,xi,i){
            x[i] = x0(i); return x;
        } : (x0 === +x0 ? function(x,xi,i){
            x[i] = xk; xk += xs; return x;
        } : function(x,xi,i){
            x[i] = x0; return x;
        }), x, x);
    }
    return x;
}
function pluck( a, k, inplace )
{
    return operate(function(b, ai, i){
        b[i] = ai[k]; return b;
    }, true === inplace ? a : new Array(a.length), a);
}
function complementation( b, a, n, a0, a1 )
{
    return null == a ? b : operate(is_array(n) ? function(b, ai, i){
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
    if ( a0 < a1 ) for(var t,l=a0,r=a1; l<r; l++,r--) { t = a[l]; b[l] = a[r]; b[r] = t; }
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
    if ( null == a ) return null;
    var s = 0;
    return operate(is_array(n) ? function(b, ai, i){
        b[i] = n[i] > 0 ? (ai + s) % n[i] : 0; s += n[i] - b[i]; return b;
    } : function(b, ai, i){
        b[i] = (ai + s) % n; s += n - b[i]; return b;
    }, b, a, a0, a1);
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
function difference/*complement*/( diff, a, b, dir, a0, a1, b0, b1 )
{
    dir = -1 === dir ? -1 : 1;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a === +a ? a-1 : a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b ? b.length-1 : -1;
    
    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ai = a0, bi = a0, dl = 0;
    if ( !b || !b.length ) return a === +a ? array(a, a0, ak) : (a ? a.slice() : a);
    if ( null == diff ) diff = new Array(al);
    
    // O(al)
    // assume lists are already sorted ascending/descending (independantly)
    if ( a === +a )
    {
        while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
        {
            if      ( ai === b[bi] )
            {
                ai+=ak; bi+=ak;
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
                ai+=ak; bi+=ak;
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
function mergesort( a, dir, indices, a0, a1 )
{
    // http://en.wikipedia.org/wiki/Merge_sort
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var ak = a0 > a1 ? -1 : 1, N = ak*(a1-a0)+1;
    indices = true === indices;
    // in-place
    if ( 1 >= N ) return indices ? (1 === N ? [a0] : []) : a;
    dir = -1 === dir ? -1 : 1;
    var logN = N, size = 1, size2 = 2, min = stdMath.min, aux = new Array(N);
    if ( indices )
    {
        a = operate(function(b,ai,i){b[i-a0]=[ai,i]; return b;}, new Array(N), a, a0, a1, 1);
        a0 = 0; a1 = N-1;
    }
    // O(NlgN)
    while( 0 < logN )
    {
        operate(function(X,j){
            merge(aux, a, a, dir, a0+ak*j, a0+ak*(j+size-1), a0+ak*(j+size), a0+ak*min(j+size2-1, N-1), indices, false, true);
        }, null, null, 0, N-size-1, size2);
        size <<= 1; size2 <<= 1; logN >>= 1;
    }
    return indices ? pluck(a, a, 1) : a;
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
    return Arithmetic.shl(Arithmetic.I, Arithmetic.N(n));//(1 << n)>>>0;
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
        // derangement sub-factorial D(n) = n D(n-1) + (-1)^n = !n = [(n!+1)/e]
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
        key = String(n)+'@'+m.join(',');
        if ( null == factorial.mem3[key] )
            factorial.mem3[key] = div(factorial(n), operate(function(N, mk){
                return mul(N, factorial(mk));
            }, factorial(m[m.length-1]), m, m.length-2, 0));
        return factorial.mem3[key];
    }
    else if ( m === +m )
    {
        if ( 0 > m )
        {
            // selections, ie m!binomial(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if ( -m > n ) return O;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] )
                factorial.mem3[key] = operate(mul, I, null, n+m+1, n);
            return factorial.mem3[key];
        }
        // https://en.wikipedia.org/wiki/Binomial_coefficient
        // binomial = C(n,m) = C(n-1,m-1)+C(n-1,m) = n!/m!(n-m)!
        if ( m+m > n  ) m = n-m; // take advantage of symmetry
        if ( (0 > m) || (1 > n) ) return O;
        else if ( (0 === m) || (1 === n) ) return I;
        else if ( 1 === m ) return NUM(n);
        key = String(n)+'@'+String(m);
        if ( null == factorial.mem3[key] )
            factorial.mem3[key] = Arithmetic.isDefault() ? stdMath.round(operate(function(Cnm, i){
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
function p_nkab( n, k, a, b )
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // CLOSED FORM FORMULA FOR THE NUMBER OF RESTRICTED COMPOSITIONS (http://www.fmf.uni-lj.si/~jaklicg/papers/compositions_revision.pdf)
    // compute number of integer partitions of n
    // into exactly k parts having summands between a and b (inclusive)
    // a + k-1 <= n <= k*b
    var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add,
        key, key2, p = Arithmetic.O;
    if ( (0 > n) || (0 >= k) || (a > b) || (a+k > n+1) || (k*b < n) ) return p;
    if ( ((b === n) && (1 === k)) || ((k === n) && (1 === b)) ) return Arithmetic.I;
    //if ( a === b ) return k*a === n ? Arithmetic.I : p;
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == p_nkab.mem[key] )
    {
        // compute it directly
        //p_nkab(n-k*(a-1), k, 1, b-a+1);
        n = n-k*(a-1); b = b-a+1;
        key2 = String(n)+','+String(k)+','+String(a)+','+String(b);
        if ( null == p_nkab.mem[key2] )
            p_nkab.mem[key2] = operate(function(p, j){
                return add(p, p_nkab(n-b, k-1, 1, j));
            }, p, null, stdMath.max(1, stdMath.ceil((n-b)/(k-1))), stdMath.min(b, n-b-k+2), 1);
        p_nkab.mem[key] = p_nkab.mem[key2];
    }
    return p_nkab.mem[key];
}
p_nkab.mem = {};
function partitions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    K = null == K ? null : K|0; M = null == M ? null : M|0;
    var add = Abacus.Arithmetic.add,
        key, k, m, p = Abacus.Arithmetic.O,
        m0 = M ? M : 0, m1 = M ? M : 1,
        k0 = K ? K : 1, k1 = K ? K : n;
    if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (M && M > n) || (K && K > n) ) return p;
    if ( M && !K ) { m0 = 0; m1 = 1; k0 = M; k1 = M; K = M; M = null; } // count the conjugates, same
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == partitions.mem[key] )
    {
        partitions.mem[key] = operate(function(p, k){
            return operate(function(pk, m){
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
    var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add,
        key, c = Arithmetic.O;
    if ( (0 > n) || (0 >= k) || (a > b) || (a+k > n+1) || (k*b < n) ) return c;
    if ( a === b ) return k*a === n ? Arithmetic.I : c;
    if ( n === b ) return factorial(n-k*a+k-1, k-1);
    if ( a+1 === b ) return factorial(k, n-k*a);
    key = String(n)+','+String(k)+','+String(a)+','+String(b);
    if ( null == c_nkab.mem[key] )
    {
        // compute it directly
        c_nkab.mem[key] = operate(function(c, i){
            return add(c, c_nkab(i, k-1, a, b));
        }, c, null, n-b, n-a, 1);
    }
    return c_nkab.mem[key];
}
c_nkab.mem = {};
function compositions( n, K /*exactly K parts or null*/, M /*max part is M or null*/ )
{
    K = null == K ? null : K|0; M = null == M ? null : M|0;
    var key, c = Abacus.Arithmetic.O, add = Abacus.Arithmetic.add;
    if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (M && M > n) || (K && K > n) ) return c;
    key = String(n)+'|'+String(K)+'|'+String(M);
    if ( null == compositions.mem[key] )
    {
        if ( K && M )
            compositions.mem[key] = c_nkab(n, K, 1, M);
        else if ( K )
            compositions.mem[key] = c_nkab(n, K, 1, n);
        else if ( M )
            compositions.mem[key] = operate(function(c, k){
                return add(c, c_nkab(n, k, 1, M));
            }, c, null, stdMath.ceil(n/M), n, 1);
        else
            compositions.mem[key] = 1 <= n ? pow2(n-1) : Arithmetic.I;
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
    if ( is_string(o) )
    {
        o = o.toUpperCase( ).split(',');
        var order = 0, i, l = o.length;
        for(i=0; i<l; i++) order |= HAS.call(ORDER,o[i]) ? ORDER[o[i]] : 0;
        if ( (0 < order) && !(order&(LEXICAL|RANDOM)) ) order |= LEX;
        if ( order & RANDOM ) order &= ~REVERSED;
        return 0 < order ? order : LEX;
    }
    if ( o & RANDOM ) o &= ~REVERSED;
    return ORDERINGS & o ? o : LEX;
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
    var k, a, r, l, i, j, vv, tensor,
        v = arguments, nv = v.length,
        kl, product;
    
    if ( !nv ) return [];
    
    if ( true === v[0] )
    {
        // flat tensor product
        for(kl=v[1].length,k=2; k<nv; k++) kl *= v[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = 0;
            for(j=1,r=k,a=1; a<nv; a++)
            {
                l = v[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = v[ a ][ i ];
                tensor += j*vv;
                j *= l;
            }
            product[ k ] = tensor;
        }
    }
    else
    {
        // component tensor product
        for(kl=v[0].length,k=1; k<nv; k++) kl *= v[ k ].length;
        product = new Array( kl );
        for(k=0; k<kl; k++)
        {
            tensor = [ ];
            for(r=k,a=nv-1; a>=0; a--)
            {
                l = v[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = v[ a ][ i ];
                if ( is_array(vv) )
                {
                    // kronecker can be re-used to create higher-order products
                    // i.e kronecker(alpha, beta, gamma) and kronecker(kronecker(alpha, beta), gamma)
                    // should produce exactly same results
                    for (j=vv.length-1; j>=0; j--)
                        tensor.unshift( vv[ j ] );
                }
                else
                {
                    tensor.unshift( vv );
                }
            }
            product[ k ] = tensor;
        }
    }
    return product;
}
function subset2binary( item, n )
{
    if ( 0 > n ) return [];
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
            conjugate = subset2composition(difference(null, n-1, composition2subset(item, l-1, dir)));
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
function multiset2permutation( multiset )
{
    // O(nlgn) get associated permutation(unique elements) = invpermutation of indices that sorts the multiset
    // from multiset permutation(repeated elements)
    return permutation2inverse(null, mergesort(multiset, 1, true/*return indices*/));
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
function permutationproduct( permutations )
{
    var perm = permutations/*1 === arguments.length && is_array(arguments[0]) ? arguments[0] : arguments*/,
        nperms = perm.length, 
        composed = nperms ? perm[0] : [],
        n = composed.length, i, p, comp;
    for(p=1; p<nperms; p++)
    {
        comp = composed.slice( );
        for (i=0; i<n; i++) composed[ i ] = comp[ perm[ p ][ i ] ];
    }
    return composed;
}
function permutationconcatenation( permutations )
{
    var perm = permutations, nperms = perm.length, concatenated, n = 0, i, p, k, pm, pl;
    for(p=0; p<nperms; p++) n += perm[p].length;
    for(concatenated=new Array(n),k=0,p=0; p<nperms; p++)
    {
        pm = perm[p]; pl = pm.length;
        for(i=0; i<pl; i++) concatenated[ k+i ] = k+pm[ i ];
        k += pl;
    }
    return concatenated;
}
function is_permutation( perm, n )
{
    n = n || perm.length;
    if ( n !== perm.length ) return false;
    var cnt = array(n, 0, 0), i, pi;
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
    for(var n=perm.length,i=0; i<n; i++) if ( perm[i] !== i ) return false;
    return true;
}
function is_involution( perm )
{
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
    /*return 0===k ? is_identity(perm) : (1===k ? is_involution(perm) : (k&1 ? is_identity(permutationproduct(array(k, perm))) : is_involution(permutationproduct(array(k>>>1, perm)))));*/
}
function is_derangement( perm, kfixed, strict )
{
    kfixed = kfixed|0;
    for(var nfixed=0,n=perm.length,i=0; i<n; i++)
    {
        if ( perm[i] === i ) nfixed++;
        if ( nfixed > kfixed ) return false;
    }
    return true === strict ? nfixed === kfixed : true;
}
function is_cyclic/*_shift*/( perm )
{
    for(var n=perm.length,i=1,i0=perm[0]; i<n; i++)
        if ( perm[i] !== ((i0+i)%n) ) return false;
    return true;
}
function is_connected( perm )
{
    // from: http://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf
    for (var n=perm.length-1,m=-1,i=0,pi=perm[i]; i<n; i++,pi=perm[i])
    {
        // for all proper prefixes, do:
        if ( pi > m ) m = pi; // update max
        if ( m <= i ) return false; // prefix mapped to itself, not connected (is decomposable)
    }
    return true;
}

// Abacus.CombinatorialIterator, Combinatorial Base Class and Iterator Interface
// NOTE: by substituting usual Arithmetic ops with big-integer ops,
// big-integers can be handled transparently throughout all the combinatorial algorithms
CombinatorialIterator = Abacus.CombinatorialIterator = Class({
    
    constructor: function CombinatorialIterator( name, n, $ ) {
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic;
        self.name = name || "CombinatorialIterator";
        self.n = n || 0;
        self.$ = $ = $ || {};
        $.type = String($.type || "default").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.base = $.base || 0;
        $.minbase = null != $.minbase ? $.minbase : $.base;
        $.maxbase = null != $.maxbase ? $.maxbase : $.base;
        $.dimension = $.dimension || 0;
        $.mindimension = null != $.mindimension ? $.mindimension : $.dimension;
        $.maxdimension = null != $.maxdimension ? $.maxdimension : $.dimension;
        $.rand = $.rand || {};
        $.count = klass.count( self.n, self.$ );
        $.first = Arithmetic.O;
        $.last = Arithmetic.gt($.count, Arithmetic.O) ? Arithmetic.sub($.count, Arithmetic.I) : Arithmetic.J;
        if ( $.sub instanceof CombinatorialIterator )
        {
            $.subcount = Abacus.Arithmetic.mul($.count, $.sub.total());
            $.submethod = String($.submethod || "project").toLowerCase();
            $.subcascade = -1 === $.subcascade ? -1 : 1;
            if ( "concatenate" === $.submethod )
                $.subdimension = $.dimension+$.sub.dimension();
            else if ( "compose" === $.submethod )
                $.subdimension = $.dimension*$.sub.dimension();
            else
                $.subdimension = $.dimension;
        }
        $.instance = self;
        self.order( $.order ); 
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
        ,C: function( item, C0 ){
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            return complementation(item, item, C0);
        }
        ,P: function( item ){
            // P process / symmetry, ie Reflection/Parity, PP = I
            return reflection(item, item);
        }
        ,T: function(item, T0 ){
            // T process / symmetry, ie Reversion/Time, TT = I
            return reversion(item, T0);
        }
        ,DUAL: function dual( item, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, C = klass.C, P = klass.P, T = klass.T,
                C0 = $ && (null!=$.base) ? $.base : n,
                //P0 = $ && (null!=$.dimension) ? $.dimension : n,
                order = $ && null!=$.order ? $.order : LEX;
            if ( RANDOM & order ) item = REFLECTED & order ? P(item) : item;
            else if (MINIMAL & order ) item = REFLECTED & order ? P(item) : item;
            else if ( COLEX & order ) item = REFLECTED & order ? C(item,C0,$) : P(C(item,C0,$));
            else/*if ( LEX & order )*/item = REFLECTED & order ? P(item) : item;
            return item;
        }
        ,count: NotImplemented
        ,initial: NotImplemented
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( (null == n) || (null == item) || (null == index) ) return null;
            var klass = this, Arithmetic = Abacus.Arithmetic,
                order = $ && null!=$.order ? $.order : LEX;
            dir = -1 === dir ? -1 : 1;
            return klass.unrank(Arithmetic.add(index, 0>dir?Arithmetic.J:Arithmetic.I), n, $);
        }
        ,rand: function( n, $ ) {
            var item, klass = this, Arithmetic = Abacus.Arithmetic,
                N = $ && null!=$.last ? $.last : Arithmetic.sub(klass.count(n, $), Arithmetic.I),
                O = Arithmetic.O, index = Arithmetic.rnd(O, N);
            
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
        ,unrank: NotImplemented
        ,cascade: function( item, subitem, method, cascade ) {
            if ( -1 === cascade ) { var t = item; item = subitem; subitem = t; }
            if ( "concatenate" === method ) return item && subitem ? item.concat(subitem) : (item || subitem || null);
            else if ( "compose" === method ) return item && subitem ? kronecker(true, item, subitem) : (item || subitem || null);
            else/*if ( "project" === method )*/ return null == item || null == subitem ? null : array(item.length, function(i){return item[i]<subitem.length ? subitem[item[i]] : null;});
        }
        ,output: function( item, index, n, $ ) {
            return null == item ? null : item.slice();
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
    
    ,base: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subbase || $.base || 0) : ($.base || 0);
    }
    
    ,dimension: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subdimension || $.dimension || 0) : ($.dimension || 0);
    }
    
    ,total: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subcount || $.count || 0) : ($.count || 0);
    }
    
    ,_init: function( dir ) {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            order = $.order, r, tot, tot_1;
        
        self.__index = self._index = O;
        self._item = self.__item = self.item__ = null;
        self._prev = false; self._next = false;
        tot = $.count; tot_1 = $.last;
        
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
            self.__item = klass.initial(n, $, dir);
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
            rewind = true === order;
        
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
        
        self._init(dir);
        
        if ( $.sub )
        {
            self._prev = self._prev && (null != self.__subitem);
            self._next = self._next && (null != self.__subitem);
            self._subindex = Arithmetic.add(Arithmetic.mul(self.__subindex,$.count), self._index);
            self._subitem = klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade);
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
                self._subitem = klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade);
            }
        }
        return self;
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
                if ( $.sub ) item = klass.cascade(item, subitem, $.submethod, $.subcascade);
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
                if ( $.sub ) item = klass.cascade(item, subitem, $.submethod, $.subcascade);
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
        return $.sub && !non_recursive ? klass.cascade(item, $.sub.random(), $.submethod, $.subcascade) : item;
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
                self._init(dir);
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
            self._subitem = has_next ? klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade) : null;
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
Tensor = Abacus.Tensor = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Tensor( /*dims here ..*/ ) {
        var self = this, n = slice.call(arguments), $;
        $ = n.length && !(n[n.length-1] instanceof CombinatorialIterator) && !is_array(n[n.length-1]) && (n[n.length-1] !== +n[n.length-1]) ? n.pop( ) || {} : {};
        $.type = String($.type || "tensor").toLowerCase();
        $.order = $.order || LEX;
        if ( n.length && is_array(n[0]) ) n = n[0];
        if ( !n || !n.length ) n = [];
        if ( !(self instanceof Tensor) ) return new Tensor(n, $);
        if ( "tuple" === $.type )
        {
            n[0] = n[0]||1; n[1] = n[1]||1;
            if ( n[0] instanceof CombinatorialIterator )
            {
                $.sub = n[0];
                n[0] = $.sub.dimension();
            }
            else if ( n[1] instanceof CombinatorialIterator )
            {
                $.sub = n[1];
                n[1] = $.sub.base();
            }
            $.base = n[1];
            $.dimension = n[0];
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
        }
        CombinatorialIterator.call(self, "Tensor", n, $);
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function( n, $ ) {
            var O = Abacus.Arithmetic.O, type = $ && $.type ? $.type : "tensor";
            return "tuple"===type ? (!n || (0 >= n[0]) ? O : Abacus.Math.exp(n[1], n[0])) : (!n || !n.length ? O : Abacus.Math.product(n));
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "tensor",
                order = $ && $.order ? $.order : LEX;
            
            dir = -1 === dir ? -1 : 1;
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            
            // O(n)
            item = "tuple" === type ? (
                !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
            ) : (
                !n.length ? [] : (0 > dir ? array(n.length, function(i){return n[i]-1;}): array(n.length, 0, 0))
            );
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, TI ) {
            if ( !n || !n[0] || (0 >= n[0]) || (null == item) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_tensor(item, n, dir, $ && $.type ? $.type : "tensor", $ && null!=$.order ? $.order : LEX, TI);
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, klass = this, item,
                type = $ && $.type ? $.type : "tensor";
            
            item = "tuple" === type ? (
                // p ~ 1 / n^k, O(n)
                !n[0] ? [] : array(n[0], function(i){return rndInt(0, n[1]-1);})
            ) : (
                // p ~ 1 / n1*n2*..nk, O(n)
                !n.length ? [] : array(n.length, function(i){return rndInt(0, n[i]-1);})
            );
            
            item = klass.DUAL(item, n, $);
            
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
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
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
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);
            
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
            
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,output: CombinatorialIterator.output
        ,gray: gray
        ,product: kronecker
        ,component: function( tensor, basev ) {
            var component = [ ], v = basev, nd = v.length, i, j, vi, vv, iv, vl;
            for (i=0; i<nd; i++)
            {
                vi = v[ i ]; iv = tensor[ i ]; vv = vi[ iv ];
                if ( vv instanceof Array )
                {
                    for (j=0,vl=vv.length; j<vl; j++)
                        component.push( vv[ j ] );
                }
                else
                {
                    component.push( vv );
                }
            }
            return component;
        }
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
        var self = this;
        if ( !(self instanceof Permutation) ) return new Permutation(n, $);
        $ = $ || {}; $.type = String($.type || "permutation").toLowerCase();
        n = n||1;
        if ( n instanceof CombinatorialIterator )
        {
            $.sub = n;
            n = $.sub.dimension();
        }
        $.base = $.dimension = n;
        // random ordering for derangements / involutions / connecteds
        // is based on random generation, instead of random unranking
        $.rand = {"derangement":1,"involution":1,"connected":1};
        if ( "multiset" === $.type )
        {
            $.multiplicity = is_array($.multiplicity) && $.multiplicity.length ? $.multiplicity.slice() : array(n, 1, 0);
            $.multiplicity = $.multiplicity.concat(array(n-operate(addn, 0, $.multiplicity), 1, 0));
            $.base = $.multiplicity.length;
            $.multiset = multiset($.multiplicity, n);
        }
        CombinatorialIterator.call(self, "Permutation", n, $);
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function( n, $ ) {
            var O = Abacus.Arithmetic.O,
                factorial = Abacus.Math.factorial,
                type = $ && $.type ? $.type : "permutation";
            if ( 0 >= n )
                return O;
            else if ( "cyclic" === type )
                return Abacus.Arithmetic.N(n);
            else if ( "multiset" === type )
                return factorial(n, $.multiplicity);
            else if ( "derangement" === type )
                return 2 > n ? O : factorial(n, false);
            else if ( "involution" === type )
                return factorial(n, true);
            else if ( "connected" === type )
                return factorial(n-1);
            else//if ( "permutation" === type )
                return factorial(n);
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "permutation",
                order = $ && null!=-$.order ? $.order : LEX;
            
            if ( 0 >= n ) return null;
            dir = -1 === dir ? -1 : 1;
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            // O(n)
            if ( "cyclic" === type )
            {
                item = 0 > dir ? [n-1].concat(array(n-1, 0, 1)) : array(n, 0, 1);
            }
            else if ( "derangement" === type )
            {
                if ( 2 > n ) return null;
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
            else//if ( ("involution" === type) || ("permutation" === type) )
            {
                item = 0 > dir ? array(n, n-1, -1) : array(n, 0, 1);
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, PI ) {
            if ( !n || (0 >= n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "permutation";
            dir = -1 === dir ? -1 : 1;
            return next_permutation(item, n, dir, type, $ && null!=$.order ? $.order : LEX, $ && null!=$.base ? $.base : null, PI);
        }
        ,rand: function( n, $ ) {
            var item, rndInt = Abacus.Math.rndInt, klass = this, type = $ && $.type ? $.type : "permutation";
                
            if ( "cyclic" === type )
            {
                // p ~ 1 / n, O(n)
                var k = rndInt(0, n-1);
                item = 0 < k ? array(n-k, k, 1).concat(array(k, 0, 1)) : array(n, 0, 1);
            }
            else if ( "derangement" === type )
            {
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
                order = $ && null!=-$.order ? $.order : LEX,
                sub = Arithmetic.sub, add = Arithmetic.add,
                mul = Arithmetic.mul, div = Arithmetic.div,
                index = Arithmetic.O, i, ii, m, I = Arithmetic.I, N, M;
            
            n = n || item.length;
            if ( !n ) return Arithmetic.J;
            
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
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // O(nlgn)
                item = permutation2inversion(null, item);
                for(m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), item[i]);
            }
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);
            
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                order = $ && null!=-$.order ? $.order : LEX,
                mod = Arithmetic.mod, div = Arithmetic.div, mul = Arithmetic.mul,
                sub = Arithmetic.sub, val = Arithmetic.val,
                item, r, i, ii, b, t, N, M;
            
            if ( !n ) return [ ];
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
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
        ,cascade: CombinatorialIterator.cascade
        ,output: CombinatorialIterator.output
        ,permute: function( arr, permutation, copied ) {
            var i, l = arr.length, p, a;
            if ( true === copied ) { p = array(l); a = arr; }
            else { p = arr; a = arr.slice(); }
            for (i=0; i<l; i++) p[i] = a[permutation[i]];
            return p;
        }
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
        ,compose: function( /* permutations */ ) {
            return permutationproduct( slice.call(arguments) );
        }
        ,concatenate: function( /* permutations */ ) {
            return permutationconcatenation( slice.call(arguments) );
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
    }
});
function next_permutation( item, N, dir, type, order, multiplicity, PI )
{
    //maybe "use asm"
    var n = N, m = null == multiplicity ? n : multiplicity,
        k, kl, l, r, s, fixed, k0, DK, a, b, da, db, MIN, MAX;
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
    
    // constant average delay (CAT) for permutations & multisets, linear worst-case for derangements
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
            // adapted from http://www.jjj.de/fxt/#fxt (Jörg Arndt)
            k = n; fixed = false;
            while( k-- )
            {
                kl = item[k];   // inverse perm == perm
                item[k] = k; item[kl] = kl;  // undo prior swap

                while( kl-- )
                {
                    if ( item[kl] === kl )
                    {
                        item[k] = kl; item[kl] = k;  // swap
                        fixed = true; break;
                    }
                }
                if ( fixed ) break;
            }
            if ( !fixed )*/ item = null; // last
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
        var self = this;
        if ( !(self instanceof Combination) ) return new Combination(n, k, $);
        if ( is_array(n) )
        {
            $ = k || {};
            k = n[1]||1;
            n = n[0]||1;
        }
        else
        {
            $ = $ || {};
            n = n||1;
            k = k||1;
        }
        $.type = String($.type || "unordered").toLowerCase();
        if ( -1 < $.type.indexOf('+') )
        {
            var a = $.type.split('+');
            a.sort(); $.type = a.join('+');
        }
        
        if ( k instanceof CombinatorialIterator )
        {
            $.sub = k;
            k = $.sub.dimension();
        }
        else if ( n instanceof CombinatorialIterator )
        {
            $.sub = n;
            n = $.sub.base();
        }
        $.base = n;
        $.dimension = k;
        CombinatorialIterator.call(self, "Combination", [n, k], $);
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
            dir = -1 === dir ? -1 : 1;
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
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
            if ( !n || !n[0] || (0 >= n[0]) || (null == item) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_combination(item, n, dir, $ && $.type ? $.type : "unordered", $ && null!=$.order ? $.order : LEX, CI);
        }
        ,rand: function( n, $ ) {
            var klass = this, type = $ && $.type ? $.type : "unordered",
                item, i, k = n[1], n_k, c,
                selected, rndInt = Abacus.Math.rndInt;
            n = n[0]; n_k = n-k; c = n-1;
            // O(klogk) worst/average-case, unbiased
            if ( ("repeated" === type) || ("ordered+repeated" === type) )
            {
                // p ~ 1 / n^k (ordered+repeated), p ~ 1 / binom(n+k-1,k) (repeated)
                item = 1 === k ? [rndInt(0, c)] : array(k, function(){return rndInt(0, c);});
                if ( (1 < k) && ("repeated" === type) ) mergesort( item );
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
                    difference(null, n, mergesort(array(n_k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    })))
                ) : (
                    mergesort(array(k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    }))
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
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
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
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
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
        ,cascade: CombinatorialIterator.cascade
        ,output: function( item, index, n, $ ) {
            if ( null == item ) return null;
            item = $ && "binary" === $.type ? subset2binary(item, n[0]) : item.slice();
            return item;
        }
        ,complement: function( alpha, n, ordered ) {
            return true === ordered ? shuffle(difference(null, n, mergesort(alpha))) : difference(null, n, alpha);
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
        ,pick: function( a, k, type ) {
            return (0 < k) && a.length ? pick(a, k, ("ordered+repeated"!==type)&&("ordered"!==type), ("ordered+repeated"===type)||("repeated"===type), new Array(k)) : [];
        }
        ,choose: function( arr, comb ) {
            return array(comb.length, function(i){return arr[comb[i]];});
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
        var self = this;
        if ( !(self instanceof Subset) ) return new Subset(n, $);
        $ = $ || {}; $.type = $.type || "subset";
        n = n||1;
        if ( n instanceof CombinatorialIterator )
        {
            $.sub = n;
            n = $.sub.base();
        }
        $.base = n;
        $.dimension = n;
        $.mindimension = 0;
        $.maxdimension = n;
        CombinatorialIterator.call(self, "Subset", n, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            return difference( null, n, item );
         }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function( item, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, C = klass.C, P = klass.P, T = klass.T,
                order = $ && null!=$.order ? $.order : LEX;
            if ( RANDOM & order ) item = REFLECTED & order ? item : P(item);
            else if ( MINIMAL & order ) item = REFLECTED & order ? item : P(item);
            else if ( COLEX & order ) item = REFLECTED & order ? P(C(item,n)) : C(item,n);
            else/*if ( LEX & order )*/item = REFLECTED & order ? item : P(item);
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
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            
            // O(n)
            item = 0 > dir ? array(n, 0, 1) : [];
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: CombinatorialIterator.succ
        ,rand: function( n, $ ) {
            var klass = this, rndInt = Abacus.Math.rndInt, item;
            // p ~ 1 / 2^n, O(n)
            for(var list = null,i=n-1; i>=0; i--) if ( rndInt(0,1) )
                list = {len:list?list.len+1:1, k:i, next:list};
            item = list ? array(list.len, function(i){var k = list.k; list = list.next; return k;}): [];
            
            item = klass.DUAL(item, n, $);
            
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
                index = O, i = 0, l = item.length;
            
            item = klass.DUAL(item, n, $);
            
            // O(n)
            while ( i < l ) index = add(index, shl(I, item[i++]));
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);
            
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, J = Arithmetic.J,
                band = Arithmetic.band, shr = Arithmetic.shr, gt = Arithmetic.gt, 
                sub = Arithmetic.sub,
                order = $ && null!=$.order ? $.order : LEX,
                item = [], i = 0, count = $ && $.count ? $.count : klass.count(n, $);
            if ( !Arithmetic.inside(index, J, count) ) return null;
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(count,Arithmetic.I), index);
            
            // O(n)
            while ( gt(index, O) )
            {
                // loop unrolling
                if ( gt(band(index,1),O) ) item.push( i );
                if ( gt(band(index,2),O) ) item.push( i+1 );
                if ( gt(band(index,4),O) ) item.push( i+2 );
                if ( gt(band(index,8),O) ) item.push( i+3 );
                if ( gt(band(index,16),O) ) item.push( i+4 );
                if ( gt(band(index,32),O) ) item.push( i+5 );
                if ( gt(band(index,64),O) ) item.push( i+6 );
                if ( gt(band(index,128),O) ) item.push( i+7 );
                i+=8; index = shr(index, 8);
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,output: function output( item, index, n, $ ) {
            if ( null == item ) return null;
            var _item = item;
            if ( $ && "binary"===$.type ) item = subset2binary(item, n);
            return _item===item ? item.slice() : item;
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
    }
});
/*function next_subset( item, N, dir, order, SI )
{
    //maybe "use asm"
    var MIN = 0, MAX = N-1, IMIN, IMAX, t, DI, i0, i1, a, b;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    DI = 1; a = 1; b = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        a = -a; b = MAX-b;
        DI = -DI;
        //dir = -dir;
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
        IMIN = N-(SI[0]||1); IMAX = N-1;
        i0 = IMAX; i1 = IMIN;
    }
    else
    {
        IMIN = 0; IMAX = SI[0]-1;
        i0 = IMIN; i1 = IMAX;
    }
    
    // loopless, item is of fixed dimensions n, with effective length "SI" as extra param
    if ( 0 > dir )
    {
        // NOTE: colex+reversed does not work
        if ( 0 < SI[0] )
        {
            t = item[i1];
            if ( t > MIN )
            {
                if ( 1 === SI[0] || t>item[i1-DI]+1 )
                {
                    // extend
                    item[i1] -= 1; item[i1+DI] = MAX;
                    SI[0]++;
                }
                else
                {
                    // reduce
                    SI[0]--;
                }
            }
            else
            {
                // empty
                SI[0] = 0;
            }
        }
        else item = null;
    }
    else
    {
        // adapted from "Generating All and Random Instances of a Combinatorial Object", Ivan Stojmenovic (http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576)
        if ( 0 === SI[0] )
        {
            // empty
            item[IMIN] = a*MIN+b; SI[0] = 1;
        }
        else if ( a*item[i0]+b < MAX )
        {
            if ( a*item[i1]+b < MAX )
            {
                // extend
                item[i1+DI] = item[i1]+a; SI[0]++;
            }
            else
            {
                // reduce
                item[i1-DI] += a; SI[0]--;
            }
        }
        // last
        else item = null;
    }
    // NOTE: effective item = item.slice(0,SI[0]) or item.slice(N-SI[0]) (reflected);
    return item;
}*/

// https://en.wikipedia.org/wiki/Partitions
// https://en.wikipedia.org/wiki/Composition_(combinatorics)
// integer compositions (resp. restricted k-compositions) have bijections ("isomorphisms") to subsets (resp. k-subsets=combinations)
// via "partial-sums mapping": x_1=y_1,..,x_k=y_k-y_{k-1},..,x_m (composition) ::=> y_1=x_1,..,y_k=y_{k-1}+x_k,..,y_m (subset)
Partition = Abacus.Partition = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Partition( n, $ ) {
        var self = this;
        if ( !(self instanceof Partition) ) return new Partition(n, $);
        $ = $ || {}; $.type = $.type || "partition";
        n = n||1;
        if ( n instanceof CombinatorialIterator )
        {
            $.sub = n;
            n = $.sub.base();
        }
        var M = $["max="] ? $["max="]|0 : null, K = $["parts="] ? $["parts="]|0 : null,
            k1 = K ? K : (M ? n-M+1 : n), k0 = K ? K : (M ? stdMath.ceil(n/M) : 1);
        $.base = n;
        $.dimension = K || n;
        $.mindimension = stdMath.min(k0,k1);
        $.maxdimension = stdMath.max(k0,k1);
        $.rand = {"partition":1,"composition":1,"packed":1};
        CombinatorialIterator.call(self, "Partition", n, $);
    }
    
    ,__static__: {
         C: function( item, C0, $ ) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                dir = REFLECTED & order ? -1 : 1,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( ("composition" !== type) && (COLEX & order) ) reflection(item,item);
            return K || M ? item : conjugatepartition("composition"===type, item, /*dir*/1);
         }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
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
                is_composition = "composition" === type, conj = false;
            
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            
            dir = -1 === dir ? -1 : 1;
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && (REVERSED&order)) )
                dir = -dir;
            
            // O(n)
            if ( K && M )
            {
                // restricted partition n into exactly K parts with largest part=M
                // equivalent to partition n-M into K-1 parts with largest part<=M
                if ( 1 === K )
                {
                    item = [M];
                }
                if ( is_composition )
                {
                    m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                    item = [((n-M)%m)||m].concat(array(K-2, m, 0)).concat([M]);
                    if ( 0 > dir ) reflection(item,item);
                }
                else if ( 0 > dir )
                {
                    k = stdMath.min(K, stdMath.floor(n/M)||1); n-=k*M; K-=k;
                    if ( (0===n) && (0<K) ) { k--; K++; n+=M; }
                    item = [M].concat(array(k-1, M, 0)).concat((0<n)&&(0<K)?[n-K+1].concat(array(K-1, 1, 0)) : []);
                }
                else
                {
                    m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                    item = [M].concat(array(K-2, m, 0).concat([((n-M)%m)||m]));
                }
            }
            else
            {
                if ( K )
                {
                    // restricted partition n to exactly K parts
                    // equivalent to conjugate to partition n into parts with largest part=K
                    if ( is_composition )
                    {
                        item = array(K-1, 1, 0).concat([n-K+1]);
                        if ( 0 > dir ) reflection(item,item);
                    }
                    else
                    {
                        m = stdMath.ceil(n/K); k = (n%m)||m;
                        item = 0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K-1, m, 0).concat([k]);
                    }
                }
                else if ( M )
                {
                    // restricted partition n into parts with largest part=M
                    // equivalent to conjugate to partition n into exactly M parts
                    if ( is_composition )
                    {
                        item = array(n-M, 1, 0).concat([M]);
                        if ( 0 > dir ) reflection(item,item);
                    }
                    else
                    {
                        k = stdMath.floor(n/M); m = n%M;
                        item = 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0));
                    }
                }
                else
                {
                    // unrestricted partition/composition
                    item = 0 > dir ? [n] : array(n, 1, 0);
                }
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, PI ) {
            if ( (null == n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            dir = -1 === dir ? -1 : 1;
            return "composition" === type ? next_composition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, PI) : next_partition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, PI);
        }
        ,rand: function( n, $ ) {
            var klass = this, rndInt = Abacus.Math.rndInt,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                list, item, m, x, y, y1 = 0, yn = 0,
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
                    array(item=mergesort(array(K-1, function(){
                        // select uniformly without repetition
                        y = rndInt(0, m);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === list[y] ) y = (y+1)%(m+1);
                        list[y] = 1;
                        return y+1;
                    })), function(i){
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
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,cascade: CombinatorialIterator.cascade
        ,output: function( item, index, n, $ ) {
            if ( null == item ) return null;
            var klass = this, _item = item,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                dir = REFLECTED & order ? -1 : 1,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( "composition" === type )
            {
                // TODO, get conjugate order for now
                //if ( M && !K ) item = conjugatepartition(1, item, dir);
            }
            else
            {
                // TODO, get conjugate order for now
                //if ( K && !M ) item = conjugatepartition(0, item, dir);
                
                /*if ( ($ && "constant"===$['length']) && (item.length < n) )
                    item = 0 > dir ? array(n-item.length, 0, 0).concat(item) : item.concat(array(n-item.length, 0, 0));*/
                if ( "packed" === type ) item = packpartition(item, dir);
            }
            return _item===item ? item.slice() : item;
        }
        ,conjugate: function( item, type ) {
            return conjugatepartition("composition" === type, item);
        }
        ,subset: function( item, dir ) {
            return -1 === dir ? subset2composition(item) : composition2subset(item);
        }
        ,pack: function( item, dir ) {
            return -1 === dir ? unpackpartition(item) : packpartition(item)
        }
    }
});
// aliases
Partition.transpose = Partition.conjugate;
function next_partition( item, N, dir, K, M, order, PI )
{
    //maybe "use asm"
    var n = N, i, j, i0, i1, k, m, d, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = item.length-1;
    DI = 1; i0 = MIN; i1 = MAX;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    // TODO, get the conjugate order for now
    //if ( K && !M ) { M = K; K = null; }
        
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
                    item = 0 > DI ? item.slice(i) : item.slice(0, i+1);
                    if ( m < rem )
                    {
                        j = rem%m;
                        item = 0 > DI ? (j?[j]:[]).concat(array(stdMath.floor(rem/m), m)).concat(item) : item.concat(array(stdMath.floor(rem/m), m)).concat(j?[j]:[]);
                    }
                    else if ( 0 < rem )
                    {
                        item = 0 > DI ? [rem].concat(item) : item.concat([rem]);
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
                    m = MAX > k || item[i0+(k-1)*DI] < m;
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
                    if ( 0 < rem )
                        item = 0 > DI ? array(rem, 1).concat(item.slice(i)) : item.slice(0, i+1).concat(array(rem, 1));
                    else
                        item = 0 > DI ? item.slice(i) : item.slice(0, i+1);
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
    var n = N, i, j, i0, i1, k, m, d, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = item.length-1;
    DI = 1; i0 = MIN; i1 = MAX;
    /*if ( COLEX & order )
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0; i1 = MAX-i1;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    // TODO, get the conjugate order for now
    //if ( M && !K ) { K = M; M = null; }
    
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
                // TODO
                item = null;
            }
            else
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( n > item.length )
                    {
                        i = i1; rem = 0;
                        while(MIN<=i && i<=MAX && 1===item[i] ){ i-=DI; rem++; }
                        m = item[i]-1; item[i] = m; rem++;
                        if ( 0 < rem )
                        {
                            if ( MIN<=i+DI && i+DI<=MAX )
                            {
                                i+=DI; item[i]=rem; rem=0;
                                if ( 0 > DI ) item = item.slice(i);
                                else item = item.slice(0,i+1);
                            }
                            else
                            {
                                if ( 0 > DI ) item = array(rem, 1, 0).concat(item);
                                else  item = item.concat(array(rem, 1, 0));
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
                // TODO
                item = null;
            }
            else
            {
                if ( COLEX & order )
                {
                    item = null;
                }
                else
                {
                    if ( n > item[i0] )
                    {
                        rem = item[i1]; item[i1-DI]++;
                        if ( 0 > DI )
                        {
                            item.shift();
                            item.unshift.apply(item, array(rem-1, 1, 0));
                        }
                        else
                        {
                            item.pop();
                            item.push.apply(item, array(rem-1, 1, 0));
                        }
                    }
                    // last
                    else item = null;
                }
            }
        }
    }
    return item;
}

// export it
return Abacus;
});
