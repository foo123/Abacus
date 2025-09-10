// Abacus.Integer, represents an integer
Integer = Abacus.Integer = Class(Numeric, {

    constructor: function Integer(num) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (!is_instance(self, Integer)) return new Integer(num);
        if (is_instance(num, Symbolic)) num = num.c();
        if (is_instance(num, Complex)) num = num.real();
        if (is_instance(num, Rational)) num = num.integer(true);
        if (is_instance(num, Integer)) self._isp = num._isp;
        if (is_instance(num, [Integer, IntegerMod])) num = num.num;
        self.num = Arithmetic.num(num || 0);
    }

    ,__static__: {
         hasInverse: function() {
            return false;
        }

        ,Zero: function() {
            return new Integer(Abacus.Arithmetic.O);
        }
        ,One: function() {
            return new Integer(Abacus.Arithmetic.I);
        }
        ,MinusOne: function() {
            return new Integer(Abacus.Arithmetic.J);
        }

        ,cast: null // added below

        ,gcd: function igcd(/* args */) {
            // gcd of Integer numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
            return Integer(gcd(array(args.length, function(i) {return args[i].num;})));
        }
        ,xgcd: function ixgcd(/* args */) {
            // xgcd of Integer numbers
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
            if (!args.length) return;
            return xgcd(array(args.length, function(i) {return args[i].num;})).map(function(g) {return Integer(g);});
        }
        ,lcm: function ilcm(/* args */)  {
            // lcm of Integer numbers
            // https://math.stackexchange.com/questions/44836/rational-numbers-lcm-and-hcf
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
            return Integer(lcm(array(args.length, function(i) {return args[i].num;})));
        }
        ,max: nmax
        ,min: nmin
        ,rnd: function(m, M) {
            var Arithmetic = Abacus.Arithmetic, t;
            m = Integer.cast(m); M = Integer.cast(M);
            if (M.lt(m)) {t = m; m = M; M = t;}
            return m.equ(M) ? m : Integer(Arithmetic.rnd(m.num, M.num));
        }

        ,fromString: function(s) {
            s = trim(String(s));
            if (!s.length) return Integer.Zero();
            if ('+' === s.charAt(0)) s = trim(s.slice(1));
            if ((-1 !== s.indexOf('e')) || (-1 !== s.indexOf('.'))) return Integer(Rational.fromString(s));
            return s.length ? Integer(Abacus.Arithmetic.num(s)) : Integer.Zero();
        }
    }

    ,num: null
    ,_n: null
    ,_isp: null
    ,_str: null

    ,dispose: function() {
        var self = this;
        if (self._n && (self === self._n._n))
        {
            self._n._n = null;
        }
        self.num = null;
        self._n = null;
        self._str = null;
        return self;
    }

    ,isInt: function() {
        return true;
    }
    ,isPrime: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (null == self._isp)
            self._isp = is_probable_prime(Arithmetic.abs(self.num)) && is_prime(Arithmetic.abs(self.num));
        return self._isp;
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Arithmetic.equ(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.equ(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.equ(self.num, other);
        else if (is_string(other))
            return other === self.toString();

        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Arithmetic.gt(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.lt(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.gt(self.num, other);

        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Arithmetic.gte(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.lte(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.gte(self.num, other);

        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Arithmetic.lt(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.gt(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.lt(self.num, other);

        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Arithmetic.lte(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.gte(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.lte(self.num, other);

        return false;
    }

    ,abs: function() {
        return Integer(Abacus.Arithmetic.abs(this.num));
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = Integer(Abacus.Arithmetic.neg(self.num));
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: NotImplemented

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Integer(Arithmetic.add(self.num, other.num));
        else if (is_instance(other, INumber))
            return other.add(self);
        else if (Arithmetic.isNumber(other))
            return Integer(Arithmetic.add(self.num, other));

        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Integer(Arithmetic.sub(self.num, other.num));
        else if (is_instance(other, INumber))
            return other.neg().add(self);
        else if (Arithmetic.isNumber(other))
            return Integer(Arithmetic.sub(self.num, other));

        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Integer(Arithmetic.mul(self.num, other.num));
        else if (is_instance(other, INumber))
            return other.mul(self);
        else if (Arithmetic.isNumber(other))
            return Integer(Arithmetic.mul(self.num, other));

        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Integer(Arithmetic.div(self.num, other.num));
        else if (is_instance(other, Complex))
            return Complex(self).div(other);
        else if (is_instance(other, Rational))
            return Rational(self).div(other);
        else if (Arithmetic.isNumber(other))
            return Integer(Arithmetic.div(self.num, other));

        return self;
    }
    ,mod: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [Integer, IntegerMod]))
            return Integer(Arithmetic.mod(self.num, other.num));
        else if (is_instance(other, Complex))
            return Complex(self).mod(other);
        else if (is_instance(other, Rational))
            return Rational(self).mod(other);
        else if (Arithmetic.isNumber(other))
            return Integer(Arithmetic.mod(self.num, other));

        return self;
    }
    ,divmod: function(other) {
        var self = this;
        return [self.div(other), self.mod(other)];
    }
    ,divides: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (Arithmetic.equ(O, self.num)) return false;
        if (Arithmetic.isNumber(other))
            return Arithmetic.equ(O, Arithmetic.mod(Arithmetic.num(other), self.num));
        else if (is_instance(other, Integer))
            return Arithmetic.equ(O, Arithmetic.mod(other.num, self.num));
        else if (is_instance(other, INumber))
            return true;

        return false;
    }
    ,integer: function(raw) {
        var self = this;
        return true === raw ? self.num : self;
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.O)) return null; // not supported
        else if (n.equ(Arithmetic.I)) return self;
        return Integer(Arithmetic.pow(self.num, n.num));
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.I)) return null; // not supported
        else if (n.equ(Arithmetic.I)) return self;
        return Integer(ikthroot(self.num, n.num));
    }
    ,valueOf: function() {
        return Abacus.Arithmetic.val(this.num);
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
            self._str = String(self.num);
        return self._str;
    }
    ,toDec: function(precision) {
        var dec = this.toString();
        if (is_number(precision) && 0 < precision) dec += '.' + (new Array(precision+1).join('0'));
        return dec;
    }
});
Integer.cast = typecast([Integer], function(a) {
    return is_string(a) ? Integer.fromString(a) : new Integer(a);
});


