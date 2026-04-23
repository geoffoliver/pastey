# Overview

This is a webapp that lets people share images. It has two interfaces - the sharing UI and the viewing UI. No login is required, no editing is allowed, and images are automatically deleted after 1 week, or sooner if the user configures it.

# Sharing UI

When a user accesses the app, they should be presented with a blank page that contains the message "Paste or drag/drop your image". When a user presses ctrl/cmd+v or drags an image onto the page, it should display a preview of the image, options to let the user configure when the image should be deleted and a very hard-to-miss "share" button. The app should only allow users to upload images that are either PNG, JPG, or WEBP format, or image data from the system clipboard. If a user tries to upload an invalid file type (i.e., an unsupported image format or other non-image file), the app should display an error. When the "share" button is clicked, the image should be uploaded to the server (and a progress bar should be displayed while that is happening) into a directory structure like "APP_ROOT/uploads/YYYY/MM/DD/filename.webp" where "APP_ROOT" is the directory where the app is running (i.e. "process.cwd()"), "YYYY" is the full current year, "MM" is the current month number with a leading zero, "DD" is the date with a leading zero, "filename" is a random UUID. Uploaded images should be converted to webp, have all metadata/exif data removed, and the original image discarded. Once the image is uploaded, the URL to the file should be copied to the users clipboard, and they should be redirected to the "viewing UI" for the image they just uploaded.

## Deletion options

The default (and longest) deletion option should be "1 week". There should options for:
- 1 hour
- 12 hours
- 1 day
- 3 days
- 5 days

Additionally, there should be a checkbox option for "Delete after viewing" that, when checked, reveals another field that allows the user to enter a number into the field. If a user chooses the "Delete after viewing" option, the file will be deleted as soon as its view count reaches the set number or at the deletion date, whichever comes first. And since bots might scrape these links (for link previews and whatnot) make sure that those views don't count against the view count, so things won't get deleted prematurely.

### Deletion mechanism

Deletion should run on a schedule and check for new deletions every 30 minutes.

# Viewing UI

There isn't really a UI - just display the image or an error if the image doesn't exist (was deleted or never existed). The URL for the viewing UI can be a direct URL to the file (i.e., using `express.static`) but the app will need to track views so files can be deleted when necessary.

# Tech Stack

Package manager: yarn
Language: Typescript
Runtime: Bun
Scheduling: "cron" npm module (https://www.npmjs.com/package/cron)
Datastore: SQLite
Web Server: Express

## Other details

All the code should live in a "src" directory.

Any HTML that gets rendered should be separated out into template files and use EJS for templating features.

Keep an updated README.md that includes instructions for installing and running the app.

Configuration options should be kept in a `config.json` file.

Whenever I tell you to "commit your changes", you should ask me which version number to update in the package.json (major, minor, or patch), then update the package.json accordingly. After that, run `git diff`, and summarize the results in CHANGELOG.md under a heading with the new version number. Finally, run `git add --all`, followed by `git commit -m [message]` replacing "[message]" with a short commit message, and finally `git push`.
