const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateUpdateInput(data) {
    let errors = {};

    data.firstname = !isEmpty(data.firstname) ? data.firstname : '';
    data.lastname = !isEmpty(data.lastname) ? data.lastname : '';
    data.username = !isEmpty(data.username) ? data.username : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    // data.password = !isEmpty(data.password) ? data.password : '';
    // data.password_confirm = !isEmpty(data.password_confirm) ? data.password_confirm : '';

    if(!Validator.isLength(data.firstname, { min: 2, max: 30 })) {
        errors.firstname = 'First name must be between 2 to 30 chars';
    }

    if(Validator.isEmpty(data.firstname)) {
        errors.firstname = 'First name field is required';
    }

    if(!Validator.isLength(data.lastname, { min: 2, max: 30 })) {
        errors.lastname = 'Last name must be between 2 to 30 chars';
    }

    if(Validator.isEmpty(data.lastname)) {
        errors.lastname = 'Last name field is required';
    }

    if(!Validator.isLength(data.username, { min: 2, max: 30 })) {
        errors.username = 'Last name must be between 2 to 30 chars';
    }

    if(Validator.isEmpty(data.username)) {
        errors.username = 'Last name field is required';
    }

    if(!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    if(Validator.isEmpty(data.email)) {
        errors.email = 'Email is required';
    }

    // if(!Validator.isLength(data.password, {min: 6, max: 30})) {
    //     errors.password = 'Password must have 6 chars';
    // }

    // if(Validator.isEmpty(data.password)) {
    //     errors.password = 'Password is required';
    // }

    // if(!Validator.isLength(data.password_confirm, {min: 6, max: 30})) {
    //     errors.password_confirm = 'Password must have 6 chars';
    // }

    // if(!Validator.equals(data.password, data.password_confirm)) {
    //     errors.password_confirm = 'Password and Confirm Password must match';
    // }

    // if(Validator.isEmpty(data.password_confirm)) {
    //     errors.password_confirm = 'Password is required';
    // }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}