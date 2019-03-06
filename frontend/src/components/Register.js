import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { registerUser } from '../actions/authentication';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  textField: {
	width: '100%',
  },
});

class Register extends Component {

	constructor() {
		super();
		this.state = {
			firstname: '',
			lastname: '',
			username: '',
			email: '',
			password: '',
			password_confirm: '',
			show_password: false,
			show_password_confirm: false,
			errors: {}
		}
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleInputChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		})
	}

	handleSubmit(e) {
		e.preventDefault();
		const user = {
			firstname: this.state.firstname,
			lastname: this.state.lastname,
			username: this.state.username,
			email: this.state.email,
			password: this.state.password,
			password_confirm: this.state.password_confirm
		}
		this.props.registerUser(user, this.props.history);
	}

	handleClickShowPassword (e) {
		this.setState({
			[e.currentTarget.name]: !this.state[e.currentTarget.name]
		})
	};

	componentWillReceiveProps(nextProps) {
		if(nextProps.auth.isAuthenticated) {
			this.props.history.push('/')
		}
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	componentDidMount() {
		if(this.props.auth.isAuthenticated) {
			this.props.history.push('/');
		}
	}

	render() {
		const { classes } = this.props;
		const { errors } = this.state;

		return(
		<div className="container" style={{ marginTop: '50px', width: '700px'}}>
			<h2 style={{marginBottom: '40px'}}>Registration</h2>
			<form autoComplete="off" onSubmit={ this.handleSubmit }>
				<div>
					<TextField
						id="firstname"
						name="firstname"
						type="text"
						label="First Name"
						margin="normal"
						className={classes.textField}
						error = {errors.firstname && errors.firstname.length > 0}
						onChange={this.handleInputChange}
						value={this.state.firstname}
						helperText={errors.firstname}
						>
					</TextField>
				</div>
				<div>
					<TextField
						id="lastname"
						name="lastname"
						label="Last Name"
						margin="normal"
						className={classes.textField}
						error = {errors.lastname && errors.lastname.length > 0}
						onChange={this.handleInputChange}
						value={this.state.lastname}
						helperText={errors.lastname}
						>
					</TextField>
				</div>
				<div>
					<TextField
						id="username"
						name="username"
						label="Username"
						margin="normal"
						className={classes.textField}
						error = {errors.username && errors.username.length > 0}
						onChange={this.handleInputChange}
						value={this.state.username}
						helperText={errors.username}
						>
					</TextField>
				</div>
				<div>
					<TextField
						id="email"
						name="email"
						label="Email"
						margin="normal"
						className={classes.textField}
						error = {errors.email && errors.email.length > 0}
						onChange={this.handleInputChange}
						value={this.state.email}
						helperText={errors.email}
						>
					</TextField>
				</div>
				<div>
					<TextField
						id="password"
						name="password"
						type={this.state.show_password ? 'text' : 'password'}
						label="Password"
						margin="normal"
						className={classes.textField}
						error = {errors.password && errors.password.length > 0}
						onChange={this.handleInputChange}
						value={this.state.password}
						helperText={errors.password}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
								<IconButton
								aria-label="Toggle password visibility"
								onClick={(event) => this.handleClickShowPassword(event)}
								name="show_password"
								>
								{this.state.show_password ? <VisibilityOff /> : <Visibility />}
								</IconButton>
								</InputAdornment>
								),
							}}
					/>
				</div>
				<div >
					<TextField
						id="password_confirm"
						name="password_confirm"
						type={this.state.show_password_confirm ? 'text' : 'password'}
						label="Confrim Password"
						margin="normal"
						className={classes.textField}
						onChange={this.handleInputChange}
						error = {errors.password_confirm && errors.password_confirm.length > 0}
						value={this.state.password_confirm}
						helperText={errors.password_confirm}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
								<IconButton
								aria-label="Toggle password visibility"
								name="show_password_confirm"
								onClick={(event) => this.handleClickShowPassword(event)}
								>
								{this.state.show_password_confirm ? <VisibilityOff /> : <Visibility />}
								</IconButton>
								</InputAdornment>
								),
							}}
					/>
				</div>
				<div className="form-group">
					<Button 
						variant="contained" 
						color="primary"
						type="submit"
						>
						Register
					</Button>
				</div>
			</form>
		</div>
		)
	}
}

Register.propTypes = {
	registerUser: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
	auth: state.auth,
	errors: state.errors
});

export default withRouter(connect(mapStateToProps,{ registerUser })(withStyles(styles)(Register)))
// export default connect(mapStateToProps,{ registerUser })(withRouter(Register))