"use strict";

Meteor.publish(null, function () {
    var productIds = _.union(Roles.getRolesForUser(this.userId, "administrator"), Roles.getRolesForUser(this.userId, "developmentTeam"), Roles.getRolesForUser(this.userId, "productOwner"), Roles.getRolesForUser(this.userId, "scrumMaster"));
    if (productIds.length > 0) return Meteor.roles.find({name: {$in: productIds}});
    else this.ready();
});