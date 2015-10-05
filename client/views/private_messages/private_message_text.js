"use strict";

Template.privateMessageText.helpers({
    date: function () {
        return moment(this.submitted).format('MMMM Do YYYY, h:mm:ss a');
    },
    user: function () {
        return Users.findOne({username: this.author});
    },
    authorIsCurrentUser: function () {
        return this.author === Meteor.user().username;
    }
});