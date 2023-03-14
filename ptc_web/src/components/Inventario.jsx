import { React, useState } from "react";
import { doc, getDocs, getFirestore, collection } from "firebase/firestore";
function Inventario() {
    const db = getFirestore();
    async function LeerData() {
        const colRef = collection(db, "Inventario");
        const docsSnap = await getDocs(colRef);
        docsSnap.forEach(doc => { console.log(doc.data()); })
    }

    return (
        <>
            <h1 className="home">Inventario</h1>
            <button onClick={LeerData}>Push</button>
        </>
    );
}
export default Inventario;
