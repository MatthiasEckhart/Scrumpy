Stickies = new Mongo.Collection('stickies');

Stickies.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});