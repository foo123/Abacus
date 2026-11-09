// Abacus.Series, represents symbolic formal power series (infinite and finite)
Series = Abacus.Series = Class(Symbolic, {

    constructor: function Series(fn, x, type) {
        var self = this;
        if (!is_instance(self, Series)) return new Series(fn, x, type);
        self.type = 'product' === String(type || '').toLowerCase() ? 'product' : 'sum';
        self.$fn = fn;
        self.$x = is_instance(x, Expr) ? x : (is_string(x) ? Expr(x) : Expr('', 'x'));
        self._ = {};
    }

    ,__static__: {
         hasInverse: function() {
            return true;
        }

        ,Zero: function(x, type) {
            var series = new Series(function(nth) {return 0 === nth ? Expr.Zero() : null;}, x, type);
            series.degree = 0;
            return series;
        }
        ,One: function(x, type) {
            var series = new Series(function(nth) {return 0 === nth ? Expr.One() : null;}, x, type);
            series.degree = 0;
            return series;
        }
        ,MinusOne: function(x, type) {
            var series = new Series(function(nth) {return 0 === nth ? Expr.MinusOne() : null;}, x, type);
            series.degree = 0;
            return series;
        }
        ,Const: function(c, x, type) {
            var series = new Series(function(nth) {return 0 === nth ? c : null;}, x, type);
            series.degree = 0;
            return series;
        }
        ,Term: function(f_n, n, x, type) {
            n = n || 0;
            var series = new Series(function(nth) {return n === nth ? f_n : null;}, x, type);
            series.degree = n;
            return series;
        }
    }

    ,type: 'sum'
    ,degree: null
    ,$fn: null
    ,$x: null
    ,_: null
    ,_$: null
    ,_istrivial: null
    ,_$F: null
    ,_neg: null
    ,_inv: null
    ,_N: 6

    ,dispose: function() {
        var self = this;
        if (self._istrivial)
        {
            self._istrivial.tested.dispose();
            self._istrivial.trivial.dispose();
        }
        if (self._neg && (self._neg._neg === self)) self._neg._neg = null;
        if (self._inv && (self._inv._inv === self)) self._inv._inv = null;
        if (self._$F) self._$F.dispose();
        self._ = null;
        self._istrivial = null;
        self._neg = null;
        self._inv = null;
        self._$F = null;
        self._$ = null;
        self.$x = null;
        self.$fn = null;
        return self;
    }

    ,clone: function() {
        var self = this, clone = new Series(self.$fn, self.$x, self.type);
        clone.degree = self.degree;
        if (self._istrivial) clone._istrivial = {tested:self._istrivial.tested.clone(), trivial:self._istrivial.trivial.clone()};
        if (self._$F) clone._$F = F_(clone, self._$F);
        return clone;
    }

    ,$: function(nth) {
        nth = stdMath.max(0, (+nth) || 0);
        var self = this,
            Z = 'product' === self.type ? 1 : 0,
            CACHE = 32,
            in_cache = (nth < CACHE) && self._$ && (null != self._$[nth]),
            fn = self.$fn,
            f_nth = in_cache ? self._$[nth] : (is_callable(fn) ? fn(nth, self) : null);
        if (null == f_nth) f_nth = Z;
        if (!is_instance(f_nth, Expr)) f_nth = to_expr(f_nth);
        if ((nth < CACHE) && !in_cache)
        {
            if (!self._$) self._$ = new Array(CACHE);
            self._$[nth] = f_nth;
        }
        return f_nth;
    }
    ,$F: function(nth, kth) {
        var self = this;
        if (null == self._$F) self._$F = F_(self); // composita
        return self._$F(nth, kth);
    }

    ,isTrivial: function(kth, nth) {
        var self = this, Z = 'product' === self.type ? 1 : 0;
        kth = stdMath.max(1, kth || 0);
        nth = stdMath.max(kth, nth || 0);
        if (null != self.degree) return kth > self.degree;
        for (; kth<=nth; ++kth)
        {
            if (kth > 1024)
            {
                if (!self.$(kth).equ(Z)) return false;
            }
            else
            {
                self._istrivial = test_trivial(self, self._istrivial, kth, Z);
                if (!self._istrivial.trivial.isset(kth-1)) return false;
            }
        }
        return true;
    }
    ,isDegree: function(degree) {
        degree = stdMath.max(0, (+degree) || 0);
        return this.isTrivial(degree+1, degree+13); // test up to 12 terms after degree
    }
    ,isSimple: function() {
        var self = this;
        return self.isDegree(0) && self.$(0).isSimple();
    }
    ,isSymbol: function() {
        var self = this;
        return self.isDegree(0) && self.$(0).isSymbol();
    }
    ,isConst: function(not_exact) {
        var self = this;
        return self.isDegree(0) && self.$(0).isConst(not_exact);
    }
    ,isInt: function() {
        var self = this;
        return self.isDegree(0) && self.$(0).isInt();
    }
    ,c: function() {
        return this.$(0);
    }

    ,neg: function() {
        var self = this;
        if (null == self._neg)
        {
            // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
            self._neg = Series('product' === self.type
                ? function(nth) {return 0 === nth ? self.$(nth).neg() : self.$(nth);}
                : function(nth) {return self.$(nth).neg();},
            self.$x, self.type);
            self._neg._neg = self; // idempotent
        }
        return self._neg;
    }
    ,inv: function() {
        var self = this;
        if (null == self._inv)
        {
            // https://en.wikipedia.org/wiki/Formal_power_series#Operations_on_formal_power_series
            self._inv = Series('product' === self.type
            ? function(nth) {
                return self.$(nth).inv();
            }
            : function(nth, inv) {
                return 0 === nth ? self.$(0).inv() : self.$(0).inv().neg().mul(sum(array(nth, function(ith) {return self.$(nth-ith).mul(inv.$(ith));})));
            }, self.$x, self.type);
            self._inv._inv = self; // idempotent
        }
        return self._inv;
    }

    ,equ: function(other, up_to_nth) {
        var self = this;
        return is_instance(other, Series) ? (self === other) || (self.$fn === other.$fn) || self.toExpr().equ(other.toExpr()) : (self.isDegree(0) && self.$(0).equ(other));
    }
    ,gt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gt(0) : (self.isDegree(0) && self.$(0).gt(other));
    }
    ,gte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gte(0) : (self.isDegree(0) && self.$(0).gte(other));
    }
    ,lt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lt(0) : (self.isDegree(0) && self.$(0).lt(other));
    }
    ,lte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lte(0) : (self.isDegree(0) && self.$(0).lte(other));
    }

    ,add: function(other) {
        var self = this;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        other = to_series(other, self);
        return Series(function(nth) {return self.$(nth).add(other.$(nth));}, self.$x, self.type);
    }
    ,sub: function(other) {
        var self = this;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        other = to_series(other, self);
        return Series(function(nth) {return self.$(nth).sub(other.$(nth));}, self.$x, self.type);
    }
    ,mul: function(other) {
        var self = this;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        other = to_series(other, self);
        return Series('product' === self.type
        ? function(nth) {return self.$(nth).mul(other.$(nth));}
        : function(nth) {return sum(array(nth+1, function(ith) {return self.$(ith).mul(other.$(nth-ith));}));},
        self.$x, self.type);
    }
    ,div: function(other) {
        var self = this;
        // https://en.wikipedia.org/wiki/Formal_power_series#The_ring_of_formal_power_series
        return self.mul(to_series(other, self).inv());
    }
    ,divides: function(other) {
        var self = this;
        return !self.isDegree(0) || !self.$(0).equ(0);
    }
    ,pow: function(n) {
        var series = this;
        n = stdMath.floor((+n) || 0);
        if ('product' === series.type) return Series(function(nth) {return series.$(nth).pow(n);}, series.$x, series.type);
        //return npow(series, n);
        if (0 > n) {series = series.inv(); n = -n;}
        if (1 === n) return series;
        // https://en.wikipedia.org/wiki/Formal_power_series#Operations_on_formal_power_series
        return Series(function(nth, pseries) {
            return 0 === nth
                ? series.$(0).pow(n)
                : series.$(0).inv().div(nth).mul(sum(array(nth, function(kth) {return series.$(kth+1).mul(pseries.$(nth-kth-1)).mul((kth+1)*n - nth + kth+1);})))
            ;
        }, series.$x, series.type);
    }

    ,d: function(n) {
        var self = this;
        n = stdMath.floor((+n) || 0);
        return 0 >= n ? self : Series(function(nth) {return self.$(nth+n).mul(product(array(n, function(i) {return nth+n-i;})));}, self.$x, 'sum');
    }
    ,compose: function(other) {
        var self = this;
        other = to_series(other, self);
        return Series(function(nth) {
            return 0 === nth ? self.$(nth) : sum(array(nth, function(kth) {
                return other.$F(nth, kth+1).mul(self.$(kth+1));
            }));
        }, other.$x, 'sum');
    }

    ,map: function(f) {
        var self = this;
        return is_callable(f) ? Series(function(nth) {return f(self.$(nth), nth, self);}, self.$x, self.type) : self;
    }
    ,filter: function(f) {
        var self = this, Z = 'product' === self.type ? Expr.One() : Expr.Zero();
        return is_callable(f) ? Series(function(nth) {
            var nth_term = self.$(nth);
            return f(nth_term, nth, self) ? nth_term : Z;
        }, self.$x, self.type) : self;
    }
    ,sum: function(nterms, mode) {
        var self = this, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (nth=0; nth<=stdMath.max(nterms, 10) && terms.length<nterms; ++nth)
        {
            nth_term = self.$(nth);
            // skip redundant terms
            if (!nth_term.equ(0)) terms.push(('default' === mode ? nth_term : (nth_term.expand())).mul(0 < nth ? self.$x.pow(nth) : 1));
        }
        if (!terms.length) terms.push(Expr.Zero());
        return Expr('+', terms);
    }
    ,prod: function(nterms, mode) {
        var self = this, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (nth=0; nth<=stdMath.max(nterms, 10) && terms.length<nterms; ++nth)
        {
            nth_term = self.$(nth);
            // skip redundant terms
            if (!nth_term.equ(1)) terms.push('default' === mode ? nth_term : (nth_term.expand()));
        }
        if (!terms.length) terms.push(Expr.One());
        return Expr('*', terms);
    }

    ,toExpr: function() {
        var self = this;
        return 'product' === self.type ? self.prod(self._N, 'expand') : self.sum(self._N, 'expand');
    }
    ,toString: function(type) {
        var self = this, e = self.toExpr();
        return e.toString(type) + (e.ast.arg.length < self._N ? '' : (('product' === self.type ? ' * ' : ' + ') + '...'));
    }
    ,toTex: function() {
        var self = this, e = self.toExpr();
        return e.toTex() + (e.ast.arg.length < self._N ? '' : (('product' === self.type ? ' \\cdot ' : ' + ') + '\\dots'));
    }
});

