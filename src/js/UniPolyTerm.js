// Represents a (univariate) polynomial term with coefficient and exponent in Polynomial non-zero sparse representation
UniPolyTerm = Class({
    constructor: function UniPolyTerm(c, e, ring) {
        var self = this;
        if (!is_instance(self, UniPolyTerm)) return new UniPolyTerm(c, e, ring);

        if (is_instance(c, UniPolyTerm)){ring = ring || c.ring; e = c.e; c = c.c;}
        self.ring = is_instance(ring, Ring) ? ring : Ring.Q();
        self.c = is_instance(c, [RationalFunc, RationalExpr]) ? c : self.ring.cast(c||0);
        self.e = +(e||0);
    }

    ,__static__: {
        isNonZero: function(t) {
            return is_instance(t, UniPolyTerm) && !t.c.equ(Abacus.Arithmetic.O);
        }
        ,cmp: function(t1, t2, full) {
            var res = t1.e-t2.e;
            if ((true===full) && (0===res))
                return t1.c.equ(t2.c) ? 0 : (t1.c.lt(t2.c) ? -1 : 1);
            return res;
        }
        ,sortDecr: function(t1, t2) {
            return UniPolyTerm.cmp(t2, t1);
        }
        ,gcd: function(t1, t2, full) {
            return UniPolyTerm(true===full ? (!(is_instance(t1.c, [RationalFunc, RationalExpr]) || is_instance(t2.c, [RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.gcd(t1.c, t2.c) : t1.ring.One()) : t1.ring.One(), stdMath.min(t1.e, t2.e));
        }
        ,lcm: function(t1, t2, full) {
            return UniPolyTerm(true===full ? (!(is_instance(t1.c, [RationalFunc, RationalExpr]) || is_instance(t2.c, [RationalFunc, RationalExpr])) && t1.ring.hasGCD() ? t1.ring.lcm(t1.c, t2.c) : t1.c.mul(t2.c)) : t1.c.mul(t2.c), stdMath.max(t1.e, t2.e));
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
        return ring===self.ring ? self : new UniPolyTerm(self.c, self.e, ring);
    }
    ,equ: function(term) {
        var self = this;
        return is_instance(term, UniPolyTerm) ? (self.c.equ(term.c) && self.e===term.e) : self.c.equ(term);
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
        return 1===k ? self : UniPolyTerm(self.c.pow(k), stdMath.floor(self.e*k), self.ring);
    }
    ,rad: function(k) {
        var self = this;
        k = +k;
        return 1===k ? self : UniPolyTerm(self.c.rad(k), stdMath.max(stdMath.floor(self.e/k), stdMath.min(1, self.e)), self.ring);
    }
    ,toTerm: function(symbol, asTex, monomialOnly, asDec, precision) {
        var t = this, e = t.e, c = t.c, term, Arithmetic = Abacus.Arithmetic;
        if (true===asDec)
        {
            term = 0 < e ? (symbol + (1<e ? '^'+String(e) : '')) : '';
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toDec(precision)+')') : (!c.isReal() ? ('('+c.toDec(precision)+')') : c.toDec(precision))))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toDec(precision)+')' : c.toDec(precision));
        }
        else if (true===asTex)
        {
            term = 0 < e ? (to_tex(symbol) + (1<e ? '^{'+Tex(e)+'}' : '')) : '';
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? ('('+c.toTex()+')') : (!c.isReal() ? ('('+c.toTex()+')') : c.toTex())))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toTex()+')' : c.toTex());
        }
        else
        {
            term = 0 < e ? (symbol + (1<e ? '^'+String(e) : '')) : '';
            if (true===monomialOnly) return term;
            term = term.length ? ((c.equ(Arithmetic.I) ? '' : (c.equ(Arithmetic.J) ? '-' : (is_instance(c, [RationalFunc, RationalExpr]) && (!c.isConst(true) || !c.den.equ(Arithmetic.I)) ? ('('+c.toString()+')*') : (!c.isReal() ? ('('+c.toString()+')*') : (c.toString(true)+'*'))))) + term) : (is_instance(c, [RationalFunc, RationalExpr]) && !c.isConst(true) ? '('+c.toString()+')' : c.toString());
        }
        return term;
    }
    ,toString: function() {
        var self = this;
        return '('+self.c.toString()+','+String(self.e)+')';
    }
});
