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
    ,NotImplemented = function( ) { throw new Error("Method not implemented!"); }
    ,slice = Array.prototype.slice, toString = Object[PROTO].toString
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
    ,operation = function operation( F, F0, i0, i1 ) {
        if ( i0 > i1 ) return F0;
        var i, k, l=i1-i0+1, r=l&15, q=r&1, Fv=q?F(F0,i0):F0;
        for (i=q; i<r; i+=2)  { k = i0+i; Fv = F(F(Fv,k),k+1); }
        for (i=r; i<l; i+=16) { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,k),k+1),k+2),k+3),k+4),k+5),k+6),k+7),k+8),k+9),k+10),k+11),k+12),k+13),k+14),k+15); }
        return Fv;
    }
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
    ,cartesian = function cartesian( /* var args here */ ) {
        var k, a, vector, vv, j,
            v = arguments, nv = v.length,
            kl, product;
        
        if ( !nv ) return [];
        kl = v[0].length;
        for (k=1; k<nv; k++) if ( kl < v[ k ].length ) kl = v[ k ].length;
        product = new Array( kl );
        
        for (k=0; k<kl; k++)
        {
            vector = [ ];
            for (a=nv-1; a>=0; a--)
            {
                vv = v[ a ].length < k ? null : v[ a ][ k ];
                if ( vv instanceof Array )
                {
                    // cartesian can be re-used to create higher-order products
                    // i.e cartesian(alpha, beta, gamma) and cartesian(cartesian(alpha, beta), gamma)
                    // should produce exactly same results
                    for (j=vv.length-1; j>=0; j--)
                        vector.unshift( vv[ j ] );
                }
                else
                {
                    vector.unshift( vv );
                }
            }
            product[ k ] = vector;
        }
        return product;
    }
    ,intersect = function intersect_sorted2( a, b, reverse ) {
        reverse = -1 === reverse ? 1 : 0;
        var ai = 0, bi = 0, al = a.length, bl = b.length,
        intersection = new Array(Abacus.Math.min(al,bl)), il = 0;
        // assume a, b lists are sorted ascending/descending depending on reverse flag
        while( (ai < al) && (bi < bl) )
        {
            if      ( a[ai] < b[bi] )
            { 
                if ( reverse ) bi++; else ai++; 
            }
            else if ( a[ai] > b[bi] )
            { 
                if ( reverse ) ai++; else bi++; 
            }
            else // they're equal
            {
                intersection[il++] = a[ ai ];
                ai++; bi++;
            }
        }
        // truncate if needed
        if ( il < intersection.length ) intersection.length = il;
        return intersection;
    }
    ,merge = function merge_sorted2( a, b, reverse, unique ) {
        reverse = -1 === reverse ? 1 : 0; unique = false !== unique;
        var ai = 0, bi = 0, al = a.length, bl = b.length,
        union = new Array(al+bl), ul = 0, last, with_duplicates = !unique;
        // assume a, b lists are sorted ascending, even with duplicate values
        while( ai < al && bi < bl )
        {
            if      (unique && ul) // handle any possible duplicates inside SAME list
            {
                if ( a[ai] === last )
                {
                    ai++;
                    continue;
                }
                else if ( b[bi] === last )
                {
                    bi++;
                    continue;
                }
            }
            if      ( a[ai] < b[bi] )
            { 
                union[ul++] = last = reverse?b[bi++]:a[ai++]; 
            }
            else if ( a[ai] > b[bi] )
            { 
                union[ul++] = last = reverse?a[ai++]:b[bi++]; 
            }
            else // they're equal, push one unique
            {
                union[ul++] = last = a[ ai ];
                if ( with_duplicates ) union[ul++] = b[ bi ];
                ai++; bi++;
            }
        }
        while ( ai < al ) if ( with_duplicates || (a[ai] !== last) ) union[ul++] = last = a[ai++]; 
        while ( bi < bl ) if ( with_duplicates || (b[bi] !== last) ) union[ul++] = last = b[bi++]; 
        // truncate if needed
        if ( ul < union.length ) union.length = ul;
        return union;
    }
    ,insert_sort = function insert_sorted2( a, v, k, reverse ) {
        reverse = -1 === reverse ? 1 : 0;
        // assume list a is ALREADY SORTED ASC/DESC, depending on reverse flag
        if ( null == k ) k = v;
        var l = a.length, s, m, e;
        if ( 0 === l )
        {
            a.push( v );
        }
        else if ( k < a[reverse ? l-1 : 0] )
        {
            if ( reverse ) a.push( v ); else a.unshift( v );
        }
        else if ( k >= a[reverse ? 0 : l-1] )
        {
            if ( reverse ) a.unshift( v ); else a.push( v );
        }
        else
        {
            // insert sorted using binary search
            // O(logN) worst-case time
            s = 0; e = l-1;
            if ( reverse )
            {
                while ( e > s )
                {
                    m = s + ((e-s+1)>>>1);
                    if ( k < a[ m ] ) s = m;
                    else e = m-1;
                }
            }
            else
            {
                while ( e > s )
                {
                    m = s + ((e-s+1)>>>1);
                    if ( k < a[ m ] ) e = m-1;
                    else s = m;
                }
            }
            if ( k < a[ s ] ) a.splice(reverse ? s+1 : s, 0, v);
            else  a.splice(reverse ? s : s+1, 0, v);
        }
        return a;
    }
    ,shuffle = function shuffle( a, cyclic, copied ) {
        // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
        var rndInt = Abacus.Math.rndInt,
            N, perm, swap, ac, offset;
        ac = true === copied ? a.slice() : a;
        offset = true === cyclic ? 1 : 0;
        N = ac.length;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = ac[ N ]; 
            ac[ N ] = ac[ perm ]; 
            ac[ perm ] = swap; 
        }
        // in-place or copy
        return ac;
    }
    ,compl = function compl( exc, N ) {
        var inc = [], i=0, j=0, n = excl.length;
        while (i < N)
        {
            if (j>=n || i<excl[j]) inc.push( i );
            else j++;
            i++;
        }
        return inc;
    }
    ,xshuffle = function xshuffle( a, o, copied ) {
        var i, j, N, perm, swap, inc, ac, offset, rndInt = Abacus.Math.rndInt;
        ac = true === copied ? a.slice() : a;
        o = o || {};
        offset = true === o.cyclic ? 1 : 0;
        if ( o[HAS]('included') && o.included.length )
        {
            inc = o.included;
        }
        else if ( o[HAS]('excluded') && o.excluded.length )
        {
            inc = compl( o.excluded, a.length );
        }
        else
        {
            inc = [];
        }
        N = inc.length;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = ac[ inc[N] ]; 
            ac[ inc[N] ] = ac[ inc[perm] ]; 
            ac[ inc[perm] ] = swap; 
        }
        // in-place or copy
        return ac;
    }
    ,multiset_shuffle = function multiset_shuffle( multiset, N ) {
        var i, j, l, k, pos, ac, p, pl, t, ms, rndInt = Abacus.Math.rndInt;
        ac = new Array(N);
        pl = 0; pos = new Array(N);
        for(i=0; i<n; i++) pos[i] = i;
        for(i=0,l=multiset.length; i<l; i++)
        {
            ms = multiset[i];
            for(j=0,k=ms.length; j<k; j++)
            {
                ac[ pos[ p = rndInt(0, N-1-pl) ] ] = ms[ j ];
                if ( p !== N-1-pl )
                {
                    // place this already selected position last and decrease queue size (pos already picked)
                    t = pos[N-1-pl];
                    pos[N-1-pl] = pos[p];
                    pos[p] = t;
                }
                pl++;
            }
        }
        return ac;
    }
    ,pick = function pick( a, k, repeated, sorted, non_destructive ) {
        // http://stackoverflow.com/a/32035986/3591273
        var rndInt = Abacus.Math.rndInt,
            picked, backup, i, selected, value, n = a.length;
        k = Abacus.Math.min( k, n );
        sorted = true === sorted;
        
        if ( true === repeated )
        {
            n = n-1;
            if ( sorted )
            {
                picked = [];
                for (i=0; i<k; i++) // O(klogk) times, worst-case
                    insert_sort( picked, a[ rndInt( 0, n ) ] );
            }
            else
            {
                picked = new Array( k );
                for (i=0; i<k; i++) // O(k) times
                    picked[ i ] = a[ rndInt( 0, n ) ];
            }
            return picked;
        }
        
        non_destructive = false !== non_destructive;
        if ( non_destructive ) backup = new Array( k );
        
        // partially shuffle the array, and generate unbiased selection simultaneously
        // this is a variation on fisher-yates-knuth shuffle
        if ( sorted )
        {
            picked = [];
            for (i=0; i<k; i++) // O(klogk) times, worst-case
            { 
                selected = rndInt( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
                value = a[ selected ];
                a[ selected ] = a[ n ];
                a[ n ] = value;
                insert_sort( picked, value );
                non_destructive && (backup[ i ] = selected);
            }
        }
        else
        {
            picked = new Array( k );
            for (i=0; i<k; i++) // O(k) times
            { 
                selected = rndInt( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
                value = a[ selected ];
                a[ selected ] = a[ n ];
                a[ n ] = value;
                picked[ i ] = value;
                non_destructive && (backup[ i ] = selected);
            }
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
    ,gray_encode = function gray_encode( a, n ) {
        if ( null == a ) return null;
        if ( a instanceof Array )
        {
            // https://en.wikipedia.org/wiki/Gray_code#n-ary_Gray_code
            var i, k = a.length, g = new Array(k), shft = 0;
            if ( n instanceof Array )
            {
                for(i=k-1; i>=0; i--)
                {
                    g[i] = n[i] > 0 ? (a[i] + shft) % n[i] : 0;
                    shft = shft + n[i] - g[i];
                }
            }
            else
            {
                for(i=k-1; i>=0; i--)
                {
                    // The gray digit gets shifted down by the sum of the higher
                    // digits.
                    g[i] = (a[i] + shft) % n;
                    shft = shft + n - g[i];	// Subtract from base so shift is positive
                }
            }
            return g;
        }
        else
        {
            // works correctly ONLY if range of interest is the full 2^n
            a = Abacus.Arithmetic.N( a );
            return Abacus.Arithmetic.xor( a, Abacus.Arithmetic.shr(a, Abacus.Arithmetic.I) );
        }
    }
    ,gray_decode = function gray_decode( n ) {
        // works correctly ONLY if range of interest is the full 2^n
        var Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I,
            mask = Abacus.Arithmetic.shr(n=Arithmetic.N( n ), I);
        while ( !Arithmetic.equ(mask, O) )
        {
            n = Arithmetic.xor( n, mask );
            mask = Arithmetic.shr( mask, I );
        }
        return n;
    }
    ,copy = function copy( a ) {
        return null == a ? null : a.slice( );
    }
    // C process / symmetry
    ,conjugation = function conjugation( a, n ) {
        if ( null == a ) return null;
        if ( !a.length ) return [];
        var i, k = a.length, b = new Array(k);
        if ( n instanceof Array ) for (i=0; i<k; i++) b[i] = n[i]-1-a[i];
        else for (n=n-1,i=0; i<k; i++) b[i] = n-a[i];
        return b;
    }
    // P process / symmetry
    ,parity = function parity( a ) {
        if ( null == a ) return null;
        var i, l = a.length-1, b = new Array(l+1);
        for(i=0; i<=l; i++) b[i] = a[l-i];
        return b;
    }
    // T process / symmetry
    ,inversion = function inversion( n, n0 ) {
        if ( null == n0 ) n0 = 0;
        if ( n instanceof Array )
        {
            var i, l = n.length, invn = new Array(l);
            for(i=0; i<l; i++) invn[i] = n0 - n[i];
            return invn;
        }
        else
        {
            return ("number" === typeof n) && ("number" === typeof n0)
                ? (n0 - n)
                : Abacus.Arithmetic.sub( Abacus.Arithmetic.N( n0 ), n )
            ;
        }
    }
    ,complement = function complement( a, n ) {
        if ( null == a ) return null;
        var b, i, ai, bi, k = a.length, l = n-k;
        if ( (n <= 0) || (l <= 0) ) return [];
        b = new Array( l ); i=0; ai=0; bi=0;
        while( bi < l )
        {
            if ( (ai >= k) || (i < a[ai]) )
            {
                b[bi++] = i;
            }
            else
            {
                ai++;
            }
            i++;
        }
        return b;
    }
    ,conjugate_partition = function conjugate_partition( a ) {
        if ( null == a ) return null;
        // http://mathworld.wolfram.com/ConjugatePartition.html
        var l = a.length, n = a[0], i, j, p, b = new Array(n);
        for (i=0; i<n; i++) b[ i ] = 1;
        for (j=1; j<l; j++)
        {
            i = 0; p = a[j];
            while ( i < n && p > 0 )
            {
                b[i++]++;
                p--;
            }
        }
        return b;
    }
    ,partition2sets = function partition2sets( partition ) {
        var set, subset, i, k, l = partition.length, n, item;
        set = new Array( l );
        for (item=0,k=0; k<l; k++)
        {
            subset = new Array( n = partition[k] );
            for (i=0; i<n; i++) subset[ i ] = item++;
            set[ k ] = subset;
        }
        return set;
    }
    ,sets2partition = function sets2partition( set_partition ) {
        var partition, k, l = set_partition.length;
        partition = new Array( l );
        for (k=0; k<l; k++)
            partition[ k ] = set_partition[k].length;
        return partition;
    }
    ,cycle2swaps = function cycle2swaps( cycle ) {
        var swaps = [], c = cycle.length, j;
        if ( c > 1 ) for (j=c-1; j>=1; j--) swaps.push([cycle[0],cycle[j]])
        return swaps;
    }
    ,sum = function sum( a ) {
        return operate(a, Abacus.Arithmetic.add, Abacus.Arithmetic.O);
    }
    ,product = function product( a ) {
        return operate(a, Abacus.Arithmetic.mul, Abacus.Arithmetic.I);
    }
    ,pow2 = function pow2( n ) {
        var Arithmetic = Abacus.Arithmetic;
        return Arithmetic.shl(Arithmetic.I, Arithmetic.N( n ));//(1 << n)>>>0;
    }
    ,exp = function exp( n, k ) {
        var Arithmetic = Abacus.Arithmetic;
        return Arithmetic.pow(Arithmetic.N( n ), Arithmetic.N( k ));
    }
    ,factorial = function factorial( n ) {
        // http://www.luschny.de/math/factorial/index.html
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;
        n = Arithmetic.N( n );
        if ( Arithmetic.lt( n, 0 ) ) return O;
        else if ( Arithmetic.lt( n, 2 ) ) return I;
        // 2=>2 or 3=>6
        else if ( Arithmetic.lt( n, 4 ) ) return Arithmetic.shl( n, Arithmetic.sub( n, 2 ) )/*n<<(n-2)*/;
        return operation(Arithmetic.mul, I, 2, n);
    }
    ,binomial = function binomial( n, k ) {
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;
        if ( k > n-k  ) k = n-k; // take advantage of symmetry
        if ( 0 > k || 1 > n ) return O;
        else if ( 0 === k || 1 === n ) return I;
        else if ( 1 === k ) return n;
        var mul = Arithmetic.mul, n_k = n-k, Cnk = Arithmetic.N( 1+n_k ), i;
        //for (i=2; i<=k; i++) Cnk *= 1 + n_k/i;
        for (i=2; i<=k; i++) Cnk = mul(Cnk, 1+n_k/i);
        return Arithmetic.round( Cnk );
    }
    ,multinomial = function multinomial( args/*var args here*/ ) {
        var Arithmetic = Abacus.Arithmetic, factorial = Abacus.Math.Factorial,
            m = args instanceof Array ? args : arguments,
            N = factorial( m[0] ), l = m.length, k, Nk = Arithmetic.I,
            mul = Arithmetic.mul, div = Arithmetic.div;
        for(k=1; k<l; k++) Nk = mul( Nk, factorial( m[k] ) );
        return div( N, Nk );
    }
    ,partitions_tbl = {}
    ,partitions = function partitions( n, k, m ) {
        // recursively compute the partition count using the recursive relation:
        // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
        // http://www.programminglogic.com/integer-partition-algorithm/
        // compute number of integer partitions of n
        // into exactly k parts having m as max value
        // m + k-1 <= n <= k*m
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;
        if ( (m === n && 1 === k) || (k === n && 1 === m) ) return I;
        if ( m+k>n+1 || k*m<n ) return O;
        // compute it directly
        var math = Abacus.Math,
            add = Arithmetic.add, j,
            jmax = math.min(m,n-m-k+2),
            jmin = math.max(1,math.ceil((n-m)/(k-1))),
            p = O, tk;
        for (j=jmin; j<=jmax; j++)
        {
            tk = (n-m)+','+(k-1)+','+j;
            // memoize here
            if ( null == partitions_tbl[tk] ) partitions_tbl[tk] = partitions( n-m, k-1, j );
            p = add(p, partitions_tbl[tk]);
        }
        return p;
    }
    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32, STOCHASTIC = 64
    ,LEXICAL = LEX | COLEX | MINIMAL, RANDOMISED = RANDOM | STOCHASTIC
    ,ORDERINGS = LEXICAL | RANDOMISED | REVERSED | REFLECTED
    ,ORDER = function ORDER( o ) {
        if ( !arguments.length || null == o )
        {
            return LEX; // default
        }
        if ( 'string' === typeof o )
        {
            var order = 0, ord = o.toUpperCase( ).split(',');
            for(var i=0,l=ord.length; i<l; i++)
            {
                o = ord[i];
                order |= Abacus.ORDER[HAS](o) ? Abacus.ORDER[o] : 0;
            }
            return order > 0 ? order : LEX;
        }
        return ORDERINGS & o ? o : LEX;
    }
    ,CombinatorialIterator
    ,Permutation//, Derangement//, MultisetPermutation
    ,Combination//, CombinationRepeat
    ,Partition//, RestrictedPartition//, SetPartition
    ,Subset
    ,Tensor, Tuple
;

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
,GRAY: MINIMAL
,MINIMAL: MINIMAL
,RANDOM: RANDOM
,RANDOMISED: RANDOM
,STOCHASTIC: STOCHASTIC

};

// list/array utiltities
Abacus.List = {

 operate: operate
,map: map
,operation: operation

,sum: sum
,product: product

,kronecker: kronecker
,cartesian: cartesian

,intersection: intersect
,union: merge
,insertion: insert_sort

,shuffle: shuffle
,xshuffle: xshuffle
,multiset_shuffle: multiset_shuffle
,pick: pick

};

// math/rnd utilities
Abacus.Math = {

 O: 0
,I: 1

,N: function( a ) { return Abacus.Arithmetic.add(Abacus.Arithmetic.O, a); }
,V: function( a ){ return Abacus.Arithmetic.sub(Abacus.Arithmetic.O, a); }

,rnd: Math.random
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
,pow: Math.pow

,shl: function( a, b ){ return a << b; }
,shr: function( a, b ){ return a >> b; }
,bor: function( a, b ){ return a | b; }
,band: function( a, b ){ return a & b; }
,xor: function( a, b ){ return a ^ b; }

,abs: Math.abs
,min: Math.min
,max: Math.max
,floor: Math.floor
,ceil: Math.ceil
,round: Math.round

,num: function( a ) { return "number" === typeof a ? Abacus.Math.floor(a) : parseInt(a,10); }
,val: function( a ) { return Abacus.Math.floor(a.valueOf()); }

,Pow2: pow2
,Exp: exp
,Factorial: factorial
,Binomial: binomial
,Multinomial: multinomial
,Partitions: partitions

};

// support pluggable arithmetics, eg biginteger Arithmetic
Abacus.Arithmetic = {
    
 O: 0
,I: 1
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
    
    constructor: function CombinatorialIterator( n, order ) {
        var self = this, klass = self[CLASS];
        self.n = n || 0;
        self._count = klass.count( self.n );
        self.order( order ? order : LEX ); // default order is lexicographic ("lex")
    }
    
    ,__static__: {
         Iterable: function CombinatorialIterable( iter ) {
            if ( !(this instanceof CombinatorialIterable) ) return new CombinatorialIterable( iter );
            this.next = function( ) {
                return iter.hasNext( ) ? {value: iter.next( )/*, key: iter.index( )*/} : {done: true};
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
        ,G: function( item, n ) {
            return gray_encode( item, n );
        }
        
        ,count: NotImplemented
        ,rand: function( n, total ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                tot = null != total ? total : klass.count( n );
            return klass.unrank( Arithmetic.rnd(Arithmetic.O, Arithmetic.sub(tot,1)), n, tot );
        }
        ,stochastic: NotImplemented
        ,rank: NotImplemented
        ,unrank: NotImplemented
    }
    
    ,n: 0
    ,_order: 0
    ,_count: 0
    ,__index: null
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
        self.__index = null;
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
        ,self.__index
        ,self._index
        ,self.__item
        ,self._item
        ,self._prev
        ,self._next
        ,self.n
        ];
    }
    
    ,_restore: function( state ) {
        var self = this;
        if ( state )
        {
        self._order = state[0];
        self.__index = state[1];
        self._index = state[2];
        self.__item = state[3];
        self._item = state[4];
        self._prev = state[5];
        self._next = state[6];
        self.n = state[7];
        }
        return self;
    }
    
    ,total: function( ) {
        return this._count;
    }
    
    ,order: function( order, reverse, TM, doubly_stochastic ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            klass = self[CLASS], T = klass.T, r, tot, tot_1, n, dir;
        if ( !arguments.length ) return self._order;
        
        if ( ('object' === typeof reverse) && (arguments.length < 4) )
        {
            doubly_stochastic = TM;
            TM = reverse;
            reverse = false;
        }
        else
        {
            reverse = false === reverse;
        }
        
        order = ORDER( order );
        tot = self._count; n = self.n;
        tot_1 = Arithmetic.sub(tot, 1);
        dir = REVERSED & order ? T(1) : 1;
        dir = reverse ? T(dir) : dir;
        self._order = order;
        self.__index = self._index = O;
        self._item = self.__item = null;
        self._prev = false; self._next = false;
        
        if ( STOCHASTIC & order )
        {
            // lazy init
            if ( (null != self._stochastic) && !TM )
            {
                if ( null != self._stochastic[2] ) self._stochastic[2] = []; // reset
                self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
            }
            else if ( TM )
            {
                self._stochastic = [TM, doubly_stochastic ? 1 : 0, doubly_stochastic ? [] : null];
                self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
            }
            else
            {
                throw new Error('No Stochastic Transition Matrix given!');
            }
        }
        else if ( RANDOM & order )
        {
            if ( Arithmetic.gt(tot, 100000) )
            {
                // too big to keep in memeory
                if ( self._traversed )
                {
                    self._traversed.dispose( );
                    self._traversed = null;
                }
                r = self.randomIndex( );
            }
            else
            {
                // lazy init
                if ( !self._traversed ) self._traversed = new Abacus.BitArray( tot );
                else self._traversed.reset( );
                self._traversed.set( r=self.randomIndex( ) );
            }
            self.__item = klass.unrank( r, n, tot );
            if ( null != self.__item ) self.__index = r;
        }
        else if ( MINIMAL & order )
        {
            self.__item = self.item0( T(dir), order );
            if ( null != self.__item ) self.__index = -1 === dir ? O : T(O, tot_1);
        }
        else if ( COLEX & order )
        {
            self.__item = self.item0( T(dir), order );
            if ( null != self.__item ) self.__index = -1 === dir ? O : T(O, tot_1);
        }
        else /*if ( LEX & order )*/
        {
            self.__item = self.item0( dir, order );
            if ( null != self.__item ) self.__index = -1 === dir ? T(O, tot_1) : O;
        }
        self._item = null == self.__item ? null : self.dual( self.__item, STOCHASTIC & order ? null : self.__index, order );
        self._index = reverse && !(RANDOMISED & order) ? T(O, tot_1) : O;
        self._prev = (RANDOMISED & order) || !reverse ? false : null != self.__item;
        self._next = reverse && !(RANDOMISED & order) ? false : null != self.__item;
        return self;
    }
    
    ,index: function( index ) {
        if ( !arguments.length ) return this._index;
        
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            klass = self[CLASS], T = klass.T,
            n = self.n, tot = self._count, order = self._order, tot_1, dir = REVERSED & order ? T(1) : 1;
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( !Arithmetic.equ(index, self._index) && Arithmetic.inside(index, -1, tot) )
        {
            tot_1 = Arithmetic.sub(tot, 1);
            if ( MINIMAL & order )
            {
                self.__index = -1 === dir ? index : T(index, tot_1);
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? self.item0( T(dir), order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( self.__index, n, tot ));
                self._item = self.dual( self.__item, self.__index, order );
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
            else if ( COLEX & order )
            {
                self.__index = -1 === dir ? index : T(index, tot_1);
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? self.item0( T(dir), order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( self.__index, n, tot ));
                self._item = self.dual( self.__item, self.__index, order );
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
            else if ( !(RANDOMISED & order) )
            {
                self.__index = -1 === dir ? T(index, tot_1) : index;
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? self.item0( dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( T(dir), order )
                : klass.unrank( self.__index, n, tot ));
                self._item = self.dual( self.__item, self.__index, order );
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
        }
        return self;
    }
    
    ,item: function( index, order ) {
        if ( !arguments.length ) return this._item;
        
        var self = this, n = self.n, tot = self._count, tot_1, dir, indx,
            klass = self[CLASS], T = klass.T, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        order = null != order ? ORDER( order ) : self._order;
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( (order === self._order) && Arithmetic.equ(index, self._index) ) return self._item;
        
        if ( Arithmetic.inside(index, -1, tot) )
        {            
            dir = REVERSED & order ? -1 : 1;
            tot_1 = Arithmetic.sub(tot, 1);
            if ( RANDOM & order )
            {
                indx = self.randomIndex( );
                return self.dual(
                    klass.unrank( indx, n, tot )
                    /*klass.rand( n, tot )*/
                    , indx, order
                );
            }
            else if ( MINIMAL & order )
            {
                indx = -1 === dir ? index : T(index, tot_1);
                return self.dual( Arithmetic.equ(O, index)
                ? self.item0( T(dir), order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( indx, n, tot )), indx, order );
            }
            else if ( COLEX & order )
            {
                indx = -1 === dir ? index : T(index, tot_1);
                return self.dual( Arithmetic.equ(O, index)
                ? self.item0( T(dir), order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( indx, n, tot )), indx, order );
            }
            else /*if ( LEX & order )*/
            {
                indx = -1 === dir ? T(index, tot_1) : index;
                return self.dual( Arithmetic.equ(O, index)
                ? self.item0( dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( T(dir), order )
                : klass.unrank( indx, n, tot )), indx, order );
            }
        }
        return null;
    }
    
    ,dual: function( item, index, order ) {
        if ( null == item ) return null;
        order = order || 0;
        var self = this, klass = self[CLASS], n = self.n,
            // some C-P-T processes at play here
            C = klass.C, P = klass.P, T = klass.T, G = klass.G,
            reflected = REFLECTED & order;
        
        if ( RANDOMISED & order )
            return reflected
                ? P( item, n )
                : item
            ;
        else if ( MINIMAL & order )
            return reflected
                ? G( P( C( item, n ), n ), n )
                : P( G( P( C( item, n ), n ), n ), n )
            ;
        else if ( COLEX & order )
            return reflected
                ? C( item, n )
                : P( C( item, n ), n )
            ;
        else /*if ( LEX & order )*/
            return reflected
                ? P( item, n )
                : copy( item )
            ;
    }
    
    ,randomIndex: function( m, M ) {
        var self = this, Arithmetic = Abacus.Arithmetic, N = Arithmetic.N, O = Arithmetic.O,
            tot = self._count, argslen = arguments.length;
        if ( 0 === argslen )
        {
            m = O;
            M = Arithmetic.sub(tot,1);
        }
        else if ( 1 === argslen )
        {
            m = N( m || 0 );
            M = Arithmetic.sub(tot,1);
        }
        else
        {
            m = N( m );
            M = N( M );
        }
        return Arithmetic.rnd( m, M );
    }
    
    ,random: function( ) {
        var self = this, klass = self[CLASS];
        return self.dual( klass.rand( self.n, self._count ), null, RANDOM|self._order );
    }
    
    ,rewind: function( ) {
        return this.order( this._order, true );
    }
    
    ,forward: function( ) {
        return this.order( this._order, false );
    }
    
    ,hasNext: function( ) {
        return STOCHASTIC & this._order ? true : this._next;
    }
    
    ,hasPrev: function( ) {
        return RANDOMISED & this._order ? false : this._prev;
    }
    
    // some C-P-T processes at play here as well, see below
    ,item0: NotImplemented
    
    // some C-P-T processes at play and here as well, see below
    ,succ: function( dir, item, index, order ) {
        var self = this, klass = self[CLASS],
            Arithmetic = Abacus.Arithmetic,
            total = self._count, n = self.n;
        return null == item
            ? null
            : klass.unrank(Arithmetic.add(/*klass.rank(item, n, total)*/index, -1===dir?-1:1), n, total)
        ;
    }
    
    // some C-P-T processes at play here as well, see below
    ,next: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            order = self._order, traversed, r, dir,
            klass = self[CLASS], T = klass.T, current = self._item, n = self.n, tot = self._count, tot_1, rs;
        
        if ( STOCHASTIC & order )
        {
            self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
        }
        else if ( RANDOM & order )
        {
            traversed = self._traversed;
            if ( !traversed )
            {
                r = self.randomIndex( );
                self.__item = klass.unrank( r, n, tot );
                if ( null != self.__item ) self.__index = r;
            }
            else
            {
                tot_1 = Arithmetic.sub(tot, 1);
                if ( Arithmetic.lt(self._index, tot_1) )
                {
                    // get next un-traversed index, reject if needed
                    r = self.randomIndex( );
                    rs = Abacus.Math.rnd( ) > 0.5 ? -1 : 1;
                    while ( traversed.isset( r ) ) r = Arithmetic.wrap( Arithmetic.add(r, rs), O, tot_1 );
                    traversed.set( r );
                    self.__item = klass.unrank( r, n, tot );
                    if ( null != self.__item ) self.__index = r;
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
        }
        else
        {
            dir = REVERSED & order ? T(1) : 1;
            // compute next, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
            if ( MINIMAL & order )
            {
                self.__item = self.succ( T(dir), self.__item, self.__index, order );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, T(dir));
            }
            else if ( COLEX & order )
            {
                self.__item = self.succ( T(dir), self.__item, self.__index, order );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, T(dir));
            }
            else /*if ( LEX & order )*/
            {
                self.__item = self.succ( dir, self.__item, self.__index, order );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, dir);
            }
        }
        self._item = null == self.__item ? null : self.dual( self.__item, STOCHASTIC & order ? null : self.__index, order );
        self._next = null != self.__item;
        if ( self._next && !(STOCHASTIC & order) ) self._index = Arithmetic.add(self._index, 1);
        return current;
    }
    
    // some C-P-T processes at play here as well, see below
    ,prev: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, order = self._order, dir,
            klass = self[CLASS], T = klass.T, current = self._item, n = self.n, tot = self._count;
        
        // random and stochastic order has no prev
        if ( RANDOMISED & order ) return null;
        
        dir = REVERSED & order ? T(1) : 1;
        // compute prev, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
        if ( MINIMAL & order )
        {
            self.__item = self.succ( dir, self.__item, self.__index, order );
            if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, dir);
        }
        else if ( COLEX & order )
        {
            self.__item = self.succ( dir, self.__item, self.__index, order );
            if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, dir);
        }
        else /*if ( LEX & order )*/
        {
            self.__item = self.succ( T(dir), self.__item, self.__index, order );
            if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, T(dir));
        }
        self._item = null == self.__item ? null : self.dual( self.__item, self.__index, order );
        self._prev = null != self.__item;
        if ( self._prev ) self._index = Arithmetic.sub(self._index, 1);
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic, N = Arithmetic.N, O = Arithmetic.O,
            tmp, tot = self._count, range, count, i, iter_state, dir = 1,
            argslen = arguments.length, tot_1 = Arithmetic.sub(tot,1),
            not_randomised = !(RANDOMISED & self._order);
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
            iter_state = self._store( );
            if ( not_randomised ) self.index( start ); 
            count = Arithmetic.val(Arithmetic.sub(end, start)); range = new Array( count+1 );
            if ( 0 > dir ) for (i=count; i>=0; i--) range[ i ] = self.next( );
            else for (i=0; i<=count; i++) range[ i ] = self.next( );
            // restore previous iterator state
            self._restore( iter_state );
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

// https://en.wikipedia.org/wiki/Permutations
Permutation = Abacus.Permutation = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Permutation( n, multiset ) {
        var self = this;
        if ( !(self instanceof Permutation) ) return new Permutation(n, multiset);
        CombinatorialIterator.call(self, [n, '[object Array]' === toString.call(multiset) ? multiset : false]);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, n[0] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: function( item, n ) {
            return gray_encode( item, n[0] );
        }
        
        ,count: function( n ) {
            if ( n[1] )
            {
                for(var m=[n[0]],i=0,l=n[1].length; i<l; i++) m.push( n[1][i].length );
                return Abacus.Math.Multinomial( m );
            }
            else
            {
                return Abacus.Math.Factorial( n[0] );
            }
        }
        ,rand: function( n ) { 
            n = n[0];
            var item = new Array(n), i;
            for (i=0; i<n; i++) item[i] = i;
            return shuffle( item, false, false );
        }
        ,stochastic: function( P, n, C ) {
            n = n[0];
            if ( (P.length !== n) || (P[0].length !== n) )
            {
                throw new Error('Stochastic Matrix dimensions and Permutation dimensions do not match!');
                return;
            }
            var permutation = new Array(n), 
                used = new Array(n), zeros,
                i, j, dice, pi, ci, cumul, N = 0, rnd = Abacus.Math.rnd,
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
                    if ( (cumul < dice) && (dice <= cumul+pi[j]) )
                    {
                        // if not already used AND
                        // simulation matrix is singly stochastic OR
                        // j-item has not been used in i-place enough according to doubly-stochastic matrix
                        if ( (0 === used[j]) && 
                            ( singly_stochastic || (i+1 === n) || (ci[j]+1 <= (N+1)*pi[j]) )
                        )
                        {
                            // then use j-item in i-place of permutation
                            used[j] = 1; permutation[i] = j;
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
        ,rank: function( item, n ) {
            // O(n log n) uniform lexicographic ranking.
            n = n[0];
            var Arithmetic = Abacus.Arithmetic,
                N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
                index = O, i, j, node, ctr,
                k = Abacus.Math.ceil(log2(n)), Tl = (1<<(1+k))-1, 
                T = new Array(Tl), twok = Arithmetic.shl(I,k);
            for(i=0; i<Tl; i++) T[i] = O;
            for(i=0; i<n; i++)
            {
                ctr = N(item[i]); // convert to arithmetic num if needed
                node = Arithmetic.val(Arithmetic.add(twok, ctr));
                for(j=0; j<k; j++)
                {
                    if ( node&1 ) ctr = Arithmetic.sub(ctr, T[(node >>> 1) << 1]);
                    T[node] = Arithmetic.add(T[node],1);
                    node >>>= 1;
                }
                T[node] = Arithmetic.add(T[node],1);
                index = Arithmetic.add(Arithmetic.mul(index, N(n-i)), ctr);
            }
            return index;
        }
        ,unrank: function( index, n, total ) {
            // O(n log n) uniform lexicographic unranking.
            var Arithmetic = Abacus.Arithmetic, klass = this, 
                N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
                item, fn, i, j, i2, 
                digit, node, rem, k, Tl, T, twok;
            
            total = null != total ? total : klass.count( n );
            //if ( Arithmetic.equ(0, index) ) return klass.first( n, 1 );
            //else if ( Arithmetic.equ(total, Arithmetic.add(index,1)) ) return klass.first( n, -1 );
                
            n = n[0];
            item = new Array(n); fn = Arithmetic.div(total, n);
            k = Abacus.Math.ceil(log2(n)); Tl = (1<<(1+k))-1;
            T = new Array(Tl); twok = Arithmetic.shl(I,k);
            
            for (i=0; i<=k; i++)
                for (j=1,i2=1<<i; j<=i2; j++) 
                    T[i2-1+j] = Arithmetic.shl(I, k-i);
            
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
                T[node] = O;
                item[i] = Arithmetic.val(Arithmetic.sub(N(node), twok));
                if ( rem )
                {
                    index = Arithmetic.mod(index, fn); 
                    fn = Arithmetic.div(fn, rem); 
                    rem--;
                }
            }
            return item;
        }
        ,shuffle: function( a, cyclic ) {
            return shuffle( a, true===cyclic, false );
        }
        ,inverse: function( perm ) {
            var n = perm.length, i, iperm = new Array(n);
            for (i=0; i<n; i++) iperm[perm[i]] = i;
            return iperm;
        }
        ,product: function( /* permutations */ ) {
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
        ,toCycles: function( perm, strict ) {
            var n = perm.length, i, cycles = [], current, cycle, 
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
        ,toSwaps: function( perm ) {
            var n = perm.length, i, l, swaps = [], cycle,
                cycles = Permutation.toCycles( perm, true );
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
        ,toMatrix: function( perm, bycolumns ) {
            var n = perm.length, mat = new Array(n), i, j;
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
        ,fromMatrix: function( mat, bycolumns ) {
            var n = mat.length, perm = new Array(n), i, j;
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
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, k = n[0], i, item = new Array( k );
        for (i=0; i<k; i++) item[i] = i;
        return -1 === dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
        if ( item )
        {
            var self = this, n = self.n[0];
            var k, kl, l, r, s, next = item.slice();
            
            if ( -1 === dir )
            {
                //Find the largest index k such that a[k] > a[k + 1].
                k = n-2;
                while (k>=0 && item[k]<=item[k+1]) k--;
                // If no such index exists, the permutation is the last permutation.
                if ( k >=0 ) 
                {
                    //Find the largest index kl greater than k such that a[k] > a[kl].
                    kl = n-1;
                    while (kl>k && item[k]<=item[kl]) kl--;
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
                while (k>=0 && item[k]>=item[k+1]) k--;
                // If no such index exists, the permutation is the last permutation.
                if ( k >=0 ) 
                {
                    //Find the largest index kl greater than k such that a[k] < a[kl].
                    kl = n-1;
                    while (kl>k && item[k]>=item[kl]) kl--;
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
});

// https://en.wikipedia.org/wiki/Combinations
Combination = Abacus.Combination = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k, type ) {
        var self = this;
        if ( !(self instanceof Combination) ) return new Combination(n, k, type);
        CombinatorialIterator.call(self, [n, k, "repeated"===String(type).toLowerCase()]);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, n[0] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: function( item, n ) {
            return gray_encode( item, n[0] );
        }
        
        ,count: function( n ) {
             return Abacus.Math.Binomial( n[2] ? n[0]+n[1]-1 : n[0], n[1] );
         }
        ,rand: function( n ) {
            var item, i, k, n_k, c, rndInt = Abacus.Math.rndInt, repeated = n[2];
            k = n[1]; n = n[0]; n_k = n-k; c = n-1;
            if ( repeated )
            {
                if ( 1 === k )
                {
                    item = [rndInt(0, c)];
                }
                else
                {
                    // O(klogk) worst-case, unbiased
                    item = [];
                    for(i=0; i<k; i++)
                        // select uniformly with repetition
                        // insert the selected in sorted place
                        insert_sort( item, rndInt(0, c) );
                }
            }
            else
            {
                var selected, selection, excluded;
                if ( 1 === k )
                {
                    item = [rndInt(0, c)]
                }
                else if ( n === k )
                {
                    item = new Array(k);
                    for(i=0; i<k; i++) item[i] = i;
                }
                else if ( n_k < k )
                {
                    selected = {}; excluded = [];
                    for(i=0; i<n_k; i++)
                    {
                        // select uniformly without repetition
                        selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = rndInt(0, c);
                        selected[selection] = 1;
                        // insert the selected in sorted place
                        insert_sort( excluded, selection );
                    }
                    // get the complement
                    item = complement( excluded, n );
                }
                else
                {
                    // O(klogk) worst-case, unbiased
                    selected = {}; item = [];
                    for(i=0; i<k; i++)
                    {
                        // select uniformly without repetition
                        selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = rndInt(0, c);
                        selected[selection] = 1;
                        // insert the selected in sorted place
                        insert_sort( item, selection );
                    }
                }
            }
            return item;
        }
        ,stochastic: CombinatorialIterator.stochastic
        ,rank: function( item, n, total ) {
            var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add, sub = Arithmetic.sub,
                index = Arithmetic.O, i, c, j, k, N, binom,
                repeated = n[2], binomial = Abacus.Math.Binomial;
            k = n[1]; n = n[0]; N = repeated ? n+k-1 : n;
            binom = total ? total : binomial(N, k);
            for (i=1; i<=k; i++)
            {
                // adjust the order to match MSB to LSB 
                // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                c = N-1-item[i-1]; j = k+1-i;
                if ( j <= c ) index = add(index, binomial(c, j));
            }
            return sub(sub(binom,1),index);
        }
        ,unrank: function( index, n, total ) {
            var Arithmetic = Abacus.Arithmetic,
                NN = Arithmetic.N, O = Arithmetic.O,
                klass = this, item, binom,
                k, N, m, t, p, repeated  = n[2];
            total = null != total ? total : klass.count( n );
            /*if ( Arithmetic.equ(0, index) )
            {
                item = klass.first( n, 1 );
            }
            else if ( Arithmetic.equ(total, Arithmetic.add(index,1)) )
            {
                item = klass.first( n, -1 );
            }
            else
            {*/
            k = n[1]; n = n[0]; N = repeated ? n+k-1 : n;
            item = new Array(k); binom = total;
            // adjust the order to match MSB to LSB 
            index = Arithmetic.sub(Arithmetic.sub(binom,1),index);
            binom = Arithmetic.div(Arithmetic.mul(binom,NN(N-k)),N); 
            t = N-k+1; m = k; p = N-1;
            do {
                if ( Arithmetic.lte(binom, index) )
                {
                    item[k-m] = N-t-m+1;
                    if ( Arithmetic.gt(binom, O) )
                    {
                        index = Arithmetic.sub(index, binom); 
                        binom = Arithmetic.div(Arithmetic.mul(binom,m),p);
                    }
                    m--; p--;
                }
                else
                {
                    binom = Arithmetic.div(Arithmetic.mul(binom,NN(p-m)),p); 
                    t--; p--;
                }
            } while( m > 0 );
            /*}*/
            return item;
        }
        ,complement: function( alpha, n ) {
            return complement( alpha, n );
        }
        ,pick: function( a, k, unique, sorted ) {
            return pick( a, k, false===unique, true===sorted, true );
        }
        ,choose: function( arr, comb ) {
            var i, l = comb.length, chosen = new Array(l);
            for (i=0; i<l; i++) chosen[i] = arr[comb[i]];
            return chosen;
        }
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
                        if ( bycolumns && (j < k) ) comb[j] = i;
                        else if ( !bycolumns && (i < k) ) comb[i] = j;
                    }
                }
            }
            return comb;
        }
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, i, repeated = n[2], k = n[1], item = new Array( k );
        if ( repeated ) for (i=0; i<k; i++) item[i] = 0;
        else for (i=0; i<k; i++) item[i] = i;
        return -1 === dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var self = this, n = self.n;
            var repeated = n[2], k, i, index, limit, curr,
                ofs = repeated ? 0 : 1, next = item.slice();
            k = n[1]; n = n[0];
            
            if ( -1 === dir )
            {
                // compute prev indexes
                // find index to move
                i = k-1;  index = -1;
                while ( 0 < i )
                {
                    if ( next[i]>next[i-1]+ofs ) { index = i; break; }
                    i--;
                }
                if (-1 === index && 0 < next[0]) index = 0;
                // adjust next indexes after the moved index
                if ( -1 < index )
                {
                    curr = n-1+ofs;
                    for (i=k-1; i>index; i--)
                    {
                        curr -= ofs;
                        next[i] = curr;
                    }
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
                if ( repeated )
                {
                    while ( 0 <= i )
                    {
                        if ( next[i] < n-1 ) { index = i; break; }
                        i--;
                    }
                }
                else
                {
                    limit = n-k;
                    while ( 0 <= i )
                    {
                        if ( next[i] < limit+i ) { index = i; break; }
                        i--;
                    }
                }
                // adjust next indexes after the moved index
                if ( -1 < index )
                {
                    curr = next[index]+1-ofs;
                    for (i=index; i<k; i++)
                    {
                        curr += ofs;
                        next[i] = curr;
                    }
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
});
// aliases
Combination.conjugate = Combination.complement;

// http://en.wikipedia.org/wiki/Power_set
Subset = Abacus.Powerset = Abacus.Subset = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Subset( n ) {
        var self = this;
        if ( !(self instanceof Subset) ) return new Subset(n);
        CombinatorialIterator.call(self, n);
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: CombinatorialIterator.G
        
        ,count: function( n ) {
             return Abacus.Math.Pow2( n );
         }
        ,rand: CombinatorialIterator.rand
        ,stochastic: CombinatorialIterator.stochastic
        ,rank: function( subset, n, total ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
                index = O, i = 0, l = subset.length;
            while ( i < l ) index = Arithmetic.add(index, Arithmetic.shl(I, subset[i++]));
            return index;
        }
        ,unrank: function( index, n, total ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic, subset = [], i = 0;
            if ( Arithmetic.lt(index, 0) || Arithmetic.gte(index, null!=total ? total : klass.count(n)) ) return null;
            while ( Arithmetic.gt(index, 0) )
            {
                // loop unrolling
                if ( Arithmetic.gt(Arithmetic.band(index,1),0) ) subset.push( i );
                if ( Arithmetic.gt(Arithmetic.band(index,2),0) ) subset.push( i+1 );
                if ( Arithmetic.gt(Arithmetic.band(index,4),0) ) subset.push( i+2 );
                if ( Arithmetic.gt(Arithmetic.band(index,8),0) ) subset.push( i+3 );
                if ( Arithmetic.gt(Arithmetic.band(index,16),0) ) subset.push( i+4 );
                if ( Arithmetic.gt(Arithmetic.band(index,32),0) ) subset.push( i+5 );
                if ( Arithmetic.gt(Arithmetic.band(index,64),0) ) subset.push( i+6 );
                if ( Arithmetic.gt(Arithmetic.band(index,128),0) ) subset.push( i+7 );
                i+=8; index = Arithmetic.shr(index, 8);
            }
            return subset;
        }
    }
    ,dual: function( item, index, order ) {
        if ( null == item ) return null;
        order = order || 0;
        var self = this, klass = self[CLASS],
            C = klass.C, P = klass.P, T = klass.T, G = klass.G,
            total = self._count, n = self.n, reflected = REFLECTED & order;
        
        if ( RANDOMISED & order )
            return reflected
                ? P( item, n )
                : item
            ;
        else if ( MINIMAL & order )
            return reflected
                ? P( klass.unrank( G( index ), n, total ), n )
                : klass.unrank( G( index ), n, total )
            ;
        else
            return reflected
                ? P( item, n )
                : copy( item )
            ;
    }
    ,item0: function( dir, order ) {
        var n = this.n, is_complementary = (MINIMAL|COLEX) & (order||0);
        if ( -1 === dir )
        {
            // C of item0
            if ( is_complementary )
            {
                return [];
            }
            else
            {
                var i, item = new Array( n ); 
                for (i=0; i<n; i++) item[ i ] = i;
                return item;
            }
        }
        else
        {
            if ( is_complementary )
            {
                var i, item = new Array( n ); 
                for (i=0; i<n; i++) item[ i ] = i;
                return item;
            }
            else
            {
                return [];
            }
        }
    }
    ,succ: function( dir, item, index, order ) {
        if ( -1 !== dir ) dir = 1;
        if ( (MINIMAL|COLEX) & (order||0) ) dir = -dir;
        return null == item ? null : CombinatorialIterator[PROTO].succ.call(this, dir, item, index, order);
    }
});

// https://en.wikipedia.org/wiki/Partitions
Partition = Abacus.Partition = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Partition( n, type ) {
        var self = this;
        if ( !(self instanceof Partition) ) return new Partition(n, type);
        CombinatorialIterator.call(self, [n, "set"===String(type).toLowerCase()]);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugate_partition( item );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: function( item, n ) {
            return gray_encode( item, n[0] );
        }
        
        ,count: function( n ) {
             n = n[0];
             var partitions = Abacus.Math.Partitions, add = Abacus.Arithmetic.add,
                p = Abacus.Arithmetic.N(n > 1 ? 2 : 1), k, m;
             for (k=2; k<n; k++) 
                 for (m=n-k+1; m>=1; m--)
                    p = add(p,partitions(n, k, m));
             return p;
         }
        ,rand: function( n, total ) {
            return null;
        }
        ,stochastic: CombinatorialIterator.stochastic
        ,rank: function( item, n, total, order, s, e ) {
            return Abacus.Arithmetic.O;
            /*n = n[0];
            var Arithmetic = Abacus.Arithmetic, klass = this, index, i, l = item.length, k, nk = n;
            total = null != total ? total : klass.count( n );
            s = s || 0; e = e || l; i = s; k = item[i];
            if ( nk === k ) index = Arithmetic.sub(total,1);
            else if ( 1 === k ) index = 0;
            else if ( i+1 < l ) index = Arithmetic.add(1, klass.rank(item, [n-k], Arithmetic.sub(total,klass.count( n-k )), order, i+1));
            else index = 0;
            return index;*/
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
            return null;
        }
        ,toSet: function( partition ) {
            return partition ? partition2sets( partition ) : null;
        }
        ,toNumeric: function( set_partition ) {
            return set_partition ? sets2partition( set_partition ) : null;
        }
        ,conjugate: function( partition ) {
            return conjugate_partition( partition );
        }
        ,pack: function( partition ) {
            var packed = [], i, l = partition.length, 
                last = partition[0], part = [last, 1];
            for (i=1; i<l; i++)
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
    ,dual: function( item, index, order ) {
        if ( null == item ) return null;
        order = order || 0;
        var self = this, klass = self[CLASS], n = self.n;
        return n[1] ? klass.toSet( item ) : (RANDOMISED&order ? item : copy( item ));
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n[0], i, item = new Array( n );
        for (i=0; i<k; i++) item[ i ] = 1;
        return -1 === dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var self = this, n = self.n[0];
            var i, c, p1, p2, summa, rem, 
                next = item.slice();
            
            if ( -1 === dir )
            {
                // C of item
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
                // invC of item
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
});
// aliases
Partition.transpose = Partition.conjugate;

// 
// https://en.wikipedia.org/wiki/Outer_product
// https://en.wikipedia.org/wiki/Kronecker_product
// https://en.wikipedia.org/wiki/Tensor_product
// see also: http://www.inf.ethz.ch/personal/markusp/papers/perm.ps
Tensor = Abacus.Tensor = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Tensor( /*dims here ..*/ ) {
        var self = this, args = arguments;
        if ( !(self instanceof Tensor) ) 
        {
            self = new Tensor( );
            if ( args.length )
            {
                CombinatorialIterator.call(self, args[0] instanceof Array ? args[0] : slice.call(args));
            }
            else
            {
                self.n = [];
                self._count = 0;
            }
            return self;
        }
        if ( args.length )
        {
            CombinatorialIterator.call(self, args[0] instanceof Array ? args[0] : slice.call(args));
        }
        else
        {
            self.n = [];
            self._count = 0;
        }
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: CombinatorialIterator.G
        
        ,count: function( n ) {
             return !n || !n.length ? 0 : product( n );
        }
        ,rand: function( n ) {
            var rndInt = Abacus.Math.rndInt, i, d = n, nd = d.length, item = new Array(nd);
            for (i=0; i<nd; i++) item[ i ] = rndInt(0, d[ i ]-1);
            return item;
        }
        ,stochastic: CombinatorialIterator.stochastic
        ,rank: function( item, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, d = n, nd = d.length, i;
            if ( !nd ) return -1;
            for (index=Arithmetic.O,i=0; i<nd; i++) index = Arithmetic.add(Arithmetic.mul(index, d[ i ]), item[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, l, i, t, item,
                d = n, nd = d.length;
            if ( !nd ) return [ ];
            item = new Array( nd );
            for (r=index,i=nd-1; i>=0; i--)
            {
                l = d[ i ];
                t = Arithmetic.mod(r, l);
                r = Arithmetic.div(r, l);
                item[ i ] = Arithmetic.val(t);
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
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, i, nd = n.length, item = new Array( nd );
        for (i=0; i<nd; i++) item[ i ] = 0;
        return -1 === dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var self = this, n = self.n;
            var i, j, next = item.slice(), d = n, nd = d.length;
            
            if ( -1 === dir )
            {
                // C of item
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
                // invC of item
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
         C: function( item, n ) {
            return conjugation( item, n[1] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: function( item, n ) {
            return gray_encode( item, n[1] );
        }
        
        ,count: function( n ) {
             return Abacus.Math.Exp( n[1], n[0] );
        }
        ,rand: function( n ) {
            var rndInt = Abacus.Math.rndInt, i, k = n[0], item = new Array(k);
            n = n[1]-1;
            for (i=0; i<k; i++) item[ i ] = rndInt(0, n);
            return item;
        }
        ,stochastic: Tensor.stochastic
        ,rank: function( item, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, k = n[0], i;
            n = n[1];
            for (index=Arithmetic.O,i=0; i<k; i++) index = Arithmetic.add(Arithmetic.mul(index, n), item[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, l, i, t, item, k = n[0];
            n = n[1]; item = new Array( k );
            for (r=index,i=k-1; i>=0; i--)
            {
                l = n;
                t = Arithmetic.mod(r, l);
                r = Arithmetic.div(r, l);
                item[ i ] = Arithmetic.val(t);
            }
            return item;
        }
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, i, k = n[0], item = new Array( k );
        for (i=0; i<k; i++) item[ i ] = 0;
        return -1 === dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var self = this, n = self.n;
            var i, j, next = item.slice(), k = n[0], n = n[1];
            
            if ( -1 === dir )
            {
                // C of item
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
                // invC of item
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
});

// export it
return Abacus;
});
