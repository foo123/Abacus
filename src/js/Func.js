// Abacus.Func, represents a functional operator, eg min, max, exp, log, sin, cos, ..
Func = Abacus.Func = Class(Op, {
    constructor: function Func(func, args, evaluator, derivative) {
        var self = this;
        if (!is_instance(self, Func)) return new Func(func, args, evaluator, derivative);
        if (is_instance(func, Func))
        {
            self.func = func.op;
            self.args = func.args;
            self._eval = evaluator || func._eval;
            self._deriv = derivative || func._deriv;
        }
        else
        {
            func = String(func||'').toLowerCase();
            if (null == args || !args.length) args = [];
            self.op = func;
            self.args = args.map(function(arg){
                if (!is_instance(arg, [Expr, RationalExpr, Func])) arg = RationalExpr(arg);
                return arg;
            });
            self._eval = evaluator || null;
            self._deriv = derivative || null
        }
    }

    ,__static__: {
        MIN: function(args) {
            return Func('min', args, nmin);
        }
        ,MAX: function(args) {
            return Func('max', args, nmax);
        }
    }

    ,args: null
    ,_eval: null
    ,_deriv: null

    ,dispose: function() {
        var self = this;
        self._eval = null;
        self._deriv = null;
        self.args = null;
        self.op = null;
        return self;
    }
    ,clone: function() {
        var self = this;
        return new self[CLASS](self.op, self.args, self._eval, self._deriv);
    }
    ,isReal: function() {
        var args = self.args;
        return args.filter(function(arg){return arg.isReal();}).length===args.length;
    }
    ,isImag: function() {
        var args = self.args;
        return args.filter(function(arg){return arg.isImag();}).length===args.length;
    }
    ,real: function() {
        var self = this;
        return Func(self.op, self.args.map(function(arg){return arg.real();}), self._eval, self._deriv);
    }
    ,imag: function() {
        var self = this;
        return Func(self.op, self.args.map(function(arg){return arg.imag();}), self._eval, self._deriv);
    }
    ,equ: function(term) {
        var self = this;
        if (is_instance(term, Func))
        {
            return self.op === term.op && self.args.filter(function(arg, i){
                return i<terms.args.length && arg.equ(term.args[i]);
            }).length === term.args.length;
        }
        return term.equ(self);
    }
    ,gt: function(term) {
        return false;
    }
    ,gte: function(term) {
        return false;
    }
    ,lt: function(term) {
        return false;
    }
    ,lte: function(term) {
        return false;
    }
    ,neg: function() {
        return Expr([MulTerm(this, -1)]);
    }
    ,add: function(term) {
        return Expr([this, term]);
    }
    ,sub: function(term) {
        return Expr([this, term.neg()]);
    }
    ,mul: function(term) {
        return Expr([MulTerm([this, term])]);
    }
    ,div: function(term) {
        return RationalExpr(this, term);
    }
    ,pow: function(n) {
        return Expr([PowTerm(this, n)]);
    }
    ,rad: function(n) {
        return Expr([PowTerm(this, Rational(n).inv())]);
    }
    ,d: function(x, n) {
        var self = this, derivative = self._deriv, i, d;
        // nth order formal derivative with respect to symbol x
        if (null == n) n = 1;
        n = +n;
        x = String(x || 'x');
        if (0 > n && is_callable(derivative))
        {
            d = derivative.apply(self, self.args);
            if (1 < n) d = d.d(x, n-1);
            return d;
        }
        return self;
    }
    ,evaluate: function(symbolValues) {
        symbolValues = symbolValues || {};
        var self = this, args = self.args, evaluator = self._eval;
        return is_callable(evaluator) ? evaluator.apply(self, args.map(function(arg){return arg.evaluate(symbolValues);})) : Complex.Zero();
    }
    ,toString: function() {
        var self = this, args = self.args, op = self.op;
        if (('min' === op || 'max' === op) && 1 === args.length)  return String(args[0]);
        return op+'('+args.map(String).join(',')+')';
    }
    ,toTex: function() {
        var self = this, args = self.args, op = self.op;
        if (('min' === op || 'max' === op) && 1 === args.length)  return Tex(args[0]);
        return '\\'+op+'('+args.map(Tex).join(',')+')';
    }
});
