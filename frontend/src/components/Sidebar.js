import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logoutUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import ChatIcon from '@material-ui/icons/Chat';
import ForumIcon from '@material-ui/icons/Forum';
import SubjectIcon from '@material-ui/icons/Subject';


const styles = theme => ({
	sidebar: {
		width: '250px',
		backgroundColor: '#eee'
		// flex: '1'
	}
});

class Sidebar extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {

		}
	}

	render() {
		const { classes } = this.props;

		return (
			<div className={classes.sidebar}>
				<div>
					HEADER
				</div>
				<List component="nav">
					<ListItem button>
						<ListItemIcon>
							<ChatIcon />
						</ListItemIcon>
						<ListItemText primary="Chatroom" />
					</ListItem>
					<Divider />
					<ListItem button>
						<ListItemIcon>
							<ForumIcon />
						</ListItemIcon>
						<ListItemText primary="Forum" />
					</ListItem>
					<Divider />
					<ListItem button>
						<ListItemIcon>
							<SubjectIcon />
						</ListItemIcon>
						<ListItemText primary="Blog" />
					</ListItem>
				</List>
			</div>
		)
	}
}
Sidebar.propTypes = {
	logoutUser: PropTypes.func.isRequired,
	auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
	auth: state.auth
})

export default withRouter(connect(mapStateToProps,{ logoutUser })(withStyles(styles)(Sidebar)))