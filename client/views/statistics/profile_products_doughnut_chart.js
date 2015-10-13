"use strict";

Template.profileProductsDoughnutChart.onRendered(function () {
    var userId = this.data._id;
    Tracker.autorun(function () {
        var productIdsArr = _.union(Roles.getRolesForUser(userId, "developmentTeam"), Roles.getRolesForUser(userId, "productOwner"), Roles.getRolesForUser(userId, "scrumMaster"), Roles.getRolesForUser(userId, "administrator")),
            sumAdvancedProducts = 0,
            sumNormalProducts = 0,
            data;
        Products.find({_id: {$in: productIdsArr}}).forEach(function (product) {
            if (product.advancedMode) {
                sumAdvancedProducts++;
            } else {
                sumNormalProducts++;
            }
        });
        data = [
            {
                value: sumAdvancedProducts,
                color: "#46BFBD",
                highlight: "#5AD3D1",
                label: "Advanced product"
            },
            {
                value: sumNormalProducts,
                color: "#FDB45C",
                highlight: "#FFC870",
                label: "Normal product"
            }
        ];
        $(document).ready(function () {
            var doughnutChart = document.getElementById("profile-products-doughnut-charts"), ctx;
            if (doughnutChart) {
                ctx = doughnutChart.getContext("2d");
                new Chart(ctx).Doughnut(data);
            }
        });
    });
});