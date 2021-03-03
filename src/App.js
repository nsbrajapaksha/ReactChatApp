import './App.css';
import {useRef, useState} from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyCB2z1XBicQGYf9CXwPcg3jg4WnMZWT2vA",
    authDomain: "chat-app-aeea0.firebaseapp.com",
    projectId: "chat-app-aeea0",
    storageBucket: "chat-app-aeea0.appspot.com",
    messagingSenderId: "328206597251",
    appId: "1:328206597251:web:dc13c0a2f53155dae82fb6",
    measurementId: "G-EWX8ZJRDJ9"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>🔥💬</h1>
                <SignOut/>
            </header>

            <section>
                {user ? <ChatRoom/> : <SignIn/>}
            </section>

        </div>
    );
}

function ChatMessage(props) {
    const {text, uid, photoURL} = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}/>
                <p>{text}</p>
            </div>
        </>
    )
}

function ChatRoom() {
    const dummy = useRef();
    const messageRef = firestore.collection('messages');
    const query = messageRef.orderBy('createdAt').limit(25);

    const [messages] = useCollectionData(query, {idField: 'id'});
    const [formValue, setFormValue] = useState('');

    const sendMessage = async(e) => {
        e.preventDefault();
        const {uid, photoURL} = auth.currentUser;

        await messageRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL
        });

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <>
            <main>

                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

                <span ref={dummy}></span>

            </main>

            <form onSubmit={sendMessage}>

                <input value={formValue} onChange={(e) => setFormValue(e.target.value)}
                       placeholder="say something nice"/>

                <button type="submit" disabled={!formValue}>Send</button>

            </form>
        </>
    )
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
            <p>Do not violate the community guidelines or you will be banned for life!</p>
        </>
    );
}

function SignOut(){
    return auth.currentUser && (
        <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
    )
}

export default App;
