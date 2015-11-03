"use strict";

function closeAlert(id, template) {
    Meteor.clearTimeout(template.sAlertCloseTimeout);
    sAlert.close(id);
}

Template.sAlertCustom.events({
    'click .close': function (e, t) {
        e.preventDefault();
        closeAlert(this._id, t);
    },
    'click .delete-product-confirm': function (e, t) {
        var Id = this._id;
        Meteor.call('deleteProduct', this.data, (error) => {
            if (error) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
            closeAlert(this._id, t);
            Router.go('dashboard');
        });
    },
    'click .delete-sticky-confirm': function (e, t) {
        let story = UserStories.findOne({_id: this.data.storyId});
        if (story) {
            let product = Products.findOne({_id: story.productId}), stickyTitle = this.data.title;
            Stickies.remove({_id: this.data._id});
            if (product.advancedMode) {
                Meteor.call('updateBurndown', product._id, function (err) {
                    if (err) {
                        throwAlert("error", "Error!", err);
                    }
                });
                Meteor.call('createActElStickyRemoved', product._id, Meteor.userId(), stickyTitle, function (err) {
                    if (err) {
                        throwAlert("error", "Error!", err);
                    }
                });
            }
            closeAlert(this._id, t);
            throwAlert('success', 'Yeah!', 'Sticky removed.');
        }
    },
    'click .delete-user-story-confirm': function (e, t) {
        var product = Products.findOne({_id: this.data.productId}), storyTitle = this.data.title;
        Stickies.find({storyId: this.data._id}).forEach(function (sticky) {
            Stickies.remove({_id: sticky._id});
        });
        UserStories.find({
            productId: this.data.productId,
            priority: {$gt: this.data.priority}
        }).forEach(function (story) {
            UserStories.update({_id: story._id}, {$set: {priority: (story.priority - 1)}});
        });
        UserStories.remove({_id: this.data._id});
        if (product.advancedMode) {
            Meteor.call('updateBurndown', this.data.sprintId, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
            Meteor.call('createActElUserStoryRemoved', product._id, Meteor.userId(), storyTitle, function (err) {
                if (err) {
                    throwAlert("error", "Error!", err);
                }
            });
        }
        closeAlert(this._id, t);
        throwAlert('success', 'Yeah!', 'User story removed.');
    },
    'click .delete-sprint-confirm': function (e, t) {
        var product = Products.findOne({_id: this.data.productId}), sprintGoal = this.data.goal;
        UserStories.find({sprintId: this.data._id}).forEach(function (userStory) {
            Stickies.find({storyId: userStory._id}).forEach(function (sticky) {
                Stickies.remove({_id: sticky._id});
            });
            UserStories.remove({_id: userStory._id});
        });
        Sprints.remove({_id: this.data._id});
        Meteor.call('updateBurndown', product._id, function (err) {
            if (err) {
                throwAlert("error", "Error!", err);
            }
        });
        Meteor.call('createActElSprintRemoved', product._id, Meteor.userId(), sprintGoal, function (err) {
            if (err) {
                throwAlert("error", "Error!", err);
            }
        });
        closeAlert(this._id, t);
        throwAlert('success', 'Yeah!', 'Sprint removed.');
    },
    'click .delete-comment-confirm': function (e, t) {
        Comments.remove(this.data._id);
        closeAlert(this._id, t);
        throwAlert('success', 'Yeah!', 'Comment removed.');
    }
});