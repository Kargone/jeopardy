# Jeopardy

A browser app for building Jeopardy-style quiz boards and hosting games with them, for example in a classroom. One person runs the game on a shared screen while 2 to 5 teams play. Boards and games are saved to the host's account with Firebase.

It is plain HTML, CSS, and JavaScript, with no build step and nothing to install.

## Features

**Boards**
- Normal, Double, and Final Jeopardy rounds, each of which can be turned on or off
- Adjustable number of topics and questions per topic
- Custom colors, timer lengths, and dollar values
- Editable titles, topics, and dollar values
- Images in questions, added by URL
- Daily doubles on any question in the Normal and Double rounds
- A preview for each question
- Folders, with drag and drop, for organizing boards

**Games**
- 2 to 5 teams with running scores
- A timer for each question, which can be stopped and reset
- Wagers for daily doubles and Final Jeopardy
- A team order display that moves to the next team after each question
- Optional keyboard shortcuts for revealing answers and returning to the board
- Saved progress, so a game can be reopened later

## Running it locally

The scripts are JavaScript modules, so opening `index.html` directly as a file won't work. Serve the folder with any static web server:

```sh
git clone https://github.com/Kargone/jeopardy.git
cd jeopardy
python -m http.server 8000
```

Then open <http://localhost:8000>. You need an internet connection, since the Firebase SDK is loaded from Google's CDN and your data is stored online. Allow pop-ups so that the Google sign-in window can open.

## How to use it

### 1. Sign in

Click **Sign In** and choose a Google account.

### 2. Create a board

Click **Create a Board**, choose your options, and click **Create Board**. The options are:

| Section | What it controls |
| --- | --- |
| Size/Name | Board name, number of topics, and questions per topic |
| Timer | Timer lengths, and the delay before the timer starts (in seconds) |
| Boards | Which rounds to include |
| Colors | Title, topic, dollar value, background, question, and answer colors |
| In Question | Whether images are allowed, and the shortcut keys |
| Equations for Dollar Value | How dollar values are calculated |

Dollar values use `multiplier × row + offset`. A multiplier of 100 and an offset of 0 gives $100, $200, $300, and so on down each topic. (The form labels the row "topic number".)

To set a shortcut key, click its button and press the key. Press Control to reset it to `NA`.

The starting values on this page come from **Settings**, where you can change your defaults.

### 3. Fill in the board

- Click a dollar value to edit its question, answer, image URL, and timers.
- Use **Make Daily Double** or **Unmake Daily Double** inside a question.
- Turn on **Edit Text** to change the title, topics, and dollar values.
- Turn on **Show DDs** to see which questions are daily doubles.
- Use **Preview** to see how a question will look.
- Use **Next Board** to move between rounds.

### 4. Organize boards

Click **Edit Boards** to edit, copy, rename, or delete boards. Drag a board or folder onto a folder to move it in, or onto **Back** to move it out. **Delete** must be clicked twice quickly. Deleting a folder keeps the boards that were inside it.

### 5. Play

1. Click **Create a Game** and double-click a board.
2. Add 2 to 5 teams and click **Create Game**. Give each team a different name.
3. Click a dollar value to open the question. The timer starts after the delay you set.
4. Use each team's **+** and **-** buttons to change its score.
5. Click **Reveal Answer**, then **Board** to go back.

For a daily double, enter the wager before clicking **Reveal Question**. For Final Jeopardy, enter a wager for each team. If the wrong team is highlighted on the board, click the correct team's name.

To continue a game, choose **Load a Game** from the home screen.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | All of the app's screens, shown and hidden by the script |
| `script.js` | App logic, including the `Board` and `Question` classes, games, folders, and settings |
| `firebase-sign-in.js` | Sign-in, and loading or creating the user's data |
| `style.css` | Styles |
| `board.png`, `folder.png` | Icons |

## Using your own Firebase project

1. Create a Firebase project and add a web app to it.
2. In **Authentication**, enable the **Google** and **Email/Password** providers.
3. Add the domain you will host on to the authorized domains, including `localhost` for local use.
4. Create a **Realtime Database**, with rules that limit each user to their own data:

   ```json
   {
     "rules": {
       "users": {
         "$uid": {
           ".read": "auth != null && auth.uid === $uid",
           ".write": "auth != null && auth.uid === $uid"
         }
       }
     }
   }
   ```

5. Replace `firebaseConfig` in **both** `script.js` and `firebase-sign-in.js`.

Each user's data is stored under `users/<uid>`:

| Key | Contents |
| --- | --- |
| `game_boards` | Saved boards |
| `active_games` | Games that have been started, with teams and scores |
| `default_board` | Default board settings |
| `folders` | Folder paths |

## Known issues

- The **Team order viewer** option doesn't currently hide the team order.
- A starting score that is typed in may not be saved. Click the number field again after typing it.
- Folder names need to be unique, even when the folders are in different places.
