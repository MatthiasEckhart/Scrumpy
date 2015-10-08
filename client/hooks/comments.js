"use strict";

var commentsHooks = {
    before: {
        insert: function (doc) {
            doc.actElId = this.currentDoc._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        Meteor.call('createNotificationsForComment', result, function (error) {
            if (error) {
                throwAlert('error', error.reason, error.details);
            }
        });
    }
};

AutoForm.addHooks('insert-comment-form', commentsHooks);