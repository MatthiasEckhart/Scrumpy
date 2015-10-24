"use strict";

Template.notifications.helpers({
    notifications: () => Notifications.find({_id: {$in: Meteor.user().notifications}}, {sort: {submitted: -1}}),
    notificationCount: () => Meteor.user().notifications.length
});

Template.notifications.events({
    'click #mark-all-notifications-as-read a': function () {
        Meteor.call('markAllNotificationsAsRead', Meteor.userId(), function (err) {
            if (err) throwAlert('error', error.reason, error.details);
        });
    }
});