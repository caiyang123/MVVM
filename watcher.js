class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        this.value = this.get();
    }

    get() {
        Dep.target = this;
        const value = this.getValue(this.vm, this.expr);
        Dep.target = null;
        return value;
    }

    getValue(vm, expr) {
        return expr.split('.').reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    }

    update() {
        this.cb && this.cb(this.getValue(this.vm, this.expr));
    }
}