/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python
*   @version: 0.1.0
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

var  Abacus = {VERSION: "0.1.0"}
    ,PROTO = 'prototype', CLASS = 'constructor'
    ,NotImplemented = function( ) { throw new Error("Method not implemented!"); }
    ,slice = Array.prototype.slice
    ,HAS = Object[PROTO].hasOwnProperty
    ,toString = Object[PROTO].toString
    ,Extend = Object.create
    ,Merge = function(a, b) {
        for (var p in b) if (HAS.call(b,p)) a[p] = b[p];
        return a;
    }
    ,Class = function(s, c) {
        if ( 1 === arguments.length ) { c = s; s = Object; }
        var ctor = c[CLASS];
        if ( HAS.call(c,'__static__') ) { ctor = Merge(ctor, c.__static__); delete c.__static__; }
        ctor[PROTO] = Merge(Extend(s[PROTO]), c);
        return ctor;
    }
    
    // utils
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim
        ? function( s ){ return s.trim(); }
        : function( s ){ return s.replace(trim_re, ''); }
    ,is_array = function( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
    ,is_string = function( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
    ,log2 = Math.log2 || function(x) { return Math.log(x) / Math.LN2; }
    ,to_base_string = function to_base_string( b, base ) { return b.toString( base||2 );  }
    ,to_fixed_base_string = function to_fixed_base_string( l, base, z ) {
        base = base || 2; z = z || '0';
        return function( b ) {
            var n, bs;
            bs = b.toString( base );
            if ( (n = l-bs.length) > 0 ) bs = new Array(n+1).join(z) + bs;
            return bs;
        };
    }
    ,to_fixed_binary_string_32 = to_fixed_base_string( 32, 2, '0' )
    ,Node = function Node( k, v, p, n, l, r, d ) {
        // a unified graph as well as (binary) tree, as well as quadraply-, doubly- and singly- linked list
        var self = this;
        self.key = k; self.val = v;
        self.prev = p || null; self.next = n || null;
        self.left = l || null; self.right = r || null;
        self.data = d || null;
    }
    ,walk = function walk( scheme, node, go ) {
        if ( null == node ) return;
        var step, i, l, n, s = 0, sl = scheme.length;
        while ( s < sl )
        {
            step = scheme[s]; s += 1; n = null;
            if ( (Node.NODE === step) )                                n = node;
            else if ( (Node.PREV === step) && (null != node.prev) )    n = node.prev;
            else if ( (Node.LEFT === step) && (null != node.left) )    n = node.left;
            else if ( (Node.RIGHT === step) && (null != node.right) )  n = node.right;
            else if ( (Node.NEXT === step) && (null != node.next) )    n = node.next;
            else /*if ( null == n )*/ continue;
            if ( node === n )
                go( n );
            else if ( is_array(n) )
                for(i=0,l=n.length; i<l; i++) walk( scheme, n[i], go );
            else
                walk( scheme, n, go );
        }
    }
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
        var len = x.length, argslen = arguments.length;
        if ( argslen < 5 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( argslen < 4 ) i0 = 0;
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
    ,map = function map( x, F, i0, i1, in_place, reverse ) {
        var len = x.length, argslen = arguments.length;
        in_place = true === in_place;
        if ( argslen < 4 ) i1 = len-1;
        if ( 0 > i1 ) i1 += len;
        if ( argslen < 3 ) i0 = 0;
        if ( i0 > i1 ) return in_place ? x : [];
        var i, j, k, l=i1-i0+1, l1, lr, r, q, Fx = in_place ? x : new Array(l);
        if ( true === reverse )
        {
            l1=l-1; r=l&15; q=r&1; lr=l1-r;
            if ( q ) Fx[in_place ? i0 : 0] = F(x[i1], i1, i0, i1);
            for (i=l1-q; i>lr; i-=2)
            { 
                k = i0+i; j = in_place ? k : i;
                Fx[j  ] = F(x[k  ], k  , i0, i1);
                Fx[j+1] = F(x[k-1], k-1, i0, i1);
            }
            for (i=lr; i>=0; i-=16)
            {
                k = i0+i; j = in_place ? k : i;
                Fx[j  ] = F(x[k  ], k  , i0, i1);
                Fx[j+1] = F(x[k-1], k-1, i0, i1);
                Fx[j+2] = F(x[k-2], k-2, i0, i1);
                Fx[j+3] = F(x[k-3], k-3, i0, i1);
                Fx[j+4] = F(x[k-4], k-4, i0, i1);
                Fx[j+5] = F(x[k-5], k-5, i0, i1);
                Fx[j+6] = F(x[k-6], k-6, i0, i1);
                Fx[j+7] = F(x[k-7], k-7, i0, i1);
                Fx[j+8] = F(x[k-8], k-8, i0, i1);
                Fx[j+9] = F(x[k-9], k-9, i0, i1);
                Fx[j+10] = F(x[k-10], k-10, i0, i1);
                Fx[j+11] = F(x[k-11], k-11, i0, i1);
                Fx[j+12] = F(x[k-12], k-12, i0, i1);
                Fx[j+13] = F(x[k-13], k-13, i0, i1);
                Fx[j+14] = F(x[k-14], k-14, i0, i1);
                Fx[j+15] = F(x[k-15], k-15, i0, i1);
            }
        }
        else
        {
            r=l&15; q=r&1;
            if ( q ) Fx[in_place ? i0 : 0] = F(x[i0], i0, i0, i1);
            for (i=q; i<r; i+=2)
            { 
                k = i0+i; j = in_place ? k : i;
                Fx[j  ] = F(x[k  ], k  , i0, i1);
                Fx[j+1] = F(x[k+1], k+1, i0, i1);
            }
            for (i=r; i<l; i+=16)
            {
                k = i0+i; j = in_place ? k : i;
                Fx[j  ] = F(x[k  ], k  , i0, i1);
                Fx[j+1] = F(x[k+1], k+1, i0, i1);
                Fx[j+2] = F(x[k+2], k+2, i0, i1);
                Fx[j+3] = F(x[k+3], k+3, i0, i1);
                Fx[j+4] = F(x[k+4], k+4, i0, i1);
                Fx[j+5] = F(x[k+5], k+5, i0, i1);
                Fx[j+6] = F(x[k+6], k+6, i0, i1);
                Fx[j+7] = F(x[k+7], k+7, i0, i1);
                Fx[j+8] = F(x[k+8], k+8, i0, i1);
                Fx[j+9] = F(x[k+9], k+9, i0, i1);
                Fx[j+10] = F(x[k+10], k+10, i0, i1);
                Fx[j+11] = F(x[k+11], k+11, i0, i1);
                Fx[j+12] = F(x[k+12], k+12, i0, i1);
                Fx[j+13] = F(x[k+13], k+13, i0, i1);
                Fx[j+14] = F(x[k+14], k+14, i0, i1);
                Fx[j+15] = F(x[k+15], k+15, i0, i1);
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
                if ( is_array(vv) )
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
    ,merge = function merge_sorted2( a, b, a0, a1, b0, b1, union, reverse, unique, in_place ) {
        reverse = -1 === reverse ? 1 : 0; unique = false !== unique;
        var ai = a0, bi = b0, al = a1-a0+1, bl = b1-b0+1,
            ui = 0, ul = al+bl, last, with_duplicates = !unique;
        union = union || new Array(ul);
        // assume a, b lists are sorted ascending, even with duplicate values
        while( ai <= a1 && bi <= b1 )
        {
            if      (unique && ui) // handle any possible duplicates inside SAME list
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
                union[ui++] = last = reverse?b[bi++]:a[ai++]; 
            }
            else if ( a[ai] > b[bi] )
            { 
                union[ui++] = last = reverse?a[ai++]:b[bi++]; 
            }
            else // they're equal, push one unique
            {
                union[ui++] = last = a[ ai ];
                if ( with_duplicates ) union[ui++] = b[ bi ];
                ai++; bi++;
            }
        }
        while ( ai <= a1 ) { if ( with_duplicates || (a[ai] !== last) ) union[ui++] = last = a[ai]; ai++; }
        while ( bi <= b1 ) { if ( with_duplicates || (b[bi] !== last) ) union[ui++] = last = b[bi]; bi++; }
        if ( true === in_place )
        {
            // move the merged back to the a array
            for(ui=0; ui<ul; ui++) a[a0+ui] = union[ui];
            return a;
        }
        else
        {
            // truncate if needed
            if ( ui < union.length ) union.length = ui;
            return union;
        }
    }
    ,mergesort = function mergesort( a/*, reverse*/ ) {
        var N = a.length;
        // in-place
        if ( 1 >= N ) return a;
        var logN = N, j, n, size = 1, size2 = 2, min = Math.min, aux = new Array(N);
        while ( logN )
        {
            n = N-size;
            for (j=0; j<n; j+=size2)
                merge(a, a, j, j+size-1, j+size, min(j+size2-1, N-1), aux, false/*reverse*/, false, true);
            size <<= 1; size2 <<= 1; logN >>= 1;
        }
        return a;
    }
    ,insert_sort = function insert_sort( list, v, k/*, reverse*/ ) {
        //reverse = -1 === reverse ? 1 : 0;
        if ( null == k ) k = v;
        var s, e;
        if ( !list.tree || (0 === list.tree.data) )
        {
            // insert first item in btree: O(1)
            list.tree = new Node(k,v);
            list.tree.data = 1;
        }
        else if ( 1 === list.tree.data )
        {
            // insert second item in btree: O(1)
            /*if ( reverse )
                s = k >= list.tree.key
                    ? new Node(k,v,null,list.tree)
                    : new Node(k,v,list.tree);
            else*/
                s = k < list.tree.key
                    ? new Node(k,v,null,list.tree)
                    : new Node(k,v,list.tree);
            s.data = list.tree.data+1;
            list.tree.data = null;
            list.tree = s;
        }
        else
        {
            // insert item in btree: O(logN) average-case, O(N) worst-case
            e = list.tree; e.data++;
            /*if ( reverse )
            {
                while ( e )
                {
                    s = e;
                    e = k >= e.key ? e.prev : e.next;
                }
                if ( k >= s.key ) s.prev = new Node(k,v,s);
                else              s.next = new Node(k,v,s);
            }
            else
            {*/
                while ( e )
                {
                    s = e;
                    e = k < e.key ? e.prev : e.next;
                }
                if ( k < s.key ) s.prev = new Node(k,v,s);
                else             s.next = new Node(k,v,s);
            /*}*/
        }
        if ( list.tree.data === list.length )
        {
            // depth-first, in-order traversal and position sorted in final array: O(N)
            var index = 0;
            walk([Node.PREV, Node.NODE, Node.NEXT], list.tree, function( node ){ list[index++] = node.val; });
            list.tree = null;
        }
        return list;
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
        if ( HAS.call(o,'included') && o.included.length )
        {
            inc = o.included;
        }
        else if ( HAS.call(o,'excluded') && o.excluded.length )
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
        
        picked = new Array(k);
        if ( true === repeated )
        {
            n = n-1;
            for (i=0; i<k; i++) // O(k) times
                picked[ i ] = a[ rndInt( 0, n ) ];
            if ( sorted ) mergesort( picked );// O(klogk) times, average/worst-case
            return picked;
        }
        
        non_destructive = false !== non_destructive;
        if ( non_destructive ) backup = new Array( k );
        
        // partially shuffle the array, and generate unbiased selection simultaneously
        // this is a variation on fisher-yates-knuth shuffle
        for (i=0; i<k; i++) // O(k) times
        { 
            selected = rndInt( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
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
        if ( sorted ) mergesort( picked );// O(klogk) times, average/worst-case
        return picked;
    }
    ,gray_encode = function gray_encode( a, n ) {
        if ( null == a ) return null;
        if ( !a.length ) return [];
        var i, k = a.length, g = new Array(k);
        if ( is_array(n) )
        {
            // non-cyclic multi-radix n-ray code
            // [TODO] need to make cyclic for all n and radix used!!!
            for(g[0]=a[0],i=1; i<k; i++)
            {
                g[i] = (a[i] + n[i-1]-a[i-1]) % n[i];
            }
        }
        else if ( 0 > n )
        {
            // decreasing mixed-radix same as n
            // non-cyclic multi-radix n-ray code
            // [TODO] need to make cyclic for all n and radix used!!!
            for(g[0]=a[0],i=1; i<k; i++)
            {
                g[i] = (a[i] + a[i-1]) % (k-i);
            }
        }
        else
        {
            // cyclic n-ray code
            for(g[0]=a[0],i=1; i<k; i++)
            {
                g[i] = (a[i] + n-a[i-1]) % n;
            }
        }
        return g;
    }
    ,copy = function copy( a ) {
        return null == a ? null : a.slice( );
    }
    // C process / symmetry
    ,conjugation = function conjugation( a, n ) {
        if ( null == a ) return null;
        if ( !a.length ) return [];
        var i, k = a.length, b = new Array(k);
        if ( is_array(n) ) for (i=0; i<k; i++) b[i] = n[i]-1-a[i];
        else if ( 0 > n ) for (i=0; i<k; i++) b[i] = k-1-i-a[i];
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
        if ( is_array(n) )
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
    ,permutation2inversion = function permutation2inversion( permutation ) {
        var n = permutation.length, i, j,
            inversion = new Array(n);
        for(i=0;i<n; i++) inversion[i] = 0;
        //inversion[permutation[n-1]] = 0;
        // O(n^2)
        // [TODO] O(n) or O(nlgn)
        for(i=0; i<n; i++)
        {
            for(j=i+1; j<n; j++)
            {
                if ( permutation[i] > permutation[j] )
                    inversion[i]++;
            }
        }
        return inversion;
    }
    ,inversion2permutation = function inversion2permutation( inversion ) {
        var n = inversion.length, i, item = new Array(n), permutation = new Array(n);
        for(i=0; i<n; i++) item[ i ] = i;
        for(i=0; i<n; i++) permutation[ i ] = item.splice(inversion[ i ], 1)[ 0 ];
        return permutation;
    }
    ,cycle2swaps = function cycle2swaps( cycle, swaps, slen ) {
        var c = cycle.length, noref = null == swaps, j;
        if ( c > 1 )
        {
            if ( noref )
            {
                swaps = new Array(c-1);
                slen = 0;
            }
            for (j=c-1; j>=1; j--) swaps[slen++] = [cycle[0],cycle[j]];
        }
        else
        {
            if ( noref ) swaps = [];
        }
        return noref ? swaps : slen;
    }
    ,permutation2cycles = function permutation2cycles( permutation, strict ) {
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
    ,permutation2swaps = function permutation2swaps( permutation ) {
        var n = permutation.length, i, l, j, k,
            swaps = new Array(n), slen = 0,
            cycles = permutation2cycles( permutation, true );
        for (i=0,l=cycles.length; i<l; i++) slen = cycle2swaps( cycles[i], swaps, slen );
        if ( slen < swaps.length ) swaps.length = slen; // truncate
        return swaps;
    }
    ,swaps2permutation = function swaps2permutation( swaps, n ) {
        var i, l = swaps.length, permutation = new Array(n), s, t;
        for (i=0; i<n; i++) permutation[i] = i;
        for (i=0; i<l; i++)
        {
            // swap
            swap = s[i];
            t = permutation[s[0]]; 
            permutation[s[0]] = permutation[s[1]];
            permutation[s[1]] = t;
        }
        return permutation;
    }
    ,permutation2matrix = function permutation2matrix( permutation, transposed ) {
        var n = permutation.length, matrix = new Array(n), i, j;
        for (i=0; i<n; i++)
        {
            matrix[i] = new Array(n);
            for (j=0; j<n; j++) matrix[i][j] = 0;
        }
        if ( true === transposed )
            for (i=0; i<n; i++) matrix[permutation[i]][i] = 1;
        else
            for (i=0; i<n; i++) matrix[i][permutation[i]] = 1;
        return matrix;
    }
    ,matrix2permutation = function matrix2permutation( matrix, transposed ) {
        var n = matrix.length, permutation = new Array(n), i, j;
        if ( true === transposed )
        {
            for (i=0; i<n; i++) for (j=0; j<n; j++)
                if ( matrix[i][j] ) permutation[j] = i;
        }
        else
        {
            for (i=0; i<n; i++) for (j=0; j<n; j++)
                if ( matrix[i][j] ) permutation[i] = j;
        }
        return permutation;
    }
    ,inverse_permutation = function inverse_permutation( permutation ) {
        var n = permutation.length, i, inv_permutation = new Array(n);
        for (i=0; i<n; i++) inv_permutation[permutation[i]] = i;
        return inv_permutation;
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
            tk = ''+(n-m)+','+(k-1)+','+j;
            // memoize here
            if ( null == partitions_tbl[tk] ) partitions_tbl[tk] = partitions( n-m, k-1, j );
            p = add(p, partitions_tbl[tk]);
        }
        return p;
    }
    ,apply_template_values = function apply_template_values( references, variables, values ) {
        var k, i, l = variables.length;
        if ( l )
        {
            for(i=0; i<l; i++)
                references[variables[i]].val = values[i];
            for(k in references)
                if ( HAS.call(references, k) && ("expr" === references[k].type) )
                    references[k].compute();
        }
    }
    ,check_unique = function check_unique( satisfied, references ) {
        var unique = true, c, applied = {};
        for(c in references)
        {
            if ( !HAS.call(references, c) ) continue;
            if ( /*("const" === references[c].type || "expr" === references[c].type) &&*/ (1 < references[c].pos.length) )
                unique = false;
            if ( 1 === applied[references[c].val] )
                unique = false;
            else
                applied[references[c].val] = 1;
            if ( !unique ) break;
        }
        satisfied.unique = unique;
        return satisfied;
    }
    ,check_ordered = function check_ordered( satisfied, references, desc ) {
        var ordered = true, strongly_ordered = true, c, k, i, j;
        for(c in references)
        {
            if ( !HAS.call(references, c) ) continue;
            if ( strongly_ordered )
            {
                for(i=0; i<references[c].pos.length; i++)
                {
                    if ( (desc && references[c].val > references[c].pos[i]) || (!desc && references[c].val < references[c].pos[i]) )
                    {
                        strongly_ordered = false;
                        break;
                    }
                }
            }
            if ( ordered )
            {
                for(k in references)
                {
                    if ( !HAS.call(references, k) || (c === k) ) continue;
                    for(i=0; i<references[c].pos.length; i++)
                    {
                        for(j=0; j<references[k].pos.length; j++)
                        {
                            if ( (references[c].val < references[k].val) && (
                                (desc && references[c].pos[i] < references[k].pos[j]) ||
                                (!desc && references[c].pos[i] > references[k].pos[j])
                            ) )
                            {
                                ordered = false;
                                break;
                            }
                        }
                        if ( !ordered ) break;
                    }
                    if ( !ordered ) break;
                }
            }
            if ( !ordered && !strongly_ordered ) break;
        }
        satisfied.ordered = ordered;
        satisfied.strongly_ordered = strongly_ordered;
        return satisfied;
    }
    ,generate_combinatorial_test = function generate_combinatorial_test( testval, min, max, type ) {
        if ( !testval || !testval.length ) return;
        var i, n = testval.length;
        //if ( max-min+1 < n ) return false;
        if ( null == testval[0] )
        {
            if ( "inc" === type ) for(i=0; i<n; i++) testval[i] = min+i;
            else for(i=0; i<n; i++) testval[i] = min;
            return testval;
        }
        else
        {
            if ( "inc" === type )
            {
                i = n-1;
                while( (i >= 0) && (testval[i] === max+i-n+1) ) i--;
                if ( (i >= 0) && (testval[i] < max+i-n+1) )
                {
                    testval[i]++;
                    while ( (++i < n) ) testval[i] = testval[i-1]+1;
                    return testval;
                }
            }
            else if ( "nondec" === type )
            {
                i = n-1;
                while( (i >= 0) && (testval[i] === max) ) i--;
                if ( (i >= 0) && (testval[i] < max) )
                {
                    testval[i]++;
                    while ( ++i < n ) testval[i] = testval[i-1];
                    return testval;
                }
            }
            else //if ( "indie" === type )
            {
                i = n-1;
                while( (i >= 0) && (testval[i] === max) ) i--;
                if ( (i >= 0) && (testval[i] < max) )
                {
                    testval[i]++;
                    while ( ++i < n ) testval[i] = 0;
                    return testval;
                }
            }
        }
    }
    ,build_expression = function build_expression( expr, entry, references ) {
        var el = expr.length, i, j, l, ei=0, refs = {}, se, decl = "", c;
        while(ei<el)
        {
            c = expr.charAt(ei++);
            if ( ('a' <= c && 'z' >= c) || ('A' <= c && 'Z' >= c) )
            {
                se = c;
                while(ei<el)
                {
                    c = expr.charAt(ei++);
                    if ( ('a' <= c && 'z' >= c) || ('A' <= c && 'Z' >= c) || ('0' <= c && '9' >= c) )
                        se += c;
                    else break;
                }
                if ( !HAS.call(refs, se) ) refs[se] = 1;
            }
        }
        entry.refs = Object.keys(refs);
        if ( entry.refs.length )
        {
            decl += "var ";
            for(j=0,l=entry.refs.length; j<l; j++)
                decl += (j ? "," : "")+entry.refs[j]+"=ref[\""+entry.refs[j]+"\"].val";
            decl += ";\n";
        }
        entry.compute = new Function("ref", "\"use strict\";\nreturn function(){\n\"use strict\";\n"+decl+"return ref[\""+entry.key+"\"].val="+entry.key+";\n};")(references);
        entry.coef = {}; entry.zero = 0;
        if ( entry.refs.length )
        {
            // compute (effective) linear coefficients of expression
            for(j=0,l=entry.refs.length; j<l; j++)
            {
                entry.coef[entry.refs[j]] = 1;
                references[entry.refs[j]].val = 0;
            }
            entry.zero = entry.compute();
            for(j=0; j<l; j++)
            {
                references[entry.refs[j]].val = 1;
                entry.coef[entry.refs[j]] = entry.compute()-entry.zero;
                references[entry.refs[j]].val = 0;
            }
        }
        return entry;
    }
    ,parse_combinatorial_template = function parse_combinatorial_template( tpl, constraints ) {
        var l = tpl.length, i, j, k, p, c, s, n, entry,
            paren, is_constant, is_reference,
            fixed = 0, min = null, max = null,
            variables = [], references = {}, positions = {},
            satisfied = {unique:true,ordered:true,strongly_ordered:true}
        ;
        constraints = constraints||{};
        i = 0; p = 0;
        while ( i < l )
        {
            c = tpl.charAt(i++);
            if ( '(' === c )
            {
                paren = 0;
                is_constant = true;
                is_reference = true;
                s = '';
                while ( i < l )
                {
                    c = tpl.charAt(i++);
                    if ( '(' === c ) paren++;
                    if ( ')' === c )
                    {
                        if ( 0 === paren ) break;
                        else paren--;
                    }
                    s += c;
                    if ( ('0' > c) || ('9' < c) ) is_constant = false;
                    if ( ('(' === c) || (')' === c) ) is_reference = false;
                }
                s = trim(s);
                
                if ( !s.length )
                {
                    // any term
                    n = 1;
                    if ( '{' === tpl.charAt(i) )
                    {
                        // repeat
                        i += 1; s = '';
                        while ( i < l )
                        {
                            c = tpl.charAt(i++);
                            if ( '}' === c ) break;
                            s += c;
                        }
                        n = s.length ? (parseInt(s,10)||1) : 1;
                    }
                    p += n;
                    continue;
                }
                
                if ( is_constant )
                {
                    // constant
                    if ( HAS.call(references, s) )
                    {
                        entry = references[s];
                        entry.pos.push(p);
                    }
                    else
                    {
                        references[s] = entry = {type:"const", pos:[p], key:s, val:parseInt(s,10)};
                        if ( (null === min) || (entry.val < min) ) min = entry.val;
                        if ( (null === max) || (entry.val > max) ) max = entry.val;
                    }
                    positions[p] = entry;
                }
                else
                {
                    // reference or expression
                    if ( HAS.call(references, s) )
                    {
                        entry = references[s];
                        entry.pos.push(p);
                    }
                    else
                    {
                        references[s] = entry = {type:is_reference?"ref":"expr", pos:[p], key:s, val:null, compute:!is_reference};
                        if ( is_reference )
                        {
                            // reference
                            variables.push(s);
                        }
                        else
                        {
                            // expression
                            //entry = build_expression( entry.key, entry, references );
                        }
                    }
                    positions[p] = entry;
                }
                n = 1;
                if ( '{' === tpl.charAt(i) )
                {
                    // repeat
                    i += 1; s = '';
                    while ( i < l )
                    {
                        c = tpl.charAt(i++);
                        if ( '}' === c ) break;
                        s += c;
                    }
                    n = s.length ? parseInt(s,10)||1 : 1;
                }
                p += n;
                if ( ("const" === entry.type) || ("expr" === entry.type) ) fixed += n;
                while(--n)
                {
                    positions[entry.pos[entry.pos.length-1]+1] = entry;
                    entry.pos.push(entry.pos[entry.pos.length-1]+1);
                }
            }
        }
        for(c in references)
        {
            if ( !HAS.call(references,c) || ("expr" !== references[c].type) ) continue;
            build_expression( references[c].key, references[c], references );
        }
        var l = variables.length,
            //even_values = new Array(l),
            //odd_values = new Array(l),
            unique_values = new Array(l),
            desc = !!constraints.desc, applied = {};
        for(j=0,i=0; i<l; i++)
        {
            //even_values[i] = 0; odd_values[i] = 1;
            j = references[variables[i]].pos[0];
            while( (1 === applied[j]) || (HAS.call(references,j) && ("const" === references[j].type)) ) j++;
            unique_values[i] = j;
            applied[j] = 1;
        }
        apply_template_values( references, variables, unique_values );
        check_unique( satisfied, references );
        check_ordered( satisfied, references, desc );
        return {
            fixed       : fixed,
            variables   : variables,
            references  : references,
            positions   : positions,
            constraints : satisfied
        };
    }
    ,REVERSED = 1, REFLECTED = 2
    ,LEX = 4, COLEX = 8, MINIMAL = 16, RANDOM = 32, STOCHASTIC = 64
    ,LEXICAL = LEX | COLEX | MINIMAL, RANDOMISED = RANDOM | STOCHASTIC
    ,ORDERINGS = LEXICAL | RANDOMISED | REVERSED | REFLECTED
    ,UNIQUE = 1, ORDERED = 2, INDEPENDENT = 4
    ,ORDER = function ORDER( o ) {
        if ( !arguments.length || null == o )
        {
            return LEX; // default
        }
        if ( is_string(o) )
        {
            var order = 0, ord = o.toUpperCase( ).split(',');
            for(var i=0,l=ord.length; i<l; i++)
            {
                o = ord[i];
                order |= HAS.call(Abacus.ORDER,o) ? Abacus.ORDER[o] : 0;
            }
            return order > 0 ? order : LEX;
        }
        return ORDERINGS & o ? o : LEX;
    }
    ,CombinatorialIterator, CombinatorialTemplate
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

// list/array/tree/graph utiltities
Node.NODE = 1; Node.PREV = 2; Node.NEXT = 3; Node.LEFT = 4; Node.RIGHT = 5;
//Node.walk = walk;
Abacus.List = {

 Node: Node
,walk: walk

,operate: operate
,map: map
,operation: operation

,sum: sum
,product: product

,kronecker: kronecker
,cartesian: cartesian

,intersection: intersect
,union: merge
,insertion: insert_sort
,sort: mergesort

,shuffle: shuffle
,xshuffle: xshuffle
,multiset_shuffle: multiset_shuffle
,pick: pick

};

// math/rnd utilities
Abacus.Math = {

 O: 0
,I: 1
,J: -1

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
        var arr = this.toArray( );
        return map( a, to_fixed_binary_string_32, 0, arr.length-1, true ).join( '' );
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

Abacus.CombinatorialTest = generate_combinatorial_test;

CombinatorialTemplate = Class({
    
    constructor: function CombinatorialTemplate(tpl) {
        var self = this, klass = self[CLASS];
        if ( !(self instanceof CombinatorialTemplate) ) return new CombinatorialTemplate(tpl);
        self.tpl = tpl||'';
        self.tre = klass.parse( self.tpl );
    }
    
    ,tpl: null
    ,tre: null
    ,data: null
    
    ,dispose: function( ) {
        var self = this;
        self.tpl = null;
        self.tre = null;
        self.data = null;
        return self;
    }
    
    ,tree: function( ) {
        return this.tre;
    }
    
    ,render: function( input, output ) {
        var tpl = this.tre, i, o, li, lo;
        li = input.length; lo = output.length;
        values = new Array(tpl.variables.length);
        for(i=0; i<values.length; i++)
        {
        }
        apply_template_values( tpl.references, tpl.variables, values );
        for(o=0; o<lo; o++)
        {
            if ( HAS.call(tpl.positions,o) )
                output[o] = positions[o].val;
            else
                output[o] = i < li ? input[i++] : o;
        }
        return output;
    }
});
CombinatorialTemplate.parse = parse_combinatorial_template;

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
        ,Template: CombinatorialTemplate
        
        //,TYPE: 0
        
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
        ,I: function( item, n ) {
            return item;
        }
        
        ,count: NotImplemented
        ,rand: function( n, total ) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                tot = null != total ? total : klass.count( n );
            return klass.unrank( Arithmetic.rnd(Arithmetic.O, Arithmetic.sub(tot, Arithmetic.I)), n, tot );
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
    ,_template: null
    
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
        if ( self._template )
        {
            self._template.dispose( );
            self._template = null;
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
    
    ,template: function( ) {
        return this._template ? this._template.tpl||null : null;
    }
    
    ,total: function( ) {
        return this._count;
    }
    
    ,order: function( order, reverse, TM, doubly_stochastic ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I,
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
        tot_1 = Arithmetic.sub(tot, I);
        dir = REVERSED & order ? -1 : 1; // T
        dir = reverse ? -dir : dir; // T
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
        else if ( COLEX & order )
        {
            self.__item = self.item0( -dir, order ); // T
            if ( null != self.__item ) self.__index = -1 === dir ? O : tot_1;
        }
        else /*if ( LEX & order )*/
        {
            self.__item = self.item0( dir, order );
            if ( null != self.__item ) self.__index = -1 === dir ? tot_1 : O;
        }
        self._item = null == self.__item ? null : self.dual( self.__item, STOCHASTIC & order ? null : self.__index, order );
        self._index = reverse && !(RANDOMISED & order) ? tot_1 : O;
        self._prev = (RANDOMISED & order) || !reverse ? false : null != self.__item;
        self._next = reverse && !(RANDOMISED & order) ? false : null != self.__item;
        return self;
    }
    
    ,index: function( index ) {
        if ( !arguments.length ) return this._index;
        
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            klass = self[CLASS], T = klass.T, n = self.n, tot = self._count,
            order = self._order, tot_1, dir = REVERSED & order ? -1 : 1; // T
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( !Arithmetic.equ(index, self._index) && Arithmetic.inside(index, J, tot) )
        {
            tot_1 = Arithmetic.sub(tot, I);
            if ( COLEX & order )
            {
                self.__index = -1 === dir ? index : Arithmetic.sub(tot_1, index);
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? self.item0( -dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( self.__index, n, tot ));
                self._item = self.dual( self.__item, self.__index, order );
                self._prev = null != self.__item;
                self._next = null != self.__item;
            }
            else if ( !(RANDOMISED & order) )
            {
                self.__index = -1 === dir ? Arithmetic.sub(tot_1, index) : index;
                self._index = index;
                self.__item = Arithmetic.equ(O, index)
                ? self.item0( dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( -dir, order )
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
            klass = self[CLASS], T = klass.T, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J;
        order = null != order ? ORDER( order ) : self._order;
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( (order === self._order) && Arithmetic.equ(index, self._index) ) return self._item;
        
        if ( Arithmetic.inside(index, J, tot) )
        {            
            dir = REVERSED & order ? -1 : 1;
            tot_1 = Arithmetic.sub(tot, I);
            if ( RANDOM & order )
            {
                indx = self.randomIndex( );
                return self.dual(
                    klass.unrank( indx, n, tot )
                    /*klass.rand( n, tot )*/
                    , indx, order
                );
            }
            else if ( COLEX & order )
            {
                indx = -1 === dir ? index : Arithmetic.sub(tot_1, index);
                return self.dual( Arithmetic.equ(O, index)
                ? self.item0( -dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( dir, order )
                : klass.unrank( indx, n, tot )), indx, order );
            }
            else /*if ( LEX & order )*/
            {
                indx = -1 === dir ? Arithmetic.sub(tot_1, index) : index;
                return self.dual( Arithmetic.equ(O, index)
                ? self.item0( dir, order )
                : (Arithmetic.equ(tot_1, index)
                ? self.item0( -dir, order )
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
            C = klass.C, P = klass.P, T = klass.T, G = klass.G, I = klass.I,
            reflected = REFLECTED & order;
        
        if ( STOCHASTIC & order )
            return item
            ;
        else if ( RANDOM & order )
            return reflected
                ? P( I( item, n ), n )
                : I( item, n )
            ;
        else if ( MINIMAL & order )
            return reflected
                ? P( I( G( item, n ), n ), n )
                : I( G( item, n ), n )
            ;
        else if ( COLEX & order )
            return reflected
                ? I( C( item, n ), n )
                : P( I( C( item, n ), n ), n )
            ;
        else /*if ( LEX & order )*/
            return reflected
                ? P( I( item, n ), n )
                : I( copy( item ), n )
            ;
    }
    
    ,randomIndex: function( m, M ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tot = self._count, argslen = arguments.length;
        if ( 0 === argslen )
        {
            m = O;
            M = Arithmetic.sub(tot, I);
        }
        else if ( 1 === argslen )
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
            : klass.unrank(Arithmetic.add(/*klass.rank(item, n, total)*/index, 0>dir?Arithmetic.J:Arithmetic.I), n, total)
        ;
    }
    
    // some C-P-T processes at play here as well, see below
    ,next: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            order = self._order, traversed, r, dir, klass = self[CLASS], T = klass.T,
            current = self._item, n = self.n, tot = self._count, tot_1, rs;
        
        if ( STOCHASTIC & order )
        {
            self.__item = klass.stochastic( self._stochastic[0], n, self._stochastic[2] );
        }
        else if ( RANDOM & order )
        {
            tot_1 = Arithmetic.sub(tot, I);
            if ( Arithmetic.lt(self._index, tot_1) )
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
                    // get next un-traversed index, reject if needed
                    r = self.randomIndex( );
                    rs = Abacus.Math.rnd( ) > 0.5 ? J : I;
                    while ( traversed.isset( r ) ) r = Arithmetic.wrap( Arithmetic.add(r, rs), O, tot_1 );
                    traversed.set( r );
                    self.__item = klass.unrank( r, n, tot );
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
            dir = REVERSED & order ? -1 : 1; // T
            // compute next, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
            if ( COLEX & order )
            {
                self.__item = self.succ( -dir, self.__item, self.__index, order );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 < dir ? J : I);
            }
            else /*if ( LEX & order )*/
            {
                self.__item = self.succ( dir, self.__item, self.__index, order );
                if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 > dir ? J : I);
            }
        }
        self._item = null == self.__item ? null : self.dual( self.__item, STOCHASTIC & order ? null : self.__index, order );
        self._next = null != self.__item;
        if ( self._next && !(STOCHASTIC & order) ) self._index = Arithmetic.add(self._index, I);
        return current;
    }
    
    // some C-P-T processes at play here as well, see below
    ,prev: function( ) {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, J = Arithmetic.J,
            order = self._order, dir, klass = self[CLASS], T = klass.T,
            current = self._item, n = self.n, tot = self._count;
        
        // random and stochastic order has no prev
        if ( RANDOMISED & order ) return null;
        
        dir = REVERSED & order ? -1 : 1; // T
        // compute prev, using successor methods / loopless algorithms, WITHOUT using big integer arithemtic
        if ( COLEX & order )
        {
            self.__item = self.succ( dir, self.__item, self.__index, order );
            if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 > dir ? J : I);
        }
        else /*if ( LEX & order )*/
        {
            self.__item = self.succ( -dir, self.__item, self.__index, order );
            if ( null != self.__item ) self.__index = Arithmetic.add(self.__index, 0 < dir ? J : I);
        }
        self._item = null == self.__item ? null : self.dual( self.__item, self.__index, order );
        self._prev = null != self.__item;
        if ( self._prev ) self._index = Arithmetic.sub(self._index, I);
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tmp, tot = self._count, range, count, i, iter_state, dir = 1,
            argslen = arguments.length, tot_1 = Arithmetic.sub(tot, I),
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
        CombinatorialIterator.call(self, [n, is_array(multiset)&&multiset.length ? multiset : false]);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, -1 );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: function( item, n ) {
            return gray_encode( item, -1 );
        }
        ,I: function( item, n ) {
            return null == item ? null : inversion2permutation( item );
        }
        
        ,count: function( n ) {
            if ( n[1] )
            {
                var i, l = n[1].length, m = new Array(l); m[0] = n[0];
                for(i=1; i<l; i++) m[i] = n[1][i].length;
                return Abacus.Math.Multinomial( m );
            }
            else
            {
                return Abacus.Math.Factorial( n[0] );
            }
        }
        ,rand: function( n ) {
            var klass = this;
            return is_array(n) ? klass.randInv( n[0] ) : klass.randPerm( n );
        }
        ,randPerm: function( n ) {
            // return a random permutation
            var item = new Array(n), i;
            for (i=0; i<n; i++) item[i] = i;
            return shuffle( item, false, false );
        }
        ,randInv: function( n ) {
            // return a random inversion vector
            var rndInt = Abacus.Math.rndInt, i, item = new Array(n);
            for (n=n-1,i=0; i<n; i++) item[ i ] = rndInt(0, n-i);
            item[ n ] = 0;
            return item;
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
            var klass = this;
            return is_array(n) ? klass.rankInv( item, n[0] ) : klass.rankPerm( item, n || item.length );
        }
        ,unrank: function( index, n, total ) { 
            var klass = this;
            return is_array(n) ? klass.unrankInv( index, n[0], total ) : klass.unrankPerm( index, [n || item.length], total );
        }
        ,rankInv: function( item, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, i, m;
            if ( !n ) return Arithmetic.J;
            for (index=Arithmetic.O,m=n-1,i=0; i<m; i++) index = Arithmetic.add(Arithmetic.mul(index, n-i), item[ i ]);
            return index;
        }
        ,unrankInv: function( index, n, total ) { 
            var Arithmetic = Abacus.Arithmetic, r, b, i, t, item;
            if ( !n ) return [ ];
            item = new Array( n );
            item[ n-1 ] = 0;
            for (r=index,i=n-2; i>=0; i--)
            {
                b = n-i;
                t = Arithmetic.mod(r, b);
                r = Arithmetic.div(r, b);
                item[ i ] = Arithmetic.val(t);
            }
            return item;
        }
        ,rankPerm: function( item, n ) {
            // O(n log n) uniform lexicographic ranking.
            //n = n[0];
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
                    T[node] = Arithmetic.add(T[node],I);
                    node >>>= 1;
                }
                T[node] = Arithmetic.add(T[node],I);
                index = Arithmetic.add(Arithmetic.mul(index, N(n-i)), ctr);
            }
            return index;
        }
        ,unrankPerm: function( index, n, total ) {
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
                    T[node] = Arithmetic.sub(T[node],I);
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
        ,inverse: inverse_permutation
        ,product: function( /* permutations */ ) {
            var perm = arguments, nperms = perm.length, 
                composed = nperms ? perm[0] : [],
                n = composed.length, i, p, comp;
            for (p=1; p<nperms; p++)
            {
                comp = composed.slice( );
                for (i=0; i<n; i++) composed[ i ] = comp[ perm[ p ][ i ] ];
            }
            return composed;
        }
        ,permute: function( arr, permutation, copied ) {
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
            for (i=0; i<l; i++) p[i] = a[permutation[i]];
            return p;
        }
        ,toCycles: function( permutation ) {
            return permutation2cycles( permutation );
        }
        ,toSwaps: function( permutation ) {
            return permutation2swaps( permutation );
        }
        ,fromSwaps: function( swaps, n ) {
            return swaps2permutation( swaps, n );
        }
        ,toInversion: function( permutation ) {
            return permutation2inversion( permutation );
        }
        ,fromInversion: function( inversion ) {
            return inversion2permutation( inversion );
        }
        ,toMatrix: function( permutation, bycolumns ) {
            return permutation2matrix( permutation, bycolumns );
        }
        ,fromMatrix: function( matrix, bycolumns ) {
            return matrix2permutation( matrix, bycolumns );
        }
    }
    /*,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, k = n[0], i, item = new Array( k );
        for (i=0; i<k; i++) item[i] = i;
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
        if ( item )
        {
            var n = this.n[0], k, kl, l, r, s, next = item.slice();
            
            if ( 0 > dir )
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
            else
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
    }*/
    // use an inversion vector representation, instead of actual permutation representation
    // it facilitates other functionalities as well, eg minimal/gray encoding and so on..
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, i, nd = n[0], item = new Array( nd );
        for (i=0; i<nd; i++) item[ i ] = 0;
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var n = this.n[0], i, j, next = item.slice();
            
            if ( 0 > dir )
            {
                // C of item
                i = n-1;
                while ( i >=0 && next[i]-1 < 0 ) i--;
                if ( 0 <= i )
                {
                    next[i]--;
                    for (j=i+1; j<n; j++) next[j] = n-1-j;
                }
                else
                {
                    // last item
                    next = null;
                }
                // invC of item
            }
            else
            {
                i = n-1;
                while ( i >=0 && next[i]+1 === n-i ) i--;
                if ( 0 <= i )
                {
                    next[i]++;
                    for (j=i+1; j<n; j++) next[j] = 0;
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

// https://en.wikipedia.org/wiki/Combinations
Combination = Abacus.Combination = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k, type/*, template*/ ) {
        var self = this;
        if ( !(self instanceof Combination) ) return new Combination(n, k, type/*, template*/);
        /*if ( is_string(template)&&template.length )
        {
            var tpl = CombinatorialTemplate(template), orig_n = [n, k];
            if ( !tpl.tre.unique || !tpl.tre.ordered )
            {
            }
            else
            {
            }
            self._template = tpl;
        }
        else
        {
            self._template = null;
        }*/
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
        ,I: CombinatorialIterator.I
        
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
                    // O(klogk) average-case, unbiased
                    item = new Array(k);
                    for(i=0; i<k; i++)
                        // select uniformly with repetition
                        // insert the selected in sorted place
                        //item = insert_sort( item, rndInt(0, c) );
                        item[i] = rndInt(0, c);
                    mergesort(item);
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
                    selected = {}; excluded = new Array(n_k);
                    for(i=0; i<n_k; i++)
                    {
                        // select uniformly without repetition
                        selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = rndInt(0, c);
                        selected[selection] = 1;
                        // insert the selected in sorted place
                        //excluded = insert_sort( excluded, selection );
                        excluded[i] = selection;
                    }
                    // get the complement
                    item = complement( mergesort(excluded), n );
                }
                else
                {
                    // O(klogk) average-case, unbiased
                    selected = {}; item = new Array(k);
                    for(i=0; i<k; i++)
                    {
                        // select uniformly without repetition
                        selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while ( 1 === selected[selection] ) selection = rndInt(0, c);
                        selected[selection] = 1;
                        // insert the selected in sorted place
                        //item = insert_sort( item, selection );
                        item[i] = selection;
                    }
                    mergesort(item);
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
            return sub(sub(binom,Arithmetic.I),index);
        }
        ,unrank: function( index, n, total ) {
            var Arithmetic = Abacus.Arithmetic,
                NN = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
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
            index = Arithmetic.sub(Arithmetic.sub(binom,I),index);
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
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var n_ = this.n, repeated = n_[2], k = n_[1], n = n_[0],
                i, index, limit, curr, ofs = repeated ? 0 : 1, next = item.slice();
            
            if ( 0 > dir )
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
            else
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
         C: function( item, n ) {
            return complement( item, n );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,G: CombinatorialIterator.G
        ,I: CombinatorialIterator.I
        
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
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, subset = [], i = 0;
            if ( !Arithmetic.inside(index, Arithmetic.J, null!=total ? total : klass.count(n)) ) return null;
            while ( Arithmetic.gt(index, O) )
            {
                // loop unrolling
                if ( Arithmetic.gt(Arithmetic.band(index,1),O) ) subset.push( i );
                if ( Arithmetic.gt(Arithmetic.band(index,2),O) ) subset.push( i+1 );
                if ( Arithmetic.gt(Arithmetic.band(index,4),O) ) subset.push( i+2 );
                if ( Arithmetic.gt(Arithmetic.band(index,8),O) ) subset.push( i+3 );
                if ( Arithmetic.gt(Arithmetic.band(index,16),O) ) subset.push( i+4 );
                if ( Arithmetic.gt(Arithmetic.band(index,32),O) ) subset.push( i+5 );
                if ( Arithmetic.gt(Arithmetic.band(index,64),O) ) subset.push( i+6 );
                if ( Arithmetic.gt(Arithmetic.band(index,128),O) ) subset.push( i+7 );
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
                ? P( G( item, n ), n )
                : G( item, n )
            ;
        else
            return reflected
                ? P( item, n )
                : copy( item )
            ;
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS];
        return 0 > dir ? klass.C( [], self.n ) : [];
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
        ,I: CombinatorialIterator.I
        
        ,count: function( n ) {
             n = n[0];
             var partitions = Abacus.Math.Partitions, add = Abacus.Arithmetic.add,
                p = Abacus.Arithmetic.N(n > 1 ? 2 : 1), k, m;
             for (k=2; k<n; k++) 
                 for (m=n-k+1; m>=1; m--)
                    p = add(p, partitions(n, k, m));
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
            return null;
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
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var n = this.n[0], i, c, p1, p2, summa, rem, next = item.slice();
            
            if ( 0 > dir )
            {
                // C of item
                // compute prev partition
                if ( next[0] > 1 )
                {
                    c = next.length;
                    // break into a partition with last part reduced by 1 from previous partition series
                    i = c-1;
                    while (i>=0 && 1 === next[i]) i--;
                    p1 = --next[i]; ++i;
                    // truncate
                    //next = next.slice(0, i);
                    next.length = i;
                    for(summa=0; i>=0; i--) summa += next[i];
                    rem = n - summa;
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
            else
            {
                // compute next partition
                if ( next[0] < n )
                {
                    c = next.length;
                    i = c-1; if (i>0) i--;
                    while (i>0 && next[i] === next[i-1]) i--;
                    ++next[i]; ++i;
                    // truncate
                    //next = next.slice( 0, i );
                    next.length = i;
                    for(summa=0; i>=0; i--) summa += next[i];
                    rem = n - summa;
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
        ,I: CombinatorialIterator.I
        
        ,count: function( n ) {
             return !n || !n.length ? 0 : product( n );
        }
        ,rand: function( n ) {
            var rndInt = Abacus.Math.rndInt, i, nd = n.length, item = new Array(nd);
            for (i=0; i<nd; i++) item[ i ] = rndInt(0, n[ i ]-1);
            return item;
        }
        ,stochastic: CombinatorialIterator.stochastic
        ,rank: function( item, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, nd = n.length, i;
            if ( !nd ) return Arithmetic.J;
            for (index=Arithmetic.O,i=0; i<nd; i++) index = Arithmetic.add(Arithmetic.mul(index, n[ i ]), item[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, b, i, t, item, nd = n.length;
            if ( !nd ) return [ ];
            item = new Array( nd );
            for (r=index,i=nd-1; i>=0; i--)
            {
                b = n[ i ];
                t = Arithmetic.mod(r, b);
                r = Arithmetic.div(r, b);
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
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var d = this.n, i, j, next = item.slice(), nd = d.length;
            
            if ( 0 > dir )
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
            else
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
        ,I: CombinatorialIterator.I
        
        ,count: function( n ) {
             return Abacus.Math.Exp( n[1], n[0] );
        }
        ,rand: function( n ) {
            var rndInt = Abacus.Math.rndInt, i, k = n[0], b = n[1]-1, item = new Array(k);
            for (i=0; i<k; i++) item[ i ] = rndInt(0, b);
            return item;
        }
        ,stochastic: Tensor.stochastic
        ,rank: function( item, n ) { 
            var Arithmetic = Abacus.Arithmetic, index, k = n[0], b = n[1], i;
            for (index=Arithmetic.O,i=0; i<k; i++) index = Arithmetic.add(Arithmetic.mul(index, b), item[ i ]);
            return index;
        }
        ,unrank: function( index, n ) { 
            var Arithmetic = Abacus.Arithmetic, r, b = n[1], i, t, item, k = n[0];
            item = new Array( k );
            for (r=index,i=k-1; i>=0; i--)
            {
                t = Arithmetic.mod(r, b);
                r = Arithmetic.div(r, b);
                item[ i ] = Arithmetic.val(t);
            }
            return item;
        }
    }
    ,item0: function( dir, order ) {
        var self = this, klass = self[CLASS],
            n = self.n, i, k = n[0], item = new Array( k );
        for (i=0; i<k; i++) item[ i ] = 0;
        return 0 > dir ? klass.C( item, n ) : item;
    }
    ,succ: function( dir, item, index, order ) {
        if ( item )
        {
            var n_ = this.n, i, j, next = item.slice(), k = n_[0], n = n_[1];
            
            if ( 0 > dir )
            {
                // C of item
                i = k-1;
                while ( i >=0 && next[i]-1 < 0 ) i--;
                if ( 0 <= i )
                {
                    next[i]--;
                    n--;
                    for (j=i+1; j<k; j++) next[j] = n;
                }
                else
                {
                    // last item
                    next = null;
                }
                // invC of item
            }
            else
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
