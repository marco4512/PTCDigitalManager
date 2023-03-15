import { React, useState } from "react";
import { doc, getDocs, getFirestore, collection } from "firebase/firestore";

function Inventario() {
    const db = getFirestore();
    const [inventario,setInventario]=useState(0);
    async function LeerData() {
        const colRef = collection(db, "Inventario");
        const docsSnap = await getDocs(colRef);

        let salida=[]
        docsSnap.forEach((doc) => {
            console.log(doc.id, " => ", salida.push(doc.data()));
          });
          setInventario(salida)
        console.log(salida[0])
    }

    return (
        <>
            <h1 className="home">Inventario</h1>
            <button onClick={LeerData}>Push</button>
            <h1>{inventario}</h1>
        </>
    );
}
export default Inventario;
