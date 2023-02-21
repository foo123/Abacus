// Abacus.Polynomial, represents a (univariate) polynomial (with Rational coefficients)
// in strict **non-zero sparse** coefficient representation in decreasing exponent order
Polynomial = Abacus.Polynomial = Class(Poly, {

    constructor: function Polynomial(terms, symbol, ring) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i;

        if (!is_instance(self, Polynomial)) return new Polynomial(terms, symbol, ring);

        if (is_instance(terms, [SymbolTerm, PowTerm, MulTerm])) terms = Expr(terms);
        if (is_instance(terms, Expr)) terms = Polynomial.fromExpr(terms, symbol||'x', ring||Ring.C());

        if (is_instance(terms, MultiPolynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || 'x');
            i = terms.symbol.indexOf(self.symbol); if (-1===i) i = 0;
            self.terms = terms.terms.map(function(t){
                return UniPolyTerm(t.c, t.e[i], self.ring);
            }).sort(UniPolyTerm.sortDecr).reduce(function(terms, t){
                if (!terms.length || (terms[terms.length-1].e!==t.e)) terms.push(t);
                else terms[terms.length-1] = terms[terms.length-1].add(t);
                return terms;
            }, []).filter(UniPolyTerm.isNonZero);
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || terms.symbol);
            self.terms = self.ring !== terms.ring ? terms.terms.map(function(t){
                return UniPolyTerm(t.c, t.e, self.ring);
            }) : terms.terms.slice();
        }
        else
        {
            self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
            self.symbol = String(symbol || 'x');

            if (is_instance(terms, Numeric) || Arithmetic.isNumber(terms) || is_string(terms))
            {
                terms = UniPolyTerm(terms, 0, self.ring);
            }

            // sparse coefficient representation sorted by decreasing exponents, ie coeff[0] is highest exponent
            if (is_instance(terms, UniPolyTerm))
            {
                self.terms = terms.c.equ(O) ? [] : [terms];
            }
            else if (is_array(terms) || is_args(terms))
            {
                if (terms.length && !is_instance(terms[0], UniPolyTerm))
                {
                    // dense representation, array with all powers
                    // convert to sparse representation in decreasing order
                    self.terms = array(terms.length, function(i){return UniPolyTerm(terms[i], i, self.ring);}).filter(UniPolyTerm.isNonZero).reverse();
                }
                else
                {
                    self.terms = is_args(terms) ? slice.call(terms) : terms;
                }
            }
            else if (is_obj(terms))
            {
                // sparse representation as object with keys only to existing powers
                // convert to sparse coefficient representation in decreasing order
                self.terms = KEYS(terms).map(function(e){
                    return UniPolyTerm(terms[e], e, self.ring);
                })/*.filter(UniPolyTerm.isNonZero)*/.sort(UniPolyTerm.sortDecr);
            }
            else
            {
                self.terms = [];
            }
        }
    }

    ,__static__: {
        Term: UniPolyTerm
        ,Piecewise: PiecewisePolynomial

        ,Zero: function(symbol, ring) {
            return new Polynomial([], symbol||'x', ring||Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.One(), symbol||'x', ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.MinusOne(), symbol||'x', ring);
        }
        ,hasInverse: function() {
            return false;
        }

        ,cast: null // added below

        ,Add: function(x, P, do_sub) {
            var Arithmetic = Abacus.Arithmetic, res, symbol;
            // O(max(n1,n2))
            if (is_instance(x, Polynomial))
            {
                if (x.symbol === P.symbol)
                {
                    // O(max(n1,n2))
                    if (x.terms.length)
                        P.terms = addition_sparse(P.terms, x.terms, UniPolyTerm, true===do_sub, P.ring);
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Add(MultiPolynomial(x, symbol, P.ring), MultiPolynomial(P, symbol, P.ring), do_sub);
                }
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                // O(1)
                x = UniPolyTerm(x, 0, P.ring);
                if (!x.equ(Arithmetic.O))
                {
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], UniPolyTerm, true===do_sub, P.ring) : [x];
                    P.terms = P.terms.concat(res);
                }
            }
            return P;
        }

        ,Mul: function(x, P) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i, symbol;
            if (!P.terms.length) return P;

            if (is_instance(x, Polynomial))
            {
                if (x.symbol === P.symbol)
                {
                    // O(n1*n2)
                    P.terms = x.terms.length ? multiplication_sparse(P.terms, x.terms, UniPolyTerm, P.ring) : [];
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Mul(MultiPolynomial(x, symbol, x.ring), MultiPolynomial(P, symbol, P.ring));
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

        ,Div: function(P, x, q_and_r) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, symbol, q/*, r, d, diff, diff0*/;
            q_and_r = (true===q_and_r);

            if (is_instance(x, Polynomial))
            {
                if (!x.terms.length) throw new Error('Division by zero in Abacus.Polynomial!');
                if (x.isConst())
                {
                    // constant polynomial, simple numeric division
                    x = x.cc();
                    q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i){
                        return P.terms[i].div(x);
                    }), P.symbol, P.ring);
                    return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
                }
                // polynomial long division
                // TODO: make it faster
                /*r = Polynomial(P);
                diff = r.deg()-x.deg();
                if (0 <= diff)
                {
                    q = array(diff+1, function(){return Rational.Zero();});
                    while (0 <= diff)
                    {
                        diff0 = diff;
                        d = x.shift(diff);
                        q[diff] = r.lc().div(d.lc());
                        r = Polynomial.Add(Polynomial.Mul(q[diff], d), r, true);
                        diff = r.deg()-x.deg();
                        if ((diff === diff0)) break; // remainder won't change anymore
                    }
                }
                else
                {
                    q = [];
                }
                q = Polynomial(q, self.symbol);*/

                if (x.symbol === P.symbol)
                {
                    // sparse polynomial reduction/long division
                    q = division_sparse(P.terms, x.terms, UniPolyTerm, q_and_r, P.ring);
                    return q_and_r ? [Polynomial(q[0], P.symbol, P.ring), Polynomial(q[1], P.symbol, P.ring)] : Polynomial(q, P.symbol, P.ring);
                }
                else
                {
                    // upgrade to multivariate polynomial
                    symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
                    return MultiPolynomial.Div(MultiPolynomial(P, symbol, P.ring), MultiPolynomial(x, symbol, x.ring), q_and_r);
                }
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                /*if (Arithmetic.isNumber(x))*/ x = P.ring.cast(x);
                if (x.equ(O)) throw new Error('Division by zero in Abacus.Polynomial!');
                q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i){
                    return P.terms[i].div(x);
                }), P.symbol, P.ring);
                return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
            }
            return P;
        }

        ,C: function(c, x, ring) {
            return new Polynomial(c || Abacus.Arithmetic.O, x||'x', ring||Ring.Q());
        }

        ,gcd: polygcd
        ,xgcd: polyxgcd
        ,lcm: polylcm

        ,bezier: function(points, symbol) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Recursive_definition
            // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
            symbol = String(symbol||'x');
            var ring = Ring.Q(), Bezier = Polynomial.Zero(symbol, ring), n, i, b0, b1, b11;
            if (is_array(points) && points.length)
            {
                n = points.length;
                b11 = Polynomial([1, -1], symbol, ring);
                b0 = Polynomial.One(symbol, ring).shift(n-1);
                b1 = Polynomial.One(symbol, ring);
                Bezier = Bezier.add(b0.mul(ring.cast(points[n-1])));
                for (i=n-2; i>=0; i--)
                {
                    b0 = b0.shift(-1); b1 = b1.mul(b11);
                    Bezier = Bezier.add(b1.mul(b0).mul(factorial(n-1,i)).mul(ring.cast(points[i])));
                }
            }
            return Bezier;
        }

        ,bezierThrough: function(knots, symbol) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
            // https://www.particleincell.com/2012/bezier-splines/
            // https://stackoverflow.com/questions/7715788/find-bezier-control-points-for-curve-passing-through-n-points
            symbol = String(symbol||'x');
            var ring = Ring.Q(), i, computePoints, points, segments;
            computePoints = function(knots) {
                var i, p1, p2, a, b, c, r, m, n = knots.length-1;
                p1 = new Array(n);
                p2 = new Array(n);

                /*rhs vector*/
                a = new Array(n);
                b = new Array(n);
                c = new Array(n);
                r = new Array(n);

                /*left most segment*/
                a[0] = ring.Zero();
                b[0] = ring.create(2);
                c[0] = ring.One();
                r[0] = knots[0].add(knots[1].mul(2));

                /*internal segments*/
                for (i=1; i<n-1; i++)
                {
                    a[i] = ring.One();
                    b[i] = ring.create(4);
                    c[i] = ring.One();
                    r[i] = knots[i].mul(4).add(knots[i+1].mul(2));
                }

                /*right segment*/
                a[n-1] = ring.create(2);
                b[n-1] = ring.create(7);
                c[n-1] = ring.Zero();
                r[n-1] = knots[n-1].mul(8).add(knots[n]);

                /*solves Ax=b with the Thomas algorithm (from Wikipedia)*/
                for (i=1; i<n; i++)
                {
                    m = a[i].div(b[i-1]);
                    b[i] = b[i].sub(m.mul(c[i - 1]));
                    r[i] = r[i].sub(m.mul(r[i-1]));
                }

                p1[n-1] = r[n-1].div(b[n-1]);
                for (i=n-2; i>=0; --i)
                    p1[i] = r[i].sub(c[i].mul(p1[i+1])).div(b[i]);

                /*we have p1, now compute p2*/
                for (i=0;i<n-1;i++)
                    p2[i] = knots[i+1].mul(2).sub(p1[i+1]);
                p2[n-1] = knots[n].add(p1[n-1]).div(2);

                return [p1, p2];
            };
            if (is_array(knots) && knots.length)
            {
                knots = ring.cast(knots);
                if (1 === knots.length)
                {
                    segments = [Polynomial(knots[0], symbol, ring)];
                }
                else if (2 === knots.length)
                {
                    segments = [Polynomial.bezier([knots[0], knots[1]], symbol)];
                }
                else
                {
                    segments = [];
                    points = computePoints(knots);
                    for (i=0; i<knots.length-1; i++)
                        segments.push(Polynomial.bezier([knots[i], points[0][i], points[1][i], knots[i+1]], symbol));
                }
                return Polynomial.Piecewise(segments, 0, symbol, ring);
            }
            return Polynomial.Piecewise([Polynomial.Zero(symbol, ring)], 0, symbol, ring);
        }

        ,fromValues: function(v, x, ring) {
            // https://en.wikipedia.org/wiki/Lagrange_polynomial
            // https://en.wikipedia.org/wiki/Newton_polynomial
            ring = ring || Ring.Q();
            var I = ring.One(), n, d, f, vi, hash, dupl;
            x = String(x || 'x');
            if (!v || !v.length) return Polynomial([], x, ring);
            if (is_args(v)) v = slice.call(v);
            if (!is_array(v[0])) v = [v];
            v = v.map(function(vi){
                return [ring.cast(vi[0]), ring.cast(vi[1])];
            });
            // check and filter out duplicate values
            hash = Obj(); dupl = [];
            for (n=0; n<v.length; n++)
            {
                vi = v[n][0].toString();
                if (!HAS.call(hash, vi)) hash[vi] = n;
                else if (!v[hash[vi]][1].equ(v[n][1])) return null; // no polynomial exists
                else dupl.push(n); // duplicate value to be removed
            }
            // remove duplicate values
            while (dupl.length) v.splice(dupl.pop(), 1);
            hash = null; dupl = null; n = v.length;

            // Set-up denominators
            d = array(n, function(j){
                var i, dj = I;
                for (i=0; i<n; i++)
                {
                    if (i===j) continue;
                    dj = dj.mul(v[j][0].sub(v[i][0]));
                }
                dj = v[j][1].div(dj);
                return dj;
            });
            // Set-up numerator factors
            f = array(n, function(i){
                return Polynomial([v[i][0].neg(), I], x, ring);
            });
            // Produce each Lj in turn, and sum into p
            return operate(function(p, j){
                return Polynomial.Add(operate(function(Lj, i){
                    if (j !== i) Lj = Polynomial.Mul(f[i], Lj);
                    return Lj;
                }, Polynomial(d[j], x, ring), null, 0, n-1), p);
            }, Polynomial.Zero(x, ring), null, 0, n-1);
        }

        ,fromExpr: function(e, x, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            x = String(x || 'x');
            var symbols = e.symbols(), i, s, tc, O = Abacus.Arithmetic.O, terms = {};
            for (i=symbols.length-1; i>=0; i--)
            {
                s = symbols[i]; tc = e.terms[s].c();
                if (tc.equ(O)) continue;
                if (('1' === s))
                    terms['0'] = tc;
                else if ((x === s))
                    terms['1'] = tc;
                else if ((s.length > x.length+1) && (x+'^' === s.slice(0, x.length+1)) && (-1===s.indexOf('*')))
                    terms[s.slice(x.length+1)] = tc;
            }
            return new Polynomial(terms, x, ring);
        }
        ,fromString: function(s, symbol, ring) {
            var Arithmetic = Abacus.Arithmetic, terms = {}, _symbol = null, m, coeff, exp, sym, n, i,
                term_re = /(\(?(?:(?:[\+\-])?\s*\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))?\)?)(?:\s*(?:[\+\-])?\s*(?:\(?(?:(?:\\frac\{\-?\d+\}\{\-?\d+\})|(?:\-?\d+(?:\.\d*(?:\[\d+\])?)?(?:e-?\d+)?(?:\/\-?\d+)?))\)?\*?)?(?:[ij]))?\)?)?(?:\s*\*?\s*([a-zA-Z](?:_\{?\d+\}?)?)(?:\^\{?(\d+)\}?)?)?/g;
            ring = ring || Ring.Q();
            s = trim(String(s)); if (!s.length) return Polynomial.Zero(symbol||'x', ring);
            while ((m=term_re.exec(s)))
            {
                // try to do best possible match of given string of polynomial terms
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
                    if (-1 !== (i=sym.indexOf('_')))
                    {
                        if ('{' === sym.charAt(i+1) && '}' === sym.charAt(sym.length-1))
                            sym = sym.slice(0,i+1)+sym.slice(i+2,-1);
                    }
                    if (symbol && (sym !== symbol))
                    {
                        continue; // does not belong to same polynomial, has different symbol
                    }
                    else if (!symbol)
                    {
                        if (null == _symbol)
                        {
                            _symbol = sym;
                        }
                        else if (sym !== _symbol)
                        {
                            continue; // does not belong to same polynomial, has different symbol
                        }
                    }
                    exp = m[3] || '1';
                    coeff = trim(m[1] || '');
                    if (('' === coeff) || ('+' === coeff) ) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                }
                else
                {
                    exp = '0';
                    coeff = trim(m[1] || '');
                    if ('+' === coeff) coeff = '1';
                    else if ('-' === coeff) coeff = '-1';
                    else if ('' === coeff) coeff = '0';
                }
                i = 0;
                while (i<exp.length && ('0'===exp.charAt(i))) i++;
                if (0<i) exp = i<exp.length ? exp.slice(i) : '0';
                n = Complex.fromString(coeff);
                terms[exp] = terms[exp] ? terms[exp].add(n) : n;
            }
            operate(function(_, exp){
                terms[exp] = ring.cast(terms[exp]);
                if (terms[exp].equ(Arithmetic.O)) delete terms[exp];
            }, null, KEYS(terms));
            return new Polynomial(terms, symbol || _symbol, ring);
        }
    }

    ,terms: null
    ,symbol: null
    ,ring: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_expr: null
    ,_prim: null
    ,_roots: null
    ,_factors: null

    ,dispose: function() {
        var self = this;
        if (self._n && (self._n._n===self))
        {
            self._n._n = null;
        }
        if (self._c && (self._c._c===self))
        {
            self._c._c = null;
        }
        self.terms = null;
        self.symbol = null;
        self.ring = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._c = null;
        self._expr = null;
        self._prim = null;
        self._roots = null;
        self._factors = null;
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
        return (1===terms.length) && (0!==terms[0].e);
    }
    ,isConst: function() {
        return 0===this.deg();
    }
    ,isUni: function(x, strict) {
        var self = this;
        x = String(x||'x');
        if (self.symbol !== x) return false;
        return true===strict ? (0!==self.deg()) : true;
    }
    ,deg: function() {
        // polynomial degree
        var terms = this.terms;
        return terms.length ? terms[0].e : 0;
    }
    ,maxdeg: function() {
        // maximum polynomial degree
        return this.deg();
    }
    ,mindeg: function() {
        // minimum polynomial degree
        var terms = this.terms;
        //return terms.length ? (0===terms[terms.length-1].e ? (1<terms.length ? terms[terms.length-2].e : 0) : terms[terms.length-1].e) : 0;
        return terms.length ? terms[terms.length-1].e : 0;
    }
    ,term: function(i, as_degree) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true===as_degree)
            return Polynomial(terms.reduce(function(matched, t){return i===t.e ? [t] : matched;}, []), symbol, ring);
        return Polynomial(0<=i && i<terms.length ? [terms[i]] : [], symbol, ring);
    }
    ,ltm: function(asPoly) {
        // leading term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true===asPoly) return Polynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : UniPolyTerm(0, 0, ring);
    }
    ,ttm: function(asPoly) {
        // tail/last term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true===asPoly) return Polynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
        return terms.length ? terms[terms.length-1] : UniPolyTerm(0, 0, ring);
    }
    ,lm: function() {
        // leading monomial
        return this.ltm(false).e;
    }
    ,lc: function() {
        // leading coefficient
        return this.ltm(false).c;
    }
    ,tm: function() {
        // tail monomial
        return this.ttm(false).e;
    }
    ,tc: function() {
        // tail coefficient
        return this.ttm(false).c;
    }
    ,cc: function() {
        // constant coefficient
        var terms = this.terms;
        return terms.length && (0===terms[terms.length-1].e) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function() {
        // alias of cc()
        return this.cc();
    }
    ,monic: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if (lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O)) return self;
        if (self.ring.isField())
        {
            return Polynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring);
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
            return divides ? Polynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring) : (lc.lt(Arithmetic.O) ? self.neg() : self);
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
            else if (is_class(ring.NumberClass, Complex))
            {
                    isReal = self.isReal(); isImag = self.isImag();
                    if (!isReal && !isImag)
                    {
                        content = ring.gcd(terms.map(function(t){return t.c;})).simpl();
                        self._prim = [Polynomial(terms.map(function(t){return UniPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
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
                        self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
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
                        self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
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
                self._prim = [Polynomial(coeffp.map(function(c, i){return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true===and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function() {
        var p = this.primitive(true);
        return p[1];
    }
    ,roots: function() {
        // find all rational roots, if any
        // https://en.wikipedia.org/wiki/Rational_root_theorem
        // https://en.wikipedia.org/wiki/Gauss%27s_lemma_(polynomial)
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            roots, primitive, c, p, d0, dn, iter, comb, root, nroot, rm, nrm, found;

        if (null == self._roots)
        {
            roots = [];
            // no rational roots or infinite roots for constant polynomials,
            // no rational roots for strictly complex polynomials
            if (!self.isConst() && (self.isImag() || self.isReal()))
            {
                primitive = self.primitive();
                c = primitive.terms;
                if (0<c[c.length-1].e)
                {
                    roots.push([Rational.Zero(), c[c.length-1].e]); // zero root with multiplicity
                }
                if (1<c.length)
                {
                    // try all possible rational divisors of c_0(excluding trivial zero terms) and c_n
                    /*if (primitive.isImag()) // this never happens for primitive as imaginary unit "i" has been factored out unto content
                    {
                        iter = divisors(c[c.length-1].c.imag().num, true);
                        d0 = iter.get(); iter.dispose();
                        iter = divisors(c[0].c.imag().num, true);
                        dn = iter.get(); iter.dispose();
                    }
                    else
                    {*/
                        iter = divisors(is_class(ring.NumberClass, Complex) ? c[c.length-1].c.real().num : c[c.length-1].c.num, true);
                        d0 = iter.get(); iter.dispose();
                        iter = divisors(is_class(ring.NumberClass, Complex) ? c[0].c.real().num : c[0].c.num, true);
                        dn = iter.get(); iter.dispose();
                    /*}*/

                    iter = Tensor([d0.length, dn.length]);
                    while (iter.hasNext())
                    {
                        comb = iter.next();
                        // positive root
                        root = Rational(d0[comb[0]], dn[comb[1]]).simpl();
                        // negative root
                        nroot = Rational(Arithmetic.neg(d0[comb[0]]), dn[comb[1]]).simpl();
                        rm = 0; nrm = 0;
                        p = primitive; found = true;
                        while (found && (0<p.deg()))
                        {
                            found = false;
                            // try positive root
                            if (p.evaluate(root).equ(O))
                            {
                                rm++; // count multiplicity
                                found = true;
                            }
                            // try negative root
                            if (p.evaluate(nroot).equ(O))
                            {
                                nrm++; // count multiplicity
                                found = true;
                            }
                            if (found) p = p.d(); // get derivative to check if roots are multiple
                        }
                        if (0<rm) roots.push([root, rm]);
                        if (0<nrm) roots.push([nroot, nrm]);
                    }
                    iter.dispose();
                }
            }
            self._roots = roots;
        }
        return self._roots.map(function(r){return r.slice();});
    }
    ,factors: function() {
        // factorise polynomial over Integers/Rationals if factorisable
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials
        var p = this, ring = p.ring, symbol = p.symbol, Arithmetic = Abacus.Arithmetic,
            constant, factors, factor, root, i, n, m, remainder, roots;
        if (null == p._factors)
        {
            remainder = p.primitive(true);
            roots = p.roots();
            constant = remainder[1];
            remainder = remainder[0];
            factors = [];
            if (roots.length)
            {
                for (i=0,n=roots.length; i<n; i++)
                {
                    root = roots[i];
                    // use integer coefficients
                    factor = Polynomial([Arithmetic.neg(root[0].num), root[0].den], symbol, ring);
                    factors.push([factor, root[1]]);
                    remainder = remainder.div(factor.pow(root[1]));
                }
                // normalise remainder to have integer coefficients, if not already
                if (!is_class(ring.NumberClass, Complex) || remainder.isReal()/* || remainder.isImag()*/)
                {
                    if (is_class(ring.NumberClass, Integer))
                    {
                        m = Arithmetic.I;
                    }
                    /*else if (remainder.isImag())
                    {
                        m = lcm(remainder.terms.map(function(t){return t.c.imag().den;}));
                    }*/
                    else
                    {
                        m = lcm(remainder.terms.map(is_class(ring.NumberClass, Complex) ? function(t){return t.c.real().den;} : function(t){return t.c.den;}));
                    }
                    if (!Arithmetic.equ(Arithmetic.I, m))
                    {
                        constant = constant.div(m);
                        remainder = remainder.mul(m);
                    }
                }
                if (0 < remainder.deg()) factors.push([remainder, 1]);
                else constant = constant.mul(remainder.cc());
            }
            if (!factors.length) factors.push([remainder, 1]);
            p._factors = [factors, constant];
        }
        return [p._factors[0].slice(), p._factors[1]];
    }
    ,equ: function(p) {
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(p))
        {
            return Arithmetic.equ(O, p) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===t[0].e));
        }
        else if (is_instance(p, Numeric))
        {
            return p.equ(O) ? 0===t.length : ((1===t.length) && t[0].c.equ(p) && (0===t[0].e));
        }
        else if (is_instance(p, Polynomial))
        {
            tp = p.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; i--)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        else if (is_instance(p, [MultiPolynomial, RationalFunc]))
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
            return !self.isConst() || self.cc().gt(a);
        }
        else if (is_instance(a, Polynomial))
        {
            return 0<UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [RationalFunc, MultiPolynomial]))
        {
            return a.lt(self);
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
            return !self.isConst() || self.cc().gte(a);
        }
        else if (is_instance(a, Polynomial))
        {
            return 0<=UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [RationalFunc, MultiPolynomial]))
        {
            return a.lte(self);
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
            return self.isConst() && self.cc().lt(a);
        }
        else if (is_instance(a, Polynomial))
        {
            return 0>UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [RationalFunc, MultiPolynomial]))
        {
            return a.gt(self);
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
            return self.isConst() && self.cc().lte(a);
        }
        else if (is_instance(a, Polynomial))
        {
            return 0>=UniPolyTerm.cmp(self.ltm(), a.ltm(), true);
        }
        else if (is_instance(a, [RationalFunc, MultiPolynomial]))
        {
            return a.gte(self);
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
            return Polynomial(self.terms.map(function(t){
                return UniPolyTerm(t.c.real(), t.e, ring);
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
            return Polynomial(self.terms.map(function(t){
                return UniPolyTerm(t.c.imag(), t.e, ring);
            }), self.symbol, ring);
        }
        else
        {
            return Polynomial([], self.symbol, ring);
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
                self._c = Polynomial(self.terms.map(function(t){
                    return UniPolyTerm(t.c.conj(), t.e, ring);
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
            self._n = Polynomial(array(self.terms.length, function(i){return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().add(x);
        else if (is_instance(x, [RationalFunc, MultiPolynomial])) return x.add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Add(x, self.clone()) : self;
    }
    ,sub: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().sub(x);
        else if (is_instance(x, [RationalFunc, MultiPolynomial])) return x.neg().add(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Add(x, self.clone(), true) : self;
    }
    ,mul: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(x, [Expr, MulTerm, PowTerm, SymbolTerm])) return self.toExpr().mul(x);
        else if (is_instance(x, [RationalFunc, MultiPolynomial])) return x.mul(self);
        return Arithmetic.isNumber(x) || is_instance(x, [Numeric, Polynomial]) ? Polynomial.Mul(x, self.clone()) : self;
    }
    ,div: function(x, q_and_r) {
        var self = this;
        if (is_instance(x, RationalFunc)) return RationalFunc(MultiPolynomial(self, x.num.symbol, x.num.ring)).div(x);
        else if (is_instance(x, MultiPolynomial)) return MultiPolynomial(self, x.symbol, x.ring).div(x, q_and_r);
        return is_instance(x, [Polynomial, Numeric]) || Abacus.Arithmetic.isNumber(x) ? Polynomial.Div(self, x, true===q_and_r) : self;
    }
    ,multidiv: function(xs, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true===q_and_r);
        if (is_instance(xs, Polynomial)) xs = [xs];
        if (!xs || !xs.length) return q_and_r ? [[], self] : [];

        n = xs.length;
        qs = array(n, function(){return [];});
        r = [];
        p = self.clone();
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
                qs[i] = addition_sparse(qs[i], [t], UniPolyTerm, false, p.ring);
                p.terms = addition_sparse(p.terms, xs[i].terms.map(function(xt){return xt.mul(t);}), UniPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if (q_and_r) r = addition_sparse(r, [plt], UniPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi){return Polynomial(qi, p.symbol, p.ring);});
        return q_and_r ? [qs, Polynomial(r, p.symbol, p.ring)] : qs;
    }
    ,mod: function(x) {
        var qr = this.div(x, true);
        return qr[1];
    }
    ,multimod: function(xs) {
        var qr = this.multidiv(xs, true);
        return qr[1];
    }
    ,divmod: function(x) {
        return this.div(x, true);
    }
    ,multidivmod: function(xs) {
        return this.multidiv(xs, true);
    }
    ,divides: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.equ(Arithmetic.O)) return false;
        if (is_instance(a, RationalFunc)) return true;
        if (is_instance(a, Numeric) || Arithmetic.isNumber(a))
            a = Polynomial(a, self.symbol, self.ring);
        if (is_instance(a, Poly))
            return a.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 === n)
        {
            return Polynomial.One(self.symbol, self.ring);
        }
        else if (1 === n)
        {
            return self;
        }
        else if (2 === n)
        {
            return Polynomial.Mul(self, self.clone());
        }
        else
        {
            // exponentiation by squaring
            pow = Polynomial.One(self.symbol, self.ring);
            b = self.clone();
            while (0 !== n)
            {
                if (n & 1) pow = Polynomial.Mul(b, pow);
                n >>= 1;
                b = Polynomial.Mul(b, b);
            }
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
        // functionaly compose one polynomial with another. ie result = P(Q(x))
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, pq, t, i, j;
        if (is_instance(q, MulTerm)) q = Expr(q);
        if (is_instance(q, Expr)) q = Polynomial.fromExpr(q, self.symbol, self.ring);
        if (Arithmetic.isNumber(q) || is_instance(q, Numeric))
        {
            return Polynomial(self.evaluate(q), self.symbol, self.ring);
        }
        else if (is_instance(q, Polynomial))
        {
            // Composition through variation of Horner's algorithm for fast evaluation
            // also check http://andy.novocin.com/pro/polycomp_CASC2011.pdf
            if (!self.terms.length) return Polynomial.Zero(q.symbol, self.ring);
            if (0 === self.deg()) return Polynomial(self.terms.slice(), q.symbol, self.ring);
            if (0 === q.deg()) return Polynomial(self.evaluate(q.cc()), q.symbol, self.ring);
            t = self.terms;
            i = t[0].e; pq = Polynomial(t[0].c, q.symbol, self.ring); j = 1;
            while (0<i)
            {
                i--; pq = Polynomial.Mul(q, pq);
                if (j<t.length && i===t[j].e) pq = Polynomial.Add(t[j++].c, pq);
            }
            return pq;
        }
        return self;
    }
    ,shift: function(s) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, Arithmetic = Abacus.Arithmetic;
        s = Arithmetic.val(s);
        if (0 === s)
            return self;
        else if (0 > s) // division by monomial x^|s|
            return Polynomial(self.terms.map(function(term){
                return term.e < -s ? null : UniPolyTerm(term.c, term.e+s, self.ring);
            }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
        //else if (0 < s) // multiplication by monomial x^s
        return Polynomial(self.terms.map(function(term){
            return UniPolyTerm(term.c, term.e+s, self.ring);
        }), self.symbol, self.ring);
    }
    ,d: function(n) {
        // polynomial (formal) derivative of nth order
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (null == n) n = 1;
        n = +n;
        if (0 > n) return null; // not supported
        else if (0 === n) return self;
        if (0 === self.terms.length) return self;
        return n >= self.terms[0].e ? Polynomial.Zero(self.symbol, self.ring) : Polynomial(self.terms.map(function(term){
            if (n > term.e) return null;
            for (var c=Arithmetic.I,j=term.e; j+n>term.e; j--) c = Arithmetic.mul(c, j);
            return UniPolyTerm(term.c.mul(c), term.e-n, self.ring);
        }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
    }
    ,polarForm: function(u) {
        // http://graphics.stanford.edu/courses/cs164-09-spring/Handouts/handout19.pdf
        // http://resources.mpi-inf.mpg.de/departments/d4/teaching/ss2010/geomod/slides_public/08_Blossoming_Polars.pdf
        u = String(u||'u');
        var self = this, ring = self.ring.associatedField(), n = self.deg(), symbol = array(n, function(i){return u+'_'+(i+1);});
        return self.terms.reduce(function(polar, term){
            if (!term.e) return polar;
            var combinations = Combination(n, term.e), k = combinations.total();
            return combinations.get().reduce(function(polar, comb){
                return polar.add(MultiPolynomial(MultiPolyTerm(ring.cast(term.c).div(k), array(n, function(i){return -1 === comb.indexOf(i) ? 0 : 1;})), symbol, ring));
            }, polar);
        }, MultiPolynomial(MultiPolyTerm(self.cc(), array(n, 0)), symbol, ring));
    }
    ,evaluate: function(x) {
        // Horner's algorithm for fast evaluation
        // https://en.wikipedia.org/wiki/Horner%27s_method
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, i, j, v;
        if (!t.length) return ring.Zero();
        if (!is_instance(x, Numeric) && !Arithmetic.isNumber(x) && is_obj(x)) x = x[self.symbol];
        x = x || O;
        //x = ring.cast(x);
        i = t[0].e; v = t[0].c; j = 1;
        while (0<i)
        {
            i--; v = v.mul(x);
            if (j<t.length && i===t[j].e) v = t[j++].c.add(v);
        }
        return v;
    }
    ,toString: function() {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        if (null == self._str)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; i++)
            {
                ti = t[i];
                out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x);
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
                out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, true);
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
            out += (prev && ((is_instance(ti.c, [RationalFunc, RationalExpr]) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
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
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t, x, i, terms, term;
        if (null == self._expr)
        {
            x = self.symbol; t = self.terms; terms = [];
            for (i=t.length-1; i>=0; i--)
            {
                term = t[i].toTerm(x, false, true);
                terms.push(MulTerm(term.length ? term : '1', t[i].c));
            }
            if (!terms.length) terms.push(MulTerm(1, O));
            self._expr = Expr(terms);
        }
        return self._expr;
    }
});
Polynomial.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = String(symbol || 'x');
    var type_cast = typecast(function(a){
        return is_instance(a, Polynomial) && (a.ring===ring);
    }, function(a){
        return is_string(a) ? Polynomial.fromString(a, symbol, ring) : new Polynomial(a, symbol, ring);
    });
    return type_cast(a);
};
