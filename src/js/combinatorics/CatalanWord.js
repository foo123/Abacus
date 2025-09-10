// https://en.wikipedia.org/wiki/Catalan_number
CatalanWord = Abacus.CatalanWord = Class(CombinatorialIterator, {

    // extends and implements CombinatorialIterator
    constructor: function CatalanWord(n, $) {
        var self = this, sub = null, K;
        if (!is_instance(self, CatalanWord)) return new CatalanWord(n, $);
        $ = $ || {}; $.type = 'catalan';
        n = n || 0;
        if (is_instance(n, CombinatorialIterator))
        {
            sub = n;
            n = sub.base();
        }
        else
        {
            sub = $.sub;
        }
        $.base = n;
        $.dimension = stdMath.max(0, 2*n);
        $.rand = $.rand || {}; $.rand['catalan'] = 1;
        $.symbols = $.symbols || ['(',')']; if (is_string($.symbols)) $.symbols = $.symbols.split('');
        CombinatorialIterator.call(self, "CatalanWord", n, $, sub ? {method:$.submethod, iter:sub, pos:$.subpos, cascade:$.subcascade} : null);
    }

    ,__static__: {
         C: CombinatorialIterator.C
        ,P: CombinatorialIterator.P
        ,T: CombinatorialIterator.T
        ,DUAL: function(item, n, $, dir) {
            return item;
        }
        ,count: function(n, $) {
            return 0 > n ? Abacus.Arithmetic.O : catalan(n);
        }
        ,initial: function(n, $, dir) {
            var klass = this, item, j, order = $ && (null != $.order) ? $.order : LEX;

            if ((0 > n)) return null;

            dir = -1 === dir ? -1 : 1;

            if ((REVERSED & order)) dir = -dir;

            // O(n)
            item = array(n, function(i) {return 0 > dir ? (2*i) : i;});
            j = 0;
            return array(2*n, function(i) {
                if ((j < n) && (i === item[j])) {++j; return $.symbols[0];}
                return $.symbols[$.symbols.length-1];
            });
        }
        ,valid: function(item, n, $) {
            var klass = this, i, j, l, x, s0 = $.symbols[0], s1 = $.symbols[$.symbols.length-1], stack;
            if (!item || (0 > n)) return false;
            if (n === item.length)
            {
                j = 0;
                item = array(2*n, function(i) {
                    if ((j < n) && (i === item[j])) {++j; return s0;}
                    return s1;
                });
            }
            if (2*n !== item.length) return false;
            //item = klass.DUAL(item.slice(), n, $);
            for (stack=0,i=0,l=item.length; i<l; ++i)
            {
                x = item[i];
                if (x === s0)
                {
                    ++stack;
                }
                else if (x === s1)
                {
                    if (0 >= stack) return false;
                    --stack;
                }
                else return false;
            }
            return 0 === stack;
        }
        ,succ: function(item, index, n, $, dir) {
            if ((null == n) || (null == item) || (0 >= n)) return null;
            dir = -1 === dir ? -1 : 1;
            return next_catalan(item, n, dir, $ && (null != $.order) ? $.order : LEX);
        }
        ,rand: function(n, $) {
            var klass = this, seq, prefix, suffix, word, partial_sum, i, s, nn;
            if (0 > n) return null;

            // "Generating binary trees at random", Atkinson & Sack, 1992
            // adapted from https://gist.github.com/rygorous/d57941fa5ae6beb59f17bc30793d3d75
            nn = 2*n;
            seq = shuffle(array(nn, function(i) {return i < n ? 1 : -1;}));
            prefix = [];
            suffix = [];
            word = [];
            partial_sum = 0;
            for (i=0; i<nn; ++i)
            {
                s = seq[i];
                word.push(s)
                partial_sum += s;
                if (0 === partial_sum) // at the end of an irreducible balanced word
                {
                    if (-1 === s)
                    {
                        // it was well-formed! append it.
                        prefix = prefix.concat(word);
                    }
                    else
                    {
                        // it was not well-formed! fix it.
                        prefix.push(1);
                        suffix = [-1].concat(word.slice(1,-1).map(function(x) {return -x;})).concat(suffix);
                    }
                    word = [];
                }
            }

            // convert to FXT format
            return prefix.concat(suffix).map(function(x) {return 0 < x ? $.symbols[0] : $.symbols[$.symbols.length-1];})/*.reduce(function(item, x, i){
                if (0 < x) item.push(i);
                return item;
            }, [])*/;
        }
        // random unranking, another method for unbiased random sampling
        ,randu: CombinatorialIterator.rand
        ,rank: NotImplemented
        ,unrank: NotImplemented
    }
    ,output: function(item) {
        if (null == item) return null;
        var self = this, $ = self.$, n = self.n,
            order = (null != $.order) ? $.order : LEX,
            symbols = $.symbols, is_reflected = REFLECTED & order, j = 0;
        if (n === item.length)
        {
            item = array(2*n, function(i) {
                if ((j < item.length) && (i === item[j])) {++j; return symbols[0];}
                return symbols[symbols.length-1];
            });
        }
        if (is_reflected) item = array(item.length, function(i) {return symbols[0] === item[item.length-1-i] ? symbols[symbols.length-1] : symbols[0];});
        return CombinatorialIterator[PROTO].output.call(self, item);
    }
    ,_update: function() {
        var self = this;
        if (self.__item && (2*self.n === self.__item.length))
        {
            // convert to FXT format
            self.__item = self.__item.reduce(function(item, x, i) {
                if (self.$.symbols[0] === x) item.push(i);
                return item;
            }, []);
        }
        return self;
    }
});
function next_catalan(item, n, dir, order)
{
    var i, j, z, m, t, y, d, nn = n << 1;

    if (n <= 1) return null;
    if (REVERSED & order) dir = -dir;

    // adapted from FXT lib
    if (0 > dir)
    {
        if (COLEX & order)
        {
            j = 0;
            while ((j < n) && (item[j] === j)) ++j;
            if (n <= j)
            {
                item = null;
            }
            else
            {
                if ((0 < j) && (2 === item[j]-item[j-1]))
                {
                    --item[j];
                }
                else
                {
                    i = --item[j]; --j; --i;
                    for (; 0<j && 2*i>j;  --i,--j) item[j] = i;
                    for (; 0<i; --i) item[i] = 2*i;
                    item[0] = 0;
                }
            }
        }
        else
        {
            m = nn;
            j = n-1;
            z = item[j];
            y = 0 < j ? item[j-1] : 1;
            d = z - y;
            for (;;)
            {
                if (1 !== d)
                {
                    if (0 >= j)
                    {
                        item = null;
                        break;
                    }
                    else
                    {
                        item[j] = z - 1;
                        break;
                    }
                }
                m -= 2;
                item[j] = m;
                z = y;
                --j;
                y = 0 < j ? item[j-1] : 1;
                d = z - y;
            }
        }
    }
    else
    {
        if (COLEX & order)
        {
            j = 0;
            if (2 === item[1])
            {
                j = 2;
                while ((j < n) && (item[j] === 2*j)) ++j;
                if (n <= j) item = null;
            }
            if (item)
            {
                while ((j+1 < n) && (1 === (item[j+1]-item[j]))) ++j;
                ++item[j];
                for (i=0; i<j; ++i) item[i] = i;
            }
        }
        else
        {
            j = n-1; z = item[j]; m = nn-2;
            if (z < m)
            {
                item[j] = z+1;
            }
            else
            {
                do {
                    --j; m -= 2;
                } while ((0 <= j) && (m === item[j]));
                if (0 > j)
                {
                    item = null;
                }
                else
                {
                    t = item[j]; i = j;
                    do {
                        item[i++] = ++t;
                    } while (i < n);
                }
            }
        }
    }
    return item;
}
