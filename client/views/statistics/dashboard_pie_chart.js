"use strict";

Template.dashboardPieChart.rendered = function () {
    var dashStats = DashboardStatistics.findOne();
    if (dashStats) {
        Tracker.autorun(function () {
            var data = [
                {
                    value: dashStats.totalTasksTodo,
                    color:"#F7464A",
                    highlight: "#FF5A5E",
                    label: "To do"
                },
                {
                    value: dashStats.totalTasksStarted,
                    color: "#FDB45C",
                    highlight: "#FFC870",
                    label: "Started"
                },
                {
                    value: dashStats.totalTasksVerify,
                    color: "#4D5360",
                    highlight: "#616774",
                    label: "Verify"
                },
                {
                    value: dashStats.totalTasksDone,
                    color: "#46BFBD",
                    highlight: "#5AD3D1",
                    label: "Done"
                }
            ];
            $(document).ready(function () {
                var pieChart = document.getElementById("dashboard-pie-chart"), ctx;
                if (pieChart) {
                    ctx = pieChart.getContext("2d");
                    new Chart(ctx).Pie(data, {
                        responsive: true
                    });
                }
            });
        });
    }
};