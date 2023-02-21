// Represents a multivariate polynomial term with coefficient and exponents in Polynomial non-zero sparse representation
MultiPolyTerm = Class({
    constructor: function MultiPolyTerm(c, e, ring) {
        var self = this;
        if (!is_instance(self, MultiPolyTerm)) return new MultiPolyTerm(c, e, ring);

        if (is_instance(c, MultiPolyTerm)){ring = ring || c.ring; e = c.e.slice(); c = c.c;}
        else if (is_instance(c, UniPolyTerm)){ring = ring || c.ring; e = [c.e]; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        if (is_instance(c, MultiPolynomial) && (c.ring.NumberClass!==self.ring.NumberClass) && !is_class(c.ring.NumberClass, Complex) &&
            is_class(c.ring.NumberClass, [Integer, Rational]) && is_class(self.ring.NumberClass, [Rational, Complex]))
        {
                c = MultiPolynomial(c, c.symbol, self.ring);
        }
        self.c = is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) ? c : self.ring.cast(c||0);
        self.e = is_array(e) ? e : [+(e||0)];
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
                    return 0===e1[i] ? cmp_exp_i(e1, e2, i+1) : e1[i];
                else if (i >= e1.length)
                    return 0===e2[i] ? cmp_exp_i(e1, e2, i+1) : -e2[i];
                else if (e1[i]===e2[i])
                    return cmp_exp_i(e1, e2, i+1);
                return e1[i]-e2[i];
            };

            if ((is_array(t1)||is_args(t1)) && (is_array(t2)||is_args(t2))) return cmp_exp_i(t1, t2, 0);

            var res = cmp_exp_i(t1.e, t2.e, 0);
            if ((true===full) && (0===res))
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return MultiPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return MultiPolyTerm(true===full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc, RationalExpr]) || is_instance(t2.c, [MultiPolynomial, RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), array(stdMath.max(t1.e.length, t2.e.length), function(i){
                return i<t1.e.length && i<t2.e.length ? stdMath.min(t1.e[i], t2.e[i]) : 0;
            }));
        }
        ,lcm: function(t1, t2, full) {
            return MultiPolyTerm(true===full ? (!(is_instance(t1.c, [MultiPolynomial, RationalFunc, RationalExpr]) || is_instance(t2.c, [MultiPolynomial, RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), array(stdMath.max(t1.e.length, t2.e.length), function(i){
                return i<t1.e.length && i<t2.e.length ? stdMath.max(t1.e[i], t2.e[i]) : (i<t1.e.length ? t1.e[i] : t2.e[i]);
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
        return ring===self.ring ? self : new MultiPolyTerm(self.c, self.e, ring);
    }
    ,equ: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? 0===MultiPolyTerm.cmp(self, term, true) : self.c.equ(term);
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
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.mul(term.c), array(stdMath.max(self.e.length, term.e.length), function(i){
            return i<self.e.length && i<term.e.length ? self.e[i]+term.e[i] : (i<term.e.length ? term.e[i] : self.e[i]);
        }), self.ring) : MultiPolyTerm(self.c.mul(term), self.e.slice(), self.ring);
    }
    ,div: function(term) {
        var self = this;
        return is_instance(term, MultiPolyTerm) ? MultiPolyTerm(self.c.div(term.c), array(stdMath.max(self.e.length, term.e.length), function(i){
            return i<self.e.length && i<term.e.length ? stdMath.max(0, self.e[i]-term.e[i]) : (i<term.e.length ? 0 : self.e[i]);
        }), self.ring) :  MultiPolyTerm(self.c.div(term), self.e.slice(), self.ring);
    }
    ,divides: function(term) {
        var self = this, e1 = self.e, e2 = term.e, i, n = stdMath.max(e1.length, e2.length);
        if (!self.c.divides(term.c)) return false;
        for (i=0; i<n; i++)
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
        return 1===k ? self : MultiPolyTerm(self.c.pow(k), array(self.e.length, function(i){return stdMath.floor(self.e[i]*k);}), self.ring);
    }
    ,rad: function(k) {
        var self = this;
        k = +k;
        return 1===k ? self : MultiPolyTerm(self.c.rad(k), array(self.e.length, function(i){return stdMath.max(stdMath.floor(self.e[i]/k), stdMath.min(1, self.e[i]));}), self.ring);
    }
    ,toTerm: function(symbol, asTex, monomialOnly, asDec, precision) {
        var t = this, e = t.e, c = t.c, term, Arithmetic = Abacus.Arithmetic;
        if (true===asDec)
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1<e[i] ? '^'+String(e[i]) : '')) : monom;
            }, '');
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toDec(precision)+')') : (!c.isReal() ? ('('+c.toDec(precision)+')') : c.toDec(precision))))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toDec(precision)+')' : c.toDec(precision));
        }
        else if (true===asTex)
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + to_tex(sym) + (1<e[i] ? '^{'+Tex(e[i])+'}' : '')) : monom;
            }, '');
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toTex()+')') : (!c.isReal() ? ('('+c.toTex()+')') : c.toTex())))) + term) : (is_instance(c, [MultiPolynomial, RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toTex()+')' : c.toTex());
        }
        else
        {
            term = symbol.reduce(function(monom, sym, i){
                return 0 < e[i] ? (monom + (monom.length ? '*' : '') + sym + (1<e[i] ? '^'+String(e[i]) : '')) : monom;
            }, '');
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? ('('+c.toString()+')*') : (!c.isReal() ? ('('+c.toString()+')*') : (c.toString(true)+'*'))))) + term) : ((is_instance(c, MultiPolynomial) && !c.isConst(true)) || (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I))) ? '('+c.toString()+')' : c.toString());
        }
        return term;
    }
    ,toString: function() {
        var self = this;
        return '('+self.c.toString()+',['+self.e.join(',')+'])';
    }
});
