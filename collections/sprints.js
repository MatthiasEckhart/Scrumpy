Sprints = new Mongo.Collection('sprints');

Sprints.allow({
    insert: scrumTeam,
    update: scrumTeam,
    remove: scrumTeam
});

Sprints.attachSchema(new SimpleSchema({
    goal: {
        type: String,
        label: "Goal",
        max: 50
    },
    startDate: {
        type: Date,
        label: "Start date",
        autoform: {
            afFieldInput: {
                type: "bootstrap-datepicker"
            }
        },
        custom: function () {
            return validateSprintDate(this, this.value, this.field("endDate").value);
        }
    },
    endDate: {
        type: Date,
        label: "End date",
        autoform: {
            afFieldInput: {
                type: "bootstrap-datepicker"
            }
        },
        custom: function () {
            return validateSprintDate(this, this.field("startDate").value, this.value);
        }
    },
    productId: {
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

var productId, product, sprint;

/**
 * Validates the specified sprint date on certain preconditions.
 * Conditions:
 *  - Start date must be before end date.
 * - Combination of start and end date must be unique (product-specific).
 */
function validateSprintDate(context, startDate, endDate) {
    /* Inserts */
    if (!context.operator) {
        if (!context.isSet || context.value === null || context.value === "") return "required";
        let productIdTmp = context.field("productId").value;
        /* If product ID is available, save in variable. */
        if (productIdTmp) productId = productIdTmp;
    }
    /* Updates */
    else if (context.isSet) {
        if (context.operator === "$set" && context.value === null || context.value === "") return "required";
        if (context.operator === "$unset") return "required";
        if (context.operator === "$rename") return "required";
        sprint = Sprints.findOne({_id: context.docId});
        productId = sprint.productId;
    }
    product = Products.findOne({_id: productId});
    /* Check if product exists. */
    if (!product) return "internalError";
    /* Check if end date has been set. */
    if (!endDate) return;
    /* Check if end date is before start date. */
    if (moment(moment.utc(endDate)).isBefore(moment.utc(startDate))) return "endDateBeforeStartDate";
    /* Check if date is not before min. date. */
    let newestSprint = Sprints.findOne({productId: productId}, {sort: {endDate: -1}});
    if (sprint && newestSprint) {
        if (((newestSprint._id != sprint._id) || !context.operator ) && moment(moment.utc(startDate)).isBefore(moment.utc(newestSprint.endDate)))
            return "startDateInTimePeriodOfExistingSprint";
    }
    /* We do not want to check for duplicate sprints if we have to process an update and the sprint dates have not been changed. */
    if (context.isSet && sprint && startDate == sprint.startDate && endDate == sprint.endDate) return;
    /* Check if start and end date combination is unique. */
    if (Sprints.find({
            productId: product._id,
            startDate: startDate,
            endDate: endDate
        }).count() > 0) return "duplicateSprint";
}

Sprints.simpleSchema().messages({
    "endDateBeforeStartDate": "The start date must be before the sprint's end date.",
    "duplicateSprint": "A sprint with same start and end date already exists.",
    "startDateInTimePeriodOfExistingSprint": "This start date is within the time period of an existing sprint.",
    "internalError": "Error. Please contact support team."
});