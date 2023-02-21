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
        self.num = Arithmetic.num(num||0);
    }

    ,__static__: {
        O: null
        ,I: null
        ,J: null
        ,Zero: function() {
            if (null == Integer.O) Integer.O = Integer(Abacus.Arithmetic.O);
            return Integer.O;
        }
        ,One: function() {
            if (null == Integer.I) Integer.I = Integer(Abacus.Arithmetic.I);
            return Integer.I;
        }
        ,MinusOne: function() {
            if (null == Integer.J) Integer.J = Integer(Abacus.Arithmetic.J);
            return Integer.J;
        }

        ,hasInverse: function() {
            return false;
        }
        ,cast: null // added below

        ,gcd: igcd
        ,xgcd: ixgcd
        ,lcm: ilcm
        ,max: nmax
        ,min: nmin
        ,rnd: function(m, M) {
            var Arithmetic = Abacus.Arithmetic, t;
            m = Integer.cast(m); M = Integer.cast(M);
            if (M.lt(m)) { t=m; m=M; M=t; }
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
        if (self._n && self===self._n._n)
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

    ,equ: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.equ(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.equ(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.equ(self.num, a);
        else if (is_string(a))
            return a === self.toString();

        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.gt(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.lt(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.gt(self.num, a);

        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.gte(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.lte(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.gte(self.num, a);

        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.lt(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.gt(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.lt(self.num, a);

        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Arithmetic.lte(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.gte(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.lte(self.num, a);

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

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Integer(Arithmetic.add(self.num, a.num));
        else if (is_instance(a, INumber))
            return a.add(self.num);
        else if (Arithmetic.isNumber(a))
            return Integer(Arithmetic.add(self.num, a));

        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Integer(Arithmetic.sub(self.num, a.num));
        else if (is_instance(a, INumber))
            return a.neg().add(self.num);
        else if (Arithmetic.isNumber(a))
            return Integer(Arithmetic.sub(self.num, a));

        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Integer(Arithmetic.mul(self.num, a.num));
        else if (is_instance(a, INumber))
            return a.mul(self.num);
        else if (Arithmetic.isNumber(a))
            return Integer(Arithmetic.mul(self.num, a));

        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Integer(Arithmetic.div(self.num, a.num));
        else if (is_instance(a, Complex))
            return Complex(self).div(a);
        else if (is_instance(a, Rational))
            return Rational(self).div(a);
        else if (Arithmetic.isNumber(a))
            return Integer(Arithmetic.div(self.num, a));

        return self;
    }
    ,mod: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [Integer, IntegerMod]))
            return Integer(Arithmetic.mod(self.num, a.num));
        else if (is_instance(a, Complex))
            return Complex(self).mod(a);
        else if (is_instance(a, Rational))
            return Rational(self).mod(a);
        else if (Arithmetic.isNumber(a))
            return Integer(Arithmetic.mod(self.num, a));

        return self;
    }
    ,divmod: function(a) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,divides: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (Arithmetic.equ(O, self.num)) return false;
        if (is_instance(a, Integer))
            return Arithmetic.equ(O, Arithmetic.mod(a.num, self.num));
        else if (is_instance(a, INumber))
            return true;
        else if (Arithmetic.isNumber(a))
            return Arithmetic.equ(O, Arithmetic.mod(Arithmetic.num(a), self.num));

        return false;
    }
    ,integer: function(raw) {
        var self = this;
        return true===raw ? self.num : self;
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
        if (is_number(precision) && 0<precision) dec += '.'+(new Array(precision+1).join('0'));
        return dec;
    }
});
Integer.cast = typecast([Integer], function(a){
    return is_string(a) ? Integer.fromString(a) : new Integer(a);
});
