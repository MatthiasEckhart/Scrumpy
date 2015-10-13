"use strict";

Template.profileRolesPolarAreaChart.onRendered(function () {
    var userId = this.data._id, data;
    Tracker.autorun(function () {
        data = [
            {
                value: _.size(Roles.getRolesForUser(userId, 'productOwner')),
                color: "#F7464A",
                highlight: "#FF5A5E",
                label: "Product Owner"
            },
            {
                value: _.size(Roles.getRolesForUser(userId, 'scrumMaster')),
                color: "#46BFBD",
                highlight: "#5AD3D1",
                label: "Scrum Master"
            },
            {
                value: _.size(Roles.getRolesForUser(userId, 'developmentTeam')),
                color: "#FDB45C",
                highlight: "#FFC870",
                label: "Member of development team"
            },
            {
                value: _.size(Roles.getRolesForUser(userId, 'administrator')),
                color: "#949FB1",
                highlight: "#A8B3C5",
                label: "Administrator"
            }
        ];
        $(document).ready(function () {
            var polarChart = document.getElementById("profile-roles-polar-area-chart"), ctx;
            if (polarChart) {
                ctx = polarChart.getContext("2d");
                new Chart(ctx).PolarArea(data);
            }
        });
    });
});