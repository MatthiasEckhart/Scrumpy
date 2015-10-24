"use strict";

var privateMessagesHooks = {
    before: {
        insert: function (doc) {
            doc.conversationId = Conversations.findOne({slug: Router.current().params.slug})._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        if (formType == "insert") {
            Meteor.call('createNotificationForPrivateMessage', result, function (error) {
                if (error) throwAlert('error', error.reason, error.details);
            });
        }
    }
};

AutoForm.addHooks('insert-private-message-form', privateMessagesHooks);