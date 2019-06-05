class MVVM {
    constructor(option) {
        this.$el = this.isElementNode(option.el) ? option.el : document.querySelector(option.el);
        this.$data = option.data || {};

        if (this.$el) {
            this.proxyData();
            new Observer(this.$data);
            new Compiler(this, this.$el);
        }
    }

    proxyData() {
        Object.keys(this.$data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return this.$data[key];
                },
                set(newValue) {
                    this.$data[key] = newValue;
                }
            })
        });
    }

    isElementNode(el) {
        return el.nodeType === 1;
    }
}