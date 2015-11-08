"use strict";

Template.dashboardLineChart.onRendered(function () {
    if (DashboardStatisticsPrivate.find().count() > 0) {
        Tracker.autorun(function () {
            var labels = [],
                dataProduct1 = [],
                products = Products.find({}, {sort: {updatedAt: -1}, limit: 1}).fetch(),
                product1 = products[0],
                dashboardStatsPrivate1, dateObj, i, data, lineChart, ctx, mom, effort;

            // at least 1 product is needed to create a line chart
            if (product1) {
                dashboardStatsPrivate1 = DashboardStatisticsPrivate.findOne({productId: product1._id});
                Session.set("productStat", product1._id);

                dateObj = new Date();
                dateObj.setHours(0);
                dateObj.setMinutes(0);
                dateObj.setSeconds(0);
                dateObj.setMilliseconds(0);

                // show statistics for last 15 days
                for (i = 15; i >= 0; i--) {
                    mom = moment(dateObj).subtract(i, 'days');
                    labels.push(mom.format('L'));
                    effort = getEffortForDashboardStatsPrivate(dashboardStatsPrivate1, mom);

                    if (product1 && effort !== 0) {
                        dataProduct1.push(effort);
                    } else {
                        dataProduct1.push(0);
                    }
                }

                data = {
                    labels: labels,
                    datasets: [
                        {
                            label: product1.title,
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            data: dataProduct1
                        }
                    ]
                };
                $(document).ready(function () {
                    lineChart = document.getElementById("dashboard-line-chart");
                    if (lineChart) {
                        ctx = lineChart.getContext("2d");
                        new Chart(ctx).Line(data, {
                            responsive: true,
                            bezierCurve: false
                        });
                    }
                });
            }
        });
    }
});

function getEffortForDashboardStatsPrivate(dashboardStats, mom) {
    if (dashboardStats) {
        var j = dashboardStats.data.length;
        while (j--) {
            if (moment(dashboardStats.data[j].date).isSame(mom, "day")) {
                return dashboardStats.data[j].effort;
            }
        }
    }
    return 0;
}

Template.dashboardLineChart.onDestroyed(function () {
    Session.set("productStat", null);
});