// Represents a power term in algebraic expressions of general base to some general exponent
PowTerm = Class(Symbolic, {

    constructor: function PowTerm(base, exp) {
        var self = this, p;
        if (!is_instance(self, PowTerm)) return new PowTerm(base, exp);

        if (is_instance(base, PowTerm))
        {
            self.base = base.base;
            self.exp = base.exp;
        }
        else if (is_instance(base, [INumber, Func]))
        {
            self.base = base;
            self.exp = is_instance(exp, [INumber, Func]) ? exp : Rational.cast(null == exp ? 1 : exp);
        }
        else if (is_string(base))
        {
            p = PowTerm.fromString(base, false);
            self.base = p[0];
            self.exp = p[1];
        }
        else
        {
            self.base = Complex.One();
            self.exp = Rational.One();
        }
    }

    ,__static__: {
        Symbol: SymbolTerm

        ,fromString: function(s, as_pow) {
            var i, b, e;
            s = trim(String(s));
            if (-1 !== (i=s.indexOf('^')))
            {
                e = s.slice(i+1);
                if (('{' === e.charAt(0)) && ('}' === e.charAt(e.length-1))) e = trim(e.slice(1,-1));
                s = s.slice(0, i);
            }
            else
            {
                e = '1';
            }
            b = SymbolTerm.fromString(trim(s));
            e = Rational.fromString(e);
            return false !== as_pow ? new PowTerm(b, e) : [b, e];
        }
    }

    ,base: null
    ,exp: null
    ,_str: null
    ,_tex: null

    ,dispose: function() {
        var self = this;
        self.base = null;
        self.exp = null;
        self._str = null;
        self._tex = null;
        return self;
    }

    ,c: function() {
        return Complex.One();
    }
    ,isConst: function() {
        var self = this;
        return self.base.isConst() && self.exp.isConst();
    }
    ,isReal: function() {
        var self = this;
        return self.base.isReal() && self.exp.isReal();
    }
    ,isImag: function() {
        var self = this;
        return self.base.isImag() && self.exp.isReal();
    }
    ,real: function() {
        var self = this;
        return PowTerm(self.base.real(), self.exp.real());
    }
    ,imag: function() {
        var self = this;
        return PowTerm(self.base.imag(), self.exp.imag());
    }

    ,equ: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return self.base.equ(a.base) && self.exp.equ(a.exp);
        else if (is_instance(a, [Func, SymbolTerm, Numeric]) || Arithmetic.isNumber(a))
            return self.base.equ(a) && self.exp.equ(Arithmetic.I);
        else if (is_instance(a, INumber))
            return a.equ(self);
        else if (is_string(a))
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return (self.exp.equ(a.exp) && self.base.gt(a.base)) || (self.base.equ(a.base) && self.exp.gt(a.exp));
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) && self.exp.gt(Arithmetic.I);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return (self.exp.equ(Arithmetic.I) && self.base.gt(a)) || (self.base.equ(a) && self.exp.gt(Arithmetic.I));
        else if (is_instance(a, INumber))
            return a.lt(self);
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return (self.exp.equ(a.exp) && self.base.gte(a.base)) || (self.base.equ(a.base) && self.exp.gte(a.exp));
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) && self.exp.gte(Arithmetic.I);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return (self.exp.equ(Arithmetic.I) && self.base.gte(a)) || (self.base.equ(a) && self.exp.gte(Arithmetic.I));
        else if (is_instance(a, INumber))
            return a.lte(self);
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return (self.exp.equ(a.exp) && self.base.lt(a.base)) || (self.base.equ(a.base) && self.exp.lt(a.exp));
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) && self.exp.lt(Arithmetic.I);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return (self.exp.equ(Arithmetic.I) && self.base.lt(a)) || (self.base.equ(a) && self.exp.lt(Arithmetic.I));
        else if (is_instance(a, INumber))
            return a.gt(self);
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return (self.exp.equ(a.exp) && self.base.lte(a.base)) || (self.base.equ(a.base) && self.exp.lte(a.exp));
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) && self.exp.lte(Arithmetic.I);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return (self.exp.equ(Arithmetic.I) && self.base.lte(a)) || (self.base.equ(a) && self.exp.lte(Arithmetic.I));
        else if (is_instance(a, INumber))
            return a.gte(self);
        return false;
    }

    ,abs: function() {
        var self = this;
        return is_instance(self.base, SymbolTerm) ? self : PowTerm(self.base.abs(), self.exp);
    }
    ,neg: function() {
        var self = this;
        return MulTerm(self, -1);
    }
    ,conj: function() {
        var self = this;
        return is_instance(self.base, SymbolTerm) ? self : PowTerm(self.base.conj(), self.exp);
    }
    ,inv: function() {
        var self = this;
        return PowTerm(self.base, self.exp.neg());
    }

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Numeric, SymbolTerm, PowTerm, MulTerm, Func]) || Arithmetic.isNumber(a))
            return Expr([self, a]);
        else if (is_instance(a, INumber))
            return a.add(self);
        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return Expr([self, Arithmetic.isNumber(a) ? Arithmetic.neg(a) : a.neg()]);
        else if (is_instance(a, [SymbolTerm, PowTerm, MulTerm, Func]))
            return Expr([self, a.neg()]);
        else if (is_instance(a, INumber))
            return a.neg().add(self);
        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return self.base.equ(a.base) ? PowTerm(self.base, self.exp.add(a.exp)) : MulTerm([self, a]);
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) ? PowTerm(self.base, self.exp.add(Arithmetic.I)) : MulTerm([self, a]);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return MulTerm(self, a);
        else if (is_instance(a, INumber))
            return a.mul(self);
        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, PowTerm))
            return self.base.equ(a.base) ? PowTerm(self.base, self.exp.sub(a.exp)) : MulTerm([self, a.inv()]);
        else if (is_instance(a, [Func, SymbolTerm]))
            return self.base.equ(a) ? PowTerm(self.base, self.exp.sub(Arithmetic.I)) : MulTerm([self, PowTerm(a, Rational.MinusOne())]);
        else if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            return MulTerm(self, Arithmetic.isNumber(a) ? Rational(Arithmetic.I, a) : a.inv());
        else if (is_instance(a, INumber))
            return a.inv().mul(self);
        return self;
    }
    ,pow: function(n) {
        var self = this;
        return PowTerm(self.base, self.exp.mul(n));
    }
    ,rad: function(n) {
        var self = this;
        return PowTerm(self.base, self.exp.div(n));
    }
    ,d: function(n) {
        // nth order formal derivative
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, d, k;
        if (null == n) n = 1;
        n = +n;
        if (0 > n) return null; // not supported
        k = self.exp.sub(n);
        if (self.exp.lt(O) || !is_instance(k, Numeric) || !k.isReal() || !k.isInt() || k.gte(O))
        {
            d = MulTerm(PowTerm(self.base, k), operate(function(f, i){
                return self.exp.sub(i).mul(f);
            }, Arithmetic.I, null, 0, n-1, 1));
        }
        else
        {
            d = MulTerm(1, O);
        }
        return d;
    }
    ,evaluate: function(symbolValues) {
        var self = this, Arithmetic = Abacus.Arithmetic, b, e;
        symbolValues = symbolValues || {};
        e = Rational.cast(is_instance(self.exp, Symbolic) ? self.exp.evaluate(symbolValues) : self.exp).simpl();
        b = Complex.cast(is_instance(self.base, Symbolic) ? self.base.evaluate(symbolValues) : self.base).simpl();
        return b.equ(Arithmetic.O) ? Complex.Zero() : b.pow(e.num).rad(e.den);
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (null == self._str)
            self._str = self.exp.equ(O) ? '1' : (self.exp.equ(Arithmetic.I) ? self.base.toString() : ((is_instance(self.base, SymbolTerm) ? self.base.toString() : '('+self.base.toString()+')') + (is_instance(self.exp, SymbolTerm)||(is_instance(self.exp, Numeric)&&self.exp.isReal())||(is_instance(self.exp, Poly)&&self.exp.isConst(true)&&self.exp.c().isReal()) ? ('^'+self.exp.toString(true)) : ('^('+self.exp.toString()+')'))));
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (null == self._tex)
            self._tex = self.exp.equ(O) ? '1' : (self.exp.equ(Arithmetic.I) ? self.base.toTex() : ((is_instance(self.base, SymbolTerm) ? self.base.toTex() : '('+self.base.toTex()+')') + ('^{'+self.exp.toTex()+'}')));
        return self._tex;
    }
});
