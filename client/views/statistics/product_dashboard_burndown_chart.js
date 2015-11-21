"use strict";

Template.productDashboardBurndownChart.onRendered(function () {
    var productId = this.data._id;
    Tracker.autorun(function () {
        /* Get current sprint. */
        var sprint = Sprints.findOne({
                productId: productId,
                startDate: {$lte: new Date()},
                endDate: {$gte: new Date()}
            }), labels = [], idealEffort = [], actualEffort = [],
            startDate, endDate, storyIds, totalEstEffortInSprint, idealEffortCounter, burndownData, daysDiff, i, counter, j, data;
        /* Check if current sprint is available. */
        if (sprint) {
            /* Set sprint start and end date. */
            startDate = sprint.startDate;
            endDate = sprint.endDate;
            /* Get array of user story IDs. */
            storyIds = UserStories.find({sprintId: sprint._id}, {fields: {_id: 1}}).map((story) => story._id);
            /* Set total estimated effort in sprint to 0. */
            totalEstEffortInSprint = 0;
            /* Check if array contains at least one user story ID. */
            if (storyIds.length > 0) {
                /* Sum up total estimated effort in sprint. */
                Stickies.find({storyId: {$in: storyIds}}).forEach((sticky) => totalEstEffortInSprint += parseInt(sticky.effort, 10));
            }

            idealEffortCounter = totalEstEffortInSprint;
            /* Reset data to ensure a fresh start. */
            while (labels.length > 0) labels.pop();
            while (idealEffort.length > 0) idealEffort.pop();
            while (actualEffort.length > 0) actualEffort.pop();
            /* Get Burndown data. */
            burndownData = Burndown.findOne({sprintId: sprint._id});
            /* Calculate end date - start date (in days). */
            daysDiff = moment.utc(endDate).diff(moment.utc(startDate), 'days');
            /* Loop through each sprint day and set ideal effort. */
            for (i = 0; i < daysDiff; i++) {
                /* Set ideal effort. */
                if (i !== 0 && i !== (daysDiff - 1)) {
                    idealEffortCounter -= (totalEstEffortInSprint / (daysDiff - 1));
                    idealEffort.push(idealEffortCounter);
                }
                /* Add all days to label array within the period start date - end date. */
                labels.push(moment(startDate).add(i, 'days').startOf('day').toDate());
                /* Add total estimated effort in sprint to first day of sprint (ideal effort).  */
                if (i === 0) idealEffort.push(idealEffortCounter);
            }
            /* Ideal effort should be 0 on last day of sprint. */
            idealEffort.push(0);
            /* Check if Burndown data exists. */
            if (burndownData && _.has(burndownData, 'data')) {
                /* This counter is used for iterating over labels, if there is no respective burndown data element
                 * which matches a label element. */
                counter = 0;
                /* Loop through all burndown data elements and add actual effort to array. */
                for (var k = 0; k < burndownData.data.length; k++) {
                    if (moment(labels[k]).isSame(moment.utc(burndownData.data[k].date).toDate())) {
                        /* Add actual effort to array and increase counter. */
                        actualEffort.push(burndownData.data[k].effort);
                        counter++;
                    } else {
                        while (moment(labels[counter]).isBefore(moment.utc(burndownData.data[k].date).toDate())) {
                            actualEffort.push(totalEstEffortInSprint);
                            counter++;
                        }
                        actualEffort.push(burndownData.data[k].effort);
                        counter++;
                    }
                }

                /* Setup burndown chart data. */
                data = {
                    /* Format labels for better readability. */
                    labels: labels.map((label) => moment(label).format('L')),
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