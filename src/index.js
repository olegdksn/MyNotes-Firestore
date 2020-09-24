import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const firebase = require("firebase");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBuRqhdjDoX_9bvz3E2fDcKLQaPK5yeqlA",
  authDomain: "notesapp-77983.firebaseapp.com",
  databaseURL: "https://notesapp-77983.firebaseio.com",
  projectId: "notesapp-77983",
  storageBucket: "notesapp-77983.appspot.com",
  messagingSenderId: "864309588180",
  appId: "1:864309588180:web:eab9c9bcc5c0bf010f4b41",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.getElementById("root"));
