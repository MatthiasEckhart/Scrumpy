"use strict";

Template.productDashboardBurndownChart.onRendered(function () {
    var productId = this.data._id;
    Tracker.autorun(function () {
        var sprint = Sprints.findOne({
            productId: productId,
            startDate: {$lte: new Date()},
            endDate: {$gte: new Date()}
        }), labels = [], idealEffort = [], actualEffort = [],
            startDate, endDate, storyIdsObj, storyIds, totalEstEffortInSprint, idealEffortCounter, burndownData, daysDiff, i, count, j, data;
        if (sprint) {
            startDate = sprint.startDate;
            endDate = sprint.endDate;
            storyIdsObj = UserStories.find({sprintId: sprint._id}, {fields: {_id: 1}}).fetch();
            storyIds = [];
            _.each(storyIdsObj, function (item) {
                storyIds.push(item._id);
            });
            totalEstEffortInSprint = 0;
            if (storyIds.length > 0) {
                Stickies.find({storyId: {$in: storyIds}}).forEach(function (sticky) {
                    totalEstEffortInSprint += parseInt(sticky.effort, 10);
                });
            }
            idealEffortCounter = totalEstEffortInSprint;
            while (labels.length > 0) {
                labels.pop();
            }
            while (idealEffort.length > 0) {
                idealEffort.pop();
            }
            while (actualEffort.length > 0) {
                actualEffort.pop();
            }
            burndownData = Burndown.findOne({sprintId: sprint._id});
            daysDiff = moment.utc(endDate).diff(moment.utc(startDate), 'days');

            for (i = 0; i < daysDiff; i++) {
                if (i !== 0 && i !== (daysDiff - 1)) {
                    idealEffortCounter -= (totalEstEffortInSprint / (daysDiff - 1));
                    idealEffort.push(idealEffortCounter);
                }
                labels.push(moment.utc(startDate).add(i, 'days').format('L'));
                if (i === 0) {
                    idealEffort.push(idealEffortCounter);
                }
            }
            idealEffort.push(0);

            if (burndownData && _.has(burndownData, 'data')) {
                count = 0;
                for (j = 0; j < burndownData.data.length; j++) {
                    if (moment.utc(burndownData.data[j].date).format('L') === moment.utc(labels[j]).format('L')) {
                        actualEffort.push(burndownData.data[j].effort);
                        count++;
                    } else {
                        while (moment.utc(burndownData.data[j].date).format('L') !== moment.utc(labels[count]).format('L')) {
                            actualEffort.push(burndownData.data[j - 1].effort);
                            count++;
                        }
                        actualEffort.push(burndownData.data[j].effort);
                        count++;
                    }
                }
                data = {
                    labels: labels,
                    datasets: [
                        {
                            fillColor: "rgba(220,220,220,0.5)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            data: idealEffort
                        },
                        {
                            fillColor: "rgba(151,187,205,0.5)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            data: actualEffort
                        }
                    ]
                };
                $(document).ready(function () {
                    var burndownChart = document.getElementById("burndownChart"), ctx;
                    if (burndownChart) {
                        // Get the context of the canvas element we want to select
                        ctx = document.getElementById("burndownChart").getContext("2d");
                        new Chart(ctx).Line(data, {
                            bezierCurve: false
                        });
                    }
                });
            }
        }
    });
});