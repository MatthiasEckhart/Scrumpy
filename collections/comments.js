Comments = new Meteor.Collection('comments');

Meteor.methods({
    createComment: function (commentAttributes) {
        if (Meteor.isServer) {
            var user = Meteor.user(),
                actEl,
                comment,
                commentId,
                participantsIds,
                notificationId;
            if (!user) {
                throw new Meteor.Error(401, "You need to login to make comments");
            }
            if (!commentAttributes.body) {
                throw new Meteor.Error(422, 'Please write some content');
            }
            actEl = ActivityStreamElements.findOne({_id: commentAttributes.actElId});
            comment = _.extend(_.pick(commentAttributes, 'actElId', 'body'), {
                userId: user._id,
                submitted: new Date(),
                productId: actEl.productId
            });
            commentId = Comments.insert(comment);
            participantsIds = [];
            Comments.find({actElId: commentAttributes.actElId}).forEach(function (comment) {
                participantsIds.push(comment.userId);
            });
            if (actEl) {
                participantsIds.push(actEl.userId);
            }
            if (participantsIds.length > 0) {
                notificationId = Notifications.insert({
                    userId: user._id,
                    type: 2,
                    commentId: commentId,
                    submitted: new Date(),
                    productId: actEl.productId
                });
                Users.update({_id: {$in: _.without(participantsIds, user._id)}}, {$push: {notifications: notificationId}}, {multi: true});
            }
            return commentId;
        }
    }
});

Comments.allow({
    update: ownsDocumentOrAdmin,
    remove: ownsDocumentOrAdmin
});

Comments.before.insert(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Comments.before.update(function (userId, doc, fieldNames, modifier, options) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});

Comments.before.remove(function (userId, doc) {
    if (Meteor.isServer) {
        updateLastModifiedForProduct(doc.productId);
    }
});