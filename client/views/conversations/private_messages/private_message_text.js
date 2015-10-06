"use strict";

Template.privateMessageText.helpers({
    date: function () {
        return moment(this.submitted).format('MMMM Do YYYY, h:mm:ss a');
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    },
    authorIsCurrentUser: function () {
        return this.userId === Meteor.userId();
    }
});