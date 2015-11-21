"use strict";

Meteor.methods({
    updateBurndown: function (sprintId) {
        var burndownData = Burndown.findOne({sprintId: sprintId}),
            storyIds,
            estEffortInHCurr,
            date;
        if (burndownData) {
            storyIds = UserStories.find({sprintId: sprintId}, {fields: {_id: 1}}).map((story) => story._id);
            estEffortInHCurr = 0;
            if (storyIds) {
                Stickies.find({
                    storyId: {$in: storyIds},
                    status: {$in: [1, 2, 3]}
                }).forEach((sticky) => estEffortInHCurr += parseInt(sticky.effort, 10));
            }
            date = new Date();
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (!burndownData.data || !arrayContainsDateElement(burndownData.data, date.toISOString())) {
                Burndown.update({sprintId: sprintId}, {$push: {data: {date: date, effort: estEffortInHCurr}}});
            } else {
                Burndown.update({
                    sprintId: sprintId,
                    "data.date": date
                }, {$set: {"data.$.effort": estEffortInHCurr}});
            }
        }
    }
});