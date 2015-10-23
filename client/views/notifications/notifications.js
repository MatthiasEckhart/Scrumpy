"use strict";

Template.notifications.helpers({
    notifications: function () {
        if (Meteor.user().notifications === undefined) {
            return null;
        }
        return Notifications.find({_id: {$in: Meteor.user().notifications}}, {sort: {submitted: -1}});
    }
});

Template.notifications.events({
    'click .mark-all-notifications-as-read a': function () {
        Meteor.call('markAllNotificationsAsRead', Meteor.userId(), function (err) {
            if (err) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    }
});