"use strict";

Template.productPageLayout.events({
    'click .sign-out':  () =>  signOut(),
    'click .accept-invitation': () => acceptInvitation(),
    'click .decline-invitation': () => declineInvitation()
});