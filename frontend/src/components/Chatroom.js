import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'underscore';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import socket from '../actions/socket'
import { getChatroomMembers, leaveChatroom, createShareCode } from '../actions/chatroom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import MessageIcon from '@material-ui/icons/Message';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem';
import ShareIcon from '@material-ui/icons/Share';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import FileCopy from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';

const Socket = socket();

const styles = theme => ({
	button: {
		margin: theme.spacing.unit,
	},
	input: {
		display: 'none',
	},
	chatWindow: {
		position: 'relative',
		display: 'inline-flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		height: '100%',
		width: '80%',
		boxSizing: 'border-box',
		border: '2px solid #eee',
		borderTopLeftRadius: '10px',
		borderBottomLeftRadius: '10px'

	},
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		margin: '0 20px' ,
		zIndex: '1',
		minHeight: '70px'
	},
	title: {
		textAlign: 'center',
		fontSize: '24px',
		margin: '0',
		lineHeight: '58px'
	},
	chatPanel: {
		position: 'relative',
		display: 'inline-flex',
		flexDirection: 'column',
		justifyContent: 'flex-end',
		height: '100%',
		width: '100%',
		boxSizing: 'border-box',
		zIndex: '1',
	},
	scrollable: {
		height: '100%',
		overflow: 'auto',
		borderTop: '2px solid #eee',
		borderBottom: '2px solid #eee',
	},
	noDots: {
		visibility: 'hidden'
	},
	outputText: {
		whiteSpace: 'normal !important',
		wordBreak: 'break-all !important',
		overflow: 'initial !important',
		width: '100%',
		height: 'auto !important',
		color: '#fafafa !important',
	},
	inputPanel: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		padding: '20px',
		alignSelf: 'center',
		borderTop: '1px solid #fafafa',
	},
	memberList: {
		width: '20%',
		height: '100%',
		border: '2px solid #eee',
		borderLeft: 'none',
		borderTopRightRadius: '10px',
		borderBottomRightRadius: '10px'
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		color: theme.palette.grey[500],
	}
});

