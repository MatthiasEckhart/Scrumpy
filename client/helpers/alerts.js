// Local (client-only) collection, Alerts collection will only exist in the browser and will make no attempt to synchronize with the server.
Alerts = new Meteor.Collection(null);

throwAlert = function (type, message, details) {
    var alertId;
    if (Alerts.find({details: details}).count() === 0) {
        alertId = Alerts.insert({type: type, message: message, details: details});
    } else {
        // highlight current alert message
        alertId = Alerts.findOne({details: details})._id;
        $(getAlertElId(alertId)).effect('highlight');
    }
    // remove alert after 4 seconds
    Meteor.setTimeout(function () {
        $(getAlertElId(alertId)).effect(
            'fade',
            function () {
                Alerts.remove(alertId);
            }
        );
    }, 4000);
};

clearAlerts = function () {
    Alerts.remove({}); // remove all alerts in collection
};

function getAlertElId(alertId) {
    return '#' + alertId;
}