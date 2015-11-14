"use strict";

Template.conversationsList.helpers({
    noConversations: function () {
        return Conversations.find().count() == 0;
    },
    conversations: function () {
        return Conversations.find({}, {sort: {updatedAt: -1}});
    }
});