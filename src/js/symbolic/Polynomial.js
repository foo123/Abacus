// Represents a (univariate) polynomial term with coefficient and exponent in Polynomial non-zero sparse representation
var UniPolyTerm = Class({

    constructor: function UniPolyTerm(c, e, ring, order) {
        var self = this;
        if (!is_instance(self, UniPolyTerm)) return new UniPolyTerm(c, e, ring, order);

        if (is_instance(c, UniPolyTerm)) {ring = ring || c.ring; e = c.e; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        self.order = LEX; // default for univariate polynomial terms
        self.c = self.ring.cast(c || 0);
        self.e = +(e || 0);
    }

    ,__static__: {
        isNonZero: function(t) {
            return is_instance(t, UniPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function(t1, t2, full) {
            var res = t1.e - t2.e; // LEX by default
            if ((true === full) && (0 === res))
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return UniPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return UniPolyTerm(true === full ? (t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), stdMath.min(t1.e, t2.e));
        }
        ,lcm: function(t1, t2, full) {
            return UniPolyTerm(true === full ? (t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), stdMath.max(t1.e, t2.e));
        }
    }

    ,ring: null
    ,order: null
    ,c: null
    ,e: null

    ,dispose: function() {
        var self = this;
        self.ring = null;
        self.order = null;
        self.c = null;
        self.e = null;
        return self;
    }
    ,clone: function() {
        return new UniPolyTerm(this);
    }
    ,cast: function(ring) {
        var self = this;
        return ring === self.ring ? self : new UniPolyTerm(self.c, self.e, ring);
    }
    ,equ: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? (self.c.equ(term.c) && (self.e === term.e)) : self.c.equ(term);
    }
    ,neg: function() {
        var self = this;
        return UniPolyTerm(self.c.neg(), self.e, self.ring);
    }
    ,add: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.add(term.c), self.e, self.ring) : UniPolyTerm(self.c.add(term), self.e, self.ring);
    }
    ,sub: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.sub(term.c), self.e, self.ring) : UniPolyTerm(self.c.sub(term), self.e, self.ring);
    }
    ,mul: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.mul(term.c), self.e+term.e, self.ring) : UniPolyTerm(self.c.mul(term), self.e, self.ring);
    }
    ,div: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? UniPolyTerm(self.c.div(term.c), stdMath.max(0, self.e-term.e), self.ring) : UniPolyTerm(self.c.div(term), self.e, self.ring);
    }
    ,divides: function(term) {
        var self = this;
        return (self.e <= term.e) && self.c.divides(term.c);
    }
    ,pow: function(k) {
        var self = this;
        k = +k;
        return 1 === k ? self : UniPolyTerm(self.c.pow(k), stdMath.floor(self.e * k), self.ring);
    }
    ,rad: function(k) {
        var self = this;
        k = +k;
        return 1 === k ? self : UniPolyTerm(self.c.rad(k), stdMath.max(stdMath.floor(self.e / k), stdMath.min(1, self.e)), self.ring);
    }
    ,toTerm: function(symbol, asTex, monomialOnly, asDec, precision) {
        var t = this, e = t.e, c = t.c, term,
            Arithmetic = Abacus.Arithmetic,
            I = Arithmetic.I, J = Arithmetic.J;
        term = true === asTex ? (0 < e ? (to_tex(symbol) + (1 < e ? '^{' + Tex(e) + '}' : '')) : '') : (0 < e ? (symbol + (1 < e ? '^' + String(e) : '')) : '');
        if (true !== monomialOnly)
        {
            if (true === asDec)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && !c.isConst() ? ('(' + c.toDec(precision) + ')') : (!c.isReal() ? ('(' + c.toDec(precision) + ')') : c.toDec(precision))))) + term) : (is_instance(c, RationalFunc) && !c.isConst() ? '(' + c.toDec(precision) + ')' : c.toDec(precision));
            }
            else if (true === asTex)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && !c.isConst() ? ('(' + c.toTex() + ')') : (!c.isReal() ? ('(' + c.toTex() + ')') : c.toTex())))) + term) : (is_instance(c, RationalFunc) && !c.isConst() ? '(' + c.toTex() + ')' : c.toTex());
            }
            else
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && (!c.isConst() || !c.den.equ(Arithmetic.I)) ? ('(' + c.toString() + ')*') : (!c.isReal() ? ('(' + c.toString() + ')*') : (c.toString(true) + '*'))))) + term) : (is_instance(c, RationalFunc) && !c.isConst() ? '(' + c.toString() + ')' : c.toString());
            }
        }
        return term;
    }
    ,toString: function() {
        var self = this;
        return '(' + self.c.toString() + ',' + String(self.e) + ',"lex")';
    }
});

