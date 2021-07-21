import React, {useState} from "react";

// Se asigna el tamaño de la grilla
const nroColumnas = 50;
const nroFilas = 30



function App() {

// =========================================================================
  /* Este código crea las Columnas y Filas */

  const filas = [];
  // Iteramos sobre la cantidad de Filas para ir 
  for (let i = 0; i < nroFilas; i++){

    // Creamos la cantidad de columnas asignadas con el valor 0
    let arrayColumnas = Array.from(Array(nroColumnas), () => 0);
    // Cargamos las Columnas dentro de cada Fila
    filas.push(arrayColumnas);
  }
// =========================================================================
  const [grilla, setGrilla] = useState(filas);


  return (
    <div
      // Utilizamos Grid para repetir/crear la cantidad de Columnas que se asignó
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${nroColumnas}, 20px)`
      }}
    >
      {/* Iteramos sobre los array's definidos para crear cada una de las Celulas */}
      {grilla.map((filas, i) => 
        filas.map((columnas, j) => (
          <div
            key={`${i}-${j}`}
            style={{
              width: 20,
              height: 20,
              backgroundColor: grilla[i][j] ? "blue" : undefined,
              border: "solid 1px black"
            }}
          />
        ))
      )}
    </div>
  );
}

export default App;
