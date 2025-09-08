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

        self.re = Rational.cast(real);
        self.im = Rational.cast(imag);
    }

    ,__static__: {
        Symbol: 'i'
        ,O: null
        ,I: null
        ,J: null
        ,i: null
        ,j: null
        ,Zero: function() {
            if (null == Complex.O) Complex.O = Complex(Rational.Zero(), Rational.Zero());
            return Complex.O;
        }
        ,One: function() {
            if (null == Complex.I) Complex.I = Complex(Rational.One(), Rational.Zero());
            return Complex.I;
        }
        ,MinusOne: function() {
            if (null == Complex.J) Complex.J = Complex(Rational.MinusOne(), Rational.Zero());
            return Complex.J;
        }
        ,Img: function() {
            if (null == Complex.i) Complex.i = Complex(Rational.Zero(), Rational.One());
            return Complex.i;
        }
        ,MinusImg: function() {
            if (null == Complex.j) Complex.j = Complex(Rational.Zero(), Rational.MinusOne());
            return Complex.j;
        }

        ,hasInverse: function() {
            return true;
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
            for (;i < c;)
            {
                while (i < c && (b=args[i++]).equ(O)) ;
                if (b.equ(a)) continue;
                else if (b.equ(O)) break;
                // swap them (a >= b)
                if (b.norm().gt(a.norm())) {t = b; b = a; a = t;}
                for (;!b.equ(O);)
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
            var m, signre, signim, real, imag, O = Complex.Zero(),
                pattern = /^\(?(?:([\+\-])?\s*\(?((?:\\frac\{-?\d+\}\{-?\d+\})|(?:-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/-?\d+)?))?\)?(\*?[ij])?)(?:\s*([\+\-])?\s*(?:\(?((?:\\frac\{-?\d+\}\{-?\d+\})|(?:-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/-?\d+)?))\)?\*?)?([ij]))?\)?$/;
            s = trim(String(s));
            if (!s.length) return O;
            m = s.match(pattern);
            if (!m) return O;
            if (m[3] && !m[6])
            {
                // given in opposite order or imaginary only
                imag = m[2] ? m[2] : (m[3] ? '1' : '0');
                real = m[5] || '0';
                signim = '-' === m[1] ? '-' : '';
                signre = '-' === m[4] ? '-' : '';
            }
            else
            {
                // given in correct order or real only
                imag = m[5] ? m[5] : (m[6] ? '1' : '0');
                real = m[2] || '0';
                signim = '-' === m[4] ? '-' : '';
                signre = '-' === m[1] ? '-' : '';
            }
            return Complex(Rational.fromString(signre+real), Rational.fromString(signim+imag));
        }
    }

    ,re: null
    ,im: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_strp: null
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
        self._strp = null;
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
    ,isInt: function() {
        var self = this;
        return self.isReal() && self.re.isInt();
    }
    ,isGauss: function() {
        // is Gaussian integer
        var self = this;
        return self.re.isInt() && self.im.isInt();
    }

    ,equ: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
            return self.re.equ(a.re) && self.im.equ(a.im);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return self.re.equ(a) && self.im.equ(Arithmetic.O);
        else if (is_instance(a, INumber))
            return a.equ(self);
        else if (is_string(a))
            return (a === self.toString()) || (a === self.toTex()) || (a === self.toDec());

        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (self.isReal() && a.isReal()) return self.re.gt(a.re);
            else if (self.isImag() && a.isImag()) return self.im.gt(a.im);
            return self.norm().gt(a.norm());
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal())
        {
            return self.re.gt(a);
        }
        else if (is_instance(a, INumber))
        {
            return a.lt(self);
        }
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (self.isReal() && a.isReal()) return self.re.gte(a.re);
            else if (self.isImag() && a.isImag()) return self.im.gte(a.im);
            return self.norm().gte(a.norm());
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal())
        {
            return self.re.gte(a);
        }
        else if (is_instance(a, INumber))
        {
            return a.lte(self);
        }
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (self.isReal() && a.isReal()) return self.re.lt(a.re);
            else if (self.isImag() && a.isImag()) return self.im.lt(a.im);
            return self.norm().lt(a.norm());
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal())
        {
            return self.re.lt(a);
        }
        else if (is_instance(a, INumber))
        {
            return a.gt(self);
        }
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (self.isReal() && a.isReal()) return self.re.lte(a.re);
            else if (self.isImag() && a.isImag()) return self.im.lte(a.im);
            return self.norm().lte(a.norm());
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && self.isReal())
        {
            return self.re.lte(a);
        }
        else if (is_instance(a, INumber))
        {
            return a.gte(self);
        }
        return false;
    }

    ,real: function() {
        return this.re;
    }
    ,imag: function() {
        return this.im;
    }
    ,norm: function() {
        var self = this, real, imag, two = Abacus.Arithmetic.II;
        if (null == self._norm)
        {
            real = self.re; imag = self.im;
            self._norm = real.pow(two).add(imag.pow(two));
        }
        return self._norm;
    }
    ,abs: function() {
        var self = this;
        return Complex(self.re.abs(), self.im.abs());
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

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
            return Complex(self.re.add(a.re), self.im.add(a.im));
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return Complex(self.re.add(a), self.im);
        else if (is_instance(a, INumber))
            return a.add(self);

        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
            return Complex(self.re.sub(a.re), self.im.sub(a.im));
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return Complex(self.re.sub(a), self.im);
        else if (is_instance(a, INumber))
            return a.neg().add(self);

        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, k1, k2, k3, x1, x2, y1, y2;
        if (is_instance(a, Complex))
        {
            if (self.isReal())
            {
                return Complex(a.re.mul(self.re), a.im.mul(self.re));
            }
            else if (self.isImag())
            {
                return Complex(a.im.mul(self.im).neg(), a.re.mul(self.im));
            }
            else if (a.isReal())
            {
                return Complex(self.re.mul(a.re), self.im.mul(a.re));
            }
            else if (a.isImag())
            {
                return Complex(self.im.mul(a.im).neg(), self.re.mul(a.im));
            }
            else
            {
                // fast complex multiplication
                x1 = self.re; x2 = a.re; y1 = self.im; y2 = a.im;
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            return Complex(self.re.mul(a), self.im.mul(a));
        }
        else if (is_instance(a, INumber))
        {
            return a.mul(self);
        }

        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, m, k1, k2, k3, x1, x2, y1, y2;
        if (is_instance(a, Complex))
        {
            if (a.equ(O))
                throw new Error('Division by zero in Abacus.Complex!');

            if (a.isReal())
            {
                return Complex(self.re.div(a.re), self.im.div(a.re));
            }
            else if (a.isImag())
            {
                return Complex(self.im.div(a.im), self.re.div(a.im).neg());
            }
            else
            {
                // fast complex multiplication for inverse
                m = a.norm(); x1 = self.re; x2 = a.re.div(m); y1 = self.im; y2 = a.im.div(m).neg();
                k1 = x1.mul(x2.add(y2)); k2 = y2.mul(x1.add(y1)); k3 = x2.mul(y1.sub(x1));
                return Complex(k1.sub(k2), k1.add(k3));
            }
        }
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            if ((is_instance(a, Numeric) && a.equ(O)) || (Arithmetic.isNumber(a) && Arithmetic.equ(O, a)))
                throw new Error('Division by zero in Abacus.Complex!');

            return Complex(self.re.div(a), self.im.div(a));
        }

        return self;
    }
    ,mod: function(a, q) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return self.sub((is_instance(q, Complex) ? q : self.div(a).round()).mul(a));

        return self;
    }
    ,divmod: function(a) {
        var self = this, q = self.div(a).round();
        return [q, self.mod(a, q)];
    }
    ,divides: function(a) {
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
        for (;0 !== n;)
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
    ,toString: function(parenthesized) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr;
        if (null == self._str)
        {
            zr = self.re.equ(O);
            self._str = (zr ? '' : self.re.toString()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toString(true) + '*'))) + Complex.Symbol));
            if (!self._str.length) self._str = '0';
            self._strp = (zr ? '' : self.re.toString(true)) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toString(true) + '*'))) + Complex.Symbol));
            if (!self._strp.length) self._strp = '0';
        }
        return parenthesized ? self._strp : self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr;
        if (null == self._tex)
        {
            zr = self.re.equ(O);
            self._tex = (zr ? '' : self.re.toTex()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : self.im.toTex())) + Complex.Symbol));
            if (!self._tex.length) self._tex = '0';
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, zr, dec;
        if (null == self._dec)
        {
            zr = self.re.equ(O);
            self._dec = (zr ? '' : self.re.toDec()) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toDec()))) + Complex.Symbol));
            if (!self._dec.length) self._dec = '0';
        }
        if (is_number(precision) && 0 <= precision)
        {
            zr = self.re.equ(O);
            dec = (zr ? '' : self.re.toDec(precision)) + (self.im.equ(O) ? '' : ((self.im.gt(O) ? (zr ? '' : '+') : '') + (self.im.equ(Arithmetic.I) ? '' : (self.im.equ(Arithmetic.J) ? '-' : (self.im.toDec(precision)))) + Complex.Symbol));
            if (!dec.length)
            {
                dec = '0';
                if (0<precision) dec += '.' + (new Array(precision+1).join('0'));
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
