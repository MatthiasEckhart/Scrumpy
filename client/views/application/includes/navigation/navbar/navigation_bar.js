"use strict";

Template.navigationBar.events({
    'click #upload-image': function (e) {
        e.preventDefault();
        $('#editYourAvatarModal').modal();
    },
    'click #change-password': function (e) {
        e.preventDefault();
        e.stopPropagation();
        Session.set('changePassword', true);
    }
});

Template.navigationBar.helpers({
    displayChangePasswordForm: () => Session.equals('changePassword', true),
    notificationCount: () => Meteor.user().notifications.length
});

Template.navigationBar.onDestroyed(function () {
    Session.set('changePassword', null);
});