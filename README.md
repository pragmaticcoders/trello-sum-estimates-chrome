# trello-sum-estimates-chrome

This is a library for extending functionality of Trello. Currently it adds support for sprints in Trello.
You can manage working hours per day, your team size. It integrates with Trello`s estimation feature.

## Status of current sprint
Status of current sprint is calculated based on Work in Progress column (WIP), TODO column and Done column.

Their names need to be configurated in config first.


## Base setup
Team size: adjust to your needs, ex. 1

Working hours: adjust to your needs, ex. 8

Work in progress column name: we use only one WIP column so it's named "WIP"

Done column prefix: we use Done columns for each sprint different, and all of those starts with "Done"

## Sprint hours calculation
In order to calculate how much hours can be burned in sprint, you have to put dates in your column name with current Todo for sprint.

Accepted format: DD.MM.YYYY

So it should look like: 07.12.2016-14.12.2016

This way plugin will know how many days sprint have.
