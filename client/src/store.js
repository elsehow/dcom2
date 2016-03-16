var redux = require('redux')
var l = require('./library-of-babel')
var _ = require('lodash')


// stuff that goes over the wire
// --------------------------------

//`pk` is some public key string
function join (pk) {
    return {
        type: 'join',
        pk: pk,
    }
}

function ack (pk) {
    return {
        type: 'ack',
        pk: pk,
    }
}

// `pks` is an array of public key strings
function post (pks, text) {
    // encrypt a ciphertext for each public key
    var ciphertexts = pks.map(pk => {
        return encrypt(pk, text)
    })
    // checksum of each public key for a shorter string
    var pk_checksums = pks.map(md5)
    return {
        type: 'post',
        // ciphertexts: { md5(pk1): ciphertext1, md5(pk2): ciphertext2, ... }
        ciphertexts: _.zipObject(pk_checksums, ciphertexts)
    }
}

// app representation stuff
// --------------------------------

// my_keys {public, private}
function chat (my_keys, join_pk, join_key) {
    return {
        join_key: join_key,
        keys: my_keys,
        userlist: [join_pk],
        posts: [],
    }
}

function appStore (state = {
    swarmlog: l.swarmlog(),
    messages: [], // log communications
    chats: [],
}, action) {
  switch (action.type) {

  // message types i might hear


      // TODO think about join / ack logic a little more
      // TODO right idea - don't /do/ things until it comes over log
      // TODO but - diff if we join v someone else

  case 'join':
      var join_key = action.message.key
      var join_pk = action.message.value.pk
      // if it's my join message,
      // we will have state_pksk
      // if we don't have a keypair here (i.e. we didnt start this chat)
      // we generate a new keypair
      var pksk;
      if (!state.new_pksk)
        pksk = l.keypair()
      else {
        pksk = state.new_pksk
        state.new_pksk = null
      }
      // add new chat to the state
      var new_chat = chat(pksk, join_pk, join_key)
      // chat will be assoc'd with join message key
      state.chats[join_key] = new_chat
      // generate ack response
      var log = state.swarmlog
      var a = ack(new_chat.keys.public)
      // link ack with join message key
      log.add(join_key, a)
      return state

  case 'ack':
      // TODO recompute userlist
      //state.userlist = l.userlist(state.messages)
      return state

  case 'post':
      var pk = state.keys.public
      var sk = state.keys.private
      var plaintext = l.decryptPost(pk, sk, action.message)
      state.posts.push(plaintext)
      return state
      return state

  // things the user might do

  case 'send-join':
    var pksk = l.keypair()
    var j = join(pksk.public)
    state.swarmlog.append(j)
    // store temp pointer to pksk
    state.new_pksk = pksk
   return state

  case 'send-post':
    // key referring to
    var k = action.message.links[0]
    // all the public keys i see
    var pks = state.chats[k].userlist
    // make an encrypted post for these pks
    var m = l.post(pks, action.text)
    // append the message
    state.swarmlog.add(k, m)
    return state

  case 'save-message':
    state.messages.push(action.message)
    return state

  default:
    return state
  }
}

function handle (store, message) {

  // TODO validate message - that it fits one of our schema

    console.log('NEW MESSAGE!!', message)

  // save each message we hear in our store
  store.dispatch({
    type: 'save-message',
    message: message
  })

  // dispatch message by its type
  store.dispatch({
    type: message.value.type,
    message: message
  })
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

