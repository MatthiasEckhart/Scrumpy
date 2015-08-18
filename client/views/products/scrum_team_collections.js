// Local (client-only) collection, DevelopmentTeam & ScrumMaster collection will only exist in the browser and will make no attempt to
// synchronize with the server.
DevelopmentTeam = new Meteor.Collection(null);

clearDevTeam = function () {
    DevelopmentTeam.remove({}); // remove all dev team members in collection
};

ScrumMaster = new Meteor.Collection(null);

clearScrumMaster = function () {
    ScrumMaster.remove({}); // remove Scrum Master in collection
};