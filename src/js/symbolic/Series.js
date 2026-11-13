// Abacus.Series, represents symbolic formal univariate or multivariate power series
Series = Abacus.Series = Class(Symbolic, {

    constructor: function Series(fn, x, ring, type) {
        var self = this;
        if (!is_instance(self, Series)) return new Series(fn, x, ring, type);
        self.type = 'product' === String(type || '').toLowerCase() ? 'product' : 'sum';
        self.ring = ring;
        self.$fn = fn;
        if (!is_array(x)) x = [x];
        self.$x = x.map(function(xi, i) {
            var xi0 = is_array(xi) ? xi[1] : null;
            if (null == xi0) xi0 = Expr.Zero();
            if (is_array(xi)) xi = xi[0];
            return [is_instance(xi, Expr) ? xi : Expr('', is_string(xi) ? xi : ('x'+(1 === x.length ? '' : ('_'+String(i+1))))), is_instance(xi0, Expr) ? xi0 : Expr(xi0)];
        });
        self._ = {};
    }

    ,__static__: {
         hasInverse: function() {
            return true;
        }

        ,Zero: function(x, ring, type) {
            var series = new Series(function(nth) {return multi_index_cmp('==', nth, 0) ? Expr.Zero() : null;}, x, ring, type);
            series.degree = 0;
            return series;
        }
        ,One: function(x, ring, type) {
            var series = new Series(function(nth) {return multi_index_cmp('==', nth, 0) ? Expr.One() : null;}, x, ring, type);
            series.degree = 0;
            return series;
        }
        ,MinusOne: function(x, ring, type) {
            var series = new Series(function(nth) {return multi_index_cmp('==', nth, 0) ? Expr.MinusOne() : null;}, x, ring, type);
            series.degree = 0;
            return series;
        }
        ,Const: function(c, x, ring, type) {
            var series = new Series(function(nth) {return multi_index_cmp('==', nth, 0) ? c : null;}, x, ring, type);
            series.degree = 0;
            return series;
        }
        ,Term: function(f_n, n, x, ring, type) {
            var series = new Series(function(nth) {return multi_index_cmp('==', nth, n) ? f_n : null;}, x, ring, type);
            series.degree = multi_index_deg(n);
            return series;
        }
    }

    ,type: 'sum'
    ,ring: null
    ,degree: null
    ,$fn: null
    ,$x: null
    ,_: null
    ,_$: null
    ,_$F: null
    ,_n: null
    ,_i: null
    ,_ci: null
    ,_istrivial: null
    ,_N: 6

    ,dispose: function() {
        var self = this;
        if (self._istrivial)
        {
            self._istrivial.tested.dispose();
            self._istrivial.trivial.dispose();
        }
        if (self._n && (self._n._n === self)) self._n._n = null;
        if (self._i && (self._i._i === self)) self._i._i = null;
        if (self._ci && (self._ci._ci === self)) self._ci._ci = null;
        if (self._$F) self._$F.dispose();
        self._istrivial = null;
        self._ = null;
        self._n = null;
        self._i = null;
        self._ci = null;
        self._$F = null;
        self._$ = null;
        self.$x = null;
        self.$fn = null;
        self.ring = null;
        return self;
    }

    ,clone: function() {
        var self = this, clone = new Series(self.$fn, self.$x, self.ring, self.type);
        clone.degree = self.degree;
        if (self._istrivial) clone._istrivial = {tested:self._istrivial.tested.clone(), trivial:self._istrivial.trivial.clone()};
        if (self._$F) clone._$F = F_(clone, self._$F);
        return clone;
    }

    ,$: function(nth) {
        var self = this;
        nth = is_array(nth) ? nth : multi_index_(nth, self.$x.length);
        if (!multi_index_cmp('>=', nth, 0)) return 'product' === self.type ? (self.ring || Expr).One() : (self.ring || Expr).Zero();
        var Z = 'product' === self.type ? 1 : 0,
            CACHE = 64,
            n = multi_index_deg(nth),
            key = nth.join(','),
            in_cache = (n < CACHE) && self._$ && (null != self._$[key]),
            fn = self.$fn,
            f_nth = in_cache ? self._$[key] : (is_callable(fn) ? fn(nth, self) : null);
        if (null == f_nth) f_nth = Z;
        if (self.ring) self.ring.cast(f_nth);
        else if (!is_instance(f_nth, Expr)) f_nth = to_expr(f_nth);
        if ((n < CACHE) && !in_cache)
        {
            if (!self._$) self._$ = {};
            self._$[key] = f_nth;
        }
        return f_nth;
    }
    ,x: function(nth) {
        var self = this,
            $x = self.$x,
            d = $x.length,
            x = function(i) {
                var x = $x[i][0], x0 = $x[i][1], n = is_number(nth) ? nth : (nth[i]);
                return 1 < n ? x.sub(x0).pow(n) : (1 === n ? x.sub(x0) : Expr.One());
            };
        return is_number(nth) ? x(nth) : (0 < multi_index_deg(nth) ? (1 === d ? x(0) : product(array(d, x))) : Expr.One());
    }
    ,$F: function(nth, kth) {
        var self = this;
        if (null == self._$F) self._$F = F_(self); // composita
        return self._$F(nth, kth);
    }

    ,isTrivial: function(start, end) {
        var self = this, Z = 'product' === self.type ? 1 : 0;
        start = stdMath.max(1, start || 0);
        end = stdMath.min(stdMath.max(start, end || 0), 64);
        for (; start<=end; ++start)
        {
            self._istrivial = test_trivial(self, self._istrivial, start, Z);
            if (!self._istrivial.trivial.isset(start-1)) return false;
        }
        return true;
    }
    ,isDegree: function(degree) {
        degree = stdMath.max(0, (+degree) || 0);
        var self = this;
        if (null != self.degree) return degree >= self.degree;
        return self.isTrivial(degree+1, degree+13); // test up to 12 terms after degree
    }
    ,isConst: function(not_exact) {
        var self = this;
        return self.isDegree(0) && self.c().isConst(not_exact);
    }
    ,isInt: function() {
        var self = this;
        return self.isDegree(0) && self.c().isInt();
    }
    ,c: function() {
        return this.$(0);
    }

    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
            // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
            self._n = Series('product' === self.type
                ? function(nth) {return multi_index_cmp('==', nth, 0) ? self.$(nth).neg() : self.$(nth);}
                : function(nth) {return self.$(nth).neg();},
            self.$x, self.ring, self.type);
            self._n.degree = self.degree;
            self._n._n = self; // idempotent
        }
        return self._n;
    }
    ,inv: function() {
        var self = this, inv_0th = null;
        if (null == self._i)
        {
            // https://en.wikipedia.org/wiki/Formal_power_series#Operations_on_formal_power_series
            // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
            self._i = Series('product' === self.type
            ? function(nth) {
                return self.$(nth).inv(); // must be invertible
            }
            : function(nth, inv) {
                var n = multi_index_deg(nth), d = self.$x.length;
                if (null == inv_0th) inv_0th = self.$(0).inv(); // must be invertible
                if (0 === n) return inv_0th;
                return inv_0th.neg().mul(sum(array(n, function(i) {
                    return sum(multi_index(i, d).list().map(function(ith) {
                        var jth = multi_index_op(subn, nth, ith);
                        return multi_index_cmp('>=', jth, 0) ? self.$(jth).mul(inv.$(ith)) : (self.ring || Expr).Zero();
                    }));
                })));
            }, self.$x, self.ring, self.type);
            if ((null != self.degree) && isFinite(self.degree)) self._i.degree = inf;
            self._i._i = self; // idempotent
        }
        return self._i;
    }
    ,cinv: function() {
        var self = this;
        if (null == self._ci)
        {
            // compositional inverse
            // https://en.wikipedia.org/wiki/Lagrange_inversion_theorem
            // test
            // y_x = Series((nth) => Expr('', 0 === nth[0] ? 0 : 'a_'+String(nth[0])), "x")
            // a_{1}x + a_{2}x^{2} + a_{3}x^{3} + a_{4}x^{4} + a_{5}x^{5} + a_{6}x^{6} + \dots
            // x_y = y_x.cinv().sum(4)
            // \frac{1}{a_{1}}x - \frac{a_{2}}{a_{1}^{3}}x^{2} + \frac{2a_{2}^{2} - a_{1}a_{3}}{a_{1}^{5}}x^{3} - \frac{5a_{2}^{3} - 5a_{1}a_{2}a_{3} + a_{1}^{2}a_{4}}{a_{1}^{7}}x^{4}
            if ((1 === self.$x.length) && self.$([0]).equ(0) && !self.$([1]).equ(0))
            {
                self._ci = Series(function(nth) {
                    var n = nth[0],
                        $ = function(k) {
                            return self.$([k]).mul(factorial(k));
                        },
                        bellP = function(n, k, x) {
                            return BellPoly(n, k).substitute(x.reduce(function($, xi, i) {
                                $['$x_'+String(i)] = xi;
                                return $;
                            }, {}))
                        }
                    ;
                    if (0 === n) return /*$(n)*/0; // must be 0
                    if (1 === n) return $(n).inv(); // must be invertible
                    return sum(array(n-1, function(k) {
                        var xk = array(n-k-1, function(ki) {return $((ki+1)+1).div($(1).mul((ki+1)+1));}),
                            nk = product(array(k+1, function(i) {return n+i;}));
                        return bellP(n-1, k+1, xk).mul(nk).mul((k+1) & 1 ? -1 : 1);
                    })).div($(1).pow(n).mul(factorial(n)));
                }, self.$x, self.ring, 'sum');
                self._ci._ci = 'sum' === self.type ? self : Series(self.$fn, self.$x, self.ring, 'sum'); // idempotent
            }
            else
            {
                self._ci = false;
            }
        }
        return self._ci ? self._ci : null;
    }
    ,compose: function(other) {
        var self = this;
        other = to_series(other, self);
        return 1 === self.$x.length && 1 === other.$x.length ? Series(function(nth) {
            return 0 === nth[0] ? /*self.$(nth)*/0 : sum(array(nth[0], function(kth) {
                return other.$F(nth[0], kth+1).mul(self.$([kth+1]));
            }));
        }, other.$x, other.ring, 'sum') : self;
    }

    ,equ: function(other) {
        var self = this;
        if (!is_instance(other, Series)) return self.isDegree(0) && self.c().equ(other);
        if (
            (self === other)
            || ((self.$fn === other.$fn)
            && ((!self.ring && !other.ring) || (self.ring && other.ring && self.ring.equ(other.ring))))
        ) return true;
        return self.toExpr().equ(other.toExpr());
    }
    ,gt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gt(0) : (self.isDegree(0) && self.c().gt(other));
    }
    ,gte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gte(0) : (self.isDegree(0) && self.c().gte(other));
    }
    ,lt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lt(0) : (self.isDegree(0) && self.c().lt(other));
    }
    ,lte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lte(0) : (self.isDegree(0) && self.c().lte(other));
    }

    ,add: function(other) {
        var self = this, res;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
        other = to_series(other, self);
        res = Series(function(nth) {return self.$(nth).add(other.$(nth));}, self.$x, self.ring, self.type);
        if ((null != self.degree) && (null != other.degree))
        {
            res.degree = stdMath.max(self.degree, other.degree);
        }
        return res;
    }
    ,sub: function(other) {
        var self = this, res;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
        other = to_series(other, self);
        res = Series(function(nth) {return self.$(nth).sub(other.$(nth));}, self.$x, self.ring, self.type);
        if ((null != self.degree) && (null != other.degree))
        {
            res.degree = stdMath.max(self.degree, other.degree);
        }
        return res;
    }
    ,mul: function(other) {
        var self = this, res;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
        other = to_series(other, self);
        res = Series('product' === self.type
        ? function(nth) {
            return self.$(nth).mul(other.$(nth));
        }
        : function(nth) {
            var n = multi_index_deg(nth), d = self.$x.length;
            return sum(array(n+1, function(i) {
                return sum(multi_index(i, d).list().map(function(ith) {
                    var jth = multi_index_op(subn, nth, ith);
                    return multi_index_cmp('>=', jth, 0) ? self.$(ith).mul(other.$(jth)) : (self.ring || Expr).Zero();
                }));
            }));
        },
        self.$x, self.ring, self.type);
        if ((null != self.degree) && (null != other.degree))
        {
            res.degree = 'product' === self.type ? stdMath.max(self.degree, other.degree) : (self.degree+other.degree);
        }
        return res;
    }
    ,div: function(other) {
        var self = this;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        // https://en.wikipedia.org/wiki/Formal_power_series#Power_series_in_several_variables
        return self.mul(to_series(other, self).inv());
    }
    ,divides: function(other) {
        var self = this;
        return !self.isDegree(0) || !self.c().equ(0);
    }
    ,pow: function(m) {
        m = stdMath.floor((+m) || 0);
        var series = this, powseries;
        if ('product' === series.type)
        {
            powseries = Series(function(nth) {return series.$(nth).pow(m);}, series.$x, series.ring, series.type);
            powseries.degree = series.degree;
        }
        else
        {
            //return npow(series, m);
            if (0 > m) {series = series.inv(); m = -m;}
            // https://en.wikipedia.org/wiki/Formal_power_series#Operations_on_formal_power_series
            powseries = 1 === m ? series : Series(function(nth, powseries) {
                var n = multi_index_deg(nth), d = series.$x.length;
                if (0 === n) return series.$(0).pow(m);
                return series.$(0).inv().div(n).mul(sum(array(n, function(k) {
                    return sum(multi_index(k+1, d).list().map(function(kth) {
                        var jth = multi_index_op(subn, nth, kth);
                        return multi_index_cmp('>=', jth, 0) ? series.$(kth).mul(powseries.$(jth)).mul((k+1)*m - n + k+1) : (series.ring || Expr).Zero();
                    }));
                })))
                ;
            }, series.$x, series.ring, series.type);
            if ((series !== powseries) && (null != series.degree))
            {
                powseries.degree = series.degree*m;
            }
        }
        return powseries;
    }

    ,d: function(xi, n) {
        if (null == n) n = 1;
        if (null == xi) xi = 0;
        n = stdMath.max(0, stdMath.floor((+n) || 0));
        xi = stdMath.min(stdMath.max(stdMath.floor((+xi) || 0), 0), this.$x.length-1);
        var f = this,
            df = 0 === n
                ? f
                : Series(function(nth) {
                    return f.$(array(nth.length, function(i) {return nth[i] + (i === xi ? n : 0);})).mul(product(array(n, function(i) {return nth[xi]+n-i;})));
                }, f.$x, f.ring, 'sum')
        ;
        if ((f !== df) && ('sum' === f.type) && (null != f.degree))
        {
            df.degree = stdMath.max(0, f.degree-n);
        }
        return df;
    }

    ,multisection: function(qq, pp) {
        // https://en.wikipedia.org/wiki/Series_multisection
        var self = this, q, p;
        if (null == pp) pp = 0;
        if (null == qq) qq = 1;
        if (is_array(qq))
        {
            p = array(self.$x.length, function(i) {return (+pp[i]) || 0;});
            q = array(self.$x.length, function(i) {return (+qq[i]) || 0;});
        }
        else
        {
            pp = (+pp) || 0;
            qq = (+qq) || 0;
            p = array(self.$x.length, function() {return pp;});
            q = array(self.$x.length, function() {return qq;});
        }
        return Series(function(nth) {
            return self.$(nth.map(function(i, j) {return q[j]*i + p[j];}));
        }, self.$x, self.ring, self.type);
    }
    ,map: function(f) {
        var self = this;
        return is_callable(f) ? Series(function(nth) {return f(self.$(nth), nth, self);}, self.$x, self.ring, self.type) : self;
    }
    ,filter: function(f) {
        var self = this, Z = 'product' === self.type ? (self.ring || Expr).One() : (self.ring || Expr).Zero();
        return is_callable(f) ? Series(function(nth) {
            var nth_term = self.$(nth);
            return f(nth_term, nth, self) ? nth_term : Z;
        }, self.$x, self.ring, self.type) : self;
    }
    ,sum: function(nterms, mode, type) {
        var self = this, n, d = self.$x.length, index, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (n=0; n<=nterms && terms.length<nterms; ++n)
        {
            index = multi_index(n, d);
            while (nth=index())
            {
                nth_term = self.$(nth);
                // skip redundant terms
                if (!nth_term.equ(0)) terms.push(('default' === mode ? nth_term.toExpr() : (is_instance(nth_term, Expr) ? nth_term.expand() : nth_term.toExpr())).mul(self.x(nth)));
            }
        }
        if (!terms.length) terms.push(Expr.Zero());
        return 'array' === type ? terms : (1 < terms.length ? Expr('+', terms) : terms[0]);
    }
    ,prod: function(nterms, mode, type) {
        var self = this, n, d = self.$x.length, index, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (n=0; n<=nterms && terms.length<nterms; ++n)
        {
            index = multi_index(n, d);
            while (nth=index())
            {
                nth_term = self.$(nth);
                // skip redundant terms
                if (!nth_term.equ(1)) terms.push('default' === mode ? nth_term.toExpr() : (is_instance(nth_term, Expr) ? nth_term.expand() : nth_term.toExpr()));
            }
        }
        if (!terms.length) terms.push(Expr.One());
        return 'array' === type ? terms : (1 < terms.length ? Expr('*', terms) : terms[0]);
    }

    ,toExpr: function() {
        var self = this;
        return 'product' === self.type ? self.prod(self._N, 'expand') : self.sum(self._N, 'expand');
    }
    ,toSeries: function() {
        return this; // trivial
    }
    ,toString: function(type) {
        var self = this,
            terms = 'product' === self.type ? self.prod(self._N, 'expand', 'array') : self.sum(self._N, 'expand', 'array'),
            expr = 1 < terms.length ? Expr('product' === self.type ? '*' : '+', terms) : terms[0];
        return expr.toString(type) + (terms.length < self._N ? '' : (('product' === self.type ? ' * ' : ' + ') + '...'));
    }
    ,toTex: function() {
        var self = this,
            terms = 'product' === self.type ? self.prod(self._N, 'expand', 'array') : self.sum(self._N, 'expand', 'array'),
            expr = 1 < terms.length ? Expr('product' === self.type ? '*' : '+', terms) : terms[0];
        return expr.toTex() + (terms.length < self._N ? '' : (('product' === self.type ? ' \\cdot ' : ' + ') + '\\dots'));
    }
});

