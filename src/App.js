import React, {useState} from "react";
// La librería Immer ayudará a seguir el paradigma de datos inmutables
// y hará que la actualización de un Estado sea mucho mas sencilla
import produce from "immer";

// Se asigna el tamaño de la grilla
const nroColumnas = 50;
const nroFilas = 30

function App() {

// =========================================================================
  /* Este código crea las Columnas y Filas con un valor 0 para cada Célula */

  const filas = [];
  // Iteramos sobre la cantidad de Filas definidas para ir cargando las columnas en cada fila 
  for (let i = 0; i < nroFilas; i++){

    // Creamos la cantidad de columnas asignadas con el valor 0
    let arrayColumnas = Array.from(Array(nroColumnas), () => 0);
    // Cargamos las Columnas dentro de cada Fila
    filas.push(arrayColumnas);
  }
// =========================================================================
  const [grilla, actualizarGrilla] = useState(filas);


  // Función que utilizamos para actualizar el estado de la Grilla
  const actualizarEstadoGrilla = (i,j) => {
      // Utilizamos la función "produce" de la librería "Immer" para actualizar el estado "grilla" de una manera muy sensilla
      const nuevaGrilla = produce(grilla, grillaCopia => {
        // Si la posición de la grilla que pasamos como parametro tiene un valor de 1, este se actualiza 0 y viceversa
        grillaCopia[i][j] = grillaCopia[i][j] ? 0 : 1;
      });
      actualizarGrilla(nuevaGrilla);
  }

  return (
    <div
      // Una vez que tenemos la 1er columna armada utilizamos Grid para repetir/crear la cantidad de Columnas que se asignó
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${nroColumnas}, 20px)`
      }}
    >
      {/* Iteramos sobre el array "grilla" y "filas" para poder ir agregando cada célula en cada fila y de este modo armar una columna */}
      {grilla.map((filas, i) => 
        filas.map((columnas, j) => (
          <div
            key={`${i}-${j}`}
            onClick={()=>{actualizarEstadoGrilla(i,j)}}
            style={{
              width: 20,
              height: 20,
              backgroundColor: grilla[i][j] ? "blue" : undefined, // Si el valor de la posición es 1, se pinta la celula de color Azul
              border: "solid 1px black"
            }}
          />
        ))
      )}
    </div>
  );
}

export default App;
