// http://en.wikipedia.org/wiki/Power_set
// PowerSet(n) = Combinations(n,0) + Combinations(n,1) + .. + Combinations(n,n-1) + Combinations(n,n)
Subset = Abacus.Powerset = Abacus.Subset = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function Subset(n, $) {
        var self = this, sub = null;
        if (!is_instance(self, Subset)) return new Subset(n, $);
        $ = $ || {}; n = n || 0;
        if (is_instance(n, CombinatorialIterator))
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.type = $.type || 'subset';
        $.rand = $.rand || {};
        $.base = n;
        $.mindimension = 0;
        $.maxdimension = stdMath.max(0, n);
        $.dimension = $.maxdimension;
        if ('binary' === $.output) $.output = function(item,n) {return Subset.toBinary(item, n);};
        CombinatorialIterator.call(self, "Subset", n, $, sub ? {method:$.submethod, iter:sub, pos:$.subpos, cascade:$.subcascade} : null);
    }

    ,__static__: {
         C: CombinatorialIterator.D
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function(item, n, $, dir) {
            if (null == item) return null;
            // some C-P-T dualities, symmetries & processes at play here
            var klass = this, type = $ && $.type ? $.type : 'subset',
                order = $ && (null != $.order) ? $.order : LEX, order0 = null;
            if ('binary' === type)
            {
                order = LEX;
                order0 = $.order;
                if (!(REFLECTED & order0)) order |= REFLECTED;
                if (REVERSED & order0) order |= REVERSED;
                $.order = order;
            }
            else if (COLEX & order)
            {
                order = LEX;
                order0 = $.order;
                if (REFLECTED & order0) order |= REFLECTED;
                if (REVERSED & order0) order |= REVERSED;
                $.order = order;
            }
            item = CombinatorialIterator.DUAL.call(klass, item, n, $, dir);
            if ($ && (null != order0)) $.order = order0;
            return item;
        }
        ,count: function(n, $) {
             return 0 > n ? Abacus.Arithmetic.O : pow2(n);
        }
        ,initial: function(n, $, dir) {
            // some C-P-T dualities, symmetries & processes at play here
            // last (0>dir) is C-symmetric of first (0<dir)
            var item, klass = this,
                type = $ && $.type ? $.type : 'subset',
                order = $ && (null != $.order) ? $.order : LEX;

            if (0 > n) return null;

            dir = -1 === dir ? -1 : 1;
            if (REVERSED & order) dir = -dir;

            // O(n)
            // fixed-length item, with effective length as extra last pos
            item = [];
            if (0 < n)
            {
                if ((('binary' === type) || (COLEX & order)) && !(MINIMAL & order))
                {
                    //item = 0 > dir ? array(n, 0, 1) : [];
                    if (0 > dir) item = array(n, 0, 1);
                }
                else
                {
                    if (0 > dir) item = [n-1];
                }
            }
            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,valid: function(item, n, $) {
            var klass = this, is_binary = 'binary' === ($ || {}).type, i, x, l, dict;

            if (!item || (0 > n)) return false;

            item = klass.DUAL(item.slice(), n, $, -1);
            if ((0 > item.length) || (n < item.length)) return false;
            if (is_binary)
            {
                l = item.length;
                dict = {};
                for (i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x <= item[i+1]))) return false;
                    dict[x] = 1;
                }
            }
            else
            {
                l = item.length;
                dict = {};
                for (i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x >= item[i+1]))) return false;
                    dict[x] = 1;
                }
            }
            return true;
        }
        ,succ: function(item, index, n, $, dir, SI) {
            if (null == item) return null;
            var klass = this, Arithmetic = Abacus.Arithmetic, i, item, count,
                type = $ && $.type ? $.type : "subset",
                order = $ && (null != $.order) ? $.order : LEX;
            if (0 >= n) return null;
            if (MINIMAL & order)
            {
                if (null != index)
                {
                    count = null != $.count ? $.count : klass.count(n, $);
                    index = Arithmetic.add(index, 0 > dir ? Arithmetic.J : Arithmetic.I);
                    if (Arithmetic.inside(index, Arithmetic.J, count))
                    {
                        if (REVERSED & order) index = Arithmetic.sub(Arithmetic.sub(count, Arithmetic.I), index);
                        index = grayn(index);
                        // O(n)
                        i = 0; item = new Array(n+1); item[n] = 0;
                        while ((i < n) && Arithmetic.gt(index, Arithmetic.O))
                        {
                            if (Arithmetic.gt(Arithmetic.band(index, 1), Arithmetic.O)) item[item[n]++] = i;
                            ++i; index = Arithmetic.shr(index,  1);
                        }
                        item = klass.DUAL(item, n, $, 1);
                        return item;
                    }
                }
                return null;
            }
            else if ((COLEX & order) || ('binary' === type))
            {
                dir = -1 === dir ? -1 : 1;
                //if (REVERSED & order) dir = -dir;
                return CombinatorialIterator.succ.call(this, item, index, n, $, dir);
            }
            return next_subset(item, n, -1 === dir ? -1 : 1, order);
        }
        ,rand: function(n, $) {
            var klass = this, rndInt = Abacus.Math.rndInt, item;
            if (0 > n) return null;
            // p ~ 1 / 2^n, O(n)
            for (var list=null,i=n-1; i>=0; --i) if (rndInt(0, 1))
                list = {len:list ? list.len+1 : 1, k:i, next:list};
            item = list ? array(list.len, function(i) {var k = list.k; list = list.next; return k;}): [];

            // fixed-length item, with effective length as extra last pos
            //if (!$ || "binary" !== $.type)
            //item = item.concat(item.length<n?new Array(n-item.length):[]).concat(item.length);

            item = klass.DUAL(item, n, $, 1);
            return item;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: function(item, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J,
                add = Arithmetic.add, sub = Arithmetic.sub,
                type = $ && $.type ? $.type : "subset",
                order = $ && (null != $.order) ? $.order : LEX,
                is_binary = 'binary' === type,
                is_reflected = REFLECTED & order,
                index = J, x, y, i, j, k, l, dict;

            if (!$ || !item || (0 > n)) return J;

            item = klass.DUAL(item, n, $, -1);
            if (n+1 === item.length)
            {
                item = (is_binary && !is_reflected) || (is_reflected && !is_binary) ? item.slice(n-item[n], n) : item.slice(0, item[n]);
            }
            if (($.mindimension > item.length) || ($.maxdimension < item.length)) return J;
            if (0 === n)
            {
                index = O;
            }
            else if (MINIMAL & order)
            {
                // O(n)
                l = item/*[n]*/.length;
                dict = {};
                for (index=O,i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x >= item[i+1]))) return J;
                    index = add(index, subset_bin_rank(n, x));
                    dict[x] = 1;
                }
                index = igrayn(index);
                if (REVERSED & order)
                    index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), I), index);
            }
            else if (COLEX & order)
            {
                // O(n)
                l = item/*[n]*/.length;
                dict = {};
                for (index=O,i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x >= item[i+1]))) return J;
                    index = add(index, subset_bin_rank(n, x));
                    dict[x] = 1;
                }
                if (REVERSED & order)
                    index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), I), index);
            }
            else if (is_binary)
            {
                // O(n)
                l = item/*[n]*/.length;
                dict = {};
                for (index=O,i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x <= item[i+1]))) return J;
                    index = add(index, subset_bin_rank(n, x));
                    dict[x] = 1;
                }
                if (REVERSED & order)
                    index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), I), index);
            }
            else
            {
                // O(n)
                l = item/*[n]*/.length;
                y = null; dict = {};
                for (index=O,i=0; i<l; ++i)
                {
                    x = item[i];
                    if ((0 > x) || (x >= n) || (1 === dict[x]) || ((i+1 < l) && (x >= item[i+1]))) return J;
                    index = add(index, subset_lex_rank(n, x, y));
                    dict[x] = 1; y = x;
                }
                if (REVERSED & order)
                    index = sub($ && (null != $.last) ? $.last : sub(klass.count(n, $), I), index);
            }
            return index;
        }
        ,unrank: function(index, n, $) {
            var klass = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
                band = Arithmetic.band, shr = Arithmetic.shr, gt = Arithmetic.gt,
                add = Arithmetic.add, sub = Arithmetic.sub, gte = Arithmetic.gte,
                type = $ && $.type ? $.type : "subset",
                order = $ && (null != $.order) ? $.order : LEX,
                count = $ && (null != $.count) ? $.count : klass.count(n, $),
                item, i, j, y, c = O, c0;

            index = null == index ? null : Arithmetic.num(index);
            if (!$ || (0 > n) || (null == index) || !Arithmetic.inside(index, Arithmetic.J, count))
                return null;

            item = new Array(n+1)/*[]*/; item[n] = 0;

            if (0 < n)
            {
                if (MINIMAL & order)
                {
                    if (REVERSED & order)
                        index = sub($ && (null != $.last) ? $.last : sub(count, I), index);
                    index = grayn(index);

                    // O(n)
                    i = 0;
                    while ((i < n) && gt(index, O))
                    {
                        if (gt(band(index, 1), O)) item[item[n]++] = i;//item.push(i);
                        ++i; index = shr(index, 1);
                    }
                }
                else if (COLEX & order)
                {
                    if (REVERSED & order)
                        index = sub($ && (null != $.last) ? $.last : sub(count, I), index);

                    // O(n)
                    i = 0;
                    while ((i < n) && gt(index, O))
                    {
                        if (gt(band(index, 1), O)) item[item[n]++] = i;//item.push(i);
                        ++i; index = shr(index, 1);
                    }
                }
                else if ('binary' === type)
                {
                    if (REVERSED & order)
                        index = sub($ && (null != $.last) ? $.last : sub(count, I), index);

                    // O(n)
                    i = 0;
                    while ((i < n) && gt(index, O))
                    {
                        if (gt(band(index, 1), O)) item[item[n]++] = i;//item.push(i);
                        ++i; index = shr(index, 1);
                    }
                }
                else
                {
                    if (REVERSED & order)
                        index = sub($ && (null != $.last) ? $.last : sub(count, I), index);

                    // O(n)
                    y = null; i = 0; c = O;
                    while ((i < n) && gt(index, O))
                    {
                        // find the largest less than
                        j = i; c = c0 = subset_lex_rank(n, i, y);
                        while ((i+1 < n) && gt(index, c0))
                        {
                            j = i; c = c0;
                            c0 = subset_lex_rank(n, ++i, y);
                        }
                        if (gte(index, c0)) {c = c0; j = i;}

                        item[item[n]++] = j;
                        y = j;
                        index = sub(index, c);
                    }
                }
            }
            item = item.slice(0, item[n]);
            item = klass.DUAL(item, n, $, 1);

            return item;
        }
        ,toBinary: function(item, n) {
            return subset2binary(item, n);
        }
        ,fromBinary: function(item, n) {
            return binary2subset(item, n);
        }
    }

    ,_update: function() {
        var self = this, $ = self.$, n = self.n, item = self.__item, itemlen,
            order = $.order || LEX, is_binary = 'binary' === $.type,
            is_reflected = REFLECTED & order;
        if ((null != item) && (n+1 !== item.length))
        {
            itemlen = item.length;
            item = item.slice();
            if (itemlen < n)
            {
                if (((is_binary) && !is_reflected) || (is_reflected && !(is_binary)))
                    item.unshift.apply(item, new Array(n-itemlen));
                else
                    item.push.apply(item, new Array(n-itemlen));
            }
            item.push(itemlen);
            self.__item = item;
        }
        return self;
    }
    ,output: function(item) {
        if (null == item) return null;
        var n = this.n;
        if (n+1 === item.length)
        {
            var $ = this.$, order = $.order || LEX, is_binary = 'binary' === $.type,
                is_reflected = REFLECTED & order;
            item = ((is_binary) && !is_reflected) || (is_reflected && !(is_binary)) ? item.slice(n-item[n], n) : item.slice(0, item[n]);
        }
        return CombinatorialIterator[PROTO].output.call(this, item);
    }
});
function next_subset(item, N, dir, order)
{
    //maybe "use asm"
    var LEN = N, MIN = 0, MAX = N-1, IMIN, IMAX, t, DI, i0, i1, a, b;

    if (0 >= N) return null;

    // some C-P-T dualities, symmetries & processes at play here
    // LEX
    DI = 1; a = 1; b = 0;
    if (COLEX & order)
    {
        //CP-symmetric of LEX
        /*
        a = -a; b = MAX-b;
        DI = -DI;
        //dir = -dir;
        */
        return null;
    }
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
        IMIN = N-(item[LEN] || 1); IMAX = N-1;
        i0 = IMAX; i1 = IMIN;
    }
    else
    {
        IMIN = 0; IMAX = item[LEN]-1;
        i0 = IMIN; i1 = IMAX;
    }

    // loopless, item is of fixed dimensions n+1, with effective length item[LEN] as extra last pos (ie N)
    // NOTE: effective item = item.slice(0,item[LEN]) or item.slice(N-item[LEN],N) if reflected
    if (0 > dir)
    {
        // NOTE: colex+reversed does not work
        if (0 < item[LEN])
        {
            t = item[i1];
            if (t > MIN)
            {
                if ((1 === item[LEN]) || (t > item[i1-DI]+1))
                {
                    // extend
                    item[i1] -= 1; item[i1+DI] = MAX;
                    ++item[LEN];
                }
                else
                {
                    // reduce
                    --item[LEN];
                }
            }
            else
            {
                // empty
                item[LEN] = 0;
            }
        }
        else item = null;
    }
    else
    {
        // adapted from "Generating All and Random Instances of a Combinatorial Object", Ivan Stojmenovic (http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.211.6576)
        if (0 === item[LEN])
        {
            // empty
            item[IMIN] = a*MIN+b; item[LEN] = 1;
        }
        else if (a*item[i0]+b < MAX)
        {
            if (a*item[i1]+b < MAX)
            {
                // extend
                item[i1+DI] = item[i1]+a; ++item[LEN];
            }
            else
            {
                // reduce
                item[i1-DI] += a; --item[LEN];
            }
        }
        // last
        else item = null;
    }
    return item;
}
