var SETTINGS = {};

function isWorkingDay(date)
{
    //TODO: support holidays (preferrably configurable country in settings)
    var WEEKEND_DAYS = [6, 7];

    return !(date.isoWeekday() == 6 || date.isoWeekday() == 7);
}

function getTotalHoursInSprint(sprintTitle)
{
    var teamSize = SETTINGS.teamSize;
    var personHours = 0;

    //Extract sprint dates from title
    var match = /((\d{2})\.(\d{2})\.(\d{4})) - ((\d{2})\.(\d{2})\.(\d{4}))/g.exec(sprintTitle);
    if(match === null){
        return 0;
    }

    var fromDate = moment(match[1], 'DD.MM.YYYY');
    var toDate = moment(match[5], 'DD.MM.YYYY');

    var diff = toDate.diff(fromDate, 'd') + 1; // We include starting day too
    if(diff < 0){
        return 0;
    }

    var tempDate = fromDate.clone();
    while(tempDate.isBefore(toDate, 'd') || tempDate.isSame(toDate, 'd')){
        console.log(tempDate.format('DD.MM.YYYY'));
        if(!isWorkingDay(tempDate)){
            --diff;
        }

        tempDate.add(1, 'd');
    }

    console.log(diff, SETTINGS.workingHours, teamSize);

    var diffInHours = diff * SETTINGS.workingHours;

    return teamSize * diffInHours;
}

function countEstimates()
{
    jQuery('.list-header-name-assist').each(function() {
        var header = jQuery(this);
        var estimates = 0;
        header.parent().parent().find('.badge-text:contains("Estimate")').each(
            function(el) {
                var h = jQuery(this).html();
                var r = /(\d+)/g.exec(h);
                estimates += ~~r[0];
            }
        );
        var totalHours = getTotalHoursInSprint(header.html());
        var totalHoursLabel = jQuery('<p>').html('<b>Total Hours:</b> ' + totalHours);
        var estimationLabel = jQuery('<p>').html('<b>Total Estimation:</b> ' + estimates.toString() + ' hours');
        
        estimationLabel.insertAfter(header);
        if(totalHours > 0){
            totalHoursLabel.insertAfter(header);
        }
    });
}

function readSettings()
{
    chrome.storage.sync.get({
        teamSize: '1',
        workingHours: '8',
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
        }
    }, 500);
}

window.addEventListener('load', waitForTrelloInit, false);
