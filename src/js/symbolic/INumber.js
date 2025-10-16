function typecast(ClassTypeCheck, toClassType)
{
    var ClassType = null;
    if (is_array(ClassTypeCheck) && is_callable(ClassTypeCheck[0]))
    {
        ClassType = ClassTypeCheck[0];
        ClassTypeCheck = function(a) {return is_instance(a, ClassType);};
        toClassType = is_callable(toClassType) ? toClassType : function(a) {return new ClassType(a);};
    }
    else if (!is_callable(ClassTypeCheck))
    {
        ClassTypeCheck = function(a) {return true;};
        toClassType = function(a) {return a;};
    }
    return function type_cast(a) {
        if (is_array(a) || is_args(a))
        {
            for (var i=0,l=a.length; i<l; ++i)
                a[i] = type_cast(a[i]);
        }
        else if (!ClassTypeCheck(a))
        {
            a = toClassType(a);
        }
        return a;
    };
}

// Abacus.INumber, represents a generic numeric or symbolic number interface
INUMBER = {
     isReal: function() {
        return true;
    }
    ,isImag: function() {
        return false;
    }
    ,isComplex: function() {
        return false;
    }
    ,equ: function(other) {
        return is_instance(other, INumber) ? other.equ(this) : (is_string(other) ? (String(this) === other) : (this === other));
    }
    ,gt: function(other) {
        if (is_number(other)) return (this > other);
        else if (is_instance(other, INumber)) return other.lt(this);
        return false;
    }
    ,gte: function(other) {
        if (is_number(other)) return (this >= other);
        else if (is_instance(other, INumber)) return other.lte(this);
        return false;
    }
    ,lt: function(other) {
        if (is_number(other)) return (this < other);
        else if (is_instance(other, INumber)) return other.gt(this);
        return false;
    }
    ,lte: function(other) {
        if (is_number(other)) return (this <= other);
        else if (is_instance(other, INumber)) return other.gte(this);
        return false;
    }
    ,real: function() {
        return this;
    }
    ,imag: function() {
        return 0;
    }
    ,conj: function() {
        return this;
    }
    ,abs: function() {
        return this.lt(0) ? this.neg() : this;
    }
    ,neg: function() {
        return -this;
    }
    ,inv: NotImplemented/*function() {
        return 1.0 / this;
    }*/

    ,add: function(other) {
        return is_instance(other, INumber) ? other.add(this) : (this + other);
    }
    ,sub: function(other) {
        return is_instance(other, INumber) ? other.neg().add(this) : (this - other);
    }
    ,mul: function(other) {
        return is_instance(other, INumber) ? other.mul(this) : (this * other);
    }
    ,div: function(other) {
        if (is_instance(other, Expr)) return Expr('', this).div(other);
        else if (is_instance(other, Numeric)) return other[CLASS](this).div(other);
        return is_instance(other, INumber) ? null : stdMath.floor(this / other);
    }
    ,mod: function(other) {
        if (is_instance(other, Expr)) return Expr('', this).mod(other);
        else if (is_instance(other, Numeric)) return other[CLASS](this).mod(other);
        return is_instance(other, INumber) ? null : (this % other);
    }
    ,divmod: function(other) {
        return [this.div(other), this.mod(other)];
    }
    ,divides: function(other) {
        if (0 === this) return false;
        if (is_number(other)) return (0 === (other % this));
        else if (is_instance(other, Integer)) return other.mod(this).equ(0);
        else if (is_instance(other, [Numeric, Expr])) return true;
        return false;
    }
    ,pow: function(n) {
        return stdMath.pow(this, +n);
    }
    ,rad: function(n) {
        return jskthroot(this, n);
    }
};
INumber = Class(Merge({
    constructor: function INumber() {

    }
    ,dispose: function() {
        return this;
    }
    ,clone: function() {
        return 0 + this;
    }
    ,valueOf: function() {
        return 0;
    }
    ,toExpr: function() {
        return is_instance(this, Expr) ? this : Expr('', this);
    }
    ,toString: function() {
        return '';
    }
    ,toTex: function() {
        return this.toString();
    }
}, INUMBER));

// Numeric is INumber that represents strictly constant numbers, eg Integer, Rational, Complex
Numeric = Class(INumber, {
    constructor: function Numeric() {

    }
    ,clone: function() {
        return new this[CLASS](this);
    }
    ,isSimple: function() {
        return true;
    }
    ,isConst: function() {
        return true;
    }
    ,isInt: function() {
        return false;
    }
    ,real: function() {
        return this;
    }
    ,imag: function() {
        return this[CLASS].Zero();
    }
    ,d: function() {
        return this[CLASS].Zero();
    }
});

