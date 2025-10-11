import {deleteApp, getApps, initializeApp} from "firebase/app";
import {addDoc, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, setDoc} from "firebase/firestore";
import {User} from "react-native-gifted-chat";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {Toast} from "../components/Toast";
import {NotificationTypeEnum, RolesEnum} from "../models/Static";


class Fire {
    static shared: Fire;
    firebaseApp;
    db;
    storage;

    constructor() {
        if (!getApps().length) {
            this.init();
            this.db = getFirestore(this.firebaseApp);
            this.storage = getStorage(this.firebaseApp);
        } else {
            this.db = getFirestore(getApps()[0]);
            this.storage = getStorage(getApps()[0]);
            console.log("firebase apps already running...")
        }
    }

    init = () =>
        this.firebaseApp = initializeApp({
            apiKey: "AIzaSyCI-sydJ3NJupzZOgJe_XYcn6MFOGMIa18",
            authDomain: "lambda-beta-a9128.firebaseapp.com",
            projectId: "lambda-beta-a9128",
            storageBucket: "lambda-beta-a9128.appspot.com",
            messagingSenderId: "48815439328",
            appId: "1:48815439328:web:8bab1dd8dbf59536adbf85",
            measurementId: "G-N43P3R206R"
        });

    reinitialize = () => {
        const that = this;
        if (getApps().length) {
            deleteApp(this.firebaseApp).then(function () {
                that.init();
                that.db = getFirestore(that.firebaseApp);
                that.storage = getStorage(that.firebaseApp);
            });
        }
    }

    chatsCollection() {
        return collection(this.db, `${process.env.ENVIRONMENT}-chats`);
    }

    messagesCollection(orderId) {
        return collection(this.db, `${process.env.ENVIRONMENT}-chats`, `${orderId}`, 'messages');
    }

    async createOrderDoc(order) {
        await setDoc(doc(this.chatsCollection(), `${order.id}`), {
            title: order?.title,
            messages: []
        });
    };

