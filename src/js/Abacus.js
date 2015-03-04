/**
*
*   Abacus
*   A combinatorics library for Node/JS, PHP, Python
*   @version: 0.1
*   https://github.com/foo123/Abacus
**/
!function( root, name, factory ) {
    "use strict";
    
    //
    // export the module, umd-style (no other dependencies)
    var isCommonJS = ("object" === typeof(module)) && module.exports, 
        isAMD = ("function" === typeof(define)) && define.amd, m;
    
    // CommonJS, node, etc..
    if ( isCommonJS ) 
        module.exports = (module.$deps = module.$deps || {})[ name ] = module.$deps[ name ] || (factory.call( root, {NODE:module} ) || 1);
    
    // AMD, requireJS, etc..
    else if ( isAMD && ("function" === typeof(require)) && ("function" === typeof(require.specified)) && require.specified(name) ) 
        define( name, ['require', 'exports', 'module'], function( require, exports, module ){ return factory.call( root, {AMD:module} ); } );
    
    // browser, web worker, etc.. + AMD, other loaders
    else if ( !(name in root) ) 
        (root[ name ] = (m=factory.call( root, {} ) || 1)) && isAMD && define( name, [], function( ){ return m; } );


}(  /* current root */          this, 
    /* module name */           "Abacus",
    /* module factory */        function( exports, undef ) {
"use strict";

var PROTO = 'prototype', HAS = 'hasOwnProperty', Extend = Object.create,
    Merge = function(a, b) {for (var p in b) if (b[HAS](p)) a[p] = b[p];return a;},
    // http://graphics.stanford.edu/~seander/bithacks.html#IntegerLogLookup
    // compute binary bitwise logarithm, using BINLOG lookup table + binary-search (a variation of dynamic programming)
    ArrayUint8 = 'undefined' !== typeof Uint8Array ? Uint8Array : Array,
    BINLOG_256 = new ArrayUint8([0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7]),
    
    // utils
    random = Math.random, round = Math.round, ceil = Math.ceil,
    floor = Math.floor, exp = Math.exp, log = Math.log,
    rnd = function( m, M ) { return round( (M-m)*random() + m ); },
    clamp = function( v, m, M ) { return ( v < m ) ? m : ((v > M) ? M : v); },
    summation = function(s, a) { return s+a },
    array = function( n ) { return new Array(n); },
    range = function( n, options )  {
        var a, i;
        options = options || {};
        a = new Array( n );
        if ( options[HAS]('value') )
        {
            var v = options.value, is_arr_str = !!v.slice;
            for (i=0; i<n; i++) {a[ i ] = is_arr_str ? v.slice() : v;}
        }
        else
        {
            var start = options[HAS]('start') ? parseInt(options.start, 10) : 0,
                step = options[HAS]('step') ? parseInt(options.step, 10) : 1,
                istep = 0;
            for (i=0; i<n; i++) {a[ i ] = istep+start; istep += step;}
        }
        return a;
    },
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    shuffle = function( a, copied ) {
        var N, perm, swap, ac;
        ac = true === copied ? a.slice() : a;
        N = ac.length;
        while ( N-- )
        { 
            perm = rnd( 0, N ); 
            swap = ac[ N ]; 
            ac[ N ] = ac[ perm ]; 
            ac[ perm ] = swap; 
        }
        // in-place or copy
        return ac;
    },
    // fast binary bitwise logarithm (most significant bit)
    binary_logarithm_msb = function( x ) {
        // assume x is 32-bit unsigned integer
        if ( 0 === x ) return -1;
        return 0xFFFF0000&x?(0xFF000000&x?24+BINLOG_256[x>>>24]:16+BINLOG_256[x>>>16]):(0x0000FF00&x?8+BINLOG_256[x>>>8]:BINLOG_256[x/*&0xFF*/]);
    },
    bin2index = function( x ) {
        var indices = [], i;
        while ( 0 !== x )
        {
            indices.push( i=binary_logarithm_msb( x ) );
            x = (x & (~((1<<i)>>>0)>>>0))>>>0;
        }
        return indices;
    }
;

var Abacus = {
    VERSION: "0.1"
    
    ,random: random
    
    ,random_int: rnd
    
    ,clamp: clamp
    
    ,sum: summation
    
    ,binary_logarithm_msb: binary_logarithm_msb
    
    ,bin2index: bin2index
    
    ,array: array

    ,range: range

    ,n_array: function n_array( dims ) {
        var len = dims.shift( ),
            a = len ? new Array( len ) : [ ], i
        ;
        if ( dims.length )
        {
            for (i=0; i<len; i++) a[ i ] = n_array( dims.slice(0) );
        }
        return a;
    }

    ,reassign: function( arr, perm ) {
        var i, l = arr.length, reassigned = new Array(l);
        for (i=0; i<l; i++) reassigned[i] = perm[arr[i]];
        return reassigned;
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
    
    ,choose: function( arr, comb ) {
        var i, l = comb.length, chosen = new Array(l);
        for (i=0; i<l; i++) chosen[i] = arr[comb[i]];
        return chosen;
    }
    
    ,shuffle: shuffle
    
    // http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    // eXtended shuffle variation to shuffle only parts of array
    // while leaving other parts unaltered
    ,xshuffle: function( a, o, copied ) {
        var i, j, N, perm, swap, inc, ac;
        ac = true === copied ? a.slice() : a;
        o = o || {};
        if ( o[HAS]('included') && o.included.length )
        {
            inc = o.included;
        }
        else if ( o[HAS]('included_range') && o.included_range.length )
        {
            inc = []; i=0; j=0;
            while (i < a.length)
            {
                if (j<o.included_range.length && (i>=o.included_range[j] && (j+1 >=o.included_range.length || i<=o.included_range[j+1]))) inc.push( i );
                else j+=2;
                i++;
            }
        }
        else if ( o[HAS]('excluded') && o.excluded.length )
        {
            inc = []; i=0; j=0;
            while (i < a.length)
            {
                if (j>=o.excluded.length || i<o.excluded[j]) inc.push( i );
                else j++;
                i++;
            }
        }
        else if ( o[HAS]('excluded_range') && o.excluded_range.length )
        {
            inc = []; i=0; j=0;
            while (i < a.length)
            {
                if (j<o.excluded_range.length && i>=o.excluded_range[j]) {i = j+1<o.excluded_range.length ? o.excluded_range[j+1] : i; j+=2;}
                else inc.push( i );
                i++;
            }
        }
        else
        {
            inc = [];
        }
        N = inc.length;
        while ( N-- )
        { 
            perm = rnd( 0, N ); 
            swap = ac[ inc[N] ]; 
            ac[ inc[N] ] = ac[ inc[perm] ]; 
            ac[ inc[perm] ] = swap; 
        }
        // in-place or copy
        return ac;
    }
    
    ,intersection: function intersect_sorted2( a, b ) {
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
    
    ,union: function merge_unique_sorted2( a, b ) {
        var ai = 0, bi = 0, merged = [ ], last,
            al = a.length, bl = b.length;
        // assume a, b lists are sorted ascending 
        // <DEL>and each one does NOT contain duplicates</DEL>
        while( ai < al && bi < bl )
        {
            if      (merged.length) // handle any possible duplicates inside SAME list
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
                ai++; bi++;
            }
        }
        while ( ai < al ) if (a[ai++] !== last) merged.push( last=a[ai-1] ); 
        while ( bi < bl ) if (b[bi++] !== last) merged.push( last=b[bi-1] ); 
        return merged;
    }
};

// Abacus.Combinatorial Base Class and Interface
var Combinatorial = Abacus.Combinatorial = function(){};
Combinatorial[PROTO] = {
    constructor: Combinatorial
    
    ,_init: null
    ,_index: null,
    ,_total: 0
    ,_prev: false
    ,_next: false
    ,_current: null
    
    ,dispose: function( ) {
        var self = this;
        self._init = null;
        self._index = null;
        self._total = 0;
        self._prev = false;
        self._next = false;
        self._current = null;
        return self;
    }
    
    ,forward: function( ) { return this; }
    
    ,rewind: function( ) { return this; }
    
    ,total: function( ) { return this._total; }
    
    ,hasNext: function( ) { return this._next; }
    
    ,hasPrev: function( ) { return this._prev; }
    
    ,prev: function( ) { return this._current; }
    
    ,next: function( ) { return this._current; }
    
    ,index: function( index ) {
        var self = this;
        if ( arguments.length )
        {
            self._index = index;
            return self;
        }
        return self._index;
    }
    
    ,get: function( index ) { return this._current; }
    
    ,random: function( ) { return this._current; }
    
    ,all: function( ) {
        var self = this, all = [];
        while ( self.hasNext() ) all.push( self.next() );
        return all;
    }
};

// https://en.wikipedia.org/wiki/Permutations
var Permutation = Abacus.Permutation = function Permutation( n ) {
    var self = this;
    if ( !(self instanceof Permutation) ) return new Permutation(n);
    self._init = range( n );
    self._total = Permutation.count( n );
    self._index = 0;
    self._current = self._init.slice( );
    self._prev = false;
    self._next = true;
};
Permutation = Merge(Permutation, {
    count: function( n ) {
        var log_fact = 0;
        while ( n > 1 ) log_fact += log(n--);
        return floor(0.5+exp(log_fact));
    }
    ,count_approximate: function( n ) {
        // Stirling's Gamma function approximation
        return 0;
    }
});
Permutation[PROTO] = Extend(Combinatorial[PROTO]);
Permutation[PROTO] = Merge(Permutation[PROTO], {
    rewind: function( ) {
        var self = this;
        self._index = 0; 
        self._current = self._init.slice( );
        self._next = true; 
        self._prev = false; 
        return self;
    }
    
    ,forward: function( ) {
        var self = this;
        self._index = self._total-1; 
        self._current = self._init.slice( ).reverse();
        self._prev = true; 
        self._next = false; 
        return self;
    }
    
    // http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
    ,next: function( ) {
        var self = this, n = self._init.length, k, kl, l, r, s,
            permutation = self._current, next = permutation.slice();
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
            self._next = false;
        }
        self._current = next;
        return permutation;
    }
    
    ,random: function( ) {
        return shuffle(this._init, true);
    }
});

// https://en.wikipedia.org/wiki/Combinations
var Combination = Abacus.Combination = function Combination( n, k ) {
    var self = this;
    if ( !(self instanceof Combination) ) return new Combination(n, k);
    self._init = [n, k]; 
    self._total = Combination.count( n, k );
    self._index = 0;
    self._current = range(k);
    self._prev = false;
    self._next = true;
};
Combination = Merge(Combination, {
    count: function( n, k ) {
        // http://en.wikipedia.org/wiki/Binomial_coefficient
        if (k < 0 || k > n) return 0;
        if (0 === k || k === n) return 1;
        k = Math.min(k, n - k) // take advantage of symmetry
        var log_fact = 0, i;
        for (i=0; i<k; i++) log_fact += log(n - i) - log(i + 1);
        return floor(0.5+exp(log_fact));
    }
});
Combination[PROTO] = Extend(Combinatorial[PROTO]);
Combination[PROTO] = Merge(Combination[PROTO], {
    rewind: function( ) {
        var self = this;
        self._index = 0;
        self._current = range(self._init[1]);
        self._next = true;
        self._prev = false;
        return self;
    }
    
    ,forward: function( ) {
        var self = this;
        self._index = self._total-1;
        self._current = range(self._init[1], {start:self._init[0]-self._init[1]-1});
        self._prev = true;
        self._next = false;
        return self;
    }
    
    ,next: function( ) {
        var self = this, n = self._init[0], k = self._init[1], i, index, limit,
            curr, combination = self._current, next = combination.slice();
        
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
            self._next = false; 
        }
        self._current = next;
        return combination;
    }
    
    ,random: function( ) {
        var self = this, n = self._init[0], k = self._init[1],
            combination = new Array(k), m, M, i, index;
        i = k; m = 0; M = k-1;
        while ( 0 < i-- ) 
        { 
            index = rnd(m, M); 
            combination[k-i-1] = index; 
            m = index+1;  M = (M<n-1)?M+1:M; 
        }
        return combination;
    }
});

// https://en.wikipedia.org/wiki/Partitions
var Partition = Abacus.Partition = function Partition( n ) {
    var self = this;
    if ( !(self instanceof Partition) ) return new Partition(n);
    self._init = n; 
    self._total = Partition.count( n );
    self._index = 0; 
    self._current = [ n ];
    self._prev = false;
    self._next = true;
};
Partition = Merge(Partition, {
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // and dynamic programming (top-down)
    // http://www.programminglogic.com/integer-partition-algorithm/
    // alternatives are bottom-up computation and top-down memoization (similar to bottom-up, while retain conceptual recursion)
    count: function count_partitions( n, k, tbl ) {
        // init dynamic table
        if ( arguments.length < 2 )
        {
            tbl = range(n*n, {value: 0}); tbl.n = n;
            // compute result using intermediate function
            var sum = 0, m = ~~(0.5*n);
            for (k=1; k<=m; k++) sum += count_partitions(n-k, k, tbl);
            // return result
            return 1+sum;
        }
        else
        {
            if ( 0 === n ) return 1;
            if ( 0 > n ) return 0;
            if ( k > n ) return 0;
            if ( k === n ) return 1;
            // top-down dynamic programming used here, 
            // store previously computed results and not re-compute them
            // use 1-D array as 2-D array for speed
            var index = tbl.n*(k-1) + n-1;
            if ( 0 === tbl[index] ) tbl[index] = count_partitions(n, k+1, tbl)+count_partitions(n-k, k, tbl);
            return tbl[index];
        }
    }
    
    // http://en.wikipedia.org/wiki/Partition_%28number_theory%29
    ,count_approximate: function( n ) {
        // Hardy-Ramanujan 1st order approximation
        /*var factor = 1.0/(4*n*SQRT3);
        return factor*Math.exp(Math.PI*Math.sqrt(0.3333*(n+n)));*/
        return 0;
    }
});
Partition[PROTO] = Extend(Combinatorial[PROTO]);
Partition[PROTO] = Merge(Partition[PROTO], {
    rewind: function( ) {
        var self = this;
        self._index = 0; 
        self._current = [ self._init ]; 
        self._next = true; 
        self._prev = false; 
        return self;
    }
    
    ,forward: function( ) {
        var self = this;
        self._index = self._total-1; 
        self._current = range(self._init, {value: 1}); 
        self._prev = true; 
        self._next = false; 
        return self;
    }
    
    ,next: function( ) {
        var self = this, i, c, p1, p2, 
            num = self._init, sum, rem, 
            partition = self._current, 
            next = partition.slice( );
        
        // compute next partition
        if ( next[0] > 1 )
        {
            c = next.length;
            // break into a partition with last part reduced by 1 from previous partition series
            i = c-1;
            while (i>=0 && 1 === next[i]) i--;
            p1 = next[i]-1;
            next = next.slice(0, i+1);
            next[ i ] = p1;
            sum = next.reduce(summation, 0);
            rem = num-sum;
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
            self._next = false; 
        }
        self._current = next;
        return partition;
    }
    
    ,random: function( ) {
        var self = this, n = self._init, p,
            parts, nparts = rnd(1, n), partition
        ;
        
        // try to generate partitions that have the uniform property
        // i.e. every possible partition is equi-likely to be output (NEEDS CHECK) 
        if ( 1 === nparts ) 
        {  
            partition = [n]; 
        }
        else if ( n === nparts ) 
        { 
            partition = new Array(n);
            for (p=0; p<n; p++) partition[p] = 1;
        }
        else
        {
            parts = new Array(n);
            while ( nparts > 1 )
            {
                p = rnd(1, n-nparts+1);
                if ( !parts[p-1] ) parts[p-1] = [p];
                else parts[p-1].push(p);
                n -= p; 
                nparts--;
            }
            if ( !parts[n-1] ) parts[n-1] = [n];
            else parts[n-1].push(n);
            partition = [ ];
            for (p=parts.length-1; p>=0; p--) if ( parts[p] ) partition = partition.concat(parts[p]);
        }
        return partition;
    }
});

// http://en.wikipedia.org/wiki/Power_set
var PowerSet = Abacus.PowerSet = function PowerSet( n ) {
    var self = this;
    if ( !(self instanceof PowerSet) ) return new PowerSet(n);
    self._init = n; 
    self._total = PowerSet.count( n );
    self._index = 0;
    self._current = [];
    self._prev = false;
    self._next = true;
};
PowerSet = Merge(PowerSet, {
    count: function( n ) {
        return (1 << n);
    }
});
PowerSet[PROTO] = Extend(Combinatorial[PROTO]);
PowerSet[PROTO] = Merge(PowerSet[PROTO], {
    rewind: function( ) {
        var self = this;
        self._index = 0;
        self._current = [];
        self._prev = false;
        self._next = true;
        return self;
    }
    
    ,forward: function( ) {
        var self = this;
        self._index = self._total-1;
        self._current = bin2index(self._index);
        self._prev = true;
        self._next = false;
        return self;
    }
    
    ,prev: function( ) {
        var self = this, subset = self._current;
        // compute prev sub set
        if ( self._index-1 >= 0 ) 
        {
            self._prev = true;
            self._current = bin2index(--self._index)
        }
        else
        {
            self._prev = false;
        }
        return subset;
    }
    
    ,next: function( ) {
        var self = this, subset = self._current;
        // compute next sub set
        if ( self._index+1 < self._total ) 
        {
            self._next = true;
            self._current = bin2index(++self._index);
        }
        else
        {
            self._next = false;
        }
        return subset;
    }
    
    ,get: function( index ) {
        return bin2index(index);
    }
    
    ,random: function( ) {
        return bin2index(rnd(0, this._total-1));
    }
});

// export it
return Abacus;
});
