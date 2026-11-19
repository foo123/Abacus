// Abacus.RationalFunc, represents a rational function/fraction of (multivariate) polynomials
RationalFunc = Abacus.RationalFunc = Class(Symbolic, {

    constructor: function RationalFunc(/*num, den, symbol, ring, simplified*/) {
        var self = this, Arithmetic = Abacus.Arithmetic, args = arguments,
            num, den, symbol, ring, simplified, simplify = RationalFunc.autoSimplify;

        simplified = (4 < args.length) && (true === args[4]);
        ring = 3 < args.length ? (is_instance(args[3], Ring) ? args[3] : null) : null;
        symbol = 2 < args.length ? (is_array(args[2]) ? args[2] : args[2]) : null;
        if (1 < args.length)
        {
            num = args[0];
            den = args[1];
        }
        else if (1 === args.length)
        {
            num = args[0];
            den = null;
        }
        else
        {
            num = null;
            den = null;
        }

        if (!is_instance(self, RationalFunc)) return new RationalFunc(num, den, symbol, ring, simplified);

        if (is_instance(num, RationalFunc))
        {
            simplified = num._simpl;
            ring = num.ring;
            symbol = num.symbol;
            den = num.den;
            num = num.num;
        }
        else if (is_instance(num, Polynomial))
        {
            ring = ring || num.ring;
            symbol = symbol || [num.symbol];
        }
        if (is_instance(num, [MultiPolynomial, MultiPolynomialMod]))
        {
            ring = ring || num.ring;
            symbol = symbol || num.symbol;
        }
        ring = is_instance(ring, Ring) ? ring : Ring.Q();
        symbol = is_array(symbol) ? symbol : [String(symbol || 'x')];

        if (null == num) num = MultiPolynomial.Zero(symbol, ring);
        else if (!is_instance(num, [MultiPolynomial, MultiPolynomialMod])) num = MultiPolynomial(num, symbol, ring);

        if (null == den) den = MultiPolynomial.One(num.symbol, num.ring);
        else if (!is_instance(den, [MultiPolynomial, MultiPolynomialMod])) den = MultiPolynomial(den, num.symbol, num.ring);

        if (is_instance(num, MultiPolynomialMod))
        {
            if (!is_instance(den, MultiPolynomialMod))
            {
                den = MultiPolynomialMod(poly_mod(den, num.m), num.m);
            }
        }
        if (is_instance(den, MultiPolynomialMod))
        {
            if (!is_instance(num, MultiPolynomialMod))
            {
                num = MultiPolynomialMod(poly_mod(num, den.m), den.m);
            }
        }
        if (den.equ(Arithmetic.O)) throw new Error('Zero denominator in Abacus.RationalFunc!');
        if (num.equ(Arithmetic.O) && !den.equ(Arithmetic.I)) den = den[CLASS].One(num.symbol, num.ring, num.m);
        if (den.lc().lt(Arithmetic.O)) {den = den.neg(); num = num.neg();}
        if (den.order() !== num.order()) den = den.order(num.order());
        self.num = num;
        self.den = den;

        if (simplified) self._simpl = true;
        else if (simplify) self.simpl();

        def(self, 'symbol', {
            get: function() {
                return self.num ? self.num.symbol : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'ring', {
            get: function() {
                return self.num ? self.num.ring : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        __MAXGCD__: 3 // gets slow if many variables
        ,autoSimplify: true

        ,hasInverse: function() {
            return true;
        }

        ,Zero: function(symbol, ring, modulo) {
            return new RationalFunc(modulo ? MultiPolynomialMod.Zero(symbol, ring, modulo) : MultiPolynomial.Zero(symbol, ring), null, null, null, true);
        }
        ,One: function(symbol, ring, modulo) {
            return new RationalFunc(modulo ? MultiPolynomialMod.One(symbol, ring, modulo) : MultiPolynomial.One(symbol, ring), null, null, null, true);
        }
        ,MinusOne: function(symbol, ring, modulo) {
            return new RationalFunc(modulo ? MultiPolynomialMod.MinusOne(symbol, ring, modulo) : MultiPolynomial.MinusOne(symbol, ring), null, null, null, true);
        }
        ,Const: function(c, symbol, ring, modulo) {
            c = c || Abacus.Arithmetic.O;
            var n = null, d = null;
            if (is_instance(c, [Rational, Fractional, RationalFunc]))
            {
                n = c.num;
                d = c.den;
            }
            else if (is_instance(c, Complex))
            {
                if (c.isReal())
                {
                    c = c.real();
                    n = c.num;
                    d = c.den;
                }
                else if (c.isImag())
                {
                    c = c.imag();
                    n = Complex(0, c.num);
                    d = Complex(c.den, 0);
                }
            }
            return null != d ? new RationalFunc(modulo ? MultiPolynomialMod.Const(n, symbol, ring, modulo) : MultiPolynomial.Const(n, symbol, ring), modulo ? MultiPolynomialMod.Const(d, symbol, ring, modulo) : MultiPolynomial.Const(d, symbol, ring)) : new RationalFunc(modulo ? MultiPolynomialMod.Const(c, symbol, ring, modulo) : MultiPolynomial.Const(c, symbol, ring), null, null, null, true);
        }

        ,cast: null // added below

        ,gcd: function rfgcd(/* args */) {
            // gcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc((args[0] ? args[0].num[CLASS] : MultiPolynomial).gcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }
        ,xgcd: function rfxgcd(/* args */) {
            // xgcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            if (!args.length) return;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return (args[0] ? args[0].num[CLASS] : MultiPolynomial).xgcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})).map(function(g, i) {return 0 === i ? RationalFunc(g, denom) : RationalFunc(g);});
        }
        ,lcm: function rflcm(/* args */) {
            // lcm of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc((args[0] ? args[0].num[CLASS] : MultiPolynomial).lcm(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }

        ,fromString: function(s, symbol, ring, modulo) {
            return RationalFunc.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring, modulo);
        }
        ,fromExpr: function(e, symbol, ring, modulo) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            return new RationalFunc(modulo ? MultiPolynomialMod.fromExpr(e.num, symbol, ring, modulo) : MultiPolynomial.fromExpr(e.num, symbol, ring), modulo ? MultiPolynomialMod.fromExpr(e.den, symbol, ring, modulo) : MultiPolynomial.fromExpr(e.den, symbol, ring));
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_expr: null
    ,_simpl: false

    ,dispose: function() {
        var self = this;
        if (self._n && (self === self._n._n))
        {
            self._n._n = null;
        }
        if (self._i && (self === self._i._i))
        {
            self._i._i = null;
        }
        if (self._c && (self === self._c._c))
        {
            self._c._c = null;
        }
        self.num = null;
        self.den = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._expr = null;
        return self;
    }
    ,isInt: function() {
        var self = this;
        return self.num.isInt() && self.den.equ(Abacus.Arithmetic.I);
    }
    ,isReal: function() {
        var self = this;
        return (self.num.isReal() && self.den.isReal()) || (self.num.isImag() && self.den.isImag());
    }
    ,isImag: function() {
        var self = this;
        return (self.num.isReal() && self.den.isImag()) || (self.num.isImag() && self.den.isReal());
    }
    ,isMono: function() {
        var self = this;
        return self.num.isMono() && self.den.isConst();
    }
    ,isConst: function() {
        var self = this;
        return self.num.isConst() && self.den.isConst();
    }
    ,c: function() {
        var self = this;
        return self.num.c().div(self.den.c());
    }
    ,order: function(order) {
        var self = this;
        if (!arguments.length)
        {
            return self.num.order();
        }
        else
        {
            return RationalFunc(self.num.order(order), self.den.order(order), null, null, self._simpl);
        }
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = RationalFunc(self.num.neg(), self.den, null, null, self._simpl);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function() {
        var self = this;
        if (null == self._i)
        {
            self._i = RationalFunc(self.den, self.num, null, null, self._simpl);
            self._i._i = self;
        }
        return self._i;
    }
    ,real: function() {
        var self = this;
        return RationalFunc(self.num.real(), self.den.real());
    }
    ,imag: function() {
        var self = this;
        return RationalFunc(self.num.imag(), self.den.imag());
    }
    ,abs: function() {
        var self = this;
        return RationalFunc(self.num.abs(), self.den, null, null, self._simpl);
    }
    ,conj: function() {
        var self = this;
        if (null == self._c)
        {
            self._c = RationalFunc(self.num.conj(), self.den.conj());
            self._c._c = self;
        }
        return self._c;
    }
    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.equ(self.den.mul(other));
        if (is_instance(other, [Rational, Fractional]))
            return self.num.mul(other.den).equ(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Poly))
            return self.num.equ(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).equ(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().equ(other);
        if (is_string(other))
            return (other === self.toString()) || (other === self.toTex());
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.gt(self.den.mul(other));
        if (is_instance(other, [Rational, Fractional]))
            return self.num.mul(other.den).gt(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Poly))
            return self.num.gt(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).gt(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().gt(other);
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.gte(self.den.mul(other));
        if (is_instance(other, [Rational, Fractional]))
            return self.num.mul(other.den).gte(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Poly))
            return self.num.gte(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).gte(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().gte(other);
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.lt(self.den.mul(other));
        if (is_instance(other, [Rational, Fractional]))
            return self.num.mul(other.den).lt(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Poly))
            return self.num.lt(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).lt(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().lt(other);
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.lte(self.den.mul(other));
        if (is_instance(other, [Rational, Fractional]))
            return self.num.mul(other.den).lte(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Poly))
            return self.num.lte(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).lte(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().lte(other);
        return false;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().add(other);
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.add(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, Fractional, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).add(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().sub(other);
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.sub(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, Fractional, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).sub(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().mul(other);
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.mul(other), self.den);
        else if (is_instance(other, [Rational, Fractional, RationalFunc]))
            return RationalFunc(self.num.mul(other.num), self.den.mul(other.den));
        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().div(other);
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring, self.num.m);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num, self.den.mul(other));
        else if (is_instance(other, [Rational, Fractional, RationalFunc]))
            return RationalFunc(self.num.mul(other.den), self.den.mul(other.num));
        return self;
    }
    ,mod: function(other) {
        var self = this;
        if (is_instance(other, Expr))
        {
            return Expr('mod()', [self.toExpr(), other]);
        }
        return RationaFunc(self.num.mod(other), self.den.mod(other));
    }
    ,divmod: function(other) {
        var self = this,
            qr1 = self.num.divmod(other),
            qr2 = self.den.divmod(other);
        return [RationaFunc(qr1[0], qr2[0]), RationaFunc(qr1[1], qr2[1])];
    }
    ,divides: function(other) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,substitute: function(v, xi) {
        var self = this;
        return RationalFunc(self.num.substitute(v, xi), self.den.substitute(v, xi));
    }
    ,compose: function(q) {
        // assume q's are simply multipolynomials, NOT rational functions
        var self = this;
        return RationalFunc(self.num.compose(q), self.den.compose(q));
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if (n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 > n) {n = -n; t = num; num = den; den = t;}
        if (0 === n)
            return RationalFunc.One(num.symbol, num.ring, num.m);
        else if (1 === n)
            return RationalFunc(num, den, num.symbol, num.ring, self._simpl);
        else
            return RationalFunc(num.pow(n), den.pow(n), num.symbol, num.ring, self._simpl);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return RationalFunc(self.num.rad(n), self.den.rad(n));
    }
    ,shift: function(x, s) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, Arithmetic = Abacus.Arithmetic;
        x = String(x || self.num.symbol[0]); s = s || 0;
        s = Arithmetic.val(s);
        if (0 === s) return self;
        return 0 > s ? RationalFunc(self.num, self.den.shift(x, -s)) : RationalFunc(self.num.shift(x, s), self.den);
    }
    ,d: function(x, n) {
        // partial rational (formal) derivative of nth order with respect to symbol x
        var self = this, num, den, d_num, d_den, Arithmetic = Abacus.Arithmetic;
        if (self.isConst()) return RationalFunc.Zero(self.symbol, self.ring, self.num.m);
        x = String(x || self.num.symbol[0]);
        if (null == n) n = 1;
        n = Arithmetic.val(n);
        if (0 > n) return null; // not supported
        else if (0 === n) return self;
        num = self.num; den = self.den;
        while ((0 < n) && !num.equ(Arithmetic.O))
        {
            d_num = num.d(x, 1).mul(den).sub(num.mul(den.d(x, 1)));
            d_den = den.pow(2);
            num = d_num; den = d_den; --n;
        }
        return RationalFunc(num, den);
    }
    ,simpl: function() {
        var self = this;
        if (!self._simpl)
        {
            /*self =*/ simplify_rf(self, self.num.symbol.length <= RationalFunc.__MAXGCD__);
            self._simpl = true;
        }
        return self;
    }
    ,multivariate: function(x) {
        var p = this, ring = p.ring;
        // unmake recursive univariate, make multivariate again on x
        if (1 < x.length)
        {
            while (ring.PolynomialSymbol)
            {
                if (is_array(ring.PolynomialSymbol))
                {
                    if (ring.PolynomialSymbol.filter(function(xi) {return -1 === x.indexOf(xi);}).length)
                    {
                        break;
                    }
                }
                else
                {
                    if (-1 === x.indexOf(ring.PolynomialSymbol))
                    {
                        break;
                    }
                }
                ring = ring.CoefficientRing;
            }
            p = p.toExpr().toRationalFunc(x, ring);
        }
        return p;
    }
    ,evaluate: function(x) {
        var self = this;
        return self.num.evaluate(x).div(self.den.evaluate(x));
    }
    ,toExpr: function() {
        var self = this;
        if (null == self._expr)
        {
            self._expr = self.num.toExpr().div(self.den.toExpr());
        }
        return self._expr;
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I;
        if (null == self._str)
        {
            //self._str = self.toExpr().expand().toString();
            self._str = self.den.equ(I) ? self.num.toString() : ((self.num.isMono() || (self.num.isConst() && (self.num.isReal() || self.num.isImag())) ? self.num.toString() : ('(' + self.num.toString() + ')')) + '/' + ((self.den.isMono() && self.den.terms[0].c.equ(I)) || (self.den.isConst() && (self.den.isReal() /*|| self.den.isImag()*/)) ? self.den.toString() : ('(' + self.den.toString() + ')')));
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
        {
            //self._tex = self.toExpr().expand().toTex();
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{' + self.num.toTex() + '}{' + self.den.toTex() + '}');
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.den.equ(Arithmetic.I) ? self.num.toDec(precision) : ('(' + self.num.toDec(precision) + ')/(' + self.den.toDec(precision) + ')');
    }
});
RationalFunc.cast = function(a, symbol, ring, modulo) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast(function(a) {
        return is_instance(a, RationalFunc) && is_same_symbol(symbol, a.symbol) && ((!modulo) || modulo_match(modulo, a.num.m)) && ring.equ(a.ring);
    }, function(a) {
        return is_string(a) ? RationalFunc.fromString(a, symbol, ring, modulo) : (is_instance(a, RationalFunc) ? new RationalFunc(modulo ? MultiPolynomialMod.cast(a.num, symbol, ring, modulo) : MultiPolynomial.cast(a.num, symbol, ring), modulo ? MultiPolynomialMod.cast(a.den, symbol, ring, modulo) : MultiPolynomial.cast(a.den, symbol, ring)) : new RationalFunc(modulo ? MultiPolynomialMod.cast(a, symbol, ring, modulo) : MultiPolynomial.cast(a, symbol, ring)));
    });
    return type_cast(a);
};

function simplify_rf(rf, use_gcd)
{
    var Arithmetic = Abacus.Arithmetic, num, den, n, d, g, qr;
    if (rf.num.equ(Arithmetic.O))
    {
        rf.den = rf.num[CLASS].One(rf.num.symbol, rf.num.ring, rf.num.m);
    }
    else if (!rf.den.equ(Arithmetic.I))
    {
        if ((qr=rf.num.divmod(rf.den)) && qr[1].equ(Arithmetic.O))
        {
            // num divides den exactly, simplify
            rf.num = qr[0];
            rf.den = rf.num[CLASS].One(rf.num.symbol, rf.num.ring, rf.num.m);
        }
        else if ((qr=rf.den.divmod(rf.num)) && qr[1].equ(Arithmetic.O))
        {
            // den divides num exactly, simplify
            rf.den = qr[0];
            rf.num = rf.num[CLASS].One(rf.num.symbol, rf.num.ring, rf.num.m);
        }
        else if (true === use_gcd)
        {
            // use multipolynomial gcd if possible but can become slow
            qr = MultiPolynomial.gcd(rf.num.p || rf.num, rf.den.p || rf.den);
            rf.num = rf.num.div(qr, false, true);
            rf.den = rf.den.div(qr, false, true);
        }

        num = rf.num.primitive(true);
        den = rf.den.primitive(true);
        if (num[1].equ(den[1]))
        {
            rf.num = num[0];
            rf.den = den[0];
        }
        else
        {
            if (is_instance(num[1], [RationalFunc, Poly]))
            {
                n = den[1].den.mul(num[1].num);
                d = num[1].den.mul(den[1].num);
                g = n[CLASS].gcd(n, d);
                rf.num = num[0].mul(n.div(g, false, true));
                rf.den = den[0].mul(d.div(g, false, true));
            }
            else if (is_class(num[0].ring.NumberClass, Complex))
            {
                if (num[1].isImag() && den[1].isImag())
                {
                    n = Arithmetic.mul(den[1].imag().den, num[1].imag().num);
                    d = Arithmetic.mul(num[1].imag().den, den[1].imag().num);
                    g = gcd(n, d);
                    rf.num = num[0].mul(Arithmetic.div(n, g));
                    rf.den = den[0].mul(Arithmetic.div(d, g));
                }
                else if (num[1].isReal() && den[1].isReal())
                {
                    n = Arithmetic.mul(den[1].real().den, num[1].real().num);
                    d = Arithmetic.mul(num[1].real().den, den[1].real().num);
                    g = gcd(n, d);
                    rf.num = num[0].mul(Arithmetic.div(n, g));
                    rf.den = den[0].mul(Arithmetic.div(d, g));
                }
                else
                {
                    g = Complex.gcd(num[1], den[1]);
                    rf.num = num[0].mul(num[1].div(g));
                    rf.den = den[0].mul(den[1].div(g));
                }
            }
            else
            {
                n = Arithmetic.mul(den[1].den, num[1].num);
                d = Arithmetic.mul(num[1].den, den[1].num);
                g = gcd(n, d);
                rf.num = num[0].mul(Arithmetic.div(n, g));
                rf.den = den[0].mul(Arithmetic.div(d, g));
            }
        }
    }
    return rf;
}
