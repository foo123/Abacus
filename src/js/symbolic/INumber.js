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
    var explicit = arguments.length ? (true === arguments[arguments.length-1]) : false,
        args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : ([].slice.call(arguments, 0, arguments.length-(explicit ? 1 : 0)));
    return args.length ? operate(function(result, a) {
        return result.add(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nsub(/* args */)
{
    var explicit = arguments.length ? (true === arguments[arguments.length-1]) : false,
        args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : ([].slice.call(arguments, 0, arguments.length-(explicit ? 1 : 0)));
    return args.length ? operate(function(result, a) {
        return result.sub(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function nmul(/* args */)
{
    var explicit = arguments.length ? (true === arguments[arguments.length-1]) : false,
        args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : ([].slice.call(arguments, 0, arguments.length-(explicit ? 1 : 0)));
    return args.length ? operate(function(result, a) {
        return result.mul(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
function ndiv(/* args */)
{
    var explicit = arguments.length ? (true === arguments[arguments.length-1]) : false,
        args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : ([].slice.call(arguments, 0, arguments.length-(explicit ? 1 : 0)));
    return args.length ? operate(function(result, a) {
        return result.div(a);
    }, args[0], args, 1, args.length-1, 1) : null;
}
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
