// Abacus.Complex represents a complex number with Rational parts
Complex = Abacus.Complex = Class(Numeric, {

    constructor: function Complex(/*real, imag*/) {
        var self = this, args = arguments, real, imag;

        if (args.length && (is_array(args[0]) || is_args(args[0]))) args = args[0];

        if (1 < args.length)
        {
            real = args[0]; imag = args[1];
        }
        else if (1 === args.length)
        {
            real = args[0]; imag = Rational.Zero();
        }
        else
        {
            real = Rational.Zero(); imag = Rational.Zero();
        }

        if (is_instance(real, Symbolic)) real = real.c();
        if (is_instance(imag, Symbolic)) imag = imag.c();

        if (is_instance(real, Complex))
        {
            imag = real.imag();
            real = real.real();
        }

        if (!is_instance(self, Complex)) return new Complex(real, imag);

        self.re = is_instance(real, Rational) ? real : Rational.cast(real);
        self.im = is_instance(imag, Rational) ? imag : Rational.cast(imag);

        def(self, 'num', {
            get: function() {
                return self;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'den', {
            get: function() {
                return Complex.One();
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        Symbol: 'i'

        ,hasInverse: function() {
            return true;
        }

        ,Zero: function() {
            return new Complex(Rational.Zero(), Rational.Zero());
        }
        ,One: function() {
            return new Complex(Rational.One(), Rational.Zero());
        }
        ,MinusOne: function() {
            return new Complex(Rational.MinusOne(), Rational.Zero());
        }
        ,Img: function() {
            return new Complex(Rational.Zero(), Rational.One());
        }
        ,MinusImg: function() {
            return new Complex(Rational.Zero(), Rational.MinusOne());
        }

        ,cast: null // added below

        ,gcd: function cgcd(/* args */) {
            // Generalization of Euclid GCD Algorithm for complex numbers
            // https://en.wikipedia.org/wiki/Euclidean_algorithm
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                c = args.length, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, a0, b0, a, b, t, r, i;

            if (0 === c) return Complex.Zero();

            i = 0;
            while (i < c && (a=args[i++]).equ(O)) ;
            while (i < c)
            {
                while (i < c && (b=args[i++]).equ(O)) ;
                if (b.equ(a)) continue;
                else if (b.equ(O)) break;
                // swap them (a >= b)
                if (b.norm().gt(a.norm())) {t = b; b = a; a = t;}
                while (!b.equ(O))
                {
                    //a0 = a; b0 = b;
                    r = a.mod(b); a = b; b = r;
                    //if (a.equ(b0) && b.equ(a0)) break; // will not change anymore
                }
            }
            // normalize it
            if (a.real().abs().lt(a.imag().abs())) a = a.mul(Complex.Img());
            if (a.real().lt(O)) a = a.neg();
            return a;
        }
        ,xgcd: function cxgcd(/* args */) {
            // Generalization of Extended GCD Algorithm for complex numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                k = args.length, i, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
                asign = Complex.One(), bsign = Complex.One(), t, a, b, a0, b0, a1, b1, a2, b2, qr, gcd;

            if (0 === k) return;

            a = args[0];

            if (1 === k)
            {
                // normalize it
                if (a.real().abs().lt(a.imag().abs())) {a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());}
                if (a.real().lt(O)) {a = a.neg(); asign = asign.neg();}
                return [a, asign];
            }
            else //if (2 <= k)
            {
                // recursive on number of arguments
                // compute xgcd on rest arguments and combine with current
                // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
                gcd = 2 === k ? [args[1], Complex.One()] : cxgcd(slice.call(args, 1));
                b = gcd[0];

                // gcd with zero factor, take into account
                if (a.equ(O))
                {
                    // normalize it
                    if (b.real().abs().lt(b.imag().abs())) {b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img());}
                    if (b.real().lt(O)) {b = b.neg(); asign = asign.neg(); bsign = bsign.neg();}
                    return array(gcd.length+1,function(i) {
                        return 0 === i ? b : (1 === i ? asign : gcd[i-1].mul(bsign));
                    });
                }
                else if (b.equ(O))
                {
                    // normalize it
                    if (a.real().abs().lt(a.imag().abs())) {a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img());}
                    if (a.real().lt(O)) {a = a.neg(); asign = asign.neg(); bsign = bsign.neg();}
                    return array(gcd.length+1,function(i) {
                        return 0 === i ? a : (1 === i ? asign : gcd[i-1].mul(bsign));
                    });
                }

                a1 = Complex.One();
                b1 = Complex.Zero();
                a2 = Complex.Zero();
                b2 = Complex.One();

                for (;;)
                {
                    //a0 = a; b0 = b;

                    qr = a.divmod(b);
                    a = qr[1];
                    a1 = a1.sub(qr[0].mul(a2))
                    b1 = b1.sub(qr[0].mul(b2));
                    if (a.equ(O))
                    {
                        // normalize it
                        if (b.real().abs().lt(b.imag().abs())) {b = b.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img());}
                        if (b.real().lt(O)) {b = b.neg(); asign = asign.neg(); bsign = bsign.neg();}
                        a2 = a2.mul(asign); b2 = b2.mul(bsign);
                        return array(gcd.length+1,function(i) {
                            return 0 === i ? b : (1 === i ? a2 : gcd[i-1].mul(b2));
                        });
                    }

                    qr = b.divmod(a);
                    b = qr[1];
                    a2 = a2.sub(qr[0].mul(a1));
                    b2 = b2.sub(qr[0].mul(b1));
                    if (b.equ(O))
                    {
                        // normalize it
                        if (a.real().abs().lt(a.imag().abs())) {a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img());}
                        if (a.real().lt(O)) {a = a.neg(); asign = asign.neg(); bsign = bsign.neg();}
                        a1 = a1.mul(asign); b1 = b1.mul(bsign);
                        return array(gcd.length+1, function(i) {
                            return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                        });
                    }

                    /*if (a.equ(a0) && b.equ(b0))
                    {
                        // will not change anymore
                        if (a.real().abs().lt(a.imag().abs())) {a = a.mul(Complex.Img()); asign = asign.mul(Complex.Img());  bsign = bsign.mul(Complex.Img());}
                        if (a.real().lt(O)) {a = a.neg(); asign = asign.neg(); bsign = bsign.neg();}
                        a1 = a1.mul(asign); b1 = b1.mul(bsign);
                        return array(gcd.length+1, function(i) {
                            return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                        });
                    }*/
                }
            }
        }
        ,lcm: function clcm(/* args */) {
            // least common multiple
            // https://en.wikipedia.org/wiki/Least_common_multiple
            function clcm2(a, b)
            {
                var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = Complex.gcd(a, b);
                return g.equ(O) ? g : a.div(g).mul(b);
            }
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                i, l = args.length, LCM, O = Abacus.Arithmetic.O;
            if (1 >= l) return 1 === l ? args[0] : Complex.Zero();
            if (args[0].equ(O) || args[1].equ(O)) return Complex.Zero();
            LCM = clcm2(args[0], args[1]);
            for (i=2; i<l; ++i)
            {
                if (args[i].equ(O)) return Complex.Zero();
                LCM = clcm2(LCM, args[i]);
            }
            return LCM;
        }
        ,max: nmax
        ,min: nmin
        ,rnd: function(m, M, limit) {
            m = Complex.cast(m); M = Complex.cast(M);
            return Complex(Rational.rnd(m.real(), M.real(), limit), Rational.rnd(m.imag(), M.imag(), limit));
        }

        ,fromString: function(s) {
            return Expr.fromString(s, Complex.Symbol).c();
        }
    }

    ,re: null
    ,im: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_dec: null
    ,_norm: null
    ,_int: null
    ,_rem: null
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
        self.re = null;
        self.im = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._dec = null;
        self._norm = null;
        self._int = null;
        self._rem = null;
        return self;
    }

    ,isReal: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.im.equ(Arithmetic.O);
    }
    ,isImag: function() {
        var self = this, O = Abacus.Arithmetic.O;
        return self.re.equ(O) && !self.im.equ(O);
    }
    ,isComplex: function() {
        return true;
    }
    ,isInt: function() {
        var self = this;
        return self.isReal() && self.re.isInt();
    }
    ,isGauss: function() {
        // is Gaussian integer
        var self = this;
        return self.re.isInt() && self.im.isInt();
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
            return self.re.equ(other.re) && self.im.equ(other.im);
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            return self.re.equ(other) && self.im.equ(Arithmetic.O);
        else if (is_instance(other, Symbolic))
            return other.equ(self);
        else if (is_string(other))
            return (other === self.toString()) || (other === self.toTex()) || (other === self.toDec());

        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re.gt(other.re);
            else if (self.isImag() && other.isImag()) return self.im.gt(other.im);
            return self.norm().gt(other.norm());
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isReal() ? self.re.gt(other) : false;
        }
        else if (is_instance(other, Symbolic))
        {
            return other.lt(self);
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re.gte(other.re);
            else if (self.isImag() && other.isImag()) return self.im.gte(other.im);
            return self.norm().gte(other.norm());
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isReal() ? self.re.gte(other) : false;
        }
        else if (is_instance(other, Symbolic))
        {
            return other.lte(self);
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re.lt(other.re);
            else if (self.isImag() && other.isImag()) return self.im.lt(other.im);
            return self.norm().lt(other.norm());
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isReal() ? self.re.lt(other) : false;
        }
        else if (is_instance(other, Symbolic))
        {
            return other.gt(self);
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re.lte(other.re);
            else if (self.isImag() && other.isImag()) return self.im.lte(other.im);
            return self.norm().lte(other.norm());
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isReal() ? self.re.lte(other) : false;
        }
        else if (is_instance(other, Symbolic))
        {
            return other.gte(self);
        }
        return false;
    }

    ,real: function() {
        return this.re;
    }
    ,imag: function() {
        return this.im;
    }
    ,norm: function(abs) {
        var self = this, n, two = Abacus.Arithmetic.II;
        if (null == self._norm)
        {
            n = self.re.pow(two).add(self.im.pow(two));
            self._norm = [n, n.rad(two)];
        }
        return self._norm[true === abs ? 1 : 0];
    }
    ,abs: function() {
        var self = this;
        return self.norm(true);
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = Complex(self.re.neg(), self.im.neg());
            self._n._n = self;
        }
        return self._n;
    }
    ,conj: function() {
        var self = this;
        if (null == self._c)
        {
            self._c = Complex(self.re, self.im.neg());
            self._c._c = self;
        }
        return self._c;
    }
    ,rev: function() {
        var self = this;
        return Complex(self.im, self.re);
    }
    ,inv: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, m;
        if (null == self._i)
        {
            if (self.equ(Arithmetic.O)) throw new Error('Division by zero in inverse in Abacus.Complex!');
            m = self.norm();
            self._i = Complex(self.re.div(m), self.im.div(m).neg());
            self._i._i = self;
        }
        return self._i;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
            return Complex(self.re.add(other.re), self.im.add(other.im));
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            return Complex(self.re.add(other), self.im);
        else if (is_instance(other, INumber))
            return other.add(self);

        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
            return Complex(self.re.sub(other.re), self.im.sub(other.im));
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            return Complex(self.re.sub(other), self.im);
        else if (is_instance(other, INumber))
            return other.neg().add(self);

        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, k1, k2, k3, x1, x2, y1, y2;
        if (is_instance(other, Complex))
        {
            if (self.isReal())
            {
                return Complex(other.re.mul(self.re), other.im.mul(self.re));
            }
            else if (self.isImag())
            {
                return Complex(other.im.mul(self.im).neg(), other.re.mul(self.im));
            }
            else if (other.isReal())
            {
                return Complex(self.re.mul(other.re), self.im.mul(other.re));
            }
            else if (other.isImag())
            {
                return Complex(self.im.mul(other.im).neg(), self.re.mul(other.im));
            }
            else
            {
                // fast complex multiplication
                x1 = self.re; x2 = other.re; y1 = self.im; y2 = other.im;
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return Complex(self.re.mul(other), self.im.mul(other));
        }
        else if (is_instance(other, INumber))
        {
            return other.mul(self);
        }

        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, m, k1, k2, k3, x1, x2, y1, y2;
        if (is_instance(other, Complex))
        {
            if (other.equ(O))
                throw new Error('Division by zero in Abacus.Complex!');

            if (other.isReal())
            {
                return Complex(self.re.div(other.re), self.im.div(other.re));
            }
            else if (other.isImag())
            {
                return Complex(self.im.div(other.im), self.re.div(other.im).neg());
            }
            else
            {
                // fast complex multiplication for inverse
                m = other.norm(); x1 = self.re; x2 = other.re.div(m); y1 = self.im; y2 = other.im.div(m).neg();
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            if ((is_instance(other, Numeric) && other.equ(O)) || (Arithmetic.isNumber(other) && Arithmetic.equ(O, other)))
                throw new Error('Division by zero in Abacus.Complex!');

            return Complex(self.re.div(other), self.im.div(other));
        }

        return self;
    }
    ,mod: function(other, q) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            return self.sub((is_instance(q, Complex) ? q : self.div(other).round()).mul(other));

        return self;
    }
    ,divmod: function(other) {
        var self = this, q = self.div(other).round();
        return [q, self.mod(other, q)];
    }
    ,divides: function(other) {
        return !this.equ(Abacus.Arithmetic.O);
    }

    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, pow, e;
        n = Integer.cast(n);
        if (n.gt(MAX_DEFAULT)) return null;
        if (self.equ(O))
        {
            if (n.lt(O)) throw new Error('Zero denominator in negative power in Abacus.Complex!');
            return Complex.Zero();
        }
        if (n.equ(O)) return Complex.One();
        if (n.equ(I)) return self;
        if (n.lt(O))
        {
            self = self.inv();
            n = n.neg();
        }
        n = Arithmetic.val(n.num);
        e = self; pow = Complex.One();
        while (0 !== n)
        {
            // exponentiation by squaring
            if (n & 1) pow = pow.mul(e);
            n >>= 1;
            e = e.mul(e);
        }
        return pow;
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, norm;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I))
        {
            return self;
        }
        if (n.equ(Arithmetic.II))
        {
            // https://en.wikipedia.org/wiki/Complex_number#Square_root
            if (self.imag().equ(0))
            {
                return self.real().lt(0) ? Complex(Rational.Zero(), self.real().abs().rad(n)) : Complex(self.real().rad(n), Rational.Zero());
            }
            else
            {
                norm = self.norm().rad(2);
                return Complex(norm.add(self.real()).div(2).rad(n), norm.sub(self.real()).div(2).rad(n).mul(self.imag().lt(0) ? -1 : 1));
            }
        }
        return kthroot(self, n);
    }
    ,simpl: function() {
        var self = this;
        if (!self._simpl)
        {
            // simplify
            self.re.simpl();
            self.im.simpl();
            self._str = null;
            self._strp = null;
            self._tex = null;
            self._simpl = true;
        }
        return self;
    }
    ,round: function(absolute) {
        absolute = false !== absolute;
        var self = this;
        return Complex(self.re.round(absolute), self.im.round(absolute)); // return integer part
    }
    ,integer: function() {
        var self = this;
        if (null == self._int)
            self._int = Complex(self.re.integer(), self.im.integer()); // return integer part
        return self._int;
    }
    ,remainder: function() {
        var self = this;
        if (null == self._rem)
            self._rem = Complex(self.re.remainder(), self.im.remainder()); // return remainder part
        return self._rem;
    }
    ,tuple: function() {
        return [this.re, this.im];
    }
    ,valueOf: function() {
        return this.re.valueOf();
    }
    ,toExpr: function(flat) {
        var self = this;
        return true === flat ? Expr('+', [self.re.toExpr(), Expr('*', [self.im.toExpr(), Expr('', Complex.Symbol)])]) : Expr('', self);
    }
    ,toString: function(parenthesized) {
        var self = this;
        if (null == self._str) self._str = self.toExpr(true).toString();
        return self._str;
    }
    ,toTex: function() {
        var self = this;
        if (null == self._tex) self._tex = self.toExpr(true).toTex();
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, zr, dec;
        if (null == self._dec)
        {
            zr = self.re.equ(O);
            self._dec = (zr ? '' : self.re.toDec()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(I) ? '' : (self.im.equ(J) ? '-' : (self.im.toDec()))) + Complex.Symbol));
            if (!self._dec.length) self._dec = '0';
        }
        if (is_number(precision) && (0 <= precision))
        {
            zr = self.re.equ(O);
            dec = (zr ? '' : self.re.toDec(precision)) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(I) ? '' : (self.im.equ(J) ? '-' : (self.im.toDec(precision)))) + Complex.Symbol));
            if (!dec.length)
            {
                dec = '0';
                if (0 < precision) dec += '.' + (new Array(precision+1).join('0'));
            }
            return dec;
        }
        else
        {
            return self._dec;
        }
    }
});
Complex.cast = typecast([Complex], function(a) {
    return is_string(a) ? Complex.fromString(a) : new Complex(a);
});


