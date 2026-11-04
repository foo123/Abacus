// Abacus.Series, represents symbolic formal power series (infinite and finite)
Series = Abacus.Series = Class(Symbolic, {

    constructor: function Series(fn, x) {
        var self = this;
        if (!is_instance(self, Series)) return new Series(fn, x);
        self._fn = fn;
        self._x = is_instance(x, Expr) ? x : (is_string(x) ? Expr(x) : Expr('', 'x'));
        self._data = {};
    }

    ,__static__: {
         hasInverse: function() {
            return true;
        }

        ,Zero: function(x) {
            return new Series(function(nth) {return 0 === nth ? Expr.Zero() : 0;}, x);
        }
        ,One: function(x) {
            return new Series(function(nth) {return 0 === nth ? Expr.One() : 0;}, x);
        }
        ,MinusOne: function(x) {
            return new Series(function(nth) {return 0 === nth ? Expr.MinusOne() : 0;}, x);
        }
        ,Const: function(c, x) {
            return new Series(function(nth) {return 0 === nth ? c : 0;}, x);
        }
        ,Term: function(f_n, n, x) {
            n = n || 0;
            return new Series(function(nth) {return n === nth ? f_n : 0;}, x);
        }
    }

    ,_fn: null
    ,_x: null
    ,__: null
    ,_data: null
    ,_iszero: null
    ,_F: null
    ,_N: 6

    ,dispose: function() {
        var self = this;
        if (self._iszero)
        {
            self._iszero.tested.dispose();
            self._iszero.zero.dispose();
        }
        self._iszero = null;
        if (self._F)
        {
            self._F.dispose();
        }
        self._F = null;
        self._data = null;
        self.__ = null;
        self._x = null;
        self._fn = null;
        return self;
    }

    ,clone: function() {
        var self = this, clone = new Series(self._fn, self._x);
        if (self._iszero) clone._iszero = {tested:self._iszero.tested.clone(), zero:self._iszero.zero.clone()};
        if (self._F) clone._F = F(clone, self._F);
        return clone;
    }

    ,_: function(nth) {
        nth = stdMath.max(0, (+nth) || 0);
        var self = this,
            CACHE = 32,
            in_cache = (nth < CACHE) && self.__ && (null != self.__[nth]),
            fn = self._fn,
            f_nth = in_cache ? self.__[nth] : to_expr(is_callable(fn) ? (fn(nth, self) || 0) : 0);
        if ((nth < CACHE) && !in_cache)
        {
            if (!self.__) self.__ = new Array(CACHE);
            self.__[nth] = f_nth;
        }
        return f_nth;
    }
    ,$: function(nth, kth) {
        var self = this;
        if (null == self._F) self._F = F_(self); // composita
        return self._F(nth, kth);
    }

    ,isZero: function(kth, nth) {
        var self = this;
        kth = stdMath.max(1, kth || 0);
        nth = stdMath.max(kth, nth || 0);
        for (; kth<=nth; ++kth)
        {
            if (kth > 1024)
            {
                if (!self._(kth).equ(0)) return false;
            }
            else
            {
                self._iszero = test_zero(self, self._iszero, kth);
                if (!self._iszero.zero.isset(kth-1)) return false;
            }
        }
        return true;
    }
    ,isPoly: function(degree) {
        degree = stdMath.max(0, (+degree) || 0);
        return this.isZero(degree+1, degree+21); // test up to 20 terms after degree
    }
    ,isSimple: function() {
        var self = this;
        return self.isPoly(0) && self._(0).isSimple();
    }
    ,isSymbol: function() {
        var self = this;
        return self.isPoly(0) && self._(0).isSymbol();
    }
    ,isConst: function(not_exact) {
        var self = this;
        return self.isPoly(0) && self._(0).isConst(not_exact);
    }
    ,isInt: function() {
        var self = this;
        return self.isPoly(0) && self._(0).isInt();
    }
    ,c: function() {
        return this._(0);
    }

    ,neg: function() {
        var self = this;
        return Series(function(nth) {return self._(nth).neg();}, self._x);
    }
    ,inv: function() {
        var self = this, inv_0th = self._(0).inv();
        return Series(function(nth, inv) {
            return 0 === nth ? inv_0th : inv_0th.neg().mul(sum(array(nth, function(ith) {return self._(nth-ith).mul(inv._(ith));})));
        }, self._x);
    }

    ,equ: function(other, up_to_nth) {
        var self = this;
        return is_instance(other, Series) ? (self === other) || (self._fn === other._fn) || self.toExpr().equ(other.toExpr()) : (self.isPoly(0) && self._(0).equ(other));
    }
    ,gt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gt(0) : (self.isPoly(0) && self._(0).gt(other));
    }
    ,gte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).gte(0) : (self.isPoly(0) && self._(0).gte(other));
    }
    ,lt: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lt(0) : (self.isPoly(0) && self._(0).lt(other));
    }
    ,lte: function(other) {
        var self = this;
        return is_instance(other, Series) ? self.sub(other).lte(0) : (self.isPoly(0) && self._(0).lte(other));
    }

    ,add: function(other) {
        var self = this;
        other = to_series(other, self);
        return Series(function(nth) {return self._(nth).add(other._(nth));}, self._x);
    }
    ,sub: function(other) {
        var self = this;
        other = to_series(other, self);
        return Series(function(nth) {return self._(nth).sub(other._(nth));}, self._x);
    }
    ,mul: function(other) {
        var self = this;
        other = to_series(other, self);
        return Series(function(nth) {return sum(array(nth+1, function(ith) {return self._(ith).mul(other._(nth-ith));}));}, self._x);
    }
    ,div: function(other) {
        var self = this;
        return self.mul(to_series(other, self).inv());
    }
    ,divides: function(other) {
        var self = this;
        return !self.isPoly(0) || !self._(0).equ(0);
    }
    ,pow: function(n) {
        return npow(this, stdMath.floor((+n) || 0));
    }

    ,d: function(n) {
        var self = this;
        n = stdMath.floor((+n) || 0);
        return 0 >= n ? self : Series(function(nth) {return self._(nth+n).mul(product(array(n, function(i) {return nth+n-i;})));}, self._x);
    }
    ,compose: function(other) {
        var self = this;
        other = to_series(other, self);
        return Series(function(nth) {
            return 0 === nth ? self._(nth) : sum(array(nth, function(kth) {
                return other.$(nth, kth+1).mul(self._(kth+1));
            }));
        }, other._x);
    }

    ,map: function(f) {
        var self = this;
        return is_callable(f) ? Series(function(nth) {return f(self._(nth), nth);}, self._x) : self;
    }
    ,filter: function(f) {
        var self = this;
        return is_callable(f) ? Series(function(nth) {
            var nth_term = self._(nth);
            return f(nth_term, nth) ? nth_term : Expr.Zero();
        }, self._x) : self;
    }
    ,sum: function(nterms, mode) {
        var self = this, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (nth=0; nth<=stdMath.max(nterms, 10) && terms.length<nterms; ++nth)
        {
            nth_term = self._(nth);
            // skip redundant terms
            if (!nth_term.equ(0)) terms.push(('default' === mode ? nth_term : (nth_term.expand())).mul(0 < nth ? self._x.pow(nth) : 1));
        }
        return terms.length ? Expr('+', terms) : (Expr.Zero());
    }
    ,prod: function(nterms, mode) {
        var self = this, terms = [], nth_term, nth;
        if (null == nterms) nterms = self._N;
        nterms = stdMath.floor(stdMath.max(0, (+nterms) || 0));
        for (nth=0; nth<=stdMath.max(nterms, 10) && terms.length<nterms; ++nth)
        {
            nth_term = self._(nth);
            // skip redundant terms
            /*if (!nth_term.equ(1))*/ terms.push(('default' === mode ? nth_term : (nth_term.expand())).mul(0 < nth ? self._x.pow(nth) : 1));
        }
        return terms.length ? Expr('*', terms) : (Expr.Zero());
    }

    ,toExpr: function() {
        return this.sum(this._N, 'expand');
    }
    ,toString: function(type) {
        var e = this.toExpr();
        return e.toString(type) + (e.ast.arg.length < this._N ? '' : ' + ...');
    }
    ,toTex: function() {
        var e = this.toExpr();
        return e.toTex() + (e.ast.arg.length < this._N ? '' : ' + \\dots');
    }
});

function to_series(x, s)
{
    return is_instance(x, Series) ? x : (to_expr(x).toSeries(s._x));
}
function test_zero(series, store, nth)
{
    if (!store)
    {
        store = {tested:Abacus.BitArray(1024), zero:Abacus.BitArray(1024)};
    }
    if (!store.tested.isset(nth-1))
    {
        store.tested.set(nth-1);
        if (series._(nth).equ(0)) store.zero.set(nth-1);
    }
    return store;
}
function F_(f, F0)
{
    // F is "composita" of f up to N terms, recursively memoized
    // f._(0) necessarily 0
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
                    mem[nth-1][kth-1] = f._(nth);
                }
                else if (nth === kth)
                {
                    mem[nth-1][kth-1] = f._(1).pow(nth);
                }
                else
                {
                    for (sum=Expr.Zero(),ith=1,end=nth-kth+1; ith<=end; ++ith)
                    {
                        sum = sum.add(f._(ith).mul(F(nth-ith, kth-1)));
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
    if (is_instance(f, Expr)) return f.toSeries(null == x ? "x" : x);
    return f;
};
