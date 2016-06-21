/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python
*   @version: 0.1.0
*   https://github.com/foo123/Abacus
**/
!function( root, name, factory ) {
"use strict";
var m;
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.EXPORTED_SYMBOLS = [ name ]) && (root[ name ] = factory.call( root ));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    module.exports = factory.call( root );
else if ( ('function'===typeof(define))&&define.amd&&('function'===typeof(require))&&('function'===typeof(require.specified))&&require.specified(name) ) /* AMD */
    define(name,['require','exports','module'],function( ){return factory.call( root );});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[ name ] = (m=factory.call( root )))&&('function'===typeof(define))&&define.amd&&define(function( ){return m;} );
}(  /* current root */          this, 
    /* module name */           "Abacus",
    /* module factory */        function( undef ) {
"use strict";

var  Abacus = {VERSION: "0.1.0"}
    ,PROTO = 'prototype', CLASS = 'constructor', HAS = 'hasOwnProperty'
    ,slice = Array.prototype.slice
    ,Extend = Object.create
    ,Merge = function(a, b) {
        for (var p in b) if (b[HAS](p)) a[p] = b[p];
        return a;
    }
    ,Class = function(s, c) {
        if ( 1 === arguments.length ) { c = s; s = Object; }
        var ctor = c[CLASS];
        if ( c[HAS]('__static__') ) { ctor = Merge(ctor, c.__static__); delete c.__static__; }
        ctor[PROTO] = Merge(Extend(s[PROTO]), c);
        return ctor;
    }
    
    // utils
    ,log2 = Math.log2 || function(x) { return Math.log(x) / Math.LN2; }
    ,int = function int( x ) { return parseInt(x||0,10)||0; }
    ,to_binary_string = function to_binary_string( b ) { return b.toString( 2 );  }
    ,to_fixed_binary_string = function to_fixed_binary_string( l ) {
        return function( b ) {
            var n, bs;
            bs = b.toString( 2 );
            if ( (n = l-bs.length) > 0 ) bs = new Array(n+1).join('0') + bs;
            return bs;
        };
    }
    ,to_fixed_binary_string_32 = to_fixed_binary_string( 32 )
    // http://jsperf.com/functional-loop-unrolling/2
    // http://jsperf.com/functional-loop-unrolling/3
    ,operate = function operate( x, F, F0, i0, i1, reverse ) {
        var len = x.length;
        if ( arguments.length < 5 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( arguments.length < 4 ) i0 = 0;
        if ( i0 > i1 ) return F0;
        if ( true === reverse )
        {
        var i, k, l=i1-i0+1, l1=l-1, r=l&15, q=r&1, lr=l1-r, Fv=q?F(F0,x[i1],i1):F0;
        for (i=l1-q; i>lr; i-=2) { k = i0+i; Fv = F(F(Fv,x[k],k),x[k-1],k-1); }
        for (i=lr; i>=0; i-=16)  { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,x[k],k),x[k-1],k-1),x[k-2],k-2),x[k-3],k-3),x[k-4],k-4),x[k-5],k-5),x[k-6],k-6),x[k-7],k-7),x[k-8],k-8),x[k-9],k-9),x[k-10],k-10),x[k-11],k-11),x[k-12],k-12),x[k-13],k-13),x[k-14],k-14),x[k-15],k-15); }
        }
        else
        {
        var i, k, l=i1-i0+1, r=l&15, q=r&1, Fv=q?F(F0,x[i0],i0):F0;
        for (i=q; i<r; i+=2)  { k = i0+i; Fv = F(F(Fv,x[k],k),x[k+1],k+1); }
        for (i=r; i<l; i+=16) { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,x[k],k),x[k+1],k+1),x[k+2],k+2),x[k+3],k+3),x[k+4],k+4),x[k+5],k+5),x[k+6],k+6),x[k+7],k+7),x[k+8],k+8),x[k+9],k+9),x[k+10],k+10),x[k+11],k+11),x[k+12],k+12),x[k+13],k+13),x[k+14],k+14),x[k+15],k+15); }
        }
        return Fv;
    }
    ,operation = function operation( F, F0, i0, i1 ) {
        if ( i0 > i1 ) return F0;
        var i, k, l=i1-i0+1, r=l&15, q=r&1, Fv=q?F(F0,i0):F0;
        for (i=q; i<r; i+=2)  { k = i0+i; Fv = F(F(Fv,k),k+1); }
        for (i=r; i<l; i+=16) { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,k),k+1),k+2),k+3),k+4),k+5),k+6),k+7),k+8),k+9),k+10),k+11),k+12),k+13),k+14),k+15); }
        return Fv;
    }
    ,map = function map( x, F, i0, i1, reverse ) {
        var len = x.length;
        if ( arguments.length < 4 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( arguments.length < 3 ) i0 = 0;
        if ( i0 > i1 ) return [];
        var i, k, l=i1-i0+1, l1, lr, r, q, Fx=new Array(l);
        if ( true === reverse )
        {
            l1=l-1; r=l&15; q=r&1; lr=l1-r;
            if ( q ) Fx[0] = F(x[i1], i1, i0, i1);
            for (i=l1-q; i>lr; i-=2)
            { 
                k = i0+i;
                Fx[i  ] = F(x[k  ], k  , i0, i1);
                Fx[i+1] = F(x[k-1], k-1, i0, i1);
            }
            for (i=lr; i>=0; i-=16)
            {
                k = i0+i;
                Fx[i  ] = F(x[k  ], k  , i0, i1);
                Fx[i+1] = F(x[k-1], k-1, i0, i1);
                Fx[i+2] = F(x[k-2], k-2, i0, i1);
                Fx[i+3] = F(x[k-3], k-3, i0, i1);
                Fx[i+4] = F(x[k-4], k-4, i0, i1);
                Fx[i+5] = F(x[k-5], k-5, i0, i1);
                Fx[i+6] = F(x[k-6], k-6, i0, i1);
                Fx[i+7] = F(x[k-7], k-7, i0, i1);
                Fx[i+8] = F(x[k-8], k-8, i0, i1);
                Fx[i+9] = F(x[k-9], k-9, i0, i1);
                Fx[i+10] = F(x[k-10], k-10, i0, i1);
                Fx[i+11] = F(x[k-11], k-11, i0, i1);
                Fx[i+12] = F(x[k-12], k-12, i0, i1);
                Fx[i+13] = F(x[k-13], k-13, i0, i1);
                Fx[i+14] = F(x[k-14], k-14, i0, i1);
                Fx[i+15] = F(x[k-15], k-15, i0, i1);
            }
        }
        else
        {
            r=l&15; q=r&1;
            if ( q ) Fx[0] = F(x[i0], i0, i0, i1);
            for (i=q; i<r; i+=2)
            { 
                k = i0+i;
                Fx[i  ] = F(x[k  ], k  , i0, i1);
                Fx[i+1] = F(x[k+1], k+1, i0, i1);
            }
            for (i=r; i<l; i+=16)
            {
                k = i0+i;
                Fx[i  ] = F(x[k  ], k  , i0, i1);
                Fx[i+1] = F(x[k+1], k+1, i0, i1);
                Fx[i+2] = F(x[k+2], k+2, i0, i1);
                Fx[i+3] = F(x[k+3], k+3, i0, i1);
                Fx[i+4] = F(x[k+4], k+4, i0, i1);
                Fx[i+5] = F(x[k+5], k+5, i0, i1);
                Fx[i+6] = F(x[k+6], k+6, i0, i1);
                Fx[i+7] = F(x[k+7], k+7, i0, i1);
                Fx[i+8] = F(x[k+8], k+8, i0, i1);
                Fx[i+9] = F(x[k+9], k+9, i0, i1);
                Fx[i+10] = F(x[k+10], k+10, i0, i1);
                Fx[i+11] = F(x[k+11], k+11, i0, i1);
                Fx[i+12] = F(x[k+12], k+12, i0, i1);
                Fx[i+13] = F(x[k+13], k+13, i0, i1);
                Fx[i+14] = F(x[k+14], k+14, i0, i1);
                Fx[i+15] = F(x[k+15], k+15, i0, i1);
            }
        }
        return Fx;
    }
    ,filter = function filter( x, F, i0, i1, reverse ) {
        var len = x.length;
        if ( arguments.length < 4 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( arguments.length < 3 ) i0 = 0;
        if ( i0 > i1 ) return [];
        var i, k, l=i1-i0+1, l1, lr, r, q, Fx=[];
        if ( trye === reverse )
        {
            l1=l-1; r=l&15; q=r&1; lr=l1-r;
            if ( q && F(x[i1], i1, x) ) Fx.push(x[i1]);
            for (i=l1-q; i>lr; i-=2)
            { 
                k = i0+i;
                if ( F(x[  k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
            }
            for (i=lr; i>=0; i-=16)
            {
                k = i0+i;
                if ( F(x[  k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
                if ( F(x[--k], k, x) ) Fx.push(x[k]);
            }
        }
        else
        {
            r=l&15; q=r&1;
            if ( q && F(x[i0], i0, x) ) Fx.push(x[i0]);
            for (i=q; i<r; i+=2)
            { 
                k = i0+i;
                if ( F(x[  k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
            }
            for (i=r; i<l; i+=16)
            {
                k = i0+i;
                if ( F(x[  k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
                if ( F(x[++k], k, x) ) Fx.push(x[k]);
            }
        }
        return Fx;
    }
    ,each = function each( x, F, i0, i1, reverse ) {
        var len = x.length;
        if ( arguments.length < 4 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( arguments.length < 3 ) i0 = 0;
        if ( i0 > i1 ) return x;
        var i, k, l=i1-i0+1, l1, lr, r, q;
        if ( true === reverse )
        {
            l1=l-1; r=l&15; q=r&1; lr=l1-r;
            if ( q ) F(x[i1], i1, x, i0, i1);
            for (i=l1-q; i>lr; i-=2)
            { 
                k = i0+i;
                F(x[  k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
            }
            for (i=lr; i>=0; i-=16)
            {
                k = i0+i;
                F(x[  k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
                F(x[--k], k, x, i0, i1);
            }
        }
        else
        {
            r=l&15; q=r&1;
            if ( q ) F(x[i0], i0, x, i0, i1);
            for (i=q; i<r; i+=2)
            { 
                k = i0+i;
                F(x[  k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
            }
            for (i=r; i<l; i+=16)
            {
                k = i0+i;
                F(x[  k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
                F(x[++k], k, x, i0, i1);
            }
        }
        return x;
    }
    ,intersection = function intersect_sorted2( a, b ) {
        var ai = 0, bi = 0, intersection = [ ],
            al = a.length, bl = b.length;
        // assume a, b lists are sorted ascending
        while( ai < al && bi < bl )
        {
            if      ( a[ai] < b[bi] )
            { 
                ai++; 
            }
            else if ( a[ai] > b[bi] )
            { 
                bi++; 
            }
            else // they're equal
            {
                intersection.push( a[ ai ] );
                ai++; bi++;
            }
        }
        return intersection;
    }
    ,union = function merge_sorted2( a, b, unique ) {
        var ai = 0, bi = 0, merged = [ ], last,
            al = a.length, bl = b.length, with_duplicates;
        unique = false !== unique;
        with_duplicates = !unique;
        // assume a, b lists are sorted ascending, even with duplicate values
        while( ai < al && bi < bl )
        {
            if      (unique && merged.length) // handle any possible duplicates inside SAME list
            {
                if (a[ai] === last)
                {
                    ai++; continue;
                }
                else if (b[bi] === last)
                {
                    bi++; continue;
                }
            }
            if      ( a[ai] < b[bi] )
            { 
                merged.push( last=a[ai++] ); 
            }
            else if ( a[ai] > b[bi] )
            { 
                merged.push( last=b[bi++] ); 
            }
            else // they're equal, push one unique
            {
                merged.push( last=a[ ai ] );
                if ( with_duplicates ) merged.push( b[ bi ] );
                ai++; bi++;
            }
        }
        while ( ai < al ) if (with_duplicates || (a[ai] !== last)) merged.push( last=a[ai++] ); 
        while ( bi < bl ) if (with_duplicates || (b[bi] !== last)) merged.push( last=b[bi++] ); 
        return merged;
    }
    ,kronecker = function kronecker( /* var args here */ ) {
        var k, a, r, l, i, j, vv, tensor,
            v = arguments, nv = v.length,
            kl, product;
        
        if ( !nv ) return [];
        kl = v[0].length;
        for (k=1; k<nv; k++) kl *= v[ k ].length;
        product = new Array( kl );
        
        for (k=0; k<kl; k++)
        {
            tensor = [ ];
            for (r=k,a=nv-1; a>=0; a--)
            {
                l = v[ a ].length;
                i = r % l;
                r = ~~(r / l);
                vv = v[ a ][ i ];
                if ( vv instanceof Array )
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
        return product;
    }
    ,cartesian = function cartesian( /* var args here */ ) { }
    ,shuffle = function shuffle( a, cyclic, copied ) {
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
        var rnd = Abacus.Arithmetic.rnd,
            N, perm, swap, ac, offset;
        ac = true === copied ? a.slice() : a;
        offset = true === cyclic ? 1 : 0;
        N = ac.length;
        while ( offset < N-- )
        { 
            perm = rnd( 0, N-offset ); 
            if ( N === perm ) continue;
            swap = ac[ N ]; 
            ac[ N ] = ac[ perm ]; 
            ac[ perm ] = swap; 
        }
        // in-place or copy
        return ac;
    }
    ,pick = function pick( a, k, non_destructive ) {
        // http://stackoverflow.com/a/32035986/3591273
        var rnd = Abacus.Arithmetic.rnd,
            picked, backup, i, selected, value, n = a.length;
        k = Abacus.Arithmetic.min( k, n );
        picked = new Array( k ); 
        non_destructive = false !== non_destructive;
        if ( non_destructive ) backup = new Array( k );
        
        // partially shuffle the array, and generate unbiased selection simultaneously
        // this is a variation on fisher-yates-knuth shuffle
        for (i=0; i<k; i++) // O(k) times
        { 
            selected = rnd( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
            value = a[ selected ];
            a[ selected ] = a[ n ];
            a[ n ] = value;
            picked[ i ] = value;
            non_destructive && (backup[ i ] = selected);
        }
        if ( non_destructive )
        {
            // restore partially shuffled input array from backup
            for (i=k-1; i>=0; i--) // O(k) times
            { 
                selected = backup[ i ];
                value = a[ n ];
                a[ n ] = a[ selected ];
                a[ selected ] = value;
                n++;
            }
        }
        return picked;
    }
    ,complement = function complement( alpha, N ) {
        var beta, n, a, b, k = alpha.length;
        beta = new Array( N-k ); n=0; a=0; b=0;
        while ( n < N )
        {
            if ( a>=k || n<alpha[a] ) beta[b++] = n;
            else a++;
            n++;
        }
        return beta;
    }
    ,reverse_complement = function reverse_complement( alpha, N ) {
        // useful for transformations to/from lex / co-lex (actually rev-co-lex) orders
        if ( null == alpha ) return null;
        else if ( !alpha.length ) return [];
        var i, k = alpha.length, beta = new Array(k);
        if ( N.length === k ) for (i=0; i<k; i++) beta[i] = N[i]-1-alpha[i];
        else for (i=0; i<k; i++) beta[i] = N-1-alpha[k-1-i];
        return beta;
    }
    ,cycle2swaps = function( cycle ) {
        var swaps = [], c = cycle.length, j;
        if ( c > 1 ) for (j=c-1; j>=1; j--) swaps.push([cycle[0],cycle[j]])
        return swaps;
    }
    ,partition2cycles = function( partition ) {
        var cycles = [], cycle, i,
            pi, pl = partition.length, p,
            current = 0;
        for (pi=0; pi<pl; pi++)
        {
            p = partition[pi];
            cycle = new Array( p );
            // lexicographic cycle(s)
            for (i=0; i<p; i++) cycle[i] = current++;
            cycles.push(cycle);
        }
        return cycles;
    }
    ,sum = function sum( a ) {
        var add = Abacus.Arithmetic.add;
        return operate(a, add, 0);
    }
    ,prod = function prod( a ) {
        var mul = Abacus.Arithmetic.mul;
        return operate(a, mul, 1);
    }
    ,pow2 = function pow2( n ) {
        return Abacus.Arithmetic.shl(1, n);//(1 << n)>>>0;
    }
    ,powNK = function powNK( n, k ) {
        return Abacus.Arithmetic.pow(n, k);
    }
    ,factorial = function factorial( n ) {
        var mul = Abacus.Arithmetic.mul;
        if ( 0 > n ) return 0;
        else if ( 2 > n ) return 1;
        // 2=>2 or 3=>6
        else if ( 4 > n ) return n<<(n-2);
        else return operation(mul, 1, 2, n);
    }
    ,binomial = function binomial( n, k ) {
        if ( k > n-k ) k = n-k; // take advantage of symmetry
        if ( 0 > k || 1 > n ) return 0;
        else if ( 0 === k || 1 === n ) return 1;
        else if ( 1 === k ) return n;
        else
        {
            var mul = Abacus.Arithmetic.mul, add = Abacus.Arithmetic.add,
                n_k = n-k, Cnk = 1 + n_k, i;
            for (i=2; i<=k; i++) Cnk = add(Cnk, mul(Cnk, n_k/i));
            return Abacus.Arithmetic.round( Cnk );
        }
    }
    ,partitions = function partitions( n, k, m, tbl ) {
        // recursively compute the partition count using the recursive relation:
        // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
        // http://www.programminglogic.com/integer-partition-algorithm/
        // compute number of integer partitions of n
        // into exactly k parts having m as max value
        // m + k-1 <= n <= k*m
        if ( (m === n && 1 === k) || (k === n && 1 === m) ) return 1;
        if ( m+k>n+1 || k*m<n ) return 0;
        // compute it directly
        var add = Abacus.Arithmetic.add, j,
            jmax = Abacus.Arithmetic.min(m,n-m-k+2),
            jmin = Abacus.Arithmetic.max(1,Abacus.Arithmetic.ceil((n-m)/(k-1))), p = 0, tk;
        if ( null == tbl ) tbl = {};
        for (j=jmin; j<=jmax; j++)
        {
            tk = (n-m)+','+(k-1)+','+j;
            // memoize here
            if ( null == tbl[tk] ) tbl[tk] = partitions( n-m, k-1, j, tbl );
            p = add(p, /*partitions( n-m, k-1, j );*/ tbl[tk]);
        }
        return p;
    }
    ,LEX = 8, REVLEX = 16, COLEX = 32, REVCOLEX = 64, GRAY = 128, RANDOM = 256, STOCHASTIC = 512
    ,ORDERINGS = LEX | REVLEX | COLEX | REVCOLEX | GRAY | RANDOM | STOCHASTIC
    ,ORDER = function ORDER( o ) {
        if ( !arguments.length || null == o ) return LEX; // default
        if ( o.substr ) { o = o.toUpperCase( ); return Abacus.ORDER[HAS](o) ? Abacus.ORDER[o] : LEX; }
        return ORDERINGS & o ? o : LEX;
    }
    ,BitArray, CombinatorialIterator
    ,Permutation, Combination, CombinationRepeat, Partition, Powerset, Tensor, Tuple
    ,NotImplemented = function( method ) { 
        return !arguments.length
        ? function( ) {
            throw new Error("Method not implemented");
        }
        : function( ) {
            throw new Error("\""+method+"\" not implemented");
        };
    }
;

Abacus.Util = {

 rnd: Math.random
,rint: function( m, M ) { return Abacus.Arithmetic.round( (M-m)*Abacus.Util.rnd( ) + m ); }

,shuffle: shuffle
,pick: pick

,operate: operate
,operation: operation
,map: map
,filter: filter
,each: each
,intersection: intersection
,union: union
,kronecker: kronecker
,cartesian: cartesian

,num: function( a ) { return parseInt(a,10); }
,val: function( a ) { return Abacus.Arithmetic.floor(a.valueOf()); }

,equ: function( a, b ) { return a===b; }
,gte: function( a, b ) { return a>=b; }
,lte: function( a, b ) { return a<=b; }
,gt: function( a, b ) { return a>b; }
,lt: function( a, b ) { return a<b; }

,add: function( a, b ) { return a+b; }
,sub: function( a, b ){ return a-b; }
,mul: function( a, b ) { return a*b; }
,div: function( a, b ){ return Abacus.Arithmetic.floor(a/b); }
,mod: function( a, b ){ return a % b; }
,pow: Math.pow

,shl: function( a, b ){ return a << b; }
,shr: function( a, b ){ return a >> b; }
,bor: function( a, b ){ return a | b; }
,band: function( a, b ){ return a & b; }

,neg: function( a ){ return Abacus.Arithmetic.sub(0, a); }
,abs: Math.abs
,min: Math.min
,max: Math.max
,floor: Math.floor
,ceil: Math.ceil
,round: Math.round

,gcd: function gcd( a, b ) {
    // https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Integer_relation_algorithm
    // http://userpages.umbc.edu/~rcampbel/NumbThy/Class/Programming/JavaScript/
    var a1=1, b1=0, a2=0, b2=1, aneg=1, bneg=1, tmp, q;
    if (a < 0) { a = -a; aneg = -1; };
    if (b < 0) { b = -b; bneg = -1; };
    if (b > a) { tmp = a; a = b; b = tmp; };
    while ( true ) 
    {
        q = -Abacus.Arithmetic.floor(a / b); a %= b; a1 += q*a2; b1 += q*b2;
        if ( 0 === a )  return [b*bneg, a2, b2]; 
        q = -Abacus.Arithmetic.floor(b / a); b %= a; a2 += q*a1; b2 += q*b1;
        if ( 0 === b ) return [a*aneg, a1, b1];
    }
    return [];
}

,sum: sum
,product: prod
,pow2: pow2
,powNK: powNK
,factorial: factorial
,binomial: binomial
,partitions: partitions

};

// support pluggable arithmetics, eg biginteger Arithmetic
Abacus.Arithmetic = {
    
 num: Abacus.Util.num
,val: Abacus.Util.val

,equ: Abacus.Util.equ
,gte: Abacus.Util.gte
,lte: Abacus.Util.lte
,gt: Abacus.Util.gt
,lt: Abacus.Util.lt

,add: Abacus.Util.add
,sub: Abacus.Util.sub
,mul: Abacus.Util.mul
,div: Abacus.Util.div
,mod: Abacus.Util.mod
,pow: Abacus.Util.pow

,shl: Abacus.Util.shl
,shr: Abacus.Util.shr
,bor: Abacus.Util.bor
,band: Abacus.Util.band

,neg: Abacus.Util.neg
,abs: Abacus.Util.abs
,min: Abacus.Util.min
,max: Abacus.Util.max
,floor: Abacus.Util.floor
,ceil: Abacus.Util.ceil
,round: Abacus.Util.round
,rnd: Abacus.Util.rint

,gcd: Abacus.Util.gcd

};

// combinatorial objects iterator ordering patterns
// https://oeis.org/wiki/Orderings
Abacus.ORDER = {
    
 LEX: LEX
,LEXICOGRAPHIC: LEX
,REVLEX: REVLEX
,ANTILEX: REVLEX
,REVERSELEXICOGRAPHIC: REVLEX
,ANTILEXICOGRAPHIC: REVLEX
,COLEX: COLEX
,COLEXICOGRAPHIC: COLEX
,REVCOLEX: REVCOLEX
,ANTICOLEX: REVCOLEX
,REVERSECOLEXICOGRAPHIC: REVCOLEX
,ANTICOLEXICOGRAPHIC: REVCOLEX
//,GRAY: GRAY
//,MINIMAL: GRAY
,RANDOM: RANDOM
,RANDOMISED: RANDOM
,STOCHASTIC: STOCHASTIC

};

BitArray = Abacus.BitArray = Class({
    
    constructor: function BitArray(n) {
        var self = this;
        if ( !(self instanceof BitArray) ) return new BitArray(n);
        self.length = n;
        self.bits = new Uint32Array( Abacus.Arithmetic.ceil(n/32) );
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
        var self = this, c = new BitArray(self.length);
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
        return map( this.toArray( ), to_fixed_binary_string_32 ).join( '' );
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
    
    constructor: function CombinatorialIterator( n ) {
        var self = this, klass;
        if ( !(self instanceof CombinatorialIterator) ) return new CombinatorialIterator(n);
        klass = self[CLASS];
        self.n = n || 0;
        self._count = klass.count( self.n );
        self.order( LEX ); // default order is lexicographic ("lex")
    }
    
    ,__static__: {
         count: NotImplemented( )
        ,dual: function( item, n, order ) {
            return 0 >= n ? [] : reverse_complement( item, n );
        }
        ,rank: NotImplemented( )
        ,unrank: NotImplemented( )
        ,first: NotImplemented( )
        ,last: NotImplemented( )
        ,succ: function( offset, item, n, total ) {
            var klass = this, Arithmetic = Abacus.Arithmetic;
            if ( -1 !== offset && 1 !== offset ) offset = 1;
            return item ? klass.unrank( Arithmetic.add(klass.rank( item, n, total ), offset), n, total ) : null;
        }
        ,rand: function( n, total ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                tot = total ? total : klass.count( n ),
                tot_1 = Arithmetic.sub(tot,1),
                r = Arithmetic.rnd(0, tot_1);
            return Arithmetic.equ(0, r)
            ? klass.first( n )
            : (Arithmetic.equ(r, tot_1)
            ? klass.last( n )
            : klass.unrank( r, n, tot ));
        }
        ,stochastic: NotImplemented( )
    }
    
    ,n: 0
    ,_order: 0
    ,_count: 0
    ,_index: null
    ,__item: null
    ,_item: null
    ,_prev: null
    ,_next: null
    ,_traversed: null
    ,_stochastic: null
    
    ,dispose: function( ) {
        var self = this;
        self.n = null;
        self._order = null;
        self._count = 0;
        self._index = null;
        self.__item = null;
        self._item = null;
        self._prev = null;
        self._next = null;
        self._stochastic = null;
        if ( self._traversed )
        {
            self._traversed.dispose( );
            self._traversed = null;
        }
        return self;
    }
    
    ,_store: function( ) {
        var self = this;
        return [
         self._order
        ,self._index
        ,self.__item
        ,self._item
        ,self._prev
        ,self._next
        ];
    }
    
    ,_restore: function( state ) {
        var self = this;
        if ( state )
        {
        self._order = state[0];
        self._index = state[1];
        self.__item = state[2];
        self._item = state[3];
        self._prev = state[4];
        self._next = state[5];
        }
        return self;
    }
    
    ,total: function( ) {
        return this._count;
    }
    
    ,order: function( order, T, doubly_stochastic, __reverse__ ) {
        var self = this, klass = self[CLASS], r, tot, n;
        if ( !arguments.length ) return self._order;
        
        order = ORDER( order );
        self._order = order; self._index = 0;
        self._item = self.__item = null;
        self._prev = false; self._next = false;
        tot = self._count; n = self.n;
        __reverse__ = true === __reverse__;
        
        if ( STOCHASTIC & order )
        {
            // lazy init
            if ( (null != self._stochastic) && !T )
            {
                if ( null != self._stochastic[2] ) self._stochastic[2] = []; // reset
                self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
                self._item = self.__item.slice( );
            }
            else if ( T )
            {
                self._stochastic = [T, doubly_stochastic ? 1 : 0, doubly_stochastic ? [] : null];
                self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
                self._item = self.__item.slice( );
            }
            else
            {
                throw new Error('No Stochastic Transition Matrix given!');
            }
        }
        else if ( RANDOM & order )
        {
            // lazy init
            if ( !self._traversed ) self._traversed = new BitArray( tot );
            else self._traversed.reset( );
            self._traversed.set( r=self.randomIndex( ) );
            self.__item = self.item( r, LEX );
            self._item = null != self.__item ? self.__item.slice( ) : null;
        }
        else if ( REVCOLEX & order )
        {
            self.__item = __reverse__ ? klass.last( n ) : klass.first( n );
            self._item = klass.dual( self.__item, n, REVCOLEX );
        }
        else if ( COLEX & order )
        {
            self.__item = __reverse__ ? klass.first( n ) : klass.last( n );
            self._item = klass.dual( self.__item, n, COLEX );
        }
        else if ( REVLEX & order )
        {
            self.__item = __reverse__ ? klass.first( n ) : klass.last( n );
            self._item = null != self.__item ? self.__item.slice( ) : null;
        }
        else /*if ( LEX & order )*/
        {
            self.__item = __reverse__ ? klass.last( n ) : klass.first( n );
            self._item = null != self.__item ? self.__item.slice( ) : null;
        }
        self._next = null != self._item;
        return self;
    }
    
    ,index: function( index ) {
        if ( !arguments.length ) return this._index;
        
        var self = this, Arithmetic = Abacus.Arithmetic, klass = self[CLASS],
            n = self.n, tot = self._count, order = self._order, tot_1;
        
        index = Arithmetic.num( index );
        if ( Arithmetic.gt(0, index) ) index = Arithmetic.add(index, tot);
        if ( Arithmetic.gte(index, 0) && Arithmetic.lt(index, tot) )
        {
            tot_1 = Arithmetic.sub(tot, 1);
            if ( REVCOLEX & order )
            {
                self._index = index;
                self.__item = Arithmetic.equ(0, index)
                ? klass.first( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.last( n )
                : klass.unrank( index, n, tot ));
                self._item = klass.dual( self.__item, n, REVCOLEX );
            }
            else if ( COLEX & order )
            {
                self._index = index;
                self.__item = Arithmetic.equ(0, index)
                ? klass.last( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.first( n )
                : klass.unrank( Arithmetic.sub(tot_1,index), n, tot ));
                self._item = klass.dual( self.__item, n, COLEX );
            }
            else if ( REVLEX & order )
            {
                self._index = index;
                self.__item = Arithmetic.equ(0, index)
                ? klass.last( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.first( n )
                : klass.unrank( Arithmetic.sub(tot_1,index), n, tot ));
                self._item = self.__item.slice( );
            }
            else if ( LEX & order )
            {
                self._index = index;
                self.__item = Arithmetic.equ(0, index)
                ? klass.first( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.last( n )
                : klass.unrank( index, n, tot ));
                self._item = self.__item.slice( );
            }
        }
        return self;
    }
    
    ,item: function( index, order ) {
        if ( !arguments.length ) return this._item;
        
        var self = this, n = self.n, tot = self._count, tot_1,
            klass = self[CLASS], Arithmetic = Abacus.Arithmetic, traversed, r;
        order = null != order ? ORDER( order ) : self._order;
        
        index = Arithmetic.num( index );
        if ( Arithmetic.gt(0, index) ) index = Arithmetic.add(index, tot);
        if ( Arithmetic.gte(index, 0) && Arithmetic.lt(index, tot) )
        {            
            tot_1 = Arithmetic.sub(tot, 1);
            if ( RANDOM & order )
            {
                traversed = self._traversed;
                // get next un-traversed index, reject if needed
                while ( traversed.isset( r = self.randomIndex( ) ) ) ;
                traversed.set( r );
                return klass.unrank( r, n, tot );
            }
            else if ( REVCOLEX & order )
            {
                return klass.dual( Arithmetic.equ(0, index)
                ? klass.first( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.last( n )
                : klass.unrank( index, n, tot )), n, REVCOLEX );
            }
            else if ( COLEX & order )
            {
                return klass.dual( Arithmetic.equ(0, index)
                ? klass.last( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.first( n )
                : klass.unrank( Arithmetic.sub(tot_1,index), n, tot )), n, COLEX );
            }
            else if ( REVLEX & order )
            {
                return Arithmetic.equ(0, index)
                ? klass.last( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.first( n )
                : klass.unrank( Arithmetic.sub(tot_1,index), n, tot ));
            }
            else //if ( LEX & order )
            {
                return Arithmetic.equ(0, index)
                ? klass.first( n )
                : (Arithmetic.equ(tot_1, index)
                ? klass.last( n )
                : klass.unrank( index, n, tot ));
            }
        }
        return null;
    }
    
    ,randomIndex: function( m, M ) {
        var self = this, Arithmetic = Abacus.Arithmetic, tot = self._count, argslen = arguments.length;
        if ( 0 === argslen )
        {
            m = 0;
            M = Arithmetic.sub(tot,1);
        }
        else if ( 1 === argslen )
        {
            m = Arithmetic.num( m || 0 );
            M = Arithmetic.sub(tot,1);
        }
        else
        {
            m = Arithmetic.num( m );
            M = Arithmetic.num( M );
        }
        return Arithmetic.rnd( m, M );
    }
    
    ,random: function( ) {
        var self = this, klass = self[CLASS];
        return klass.rand( self.n, self._count );
    }
    
    ,rewind: function( ) {
        var self = this;
        self.order( self._order );
        self._prev = false;
        return self;
    }
    
    ,hasNext: function( ) {
        return STOCHASTIC & this._order ? true : this._next;
    }
    
    ,next: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, order = self._order, traversed, r,
            klass = self[CLASS], current = self._item, n = self.n, tot = self._count;
        
        if ( STOCHASTIC & order )
        {
            self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
            self._item = self.__item.slice( );
        }
        else if ( RANDOM & order )
        {
            if ( Arithmetic.lt(Arithmetic.add(self._index,1), tot) )
            {
                self._index = Arithmetic.add(self._index, 1);
                traversed = self._traversed;
                // get next un-traversed index, reject if needed
                while ( traversed.isset( r = self.randomIndex( ) ) ) ;
                traversed.set( r );
                self.__item = self.item( r, LEX );
                self._item = null != self.__item ? self.__item.slice( ) : null;
                self._next = null != self.__item;
            }
            else
            {
                self._next = false;
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
            if ( REVCOLEX & order )
            {
                self.__item = klass.succ( 1, self.__item, n, tot );
                self._item = klass.dual( self.__item, n, REVCOLEX );
            }
            else if ( COLEX & order )
            {
                self.__item = klass.succ( -1, self.__item, n, tot );
                self._item = klass.dual( self.__item, n, COLEX );
            }
            else if ( REVLEX & order )
            {
                self.__item = klass.succ( -1, self.__item, n, tot );
                self._item = null != self.__item ? self.__item.slice( ) : null;
            }
            else /*if ( LEX & order )*/
            {
                self.__item = klass.succ( 1, self.__item, n, tot );
                self._item = null != self.__item ? self.__item.slice( ) : null;
            }
            self._next = null != self.__item;
            if ( self._next ) self._index = Arithmetic.add(self._index, 1);
        }
        return current;
    }
    
    ,forward: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        self.order( self._order, null, null, true );
        self._prev = Arithmetic.gte(self._index, 0); self._next = false;
        return self;
    }
    
    ,hasPrev: function( ) {
        return (RANDOM | STOCHASTIC) & this._order ? false : this._prev;
    }
    
    ,prev: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, order = self._order,
            klass = self[CLASS], current = self._item, n = self.n, tot = self._count;
        
        // random and stochastic order has no prev
        if ( (RANDOM | STOCHASTIC) & order ) return null;
        
        // compute prev, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
        if ( REVCOLEX & order )
        {
            self.__item = klass.succ( -1, self.__item, n, tot );
            self._item = klass.dual( self.__item, n, REVCOLEX );
        }
        else if ( COLEX & order )
        {
            self.__item = klass.succ( 1, self.__item, n, tot );
            self._item = klass.dual( self.__item, n, COLEX );
        }
        else if ( REVLEX & order )
        {
            self.__item = klass.succ( 1, self.__item, n, tot );
            self._item = null != self.__item ? self.__item.slice( ) : null;
        }
        else /*if ( LEX & order )*/
        {
            self.__item = klass.succ( -1, self.__item, n, tot );
            self._item = null != self.__item ? self.__item.slice( ) : null;
        }
        self._prev = null != self.__item;
        if ( self._prev ) self._index = Arithmetic.sub(self._index, 1);
        
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            tmp, tot = self._count, range, count, i, prev, dir = 1,
            argslen = arguments.length, tot_1 = Arithmetic.sub(tot,1);
        if ( argslen < 1 )
        {
            start = 0;
            end = tot_1;
        }
        else if ( argslen < 2 )
        {
            start = Arithmetic.num( start );
            end = tot_1;
        }
        else
        {
            start = Arithmetic.num( start );
            end = Arithmetic.num( end );
        }
        if ( Arithmetic.lt(start, 0) ) start = Arithmetic.add(start,tot);
        if ( Arithmetic.lt(end, 0) ) end = Arithmetic.add(end,tot);
        if ( Arithmetic.gt(start, end) )
        {
            tmp = start;
            start = end;
            end = tmp;
            dir = -1;
        }
        if ( Arithmetic.lt(start, 0) ) start = 0;
        if ( Arithmetic.gt(end, tot_1) ) end = tot_1;
        if ( Arithmetic.lte(start, end) )
        {
            // store current iterator state
            prev = self._store( );
            if ( !((STOCHASTIC | RANDOM) & self._order) ) self.index( start ); 
            count = Arithmetic.val(Arithmetic.sub(end, start)); range = new Array( count+1 );
            if ( 0 > dir ) for (i=count; i>=0; i--) range[ i ] = self.next( );
            else for (i=0; i<=count; i++) range[ i ] = self.next( );
            // restore previous iterator state
            self._restore( prev );
        }
        else
        {
            range = [];
        }
        return range;
    }
});

// https://en.wikipedia.org/wiki/Permutations
Permutation = Abacus.Permutation = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Permutation( n ) {
        var self = this;
        if ( !(self instanceof Permutation) ) return new Permutation(n);
        CombinatorialIterator.call(self, n);
    }
    
    ,__static__: {
         count: function( n ) {
             return factorial( n );
         }
        ,dual: CombinatorialIterator.dual
        ,rank: function( perm, n ) {
            // O(n log n) uniform lexicographic ranking.
            var Arithmetic = Abacus.Arithmetic,
                index = 0, i, j, node, ctr,
                k = Arithmetic.ceil(log2(n)), Tl = (1<<(1+k))-1, 
                T = new Array(Tl), twok = Arithmetic.shl(1,k);
            for(i=0; i<Tl; i++) T[i] = 0;
            for(i=0; i<n; i++)
            {
                ctr = perm[i];
                node = Arithmetic.val(Arithmetic.add(twok, ctr));
                for(j=0; j<k; j++)
                {
                    if ( node&1 ) ctr = Arithmetic.sub(ctr, T[(node >>> 1) << 1]);
                    T[node] = Arithmetic.add(T[node],1);
                    node >>>= 1;
                }
                T[node] = Arithmetic.add(T[node],1);
                index = Arithmetic.add(Arithmetic.mul(index, Arithmetic.sub((n, i))), ctr);
            }
            return index;
        }
        ,unrank: function( index, n, total ) {
            // O(n log n) uniform lexicographic unranking.
            var Arithmetic = Abacus.Arithmetic, klass = this, 
                perm, fn, i, j, i2, 
                digit, node, rem, k, Tl, T, twok;
            
            total = total || factorial(n);
            if ( Arithmetic.equ(0, index) ) return klass.first( n );
            else if ( Arithmetic.equ(total, Arithmetic.add(index,1)) ) return klass.last( n );
                
            perm = new Array(n); fn = Arithmetic.div(total, n);
            k = Arithmetic.ceil(log2(n)); Tl = (1<<(1+k))-1;
            T = new Array(Tl); twok = Arithmetic.shl(1,k);
            
            for (i=0; i<=k; i++)
                for (j=1,i2=1<<i; j<=i2; j++) 
                    T[i2-1+j] = Arithmetic.shl(1, Arithmetic.sub(k, i));
            
            rem = n-1;
            for (i=0; i<n; i++)
            {
                digit = Arithmetic.div(index, fn); 
                node = 1;
                for (j=0; j<k; j++)
                {
                    T[node] = Arithmetic.sub(T[node],1);
                    node <<= 1;
                    if ( Arithmetic.gte(digit, T[node]) )
                    {
                        digit = Arithmetic.sub(digit, T[node]);
                        node++;
                    }
                }
                T[node] = 0;
                perm[i] = Arithmetic.val(Arithmetic.sub(node, twok));
                if ( rem )
                {
                    index = Arithmetic.mod(index, fn); 
                    fn = Arithmetic.div(fn, rem); 
                    rem--;
                }
            }
            return perm;
        }
        ,first: function( n ) {
            var i, perm = new Array(n);
            for(i=0; i<n; i++) perm[i] = i;
            return perm;
        }
        ,last: function( n ) {
            var i, perm = new Array(n);
            for(i=0; i<n; i++) perm[i] = n-1-i;
            return perm;
        }
        ,succ: function( offset, item, n ) {
            // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
            if ( item )
            {
                var k, kl, l, r, s, next = item.slice();
                
                if ( -1 === offset )
                {
                    //Find the largest index k such that a[k] > a[k + 1].
                    k = n-2;
                    while (k>=0 && next[k]<=next[k+1]) k--;
                    // If no such index exists, the permutation is the last permutation.
                    if ( k >=0 ) 
                    {
                        //Find the largest index kl greater than k such that a[k] > a[kl].
                        kl = n-1;
                        while (kl>k && next[k]<=next[kl]) kl--;
                        //Swap the value of a[k] with that of a[l].
                        s = next[k]; next[k] = next[kl]; next[kl] = s;
                        //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                        l = k+1; r = n-1;
                        while (l < r) {s = next[l]; next[l++] = next[r]; next[r--] = s;}
                    }
                    else
                    {
                        next = null;
                    }
                }
                else //if ( 1 === offset )
                {
                    //Find the largest index k such that a[k] < a[k + 1].
                    k = n-2;
                    while (k>=0 && next[k]>=next[k+1]) k--;
                    // If no such index exists, the permutation is the last permutation.
                    if ( k >=0 ) 
                    {
                        //Find the largest index kl greater than k such that a[k] < a[kl].
                        kl = n-1;
                        while (kl>k && next[k]>=next[kl]) kl--;
                        //Swap the value of a[k] with that of a[l].
                        s = next[k]; next[k] = next[kl]; next[kl] = s;
                        //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                        l = k+1; r = n-1;
                        while (l < r) {s = next[l]; next[l++] = next[r]; next[r--] = s;}
                    }
                    else
                    {
                        next = null;
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) { 
            var perm = new Array(n), i;
            for (i=0; i<n; i++) perm[i] = i;
            return shuffle( perm );
        }
        ,stochastic: function( P, n, C ) {
            if ( P.length !== n || P[0].length !== n )
            {
                throw new Error('Stochastic Matrix dimensions and Permutation dimensions do not match!');
                return;
            }
            var permutation = new Array(n), 
                used = new Array(n), zeros,
                i, j, dice, pi, ci, cumul, N = 0, rnd = Abacus.Util.rnd,
                singly_stochastic, doubly_stochastic = false;
            for (i=0; i<n; i++) used[i] = 0;
            // doubly-stochastic
            if ( C )
            {
                doubly_stochastic = true;
                // init counters
                if ( !C.length )
                {
                    C.N = 0;
                    zeros = new Array(n);
                    for (i=0; i<n; i++) zeros[i] = 0;
                    for (i=0; i<n; i++) C.push( zeros.slice() );
                }
                N = ++C.N;
            }
            singly_stochastic = !doubly_stochastic;
            i = 0;
            // while permutation places not filled
            while( i < n )
            {
                dice = rnd( );
                cumul = 0; pi = P[i];
                if ( doubly_stochastic ) ci = C[i];
                // select an item to fill the i-th place of permutation
                // according to stochastic matrix P
                for (j=0; j<n; j++)
                {
                    // item j selected
                    if ( cumul < dice && dice <= cumul+pi[j] )
                    {
                        // if not already used AND
                        // simulation matrix is singly stochastic OR
                        // j-item has not been used in i-place enough according to doubly-stochastic matrix
                        if ( (0 === used[j]) && 
                            ( singly_stochastic || (ci[j]+1 <= (N+1)*pi[j]) )
                        )
                        {
                            // then use j-item in i-place of permutation
                            used[j] = 1;
                            permutation[i] = j;
                            // increase counter of j-item used in i-place
                            if ( doubly_stochastic ) ci[j]++;
                            // next permutation place
                            i++;
                        }
                        // either item found so break
                        // or selected item not matches, so break for new dice simulation
                        break;
                    }
                    cumul += pi[j];
                }
            }
            return permutation;
        }
        ,inverse: function( perm, n ) {
            n = n || perm.length;
            var i, iperm = new Array(n);
            for (i=0; i<n; i++) iperm[perm[i]] = i;
            return iperm;
        }
        ,compose: function( /* permutations */ ) {
            var perms = arguments, nperms = perms.length, 
                composed = nperms ? perms[0] : [],
                n = composed.length, i, p, comp;
            for (p=1; p<nperms; p++)
            {
                comp = composed.slice( );
                for (i=0; i<n; i++) composed[ i ] = comp[ perms[ p ][ i ] ];
            }
            return composed;
        }
        ,permute: function( arr, perm, copied ) {
            var i, l = arr.length, p, a;
            if ( true === copied )
            {
                p = new Array(l);
                a = arr;
            }
            else
            {
                p = arr;
                a = arr.slice();
            }
            for (i=0; i<l; i++) p[i] = a[perm[i]];
            return p;
        }
        ,reassign: function( arr, perm ) {
            var i, l = arr.length, reassigned = new Array(l);
            for (i=0; i<l; i++) reassigned[i] = perm[arr[i]];
            return reassigned;
        }
        ,shuffle: shuffle
        ,toCycles: function( perm, n, strict ) {
            n = n || perm.length;
            var i, cycles = [], current, cycle, 
                min_cycle = true === strict ? 1 : 0,
                visited = new Array( n ),
                unvisited = new Array(n);
            for(i=0; i<n; i++) 
            {
                unvisited[ i ] = i;
                visited[ i ] = 0;
            }
            cycle = [current = unvisited.shift( )]; visited[ current ] = 1;
            while ( unvisited.length ) 
            {
                current = perm[ current ];
                if ( visited[current] )
                {
                    if ( cycle.length > min_cycle ) cycles.push( cycle );
                    cycle = [ ];
                    while ( unvisited.length && visited[current=unvisited.shift()] ) ;
                }
                if ( !visited[current] )
                {
                    cycle.push( current );
                    visited[ current ] = 1; 
                }
            }
            if ( cycle.length > min_cycle ) cycles.push( cycle );
            return cycles;
        }
        ,fromCycles: function( cycles, n ) {
            var perm = new Array(n), c, l = cycles.length, i, cl, cycle;
            for (i=0; i<n; i++) perm[ i ] = i;
            for (c=0; c<l; c++)
            {
                cycle = cycles[c]; cl = cycle.length;
                if ( cl < 2 ) continue;
                for (i=0; i<cl-1; i++) perm[cycle[i]] = cycle[i+1];
                perm[cycle[cl-1]] = cycle[0];
            }
            return perm;
        }
        ,toSwaps: function( perm, n ) {
            n = n || perm.length;
            var i, l, swaps = [], cycle,
                cycles = Permutation.toCycles( perm, n, true );
            for (i=0,l=cycles.length; i<l; i++)
            {
                cycle = cycles[i];
                swaps = swaps.concat( cycle2swaps( cycle ) );
            }
            return swaps;
        }
        ,fromSwaps: function( swaps, n ) {
            var i, l = swaps.length, perm = new Array(n), swap, temp;
            for (i=0; i<n; i++) perm[i] = i;
            for (i=0; i<l; i++)
            {
                swap = swaps[i];
                // swap
                temp = perm[swap[0]]; 
                perm[swap[0]] = perm[swap[1]];
                perm[swap[1]] = temp;
            }
            return perm;
        }
        ,toMatrix: function( perm, n, bycolumns ) {
            var mat = new Array(n), i, j;
            bycolumns = true === bycolumns;
            for (i=0; i<n; i++)
            {
                mat[i] = new Array(n);
                for (j=0; j<n; j++) mat[i][j] = 0;
            }
            for (i=0; i<n; i++)
            {
                if ( bycolumns ) mat[perm[i]][i] = 1;
                else mat[i][perm[i]] = 1;
            }
            return mat;
        }
        ,fromMatrix: function( mat, n, bycolumns ) {
            var perm = new Array(n), i, j;
            bycolumns = true === bycolumns;
            for (i=0; i<n; i++)
            {
                for (j=0; j<n; j++)
                {
                    if ( mat[i][j] ) 
                    {
                        if ( bycolumns ) perm[j] = i;
                        else perm[i] = j;
                    }
                }
            }
            return perm;
        }
        ,isConnected: function( perm, n ) {
            var m = -Infinity, i;
            n = n || perm.length;
            for (i=0; i<n-1; i++) // for all proper prefixes, do:
            {
                if ( perm[i] > m ) m = perm[i]; // update max.
                if ( m <= i ) return false; // prefix mapped to itself, P not connected.
            }
            return true; // P is connected.
        }
    }
});

// https://en.wikipedia.org/wiki/Combinations
Combination = Abacus.Combination = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k ) {
        var self = this;
        if ( !(self instanceof Combination) ) return new Combination(n, k);
        CombinatorialIterator.call(self, [n, k]);
    }
    
    ,__static__: {
         count: function( n ) {
             return binomial( n[0], n[1] );
         }
        ,dual: function( item, n ) {
            return reverse_complement( item, n[0] );
        }
        ,rank: function( item, n, total ) {
            var Arithmetic = Abacus.Arithmetic, index = 0, i, c, j, k, binom;
            k = n[1]; n = n[0];
            binom = total ? total : binomial(n, k);
            for (i=1; i<=k; i++)
            {
                // adjust the order to match MSB to LSB 
                // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                c = n-1-item[i-1]; j = k+1-i;
                if ( j <= c ) index = Arithmetic.add(index, binomial(c, j));
            }
            return Arithmetic.sub(Arithmetic.sub(binom,1),index);
        }
        ,unrank: function( index, n, total ) {
            var Arithmetic = Abacus.Arithmetic, klass = this, item, binom, k, m, t, p;
            total = total || binomial(n[0], n[1]);
            if ( Arithmetic.equ(0, index) )
            {
                item = klass.first( n );
            }
            else if ( Arithmetic.equ(total, Arithmetic.add(index,1)) )
            {
                item = klass.last( n );
            }
            else
            {
                k = n[1]; n = n[0];
                item = new Array(k); binom = total;
                // adjust the order to match MSB to LSB 
                index = Arithmetic.sub(Arithmetic.sub(binom,1),index);
                binom = Arithmetic.mul(Arithmetic.sub(n,k),Arithmetic.div(binom,n)); 
                t = n-k+1; m = k; p = n-1;
                do {
                    if ( Arithmetic.lte(binom, index) )
                    {
                        item[k-m] = n-t-m+1;
                        if ( Arithmetic.gt(binom, 0) )
                        {
                            index = Arithmetic.sub(index, binom); 
                            binom = Arithmetic.div(Arithmetic.mul(m,binom),p);
                        }
                        m--; p--;
                    }
                    else
                    {
                        binom = Arithmetic.div(Arithmetic.mul(Arithmetic.sub(p,m),binom),p); 
                        t--; p--;
                    }
                } while( m > 0 );
            }
            return item;
        }
        ,first: function( n ) {
            var i, k = n[1], comb = new Array(k);
            for (i=0; i<k; i++) comb[i] = i;
            return comb;
        }
        ,last: function( n ) {
            var i, k = n[1], comb = new Array(k);
            n = n[0];
            for (i=0; i<k; i++) comb[k-1-i] = n-1-i;
            return comb;
        }
        ,succ: function( offset, item, n ) {
            if ( item )
            {
                var k, i, index, limit, curr, next = item.slice();
                k = n[1]; n = n[0];
                
                if ( -1 === offset )
                {
                    // compute prev indexes
                    // find index to move
                    i = k-1;  index = -1;
                    while ( i > 0 )
                    {
                        if ( next[i]>next[i-1]+1 ) { index = i; break; }
                        i--;
                    }
                    if (-1 === index && 0 < next[0]) index = 0;
                    // adjust next indexes after the moved index
                    if ( -1 < index )
                    {
                        curr = n;
                        for (i=k-1; i>index; i--) next[i] = --curr;
                        next[index]--;
                    }
                    else 
                    { 
                        next = null; 
                    }
                }
                else //if ( 1 === offset )
                {
                    // compute next indexes
                    // find index to move
                    i = k-1;  index = -1; limit = n-k;
                    while ( 0 <= i )
                    {
                        if ( next[i] < limit+i ) { index = i; break; }
                        i--;
                    }
                    // adjust next indexes after the moved index
                    if ( -1 < index )
                    {
                        curr = next[index];
                        for (i=index; i<k; i++) next[i] = ++curr;
                    }
                    else 
                    { 
                        next = null; 
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) {
            var comb, k, g, i, j, p, q, n_k;
            // O(n), unbiased, only one call to RPNG, NO big integers
            k = n[1]; n = n[0]; comb = new Array(k);
            g = Abacus.Util.rnd( ); j = 0; q = 0; n_k = n-k;
            for (i=1; i<=k; i++)
            {
                j++; p = (k-i+1) / (n-j+1);
                while ((p <= g) && (j < n_k+i))
                {
                    q = p;
                    j++;
                    p = q + (1-q)*((k-i+1)/(n-j+1));
                }
                comb[i-1] = j-1;
                g = (g-q) / (p-q);
            }
            return comb;
        }
        ,stochastic: CombinatorialIterator.stochastic
        ,complement: complement
        ,choose: function( arr, comb ) {
            var i, l = comb.length, chosen = new Array(l);
            for (i=0; i<l; i++) chosen[i] = arr[comb[i]];
            return chosen;
        }
        ,pick: pick
        ,toMatrix: function( comb, n, bycolumns ) {
            var mat, k, i, j;
            k = n[1]; n = n[0];
            mat = new Array(n);
            bycolumns = true === bycolumns;
            for (i=0; i<n; i++)
            {
                mat[i] = new Array(n);
                for (j=0; j<n; j++) mat[i][j] = 0;
            }
            for (i=0; i<k; i++)
            {
                if ( bycolumns ) mat[comb[i]][i] = 1;
                else mat[i][comb[i]] = 1;
            }
            return mat;
        }
        ,fromMatrix: function( mat, n, bycolumns ) {
            var comb, k, i, j;
            k = n[1]; n = n[0];
            comb = new Array(k);
            bycolumns = true === bycolumns;
            for (i=0; i<n; i++)
            {
                for (j=0; j<n; j++)
                {
                    if ( mat[i][j] ) 
                    {
                        if ( bycolumns && j < k ) comb[j] = i;
                        else if ( !bycolumns && i < k ) comb[i] = j;
                    }
                }
            }
            return comb;
        }
    }
});
// aliases
Combination.conjugate = Combination.complement;

CombinationRepeat = Abacus.CombinationRepeat = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function CombinationRepeat( n, k ) {
        var self = this;
        if ( !(self instanceof CombinationRepeat) ) return new CombinationRepeat(n, k);
        CombinatorialIterator.call(self, [n, k]);
    }
    
    ,__static__: {
         // http://en.wikipedia.org/wiki/Combination#Number_of_combinations_with_repetition
         count: function( n ) {
             return binomial( n[0]+n[1]-1, n[1] );
         }
        ,dual: Combination.dual
        ,rank: function( item, n, total ) {
            var Arithmetic = Abacus.Arithmetic, index = 0, i, c, j, k, N, binom;
            k = n[1]; n = n[0]; N = n+k-1;
            binom = total ? total : binomial(N, k);
            for (i=1; i<=k; i++)
            {
                // adjust the order to match MSB to LSB 
                // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                c = N-1-item[i-1]-i+1; j = k+1-i;
                if ( j <= c ) index = Arithmetic.add(index, binomial(c, j));
            }
            return Arithmetic.sub(Arithmetic.sub(binom,1),index);
        }
        ,unrank: function( index, n, total ) {
            var Arithmetic = Abacus.Arithmetic, klass = this, item, binom, k, N, m, t, p;
            total = total || binomial(n[0]+n[1]-1,n[1]);
            
            if ( Arithmetic.equ(0, index) ) return klass.first( n );
            else if ( Arithmetic.equ(total, Arithmetic.add(index,1)) ) return klass.last( n );
            
            k = n[1]; n = n[0];
            N = n+k-1;
            item = new Array(k);
            binom = total;
            index = Arithmetic.sub(Arithmetic.sub(binom,1),index);
            binom = Arithmetic.mul(Arithmetic.sub(N,k),Arithmetic.div(binom,N)); 
            t = N-k+1; m = k; p = N-1;
            do {
                if ( Arithmetic.lte(binom, index) )
                {
                    item[k-m] = N-t-k+1;
                    if ( Arithmetic.gt(binom, 0) )
                    {
                        index = Arithmetic.sub(index,binom); 
                        binom = Arithmetic.div(Arithmetic.mul(binom,m),p);
                    }
                    m--; p--;
                }
                else
                {
                    binom = Arithmetic.div(Arithmetic.sub(p,m),p); 
                    t--; p--;
                }
            } while( m > 0 );
            return item;
        }
        ,first: function( n ) {
            var i, k = n[1], comb = new Array(k);
            for (i=0; i<k; i++) comb[i] = 0;
            return comb;
        }
        ,last: function( n ) {
            var i, k = n[1], comb = new Array(k);
            n = n[0]-1;
            for (i=0; i<k; i++) comb[i] = n;
            return comb;
        }
        ,succ: function( offset, item, n ) {
            if ( item )
            {
                var k, i, index, limit, curr, next = item.slice();
                k = n[1]; n = n[0];
                
                if ( -1 === offset )
                {
                    // compute prev indexes
                    // find index to move
                    i = k-1;  index = -1;
                    while (0 < i)
                    {
                        if ( next[i] > next[i-1] ) { index=i; break; }
                        i--;
                    }
                    if (-1 === index && 0 < next[0]) index = 0;
                    // adjust next indexes after the moved index
                    if (-1 < index)
                    {
                        curr = n-1;
                        for (i=index+1; i<k; i++) next[i] = curr;
                        next[index]--;
                    }
                    else 
                    { 
                        next = null; 
                    }
                }
                else //if ( 1 === offset )
                {
                    // compute next indexes
                    // find index to move
                    i = k-1;  index = -1;
                    while (0 <= i)
                    {
                        if ( next[i] < n-1 ) {  index=i; break; }
                        i--;
                    }
                    // adjust next indexes after the moved index
                    if (-1 < index)
                    {
                        curr = next[index]+1;
                        for (i=index; i<k; i++) next[i] = curr;
                    }
                    else 
                    { 
                        next = null; 
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) {
            var comb, k, g, i, j, p, q, N, N_k;
            // O(n+k), unbiased, only one call to RPNG, NO big integers
            k = n[1]; n = n[0]; comb = new Array(k);
            g = Abacus.Util.rnd( ); j = 0; q = 0; N = n+k-1; N_k = N-k;
            for(i=1; i<=k; i++)
            {
                j++; p = (k-i+1) / (N-j+1);
                while ((p <= g) && (j < N_k+i))
                {
                    q = p;
                    j++;
                    p = q + (1-q)*((k-i+1)/(N-j+1));
                }
                comb[i-1] = j-i;
                g = (g-q)/(p-q);
            }
            return comb;
        }
        ,stochastic: Combination.stochastic
    }
});

// https://en.wikipedia.org/wiki/Partitions
Partition = Abacus.Partition = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Partition( n ) {
        var self = this;
        if ( !(self instanceof Partition) ) return new Partition(n);
        CombinatorialIterator.call(self, n);
    }
    
    ,__static__: {
         count: function( n ) {
             var add = Abacus.Arithmetic.add, p = n > 1 ? 2 : 1, k, m;
             for (k=2; k<n; k++) 
                 for (m=n-k+1; m>=1; m--)
                    p = add(p,partitions(n, k, m));
             return p;
         }
        ,dual: function( item, n ) {
            var compl = [], i, l = item.length, k;
            for (i=0; i<l; i++)
            {
                k = n-item[i];
                if ( 0 >= k ) continue;
                if ( n === k ) return [n];
                compl.unshift(k);
            }
            return compl;
        }
        ,rank: function( item, n, total, s, e ) {
            var Arithmetic = Abacus.Arithmetic, klass = this, index, i, l = item.length, k, nk = n;
            total = total || klass.count( n );
            s = s || 0; e = e || l; i = s; k = item[i];
            if ( nk === k ) index = Arithmetic.sub(total,1);
            else if ( 1 === k ) index = 0;
            else if ( i+1 < l ) index = Arithmetic.add(1, klass.rank(item, n-k, Arithmetic.sub(total,klass.count( n-k )), i+1));
            else index = 0;
            return index;
        }
        ,unrank: function( index, n, total ) {
            /*var klass = this, item = [], i, k, nk = n;
            total = total || klass.count( n );
            while ( 0 <= index )
            {
                if ( 0 === index ) for (i=0; i<nk; i++) item.push(1);
                else if ( total === index+1 ) item.push(nk);
                else index++;
                nk -= k; total -= index;
            }
            return item;*/
        }
        ,first: function( n ) {
            var i, item = new Array(n); 
            for (i=0; i<n; i++) item[i] = 1;
            return item;
        }
        ,last: function( n ) {
            return [ n ]; 
        }
        ,succ: function( offset, item, n ) {
            if ( item )
            {
                var i, c, p1, p2, summa, rem, 
                    next = item.slice();
                
                if ( -1 === offset )
                {
                    // compute prev partition
                    if ( next[0] > 1 )
                    {
                        c = next.length;
                        // break into a partition with last part reduced by 1 from previous partition series
                        i = c-1;
                        while (i>=0 && 1 === next[i]) i--;
                        p1 = next[i]-1;
                        next = next.slice(0, i+1);
                        next[ i ] = p1;
                        summa = sum( next );
                        rem = n-summa;
                        while ( rem > 0 )
                        {
                            p2 = rem;
                            if ( p2 > p1 ) 
                            { 
                                p2 = p1;  
                                next.push(p2); 
                            }
                            else 
                            { 
                                next.push(rem); 
                            }
                            rem -= p2;
                        }
                    }
                    // if partition is all ones (so first element is also one) it is the final partition
                    else 
                    { 
                        next = null; 
                    }
                }
                else //if ( 1 === offset )
                {
                    // compute next partition
                    if ( next[0] < n )
                    {
                        c = next.length;
                        i = c-1; if (i>0) i--;
                        while (i>0 && next[i] === next[i-1]) i--;
                        next[i]++;
                        next = next.slice( 0, i+1 );
                        summa = sum( next );
                        rem = n-summa;
                        while ( rem > 0 )
                        {
                            next.push(1);
                            rem--;
                        }
                    }
                    // if partition is the number itself it is the final partition
                    else 
                    { 
                        next = null; 
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) {  }
        ,stochastic: CombinatorialIterator.stochastic
        ,conjugate: function( partition ) {
            // http://mathworld.wolfram.com/ConjugatePartition.html
            var l = partition.length, 
                n = partition[0], i, j, p,
                conjugate = new Array(n);
            for (i=0; i<n; i++) conjugate[ i ] = 1;
            for (j=1; j<l; j++)
            {
                i = 0; p = partition[j];
                while ( i < n && p > 0 )
                {
                    conjugate[i++]++;
                    p--;
                }
            }
            return conjugate;
        }
        ,pack: function( partition ) {
            var packed = [], i, l = partition.length, 
                last = partition[0], part = [last, 1];
            for (i=1; i<l; i++)
            {
                if ( last === partition[i] ) part[1]++;
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
        ,unpack: function( packed ) {
            var partition = [], i, j, k, v, l = packed.length, cmp;
            for (i=0; i<l; i++)
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
    }
});
// aliases
Partition.transpose = Partition.conjugate;

// http://en.wikipedia.org/wiki/Power_set
Powerset = Abacus.Powerset = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Powerset( n ) {
        var self = this;
        if ( !(self instanceof Powerset) ) return new Powerset(n);
        CombinatorialIterator.call(self, n);
    }
    
    ,__static__: {
         count: function( n ) {
             return pow2( n );
         }
        ,dual: CombinatorialIterator.dual
        ,rank: function( subset ) { 
            var Arithmetic = Abacus.Arithmetic, index = 0, i = 0, l = subset.length;
            while ( i < l ) index = Arithmetic.add(index, Arithmetic.shl(1, subset[i++]));
            return index;
        }
        ,unrank: function( index ) { 
            var Arithmetic = Abacus.Arithmetic, subset = [], i = 0;
            while ( Arithmetic.gt(index, 0) )
            {
                // loop unrolling
                if ( Arithmetic.gt(Arithmetic.band(index,1),0) ) subset.unshift( i );
                if ( Arithmetic.gt(Arithmetic.band(index,2),0) ) subset.unshift( i+1 );
                if ( Arithmetic.gt(Arithmetic.band(index,4),0) ) subset.unshift( i+2 );
                if ( Arithmetic.gt(Arithmetic.band(index,8),0) ) subset.unshift( i+3 );
                if ( Arithmetic.gt(Arithmetic.band(index,16),0) ) subset.unshift( i+4 );
                if ( Arithmetic.gt(Arithmetic.band(index,32),0) ) subset.unshift( i+5 );
                if ( Arithmetic.gt(Arithmetic.band(index,64),0) ) subset.unshift( i+6 );
                if ( Arithmetic.gt(Arithmetic.band(index,128),0) ) subset.unshift( i+7 );
                i+=8; index = Arithmetic.shr(index, 8);
            }
            return subset;
        }
        ,first: function( n ) {
            return [];
        }
        ,last: function( n ) {
            var i, item = new Array( n ); 
            for (i=0; i<n; i++) item[ i ] = n-1-i;
            return item;
        }
        ,succ: function( offset, item, n ) {
            var klass = this, Arithmetic = Abacus.Arithmetic;
            if ( 1 !== offset && -1 !== offset ) offset = 1;
            return -1 === offset
            ? (0===item.length
            ? null : klass.unrank( Arithmetic.add(klass.rank( item ),offset) ))
            : (n===item.length
            ? null : klass.unrank( Arithmetic.add(klass.rank( item ),offset) ))
            ;
        }
        ,rand: CombinatorialIterator.rand
        ,stochastic: CombinatorialIterator.stochastic
    }
});

// 
// https://en.wikipedia.org/wiki/Outer_product
// https://en.wikipedia.org/wiki/Kronecker_product
// https://en.wikipedia.org/wiki/Tensor_product
// see also: http://www.inf.ethz.ch/personal/markusp/papers/perm.ps
Tensor = Abacus.Tensor = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Tensor( /*dims here ..*/ ) {
        var self = this;
        if ( !(self instanceof Tensor) ) 
        {
            self = new Tensor( );
            if ( arguments.length )
            {
                CombinatorialIterator.call(self, slice.call(arguments));
            }
            else
            {
                self.n = [];
                self._count = 0;
            }
            return self;
        }
        if ( arguments.length )
        {
            CombinatorialIterator.call(self, slice.call(arguments));
        }
        else
        {
            self.n = [];
            self._count = 0;
        }
    }
    
    ,__static__: {
         count: function( n ) {
             return !n || !n.length ? 0 : prod( n );
        }
        ,dual: CombinatorialIterator.dual
        ,rank: function( tensor, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, d = n, nd = d.length, i;
            if ( !nd ) return -1;
            for (index=0,i=0; i<nd; i++) index = Arithmetic.add(Arithmetic.mul(index,d[ i ]), tensor[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, l, i, t, tensor,
                d = n, nd = d.length;
            if ( !nd ) return [ ];
            tensor = new Array( nd );
            for (r=index,i=nd-1; i>=0; i--)
            {
                l = d[ i ];
                t = Arithmetic.mod(r, l);
                r = Arithmetic.div(r, l);
                tensor[ i ] = Arithmetic.val(t);
            }
            return tensor;
        }
        ,first: function( n ) {
            var i, nd = n.length, tensor = new Array( nd );
            for (i=0; i<nd; i++) tensor[ i ] = 0;
            return tensor;
        }
        ,last: function( n ) {
            var i, d = n, nd = d.length, tensor = new Array( nd );
            for (i=0; i<nd; i++) tensor[ i ] = d[ i ]-1;
            return tensor;
        }
        ,succ: function( offset, item, n ) {
            if ( item )
            {
                var i, j, next = item.slice(), d = n, nd = d.length;
                
                if ( -1 === offset )
                {
                    i = nd-1;
                    while ( i >=0 && next[i]-1 < 0 ) i--;
                    if ( 0 <= i )
                    {
                        next[i]--;
                        for (j=i+1; j<nd; j++) next[j] = d[j]-1;
                    }
                    else
                    {
                        // last item
                        next = null;
                    }
                }
                else //if ( 1 === offset )
                {
                    i = nd-1;
                    while ( i >=0 && next[i]+1 === d[i] ) i--;
                    if ( 0 <= i )
                    {
                        next[i]++;
                        for (j=i+1; j<nd; j++) next[j] = 0;
                    }
                    else
                    {
                        // last item
                        next = null;
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) {
            var rnd = Abacus.Arithmetic.rnd, i, d = n, nd = d.length, tensor = new Array(nd);
            for (i=0; i<nd; i++) tensor[ i ] = rnd(0, d[ i ]-1);
            return tensor;
        }
        /*,rand: function( n ) {
            var tensor, k, g, i, j, p, q;
            // O(n), unbiased, only one call to RPNG, NO big integers
            k = n.length; tensor = new Array(k);
            g = Abacus.Util.rnd( ); j = 0; q = 0;
            for (i=1; i<=k; i++)
            {
                j++; p = (k-i+1) / (n-j+1);
                while ((p <= g) && (j < n[i-1]))
                {
                    q = p;
                    j++;
                    p = q + (1-q)*((k-i+1)/(n-j+1));
                }
                tensor[i-1] = j-1;
                g = (g-q) / (p-q);
            }
            return tensor;
        }*/
        ,stochastic: CombinatorialIterator.stochastic
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

Tuple = Abacus.Tuple = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    // can also represent binary k-string as k-tuple of n=2 (binary) values
    constructor: function Tuple( k, n ) {
        var self = this;
        if ( !(self instanceof Tuple) ) return new Tuple(k,n);
        CombinatorialIterator.call(self, [k||1,n||2]);
    }
    
    ,__static__: {
         count: function( n ) {
             return powNK( n[1], n[0] );
        }
        ,dual: function( item, n ) {
            return reverse_complement( item, n[1] );
        }
        ,rank: function( tuple, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, k = n[0], i;
            n = n[1];
            for (index=0,i=0; i<k; i++) index = Arithmetic.add(Arithmetic.mul(index,n), tuple[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, l, i, t, tuple, k = n[0];
            n = n[1]; tuple = new Array( k );
            for (r=index,i=k-1; i>=0; i--)
            {
                l = n;
                t = Arithmetic.mod(r, l);
                r = Arithmetic.div(r, l);
                tuple[ i ] = Arithmetic.val(t);
            }
            return tuple;
        }
        ,first: function( n ) {
            var i, k = n[0], tuple = new Array( k );
            for (i=0; i<k; i++) tuple[ i ] = 0;
            return tuple;
        }
        ,last: function( n ) {
            var i, k = n[0], tuple = new Array( k );
            n = n[1]-1;
            for (i=0; i<k; i++) tuple[ i ] = n;
            return tuple;
        }
        ,succ: function( offset, item, n ) {
            if ( item )
            {
                var i, j, next = item.slice(), k = n[0], n = n[1];
                
                if ( -1 === offset )
                {
                    i = k-1;
                    while ( i >=0 && next[i]-1 < 0 ) i--;
                    if ( 0 <= i )
                    {
                        next[i]--;
                        for (j=i+1; j<k; j++) next[j] = n-1;
                    }
                    else
                    {
                        // last item
                        next = null;
                    }
                }
                else //if ( 1 === offset )
                {
                    i = k-1;
                    while ( i >=0 && next[i]+1 === n ) i--;
                    if ( 0 <= i )
                    {
                        next[i]++;
                        for (j=i+1; j<k; j++) next[j] = 0;
                    }
                    else
                    {
                        // last item
                        next = null;
                    }
                }
                return next;
            }
            return null;
        }
        ,rand: function( n ) {
            var rnd = Abacus.Arithmetic.rnd, i, k = n[0], tuple = new Array(k);
            n = n[1]-1;
            for (i=0; i<k; i++) tuple[ i ] = rnd(0, n);
            return tuple;
        }
        /*,rand: function( n ) {
            var tuple, k, g, i, j, p, q;
            // O(n), unbiased, only one call to RPNG, NO big integers
            k = n[0]; n = n[1]; tuple = new Array(k);
            g = Abacus.Util.rnd( ); j = 0; q = 0;
            for (i=1; i<=k; i++)
            {
                j++; p = (k-i+1) / (n-j+1);
                while ((p <= g) && (j < n))
                {
                    q = p;
                    j++;
                    p = q + (1-q)*((k-i+1)/(n-j+1));
                }
                tuple[i-1] = j-1;
                g = (g-q) / (p-q);
            }
            return tuple;
        }*/
        ,stochastic: Tensor.stochastic
    }
});

// export it
return Abacus;
});
