import axios from 'axios';
import { GET_ERRORS } from './types';

export const createChatroom = (chatroom, callback) => dispatch => {
    axios.post('/api/chatroom/create', chatroom)
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			});
	});
}

export const getJoinedChatrooms = (data, callback) => dispatch => {
    axios.get('/api/chatroom/get_joined_chatrooms', {params: data})
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err
			});
	});
}

export const getChatroomMembers = (data, callback) => dispatch => {
    axios.get('/api/chatroom/get_chatroom_members', {params: data})
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err
			});
	});
}

export const leaveChatroom = (chatroom, callback) => dispatch => {
	axios.post('/api/chatroom/leave_chatroom', chatroom)
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err
			});
	});
}

export const createShareCode = (chatroomId, callback) => dispatch => {
	axios.post('/api/chatroom/create_share_code', {chatroomId})
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err
			});
	});
}

export const joinUsingCode = (data, callback) => dispatch => {
	axios.post('/api/chatroom/join_using_code', data)
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err.response.data
			});
	});
}

export const updateChatroomData = (data, callback) => dispatch =>{
	axios.post('/api/chatroom/update_chatroom_data', data)
		.then(res => callback(res))
		.catch(err => {
			dispatch({
				type: GET_ERRORS,
				payload: err
			});
	});
}