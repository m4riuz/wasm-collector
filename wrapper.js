(function () {
    function bufferToBase64(buffer) {
        let binary = "";
        let bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    (function () {
        let old = {};
        function wrap(name) {
            old[name] = WebAssembly[name];
            WebAssembly[name] = function(bufferSource) {
                wasmFound(bufferToBase64(bufferSource));
                return old[name].call(WebAssembly, ...arguments);
            };
        }
        wrap("instantiate");
        wrap("compile");
    })();

    WebAssembly.instantiateStreaming = async function(source, importObject) {
        let response = await source;
        let body = await response.arrayBuffer();
        return WebAssembly.instantiate(body, importObject);
    };

    WebAssembly.compileStreaming = async function(source) {
        let response = await source;
        let body = await response.arrayBuffer();
        return WebAssembly.compile(body);
    };

    const handler = {
        construct(target, args) {
            wasmFound(bufferToBase64(args[0]));
            return new target(...args);
        }
    };
    WebAssembly.Module = new Proxy(WebAssembly.Module, handler);
})();