// Abacus.Polynomial, represents a (univariate) polynomial (with Rational coefficients)
// in strict **non-zero sparse** coefficient representation in decreasing exponent order
Polynomial = Abacus.Polynomial = Class(Poly, {

    constructor: function Polynomial(terms, symbol, ring) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i;

        if (!is_instance(self, Polynomial)) return new Polynomial(terms, symbol, ring);

        if (is_instance(terms, Expr)) terms = Polynomial.fromExpr(terms, symbol || 'x', ring || Ring.Q());

        if (is_instance(terms, MultiPolynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || 'x');
            i = terms.symbol.indexOf(self.symbol); if (-1 === i) i = 0;
            self.terms = terms.terms.map(function(t) {
                return UniPolyTerm(t.c, t.e[i], self.ring);
            }).sort(UniPolyTerm.sortDecr).reduce(function(terms, t) {
                if (!terms.length || (terms[terms.length-1].e !== t.e)) terms.push(t);
                else terms[terms.length-1] = terms[terms.length-1].add(t);
                return terms;
            }, []);
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || terms.symbol);
            self.terms = !self.ring.equ(terms.ring) ? terms.terms.map(function(t) {
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
                    // convert to sparse representation
                    self.terms = array(terms.length, function(i) {return UniPolyTerm(terms[i], i, self.ring);});
                }
                else
                {
                    self.terms = is_args(terms) ? slice.call(terms) : terms;
                }
            }
            else if (is_obj(terms))
            {
                // sparse representation as object with keys only to existing powers with symbol
                // convert to sparse coefficient representation
                self.terms = KEYS(terms).map(function(k) {
                    return UniPolyTerm(terms[k], '1' === k ? 0 : (self.symbol === k ? 1 : (self.symbol+'^' === k.slice(0, self.symbol.length+1) ? parseInt(k.slice(self.symbol.length+1)) : 0)), self.ring);
                });
            }
            else
            {
                self.terms = [];
            }
        }
        self.terms = self.terms.filter(UniPolyTerm.isNonZero).sort(UniPolyTerm.sortDecr);

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
                return Polynomial.One(self.symbol, self.ring);
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        Term: UniPolyTerm
        ,Piecewise: null

        ,hasInverse: function() {
            return false;
        }

        ,Zero: function(symbol, ring) {
            return new Polynomial([], symbol || 'x', ring || Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial({'1':ring.One()}, symbol || 'x', ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial({'1':ring.MinusOne()}, symbol || 'x', ring);
        }
        ,Const: function(c, symbol, ring) {
            return new Polynomial({'1':c || Abacus.Arithmetic.O}, symbol || 'x', ring || Ring.Q());
        }

        ,cast: null // added below

        ,bezier: function(points, symbol) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Recursive_definition
            // https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
            symbol = String(symbol || 'x');
            var ring = Ring.Q(), Bezier = Polynomial.Zero(symbol, ring), n, i, b0, b1, b11;
            if (is_array(points) && points.length)
            {
                n = points.length;
                b11 = Polynomial([1, -1], symbol, ring);
                b0 = Polynomial.One(symbol, ring).shift(n-1);
                b1 = Polynomial.One(symbol, ring);
                Bezier = Bezier._add(b0._mul(ring.cast(points[n-1])));
                for (i=n-2; i>=0; --i)
                {
                    b0 = b0.shift(-1); b1 = b1._mul(b11);
                    Bezier = Bezier._add(b1._mul(b0)._mul(factorial(n-1,i))._mul(ring.cast(points[i])));
                }
            }
            return Bezier;
        }

        ,bezierThrough: function(knots, symbol) {
            // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
            // https://www.particleincell.com/2012/bezier-splines/
            // https://stackoverflow.com/questions/7715788/find-bezier-control-points-for-curve-passing-through-n-points
            symbol = String(symbol || 'x');
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
                for (i=1; i<n-1; ++i)
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
                for (i=1; i<n; ++i)
                {
                    m = a[i].div(b[i-1]);
                    b[i] = b[i].sub(m.mul(c[i - 1]));
                    r[i] = r[i].sub(m.mul(r[i-1]));
                }

                p1[n-1] = r[n-1].div(b[n-1]);
                for (i=n-2; i>=0; --i)
                    p1[i] = r[i].sub(c[i].mul(p1[i+1])).div(b[i]);

                /*we have p1, now compute p2*/
                for (i=0; i+1<n; ++i)
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
                    for (i=0; i+1<knots.length; ++i)
                        segments.push(Polynomial.bezier([knots[i], points[0][i], points[1][i], knots[i+1]], symbol));
                }
                return Polynomial.Piecewise(segments, 0, symbol, ring);
            }
            return Polynomial.Piecewise([Polynomial.Zero(symbol, ring)], 0, symbol, ring);
        }

        ,fromString: function(s, symbol, ring) {
            return Polynomial.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = String((is_array(symbol) ? symbol[0] : symbol) || 'x');
            return e.toPoly(symbol, ring, Complex.Symbol);
        }
    }

    ,terms: null
    ,symbol: null
    ,ring: null
    ,_n: null
    ,_str: null
    ,_tex: null
    ,_expr: null
    ,_prim: null
    ,_roots: null
    ,_exact_roots: null
    ,_zeros: null
    ,_factors: null

    ,dispose: function() {
        var self = this;
        if (self._n && (self._n._n === self))
        {
            self._n._n = null;
        }
        if (self._c && (self._c._c === self))
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
        self._exact_roots = null;
        self._roots = null;
        self._factors = null;
        return self;
    }

    ,isInt: function() {
        // has integer coefficients
        var self = this, terms = self.terms, i;
        if (is_class(self.ring.NumberClass, Integer)) return true;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isInt()) return false;
        return true;
    }
    ,isReal: function() {
        // has real coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return true;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isReal()) return false;
        return true;
    }
    ,isImag: function() {
        // has imaginary coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return false;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isImag()) return false;
        return true;
    }
    ,isComplex: function() {
        return is_class(this.ring.NumberClass, Complex);
    }
    ,isMono: function() {
        // is monomial
        var terms = this.terms;
        return (1 === terms.length) && (0 !== terms[0].e);
    }
    ,isConst: function() {
        return 0 === this.deg();
    }
    ,isUni: function(x, strict) {
        var self = this;
        x = String(x || 'x');
        if (self.symbol !== x) return false;
        return true === strict ? (0 !== self.deg()) : true;
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
    ,term: function(i, as_degree, term_only) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms,
            ring = self.ring, symbol = self.symbol,
            term, t, j, n = terms.length;
        term = null;
        if (true === as_degree)
        {
            for (j=0; j<n; ++j)
            {
                t = terms[j];
                if (i === t.e)
                {
                    term = t;
                    break;
                }
            }
        }
        else if (0 <= i && i < n)
        {
            term = terms[i];
        }
        term = term || UniPolyTerm(0, 0, ring);
        return true === term_only ? term : Polynomial([term], symbol, ring);
    }
    ,ltm: function(asPoly) {
        // leading term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true === asPoly) return Polynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : UniPolyTerm(0, 0, ring);
    }
    ,ttm: function(asPoly) {
        // tail/last term
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true === asPoly) return Polynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
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
        return terms.length && (0 === terms[terms.length-1].e) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function() {
        // alias of cc()
        return this.cc();
    }
    ,order: function(order) {
        return arguments.length ? this : 'lex'; // LEX by default
    }
    ,monic: function(with_factor) {
        var self = this, p, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if (lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O)) return true === with_factor ? [self, lc] : self;
        if (self.ring.isField())
        {
            p = Polynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring);
        }
        else
        {
            divides = true; t = self.terms;
            for (i=t.length-1; i>0; --i)
            {
                if (!lc.divides(t[i].c))
                {
                    divides = false;
                    break;
                }
            }
            if (divides)
            {
                p = Polynomial(self.terms.map(function(t){return t.div(lc);}), self.symbol, self.ring);
            }
            else if (lc.lt(Arithmetic.O))
            {
                // at least make positive
                p = self.neg();
                lc = self.ring.MinusOne();
            }
            else
            {
                p = self;
                lc = self.ring.One();
            }
        }
        return true === with_factor ? [p, lc] : p;
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
            else if (is_class(ring.PolynomialClass, RationalFunc))
            {
                LCM = terms.reduce(function(LCM, t) {return t.c.den.mul(LCM);}, ring.One().num);
                coeffp = terms.map(function(t) {return t.c.mul(LCM).num;});
                content = MultiPolynomial.gcd(coeffp);
                coeffp = coeffp.map(function(c) {return c.div(content);});
                // make positive lead
                if (coeffp[0].lt(Arithmetic.O))
                {
                    coeffp = coeffp.map(function(c) {return c.neg();});
                    content = content.neg();
                }
                self._prim = [Polynomial(coeffp.map(function(c, i) {return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(RationalFunc(content, LCM).simpl())];
            }
            else if (is_class(ring.NumberClass, Complex))
            {
                isReal = self.isReal(); isImag = self.isImag();
                if (!isReal && !isImag)
                {
                    content = ring.gcd(terms.map(function(t) {return t.c;})).simpl();
                    self._prim = [Polynomial(terms.map(function(t) {return UniPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
                }
                else if (isImag)
                {
                    LCM = terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.imag().den);}, Arithmetic.I);
                    coeffp = terms.map(function(t) {return t.c.mul(LCM).imag().num;});
                    content = gcd(coeffp);
                    coeffp = coeffp.map(function(c) {return Arithmetic.div(c, content);});
                    // make positive lead
                    if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                    {
                        coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                        content = Arithmetic.neg(content);
                    }
                    self._prim = [Polynomial(coeffp.map(function(c, i) {return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
                }
                else
                {
                    LCM = terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.real().den);}, Arithmetic.I);
                    coeffp = terms.map(function(t) {return t.c.mul(LCM).real().num;});
                    content = gcd(coeffp);
                    coeffp = coeffp.map(function(c) {return Arithmetic.div(c, content);});
                    // make positive lead
                    if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                    {
                        coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                        content = Arithmetic.neg(content);
                    }
                    self._prim = [Polynomial(coeffp.map(function(c, i) {return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.den);}, Arithmetic.I);
                coeffp = terms.map(function(t) {return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c) {return Arithmetic.div(c, content);});
                // make positive lead
                if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                {
                    coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [Polynomial(coeffp.map(function(c, i) {return UniPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true === and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function() {
        var p = this.primitive(true);
        return p[1];
    }
    ,resultant: function(other) {
        return is_instance(other, MultiPolynomial) ? MultiPolynomial.Resultant(this, other, this.symbol) : Polynomial.Resultant(this, other);
    }
    ,discriminant: function() {
        return Polynomial.Discriminant(this);
    }
    ,roots: function() {
        // find all integer/rational roots of poly, if any
        // https://en.wikipedia.org/wiki/Rational_root_theorem
        // https://en.wikipedia.org/wiki/Gauss%27s_lemma_(polynomial)
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            roots, primitive, c, p, d0, dn, iter, comb, root, nroot, rm, nrm, found;

        if (null == self._roots)
        {
            roots = [];
            // no rational roots or infinite roots for constant polynomials,
            if (!self.isConst())
            {
                primitive = self.primitive();
                c = primitive.terms;
                if (0 < c[c.length-1].e)
                {
                    roots.push([ring.Zero(), c[c.length-1].e]); // zero root with multiplicity
                }
                if (1 < c.length)
                {
                    // try all possible divisors of c_0(excluding trivial zero terms) and c_n
                    iter = symbolic_divisors(c[c.length-1].c);
                    d0 = iter.get(); iter.dispose();
                    iter = symbolic_divisors(c[0].c);
                    dn = iter.get(); iter.dispose();

                    iter = Tensor([d0.length, dn.length]);
                    while (iter.hasNext())
                    {
                        comb = iter.next();
                        // positive root
                        root = d0[comb[0]].div(dn[comb[1]]);
                        // negative root
                        nroot = root.neg();
                        rm = 0; nrm = 0;
                        p = primitive; found = true;
                        while (found && (0 < p.deg()))
                        {
                            found = false;
                            // try positive root
                            if (p.evaluate(root).equ(O))
                            {
                                ++rm; // count multiplicity
                                found = true;
                            }
                            // try negative root
                            if (p.evaluate(nroot).equ(O))
                            {
                                ++nrm; // count multiplicity
                                found = true;
                            }
                            if (found) p = p.d(); // get derivative to check if roots are multiple
                        }
                        if (0 < rm) roots.push([root, rm]);
                        if (0 < nrm) roots.push([nroot, nrm]);
                    }
                    iter.dispose();
                }
            }
            self._roots = roots;
        }
        return self._roots.map(function(r) {return r.slice();});
    }
    ,factors: function() {
        // factorize poly over integers/rationals if factorizable
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials
        var self = this, queue, factors, t, k, c, q, p;
        if (null == self._factors)
        {
            p = self.primitive(true);
            c = p[1];
            p = p[0];
            factors = {};
            // get any linear factors
            p.roots().forEach(function(root) {
                var terms = {}, q;
                terms[self.symbol] = self.ring.One();
                terms['1'] = root[0].neg();
                q = Polynomial(terms, self.symbol, self.ring);
                factors[q.toString()] = [q, root[1]];
                p = p.div(q.pow(root[1]));
            });
            // get any irreducible factors
            queue = [p];
            do {
                p = queue.shift();
                if (1 > p.deg())
                {
                    // const, irreducible
                    c = c.mul(p.cc());
                }
                else if (1 === p.deg())
                {
                    // linear factor, irreducible
                    if (p.lc().lt(0))
                    {
                        // normalize leading coefficient to be positive
                        c = c.mul(-1);
                        p = p.mul(-1);
                    }
                    k = p.toString();
                    if (HAS.call(factors, k))
                    {
                        ++factors[k][1];
                    }
                    else
                    {
                        factors[k] = [p, 1];
                    }
                }
                else
                {
                    q = polyfactor(p);
                    if (q)
                    {
                        // found a factor, split p into q and p/q
                        queue.push(q);
                        queue.push(p.div(q));
                    }
                    else
                    {
                        // other irreducible factor
                        p = p.monic(true); // same factor can appear with different constants
                        c = c.mul(p[1]);
                        p = p[0];
                        k = p.toString();
                        if (HAS.call(factors, k))
                        {
                            ++factors[k][1];
                        }
                        else
                        {
                            factors[k] = [p, 1];
                        }
                    }
                }
            } while (queue.length);
            factors = KEYS(factors).map(function(k) {return factors[k];});
            self._factors = [factors, c];
        }
        return [self._factors[0].slice(), self._factors[1]];
    }
    ,exactroots: function() {
        // find exact roots of poly when solvable
        var self = this;
        if (null == self._exact_roots)
        {
            self._exact_roots = self.factors()[0].reduce(function(roots, factor) {
                factor = factor[0];
                switch (factor.deg())
                {
                    case 1:
                    roots.push.apply(roots, poly_linear_roots(factor));
                    break;

                    case 2:
                    roots.push.apply(roots, poly_quadratic_roots(factor));
                    break;

                    case 3:
                    roots.push.apply(roots, poly_cubic_roots(factor));
                    break;

                    case 4:
                    roots.push.apply(roots, poly_quartic_roots(factor));
                    break;

                    default:
                    // any rational roots
                    roots.push.apply(roots, factor.roots().map(function(r) {return [r[0].toExpr(), r[1]];}));
                    break;
                }
                return roots;
            }, []);
        }
        return self._exact_roots.slice();
    }
    ,zeros: function() {
        // find approximate real/complex zeros of poly numerically
        // https://en.wikipedia.org/wiki/Aberth_method
        var self = this, d, tc, lo, hi,
            roots, found, i, j, m, ri, ratio, offset,
            epsilon = 1e-10, epsilonz, iter,
            zero, one,  p, dp, px, dpx;
        if (null == self._zeros)
        {
            epsilonz = nComplex(epsilon);
            zero = nComplex.Zero();
            one = nComplex.One();
            p = function(x) {
                return self.evaluate(x);
            };
            dp = function(x) {
                return (p(x.add(epsilonz)).sub(p(x))).div(epsilonz);
            };
            d = self.deg();
            if (0 < d)
            {
                // init
                tc = self.terms.map(function(ti) {return ti.c.abs();});
                // https://en.wikipedia.org/wiki/Geometrical_properties_of_polynomial_roots
                hi = nmax(tc.slice(0, -1)).div(tc[tc.length-1]).add(one).valueOf();
                lo = tc[0].div(tc[0].add(nmax(tc.slice(1)))).valueOf();
                roots = array(d, function() {
                    var radius = lo + (hi-lo)*stdMath.random();
                    var angle = stdMath.random()*stdMath.PI/2;
                    return nComplex(radius*stdMath.cos(angle), radius*stdMath.sin(angle));
                });

                // root finding
                iter = 0;
                for (;;)
                {
                    found = 0;
                    for (i=0; i<d; ++i)
                    {
                        ri = roots[i];
                        px = p(ri);
                        dpx = dp(ri);
                        if (dpx.equ(0))
                        {
                            if ((px.re <= epsilon) && (px.im <= epsilon))
                            {
                                ++found;
                                continue;
                            }
                            ratio = nComplex(hi);
                        }
                        else
                        {
                            ratio = px.div(dpx);
                        }
                        offset = ratio.div(one.sub(ratio.mul(roots.reduce(function(s, rj, j) {
                            if ((j !== i) && !ri.equ(rj)) s = s.add((ri.sub(rj)).inv());
                            return s;
                        }, zero))));
                        if ((offset.re <= epsilon) && (offset.im <= epsilon)) ++found;
                        roots[i] = ri.sub(offset);
                    }
                    if (found === d) break;
                    ++iter; if (iter > 10000) break;
                }
            }
            else
            {
                roots = [];
            }
            self._zeros = roots.sort(function(a, b) {return a.equ(b) ? 0 : (a.lt(b) ? -1 : 1);});
        }
        return self._zeros.slice();
    }
    ,equ: function(other) {
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(other))
        {
            return Arithmetic.equ(O, other) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === t[0].e));
        }
        if (is_instance(other, Numeric))
        {
            return other.equ(O) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === t[0].e));
        }
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Polynomial))
        {
            tp = other.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; --i)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        if (is_instance(other, [MultiPolynomial, RationalFunc]))
        {
            return other.equ(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().equ(other);
        }
        if (is_string(other))
        {
            return (other === self.toString()) || (other === self.toTex());
        }
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst() || self.cc().gt(other);
        }
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Polynomial))
        {
            return 0 < UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.lt(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().gt(other);
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst() || self.cc().gte(other);
        }
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Polynomial))
        {
            return 0 <= UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.lte(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().gte(other);
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst() && self.cc().lt(other);
        }
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Polynomial))
        {
            return 0 > UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.gt(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().lt(other);
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst() && self.cc().lte(other);
        }
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Polynomial))
        {
            return 0 >= UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.gte(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().lte(other);
        }
        return false;
    }

    ,real: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
        {
            return Polynomial(self.terms.map(function(t) {
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
            return Polynomial(self.terms.map(function(t) {
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
                self._c = Polynomial(self.terms.map(function(t) {
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
            self._n = Polynomial(array(self.terms.length, function(i) {return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,_add: function(other) {
        return uni_add(other, this.clone());
    }
    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().add(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? uni_add(other, self.clone()) : self;
    }
    ,_sub: function(other) {
        return uni_add(other, this.clone(), true);
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().sub(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.neg().add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? uni_add(other, self.clone(), true) : self;
    }
    ,_mul: function(other) {
        return uni_mul(other, this.clone());
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().mul(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.mul(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? uni_mul(other, self.clone()) : self;
    }
    ,_div: function(other, q_and_r) {
        return uni_div(this, other, true === q_and_r);
    }
    ,div: function(other, q_and_r) {
        var self = this;
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().div(other);
        else if (is_instance(other, RationalFunc)) return RationalFunc(MultiPolynomial(self, other.num.symbol, other.num.ring)).div(other);
        else if (is_instance(other, MultiPolynomial)) return MultiPolynomial(self, other.symbol, other.ring).div(other, q_and_r);
        return is_instance(other, [Polynomial, Numeric]) || Abacus.Arithmetic.isNumber(other) ? uni_div(self, other, true === q_and_r) : self;
    }
    ,multidiv: function(others, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true === q_and_r);
        if (is_instance(others, Polynomial)) others = [others];
        if (!others || !others.length) return q_and_r ? [[], self] : [];

        others = others.map(function(q) {return self.ring.contains(q) ? Polynomial.Const(q, self.symbol, self.ring) : q;});
        n = others.length;
        qs = array(n, function() {return [];});
        r = [];
        p = self.clone();
        while (p.terms.length/*!p.equ(Arithmetic.O)*/)
        {
            // Try to divide by a polynomial.
            plt = p.ltm(); divides = false;
            for (i=0; i<n; ++i)
            {
                xlt = others[i].ltm();
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
                p.terms = addition_sparse(p.terms, others[i].terms.map(function(xt) {return xt.mul(t);}), UniPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if (q_and_r) r = addition_sparse(r, [plt], UniPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi) {return Polynomial(qi, p.symbol, p.ring);});
        return q_and_r ? [qs, Polynomial(r, p.symbol, p.ring)] : qs;
    }
    ,_mod: function(other) {
        var qr = this._div(other, true);
        return qr[1];
    }
    ,mod: function(other) {
        var qr = this.div(other, true);
        return qr[1];
    }
    ,multimod: function(others) {
        var qr = this.multidiv(others, true);
        return qr[1];
    }
    ,_divmod: function(other) {
        return this._div(other, true);
    }
    ,divmod: function(other) {
        return this.div(other, true);
    }
    ,multidivmod: function(others) {
        return this.multidiv(others, true);
    }
    ,divides: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.equ(Arithmetic.O)) return false;
        if (self.ring.contains(other)) other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, [RationalFunc, Expr])) return true;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
            other = Polynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return other.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,_pow: function(n) {
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
            return uni_mul(self, self.clone());
        }
        else
        {
            // exponentiation by squaring
            pow = Polynomial.One(self.symbol, self.ring);
            b = self.clone();
            while (0 !== n)
            {
                if (n & 1) pow = uni_mul(b, pow);
                n >>= 1;
                b = uni_mul(b, b);
            }
            return pow;
        }
    }
    ,pow: function(n) {
        return this._pow(n);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return Polynomial.kthroot(self, n);
    }
    ,substitute: function(v, x) {
        var self = this, sub = {};
        x = self.symbol;
        sub[x] = is_instance(v, Expr) ? v : (is_callable(v.toExpr) ? v.toExpr() : Expr('', v));
        return self.toExpr().compose(sub).toPoly(x, self.ring);
    }
    ,compose: function(q) {
        // functionaly compose one polynomial with another. ie result = P(Q(x))
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, pq, t, i, j;
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
            while (0 < i)
            {
                --i; pq = pq._mul(q);
                if (j < t.length && i === t[j].e) pq = pq._add(t[j++].c);
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
        {
            return self;
        }
        else if (0 > s) // division by monomial x^|s|
        {
            return Polynomial(self.terms.map(function(term) {
                return term.e < -s ? null : UniPolyTerm(term.c, term.e+s, self.ring);
            }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
        }
        //else if (0 < s) // multiplication by monomial x^s
        return Polynomial(self.terms.map(function(term) {
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
        return n >= self.terms[0].e ? Polynomial.Zero(self.symbol, self.ring) : Polynomial(self.terms.map(function(term) {
            if (n > term.e) return null;
            for (var c=Arithmetic.I,j=term.e; j+n>term.e; --j) c = Arithmetic.mul(c, j);
            return UniPolyTerm(term.c.mul(c), term.e-n, self.ring);
        }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
    }
    ,polarForm: function(u) {
        // http://graphics.stanford.edu/courses/cs164-09-spring/Handouts/handout19.pdf
        // http://resources.mpi-inf.mpg.de/departments/d4/teaching/ss2010/geomod/slides_public/08_Blossoming_Polars.pdf
        u = String(u||'u');
        var self = this, ring = self.ring.associatedField(), n = self.deg(), symbol = array(n, function(i) {return u + '_' + String(i+1);});
        return self.terms.reduce(function(polar, term) {
            if (!term.e) return polar;
            var combinations = Combination(n, term.e), k = combinations.total();
            return combinations.get().reduce(function(polar, comb) {
                return polar.add(MultiPolynomial(MultiPolyTerm(ring.cast(term.c).div(k), array(n, function(i) {return -1 === comb.indexOf(i) ? 0 : 1;})), symbol, ring));
            }, polar);
        }, MultiPolynomial(MultiPolyTerm(self.cc(), array(n, 0)), symbol, ring));
    }
    ,evaluate: function(x) {
        // Horner's algorithm for fast evaluation
        // https://en.wikipedia.org/wiki/Horner%27s_method
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, i, j, v, is_ncomplex;
        if (!t.length) return ring.Zero();
        if (!is_instance(x, [Numeric, RationalFunc]) && !Arithmetic.isNumber(x) && is_obj(x)) x = x[self.symbol];
        x = x || O;
        is_ncomplex = is_instance(x, nComplex);
        //x = ring.cast(x);
        i = t[0].e; v = t[0].c; j = 1;
        while (0 < i)
        {
            --i; v = is_ncomplex ? x.mul(v) : v.mul(x);
            if (j < t.length && i === t[j].e) v = v.add(t[j++].c);
        }
        return v;
    }
    ,toExpr: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t, c, x, i, terms, term;
        if (null == self._expr)
        {
            x = self.symbol; t = self.terms; terms = [];
            for (i=t.length-1; i>=0; --i)
            {
                c = t[i].c;
                if (!c.equ(O))
                {
                    term = t[i].toTerm(x, false, true);
                    c = c.toExpr();
                    if (term.length)
                    {
                        term = term.split('^');
                        terms.push(c.mul(1 < term.length ? Expr('^', [term[0], +term[1]]) : Expr('', term[0])));
                    }
                    else
                    {
                        terms.push(c);
                    }
                }
            }
            self._expr = 1 < terms.length ? Expr('+', terms)/*.expand()*/ : (1 === terms.length ? terms[0] : Expr.Zero());
        }
        return self._expr;
    }
    ,toString: function() {
        var self = this, t, ti, s, x, i, l, out = '';
        if (null == self._str)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; ++i)
            {
                ti = t[i]; s = trim(ti.toTerm(x));
                if (out.length) s = '-' === s.charAt(0) ? (' - ' + trim(s.slice(1))) : (' + ' + s);
                out += s;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, t, ti, s, x, i, l, out = '';
        if (null == self._tex)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; ++i)
            {
                ti = t[i]; s = trim(ti.toTerm(x, true));
                if (out.length) s = '-' === s.charAt(0) ? (' - ' + trim(s.slice(1))) : (' + ' + s);
                out += s;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        t = self.terms; x = self.symbol;
        for (i=0,l=t.length; i<l; ++i)
        {
            ti = t[i];
            out += (prev && ((is_instance(ti.c, RationalFunc) && (!ti.c.isConst() || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
            prev = true;
        }
        if (!out.length)
        {
            out = '0';
            if (is_number(precision) && 0 < precision) out += '.' + (new Array(precision+1).join('0'));
        }
        return out;
    }
});
Polynomial.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = String(symbol || 'x');
    var type_cast = typecast(function(a) {
        return is_instance(a, Polynomial) && ring.equ(a.ring);
    }, function(a) {
        return is_string(a) ? Polynomial.fromString(a, symbol, ring) : new Polynomial(a, symbol, ring);
    });
    return type_cast(a);
};


// Represents a multivariate polynomial term with coefficient and exponents in Polynomial non-zero sparse representation
var MultiPolyTerm = Class({

    constructor: function MultiPolyTerm(c, e, ring, order) {
        var self = this;
        if (!is_instance(self, MultiPolyTerm)) return new MultiPolyTerm(c, e, ring, order);

        if (is_instance(c, MultiPolyTerm)) {ring = ring || c.ring; order = order || c.order; e = c.e.slice(); c = c.c;}
        else if (is_instance(c, UniPolyTerm)) {ring = ring || c.ring; order = c.order || LEX; e = [c.e]; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        self.order = order || LEX;
        self.c = self.ring.cast(c || 0);
        self.e = is_array(e) ? e : [+(e || 0)];
        if (is_instance(self.c, [MultiPolynomial, RationalFunc])) self.c = self.c.order(order);
    }

    ,__static__: {
        isNonZero: function(t) {
            return is_instance(t, MultiPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function(t1, t2, full) {
            var res = 0;
            if ((REVERSED & t1.order) && (GRADED & t1.order)) res = cmp_monomial_grevlex(t1.e, t2.e);
            else if ((GRADED & t1.order)) res = cmp_monomial_grlex(t1.e, t2.e);
            else res = cmp_monomial_lex(t1.e, t2.e);
            if ((true === full) && (0 === res)) res = t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return MultiPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return MultiPolyTerm(true === full ? (t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), array(stdMath.max(t1.e.length, t2.e.length), function(i) {
                return i < t1.e.length && i < t2.e.length ? stdMath.min(t1.e[i], t2.e[i]) : 0;
            }));
        }
        ,lcm: function(t1, t2, full) {
            return MultiPolyTerm(true === full ? (t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), array(stdMath.max(t1.e.length, t2.e.length), function(i) {
                return i < t1.e.length && i < t2.e.length ? stdMath.max(t1.e[i], t2.e[i]) : (i < t1.e.length ? t1.e[i] : t2.e[i]);
            }));
        }
    }

    ,ring: null
    ,order: null
    ,c: null
    ,e: null

    ,dispose: function() {
        var self = this;
        self.ring = null;
        self.order = null;
        self.c = null;
        self.e = null;
        return self;
    }
    ,clone: function() {
        return new MultiPolyTerm(this);
    }
    ,cast: function(ring) {
        var self = this;
        return ring === self.ring ? self : new MultiPolyTerm(self.c, self.e, ring, self.order);
    }
    ,equ: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? 0 === MultiPolyTerm.cmp(self, term, true) : self.c.equ(term);
    }
    ,neg: function() {
        var self = this;
        return MultiPolyTerm(self.c.neg(), self.e, self.ring, self.order);
    }
    ,add: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.add(term.c), self.e, self.ring, self.order) : MultiPolyTerm(self.c.add(term), self.e, self.ring, self.order);
    }
    ,sub: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.sub(term.c), self.e, self.ring, self.order) : MultiPolyTerm(self.c.sub(term), self.e, self.ring, self.order);
    }
    ,mul: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.mul(term.c), array(stdMath.max(self.e.length, term.e.length), function(i) {
            return i < self.e.length && i < term.e.length ? self.e[i]+term.e[i] : (i < term.e.length ? term.e[i] : self.e[i]);
        }), self.ring, self.order) : MultiPolyTerm(self.c.mul(term), self.e, self.ring, self.order);
    }
    ,div: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.div(term.c), array(stdMath.max(self.e.length, term.e.length), function(i) {
            return i < self.e.length && i < term.e.length ? stdMath.max(0, self.e[i]-term.e[i]) : (i < term.e.length ? 0 : self.e[i]);
        }), self.ring, self.order) :  MultiPolyTerm(self.c.div(term), self.e, self.ring, self.order);
    }
    ,divides: function(term) {
        var self = this, e1 = self.e, e2 = term.e, i, n = stdMath.max(e1.length, e2.length);
        if (!self.c.divides(term.c)) return false;
        for (i=0; i<n; ++i)
        {
            if (i >= e1.length)
            {
                break;
            }
            else if (i >= e2.length)
            {
                if (0 < e1[i]) return false;
            }
            else if (e1[i] > e2[i])
            {
                return false;
            }
        }
        return true;
    }
    ,pow: function(k) {
        var self = this;
        k = +k;
        return 1 === k ? self : MultiPolyTerm(self.c.pow(k), array(self.e.length, function(i) {return stdMath.floor(self.e[i] * k);}), self.ring, self.order);
    }
    ,rad: function(k) {
        var self = this;
        k = +k;
        return 1 === k ? self : MultiPolyTerm(self.c.rad(k), array(self.e.length, function(i) {return stdMath.max(stdMath.floor(self.e[i] / k), stdMath.min(1, self.e[i]));}), self.ring, self.order);
    }
    ,toTerm: function(symbol, asTex, monomialOnly, asDec, precision) {
        var t = this, e = t.e, c = t.c, term,
            Arithmetic = Abacus.Arithmetic,
            I = Arithmetic.I, J = Arithmetic.J;
        term = symbol.reduce(true === asTex
        ? function(monom, sym, i) {
            return 0 < e[i] ? (monom /*+ (monom.length ? ' \\cdot ' : '')*/ + to_tex(sym) + (1 < e[i] ? ('^{' + Tex(e[i]) + '}') : '')) : monom;
        }
        : function(monom, sym, i) {
            return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1 < e[i] ? ('^' + String(e[i])) : '')) : monom;
        }, '');
        if (true !== monomialOnly)
        {
            if (true === asDec)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst() ? ('(' + c.toDec(precision) + ')') : (!c.isReal() ? ('(' + c.toDec(precision) + ')') : c.toDec(precision))))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst() ? '(' + c.toDec(precision) + ')' : c.toDec(precision));
            }
            else if (true === asTex)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst() ? ('(' + c.toTex() + ')') : (!c.isReal() ? ('(' + c.toTex() + ')') : c.toTex())))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst() ? '(' + c.toTex() + ')' : c.toTex());
            }
            else
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : ((is_instance(c, MultiPolynomial) && !c.isConst()) || (is_instance(c, RationalFunc) && (!c.isConst() || !c.den.equ(Arithmetic.I))) ? ('(' + c.toString() + ')*') : (!c.isReal() ? ('(' + c.toString() + ')*') : (c.toString(true) + '*'))))) + term) : ((is_instance(c, MultiPolynomial) && !c.isConst()) || (is_instance(c, RationalFunc) && (!c.isConst() || !c.den.equ(Arithmetic.I))) ? '(' + c.toString() + ')' : c.toString());
            }
        }
        return term;
    }
    ,toString: function() {
        var self = this, order = self.order;
        return '(' + self.c.toString() + ',[' + self.e.join(',') + '],"' + (GRADED & order ? (REVERSED & order ? 'grevlex' : 'grlex') : 'lex') + '")';
    }
});

// Abacus.MultiPolynomial, represents a multivariate polynomial in sparse representation
MultiPolynomial = Abacus.MultiPolynomial = Class(Poly, {

    constructor: function MultiPolynomial(terms, symbol, ring) {
        var self = this, Arithmetic = Abacus.Arithmetic, index;

        if (!is_instance(self, MultiPolynomial)) return new MultiPolynomial(terms, symbol, ring);

        if (is_instance(terms, Expr)) terms = MultiPolynomial.fromExpr(terms, symbol || ['x'], ring || Ring.Q());

        if (is_instance(terms, MultiPolynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = symbol || terms.symbol;
            if (!is_same_symbol(self.symbol, terms.symbol) || !self.ring.equ(terms.ring))
            {
                index = self.symbol.map(function(symbol) {return terms.symbol.indexOf(symbol);});
                self.terms = terms.terms.map(function(t) {
                    return MultiPolyTerm(t.c, array(self.symbol.length, function(i) {return -1 === index[i] ? 0 : t.e[index[i]];}), self.ring, t.order);
                });
            }
            else
            {
                self.terms = terms.terms.slice();
            }
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = is_array(symbol) && symbol.length ? symbol : [terms.symbol];
            index = self.symbol.indexOf(terms.symbol); if (-1 === index) index = 0;
            self.terms = terms.terms.map(function(t) {
                return MultiPolyTerm(t.c, array(self.symbol.length, function(i) {return i === index ? t.e : 0;}), self.ring, t.order);
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
                terms = MultiPolyTerm(terms, array(self.symbol.length, 0), self.ring, LEX);
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
                    self.terms = terms.map(function(c, e) {
                        return MultiPolyTerm(c, array(self.symbol.length, function(i) {return 0 === i ? e : 0;}), self.ring, LEX);
                    });
                }
                else
                {
                    self.terms = terms;
                }
            }
            else if (is_obj(terms))
            {
                self.terms = KEYS(terms).map(function(k) {
                    var e = array(self.symbol.length, 0),
                        c = terms[k], factors = k.split('*'),
                        i, l, ind, mono, symbol, exp;
                    for (i=0,l=factors.length; i<l; ++i)
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
                            e[-1 === ind ? 0 : ind] = exp;
                        }
                    }
                    return MultiPolyTerm(c, e, self.ring, LEX);
                });
            }
            else
            {
                self.terms = [];
            }
        }
        self.terms = self.terms.filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr);

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
                return MultiPolynomial.One(self.symbol, self.ring);
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        Term: MultiPolyTerm

        ,hasInverse: function() {
            return false;
        }

        ,Zero: function(symbol, ring) {
            return new MultiPolynomial([], symbol || ['x'], ring || Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new MultiPolynomial({'1':ring.One()}, symbol || ['x'], ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new MultiPolynomial({'1':ring.MinusOne()}, symbol || ['x'], ring);
        }
        ,Const: function(c, symbol, ring) {
            return new MultiPolynomial({'1':c || Abacus.Arithmetic.O}, symbol || ['x'], ring || Ring.Q());
        }

        ,cast: null // added below

        ,fromString: function(s, symbol, ring) {
            return MultiPolynomial.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || ['x'];
            if (!is_array(symbol)) symbol = [String(symbol || 'x')];
            return e.toPoly(symbol, ring, Complex.Symbol);
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

    ,dispose: function() {
        var self = this;
        self.terms = null;
        self.symbol = null;
        self.ring = null;
        if (self._n && (self === self._n._n))
        {
            self._n._n = null;
        }
        if (self._c && (self === self._c._c))
        {
            self._c._c = null;
        }
        self._n = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._expr = null;
        self._prim = null;
        return self;
    }
    ,isInt: function() {
        // has integer coefficients
        var self = this, terms = self.terms, i;
        if (is_class(self.ring.NumberClass, Integer)) return true;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isInt()) return false;
        return true;
    }
    ,isReal: function() {
        // has real coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return true;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isReal()) return false;
        return true;
    }
    ,isImag: function() {
        // has imaginary coefficients
        var self = this, terms = self.terms, i;
        if (!is_class(self.ring.NumberClass, Complex)) return false;
        for (i=terms.length-1; i>=0; --i)
            if (!terms[i].c.isImag()) return false;
        return true;
    }
    ,isComplex: function() {
        return is_class(this.ring.NumberClass, Complex);
    }
    ,isMono: function() {
        // is monomial
        var terms = this.terms;
        return (1 === terms.length) && ((!is_instance(terms[0].c, [MultiPolynomial, RationalFunc]) || terms[0].c.isMono()) && 0 !== cmp_exp_i(terms[0].e, [0]));
    }
    ,isConst: function() {
        var terms = this.terms;
        return (0 === terms.length) || ((1 === terms.length) && (!is_instance(terms[0].c, [MultiPolynomial, RationalFunc])  || terms[0].c.isConst()) && (0 === cmp_exp_i(terms[0].e, [0])));
    }
    ,isUni: function(x, strict) {
        // is univariate on symbol x
        var self = this, terms = self.terms, index, e, i, d;
        index = self.symbol.indexOf(String(x || self.symbol[0]));
        if (-1 === index) return false;
        strict = (true === strict); d = 0;
        for (i=terms.length-1; i>=0; --i)
        {
            e = terms[i].e;
            d = stdMath.max(d, e[index]);
            if (0 !== cmp_exp_i(e.slice(0, index).concat(e.slice(index+1)), [0]))
                return false;
        }
        return strict ? (0 !== d) : true;
    }
    ,deg: function(x) {
        // polynomial degree
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if (arguments.length)
        {
            index = symbol.indexOf(String(x || symbol[0]));
            return (-1 === index) || !terms.length ? 0 : terms[0].e[index];
        }
        return terms.length ? terms[0].e : array(symbol.length, 0);
    }
    ,maxdeg: function(x) {
        // polynomial maximum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if (arguments.length && (true === x))
        {
            return operate(function(max, xi) {
                return stdMath.max(max, self.maxdeg(xi));
            }, 0, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x || symbol[0])) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(max, t) {
            return stdMath.max(max, t.e[index]);
        }, 0, terms);
    }
    ,mindeg: function(x) {
        // polynomial minimum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if (arguments.length && (true === x))
        {
            return operate(function(min, xi) {
                return -1 === min ? self.mindeg(xi) : stdMath.min(min, self.mindeg(xi));
            }, -1, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x || symbol[0])) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(min, t) {
            var deg = t.e[index];
            return -1 === min ? deg : stdMath.min(min, deg);
        }, -1, terms);
    }
    ,term: function(i, as_degree, term_only) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol,
            term, t, j, n = terms.length, k, l = symbol.length, matched;
        if (true === as_degree)
        {
            if (is_array(i))
            {
                // match term which has i as degree
                term = MultiPolyTerm(0, i, ring);
                for (j=0; j<n; ++j)
                {
                    t = terms[j];
                    matched = true;
                    for (k=0; k<l; ++k)
                    {
                        if (t.e[k] !== i[k])
                        {
                            matched = false;
                            break;
                        }
                    }
                    if (matched)
                    {
                        term = t;
                        break;
                    }

                }
            }
            else
            {
                // match all terms which have i as aggregate degree
                term = terms.reduce(function(matched, t) {
                    if (i === t.e.reduce(addn, 0))
                        matched = MultiPolynomial([t], symbol, ring)._add(matched);
                    return matched;
                }, MultiPolynomial.Zero(symbol, ring));
            }
        }
        else
        {
            term = 0 <= i && i < n ? terms[i] : MultiPolyTerm(0, array(l, 0), ring);
        }
        return true === term_only ? term : (is_instance(term, MultiPolyTerm) ? MultiPolynomial([term], symbol, ring) : term);
    }
    ,ltm: function(asPoly, x) {
        // leading term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if (1 < arguments.length)
        {
            index = symbol.indexOf(String(x || 'x'));
            if ((-1 === index) || !terms.length) return true === asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(max, t) {
                if ((null == max) || (max.e[index] < t.e[index])) max = t;
                return max;
            }, MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring), terms);
            return true === asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if (true === asPoly) return MultiPolynomial(terms.length ? [terms[0]] : [], symbol, ring);
        return terms.length ? terms[0] : MultiPolyTerm(0, array(symbol.length, 0), ring);
    }
    ,ttm: function(asPoly, x) {
        // tail/last term (per symbol)
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol, index, term;
        if (1 < arguments.length)
        {
            index = symbol.indexOf(String(x || 'x'));
            if ((-1 === index) || !terms.length) return true === asPoly ? MultiPolynomial([], symbol, ring) : MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            term = operate(function(min, t) {
                if ((0 < t.e[index]) && ((null == min) || (min.e[index] > t.e[index]))) min = t;
                return min;
            }, null, terms) || MultiPolyTerm(ring.Zero(), array(symbol.length, 0), ring);
            return true === asPoly ? MultiPolynomial([term], symbol, ring) : term;
        }
        if (true === asPoly) return MultiPolynomial(terms.length ? [terms[terms.length-1]] : [], symbol, ring);
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
        return terms.length && (0 === cmp_exp_i(terms[terms.length-1].e, [0])) ? terms[terms.length-1].c : this.ring.Zero();
    }
    ,c: function() {
        // alias of cc()
        return this.cc();
    }
    ,order: function(order) {
        var self = this, o;
        if (!arguments.length)
        {
            if (self.terms.length)
            {
                o = self.terms[0].order;
                if (GRADED & o) return REVERSED & o ? 'grevlex' : 'grlex';
            }
            return 'lex';
        }
        if (null != order)
        {
            if (is_number(order))
            {
                o = order;
                order = LEX;
                if (o & GRADED)
                {
                    order |= GRADED;
                    if (o & REVERSED)
                    {
                        order |= REVERSED;
                    }
                }
            }
            else
            {
                order = String(order || '').toLowerCase();
                if ('grevlex' === order) order = GRADED | REVERSED | LEX;
                else if ('grlex' === order) order = GRADED | LEX;
                else order = LEX;
            }
            if (self.terms.length && (self.terms[0].order !== order))
            {
                return MultiPolynomial(self.terms.map(function(t) {
                    return MultiPolyTerm(t.c, t.e, self.ring, order);
                }), self.symbol, self.ring);
            }
        }
        return self;
    }
    ,monic: function(with_factor) {
        var self = this, p, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if (lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O) /*|| is_instance(lc, MultiPolynomial)*/) return true === with_factor ? [self, lc] : self;
        if (self.ring.isField())
        {
            p = MultiPolynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring);
        }
        else
        {
            divides = true; t = self.terms;
            for (i=t.length-1; i>0; --i)
            {
                if (!lc.divides(t[i].c))
                {
                    divides = false;
                    break;
                }
            }
            if (divides)
            {
                p = MultiPolynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring);
            }
            else if (lc.lt(Arithmetic.O))
            {
                // at least make positive
                p = self.neg();
                lc = self.ring.MinusOne();
            }
            else
            {
                p = self;
                lc = self.ring.One();
            }
        }
        return true === with_factor ? [p, lc] : p;
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
            else if (is_class(ring.PolynomialClass, [MultiPolynomial, RationalFunc]))
            {
                LCM = terms.reduce(function(LCM, t) {return t.c.den.mul(LCM);}, ring.One().num);
                coeffp = terms.map(function(t) {return t.c.mul(LCM).num;});
                content = MultiPolynomial.gcd(coeffp);
                coeffp = coeffp.map(function(c){return c.div(content);});
                // make positive lead
                if (coeffp[0].lt(Arithmetic.O))
                {
                    coeffp = coeffp.map(function(c) {return c.neg();});
                    content = content.neg();
                }
                self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring, terms[i].order);}), symbol, ring), field.create(RationalFunc(content, LCM).simpl())];
            }
            else if (is_class(ring.NumberClass, Complex))
            {
                isReal = self.isReal(); isImag = self.isImag();
                if (!isReal && !isImag)
                {
                    content = ring.gcd(terms.map(function(t) {return t.c;})).simpl();
                    self._prim = [MultiPolynomial(terms.map(function(t) {return MultiPolyTerm(t.c.div(content), t.e, ring, t.order);}), symbol, ring), content];
                }
                else if (isImag)
                {
                    LCM = terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.imag().den);}, Arithmetic.I);
                    coeffp = terms.map(function(t) {return t.c.mul(LCM).imag().num;});
                    content = gcd(coeffp);
                    coeffp = coeffp.map(function(c) {return Arithmetic.div(c, content);});
                    // make positive lead
                    if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                    {
                        coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                        content = Arithmetic.neg(content);
                    }
                    self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring, terms[i].order);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
                }
                else
                {
                    LCM = terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.real().den);}, Arithmetic.I);
                    coeffp = terms.map(function(t) {return t.c.mul(LCM).real().num;});
                    content = gcd(coeffp);
                    coeffp = coeffp.map(function(c) {return Arithmetic.div(c, content);});
                    // make positive lead
                    if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                    {
                        coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                        content = Arithmetic.neg(content);
                    }
                    self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring, terms[i].order);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t) {
                    return Arithmetic.mul(LCM, t.c.den);
                }, Arithmetic.I);
                coeffp = terms.map(function(t) {return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                // make positive lead
                if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                {
                    coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring, terms[i].order);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true === and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function() {
        var p = this.primitive(true);
        return p[1];
    }
    ,resultant: function(other, x) {
        return MultiPolynomial.Resultant(this, other, x);
    }
    ,discriminant: function(x) {
        return MultiPolynomial.Discriminant(this, x);
    }
    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(other))
        {
            return Arithmetic.equ(O, other) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === cmp_exp_i(t[0].e, [0])));
        }
        if (is_instance(other, Numeric))
        {
            return other.equ(O) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === cmp_exp_i(t[0].e, [0])));
        }
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
        {
            other = is_instance(other, Polynomial) ? MultiPolynomial(other, self.symbol, self.ring) : other;
            if (!is_same_symbol(self.symbol, other.symbol)) return false;
            t = self.terms;
            tp = other.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; --i)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        if (is_instance(other, RationalFunc))
        {
            return other.equ(self);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().equ(other);
        }
        if (is_string(other))
        {
            return (other === self.toString()) || (other === self.toTex());
        }
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst() || self.cc().gt(other);
        }
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, RationalFunc))
        {
            return other.lt(self);
        }
        if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 < MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().gt(other);
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst() || self.cc().gte(other);
        }
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, RationalFunc))
        {
            return other.lte(self);
        }
        if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 <= MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().gte(other);
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst() && self.cc().lt(other);
        }
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, RationalFunc))
        {
            return other.gt(self);
        }
        if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 > MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().lt(other);
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst() && self.cc().lte(other);
        }
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, RationalFunc))
        {
            return other.gte(self);
        }
        if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 >= MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        if (is_instance(other, Expr))
        {
            return self.toExpr().lte(other);
        }
        return false;
    }

    ,real: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
        {
            return MultiPolynomial(self.terms.map(function(t) {
                return MultiPolyTerm(t.c.real(), t.e, ring, t.order);
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
            return MultiPolynomial(self.terms.map(function(t) {
                return MultiPolyTerm(t.c.imag(), t.e, ring, t.order);
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
                self._c = MultiPolynomial(self.terms.map(function(t) {
                    return MultiPolyTerm(t.c.conj(), t.e, ring, t.order);
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
            self._n = MultiPolynomial(array(self.terms.length, function(i) {return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,_add: function(other) {
        return multi_add(other, this.clone(), false);
    }
    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().add(other);
        else if (is_instance(other, RationalFunc)) return other.add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? multi_add(other, self.clone(), false) : self;
    }
    ,_sub: function(other) {
        return multi_add(other, this.clone(), true);
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().sub(other);
        else if (is_instance(other, RationalFunc)) return other.neg().add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? multi_add(other, self.clone(), true) : self;
    }
    ,_mul: function(other) {
        return multi_mul(other, this.clone());
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().mul(other);
        else if (is_instance(other, RationalFunc)) return other.mul(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? multi_mul(other, self.clone()) : self;
    }
    ,_div: function(other, q_and_r) {
        return multi_div(this, other, true === q_and_r);
    }
    ,div: function(other, q_and_r) {
        var self = this;
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, Expr)) return self.toExpr().div(other);
        else if (is_instance(other, RationalFunc)) return RationalFunc(self).div(other);
        else if (is_instance(other, [Numeric, Poly]) || Abacus.Arithmetic.isNumber(other))
            return multi_div(self, other, true === q_and_r);
        return self;
    }
    ,multidiv: function(others, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true === q_and_r);
        if (is_instance(others, MultiPolynomial)) others = [others];
        if (!others || !others.length) return q_and_r ? [[], self] : [];

        others = others.map(function(q) {return self.ring.contains(q) ? MultiPolynomial.Const(q, self.symbol, self.ring) : q;});
        n = others.length;
        qs = array(n, function() {return [];});
        r = [];
        p = self.clone();
        while (p.terms.length/*!p.equ(Arithmetic.O)*/)
        {
            // Try to divide by a polynomial.
            plt = p.ltm(); divides = false;
            for (i=0; i<n; ++i)
            {
                xlt = others[i].ltm();
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
                p.terms = addition_sparse(p.terms, others[i].terms.map(function(xt) {return xt.mul(t);}), MultiPolyTerm, true, p.ring);
            }
            else
            {
                // None of them divided. Cancel and Move the leading term to r.
                p.terms.shift();
                if (q_and_r) r = addition_sparse(r, [plt], MultiPolyTerm, false, p.ring);
            }
        }
        qs = qs.map(function(qi) {
            qi = MultiPolynomial(qi, p.symbol, p.ring);
            return qi;
        });
        if (q_and_r)
        {
            r = MultiPolynomial(r, p.symbol, p.ring);
        }
        return q_and_r ? [qs, r] : qs;
    }
    ,_mod: function(other) {
        var qr = this._div(other, true);
        return qr[1];
    }
    ,mod: function(other) {
        var qr = this.div(other, true);
        return qr[1];
    }
    ,multimod: function(others) {
        var qr = this.multidiv(others, true);
        return qr[1];
    }
    ,_divmod: function(other) {
        return this._div(other, true);
    }
    ,divmod: function(other) {
        return this.div(other, true);
    }
    ,multidivmod: function(others) {
        return this.multidiv(others, true);
    }
    ,divides: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.equ(Arithmetic.O)) return false;
        if (self.ring.contains(other)) other = MultiPolynomial.Const(other, self.symbol, self.ring);
        if (is_instance(other, [RationalFunc, Expr])) return true;
        if (is_instance(other, [Polynomial, Numeric]) || Arithmetic.isNumber(other))
            other = MultiPolynomial(other, self.symbol, self.ring);
        if (is_instance(other, MultiPolynomial))
            return other.mod(self).equ(Arithmetic.O);
        return false;
    }
    ,_pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b, rsym = null;
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
            return multi_mul(self, self.clone());
        }
        else
        {
            // exponentiation by squaring
            b = self.clone();
            pow = MultiPolynomial.One(b.symbol, b.ring);
            while (0 !== n)
            {
                if (n & 1) pow = multi_mul(b, pow);
                n >>= 1;
                b = multi_mul(b, b);
            }
            return pow;
        }
    }
    ,pow: function(n) {
        return this._pow(n);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.equ(Arithmetic.I)) return self;
        return MultiPolynomial.kthroot(self, n);
    }
    ,substitute: function(v, xi) {
        var self = this, sub = {};
        xi = String(xi || self.symbol[0]);
        if (-1 < self.symbol.indexOf(xi))
        {
            sub[xi] = is_instance(v, Expr) ? v : (is_callable(v.toExpr) ? v.toExpr() : Expr('', v));
            return self.toExpr().compose(sub).toPoly(self.symbol, self.ring);
        }
        return self;
    }
    ,compose: function(q) {
        var self = this;
        q = q || {};
        return self.toExpr().compose(KEYS(q).reduce(function(e, x) {
            e[x] = is_instance(q[x], Poly) ? q[x].toExpr() : Expr('', x);
            return e;
        }, {})).toPoly(self.symbol, self.ring);
    }
    ,shift: function(x, s) {
        // shift <-> equivalent to multiplication/division by a monomial x^s
        var self = this, symbol = self.symbol, ring = self.ring,
            Arithmetic = Abacus.Arithmetic, index, t;
        x = String(x || symbol[0]);
        s = s || 0;
        s = Arithmetic.val(s);
        if (0 === s) return self;
        index = symbol.indexOf(x);
        if (-1 === index)
        {
            if (is_class(ring.PolynomialClass, [MultiPolynomial, RationalFunc]))
            {
                return MultiPolynomial(self.terms.map(function(term) {
                    return MultiPolyTerm(term.c.shift(x, s), term.e, ring, term.order);
                }));
            }
            else
            {
                ring = Ring(ring, symbol, false, true);
                if (0 > s)
                {
                    return MultiPolynomial.Zero([x], ring);
                }
                else
                {
                    t = {};
                    t[x+'^'+s] = self;
                    return MultiPolynomial(t, [x], ring);
                }
            }
        }
        x = symbol[index];
        if (0 > s) // division by monomial x^|s|
        {
            if (-s > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
            return MultiPolynomial(self.terms.map(function(term) {
                var k, e, i = index;
                term = term.clone();
                if (term.e[i] >= -s)
                    term.e[i] += s;
                else
                    term.c = ring.Zero();
                return term;
            }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        }
        //else if (0 < s) // multiplication by monomial x^s
        return MultiPolynomial(self.terms.map(function(term) {
            var i = index;
            term = term.clone();
            term.e[i] += s;
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
        index = symbol.indexOf(x);
        if (-1 === index)
        {
            if (is_class(ring.PolynomialClass, [MultiPolynomial, RationalFunc]))
            {
                return MultiPolynomial(self.terms.map(function(term) {
                    return MultiPolyTerm(term.c.d(x, n), term.e, ring, term.order);
                }));
            }
            else
            {
                return MultiPolynomial.Zero([x], Ring(ring, symbol));
            }
        }
        x = symbol[index];
        if (n > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
        dp = MultiPolynomial(self.terms.map(function(term) {
            var c, j, i = index;
            if (n > term.e[i])
            {
                return null;
            }
            else
            {
                term = term.clone();
                for (c=I,j=term.e[i]; j+n>term.e[i]; --j) c = Arithmetic.mul(c, j);
                term.c = term.c.mul(c); term.e[i] -= n;
                return term;
            }
        }).filter(MultiPolyTerm.isNonZero).sort(MultiPolyTerm.sortDecr), symbol, ring);
        return dp;
    }
    ,evaluate: function(x) {
        // recursive Horner scheme
        var self = this, symbol = self.symbol, ring = self.ring, O = ring.Zero(), memo = Obj();
        function get_val(p, x)
        {
            if (is_instance(p, [MultiPolynomial, RationalFunc]))
            {
                if ((1 === p.symbol.length) && (-1 < symbol.indexOf(p.symbol[0])))
                {
                    return horner(p, x, p.symbol[0]);
                }
                else if (p.ring.equ(ring.CoefficientRing))
                {
                    return p.evaluate(x);
                }
            }
            return p;
        }
        function horner(p, x, s)
        {
            var t = p.terms, str, i, j, v, xi, tc, is_ncomplex;
            if (!t.length) return O;
            // memoize, sometimes same subpolynomial is re-evaluated
            str = p.toString(); if (HAS.call(memo, str)) return memo[str];
            xi = (HAS.call(x, s) ? x[s] : O) || O;
            is_ncomplex = is_instance(xi, nComplex);
            //xi = ring.cast(xi);
            tc = get_val(t[0].c, x);
            i = t[0].e[0]; v = tc; j = 1;
            while (0 < i)
            {
                --i; v = is_ncomplex ? xi.mul(v) : v.mul(xi);
                if ((j < t.length) && (i === t[j].e[0]))
                {
                    tc = get_val(t[j].c, x);
                    v = v.add(tc);
                    ++j;
                }
            }
            memo[str] = v;
            return v;
        }
        return horner(self.univariate(), x || {}, symbol[0]);
    }
    ,univariate: function(x, as_field) {
        var p = this, s = p.symbol, index;
        // make a multivariate recursively univariate of univariates
        if (1 < s.length)
        {
            if (is_string(x))
            {
                index = s.indexOf(x);
                p = p.toExpr().toPoly([x], Ring(p.ring, s.slice(0, index).concat(s.slice(index+1)), false, true));
            }
            else
            {
                as_field = true === as_field;
                p = p.toExpr().toPoly([s[0]], s.slice(1).reverse().reduce(function(K, x) {
                    return Ring(K, [x], as_field, true);
                }, p.ring));
            }
        }
        return p;
    }
    ,multivariate: function(x) {
        var p = this, ring = p.ring;
        // unmake recursive univariate, make multivariate again on x
        if (1 < x.length)
        {
            while (ring.PolynomialSymbol)
            {
                if (is_array(ring.PolynomialSymbol))
                {
                    if (ring.PolynomialSymbol.filter(function(xi) {return -1 === x.indexOf(xi);}).length)
                    {
                        break;
                    }
                }
                else
                {
                    if (-1 === x.indexOf(ring.PolynomialSymbol))
                    {
                        break;
                    }
                }
                ring = ring.CoefficientRing;
            }
            p = p.toExpr().toPoly(x, ring);
        }
        return p;
    }
    ,toExpr: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, t, ti, c, x, i, l, term, terms;
        if (null == self._expr)
        {
            t = self.terms; x = self.symbol; terms = [];
            for (i=t.length-1; i>=0; --i)
            {
                ti = t[i]; c = ti.c;
                if (!c.equ(O))
                {
                    term = ti.toTerm(x, false, true);
                    c = c.toExpr();
                    if (term.length)
                    {
                        term = term.split('*').map(function(x) {
                            x = x.split('^');
                            return 1 < x.length ? Expr('^', [x[0], +x[1]]) : Expr('', x[0]);
                        });
                        terms.push(c.mul(1 < term.length ? Expr('*', term) : term[0]));
                    }
                    else
                    {
                        terms.push(c);
                    }
                }
            }
            self._expr = 1 < terms.length ? Expr('+', terms) : (1 === terms.length ? terms[0] : Expr.Zero());
        }
        return self._expr;
    }
    ,toString: function() {
        var self = this, t, ti, s, x, i, l, out = '';
        if (null == self._str)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; ++i)
            {
                ti = t[i]; s = trim(ti.toTerm(x));
                if (out.length) s = '-' === s.charAt(0) ? (' - ' + trim(s.slice(1))) : (' + ' + s);
                out += s;
            }
            self._str = out.length ? out : '0';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, t, ti, s, x, i, l, out = '';
        if (null == self._tex)
        {
            t = self.terms; x = self.symbol;
            for (i=0,l=t.length; i<l; ++i)
            {
                ti = t[i]; s = trim(ti.toTerm(x, true));
                if (out.length) s = '-' === s.charAt(0) ? (' - ' + trim(s.slice(1))) : (' + ' + s);
                out += s;
            }
            self._tex = out.length ? out : '0';
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, t, ti, x, i, l, out = '', prev = false, Arithmetic = Abacus.Arithmetic;
        t = self.terms; x = self.symbol;
        for (i=0,l=t.length; i<l; ++i)
        {
            ti = t[i];
            out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst()) || (is_instance(ti.c, RationalFunc) && (!ti.c.isConst() || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
            prev = true;
        }
        if (!out.length)
        {
            out = '0';
            if (is_number(precision) && 0 < precision) out += '.' + (new Array(precision+1).join('0'));
        }
        return out;
    }
});
MultiPolynomial.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast(function(a) {
        return is_instance(a, MultiPolynomial) && is_same_symbol(symbol, a.symbol) && ring.equ(a.ring);
    }, function(a) {
        return is_string(a) ? MultiPolynomial.fromString(a, symbol, ring) : new MultiPolynomial(a, symbol, ring);
    });
    return type_cast(a);
};

var PiecewisePolynomial = Class(Poly, {
    constructor: function PiecewisePolynomial(segments, defaultValue, symbol, ring) {
        var self = this;
        if (!is_instance(self, PiecewisePolynomial)) return new PiecewisePolynomial(segments, defaultValue, symbol, ring);

        self.ring = ring || Ring.Q();
        self.symbol = symbol || 'x';
        self.segments = segments.map(function(s) {
            if (is_instance(s, Polynomial))
            {
                s = {
                    poly: s,
                    cond: function(x, i, n) {return x.lte(self.ring.create(i+1).div(n));},
                    trans: function(x, i, n) {return x.sub(self.ring.create(i).div(n)).mul(n);}
                };
            }
            else if (is_obj(s))
            {
                if (!is_instance(s.poly, Polynomial))
                    s.poly = Polynomial([self.ring.cast(s.poly||0)], self.symbol, self.ring);
                if (is_instance(s.cond, Numeric))
                    s.cond = (function(x1) {return function(x, i, n) {return x.lte(x1);};})(self.ring.cast(s.cond||0));
                else if (!is_callable(s.cond))
                    s.cond = function(x, i, n) {return x.lte(self.ring.create(i+1).div(n));};
                if (is_instance(s.trans, Numeric))
                    s.cond = (function(x1) {return function(x, i, n) {return x.sub(x1);};})(self.ring.cast(s.trans||0));
                else if (!is_callable(s.trans))
                    s.trans = function(x, i, n) {return x.sub(self.ring.create(i).div(n)).mul(n);};
            }
            return s;
        });
        self.defaultValue = self.ring.cast(defaultValue || 0);
    }

    ,segments: null
    ,defaultValue: null
    ,symbol: null
    ,ring: null

    ,dispose: function() {
        var self = this;
        self.segments = null;
        self.defaultValue = null;
        self.symbol = null;
        self.ring = null;
        return self;
    }
    ,evaluate: function(x) {
        var self = this, i, n = self.segments.length, s;
        x = self.ring.cast(x);
        for (i=0; i<n; ++i)
        {
            s = self.segments[i];
            if (s.cond(x, i, n)) return s.poly.evaluate(s.trans(x, i, n));
        }
        return self.defaultvalue;
    }
    ,toString: function() {
        return "{\n" + this.segments.map(function(s) {return s.poly.toString();}).join("\n") + "\n}";
    }
    ,toTex: function() {
        return "\\begin{cases} " + this.segments.map(function(s, i) {return s.poly.toTex()/*+" & "+String(i)*/;}).join("\\\\") + " \\end{cases}";
    }
});
Polynomial.Piecewise = PiecewisePolynomial;

// polynomial utilities
function is_same_symbol(symbol1, symbol2)
{
    if (symbol1 === symbol2) return true;
    if (is_string(symbol1) && is_array(symbol2)) symbol1 = [symbol1];
    if (is_string(symbol2) && is_array(symbol1)) symbol2 = [symbol2];
    if (is_array(symbol1) && is_array(symbol2))
    {
        if (symbol1.length !== symbol2.length) return false;
        var i = 0, n = symbol1.length;
        while ((i < n) && (symbol1[i] === symbol2[i])) ++i;
        return i >= n;
    }
    return false;
}
function ensure_same_monomial_order(q, p)
{
    return p.terms.length ? q.order(p.terms[0].order) : q;
}
function cmp_monomial_weighted(e1, e2, w)
{
    var wl = w.length;
    return (e1.reduce(function(sum, e, i) {
        return sum + e*(i < wl ? w[i] : 0);
    }, 0)) - (e2.reduce(function(sum, e, i) {
        return sum + e*(i < wl ? w[i] : 0);
    }, 0));
}
function cmp_monomial_total_deg(e1, e2)
{
    return (e1.reduce(function(sum, e, i) {return sum + e;}, 0)) - (e2.reduce(function(sum, e, i) {return sum + e;}, 0));
}
function cmp_monomial_lex(e1, e2, dir)
{
    var l1 = e1.length, l2 = e2.length, l = stdMath.max(l1, l2), /*w = array(l, 0),*/ i, res = 0;
    if (-1 === dir)
    {
        i = l - 1;
        while ((i >= 0) && (0 === res))
        {
            res = (i < l1 ? e1[i] : 0) - (i < l2 ? e2[i] : 0);
            /*w[i] = 1;
            res = cmp_monomial_weighted(e1, e2, w);
            w[i] = 0;*/ --i;
        }
    }
    else
    {
        i = 0;
        while ((i < l) && (0 === res))
        {
            res = (i < l1 ? e1[i] : 0) - (i < l2 ? e2[i] : 0);
            /*w[i] = 1;
            res = cmp_monomial_weighted(e1, e2, w);
            w[i] = 0;*/ ++i;
        }
    }
    return res;
}
function cmp_monomial_grlex(e1, e2)
{
    var l = stdMath.max(e1.length, e2.length), res = /*cmp_monomial_weighted(e1, e2, array(l, 1))*/cmp_monomial_total_deg(e1, e2);
    return 0 === res ? cmp_monomial_lex(e1, e2, 1) : res;
}
function cmp_monomial_grevlex(e1, e2)
{
    var l = stdMath.max(e1.length, e2.length), res = /*cmp_monomial_weighted(e1, e2, array(l, 1))*/cmp_monomial_total_deg(e1, e2);
    return 0 === res ? -cmp_monomial_lex(e1, e2, -1) : res;
}
function cmp_exp_i(e1, e2, i)
{
    if (null == i) i = 0;
    if (i >= e1.length && i >= e2.length)
        return 0;
    else if (i >= e2.length)
        return 0 === e1[i] ? cmp_exp_i(e1, e2, i+1) : e1[i];
    else if (i >= e1.length)
        return 0 === e2[i] ? cmp_exp_i(e1, e2, i+1) : -e2[i];
    else if (e1[i] === e2[i])
        return cmp_exp_i(e1, e2, i+1);
    return e1[i] - e2[i];
}
function addition_sparse(a, b, TermClass, do_subtraction, ring)
{
    // O(n1+n2) ~ O(max(n1,n2))
    // assume a, b are arrays of **non-zero only** coeffs of PolyTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    do_subtraction = (true === do_subtraction);
    TermClass = TermClass === MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var O = Abacus.Arithmetic.O;
    return merge_sequences(
        a, b,
        function(a, b) {
            if (null == b)
            {
                a = a.cast(ring);
                return a.equ(O) ? null : a;
            }
            else if (null == a)
            {
                b = (do_subtraction ? b.neg() : b).cast(ring);
                return b.equ(O) ? null : b;
            }
            else
            {
                a = (do_subtraction ? a.sub(b) : a.add(b)).cast(ring);
                return a.equ(O) ? null : a;
            }
        },
        function(a, b) {
            return -TermClass.cmp(a, b);
        }
    );
}
function multiplication_sparse(a, b, TermClass, ring)
{
    // O(log(n1)*n1*n2)
    // assume a, b are arrays of **non-zero only** coeffs of PolyTerm class of coefficient and exponent already sorted in exponent decreasing order
    // merge terms by efficient merging and produce already sorted order c
    // eg http://www.cecm.sfu.ca/~mmonagan/teaching/TopicsinCA11/johnson.pdf
    // and https://www.researchgate.net/publication/333182217_Algorithms_and_Data_Structures_for_Sparse_Polynomial_Arithmetic
    // and https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    TermClass = TermClass === MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var k, t, n1, n2, c, f, max, heap, O = Abacus.Arithmetic.O;
    if (a.length > b.length) {t = a; a = b; b = t;} // swap to achieve better performance
    n1 = a.length; n2 = b.length; c = new Array(n1*n2);
    if ((0 < n1) && (0 < n2))
    {
        k = 0;
        c[0] = TermClass(0, a[0].mul(b[0]).e, ring, a[0].order);
        heap = Heap(array(n1, function(i) {
            return [a[i].cast(ring).mul(b[0].cast(ring)), i];
        }), "max", function(a, b) {
            return TermClass.cmp(a[0], b[0]);
        });
        f = array(n1, 0);
        while (max=heap.peek())
        {
            if (0 !== TermClass.cmp(c[k], max[0]))
            {
                if (!c[k].equ(O)) c[++k] = TermClass(0, 0, ring, a[0].order);
                c[k].e = max[0].e;
            }
            c[k] = c[k].add(max[0]);
            ++f[max[1]];
            if (f[max[1]] < n2) heap.replace([a[max[1]].cast(ring).mul(b[f[max[1]]].cast(ring)), max[1]]);
            else heap.pop();
        }
        heap.dispose();
        if (c.length > k+1) c.length = k+1; // truncate if needed
    }
    return c;
}
function division_sparse(a, b, TermClass, q_and_r, ring)
{
    // sparse polynomial reduction/long division
    // https://www.semanticscholar.org/paper/High-Performance-Sparse-Multivariate-Polynomials%3A-Brandt/016a97690ecaed04d7a60c1dbf27eb5a96de2dc1
    q_and_r = (true === q_and_r);
    TermClass = TermClass === MultiPolyTerm ? MultiPolyTerm : UniPolyTerm;
    ring = ring || Ring.Q();
    var na = a.length, nb = b.length, O = Abacus.Arithmetic.O,
        heap = Heap([], "max", function(a, b) {return TermClass.cmp(a.term, b.term);}),
        q = [], r = [], k = 0, d, res, Q, b0;

    if (!b.length) return null;
    b0 = b[0].cast(ring);
    while ((d=heap.peek()) || (k < na))
    {
        if ((null == d) || ((k < na) && (0 > TermClass.cmp(d.term, a[k]))))
        {
            res = a[k].cast(ring);
            ++k;
        }
        else if ((k < na) && (0 === TermClass.cmp(d.term, a[k])))
        {
            res = a[k].cast(ring).sub(d.term);
            if (nb > d.n)
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
            ++k;

            //if (res.equ(O)) continue; // zero coefficient, skip
        }
        else
        {
            res = d.term.neg();
            if (nb > d.n)
                heap.replace({term:d.Q.mul(b[d.n].cast(ring)), n:d.n+1, Q:d.Q});
            else
                heap.pop();
        }
        if (res.equ(O)) continue; // zero coefficient, skip

        if (b0.divides(res))
        {
            Q = res.div(b0);
            q = addition_sparse(q, [Q], TermClass, false, ring);
            if (nb > 1)
                heap.push({term:Q.mul(b[1].cast(ring)), n:2, Q:Q});
        }
        else if (q_and_r)
        {
            r = addition_sparse(r, [res], TermClass, false, ring);
        }
    }
    heap.dispose();

    return q_and_r ? [q, r] : q;
}
function uni_add(x, P, do_sub)
{
    var Arithmetic = Abacus.Arithmetic, res, symbol;
    // O(max(n1,n2))
    if (is_instance(x, Polynomial))
    {
        if (x.symbol === P.symbol)
        {
            // O(max(n1,n2))
            if (x.terms.length)
                P.terms = addition_sparse(P.terms, x.terms, UniPolyTerm, true === do_sub, P.ring);
        }
        else
        {
            // upgrade to multivariate polynomial
            symbol = P.symbol > x.symbol ? [x.symbol, P.symbol] : [P.symbol, x.symbol];
            return multi_add(MultiPolynomial(x, symbol, P.ring), MultiPolynomial(P, symbol, P.ring), do_sub);
        }
    }
    else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
    {
        // O(1)
        x = UniPolyTerm(x, 0, P.ring);
        if (!x.equ(Arithmetic.O))
        {
            res = P.terms.length ? addition_sparse([P.terms.pop()], [x], UniPolyTerm, true === do_sub, P.ring) : [x];
            P.terms = P.terms.concat(res);
        }
    }
    return P;
}
function uni_mul(x, P)
{
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
            return multi_mul(MultiPolynomial(x, symbol, x.ring), MultiPolynomial(P, symbol, P.ring));
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
            for (i=P.terms.length-1; i>=0; --i)
                P.terms[i] = P.terms[i].mul(x);
        }
    }
    return P;
}
function uni_div(P, x, q_and_r)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, symbol, q/*, r, d, diff, diff0*/;
    q_and_r = (true === q_and_r);

    if (is_instance(x, Polynomial))
    {
        if (!x.terms.length) throw new Error('Division by zero in Abacus.Polynomial!');
        if (x.isConst())
        {
            // constant polynomial, simple numeric division
            x = x.cc();
            q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i) {
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
                r = uni_add(uni_mul(q[diff], d), r, true);
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
            return multi_div(MultiPolynomial(P, symbol, P.ring), MultiPolynomial(x, symbol, x.ring), q_and_r);
        }
    }
    else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
    {
        /*if (Arithmetic.isNumber(x))*/ x = P.ring.cast(x);
        if (x.equ(O)) throw new Error('Division by zero in Abacus.Polynomial!');
        q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i) {
            return P.terms[i].div(x);
        }), P.symbol, P.ring);
        return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
    }
    return P;
}
function multi_add(x, P, do_sub)
{
    var Arithmetic = Abacus.Arithmetic, res;
    if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

    if (is_instance(x, MultiPolynomial))
    {
        // O(max(n1,n2))
        if (x.terms.length)
        {
            x = ensure_same_monomial_order(x, P);
            P.terms = addition_sparse(P.terms, x.terms, MultiPolyTerm, true === do_sub, P.ring);
        }
    }
    else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
    {
        // O(1)
        x = MultiPolyTerm(x, array(P.symbol.length, 0), P.ring, P.terms[0].order);
        if (!x.equ(Arithmetic.O))
        {
            res = P.terms.length ? addition_sparse([P.terms.pop()], [x], MultiPolyTerm, true === do_sub, P.ring) : [x];
            P.terms = P.terms.concat(res);
        }
    }
    return P;
}
function multi_mul(x, P)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, i;
    if (!P.terms.length) return P;

    if (is_instance(x, Polynomial))
        x = MultiPolynomial(x, P.symbol, P.ring);

    if (is_instance(x, MultiPolynomial))
    {
        // O(n1*n2)
        if (x.terms.length)
        {
            x = ensure_same_monomial_order(x, P);
            P.terms = multiplication_sparse(P.terms, x.terms, MultiPolyTerm, P.ring);
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
            for (i=P.terms.length-1; i>=0; --i)
                P.terms[i] = P.terms[i].mul(x);
        }
    }
    return P;
}
function multi_div(P, x, q_and_r)
{
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, rsym, q/*, r, d, diff, diff0*/;
    q_and_r = (true === q_and_r);

    if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

    if (is_instance(x, MultiPolynomial))
    {
        if (!x.terms.length) throw new Error('Division by zero in Abacus.MultiPolynomial!');

        x = ensure_same_monomial_order(x, P);
        if (x.isConst())
        {
            // constant polynomial, simple numeric division
            x = x.cc();
            q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i) {
                return P.terms[i].div(x);
            }), P.symbol, P.ring);
            return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
        }
        // sparse polynomial reduction/long division
        P = ensure_same_monomial_order(P, x);
        q = division_sparse(P.terms, x.terms, MultiPolyTerm, q_and_r, P.ring);
        q = q_and_r ? [MultiPolynomial(q[0], P.symbol, P.ring), MultiPolynomial(q[1], P.symbol, P.ring)] : MultiPolynomial(q, P.symbol, P.ring);
        return q;
    }
    else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
    {
        /*if (Arithmetic.isNumber(x))*/ x = P.ring.cast(x);
        if (x.equ(O)) throw new Error('Division by zero in Abacus.MultiPolynomial!');
        q = x.equ(I) ? P : MultiPolynomial(array(P.terms.length, function(i) {
            return P.terms[i].div(x);
        }), P.symbol, P.ring);
        return q_and_r ? [q, MultiPolynomial.Zero(P.symbol, P.ring)] : q;
    }
    return P;
}
function poly_interpolate(v, x, ring)
{
    // https://en.wikipedia.org/wiki/Lagrange_polynomial
    // https://en.wikipedia.org/wiki/Newton_polynomial
    ring = ring || Ring.Q();
    var I = ring.One(), n, d, f, vi, hash, dupl;
    if (!v || !v.length) return Polynomial.Zero(x, ring);
    if (is_args(v)) v = slice.call(v);
    if (!is_array(v[0])) v = [v];
    v = v.map(function(vi) {
        return [ring.cast(vi[0]), (is_instance(vi[1], [Poly, RationalFunc]) ? vi[1] : ring.cast(vi[1]))];
    });
    // check and filter out duplicate values
    hash = Obj(); dupl = [];
    for (n=0; n<v.length; ++n)
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
    d = array(n, function(j) {
        var i, dj = I;
        for (i=0; i<n; ++i)
        {
            if (i === j) continue;
            dj = dj.mul(v[j][0].sub(v[i][0]));
        }
        dj = v[j][1].div(dj);
        return dj;
    });
    // Set-up numerator factors
    f = array(n, function(i) {
        var terms = {};
        terms[x] = I;
        terms['1'] = v[i][0].neg();
        return Polynomial(terms, x, ring);
    });
    // Produce each Lj in turn, and sum into p
    return operate(function(p, j) {
        return p._add(operate(function(Lj, i){
            if (j !== i) Lj = Lj._mul(f[i]);
            return Lj;
        }, Polynomial.Const(d[j], x, ring), null, 0, n-1));
    }, Polynomial.Zero(x, ring), null, 0, n-1);
}
function spoly_interpolate(v, x, ring, PolynomialClass)
{
    // https://en.wikipedia.org/wiki/Lagrange_polynomial
    // https://en.wikipedia.org/wiki/Newton_polynomial
    PolynomialClass = PolynomialClass || Polynomial;
    ring = ring || Ring.Q();
    var I = ring.One(), n, d, f, vi, hash, dupl;
    if (!v || !v.length) return PolynomialClass.Zero(x, ring);
    if (is_args(v)) v = slice.call(v);
    if (!is_array(v[0])) v = [v];
    v = v.map(function(vi) {
        return [ring.cast(vi[0]), (is_instance(vi[1], [Poly, RationalFunc]) ? vi[1] : ring.cast(vi[1]))];
    });
    // check and filter out duplicate values
    hash = Obj(); dupl = [];
    for (n=0; n<v.length; ++n)
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
    d = array(n, function(j) {
        var i, dj = I;
        for (i=0; i<n; ++i)
        {
            if (i === j) continue;
            dj = dj.mul(v[j][0].sub(v[i][0]));
        }
        dj = v[j][1].div(dj);
        return dj.toExpr();
    });
    // Set-up numerator factors
    f = array(n, function(i) {
        return Expr('-', [Expr('', x), Expr('', v[i][0])]);
    });
    // Produce each Lj in turn, and sum into p
    return operate(function(p, j) {
        return p.add(operate(function(Lj, i){
            if (j !== i) Lj = Lj.mul(f[i]);
            return Lj;
        }, d[j], null, 0, n-1));
    }, Expr.Zero(), null, 0, n-1).toPoly(is_class(PolynomialClass, MultiPolynomial) ? [x] : x, ring);
}
function symbolic_divisors(c)
{
    var Arithmetic = Abacus.Arithmetic;
    if (is_instance(c, Numeric) || Arithmetic.isNumber(c))
    {
        return is_instance(c, Complex) && !c.isReal() && !c.isImag()
            ? Iterator([Complex.One(), Complex.Img()])
            : Iterator((function(c, imag) {
            var iter_num = divisors(Arithmetic.abs(c.num), true),
                iter_den = divisors(c.den, true),
                num, den;
            return function(curr, dir, state, init) {
                if (init)
                {
                    iter_num.rewind();
                    iter_den.rewind();
                    den = iter_den.next();
                }
                num = iter_num.next();
                if (null == num)
                {
                    iter_num.rewind();
                    num = iter_num.next();
                    den = iter_den.next();
                }
                if (null == den) return null;
                return imag ? Complex(0, Rational(num, den)) : (is_instance(c, Integer) ? Integer(num) : Rational(num, den));
            };
        })(Arithmetic.isNumber(c) ? Integer(c) : (c.isImag() ? c.imag() : c.real()), c.isImag()));
    }
    else if (is_instance(c, RationalFunc))
    {
        return Iterator((function(c) {
            var iter_num = symbolic_divisors(c.num),
                iter_den = symbolic_divisors(c.den),
                num, den;
            return function(curr, dir, state, init) {
                if (init)
                {
                    iter_num.rewind();
                    iter_den.rewind();
                    den = iter_den.next();
                }
                num = iter_num.next();
                if (null == num)
                {
                    iter_num.rewind();
                    num = iter_num.next();
                    den = iter_den.next();
                }
                if (null == den) return null;
                return RationalFunc(num, den);
            };
        })(c));
    }
    else if (is_instance(c, MultiPolynomial))
    {
        // c.content(); ??
        if (1 !== c.terms.length) c = MultiPolynomial.One(c.symbol, c.ring);
        return Iterator((function(p, t, e) {
            var iter_c = symbolic_divisors(t.c),
                iter_s = e.length ? Tensor(e.map(function(ei) {return ei+1;})) : null,
                c = null, x = null;
            return function(curr, dir, state, init) {
                if (init)
                {
                    iter_c.rewind();
                    if (iter_s)
                    {
                        iter_s.rewind();
                        c = iter_c.next();
                    }
                }
                if (iter_s)
                {
                    x = iter_s.next();
                    if (null == x)
                    {
                        iter_s.rewind();
                        x = iter_s.next();
                        c = iter_c.next();
                    }
                }
                else
                {
                    c = iter_c.next();
                }
                if (null == c) return null;
                var j = 0;
                return MultiPolynomial([MultiPolyTerm(c, t.e.map(function(ei) {
                    return 0 === ei ? 0 : x[j++];
                }), p.ring)], p.symbol, p.ring);
            };
        })(c, c.terms[0], c.terms[0].e.filter(function(ei) {return 0 !== ei;})));
    }
    return symbolic_divisors(Arithmetic.I);
}
function polyfactor(p)
{
    // Kronecker method to factorize p over the integers/rationals
    var i, j, n, y, v, d, q,
        r = p.ring, x = p.symbol,
        Arithmetic = Abacus.Arithmetic,
        O = Arithmetic.O;
    for (d=1,n=(p.deg()>>1); d<=n; ++d)
    {
        y = array(d+1, d>>1, -1).map(function(xi) {
            xi = r.cast(xi);
            return [xi, p.evaluate(xi)];
        });
        for (i=d; i>=0; --i)
        {
            if (y[i][1].equ(O))
            {
                // found linear factor
                var terms = {};
                terms[x] = r.One();
                terms['1'] = y[i][0].neg();
                return Polynomial(terms, x, r);
            }
            else
            {
                y[i][1] = Iterator((function(yi) {
                    var iter = symbolic_divisors(yi), s, d;
                    return function(curr, dir, state, init) {
                        if (init)
                        {
                            iter.rewind();
                            s = 1;
                            d = iter.next();
                        }
                        if (null == d) return null;
                        var sd = -1 === s ? d.neg() : d;
                        s = -s;
                        if (1 === s) d = iter.next();
                        return sd;
                    };
                })(y[i][1]));
            }
        }
        v = new Array(y.length);
        i = d;
        for (;;)
        {
            while ((0 <= i) && !y[i][1].hasNext())
            {
                y[i][1].rewind();
                v[i] = [y[i][0], y[i][1].next()];
                --i;
            }
            if (0 > i) break;
            v[i] = [y[i][0], y[i][1].next()];
            if (null == v[0])
            {
                for (j=0; j<i; ++j)
                {
                    v[j] = [y[j][0], y[j][1].next()];
                }
            }
            q = poly_interpolate(v, x, r);
            console.log(String(q));
            // found factor
            if ((0 < q.deg()) /*&& Arithmetic.equ(O, Arithmetic.mod(p.lc().real().num, q.lc().real().num)) && Arithmetic.equ(O, Arithmetic.mod(p.tc().real().num, q.tc().real().num))*/ && p.mod(q).equ(O)) return q;
            i = d;
        }
    }
}
/*function mpolyfactor(p, i)
{
    // Extended Kronecker method to factorize p over the integers/rationals
    var pp, q, k;
    if (null == i) i = p.symbol.length;
    if (1 === i)
    {
        q = polyfactor(Polynomial(p, p.symbol[0], p.ring));
        if (!q) return null;
        q = MultiPolynomial(q, p.symbol, p.ring);
        return [q, p.div(q)];
    }
    else if (1 < i)
    {
        q = mpolyfactor(p.symbol.slice(0, -1).reduce(function(p, xi) {
            return p.substitute(1, xi);
        }, p), 1);
        if (!q) return null;
        k = q.maxdeg(p.symbol[p.symbol.length-1]);
    }
    return null;
}*/
function poly_linear_roots(poly)
{
    if (!poly.ring.isField()) poly = Polynomial(poly, poly.symbol, poly.ring.associatedField());
    // return Expr(s)
    // https://en.wikipedia.org/wiki/Linear_equation
    // ax + b
    var a = poly.term(1, true, true).c,
        b = poly.term(0, true, true).c;
    if (a.equ(0)) return null;
    if (b.equ(0)) return [Expr.Zero(), 1];

    // a!=0, x = -b/a
    return [
        [b.neg().div(a).toExpr(), 1]
    ];
}
function poly_quadratic_roots(poly)
{
    if (!poly.ring.isField()) poly = Polynomial(poly, poly.symbol, poly.ring.associatedField());
    // return Expr(s)
    // https://en.wikipedia.org/wiki/Quadratic_equation
    // ax^2 + bx + c
    var a = poly.term(2, true, true).c,
        b = poly.term(1, true, true).c,
        c = poly.term(0, true, true).c;
    if (a.equ(0)) return poly_linear_roots(poly);
    if (c.equ(0)) return poly_linear_roots(poly.shift(-1)).reduce(function(roots, r) {
            if (r[0].equ(0)) ++roots[0][1];
            else roots.push(r);
            return roots;
        }, [Expr.Zero(), 1]);

    // a!=0, x = -(b +/- sqrt(b^2 - 4ac)) / 2a
    var discriminant = b.pow(2).sub(a.mul(c).mul(4)), roots;
    if (discriminant.equ(0))
    {
        // double root
        roots = [
            [b.neg().toExpr().div(a.mul(2).toExpr()), 2]
        ];
    }
    else
    {
        // two roots
        discriminant = Expr('*', [discriminant.lt(0) ? Complex.Img().toExpr() : Expr.One(), Expr('^', [discriminant.abs().toExpr(), 1/2])]);
        a = a.mul(2).toExpr();
        b = b.toExpr();
        roots = [
            [Expr('*', [-1, Expr('/', [Expr('+', [b, discriminant]), a])]), 1],
            [Expr('*', [-1, Expr('/', [Expr('-', [b, discriminant]), a])]), 1]
        ];
    }
    return roots;
}
function poly_cubic_roots(poly)
{
    if (!poly.ring.isField()) poly = Polynomial(poly, poly.symbol, poly.ring.associatedField());
    // return Expr(s)
    // https://en.wikipedia.org/wiki/Cubic_equation
    // ax^3 + bx^2 + cx + d
    var a = poly.term(3, true, true).c,
        b = poly.term(2, true, true).c,
        c = poly.term(1, true, true).c,
        d = poly.term(0, true, true).c;
    if (a.equ(0)) return poly_quadratic_roots(poly);
    if (d.equ(0)) return poly_quadratic_roots(poly.shift(-1)).reduce(function(roots, r) {
            if (r[0].equ(0)) ++roots[0][1];
            else roots.push(r);
            return roots;
        }, [Expr.Zero(), 1]);
/*
https://www.wolframalpha.com/input?i=ax%5E3+%2B+bx%5E2+%2Bcx+%2Bd+%3D0

a!=0, x = (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3)/(3 2^(1/3) a) - (2^(1/3) (3 a c - b^2))/(3 a (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3)) - b/3a

a!=0, x = -((1 - i sqrt(3)) (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3))/(6 2^(1/3) a) + ((1 + i sqrt(3)) (3 a c - b^2))/(3 2^(2/3) a (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3)) - b/3a

a!=0, x = -((1 + i sqrt(3)) (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3))/(6 2^(1/3) a) + ((1 - i sqrt(3)) (3 a c - b^2))/(3 2^(2/3) a (sqrt((-27 a^2 d + 9 a b c - 2 b^3)^2 + 4 (3 a c - b^2)^3) - 27 a^2 d + 9 a b c - 2 b^3)^(1/3)) - b/3a
*/
    var
        ap2 = a.mul(a),
        ap3 = ap2.mul(a),
        ac = a.mul(c),
        bp2 = b.mul(b),
        bp3 = bp2.mul(b),
        abc = ac.mul(b),
        ap2d = ap2.mul(d),
        // depressed cubic
        a3 = a.mul(3),
        b_3a = b.div(a3).neg(),
        p = ac.mul(3).sub(bp2).div(ap2.mul(3)),
        q = bp3.mul(2).sub(abc.mul(9)).add(ap2d.mul(27)).div(ap3.mul(27)),
        discriminant = (p.pow(3).mul(4).add(q.pow(2).mul(27))).neg(),
        Delta_0, Delta_1, D, C, isqrt3, roots
    ;

    if (discriminant.equ(0))
    {
        if (p.equ(0))
        {
            // triple root
            roots = [
                [b_3a.toExpr(), 3]
            ];
        }
        else
        {
            // simple and double roots
            roots = [
                [q.mul(3).div(p).add(b_3a).toExpr(), 1], // simple root
                [q.mul(3).neg().div(p.mul(2)).add(b_3a).toExpr(), 2], // double root
            ];
        }
    }
    else
    {
        Delta_0 = bp2.sub(ac.mul(3));
        Delta_1 = bp3.mul(2).sub(abc.mul(9)).add(ap2d.mul(27));
        if (Delta_0.equ(0) && Delta_1.equ(0))
        {
            // triple root
            roots = [
                [b_3a.toExpr(), 3]
            ];
        }
        else
        {
            // three roots
            Delta_0 = Delta_0.toExpr();
            Delta_1 = Delta_1.toExpr();
            D = Expr('^', [
                Expr('-', [
                    Expr('^', [
                        Delta_1,
                        2
                    ]),
                    Expr('*', [
                        4,
                        Expr('^', [
                            Delta_0,
                            3
                        ])
                    ])
                ]),
                1/2
            ]);
            if (Delta_1.add(D).expand().equ(0))
            {
                D = D.neg();
            }
            C = Expr('^', [Expr('/', [Expr('+', [Delta_1, D]), 2]), Rational(1, 3)]);
            isqrt3 = Expr('*', [Complex.Img().toExpr(), Expr('^', [3, 1/2])]);
            roots = ([
                // 3-roots of unity
                Expr.One(),
                Expr('/', [Expr('+', [-1, isqrt3]), 2]),
                Expr('/', [Expr('-', [-1, isqrt3]), 2])
            ]).map(function(z) {
                return [Expr('*', [
                    a3.inv().neg(),
                    Expr('+', [
                        b,
                        Expr('*', [z, C]),
                        Expr('/', [Delta_0, Expr('*', [z, C])])
                    ])
                ]), 1];
            });
        }
    }
    return roots;
}
function poly_quartic_roots(poly)
{
    if (!poly.ring.isField()) poly = Polynomial(poly, poly.symbol, poly.ring.associatedField());
    // return Expr(s)
    // https://en.wikipedia.org/wiki/Quartic_equation
    // ax^4 + bx^3 + cx^2 + dx + e
    var a = poly.term(4, true, true).c,
        b = poly.term(3, true, true).c,
        c = poly.term(2, true, true).c,
        d = poly.term(1, true, true).c,
        e = poly.term(0, true, true).c;
    if (a.equ(0)) return poly_cubic_roots(poly);
    if (e.equ(0)) return poly_cubic_roots(poly.shift(-1)).reduce(function(roots, r) {
            if (r[0].equ(0)) ++roots[0][1];
            else roots.push(r);
            return roots;
        }, [Expr.Zero(), 1]);
    if (b.equ(0) && d.equ(0)) return poly_quadratic_roots(Polynomial([UniPolyTerm(a, 2, poly.ring), UniPolyTerm(c, 1, poly.ring), UniPolyTerm(e, 0, poly.ring)], poly.symbol, poly.ring)).reduce(function(roots, r) {
            if (r[0].equ(0))
            {
                roots.push(r);
            }
            else
            {
                roots.push([r[0].pow(1/2), r[1]]);
                roots.push([r[0].pow(1/2).neg(), r[1]]);
            }
            return roots;
        }, []);
/*
https://www.wolframalpha.com/input?i=ax%5E4+%2B+bx%5E3+%2Bcx%5E2+%2Bdx%2Be+%3D0

a!=0, x = -1/2 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a)) - 1/2 sqrt(b^2/(2 a^2) - (-b^3/a^3 + (4 b c)/a^2 - (8 d)/a)/(4 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a))) - (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) - (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (4 c)/(3 a)) - b/(4 a)

a!=0, x = -1/2 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a)) + 1/2 sqrt(b^2/(2 a^2) - (-b^3/a^3 + (4 b c)/a^2 - (8 d)/a)/(4 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a))) - (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) - (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (4 c)/(3 a)) - b/(4 a)

a!=0, x = 1/2 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a)) - 1/2 sqrt(b^2/(2 a^2) + (-b^3/a^3 + (4 b c)/a^2 - (8 d)/a)/(4 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a))) - (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) - (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (4 c)/(3 a)) - b/(4 a)

a!=0, x = 1/2 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a)) + 1/2 sqrt(b^2/(2 a^2) + (-b^3/a^3 + (4 b c)/a^2 - (8 d)/a)/(4 sqrt(b^2/(4 a^2) + (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) + (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (2 c)/(3 a))) - (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)/(3 2^(1/3) a) - (2^(1/3) (12 a e - 3 b d + c^2))/(3 a (sqrt((-72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^2 - 4 (12 a e - 3 b d + c^2)^3) - 72 a c e + 27 a d^2 + 27 b^2 e - 9 b c d + 2 c^3)^(1/3)) - (4 c)/(3 a)) - b/(4 a)
*/
    return []; // TODO
}
function polykthroot(p, k, limit)
{
    // Return the (possibly truncated) k-th root of a polynomial
    // https://math.stackexchange.com/questions/324385/algorithm-for-finding-the-square-root-of-a-polynomial
    // https://planetmath.org/SquareRootOfPolynomial
    // https://math.stackexchange.com/questions/3550942/algorithm-to-compute-nth-root-radical-sqrtnpx-of-polynomial
    // similarities with modified Newton's algorithm adapted for polynomials
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        PolynomialClass, k_1, r, rk, d, q, deg, nterms = 0;

    if (k.lt(I)) return null; // undefined
    else if ((k.equ(I)) || p.equ(O) || p.equ(I)) return p;

    PolynomialClass = p[CLASS];

    if (null == limit) limit = 6;
    limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    // using tail term .ttm(), correctly computes (taylor) power series approximation if p is not perfect kth power
    r = new PolynomialClass(p.ttm().rad(k), p.symbol, p.ring);
    deg = p.maxdeg(true); rk = r.pow(k_1); d = p.sub(rk.mul(r));
    while (!d.equ(O))
    {
        q = d.ttm(true).div(rk.mul(k).ttm(true));
        if (q.equ(O)) break; // no update anymore
        /*d = d.sub(q.mul(rk.add(q.pow(k_1))));*/ r = r.add(q); rk = r.pow(k_1); d = p.sub(rk.mul(r));
        // compute only up to some terms of power series (truncated power series approximation)
        // if p is not a perfect kth power and root begins to have powers not belonging to the root of p
        if (r.maxdeg(true)*k > deg) {++nterms; if ((r.terms.length >= limit) || (nterms >= limit)) break;}
    }
    // normalise r to have positive lead coeff
    // if k is multiple of 2 (since then both r and -r are roots)
    // and is not a (truncated) power series approximation
    return (0 === nterms) && k.mod(two).equ(O) ? r.abs() : r;
}
function polygcd(/* args */)
{
    // Generalization of Euclid GCD Algorithm for polynomials
    // https://en.wikipedia.org/wiki/Euclidean_algorithm
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor
    // https://en.wikipedia.org/wiki/Euclidean_division_of_polynomials
    // https://en.wikipedia.org/wiki/Polynomial_long_division
    // should be a generalisation of number gcd, meaning for constant polynomials should coincide with gcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        c = args.length, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, S, R, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, a, b, a0, b0, t, r, i, p, q, field;

    if (0 === c) return PolynomialClass.Zero();

    PolynomialClass = args[0][CLASS];
    S = args[0].symbol;
    R = args[0].ring;

    for (i=0; i<c; ++i)
    {
        if (!args[i].isConst())
        {
            are_const = false;
            break;
        }
    }
    // defer to gcd of coefficients and transform back to polynomial
    if (are_const) return PolynomialClass.Const(R.gcd(array(args.length, function(i) {return args[i].cc();})), S, R);

    // Generalization of Euclid GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if (/*is_class(R.NumberClass, Integer)*/!R.isField())
    {
        a = args[0];
        if (1 == c)
        {
            return a.monic();
        }
        else //if (2 <= c)
        {
            field = R.associatedField(); // Q[X]
            p = PolynomialClass(a, S, field);
            q = PolynomialClass(2 === c ? args[1] : polygcd(slice.call(args, 1)), S, field);
            return PolynomialClass(polygcd(p, q).primitive().mul(field.gcd(p.content(), q.content())), S, R);
        }
    }

    i = 0;
    while (i < c && (a=args[i++]).equ(O)) ;
    if (a.lc().lt(O)) a = a.neg();
    while (i < c)
    {
        if (a.equ(I)) return PolynomialClass.One(S, R);
        while (i < c && (b=args[i++]).equ(O)) ;
        if (b.lc().lt(O)) b = b.neg();
        if (b.equ(I)) return PolynomialClass.One(S, R);
        else if (b.equ(a)) continue;
        else if (b.equ(O)) break;
        // swap them (a >= b)
        if (0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true)) {t = b; b = a; a = t;}
        while (!b.equ(O))
        {
            a0 = a; b0 = b;
            r = a.mod(b);
            a = b; b = r;
            if (a.equ(b0) && b.equ(a0)) break; // will not change anymore
        }
    }
    // simplify, positive and monic
    a = a.monic();
    return a;
}
function polyxgcd(/* args */)
{
    // Generalization of Extended GCD Algorithm for univariate polynomials
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
    // should be a generalisation of number xgcd, meaning for constant polynomials should coincide with xgcd of respective numbers
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        k = args.length, i, Arithmetic = Abacus.Arithmetic,
        PolynomialClass = Polynomial, S, R, are_const = true,
        O = Arithmetic.O, I = Arithmetic.I, asign, bsign,
        a, b, a0, b0, a1, b1, a2, b2, t, lead,
        qr, gcd, g, f, p, q, field;

    if (0 === k) return;

    a = args[0];
    PolynomialClass = a[CLASS];
    S = a.symbol;
    R = a.ring;

    for (i=0; i<k; ++i)
    {
        if (!args[i].isConst())
        {
            are_const = false;
            break;
        }
    }

    // defer to xgcd of coefficients and transform back to polynomial
    if (are_const) return R.xgcd(array(args.length, function(i) {return args[i].cc();})).map(function(g) {return PolynomialClass.Const(g, S, R);});

    a = args[0];

    // Generalization of Euclid extended GCD Algorithm for polynomials in Z[X]
    // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
    if (/*is_class(R.NumberClass, Integer)*/!R.isField())
    {
        field = R.associatedField(); // Q[X]
        asign = PolynomialClass.One(S, field); bsign = asign;
        if (1 == k)
        {
            // normalize it
            lead = a.lc();
            if (lead.divides(asign))
            {
                a = a.monic();
                if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                a = a.neg(); asign = asign.neg();
            }
            return [a, asign];
        }
        else //if (2 <= k)
        {
            gcd = 2 === k ? [args[1], PolynomialClass.One(S, field)] : polyxgcd(slice.call(args, 1));
            b = gcd[0];
            p = PolynomialClass(a, S, field);
            q = PolynomialClass(b, S, field);
            g = polyxgcd(p, q);
            f = field.gcd(p.content(), q.content());
            // Bezout's Identity for Polynomials works only for polys over a field, not simply a ring, like Z
            // thus the coefficients are in general polys over Q ie Q[x]
            // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity#For_polynomials
            g[0] = g[0].primitive().mul(f); g[1] = g[1].mul(f); g[2] = g[2].mul(f);
            return array(gcd.length+1, function(i) {
                return 0 === i ? PolynomialClass(g[0], S, R) : (1 === i ? g[1] : gcd[i-1].mul(g[2]));
            });
        }
    }

    asign = PolynomialClass.One(S, R); bsign = asign;
    if (1 === k)
    {
        // normalize it
        lead = a.lc();
        if (lead.divides(asign))
        {
            a = a.monic();
            if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead);}
        }
        else if (lead.lt(O))
        {
            a = a.neg(); asign = asign.neg();
        }
        return [a, asign];
    }
    else //if (2 <= k)
    {
        // recursive on number of arguments
        // compute xgcd on rest arguments and combine with current
        // based on recursive property: gcd(a,b,c,..) = gcd(a, gcd(b, c,..))
        // for coefficients this translates to:
        // gcd(a,b,c,..) = ax + by + cz + .. =
        // gcd(a, gcd(b, c, ..)) = ax + k gcd(b,c,..) = (given gcd(b,c,..) = nb + mc + ..)
        // gcd(a, gcd(b, c, ..)) = ax + k (nb + mc + ..) = ax + b(kn) + c(km) + .. = ax + by +cz + ..
        // note2: any zero arguments are skipped and do not break xGCD computation
        // note3: gcd(0,0,..,0) is conventionally set to 0 with 1's as factors
        gcd = 2 === k ? [args[1], PolynomialClass.One(S, R)] : polyxgcd(slice.call(args, 1));
        b = gcd[0];

        // gcd with zero factor, take into account
        if (a.equ(O))
        {
            // normalize it
            lead = b.lc();
            if (lead.divides(asign) && lead.divides(bsign))
            {
                b = b.monic();
                if (!lead.equ(b.lc())) {asign = asign.mul(b.lc()).div(lead); bsign = bsign.mul(b.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i) {
                return 0 === i ? b : (1 === i ? asign : gcd[i-1].mul(bsign));
            });
        }
        else if (b.equ(O))
        {
            // normalize it
            lead = a.lc();
            if (lead.divides(asign) && lead.divides(bsign))
            {
                a = a.monic();
                if (!lead.equ(a.lc())) {asign = asign.mul(a.lc()).div(lead); bsign = bsign.mul(a.lc()).div(lead);}
            }
            else if (lead.lt(O))
            {
                a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
            }
            return array(gcd.length+1,function(i) {
                return 0 === i ? a : (1 === i ? asign : gcd[i-1].mul(bsign));
            });
        }

        a1 = PolynomialClass.One(S, R);
        b1 = PolynomialClass.Zero(S, R);
        a2 = PolynomialClass.Zero(S, R);
        b2 = PolynomialClass.One(S, R);

        // Bezout's Identity for multivariate polynomials may in general not hold,
        // so the gcd returned from polyxgcd may not match the polygcd result and be monic
        // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity#For_polynomials
        for (;;)
        {
            a0 = a; b0 = b;
            //console.log('a0', String(a0), 'b0', String(b0));
            //console.log('a1', String(a1), 'b1', String(b1));
            //console.log('a2', String(a2), 'b2', String(b2));

            if (0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true))
            {
                // a < b
                qr = b.divmod(a);
                b = qr[1];
                a2 = a2.sub(qr[0].mul(a1));
                b2 = b2.sub(qr[0].mul(b1));

                if (b.equ(O))
                {
                    // normalize it
                    lead = a.lc();
                    if (lead.divides(a1) && lead.divides(b1))
                    {
                        a = a.monic();
                        if (!lead.equ(a.lc())) {a1 = a1.mul(a.lc()).div(lead); b1 = b1.mul(a.lc()).div(lead);}
                    }
                    else if (lead.lt(O))
                    {
                        a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                    }
                    a1 = a1.mul(asign); b1 = b1.mul(bsign);
                    //console.log('a < b, b = 0');
                    //console.log('a', String(a), 'b', String(b), 'a1', String(a1), 'b1', String(b1));
                    return array(gcd.length+1, function(i) {
                        return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                    });
                }
            }
            else
            {
                // a > b
                qr = a.divmod(b);
                a = qr[1];
                a1 = a1.sub(qr[0].mul(a2))
                b1 = b1.sub(qr[0].mul(b2));

                if (a.equ(O))
                {
                    // normalize it
                    lead = b.lc();
                    if (lead.divides(a2) && lead.divides(b2))
                    {
                        b = b.monic();
                        if (!lead.equ(b.lc())) {a2 = a2.mul(b.lc()).div(lead); b2 = b2.mul(b.lc()).div(lead);}
                    }
                    else if (lead.lt(O))
                    {
                        b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
                    }
                    a2 = a2.mul(asign); b2 = b2.mul(bsign);
                    //console.log('a > b, a = 0');
                    //console.log('a', String(a), 'b', String(b), 'a2', String(a2), 'b2', String(b2));
                    return array(gcd.length+1,function(i) {
                        return 0 === i ? b : (1 === i ? a2 : gcd[i-1].mul(b2));
                    });
                }
            }

            if (a.equ(a0) && b.equ(b0))
            {
                // will not change anymore
                if (0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true))
                {
                    // normalize it
                    lead = a.lc();
                    if (lead.divides(a1) && lead.divides(b1))
                    {
                        a = a.monic();
                        if (!lead.equ(a.lc())) {a1 = a1.mul(a.lc()).div(lead); b1 = b1.mul(a.lc()).div(lead);}
                    }
                    else if (lead.lt(O))
                    {
                        a = a.neg(); asign = asign.neg(); bsign = bsign.neg();
                    }
                    a1 = a1.mul(asign); b1 = b1.mul(bsign);
                    //console.log('a < b, a = a0, b = b0');
                    //console.log('a', String(a), 'b', String(b), 'a1', String(a1), 'b1', String(b1));
                    return array(gcd.length+1, function(i) {
                        return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                    });
                }
                else
                {
                    // normalize it
                    lead = b.lc();
                    if (lead.divides(a2) && lead.divides(b2))
                    {
                        b = b.monic();
                        if (!lead.equ(b.lc())) {a2 = a2.mul(b.lc()).div(lead); b2 = b2.mul(b.lc()).div(lead);}
                    }
                    else if (lead.lt(O))
                    {
                        b = b.neg(); asign = asign.neg(); bsign = bsign.neg();
                    }
                    a2 = a2.mul(asign); b2 = b2.mul(bsign);
                    //console.log('a > b, a = a0, b = b0');
                    //console.log('a', String(a), 'b', String(b), 'a2', String(a2), 'b2', String(b2));
                    return array(gcd.length+1,function(i) {
                        return 0 === i ? b : (1 === i ? a2 : gcd[i-1].mul(b2));
                    });
                }
            }
        }
    }
}
function polylcm(/* args */)
{
    // least common multiple
    // https://en.wikipedia.org/wiki/Least_common_multiple
    function polylcm2(a, b)
    {
        var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = PolynomialClass.gcd(a, b);
        return g.equ(O) ? g : a.div(g).mul(b);
    }
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        i, l = args.length, LCM, O = Abacus.Arithmetic.O, PolynomialClass = Polynomial, S, R;
    if (1 >= l) return 1 === l ? args[0] : PolynomialClass.Zero();
    PolynomialClass = args[0][CLASS];
    S = args[0].symbol;
    R = args[0].ring;
    if (args[0].equ(O) || args[1].equ(O)) return PolynomialClass.Zero(S, R);
    LCM = polylcm2(args[0], args[1]);
    for (i=2; i<l; ++i)
    {
        if (args[i].equ(O)) return PolynomialClass.Zero(S, R);
        LCM = polylcm2(LCM, args[i]);
    }
    return LCM;
}
function polyres(p, p_deg, q, q_deg, x, normalize)
{
    // https://en.wikipedia.org/wiki/Resultant
    // assume q poly is of same type and of same ring as p poly

    var t1 = p.terms, t2 = q.terms,
        l1 = t1.length, l2 = t2.length,
        n, i, ring, O, I,
        sylvester, p_coeff, q_coeff,
        p_e, q_e, p_x, q_x;

    ring = p.ring;
    O = ring.Zero();
    I = ring.One();

    if ((0 >= p_deg) || (0 >= q_deg)) return O;

    n = p_deg + q_deg;

    if (is_array(t1[0].e))
    {
        p_x = p.symbol.indexOf(x);
        p_e = -1 === p_x ? function(t) {return 0;} : function(t) {return t.e[p_x];};
    }
    else
    {
        p_e = function(t) {return t.e;};
    }
    if (is_array(t2[0].e))
    {
        q_x = q.symbol.indexOf(x);
        q_e = -1 === q_x ? function(t) {return 0;} : function(t) {return t.e[q_x];};
    }
    else
    {
        q_e = function(t) {return t.e;};
    }
    i = 0;
    p_coeff = array(n, function(j) {
        if ((j <= p_deg) && (i < l1) && (p_deg-j === p_e(t1[i])))
        {
            if (normalize && (0 === i)) {++i; return I;}
            return t1[i++].c;
        }
        return O;
    });
    i = 0;
    q_coeff = array(n, function(j) {
        if ((j <= q_deg) && (i < l2) && (q_deg-j === q_e(t2[i])))
        {
            if (normalize && (0 === i)) return t2[i++].c.div(t1[0].c);
            return t2[i++].c;
        }
        return O;
    });
    /*
    determinant of sylvester matrix
    | pn  .. p1  p0 0  ..|
    | 0   pn ..  p1 p0 ..|
    | .   .  ..  .  .  ..|
    | .   .  ..  .  .  ..|
    | 0   0  ..  0  pn ..|
    | qm  .. q1  q0 0  ..|
    | 0   qm ..  q1 q0 ..|
    | .   .  ..  .  .  ..|
    | .   .  ..  .  .  ..|
    | 0   0  ..  0  qm ..|
    */
    sylvester = Matrix(ring, array(n, function(i) {
        var coeffs = i < q_deg ? p_coeff : q_coeff, ret = coeffs.slice(), coeff;
        if (normalize)
        {
            if (0 === i) p_coeff[0] = t1[0].c;
            else if (q_deg === i) q_coeff[0] = t2[0].c;
        }
        coeff = coeffs.pop(); coeffs.unshift(coeff); // shift
        return ret;
    }));
    return sylvester.detr();
}

