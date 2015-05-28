/**
*
*   Abacus
*   A combinatorics library for Node/JS, PHP, Python
*   @version: 0.1
*   https://github.com/foo123/Abacus
**/
!function( root, name, factory ) {
"use strict";
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
    floor = Math.floor, exp = Math.exp, log = Math.log, min = Math.min,
    rnd = function( m, M ) { return round( (M-m)*random() + m ); },
    clamp = function clamp( v, m, M ) { return ( v < m ) ? m : ((v > M) ? M : v); },
    summation = function(s, a) { return s+a },
    array = function( n ) { return new Array(n); },
    range = function range( n, options )  {
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
    shuffle = function shuffle( a, copied ) {
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
    // Array multi - sorter utility
    // returns a sorter that can (sub-)sort by multiple (nested) fields 
    // each ascending or descending independantly
    // https://github.com/foo123/sinful.js
    sorter = function () {

        var arr = this, i, args = arguments, l = args.length,
            a, b, step, lt, gt,
            field, filter_args, sorter_args, desc, dir, sorter,
            ASC = '|^', DESC = '|v';
        // |^ after a (nested) field indicates ascending sorting (default), 
        // example "a.b.c|^"
        // |v after a (nested) field indicates descending sorting, 
        // example "b.c.d|v"
        if ( l )
        {
            step = 1;
            sorter = [];
            sorter_args = [];
            filter_args = []; 
            for (i=l-1; i>=0; i--)
            {
                field = args[i];
                // if is array, it contains a filter function as well
                filter_args.unshift('f'+i);
                if ( field.push )
                {
                    sorter_args.unshift(field[1]);
                    field = field[0];
                }
                else
                {
                    sorter_args.unshift(null);
                }
                dir = field.slice(-2);
                if ( DESC === dir ) 
                {
                    desc = true;
                    field = field.slice(0,-2);
                }
                else if ( ASC === dir )
                {
                    desc = false;
                    field = field.slice(0,-2);
                }
                else
                {
                    // default ASC
                    desc = false;
                }
                field = field.length ? '["' + field.split('.').join('"]["') + '"]' : '';
                a = "a"+field; b = "b"+field;
                if ( sorter_args[0] ) 
                {
                    a = filter_args[0] + '(' + a + ')';
                    b = filter_args[0] + '(' + b + ')';
                }
                lt = desc ?(''+step):('-'+step); gt = desc ?('-'+step):(''+step);
                sorter.unshift("("+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0))");
                step <<= 1;
            }
            // use optional custom filters as well
            return (new Function(
                    filter_args.join(','), 
                    'return function(a,b) { return ('+sorter.join(' + ')+'); };'
                    ))
                    .apply(null, sorter_args);
        }
        else
        {
            a = "a"; b = "b"; lt = '-1'; gt = '1';
            sorter = ""+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0)";
            return new Function("a,b", 'return ('+sorter+');');
        }
    },
    // fast binary bitwise logarithm (most significant bit)
    binary_logarithm_msb = function( x ) {
        // assume x is 32-bit unsigned integer
        if ( 0 === x ) return -1;
        return 0xFFFF0000&x?(0xFF000000&x?24+BINLOG_256[x>>>24]:16+BINLOG_256[x>>>16]):(0x0000FF00&x?8+BINLOG_256[x>>>8]:BINLOG_256[x/*&0xFF*/]);
    }
;

var Abacus = {
    VERSION: "0.1"
    
    ,random: random
    
    ,random_int: rnd
    
    ,clamp: clamp
    
    ,binary_logarithm_msb: binary_logarithm_msb
    
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

    ,sorter: sorter
    
    ,sum: function sum( arr ) {
        var s = 0, i, l = arr.length;
        for (i=0; i<l; i++) s += arr[i];
        return s;
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

// Abacus.CombinatorialIterator, Combinatorial Base Class and Iterator Interface
var CombinatorialIterator = Abacus.CombinatorialIterator = function CombinatorialIterator( ) {
    if ( !(this instanceof CombinatorialIterator) ) return new CombinatorialIterator();
};
CombinatorialIterator = Merge(CombinatorialIterator, {
    count: function( ) { return 0; }
    ,index: function( item ) { return -1; }
    ,item: function( index ) { return null; }
});
CombinatorialIterator[PROTO] = {
    constructor: CombinatorialIterator
    
    ,_init: null
    ,_total: 0
    ,_index: null
    ,_current: null
    ,_prev: false
    ,_next: false
    
    ,dispose: function( ) {
        var self = this;
        self._init = null;
        self._total = 0;
        self._index = null;
        self._current = null;
        self._prev = false;
        self._next = false;
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
    var self = this, i;
    if ( !(self instanceof Permutation) ) return new Permutation(n);
    self._init = new Array(n);
    for (i=0; i<n; i++) self._init[i] = i;
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
    ,index: function( item, n ) { return -1; }
    ,item: function( index, n ) { return null; }
    ,inverse: function( n, perm ) {
        var i, iperm = new Array(n);
        for (i=0; i<n; i++) iperm[perm[i]] = i;
        return iperm;
    }
    ,cycles: function( n, perm ) {
        var i, cycles = [], current, cycle, 
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
                cycles.push( cycle );
                cycle = [ ];
                while ( unvisited.length && visited[current=unvisited.shift()] ) ;
            }
            if ( !visited[current] )
            {
                cycle.push( current );
                visited[ current ] = 1; 
            }
        }
        if ( cycle.length ) cycles.push( cycle );
        return cycles;
    }
    ,cycle2swaps: function( cycle ) {
        var swaps = [], c = cycle.length, j;
        if ( c > 1 ) for (j=c-1; j>=1; j--) swaps.push([cycle[0],cycle[j]])
        return swaps;
    }
    ,swaps: function( n, perm ) {
        var i, l, swaps = [], cycle,
            cycles = Permutation.cycles( n, perm );
        for (i=0,l=cycles.length; i<l; i++)
        {
            cycle = cycles[i];
            if ( cycle.length > 1 )
                swaps = swaps.concat( Permutation.cycle2swaps( cycle ) );
        }
        return swaps;
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
});
// extends and implements CombinatorialIterator
Permutation[PROTO] = Merge(Extend(CombinatorialIterator[PROTO]), {
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
    var self = this, i;
    if ( !(self instanceof Combination) ) return new Combination(n, k);
    self._init = [n, k]; 
    self._total = Combination.count( n, k );
    self._index = 0;
    self._current = new Array(k);
    for (i=0; i<k; i++) self._current[i] = i;
    self._prev = false;
    self._next = true;
};
Combination = Merge(Combination, {
    count: function( n, k ) {
        // http://en.wikipedia.org/wiki/Binomial_coefficient
        if (k < 0 || k > n) return 0;
        if (0 === k || k === n) return 1;
        k = min(k, n - k) // take advantage of symmetry
        var log_fact = 0, i;
        for (i=0; i<k; i++) log_fact += log(n - i) - log(i + 1);
        return floor(0.5+exp(log_fact));
    }
    ,index: function( item, n, k ) { return -1; }
    ,item: function( index, n, k ) { return null; }
    ,complement: function( n, k, comb ) {
        var i = 0, i1 = 0, i2 = 0, comp = new Array(n-k);
        while (i < n)
        {
            if (i1>=k || i<comb[i1]) comp[i2++] = i;
            else i1++;
            i++;
        }
        return comp;
    }
    ,choose: function( arr, comb ) {
        var i, l = comb.length, chosen = new Array(l);
        for (i=0; i<l; i++) chosen[i] = arr[comb[i]];
        return chosen;
    }
});
// extends and implements CombinatorialIterator
Combination[PROTO] = Merge(Extend(CombinatorialIterator[PROTO]), {
    rewind: function( ) {
        var self = this, i, k = self._init[1], n = self._init[0];
        self._index = 0;
        self._current = new Array(k);
        for (i=0; i<k; i++) self._current[i] = i;
        self._next = true;
        self._prev = false;
        return self;
    }
    
    ,forward: function( ) {
        var self = this, i, k = self._init[1], n = self._init[0];
        self._index = self._total-1;
        self._current = new Array(k);
        for (i=0; i<k; i++) self._current[i] = n-k-1+i;
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
    ,index: function( item, n ) { return -1; }
    ,item: function( index, n ) { return null; }
});
// extends and implements CombinatorialIterator
Partition[PROTO] = Merge(Extend(CombinatorialIterator[PROTO]), {
    rewind: function( ) {
        var self = this;
        self._index = 0; 
        self._current = [ self._init ]; 
        self._next = true; 
        self._prev = false; 
        return self;
    }
    
    ,forward: function( ) {
        var self = this, i, n = self._init;
        self._index = self._total-1; 
        self._current = new Array(n); 
        for (i=0; i<n; i++) self._current[i] = 1;
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
        return (1 << n)>>>0;
    }
    ,index: function( subset/*, n*/ ) { 
        var index = 0, i = 0, l = subset.length;
        while ( i < l ) index += (1<<subset[i++])>>>0;
        return index;
    }
    ,item: function( index/*, n*/ ) { 
        var subset = [], i, x = index>>>0;
        while ( 0 !== x )
        {
            subset.push( i=binary_logarithm_msb( x ) );
            x = (x & (~((1<<i)>>>0)>>>0))>>>0;
        }
        return subset;
    }
});
// extends and implements CombinatorialIterator
PowerSet[PROTO] = Merge(Extend(CombinatorialIterator[PROTO]), {
    rewind: function( ) {
        var self = this;
        self._index = 0;
        self._current = [];
        self._prev = false;
        self._next = true;
        return self;
    }
    
    ,forward: function( ) {
        var self = this, i, n = self._init;
        self._index = self._total-1;
        self._current = new Array(n); 
        for (i=0; i<n; i++) self._current[i] = i;
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
            self._current = PowerSet.item( --self._index );
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
            self._current = PowerSet.item( ++self._index );
        }
        else
        {
            self._next = false;
        }
        return subset;
    }
    
    ,get: function( index ) {
        index = arguments.length<1 ? this._index : index;
        return 0<=index&&index<this._total?PowerSet.item( index ):null;
    }
    
    ,random: function( ) {
        return PowerSet.item( rnd(0, this._total-1) );
    }
});

// export it
return Abacus;
});
