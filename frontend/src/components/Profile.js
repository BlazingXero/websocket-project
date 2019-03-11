import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import _ from 'underscore'
import { connect } from 'react-redux';
import { updateUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import green from '@material-ui/core/colors/green';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

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
	},
	actions: {
		margin: '5px'
	},
	success: {
		backgroundColor: green[600],
	},
	message: {
		display: 'flex',
		alignItems: 'center',
	},
	icon: {
		fontSize: 20,
	},
	iconVariant: {
		marginRight: theme.spacing.unit
	}
});

class Profile extends Component {

	constructor() {
		super();
		this.state = {
			edit: false,
			user: {
				firstname: '',
				lastname: '',
				username: '',
				email: '',
			},
			errors: {},
			showSuccess: false,
			currentUserProfile: null
		}
		this.handleInputChange = this.handleInputChange.bind(this);
		// this.updateProfile = this.updateProfile.bind(this);
		this.cancelUpdate = this.cancelUpdate.bind(this);
		this.handleCloseSuccess = this.handleCloseSuccess.bind(this);
	}

	handleInputChange = (e) => {
		this.setState({
			user: {
				...this.state.user,
				[e.target.name]: e.target.value
			}
		})
	}

	componentDidMount = () => {
		this.setState({user: this.props.auth.user})
	}

	componentWillReceiveProps = (nextProps) => {
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	editProfile = () => {
		this.setState({ currentUserProfile: this.state.user })
		this.setState({ edit: true })
	}

	updateProfile = () => {
		this.props.updateUser(this.state.user, (res) => {
			console.log("res", res);
			this.setState({ edit: false })
			this.setState({ showSuccess: true })
		});
		//
	}

	cancelUpdate = () => {
		this.setState({
			user: this.state.currentUserProfile
		})
		this.setState({ edit: false })
	}

	handleCloseSuccess = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		this.setState({ showSuccess: false });
	}

	render() {
		const { classes } = this.props;
		console.log("classes", classes);
		const { errors } = this.state;
		console.log("errors", errors);

		return (
			<div style={{padding: '20px'}}>
				<h2 style={{marginBottom: '20px'}}>Profile</h2>
				<div className="form-group">
					<TextField
						label="First name"
						name="firstname"
						value={this.state.user.firstname}
						onChange={this.handleInputChange}
						InputProps={{
							readOnly: Boolean(!this.state.edit),
							disableUnderline: Boolean(!this.state.edit)
						}}
						error = {!!errors.firstname}
						helperText={errors.firstname}
					>
					</TextField>
				</div>
				<div className="form-group">
					<TextField
						label="Last name"
						name="lastname"
						value={this.state.user.lastname}
						onChange={this.handleInputChange}
						InputProps={{
							readOnly: Boolean(!this.state.edit),
							disableUnderline: Boolean(!this.state.edit)
						}}
						error = {!!errors.lastname}
						helperText={errors.lastname}
					>
					</TextField>
				</div>
				<div className="form-group">
					<TextField
						label="Username"
						name="username"
						value={this.state.user.username}
						onChange={this.handleInputChange}
						InputProps={{
							readOnly: Boolean(!this.state.edit),
							disableUnderline: Boolean(!this.state.edit)
						}}
						error = {!!errors.username}
						helperText={errors.username}
					>
					</TextField>
				</div>
				<div className="form-group">
					<TextField
						label="Email"
						name="email"
						value={this.state.user.email}
						onChange={this.handleInputChange}
						InputProps={{
							readOnly: Boolean(true),
							disableUnderline: Boolean(true)
						}}
					>
					</TextField>
				</div>
				{this.state.edit ?
					<div>
						<Button
							style={{marginRight: '20px'}}
							variant="contained"
							color="primary"
							onClick={this.updateProfile}>
							Update
						</Button>
						<Button
							variant="contained"
							color="secondary"
							onClick={this.cancelUpdate}>
							Cancel
						</Button>
					</div>
				:
					<div>
						<Button
							variant="contained"
							color="primary"
							onClick={this.editProfile}>
							Edit
						</Button>
					</div>
				}
				<Snackbar
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					open={this.state.showSuccess}
					autoHideDuration={6000}
					onClose={this.handleCloseSuccess}
				>
					<SnackbarContent
						className={classes.success}
						aria-describedby="client-snackbar"
						message={
							<span id="client-snackbar" className={classes.message}>
								<CheckCircleIcon className={classNames(classes.icon, classes.iconVariant)}/>
								Profile Updated!
							</span>
						}
						action={[
							<IconButton
								key="close"
								aria-label="Close"
								color="inherit"
								className={classes.close}
								onClick={this.handleCloseSuccess}
							>
								<CloseIcon className={classes.icon} />
							</IconButton>,
						]}
					/>
				</Snackbar>
			</div>
		);
	}
}

Profile.propTypes = {
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export default withRouter(connect(mapStateToProps,{ updateUser })(withStyles(styles)(Profile)))