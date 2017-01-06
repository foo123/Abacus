/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python
*   @version: 0.7.0
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

var  Abacus = {VERSION: "0.7.0"}, PROTO = 'prototype', CLASS = 'constructor'
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
function ORDER( o )
{
    if ( !arguments.length || null == o )
    {
        return LEX; // default
    }
    if ( is_string(o) )
    {
        var order = 0, ord = o.toUpperCase( ).split(','), i, l = ord.length;
        for(i=0; i<l; i++) order |= HAS.call(Abacus.ORDER,ord[i]) ? Abacus.ORDER[ord[i]] : 0;
        if ( (0 < order) && !(order&(LEXICAL|RANDOM)) ) order |= LEX;
        if ( order & RANDOM ) order &= ~REVERSED;
        return 0 < order ? order : LEX;
    }
    if ( o & RANDOM ) o &= ~REVERSED;
    return ORDERINGS & o ? o : LEX;
}
function array( n, x0, xs )
{
    n = n|0;
    var x = 0 < n ? new Array(n) : [], q, r, i, k, xi;
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
        // simple factorial = n!
        // 2=>2 or 3=>6
        if ( 4 > n ) return 0 > n ? O : (2 > n ? I : Arithmetic.shl(NUM(n), n-2)/*n<<(n-2)*/);
        key = String(n);
        // n! = n (n-1)!
        if (null == factorial.mem1[key] )
            //factorial.mem1[key] = mul(n, factorial(n-1));
            factorial.mem1[key] = operate(mul, I, null, 2, n);
        return factorial.mem1[key];
    }
    else if ( false === m )
    {
        // derangement sub-factorial
        if ( 3 > n ) return 2 === n ? I : O;
        key = String(n);
        // !n = n !(n-1) + (-1)^n = [(n!+1)/e]
        // !1 = 1 !0 - 1 = 0
        // !2 = 2 !1 + 1 = 1
        // !3 = 3 !2 - 1 = 2 = 3*(2*0 + 1) -1
        // !4 = 4 !3 + 1 = 9 = 4*(3*(2*0 + 1) -1) + 1
        if (null == factorial.mem2[key] )
            //factorial.mem2[key] = Math.floor((factorial(n)+1)/Math.E);
            //factorial.mem2[key] = add(n&1 ? J : I, mul(n, factorial(n-1,false)));
            factorial.mem2[key] = operate(function(N, n){
                return add(n&1 ? J : I, mul(N,n));
            }, I, null, 3, n);
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
function partitions( n, k, m )
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
    if ( null == partitions.mem[key] )
    {
        // compute it directly
        jmin = stdMath.max(1, stdMath.ceil((n-m)/(k-1)));
        jmax = stdMath.min(m, n-m-k+2);
        for(j=jmin; j<=jmax; j++) p = add(p, partitions(n-m, k-1, j));
        partitions.mem[key] = p;
    }
    return partitions.mem[key];
}
partitions.mem = {};
// C process / symmetry, ie Rotation
function conjugation( a, n )
{
    if ( null == a ) return null;
    if ( !a.length ) return [];
    var i, k = a.length, b = new Array(k);
    if ( is_array(n) ) for(i=0; i<k; i++) b[i] = n[i]-1-a[i];
    else if ( 0 > n ) for(i=0; i<k; i++) b[i] = k-1-a[i];
    else for(n=n-1,i=0; i<k; i++) b[i] = n-a[i];
    return b;
}
// P process / symmetry, ie Reflection
function parity( a )
{
    if ( null == a ) return null;
    for(var l=a.length-1,b=new Array(l+1),i=0; i<=l; i++) b[i] = a[l-i];
    return b;
}
// T process / symmetry, ie Reversion
function inversion( n, n0 )
{
    if ( null == n0 ) n0 = 0;
    if ( is_array(n) )
    {
        for(var l=n.length,invn=new Array(l),i=0; i<l; i++) invn[i] = n0-n[i];
        return invn;
    }
    else
    {
        return (n === +n)&&(n0 === +n0) ? (n0 - n) : Abacus.Arithmetic.sub( Abacus.Arithmetic.N( n0 ), n );
    }
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
    for(i=0; i<l; i++) binary[item[i]] = 1;
    return binary;
}
function binary2subset( item, n )
{
    n = stdMath.min(n||item.length, item.length);
    var subset = [], i;
    for(i=0; i<n; i++) if ( 0 < item[i] ) subset.push(i);
    return subset;
}
function conjugatepartition( partition, packed )
{
    if ( null == partition ) return null;
    // http://mathworld.wolfram.com/ConjugatePartition.html
    var l = partition.length, n, i, j, p, conjpartition;
    if ( true === packed )
    {
        p = partition[j]; conjpartition = [[p[1], p[0]]];
        for(j=1; j<l; j++)
        {
            p = partition[j];
            if ( p[1] === conjpartition[j-1][0] ) conjpartition[j-1][1] += p[0];
            // swap part with multiplicity
            else conjpartition.push([p[1], p[0]]);
        }
    }
    else
    {
        n = partition[0]; conjpartition = array(n, 1, 0);
        for(j=1; j<l; j++)
        {
            i = 0; p = partition[j];
            while( (i < n) && (p > 0) ) { conjpartition[i++]++; p--; }
        }
    }
    return conjpartition;
}
function packpartition( partition )
{
    if ( null == partition ) return null;
    var packed = [], i, l = partition.length, 
        last = partition[0], part = [last, 1];
    for(i=1; i<l; i++)
    {
        if ( last === partition[i] )
        {
            part[1]++;
        }
        else
        {
            packed.push(part);
            last = partition[i];
            part = [last, 1];
        }
    }
    packed.push(part);
    return packed;
}
function unpackpartition( packed )
{
    if ( null == packed ) return null;
    var partition = [], i, j, k, v, l = packed.length, cmp;
    for(i=0; i<l; i++)
    {
        cmp = packed[i];
        if (1 === cmp[1] ) partition.push(cmp[0]);
        else
        {
            k = cmp[1]; v = cmp[0];
            for(j=0; j<k; j++) partition.push(v);
        }
    }
    return partition;
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
function permutation2inversion( permutation, n, dir )
{
    // O(n log n) inversion computation
    n = n || permutation.length;
    var nn = permutation.length, i, ii, j, inversion = new Array(nn),
        node, ctr, k = Abacus.Math.ceil(log2(n)),
        Tl = (1<<(1+k))-1, T = new Array(Tl), twok = 1 << k,
        i0 = -1===dir ? nn-1 : 0, ik = -1===dir ? -1 : 1;
    for(i=0; i<Tl; i++) T[i] = 0;
    for(ii=i0,i=0; i<nn; i++,ii+=ik)
    {
        ctr = permutation[i];
        node = twok + ctr;
        for(j=0; j<k; j++)
        {
            if ( node&1 ) ctr -= T[(node >>> 1) << 1];
            T[node] += 1;
            node >>>= 1;
        }
        T[node] += 1;
        inversion[ii] = ctr;
    }
    return inversion;
}
function inversion2permutation( inversion, n, dir )
{
    // O(n log n) permutation computation
    n = n || inversion.length;
    var nn = inversion.length, permutation = new Array(nn),
        i, ii, j, i2, digit, node, k, Tl, T, twok,
        i0 = -1===dir ? nn-1 : 0, ik = -1===dir ? -1 : 1;
    
    k = Abacus.Math.ceil(log2(n)); Tl = (1<<(1+k))-1;
    T = new Array(Tl); twok = 1 << k;
    
    for(i=0; i<=k; i++)
        for(j=1,i2=1<<i; j<=i2; j++) 
            T[i2-1+j] = 1 << (k-i);
    
    for(ii=i0,i=0; i<nn; i++,ii+=ik)
    {
        digit = inversion[i]; 
        node = 1;
        for(j=0; j<k; j++)
        {
            T[node] -= 1;
            node <<= 1;
            if ( digit >= T[node] )
            {
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
    var cnt = new Array(n), i, pi;
    for(i=0; i<n; i++) cnt[i] = 0;
    for(i=0; i<n; i++)
    {
        pi = perm[i];
        if ( (0 > pi) || (pi >= n) || (0 !== cnt[pi]) ) return false;
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
function is_cyclic( perm )
{
    for(var n=perm.length,i=1,i0=perm[0]; i<n; i++)
        if ( perm[i] !== ((i0+i)%n) ) return false;
    return true;
}
function is_kthroot( perm, k )
{
    k = k || 1;
    var product = new Array(k+1), i;
    for(i=0; i<=k; i++) product[i] = perm;
    return is_identity( permutationproduct(product) );
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
/*function has_cycle( perm, k, strict )
{
    var cycle = permutation2cycles( perm, false ), n = cycle.length, i;
    strict = false !== strict;
    for(i=0; i<n; i++) if ( (strict && cycle[i].length === k) || (!strict && cycle[i].length >= k) ) return true;
    return false;
}*/
function next_tensor( item, N, dir, type )
{
    if ( item )
    {
        var n = N, k, nd = n.length, i, j;
        
        if ( 0 > dir )
        {
            // C of item
            if ( "tuple" === type )
            {
                k = n[0]; n = n[1]; i = k-1;
                while( (i >= 0) && (item[i] < 1) ) i--;
                if ( 0 <= i )
                {
                    item[i]--;
                    for(n=n-1,j=i+1; j<k; j++) item[j] = n;
                }
                //else last item
                else item = null;
            }
            else
            {
                i = nd-1;
                while( (i >= 0) && (item[i] < 1) ) i--;
                if ( 0 <= i )
                {
                    item[i]--;
                    for(j=i+1; j<nd; j++) item[j] = n[j]-1;
                }
                //else last item
                else item = null;
            }
            // invC of item
        }
        else
        {
            if ( "tuple" === type )
            {
                k = n[0]; n = n[1]; i = k-1;
                while( (i >= 0) && (item[i]+1 === n) ) i--;
                if ( 0 <= i )
                {
                    item[i]++;
                    for(j=i+1; j<k; j++) item[j] = 0;
                }
                //else last item
                else item = null;
            }
            else
            {
                i = nd-1;
                while( (i >= 0) && (item[i]+1 === n[i]) ) i--;
                if ( 0 <= i )
                {
                    item[i]++;
                    for(j=i+1; j<nd; j++) item[j] = 0;
                }
                //else last item
                else item = null;
            }
        }
        return item;
    }
    return null;
}
function next_permutation( item, N, dir, type )
{
    // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
    if ( item )
    {
        var n = N, k, kl, l, r, s, fixed;
        
        if ( 0 > dir )
        {
            if ( "cyclic" === type )
            {
                if ( item[0] > 0 ) item = [item[n-1]].concat(item.slice(0,-1));
                //else last item
                else item = null;
            }
            else//if ( "derangement" === type || "permutation" === type )
            {
                do{
                fixed = false;
                //Find the largest index k such that a[k] > a[k + 1].
                k = n-2;
                while((k >= 0) && (item[k] < item[k+1])) k--;
                // If no such index exists, the permutation is the last permutation.
                if ( k >=0 ) 
                {
                    //Find the largest index kl greater than k such that a[k] > a[kl].
                    kl = n-1;
                    while (kl>k && item[k]<item[kl]) kl--;
                    //Swap the value of a[k] with that of a[l].
                    s = item[k]; item[k] = item[kl]; item[kl] = s;
                    //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                    l = k+1; r = n-1;
                    while (l < r)
                    {
                        s = item[l]; item[l] = item[r]; item[r] = s;
                        fixed = fixed || (l === item[l]) || (r === item[r]);
                        l++; r--;
                    }
                    fixed = fixed || (k === item[k]) || (r === item[r]);
                    if ( "derangement" === type )
                    {
                        if ( !fixed )
                            for(l=k-1; l>=0; l--) if( l === item[l] ) { fixed = true; break; }
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
                if ( item[0]+1 < n ) item = item.slice(1).concat([item[0]]);
                //else last item
                else item = null;
            }
            else//if ( "derangement" === type || "permutation" === type )
            {
                do{
                fixed = false;
                //Find the largest index k such that a[k] < a[k + 1].
                k = n-2;
                while((k >= 0) && (item[k] > item[k+1])) k--;
                // If no such index exists, the permutation is the last permutation.
                if ( k >=0 ) 
                {
                    //Find the largest index kl greater than k such that a[k] < a[kl].
                    kl = n-1;
                    while (kl>k && item[k]>item[kl]) kl--;
                    //Swap the value of a[k] with that of a[l].
                    s = item[k]; item[k] = item[kl]; item[kl] = s;
                    //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                    l = k+1; r = n-1;
                    while (l < r)
                    {
                        s = item[l]; item[l] = item[r]; item[r] = s;
                        fixed = fixed || (l === item[l]) || (r === item[r]);
                        l++; r--;
                    }
                    fixed = fixed || (k === item[k]) || (r === item[r]);
                    if ( "derangement" === type )
                    {
                        if ( !fixed )
                            for(l=k-1; l>=0; l--) if( l === item[l] ) { fixed = true; break; }
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
    return null;
}
function next_combination( item, N, dir, type )
{
    if ( item )
    {
        var k = N[1], n = N[0], selected,
            i, j, index, limit, curr, ofs;
        
        if ( 0 > dir )
        {
            // compute prev indexes
            // find index to move
            if ( "ordered+repeated" === type )
            {
                i = k-1;
                while( (i >= 0) && (item[i] < 1) ) i--;
                if ( 0 <= i )
                {
                    item[i]--;
                    for(n=n-1,j=i+1; j<k; j++) item[j] = n;
                }
                //else last item
                else item = null;
            }
            else if ( "ordered" === type )
            {
                for(selected={},i=0; i<k; i++) selected[item[i]] = i;
                i = k-1; index = -1;
                while( (-1 === index) && (0 <= i) )
                {
                    if ( item[i]-1 >= 0  )
                    {
                        for(j=item[i]-1; j>=0; j--)
                        {
                            if ( null == selected[j] )
                            {
                                index = i;
                                selected[j] = index;
                                break;
                            }
                        }
                    }
                    selected[item[i]] = null;
                    i--;
                }
                if ( -1 < index )
                {
                    item[index] = j;
                    for(j=n-1,i=index+1; i<k; i++)
                    {
                        while( (j>=0) && (null != selected[j]) ) j--;
                        item[i] = j; selected[j] = i;
                    }
                }
                //else last item
                else item = null;
            }
            else
            {
                ofs = "repeated"===type ? 0 : 1; i = k-1;  index = -1;
                while( 0 < i )
                {
                    if ( item[i] > item[i-1]+ofs ) { index = i; break; }
                    i--;
                }
                if (-1 === index && 0 < item[0]) index = 0;
                // adjust next indexes after the moved index
                if ( -1 < index )
                {
                    curr = n-1+ofs;
                    for(i=k-1; i>index; i--)
                    {
                        curr -= ofs;
                        item[i] = curr;
                    }
                    item[index]--;
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
                i = k-1;
                while( (i >= 0) && (item[i]+1 === n) ) i--;
                if ( 0 <= i )
                {
                    item[i]++;
                    for(j=i+1; j<k; j++) item[j] = 0;
                }
                //else last item
                else item = null;
            }
            else if ( "ordered" === type )
            {
                for(selected={},i=0; i<k; i++) selected[item[i]] = i;
                i = k-1; index = -1;
                while( (-1 === index) && (0 <= i) )
                {
                    if ( item[i]+1 < n  )
                    {
                        for(j=item[i]+1; j<n; j++)
                        {
                            if ( null == selected[j] )
                            {
                                index = i;
                                selected[j] = index;
                                break;
                            }
                        }
                    }
                    selected[item[i]] = null;
                    i--;
                }
                if ( -1 < index )
                {
                    item[index] = j;
                    for(j=0,i=index+1; i<k; i++)
                    {
                        while( (j<n) && (null != selected[j]) ) j++;
                        item[i] = j; selected[j] = i;
                    }
                }
                //else last item
                else item = null;
            }
            else
            {
                i = k-1;  index = -1;
                if ( "repeated" === type )
                {
                    ofs = 0;
                    while( 0 <= i )
                    {
                        if ( item[i]+1 < n ) { index = i; break; }
                        i--;
                    }
                }
                else
                {
                    ofs = 1;
                    limit = n-k;
                    while( 0 <= i )
                    {
                        if ( item[i] < limit+i ) { index = i; break; }
                        i--;
                    }
                }
                // adjust next indexes after the moved index
                if ( -1 < index )
                {
                    curr = item[index]+1-ofs;
                    for(i=index; i<k; i++)
                    {
                        curr += ofs;
                        item[i] = curr;
                    }
                }
                //else last item
                else item = null;
            }
        }
        return item;
    }
    return null;
}
function next_partition( item, N, dir, K, M )
{
    if ( K && M ) return null;
    if ( item )
    {
        var n = N, i, i0, i1, k, m, rem;
        
        if ( 0 > dir )
        {
            // C of item
            // compute prev partition
            if ( K )
            {
                /*if ( M )
                {
                    n = n-M;
                    K = K-1;
                    m = stdMath.min(M, stdMath.floor(n/K)||1);
                    i0 = 1; i1 = 1;
                    while((i1<=K) && (M===item[i1]) ) i1++;
                }
                else
                {
                    m = stdMath.ceil(n/K);
                    i0 = 0; i1 = 0;
                }
                if ( item[i1] > m )
                {
                    k = i0+K-1;
                    while((k>i1) && (item[k]+1>=item[k-1])) { k--; }
                    if ( k === i0 )
                    {
                        item[i0]--; item[i0+1] = n-item[i0]-K+2;
                        for(i=i0+2; i<i0+K; i++) {item[i] = 1;}
                    }
                    else
                    {
                        item[k]++; item[k-1]--;
                    }
                }
                //else last item
                else item = null;*/
                M = K; K = null;
            }
            /*else
            {*/
                i0 = M ? 1 : 0;
                if ( (item.length > i0) && (item[i0]/*[0]*/ > 1) )
                {
                    i = item.length-1; rem = 0;
                    /*if*/while((i >= i0) && (1 === item[i]/*[0]*/)) { rem+=item[i]/*[0]*item[i][1]*/; i--; }
                    m = item[i]/*[0]*/-1; rem++;
                    /*if( (M===m || i>i0) && (m===item[i-1][0]) )
                    {
                        item[i-1][1]++;
                        i--;
                    }
                    else
                    {*/
                        item[i] = /*[*/m/*, 1]*/;
                    /*}*/
                    item = item.slice(0, i+1);
                    if ( m < rem )
                    {
                        item = item.concat(array(stdMath.floor(rem/m), m), (rem=rem%m)?[rem]:[]);
                        //item[i][1] += stdMath.floor(rem/m);
                        //if (rem=rem%m) item.push([rem,1]);
                    }
                    else if ( 0 < rem )
                    {
                        item = item.concat([rem]);
                        //next.push([rem,1]);
                    }
                }
                // if partition is all ones (so first element is also one) it is the final partition
                //else last item
                else item = null;
            /*}*/
            // invC of item
        }
        else
        {
            // compute next partition
            if ( K )
            {
                /*if ( M )
                {
                    n = n-M;
                    K = K-1;
                    m = stdMath.min(M, n-K+1);
                    i0 = 1;
                }
                else
                {
                    m = n-K+1;
                    i0 = 0;
                }
                if ( item[i0] < m )
                {
                    k = i0+1;
                    while((k<i0+K) && (item[k]+1>item[k-1])) { k++; }
                    if ( k === i0 + K ) k = i0;
                    i = i0+K-1;
                    while((i>k) && (2>item[i])) { i--; }
                    if ( i === k ) i = k+1;
                    item[k]++; item[i]--;
                }
                //else last item
                else item = null;*/
                M = K; K = null;
            }
            /*else
            {*/
                i0 = M ? 1 : 0; i1 = M ? item.length-1 : 0;
                m = M ? ((n%M) || M) : n;
                if ( (item.length > i0) && (item[i1] < m) )
                {
                    k = item.length;
                    if ( 1 < k )
                    {
                        i = k-2;
                        rem = item[k-1];
                    }
                    else
                    {
                        i = k-1;
                        rem = 0;
                    }
                    while((i > i0) && (item[i] === item[i-1])) { rem+=item[i]; i--; }
                    item[i]++; rem--;
                    item = 0 < rem ? item.slice( 0, i+1 ).concat( array(rem, 1) ) : item.slice( 0, i+1 );
                }
                // if partition is the number itself it is the final partition
                //else last item
                else item = null;
            /*}*/
        }
        return item;
    }
    return null;
}

// settings
Abacus.$ = {
    MAXMEM: 1000000,
    RANDOM: "index"
};

// combinatorial objects iterator ordering patterns
// https://oeis.org/wiki/Orderings
Abacus.ORDER = {
    
 LEX: LEX
,LEXICOGRAPHIC: LEX
,REVLEX: LEX | REVERSED
,ANTILEX: LEX | REVERSED
,REVERSELEXICOGRAPHIC: LEX | REVERSED
,ANTILEXICOGRAPHIC: LEX | REVERSED
,REFLEX: LEX | REFLECTED
,REFLECTEDLEXICOGRAPHIC: LEX | REFLECTED
,COLEX: COLEX
,COLEXICOGRAPHIC: COLEX
,REVCOLEX: COLEX | REVERSED
,ANTICOLEX: COLEX | REVERSED
,REVERSECOLEXICOGRAPHIC: COLEX | REVERSED
,ANTICOLEXICOGRAPHIC: COLEX | REVERSED
,REFCOLEX: COLEX | REFLECTED
,REFLECTEDCOLEXICOGRAPHIC: COLEX | REFLECTED
,REV: REVERSED
,REVERSE: REVERSED
,REVERSED: REVERSED
,REF: REFLECTED
,REFLECT: REFLECTED
,REFLECTED: REFLECTED
,RANDOM: RANDOM
,GRAY: MINIMAL
,MINIMAL: MINIMAL

};

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
        var self = this, klass = self[CLASS];
        self.name = name || "CombinatorialIterator";
        self.n = n || 0;
        self.$ = $ = $ || {};
        $.type = String($.type || "default").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.base = $.base || 0;
        $.dimension = $.dimension || 0;
        $.rand = $.rand || {};
        $.count = klass.count( self.n, self.$ );
        if ( $.sub instanceof CombinatorialIterator )
        {
            $.subcount = Abacus.Arithmetic.mul($.count, $.sub.total());
            $.submethod = String($.submethod || "project").toLowerCase();
            $.subcascade = -1 === $.subcascade ? -1 : 1;
            if ( "concatenate" === $.submethod )
                $.dimension = $.dimension+$.sub.dimension();
            else if ( "compose" === $.submethod )
                $.dimension = $.dimension*$.sub.dimension();
        }
        self.order( $.order ); 
    }
    
    ,__static__: {
         Iterable: function CombinatorialIterable( iter, dir ) {
            var self = this;
            if ( !(self instanceof CombinatorialIterable) ) return new CombinatorialIterable( iter );
            dir = -1 === dir ? -1 : 1;
            self.next = function( ) {
                return iter.hasNext( dir ) ? {value: iter.next( dir )/*, key: iter.index( )*/} : {done: true};
            };
        }
        
        // some C-P-T processes at play here :))
        ,C: function( item, n ) {
            return conjugation( item, n );
        }
        ,P: function( item, n ) {
            return parity( item );
        }
        ,T: function( item, n ) {
            return inversion( item, n );
        }
        
        ,count: NotImplemented
        ,initial: NotImplemented
        ,cascade: function( item, subitem, method, cascade ) {
            if ( -1 === cascade ) { var t = item; item = subitem; subitem = t; }
            if ( "concatenate" === method ) return item && subitem ? item.concat(subitem) : (item || subitem || null);
            else if ( "compose" === method ) return item && subitem ? kronecker(true, item, subitem) : (item || subitem || null);
            else/*if ( "project" === method )*/ return null == item || null == subitem ? null : array(item.length, function(i){return item[i]<subitem.length ? subitem[item[i]] : null;});
        }
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T processes at play here
            var klass = this, order = $ && $.order ? $.order : 0,
                C = klass.C, P = klass.P, T = klass.T;
            if ( RANDOM & order ) item = REFLECTED & order ? P( item, n ) : item.slice( );
            else if (MINIMAL & order ) item = REFLECTED & order ? P( item, n ) : item.slice( );
            else if ( COLEX & order ) item = REFLECTED & order ? C( item, n ) : P( C( item, n ), n );
            else/*if ( LEX & order )*/item = REFLECTED & order ? P( item, n ) : item.slice( );
            return item;
        }
        ,succ: function( dir, item, index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic;
            return null == item
                ? null
                : klass.unrank(Arithmetic.add(index, 0>dir?Arithmetic.J:Arithmetic.I), n, $)
            ;
        }
        ,rand: function( n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                N = Arithmetic.sub($ && $.count ? $.count : klass.count(n, $), Arithmetic.I),
                O = Arithmetic.O, index = Arithmetic.rnd(O, N);
            return Arithmetic.equ(O, index) ? klass.initial(1, n, $) : (Arithmetic.equ(N, index) ? klass.initial(-1, n, $) : klass.unrank(index, n, $));
        }
        ,rank: NotImplemented
        ,unrank: NotImplemented
    }
    
    ,name: "CombinatorialIterator"
    ,n: 0
    //,m: null
    //,i: null
    ,$: null
    ,__index: null
    ,_index: null
    ,__item: null
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
    
    ,base: function( ) {
        return this.$.base || 0;
    }
    
    ,dimension: function( ) {
        return this.$.dimension || 0;
    }
    
    ,total: function( non_recursive ) {
        var $ = this.$;
        return $.sub && true!==non_recursive ? ($.subcount || $.count || 0) : ($.count || 0);
    }
    
    ,_init: function( dir, reverse ) {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            order = $.order, r, tot, tot_1;
        
        self.__index = self._index = O;
        self._item = self.__item = null;
        self._prev = false; self._next = false;
        tot = $.count; tot_1 = Arithmetic.sub(tot, I);
        
        if ( RANDOM & order )
        {
            if ( ("gen" === Abacus.$.RANDOM) || (1 === $.rand[$.type]) || Arithmetic.gt(tot, Abacus.$.MAXMEM) )
            {
                // too big to keep in memory
                self.__item = klass.rand( n, $ );
                self.__index = null;
            }
            else
            {
                // lazy init
                if ( self._traversed ) self._traversed.dispose();
                self._traversed = new Abacus.BitArray( Arithmetic.val(tot) );
                r = self.random("index");
                self._traversed.set( +r );
                self.__item = klass.unrank( r, n, $ );
                if ( null != self.__item ) self.__index = r;
            }
        }
        else if ( COLEX & order )
        {
            self.__item = klass.initial( -dir, n, $ ); // T
            if ( null != self.__item ) self.__index = -1 === dir ? O : tot_1;
        }
        else /*if ( LEX & order )*/
        {
            self.__item = klass.initial( dir, n, $ );
            if ( null != self.__item ) self.__index = -1 === dir ? tot_1 : O;
        }
        self._item = null == self.__item ? null : klass.dual( self.__item, self.__index, n, $ );
        self._index = reverse && !(RANDOM & order) ? tot_1 : O;
        if ( null === self.__index ) self.__index = O;
        self._prev = (RANDOM & order) || !reverse ? false : null != self.__item;
        self._next = reverse && !(RANDOM & order) ? false : null != self.__item;
        
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
        dir = REVERSED & order ? -1 : 1; // T
        dir = reverse ? -dir : dir; // T
        $.order = order;
        
        if ( $.sub )
        {
            if ( rewind ) $.sub.rewind(reverse ? -1 : 1);
            else $.sub.order(suborder,reverse ? -1 : 1);
            self.__subindex = $.sub.index();
            self.__subitem = $.sub.next(reverse ? -1 : 1);
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
        
        self._init(dir, reverse);
        
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
            order = $.order, tot_1, dir = REVERSED & order ? -1 : 1; // T
        
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
            
            tot_1 = Arithmetic.sub(tot, I);
            if ( COLEX & order )
            {
                self.__index = -1 === dir ? index : Arithmetic.sub(tot_1, index);
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? klass.initial( -dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( dir, n, $ )
                : klass.unrank( self.__index, n, $ ));
                self._item = klass.dual( self.__item, self.__index, n, $ );
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
            else if ( !(RANDOM & order) )
            {
                self.__index = -1 === dir ? Arithmetic.sub(tot_1, index) : index;
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? klass.initial( dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( -dir, n, $ )
                : klass.unrank( self.__index, n, $ ));
                self._item = klass.dual( self.__item, self.__index, n, $ );
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
            dir = REVERSED & order ? -1 : 1;
            tot_1 = Arithmetic.sub(tot, I);
            
            self.__item = index.slice( );
            self.__index = klass.rank( self.__item, n, $ );
            if ( RANDOM & order )
            {
                self._index = self.__index;
                o = $.order; $.order = order;
                self._item = klass.dual( self.__item, self.__index, n, $ );
                $.order = o;
            }
            else if ( COLEX & order )
            {
                self._index = -1 === dir ? self.__index : Arithmetic.sub(tot_1, self.__index);
                o = $.order; $.order = order;
                self._item = klass.dual( self.__item, self.__index, n, $ );
                $.order = o;
            }
            else /*if ( LEX & order )*/
            {
                self._index = -1 === dir ? Arithmetic.sub(tot_1, self.__index) : self.__index;
                o = $.order; $.order = order;
                self._item = klass.dual( self.__item, self.__index, n, $ );
                $.order = o;
            }
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
            dir = REVERSED & order ? -1 : 1;
            tot_1 = Arithmetic.sub(tot, I);
            if ( RANDOM & order )
            {
                indx = null;//self.random("index");
                o = $.order; $.order = order;
                item =  klass.dual(
                    /*klass.unrank( indx, n, $ )*/
                    klass.rand( n, $ )
                    , indx, n, $
                );
                $.order = o;
                if ( $.sub ) item = klass.cascade(item, subitem, $.submethod, $.subcascade);
                return item;
            }
            else if ( COLEX & order )
            {
                indx = -1 === dir ? index : Arithmetic.sub(tot_1, index);
                o = $.order; $.order = order;
                item = klass.dual( Arithmetic.equ(O, index)
                ? klass.initial( -dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( dir, n, $ )
                : klass.unrank( indx, n, $ )), indx, n, $ );
                $.order = o;
                if ( $.sub ) item = klass.cascade(item, subitem, $.submethod, $.subcascade);
                return item;
            }
            else /*if ( LEX & order )*/
            {
                indx = -1 === dir ? Arithmetic.sub(tot_1, index) : index;
                o = $.order; $.order = order;
                item = klass.dual( Arithmetic.equ(O, index)
                ? klass.initial( dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( -dir, n, $ )
                : klass.unrank( indx, n, $ )), indx, n, $ );
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
                tot;
            
            if ( m === !!m )
            {
                non_recursive = m;
                m = null;
                M = null;
            }
            tot = $.sub && !non_recursive ? $.subcount : $.count;
            
            if ( (null == m) && (null == M)  )
            {
                m = O;
                M = Arithmetic.sub(tot, I);
            }
            else if ( null == M )
            {
                m = N( m || 0 );
                M = Arithmetic.sub(tot, I);
            }
            else
            {
                m = N( m );
                M = N( M );
            }
            return Arithmetic.rnd( m, M );
        }
        $.order |= RANDOM;
        item = klass.rand( self.n, $ );
        $.order = o;
        item = klass.dual( item, null, self.n, $ );
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
    
    // some C-P-T processes at play here as well, see below
    ,next: function( dir ) {
        var self = this, klass = self[CLASS], Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            traversed, r, reverse, n = self.n, $ = self.$,
            order = $.order, tot = $.count, tot_1, rs,
            current = $.sub ? self._subitem : self._item;
        
        reverse = -1 === dir;
        dir = REVERSED & order ? -1 : 1; // T
        //dir = reverse ? -dir : dir; // T
        
        if ( reverse )
        {
            // random order has no prev
            if ( RANDOM & order ) return null;
            
            // compute prev, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
            if ( COLEX & order )
            {
                self.__item = klass.succ( dir, self.__item, self.__index, n, $ );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 > dir ? J : I);
            }
            else /*if ( LEX & order )*/
            {
                self.__item = klass.succ( -dir, self.__item, self.__index, n, $ );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 < dir ? J : I);
            }
            
            self._prev = null != self.__item;
            if ( !self._prev )
            {
                if ( $.sub && $.sub.hasNext(-1) )
                {
                    self.__subindex = $.sub.index();
                    self.__subitem = $.sub.next(-1);
                    self._init(-dir, reverse);
                }
                else
                {
                    self.__subindex = null;
                    self.__subitem = null;
                }
            }
            else
            {
                self._index = Arithmetic.sub(self._index, I);
            }
            
            self._item = null == self.__item ? null : klass.dual( self.__item, self.__index, n, $ );
            
            if ( $.sub )
            {
                self._prev = self._prev && (null != self.__subitem);
                self._subindex = self._prev ? Arithmetic.add(Arithmetic.mul(self._index,$.sub.total()), self.__subindex) : null;
                self._subitem = self._prev ? klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade) : null;
            }
            
            return current;
        }
        
        if ( RANDOM & order )
        {
            tot_1 = Arithmetic.sub(tot, I);
            if ( Arithmetic.lt(self._index, tot_1) )
            {
                traversed = self._traversed;
                if ( !traversed )
                {
                    self.__item = klass.rand( n, $ );
                    self.__index = null;
                }
                else
                {
                    // get next un-traversed index, reject if needed
                    r = self.random("index");
                    rs = Abacus.Math.rnd( ) > 0.5 ? J : I;
                    while ( traversed.isset( +r ) ) r = Arithmetic.wrap( Arithmetic.add(r, rs), O, tot_1 );
                    traversed.set( +r );
                    self.__item = klass.unrank( r, n, $ );
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
            // compute next, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
            if ( COLEX & order )
            {
                self.__item = klass.succ( -dir, self.__item, self.__index, n, $ );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 < dir ? J : I);
            }
            else /*if ( LEX & order )*/
            {
                self.__item = klass.succ( dir, self.__item, self.__index, n, $ );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 > dir ? J : I);
            }
        }
        
        self._next = null != self.__item;
        if ( !self._next )
        {
            if ( $.sub && $.sub.hasNext() )
            {
                self.__subindex = $.sub.index();
                self.__subitem = $.sub.next();
                self._init(dir, reverse);
            }
            else
            {
                self.__subindex = null;
                self.__subitem = null;
            }
        }
        else
        {
            self._index = Arithmetic.add(self._index, I);
            if ( null === self.__index ) self.__index = self._index;
        }
            
        self._item = null == self.__item ? null : klass.dual( self.__item, self.__index, n, $ );
        
        if ( $.sub )
        {
            self._next = self._next && (null != self.__subitem);
            self._subindex = self._next ? Arithmetic.add(Arithmetic.mul(self._index,$.sub.total()), self.__subindex) : null;
            self._subitem = self._next ? klass.cascade(self._item, self.__subitem, $.submethod, $.subcascade) : null;
        }
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.sub ? $.subcount : $.count, range, count, i, iter_state, dir = 1,
            argslen = arguments.length, tot_1 = Arithmetic.sub(tot, I),
            not_randomised = !(RANDOM & $.order);
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
        start = Arithmetic.clamp( start, O, tot_1 );
        if ( not_randomised ) end = Arithmetic.clamp( end, O, tot_1 );
        if ( Arithmetic.lte(start, end) )
        {
            // store current iterator state
            iter_state = [
                 self.$.order
                ,self.__index
                ,self._index
                ,self.__item&&self.__item.slice()
                ,self._item&&self._item.slice()
                ,self.__subindex
                ,self._subindex
                ,self.__subitem&&self.__subitem.slice()
                ,self._subitem&&self._subitem.slice()
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
// see also: http://www.inf.ethz.ch/personal/markusp/papers/perm.ps
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
            $.base = operate(function(m, k){return k > m ? k : m;}, 0, n);
            $.dimension = n.length;
        }
        CombinatorialIterator.call(self, "Tensor", n, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, n[1] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return $ && "tuple"===$.type ? (!n || !n[0] ? 0 : Abacus.Math.exp(n[0], n[1])) : (!n || !n.length ? 0 : Abacus.Math.product(n));
        }
        ,initial: function( dir, n, $ ) {
            // last (0>dir) is C-symmetric of first (0<dir)
            var item = $ && "tuple"===$.type ? (
                !n[0] ? [] : (0 > dir ? array(n[0], n[1]-1, 0) : array(n[0], 0, 0))
            ) : (
                !n.length ? [] : (0 > dir ? array(n.length, function(i){return n[i]-1;}): array(n.length, 0, 0))
            );
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T processes at play here
            var klass = this, order = $ && $.order ? $.order : 0,
                C = $ && "tuple"===$.type ? klass.C : CombinatorialIterator.C, P = klass.P, T = klass.T;
            if ( RANDOM & order ) return REFLECTED & order ? P( item, n ) : item.slice( );
            else if ( MINIMAL & order ) return REFLECTED & order ? P( item, n ) : item.slice( );
            else if ( COLEX & order ) return REFLECTED & order ? C( item, n ) : P( C( item, n ), n );
            else/*if ( LEX & order )*/return REFLECTED & order ? P( item, n ) : item.slice( );
        }
        ,succ: function( dir, item, index, n, $ ) {
            return next_tensor( item, n, dir, $ && $.type ? $.type : "tensor" );
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, item;
            item = $ && "tuple"===$.type ? (
                // p ~ 1 / n^k
                !n[0] ? [] : array(n[0], function(i){return rndInt(0, n[1]-1);})
            ) : (
                // p ~ 1 / n1*n2*..nk
                !n.length ? [] : array(n.length, function(i){return rndInt(0, n[i]-1);})
            );
            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) { 
            var Arithmetic = Abacus.Arithmetic,
                add = Arithmetic.add, mul = Arithmetic.mul,
                index = Arithmetic.O, J = Arithmetic.J, index, nd, i;
            if ( $ && "tuple"===$.type )
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
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var Arithmetic = Abacus.Arithmetic,
                mod = Arithmetic.mod, div = Arithmetic.div, val = Arithmetic.val,
                r, b, i, t, item, nd;
            if ( $ && "tuple"===$.type )
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
            return item;
        }
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
        $ = $ || {}; $.type = $.type || "permutation";
        n = n||1;
        if ( n instanceof CombinatorialIterator )
        {
            $.sub = n;
            n = $.sub.dimension();
        }
        $.base = $.dimension = n;
        // random ordering for derangements is based on random generation, instead of random unranking
        $.rand = {"derangement":1,"involution":1};
        CombinatorialIterator.call(self, "Permutation", n, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, -1 );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
            var type = $ && $.type ? $.type : "permutation";
            return "cyclic" === type ? Abacus.Arithmetic.N(n) : Abacus.Math.factorial(n, "derangement"===type?false:null);
        }
        ,initial: function( dir, n, $ ) {
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, type = $ && $.type ? $.type : "permutation";
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
            else//if ( ("involution" === type) || ("multiset" === type) || ("permutation" === type) )
            {
                item = 0 > dir ? array(n, n-1, -1) : array(n, 0, 1);
            }
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,dual: CombinatorialIterator.dual
        ,succ: function( dir, item, index, n, $ ) {
            var type = $ && $.type ? $.type : "permutation";
            if ( ("involution" === type) || ("multiset" === type) ) return null;
            return next_permutation( item, n, dir, type );
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, type = $ && $.type ? $.type : "permutation";
            if ( "cyclic" === type )
            {
                // p ~ 1 / n
                var k = rndInt(0, n-1);
                return 0 < k ? array(n-k, k, 1).concat(array(k, 0, 1)) : array(n, 0, 1);
            }
            else if ( "derangement" === type )
            {
                // p ~ 1 / !n = e / n!
                var j, t, p, fixed = false, item = new Array(n);
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
                return item;
            }
            else if ( ("involution" === type) || ("multiset" === type) )
            {
                return NotImplemented();
            }
            else//if ( "permutation" === type )
            {
                // p ~ 1 / n!
                return shuffle(array(n, 0, 1));
            }
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                add = Arithmetic.add, mul = Arithmetic.mul,
                index = Arithmetic.O, i, m, I;
            n = n || item.length;
            if ( !n ) return Arithmetic.J;
            if ( "cyclic"=== type )
            {
                return item[0];
            }
            else if ( "derangement" === type )
            {
                /*item = permutation2inversion( item );
                for(I=n&1?-1:1,i=0; i<n-1; i++,I=-I)
                {
                    index = add(mul(index,n-i), I*(n-i)+item[ i ]);
                }
                return index;*/
                return NotImplemented();
            }
            else if ( ("involution" === type) || ("multiset" === type) )
            {
                return NotImplemented();
            }
            else//if ( "permutation" === type )
            {
                item = permutation2inversion( item );
                for(m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), item[ i ]);
                return index;
            }
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                mod = Arithmetic.mod, div = Arithmetic.div, val = Arithmetic.val,
                item, r, i, b, t;
            if ( !n ) return [ ];
            if ( "cyclic"=== type )
            {
                index = val(index);
                return array(n, function(i){return (index+i)%n});
            }
            else if ( "derangement" === type )
            {
                return NotImplemented();
            }
            else if ( ("involution" === type) || ("multiset" === type) )
            {
                return NotImplemented();
            }
            else//if ( "permutation" === type )
            {
                item = array( n ); item[ n-1 ] = 0;
                for (r=index,i=n-2; i>=0; i--)
                {
                    b = n-i; t = mod(r, b); r = div(r, b);
                    item[ i ] = val(t);
                }
                return inversion2permutation( item );
            }
        }
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
        ,is_involution: function( item ) {
            return is_kthroot( item, 1 );
        }
        ,is_kthroot: function( item, k ) {
            return k > 1 ? is_kthroot( item, k-1 ) : false;
        }
        ,is_connected: function( item ) {
            var n = item.length, m = -1, i;
            for (i=0; i<n-1; i++) // for all proper prefixes, do:
            {
                if ( item[i] > m ) m = item[i]; // update max.
                if ( m <= i ) return false; // prefix mapped to itself, P not connected.
            }
            return true; // P is connected.
        }
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
         C: function( item, n ) {
            return conjugation( item, n[0] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             var type = $ && $.type ? $.type : "unordered";
             return "ordered+repeated" === type ? (
                Abacus.Math.exp(n[0], n[1])
            ) : ("repeated" === type ? (
                Abacus.Math.factorial(n[0]+n[1]-1, n[1])
            ) : ("ordered" === type ? (
                Abacus.Math.factorial(n[0], -n[1])
            ) : (
                Abacus.Math.factorial(n[0], n[1])
            )));
         }
        ,initial: function( dir, n, $ ) {
            // last (0>dir) is C-symmetric of first (0<dir)
            var type = $ && $.type ? $.type : "unordered",
                item = ("ordered+repeated" === type) || ("repeated" === type) ? (
                0 > dir ? array(n[1], n[0]-1, 0) : array(n[1], 0, 0)
            ) : ("ordered" === type ? (
                0 > dir ? array(n[1], n[0]-1, -1) : array(n[1], 0, 1)
            ) : (
                0 > dir ? array(n[1], n[0]-n[1], 1) : array(n[1], 0, 1)
            ));
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,dual: function( item, index, n, $ ) {
            item = CombinatorialIterator.dual.call(this, item, index, n, $);
            if ( $ && "binary" === $.type ) item = subset2binary(item, n[0]);
            return item;
        }
        ,succ: function( dir, item, index, n, $ ) {
            return next_combination( item, n, dir, $ && $.type ? $.type : "unordered" );
        }
        ,rand: function( n, $ ) {
            var type = $ && $.type ? $.type : "unordered",
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
            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) {
            var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add, sub = Arithmetic.sub,
                mul = Arithmetic.mul, O = Arithmetic.O, I = Arithmetic.I,
                index = O, i, c, j, k = n[1], N, binom,
                type = $ && $.type ? $.type : "unordered", factorial = Abacus.Math.factorial;
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
                    // adjust the order to match MSB to LSB 
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]-i+1; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,Arithmetic.I),index);
            }
            else if ( "ordered" === type )
            {
                // rank(ordered) = rank(k-n-permutation)
                N = n[0]; item = permutation2inversion( item, N );
                for(i=0; i<k; i++) index = add(mul(index, N-i), item[ i ]);
                return index;
            }
            else//if ( ("unordered" === type) || ("binary" === type) )
            {
                N = n[0];
                binom = $ && $.count ? $.count : factorial(N, k);
                for(i=1; i<=k; i++)
                {
                    // adjust the order to match MSB to LSB 
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,Arithmetic.I),index);
            }
            return index;
        }
        ,unrank: function( index, n, $ ) {
            var Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                sub = Arithmetic.sub, div = Arithmetic.div, mod = Arithmetic.mod,
                mul = Arithmetic.mul, lte = Arithmetic.lte, gt = Arithmetic.gt,
                val = Arithmetic.val, item, binom, k = n[1], N, m, t, p,
                type = $ && $.type ? $.type : "unordered", repeated;
            n = n[0];
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
                // unrank(ordered) = unrank(k-n-permutation)
                for(m=index,p=k-1; p>=0; p--)
                {
                    N = n-p; t = mod(m, N); m = div(m, N);
                    item[ p ] = val(t);
                }
                item = inversion2permutation( item, n );
            }
            else//if ( ("repeated" === type) || ("unordered" === type) || ("binary" === type) )
            {
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
        $.dimension = {from:0, to:n};
        CombinatorialIterator.call(self, "Subset", n, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return difference( n, item );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return Abacus.Math.pow2(n);
        }
        ,initial: function( dir, n, $ ) {
            // last (0>dir) is C-symmetric of first (0<dir)
            var item = 0 > dir ? array(n, 0, 1) : [];
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T processes at play here
            var klass = this, order = $ && $.order ? $.order : 0,
                C = klass.C, P = klass.P, T = klass.T;
            if ( RANDOM & order ) item = REFLECTED & order ? item.slice( ) : P( item, n );
            else if ( MINIMAL & order ) item = REFLECTED & order ? item.slice( ) : P( item, n );
            else if ( COLEX & order ) item = REFLECTED & order ? P( C( item, n ), n ) : C( item, n );
            else/*if ( LEX & order )*/item = REFLECTED & order ? item.slice( ) : P( item, n );
            if ( $ && "binary"===$.type ) item = subset2binary(item, n);
            return item;
        }
        ,succ: CombinatorialIterator.succ
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, item;
            // p ~ 1 / 2^n
            for(var list = null,i=n-1; i>=0; i--) if ( rndInt(0,1) )
                list = {len:list?list.len+1:1, k:i, next:list};
            item = list ? array(list.len, function(i){var k = list.k; list = list.next; return k;}): [];
            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                add = Arithmetic.add, shl = Arithmetic.shl,
                index = O, i = 0, l = subset.length;
            while ( i < l ) index = add(index, shl(I, subset[i++]));
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, J = Arithmetic.J,
                band = Arithmetic.band, shr = Arithmetic.shr, gt = Arithmetic.gt, 
                subset = [], i = 0;
            if ( !Arithmetic.inside(index, J, $ && $.count ? $.count : klass.count(n, $)) ) return null;
            while ( gt(index, O) )
            {
                // loop unrolling
                if ( gt(band(index,1),O) ) subset.push( i );
                if ( gt(band(index,2),O) ) subset.push( i+1 );
                if ( gt(band(index,4),O) ) subset.push( i+2 );
                if ( gt(band(index,8),O) ) subset.push( i+3 );
                if ( gt(band(index,16),O) ) subset.push( i+4 );
                if ( gt(band(index,32),O) ) subset.push( i+5 );
                if ( gt(band(index,64),O) ) subset.push( i+6 );
                if ( gt(band(index,128),O) ) subset.push( i+7 );
                i+=8; index = shr(index, 8);
            }
            return subset;
        }
        ,binary: function( item, n, dir ) {
            return -1 === dir ? binary2subset(item, n) : subset2binary(item, n);
        }
    }
});

// https://en.wikipedia.org/wiki/Partitions
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
        $.dimension = "constant"===$["length"] ? (K||n) : (k1===k0 ? k0 : {from:stdMath.min(k0,k1), to:stdMath.max(k0,k1)});
        CombinatorialIterator.call(self, "Partition", n, $);
    }
    
    ,__static__: {
         C: function( item, n, packed ) {
            return conjugatepartition( item, true===packed );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
            var add = Abacus.Arithmetic.add,
                partitions = Abacus.Math.partitions,
                //MM = $ && $["max>="] ? $["max>="]|0 : null,
                //KK = $ && $["parts<="] ? $["parts<="]|0 : MM,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                k, m, p = Abacus.Arithmetic.O,
                m0 = M ? M : 0, m1 = M ? M : 1,
                k0 = K ? K : 1, k1 = K ? K : n;
            if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (M && M > n) || (K && K > n) ) return p;
            if ( M && !K ) { m0 = 0; m1 = 1; k0 = M; k1 = M; } // count the conjugates, same
            for(k=k0; k<=k1; k++) for(m=m0?m0:n-k+1; m>=m1; m--) p = add(p, partitions(n, k, m));
            return p;
        }
        ,initial: function( dir, n, $ ) {
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, k, m,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( 0 > n ) return null;
            if ( K && M )
            {
                return null;
                /*
                // restricted partition n into exactly K parts with largest part=M
                // equivalent to partition n-M into K-1 parts with largest part<=M
                if ( (K+M > n+1) || (K*M < n) ) return null;
                if ( 0 > dir )
                {
                    k = M+M+K<n+2 ? stdMath.max(0, stdMath.min(K-1, stdMath.floor((n-M)/M)-1)) : 0;
                    m = n-(k+1)*M-K+k+2;
                    item = [M].concat(k?array(k, M, 0).concat(0<m?[m]:[]).concat(array(m?K-2-k:K-1-k, 1, 0)):[n-M-K+2].concat(array(K-2, 1, 0)));
                    //item = k ? [[M,1+k],[m,1],[1,m?K-2-k:K-1-k]] : [[M,1],[n-M-K+2,1],[1,K-2]];
                }
                else
                {
                    m = stdMath.min(M, stdMath.ceil((n-M)/(K-1)));
                    k = (n-M)%m;
                    item = [M].concat(array(K-2, m, 0)).concat([k||m]);
                    //item = m===M?(k?[[M,K-1],[k,1]]:[[M,K]]):(k?[[M,1],[m,K-2],[k,1]]:[[M,1],[m,K-1]]);
                }
                */
            }
            /*else*/ if ( K )
            {
                /*
                // restricted partition n to exactly K parts
                // equivalent to conjugate to partition n into parts with largest part=K
                if ( K > n ) return null;
                m = stdMath.ceil(n/K); k = n%m;
                item = 0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K-1, m, 0).concat([k||m]);
                //item = 0 > dir ? [[n-K+1,1],[1,K-1]] : (k?[[m,K-1],[k,1]]:[[m,K]]);
                */
                M = K; K = null;
            }
            /*else */if ( M )
            {
                // restricted partition n into parts with largest part=M
                // equivalent to conjugate to partition n into exactly M parts
                if ( M > n ) return null;
                k = stdMath.floor(n/M); m = n%M;
                item = 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0));
                //item = 0 > dir ? (m?[[M,k],[m,1]]:[[M,k]]) : [[M,1],[1,n-M]];
            }
            else
            {
                // unrestricted partition
                item = 0 > dir ? [n] : array(n, 1, 0);
                //item = 0 > dir ? [[n,1]] : [[1,n]];
            }
            return item;
        }
        ,cascade: CombinatorialIterator.cascade
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            var klass = this, order = $ && $.order ? $.order : 0,
                M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null,
                C = klass.C, P = klass.P, T = klass.T;
            if ( K && !M ) item = conjugatepartition(item);
            if ( RANDOM & order ) item = REFLECTED & order ? P( item, n ) : item.slice( );
            else if ( MINIMAL & order ) item = REFLECTED & order ? P( item, n ) : item.slice( );
            else if ( COLEX & order ) item = REFLECTED & order ? P( C( item, n ), n ) : C( item, n );
            else/*if ( LEX & order )*/item = REFLECTED & order ? P( item, n ) : item.slice( );
            if ( $ && "unpacked"===$.type ) item = unpackpartition(item);
            if ( $ && "set"===$.type ) return partition2sets(item);
            if ( ($ && "constant"===$['length']) && (item.length < n) ) item = item.concat(array(n-item.length, 0, 0));
            if ( $ && "packed"===$.type ) item = packpartition(item);
            return item;
        }
        ,succ: function( dir, item, index, n, $ ) {
            var M = $ && $["max="] ? $["max="]|0 : null,
                K = $ && $["parts="] ? $["parts="]|0 : null;
            if ( (0 > n) || (K && M && ((K+M > n+1) || (K*M < n))) || (K && K > n) || (M && M > n) ) return null;
            return next_partition( item, n, dir, K, M );
        }
        ,rand: CombinatorialIterator.rand
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,conjugate: conjugatepartition
        ,sets: function( item, dir ) {
            return -1 === dir ? sets2partition( item ) : partition2sets( item );
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
