import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore'
import { connect } from 'react-redux';
import { getJoinedChatrooms } from '../actions/chatroom';
import { withRouter } from 'react-router-dom';
import socket from '../actions/socket'

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';

import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';

import Chatroom from './Chatroom';
import NewChatroomDialog from './NewChatroomDialog'

const Socket = socket();

const styles = theme => ({
	chatroomContainer: {
		display: 'flex',
		height: '100%'
	},
	chatroomList: {
		flex: '0 1 300px',
	},
	chatroomMain: {
		flex: '1 1 auto'
	},
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
	closeButton: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		color: theme.palette.grey[500],
	},
	actions: {
		margin: '5px'
	},
	button: {
		margin: theme.spacing.unit,
	},
	input: {
		display: 'none',
	},
	centreIcon: {
		display: 'block',
		margin: 'auto'
	},
	newChatroomOption: {
		border: '1px solid #eee',
		borderRadius: '5px',
		display: 'inline-block',
		width: '40%',
		margin: '0 15px',
		textAlign: 'center',
		padding: '25px 13px',
		cursor: 'pointer'
	},
	floatCircle: {
		height: '60px',
		width: '60px',
		borderRadius: '50%',
		border: '1px solid #eee',
		position: 'absolute',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		top: '50%',
		backgroundColor: '#fff',
	},
	floatRect: {
		position: 'absolute',
		height: '60px',
		width: '30px',
		backgroundColor: '#FFF',
		lineHeight: '60px',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
	}
});

class Home extends Component {

	constructor() {
		super();
		this.state = {
			user: null,
			chatroomJoined: [],
			chatroomDialogOpen: false,
			currentChatroom: null,
		}

		this.handleInputChange = this.handleInputChange.bind(this);
		this.onMessageReceived = this.onMessageReceived.bind(this);
		this.loadChatroom = this.loadChatroom.bind(this);
	}

	handleInputChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	componentDidMount = () => {
		Socket.registerMessageHandler(this.onMessageReceived);
		this.getChatroomsJoined(this.props.auth.user)
	}

	componentWillReceiveProps = (nextProps) => {
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	componentWillUnmount() {
		Socket.unregisterHandler();
	}

	onCreateChatroomDialog = (e) => {
		e.preventDefault();
		this.setState({ chatroomDialogOpen: true });
	}

	handleChatroomDialogClose = () => {
		this.setState({ chatroomDialogOpen: false });
	}

	getChatroomsJoined = (user, callback) => {
		const username = user.username;
		const chatroomDetails = {};
		this.props.getJoinedChatrooms({userId: user.id}, (response) => {
			_.each(response.data, function (d) {
				let chatroom = d.chatroom[0];
				chatroom.messagesRead = d.messagesRead || 0;
				chatroom.lastRead = d.lastRead;
				if (chatroom.creatorUsername === username) {
					chatroom.creatorUsername = "Me";
				}
				const numMessages = _.compact(_.pluck(chatroom.chatHistory, 'message')).length
				chatroom.unreadMessages = numMessages - chatroom.messagesRead;
				Socket.socketEnterChatroom(chatroom._id)
				chatroomDetails[chatroom._id] = chatroom
			});
			this.setState({chatroomJoined: chatroomDetails});
		})
	}

	onMessageReceived = (entry) => {
		this.setState((prevState, props) => ({
			chatroomJoined: {
				...this.state.chatroomJoined,
				[entry.chat]: {
					...this.state.chatroomJoined[entry.chat],
					unreadMessages: prevState.chatroomJoined[entry.chat].unreadMessages + 1
				}
			}
		}))
	}

	loadChatroom = (chatroom) => {
		this.setState({currentChatroom: chatroom})
	}

	render() {
		const { classes } = this.props;
		// const { errors } = this.state

		return (
			<div className={classes.chatroomContainer}>
				<div className={classes.chatroomList}>
					<List component="nav">
						{Object.keys(this.state.chatroomJoined).map(
							(chatroomId, i) => {
								return (
									<div key={i} onClick={() => this.loadChatroom(this.state.chatroomJoined[chatroomId])}>
										<ListItem button >
											<ListItemAvatar>
												<Avatar alt={this.state.chatroomJoined[chatroomId].title} src={"icons/"+this.state.chatroomJoined[chatroomId].icon+".svg"} />
											</ListItemAvatar>
											<ListItemText
												primary={`${this.state.chatroomJoined[chatroomId].title}`}
												secondary={`${this.state.chatroomJoined[chatroomId].description}`}
											/>
										</ListItem>
										<Divider />
									</div>
								)
							}
						)}
						<div>
							<ListItem button onClick={(event) => this.onCreateChatroomDialog(event)}>
								<AddCircleOutlinedIcon className={classes.centreIcon}/>
							</ListItem>
						</div>
					</List>
				</div>
				<Chatroom chatroom={this.state.currentChatroom} />
				<Dialog
					open={this.state.chatroomDialogOpen}
					onClose={this.handleChatroomDialogClose}
					aria-labelledby="form-dialog-title"
					maxWidth="sm"
					fullWidth={true}
				>
					<NewChatroomDialog closeDialog={this.handleChatroomDialogClose}/>
				</Dialog>
			</div>
		);
	}
}

Home.propTypes = {
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export default withRouter(connect(mapStateToProps,{ getJoinedChatrooms })(withStyles(styles)(Home)))