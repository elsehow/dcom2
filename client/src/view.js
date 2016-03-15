var h = require('virtual-dom/h')

module.exports = (store) => {

  // expose stuff for browser repl
  //window.createKeys = require('rsa-json')
  window.l = require('./library-of-babel.js')

  // a render fn that returns hyperscript
  return function render (state) {
    return h('div', [
      h('div.messages', state.messages.map(messageDiv)),
      //h('h1', `clicked ${state} times`),
      inputBox(),
    ])
  }

  function messageDiv (m) {
    return h('div', m)
  }

  function inputBox () {
    return h('input', {
      style: {
        width: "300px"
      },
      onkeydown: (ev) => {
        // on enter
        if (ev.which === 13) {
          // send message
          sendMessage(ev.target.value)
          // clear input box
          ev.target.value = ''
        }
      }
    })
  }

  function sendMessage (m) {
    store.dispatch({
      type:'send-message', 
      message: m
    })
  }
}
