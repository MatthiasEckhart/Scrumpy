PrivateMessages = new Mongo.Collection('privateMessages');

PrivateMessages.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});

PrivateMessages.attachSchema(new SimpleSchema({
    text: {
        type: String,
        label: "Message"
    }, conversationId: {
        type: String,
        autoform: {
            omit: true
        },
        denyUpdate: true
    },
    userId: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                if (!this.isFromTrustedCode) {
                    return this.userId;
                }
            } else
            /* Prevent user from supplying their own user ID. */
                this.unset();
        },
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) return new Date;
            else if (this.isUpsert) return {$setOnInsert: new Date};
            else
            /* Prevent user from supplying their own date. */
                this.unset();
        },
        autoform: {
            omit: true
        }
    }
}));

createPrivateMessageNotification = function (slug, userId) {
    if (Meteor.isServer) {
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
    }
};