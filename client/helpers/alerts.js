throwAlert = function (type, message, details) {
    alert[type](message, details);
};

var alert = {
    info: function (message, details) {
        sAlert.info({sAlertIcon: 'info', sAlertTitle: message, message: details, isDialog: false});
    },
    success: function (message, details) {
        sAlert.success({sAlertIcon: 'check', sAlertTitle: message, message: details, isDialog: false});
    },
    error: function (message, details) {
        sAlert.error({sAlertIcon: 'times', sAlertTitle: message, message: details, isDialog: false});
    },
    warning: function (message, details) {
        sAlert.warning({sAlertIcon: 'exclamation-triangle', sAlertTitle: message, message: details, isDialog: false});
    }
};