// Private statistics for dashboard (effort line chart)
DashboardStatisticsPrivate = new Mongo.Collection('dashboardStatisticsPrivate');

DashboardStatisticsPrivate.allow({
    insert: ownsDocumentOrAdminOrProductOwner
});

DashboardStatisticsPrivate.deny({
    update: denyPermission,
    remove: denyPermission
});