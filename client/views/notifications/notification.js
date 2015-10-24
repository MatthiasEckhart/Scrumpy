"use strict";

Template.notification.helpers({
    productTitle: function () {
        let product = Products.findOne({_id: this.productId});
        return product && product.title;
    },
    author: function () {
        var user = Users.findOne({_id: this.userId});
        return user && user.username;
    },
    user: function () {
        var user = Users.findOne({_id: this.userId});
        if (user) return user;
    },
    conversation: function () {
        return Conversations.findOne({_id: this.conversationId});
    },
    product: function () {
        return Products.findOne({_id: this.productId});
    }
});

Template.notification.events({
    'click .mark-notification-as-read': function () {
        Meteor.call('markSingleNotificationAsRead', Meteor.userId(), Template.currentData()._id, function (err) {
            if (err) throwAlert('error', error.reason, error.details);
        });
    }
});