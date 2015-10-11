"use strict";

Template.userStory.events({
    'click .delete-user-story': function (e) {
        e.preventDefault();
        throwDialog('warning', 'Wait!', 'Are you sure you want delete the user story ' + this.title + '?', 'Sure, delete it', 'No, do not delete', 'delete-user-story-confirm', this);
    },
    'click .show-info-user-story': (e) => e.preventDefault()
});

Template.userStory.helpers({
    dragClass: function () {
        var data = Template.instance().data;
        if (data && data.isDrag)
            return 'drag story-formatted';
    },
    userIsProductOwnerOrAdvancedModeOff: function () {
        var product = Products.findOne({_id: this.productId});
        return Roles.userIsInRole(Meteor.user(), [this.productId], 'productOwner') || !product.advancedMode;
    },
    advancedMode:  () => Template.parentData(2).advancedMode,
    storyPointsFormatted: function () {
        if (!_.has(this, "storyPoints") || !this.storyPoints) {
            return "--";
        }
        return this.storyPoints;
    },
    businessValueFormatted: function () {
        if (!_.has(this, "businessValue") || !this.businessValue) {
            return "--";
        }
        return this.businessValue;
    },
    submittedFormatted: function () {
        return moment(this.submitted).format('MMMM Do YYYY, h:mm:ss a');
    },
    author: function () {
        return getUsername(this.userId);
    },
    lastEdited: function () {
        return getUsername(this.lastEditedBy);
    }
});

Template.userStory.onRendered(function () {
    var showInfoUserStoryPopoverSelector = $('#show-info-user-story-' + this.data._id),
        storyTitleEditableSelector = $('#editable-user-story-title-' + this.data._id),
        storyDescriptionEditableSelector = $('#editable-user-story-description-' + this.data._id),
        storyPointsEditableSelector = $('#editable-story-points-' + this.data._id),
        storyBusinessValueEditableSelector = $('#editable-business-value-' + this.data._id),
        advancedMode = Products.findOne({_id: this.data.productId}).advancedMode,
        product = Products.findOne({_id: this.data.productId}),
        storyId;
    if (Roles.userIsInRole(Meteor.user(), [this.data.productId], 'productOwner') || !product.advancedMode) {
        storyId = this.data._id;
        storyTitleEditableSelector.editable({
            display: false,
            placement: 'right',
            title: "Update user story title",
            validate: (value) => {
                if ($.trim(value) === '') {
                    return 'Please fill in a title.';
                }
            },
            success: (response, newValue) => {
                if (newValue) {
                    var oldUserStoryTitle = UserStories.findOne({_id: storyId}).title;
                    UserStories.update({_id: storyId}, {$set: {title: newValue}});
                    throwAlert('success', 'Yes!', 'Story title edited.');
                    if (advancedMode) {
                        Meteor.call('createActElUserStoryEditTitle', product._id, Meteor.user()._id, oldUserStoryTitle, newValue, (error) => {
                            if (error) {
                                throwAlert('error', error.reason, error.details);
                                return null;
                            }
                        });
                    }
                }
            }
        });
        storyDescriptionEditableSelector.editable({
            display: false,
            placement: 'right',
            title: "Update user story description",
            validate: (value) => {
                if ($.trim(value) === '') {
                    return 'Please fill in a description.';
                }
            },
            success: (response, newValue) => {
                if (newValue) {
                    var oldUserStoryDescription = UserStories.findOne({_id: storyId}).title;
                    UserStories.update({_id: storyId}, {$set: {description: newValue}});
                    throwAlert('success', 'Yes!', 'Story description edited.');
                    if (advancedMode) {
                        Meteor.call('createActElUserStoryEditDescription', product._id, Meteor.user()._id, oldUserStoryDescription, newValue, (error) => {
                            if (error) {
                                throwAlert('error', error.reason, error.details);
                                return null;
                            }
                        });
                    }
                }
            }
        });
        if (product.advancedMode) {
            storyBusinessValueEditableSelector.editable({
                emptytext: "--",
                placement: 'right',
                title: "Update user story business value",
                validate: (value) => {
                    if (!$.isNumeric($.trim(value))) {
                        return 'Please fill in a business value.';
                    } else if (value > 1000) {
                        return 'Business value must be less than or equal to 1000.';
                    }
                },
                success: (response, newValue) => {
                    if (newValue) {
                        UserStories.update({_id: storyId}, {$set: {businessValue: parseInt(newValue, 10)}});
                        throwAlert('success', 'Yes!', 'Story business value changed.');
                    }
                }
            });

            var cohnFibonacciSequence = [{value: 0.5, text: "½"}, {value: 1, text: 1}, {value: 2, text: 2}, {
                value: 3,
                text: 3
            }, {value: 5, text: 5}, {value: 8, text: 8}, {value: 13, text: 13}, {value: 20, text: 20}, {
                value: 40,
                text: 40
            }, {value: 80, text: 80}];

            storyPointsEditableSelector.editable("destroy").editable({
                emptytext: "--",
                placement: 'right',
                title: "Planning poker estimation",
                source: cohnFibonacciSequence,
                success: (response, result) => {
                    if (result) {
                        UserStories.update({_id: userStoryId}, {$set: {storyPoints: parseInt(result, 10)}});
                        throwAlert("success", "Success!", "Story points changed.");
                    }
                }
            });
        }
    }
    var data = Template.instance().data;
    if (data && data.isDrag) REDIPS.drag.init();
    var userStoryId = this.data._id;
    showInfoUserStoryPopoverSelector.popover({
        html: true,
        title: 'Details',
        placement: 'right',
        content: () => $("#popover-content-" + userStoryId).html()
    });

    var cursor = UserStories.find({_id: userStoryId});
    cursor.observe({
        changed: (story) => {
            storyTitleEditableSelector.editable("setValue", story.title);
            storyDescriptionEditableSelector.editable("setValue", story.description);
            storyPointsEditableSelector.editable("setValue", story.storyPoints);
            storyBusinessValueEditableSelector.editable("setValue", story.businessValue);
        }
    });
});

function getUsername(userId) {
    let user = Users.findOne({_id: userId});
    if (user) return user.username;
    else return "Anonymous";
}