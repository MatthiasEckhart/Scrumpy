"use strict";

Template.dashboardContent.helpers({
    noProducts: function () {
        return this.products.count() === 0;
    },
    productTitleForLineChartPanel: function () {
        return this.products.fetch()[0].title;
    },
    conversations: function () {
        return Conversations.find({});
    },
    privateMessage: function () {
        return PrivateMessages.find({conversationId: this._id}, {sort: {createdAt: -1}, limit: 1}).fetch()[0];
    },
    noConversations: function () {
        return Conversations.find().count() === 0;
    },
    noPrivateMessages: function () {
        return PrivateMessages.find({conversationId: this._id}).count() === 0;
    },
    invitations: function () {
        return Invitations.find({status: 0}, {sort: {createdAt: -1}});
    },
    noPendingInvitations: function () {
        return Invitations.find({status: 0}).count() === 0;
    },
    sumConversations: () =>  Conversations.find().count(),
    sumProducts: () => Products.find().count(),
    sumConnectedUsers: () => Users.find({_id: {$ne: Meteor.userId()}}).count(),
    sumTasksCompleted: function() {
        return Stickies.find({status: 4}).count();
    }
});

Template.dashboardContent.events({
    'click .new-conversation': function (e) {
        e.preventDefault();
        Router.go('privateMessageCreate');
    }
});