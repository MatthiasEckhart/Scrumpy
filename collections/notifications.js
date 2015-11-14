Notifications = new Mongo.Collection('notifications');

Notifications.allow({
    remove: ownsDocument
});

Notifications.deny({
    insert: denyPermission,
    update: denyPermission
});

Notifications.attachSchema(new SimpleSchema({
    /* ID of user A who performed one of the following actions:
     * - invited user B
     * - commented on Activity Stream Element
     * - sent a private message to user B */
    userId: {
        type: String,
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    type: {
        type: Number,
        denyUpdate: true,
        autoform: {
            omit: true
        }
    },
    conversationId: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        },
        custom: function () {
            return validateIdField(this, 1);
        }
    },
    invitationId: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        },
        custom: function () {
            return validateIdField(this, 2);
        }
    },
    commentId: {
        type: String,
        optional: true,
        autoform: {
            omit: true
        },
        custom: function () {
            return validateIdField(this, 3);
        }
    },
    productId: {
        type: String,
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

/**
 * Returns true if:
 *  - type argument matches corresponding type field and ID field has been set.
 *  - type argument does not match corresponding type field and ID has not been set.
 */
function validateIdField(context, type) {
    if (context.field('type').value == type) {
        if (!context.isSet || context.value === null || context.value === "") return "required";
        else return true;
    } else {
        if (context.isSet || context.value) return "notAllowed";
        else return true;
    }
}