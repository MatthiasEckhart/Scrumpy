"use strict";

PrivateMessages.before.insert(function (userId, doc) {
    updateLastModifiedForConversation(doc.conversationId);
});

PrivateMessages.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};
    modifier.$set.updatedAt = new Date();
    updateLastModifiedForConversation(doc.conversationId);
});

PrivateMessages.before.remove(function (userId, doc) {
    updateLastModifiedForConversation(doc.conversationId);
});