const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateChatroomInput(data) {
    let errors = {};
    data.title = !isEmpty(data.title) ? data.title : '';
    data.description = !isEmpty(data.description) ? data.description : '';

    if(Validator.isEmpty(data.title)) {
        errors.title = 'Title is required';
    }

    if(Validator.isEmpty(data.description)) {
        errors.description = 'Description is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}