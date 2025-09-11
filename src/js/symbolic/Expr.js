// Abacus.Expr, represents symbolic algebraic expressions
Expr = Abacus.Expr = Class(Symbolic, {

    constructor: function Expr(/*args*/) {
        var self = this, op, arg, expr, Arithmetic = Abacus.Arithmetic;
        if (1 < arguments.length)
        {
            op = arguments[0]; arg = arguments[1];
            if (('' === op) && (is_string(arg) || is_number(arg) || is_instance(arg, Numeric) || Arithmetic.isNumber(arg)))
            {
                // symbol or number`
                if (!is_instance(self, Expr)) return new Expr('', arg);
                self.ast = {op:'', arg:is_string(arg) || is_instance(arg, [Rational, Complex]) ? arg : (is_number(arg) ? Rational.fromDec(arg) : new Rational(arg)), type:is_string(arg) ? 'sym' : 'num'};
            }
            else if (is_string(op) && op.length)
            {
                // expression
                if (!is_instance(self, Expr)) return new Expr(op, arg);
                self.ast = {op:op, arg:(is_array(arg) ? arg : [arg]).reduce(function(args, arg) {
                    if (is_string(arg) || is_instance(arg, [Rational, Complex])) args.push(new Expr('', arg));
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
                self.ast = expr.ast;
                expr.dispose();
            }
        }
        else if ((1 === arguments.length) && is_string(arguments[0]))
        {
            // expression as string
            expr = Expr.fromString(arguments[0]);
            if (!is_instance(self, Expr)) return expr;
            self.ast = expr.ast;
            expr.dispose();
        }
        else
        {
            // zero constant expression
            expr = Expr.Zero();
            if (!is_instance(self, Expr)) return expr;
            self.ast = expr.ast;
            expr.dispose();
        }

        def(self, 'terms', {
            get: function() {
                return self.ast ? self.term() : {};
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });

        // RationalExpr
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

        // Op, RelOp
        def(self, 'lhs', {
            get: function() {
                return self.ast && (-1 !== ['>=','<=','!=','>','<','='].indexOf(self.ast.op)) ? self.ast.arg[0] : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'rhs', {
            get: function() {
                return self.ast && (-1 !== ['>=','<=','!=','>','<','='].indexOf(self.ast.op)) ? self.ast.arg[1] : null;
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
    }

    ,__static__: {
         hasInverse: function() {
            return true;
        }

        ,Zero: function() {
            return new Expr('', Rational.Zero());
        }
        ,One: function() {
            return new Expr('', Rational.One());
        }
        ,MinusOne: function() {
            return new Expr('', Rational.MinusOne());
        }

        ,FN: {
            'sqrt()': {
                fn: NOP // handled by Expr.OP['^']
             }
             ,'abs()': {
                 fn: function(args, mode) {
                     return args[0].abs();
                 }
             }
             ,'mod()': {
                 fn: function(args, mode) {
                     return args[0].mod(args[1], true === mode);
                }
             }
             ,'min()': {
                 fn: function(args, mode) {
                     return nmin(args);
                 }
             }
             ,'max()': {
                 fn: function(args, mode) {
                     return nmax(args);
                }
             }
        }
        ,OP: {
            '^': {
             name         : 'pow'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: RIGHT
            ,priority     : 11
            ,fn           : function(args, mode) {
                                // avoid trivial cases
                                return args[1].equ(1) || args[0].equ(1) ? args[0] : (args[0].pow(args[1], true === mode));
                            }
            },
            '/': {
             name         : 'div'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return true === mode ? ndiv(args, true) : ndiv(args);
                            }
            },
            '*': {
             name         : 'mul'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return true === mode ? nmul(args, true) : nmul(args);
                            }
            },
            '+': {
             name         : 'add'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return true === mode ? nadd(args, true) : nadd(args);
                            }
            },
            '-': {
             name         : 'sub'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return true === mode ? nsub(args, true) : nsub(args);
                            }
            },
            '>=': {
             name         : 'ge'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].gte(args[1]) ? Rational.One() : Rational.Zero()) : Expr('>=', args);
                            }
            },
            '<=': {
             name         : 'le'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].lte(args[1]) ? Rational.One() : Rational.Zero()) : Expr('<=', args);
                            }
            },
            '>': {
             name         : 'gt'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].gt(args[1]) ? Rational.One() : Rational.Zero()) : Expr('>', args);
                            }
            },
            '<': {
             name         : 'lt'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 35
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].lt(args[1]) ? Rational.One() : Rational.Zero()) : Expr('<', args);
                            }
            },
            '!=': {
             name         : 'ne'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 40
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (!args[0].equ(args[1]) ? Rational.One() : Rational.Zero()) : Expr('!=', args);
                            }
            },
            '=': {
             name         : 'eq'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 40
            ,fn           : function(args, mode) {
                                return 'evaluate' === mode ? (args[0].equ(args[1]) ? Rational.One() : Rational.Zero()) : Expr('=', args);
                            }
            }
        }

        ,fromString: function(s, imagUnit) {
            imagUnit = is_string(imagUnit) ? imagUnit : null;
            s = trim(String(s)).split(/\s+/).join(' ');
            var i = 0, t = s;
            function error(m, p)
            {
                if (null == p) p = i;
                m = String(m) + ' at position ' + String(p) + ':';
                return new Error(m + "\n" + t + "\n" + (new Array(p+1)).join(' ') + '^' + "\n");
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
                                if (opc2.arity > terms.length) throw error('Invalid or missing argument for "'+op2+'"', o2[1]);
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
                            if (opc.arity > terms.length) throw error('Invalid or missing argument for "'+op+'"', o[1]);
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
                                        if (opc2.arity > terms.length) throw error('Invalid or missing argument for "'+op2+'"', o2[1]);
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
                    if ((match = eat('÷')) || (match = eat(/^(\\over|\\div)[^a-z]/i, 1)))
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
                    if (match = eat(/^\\?([a-z][a-z]*)\s*([\(\{])/i))
                    {
                        // function
                        m = match[1].toLowerCase() + '()';
                        if (!HAS.call(Expr.FN, m)) throw error('Unsupported function "' + m + '"', i0);
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
                        term = 'sqrt()' === m ? Expr.OP['^'].fn([args[0], Rational(1, 2, true)/*1/2*/]) : Expr(m, args);
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^\\?(sqrt)\[(\n+)\]\s*([\(\{])/i))
                    {
                        // generalized radical sqrt
                        if (!HAS.call(Expr.FN, 'sqrt()')) throw error('Unsupported function "sqrt()"', i0);
                        m = parseInt(match[2], 10);
                        if (!m || (0 >= m)) throw error('Invalid radical in "sqrt[]()"', i0);
                        term = parse_until('{' === match[3] ? '}' : ')');
                        if (!term) throw error('Invalid argument in "sqrt['+m+']()"', i0);
                        term = Expr.OP['^'].fn([term, Rational(1, m, true)/*1/m*/]);
                        terms.unshift(term);
                        continue;
                    }
                    if (match = eat(/^-?\s*\d+(\.\d+)?(e-?\d+)?/i))
                    {
                        // float or int to rational number
                        term = Expr('', Rational.fromDec(match[0].split(/\s+/).join('')));
                        terms.unshift(term);
                        if (/^([a-z]|\()/i.test(s))
                        {
                            // directly following symbol or parenthesis, assume implicit multiplication
                            ops.unshift(['*', i]);
                            merge();
                        }
                        continue;
                    }
                    if (match = eat(/^[a-z][a-z]*(_\{?[a-z0-9]+\}?)?/i))
                    {
                        // symbol
                        m = match[0];
                        if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                        if ('}' === m.slice(-1)) m = m.slice(0, -1);
                        term = Expr('', imagUnit === m ? Complex.Img() : m);
                        terms.unshift(term);
                        if ((imagUnit === m) && /^\d/.test(s))
                        {
                            // directly following number after imaginary symbol, assume implicit multiplication
                            ops.unshift(['*', i]);
                            merge();
                        }
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
                if ((1 < terms.length) || (0 < ops.length)) throw error('Mismatched terms and operators', ops.length ? ops[0][1] : p);
                return terms[0] || null;
            }
            return parse_until(false);
        }

        ,cast: null // added below
    }

    ,ast: null
    ,_str: null
    ,_tex: null
    ,_symb: null
    ,_op: null
    ,_terms: null
    ,_c: null
    ,_f: null
    ,_xpnd: null

    ,dispose: function() {
        var self = this;
        self.ast = null;
        self._str = null;
        self._tex = null;
        self._symb = null;
        self._op = null;
        self._terms = null;
        self._c = null;
        self._f = null;
        self._xpnd = null;
        return self;
    }

    ,clone: function() {
        var ast = this.ast;
        return 'expr' === ast.type ? Expr(ast.op, ast.arg.map(function(subexpr) {return subexpr.clone();})) : /*symbol or number*/Expr('', ast.arg);
    }
    ,symbols: function() {
        var self = this, ast = self.ast;
        if (null == self._symb)
        {
            if ('expr' === ast.type)
            {
                self._symb = KEYS(ast.arg.reduce(function(hash, arg) {
                    arg.symbols().forEach(function(symb) {hash[symb] = 1;});
                    return hash;
                }, {})).sort();
            }
            else if ('sym' === ast.type)
            {
                self._symb = [ast.arg];
            }
            else //if ('num' === ast.type)
            {
                self._symb = ['1'];
            }
        }
        return self._symb;
    }
    ,operators: function() {
        var self = this, ast = self.ast;
        if (null == self._op)
        {
            if ('expr' === ast.type)
            {
                self._op = ast.arg.reduce(function(hash, subexpr) {
                    subexpr.operators().forEach(function(op) {hash[op] = 1;});
                    return hash;
                }, {});
                self._op['()' === ast.op.slice(-2) ? ast.op : (Expr.OP[ast.op].name)] = 1;
                self._op = KEYS(self._op).sort();
            }
            else
            {
                self._op = [];
            }
        }
        return self._op;
    }
    ,term: function(t) {
        var self = this, ast, key, terms, O = Expr.Zero(), I = Expr.One(), one = Rational.One();

        if (null == self._terms)
        {
            // collect simple terms only, sums of products of numbers, symbols and powers of symbols
            ast = self.ast;
            self._terms = {'1': O};

            if ('sym' === ast.type)
            {
                self._terms[ast.arg] = self.clone();
            }
            else if ('num' === ast.type)
            {
                self._terms['1'] = self.clone();
            }
            else if ('expr' === ast.type)
            {
                if (('+' === ast.op) || ('-' === ast.op))
                {
                    ast.arg.forEach(function(e, i) {
                        var terms = e.term();
                        KEYS(terms).forEach(function(key) {
                            if (!HAS.call(self._terms, key))
                            {
                                self._terms[key] = terms[key];
                            }
                            else
                            {
                                self._terms[key] = (0 < i) && ('-' === ast.op) ? (self._terms[key].sub(terms[key])) : (self._terms[key].add(terms[key]));
                            }
                        });
                    });
                }
                else if ('*' === ast.op)
                {
                    terms = ast.arg.reduce(function(terms, e) {
                        if (e.isConst())
                        {
                            terms.c = terms.c.mul(e.c());
                        }
                        else
                        {
                            var key = e.toString();
                            terms.symbols[key] = (terms.symbols[key] || 0) + 1;
                        }
                        return terms;
                    }, {c:I, symbols:{}});
                    key = KEYS(terms.symbols).sort().map(function(key) {
                        return 1 < terms.symbols[key] ? (key + '^' + String(terms.symbols[key])) : key;
                    }).join('*');
                    if (key.length)
                    {
                        if (!HAS.call(self._terms, key))
                        {
                            self._terms[key] = terms.c;
                        }
                        else
                        {
                            self._terms[key] = self._terms[key].add(terms.c);
                        }
                    }
                }
                else if ('^' === ast.op)
                {
                    self._terms[self.toString()] = self.clone();
                }
            }
        }

        if (null == t) return self._terms;

        t = String(t);
        return HAS.call(self._terms, t) ? self._terms[t] : O;
    }

    ,isSimple: function() {
        var ast = this.ast, O, I, J, nontrivial;
        if (('sym' === ast.type) || ('num' === ast.type))
        {
            return true;
        }
        else
        {
            O = Expr.Zero();
            I = Expr.One();
            J = Expr.MinusOne();
            if (('+' === ast.op) || ('-' === ast.op))
            {
                nontrivial = ast.arg.filter(function(subexpr) {return !subexpr.equ(O);});
                return ((1 === nontrivial.length) && nontrivial[0].isSimple()) || !nontrivial.length;
            }
            else if ('*' === ast.op)
            {
                nontrivial = ast.arg.filter(function(subexpr) {return !subexpr.equ(I) && !subexpr.equ(J);});
                return ((1 === nontrivial.length) && nontrivial[0].isSimple()) || !nontrivial.length;
            }
            else if ('/' === ast.op)
            {
                return ast.arg[0].isSimple() && (ast.arg[1].equ(I) || ast.arg[1].equ(J));
            }
            else if ('^' === ast.op)
            {
                return ast.arg[0].isSimple() && ast.arg[1].equ(I);
            }
            return false;
        }
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
        var self = this, ast = self.ast;
        if (null == self._c)
        {
            // constant term
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
    ,f: function() {
        var self = this, ast = self.ast;
        if (null == self._f)
        {
            // factor term
            if ('sym' === ast.type)
            {
                self._f = Rational.One();
            }
            else if ('num' === ast.type)
            {
                self._f = ast.arg;
            }
            else if ('*' === ast.op)
            {
                self._f = ast.arg.reduce(function(f, e) {
                    return f.mul(e.f());
                }, Rational.One());
            }
            else if ('/' === ast.op)
            {
                self._f = ast.arg.reduce(function(f, e, i) {
                    return f.mul(0 < i ? e.f().inv() : e.f());
                }, Rational.One());
            }
            else //if (self.isConst())
            {
                self._f = Rational.One();
            }
        }
        return self._f;
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

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return self.ast.arg === other.ast.arg;
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().equ(other.c());
            }
            else
            {
                return self.expand().toString() === other.expand().toString();
            }
        }
        return false;
    }
    ,gt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return false;
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().gt(other.c());
            }
            else if ('expr' === other.ast.type)
            {
                return self.sub(other, true).gt(Expr.Zero());
            }
        }
        return false;
    }
    ,gte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return false;
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().gte(other.c());
            }
            else if ('expr' === other.ast.type)
            {
                return self.sub(other, true).gte(Expr.Zero());
            }
        }
        return false;
    }
    ,lt: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return false;
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().lt(other.c());
            }
            else if ('expr' === other.ast.type)
            {
                return self.sub(other, true).lt(Expr.Zero());
            }
        }
        return false;
    }
    ,lte: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return false;
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().lte(other.c());
            }
            else if ('expr' === other.ast.type)
            {
                return self.sub(other, true).lte(Expr.Zero());
            }
        }
        return false;
    }

    ,add: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().add(other.c()));
            }
            else if (true === explicit)
            {
                return Expr('+', [self, other]).expand();
            }
            return Expr('+', [self, other]);
        }
        return self;
    }
    ,sub: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().sub(other.c()));
            }
            else if (true === explicit)
            {
                return Expr('-', [self, other]).expand();
            }
            return Expr('-', [self, other]);
        }
        return self;
    }
    ,mul: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().mul(other.c()));
            }
            else if (true === explicit)
            {
                return Expr('*', [self, other]).expand();
            }
            return Expr('*', [self, other]);
        }
        return self;
    }
    ,div: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().div(other.c()));
            }
            else if (true === explicit)
            {
                return Expr('/', [self, other]).expand();
            }
            return Expr('/', [self, other]);
        }
        return self;
    }
    ,mod: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (!is_instance(other, Expr)) return self;
        return self.isConst() && other.isConst() ? Expr('', self.c().mod(other.c())) : Expr('mod()', [self, other]);
    }
    ,divmod: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (!is_instance(other, Expr)) return [self, self];
        return [self.div(other, explicit), self.mod(other, explicit)];
    }
    ,divides: function(other) {
        return !this.equ(Expr.Zero());
    }
    ,pow: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic, O = Arithmetic.O;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (other.isInt())
            {
                if (self.isConst())
                {
                    return Expr('', other.c().lt(O) ? (self.c().inv().pow(other.c().neg())) : (self.c().pow(other.c())));
                }
                else if (true === explicit)
                {
                    var n = Integer.cast(other.c()), b = self, pow = Expr.One();
                    if (n.lt(O))
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
                            return b.expand();
                        }
                        else if (2 === n)
                        {
                            b = b.expand();
                            return b.mul(b, true);
                        }
                        else
                        {
                            // exponentiation by squaring
                            b = b.expand();
                            while (0 !== n)
                            {
                                if (n & 1) pow = pow.mul(b, true);
                                n >>= 1;
                                b = b.mul(b, true);
                            }
                            return pow.expand();
                        }
                    }
                }
            }
            return Expr('^', [self, other]);
        }
        return self;
    }
    ,rad: function(other, explicit) {
        var self = this, Arithmetic = Abacus.Arithmetic, rf;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (other.isInt() && other.c().gt(Arithmetic.I))
            {
                if (self.isConst())
                {
                    return Expr('', self.c().rad(other.c()));
                }
                else if (true === explicit)
                {
                    // try to compute explicit rad of rational function
                    rf = self.toRationalFunc();
                    return rf ? rf.rad(other.c()).toExpr() : self.pow(other.inv());
                }
            }
            return self.pow(other.inv());
        }
        return self;
    }
    ,compose: function(g) {
        var self = this;

        function replace(f, x, g)
        {
            if (is_instance(gx, Expr))
            {
                x = String(x);
                if (('sym' === f.ast.type) && (f.ast.arg === x))
                {
                    // substitute x -> g()
                    return g;
                }
                else if (('expr' === f.ast.type) && (-1 !== f.symbols().indexOf(x)))
                {
                    return Expr(f.ast.op, f.ast.arg.map(function(f) {return replace(f, x, g);}));
                }
            }
            return f;
        }

        return is_obj(g) ? KEYS(g).reduce(function(f, x) {return replace(f, x, g[x]);}, self) : self;
    }
    ,d: function(x, n) {
        // nth order formal derivative with respect to symbol x
        var O = Expr.Zero(), I = Expr.One(), df = this;

        if (null == x) return df;
        if (null == n) n = 1;
        n = +n;
        x = String(x);

        if ('1' === x) return O;

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
        function evaluate(expr) {return expr.evaluate(symbolValue);}

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
        else if (('()' === op.slice(-2)) && Expr.FN[op])
        {
            return Expr.FN[op].fn(ast.arg.map(evaluate), 'evaluate');
        }
        else if (Expr.OP[op])
        {
            return Expr.OP[op].fn(ast.arg.map(evaluate), 'evaluate');
        }
        return Rational.Zero();
    }
    ,expand: function() {
        var self = this, O = Rational.Zero(), I = Rational.One(), IE = Expr.One();

        function expand(expr, deep)
        {
            deep = true === deep;

            var ast = expr.ast, args, n;

            if (('sym' === ast.type) || ('num' === ast.type))
            {
                // symbol or number
                return deep ? expr.clone() : expr;
            }
            else //if ('expr' === ast.type)
            {
                if ('+' === ast.op)
                {
                    // expand the arguments and sum similar terms
                    // eg 3a + (-a) + 2 + 1 -> a + 3
                    args = (function expand_sums(args) {
                        return args.reduce(function(sum, subexpr) {
                        if ('+' === subexpr.ast.op)
                        {
                            sum.push.apply(sum, expand_sums(subexpr.ast.arg));
                        }
                        else if ('-' === subexpr.ast.op)
                        {
                            subexpr.ast.arg.forEach(function(subexpr2, i) {
                                expand_sums(subexpr2.ast.arg).forEach(function(term) {sum.push(0 < i ? term.neg() : term);});
                            });
                        }
                        else
                        {
                            sum.push(subexpr);
                        }
                        return sum;
                    }, []);
                    })(deep ? ast.arg.map(function(subexpr) {return subexpr.expand();}) : ast.arg);
                    args = args.reduce(function(terms, subexpr) {
                        var k, t, c, f;
                        if (subexpr.isConst())
                        {
                            c = subexpr.c();
                            if (!c.equ(O))
                            {
                                t = terms['1'];
                                t[0] = t[0].add(c);
                            }
                        }
                        else if (('*' === subexpr.ast.op) || ('/' === subexpr.ast.op))
                        {
                            c = I;
                            f = subexpr.ast.arg.reduce(function(hash, subexpr2, i) {
                                if ((0 < i) && ('/' === subexpr.ast.op)) subexpr2 = subexpr2.inv();
                                if (subexpr2.isConst())
                                {
                                    c = subexpr2.c().mul(c);
                                }
                                else
                                {
                                    var s = subexpr2.toString(), h;
                                    if (h=hash[s])
                                    {
                                        ++h[1];
                                    }
                                    else
                                    {
                                        hash[s] = [subexpr2, 1];
                                    }
                                }
                                return hash;
                            }, {});
                            if (!c.equ(O))
                            {
                                subexpr = Expr('*', KEYS(f).sort().reduce(function(t, k) {
                                    var e = f[k];
                                    t.push(1 < e[1] ? ('^' === e[0].ast.op && e[0].ast.arg[1].isInt() ? Expr('^', [e[0].ast.arg[0], e[0].ast.arg[1].add(e[1])]) : Expr('^', e)) : e[0]);
                                    return t;
                                }, []));
                                k = subexpr.toString();
                                if (t=terms[k])
                                {
                                    t[0] = t[0].add(c);
                                }
                                else
                                {
                                    terms[k] = [c, subexpr];
                                }
                            }
                        }
                        else
                        {
                            k = subexpr.toString();
                            if (t=terms[k])
                            {
                                t[0] = t[0].add(I);
                            }
                            else
                            {
                                terms[k] = [I, subexpr];
                            }
                        }
                        return terms;
                    }, {'1':[O, IE]});
                    return Expr('+', KEYS(args).sort().reduce(function(terms, key) {
                        var e = args[key];
                        if (!e[0].equ(O)) terms.push(e[0].equ(I) ? e[1] : Expr('*', e));
                        return terms;
                    }, []));
                }
                else if ('-' === ast.op)
                {
                    // expand the arguments into sums
                    // eg 3a - a + 2 + 1 -> 3a + (-a) + 2 + 1
                    return expand(Expr('+', ast.arg.reduce(function(terms, subexpr, i) {
                        if (deep) subexpr = subexpr.expand();
                        if ('+' === subexpr.ast.op)
                        {
                            terms.puch.apply(terms, subexpr.ast.arg.map(function(subexpr2) {
                                return 0 < i ? subexpr2.neg() : subexpr2;
                            }));
                        }
                        else if ('-' === subexpr.ast.op)
                        {
                            terms.puch.apply(terms, subexpr.ast.arg.map(function(subexpr2, j) {
                                return ((0 === i) && (0 < j)) || ((0 < i) && (0 === j)) ? subexpr2.neg() : subexpr2;
                            }));
                        }
                        else
                        {
                            terms.push(0 < i ? subexpr.neg() : subexpr);
                        }
                        return terms;
                    }, [])));
                }
                else if ('*' === ast.op)
                {
                    // expand the arguments into sums
                    // eg: (a-b)*(c+d) -> a*c + a*d + (-b)*c + (-b)*d, ..
                    args = (function expand_products(args) {
                        return args.reduce(function(product, subexpr) {
                        if ('*' === subexpr.ast.op)
                        {
                            product.push.apply(product, expand_products(subexpr.ast.arg));
                        }
                        else if ('/' === subexpr.ast.op)
                        {
                            subexpr.ast.arg.forEach(function(subexpr2, i) {
                                expand_products(subexpr2.ast.arg).forEach(function(term) {product.push(0 < i ? term.inv() : term);});
                            });
                        }
                        else
                        {
                            product.push(subexpr);
                        }
                        return product;
                    }, []);
                    })(deep ? ast.arg.map(function(subexpr) {return subexpr.expand();}) : ast.arg);
                    n = 1;
                    args = args.reduce(function(terms, subexpr) {
                        if ('+' === subexpr.ast.op)
                        {
                            terms.push(subexpr.ast.arg);
                        }
                        else if ('-' === subexpr.ast.op)
                        {
                            terms.push(subexpr.ast.arg.map(function(subexpr2, j) {return 0 < j ? subexpr2.neg() : subexpr2;}));
                        }
                        else
                        {
                            terms.push([subexpr]);
                        }
                        n *= terms[terms.length-1].length;
                        return terms;
                    }, []);
                    if (!args.length) n = 0;
                    return expand(Expr('+', operate(function(terms, i) {
                        for (var j=args.length-1,factors={},key,index; j>=0; --j)
                        {
                            index = i % (args[j].length);
                            i = stdMath.floor(i / args[j].length);
                            key = args[j][index].toString();
                            if (factors[key])
                            {
                                ++factors[key][1];
                            }
                            else
                            {
                                factors[key] = [args[j][index], 1];
                            }
                        }
                        var replaced;
                        do {
                            replaced = false;
                            factors = KEYS(factors).reduce(function(f, k) {
                                var fk = factors[k], k2, fk2, e = fk[0];
                                if ('^' === e.ast.op)
                                {
                                    k2 = e.ast.arg[0].toString();
                                    if (fk2=factors[k2])
                                    {
                                        fk2[1] = e.ast.arg[1].add(fk2[1]);
                                        f[k2] = fk2;
                                    }
                                    else
                                    {
                                        f[k2] = [e.ast.arg[0], e.ast.arg[1]];
                                    }
                                    replaced = true;
                                }
                                else
                                {
                                    f[k] = fk;
                                }
                                return f;
                            }, {});
                        } while (replaced);
                        terms.push(Expr('*', KEYS(factors).map(function(k) {
                            var f = factors[k];
                            return 1 === f[1] ? f[0] : Expr('^', f);
                        })));
                        return terms;
                    }, [], null, 0, n - 1, 1)));
                }
                else if ('/' === ast.op)
                {
                    // expand the arguments into sums
                    // eg: (a-b)/(c+d) -> a/(c+d) + (-b)/(c+d), ..
                    args = ast.arg.reduce(function(terms, subexpr, i) {
                        if (deep) subexpr = subexpr.expand();
                        if (0 === i)
                        {
                            if ('+' === subexpr.ast.op)
                            {
                                terms[0] = subexpr.ast.arg;
                            }
                            else if ('-' === subexpr.ast.op)
                            {
                                terms[0] = subexpr.ast.arg.map(function(subexpr2, j) {return 0 < j ? subexpr2.neg() : subexpr2;});
                            }
                            else
                            {
                                terms[0] = [subexpr];
                            }
                            n = terms[0].length;
                        }
                        else
                        {
                            if (terms[1])
                            {
                                terms[1].push(subexpr);
                            }
                            else
                            {
                                terms[1] = [subexpr];
                            }
                        }
                        return terms;
                    }, [null, null]);
                    if (!args[0])
                    {
                        n = 0;
                    }
                    else if (args[1])
                    {
                        args[1] = expand(Expr('*', args[1]));
                    }
                    return expand(Expr('+', args[1] ? operate(function(terms, i) {
                        terms.push(Expr('/', [args[0][i], args[1]]));
                        return terms;
                    }, [], null, 0, n - 1, 1) : (args[0] || [])));
                }
                else if ('^' === ast.op)
                {
                    if (ast.arg[1].isInt())
                    {
                        // pow with integer exponent, compute the symbolic pow
                        return expand((deep ? ast.arg[0].expand() : ast.arg[0]).pow(ast.arg[1], true));
                    }
                    else
                    {
                        // expand the arguments into products
                        // eg: (a^b)^c -> a^(b*c), ..
                        // eg: (a*b)^c -> (a^c) * (b^c), ..
                        // eg: (a)^(b+c) -> (a^b) * (a^c), .. NO
                        // eg: (a*d)^(b+c) -> ((a*d)^b) * ((a*d)^c) -> a^b * d^b * a^c * d^c, .. NO
                        args = (function expand_powers(args) {
                            var pow, base = args[0], exp = args[1];
                            if ('^' === args[0].ast.op)
                            {
                                pow = expand_powers(args[0].ast.arg);
                                base = pow[0];
                                exp = exp.mul(pow[1], true);
                            }
                            return [base, exp];
                        })(deep ? ast.arg.map(function(subexpr) {return subexpr.expand();}) : ast.arg);
                        args = args.reduce(function(terms, subexpr, i) {
                            if (0 === i)
                            {
                                if ('*' === subexpr.ast.op)
                                {
                                    terms.push(subexpr.ast.arg);
                                }
                                else if ('/' === subexpr.ast.op)
                                {
                                    terms.push(subexpr.ast.arg.map(function(subexpr2, j) {return 0 < j ? subexpr2.inv() : subexpr2;}));
                                }
                                else
                                {
                                    terms.push([subexpr]);
                                }
                            }
                            else
                            {
                                terms.push([subexpr]);
                            }
                            return terms;
                        }, []);
                        n = args.length ? args[0].length * args[1].length : 0;
                        return expand(Expr('*', operate(function(terms, i) {
                            for (var j=0,factors=[],index; j<2; ++j)
                            {
                                index = i % (args[j].length);
                                factors.push(args[j][index]);
                                i = stdMath.floor(i / args[j].length);
                            }
                            terms.push(factors[0].pow(factors[1], true));
                            return terms;
                        }, [], null, 0, n - 1, 1)));
                    }
                }
                else
                {
                    //function or relational op, expand the arguments
                    return deep ? Expr(ast.op, ast.arg.map(function(subexpr) {
                        return subexpr.expand();
                    })) : expr;
                }
            }
        }

        if (null == self._xpnd) self._xpnd = expand(self, true);

        return self._xpnd;
    }
    ,toPoly: function(symbol, ring, imagUnit) {
        var self = this, other_symbols, coeff_ring;

        if (!symbol)
        {
            symbol = self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s);});
            if (!symbol.length) symbol = ['x'];
        }

        other_symbols = is_array(symbol) ? self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s) && (-1 === symbol.indexOf(s));}) : self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s) && (s !== symbol);});

        ring = is_instance(ring, Ring) ? ring : (-1 !== self.symbols().indexOf(imagUnit) ? Ring.C() : Ring.Q());
        coeff_ring = other_symbols.length ? Ring(ring.NumberClass, other_symbols, true) : ring;

        function is_const(expr)
        {
            return 0 === expr.symbols().filter(is_array(symbol) ? function(s) {return -1 !== symbol.indexOf(s);} : function(s) {return s === symbol;}).length;
        }
        function poly(expr)
        {
            var ast = expr.ast, term, coeff, exp;

            if ('sym' === ast.type)
            {
                if (imagUnit === ast.arg)
                {
                    // complex imaginary constant
                    term = {};
                    coeff = Complex.Img();
                    if (is_array(symbol))
                    {
                        term['1'] = coeff;
                        return MultiPolynomial(term, symbol, coeff_ring);
                    }
                    else
                    {
                        term['0'] = coeff;
                        return Polynomial(term, symbol, coeff_ring);
                    }
                }
                else if ((is_array(symbol) && (-1 !== symbol.indexOf(ast.arg))) || (is_string(symbol) && (symbol === ast.arg)))
                {
                    // polynomial symbol
                    coeff = ring.One();
                    term = {};
                    if (is_array(symbol))
                    {
                        term[ast.arg] = coeff;
                        return MultiPolynomial(term, symbol, coeff_ring);
                    }
                    else
                    {
                        term['1'] = coeff;
                        return Polynomial(term, symbol, coeff_ring);
                    }
                }
                else
                {
                    // symbolic rational constant suitable as polynomial coefficient
                    term = {}; term[ast.arg] = ring.One();
                    coeff = RationalFunc(MultiPolynomial(term, other_symbols, ring), null, null, null, true);
                    term = {};
                    if (is_array(symbol))
                    {
                        term['1'] = coeff;
                        return MultiPolynomial(term, symbol, coeff_ring);
                    }
                    else
                    {
                        term['0'] = coeff;
                        return Polynomial(term, symbol, coeff_ring);
                    }
                }
            }
            else if ('num' === ast.type)
            {
                // numeric constant
                term = {};
                coeff = ast.arg;
                if (is_array(symbol))
                {
                    term['1'] = coeff;
                    return MultiPolynomial(term, symbol, coeff_ring);
                }
                else
                {
                    term['0'] = coeff;
                    return Polynomial(term, symbol, coeff_ring);
                }
            }
            else //if ('expr' === ast.type)
            {
                if (('+' === ast.op) || ('-' === ast.op) || ('*' === ast.op))
                {
                    // combine subexpression polynomials
                    return ast.arg.reduce(function(result, subexpr, i) {
                        if (0 === i)
                        {
                            return poly(subexpr);
                        }
                        else if (null == result)
                        {
                            return result;
                        }
                        else
                        {
                            subexpr = poly(subexpr);
                            return null == subexpr ? null : ('*' === ast.op ? result.mul(subexpr) : ('-' === ast.op ? result.sub(subexpr): result.add(subexpr)));
                        }
                    }, null);
                }
                else if ('/' === ast.op)
                {
                    // combine subexpression polynomials
                    return ast.arg.reduce(function(result, subexpr, i) {
                        if (0 === i)
                        {
                            return poly(subexpr);
                        }
                        else if (null == result)
                        {
                            return result;
                        }
                        else if (is_const(subexpr.num))
                        {
                            var coeff = subexpr.num.toPoly(other_symbols, ring, imagUnit);
                            if (null == coeff) return null;
                            coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), coeff, null, null, true);
                            subexpr = poly(subexpr.den);
                            return null == subexpr ? null : result.mul(subexpr.mul(is_array(symbol) ? MultiPolynomial({'1':coeff}, symbol, coeff_ring) : Polynomial({'0':coeff}, symbol, coeff_ring)));
                        }
                        else
                        {
                            return null;
                        }
                    }, null);
                }
                else if (('^' === ast.op) && ast.arg[1].isInt())
                {
                    // raise subexpression polynomial to int pow
                    term = null;
                    exp = ast.arg[1].c();
                    if (exp.equ(0))
                    {
                        return is_array(symbol) ? MultiPolynomial.One(symbol, coeff_ring) : Polynomial.One(symbol, coeff_ring);
                    }
                    if (exp.lt(0))
                    {
                        if (is_const(ast.arg[0].num))
                        {
                            term = ast.arg[0].num.toPoly(other_symbols, ring, imagUnit);
                            if (null != term)
                            {
                                exp = exp.neg();
                                coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), term, null, null, true);
                                term = poly(ast.arg[0].den);
                                if (null != term)
                                {
                                    term = term.mul(is_array(symbol) ? MultiPolynomial({'1':coeff}, symbol, coeff_ring) : Polynomial({'0':coeff}, symbol, coeff_ring));
                                }
                            }
                        }
                    }
                    else //if (exp.gt(0))
                    {
                        term = poly(ast.arg[0]);
                    }
                    return null == term ? null : term.pow(exp);
                }
                else
                {
                    // is not a polynomial
                    return null;
                }
            }
        }
        return poly(self);
    }
    ,toRationalFunc: function() {
        var self = this,
            num = self.num.toPoly(self.symbols().filter(function(s) {return '1' !== s;})),
            den = num ? self.den.toPoly(num.symbol) : null
        ;
        return num && den ? RationalFunc(num, den) : null;
    }
    ,toString: function() {
        var self = this, ast = self.ast, op = ast.op, arg = ast.arg, str, str2, sign, sign2;

        function needs_parentheses(expr)
        {
            return !(expr.isSimple() || ('^' === expr.ast.op) || ('()' === expr.ast.op.slice(-2)));
        }

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
                        return needs_parentheses(subexpr) ? ('(' + s + ')') : s;
                    }).join(' ');
                }
                else if (POSTFIX === Expr.OP[op].fixity)
                {
                    self._str = arg.map(function(subexpr) {
                        var s = subexpr.toString();
                        return needs_parentheses(subexpr) ? ('(' + s + ')') : s;
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
                            self._str = (!needs_parentheses(arg[0]) && ('-' !== sign) ? str : ('(' + str + ')')) + '^' + ((!needs_parentheses(arg[1]) && ('-' !== sign2) ? str2 : ('(' + str2 + ')')));
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
                        self._str = sign + (('1' === str2) || ('0' === str) ? str : ((!needs_parentheses(arg[0]) ? str : ('(' + str + ')')) + '/' + (!needs_parentheses(arg[1]) ? str2 : ('(' + str2 + ')'))));
                    }
                    else if (('+' === op) || ('-' === op) || ('*' === op))
                    {
                        self._str = arg.reduce(function(out, subexpr) {
                            var str = trim(subexpr.toString()), isNeg, strp;
                            if (('*' === op) && (('0' === str) || ('0' === out[0]))) return ['0'];
                            if (('*' === op) && ('1' === str)) return out;
                            if ((('+' === op) || ('-' === op)) && ('0' === str)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === str.charAt(0);
                                strp = isNeg ? trim(str.slice(1)) : str;
                                if ('*' === op) out.push('*'/*'⋅'*/);
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? (!needs_parentheses(subexpr) && !isNeg ? str : ('(' + str + ')')) : strp);
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
                            self._str[0] = (1 < self._str.length) && (('-' === sign) || needs_parentheses(self._str[0])) ? ('(' + str + ')') : str;
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

        function needs_parentheses(expr)
        {
            return !(expr.isSimple() || ('^' === expr.ast.op) || ('()' === expr.ast.op.slice(-2)));
        }

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
                        return needs_parentheses(subexpr) ? ('\\left(' + s + '\\right)') : s;
                    }).join(' ');
                }
                else if (POSTFIX === Expr.OP[op].fixity)
                {
                    self._tex = arg.map(function(subexpr) {
                        var s = subexpr.toTex();
                        return needs_parentheses(subexpr) ? ('\\left(' + s + '\\right)') : s;
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
                        else if (arg[1].num.equ(1) && arg[1].den.isInt() && arg[1].den.c().gt(1))
                        {
                            // radical sqrt
                            self._tex = '\\sqrt' + (arg[1].den.c().equ(2) ? '' : ('[' + Tex(arg[1].den.c()) + ']')) + '{' + tex + '}';
                        }
                        else
                        {
                            sign = tex.charAt(0);
                            self._tex = (!needs_parentheses(arg[0]) && ('-' !== sign) ? tex : ('\\left(' + tex + '\\right)')) + '^{' + tex2 + '}';
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
                        self._tex = sign + (('1' === tex2) || ('0' === tex) ? tex : ('\\frac{' + tex + '}{' + tex2 + '}'));
                    }
                    else if (('+' === op) || ('-' === op) || ('*' === op))
                    {
                        self._tex = arg.reduce(function(out, subexpr) {
                            var tex = trim(subexpr.toTex()), isNeg, texp;
                            if (('*' === op) && (('0' === tex) || ('0' === out[0]))) return ['0'];
                            if (('*' === op) && ('1' === tex)) return out;
                            if ((('+' === op) || ('-' === op)) && ('0' === tex)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === tex.charAt(0);
                                texp = isNeg ? trim(tex.slice(1)) : tex;
                                if ('*' === op) out.push(' \\cdot ');
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? (!needs_parentheses(subexpr) && !isNeg ? tex : ('\\left(' + tex + '\\right)')) : texp);
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
                            self._tex[0] = (1 < self._tex.length) && (('-' === sign) || needs_parentheses(self._tex[0])) ? ('\\left(' + tex + '\\right)') : tex;
                        }
                        self._tex = self._tex.join('');
                        if (!self._tex.length) self._tex = '*' === op ? '1' : '0';
                    }
                    else //if (('>=' === op) || ('<=' === op) || ('!=' === op) || ('>' === op) || ('<' === op) || ('=' === op))
                    {
                        self._tex = arg.map(function(subexpr) {
                            return subexpr.toTex();
                        }).join(' \\' + Expr.OP[op].name + ' ');
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
    return is_string(a) ? Expr.fromString(a) : (is_callable(a.toExpr) ? a.toExpr() : Expr('', a));
});
