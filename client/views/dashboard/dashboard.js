"use strict";

Template.dashboard.onRendered(function () {
    Session.set('activeNavTab', 'dashboard');
    if (Session.equals("loginSuccess", true)) {
        throwAlert('success', 'Howdy!', 'Welcome back to Scrumpy!');
        Session.set('loginSuccess', false);
    } else if (Session.equals("registerSuccess", true)) {
        throwAlert('success', 'Congratulations!', 'You\'re now a member of Scrumpy!');
        Session.set('registerSuccess', false);
    } else if (Session.equals("changePasswordSuccess", true)) {
        throwAlert('success', 'Work done!', 'You changed your password successfully.');
        Session.set('changePasswordSuccess', false);
    }
});

Template.dashboard.onDestroyed(function () {
    Session.set('activeNavTab', null);
});

Template.dashboard.helpers({
    noProducts: function () {
        return this.products.count() === 0;
    },
    productTitleForLineChartPanel: function () {
        return this.products.fetch()[0].title;
    },
    conversations: function () {
        return Conversations.find({}, {sort: {updatedAt: -1}});
    },
    noConversations: function () {
        return Conversations.find().count() === 0;
    },
    invitations: function () {
        return Invitations.find({status: 0}, {sort: {updatedAt: -1}});
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

Template.dashboard.events({
    'click .new-conversation': function (e) {
        e.preventDefault();
        Router.go('privateMessageCreate');
    }
});