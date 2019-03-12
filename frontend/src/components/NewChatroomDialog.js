import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logoutUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { createChatroom, joinUsingCode } from '../actions/chatroom';

import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import blue from '@material-ui/core/colors/blue';
import orange from '@material-ui/core/colors/orange';

import GroupAddIcon from '@material-ui/icons/GroupAdd';
import GroupIcon from '@material-ui/icons/Group';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';


const styles = theme => ({
	startPanel: {
		width: '100%'
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
		top: '55%',
		left: '50%',
		width: '60px',
		height: '60px',
		position: 'absolute',
		transform: 'translate(-50%, 165%)',
		borderRadius: '50%',
		backgroundColor: '#fff',
	},
	floatCircleOuter: {
		top: '55%',
		left: '50%',
		width: '62px',
		height: '62px',
		position: 'absolute',
		transform: 'translate(-50%, 158%)',
		background: 'linear-gradient(to right,' + orange[700] + ', ' + blue[700] + ' )',
		borderRadius: '50%',
	},
	floatRect: {
		top: '55%',
		left: '50%',
		width: '30px',
		height: '65px',
		position: 'absolute',
		transform: 'translate(-50%, 150%)',
		lineHeight: '65px',
		backgroundColor: '#FFF',
	},
	outerWrapper: {
		position: 'relative',
		overflow: 'hidden',
		height: '340px',
		width: '100%',
	},
	innerWrapper: {
		width: '200%',
		position: 'absolute',
		// transitionDuration: '100ms',
		transitionTimingFunction: 'cubic-bezier(0.175, 0.665, 0.320, 1), linear',
		transition: '2s',
	},
	pane: {
		float: 'left',
		width: '50%',
		display: 'block',
	},
	buttonSubmit: {
		marginTop: '20px'
	},
	buttonSubmitLeft: {
		float: 'left',
	},
	buttonSubmitRight: {
		float: 'right',
	}
});

class NewChatroomDialog extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			step: 'start',
			errors: {},
			title: '',
			description: '',
			shareCode: '',
			stepContent: null,
		}

		this.changeStep = this.changeStep.bind(this);
		this.getDialogTitle = this.getDialogTitle.bind(this);
	}

	componentWillReceiveProps = (nextProps) => {
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	changeStep (step) {
		if (step !== 'start') {
			this.setState({ stepContent: step })
		}
		this.setState({ step: step })
	}

	handleInputChange = (e) => {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	getDialogTitle () {
		let dialogTitleText = '';
		switch (this.state.step) {
			case 'start':
				dialogTitleText = 'New Chatroom'
				break;
			case 'create':
				dialogTitleText = 'Create new chatroom'
				break;
			case 'join':
				dialogTitleText = 'Join a Chatroom'
				break;
			default:
				dialogTitleText = ''
				break;
		}

		return dialogTitleText
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
				this.setState({ title: '', description: '', shareCode: '' });
				this.props.closeDialog(newChatroom, 'create');
			}
		});
	}

	handleJoinChatroom = () => {
		const data = {
			shareCode: this.state.shareCode,
			userId: this.props.auth.user.id
		}
		this.props.joinUsingCode(data, (response) => {
			if (response && response.data) {
				const chatroomId = response.data.chatroomId

				this.setState({ title: '', description: '', shareCode: '' });
				this.props.closeDialog(chatroomId, 'join');
			}
		})
	}

	render() {
		const { classes } = this.props;
		const { errors } = this.state

		return (
			<div>
				<div className={classes.outerWrapper}>
					<div className={classes.innerWrapper} style={{left: this.state.step === 'start' ? "0px" : "-100%"}}>
						<div className={classes.pane}>
							<DialogTitle id="form-dialog-title">NEW CHATROOM</DialogTitle>
							<DialogContent style={{textAlign: 'center'}}>
								<div className={classes.startPanel}>
									<div style={{position: 'relative'}}>
										<div className={classes.floatCircleOuter} />
										<div className={classes.floatCircle}>
										</div>
										<div className={classes.floatRect}>
											OR
										</div>
									</div>
									<div
										className={classes.newChatroomOption}
										style={{borderColor: orange[700], color: orange[700]}}
										onClick={() => this.changeStep('create')}
									>
										<p>CREATE</p>
										<p> Create a new chatroom and invite your friends </p>
										<GroupAddIcon style={{ fontSize: 80 }} />
									</div>
									<div
										className={classes.newChatroomOption}
										style={{borderColor: blue[700], color: blue[700]}}
										onClick={() => this.changeStep('join')}
									>
										<p>JOIN</p>

										<p> Enter a share code and join your friends chatroom </p>
										<GroupIcon style={{ fontSize: 80 }} />
									</div>

								</div>
							</DialogContent>
						</div>
						<div className={classes.pane}>
							<DialogTitle id="form-dialog-title">{this.state.step === 'create' ? 'CREATE NEW CHATROOM' : 'JOIN A CHATROOM'}</DialogTitle>
							{this.state.stepContent === 'create' ?
								<DialogContent style={{ textAlign: 'center', color: orange[700] }}>
									Create a chatroom and invite your friends
									<div>
										<TextField
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
										<br />
										<TextField
											margin="dense"
											name="description"
											label="Description"
											onChange={this.handleInputChange}
											value={this.state.description}
											type="text"
											error = {!!errors.description}
											helperText={errors.description}
											fullWidth
										/>
									</div>
									<div>
										<Button
											className={`${classes.buttonSubmit} ${classes.buttonSubmitLeft}`}
											onClick={() => this.changeStep('start')}
										>
											<ArrowBackIcon />Go Back
										</Button>
										<Button
											variant="contained"
											color="primary"
											className={`${classes.buttonSubmit} ${classes.buttonSubmitRight}`}
											onClick={this.handleCreateChatroom}
										>
											Create
										</Button>
									</div>
								</DialogContent>
							:
								<DialogContent style={{ textAlign: 'center', color: blue[700 ]}}>
									Enter a share code below to join an existing chatroom. The code will look somthing like this:
									<div>
										<TextField
											disabled
											id="outlined-disabled"
											margin="normal"
											variant="outlined"
											value="u5Nvi"
										/>
									</div>
									<div>
										<TextField
											margin="dense"
											name="shareCode"
											label="Share Code"
											onChange={this.handleInputChange}
											value={this.state.shareCode}
											type="text"
											error = {!!errors.shareCode}
											helperText={errors.shareCode}
											fullWidth
										/>
										<br />
									</div>
									<div>
										<Button
											className={`${classes.buttonSubmit} ${classes.buttonSubmitLeft}`}
											onClick={() => this.changeStep('start')}
										>
											<ArrowBackIcon />Go Back
										</Button>
										<Button
											variant="contained"
											color="primary"
											className={`${classes.buttonSubmit} ${classes.buttonSubmitRight}`}
											onClick={this.handleJoinChatroom}
										>
											Join
										</Button>
									</div>
								</DialogContent>
							}
						</div>
					</div>
				</div>
			</div>

		)
	}
}
NewChatroomDialog.propTypes = {
	logoutUser: PropTypes.func.isRequired,
	createChatroom: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export default withRouter(connect(mapStateToProps,{ createChatroom, joinUsingCode, logoutUser })(withStyles(styles)(NewChatroomDialog)))