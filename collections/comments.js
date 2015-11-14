Comments = new Mongo.Collection('comments');

Comments.attachSchema(new SimpleSchema({
    body: {
        type: String,
        label: "Add a comment for other Scrum team members",
        autoform: {
            afFieldInput: {
                type: "textarea",
                rows: 2
            }
        }
    },
    actElId: {
        type: String,
        denyUpdate: true,
        autoform: {
            omit: true
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
    }
}));

Comments.allow({
    insert: ownsDocument,
    update: ownsDocumentOrProductOwner,
    remove: ownsDocumentOrProductOwner
});