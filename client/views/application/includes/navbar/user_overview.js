"use strict";

Template.userOverview.events({
    'click #sign-out': function () {
        let username = Meteor.user().username;
        Meteor.logout(function () {
            Session.set('logoutSuccess', true);
            Session.set('username', username);
        });
        Router.go('dashboard');
    },
    'click #upload-image': function (e) {
        e.preventDefault();
        $('#editYourAvatarModal').modal();
    },
    'click #change-password': function (e) {
        e.preventDefault();
        Session.set('changePassword', true);
    }
});