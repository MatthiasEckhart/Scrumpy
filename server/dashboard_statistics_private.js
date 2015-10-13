"use strict";

Meteor.methods({
    updateDashboardStatisticsPrivateInc: function (sticky) {
        if (sticky) {
            var dashboardStatsPrivate = DashboardStatisticsPrivate.findOne({productId: sticky.productId}),
                date = new Date(),
                sumEffort;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            if (!dashboardStatsPrivate.data || !arrayContainsDateElement(dashboardStatsPrivate.data, date.toISOString())) {
                DashboardStatisticsPrivate.update({productId: sticky.productId}, {
                    $push: {
                        data: {
                            date: date,
                            effort: parseInt(sticky.effort, 10)
                        }
                    }
                });
            } else {
                sumEffort = parseInt(sticky.effort, 10);
                _.each(dashboardStatsPrivate.data, function (data) {
                    if (data.date.toISOString() === date.toISOString()) {
                        sumEffort += parseInt(data.effort, 10);
                    }
                });
                DashboardStatisticsPrivate.update({
                    productId: sticky.productId,
                    "data.date": date
                }, {$set: {"data.$.effort": sumEffort}});
            }
        }
    },
    updateDashboardStatisticsPrivateDec: function (sticky) {
        if (sticky) {
            var dashboardStatsPrivate = DashboardStatisticsPrivate.findOne({productId: sticky.productId}),
                date = new Date(),
                sumEffort;
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            if (!dashboardStatsPrivate.data || !arrayContainsDateElement(dashboardStatsPrivate.data, date.toISOString())) {
                DashboardStatisticsPrivate.update({productId: sticky.productId}, {
                    $push: {
                        data: {
                            date: date,
                            effort: 0
                        }
                    }
                });
            } else {
                sumEffort = 0;
                _.each(dashboardStatsPrivate.data, function (data) {
                    if (data.date.toISOString() === date.toISOString()) {
                        sumEffort = parseInt(data.effort, 10) - parseInt(sticky.effort, 10);
                    }
                });
                if (sumEffort < 0) {
                    sumEffort = 0;
                }
                DashboardStatisticsPrivate.update({
                    productId: sticky.productId,
                    "data.date": date
                }, {$set: {"data.$.effort": sumEffort}});
            }
        }
    }
});