require('buffer')
var crypto = require('crypto-browserify')
var keypair = require('rsa-json')
var _ = require('lodash')
var md5 = require('md5')
var jsonB = require('json-buffer')

function encrypt (pk, text) {
  var b = crypto.publicEncrypt(pk, new Buffer(text))
  return jsonB.stringify(b)
}

function decrypt (sk, buffStr) {
  var buff = jsonB.parse(buffStr)
  return crypto.privateDecrypt(sk, buff).toString()
}

function join (pk) {
  return {
    type: 'join',
    pk: pk,
  }
}

function ack (pk, join) {
  return {
    type: 'ack',
    pk: pk,
    cause: join.key,
  }
}

// takes an array of public keys `pks`
// and a string `text`
function post (pks, text) {
console.log('pks', pks)
console.log('text', text)
  var ctexts = pks.map(pk => {
    return encrypt(pk, text)
  })
  var hashed_pks = pks.map(md5)
  var ciphertexts = _.zipObject(hashed_pks, ctexts)
  return {
    type: 'post',
    ciphertexts: ciphertexts,
  }
}

function decryptPost (pk, sk, post) {
  var pk_hash = md5(pk) 
  var my_ciphertext = post.value.ciphertexts[pk_hash]
console.log('found cyphertext to decrypt', my_ciphertext)
  return decrypt(sk, my_ciphertext)
}

function swarmlog () {
  var log = require('swarmlog')
  var memdb = require('memdb')
  
  return log({
    keys: require('../keys.json'),
    sodium: require('chloride/browser'),
    db: memdb(),
    valueEncoding: 'json',
    hubs: [ 'https://signalhub.mafintosh.com' ]
  })
}

// 1. find the last join messages
// 2. find all ack messages that cite it
//    TODO (all messages should be of a > "change"
function userlist (log) {
  // find last join event
  var last_join = _
    .chain(log)
    .filter(m => m.value.type === 'join')
    .last()
    .value()
  // find all posts who's cause are this message
  return _
    .chain(log)
    .filter(m => {
      var k = last_join.key
      return m.value.cause === k || m.key === k
    })
    .map(m => m.value.pk)
    .value()
}


module.exports = {
  // crypto stuff
  keypair: keypair,
  encrypt: encrypt,
  decrypt: decrypt,
  // message stuff
  join: join,
  ack: ack,
  post: post,
  decryptPost: decryptPost,
  // swarmlog stuff
  swarmlog: swarmlog,
  userlist: userlist,
}




// // testing stuff
// TODO move into a proper tests suite
//---------------------------------------
// crypto tests
//---------------------------------------
//var pksk1 = keypair()
//var pksk2 = keypair()
//var pksk3 = keypair()

// // should be able to enc+dec
// var e =  encrypt(pksk1.public, 'working!')
// console.log('should encrypt and decrypt: ', 
//   decrypt(pksk1.private,e))

// // should be able to build messages
// var m = post([pksk1.public, pksk2.public, pksk3.public], 'yay, working!')
// console.log('message', m)
// var dec = decryptPost(pksk3.public, pksk3.private, m)
// console.log('decrypted message: ', dec)

//---------------------------------------
// swarmlog tests
//---------------------------------------
//console.log('hi')
//var log = swarmlog()
//window.logData = []
//log.createReadStream({ live: true })
//  .on('data', d => {
//    window.logData.push(d)
//    if (d.value.type === 'join') {
//      //log.append(ack(pksk2.public, d.value))
//    }
//})
//log.append(join(pksk1.public))
//log.append(join(pksk3.public))
//
//setTimeout(() => {
//  console.log('userlist', userlist(window.logData))
//}, 3000)
