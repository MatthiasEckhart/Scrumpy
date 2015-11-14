Products = new Mongo.Collection('products');

Products.friendlySlugs({
    slugFrom: 'title',
    slugField: 'slug',
    distinct: true,
    updateSlug: true
});

Products.attachSchema(new SimpleSchema({
    title: {
        type: String,
        label: "Title",
        max: 30
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
    advancedMode: {
        type: Boolean,
        label: "Advanced Mode",
        denyUpdate: true
    },
    vision: {
        type: String,
        label: "Vision",
        optional: true,
        custom: function () {
            var advancedMode = this.field("advancedMode").value;
            if (advancedMode) {
                /* Inserts */
                if (!this.operator) {
                    if (!this.isSet || this.value === null || this.value === "") return "required";
                }
                /* Updates */
                else if (this.isSet) {
                    if (this.operator === "$set" && this.value === null || this.value === "") return "required";
                    if (this.operator === "$unset") return "required";
                    if (this.operator === "$rename") return "required";
                }
            }
        },
        autoform: {
            afFieldInput: {
                type: "textarea",
                rows: 2
            }
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

Products.allow({
    insert: ownsDocument,
    update: ownsDocument,
    remove: ownsDocument
});