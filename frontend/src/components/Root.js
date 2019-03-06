import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { loginUser } from '../actions/authentication';
import { getJoinedChatrooms } from '../actions/chatroom';
import socket from '../actions/socket'

import { withStyles } from '@material-ui/core/styles';

import Navbar from './Navbar';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import Chatroom from './Chatroom';

const Socket = socket();

const styles = theme => ({
	textField: {
		width: '100%',
	},
	paper: {
		display: 'inline-block',
		marginRight: 20
	},
	card: {
		width: 345
	},
	media: {
		height: 140,
		backgroundSize: 'contain'
	},
});

class Root extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			user: null,
			chatrooms: null
		}
	}

	componentDidMount() {
		if(this.props.auth.isAuthenticated) {
			this.state.user = this.props.auth.user;
			// Socket.socketRegister(this.state.user.id)
			// console.log("this.state.user", this.state.user);
		} else {
			this.props.history.push('/login')
		}
	}

	componentWillReceiveProps = (nextProps) => {
		if(nextProps.auth.isAuthenticated) {
			console.log("nextProps.auth.user", nextProps.auth.user.id);
		}
	}

	componentDidUpdate () {

	}

	onNewChatroom = (chatroom, callback) => {
		Socket.socketNewChatroom(chatroom, callback)
	}

	onJoinChatroom = (chatroomId) => {
		console.log("chatroomId", chatroomId);
		Socket.socketJoin(chatroomId, null)
	}

	registerMessageHandler = (message) => {
		Socket.registerMessageHandler(message)
	}

	registerUserJoined = (user) => {
		Socket.registerUserJoined(user)
	}

	unregisterHandler = () => {
		Socket.unregisterHandler()
	}

	render() {
		return (
			<div>
				<Navbar />
				<div className="container">
					<Route exact path="/" render={
						props => (
							<Home
								onNewChatroom={
									(chatroom, callback) => this.onNewChatroom(chatroom, callback)
								}
								onJoinChatroom={
									(chatroomId) => this.onJoinChatroom(chatroomId)
								}
								onEnterChatroom={
									chatroom => props.history.push({
										pathname: '/chatroom/'+chatroom._id,
										state: { chatroom: chatroom, user: this.state.user }
									})
								}
							/>
						)
					} />
					<Route exact path="/register" component={ Register } />
					<Route exact path="/login" component={ Login } />
					<Route path="/chatroom/:chatroomId" render={
						props => (
							<Chatroom/>
						)}/>
				</div>
			</div>
		)
	}
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export default withRouter(connect(mapStateToProps,{ loginUser, getJoinedChatrooms })(withStyles(styles)(Root)))