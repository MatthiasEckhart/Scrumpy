"use strict";

Meteor.publish('privateMessages', function (slug) {
    var conversation = Conversations.findOne({slug: slug});
    if (conversation) return PrivateMessages.find({conversationId: conversation._id});
    else this.ready();
});