"use strict";

Template.mainLayout.events({
    'click .sign-out': () =>  signOut(),
    'click .accept-invitation': function () {
        acceptInvitation(this);
    },
    'click .decline-invitation': function () {
        declineInvitation(this);
    }
});