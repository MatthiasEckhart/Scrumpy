"use strict";

Template.productHistory.helpers({
    sprints: function () {
        return Sprints.find({productId: this._id});
    },
    startDateFormatted: function () {
        return formatDate(this.startDate, false);
    },
    endDateFormatted: function () {
        return formatDate(this.endDate, false);
    },
    startDateUrlFormatted: function () {
        return formatDate(this.startDate, true);
    },
    endDateUrlFormatted: function () {
        return formatDate(this.endDate, true);
    },
    slug: function() {
        var product = Products.findOne({_id: this.productId});
        return product && product.slug;
    },
    isCurrentSprint: function() {
        /* MomentJS: isBetween is currently not available (> 2.9).
         * Therefore, we need to use a workaround. */
        return (!(moment(new Date()).isBefore(this.startDate) || moment(new Date()).isAfter(this.endDate)));
    }
});

function formatDate(date, isUrl) {
    if (isUrl) return moment(date).format('YYYY-MM-DD');
    return moment(date).format('MMMM D, YYYY');
}