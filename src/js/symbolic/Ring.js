// Abacus.Ring represents an algebraic Ring or Field (even Polynomial Ring)
Ring = Abacus.Ring = Class({

    constructor: function Ring(NumberClass, PolynomialSymbol, isFraction, ForceMultiVariate) {
        var self = this, ring = null;
        if (!is_instance(self, Ring)) return new Ring(NumberClass, PolynomialSymbol, isFraction, ForceMultiVariate);

        self.Modulo = null;
        self.PolynomialClass = null;
        self.CoefficientRing = null;
        self.PolynomialSymbol = null;
        self.ModuloP = null;

        if (is_instance(NumberClass, Ring))
        {
            ring = NumberClass;
            self.NumberClass = ring.NumberClass;
        }
        else
        {
            if (is_array(NumberClass))
            {
                self.Modulo = Integer.cast(NumberClass[1]);
                NumberClass = NumberClass[0];
            }
            if (!is_class(NumberClass, Numeric)) NumberClass = Complex;
            self.NumberClass = NumberClass;
        }

        if (is_array(PolynomialSymbol) && is_array(PolynomialSymbol[1]))
        {
            self.ModuloP = PolynomialSymbol[1];
            self.PolynomialClass = MultiPolynomialMod;
            PolynomialSymbol = PolynomialSymbol[0];
            if (!is_array(PolynomialSymbol)) PolynomialSymbol = [PolynomialSymbol];
        }

        if (is_array(PolynomialSymbol) && PolynomialSymbol.length)
        {
            PolynomialSymbol = remove_duplicates(PolynomialSymbol.map(function(x) {
                if (!is_string(x)) throw new Error('not symbol');
                return String(x);
            }));
            if (is_instance(ring, Ring))
            {
                if (is_class(ring.PolynomialClass, Polynomial))
                {
                    // make multivariate by default
                    self.CoefficientRing = new Ring(ring.NumberClass, [ring.PolynomialSymbol]);
                    self.CoefficientRing.PolynomialClass = MultiPolynomial;
                    self.CoefficientRing.PolynomialSymbol = [ring.PolynomialSymbol];
                }
                else
                {
                    self.CoefficientRing = ring;
                }
            }
            else
            {
                self.CoefficientRing = is_class(self.NumberClass, IntegerMod) && self.Modulo ? (IntegerMod === self.NumberClass ? Ring.Zn(self.Modulo)() : Ring([self.NumberClass, self.Modulo])) : (is_class(self.NumberClass, Integer) ? (Integer === self.NumberClass ? Ring.Z() : Ring(self.NumberClass)) : (is_class(self.NumberClass, Rational) ? (Rational === self.NumberClass ? Ring.Q() : Ring(self.NumberClass)) : (Complex === self.NumberClass ? Ring.C() : Ring(self.NumberClass))));
            }

            if (!self.PolynomialClass)
            {
                if (true === isFraction)
                {
                    self.PolynomialClass = RationalFunc;
                    self.PolynomialSymbol = PolynomialSymbol;
                }
                else
                {
                    if ((true === ForceMultiVariate) || self.CoefficientRing.PolynomialClass || (1 < PolynomialSymbol.length))
                    {
                        self.PolynomialClass = MultiPolynomial;
                        self.PolynomialSymbol = PolynomialSymbol;
                    }
                    else
                    {
                        self.PolynomialClass = Polynomial;
                        self.PolynomialSymbol = PolynomialSymbol[0];
                    }
                }
            }
            else
            {
                self.PolynomialSymbol = PolynomialSymbol;
                if ((true === isFraction) && !self.isField())
                {
                    self.PolynomialClass = RationalFunc;
                    self._isfield = true;
                }
            }
        }
        else
        {
            if (true === isFraction)
            {
                if (is_class(self.NumberClass, Integer)) self.NumberClass = Rational;
            }
        }
    }

    ,__static__: {
         getSymbols: function(args) {
            return args.map(String).filter(function(x) {return 0 < x.length;});
        }

        ,ZZ: null
        ,QQ: null
        ,CC: null
        ,Z: function(/* "x","y",.. */) {
            if (null == Ring.ZZ) Ring.ZZ = new Ring(Integer);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? new Ring(Integer, args) : Ring.ZZ;
        }
        ,Zn: function(N) {
            N = Integer.cast(N);
            return function(/* "x","y",.. */) {
                var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
                return args.length ? new Ring([IntegerMod, N], args) : new Ring([IntegerMod, N]);
            };
        }
        ,Q: function(/* "x","y",.. */) {
            if (null == Ring.QQ) Ring.QQ = new Ring(Rational);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? new Ring(Rational, args) : Ring.QQ;
        }
        ,C: function(/* "x","y",.. */) {
            if (null == Ring.CC) Ring.CC = new Ring(Complex);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? new Ring(Complex, args) : Ring.CC;
        }
        ,K: function(/* R, "x","y",.. */) {
            // generic Ring/Field
            var args = slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments),
                R = null, N = null, forceMultivariate = false;
            if (args.length && (true === args[args.length-1] || false === args[args.length-1]))
            {
                forceMultivariate = args.pop();
            }
            if (args.length)
            {
                // K(C("x","y"), "z","w") ring C("z","w") with coefficients from C("x","y")
                if (is_instance(args[0], Ring)) {R = args[0]; args = args.slice(1);}
                else if (is_class(args[0], Numeric)) {N = args[0]; args = args.slice(1);}
                args = Ring.getSymbols(args);
                return args.length ? (R || N ? new Ring(R || N, args, false, forceMultivariate) : Ring.Q(args)) : (R ? R : (N ? Ring(N) : Ring.Q()));
            }
            return Ring.Q();
        }
    }

    ,NumberClass: null
    ,Modulo: null
    ,PolynomialClass: null
    ,CoefficientRing: null
    ,PolynomialSymbol: null
    ,ModuloP: null
    ,_isfield: null
    ,_field: null
    ,_str: null
    ,_tex: null

    ,dispose: function() {
        var self = this;
        self.NumberClass = null;
        self.Modulo = null;
        self.PolynomialClass = null;
        self.CoefficientRing = null;
        self.PolynomialSymbol = null;
        self.ModuloP = null;
        self._field = null;
        self._str = null;
        self._tex = null;
        return self;
    }

    ,clone: function() {
        var self = this, copy = new Ring();
        copy.NumberClass = self.NumberClass;
        copy.Modulo = self.Modulo;
        copy.PolynomialClass = self.PolynomialClass;
        copy.CoefficientRing = self.CoefficientRing;
        copy.PolynomialSymbol = self.PolynomialSymbol;
        copy.ModuloP = self.ModuloP;
        return copy;
    }

    ,equ: function(other) {
        var self = this;
        if (
            (self === other)
            || (
            is_instance(other, Ring)
            && (self.NumberClass === other.NumberClass)
            && (self.Modulo === other.Modulo)
            && (self.PolynomialClass === other.PolynomialClass)
            && ((!self.PolynomialSymbol && !other.PolynomialSymbol) || symbols_match(self.PolynomialSymbol, other.PolynomialSymbol))
            && ((!self.ModuloP && !other.ModuloP) || modulo_match(self.ModuloP, other.ModuloP))
            && ((!self.CoefficientRing && !other.CoefficientRing) || self.CoefficientRing.equ(other.CoefficientRing))
        )) return true;
        return false;
    }
    ,contains: function(object) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(object, RationalFunc))
        {
            return !!self.PolynomialClass && ((is_class(self.PolynomialClass, RationalFunc) && symbols_match(object.symbol, self.PolynomialSymbol) && ((!self.ModuloP && !object.num.m) || modulo_match(self.ModuloP, object.num.m)) && self.CoefficientRing.equ(object.ring)) || self.CoefficientRing.contains(object));
        }
        if (is_instance(object, [MultiPolynomial, MultiPolynomialMod]))
        {
            return !!self.PolynomialClass && ((is_class(self.PolynomialClass, [RationalFunc, MultiPolynomial, MultiPolynomialMod]) && symbols_match(object.symbol, self.PolynomialSymbol) && ((!self.ModuloP && !object.m) || modulo_match(self.ModuloP, object.m)) && self.CoefficientRing.equ(object.ring)) || (is_class(self.PolynomialClass, Polynomial) && symbols_match(object.symbol, [self.PolynomialSymbol]) && self.CoefficientRing.equ(object.ring)) || self.CoefficientRing.contains(object));
        }
        if (is_instance(object, Polynomial))
        {
            return !!self.PolynomialClass && ((is_class(self.PolynomialClass, [RationalFunc, Poly]) && ((object.symbol === self.PolynomialSymbol) || (-1 < self.PolynomialSymbol.indexOf(object.symbol))) && self.CoefficientRing.equ(object.ring)) || self.CoefficientRing.contains(object));
        }
        if (is_class(self.NumberClass, Complex))
        {
            return is_instance(object, Numeric) || Arithmetic.isNumber(object);
        }
        if (is_class(self.NumberClass, Rational))
        {
            return is_instance(object, [Integer, IntegerMod, Rational]) || Arithmetic.isNumber(object);
        }
        if (is_class(self.NumberClass, [Integer, IntegerMod]))
        {
            return is_instance(object, [Integer, IntegerMod]) || Arithmetic.isNumber(object);
        }
        return false;
    }
    ,characteristic: function(k) {
        // the characteristic of the ring/field
        var self = this, p = null != self.Modulo ? self.Modulo.valueOf() : 0;
        return arguments.length ? (k === p) : p;
    }

    ,Zero: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.Zero(self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : self.NumberClass.Zero(self.Modulo);
    }
    ,One: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.One(self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : self.NumberClass.One(self.Modulo);
    }
    ,MinusOne: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.MinusOne(self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : self.NumberClass.MinusOne(self.Modulo);
    }
    ,Const: function(c) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.Const(c, self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : (self.Modulo ? self.NumberClass.cast(c, self.Modulo) : self.NumberClass.cast(c));
    }

    ,isSymbolic: function() {
        var self = this;
        return (null != self.PolynomialClass) && is_class(self.PolynomialClass, [Polynomial, MultiPolynomial, MultiPolynomialMod, RationalFunc]);
    }
    ,isReal: function() {
        var self = this;
        return !is_class(self.NumberClass, Complex);
    }
    ,isField: function() {
        var self = this;
        if (null == self._isfield)
        {
            if (self.PolynomialClass && is_class(self.PolynomialClass, RationalFunc))
            {
                self._isfield = true;
            }
            else if (self.ModuloP)
            {
                self._isfield = self.ModuloP.reduce(function(isfield, q) {
                    if (isfield)
                    {
                        isfield = self.ModuloP.reduce(function(isfield, p) {
                            if (isfield && (p !== q))
                            {
                                isfield = MultiPolynomial.gcd(p, q).isConst();
                            }
                            return isfield;
                        }, q.factors()[0][0][0].primitive().equ(q.primitive()));
                    }
                    return isfield;
                }, (0 < self.ModuloP.length) && self.PolynomialClass.hasInverse());
            }
            else
            {
                self._isfield = self.PolynomialClass ? self.PolynomialClass.hasInverse() : (self.NumberClass.hasInverse() && (self.Modulo ? self.Modulo.isPrime() : true));
            }
        }
        return self._isfield;
    }
    ,associatedField: function() {
        var self = this;
        if (null == self._field)
        {
            if (self.isField())
            {
                self._field = self;
            }
            else if (self.PolynomialClass)
            {
                if (is_class(self.PolynomialClass, RationalFunc))
                {
                    self._field = self;
                }
                else if (is_class(self.PolynomialClass, MultiPolynomialMod))
                {
                    self._field = new Ring(self.CoefficientRing, [[].concat(self.PolynomialSymbol), self.ModuloP], true);
                }
                else if (self.CoefficientRing.PolynomialClass)
                {
                    self._field = new Ring(self.CoefficientRing, [].concat(self.PolynomialSymbol), true, is_array(self.PolynomialSymbol));
                }
                else
                {
                    self._field = new Ring(self.Modulo ? [self.NumberClass, self.Modulo] : self.NumberClass, [].concat(self.PolynomialSymbol), true, is_array(self.PolynomialSymbol));
                }
            }
            else
            {
                self._field = is_class(self.NumberClass, Integer) ? Ring.Q() : (self.isField() ? self : false);
            }
        }
        if (self._field) return self._field;
        throw new Error('Abacus.Ring instance does not have Associated Field!');
    }
    ,quotientRing: function(/*args*/) {
        var self = this,
            modulo = slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments);
        if (!modulo.length)
        {
            return self; // trivial
        }
        else if (self.PolynomialSymbol)
        {
            return new Ring(self.CoefficientRing, [self.PolynomialSymbol, (self.ModuloP ? self.ModuloP : []).concat(modulo.map(function(q) {
                q = is_string(q) ? self.fromString(q) : q;
                return is_instance(q, [MultiPolynomial, MultiPolynomialMod]) ? (q.p || q) : (new MultiPolynomial(q, is_array(self.PolynomialSymbol) ? self.PolynomialSymbol : [self.PolynomialSymbol], self.CoefficientRing));
            }))]);
        }
        else if (is_class(self.NumberClass, Integer) && !self.Modulo && (1 === modulo.length) && (is_instance(modulo[0], [Integer, IntegerMod, Rational]) || Abacus.Arithmetic.isNumber(modulo[0])))
        {
            return Ring.Zn(modulo[0])();
        }
        throw new Error('Abacus.Ring instance does not support Quotient Ring!');
    }

    ,hasGCD: function() {
        var self = this;
        return self.PolynomialClass ? (is_callable(self.PolynomialClass.gcd) && is_callable(self.PolynomialClass.xgcd)) : (is_callable(self.NumberClass.gcd) && is_callable(self.NumberClass.xgcd) && (!self.Modulo || self.Modulo.isPrime()));
    }
    ,gcd: function(/*args*/) {
        var self = this, args;
        if (!self.hasGCD()) throw new Error('Abacus.Ring instance does not support GCD!');
        return self.PolynomialClass ? self.PolynomialClass.gcd.apply(null, arguments) : self.NumberClass.gcd.apply(null, arguments);
    }
    ,xgcd: function(/*args*/) {
        var self = this;
        if (!self.hasGCD()) throw new Error('Abacus.Ring instance does not support xGCD!');
        return self.PolynomialClass ? self.PolynomialClass.xgcd.apply(null, arguments) : self.NumberClass.xgcd.apply(null, arguments);
    }
    ,lcm: function(/*args*/) {
        var self = this;
        if (!self.hasGCD()) throw new Error('Abacus.Ring instance does not support LCM!');
        return self.PolynomialClass ? self.PolynomialClass.lcm.apply(null, arguments) : self.NumberClass.lcm.apply(null, arguments);
    }

    ,create: function(/*args*/) {
        var self = this, args = arguments;
        if (!args.length) return self.Zero();
        if (is_class(self.PolynomialClass, RationalFunc))
        {
            args = slice.call(args, 0, 2);
            if (2 > args.length) args.push(null);
            return self.PolynomialClass.apply(null, args.concat([self.PolynomialSymbol, self.CoefficientRing]));
        }
        else if (is_class(self.PolynomialClass, MultiPolynomialMod))
        {
            return self.PolynomialClass.apply(null, [new MultiPolynomial(args[0], self.PolynomialSymbol, self.CoefficientRing), self.ModuloP]);
        }
        else if (self.PolynomialClass)
        {
            return self.PolynomialClass.apply(null, [args[0], self.PolynomialSymbol, self.CoefficientRing]);
        }
        return self.NumberClass.apply(null, self.Modulo ? [args[0], self.Modulo] : args);
    }
    ,cast: function(a) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.cast(a, self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : (self.Modulo ? self.NumberClass.cast(a, self.Modulo) : self.NumberClass.cast(a));
    }
    ,fromString: function(s) {
        var self = this;
        s = trim(String(s));
        if (s.length)
        {
            return self.PolynomialClass ? self.PolynomialClass.fromString(s, self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : self.NumberClass.fromString(s, self.Modulo);
        }
        return self.Zero();
    }
    ,fromExpr: function(e) {
        var self = this;
        if (!is_instance(e, Expr)) return null;
        return self.PolynomialClass ? self.PolynomialClass.fromExpr(e, self.PolynomialSymbol, self.CoefficientRing, self.ModuloP) : self.cast(e.c());
    }
    ,toString: function() {
        var self = this, subring, R, bracket;
        if (null == self._str)
        {
            subring = '';
            R = self.CoefficientRing;
            while (R && R.PolynomialClass)
            {
                bracket = /*R.isField() ?*/ {l:'(',r:')'} /*: {l:'[',r:']'}*/;
                subring = (bracket.l + '"' + [].concat(R.PolynomialSymbol).join('","') + '"' + bracket.r) + subring;
                if (R.ModuloP)
                {
                    subring += '/<' + R.ModuloP.map(function(q) {return q.toString();}).join(',') + '>';
                    //subring = '(' + subring + ')';
                }
                R = R.CoefficientRing;
            }
            bracket = /*self.isField() ?*/ {l:'(',r:')'} /*: {l:'[',r:']'}*/;
            self._str = (is_class(self.NumberClass, IntegerMod) ? ('Zn(' + self.Modulo.toString() + ')' + subring + bracket.l) : ((is_class(self.NumberClass, Integer) ? ('Z' + subring + bracket.l) : (is_class(self.NumberClass, Rational) ? ('Q' + subring + bracket.l) : ('C' + subring + bracket.l))))) + (self.PolynomialSymbol ? ('"' + [].concat(self.PolynomialSymbol).join('","') + '"') : '') + bracket.r;
            //if (is_class(self.PolynomialClass, RationalFunc)) self._str = 'FractionField(' + self._str + ')';
            if (bracket.l+bracket.r === self._str.slice(-2)) self._str = self._str.slice(0, -2);
            if (self.ModuloP)
            {
                self._str += '/<' + self.ModuloP.map(function(q) {return q.toString()}).join(',') + '>';
            }
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, subring, R, bracket;
        if (null == self._tex)
        {
            subring = '';
            R = self.CoefficientRing;
            while (R && R.PolynomialClass)
            {
                bracket = R.isField() ? {l:'(',r:')'} : {l:'[',r:']'};
                subring = (bracket.l + [].concat(R.PolynomialSymbol).join(',') + bracket.r) + subring;
                if (R.ModuloP)
                {
                    subring += '/\\left<' + R.ModuloP.map(function(q) {return q.toTex();}).join(',') + '\\right>';
                    //subring = '\\left(' + subring + '\\right)';
                }
                R = R.CoefficientRing;
            }
            bracket = self.isField() ? {l:'(',r:')'} : {l:'[',r:']'};
            self._tex = '\\mathbb' + (is_class(self.NumberClass, IntegerMod) ? (self.PolynomialClass ? ('{Z}_{' + self.Modulo.toTex() + '}') : ('{Z}/' + self.Modulo.toTex() + '\\mathbb{Z}')) : (is_class(self.NumberClass, Integer) ? '{Z}' : (is_class(self.NumberClass, Rational) ? '{Q}' : '{C}'))) + subring + (self.PolynomialSymbol ? (bracket.l + [].concat(self.PolynomialSymbol).map(to_tex).join(',') + bracket.r) : '');
            if (bracket.l+bracket.r === self._tex.slice(-2)) self._tex = self._tex.slice(0, -2);
            if (self.ModuloP)
            {
                self._tex += '/\\left<' + self.ModuloP.map(function(q) {return q.toTex();}).join(',') + '\\right>';
            }
            //if (is_class(self.PolynomialClass, RationalFunc)) self._tex = '\\mathbf{Fr}[' + self._tex + ']';
        }
        return self._tex;
    }
});

function symbols_match(symbol1, symbol2)
{
    if (symbol1 === symbol2) return true;
    if (is_array(symbol1) && is_array(symbol2))
    {
        if (symbol1.length !== symbol2.length) return false;
        symbol1 = symbol1.slice().sort();
        symbol2 = symbol2.slice().sort();
        for (var i=0,l=symbol1.length; i<l; ++i)
        {
            if (symbol1[i] !== symbol2[i]) return false;
        }
    }
    else
    {
        return false;
    }
    return true;
}
function modulo_match(mod1, mod2)
{
    if (mod1 === mod2) return true;
    if (is_array(mod1) && is_array(mod2))
    {
        if (mod1.length !== mod2.length) return false;
        for (var k=0,i=0,l=mod1.length; i<l; ++i)
        {
            for (var j=0; j<l; ++j)
            {
                if (mod1[i].equ(mod2[j]))
                {
                    ++k;
                    break;
                }
            }
        }
        return k === n;
    }
    else
    {
        return false;
    }
    return true;
}