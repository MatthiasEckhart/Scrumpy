"use strict";

Template.teamOverview.helpers({
    productOwner: function () {
        var pOmembers = Roles.getUsersInRole([this._id], 'productOwner').fetch();
        return pOmembers[0];
    }
});

Template.teamOverview.rendered = function () {
    Session.set('scrumTeamStaleState', false);
};