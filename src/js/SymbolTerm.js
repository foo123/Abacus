// Represents a single symbol
SymbolTerm = Class(Symbolic, {

    constructor: function SymbolTerm(s) {
        var self = this;
        if (!is_instance(self, SymbolTerm)) return new SymbolTerm(s);

        self.sym = is_instance(s, SymbolTerm) ? s.sym : SymbolTerm.fromString(s, false);
    }

    ,__static__: {
        fromString: function(s, as_symbol) {
            var i;
            s = trim(String(s));
            if ((-1 !== (i=s.indexOf('_'))) && ('{' === s.charAt(i+1)) && ('}' === s.charAt(s.length-1)))
                s = s.slice(0, i)+'_'+s.slice(i+2, -1);
            return false !== as_symbol ? new SymbolTerm(s) : s;
        }
    }

    ,sym: null
    ,_tex: null

    ,dispose: function() {
        var self = this;
        self.sym = null;
        self._tex = null;
        return self;
    }

    ,c: function() {
        return Complex.One();
    }
    ,isConst: function() {
        return false;
    }
    ,isReal: function() {
        return true;
    }
    ,isImag: function() {
        return false;
    }
    ,real: function() {
        return this;
    }
    ,imag: function() {
        return Expr();
    }

    ,equ: function(a) {
        var self = this;
        if (is_instance(a, SymbolTerm))
            return self.sym === a.sym;
        else if (is_instance(a, Symbolic))
            return a.equ(self);
        else if (is_string(a))
            return (a === self.toString()) || (a === self.toTex());
        return false;
    }
    ,neg: function() {
        return MulTerm(this, -1);
    }
    ,inv: function() {
        return RationalExpr(1, this);
    }
    ,add: function(a) {
        return Expr([this, a]);
    }
    ,sub: function(a) {
        return Expr([this, a.neg()]);
    }
    ,mul: function(a) {
        var self = this;
        if (is_instance(a, SymbolTerm))
            return self.sym===a.sym ? PowTerm(self, 2) : MulTerm([self, a], 1);
        else if (is_instance(a, Numeric))
            return MulTerm(self, a);
        else if (is_instance(a, Symbolic))
            return a.mul(self);
        return self;
    }
    ,div: function(a) {
        return RationalExpr(this, a);
    }
    ,pow: function(k) {
        return PowTerm(this, k);
    }
    ,rad: function(k) {
        return PowTerm(this, Rational(1, k));
    }
    ,d: function(n) {
        // nth order formal derivative
        if (null == n) n = 1;
        n = +n;
        if (0 > n) return null; // not supported
        return 1 === n ? Complex.One() : Complex.Zero();
    }
    ,evaluate: function(symbolValues) {
        var self = this;
        symbolValues = symbolValues || {};
        return Complex.cast(symbolValues[self.sym] || 0);
    }
    ,toString: function() {
        return this.sym;
    }
    ,toTex: function() {
        var self = this;
        if (null == self._tex)
            self._tex = to_tex(self.sym);
        return self._tex;
    }
});
