"use strict";

Template.login.events({
    'submit #login-form': function (e) {
        e.preventDefault();
        clearAlerts();
        resetAlertsForFields();

        var loginForm = $(e.currentTarget),
            username = loginForm.find('.username').val(),
            password = loginForm.find('.password').val(),
            noEmptyFields = isNotEmpty('#login-username', username) & isNotEmpty('#login-password', password);

        if (!noEmptyFields) {
            throwAlert('warning', 'Error', 'Please fill in all required fields.');
        }

        if (noEmptyFields && isValidPassword(password)) {
            Meteor.loginWithPassword(username, password, function (err) {
                if (err) {
                    throwAlert('error', 'Oh snap!', 'Sorry but these credentials are not valid.');
                    highlightErrorForField('#login-username');
                    highlightErrorForField('#login-password');
                } else {
                    Session.set('loginSuccess', true);
                    Router.go('dashboard');
                }
            });
        }
        return false;
    }
});