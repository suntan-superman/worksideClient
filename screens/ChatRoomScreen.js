import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar';
// import ChatRoomHeader from '../components/ChatRoomHeader';
import MessageList from '../components/MessageList';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Feather } from '@expo/vector-icons';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { getRoomId } from '../src/utils/common';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../FirebaseConfig';
import useUserStore from "../src/stores/UserStore";
import { useNavigation, useRoute } from "@react-navigation/native";


export default function ChatRoomScreen() {
    const route = useRoute();
    const supplierUserName = route.params.supplierUserName;
    const supplierUserId = route.params.supplierUserId;
    const requestId = route.params.requestId;
    const supplier = route.params.supplier;
      // Need UserId and Supplier UserId
    const clientUserId = useUserStore((state) => state.userID);
    const clientName = useUserStore((state) => state.username);

    const [messages, setMessages] = useState([]);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);

    useEffect(()=>{
        createRoomIfNotExists();

        const roomId = getRoomId(clientUserId, supplierUserId);
        const docRef = doc(FIREBASE_DB, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsub = onSnapshot(q, (snapshot)=>{
            const allMessages = snapshot.docs.map(doc=>{
                return doc.data();
            });
            setMessages([...allMessages]);
        });

        const KeyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow', updateScrollView
        )

        return ()=>{
            unsub();
            KeyboardDidShowListener.remove();
        }

    },[]);

    useEffect(()=>{
        updateScrollView();
    },[messages])

    const updateScrollView = ()=>{
        setTimeout(()=>{
            scrollViewRef?.current?.scrollToEnd({animated: true})
        },100)
    }

    const createRoomIfNotExists = async ()=>{
        // roomId
        if(!clientUserId || !supplierUserId) return;

        const roomId = getRoomId(clientUserId, supplierUserId);
        await setDoc(doc(FIREBASE_DB, "rooms", roomId), {
           roomId,
           createdAt: Timestamp.fromDate(new Date()) 
        });
    }

    const handleSendMessage = async ()=>{
        const message = textRef.current.trim();
        if(!message) return;
        try{
            const roomId = getRoomId(clientUserId, supplierUserId);
            const docRef = doc(FIREBASE_DB, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");
            textRef.current = "";
            if(inputRef) inputRef?.current?.clear();
            const newDoc = await addDoc(messagesRef, {
                userId: clientUserId,
                requestId: requestId,
                text: message,
                // profileUrl: user?.profileUrl,
                senderName: clientName,
                createdAt: Timestamp.fromDate(new Date())
            });

            // console.log('new message id: ', newDoc.id);
        }catch(err){
            Alert.alert('Message', err.message);
        }
    }

  return (
    <CustomKeyboardView inChat={true}>
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            {/* <ChatRoomHeader user={item} router={router} /> */}
            {/* <ChatRoomHeader  /> */}
            <View className="h-3 border-b border-neutral-300" />
            <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
            <View className="flex-1">
                <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={clientName} />
            </View>
                <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5 pb-2">
                    <TextInput 
                        ref={inputRef}
                        onChangeText={value=> textRef.current = value}
                        placeholder='Type message...'
                        placeholderTextColor={'gray'}
                        style={{fontSize: hp(2)}}
                        className="flex-1 mr-2"
                    />
                    <TouchableOpacity onPress={handleSendMessage} className="bg-neutral-200 p-2 mr-[1px] rounded-full">
                        <Feather name="send" size={hp(2.7)} color="#737373" />
                    </TouchableOpacity>
                </View>
            </View>
            </View>
        {/* </View> */}
    </CustomKeyboardView>
  )
}