MultiPolynomial.kthroot = Polynomial.kthroot = polykthroot;
Polynomial.gcd = polygcd;
Polynomial.xgcd = polyxgcd;
Polynomial.lcm = polylcm;
MultiPolynomial.gcd = function(/*args*/) {
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        symbol = null, order, gcd;
    gcd = polygcd([].map.call(args, function(p) {
        if (null == symbol)
        {
            symbol = p.symbol;
            order = p.order();
        }
        return p.univariate(null, true);
    }));
    return gcd.multivariate(symbol).order(order);
};
MultiPolynomial.xgcd = function(/*args*/) {
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        symbol = null, order;
    return polyxgcd([].map.call(args, function(p) {
        if (null == symbol)
        {
            symbol = p.symbol;
            order = p.order();
        }
        return p.univariate(null, true);
    })).map(function(g) {
        if (is_instance(g, MultiPolynomial))
        {
            g = g.multivariate(symbol).order(order);
        }
        else if (is_instance(g, RationalFunc))
        {
            g = RationalFunc(g.num.multivariate(symbol).order(order), g.den.multivariate(symbol).order(order));
        }
        return g;
    });
};
MultiPolynomial.lcm = function(/*args*/) {
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
        symbol = null, order, lcm;
    lcm = polylcm([].map.call(args, function(p) {
        if (null == symbol)
        {
            symbol = p.symbol;
            order = p.order();
        }
        return p.univariate(null, true);
    }));
    return lcm.multivariate(symbol).order(order);
};
Polynomial.Resultant = function(p, q) {
    return polyres(p, p.deg(), q, q.deg(), p.symbol, false);
};
Polynomial.Discriminant = function(p) {
    var n = p.deg(), dp = p.d(1), res;
    res = polyres(p, n, dp, n-1, p.symbol, true);
    return (n*(n-1) >> 1) & 1 ? res.neg() : res;
};
MultiPolynomial.Resultant = function(p, q, x) {
    if (is_instance(p, Polynomial) && is_instance(q, Polynomial))
    {
        return Polynomial.Resultant(p, q);
    }
    p = is_instance(p, Polynomial) ? MultiPolynomial(p, q.symbol, q.ring) : p;
    q = is_instance(q, Polynomial) ? MultiPolynomial(q, p.symbol, p.ring) : q;
    var symbol = p.symbol;
    x = x || p.symbol[0];
    p = p.univariate(x);
    q = q.univariate(x);
    var res = polyres(p, p.deg(x), q, q.deg(x), x, false);
    return res;
};
MultiPolynomial.Discriminant = function(p, x) {
    p = is_instance(p, Polynomial) ? MultiPolynomial(p, [x || p.symbol], p.ring) : p;
    x = x || p.symbol[0];
    var symbol = p.symbol, dp = p.d(x, 1);
    p = p.univariate(x);
    dp = dp.univariate(x);
    var n = p.deg(x),
        res = polyres(p, n, dp, n-1, x, true);
    if ((n*(n-1) >> 1) & 1) res = res.neg();
    return res;
};


