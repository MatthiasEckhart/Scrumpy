"use strict";

Template.notification.helpers({
    notificationType: function (type) {
        return type == this.type;
    },
    pm: function () {
        return PrivateMessages.findOne({_id: this.pmId});
    },
    product: function () {
        return Products.findOne({_id: this.productId});
    },
    author: function () {
        var user = Users.findOne({_id: this.userId});
        if (user) {
            return user.username;
        }
    },
    user: function () {
        var user = Users.findOne({_id: this.userId});
        if (user) {
            return user;
        }
    },
    notification: function () {
        var notification = Notifications.findOne({_id: Template.parentData(1)._id});
        if (notification) {
            return notification;
        }
    }

});

Template.notification.events({
    'click .mark-notification-as-read': function () {
        Meteor.call('markSingleNotificationAsRead', Meteor.userId(), Template.currentData()._id, function (err) {
            if (err) {
                throwAlert('error', error.reason, error.details);
                return null;
            }
        });
    }
});