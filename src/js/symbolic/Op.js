// Abacus.Op, represents an abstract mathematical operator
Op = Abacus.Op = Class({
    constructor: function Op(op) {
        var self = this;
        if (!is_instance(self, Op)) return new Op(op);
        if (is_instance(op, Op)) op = op.op;
        self.op = String(op);
    }
    ,op: ''
    ,dispose: function() {
        var self = this;
        self.op = null;
        return self;
    }
    ,clone: function() {
        var self = this;
        return new self[CLASS](self.op);
    }
    ,evaluate: function() {
        return null;
    }
    ,toString: function() {
        return self.op;
    }
    ,toTex: function() {
        return this.toString();
    }
});

// Abacus.RelOp, represents a relational operator, eg =, <, >, <=, >=, <>
RelOp = Abacus.RelOp = Class(Op, {
    constructor: function RelOp(lhs, op, rhs) {
        var self = this;
        if (!is_instance(self, RelOp)) return new RelOp(lhs, op, rhs);
        if (is_instance(lhs, RelOp))
        {
            self.lhs = lhs.lhs;
            self.op = lhs.op;
            self.rhs = lhs.rhs;
        }
        else
        {
            op = String(op||'=').toLowerCase();
            if (null == lhs) lhs = RationalExpr();
            if (null == rhs) rhs = RationalExpr();
            if (!is_instance(lhs, [Expr, RationalExpr, Func])) lhs = RationalExpr(lhs);
            if (!is_instance(rhs, [Expr, RationalExpr, Func])) rhs = RationalExpr(rhs);
            self.lhs = lhs;
            self.rhs = rhs;
            self.op = RelOp.OP(op)
        }
    }

    ,__static__: {
        OP: function(op) {
            op = String(op).toLowerCase();
            if ('<' === op || '\\lt' ===op) op = '<';
            else if ('>' === op || '\\gt' ===op) op = '>';
            else if ('>=' === op || '=>' === op || '\\le' ===op) op = '>=';
            else if ('<=' === op || '=<' === op || '\\ge' ===op) op = '<=';
            else if ('<>' === op || '!=' === op || '\\ne' ===op) op = '<>';
            else if ('~' === op || '\\sim' ===op) op = '~';
            else op = '=';
            return op;
        }
        ,DUAL: function(op) {
            op = RelOp.OP(op);
            if ('<' === op) return '>';
            else if ('>' === op) return '<';
            else if ('>=' === op) return '<=';
            else if ('<=' === op) return '>=';
            return op;
        }
        ,EQU: function(lhs, rhs) {
            return new RelOp(lhs, '=', rhs);
        }
        ,NEQ: function(lhs, rhs) {
            return new RelOp(lhs, '<>', rhs);
        }
        ,LT: function(lhs, rhs) {
            return new RelOp(lhs, '<', rhs);
        }
        ,LTE: function(lhs, rhs) {
            return new RelOp(lhs, '<=', rhs);
        }
        ,GT: function(lhs, rhs) {
            return new RelOp(lhs, '>', rhs);
        }
        ,GTE: function(lhs, rhs) {
            return new RelOp(lhs, '>=', rhs);
        }
        ,SIM: function(lhs, rhs) {
            return new RelOp(lhs, '~', rhs);
        }
        ,fromString: function(s) {
            var args = String(s).split(/\\sim|\\lt|\\gt|\\le|\\ge|\\ne|\\eq|=<|<=|>=|=>|<>|!=|<|>|=|~/gm),
                op = ['\\sim','\\lt','\\gt','\\le','\\ge','\\ne','\\eq','=<','<=','>=','=>','<>','!=','<','>','=','~'].reduce(function(op, opp){
                    var p = s.indexOf(opp);
                    if (-1 < p && p < op[1]) op = [opp, p];
                    return op;
                }, ['=',Infinity])[0];
            return new RelOp(RationalExpr.fromString(args[0]), op, args.length>1?RationalExpr.fromString(args[1]):RationalExpr());
        }
    }

    ,lhs: null
    ,rhs: null

    ,dispose: function() {
        var self = this;
        self.lhs = null;
        self.rhs = null;
        self.op = null;
        return self;
    }
    ,clone: function() {
        var self = this;
        return new self[CLASS](self.lhs, self.op, self.rhs);
    }
    ,equ: function(rop) {
        var self = this;
        if (is_instance(rop, RelOp))
        {
            if (self.op===rop.op && self.lhs.equ(rop.lhs) && self.rhs.equ(rop.rhs))
                return true;
            else if (self.op===RelOp.DUAL(rop.op) && self.lhs.equ(rop.rhs) && self.rhs.equ(rop.lhs))
                return true;
        }
        return false;
    }
    ,neg: function() {
        var self = this;
        return new RelOp(self.lhs.neg(), RelOp.DUAL(self.op), self.rhs.neg());
    }
    ,add: function(term) {
        var self = this, op = self.op;
        return new RelOp(self.lhs.add(term), op, self.rhs.add(term));
    }
    ,sub: function(term) {
        var self = this, op = self.op;
        return new RelOp(self.lhs.sub(term), op, self.rhs.sub(term));
    }
    ,mul: function(term) {
        var self = this, op = self.op, Arithmetic = Abacus.Arithmetic;
        if ((Arithmetic.isNumber(term) && Arithmetic.lt(term, 0)) || (is_instance(term, Numeric) && term.lt(0)))
            op = RelOp.DUAL(op);
        return new RelOp(self.lhs.mul(term), op, self.rhs.mul(term));
    }
    ,div: function(term) {
        var self = this, op = self.op, Arithmetic = Abacus.Arithmetic;
        if ((Arithmetic.isNumber(term) && Arithmetic.lt(term, 0)) || (is_instance(term, Numeric) && term.lt(0)))
            op = RelOp.DUAL(op);
        return new RelOp(self.lhs.div(term), op, self.rhs.div(term));
    }
    ,evaluate: function(symbolValues) {
        symbolValues = symbolValues || {};
        var self = this, op = self.op, res = false,
            lhs = self.lhs.evaluate(symbolValues), rhs = self.rhs.evaluate(symbolValues);
        if ('>' === op) res = lhs.gt(rhs);
        else if ('<' === op) res = lhs.lt(rhs);
        else if ('>=' === op) res = lhs.gte(rhs);
        else if ('<=' === op) res = lhs.lte(rhs);
        else if ('<>' === op) res = !lhs.equ(rhs);
        else if ('~' === op) res = true;
        else /*if ('=' === op)*/ res = lhs.equ(rhs);
        return res;
    }
    ,toString: function() {
        var self = this, op = self.op;
        return self.lhs.toString()+' '+op+' '+self.rhs.toString();
    }
    ,toTex: function() {
        var self = this, op = self.op;
        if ('>=' === op) op = '\\ge';
        else if ('<=' === op) self.op = '\\le';
        else if ('<>' === op) self.op = '\\ne';
        else if ('~' === op) op = '\\sim';
        return self.lhs.toTex()+' '+op+' '+self.rhs.toTex();
    }
});
