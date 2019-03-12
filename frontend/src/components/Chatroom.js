import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'underscore';
import Moment from 'react-moment';
import moment from 'moment'
import 'moment-timezone';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import socket from '../actions/socket'
import { getChatroomMembers, leaveChatroom, createShareCode, updateChatroomData } from '../actions/chatroom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import Chip from '@material-ui/core/Chip';

import MessageIcon from '@material-ui/icons/Message';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import ShareIcon from '@material-ui/icons/Share';
import ExitToApp from '@material-ui/icons/ExitToApp';
import FileCopy from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import PeopleIcon from '@material-ui/icons/People';

const Socket = socket();

const styles = theme => ({
	chatContainer: {
		display: 'flex',
		width: '100%'
	},
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
		boxSizing: 'border-box',
		borderLeft: '2px solid #eee',
		borderRight: '2px solid #eee',
		flex: '1'
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
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		color: theme.palette.grey[500],
	},
	time: {
		position: 'absolute',
		right: '5px',
		bottom: '0px',
		fontSize: '0.6em',
		color: '#BBB'
	},
	dateDivider: {
		padding: '0 5px',
		display: 'inline-block',
		border: '1px solid #BBB',
		borderRadius: '5px',
		marginTop: '5px',
		color: '#bbb',
	},
	chatActions: {
		flex: '0 0 30px'
	},
	centreIcon: {
		display: 'block',
		margin: 'auto'
	}
});

class Chatroom extends React.Component {
	constructor(props, context) {
		super(props, context)
		this.shareCode = React.createRef();

		this.state = {
			chatroomId: null,
			chatHistory: [],
			user: null,
			input: '',
			anchorEl: null,
			members: [],
			showMembers: true,
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
		this.toggleShowMembers = this.toggleShowMembers.bind(this);
	}

	componentDidMount = () => {
		Socket.registerMessageHandler(this.onMessageReceived);
		Socket.registerUserOnlineStatusChange(this.userOnlineStatusChange);
	}

	componentDidUpdate() {
		this.scrollChatToBottom()
	}

	componentWillUnmount() {
		Socket.unregisterHandler();
		if (this.state.chatroom && this.state.chatroom._id) {
			Socket.socketExitChatroom(this.state.chatroom._id);

			this.props.updateChatroomData({
				chatroomId: this.state.chatroom._id,
				userId: this.state.user.id,
				messagesRead: this.state.chatHistory.length
			});
		}
	}

	componentWillReceiveProps = (nextProps) => {
		if (nextProps.chatroom) {
			this.setState({ chatroom: null });
			this.setState({ chatHistory: [] });
			this.setState({ members: [] });
			this.populateChatroom(nextProps.chatroom)
		}
	}

	populateChatroom = (chatroom) => {
		this.props.getChatroomMembers({chatroomId: chatroom._id}, (response) => {
			if (response && response.data) {
				this.setState({chatroom: chatroom})
				this.setState({user: this.props.auth.user})
				const memberData = [];
				this.getCurrentOnlineMembers(null, (memberList) => {
					_.each(response.data, function (d) {
						memberData[d.id] = d
						const userOnline = _.findWhere(memberList, {_id: d.id});
						if (userOnline) {
							memberData[d.id].online = true;
						}
					});
					this.setState({members: memberData})
				});

				this.joinChatroom();
			}
		});
	}

	getCurrentOnlineMembers = (_, callback) => {
		Socket.socketCurrentOnlineMembers(this.state.chatroom._id, callback);
	}

	joinChatroom = () => {
		Socket.socketEnterChatroom(this.state.chatroom._id, (chatHistory) => {
			this.setState({chatHistory: chatHistory})
		})
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
		if (this.state.chatroom && this.state.chatroom._id === entry.chat) {
			this.updateChatHistory(entry)
		}

	}

	userOnlineStatusChange ({user, status}) {
		if (this.state.chatroom) {
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
	}

	leaveChat = () => {
		Socket.socketLeave(this.state.chatroom._id, () => {
			this.props.leaveChatroom({chatroomId: this.state.chatroom._id, userId: this.state.user.id})
			this.props.history.push("/")
		})
	}

	updateChatHistory = (entry) => {
		this.setState({ chatHistory: this.state.chatHistory.concat(entry) })
	}

	scrollChatToBottom = () => {
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

	closeShareCodeDialog = () => {
		this.setState({ shareCodeDialogOpen: false })
	}

	toggleShowMembers = () => {
		this.setState({ showMembers: !this.state.showMembers })
	}

	render() {
		const { classes } = this.props;
		const { anchorEl } = this.state;

		let currentDate;

		return (
			<div className={classes.chatContainer}>
				<div className={classes.chatWindow}>
					<div className={classes.header}>
						<div>
							<p className={classes.title}>
								{this.state.chatroom ? this.state.chatroom.title : ''}
							</p>
						</div>
						{this.state.chatroom ?
							<div className={classes.chatActions}>
								<PeopleIcon className={classes.centreIcon} onClick={this.toggleShowMembers}/>
							</div>
						:
							''
						}
					</div>
					<div className={classes.chatPanel}>
						<div className={classes.scrollable} ref={(panel) => { this.panel = panel; }}>
							<List>
								{this.state.chatHistory.map(
									({ user, message, time, event }, i) => {
										let timeText = '';
										let dateDivider = '';
										let dateText = '';
										if (time) {
											let thisDate = moment(time).endOf('day');
											if (currentDate !== thisDate.format("MM/DD/YY")) {
												const daysDiff = moment(new Date()).endOf('day').diff(thisDate, 'days');
												if (daysDiff === 0) {
													dateText = 'Today';
												} else if (daysDiff === 1) {
													dateText = 'Yesterday';
												} else if (daysDiff <= 7 ) {
													dateText = moment(time).endOf('day').format("dddd");
												} else {
													dateText = moment(time).endOf('day').format("MM/DD/YY");
												}
												dateDivider = <div style={{ textAlign: 'center', marginTop: '10px' }}><Chip label={dateText} color="primary" /></div>
												currentDate = thisDate.format("MM/DD/YY")
											} else {
												dateDivider = '';
											}
											timeText = <Moment className={classes.time} format="hh:mm A">{time}</Moment>
										}
										return [
											<div key={i}>
												{dateDivider}
												<ListItem>
													<ListItemAvatar>
														<Avatar alt={user.username} src={user.avatar} />
													</ListItemAvatar>
													<ListItemText
														primary={`${user.username} ${event || ''}`}
														secondary={
															<span style={{whiteSpace: 'pre-line'}}>
																{message}
															</span>
														}
													/>
													{timeText}
												</ListItem>
												<Divider variant="inset" component="li" />
											</div>
										]
									}
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
								InputProps={{
									disabled: Boolean(!this.state.chatroom),
									// disableUnderline: Boolean(!this.state.edit)
								}}
							/>
							<Fab color="primary" aria-label="Add" className={classes.fab} onClick={(event) => this.onSendMessage(event)}>
								<MessageIcon />
							</Fab>
						</div>
					</div>
				</div>
				{ this.state.chatroom && this.state.showMembers ?
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
									return this.state.members[userId].username && this.state.members[userId].online ?
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
									return this.state.members[userId].username && !this.state.members[userId].online ?
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
				:
					null
				}
				<Menu
					id="long-menu"
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={this.handleClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
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
	auth: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
})
export default withRouter(connect(mapStateToProps, { getChatroomMembers, leaveChatroom, createShareCode, updateChatroomData })(withStyles(styles)(Chatroom)))
