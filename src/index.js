import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDuMpMzuZwnpwM2R2OzHn7OPluV1WIPyVc",
  authDomain: "mynotes-831de.firebaseapp.com",
  databaseURL: "https://mynotes-831de.firebaseio.com",
  projectId: "mynotes-831de",
  storageBucket: "mynotes-831de.appspot.com",
  messagingSenderId: "746032959130",
  appId: "1:746032959130:web:adb8473604fc9726cdd923",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// // Login Button
// const btnLogin = document.getElementById("loginButton");

// // Login Button Authentication onClick
// btnLogin.addEventListener("click", (event) => {
//   event.preventDefault();
//   console.log("login Klick");
//   firebase.auth().signInAnonymously();
// });

// firebase.auth().onAuthStateChanged(function (user) {
//   if (user) {
//     // User is signed in.
//     var isAnonymous = user.isAnonymous;
//     var uid = user.uid;
//     btnLogin.classList.toggle("loginButtonVerstecken");
//     console.log(uid);
//   } else {
//     // User is signed out.
//     // ...
//   }
//   // ...
// });

ReactDOM.render(<App />, document.getElementById("root"));
