PrivateMessages = new Meteor.Collection('privateMessages');

PrivateMessages.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});

PrivateMessages.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.lastModified = new Date();
});

Meteor.methods({
    createPrivateMessage: function (privateMessageAttributes) {
        if (Meteor.isServer) {
            var user = Meteor.user(),
                counterDoc,
                firstInsert,
                cId,
                counterVar,
                participantsIds,
                pm,
                pmId;

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to send private messages", "Please log in");
            }
            // ensure the private message has a subject
            if (!privateMessageAttributes.subject) {
                throw new Meteor.Error(422, "Please fill in a subject", "Subject is empty");
            }

            // check if collection is empty
            counterDoc = Counter.findOne();
            firstInsert = false;
            if (!counterDoc) {
                cId = Counter.insert({'privateMessageCounterForUniqueURLs': 0});
                firstInsert = true;
                counterDoc = Counter.findOne({_id: cId});
            }
            if (!firstInsert && counterDoc) {
                Counter.update({_id: counterDoc._id}, {$inc: {'privateMessageCounterForUniqueURLs': 1}});
            }
            counterVar = Counter.findOne().privateMessageCounterForUniqueURLs;


            participantsIds = [];
            Users.find({username: {$in: privateMessageAttributes.participants}}).forEach(function (user) {
                participantsIds.push(user._id);
            });

            // pick out the whitelisted keys
            pm = _.extend(_.pick(privateMessageAttributes, 'subject', 'messages', 'productId'), {
                userId: user._id,
                author: user.username,
                submitted: new Date(),
                lastModified: new Date(),
                participants: participantsIds,
                slug: counterVar + '-' + slugify(privateMessageAttributes.subject)
            });
            pmId = PrivateMessages.insert(pm);
            Users.update({_id: {$in: participantsIds}}, {$push: {privateMessages: pmId}}, {multi: true});
            createPrivateMessageNotification(pm.slug, pm.userId);
            return pm.slug;
        }
    },
    updatePrivateMessage: function (pmId, subject, participants) {
        if (Meteor.isServer) {
            var user = Meteor.user(),
                participantsIds,
                pm,
                slug,
                participantsToAdd,
                participantsToRemove,
                participantsToRemoveUsername,
                devTeamInv,
                scrumMasterInv;

            // ensure the user is logged in
            if (!user) {
                throw new Meteor.Error(401, "You need to login to send private messages", "Please log in");
            }
            // ensure the private message has a subject
            if (!subject) {
                throw new Meteor.Error(422, "Please fill in a subject", "Subject is empty");
            }
            participantsIds = [];
            Users.find({username: {$in: participants}}).forEach(function (user) {
                participantsIds.push(user._id);
            });
            pm = PrivateMessages.findOne({_id: pmId});
            slug = pm.slug.substr(0, pm.slug.indexOf('-') + 1) + slugify(subject);
            participantsToAdd = _.difference(participantsIds, pm.participants);
            participantsToRemove = _.difference(pm.participants, participantsIds);
            PrivateMessages.update({_id: pmId}, {$set: {subject: subject, participants: participantsIds, slug: slug}});
            Users.update({_id: {$in: participantsToAdd}}, {$push: {privateMessages: pmId}}, {multi: true});
            Users.update({_id: {$in: participantsToRemove}}, {$pull: {privateMessages: pmId}}, {multi: true});
            participantsToRemoveUsername = [];
            Users.find({_id: {$in: participantsToRemove}}).forEach(function (user) {
                participantsToRemoveUsername.push(user.username);
            });
            devTeamInv = [];
            scrumMasterInv = [];
            _.each(pm.messages, function (m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (inv) {
                            devTeamInv.push(inv);
                        });
                    }
                    if (_.has(m.invitations, "scrumMaster")) {
                        Invitations.find({_id: m.invitations.scrumMaster}).forEach(function (inv) {
                            scrumMasterInv.push(inv);
                        });
                    }
                }
            });
            if (devTeamInv.length > 0) {
                _.each(devTeamInv, function (u) {
                    if (_.contains(participantsToRemoveUsername, u.username)) {
                        Invitations.update({_id: u._id}, {$set: {status: 2}});
                    }
                });
            }
            if (scrumMasterInv.length > 0) {
                _.each(scrumMasterInv, function (u) {
                    if (_.contains(participantsToRemoveUsername, u.username)) {
                        Invitations.update({_id: u._id}, {$set: {status: 2}});
                    }
                });
            }
            return slug;
        }
    },
    submitMessage: function (message, messageId) {
        if (Meteor.isServer) {
            // ensure the message has text
            if (!message.text) {
                throw new Meteor.Error(422, "You cannot send an empty message", "Message is empty");
            }
            PrivateMessages.update({_id: messageId}, {$push: {messages: message}});
            var userId = Users.findOne({username: message.author})._id,
                slug = PrivateMessages.findOne({_id: messageId}).slug;
            createPrivateMessageNotification(slug, userId);
        }
    },
    removePrivateMessage: function (messageId) {
        if (Meteor.isServer) {
            var message = PrivateMessages.findOne({_id: messageId});
            Users.update({_id: {$in: message.participants}}, {$pull: {privateMessages: messageId}}, {multi: true});
            PrivateMessages.remove({_id: messageId});
        }
    },
    leavePrivateMessage: function (messageId, userId) {
        if (Meteor.isServer) {
            Users.update({_id: userId}, {$pull: {privateMessages: messageId}});
            PrivateMessages.update({_id: messageId}, {$pull: {participants: userId}});
        }
    },
    updatePrivateMessageStatus: function (productId, participantsToRemove) {
        if (Meteor.isServer) {
            var pm = PrivateMessages.findOne({productId: productId}),
                devTeamInv = [],
                scrumMasterInv = [];
            _.each(pm.messages, function (m) {
                if (_.has(m, "invitations")) {
                    if (_.has(m.invitations, "developmentTeam")) {
                        Invitations.find({_id: {$in: m.invitations.developmentTeam}}).forEach(function (inv) {
                            devTeamInv.push(inv);
                        });
                    }
                    if (_.has(m.invitations, "scrumMaster")) {
                        Invitations.find({_id: m.invitations.scrumMaster}).forEach(function (inv) {
                            scrumMasterInv.push(inv);
                        });
                    }
                }
            });
            if (devTeamInv.length > 0) {
                _.each(devTeamInv, function (u) {
                    if (_.contains(participantsToRemove, u.username)) {
                        Invitations.update({_id: u._id}, {$set: {status: 2}});
                    }
                });
            }
            if (scrumMasterInv.length > 0) {
                _.each(scrumMasterInv, function (u) {
                    if (_.contains(participantsToRemove, u.username)) {
                        Invitations.update({_id: u._id}, {$set: {status: 2}});
                    }
                });
            }
        }
    }
});

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