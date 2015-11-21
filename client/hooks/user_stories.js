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

var userStoryUpdateHooks = {
    onSuccess: function (formType, result) {
        let currentDoc = this.currentDoc, updateDoc = this.updateDoc['$set'];
        /* If user has updated the user story title, description, story points or business value, we want to create the corresponding activity stream element. */
        if (currentDoc.title != updateDoc.title ||
            currentDoc.description != updateDoc.description ||
            currentDoc.storyPoints != updateDoc.storyPoints ||
            currentDoc.businessValue != updateDoc.businessValue) {
            let story = UserStories.findOne({_id: currentDoc._id});
            if (story) {
                let product = Products.findOne({_id: story.productId});
                if (product.advancedMode) {
                    /* Check if user story title has been changed. */
                    if (currentDoc.title != updateDoc.title) {
                        Meteor.call('createActElUserStoryEditTitle', product._id, Meteor.userId(), currentDoc.title, updateDoc.title, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                    /* Check if user story description has been changed. */
                    if (currentDoc.description != updateDoc.description) {
                        Meteor.call('createActElUserStoryEditDescription', product._id, Meteor.userId(), currentDoc.description, updateDoc.description, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                    /* Check if user story story points have been changed. */
                    if (currentDoc.storyPoints != updateDoc.storyPoints) {
                        Meteor.call('createActElUserStoryStoryPointsChanged', product._id, Meteor.userId(), currentDoc.storyPoints, updateDoc.storyPoints, currentDoc.title, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                    /* Check if user story business value has been changed. */
                    if (currentDoc.businessValue != updateDoc.businessValue) {
                        Meteor.call('createActElUserStoryBusinessValueChanged', product._id, Meteor.userId(), currentDoc.businessValue, updateDoc.businessValue, currentDoc.title, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    }
                }
            }
        }
    }
};

AutoForm.addHooks('insert-user-story-form', userStoryInsertHooks);
AutoForm.addHooks('update-user-story-form', userStoryUpdateHooks);