// Symbolic is INumber that represents generally non-constant symbolic objects, eg Expr, Polynomial, MultiPolynomial, RationalFunc
Symbolic = Class(INumber, {
    constructor: function Symbolic() {

    }
    ,clone: function() {
        return new this[CLASS](this);
    }
    ,isSimple: function() {
        return false;
    }
    ,isConst: function() {
        return false;
    }
    ,isInt: function() {
        return false;
    }
    ,c: function() {
        return 0;
    }
    ,valueOf: function() {
        return this.c().valueOf();
    }

    ,gt: NotImplemented
    ,gte: NotImplemented
    ,lt: NotImplemented
    ,lte: NotImplemented

    ,real: function() {
        return this;
    }
    ,imag: function() {
        return this[CLASS].Zero();
    }

    ,abs: NotImplemented
    ,neg: NotImplemented
    ,conj: NotImplemented
    ,inv: NotImplemented

    ,add: NotImplemented
    ,sub: NotImplemented
    ,mul: NotImplemented
    ,div: NotImplemented
    ,mod: NotImplemented
    ,divmod: NotImplemented
    ,pow: NotImplemented
    ,rad: NotImplemented

    ,d: NotImplemented
    ,evaluate: NotImplemented
});

// Poly is represents a polynomial either univariate or multivariate eg Polynomial, MultiPolynomial
Poly = Class(Symbolic, {
    constructor: function Poly() {

    }
});

function nmax(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(max, a) {
        return a.gt(max) ? a : max;
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nmin(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(min, a) {
        return a.lt(min) ? a : min;
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nadd(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(result, a) {
        return result.add(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nsub(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(result, a) {
        return result.sub(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nmul(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(result, a) {
        return result.mul(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function ndiv(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(result, a) {
        return result.div(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function npow(base, exp)
{
    var pow = base.symbol ? base[CLASS].One(base.symbol, base.ring) : base[CLASS].One();

    if (0 > exp)
    {
        base = base.inv();
        exp = -exp;
    }

    if (0 === exp)
    {
        /*pass*/
    }
    else if (1 === exp)
    {
        pow = base;
    }
    else if (2 === exp)
    {
        pow = base.mul(base);
    }
    else
    {
        // faster explicit exponentiation by squaring
        while (0 !== exp)
        {
            if (exp & 1) pow = pow.mul(base);
            exp >>= 1;
            base = base.mul(base);
        }
    }
    return pow;
}
function kthroot(x, k, limit)
{
    // https://en.wikipedia.org/wiki/Nth_root_algorithm
    // https://en.wikipedia.org/wiki/Shifting_nth_root_algorithm
    // Return the approximate k-th root of a rational number by Newton's method
    var Arithmetic = Abacus.Arithmetic, O = Arithmetic.O, I = Arithmetic.I, two = Arithmetic.II,
        ObjectClass, r, d, k_1, tries = 0, epsilon = Rational.Epsilon();
    if (is_number(k)) k = Integer.cast(k);
    if (k.equ(O)) return null;
    if ((is_instance(x, Numeric) && (x.equ(O) || x.equ(I))) || (Arithmetic.isNumber(x) && (Arithmetic.equ(O, x) || Arithmetic.equ(I, x)))) return x;
    ObjectClass = Arithmetic.isNumber(x) || is_instance(x, Integer) ? Rational : x[CLASS];
    x = ObjectClass.cast(x);
    if (is_class(ObjectClass, Rational) && x.lt(O) && k.mod(two).equ(O))
    {
        // square root of negative real number, transform to complex
        ObjectClass = Complex;
        x = ObjectClass.cast(x);
    }
    if (k.lt(O))
    {
        x = x.inv();
        k = k.neg();
    }
    if (k.equ(I)) return x;

    if (is_class(ObjectClass, Rational))
    {
        r = new ObjectClass(ikthroot(x.num, k.num), ikthroot(x.den, k.num));
    }
    else if (is_class(ObjectClass, nComplex))
    {
        if (x.isReal() && ((x.real() >= 0) || !k.mod(two).equ(O)))
        {
            r = new ObjectClass(jskthroot(x.real(), k.num.valueOf()), 0);
        }
        else
        {
            r = new ObjectClass(I, I); // make sure a complex is used, not strictly real or imag
        }
        epsilon = 1e-8;
    }
    else if (is_class(ObjectClass, Complex))
    {
        if (x.isReal() && (x.real().gte(O) || !k.mod(two).equ(O)))
        {
            r = new ObjectClass(Rational(ikthroot(x.real().num, k.num), ikthroot(x.real().den, k.num)), Rational.Zero());
        }
        else
        {
            r = new ObjectClass(I, I); // make sure a complex is used, not strictly real or imag
        }
    }
    else
    {
        r = ObjectClass.One();
    }
    //if (null == limit) limit = 6; // for up to 6 tries Newton method converges with 64bit precision
    //limit = stdMath.abs(+limit);
    k_1 = k.sub(I);
    if (is_class(ObjectClass, nComplex))
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if ((stdMath.abs(d.real()) <= epsilon) && (stdMath.abs(d.imag()) <= epsilon)) break;
            r = r.add(d);
        } while (1);
    }
    else if (is_class(ObjectClass, Complex))
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if (d.real().abs().lte(epsilon) && d.imag().abs().lte(epsilon)) break;
            r = r.add(d);
        } while (1);
    }
    else
    {
        do {
            d = x.div(r.pow(k_1)).sub(r).div(k);
            if (d.abs().lte(epsilon)) break;
            r = r.add(d);
        } while (1);
    }
    return r;
}
