"use strict";

Template.privateMessagesList.helpers({
    noPrivateMessages: function () {
        return Meteor.user().privateMessages.length === 0;
    },
    privateMessages: function () {
        return PrivateMessages.find({_id: {$in: Meteor.user().privateMessages}}, {sort: {lastModified: -1}});
    }
});

Template.privateMessagesList.rendered = function () {
    Session.set('activeNavTab', 'privateMessagesList');
};

Template.privateMessagesList.destroyed = function () {
    Session.set('activeNavTab', null);
};