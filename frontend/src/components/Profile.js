import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import _ from 'underscore'
import { connect } from 'react-redux';
import { updateUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
			currentUserProfile: null
		}
		this.handleInputChange = this.handleInputChange.bind(this);
		// this.updateProfile = this.updateProfile.bind(this);
		this.cancelUpdate = this.cancelUpdate.bind(this);
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
		this.props.updateUser(this.state.user);
		this.setState({ edit: false })
	}

	cancelUpdate = () => {
		this.setState({
			user: this.state.currentUserProfile
		})
		this.setState({ edit: false })
	}

	render() {
		// const { classes } = this.props;
		// const { errors } = this.state;

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