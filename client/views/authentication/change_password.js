"use strict";

Template.changePassword.helpers({
    changePasswordSchema: () => Schema.changePassword
});

Template.changePassword.events({
    'click #back-to-team-overview': function (e) {
        e.preventDefault();
        Session.set('changePassword', null);
    }
});