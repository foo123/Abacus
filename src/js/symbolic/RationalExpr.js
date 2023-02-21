// Abacus.Rationalexpr, represents a rational function/fraction of expressions
RationalExpr = Abacus.RationalExpr = Class(Symbolic, {
    constructor: function RationalExpr(num, den) {
        var self = this, Arithmetic = Abacus.Arithmetic;

        if (!is_instance(self, RationalExpr)) return new RationalExpr(num, den);

        if (is_instance(num, RationalExpr))
        {
            den = num.den;
            num = num.num;
        }
        else if (is_instance(num, RationalFunc))
        {
            den = num.den.toExpr();
            num = num.num.toExpr();
        }
        if (null == num) num = Expr();
        else if (!is_instance(num, Expr)) num = Expr(num);

        if (null == den) den = Expr(Arithmetic.I);
        else if (!is_instance(den, Expr)) den = Expr(den);

        if (den.equ(Arithmetic.O)) throw new Error('Zero denominator in Abacus.RationalExpr!');
        if (num.equ(Arithmetic.O) && !den.equ(Arithmetic.I)) den = Expr(Arithmetic.I);
        self.num = num;
        self.den = den;
    }

    ,__static__: {
        Term: Expr//AddTerm

        ,fromString: function(s) {
            var paren = 0, braket = 0, parts = ['', ''], sign = '', is_tex = false,
                i = 0, l, c, j, num, den, space = /\s/;
            s = trim(String(s));
            if (!s.length) return RationalExpr();
            if (('-' === s.charAt(0)) || ('+' === s.charAt(0)))
            {
                sign = s.charAt(0);
                s = trim(s.slice(1));
                if (!s.length) return RationalExpr();
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
                num = Expr.fromString(parts[0]);
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
                num = Expr.fromString(parts[0]);
                den = parts[1].length ? Expr.fromString(parts[1]) : null;
            }
            if ('-' === sign) num = num.neg();
            return new RationalExpr(num, den);
        }

        ,cast: null // added below
    }

    ,num: null
    ,den: null
    ,_str: null
    ,_tex: null

    ,dispose: function() {
        var self = this;
        self.num = null;
        self.den = null;
        self._str = null;
        self._tex = null;
        return self;
    }
    ,c: function() {
        var self = this;
        return self.num.c().div(self.den.c());
    }
    ,term: function(t) {
        var self = this;
        return self.num.term(t);
    }
    ,isConst: function() {
        var self = this;
        return self.num.isConst() && self.den.isConst();
    }
    ,isReal: function() {
        var self = this;
        return (self.num.isReal() && self.den.isReal()) || (self.num.isImag() && self.den.isImag());
    }
    ,isImag: function() {
        var self = this;
        return (self.num.isReal() && self.den.isImag()) || (self.num.isImag() && self.den.isReal());
    }
    ,real: function() {
        var self = this;
        return RationalExpr(self.num.real(), self.den.real());
    }
    ,imag: function() {
        var self = this;
        return RationalExpr(self.num.imag(), self.den.imag());
    }
    ,neg: function() {
        var self = this;
        return RationalExpr(self.num.neg(), self.den);
    }
    ,inv: function() {
        var self = this;
        return RationalExpr(self.den, self.num);
    }
    ,conj: function() {
        var self = this;
        return RationalExpr(self.num.conj(), self.den.conj());
    }
    ,equ: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x))
            return self.num.equ(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return self.num.mul(x.den).equ(self.den.mul(x.num));
        else if (is_string(x))
            return (x===self.toString()) || (x===self.toTex());
        return false;
    }
    ,gt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x))
            return self.num.gt(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return self.num.mul(x.den).gt(self.den.mul(x.num));
        return false;
    }
    ,gte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x))
            return self.num.gte(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return self.num.mul(x.den).gte(self.den.mul(x.num));
        return false;
    }
    ,lt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x))
            return self.num.lt(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return self.num.mul(x.den).lt(self.den.mul(x.num));
        return false;
    }
    ,lte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        if (is_instance(x, [Integer, IntegerMod, Complex, Poly, PowTerm, MulTerm, Expr, Func]) || Arithmetic.isNumber(x))
            return self.num.lte(self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return self.num.mul(x.den).lte(self.den.mul(x.num));
        return false;
    }

    ,add: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]))
            return RationalExpr(self.num.add(self.den.mul(x)), self.den);
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return RationalExpr(self.num.mul(x.den).add(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,sub: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]))
            return RationalExpr(self.num.sub(self.den.mul(x)), self.den);
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return RationalExpr(self.num.mul(x.den).sub(self.den.mul(x.num)), self.den.mul(x.den));
        return self;
    }
    ,mul: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]))
            return RationalExpr(self.num.mul(x), self.den);
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return RationalExpr(self.num.mul(x.num), self.den.mul(x.den));
        return self;
    }
    ,div: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, Complex) && x.isReal()) x = x.real();
        else if (is_instance(x, [Integer, IntegerMod]) || Arithmetic.isNumber(x)) x = Rational(x);
        if (is_instance(x, [Complex, Poly, PowTerm, MulTerm, Expr, Func]))
            return RationalExpr(self.num, self.den.mul(x));
        else if (is_instance(x, [Rational, RationalFunc, RationalExpr]))
            return RationalExpr(self.num.mul(x.den), self.den.mul(x.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function(x) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if (n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 > n) { n = -n; t = num; num = den; den = t; }
        if (0 === n)
            return RationalExpr(Arithmetic.I);
        else if (1 === n)
            return RationalExpr(num, den);
        else
            return RationalExpr(num.pow(n), den.pow(n));
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return RationalExpr(self.num.rad(n), self.den.rad(n));
    }
    ,d: function(x, n) {
        // partial rational (formal) derivative of nth order with respect to symbol x
        var self = this, num, den, d_num, d_den, Arithmetic = Abacus.Arithmetic;
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
        return RationalExpr(d_num, d_den);
    }
    ,evaluate: function(symbolValues) {
        var self = this;
        symbolValues = symbolValues || {};
        return self.num.evaluate(symbolValues).div(self.den.evaluate(symbolValues));
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._str)
            self._str = self.den.equ(Arithmetic.I) ? self.num.toString() : ((1===self.num.symbols().length && self.num.c().isReal() ? self.num.toString(true) : ('('+self.num.toString()+')'))+'/'+(1===self.den.symbols().length && self.den.isReal() ? self.den.toString() : ('('+self.den.toString()+')')));
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{'+self.num.toTex()+'}{'+self.den.toTex()+'}');
        return self._tex;
    }
});
RationalExpr.cast = typecast([RationalExpr], function(a){
    return is_string(a) ? RationalExpr.fromString(a) : new RationalExpr(a);
});
