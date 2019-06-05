class Observer {
    constructor(data) {
        this.observe(data);
    }

    observe(data) {
        if (!data || typeof data !== 'object') {
            return;
        }

        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
            this.observe(data[key]);
        });
    }

    defineReactive(obj, key, value) {
        const dep = new Dep();
        const that = this;
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newValue) {
                if (newValue !== value) {
                    value = newValue;
                    that.observe(newValue);
                    dep.notify();
                }
            }
        });
    }
}

class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach(sub => sub.update());
    }
}