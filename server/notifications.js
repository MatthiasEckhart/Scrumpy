"use strict";

Meteor.methods({
    createNotificationsForComment: function (commentId) {
        let comment = Comments.findOne({_id: commentId});
        if (!comment) throw new Meteor.Error(500, "Comment not found.", "Please contact support team.");
        let participantsIds = [];
        Comments.find({actElId: comment.actElId}).forEach(function (comment) {
            participantsIds.push(comment.userId);
        });
        let actEl = ActivityStreamElements.findOne({_id: comment.actElId});
        if (!actEl) throw new Meteor.Error(500, "Activity Stream Element not found.", "Please contact support team.");
        if (comment.userId != actEl.userId) participantsIds.push(actEl.userId);
        if (participantsIds.length > 0) {
            let notificationId = Notifications.insert({
                userId: comment.userId,
                type: 2,
                commentId: comment._id,
                createdAt: new Date(),
                productId: actEl.productId
            });
            Users.update({_id: {$in: _.without(participantsIds, comment.userId)}}, {$push: {notifications: notificationId}}, {multi: true});
        }
    }
});