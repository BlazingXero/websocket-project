import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore'
import { connect } from 'react-redux';
import { loginUser } from '../actions/authentication';
import { createChatroom, getJoinedChatrooms, joinUsingCode } from '../actions/chatroom';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

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
	closeButton: {
		position: 'absolute',
		right: theme.spacing.unit,
		top: theme.spacing.unit,
		color: theme.palette.grey[500],
	}
});

class Home extends Component {

	constructor() {
		super();
		this.state = {
			title: '',
			description: '',
			errors: {},
			chatroomJoined: [],
			chatroomDialogOpen: false,
			chatroomCreated: false,
			joinUsingCodeDialogOpen: false,
			shareCode: '',
		}
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleInputChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	handleClickShowPassword = (e) => {
		this.setState({
			[e.currentTarget.name]: !this.state[e.currentTarget.name]
		})
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const user = {
			email: this.state.email,
			password: this.state.password,
		}

		this.props.loginUser(user);
	}

	componentDidMount = () => {
		this.getChatroomsJoined(this.props.auth.user)
	}

	componentWillReceiveProps = (nextProps) => {
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	onCreateChatroomDialog = (e) => {
		e.preventDefault();
		this.setState({ chatroomDialogOpen: true });
	}

	onJoinUsingCode = (e) => {
		e.preventDefault();
		this.setState({ joinUsingCodeDialogOpen: true });
	}

	handleChatroomDialogClose = () => {
		this.setState({ chatroomDialogOpen: false });
		this.setState({ title: '' });
		this.setState({ description: '' });
	}

	handleCreateChatroom = () => {
		const chatroom = {
			creatorId: this.props.auth.user.id,
			creatorUsername: this.props.auth.user.username,
			title: this.state.title,
			description: this.state.description,
		}
		this.props.createChatroom(chatroom, (response) => {
			if (response && response.data) {
				const newChatroom = response.data;
				this.props.onNewChatroom(newChatroom, () => {
					this.props.onJoinChatroom(newChatroom._id)
					this.getChatroomsJoined(this.props.auth.user)
					this.handleChatroomDialogClose();
				})
			}
		});
	}

	getChatroomsJoined = (user, callback) => {
		const username = user.username;
		const chatroomDetails = [];
		this.props.getJoinedChatrooms({userId: user.id}, (response) => {
			_.each(response.data, function (d) {
				const chatroom = d.chatroom[0];
				if (chatroom.creatorUsername === username) {
					chatroom.creatorUsername = "Me";
				}
				chatroomDetails.push(chatroom)
			});
			this.setState({chatroomJoined: chatroomDetails})
		})
	}

	handleJoinUsingCodeDialogClose = () => {
		this.setState({ joinUsingCodeDialogOpen: false });
		this.setState({ shareCode: '' });
	}

	handleJoinChatroomUsingCode = () => {
		this.props.joinUsingCode({shareCode: this.state.shareCode, userId: this.props.auth.user.id}, (response) => {
			if (response && response.data) {
				const chatroomId = response.data.chatroomId
				this.props.onJoinChatroom(chatroomId)
				this.getChatroomsJoined(this.props.auth.user)
				this.handleJoinUsingCodeDialogClose();
			}
			console.log(response)
		})
	}

	render() {
		const { classes } = this.props;
		const { errors } = this.state;

		const loggedIn = (
			<div>
				Welcome {this.props.auth.user.username} <br />
				{this.state.chatroomJoined.map(chatroom => (
					<Paper key={chatroom._id}
						className={classes.paper}
						style={{ maxWidth: 400, marginBottom: 40 }}
						zdepth={5}
						onClick={() => this.props.onEnterChatroom(chatroom)}

					>
						<Card className={classes.card}>
							<CardActionArea>
								<CardMedia
									className={classes.media}
									image={"icons/"+chatroom.icon+".svg"}
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">
										{chatroom.title}
									</Typography>
									<Typography component="p">
										{chatroom.description}
									</Typography>
								</CardContent>
							</CardActionArea>
						</Card>
					</Paper>
				))}
				<br />
				<Button
					variant="contained"
					color="primary"
					onClick={(event) => this.onCreateChatroomDialog(event)}
					>
					Create Chatroom
				</Button>
				 <Button
					variant="contained"
					color="primary"
					onClick={(event) => this.onJoinUsingCode(event)}
					>
					Join using code
				</Button>
				<Dialog
					open={this.state.chatroomDialogOpen}
					onClose={this.handleChatroomDialogClose}
					aria-labelledby="form-dialog-title"
				>
					<DialogTitle id="form-dialog-title">Create Chatroom</DialogTitle>
					<DialogContent>
						<TextField
							autoFocus
							margin="dense"
							name="title"
							label="Title"
							onChange={this.handleInputChange}
							value={this.state.title}
							type="text"
							error = {!!errors.title}
							helperText={errors.title}
							fullWidth
						/>
						<TextField
							margin="dense"
							name="description"
							label="Description"
							onChange={this.handleInputChange}
							value={this.state.description}
							type="text"
							error = {!!errors.description}
							helperText={errors.description}
							multiline
							fullWidth
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleChatroomDialogClose} color="primary">
							Cancel
						</Button>
						<Button onClick={this.handleCreateChatroom} color="primary">
							Create
						</Button>
					</DialogActions>
				</Dialog>
				<Dialog
					open={this.state.joinUsingCodeDialogOpen}
					onClose={this.handleJoinUsingCodeDialogClose}
					aria-labelledby="alert-dialog-title"
					aria-describedby="alert-dialog-description"
				>
					<IconButton aria-label="Close" className={classes.closeButton} onClick={this.closeShareCodeDialog}>
						<CloseIcon />
					</IconButton>
					<DialogTitle id="alert-dialog-title">Join using code</DialogTitle>
					<DialogContent>
						Enter an invite code to join the chatroom
						<br />
						<TextField
							id="outlined-adornment-password"
							variant="outlined"
							type="text"
							name="shareCode"
							value={this.state.shareCode}
							onChange={this.handleInputChange}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={this.handleJoinChatroomUsingCode} color="primary">
							Join
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		)
		return (
			loggedIn
		);
	}
}

Home.propTypes = {
	loginUser: PropTypes.func.isRequired,
	createChatroom: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export default withRouter(connect(mapStateToProps,{ loginUser, createChatroom, getJoinedChatrooms, joinUsingCode })(withStyles(styles)(Home)))