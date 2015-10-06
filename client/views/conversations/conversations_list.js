"use strict";

Template.conversationsList.helpers({
    noConversations: function () {
        return Conversations.find().count() == 0;
    },
    conversations: function () {
        return Conversations.find({}, {sort: {updatedAt: -1, createdAt: -1}});
    }
});

Template.conversationsList.onRendered(function () {
    Session.set('activeNavTab', 'conversationsList');
});

Template.conversationsList.onDestroyed(function () {
    Session.set('activeNavTab', null);
});