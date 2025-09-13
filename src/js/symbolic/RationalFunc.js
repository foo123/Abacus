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
        if (is_instance(num, MultiPolynomial))
        {
            ring = ring || num.ring;
            symbol = symbol || num.symbol;
        }
        ring = is_instance(ring, Ring) ? ring : Ring.Q();
        symbol = is_array(symbol) ? symbol : [String(symbol || 'x')];

        if (null == num) num = MultiPolynomial.Zero(symbol, ring);
        else if (!is_instance(num, MultiPolynomial)) num = MultiPolynomial(num, symbol, ring);

        if (null == den) den = MultiPolynomial.One(num.symbol, num.ring);
        else if (!is_instance(den, MultiPolynomial)) den = MultiPolynomial(den, num.symbol, num.ring);

        if (den.equ(Arithmetic.O)) throw new Error('Zero denominator in Abacus.RationalFunc!');
        if (num.equ(Arithmetic.O) && !den.equ(Arithmetic.I)) den = MultiPolynomial.One(num.symbol, num.ring);
        if (den.lc().lt(Arithmetic.O)) {den = den.neg(); num = num.neg();}
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
        autoSimplify: true

        ,hasInverse: function() {
            return true;
        }

        ,Zero: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.Zero(symbol, ring), null, null, null, true);
        }
        ,One: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.One(symbol, ring), null, null, null, true);
        }
        ,MinusOne: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.MinusOne(symbol, ring), null, null, null, true);
        }

        ,cast: null // added below

        ,gcd: function rfgcd(/* args */) {
            // gcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc(MultiPolynomial.gcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }
        ,xgcd: function rfxgcd(/* args */) {
            // xgcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            if (!args.length) return;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return MultiPolynomial.xgcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})).map(function(g, i) {return 0 === i ? RationalFunc(g, denom) : RationalFunc(g);});
        }
        ,lcm: function rflcm(/* args */) {
            // lcm of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc(MultiPolynomial.lcm(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }

        ,fromString: function(s, symbol, ring) {
            return RationalFunc.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            return RationalFunc(MultiPolynomial.fromExpr(e.num, symbol, ring), MultiPolynomial.fromExpr(e.den, symbol, ring));
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_tex: null
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
    ,isConst: function(recur) {
        var self = this;
        return self.num.isConst(recur) && self.den.isConst(recur);
    }
    ,c: function() {
        var self = this;
        return self.num.c().div(self.den.c());
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
        if (is_instance(other, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(other))
            return self.num.equ(self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).equ(self.den.mul(other.num));
        else if (is_string(other))
            return (other === self.toString()) || (other === self.toTex());
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(other))
            return self.num.gt(self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).gt(self.den.mul(other.num));
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(other))
            return self.num.gte(self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).gte(self.den.mul(other.num));
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(other))
            return self.num.lt(self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).lt(self.den.mul(other.num));
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(other))
            return self.num.lte(self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).lte(self.den.mul(other.num));
        return false;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.add(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).add(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.sub(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).sub(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.mul(other), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.num), self.den.mul(other.den));
        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num, self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den), self.den.mul(other.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function(other) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,compose: function(q) {
        var self = this;
        // assume q's are simply multipolynomials, NOT rational functions
        return RationalFunc(self.num.compose(q), self.den.compose(q));
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if (n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 > n) {n = -n; t = num; num = den; den = t;}
        if (0 === n)
            return RationalFunc.One(num.symbol, num.ring);
        else if (1 === n)
            return RationalFunc(num, den, num.symbol, num.ring, self._simpl);
        else
            return RationalFunc(num.pow(n), den.pow(n), num.symbol, num.ring, self._simpl);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return kthroot(self, n);
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
        return RationalFunc(d_num, d_den);
    }
    ,simpl: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, num, den, n, d, g, qr;
        if (!self._simpl)
        {
            if (self.num.equ(Arithmetic.O))
            {
                self.den = MultiPolynomial.One(self.num.symbol, self.num.ring);
            }
            else if (!self.den.equ(Arithmetic.I))
            {
                // here best if we could use multipolynomial gcd if possible
                if ((1 === self.num.symbol.length) && (1 === self.den.symbol.length))
                {
                    qr = MultiPolynomial.gcd(self.num, self.den); // works correctly for univariate case only
                    self.num = self.num.div(qr);
                    self.den = self.den.div(qr);
                }
                else if ((qr=self.num.divmod(self.den)) && qr[1].equ(Arithmetic.O))
                {
                    // num divides den exactly, simplify
                    self.num = qr[0];
                    self.den = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }
                else if ((qr=self.den.divmod(self.num)) && qr[1].equ(Arithmetic.O))
                {
                    // den divides num exactly, simplify
                    self.den = qr[0];
                    self.num = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }

                num = self.num.primitive(true);
                den = self.den.primitive(true);
                if (num[1].equ(den[1]))
                {
                    self.num = num[0];
                    self.den = den[0];
                }
                else
                {
                    if (is_class(num[0].ring.NumberClass, Complex))
                    {
                        if (num[1].isImag() && den[1].isImag())
                        {
                            n = Arithmetic.mul(den[1].imag().den, num[1].imag().num);
                            d = Arithmetic.mul(num[1].imag().den, den[1].imag().num);
                            g = gcd(n, d);
                            self.num = num[0].mul(Arithmetic.div(n, g));
                            self.den = den[0].mul(Arithmetic.div(d, g));
                        }
                        else if (num[1].isReal() && den[1].isReal())
                        {
                            n = Arithmetic.mul(den[1].real().den, num[1].real().num);
                            d = Arithmetic.mul(num[1].real().den, den[1].real().num);
                            g = gcd(n, d);
                            self.num = num[0].mul(Arithmetic.div(n, g));
                            self.den = den[0].mul(Arithmetic.div(d, g));
                        }
                        else
                        {
                            g = Complex.gcd(num[1], den[1]);
                            self.num = num[0].mul(num[1].div(g));
                            self.den = den[0].mul(den[1].div(g));
                        }
                    }
                    else
                    {
                        n = Arithmetic.mul(den[1].den, num[1].num);
                        d = Arithmetic.mul(num[1].den, den[1].num);
                        g = gcd(n, d);
                        self.num = num[0].mul(Arithmetic.div(n, g));
                        self.den = den[0].mul(Arithmetic.div(d, g));
                    }
                }
            }
            self._simpl = true;
        }
        return self;
    }
    ,evaluate: function(x) {
        var self = this;
        return self.num.evaluate(x).div(self.den.evaluate(x));
    }
    ,toExpr: function() {
        var self = this;
        return self.num.toExpr().div(self.den.toExpr());
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I;
        if (null == self._str)
        {
            //self._str = self.toExpr().expand().toString();
            self._str = self.den.equ(I) ? self.num.toString() : ((self.num.isMono() || (self.num.isConst(true) && (self.num.isReal() || self.num.isImag())) ? self.num.toString() : ('(' + self.num.toString() + ')')) + '/' + ((self.den.isMono() && self.den.terms[0].c.equ(I)) || (self.den.isConst(true) && (self.den.isReal() /*|| self.den.isImag()*/)) ? self.den.toString() : ('(' + self.den.toString() + ')')));
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
RationalFunc.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast([RationalFunc], function(a) {
        return is_string(a) ? RationalFunc.fromString(a, symbol, ring) : new RationalFunc(MultiPolynomial(a, symbol, ring));
    });
    return type_cast(a);
};
