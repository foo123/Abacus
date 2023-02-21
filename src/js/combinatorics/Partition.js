// https://en.wikipedia.org/wiki/Partitions
// https://en.wikipedia.org/wiki/Composition_(combinatorics)
// integer compositions (resp. restricted k-compositions) have bijections ("isomorphisms") to subsets (resp. k-subsets=combinations)
// via "partial-sums mapping": x_1=y_1,..,x_k=y_k-y_{k-1},..,x_m (composition) ::=> y_1=x_1,..,y_k=y_{k-1}+x_k,..,y_m (subset)
Partition = Abacus.Partition = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Partition(n, $) {
        var self = this, sub = null, M, W, K, k1, k0;
        if (!is_instance(self, Partition)) return new Partition(n, $);
        $ = $ || {}; $.type = $.type || "partition";
        n = n||0;
        if (is_instance(n, CombinatorialIterator))
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        M = null!=$["max="] ? $["max="]|0 : null;
        W = null!=$["min="] ? $["min="]|0 : null;
        K = null!=$["parts="] ? $["parts="]|0 : null;
        k1 = null!=K ? K : (null!=W && null!=M ? (M===W ? stdMath.ceil(n/W) : stdMath.max(1, stdMath.ceil((n-M)/W))+1) : (null!=W ? stdMath.ceil(n/W) : (null!=M ? stdMath.max(0, n-M)+1 : n)));
        k0 = null!=K ? K : (null!=W && null!=M ? (M===W ? stdMath.ceil(n/M) : stdMath.max(1, stdMath.ceil((n-W)/M))+1) : (null!=W ? 2 : (null!=M ? stdMath.ceil(n/M) : 1)));
        $.base = n;
        $.mindimension = stdMath.max(1, stdMath.min(k0, k1));
        $.maxdimension = stdMath.max(1, stdMath.max(k0, k1));
        $.dimension = $.maxdimension;
        $.rand = $.rand || {};
        if ("conjugate"===$.output) $.output = function(item,n){
            return conjugatepartition(0, item, (REFLECTED&$.order)&&!(COLEX&$.order) || (COLEX&$.order)&&!(REFLECTED&$.order) ? -1 : 1);
        };
        else if ("subset"===$.output) $.output = function(item,n){ return Partition.toSubset(item); };
        else if ("packed"===$.output) $.output = function(item,n){ return Partition.toPacked(item); };
        CombinatorialIterator.call(self, "Partition", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: function(item, N, LEN, $, dir) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var klass = this, is_composition = "composition" === ($ && $.type ? $.type : "partition"),
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                reflected = -1===dir, itemlen;
            if (null != K || null != M || null != W) return item; // TODO
            if (LEN+1===item.length)
            {
                item = reflected ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
                item = conjugatepartition(is_composition, item, dir);
                itemlen = item.length;
                if (itemlen<LEN) item[reflected?"unshift":"push"].apply(item, new Array(LEN-itemlen));
                item.push([itemlen,0,0]);
            }
            else
            {
                item = conjugatepartition(is_composition, item, dir);
            }
            return item;
         }
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function(item, n, $, dir) {
            if (null == item) return null;
            var klass = this, type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX, order0 = null;
            if (/*("composition"!==type) &&*/ (COLEX&order))
            {
                order0 = $.order;
                $.order = REFLECTED & order ? (order & ~REFLECTED) : (order | REFLECTED);
            }
            item = CombinatorialIterator.DUAL.call(klass, item, n, $, dir);
            if ($ && null!=order0) $.order = order0;
            return item;
        }
        ,count: function(n, $) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                type = $ && $.type ? $.type : "partition";
            if (0 > n)
            {
                return O;
            }
            else if (0 === n)
            {
                return (null == K || 0 < K) && (null == M || 0 === M) && (null == W || 0 === W) ? Arithmetic.I : O;
            }
            else
            {
                return "composition"===type ? compositions(n, K, M, W) : partitions(n, K, M, W);
            }
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var klass = this, item, i, k, l, r, w, m,
                type = $ && $.type ? $.type : "partition",
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                order = $ && null!=$.order ? $.order : LEX,
                LEN = $ && $.dimension ? $.dimension : 1,
                is_composition = "composition" === type, conj = false;

            if (0 === n)
            {
                item = (null == K || 0 < K) && (null == M || 0 === M) && (null == W || 0 === W) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (0 > n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || /*(W+(K-1)*(n-W) < n) ||*/ (K*W > n)))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            )
            {
                return null;
            }
            else
            {
                dir = -1 === dir ? -1 : 1;

                if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                    dir = -dir;

                // O(n)
                item = new Array(LEN+1); item[LEN] = [0,0,0];
                if (K && M && W)
                {
                    // restricted partition n into exactly K parts with min part=W and max part=M
                    item[LEN][0] = K;

                    if (M === W)
                    {
                        item = K*M === n ? operate(function(item,ai,i){
                            item[i] = M; item[LEN][1]++; item[LEN][2]++;
                            return item;
                        }, item, null, 0,K-1,1) : null;
                    }
                    else
                    {
                        if (1 >= K || n < W+M) return null;
                        if (is_composition)
                        {
                            m = n-W-M-(2 < K ? W*(K-2) : 0);
                            item[0] = M; item[LEN][1]++;
                            item = operate(function(item,ai,i){
                                item[i] = stdMath.min(M, W+m);
                                m -= item[i]-W;
                                if (M === item[i]) item[LEN][1]++;
                                if (W === item[i]) item[LEN][2]++;
                                return item;
                            }, item, null, 1,K-2,1);
                            item[K-1] = W; item[LEN][2]++;
                            if (0 < dir) reflection(item,item,K,0,K-1);
                        }
                        else if (0 > dir)
                        {
                            m = n-W-M-(2 < K ? W*(K-2) : 0);
                            item[0] = M; item[LEN][1]++;
                            item = operate(function(item,ai,i){
                                item[i] = stdMath.min(M, W+m);
                                m -= item[i]-W;
                                if (M === item[i]) item[LEN][1]++;
                                if (W === item[i]) item[LEN][2]++;
                                return item;
                            }, item, null, 1,K-2,1);
                            item[K-1] = W; item[LEN][2]++;
                        }
                        else
                        {
                            m = stdMath.max(W, stdMath.min(M, 2 < K ? stdMath.floor((n-M-W)/(K-2)) : n-M-W)); k = 2 < K ? (n-M-W)%(K-2) : 0;
                            item = operate(function(item,ai,i){
                                item[i] = 0===i ? M : (K-1===i ? W : (i-1<k?m+1:m));
                                if (M === item[i]) item[LEN][1]++;
                                if (W === item[i]) item[LEN][2]++;
                                return item;
                            }, item, null, 0,K-1,1);
                        }
                    }
                }
                else if (M && W)
                {
                    // restricted partition n with min part=W and max part=M
                    if (M === W)
                    {
                        if (0 !== (n%M)) return null;
                        item[LEN][0] = stdMath.ceil(n/M);
                        item = operate(function(item,ai,i){
                            item[i] = M; item[LEN][1]++; item[LEN][2]++;
                            return item;
                        }, item, null, 0,item[LEN][0]-1,1);
                    }
                    else
                    {
                        if (0 > dir)
                        {
                            k = stdMath.floor((n-W)/M);
                            if (0 >= k) return null;
                            m = n-W-k*M;
                            if (0 < m && m < W)
                            {
                                k--;
                                m += M-W;
                                item[LEN][0] = k+1+(0 < m);
                            }
                            else
                            {
                                item[LEN][0] = k+1+(0 < m);
                            }
                            item = operate(function(item,ai,i){
                                if (i < k)
                                {
                                    item[i] = M;
                                    item[LEN][1]++;
                                }
                                else if (i === k && 0 < m)
                                {
                                    item[i] = m;
                                    if (m === M) item[LEN][1]++;
                                    if (m === W) item[LEN][2]++;
                                }
                                else
                                {
                                    item[i] = W;
                                    item[LEN][2]++;
                                }
                                return item;
                            }, item, null, 0,item[LEN][0]-1,1);
                        }
                        else
                        {
                            k = stdMath.floor((n-M)/W);
                            if (0 >= k) return null;
                            m = n-M-k*W;
                            l = stdMath.max(1, stdMath.floor(m/k));
                            item[LEN][0] = k+1;
                            item = operate(function(item,ai,i){
                                if (0 === i)
                                {
                                    item[i] = M;
                                    item[LEN][1]++;
                                }
                                else if (0 < m)
                                {
                                    item[i] = W+l;
                                    if (item[i] === M) item[LEN][1]++;
                                    if (item[i] === W) item[LEN][2]++;
                                    m -= l;
                                }
                                else
                                {
                                    item[i] = W;
                                    item[LEN][2]++;
                                }
                                return item;
                            }, item, null, 0,item[LEN][0]-1,1);
                            if (is_composition) reflection(item,item,item[LEN][0],0,item[LEN][0]-1);
                        }
                    }
                }
                else if (K && W)
                {
                    item[LEN][0] = K;
                    // restricted partition n into exactly K parts with min part=W
                    if (1 === K)
                    {
                        if (n !== W) return null;
                        item[0] = W;
                        item[LEN][2] = 1;
                    }
                    if (is_composition)
                    {
                        k = K-1; m = n-k*W;
                        item = operate(function(item,ai,i){
                            item[i] = W;
                            item[LEN][2]++;
                            return item;
                        }, item, null, 1,K-1,1);
                        item[0] = m; if (W === m) item[LEN][2]++;
                        if (0 < dir) reflection(item,item,K,0,K-1);
                    }
                    else if (0 > dir)
                    {
                        k = K-1; m = n-k*W;
                        item = operate(function(item,ai,i){
                            item[i] = W;
                            item[LEN][2]++;
                            return item;
                        }, item, null, 1,K-1,1);
                        item[0] = m; if (W === m) item[LEN][2]++;
                    }
                    else
                    {
                        m = stdMath.max(W, 1 < K ? stdMath.floor((n-W)/(K-1)) : n-W); k = 1 < K ? (n-W)%(K-1) : 0;
                        item = operate(function(item,ai,i){
                            item[i] = i<k?m+1:m;
                            if (W === item[i]) item[LEN][2]++;
                            return item;
                        }, item, null, 0,K-2,1);
                        item[K-1] = W; item[LEN][2]++;
                    }
                }
                else if (K && M)
                {
                    item[LEN][0] = K;
                    // restricted partition n into exactly K parts with largest part=M
                    // equivalent to partition n-M into K-1 parts with largest part<=M
                    if (1 === K)
                    {
                        if (n !== M) return null;
                        item[0] = M;
                        item[LEN][1] = 1;
                    }
                    if (is_composition)
                    {
                        m = n;
                        item = operate(function(item,ai,i){
                            var index = K-1-i;
                            item[index] = stdMath.min(M, m-index);
                            m -= item[index];
                            if (M === item[index]) item[LEN][1]++;
                            return item;
                        }, item, null, 0,K-1,1);
                        if (0 > dir) reflection(item,item,K,0,K-1);
                    }
                    else if (0 > dir)
                    {
                        m = n;
                        item = operate(function(item,ai,i){
                            item[i] = stdMath.min(M, m-(K-i-1));
                            if (M === item[i]) item[LEN][1]++;
                            m -= item[i];
                            return item;
                        }, item, null, 0,K-1,1);
                    }
                    else
                    {
                        m = stdMath.min(M, 1 < K ? stdMath.floor((n-M)/(K-1)) : n-M); k = 1 < K ? (n-M)%(K-1) : 0;
                        item = operate(function(item,ai,i){
                            item[i] = 0===i ? M : (i-1<k?m+1:m);
                            if (M === item[i]) item[LEN][1]++;
                            return item;
                        }, item, null, 0,K-1,1);
                    }
                }
                else
                {
                    if (K)
                    {
                        item[LEN][0] = K;
                        // restricted partition n to exactly K parts
                        // equivalent to conjugate to partition n into parts with largest part=K
                        if (is_composition)
                        {
                            item = operate(function(item,ai,i){
                                item[i] = i+1<K ? 1 : n-K+1;
                                return item;
                            }, item, null, 0,K-1,1/*array(K-1, 1, 0).concat([n-K+1])*/);
                            if (0 > dir) reflection(item,item,K,0,K-1);
                        }
                        else
                        {
                            m = stdMath.floor(n/K); k = n%K;
                            item = operate(function(item,ai,i){
                                item[i] = 0 > dir ? (0===i ? n-K+1 : 1) : (m+(i<k));
                                return item;
                            }, item, null, 0,K-1,1/*0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K, function(i){return m+(i<k);})*/);
                        }
                    }
                    else if (W)
                    {
                        // restricted partition n into parts with min part=W
                        if (W === n)
                        {
                            item[LEN][0] = 1;
                            item[0] = n;
                            item[LEN][2] = 1;
                        }
                        else if (0 > dir)
                        {
                            item[LEN][0] = 2;
                            item[0] = n-W; item[1] = W;
                            item[LEN][2] = 1 + (W===item[0] ? 1 : 0);
                        }
                        else if (is_composition)
                        {
                            k = stdMath.floor(n/W);
                            m = n-k*W;
                            if (0 < m && W > m)
                            {
                                k--;
                                m += W;
                                item[LEN][0] = k+1;
                            }
                            else
                            {
                                item[LEN][0] = k+(0 < m);
                            }
                            item = operate(function(item,ai,j){
                                if (j < k)
                                {
                                    item[j] = W;
                                    item[LEN][2]++;
                                }
                                else
                                {
                                    item[j] = m;
                                    if (W === m) item[LEN][2]++;
                                }
                                return item;
                            }, item, null, 0,item[LEN][0]-1,1);
                        }
                        else
                        {
                            k = stdMath.floor(n/W);
                            m = n-k*W;
                            if (1 < k)
                            {
                                l = stdMath.floor(m/(k-1));
                                i = m%(k-1);
                            }
                            else
                            {
                                l = 0;
                                i = 0;
                            }
                            item[LEN][0] = k;
                            item = operate(function(item,ai,j){
                                if (0 < m)
                                {
                                    item[j] = W+l;
                                    m -= l;
                                    if (0 < i)
                                    {
                                        item[j]++;
                                        i--;
                                        m--;
                                    }
                                    if (W === item[j]) item[LEN][2]++;
                                }
                                else
                                {
                                    item[j] = W;
                                    item[LEN][2]++;
                                }
                                return item;
                            }, item, null, 0,item[LEN][0]-1,1);
                        }
                    }
                    else if (M)
                    {
                        // restricted partition n into parts with largest part=M
                        // equivalent to conjugate to partition n into exactly M parts
                        k = stdMath.floor(n/M); m = n%M;
                        if (is_composition)
                        {
                            item = operate(function(item,ai,i){
                                item[i] = ai; item[LEN][0]++;
                                if (M === item[i]) item[LEN][1]++;
                                return item;
                            }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : array(n-M, 1, 0).concat([M]));
                        }
                        else
                        {
                            item = operate(function(item,ai,i){
                                item[i] = ai; item[LEN][0]++;
                                if (M === item[i]) item[LEN][1]++;
                                return item;
                            }, item, 0 > dir ? array(k, M, 0).concat(m?[m]:[]) : [M].concat(array(n-M, 1, 0)));
                        }
                    }
                    else
                    {
                        // unrestricted partition/composition
                        item = operate(function(item,ai,i){
                            item[i] = ai; item[LEN][0]++; return item;
                        }, item, 0 > dir ? [n] : array(n, 1, 0));
                    }
                }

                if (item) item = item.slice(0, item[LEN][0]);
            }
            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, type = $ && $.type ? $.type : "partition",
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                i, l, x, k0, k1, d0, d1;

            if (
                !item || !item.length
                || (0 > n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || K*W > n))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            )
                return false;

            k1 = null!=K ? K : (null!=W && null!=M ? (M===W ? stdMath.ceil(n/W) : stdMath.max(1, stdMath.ceil((n-M)/W))+1) : (null!=W ? stdMath.ceil(n/W) : (null!=M ? stdMath.max(0, n-M)+1 : n)));
            k0 = null!=K ? K : (null!=W && null!=M ? (M===W ? stdMath.ceil(n/M) : stdMath.max(1, stdMath.ceil((n-W)/M))+1) : (null!=W ? 2 : (null!=M ? stdMath.ceil(n/M) : 1)));
            d0 = stdMath.max(1, stdMath.min(k0, k1));
            d1 = stdMath.max(1, stdMath.max(k0, k1));
            if (d0 > item.length || d1 < item.length) return false;

            item = klass.DUAL(item.slice(), n, $, -1);
            if ("composition" === type)
            {
                if (null!=W && M === W)
                {
                    return (null == K || n === K*M) && 0 === item.filter(function(x){return x !== M;}).length ? true : false;
                }
                for (i=0,l=item.length; i<l; i++)
                {
                    x = item[i];
                    if (0 >= x || x > n || (W && x < W) || (M && x > M)) return false;
                    n -= x;
                }
                if (0 !== n) return false;
            }
            else
            {
                if (null!=W && M === W)
                {
                    return (null == K || n === K*M) && 0 === item.filter(function(x){return x !== M;}).length ? true : false;
                }
                for (i=0,l=item.length; i<l; i++)
                {
                    x = item[i];
                    if (0 >= x || x > n || (W && x < W) || (M && x > M) || (i+1<l && x < item[i+1])) return false;
                    n -= x;
                }
                if (0 !== n) return false;
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, PI) {
            if ((null == n) || (null == item)) return null;
            var type = $ && $.type ? $.type : "partition",
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                dim = $ && $.dimension ? $.dimension : 1,
                order = $ && null!=$.order ? $.order : LEX;

            if (
                (0 >= n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || K*W > n))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            ) return null;

            dir = -1 === dir ? -1 : 1;
            return "composition"===type ? next_composition(item, n, dir, K, M, W, dim, order, PI) : next_partition(item, n, dir, K, M, W, dim, order, PI);
        }
        ,rand: function(n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                LEN = $ && $.dimension ? $.dimension : 1,
                O = Arithmetic.O, I = Arithmetic.I,
                item = null, index, total, last;

            if (0 === n)
            {
                item = (null == K || 0 < K) && (null == M || 0 === M) && (null == W || 0 === W) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (0 > n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || K*W > n))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            )
            {
                return null;
            }
            else
            {
                total = $ && null!=$.count ? $.count : klass.count(n, $);
                if (Arithmetic.gt(total, O))
                {
                    last = Arithmetic.sub(total, I);
                    index = Arithmetic.rnd(O, last);
                    item = Arithmetic.equ(O, index) ? (
                        klass.initial(n, $, 1)
                    ) : (Arithmetic.equ(last, index) ? (
                        klass.initial(n, $, -1)
                    ) : (
                        klass.unrank(index, n, $)
                    ));
                }
            }
            //if (item && REFLECTED & order) item = item.reverse();
            return klass.DUAL(item, n, $, 1);
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                LEN = $ && $.dimension ? $.dimension : 1,
                index, J = Arithmetic.J, O = Arithmetic.O,
                i, x, w, m, c, total, last;

            if (item && (0 === n))
            {
                if (LEN+1===item.length)
                {
                    item = REFLECTED & order ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
                }
                //if (REFLECTED & order) item = item.slice().reverse();
                item = klass.DUAL(item.slice(), n, $, -1);

                index = (null == K || 0 < K) && (null == M || 0 === M) && (null == W || 0 === W) && (K||1)===item.length && item.length===item.filter(function(x){return 0===x;}).length ? O : J;
            }
            else if (
                !item || !item.length
                || (0 > n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || K*W > n))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            )
            {
                return J;
            }
            else
            {
                if (LEN+1===item.length)
                {
                    item = REFLECTED & order ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
                }
                if ($.mindimension > item.length || $.maxdimension < item.length) return J;

                //if (REFLECTED & order) item = item.slice().reverse();
                item = klass.DUAL(item.slice(), n, $, -1);

                total = $ && null!=$.count ? $.count : klass.count(n, $);
                last = Arithmetic.sub(total, 1);

                if ("composition" === type)
                {
                    index = O;
                    if (W && M === W)
                    {
                        return (null == K || n === K*M) && 0 === item.filter(function(x){return x !== M;}).length ? O : J;
                    }
                    for (w=0,m=0,i=0; i<item.length; i++)
                    {
                        x = item[i];
                        if (0 >= x || x > n || (W && x < W) || (M && x > M)) return J;
                        index = Arithmetic.add(index, W === x ? O : comp_rank(n, x, W, M, K ? K-i : null, w, m));
                        if (W === x) w++;
                        if (M === x) m++;
                        n -= x;
                    }
                    if (0 !== n || i !== item.length) return J;
                    if (REVERSED & order) index = Arithmetic.sub(last, index);
                }
                else
                {
                    index = last;
                    if (W)
                    {
                        if (M === W) return (null == K || n === K*M) && 0 === item.filter(function(x){return x !== M;}).length ? O : J;
                        n -= W; if (K) K--;
                    }
                    for (i=0; i<item.length; i++)
                    {
                        x = item[i];
                        if (W && i+1===item.length && W===x && 0===n) continue;
                        if (0 >= x || x > n || (W && x < W) || (M && x > M) || (i+1<item.length && x < item[i+1])) return J;
                        index = Arithmetic.sub(index, M && 0 === i ? O : part_rank(n, x, W, M, K ? K-i : null));
                        n -= x;
                    }
                    if (0 !== n || i !== item.length) return J;
                    if (!(REVERSED & order)) index = Arithmetic.sub(last, index);
                }
            }
            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && null!=$.order ? $.order : LEX,
                M = $ && null!=$["max="] ? $["max="]|0 : null,
                W = $ && null!=$["min="] ? $["min="]|0 : null,
                K = $ && null!=$["parts="] ? $["parts="]|0 : null,
                item = [], O = Arithmetic.O, i, x, w, m, c, total, last,
                LEN = $ && $.dimension ? $.dimension : 1;

            index = null == index ? null : Arithmetic.num(index);
            total = $ && null!=$.count ? $.count : klass.count(n, $);
            last = Arithmetic.sub(total, 1);

            if ((0 === n) && (null != index))
            {
                item = Arithmetic.equ(O, index) && (null == K || 0 < K) && (null == M || 0 === M) && (null == W || 0 === W) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (null == index)
                || Arithmetic.lt(index, O) || Arithmetic.gt(index, last)
                || (0 > n)
                || (null!=K && null!=M && null!=W && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || (null!=M && null!=W && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || (M === W && 0 !== n % M) || (M !== W && (M+W > n || (M+W < n && n-(M+W) < W)))))
                || (null!=K && null!=W && ((0 >= K) || (0 >= W) || K*W > n))
                || (null!=K && null!=M && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || (null!=W && (0 >= W || W > n || (W < n && W+W > n)))
                || (null!=M && (0 >= M || M > n))
                || (null!=K && (0 >= K || K > n))
            )
            {
                return null;
            }
            else
            {
                if (REVERSED & order) index = Arithmetic.sub(last, index);
                if ("composition" === type)
                {
                    if (W && M === W)
                    {
                        item = null == K || stdMath.floor(n/M) === K ? array(stdMath.floor(n/M), M) : null;
                    }
                    if (item && !item.length)
                    {
                        for (w=0,m=0,i=0; 0<n; i++)
                        {
                            x = W && 0 === i ? n-W : n;
                            x = M ? stdMath.min(M, x) : x;
                            while ((!W || W <= x) && 1 <= x && Arithmetic.gt(c=comp_rank(n, x, W, M, K ? K-i : null, w, m), index)) x--;
                            if (0 >= x || (W && W > x)) break;
                            if (W === x) w++;
                            if (M === x) m++;
                            item.push(x);
                            index = Arithmetic.sub(index, c);
                            n -= x;
                        }
                    }
                }
                else
                {
                    if (W)
                    {
                        if (M === W)
                        {
                            item = null == K || stdMath.floor(n/M) === K ? array(stdMath.floor(n/M), M) : null;
                        }
                        else
                        {
                            n -= W; if (K) K--;
                        }
                    }
                    if (M)
                    {
                        n -= M; if (K) K--;
                    }
                    if (item && !item.length)
                    {
                        for (i=0; 0<n; i++)
                        {
                            x = M ? stdMath.min(M, n) : n;
                            while ((!W || W <= x) && 1 <= x && Arithmetic.gt(c=part_rank(n, x, W, M, K ? K-i : null), index)) x--;
                            if (0 >= x || (W && W > x)) break;
                            item.push(x);
                            index = Arithmetic.sub(index, c);
                            n -= x;
                        }
                        if (W) item.push(W);
                        if (M) item.unshift(M);
                    }
                }
            }
            item = klass.DUAL(item, n, $, 1);
            return item;
        }
        ,toConjugate: function(item, type) {
            return conjugatepartition("composition"===type, item);
        }
        ,toSubset: function(item) {
            return composition2subset(item);
        }
        ,fromSubset: function(item) {
            return subset2composition(item);
        }
        ,toPacked: function(item) {
            return packpartition(item);
        }
        ,fromPacked: function(item) {
            return unpackpartition(item);
        }
    }
    ,_update: function() {
        var self = this, $ = self.$, n = self.n, item = self.__item,
            type = $ && $.type ? $.type : "partition",
            order = $ && null!=$.order ? $.order : LEX,
            M = $ && null!=$["max="] ? $["max="]|0 : null,
            W = $ && null!=$["min="] ? $["min="]|0 : null,
            K = $ && null!=$["parts="] ? $["parts="]|0 : null,
            LEN = $.dimension, itemlen, x, y = 0, z = 0;
        if ((null != item) && (LEN+1 !== item.length))
        {
            itemlen = item.length;
            item = item.slice();
            if (null != M || null != W)
            {
                for (x=0,y=0,z=0; x<itemlen; x++)
                {
                    if (M === item[x]) y++;
                    if (W === item[x]) z++;
                }
            }
            if (itemlen<LEN)
            {
                if (REFLECTED & order) item.unshift.apply(item, new Array(LEN-itemlen));
                else item.push.apply(item, new Array(LEN-itemlen));
            }
            item.push([itemlen, y, z]);
            self.__item = item;
        }
        return self;
    }
    ,output: function(item) {
        if (null == item) return null;
        var self = this, $ = self.$, n = self.n,
            M = null!=$["max="] ? $["max="]|0 : null,
            W = null!=$["min="] ? $["min="]|0 : null,
            K = null!=$["parts="] ? $["parts="]|0 : null,
            order = null!=$.order ? $.order : LEX, LEN = $.dimension;
        if (LEN+1===item.length)
        {
            item = REFLECTED & order ? item.slice(LEN-item[LEN][0],LEN) : item.slice(0,item[LEN][0]);
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
});
// aliases
Partition.transpose = Partition.conjugate;
function next_partition(item, N, dir, K, M, W, LN, order, PI)
{
    //maybe "use asm"
    var n = N, INFO = LN, LEN = 0, NMAX = 1, NMIN = 2,
        i, j, i0, i1, k, nn, m, w, d, l, r, rem, DI = 1, MIN, MAX;

    if (0 >= n || (null != K && 0 >= K) || (null != W && 0 >= W) || (null != M && 0 >= M)) return null;

    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    /*if (COLEX & order)
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if (REFLECTED & order)
    {
        //P-symmetric of LEX
        DI = -DI;
    }
    if (REVERSED & order)
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if (0 > DI)
    {
        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[INFO][LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if (COLEX & order)
    {
        return null; // not implemented
    }

    if (0 > dir)
    {
        // compute prev partition
        if (K)
        {
            if (M && W && (M === W)) return null; // there is only one, if any

            l = M ? 1 : 0; r = W ? 1 : 0; w = W ? W : 1;
            rem = n-(M ? M : 0)-(W ? W : 0);
            m = 0 < K-l-r ? rem % (K-l-r) : 0;
            d = stdMath.min(M ? M : rem, 0 < K-l-r ? stdMath.floor(rem/(K-l-r)) : rem);
            k = 0; i = -1;
            for (j=i0+l*DI; MIN<=j-l*DI && j+r*DI<=MAX; j+=DI)
            {
                if ((w < item[j]) && (d+(k<m) < item[j] || stdMath.floor(rem/(K-l-r-k))+(0<(rem%(K-l-r-k))) < item[j])) i = j;
                k++; rem -= item[j];
            }
            if (-1 === i || MAX < i+r*DI || MIN > i-l*DI)
            {
                item = null;
            }
            else
            {
                if (M === item[i]) item[INFO][NMAX]--;
                item[i]--;
                if (W === item[i]) item[INFO][NMIN]++;
                i += DI;
                rem = 1; k = 0; j = i;
                while (MIN<=j-l*DI && j+r*DI<=MAX) {k++; rem += item[j]; j += DI;}
                while (0<k && 0<rem && MIN<=i-l*DI && i+r*DI<=MAX)
                {
                    k--;
                    if (M === item[i]) item[INFO][NMAX]--;
                    if (W === item[i]) item[INFO][NMIN]--;
                    item[i] = stdMath.min(MIN <= i-DI && i-DI <= MAX ? item[i-DI] : n, stdMath.max(w, rem-w*k));
                    rem -= item[i];
                    if (M === item[i]) item[INFO][NMAX]++;
                    if (W === item[i]) item[INFO][NMIN]++;
                    i += DI;
                }
            }
        }
        else
        {
            if (W)
            {
                w = W;
                i1 -= DI;
            }
            else
            {
                w = 1;
            }

            j = M ? i0+DI : i0;
            if ((MIN <= j && j <= MAX) && (item[j] > w))
            {
                i = i1; rem = 0; l = 0; r = 0;
                while ((MIN<=i && i<=MAX) && (DI*(i-j) >= 0) && (w === item[i]))
                {
                    rem+=item[i];
                    if (M === item[i]) l++;
                    if (W === item[i]) r++;
                    i-=DI;
                }
                if (M === item[i]) item[INFO][NMAX]--;
                m = item[i]-1; rem++; item[i] = m;
                item[INFO][LEN] = (0 > DI ? LN-i : i+1) + (W ? 1 : 0);
                item[INFO][NMAX] -= l;
                item[INFO][NMIN] -= r;
                if (W === item[i]) item[INFO][NMIN]++;
                if (m < rem)
                {
                    j = rem % m;
                    rem = stdMath.floor(rem/m);
                    while (0 < rem--)
                    {
                        i+=DI;
                        item[i] = m;
                        item[INFO][LEN]++;
                        if (M === item[i]) item[INFO][NMAX]++;
                        if (W === item[i]) item[INFO][NMIN]++;
                    }
                    rem = j;
                }
                if (w <= rem)
                {
                    i+=DI;
                    item[i] = rem; rem = 0;
                    item[INFO][LEN]++;
                    if (M === item[i]) item[INFO][NMAX]++;
                    if (W === item[i]) item[INFO][NMIN]++;
                }
                if (0 < rem)
                {
                    return null;
                }
                if (W)
                {
                    i+=DI;
                    item[i] = W;
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
        if (K)
        {
            if (M && W && (M === W)) return null; // there is only one, if any
            if (W)
            {
                w = W;
                i = i1-DI;
            }
            else
            {
                w = 1;
                i = i1;
            }
            rem = 0; k = 0;
            while (MIN <= i && i <= MAX && w === item[i]) {rem += item[i]; k++; i -= DI;}
            if (i < MIN || i > MAX)
            {
                item = null;
            }
            else
            {
                if (M === item[i]) item[INFO][NMAX]--;
                if (W === item[i]-1) item[INFO][NMIN]++;
                item[i]--; rem += item[i]; k++; i -= DI;
                if (i < MIN || i > MAX)
                {
                    item = null;
                }
                else
                {
                    while (MIN<=i && i<=MAX && ((M && M<item[i]+1) || (MIN<=i-DI && i-DI<=MAX && item[i-DI]<item[i]+1))) {rem += item[i]; k++; i -= DI;}
                    if (i < MIN || i > MAX)
                    {
                        item = null;
                    }
                    else
                    {
                        item[i]++;
                        if (M === item[i]) item[INFO][NMAX]++;
                        m = 0 < k ? rem % k : 0;
                        d = 0 < k ? stdMath.floor(rem/k) : rem;
                        j = 0;
                        while (0 < rem)
                        {
                            i += DI;
                            if (M === item[i]) item[INFO][NMAX]--;
                            if (W === item[i]) item[INFO][NMIN]--;
                            item[i] = d+(j<m); rem -= item[i];
                            if (M === item[i]) item[INFO][NMAX]++;
                            if (W === item[i]) item[INFO][NMIN]++;
                            j++;
                        }
                        if (W)
                        {
                            item[i1] = W;
                            //item[INFO][NMIN]++;
                        }
                    }
                }
            }
        }
        else
        {
            if (M && W)
            {
                if (M === W) return null; // there is only one, if any
                w = W;
                k = stdMath.floor((n-W)/M)+1;
                m = item[INFO][LEN] > k;
                j = i0+DI;
            }
            else if (W)
            {
                w = W;
                m = item[INFO][LEN] > 2 || item[i0]+W < n;
                j = i0;
            }
            else if (M)
            {
                w = 1;
                m = stdMath.min(M, n-M);
                k = stdMath.ceil(n/M)-1;
                m = /*MAX*/item[INFO][LEN] > k+1 || item[i0+(k-1)*DI] < m;
                j = i0+DI;
            }
            else
            {
                w = 1;
                m = item[i0] < n;
                j = i0;
            }
            if (MIN <= j && j <= MAX && m)
            {
                l = 0; r = 0; rem = 0;
                if (0 < MAX)
                {
                    i = i1-DI;
                    rem += item[i1];
                    if (M === item[i1]) l++;
                    if (W === item[i1]) r++;
                }
                else
                {
                    i = i1;
                }
                while ((MIN<=i && i<=MAX) && (MIN<=i-DI && i-DI<=MAX) && (DI*(i-j) > 0) && (item[i-DI] === item[i] || (W && (rem-1 < W))))
                {
                    rem += item[i];
                    if (M === item[i]) l++;
                    if (W === item[i]) r++;
                    i -= DI;
                }
                if (M && (M <= item[i])) return null;
                item[INFO][LEN] = (0 > DI ? LN-i : i+1);
                item[INFO][NMAX] -= l;
                item[INFO][NMIN] -= r;
                if (W === item[i]) item[INFO][NMIN]--;
                item[i]++; rem--; j = i;
                if (M === item[i]) item[INFO][NMAX]++;
                while (w <= rem)
                {
                    i += DI; item[INFO][LEN]++;
                    item[i] = w; rem -= w;
                    if (W) item[INFO][NMIN]++;
                    if (M === item[i]) item[INFO][NMAX]++;
                }
                if (0 < rem)
                {
                    if (0 > DI)
                    {
                        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                    }
                    else
                    {
                        MIN = 0; MAX = item[INFO][LEN]-1;
                    }
                    i = j+DI;
                    while (MIN<=i && i<=MAX && 0 < rem)
                    {
                        m = MIN<=i-DI && i-DI<=MAX ? (item[i-DI]>item[i] ? 1 : 0) : stdMath.min(M ? M-item[i] : rem, rem);
                        if (W === item[i])
                        {
                            if (1 === item[INFO][NMIN])
                            {
                                i = j;
                                while (MIN<=i && i<=MAX && MIN<=i-DI && i-DI<=MAX && item[i-DI]===item[i]) i -= DI;
                                if (MIN<=i-DI && i-DI<=MAX)
                                {
                                    item[i]++; rem--;
                                    i += DI;
                                    continue;
                                }
                                else
                                {
                                    m = stdMath.min(M ? M-item[i] : rem, rem);
                                    item[i] += m; rem -= m;
                                    break;
                                }
                            }
                            else
                            {
                                item[INFO][NMIN]--;
                            }
                        }
                        item[i] += m; rem -= m;
                        if (M === item[i]) item[INFO][NMAX]++;
                        i += DI;
                    }
                }
                if (0 < rem) item = null;
            }
            // if partition is the number itself it is the final partition
            //else last item
            else item = null;
        }
    }
    return item;
}
function next_composition(item, N, dir, K, M, W, LN, order, PI)
{
    //maybe "use asm"
    var n = N, INFO = LN, LEN = 0, NMAX = 1, NMIN = 2,
        i, j, i0, i1, k, nn, m, w, d, l, r, rem, DI = 1, MIN, MAX;

    if (0 >= n || (null != K && 0 >= K) || (null != W && 0 >= W) || (null != M && 0 >= M)) return null;

    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    /*if (COLEX & order)
    {
        //CP-symmetric of LEX
        dir = -dir;
    }*/
    if (REFLECTED & order)
    {
        //P-symmetric of LEX
        DI = -DI;
    }
    if (REVERSED & order)
    {
        //T-symmetric of LEX
        dir = -dir;
    }
    if (0 > DI)
    {
        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
        i0 = MAX; i1 = MIN;
    }
    else
    {
        MIN = 0; MAX = item[INFO][LEN]-1;
        i0 = MIN; i1 = MAX;
    }

    if (0 > dir)
    {
        // compute prev composition
        if (K)
        {
            if (M && W)
            {
                if (M === W) return null; // there is only one, if any
                if (COLEX & order)
                {
                    item = null;
                }
                else
                {
                    i = i1-DI; j = i1; d = item[i1]-W; rem = item[i1]; k = 1;
                    while (MIN<=i && i<=MAX && (W===item[i] || M<item[j]+1))
                    {
                        rem += item[i];
                        k++;
                        j = i;
                        i -= DI;
                    }
                    if (MIN > i || i > MAX)
                    {
                        item = null;
                    }
                    else
                    {
                        if (0 < d)
                        {
                            m = rem+1-W*(k-1);
                            if (1 === item[INFO][NMIN] && W === item[j] && (k-1)*M+W < rem+1)
                            {
                                rem += item[i]-W; item[i] = W;
                                item[INFO][NMIN]++;
                            }
                            else if (1 === item[INFO][NMAX] && M === item[i] && M > m)
                            {
                                item[i] = stdMath.max(item[j], item[i1]); rem += M-item[i];
                                if (M !== item[i]) item[INFO][NMAX]--;
                                if (W === item[i]) item[INFO][NMIN]++;
                            }
                            else
                            {
                                if (M === item[i]) item[INFO][NMAX]--;
                                rem++; item[i]--;
                                if (W === item[i]) item[INFO][NMIN]++;
                            }
                            m = rem-W*k;
                            while (0 < rem && MIN <= j && j <= MAX)
                            {
                                if (W === item[j]) item[INFO][NMIN]--;
                                if (M === item[j]) item[INFO][NMAX]--;
                                item[j] = stdMath.min(M, W+m);
                                rem -= item[j]; m -= item[j]-W;
                                if (M === item[j]) item[INFO][NMAX]++;
                                if (W === item[j]) item[INFO][NMIN]++;
                                j += DI;
                            }
                        }
                        else
                        {
                            if (1 === item[INFO][NMIN] && W === item[j])
                            {
                                item[j] = item[i]; item[i] = W;
                            }
                            else if (1 === item[INFO][NMAX] && M === item[i] && M > item[j]+1)
                            {
                                item[i] = item[j]; item[j] = M;
                            }
                            else
                            {
                                if (M === item[i]) item[INFO][NMAX]--;
                                if (W === item[j]) item[INFO][NMIN]--;
                                item[i]--; item[j]++;
                                if (M === item[j]) item[INFO][NMAX]++;
                                if (W === item[i]) item[INFO][NMIN]++;
                            }
                        }
                    }
                }
            }
            else if (W)
            {
                if (COLEX & order)
                {
                    item = null;
                }
                else
                {
                    m = item[i1];
                    if (n-W*(K-1) > m)
                    {
                        i = i1-DI;
                        while (MIN <= i && i <= MAX && W === item[i]) i-=DI;
                        j = i+DI;
                        if (1 === item[INFO][NMIN] && W === item[j] && j === i1)
                        {
                            item[j] = item[i]; item[i] = W;
                        }
                        else
                        {
                            if (W === item[j]) item[INFO][NMIN]--;
                            item[i]--; item[i1] = W; item[j] = 1+m;
                            if (W === item[i]) item[INFO][NMIN]++;
                            if (item[i1] === W && W !== m) item[INFO][NMIN]++;
                        }
                    }
                    // last
                    else item = null;
                }
            }
            else if (M)
            {
                if (COLEX & order)
                {
                    item = null;
                }
                else
                {
                    i = i1-DI; j = i1; d = item[i1]-1; rem = item[i1]; k = 1;
                    while (MIN<=i && i<=MAX && (1===item[i] || M<item[j]+1))
                    {
                        rem += item[i];
                        k++;
                        j = i;
                        i -= DI;
                    }
                    if (MIN > i || i > MAX)
                    {
                        item = null;
                    }
                    else
                    {
                        if (0 < d)
                        {
                            if (1 === item[INFO][NMAX] && M === item[i] && M > rem-(k-1)+1)
                            {
                                item[i] = stdMath.max(item[j], item[i1]); rem += M-item[i];
                                if (M !== item[i]) item[INFO][NMAX]--;
                            }
                            else
                            {
                                if (M === item[i]) item[INFO][NMAX]--;
                                item[i]--; rem++;
                            }
                            l = 0;
                            while (0 < rem && MIN <= j && j <= MAX)
                            {
                                if (M === item[j]) item[INFO][NMAX]--;
                                item[j] = stdMath.min(M, rem-(k-l-1));
                                rem -= item[j];
                                if (M === item[j]) item[INFO][NMAX]++;
                                j += DI; l++;
                            }
                        }
                        else
                        {
                            if (1 === item[INFO][NMAX] && M === item[i] && M > item[j]+1)
                            {
                                item[i] = item[j]; item[j] = M;
                            }
                            else
                            {
                                if (M === item[i]) item[INFO][NMAX]--;
                                item[i]--; item[j]++;
                                if (M === item[j]) item[INFO][NMAX]++;
                            }
                        }
                    }
                }
            }
            else
            {
                // adapted from FXT lib
                if (COLEX & order)
                {
                    m = item[i0];
                    if (n-K+1 > m)
                    {
                        item[i0] = 1; i = i0+DI;
                        while (MIN <= i && i <= MAX && 1 === item[i]) i+=DI;
                        item[i]--;
                        if (MIN <= i-DI && i-DI <= MAX) item[i-DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    m = item[i1];
                    if (n-K+1 > m)
                    {
                        item[i1] = 1; i = i1;
                        while (MIN <= i && i <= MAX && 1 === item[i]) i-=DI;
                        item[i]--;
                        if (MIN <= i+DI && i+DI <= MAX) item[i+DI] = 1+m;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if (COLEX & order)
            {
                item = null;
            }
            else if (M && W)
            {
                if (M === W) return null; // there is only one, if any
                return null;
            }
            else if (W)
            {
                return null;
            }
            else if (M)
            {
                rem = 0; i = i1; k = item[INFO][LEN]; l = 0;
                while (MIN <= i && i <= MAX && 1 === item[i])
                {
                    if (M === item[i]) l++;
                    i -= DI;
                    rem++;
                    k--;
                }
                if (i < MIN || i > MAX)
                {
                    item = null;
                }
                else
                {
                    if (1 === item[INFO][NMAX] && M === item[i])
                    {
                        if (n === M)
                        {
                            item = null;
                        }
                        else if (M <= rem+1)
                        {
                            if (M === item[i]) item[INFO][NMAX]--;
                            item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                            while (0 < rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                item[INFO][LEN]++;
                                if (M === item[i]) item[INFO][NMAX]++;
                                rem -= item[i];
                            }
                        }
                        else if (M < item[i]+rem)
                        {
                            if (M === item[i]) item[INFO][NMAX]--;
                            item[i]-=M-rem; rem=M; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                            while (0 < rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                item[INFO][LEN]++;
                                if (M === item[i]) item[INFO][NMAX]++;
                                rem -= item[i];
                            }
                        }
                        else
                        {
                            if (M === item[i]) l++;
                            rem+=item[i]; i-=DI; k--;
                            while (MIN <= i && i <= MAX && 1 === item[i])
                            {
                                if (M === item[i]) l++;
                                i-=DI;
                                rem++;
                                k--;
                            }
                            /*if (0 > DI)
                            {
                                MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                            }
                            else
                            {
                                MIN = 0; MAX = item[INFO][LEN]-1;
                            }*/
                            if (i < MIN || i > MAX)
                            {
                                item = null;
                            }
                            else
                            {
                                if (M === item[i]) item[INFO][NMAX]--;
                                item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                                while (0 < rem)
                                {
                                    i += DI;
                                    item[i] = stdMath.min(M, rem);
                                    item[INFO][LEN]++;
                                    if (M === item[i]) item[INFO][NMAX]++;
                                    rem -= item[i];
                                }
                            }
                        }
                    }
                    else
                    {
                        if (M === item[i]) item[INFO][NMAX]--;
                        item[i]--; rem++; item[INFO][LEN] = k; item[INFO][NMAX]-=l;
                        while (0 < rem)
                        {
                            i += DI;
                            item[i] = stdMath.min(M, rem);
                            item[INFO][LEN]++;
                            if (M === item[i]) item[INFO][NMAX]++;
                            rem -= item[i];
                        }
                    }
                }
            }
            else
            {
                if (n > item[INFO][LEN])
                {
                    i = i1; rem = 0;
                    while (MIN <= i && i <= MAX && 1 === item[i]) {i-=DI; rem++;}
                    m = item[i]-1; item[i] = m; rem++;
                    if (0 < rem)
                    {
                        if (MIN <= i+DI && i+DI <= MAX)
                        {
                            i+=DI; item[i]=rem; rem=0;
                            item[INFO][LEN] = 0 > DI ? LN-i : i+1;
                        }
                        else
                        {
                            while (0 < rem--) {i+=DI; item[i] = 1; item[INFO][LEN]++;}
                        }
                    }
                }
                // last
                else item = null;
            }
        }
    }
    else
    {
        // compute next composition
        if (K)
        {
            if (COLEX & order)
            {
                item = null;
            }
            else if (M && W)
            {
                if (M === W) return null; // there is only one, if any
                j = i1; k = 1;
                i = j-DI; d = M-item[j]; rem = item[j];
                while (MIN <= i && i <= MAX && (M < item[i]+1 || W === item[j])) {rem+=item[i]; k++; j = i; i-=DI;}
                if (MIN > i || i > MAX)
                {
                    item = null;
                }
                else
                {
                    if (0 < d)
                    {
                        m = rem-1-W*(k-1);
                        if (1 === item[INFO][NMIN] && W === item[i] && k <= m)
                        {
                            item[i] = item[i1]; item[i1] = W; rem -= item[i]-W;
                        }
                        else if (1 === item[INFO][NMAX] && M === item[j] && M > item[i]+1 && M > m)
                        {
                            item[j] = item[i]; item[i] = M; rem -= M-item[j];
                        }
                        else
                        {
                            if (W === item[i]) item[INFO][NMIN]--;
                            item[i]++; rem--;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                        i = i1; m = rem-W*k;
                        while (MIN<=i && i<=MAX && 0<rem)
                        {
                            if (M === item[i]) item[INFO][NMAX]--;
                            if (W === item[i]) item[INFO][NMIN]--;
                            item[i] = stdMath.min(M, W+m);
                            rem -= item[i]; m -= item[i]-W;
                            if (M === item[i]) item[INFO][NMAX]++;
                            if (W === item[i]) item[INFO][NMIN]++;
                            i -= DI; l++;
                        }
                    }
                    else
                    {
                        if (1 === item[INFO][NMAX] && M === item[j] && M > item[i]+1)
                        {
                            item[j] = item[i]; item[i] = M;
                        }
                        else
                        {
                            if (M === item[j]) item[INFO][NMAX]--;
                            if (W === item[i]) item[INFO][NMIN]--;
                            item[i]++; item[j]--;
                            if (W === item[j]) item[INFO][NMIN]++;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                    }
                }
            }
            else if (W)
            {
                if (n-W*(K-1) > item[i0])
                {
                    i = i1;
                    while (MIN <= i && i <= MAX && W === item[i]) i-=DI;
                    j = i-DI;
                    if (1 === item[INFO][NMIN] && W === item[j])
                    {
                        item[j] = item[i]; item[i] = W;
                    }
                    else
                    {
                        if (W === item[j]) item[INFO][NMIN]--;
                        item[i]--; item[j]++;
                        if (W === item[i]) item[INFO][NMIN]++;
                        m = item[i]; item[i] = item[i1]; item[i1] = m;
                    }
                }
                // last
                else item = null;
            }
            else if (M)
            {
                j = i1; k = 1;
                i = j-DI; d = M-item[j]; rem = item[j];
                while (MIN <= i && i <= MAX && ((M && M < item[i]+1) || 1 === item[j])) {rem+=item[i]; k++; j = i; i-=DI;}
                if (MIN > i || i > MAX)
                {
                    item = null;
                }
                else
                {
                    if (0 < d)
                    {
                        if (M && 1 === item[INFO][NMAX] && M === item[j] && M > item[i]+1 && M > rem-(k-1)-1)
                        {
                            item[j] = item[i]; item[i] = M; rem-=M-item[j];
                        }
                        else
                        {
                            item[i]++; rem--;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                        l = 0; i = i1;
                        while (MIN<=i && i<=MAX && 0<rem)
                        {
                            if (M === item[i]) item[INFO][NMAX]--;
                            item[i] = stdMath.min(M, rem-(k-l-1));
                            rem -= item[i];
                            if (M === item[i]) item[INFO][NMAX]++;
                            i -= DI; l++;
                        }
                    }
                    else
                    {
                        if (1 === item[INFO][NMAX] && M === item[j] && M > item[i]+1)
                        {
                            item[j] = item[i]; item[i] = M;
                        }
                        else
                        {
                            if (M === item[j]) item[INFO][NMAX]--;
                            item[i]++; item[j]--;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                    }
                }
            }
            else
            {
                // adapted from FXT lib
                if (COLEX & order)
                {
                    if (n-K+1 > item[i1])
                    {
                        i = i0;
                        while (MIN <= i && i <= MAX && 1 === item[i]) i+=DI;
                        m = item[i]; item[i] = 1; item[i0] = m-1;
                        if (MIN <= i+DI && i+DI <= MAX) item[i+DI]++;
                    }
                    // last
                    else item = null;
                }
                else
                {
                    if (n-K+1 > item[i0])
                    {
                        i = i1;
                        while (MIN <= i && i <= MAX && 1 === item[i]) i-=DI;
                        m = item[i]; item[i] = 1; item[i1] = m-1;
                        if (MIN <= i-DI && i-DI <= MAX) item[i-DI]++;
                    }
                    // last
                    else item = null;
                }
            }
        }
        else
        {
            if (COLEX & order)
            {
                item = null;
            }
            else if (M)
            {
                if (M === W) return null; // there is only one, if any

                w = W ? W : 1;
                i = i1;
                rem = item[i];
                if (M === item[i]) item[INFO][NMAX]--;
                if (W && W === item[i]) item[INFO][NMIN]--;
                item[INFO][LEN]--;
                i -= DI;
                while (null != W && MIN<=i && i<=MAX && rem<1+W)
                {
                    rem += item[i];
                    item[INFO][LEN]--;
                    if (M === item[i]) item[INFO][NMAX]--;
                    if (W === item[i]) item[INFO][NMIN]--;
                    i -= DI;
                }
                if (MIN > i || MAX < i)
                {
                    return null;
                }
                k = item[INFO][LEN];
                if (0 === item[INFO][NMAX])
                {
                    if (n === M)
                    {
                        return null;
                    }
                    else
                    {
                        j = i;
                        rem -= M-item[i];
                        item[i] = M;
                        item[INFO][NMAX]++;
                        while (w <= rem)
                        {
                            i += DI;
                            item[i] = w;
                            rem -= w;
                            item[INFO][LEN]++;
                            if (W) item[INFO][NMIN]++;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                        if (null != W && 0 === item[INFO][NMIN])
                        {
                            rem += item[i]-W;
                            item[i] = W;
                            item[INFO][NMIN]++;
                        }
                    }
                }
                else
                {
                    l = 0; r = 0; m = 0;
                    while (MIN <= i && i <= MAX && (M === item[i]))
                    {
                        l++;
                        m += item[i];
                        i -= DI;
                        k--;
                    }
                    /*if (0 > DI)
                    {
                        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                    }
                    else
                    {
                        MIN = 0; MAX = item[INFO][LEN]-1;
                    }*/
                    if (MIN > i || MAX < i)
                    {
                        return null;
                    }
                    else
                    {
                        j = i;
                        item[i]++;
                        rem += m-1;
                        item[INFO][LEN] = k;
                        item[INFO][NMAX] -= l;
                        if (M === item[i]) item[INFO][NMAX]++;
                        if (0 === item[INFO][NMAX])
                        {
                            m = M;
                            rem -= m;
                        }
                        else
                        {
                            m = 0;
                        }
                        while (w <= rem)
                        {
                            i += DI;
                            item[i] = w;
                            rem -= w;
                            item[INFO][LEN]++;
                            if (W) item[INFO][NMIN]++;
                            if (M === item[i]) item[INFO][NMAX]++;
                        }
                        if (W && 0 === item[INFO][NMIN])
                        {
                            rem += item[i]-W;
                            item[i] = W;
                            item[INFO][NMIN]++;
                        }
                        if (0 < m)
                        {
                            i += DI;
                            item[i] = M;
                            item[INFO][LEN]++;
                            item[INFO][NMAX]++;
                        }
                    }
                    if (0 < rem)
                    {
                        /*if (0 > DI)
                        {
                            MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                        }
                        else
                        {
                            MIN = 0; MAX = item[INFO][LEN]-1;
                        }*/
                        while(MIN<=i && i<=MAX && /*0<=DI*(i-j) &&*/ 0<rem)
                        {
                            m = item[i];
                            if (M > m)
                            {
                                if (W && W === m)
                                {
                                    if (1 === item[INFO][NMIN])
                                    {
                                        item[i] = item[i+DI];
                                        item[i+DI] = m;
                                    }
                                    else
                                    {
                                        item[INFO][NMIN]--;
                                        item[i] = stdMath.min(M, m+rem);
                                        rem -= item[i]-m;
                                        if (M === item[i]) item[INFO][NMAX]++;
                                    }
                                }
                                else
                                {
                                    item[i] = stdMath.min(M, m+rem);
                                    rem -= item[i]-m;
                                    if (M === item[i]) item[INFO][NMAX]++;
                                }
                            }
                            i -= DI;
                        }
                        if (0 < rem)
                        {
                            return null;
                        }
                    }
                }
            }
            else
            {
                if (W)
                {
                    w = W;
                    m = n-W;
                }
                else
                {
                    w = 1;
                    m = n;
                }
                if (m > item[i0])
                {
                    i = i1;
                    rem = item[i];
                    item[INFO][LEN]--;
                    if (W && W === item[i]) item[INFO][NMIN]--;
                    i -= DI;
                    if (W && W === item[i]) item[INFO][NMIN]--;
                    item[i]++;
                    rem--;
                    while (w <= rem)
                    {
                        i += DI;
                        item[i] = w;
                        rem -= w;
                        item[INFO][LEN]++;
                        if (W) item[INFO][NMIN]++;
                    }
                    if (W && 0 === item[INFO][NMIN])
                    {
                        rem += item[i]-W;
                        item[i] = W;
                        item[INFO][NMIN]++;
                    }
                    if (0 < rem)
                    {
                        if (W && 1 === item[INFO][NMIN] && W === item[i])
                        {
                            if (W < rem)
                            {
                                rem += item[i];
                                item[INFO][LEN]--;
                                item[INFO][NMIN]--;
                                i -= DI;
                                item[i]++;
                                rem--;
                                while (w <= rem)
                                {
                                    i += DI;
                                    item[i] = w;
                                    rem -= w;
                                    item[INFO][LEN]++;
                                    item[INFO][NMIN]++;
                                }
                                if (0 < rem)
                                {
                                    if (W === item[i]) item[INFO][NMIN]--;
                                    item[i] += rem;
                                }
                            }
                            else
                            {
                                item[i-DI] += rem;
                            }
                        }
                        else
                        {
                            if (W && W === item[i]) item[INFO][NMIN]--;
                            item[i] += rem;
                        }
                        rem = 0;
                    }
                    if (0 < rem) item = null;
                }
                // last
                else item = null;
            }
        }
    }
    return item;
}
