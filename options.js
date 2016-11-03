function saveOptions(e)
{
    var teamSize = document.getElementById('team_size').value;
    var workingHours = document.getElementById('working_hours').value;
    var workInProgressColumnName = document.getElementById('work_in_progress_column_name').value;
    var doneColumnPrefix = document.getElementById('done_column_prefix').value;

    chrome.storage.sync.set({
        teamSize: teamSize,
        workingHours: workingHours,
        workInProgressColumnName: workInProgressColumnName,
        doneColumnPrefix: doneColumnPrefix,
    }, function(){
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';

        setTimeout(function() {
            status.textContent = '';
        }, 1500);
    });

    e.preventDefault();
}

function restoreOptions()
{
    chrome.storage.sync.get({
        teamSize: '1',
        workingHours: '8',
	workInProgressColumnName: '',
	doneColumnPrefix: '',
    }, function(items){
        document.getElementById('team_size').value = items.teamSize;
        document.getElementById('working_hours').value = items.workingHours;
        document.getElementById('work_in_progress_column_name').value = items.workInProgressColumnName;
        document.getElementById('done_column_prefix').value = items.doneColumnPrefix;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions)
