"use strict";

Template.productPageLayout.events({
    'click .sign-out':  () =>  signOut(),
    'click .accept-invitation': function () {
        acceptInvitation(this);
    },
    'click .decline-invitation': function () {
        declineInvitation(this);
    }
});