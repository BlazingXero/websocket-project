import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loginUser } from '../actions/authentication';
import socket from '../actions/socket'

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

class Login extends Component {

	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
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

	handleClickShowPassword (e) {
		this.setState({
			[e.currentTarget.name]: !this.state[e.currentTarget.name]
		})
	};

	onRegister () {
		this.props.history.push("/register")
	}

	handleSubmit(e) {
		e.preventDefault();
		const user = {
			email: this.state.email,
			password: this.state.password,
		}
		this.props.loginUser(user);
	}

	componentDidMount() {
		if(this.props.auth.isAuthenticated) {
			this.props.history.push('/');
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.auth.isAuthenticated) {
			socket().socketRegister(nextProps.auth.user.id)
			this.props.history.push('/')
		}
		if(nextProps.errors) {
			this.setState({
				errors: nextProps.errors
			});
		}
	}

	render() {
		const { classes } = this.props;
		const {errors} = this.state;

		return(
		<div className="container" style={{ marginTop: '50px', width: '700px'}}>
			<h2 style={{marginBottom: '40px'}}>Login!</h2>
			<form onSubmit={ this.handleSubmit }>
				<div className="form-group">
					<TextField
						id="email"
						name="email"
						label="Email"
						margin="normal"
						className={classes.textField}
						onChange={this.handleInputChange}
						value={this.state.email}
						error = {!!errors.email}
						helperText={errors.email}
						>
					</TextField>
				</div>
				<div className="form-group">
					<TextField
						id="password"
						name="password"
						type={this.state.show_password ? 'text' : 'password'}
						label="Password"
						margin="normal"
						className={classes.textField}
						error = {!!errors.password}
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
				<div className="form-group">
					<Button
						variant="contained"
						color="primary"
						type="submit"
						>
						Login
					</Button>
				</div>
				<div classes="form-group">
					Not registered yet? Register now
				</div>
				<div className="form-group">
					<Button
						variant="contained"
						color="primary"
						onClick={(event) => this.onRegister(event)}
						>
						Register
					</Button>
				</div>
			</form>
		</div>
		)
	}
}

Login.propTypes = {
	loginUser: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired,
	errors: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth,
	errors: state.errors
})

export  default connect(mapStateToProps, { loginUser })(withStyles(styles)(Login))