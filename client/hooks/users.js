"use strict";

var changePasswordHooks = {
    before: {
        method: function (doc) {
            /* Extend our document with a reference to the corresponding user. */
            doc.userId = Meteor.userId();
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        Session.set('changePassword', null);
        throwAlert('success', 'Success', 'Password changed.');
    }
};

var registerHooks = {
    onSuccess: function (formType, result) {
        Meteor.loginWithPassword(result.username, result.password, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return;
            }
            Session.set('registerSuccess', true);
            Router.go('dashboard');
        });
    }
};

var loginHooks = {
    onSubmit: function (insertDoc) {
        if (insertDoc.username && insertDoc.password) {
            Meteor.loginWithPassword(insertDoc.username, insertDoc.password, (error) => {
                if (error) this.done(error);
                else {
                    this.done();
                    Session.set('loginSuccess', true);
                    Router.go('dashboard');
                }
            });
        } else this.done();
        return false;
    },
    onError: function (type, error) {
        var vc = AutoForm.getValidationContext(this.formId);
        if (typeof error.reason === 'string') {
            if (error.reason.indexOf('User not found') !== -1) vc.addInvalidKeys([{
                name: 'username',
                type: 'userNotFound'
            }]);
            else if (error.reason.indexOf('Incorrect password') !== -1) vc.addInvalidKeys([{
                name: 'password',
                type: 'incorrectPassword'
            }]);
            else if (error.reason.indexOf('User has no password set') !== -1) vc.addInvalidKeys([{
                name: 'password',
                type: 'passwordNotSet'
            }]);
        }
    }
};

AutoForm.addHooks('change-password-form', changePasswordHooks);
AutoForm.addHooks('register-form', registerHooks);
AutoForm.addHooks('login-form', loginHooks);