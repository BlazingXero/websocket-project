import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import jwt_decode from 'jwt-decode';
import setAuthToken from './setAuthToken';
// import socket from './actions/socket'
import { setCurrentUser, logoutUser } from './actions/authentication';

import Root from './components/Root';

import 'bootstrap/dist/css/bootstrap.min.css';

// const Socket = socket();

if(localStorage.jwtToken) {
	setAuthToken(localStorage.jwtToken);
	const decoded = jwt_decode(localStorage.jwtToken);
	store.dispatch(setCurrentUser(decoded));

	const currentTime = Date.now() / 86400;
	if(decoded.exp < currentTime) {
		store.dispatch(logoutUser());
		window.location.href = '/login'
	} else {
		console.log("logged in")
		// socket().socketRegister(decoded.id)
	}
}

class App extends Component {

	constructor(props, context) {
		super(props, context)

		this.state = {
			user: null,
			isRegisterInProcess: false,
			// client: socket(),
			chatrooms: null
		}
	}

	render() {
		return (
			<Provider store = { store }>
				<Router>
					<Root>
					</Root>
				</Router>
			</Provider>
		);
	}
}

export default App;
