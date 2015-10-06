"use strict";

var conversationsHooks = {
    onSuccess: function (formType, result) {
        /* If we processed an update operation, we need to set the conversation ID in order to retrieve the conversation slug.
         * The Meteor server method call to retrieve the slug is even for an update operation necessary, since the subject (slug) may be different to this.currentDoc.slug. */
        if (formType == "update") result = this.currentDoc._id;
        Meteor.call('getConversationSlug', result, function (error, response) {
            if (error) {
                throwAlert("error", error.reason, error.details);
                return;
            }
            Router.go('conversation', {slug: response});
        });
    }
};

AutoForm.addHooks('insert-conversation-form', conversationsHooks);
AutoForm.addHooks('update-conversation-form', conversationsHooks);