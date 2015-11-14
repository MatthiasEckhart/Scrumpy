Conversations = new Mongo.Collection('conversations');

Conversations.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});

Conversations.friendlySlugs({
    slugFrom: 'subject',
    slugField: 'slug',
    distinct: true,
    updateSlug: true
});

Conversations.attachSchema(new SimpleSchema({
    subject: {
        type: String,
        label: "Subject",
        max: 30,
        autoform: {
            placeholder: "The conversation subject."
        }
    },
    recipients: {
        type: [String],
        label: "Recipients",
        autoform: {
            type: "select2",
            options: function () {
                return Users.find({_id: {$ne: Meteor.userId()}}).map(function (user) {
                    return {label: user.username, value: user._id};
                });
            },
            afFieldInput: {
                select2Options: {
                    placeholder: "Add recipients here."
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
    },
    friendlySlugs: {
        type: Object,
        blackbox: true
    },
    slug: {
        type: String,
        optional: true
    }
}));

Conversations.simpleSchema().messages({
    "required recipients": "Please select at least one recipient!"
});
