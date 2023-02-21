// Abacus.Ring represents an algebraic Ring or Field (even Polynomial Ring)
Ring = Abacus.Ring = Class({
    constructor: function Ring(NumberClass, PolynomialSymbol, isFraction) {
        var self = this;
        if (!is_instance(self, Ring)) return new Ring(NumberClass, PolynomialSymbol, isFraction);

        if (is_array(NumberClass))
        {
            self.Modulo = Integer.cast(NumberClass[1]);
            NumberClass = NumberClass[0];
        }
        else
        {
            self.Modulo = null;
        }
        if (!is_class(NumberClass, [Numeric, Expr, RationalExpr])) NumberClass = Complex;
        self.NumberClass = NumberClass;
        if (is_class(self.NumberClass, [Expr, RationalExpr])) PolynomialSymbol = null;

        if (is_array(PolynomialSymbol) && PolynomialSymbol.length)
        {
            PolynomialSymbol = remove_duplicates(PolynomialSymbol.map(String));
            self.CoefficientRing = is_class(self.NumberClass, IntegerMod) && self.Modulo ? (IntegerMod===self.NumberClass ? Ring.Zp(self.Modulo)() : Ring([self.NumberClass, self.Modulo])) : (is_class(self.NumberClass, Integer) ? (Integer===self.NumberClass ? Ring.Z() : Ring(self.NumberClass)) : (is_class(self.NumberClass, Rational) ? (Rational===self.NumberClass ? Ring.Q() : Ring(self.NumberClass)) : (Complex===self.NumberClass ? Ring.C() : Ring(self.NumberClass))));
            if (true===isFraction)
            {
                self.PolynomialClass = RationalFunc;
                self.PolynomialSymbol = PolynomialSymbol;
            }
            else
            {
                if (1===PolynomialSymbol.length)
                {
                    self.PolynomialClass = Polynomial;
                    self.PolynomialSymbol = PolynomialSymbol[0];
                }
                else
                {
                    self.PolynomialClass = MultiPolynomial;
                    self.PolynomialSymbol = PolynomialSymbol;
                }
            }
        }
        else
        {
            if (true===isFraction)
            {
                if (is_class(self.NumberClass, Integer)) self.NumberClass = Rational;
                else if (is_class(self.NumberClass, Expr)) self.NumberClass = RationalExpr;
            }
            self.PolynomialClass = null;
            self.CoefficientRing = null;
            self.PolynomialSymbol = null;
        }
    }

    ,__static__: {
        ZZ: null
        ,QQ: null
        ,CC: null
        ,EE: null
        ,RR: null
        ,Z: function(/* "x","y",.. */) {
            if (null == Ring.ZZ) Ring.ZZ = Ring(Integer);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Integer, args) : Ring.ZZ;
        }
        ,Zn: function(N) {
            N = Integer.cast(N);
            return function(/* "x","y",.. */) {
                var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
                return args.length ? Ring([IntegerMod, N], args) : Ring([IntegerMod, N]);
            };
        }
        ,Q: function(/* "x","y",.. */) {
            if (null == Ring.QQ) Ring.QQ = Ring(Rational);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Rational, args) : Ring.QQ;
        }
        ,C: function(/* "x","y",.. */) {
            if (null == Ring.CC) Ring.CC = Ring(Complex);
            var args = slice.call(arguments.length ? (is_array(arguments[0])||is_args(arguments[0]) ? arguments[0] : arguments) : arguments).map(String).filter(function(x){return 0<x.length;});
            return args.length ? Ring(Complex, args) : Ring.CC;
        }
        ,E: function(/* "x","y",.. */) {
            if (null == Ring.EE) Ring.EE = Ring(Expr);
            return Ring.EE;
        }
        ,R: function(/* "x","y",.. */) {
            if (null == Ring.RR) Ring.RR = Ring(RationalExpr);
            return Ring.RR;
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

    ,Zero: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.Zero(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass() : self.NumberClass.Zero(self.Modulo));
    }
    ,One: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.One(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass(1) : self.NumberClass.One(self.Modulo));
    }
    ,MinusOne: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.MinusOne(self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? new self.NumberClass(-1) : self.NumberClass.MinusOne(self.Modulo));
    }

    ,isSymbolic: function() {
        var self = this;
        return is_class(self.NumberClass, [Expr, RationalExpr]) || ((null!=self.PolynomialClass) && is_class(self.PolynomialClass, [Polynomial, MultiPolynomial, RationalFunc]));
    }
    ,isReal: function() {
        var self = this;
        return !is_class(self.NumberClass, Complex);
    }
    ,isField: function() {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.hasInverse() : (is_class(self.NumberClass, RationalExpr) ? true : (is_class(self.NumberClass, Expr) ? false : (self.NumberClass.hasInverse() && (self.Modulo ? self.Modulo.isPrime() : true))));
    }
    ,associatedField: function() {
        var self = this;
        if (self.PolynomialClass) return is_class(self.PolynomialClass, RationalFunc) ? self : Ring(self.Modulo ? [self.NumberClass, self.Modulo] : self.NumberClass, [].concat(self.PolynomialSymbol), true);
        return is_class(self.NumberClass, Expr) ? Ring.R() : (is_class(self.NumberClass, Integer) ? Ring.Q() : (self.isField() ? self : null));
    }

    ,hasGCD: function() {
        var self = this;
        return self.PolynomialClass ? ((is_class(self.PolynomialClass, Polynomial) || 1===self.PolynomialSymbol.length) && is_callable(self.PolynomialClass.gcd) && is_callable(self.PolynomialClass.xgcd)) : (is_callable(self.NumberClass.gcd) && is_callable(self.NumberClass.xgcd) && (!self.Modulo || self.Modulo.isPrime()));
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

    ,cast: function(a) {
        var self = this;
        return self.PolynomialClass ? self.PolynomialClass.cast(a, self.PolynomialSymbol, self.CoefficientRing) : (self.Modulo ? self.NumberClass.cast(a, self.Modulo) : self.NumberClass.cast(a));
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
    ,fromString: function(s) {
        var self = this;
        s = trim(String(s));
        return s.length ? (self.PolynomialClass ? self.PolynomialClass.fromString(s, self.PolynomialSymbol, self.CoefficientRing) : (is_class(self.NumberClass, [Expr, RationalExpr]) ? self.NumberClass.fromString(s) : self.NumberClass.fromString(s, self.Modulo))) : self.Zero();
    }
    ,fromExpr: function(e) {
        var self = this;
        if (!is_instance(e, Expr)) return null;
        return self.PolynomialClass ? self.PolynomialClass.fromExpr(e, self.PolynomialSymbol, self.CoefficientRing) : self.cast(e.c());
    }
    ,fromValues: function(v) {
        var self = this;
        return is_class(self.PolynomialClass, Polynomial) ? self.PolynomialClass.fromValues(v, self.PolynomialSymbol, self.CoefficientRing) : null;
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
        {
            self._str = (is_class(self.NumberClass, IntegerMod) ? 'Zn('+self.Modulo.toString()+')(' : (is_class(self.NumberClass, Integer) ? 'Z(' : (is_class(self.NumberClass, Rational) ? 'Q(' : 'C('))) + (self.PolynomialSymbol ? ('"'+[].concat(self.PolynomialSymbol).join('","')+'"') : '') + ')';
            if (is_class(self.PolynomialClass, RationalFunc)) self._str += '.associatedField()';
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this;
        if (null == self._tex)
        {
            self._tex = '\\mathbb' + (is_class(self.NumberClass, IntegerMod) ? ('{Z}_{'+self.Modulo.toTex()+'}') : (is_class(self.NumberClass, Integer) ? '{Z}' : (is_class(self.NumberClass, Rational) ? '{Q}' : '{C}'))) + (self.PolynomialSymbol ? ('['+[].concat(self.PolynomialSymbol).map(to_tex).join(',')+']') : '');
            if (is_class(self.PolynomialClass, RationalFunc)) self._tex = '\\mathbf{Fr}['+self._tex+']';
        }
        return self._tex;
    }
});
