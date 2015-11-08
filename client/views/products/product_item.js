"use strict";

Template.productItem.helpers({
    role: function () {
        if (this.advancedMode) {
            if (Roles.userIsInRole(Meteor.user(), [this._id], "productOwner")) return "Product Owner";
            else if (Roles.userIsInRole(Meteor.user(), [this._id], "scrumMaster")) return "ScrumMaster";
        } else {
            if (Roles.userIsInRole(Meteor.user(), [this._id], "administrator")) return "Administrator";
        }
        return "Member of Development Team";
    },
    user: function () {
        return Users.findOne({_id: this.userId});
    }
});