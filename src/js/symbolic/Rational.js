// Abacus.Rational, represents a rational number (can support bigInt numerator/denumerator if plugged in, else default numbers)
Rational = Abacus.Rational = Class(Numeric, {

    constructor: function Rational(/*num, den, simplified*/) {
        var self = this, args = arguments, num, den, simplified, simplify = Rational.autoSimplify,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;

        if (args.length && (is_array(args[0]) || is_args(args[0]))) args = args[0];

        simplified = (2 < args.length) && (true === args[2]);

        if (1 < args.length)
        {
            num = args[0]; den = args[1];
        }
        else if (1 === args.length)
        {
            num = args[0]; den = null;
        }
        else
        {
            num = null; den = null;
        }

        if (!is_instance(self, Rational)) return new Rational(num, den, simplified);

        if (is_instance(num, Symbolic)) num = num.c();
        if (is_instance(den, Symbolic)) den = den.c();
        if (is_instance(num, [Integer, IntegerMod])) num = num.num;
        if (is_instance(den, [Integer, IntegerMod])) den = den.num;
        if (is_instance(num, Complex)) num = num.real();
        if (is_instance(num, Rational))
        {
            simplified = num._simpl;
            den = num.den;
            num = num.num;
        }

        if (null == den) den = I;
        if (null == num) num = O;

        num = Arithmetic.num(num);
        den = Arithmetic.num(den);

        if (Arithmetic.equ(O, den)) throw new Error('Zero denominator in Abacus.Rational!');

        self.num = Arithmetic.abs(num); self.den = Arithmetic.abs(den);

        if (Arithmetic.equ(O, self.num)) self.den = I; // normalise zero representation

        if ((Arithmetic.lt(O, num) && Arithmetic.gt(O, den)) || (Arithmetic.lt(O, den) && Arithmetic.gt(O, num)))
            self.num = Arithmetic.neg(self.num); // make numerator carry the sign only

        if (simplified) self._simpl = true;
        else if (simplify) self.simpl(); // simplify to smallest equivalent representation
    }

    ,__static__: {
        autoSimplify: true
        ,O: null
        ,I: null
        ,J: null
        ,Zero: function() {
            if (null == Rational.O) Rational.O = Rational(Abacus.Arithmetic.O, Abacus.Arithmetic.I, true);
            return Rational.O;
        }
        ,One: function() {
            if (null == Rational.I) Rational.I = Rational(Abacus.Arithmetic.I, Abacus.Arithmetic.I, true);
            return Rational.I;
        }
        ,MinusOne: function() {
            if (null == Rational.J) Rational.J = Rational(Abacus.Arithmetic.J, Abacus.Arithmetic.I, true);
            return Rational.J;
        }
        ,EPS: null
        ,Epsilon: function(newEpsilon) {
            if (null != newEpsilon)
            {
                Rational.EPS = true === newEpsilon ? Rational.fromString(EPSILON.toString()) : Rational.fromString(newEpsilon.toString());
            }
            else if (null == Rational.EPS)
            {
                Rational.EPS = Rational.fromString(EPSILON.toString());
            }
            return Rational.EPS;
        }

        ,hasInverse: function() {
            return true;
        }
        ,cast: null // added below

        ,gcd: function rgcd(/* args */) {
            // gcd of Rational numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                Arithmetic = Abacus.Arithmetic, denom;
            denom = operate(function(p, r) {return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
            return Rational(gcd(array(args.length, function(i) {return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
        }
        ,xgcd: function rxgcd(/* args */) {
            // xgcd of Rational numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, denom;
            if (!args.length) return;
            denom = operate(function(p, r) {return Arithmetic.mul(p, r.den);}, I, args);
            return xgcd(array(args.length, function(i) {return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})).map(function(g, i) {return 0 === i ? Rational(g, denom) : Rational(g, I, true);});
        }
        ,lcm: function rlcm(/* args */) {
            // lcm of Rational numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                Arithmetic = Abacus.Arithmetic, denom;
            denom = operate(function(p, r) {return Arithmetic.mul(p, r.den);}, Arithmetic.I, args);
            return Rational(lcm(array(args.length, function(i) {return Arithmetic.mul(Arithmetic.div(denom, args[i].den), args[i].num);})), denom);
        }
        ,max: nmax
        ,min: nmin
        ,rnd01: function(limit) {
            var Arithmetic = Abacus.Arithmetic, two = Arithmetic.II, tries, lo, hi, mid;
            // geerate random Rational between 0 and 1 uniformly with up to "limit" bits/tries
            if (null == limit) limit = 15;
            limit = Abacus.Math.rndInt(0, stdMath.abs(+limit)); tries = 0;
            lo = Rational.Zero(); hi = Rational.One();
            while (tries < limit && lo.lte(hi))
            {
                mid = hi.add(lo).div(two);
                if (Abacus.Math.rnd() < 0.5) hi = mid;
                else lo = mid;
                ++tries;
            }
            return lo;
        }
        ,rnd: function(m, M, limit) {
            var t;
            m = Rational.cast(m); M = Rational.cast(M);
            if (M.lt(m)) {t = m; m = M; M = t;}
            return m.equ(M) ? m : m.add(Rational.rnd01(limit).mul(M.sub(m)));
        }

        ,fromIntRem: function(i, r, m) {
            var Arithmetic = Abacus.Arithmetic;
            i = Arithmetic.num(i); r = Arithmetic.num(r); m = Arithmetic.num(m);
            return Rational(Arithmetic.add(r, Arithmetic.mul(i, m)), m);
        }
        ,fromContFrac: function(cfr) {
            // compute rational from continued fraction representation
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, n, d, n0, d0, k;
            n = I; d = O;
            if (is_array(cfr))
            {
                k = cfr.length-1;
                while (0 <= k)
                {
                    n0 = n; d0 = d;
                    n = d0; d = n0;
                    n = Arithmetic.add(n, Arithmetic.mul(d, cfr[k--]));
                }
            }
            return Arithmetic.equ(O, d) ? null : Rational(n, d);
        }
        ,fromDec: function(d) {
            var f = dec2frac(d, true);
            return f ? Rational(f[0], f[1], true) : Rational.Zero();
        }
        ,fromString: function(s) {
            var Arithmetic = Abacus.Arithmetic, num_denom, m, sign = '+', num, den,
                tex_frac_pattern = /^(-)?\\frac\{\s*(-?\s*\d+)\s*\}\{\s*(-?\s*\d+)\s*\}$/, O = Rational.Zero();
            s = trim(String(s));
            if (!s.length) return O;
            if (('+' === s.charAt(0)) || ('-' === s.charAt(0)))
            {
                // get optional sign
                sign = s.charAt(0);
                s = trim(s.slice(1));
            }
            if (!s.length) return O;
            if (('(' === s.charAt(0)) && (')' === s.charAt(s.length-1)))
            {
                // remove optional parentheses
                s = trim(s.slice(1, -1));
            }
            if (!s.length) return O;
            if ((-1 !== s.indexOf('.')) || (-1 !== s.indexOf('e')))
            {
                m = Rational.fromDec(s);
                if ('-' === sign) m = m.neg();
                return m;
            }
            else if (-1 !== s.indexOf('\\frac'))
            {
                m = s.match(tex_frac_pattern);
                if (!m) return O;
                if ('-' === m[1]) sign = '-' === sign ? '+' : '-';
                num = Arithmetic.num(trim(m[2].split(/s+/).join('')));
                den = Arithmetic.num(trim(m[3].split(/s+/).join('')));
            }
            else
            {
                num_denom = String(s).split('/');
                num = Arithmetic.num(num_denom[0].length ? trim(num_denom[0]) : '0');
                den = 1 < num_denom.length ? Arithmetic.num(trim(num_denom[1])) : Arithmetic.I;
            }
            if ('-' === sign) num = Arithmetic.neg(num);
            return Rational(num, den);
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_str: null
    ,_strp: null
    ,_tex: null
    ,_cfr: null
    ,_dec: null
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
        self.num = null;
        self.den = null;
        self._n = null;
        self._i = null;
        self._str = null;
        self._strp = null;
        self._tex = null;
        self._cfr = null;
        self._dec = null;
        self._int = null;
        self._rem = null;
        self._simpl = null;
        return self;
    }

    ,isInt: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self._simpl ? Arithmetic.equ(Arithmetic.I, self.den) : Arithmetic.equ(Arithmetic.O, Arithmetic.mod(self.num, self.den));
    }

    ,equ: function(a, strict) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Rational))
            return true === strict ? (Arithmetic.equ(self.num, a.num) && Arithmetic.equ(self.den, a.den)) : Arithmetic.equ(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return true === strict ? (Arithmetic.equ(self.num, a.num) && Arithmetic.equ(self.den, Arithmetic.I)) : Arithmetic.equ(self.num, Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, INumber))
            return a.equ(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return true === strict ? (Arithmetic.equ(self.num, a) && Arithmetic.equ(self.den, Arithmetic.I)) : Arithmetic.equ(self.num, Arithmetic.mul(self.den, a));
        else if (is_string(a))
            return (a === self.toString()) || (a === self.toTex()) || (a === self.toDec());

        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Rational))
            return Arithmetic.gt(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.gt(self.num, Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, INumber))
            return a.lt(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.gt(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Rational))
            return Arithmetic.gte(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.gte(self.num, Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, INumber))
            return a.lte(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.gte(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Rational))
            return Arithmetic.lt(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.lt(self.num, Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, INumber))
            return a.gt(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.lt(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Rational))
            return Arithmetic.lte(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.lte(self.num, Arithmetic.mul(a.num, self.den));
        else if (is_instance(a, INumber))
            return a.gte(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.lte(self.num, Arithmetic.mul(self.den, a));
        return false;
    }
    ,abs: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return Rational(Arithmetic.abs(self.num), self.den, self._simpl);
    }
    ,neg: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._n)
        {
            self._n = Rational(Arithmetic.neg(self.num), self.den, self._simpl);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function() {
        var self = this;
        if (null == self._i)
        {
            self._i = Rational(self.den, self.num, self._simpl);
            self._i._i = self;
        }
        return self._i;
    }
    ,rev: function() {
        return this.inv();
    }

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (!a.isReal()) return a.add(self);
            a = a.real();
        }
        if (is_instance(a, Rational))
            return Arithmetic.equ(self.den, a.den) ? Rational(Arithmetic.add(self.num, a.num), self.den) : Rational(Arithmetic.add(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den)), Arithmetic.mul(self.den, a.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.add(self.num, a.num), self.den) : Rational(Arithmetic.add(self.num, Arithmetic.mul(self.den, a.num)), self.den);
        else if (is_instance(a, INumber))
            return a.add(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.add(self.num, a), self.den) : Rational(Arithmetic.add(self.num, Arithmetic.mul(self.den, a)), self.den);

        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (!a.isReal()) return Complex(self).sub(a);
            a = a.real();
        }
        if (is_instance(a, Rational))
            return Arithmetic.equ(self.den, a.den) ? Rational(Arithmetic.sub(self.num, a.num), self.den) : Rational(Arithmetic.sub(Arithmetic.mul(self.num, a.den), Arithmetic.mul(a.num, self.den)), Arithmetic.mul(self.den, a.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.sub(self.num, a.num), self.den) : Rational(Arithmetic.sub(self.num, Arithmetic.mul(self.den, a.num)), self.den);
        else if (is_instance(a, INumber))
            return a.neg().add(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Arithmetic.equ(self.den, Arithmetic.I) ? Rational(Arithmetic.sub(self.num, a), self.den) : Rational(Arithmetic.sub(self.num, Arithmetic.mul(self.den, a)), self.den);

        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (!a.isReal()) return a.mul(self);
            a = a.real();
        }
        if (is_instance(a, Rational))
            return Rational(Arithmetic.mul(self.num, a.num), Arithmetic.mul(self.den, a.den));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Rational(Arithmetic.mul(self.num, a.num), self.den);
        else if (is_instance(a, INumber))
            return a.mul(self);
        else if (Arithmetic.isNumber(a)) // assume integer
            return Rational(Arithmetic.mul(self.num, a), self.den);

        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex))
        {
            if (!a.isReal()) return Complex(self).div(a);
            a = a.real();
        }
        if (is_instance(a, [RationalFunc, Expr]))
            return a.inv().mul(self);
        else if (is_instance(a, Rational))
            return Rational(Arithmetic.mul(self.num, a.den), Arithmetic.mul(self.den, a.num));
        else if (is_instance(a, [Integer, IntegerMod]))
            return Rational(self.num, Arithmetic.mul(self.den, a.num));
        else if (Arithmetic.isNumber(a)) // assume integer
            return Rational(self.num, Arithmetic.mul(self.den, a));

        return self;
    }
    ,mod: function(a, q) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Complex)) a = a.real();

        if (is_instance(a, [Rational, Integer, IntegerMod]))
            return self.sub(a.mul(is_instance(q, Rational) ? q : self.div(a).round()));
        else if (Arithmetic.isNumber(a)) // assume integer
            return self.sub(Arithmetic.mul(a, is_instance(q, Rational) ? q.num : self.div(a).round().num));

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
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, num, denom;
        n = Integer.cast(n);
        num = self.num; denom = self.den;
        if (n.lt(O))
        {
            if (Arithmetic.equ(O, num)) throw new Error('Zero denominator from negative power in Abacus.Rational!');
            num = self.den; denom = self.num;
            n = n.neg();
        }
        if (Arithmetic.equ(O, num)) return Rational.Zero();
        if (n.equ(O)) return Rational.One();
        if (n.equ(I)) return Rational(num, denom, self._simpl);
        return Rational(Arithmetic.pow(num, n.num), Arithmetic.pow(denom, n.num), self._simpl);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        if (self.lt(Arithmetic.O) && n.mod(Arithmetic.II).equ(Arithmetic.O)) return Complex(self).rad(n);
        return kthroot(self, n);
    }
    ,simpl: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, g;
        if (!self._simpl)
        {
            if (Arithmetic.equ(Arithmetic.O, self.num))
            {
                self.den = I;
            }
            else if (!Arithmetic.equ(Arithmetic.J, self.num) && !Arithmetic.equ(I, self.num) && !Arithmetic.equ(I, self.den))
            {
                g = gcd(self.num, self.den);
                if (!Arithmetic.equ(I, g))
                {
                    self.num = Arithmetic.div(self.num, g);
                    self.den = Arithmetic.div(self.den, g);
                    self._str = null;
                    self._strp = null;
                    self._tex = null;
                }
            }
            self._simpl = true;
        }
        return self;
    }
    ,round: function(absolute) {
        absolute = false !== absolute;
        var self = this, Arithmetic = Abacus.Arithmetic,
            sign = absolute ? (Arithmetic.gt(Arithmetic.O, self.num) ? Arithmetic.J : Arithmetic.I) : Arithmetic.I;
        return Rational(Arithmetic.mul(sign, Arithmetic.div(Arithmetic.add(Arithmetic.mul(absolute ? Arithmetic.abs(self.num) : self.num, Arithmetic.II), self.den), Arithmetic.mul(self.den, Arithmetic.II))), Arithmetic.I, true);
    }
    ,integer: function(raw) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._int)
            self._int = Rational(Arithmetic.div(self.num, self.den), Arithmetic.I, true); // return integer part
        return true === raw ? self._int.num : self._int;
    }
    ,remainder: function(raw) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._rem)
            self._rem = Rational(Arithmetic.mod(self.num, self.den), Arithmetic.I, true); // return remainder part
        return true === raw ? self._rem.num : self._rem;
    }
    ,approximate: function(bound) {
        // compute an approximation of given rational with denominator no larger than bound via Farey sequence
        var self = this, nn = self.num, dd = self.den, a, b, c, d, m1, m2, nm, dm, i, neg, rn = null, rd = null,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I;

        bound = Arithmetic.num(bound); neg = self.lt(O);
        nn = Arithmetic.abs(nn); i = Arithmetic.div(nn, dd); nn = Arithmetic.mod(nn, dd);
        a = O; b = I; c = I; d = I;
        while (Arithmetic.lte(b, bound) && Arithmetic.lte(d, bound))
        {
            m1 = Arithmetic.add(a, c); m2 = Arithmetic.add(b, d);
            nm = Arithmetic.mul(nn, m2); dm = Arithmetic.mul(dd, m1);
            if (Arithmetic.equ(nm, dm))
            {
                if (Arithmetic.lte(m2, bound))
                {
                    rn = m1; rd = m2;
                    break;
                }
                else if (Arithmetic.gt(d, b))
                {
                    rn = c; rd = d;
                    break;
                }
                else
                {
                    rn = a; rd = b;
                    break;
                }
            }
            else if (Arithmetic.gt(nm, dm))
            {
                a = m1; b = m2;
            }
            else
            {
                c = m1; d = m2;
            }
        }
        if (null == rn || null == rd)
        {
            if (Arithmetic.gt(b, bound))
            {
                rn = c; rd = d;
            }
            else
            {
                rn = a; rd = b;
            }
        }
        return new Rational(neg ? Arithmetic.neg(Arithmetic.add(rn, Arithmetic.mul(i, rd))) : Arithmetic.add(rn, Arithmetic.mul(i, rd)), rd);
    }
    ,tuple: function() {
        return [this.num, this.den];
    }
    ,toContFrac: function() {
        // compute continued fraction representation of rational r
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, n, d, n0, d0, i, cfr;
        if (null == self._cfr)
        {
            n = self.num; d = self.den; cfr = [];
            while (!Arithmetic.equ(O, d))
            {
                i = Arithmetic.div(n, d); cfr.push(i);
                n0 = n; d0 = d;
                n = d0; d = Arithmetic.sub(n0, Arithmetic.mul(i, d0));
            }
            self._cfr = cfr;
        }
        return self._cfr.slice();
    }
    ,toDec: function(precision) {
        var self = this, dec, point, repeating, ndigits, digit, d, i, i0, carry;
        if (null == self._dec)
            self._dec = frac2dec(self.num, self.den); // return **exact** decimal expansion (with optional repeating digits)
        if (is_number(precision) && 0 <= precision)
        {
            precision = stdMath.ceil(precision);
            dec = self._dec;
            point = dec.indexOf('.');
            if (-1 === point) return 0 < precision ? (dec + '.'+(new Array(precision+1).join('0'))) : dec;
            i = dec.indexOf('[', point+1);
            if (-1 !== i)
            {
                repeating = dec.slice(i+1, -1);
                dec = dec.slice(0, i) + repeating;
                if (repeating.length && (dec.length-point-1 <= precision))
                    dec += new Array(stdMath.floor((precision-(dec.length-point-1)) / repeating.length)+2).join(repeating);
            }
            ndigits = dec.length-point-1;
            if (ndigits < precision)
            {
                dec += new Array(precision-ndigits+1).join('0');
            }
            else if (ndigits > precision)
            {
                digit = dec.charAt(point+1+precision); d = parseInt(digit, 10);
                dec = dec.slice(0, point+1+precision).split('');
                i = dec.length-1; i0 = '-' === dec[0] ? 1 : 0; carry = (d >= 5);
                if (point === i) --i;
                while (carry && (i >= i0))
                {
                    d = parseInt(dec[i], 10);
                    carry = (9 === d);
                    dec[i] = String(carry ? 0 : d+1);
                    --i; if (point === i) --i;
                }
                if (carry) dec.splice(i0, 0, '1');
                if ('.' === dec[dec.length-1]) dec.pop();
                dec = dec.join('');
            }
            return dec;
        }
        else
        {
            return self._dec;
        }
    }
    ,valueOf: function() {
        var Arithmetic = Abacus.Arithmetic;
        return Arithmetic.val(this.num) / Arithmetic.val(this.den);
    }
    ,toString: function(parenthesized) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._str)
        {
            self._str = String(self.num) + (Arithmetic.equ(Arithmetic.I, self.den) ? '' : ('/' + String(self.den)));
            self._strp = Arithmetic.equ(Arithmetic.I, self.den) ? String(self.num) : ((Arithmetic.gt(Arithmetic.O, self.num) ? '-' : '') + '(' + String(Arithmetic.abs(self.num)) + '/' + String(self.den) + ')');
        }
        return parenthesized ? self._strp : self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
            self._tex = Arithmetic.equ(Arithmetic.I, self.den) ? Tex(self.num) : ((Arithmetic.gt(Arithmetic.O, self.num) ? '-' : '') + '\\frac{' + Tex(Arithmetic.abs(self.num)) + '}{' + Tex(self.den) + '}');
        return self._tex;
    }
});
Rational.cast = typecast([Rational], function(a) {
    return is_string(a) ? Rational.fromString(a) : new Rational(a);
});
