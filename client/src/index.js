// deps
var ud = require('ud')
var el = document.querySelector('#app')
function declare (fn, store) {
  var ml = require('main-loop')
  var vd = require('virtual-dom')
  var l = ml(store, fn, vd)
  el.appendChild(l.target)
  return l
}

// global app state is also defonced
var store = ud.defonce(module, require('./store.js'), 'store')
// the view function
var render = require('./view.js')(store)
// a function to run on reload
// a function to run on setup
function setup () {
  // clear the element html just in case
  el.innerHTML = ''
  // set up main-loop
	var loop = declare(render, store.getState())
  // on changes to store, update main-loop
  store.subscribe(() => 
    loop.update(store.getState()))

}

// TODO onready
setup()
