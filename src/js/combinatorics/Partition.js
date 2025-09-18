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
        M = null != $['max='] ? ($['max=']|0) : null;
        W = null != $['min='] ? ($['min=']|0) : null;
        K = null != $['parts='] ? ($['parts=']|0) : null;
        k1 = null != K ? K : (null != W && null != M ? (M === W ? stdMath.ceil(n/W) : stdMath.max(1, stdMath.ceil((n-M)/W))+1) : (null != W ? stdMath.ceil(n/W) : (null != M ? stdMath.max(0, n-M)+1 : n)));
        k0 = null != K ? K : (null != W && null != M ? (M === W ? stdMath.ceil(n/M) : stdMath.max(1, stdMath.ceil((n-W)/M))+1) : (null != W ? 2 : (null != M ? stdMath.ceil(n/M) : 1)));
        $.base = n;
        $.mindimension = stdMath.max(1, stdMath.min(k0, k1));
        $.maxdimension = stdMath.max(1, stdMath.max(k0, k1));
        $.dimension = $.maxdimension;
        $.rand = $.rand || {};
        if ('conjugate' === $.output) $.output = function(item, n) {
            return conjugatepartition(0, item, (REFLECTED & $.order) && !(COLEX & $.order) || (COLEX & $.order) && !(REFLECTED & $.order) ? -1 : 1);
        };
        else if ('subset' === $.output) $.output = function(item, n) {return Partition.toSubset(item);};
        else if ('packed' === $.output) $.output = function(item, n) {return Partition.toPacked(item);};
        CombinatorialIterator.call(self, "Partition", n, $, sub ? {method:$.submethod, iter:sub, pos:$.subpos, cascade:$.subcascade} : null);
    }

    ,__static__: {
         C: function(item, N, LEN, $, dir) {
            // C process / symmetry, ie Rotation/Complementation/Conjugation, CC = I
            var klass = this, is_composition = "composition" === ($ && $.type ? $.type : "partition"),
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                reflected = -1 === dir, itemlen;
            if ((null != K) || (null != M) || (null != W)) return item; // TODO
            if (LEN+1 === item.length)
            {
                item = reflected ? item.slice(LEN-item[LEN][0], LEN) : item.slice(0, item[LEN][0]);
                item = conjugatepartition(is_composition, item, dir);
                itemlen = item.length;
                if (itemlen < LEN) item[reflected ? 'unshift' : 'push'].apply(item, new Array(LEN-itemlen));
                item.push([itemlen, 0, 0]);
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
                order = $ && (null != $.order) ? $.order : LEX, order0 = null;
            if (/*('composition' !== type) &&*/ (COLEX & order))
            {
                order0 = $.order;
                $.order = REFLECTED & order ? (order & ~REFLECTED) : (order | REFLECTED);
            }
            item = CombinatorialIterator.DUAL.call(klass, item, n, $, dir);
            if ($ && (null != order0)) $.order = order0;
            return item;
        }
        ,count: function(n, $) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                type = $ && $.type ? $.type : "partition";
            if (0 > n)
            {
                return O;
            }
            else if (0 === n)
            {
                return ((null == K) || (0 < K)) && ((null == M) || (0 === M)) && ((null == W) || (0 === W)) ? Arithmetic.I : O;
            }
            else
            {
                return "composition" === type ? compositions(n, K, M, W) : partitions(n, K, M, W);
            }
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var klass = this, item, i, k, l, r, w, m,
                type = $ && $.type ? $.type : "partition",
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                order = $ && (null != $.order) ? $.order : LEX,
                LEN = $ && $.dimension ? $.dimension : 1,
                is_composition = "composition" === type, conj = false;

            if (0 === n)
            {
                item = ((null == K) || (0 < K)) && ((null == M) || (0 === M)) && ((null == W) || (0 === W)) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (0 > n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            )
            {
                return null;
            }
            else
            {
                dir = -1 === dir ? -1 : 1;

                if ((!(COLEX & order) && (REVERSED & order)) || ((COLEX & order) && !(REVERSED & order)))
                    dir = -dir;

                // O(n)
                item = new Array(LEN+1); item[LEN] = [0, 0, 0];
                if (K && M && W)
                {
                    // restricted partition n into exactly K parts with min part=W and max part=M
                    item[LEN][0] = K;

                    if (M === W)
                    {
                        item = K*M === n ? operate(function(item, ai, i) {
                            item[i] = M; ++item[LEN][1]; ++item[LEN][2];
                            return item;
                        }, item, null, 0, K-1, 1) : null;
                    }
                    else
                    {
                        if (1 >= K || n < W+M) return null;
                        if (is_composition)
                        {
                            m = n-W-M-(2 < K ? W*(K-2) : 0);
                            item[0] = M; ++item[LEN][1];
                            item = operate(function(item, ai, i) {
                                item[i] = stdMath.min(M, W+m);
                                m -= item[i]-W;
                                if (M === item[i]) ++item[LEN][1];
                                if (W === item[i]) ++item[LEN][2];
                                return item;
                            }, item, null, 1, K-2, 1);
                            item[K-1] = W; ++item[LEN][2];
                            if (0 < dir) reflection(item, item, K, 0, K-1);
                        }
                        else if (0 > dir)
                        {
                            m = n-W-M-(2 < K ? W*(K-2) : 0);
                            item[0] = M; ++item[LEN][1];
                            item = operate(function(item, ai, i) {
                                item[i] = stdMath.min(M, W+m);
                                m -= item[i]-W;
                                if (M === item[i]) ++item[LEN][1];
                                if (W === item[i]) ++item[LEN][2];
                                return item;
                            }, item, null, 1, K-2, 1);
                            item[K-1] = W; ++item[LEN][2];
                        }
                        else
                        {
                            m = stdMath.max(W, stdMath.min(M, 2 < K ? stdMath.floor((n-M-W)/(K-2)) : n-M-W)); k = 2 < K ? (n-M-W)%(K-2) : 0;
                            item = operate(function(item, ai, i) {
                                item[i] = 0===i ? M : (K-1===i ? W : (i-1<k?m+1:m));
                                if (M === item[i]) ++item[LEN][1];
                                if (W === item[i]) ++item[LEN][2];
                                return item;
                            }, item, null, 0, K-1, 1);
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
                        item = operate(function(item, ai, i) {
                            item[i] = M; ++item[LEN][1]; ++item[LEN][2];
                            return item;
                        }, item, null, 0, item[LEN][0]-1, 1);
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
                                --k;
                                m += M-W;
                                item[LEN][0] = k + 1 + (0 < m);
                            }
                            else
                            {
                                item[LEN][0] = k + 1 + (0 < m);
                            }
                            item = operate(function(item, ai, i) {
                                if (i < k)
                                {
                                    item[i] = M;
                                    ++item[LEN][1];
                                }
                                else if ((i === k) && (0 < m))
                                {
                                    item[i] = m;
                                    if (m === M) ++item[LEN][1];
                                    if (m === W) ++item[LEN][2];
                                }
                                else
                                {
                                    item[i] = W;
                                    ++item[LEN][2];
                                }
                                return item;
                            }, item, null, 0, item[LEN][0]-1, 1);
                        }
                        else
                        {
                            k = stdMath.floor((n-M)/W);
                            if (0 >= k) return null;
                            m = n-M-k*W;
                            l = stdMath.max(1, stdMath.floor(m/k));
                            item[LEN][0] = k+1;
                            item = operate(function(item, ai, i) {
                                if (0 === i)
                                {
                                    item[i] = M;
                                    ++item[LEN][1];
                                }
                                else if (0 < m)
                                {
                                    item[i] = W+l;
                                    if (item[i] === M) ++item[LEN][1];
                                    if (item[i] === W) ++item[LEN][2];
                                    m -= l;
                                }
                                else
                                {
                                    item[i] = W;
                                    ++item[LEN][2];
                                }
                                return item;
                            }, item, null, 0, item[LEN][0]-1, 1);
                            if (is_composition) reflection(item, item, item[LEN][0], 0, item[LEN][0]-1);
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
                        item = operate(function(item, ai, i) {
                            item[i] = W;
                            ++item[LEN][2];
                            return item;
                        }, item, null, 1, K-1, 1);
                        item[0] = m; if (W === m) ++item[LEN][2];
                        if (0 < dir) reflection(item, item, K, 0, K-1);
                    }
                    else if (0 > dir)
                    {
                        k = K-1; m = n-k*W;
                        item = operate(function(item, ai, i) {
                            item[i] = W;
                            ++item[LEN][2];
                            return item;
                        }, item, null, 1, K-1, 1);
                        item[0] = m; if (W === m) ++item[LEN][2];
                    }
                    else
                    {
                        m = stdMath.max(W, 1 < K ? stdMath.floor((n-W)/(K-1)) : n-W); k = 1 < K ? (n-W)%(K-1) : 0;
                        item = operate(function(item, ai, i) {
                            item[i] = i < k ? (m+1) : m;
                            if (W === item[i]) ++item[LEN][2];
                            return item;
                        }, item, null, 0, K-2, 1);
                        item[K-1] = W; ++item[LEN][2];
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
                        item = operate(function(item, ai, i) {
                            var index = K-1-i;
                            item[index] = stdMath.min(M, m-index);
                            m -= item[index];
                            if (M === item[index]) ++item[LEN][1];
                            return item;
                        }, item, null, 0, K-1, 1);
                        if (0 > dir) reflection(item, item, K, 0, K-1);
                    }
                    else if (0 > dir)
                    {
                        m = n;
                        item = operate(function(item, ai, i) {
                            item[i] = stdMath.min(M, m-(K-i-1));
                            if (M === item[i]) ++item[LEN][1];
                            m -= item[i];
                            return item;
                        }, item, null, 0, K-1, 1);
                    }
                    else
                    {
                        m = stdMath.min(M, 1 < K ? stdMath.floor((n-M)/(K-1)) : n-M); k = 1 < K ? (n-M)%(K-1) : 0;
                        item = operate(function(item, ai, i) {
                            item[i] = 0 === i ? M : (i-1 < k ? (m+1) : m);
                            if (M === item[i]) ++item[LEN][1];
                            return item;
                        }, item, null, 0, K-1, 1);
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
                            item = operate(function(item, ai, i) {
                                item[i] = i+1 < K ? 1 : (n-K+1);
                                return item;
                            }, item, null, 0, K-1, 1/*array(K-1, 1, 0).concat([n-K+1])*/);
                            if (0 > dir) reflection(item, item, K, 0, K-1);
                        }
                        else
                        {
                            m = stdMath.floor(n/K); k = n%K;
                            item = operate(function(item, ai, i) {
                                item[i] = 0 > dir ? (0 === i ? (n-K+1) : 1) : (m + (i<k));
                                return item;
                            }, item, null, 0, K-1, 1/*0 > dir ? [n-K+1].concat(array(K-1, 1, 0)) : array(K, function(i){return m+(i<k);})*/);
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
                            item[LEN][2] = 1 + (W === item[0] ? 1 : 0);
                        }
                        else if (is_composition)
                        {
                            k = stdMath.floor(n/W);
                            m = n-k*W;
                            if ((0 < m) && (W > m))
                            {
                                --k;
                                m += W;
                                item[LEN][0] = k+1;
                            }
                            else
                            {
                                item[LEN][0] = k + (0 < m);
                            }
                            item = operate(function(item, ai, j) {
                                if (j < k)
                                {
                                    item[j] = W;
                                    ++item[LEN][2];
                                }
                                else
                                {
                                    item[j] = m;
                                    if (W === m) ++item[LEN][2];
                                }
                                return item;
                            }, item, null, 0, item[LEN][0]-1, 1);
                        }
                        else
                        {
                            k = stdMath.floor(n/W);
                            m = n-k*W;
                            if (1 < k)
                            {
                                l = stdMath.floor(m/(k-1));
                                i = m % (k-1);
                            }
                            else
                            {
                                l = 0;
                                i = 0;
                            }
                            item[LEN][0] = k;
                            item = operate(function(item, ai, j) {
                                if (0 < m)
                                {
                                    item[j] = W+l;
                                    m -= l;
                                    if (0 < i)
                                    {
                                        ++item[j];
                                        --i;
                                        --m;
                                    }
                                    if (W === item[j]) ++item[LEN][2];
                                }
                                else
                                {
                                    item[j] = W;
                                    ++item[LEN][2];
                                }
                                return item;
                            }, item, null, 0, item[LEN][0]-1, 1);
                        }
                    }
                    else if (M)
                    {
                        // restricted partition n into parts with largest part=M
                        // equivalent to conjugate to partition n into exactly M parts
                        k = stdMath.floor(n/M); m = n%M;
                        if (is_composition)
                        {
                            item = operate(function(item, ai, i) {
                                item[i] = ai; item[LEN][0]++;
                                if (M === item[i]) ++item[LEN][1];
                                return item;
                            }, item, 0 > dir ? array(k, M, 0).concat(m ? [m] : []) : array(n-M, 1, 0).concat([M]));
                        }
                        else
                        {
                            item = operate(function(item, ai, i) {
                                item[i] = ai; ++item[LEN][0];
                                if (M === item[i]) ++item[LEN][1];
                                return item;
                            }, item, 0 > dir ? array(k, M, 0).concat(m ? [m] : []) : [M].concat(array(n-M, 1, 0)));
                        }
                    }
                    else
                    {
                        // unrestricted partition/composition
                        item = operate(function(item, ai, i) {
                            item[i] = ai; ++item[LEN][0]; return item;
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
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                i, l, x, k0, k1, d0, d1;

            if (
                !item || !item.length
                || (0 > n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            )
                return false;

            k1 = (null != K) ? K : ((null != W) && (null != M) ? (M === W ? stdMath.ceil(n/W) : stdMath.max(1, stdMath.ceil((n-M)/W))+1) : ((null != W) ? stdMath.ceil(n/W) : ((null != M) ? stdMath.max(0, n-M)+1 : n)));
            k0 = (null != K) ? K : ((null != W) && (null != M) ? (M === W ? stdMath.ceil(n/M) : stdMath.max(1, stdMath.ceil((n-W)/M))+1) : ((null != W) ? 2 : ((null != M) ? stdMath.ceil(n/M) : 1)));
            d0 = stdMath.max(1, stdMath.min(k0, k1));
            d1 = stdMath.max(1, stdMath.max(k0, k1));
            if (d0 > item.length || d1 < item.length) return false;

            item = klass.DUAL(item.slice(), n, $, -1);
            if ("'composition" === type)
            {
                if ((null != W) && (M === W))
                {
                    return ((null == K) || (n === K*M)) && (0 === item.filter(function(x) {return x !== M;}).length) ? true : false;
                }
                for (i=0,l=item.length; i<l; ++i)
                {
                    x = item[i];
                    if ((0 >= x) || (x > n) || (W && (x < W)) || (M && (x > M))) return false;
                    n -= x;
                }
                if (0 !== n) return false;
            }
            else
            {
                if ((null != W) && (M === W))
                {
                    return ((null == K) || (n === K*M)) && (0 === item.filter(function(x) {return x !== M;}).length) ? true : false;
                }
                for (i=0,l=item.length; i<l; ++i)
                {
                    x = item[i];
                    if ((0 >= x) || (x > n) || (W && (x < W)) || (M && (x > M)) || ((i+1 < l) && (x < item[i+1]))) return false;
                    n -= x;
                }
                if (0 !== n) return false;
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, PI) {
            if ((null == n) || (null == item)) return null;
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                dim = $ && $.dimension ? $.dimension : 1,
                order = $ && (null != $.order) ? $.order : LEX;

            if (
                (0 >= n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            ) return null;

            function next_item(item, n, $, dir)
            {
                return klass.unrank(Arithmetic.add(klass.rank(item, n, $), 0 > dir ? Arithmetic.J : Arithmetic.I), n, $);
            }

            dir = -1 === dir ? -1 : 1;
            if ("composition" === type)
            {
                if ((null != W) && (null == K))
                {
                    // succ not working correctly, use default rank/unrank
                    return next_item(item, n, $, dir);
                }
                else
                {
                    return next_composition(item, n, dir, K, M, W, dim, order, PI);
                }
            }
            else
            {
                if ((null != W) && (null == K))
                {
                    // succ not working correctly, use default rank/unrank
                    return next_item(item, n, $, dir);
                }
                else
                {
                    return next_partition(item, n, dir, K, M, W, dim, order, PI);
                }
            }
        }
        ,rand: function(n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && (null != $.order) ? $.order : LEX,
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                LEN = $ && $.dimension ? $.dimension : 1,
                O = Arithmetic.O, I = Arithmetic.I,
                item = null, index, total, last;

            if (0 === n)
            {
                item = ((null == K) || (0 < K)) && ((null == M) || (0 === M)) && ((null == W) || (0 === W)) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (0 > n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            )
            {
                return null;
            }
            else
            {
                total = $ && (null != $.count) ? $.count : klass.count(n, $);
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
                order = $ && (null != $.order) ? $.order : LEX,
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                LEN = $ && $.dimension ? $.dimension : 1,
                index, J = Arithmetic.J, O = Arithmetic.O,
                i, x, w, m, l, c, total, last;

            if (item && (0 === n))
            {
                if (LEN+1 === item.length)
                {
                    item = REFLECTED & order ? item.slice(LEN-item[LEN][0], LEN) : item.slice(0, item[LEN][0]);
                }
                //if (REFLECTED & order) item = item.slice().reverse();
                item = klass.DUAL(item.slice(), n, $, -1);

                index = ((null == K) || (0 < K)) && ((null == M) || (0 === M)) && ((null == W) || (0 === W)) && ((K||1) === item.length) && (item.length === item.filter(function(x) {return 0 === x;}).length) ? O : J;
            }
            else if (
                !item || !item.length
                || (0 > n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            )
            {
                return J;
            }
            else
            {
                if (LEN+1 === item.length)
                {
                    item = REFLECTED & order ? item.slice(LEN-item[LEN][0], LEN) : item.slice(0, item[LEN][0]);
                }
                if (($.mindimension > item.length) || ($.maxdimension < item.length)) return J;

                //if (REFLECTED & order) item = item.slice().reverse();
                item = klass.DUAL(item.slice(), n, $, -1);

                total = $ && (null != $.count) ? $.count : klass.count(n, $);
                last = Arithmetic.sub(total, 1);

                if ("composition" === type)
                {
                    index = O;
                    if (W && (M === W))
                    {
                        return ((null == K) || (n === K*M)) && (0 === item.filter(function(x) {return x !== M;}).length) ? O : J;
                    }
                    for (w=0,m=0,i=0,l=item.length; i<l; ++i)
                    {
                        x = item[i];
                        if ((0 >= x) || (x > n) || (W && (x < W)) || (M && (x > M))) return J;
                        index = Arithmetic.add(index, W === x ? O : comp_rank(n, x, W, M, K ? K-i : null, w, m));
                        if (W === x) ++w;
                        if (M === x) ++m;
                        n -= x;
                    }
                    if ((0 !== n) || (i !== l)) return J;
                    if (REVERSED & order) index = Arithmetic.sub(last, index);
                }
                else
                {
                    index = last;
                    if (W)
                    {
                        if (M === W) return ((null == K) || (n === K*M)) && (0 === item.filter(function(x) {return x !== M;}).length) ? O : J;
                        n -= W; if (K) --K;
                    }
                    for (i=0,l=item.length; i<l; ++i)
                    {
                        x = item[i];
                        if (W && (i+1 === l) && (W === x) && (0 === n)) continue;
                        if ((0 >= x) || (x > n) || (W && (x < W)) || (M && (x > M)) || ((i+1 < l) && (x < item[i+1]))) return J;
                        index = Arithmetic.sub(index, M && (0 === i) ? O : part_rank(n, x, W, M, K ? K-i : null));
                        n -= x;
                    }
                    if ((0 !== n) || (i !== l)) return J;
                    if (!(REVERSED & order)) index = Arithmetic.sub(last, index);
                }
            }
            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "partition",
                order = $ && (null != $.order) ? $.order : LEX,
                M = $ && (null != $['max=']) ? ($['max=']|0) : null,
                W = $ && (null != $['min=']) ? ($['min=']|0) : null,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                item = [], O = Arithmetic.O, i, x, w, m, c, total, last,
                LEN = $ && $.dimension ? $.dimension : 1;

            index = null == index ? null : Arithmetic.num(index);
            total = $ && (null != $.count) ? $.count : klass.count(n, $);
            last = Arithmetic.sub(total, 1);

            if ((0 === n) && (null != index))
            {
                item = Arithmetic.equ(O, index) && ((null == K) || (0 < K)) && ((null == M) || (0 === M)) && ((null == W) || (0 === W)) ? array(K || 1, 0, 0) : null;
            }
            else if (
                (null == index)
                || Arithmetic.lt(index, O) || Arithmetic.gt(index, last)
                || (0 > n)
                || ((null != K) && (null != M) && (null != W) && ((0 >= K) || (0 >= W) || (0 >= M) || (W > M) || (K*W+M > n+W) || (K*M+W < n+M)))
                || ((null != M) && (null != W) && ((0 >= M) || (0 >= W) || (W > M) || (M > n) || (W > n) || ((M === W) && (0 !== (n % M))) || ((M !== W) && ((M+W > n) || ((M+W < n) && (n-(M+W) < W))))))
                || ((null != K) && (null != W) && ((0 >= K) || (0 >= W) || (K*W > n)))
                || ((null != K) && (null != M) && ((0 >= K) || (0 >= M) || (K+M > n+1) || (K*M < n)))
                || ((null != W) && ((0 >= W) || (W > n) || ((W < n) && (W+W > n))))
                || ((null != M) && ((0 >= M) || (M > n)))
                || ((null != K) && ((0 >= K) || (K > n)))
            )
            {
                return null;
            }
            else
            {
                if (REVERSED & order) index = Arithmetic.sub(last, index);
                if ("composition" === type)
                {
                    if (W && (M === W))
                    {
                        item = (null == K) || (stdMath.floor(n/M) === K) ? array(stdMath.floor(n/M), M) : null;
                    }
                    if (item && !item.length)
                    {
                        for (w=0,m=0,i=0; 0<n; ++i)
                        {
                            x = W && (0 === i) ? n-W : n;
                            x = M ? stdMath.min(M, x) : x;
                            while ((!W || (W <= x)) && (1 <= x) && Arithmetic.gt(c=comp_rank(n, x, W, M, K ? K-i : null, w, m), index)) --x;
                            if ((0 >= x) || (W && (W > x))) break;
                            if (W === x) ++w;
                            if (M === x) ++m;
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
                            item = (null == K) || (stdMath.floor(n/M) === K) ? array(stdMath.floor(n/M), M) : null;
                        }
                        else
                        {
                            n -= W; if (K) --K;
                        }
                    }
                    if (M)
                    {
                        n -= M; if (K) --K;
                    }
                    if (item && !item.length)
                    {
                        for (i=0; 0<n; ++i)
                        {
                            x = M ? stdMath.min(M, n) : n;
                            while ((!W || (W <= x)) && (1 <= x) && Arithmetic.gt(c=part_rank(n, x, W, M, K ? K-i : null), index)) --x;
                            if ((0 >= x) || (W && (W > x))) break;
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
            return conjugatepartition("composition" === type, item);
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
            order = $ && (null != $.order) ? $.order : LEX,
            M = $ && (null != $['max=']) ? ($['max=']|0) : null,
            W = $ && (null != $['min=']) ? ($['min=']|0) : null,
            K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
            LEN = $.dimension, itemlen, x, y = 0, z = 0;
        if ((null != item) && (LEN+1 !== item.length))
        {
            itemlen = item.length;
            item = item.slice();
            if ((null != M) || (null != W))
            {
                for (x=0,y=0,z=0; x<itemlen; ++x)
                {
                    if (M === item[x]) ++y;
                    if (W === item[x]) ++z;
                }
            }
            if (itemlen < LEN)
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
            M = null != $['max='] ? ($['max=']|0) : null,
            W = null != $['min='] ? ($['min=']|0) : null,
            K = null != $['parts='] ? ($['parts=']|0) : null,
            order = null != $.order ? $.order : LEX, LEN = $.dimension;
        if (LEN+1 === item.length)
        {
            item = REFLECTED & order ? item.slice(LEN-item[LEN][0], LEN) : item.slice(0, item[LEN][0]);
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
});
function next_partition(item, N, dir, K, M, W, LN, order, PI)
{
    //maybe "use asm"
    var n = N, INFO = LN, LEN = 0, NMAX = 1, NMIN = 2,
        i, j, i0, i1, k, nn, m, w, d, l, r, rem, DI = 1, MIN, MAX;

    if ((0 >= n) || (null != K && 0 >= K) || (null != W && 0 >= W) || (null != M && 0 >= M)) return null;

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
            if ((-1 === i) || (MAX < i+r*DI) || (MIN > i-l*DI))
            {
                item = null;
            }
            else
            {
                if (M === item[i]) --item[INFO][NMAX];
                --item[i];
                if (W === item[i]) ++item[INFO][NMIN];
                i += DI;
                rem = 1; k = 0; j = i;
                while ((MIN <= j-l*DI) && (j+r*DI <= MAX)) {++k; rem += item[j]; j += DI;}
                while ((0 < k) && (0 < rem) && (MIN <= i-l*DI) && (i+r*DI <= MAX))
                {
                    --k;
                    if (M === item[i]) --item[INFO][NMAX];
                    if (W === item[i]) --item[INFO][NMIN];
                    item[i] = stdMath.min(MIN <= i-DI && i-DI <= MAX ? item[i-DI] : n, stdMath.max(w, rem-w*k));
                    rem -= item[i];
                    if (M === item[i]) ++item[INFO][NMAX];
                    if (W === item[i]) ++item[INFO][NMIN];
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
            if (((MIN <= j) && (j <= MAX)) && (item[j] > w))
            {
                i = i1; rem = 0; l = 0; r = 0;
                while (((MIN <= i) && (i <= MAX)) && (DI*(i-j) >= 0) && (w === item[i]))
                {
                    rem += item[i];
                    if (M === item[i]) ++l;
                    if (W === item[i]) ++r;
                    i -= DI;
                }
                if (M === item[i]) --item[INFO][NMAX];
                m = item[i]-1; ++rem; item[i] = m;
                item[INFO][LEN] = (0 > DI ? LN-i : i+1) + (W ? 1 : 0);
                item[INFO][NMAX] -= l;
                item[INFO][NMIN] -= r;
                if (W === item[i]) ++item[INFO][NMIN];
                if (m < rem)
                {
                    j = rem % m;
                    rem = stdMath.floor(rem/m);
                    while (0 < rem--)
                    {
                        i += DI;
                        item[i] = m;
                        ++item[INFO][LEN];
                        if (M === item[i]) ++item[INFO][NMAX];
                        if (W === item[i]) ++item[INFO][NMIN];
                    }
                    rem = j;
                }
                if (w <= rem)
                {
                    i += DI;
                    item[i] = rem; rem = 0;
                    ++item[INFO][LEN];
                    if (M === item[i]) ++item[INFO][NMAX];
                    if (W === item[i]) ++item[INFO][NMIN];
                }
                if (0 < rem)
                {
                    return null;
                }
                if (W)
                {
                    i += DI;
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
            while ((MIN <= i) && (i <= MAX) && (w === item[i])) {rem += item[i]; ++k; i -= DI;}
            if ((i < MIN) || (i > MAX))
            {
                item = null;
            }
            else
            {
                if (M === item[i]) --item[INFO][NMAX];
                if (W === item[i]-1) ++item[INFO][NMIN];
                --item[i]; rem += item[i]; ++k; i -= DI;
                if ((i < MIN) || (i > MAX))
                {
                    item = null;
                }
                else
                {
                    while ((MIN <= i) && (i <= MAX) && ((M && (M < item[i]+1)) || ((MIN <= i-DI) && (i-DI <= MAX) && (item[i-DI] < item[i]+1)))) {rem += item[i]; ++k; i -= DI;}
                    if ((i < MIN) || (i > MAX))
                    {
                        item = null;
                    }
                    else
                    {
                        ++item[i];
                        if (M === item[i]) ++item[INFO][NMAX];
                        m = 0 < k ? rem % k : 0;
                        d = 0 < k ? stdMath.floor(rem/k) : rem;
                        j = 0;
                        while (0 < rem)
                        {
                            i += DI;
                            if (M === item[i]) --item[INFO][NMAX];
                            if (W === item[i]) --item[INFO][NMIN];
                            item[i] = d+(j<m); rem -= item[i];
                            if (M === item[i]) ++item[INFO][NMAX];
                            if (W === item[i]) ++item[INFO][NMIN];
                            ++j;
                        }
                        if (W)
                        {
                            item[i1] = W;
                            //++item[INFO][NMIN];
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
                m = /*MAX*/(item[INFO][LEN] > k+1) || (item[i0+(k-1)*DI] < m);
                j = i0+DI;
            }
            else
            {
                w = 1;
                m = item[i0] < n;
                j = i0;
            }
            if ((MIN <= j) && (j <= MAX) && m)
            {
                l = 0; r = 0; rem = 0;
                if (0 < MAX)
                {
                    i = i1-DI;
                    rem += item[i1];
                    if (M === item[i1]) ++l;
                    if (W === item[i1]) ++r;
                }
                else
                {
                    i = i1;
                }
                while (((MIN <= i) && (i <= MAX)) && ((MIN <= i-DI) && (i-DI <= MAX)) && (DI*(i-j) > 0) && (item[i-DI] === item[i] || (W && (rem-1 < W))))
                {
                    rem += item[i];
                    if (M === item[i]) ++l;
                    if (W === item[i]) ++r;
                    i -= DI;
                }
                if (M && (M <= item[i])) return null;
                item[INFO][LEN] = (0 > DI ? LN-i : i+1);
                item[INFO][NMAX] -= l;
                item[INFO][NMIN] -= r;
                if (W === item[i]) --item[INFO][NMIN];
                ++item[i]; --rem; j = i;
                if (M === item[i]) ++item[INFO][NMAX];
                while (w <= rem)
                {
                    i += DI; ++item[INFO][LEN];
                    item[i] = w; rem -= w;
                    if (W) item[INFO][NMIN]++;
                    if (M === item[i]) ++item[INFO][NMAX];
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
                    while ((MIN <= i) && (i <= MAX) && (0 < rem))
                    {
                        m = (MIN <= i-DI) && (i-DI <= MAX) ? (item[i-DI] > item[i] ? 1 : 0) : stdMath.min(M ? M-item[i] : rem, rem);
                        if (W === item[i])
                        {
                            if (1 === item[INFO][NMIN])
                            {
                                i = j;
                                while ((MIN <= i) && (i <= MAX) && (MIN <= i-DI) && (i-DI <= MAX) && (item[i-DI] === item[i])) i -= DI;
                                if ((MIN <= i-DI) && (i-DI <= MAX))
                                {
                                    ++item[i]; --rem;
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
                                --item[INFO][NMIN];
                            }
                        }
                        item[i] += m; rem -= m;
                        if (M === item[i]) ++item[INFO][NMAX];
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

    if ((0 >= n) || ((null != K) && (0 >= K)) || ((null != W) && (0 >= W)) || ((null != M) && (0 >= M))) return null;

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
                    while ((MIN <= i) && (i <= MAX) && ((W === item[i]) || (M < item[j]+1)))
                    {
                        rem += item[i];
                        ++k;
                        j = i;
                        i -= DI;
                    }
                    if ((MIN > i) || (i > MAX))
                    {
                        item = null;
                    }
                    else
                    {
                        if (0 < d)
                        {
                            m = rem+1-W*(k-1);
                            if ((1 === item[INFO][NMIN]) && (W === item[j]) && ((k-1)*M+W < rem+1))
                            {
                                rem += item[i]-W; item[i] = W;
                                ++item[INFO][NMIN];
                            }
                            else if ((1 === item[INFO][NMAX]) && (M === item[i]) && (M > m))
                            {
                                item[i] = stdMath.max(item[j], item[i1]); rem += M-item[i];
                                if (M !== item[i]) --item[INFO][NMAX];
                                if (W === item[i]) ++item[INFO][NMIN];
                            }
                            else
                            {
                                if (M === item[i]) --item[INFO][NMAX];
                                ++rem; --item[i];
                                if (W === item[i]) ++item[INFO][NMIN];
                            }
                            m = rem-W*k;
                            while ((0 < rem) && (MIN <= j) && (j <= MAX))
                            {
                                if (W === item[j]) --item[INFO][NMIN];
                                if (M === item[j]) --item[INFO][NMAX];
                                item[j] = stdMath.min(M, W+m);
                                rem -= item[j]; m -= item[j]-W;
                                if (M === item[j]) ++item[INFO][NMAX];
                                if (W === item[j]) ++item[INFO][NMIN];
                                j += DI;
                            }
                        }
                        else
                        {
                            if ((1 === item[INFO][NMIN]) && (W === item[j]))
                            {
                                item[j] = item[i]; item[i] = W;
                            }
                            else if ((1 === item[INFO][NMAX]) && (M === item[i]) && (M > item[j]+1))
                            {
                                item[i] = item[j]; item[j] = M;
                            }
                            else
                            {
                                if (M === item[i]) --item[INFO][NMAX];
                                if (W === item[j]) --item[INFO][NMIN];
                                --item[i]; ++item[j];
                                if (M === item[j]) ++item[INFO][NMAX];
                                if (W === item[i]) ++item[INFO][NMIN];
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
                        while ((MIN <= i) && (i <= MAX) && (W === item[i])) i -= DI;
                        j = i+DI;
                        if ((1 === item[INFO][NMIN]) && (W === item[j]) && (j === i1))
                        {
                            item[j] = item[i]; item[i] = W;
                        }
                        else
                        {
                            if (W === item[j]) --item[INFO][NMIN];
                            --item[i]; item[i1] = W; item[j] = 1+m;
                            if (W === item[i]) ++item[INFO][NMIN];
                            if ((item[i1] === W) && (W !== m)) ++item[INFO][NMIN];
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
                    while ((MIN <= i) && (i <= MAX) && ((1 === item[i]) || (M < item[j]+1)))
                    {
                        rem += item[i];
                        ++k;
                        j = i;
                        i -= DI;
                    }
                    if ((MIN > i) || (i > MAX))
                    {
                        item = null;
                    }
                    else
                    {
                        if (0 < d)
                        {
                            if ((1 === item[INFO][NMAX]) && (M === item[i]) && (M > rem-(k-1)+1))
                            {
                                item[i] = stdMath.max(item[j], item[i1]); rem += M-item[i];
                                if (M !== item[i]) --item[INFO][NMAX];
                            }
                            else
                            {
                                if (M === item[i]) --item[INFO][NMAX];
                                --item[i]; ++rem;
                            }
                            l = 0;
                            while ((0 < rem) && (MIN <= j) && (j <= MAX))
                            {
                                if (M === item[j]) --item[INFO][NMAX];
                                item[j] = stdMath.min(M, rem-(k-l-1));
                                rem -= item[j];
                                if (M === item[j]) ++item[INFO][NMAX];
                                j += DI; ++l;
                            }
                        }
                        else
                        {
                            if ((1 === item[INFO][NMAX]) && (M === item[i]) && (M > item[j]+1))
                            {
                                item[i] = item[j]; item[j] = M;
                            }
                            else
                            {
                                if (M === item[i]) --item[INFO][NMAX];
                                --item[i]; ++item[j];
                                if (M === item[j]) ++item[INFO][NMAX];
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
                        while ((MIN <= i) && (i <= MAX) && (1 === item[i])) i += DI;
                        --item[i];
                        if ((MIN <= i-DI) && (i-DI <= MAX)) item[i-DI] = 1+m;
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
                        while ((MIN <= i) && (i <= MAX) && (1 === item[i])) i -= DI;
                        --item[i];
                        if ((MIN <= i+DI) && (i+DI <= MAX)) item[i+DI] = 1+m;
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
                while ((MIN <= i) && (i <= MAX) && (1 === item[i]))
                {
                    if (M === item[i]) ++l;
                    i -= DI;
                    ++rem;
                    --k;
                }
                if ((i < MIN) || (i > MAX))
                {
                    item = null;
                }
                else
                {
                    if ((1 === item[INFO][NMAX]) && (M === item[i]))
                    {
                        if (n === M)
                        {
                            item = null;
                        }
                        else if (M <= rem+1)
                        {
                            if (M === item[i]) --item[INFO][NMAX];
                            --item[i]; ++rem; item[INFO][LEN] = k; item[INFO][NMAX] -= l;
                            while (0 < rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                ++item[INFO][LEN];
                                if (M === item[i]) ++item[INFO][NMAX];
                                rem -= item[i];
                            }
                        }
                        else if (M < item[i]+rem)
                        {
                            if (M === item[i]) item[INFO][NMAX]--;
                            item[i] -= M-rem; rem = M; item[INFO][LEN] = k; item[INFO][NMAX] -= l;
                            while (0 < rem)
                            {
                                i += DI;
                                item[i] = stdMath.min(M, rem);
                                ++item[INFO][LEN];
                                if (M === item[i]) ++item[INFO][NMAX];
                                rem -= item[i];
                            }
                        }
                        else
                        {
                            if (M === item[i]) ++l;
                            rem += item[i]; i -= DI; --k;
                            while ((MIN <= i) && (i <= MAX) && (1 === item[i]))
                            {
                                if (M === item[i]) ++l;
                                i -= DI;
                                ++rem;
                                --k;
                            }
                            /*if (0 > DI)
                            {
                                MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                            }
                            else
                            {
                                MIN = 0; MAX = item[INFO][LEN]-1;
                            }*/
                            if ((i < MIN) || (i > MAX))
                            {
                                item = null;
                            }
                            else
                            {
                                if (M === item[i]) --item[INFO][NMAX];
                                --item[i]; ++rem; item[INFO][LEN] = k; item[INFO][NMAX] -= l;
                                while (0 < rem)
                                {
                                    i += DI;
                                    item[i] = stdMath.min(M, rem);
                                    ++item[INFO][LEN];
                                    if (M === item[i]) ++item[INFO][NMAX];
                                    rem -= item[i];
                                }
                            }
                        }
                    }
                    else
                    {
                        if (M === item[i]) --item[INFO][NMAX];
                        --item[i]; ++rem; item[INFO][LEN] = k; item[INFO][NMAX] -= l;
                        while (0 < rem)
                        {
                            i += DI;
                            item[i] = stdMath.min(M, rem);
                            ++item[INFO][LEN];
                            if (M === item[i]) ++item[INFO][NMAX];
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
                    while ((MIN <= i) && (i <= MAX) && (1 === item[i])) {i -= DI; ++rem;}
                    m = item[i]-1; item[i] = m; ++rem;
                    if (0 < rem)
                    {
                        if ((MIN <= i+DI) && (i+DI <= MAX))
                        {
                            i += DI; item[i] = rem; rem = 0;
                            item[INFO][LEN] = 0 > DI ? LN-i : i+1;
                        }
                        else
                        {
                            while (0 < rem--) {i += DI; item[i] = 1; ++item[INFO][LEN];}
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
                while ((MIN <= i) && (i <= MAX) && ((M < item[i]+1) || (W === item[j]))) {rem += item[i]; ++k; j = i; i -= DI;}
                if ((MIN > i) || (i > MAX))
                {
                    item = null;
                }
                else
                {
                    if (0 < d)
                    {
                        m = rem-1-W*(k-1);
                        if ((1 === item[INFO][NMIN]) && (W === item[i]) && (k <= m))
                        {
                            item[i] = item[i1]; item[i1] = W; rem -= item[i]-W;
                        }
                        else if ((1 === item[INFO][NMAX]) && (M === item[j]) && (M > item[i]+1) && (M > m))
                        {
                            item[j] = item[i]; item[i] = M; rem -= M-item[j];
                        }
                        else
                        {
                            if (W === item[i]) --item[INFO][NMIN];
                            ++item[i]; --rem;
                            if (M === item[i]) ++item[INFO][NMAX];
                        }
                        i = i1; m = rem-W*k;
                        while ((MIN <= i) && (i <= MAX) && (0 < rem))
                        {
                            if (M === item[i]) --item[INFO][NMAX];
                            if (W === item[i]) --item[INFO][NMIN];
                            item[i] = stdMath.min(M, W+m);
                            rem -= item[i]; m -= item[i]-W;
                            if (M === item[i]) ++item[INFO][NMAX];
                            if (W === item[i]) ++item[INFO][NMIN];
                            i -= DI; ++l;
                        }
                    }
                    else
                    {
                        if ((1 === item[INFO][NMAX]) && (M === item[j]) && (M > item[i]+1))
                        {
                            item[j] = item[i]; item[i] = M;
                        }
                        else
                        {
                            if (M === item[j]) --item[INFO][NMAX];
                            if (W === item[i]) --item[INFO][NMIN];
                            ++item[i]; --item[j];
                            if (W === item[j]) ++item[INFO][NMIN];
                            if (M === item[i]) ++item[INFO][NMAX];
                        }
                    }
                }
            }
            else if (W)
            {
                if (n-W*(K-1) > item[i0])
                {
                    i = i1;
                    while ((MIN <= i) && (i <= MAX) && (W === item[i])) i -= DI;
                    j = i-DI;
                    if ((1 === item[INFO][NMIN]) && (W === item[j]))
                    {
                        item[j] = item[i]; item[i] = W;
                    }
                    else
                    {
                        if (W === item[j]) --item[INFO][NMIN];
                        --item[i]; ++item[j];
                        if (W === item[i]) ++item[INFO][NMIN];
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
                while ((MIN <= i) && (i <= MAX) && ((M && (M < item[i]+1)) || (1 === item[j]))) {rem += item[i]; ++k; j = i; i -= DI;}
                if ((MIN > i) || (i > MAX))
                {
                    item = null;
                }
                else
                {
                    if (0 < d)
                    {
                        if (M && (1 === item[INFO][NMAX]) && (M === item[j]) && (M > item[i]+1) && (M > rem-(k-1)-1))
                        {
                            item[j] = item[i]; item[i] = M; rem -= M-item[j];
                        }
                        else
                        {
                            ++item[i]; --rem;
                            if (M === item[i]) ++item[INFO][NMAX];
                        }
                        l = 0; i = i1;
                        while ((MIN <= i) && (i <= MAX) && (0 < rem))
                        {
                            if (M === item[i]) --item[INFO][NMAX];
                            item[i] = stdMath.min(M, rem-(k-l-1));
                            rem -= item[i];
                            if (M === item[i]) ++item[INFO][NMAX];
                            i -= DI; ++l;
                        }
                    }
                    else
                    {
                        if ((1 === item[INFO][NMAX]) && (M === item[j]) && (M > item[i]+1))
                        {
                            item[j] = item[i]; item[i] = M;
                        }
                        else
                        {
                            if (M === item[j]) --item[INFO][NMAX];
                            ++item[i]; --item[j];
                            if (M === item[i]) ++item[INFO][NMAX];
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
                        while ((MIN <= i) && (i <= MAX) && (1 === item[i])) i += DI;
                        m = item[i]; item[i] = 1; item[i0] = m-1;
                        if ((MIN <= i+DI) && (i+DI <= MAX)) ++item[i+DI];
                    }
                    // last
                    else item = null;
                }
                else
                {
                    if (n-K+1 > item[i0])
                    {
                        i = i1;
                        while ((MIN <= i) && (i <= MAX) && (1 === item[i])) i -= DI;
                        m = item[i]; item[i] = 1; item[i1] = m-1;
                        if ((MIN <= i-DI) && (i-DI <= MAX)) ++item[i-DI];
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
                if (M === item[i]) --item[INFO][NMAX];
                if (W && W === item[i]) --item[INFO][NMIN];
                --item[INFO][LEN];
                i -= DI;
                while ((null != W) && (MIN <= i) && (i <= MAX) && (rem < 1+W))
                {
                    rem += item[i];
                    --item[INFO][LEN];
                    if (M === item[i]) --item[INFO][NMAX];
                    if (W === item[i]) --item[INFO][NMIN];
                    i -= DI;
                }
                if ((MIN > i) || (MAX < i))
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
                        ++item[INFO][NMAX];
                        while (w <= rem)
                        {
                            i += DI;
                            item[i] = w;
                            rem -= w;
                            ++item[INFO][LEN];
                            if (W) ++item[INFO][NMIN];
                            if (M === item[i]) ++item[INFO][NMAX];
                        }
                        if ((null != W) && (0 === item[INFO][NMIN]))
                        {
                            rem += item[i]-W;
                            item[i] = W;
                            ++item[INFO][NMIN];
                        }
                    }
                }
                else
                {
                    l = 0; r = 0; m = 0;
                    while ((MIN <= i) && (i <= MAX) && (M === item[i]))
                    {
                        ++l;
                        m += item[i];
                        i -= DI;
                        --k;
                    }
                    /*if (0 > DI)
                    {
                        MIN = LN-(item[INFO][LEN]||1); MAX = LN-1;
                    }
                    else
                    {
                        MIN = 0; MAX = item[INFO][LEN]-1;
                    }*/
                    if ((MIN > i) || (MAX < i))
                    {
                        return null;
                    }
                    else
                    {
                        j = i;
                        ++item[i];
                        rem += m-1;
                        item[INFO][LEN] = k;
                        item[INFO][NMAX] -= l;
                        if (M === item[i]) ++item[INFO][NMAX];
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
                            ++item[INFO][LEN];
                            if (W) ++item[INFO][NMIN];
                            if (M === item[i]) ++item[INFO][NMAX];
                        }
                        if (W && (0 === item[INFO][NMIN]))
                        {
                            rem += item[i]-W;
                            item[i] = W;
                            ++item[INFO][NMIN];
                        }
                        if (0 < m)
                        {
                            i += DI;
                            item[i] = M;
                            ++item[INFO][LEN];
                            ++item[INFO][NMAX];
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
                        while ((MIN <= i) && (i <= MAX) && /*(0 <= DI*(i-j)) &&*/ (0 < rem))
                        {
                            m = item[i];
                            if (M > m)
                            {
                                if (W && (W === m))
                                {
                                    if (1 === item[INFO][NMIN])
                                    {
                                        item[i] = item[i+DI];
                                        item[i+DI] = m;
                                    }
                                    else
                                    {
                                        --item[INFO][NMIN];
                                        item[i] = stdMath.min(M, m+rem);
                                        rem -= item[i]-m;
                                        if (M === item[i]) ++item[INFO][NMAX];
                                    }
                                }
                                else
                                {
                                    item[i] = stdMath.min(M, m+rem);
                                    rem -= item[i]-m;
                                    if (M === item[i]) ++item[INFO][NMAX];
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
                    --item[INFO][LEN];
                    if (W && (W === item[i])) --item[INFO][NMIN];
                    i -= DI;
                    if (W && (W === item[i])) --item[INFO][NMIN];
                    ++item[i];
                    --rem;
                    while (w <= rem)
                    {
                        i += DI;
                        item[i] = w;
                        rem -= w;
                        ++item[INFO][LEN];
                        if (W) ++item[INFO][NMIN];
                    }
                    if (W && (0 === item[INFO][NMIN]))
                    {
                        rem += item[i]-W;
                        item[i] = W;
                        ++item[INFO][NMIN];
                    }
                    if (0 < rem)
                    {
                        if (W && (1 === item[INFO][NMIN]) && (W === item[i]))
                        {
                            if (W < rem)
                            {
                                rem += item[i];
                                --item[INFO][LEN];
                                --item[INFO][NMIN];
                                i -= DI;
                                ++item[i];
                                --rem;
                                while (w <= rem)
                                {
                                    i += DI;
                                    item[i] = w;
                                    rem -= w;
                                    ++item[INFO][LEN];
                                    ++item[INFO][NMIN];
                                }
                                if (0 < rem)
                                {
                                    if (W === item[i]) --item[INFO][NMIN];
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
                            if (W && W === item[i]) --item[INFO][NMIN];
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
function p_nkab(n, k, a, b)
{
    // recursively compute the partition count using the recursive relation:
    // http://en.wikipedia.org/wiki/Partition_(number_theory)#Partition_function
    // http://www.programminglogic.com/integer-partition-algorithm/
    // compute number of integer partitions of n
    // into exactly k parts having summands between a and b (inclusive)
    // k*a <= n <= k*b
    var Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        p = O, key, j0, j1;

    if (
        Arithmetic.lt(n, O)
        || Arithmetic.lte(k, O)
        || Arithmetic.lte(a, O)
        || Arithmetic.gt(a, b)
        || Arithmetic.gt(mul(k, a), n)
        || Arithmetic.lt(mul(k, b), n)
    ) return p;

    if (Arithmetic.gt(a, I)) {n = sub(n, mul(k, sub(a, I))); b = add(sub(b, a), I); a = I;}

    //if ((Arithmetic.equ(b, n) && Arithmetic.equ(k, I)) || (Arithmetic.equ(k, n) && Arithmetic.equ(b, I))) return I;
    if (Arithmetic.equ(k, I)) return Arithmetic.lte(a, n) && Arithmetic.lte(n, b) ? I : p;
    if (Arithmetic.equ(n, k)) return Arithmetic.lte(a, I) && Arithmetic.gte(b, I) ? I : p;
    if (Arithmetic.equ(a, b)) return Arithmetic.equ(mul(k, a), n) ? I : p;
    if (Arithmetic.equ(add(a, I), b)) return Arithmetic.lte(sub(n, mul(k, a)), k) ? I : p;

    key = String(n) + ',' + String(k) + ',' + String(a) + ',' + String(b);
    if (null == p_nkab.mem[key])
    {
        // compute it directly
        j0 = Arithmetic.max(I, Arithmetic.divceil(n, k));
        k = sub(k, I);
        j1 = Arithmetic.min(b, sub(n, k));
        while (Arithmetic.lte(j0, j1))
        {
            p = add(p, p_nkab(sub(n, j0), k, I, j0));
            j0 = add(j0, I);
        }
        p_nkab.mem[key] = p;
    }
    return p_nkab.mem[key];
}
p_nkab.mem = Obj();
function part_rank(n, limit, min, max, k)
{
    if (is_instance(n, Integer)) return new n[CLASS](part_rank(n.num, limit, min, max, k));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, p = O, key,
        add = Arithmetic.add, sub = Arithmetic.sub, div = Arithmetic.div, mod = Arithmetic.mod;

    if (is_instance(limit, Integer)) limit = limit.num;
    if (is_instance(min, Integer)) min = min.num;
    //if (is_instance(max, Integer)) max = max.num;
    key = String(n) + ',' + String(limit) + ',' + String(min)/* + ',' + String(max)*/ + ',' + String(k);
    if (null == part_rank.mem[key])
    {
        n = N(n);
        limit = sub(N(limit), I);
        //max = null == max ? n : N(max);
        min = null == min ? I : N(min);

        if (null == k)
        {
            k = I;
            while (Arithmetic.lte(k, n))
            {
                p = add(p, p_nkab(n, k, min, limit));
                k = add(k, I);
            }
        }
        else
        {
            p = p_nkab(n, N(k), min, limit);
        }
        part_rank.mem[key] = p;
    }
    return part_rank.mem[key];
}
part_rank.mem = Obj();
function partitions(n, K /*exactly K parts or null*/, M /*max part is M or null*/, W /*min part is W or null*/)
{
    if (is_instance(n, Integer)) return new n[CLASS](partitions(n.num, K, M, W));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul, mod = Arithmetic.mod,
        k0, k1, p = O, k, w, m, key;

    if (is_instance(K, Integer)) K = K.num;
    if (is_instance(M, Integer)) M = M.num;
    if (is_instance(W, Integer)) W = W.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    W = null == W ? null : Arithmetic.abs(N(W));
    n = N(n);
    k0 = null!=K ? K : I;
    k1 = null!=K ? K : n;
    w = null!=W ? W : I;
    m = null!=M ? M : n;

    if (Arithmetic.equ(n, O))
        return (null == K || Arithmetic.gt(K, O)) && (null == M || Arithmetic.equ(M, O)) && (null == W || Arithmetic.equ(W, O)) ? I : O;
    if (
        Arithmetic.lt(n, O)
        || ((null != K) && (null != M) && (null != W) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(add(mul(K, W), M), add(n, W)) || Arithmetic.lt(add(mul(K, M), W), add(n, M))))
        || ((null != M) && (null != W) && (Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(M, n) || Arithmetic.gt(W, n) || (Arithmetic.equ(M, W) && !Arithmetic.equ(O, mod(n, M))) || (!Arithmetic.equ(M, W) && (Arithmetic.gt(add(M, W), n) || (Arithmetic.lt(add(M, W), n) && Arithmetic.lt(sub(n, add(M, W)), W))))))
        || ((null != K) && (null != W) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gt(mul(K, W), n)))
        || ((null != K) && (null != M) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, M) || Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n)))
        || ((null != M) && (Arithmetic.gte(O, M) || Arithmetic.gt(M, n)))
        || ((null != W) && (Arithmetic.gte(O, W) || Arithmetic.gt(W, n) || (Arithmetic.lt(W, n) && Arithmetic.gt(add(W, W), n))))
        || ((null != K) && (Arithmetic.gte(O, K) || Arithmetic.gt(K, n)))
    ) return p;

    if ((null != M) && (null == K) && (null == W)) {m = n; k0 = M; k1 = M; K = M; M = null;} // count the conjugates, same

    key = String(n) + '|' + String(K) + '|' + String(M) + '|' + String(W);
    if (null == partitions.mem[key])
    {
        if ((null != M) && (null != W))
        {
            n = Arithmetic.equ(M, W) ? sub(n, M) : sub(n, add(M, W));
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, Arithmetic.equ(M, W) ? I : two))) return I;
            if (null != K)
            {
                k1 = sub(k1, two);
                k0 = sub(k0, two);
            }
        }
        else if (null != W)
        {
            n = sub(n, W);
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, I))) return I;
            if (null != K)
            {
                k1 = sub(k1, I);
                k0 = sub(k0, I);
            }
        }
        else if (null != M)
        {
            n = sub(n, M);
            if (Arithmetic.equ(O, n) && (null == K || Arithmetic.equ(k0, I))) return I;
            if (null != K)
            {
                k1 = sub(k1, I);
                k0 = sub(k0, I);
            }
        }
        k = k0;
        while (Arithmetic.lte(k, k1))
        {
            p = add(p, p_nkab(n, k, w, m));
            k = add(k, I);
        }
        partitions.mem[key] = p;
    }
    return partitions.mem[key];
}
partitions.mem = Obj();
function c_nkab(n, k, a, b)
{
    // recursively compute the composition count using the recursive relation:
    // CLOSED FORM FORMULA FOR THE NUMBER OF RESTRICTED COMPOSITIONS (http://www.fmf.uni-lj.si/~jaklicg/papers/compositions_revision.pdf)
    // compute number of integer compositions of n
    // into exactly k parts having summands between a and b (inclusive)
    var Arithmetic = Abacus.Arithmetic,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        O = Arithmetic.O, I = Arithmetic.I, c = O, m, m1, key;
    if (
        Arithmetic.lt(n, O)
        || Arithmetic.lte(k, O)
        || Arithmetic.lte(a, O)
        || Arithmetic.gt(a, b)
        || Arithmetic.gt(mul(k, a), n)
        || Arithmetic.lt(mul(k, b), n)
    ) return c;

    if (Arithmetic.gt(a, I)) {n = sub(n, mul(k, sub(a, I))); b = add(sub(b, a), I); a = I;}

    if (Arithmetic.equ(k, I)) return Arithmetic.lte(a, n) && Arithmetic.gte(b, n) ? I : c;
    if (Arithmetic.equ(n, k)) return Arithmetic.lte(a, I) && Arithmetic.gte(b, I) ? I : c;
    if (Arithmetic.equ(a, b)) return Arithmetic.equ(mul(k, a), n) ? I : c;
    if (Arithmetic.equ(n, b)) return factorial(add(sub(n, mul(k, a)), sub(k, I)), sub(k, I));
    if (Arithmetic.equ(add(a, I), b)) return factorial(k, sub(n, mul(k, a)));

    key = String(n) + ',' + String(k) + ',' + String(a) + ',' + String(b);
    if (null == c_nkab.mem[key])
    {
        // compute it directly
        m1 = sub(n, a);
        m = Arithmetic.max(I, sub(n, b));
        k = sub(k, I);
        while (Arithmetic.lte(m, m1))
        {
            c = add(c, c_nkab(m, k, a, b));
            m = add(m, I);
        }
        c_nkab.mem[key] = c;
    }
    return c_nkab.mem[key];
}
c_nkab.mem = Obj();
function comp_rank(n, limit, min, max, k, nmin, nmax)
{
    if (is_instance(n, Integer)) return new n[CLASS](comp_rank(n.num, limit, min, max, k, nmin, nmax));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II, c = O, key,
        W, M, i, j, nn, mm, nm, m, w, l, r, k0, kk,
        add = Arithmetic.add, sub = Arithmetic.sub, mul = Arithmetic.mul,
        div = Arithmetic.div, divceil = Arithmetic.divceil, mod = Arithmetic.mod;

    if (is_instance(limit, Integer)) limit = limit.num;
    if (is_instance(min, Integer)) min = min.num;
    if (is_instance(max, Integer)) max = max.num;
    key = String(n) + ',' + String(limit) + ',' + String(min) + ',' + String(max) + ',' + String(k) + ',' + String(0<nmin) + ',' + String(0<nmax);
    if (null == comp_rank.mem[key])
    {
        n = N(n);
        limit = N(limit);
        M = null == max ? n : N(max);
        W = null == min ? I : N(min);

        if ((null == min) && (null == max))
        {
            Arithmetic.gt(n, I) ? pow2(sub(n, I)) : I
            if (null == k)
            {
                mm = W;
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    c = add(c, Arithmetic.gte(nn, I) ? pow2(sub(nn, I)) : O);
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                while (Arithmetic.lt(mm, limit))
                {
                    c = add(c, c_nkab(sub(n, mm), k, W, M));
                    mm = add(mm, I);
                }
            }
        }
        else if (
            ((0 < nmin) && (0 < nmax))
            || ((0 < nmin) && (null == max))
            || ((0 < nmax) && (null == min))
        )
        {
            if (null == k)
            {
                mm = W;
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm); k = I;
                    while (Arithmetic.lte(k, nn))
                    {
                        c = add(c, c_nkab(nn, k, W, M));
                        k = add(k, I);
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                while (Arithmetic.lt(mm, limit))
                {
                    c = add(c, c_nkab(sub(n, mm), k, W, M));
                    mm = add(mm, I);
                }
            }
        }
        else if ((null != max) && ((0 < nmin) || (null == min)))
        {
            if (null == k)
            {
                mm = W; m = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {

                        if (Arithmetic.equ(O, mod(nn, M))) c = add(c, I);
                        j = I; nm = M;
                        while (Arithmetic.lte(nm, nn))
                        {
                            i = I; k = sub(nn, nm);
                            while (Arithmetic.lte(i, k))
                            {
                                kk = c_nkab(k, i, W, m);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(i, j), j)));
                                i = add(i, I);
                            }
                            nm = add(nm, M); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I); m = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(mul(k, M), nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        j = I; nm = M;
                        while (Arithmetic.lte(nm, nn) && Arithmetic.lte(j, k))
                        {
                            kk = c_nkab(sub(nn, nm), sub(k, j), W, m);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, j)));
                            nm = add(nm, M); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        else if ((null != min) && ((0 < nmax) || (null == max)))
        {
            if (null == k)
            {
                mm = W; w = add(W, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(W, nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        if (Arithmetic.equ(O, mod(nn, W))) c = add(c, I);
                        if (Arithmetic.equ(W, mm))
                        {
                            j = O;
                            nm = O;
                        }
                        else
                        {
                            j = I;
                            nm = W;
                        }
                        while (Arithmetic.lte(nm, nn))
                        {
                            i = I; l = sub(nn, nm); k = div(l, W);
                            while (Arithmetic.lte(i, k))
                            {
                                kk = c_nkab(l, i, w, M);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(i, j), j)));
                                i = add(i, I);
                            }
                            nm = add(nm, W); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I); w = add(W, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(mul(k, W), nn))
                    {
                        c = add(c, I);
                    }
                    else
                    {
                        if (Arithmetic.equ(W, mm))
                        {
                            j = O;
                            nm = O;
                        }
                        else
                        {
                            j = I;
                            nm = W;
                        }
                        while (Arithmetic.lte(nm, nn) && Arithmetic.lte(j, k))
                        {
                            kk = c_nkab(sub(nn, nm), sub(k, j), w, M);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, j)));
                            nm = add(nm, W); j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        else
        {
            if (null == k)
            {
                mm = W; l = add(W, I); r = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, W))
                    {
                        c = add(c, Arithmetic.equ(O, mod(nn, M)) ? I : O);
                    }
                    else
                    {
                        m = Arithmetic.max(I, div(nn, M));
                        w = Arithmetic.max(I, div(nn, W));
                        j = I;
                        while (Arithmetic.lte(j, m))
                        {
                            i = Arithmetic.equ(W, mm) ? O : I;
                            while (Arithmetic.lte(i, w))
                            {
                                nm = sub(nn, add(mul(j, M), mul(i, W)));
                                if (Arithmetic.equ(O, nm))
                                {
                                    c = add(c, factorial(add(j, i), [j, i]));
                                }
                                else if (Arithmetic.gt(nm, O))
                                {
                                    k0 = I; k = div(nm, W);
                                    while (Arithmetic.lte(k0, k))
                                    {
                                        kk = c_nkab(nm, k0, l, r);
                                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k0, add(j, i)), [[j, i]])));
                                        k0 = add(k0, I);
                                    }
                                }
                                else
                                {
                                    break;
                                }
                                i = add(i, I);
                            }
                            j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
            else
            {
                mm = W; k = sub(N(k), I);
                l = add(W, I); r = sub(M, I);
                while (Arithmetic.lt(mm, limit))
                {
                    nn = sub(n, mm);
                    if (Arithmetic.equ(M, W))
                    {
                        c = add(c, Arithmetic.equ(mul(k, M), nn) ? I : O);
                    }
                    else
                    {
                        m = Arithmetic.max(I, div(nn, M));
                        w = Arithmetic.max(I, div(nn, W));
                        j = I;
                        while (Arithmetic.lte(j, m))
                        {
                            i = Arithmetic.equ(W, mm) ? O : I;
                            while (Arithmetic.lte(i, w))
                            {
                                k0 = sub(k, add(j, i));
                                nm = sub(nn, add(mul(j, M), mul(i, W)));
                                if (Arithmetic.equ(O, nm) && Arithmetic.equ(O, k0))
                                {
                                    c = add(c, factorial(k, [j, i]));
                                }
                                else if (Arithmetic.gt(k0, O) && Arithmetic.gt(nm, O))
                                {
                                    kk = c_nkab(nm, k0, l, r);
                                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(k, [[j, i]])));
                                }
                                else
                                {
                                    break;
                                }
                                i = add(i, I);
                            }
                            j = add(j, I);
                        }
                    }
                    mm = add(mm, I);
                }
            }
        }
        comp_rank.mem[key] = c;
    }
    return comp_rank.mem[key];
}
comp_rank.mem = Obj();
function compositions(n, K /*exactly K parts or null*/, M /*max part is M or null*/, W /*min part is W or null*/)
{
    if (is_instance(n, Integer)) return new n[CLASS](compositions(n.num, K, M, W));

    var Arithmetic = Abacus.Arithmetic, N = Arithmetic.num,
        O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        add = Arithmetic.add, sub = Arithmetic.sub,
        mul = Arithmetic.mul, div = Arithmetic.div, mod = Arithmetic.mod,
        c = O, j, i, k, l, r, m, w, kk, k0, nm, mm, p, prod, key;

    if (is_instance(K, Integer)) K = K.num;
    if (is_instance(M, Integer)) M = M.num;
    if (is_instance(W, Integer)) W = W.num;
    K = null == K ? null : Arithmetic.abs(N(K));
    M = null == M ? null : Arithmetic.abs(N(M));
    W = null == W ? null : Arithmetic.abs(N(W));
    n = N(n);

    if (Arithmetic.equ(n, O))
        return (null == K || Arithmetic.gt(K, O)) && (null == M || Arithmetic.equ(M, O)) && (null == W || Arithmetic.equ(W, O)) ? I : O;
    if (
        Arithmetic.lt(n, O)
        || ((null != K) && (null != M) && (null != W) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(add(mul(K, W), M), add(n, W)) || Arithmetic.lt(add(mul(K, M), W), add(n, M))))
        || ((null != M) && (null != W) && (Arithmetic.gte(O, W) || Arithmetic.gte(O, M) || Arithmetic.gt(W, M) || Arithmetic.gt(M, n) || Arithmetic.gt(W, n) || (Arithmetic.equ(M, W) && !Arithmetic.equ(O, mod(n, M))) || (!Arithmetic.equ(M, W) && (Arithmetic.gt(add(M, W), n) || (Arithmetic.lt(add(M, W), n) && Arithmetic.lt(sub(n, add(M, W)), W))))))
        || ((null != K) && (null != W) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, W) || Arithmetic.gt(mul(K, W), n)))
        || ((null != K) && (null != M) && (Arithmetic.gte(O, K) || Arithmetic.gte(O, M) || Arithmetic.gt(add(K, M), add(n, I)) || Arithmetic.lt(mul(K, M), n)))
        || ((null != M) && (Arithmetic.gte(O, M) || Arithmetic.gt(M, n)))
        || ((null != W) && (Arithmetic.gte(O, W) || Arithmetic.gt(W, n) || (Arithmetic.lt(W, n) && Arithmetic.gt(add(W, W), n))))
        || ((null != K) && (Arithmetic.gte(O, K) || Arithmetic.gt(K, n)))
    ) return c;

    key = String(n) + '|' + String(K) + '|' + String(M) + '|' + String(W);
    if (null == compositions.mem[key])
    {
        if ((null != K) && (null != M) && (null != W))
        {
            if (Arithmetic.equ(M, W))
            {
                c = Arithmetic.equ(mul(K, M), n) ? I : O;
            }
            else
            {
                m = Arithmetic.max(I, div(n, M));
                w = Arithmetic.max(I, div(n, W));
                l = add(W, I); r = sub(M, I);
                j = I;
                while (Arithmetic.lte(j, m))
                {
                    i = I;
                    while (Arithmetic.lte(i, w))
                    {
                        k = sub(K, add(j, i));
                        nm = sub(n, add(mul(j, M), mul(i, W)));
                        if (Arithmetic.equ(O, nm) && Arithmetic.equ(O, k))
                        {
                            c = add(c, factorial(K, [j, i]));
                        }
                        else if (Arithmetic.gt(k, O) && Arithmetic.gt(nm, O))
                        {
                            kk = c_nkab(nm, k, l, r);
                            if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, [[i, j]])));
                        }
                        else
                        {
                            break;
                        }
                        i = add(i, I);
                    }
                    j = add(j, I);
                }
            }
        }
        else if ((null != W) && (null != M))
        {
            if (Arithmetic.equ(M, W))
            {
                c = Arithmetic.equ(O, mod(n, M)) ? I : O;
            }
            else
            {
                m = Arithmetic.max(I, div(n, M));
                w = Arithmetic.max(I, div(n, W));
                l = add(W, I); r = sub(M, I);
                j = I;
                while (Arithmetic.lte(j, m))
                {
                    i = I;
                    while (Arithmetic.lte(i, w))
                    {
                        nm = sub(n, add(mul(j, M), mul(i, W)));
                        if (Arithmetic.equ(O, nm))
                        {
                            c = add(c, factorial(add(j, i), [j, i]));
                        }
                        else if (Arithmetic.gt(nm, O))
                        {
                            k = I; K = div(nm, W);
                            while (Arithmetic.lte(k, K))
                            {
                                kk = c_nkab(nm, k, l, r);
                                if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, add(j, i)), [[j, i]])));
                                k = add(k, I);
                            }
                        }
                        else
                        {
                            break;
                        }
                        i = add(i, I);
                    }
                    j = add(j, I);
                }
            }
        }
        else if ((null != K) && (null != W))
        {
            if (Arithmetic.equ(mul(K, W), n))
            {
                c = I;
            }
            else
            {
                j = I; nm = W; w = add(W, I);
                while (Arithmetic.lte(nm, n) && Arithmetic.lte(j, K))
                {
                    kk = c_nkab(sub(n, nm), sub(K, j), w, n);
                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, j)));
                    nm = add(nm, W); j = add(j, I);
                }
            }
        }
        else if ((null != K) && (null != M))
        {
            if (Arithmetic.equ(mul(K, M), n))
            {
                c = I;
            }
            else
            {
                j = I; nm = M; m = sub(M, I);
                while (Arithmetic.lte(nm, n) && Arithmetic.lte(j, K))
                {
                    kk = c_nkab(sub(n, nm), sub(K, j), I, m);
                    if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(K, j)));
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else if (null != K)
        {
            c = c_nkab(n, K, I, n);
        }
        else if (null != W)
        {
            if (Arithmetic.equ(W, n))
            {
                c = I;
            }
            else
            {
                if (Arithmetic.equ(O, mod(n, W))) c = I;
                j = I; nm = W; w = add(W, I);
                while (Arithmetic.lte(nm, n))
                {
                    k = I; l = sub(n, nm); K = div(l, W);
                    while (Arithmetic.lte(k, K))
                    {
                        kk = c_nkab(l, k, w, n);
                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, j), j)));
                        k = add(k, I);
                    }
                    nm = add(nm, W); j = add(j, I);
                }
            }
        }
        else if (null != M)
        {
            if (Arithmetic.equ(M, n))
            {
                c = I;
            }
            else
            {

                if (Arithmetic.equ(O, mod(n, M))) c = I;
                j = I; nm = M; m = sub(M, I);
                while (Arithmetic.lte(nm, n))
                {
                    k = I; K = sub(n, nm);
                    while (Arithmetic.lte(k, K))
                    {
                        kk = c_nkab(K, k, I, m);
                        if (! Arithmetic.equ(O, kk)) c = add(c, mul(kk, factorial(add(k, j), j)));
                        k = add(k, I);
                    }
                    nm = add(nm, M); j = add(j, I);
                }
            }
        }
        else
        {
            c = Arithmetic.gt(n, I) ? pow2(sub(n, I)) : I;
        }
        compositions.mem[key] = c;
    }
    return compositions.mem[key];
}
compositions.mem = Obj();
function conjugatepartition(is_composition, item, dir)
{
    if (null == item) return null;
    var conjugate = null, l = item.length, n;
    dir = -1 === dir ? -1 : 1;
    if (is_composition)
    {
        // On Conjugates for Set Partitions and Integer Compositions (arxiv.org/abs/math/0508052v3)
        n = operate(addn, 0, item);
        if (1 >= n)
        {
            conjugate = item.slice();
        }
        else
        {
            // get the associated n-composition of the complement(conjugate) of the associated (n-1)-subset
            conjugate = subset2composition(complement(n-1, composition2subset(item, l-1, dir)));
            // add the remainder
            if (0 < (n=n-operate(addn, 0, conjugate))) conjugate.push(n);
            // if reflected, get the reflected composition
            if (0 > dir) reflection(conjugate, conjugate);
        }
    }
    else
    {
        // http://mathworld.wolfram.com/ConjugatePartition.html
        var i, ii, j, jj, p, a = 1, b = 0, d = 0, push = "push";
        if (0 > dir) {a = -a; b = l-1-b; push = "unshift";}
        if (is_array(item[b]))
        {
            // multiplicity(packed) representation
            p = item[b]; conjugate = [[p[1], p[0]]]; i = 0;
            for (j=1,jj=a+b; j<l; ++j,jj+=a)
            {
                p = item[jj]; ii = 0>dir ? 0 : i;
                if (p[1] === conjugate[ii][0])
                {
                    // same part increase multiplicity
                    conjugate[ii][1] += p[0];
                }
                else
                {
                    // swap part with multiplicity
                    conjugate[push]([p[1], p[0]]); ++i;
                }
            }
        }
        else
        {
            // standard(unpacked) representation
            n = item[b]; conjugate = array(n, 1, 0);
            if (0 > dir) d = n-1-d;
            for (j=1,jj=a+b; j<l; ++j,jj+=a)
            {
                i = 0; ii = d; p = item[jj];
                while ((i < n) && (p > 0)) {++conjugate[ii]; --p; ++i; ii += a;}
            }
        }
    }
    return conjugate;
}
function packpartition(partition, dir)
{
    if (null == partition) return null;
    var packed = [], i, j, l = partition.length,
        reflected = -1 === dir,
        a = 1, b = 0, push = 'push',
        last, part;

    if (reflected)
    {
        a = -a;
        b = l-1-b;
        push = 'unshift';
    }
    for (last=partition[b],part=[last, 1],i=1; i<l; ++i)
    {
        j = a*i+b;
        if (last === partition[j])
        {
            ++part[1];
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
function unpackpartition(packed, dir)
{
    if (null == packed) return null;
    var partition = [], i, j, k, v, l = packed.length,
        cmp, reflected = -1 === dir,
        a = 1, b = 0, push = 'push';
    if (reflected)
    {
        a = -a;
        b = l-1-b;
        push = 'unshift';
    }
    for (i=0; i<l; ++i)
    {
        cmp = packed[a*i+b];
        if (1 === cmp[1])
            partition[push](cmp[0]);
        else
            for (k=cmp[1],v=cmp[0],j=0; j<k; ++j)
                partition[push](v);
    }
    return partition;
}
function composition2subset(item, n, dir)
{
    if (null == item) return null;
    n = n || item.length;
    return psum(new Array(n), item, 1, -1, -1 === dir ? n-1 : 0, -1 === dir ? 0 : n-1, 0, n-1);
}
function subset2composition(item, n, dir)
{
    if (null == item) return null;
    n = n || item.length;
    return fdiff(new Array(n), item, 1, 1, -1 === dir ? n-1 : 0, -1 === dir ? 0 : n-1, 0, n-1);
}
// aliases
Partition.transpose = Partition.toTranspose = Partition.conjugate = Partition.toConjugate;