// Abacus.IntegerMod, represents an Integer modulo M, for prime M IntegerMod numbers constitute a field
IntegerMod = Abacus.IntegerMod = Class(Numeric, {

    constructor: function IntegerMod(num, m, simplified) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (!is_instance(self, IntegerMod)) return new IntegerMod(num, m, simplified);
        if (is_instance(num, Symbolic)) num = num.c();
        if (is_instance(num, Complex)) num = num.real();
        if (is_instance(num, Rational)) num = num.integer(true);
        if (is_instance(num, Integer)) num = num.num;
        if (is_instance(num, IntegerMod))
        {
            simplified = null == m ? num._simpl : simplified;
            m = m || num.m;
            num = num.num;
        }
        m = Integer.cast(m); num = Arithmetic.num(num||0);
        if (m.equ(Arithmetic.O)) throw new Error('Zero modulus in Abacus.IntegerMod!');
        self.num = num; self.m = m;
        if (simplified) self._simpl = true;
        else self.simpl();
    }

    ,__static__: {
         hasInverse: function() {
            return true;
        }

        ,Zero: function(m) {
            return new IntegerMod(Abacus.Arithmetic.O, m, true);
        }
        ,One: function(m) {
            return new IntegerMod(Abacus.Arithmetic.I, m);
        }
        ,MinusOne: function(m) {
            return new IntegerMod(Abacus.Arithmetic.J, m);
        }

        ,cast: null // added below

        ,gcd: function ngcd(/* args */) {
            // gcd of Integer modulo numbers = min(n1,n2,..nk)
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, gcd = null, i, l = args.length;
            for (i=0; i<l; ++i)
            {
                if (!args[i].equ(O) && (null == gcd || args[i].lt(gcd)))
                    gcd = args[i];
            }
            return null == gcd ? args[0] : gcd;
        }
        ,xgcd: function nxgcd(/* args */) {
            // xgcd of Integer modulo numbers = min(n1,n2,..nk)
            var args = slice.call(arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments),
                Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, index = -1, gcd = null, i, l = args.length;
            if (!args.length) return;
            for (i=0; i<l; ++i)
            {
                if (!args[i].equ(O) && (null == gcd || args[i].lt(gcd)))
                {
                    gcd = args[i];
                    index = i;
                }
            }
            return null == gcd ? array(args.length+1, function(i) {
                return 0 === i ? args[0] : (1 === i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
            }) : array(args.length+1, function(i) {
                return 0 === i ? gcd : (index+1 === i ? IntegerMod.One(args[0].m) : IntegerMod.Zero(args[0].m));
            });
        }
        ,lcm: function nlcm(/* args */) {
            // least common multiple of Integers modulo = max(n1,n2,..nk)
            // https://en.wikipedia.org/wiki/Least_common_multiple
            var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments,
                i, l = args.length, LCM, O = Abacus.Arithmetic.O;
            if (1 >= l) return 1 === l ? args[0] : IntegerMod.Zero(2);
            if (args[0].equ(O) || args[1].equ(O)) return IntegerMod.Zero(args[0].m);
            LCM = nmax(args[0], args[1]);
            for (i=2; i<l; ++i)
            {
                if (args[i].equ(O)) return IntegerMod.Zero(args[0].m);
                LCM = nmax(LCM, args[i]);
            }
            return LCM;
        }
        ,max: nmax
        ,min: nmin
        ,rnd: function(m, M, mod) {
            var Arithmetic = Abacus.Arithmetic, t;
            mod = Integer.cast(mod);
            m = Integer.cast(m); M = Integer.cast(M);
            if (m.lt(0)) m = Integer.Zero();
            if (m.gte(mod)) m = mod.sub(1);
            if (M.lt(0)) M = Integer.Zero();
            if (M.gte(mod)) M = mod.sub(1);
            if (M.lt(m)) { t=m; m=M; M=t; }
            return m.equ(M) ? IntegerMod(m.num, mod, true) : IntegerMod(Arithmetic.rnd(m.num, M.num), mod, true);
        }

        ,fromString: function(s, m) {
            s = trim(String(s));
            if (!s.length) return IntegerMod.Zero(m);
            if ('+' === s.charAt(0)) s = trim(s.slice(1));
            if ((-1 !== s.indexOf('e')) || (-1 !== s.indexOf('.'))) return IntegerMod(Rational.fromString(s), m);
            return s.length ? IntegerMod(Abacus.Arithmetic.num(s), m) : IntegerMod.Zero(m);
        }
    }

    ,num: null
    ,m: null
    ,_n: null
    ,_i: null
    ,_str: null
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
        self.num = null;
        self.m = null;
        self._n = null;
        self._i = null;
        self._str = null;
        return self;
    }

    ,isInt: function() {
        return true;
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return Arithmetic.equ(self.num, self.wrap(other.num));
        else if (is_instance(other, INumber))
            return other.equ(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.equ(self.num, self.wrap(Arithmetic.num(other)));
        else if (is_string(other))
            return other === self.toString();

        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return Arithmetic.gt(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.lt(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.gt(self.num, other);

        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return Arithmetic.gte(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.lte(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.gte(self.num, other);

        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return Arithmetic.lt(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.gt(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.lt(self.num, other);

        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return Arithmetic.lte(self.num, other.num);
        else if (is_instance(other, INumber))
            return other.gte(self);
        else if (Arithmetic.isNumber(other))
            return Arithmetic.lte(self.num, other);

        return false;
    }

    ,abs: function() {
        return this;
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = IntegerMod(negm(self.num, self.m.num), self.m, true);
            self._n._n = self;
        }
        return self._n;
    }
    ,inv: function() {
        var self = this;
        if (null == self._i)
        {
            self._i = IntegerMod(invm(self.num, self.m.num), self.m, true);
            self._i._i = self;
        }
        return self._i;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return IntegerMod(addm(self.num, other.num, self.m.num), self.m, true);
        else if (is_instance(other, INumber))
            return other.add(self);
        else if (Arithmetic.isNumber(other))
            return IntegerMod(addm(self.num, Arithmetic.num(other), self.m.num), self.m, true);

        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]) || Arithmetic.isNumber(other))
            return self.add(IntegerMod(other, self.m).neg());
        else if (is_instance(other, INumber))
            return other.neg().add(self);

        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return IntegerMod(mulm(self.num, other.num, self.m.num), self.m, true);
        else if (is_instance(other, INumber))
            return other.mul(self);
        else if (Arithmetic.isNumber(other))
            return IntegerMod(mulm(self.num, Arithmetic.num(other), self.m.num), self.m, true);

        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]) || Arithmetic.isNumber(other))
            return self.mul(IntegerMod(other, self.m).inv());
        else if (is_instance(other, Complex))
            return Complex(self).div(other);
        else if (is_instance(other, Rational))
            return Rational(self).div(other);

        return self;
    }
    ,mod: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(other, [IntegerMod, Integer]))
            return IntegerMod(Arithmetic.mod(self.num, other.num), self.m);
        else if (is_instance(other, Complex))
            return Complex(self).mod(other);
        else if (is_instance(other, Rational))
            return Rational(self).mod(other);
        else if (Arithmetic.isNumber(other))
            return IntegerMod(Arithmetic.mod(self.num, other), self.m);

        return self;
    }
    ,divmod: function(other) {
        var self = this;
        return [self.div(other), self.mod(other)];
    }
    ,divides: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (Arithmetic.equ(O, self.num)) return false;
        if (is_instance(other, IntegerMod) && self.m.isPrime())
            return true;
        else if (is_instance(other, Integer))
            return Arithmetic.equ(O, Arithmetic.mod(other.num, self.num));
        else if (is_instance(other, INumber))
            return true;
        else if (Arithmetic.isNumber(other))
            return Arithmetic.equ(O, Arithmetic.mod(Arithmetic.num(other), self.num));

        return false;
    }
    ,integer: function(raw) {
        var self = this;
        return true === raw ? self.num : self;
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.O)) return null; // not supported
        else if (n.equ(Arithmetic.I)) return self;
        return IntegerMod(powm(self.num, n.num, self.m.num), self.m, true);
    }
    ,rad: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.I)) return null; // not supported
        else if (n.equ(Arithmetic.I)) return self;
        return IntegerMod(ikthrootp(self.num, n.num, self.m.num), self.m, true);
    }
    ,wrap: function(x) {
        var self = this, modulo = self.m.num, Arithmetic = Abacus.Arithmetic;
        x = Arithmetic.mod(x, modulo);
        if (Arithmetic.lt(x, Arithmetic.O)) x = Arithmetic.add(x, modulo);
        return x;
    }
    ,simpl: function() {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (!self._simpl)
        {
            self.num = self.wrap(self.num);
            self._simpl = true;
        }
        return self;
    }
    ,valueOf: function() {
        return Abacus.Arithmetic.val(this.num);
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
            self._str = String(self.num);
        return self._str;
    }
    ,toDec: function(precision) {
        var dec = this.toString();
        if (is_number(precision) && 0 < precision) dec += '.' + (new Array(precision+1).join('0'));
        return dec;
    }
});
IntegerMod.cast = function(a, m) {
    m = Integer.cast(m);
    var type_cast = typecast(function(a) {
        return is_instance(a, IntegerMod) && (m.equ(a.m));
    }, function(a) {
        return is_string(a) ? IntegerMod.fromString(a, m) : new IntegerMod(a, m);
    });
    return type_cast(a);
};