class Chatroom extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.shareCode = React.createRef();
		console.log("props", props);

		this.state = {
			chatroomId: null,
			chatHistory: [],
			user: null,
			input: '',
			anchorEl: null,
			members: [],
			shareCodeDialogOpen: false,
			currentShareCode: ''
		}

		this.onInput = this.onInput.bind(this)
		this.onSendMessage = this.onSendMessage.bind(this)
		this.leaveChat = this.leaveChat.bind(this)
		this.onMessageReceived = this.onMessageReceived.bind(this)
		this.userOnlineStatusChange = this.userOnlineStatusChange.bind(this)
		this.updateChatHistory = this.updateChatHistory.bind(this)
		this.scrollChatToBottom = this.scrollChatToBottom.bind(this)
		this.leaveChat = this.leaveChat.bind(this);
		this.closeShareCodeDialog = this.closeShareCodeDialog.bind(this);
		this.createShareCode = this.createShareCode.bind(this);
	}

	componentDidMount = () => {
		Socket.registerMessageHandler(this.onMessageReceived);
		Socket.registerUserOnlineStatusChange(this.userOnlineStatusChange);

		this.scrollChatToBottom();
		console.log(this.props.location.state.chatroom._id)
		this.props.getChatroomMembers({chatroomId: this.props.location.state.chatroom._id}, (response) => {
			if (response && response.data) {
				this.setState({chatroom: this.props.location.state.chatroom})
				this.setState({user: this.props.location.state.user})
				const memberData = [];
				this.getCurrentOnlineMembers(null, function (memberList) {
					_.each(response.data, function (d) {
						memberData[d.id] = d
						const userOnline = _.findWhere(memberList, {_id: d.id});
						if (userOnline) {
							memberData[d.id].online = true;
						}
					});
				});

				this.setState({members: memberData})
				this.joinChatroom();
			}
		});
	}

	componentDidUpdate() {
		this.scrollChatToBottom()
	}

	componentWillUnmount() {
		Socket.unregisterHandler();
		Socket.socketExitChatroom(this.state.chatroom._id);
	}

	componentWillReceiveProps = (nextProps) => {
	}

	getCurrentOnlineMembers = (_, callback) => {
		Socket.socketCurrentOnlineMembers(this.state.chatroom._id, callback);
	}

	joinChatroom = () => {
		Socket.socketEnterChatroom(this.state.chatroom._id, (chatHistory) => {
			this.setState({chatHistory: chatHistory})
		})
	}

	getChatHistory = () => {
		Socket.socketGetChatHistory(this.state.chatroom._id, (chatHistory) => {
			this.setState({chatHistory: chatHistory})
		});
	}

	onInput(e) {
		this.setState({ input: e.target.value })
	}

	onSendMessage () {
		if (!this.state.input)
			return
		Socket.socketMessage(this.state.chatroom._id, this.state.input, (err) => {
			if (err)
				return console.error(err)

			return this.setState({ input: '' })
		});
	}

	onMessageReceived(entry) {
		this.updateChatHistory(entry)
	}


	userOnlineStatusChange ({user, status}) {
		this.setState({
			members: {
				...this.state.members,
				[user._id]: {
					...this.state.members[user._id],
					online: status
				}
			},
		});
	}

	leaveChat = () => {
		Socket.socketLeave(this.state.chatroom._id, () => {
			this.props.leaveChatroom({chatroomId: this.state.chatroom._id, userId: this.state.user.id})
			this.props.history.push("/")
		})
	}

	updateChatHistory(entry) {
		this.setState({ chatHistory: this.state.chatHistory.concat(entry) })
	}

	scrollChatToBottom() {
		this.panel.scrollTo(0, this.panel.scrollHeight)
	}

	openMenuOptions = (event) => {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleClose = () => {
		this.setState({ anchorEl: null });
	}

	createShareCode = () => {
		this.props.createShareCode(this.state.chatroom._id, (response) => {
			if (response && response.data) {
				this.setState({ shareCodeDialogOpen: true })
				this.setState({ currentShareCode: response.data.shareCode });
			}
		});
	}

	closeShareCodeDialog () {
		this.setState({ shareCodeDialogOpen: false })
	}

	render() {
		const { classes } = this.props;
		const { anchorEl } = this.state;

		return (
			<div style={{ height: '85vh', display: 'flex', 'marginTop': '10px' }}>
				<div className={classes.chatWindow}>
					<div className={classes.header}>
						<p className={classes.title}>
							{this.state.chatroom ? this.state.chatroom.title : ''}
						</p>
					</div>
					<div className={classes.chatPanel}>
						<div className={classes.scrollable} ref={(panel) => { this.panel = panel; }}>
							<List>
								{this.state.chatHistory.map(
									({ user, message, event }, i) => [
										<div key={i}>
											<ListItem>
												<ListItemAvatar>
													<Avatar alt={user.username} src={user.avatar} />
												</ListItemAvatar>
												<ListItemText
													primary={`${user.username} ${event || ''}`}
													secondary={
														<React.Fragment>
															{message}
														</React.Fragment>
													}
												/>
											</ListItem>
											<Divider variant="inset" component="li" />
										</div>
									]
								)}
							</List>
						</div>
						<div className={classes.inputPanel}>
							<TextField
								id="standard-multiline-flexible"
								label="Enter a message"
								name="input"
								multiline
								rowsMax="4"
								value={this.state.input}
								fullWidth
								onChange={this.onInput}
								margin="normal"
							/>
							<Fab color="primary" aria-label="Add" className={classes.fab} onClick={(event) => this.onSendMessage(event)}>
								<MessageIcon />
							</Fab>
						</div>
					</div>
				</div>
				<div className={classes.memberList}>
					<div style={{ 'textAlign': 'right' }}>
						<IconButton aria-label="Settings" onClick={this.openMenuOptions}>
							<KeyboardArrowDown fontSize="small" />
						</IconButton>
					</div>
					<div>
						ONLINE ({_.where(this.state.members, {online: true}).length}):
						<List className={classes.root}>
							{Object.keys(this.state.members).map(
								(userId, i) => {
								return this.state.members[userId].online ?
										[<div key={i}>
											<ListItem>
												<ListItemAvatar>
													<Avatar alt={this.state.members[userId].username} src={this.state.members[userId].avatar} />
												</ListItemAvatar>
												<ListItemText
													primary={`${this.state.members[userId].username}`}
												/>
											</ListItem>
										</div>]
									: ''
								}
							)}
						</List>
					</div>
					<div>
						OFFLINE ({_.where(this.state.members, {online: false}).length}):
						<List className={classes.root}>
							{Object.keys(this.state.members).map(
								(userId, i) => {
								return !this.state.members[userId].online ?
										[<div key={i}>
											<ListItem>
												<ListItemAvatar>
													<Avatar alt={this.state.members[userId].username} src={this.state.members[userId].avatar} />
												</ListItemAvatar>
												<ListItemText
													primary={`${this.state.members[userId].username}`}
												/>
											</ListItem>
										</div>]
									: ''
								}
							)}
						</List>
					</div>
				</div>
				<Menu
					id="long-menu"
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={this.handleClose}
				>
					<MenuItem onClick={() => this.createShareCode()}>
						<ShareIcon />
						<ListItemText inset primary="Create share code" />
					</MenuItem>
					<MenuItem onClick={() => this.leaveChat()}>
						<ExitToApp />
						<ListItemText inset primary="Leave chatroom" />
					</MenuItem>
				</Menu>
				<Dialog
					open={this.state.shareCodeDialogOpen}
					onClose={this.handleShareCodeDialogClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<IconButton aria-label="Close" className={classes.closeButton} onClick={this.closeShareCodeDialog}>
						<CloseIcon />
					</IconButton>
					<DialogTitle id="alert-dialog-title">Invite friends to {this.state.chatroom ? this.state.chatroom.title : ''}</DialogTitle>
					<DialogContent>
						Share this code with others to grant access to this chatroom
						<TextField
							id="outlined-adornment-password"
							variant="outlined"
							type="text"
							value={this.state.currentShareCode}
							readOnly
							helperText="Your code will expire in 1 day"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<CopyToClipboard text={this.state.currentShareCode}>
											<IconButton>
												<FileCopy />
											</IconButton>
										</CopyToClipboard>
									</InputAdornment>
								),
							}}
						/>
					</DialogContent>
				</Dialog>
			</div>

		)
	}
}

Chatroom.propTypes = {
	classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
})
export default withRouter(connect(mapStateToProps, { getChatroomMembers, leaveChatroom, createShareCode })(withStyles(styles)(Chatroom)))
