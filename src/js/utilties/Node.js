// Abacus.Node, Node class which can represent (dynamic) Linked Lists, Binary Trees and similar structures
Node = Abacus.Node = function Node(value, left, right, top) {
    var self = this;
    if (!is_instance(self, Node)) return new Node(value, left, right, top);

    self.v = value;
    self.l = left || null;
    self.r = right || null;
    self.t = top || null;

    self.dispose = function() {
        self.v = null;
        self.l = null;
        self.r = null;
        self.t = null;
        return self;
    };
};
