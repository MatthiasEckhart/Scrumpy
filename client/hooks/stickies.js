"use strict";

var stickyInsertHooks = {
    before: {
        insert: function (doc) {
            /* Extend our document (sticky) with a reference to the corresponding user story. */
            let storyId = Session.get('storyId');
            let story = UserStories.findOne({_id: storyId});
            if (story) doc.storyId = story._id;
            return doc;
        }
    },
    onSuccess: function (formType, result) {
        let sticky = Stickies.findOne({_id: result});
        if (sticky) {
            let story = UserStories.findOne({_id: sticky.storyId});
            if (story) {
                let product = Products.findOne({_id: story.productId});
                if (product.advancedMode) {
                    let sprint = Sprints.findOne({_id: story.sprintId});
                    Meteor.call('updateBurndown', sprint._id, function (error) {
                        if (error) throwAlert('error', error.reason, error.details);
                        Meteor.call('createActElStickyCreate', product._id, Meteor.user()._id, sticky.title, story.title, sprint.goal, function (error) {
                            if (error) throwAlert('error', error.reason, error.details);
                        });
                    });
                }
                throwAlert("success", "Success", "Sticky added.");
            }
        }
    }
};

var stickyUpdateHooks = {
    onSuccess: function (formType, result) {
        let currentDoc = this.currentDoc, updateDoc = this.updateDoc['$set'];
        /* If user has updated the sticky title, description or effort, we want to create the corresponding activity stream element. */
        if (currentDoc.title != updateDoc.title ||
            currentDoc.description != updateDoc.description ||
            currentDoc.effort != updateDoc.effort) {
            let sticky = Stickies.findOne({_id: currentDoc._id});
            if (sticky) {
                let story = UserStories.findOne({_id: sticky.storyId});
                if (story) {
                    let product = Products.findOne({_id: story.productId});
                    if (product.advancedMode) {
                        /* Check if sticky title has been changed. */
                        if (currentDoc.title != updateDoc.title) {
                            Meteor.call('createActElStickyEditTitle', product._id, Meteor.userId(), currentDoc.title, updateDoc.title, function (error) {
                                if (error) throwAlert('error', error.reason, error.details);
                            });
                        }
                        /* Check if sticky description has been changed. */
                        if(currentDoc.description != updateDoc.description) {
                            Meteor.call('createActElStickyEditDescription', product._id, Meteor.userId(), currentDoc.description, updateDoc.description, function (error) {
                                if (error) throwAlert('error', error.reason, error.details);
                            });
                        }
                        /* Check if sticky effort has been changed. */
                        if(currentDoc.effort != updateDoc.effort) {
                            Meteor.call('createActElStickyEffortChanged', product._id, Meteor.userId(), currentDoc.effort, updateDoc.effort, currentDoc.title, function (error) {
                                if (error) throwAlert('error', error.reason, error.details);
                            });
                        }
                    }
                }
            }
        }
    }
};

AutoForm.addHooks('insert-sticky-form', stickyInsertHooks);
AutoForm.addHooks('update-sticky-form', stickyUpdateHooks);