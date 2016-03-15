# jigwheel

bhauman's [figwheel](https://github.com/bhauman/lein-figwheel) is AMAZING and visionary! however, clojurescript does not interop super well with npm. CLJSJS is great, but still not  as easy as `npm install`.

so, until clojurescript works perfectly with npm, here is a hacky version of figwheel. what it loses in slickness, it makes up for in modularity.

**WARNING**: this is under active development. use at your own risk!

## quick start

    npm install
    npm run dev

## usage

edit =view.js=. the view updates live! how does it work?

the first trick is [browserify-hmr](https://www.npmjs.com/package/browserify-hmr). the second, more interesting trick is [virtual-dom](https://www.npmjs.com/package/virtual-dom) & [main-loop](https://www.npmjs.com/package/main-loop), which allow us to define our view as a pure function of our application state (c.f. react). 

/a la/ figwheel, we `defonce` our application state, which allows it to persist as we edit and reload our view code. we also `defonce` a `dispatcher`, a global event emitter to which our whole application can listen and emit events.

## license

BSD
