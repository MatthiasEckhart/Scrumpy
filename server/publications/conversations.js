"use strict";

Meteor.publish('conversations', function (userId) {
    return Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]});
});

Meteor.publish('recentConversations', function (userId) {
    return Conversations.find({$or: [{'userId': userId}, {'recipients': userId}]}, {limit: 5});
});

Meteor.publish('conversation', function (slug) {
    return Conversations.find({slug: slug});
});

Meteor.publish('conversationParticipants', function (slug) {
    var conversations = Conversations.find({slug: slug}, {fields: {'recipients': 1}});
    if (conversations.count() == 1) return conversations;
    else this.ready();
});
