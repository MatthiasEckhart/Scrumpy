"use strict";

Template.profilePage.helpers({
    statDataAvailable: function () {
        return _.union(Roles.getRolesForUser(this._id, "developmentTeam"), Roles.getRolesForUser(this._id, "productOwner"), Roles.getRolesForUser(this._id, "scrumMaster"), Roles.getRolesForUser(this._id, "administrator")).length > 0;
    }
});