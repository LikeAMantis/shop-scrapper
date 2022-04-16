import "reflect-metadata"

interface Accessors {
    set?: (val: any) => any;
    get?: (val: any) => any;
}

function accessors({ set = (x) => x, get = (x) => x }: Accessors) {
    return function (target: Object, key: string | symbol) {
        let val = target[key];

        const getter = () => {
            return get(val);
        };
        const setter = (next) => {
            val = set(next);
        };

        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
        });
    };
}




class MyClass {
    @accessors({
        set: (x) => x,
    })
    age: number;

    @log
    name: string;
}


function log(target: object, property):any {
    return Reflect.metadata("log", true)
}

const a = new MyClass()

const proxy = new Proxy(a, {
    get: (target, p) => {
        if (Reflect.getMetadata("log", target, p)) {
            console.log(p, " has log");
        } else {
            console.log(p, " has no log");
        }
        return target[p]
    }
})

proxy.age
proxy.name
console.log(a.age);


