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
    userIdFormatted: function () {
        return getUsername(this.userId);
    },
    lastEditedByFormatted: function () {
        return getUsername(this.lastEditedBy);
    }
});

Template.userStory.onRendered(function () {
    var showInfoUserStoryPopoverSelector = $('#show-info-user-story-' + this.data._id);
    var data = Template.instance().data;
    if (data && data.isDrag) REDIPS.drag.init();
    var userStoryId = this.data._id;
    showInfoUserStoryPopoverSelector.popover({
        html: true,
        title: 'Details',
        placement: 'right',
        content: () => $("#popover-content-" + userStoryId).html()
    });
});