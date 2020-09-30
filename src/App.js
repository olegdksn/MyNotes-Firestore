import React, { useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";

import "./App.css";
import { motion, AnimatePresence } from "framer-motion";

const firebase = require("firebase");

//! Editor Component
const editor = new EditorJS({
  /**
   * Id of Element that should contain Editor instance
   */
  holder: "editorjs",
  tools: {
    header: {
      class: Header,
      shortcut: "CMD+SHIFT+H",
    },
  },
});

let timeStamp = String(Date.now());
let timeNow = new Date();
let datumJetzt = timeNow.toLocaleString("en-GB", { timeZone: "Asia/Brunei" });

//! Ende Editor

function App() {
  const [notes, setNotes] = useState(["abc"]);
  const [notesIDandName, setNotesIDandName] = useState(["abc"]);
  const [counter, setCounter] = useState(1);
  const [noteName, setNoteName] = useState(null);
  const [istVersteckt, setIstVersteckt] = useState(true);

  const [inputWert, setInputWert] = useState("Name");

  const [trashVersteckt, setTrashVersteckt] = useState(false);
  const [notesListMitY, setNotesListMitY] = useState([]);

  let tempNotes = [];
  let tempNotesIDandName = [];

  useEffect(() => {
    firebase
      .firestore()
      .collection("notes")
      .orderBy("yWert")
      .get()
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          tempNotes.push(doc.data());
          let tempidtext = [
            doc.id,
            doc.data().nameDerNote, /// Das ist der Eintrag mit dem aktuellen Datum wenn kein Name eingegeben wurde.
            doc.data().blocks[0].data.text,
            doc.data().yWert,
          ];
          tempNotesIDandName.push(tempidtext);
        });
      })

      .then(setNotes(tempNotes)) ///...///...///.../// Problem:   Der State wird erst nach naechstem Render step geupdated. Deswegen hab ich den CounterButton als Test reingetan
      .then(setNotesIDandName(tempNotesIDandName));
  }, []);

  //// Counter Button um State zum updaten zu zwingen

  function counterButton() {
    setCounter(20);
  }

  //// Y - Werte für alle Liste-Items zu speichern

  // Y-Werte sollen von Firestore ausgelesen werden

  function yWerteBerechnen() {
    let tempNotesListForY = notesIDandName;
    tempNotesListForY.forEach((item) => {
      let yWertVomItem = document
        .getElementById(item[0])
        .getBoundingClientRect().y;

      item[3] = yWertVomItem;
    });

    setNotesListMitY(notesIDandName);
  }

  //// Input Handler vom NamenFeld

  function handleInputChange(event) {
    setInputWert(event.target.value);
  }

  //// Neue Note Speichern

  function noteSpeichern() {
    editor.save().then((outputData) => {
      console.log("Article data: ", outputData);
      if (noteName == null) {
        if (inputWert == "Name" || inputWert == "") {
          firebase
            .firestore()
            .collection("notes")
            .doc(timeStamp)
            .set({ ...outputData, ...{ nameDerNote: datumJetzt, yWert: 0 } });
          let tempVorherigeNotes = notesIDandName;
          tempVorherigeNotes.unshift([timeStamp, datumJetzt, outputData]);
          setNotesIDandName(tempVorherigeNotes);
        } else {
          firebase
            .firestore()
            .collection("notes")
            .doc(timeStamp)
            .set({ ...outputData, ...{ nameDerNote: inputWert, yWert: 0 } });
          let tempVorherigeNotes = notesIDandName;
          tempVorherigeNotes.unshift([timeStamp, inputWert, outputData]);
          setNotesIDandName(tempVorherigeNotes);
        }
      } else {
        // noteName ist die Document ID , d.h. wenn die Note bereits existiert, dann ist (noteName != null) und es gibt (inputWert != "")
        firebase
          .firestore()
          .collection("notes")
          .doc(noteName)
          .set({ ...outputData, ...{ nameDerNote: inputWert, yWert: 0 } });
      }
    });

    // Liste der Notes soll geupdated werden mit neuem Namen falls Input Name anders ist.
    // d.h. die im State geladenen Notes werden durchsucht nach der geöffneten Note ID ( = noteName ) und der entsprechende Name wird durch inputWert ersetzt.
    notesIDandName.forEach((item) => {
      if (item[0] == noteName) {
        item[1] = inputWert;
      }
    });
  }

  //// Klick auf Note in Sidebar

  function clickSidebarNote(event) {
    setNoteName(event.target.id);
    firebase
      .firestore()
      .collection("notes")
      .doc(event.target.id)
      .get()
      .then((antwort) => {
        console.log(antwort.data());
        editor.render(antwort.data());
        setInputWert(antwort.data().nameDerNote); // Name der Note wird in Inputfeld als Value eingetragen.
      });
  }

  //// DRAG Operations //////////////////////////////////////////////////////////////////////////////////////////////

  let draggableNoteY = [0, 0];

  function whileDragging(event) {
    console.log(
      "Anfangswert ",
      document.getElementById(event.target.id).getBoundingClientRect().y
    );

    if (event.clientY !== 0) {
      draggableNoteY[0] = event.target.id;
      draggableNoteY[1] = event.clientY;
    }

    // console.log("aktueller Wert ", event.clientY);
  }

  function startNoteDrag(event) {
    setTrashVersteckt(true);
    event.dataTransfer.setData("text/plain", event.target.id);

    console.log(event.target.id, "note wird gedragged");
  }

  const endNoteDrag = (event) => {
    event.preventDefault();
    console.log(event.dataTransfer.getData("application/my-app"));
    setTrashVersteckt(false);
    console.log(
      "letzter Punkt Y ",
      draggableNoteY[1],
      "von ID: ",
      draggableNoteY[0]
    );

    notesListMitY.forEach((item) => {
      if (item[0] === draggableNoteY[0]) {
        item[3] = draggableNoteY[1];
      }
    });
    console.table(notesListMitY);

    // Sortiere notesListMitY nach dem Y-Wert bei Index 3
    let tempnotesListMitY = notesListMitY;
    tempnotesListMitY.sort(
      (function (index) {
        return function (a, b) {
          return a[index] === b[index] ? 0 : a[index] < b[index] ? -1 : 1;
        };
      })(3)
    );
    setNotesIDandName(tempnotesListMitY);

    // Speichere alle Y-Werte in Firestore ab:

    notesIDandName.forEach((item) => {
      firebase.firestore().collection("notes").doc(item[0]).set(
        {
          yWert: item[3],
        },
        { merge: true }
      );
    });
  };

  function noteDragOver(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    console.log(data);
  }

  function noteDropTrash(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    console.log(data, "wird geloescht");
    firebase
      .firestore()
      .collection("notes")
      .doc(data)
      .delete()
      .then(function () {
        console.log("Document successfully deleted!");
      })
      .catch(function (error) {
        console.error("Error removing document: ", error);
      });

    let tempnotesIDandName = [];
    let gesuchtesItem;
    notesIDandName.forEach((item) => {
      if (item[0] == data) {
        gesuchtesItem = item;
      }
    });
    console.log(gesuchtesItem);
    tempnotesIDandName = notesIDandName.filter(function (element) {
      return element != gesuchtesItem;
    });
    setNotesIDandName(tempnotesIDandName);
  }

  //// Ende DRAG ///// //////////////////////////////////////////////////////////////////////////////////////////////

  //// RETURN Render

  return (
    <div>
      <div className="wrapperDiv">
        <motion.div
          className="cssSidebarDiv"
          onHoverStart={() => {
            counterButton();
            setIstVersteckt(true);
            yWerteBerechnen();
          }}
          onHoverEnd={() => {
            setIstVersteckt(false);
          }}
        >
          <div id="listeMitNotes">
            <AnimatePresence>
              {istVersteckt && (
                <motion.ul
                  className="cssSidebarListe"
                  initial={{ x: -1000 }}
                  animate={{ x: 0 }}
                  exit={{ x: -1000 }}
                >
                  {notesIDandName.map((item) => (
                    <li
                      key={item[0]}
                      id={item[0]}
                      className="cssSidebarNotes"
                      onClick={(event) => {
                        clickSidebarNote(event);
                      }}
                      draggable="true"
                      onDragStart={(event) => startNoteDrag(event)}
                      onDragEnd={(event) => endNoteDrag(event)}
                      onDrag={(event) => {
                        whileDragging(event);
                      }}
                    >
                      {item[1] ? item[1] : "keinname"}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {/* <ul>
            {notes.map((item) => (
              <li key={item.inhalt}>{item.data}</li>
            ))}
          </ul> */}
        </motion.div>
        <div className="cssRechteSeite">
          <div id="editordiv">
            <div id="editorjs"></div>
          </div>
          {trashVersteckt && (
            <div
              id="trashFeld"
              onDragOver={noteDragOver}
              onDrop={noteDropTrash}
            >
              <p>Trash</p>
            </div>
          )}
          <div id="inputDIV">
            <input
              id="nameInput"
              placeholder="Name"
              maxLength="20"
              value={inputWert}
              onChange={handleInputChange}
            ></input>
          </div>
          <button
            onClick={() => {
              noteSpeichern();
            }}
            className="cssButtonSpeichern"
            id="speichernButtonID"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
