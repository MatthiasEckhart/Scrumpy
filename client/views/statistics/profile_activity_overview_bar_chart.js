"use strict";

Template.profileActivityOverviewBarChart.onRendered(function () {
    var userId = this.data._id, data;
    Tracker.autorun(function () {
        data = {
            labels: ["Products", "Sprints", "User Stories", "Tasks"],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: [
                        Products.find({userId: userId}).count(),
                        Sprints.find({userId: userId}).count(),
                        UserStories.find({userId: userId}).count(),
                        Stickies.find({userId: userId}).count()
                    ]
                }
            ]
        };
        $(document).ready(function () {
            var barChart = document.getElementById("profile-activity-overview-bar-chart"), ctx;
            if (barChart) {
                ctx = barChart.getContext("2d");
                new Chart(ctx).Bar(data);
            }
        });
    });
});