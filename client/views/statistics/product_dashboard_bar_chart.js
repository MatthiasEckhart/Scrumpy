"use strict";

Template.productDashboardBarChart.onRendered(function () {
    var productId = this.data._id;
    Tracker.autorun(function () {
        var countData = [], toDoCount, startedCount, verifyCount, doneCount, data, userStoryIds;
        userStoryIds = UserStories.find({productId: productId}).map((story) => story._id);
        toDoCount = Stickies.find({storyId: {$in: userStoryIds}, status: 1}).count();
        startedCount = Stickies.find({storyId: {$in: userStoryIds}, status: 2}).count();
        verifyCount = Stickies.find({storyId: {$in: userStoryIds}, status: 3}).count();
        doneCount = Stickies.find({storyId: {$in: userStoryIds}, status: 4}).count();
        while (countData.length > 0) countData.pop();
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