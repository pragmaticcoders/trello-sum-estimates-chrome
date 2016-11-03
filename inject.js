var SETTINGS = {};

function isWorkingDay(date)
{
    //TODO: support holidays (preferrably configurable country in settings)
    return !(date.isoWeekday() == 6 || date.isoWeekday() == 7);
}

function getSprintDates(sprintTitle)
{
    //Extract sprint dates from title
    var match = /((\d{2})\.(\d{2})\.(\d{4})) - ((\d{2})\.(\d{2})\.(\d{4}))/g.exec(sprintTitle);
    if(match === null){
        return false;
    }

    return [match[1], match[5]]
}

function getTotalHoursInSprint(sprintTitle)
{
    var teamSize = SETTINGS.teamSize;
    var personHours = 0;

    var sprintDates = getSprintDates(sprintTitle);
    if(sprintDates === false){
        return 0;
    }

    var fromDate = moment(sprintDates[0], 'DD.MM.YYYY');
    var toDate = moment(sprintDates[1], 'DD.MM.YYYY');

    var diff = toDate.diff(fromDate, 'd') + 1; // We include starting day too
    if(diff < 0){
        return 0;
    }

    var tempDate = fromDate.clone();
    while(tempDate.isBefore(toDate, 'd') || tempDate.isSame(toDate, 'd')){
        if(!isWorkingDay(tempDate)){
            --diff;
        }

        tempDate.add(1, 'd');
    }

    var diffInHours = diff * SETTINGS.workingHours;
    return teamSize * diffInHours;
}

function getWorkInProgressColumn()
{
    var ret = null;
    if(SETTINGS.workInProgressColumnName.length === 0){ // Not configured feature
        return null;
    }

    jQuery('.list-header-name-assist').each(function(){
        var header = jQuery(this);
        var headerName = header.html();
	if(headerName === SETTINGS.workInProgressColumnName){
            ret = header;
	    return false; // break
        }
    });

    return ret !== null ? ret.parent().parent() : null;
}

function isBetween(dt, from, to)
{
    return (from.isBefore(dt) || from.isSame(dt)) && (to.isAfter(dt) || to.isSame(dt));
}

function getCurrentSprintColumn()
{
    var now = moment();
    var ret = null;
    jQuery('.list-header-name-assist').each(function(){
        var header = jQuery(this);
        var headerName = header.html();
        var sprintDates = getSprintDates(headerName);

        var fromDate = moment(sprintDates[0], 'DD.MM.YYYY');
        var toDate = moment(sprintDates[1], 'DD.MM.YYYY');
        if(sprintDates !== false && isBetween(now, fromDate, toDate)){
	    ret = header;
            return false; // break
        }
    });

    return ret !== null ? ret.parent().parent() : null;
}

function getCurrentDoneColumn()
{
    if(SETTINGS.doneColumnPrefix.length === 0){  // Not configured
        return null;
    }

    var now = moment();
    var ret = null;
    jQuery('.list-header-name-assist').each(function(){
        var header = jQuery(this);
        var headerName = header.html();
        var sprintDates = getSprintDates(headerName);

        var fromDate = moment(sprintDates[0], 'DD.MM.YYYY');
        var toDate = moment(sprintDates[1], 'DD.MM.YYYY');
        if(sprintDates !== false && isBetween(now, fromDate, toDate) && headerName.trim().indexOf(SETTINGS.doneColumnPrefix) === 0){
	    ret = header;
            return false; // break
        }
    });

    return ret !== null ? ret.parent().parent() : null;
}

function countEstimate(column)
{
    var estimates = 0;
    column.find('.badge-text:contains("Estimate")').each(
        function(el) {
            var h = jQuery(this).html();
            var r = /(\d+)/g.exec(h);
            estimates += ~~r[0];
        }
    );

    return estimates;
}

function countEstimates()
{
    jQuery('.list-header-name-assist').each(function(){
        var header = jQuery(this);
	var headerName = header.html();
        var totalHours = getTotalHoursInSprint(headerName);
	var estimates = countEstimate(header.parent().parent());

        var totalHoursLabel = jQuery('<p>').html('<b>Total:</b> ' + totalHours + ' hours');
        var estimationLabel = jQuery('<p>').html('<b>Total Estimation:</b> ' + estimates.toString() + ' hours');

        estimationLabel.insertAfter(header);
        if(totalHours > 0){
            totalHoursLabel.insertAfter(header);
        }
    });
}

function countBurnedTime()
{
    var currentSprintColumn = getCurrentSprintColumn();
    var workInProgressColumn = getWorkInProgressColumn();
    var doneColumn = getCurrentDoneColumn();
    if(currentSprintColumn === null || workInProgressColumn === null || doneColumn === null){
        return null;
    }

    var burned = countEstimate(doneColumn);
    var left = countEstimate(currentSprintColumn);
    var currentDoing = countEstimate(workInProgressColumn);

    var percent = ~~(burned / (left + burned + currentDoing) * 100);

    var statTemplate = '<div class="header-search sprintBurnedTime">';
    var doingStat = jQuery(statTemplate).html('<b>Current doing</b> ' + currentDoing + ' hours');
    var burnedStat = jQuery(statTemplate).html('<b>Burned</b> ' + burned + ' hours so far');
    var leftStat = jQuery(statTemplate).html('<b>Left</b> ' + left + ' hours');
    var percentStat = jQuery(statTemplate).html('<b>Finished</b> ' + percent + '% of sprint');

    var searchTool = jQuery('.header-search');
    doingStat.insertAfter(searchTool);
    burnedStat.insertAfter(searchTool);
    leftStat.insertAfter(searchTool);
    percentStat.insertAfter(searchTool);
}

function readSettings()
{
    chrome.storage.sync.get({
        teamSize: '1',
        workingHours: '8',
	workInProgressColumnName: '',
	doneColumnPrefix: '',
    }, function(items){
        console.log('Read settings', items);
        SETTINGS = items;
        SETTINGS.teamSize = ~~SETTINGS.teamSize;
        SETTINGS.workingHours = ~~SETTINGS.workingHours;
    });
}

function waitForTrelloInit()
{
    // Read settings first - they are async so we have to poll for them also
    readSettings();

    // Polling always work
    var interval = setInterval(function(){
        var startPlugin = false;
        if(jQuery('.badge-text:contains("Estimate")').length > 0 &&
                Object.keys(SETTINGS).length > 0){
            startPlugin = true;
        }

        if(startPlugin){
            clearInterval(interval);
            countEstimates();
	    countBurnedTime();
        }
    }, 500);
}

window.addEventListener('load', waitForTrelloInit, false);
