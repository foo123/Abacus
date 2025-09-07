// Abacus.Expr, represents symbolic algebraic expressions
Expr = Abacus.Expr = Class(Symbolic, {

    constructor: function Expr(/*args*/) {
        var self = this, op, arg, expr, Arithmetic = Abacus.Arithmetic;
        if (1 < arguments.length)
        {
            op = arguments[0]; arg = arguments[1];
            if ((('' === op) || (null == op)) && (is_string(arg) || is_number(arg) || is_instance(arg, Numeric) || Arithmetic.isNumber(arg)))
            {
                // symbol or number`
                if (!is_instance(self, Expr)) return new Expr('', arg);
                self.ast = {op:'', arg:is_string(arg) || is_instance(arg, Complex) ? arguments[1] : (is_number(arg) ? Rational.fromDec(arg) : new Rational(arg)), type:is_string(arg) ? 'sym' : 'num'};
            }
            else if ('' !== op)
            {
                // expression
                if (!is_instance(self, Expr)) return new Expr(String(op), arg);
                self.ast = {op:String(op), arg:(is_array(arg) ? arg : [arg]).reduce(function(args, arg) {
                    if (is_string(arg) || is_instance(arg, Complex)) args.push(new Expr('', arg));
                    else if (is_number(arg)) args.push(new Expr('', Rational.fromDec(arg)));
                    else if (is_instance(arg, Numeric) || Arithmetic.isNumber(arg)) args.push(new Expr('', new Rational(arg)));
                    else if (is_instance(arg, Expr)) args.push(arg);
                    return args;
                }, []), type:'expr'};
                if (!self.ast.arg.length) self.ast = {op:'', arg:Rational.Zero(), type:'num'};
            }
            else
            {
                // zero constant expression
                expr = Expr.Zero();
                if (!is_instance(self, Expr)) return expr;
                self.ast = {op:'', arg:expr.ast.arg, type:'num'};
            }
        }
        else if ((1 === arguments.length) && is_string(arguments[0]))
        {
            // expression as string
            expr = Expr.fromString(arguments[0]);
            if (!is_instance(self, Expr)) return expr;
            self.ast = {op:expr.ast.op, arg:expr.ast.arg, type:expr.ast.type};
            expr.dispose();
        }
        else
        {
            // zero constant expression
            expr = Expr.Zero();
            if (!is_instance(self, Expr)) return expr;
            self.ast = {op:'', arg:expr.ast.arg, type:'num'};
        }

        // simulate RationalExpr
        def(self, 'num', {
            get: function() {
                return self.ast && ('/' === self.ast.op) && (2 === self.ast.arg.length) ? self.ast.arg[0] : self;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'den', {
            get: function() {
                return self.ast && ('/' === self.ast.op) && (2 === self.ast.arg.length) ? self.ast.arg[1] : Expr.One();
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
         O: null
        ,I: null
        ,J: null
        ,Zero: function() {
            if (null == Expr.O) Expr.O = Expr('', 0);
            return Expr.O;
        }
        ,One: function() {
            if (null == Expr.I) Expr.I = Expr('', 1);
            return Expr.I;
        }
        ,MinusOne: function() {
            if (null == Expr.J) Expr.J = Expr('', -1);
            return Expr.J;
        }
        ,hasInverse: function() {
            return true;
        }

        ,FN: {
              list: ['sqrt', 'abs', 'mod', 'min', 'max']
             ,fn: {
                 sqrt: function(args, mode) {
                     return args[0].pow(Rational(1, 2, true), true === mode);
                 }
                 ,abs: function(args, mode) {
                     return args[0].abs();
                 }
                 ,mod: function(args, mode) {
                     return args[0].mod(args[1], true === mode);
                }
                 ,min: function(args, mode) {
                     return nmin(args);
                 }
                 ,max: function(args, mode) {
                     return nmax(args);
                }
             }
        }
        ,OP: {
            '^': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: RIGHT
            ,priority     : 11
            ,fn           : function(args, mode) {
                                // avoid trivial cases
                                return args[1].equ(1) || args[0].equ(1) ? args[0] : (args[0].pow(args[1], true === mode));
                            }
            },
            '/': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return true === mode ? ndiv(args, true) : ndiv(args);
                            }
            },
            '*': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return true === mode ? nmul(args, true) : nmul(args);
                            }
            },
            '+': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return true === mode ? nadd(args, true) : nadd(args);
                            }
            },
            '-': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return true === mode ? nsub(args, true) : nsub(args);
                            }
            },
            '>=': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].gte(args[1]) ? Rational.One() : Rational.Zero()) : Expr('>=', args);
                            }
            },
            '<=': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].lte(args[1]) ? Rational.One() : Rational.Zero()) : Expr('<=', args);
                            }
            },
            '>': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].gt(args[1]) ? Rational.One() : Rational.Zero()) : Expr('>', args);
                            }
            },
            '<': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].lt(args[1]) ? Rational.One() : Rational.Zero()) : Expr('<', args);
                            }
            },
            '!=': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 40
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (!args[0].equ(args[1]) ? Rational.One() : Rational.Zero()) : Expr('!=', args);
                            }
            },
            '=': {
             arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 40
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].equ(args[1]) ? Rational.One() : Rational.Zero()) : Expr('=', args);
                            }
            }
        }

        ,fromString: function(s) {
            s = trim(String(s)).split(/\s+/).join(' ');
            var i = 0;
            function error(m, p)
            {
                if (null == p) p = i;
                m = String(m) + ' at position ' + String(p) + ':';
                return new Error(m + "\n" + s + "\n" + (new Array(p)).join(' ') + '^' + "\n");
            }
            function parse_until(expected)
            {
                // parse both simple string and tex representations
                var match, m, c, i0,
                    op, term, args,
                    terms = [], ops = [];
                function eat(pattern, group)
                {
                    var match = pattern.test ? s.match(pattern) : (pattern === s.slice(0, pattern.length)), offset;
                    if (match)
                    {
                        if (pattern.test) // regexp
                        {
                            offset = match[group || 0].length;
                            s = s.slice(offset);
                            i += offset;
                            return match;
                        }
                        else // string
                        {
                            offset = pattern.length;
                            s = s.slice(offset);
                            i += offset;
                            return [pattern, pattern];
                        }
                    }
                    return false;
                }
                function merge(end)
                {
                    // extended shunting-yard algorithm
                    if (!ops.length) return;
                    var o, op, opc,
                        o2, op2, opc2,
                        result, args;
                    if (true === end)
                    {
                        while (0 < ops.length)
                        {
                            o2 = ops.shift();
                            op2 = o2[0];
                            opc2 = Expr.OP[op2];

                            if (('-' === op2) && (1 === terms.length))
                            {
                                terms[0] = terms[0].neg();
                            }
                            else
                            {
                                if (opc2.arity > terms.length) throw error('Mising argument for "'+op2+'"', o2[1]);
                                args = terms.splice(0, opc2.arity).reverse();
                                result = opc2.fn(args);
                                if (null != result) terms.unshift(result);
                            }
                        }
                    }
                    else
                    {
                        o = ops.shift();
                        op = o[0];
                        opc = Expr.OP[op];
                        if (POSTFIX === opc.fixity)
                        {
                            // postfix assumed to be already in correct order,
                            // no re-structuring needed
                            if (opc.arity > terms.length) throw error('Mising argument for "'+op+'"', o[1]);
                            args = terms.splice(0, opc.arity).reverse();
                            result = opc.fn(args);
                            if (null != result) terms.unshift(result);
                        }
                        else if (PREFIX === opc.fixity)
                        {
                            // prefix assumed to be already in reverse correct order,
                            // just push to op queue for later re-ordering
                            ops.unshift(o);
                        }
                        else //if (INFIX === opc.fixity)
                        {
                            while (0 < ops.length)
                            {
                                o2 = ops[0];
                                op2 = o2[0];
                                opc2 = Expr.OP[op2];

                                if (
                                    (opc2.priority < opc.priority ||
                                    (opc2.priority === opc.priority &&
                                    (opc2.associativity < opc.associativity ||
                                    (opc2.associativity === opc.associativity &&
                                    opc2.associativity < 0))))
                                )
                                {
                                    if (('-' === op2) && (1 === terms.length))
                                    {
                                        terms[0] = terms[0].neg();
                                    }
                                    else
                                    {
                                        if (opc2.arity > terms.length) throw error('Mising argument for "'+op2+'"', o2[1]);
                                        args = terms.splice(0, opc2.arity).reverse();
                                        result = opc2.fn(args);
                                        if (null != result) terms.unshift(result);
                                    }
                                    ops.shift();
                                }
                                else
                                {
                                    break;
                                }
                            }
                            ops.unshift(o);
                        }
                    }
                }
                while (0 < s.length)
                {
                    if (match = eat(/^\s+/))
                    {
                        // space
                        continue;
                    }
                    if ('\\left(' === s.slice(0, 6))
                    {
                        s = s.slice(5);
                        i += 5;
                    }
                    if ('\\right)' === s.slice(0, 7))
                    {
                        s = s.slice(6);
                        i += 6;
                    }
                    i0 = i;
                    if (match = eat(/^(\\neq|\\gte|\\lte|\\gt|\\ge|\\lt|\\le|\\ne|\\eq)[^a-z]/i, 1))
                    {
                        // relational op
                        op = match[1].toLowerCase();
                        if ('\\neq' === op || '\\ne' === op) op = '!=';
                        else if ('\\gte' === op || '\\ge' === op) op = '>=';
                        else if ('\\lte' === op || '\\le' === op) op = '<=';
                        else if ('\\gt' === op) op = '>';
                        else if ('\\lt' === op) op = '<';
                        else if ('\\eq' === op) op = '=';
                        ops.unshift([op, i0]);
                        merge();
                        continue;
                    }
                    if (match = eat(/^(>=|<=|!=|>|<|=)[^<>!=]/i, 1))
                    {
                        // alternative relational op
                        op = match[1].toLowerCase();
                        ops.unshift([op, i0]);
                        merge();
                        continue;
                    }
                    if (match = eat(/^(\+|-|\*|\/)/i))
                    {
                        // +,-,*,/ op
                        op = match[0].toLowerCase();
                        ops.unshift([op, i0]);
                        merge();
                        continue;
                    }
                    if ((match = eat('⋅')) || (match = eat('×')) || (match = eat(/^(\\times|\\cdot)[^a-z]/i, 1)))
                    {
                        // alternative mul op
                        op = '*';
                        ops.unshift([op, i0]);
                        merge();
                        continue;
                    }
                    if ((match = eat('÷')) || (match = eat(/^(\\div)[^a-z]/i, 1)))
                    {
                        // alternative div op
                        op = '/';
                        ops.unshift([op, i0]);
                        merge();
                        continue;
                    }
                    if (match = eat(/^(\^)([\{\(])?/i))
                    {
                        // pow op
                        op = match[1].toLowerCase();
                        if (match[2])
                        {
                            term = parse_until('(' === match[2] ? ')' : '}');
                            if (!term) throw error('Invalid exponent in "^"', i0);
                        }
                        else
                        {
                            match = eat(/^\d+/);
                            if (!match) throw error('Invalid exponent in "^"', i0);
                            term = Expr('', Rational.fromDec(match[0]));
                        }
                        ops.unshift([op, i0]);
                        merge();
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^\\frac\{/))
                    {
                        // fraction
                        args = [null, null];
                        term = parse_until('}');
                        if (!term) throw error('Invalid numerator in "frac"', i0);
                        args[0] = term;
                        if ('{' !== s.charAt(0)) throw error('Missing "{" in "frac"', i0);
                        s = s.slice(1);
                        i += 1;
                        term = parse_until('}');
                        if (!term) throw error('Invalid denumerator in "frac"', i0);
                        args[1] = term;
                        term = Expr.OP['/'].fn(args);
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat('√'))
                    {
                        // alternative sqrt op
                        args = null;
                        if ('(' === s.charAt(0))
                        {
                            args = parse_until(')');
                        }
                        else if (match = eat(/^\d+(\.\d+)?(e-?\d+)?/i))
                        {
                            args = Expr('', Rational.fromDec(match[0]));
                        }
                        else if (match = eat(/^[a-z][a-z]*(_\{?[a-z0-9]+\}?)?/i))
                        {
                            m = match[0];
                            if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                            if ('}' === m.slice(-1)) m = m.slice(0, -1);
                            args = Expr('', m);
                        }
                        if (!args) throw error('Invalid argument in "√"', i0);
                        term = Expr.OP['^'].fn([args, Rational(1, 2, true)/*1/2*/]);
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^\\?([a-z][a-z0-9_]*)\s*([\(\{])/i))
                    {
                        // function
                        m = match[1].toLowerCase();
                        if (-1 === Expr.FN.list.indexOf(m)) throw error('Unsupported function "' + m + '"', i0);
                        args = [];
                        do {
                            term = parse_until(',' + ('{' === match[2] ? '}' : ')'));
                            if (term) args.push(term);
                            while (/\s/.test(s.charAt(0)))
                            {
                                s = s.slice(1);
                                i += 1;
                            }
                            if (',' === s.charAt(0))
                            {
                                s = s.slice(1);
                                i += 1;
                            }
                            else
                            {
                                break;
                            }
                        } while (1);
                        term = 'sqrt' === m ? Expr.OP['^'].fn([args[0], Rational(1, 2, true)/*1/2*/]) : Expr(m + '()', args);
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^-?\s*\d+(\.\d+)?(e-?\d+)?/i))
                    {
                        // float or int to rational number
                        term = Expr('', Rational.fromDec(match[0].split(/\s+/).join('')));
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^[a-z][a-z]*(_\{?[a-z0-9]+\}?)?/i))
                    {
                        // symbol
                        m = match[0];
                        if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                        if ('}' === m.slice(-1)) m = m.slice(0, -1);
                        term = Expr('', m);
                        terms.unshift(term);
                        continue;
                    }
                    c = s.charAt(0);
                    if (('(' === c) || ('{' === c))
                    {
                        s = s.slice(1);
                        i += 1;
                        term = parse_until('{' === c ? '}' : ')');
                        if (term) terms.unshift(term);
                        continue;
                    }
                    if ((')' === c) && (expected) && (-1 !== expected.indexOf(')')))
                    {
                        s = s.slice(1);
                        i += 1;
                        break;
                    }
                    if (('}' === c) && (expected) && (-1 !== expected.indexOf('}')))
                    {
                        s = s.slice(1);
                        i += 1;
                        break;
                    }
                    if ((',' === c) && (expected) && (-1 !== expected.indexOf(',')))
                    {
                        break;
                    }
                    throw error(expected ? ('Missing "' + expected.split('').join(" or ") + '"') : ('Unexpected "' + c + '"'));
                }
                merge(true);
                if ((1 < terms.length) || (0 < ops.length)) throw error('Mismatched terms and operators');
                return terms[0] || null;
            }
            return parse_until(false);
        }

        ,gcd: null
        ,xgcd: null
        ,lcm: null
        ,cast: null // added below
    }

    ,ast: null
    ,_str: null
    ,_tex: null
    ,_symb: null
    ,_symbp: null
    ,_c: null
    ,_xpnd: null

    ,dispose: function() {
        var self = this;
        self.ast = null;
        self._str = null;
        self._tex = null;
        self._symb = null;
        self._symbp = null;
        self._c = null;
        self._xpnd = null;
        return self;
    }

    ,clone: function() {
        var ast = this.ast;
        return 'expr' === ast.type ? (Expr(ast.op, ast.arg.map(function(arg) {
            return arg.clone();
        }))) : ('num' === ast.type ? (Expr('', ast.arg)) : /*'sym' === ast.type*/(Expr('', ast.arg)));
    }
    ,symbols: function(type) {
        var self = this, ast = self.ast;
        if (null == self._symb)
        {
            if ('expr' === ast.type)
            {
                if (('^' === ast.op) && ('sym' === ast.arg[0].ast.type) && ast.arg[1].isInt())
                {
                    self._symbp = [ast.arg[0].ast.arg + '^' + ast.arg[1].toString()];
                }
                else if ('*' === ast.op)
                {
                    self._symbp = KEYS(ast.arg.reduce(function(hash, arg) {
                        if ('sym' === arg.ast.arg[0].ast.type)
                        {
                            hash[arg.ast.arg[0].ast.arg] = 1;
                        }
                        else if (('^' === arg.ast.op) && ('sym' === arg.ast.arg[0].ast.type) && arg.ast.arg[1].isInt())
                        {
                            hash[arg.ast.arg[0].ast.arg + '^' + arg.ast.arg[1].toString()] = 1;
                        }
                        return hash;
                    }, {})).sort().join('*');
                    if (self._symbp.length) self._symbp = [self._symbp];
                }
                else if (('+' === ast.op) || ('-' === ast.op))
                {
                    self._symbp = KEYS(ast.arg.reduce(function(hash, arg) {
                        arg.symbols('polynomial').forEach(function(symb) {
                            hash[symb] = 1;
                        });
                        return hash;
                    }, {})).sort();
                }
                else
                {
                    self._symbp = ['1'];
                }
                self._symb = KEYS(ast.arg.reduce(function(hash, arg) {
                    arg.symbols().forEach(function(symb) {
                        hash[symb] = 1;
                    });
                    return hash;
                }, {})).sort();
            }
            else if ('sym' === ast.type)
            {
                self._symb = self._symbp = [ast.arg];
            }
            else //if ('num' === ast.type)
            {
                self._symb = self._symbp = ['1'];
            }
        }
        return 'polynomial' === type ? self._symbp : self._symb;
    }

    ,isSimple: function() {
        var type = this.ast.type;
        return ('sym' === type) || ('num' === type);
    }
    ,isConst: function() {
        var self = this;
        return ('num' === self.ast.type) || ((1 === self.symbols().length) && ('1' === self.symbols()[0]));
    }
    ,isInt: function() {
        var self = this;
        return self.isConst() && self.c().isInt();
    }
    ,isReal: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            for (var i=0,n=ast.arg.length; i<n; ++i)
            {
                if (!ast.arg[i].isReal()) return false;
            }
        }
        else if ('num' === ast.type)
        {
            return ast.arg.isReal();
        }
        else //if ('sym' === ast.type)
        {
            return true;
        }
    }
    ,isImag: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            for (var i=0,n=ast.arg.length; i<n; ++i)
            {
                if (!ast.arg[i].isImag()) return false;
            }
        }
        else if ('num' === ast.type)
        {
            return ast.arg.isImag();
        }
        else //if ('sym' === ast.type)
        {
            return true;
        }
    }

    ,c: function() {
        var self = this, ast = self.ast, args;
        if (null == self._c)
        {
            if ('sym' === ast.type)
            {
                self._c = Rational.Zero();
            }
            else if ('num' === ast.type)
            {
                self._c = ast.arg;
            }
            else //if (self.isConst())
            {
                self._c = self.evaluate();
            }
        }
        return self._c;
    }
    ,real: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            return Expr(ast.op, ast.arg.map(function(arg) {return arg.real();}));
        }
        else if ('num' === ast.type)
        {
            return Expr('', ast.arg.real());
        }
        else //if ('sym' === ast.type)
        {
            return Expr('', ast.arg);
        }
    }
    ,imag: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            return Expr(ast.op, ast.arg.map(function(arg) {return arg.imag();}));
        }
        else if ('num' === ast.type)
        {
            return Expr('', ast.arg.imag());
        }
        else //if ('sym' === ast.type)
        {
            return Expr('', ast.arg);
        }
    }
    ,conj: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            return Expr(ast.op, ast.arg.map(function(arg) {return arg.conj();}));
        }
        else if ('num' === ast.type)
        {
            return Expr('', ast.arg.conj());
        }
        else //if ('sym' === ast.type)
        {
            return Expr('', ast.arg);
        }
    }
    ,neg: function() {
        var self = this, ast = self.ast, O = Expr.Zero();
        return 'num' === ast.type ? Expr('', ast.arg.neg()) : (('-' === ast.op) && (2 === ast.arg.length) && ast.arg[0].equ(O) ? ast.arg[1] : Expr('-', [O, self]));
    }
    ,inv: function() {
        var self = this;
        return new Expr('/', [self.den, self.num]);
    }

    ,equ: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                self.ast.arg.equ(x.ast.arg);
            }
            else if (('sym' === self.ast.type) && ('sym' === x.ast.type))
            {
                return self.ast.arg === x.ast.arg;
            }
            else if (self.isConst() && x.isConst())
            {
                return self.c().equ(x.c());
            }
            else
            {
                return self.expand().toString() === x.expand().toString();
            }
        }
        return false;
    }
    ,gt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                self.ast.arg.gt(x.ast.arg);
            }
            else if (('sym' === self.ast.type) && ('sym' === x.ast.type))
            {
                return false;
            }
            else if (self.isConst() && x.isConst())
            {
                return self.c().gt(x.c());
            }
            else if ('expr' === x.ast.type)
            {
                return self.sub(x, true).gt(Expr.Zero());
            }
        }
        return false;
    }
    ,gte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                self.ast.arg.gte(x.ast.arg);
            }
            else if (('sym' === self.ast.type) && ('sym' === x.ast.type))
            {
                return false;
            }
            else if (self.isConst() && x.isConst())
            {
                return self.c().gte(x.c());
            }
            else if ('expr' === x.ast.type)
            {
                return self.sub(x, true).gte(Expr.Zero());
            }
        }
        return false;
    }
    ,lt: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                self.ast.arg.lt(x.ast.arg);
            }
            else if (('sym' === self.ast.type) && ('sym' === x.ast.type))
            {
                return false;
            }
            else if (self.isConst() && x.isConst())
            {
                return self.c().lt(x.c());
            }
            else if ('expr' === x.ast.type)
            {
                return self.sub(x, true).lt(Expr.Zero());
            }
        }
        return false;
    }
    ,lte: function(x) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                self.ast.arg.lte(x.ast.arg);
            }
            else if (('sym' === self.ast.type) && ('sym' === x.ast.type))
            {
                return false;
            }
            else if (self.isConst() && x.isConst())
            {
                return self.c().lte(x.c());
            }
            else if ('expr' === x.ast.type)
            {
                return self.sub(x, true).lte(Expr.Zero());
            }
        }
        return false;
    }

    ,add: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.add(x.ast.arg)) : Expr('+', [self, x]);
    }
    ,sub: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.sub(x.ast.arg)) : Expr('-', [self, x]);
    }
    ,mul: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.mul(x.ast.arg)) : Expr('*', [self, x]);
    }
    ,div: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.div(x.ast.arg)) : Expr('/', [self, x]);
    }
    ,mod: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.mod(x.ast.arg)) : Expr('mod()', [self, x]);
    }
    ,divmod: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return [self, self];
        return [self.div(x, explicit), self.mod(x, explicit)];
    }
    ,divides: function(x) {
        return !this.equ(Expr.Zero());
    }
    ,pow: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (is_instance(x, Expr))
        {
            if (('num' === self.ast.type) && ('num' === x.ast.type))
            {
                return Expr('', self.ast.arg.pow(x.ast.arg));
            }
            else if ((true === explicit) && x.isInt())
            {
                var n = Integer.cast(x.ast.arg), b = self, pow = Expr.One();
                if (n.lt(0))
                {
                    b = b.inv();
                    n = n.neg();
                }
                if (n.lte(100))
                {
                    n = Arithmetic.val(n.num);
                    if (0 === n)
                    {
                        return pow;
                    }
                    else if (1 === n)
                    {
                        return b;
                    }
                    else if (2 === n)
                    {
                        return b.mul(b, true);
                    }
                    else
                    {
                        // exponentiation by squaring
                        while (0 !== n)
                        {
                            if (n & 1) pow = b.mul(pow, true);
                            n >>= 1;
                            b = b.mul(b, true);
                        }
                        return pow;
                    }
                }
            }
            return Expr('^', [self, x]);
        }
        return self;
    }
    ,rad: function(x, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(x) || is_instance(x, Numeric) || is_string(x)) x = Expr('', x);
        if (!is_instance(x, Expr) && is_callable(x.toExpr)) x = x.toExpr();
        if (!is_instance(x, Expr)) return self;
        return ('num' === self.ast.type) && ('num' === x.ast.type) ? Expr('', self.ast.arg.rad(x.ast.arg)) : self.pow(x.inv(), compute);
    }
    ,compose: function(e, x) {
        var self = this, ast = self.ast;
        if (Arithmetic.isNumber(e) || is_instance(e, Numeric) || is_string(e)) e = Expr('', e);
        if (!is_instance(e, Expr) && is_callable(e.toExpr)) e = e.toExpr();
        if (is_instance(e, Expr))
        {
            x = String(x);
            if (('sym' === ast.type) && (ast.arg === x))
            {
                return e;
            }
            else if (('expr' === ast.type) && (-1 !== self.symbols().indexOf(x)))
            {
                return Expr(ast.op, ast.arg.map(function(subexpr) {return subexpr.compose(e, x);}));
            }
        }
        return self;
    }
    ,d: function(x, n) {
        var O = Expr.Zero(), I = Expr.One(), df = this;
        // nth order formal derivative with respect to symbol x
        if (null == x) return df;
        if (null == n) n = 1;
        n = +n;
        function d(f, x)
        {
            var fi = f.ast.arg;
            if ('sym' === f.ast.type)
            {
                // identity derivative rule wrt to x
                return x === fi ? I : O;
            }
            else if (-1 === f.symbols().indexOf(x))
            {
                // constant derivative rule wrt to x
                return O;
            }
            else
            {
                switch (f.ast.op)
                {
                    // differentiate only the arguments rule (applicable?)
                    case 'abs()':
                    case 'min()':
                    case 'max()':

                    case '>=':
                    case '<=':
                    case '!=':
                    case '>':
                    case '<':
                    case '=':

                    // linearity derivative rule
                    case '+':
                    case '-':
                        return Expr(f.ast.op, fi.map(function(fi) {return d(fi, x);}));

                    // power derivative rule
                    case '^':
                        if (-1 === fi[1].symbols().indexOf(x))
                        {
                            return fi[1].mul(f[0].pow(f[1].sub(I)));
                        }
                        else
                        {
                            return O; // f(x)^g(x) rule not supported
                        }

                    // product derivative rule
                    case '*':
                        if (0 < fi.length)
                        {
                            return Expr('+', fi.map(function(fi, i, args) {
                                var di, dfi = d(fi, x);
                                if (dfi.equ(O)) return O;
                                di = args.slice(); di[i] = dfi;
                                return Expr('*', di);
                            }));
                        }
                        return O;

                    // quotient derivative rule
                    case '/':
                        if (2 === fi.length)
                        {
                            return ((d(fi[0], x).mul(fi[1])).sub(fi[0].mul(d(fi[1], x)))).div(fi[1].mul(fi[1]));
                        }
                        return 1 === fi.length ? d(fi[0], x) : O;

                    // unknown / not supported
                    default:
                        return O;
                }
            }
        }
        for (; 0 < n; --n) df = d(df, x);
        return df;
    }
    ,evaluate: function(symbolValue) {
        var self = this, ast = self.ast, op = ast.op;
        symbolValue = symbolValue || {};
        if ('' === op)
        {
            if ('sym' === ast.type)
            {
                return is_instance(symbolValue[ast.arg], Complex) ? symbolValue[ast.arg] : Rational.cast(symbolValue[ast.arg] || 0);
            }
            else //if ('num' === ast.type)
            {
                return ast.arg;
            }
        }
        else if (('()' === op.slice(-2)) && Expr.FN.fn[op.slice(0, -2)])
        {
            return Expr.FN.fn[op.slice(0, -2)](ast.arg.map(function(subexpr) {
                return subexpr.evaluate(symbolValue);
            }), 'evaluate');
        }
        else if (Expr.OP[op])
        {
            return Expr.OP[op].fn(ast.arg.map(function(subexpr) {
                return subexpr.evaluate(symbolValue);
            }), 'evaluate');
        }
        return Rational.Zero();
    }
    ,expand: function() {
        var self = this, ast = self.ast, args;
        if (null == self._xpnd)
        {
            if ('expr' === ast.type)
            {
                if ('()' === ast.op.slice(-2))
                {
                    // function, expand the arguments
                    self._xpnd = Expr(ast.op, ast.arg.map(function(arg) {
                        return arg.expand();
                    }));
                }
                else if (('*' === ast.op) || ('/' === ast.op) || ('+' === ast.op) || ('-' === ast.op))
                {
                    // operator, combine the expanded arguments
                    args = ast.arg.map(function(arg) {return arg.expand();});
                    self._xpnd = operate(function(result, arg) {
                        return result.add(arg, true);
                    }, args[0], args, 1, args.length-1, 1);
                }
                else if ('^' === ast.op)
                {
                    if (ast.arg[1].isInt())
                    {
                        // pow with integer exponent, compute the symbolic pow
                        self._xpnd = ast.arg[0].pow(ast.arg[1], true).expand();
                    }
                    else
                    {
                        // pow with arbitray exponent, expand the arguments
                        self._xpnd = Expr(ast.op, ast.arg.map(function(arg) {
                            return arg.expand();
                        }));
                    }
                }
                else
                {
                    // relational op, expand the arguments
                    self._xpnd = Expr(ast.op, ast.arg.map(function(arg) {
                        return arg.expand();
                    }));
                }
            }
            else
            {
                // symbol or number
                self._xpnd = self.clone();
            }
        }
        return self._xpnd;
    }
    ,toString: function() {
        var self = this, ast = self.ast, op = ast.op, arg = ast.arg, str, str2, sign, sign2;
        if (null == self._str)
        {
            if ('' === op)
            {
                // symbol or number
                self._str = String(arg);
            }
            else if ('()' === op.slice(-2))
            {
                // function
                self._str = op.slice(0, -2) + '(' + arg.map(function(subexpr) {
                    return subexpr.toString();
                }).join(',') + ')';
            }
            else if (Expr.OP[op])
            {
                // subexpression
                if (PREFIX === Expr.OP[op].fixity)
                {
                    self._str = op + arg.map(function(subexpr) {
                        var s = subexpr.toString();
                        return subexpr.isSimple() ? s : ('(' + s + ')');
                    }).join(' ');
                }
                else if (POSTFIX === Expr.OP[op].fixity)
                {
                    self._str = arg.map(function(subexpr) {
                        var s = subexpr.toString();
                        return subexpr.isSimple() ? s : ('(' + s + ')');
                    }).join(' ') + op;
                }
                else //if (INFIX === Expr.OP[op].fixity)
                {
                    // remove trivial arguments, redundant signs and redundant parentheses
                    if ('^' === op)
                    {
                        str = trim(arg[0].toString());
                        str2 = trim(arg[1].toString());
                        if ('1' === str2)
                        {
                            self._str = str;
                        }
                        else
                        {
                            sign = str.charAt(0);
                            sign2 = str2.charAt(0);
                            self._str = (arg[0].isSimple() && ('-' !== sign) ? str : ('(' + str + ')')) + '^' + ((arg[1].isSimple() && ('-' !== sign2) ? str2 : ('(' + str2 + ')')));
                        }
                    }
                    else if ('/' === op)
                    {
                        str = trim(arg[0].toString());
                        str2 = trim(arg[1].toString());
                        sign = '';
                        if ('-' === str.charAt(0) && '-' === str2.charAt(0))
                        {
                            str = trim(str.slice(1));
                            str2 = trim(str2.slice(1));
                        }
                        else if ('-' !== str.charAt(0) && '-' === str2.charAt(0))
                        {
                            sign = '-';
                            str2 = trim(str2.slice(1));
                        }
                        else if ('-' === str.charAt(0) && '-' !== str2.charAt(0))
                        {
                            sign = '-';
                            str = trim(str.slice(1));
                        }
                        self._str = sign + ('1' === str2 ? str : ((arg[0].isSimple() ? str : ('(' + str + ')')) + '/' + (arg[1].isSimple() ? str2 : ('(' + str2 + ')'))));
                    }
                    else if (('+' === op) || ('-' === op) || ('*' === op))
                    {
                        self._str = arg.reduce(function(out, subexpr) {
                            var str = trim(subexpr.toString()), isNeg, strp;
                            if (('*' === op) && ('1' === str)) return out;
                            if ((('+' === op) || ('-' === op)) && ('0' === str)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === str.charAt(0);
                                strp = isNeg ? trim(str.slice(1)) : str;
                                if ('*' === op) out.push('⋅'/*'*'*/);
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? (subexpr.isSimple() && !isNeg ? str : ('(' + str + ')')) : strp);
                            }
                            else
                            {
                                out.push('*' === op ? subexpr : str);
                            }
                            return out;
                        }, []);
                        if (self._str.length && is_instance(self._str[0], Expr))
                        {
                            str = trim(self._str[0].toString());
                            sign = str.charAt(0);
                            self._str[0] = (1 < self._str.length) && (('-' === sign) || !self._str[0].isSimple()) ? ('(' + str + ')') : str;
                        }
                        self._str = self._str.join('');
                        if (!self._str.length) self._str = '*' === op ? '1' : '0';
                    }
                    else //if (('>=' === op) || ('<=' === op) || ('!=' === op) || ('>' === op) || ('<' === op) || ('=' === op))
                    {
                        self._str = arg.map(function(subexpr) {
                            return subexpr.toString();
                        }).join(' ' + op + ' ');
                    }
                }
            }
            else
            {
                self._str = '0';
            }
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, ast = self.ast, op = ast.op, arg = ast.arg, tex, tex2, sign, sign2;
        if (null == self._tex)
        {
            if ('' === op)
            {
                // symbol or number
                if ('sym' === ast.type)
                {
                    self._tex = to_tex(arg);
                }
                else //if ('num' === ast.type)
                {
                    self._tex = Tex(arg);
                }
            }
            else if ('()' === op.slice(-2))
            {
                // function
                self._tex = '\\' + op.slice(0, -2) + '\\left(' + arg.map(function(subexpr) {
                    return subexpr.toTex();
                }).join(',') + '\\right)';
            }
            else if (Expr.OP[op])
            {
                // subexpression
                if (PREFIX === Expr.OP[op].fixity)
                {
                    self._tex = op + arg.map(function(subexpr) {
                        var s = subexpr.toTex();
                        return subexpr.isSimple() ? s : ('\\left(' + s + '\\right)');
                    }).join(' ');
                }
                else if (POSTFIX === Expr.OP[op].fixity)
                {
                    self._tex = arg.map(function(subexpr) {
                        var s = subexpr.toTex();
                        return subexpr.isSimple() ? s : ('\\left(' + s + '\\right)');
                    }).join(' ') + op;
                }
                else //if (INFIX === Expr.OP[op].fixity)
                {
                    // remove trivial arguments, redundant signs and redundant parentheses
                    if ('^' === op)
                    {
                        tex = trim(arg[0].toTex());
                        tex2 = trim(arg[1].toTex());
                        if ('1' === tex2)
                        {
                            self._tex = tex;
                        }
                        else
                        {
                            sign = tex.charAt(0);
                            self._tex = (arg[0].isSimple() && ('-' !== sign) ? tex : ('\\left(' + tex + '\\right)')) + '^{' + tex2 + '}';
                        }
                    }
                    else if ('/' === op)
                    {
                        tex = trim(arg[0].toTex());
                        tex2 = trim(arg[1].toTex());
                        sign = '';
                        if ('-' === tex.charAt(0) && '-' === tex2.charAt(0))
                        {
                            tex = trim(tex.slice(1));
                            tex2 = trim(tex2.slice(1));
                        }
                        else if ('-' !== tex.charAt(0) && '-' === tex2.charAt(0))
                        {
                            sign = '-';
                            tex2 = trim(tex2.slice(1));
                        }
                        else if ('-' === tex.charAt(0) && '-' !== tex2.charAt(0))
                        {
                            sign = '-';
                            tex = trim(tex.slice(1));
                        }
                        self._tex = sign + ('1' === tex2 ? tex : ('\\frac{' + tex + '}{' + tex2 + '}'));
                    }
                    else if (('+' === op) || ('-' === op) || ('*' === op))
                    {
                        self._tex = arg.reduce(function(out, subexpr) {
                            var tex = trim(subexpr.toTex()), isNeg, texp;
                            if (('*' === op) && ('1' === tex)) return out;
                            if ((('+' === op) || ('-' === op)) && ('0' === tex)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === tex.charAt(0);
                                texp = isNeg ? trim(tex.slice(1)) : tex;
                                if ('*' === op) out.push(' \\cdot ');
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? (subexpr.isSimple() && !isNeg ? tex : ('\\left(' + tex + '\\right)')) : texp);
                            }
                            else
                            {
                                out.push('*' === op ? subexpr : tex);
                            }
                            return out;
                        }, []);
                        if (self._tex.length && is_instance(self._tex[0], Expr))
                        {
                            tex = trim(self._tex[0].toTex());
                            sign = tex.charAt(0);
                            self._tex[0] = (1 < self._tex.length) && (('-' === sign) || !self._tex[0].isSimple()) ? ('\\left(' + tex + '\\right)') : tex;
                        }
                        self._tex = self._tex.join('');
                        if (!self._tex.length) self._tex = '*' === op ? '1' : '0';
                    }
                    else //if (('>=' === op) || ('<=' === op) || ('!=' === op) || ('>' === op) || ('<' === op) || ('=' === op))
                    {
                        self._tex = arg.map(function(subexpr) {
                            return subexpr.toTex();
                        }).join('>=' === op ? ' \\ge ' : ('<=' === op ? ' \\le ' : ('!=' === op ? ' \\ne ' : ('>' === op ? ' \\gt ' : ('<' === op ? ' \\lt ' : ' \\eq ')))));
                    }
                }
            }
            else
            {
                self._tex = '0';
            }
        }
        return self._tex;
    }
});
Expr.cast = typecast([Expr], function(a) {
    return is_string(a) ? Expr.fromString(a) : Expr('', a);
});