    async chatDoc(orderId) {
        const docRef = doc(this.db, `${process.env.ENVIRONMENT}-chats`, `${orderId}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            return docSnap.data();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
        //return collection(this.db, 'chats').doc(`${orderId}`).collection('messages');
    }

    parseMsg = (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            const {
                timestamp: numberStamp, text, sender, image
            } = doc.data();
            const timestamp = new Date(numberStamp);

            const chat = {
                _id: doc.id,
                timestamp,
                text,
                image,
                user: sender,
            };
            messages.push(chat);
        });
        return messages;
    };

    onMsgStore = (callback, orderId) => {
        const q = query(this.messagesCollection(orderId),
            orderBy("timestamp", "desc"));

        return onSnapshot(q, (snapshot) => callback(this.parseMsg(snapshot)));
    }

    get timestamp() {
        return Date.now();
    }

    uploadMsgImg = async (orderId, file, users: { sender: User, receiver: User }, setLoader, removeLoader, isToBo = false) => {
        const metadata = {
            contentType: file.type
        };
        setLoader();
        const storageRef = ref(this.storage, `${process.env.ENVIRONMENT}/${orderId}/${this.timestamp}${file.name}`);
        const img = await fetch(file.uri);
        const blob = await img.blob();

        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);


        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                removeLoader()
                Toast('An error occurred');
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const message = {
                        image: downloadURL,
                        sender: users.sender,
                        receiver: users.receiver,
                        timestamp: this.timestamp
                    };

                    isToBo ? this.appendMsgToBo(message, orderId, users.sender) : this.appendMsg(message, orderId);
                    removeLoader()
                    isToBo ? this.sendBoNotif(message, orderId, true) :
                        this.sendNotif(message, orderId, true)
                    console.log('File available at', downloadURL);
                });
            }
        );

    }

    // send the message to the Backend
    send = (messages, users: { sender: User, receiver: User }, orderId) => {

        for (let i = 0; i < messages.length; i++) {
            const {text} = messages[i];

            const message = {
                text,
                sender: users.sender,
                receiver: users.receiver,
                timestamp: this.timestamp,
            };

            this.appendMsg(message, orderId);
            this.sendNotif(message, orderId, false)
        }
    };

    appendMsg = (message, orderId) => addDoc(this.messagesCollection(orderId), message);

    sendNotif = async (message, orderId, isImage) => {
        const newMsg = {
            driverId: message?.receiver?._id,
            clientId: message?.sender?._id,
            orderId: orderId
        }

        const body = {
            content: isImage ? 'Image' : message.text,
            title: message?.receiver?.name,
            userId: message?.receiver?._id,
            businessId: orderId,
            type: NotificationTypeEnum.CHAT
        }

    }

    sendBoNotif = async (message, orderId, isImage) => {
        const newMsg = {
            clientId: message?.sender?._id,
            adminId: message?.receiver?._id,
            orderId: orderId
        }

        const body = {
            content: isImage ? 'Image' : message.text,
            title: `New Support Message from ${message?.sender?.name}`,
            userId: message?.receiver?._id,
            businessId: orderId,
            type: NotificationTypeEnum.CHAT_BO
        }
    }

    sendToBo = (messages, users: { sender: User, receiver: User }, orderId) => {

        for (let i = 0; i < messages.length; i++) {
            const {text} = messages[i];

            const message = {
                text,
                sender: users.sender,
                receiver: users.receiver,
                timestamp: this.timestamp,
            };

            this.appendMsgToBo(message, orderId, users.sender);
            this.sendBoNotif(message, orderId, false)
        }
    };

    appendMsgToBo = (message, orderId, client: User) => {
        const chat = {
            client,
            timestamp: message.timestamp,
            orderId,
            lastMessage: message.image ? 'Attachment' : message.text
        }
        const pathSeg = `${orderId}-${client._id}`
        setDoc(doc(this.boChatCollection(), pathSeg), chat);
        //addDoc(this.boChatCollection(orderId, client), chat);
        addDoc(this.boMessagesCollection(orderId, client), message);
    }

    boMessagesCollection(orderId, client: User) {
        const pathSeg = `${orderId}-${client._id}`
        return collection(this.db, `${process.env.ENVIRONMENT}-bo-chats`, pathSeg, 'messages');
    }

    boChatCollection() {
        return collection(this.db, `${process.env.ENVIRONMENT}-bo-chats`);
    }

    onBoMsgStore = (callback, orderId, client: User) => {
        const q = query(this.boMessagesCollection(orderId, client),
            orderBy("timestamp", "desc"));

        return onSnapshot(q, (snapshot) => callback(this.parseMsg(snapshot)));
    }

    supportChatCollection() {
        return collection(this.db, `${process.env.ENVIRONMENT}-bo-chats`)
    }

    supportMessagesCollection(client: User) {
        const pathSeg = `support-${client._id}`
        return collection(this.db, `${process.env.ENVIRONMENT}-bo-chats`, pathSeg, 'messages')
    }

    onSupportMsgStore = (callback, client) => {
        const q = query(this.supportMessagesCollection(client),
            orderBy("timestamp", "desc"));
        return onSnapshot(q, (snapshot) => callback(this.parseMsg(snapshot)));
    }

    appendMsgToSupport = (message, client: User) => {
        const chat = {
            client,
            orderId: 0,
            timestamp: message.timestamp,
            lastMessage: message.image ? 'Attachment' : message.text
        }
        const pathSeg = `support-${client._id}`
        setDoc(doc(this.supportChatCollection(), pathSeg), chat);
        addDoc(this.supportMessagesCollection(client), message);
    }

    sendToSupport = (messages, users: { sender: User, receiver: User }) => {
        for (let i = 0; i < messages.length; i++) {
            const {text} = messages[i];
            const message = {
                text,
                sender: users.sender,
                receiver: users.receiver,
                timestamp: this.timestamp,
            };
            this.appendMsgToSupport(message, users.sender);
            this.sendBoNotif(message, 0, false)
        }
    };
    uploadSupportMsgImg = async (file, users: { sender: User, receiver: User }, setLoader, removeLoader) => {
        const metadata = {
            contentType: file.type
        };
        setLoader();
        const storageRef = ref(this.storage, `${process.env.ENVIRONMENT}/${this.timestamp}${file.name}`);
        const img = await fetch(file.uri);
        const blob = await img.blob();
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            },
            (error) => {
                removeLoader()
                Toast('An error occurred');
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
                    case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            () => {
                // Upload completed successfully, now we can get the download URL
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    const message = {
                        image: downloadURL,
                        sender: users.sender,
                        receiver: users.receiver,
                        timestamp: this.timestamp
                    };

                    this.appendMsgToSupport(message, users.sender)
                    removeLoader()
                    this.sendBoNotif(message, null, true)
                    console.log('File available at', downloadURL);
                });
            }
        );
    }

}

Fire.shared = new Fire();
export default Fire;
