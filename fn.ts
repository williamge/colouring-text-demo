module f {
    export interface forEachFunction {
        (element, index, context): any
    }

    class _fn<T> {
        _target: T;
        constructor(obj: T){
            this._target = obj;
        }

        forEach(cb: forEachFunction): void {
            return Array.prototype.forEach.call(this._target, cb);
        }

        map(cb: forEachFunction): Array<any> {
            return Array.prototype.map.call(this._target, cb);
        }
        some(cb: forEachFunction): Boolean {
            return Array.prototype.some.call(this._target, cb);
        }
        constructAPI(): any {
            return Array.prototype.reduce.call(
                this._target,
                function(api, currentWidget) {
                    Object.keys(currentWidget.modifiers).forEach(function(currentModifier) {
                        api[currentModifier] = currentWidget.modifiers[currentModifier];
                    });
                    return api;
                }, {}
            );
        }
        annotate(annotations: Object): T{
            Object.keys(annotations).forEach((_annotation) => {
                this._target[_annotation] = annotations[_annotation];
            });
            return this._target;
        }
    }

    export function n(obj) {
        return new _fn(obj);
    }
}
