"use strict";

Template.sprintsOverview.helpers({
    noSprints: function () {
        return Sprints.find({productId: this._id}).count() === 0;
    },
    productOwner: function () {
        return Roles.userIsInRole(Meteor.userId(), [this._id], 'productOwner');
    }
});