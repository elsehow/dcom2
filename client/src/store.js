var redux = require('redux')
var l = require('./library-of-babel')
var _ = require('lodash')

function appStore (state = {
  swarmlog: l.swarmlog(),
  keys: {}, 
  userlist: [],
  messages: [], // log communications
  posts: [],    // plaintext posts
}, action) {
  switch (action.type) {

  case 'send-join':
    // generate a new keypair
    state.keys = l.keypair()
    // append a 'join' message to the log
    console.log('sending JOIN!', l.md5(state.keys.public))
    var j = l.join(state.keys.public)
    state.swarmlog.append(j)
    return state

  case 'send-ack':
    // if this join message is NOT mine,
    if (action.message.value.pk !== state.keys.public) {
      // and it's newer than the last join we saw before this one)
    console.log(
      'hearing JOIN!', 
      l.md5(action.message.value.pk), 
      action.message.change,
      action.message.seq)
      //&& action.message.change > l.lastJoin(_.initial(state.messages))) {
//      // generate a new keypair
//      state.keys = l.keypair()
//      // append an 'ack' message to the log
//      var j = action.message
//      var a = l.ack(state.keys.public, j)
//      state.swarmlog.append(a)
    }
    return state

  case 'send-post':
    // all the public keys i see
    var pks = state.userlist
    // make an encrypted post for these pks
    var m = l.post(pks, action.text)
    // append the message
    state.swarmlog.append(m)
    return state

  case 'compute-userlist':
    state.userlist = l.userlist(state.messages)
    return state

  case 'new-post':
    var pk = state.keys.public
    var sk = state.keys.private
    var plaintext = l.decryptPost(pk, sk, action.message)
    state.posts.push(plaintext)
    return state

  case 'save-message':
    state.messages.push(action.message)
    return state

  default:
    return state
  }
}

function handle (store, message) {
  // save message in our message store regardless
  store.dispatch({
    type: 'save-message',
    message: message
  })
  // based on message type,
  // figure out other stuff to do
  switch(message.value.type) {
    // on join, send ack
    // and recompute userlist
    case 'join':
      store.dispatch({ 
        type: 'send-ack',
        message: message,
      })
      store.dispatch({ 
        type: 'compute-userlist'
      })
      return
    // on ack, re-compute userlist
    case 'ack':
      store.dispatch({ 
        type: 'compute-userlist',
        message: message,
      })
      return
    // on post, decrypt + add to view
    case 'post':
      store.dispatch({
        type: 'new-post',
        message: message,
      })
      return
  }
}

// function to setup initial app state
function setup () { 
  // put the schema for your app state here
	var store = redux.createStore(appStore)
  // handle streaming data from swarmlog
  store.getState().swarmlog
    .createReadStream({ live: true })
    .on('data', d => {
      handle(store, d)
    })
  // send a join message
  store.dispatch({
    type: 'send-join'
  })
  return store
}

module.exports = setup