// Abacus.RationalFunc, represents a rational function/fraction of (multivariate) polynomials
RationalFunc = Abacus.RationalFunc = Class(Symbolic, {

    constructor: function RationalFunc(/*num, den, symbol, ring, simplified*/) {
        var self = this, Arithmetic = Abacus.Arithmetic, args = arguments,
            num, den, symbol, ring, simplified, simplify = RationalFunc.autoSimplify;

        simplified = (4 < args.length) && (true === args[4]);
        ring = 3 < args.length ? (is_instance(args[3], Ring) ? args[3] : null) : null;
        symbol = 2 < args.length ? (is_array(args[2]) ? args[2] : args[2]) : null;
        if (1 < args.length)
        {
            num = args[0];
            den = args[1];
        }
        else if (1 === args.length)
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
        if (is_instance(num, MultiPolynomial))
        {
            ring = ring || num.ring;
            symbol = symbol || num.symbol;
        }
        ring = is_instance(ring, Ring) ? ring : Ring.Q();
        symbol = is_array(symbol) ? symbol : [String(symbol || 'x')];

        if (null == num) num = MultiPolynomial.Zero(symbol, ring);
        else if (!is_instance(num, MultiPolynomial)) num = MultiPolynomial(num, symbol, ring);

        if (null == den) den = MultiPolynomial.One(num.symbol, num.ring);
        else if (!is_instance(den, MultiPolynomial)) den = MultiPolynomial(den, num.symbol, num.ring);

        if (den.equ(Arithmetic.O)) throw new Error('Zero denominator in Abacus.RationalFunc!');
        if (num.equ(Arithmetic.O) && !den.equ(Arithmetic.I)) den = MultiPolynomial.One(num.symbol, num.ring);
        if (den.lc().lt(Arithmetic.O)) {den = den.neg(); num = num.neg();}
        if (den.order() !== num.order()) den = den.order(num.order());
        self.num = num;
        self.den = den;

        if (simplified) self._simpl = true;
        else if (simplify) self.simpl();

        def(self, 'symbol', {
            get: function() {
                return self.num ? self.num.symbol : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'ring', {
            get: function() {
                return self.num ? self.num.ring : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
        autoSimplify: true

        ,hasInverse: function() {
            return true;
        }

        ,Zero: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.Zero(symbol, ring), null, null, null, true);
        }
        ,One: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.One(symbol, ring), null, null, null, true);
        }
        ,MinusOne: function(symbol, ring) {
            return new RationalFunc(MultiPolynomial.MinusOne(symbol, ring), null, null, null, true);
        }
        ,Const: function(c, symbol, ring) {
            c = c || Abacus.Arithmetic.O;
            var n = null, d = null;
            if (is_instance(c, [Rational, RationalFunc]))
            {
                n = c.num;
                d = c.den;
            }
            else if (is_instance(c, Complex))
            {
                if (c.isReal())
                {
                    c = c.real();
                    n = c.num;
                    d = c.den;
                }
                else if (c.isImag())
                {
                    c = c.imag();
                    n = Complex(0, c.num);
                    d = Complex(c.den, 0);
                }
            }
            return null != d ? new RationalFunc(MultiPolynomial.Const(n, symbol, ring), MultiPolynomial.Const(d, symbol, ring)) : new RationalFunc(MultiPolynomial.Const(c, symbol, ring), null, null, null, true);
        }

        ,cast: null // added below

        ,gcd: function rfgcd(/* args */) {
            // gcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc(MultiPolynomial.gcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }
        ,xgcd: function rfxgcd(/* args */) {
            // xgcd of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            if (!args.length) return;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return MultiPolynomial.xgcd(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})).map(function(g, i) {return 0 === i ? RationalFunc(g, denom) : RationalFunc(g);});
        }
        ,lcm: function rflcm(/* args */) {
            // lcm of Rational Functions
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                denom;
            denom = operate(function(p, r) {return r.den.mul(p);}, Abacus.Arithmetic.I, args);
            return RationalFunc(MultiPolynomial.lcm(array(args.length, function(i) {return args[i].num.mul(denom.div(args[i].den));})), denom);
        }

        ,fromString: function(s, symbol, ring) {
            return RationalFunc.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || 'x';
            if (!is_array(symbol)) symbol = [String(symbol)];
            return RationalFunc(MultiPolynomial.fromExpr(e.num, symbol, ring), MultiPolynomial.fromExpr(e.den, symbol, ring));
        }
    }

    ,num: null
    ,den: null
    ,_n: null
    ,_i: null
    ,_c: null
    ,_str: null
    ,_tex: null
    ,_expr: null
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
        self.num = null;
        self.den = null;
        self._n = null;
        self._i = null;
        self._c = null;
        self._str = null;
        self._tex = null;
        self._expr = null;
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
    ,isMono: function() {
        var self = this;
        return self.num.isMono() && self.den.isConst();
    }
    ,isConst: function() {
        var self = this;
        return self.num.isConst() && self.den.isConst();
    }
    ,c: function() {
        var self = this;
        return self.num.c().div(self.den.c());
    }
    ,order: function(order) {
        var self = this;
        if (!arguments.length)
        {
            return self.num.order();
        }
        else
        {
            return RationalFunc(self.num.order(order), self.den.order(order), null, null, self._simpl);
        }
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
    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.equ(self.den.mul(other));
        if (is_instance(other, Rational))
            return self.num.mul(other.den).equ(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return self.num.equ(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).equ(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().equ(other);
        if (is_string(other))
            return (other === self.toString()) || (other === self.toTex());
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.gt(self.den.mul(other));
        if (is_instance(other, Rational))
            return self.num.mul(other.den).gt(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return self.num.gt(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).gt(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().gt(other);
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.gte(self.den.mul(other));
        if (is_instance(other, Rational))
            return self.num.mul(other.den).gte(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return self.num.gte(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).gte(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().gte(other);
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.lt(self.den.mul(other));
        if (is_instance(other, Rational))
            return self.num.mul(other.den).lt(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return self.num.lt(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).lt(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().lt(other);
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        if (is_instance(other, [Integer, IntegerMod, Complex]) || Arithmetic.isNumber(other))
            return self.num.lte(self.den.mul(other));
        if (is_instance(other, [Rational, RationalFunc]))
            return self.num.mul(other.den).lte(self.den.mul(other.num));
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Poly))
            return self.num.lte(self.den.mul(other));
        if (is_instance(other, RationalFunc))
            return self.num.mul(other.den).lte(self.den.mul(other.num));
        if (is_instance(other, Expr))
            return self.toExpr().lte(other);
        return false;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.add(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).add(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.sub(self.den.mul(other)), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den).sub(self.den.mul(other.num)), self.den.mul(other.den));
        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num.mul(other), self.den);
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.num), self.den.mul(other.den));
        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.ring.contains(other)) other = RationalFunc.Const(other, self.symbol, self.ring);
        if (is_instance(other, Complex) && other.isReal()) other = other.real();
        else if (is_instance(other, [Integer, IntegerMod]) || Arithmetic.isNumber(other)) other = Rational(other);
        if (is_instance(other, [Complex, Poly]))
            return RationalFunc(self.num, self.den.mul(other));
        else if (is_instance(other, [Rational, RationalFunc]))
            return RationalFunc(self.num.mul(other.den), self.den.mul(other.num));
        return self;
    }
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,divides: function(other) {
        return !this.equ(Abacus.Arithmetic.O);
    }
    ,substitute: function(v, xi) {
        return RationalFunc(self.num.substitute(v, xi), self.den.substitute(v, xi));
    }
    ,compose: function(q) {
        // assume q's are simply multipolynomials, NOT rational functions
        var self = this;
        return RationalFunc(self.num.compose(q), self.den.compose(q));
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, num = self.num, den = self.den, t;
        n = Integer.cast(n);
        if (n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 > n) {n = -n; t = num; num = den; den = t;}
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
        return RationalFunc(self.num.rad(n), self.den.rad(n));
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
        while ((0 < n) && !num.equ(Arithmetic.O))
        {
            d_num = num.d(x, 1).mul(den).sub(num.mul(den.d(x, 1)));
            d_den = den.pow(2);
            num = d_num; den = d_den; --n;
        }
        return RationalFunc(num, den);
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
                if ((qr=self.num.divmod(self.den)) && qr[1].equ(Arithmetic.O))
                {
                    // num divides den exactly, simplify
                    self.num = qr[0];
                    self.den = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }
                else if ((qr=self.den.divmod(self.num)) && qr[1].equ(Arithmetic.O))
                {
                    // den divides num exactly, simplify
                    self.den = qr[0];
                    self.num = MultiPolynomial.One(self.num.symbol, self.num.ring);
                }
                else //if (is_callable(MultiPolynomial.gcd))
                {
                    // use multipolynomial gcd, if possible
                    qr = MultiPolynomial.gcd(self.num, self.den);
                    if (self.num.mod(qr).equ(Arithmetic.O) && self.den.mod(qr).equ(Arithmetic.O))
                    {
                        self.num = self.num.div(qr);
                        self.den = self.den.div(qr);
                    }
                    /*else
                    {
                        console.error('RationalFunc.simpl gcd("'+self.num.toString()+'","'+self.den.toString()+'") = '+qr.toString()+' does NOT divide num,den!');
                    }*/
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
                    if (is_instance(num[1], [RationalFunc, Poly]))
                    {
                        n = den[1].den.mul(num[1].num);
                        d = num[1].den.mul(den[1].num);
                        g = n[CLASS].gcd(n, d);
                        self.num = num[0].mul(n.div(g));
                        self.den = den[0].mul(d.div(g));
                    }
                    else if (is_class(num[0].ring.NumberClass, Complex))
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
                            g = Complex.gcd(num[1], den[1]);
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
    ,toExpr: function() {
        var self = this;
        if (null == self._expr)
        {
            self._expr = self.num.toExpr().div(self.den.toExpr());
        }
        return self._expr;
    }
    ,toString: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, I = Arithmetic.I;
        if (null == self._str)
        {
            //self._str = self.toExpr().expand().toString();
            self._str = self.den.equ(I) ? self.num.toString() : ((self.num.isMono() || (self.num.isConst() && (self.num.isReal() || self.num.isImag())) ? self.num.toString() : ('(' + self.num.toString() + ')')) + '/' + ((self.den.isMono() && self.den.terms[0].c.equ(I)) || (self.den.isConst() && (self.den.isReal() /*|| self.den.isImag()*/)) ? self.den.toString() : ('(' + self.den.toString() + ')')));
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._tex)
        {
            //self._tex = self.toExpr().expand().toTex();
            self._tex = self.den.equ(Arithmetic.I) ? self.num.toTex() : ('\\frac{' + self.num.toTex() + '}{' + self.den.toTex() + '}');
        }
        return self._tex;
    }
    ,toDec: function(precision) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        return self.den.equ(Arithmetic.I) ? self.num.toDec(precision) : ('(' + self.num.toDec(precision) + ')/(' + self.den.toDec(precision) + ')');
    }
});
RationalFunc.cast = function(a, symbol, ring) {
    ring = ring || Ring.Q();
    symbol = symbol || 'x';
    if (!is_array(symbol)) symbol = [String(symbol)];
    var type_cast = typecast(function(a) {
        return is_instance(a, RationalFunc) && is_same_symbol(symbol, a.symbol) && ring.equ(a.ring);
    }, function(a) {
        return is_string(a) ? RationalFunc.fromString(a, symbol, ring) : (is_instance(a, RationalFunc) ? new RationalFunc(MultiPolynomial(a.num, symbol, ring), MultiPolynomial(a.den, symbol, ring)) : new RationalFunc(MultiPolynomial(a, symbol, ring)));
    });
    return type_cast(a);
};
