throwDialog = function (type, message, details, actionButton, link, actionClass, data) {
    sAlert.warning({
        sAlertIcon: 'exclamation-triangle',
        sAlertTitle: message,
        message: details,
        actionButton: actionButton,
        link: link,
        actionClass: actionClass,
        data: data,
        isDialog: true
    });
};