/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python
*   @version: 0.7.6
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

var  Abacus = {VERSION: "0.7.6"}, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array.prototype.slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim
        ? function( s ){ return s.trim(); }
        : function( s ){ return s.replace(trim_re, ''); }
    ,is_array = function( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
    ,is_string = function( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
    ,stdMath = Math, log2 = stdMath.log2 || function(x) { return stdMath.log(x) / stdMath.LN2; }
    ,to_fixed_binary_string_32 = function( b ) {
        var bs = b.toString( 2 ), n = 32-bs.length;
        return n > 0 ? new Array(n+1).join('0') + bs : bs;
    }
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
function array( n, x0, xs )
{
    var x = is_array(n) ? n : ((n=(n|0)) > 0 ? new Array(n) : []), q, r, i, k, xi;
    n = x.length;
    if ( (0 < n) && (null != x0) )
    {
        r = n&15; q = r&1;
        if ( x0 === +x0 )
        {
            xs = xs||0; xi = x0;
            if ( q ) { x[0] = xi; xi += xs; }
            for(k=q; k<r; k+=2)
            {
                i =  k; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
            }
            for(k=r; k<n; k+=16)
            {
                i =  k; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
                i += 1; x[i] = xi; xi += xs;
            }
        }
        else if ( "function" === typeof x0 )
        {
            if ( q ) { x[0] = x0(0); }
            for(k=q; k<r; k+=2)
            {
                i =  k; x[i] = x0(i);
                i += 1; x[i] = x0(i);
            }
            for(k=r; k<n; k+=16)
            {
                i =  k; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
                i += 1; x[i] = x0(i);
            }
        }
        else
        {
            if ( q ) { x[0] = x0; }
            for(k=q; k<r; k+=2)
            {
                i =  k; x[i] = x0;
                i += 1; x[i] = x0;
            }
            for(k=r; k<n; k+=16)
            {
                i =  k; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
                i += 1; x[i] = x0;
            }
        }
    }
    return x;
}
function operate( F, F0, x, i0, i1, ik )
{
    var Fv = F0, l, i;
    if ( x && is_array(x) )
    {
        l = x.length;
        if ( null == i0 ) i0 = 0;
        if ( null == i1 ) i1 = l-1;
        if ( null == ik ) ik = 1;
        if ( 0 < l )
        {
            if ( 0 > ik ) for(i=i0; i>=i1; i+=ik) Fv = F(Fv,x[i],i);
            else for(i=i0; i<=i1; i+=ik) Fv = F(Fv,x[i],i);
        }
    }
    else
    {
        //ik = i1; i1 = i0; i0 = x;
        ik = ik || 1; l = (i1-i0)/ik+1;
        if ( 0 < l )
        {
            if ( 0 > ik ) for(i=i0; i>=i1; i+=ik) Fv = F(Fv,i,i);
            else for(i=i0; i<=i1; i+=ik) Fv = F(Fv,i,i);
        }
    }
    return Fv;
}
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
function sum( x )
{
    return operate(Abacus.Arithmetic.add, Abacus.Arithmetic.O, x);
}
function product( x )
{
    return operate(Abacus.Arithmetic.mul, Abacus.Arithmetic.I, x);
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
        div = Arithmetic.div, mul = Arithmetic.mul,
        N, k, Nk, l, key;
    if ( null == m )
    {
        // http://www.luschny.de/math/factorial/index.html
        // simple factorial = n! = n (n-1)!
        if ( 10 >= n ) return 0 > n ? O : (0 === n ? I : NUM(([1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800])[n-1]));
        key = String(n)/*+'!'*/;
        if (null == factorial.mem1[key] )
            factorial.mem1[key] = mul(factorial(n-1),n);
            //factorial.mem1[key] = operate(mul, I, null, 2, n);
        return factorial.mem1[key];
    }
    else if ( false === m )
    {
        // derangement sub-factorial = !n = n !(n-1) + (-1)^n = [(n!+1)/e]
        if ( 10 >= n ) return 2 > n ? O : NUM(([1, 2, 9, 44, 265, 1854, 14833, 133496, 1334961])[n-2]);
        key = '!'+String(n);
        // !1 = 1 !0 - 1 = 0
        // !2 = 2 !1 + 1 = 1
        // !3 = 3 !2 - 1 = 2 = 3*(2*0 + 1) -1
        // !4 = 4 !3 + 1 = 9 = 4*(3*(2*0 + 1) -1) + 1
        if (null == factorial.mem2[key] )
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            factorial.mem2[key] = add(n&1 ? J : I, mul(factorial(n-1,false),n));
            /*factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);*/
        return factorial.mem2[key];
    }
    else if ( true === m )
    {
        // involution factorial = I(n) = I(n-1) + (n-1) I(n-2)
        if ( 10 >= n ) return 0 > n ? O : (0 === n ? I : NUM(([1, 2, 4, 10, 26, 76, 232, 764, 2620, 9496])[n-1]));
        key = 'I'+String(n);
        if (null == factorial.mem2[key] )
            factorial.mem2[key] = add(factorial(n-1,true), mul(factorial(n-2,true),n-1));
        return factorial.mem2[key];
    }
    else if ( is_array(m) )
    {
        // multinomial = n!/m1!..mk!
        if ( !m.length ) return 0 > n ? O : factorial(n);
        else if ( 0 > n ) return O;
        key = String(n)+'@'+m.join(',');
        if ( null == factorial.mem3[key] )
        {
            N = factorial(m[m.length-1]);
            for(k=m.length-2; k>=0; k--) N = mul(N, factorial(m[k]));
            factorial.mem3[key] = div(factorial(n), N);
        }
        return factorial.mem3[key];
    }
    else if ( m === +m )
    {
        if ( 0 > m )
        {
            // selections, ie m!binomial(n,m) = n!/(n-m)! = (n-m+1)*..(n-1)*n
            if ( -m > n ) return O;
            key = String(n)+'@'+String(m);
            if ( null == factorial.mem3[key] ) factorial.mem3[key] = operate(mul, I, null, n+m+1, n);
            return factorial.mem3[key];
        }
        // binomial = n!/m!(n-m)!
        if ( m+m > n  ) m = n-m; // take advantage of symmetry
        if ( (0 > m) || (1 > n) ) return O;
        else if ( (0 === m) || (1 === n) ) return I;
        else if ( 1 === m ) return NUM(n);
        key = String(n)+'@'+String(m);
        if ( null == factorial.mem3[key] ) factorial.mem3[key] = div(factorial(n,-m), factorial(m));
        /*{
            n = n-m; Nk = NUM( 1+n );
            for (k=2; k<=m; k++) Nk = mul(Nk, 1+n/k);
            factorial.mem3[key] = Arithmetic.round( Nk );
        }*/
        return factorial.mem3[key];
    }
    return O;
}
factorial.mem1 = {};
factorial.mem2 = {};
factorial.mem3 = {};
function p_nkm( n, k, m )
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // compute number of integer partitions of n
    // into exactly k parts having m as max value
    // m + k-1 <= n <= k*m
    var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add,
        key, j, jmax, jmin, p = Arithmetic.O;
    if ( ((m === n) && (1 === k)) || ((k === n) && (1 === m)) ) return Arithmetic.I;
    if ( (m+k > n+1) || (k*m < n) ) return p;
    key = String(n)+','+String(k)+','+String(m);
    if ( null == p_nkm.mem[key] )
    {
        // compute it directly
        jmin = stdMath.max(1, stdMath.ceil((n-m)/(k-1)));
        jmax = stdMath.min(m, n-m-k+2);
        for(j=jmin; j<=jmax; j++) p = add(p, p_nkm(n-m, k-1, j));
        p_nkm.mem[key] = p;
    }
    return p_nkm.mem[key];
}
p_nkm.mem = {};
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
        for(k=k0; k<=k1; k++) for(m=m0?m0:n-k+1; m>=m1; m--) p = add(p, p_nkm(n, k, m));
        partitions.mem[key] = p;
    }
    return partitions.mem[key];
}
partitions.mem = {};
// C process / symmetry, ie Rotation, CC = I
function conjugation( a, n, a0, a1, rel )
{
    if ( null == a ) return null;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( a0 <= a1 )
    {
        var l=a0, r=a1, lr=r-l+1, m=lr&1?l+(lr>>>1):-1, ln=l, rn=r, mn=m;
        if ( is_array(n) )
        {
            if ( rel ) { ln -= a0; rn -= a0; mn -= a0; }
            for(a[m]=0<=m?n[mn]-1-a[m]:a[m]; l<r; l++,r--,ln++,rn--)
            {
                a[l] = n[ln]-1-a[l];
                a[r] = n[rn]-1-a[r];
            }
        }
        else
        {
            for(a[m]=0<=m?n-1-a[m]:a[m]; l<r; l++,r--)
            {
                a[l] = n-1-a[l];
                a[r] = n-1-a[r];
            }
        }
    }
    return a;
    /*return null == a ? null : array(a, is_array(n)?function(i){
        return n[i]-1-a[i];
    }:function(i){
        return n-1-a[i];
    });*/
}
// P process / symmetry, ie Reflection, PP = I
function parity( a, n, a0, a1 )
{
    if ( null == a ) return null;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( a0 < a1 ) for(var t,l=a0,r=a1; l<r; l++,r--) { t = a[l]; a[l] = a[r]; a[r] = t; }
    return a;
}
// T process / symmetry, ie Reversion, TT = I
function inversion( n, n0 )
{
    if ( null == n0 ) n0 = 0;
    return is_array(n) ? array(n, function(i){
        return n0-n[i];
    }) : ((n===+n)&&(n0===+n0) ? (n0-n) : Abacus.Arithmetic.sub(Abacus.Arithmetic.N(n0),n));
}
function rotate(x, n, s, RTL)
{
    // adapted from FXT library
    if ( null == x || 1 >= n ) return x;
    if ( s >= n )  s %= n;
    if ( 0 === s ) return x;

    var reflect/*reverse*/ = parity,
        i0 = RTL ? n-s : s, i1 = n-i0, i2 = n;

    // Shift is taken modulo n
    // RTL: Rotate away from element #0
    // LTR: Rotate towards element #0
    return reflect(
        reflect(
            reflect(x, null, 0, i0)
        ,null, i0, i1)
    ,null, 0, i2);
}
/*function gray( a, C0, a0, a1 )
{
    if ( null == a ) return null;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( a0 < a1 )
    {
        // using the definition of gray code
        // ie G{a} = a[0]+G{a[1:n/2]} + C{a[n/2]}+P{G{a[n/2:]}}
        // taking into account even/odd indexes (ie integer/half-integer spin symmetries),
        // can produce (generic) gray code (along with C-P-T symmetries)
        var n = a1-a0+1;
        gray(a, C0, a0+1, a0+n/2);
        conjugation(a, C0, a0+n/2, a0+n/2);
        parity(gray(a, C0, a0+n/2), null, a0+n/2);
    }
    return a;
}*/
function gray( a, n, a0, a1, rel )
{ 
    // adapted from https://en.wikipedia.org/wiki/Gray_code#n-ary_Gray_code
    if ( null == a ) return null;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( a0 <= a1 )
    {
        if ( is_array(n) ) for(var s=0,i=a1,j=rel?i-a0:i; i>=a0; i--,j--) {
            a[i] = n[j] > 0 ? (a[i] + s) % n[j] : 0;
            s += n[j] - a[i];
        }
        else for(var s=0,i=a1; i>=a0; i--) {
            a[i] = (a[i] + s) % n;
            s += n - a[i];
        }
    }
    return a;
}
function intersect( a, b, a0, a1, b0, b1, intersection )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b.length-1;
    
    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1,
        ai = a0, bi = b0, il = 0;
    if ( null === intersection ) intersection = new Array(stdMath.min(al,bl));
    if ( 0 === intersection.length ) return intersection;
    
    // assume lists are already sorted ascending/descending (indepentantly)
    while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
    {
        if      ( a[ai] < b[bi] )
        { 
            ai+=ak; 
        }
        else if ( a[ai] > b[bi] )
        { 
            bi+=bk; 
        }
        else // they're equal
        {
            intersection[il++] = a[ ai ];
            ai+=ak; bi+=bk;
        }
    }
    // truncate if needed
    if ( il < intersection.length ) intersection.length = il;
    return intersection;
}
function difference( a, b, a0, a1, b0, b1, diff )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a === +a ? a-1 : a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b ? b.length-1 : -1;
    
    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1,
        ai = a0, bi = a0, dl = 0;
    if ( !b || !b.length ) return a === +a ? array(a, a0, ak) : (a ? a.slice() : a);
    if ( null == diff ) diff = new Array(al);
    
    // assume lists are already sorted ascending/descending (independantly)
    if ( a === +a )
    {
        while( (0 <= ak*(a1-ai)) && (0 <= bk*(b1-bi)) )
        {
            if      ( ai === b[bi] )
            {
                ai+=ak; bi+=ak;
            }
            else if ( ai > b[bi] )
            {
                bi+=bk; 
            }
            else //if ( a[ai] < b[bi] )
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
            else if ( a[ai] > b[bi] )
            {
                bi+=bk; 
            }
            else //if ( a[ai] < b[bi] )
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
function merge( a, b, a0, a1, b0, b1, unique, inplace, union )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b.length-1;
    unique = false !== unique;
    
    var ak = a0 > a1 ? -1 : 1, bk = b0 > b1 ? -1 : 1,
        al = ak*(a1-a0)+1, bl = bk*(b1-b0)+1, ul = al+bl,
        ai = a0, bi = b0, ui = 0, last, with_duplicates = !unique;
    if ( null == union ) union = new Array(ul);
    if ( 0 === union.length ) return true === inplace ? a : union;
    
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
        if      ( a[ai] < b[bi] )
        { 
            union[ui++] = last = a[ai]; ai+=ak;
        }
        else if ( a[ai] > b[bi] )
        { 
            union[ui++] = last = b[bi]; bi+=bk;
        }
        else // they're equal, push one unique
        {
            union[ui++] = last = a[ ai ];
            if ( with_duplicates ) union[ui++] = b[ bi ];
            ai+=ak; bi+=bk;
        }
    }
    while ( 0 <= ak*(a1-ai) ) { if ( with_duplicates || (a[ai] !== last) ) union[ui++] = last = a[ai]; ai+=ak; }
    while ( 0 <= bk*(b1-bi) ) { if ( with_duplicates || (b[bi] !== last) ) union[ui++] = last = b[bi]; bi+=bk; }
    if ( true === inplace )
    {
        // move the merged back to the a array
        for(ai=a0,ui=0; ui<ul; ui++,ai+=ak) a[ai] = union[ui];
        return a;
    }
    else
    {
        // truncate if needed
        if ( ui < union.length ) union.length = ui;
        return union;
    }
}
function mergesort( a, a0, a1 )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var ak = a0 > a1 ? -1 : 1, N = ak*(a1-a0)+1;
    // in-place
    if ( 1 >= N ) return a;
    var logN = N, j, n, size = 1, size2 = 2, min = stdMath.min, aux = new Array(N);
    while( logN )
    {
        n = N-size;
        for(j=0; j<n; j+=size2)
            merge(a, a, a0+ak*j, a0+ak*(j+size-1), a0+ak*(j+size), a0+ak*min(j+size2-1, N-1), false, true, aux);
        size <<= 1; size2 <<= 1; logN >>= 1;
    }
    return a;
}
/*function make_btree( a, a0, a1 )
{
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    var l=a0, r=a1, m, am, tree = {t:null, l:null, r:null, v:null, k:null};
    if ( l === r ) {tree.v = a[l]; tree.k = l;}
    while(l<r)
    {
        m = l+((r-l+1)>>>1);
        am = a[m];
        if ( v === am ) return m;
        else if ( v < am ) r = m-1;
        else l = m+1;
    }
    return tree;
}
function searchtree( v, t )
{
    while( t )
    {
        if ( v === t.v ) return t.k;
        t = v < t.v ? t.l : t.r;
    }
    return null;
}*/
function searchb( v, a, a0, a1 )
{
    // binary search O(logn)
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
        else if ( v < am ) r = m-1;
        else l = m+1;
    }
    return -1;
}
function multiset( m, n )
{
    var nm = m.length, k = 0, mk = m[k];
    return array(n, function(){
        if ( 0 >= mk ) { k++; mk = k < nm ? m[k] : 1; }
        mk--;
        return k;
    });
}
function shuffle( a, cyclic, a0, a1 )
{
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
    var rndInt = Abacus.Math.rndInt, N, perm, swap, offset = true === cyclic ? 1 : 0, inc;
    if ( is_array(a0) )
    {
        inc = a0; N = inc.length;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = a[ inc[N] ]; 
            a[ inc[N] ] = a[ inc[perm] ]; 
            a[ inc[perm] ] = swap; 
        }
    }
    else
    {
        if ( null == a0 ) a0 = 0;
        if ( null == a1 ) a1 = a.length-1;
        N = a1-a0+1;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = a[ a0+N ]; 
            a[ a0+N ] = a[ a0+perm ]; 
            a[ a0+perm ] = swap; 
        }
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
function conjugatepartition( partition, dir )
{
    if ( null == partition ) return null;
    // http://mathworld.wolfram.com/ConjugatePartition.html
    var l = partition.length, n, i, j, k, p, conjpartition,
        a = 1, b = 0, d = 0, push = "push", reflected = -1 === dir;
    if ( reflected )
    {
        a = -a;
        b = l-1-b;
        push = "unshift";
    }
    if ( is_array(partition[b]) )
    {
        // packed representation
        p = partition[b];
        conjpartition = [[p[1], p[0]]]; k = 0;
        for(j=1; j<l; j++)
        {
            p = partition[a*j+b]; i = reflected ? 0 : k;
            if ( p[1] === conjpartition[i][0] )
            {
                conjpartition[i][1] += p[0];
            }
            // swap part with multiplicity
            else
            {
                conjpartition[push]([p[1], p[0]]); k++;
            }
        }
    }
    else
    {
        // unpacked representation
        n = partition[b]; conjpartition = array(n, 1, 0);
        if ( reflected ) d = n-1-d;
        for(j=1; j<l; j++)
        {
            i = 0; p = partition[a*j+b];
            while( (i < n) && (p > 0) ) { conjpartition[a*i+d]++; p--; i++; }
        }
    }
    return conjpartition;
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
function subset2composition( subset, x0, composition )
{
    if ( null == subset ) return null;
    var y = 0;
    x0 = x0 || 0;
    return array(composition||subset.length, function(i){
        var x = subset[i]-y;
        y = subset[i];
        return x0+x;
    });
}
function composition2subset( composition, x0, subset )
{
    if ( null == composition ) return null;
    var y = 0;
    x0 = x0 || 0;
    return array(subset||composition.length, function(i){
        y += composition[i]-x0;
        return y;
    });
}
function partition2sets( partition )
{
    if ( null == partition ) return null;
    var item = 0;
    return array(partition.length, function(k){
        var n = partition[k], subset = array(n, item, 1);
        item += n;
        return subset;
    });
}
function sets2partition( set_partition )
{
    if ( null == set_partition ) return null;
    return array(set_partition.length, function(k){
        return set_partition[k].length;
    });
}
function permutation2inversion2( permutation, inversion, LTR )
{
    // O(n^2) inversion computation
    var i, j, n = permutation.length;
    inversion = inversion || new Array(n);
    if ( LTR )
    {
        // left inversion count
        inversion[0]=0;
        for(i=1,inversion[i]=0; i<n; i++)for(j=0; j<i; j++)
            if ( permutation[j] > permutation[i] ) inversion[i]++;
    }
    else
    {
        // right inversion count
        for(i=0,inversion[i]=0; i<n; i++)for(j=i+1; j<n; j++)
            if ( permutation[j] < permutation[i] ) inversion[i]++;
    }
    return inversion;
}
function multipermutation2inversion( permutation, multiset, inversion )
{
    // O(n log n) inversion computation
    // "Multiset Permutations in Lexicographic Order", Ting Kuo 2014 (https://pdfs.semanticscholar.org/e944/bec5f53938cbc9381a9113b42e5c5d145faa.pdf)
    var n = permutation.length;
    inversion = inversion || new Array(n);
    for(var i=n-1; i>0; i--)
    {
        // ordinal representation
        inversion[i] = searchb(permutation[n-1-i], multiset);
        // this is NOT O(1) in general
        multiset.splice(inversion[i],1);
    }
    inversion[0] = 0;
    return inversion;
}
function permutation2inversion( permutation, inversion, N, M, dir )
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = permutation.length, i, pi, ii, j,
        node, ctr, k, kk, Tl, T, twok,
        i0 = -1===dir ? n-1 : 0, ik = -1===dir ? -1 : 1;
    
    k = Abacus.Math.ceil(log2(N||n)); twok = 1 << k;
    Tl = (1<<(1+k))-1; T = array(Tl, 0, 0);
    inversion = inversion || new Array(n);
    
    for(ii=i0,i=0; i<n; i++,ii+=ik)
    {
        pi = permutation[i];
        ctr = pi;
        // Starting bottom-up at the leaf associated with pi
        kk = (M && 0 < M[pi] ? M[pi]-- : 1)-1;
        node = ctr + twok + 1-(1 << kk);
        for(j=0; j<k; j++)
        {
            // 1) if the current node is the right child of its parent then subtract from the counter the value stored at the left child of the parent
            if ( node&1 ) ctr -= T[(node >>> 1) << 1];
            // 2) increase the value stored at the current node.
            T[node] += 1;
            // 3) move-up the tree
            node >>>= 1;
        }
        T[node] += 1;
        inversion[ii] = ctr;
    }
    return inversion;
}
function inversion2permutation( inversion, permutation, N, dir )
{
    // O(n log n) inversion computation
    // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
    var n = inversion.length, permutation,
        i, ii, j, i2, digit, node, k, Tl, T, twok,
        i0 = -1===dir ? n-1 : 0, ik = -1===dir ? -1 : 1;
    
    k = Abacus.Math.ceil(log2(N||n)); twok = 1 << k;
    Tl = (1<<(1+k))-1; T = new Array(Tl);
    for(i=0; i<=k; i++)
        for(j=1,i2=1<<i; j<=i2; j++) 
            T[i2-1+j] = 1 << (k-i);
    
    permutation = permutation || new Array(n);
    for(ii=i0,i=0; i<n; i++,ii+=ik)
    {
        digit = inversion[i]; 
        // Starting top-down the tree
        node = 1;
        for(j=0; j<k; j++)
        {
            T[node] -= 1;
            node <<= 1;
            // next node as the left or right child whether digit is less than the stored value at the left child
            if ( digit >/*=*/ T[node] )
            {
                // If the next node is the right child, then the value of the left child is subtracted from digit
                digit -= T[node];
                node++;
            }
        }
        T[node] = 0;
        permutation[ii] = node - twok;
    }
    return permutation;
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
function permutation2matrix( permutation, transposed )
{
    var n = permutation.length, n2 = n*n,
        matrix = new Array(n2), i, j;
    for(i=0,j=0; i<n2; )
    {
        matrix[i+j] = 0;
        if ( ++j >= n ) { j=0; i+=n; }
    }
    if ( true === transposed )
        for(i=0; i<n; i++) matrix[n*permutation[i]+i] = 1;
    else
        for(i=0,j=0; j<n; j++,i+=n) matrix[i+permutation[i]] = 1;
    return matrix;
}
function matrix2permutation( matrix, transposed )
{
    var n2 = matrix.length, n = stdMath.floor(stdMath.sqrt(n2)),
        permutation = new Array(n), i, j;
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
function permutation2inverse( permutation )
{
    var n = permutation.length, i, inv_permutation = new Array(n);
    for(i=0; i<n; i++) inv_permutation[permutation[i]] = i;
    return inv_permutation;
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
    for(var pi,n=perm.length,i=0; i<n; i++)
    {
        pi = perm[i];
        if ( (0 > pi) || (n <= pi) || (perm[pi] !== i) ) return false;
    }
    return true;
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
function is_indecomposable/*is_connected*/( perm )
{
    // from: http://maths-people.anu.edu.au/~brent/pd/Arndt-thesis.pdf
    for (var n=perm.length-1,m=-1,i=0; i<n; i++) // for all proper prefixes, do:
    {
        if ( perm[i] > m ) m = perm[i]; // update max.
        if ( m <= i ) return false; // prefix mapped to itself, P not connected.
    }
    return true; // P is connected.
}
function is_cyclic/*_shift*/( perm )
{
    for(var n=perm.length,i=1,i0=perm[0]; i<n; i++)
        if ( perm[i] !== ((i0+i)%n) ) return false;
    return true;
}
function is_kthroot( perm, k )
{
    k = k || 0;
    return 0===k ? is_identity(perm) : (1===k ? is_involution(perm) : (k&1 ? is_identity(permutationproduct(array(k, perm))) : is_involution(permutationproduct(array(k>>>1, perm)))));
}
/*function has_cycle( perm, k, strict )
{
    var cycle = permutation2cycles( perm, false ), n = cycle.length, i;
    strict = false !== strict;
    for(i=0; i<n; i++) if ( (strict && cycle[i].length === k) || (!strict && cycle[i].length >= k) ) return true;
    return false;
}*/
/*function next_tensor_gray( item, data, N, dir, type, order )
{
    if ( null == item ) return null;
    
    var n = N, k = n.length, j, ij, dj, j0, da, db, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; j0 = MIN; da = 1; db = 0;
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; j0 = MAX-j0;
        da = -da; db = MAX-db;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    
    // adapted from FXT library
    /*
    ***GRAY***
    first: item = +1,+1,..,+1, data = 0,0,..,0
    
    last: item = -1,-1,..,-1, data = 0,0,..,0
    // find position of last even radix:
    ulong z = 0;
    for (ulong i=0; i<n_; ++i)  if ( m1_[i]&1 )  z = i;
    while ( z<n_ )  // last even .. end:
    {
        a_[z] = m1_[z];
        i_[z] = +1;
        ++z;
    }
    
    ***MODULAR GRAY***
    first: item = 0,0,..,0, data = 0,0,..,0
    
    last: item = 0,0,..,0
    ulong j = n_;  // track j
    ulong tt = 1;  // total of transitions to right of track j
    ulong p = 1;   // product of all radices at and to the right of track j
    while ( j-- )
    {
        ulong r = m1_[j] + 1;  // radix at track
        p *= r;  // update product
        ulong t = p - tt;  // this many transitions
        tt += t;  // update total of transitions
        ulong a = t % r;  // digit here (value after t transitions)
        a_[j] = a;
    }
    * /
    if ( 0 > dir )
    {
        if ( "gray+modular" === type )
        {
            j = j0;
            while( MIN<=j && j<=MAX && item[j]+1 === n[da*j+db] ) { item[j] = 0; j+=DI; }
            if ( MIN<=j && j<=MAX )
            {
                item[j]++;
                // decrement:
                dj = data[j];
                data[j] = 0 === dj ? n[da*j+db]-1 : dj-1;
            }
            else item = null;
        }
        else//if ( "gray" === type )
        {
            j = j0;
            while ( MIN<=j && j<=MAX )
            {
                ij = item[j];
                dj = data[j] - ij;
                if ( dj+1 > n[da*j+db] )
                {
                    item[j] = -ij;  // flip direction
                }
                else
                {
                    data[j] = dj;  // update digit
                    break;
                }
                j+=DI;
            }
            if ( MIN>j || j>MAX ) item = null;
        }
    }
    else
    {
        if ( "gray+modular" === type )
        {
            j = j0;
            while( MIN<=j && j<=MAX && item[j]+1 === n[da*j+db] ) { item[j] = 0; j+=DI; }
            if ( MIN<=j && j<=MAX )
            {
                item[j]++;
                // increment:
                dj = data[j] + 1;
                if ( dj+1 > n[da*j+db] ) dj = 0;
                data[j] = dj;
            }
            else item = null;
        }
        else//if ( "gray" === type )
        {
            j = j0;
            while( MIN<=j && j<=MAX )
            {
                ij = item[j];
                dj = data[j] + ij;
                if ( dj+1 > n[da*j+db] )
                {
                    item[j] = -ij;  // flip direction
                }
                else
                {
                    data[j] = dj;  // update digit
                    break;
                }
                j+=DI;
            }
            if ( MIN>j || j>MAX ) item = null;
        }
    }
    return item;
}*/
function next_tensor( item, N, dir, type, order, item_ )
{
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
    
    if ( 0 > dir )
    {
        if ( "tuple" === type )
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if ( MIN<=i && MAX>=i )
            {
                item[i]--;
                for(n=n-1,j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n;
            }
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]===0) i-=DI;
            if ( MIN<=i && MAX>=i )
            {
                item[i]--;
                for(j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = n[a*j+b]-1;
            }
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
            {
                item[i]++;
                for(j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            }
            //else last item
            else item = null;
        }
        else
        {
            i = i0;
            while(MIN<=i && MAX>=i && item[i]+1===n[a*i+b]) i-=DI;
            if ( MIN<=i && MAX>=i )
            {
                item[i]++;
                for(j=i+DI; MIN<=j && MAX>=j; j+=DI) item[j] = 0;
            }
            //else last item
            else item = null;
        }
    }
    return item;
}
function next_permutation( item, N, dir, type, order, multiplicity, item_ )
{
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
                    fixed = fixed || (da*k+db === item[k]);
                    if ( MIN<=kl && kl<=MAX ) fixed = fixed || (da*kl+db === item[kl]);
                    if ( MIN<=r && r<=MAX ) fixed = fixed || (da*r+db === item[r]);
                    for(l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
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
                    fixed = fixed || (da*k+db === item[k]);
                    if ( MIN<=kl && kl<=MAX ) fixed = fixed || (da*kl+db === item[kl]);
                    if ( MIN<=r && r<=MAX ) fixed = fixed || (da*r+db === item[r]);
                    for(l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
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
function comb_item_( item )
{
    for(var item_={},k=item.length,i=0; i<k; i++) item_[item[i]] = 1;
    return item_;
}
function next_combination( item, N, dir, type, order, item_ )
{
    var k = N[1], n = N[0],
        i, j, index, limit, curr, ofs,
        i0, DI, MIN, MAX, a, b;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; i0 = MAX;
    a = 1; b = 0;
    if ( COLEX & order )
    {
        //CP-symmetric of LEX
        DI = -DI; i0 = MAX-i0;
        a = -a; b = n-1-b;
    }
    if ( REFLECTED & order )
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0;
    }
    if ( REVERSED & order )
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    
    if ( 0 > dir )
    {
        // compute prev indexes
        // find index to move
        if ( "ordered+repeated" === type )
        {
            i = i0;
            while( (MIN<=i && i<=MAX) && (item[i] === 0) ) i-=DI;
            if ( MIN<=i && i<=MAX )
            {
                item[i]--;
                for(n=n-1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = n;
            }
            //else last item
            else item = null;
        }
        else if ( "ordered" === type )
        {
            // item information map maybe pre-computed, else compute it now
            if ( null == item_ ) item_ = comb_item_(item);
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX )
            {
                if ( a*item[i]+b-a >= 0  )
                {
                    for(j=a*item[i]+b-a; 0<=j && j<n; j-=a)
                    {
                        curr = a*j+b;
                        if ( null == item_[curr] )
                        {
                            index = i;
                            item_[curr] = 1;
                            break;
                        }
                    }
                }
                item_[item[i]] = null;
                i-=DI;
            }
            if ( -1 < index )
            {
                item[index] = curr;
                for(j=n-1-b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while( (0<=j && j<n) && (null != item_[curr]) ) { j-=a; curr=a*j+b; }
                    item[i] = curr; item_[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if ( ("unordered" === type) || ("repeated" === type) )
        {
            ofs = "repeated"===type ? 0 : 1;
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX && MIN<=i-DI && i-DI<=MAX )
            {
                if ( a*item[i] > a*(item[i-DI]+ofs) ) index = i;
                i-=DI;
            }
            if (-1 === index && 0 < a*item[MAX-i0]+b) index = MAX-i0;
            // adjust next indexes after the moved index
            if ( -1 < index )
            {
                curr = a*(n-1)+b+a*ofs;
                for(i=i0; MIN<=i && i<=MAX && DI*(i-index)>0; i-=DI)
                {
                    curr -= a*ofs;
                    item[i] = a*curr+b;
                }
                item[index]-=a;
            }
            //else last item
            else item = null;
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
            {
                item[i]++;
                for(j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = 0;
            }
            //else last item
            else item = null;
        }
        else if ( "ordered" === type )
        {
            // item information map maybe pre-computed, else compute it now
            if ( null == item_ ) item_ = comb_item_(item);
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX )
            {
                if ( a*item[i]+b+a < n  )
                {
                    for(j=a*item[i]+b+a; 0<=j && j<n; j+=a)
                    {
                        curr = a*j+b;
                        if ( null == item_[curr] )
                        {
                            index = i;
                            item_[curr] = 1;
                            break;
                        }
                    }
                }
                item_[item[i]] = null;
                i-=DI;
            }
            if ( -1 < index )
            {
                item[index] = curr;
                for(j=b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while( (0<=j && j<n) && (null != item_[curr]) ) { j+=a; curr=a*j+b; }
                    item[i] = curr; item_[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if ( ("unordered" === type) || ("repeated" === type) )
        {
            ofs = "repeated"===type ? 0 : 1;
            //limit = "repeated"===type ? n-1 : n-k;
            i = i0; index = -1;
            while( -1===index && MIN<=i && i<=MAX && MIN<=i-DI && i-DI<=MAX )
            {
                if ( item[i] === item[i-DI]+ofs ) index = i;
                i-=DI;
            }
            // adjust next indexes after the moved index
            if ( -1 < index )
            {
                curr = a*item[index]+b+a-a*ofs;
                for(i=index; MIN<=i && i<=MAX; i+=DI)
                {
                    curr += a*ofs;
                    item[i] = a*curr+b;
                }
            }
            //else last item
            else item = null;
        }
    }
    return item;
}
function next_composition( item, N, dir, K, M, order, item_ )
{
    return null;
}
function next_partition( item, N, dir, K, M, order, item_ )
{
    if ( (COLEX&order) ) return null;
    var n = N, i, j, i0, i1, k, m, d, rem, DI, MIN, MAX;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = item.length-1;
    DI = 1; i0 = MIN; i1 = MAX;
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
    
    if ( 0 > dir )
    {
        // compute prev partition
        if ( K )
        {
            return null;
            if ( M )
            {
                return null;
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
            else item = null;
        }
        else
        {
            j = M ? i0+DI : i0;
            if ( (MIN<=j && j<=MAX) && (item[j] > 1) )
            {
                i = i1; rem = 0;
                while((MIN<=i && i<=MAX) && (DI*(i-j) >= 0) && (1 === item[i])) { rem+=item[i]; i-=DI; }
                m = item[i]-1; rem++;
                item[i] = m;
                item = 0 > DI ? item.slice(i) : item.slice(0, i+1);
                if ( m < rem )
                {
                    item = 0 > DI ? ((rem=rem%m)?[rem]:[]).concat(array(stdMath.floor(rem/m), m)).concat(item) : item.concat(array(stdMath.floor(rem/m), m), (rem=rem%m)?[rem]:[]);
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
    else
    {
        // compute next partition
        if ( K )
        {
            if ( M )
            {
                return null;
                /*m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                //k = ((n-M)%m)||m;
                j = i0+DI;
                d = n-M-item[j];*/
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
                i = /*k === item[i] ? i1-DI :*/ i1; rem = 0; k = K-1-(M?1:0);
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
            else item = null;
        }
        else
        {
            j = M ? i0+DI : i0;
            m = M ? ((n%M) || M) : n;
            if ( (MIN<=j && j<=MAX) && (item[M?i1:i0] < m) )
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
    return item;
}
function dual( item, n, $ )
{
    if ( null == item ) return null;
    // some C-P-T dualities, symmetries & processes at play here
    var klass = this, C = klass.C, P = klass.P,//T = klass.T,
        C0 = $ && (null!=$.base) ? $.base : n,
        //P0 = $ && (null!=$.dimension) ? $.dimension : n,
        order = $ && null!=$.order ? $.order : LEX;
    if ( RANDOM & order ) item = REFLECTED & order ? P(item) : item;
    else if (MINIMAL & order ) item = REFLECTED & order ? P(item) : item;
    else if ( COLEX & order ) item = REFLECTED & order ? C(item,C0) : P(C(item,C0));
    else/*if ( LEX & order )*/item = REFLECTED & order ? P(item) : item;
    return item;
}
function dual_subset( item, n, $ )
{
    if ( null == item ) return null;
    // some C-P-T dualities, symmetries & processes at play here
    var klass = this, C = klass.C, P = klass.P,//T = klass.T,
        order = $ && null!=$.order ? $.order : LEX;
    if ( RANDOM & order ) item = REFLECTED & order ? item : P(item);
    else if ( MINIMAL & order ) item = REFLECTED & order ? item : P(item);
    else if ( COLEX & order ) item = REFLECTED & order ? P(C(item,n)) : C(item,n);
    else/*if ( LEX & order )*/item = REFLECTED & order ? item : P(item);
    return item;
}

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
Abacus.Util = {
    
    array: array
   ,operate: operate
   ,intersect: intersect
   ,difference: difference
   ,merge: merge
   ,conjugation: conjugation
   ,parity: parity
   ,inversion: inversion
   ,gray: gray
   ,mergesort: mergesort
   ,shuffle: shuffle
   ,pick: pick
   
};

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

,add: function( a, b ) { return a+b; }
,sub: function( a, b ){ return a-b; }
,mul: function( a, b ) { return a*b; }
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
};

// support pluggable arithmetics, eg biginteger Arithmetic
Abacus.Arithmetic = {
    
 O: 0
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

Abacus.Class = Class;

Abacus.BitArray = Class({
    
    constructor: function BitArray(n) {
        var self = this;
        if ( !(self instanceof BitArray) ) return new BitArray(n);
        self.length = n;
        self.bits = new Uint32Array( Abacus.Math.ceil(n/32) );
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
        ,C: conjugation
        ,P: parity
        ,T: inversion
        ,DUAL: dual
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
            if ( null == item ) return null;
            return item.slice();
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
            if ( ("gen" === Abacus.Options.RANDOM) || (1 === $.rand[$.type]) || Arithmetic.gt(tot, Abacus.Options.MAXMEM) )
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
                self.item__ = self.item_( self.__item, self.item__ );
            }
            self._index = self.__index;
        }
        
        self._item = klass.output(self.__item, self.__index, n, $);
        self._prev = (RANDOM & order) || (0 < dir) ? false : null != self.__item;
        self._next = (0 > dir) && !(RANDOM & order) ? false : null != self.__item;
        
        return self;
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
            self._subindex = Arithmetic.add(Arithmetic.mul(self._index,$.sub.total()), self.__subindex);
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
            if ( $.sub && !non_recursive )
            {
                $.sub.index( Arithmetic.mod(index, $.sub.total()) );
                self.__subindex = $.sub.index();
                self.__subitem = $.sub.item();
                index = Arithmetic.div(index, $.sub.total());
                tot = $.count;
            }
            tot_1 = $.last;
            
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
                self.item__ = self.item_( self.__item, self.item__ );
                self._item = klass.output(self.__item, self.__index, n, $);
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
            
            if ( $.sub )
            {
                self._prev = self._prev && (null != self.__subitem);
                self._next = self._next && (null != self.__subitem);
                self._subindex = Arithmetic.add(Arithmetic.mul(self._index,$.sub.total()), self.__subindex);
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
            self.item__ = self.item_( self.__item, self.item__ );
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
            if ( $.sub )
            {
                subitem = $.sub.item( Arithmetic.mod(index, $.sub.total()), suborder );
                index = Arithmetic.div(index, $.sub.total());
                tot = $.count;
            }
            tot_1 = $.last;
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
    
    ,item_: function( item, item__ ) {
        // compute and store any extra item information
        // needed between successive runs to run faster, eg cat or loopless, instead of linear
        return item__;
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
            has_next, has_prev = null != current;
        
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
            }
            else
            {
                self.__subindex = null;
                self.__subitem = null;
                if ( 0 > dir )
                {
                    self._prev = has_next;
                    self._next = has_prev;
                }
                else
                {
                    self._prev = has_prev;
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
                self._next = has_prev;
            }
            else
            {
                self._prev = has_prev;
                self._next = has_next;
            }
        }
        
        self._item = klass.output(self.__item, self.__index, n, $);
        
        if ( $.sub )
        {
            has_next = has_next && (null != self.__subitem);
            self._subindex = has_next ? Arithmetic.add(Arithmetic.mul(self._index,$.sub.total()), self.__subindex) : null;
            self._subitem = has_next ? klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade) : null;
            if ( 0 > dir ) self._prev = has_next;
            else self._next = has_next;
        }
        
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.sub ? $.subcount : $.count, range, count, i, iter_state, dir = 1,
            argslen = arguments.length, not_randomised = !(RANDOM & $.order);
        if ( argslen < 1 )
        {
            start = $.first;
            end = $.last;
        }
        else if ( argslen < 2 )
        {
            start = N( start );
            end = $.last;
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
        start = Arithmetic.clamp( start, $.first, $.last );
        if ( not_randomised ) end = Arithmetic.clamp( end, $.first, $.last );
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
            range = new Array(count+1);
            if ( 0 > dir ) for (i=count; i>=0; i--) range[ i ] = self.next( );
            else for (i=0; i<=count; i++) range[ i ] = self.next( );
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
        ,DUAL: dual
        ,count: function( n, $ ) {
            var O = Abacus.Arithmetic.O, type = $ && $.type ? $.type : "tensor";
            return "tuple"===type ? (!n || (0 >= n[0]) ? O : Abacus.Math.exp(n[0], n[1])) : (!n || !n.length ? O : Abacus.Math.product(n));
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "tensor",
                order = $ && $.order ? $.order : LEX;
            
            dir = -1 === dir ? -1 : 1;
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            
            item = "tuple" === type ? (
                !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
            ) : (
                !n.length ? [] : (0 > dir ? array(n.length, function(i){return n[i]-1;}): array(n.length, 0, 0))
            );
            
            /*if ( ("gray" === type) || ("gray+modular" === type) )
                item = gray(item, n);*/
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( !n || !n[0] || (0 >= n[0]) || (null == item) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_tensor(item, n, dir, $ && $.type ? $.type : "tensor", $ && null!=$.order ? $.order : LEX, item_);
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, klass = this, item,
                type = $ && $.type ? $.type : "tensor";
            
            item = "tuple" === type ? (
                // p ~ 1 / n^k
                !n[0] ? [] : array(n[0], function(i){return rndInt(0, n[1]-1);})
            ) : (
                // p ~ 1 / n1*n2*..nk
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
            
            /*if ( ("gray" === type) || ("gray+modular" === type) )
                item = gray(item, n);*/
            
            item = klass.DUAL(item, n, $);
            
            if ( "tuple" === type )
            {
                nd = n[0];
                if ( !nd ) return J;
                for(n=n[1],i=0; i<nd; i++) index = add(mul(index, n), item[ i ]);
            }
            else
            {
                nd = n.length;
                if ( !nd ) return J;
                for(i=0; i<nd; i++) index = add(mul(index, n[i]), item[ i ]);
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
            
            if ( "tuple" === type )
            {
                nd = n[0];
                if ( !nd ) return [];
                item = new Array( nd ); b = n[1];
                for (r=index,i=nd-1; i>=0; i--)
                {
                    t = mod(r, b); r = div(r, b);
                    item[ i ] = val(t);
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
                    item[ i ] = val(t);
                }
            }
            
            /*if ( ("gray" === type) || ("gray+modular" === type) )
                item = gray(item, n);*/
            
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
        // random ordering for multisets / derangements / involutions
        // is based on random generation, instead of random unranking
        $.rand = {"multiset":1,"derangement":1,"involution":1};
        if ( "multiset" === $.type )
        {
            $.multiplicity = is_array($.multiplicity) && $.multiplicity.length ? $.multiplicity.slice() : array(n, 1, 0);
            $.base = $.multiplicity.length;
        }
        CombinatorialIterator.call(self, "Permutation", n, $);
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: dual
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
            
            if ( "cyclic" === type )
            {
                item = 0 > dir ? [n-1].concat(array(n-1, 0, 1)) : array(n, 0, 1);
            }
            else if ( "multiset" === type )
            {
                var m = $.multiplicity, nm = m.length, ki = 0, k,
                    dk = 1, k0 = 0, mk = ki < nm ? m[ki] : 1;
                if ( 0 > dir ) { dk = -1; k0 = nm-1; }
                k = k0;
                item = array(n, function(){
                    if ( 0 >= mk ) { ki++; k+=dk; mk = ki<nm ? m[ki] : 1; }
                    mk--;
                    return k;
                });
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
            else//if ( ("involution" === type) || ("permutation" === type) )
            {
                item = 0 > dir ? array(n, n-1, -1) : array(n, 0, 1);
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( !n || (0 >= n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "permutation";
            dir = -1 === dir ? -1 : 1;
            return next_permutation(item, n, dir, type, $ && null!=$.order ? $.order : LEX, $ && null!=$.multiplicity ? $.multiplicity.length||null : null, item_);
        }
        ,rand: function( n, $ ) {
            var item, rndInt = Abacus.Math.rndInt, klass = this, type = $ && $.type ? $.type : "permutation";
                
            if ( "cyclic" === type )
            {
                // p ~ 1 / n
                var k = rndInt(0, n-1);
                item = 0 < k ? array(n-k, k, 1).concat(array(k, 0, 1)) : array(n, 0, 1);
            }
            else if ( "multiset" === type )
            {
                // p ~ m1!*..*mk! / n!
                // fisher-yates-knuth unbiased multiset shuffling
                item = shuffle(multiset($.multiplicity, n));
            }
            else if ( "derangement" === type )
            {
                // p ~ 1 / !n = e / n!
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
                // p ~ 1 / I(n)
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
            else//if ( "permutation" === type )
            {
                // p ~ 1 / n!
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
                sub = Arithmetic.sub, add = Arithmetic.add, mul = Arithmetic.mul,
                index = Arithmetic.O, i, m, I, N, M;
            
            n = n || item.length;
            if ( !n ) return Arithmetic.J;
            
            item = klass.DUAL(item, n, $);
            
            if ( "cyclic"=== type )
            {
                index = Arithmetic.NUM(item[0]);
            }
            else if ( /*("multiset" === type) ||*/ ("derangement" === type) || ("involution" === type) )
            {
                /*item = permutation2inversion( item );
                for(I=n&1?-1:1,i=0; i<n-1; i++,I=-I)
                {
                    index = add(mul(index,n-i), I*(n-i)+item[ i ]);
                }
                return index;*/
                return NotImplemented();
            }
            else if ( "multiset" === type )
            {
                item = multipermutation2inversion( item, multiset($.multiplicity, n) );
                for(m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), item[ m-i ]);
            }
            else//if ( "permutation" === type )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                item = permutation2inversion( item );
                for(m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), item[ i ]);
            }
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);
            
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                order = $ && null!=-$.order ? $.order : LEX,
                mod = Arithmetic.mod, div = Arithmetic.div,
                sub = Arithmetic.sub, val = Arithmetic.val,
                item, r, i, b, t, N, M;
            
            if ( !n ) return [ ];
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);
            
            if ( "cyclic"=== type )
            {
                index = val(index);
                item = array(n, function(i){return (index+i)%n});
            }
            else if ( /*("multiset" === type) ||*/ ("derangement" === type) || ("involution" === type) )
            {
                return NotImplemented();
            }
            else if ( "multiset" === type )
            {
                N = new Array( n ); N[n-1] = 0;
                for (r=index,i=n-2; i>=0; i--)
                {
                    b = n-i; t = mod(r, b); r = div(r, b);
                    N[ i ] = val(t);
                }
                M = multiset($.multiplicity, n);
                item = new Array(n);
                for(i=0; i<n; i++)
                {
                    item[i] = M[N[i]];
                    M.splice(N[i], 1);
                }
            }
            else//if ( "permutation" === type )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                item = array( n ); item[n-1] = 0;
                for (r=index,i=n-2; i>=0; i--)
                {
                    b = n-i; t = mod(r, b); r = div(r, b);
                    item[ i ] = val(t);
                }
                item = inversion2permutation( item );
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
        ,shuffle: function( a, cyclic ) {
            if ( true === cyclic  )
            {
                var n = a.length, k = Abacus.Math.rndInt(0, n-1);
                if ( 0 < k ) a.push.apply(a, a.splice(0, k));
                return a;
            }
            return shuffle(a);
        }
        ,compose: function( /* permutations */ ) {
            return permutationproduct( slice.call(arguments) );
        }
        ,concatenate: function( /* permutations */ ) {
            return permutationconcatenation( slice.call(arguments) );
        }
        ,multiset: multiset
        ,inverse: function( item ) {
            return permutation2inverse( item );
        }
        ,cycles: function( item, dir ) {
            return -1 === dir ? cycles2permutation( item ) : permutation2cycles( item );
        }
        ,swaps: function( item, dir ) {
            return -1 === dir ? swaps2permutation( item ) : permutation2swaps( item );
        }
        ,inversion: function( item, dir ) {
            return -1 === dir ? inversion2permutation( item ) : permutation2inversion( item );
        }
        ,matrix: function( item, transposed, dir ) {
            return -1 === dir ? matrix2permutation( item, transposed ) : permutation2matrix( item, transposed );
        }
        ,parity: NotImplemented
        ,is_permutation: is_permutation
        ,is_identity: is_identity
        ,is_cyclic: is_cyclic
        ,is_derangement: is_derangement
        ,is_involution: is_involution
        ,is_kthroot: function( item, k ) {
            return k >= 1 ? is_kthroot( item, k-1 ) : false;
        }
        ,is_indecomposable: is_indecomposable
        ,is_connected: is_indecomposable
    }
});

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
        ,DUAL: dual
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
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( !n || !n[0] || (0 >= n[0]) || (null == item) ) return null;
            dir = -1 === dir ? -1 : 1;
            return next_combination(item, n, dir, $ && $.type ? $.type : "unordered", $ && null!=$.order ? $.order : LEX, item_);
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
                    difference(n, mergesort(array(n_k, function(){
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
                N = n[0];
                for(i=0; i<k; i++) index = add(mul(index, N), item[ i ]);
            }
            else if ( "repeated" === type )
            {
                N = n[0]+k-1; binom = $ && $.count ? $.count : factorial(N, k);
                for(i=1; i<=k; i++)
                {
                    // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                    // adjust the order to match MSB to LSB 
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]-i+1; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,Arithmetic.I),index);
            }
            else if ( "ordered" === type )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // rank(ordered) = rank(k-n-permutation)
                N = n[0]; item = permutation2inversion( item, null, N );
                for(i=0; i<k; i++) index = add(mul(index, N-i), item[ i ]);
                return index;
            }
            else//if ( ("unordered" === type) || ("binary" === type) )
            {
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
                index = sub(sub(binom,Arithmetic.I),index);
            }
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);
            
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
                for(m=index,p=k-1; p>=0; p--)
                {
                    t = mod(m, n); m = div(m, n);
                    item[ p ] = val(t);
                }
            }
            else if ( "ordered" === type )
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // unrank(ordered) = unrank(k-n-permutation)
                for(m=index,p=k-1; p>=0; p--)
                {
                    N = n-p; t = mod(m, N); m = div(m, N);
                    item[ p ] = val(t);
                }
                item = inversion2permutation( item, null, N );
            }
            else//if ( ("repeated" === type) || ("unordered" === type) || ("binary" === type) )
            {
                // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                // adjust the order to match MSB to LSB 
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
            return true === ordered ? shuffle(difference(n, mergesort(alpha))) : difference(n, alpha);
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
    
    ,item_: function( item/*, item_*/ ) {
        return (null == item) || ("ordered" !== this.$.type) ? null : comb_item_(item);
    }
});
// aliases
Combination.conjugate = Combination.complement;
Combination.project = Combination.choose;

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
         C: function( item, n ) { return difference( n, item ); }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: dual_subset
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
            
            item = 0 > dir ? array(n, 0, 1) : [];
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: CombinatorialIterator.succ
        ,rand: function( n, $ ) {
            var klass = this, rndInt = Abacus.Math.rndInt, item;
            // p ~ 1 / 2^n
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
                order = $ && null!=$.order ? $.order : LEX,
                index = O, i = 0, l = item.length;
            
            item = klass.DUAL(item, n, $);
            
            while ( i < l ) index = add(index, shl(I, item[i++]));
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);
            
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

// https://en.wikipedia.org/wiki/Partitions
// https://en.wikipedia.org/wiki/Composition_(combinatorics)
// integer compositions (or set-partitions) & restricted compositions have bijections ("isomorphisms") to subsets & k-subsets (combinations) respectively
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
        $.rand = {"partition":1,"composition":1,"set":1,"unpacked":1,"packed":1};
        CombinatorialIterator.call(self, "Partition", n, $);
    }
    
    ,__static__: {
         C: function( item/*, n*/ ) { return conjugatepartition( item ); }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: dual
        ,count: function( n, $ ) {
            var M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                type = $ && $.type ? $.type : "partition";
            
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) )
                return Abacus.Arithmetic.O;
            if ( ("composition" === type) || ("set" === type) )
            {
                return K & M ? Abacus.Math.factorial(n-M-1, K-2) : (K ? Abacus.Math.factorial(n-1, K-1) : Abacus.Math.pow2(n-1-(M?M:0)));
            }
            else
            {
                return Abacus.Math.partitions(n, $&&(null!=$["parts="])?$["parts="]:null, $&&(null!=$["max="])?$["max="]:null);
            }
        }
        ,initial: function( n, $, dir ) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var klass = this, item, k, m,
                type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                order = $ && null!=$.order ? $.order : LEX;
            
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            
            dir = -1 === dir ? -1 : 1;
            
            if ( ((LEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)) )
                dir = -dir;
            
            if ( ("composition" === type) || ("set" === type) )
            {
                if ( K && M )
                {
                    item = null;
                }
                else if ( K )
                {
                    item = null;
                }
                else if ( M )
                {
                    item = null;
                }
                else
                {
                    item = null;
                }
            }
            else
            {
                if ( K && M )
                {
                    // restricted partition n into exactly K parts with largest part=M
                    // equivalent to partition n-M into K-1 parts with largest part<=M
                    if ( 1 === K )
                    {
                        item = [M];
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
                else if ( K )
                {
                    // restricted partition n to exactly K parts
                    // equivalent to conjugate to partition n into parts with largest part=K
                    m = stdMath.ceil(n/K); k = (n%m)||m;
                    item = 0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K-1, m, 0).concat([k]);
                }
                else if ( M )
                {
                    // restricted partition n into parts with largest part=M
                    // equivalent to conjugate to partition n into exactly M parts
                    k = stdMath.floor(n/M); m = n%M;
                    item = 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0));
                }
                else
                {
                    // unrestricted partition
                    item = 0 > dir ? [n] : array(n, 1, 0);
                }
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;
        }
        ,succ: function( item, index, n, $, dir, item_ ) {
            if ( (null == n) || (null == item) ) return null;
            var type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            dir = -1 === dir ? -1 : 1;
            return ("composition" === type)||("set" === type) ? next_composition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, item_) : next_partition(item, n, dir, K, M, $ && null!=$.order ? $.order : LEX, item_);
        }
        ,rand: function( n, $ ) {
            return null;
            /*var klass = this, rndInt = Abacus.Math.rndInt,
                type = $ && $.type ? $.type : "partition",
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                list, c, m, item;
            
            if ( (0 >= n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            
            m = M ? n-M : n;
            
            if ( K )
            {
                if ( M )
                {
                    if ( 1 === K ) return [M];
                    K--;
                }
                
                K--; m--; c = m-1;
                // generates a random combination (order matters) p ~ 1 / binom(n-1,k-1)
                // but the order is not taken into account hence
                // p ~ 1 / P(n,k)
                list = {};
                item = 1 === K ? (
                    [rndInt(0, c)]
                ) : (m === K ? (
                    array(K, 1, 1)
                ) : (m-K < K ? (
                    difference(n, mergesort(array(m-K, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === list[selection] ) selection = (selection+1)%m;
                        list[selection] = 1;
                        return selection;
                    })))
                ) : (
                    mergesort(array(K, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === list[selection] ) selection = (selection+1)%m;
                        list[selection] = 1;
                        return selection;
                    }))
                )));
                item = (M?[M]:[]).concat(array(item, function(i){
                    return 0<i ? item[i]-item[i-1] : 1+item[i];
                }));
            }
            else
            {
                // generates a random composition (order matters) p ~ 1 / 2^(n-1)
                // but the order is not taken into account hence
                // p ~ 1 / P(n)
                list = null;
                for(var i=1; i<m; i++) if ( rndInt(0,1) )
                    list = {len:list?list.len+1:1, k:list?i-list.k:i, next:list};
                item = (M?[M]:[]).concat(list ? mergesort(array(list.len, function(){var k = list.k; list = list.next; return k;})).reverse() : (0<m?[m]:[]));
            }
            
            item = klass.DUAL(item, n, $);
            
            return item;*/
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,cascade: CombinatorialIterator.cascade
        ,output: function( item, index, n, $ ) {
            if ( null == item ) return null;
            var klass = this, _item = item,
                order = $ && null!=$.order ? $.order : LEX,
                dir = REFLECTED & order ? -1 : 1,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            //if ( K && !M ) item = conjugatepartition(item, dir);
            if ( $ && "unpacked"===$.type )
                item = unpackpartition(item, dir);
            if ( $ && "set"===$.type )
                return partition2sets(item);
            if ( ($ && "constant"===$['length']) && (item.length < n) )
                item = 0 > dir ? array(n-item.length, 0, 0).concat(item) : item.concat(array(n-item.length, 0, 0));
            if ( $ && "packed"===$.type )
                item = packpartition(item, dir);
            return _item===item ? item.slice() : item;
        }
        ,conjugate: conjugatepartition
        ,subset: function( item, dir, type ) {
            item = -1 === dir ? subset2composition(item,1) : composition2subset(item,1);
            if ( "partition" === type )
            {
                mergesort(item);
                if ( -1 === dir ) item = item.reverse();
            }
            return item;
        }
        ,sets: function( item, dir ) {
            return -1 === dir ? sets2partition(item) : partition2sets(item);
        }
        ,pack: function( item, dir ) {
            return -1 === dir ? unpackpartition(item) : packpartition(item)
        }
    }
});
// aliases
Partition.transpose = Partition.conjugate;

// export it
return Abacus;
});
