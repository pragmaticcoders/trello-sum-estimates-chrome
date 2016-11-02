
function countEstimates() {
    jQuery('.list-header-name-assist').each(function() {
        var header = jQuery(this);
        var estimates = 0;
        header.parent().parent().find('.badge-text:contains("Estimate")').each(
            function(el) {
                var h = jQuery(this).html();
                var r = /(\d+)/g.exec(h); estimates += ~~r[0];
            }
        );
        jQuery('<span>').text('e: ' + estimates.toString()).insertAfter(header);
    });
}

setTimeout(countEstimates, 3000);
