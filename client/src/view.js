var h = require('virtual-dom/h')
var md5 = require('md5')

module.exports = (store) => {

  // expose stuff for browser repl
  //window.createKeys = require('rsa-json')
  window.store = store
  window.l = require('./library-of-babel')

  // a render fn that returns hyperscript
  return function render (state) {
      return h('div', state.chats.map(chatView))
  }

  function chatView (m) {
    return h('div', [
      // posts
      h('div.posts', m.posts.map(div)),
      // input box
      inputBox(),
      // user list
      h('div.userlist', m.userlist.map(div))
    ])
  }

  function div (m) {
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
      type:'send-post', 
      text: m
    })
  }
}
