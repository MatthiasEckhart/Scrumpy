"use strict";

Template.profilePage.helpers({
    statDataAvailable: function () {
        return statDataAvailable(this);
    },
    mainDataAvailable: function () {
        return this.profile.bio || statDataAvailable(this);
    }
});

function statDataAvailable(ctx) {
    return _.union(
            Roles.getRolesForUser(ctx._id, "developmentTeam"),
            Roles.getRolesForUser(ctx._id, "productOwner"),
            Roles.getRolesForUser(ctx._id, "scrumMaster"),
            Roles.getRolesForUser(ctx._id, "administrator")
        ).length > 0;
}