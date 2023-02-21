// Abacus.MultiPolynomial, represents a multivariate polynomial in sparse representation
MultiPolynomial = Abacus.MultiPolynomial = Class(Poly, {

    constructor: function MultiPolynomial(terms, symbol, ring) {
        var self = this, Arithmetic = Abacus.Arithmetic, index;

        if (!is_instance(self, MultiPolynomial)) return new MultiPolynomial(terms, symbol, ring);

        if (is_instance(terms, [SymbolTerm, PowTerm, MulTerm])) terms = Expr(terms);
        if (is_instance(terms, Expr)) terms = MultiPolynomial.fromExpr(terms, symbol||['x'], ring||Ring.C());

        if (is_instance(terms, MultiPolynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = symbol || terms.symbol;
            self.terms = (self.ring !== terms.ring) || (self.symbol.length !== terms.symbol.length) ? terms.terms.map(function(t){
                return MultiPolyTerm(t.c, self.symbol.length <= terms.symbol.length ? t.e.slice(0, self.symbol.length) : t.e.concat(array(self.symbol.length-terms.symbol.length, 0)), self.ring);
            }) : terms.terms.slice();
            self._rsym = terms._rsym ? terms._rsym.slice() : null;
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = is_array(symbol) && symbol.length ? symbol : [terms.symbol];
            index = self.symbol.indexOf(terms.symbol); if (-1 === index) index = 0;
            self.terms = terms.terms.map(function(t){
                return MultiPolyTerm(t.c, array(self.symbol.length, function(i){return i===index ? t.e : 0;}), self.ring);
            });
        }
        else
        {
            self.ring = is_instance(ring, Ring) ? ring : Ring.Q();

            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            else if (!symbol.length) symbol = ['x'];
            self.symbol = symbol;

            if (is_instance(terms, Numeric) || Arithmetic.isNumber(terms) || is_string(terms))
            {
                terms = MultiPolyTerm(terms, array(self.symbol.length, 0), self.ring);
            }

            if (is_instance(terms, MultiPolyTerm))
            {
                self.terms = terms.equ(Arithmetic.O) ? [] : [terms];
            }
            else if (is_array(terms) || is_args(terms))
            {
                if (is_args(terms)) terms = slice.call(terms);

                if (terms.length && !is_instance(terms[0], MultiPolyTerm))
                {
                    self.terms = terms.map(function(c, e){
                        return MultiPolyTerm(c, array(self.symbol.length, function(i){return 0===i ? e : 0;}), self.ring);
                    }).filter(MultiPolyTerm.isNonZero).reverse();
                }
                else
                {
                    self.terms = terms;
                }
            }
            else if (is_obj(terms))
            {
                self.terms = KEYS(terms).map(function(k){
                    var e = array(self.symbol.length, 0),
                        c = terms[k], factors = k.split('*'),
                        i, l, ind, mono, symbol, exp;
                    for (i=0,l=factors.length; i<l; i++)
                    {
                        mono = trim(factors[i]);
                        if (!mono.length || ('1' === mono))
                        {
                            // constant, do nothing
                        }
                        else
                        {
                            if (-1 !== (ind=mono.indexOf('^')))
                            {
                                symbol = mono.slice(0, ind);
                                exp = parseInt(mono.slice(ind+1), 10);
                            }
                            else
                            {
                                symbol = mono;
                                exp = 1;
                            }
                            ind = self.symbol.indexOf(symbol);
                            e[-1===ind?0:ind] = exp;
                        }
                    }
                    return MultiPolyTerm(c, e, self.ring);
                }).sort(MultiPolyTerm.sortDecr);
            }
            else
            {
                self.terms = [];
            }
        }
    }

    ,__static__: {
        Term: MultiPolyTerm

        ,Zero: function(symbol, ring) {
            return new MultiPolynomial([], symbol||['x'], ring||Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.One(), symbol||['x'], ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.MinusOne(), symbol||['x'], ring);
        }

        ,hasInverse: function() {
            return false;
        }
        ,cast: null // added below

        ,gcd: polygcd
        ,xgcd: polyxgcd
        ,lcm: polylcm

        ,Add: function(x, P, do_sub, recur) {
            var Arithmetic = Abacus.Arithmetic, res, rsym;
            if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

            if (is_instance(x, MultiPolynomial))
            {
                // O(max(n1,n2))
                if (x.terms.length)
                {
                    recur = (true===recur);
                    if (recur)
                    {
                        rsym = P._rsym;
                        P = P.recur(false);
                        x = x.recur(false);
                    }
                    P.terms = addition_sparse(P.terms, x.terms, MultiPolyTerm, true===do_sub, P.ring);
                    if (recur && rsym) P = P.recur(rsym);
                }
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                // O(1)
                x = MultiPolyTerm(x, array(P.symbol.length, 0), P.ring);
                if (!x.equ(Arithmetic.O))
                {
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], MultiPolyTerm, true===do_sub, P.ring) : [x];
                    P.terms = P.terms.concat(res);
                }
            }
            return P;
        }

        ,Mul: function(x, P, recur) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, rsym;
            if (!P.terms.length) return P;

            if (is_instance(x, Polynomial))
                x = MultiPolynomial(x, P.symbol, P.ring);

            if (is_instance(x, MultiPolynomial))
            {
                // O(n1*n2)
                if (x.terms.length)
                {
                    recur = (true===recur);
                    if (recur)
                    {
                        rsym = P._rsym;
                        P = P.recur(false);
                        x = x.recur(false);
                    }
                    P.terms = multiplication_sparse(P.terms, x.terms, MultiPolyTerm, P.ring);
                    if (recur && rsym) P = P.recur(rsym);
                }
                else
                {
                    P.terms = [];
                }
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                // O(n)
                /*if (Arithmetic.isNumber(x))*/ x = P.ring.cast(x);
                if (x.equ(O))
                {
                    P.terms = [];
                }
                else if (x.equ(Arithmetic.I))
                {
                    // do nothing
                }
                else
                {
                    for (i=P.terms.length-1; i>=0; i--)
                        P.terms[i] = P.terms[i].mul(x);
                }
            }
            return P;
        }

        ,Div: function(P, x, q_and_r, recur) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, rsym, q/*, r, d, diff, diff0*/;
            q_and_r = (true===q_and_r);

            if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

            if (is_instance(x, MultiPolynomial))
            {
                if (!x.terms.length) throw new Error('Division by zero in Abacus.MultiPolynomial!');

                recur = (true===recur);
                if (recur) x = x.recur(false); // convert to flat representation
                if (x.isConst())
                {
                    // constant polynomial, simple numeric division
                    x = x.cc();
                    q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i){
                        return P.terms[i].div(x);
                    }), P.symbol, P.ring);
                    return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
                }
                // sparse polynomial reduction/long division
                if (recur)
                {
                    rsym = P._rsym;
                    P = P.recur(false);
                }
                q = division_sparse(P.terms, x.terms, MultiPolyTerm, q_and_r, P.ring);
                q = q_and_r ? [MultiPolynomial(q[0], P.symbol, P.ring), MultiPolynomial(q[1], P.symbol, P.ring)] : MultiPolynomial(q, P.symbol, P.ring);
                if (recur && rsym)
                {
                    if (q_and_r) { q[0] = q[0].recur(rsym); q[1] = q[1].recur(rsym); }
                    else q = q.recur(rsym);
                }
                return q;
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                /*if (Arithmetic.isNumber(x))*/ x = P.ring.cast(x);
                if (x.equ(O)) throw new Error('Division by zero in Abacus.MultiPolynomial!');
                q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i){
                    return P.terms[i].div(x);
                }), P.symbol, P.ring);
                return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
            }
            return P;
        }

        ,C: function(c, x, ring) {
            return new MultiPolynomial(c || Abacus.Arithmetic.O, x||['x'], ring||Ring.Q());
        }

        ,fromExpr: function(e, x, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            x = x || ['x'];
            var symbols = e.symbols(), i, s, tc, O = Abacus.Arithmetic.O, terms = {};
            for (i=symbols.length-1; i>=0; i--)
            {
                s = symbols[i]; tc = e.terms[s].c();
                if (tc.equ(O)) continue;
                terms[s] = tc;
            }
            return new MultiPolynomial(terms, x, ring);
        }
        ,fromString: function(s, symbol, ring) {
            var Arithmetic = Abacus.Arithmetic, terms = {}, m, mm, coeff, sym, found_symbols = [], n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?(?:\s*\*?\s*[a-zA-Z](?:_\{?\d+\}?)?(?:\^\{?\d+\}?)?)*)?)?/g,
                monomial_re = /([a-zA-Z])(?:_\{?(\d+)\}?)?(?:\^\{?(\d+)\}?)?/g, monomials, ms, me, term;
            ring = ring || Ring.Q();
            s = trim(String(s)); if (!s.length) return MultiPolynomial.Zero(symbol||['x'], ring);
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
                    sym = m[2];
                    coeff = trim(m[1] || '');
                    if (('' === coeff) || ('+' === coeff) ) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                    monomials = {};
                    // split each monomial symbol from combined term
                    while ((mm=monomial_re.exec(sym)))
                    {
                        ms = mm[1]+(mm[2]?('_'+mm[2]):'');
                        me = mm[3] ? parseInt(mm[3], 10) : 1;
                        if (0 === me)
                        {
                            monomials['1'] = 0;
                        }
                        else
                        {
                            if (symbol && (-1===symbol.indexOf(ms))) continue;
                            if (!symbol && (-1===found_symbols.indexOf(ms))) found_symbols.push(ms);
                            monomials[ms] = HAS.call(monomials, ms) ? (monomials[ms]+me) : me;
                        }
                    }
                    if (HAS.call(monomials, '1') && (1<KEYS(monomials).length)) delete monomials['1'];
                }
                else
                {
                    sym = '1';
                    coeff = trim(m[1] || '');
                    if ('+' === coeff) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                    else if ('' === coeff) coeff = '0';
                    monomials = {};
                    monomials[sym] = 0;
                }
                n = Complex.fromString(coeff);
                term = operate(function(term, sym){
                    return term + (term.length ? '*' : '') + sym + (1<monomials[sym] ? ('^'+String(monomials[sym])) : '');
                }, '', KEYS(monomials).sort());
                if (term.length) terms[term] = HAS.call(terms, term) ? terms[term].add(n) : n;
            }
            operate(function(_, term){
                terms[term] = ring.cast(terms[term]);
                if (terms[term].equ(Arithmetic.O)) delete terms[term];
            }, null, KEYS(terms));
            return new MultiPolynomial(terms, symbol || found_symbols.sort(), ring);
        }
    }

    ,terms: null
    ,symbol: null
    ,ring: null
    ,_n: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_expr: null
    ,_prim: null
    ,_flat: null
    ,_recur: null
    ,_rsym: null

    ,dispose: function() {
        var self = this;
        self.terms = null;
        self.symbol = null;
        self.ring = null;
        if (self._n && (self===self._n._n))
        {
            self._n._n = null;
        }
        if (self._c && (self===self._c._c))
        {
            self._c._c = null;
        }
        self._n = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._expr = null;
        self._prim = null;
        self._flat = null;
        self._recur = null;
        self._rsym = null;
        return self;
    }
    ,isInt: function() {
        // has integer coefficients
        var self = this, terms = self.terms, i;
        if (is_class(self.ring.NumberClass, Integer)) return true;
        for (i=terms.length-1; i>=0; i--)
            if (!terms[i].c.isInt()) return false;
        return true;
    }
    ,isReal: function() {
        // has real coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return true;
        for (i=terms.length-1; i>=0; i--)
            if (!terms[i].c.isReal()) return false;
        return true;
    }
    ,isImag: function() {
        // has imaginary coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return false;
        for (i=terms.length-1; i>=0; i--)
            if (!terms[i].c.isImag()) return false;
        return true;
    }
    ,isMono: function() {
        // is monomial
        var terms = this.terms;
        return (1===terms.length) && ((!is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isMono()) && 0!==MultiPolyTerm.cmp(terms[0].e, [0]));
    }
    ,isConst: function(recur) {
        var terms = this.terms;
        recur = (true===recur);
        return (0===terms.length) || ((1===terms.length) && ((!recur || !is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isConst(recur)) && 0===MultiPolyTerm.cmp(terms[0].e, [0])));
    }
    ,isUni: function(x, strict) {
        // is univariate on symbol x
        var self = this, terms = self.terms, index, e, i, d;
        index = self.symbol.indexOf(String(x||'x'));
        if (-1 === index) return false;
        strict = (true===strict); d = 0;
        for (i=terms.length-1; i>=0; i--)
        {
            e = terms[i].e;
            d = stdMath.max(d, e[index]);
            if (0!==MultiPolyTerm.cmp(e.slice(0, index).concat(e.slice(index+1)), [0]))
                return false;
        }
        return strict ? (0!==d) : true;
    }
    ,isRecur: function(strict) {
        // is recursive, has coefficients that are multipolynomials on rest variables
        //return (null!=this._rsym) && (0<this._rsym.length);
        strict = false!==strict;
        var terms = this.terms, i;
        for (i=terms.length-1; i>=0; i--)
            if (is_instance(terms[i].c, MultiPolynomial) && (strict || !terms[i].c.isConst(true))) return true;
        return false;
    }
    ,deg: function(x, recur) {
        // polynomial degree
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if (arguments.length)
        {
            recur = (true===recur);
            index = symbol.indexOf(String(x||'x'));
            return (-1 === index) || !terms.length ? 0 : (recur && is_instance(term[0].c, MultiPolynomial) ? (terms[0].e[index]+term[0].c.deg(x, recur)) : terms[0].e[index]);
        }
        return terms.length ? terms[0].e : array(symbol.length, 0);
    }
    ,maxdeg: function(x, recur) {
        // polynomial maximum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true===recur);
        if (arguments.length && (true===x))
        {
            return operate(function(max, xi){
                return stdMath.max(max, self.maxdeg(xi));
            }, 0, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x||'x')) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(max, t){
            if (recur && is_instance(t.c, MultiPolynomial))
                return stdMath.max(max, t.e[index], t.e[index]+t.c.maxdeg(x, recur));
            else
                return stdMath.max(max, t.e[index]);
        }, 0, terms);
    }
    ,mindeg: function(x, recur) {
        // polynomial minimum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true===recur);
        if (arguments.length && (true===x))
        {
            return operate(function(min, xi){
                return -1 === min ? self.mindeg(xi, recur) : stdMath.min(min, self.mindeg(xi, recur));
            }, -1, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x||'x')) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(min, t){
            var deg = t.e[index]+(recur && is_instance(t.c, MultiPolynomial) ? t.c.mindeg(x, recur) : 0);
            return -1===min ? deg : stdMath.min(min, deg);
        }, -1, terms);
    }
    ,term: function(i, as_degree) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true===as_degree)
            return terms.reduce(function(matched, t){
                // amtch all terms which have i as aggregate degree
                if (i===t.e.reduce(addn, 0))
                    matched = matched.add(MultiPolynomial([t], symbol, ring));
                return matched;
            }, MultiPolynomial.Zero(symbol, ring));
        return MultiPolynomial(0<=i && i<terms.length ? [terms[i]] : [], symbol, ring);
    }
    ,ltm: function(asPoly, x) {
        // leading term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if (1 < arguments.length)
        {
            index = symbol.indexOf(String(x||'x'));
            if ((-1 === index) || !terms.length) return true===asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(max, t){
                if ((null == max) || (max.e[index] < t.e[index])) max = t;
                return max;
            }, null, terms);
            return true===asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if (true===asPoly) return MultiPolynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : MultiPolyTerm(0, array(symbol.length, 0), ring);
    }
    ,ttm: function(asPoly, x) {
        // tail/last term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if (1 < arguments.length)
        {
            index = symbol.indexOf(String(x||'x'));
            if ((-1 === index) || !terms.length) return true===asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(min, t){
                if ((null == min) || (min.e[index] > t.e[index])) min = t;
                return min;
            }, null, terms);
            return true===asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if (true===asPoly) return MultiPolynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
        return terms.length ? terms[terms.length-1] : MultiPolyTerm(0, array(symbol.length, 0), ring);
    }
    ,lm: function(x) {
        // leading monomial (per symbol)
        var self = this, lt = arguments.length ? self.ltm(false, x) : self.ltm(false);
        return lt.e;
    }
    ,lc: function(x) {
        // leading coefficient (per symbol)
        var self = this, lt = arguments.length ? self.ltm(false, x) : self.ltm(false);
        return lt.c;
    }
    ,tm: function(x) {
        // tail monomial (per symbol)
        var self = this, tt = arguments.length ? self.ttm(false, x) : self.ttm(false);
        return tt.e;
    }
    ,tc: function(x) {
        // tail coefficient (per symbol)
        var self = this, tt = arguments.length ? self.ttm(false, x) : self.ttm(false);
        return tt.c;
    }
    ,cc: function() {
        // constant coefficient
        var terms = this.terms;
        return terms.length && (0===MultiPolyTerm.cmp(terms[terms.length-1].e, [0])) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function() {
        // alias of cc()
        return this.cc();
    }
    ,recur: function(x) {
        var self = this, terms = self.terms, symbol = self.symbol, ring = self.ring,
            Arithmetic = Abacus.Arithmetic, index, maxdeg, pr, c = null;
        if (false === x)
        {
            // make non-recursive
            if (null == self._flat)
            {
                self._flat = (1 >= symbol.length) || !self.isRecur() ? self : operate(function(p, t){
                    return p._add(is_instance(t.c, MultiPolynomial) ? MultiPolynomial([MultiPolyTerm(ring.One(), t.e, ring)], symbol, ring)._mul(t.c.recur(false)) : MultiPolynomial([t], symbol, ring));
                }, MultiPolynomial.Zero(symbol, ring), terms);
                self._flat._rsym = null;
                self._flat._flat = self._flat;
            }
            return self._flat;
        }
        else if (true === x)
        {
            // make recursive on all variables succesively
            if (null == self._recur)
            {
                self._recur = 1 >= symbol.length ? self : operate(function(p, x){return p.recur(x);}, self.recur(false), symbol);
                self._recur._flat = self.recur(false);
                self._recur._recur = self._recur;
            }
            return self._recur;
        }
        else if (is_array(x))
        {
            return operate(function(p, xi){return p.recur(xi);}, self, x);
        }
        else if (x)
        {
            // make recursive on/group by symbol x
            // idempotent if is already grouped on x
            if (1 >= symbol.length) return self;
            x = String(x||'x'); index = symbol.indexOf(x);
            if ((-1 === index) || (self._rsym && (-1 !== self._rsym.indexOf(x)))) return self;
            /*if (self.isUni(x))
            {
                self._rsym = (self._rsym||[]).concat(x);
                return self;
            }*/
            maxdeg = self.maxdeg(x, true)
            if (0 === maxdeg)
            {
                self._rsym = (self._rsym||[]).concat(x);
                return self;
            }
            pr = MultiPolynomial(operate(function(terms, t){
                var e = t.e[index], i = maxdeg-e, tt, p;
                if (is_instance(t.c, MultiPolynomial))
                {
                    /*if ((0 < e) && (0 < t.c.maxdeg(x, true)))
                    {
                        // messed up, try to regroup
                        tt = t.clone();
                        tt.e[index] = 0;
                        tt.c = t.c.mul(MultiPolynomial([t], symbol, ring)).recur(x);
                        p = MultiPolynomial([tt], symbol, ring);
                    }
                    else */if (t.c.isUni(x))
                    {
                        // recursive on same
                        p = MultiPolynomial([t], symbol, ring);
                    }
                    else
                    {
                        // recursive on other
                        tt = t.clone();
                        tt.c = t.c.recur(x);
                        tt.e[index] = 0;
                        p = MultiPolynomial([tt], symbol, ring);
                    }
                }
                else if (0 !== e)
                {
                    tt = t.clone();
                    tt.e[index] = 0;
                    p = MultiPolynomial([tt], symbol, ring);
                }
                else
                {
                    p = MultiPolynomial([t], symbol, ring);
                }
                // group by same power/exponent of recursive symbol
                // put them directly in reverse order to avoid reversing later on
                terms[i] = terms[i] ? terms[i]._add(p) : p;
                return terms;
            }, new Array(maxdeg+1), terms).map(function(t, e){
                return t.equ(Arithmetic.O) ? null : MultiPolyTerm(t, array(symbol.length, function(i){return index===i ? maxdeg-e : 0;}));
            }).filter(MultiPolyTerm.isNonZero), symbol, ring);
            while (pr.isConst() && is_instance(c=pr.cc(), MultiPolynomial)) pr = c;
            if (c === pr) pr = pr.clone(); // copy it to avoid mutating existing poly
            pr._rsym = (self._rsym||[]).concat(x);
            return pr;
        }
        return self;
    }
    ,monic: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if (lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O) || is_instance(lc, MultiPolynomial)) return self;
        if (self.ring.isField())
        {
            return MultiPolynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring);
        }
        else
        {
            divides = true; t = self.terms;
            for (i=t.length-1; i>0; i--)
            {
                if (!lc.divides(t[i].c))
                {
                    divides = false;
                    break;
                }
            }
            // at least make positive
            return divides ? MultiPolynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring) : (lc.lt(Arithmetic.O) ? self.neg() : self);
        }
    }
    ,primitive: function(and_content) {
        // factorise into content and primitive part
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials#Primitive_part%E2%80%93content_factorization
        var self = this, symbol = self.symbol, ring = self.ring, field = ring.associatedField(), terms = self.terms,
            Arithmetic = Abacus.Arithmetic, coeffp, LCM, content, isReal, isImag;
        if (null == self._prim)
        {
            if (!terms.length)
            {
                self._prim = [self, field.One()];
            }
            else if (self.isRecur())
            {
                coeffp = terms.reduce(function(coeffp, t){
                    coeffp.push(is_instance(t.c, MultiPolynomial) ? t.c.primitive(true) : [MultiPolynomial([t], symbol, ring), field.One()]);
                    return coeffp;
                }, []);
                content = field.gcd(coeffp.map(function(c){return c[1];}));
                self._prim = [MultiPolynomial(coeffp.map(function(c, i){
                    return MultiPolyTerm(c[0].mul(ring.cast(c[1].div(content))), terms[i].e, ring);
                }), symbol, ring), content];
            }
            else if (is_class(ring.NumberClass, Complex))
            {
                    isReal = self.isReal(); isImag = self.isImag();
                    if (!isReal && !isImag)
                    {
                        content = ring.gcd(terms.map(function(t){return t.c;})).simpl();
                        self._prim = [MultiPolynomial(terms.map(function(t){return MultiPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
                    }
                    else if (isImag)
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.imag().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).imag().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
                    }
                    else
                    {
                        LCM = terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.real().den);}, Arithmetic.I);
                        coeffp = terms.map(function(t){return t.c.mul(LCM).real().num;});
                        content = gcd(coeffp);
                        coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                        // make positive lead
                        if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                        {
                            coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                            content = Arithmetic.neg(content);
                        }
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                    }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t){return Arithmetic.mul(LCM, t.c.den);}, Arithmetic.I);
                coeffp = terms.map(function(t){return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                // make positive lead
                if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                {
                    coeffp = coeffp.map(function(c){return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [MultiPolynomial(coeffp.map(function(c, i){return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true===and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function() {
        var p = this.primitive(true);
        return p[1];
    }
    ,equ: function(p, strict) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(p))
        {
            return Arithmetic.equ(O, p) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if (is_instance(p, Numeric))
        {
            return p.equ(O) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if (is_instance(p, Poly))
        {
            strict = (false!==strict);
            p = is_instance(p, Polynomial) ? MultiPolynomial(p, self.symbol, self.ring).terms : p;
            if (!strict)
            {
                t = self.recur(false).terms;
                p = p.recur(false);
            }
            tp = p.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; i--)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        else if (is_instance(p, RationalFunc))
        {
            return p.equ(self);
        }
        else if (is_instance(p, [SymbolTerm, PowTerm, MulTerm]))
        {
            if (is_instance(p, [SymbolTerm, PowTerm])) p = MulTerm(p);
            if (1 < t.length) return false;
            else if (0 === t.length) return p.c().equ(O);
            s = t[0].toTerm(self.symbol); if (!s.length) s = '1';
            return (s === p.symbol) && p.c().equ(t[0].c);
        }
        else if (is_instance(p, Expr))
        {
            return self.toExpr().equ(p);
        }
        else if (is_string(p))
        {
            return (p === self.toString()) || (p === self.toTex());
        }
        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            return !self.isConst(true) || self.cc().gt(a);
        }
        else if (is_instance(a, RationalFunc))
        {
            return a.lt(self);
        }
        else if (is_instance(a, Poly))
        {
            if (is_instance(a, Polynomial)) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0<MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]))
        {
            return self.toExpr().gt(a);
        }
        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            return !self.isConst(true) || self.cc().gte(a);
        }
        else if (is_instance(a, RationalFunc))
        {
            return a.lte(self);
        }
        else if (is_instance(a, Poly))
        {
            if (is_instance(a, Polynomial)) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0<=MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]))
        {
            return self.toExpr().gte(a);
        }
        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            return self.isConst(true) && self.cc().lt(a);
        }
        else if (is_instance(a, RationalFunc))
        {
            return a.gt(self);
        }
        else if (is_instance(a, Poly))
        {
            if (is_instance(a, Polynomial)) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0>MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]))
        {
            return self.toExpr().lt(a);
        }
        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
        {
            return self.isConst(true) && self.cc().lte(a);
        }
        else if (is_instance(a, RationalFunc))
        {
            return a.gte(self);
        }
        else if (is_instance(a, Poly))
        {
            if (is_instance(a, Polynomial)) a = MultiPolynomial(a, self.symbol, self.ring);
            return 0>=MultiPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [Expr, MulTerm, PowTerm, SymbolTerm]))
        {
            return self.toExpr().lte(a);
        }
        return false;
    }

    ,real: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
        {
            return MultiPolynomial(self.terms.map(function(t){
                return MultiPolyTerm(t.c.real(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return self;
        }
    }
    ,imag: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
        {
            return MultiPolynomial(self.terms.map(function(t){
                return MultiPolyTerm(t.c.imag(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return MultiPolynomial([], self.symbol, ring);
        }
    }
    ,abs: function() {
        var self = this;
        return self.lc().lt(Abacus.Arithmetic.O) ? self.neg() : self;
    }
    ,conj: function() {
        var self = this, ring = self.ring;
        if (null == self._c)
        {
            if (is_class(ring.NumberClass, Complex))
            {
                self._c = MultiPolynomial(self.terms.map(function(t){
                    return MultiPolyTerm(t.c.conj(), t.e, ring);
                }), self.symbol, ring);
                self._c._c = self;
            }
            else
            {
                self._c = self;
            }
        }
        return self._c;
    }
    ,neg: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._n)
        {
            self._n = MultiPolynomial(array(self.terms.length, function(i){return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().add(x);
        else if (is_instance(x, RationalFunc)) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Add(x, self.clone(), false, true) : self;
    }
    ,_add: function(x) {
        // add as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Add(x, self.clone(), false, false) : self.add(x);
    }
    ,sub: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().sub(x);
        else if (is_instance(x, RationalFunc)) return x.neg().add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Add(x, self.clone(), true, true) : self;
    }
    ,_sub: function(x) {
        // sub as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Add(x, self.clone(), true, false) : self.sub(x);
    }
    ,mul: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().mul(x);
        else if (is_instance(x, RationalFunc)) return x.mul(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Poly]) ? MultiPolynomial.Mul(x, self.clone(), true) : self;
    }
    ,_mul: function(x) {
        // mul as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Mul(x, self.clone(), false) : self.mul(x);
    }
    ,div: function(x, q_and_r) {
        var self = this;
        if (is_instance(x, RationalFunc)) return RationalFunc(self).div(x);
        else if (is_instance(x, [Numeric, Poly]) || Abacus.Arithmetic.isNumber(x))
            return MultiPolynomial.Div(self, x, true===q_and_r, true);
        return self;
    }
    ,_div: function(x, q_and_r) {
        // div as is without preserving any recursive representation
        var self = this;
        return is_instance(x, Poly) ? MultiPolynomial.Div(self, x, true===q_and_r, false) : self.div(x, q_and_r);
    }
    ,multidiv: function(xs, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, rsym = self._rsym, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true===q_and_r);
        if (is_instance(xs, MultiPolynomial)) xs = [xs];
        if (!xs || !xs.length) return q_and_r ? [[], self] : [];

        n = xs.length;
        qs = array(n, function(){return [];});
        r = [];
        p = self.recur(false).clone();
        xs = xs.map(function(xi){return xi.recur(false);});
        while (p.terms.length/*!p.equ(Arithmetic.O)*/)
        {
            // Try to divide by a polynomial.
            plt = p.ltm(); divides = false;
            for (i=0; i<n; i++)
            {
                xlt = xs[i].ltm();
                if (xlt.divides(plt))
                {
                    divides = true;
                    break;
                }
                // If the terms were not divisible, try the next polynomial.
            }
            if (divides)
            {
                // Perform the division.
                t = plt.div(xlt);
                qs[i] = addition_sparse(qs[i], [t], MultiPolyTerm, false, p.ring);
                p.terms = addition_sparse(p.terms, xs[i].terms.map(function(xt){return xt.mul(t);}), MultiPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if (q_and_r) r = addition_sparse(r, [plt], MultiPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi){
            qi = MultiPolynomial(qi, p.symbol, p.ring);
            if (rsym) qi = qi.recur(rsym);
            return qi;
        });
        if (q_and_r)
        {
            r = MultiPolynomial(r, p.symbol, p.ring);
            if (rsym) r = r.recur(rsym);
        }
        return q_and_r ? [qs, r] : qs;
    }
    ,mod: function(x) {
        var qr = this.div(x, true);
        return qr[1];
    }
    ,_mod: function(x) {
        var qr = this._div(x, true);
        return qr[1];
    }
    ,multimod: function(xs) {
        var qr = this.multidiv(xs, true);
        return qr[1];
    }
    ,divmod: function(x) {
        return this.div(x, true);
    }
    ,_divmod: function(x) {
        return this._div(x, true);
    }
    ,multidivmod: function(xs) {
        return this.multidiv(xs, true);
    }
    ,divides: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.equ(Arithmetic.O)) return false;
        if (is_instance(a, RationalFunc)) return true;
        if (is_instance(a, [Polynomial, Numeric]) || Arithmetic.isNumber(a))
            a = MultiPolynomial(a, self.symbol, self.ring);
        if (is_instance(a, MultiPolynomial))
            return a.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b, rsym = self._rsym;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 === n)
        {
            return MultiPolynomial.One(self.symbol, self.ring);
        }
        else if (1 === n)
        {
            return self;
        }
        else if (2 === n)
        {
            return MultiPolynomial.Mul(self, self.clone(), true);
        }
        else
        {
            // exponentiation by squaring
            pow = MultiPolynomial.One(self.symbol, self.ring);
            b = self.recur(false).clone();
            while (0 !== n)
            {
                if (n & 1) pow = MultiPolynomial.Mul(b, pow, false);
                n >>= 1;
                b = MultiPolynomial.Mul(b, b, false);
            }
            if (rsym) pow = pow.recur(rsym);
            return pow;
        }
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return polykthroot(self, n);
    }
    ,compose: function(q) {
        // composition through variation on recursive Horner scheme
        var self = this, symbol = self.symbol, ring = self.ring, rsym = self._rsym, pq,
            Arithmetic = Abacus.Arithmetic, O = MultiPolynomial.Zero(symbol, ring), horner, memo = Obj();
        horner = function horner(p, q, index) {
            index = index || 0;
            while ((index<symbol.length) && (0===p.maxdeg(symbol[index], true))) index++;
            if (index >= symbol.length) return MultiPolynomial(p.cc(), symbol, ring);
            var s, t = p.terms, i, j, pq, qi, tc;
            if (!t.length) return O;
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if (HAS.call(memo, s)) return memo[s];
            qi = HAS.call(q, symbol[index]) ? MultiPolynomial(q[symbol[index]]||Arithmetic.O, symbol, ring) : MultiPolynomial([MultiPolyTerm(ring.One(), array(symbol.length, function(i){return i===index ? 1 : 0}), ring)], symbol, ring);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, q, index+1) : MultiPolynomial(t[0].c, symbol, ring);
            i = t[0].e[index]; pq = tc; j = 1;
            while (0<i)
            {
                i--; pq = MultiPolynomial.Mul(qi, pq, false);
                if (j<t.length && i===t[j].e[index])
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, q, index+1) : t[j].c;
                    pq = MultiPolynomial.Add(tc, pq, false, false);
                    j++;
                }
            }
            memo[s] = pq;
            return pq;
        };
        pq = horner(self.recur(true), q||{});
        if (rsym) pq = pq.recur(rsym);
        return pq;
    }

    ,shift: function(x, s) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, symbol = self.symbol, ring = self.ring,
            Arithmetic = Abacus.Arithmetic, index;
        x = String(x || symbol[0]); s = s || 0;
        index = symbol.indexOf(x); if (-1===index) index = 0;
        x = symbol[index];
        s = Arithmetic.val(s);
        if (0 === s)
            return self;
        if (0 > s) // division by monomial x^|s|
        {
            if (-s > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
            return MultiPolynomial(self.terms.map(function(term){
                var k, e;
                term = term.clone();
                if (is_instance(term.c, MultiPolynomial))
                {
                    e = term.e[index]; k = s;
                    if (0 < e)
                    {
                        if (e >= -k)
                        {
                            term.e[index] += k;
                            k = 0;
                        }
                        else
                        {
                            term.e[index] = 0;
                            k += e;
                        }
                    }
                    if (0 > k)
                        term.c = term.c.shift(x, k);
                }
                else
                {
                    if (term.e[index] >= -s)
                        term.e[index] += s;
                    else
                        term.c = ring.Zero();
                }
                return term;
            }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        }
        //else if (0 < s) // multiplication by monomial x^s
        return MultiPolynomial(self.terms.map(function(term){
            term = term.clone();
            if (is_instance(term.c, MultiPolynomial))
            {
                if (0 < term.c.maxdeg(x, true))
                    term.c = term.c.shift(x, s);
                else
                    term.e[index] += s;
            }
            else
            {
                term.e[index] += s;
            }
            return term;
        }).sort(MultiPolyTerm.sortDecr), symbol, ring);
    }
    ,d: function(x, n) {
        // partial polynomial (formal) derivative of nth order with respect to symbol x
        var self = this, symbol = self.symbol, ring = self.ring, dp,
            Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, index;
        x = String(x || symbol[0]);
        if (null == n) n = 1;
        n = Arithmetic.val(n);
        if (0 > n) return null; // not supported
        else if (0 === n) return self;
        index = symbol.indexOf(x); if (-1===index) index = 0;
        x = symbol[index];
        if (n > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
        dp = MultiPolynomial(self.terms.map(function(term){
            var c, j;
            if (is_instance(term.c, MultiPolynomial))
            {
                if (term.c.isConst(true))
                {
                    if (n > term.e[index])
                    {
                        return null;
                    }
                    else
                    {
                        term = term.clone();
                        for (c=I,j=term.e[index]; j+n>term.e[index]; j--) c = Arithmetic.mul(c, j);
                        term.c = term.c._mul(c); term.e[index] -= n;
                        return term;
                    }
                }
                else
                {
                    term = term.clone(); j = n;
                    do{
                        j--;
                        term.c = term.c.d(x,1)._add(term.c._mul(term.e[index]));
                        term.e[index] = stdMath.max(term.e[index]-1, 0);
                    }while ((0 < j) && !term.c.equ(O))
                    return term;
                }
            }
            else
            {
                if (n > term.e[index])
                {
                    return null;
                }
                else
                {
                    term = term.clone();
                    for (c=I,j=term.e[index]; j+n>term.e[index]; j--) c = Arithmetic.mul(c, j);
                    term.c = term.c.mul(c); term.e[index] -= n;
                    return term;
                }
            }
        }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        return dp;
    }
    ,evaluate: function(x) {
        // recursive Horner scheme
        var self = this, symbol = self.symbol, ring = self.ring, O = Abacus.Arithmetic.O, horner, memo = Obj();
        horner = function horner(p, x, index) {
            index = index || 0;
            while ((index<symbol.length) && (0===p.maxdeg(symbol[index], true))) index++;
            if (index >= symbol.length) return p.cc();
            var s, t = p.terms, i, j, v, xi, tc;
            if (!t.length) return ring.Zero();
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if (HAS.call(memo, s)) return memo[s];
            xi = (HAS.call(x, symbol[index]) ? x[symbol[index]] : O) || O;
            //xi = ring.cast(xi);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, x, index+1) : t[0].c;
            i = t[0].e[index]; v = tc; j = 1;
            while (0<i)
            {
                i--; v = v.mul(xi);
                if (j<t.length && i===t[j].e[index])
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, x, index+1) : t[j].c;
                    v = tc.add(v);
                    j++;
                }
            }
            memo[s] = v;
            return v;
        };
        return horner(self.recur(true), x||{});
    }
    ,toString: function() {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if (null == self._str)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x);
                prev = true;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, true);
                prev = true;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        t = self.terms; x = self.symbol;
        for (i=0,l=t.length; i<l; i++)
        {
            ti = t[i];
            out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
            prev = true;
        }
        if (!out.length)
        {
            out = '0';
            if (is_number(precision) && 0<precision) out += '.'+(new Array(precision+1).join('0'));
        }
        return out;
    }
    ,toExpr: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, t, ti, x, i, l, term, terms;
        if (null == self._expr)
        {
            if (self.isRecur())
            {
                self._expr = self.recur(false).toExpr();
            }
            else
            {
                t = self.terms; x = self.symbol; terms = [];
                for (i=t.length-1; i>=0; i--)
                {
                    ti = t[i]; term = ti.toTerm(x, false, true);
                    terms.push(MulTerm(term.length ? term : '1', ti.c));
                }
                if (!terms.length) terms.push(MulTerm(1, O));
                self._expr = Expr(terms);
            }
        }
        return self._expr;
    }
});
MultiPolynomial.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast(function(a){
        return is_instance(a, MultiPolynomial) && (a.ring===ring);
    }, function(a){
        return is_string(a) ? MultiPolynomial.fromString(a, symbol, ring) : new MultiPolynomial(a, symbol, ring);
    });
    return type_cast(a);
};
