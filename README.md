# Wasm Extractor
Collects all WebAssembly modules from a given website

## Background
Since we published our [DIMVA paper](https://www.tu-braunschweig.de/Medien-DB/ias/pubs/2019-dimva.pdf), I got multiple questions about our data collection and implementation. Here is a simplified version of this code as a small, stand-alone version using [Puppeteer](https://github.com/GoogleChrome/puppeteer). Unfortunately, it can not collect modules running in WebWorkers. If this is a requirement for you, consider one of the [alternatives](#alternatives).

If you find this helpful for your research, please consider citing our paper :)
```
@inproceedings{musch2019newkid,
    author = {Musch, Marius and Wressnegger, Christian and Johns, Martin and Rieck, Konrad},
    title = {New Kid on the Web: A Study on the Prevalence of WebAssembly in the Wild},
    booktitle = {Proc. of Detection of Intrusions and Malware {\&} Vulnerability Assessment ({DIMVA})},
    year = 2019
}
```

## Usage
1. Make sure you have NodeJS and npm installed
2. Install dependencies via `npm install`
3. Run `node main.js`
4. Check output in the `wasm` folder

## Implementation details
The code wraps all JavaScript functions that can instantiate a WebAssembly module and logs the module's bytes to the NodeJS backend. The key to make it work in practice is to convert the buffer to a string before attempting to transfer it from the JavaScript environment to NodeJS, in this case via the base64 encoding.

Note that if the WebAssembly API is ever changed and new functions are added to instantiate a module, then `wrapper.js` must be changed accordingly.

## Security considerations
This exposes your filesystem to any website you visit! However, sites can only write files and not choose the filename, so potential attacks should be limited to DOS by attempting to fill your disk. Be aware of this risk.

## Alternatives
Chromium offers the v8 flags `dump-wasm-module`  and `dump-wasm-module-path`, however these only work if you have a debug build, which I find quite inconvenient. Especially if you are developing on Windows/Mac and running the study on a Linux server, this means you have to build multiple debug versions, each taking huge amounts of disk space and time to build. For more info on the flags, have a look at the [source](https://cs.chromium.org/search/?q=dump_wasm&sq=package:chromium&type=cs)

If you control Chromium via the [DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) then you can use `Page.addScriptToEvaluateOnNewDocument` to add our `wrapper.js` to every new document. To also collect modules in WebWorkers, additionally use `Target.attachedToTarget` in combination with `Runtime.evaluate` to inject the wrapper in all other targets and observe the results in `Target.receivedMessageFromTarget`.
