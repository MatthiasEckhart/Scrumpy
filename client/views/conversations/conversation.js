"use strict";

Template.conversation.helpers({
    privateMessages: function() {
        return PrivateMessages.find({conversationId: this._id});
    }
});