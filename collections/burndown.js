Burndown = new Meteor.Collection('burndown');

Burndown.allow({
    insert: allowPermission,
    update: allowPermission,
    remove: allowPermission
});

Meteor.methods({
    updateBurndown: function (sprintId) {
        if (Meteor.isServer) {
            var burndownData = Burndown.findOne({sprintId: sprintId}),
                storyIdsObj,
                storyIds,
                estEffortInHCurr,
                date;
            if (burndownData) {
                storyIdsObj = UserStories.find({sprintId: sprintId}, {fields: {_id: 1}}).fetch();
                storyIds = [];
                _.each(storyIdsObj, function (item) {
                    storyIds.push(item._id);
                });
                estEffortInHCurr = 0;
                if (storyIds) {
                    Stickies.find({
                        storyId: {$in: storyIds},
                        status: {$in: [1, 2, 3]}
                    }).forEach(function (sticky) {
                        estEffortInHCurr += parseInt(sticky.effort, 10);
                    });
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
    }
});

arrayContainsDateElement = function (arr, el) {
    var i = arr.length;
    while (i--) {
        if (arr[i].date.toISOString() === el) {
            return true;
        }
    }
    return false;
};