nComplex = Abacus.nComplex = Class(Complex, {

    constructor: function nComplex(/*real, imag*/) {
        var self = this, args = arguments, real, imag, Arithmetic = Abacus.Arithmetic;

        if (args.length && (is_array(args[0]) || is_args(args[0]))) args = args[0];

        if (1 < args.length)
        {
            real = args[0]; imag = args[1];
        }
        else if (1 === args.length)
        {
            real = args[0]; imag = 0;
        }
        else
        {
            real = 0; imag = 0;
        }

        if (is_instance(real, Symbolic)) real = real.c();
        if (is_instance(imag, Symbolic)) imag = imag.c();

        if (is_instance(real, Complex))
        {
            imag = real.imag();
            real = real.real();
        }
        if (is_instance(real, Numeric) || Arithmetic.isNumber(real))
        {
            real = real.valueOf();
        }
        if (is_instance(imag, Numeric) || Arithmetic.isNumber(imag))
        {
            imag = imag.valueOf();
        }

        if (!is_instance(self, nComplex)) return new nComplex(real, imag);

        self.re = +real;
        self.im = +imag;

        def(self, 'num', {
            get: function() {
                return self;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'den', {
            get: function() {
                return nComplex.One();
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        Symbol: 'i'

        ,hasInverse: function() {
            return true;
        }

        ,Zero: function() {
            return new nComplex(0, 0);
        }
        ,One: function() {
            return new nComplex(1, 0);
        }
        ,MinusOne: function() {
            return new Complex(-1, 0);
        }
        ,Img: function() {
            return new Complex(0, 1);
        }
        ,MinusImg: function() {
            return new Complex(0, -1);
        }

        ,cast: null // added below


        ,fromString: function(s) {
            return new nComplex(Expr.fromString(s, Complex.Symbol).c());
        }
    }

    ,re: null
    ,im: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_int: null
    ,_rem: null
    ,_str: null
    ,_tex: null
    ,_dec: null
    ,_norm: null

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
        self.re = null;
        self.im = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._int = null;
        self._rem = null;
        self._str = null;
        self._tex = null;
        self._dec = null;
        self._norm = null;
        return self;
    }

    ,isReal: function() {
        var self = this;
        return 0 === self.im;
    }
    ,isImag: function() {
        var self = this;
        return (0 === self.re) && (0 !== self.im);
    }
    ,isComplex: function() {
        return true;
    }
    ,isInt: function() {
        var self = this;
        return self.isReal() && Number.isInteger(self.re);
    }
    ,isGauss: function() {
        // is Gaussian integer
        var self = this;
        return Number.isInteger(self.re) && Number.isInteger(self.im);
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            return (self.re === other.re) && (self.im === other.im);
        }
        if (is_instance(other, Complex))
        {
            return (self.re === other.re.valueOf()) && (self.im === other.im.valueOf());
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return self.isReal() ? self.re === other : false;
        }

        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            if (self.isReal() && other.isReal()) return self.re > other.re;
            else if (self.isImag() && other.isImag()) return self.im > other.im;
            return self.norm() > other.norm();
        }
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re > other.re.valueOf();
            else if (self.isImag() && other.isImag()) return self.im > other.im.valueOf();
            return self.norm() > other.norm().valueOf();
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return self.isReal() ? self.re > other : false;
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            if (self.isReal() && other.isReal()) return self.re >= other.re;
            else if (self.isImag() && other.isImag()) return self.im >= other.im;
            return self.norm() >= other.norm().valueOf();
        }
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re >= other.re.valueOf();
            else if (self.isImag() && other.isImag()) return self.im >= other.im.valueOf();
            return self.norm() >= other.norm().valueOf();
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return self.isReal() ? self.re >= other : false;
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            if (self.isReal() && other.isReal()) return self.re < other.re;
            else if (self.isImag() && other.isImag()) return self.im < other.im;
            return self.norm() < other.norm();
        }
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re < other.re.valueOf();
            else if (self.isImag() && other.isImag()) return self.im < other.im.valueOf();
            return self.norm() < other.norm().valueOf();
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return self.isReal() ? self.re < other : false;
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            if (self.isReal() && other.isReal()) return self.re <= other.re;
            else if (self.isImag() && other.isImag()) return self.im <= other.im;
            return self.norm() <= other.norm();
        }
        if (is_instance(other, Complex))
        {
            if (self.isReal() && other.isReal()) return self.re <= other.re.valueOf();
            else if (self.isImag() && other.isImag()) return self.im <= other.im.valueOf();
            return self.norm() <= other.norm().valueOf();
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return self.isReal() ? self.re <= other : false;
        }
        return false;
    }

    ,real: function() {
        return this.re;
    }
    ,imag: function() {
        return this.im;
    }
    ,norm: function(abs) {
        var self = this, n;
        if (null == self._norm)
        {
            n = stdMath.pow(self.re, 2) + stdMath.pow(self.im, 2);
            self._norm = [n, stdMath.sqrt(n)]
        }
        return self._norm[true === abs ? 1 : 0];
    }
    ,abs: function() {
        var self = this;
        return self.norm(true);
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = nComplex(-self.re, -self.im);
            self._n._n = self;
        }
        return self._n;
    }
    ,conj: function() {
        var self = this;
        if (null == self._c)
        {
            self._c = nComplex(self.re, -self.im);
            self._c._c = self;
        }
        return self._c;
    }
    ,rev: function() {
        var self = this;
        return nComplex(self.im, self.re);
    }
    ,inv: function() {
        var self = this, m;
        if (null == self._i)
        {
            if (self.equ(0)) throw new Error('Division by zero in inverse in Abacus.Complex!');
            m = self.norm();
            self._i = nComplex(self.re/m, -self.im/m);
            self._i._i = self;
        }
        return self._i;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            return nComplex(self.re + other.re, self.im + other.im);
        }
        if (is_instance(other, Complex))
        {
            return nComplex(self.re + other.re.valueOf(), self.im + other.im.valueOf());
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return nComplex(self.re + other, self.im);
        }

        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, nComplex))
        {
            return nComplex(self.re - other.re, self.im - other.im);
        }
        if (is_instance(other, Complex))
        {
            return nComplex(self.re - other.re.valueOf(), self.im - other.im.valueOf());
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return nComplex(self.re - other, self.im);
        }

        return self;
    }
    ,mul: function(other) {
        var self = this, k1, k2, k3, x1, x2, y1, y2, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (self.isReal())
            {
                return nComplex(other.re.valueOf()*self.re, other.im.valueOf()*self.re);
            }
            else if (self.isImag())
            {
                return nComplex(-other.im.valueOf()*self.im, other.re.valueOf()*self.im);
            }
            else if (other.isReal())
            {
                return nComplex(self.re*other.re.valueOf(), self.im*other.re.valueOf());
            }
            else if (other.isImag())
            {
                return nComplex(-self.im*other.im.valueOf(), self.re*other.im.valueOf());
            }
            else
            {
                // fast complex multiplication
                x1 = self.re; x2 = other.re.valueOf(); y1 = self.im; y2 = other.im.valueOf();
                k1 = x1*(x2+y2); k2 = y2*(x1+y1); k3 = x2*(y1-x1);
                return nComplex(k1-k2, k1+k3);
            }
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            return nComplex(self.re*other, self.im*other);
        }

        return self;
    }
    ,div: function(other) {
        var self = this, m, k1, k2, k3, x1, x2, y1, y2, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex))
        {
            if (other.equ(0))
                throw new Error('Division by zero in Abacus.nComplex!');

            if (other.isReal())
            {
                return nComplex(self.re/other.re.valueOf(), self.im/other.re.valueOf());
            }
            else if (other.isImag())
            {
                return nComplex(self.im/other.im.valueOf(), -self.re/other.im.valueOf());
            }
            else
            {
                // fast complex multiplication for inverse
                m = other.norm(); x1 = self.re; x2 = other.re.valueOf()/m; y1 = self.im; y2 = -other.im.valueOf()/m;
                k1 = x1*(x2+y2); k2 = y2*(x1+y1); k3 = x2*(y1-x1);
                return nComplex(k1-k2, k1+k3);
            }
        }
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            other = other.valueOf();
        }
        if (is_number(other))
        {
            if (0 === other) throw new Error('Division by zero in Abacus.nComplex!');
            return nComplex(self.re/other, self.im/other);
        }

        return self;
    }
    ,mod: function(other, q) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            return self.sub((is_instance(q, nComplex) ? q : self.div(other).round()).mul(other));

        return self;
    }
    ,divmod: function(other) {
        var self = this, q = self.div(other).round();
        return [q, self.mod(other, q)];
    }
    ,divides: function(other) {
        return !this.equ(0);
    }

    ,pow: function(n) {
        var self = this, pow, e;
        n = n.valueOf();
        if (self.equ(0))
        {
            if (n < 0) throw new Error('Zero denominator in negative power in Abacus.nComplex!');
            return nComplex.Zero();
        }
        if (n === 0) return nComplex.One();
        if (n === 1) return self;
        if (n < 0)
        {
            self = self.inv();
            n = -n;
        }
        e = self; pow = nComplex.One();
        n = n|0;
        while (0 !== n)
        {
            // exponentiation by squaring
            if (n & 1) pow = pow.mul(e);
            n >>= 1;
            e = e.mul(e);
        }
        return pow;
    }
    ,rad: function(n) {
        var self = this, norm;
        n = n.valueOf();
        if (n === 1)
        {
            return self;
        }
        if (n === 2)
        {
            // https://en.wikipedia.org/wiki/Complex_number#Square_root
            if (0 === self.imag())
            {
                return self.real() < 0 ? nComplex(0, jskthroot(stdMath.abs(self.real()), n)) : nComplex(jskthroot(self.real(), n), 0);
            }
            else
            {
                norm = jskthroot(self.norm(), 2);
                return nComplex(jskthroot((norm + self.real())/2, n), jskthroot((norm - self.real())/2, n)*(self.imag() < 0 ? -1 : 1));
            }
        }
        return kthroot(self, n);
    }
    ,round: function(absolute) {
        absolute = false !== absolute;
        var self = this;
        return nComplex(absolute ? stdMath.abs(stdMath.round(self.re)) : stdMath.round(self.re), absolute ? stdMath.abs(stdMath.round(self.im)) : stdMath.round(self.im)); // return integer part
    }
    ,integer: function() {
        var self = this;
        if (null == self._int)
            self._int = nComplex(stdMath.floor(self.re), stdMath.floor(self.im.integer)); // return integer part
        return self._int;
    }
    ,remainder: function() {
        var self = this;
        if (null == self._rem)
            self._rem = nComplex(self.re - stdMath.floor(self.re), self.im - stdMath.floor(self.im)); // return remainder part
        return self._rem;
    }
    ,tuple: function() {
        return [this.re, this.im];
    }
    ,valueOf: function() {
        return this.re;
    }
    ,toExpr: function(flat) {
        var self = this;
        return true === flat ? Expr('+', [Expr('', self.re), Expr('*', [Expr('', self.im), Expr('', Complex.Symbol)])]) : Expr('', self);
    }
    ,toString: function() {
        var self = this;
        if (null == self._str) self._str = self.toExpr(true).toString();
        return self._str;
    }
    ,toTex: function() {
        var self = this;
        if (null == self._tex) self._tex = self.toExpr(true).toTex();
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, zr, dec;
        if (is_number(precision) && (4 !== precision))
        {
            zr = 0 === self.re;
            dec = (zr ? '' : self.re.toFixed(precision)) + (0 === self.im ? '' : ((self.im > 0 ? (zr ? '' : '+') : '') + (self.im === 1 ? '' : (self.im === -1 ? '-' : (self.im.toFixed(precision)))) + Complex.Symbol));
            if (!dec.length) dec = (0).toFixed(precision);
            return dec;
        }
        if (null == self._dec)
        {
            zr = 0 === self.re;
            self._dec = (zr ? '' : self.re.toFixed(4)) + (0 === self.im ? '' : ((self.im > 0 ? (zr ? '' : '+') : '') + (self.im === 1 ? '' : (self.im === -1 ? '-' : (self.im.toFixed(4)))) + Complex.Symbol));
            if (!self._dec.length) self._dec = '0';
        }
        return self._dec;
    }
});
nComplex.cast = typecast([nComplex], function(a) {
    return is_string(a) ? nComplex.fromString(a) : new nComplex(a);
});
