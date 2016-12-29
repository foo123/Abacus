/**
*
*   Abacus
*   A combinatorics library for Node/XPCOM/JS, PHP, Python
*   @version: 0.5.1
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

var  Abacus = {VERSION: "0.5.1"}, PROTO = 'prototype', CLASS = 'constructor'
    ,slice = Array.prototype.slice, HAS = Object[PROTO].hasOwnProperty, toString = Object[PROTO].toString
    ,trim_re = /^\s+|\s+$/g
    ,trim = String.prototype.trim
        ? function( s ){ return s.trim(); }
        : function( s ){ return s.replace(trim_re, ''); }
    ,is_array = function( x ) { return (x instanceof Array) || ('[object Array]' === toString.call(x)); }
    ,is_string = function( x ) { return (x instanceof String) || ('[object String]' === toString.call(x)); }
    ,log2 = Math.log2 || function(x) { return Math.log(x) / Math.LN2; }
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
    
    ,CombinatorialIterator
    ,Permutation//, Derangement, Involution, MultisetPermutation
    ,Combination//, CombinationRepeat
    ,Partition//, RestrictedPartition//, SetPartition
    ,Subset
    ,Tensor, Tuple
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
// C process / symmetry
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
// P process / symmetry
function parity( a )
{
    if ( null == a ) return null;
    for(var l=a.length-1,b=new Array(l+1),i=0; i<=l; i++) b[i] = a[l-i];
    return b;
}
// T process / symmetry
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
    return Arithmetic.shl(Arithmetic.I, Arithmetic.N( n ));//(1 << n)>>>0;
}
function exp( n, k )
{
    var Arithmetic = Abacus.Arithmetic;
    return Arithmetic.pow(Arithmetic.N( n ), Arithmetic.N( k ));
}
function factorial( n, m )
{
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I,
        NUM = Arithmetic.N, add = Arithmetic.add, sub = Arithmetic.sub,
        div = Arithmetic.div, mul = Arithmetic.mul,
        N, k, Nk, l, key;
    if ( null == m )
    {
        // simple factorial
        // http://www.luschny.de/math/factorial/index.html
        n = NUM( n );
        if ( Arithmetic.lt( n, 0 ) ) return O;
        else if ( Arithmetic.lt( n, 2 ) ) return I;
        // 2=>2 or 3=>6
        else if ( Arithmetic.lt( n, 4 ) ) return Arithmetic.shl( n, Arithmetic.sub( n, 2 ) )/*n<<(n-2)*/;
        key = String(n);
        if (null == factorial.fac[key] ) factorial.fac[key] = operate(mul, I, null, 2, n);
        return factorial.fac[key];
    }
    else if ( -1 === m )
    {
        // involutions factorial
        Nk = NUM( n );
        return operate(function(N, k){
            return Nk === N ? N : sub(mul(N, k), N);
        }, Nk, null, n, 1, -1);
    }
    else if ( -2 === m )
    {
        // derangement sub-factorial
        key = String(n);
        if (null == factorial.sub[key] )
        {
            factorial.sub[key] = operate(function(N, k){
                N[1] = -1 === N[2] ? sub(N[1], N[0]) : add(N[1], N[0]);
                N[2] = -N[2];
                if ( k > 1 && k <= n ) N[0] = mul(N[0], k);
                return k > n ? N[1] : N;
            }, [I, O, 1], null, 0, n+1);
        }
        return factorial.sub[key];
    }
    else if ( is_array(m) )
    {
        // multinomial
        if ( 1 === m.length ) return factorial(n, m[0]); /* binomial */
        key = String(n)+'@'+m.join(',');
        if ( null == factorial.nom[key] )
        {
            N = factorial( m[0] ); l = m.length; Nk = I;
            for(k=1; k<l; k++) Nk = mul( Nk, factorial( m[k] ) );
            factorial.nom[key] = div( N, Nk );
        }
        return factorial.nom[key];
    }
    else if ( +m === m )
    {
        // binomial
        if ( m > n-m  ) m = n-m; // take advantage of symmetry
        if ( (0 > m) || (1 > n) ) return O;
        else if ( (0 === m) || (1 === n) ) return I;
        else if ( 1 === m ) return NUM( n );
        key = String(n)+'@'+String(m);
        if ( null == factorial.nom[key] )
        {
            n = n-m; Nk = NUM( 1+n );
            //for (i=2; i<=m; i++) Cnk *= 1 + n_m/i;
            for (k=2; k<=m; k++) Nk = mul(Nk, 1+n/k);
            factorial.nom[key] = Arithmetic.round( Nk );
        }
        return factorial.nom[key];
    }
    return O;
}
factorial.fac = {};
factorial.sub = {};
factorial.nom = {};
function partitions( n, k, m )
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // compute number of integer partitions of n
    // into exactly k parts having m as max value
    // m + k-1 <= n <= k*m
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;
    if ( ((m === n) && (1 === k)) || ((k === n) && (1 === m)) ) return I;
    if ( (m+k > n+1) || (k*m < n) ) return O;
    // compute it directly
    var math = Abacus.Math,
        add = Arithmetic.add, j,
        jmax = math.min(m,n-m-k+2),
        jmin = math.max(1,math.ceil((n-m)/(k-1))),
        p = O, tk;
    for (j=jmin; j<=jmax; j++)
    {
        tk = String(n-m)+','+String(k-1)+','+String(j);
        // memoize here
        if ( null == partitions.tbl[tk] ) partitions.tbl[tk] = partitions( n-m, k-1, j );
        p = add(p, partitions.tbl[tk]);
    }
    tk = String(n)+','+String(k)+','+String(m);
    if ( null == partitions.tbl[tk] ) partitions.tbl[tk] = p;
    return p;
}
partitions.tbl = {};
function intersect( a, b, reverse )
{
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
function complement( n, a, b )
{
    if ( null == a ) return null;
    var b, i, ai, bi, k = a.length, l = n-k;
    if ( (n <= 0) || (l <= 0) ) return b || [];
    b = b || new Array( l ); i=0; ai=0; bi=0;
    while( (bi < l) && (i < n) )
    {
        if ( (ai >= k) || (i !== a[ai]) ) b[bi++] = i;
        i++; ai++;
    }
    return b;
}
function merge( a, b, a0, a1, b0, b1, union, reverse, unique, inplace )
{
    unique = false !== unique;
    reverse = -1 === reverse ? 1 : 0;
    if ( null == a0 ) a0 = 0;
    if ( null == a1 ) a1 = a.length-1;
    if ( null == b0 ) b0 = 0;
    if ( null == b1 ) b1 = b.length-1;
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
    if ( true === inplace )
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
function mergesort( a/*, reverse*/ )
{
    var N = a.length;
    // in-place
    if ( 1 >= N ) return a;
    var logN = N, j, n, size = 1, size2 = 2, min = Abacus.Math.min, aux = new Array(N);
    while ( logN )
    {
        n = N-size;
        for (j=0; j<n; j+=size2)
            merge(a, a, j, j+size-1, j+size, min(j+size2-1, N-1), aux, false/*reverse*/, false, true);
        size <<= 1; size2 <<= 1; logN >>= 1;
    }
    return a;
}
function shuffle( a, cyclic, copied, included )
{
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
    var rndInt = Abacus.Math.rndInt,
        N, perm, swap, ac, offset;
    ac = true === copied ? a.slice() : a;
    offset = true === cyclic ? 1 : 0;
    if ( included )
    {
        N = included.length;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = ac[ included[N] ]; 
            ac[ included[N] ] = ac[ included[perm] ]; 
            ac[ included[perm] ] = swap; 
        }
    }
    else
    {
        N = ac.length;
        while ( offset < N-- )
        { 
            perm = rndInt( 0, N-offset ); 
            swap = ac[ N ]; 
            ac[ N ] = ac[ perm ]; 
            ac[ perm ] = swap; 
        }
    }
    // in-place or copy
    return ac;
}
function pick( a, k, repeated, sorted, backup )
{
    // http://stackoverflow.com/a/32035986/3591273
    var rndInt = Abacus.Math.rndInt,
        picked, i, selected, value, n = a.length;
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
    
    // partially shuffle the array, and generate unbiased selection simultaneously
    // this is a variation on fisher-yates-knuth shuffle
    for (i=0; i<k; i++) // O(k) times
    { 
        selected = rndInt( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
        value = a[ selected ];
        a[ selected ] = a[ n ];
        a[ n ] = value;
        picked[ i ] = value;
        backup && (backup[ i ] = selected);
    }
    if ( backup )
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
function conjugatepartition( a )
{
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
function packpartition( partition )
{
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
function unpackpartition( packed )
{
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
function partition2sets( partition )
{
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
function sets2partition( set_partition )
{
    var partition, k, l = set_partition.length;
    partition = new Array( l );
    for (k=0; k<l; k++)
        partition[ k ] = set_partition[k].length;
    return partition;
}
function permutation2inversion( permutation )
{
    // O(n log n) inversion computation
    var n = permutation.length, i, j, inversion = new Array(n),
        node, ctr, k = Abacus.Math.ceil(log2(n)),
        Tl = (1<<(1+k))-1, T = new Array(Tl), twok = 1 << k;
    for(i=0; i<Tl; i++) T[i] = 0;
    for(i=0; i<n; i++)
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
        inversion[i] = ctr;
    }
    return inversion;
}
function inversion2permutation( inversion )
{
    // O(n log n) permutation computation
    var n = inversion.length, permutation = new Array(n),
        i, j, i2, digit, node, k, Tl, T, twok;
    
    k = Abacus.Math.ceil(log2(n)); Tl = (1<<(1+k))-1;
    T = new Array(Tl); twok = 1 << k;
    
    for (i=0; i<=k; i++)
        for (j=1,i2=1<<i; j<=i2; j++) 
            T[i2-1+j] = 1 << (k-i);
    
    for (i=0; i<n; i++)
    {
        digit = inversion[i]; 
        node = 1;
        for (j=0; j<k; j++)
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
        permutation[i] = node - twok;
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
        for (j=c-1; j>=1; j--) swaps[slen++] = [cycle[0],cycle[j]];
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
    for (i=0,l=cycles.length; i<l; i++) slen = cycle2swaps( cycles[i], swaps, slen );
    if ( slen < swaps.length ) swaps.length = slen; // truncate
    return swaps;
}
function swaps2permutation( swaps, n )
{
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
function permutation2matrix( permutation, transposed )
{
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
function matrix2permutation( matrix, transposed )
{
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
function permutation2inverse( permutation )
{
    var n = permutation.length, i, inv_permutation = new Array(n);
    for (i=0; i<n; i++) inv_permutation[permutation[i]] = i;
    return inv_permutation;
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
function permutationproduct( permutations )
{
    var perm = permutations/*1 === arguments.length && is_array(arguments[0]) ? arguments[0] : arguments*/,
        nperms = perm.length, 
        composed = nperms ? perm[0] : [],
        n = composed.length, i, p, comp;
    for (p=1; p<nperms; p++)
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
function is_identity( perm )
{
    for(var n=perm.length,i=0; i<n; i++) if ( perm[i] !== i ) return false;
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
function has_cycle( perm, k, strict )
{
    var cycle = permutation2cycles( perm, false ), n = cycle.length, i;
    strict = false !== strict;
    for(i=0; i<n; i++) if ( (strict && cycle[i].length === k) || (!strict && cycle[i].length >= k) ) return true;
    return false;
}
function next_permutation( item, N, dir )
{
    // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
    if ( item )
    {
        var n = N, k, kl, l, r, s, next = item.slice();
        
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
}
function next_combination( item, N, dir, repeated )
{
    if ( item )
    {
        var k = N[1], n = N[0],
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
function next_tensor( item, N, dir )
{
    if ( item )
    {
        var i, j, next = item.slice(), d = N, nd = d.length;
        
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
function next_tuple( item, N, dir )
{
    if ( item )
    {
        var i, j, next = item.slice(), k = N[0], n = N[1];
        
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
function next_partition( item, N, dir, K, M )
{
    if ( item )
    {
        var n = N, i, c, m, p1, p2, summa, rem, next = item.slice();
        
        if ( 0 > dir )
        {
            // C of item
            // compute prev partition
            if ( K )
            {
                m = M ? M : Math.ceil(n/K);
                if ( next[0] > m )
                {
                    c = 1; summa = 0;
                    while (c<K && next[c]+1 >= next[0]) { c++; }
                    next[c]++;
                    for(i=1; i<c; i++) { next[i] = next[c]; summa += next[i]; }
                    for(i=c; i<K; i++) { summa += next[i]; }
                    next[0] = n-summa;
                }
                // if partition is the number itself it is the final partition
                else 
                { 
                    next = null; 
                }
            }
            else
            {
                m = M ? M+1 : 1;
                if ( next[0] > m )
                {
                    c = next.length;
                    // break into a partition with last part reduced by 1 from previous partition series
                    i = c-1;
                    while (i>=0 && 1 === next[i]) i--;
                    p1 = next[i]-1;
                    next = next.slice(0, i+1);
                    next[ i ] = p1;
                    for(summa=0,i=0,c=next.length; i<c; i++) summa += next[i];
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
            // invC of item
        }
        else
        {
            // compute next partition
            if ( K )
            {
                m = M ? M : n-K+1;
                if ( next[0] < m )
                {
                    c = K-1;
                    while (c>0 && 1 === next[c] ) { c--; }
                    i = c;
                    while(i>0 && next[i-1] === next[c] ) i--;
                    if ( i === c ) i = 0;
                    next[c]--; next[i]++;
                }
                // if partition is the number itself it is the final partition
                else 
                { 
                    next = null; 
                }
            }
            else
            {
                m = M ? M : n;
                if ( next[0] < m )
                {
                    c = next.length;
                    i = c-1; if (i>0) i--;
                    while (i>0 && next[i] === next[i-1]) i--;
                    next[i]++;
                    next = next.slice( 0, i+1 );
                    for(summa=0,i=0,c=next.length; i<c; i++) summa += next[i];
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
        }
        return next;
    }
    return null;
}

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
/*,GRAY: MINIMAL
,MINIMAL: MINIMAL*/

};

// math/rnd utilities
Abacus.Util = {
    
    intersect: intersect
   ,merge: merge
   ,complement: complement
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
    
    constructor: function CombinatorialIterator( n, $ ) {
        var self = this, klass = self[CLASS];
        self.n = n || 0;
        self.$ = $ = $ || {};
        $.type = String($.type || "combinatorial").toLowerCase();
        $.order = $.order || LEX; // default order is lexicographic ("lex")
        $.count = klass.count( self.n, self.$ );
        self.order( $.order ); 
    }
    
    ,__static__: {
         Iterable: function CombinatorialIterable( iter ) {
            var self = this;
            if ( !(self instanceof CombinatorialIterable) ) return new CombinatorialIterable( iter );
            self.next = function( ) {
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
        
        ,count: NotImplemented
        ,initial: NotImplemented
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T processes at play here
            var klass = this, order = $ && $.order ? $.order : 0,
                C = klass.C, P = klass.P, T = klass.T;
            if ( RANDOM & order ) return REFLECTED & order ? P( item, n ) : item;
            else if ( COLEX & order ) return REFLECTED & order ? C( item, n ) : P( C( item, n ), n );
            else/*if ( LEX & order )*/return REFLECTED & order ? P( item, n ) : item.slice( );
        }
        ,succ: function( dir, item, index, n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic;
            return null == item
                ? null
                : klass.unrank(Arithmetic.add(index, 0>dir?Arithmetic.J:Arithmetic.I), n, $)
            ;
        }
        ,rand: function( n, $ ) {
            var klass = this, Arithmetic = Abacus.Arithmetic, total = $ && $.count ? $.count : klass.count(n, $);
            return klass.unrank(Arithmetic.rnd(Arithmetic.O, Arithmetic.sub(total, Arithmetic.I)), n, $);
        }
    }
    
    ,n: 0
    ,m: null
    ,i: null
    ,$: null
    ,__index: null
    ,_index: null
    ,__item: null
    ,_item: null
    ,_prev: null
    ,_next: null
    ,_traversed: null
    
    ,dispose: function( ) {
        var self = this;
        self.n = null;
        self.m = null;
        self.i = null;
        self.$ = null;
        self.__index = null;
        self._index = null;
        self.__item = null;
        self._item = null;
        self._prev = null;
        self._next = null;
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
         self.n
        ,self.m
        ,self.i
        ,self.$.order
        ,self.__index
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
        self.n = state[0];
        self.m = state[1];
        self.i = state[2];
        self.$.order = state[3];
        self.__index = state[4];
        self._index = state[5];
        self.__item = state[6];
        self._item = state[7];
        self._prev = state[8];
        self._next = state[9];
        }
        return self;
    }
    
    ,total: function( ) {
        return this.$.count || 0;
    }
    
    ,order: function( order, reverse ) {
        if ( !arguments.length ) return this._order;
        
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I,
            klass = self[CLASS], T = klass.T, r, tot, tot_1, n, $, dir;
        
        reverse = -1 === reverse;
        
        order = ORDER( order );
        n = self.n; $ = self.$; tot = $.count;
        tot_1 = Arithmetic.sub(tot, I);
        dir = REVERSED & order ? -1 : 1; // T
        dir = reverse ? -dir : dir; // T
        $.order = order;
        self.__index = self._index = O;
        self._item = self.__item = null;
        self._prev = false; self._next = false;
        
        if ( RANDOM & order )
        {
            if ( Arithmetic.gt(tot, 1000000) )
            {
                // too big to keep in memory
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
            self.__item = klass.unrank( r, n, $ );
            if ( null != self.__item ) self.__index = r;
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
        self._prev = (RANDOM & order) || !reverse ? false : null != self.__item;
        self._next = reverse && !(RANDOM & order) ? false : null != self.__item;
        return self;
    }
    
    ,index: function( index ) {
        if ( !arguments.length ) return this._index;
        
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            klass = self[CLASS], T = klass.T, n = self.n, $ = self.$, tot = $.count,
            order = $.order, tot_1, dir = REVERSED & order ? -1 : 1; // T
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( !Arithmetic.equ(index, self._index) && Arithmetic.inside(index, J, tot) )
        {
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
        }
        return self;
    }
    
    ,item: function( index, order ) {
        if ( !arguments.length ) return this._item;
        
        var self = this, n = self.n, $ = self.$, tot = $.count, tot_1, dir, indx,
            klass = self[CLASS], T = klass.T, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, o, ret;
        order = null != order ? ORDER( order ) : $.order;
        
        index = Arithmetic.wrapR(Arithmetic.N( index ), tot);
        
        if ( (order === $.order) && Arithmetic.equ(index, self._index) ) return self._item;
        
        if ( Arithmetic.inside(index, J, tot) )
        {            
            dir = REVERSED & order ? -1 : 1;
            tot_1 = Arithmetic.sub(tot, I);
            if ( RANDOM & order )
            {
                indx = self.randomIndex( );
                o = $.order; $.order = order;
                ret =  klass.dual(
                    klass.unrank( indx, n, $ )
                    /*klass.rand( n, tot )*/
                    , indx, n, $
                );
                $.order = o;
                return ret;
            }
            else if ( COLEX & order )
            {
                indx = -1 === dir ? index : Arithmetic.sub(tot_1, index);
                o = $.order; $.order = order;
                ret = klass.dual( Arithmetic.equ(O, index)
                ? klass.initial( -dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( dir, n, $ )
                : klass.unrank( indx, n, $ )), indx, n, $ );
                $.order = o;
                return ret;
            }
            else /*if ( LEX & order )*/
            {
                indx = -1 === dir ? Arithmetic.sub(tot_1, index) : index;
                o = $.order; $.order = order;
                ret = klass.dual( Arithmetic.equ(O, index)
                ? klass.initial( dir, n, $ )
                : (Arithmetic.equ(tot_1, index)
                ? klass.initial( -dir, n, $ )
                : klass.unrank( indx, n, $ )), indx, n, $ );
                $.order = o;
                return ret;
            }
        }
        return null;
    }
    
    ,randomIndex: function( m, M ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tot = self.$.count, argslen = arguments.length;
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
        var self = this, klass = self[CLASS], ret, o = self.$.order;
        self.$.order |= RANDOM;
        ret = klass.rand( self.n, self.$ );
        self.$.order = o;
        ret = klass.dual( ret, null, self.n, self.$ );
        return ret;
    }
    
    ,rewind: function( dir ) {
        var self = this;
        return self.order( self.$.order, -1 === dir ? -1 : 1 );
    }
    
    ,hasNext: function( dir ) {
        var self = this;
        return -1 === dir ? (RANDOM & self.$.order ? false : self._prev) : self._next;
    }
    
    // some C-P-T processes at play here as well, see below
    ,next: function( dir ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
            traversed, r, dir, klass = self[CLASS], T = klass.T,
            current = self._item, n = self.n, $ = self.$,
            order = $.order, tot = $.count, tot_1, rs;
        
        if ( -1 === dir )
        {
            // random and stochastic order has no prev
            if ( RANDOM & order ) return null;
            
            dir = REVERSED & order ? -1 : 1; // T
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
            self._item = null == self.__item ? null : klass.dual( self.__item, self.__index, n, $ );
            self._prev = null != self.__item;
            if ( self._prev ) self._index = Arithmetic.sub(self._index, I);
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
                    r = self.randomIndex( );
                    self.__item = klass.unrank( r, n, $ );
                    if ( null != self.__item ) self.__index = r;
                }
                else
                {
                    // get next un-traversed index, reject if needed
                    r = self.randomIndex( );
                    rs = Abacus.Math.rnd( ) > 0.5 ? J : I;
                    while ( traversed.isset( r ) ) r = Arithmetic.wrap( Arithmetic.add(r, rs), O, tot_1 );
                    traversed.set( r );
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
            dir = REVERSED & order ? -1 : 1; // T
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
        self._item = null == self.__item ? null : klass.dual( self.__item, self.__index, n, $ );
        self._next = null != self.__item;
        if ( self._next ) self._index = Arithmetic.add(self._index, I);
        return current;
    }
    
    ,range: function( start, end ) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            N = Arithmetic.N, O = Arithmetic.O, I = Arithmetic.I,
            tmp, $ = self.$, tot = $.count, range, count, i, iter_state, dir = 1,
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
    constructor: function Permutation( n, $ ) {
        var self = this;
        if ( !(self instanceof Permutation) ) return new Permutation(n, $);
        $ = $ || {}; $.type = "permutation";
        CombinatorialIterator.call(self, n||1, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, -1 );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
            return Abacus.Math.factorial( n );
        }
        ,initial: function( dir, n, $ ) {
            var klass = this, i, item = new Array( n );
            if ( 0 > dir ) for(n=n-1,i=0; i<=n; i++) item[i] = n-i;
            else for(i=0; i<n; i++) item[i] = i;
            return item;
        }
        ,dual: CombinatorialIterator.dual
        ,succ: function( dir, item, index, n, $ ) {
            return next_permutation( item, n, dir );
        }
        ,rand: function( n, $ ) {
            var klass = this, i, item, rndInt = Abacus.Math.rndInt;
            // return a random permutation
            item = new Array(n);
            for (i=0; i<n; i++) item[i] = i;
            shuffle( item, $ && $.cyclic ? true : false, false );
            return item;
        }
        ,rank: function( item, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                index, i, m;
            n = n || item.length;
            if ( !n ) return Arithmetic.J;
            item = permutation2inversion( item );
            for (index=Arithmetic.O,m=n-1,i=0; i<m; i++)
                index = Arithmetic.add(Arithmetic.mul(index, n-i), item[ i ]);
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic,
                item, r, i, b, t;
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
            return inversion2permutation( item );
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
        ,shuffle: function( a, cyclic ) {
            return shuffle( a, true===cyclic, false );
        }
        ,compose: function( /* permutations */ ) {
            return permutationproduct( arguments );
        }
        ,concatenate: function( /* permutations */ ) {
            return permutationconcatenation( arguments );
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
        ,matrix: function( item, bycolumns, dir ) {
            return -1 === dir ? matrix2permutation( item, bycolumns ) : permutation2matrix( item, bycolumns );
        }
        ,parity: NotImplemented
        ,is_permutation: is_permutation
        ,is_identity: is_identity
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
Combination = Abacus.Combination = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Combination( n, k, $ ) {
        var self = this;
        if ( !(self instanceof Combination) ) return new Combination(n, k, $);
        $ = $ || {};
        $.type = $.type || "combination";
        CombinatorialIterator.call(self, [n||1, k||1], $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, n[0] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return Abacus.Math.factorial( $ && "repeated" === $.type ? n[0]+n[1]-1 : n[0], n[1] );
         }
        ,initial: function( dir, n, $ ) {
            var repeated = $ && "repeated" === $.type, i, k = n[1]-1, item = new Array( k+1 );
            if ( 0 > dir )
            {
                n = n[0]-1;
                if ( repeated ) for(i=0; i<=k; i++) item[i] = n;
                else for(i=0; i<=k; i++) item[k-i] = n-i;
            }
            else
            {
                if ( repeated ) for(i=0; i<=k; i++) item[i] = 0;
                else for(i=0; i<=k; i++) item[i] = i;
            }
            return item;
        }
        ,dual: CombinatorialIterator.dual
        ,succ: function( dir, item, index, n, $ ) {
            return next_combination( item, n, dir, $ && "repeated" === $.type );
        }
        ,rand: function( n, $ ) {
            var item, i, k = n[1], n_k, c, rndInt = Abacus.Math.rndInt, repeated = $ && "repeated" === $.type;
            n = n[0]; n_k = n-k; c = n-1;
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
                        do{
                            // select uniformly without repetition
                            selection = rndInt(0, c);
                            // this is NOT an O(1) look-up operation, in general
                        }while ( 1 === selected[selection] );
                        selected[selection] = 1;
                        // insert the selected in sorted place
                        //excluded = insert_sort( excluded, selection );
                        excluded[i] = selection;
                    }
                    // get the complement
                    item = complement( n, mergesort(excluded) );
                }
                else
                {
                    // O(klogk) average-case, unbiased
                    selected = {}; item = new Array(k);
                    for(i=0; i<k; i++)
                    {
                        do{
                            // select uniformly without repetition
                            selection = rndInt(0, c);
                            // this is NOT an O(1) look-up operation, in general
                        }while ( 1 === selected[selection] );
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
        ,rank: function( item, n, $ ) {
            var Arithmetic = Abacus.Arithmetic, add = Arithmetic.add, sub = Arithmetic.sub,
                index = Arithmetic.O, i, c, j, k = n[1], N, binom,
                repeated = $ && "repeated" === $.type, factorial = Abacus.Math.factorial;
            n = n[0]; N = repeated ? n+k-1 : n;
            binom = $ && $.count ? $.count : factorial(N, k);
            if ( repeated )
            {
                for (i=1; i<=k; i++)
                {
                    // adjust the order to match MSB to LSB 
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]-i+1; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
            }
            else
            {
                for (i=1; i<=k; i++)
                {
                    // adjust the order to match MSB to LSB 
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    c = N-1-item[i-1]; j = k+1-i;
                    if ( j <= c ) index = add(index, factorial(c, j));
                }
            }
            return sub(sub(binom,Arithmetic.I),index);
        }
        ,unrank: function( index, n, $ ) {
            var Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                item, binom, k = n[1], N, m, t, p,
                repeated  = $ && "repeated" === $.type;
            n = n[0]; N = repeated ? n+k-1 : n;
            binom = $ && $.count ? $.count : Abacus.Math.factorial(N, k);
            item = new Array(k);
            // adjust the order to match MSB to LSB 
            index = Arithmetic.sub(Arithmetic.sub(binom,I),index);
            binom = Arithmetic.div(Arithmetic.mul(binom,N-k),N); 
            t = N-k+1; m = k; p = N-1;
            do {
                if ( Arithmetic.lte(binom, index) )
                {
                    item[k-m] = repeated ? N-t-k+1 : N-t-m+1;
                    if ( Arithmetic.gt(binom, O) )
                    {
                        index = Arithmetic.sub(index, binom); 
                        binom = Arithmetic.div(Arithmetic.mul(binom,m),p);
                    }
                    m--; p--;
                }
                else
                {
                    binom = Arithmetic.div(Arithmetic.mul(binom,p-m),p); 
                    t--; p--;
                }
            } while( m > 0 );
            return item;
        }
        ,complement: function( alpha, n ) {
            return complement( n, alpha );
        }
        ,pick: function( a, k, unique, sorted ) {
            return pick( a, k, false===unique, true===sorted, new Array(k) );
        }
        ,choose: function( arr, comb ) {
            var i, l = comb.length, chosen = new Array(l);
            for (i=0; i<l; i++) chosen[i] = arr[comb[i]];
            return chosen;
        }
    }
});
// aliases
Combination.conjugate = Combination.complement;

// http://en.wikipedia.org/wiki/Power_set
Subset = Abacus.Powerset = Abacus.Subset = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Subset( n, $ ) {
        var self = this;
        if ( !(self instanceof Subset) ) return new Subset(n, $);
        $ = $ || {}; $.type = "subset";
        CombinatorialIterator.call(self, n||1, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return complement( n, item );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return Abacus.Math.pow2( n );
        }
        ,initial: function( dir, n, $ ) {
            var klass = this, item, i;
            if ( 0 > dir ) for(item=new Array(n),i=0; i<n; i++) item[i] = i;
            else item = [];
            return item;
        }
        ,dual: function( item, index, n, $ ) {
            if ( null == item ) return null;
            // some C-P-T processes at play here
            var klass = this, order = $ && $.order ? $.order : 0,
                C = klass.C, P = klass.P, T = klass.T;
            if ( RANDOM & order ) return REFLECTED & order ? item : P( item, n );
            else if ( COLEX & order ) return REFLECTED & order ? P( C( item, n ), n ) : C( item, n );
            else/*if ( LEX & order )*/return REFLECTED & order ? item.slice( ) : P( item, n );
        }
        ,succ: CombinatorialIterator.succ
        ,rand: CombinatorialIterator.rand
        ,rank: function( item, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
                index = O, i = 0, l = subset.length;
            while ( i < l ) index = Arithmetic.add(index, Arithmetic.shl(I, subset[i++]));
            return index;
        }
        ,unrank: function( index, n, $ ) { 
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, subset = [], i = 0;
            if ( !Arithmetic.inside(index, Arithmetic.J, $ && $.count ? $.count : klass.count(n, $)) ) return null;
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
});

// https://en.wikipedia.org/wiki/Partitions
Partition = Abacus.Partition = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    constructor: function Partition( n, $ ) {
        var self = this;
        if ( !(self instanceof Partition) ) return new Partition(n, $);
        $ = $ || {}; $.type = "partition";
        CombinatorialIterator.call(self, n||1, $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugatepartition( item );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
            var add = Abacus.Arithmetic.add,
                partitions = Abacus.Math.partitions,
                k, m, p = Abacus.Arithmetic.O,
                M = $ && $.max ? $.max|0 : null,
                K = $ && $.exactly ? $.exactly|0 : null;
            if ( (0 > n) || (M && M > n) || (K && K > n) ) return p;
            if ( K ) for(m=M?M:n-K+1; m>=1; m--) p = add(p, partitions(n, K, m));
            else if ( M ) for(m=n-M+1; m>=1; m--) p = add(p, partitions(n, M, m));
            else for(k=1; k<=n; k++) for(m=n-k+1; m>=1; m--) p = add(p, partitions(n, k, m));
            return p;
        }
        ,initial: function( dir, n, $ ) {
            var klass = this, i, m, k, item,
                M = $ && $.max ? $.max|0 : null,
                K = $ && $.exactly ? $.exactly|0 : null;
            if ( (0 > n) || (K && K > n) || (M && M > n) ) return null;
            if ( K )
            {
                item = new Array( K );
                if ( 0 > dir )
                {
                    item[0] = /*M ? M :*/ n-K+1;
                    for(i=1; i<K; i++) item[ i ] = 1;
                }
                else
                {
                    item[0] = m = Math.ceil(n/K); item[K-1] = Math.floor(n/K);
                    for(k=K-1,i=1; i<k; i++) item[ i ] = m;
                }
            }
            else if ( M )
            {
                K = M;
                item = new Array( K );
                if ( 0 > dir )
                {
                    item[0] = m = Math.ceil(n/K); item[K-1] = Math.floor(n/K);
                    for(k=K-1,i=1; i<k; i++) item[ i ] = m;
                }
                else
                {
                    item[0] = n-K+1;
                    for(i=1; i<K; i++) item[ i ] = 1;
                }
            }
            else
            {
                if ( 0 > dir ) item = [ n ];
                else for(item=new Array( n ),i=0; i<n; i++) item[ i ] = 1;
            }
            return item;
        }
        ,dual: function( item, index, n, $ ) {
            var M = $ && $.max ? $.max|0 : null,
                K = $ && $.exactly ? $.exactly|0 : null;
            return null == item ? null : (M && !K ? conjugatepartition(item) : item.slice( ));
        }
        ,succ: function( dir, item, index, n, $ ) {
            var M = $ && $.max ? $.max|0 : null,
                K = $ && $.exactly ? $.exactly|0 : null;
            if ( (0 > n) || (K && K > n) || (M && M > n) ) return null;
            return next_partition( item, n, M && !K ? -dir : dir, K ? K : (M && !K ? M : null)/*, M*/ );
        }
        ,rand: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,conjugate: conjugatepartition
        ,pack: packpartition
        ,unpack: unpackpartition
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
                CombinatorialIterator.call(self, args[0] instanceof Array ? args[0] : slice.call(args), {type:"tensor"});
            }
            else
            {
                self.n = [];
                self.$ = {type:"tensor",count:0,order:LEX};
            }
            return self;
        }
        if ( args.length )
        {
            CombinatorialIterator.call(self, args[0] instanceof Array ? args[0] : slice.call(args), {type:"tensor"});
        }
        else
        {
            self.n = [];
            self.$ = {type:"tensor",count:0,order:LEX};
        }
    }
    
    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return !n || !n.length ? 0 : Abacus.Math.product( n );
        }
        ,initial: function( dir, n, $ ) {
            var klass = this, i, nd = n.length, item = new Array( nd );
            if ( 0 > dir ) for(i=0; i<nd; i++) item[ i ] = n[i]-1;
            else for(i=0; i<nd; i++) item[ i ] = 0;
            return item;
        }
        ,dual: CombinatorialIterator.dual
        ,succ: function( dir, item, index, n, $ ) {
            return next_tensor( item, n, dir );
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, i, nd = n.length, item = new Array(nd);
            for (i=0; i<nd; i++) item[ i ] = rndInt(0, n[ i ]-1);
            return item;
        }
        ,rank: function( item, n, $ ) { 
            var Arithmetic = Abacus.Arithmetic, index, nd = n.length, i;
            if ( !nd ) return Arithmetic.J;
            for (index=Arithmetic.O,i=0; i<nd; i++) index = Arithmetic.add(Arithmetic.mul(index, n[ i ]), item[ i ]);
            return index;
        }
        ,unrank: function( index, n, $ ) { 
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
});

Tuple = Abacus.Tuple = Class(CombinatorialIterator, {
    
    // extends and implements CombinatorialIterator
    // can also represent binary k-string as k-tuple of n=2 (binary) values
    constructor: function Tuple( k, n, $ ) {
        var self = this;
        if ( !(self instanceof Tuple) ) return new Tuple(k, n, $);
        $ = $ || {}; $.type = "tuple";
        CombinatorialIterator.call(self, [k||1,n||2], $);
    }
    
    ,__static__: {
         C: function( item, n ) {
            return conjugation( item, n[1] );
        }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        
        ,count: function( n, $ ) {
             return Abacus.Math.exp( n[0], n[1] );
        }
        ,initial: function( dir, n, $ ) {
            var klass = this, i, k = n[0], item = new Array( k );
            if ( 0 > dir ) for(n=n[1]-1,i=0; i<k; i++) item[ i ] = n;
            else for(i=0; i<k; i++) item[ i ] = 0;
            return item;
        }
        ,dual: CombinatorialIterator.dual
        ,succ: function( dir, item, index, n, $ ) {
            return next_tuple( item, n, dir );
        }
        ,rand: function( n, $ ) {
            var rndInt = Abacus.Math.rndInt, i, k = n[0], b = n[1]-1, item = new Array(k);
            for (i=0; i<k; i++) item[ i ] = rndInt(0, b);
            return item;
        }
        ,rank: function( item, n, $ ) { 
            var Arithmetic = Abacus.Arithmetic, index, k = n[0], b = n[1], i;
            for (index=Arithmetic.O,i=0; i<k; i++) index = Arithmetic.add(Arithmetic.mul(index, b), item[ i ]);
            return index;
        }
        ,unrank: function( index, n, $ ) { 
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
});

// export it
return Abacus;
});
