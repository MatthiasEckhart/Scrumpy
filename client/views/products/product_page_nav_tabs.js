"use strict";

Template.productPageNavTabs.events({
    'click .productDashboardNavTab': function () {
        setSessionForActiveNavTab('productDashboard');
    },
    'click .sprintPlanningNavTab': function () {
        setSessionForActiveNavTab('sprintPlanning');
    },
    'click .documentsNavTab': function () {
        setSessionForActiveNavTab('documents');
    }
});