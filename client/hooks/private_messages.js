"use strict";

var privateMessagesHooks = {
    before: {
        insert: function (doc) {
            doc.conversationId = Conversations.findOne({slug: Router.current().params.slug})._id;
            return doc;
        }
    }
};

AutoForm.addHooks('insert-private-message-form', privateMessagesHooks);