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
                fn: NOP // -> Expr.OP['^']
             }
             ,'abs()': {
                 fn: function(args, mode) {
                     return args[0].abs();
                 }
             }
             ,'mod()': {
                 fn: function(args, mode) {
                     return args[0].mod(args[1]);
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
                                return args[0].pow(args[1]);
                            }
            },
            '/': {
             name         : 'div'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return ndiv(args);
                            }
            },
            '*': {
             name         : 'mul'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 20
            ,fn           : function(args, mode) {
                                return nmul(args);
                            }
            },
            '+': {
             name         : 'add'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return nadd(args);
                            }
            },
            '-': {
             name         : 'sub'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,priority     : 25
            ,fn           : function(args, mode) {
                                return nsub(args);
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
                // parse only the necessary subset of simple string, asciimath and/or tex notation
                // https://asciimath.org/
                // https://the0cp.cc/posts/mathjax/
                // https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference
                var match, m, n, c, i0,
                    op, term, arg, prev_term = false,
                    terms = [], ops = [];
                function eat(pattern, group)
                {
                    var match = pattern.test ? s.match(pattern) : (pattern === s.slice(0, pattern.length)), offset;
                    if (match)
                    {
                        if (false === group)
                        {
                            return true;
                        }
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
                    if (eat(/^\s+/))
                    {
                        // space
                        continue;
                    }
                    if (eat('\\left(', false))
                    {
                        // \left( -> (
                        s = s.slice(5);
                        i += 5;
                    }
                    if (eat('\\right)', false))
                    {
                        // \right) -> )
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
                        prev_term = false;
                        continue;
                    }
                    if (match = eat(/^(>=|<=|=<|!=|>|<|=)[^<>!=]/i, 1))
                    {
                        // alternative relational op
                        op = match[1];
                        if ('=<' === op) op = '<=';
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (match = eat(/^(\+|-|\*|\/)/i))
                    {
                        // +,-,*,/ op
                        op = match[0];
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (eat('⋅') || eat('×') || eat(/^(\\times|\\cdot|xx)[^a-z]/i, 1))
                    {
                        // alternative * op
                        op = '*';
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (eat('÷') || eat('-:') || eat(/^(\\over|\\div)[^a-z]/i, 1))
                    {
                        // alternative / op
                        op = '/';
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (eat(/^\\frac\{/))
                    {
                        // fraction
                        arg = [null, null];
                        if (!(arg[0] = parse_until('}'))) throw error('Missing or invalid numerator in "\\frac"', i0);
                        if (!eat('{')) throw error('Missing "{" in "\\frac"', i0);
                        if (!(arg[1] = parse_until('}'))) throw error('Missing or invalid denumerator in "\\frac"', i0);
                        term = Expr.OP['/'].fn(arg);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^(\^)([\{\(])?/i))
                    {
                        // pow op
                        op = '^';
                        if (match[2])
                        {
                            term = parse_until('(' === match[2] ? ')' : '}');
                            if (!term) throw error('Missing or invalid exponent in "^"', i0);
                        }
                        else
                        {
                            if (!(match = eat(/^\d+/))) throw error('Missing or invalid exponent in "^"', i0);
                            term = Expr('', Rational.fromDec(match[0]));
                        }
                        ops.unshift([op, i0]);
                        merge();
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if ((match = eat(/^\\?(sqrt)\s*\[(\d+)\]\s*([\(\{])/i)) || (match = eat(/^(root)\s*\((\d+)\)\s*(\()/i)))
                    {
                        // generalized radical sqrt/root
                        m = match[1].toLowerCase();
                        if (!HAS.call(Expr.FN, 'sqrt()')) throw error('Unsupported function "'+('root' === m ? 'root()' : 'sqrt[]')+'()"', i0);
                        n = parseInt(match[2], 10);
                        if (!n || (0 >= n)) throw error('Invalid 1st argument in "'+('root' === m ? 'root()' : 'sqrt[]')+'()"', i0);
                        term = parse_until('{' === match[3] ? '}' : ')');
                        if (!term) throw error('Missing or invalid 2nd argument in "'+('root' === m ? ('root('+n+')') : ('sqrt['+n+']'))+'()"', i0);
                        term = Expr.OP['^'].fn([term, Rational(1, n, true)/*1/n*/]);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^\\?([a-z][a-z]*)\s*([\(\{])/i))
                    {
                        // function
                        m = match[1].toLowerCase() + '()';
                        if (!HAS.call(Expr.FN, m)) throw error('Unsupported function "' + m + '"', i0);
                        arg = [];
                        do {
                            term = parse_until(',' + ('{' === match[2] ? '}' : ')'));
                            if (term) arg.push(term);
                            eat(/^\s+/);
                            if (!eat(',')) break;
                        } while (1);
                        term = 'sqrt()' === m ? Expr.OP['^'].fn([arg[0], Rational(1, 2, true)/*1/2*/]) : Expr(m, arg);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (eat('√') || eat(/^sqrt\b\s*/i))
                    {
                        // alternative sqrt
                        if (!HAS.call(Expr.FN, 'sqrt()')) throw error('Unsupported function "sqrt()"', i0);
                        arg = null;
                        if ('(' === s.charAt(0))
                        {
                            // subexpression
                            arg = parse_until(')');
                        }
                        else if ('{' === s.charAt(0))
                        {
                            // subexpression
                            arg = parse_until('}');
                        }
                        else if (match = eat(/^\d+(\.((\[\d+\])|(\d+(\[\d+\])?)))?(e-?\d+)?/i))
                        {
                            // number
                            arg = Expr('', Rational.fromDec(match[0]));
                        }
                        else if (match = eat(/^[a-z](_\{?[a-z0-9]+\}?)?/i))
                        {
                            // symbol
                            m = match[0];
                            if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                            if ('}' === m.slice(-1)) m = m.slice(0, -1);
                            arg = Expr('', m);
                        }
                        if (!arg) throw error('Missing or invalid argument in "sqrt()"', i0);
                        term = Expr.OP['^'].fn([arg, Rational(1, 2, true)/*1/2*/]);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^-?\s*\d+(\.((\[\d+\])|(\d+(\[\d+\])?)))?(e-?\d+)?/i))
                    {
                        // float or int to rational number
                        term = Expr('', Rational.fromDec(match[0].split(/\s+/).join('')));
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        /*if (eat(/^\s*[a-z\(]/i, false))
                        {
                            // directly following symbol or parenthesis, assume implicit multiplication
                            ops.unshift(['*', i]);
                            merge();
                        }*/
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^[a-z](_\{?[a-z0-9]+\}?)?/i))
                    {
                        // symbol
                        m = match[0];
                        if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                        if ('}' === m.slice(-1)) m = m.slice(0, -1);
                        term = Expr('', imagUnit === m ? Complex.Img() : m);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        /*if ((imagUnit === m) && eat(/^\s*[\d\(]/, false))
                        {
                            // directly following number or parenthesis after imaginary symbol, assume implicit multiplication
                            ops.unshift(['*', i]);
                            merge();
                        }*/
                        prev_term = true;
                        continue;
                    }
                    c = s.charAt(0);
                    if (('(' === c) || ('{' === c))
                    {
                        s = s.slice(1);
                        i += 1;
                        term = parse_until('{' === c ? '}' : ')');
                        if ('(' === c)
                        {
                            if (prev_term)
                            {
                                ops.unshift(['*', i0]); // implicit multiplication assumed
                                merge();
                            }
                            prev_term = true;
                        }
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
                    throw error(expected ? ('Missing expected "' + expected.split('').join(" or ") + '"') : ('Unexpected "' + c + '"'));
                }
                merge(true);
                if ((1 < terms.length) || (0 < ops.length)) throw error('Mismatched terms and operators', ops.length ? ops[0][1] : i);
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
                self._symb = ast.arg.reduce(function(symbols, subexpr) {
                    // they are in sorted order
                    return merge_sequences(symbols, subexpr.symbols());
                }, []);
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
                self._op = ast.arg.reduce(function(operators, subexpr) {
                    // they are in sorted order
                    return merge_sequences(operators, subexpr.operators());
                }, ['()' === ast.op.slice(-2) ? ast.op : Expr.OP[ast.op].name]);
            }
            else
            {
                self._op = [];
            }
        }
        return self._op;
    }
    ,term: function(t) {
        var self = this, ast, key, terms, O = Rational.Zero(), I = Rational.One();

        if (null == self._terms)
        {
            // collect simple terms only, sums of products of numbers, symbols and powers of symbols
            ast = self.ast;
            self._terms = {'1': {e:Expr.Zero(), c:O}};

            if ('sym' === ast.type)
            {
                self._terms[ast.arg] = {e:self, c:I};
            }
            else if (self.isConst())
            {
                self._terms['1'] = {e:Expr('', self.c()), c:self.c()};
            }
            else if ('expr' === ast.type)
            {
                if (('+' === ast.op) || ('-' === ast.op))
                {
                    ast.arg.forEach(function(e, i) {
                        KEYS(e.terms).forEach(function(key) {
                            if (!HAS.call(self._terms, key))
                            {
                                self._terms[key] = (0 < i) && ('-' === ast.op) ? {e:e.terms[key].e.neg(), c:e.terms[key].c.neg()} : e.terms[key];
                            }
                            else
                            {
                                if ((0 < i) && ('-' === ast.op))
                                {
                                    self._terms[key] = {e:self._terms[key].e.sub(e.terms[key].e).expand(), c:self._terms[key].c.sub(e.terms[key].c)};
                                }
                                else
                                {
                                    self._terms[key] = {e:self._terms[key].e.add(e.terms[key].e).expand(), c:self._terms[key].c.add(e.terms[key].c)};
                                }
                            }
                            if (('1' !== key) && self._terms[key].c.equ(0)) delete self._terms[key];
                        });
                    });
                }
                else if ('*' === ast.op)
                {
                    var c = I;
                    var f = (ast.arg.reduce(function(f, e) {
                        if ('sym' === e.ast.type)
                        {
                            f.push([e, I]);
                        }
                        else if (('^' === e.ast.op) && ('sym' === e.ast.arg[0].type))
                        {
                            f.push([e.ast.arg[0].arg, e.ast.arg[1].c()]);
                        }
                        else if (e.isConst())
                        {
                            c = c.mul(e.c());
                        }
                        return f;
                    }, [])
                    .sort(function(a, b) {
                        return a[0] === b[0] ? 0 : (a[0] < b[0] ? -1 : 1);
                    })
                    .reduce(function(f, a) {
                        if (f.length && (f[f.length-1][0] === a[0])) f[f.length-1][1] = f[f.length-1][1].add(a[1]);
                        else f.push(a);
                        return f;
                    }, [])
                    .filter(function(a) {
                        return !a[1].equ(0);
                    }));
                    if (f.length) self._terms[f.map(function(a) {return String(a[0]) + (a[1].gt(1) ? ('^'+String(a[1])) : '');}).join('*')] = {e:Expr('*', f.map(function(a) {return Expr('^', a);}).concat(c)), c:c};
                }
                else if ('/' === ast.op)
                {
                    var c = I;
                    var f = (ast.arg.reduce(function(f, e, i) {
                        if (0 === i)
                        {
                            if ('sym' === e.ast.type)
                            {
                                f.push([e, I]);
                            }
                            else if (('^' === e.ast.op) && ('sym' === e.ast.arg[0].type))
                            {
                                f.push([e.ast.arg[0].arg, e.ast.arg[1].c()]);
                            }
                            else if (e.isConst())
                            {
                                c = c.mul(e.c());
                            }
                        }
                        else if (e.isConst())
                        {
                            c = c.div(e.c());
                        }
                        return f;
                    }, [])
                    .sort(function(a, b) {
                        return a[0] === b[0] ? 0 : (a[0] < b[0] ? -1 : 1);
                    })
                    .reduce(function(f, a) {
                        if (f.length && (f[f.length-1][0] === a[0])) f[f.length-1][1] = f[f.length-1][1].add(a[1]);
                        else f.push(a);
                        return f;
                    }, [])
                    .filter(function(a) {
                        return !a[1].equ(0);
                    }));
                    if (f.length) self._terms[f.map(function(a) {return String(a[0]) + (a[1].gt(1) ? ('^'+String(a[1])) : '');}).join('*')] = {e:Expr('*', f.map(function(a) {return Expr('^', a);}).concat(c)), c:c};
                }
                else if ('^' === ast.op)
                {
                    if (('sym' === ast.arg[0].type) && ast.arg[1].isInt())
                    {
                        self._terms[ast.arg[0].arg + (ast.arg[1].gt(1) ? ('^'+String(ast.arg[1])) : '')] = {e:self, c:I};
                    }
                }
            }
        }

        if (null == t) return self._terms;

        t = String(t);
        return HAS.call(self._terms, t) ? self._terms[t] : {e:Expr.Zero(), c:O};
    }

    ,isSimple: function() {
        var ast = this.ast, O, I, J, nontrivial;
        if ('sym' === ast.type)
        {
            return true;
        }
        else if ('num' === ast.type)
        {
            return true; //ast.arg.isReal() || ast.arg.isImag(); // complex numbers are not simple
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
    ,isSymbol: function() {
        return 'sym' === this.ast.type;
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
    ,isComplex: function() {
        var ast = this.ast;
        if ('expr' === ast.type)
        {
            for (var i=0,n=ast.arg.length; i<n; ++i)
            {
                if (ast.arg[i].isComplex()) return true;
            }
        }
        else if ('num' === ast.type)
        {
            return is_instance(ast.arg, Complex);
        }
        return false;
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
        var self = this, ast = self.ast, I = Rational.One();
        if (null == self._f)
        {
            // factors including constant term
            if ('sym' === ast.type)
            {
                self._f = {c:I, f:[self]};
            }
            else if (self.isConst())
            {
                self._f = {c:self.c(), f:[Expr.One()]};
            }
            else if ('*' === ast.op)
            {
                self._f = ast.arg.reduce(function(f, e) {
                    f.c = f.c.mul(e.f().c);
                    f.f.push.apply(f.f, e.f().f);
                    return f;
                }, {c:I, f:[]});
            }
            else if ('/' === ast.op)
            {
                self._f = ast.arg.reduce(function(f, e, i) {
                    f.c = f.c.mul(0 < i ? e.f().c.inv() : e.f().c);
                    f.f.push.apply(f.f, 0 < i ? e.f().f.map(function(e) {return e.inv();}) : e.f().f);
                    return f;
                }, {c:I, f:[]});
            }
            else if ('^' === ast.op)
            {
                if (ast.arg[1].isInt())
                {
                    var f = ast.arg[0].f(), e = ast.arg[1].c();
                    self._f = {c:e.lt(0) ? f.c.inv().pow(e.neg()) : f.c.pow(e), f:f.f.map(function(f) {return Expr('^', [f, e]);})};
                }
                else
                {
                    self._f = {c:I, f:[self]};
                }
            }
            else
            {
                self._f = {c:I, f:[self]};
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
        var self = this, ast = self.ast;
        if (self.isConst())
        {
            return Expr('', self.c().neg());
        }
        if (('-' === ast.op) && ast.arg[0].equ(Expr.Zero()))
        {
            return ast.arg.slice(1).reduce(function(res, f) {return res.add(f);}, ast.arg[0]);
        }
        if ('*' === ast.op)
        {
            return self.f().f.reduce(function(res, f) {return res.mul(f);}, Expr('', self.f().c.neg()));
        }
        return Expr.MinusOne().mul(self);
    }
    ,inv: function() {
        var self = this;
        return self.isConst() ? Expr('', self.c().inv()) : self.den.div(self.num);
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (('sym' === self.ast.type) && ('sym' === other.ast.type))
            {
                return self.ast.arg === other.ast.arg; // symbol and symbol match
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().equ(other.c());
            }
            /*else if (self.isConst() || other.isConst())
            {
                return false; // const and symbol are not comparable
            }*/
            else
            {
                /*
                var s1 = self.symbols(), l1 = s1.length, s2 = other.symbols(), l2 = s2.length, i;
                for (i=0; (i < l1) && (i < l2) && (s1[i] === s2[i]); ++i)
                if (i < l1 || i < l2) return false; // symbols dont match
                */
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
                return false; // symbol and symbol are not comparable
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().gt(other.c());
            }
            /*else if (self.isConst() || other.isConst())
            {
                return false; // const and symbol are not comparable
            }*/
            else if ('expr' === other.ast.type)
            {
                return self.sub(other).expand().gt(Expr.Zero());
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
                return false; // symbol and symbol are not comparable
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().gte(other.c());
            }
            /*else if (self.isConst() || other.isConst())
            {
                return false; // const and symbol are not comparable
            }*/
            else if ('expr' === other.ast.type)
            {
                return self.sub(other).expand().gte(Expr.Zero());
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
                return false; // symbol and symbol are not comparable
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().lt(other.c());
            }
            /*else if (self.isConst() || other.isConst())
            {
                return false; // const and symbol are not comparable
            }*/
            else if ('expr' === other.ast.type)
            {
                return self.sub(other).expand().lt(Expr.Zero());
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
                return false; // symbol and symbol are not comparable
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().lte(other.c());
            }
            /*else if (self.isConst() || other.isConst())
            {
                return false; // const and symbol are not comparable
            }*/
            else if ('expr' === other.ast.type)
            {
                return self.sub(other).expand().lte(Expr.Zero());
            }
        }
        return false;
    }

    ,add: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            O = Expr.Zero();
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().add(other.c()));
            }
            else if (other.equ(O))
            {
                return self;
            }
            else if (self.equ(O))
            {
                return other;
            }
            return Expr('+', [self, other]);
        }
        return self;
    }
    ,sub: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            O = Expr.Zero();
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().sub(other.c()));
            }
            else if (other.equ(O))
            {
                return self;
            }
            else if (self.equ(O))
            {
                return other.neg();
            }
            return Expr('-', [self, other]);
        }
        return self;
    }
    ,mul: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O, I;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            O = Expr.Zero(); I = Expr.One();
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().mul(other.c()));
            }
            else if (other.equ(O) || self.equ(O))
            {
                return O;
            }
            else if (other.equ(I))
            {
                return self;
            }
            else if (self.equ(I))
            {
                return other;
            }
            return Expr('*', [self, other]);
        }
        return self;
    }
    ,div: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (self.isConst() && other.isConst())
            {
                return Expr('', self.c().div(other.c()));
            }
            else if (other.equ(Expr.One()))
            {
                return self;
            }
            return Expr('/', [self, other]);
        }
        return self;
    }
    ,mod: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (!is_instance(other, Expr)) return self;
        return self.isConst() && other.isConst() ? Expr('', self.c().mod(other.c())) : Expr('mod()', [self, other]);
    }
    ,divmod: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (!is_instance(other, Expr)) return [self, self];
        return [self.div(other), self.mod(other)];
    }
    ,divides: function(other) {
        return !this.equ(Expr.Zero());
    }
    ,pow: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic, O, I;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if (other.isInt())
            {
                O = Expr.Zero(); I = Expr.One();
                if (self.isConst())
                {
                    return Expr('', other.c().lt(Arithmetic.O) ? (self.c().inv().pow(other.c().neg())) : (self.c().pow(other.c())));
                }
                else if (other.equ(I))
                {
                    return self;
                }
                /*else if (other.equ(O))
                {
                    return I;
                }*/
            }
            return Expr('^', [self, other]);
        }
        return self;
    }
    ,rad: function(other) {
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
                else
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
            if (is_instance(g, Expr) || is_string(g))
            {
                x = String(x);
                if (('sym' === f.ast.type) && (f.ast.arg === x))
                {
                    // substitute x -> g()
                    return is_string(g) ? Expr('', g) : g;
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
                return is_instance(symbolValue[ast.arg], [Rational, Complex]) ? symbolValue[ast.arg] : Rational.cast(symbolValue[ast.arg] || 0);
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
        var self = this, O = Expr.Zero(), I = Expr.One(), J = Expr.MinusOne();

        function expand(expr)
        {
            switch (expr.ast.op)
            {
                case '':
                    return expr.clone();
                case '+':
                    return expr.ast.arg.reduce(function(a, b) {
                        return add(a, expand(b));
                    }, O);
                case '-':
                    return expr.ast.arg.reduce(function(a, b, i) {
                        return add(a, expand(b), 0 < i);
                    }, O);
                case '*':
                    return expr.ast.arg.reduce(function(a, b) {
                        return mul(a, expand(b));
                    }, I);
                case '/':
                    return expr.ast.arg.reduce(function(a, b, i) {
                        return mul(a, expand(b), 0 < i);
                    }, I);
                case '^':
                    return pow(expand(expr.ast.arg[0]), expand(expr.ast.arg[1]));
                default:
                    if (('min()' === expr.ast.op) || ('max()' === expr.ast.op))
                    {
                        // expand and remove duplicates
                        var hash = expr.ast.arg.reduce(function(hash, subexpr) {
                            subexpr = subexpr.expand();
                            hash[key(subexpr)] = subexpr;
                            return hash;
                        }, {});
                        return Expr(expr.ast.op, KEYS(hash).map(function(key) {return hash[key];}));
                    }
                    // by default expand only the arguments
                    return Expr(expr.ast.op, expr.ast.arg.map(expand));
            }
        }
        function add(e1, e2, do_subtraction)
        {
            function terms(e)
            {
                var f = e.f().f.filter(function(f) {return !f.equ(I);}).sort(cmp);
                return {c:e.f().c, f:f, k:f.map(key).join('*')};
            }

            var o = Abacus.Arithmetic.O,
                a = ('+' === e1.ast.op ? e1.ast.arg : [e1]).map(terms).sort(cmp),
                b = ('+' === e2.ast.op ? e2.ast.arg : [e2]).map(terms).sort(cmp),
                c = merge_sequences(
                    a, b,
                    function(a, b) {
                        if (null == b)
                        {
                            return a.c.equ(o) ? null : a;
                        }
                        else if (null == a)
                        {
                            if (do_subtraction) b.c = b.c.neg();
                            return b.c.equ(o) ? null : b;
                        }
                        else
                        {
                            a.c = do_subtraction ? a.c.sub(b.c) : a.c.add(b.c);
                            return a.c.equ(o) ? null : a;
                        }
                    },
                    cmp
                )
            ;

            var res = c.length ? Expr('+', c.map(function(f) {return Expr('*', [f.c].concat(f.f));})) : O;
            return res;
        }
        function mul(e1, e2, do_division)
        {
            if (('+' === e1.ast.op) || ('-' === e1.ast.op))
            {
                return e1.ast.arg.reduce(function(res, f, i) {
                    return add(res, mul(f, e2, do_division), ('-' === e1.ast.op) && (0 < i));
                }, O);
            }
            if (!do_division && (('+' === e2.ast.op) || ('-' === e2.ast.op)))
            {
                return e2.ast.arg.reduce(function(res, f, i) {
                    return add(res, mul(e1, f), ('-' === e2.ast.op) && (0 < i));
                }, O);
            }

            function factors(e, do_div)
            {
                fac = null == fac ? e.f().c : (do_div ? fac.div(e.f().c) : fac.mul(e.f().c));
                var f = e.f().f.filter(function(f) {return !f.equ(I);});
                return f.map(function(f) {return '^' === f.ast.op ? {b:f.ast.arg[0], e:f.ast.arg[1]} : {b:f, e:I};});
            }
            function merge(res, f)
            {
                if (res.length && (key(res[res.length-1].b) === key(f.b)))
                {
                    res[res.length-1].e = res[res.length-1].e.add(f.e);
                }
                else
                {
                    res.push(f);
                }
                return res;
            }

            var fac = null, a, b, c;

            a = flatten(('*' === e1.ast.op ? e1.ast.arg : [e1]).map(function(e) {return factors(e, false);}));
            b = flatten(('*' === e2.ast.op ? e2.ast.arg : [e2]).map(function(e) {return factors(e, do_division);}));

            if (fac.equ(0)) return O;

            c = merge_sequences(
                a.sort(cmp).reduce(merge, []),
                b.sort(cmp).reduce(merge, []),
                function(a, b) {
                    if (null == b)
                    {
                        return a;
                    }
                    else if (null == a)
                    {
                        if (do_division) b.e = b.e.neg();
                        return b;
                    }
                    else
                    {
                        a.e = do_division ? a.e.sub(b.e) : a.e.add(b.e);
                        return a;
                    }
                },
                cmp
            );

            var res = c.length ? Expr('*', [fac].concat(c.map(function(f) {return f.e.equ(I) ? f.b : (f.e.equ(J) ? f.b.inv() : (f.e.isConst() && f.e.c().lt(0) ? f.b.inv().pow(f.e.neg()) : f.b.pow(f.e)));}))) : Expr('', fac);
            return res;
        }
        function pow(e1, e2)
        {
            if (('*' === e1.ast.op) || ('/' === e1.ast.op))
            {
                return e1.ast.arg.reduce(function(res, f, i) {
                    return mul(res, pow(f, e2), ('/' === e1.ast.op) && (0 < i));
                }, I);
            }

            var base = e1, exp = e2;

            while ('^' === base.ast.op)
            {
                exp = expand(exp.mul(base.ast.arg[1]));
                base = base.ast.arg[0];
            }

            if (exp.isInt())
            {
                if (base.isSymbol())
                {
                    return Expr('^', [base, exp]);
                }
                else if (base.isConst())
                {
                    return Expr('', base.c().pow(exp.c().real()));
                }
                else
                {
                    return expand(npow(base, exp.c().real().integer(true)));
                }
            }
            return base.pow(exp);
        }
        function key(expr)
        {
            return expr.toString();
        }
        function cmp(t1, t2)
        {
            var k1, k2;
            if (is_string(t1.k) && is_string(t2.k))
            {
                k1 = t1.k;
                k2 = t2.k;
            }
            else if (is_instance(t1.b, Expr) && is_instance(t2.b, Expr))
            {
                k1 = key(t1.b);
                k2 = key(t2.b);
            }
            else
            {
                k1 = key(t1);
                k2 = key(t2);
            }
            return k1 === k2 ? 0 : (k1 < k2 ? -1 : 1);
        }

        if (null == self._xpnd) self._xpnd = expand(self);

        return self._xpnd;
    }
    ,toPoly: function(symbol, ring, imagUnit) {
        var self = this, other_symbols = null, CoefficientRing = null, PolynomialClass;

        if (is_instance(ring, Ring) && !is_class(ring.NumberClass, Complex))
        {
            imagUnit = null; // ring does not support Complex
        }
        if (!symbol)
        {
            symbol = self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s);});
            //if (!symbol.length) symbol = ['x'];
        }
        ring = is_instance(ring, Ring) ? ring : ((-1 !== self.symbols().indexOf(imagUnit)) || self.isComplex() ? Ring.C() : Ring.Q());
        if (ring.CoefficientRing && ring.CoefficientRing.PolynomialClass)
        {
            if (!is_array(symbol)) symbol = [symbol];
            symbol = symbol.filter(function(s) {return -1 !== ring.CoefficientRing.PolynomialSymbol.indexOf(s);}); //hmm..?
            if (!symbol.length) symbol = ring.PolynomialSymbol.slice(); // needed
        }
        other_symbols = is_array(symbol) ? self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s) && (-1 === symbol.indexOf(s));}) : self.symbols().filter(function(s) {return ((!imagUnit) || (imagUnit !== s)) && ('1' !== s) && (s !== symbol);});
        if (ring.PolynomialClass)
        {
            CoefficientRing = ring;
        }
        else
        {
            CoefficientRing = other_symbols.length ? Ring(ring.NumberClass, other_symbols, true) : ring;
        }
        PolynomialClass = is_array(symbol) ? MultiPolynomial : Polynomial;

        function poly(expr, symbol, ring, CoefficientRing)
        {
            function get_term(arg, is_own_symbol)
            {
                var term = {}, coeff_term = null;
                if (is_string(arg))
                {
                    if (is_own_symbol)
                    {
                        // polynomial symbol
                        term[arg] = CoefficientRing.One();
                    }
                    else if (ring.PolynomialClass)
                    {
                        coeff_term = {};
                        if (-1 === ring.PolynomialSymbol.indexOf(arg))
                        {
                            // other symbolic term of recursive coeff ring, delegate further
                            coeff_term['1'] = ring.CoefficientRing.fromString(arg);
                        }
                        else
                        {
                            // symbolic term of recursive coeff ring
                            coeff_term[arg] = ring.CoefficientRing.One();
                        }
                        term['1'] = MultiPolynomial(coeff_term, ring.PolynomialSymbol.slice(), ring.CoefficientRing);
                    }
                    else
                    {
                        // symbolic rational constant suitable as polynomial coefficient
                        coeff_term = {};
                        coeff_term[arg] = ring.One();
                        term['1'] = RationalFunc(MultiPolynomial(coeff_term, other_symbols, ring), null, null, null, true);
                    }
                }
                else //if (is_instance(arg, Numeric))
                {
                    term['1'] = arg;
                }
                return PolynomialClass(term, symbol, CoefficientRing);
            }
            function is_const(expr)
            {
                return 0 === expr.symbols().filter(is_array(symbol) ? function(s) {return -1 !== symbol.indexOf(s);} : function(s) {return s === symbol;}).length;
            }
            var ast = expr.ast, term, coeff, exp;

            if ('sym' === ast.type)
            {
                if (imagUnit === ast.arg)
                {
                    // complex imaginary constant
                    return get_term(Complex.Img());
                }
                else
                {
                    // polynomial symbol or other symbol as coefficient
                    return get_term(ast.arg, (is_array(symbol) && (-1 !== symbol.indexOf(ast.arg))) || (is_string(symbol) && (symbol === ast.arg)));
                }
            }
            else if (expr.isConst())
            {
                // constant
                return get_term(expr.c());
            }
            else //if ('expr' === ast.type)
            {
                if (('+' === ast.op) || ('-' === ast.op) || ('*' === ast.op))
                {
                    // combine subexpression polynomials
                    return ast.arg.reduce(function(result, subexpr, i) {
                        if (0 === i)
                        {
                            return poly(subexpr, symbol, ring, CoefficientRing);
                        }
                        else if (null == result)
                        {
                            return result;
                        }
                        else
                        {
                            subexpr = poly(subexpr, symbol, ring, CoefficientRing);
                            return null == subexpr ? null : ('*' === ast.op ? result._mul(subexpr) : ('-' === ast.op ? result._sub(subexpr): result._add(subexpr)));
                        }
                    }, null);
                }
                else if ('/' === ast.op)
                {
                    // combine subexpression polynomials
                    return ast.arg.reduce(function(result, subexpr, i) {
                        if (0 === i)
                        {
                            return poly(subexpr, symbol, ring, CoefficientRing);
                        }
                        else if (null == result)
                        {
                            return result;
                        }
                        else if (is_const(subexpr.num))
                        {
                            var coeff;
                            if (ring.PolynomialClass)
                            {
                                if (subexpr.num.isConst())
                                {
                                    coeff = subexpr.num.c().inv();
                                }
                                else if (!is_class(ring.PolynomialClass, RationalFunc))
                                {
                                    return null; // not supported
                                }
                                else
                                {
                                    coeff = poly(subexpr.num, ring.PolynomialSymbol, ring.CoefficientRing, CoefficientRing.CoefficientRing);
                                    if (null == coeff) return null;
                                    coeff = RationalFunc(MultiPolynomial.One(ring.PolynomialSymbol, ring.CoefficientRing), coeff, null, null, true);
                                }
                            }
                            else
                            {
                                coeff = subexpr.num.toPoly(other_symbols, ring, imagUnit);
                                if (null == coeff) return null;
                                coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), coeff, null, null, true);
                            }
                            subexpr = poly(subexpr.den, symbol, ring, CoefficientRing);
                            return null == subexpr ? null : result._mul(subexpr.mul(PolynomialClass.Const(coeff, symbol, CoefficientRing)));
                        }
                        else
                        {
                            // is not a polynomial
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
                        return PolynomialClass.One(symbol, CoefficientRing);
                    }
                    if (exp.lt(0))
                    {
                        exp = exp.neg();
                        coeff = null;
                        if (is_const(ast.arg[0].num))
                        {
                            if (ring.PolynomialClass)
                            {
                                if (ast.arg[0].num.isConst())
                                {
                                    coeff = MultiPolynomial({'1':ast.arg[0].num.c().inv()}, ring.PolynomialSymbol, ring.CoefficientRing);
                                }
                                else if (!is_class(ring.PolynomialClass, RationalFunc))
                                {
                                    return null; // not supported
                                }
                                else
                                {
                                    term = poly(ast.arg[0].num, ring.PolynomialSymbol, ring.CoefficientRing, CoefficientRing.CoefficientRing);
                                    if (null != term) coeff = RationalFunc(MultiPolynomial.One(ring.PolynomialSymbol, ring.CoefficientRing), term, null, null, true);
                                }
                            }
                            else
                            {
                                term = ast.arg[0].num.toPoly(other_symbols, ring, imagUnit);
                                if (null != term) coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), term, null, null, true);
                            }
                            if (null != coeff)
                            {
                                term = poly(ast.arg[0].den, symbol, ring, CoefficientRing);
                                if (null != term)
                                {
                                    term = term._mul(PolynomialClass.Const(coeff, symbol, CoefficientRing));
                                }
                            }
                        }
                    }
                    else //if (exp.gt(0))
                    {
                        term = poly(ast.arg[0], symbol, ring, CoefficientRing);
                    }
                    return null == term ? null : term._pow(exp);
                }
                else
                {
                    // is not a polynomial
                    return null;
                }
            }
        }
        return poly(self, symbol, ring, CoefficientRing);
    }
    ,toRationalFunc: function() {
        var self = this,
            num = self.num.toPoly(self.symbols()),
            den = num ? self.den.toPoly(num.symbol) : null
        ;
        return num && den ? RationalFunc(num, den) : null;
    }
    ,toString: function(type) {
        var self = this, ast = self.ast,
            op = ast.op, arg = ast.arg,
            str, str2, sign, sign2, _str;

        function needs_parentheses(expr)
        {
            return !(expr.isSimple() && (expr.c().isReal() || expr.c().isImag()/*complex numbers excluded*/) || ('^' === expr.ast.op) || ('()' === expr.ast.op.slice(-2)));
        }

        type = String(type || '').toLowerCase();

        if ('asciimath' === type)
        {
            _str = self._str;
            self._str = null;
        }
        if (null == self._str)
        {
            if ('' === op)
            {
                // symbol or number
                self._str = String(arg);
            }
            else if (self.isConst())
            {
                // constant
                self._str = self.c().toString();
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
                        else if (('asciimath' === type) && (arg[1].num.equ(1) && arg[1].den.isInt() && arg[1].den.c().gt(1)))
                        {
                            // radical sqrt
                            self._str = (arg[1].den.c().equ(2) ? 'sqrt ' : ('root(' + arg[1].den.c().toString() + ')')) + '(' + str + ')';
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
                        sign = '';
                        self._str = arg.reduce(function(out, subexpr) {
                            var str = trim(subexpr.toString()), isNeg, strp;
                            if (('*' === op) && (('0' === str) || ('0' === out[0]))) return ['0'];
                            if (('*' === op) && ('1' === str)) return out;
                            if (('*' === op) && ('-1' === str))
                            {
                                sign = '-' === sign ? '' : '-';
                                return out;
                            }
                            if ((('+' === op) || ('-' === op)) && ('0' === str)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === str.charAt(0);
                                strp = isNeg ? trim(str.slice(1)) : str;
                                if ('*' === op) out.push('*'/*'⋅'*/);
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? ((('*' === subexpr.ast.op) || !needs_parentheses(subexpr)) && !isNeg ? str : ('(' + str + ')')) : strp);
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
                            self._str[0] = (('*' === op) && (op === self._str[0].ast.op)) || !needs_parentheses(self._str[0]) ? str : ('(' + str + ')');
                        }
                        self._str = self._str.join('');
                        if (!self._str.length) self._str = '*' === op ? '1' : '0';
                        if ('-' === sign)
                        {
                            if ('-' === self._str.charAt(0)) self._str = self._str.slice(1);
                            else self._str = sign + self._str;
                        }
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
        if ('asciimath' === type)
        {
            str = self._str;
            self._str = _str;
            return str;
        }
        return self._str;
    }
    ,toTex: function() {
        var self = this, ast = self.ast, op = ast.op, arg = ast.arg, tex, tex2, sign, sign2;

        function needs_parentheses(expr)
        {
            return !(expr.isSimple() && (expr.c().isReal() || expr.c().isImag()/*complex numbers excluded*/) || ('^' === expr.ast.op) || ('()' === expr.ast.op.slice(-2)));
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
            else if (self.isConst())
            {
                // constant
                self._tex = self.c().toTex();
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
                        sign = '';
                        self._tex = arg.reduce(function(out, subexpr) {
                            var tex = trim(subexpr.toTex()), isNeg, texp;
                            if (('*' === op) && (('0' === tex) || ('0' === out[0]))) return ['0'];
                            if (('*' === op) && ('1' === tex)) return out;
                            if (('*' === op) && ('-1' === tex))
                            {
                                sign = '-' === sign ? '' : '-';
                                return out;
                            }
                            if ((('+' === op) || ('-' === op)) && ('0' === tex)) return out;
                            if (0 < out.length)
                            {
                                isNeg = '-' === tex.charAt(0);
                                texp = isNeg ? trim(tex.slice(1)) : tex;
                                if ('*' === op) out.push(/*' \\cdot '*/'');
                                else if ('+' === op) out.push(isNeg ? ' - ' : ' + ');
                                else if ('-' === op) out.push(isNeg ? ' + ' : ' - ');
                                out.push('*' === op ? ((('*' === subexpr.ast.op) || !needs_parentheses(subexpr)) && !isNeg ? tex : ('\\left(' + tex + '\\right)')) : texp);
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
                            self._tex[0] = (('*' === op) && (op === self._tex[0].ast.op)) || !needs_parentheses(self._tex[0]) ? tex : ('\\left(' + tex + '\\right)');
                        }
                        self._tex = self._tex.join('');
                        if (!self._tex.length) self._tex = '*' === op ? '1' : '0';
                        if ('-' === sign)
                        {
                            if ('-' === self._tex.charAt(0)) self._tex = self._tex.slice(1);
                            else self._tex = sign + self._tex;
                        }
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
    ,valueOf: function() {
        return (arguments.length ? this.evaluate(arguments[0]) : this.c()).valueOf();
    }
});
Expr.cast = typecast([Expr], function(a) {
    return is_string(a) ? Expr.fromString(a) : (is_callable(a.toExpr) ? a.toExpr() : Expr('', a));
});
