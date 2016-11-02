function saveOptions(e)
{
    var teamSize = document.getElementById('team_size').value;
    var workingHours = document.getElementById('working_hours').value;

    chrome.storage.sync.set({
        teamSize: teamSize,
        workingHours: workingHours
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
    }, function(items){
        document.getElementById('team_size').value = items.teamSize;
        document.getElementById('working_hours').value = items.workingHours;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions)
