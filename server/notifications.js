"use strict";

Meteor.methods({
    createNotificationsForComment: function (commentId) {
        let comment = getDocument(Comments, commentId);
        let participantsIds = [];
        Comments.find({actElId: comment.actElId}).forEach(function (comment) {
            participantsIds.push(comment.userId);
        });
        let actEl = getDocument(ActivityStreamElements, comment.actElId);
        if (comment.userId != actEl.userId) participantsIds.push(actEl.userId);
        if (participantsIds.length > 0) {
            let notificationId = Notifications.insert({
                userId: comment.userId,
                type: 3,
                commentId: comment._id,
                productId: actEl.productId
            });
            Users.update({_id: {$in: _.without(participantsIds, comment.userId)}}, {$push: {notifications: notificationId}}, {multi: true});
        }
    },
    createNotificationForPrivateMessage: function (privateMessageId) {
        let privateMessage = getDocument(PrivateMessages, privateMessageId);
        let conversation = getDocument(Conversations, privateMessage.conversationId);
        let recipientsIds = conversation.recipients;
        if (privateMessage.userId != conversation.userId) recipientsIds.push(conversation.userId);
        if (recipientsIds.length > 0) {
            let notificationId = Notifications.insert({
                userId: privateMessage.userId,
                type: 1,
                conversationId: conversation._id
            });
            Users.update({_id: {$in: _.without(recipientsIds, privateMessage.userId)}}, {$push: {notifications: notificationId}}, {multi: true});
        }
    }
});