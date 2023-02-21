// Abacus.Expr, represents (symbolic) (linear) algebraic expressions of sums of (multiplicative) terms
AddTerm = Expr = Abacus.Expr = Class(Symbolic, {

    constructor: function Expr(/* args */) {
        var self = this, i, l,
            terms = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;

        if (!is_instance(self, Expr)) return new Expr(terms);

        self.terms = Obj();
        self.terms['1'] = MulTerm(1, Complex.Zero()); // constant term is default
        for (i=0,l=terms.length; i<l; i++) Expr.Merge(terms[i], self);
    }

    ,__static__: {
        Term: MulTerm

        ,Merge: function Merge(x, E) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
            if (Arithmetic.isNumber(x) || is_instance(x, Numeric))
            {
                if (E.terms['1'])
                {
                    E.terms['1'] = E.terms['1'].add(x);
                }
                else
                {
                    E.terms['1'] = MulTerm(1, x);
                }
            }
            else if (is_instance(x, [SymbolTerm, PowTerm, MulTerm]))
            {
                if (is_instance(x, SymbolTerm)) x = PowTerm(x, Arithmetic.I);
                if (is_instance(x, PowTerm)) x = MulTerm(x, Arithmetic.I);
                if (E.terms[x.symbol]) E.terms[x.symbol] = E.terms[x.symbol].add(x);
                else if (('1' === x.symbol) || !x.factors['1'].equ(O)) E.terms[x.symbol] = x;
                if ('1' !== x.symbol && E.terms[x.symbol] && E.terms[x.symbol].factors['1'].equ(O)) delete E.terms[x.symbol];
            }
            else if (is_instance(x, [Func]))
            {
                x = MulTerm(x, Arithmetic.I);
                if (E.terms[x.symbol]) E.terms[x.symbol] = E.terms[x.symbol].add(x);
                if ('1' !== x.symbol && E.terms[x.symbol] && E.terms[x.symbol].factors['1'].equ(O)) delete E.terms[x.symbol];
            }
            else if (is_instance(x, [Expr, Poly]))
            {
                if (is_instance(x, Poly)) x = x.toExpr();
                for (var i=0,keys=x.symbols(),l=keys.length; i<l; i++)
                    Merge(x.terms[keys[i]], E);
            }
            return E;
        }
        ,fromString: function(s) {
            var Arithmetic = Abacus.Arithmetic, terms = [], m, coeff, symbol, n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?(?:\s*\*\s*[a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?)*)?)?/g;
            s = trim(String(s));
            while ((m=term_re.exec(s)))
            {
                // try to do best possible match of given string of expressionl terms
                if (!m[0].length)
                {
                    if (term_re.lastIndex < s.length)
                    {
                        term_re.lastIndex++;
                        continue;
                    }
                    else
                    {
                        break; // match at least sth
                    }
                }
                if (!trim(m[0]).length) continue; // matched only spaces, continue

                if (m[2])
                {
                    symbol = m[2];
                    coeff = trim(m[1] || '');
                    if (('' === coeff) || ('+' === coeff) ) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                }
                else
                {
                    symbol = '1';
                    coeff = trim(m[1] || '');
                    if ('+' === coeff) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                    else if ('' === coeff) coeff = '0';
                }
                // accept generally complex coefficients
                n = Complex.fromString(coeff);
                if (!n || n.equ(Arithmetic.O)) continue;
                terms.push(MulTerm(symbol, n));
            }
            return new Expr(terms);
        }

        ,cast: null // added below
    }

    ,terms: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_symb: null

    ,dispose: function() {
        var self = this, t;
        if (self._n && (self._n._n===self)) self._n._n = null;
        /*if (self.terms)
        {
            for (t in self.terms)
                if (HAS.call(self.terms, t))
                    self.terms[t].dispose();
        }*/
        self.terms = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._symb = null;
        return self;
    }

    ,clone: function() {
        return new Expr(this.args());
    }

    ,symbols: function() {
        var self = this;
        if (null == self._symb) self._symb = KEYS(self.terms).sort();
        return self._symb;
    }
    ,args: function() {
        var self = this;
        return self.symbols().map(function(t){return self.terms[t];});
    }
    ,term: function(t) {
        var self = this;
        t = String(t);
        return HAS.call(self.terms, t) ? self.terms[t] : MulTerm('1', Complex.Zero());
    }
    ,c: function() {
        return this.terms['1'].c();
    }
    ,isConst: function() {
        var self = this;
        return 1===self.symbols().length;
    }
    ,isReal: function() {
        var self = this, terms = self.terms, t;
        for (t in terms)
        {
            if (!HAS.call(terms, t)) continue;
            if (!terms[t].isReal()) return false;
        }
        return true;
    }
    ,isImag: function() {
        var self = this, terms = self.terms, t;
        for (t in terms)
        {
            if (!HAS.call(terms, t)) continue;
            if (!terms[t].isImag()) return false;
        }
        return true;
    }
    ,real: function() {
        var self = this;
        return Expr(self.args().map(function(t){return t.real();}));
    }
    ,imag: function() {
        var self = this;
        return Expr(self.args().map(function(t){return t.imag();}));
    }
    ,equ: function (a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, l, keys;
        if (Arithmetic.isNumber(a) || is_instance(a, Numeric))
        {
            return (1 === self.symbols().length) && self.terms['1'].equ(a);
        }
        else if (is_instance(a, [SymbolTerm, PowTerm, MulTerm, Func]))
        {
            if (is_instance(a, [SymbolTerm, PowTerm, Func])) a = MulTerm(a, Arithmetic.I);
            return '1' === a.symbol ? ((1 === self.symbols().length) && self.terms['1'].equ(a)) : (HAS.call(self.terms, a.symbol) && (2 === self.symbols().length) && self.terms['1'].equ(O) && self.terms[a.symbol].equ(a));
        }
        else if (is_instance(a, [Expr, Poly]))
        {
            if (is_instance(a, Poly)) a = a.toExpr();
            keys = a.symbols(); l = keys.length;
            if (self.symbols().length !== l) return false;
            for (i=0; i<l; i++)
                if (!HAS.call(self.terms, keys[i]) || !a.terms[keys[i]].equ(self.terms[keys[i]]))
                    return false;
            return true;
        }
        else if (is_instance(a, RationalExpr))
        {
            return a.equ(self);
        }
        else if (is_string(a))
        {
            return (a === self.toString()) || (a === self.toTex());
        }
        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if (is_instance(a, Poly)) a = a.toExpr();
        if (is_instance(a, RationalExpr))
        {
            return a.lt(self);
        }
        else if (is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]))
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().gt(Arithmetic.O) : false;
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length))
        {
            return self.c().gt(a);
        }
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if (is_instance(a, Poly)) a = a.toExpr();
        if (is_instance(a, RationalExpr))
        {
            return a.lte(self);
        }
        else if (is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]))
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().gte(Arithmetic.O) : false;
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length))
        {
            return self.c().gte(a);
        }
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if (is_instance(a, Poly)) a = a.toExpr();
        if (is_instance(a, RationalExpr))
        {
            return a.gt(self);
        }
        else if (is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]))
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().lt(Arithmetic.O) : false;
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length))
        {
            return self.c().lt(a);
        }
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, r;
        if (is_instance(a, Poly)) a = a.toExpr();
        if (is_instance(a, RationalExpr))
        {
            return a.gte(self);
        }
        else if (is_instance(a, [Expr, Func, MulTerm, PowTerm, SymbolTerm]))
        {
            r = self.sub(a);
            return 1 === r.symbols().length ? r.c().lte(Arithmetic.O) : false;
        }
        else if ((is_instance(a, Numeric) || Arithmetic.isNumber(a)) && (1===self.symbols().length))
        {
            return self.c().lte(a);
        }
        return false;
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = Expr(self.args().map(function(t){return t.neg();}));
            self._n._n = self;
        }
        return self._n;
    }
    ,conj: function() {
        var self = this;
        return Expr(self.args().map(function(t){return t.conj();}));
    }
    ,inv: function() {
        return RationalExpr(1, this);
    }

    ,add: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, RationalExpr)) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func, Expr, Poly]) ? Expr([self, x]) : self;
    }
    ,sub: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x))
        {
            return self.add(Arithmetic.neg(x));
        }
        else if (is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func, Expr, Poly]))
        {
            if (is_instance(x, [SymbolTerm, PowTerm, Func])) x = MulTerm(x, Arithmetic.I);
            return self.add(x.neg());
        }
        else if (is_instance(x, RationalExpr))
        {
            return x.neg().add(self);
        }
        return self;
    }
    ,mul: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            symbols, symbols2;
        if (Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm, Func]))
        {
            if (is_instance(x, [SymbolTerm, PowTerm, Func])) x = MulTerm(x, Arithmetic.I);
            if (self.equ(O) || ((is_instance(x, [Numeric, MulTerm])) && x.equ(O)) || (Arithmetic.isNumber(x) && Arithmetic.equ(O, x))) return Expr();
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].mul(x);
            }));
        }
        else if (is_instance(x, [Expr, Poly]))
        {
            if (is_instance(x, Poly)) x = x.toExpr();
            if (self.equ(O) || x.equ(O)) return Expr();
            symbols = self.symbols(); symbols2 = x.symbols();
            return Expr(array(symbols.length*symbols2.length, function(k){
                var i = ~~(k/symbols2.length), j = k%symbols2.length;
                return self.terms[symbols[i]].mul(x.terms[symbols2[j]]);
            }));
        }
        else if (is_instance(x, RationalExpr))
        {
            return x.mul(self);
        }
        return self;
    }
    ,div: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, symbols;
        if (Arithmetic.isNumber(x) || is_instance(x, [Numeric, SymbolTerm, PowTerm, MulTerm]))
        {
            if (is_instance(x, [SymbolTerm, PowTerm])) x = MulTerm(x, Arithmetic.I);
            symbols = self.symbols();
            return Expr(array(symbols.length, function(i){
                return self.terms[symbols[i]].div(x);
            }));
        }
        else if (is_instance(x, RationalExpr))
        {
            return x.inv().mul(self);
        }
        return RationalExpr(self, x);
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented

    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, pow, e;
        n = Integer.cast(n);
        if (n.lt(O) || n.gt(MAX_DEFAULT)) return null;
        if (self.equ(O)) return Expr();
        if (n.equ(O)) return Expr([MulTerm(1, I)]);
        if (n.equ(I)) return self;
        n = Arithmetic.val(n.num);
        e = self; pow = Expr([MulTerm(1, I)]);
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
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, factors, f;
        n = Integer.cast(n);
        if (self.equ(O)) return Expr();
        if (n.equ(O)) return null; // undefined
        if (n.equ(I)) return self;
        return Expr(1===self.symbols().length ? self.terms['1'].rad(n) : MulTerm(PowTerm(self, Rational(I, n.num)), I));
    }
    ,d: function(x, n) {
        var self = this;
        // nth order formal derivative with respect to symbol x
        if (null == n) n = 1;
        n = +n;
        x = String(x || 'x');
        return 0 > n ? null : Expr(self.symbols().map(function(t){return '1' === t ? Abacus.Arithmetic.O : self.terms[t].d(x, n);}));
    }
    ,evaluate: function(symbolValues) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        symbolValues = symbolValues || {};
        return self.symbols().reduce(function(r, t){
            return r.add(self.terms[t].evaluate(symbolValues));
        }, Complex.Zero());
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            keys, i, l, t, f1, out = '', prev = false;
        if (null == self._str)
        {
            keys = self.symbols(); l = keys.length;
            for (i=0; i<l; i++)
            {
                t = self.terms[keys[i]];
                if (t.equ(O)) continue;
                f1 = t.c();
                out += (prev && (!f1.isReal()||f1.real().gt(O)) ? '+' : '') + t.toString();
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            keys, i, l, t, f1, out = '', prev = false;
        if (null == self._tex)
        {
            keys = self.symbols(); l = keys.length;
            for (i=0; i<l; i++)
            {
                t = self.terms[keys[i]];
                if (t.equ(O)) continue;
                f1 = t.c();
                out += (prev && (!f1.isReal()||f1.real().gt(O)) ? '+' : '') + t.toTex();
                prev = true;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
});
Expr.cast = typecast([Expr], function(a){
    return is_string(a) ? Expr.fromString(a) : new Expr(a);
});
