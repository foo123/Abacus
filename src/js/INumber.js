function nmax(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(max, a){
        return a.gt(max) ? a : max;
    }, args[0], 1, args.length-1) : null;
}
function nmin(/* args */)
{
    var args = arguments.length && (is_array(arguments[0]) || is_args(arguments[0])) ? arguments[0] : arguments;
    return args.length ? operate(function(min, a){
        return a.lt(min) ? a : min;
    }, args[0], 1, args.length-1) : null;
}
function typecast(ClassTypeCheck, toClassType)
{
    var ClassType = null;
    if (is_array(ClassTypeCheck) && is_callable(ClassTypeCheck[0]))
    {
        ClassType = ClassTypeCheck[0];
        ClassTypeCheck = function(a){return is_instance(a, ClassType);};
        toClassType = is_callable(toClassType) ? toClassType : function(a){return new ClassType(a);};
    }
    else if (!is_callable(ClassTypeCheck))
    {
        ClassTypeCheck = function(a){return true;};
        toClassType = function(a){return a;};
    }
    return function type_cast(a) {
        if (is_array(a) || is_args(a))
        {
            for (var i=0,l=a.length; i<l; i++)
                a[i] = type_cast(a[i]);
        }
        else if (!ClassTypeCheck(a))
        {
            a = toClassType(a);
        }
        return a;
    };
}

// Abacus.INumber, represents a generic (numeric/symbolic) number interface
INUMBER = {
    isReal: function() {
        return true;
    }
    ,isImag: function() {
        return false;
    }
    ,equ: function(a) {
        return is_instance(a, INumber) ? a.equ(this) : (is_string(a) ? (String(this)===a) : (this === a));
    }
    ,gt: function(a) {
        if (is_number(a)) return (this > a);
        else if (is_instance(a, INumber)) return a.lt(this);
        return false;
    }
    ,gte: function(a) {
        if (is_number(a)) return (this >= a);
        else if (is_instance(a, INumber)) return a.lte(this);
        return false;
    }
    ,lt: function(a) {
        if (is_number(a)) return (this < a);
        else if (is_instance(a, INumber)) return a.gt(this);
        return false;
    }
    ,lte: function(a) {
        if (is_number(a)) return (this <= a);
        else if (is_instance(a, INumber)) return a.gte(this);
        return false;
    }
    ,real: function() {
        return this;
    }
    ,imag: function() {
        return 0;
    }
    ,abs: function() {
        return stdMath.abs(this);
    }
    ,neg: function() {
        return -this;
    }
    ,conj: function() {
        return this;
    }
    ,inv: NotImplemented

    ,add: function(a) {
        return is_instance(a, INumber) ? a.add(this) : (this + a);
    }
    ,sub: function(a) {
        return is_instance(a, INumber) ? a.neg().add(this) : (this - a);
    }
    ,mul: function(a) {
        return is_instance(a, INumber) ? a.mul(this) : (this * a);
    }
    ,div: function(a) {
        if (is_instance(a, Numeric)) return a[CLASS](this).div(a);
        return is_instance(a, INumber) ? null : stdMath.floor(this / a);
    }
    ,mod: function(a) {
        if (is_instance(a, Numeric)) return a[CLASS](this).mod(a);
        return is_instance(a, INumber) ? null : (this % a);
    }
    ,divmod: function(a) {
        return [this.div(a), this.mod(a)];
    }
    ,divides: function(a) {
        if (0 === this) return false;
        if (is_number(a)) return (0 === (a % this));
        else if (is_instance(a, Integer)) return a.mod(this).equ(0);
        else if (is_instance(a, Numeric)) return true;
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
    constructor: function INumber() { }
    ,dispose: function() {
        return this;
    }
    ,clone: function() {
        return 0 + this;
    }
    ,valueOf: function() {
        return 0;
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
    constructor: function Numeric() { }
    ,clone: function() {
        return new this[CLASS](this);
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
});

// Symbolic is INumber that represents generally non-constant symbolic objects, eg Expr, Polynomial, MultiPolynomial, RationalFunc
Symbolic = Class(INumber, {
    constructor: function Symbolic() { }
    ,clone: function() {
        return new this[CLASS](this);
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
    constructor: function Poly() { }
});
