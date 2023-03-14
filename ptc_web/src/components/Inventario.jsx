import { React, useState } from "react";
import { query, where, getDocs, getDoc, getFirestore, collection, setDoc, doc, update, updateDoc } from "firebase/firestore";
function Inventario() {
    async function LeerData() {
        const firestore = getFirestore()
        const docRef = doc(firestore,'Inventario')
        const docSnap = await getDoc(docRef)
        console.log(docRef)
    }


return (
    <>
        <h1 className="home">Inventario</h1>
        <button onClick={LeerData}>Push</button>
    </>
);
}
export default Inventario;
