"use strict";

Template.productItem.helpers({
    userInRole: function (role) {
        return Roles.userIsInRole(Meteor.user(), [this._id], role);
    },
    userIsAdminOrProductOwner: function () {
        return Roles.userIsInRole(Meteor.user(), [this._id], 'administrator') || Roles.userIsInRole(Meteor.user(), [this._id], 'productOwner');
    },
    avatar: function () {
        return Users.findOne({_id: this.userId}).profile.image;
    }
});