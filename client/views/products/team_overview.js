"use strict";

Template.teamOverview.helpers({
    productOwner: function () {
        var pOmembers = Roles.getUsersInRole([this._id], 'productOwner').fetch();
        return pOmembers[0];
    }
});