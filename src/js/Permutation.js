// https://en.wikipedia.org/wiki/Permutations
Permutation = Abacus.Permutation = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Permutation(n, $) {
        var self = this, sub = null;
        if (!is_instance(self, Permutation)) return new Permutation(n, $);
        $ = $ || {}; $.type = String($.type || "permutation").toLowerCase();
        n = n||0;
        if (is_instance(n, CombinatorialIterator))
        {
            sub = n;
            n = sub.dimension();
        }
        else
        {
            sub = $.sub;
        }
        $.base = n;
        $.dimension = stdMath.max(0, n);
        // random ordering for derangements / involutions / connecteds
        // is based on random generation, instead of random unranking
        $.rand = $.rand || {};
        if ("multiset" === $.type)
        {
            $.multiplicity = is_array($.multiplicity) && $.multiplicity.length ? $.multiplicity.slice() : array($.dimension, 1, 0);
            $.multiplicity = $.multiplicity.concat(array($.dimension-operate(addn, 0, $.multiplicity), 1, 0));
            $.base = $.multiplicity.length;
            $.multiset = multiset($.multiplicity, $.dimension);
        }
        CombinatorialIterator.call(self, "Permutation", n, $, sub?{method:$.submethod,iter:sub,pos:$.subpos,cascade:$.subcascade}:null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: CombinatorialIterator.DUAL
        ,count: function(n, $) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                //factorial = Abacus.Math.factorial, stirling = Abacus.Math.stirling,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if (0 > n)
                return O;
            else if ("cyclic" === type)
                return Arithmetic.num(n);
            else if ("multiset" === type)
                return factorial(n, $.multiplicity);
            else if ("derangement" === type)
                return null!=kfixed ? Arithmetic.mul(factorial(n,kfixed),factorial(n-kfixed,false)) : factorial(n,false);
            else if ("involution" === type)
                return factorial(n, true);
            else if ("connected" === type)
                return factorial(n-1);
            else//if ("permutation" === type)
                return null!=kcycles ? stirling(n,kcycles,1) : factorial(n);
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this, type = $ && $.type ? $.type : "permutation",
                order = $ && null!=-$.order ? $.order : LEX,
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                n_2, part, perm, odir
            ;

            if (0 > n) return null;
            if (0===n) return [];

            dir = -1 === dir ? -1 : 1;
            odir = dir;
            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                dir = -dir;
            // O(n)
            if ("cyclic" === type)
            {
                item = 0 > dir ? [n-1].concat(array(n-1, 0, 1)) : array(n, 0, 1);
            }
            else if ("derangement" === type)
            {
                if (null != kfixed)
                {
                    if (0 > kfixed || kfixed > n || kfixed+1 === n) return null;
                    return compose_kfixed([Combination.initial([n, kfixed], {type:"combination", base:n, dimension:kfixed, order:order}, odir), Permutation.initial(n-kfixed, {type:"derangement", order:order}, odir)], n, kfixed);
                }
                else if (2>n)
                {
                    return null;
                }
                else if (n & 1) // odd
                {
                    n_2 = stdMath.floor(n/2);
                    item = 0 > dir ? array(n-n_2-1, n-1, -1).concat([n_2-1,n_2]).concat(array(n_2-1, n_2-2, -1)) : array(n-3, function(i){return i&1?i-1:i+1;}).concat([n-2,n-1,n-3]);
                }
                else // even
                {
                    item = 0 > dir ? array(n, n-1, -1) : array(n, function(i){return i&1?i-1:i+1;});
                }
            }
            else if ("multiset" === type)
            {
                item = 0 > dir ? $.multiset.slice().reverse() : $.multiset.slice();
            }
            else if ("connected" === type)
            {
                return cycles2permutation([[n-1].concat(Permutation.initial(n-1, {order:order}, odir))], n);
            }
            else if ("involution" === type)
            {
                item = 0 > dir ? array(n, function(i){return /*n-1-i;*/i&1 ? i-1 : (i+1<n ? i+1 : i);}) : array(n, 0, 1);
            }
            else//if ("permutation" === type)
            {
                if (null!=kcycles)
                {
                    if (0 > kcycles || kcycles > n) return null;
                    part = SetPartition.initial(n, {"parts=":kcycles, order:LEX | (order&REVERSED ? REVERSED : 0)}, odir);
                    perm = part.filter(function(p){return 1 < p.length;}).map(function(p){return Permutation.initial(p.length-1, {order:order}, odir);});
                    return compose_kcycles([part, perm], n, kcycles);
                }
                else
                {
                    item = 0 > dir ? array(n, n-1, -1) : array(n, 0, 1);
                }
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                i, j, x, dict, M, item0;

            if (!item || 0 > n || n !== item.length) return false;
            //item0 = item;
            item = klass.DUAL(item.slice(), n, $);
            if ("cyclic"=== type)
            {
                j = item[0];
                for (i=0; i<n; i++)
                {
                    x = item[(i+n-j)%n];
                    if (x !== i) return false;
                }
            }
            else if ("connected" === type)
            {
                for (dict={},i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= n || 1 === dict[x]) return false;
                    dict[x] = 1;
                }
                if (!is_connected(item)) return false;
            }
            else if ("involution" === type)
            {
                if (!is_involution(item)) return false;
            }
            else if ("derangement" === type)
            {
                for (dict={},i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= n || 1 === dict[x]) return false;
                    dict[x] = 1;
                }
                if (!is_derangement(item, null!=kfixed ? kfixed : 0, true)) return false;
            }
            else if ("multiset" === type)
            {
                M = $.multiplicity.slice();
                for (i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= M.length || 0 >= M[x]) return false;
                    M[x]--;
                }
                if (0 !== M.filter(function(x){return x !== 0;}).length) return false;
            }
            else//if ("permutation" === type)
            {
                for (dict={},i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= n || 1 === dict[x]) return false;
                    dict[x] = 1;
                }
                if (null!=kcycles && !is_kcycle(item, kcycles, '==', true)) return false;
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, PI) {
            if (!n || (0 >= n) || (null == item)) return null;
            var type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                order = $ && null!=$.order ? $.order : LEX
            ;
            dir = -1 === dir ? -1 : 1;
            if (("derangement"===type) && (null!=kfixed)) return next_kfixed(item, n, kfixed, dir, order);
            else if (("permutation"===type) && (null!=kcycles)) return next_kcycles(item, n, kcycles, dir, order);
            return next_permutation(item, n, dir, type, order, $ && null!=$.base ? $.base : null, PI);
        }
        ,rand: function(n, $) {
            var item, rndInt = Abacus.Math.rndInt, klass = this,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null
            ;
            if (0 > n) return null;
            if (0===n) return [];

            if ("cyclic" === type)
            {
                // p ~ 1 / n, O(n)
                var k = rndInt(0, n-1);
                item = 0 < k ? array(n-k, k, 1).concat(array(k, 0, 1)) : array(n, 0, 1);
            }
            else if ("derangement" === type)
            {
                if (null!=kfixed)
                {
                    if (0 > kfixed || kfixed > n || kfixed+1===n) return null;
                    return compose_kfixed([Combination.rand([n, kfixed], {type:"combination"}), Permutation.rand(n-kfixed, {type:"derangement"})], n, kfixed);
                }
                else
                {
                    // p ~ 1 / !n = e / n!, O(3n)
                    // adapted from http://local.disia.unifi.it/merlini/papers/Derangements.pdf
                    item = new Array(n);
                    var j, t, p, fixed = false;
                    do {
                        for (j=0; j<n; j++) item[j] = j;
                        j = n-1; fixed = false;
                        while (0 <= j)
                        {
                            p = rndInt(0, j);
                            if (item[p] === j)
                            {
                                fixed = true;
                                break;
                            }
                            else
                            {
                                t = item[j];
                                item[j] = item[p];
                                item[p] = t;
                            }
                            j--;
                        }
                        fixed = fixed || (0 === item[0]);
                    } while (fixed);
                }
            }
            else if ("involution" === type)
            {
                // p ~ 1 / I(n), O(n)
                // adapted from http://www.jjj.de/fxt/#fxt (Jörg Arndt)
                item = array(n, 0, 1);
                var rnd = Abacus.Math.rnd,
                    rat = 0.5, n1 = 1.0, nr = n,
                    x1, r1, x2, r2, t, s,
                    // involution branch ratios
                    b = [1.0].concat(array(n-1, function(){
                        var bk = rat;
                        // R(n) = 1 / (1 + (n-1) * R(n-1))
                        // R(n+1) = 1 / (1 + n * R(n))
                        n1 += 1.0;
                        rat = 1.0/(1.0 + n1*rat);
                        return bk;
                    })), r = array(n, 0, 1);
                    while (2 <= nr)
                    {
                        x1 = nr-1;   // choose last element
                        r1 = r[x1];  // available position
                        // remove from set:
                        --nr;  // no swap needed if x1==last
                        rat = b[nr];  // probability to choose fixed point
                        t = rnd();  // 0 <= t < 1
                        if (t > rat)  // 2-cycle
                        {
                            x2 = rndInt(0, nr-1);
                            r2 = r[x2];  // random available position != r1
                            --nr;
                            s = r[x2]; r[x2] = r[nr]; r[nr] = s;  // remove from set
                            s = item[r2]; item[r2] = item[r1]; item[r1] = s;  // create a 2-cycle
                        }
                        // else fixed point, nothing to do
                    }
            }
            else if ("multiset" === type)
            {
                // p ~ m1!*..*mk! / n!, O(n)
                // fisher-yates-knuth unbiased multiset shuffling
                item = shuffle($.multiset.slice());
            }
            else if ("connected" === type)
            {
                // p ~ 1 / (n-1)!, O(n)
                // sattolo unbiased shuffling
                return shuffle(array(n, 0, 1), true);
            }
            else//if ("permutation" === type)
            {
                if (null!=kcycles)
                {
                    if (0 > kcycles || kcycles > n) return null;
                    var part = SetPartition.rand(n, {"parts=":kcycles}),
                        perm = part.filter(function(p){return 1 < p.length;}).map(function(p){return Permutation.rand(p.length-1, {type:"permutation"})});
                    return compose_kcycles([part, perm], n, kcycles);
                }
                else
                {
                    // p ~ 1 / n!, O(n)
                    // fisher-yates-knuth unbiased shuffling
                    item = shuffle(array(n, 0, 1));
                }
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                order = $ && null!=-$.order ? $.order : LEX,
                sub = Arithmetic.sub, add = Arithmetic.add,
                mul = Arithmetic.mul, div = Arithmetic.div,
                O = Arithmetic.O, index = O, item0,
                i, j, ii, m, x, y, k, inv, /*indexOf,*/ unvisited, dict,
                I = Arithmetic.I, J = Arithmetic.J, N, M, item0;

            n = n || item.length;
            if (!item || 0 > n || n !== item.length) return J;
            if (0===n) return index;

            item0 = item;
            item = klass.DUAL(item.slice(), n, $);

            if ("cyclic"=== type)
            {
                // O(n)
                ii = item[0];
                for (i=0; i<n; i++)
                {
                    x = item[(i+n-ii)%n];
                    if (x !== i) return J;
                }
                index = Arithmetic.num(ii);
            }
            else if ("connected" === type)
            {
                // O(nlgn)
                if (n === item0.length)
                {
                    for (dict={},i=0; i<n; i++)
                    {
                        x = item0[i];
                        if (0 > x || x >= n || 1 === dict[x]) return J;
                        dict[x] = 1;
                    }
                    item0 = permutation2cycles(item0)[0];
                    if (n !== item0.length) return J;
                    k = item0.indexOf(n-1);
                    if (0 > k) return J;
                    item0 = array(n, function(i){return item0[(i+k)%n];}).slice(1);
                }
                if (n-1 === item0.length)
                {
                    return Permutation.rank(item0, n-1, {order:order});
                }
                else return J;
            }
            else if ("involution" === type)
            {
                // O(n^2) ??
                inv = permutation2cycles(item, true).sort(function(a,b){return stdMath.max.apply(null, a)-stdMath.max.apply(null, b);});
                if (inv.length)
                {
                    unvisited = ListSet(n);
                    x = inv[0][0]; y = inv[0][1];
                    index = add(countinvol(n, x, y, unvisited), matchswaps(n, x, y, inv, 1, unvisited));
                    unvisited.dispose();
                }
            }
            else if ("derangement" === type)
            {
                if (null!=kfixed)
                {
                    if (0 > kfixed || kfixed > n || kfixed+1===n) return J;
                    item0 = decompose_kfixed(item0.slice(), n, kfixed, order);
                    i = Combination.rank(item0[0], [n, kfixed], {type:"combination", base:n, dimension:kfixed, order:order});
                    j = Permutation.rank(item0[1], n-kfixed, {type:"derangement", order:order});
                    return add(j, mul(i, factorial(n-kfixed, false)));
                }
                else
                {
                    // O(n) algorithm best case, O(n^2) worst case
                    for (/*indexOf=new Array(n),*/dict={},i=0; i<n; i++)
                    {
                        x = item[i];
                        if (0 > x || x >= n || i === x || 1 === dict[x]) return J;
                        dict[x] = 1;
                        //indexOf[x] = i;
                    }
                    unvisited = ListSet(n);
                    inv = permutation2count(null, item);
                    for (i=0; i+1<n; i++)
                    {
                        //for (k=0,j=i+1; j<n; j++) k += (item[j] > i);
                        index = add(index, derange_rank(n, item[i], i, k=inv[i], unvisited));
                        unvisited.rem(item[i]);
                    }
                    unvisited.dispose();
                }
            }
            else if ("multiset" === type)
            {
                //item = permutation2inversion(null, multiset2permutation(item));
                // adapted from https://github.com/WoDoInc/FindMultisetRank
                // O(nm) ~ O(n^2) TODO construct O(nlgn) algorithm
                M = $.multiplicity.slice();
                for (i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= M.length || 0 >= M[x]) return J;
                    M[x]--;
                }
                if (0 !== M.filter(function(x){return x !== 0;}).length) return J;
                M = $.multiplicity.slice();
                N = $ && null!=$.count ? $.count : factorial(n,M);
                for (m=n-1,i=0; i<m && Arithmetic.gt(N, I); i++)
                {
                    ii = item[i]; index = add(index, div(mul(N, sum(M,0,ii-1,1)), n-i));
                    N = div(mul(N, M[ii]), n-i); M[ii]--;
                }
            }
            else//if ("permutation" === type)
            {
                if (null!=kcycles) return NotImplemented();
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // O(nlgn)
                for (dict={},i=0; i<n; i++)
                {
                    x = item[i];
                    if (0 > x || x >= n || 1 === dict[x]) return J;
                    dict[x] = 1;
                }
                inv = permutation2inversion(null, item);
                for (m=n-1,i=0; i<m; i++) index = add(mul(index, n-i), inv[i]);
            }

            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),I), index);

            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                type = $ && $.type ? $.type : "permutation",
                kcycles = $ && null!=$['cycles='] ? $['cycles=']|0 : null,
                kfixed = $ && null!=$['fixed='] ? $['fixed=']|0 : null,
                order = $ && null!=-$.order ? $.order : LEX,
                mod = Arithmetic.mod, div = Arithmetic.div, mul = Arithmetic.mul,
                add = Arithmetic.add, sub = Arithmetic.sub, val = Arithmetic.val,
                item, index0, /*indexOf,*/ unvisited, r, i, j, C, ii, x, y, k, b, t, N, M;

            if (0 > n) return null;

            index = null == index ? null : Arithmetic.num(index);
            if (null==index || !Arithmetic.inside(index, Arithmetic.J, $ && null!=$.count ? $.count : klass.count(n, $)))
                return null;

            if (0===n) return [];

            index0 = index;
            if ((!(COLEX&order) && (REVERSED&order)) || ((COLEX&order) && !(REVERSED&order)))
                index = sub($ && null!=$.last?$.last:sub(klass.count(n, $),Arithmetic.I), index);

            if ("cyclic"=== type)
            {
                // O(n)
                index = val(index);
                item = array(n, function(i){return (index+i)%n});
            }
            else if ("involution" === type)
            {
                // O(n^2) ??
                item = [];
                if (Arithmetic.gt(index, Arithmetic.O))
                {
                    unvisited = ListSet(n);
                    for (y=1; y<n; y++)
                    {
                        for (x=0; x<y; x++)
                        {
                            r = countinvol(n, x, y, unvisited);
                            if (Arithmetic.lte(r, index))
                            {
                                item.push([x, y]);
                                break;
                            }
                        }
                        if (item.length) break;
                    }
                    if (item.length)
                    {
                        item = item.concat(findswaps(n, x, y, sub(index, r), unvisited));
                    }
                    unvisited.dispose();
                }
                item = cycles2permutation(item, n);
            }
            else if ("connected" === type)
            {
                item = Permutation.unrank(index0, n-1, {order:order});
                if (null==item) return null;
                return cycles2permutation([[n-1].concat(item)], n);
            }
            else if ("derangement" === type)
            {
                if (null!=kfixed)
                {
                    if (0 > kfixed || kfixed > n || kfixed+1===n) return null;
                    r = factorial(n-kfixed, false);
                    i = Combination.unrank(div(index0, r), [n, kfixed], {type:"combination", base:n, dimension:kfixed, order:order});
                    j = Permutation.unrank(mod(index0, r), n-kfixed, {type:"derangement", order:order});
                    if (null==i || null==j) return null;
                    return compose_kfixed([i, j], n, kfixed);
                }
                else
                {
                    if (2 > n) return null;
                    // https://cs.stackexchange.com/questions/142186/faster-algorithm-for-specific-inversion-count-part-2
                    // O(n^2)
                    item = new Array(n);
                    //indexOf = array(n, -1, 0);
                    C = Counters(n);
                    unvisited = ListSet(n);
                    i = 0;
                    while (i<n && Arithmetic.gte(index, Arithmetic.O))
                    {
                        //for (var k=0,j=0; j<i; j++) k += (item[j] > i);
                        k = C.eval(i);
                        for (r=Arithmetic.O,y=unvisited.last(); y && (y.index>=0); y=y.prev)
                        {
                            if ((y.index === i)/* || (0 <= indexOf[y] && indexOf[y] < i)*/) continue;
                            r = derange_rank(n, y.index, i, n-i-1-k-(y.index>i), unvisited);
                            if (Arithmetic.lte(r, index)) break;
                        }
                        if (null == y) break;
                        index = sub(index, r);
                        item[i] = y.index;
                        //indexOf[y] = i;
                        unvisited.rem(y.index);
                        if (y.index > i+1)
                            C.offset(y.index-1, 1).offset(i, -1);
                        i++;
                    }
                    unvisited.dispose();
                    C.dispose();
                    //if (!Arithmetic.equ(O, index)) item = null;
                }
            }
            else if ("multiset" === type)
            {
                // adapted from https://github.com/WoDoInc/FindMultisetRank
                // O(nm) ~ O(n^2) TODO construct O(nlgn) algorithm
                M = $.multiplicity.slice(); item = array(n);
                N = $ && null!=$.count ? $.count : factorial(n,M);
                for (i=0; i<n; i++)
                {
                    b = 0; ii = 0; r = val(div(mul(index, n-i), N));
                    while (ii<M.length && b+M[ii]<=r) b+=M[ii++];
                    index = sub(index, div(mul(N, b), n-i));
                    N = div(mul(N, M[ii]), n-i); M[ii]--; item[i] = ii;
                }
            }
            else//if ("permutation" === type)
            {
                if (null!=kcycles) return NotImplemented();
                // "Efficient Algorithms to Rank and Unrank Permutations in Lexicographic Order", Blai Bonet (http://ldc.usb.ve/~bonet/reports/AAAI08-ws10-ranking.pdf)
                // O(nlgn)
                item = array(n); item[n-1] = 0;
                for (r=index,i=n-2; i>=0; i--)
                {
                    b = n-i; t = mod(r, b); r = div(r, b);
                    item[i] = val(t);
                }
                inversion2permutation(item, item);
            }

            item = klass.DUAL(item, n, $);

            return item;
        }
        ,permute: permute
        ,shuffle: function(a, type) {
            if ("cyclic" === type )
            {
                var n = a.length, k = Abacus.Math.rndInt(0, n-1);
                if (0 < k) a.push.apply(a, a.splice(0, k));
                return a;
            }
            else if ("connected" === type)
            {
                return shuffle(a, true);
            }
            else
            {
                return shuffle(a);
            }
        }
        ,product: function(/* permutations */) {
            return arguments.length ? permutationproduct(is_array(arguments[0])&&is_array(arguments[0][0]) ? arguments[0] : slice.call(arguments)) : null;
        }
        ,directsum: function(/* permutations */) {
            return arguments.length ? permutationdirectsum(is_array(arguments[0])&&is_array(arguments[0][0]) ? arguments[0] : slice.call(arguments)) : null;
        }
        ,toCycles: function(item) {
            return permutation2cycles(item);
        }
        ,fromCycles: function(item, n) {
            return cycles2permutation(item, n);
        }
        ,toSwaps: function(item) {
            return permutation2swaps(item);
        }
        ,fromSwaps: function(item, n) {
            return swaps2permutation(item, n);
        }
        ,toInversion: function(item) {
            return permutation2inversion(null, item);
        }
        ,fromInversion: function(item) {
            return inversion2permutation(null, item);
        }
        ,toInverse: function(item) {
            return permutation2inverse(null, item);
        }
        ,Multiset: function(n, multi, dir) {
            return multiset(multi, n, -1===dir?-1:1);
        }
        ,toMultiset: function(item, multi) {
            return permutation2multiset(item, multi);
        }
        ,fromMultiset: function(item) {
            return multiset2permutation(item);
        }
        ,toMatrix: function(item, transposed) {
            return permutation2matrix(null, item, transposed);
        }
        ,fromMatrix: function(item, transposed) {
            return matrix2permutation(null, item, transposed);
        }
        ,parity: NotImplemented
        ,isPermutation: is_permutation
        ,isIdentity: is_identity
        ,isCyclic: is_cyclic
        ,isDerangement: is_derangement
        ,isInvolution: is_involution
        ,isKthroot: is_kthroot
        ,isConnected: is_connected
        ,isKcycle: is_kcycle
    }
    ,output: function(item) {
        var self = this, $ = self.$, n = self.n,
            type = $.type ? $.type : "permutation",
            kcycles = null!=$['cycles='] ? $['cycles=']|0 : null,
            kfixed = null!=$['fixed='] ? $['fixed=']|0 : null;

        if (item && ("derangement" === type) && (null!=kfixed) && is_array(item[0]) && is_array(item[1]))
        {
            return compose_kfixed(item, n, kfixed);
        }
        else if (item && ("permutation" === type) && (null!=kcycles) && is_array(item[0]) && is_array(item[1]))
        {
            return compose_kcycles(item, n, kcycles);
        }
        else if (item && ("connected" === type) && (n-1 === item.length))
        {
            item = cycles2permutation([[n-1].concat(item)], n);
        }
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
    ,_update: function() {
        var self = this, klass = self[CLASS], $ = self.$, n = self.n, item = self.__item, k,
            type = $.type ? $.type : "permutation",
            kcycles = null!=$['cycles='] ? $['cycles=']|0 : null,
            kfixed = null!=$['fixed='] ? $['fixed=']|0 : null
        ;
        if (item && ("derangement" === type) && (null!=kfixed))
        {
            if (!is_array(item[0]) && !is_array(item[1]))
                self.__item = decompose_kfixed(item, n, kfixed, $.order);
        }
        else if (item && ("permutation" === type) && (null!=kcycles))
        {
            if (!is_array(item[0]) && !is_array(item[1]))
                self.__item = decompose_kcycles(item, n, kcycles, $.order);
        }
        else if (item && ("connected" === type))
        {
            if (n === item.length)
            {
                item = permutation2cycles(item)[0];
                k = item.indexOf(n-1);
                self.__item = array(n, function(i){return item[(i+k)%n];}).slice(1);
                //self.__item = klass.DUAL(self.__item, n-1, {order:$.order});
            }
        }
        self.item__ = perm_item_(self.__item, self.n, self.$.order, self.$.type);
        return self;
    }
});
function perm_item_(item, n, order, type)
{
    return null;
    /*
    if (null == item) return null;
    var PI = null, i, k, m, s, n2, v;
    if ('involution' === type)
    {
        PI = new Array(1+n+n);
        v = new Array(n);
        i = 0; k = 0; m = 0; s = 0;
        while (i<n)
        {
            if (null == v[i])
            {
                if (i !== item[i])
                {
                    PI[++k] = stdMath.min(i,item[i]);
                    PI[++k] = stdMath.max(i,item[i]);
                    s++;
                }
                else
                {
                    PI[1+n+m] = i;
                    m++;
                }
                v[i] = 1; v[item[i]] = 1;
            }
            i++;
        }
        PI[0] = s;
    }
    return PI;
    */
}
function compose_kfixed(item, n, fixed, order)
{
    return CombinatorialIterator.connect("combine", item[0], item[1]);
}
function compose_kcycles(item, n, cycles, order)
{
    var partition = item[0];
    if (n+1 === item[0].length)
    {
        partition = operate(function(partition, i){
                partition[item[0][i]].push(i);
                return partition;
        }, array(cycles, function(){return [];}), null, 0, n-1, 1);
    }
    return cycles2permutation(partition.filter(function(p){return 1 < p.length;}).map(function(p, i){return [p[p.length-1]].concat(permute(p.slice(0, -1), item[1][i], true));}), n);
}
function decompose_kfixed(item, n, fixed, order)
{
    var i, j, k;
    i = item.filter(function(c, i){return c===i;});
    for (k=i.length-1; k>=0; k--) item.splice(i[k], 1);
    k = mergesort(item.slice(), 1, true);
    j = item.map(function(c){return k.indexOf(c);});
    //i = Combination.DUAL(i, [n, fixed], {base:n, dimension:fixed, order:order});
    //j = Permutation.DUAL(j, n-fixed, {order:order});
    return [i, j];
}
function decompose_kcycles(item, n, cycles, order)
{
    var i, j, k, l, m, w, z, s, p;
    item = permutation2cycles(item);
    i = new Array(n+1); i[n] = [n, new Array(n), array(item.length, 0, 0)];
    j = [];
    for (k=0; k<item.length; k++)
    {
        for (s=item[k],z=0; z<s.length; z++)
        {
            i[s[z]] = k;
            i[n][1][s[z]] = k;
            i[n][2][k]++;
        }
        if (1 < s.length)
        {
            w = mergesort(s.slice(), 1, true);
            l = s.indexOf(w[w.length-1]); // max
            m = array(s.length, function(z){return s[(l+z)%s.length];});
            p = m.slice(1).map(function(c){return w.indexOf(c);});
            //p = Permutation.DUAL(p, p.length, {order:order});
            j.push(p);
        }
    }
    return [i, j];
}
function next_kfixed(item, n, k, dir, order)
{
    if (0 > k || k > n || k+1===n) return null;
    var next0, next1 = Permutation.succ(item[1], null, n-k, {type:"derangement", order:order}, dir);
    if (null == next1)
    {
        next0 = Combination.succ(item[0], null, [n, k], {type:"combination", order:order}, dir);
        if (null == next0) return null;
        return [next0, Permutation.initial(n-k, {type:"derangement", order:order}, dir)];
    }
    else
    {
        return [item[0], next1];
    }
}
function next_kcycles(item, n, k, dir, order)
{
    if (0 > k || k > n) return null;
    var i, j, next0, next1, order2 = REVERSED&order ? LEX | REVERSED : LEX;
    for (i=item[1].length-1; i>=0; i--)
    {
        next1 = Permutation.succ(item[1][i], null, item[1][i].length, {type:"permutation", order:order}, dir);
        if (null == next1)
        {
            item[1][i] = Permutation.initial(item[1][i].length, {type:"permutation", order:order}, dir);
        }
        else
        {
            item[1][i] = next1;
            break;
        }
    }
    if (null == next1)
    {
        next0 = SetPartition.succ(item[0], null, n, {"parts=":k, order:LEX | (order&REVERSED ? REVERSED : 0)}, dir);
        if (null == next0) return null;
        return [next0, operate(function(partition, i){
                partition[item[0][i]].push(i);
                return partition;
        }, array(k, function(){return [];}), null, 0, n-1, 1).filter(function(p){return 1 < p.length;}).map(function(p){return Permutation.initial(p.length-1, {type:"permutation", order:order}, dir);})];
    }
    else
    {
        return [item[0], item[1]];
    }
}
function next_permutation(item, N, dir, type, order, multiplicity, PI)
{
    //maybe "use asm"
    var n = N, m = null == multiplicity ? n : multiplicity,
        k, kl, l, r, s, s0, fixed, done, k0, DK, a, b, da, db, MIN, MAX;
    if (0 >= n) return null;

    if ("connected" === type)
    {
        return next_permutation(item, N-1, dir, "permutation", order, null, PI);
    }

    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    MIN = 0; MAX = n-1;
    DK = 1; k0 = MAX;
    a = 1; b = 0;
    da = 1; db = 0;
    if (COLEX & order)
    {
        //CP-symmetric of LEX
        DK = -DK; k0 = MAX-k0;
        a = -a; b = m-1-b;
        dir = -dir;
    }
    if (REFLECTED & order)
    {
        //P-symmetric of LEX
        DK = -DK; k0 = MAX-k0;
        da = -1; db = m-1;
    }
    if (REVERSED & order)
    {
        //T-symmetric of LEX
        dir = -dir;
    }

    // constant average delay (CAT) for permutations & multisets
    // linear worst-case for derangements
    // linear for cyclic shift permutations
    if (0 > dir)
    {
        if ("cyclic" === type)
        {
            k = MAX-k0;
            if (a*item[k]+b > 0)
            {
                //item = [item[n-1]].concat(item.slice(0,-1));
                da = n-1; DK = n+DK;
                for (l=0; l<n; l++)
                {
                    s = (a*item[k]+b+da)%n;
                    item[k] = a*s+b;
                    k = (k+DK)%n;
                }
            }
            //else last item
            else item = null;
        }
        else if ("involution" === type)
        {
            /*k = 0; fixed = true;
            while (fixed && k<n)
            {
                kl = item[k];   // inverse perm == perm
                item[k] = k; item[kl] = kl; // undo
                //item[k] = 0; item[0] = k;  // swap

                while (kl--)
                {
                    if (item[kl] !== kl)
                    {
                        l = item[kl]; item[kl] = kl; item[l] = l; // undo
                        fixed = false; break;
                    }
                }

                k++;
            }
            if (fixed)*/ item = null; // last
        }
        else//if (("multiset" === type) || ("derangement" === type) || ("permutation" === type))
        {
            do {
            fixed = false;
            //Find the largest index k such that a[k] > a[k + 1].
            // taking into account equal elements, generates multiset permutations
            k = k0-DK;
            while (MIN<=k && k<=MAX && a*item[k]<=a*item[k+DK]) k-=DK;
            // If no such index exists, the permutation is the last permutation.
            if (MIN<=k && k<=MAX)
            {
                //Find the largest index kl greater than k such that a[k] > a[kl].
                kl = k0;
                while (MIN<=kl && kl<=MAX && DK*(kl-k)>0 && a*item[k]<=a*item[kl]) kl-=DK;
                //Swap the value of a[k] with that of a[l].
                s = item[k]; item[k] = item[kl]; item[kl] = s;
                //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                l = k+DK; r = k0;
                while (MIN<=l && l<=MAX && MIN<=r && r<=MAX && DK*(r-l)>0)
                {
                    s = item[l]; item[l] = item[r]; item[r] = s;
                    fixed = fixed || (da*l+db === item[l]) || (da*r+db === item[r]);
                    l+=DK; r-=DK;
                }
                if ("derangement" === type)
                {
                    if (MIN<=kl && kl<=MAX) fixed = fixed || (da*kl+db === item[kl]);
                    if (MIN<=r && r<=MAX) fixed = fixed || (da*r+db === item[r]);
                    // TODO: find a way check for fixed without looping over the range here
                    for (fixed=fixed||(da*k+db === item[k]),l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
                }
                else
                {
                    fixed = false;
                }
            }
            //else last item
            else item = null;
            // every 2-3 permutations is derangement on average, ie p(D) = 1/e
            } while (item && fixed);
        }
    }
    else
    {
        if ("cyclic" === type)
        {
            k = MAX-k0;
            if (a*item[k]+b < n-1)
            {
                //item = item.slice(1).concat([item[0]]);
                da = n+1; DK = n+DK;
                for (l=0; l<n; l++)
                {
                    s = (a*item[k]+b+da)%n;
                    item[k] = a*s+b;
                    k = (k+DK)%n;
                }
            }
            //else last item
            else item = null;
        }
        else if ("involution" === type)
        {
            /*
            if (null == PI) PI = perm_item_(item, n, order, type);
            // generate (lexicographic) involutions by (lexicographic) 0- or 1-cycles
            s = s0 = PI[0]; // how many swaps (1-cycles)
            fixed = true;
            if (0 === s)
            {
                if (1 < n)
                {
                    l = 1; r = 2; PI[l] = MAX-1; PI[r] = MAX;
                    // new swap (1-cycle)
                    item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s=1;
                }
                fixed = false;
            }
            else
            {
                l = (s<<1)-1;
                while (fixed && l>0)
                {
                    r = l+1;

                    // add new cycle
                    k0 = PI[l]+1;
                    while (k0<=MAX && k0!==item[k0]) k0++;
                    if (k0<=MAX)
                    {
                        k = k0+1;
                        while (k<=MAX && k!==item[k]) k++;
                        if (k<=MAX && (s===s0 || k0!==PI[l+2] || k!==PI[l+3]))
                        {
                            // new swap
                            l+=2; r=l+1; PI[l] = k0; PI[r] = k;
                            item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                            fixed = false;
                            break;
                        }
                    }

                    // restore cycle
                    item[PI[l]] = PI[l]; item[PI[r]] = PI[r]; s--;

                    k = PI[r]+1;
                    while (k<=MAX && k!==item[k]) k++;
                    if (k<=MAX)
                    {
                        // extend cycle to right
                        PI[r] = k;
                        item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                        fixed = false;
                        break;
                    }

                    k0 = PI[l]-1;
                    while (MIN<=k0 && k0!==item[k0]) k0--;
                    if (MIN<=k0)
                    {
                        k = k0+1;
                        while (k<=MAX && k!==item[k]) k++;
                        if (k<=MAX)
                        {
                            // extend cycle to left
                            PI[l] = k0; PI[r] = k;
                            item[PI[l]] = PI[r]; item[PI[r]] = PI[l]; s++;
                            fixed = false;
                            break;
                        }
                    }

                    // next cycle
                    l-=2;
                }
            }
            PI[0] = 0 > s ? 0 : s;
            if (fixed) item = null;
            */
            // adapted from http://www.jjj.de/fxt/#fxt (Jörg Arndt)
            k = n; fixed = true;
            while (fixed && k--)
            {
                kl = item[k];   // inverse perm == perm
                item[k] = k; item[kl] = kl;  // undo prior swap

                while (kl--)
                {
                    if (item[kl] === kl)
                    {
                        item[k] = kl; item[kl] = k;  // swap
                        fixed = false; break;
                    }
                }
            }
            if (fixed) item = null; // last
        }
        else//if (("multiset" === type) || ("derangement" === type) || ("permutation" === type))
        {
            // variation of  http://en.wikipedia.org/wiki/Permutation#Systematic_generation_of_all_permutations
            do {
            fixed = false;
            //Find the largest index k such that a[k] < a[k + 1].
            // taking into account equal elements, generates multiset permutations
            k = k0-DK;
            while (MIN<=k && k<=MAX && a*item[k]>=a*item[k+DK]) k-=DK;
            // If no such index exists, the permutation is the last permutation.
            if (MIN<=k && k<=MAX)
            {
                //Find the largest index kl greater than k such that a[k] < a[kl].
                kl = k0;
                while (MIN<=kl && kl<=MAX && DK*(kl-k)>0 && a*item[k]>=a*item[kl]) kl-=DK;
                //Swap the value of a[k] with that of a[l].
                s = item[k]; item[k] = item[kl]; item[kl] = s;
                //Reverse the sequence from a[k + 1] up to and including the final element a[n].
                l = k+DK; r = k0;
                while (MIN<=l && l<=MAX && MIN<=r && r<=MAX && DK*(r-l)>0)
                {
                    s = item[l]; item[l] = item[r]; item[r] = s;
                    fixed = fixed || (da*l+db === item[l]) || (da*r+db === item[r]);
                    l+=DK; r-=DK;
                }
                if ("derangement" === type)
                {
                    if (MIN<=kl && kl<=MAX) fixed = fixed || (da*kl+db === item[kl]);
                    if (MIN<=r && r<=MAX) fixed = fixed || (da*r+db === item[r]);
                    // TODO: find a way check for fixed without looping over the range here
                    for (fixed=fixed||(da*k+db === item[k]),l=k-DK; !fixed && MIN<=l && l<=MAX; l-=DK) fixed = da*l+db === item[l];
                }
                else
                {
                    fixed = false;
                }
            }
            //else last item
            else item = null;
            // every 2-3 permutations is derangement on average, ie p(D) = 1/e
            } while (item && fixed);
        }
    }
    return item;
}
