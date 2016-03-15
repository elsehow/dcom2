


var redux = require('redux')

function appStore (state = {
  messages: [],
}, action) {
  switch (action.type) {
  case 'send-message':
    state.messages.push(action.message)
    return state
  default:
    return state
  }
}

// function to setup initial app state
function setup () { 
  // put the schema for your app state here
	return redux.createStore(appStore)
}

module.exports = setup
