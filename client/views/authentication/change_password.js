"use strict";

Template.changePassword.events({
    'submit #change-password-form': function (e) {
        e.preventDefault();
        clearAlerts();
        resetAlertsForFields();
        var changePasswordForm = $(e.currentTarget),
            newPassword = changePasswordForm.find('#new-password').val(),
            newPasswordConfirm = changePasswordForm.find('#new-password-confirm').val(),
            currentPassword = changePasswordForm.find('#current-password').val(),
            noEmptyFields = isNotEmpty('#new-password', newPassword) & isNotEmpty('#new-password-confirm', newPasswordConfirm) & isNotEmpty('#current-password', currentPassword);

        if (!noEmptyFields) {
            throwAlert('warning', 'Error', 'Please fill in all required fields.');
        }

        if (noEmptyFields && areValidPasswords(newPassword, newPasswordConfirm)) {
            Accounts.changePassword(currentPassword, newPassword, function (err) {
                if (err) {
                    if (err.message === 'Incorrect password [403]') {
                        throwAlert('error', 'Oh snap!', 'We\'re sorry but your old password is incorrect.');
                        highlightErrorForField('#current-password');
                    } else {
                        throwAlert('error', 'Oh snap!', 'We\'re sorry but something went wrong.');
                    }
                } else {
                    Session.set('changePasswordSuccess', true);
                    Router.go('dashboard');
                }
            });
        }
        return false;
    }
});