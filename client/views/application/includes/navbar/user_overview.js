"use strict";

Template.userOverview.events({
    'click #upload-image': function (e) {
        e.preventDefault();
        $('#editYourAvatarModal').modal();
    },
    'click #change-password': function (e) {
        e.preventDefault();
        Session.set('changePassword', true);
    }
});