// https://en.wikipedia.org/wiki/Combinations
// Unordered Combinations(Combinations), Ordered Combinations(Variations), Repeated Combinations, Ordered Repeated Combinations(Repeated Variations)
Combination = Abacus.Combination = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Combination(n, k, $) {
        var self = this, sub = null;
        if (!is_instance(self, Combination)) return new Combination(n, k, $);
        if (is_array(n) || is_args(n))
        {
            $ = k || {};
            k = n[1]||0;
            n = n[0]||0;
        }
        else
        {
            $ = $ || {};
            n = n||0;
            k = k||0;
        }
        $.type = String($.type || "combination").toLowerCase();
        if (-1 < $.type.indexOf('+'))
        {
            var a = $.type.split('+');
            a.sort(); $.type = a.join('+');
        }

        if (is_instance(k, CombinatorialIterator))
        {
            sub = k;
            k = sub.dimension();
        }
        else if (is_instance(n, CombinatorialIterator))
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.base = n; $.dimension = stdMath.max(0, k);
        if ("binary"===$.output) $.output = function(item,n){ return Combination.toBinary(item,n[0]); };
        else if ("conjugate"===$.output) $.output = function(item,n){ return Combination.toComplement(item,n[0]); };
        CombinatorialIterator.call(self, "Combination", [n, k], $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function(n, $) {
            var type = $ && $.type ? $.type : "combination"/*"unordered"*/;
            return 0>n[0] || 0>n[1] ? Abacus.Arithmetic.O : (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type) ? (
                exp(n[0], n[1])
            ) : (("repeated" === type) || ("combination+repeated" === type) ? (
                factorial(n[0]+n[1]-1, n[1])
            ) : (("ordered" === type) || ("variation" === type) ? (
                factorial(n[0], -n[1])
            ) : (
                factorial(n[0], n[1])
            ))));
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "combination"/*"unordered"*/,
                order = $ && null!=$.order ? $.order : LEX;
            if (0 > n[0] || 0 > n[1]) return null;
            if (0===n[1]) return [];

            dir = -1 === dir ? -1 : 1;
            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                dir = -dir;

            // O(k)
            item = ("repeated+variation" === type) || ("variation+repeated" === type) || ("ordered+repeated" === type) || ("combination+repeated" === type) || ("repeated" === type) ? (
                0 > dir ? array(n[1], n[0]-1, 0) : array(n[1], 0, 0)
            ) : (("ordered" === type) || ("variation" === type) ? (
                0 > dir ? array(n[1], n[0]-1, -1) : array(n[1], 0, 1)
            ) : (
                0 > dir ? array(n[1], n[0]-n[1], 1) : array(n[1], 0, 1)
            ));

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, type = $ && $.type ? $.type : "combination"/*"unordered"*/,
                k = n[1], N, i, x, dict;

            if (!item || 0 > n[0] || 0 > n[1] || k !== item.length) return false;

            item = klass.DUAL(item.slice(), n, $);
            if (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
            {
                N = n[0];
                for (i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N) return false;
                }
            }
            else if (("repeated" === type) || ("combination+repeated" === type))
            {
                N = n[0];
                for (i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N || (i+1<k && item[i] > item[i+1])) return false;
                }
            }
            else if (("ordered" === type) || ("variation" === type))
            {
                N = n[0];
                for (dict={},i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N || 1 === dict[item[i]]) return false;
                    dict[item[i]] = 1;
                }
            }
            else//if (("combination" === type) || ("unordered" === type) || ("binary" === type))
            {
                N = n[0];
                for (i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N || (i+1<k && item[i] >= item[i+1])) return false;
                }
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, CI) {
            if (!n || !n[0] || (0 >= n[0]) || (0>=n[1]) || (null == item)) return null;
            dir = -1 === dir ? -1 : 1;
            return next_combination(item, n, dir, $ && $.type ? $.type : "combination"/*"unordered"*/, $ && null!=$.order ? $.order : LEX, CI);
        }
        ,rand: function(n, $) {
            var klass = this, type = $ && $.type ? $.type : "combination"/*"unordered"*/,
                item, i, k = n[1], n_k, c,
                selected, rndInt = Abacus.Math.rndInt;
            if (0 > n[0] || 0 > n[1]) return null;
            if (0===k) return [];

            n = n[0]; n_k = n-k; c = n-1;
            // O(klogk) worst/average-case, unbiased
            if (("repeated" === type) || ("combination+repeated" === type) || ("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
            {
                // p ~ 1 / n^k (ordered+repeated), p ~ 1 / binom(n+k-1,k) (repeated)
                item = 1 === k ? [rndInt(0, c)] : array(k, function(){return rndInt(0, c);});
                if ((1 < k) && (("repeated" === type) || ("combination+repeated" === type))) mergesort(item, 1, true);
            }
            else if (("ordered" === type) || ("variation" === type))
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
                        while (1 === selected[selection]) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    })
               ));
            }
            else//if (("combination" === type) || ("unordered" === type) || ("binary" === type))
            {
                // p ~ 1 / binom(n,k)
                selected = {};
                item = 1 === k ? (
                    [rndInt(0, c)]
                ) : (n === k ? (
                    array(k, 0, 1)
                ) : (n_k < k ? (
                    complement(n, array(n_k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while (1 === selected[selection]) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    }),true)
                ) : (
                    mergesort(array(k, function(){
                        // select uniformly without repetition
                        var selection = rndInt(0, c);
                        // this is NOT an O(1) look-up operation, in general
                        while (1 === selected[selection]) selection = (selection+1)%n;
                        selected[selection] = 1;
                        return selection;
                    }),1,true)
                )));
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                add = Arithmetic.add, sub = Arithmetic.sub,
                mul = Arithmetic.mul, O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
                index = O, i, c, j, k = n[1], N, binom, x, dict,
                order = $ && null!=$.order ? $.order : LEX,
                type = $ && $.type ? $.type : "combination"/*"unordered"*/;

            if (!item || 0 > n[0] || 0 > n[1] || k !== item.length) return J;

            if (0===k) return O;
            item = klass.DUAL(item, n, $);

            if (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
            {
                // O(k)
                N = n[0];
                for (i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N) return J;
                    index = add(mul(index, N), item[i]);
                }
            }
            else if (("repeated" === type) || ("combination+repeated" === type))
            {
                // O(k)
                N = n[0]+k-1; binom = $ && $.count ? $.count : factorial(N, k);
                for (i=1; i<=k; i++)
                {
                    // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                    // adjust the order to match MSB to LSB
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    if (0 > item[i-1] || item[i-1] >= n[0] || (i<k && item[i-1] > item[i])) return J;
                    c = N-1-item[i-1]-i+1; j = k+1-i;
                    if (j <= c) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,I),index);
            }
            else if (("ordered" === type) || ("variation" === type))
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // rank(ordered) = rank(k-n-permutation)
                // O(klgk)
                N = n[0];
                for (dict={},i=0; i<k; i++)
                {
                    if (0 > item[i] || item[i] >= N || 1 === dict[item[i]]) return J;
                    dict[item[i]] = 1;
                }
                item = permutation2inversion(null, item, N);
                for (i=0; i<k; i++) index = add(mul(index, N-i), item[ i ]);
            }
            else//if (("combination" === type) || ("unordered" === type) || ("binary" === type))
            {
                // O(k)
                N = n[0];
                binom = $ && $.count ? $.count : factorial(N, k);
                for (i=1; i<=k; i++)
                {
                    // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                    // adjust the order to match MSB to LSB
                    // reverse of wikipedia article http://en.wikipedia.org/wiki/Combinatorial_number_system
                    if (0 > item[i-1] || item[i-1] >= N || (i<k && item[i-1] >= item[i])) return J;
                    c = N-1-item[i-1]; j = k+1-i;
                    if (j <= c) index = add(index, factorial(c, j));
                }
                index = sub(sub(binom,I),index);
            }

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);

            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                sub = Arithmetic.sub, div = Arithmetic.div, mod = Arithmetic.mod,
                mul = Arithmetic.mul, lte = Arithmetic.lte, gt = Arithmetic.gt,
                val = Arithmetic.val, item, binom, k = n[1], N, m, t, p,
                type = $ && $.type ? $.type : "combination"/*"unordered"*/, repeated,
                order = $ && null!=$.order ? $.order : LEX;

            index = null == index ? null : Arithmetic.num(index);
            if (null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)))
                return null;

            if (0 > n[0] || 0 > n[1]) return null;
            if (0===k) return [];

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            n = n[0];
            item = array(k);
            if (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
            {
                // O(k)
                for (m=index,p=k-1; p>=0; p--)
                {
                    t = mod(m, n); m = div(m, n);
                    item[p] = val(t);
                }
            }
            else if (("ordered" === type) || ("variation" === type))
            {
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // unrank(ordered) = unrank(k-n-permutation)
                // O(klgk)
                for (m=index,p=k-1; p>=0; p--)
                {
                    N = n-p; t = mod(m, N); m = div(m, N);
                    item[p] = val(t);
                }
                inversion2permutation(item, item, N);
            }
            else//if (("repeated" === type) || ("combination+repeated" === type) || ("combination" === type) || ("unordered" === type) || ("binary" === type))
            {
                // "Algorithms for Unranking Combinations and Other Related Choice Functions", Zbigniew Kokosi´nski 1995 (http://riad.pk.edu.pl/~zk/pubs/95-1-006.pdf)
                // adjust the order to match MSB to LSB
                // O(k)
                repeated = ("repeated" === type) || ("combination+repeated" === type);
                N = repeated ? n+k-1 : n;
                binom = $ && $.count ? $.count : factorial(N, k);
                index = sub(sub(binom,I),index);
                binom = div(mul(binom,N-k),N);
                t = N-k+1; m = k; p = N-1;
                do {
                    if (lte(binom, index))
                    {
                        item[k-m] = repeated ? N-t-k+1 : N-t-m+1;
                        if (gt(binom, O))
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
                } while (m > 0);
            }
            n = [n, k];

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,toComplement: function(alpha, n, ordered) {
            return true === ordered ? shuffle(complement(n, alpha, true)) : complement(n, alpha);
        }
        ,toBinary: function(item, n) {
            return subset2binary(item, n);
        }
        ,fromBinary: function(item, n) {
            return binary2subset(item, n);
        }
        ,pick: function(a, k, type) {
            return (0 < k) && a.length ? pick(a, k, ("ordered+repeated"!==type)&&("variation+repeated"!==type)&&("repeated+variation"!==type)&&("ordered"!==type)&&("variation"!==type), ("ordered+repeated"===type)||("variation+repeated"===type)||("repeated"===type)||("combination+repeated"===type), new Array(k)) : [];
        }
        ,choose: function(arr, comb) {
            return comb && comb.length ? array(comb.length, function(i){
                return 0<=comb[i] && comb[i]<arr.length ? arr[comb[i]] : null;
            }) : [];
        }
    }
    ,_update: function() {
        var self = this;
        self.item__ = comb_item_(self.__item, self.n[0], self.n[1], self.$.order, self.$.type);
        return self;
    }
});
// aliases
Combination.toConjugate = Combination.toComplement;
Combination.project = Combination.choose;
function comb_item_(item, n, k, order, type)
{
    if (null == item) return null;
    var CI = null, i;
    if (('ordered' === type) || ('variation' === type)) for (CI={},i=0; i<k; i++) CI[item[i]] = 1;
    return CI;
}
function next_combination(item, N, dir, type, order, CI)
{
    //maybe "use asm"
    var k = N[1], n = N[0], i, j, index, curr, i0, DI, MIN, MAX, a, b, da, db, inc, repeated;

    if (0 > N[0] || 0 > N[1]) return null;
    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = k-1;
    DI = 1; i0 = MAX;
    a = 1; b = 0;
    da = 1; db = 0;
    if (COLEX & order)
    {
        //CP-symmetric of LEX
        a = -a; b = n-1-b;
        DI = -DI; i0 = MAX-i0;
        da = -da; db = MAX-db;
    }
    if (REFLECTED & order)
    {
        //P-symmetric of LEX
        DI = -DI; i0 = MAX-i0;
        da = -da; db = MAX-db;
    }
    if (REVERSED & order)
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT) for ordered+repeated (=tuple)
    // constant average delay (CAT) for ordered (or linear if "CI" map is computed at run-time)
    // constant average delay (CAT) for unordered(repated or not) (or linear if "CI" map is computed at run-time)
    if (0 > dir)
    {
        // compute prev indexes
        // find index to move
        if (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
        {
            i = i0;
            while ((MIN<=i && i<=MAX) && (item[i] === 0)) i-=DI;
            if (MIN<=i && i<=MAX)
                for (n=n-1,item[i]=item[i]-1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = n;
            //else last item
            else item = null;
        }
        else if (("ordered" === type) || ("variation" === type))
        {
            if (null == CI) CI = comb_item_(item, n, k, order, type);
            i = i0; index = -1;
            while (-1===index && MIN<=i && i<=MAX)
            {
                if (a*item[i]+b-a >= 0 )
                {
                    for (j=a*item[i]+b-a; 0<=j && j<n; j-=a)
                    {
                        curr = a*j+b;
                        if (null == CI[curr])
                        {
                            index = i;
                            CI[curr] = 1;
                            break;
                        }
                    }
                }
                CI[item[i]] = null;
                i-=DI;
            }
            if (-1 < index)
            {
                item[index] = curr;
                for (j=n-1-b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while ((0<=j && j<n) && (null != CI[curr])) { j-=a; curr=a*j+b; }
                    item[i] = curr; CI[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if (("combination" === type) || ("unordered" === type) || ("repeated" === type) || ("combination+repeated" === type))
        {
            repeated = ("repeated" === type) || ("combination+repeated" === type); inc = repeated ? 0 : 1;
            if (COLEX & order)
            {
                DI = -DI; i0 = MAX-i0; da = -da; db = MAX-db; i = MAX-i0;
                j = 0 > DI ? MIN : MAX;
                if ((!repeated && item[j]+1>k) || (repeated && item[j]>0))
                {
                    if (repeated) while (MIN<=i && i<=MAX && 0===item[i]) i+=DI;
                    else while (MIN<=i && i<=MAX && da*i+db===item[i]) i+=DI;
                    item[i]-=1; i-=DI;
                    // attach rest of low block:
                    while (MIN<=i && i<=MAX) { item[i] = item[i+DI]-inc; i-=DI; }
                }
                else item = null;
            }
            else
            {
                /*if (null == CI)
                {*/
                    for (index=-1,i=i0; MIN<=i-DI && i-DI<=MAX; i-=DI)
                        if (item[i]>item[i-DI]+inc) { index = i; break; }
                /*}
                else
                {
                    index = CI[0];
                }*/
                if (!(MIN<=index && index<=MAX) && 0 < item[0>DI?MAX:MIN]) index = 0>DI?MAX:MIN;
                // adjust next indexes after the moved index
                if (MIN<=index && index<=MAX)
                {
                    curr = n-1+inc;
                    for (i=i0; MIN<=i && i<=MAX && 0<DI*(i-index); i-=DI)
                    {
                        curr -= inc;
                        item[i] = curr;
                    }
                    item[index]--;
                    //if (CI) CI[0] = index+DI;
                }
                else item = null;
            }
        }
    }
    else
    {
        // compute next indexes
        // find index to move
        if (("ordered+repeated" === type) || ("variation+repeated" === type) || ("repeated+variation" === type))
        {
            i = i0;
            while ((MIN<=i && i<=MAX) && (item[i]+1 === n)) i-=DI;
            if (MIN<=i && i<=MAX)
                for (item[i]=item[i]+1,j=i+DI; MIN<=j && j<=MAX; j+=DI) item[j] = 0;
            //else last item
            else item = null;
        }
        else if (("ordered" === type) || ("variation" === type))
        {
            if (null == CI) CI = comb_item_(item, n, k, order, type);
            i = i0; index = -1;
            while (-1===index && MIN<=i && i<=MAX)
            {
                if (a*item[i]+b+a < n )
                {
                    for (j=a*item[i]+b+a; 0<=j && j<n; j+=a)
                    {
                        curr = a*j+b;
                        if (null == CI[curr])
                        {
                            index = i;
                            CI[curr] = 1;
                            break;
                        }
                    }
                }
                CI[item[i]] = null;
                i-=DI;
            }
            if (-1 < index)
            {
                item[index] = curr;
                for (j=b,curr=a*j+b,i=index+DI; MIN<=i && i<=MAX; i+=DI)
                {
                    while ((0<=j && j<n) && (null != CI[curr])) { j+=a; curr=a*j+b; }
                    item[i] = curr; CI[curr] = 1;
                }
            }
            //else last item
            else item = null;
        }
        else//if (("combination" === type) || ("unordered" === type) || ("repeated" === type) || ("combination+repeated" === type))
        {
            repeated = ("repeated" === type) || ("combination+repeated" === type); inc = repeated ? 0 : 1;
            if (COLEX & order)
            {
                DI = -DI; i0 = MAX-i0; da = -da; db = MAX-db; i = MAX-i0;
                if ((!repeated && item[i]+k<n) || (repeated && item[i]+1<n))
                {
                    curr = da*i+db;
                    while (MIN<=i+DI && i+DI<=MAX && item[i]+inc === item[i+DI])
                    {
                        item[i] = curr; i+=DI; curr += inc;
                    }
                    item[i]+=1;
                }
                else item = null;
            }
            else
            {
                /*if (null == CI)
                {*/
                    if (repeated)
                    {
                        for (index=-1,j=n-1,i=i0; MIN<=i && i<=MAX; i-=DI)
                            if (item[i] < j) { index = i; break; }
                    }
                    else
                    {
                        for (index=-1,j=n-k,i=i0; MIN<=i && i<=MAX; i-=DI)
                            if (item[i] < j+da*i+db) { index = i; break; }
                    }
                /*}
                else
                {
                    index = CI[0];
                }*/
                // adjust next indexes after the moved index
                if (MIN<=index && index<=MAX)
                {
                    curr = item[index]+1;
                    j = repeated ? n-1 : n-k+da*index+db;
                    if (curr === j)
                    {
                        item[index] = curr;
                        //if (CI) CI[0] = index-DI;
                    }
                    else if (curr < j)
                    {
                        for (i=index; MIN<=i && i<=MAX; i+=DI) { item[i]=curr; curr+=inc; }
                        //if (CI) CI[0] = i0;
                    }
                }
                else item = null;
            }
        }
    }
    return item;
}
