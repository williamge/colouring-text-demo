module f {
    export interface forEachFunction {
        (element, index, context): any
    }

    class _fn {
        _target: any;
        constructor(obj: any){
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
        constructAPI(): Object {
            return this._target.reduce(
                function(api, currentWidget) {
                    Object.keys(currentWidget.modifiers).forEach(function(currentModifier) {
                        api[currentModifier] = currentWidget.modifiers[currentModifier];
                    });
                    return api;
                }, {}
            );
        } 
    }

    export function n(obj) {
        return new _fn(obj);
    }
}
