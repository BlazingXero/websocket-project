import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore'
import { connect } from 'react-redux';
import { getJoinedChatrooms, updateChatroomData } from '../actions/chatroom';
import { withRouter } from 'react-router-dom';
import socket from '../actions/socket'

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import lightgreen from '@material-ui/core/colors/lightGreen';

import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';

import Chatroom from './Chatroom';
import NewChatroomDialog from './NewChatroomDialog'

const Socket = socket();

const styles = theme => ({
	chatroomContainer: {
		display: 'flex',
		height: '100%'
	},
	chatroomListContainer: {
		flex: '0 1 300px',
		backgroundColor: '#555'
	},
	chatroomList: {
		'&:hover': {
			backgroundColor: 'rgba(255, 255, 255, 0.08)'
		}
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
		margin: 'auto',
		color: '#FFF'
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
	},
	badgeRoot: {
		marginLeft: '5px',
		width: '100%'
	},
	chatroomPrimaryText: {
		color: '#FFF'
	},
	chatroomSecondaryText: {
		color: '#BBB'
	},
	chatroomAvatar: {
		backgroundColor: '#FFF'
	},
	badge: {
		top: '75%',
		right: 0,
		backgroundColor: lightgreen[700],
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

	handleChatroomDialogClose = (data, type) => {
		if (type === 'create') {
			this.onNewChatroom(data, () => {
				this.onJoinChatroom(data._id);
				this.getChatroomsJoined(this.props.auth.user, () => {
					this.loadChatroom(this.state.chatroomJoined[data._id])
				});

			})
		} else if (type === 'join') {
			this.onJoinChatroom(data);
			this.getChatroomsJoined(this.props.auth.user, () => {
				this.loadChatroom(this.state.chatroomJoined[data])
			});

		}


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
				const numMessages = chatroom.chatHistory.length
				chatroom.unreadMessages = numMessages - chatroom.messagesRead;
				Socket.socketEnterChatroom(chatroom._id)
				chatroomDetails[chatroom._id] = chatroom
			});
			this.setState({chatroomJoined: chatroomDetails});
			callback(null)
		})
	}

	onMessageReceived = (entry) => {
		if (!this.state.currentChatroom || entry.chat !== this.state.currentChatroom._id) {
			this.setState((prevState, props) => ({
				chatroomJoined: {
					...this.state.chatroomJoined,
					[entry.chat]: {
						...this.state.chatroomJoined[entry.chat],
						unreadMessages: prevState.chatroomJoined[entry.chat].unreadMessages + 1
					}
				}
			}));
		}

		console.log(this.state.chatroomJoined)
	}

	loadChatroom = (chatroom) => {
		this.setState((prevState, props) => ({
			chatroomJoined: {
				...this.state.chatroomJoined,
				[chatroom._id]: {
					...this.state.chatroomJoined[chatroom._id],
					unreadMessages: 0
				}
			}
		}));

		this.props.updateChatroomData({
			chatroomId: chatroom._id,
			userId: this.props.auth.user.id,
			messagesRead: chatroom.chatHistory.length
		});
		this.setState({currentChatroom: chatroom})
	}

	onNewChatroom = (chatroom, callback) => {
		Socket.socketNewChatroom(chatroom, callback)
	}

	onJoinChatroom = (chatroomId) => {
		Socket.socketJoin(chatroomId, null)
	}

	render() {
		const { classes } = this.props;
		// const { errors } = this.state

		return (
			<div className={classes.chatroomContainer}>
				<div className={classes.chatroomListContainer}>
					<List component="nav">
						{Object.keys(this.state.chatroomJoined).map(
							(chatroomId, i) => {
								return (
									<div key={i} onClick={() => this.loadChatroom(this.state.chatroomJoined[chatroomId])}>
										<ListItem button className={classes.chatroomList}>
											<ListItemAvatar>
												<Avatar
													alt={this.state.chatroomJoined[chatroomId].title}
													src={"icons/"+this.state.chatroomJoined[chatroomId].icon+".svg"}
													className={classes.chatroomAvatar}
												/>
											</ListItemAvatar>
											<Badge color="primary" badgeContent={this.state.chatroomJoined[chatroomId].unreadMessages} classes={{ root: classes.badgeRoot, badge: classes.badge }}>
												<ListItemText
													primary={`${this.state.chatroomJoined[chatroomId].title}`}
													secondary={`${this.state.chatroomJoined[chatroomId].description}`}
													classes={{
														primary: classes.chatroomPrimaryText,
														secondary: classes.chatroomSecondaryText,
													}}
												/>
											</Badge>
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
					<NewChatroomDialog
						closeDialog={this.handleChatroomDialogClose}
					/>
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

export default withRouter(connect(mapStateToProps,{ getJoinedChatrooms, updateChatroomData })(withStyles(styles)(Home)))