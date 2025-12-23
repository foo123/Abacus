// Abacus.Ring represents an algebraic Ring or Field (even Polynomial Ring)
Ring = Abacus.Ring = Class({

    constructor: function Ring(NumberClass, PolynomialSymbol, isFraction, ForceMultiVariate) {
        var self = this, ring = null;
        if (!is_instance(self, Ring)) return new Ring(NumberClass, PolynomialSymbol, isFraction, ForceMultiVariate);

        self.Modulo = null;
        self.PolynomialClass = null;
        self.CoefficientRing = null;
        self.PolynomialSymbol = null;

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
                    self.CoefficientRing = Ring(ring.NumberClass, [ring.PolynomialSymbol]);
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
            if (null == Ring.ZZ) Ring.ZZ = Ring(Integer);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? Ring(Integer, args) : Ring.ZZ;
        }
        ,Zn: function(N) {
            N = Integer.cast(N);
            return function(/* "x","y",.. */) {
                var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
                return args.length ? Ring([IntegerMod, N], args) : Ring([IntegerMod, N]);
            };
        }
        ,Q: function(/* "x","y",.. */) {
            if (null == Ring.QQ) Ring.QQ = Ring(Rational);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? Ring(Rational, args) : Ring.QQ;
        }
        ,C: function(/* "x","y",.. */) {
            if (null == Ring.CC) Ring.CC = Ring(Complex);
            var args = Ring.getSymbols(slice.call(arguments.length ? (is_array(arguments[0]) || is_args(arguments[0]) ? arguments[0] : arguments) : arguments));
            return args.length ? Ring(Complex, args) : Ring.CC;
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
                return args.length ? (R || N ? Ring(R || N, args, false, forceMultivariate) : Ring.Q(args)) : (R ? R : (N ? Ring(N) : Ring.Q()));
            }
            return Ring.Q();
        }
    }

    ,NumberClass: null
    ,Modulo: null
    ,PolynomialClass: null
    ,CoefficientRing: null
    ,PolynomialSymbol: null
    ,_str: null
    ,_tex: null

    ,dispose: function() {
        var self = this;
        self.NumberClass = null;
        self.Modulo = null;
        self.PolynomialClass = null;
        self.CoefficientRing = null;
        self.PolynomialSymbol = null;
        self._str = null;
        self._tex = null;
        return self;
    }

    ,clone: function() {
        var self = this, copy = Ring();
        copy.NumberClass = self.NumberClass;
        copy.Modulo = self.Modulo;
        copy.PolynomialClass = self.PolynomialClass;
        copy.CoefficientRing = self.CoefficientRing;
        copy.PolynomialSymbol = self.PolynomialSymbol;
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
            && ((!self.CoefficientRing && !other.CoefficientRing) || self.CoefficientRing.equ(other.CoefficientRing))
        )) return true;
        return false;
    }
    ,contains: function(object) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(object, RationalFunc))
        {
            return !!self.PolynomialClass && ((is_class(self.PolynomialClass, RationalFunc) && symbols_match(object.symbol, self.PolynomialSymbol) && self.CoefficientRing.equ(object.ring)) || self.CoefficientRing.contains(object));
        }
        if (is_instance(object, MultiPolynomial))
        {
            return !!self.PolynomialClass && ((is_class(self.PolynomialClass, [RationalFunc, MultiPolynomial]) && symbols_match(object.symbol, self.PolynomialSymbol) && self.CoefficientRing.equ(object.ring)) || (is_class(self.PolynomialClass, Polynomial) && symbols_match(object.symbol, [self.PolynomialSymbol]) && self.CoefficientRing.equ(object.ring)) || self.CoefficientRing.contains(object));
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
        return self.PolynomialClass ? self.PolynomialClass.Zero(self.PolynomialSymbol, self.CoefficientRing) : self.NumberClass.Zero(self.Modulo);
    }
    ,One: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.One(self.PolynomialSymbol, self.CoefficientRing) : self.NumberClass.One(self.Modulo);
    }
    ,MinusOne: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.MinusOne(self.PolynomialSymbol, self.CoefficientRing) : self.NumberClass.MinusOne(self.Modulo);
    }
    ,Const: function(c) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.Const(c, self.PolynomialSymbol, self.CoefficientRing) : (self.Modulo ? self.NumberClass.cast(c, self.Modulo) : self.NumberClass.cast(c));
    }

    ,isSymbolic: function() {
        var self = this;
        return (null != self.PolynomialClass) && is_class(self.PolynomialClass, [Polynomial, MultiPolynomial, RationalFunc]);
    }
    ,isReal: function() {
        var self = this;
        return !is_class(self.NumberClass, Complex);
    }
    ,isField: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.hasInverse() : (self.NumberClass.hasInverse() && (self.Modulo ? self.Modulo.isPrime() : true));
    }
    ,associatedField: function() {
        var self = this;
        if (self.PolynomialClass)
        {
            if (is_class(self.PolynomialClass, RationalFunc))
            {
                return self;
            }
            if (self.CoefficientRing.PolynomialClass)
            {
                return Ring(self.CoefficientRing, [].concat(self.PolynomialSymbol), true, is_array(self.PolynomialSymbol));
            }
            else
            {
                return Ring(self.Modulo ? [self.NumberClass, self.Modulo] : self.NumberClass, [].concat(self.PolynomialSymbol), true, is_array(self.PolynomialSymbol));
            }
        }
        return is_class(self.NumberClass, Integer) ? Ring.Q() : (self.isField() ? self : null);
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
        else if (self.PolynomialClass)
        {
            return self.PolynomialClass.apply(null, [args[0], self.PolynomialSymbol, self.CoefficientRing]);
        }
        return self.NumberClass.apply(null, self.Modulo ? [args[0], self.Modulo] : args);
    }
    ,cast: function(a) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.cast(a, self.PolynomialSymbol, self.CoefficientRing) : (self.Modulo ? self.NumberClass.cast(a, self.Modulo) : self.NumberClass.cast(a));
    }
    ,fromString: function(s) {
        var self = this;
        s = trim(String(s));
        if (s.length)
        {
            return self.PolynomialClass ? self.PolynomialClass.fromString(s, self.PolynomialSymbol, self.CoefficientRing) : self.NumberClass.fromString(s, self.Modulo);
        }
        return self.Zero();
    }
    ,fromExpr: function(e) {
        var self = this;
        if (!is_instance(e, Expr)) return null;
        return self.PolynomialClass ? self.PolynomialClass.fromExpr(e, self.PolynomialSymbol, self.CoefficientRing) : self.cast(e.c());
    }
    ,toString: function() {
        var self = this, subring, R;
        if (null == self._str)
        {
            subring = '';
            R = self.CoefficientRing;
            while (R && R.PolynomialClass)
            {
                subring = ('("' + [].concat(R.PolynomialSymbol).join('","') + '")') + subring;
                R = R.CoefficientRing;
            }
            self._str = (is_class(self.NumberClass, IntegerMod) ? ('Zn(' + self.Modulo.toString() + ')' + subring + '(') : ((is_class(self.NumberClass, Integer) ? ('Z' + subring + '(') : (is_class(self.NumberClass, Rational) ? ('Q' + subring + '(') : ('C' + subring + '('))))) + (self.PolynomialSymbol ? ('"' + [].concat(self.PolynomialSymbol).join('","') + '"') : '') + ')';
            if (is_class(self.PolynomialClass, RationalFunc)) self._str = 'FractionField(' + self._str + ')';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, subring, R;
        if (null == self._tex)
        {
            subring = '';
            R = self.CoefficientRing;
            while (R && R.PolynomialClass)
            {
                subring = ('[' + [].concat(R.PolynomialSymbol).join(',') + ']') + subring;
                R = R.CoefficientRing;
            }
            self._tex = '\\mathbb' + (is_class(self.NumberClass, IntegerMod) ? ('{Z}_{' + self.Modulo.toTex() + '}') : (is_class(self.NumberClass, Integer) ? '{Z}' : (is_class(self.NumberClass, Rational) ? '{Q}' : '{C}'))) + subring + (self.PolynomialSymbol ? ('[' + [].concat(self.PolynomialSymbol).map(to_tex).join(',') + ']') : '');
            if (is_class(self.PolynomialClass, RationalFunc)) self._tex = '\\mathbf{Fr}[' + self._tex + ']';
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