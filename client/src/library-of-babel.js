require('buffer')
var crypto = require('crypto-browserify')
var keypair = require('rsa-json')
var _ = require('lodash')
var md5 = require('md5')

function encrypt (pk, text) {
  return crypto.publicEncrypt(pk, new Buffer(text))
}

function decrypt (sk, buff) {
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
    type: 'join',
    pk: pk,
    cause: join.key,
  }
}

// takes an array of public keys `pks`
// and a string `text`
function message (pks, text) {
  var ctexts = pks.map(pk => {
    return encrypt(pk, text)
  })
  var hashed_pks = pks.map(md5)
  var ciphertexts = _.zipObject(hashed_pks, ctexts)
  return {
    'type': 'message',
    'ciphertexts': ciphertexts,
  }
}

function decryptMessage (pk, sk, message) {
  var pk_hash = md5(pk) 
  var my_ciphertext = message.ciphertexts[pk_hash]
  return decrypt(sk, my_ciphertext)
}

module.exports = {
  // crypto stuff
  keypair: keypair,
  encrypt: encrypt,
  decrypt: decrypt,
  // message stuff
  join: join,
  ack: ack,
  message: message,
  decryptMessage: decryptMessage,
}




// // testing stuff
// TODO move into a proper tests suite
//---------------------------------------
// var pksk1 = keypair()
// var pksk2 = keypair()
// var pksk3 = keypair()

// // should be able to enc+dec
// var e =  encrypt(pksk1.public, 'working!')
// console.log('should encrypt and decrypt: ', 
//   decrypt(pksk1.private,e))

// // should be able to build messages
// var m = message([pksk1.public, pksk2.public, pksk3.public], 'yay, working!')
// console.log('message', m)
// var dec = decryptMessage(pksk3.public, pksk3.private, m)
// console.log('decrypted message: ', dec)