function to_series(x, s)
{
    return is_instance(x, Series) ? x : (to_expr(x).toSeries(s.$x.map(function(x) {return x[0].symbols()[0]}), s.$x.map(function(x) {return x[1]})));
}
function test_trivial(series, store, n, Z)
{
    if (!store)
    {
        store = {tested:Abacus.BitArray(64), trivial:Abacus.BitArray(64)};
    }
    if (!store.tested.isset(n-1))
    {
        Z = Z || 0;
        store.tested.set(n-1);
        var d = series.$x.length, index = multi_index(n, d), ith, set = true;
        while (ith=index())
        {
            if (!series.$(ith).equ(Z))
            {
                set = false;
                break;
            }
        }
        if (set) store.trivial.set(n-1);
    }
    return store;
}
function F_(f, F0)
{
    // F is "composita" of f up to N terms, recursively memoized
    // https://arxiv.org/abs/1103.2582v2
    // f.$(0) necessarily 0
    var F = function F(nth, kth) {
        if ((1 <= nth) && (nth <= 64) && (1 <= kth) && (kth <= nth))
        {
            var mem = F.mem, sum, ith, end;
            while (mem.length < nth)
            {
                // expand 2x
                mem.push.apply(mem, array(mem.length, function(n) {return array(mem.length+n+1, null);}));
            }
            if (null == mem[nth-1][kth-1])
            {
                if (1 === kth)
                {
                    mem[nth-1][kth-1] = f.$([nth]);
                }
                else if (nth === kth)
                {
                    mem[nth-1][kth-1] = f.$([1]).pow(nth);
                }
                else
                {
                    for (sum=f.$([1]).mul(F(nth-1, kth-1)),ith=2,end=nth-kth+1; ith<=end; ++ith)
                    {
                        sum = sum.add(f.$([ith]).mul(F(nth-ith, kth-1)));
                    }
                    mem[nth-1][kth-1] = sum;
                }
            }
            return mem[nth-1][kth-1];
        }
        return (f.ring || Expr).Zero();
    };
    F.mem = F0 && F0.mem ? F0.mem.map(function(mem_nth) {return mem_nth.slice();}) : array(16, function(n) {return array(n+1, null);});
    F.dispose = function() {
        F.mem = null;
        F.dispose = null;
    };
    return F;
}

// convenience methods
Abacus.PowerSeries = function(f, x, x0) {
    if (!is_array(x)) x = [x];
    if (!is_array(x0)) x0 = [x0];
    if (is_string(f))
    {
        f = Expr(f);
    }
    if (is_instance(f, Series))
    {
        if ((f.type !== 'sum') && (f.$x.length === x.length))
        {
            f = Series(f.$fn, x.map(function(_, i) {return [x[i], x0[i]];}), 'sum');
        }
    }
    else if (is_instance(f, Expr))
    {
        f = f.toSeries(x, x0);
    }
    else if ((null != f) && is_callable(f.toExpr))
    {
        f = f.toExpr().toSeries(x, x0);
    }
    return f;
};
