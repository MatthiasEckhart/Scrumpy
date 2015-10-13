"use strict";

Template.productDashboardBarChart.onRendered(function () {
    var productId = this.data._id;
    Tracker.autorun(function () {
        var countData = [], toDoCount, startedCount, verifyCount, doneCount, data, storyIdsObj, storyIds, sprint;
        if (Session.equals('showBarChartForCurrentSprint', true)) {
            sprint = Sprints.findOne({
                productId: productId,
                startDate: {$lte: new Date()},
                endDate: {$gte: new Date()}
            });
            if (sprint) {
                storyIdsObj = UserStories.find({sprintId: sprint._id}, {fields: {_id: 1}}).fetch();
                storyIds = [];
                _.each(storyIdsObj, function (item) {
                    storyIds.push(item._id);
                });
                if (storyIds) {
                    toDoCount = Stickies.find({storyId: {$in: storyIds}, status: 1}).count();
                    startedCount = Stickies.find({storyId: {$in: storyIds}, status: 2}).count();
                    verifyCount = Stickies.find({storyId: {$in: storyIds}, status: 3}).count();
                    doneCount = Stickies.find({storyId: {$in: storyIds}, status: 4}).count();
                }
            }
        } else if (Session.equals('showBarChartForAllSprints', true)) {
            toDoCount = Stickies.find({productId: productId, status: 1}).count();
            startedCount = Stickies.find({productId: productId, status: 2}).count();
            verifyCount = Stickies.find({productId: productId, status: 3}).count();
            doneCount = Stickies.find({productId: productId, status: 4}).count();
        }

        while (countData.length > 0) {
            countData.pop();
        }

        countData.push(toDoCount, startedCount, verifyCount, doneCount);
        data = {
            labels: ["ToDo", "Started", "Verify", "Done"],
            datasets: [
                {
                    fillColor: "rgba(151,187,205,0.5)",
                    strokeColor: "rgba(151,187,205,1)",
                    data: countData
                }
            ]
        };
        $(document).ready(function () {
            var barChart = document.getElementById("barChart"), ctx;
            if (barChart) {
                ctx = barChart.getContext("2d");
                new Chart(ctx).Bar(data, {
                    scaleOverride: true,
                    scaleStepWidth: 1,
                    scaleSteps: (toDoCount + startedCount + verifyCount + doneCount)
                });
            }
        });
    });
});