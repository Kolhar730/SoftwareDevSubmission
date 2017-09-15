'use strict';

var config = {
  apiKey: "AIzaSyDruZl-qsV2PMkzlUqZcQKqlgTyJkfLW5o",
  authDomain: "sf-dev-a1b8c.firebaseapp.com",
  databaseURL: "https://sf-dev-a1b8c.firebaseio.com",
  projectId: "sf-dev-a1b8c",
  storageBucket: "sf-dev-a1b8c.appspot.com",
  messagingSenderId: "996684137875"
};
firebase.initializeApp(config);

var database = firebase.database();
var storage = firebase.storage();

let imageGrid = document.getElementById('container-grid');
let universalSignOut = document.getElementById('signOutBtn');
let profile = document.getElementById('profile-section');
//let uploader = document.getElementById('upload-progress');
let grid = document.getElementById('container-grid');
let fileButton = document.getElementById('image-upload');

const fireUser = firebase.auth().currentUser;

function writeToDB(postName, pictureUrl, price, postDesc,uid, postKey, date) {
  database.ref(`/users/${uid}/posts/${postKey}/`).set({
        postName: postName,
        postDesc: postDesc,
        pictureUrl: pictureUrl,
        likes: 0,
        price: price,
        date: date
  });
}


var price = "2$";
var postDesc = "A very nice thing.";
var postName = "Trial";

let someRandomURL = "";

var dateNow = formatDate(new Date());

firebase.auth().onAuthStateChanged(function(fireUser) {
    if(fireUser) {
      var name = fireUser.displayName;
      document.getElementById('profile-name').innerHTML = fireUser.displayName;
      var photo = document.createElement('img');
      photo.src = firebase.auth().currentUser.photoURL;
      photo.width = 35;
      photo.height = 35;
      photo.title = fireUser.displayName;
      photo.style.marginRight = "10px";
      photo.style.borderRadius = "50%";
      photo.border = "2px solid #000";
      profile.appendChild(photo);

      var uid = fireUser.uid;

      firebase.database().ref(`/feed/`).orderByChild(`/feed/`).on('value', function(data) {
        var main = data.val();
        var keys = Object.keys(main);
        console.log(keys);
        for (var i = keys.length-1; i>=0;i--){
          var k = keys[i];
          var nameOfPerson = main[k].postBy;
          var download = main[k].imageURL;

          var div = document.createElement('div');
          div.className = 'grid-member';
          grid.appendChild(div);
          var personUploaded = document.createElement('h3');
          personUploaded.innerHTML = nameOfPerson;
          div.appendChild(personUploaded);
          var img = document.createElement('img');
          img.src = download;
          img.width = 50;
          img.height = 75;
          div.appendChild(img);
      }});


      fileButton.addEventListener('change', function(e){
        if (fireUser) {
          var file = e.target.files[0];
          var postKey = database.ref().child('feed').push().key;
          var storageRef = storage.ref(`users/${uid}/` + file.name);

          var task = storageRef.put(file);
          task.on('state_changed',
              function progress(snapshot) {
                var percentageUploaded = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  if (percentageUploaded === 100){
                    storage.ref().child(`/users/${uid}/${file.name}`).getDownloadURL().then(function(url) {
                        someRandomURL = url;
                        database.ref(`/feed/${postKey}/`).set({
                          imageURL: someRandomURL,
                          postName: postName,
                          postBy: name,
                          price: price,
                          postDesc: postDesc,
                          date: dateNow
                        });
                      }).catch(function(error) {
                        console.log(error);
                      });
                  }
              },
              function error(err) {
                console.log(err);
              },
              function complete() {
                console.log("Upload completed successfully!");
                writeToDB(postName, storageRef.fullPath,price,postDesc,uid, postKey, dateNow);
              }
          );

          let feedRef = database.ref().child('feed');

          feedRef.orderByChild(`/feed/${postKey}`).on('child_added',function(data) {
            var main = data.val();
            var keys = Object.keys(main);
            console.log(keys);
            for (var i = 0; i<keys.length;i++){
              var k = keys[i];
              var nameOfPerson = main[k].postBy;
              var download = main[k].imageURL;

              var div = document.createElement('div');
              div.className = 'grid-member';
              grid.appendChild(div);
              var personUploaded = document.createElement('h3');
              personUploaded.innerHTML = nameOfPerson;
              div.appendChild(personUploaded);
              var img = document.createElement('img');
              img.src = download;
              img.width = 50;
              img.height = 75;
              div.appendChild(img);
            }
          });

        } else {
          console.log("Error while uploading files");
        }
      });
    }
});

function formatDate(date) {
var monthNames = [
  "Jan", "Feb", "Mar",
  "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct",
  "Nov", "Dec"
];

var day = date.getDate();
var monthIndex = date.getMonth();
var year = date.getFullYear();

return day + ' ' + monthNames[monthIndex] + ' ' + year;
}


universalSignOut.addEventListener('click', () => {
  firebase.auth().signOut();
  console.log("You've been logged out!");
  window.location = "../index.html";
});

/*class GridItem extends HTMLElement {
    constructor() {
        super();

        let shadow = this.attachShadow({mode:"open"});



        var img =
    }
}

customElements.define('grid-item', GridItem);*/
