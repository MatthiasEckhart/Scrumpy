"use strict";

Template.productItem.helpers({
    userInRole: function (role) {
        return Roles.userIsInRole(Meteor.user(), [this._id], role);
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    }
});