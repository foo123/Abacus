// Abacus.RationalFunc, represents a rational function/fraction of (multivariate) polynomials
RationalFunc = Abacus.RationalFunc = Class(Symbolic, {
    constructor: function RationalFunc(/*num, den, symbol, ring, simplified*/) {
        var self = this, Arithmetic = Abacus.Arithmetic, args = arguments,
            num, den, symbol, ring, simplified, simplify = RationalFunc.autoSimplify;

        simplified = (4<args.length) && (true===args[4]);
        ring = 3<args.length ? (is_instance(args[3], Ring) ? args[3] : null) : null;
        symbol = 2<args.length ? (is_array(args[2]) ? args[2] : args[2]) : null;
        if (1<args.length)
        {
            num = args[0];
            den = args[1];
        }
        else if (1===args.length)
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
        ring = is_instance(ring, Ring) ? ring : Ring.Q();
        symbol = is_array(symbol) ? symbol : [String(symbol||'x')];

        if (null == num) num = MultiPolynomial.Zero(symbol, ring);
        else if (!is_instance(num, MultiPolynomial)) num = MultiPolynomial(num, symbol, ring);

        if (null == den) den = MultiPolynomial.One(num.symbol, num.ring);
        else if (!is_instance(den, MultiPolynomial)) den = MultiPolynomial(den, num.symbol, num.ring);

        if (den.equ(Arithmetic.O)) throw new Error('Zero denominator in Abacus.RationalFunc!');
        if (num.equ(Arithmetic.O) && !den.equ(Arithmetic.I)) den = MultiPolynomial.One(num.symbol, num.ring);
        if (den.lc().lt(Arithmetic.O)) { den = den.neg(); num = num.neg(); }
        self.num = num;
        self.den = den;

        if (simplified) self._simpl = true;
        else if (simplify) self.simpl();
    }

    ,__static__: {
        autoSimplify: true
        ,Zero: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.Zero(symbol, ring), null, null, null, true);
        }
        ,One: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.One(symbol, ring), null, null, null, true);
        }
        ,MinusOne: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.MinusOne(symbol, ring), null, null, null, true);
        }
        ,hasInverse: function() {
            return true;
        }
        ,cast: null // added below

        ,gcd: rfgcd
        ,xgcd: rfxgcd
        ,lcm: rflcm

        ,fromString: function(s, symbol, ring) {
            var paren = 0, braket = 0, parts = ['', ''], sign = '', is_tex = false,
                i = 0, l, c, j, num, den, space = /\s/;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            s = trim(String(s));
            if (!s.length) return RationalFunc.Zero(symbol, ring);
            if (('-' === s.charAt(0)) || ('+' === s.charAt(0)))
            {
                sign = s.charAt(0);
                s = trim(s.slice(1));
                if (!s.length) return RationalFunc.Zero(symbol, ring);
                sign = '-' === sign ? '-' : '';
            }
            is_tex = ('\\frac' === s.slice(0, 5));
            l = s.length;
            i = is_tex ? 5 : 0;
            j = 0; // parse num
            c = s.charAt(i);
            // skip first braket if tex
            if (is_tex && ('{' === c))
            {
                braket++;
                i++;
            }
            while (i<l)
            {
                c = s.charAt(i++);

                if (space.test(c))
                {
                    // continue
                }
                else if ('/' === c)
                {
                    if (!is_tex && !paren && !braket &&
                        (
                        (parts[j].length && (')' === parts[j].charAt(parts[j].length-1))) ||
                        ((i<l) && ('('===s.charAt(i)))
                       )
                   )
                    {
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else if ('(' === c)
                {
                    paren++;
                    parts[j] += c;
                }
                else if (')' === c)
                {
                    paren--;
                    parts[j] += c;
                    if (!is_tex && !paren && !braket && ((i>=l) || ('/'===s.charAt(i))))
                    {
                        if ((i<l) && ('/'===s.charAt(i))) i++;
                        j = 1; // parse den
                    }
                }
                else if ('{' === c)
                {
                    braket++;
                    parts[j] += c;
                }
                else if ('}' === c)
                {
                    braket--;
                    if (!paren && !braket)
                    {
                        if (is_tex && (i<l) && ('{'===s.charAt(i)))
                        {
                            braket++;
                            i++;
                        }
                        j = 1; // parse den
                    }
                    else
                    {
                        parts[j] += c;
                    }
                }
                else
                {
                    parts[j] += c;
                }
            }
            if (paren || braket)
            {
                num = MultiPolynomial.fromString(parts[0], symbol, ring);
                den = null;
            }
            else
            {
                if (parts[0].length && parts[1].length && ('(' === parts[0].charAt(0)) && (')'===parts[0].charAt(parts[0].length-1)))
                {
                    parts[0] = trim(parts[0].slice(1,-1));
                }
                if (parts[1].length && ('(' === parts[1].charAt(0)) && (')'===parts[1].charAt(parts[1].length-1)))
                {
                    parts[1] = trim(parts[1].slice(1,-1));
                }
                num = MultiPolynomial.fromString(parts[0], symbol, ring);
                den = parts[1].length ? MultiPolynomial.fromString(parts[1], symbol, ring) : null;
            }
            if ('-' === sign) num = num.neg();
            return new RationalFunc(num, den);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            return new RationalFunc(MultiPolynomial.fromExpr(e, symbol, ring));
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
        if (self._n && self===self._n._n)
        {
            self._n._n = null;
        }
        if (self._i && self===self._i._i)
        {
            self._i._i = null;
        }
        if (self._c && self===self._c._c)
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
    ,equ: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x))
            return self.num.equ(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return self.num.mul(x.den).equ(self.den.mul(x.num));
        else if (is_string(x))
            return (x===self.toString()) || (x===self.toTex());
        return false;
    }
    ,gt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x))
            return self.num.gt(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return self.num.mul(x.den).gt(self.den.mul(x.num));
        return false;
    }
    ,gte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x))
            return self.num.gte(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return self.num.mul(x.den).gte(self.den.mul(x.num));
        return false;
    }
    ,lt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x))
            return self.num.lt(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return self.num.mul(x.den).lt(self.den.mul(x.num));
        return false;
    }
    ,lte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly]) || Arithmetic.isNumber(x))
            return self.num.lte(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return self.num.mul(x.den).lte(self.den.mul(x.num));
        return false;
    }

    ,add: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly]))
            return RationalFunc(self.num.add(self.den.mul(x)), self.den);
        else if (is_instance(x, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(x.den).add(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,sub: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly]))
            return RationalFunc(self.num.sub(self.den.mul(x)), self.den);
        else if (is_instance(x, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(x.den).sub(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,mul: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly]))
            return RationalFunc(self.num.mul(x), self.den);
        else if (is_instance(x, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(x.num), self.den.mul(x.den));
        return self;
    }
    ,div: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly]))
            return RationalFunc(self.num, self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(x.den), self.den.mul(x.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function(x) {
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
        if (0 > n) { n = -n; t = num; num = den; den = t; }
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
        while (0<n && !num.equ(Arithmetic.O))
        {
            d_num = num.d(x, 1).mul(den).sub(num.mul(den.d(x, 1)));
            d_den = den.pow(2);
            num = d_num; den = d_den; n--;
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
                    qr = polygcd(self.num, self.den); // works correctly for univariate case only
                    self.num = self.num.div(qr);
                    self.den = self.den.div(qr);
                }
                else if ((qr=self.num.divmod(self.den)) && qr[1].equ(Arithmetic.O))
                {
                    // den divides num exactly, simplify
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
                            g = cgcd(num[1], den[1]);
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
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._str)
            self._str = self.den.equ(Arithmetic.I) ? self.num.toString() : ((self.num.isMono() || (self.num.isConst(true) && (self.num.isReal() || self.num.isImag())) ? self.num.toString() : ('('+self.num.toString()+')'))+'/'+(self.den.isConst(true) && (self.den.isReal()) ? self.den.toString() : ('('+self.den.toString()+')')));
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{'+self.num.toTex()+'}{'+self.den.toTex()+'}');
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.den.equ(Arithmetic.I) ? self.num.toDec(precision) : ('('+self.num.toDec(precision)+')/('+self.den.toDec(precision)+')');
    }
});
RationalFunc.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast([RationalFunc], function(a){
        return is_string(a) ? RationalFunc.fromString(a, symbol, ring) : new RationalFunc(MultiPolynomial(a, symbol, ring));
    });
    return type_cast(a);
};
