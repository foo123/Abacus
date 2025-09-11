// Abacus.Matrix, represents a (2-dimensional) (dense) matrix with coefficients from a ring, default Ring.Z()
Matrix = Abacus.Matrix = Class(INumber, {

    constructor: function Matrix(ring, r, c, values) {
        var self = this, k, v, i, j;
        if (!is_instance(self, Matrix))
        {
            return 4 > arguments.length ? (new Matrix(arguments[0], arguments[1], arguments[2])) : (new Matrix(ring, r, c, values));
        }

        if (4 > arguments.length)
        {
            // ring is skipped and implicit in the values
            values = c;
            c = r;
            r = ring;
            ring = null;
        }
        self.ring = is_instance(ring, Ring) ? ring : null;

        if (is_instance(r, Matrix))
        {
            self.val = r.val.map(function(row) {return row.slice()});
            if (null == self.ring) self.ring = r.ring;
            if (self.ring !== r.ring) self.val = self.ring.cast(self.val);
        }
        else if (is_array(r) || is_args(r))
        {
            if (!is_array(r[0]) && !is_args(r[0]))
            {
                self.val = c ? /*row*/array(1, function(i) {
                    return array(r.length, function(j) {
                        return r[j];
                    });
                }) : /*column*/array(r.length, function(i) {
                    return array(1, function(j) {
                        return r[i];
                    });
                });
            }
            else
            {
                if (is_args(r)) r = slice.call(r);
                if (is_args(r[0])) r = r.map(function(ri) {return slice.call(ri);});
                self.val = r;
            }
            if (null == self.ring) self.ring = is_instance(self.val[0][0].ring, Ring) ? self.val[0][0].ring : Ring.Z();
            self.val = self.ring.cast(self.val);
        }
        else //if (is_number(r) && is_number(c))
        {
            if (null == c) c = r; // square
            r = (+(r || 0))|0; c = (+(c || 0))|0;
            if (0 > r) r = 0;
            if (0 > c) c = 0;
            self.val = array(r, function(i) {
                return array(c, function(j) {
                    return 0;
                });
            });
            if (is_obj(values))
            {
                for (k in values)
                {
                    if (!HAS.call(values, k) || (-1 === k.indexOf(','))) continue;
                    v = values[k];
                    k = k.split(',').map(function(n) {return parseInt(trim(n), 10);});
                    i = k[0]; j = k[1];
                    if (0 <= i && i < self.val.length && 0 <= j && j < self.val[0].length)
                    {
                        if (null == self.ring) self.ring = is_instance(v.ring, Ring) ? v.ring : Ring.Z();
                        self.val[i][j] = v;
                    }
                }
            }
            self.val = self.ring.cast(self.val);
        }
        self.nr = self.val.length;
        self.nc = self.nr ? self.val[0].length : 0;
    }

    ,__static__: {
        hasInverse: function() {
            return false;
        }
        ,isCommutative: function() {
            return false;
        }

        ,Zero: function(ring, r, c) {
            ring = ring || Ring.Z();
            return Matrix.C(ring, r, c, ring.Zero());
        }
        ,One: function(ring, n) {
            ring = ring || Ring.Z();
            return Matrix.D(ring, n, n, ring.One());
        }
        ,I: function(ring, n) {
            return Matrix.One(ring, n);
        }
        ,C: function(ring, r, c, v) {
            ring = ring || Ring.Z();
            v = v || ring.Zero();
            if (null == c) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(ring, array(r, function(i) {
                return array(c, function(j) {
                    return v;
                });
            }));
        }
        ,D: function(ring, r, c, v) {
            ring = ring || Ring.Z();
            var O = ring.Zero();
            v = ring.cast(v || O);
            if (null == c) c = r; // square
            r = +r; c = +c;
            return (0 > r) || (0 > c) ? null : new Matrix(ring, array(r, function(i) {
                return array(c, function(j) {
                    if (i === j)
                    {
                        if (is_array(v) || is_args(v))
                            return i < v.length ? v[i] : O;
                        else
                            return v;
                    }
                    else
                    {
                        return O;
                    }
                });
            }));
        }
        ,T: function(m) {
            // transpose
            var rows = m.length, columns = rows ? m[0].length : 0;
            return array(columns, function(j) {
                return array(rows, function(i) {
                    return m[i][j];
                });
            });
        }
        ,ARR: function(ring, a, r, c) {
            // shape 1-D array into an r x c matrix
            ring = ring || Ring.Z();
            return Matrix(ring, array(r, function(i) {
                return array(c, function(j) {
                    var k = i*c + j;
                    return k < a.length ? ring.cast(a[k]) : ring.Zero();
                });
            }));
        }
        ,SWAPR: function(m, i, j) {
            // swap rows i and j
            if (i !== j)
            {
                var t = m[i];
                m[i] = m[j];
                m[j] = t;
            }
            return m;
        }
        ,SWAPC: function(m, i, j) {
            // swap columns i and j
            if (i !== j)
            {
                var k, n = m.length, t;
                for (k=0; k<n; ++k)
                {
                    t = m[k][i];
                    m[k][i] = m[k][j];
                    m[k][j] = t;
                }
            }
            return m;
        }
        ,ADDR: function(ring, m, i, j, a, b, k0) {
            ring = ring || Ring.Z();
            // add (a multiple of) row j to (a multiple of) row i
            var k, n = m[0].length;
            if (null == a) a = ring.One();
            if (null == b) b = ring.One();
            for (k=k0||0; k<n; ++k)
                m[i][k] = ring.cast(b.mul(m[i][k]).add(a.mul(m[j][k])));
            return m;
        }
        ,ADDC: function(ring, m, i, j, a, b, k0) {
            ring = ring || Ring.Z();
            // add (a multiple of) column j to (a multiple of) column i
            var k, n = m.length;
            if (null == a) a = ring.One();
            if (null == b) b = ring.One();
            for (k=k0||0; k<n; ++k)
                m[k][i] = ring.cast(b.mul(m[k][i]).add(a.mul(m[k][j])));
            return m;
        }
        ,MULR: function(ring, m, i0, i1, a, b, c, d) {
            ring = ring || Ring.Z();
            var j, l = m[0].length, x, y;
            for (j=0; j<l; ++j)
            {
                x = m[i0][j]; y = m[i1][j];
                m[i0][j] = ring.cast(a.mul(x).add(b.mul(y)));
                m[i1][j] = ring.cast(c.mul(x).add(d.mul(y)));
            }
            return m;
        }
        ,MULC: function(ring, m, j0, j1, a, b, c, d) {
            ring = ring || Ring.Z();
            var i, l = m.length, x, y;
            for (i=0; i<l; ++i)
            {
                x = m[i][j0]; y = m[i][j1];
                m[i][j0] = ring.cast(a.mul(x).add(c.mul(y)));
                m[i][j1] = ring.cast(b.mul(x).add(d.mul(y)));
            }
            return m;
        }

        ,toString: function(m, bar) {
            if (!is_array(m)) return String(m);
            bar = String(bar || '|');
            // compute length of greatest entry in matrix (per column)
            // so to pad other entries (in same column) same to aling properly
            var max = is_array(m[0]) ? array(m[0].length, 0) : 0;
            m = m.map(function(mi, i) {
                if (is_array(mi))
                {
                    return mi.map(function(mij, j) {
                        var s = String(mij);
                        if (is_array(max))
                        {
                            if (s.length > max[j])
                                max[j] = s.length;
                        }
                        else
                        {
                            if (s.length > max)
                                max = s.length;
                        }
                        return s;
                    });
                }
                else
                {
                    var s = String(mi);
                    if (is_array(max))
                    {
                        if (s.length > max[0])
                            max[0] = s.length;
                    }
                    else
                    {
                        if (s.length > max)
                            max = s.length;
                    }
                    return s;
                }
            });

            return m.map(function(mi, i) {
                return bar + (is_array(mi) ? mi.map(function(mij, j) {return pad(mij, is_array(max) ? max[j] : max);}).join(' ') : pad(mi, is_array(max) ? max[0] : max)) + bar;
            }).join("\n");
        }
        ,toTex: function(m, type) {
            if (!is_array(m)) return Tex(m);
            type = 'pmatrix' === type ? 'pmatrix' : 'bmatrix';
            return '\\begin{' + type + '}' + m.map(function(x) {return is_array(x) ? x.map(function(xi) {return Tex(xi);}).join(' & ') : Tex(x);}).join(' \\\\ ') + '\\end{' + type + '}';
        }
        ,toDec: function(m, precision, bar) {
            if (!is_array(m)) return is_callable(m.toDec) ? m.toDec(precision) : String(m);
            bar = String(bar || '|');
            // compute length of greatest entry in matrix (per column)
            // so to pad other entries (in same column) same to aling properly
            var max = is_array(m[0]) ? array(m[0].length, 0) : 0;
            m = m.map(function(mi, i) {
                if (is_array(mi))
                {
                    return mi.map(function(mij, j) {
                        var d = mij.toDec(precision);
                        if (is_array(max))
                        {
                            if (d.length > max[j])
                                max[j] = d.length;
                        }
                        else
                        {
                            if (d.length > max)
                                max = d.length;
                        }
                        return d;
                    });
                }
                else
                {
                    var d = mi.toDec(precision);
                    if (is_array(max))
                    {
                        if (d.length > max[0])
                            max[0] = d.length;
                    }
                    else
                    {
                        if (d.length > max)
                            max = d.length;
                    }
                    return d;
                }
            });
            return m.map(function(mi, i) {
                return bar + (is_array(mi) ? mi.map(function(mij, j){return pad(mij, is_array(max) ? max[j] : max);}).join(' ') : pad(mi, is_array(max) ? max[0] : max)) + bar;
            }).join("\n");
        }
    }

    ,nr: 0
    ,nc: 0
    ,val: null
    ,ring: null
    ,_str: null
    ,_tex: null
    ,_n: null
    ,_t: null
    ,_h: null
    ,_a: null
    ,_i: null
    ,_gi: null
    ,_p: null
    ,_snf: null
    ,_lu: null
    ,_qr: null
    ,_ldl: null
    ,_ref: null
    ,_rref: null
    ,_rf: null
    ,_evd: null
    ,_svd: null
    ,_rn: null
    ,_ln: null
    ,_rs: null
    ,_cs: null
    ,_tr: null
    ,_det: null

    ,dispose: function() {
        var self = this;
        if (self._n && (self === self._n._n))
        {
            self._n._n = null;
        }
        if (self._t && (self === self._t._t))
        {
            self._t._t = null;
            /*self._t._tr = null;
            self._t._det = null;*/
        }
        if (self._h && (self === self._h._h))
        {
            self._h._h = null;
        }
        if (self._i && (self === self._i._i))
        {
            self._i._i = null;
        }
        if (self._gi && (self === self._gi._gi))
        {
            self._gi._gi = null;
        }
        self.nr = null;
        self.nc = null;
        self.val = null;
        self.ring = null;
        self._str = null;
        self._tex = null;
        self._n = null;
        self._t = null;
        self._h = null;
        self._a = null;
        self._i = null;
        self._gi = null;
        self._p = null;
        self._snf = null;
        self._lu = null;
        self._qr = null;
        self._ldl = null;
        self._ref = null;
        self._rref = null;
        self._rf = null;
        self._evd = null;
        self._svd = null;
        self._rn = null;
        self._ln = null;
        self._rs = null;
        self._cs = null;
        self._tr = null;
        self._det = null;
        return self;
    }

    ,clone: function(raw) {
        var self = this, m = self.val.map(function(row) {return row.slice();});
        return true === raw ? m : new Matrix(self.ring, m);
    }
    ,map: function(f, raw) {
        var self = this, m;
        m = self.val.map(function(vi, i) {
            return vi.map(function(vij, j) {
                return f(vij, [i, j], self);
            });
        });
        return true === raw ? m : new Matrix(self.ring, m);
    }
    ,array: function(column_order) {
        var self = this;
        // return matrix as 1-D array of stacking row after row or column after column (if column_order)
        return column_order ? array(self.nr*self.nc, function(k) {
            return self.val[k % self.nr][~~(k / self.nr)];
        }) : array(self.nr*self.nc, function(k) {
            return self.val[~~(k / self.nc)][k % self.nc];
        });
    }
    ,row: function(r) {
        var self = this;
        return 0 <= r && r < self.nr ? self.val[r].slice() : null;
    }
    ,col: function(c) {
        var self = this;
        return 0 <= c && c < self.nc ? array(self.nr, function(i) {return self.val[i][c];}) : null;
    }
    ,diag: function(k) {
        // k = 0 chooses center diagonal, k>0 chooses diagonal to the right, k<0 diagonal to the left
        var self = this, r, c;
        k = k || 0; r = 0 < k ? 0 : -k; c = r ? 0 : k;
        return 0 <= c && c < self.nc && 0 <= r && r < self.nr ? array(stdMath.min(self.nr-r, self.nc-c), function(i) {return self.val[r+i][c+i];}) : null;
    }
    ,entry: function(r, c, v) {
        var self = this, rows = self.nr, columns = self.nc;
        if (0 > r) r += rows;
        if (0 > c) c += columns;
        if (!(0 <= r && r < rows && 0 <= c && c < columns)) return null == v ? null : self;
        if (null != v)
        {
            v = self.ring.cast(v);
            if (!self.val[r][c].equ(v))
            {
                // force update of associated cached entries
                if (self._n && (self === self._n._n))
                {
                    self._n._n = null;
                }
                if (self._t && (self === self._t._t))
                {
                    self._t._t = null;
                    //self._t._tr = null;
                    //self._t._det = null;
                }
                if (self._h && (self === self._h._h))
                {
                    self._h._h = null;
                }
                if (self._i && (self === self._i._i))
                {
                    self._i._i = null;
                }
                if (self._gi && (self === self._gi._gi))
                {
                    self._gi._gi = null;
                }
                self._str = null;
                self._tex = null;
                self._n = null;
                self._t = null;
                self._h = null;
                self._a = null;
                self._i = null;
                self._gi = null;
                self._p = null;
                self._snf = null;
                self._lu = null;
                self._qr = null;
                self._ldl = null;
                self._ref = null;
                self._rref = null;
                self._rf = null;
                self._evd = null;
                self._svd = null;
                self._rn = null;
                self._ln = null;
                self._rs = null;
                self._cs = null;
                self._tr = null;
                self._det = null;
                self.val[r][c] = v;
            }
            return self;
        }
        return self.val[r][c];
    }

    ,isSquare: function() {
        var self = this;
        return self.nr === self.nc;
    }
    ,isScalar: function() {
        var self = this;
        return (1 === self.nr) && (1 === self.nc);
    }
    ,isInt: function() {
        var self = this, r = self.nr, c = self.nc, i, j;
        if (is_class(self.ring.NumberClass, Integer)) return true;
        for (i=0; i<r; ++i)
        {
            for (j=0; j<c; ++j)
            {
                if (!self.val[i][j].isInt())
                    return false;
            }
        }
        return true;
    }
    ,isReal: function() {
        var self = this, r = self.nr, c = self.nc, i, j;
        if (!is_class(self.ring.NumberClass, Complex)) return true;
        for (i=0; i<r; ++i)
        {
            for (j=0; j<c; ++j)
            {
                if (!self.val[i][j].isReal())
                    return false;
            }
        }
        return true;
    }
    ,isImag: function() {
        var self = this, r = self.nr, c = self.nc, i, j;
        if (!is_class(self.ring.NumberClass, Complex)) return false;
        for (i=0; i<r; ++i)
        {
            for (j=0; j<c; ++j)
            {
                if (!self.val[i][j].isImag())
                    return false;
            }
        }
        return true;
    }

    ,equ: function(a, eq_all) {
        var self = this, i, j, r = self.nr, c = self.nc;

        if (is_instance(a, Matrix))
        {
            if ((r !== a.nr) || (c !== a.nc)) return false;
            for (i=0; i<r; ++i)
                for (j=0; j<c; ++j)
                    if (!self.val[i][j].equ(a.val[i][j]))
                        return false;
            return true;
        }
        //a = self.ring.cast(a);
        if (true === eq_all)
        {
            for (i=0; i<r; ++i)
                for (j=0; j<c; ++j)
                    if (!self.val[i][j].equ(a))
                        return false;
            return true;
        }
        else
        {
            return (1 === r) && (1 === c) && self.val[0][0].equ(a);
        }
        return false;
    }
    ,gt: function(a) {
        var self = this;
        if (1 === self.nr && 1 === self.nc) return self.val[0][0].gt(a);
        return false;
    }
    ,gte: function(a) {
        var self = this;
        if (1 === self.nr && 1 === self.nc) return self.val[0][0].gte(a);
        return false;
    }
    ,lt: function(a) {
        var self = this;
        if (1 === self.nr && 1 === self.nc) return self.val[0][0].lt(a);
        return false;
    }
    ,lte: function(a) {
        var self = this;
        if (1 === self.nr && 1 === self.nc) return self.val[0][0].lte(a);
        return false;
    }

    ,real: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
            return self.map(function(vij) {return vij.real();});
        return self;
    }
    ,imag: function() {
        var self = this, ring = self.ring;
        if (is_class(ring.NumberClass, Complex))
            return self.map(function(vij) {return vij.imag();});
        return Matrix.Zero(ring, self.nr, self.nc);
    }
    ,neg: function() {
        var self = this;
        if (null == self._n)
        {
            self._n = self.map(function(vij) {return vij.neg();});
            self._n._n = self;
        }
        return self._n;
    }
    ,t: function() {
        // transpose
        var self = this;
        if (null == self._t)
        {
            self._t = Matrix(self.ring, Matrix.T(self.val));
            self._t._t = self; // avoid recomputations we have it already
            self._t._tr = self._tr; // same for transpose
            self._t._det = self._det; // same for transpose
        }
        return self._t;
    }
    ,h: function() {
        // hermitian transpose
        var self = this, ring, rows, columns;
        if (self.ring.NumberClass !== Complex) return self.t();
        if (null == self._h)
        {
            ring = self.ring; rows = self.nr; columns = self.nc;
            self._h = Matrix(ring, array(columns, function(j) {
                return array(rows, function(i) {
                    return self.val[i][j].conj();
                });
            }));
            self._h._h = self;
        }
        return self._h;
    }
    ,inv: function() {
        var self = this, rows, columns, ring, field, rref;
        if (null == self._i)
        {
            rows = self.nr; columns = self.nc;
            if (rows !== columns)
            {
                // only for square matrices
                self._i = false;
            }
            else
            {
                ring = self.ring;
                // compute inverse through augmented rref (Gauss-Jordan method)
                rref = self.rref(true);
                if (rref[0].val[rows-1][columns-1].equ(ring.Zero()))
                {
                    // not full-rank, no inverse
                    self._i = false;
                }
                else
                {
                    // full-rank, has inverse, generaly in the field of fractions
                    field = ring.associatedField();
                    self._i = Matrix(field, rref[3].map(function(aug_ij, ij) {
                        return field.cast(aug_ij).div(field.cast(rref[0].val[ij[0]][ij[0]]));
                    }, true));
                    self._i._i = ring.isField() ? self : Matrix(field, self);
                }
            }
        }
        return self._i;
    }
    ,ginv: function() {
        // generalised inverse / Moore-Penrose Inverse
        // https://en.wikipedia.org/wiki/Moore%E2%80%93Penrose_inverse
        var A = this, ring, field, rows, columns, rank, rf, C, F;
        if (null == A._gi)
        {
            rows = A.nr; columns = A.nc;
            ring = A.ring;
            field = ring.associatedField();
            if (A.equ(ring.Zero(), true))
            {
                // zero matrix, ginv is transpose
                A._gi = A.t();
            }
            else if (1 === rows && 1 === columns)
            {
                // scalar, ginv is inverse
                A._gi = Matrix(field, [[field.cast(A.val[0][0]).inv()]]);
            }
            else if (1 === rows || 1 === columns)
            {
                // vector, ginv is transpose divided by square norm
                C = field.cast(A.array().reduce(function(s, ai) {
                    return s.add(ai.mul(ai.conj()));
                }, ring.Zero()));
                A._gi = Matrix(field, A.h().map(function(aij, ij) {
                    return field.cast(aij).div(C);
                }, true));
            }
            else
            {
                rank = A.rank();
                if (rank === columns)
                {
                    // linearly independent columns
                    if (rows === columns)
                    {
                        // invertible, ginv is inverse
                        A._gi = A.inv();
                    }
                    else
                    {
                        // A+ = inv(Ah * A) * Ah
                        A._gi = A.h().mul(A).inv().mul(A.h());
                    }
                }
                else if (rank === rows)
                {
                    // linearly independent rows
                    // A+ = Ah * inv(A * Ah)
                    A._gi = A.h().mul(A.mul(A.h()).inv());
                }
                else
                {
                    // general matrix, through rank factorisation
                    // A = C F <=> A+ = F+ C+
                    // where F+ = Fh * inv(F * Fh) and C+ = inv(Ch * C) * Ch
                    rf = A.rankf(); C = rf[0]; F = rf[1];
                    A._gi = F.h().mul(F.mul(F.h()).inv()).mul(C.h().mul(C).inv().mul(C.h()));
                }
            }
            A._gi._gi = ring.isField() ? A : Matrix(field, A);
        }
        return A._gi;
    }
    ,minor: function(ai, aj, cofactor) {
        // https://en.wikipedia.org/wiki/Minor_(linear_algebra)
        var self = this, rows = self.nr, columns = self.nc, ring = self.ring, m;
        if (rows !== columns) return null;
        if (1 >= rows) return ring.Zero();
        ai = +(ai||0); aj = +(aj||0);
        if (ai < 0 || ai >= rows || aj < 0 || aj >= columns) return null;
        m = Matrix(ring, array(rows-1, function(i) {
            if (i >= ai) ++i;
            return array(columns-1, function(j) {
                if (j >= aj) ++j;
                return self.val[i][j];
            });
        })).det();
        if ((true === cofactor) && ((ai+aj)&1)) m = m.neg();
        return m;
    }
    ,adj: function() {
        // https://en.wikipedia.org/wiki/Adjugate_matrix
        // https://en.wikipedia.org/wiki/Minor_(linear_algebra)#Inverse_of_a_matrix
        // https://en.wikipedia.org/wiki/Cramer%27s_rule
        var self = this, rows, columns, ring;
        if (null == self._a)
        {
            rows = self.nr; columns = self.nc;
            if (rows !== columns)
            {
                self._a = false;
            }
            else
            {
                ring = self.ring;
                self._a = Matrix(ring, array(columns, function(j) {
                    return array(rows, function(i) {
                        return self.minor(i, j, true);
                    });
                }));
            }
        }
        return self._a;
    }
    ,charpoly: function(x) {
        // https://en.wikipedia.org/wiki/Characteristic_polynomial
        // https://en.wikipedia.org/wiki/Faddeev%E2%80%93LeVerrier_algorithm
        // https://en.wikipedia.org/wiki/Samuelson%E2%80%93Berkowitz_algorithm
        var A = this, rows = A.nr, columns = A.nc, ring, k, n, M, coeff;
        if (rows !== columns) return null; // only for square matrices
        if (null == A._p)
        {
            x = String(x || 'x');
            ring = A.ring;
            n = rows;
            coeff = new Array(n+1);
            M = Matrix(ring, n, n); // zero
            coeff[n] = ring.One();
            for (k=1; k<=n; ++k)
            {
                M = A.mul(M).map(function(vij, ij) {
                    // .add(I.mul(coeff[n-k+1]))
                    return ij[0] === ij[1] ? vij.add(coeff[n-k+1]) : vij;
                });
                coeff[n-k] = A.mul(M).tr().div(-k);
            }
            A._p = ring.PolynomialClass ? Polynomial(coeff.map(function(c) {return RationalFunc(c);}), x, ring.CoefficientRing) : Polynomial(coeff, x, ring);
        }
        return A._p;
    }

    ,add: function(a) {
        var self = this;

        if (is_instance(a, Matrix))
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i) {
                if (i >= a.nr) return self.val[i].slice();
                else if (i >= self.nr) return a.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j) {
                    if (j >= a.nc) return self.val[i][j];
                    else if (j >= self.nc) return a.val[i][j];
                    return self.val[i][j].add(a.val[i][j]);
                });
            }));
        }
        if (is_number(a) || is_string(a)) a = self.ring.cast(a);
        return self.map(function(vij) {return vij.add(a);});
    }
    ,sub: function(a) {
        var self = this;

        if (is_instance(a, Matrix))
        {
            // NOTE: pads with zeroes if dims do not match
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i) {
                if (i >= a.nr) return self.val[i].slice();
                else if (i >= self.nr) return a.val[i].map(function(aij) {return Arithmetic.neg(aij);});
                return array(stdMath.max(self.nc, a.nc), function(j) {
                    if (j >= a.nc) return self.val[i][j];
                    else if (j >= self.nc) return Arithmetic.neg(a.val[i][j]);
                    return self.val[i][j].sub(a.val[i][j]);
                });
            }));
        }
        if (is_number(a) || is_string(a)) a = self.ring.cast(a);
        return self.map(function(vij) {return vij.sub(a);});
    }
    ,mul: function(a) {
        var self = this, n, zero;

        if (is_instance(a, Matrix))
        {
            //if (self.nc !== a.nr) return null; // dims do not match for multiplication
            n = stdMath.min(self.nc, a.nr); // generalise multiplication
            zero = self.ring.Zero();
            return Matrix(self.ring, array(self.nr, function(i) {
                return array(a.nc, function(j) {
                    for (var d=zero,k=0; k<n; ++k)
                        d = d.add(self.val[i][k].mul(a.val[k][j]));
                    return d;
                });
            }));
        }
        if (is_number(a) || is_string(a)) a = self.ring.cast(a);
        return self.map(function(vij) {return vij.mul(a);});
    }
    ,dot: function(a) {
        var self = this;
        // pointwise multiplication

        if (is_instance(a, Matrix))
        {
            return Matrix(self.ring, array(stdMath.max(self.nr, a.nr), function(i) {
                if (i >= self.nr) return a.val[i].slice();
                else if (i >= a.nr) return self.val[i].slice();
                return array(stdMath.max(self.nc, a.nc), function(j) {
                    if (j >= self.nc) return a.val[i][j];
                    else if (j >= a.nc) return self.val[i][j];
                    return self.val[i][j].mul(a.val[i][j]);
                })
            }));
        }
        if (is_number(a) || is_string(a)) a = self.ring.cast(a);
        return self.map(function(vij) {return vij.mul(a);});
    }
    ,prod: function(a) {
        var self = this, r1, c1, r2, c2, r, c;
        // kronecker product

        if (is_instance(a, Matrix))
        {
            r1 = self.nr; c1 = self.nc;
            r2 = a.nr; c2 = a.nc;
            r = r1*r2; c = c1*c2;
            return Matrix(self.ring, array(r, function(i) {
                var i1 = ~~(i / r2), i2 = i % r2;
                return array(c, function(j) {
                    var j1 = ~~(j / c2), j2 = j % c2;
                    return self.val[i1][j1].mul(a.val[i2][j2]);
                });
            }));
        }
        if (is_number(a) || is_string(a)) a = self.ring.cast(a);
        return self.map(function(vij) {return vij.mul(a);});
    }
    ,div: function(a) {
        var self = this;
        if (is_instance(a, Numeric) || Abacus.Arithmetic.isNumber(a) || is_string(a))
        {
            if (is_number(a) || is_string(a)) a = self.ring.cast(a);
            return self.map(function(vij) {return vij.div(a);});
        }
        return self;
    }
    ,mod: function(a) {
        var self = this;
        if (is_instance(a, Numeric) || Abacus.Arithmetic.isNumber(a) || is_string(a))
        {
            if (is_number(a) || is_string(a)) a = self.ring.cast(a);
            return self.map(function(vij) {return vij.mod(a);});
        }
        return self;
    }
    ,divmod: function(a) {
        var self = this;
        return [self.div(a), self.mod(a)];
    }
    ,pow: function(n) {
        var self = this, Arithmetic = Abacus.Arithmetic, pow, b;
        n = Integer.cast(n);
        if (n.lt(Arithmetic.O) || n.gt(MAX_DEFAULT)) return null;
        n = Arithmetic.val(n.num);
        if (0 === n)
        {
            return Matrix.I(self.ring, /*stdMath.min(self.nr,*/ self.nc/*)*/);
        }
        else if (1 === n)
        {
            return self;
        }
        else
        {
            // exponentiation by squaring
            pow = null; b = self;
            while (0 !== n)
            {
                if (n & 1) pow = null == pow ? b : b.mul(pow);
                n >>= 1;
                b = b.mul(b);
            }
            return pow;
        }
    }
    ,fwdsub: function(b, D) {
        // self is assumed lower triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, L = self.val, n, x, xi, Lii;
        if (is_instance(b, Matrix)) b = b.col(0);
        if (is_instance(D, Matrix)) D = D.diag();
        b = ring.cast(b); if (D) D = ring.cast(D);
        n = stdMath.min(self.nr, self.nc, b.length);
        x = new Array(n);
        // fraction-free forward substitution
        for (i=0; i<n; ++i)
        {
            for (t=O,j=0; j<i; ++j) t = t.add(L[i][j].mul(x[j]));
            xi = b[i].sub(t); Lii = L[i][i];
            if (Lii.equ(O))
            {
                if (!xi.equ(O))
                    return null; // no solution
            }
            else
            {
                if (D)
                    xi = xi.mul(D[i].div(Lii));
                else if (Lii.divides(xi) )
                    xi = xi.div(Lii);
                else
                    return null; // no solution
            }
            x[i] = xi;
        }
        return x;
    }
    ,backsub: function(b, D) {
        // self is assumed upper triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, U = self.val, n, x, xi, Uii;
        if (is_instance(b, Matrix)) b = b.col(0);
        if (is_instance(D, Matrix)) D = D.diag();
        b = ring.cast(b); if (D) D = ring.cast(D);
        n = stdMath.min(self.nr, self.nc, b.length);
        x = new Array(n);
        // fraction-free back substitution
        for (i=n-1; i>=0; --i)
        {
            for (t=O,j=n-1; j>i; --j) t = t.add(U[i][j].mul(x[j]));
            xi = b[i].sub(t); Uii = U[i][i];
            if (Uii.equ(O))
            {
                if (!xi.equ(O))
                    return null; // no solution
            }
            else
            {
                if (D)
                    xi = xi.mul(D[i].div(Uii));
                else if (Uii.divides(xi))
                    xi = xi.div(Uii);
                else
                    return null; // no solution
            }
            x[i] = xi;
        }
        return x;
    }
    ,backsuby: function(y) {
        // self is assumed upper triangular
        var self = this, ring = self.ring, O = ring.Zero(), i, j, t, U = self.val, n, x, xi, Uii;
        if (is_instance(y, Matrix)) y = y.col(0);
        y = ring.cast(y);
        n = stdMath.min(self.nr, self.nc, y.length);
        x = new Array(n);
        // fraction-free back substitution (alternative version)
        // y is solution of lower triangular system L*inv(D)*y = P*b
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        for (i=n-1; i>=0; --i)
        {
            for (t=O,j=n-1; j>i; --j) t = t.add(U[i][j].mul(x[j]));
            xi = U[n-1][n-1].mul(y[i]).sub(t); Uii = U[i][i];
            if (!Uii.divides(xi))
                return null; // no solution
            else
                xi = xi.div(Uii);
            x[i] = xi;
        }
        return x;
    }
    ,snf: function() {
        var self = this, ring, O, I, J, rows, columns, dim, m, left, right,
            last_j, i, j, upd, ii, jj, non_zero, i1, i0, g,
            coef1, coef2, coef3, coef4, coef5, tmp, tmp2;
        // smith normal form
        // https://en.wikipedia.org/wiki/Smith_normal_form
        // adapted from Smith Normal Form with sympy (https://gist.github.com/qnighy/ec08799484080343a2da297657ccba65)
        if (null == self._snf)
        {
            ring = self.ring;
            if (!ring.hasGCD())
            {
                self._snf = false;
            }
            else
            {
                O = ring.Zero();
                I = ring.One();
                J = ring.MinusOne();
                rows = self.nr; columns = self.nc;
                dim = stdMath.min(rows, columns);
                m = self.clone(); left = Matrix.I(ring, rows); right = Matrix.I(ring, columns)
                last_j = -1;
                for (i=0; i<rows; ++i)
                {
                    non_zero = false;
                    for (j=last_j+1; j<columns; ++j)
                    {
                        for (i0=0; i0<rows; ++i0)
                            if (!m.val[i0][j].equ(O))
                                break;
                        if (i0 < rows)
                        {
                            non_zero = true;
                            break;
                        }
                    }
                    if (!non_zero) break;

                    if (m.val[i][j].equ(O) )
                    {
                        for (ii=0; ii<rows; ++ii)
                            if (!m.val[ii][j].equ(O))
                                break;
                        Matrix.MULR(ring, m.val, i, ii, O, I, I, O);
                        Matrix.MULC(ring, left.val, i, ii, O, I, I, O);
                    }
                    Matrix.MULC(ring, m.val, j, i, O, I, I, O);
                    Matrix.MULR(ring, right.val, j, i, O, I, I, O);
                    j = i;
                    upd = true;
                    while (upd)
                    {
                        upd = false;
                        for (ii=i+1; ii<rows; ++ii)
                        {
                            if (m.val[ii][j].equ(O)) continue;
                            upd = true;
                            if (!m.val[i][j].divides(m.val[ii][j]))
                            {
                                g = ring.xgcd(m.val[i][j], m.val[ii][j]);
                                coef1 = g[1]; coef2 = g[2];
                                coef3 = m.val[ii][j].div(g[0]);
                                coef4 = m.val[i][j].div(g[0]);
                                Matrix.MULR(ring, m.val, i, ii, coef1, coef2, coef3.neg(), coef4);
                                Matrix.MULC(ring, left.val, i, ii, coef4, coef2.neg(), coef3, coef1);
                            }
                            coef5 = m.val[ii][j].div(m.val[i][j]);
                            Matrix.MULR(ring, m.val, i, ii, I, O, coef5.neg(), I);
                            Matrix.MULC(ring, left.val, i, ii, I, O, coef5, I);
                        }
                        for (jj=j+1; jj<columns; ++jj)
                        {
                            if (m.val[i][jj].equ(O)) continue;
                            upd = true;
                            if (!m.val[i][j].divides(m.val[i][jj]))
                            {
                                g = ring.xgcd(m.val[i][j], m.val[i][jj]);
                                coef1 = g[1]; coef2 = g[2];
                                coef3 = m.val[i][jj].div(g[0]);
                                coef4 = m.val[i][j].div(g[0]);
                                Matrix.MULC(ring, m.val, j, jj, coef1, coef3.neg(), coef2, coef4);
                                Matrix.MULR(ring, right.val, j, jj, coef4, coef3, coef2.neg(), coef1);
                            }
                            coef5 = m.val[i][jj].div(m.val[i][j]);
                            Matrix.MULC(ring, m.val, j, jj, I, coef5.neg(), O, I);
                            Matrix.MULR(ring, right.val, j, jj, I, coef5, O, I);
                        }
                    }
                    last_j = j;
                }
                for (i1=0; i1<dim; ++i1)
                {
                    for (i0=i1-1; i0>=0; --i0)
                    {
                        g = ring.xgcd(m.val[i0][i0], m.val[i1][i1]);
                        if (g[0].equ(O)) continue;
                        coef1 = g[1]; coef2 = g[2];
                        coef3 = m.val[i1][i1].div(g[0]);
                        coef4 = m.val[i0][i0].div(g[0]);
                        tmp = coef2.mul(coef3);
                        tmp2 = I.sub(coef1.mul(coef4));
                        Matrix.MULR(ring, m.val, i0, i1, I, coef2, coef3, tmp.sub(I));
                        Matrix.MULC(ring, left.val, i0, i1, I.sub(tmp), coef2, coef3, J);
                        Matrix.MULC(ring, m.val, i0, i1, coef1, tmp2, I, coef4.neg());
                        Matrix.MULR(ring, right.val, i0, i1, coef4, tmp2, I, coef1.neg());
                    }
                }
                self._snf = [m/*diagonal center matrix*/, left/*left matrix*/, right/*right matrix*/];
            }
        }
        return self._snf ? self._snf.slice() : self._snf;
    }
    ,evd: function() {
        // eigendecomposition (using the power method)
        // https://en.wikipedia.org/wiki/Spectral_theorem
        // https://en.wikipedia.org/wiki/Eigendecomposition_of_a_matrix
        // https://en.wikipedia.org/wiki/Diagonalizable_matrix
        // https://en.wikipedia.org/wiki/Power_iteration
        var self = this, ring = self.ring, m = self.nr, n = self.nc, epsilon, matrixFor1D, e, u, i, j, es, us;
        return null;

        /*if (ring.isSymbolic() || (m !== n) || !self.h().equ(self)) return null; // only for square symmetric/hermitian diagonalisable numeric matrices

        function pow1(A, x, eps, max_iter) {
            var x0 = null, iter = 0, norm;
            if (is_class(ring.NumberClass, Complex))
            {
                norm = x.h().mul(x).val[0][0];
                if (norm.equ(0)) return null;
                x = x.div(norm.rad(2));
                for (;;)
                {
                    iter++;
                    x0= x;
                    x = A.mul(x);
                    norm = x.h().mul(x).val[0][0];
                    if (norm.equ(0)) return null;
                    x = x.div(norm.rad(2));
                    if ((null != max_iter) && (iter >= max_iter)) break;
                    if (x.h().mul(x0).val[0][0].norm().add(eps).gt(1)) break;
                }
            }
            else
            {
                norm = x.t().mul(x).val[0][0];
                if (norm.equ(0)) return null;
                x = x.div(norm.rad(2));
                for (;;)
                {
                    iter++;
                    x0 = x;
                    x = A.mul(x);
                    norm = x.t().mul(x).val[0][0];
                    if (norm.equ(0)) return null;
                    x = x.div(norm.rad(2));
                    if ((null != max_iter) && (iter >= max_iter)) break;
                    if (x.t().mul(x0).val[0][0].abs().add(eps).gt(1)) break;
                }
            }
            return x;
        }

        if (null == self._evd)
        {
            if (!ring.isField())
            {
                u = Matrix(ring.associatedField(), self);
                u.evd();
                self._evd = u._evd;
            }
            else
            {
                epsilon = Rational.Epsilon();
                es = []; us = [];
                matrixFor1D = self;
                for (i=0; i<n; i++)
                {
                    u = pow1(matrixFor1D, Matrix(ring, self.col(i)), epsilon, 10); // next eigen vector
                    if (null == u)
                    {
                        self._evd = false; // non diagonalisable
                        break;
                    }
                    e = u.h().mul(self.mul(u)).val[0][0].div(u.h().mul(u).val[0][0]); // next eigen value
                    es.push(e); us.push(u);
                    matrixFor1D = matrixFor1D.sub(u.mul(u.h()).mul(e));
                }
                if (false!==self._evd) self._evd = [Matrix(ring, es), Matrix(ring, Matrix.T(us.map(function(u){return u.col(0);})))/*, Matrix(ring, us).inv||.h()* /];
            }
        }
        return false===self._evd ? null : self._evd.slice();*/
    }
    ,svd: function() {
        // singular value decomposition
        // https://en.wikipedia.org/wiki/Singular_value_decomposition
        var self = this, ring = self.ring,
            m = self.nr, n = self.nc, a, nu, ni, s, U, V, e, work, si, i,
            nct, nrt, mrc, k, j, t, p, pp, iter, eps, kase, alpha, ks,
            f, cs, sn, scale, sp, spm1, epm1, sk, ek, b, c, shift, g, MIN_VAL,
            evd, wantu = true, wantv = true, Epsilon, Limit;

        return null;/*
        // only for real numeric fields (ie Rationals)
        if (ring.isSymbolic() || !ring.isReal()) return null;

        if (null == self._svd)
        {
            // svd from evd of A.T*A or A*A.T
            if (!ring.isField())
            {
                self._svd = Matrix(ring.associatedField(), self).svd();
            }
            else if (m > n)
            {
                // get svd of transpose and transpose
                s = self.t().svd();
                self._svd = [s[0], s[2].t(), s[1].t()];
            }
            else
            {
                evd = self.mul(self.t()).evd();
                U = evd[1];
                V = self.t().mul(U);
                s = array(V.nc, function(i){var vm = Matrix(ring, V.col(i)); return vm.t().mul(vm).val[0][0].rad(2);});
                V = V.map(function(vij, ij){return vij.div(s[ij[1]]);});
                self._svd = [Matrix(ring, s), U.t(), V];
            }
        }
        return self._svd.slice();

        function hypotenuse(a, b) {
            var r;
            if (a.abs().gt(b.abs()))
            {
                r = b.div(a);
                return a.abs().mul(r.mul(r).add(ring.One()).rad(2));
            }
            if (!b.equ(ring.Zero()))
            {
                r = a.div(b);
                return b.abs().mul(r.mul(r).add(ring.One()).rad(2));
            }
            return ring.Zero();
        }

        if (null == self._svd)
        {
            if (!ring.isField())
            {
                self._svd = Matrix(ring.associatedField(), self).svd();
            }
            else if (m < n)
            {
                // get svd of transpose and transpose
                s = self.t().svd();
                self._svd = [s[0], s[2].t(), s[1].t()];
            }
            else
            {
                // this version of svd adapted from https://github.com/mljs/matrix
                Epsilon = Rational.Epsilon();
                Limit = Epsilon.inv().integer();

                a = self.clone(true);
                nu = stdMath.min(m, n);
                ni = stdMath.min(m + 1, n);
                s = new Array(ni);
                U = Matrix(ring, m, nu);
                V = Matrix(ring, n, n);

                e = new Array(n);
                work = new Array(m);

                si = new Array(ni);
                for (i=0; i<ni; i++) si[i] = i;

                nct = stdMath.min(m - 1, n);
                nrt = stdMath.max(0, stdMath.min(n - 2, m));
                mrc = stdMath.max(nct, nrt);

                for (k=0; k<mrc; k++)
                {
                    if (k<nct)
                    {
                        s[k] = ring.Zero();
                        for (i=k; i<m; i++) s[k] = hypotenuse(s[k], a[i][k]);
                        if (!s[k].equ(0))
                        {
                            if (a[k][k].lt(0)) s[k] = s[k].neg();
                            for (i=k; i<m; i++) a[i][k] = a[i][k].div(s[k]);
                            a[k][k] = a[k][k].add(1);
                        }
                        s[k] = s[k].neg();
                    }

                    for (j=k+1; j<n; j++)
                    {
                        if (k<nct && !s[k].equ(0))
                        {
                            t = ring.Zero();
                            for (i=k; i<m; i++) t = t.add(a[i][k].mul(a[i][j]));
                            t = t.neg().div(a[k][k]);
                            for (i=k; i<m; i++) a[i][j] = a[i][j].add(t.mul(a[i][k]));
                        }
                        e[j] = a[k][j];
                    }

                    if (wantu && k<nct)
                        for (i=k; i<m; i++) U.val[i][k] = a[i][k];

                    if (k<nrt)
                    {
                        e[k] = ring.Zero();
                        for (i=k+1; i<n; i++) e[k] = hypotenuse(e[k], e[i]);
                        if (!e[k].equ(0))
                        {
                            if (e[k + 1].lt(0)) e[k] = e[k].neg();
                            for (i=k+1; i<n; i++) e[i] = e[i].div(e[k]);
                            e[k + 1] = e[k + 1].add(1);
                        }
                        e[k] = e[k].neg();
                        if (k+1<m && !e[k].equ(0))
                        {
                            for (i=k+1; i<m; i++) work[i] = ring.Zero();
                            for (i=k+1; i<m; i++)
                                for (j=k+1; j<n; j++) work[i] = work[i].add(e[j].mul(a[i][j]));

                            for (j=k+1; j<n; j++)
                            {
                                t = e[j].neg().div(e[k + 1]);
                                for (i=k+1; i<m; i++) a[i][j] = a[i][j].add(t.mul(work[i]));
                            }
                        }
                        if (wantv)
                        {
                            for (i=k+1; i<n; i++) V.val[i][k] = e[i];
                        }
                    }
                }

                p = stdMath.min(n, m + 1);
                if (nct<n) s[nct] = a[nct][nct];
                if (m<p) s[p - 1] = ring.Zero();
                if (nrt+1 < p) e[nrt] = a[nrt][p - 1];
                e[p - 1] = ring.Zero();

                if (wantu)
                {
                    for (j=nct; j<nu; j++)
                    {
                        for (i=0; i<m; i++) U.val[i][j] = ring.Zero();
                        U.val[j][j] = ring.One();
                    }
                    for (k=nct-1; k>=0; k--)
                    {
                        if (!s[k].equ(0))
                        {
                            for (j=k+1; j<nu; j++)
                            {
                                t = ring.Zero();
                                for (i=k; i<m; i++) t = t.add(U.val[i][k].mul(U.val[i][j]));
                                t = t.neg().div(U.val[k][k]);
                                for (i=k; i<m; i++) U.val[i][j] = U.val[i][j].add(t.mul(U.val[i][k]));
                            }
                            for (i=k; i<m; i++) U.val[i][k] = U.val[i][k].neg();
                            U.val[k][k] = U.val[k][k].add(1);
                            for (i=0; i<k-1; i++) U.val[i][k] = ring.Zero();
                        }
                        else
                        {
                            for (i=0; i<m; i++) U.val[i][k] = ring.Zero();
                            U.val[k][k] = ring.One();
                        }
                    }
                }

                if (wantv)
                {
                    for (k=n-1; k>=0; k--)
                    {
                        if (k<nrt && !e[k].equ(0))
                        {
                            for (j=k+1; j<n; j++)
                            {
                                t = ring.Zero();
                                for (i=k+1; i<n; i++) t = t.add(V.val[i][k].mul(V.val[i][j]));
                                t = t.neg().div(V.val[k + 1][k]);
                                for (i=k+1; i<n; i++) V.val[i][j] = V.val[i][j].add(t.mul(V.val[i][k]));
                            }
                        }
                        for (i=0; i<n; i++) V.val[i][k] = ring.Zero();
                        V.val[k][k] = ring.One();
                    }
                }

                pp = p - 1;
                iter = 0;
                eps = Epsilon;//ring.cast(Number.EPSILON.toString());
                MIN_VAL = ring.Zero();//ring.cast(Number.MIN_VALUE.toString());
                while (p>0)
                {
                    for (k=p-2; k>=-1; k--)
                    {
                        if (k === -1) break;
                        alpha = MIN_VAL.add(eps.mul(s[k].add(s[k + 1].abs()).abs()));
                        if (e[k].abs().lte(alpha) /*|| Number.isNaN(e[k].valueOf())* /)
                        {
                            e[k] = ring.Zero();
                            break;
                        }
                    }
                    if (k===p-2)
                    {
                        kase = 4;
                    }
                    else
                    {
                        for (ks=p-1; ks>=k; ks--)
                        {
                            if (ks===k) break;
                            t = (ks !== p ? e[ks].abs() : ring.Zero()).add(ks !== k + 1 ? e[ks - 1].abs() : ring.Zero());
                            if (s[ks].abs().lte(eps.mul(t)))
                            {
                                s[ks] = ring.Zero();
                                break;
                            }
                        }
                        if (ks===k)
                        {
                            kase = 3;
                        }
                        else if (ks===p-1)
                        {
                            kase = 1;
                        }
                        else
                        {
                            kase = 2;
                            k = ks;
                        }
                    }

                    k++;
                    switch(kase)
                    {
                        case 1:
                            f = e[p - 2];
                            e[p - 2] = ring.Zero();
                            for (j=p-2; j>=k; j--)
                            {
                                t = hypotenuse(s[j], f);
                                cs = s[j].div(t);
                                sn = f.div(t);
                                s[j] = t;
                                if (j !== k)
                                {
                                    f = sn.neg().mul(e[j - 1]);
                                    e[j - 1] = cs.mul(e[j - 1]);
                                }
                                if (wantv)
                                {
                                    for (i=0; i<n; i++)
                                    {
                                        t = cs.mul(V.val[i][j]).add(sn.mul(V.val[i][p - 1]));
                                        V.val[i][p - 1] = sn.neg().mul(V.val[i][j]).add(cs.mul(V.val[i][p - 1]));
                                        V.val[i][j] = t;
                                    }
                                }
                            }
                            break;
                        case 2:
                            f = e[k - 1];
                            e[k - 1] = ring.Zero();
                            for (j=k; j<p; j++)
                            {
                                t = hypotenuse(s[j], f);
                                cs = s[j].div(t);
                                sn = f.div(t);
                                s[j] = t;
                                f = sn.neg().mul(e[j]);
                                e[j] = cs.mul(e[j]);
                                if (wantu)
                                {
                                    for (i=0; i<m; i++)
                                    {
                                        t = cs.mul(U.val[i][j]).add(sn.mul(U.val[i][k - 1]));
                                        U.val[i][k - 1] = sn.neg().mul(U.val[i][j]).add(cs.mul(U.val[i][k - 1]));
                                        U.val[i][j] = t;
                                    }
                                }
                            }
                            break;
                        case 3:
                            scale = nmax(
                                s[p - 1].abs(),
                                s[p - 2].abs(),
                                e[p - 2].abs(),
                                s[k].abs(),
                                e[k].abs()
                           );
                            sp = s[p - 1].div(scale);
                            spm1 = s[p - 2].div(scale);
                            epm1 = e[p - 2].div(scale);
                            sk = s[k].div(scale);
                            ek = e[k].div(scale);
                            b = spm1.add(sp).mul(spm1.sub(sp)).add(epm1.mul(epm1)).div(2);
                            c = sp.mul(epm1).mul(sp.mul(epm1));
                            shift = ring.Zero();
                            if (!b.equ(0) || !c.equ(0))
                            {
                                if (b.lt(0)) shift = b.mul(b).add(c).rad(2).neg();
                                else shift = b.mul(b).add(c).rad(2);
                                shift = c.div(b.add(shift));
                            }
                            f = sk.add(sp).mul(sk.sub(sp)).add(shift);
                            g = sk.mul(ek);
                            for (j=k; j<p-1; j++)
                            {
                                t = hypotenuse(f, g);
                                if (t.equ(0)) t = MIN_VAL;
                                cs = f.div(t);
                                sn = g.div(t);
                                if (j !== k) e[j - 1] = t;
                                f = cs.mul(s[j]).add(sn.mul(e[j]));
                                e[j] = cs.mul(e[j]).sub(sn.mul(s[j]));
                                g = sn.mul(s[j + 1]);
                                s[j + 1] = cs.mul(s[j + 1]);
                                if (wantv)
                                {
                                    for (i=0; i<n; i++)
                                    {
                                        t = cs.mul(V.val[i][j]).add(sn.mul(V.val[i][j + 1]));
                                        V.val[i][j + 1] = sn.neg().mul(V.val[i][j]).add(cs.mul(V.val[i][j + 1]));
                                        V.val[i][j] = t;
                                    }
                                }
                                t = hypotenuse(f, g);
                                if (t.equ(0)) t = MIN_VAL;
                                cs = f.div(t);
                                sn = g.div(t);
                                s[j] = t;
                                f = cs.mul(e[j]).add(sn.mul(s[j + 1]));
                                s[j + 1] = sn.neg().mul(e[j]).add(cs.mul(s[j + 1]));
                                g = sn.mul(e[j + 1]);
                                e[j + 1] = cs.mul(e[j + 1]);
                                if (wantu && j<m-1)
                                {
                                    for (i=0; i<m; i++)
                                    {
                                        t = cs.mul(U.val[i][j]).add(sn.mul(U.val[i][j + 1]));
                                        U.val[i][j + 1] = sn.neg().mul(U.val[i][j]).add(cs.mul(U.val[i][j + 1]));
                                        U.val[i][j] = t;
                                    }
                                }
                            }
                            e[p - 2] = f;
                            iter = iter + 1;
                            break;
                        case 4:
                            if (s[k].lte(0))
                            {
                                s[k] = s[k].lt(0) ? s[k].neg() : ring.Zero();
                                if (wantv)
                                {
                                    for (i=0; i<=pp; i++) V.val[i][k] = V.val[i][k].neg();
                                }
                            }
                            while (k<pp)
                            {
                                if (s[k].gte(s[k + 1])) break;
                                t = s[k];
                                s[k] = s[k + 1];
                                s[k + 1] = t;
                                if (wantv && k<n-1)
                                {
                                    for (i=0; i<n; i++)
                                    {
                                        t = V.val[i][k + 1];
                                        V.val[i][k + 1] = V.val[i][k];
                                        V.val[i][k] = t;
                                    }
                                }
                                if (wantu && k<m-1)
                                {
                                    for (i=0; i<m; i++)
                                    {
                                        t = U.val[i][k + 1];
                                        U.val[i][k + 1] = U.val[i][k];
                                        U.val[i][k] = t;
                                    }
                                }
                                k++;
                            }
                            iter = 0;
                            p--;
                            break;
                        // no default
                    }
                }
                self._svd = [Matrix(ring, s), U, V];
            }
        }
        return self._svd.slice();*/
    }
    ,lu: function() {
        var self = this, ring, O, I, J, n, m, dim, P, L, U, DD,
            oldpivot, k, i, j, kpivot, NotFound, Ukk, Uik, defficient;
        // completely fraction-free LU factorisation
        // https://en.wikipedia.org/wiki/LU_decomposition#LDU_decomposition
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        if (null == self._lu)
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            n = self.nr; m = self.nc;
            /*
            Completely Fraction free LU factoring(CFFLU)
            Input: A nxm matrix A, with m >= n.
            Output: Four matrices P, L, D, U, where:
                P is a nxn permutation matrix,
                L is a nxn lower triangular matrix,
                D is a nxn diagonal matrix,
                U is a nxm upper triangular matrix
                and P*A = L*inv(D)*U
            */
            defficient = false;
            //dim = stdMath.min(n, m);
            U = self.clone();
            L = Matrix.I(ring, n);
            DD = array(n, function() {return O;});
            P = Matrix.I(ring, n);
            oldpivot = I;
            for (k=0; k<n-1; ++k)
            {
                if (U.val[k][k].equ(O) )
                {
                    kpivot = k+1;
                    NotFound = true;
                    while ((kpivot < n) && NotFound)
                    {
                        if (!U.val[kpivot][k].equ(O) )
                            NotFound = false;
                        else
                            ++kpivot;
                    }
                    if (n <= kpivot)
                    {
                        // matrix is rank-defficient
                        defficient = true;
                        break;
                    }
                    else
                    {
                        Matrix.SWAPR(U.val, k, kpivot);
                        Matrix.SWAPR(P.val, k, kpivot);
                    }
                }
                Ukk = U.val[k][k];
                L.val[k][k] = Ukk;
                DD[k] = oldpivot.mul(Ukk);
                for (i=k+1; i<n; ++i)
                {
                    Uik = U.val[i][k];
                    L.val[i][k] = Uik;
                    for (j=k+1; j<m; ++j)
                    {
                        U.val[i][j] = Ukk.mul(U.val[i][j]).sub(U.val[k][j].mul(Uik)).div(oldpivot);
                    }
                    U.val[i][k] = O;
                }
                oldpivot = U.val[k][k];
            }
            if (!defficient)
            {
                DD[n-1] = oldpivot;
                self._lu = [P, L, Matrix.D(ring, n, n, DD), U];
            }
            else
            {
                self._lu = false;
            }
        }
        return self._lu ? self._lu.slice() : self._lu;
    }
    ,qr: function() {
        var self = this, n, m, lu;
        // fraction-free QR factorisation
        // https://en.wikipedia.org/wiki/QR_decomposition
        // http://ftp.cecm.sfu.ca/personal/pborwein/MITACS/papers/FFMatFacs08.pdf
        if (null == self._qr)
        {
            n = self.nr; m = self.nc;
            /*
            Fraction free QR factoring(FFQR) based on completely fraction-free LU factoring (CFFLU)
            Input: A nxm matrix A.
            Output: Three matrices: Q, D, R where:
                Q is a nxm left orthogonal matrix,
                D is a mxm diagonal matrix,
                R is a mxm upper triangular matrix
                and A = Q*inv(D)*R

                use CFFLU([A.t*A | A.t]) and extract appropriate factors
            */
            lu = self.t().mul(self).concat(self.t()).lu();
            if (lu)
                self._qr = [lu[3].slice(0, m, -1, -1).t()/*Q*/, lu[2]/*D*/, lu[1].t()/*R*/];
            else
                self._qr = false;
        }
        return self._qr ? self._qr.slice() : self._qr;
    }
    ,ldl: function() {
        // https://en.wikipedia.org/wiki/Cholesky_decomposition#LDL_decomposition_2
        var self = this, rows, columns, ring, field, i, j, k, sum, M, D, L;
        if (null == self._ldl)
        {
            rows = self.nr; columns = self.nc;
            if ((rows !== columns) || !self.equ(self.h()))
            {
                self._ldl = false;
            }
            else
            {
                ring = self.ring; field = ring.associatedField();
                M = ring.isField() ? self : Matrix(field, self);
                D = Matrix.Zero(field, rows, rows); // zeroes
                L = Matrix.I(field, rows); // eye

                for (i=0; i<rows; ++i)
                {
                    for (j=0; j<i; ++j)
                    {
                        for (k=0,sum=field.Zero(); k<j; ++k)
                            sum = sum.add(L.val[i][k].mul(L.val[j][k].conj()).mul(D.val[k][k]));

                        L.val[i][j] = M.val[i][j].sub(sum).div(D.val[j][j]);
                    }

                    for (k=0,sum=field.Zero(); k<i; ++k)
                        sum = sum.add(L.val[i][k].mul(L.val[i][k].conj()).mul(D.val[k][k]));

                    D.val[i][i] = M.val[i][i].sub(sum);

                    if (D.val[i][i].lte(0))
                    {
                        // not positive-definite
                        self._ldl = false;
                        break;
                    }
                }
                if (false !== self._ldl) self._ldl = [L, D];
            }
        }
        return self._ldl ? self._ldl.slice() : self._ldl;
    }
    ,ref: function(with_pivots, odim) {
        var self = this, ring, O, I, J, rows, columns, dim, pivots,
            det, pl = 0, r, i, i0, p0, lead, leadc, imin, im, min,
            a, z, m, aug, find_dupl;
        // fraction-free/integer row echelon form (ref) (also known as Hermite normal form), using fraction-free/integer row reduction or fraction-free gaussian elimination
        // https://en.wikipedia.org/wiki/Row_echelon_form
        // https://en.wikipedia.org/wiki/Gaussian_elimination
        // https://en.wikipedia.org/wiki/Hermite_normal_form
        // https://www.math.uwaterloo.ca/~wgilbert/Research/GilbertPathria.pdf
        if (null == self._ref)
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            rows = self.nr; columns = self.nc;
            dim = columns;
            // original dimensions, eg when having augmented matrix
            if (is_array(odim)) dim = stdMath.min(dim, odim[1]);
            m = self.concat(Matrix.I(ring, rows)).val;
            pivots = new Array(dim);
            lead = 0; leadc = 0; det = I;
            find_dupl = function find_dupl(k0, k) {
                k = k || 0;
                for (var p=pl-1; p>=0; --p)
                    if (k0 === pivots[p][k])
                        return p;
                return -1;
            };
            for (r=0; r<rows; ++r)
            {
                if (dim <= lead) break;

                i = r;
                /*while (0<=leadc && leadc<dim && m[i][leadc].equ(O))
                {
                    leadc++;
                    if (dim <= leadc)
                    {
                        leadc = -1;
                        break;
                    }
                }*/
                while (m[i][lead].equ(O))
                {
                    ++i;
                    if (rows <= i)
                    {
                        i = r; ++lead;
                        if (dim <= lead)
                        {
                            lead = -1;
                            break;
                        }
                    }
                }
                if (-1 === lead) break; // nothing to do

                i0 = i;
                imin = -1; min = null; z = 0;
                // find row with min abs leading value non-zero for current column lead
                for (i=i0; i<rows; ++i)
                {
                    a = m[i][lead].abs();
                    if (a.equ(O)) ++z;
                    else if ((null == min) || a.lt(min)) {min = a; imin = i;}
                }
                do {
                    if (-1 === imin) break; // all zero, nothing else to do
                    if (rows-i0 === z+1)
                    {
                        // only one non-zero, swap row to put it first
                        if (r !== imin)
                        {
                            Matrix.SWAPR(m, r, imin);
                            // determinant changes sign for row swaps
                            det = det.neg();
                        }
                        if (m[r][lead].lt(O))
                        {
                            Matrix.ADDR(ring, m, r, r, O, J, lead); // make it positive
                            // determinant is multiplied by same constant for row multiplication, here simply changes sign
                            det = det.mul(J);
                        }
                        i = imin; i0 = r;
                        while ((0 <= i) && (-1 !== (p0=find_dupl(i)))) {i0 -= pl-p0; i = i0;}
                        pivots[pl++] = [i, lead/*, leadc*/]; // row/column/original column of pivot
                        // update determinant
                        det = r < dim ? det.mul(m[r][r/*lead*/]) : O;
                        break;
                    }
                    else
                    {
                        z = 0; im = imin;
                        for (i=i0; i<rows; ++i)
                        {
                            if (i === im) continue;
                            // subtract min row from other rows
                            Matrix.ADDR(ring, m, i, im, m[i][lead].div(m[im][lead]).neg(), I, lead);
                            // determinant does not change for this operation

                            // find again row with min abs value for this column as well for next round
                            a = m[i][lead].abs();
                            if (a.equ(O)) ++z;
                            else if (a.lt(min)) {min = a; imin = i;}
                        }
                    }
                } while (1);

                ++lead; //++leadc;
            }
            if (pl < dim) det = O;

            m = new Matrix(ring, m);
            aug = m.slice(0, columns, rows-1, rows+columns-1);
            m = m.slice(0, 0, rows-1, columns-1);
            // truncate if needed
            if (pivots.length > pl) pivots.length = pl;

            self._ref = [m, pivots, det, aug];
        }
        return with_pivots ? self._ref.slice() : self._ref[0];
    }
    ,rref: function(with_pivots, odim) {
        var self = this, ring, O, I, J, rows, columns, dim,
            pivots, det, pl, lead, r, i, j, l, a, g, ref, aug;
        // fraction-free/integer reduced row echelon form (rref), using fraction-free gauss-jordan elimination, or incrementaly from fraction-free row echelon form (gauss elimination)
        // https://en.wikipedia.org/wiki/Row_echelon_form
        if (null == self._rref)
        {
            ring = self.ring;
            O = ring.Zero();
            I = ring.One();
            J = ring.MinusOne();
            rows = self.nr; columns = self.nc;
            dim = columns;
            // original dimensions, eg when having augmented matrix
            if (is_array(odim)) dim = stdMath.min(dim, odim[1]);
            // build rref incrementaly from ref
            ref = self.ref(true, odim);
            a = ref[0].concat(ref[3]);
            pivots = ref[1]; det = ref[2];
            pl = pivots.length;
            for (r=0; r<pl; ++r)
            {
                lead = pivots[r][1];
                for (i=0; i<r; ++i)
                {
                    if (a.val[i][lead].equ(O)) continue;

                    Matrix.ADDR(ring, a.val, i, r, a.val[i][lead].neg(), a.val[r][lead]);
                    // are following 2 lines redundant since we are already in REF??
                    // 1. make leading entry positive again
                    if (a.val[i][pivots[i][1]].lt(O))
                        Matrix.ADDR(ring, a.val, i, i, O, J, pivots[i][1]);
                    // 2. remove any common factor, simplify
                    if (ring.hasGCD() && !O.equ(g=ring.gcd(a.val[i]/*.slice(0, dim)*/)) && !I.equ(g))
                    {
                        for (j=0,l=a.val[i].length/*dim*/; j<l; ++j) a.val[i][j] = a.val[i][j].div(g);
                    }
                }
            }
            aug = a.slice(0, columns, rows-1, rows+columns-1);
            a = a.slice(0, 0, rows-1, columns-1);
            self._rref = [a, pivots, det, aug];
        }
        return with_pivots ? self._rref.slice() : self._rref[0];
    }
    ,rankf: function() {
        // https://en.wikipedia.org/wiki/Rank_factorization
        var self = this, ring, field, rows, columns, rref, pivots, rank, F, C;
        if (null == self._rf)
        {
            rows = self.nr; columns = self.nc;
            ring = self.ring;
            rref = self.rref(true);
            pivots = rref[1];
            rank = pivots.length;
            field = ring.associatedField();
            C = Matrix(field, self.slice(array(rows, 0, 1), array(rank, function(j) {return pivots[j][1];})));
            F = Matrix(field, rref[0].slice(0, 0, rank-1, columns-1).map(function(rref_ij, ij) {
                var i = ij[0], j = i;
                while ((j+1 < columns) && rref[0].val[i][j].equ(0)) ++j;
                return field.cast(rref_ij).div(field.cast(rref[0].val[i][j]));
            }));
            self._rf = [C, F];
        }
        return self._rf.slice();
    }
    ,rank: function() {
        // https://en.wikipedia.org/wiki/Rank_(linear_algebra)
        var pivots = this.ref(true);
        return pivots[1].length;
    }
    ,tr: function() {
        var self = this, ring, n, i;
        // trace
        // https://en.wikipedia.org/wiki/Trace_(linear_algebra)
        if (null == self._tr)
        {
            ring = self.ring;
            n = stdMath.min(self.nr, self.nc);
            self._tr = ring.Zero();
            for (i=0; i<n; ++i) self._tr = self._tr.add(self.val[i][i]);
        }
        return self._tr;
    }
    ,det: function() {
        var self = this, ring, ref;
        // determinant
        // https://en.wikipedia.org/wiki/Determinant
        // https://en.wikipedia.org/wiki/Bareiss_algorithm
        if (null == self._det)
        {
            ring = self.ring;
            if (self.nr !== self.nc)
            {
                self._det = ring.Zero();
            }
            else
            {
                ref = self.ref(true);
                self._det = ref[2];
            }
        }
        return self._det;
    }
    ,rowspace: function() {
        var self = this, ring, pivots;
        // row space
        // https://en.wikipedia.org/wiki/Row_and_column_spaces
        if (null == self._rs)
        {
            ring = self.ring;
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._rs = /*gramschmidt(*/pivots[1].map(function(p) {
                return Matrix(ring, [self.row(p[0])]);
            })/*).map(function(vec){
                return Matrix([vec]);
            })*/; // row vector
        }
        return self._rs.slice();
    }
    ,colspace: function() {
        var self = this, ring, pivots;
        // column space
        // https://en.wikipedia.org/wiki/Row_and_column_spaces
        if (null == self._cs)
        {
            ring = self.ring;
            pivots = self.ref(true);
            // produce orthogonal basis via gramschmidt
            self._cs = /*gramschmidt(*/pivots[1].map(function(p) {
                return Matrix(ring, self.col(p[1]));
            })/*).map(function(vec){
                return Matrix(vec);
            })*/; // column vector
        }
        return self._cs.slice();
    }
    ,nullspace: function(left_else_right) {
        var self = this, ring, O, I, columns, rref, pivots,
            free_vars, pl, tmp, LCM;

        // https://en.wikipedia.org/wiki/Kernel_(linear_algebra)
        if (left_else_right)
        {
            // left nullspace
            if (null == self._ln)
            {
                // get right nullspace of transpose matrix and return transposed vectors
                self._ln = self.t().nullspace().map(function(v) {return v.t();});
            }
            return self._ln.slice();
        }
        else
        {
            // right nullspace (default)
            if (null == self._rn)
            {
                ring = self.ring;
                O = ring.Zero();
                I = ring.One();
                columns = self.nc;
                tmp = self.rref(true); rref = tmp[0]; pivots = tmp[1];
                pl = pivots.length;
                free_vars = complement(columns, pivots.map(function(p) {return p[1];}));
                // exact integer rref, find LCM of pivots
                LCM = pl ? (ring.hasGCD() ? ring.lcm(pivots.map(function(p, i) {return rref.val[i][p[1]];})) : operate(function(LCM, p, i) {return LCM.mul(rref.val[i][p[1]]);}, I, pivots)) : I;
                self._rn = free_vars.map(function(free_var) {
                    /*
                    If A = (a_{ij}) \in Mat(m x n, F) is a matrix in reduced row echelon form with r nonzero rows and pivots in the columns numbered j_1 < ... < j_r, then the kernel ker(A) is generated by the n-r elements w_k = e_k - \sum\limits_{1 \le i \le r, j_i \le k} a_{ik}/a_{ii}e_{j_i} for k \in {1, .. , n} \ {j_1, .., j_r}, where e_1, .., e_n are the standard generators of F^n.
                    */
                    // for each free variable, we will set it to 1(LCM) and all others
                    // to 0.  Then, we will use back substitution to solve the system
                    var p, g, i, vec = array(columns, function(j) {return j === free_var ? LCM : O;});
                    for (p=0; p<pl; ++p)
                    {
                        i = pivots[p][1];
                        if (i <= free_var)
                        {
                            // use exact (fraction-free) integer algorithm, which normalises rref NOT with 1 but with LCM of pivots
                            // https://math.stackexchange.com/a/1521354/139391
                            vec[i] = vec[i].sub(LCM.div(rref.val[p][i]).mul(rref.val[p][free_var]));
                        }
                    }
                    if (ring.hasGCD() && I.lt(g=ring.gcd(vec)))
                        // remove common factors, simplify
                        for (i=0; i<columns; ++i) vec[i] = vec[i].div(g);

                    return Matrix(ring, vec); // column vector
                });
            }
            return self._rn.slice();
        }
    }
    ,slice: function(r1, c1, r2, c2) {
        var self = this, ring = self.ring, rows = self.nr, columns = self.nc;
        if (!rows || !columns) return Matrix(ring);
        if (is_array(r1) && is_array(c1))
        {
            r1 = r1.filter(function(i) {return 0 <= i && i < rows;});
            c1 = c1.filter(function(j) {return 0 <= j && j < columns;});
            return Matrix(ring, array(r1.length, function(i) {
                return array(c1.length, function(j) {
                    return self.val[r1[i]][c1[j]];
                });
            }));
        }
        else
        {
            if (null == r1) r1 = 0;
            if (null == c1) c1 = 0;
            if (null == r2) r2 = rows-1;
            if (null == c2) c2 = columns-1;
            if (0 > r1) r1 += rows;
            if (0 > c1) c1 += columns;
            if (0 > r2) r2 += rows;
            if (0 > c2) c2 += columns;
            r1 = stdMath.max(0, stdMath.min(rows-1, r1));
            r2 = stdMath.max(0, stdMath.min(rows-1, r2));
            c1 = stdMath.max(0, stdMath.min(columns-1, c1));
            c2 = stdMath.max(0, stdMath.min(columns-1, c2));
            return r1 <= r2 && c1 <= c2 ? Matrix(ring, array(r2-r1+1, function(i) {
                return array(c2-c1+1, function(j) {
                    return self.val[r1+i][c1+j];
                });
            })) : Matrix(ring);
        }
    }
    ,concat: function(a, axis) {
        var self = this, ring = self.ring, O = ring.Zero();
        if (!is_instance(a, Matrix)) return self;
        axis = axis || 'horizontal';
        if ('vertical' === axis)
        {
            // | self |
            // | ---- |
            // |  a   |
            return Matrix(ring, array(self.nr+a.nr, function(i) {
                return array(stdMath.max(self.nc, a.nc), function(j) {
                    if (j >= self.nc)
                        return i < self.nr ? O : a.val[i-self.nr][j];
                    else if (j >= a.nc)
                        return i < self.nr ? self.val[i][j] : O;
                    else
                        return i < self.nr ? self.val[i][j] : a.val[i-self.nr][j];
                });
            }));
        }
        else //if ('horizontal' === axis)
        {
            // | self | a |
            return Matrix(ring, array(stdMath.max(self.nr, a.nr), function(i) {
                return array(self.nc+a.nc, function(j) {
                    if (i >= self.nr)
                        return j < self.nc ? O : a.val[i][j-self.nc];
                    else if (i >= a.nr)
                        return j < self.nc ? self.val[i][j] : O;
                    else
                        return j < self.nc ? self.val[i][j] : a.val[i][j-self.nc];
                });
            }));
        }
    }
    ,valueOf: function(r, c) {
        var self = this, ring = self.ring;
        r = +(r||0); c = +(c||0);
        return (0 <= r && r < self.nr && 0 <= c && c < self.nc ? self.val[r][c] : ring.Zero()).valueOf();
    }
    ,toString: function() {
        var self = this;
        if (null == self._str)
            self._str = Matrix.toString(self.val);
        return self._str;
    }
    ,toTex: function() {
        var self = this;
        if (null == self._tex)
            self._tex = Matrix.toTex(self.val);
        return self._tex;
    }
    ,toDec: function(precision) {
        return Matrix.toDec(this.val, precision);
    }
});
