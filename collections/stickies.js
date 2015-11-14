Stickies = new Mongo.Collection('stickies');

Stickies.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

Stickies.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        max: 20,
        autoform: {
            placeholder: "Name your sticky."
        }
    },
    description: {
        type: String,
        label: "Description",
        max: 50,
        autoform: {
            placeholder: "A clear and concise statement of work to do."
        }
    },
    effort: {
        type: Number,
        label: "Effort (h)",
        allowedValues: [2, 4, 6, 8]
    },
    storyId: {
        type: String,
        autoform: {
            omit: true
        }
    },
    status: {
        type: Number,
        allowedValues: [1, 2, 3, 4],
        autoform: {
            omit: true
        },
        autoValue: function () {
            if (this.isInsert) {
                if (!this.isFromTrustedCode) {
                    return 1;
                }
            }
        }
    },
    assigneeId: {
        type: String,
        label: "Assignee",
        optional: true,
        autoform: {
            options: function () {
                /* Find corresponding product. */
                let product = Products.findOne({slug: getRouteSlug()});
                /* Get array with user IDs which have an invitation for the current product and accepted the invitation. */
                if (product) {
                    let userIds = Invitations.find({
                        productId: product._id,
                        status: 1
                    }).map((invitation) => invitation.userId);
                    /* We add the current user's id to the array, because users can assign stickies to themselves. */
                    userIds.push(Meteor.userId());
                    /* Return all users as options which accepted an invitation incl. our own user ID. */
                    return Users.find({_id: {$in: userIds}}).map((user) =>  ({
                        label: user.username,
                        value: user._id
                    }));
                }
            }
        }
    },
    userId: {
        type: String,
        autoValue: function () {
            if (this.isInsert) {
                if (!this.isFromTrustedCode) {
                    return this.userId;
                }
            } else
            /* Prevent user from supplying their own user ID. */
                this.unset();
        },
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    lastEditedBy: {
        type: String,
        autoValue: function () {
            if (this.isUpdate) {
                return this.userId;
            } else
            /* Prevent user from supplying their own user ID. */
                this.unset();
        },
        denyInsert: true,
        optional: true,
        autoform: {
            omit: true
        }
    },
    lastMovedBy: {
        type: String,
        denyInsert: true,
        optional: true,
        autoform: {
            omit: true
        }
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) return new Date;
            else if (this.isUpsert) return {$setOnInsert: new Date};
            else
            /* Prevent user from supplying their own date. */
                this.unset();
        },
        autoform: {
            omit: true
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert || this.isUpdate) return new Date;
            else if (this.isUpsert) return {$setOnInsert: new Date};
            else
            /* Prevent user from supplying their own date. */
                this.unset();
        },
        autoform: {
            omit: true
        }
    }
}));