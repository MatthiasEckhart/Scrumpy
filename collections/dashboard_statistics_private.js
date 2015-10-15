// Private statistics for dashboard (effort line chart)
DashboardStatisticsPrivate = new Mongo.Collection('dashboardStatisticsPrivate');

DashboardStatisticsPrivate.allow({
    insert: ownsDocumentOrAdminOrProductOwner,
    update: denyPermission,
    remove: denyPermission
});