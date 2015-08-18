"use strict";

Template.profileActivityOverviewBarChart.rendered = function () {
    var username = this.data.username, data;
    Tracker.autorun(function () {
        data = {
            labels: ["Products", "Sprints", "User Stories", "Tasks"],
            datasets: [
                {
                    label: "My Second dataset",
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,0.8)",
                    highlightFill: "rgba(151,187,205,0.75)",
                    highlightStroke: "rgba(151,187,205,1)",
                    data: [Products.find({author: username}).count(), Sprints.find({author: username}).count(), UserStories.find({author: username}).count(), Stickies.find({author: username}).count()]
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
};