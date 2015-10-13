"use strict";

var userStoryInsertHooks = {
    before: {
        insert: function (doc) {
            /* Extend our document (user story) with a reference to the corresponding product. */
            let currentDoc = this.currentDoc;
            if (currentDoc) doc.productId = currentDoc._id;
            else doc.productId = Products.findOne({slug: Router.current().params.slug})._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        throwAlert('success', 'Yeah!', 'The story creation was successful.');
        Meteor.call('createActElUserStory', result, Meteor.userId(), function (error) {
            if (error) throwAlert('error', error.reason, error.details);
        });
        Session.set("staleUserStoryOrSprint", true);
    }
};

AutoForm.addHooks('insert-user-story-form', userStoryInsertHooks);