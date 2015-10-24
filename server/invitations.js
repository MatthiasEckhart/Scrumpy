"use strict";

Meteor.methods({
    userInvitation: function (doc) {
        /* Important server-side check for security and data integrity. */
        check(doc, Schema.invitationUser);
        let product = getDocument(Products, doc.productId);
        let invitation = {status: 0, productId: product._id};
        /* Loop through all Scrum Masters and insert the corresponding invitation. */
        _.each(doc.scrumMaster, (userId) => {
            invitation.role = 2; // 0 = admin, 1 = po, 2 = sm, 3 = devTeam
            invitation.userId = userId;
            let invitationId = Invitations.insert(invitation);
            insertNotification(product.userId, userId, invitationId, product._id);
        });
        /* Loop through all Scrum Masters and insert the corresponding invitation. */
        _.each(doc.developmentTeam, (userId) => {
            invitation.role = 3; // 0 = admin, 1 = po, 2 = sm, 3 = devTeam
            invitation.userId = userId;
            let invitationId = Invitations.insert(invitation);
            insertNotification(product.userId, userId, invitationId, product._id);
        });
        /* Return result object, depending on certain preconditions. */
        return product.advancedMode ? {advancedMode: true, slug: product.slug} : {
            advancedMode: false,
            slug: product.slug
        };
    }
});

function insertNotification(productUserId, notificationUserId, invitationId, productId) {
    let notification = {'userId': productUserId, 'type': 2, 'invitationId': invitationId, 'productId': productId};
    let notificationId = Notifications.insert(notification);
    Users.update({_id: notificationUserId}, {$push: {'notifications': notificationId}}, {multi: true});
}