import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logoutUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

class Navbar extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			anchorEl: null,
		}

		this.handleLogout = this.handleLogout.bind(this)
		this.handleProfile = this.handleProfile.bind(this)
	}

	handleLogout(e) {
		e.preventDefault();
		this.setState({ anchorEl: null });
		this.props.logoutUser(this.props.history);
	}

	handleMenu = event => {
		this.setState({ anchorEl: event.currentTarget });
	}

	handleProfile = () => {
		this.setState({ anchorEl: null });
		this.props.history.push("/profile");
	}

	handleClose = () => {
		this.setState({ anchorEl: null });
	}

	render() {
		const { isAuthenticated, user } = this.props.auth;
		const { anchorEl } = this.state;
		const open = Boolean(anchorEl);

		const redirectTo = isAuthenticated ? "/" : "/login";
		const authLinks = (
			<ul className="navbar-nav ml-auto">
				<IconButton
					aria-owns={open ? 'menu-appbar' : undefined}
					aria-haspopup="true"
					onClick={this.handleMenu}
					color="inherit"
				>
					<Avatar style={{ width: '25px',	height: '25px'}} src={user.avatar} alt={user.name} title={user.name} />
				</IconButton>
				<Menu
					id="menu-appbar"
					anchorEl={anchorEl}
					getContentAnchorEl={null}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
					open={open}
					onClose={this.handleClose}
				>
					<MenuItem onClick={this.handleProfile}>Profile</MenuItem>
					<MenuItem onClick={this.handleLogout}>Logout</MenuItem>
				</Menu>
			</ul>
		)
		return(
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" color="inherit">
						Chatroom
					</Typography>
					{isAuthenticated && (
						authLinks
					)}
				</Toolbar>
			</AppBar>

		)
	}
}
Navbar.propTypes = {
	logoutUser: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth
})

export default connect(mapStateToProps, { logoutUser })(withRouter(Navbar));