class Compiler {
    constructor(vm, el) {
        this.vm = vm;
        this.el = el;
        
        let fragment = this.createFragment(this.el);

        this.compile(fragment);

        this.el.appendChild(fragment);
    }

    createFragment(el) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }

    compile(node) {
        if (!node.childNodes) {
            return;
        }

        Array.from(node.childNodes).forEach(child => {
            if (this.isElementNode(child)) {
                this.compileElement(this.vm, child);
                this.compile(child);
            } else {
                this.compileText(this.vm, child);
            }
        });
    }

    compileElement(vm, node) {
        let attributes = node.attributes;
        Array.from(attributes).forEach(attr => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let attrValue = attr.value;
                let [, type] = attrName.split('-');
                CompileUtil[type](vm, node, attrValue);
            }
        });
    }

    compileText(vm, node) {
        let text = node.textContent;
        const reg = /\{\{([^}]+)\}\}/g;
        if (!reg.test(text)) {
            return;
        }

        CompileUtil['text'](vm, node, text);
    }

    isElementNode(el) {
        return el.nodeType === 1;
    }

    isDirective(attrName) {
        return attrName.includes('v-');
    }
}

CompileUtil = {
    getValue(vm, expr) {
        return expr.split('.').reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    },
    setValue(vm, expr, value) {
        const exprs = expr.split('.');
        return exprs.reduce((prev, next, currentIndex) => {
            if (currentIndex == exprs.length - 1) {
                return prev[next] = value;
            }
            return prev[next];
        }, vm.$data);
    },
    getTextValue(vm, expr) {
        const reg = /\{\{([^}]+)\}\}/g;
        return expr.replace(reg, (...args) => {
            return this.getValue(vm, args[1].trim());
        });
    },
    model(vm, node, expr) {
        this.updater['modelUpdater'](node, this.getValue(vm, expr));
        new Watcher(vm, expr, newValue => {
            this.updater['modelUpdater'](node, newValue);
        });
        node.addEventListener('input', e => {
            this.setValue(vm, expr, e.target.value);
        })
    },
    text(vm, node, expr) {
        const reg = /\{\{([^}]+)\}\}/g;
        const value = expr.replace(reg, (...args) => {
            new Watcher(vm, args[1].trim(), newValue => {
                this.updater['textUpdater'](node, this.getTextValue(vm, expr));
            });
            return this.getValue(vm, args[1].trim());
        });
        this.updater['textUpdater'](node, value);
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value;
        },
        textUpdater(node, value) {
            node.textContent = value;
        }
    }
}