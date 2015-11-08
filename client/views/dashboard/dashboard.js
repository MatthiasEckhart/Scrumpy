"use strict";

Template.dashboard.onRendered(function () {
    Session.set('activeNavTab', 'dashboard');
    if (Session.equals("loginSuccess", true)) {
        throwAlert('success', 'Howdy!', 'Welcome back to Scrumpy!');
        Session.set('loginSuccess', false);
    } else if (Session.equals("registerSuccess", true)) {
        throwAlert('success', 'Congratulations!', 'You\'re now a member of Scrumpy!');
        Session.set('registerSuccess', false);
    } else if (Session.equals("changePasswordSuccess", true)) {
        throwAlert('success', 'Work done!', 'You changed your password successfully.');
        Session.set('changePasswordSuccess', false);
    }
});

Template.dashboard.onDestroyed(function () {
    Session.set('activeNavTab', null);
});