getDocument = function (collection, documentId) {
    let document = collection.findOne({_id: documentId});
    if (!document) throw new Meteor.Error(500, "Document with ID " + documentId + " not found.", "Please contact support team.");
    return document;
};

arrayContainsDateElement = function (arr, el) {
    var i = arr.length;
    while (i--) {
        if (arr[i].date.toISOString() === el) {
            return true;
        }
    }
    return false;
};

updateLastModifiedForProduct = function (productId) {
    Products.update({_id: productId}, {$set: {updatedAt: new Date()}});
};

updateLastModifiedForConversation = function (conversationId) {
    Conversations.update({_id: conversationId}, {$set: {updatedAt: new Date()}});
};

createPrivateMessageNotification = function (slug, userId) {
    var pm = PrivateMessages.findOne({slug: slug}),
        participantsIds,
        newParticipants,
        notificationId;
    if (Notifications.find({pmId: pm._id}).count() > 0) {
        Notifications.update({pmId: pm._id}, {$set: {userId: userId, submitted: new Date}});
    } else {
        participantsIds = PrivateMessages.findOne({_id: pm._id}).participants;
        newParticipants = _.without(participantsIds, userId);
        if (newParticipants.length > 0) {
            notificationId = Notifications.insert({
                userId: userId,
                pmId: pm._id,
                pmSubject: pm.subject,
                type: 1,
                submitted: new Date()
            });
            Users.update({_id: {$in: newParticipants}}, {$push: {notifications: notificationId}}, {multi: true});
        }
    }
};