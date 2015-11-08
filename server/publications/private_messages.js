"use strict";

Meteor.publish('privateMessages', function (slug) {
    var conversation = Conversations.findOne({slug: slug});
    if (conversation) return PrivateMessages.find({conversationId: conversation._id});
    else this.ready();
});

Meteor.publish('recentPrivateMessages', function (userId) {
    let conversationIds = Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]}, {limit: 5}).map(function(conversation) {
        return conversation._id;
    });
    if (conversationIds.length > 0) return PrivateMessages.find({conversationId: {$in: conversationIds}});
    else this.ready();
});