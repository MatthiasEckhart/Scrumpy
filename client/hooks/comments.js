"use strict";

var commentsInsertHooks = {
    before: {
        insert: function (doc) {
            /* Extend our document (comment) with a reference to the corresponding activity stream element. */
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

var commentsUpdateHooks = {
    onSuccess: function (formType, result) {
        /* After comment has been successfully updated, we set our reactive var to false in order to hide the form. */
        this.template.parent().isEditing.set(false);
    }
};

AutoForm.addHooks('insert-comment-form', commentsInsertHooks);
AutoForm.addHooks('update-comment-form', commentsUpdateHooks);