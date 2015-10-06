"use strict";

Meteor.methods({
    getConversationSlug: function (conversationId) {
        let conversation = Conversations.findOne({_id: conversationId});
        if (conversation) return conversation.slug;
        else throw new Meteor.Error(500, "Conversation not found.", "Please contact support team.");
    },
    removePrivateMessage: function (conversationId) {
        PrivateMessages.remove({conversationId: conversationId});
        Conversations.remove({_id: conversationId});
    },
    leavePrivateMessage: function (conversationId, userId) {
        let conversation = Conversations.findOne({_id: conversationId});
        if (!conversation) throw new Meteor.Error(500, "Conversation not found.", "Please contact support team.");
        if (conversation.userId == userId) throw new Meteor.Error(500, "User cannot leave conversation.", "Please contact support team.");
        Conversations.update({_id: conversationId}, {$pull: {recipients: userId}});
    }
});