function to_series(x, s)
{
    return is_instance(x, Series) ? x : (to_expr(x).toSeries(s.$x));
}
function test_trivial(series, store, nth, Z)
{
    if (!store)
    {
        store = {tested:Abacus.BitArray(1024), trivial:Abacus.BitArray(1024)};
    }
    if (!store.tested.isset(nth-1))
    {
        store.tested.set(nth-1);
        if (series.$(nth).equ(Z || 0)) store.trivial.set(nth-1);
    }
    return store;
}
function F_(f, F0)
{
    // F is "composita" of f up to N terms, recursively memoized
    // f.$(0) necessarily 0
    var F = function F(nth, kth) {
        if ((1 <= nth) && (nth <= 128) && (1 <= kth) && (kth <= nth))
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
                    mem[nth-1][kth-1] = f.$(nth);
                }
                else if (nth === kth)
                {
                    mem[nth-1][kth-1] = f.$(1).pow(nth);
                }
                else
                {
                    for (sum=Expr.Zero(),ith=1,end=nth-kth+1; ith<=end; ++ith)
                    {
                        sum = sum.add(f.$(ith).mul(F(nth-ith, kth-1)));
                    }
                    mem[nth-1][kth-1] = sum;
                }
            }
            return mem[nth-1][kth-1];
        }
        return Expr.Zero();
    };
    F.mem = F0 && F0.mem ? F0.mem.map(function(mem_nth) {return mem_nth.slice();}) : array(16, function(n) {return array(n+1, null);});
    F.dispose = function() {
        F.mem = null;
        F.dispose = null;
    };
    return F;
}

// convenience methods
Abacus.PowerSeries = function(f, x) {
    if (is_string(f)) f = Expr(f);
    if (is_instance(f, Expr)) f = f.toSeries(null == x ? "x" : x);
    else if ((null != f) && is_callable(f.toExpr)) f = f.toExpr().toSeries(null == x ? "x" : x);
    return f;
};
