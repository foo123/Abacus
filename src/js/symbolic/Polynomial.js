// Represents a (univariate) polynomial term with coefficient and exponent in Polynomial non-zero sparse representation
var UniPolyTerm = Class({

    constructor: function UniPolyTerm(c, e, ring) {
        var self = this;
        if (!is_instance(self, UniPolyTerm)) return new UniPolyTerm(c, e, ring);

        if (is_instance(c, UniPolyTerm)) {ring = ring || c.ring; e = c.e; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        self.c = is_instance(c, RationalFunc) ? c : self.ring.cast(c || 0);
        self.e = +(e || 0);
    }

    ,__static__: {
        isNonZero: function(t) {
            return is_instance(t, UniPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function(t1, t2, full) {
            var res = t1.e - t2.e;
            if ((true === full) && (0 === res))
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return UniPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return UniPolyTerm(true === full ? (!(is_instance(t1.c, RationalFunc) || is_instance(t2.c, RationalFunc)) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), stdMath.min(t1.e, t2.e));
        }
        ,lcm: function(t1, t2, full) {
            return UniPolyTerm(true === full ? (!(is_instance(t1.c, RationalFunc) || is_instance(t2.c, RationalFunc)) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), stdMath.max(t1.e, t2.e));
        }
    }

    ,ring: null
    ,c: null
    ,e: null

    ,dispose: function() {
        var self = this;
        self.ring = null;
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
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && !c.isConst(true) ? ('(' + c.toDec(precision) + ')') : (!c.isReal() ? ('(' + c.toDec(precision) + ')') : c.toDec(precision))))) + term) : (is_instance(c, RationalFunc) && !c.isConst(true) ? '(' + c.toDec(precision) + ')' : c.toDec(precision));
            }
            else if (true === asTex)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && !c.isConst(true) ? ('(' + c.toTex() + ')') : (!c.isReal() ? ('(' + c.toTex() + ')') : c.toTex())))) + term) : (is_instance(c, RationalFunc) && !c.isConst(true) ? '(' + c.toTex() + ')' : c.toTex());
            }
            else
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, RationalFunc) && (!c.isConst(true) || !c.den.equ(Arithmetic.I)) ? ('(' + c.toString() + ')*') : (!c.isReal() ? ('(' + c.toString() + ')*') : (c.toString(true) + '*'))))) + term) : (is_instance(c, RationalFunc) && !c.isConst(true) ? '(' + c.toString() + ')' : c.toString());
            }
        }
        return term;
    }
    ,toString: function() {
        var self = this;
        return '(' + self.c.toString() + ',' + String(self.e) + ')';
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
                if (!terms.length || (terms[terms.length-1].e!==t.e)) terms.push(t);
                else terms[terms.length-1] = terms[terms.length-1].add(t);
                return terms;
            }, []).filter(UniPolyTerm.isNonZero);
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = String(symbol || terms.symbol);
            self.terms = self.ring !== terms.ring ? terms.terms.map(function(t) {
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
                    self.terms = array(terms.length, function(i) {return UniPolyTerm(terms[i], i, self.ring);}).filter(UniPolyTerm.isNonZero).reverse();
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
                self.terms = KEYS(terms).map(function(e) {
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
        ,Piecewise: null

        ,hasInverse: function() {
            return false;
        }

        ,Zero: function(symbol, ring) {
            return new Polynomial([], symbol || 'x', ring || Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.One(), symbol || 'x', ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q();
            return new Polynomial(ring.MinusOne(), symbol || 'x', ring);
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
                        P.terms = addition_sparse(P.terms, x.terms, UniPolyTerm, true === do_sub, P.ring);
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
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], UniPolyTerm, true === do_sub, P.ring) : [x];
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
                    for (i=P.terms.length-1; i>=0; --i)
                        P.terms[i] = P.terms[i].mul(x);
                }
            }
            return P;
        }

        ,Div: function(P, x, q_and_r) {
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
                q = x.equ(I) ? P : Polynomial(array(P.terms.length, function(i) {
                    return P.terms[i].div(x);
                }), P.symbol, P.ring);
                return q_and_r ? [q, Polynomial.Zero(P.symbol, P.ring)] : q;
            }
            return P;
        }

        ,C: function(c, x, ring) {
            return new Polynomial(c || Abacus.Arithmetic.O, x || 'x', ring || Ring.Q());
        }

        ,gcd: function polygcd(/* args */) {
            // Generalization of Euclid GCD Algorithm for polynomials
            // https://en.wikipedia.org/wiki/Euclidean_algorithm
            // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor
            // https://en.wikipedia.org/wiki/Euclidean_division_of_polynomials
            // https://en.wikipedia.org/wiki/Polynomial_long_division
            // should be a generalisation of number gcd, meaning for constant polynomials should coincide with gcd of respective numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                c = args.length, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
                O = Arithmetic.O, I = Arithmetic.I, J = Arithmetic.J, a, b, a0, b0, t, r, i, p, q, field;

            if (0 === c) return PolynomialClass.Zero();
            PolynomialClass = args[0][CLASS];

            for (i=0; i<c; ++i)
            {
                if (!args[i].isConst())
                {
                    are_const = false;
                    break;
                }
            }
            // defer to gcd of coefficients and transform back to polynomial
            if (are_const) return PolynomialClass(args[0].ring.gcd(array(args.length, function(i) {return args[i].cc();})), args[0].symbol, args[0].ring);

            // Generalization of Euclid GCD Algorithm for polynomials in Z[X]
            // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
            if (is_class(args[0].ring.NumberClass, Integer))
            {
                a = args[0];
                if (1 == c)
                {
                    return a.monic();
                }
                else //if (2 <= c)
                {
                    field = a.ring.associatedField(); // Q[X]
                    p = PolynomialClass(a, a.symbol, field);
                    q = PolynomialClass(2 === c ? args[1] : polygcd(slice.call(args, 1)), a.symbol, field);
                    return PolynomialClass(polygcd(p, q).primitive().mul(field.gcd(p.content(), q.content())), a.symbol, a.ring);
                }
            }

            i = 0;
            while (i < c && (a=args[i++]).equ(O)) ;
            if (a.lc().lt(O)) a = a.neg();
            while (i < c)
            {
                if (a.equ(I)) return PolynomialClass.One(a.symbol, a.ring);
                while (i < c && (b=args[i++]).equ(O)) ;
                if (b.lc().lt(O)) b = b.neg();
                if (b.equ(I)) return PolynomialClass.One(a.symbol, a.ring);
                else if (b.equ(a)) continue;
                else if (b.equ(O)) break;
                // swap them (a >= b)
                if (0 > PolynomialClass.Term.cmp(a.ltm(), b.ltm(), true)) {t = b; b = a; a = t;}
                while (!b.equ(O))
                {
                    //a0 = a; b0 = b;
                    r = a.mod(b); a = b; b = r;
                    //if (a.equ(b0) && b.equ(a0)) break; // will not change anymore
                }
            }
            // simplify, positive and monic
            a = a.monic();
            return a;
        }
        ,xgcd: function polyxgcd(/* args */) {
            // Generalization of Extended GCD Algorithm for univariate polynomials
            // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#B%C3%A9zout's_identity_and_extended_GCD_algorithm
            // should be a generalisation of number xgcd, meaning for constant polynomials should coincide with xgcd of respective numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                k = args.length, i, Arithmetic = Abacus.Arithmetic, PolynomialClass = Polynomial, are_const = true,
                O = Arithmetic.O, I = Arithmetic.I, asign, bsign,
                a, b, a0, b0, a1, b1, a2, b2, lead,
                qr, gcd, g, f, p, q, field;

            if (0 === k) return;

            a = args[0];
            PolynomialClass = a[CLASS];

            for (i=0; i<k; ++i)
            {
                if (!args[i].isConst())
                {
                    are_const = false;
                    break;
                }
            }
            // defer to xgcd of coefficients and transform back to polynomial
            if (are_const) return a.ring.xgcd(array(args.length, function(i) {return args[i].cc();})).map(function(g) {return PolynomialClass(g, a.symbol, a.ring);});


            // Generalization of Euclid extended GCD Algorithm for polynomials in Z[X]
            // https://en.wikipedia.org/wiki/Polynomial_greatest_common_divisor#GCD_over_a_ring_and_over_its_field_of_fractions
            if (is_class(a.ring.NumberClass, Integer))
            {
                field = a.ring.associatedField(); // Q[X]
                asign = field.One(); bsign = asign;
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
                    return [a, PolynomialClass(asign, a.symbol, field)];
                }
                else //if (2 <= k)
                {
                    gcd = 2 === k ? [args[1], PolynomialClass.One(a.symbol, field)] : polyxgcd(slice.call(args, 1));
                    b = gcd[0];
                    p = PolynomialClass(a, a.symbol, field);
                    q = PolynomialClass(b, a.symbol, field);
                    g = polyxgcd(p, q);
                    f = field.gcd(p.content(), q.content());
                    // Bezout's Identity for Polynomials works only for polys over a field, not simply a ring, like Z
                    // thus the coefficients are in general polys over Q ie Q[x]
                    // https://en.wikipedia.org/wiki/B%C3%A9zout%27s_identity#For_polynomials
                    g[0] = g[0].primitive().mul(f); g[1] = g[1].mul(f); g[2] = g[2].mul(f);
                    return array(gcd.length+1, function(i) {
                        return 0 === i ? PolynomialClass(g[0], a.symbol, a.ring) : (1 === i ? g[1] : gcd[i-1].mul(g[2]));
                    });
                }
            }

            asign = a.ring.One(); bsign = asign;
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
                return [a, PolynomialClass(asign, a.symbol, a.ring)];
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
                // note3: gcd(0,0,..,0) is conventionaly set to 0 with 1's as factors
                gcd = 2 === k ? [args[1], PolynomialClass.One(a.symbol, a.ring)] : polyxgcd(slice.call(args, 1));
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
                        return 0 === i ? b : (1 === i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
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
                        return 0 === i ? a : (1 === i ? PolynomialClass(asign, a.symbol, a.ring) : gcd[i-1].mul(bsign));
                    });
                }

                a1 = PolynomialClass.One(a.symbol, a.ring);
                b1 = PolynomialClass.Zero(a.symbol, a.ring);
                a2 = Polynomial.Zero(a.symbol, a.ring);
                b2 = Polynomial.One(a.symbol, a.ring);

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
                        a1 = a1.mul(asign); b1 = b1.mul(bsign);
                        return array(gcd.length+1, function(i) {
                            return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                        });
                    }

                    /*if (a.equ(a0) && b.equ(b0))
                    {
                        // will not change anymore
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
                        a1 = a1.mul(asign); b1 = b1.mul(bsign);
                        return array(gcd.length+1, function(i) {
                            return 0 === i ? a : (1 === i ? a1 : gcd[i-1].mul(b1));
                        });
                    }*/
                }
            }
        }
        ,lcm: function polylcm(/* args */) {
            // least common multiple
            // https://en.wikipedia.org/wiki/Least_common_multiple
            function polylcm2(a, b)
            {
                var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, g = Polynomial.gcd(a, b);
                return g.equ(O) ? g : a.div(g).mul(b);
            }
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                i, l = args.length, LCM, O = Abacus.Arithmetic.O, PolynomialClass = Polynomial;
            if (1 >= l) return 1===l ? args[0] : PolynomialClass.Zero();
            PolynomialClass = args[0][CLASS];
            if (args[0].equ(O) || args[1].equ(O)) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
            LCM = polylcm2(args[0], args[1]);
            for (i=2; i<l; ++i)
            {
                if (args[i].equ(O)) return PolynomialClass.Zero(args[0].symbol, args[0].ring);
                LCM = polylcm2(LCM, args[i]);
            }
            return LCM;
        }

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
                Bezier = Bezier.add(b0.mul(ring.cast(points[n-1])));
                for (i=n-2; i>=0; --i)
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

        ,fromValues: function(v, x, ring) {
            // https://en.wikipedia.org/wiki/Lagrange_polynomial
            // https://en.wikipedia.org/wiki/Newton_polynomial
            ring = ring || Ring.Q();
            var I = ring.One(), n, d, f, vi, hash, dupl;
            x = String(x || 'x');
            if (!v || !v.length) return Polynomial([], x, ring);
            if (is_args(v)) v = slice.call(v);
            if (!is_array(v[0])) v = [v];
            v = v.map(function(vi) {
                return [ring.cast(vi[0]), ring.cast(vi[1])];
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
                return Polynomial([v[i][0].neg(), I], x, ring);
            });
            // Produce each Lj in turn, and sum into p
            return operate(function(p, j) {
                return Polynomial.Add(operate(function(Lj, i){
                    if (j !== i) Lj = Polynomial.Mul(f[i], Lj);
                    return Lj;
                }, Polynomial(d[j], x, ring), null, 0, n-1), p);
            }, Polynomial.Zero(x, ring), null, 0, n-1);
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
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_expr: null
    ,_prim: null
    ,_roots: null
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
    ,term: function(i, as_degree) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true === as_degree)
            return Polynomial(terms.reduce(function(matched, t) {return i === t.e ? [t] : matched;}, []), symbol, ring);
        return Polynomial(0 <= i && i < terms.length ? [terms[i]] : [], symbol, ring);
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
    ,monic: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, lc = self.lc(), i, t, divides;
        if (lc.equ(Arithmetic.I) || lc.equ(Arithmetic.O)) return self;
        if (self.ring.isField())
        {
            return Polynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring);
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
                if (0 < c[c.length-1].e)
                {
                    roots.push([Rational.Zero(), c[c.length-1].e]); // zero root with multiplicity
                }
                if (1 < c.length)
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
    ,factor: function(deg) {
        // find factor of polynomial over Integers/Rationals of degree deg using Kronecker method
        // https://en.wikipedia.org/wiki/Factorization_of_polynomials
        // TODO
        return null;
    }
    ,factors: function() {
        // factorize polynomial over Integers/Rationals if factorizable
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
                for (i=0,n=roots.length; i<n; ++i)
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
                        m = lcm(remainder.terms.map(is_class(ring.NumberClass, Complex) ? function(t) {return t.c.real().den;} : function(t) {return t.c.den;}));
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
    ,equ: function(other) {
        var self = this, ring = self.ring, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(other))
        {
            return Arithmetic.equ(O, other) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === t[0].e));
        }
        else if (is_instance(other, Numeric))
        {
            return other.equ(O) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === t[0].e));
        }
        else if (is_instance(other, Polynomial))
        {
            tp = other.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; --i)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        else if (is_instance(other, [MultiPolynomial, RationalFunc]))
        {
            return other.equ(self);
        }
        else if (is_instance(other, Expr))
        {
            return self.toExpr().equ(other);
        }
        else if (is_string(other))
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
        else if (is_instance(other, Polynomial))
        {
            return 0 < UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.lt(self);
        }
        else if (is_instance(other, Expr))
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
        else if (is_instance(other, Polynomial))
        {
            return 0 <= UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.lte(self);
        }
        else if (is_instance(other, Expr))
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
        else if (is_instance(other, Polynomial))
        {
            return 0 > UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.gt(self);
        }
        else if (is_instance(other, Expr))
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
        else if (is_instance(other, Polynomial))
        {
            return 0 >= UniPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, [RationalFunc, MultiPolynomial]))
        {
            return other.gte(self);
        }
        else if (is_instance(other, Expr))
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

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().add(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? Polynomial.Add(other, self.clone()) : self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().sub(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.neg().add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? Polynomial.Add(other, self.clone(), true) : self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().mul(other);
        else if (is_instance(other, [RationalFunc, MultiPolynomial])) return other.mul(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Polynomial]) ? Polynomial.Mul(other, self.clone()) : self;
    }
    ,div: function(other, q_and_r) {
        var self = this;
        if (is_instance(other, Expr)) return self.toExpr().div(other);
        else if (is_instance(other, RationalFunc)) return RationalFunc(MultiPolynomial(self, other.num.symbol, other.num.ring)).div(other);
        else if (is_instance(other, MultiPolynomial)) return MultiPolynomial(self, other.symbol, other.ring).div(other, q_and_r);
        return is_instance(other, [Polynomial, Numeric]) || Abacus.Arithmetic.isNumber(other) ? Polynomial.Div(self, other, true === q_and_r) : self;
    }
    ,multidiv: function(others, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true === q_and_r);
        if (is_instance(others, Polynomial)) others = [others];
        if (!others || !others.length) return q_and_r ? [[], self] : [];

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
    ,mod: function(other) {
        var qr = this.div(other, true);
        return qr[1];
    }
    ,multimod: function(others) {
        var qr = this.multidiv(others, true);
        return qr[1];
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
        if (is_instance(other, [RationalFunc, Expr])) return true;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(a))
            other = Polynomial(other, self.symbol, self.ring);
        if (is_instance(a, Poly))
            return other.mod(self).equ(Arithmetic.O);
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
                --i; pq = Polynomial.Mul(q, pq);
                if (j < t.length && i === t[j].e) pq = Polynomial.Add(t[j++].c, pq);
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
            return Polynomial(self.terms.map(function(term) {
                return term.e < -s ? null : UniPolyTerm(term.c, term.e+s, self.ring);
            }).filter(UniPolyTerm.isNonZero), self.symbol, self.ring);
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
            t = self.terms, i, j, v;
        if (!t.length) return ring.Zero();
        if (!is_instance(x, Numeric) && !Arithmetic.isNumber(x) && is_obj(x)) x = x[self.symbol];
        x = x || O;
        //x = ring.cast(x);
        i = t[0].e; v = t[0].c; j = 1;
        while (0 < i)
        {
            --i; v = v.mul(x);
            if (j < t.length && i === t[j].e) v = t[j++].c.add(v);
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
            out += (prev && ((is_instance(ti.c, RationalFunc) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
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
        return is_instance(a, Polynomial) && (a.ring === ring);
    }, function(a) {
        return is_string(a) ? Polynomial.fromString(a, symbol, ring) : new Polynomial(a, symbol, ring);
    });
    return type_cast(a);
};


// Represents a multivariate polynomial term with coefficient and exponents in Polynomial non-zero sparse representation
var MultiPolyTerm = Class({

    constructor: function MultiPolyTerm(c, e, ring) {
        var self = this;
        if (!is_instance(self, MultiPolyTerm)) return new MultiPolyTerm(c, e, ring);

        if (is_instance(c, MultiPolyTerm)) {ring = ring || c.ring; e = c.e.slice(); c = c.c;}
        else if (is_instance(c, UniPolyTerm)) {ring = ring || c.ring; e = [c.e]; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        if (is_instance(c, MultiPolynomial) && (c.ring.NumberClass !== self.ring.NumberClass) && !is_class(c.ring.NumberClass, Complex) &&
            is_class(c.ring.NumberClass, [Integer, Rational]) && is_class(self.ring.NumberClass, [Rational, Complex]))
        {
                c = MultiPolynomial(c, c.symbol, self.ring);
        }
        self.c = is_instance(c, [MultiPolynomial, RationalFunc]) ? c : self.ring.cast(c || 0);
        self.e = is_array(e) ? e : [+(e || 0)];
    }

    ,__static__: {
        isNonZero: function(t) {
            return is_instance(t, MultiPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function(t1, t2, full) {
            function cmp_exp_i(e1, e2, i) {
                if (i >= e1.length && i >= e2.length)
                    return 0;
                else if (i >= e2.length)
                    return 0 === e1[i] ? cmp_exp_i(e1, e2, i+1) : e1[i];
                else if (i >= e1.length)
                    return 0 === e2[i] ? cmp_exp_i(e1, e2, i+1) : -e2[i];
                else if (e1[i] === e2[i])
                    return cmp_exp_i(e1, e2, i+1);
                return e1[i] - e2[i];
            };

            if ((is_array(t1)||is_args(t1)) && (is_array(t2)||is_args(t2))) return cmp_exp_i(t1, t2, 0);

            var res = cmp_exp_i(t1.e, t2.e, 0);
            if ((true === full) && (0 === res))
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return MultiPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return MultiPolyTerm(true === full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc]) || is_instance(t2.c, [MultiPolynomial, RationalFunc])) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), array(stdMath.max(t1.e.length, t2.e.length), function(i) {
                return i < t1.e.length && i < t2.e.length ? stdMath.min(t1.e[i], t2.e[i]) : 0;
            }));
        }
        ,lcm: function(t1, t2, full) {
            return MultiPolyTerm(true === full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc]) || is_instance(t2.c, [MultiPolynomial, RationalFunc])) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), array(stdMath.max(t1.e.length, t2.e.length), function(i) {
                return i < t1.e.length && i < t2.e.length ? stdMath.max(t1.e[i], t2.e[i]) : (i < t1.e.length ? t1.e[i] : t2.e[i]);
            }));
        }
    }

    ,ring: null
    ,c: null
    ,e: null

    ,dispose: function() {
        var self = this;
        self.ring = null;
        self.c = null;
        self.e = null;
        return self;
    }
    ,clone: function() {
        return new MultiPolyTerm(this);
    }
    ,cast: function(ring) {
        var self = this;
        return ring === self.ring ? self : new MultiPolyTerm(self.c, self.e, ring);
    }
    ,equ: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? 0 === MultiPolyTerm.cmp(self, term, true) : self.c.equ(term);
    }
    ,neg: function() {
        var self = this;
        return MultiPolyTerm(self.c.neg(), self.e.slice(), self.ring);
    }
    ,add: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.add(term.c), self.e.slice(), self.ring) : MultiPolyTerm(self.c.add(term), self.e.slice(), self.ring);
    }
    ,sub: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.sub(term.c), self.e.slice(), self.ring) : MultiPolyTerm(self.c.sub(term), self.e.slice(), self.ring);
    }
    ,mul: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.mul(term.c), array(stdMath.max(self.e.length, term.e.length), function(i) {
            return i < self.e.length && i < term.e.length ? self.e[i]+term.e[i] : (i < term.e.length ? term.e[i] : self.e[i]);
        }), self.ring) : MultiPolyTerm(self.c.mul(term), self.e.slice(), self.ring);
    }
    ,div: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.div(term.c), array(stdMath.max(self.e.length, term.e.length), function(i) {
            return i < self.e.length && i < term.e.length ? stdMath.max(0, self.e[i]-term.e[i]) : (i < term.e.length ? 0 : self.e[i]);
        }), self.ring) :  MultiPolyTerm(self.c.div(term), self.e.slice(), self.ring);
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
        return 1 === k ? self : MultiPolyTerm(self.c.pow(k), array(self.e.length, function(i) {return stdMath.floor(self.e[i] * k);}), self.ring);
    }
    ,rad: function(k) {
        var self = this;
        k = +k;
        return 1 === k ? self : MultiPolyTerm(self.c.rad(k), array(self.e.length, function(i) {return stdMath.max(stdMath.floor(self.e[i] / k), stdMath.min(1, self.e[i]));}), self.ring);
    }
    ,toTerm: function(symbol, asTex, monomialOnly, asDec, precision) {
        var t = this, e = t.e, c = t.c, term,
            Arithmetic = Abacus.Arithmetic,
            I = Arithmetic.I, J = Arithmetic.J;
        term = symbol.reduce(true === asTex
        ? function(monom, sym, i) {
            return 0 < e[i] ? (monom + (monom.length ? ' \\cdot ' : '') + to_tex(sym) + (1 < e[i] ? ('^{' + Tex(e[i]) + '}') : '')) : monom;
        }
        : function(monom, sym, i) {
            return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1 < e[i] ? ('^' + String(e[i])) : '')) : monom;
        }, '');
        if (true !== monomialOnly)
        {
            if (true === asDec)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst(true) ? ('(' + c.toDec(precision) + ')') : (!c.isReal() ? ('(' + c.toDec(precision) + ')') : c.toDec(precision))))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst(true) ? '(' + c.toDec(precision) + ')' : c.toDec(precision));
            }
            else if (true === asTex)
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst(true) ? ('(' + c.toTex() + ')') : (!c.isReal() ? ('(' + c.toTex() + ')') : c.toTex())))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc]) && !c.isConst(true) ? '(' + c.toTex() + ')' : c.toTex());
            }
            else
            {
                term = term.length ? ((c.equ(I) ? '' : (c.equ(J) ? '-' : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, RationalFunc) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? ('(' + c.toString() + ')*') : (!c.isReal() ? ('(' + c.toString() + ')*') : (c.toString(true) + '*'))))) + term) : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, RationalFunc) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? '(' + c.toString() + ')' : c.toString());
            }
        }
        return term;
    }
    ,toString: function() {
        var self = this;
        return '(' + self.c.toString() + ',[' + self.e.join(',') + '])';
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
            self.terms = (self.ring !== terms.ring) || (self.symbol.length !== terms.symbol.length) ? terms.terms.map(function(t) {
                return MultiPolyTerm(t.c, self.symbol.length <= terms.symbol.length ? t.e.slice(0, self.symbol.length) : t.e.concat(array(self.symbol.length-terms.symbol.length, 0)), self.ring);
            }) : terms.terms.slice();
            self._rsym = terms._rsym ? terms._rsym.slice() : null;
        }
        else if (is_instance(terms, Polynomial))
        {
            self.ring = ring || terms.ring;
            self.symbol = is_array(symbol) && symbol.length ? symbol : [terms.symbol];
            index = self.symbol.indexOf(terms.symbol); if (-1 === index) index = 0;
            self.terms = terms.terms.map(function(t) {
                return MultiPolyTerm(t.c, array(self.symbol.length, function(i) {return i === index ? t.e : 0;}), self.ring);
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
                    self.terms = terms.map(function(c, e) {
                        return MultiPolyTerm(c, array(self.symbol.length, function(i) {return 0 === i ? e : 0;}), self.ring);
                    }).filter(MultiPolyTerm.isNonZero).reverse();
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

        ,hasInverse: function() {
            return false;
        }

        ,Zero: function(symbol, ring) {
            return new MultiPolynomial([], symbol || ['x'], ring || Ring.Q());
        }
        ,One: function(symbol, ring) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.One(), symbol || ['x'], ring);
        }
        ,MinusOne: function(symbol, ring) {
            ring = ring || Ring.Q()
            return new MultiPolynomial(ring.MinusOne(), symbol || ['x'], ring);
        }

        ,cast: null // added below

        ,gcd: Polynomial.gcd
        ,xgcd: Polynomial.xgcd
        ,lcm: Polynomial.lcm

        ,Add: function(x, P, do_sub, recur) {
            var Arithmetic = Abacus.Arithmetic, res, rsym;
            if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

            if (is_instance(x, MultiPolynomial))
            {
                // O(max(n1,n2))
                if (x.terms.length)
                {
                    recur = (true === recur);
                    if (recur)
                    {
                        rsym = P._rsym;
                        P = P.recur(false);
                        x = x.recur(false);
                    }
                    P.terms = addition_sparse(P.terms, x.terms, MultiPolyTerm, true === do_sub, P.ring);
                    if (recur && rsym) P = P.recur(rsym);
                }
            }
            else if (is_instance(x, Numeric) || Arithmetic.isNumber(x))
            {
                // O(1)
                x = MultiPolyTerm(x, array(P.symbol.length, 0), P.ring);
                if (!x.equ(Arithmetic.O))
                {
                    res = P.terms.length ? addition_sparse([P.terms.pop()], [x], MultiPolyTerm, true === do_sub, P.ring) : [x];
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
                    recur = (true === recur);
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
                    for (i=P.terms.length-1; i>=0; --i)
                        P.terms[i] = P.terms[i].mul(x);
                }
            }
            return P;
        }

        ,Div: function(P, x, q_and_r, recur) {
            var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, rsym, q/*, r, d, diff, diff0*/;
            q_and_r = (true === q_and_r);

            if (is_instance(x, Polynomial)) x = MultiPolynomial(x, P.symbol, P.ring);

            if (is_instance(x, MultiPolynomial))
            {
                if (!x.terms.length) throw new Error('Division by zero in Abacus.MultiPolynomial!');

                recur = (true === recur);
                if (recur) x = x.recur(false); // convert to flat representation
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
                if (recur)
                {
                    rsym = P._rsym;
                    P = P.recur(false);
                }
                q = division_sparse(P.terms, x.terms, MultiPolyTerm, q_and_r, P.ring);
                q = q_and_r ? [MultiPolynomial(q[0], P.symbol, P.ring), MultiPolynomial(q[1], P.symbol, P.ring)] : MultiPolynomial(q, P.symbol, P.ring);
                if (recur && rsym)
                {
                    if (q_and_r) {q[0] = q[0].recur(rsym); q[1] = q[1].recur(rsym);}
                    else q = q.recur(rsym);
                }
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

        ,C: function(c, x, ring) {
            return new MultiPolynomial(c || Abacus.Arithmetic.O, x || ['x'], ring || Ring.Q());
        }

        ,fromString: function(s, symbol, ring) {
            return MultiPolynomial.fromExpr(Expr.fromString(s, Complex.Symbol), symbol, ring);
        }
        ,fromExpr: function(e, symbol, ring) {
            if (!is_instance(e, Expr)) return null;
            ring = ring || Ring.Q();
            symbol = symbol || ['x'];
            if (is_string(symbol)) symbol = [symbol];
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
    ,_flat: null
    ,_recur: null
    ,_rsym: null

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
        self._flat = null;
        self._recur = null;
        self._rsym = null;
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
    ,isMono: function() {
        // is monomial
        var terms = this.terms;
        return (1 === terms.length) && ((!is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isMono()) && 0 !== MultiPolyTerm.cmp(terms[0].e, [0]));
    }
    ,isConst: function(recur) {
        var terms = this.terms;
        recur = (true === recur);
        return (0 === terms.length) || ((1 === terms.length) && ((!recur || !is_instance(terms[0].c, MultiPolynomial) || terms[0].c.isConst(recur)) && 0 === MultiPolyTerm.cmp(terms[0].e, [0])));
    }
    ,isUni: function(x, strict) {
        // is univariate on symbol x
        var self = this, terms = self.terms, index, e, i, d;
        index = self.symbol.indexOf(String(x || 'x'));
        if (-1 === index) return false;
        strict = (true === strict); d = 0;
        for (i=terms.length-1; i>=0; --i)
        {
            e = terms[i].e;
            d = stdMath.max(d, e[index]);
            if (0 !== MultiPolyTerm.cmp(e.slice(0, index).concat(e.slice(index+1)), [0]))
                return false;
        }
        return strict ? (0 !== d) : true;
    }
    ,isRecur: function(strict) {
        // is recursive, has coefficients that are multipolynomials on rest variables
        //return (null!=this._rsym) && (0<this._rsym.length);
        strict = false !== strict;
        var terms = this.terms, i;
        for (i=terms.length-1; i>=0; --i)
            if (is_instance(terms[i].c, MultiPolynomial) && (strict || !terms[i].c.isConst(true))) return true;
        return false;
    }
    ,deg: function(x, recur) {
        // polynomial degree
        var self = this, terms = self.terms, symbol = self.symbol, index;
        if (arguments.length)
        {
            recur = (true === recur);
            index = symbol.indexOf(String(x || 'x'));
            return (-1 === index) || !terms.length ? 0 : (recur && is_instance(term[0].c, MultiPolynomial) ? (terms[0].e[index]+term[0].c.deg(x, recur)) : terms[0].e[index]);
        }
        return terms.length ? terms[0].e : array(symbol.length, 0);
    }
    ,maxdeg: function(x, recur) {
        // polynomial maximum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true === recur);
        if (arguments.length && (true === x))
        {
            return operate(function(max, xi) {
                return stdMath.max(max, self.maxdeg(xi));
            }, 0, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x || 'x')) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(max, t) {
            if (recur && is_instance(t.c, MultiPolynomial))
                return stdMath.max(max, t.e[index], t.e[index]+t.c.maxdeg(x, recur));
            else
                return stdMath.max(max, t.e[index]);
        }, 0, terms);
    }
    ,mindeg: function(x, recur) {
        // polynomial minimum degree per symbol
        var self = this, terms = self.terms, symbol = self.symbol, index;
        recur = (true === recur);
        if (arguments.length && (true === x))
        {
            return operate(function(min, xi) {
                return -1 === min ? self.mindeg(xi, recur) : stdMath.min(min, self.mindeg(xi, recur));
            }, -1, symbol);
        }
        index = arguments.length ? symbol.indexOf(String(x || 'x')) : 0;
        if ((-1 === index) || !terms.length) return 0;
        x = symbol[index];
        return operate(function(min, t) {
            var deg = t.e[index]+(recur && is_instance(t.c, MultiPolynomial) ? t.c.mindeg(x, recur) : 0);
            return -1 === min ? deg : stdMath.min(min, deg);
        }, -1, terms);
    }
    ,term: function(i, as_degree) {
        // term(s) matching i as index or as degree
        var self = this, terms = self.terms, ring = self.ring, symbol = self.symbol;
        if (true === as_degree)
            return terms.reduce(function(matched, t) {
                // amtch all terms which have i as aggregate degree
                if (i === t.e.reduce(addn, 0))
                    matched = matched.add(MultiPolynomial([t], symbol, ring));
                return matched;
            }, MultiPolynomial.Zero(symbol, ring));
        return MultiPolynomial(0 <= i && i < terms.length ? [terms[i]] : [], symbol, ring);
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
            }, null, terms);
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
                if ((null == min) || (min.e[index] > t.e[index])) min = t;
                return min;
            }, null, terms);
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
        return terms.length && (0 === MultiPolyTerm.cmp(terms[terms.length-1].e, [0])) ? terms[terms.length-1].c : this.ring.Zero();
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
                self._flat = (1 >= symbol.length) || !self.isRecur() ? self : operate(function(p, t) {
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
                self._recur = 1 >= symbol.length ? self : operate(function(p, x) {return p.recur(x);}, self.recur(false), symbol);
                self._recur._flat = self.recur(false);
                self._recur._recur = self._recur;
            }
            return self._recur;
        }
        else if (is_array(x))
        {
            return operate(function(p, xi) {return p.recur(xi);}, self, x);
        }
        else if (x)
        {
            // make recursive on/group by symbol x
            // idempotent if is already grouped on x
            if (1 >= symbol.length) return self;
            x = String(x || 'x'); index = symbol.indexOf(x);
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
            pr = MultiPolynomial(operate(function(terms, t) {
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
            }, new Array(maxdeg+1), terms).map(function(t, e) {
                return t.equ(Arithmetic.O) ? null : MultiPolyTerm(t, array(symbol.length, function(i) {return index === i ? maxdeg-e : 0;}));
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
            return MultiPolynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring);
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
            // at least make positive
            return divides ? MultiPolynomial(self.terms.map(function(t) {return t.div(lc);}), self.symbol, self.ring) : (lc.lt(Arithmetic.O) ? self.neg() : self);
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
                coeffp = terms.reduce(function(coeffp, t) {
                    coeffp.push(is_instance(t.c, MultiPolynomial) ? t.c.primitive(true) : [MultiPolynomial([t], symbol, ring), field.One()]);
                    return coeffp;
                }, []);
                content = field.gcd(coeffp.map(function(c) {return c[1];}));
                self._prim = [MultiPolynomial(coeffp.map(function(c, i) {
                    return MultiPolyTerm(c[0].mul(ring.cast(c[1].div(content))), terms[i].e, ring);
                }), symbol, ring), content];
            }
            else if (is_class(ring.NumberClass, Complex))
            {
                    isReal = self.isReal(); isImag = self.isImag();
                    if (!isReal && !isImag)
                    {
                        content = ring.gcd(terms.map(function(t) {return t.c;})).simpl();
                        self._prim = [MultiPolynomial(terms.map(function(t) {return MultiPolyTerm(t.c.div(content), t.e, ring);}), symbol, ring), content];
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
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Complex.Img().mul(Rational(content, LCM).simpl()))];
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
                        self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
                    }
            }
            else
            {
                LCM = is_class(ring.NumberClass, Integer) ? Arithmetic.I : terms.reduce(function(LCM, t) {return Arithmetic.mul(LCM, t.c.den);}, Arithmetic.I);
                coeffp = terms.map(function(t) {return t.c.mul(LCM).num;});
                content = gcd(coeffp);
                coeffp = coeffp.map(function(c){return Arithmetic.div(c, content);});
                // make positive lead
                if (Arithmetic.gt(Arithmetic.O, coeffp[0]))
                {
                    coeffp = coeffp.map(function(c) {return Arithmetic.neg(c);});
                    content = Arithmetic.neg(content);
                }
                self._prim = [MultiPolynomial(coeffp.map(function(c, i) {return MultiPolyTerm(c, terms[i].e, ring);}), symbol, ring), field.create(Rational(content, LCM).simpl())];
            }
        }
        return true === and_content ? self._prim.slice() : self._prim[0];
    }
    ,content: function() {
        var p = this.primitive(true);
        return p[1];
    }
    ,equ: function(other, strict) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O,
            t = self.terms, tp, s, i;
        if (Arithmetic.isNumber(other))
        {
            return Arithmetic.equ(O, other) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if (is_instance(other, Numeric))
        {
            return other.equ(O) ? 0 === t.length : ((1 === t.length) && t[0].c.equ(other) && (0 === MultiPolyTerm.cmp(t[0].e, [0])));
        }
        else if (is_instance(other, Poly))
        {
            strict = (false !== strict);
            other = is_instance(other, Polynomial) ? MultiPolynomial(other, self.symbol, self.ring).terms : other;
            if (!strict)
            {
                t = self.recur(false).terms;
                other = other.recur(false);
            }
            tp = other.terms;
            if (t.length !== tp.length) return false;
            for (i=t.length-1; i>=0; --i)
                if (!t[i].equ(tp[i]))
                    return false;
            return true;
        }
        else if (is_instance(other, RationalFunc))
        {
            return other.equ(self);
        }
        else if (is_instance(other, Expr))
        {
            return self.toExpr().equ(other);
        }
        else if (is_string(other))
        {
            return (other === self.toString()) || (other === self.toTex());
        }
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst(true) || self.cc().gt(other);
        }
        else if (is_instance(other, RationalFunc))
        {
            return other.lt(self);
        }
        else if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 < MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, Expr))
        {
            return self.toExpr().gt(other);
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return !self.isConst(true) || self.cc().gte(other);
        }
        else if (is_instance(other, RationalFunc))
        {
            return other.lte(self);
        }
        else if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 <= MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, Expr))
        {
            return self.toExpr().gte(other);
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst(true) && self.cc().lt(other);
        }
        else if (is_instance(other, RationalFunc))
        {
            return other.gt(self);
        }
        else if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 > MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, Expr))
        {
            return self.toExpr().lt(other);
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Numeric) || Arithmetic.isNumber(other))
        {
            return self.isConst(true) && self.cc().lte(other);
        }
        else if (is_instance(other, RationalFunc))
        {
            return other.gte(self);
        }
        else if (is_instance(other, Poly))
        {
            if (is_instance(other, Polynomial)) other = MultiPolynomial(other, self.symbol, self.ring);
            return 0 >= MultiPolyTerm.cmp(self.ltm(), other.ltm(), true);
        }
        else if (is_instance(other, Expr))
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
            return MultiPolynomial(self.terms.map(function(t) {
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
                self._c = MultiPolynomial(self.terms.map(function(t) {
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
            self._n = MultiPolynomial(array(self.terms.length, function(i) {return self.terms[i].neg();}), self.symbol, self.ring);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().add(other);
        else if (is_instance(other, RationalFunc)) return other.add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? MultiPolynomial.Add(other, self.clone(), false, true) : self;
    }
    ,_add: function(other) {
        // add as is without preserving any recursive representation
        var self = this;
        return is_instance(other, Poly) ? MultiPolynomial.Add(other, self.clone(), false, false) : self.add(other);
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().sub(other);
        else if (is_instance(other, RationalFunc)) return other.neg().add(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? MultiPolynomial.Add(other, self.clone(), true, true) : self;
    }
    ,_sub: function(other) {
        // sub as is without preserving any recursive representation
        var self = this;
        return is_instance(other, Poly) ? MultiPolynomial.Add(other, self.clone(), true, false) : self.sub(other);
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, Expr)) return self.toExpr().mul(other);
        else if (is_instance(other, RationalFunc)) return other.mul(self);
        return Arithmetic.isNumber(other) || is_instance(other, [Numeric, Poly]) ? MultiPolynomial.Mul(other, self.clone(), true) : self;
    }
    ,_mul: function(other) {
        // mul as is without preserving any recursive representation
        var self = this;
        return is_instance(other, Poly) ? MultiPolynomial.Mul(other, self.clone(), false) : self.mul(other);
    }
    ,div: function(other, q_and_r) {
        var self = this;
        if (is_instance(other, Expr)) return self.toExpr().div(other);
        else if (is_instance(other, RationalFunc)) return RationalFunc(self).div(other);
        else if (is_instance(other, [Numeric, Poly]) || Abacus.Arithmetic.isNumber(other))
            return MultiPolynomial.Div(self, other, true === q_and_r, true);
        return self;
    }
    ,_div: function(other, q_and_r) {
        // div as is without preserving any recursive representation
        var self = this;
        return is_instance(other, Poly) ? MultiPolynomial.Div(self, other, true === q_and_r, false) : self.div(other, q_and_r);
    }
    ,multidiv: function(others, q_and_r) {
        var self = this, p, qs, r, n, i, plt, xlt, t, divides, rsym = self._rsym, Arithmetic = Abacus.Arithmetic;

        q_and_r = (true === q_and_r);
        if (is_instance(others, MultiPolynomial)) others = [others];
        if (!others || !others.length) return q_and_r ? [[], self] : [];

        n = others.length;
        qs = array(n, function() {return [];});
        r = [];
        p = self.recur(false).clone();
        others = others.map(function(xi) {return xi.recur(false);});
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
                p.terms = addition_sparse(p.terms, others[i].terms.map(function(xt){return xt.mul(t);}), MultiPolyTerm, true, p.ring);
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
    ,mod: function(other) {
        var qr = this.div(other, true);
        return qr[1];
    }
    ,_mod: function(other) {
        var qr = this._div(other, true);
        return qr[1];
    }
    ,multimod: function(others) {
        var qr = this.multidiv(others, true);
        return qr[1];
    }
    ,divmod: function(other) {
        return this.div(other, true);
    }
    ,_divmod: function(other) {
        return this._div(other, true);
    }
    ,multidivmod: function(others) {
        return this.multidiv(others, true);
    }
    ,divides: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (self.equ(Arithmetic.O)) return false;
        if (is_instance(other, [RationalFunc, Expr])) return true;
        if (is_instance(other, [Polynomial, Numeric]) || Arithmetic.isNumber(other))
            other = MultiPolynomial(other, self.symbol, self.ring);
        if (is_instance(other, MultiPolynomial))
            return other.mod(self).equ(Arithmetic.O);
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
            while ((index < symbol.length) && (0 === p.maxdeg(symbol[index], true))) ++index;
            if (index >= symbol.length) return MultiPolynomial(p.cc(), symbol, ring);
            var s, t = p.terms, i, j, pq, qi, tc;
            if (!t.length) return O;
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if (HAS.call(memo, s)) return memo[s];
            qi = HAS.call(q, symbol[index]) ? MultiPolynomial(q[symbol[index]]||Arithmetic.O, symbol, ring) : MultiPolynomial([MultiPolyTerm(ring.One(), array(symbol.length, function(i) {return i === index ? 1 : 0}), ring)], symbol, ring);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, q, index+1) : MultiPolynomial(t[0].c, symbol, ring);
            i = t[0].e[index]; pq = tc; j = 1;
            while (0 < i)
            {
                --i; pq = MultiPolynomial.Mul(qi, pq, false);
                if (j < t.length && i === t[j].e[index])
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, q, index+1) : t[j].c;
                    pq = MultiPolynomial.Add(tc, pq, false, false);
                    ++j;
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
        index = symbol.indexOf(x); if (-1 === index) index = 0;
        x = symbol[index];
        s = Arithmetic.val(s);
        if (0 === s)
            return self;
        if (0 > s) // division by monomial x^|s|
        {
            if (-s > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
            return MultiPolynomial(self.terms.map(function(term) {
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
        return MultiPolynomial(self.terms.map(function(term) {
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
        index = symbol.indexOf(x); if (-1 === index) index = 0;
        x = symbol[index];
        if (n > self.maxdeg(x, true)) return MultiPolynomial.Zero(symbol, ring);
        dp = MultiPolynomial(self.terms.map(function(term) {
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
                        for (c=I,j=term.e[index]; j+n>term.e[index]; --j) c = Arithmetic.mul(c, j);
                        term.c = term.c._mul(c); term.e[index] -= n;
                        return term;
                    }
                }
                else
                {
                    term = term.clone(); j = n;
                    do {
                        --j;
                        term.c = term.c.d(x,1)._add(term.c._mul(term.e[index]));
                        term.e[index] = stdMath.max(term.e[index]-1, 0);
                    } while ((0 < j) && !term.c.equ(O))
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
                    for (c=I,j=term.e[index]; j+n>term.e[index]; --j) c = Arithmetic.mul(c, j);
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
            while ((index < symbol.length) && (0 === p.maxdeg(symbol[index], true))) ++index;
            if (index >= symbol.length) return p.cc();
            var s, t = p.terms, i, j, v, xi, tc;
            if (!t.length) return ring.Zero();
            // memoize, sometimes same subpolynomial is re-evaluated
            s = p.toString(); if (HAS.call(memo, s)) return memo[s];
            xi = (HAS.call(x, symbol[index]) ? x[symbol[index]] : O) || O;
            //xi = ring.cast(xi);
            tc = is_instance(t[0].c, MultiPolynomial) ? horner(t[0].c, x, index+1) : t[0].c;
            i = t[0].e[index]; v = tc; j = 1;
            while (0 < i)
            {
                --i; v = v.mul(xi);
                if (j < t.length && i === t[j].e[index])
                {
                    tc = is_instance(t[j].c, MultiPolynomial) ? horner(t[j].c, x, index+1) : t[j].c;
                    v = tc.add(v);
                    ++j;
                }
            }
            memo[s] = v;
            return v;
        };
        return horner(self.recur(true), x || {});
    }
    ,toExpr: function() {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, t, ti, c, x, i, l, term, terms;
        if (null == self._expr)
        {
            if (self.isRecur())
            {
                self._expr = self.recur(false).toExpr();
            }
            else
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
                self._expr = 1 < terms.length ? Expr('+', terms)/*.expand()*/ : (1 === terms.length ? terms[0] : Expr.Zero());
            }
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
            out += (prev && (((is_instance(ti.c, MultiPolynomial) && !ti.c.isConst(true)) || (is_instance(ti.c, RationalFunc) && (!ti.c.isConst(true) || !ti.c.den.equ(Arithmetic.I)))) || !ti.c.isReal() || ti.c.gt(Arithmetic.O)) ? '+' : '') + ti.toTerm(x, false, false, true, precision);
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
        return is_instance(a, MultiPolynomial) && (a.ring === ring);
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
        c[0] = TermClass(0, a[0].mul(b[0]).e, ring);
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
                if (!c[k].equ(O)) c[++k] = TermClass(0, 0, ring);
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
Polynomial.kthroot = MultiPolynomial.kthroot = polykthroot;
function polyres(p, q)
{
    // https://en.wikipedia.org/wiki/Resultant
    // assume q poly is of same type and of same ring as p poly
    var t1 = p.terms, t2 = q.terms,
        l1 = t1.length, l2 = t2.length,
        n1 = p.deg(), n2 = q.deg(),
        n, i, pcol, qcol, ring, O;

    if (!n1 || !n2) return O;

    /*
    | p0  0  ..  q0 0  ..|
    | p1  p0 ..  q1 q0 ..|
    | .   .  ..  .  .  ..|
    | .   .  ..  .  .  ..|
    | pn  .  ..  qm .  ..|
    | 0   pn ..  0  qm ..|
    | .   .  ..  .  .  ..|
    | .   .  ..  .  .  ..|
    | 0   0  ..  0  0  ..|
    */
    n = n1 + n2;
    ring = p.ring;
    O = ring.Zero();
    i = 0;
    pcol = array(n, function(r) {
        return r <= n1 ? ((i < l1) && (n1-r === t1[i].e) ? t1[i++].c : O) : O;
    });
    i = 0;
    qcol = array(n, function(r) {
        return r <= n2 ? ((i < l2) && (n2-r === t2[i].e) ? t2[i++].c : O) : O;
    });
    return Matrix(ring, array(n, function(c) {
        var col = c < n2 ? pcol : qcol, ret = col.slice();
        col.unshift(col.pop()); // shift
        return ret;
    })).t().detr();
}
Polynomial.resultant = MultiPolynomial.resultant = polyres;
