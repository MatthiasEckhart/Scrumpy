"use strict";

Template.newSticky.events({
    'click .add-sticky': function () {
        Session.set('storyId', Template.currentData()._id);
    }
});

Template.newSticky.onDestroyed(function () {
    Session.set('storyId', null);
});