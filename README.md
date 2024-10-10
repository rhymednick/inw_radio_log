(Incomplete doc - work in progress)

# Ignition Northwest Radio Log

This application provides a self-service interface that allows users to quickly log the radios that they've taken
posession of and/or returned.

## User Guide

TBD

## Administrator Guide

This application is built using TypeScript with the Next.js framework. UI components are provided by ShadcnUI and
styling features are provided by Tailwindcss. It will run locally on any OS platform and is accessed through a browser.

### Installation

Since this tool is built with web technologies, it does not rely on any particular OS platform to run. However, for
simplicity, only Windows instructions are provided.

#### Install the prerequisite tools

**Node.js** - (required) Node.js is the local host for the web application. Install the latest version from
https://nodejs.org/en/download/prebuilt-installer.

**GitHub Desktop w/CLI** - (optional) GitHub Desktop is used to retrieve the application source files and upload the
modified data files at the end of the event. There are numerous ways to retrieve and modify files in a GitHub repository
and any of them would work. GitHub desktop is just a common one. Install the latest version from
https://central.github.com/deployments/desktop/desktop/latest/win32.

#### Install and Run Application

1. Download source files from GitHub - https://github.com/rhymednick/inw_radio_log.git
2. From source root (the place with package.json), run `npm install`.
3. Note host URL and open it. Default: http://localhost:3000.

### Data Preservation

To preserve the data after your event...

### Troubleshooting

TBD - After review and testing, let's see what issues come up.

## Site Map

### Web Endpoints

-   `/` - Main end-user entry point for checking out radios.
-   `/admin/` - Central location for admin operations. Not intended for end-user use. Since the database is easy to
    rebuild from GitHub, there is no security. Anyone that can find this page can use it.
-   `/admin/radios/` - Tool for editing the radios database. Radios can be added or deleted, and have their settings
    modified (including who they are checked out to).
-   `/admin/users/` - Tool for editing the users database. New users can be added but not removed; this feature may be
    added in the future. Username and profile photos can be changed here.

### API Endpoints

The API endpoints are listed here for documentation purposes, but are not intended to be called directly by application
code. The backend database features are provided by LowDB. This provider is a thin wrapper over direct file operations,
so it doesn't support concurrent users. If operations are completed out of order, weird things happen. Therefore,
database access operations are provided to the application via helper methods at `/lib/api.ts`. **IMPORTANT** If you're
adding to the source code and want to access the API endpoints for any reason, ONLY do it through a method that you add
to this `/lib/api.ts`. This makes it much easier to debug database or data-access issues.

-   `/api/admin/archive-log/` - (POST) Call this endpoint to backup the checkout log.
-   `/api/admin/backup-user-database/` - (POST) Call this endpoint to backup the user database.
-   `/api/admin/checkout-log/` - (GET, POST) Call this endpoint to retrieve the ledger of past checkout operations or
    add new ones.
-   `/api/admin/init-user-database/` - (POST) Call this endpoint to create a new user database from the list of leads
    for Critical Northwest 2024.
-   `/api/admin/radios/` - (GET, POST, DELETE) Call this endpoint to manage the radios database.
-   `/api/admin/users/` - (GET, POST, DELETE) Call this endpoint to manage the users database.
