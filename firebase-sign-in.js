import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup,
    GoogleAuthProvider,
    EmailAuthProvider,
    linkWithCredential,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { 
    getDatabase,
    child,
    ref,
    set,
    get,
    push, 
    update,
    remove
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";
import { setUserData, setUserId } from "./script.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbFg-ax7FMV5FiNqsAE2ZNXhKB3FMQBWE",
  authDomain: "jeopardy-a365e.firebaseapp.com",
  databaseURL: "https://jeopardy-a365e-default-rtdb.firebaseio.com",
  projectId: "jeopardy-a365e",
  storageBucket: "jeopardy-a365e.appspot.com",
  messagingSenderId: "834996600275",
  appId: "1:834996600275:web:d8588aafc0d2b0fecac326"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getDatabase(app);
const dbRef = ref(getDatabase(app));
if (localStorage.getItem('jeopardy-user-data') === null) {
    document.getElementById("sign-in-container").style.display = 'inline-grid';
    document.getElementById("home-container").style.display = 'none';
    document.getElementById("sign-in").addEventListener('click', async function () {
        if (localStorage.getItem('jeopardy-user-data') != null) {
            document.getElementById("sign-in-container").style.display = 'none';
            document.getElementById("home-container").style.display = 'inline-grid';
            return;
        }
        const userCred = await signInWithPopup(auth, new GoogleAuthProvider());
        console.log(userCred);
        console.log(userCred.user.email, userCred.user.uid);
        const credential = EmailAuthProvider.credential(userCred.user.email, userCred.user.uid);
        console.log(credential);
        await linkWithCredential(auth.currentUser, credential)
        .then((usercred) => {
            const user = usercred.user;
            console.log("Account linking success", user);
        }).catch((error) => {
            console.log("Account linking error", error);
        });
        localStorage.setItem('jeopardy-user-cred', JSON.stringify(userCred.user));
        document.getElementById("sign-in-container").style.display = 'none';
        document.getElementById("home-container").style.display = 'inline-grid';
        connectToDatabase(userCred.user.uid);
    });
} else {
    const googleUserCred = JSON.parse(localStorage.getItem('jeopardy-user-cred'));
    await signInWithEmailAndPassword(auth, googleUserCred.email, googleUserCred.uid)
    .then((userCredential) => {
        console.log(userCredential)
        const user = userCredential.user;
        const userId = user.uid;
        connectToDatabase(userId);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('Sign in with email/password fail');
        console.log(errorCode, errorMessage);
    });
}

function connectToDatabase(userId) {
    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log('Retrived data')
            const userData = snapshot.val();
            localStorage.setItem('jeopardy-user-data', JSON.stringify(userData));
            setUserData();
        } else {
            console.log('Creating new player node');
            set(ref(db, `users/${userId}`), {
                'game_boards': 'empty',
                'default_board': {
                    'name': 'Name here...',
                    'normal-jeopardy-topic-amount': 5,
                    'normal-jeopardy-question-amount': 5,
                    'double-jeopardy-topic-amount': 5,
                    'double-jeopardy-question-amount': 5,
                    'timer-delay': 5,
                    'timer-length-normal': 30,
                    'timer-length-daily-double': 60,
                    'normal-jeopardy': true,
                    'double-jeopardy': true,
                    'final-jeopardy': true,
                    'title-color': '#f8ff00',
                    'topic-color': '#ffffff',
                    'question-board-color': '#f8ff00',
                    'background-color': '#073763',
                    'answer-color': '#ffffff',
                    'question-color': '#ffffff',
                    'images-allowed': true,
                    'key-reveal-answer': 'NA',
                    'key-go-home': 'NA',
                    'normal-jeopardy-m': 100,
                    'normal-jeopardy-b': 0,
                    'double-jeopardy-m': 200,
                    'double-jeopardy-b': 0
                },
                'folders': ['main/']
            });
        }
        localStorage.setItem('jeopardy-user-id', JSON.stringify(userId));
        setUserId();
    }).catch((error) => {
        alert('Fail to get database');
        console.log(error);
    });
}