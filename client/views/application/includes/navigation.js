"use strict";

Template.navigation.events({
    'click #logout': function () {
        var username = Meteor.user().username;
        Meteor.logout(function () {
            Session.set('logoutSuccess', true);
            Session.set('username', username);
        });
        Router.go('dashboard');
        return false;
    }
});

Template.navigation.helpers({
    avatar: function () {
        return Meteor.user().profile.image;
    },
    user: function () {
        return Meteor.user();
    }
});