// Represents multiplicative terms in (linear) algebraic expressions, including terms with mixed factors of (powers of) symbolic variables
MulTerm = Class(Symbolic, {

    constructor: function MulTerm(s, c) {
        var self = this, Arithmetic = Abacus.Arithmetic, f, i, l;
        if (!is_instance(self, MulTerm)) return new MulTerm(s, c);

        if (is_instance(s, MulTerm))
        {
            c = s.factors['1'];
            self.symbol = s.symbol;
            self.symbolTex = s.symbolTex;
            s = s.factors;
            f = c;
            self.factors = Obj(); self.factors['1'] = f;
            if (!self.factors['1'].equ(Arithmetic.O)) MulTerm.Merge(s, self);
        }
        else if (is_instance(s, [SymbolTerm, Func, PowTerm]))
        {
            if (is_instance(s, [SymbolTerm, Func])) s = PowTerm(s, Arithmetic.I);
            f = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.symbol = s.toString();
            self.symbolTex = s.toTex();
            self.factors = Obj(); self.factors['1'] = f;
            if (!self.factors['1'].equ(Arithmetic.O)) MulTerm.Merge(s, self);
        }
        else if (is_instance(s, Numeric)/* || Arithmetic.isNumber(s)*/)
        {
            self.symbol = '1';
            self.symbolTex = '1';
            self.factors = Obj(); self.factors['1'] = Complex.cast(s);
        }
        else if (is_string(s))
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if (!self.factors['1'].equ(Arithmetic.O)) MulTerm.Merge(s, self);
            MulTerm.Symbol(self);
        }
        else if (is_array(s))
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if (!self.factors['1'].equ(Arithmetic.O))
            {
                for (i=0,l=s.length; i<l; i++)
                    MulTerm.Merge(s[i], self);
            }
            MulTerm.Symbol(self);
        }
        else if (is_obj(s))
        {
            c = Complex.cast(null == c ? Arithmetic.I : c); // default
            self.factors = Obj(); self.factors['1'] = c;
            if (!self.factors['1'].equ(Arithmetic.O)) MulTerm.Merge(s, self);
            MulTerm.Symbol(self);
        }
        else
        {
            self.factors = Obj();
            self.factors['1'] = Complex.cast(null == c ? Arithmetic.I : c); // default;
            MulTerm.Symbol(self);
        }
    }

    ,__static__: {
        Term: PowTerm

        ,Merge: function(factors, T, divide) {
            var Arithmetic = Abacus.Arithmetic,
                O = Arithmetic.O, I = Arithmetic.I,
                keys, i, l, parts;

            function merge_factor(f) {
                var sym;
                if (is_string(f))
                {
                    if (('1' === f) || !f.length) return; // handled elsewhere
                    f = PowTerm(f);
                }
                if (!is_instance(f, PowTerm)) return;

                sym = f.base.toString();
                if ('1' === sym) return; // handled elsewhere

                if (-1 === divide)
                {
                    if (!T.factors[sym]) T.factors[sym] = f.inv();
                    else T.factors[sym] = T.factors[sym].div(f);
                }
                else
                {
                    if (!T.factors[sym]) T.factors[sym] = f;
                    else T.factors[sym] = T.factors[sym].mul(f);
                }
                if (T.factors[sym].exp.equ(O)) delete T.factors[sym];
            };

            if (('1' === factors) || (1 === factors) || (Arithmetic.isNumber(factors) && Arithmetic.equ(I, factors)))
            {
                // skip, handled elsewhere
                //merge_factor(String(factors));
            }
            else if (is_instance(factors, [SymbolTerm, Func]))
            {
                merge_factor(PowTerm(factors, I));
            }
            else if (is_instance(factors, PowTerm))
            {
                merge_factor(factors);
            }
            else if (is_string(factors))
            {
                parts = factors.split('*'); // can be multiple factors eg i_1^2*i_2, split different factors on '*' op
                for (i=0,l=parts.length; i<l; i++)
                    merge_factor(PowTerm(parts[i]));
            }
            else if (is_array(factors) || is_args(factors))
            {
                for (i=0,l=factors.length; i<l; i++)
                    merge_factor(factors[i]);
            }
            else if (is_obj(factors))
            {
                for (keys=KEYS(factors),i=0,l=keys.length; i<l; i++)
                    merge_factor(is_instance(factors[keys[i]], PowTerm) ? factors[keys[i]] : PowTerm(keys[i], factors[keys[i]]));
            }
            return T;
        }
        ,Symbol: function(T) {
            var Arithmetic = Abacus.Arithmetic, I = Arithmetic.I, S;
            T._symb = null;
            S = T.symbols().reduce(function(s, f){
                var t = T.factors[f];
                return [
                s[0] + ('1' === f ? '' : ((s[0].length ? '*' : '') + t.toString())),
                s[1] + ('1' === f ? '' : t.toTex())
                ];
            }, ['','']);
            T.symbol = S[0]; T.symbolTex = S[1];
            if (!T.symbol.length) T.symbol = '1'; // default constant term
            if (!T.symbolTex.length) T.symbolTex = '1'; // default constant term
            return T;
        }
    }

    ,factors: null
    ,symbol: null
    ,symbolTex: null
    ,_str: null
    ,_tex: null
    ,_symb: null

    ,dispose: function() {
        var self = this;
        if (self._n && (self._n._n===self)) self._n._n = null;
        self.factors = null;
        self.symbol = null;
        self.symbolTex = null;
        self._str = null;
        self._tex = null;
        self._symb = null;
        return self;
    }

    ,symbols: function() {
        var self = this;
        if (null == self._symb) self._symb = KEYS(self.factors).sort();
        return self._symb;
    }
    ,c: function() {
        return this.factors['1'];
    }
    ,isConst: function() {
        var self = this;
        return '1'===self.symbol;
    }
    ,isReal: function() {
        var self = this, factors = self.factors, f;
        for (f in factors)
        {
            if (!HAS.call(factors, f)) continue;
            if (!factors[f].isReal()) return false;
        }
        return true;
    }
    ,isImag: function() {
        var self = this, factors = self.factors, f;
        for (f in factors)
        {
            if (!HAS.call(factors, f)) continue;
            if (!factors[f].isImag()) return false;
        }
        return true;
    }
    ,real: function() {
        var self = this;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].real();
            return factors;
        }, {}), self.factors['1'].real());
    }
    ,imag: function() {
        var self = this;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].imag();
            return factors;
        }, {}), self.factors['1'].imag());
    }
    ,equ: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (is_instance(a, SymbolTerm))
            return (a.sym === self.symbol) && self.factors['1'].equ(Arithmetic.I);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.equ(O, a) ? self.factors['1'].equ(O) : (('1' === self.symbol) && self.factors['1'].equ(a));
        else if (is_instance(a, Numeric))
            return a.equ(O) ? self.factors['1'].equ(O) : (('1' === self.symbol) && self.factors['1'].equ(a));
        else if (is_instance(a, [PowTerm, Func]))
            return (a.equ(O) && self.equ(O)) || ((self.symbol === a.toString()) && self.factors['1'].equ(Arithmetic.I));
        else if (is_instance(a, MulTerm))
            return (a.equ(O) && self.equ(O)) || ((self.symbol === a.symbol) && self.factors['1'].equ(a.factors['1']));
        else if (is_instance(a, INumber))
            return a.equ(self);
        else if (is_string(a))
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [SymbolTerm, PowTerm, Func])) a = MulTerm(a);
        if (is_instance(a, Expr))
        {
            return a.lt(self);
        }
        else if (is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol))
        {
            return self.c().gt(a.c());
        }
        else if (('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)))
        {
            return self.c().gt(a);
        }
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [SymbolTerm, PowTerm, Func])) a = MulTerm(a);
        if (is_instance(a, Expr))
        {
            return a.lte(self);
        }
        else if (is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol))
        {
            return self.c().gte(a.c());
        }
        else if (('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)))
        {
            return self.c().gte(a);
        }
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [SymbolTerm, PowTerm, Func])) a = MulTerm(a);
        if (is_instance(a, Expr))
        {
            return a.gt(self);
        }
        else if (is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol))
        {
            return self.c().lt(a.c());
        }
        else if (('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)))
        {
            return self.c().lt(a);
        }
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [SymbolTerm, PowTerm, Func])) a = MulTerm(a);
        if (is_instance(a, Expr))
        {
            return a.gte(self);
        }
        else if (is_instance(a, MulTerm) && ('1'===self.symbol) && ('1'===a.symbol))
        {
            return self.c().lte(a.c());
        }
        else if (('1' === self.symbol) && (is_instance(a, Numeric) || Arithmetic.isNumber(a)))
        {
            return self.c().lte(a);
        }
        return false;
    }

    ,abs: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].abs();
            return factors;
        }, {}), self.factors['1'].abs());
    }
    ,neg: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.factors, self.factors['1'].neg());
    }
    ,conj: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].conj();
            return factors;
        }, {}), self.factors['1'].conj());
    }
    ,inv: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].inv();
            return factors;
        }, {}), self.factors['1'].inv());
    }

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(a) || is_instance(a, Numeric))
            return MulTerm(self.factors, self.factors['1'].add(a));
        else if (is_instance(a, MulTerm))
            return self.symbol===a.symbol ? MulTerm(self.factors, self.factors['1'].add(a.factors['1'])) : Expr([self, a]);
        else if (is_instance(a, [Func, PowTerm, SymbolTerm]))
            return self.symbol===a.toString() ? MulTerm(self.factors, self.factors['1'].add(Arithmetic.I)) : Expr([self, MulTerm(a)]);
        else if (is_instance(a, [Expr, RationalExpr]))
            return a.add(self);
        else if (is_instance(a, Poly))
            return a.toExpr().add(self);
        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(a) || is_instance(a, Numeric))
            return MulTerm(self.factors, self.factors['1'].sub(a));
        else if (is_instance(a, MulTerm))
            return self.symbol===a.symbol ? MulTerm(self.factors, self.factors['1'].sub(a.factors['1'])) : Expr([self, a.neg()]);
        else if (is_instance(a, [Func, PowTerm, SymbolTerm]))
            return self.symbol===a.toString() ? MulTerm(self.factors, self.factors['1'].sub(Arithmetic.I)) : Expr([self, Multerm(a).neg()]);
        else if (is_instance(a, Expr))
            return Expr([self, a.neg()]);
        else if (is_instance(a, RationalExpr))
            return a.neg().add(self);
        else if (is_instance(a, Poly))
            return Expr([self, a.toExpr().neg()]);
        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, T, s;
        if (Arithmetic.isNumber(a) || is_instance(a, Numeric))
        {
            return MulTerm(self.factors, self.factors['1'].mul(a));
        }
        else if (is_instance(a, MulTerm))
        {
            T = MulTerm({},  self.factors['1'].mul(a.factors['1']));
            if (!T.factors['1'].equ(O))
            {
                MulTerm.Merge(self.factors, T);
                MulTerm.Merge(a.factors, T);
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if (is_instance(a, [Func, PowTerm, SymbolTerm]))
        {
            T = MulTerm({},  self.factors['1']);
            if (!T.factors['1'].equ(O))
            {
                MulTerm.Merge(self.factors, T);
                a = is_instance(a, SymbolTerm) ? PowTerm(a) : a;
                s = a.base.toString();
                if (!T.factors[s]) T.factors[s] = a;
                else T.factors[s] = T.factors[s].mul(a);
                if (T.factors[s].exp.equ(Arithmetic.O)) delete T.factors[s];
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if (is_instance(a, [Expr, RationalExpr]))
        {
            return a.mul(self);
        }
        else if (is_instance(a, Poly))
        {
            return a.toExpr().mul(self);
        }
        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, T;
        if (Arithmetic.isNumber(a) || is_instance(a, Numeric))
        {
            return MulTerm(self.factors, self.factors['1'].div(a));
        }
        else if (is_instance(a, MulTerm))
        {
            T = MulTerm({}, self.factors['1'].div(a.factors['1']));
            if (!T.factors['1'].equ(O))
            {
                MulTerm.Merge(self.factors, T);
                MulTerm.Merge(a.factors, T, -1);
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if (is_instance(a, [Func, PowTerm, SymbolTerm]))
        {
            T = MulTerm({},  self.factors['1']);
            if (!T.factors['1'].equ(O))
            {
                MulTerm.Merge(self.factors, T);
                a = is_instance(a, SymbolTerm) ? PowTerm(a) : a;
                s = a.base.toString();
                if (!T.factors[s]) T.factors[s] = a.inv();
                else T.factors[s] = T.factors[s].div(a);
                if (T.factors[s].exp.equ(Arithmetic.O)) delete T.factors[s];
            }
            MulTerm.Symbol(T);
            return T;
        }
        else if (is_instance(a, [Expr, RationalExpr]))
        {
            return self;
        }
        else if (is_instance(a, Poly))
        {
            return self;
        }
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented

    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if (self.equ(O)) return MulTerm(1, O);
        if (n.equ(O)) return MulTerm(1, I);
        if (n.equ(I)) return self;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].pow(n);
            return factors;
        }, {}), self.factors['1'].pow(n));
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if (self.equ(O)) return MulTerm(1, O);
        if (n.equ(O)) return null; // undefined
        if (n.equ(I)) return self;
        return MulTerm(self.symbols().reduce(function(factors, symbol){
            if ('1' !== symbol) factors[symbol] = self.factors[symbol].rad(n);
            return factors;
        }, {}), self.factors['1'].rad(n));
    }
    ,d: function(x, n) {
        // nth order formal derivative with respect to symbol x
        var self = this, factors = self.factors, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I,
            f, fac, c, d;
        if (null == n) n = 1;
        n = +n;
        x = String(x || 'x');
        if (0 > n) return null; // not supported
        if (factors['1'].equ(O) || ('1' === x) || !HAS.call(factors, x))
            return MulTerm({}, O);
        fac = {}; c = I;
        for (f in factors)
        {
            if (!HAS.call(factors, f) || ('1' === f)) continue;
            if (x === f)
            {
                d = factors[f].d(n);
                if (HAS.call(d.factors, f)) fac[f] = d.factors[f];
                c = d.c().mul(c);
            }
            else
            {
                fac[f] = factors[f];
            }
        }
        return MulTerm(fac, factors['1'].mul(c));
    }
    ,evaluate: function(symbolValues) {
        var self = this, Arithmetic = Abacus.Arithmetic,
            O = Arithmetic.O, I = Arithmetic.I, res;
        symbolValues = symbolValues || {};
        if ('1'===self.symbol) res = self.factors['1'];
        else res = self.symbols().reduce(function(r, f){
            return r.equ(O) ? Complex.Zero() : r.mul('1'===f ? self.factors['1'] : self.factors[f].evaluate(symbolValues));
        }, Complex.One());
        return res;
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, f1;
        if (null == self._str)
        {
            f1 = self.factors['1'];
            if (f1.equ(O))
                self._str = '0';
            else if (f1.isReal())
                self._str = ('1'===self.symbol) ? f1.real().toString() : ((f1.real().equ(Arithmetic.J) ? '-' : (f1.real().equ(Arithmetic.I) ? '' : (f1.real().toString(true)+'*'))) + self.symbol);
            else
                self._str = ('1'===self.symbol) ? ('('+f1.toString()+')') : (('('+f1.toString()+')*') + self.symbol);
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, f1;
        if (null == self._tex)
        {
            f1 = self.factors['1'];
            if (f1.equ(O))
                self._tex = '0';
            else if (f1.isReal())
                self._tex = ('1'===self.symbol) ? f1.real().toTex() : ((f1.real().equ(Arithmetic.J) ? '-' : (f1.real().equ(Arithmetic.I) ? '' : f1.real().toTex())) + self.symbolTex);
            else
                self._tex = ('1'===self.symbol) ? ('('+f1.toTex()+')') : (('('+f1.toTex()+')') + self.symbolTex);
        }
        return self._tex;
    }
});
