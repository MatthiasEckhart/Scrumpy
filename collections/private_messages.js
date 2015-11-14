PrivateMessages = new Mongo.Collection('privateMessages');

PrivateMessages.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});

PrivateMessages.attachSchema(new SimpleSchema({
    text: {
        type: String,
        label: "New Private Message",
        autoform: {
            afFieldInput: {
                type: "textarea",
                rows: 3
            }
        }
    }, conversationId: {
        type: String,
        autoform: {
            omit: true
        },
        denyUpdate: true
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