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
        Zero: function(m) {
            return IntegerMod(Abacus.Arithmetic.O, m, true);
        }
        ,One: function(m) {
            return IntegerMod(Abacus.Arithmetic.I, m);
        }
        ,MinusOne: function(m) {
            return IntegerMod(Abacus.Arithmetic.J, m);
        }

        ,hasInverse: function() {
            return true;
        }
        ,cast: null // added below

        ,gcd: ngcd
        ,xgcd: nxgcd
        ,lcm: nlcm
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
        if (self._n && self===self._n._n)
        {
            self._n._n = null;
        }
        if (self._i && self===self._i._i)
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

    ,equ: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return Arithmetic.equ(self.num, self.wrap(a.num));
        else if (is_instance(a, INumber))
            return a.equ(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.equ(self.num, self.wrap(Arithmetic.num(a)));
        else if (is_string(a))
            return a === self.toString();

        return false;
    }
    ,gt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return Arithmetic.gt(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.lt(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.gt(self.num, a);

        return false;
    }
    ,gte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return Arithmetic.gte(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.lte(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.gte(self.num, a);

        return false;
    }
    ,lt: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return Arithmetic.lt(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.gt(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.lt(self.num, a);

        return false;
    }
    ,lte: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return Arithmetic.lte(self.num, a.num);
        else if (is_instance(a, INumber))
            return a.gte(self.num);
        else if (Arithmetic.isNumber(a))
            return Arithmetic.lte(self.num, a);

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

    ,add: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return IntegerMod(addm(self.num, a.num, self.m.num), self.m, true);
        else if (is_instance(a, INumber))
            return a.add(self.num);
        else if (Arithmetic.isNumber(a))
            return IntegerMod(addm(self.num, Arithmetic.num(a), self.m.num), self.m, true);

        return self;
    }
    ,sub: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]) || Arithmetic.isNumber(a))
            return self.add(IntegerMod(a, self.m).neg());
        else if (is_instance(a, INumber))
            return a.neg().add(self.num);

        return self;
    }
    ,mul: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return IntegerMod(mulm(self.num, a.num, self.m.num), self.m, true);
        else if (is_instance(a, INumber))
            return a.mul(self.num);
        else if (Arithmetic.isNumber(a))
            return IntegerMod(mulm(self.num, Arithmetic.num(a), self.m.num), self.m, true);

        return self;
    }
    ,div: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]) || Arithmetic.isNumber(a))
            return self.mul(IntegerMod(a, self.m).inv());
        else if (is_instance(a, Complex))
            return Complex(self).div(a);
        else if (is_instance(a, Rational))
            return Rational(self).div(a);

        return self;
    }
    ,mod: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (is_instance(a, [IntegerMod, Integer]))
            return IntegerMod(Arithmetic.mod(self.num, a.num), self.m);
        else if (is_instance(a, Complex))
            return Complex(self).mod(a);
        else if (is_instance(a, Rational))
            return Rational(self).mod(a);
        else if (Arithmetic.isNumber(a))
            return IntegerMod(Arithmetic.mod(self.num, a), self.m);

        return self;
    }
    ,divmod: function(a) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,divides: function(a) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (Arithmetic.equ(O, self.num)) return false;
        if (is_instance(a, IntegerMod) && self.m.isPrime())
            return true;
        else if (is_instance(a, Integer))
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
        if (is_number(precision) && 0<precision) dec += '.'+(new Array(precision+1).join('0'));
        return dec;
    }
});
IntegerMod.cast = function(a, m) {
    m = Integer.cast(m);
    var type_cast = typecast(function(a){
        return is_instance(a, IntegerMod) && (m.equ(a.m));
    }, function(a){
        return is_string(a) ? IntegerMod.fromString(a, m) : new IntegerMod(a, m);
    });
    return type_cast(a);
};
