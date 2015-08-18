"use strict";

Template.register.events({
    'submit #register-form': function (e) {
        e.preventDefault();
        clearAlerts();
        resetAlertsForFields();
        var registerForm = $(e.currentTarget),
            username = registerForm.find('#register-username').val(),
            password = registerForm.find('#register-password').val(),
            passwordConfirm = registerForm.find('#register-password-confirm').val(),
            noEmptyFields = isNotEmpty('#register-username', username) & isNotEmpty('#register-password', password) & isNotEmpty('#register-password-confirm', passwordConfirm);

        if (!noEmptyFields) {
            throwAlert('warning', 'Error', 'Please fill in all required fields.');
        }

        if (noEmptyFields && areValidPasswords(password, passwordConfirm)) {
            Accounts.createUser({username: username, password: password}, function (err) {
                if (err) {
                    if (err.message === 'Username already exists. [403]') {
                        throwAlert('error', 'Oh snap!', 'We\'re sorry but this username is already in use.');
                        highlightErrorForField('#register-username');
                    } else {
                        throwAlert('error', 'Oh snap!', 'We\'re sorry but something went wrong.');
                    }
                } else {
                    Session.set('registerSuccess', true);
                    Router.go('dashboard');
                }
            });
        }
        return false;
    }
});