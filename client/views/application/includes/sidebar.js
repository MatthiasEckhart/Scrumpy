"use strict";

Template.sidebar.events({
    'click .dashboard-block': function () {
        setSessionForActiveNavTab('dashboard');
    },
    'click .profile-block': function () {
        setSessionForActiveNavTab('profilePage');
    },
    'click .new-product-block': function () {
        setSessionForActiveNavTab('productCreate');
    },
    'click .notifications-block': function () {
        setSessionForActiveNavTab('privateMessagesList');
    }
});

Template.sidebar.helpers({
    user: function () {
        return Meteor.user();
    }
});