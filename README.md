Project_graham

Project_graham is a simple multipage, mobile application for managing school courses and personal course notes. It is an digital notebook binder. It is built with Expo, React Native, TypeScript, Expo Router, and Expo SQLite as additional for storing data locally.

The app lets students add courses, view course details, save notes, search courses, and manage deleted items through a trash feature.

FEATURES
- Add a course with its course code, title, units, year level, instructor, schedule, and room
- View the complete details of a saved course
- Search for a course by its code or title
- Add notes to a specific course
- Delete courses and notes by moving them to the trash
- Restore deleted courses and notes from the trash
- Permanently delete items from the trash
- Store course and note data locally using SQLite
- Display a random study advice message from an external API
- Refresh the course list, trash data, and advice message by pulling down on the screen

USAGE
- Open the app to view the list of saved courses
- Use the search bar to find a course by course title or course code
- Select Add Course from the bottom navigation to create a new course
- Fill in the required course code and course title fields, then select Save course
- Select a course card to open its details page
- Write a note in the note field and select Add note to save it to the selected course
- Select the trash button beside a course to move it to the trash
- Open Trash from the bottom navigation to restore or permanently delete courses and notes
- Pull down on the home or trash screen to reload the saved data

API
- The application uses the Advice Slip API to show a random advice message on the home screen
- Endpoint used

```text
https://api.adviceslip.com/advice
```

- The API is called when the home screen opens and when the user refreshes the page
- An internet connection is required only for loading the advice message
- Course and note data still works offline because it is stored locally in SQLite

REQUIREMENTS
- Node.js
- npm
- Expo Go on smartphone device, or phone emulator

PROJECT STRUCTURE
- app
  - _layout.tsx
    - Sets up the stack navigation and wraps the app with the course data provider
  - index.tsx
    - Home screen that displays, searches, refreshes, and deletes courses
  - add_course.tsx
    - Form screen for creating a course
  - details.tsx
    - Course details screen where notes can be added and deleted
  - trash.tsx
    - Screen for restoring or permanently deleting courses and notes
- components
  - bottom_nav.tsx
    - Reusable bottom navigation component
- context
  - course_context.tsx
    - Manages course, note, trash, and loading state across the application
- database
  - course_repo.tsx
    - Contains SQLite database setup and all database operations
- app.json
  - Contains Expo application configuration
- package.json
  - Contains scripts and project dependencies

DATA STORAGE
- Expo SQLite is used to save data on the device
- The application creates courses and notes tables when it starts
- Deleted courses and notes are soft deleted first so they can be restored from the trash
- Permanently deleting a course also removes its related notes

TECHNOLOGIES USED
- Expo SDK 54
- React Native
- TypeScript
- Expo Router
- Expo SQLite
- React Context API
- Advice Slip API

SETUP
- Clone or download this repository
- Open a terminal in the project folder
- Install the project dependencies

```bash
npm install

npx expo install expo-sqlite
```

- Start the Expo development server

```bash
npx expo start

or

npx expo start --tunnel -c
```

- Scan the QR code using Expo Go,


NOTES
- The application is designed mainly for portrait mobile screens
- The advice message may not load if there is no internet connection or if the external API is unavailable
- Course data is saved only on the device where the application is used
