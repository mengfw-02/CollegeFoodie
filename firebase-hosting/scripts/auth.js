var firebaseConfig = {
      
    apiKey: "AIzaSyAMHutTkg_Pp54iMrYDX3NqDLhRhJo2Lyw",

    authDomain: "college-foodie.firebaseapp.com",

    projectId: "college-foodie",

    storageBucket: "college-foodie.appspot.com",

    messagingSenderId: "1072876126182",

    appId: "1:1072876126182:web:87a17b1ad3a26b8d89e027",

    measurementId: "G-8LWH2KZ4DD"

};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
let unsubscribe = () => {}; 
username = '';
auth.onAuthStateChanged(user => {
    if (user) {    
        unsubscribe =  db.collection('matrix').onSnapshot(snapshot => {
            setupGuides(snapshot.docs);
            matrix = recommending(snapshot.docs);
            rec = recommendation_eng(matrix, username, pearson_correlation);
           

            


            
        })
        setupUI(user);
    } else {
        setupUI();
        setupGuides([]);
        unsubscribe();
    }
});
//create new guide
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    

    db.collection('matrix').add({
        food: createForm['title'].value,
        rating: createForm['content'].value,
        name: username,
    }).then(() => {
        //close the modal and reset form
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createForm.reset;
        const recommend = document.querySelector('.recommend');
        var text = document.createTextNode("Users similar to you also enjoy: Papaya");
        recommend.appendChild(text);
    }). catch (err => {
        console.log(err.message);
    })
})
//sign up
const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info

    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    //sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset;
        username = cred.user.email;
    });
});

//logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
});

//login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    //get user email
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;
    auth.signInWithEmailAndPassword(email, password).then(cred => {
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset;
        username = cred.user.email;
    });
});

//return a matrix for recommendation

