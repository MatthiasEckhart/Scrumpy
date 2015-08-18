"use strict";

Template.profilePage.helpers({
    statDataAvailable: function () {
        return _.union(Roles.getRolesForUser(this._id, "developmentTeam"), Roles.getRolesForUser(this._id, "productOwner"), Roles.getRolesForUser(this._id, "scrumMaster"), Roles.getRolesForUser(this._id, "administrator")).length > 0;
    },
    personalInfoAvailable: function () {
        return this.profile.firstName || this.profile.lastName || this.profile.organization;
    },
    firstName: function () {
        return this.profile.firstName ? this.profile.firstName : "-";
    },
    lastName: function () {
        return this.profile.lastName ? this.profile.lastName : "-";
    },
    organization: function () {
        return this.profile.organization ? this.profile.organization : "-";
    }
});