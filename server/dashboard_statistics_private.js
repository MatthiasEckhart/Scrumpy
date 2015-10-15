"use strict";

Meteor.methods({
    updateDashboardStatisticsPrivateInc: function (sticky, userStory) {
        if (sticky && userStory) {
            var dashboardStatsPrivate = DashboardStatisticsPrivate.findOne({productId: userStory.productId}),
                date = new Date(),
                sumEffort;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (!dashboardStatsPrivate.data || !arrayContainsDateElement(dashboardStatsPrivate.data, date.toISOString())) {
                DashboardStatisticsPrivate.update({productId: userStory.productId}, {
                    $push: {
                        data: {
                            date: date,
                            effort: parseInt(sticky.effort, 10)
                        }
                    }
                });
            } else {
                sumEffort = parseInt(sticky.effort, 10);
                _.each(dashboardStatsPrivate.data, (data) => {
                    if (data.date.toISOString() === date.toISOString()) sumEffort += parseInt(data.effort, 10);
                });
                DashboardStatisticsPrivate.update({
                    productId: userStory.productId,
                    "data.date": date
                }, {$set: {"data.$.effort": sumEffort}});
            }
        }
    },
    updateDashboardStatisticsPrivateDec: function (sticky, userStory) {
        if (sticky && userStory) {
            var dashboardStatsPrivate = DashboardStatisticsPrivate.findOne({productId: userStory.productId}),
                date = new Date(),
                sumEffort;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (!dashboardStatsPrivate.data || !arrayContainsDateElement(dashboardStatsPrivate.data, date.toISOString())) {
                DashboardStatisticsPrivate.update({productId: userStory.productId}, {
                    $push: {
                        data: {
                            date: date,
                            effort: 0
                        }
                    }
                });
            } else {
                sumEffort = 0;
                _.each(dashboardStatsPrivate.data, (data) => {
                    if (data.date.toISOString() === date.toISOString()) sumEffort = parseInt(data.effort, 10) - parseInt(sticky.effort, 10);
                });
                if (sumEffort < 0) sumEffort = 0;
                DashboardStatisticsPrivate.update({
                    productId: userStory.productId,
                    "data.date": date
                }, {$set: {"data.$.effort": sumEffort}});
            }
        }
    }
});