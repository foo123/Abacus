// https://en.wikipedia.org/wiki/Partition_of_a_set
// https://en.wikipedia.org/wiki/Bell_number
SetPartition = Abacus.SetPartition = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function SetPartition(n, $) {
        var self = this, sub = null, K;
        if (!is_instance(self, SetPartition)) return new SetPartition(n, $);
        $ = $ || {}; $.type = "partition";
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
        K = null != $['parts='] ? ($['parts=']|0) : null;
        $.base = n;
        $.mindimension = stdMath.max(0, null != K ? K : 1);
        $.maxdimension = stdMath.max(0, null != K ? K : n);
        $.dimension = $.maxdimension;
        $.rand = $.rand || {}; $.rand['partition'] = 1;
        CombinatorialIterator.call(self, "SetPartition", n, $, sub ? {method:$.submethod, iter:sub, pos:$.subpos, cascade:$.subcascade} : null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function(item, n, $, dir) {
            return item;
        }
        ,count: function(n, $) {
            var K = $ && (null != $['parts=']) ? ($['parts=']|0) : null;
            return 0 < n ? (null == K ? bell(n) : ((0 >= K) || (K > n) ? Abacus.Arithmetic.O : stirling(n, K, 2))) : Abacus.Arithmetic.O;
        }
        ,initial: function(n, $, dir) {
            var klass = this, item, order = $ && (null != $.order) ? $.order : LEX,
                K = $ && (null != $['parts=']) ? ($['parts=']|0) : null;

            if ((0 > n) || ((null != K) && ((0 >= K) || (K > n)))) return null;

            dir = -1 === dir ? -1 : 1;

            if ((REVERSED & order)) dir = -dir;

            // O(n)
            /*
            item = new Array(n+1); item[n] = [n, new Array(n)];
            if (K)
            {
                // restricted setpartition to exactly K parts
                item[n].push(array(K, 0));
                item = operate(function(item,ai,i){
                    if (0 > dir)
                    {
                        ai = i <= n-K ? 0 : K-n+i;
                        item[i] = ai;
                        item[n][1][i] = ai;
                        item[n][2][ai]++;
                    }
                    else
                    {
                        ai = i < K ? i : K-1;
                        item[i] = ai;
                        item[n][1][i] = ai;
                        item[n][2][ai]++;
                    }
                    return item;
                }, item, null, 0, n-1, 1);
            }
            else
            {
                // unrestricted setpartition
                item = operate(function(item,ai,i){
                    if (0 > dir)
                    {
                        item[i] = 0;
                        item[n][1][i] = 0;
                    }
                    else
                    {
                        item[i] = i;
                        item[n][1][i] = i;
                    }
                    return item;
                }, item, null, 0, n-1, 1);
            }
            */
            if (0 > dir)
            {
                item = K ? array(K, function(i) {return 0 === i ? array(n-K+1, 0, 1) : [n-K+i];}) : [array(n, function(i) {return i;})];
            }
            else
            {
                item = K ? array(K, function(i) {return i+1 === K ? array(n-K+1, K-1, 1) : [i];}) : array(n, function(i) {return [i];});
            }

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, K = $ && (null != $['parts=']) ? ($['parts=']|0) : null, l, k, i, j, s, x, m, dict, d0, d1;
            if (!item || (0 > n)) return false;
            d0 = stdMath.max(0, null != K ? K : 1);
            d1 = stdMath.max(0, null != K ? K : n);
            if ((d0 > item.length) || (d1 < item.length)) return false;
            item = klass.DUAL(item.slice(), n, $);
            for (dict={},m=0,j=0,k=item.length; j<k; ++j)
            {
                for (s=item[j],i=0,l=s.length; i<l; ++i)
                {
                    x = s[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x >= s[i+1]))) return false;
                    dict[x] = 1;
                }
                m += l;
            }
            return m === n;
        }
        ,succ: function(item, index, n, $, dir) {
            if ((null == n) || (null == item) || (0 >= n)) return null;
            dir = -1 === dir ? -1 : 1;
            return next_setpartition(item, n, $ && (null != $['parts=']) ? ($['parts=']|0) : null, dir, $ && (null != $.order) ? $.order : LEX);
        }
        ,rand: function(n, $) {
            var klass = this, K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
                rnd = Abacus.Math.rnd, Arithmetic = Abacus.Arithmetic, q, m, l, i, k, prob, cdf;
            if ((0 > n) || ((null != K) && (0 >= K || K > n))) return null;
            q = array(n, 0); m = n; l = 0;
            while (0 < m)
            {
                cdf = Rational.Zero();
                prob = Rational.fromDec(rnd());
                k = 1;
                while (k <= m)
                {
                    cdf = cdf.add(Rational(Arithmetic.mul(factorial(m-1, k-1), klass.count(m-k, {'parts=':K})), klass.count(m, {'parts=':K})));
                    if (cdf.gte(prob)) break;
                    ++k;
                }
                for (i=m-k; i<m; ++i)
                {
                    q[i] = l;
                    if (K) l = (l+1) % K;
                }
                ++l; if (K && (l >= K)) l = 0;
                m -= k;
            }
            q = shuffle(q);
            return operate(function(partition, i) {
                partition[q[i]].push(i);
                return partition;
            }, array(stdMath.max.apply(null, q)+1, function() {return [];}), null, 0, n-1, 1).sort(function(a,b) {return a[0]-b[0];});
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
        ,toConjugate: null
    }
    ,_update: function() {
        var self = this, n = self.n, $ = self.$, K = (null != $['parts=']) ? ($['parts=']|0) : null, item = self.__item, i, j, s, k;
        if (item && (n+1 !== item.length))
        {
            self.__item = new Array(n+1); self.__item[n] = [n, new Array(n)];
            if (K) self.__item[n].push(array(K, 0));
            for (i=0; i<item.length; ++i)
            {
                for (s=item[i],j=0; j<s.length; ++j)
                {
                    self.__item[s[j]] = i;
                    self.__item[n][1][s[j]] = i;
                    if (K) ++self.__item[n][2][i];
                }
            }
        }
        return self;
    }
    ,output: function(item) {
        if (null == item) return null;
        var self = this, $ = self.$, n = self.n,
            order = (null != $.order) ? $.order : LEX,
            K = $ && (null != $['parts=']) ? ($['parts=']|0) : null,
            is_reflected = REFLECTED & order;
        if (item && (n+1 === item.length))
        {
            item = operate(function(partition, i) {
                partition[item[i]].push(i);
                return partition;
            }, array(stdMath.max.apply(null, item.slice(0, n))+1, function() {return [];}), null, 0, n-1, 1);
            if (is_reflected) item = item.reverse();
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
});
function next_setpartition(item, n, K, dir, order)
{
    var i, j, k, l, m, found, pos;
    if ((0 >= n) || ((null != K) && (0 >= K || K > n))) return null;
    if (!(LEX & order)) return null; // only LEX supported
    if (REVERSED & order) dir = -dir;

    m = item[n][1];
    found = false;

    if (K)
    {
        if ((1 === K) || (n === K)) return null // last

        pos = item[n][2];

        if (0 > dir)
        {
            for (i=n-1; i>0; --i)
            {
                if ((item[i] <= m[i-1]) && (item[i] !== (i < K ? i : K-1)))
                {
                    --pos[item[i]];
                    item[i] = stdMath.min(K-1, item[i]+1);
                    m[i] = stdMath.max(item[i], m[i]);
                    ++pos[item[i]];
                    for (j=i+1; j<n; ++j)
                    {
                        --pos[item[j]];
                        item[j] = item[0];
                        ++pos[item[j]];
                        m[j] = m[i];
                    }
                    for (l=n-1,k=K-1; k>0; --k)
                    {
                        if (!pos[k])
                        {
                            --pos[item[l]]; ++pos[k];
                            item[l] = k; --l;
                        }
                    }
                    found = true;
                    break;
                }
            }
            if (!found) item = null; // last
        }
        else
        {
            for (i=n-1; i>0; --i)
            {
                if ((item[i] > item[0]) && ((K-n+i < item[i]) ||  (1 < pos[item[i]])))
                {
                    --pos[item[i]];
                    --item[i]; m[i] = m[i-1];
                    ++pos[item[i]];
                    for (j=i+1; j<n; ++j)
                    {
                        if (1 < pos[item[j]])
                        {
                            --pos[item[j]];
                            m[j] = stdMath.min(K-1, m[i]+j-i);
                            item[j] = m[j];
                            ++pos[item[j]];
                        }
                    }
                    found = true;
                    break;
                }
            }
            if (!found) item = null; // last
        }
    }
    else
    {
        // adapted from Efficient Generation of Set Partitions, Michael Orlov (https://www.informatik.uni-ulm.de/ni/Lehre/WS03/DMM/Software/partitions.pdf)
        if (0 > dir)
        {
            for (i=n-1; i>0; --i)
            {
                if (item[i] <= m[i-1])
                {
                    ++item[i]; m[i] = stdMath.max(item[i], m[i]);
                    for (j=i+1; j<n; ++j)
                    {
                        item[j] = item[0];
                        m[j] = m[i];
                    }
                    found = true;
                    break;
                }
            }
            if (!found) item = null; // last
        }
        else
        {
            for (i=n-1; i>0; --i)
            {
                if (item[i] > item[0])
                {
                    --item[i]; m[i] = m[i-1];
                    for (j=i+1; j<n; ++j)
                    {
                        m[j] = m[i]+j-i;
                        item[j] = m[j];
                    }
                    found = true;
                    break;
                }
            }
            if (!found) item = null; // last
        }
    }
    return item;
}
/*function separateIS(item, S, I)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > I.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function separateST(item, S, T)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > T.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function combineIS(item, S, I)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > I.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function combineST(item, S, T)
{
    return [item.reduce(function(p, set){
            set = set.reduce(function(set, si){
                if (0 > S.indexOf(si) && 0 > T.indexOf(si))
                    set.push(si);
                return set;
            }, []);
            if (set.length) return p.push(set);
            return p;
        }, []), S, I];
}
function singletons(item, n)
{
    var i, j, l = item.length, S = new Array(l);
    for (i=0,j=0; i<l; ++i)
    {
        if (1 === item[i].length)
            S[j++] = item[i][0];
    }
    if (j < S.length) S.length = j; // truncate if needed
    return S;
}
function adjInit(item, n)
{
    var i, j, k, l = item.length, I = [];
    for (i=0,k=0; i<l; ++i)
    {
        if (1 === item[i].length)
        {
            I.push(item[i][0]);
        }
        else
        {
            for (j=0,k=item[i].length; j+1<k; ++j)
            {
                if (item[i][j]+1 === item[i][j+1])
                    I.push(item[i][j]);
            }
            if (((item[i][j]+1) % n) === item[i][0])
                    I.push(item[i][j]);
        }
    }
    return I;
}
function adjTerm(item, n)
{
    var i, j, l, k, T = [];
    for (i=0,l=item.length; i<l; ++i)
    {
        if (1 === item[i].length)
        {
            T.push(item[i][0]);
        }
        else
        {
            for (j=0,k=item[i].length; j+1<k; ++j)
            {
                if (item[i][j]+1 === item[i][j+1])
                    T.push(item[i][j+1]);
            }
            if ((item[i][j]+1) % n === item[i][0])
                    T.push(item[i][0]);
        }
    }
    return T;
}*/
function conjugatesetpartition(item, n)
{
    // adapted from https://arxiv.org/abs/math/0508052
    if (null == item) return null;
    var congugate = null;
    return conjugate;
}
SetPartition.toConjugate = conjugatesetpartition;
