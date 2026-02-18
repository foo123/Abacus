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
                    if (is_string(arg) || is_instance(arg, [Rational, Complex])) arg = new Expr('', arg);
                    else if (is_number(arg)) arg = new Expr('', Rational.fromDec(arg));
                    else if (is_instance(arg, Numeric) || Arithmetic.isNumber(arg)) arg = new Expr('', new Rational(arg));
                    else if (!is_instance(arg, Expr) && is_callable(arg.toExpr)) arg = arg.toExpr();
                    if (is_instance(arg, Expr)) args.push(arg);
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
                return self.toRationalExpr().ast.arg[0];
            },
            set: NOP,
            enumerable: true,
            configurable: false
        });
        def(self, 'den', {
            get: function() {
                return self.toRationalExpr().ast.arg[1];
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
             // recognized but
             // left to user to specify their computation
              'exp()': {
                fn: null
             }
             ,'log()': {
                fn: null
             }
             ,'cos()': {
                fn: null
             }
             ,'sin()': {
                fn: null
             }
             ,'tan()': {
                fn: null
             }
             ,'acos()': {
                fn: null
             }
             ,'asin()': {
                fn: null
             }
             ,'atan()': {
                fn: null
             }
             ,'cosh()': {
                fn: null
             }
             ,'sinh()': {
                fn: null
             }
             ,'tanh()': {
                fn: null
             }
             ,'acosh()': {
                fn: null
             }
             ,'asinh()': {
                fn: null
             }
             ,'atanh()': {
                fn: null
             }
             ,'sqrt()': {
                fn: function(args) {
                    return Expr.FN['^'].fn([args[0], , Rational(1, args[1] || 2, true)]);
                }
             }
             ,'abs()': {
                exact: true,
                fn: function(args) {
                    return args[0].abs();
                }
             }
             ,'mod()': {
                exact: true,
                fn: function(args) {
                    return args[0].mod(args[1]);
                }
             }
             ,'min()': {
                exact: true,
                fn: function(args) {
                    return nmin(args);
                }
             }
             ,'max()': {
                exact: true,
                fn: function(args) {
                    return nmax(args);
                }
             }
             ,'^': {
                fn: function(args) {
                    return !args[1].isInt() && args[1].inv().isInt() ? (args[0].rad(args[1].inv())) : (args[0].pow(args[1]));
                }
             }
             ,'/': {
                exact: true,
                fn: function(args) {
                    return ndiv(args);
                }
             }
             ,'*': {
                exact: true,
                fn: function(args) {
                    return nmul(args);
                }
             }
             ,'-': {
                exact: true,
                fn: function(args) {
                    return nsub(args);
                }
             }
             ,'+': {
                exact: true,
                fn: function(args) {
                    return nadd(args);
                }
             }
             ,'>=': {
                exact: true,
                fn: function(args) {
                    return args[0].gte(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'<=': {
                exact: true,
                fn: function(args) {
                    return args[0].lte(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'>': {
                exact: true,
                fn: function(args) {
                    return args[0].gt(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'<': {
                exact: true,
                fn: function(args) {
                    return args[0].lt(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'!=': {
                exact: true,
                fn: function(args) {
                    return !args[0].equ(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'=': {
                exact: true,
                fn: function(args) {
                    return args[0].equ(args[1]) ? Rational.One() : Rational.Zero();
                }
             }
             ,'and': {
                exact: true,
                fn: function(args) {
                    for (var i=0,n=args.length; i<n; ++i)
                    {
                        if (args[i].equ(0)) return Rational.Zero(); // false
                    }
                    return args[n-1]; // last true arg
                }
             }
             ,'or': {
                exact: true,
                fn: function(args) {
                    for (var i=0,n=args.length; i<n; ++i)
                    {
                        if (!args[i].equ(0)) return args[i]; // first true arg
                    }
                    return Rational.Zero(); // false
                }
             }
             ,'not': {
                exact: true,
                fn: function(args) {
                    return args[0].equ(0) ? Rational.One() : Rational.Zero();
                }
             }
        }
        ,OP: {
            '^': {
             name         : 'pow'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: RIGHT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 11
            ,fn           : function(args) {
                                return args[0].pow(args[1]);
                            }
            },
            '/': {
             name         : 'div'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 20
            ,fn           : function(args) {
                                return ndiv(args);
                            }
            },
            '*': {
             name         : 'mul'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 20
            ,fn           : function(args) {
                                return nmul(args);
                            }
            },
            '+': {
             name         : 'add'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 25
            ,fn           : function(args) {
                                return nadd(args);
                            }
            },
            '-': {
             name         : 'sub'
            ,arity        : 2
            ,arityalt     : 1
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: ANTICOMMUTATIVE
            ,priority     : 25
            ,fn           : function(args) {
                                return 1 === args.length ? args[0].neg() : nsub(args);
                            }
            },
            '>=': {
             name         : 'ge'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 35
            ,fn           : function(args) {
                                return Expr('>=', args);
                            }
            },
            '<=': {
             name         : 'le'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 35
            ,fn           : function(args) {
                                return Expr('<=', args);
                            }
            },
            '>': {
             name         : 'gt'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 35
            ,fn           : function(args) {
                                return Expr('>', args);
                            }
            },
            '<': {
             name         : 'lt'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: NONCOMMUTATIVE
            ,priority     : 35
            ,fn           : function(args) {
                                return Expr('<', args);
                            }
            },
            '!=': {
             name         : 'ne'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 40
            ,fn           : function(args) {
                                return Expr('!=', args);
                            }
            },
            '=': {
             name         : 'eq'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 40
            ,fn           : function(args) {
                                return Expr('=', args);
                            }
            },
            'and': {
             name         : 'land'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 32
            ,fn           : function(args) {
                                return Expr('and', args);
                            }
            },
            'or': {
             name         : 'lor'
            ,arity        : 2
            ,fixity       : INFIX
            ,associativity: LEFT
            ,commutativity: COMMUTATIVE
            ,priority     : 33
            ,fn           : function(args) {
                                return Expr('or', args);
                            }
            },
            'not': {
             name         : 'lnot'
            ,arity        : 1
            ,fixity       : PREFIX
            ,associativity: LEFT
            ,commutativity: ANTICOMMUTATIVE
            ,priority     : 31
            ,fn           : function(args) {
                                return Expr('not', [args[0]]);
                            }
            }
        }
        ,Alias: [
            {token:'\\left(',  alias:'('},
            {token:'\\right)', alias:')'}
        ]

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
                // adapted from https://github.com/foo123/Xpresion
                // parse only the necessary subset of simple string, asciimath and/or tex notation
                // https://asciimath.org/
                // https://the0cp.cc/posts/mathjax/
                // https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference
                var match, m, n, c, i0, j, k, flag,
                    op, term, arg, prev_term = false,
                    terms = [], ops = [];
                function eat(pattern, group)
                {
                    var match = pattern.test ? s.match(pattern) : (pattern === s.slice(0, pattern.length)), offset;
                    if (match)
                    {
                        if (false === group)
                        {
                            return pattern.test ? match : [pattern, pattern];
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

                            if (opc2.arity > terms.length)
                            {
                                if ((null != opc2.arityalt) && (opc2.arityalt <= terms.length))
                                {
                                    args = terms.splice(0, opc2.arityalt).reverse();
                                }
                                else
                                {
                                    throw error('Invalid or missing argument for "'+op2+'"', o2[1]);
                                }
                            }
                            else
                            {
                                args = terms.splice(0, opc2.arity).reverse();
                            }
                            result = opc2.fn(args);
                            if (null != result) terms.unshift(result);
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
                            if (opc.arity > terms.length)
                            {
                                if ((null != opc.arityalt) && (opc.arityalt <= terms.length))
                                {
                                    args = terms.splice(0, opc.arityalt).reverse();
                                }
                                else
                                {
                                    throw error('Invalid or missing argument for "'+op+'"', o[1]);
                                }
                            }
                            else
                            {
                                args = terms.splice(0, opc.arity).reverse();
                            }
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
                                    LEFT === opc2.associativity))))
                                )
                                {
                                    if (opc2.arity > terms.length)
                                    {
                                        if ((null != opc2.arityalt) && (opc2.arityalt <= terms.length))
                                        {
                                            args = terms.splice(0, opc2.arityalt).reverse();
                                        }
                                        else
                                        {
                                            throw error('Invalid or missing argument for "'+op2+'"', o2[1]);
                                        }
                                    }
                                    else
                                    {
                                        args = terms.splice(0, opc2.arity).reverse();
                                    }
                                    result = opc2.fn(args);
                                    if (null != result) terms.unshift(result);
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

                    // take care of aliases
                    flag = false;
                    for (j=0,k=Expr.Alias.length; j<k; ++j)
                    {
                        if (eat(Expr.Alias[j].token, false))
                        {
                            // token -> alias
                            s = Expr.Alias[j].alias + s.slice(Expr.Alias[j].token.length);
                            i += Expr.Alias[j].token.length - Expr.Alias[j].alias.length;
                            flag = true;
                            break;
                        }
                    }
                    if (flag) continue;

                    i0 = i;
                    if (match = eat(/^(\\lnot|\\land|\\lor|\\neg|not|and|or)[^a-z]/i, 1))
                    {
                        // logical op
                        op = match[1].toLowerCase();
                        if ('\\lnot' === op || '\\neg' === op) op = 'not';
                        else if ('\\land' === op) op = 'and';
                        else if ('\\lor' === op) op = 'or';
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (match = eat(/^(&&|\|\||!)[^&\|]/i, 1))
                    {
                        // alternative logical op
                        op = match[1];
                        if ('&&' === op) op = 'and';
                        else if ('||' === op) op = 'or';
                        else op = 'not';
                        ops.unshift([op, i0]);
                        merge();
                        prev_term = false;
                        continue;
                    }
                    if (match = eat(/^(\\neq|\\gte|\\geq|\\lte|\\leq|\\gt|\\ge|\\lt|\\le|\\ne|\\eq)[^a-z]/i, 1))
                    {
                        // relational op
                        op = match[1].toLowerCase();
                        if ('\\neq' === op || '\\ne' === op) op = '!=';
                        else if ('\\gte' === op || '\\geq' === op || '\\ge' === op) op = '>=';
                        else if ('\\lte' === op || '\\leq' === op || '\\le' === op) op = '<=';
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
                    if (eat(/^\\frac/))
                    {
                        // fraction
                        arg = [null, null];
                        if (match = eat(/^\s+(\d)(\d)/))
                        {
                            arg[0] = Expr('', +match[1]);
                            arg[1] = Expr('', +match[2]);
                        }
                        else
                        {
                            if (!eat('{')) throw error('Missing "{" in "\\frac"', i0);
                            if (!(arg[0] = parse_until('}'))) throw error('Missing or invalid numerator in "\\frac"', i0);
                            if (!eat('{')) throw error('Missing "{" in "\\frac"', i0);
                            if (!(arg[1] = parse_until('}'))) throw error('Missing or invalid denumerator in "\\frac"', i0);
                        }
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
                            if (match = eat(/^-?\d+/))
                            {
                                // number
                                term = Expr('', Rational.fromDec(match[0]));
                            }
                            else if (match = eat(/^[a-z]((_[a-z0-9])|(_\{[a-z0-9]+\}))?/i))
                            {
                                // symbol
                                m = match[0];
                                if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                                if ('}' === m.slice(-1)) m = m.slice(0, -1);
                                term = Expr('', m);
                            }
                            else
                            {
                                throw error('Missing or invalid exponent in "^"', i0);
                            }
                        }
                        ops.unshift([op, i0]);
                        merge();
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if ((match = eat(/^\\?(sqrt)\s*\[(\d+)\]\s*([\(\{])/i, false)) || (match = eat(/^(root)\s*\((\d+)\)\s*(\()/i, false)))
                    {
                        // generalized radical sqrt/root
                        if (HAS.call(Expr.FN, 'sqrt()'))
                        {
                            m = match[1].toLowerCase();
                            s = s.slice(match[0].length);
                            i += match[0].length;
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
                    }
                    if ((match = eat('√', false)) || (match = eat(/^sqrt\b/i, false)))
                    {
                        // alternative sqrt
                        if (HAS.call(Expr.FN, 'sqrt()'))
                        {
                            s = s.slice(match[0].length);
                            i += match[0].length;
                            arg = null;
                            eat(/^\s+/); // space
                            if ('(' === s.charAt(0))
                            {
                                // subexpression
                                s = s.slice(1);
                                i += 1;
                                arg = parse_until(')');
                            }
                            else if ('{' === s.charAt(0))
                            {
                                // subexpression
                                s = s.slice(1);
                                i += 1;
                                arg = parse_until('}');
                            }
                            else if (match = eat(/^-?\d+(\.((\[\d+\])|(\d+(\[\d+\])?)))?(e-?\d+)?/i))
                            {
                                // number
                                arg = Expr('', Rational.fromDec(match[0]));
                            }
                            else if (match = eat(/^[a-z]((_[a-z0-9])|(_\{[a-z0-9]+\}))?/i))
                            {
                                // symbol
                                m = match[0];
                                if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                                if ('}' === m.slice(-1)) m = m.slice(0, -1);
                                arg = Expr('', m);
                            }
                            else if (match = eat(/^@\d*/))
                            {
                                // special symbol
                                m = match[0];
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
                    }
                    if (match = eat(/^\\?(([a-z][a-z0-9]*)((_[a-z0-9])|(_\{[a-z0-9]+\}))?)\s*([\(\{])/i, false))
                    {
                        // function
                        m = match[1].toLowerCase() + '()';
                        if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                        if ('}' === m.slice(-1)) m = m.slice(0, -1);
                        if (HAS.call(Expr.FN, m))
                        {
                            s = s.slice(match[0].length);
                            i += match[0].length;
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
                    }
                    if (match = eat(/^(\\alpha|\\beta|\\gamma|\\delta|\\epsilon|\\zeta|\\eta|\\theta|\\iota|\\kappa|\\lambda|\\mu|\\nu|\\xi|\\o|\\pi|\\rho|\\sigma|\\tau|\\upsilon|\\phi|\\chi|\\psi|\\omega)((_[a-z0-9])|(_\{[a-z0-9]+\}))?/i))
                    {
                        // greek symbol
                        m = match[0];
                        if (-1 !== m.indexOf('_{')) m = m.split('_{').join('_');
                        if ('}' === m.slice(-1)) m = m.slice(0, -1);
                        term = Expr('', m);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^[a-z]((_[a-z0-9])|(_\{[a-z0-9]+\}))?/i))
                    {
                        // latin symbol
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
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^@\d*/))
                    {
                        // special symbol
                        m = match[0];
                        term = Expr('', m);
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
                        prev_term = true;
                        continue;
                    }
                    if (match = eat(/^\d+(\.((\[\d+\])|(\d+(\[\d+\])?)))?(e-?\d+)?/i))
                    {
                        // float or int to rational number
                        term = Expr('', Rational.fromDec(match[0].split(/\s+/).join('')));
                        if (prev_term)
                        {
                            ops.unshift(['*', i0]); // implicit multiplication assumed
                            merge();
                        }
                        terms.unshift(term);
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
                        if (term)
                        {
                            terms.unshift(term);
                        }
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
                    throw error(expected ? ('Missing expected "' + expected.split('').join('" or "') + '"') : ('Unexpected "' + c + '"'));
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
    ,_xpnd: null
    ,_simpl: null
    ,_fctrd: null
    ,_rexpr: null
    ,_symb: null
    ,_op: null
    ,_const: null
    ,_cmplx: null
    ,_len: null
    ,_smpl: null
    ,_c: null
    ,_f: null
    ,_terms: null
    ,$map: null

    ,dispose: function() {
        var self = this;
        self.ast = null;
        self._str = null;
        self._tex = null;
        self._xpnd = null;
        self._simpl = null;
        self._fctrd = null;
        self._rexpr = null;
        self._symb = null;
        self._op = null;
        self._const = null;
        self._smpl = null;
        self._c = null;
        self._f = null;
        self._terms = null;
        self.$map = null;
        return self;
    }

    ,clone: function() {
        var self = this, ast = self.ast;
        return 'expr' === ast.type ? Expr(ast.op, ast.arg.map(function(subexpr) {
            if (subexpr === self)
            {
                return Expr(ast.op, ast.arg.map(function(subexpr) {
                    return subexpr.clone();
                })); // avoid recursive refs
            }
            else
            {
                return subexpr.clone();
            }
        })) : /*symbol or number*/Expr('', ast.arg);
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
    ,operators: function(op) {
        var self = this, ast = self.ast;
        if (arguments.length)
        {
            if ('expr' === ast.type)
            {
                return ast.arg.reduce(function(ops, subexpr) {
                    ops.push.apply(ops, subexpr.operators(op));
                    return ops;
                }, (op === ast.op) || (Expr.OP[ast.op] && (op === Expr.OP[ast.op].name)) ? [self] : []);
            }
            else
            {
                return [];
            }
        }
        if (null == self._op)
        {
            if ('expr' === ast.type)
            {
                self._op = ast.arg.reduce(function(operators, subexpr) {
                    // they are in sorted order
                    return merge_sequences(operators, subexpr.operators());
                }, ['()' === ast.op.slice(-2) ? ast.op : (Expr.OP[ast.op] ? Expr.OP[ast.op].name : ast.op)]);
            }
            else
            {
                self._op = [];
            }
        }
        return self._op;
    }
    ,term: function(t) {
        var self = this, ast, key, terms, c, f,
            Z = Expr.Zero(), O = Rational.Zero(), I = Rational.One();

        if (null == self._terms)
        {
            // collect simple terms only, sums of products of numbers, symbols and powers of symbols
            ast = self.ast;
            self._terms = {'1': {e:Z, c:O}};

            if ('sym' === ast.type)
            {
                self._terms[ast.arg] = {e:self, c:I};
            }
            else if (self.isConst())
            {
                self._terms['1'] = {e:Expr('', self.c()), c:self.c()};
            }
            else if (('+' === ast.op) || ('-' === ast.op))
            {
                ast.arg.forEach(function(e, i) {
                    KEYS(e.terms).forEach(function(key) {
                        if (!HAS.call(self._terms, key))
                        {
                            self._terms[key] = (0 < i) && ('-' === ast.op) ? {e:e.terms[key].e.neg().expand(), c:e.terms[key].c.neg()} : e.terms[key];
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
                c = I;
                f = (ast.arg.reduce(function(f, e) {
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
                if (f.length) self._terms[f.map(function(a) {return String(a[0]) + (a[1].gt(1) ? ('^'+String(a[1])) : '');}).join('*')] = {e:Expr('*', [c].concat(f.map(function(a) {return Expr('^', a);}))), c:c};
            }
            else if ('/' === ast.op)
            {
                c = I;
                f = (ast.arg.reduce(function(f, e, i) {
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
                if (f.length) self._terms[f.map(function(a) {return String(a[0]) + (a[1].gt(1) ? ('^'+String(a[1])) : '');}).join('*')] = {e:Expr('*', [c].concat(f.map(function(a) {return Expr('^', a);}))), c:c};
            }
            else if (('^' === ast.op) && ('sym' === ast.arg[0].type))
            {
                self._terms[ast.arg[0].arg + (ast.arg[1].gt(1) ? ('^'+String(ast.arg[1])) : '')] = {e:self, c:I};
            }
        }

        if (null == t) return self._terms;

        t = String(t);
        return HAS.call(self._terms, t) ? self._terms[t] : {e:Z, c:O};
    }

    ,isSimple: function() {
        var self = this, ast = self.ast, O, I, J, nontrivial;
        if (null == self._smpl)
        {
            if ('sym' === ast.type)
            {
                self._smpl = true;
            }
            else if ('num' === ast.type)
            {
                self._smpl = true; //ast.arg.isReal() || ast.arg.isImag(); // complex numbers are not simple
            }
            else
            {
                O = Expr.Zero();
                I = Expr.One();
                J = Expr.MinusOne();
                if (('+' === ast.op) || ('-' === ast.op))
                {
                    nontrivial = ast.arg.filter(function(subexpr) {return !subexpr.equ(O);});
                    self._smpl = ((1 === nontrivial.length) && nontrivial[0].isSimple()) || !nontrivial.length;
                }
                else if ('*' === ast.op)
                {
                    nontrivial = ast.arg.filter(function(subexpr) {return !subexpr.equ(I) && !subexpr.equ(J);});
                    self._smpl = ((1 === nontrivial.length) && nontrivial[0].isSimple()) || !nontrivial.length;
                }
                else if ('/' === ast.op)
                {
                    self._smpl = ast.arg[0].isSimple() && (ast.arg[1].equ(I) || ast.arg[1].equ(J));
                }
                else if ('^' === ast.op)
                {
                    self._smpl = ast.arg[0].isSimple() && ast.arg[1].equ(I);
                }
                else
                {
                    self._smpl = false;
                }
            }
        }
        return self._smpl;
    }
    ,isSymbol: function() {
        return 'sym' === this.ast.type;
    }
    ,isConst: function(loose) {
        var self = this;
        if (null == self._const)
        {
            if ('num' === self.ast.type)
            {
                self._const = [true, true];
            }
            else if (self.symbols().filter(function(s) {return '1' !== s;}).length)
            {
                self._const = [false, false];
            }
            else if (self.operators().filter(function(op) {return ('()' === op.slice(-2)) && HAS.call(Expr.FN, op) && !Expr.FN[op].exact;}).length)
            {
                self._const = [false, true];
            }
            else
            {
                self._const = [self.operators('pow').reduce(function(exact, expr) {
                    if (!exact) return exact;
                    var b = expr.ast.arg[0].c(), e = expr.ast.arg[1].c();
                    if (e.isInt()) return true;
                    if (!e.isReal()) return false;
                    // non-exact pow should NOT be considered const
                    return b.rad(e.real().den).pow(e.real().den).equ(b);
                }, true), true];
            }
        }
        return self._const[true === loose ? 1 : 0];
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

    ,c: function(loose) {
        var self = this, ast = self.ast, c;
        if (null == self._c)
        {
            // constant term
            if ('sym' === ast.type)
            {
                c = Rational.Zero();
            }
            else if ('num' === ast.type)
            {
                c = ast.arg;
            }
            else if (self.isConst())
            {
                c = self.evaluate();
            }
            else
            {
                c = Rational.Zero();
            }
            self._c = [c, !self.isConst() && self.isConst(true) ? self.evaluate() : c];
        }
        return self._c[true === loose ? 1 : 0];
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
                    f.c = 0 < i ? f.c.div(e.f().c) : f.c.mul(e.f().c);
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
        if (/*self.isConst()*/'num' === ast.type)
        {
            return Expr('', self.c().neg());
        }
        /*if (('-' === ast.op) && ast.arg[0].isConst() && ast.arg[0].c().equ(Rational/*Expr* /.Zero()))
        {
            return 2 < ast.arg.length ? Expr('+', ast.arg.slice(1)) : ast.arg[1];
        }*/
        return Expr.MinusOne().mul(self);
    }
    ,inv: function() {
        var self = this;
        if (/*self.isConst()*/'num' === self.ast.type)
        {
            return Expr('', self.c().inv());
        }
        return self.den.div(self.num);
    }

    ,equ: function(other) {
        var self = this, Arithmetic = Abacus.Arithmetic;
        if (Arithmetic.isNumber(other) || is_instance(other, Numeric) || is_string(other)) other = Expr('', other);
        if (!is_instance(other, Expr) && is_callable(other.toExpr)) other = other.toExpr();
        if (is_instance(other, Expr))
        {
            if ('sym' === self.ast.type)
            {
                if ('sym' === other.ast.type) return self.ast.arg === other.ast.arg; // symbol and symbol match
                if (other.isConst(true)) return false;
                return self.toString() === other.expand().toString();
            }
            else if ('sym' === other.ast.type)
            {
                if (self.isConst(true)) return false;
                return self.expand().toString() === other.toString();
            }
            else if (self.isConst() && other.isConst())
            {
                return self.c().equ(other.c());
            }
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
            if ('sym' === self.ast.type)
            {
                if ('sym' === other.ast.type) return false; // symbol and symbol are not comparable
                if (other.isConst(true)) return false;
                return self.sub(other).expand().gt(Expr.Zero());
            }
            else if ('sym' === other.ast.type)
            {
                if (self.isConst(true)) return false;
                return self.sub(other).expand().gt(Expr.Zero());
            }
            else if (other.isConst())
            {
                if (self.isConst()) return self.c().gt(other.c());
                if (self.expand().isConst()) return self.expand().c().gt(other.c());
                return false;
            }
            else if (self.isConst())
            {
                if (other.expand().isConst()) return self.c().gt(other.expand().c());
                return false;
            }
            else
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
            if ('sym' === self.ast.type)
            {
                if ('sym' === other.ast.type) return self.ast.arg === other.ast.arg; // only when symbol and symbol match
                if (other.isConst(true)) return false;
                return self.sub(other).expand().gte(Expr.Zero());
            }
            else if ('sym' === other.ast.type)
            {
                if (self.isConst(true)) return false;
                return self.sub(other).expand().gte(Expr.Zero());
            }
            else if (other.isConst())
            {
                if (self.isConst()) return self.c().gte(other.c());
                if (self.expand().isConst()) return self.expand().c().gte(other.c());
                return false;
            }
            else if (self.isConst())
            {
                if (other.expand().isConst()) return self.c().gte(other.expand().c());
                return false;
            }
            else
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
            if ('sym' === self.ast.type)
            {
                if ('sym' === other.ast.type) return false; // symbol and symbol are not comparable
                if (other.isConst(true)) return false;
                return self.sub(other).expand().lt(Expr.Zero());
            }
            else if ('sym' === other.ast.type)
            {
                if (self.isConst(true)) return false;
                return self.sub(other).expand().lt(Expr.Zero());
            }
            else if (other.isConst())
            {
                if (self.isConst()) return self.c().lt(other.c());
                if (self.expand().isConst()) return self.expand().c().lt(other.c());
                return false;
            }
            else if (self.isConst())
            {
                if (other.expand().isConst()) return self.c().lt(other.expand().c());
                return false;
            }
            else
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
            if ('sym' === self.ast.type)
            {
                if ('sym' === other.ast.type) return self.ast.arg === other.ast.arg; // only when symbol and symbol match
                if (other.isConst(true)) return false;
                return self.sub(other).expand().lte(Expr.Zero());
            }
            else if ('sym' === other.ast.type)
            {
                if (self.isConst(true)) return false;
                return self.sub(other).expand().lte(Expr.Zero());
            }
            else if (other.isConst())
            {
                if (self.isConst()) return self.c().lte(other.c());
                if (self.expand().isConst()) return self.expand().c().lte(other.c());
                return false;
            }
            else if (self.isConst())
            {
                if (other.expand().isConst()) return self.c().lte(other.expand().c());
                return false;
            }
            else
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
            // do some simplifications/normalizations
            O = Rational/*Expr*/.Zero();
            /*if (('num' === self.ast.type) && ('num' === other.ast.type))
            {
                return Expr('', self.c().add(other.c()));
            }*/
            if (other.isConst() && other.c().equ(O))
            {
                /*if (other.c().equ(O))
                {*/
                    return self;
                /*}*/
                /*else if (self.isConst())
                {
                    return Expr('', self.c().add(other.c()));
                }*/
            }
            if (self.isConst() && self.c().equ(O))
            {
                return other;
            }
            if (('+' === self.ast.op) && ('+' === other.ast.op))
            {
                return Expr('+', self.ast.arg.concat(other.ast.arg));
            }
            if (('+' === self.ast.op) && ('-' === other.ast.op))
            {
                return Expr('+', self.ast.arg.concat([other.ast.arg[0]]).concat(other.ast.arg.slice(1).map(expr_neg)));
            }
            if (('-' === self.ast.op) && ('+' === other.ast.op))
            {
                return Expr('+', [self.ast.arg[0]].concat(self.ast.arg.slice(1).map(expr_neg)).concat(other.ast.arg));
            }
            if (('-' === self.ast.op) && ('-' === other.ast.op))
            {
                return Expr('+', [self.ast.arg[0]].concat(self.ast.arg.slice(1).map(expr_neg)).concat([other.ast.arg[0]]).concat(other.ast.arg.slice(1).map(expr_neg)));
            }
            if ('+' === self.ast.op)
            {
                return Expr('+', self.ast.arg.concat([other]));
            }
            if ('+' === other.ast.op)
            {
                return Expr('+', [self].concat(other.ast.arg));
            }
            if ('-' === self.ast.op)
            {
                return Expr('+', [self.ast.arg[0]].concat(self.ast.arg.slice(1).map(expr_neg)).concat([other]));
            }
            if ('-' === other.ast.op)
            {
                return Expr('+', [self].concat([other.ast.arg[0]]).concat(other.ast.arg.slice(1).map(expr_neg)));
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
            // do some simplifications/normalizations
            O = Rational/*Expr*/.Zero();
            /*if (('num' === self.ast.type) && ('num' === other.ast.type))
            {
                return Expr('', self.c().sub(other.c()));
            }*/
            if (other.isConst() && other.c().equ(O))
            {
                /*if (other.c().equ(O))
                {*/
                    return self;
                /*}*/
                /*else if (self.isConst())
                {
                    return Expr('', self.c().sub(other.c()));
                }*/
            }
            if (self.isConst() && self.c().equ(O))
            {
                return other.neg();
            }
            if (('-' === self.ast.op) && ('+' === other.ast.op))
            {
                return Expr('-', self.ast.arg.concat(other.ast.arg));
            }
            if (('+' === self.ast.op) && ('+' === other.ast.op))
            {
                return Expr('+', self.ast.arg.concat(other.ast.arg.map(expr_neg)));
            }
            if (('-' === self.ast.op) && ('-' === other.ast.op))
            {
                return Expr('-', self.ast.arg.concat(other.ast.arg.map(expr_neg)));
            }
            if (('+' === self.ast.op) && ('-' === other.ast.op))
            {
                return Expr('+', self.ast.arg.concat(other.ast.arg.map(expr_neg)));
            }
            if ('+' === self.ast.op)
            {
                return Expr('+', self.ast.arg.concat([other.neg()]));
            }
            if ('-' === self.ast.op)
            {
                return Expr('-', self.ast.arg.concat([other]));
            }
            if ('+' === other.ast.op)
            {
                return Expr('+', [self].concat(other.ast.arg.map(expr_neg)));
            }
            if ('-' === other.ast.op)
            {
                return Expr('-', [self].concat(other.ast.arg.map(expr_neg)));
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
            // do some simplifications/normalizations
            O = Rational/*Expr*/.Zero(); I = Rational/*Expr*/.One();
            /*if (('num' === self.ast.type) && ('num' === other.ast.type))
            {
                return Expr('', self.c().mul(other.c()));
            }*/
            if (other.isConst())
            {
                if (other.c().equ(O))
                {
                    return Expr.Zero();
                }
                else if (other.c().equ(I))
                {
                    return self;
                }
                /*else if (self.isConst())
                {
                    return Expr('', self.c().mul(other.c()));
                }*/
            }
            if (self.isConst())
            {
                if (self.c().equ(O))
                {
                    return Expr.Zero();
                }
                else if (self.c().equ(I))
                {
                    return other;
                }
            }
            if (('*' === self.ast.op) && ('*' === other.ast.op))
            {
                return Expr('*', self.ast.arg.concat(other.ast.arg));
            }
            if ('*' === self.ast.op)
            {
                return Expr('*', self.ast.arg.concat([other]));
            }
            if ('*' === other.ast.op)
            {
                return Expr('*', [self].concat(other.ast.arg));
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
            /*if (('num' === self.ast.type) && ('num' === other.ast.type))
            {
                return Expr('', self.c().div(other.c()));
            }*/
            if (other.isConst())
            {
                if (other.c().equ(Rational/*Expr*/.One()))
                {
                    return self;
                }
                /*else if (self.isConst())
                {
                    return Expr('', self.c().div(other.c()));
                }*/
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
        return /*self.isConst() && other.isConst() ? Expr('', self.c().mod(other.c())) :*/ Expr('mod()', [self, other]);
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
                //O = Expr.Zero(); I = Expr.One();
                /*if (self.isConst())
                {
                    return Expr('', other.c().lt(Arithmetic.O) ? (self.c().inv().pow(other.c().neg())) : (self.c().pow(other.c())));
                }
                else*/ if (other.c().equ(Arithmetic.I))
                {
                    return self;
                }
                /*else if (other.equ(O))
                {
                    return I;
                }*/
            }
            /*if (('^' === self.ast.op) && ('num' === self.ast.arg[1].ast.type) && self.ast.arg[1].isInt() && ('num' === other.ast.type) && other.isInt())
            {
                return Expr('^', [self.ast.arg[0], self.ast.arg[1].c().mul(other.c())]);
            }*/
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
    ,d: function(x, n) {
        // nth order formal derivative with respect to symbol x
        var df = this;

        if (null == x) return df;
        if (null == n) n = 1;
        n = +n;
        x = String(x);

        if ('1' === x) return Expr.Zero();

        for (; 0 < n; --n) df = expr_derivative(df, x);
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
        else if (Expr.FN[op] && Expr.FN[op].fn)
        {
            return Expr.FN[op].fn(ast.arg.map(evaluate));
        }
        return Rational.Zero();
    }
    ,substitute: function(that, withthat, toplevel) {
        var self = this;
        if (is_instance(that, Expr))
        {
            // general subexpression substitution
            return subexpr_substitute(self, that, to_expr(withthat), false !== toplevel);
        }
        else if (is_array(that) && is_array(withthat))
        {
            return that.reduce(function(expr, _, i) {
                return expr.substitute(that[i], withthat[i], toplevel);
            }, self);
        }
        else if (is_obj(that))
        {
            // symbol substitution map
            return KEYS(that).reduce(function(expr, symbol) {
                return symbol_substitute(expr, symbol, that[symbol]);
            }, self);
        }
        else if (is_string(that))
        {
            // simple symbol substitution
            return symbol_substitute(self, String(that), to_expr(withthat));
        }
        return self;
    }
    ,compose: function(g) {
        return this.substitute(g); // alias
    }
    ,algebrify: function(sym, map) {
        var self = this, expr, mode;
        if (!map || is_string(map))
        {
            // algebrify
            mode = map || 'default';
            map = {};
            expr = f_substitute(self, map, sym || '@', mode);
            expr.$map = map;
            return expr;
        }
        else
        {
            // restore
            return f_restore(self, map, sym || '@');
        }
    }
    ,expand: function() {
        var self = this, expr, map;
        if (null == self._xpnd)
        {
            if (self.isConst())
            {
                self._xpnd = Expr('', self.c());
                self._xpnd._xpnd = self._xpnd; // idempotent
                self._xpnd._rexpr = self._xpnd; // idempotent
                self._xpnd._rexpr._rexpr = self._xpnd; // idempotent
            }
            else
            {
                expr = self.algebrify('@', 'expand');
                map = expr.$map;
                expr = simplify_rf(expr_rf(expr), true);
                self._xpnd = Expr('/', [expr.num.toExpr(), expr.den.toExpr()]).algebrify('@', map);
                self._xpnd._xpnd = self._xpnd; // idempotent
                self._xpnd._rexpr = self._xpnd; // idempotent
                self._xpnd._rexpr._rexpr = self._xpnd; // idempotent
                self._xpnd._rexpr.ast.arg[0]._rexpr = Expr('/', [self._xpnd._rexpr.ast.arg[0], Expr.One()]); // idempotent
                self._xpnd._rexpr.ast.arg[1]._rexpr = Expr('/', [self._xpnd._rexpr.ast.arg[1], Expr.One()]); // idempotent
            }
        }
        return self._xpnd;
    }
    ,simplify: function() {
        var self = this, expr, map;
        if (null == self._simpl)
        {
            if (self.isConst())
            {
                self._simpl = Expr('', self.c());
                self._simpl._simpl = self._simpl; // idempotent
                self._simpl._xpnd = self._simpl; // idempotent
                self._simpl._xpnd._xpnd = self._simpl; // idempotent
                self._simpl._rexpr = self._simpl; // idempotent
                self._simpl._rexpr._rexpr = self._simpl; // idempotent
            }
            else
            {
                expr = self.algebrify('@', 'simplify');
                map = expr.$map;
                expr = simplify_rf(simplify_radicals(expr_rf(expr), map, '@'), true);
                self._simpl = Expr('/', [expr.num.toExpr(), expr.den.toExpr()]).algebrify('@', map);
                self._simpl._simpl = self._simpl; // idempotent
                self._simpl._xpnd = self._simpl; // idempotent
                self._simpl._xpnd._xpnd = self._simpl; // idempotent
                self._simpl._rexpr = self._simpl; // idempotent
                self._simpl._rexpr._rexpr = self._simpl; // idempotent
                self._simpl._rexpr.ast.arg[0]._rexpr = Expr('/', [self._simpl._rexpr.ast.arg[0], Expr.One()]); // idempotent
                self._simpl._rexpr.ast.arg[1]._rexpr = Expr('/', [self._simpl._rexpr.ast.arg[1], Expr.One()]); // idempotent
            }
        }
        return self._simpl;
    }
    ,simplifyByRules: function(rules) {
        // TODO: general simplify
        // using given/user-defined rules/equivalence relations
        // via iterative unification recast as optimization based on expr complexity
        return this;
    }
    ,complexity: function() {
        var self = this, ast, cmplx = 0;
        if (null == self._cmplx)
        {
            // eg. "Understanding Expression Simplification", Jacques Carette, 2004
            // https://www.scispace.com/pdf/understanding-expression-simplification-52x0czuft8.pdf
            ast = self.ast;
            if ('num' === ast.type)
            {
                cmplx = 0;
            }
            else if ('sym' === ast.type)
            {
                cmplx = 1;
            }
            else if ('()' === ast.op.slice(-2))
            {
                cmplx = 2 * (ast.arg.reduce(function(cmplx, subexpr) {
                    return cmplx + subexpr.complexity();
                }, 0) || 1);
            }
            else if ('^' === ast.op)
            {
                if (ast.arg[1].isInt())
                {
                    cmplx = stdMath.min(10, Abacus.Arithmetic.val(ast.arg[1].c().real().num)) * ast.arg[0].complexity();
                }
                else
                {
                    cmplx = 2 * (ast.arg[0].complexity() + (ast.arg[1].complexity() || 1));
                }
            }
            else
            {
                cmplx = 1 * ast.arg.reduce(function(cmplx, subexpr) {
                    return cmplx + subexpr.complexity();
                }, 0);
            }
            self._cmplx = cmplx;
        }
        return self._cmplx;
    }
    ,length: function() {
        var self = this, ast, len = 0;
        if (null == self._len)
        {
            ast = self.ast;
            if ('num' === ast.type)
            {
                len = ast.arg.real().equ(0) || ast.arg.imag().equ(0) ? 1 : 2;
            }
            else if ('sym' === ast.type)
            {
                len = 1;
            }
            else
            {
                len = ast.arg.reduce(function(len, subexpr, i) {
                    var l = 0;
                    if (-1 < (['+','-']).indexOf(ast.op))
                    {
                        l = ('num' === subexpr.ast.type) && subexpr.ast.arg.equ(0) ? 0 : subexpr.length();
                    }
                    else if (-1 < (['*']).indexOf(ast.op))
                    {
                        l = ('num' === subexpr.ast.type) && subexpr.ast.arg.abs().equ(1) ? 0 : subexpr.length();
                    }
                    else if (-1 < (['/']).indexOf(ast.op) && (0 < i))
                    {
                        l = ('num' === subexpr.ast.type) && subexpr.ast.arg.abs().equ(1) ? 0 : subexpr.length();
                    }
                    else if (-1 < (['^']).indexOf(ast.op) && (1 === i))
                    {
                        l = ('num' === subexpr.ast.type) && subexpr.ast.arg.equ(1) ? 0 : subexpr.length();
                    }
                    else
                    {
                        l = subexpr.length();
                    }
                    return len + l;
                }, '()' === ast.op.slice(-2) ? 1 : 0);
            }
            self._len = len;
        }
        return self._len;
    }
    ,factors: function() {
        var self = this, expr, map, c, f;
        if (null == self._fctrd)
        {
            if (self.isConst())
            {
                c = self.c();
                if (is_instance(c, Complex))
                {
                    f = lcm2(c.real().abs().den, c.imag().abs().den);
                    self._fctrd = Abacus.Arithmetic.equ(f, 1) ? Expr('*', factorize_gi(c).map(function(f) {return Expr('^', [f[0], f[1]]);})) : Expr('/', [
                        Expr('*', factorize_gi(c.mul(f)).map(function(f) {return Expr('^', [f[0], f[1]]);})),
                        Expr('*', factorize(f).map(function(f) {return Expr('^', [f[0], f[1]]);}))
                    ]);
                }
                else if (c.real().isInt())
                {
                    self._fctrd = Expr('*', [Expr('', c.real().lt(0) ? -1 : 1)].concat(factorize(c.real().abs().num).map(function(f) {return Expr('^', [f[0], f[1]]);})));
                }
                else
                {
                    self._fctrd = Expr('/', [
                        Expr('*', [Expr('', c.real().lt(0) ? -1 : 1)].concat(factorize(c.real().abs().num).map(function(f) {return Expr('^', [f[0], f[1]]);}))),
                        Expr('*', factorize(c.real().abs().den).map(function(f) {return Expr('^', [f[0], f[1]]);}))
                    ]);
                }
            }
            else
            {
                expr = self.expand().algebrify('@', 'default');
                map = expr.$map;
                self._fctrd = Abacus.Factor(expr.toRationalFunc()).algebrify('@', map);
            }
            self._fctrd._fctrd = self._fctrd; // idempotent
        }
        return self._fctrd;
    }
    ,toExpr: function() {
        return this; // trivial
    }
    ,toRationalExpr: function() {
        var self = this, re;
        if (null == self._rexpr)
        {
            re = rational_expr(self);
            self._rexpr = Expr('/', [re.num, re.den]);
            self._rexpr._rexpr = self._rexpr; // idempotent
            self._rexpr.ast.arg[0]._rexpr = Expr('/', [self._rexpr.ast.arg[0], Expr.One()]); // idempotent
            self._rexpr.ast.arg[1]._rexpr = Expr('/', [self._rexpr.ast.arg[1], Expr.One()]); // idempotent
        }
        return self._rexpr;
    }
    ,toPoly: function(symbol, ring, imagUnit) {
        var self = this, other_symbols = null, CoefficientRing = null;

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
            // incorrect, remove them
            //symbol = symbol.filter(function(s) {return -1 !== ring.CoefficientRing.PolynomialSymbol.indexOf(s);}); //hmm..?
            //if (!symbol.length) symbol = ring.PolynomialSymbol.slice(); // needed
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

        return expr_poly(self, symbol, other_symbols, ring, CoefficientRing, imagUnit);
    }
    ,toRationalFunc: function(symbol, ring, simplified) {
        var self = this, num, den;
        symbol = symbol || (self.symbols().filter(function(s) {return '1' !== s;}));
        ring = ring || null;
        num = self.num.toPoly(symbol, ring);
        den = num ? self.den.toPoly(num.symbol, num.ring) : null;
        return num && den ? (true === simplified ? {num:num, den:den} : RationalFunc(num, den)) : null;
    }
    ,toString: function(type) {
        var self = this, ast = self.ast,
            op = ast.op, arg = ast.arg,
            str, str2, sign, sign2, _str,
            Arithmetic = Abacus.Arithmetic;

        type = String(type || '').toLowerCase();

        /*if ('asciimath' === type)
        {
            _str = self._str;
            self._str = null;
        }*/
        if (null == self._str)
        {
            if ('' === op)
            {
                // symbol or number
                self._str = String(arg);
            }
            /*else if (self.isConst())
            {
                // constant
                self._str = self.c().toString();
            }*/
            else if ('()' === op.slice(-2))
            {
                // function
                self._str = op.slice(0, -2) + '(' + arg.map(expr_str).join(',') + ')';
            }
            else if (Expr.OP[op])
            {
                // subexpression
                if (PREFIX === Expr.OP[op].fixity)
                {
                    self._str = ('not' === op ? 'not ' : op) + arg.map(function(subexpr) {
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
                        else if (
                            /*('asciimath' === type) &&*/
                            arg[1].isConst()
                            && arg[1].c().isReal()
                            && Arithmetic.equ(arg[1].c().real().num, 1)
                            && Arithmetic.gt(arg[1].c().real().den, 1)
                        )
                        {
                            // radical sqrt
                            self._str = (Arithmetic.equ(arg[1].c().real().den, 2) ? 'sqrt' : ('root(' + String(arg[1].c().real().den) + ')')) + '(' + str + ')';
                        }
                        else
                        {
                            sign = str.charAt(0);
                            sign2 = str2.charAt(0);
                            self._str = (needs_parentheses(arg[0], false, true) || ('-' === sign) ? ('(' + str + ')') : str) + '^' + ((needs_parentheses(arg[1]) || ('-' === sign2) ? ('(' + str2 + ')') : str2));
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
                    else
                    {
                        self._str = arg.map(expr_str).join(' ' + op + ' ');
                    }
                }
            }
            else
            {
                self._str = '0';
            }
        }
        /*if ('asciimath' === type)
        {
            str = self._str;
            self._str = _str;
            return str;
        }*/
        return self._str;
    }
    ,toTex: function() {
        var self = this, ast = self.ast, op = ast.op, arg = ast.arg,
            Arithmetic = Abacus.Arithmetic, tex, tex2, sign, sign2;

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
            /*else if (self.isConst())
            {
                // constant
                self._tex = self.c().toTex();
            }*/
            else if ('()' === op.slice(-2))
            {
                // function
                self._tex = '\\' + to_tex(op.slice(0, -2)) + '\\left(' + arg.map(expr_tex).join(',') + '\\right)';
            }
            else if (Expr.OP[op])
            {
                // subexpression
                if (PREFIX === Expr.OP[op].fixity)
                {
                    self._tex = ('not' === op ? '\\lnot ' : op) + arg.map(function(subexpr) {
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
                        else if (
                            arg[1].isConst()
                            && arg[1].c().isReal()
                            && Arithmetic.equ(arg[1].c().real().num, 1)
                            && Arithmetic.gt(arg[1].c().real().den, 1)
                        )
                        {
                            // radical sqrt
                            self._tex = '\\sqrt' + (Arithmetic.equ(arg[1].c().real().den, 2) ? '' : ('[' + Tex(arg[1].c().real().den) + ']')) + '{' + tex + '}';
                        }
                        else
                        {
                            sign = tex.charAt(0);
                            self._tex = (needs_parentheses(arg[0], true, true) || ('-' === sign) ? ('\\left(' + tex + '\\right)') : tex) + '^{' + tex2 + '}';
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
                        self._tex = arg.reduce(function(out, subexpr, i) {
                            var tex = trim(subexpr.toTex()), prevtex, isNeg, texp;
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
                                if ('+' === op)
                                {
                                    out.push(isNeg ? ' - ' : ' + ');
                                    out.push(texp);
                                }
                                else if ('-' === op)
                                {
                                    out.push(isNeg ? ' + ' : ' - ');
                                    out.push(texp);
                                }
                                else if ('*' === op)
                                {
                                    if ((('*' === subexpr.ast.op) || !needs_parentheses(subexpr, true)) && !isNeg)
                                    {
                                        if (/^\d/.test(tex))
                                        {
                                            if (is_instance(out[out.length-1], Expr))
                                            {
                                                prevtex = trim(out[out.length-1].toTex());
                                            }
                                            else
                                            {
                                                prevtex = out[out.length-1];
                                            }
                                            out.push(/\d$/.test(prevtex) || /\d\^\{.+?\}$/.test(prevtex) ? ' \\cdot ' : '');
                                        }
                                        else
                                        {
                                            out.push('');
                                        }
                                        out.push(tex);
                                    }
                                    else
                                    {
                                        out.push('');
                                        out.push('\\left(' + tex + '\\right)');
                                    }
                                }
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
                            self._tex[0] = (('*' === op) && (op === self._tex[0].ast.op)) || !needs_parentheses(self._tex[0], true) ? tex : ('\\left(' + tex + '\\right)');
                        }
                        self._tex = self._tex.join('');
                        if (!self._tex.length) self._tex = '*' === op ? '1' : '0';
                        if ('-' === sign)
                        {
                            if ('-' === self._tex.charAt(0)) self._tex = self._tex.slice(1);
                            else self._tex = sign + self._tex;
                        }
                    }
                    else
                    {
                        self._tex = arg.map(expr_tex).join(' \\' + (Expr.OP[op] ? Expr.OP[op].name : op) + ' ');
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
    return is_string(a) ? Expr.fromString(a) : ((null != a) && is_callable(a.toExpr) ? a.toExpr() : Expr('', a || 0));
});

function to_expr(x)
{
    return is_instance(x, Expr) ? x : ((null != x) && is_callable(x.toExpr) ? x.toExpr() : Expr('', x || 0));
}
function rational_expr(expr)
{
    var a, b, I = Expr.One(), re;
    if ('^' === expr.ast.op)
    {
        a = rational_expr(expr.ast.arg[0]);
        re = expr.ast.arg[1].isConst() && expr.ast.arg[1].c().lt(0) ? {
            num: Expr('^', [a.den, expr.ast.arg[1].neg()]),
            den: Expr('^', [a.num, expr.ast.arg[1].neg()])
        } : {
            num: Expr('^', [a.num, expr.ast.arg[1]]),
            den: Expr('^', [a.den, expr.ast.arg[1]])
        };
    }
    else if ('/' === expr.ast.op)
    {
        a = rational_expr(expr.ast.arg[0]);
        b = rational_expr(expr.ast.arg[1]);
        re = {
            num: a.num.mul(b.den),
            den: b.num.mul(a.den)
        };
    }
    else if ('*' === expr.ast.op)
    {
        a = expr.ast.arg.map(rational_expr);
        re = {
            num: a.reduce(function(num, re) {return num.mul(re.num);}, I),
            den: a.reduce(function(den, re) {return den.mul(re.den);}, I)
        };
    }
    else if (('+' === expr.ast.op) || ('-' === expr.ast.op))
    {
        a = expr.ast.arg.map(rational_expr);
        re = {
            num: Expr(expr.ast.op, a.map(function(re, i) {
                var m = a.reduce(function(m, re, j) {return i !== j ? m.mul(re.den) : m;}, I);
                return re.num.mul(m);
            })),
            den: a.reduce(function(den, re) {return den.mul(re.den);}, I)
        };
    }
    else
    {
        re = {
            num: expr,
            den: I
        };
    }
    return re;
}
function expr_rf(expr)
{
    return is_instance(expr, Expr) ? (expr.toRationalFunc(null, null, true)) : expr;
}
function symbol_substitute(f, x, g)
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
            return Expr(f.ast.op, f.ast.arg.map(function(f) {return symbol_substitute(f, x, g);}));
        }
    }
    return f;
}
function subexpr_substitute(expr, subexpr1, subexpr2, toplevel)
{
    // substitute subexpr1 -> subexpr2 in expr
    if (toplevel && ((expr === subexpr1) || (expr.toString() === subexpr1.toString())))
    {
        return subexpr2;
    }
    else if ('expr' === expr.ast.type)
    {
        /*if (('^' === expr.ast.op) && ('^' === subexpr1.ast.op) && (expr.ast.arg[0].toString() === subexpr1.ast.arg[0].toString()) && expr.ast.arg[1].isInt() && subexpr1.ast.arg[1].isInt())
        {
            // simplify power/radical substitution
            var Arithmetic = Abacus.Arithmetic,
                e1 = expr.ast.arg[1].c().real().num,
                e2 = subexpr1.ast.arg[1].c().real().num;
            return Arithmetic.equ(Arithmetic.O, Arithmetic.mod(e1, e2)) ? subexpr2.pow(Arithmetic.div(e1, e2)) : expr;
        }
        else
        {*/
            return Expr(expr.ast.op, expr.ast.arg.map(function(subexpr) {
                return subexpr_substitute(subexpr, subexpr1, subexpr2, true);
            }));
        /*}*/
    }
    return expr; // nothing to substitute
}
function f_substitute(expr, map, sym, mode)
{
    if (null == map.$cnt) map.$cnt = 0;
    function _(e) {return 'expand' === mode ? e.expand() : ('simplify' === mode ? e.simplify() : e);}
    var ret, key, e, e2, e3, e4, k, k2, dk, m,
        Arithmetic = Abacus.Arithmetic;
    if (expr.symbols().filter(function(s) {return sym === s.slice(0, sym.length);}).length)
    {
        ret = expr; // idempotent
    }
    else
    {
        if ('()' === expr.ast.op.slice(-2))
        {
            // function
            e = Expr(expr.ast.op, expr.ast.arg.map(_));
            key = e.toString();
            if (!HAS.call(map, key))
            {
                map[key] = {
                    expr: e,
                    sym: sym+String(++map.$cnt)
                };
            }
            ret = Expr('', map[key].sym);
        }
        else if ('^' === expr.ast.op)
        {
            // pow/radical
            e = _(expr.ast.arg[1]);
            if (e.isConst() && e.c().isReal())
            {
                if (e.c().isInt())
                {
                    ret = f_substitute(expr.ast.arg[0], map, sym, mode).pow(e);
                }
                else
                {
                    k = Arithmetic.val(e.c().den);
                    m = e.c().num;
                    if ('expand' === mode)
                    {
                        m = 1;
                        e2 = _(f_substitute(expr.ast.arg[0], map, sym, mode).pow(e.c().num));
                        e2 = [Expr.One(), e2, Arithmetic.val(e.c().den)];
                    }
                    else if ('simplify' === mode)
                    {
                        e2 = f_substitute(expr.ast.arg[0], map, sym, mode);
                        k2 = stdMath.floor(stdMath.sqrt(k));
                        e3 = expr_rf(e2);
                        e4 = null;
                        for (dk=k; dk>=k2; --dk)
                        {
                            // for all divisors of k, try extract factors
                            if (0 === (k % dk))
                            {
                                e4 = kth_pp_factor(e3, dk, true);
                                if (e4) break;
                            }
                        }
                        if (e4)
                        {
                            e2 = [e4[0], e4[1], dk];
                        }
                        else
                        {
                            e2 = [Expr.One(), e2, k];
                        }
                    }
                    else
                    {
                        e2 = f_substitute(expr.ast.arg[0], map, sym, mode);
                        e2 = [Expr.One(), e2, k];
                    }
                    if (!e2[1].isConst() || !e2[1].c().equ(1))
                    {
                        e3 = Expr('^', [e2[1], Expr('/', [Expr.One(), k])]);
                        key = e3.toString();
                        if (!HAS.call(map, key))
                        {
                            map[key] = {
                                radical: Arithmetic.num(k),
                                expr: e3,
                                sym: sym+String(++map.$cnt)
                            };
                        }
                        ret = Expr('^', [Expr('', map[key].sym), m]);
                        if (!e2[0].isConst() || !e2[0].c().equ(1))
                        {
                            if (e2[2] < k)
                            {
                                e3 = Expr('^', [e2[0], Expr('/', [Expr.One(), stdMath.floor(k/e2[2])])]);
                                key = e3.toString();
                                if (!HAS.call(map, key))
                                {
                                    map[key] = {
                                        radical: Arithmetic.num(stdMath.floor(k/e2[2])),
                                        expr: e3,
                                        sym: sym+String(++map.$cnt)
                                    };
                                }
                                ret = Expr('*', [Expr('^', [Expr('', map[key].sym), m]), ret]);
                            }
                            else
                            {
                                ret = Expr('*', [e2[0].pow(m), ret]);
                            }
                        }
                    }
                    else
                    {
                        if (e2[2] < k)
                        {
                            e3 = Expr('^', [e2[0], Expr('/', [Expr.One(), stdMath.floor(k/e2[2])])]);
                            key = e3.toString();
                            if (!HAS.call(map, key))
                            {
                                map[key] = {
                                    radical: Arithmetic.num(stdMath.floor(k/e2[2])),
                                    expr: e3,
                                    sym: sym+String(++map.$cnt)
                                };
                            }
                            ret = Expr('^', [Expr('', map[key].sym), m]);
                        }
                        else
                        {
                            ret = e2[0].pow(m);
                        }
                    }
                }
            }
            else
            {
                e2 = _(expr.ast.arg[0]).pow(e);
                key = e2.toString();
                if (!HAS.call(map, key))
                {
                    map[key] = {
                        expr: e2,
                        sym: sym+String(++map.$cnt)
                    };
                }
                ret = Expr('', map[key].sym);
            }
        }
        else if ('' === expr.ast.op)
        {
            // num/symbol
            ret = expr;
        }
        else
        {
            // other
            ret = Expr(expr.ast.op, expr.ast.arg.map(function(e) {
                return f_substitute(e, map, sym, mode);
            }));
        }
    }
    return ret;
}
function f_restore(expr, map, sym)
{
    var done = false;
    while (!done)
    {
        done = true;
        expr = KEYS(map).reduce(function(expr, key) {
            var sub = map[key];
            if (sub.sym && sub.expr && (-1 < expr.symbols().indexOf(sub.sym)))
            {
                expr = symbol_substitute(expr, sub.sym, sub.expr);
                if (done) done = !sub.expr.symbols().filter(function(s) {return sym === s.slice(0, sym.length)}).length;
            }
            return expr;
        }, expr);
    }
    return expr;
}
function simplify_radicals(expr, map, sym)
{
    return KEYS(map).reduce(function(expr, key) {
        var Arithmetic = Abacus.Arithmetic, sub = map[key], t, q, r, d1, d2;
        if (sub.radical)
        {
            d1 = Arithmetic.lte(sub.radical, expr.num.maxdeg(sub.sym));
            d2 = Arithmetic.lte(sub.radical, expr.den.maxdeg(sub.sym));
            if (d1 || d2)
            {
                r = simplify_radicals(expr_rf(sub.expr.ast.arg[0]), map, sym);
                t = {};
                t[sub.sym+'^'+String(sub.radical)] = Rational.One();
                q = MultiPolynomial(t, [sub.sym], expr.num.ring).mul(r.den).sub(r.num);
                if (d1) expr.num = expr.num.mod(q);
                if (d2) expr.den = expr.den.mod(q);
            }
        }
        return expr;
    }, expr);
}
function kth_pp_factor(expr, k, as_expr)
{
    // extract factor which is perfect kth-power from expr
    var a, b, p1, p2, qr, I1, I2, is_expr = false;
    if (is_instance(expr, Expr))
    {
        is_expr = true;
        expr = expr_rf(expr);
    }

    if (expr.num.isConst())
    {
        p1 = expr.num.isReal() ? num_pp_factor(expr.num.c().real(), k) : null;
        if (p1) p1 = MultiPolynomial.Const(p1, expr.num.symbol, expr.num.ring);
    }
    else
    {
        p1 = poly_pp_factor(expr.num, k);
    }
    if (expr.den.isConst())
    {
        p2 = expr.den.isReal() ? num_pp_factor(expr.den.c().real(), k) : null;
        if (p2) p2 = MultiPolynomial.Const(p2, expr.den.symbol, expr.den.ring);
    }
    else
    {
        p2 = poly_pp_factor(expr.den, k);
    }

    if (!p1 && !p2) return null;

    I1 = MultiPolynomial.One(expr.num.symbol, expr.num.ring);
    I2 = MultiPolynomial.One(expr.den.symbol, expr.den.ring);
    p1 = p1 || I1;
    p2 = p2 || I2;

    if ((qr = p1.divmod(p2))[1].equ(0))
    {
        p1 = qr[0];
        p2 = I2;
    }
    else if ((qr = p2.divmod(p1))[1].equ(0))
    {
        p2 = qr[0];
        p1 = I1;
    }

    a = {
        num:p1,
        den:p2
    };

    if (p2.maxdeg(true) > p1.maxdeg(true))
    {
        b = {
            num:expr.num,
            den:expr.den.mul(p1.pow(k)).div(p2.pow(k))
        };
    }
    else
    {
        b = {
            num:expr.num.mul(p2.pow(k)).div(p1.pow(k)),
            den:expr.den
        };
    }

    if ((qr = b.num.divmod(b.den))[1].equ(0))
    {
        b.num = qr[0];
        b.den = I2;
    }
    else if ((qr = b.den.divmod(b.num))[1].equ(0))
    {
        b.den = qr[0];
        b.num = I1;
    }

    if (is_expr || as_expr)
    {
        a = a.num.toExpr().div(a.den.toExpr());
        b = b.num.toExpr().div(b.den.toExpr());
    }
    return [a, b];
}
function sqrt(x, n)
{
    if (null == n) n = 2;
    return Expr('^', [to_expr(x), to_expr(Rational(1, n))]);
}
function expr_unify(expr1, expr2)
{
    // TODO
    return expr1;
}
function expr_derivative(f, x)
{
    var O = Expr.Zero(), I = Expr.One(), fi = f.ast.arg;
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
            // exp derivative rule
            case 'exp()':
                return expr_derivative(fi[0], x).mul(f);

            // log derivative rule
            case 'log()':
                return expr_derivative(fi[0], x).div(fi[0]);

            // sin derivative rule
            case 'sin()':
                return expr_derivative(fi[0], x).mul(Expr('cos()', fi));

            // cos derivative rule
            case 'cos()':
                return expr_derivative(fi[0], x).mul(Expr('sin()', fi).neg());

            // tan derivative rule
            case 'tan()':
                return expr_derivative(Expr('sin()', fi).div(Expr('cos()', fi)), x);

            // sinh derivative rule
            case 'sinh()':
                return expr_derivative(fi[0], x).mul(Expr('cosh()', fi));

            // cosh derivative rule
            case 'cosh()':
                return expr_derivative(fi[0], x).mul(Expr('sinh()', fi));

            // tanh derivative rule
            case 'tanh()':
                return expr_derivative(Expr('sinh()', fi).div(Expr('cosh()', fi)), x);

            // power derivative rule
            case '^':
                if (-1 === fi[1].symbols().indexOf(x))
                {
                    return fi[1].mul(fi[0].pow(fi[1].sub(I)));
                }
                else
                {
                    return expr_derivative(Expr('log()', [fi[0]]).mul(fi[1]), x).mul(f)/*expr_derivative(Expr('exp()', [Expr('log()', [fi[0]]).mul(fi[1])]), x)*/; // f(x)^g(x) rule ==> exp(log(f(x))*g(x)) = (log(f(x))*g(x))' * f(x)^g(x)
                }

            // product derivative rule
            case '*':
                if (0 < fi.length)
                {
                    return Expr('+', fi.map(function(fi, i, args) {
                        var di, dfi = expr_derivative(fi, x);
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
                    return ((expr_derivative(fi[0], x).mul(fi[1])).sub(fi[0].mul(expr_derivative(fi[1], x)))).div(fi[1].mul(fi[1]));
                }
                return 1 === fi.length ? expr_derivative(fi[0], x) : O;

            // differentiate only the arguments rule (applicable?)
            case 'abs()':
            case 'min()':
            case 'max()':

            case 'not':
            case 'and':
            case 'or':

            case '>=':
            case '<=':
            case '!=':
            case '>':
            case '<':
            case '=':

            // linearity derivative rule
            case '+':
            case '-':
                return Expr(f.ast.op, fi.map(function(fi) {return expr_derivative(fi, x);}));

            // unknown / not supported currently
            default:
                return O;
        }
    }
}
function expr_poly(expr, symbol, other_symbols, ring, CoefficientRing, imagUnit)
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
                    coeff_term['1'] = ring.CoefficientRing.fromExpr(Expr('', arg))/*.fromString(arg)*/;
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
    var PolynomialClass = is_array(symbol) ? MultiPolynomial : Polynomial,
        ast = expr.ast, term, coeff, exp;

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
    else if (expr.isConst(true))
    {
        // constant
        return get_term(expr.c(true));
    }
    else //if ('expr' === ast.type)
    {
        if (('+' === ast.op) || ('-' === ast.op) || ('*' === ast.op))
        {
            // combine subexpression polynomials
            return ast.arg.reduce(function(result, subexpr, i) {
                if (0 === i)
                {
                    return expr_poly(subexpr, symbol, other_symbols, ring, CoefficientRing, imagUnit);
                }
                else if (null == result)
                {
                    return result;
                }
                else
                {
                    subexpr = expr_poly(subexpr, symbol, other_symbols, ring, CoefficientRing, imagUnit);
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
                    return expr_poly(subexpr, symbol, other_symbols, ring, CoefficientRing, imagUnit);
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
                        if (subexpr.num.isConst(true))
                        {
                            coeff = subexpr.num.c(true).inv();
                        }
                        else if (!ring.isField()/*!is_class(ring.PolynomialClass, RationalFunc)*/)
                        {
                            return null; // not supported
                        }
                        else
                        {
                            coeff = expr_poly(subexpr.num, ring.PolynomialSymbol, other_symbols, ring.CoefficientRing, CoefficientRing.CoefficientRing, imagUnit);
                            if (null == coeff) return null;
                            coeff = /*RationalFunc(MultiPolynomial.One(ring.PolynomialSymbol, ring.CoefficientRing), coeff, null, null, true)*/ring.cast(coeff).inv();
                        }
                    }
                    else
                    {
                        coeff = subexpr.num.toPoly(other_symbols, ring, imagUnit);
                        if (null == coeff) return null;
                        coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), coeff, null, null, true);
                    }
                    subexpr = expr_poly(subexpr.den, symbol, other_symbols, ring, CoefficientRing, imagUnit);
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
                        if (ast.arg[0].num.isConst(true))
                        {
                            coeff = MultiPolynomial({'1':ast.arg[0].num.c(true).inv()}, ring.PolynomialSymbol, ring.CoefficientRing);
                        }
                        else if (!ring.isField()/*!is_class(ring.PolynomialClass, RationalFunc)*/)
                        {
                            return null; // not supported
                        }
                        else
                        {
                            term = expr_poly(ast.arg[0].num, ring.PolynomialSymbol, other_symbols, ring.CoefficientRing, CoefficientRing.CoefficientRing, imagUnit);
                            if (null != term) coeff = /*RationalFunc(MultiPolynomial.One(ring.PolynomialSymbol, ring.CoefficientRing), term, null, null, true)*/ring.cast(term).inv();
                        }
                    }
                    else
                    {
                        term = ast.arg[0].num.toPoly(other_symbols, ring, imagUnit);
                        if (null != term) coeff = RationalFunc(MultiPolynomial.One(other_symbols, ring), term, null, null, true);
                    }
                    if (null != coeff)
                    {
                        term = expr_poly(ast.arg[0].den, symbol, other_symbols, ring, CoefficientRing, imagUnit);
                        if (null != term)
                        {
                            term = term._mul(PolynomialClass.Const(coeff, symbol, CoefficientRing));
                        }
                    }
                }
            }
            else //if (exp.gt(0))
            {
                term = expr_poly(ast.arg[0], symbol, other_symbols, ring, CoefficientRing, imagUnit);
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
function expr_neg(expr)
{
    return expr.neg();
}
function expr_tex(expr)
{
    return is_callable(expr.toTex) ? expr.toTex() : String(expr);
}
function expr_str(expr)
{
    return is_callable(expr.toString) ? expr.toString() : String(expr);
}
function needs_parentheses(expr, is_tex, in_pow)
{
    return (in_pow && ('^' === expr.ast.op)) || (expr.isSimple() && expr.isConst() && !expr.c().isReal() && !expr.c().isImag()) || !(('()' === expr.ast.op.slice(-2)) || (expr.isSimple() && ((expr.c().isReal() && expr.c().real().isInt()) || (expr.c().isImag() && expr.c().imag().isInt()))) || (('^' === expr.ast.op) && expr.ast.arg[0].isSimple() && (('' === expr.ast.arg[1].ast.op) && expr.ast.arg[1].isInt() || is_tex)) || (!in_pow && is_tex && ('/' === expr.ast.op)));
}

// convenience methods
Abacus.Expand = function(expr) {
    if (is_string(expr)) expr = Expr(expr);
    if (is_instance(expr, Expr)) expr = expr.expand();
    return expr;
};
Abacus.Simplify = function(expr) {
    if (is_string(expr)) expr = Expr(expr);
    if (is_instance(expr, Expr)) expr = expr.simplify();
    return expr;
};
