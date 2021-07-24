import React, {useState, useRef, useCallback} from "react";
// La librería Immer ayudará a seguir el paradigma de datos inmutables
// y hará que la actualización de un Estado sea mucho mas sencilla
import produce from "immer";
// La librería Material UI se utilizará para tener un estilo definido para los botónes
import Button from '@material-ui/core/Button';

// Se define el tamaño de la grilla
const nroColumnas = 50;
const nroFilas = 30;

// Se define las operaciones para poder indentificar las células vecinas
// Si realizamos una suma con cada uno de estos array con la posición en la que estamos ubicados, obtendremos las posiciones de las 8 células vecinas que puede tener cada una de estas
// Ejemplo:
//    -1,-1 | -1,0 | -1,1
//   _______|______|______
//     0,-1 |Célula| 0,1
//   _______|______|______
//     1,-1 |  1,0 | 1,1

const operaciones = [
  [-1, -1], // Noroeste
  [-1, 0],  // Norte
  [-1, 1],  // Noreste
  [0, 1],   // Este
  [1, 1],   // Sureste
  [1, 0],   // Sur
  [1, -1],  // Suroeste
  [0, -1],  // Oeste
]

function App() {
// ===============================================================================================================================
  /* Este código crea las Columnas y Filas con un valor 0 para cada Célula (Es decir, carga la grilla con células muertas)*/

  const filas = [];
  // Iteramos sobre la cantidad de Filas definidas para ir cargando las columnas en cada fila 
  for (let i = 0; i < nroFilas; i++){

    // Creamos la cantidad de columnas asignadas con el valor 0
    let arrayColumnas = Array.from(Array(nroColumnas), () => 0);
    // Cargamos las Columnas dentro de cada Fila
    filas.push(arrayColumnas);
  }
  
// ===============================================================================================================================
  /*Definición de Hooks*/

  const [grilla, actualizarGrilla] = useState(filas);
  const [recorrido, actualizarRecorrido] = useState(false);
  const recorridoRef = useRef(recorrido);
  recorridoRef.current = recorrido;

  // La función correrSimulación() ejecuta la simulación de la evolución de las células por turno
  // Se utiliza el Hook "useCallback" para almacenar la función en memoria y no volver a cargar la función cada vez que React renderice los componentes, ya que la función contiene muchos calculos.
  // Esta es una buena manera de hacer el código mas eficiente
  const correrSimulación = useCallback(() => {
      if(!recorridoRef.current){
        return;
      }

      actualizarGrilla(g => {
        // Se utiliza la función "produce" de la librería "Immer" para actualizar el estado "grilla" de una manera muy sensilla
        return produce(g,  grillaCopia =>{
          // Recorre cada celda de la grilla (Sería cada célula)
          for (let i = 0; i < nroFilas; i++){
            for (let j = 0; j < nroColumnas; j++){
              let vecinos = 0;
              // Busca cadá célula vecina.
              // Se utiliza el array "operaciones" definido previamente para realizar la suma con la posición en la que se encuentra la secuencia (Es decir, la célula del centro)
              // y de esta manera obtener las posiciones de las 8 células vecinas que tiene cada una de estas (Excluyendo las células de los bordes)
              operaciones.forEach(([x , y]) => {
                const fila_i = i + x;
                const columna_j = j + y;
                
                // Validamos que las células vecinas se encuentren dentro del rango de la grilla
                if(fila_i >= 0 && fila_i < nroFilas && columna_j >= 0 && columna_j < nroColumnas){
                  // Se suma cadá valor de las células vecinas encontradas
                  // (Cada célula viva vale 1 y las muertas valen 0, por lo tanto si se encuentra 3 células vecinas vivas, al finalizar la secuencia la variable "vecino" tendría que valer 3)
                  vecinos += g[fila_i][columna_j];
                }
                
              });

              // Una vez terminado las repeticiones para obtener el valor de las 8 células vecinas  validamos:
              // Si la célula analizada contiene menos de 2 células vecinas vivas o contiene más de 3 células vecinas vivas, esta muere 
              // (Por lo tanto se le agrega el valor de 0 en la posición de la grila)
              if(vecinos < 2 || vecinos > 3){
                grillaCopia[i][j] = 0;
              
              // Si la célula analizada se encuentra muerta (con el valor 0) y se encuentra que tiene 3 células vecinas (con el valor 1), Esta revive
              // (Por lo tanto se le agrega el valor de 1 en la posición de la grila)
              }else if (g[i][j] === 0 && vecinos === 3){
                grillaCopia[i][j] = 1;
              }

            }

          }
        });
      });

   // Ejecuta la simulación de la evolución de las células por turno deacuerdo al tiempo que se le este pasando la función setTimeout()
      setTimeout(correrSimulación, 300);

    },
    []); // No cargamos nada en el array de dependencias porque de este modo la función solo se crea por unica vez el inicio de la aplicación 

// ===============================================================================================================================
  /*Definición de Funciones*/

  // Función que utilizamos para actualizar el estado de la Grilla (Es decir, con esta función podemos seleccionar cada célular e ir reviviendolas o matandolas)
  const actualizarEstadoGrilla = (i,j) => {
      // Utilizamos la función "produce" de la librería "Immer" para actualizar el estado "grilla" de una manera muy sensilla
      const nuevaGrilla = produce(grilla, grillaCopia => {
        // Si la posición de la grilla que pasamos como parametro tiene un valor de 1, este se actualiza 0 y viceversa
        grillaCopia[i][j] = grillaCopia[i][j] > 0 ? 0 : 1;
      });
      actualizarGrilla(nuevaGrilla);
  }

  const actEstadoBtnSimulacion = () => {
    actualizarRecorrido(!recorrido);
    if(!recorrido){
      recorridoRef.current = true;
      correrSimulación();
    }
  }
// ===============================================================================================================================
  return (

    <>

      {/* Botón de ejecución de Simulación
          Al hacer click sobre el botón este actualiza su estado al estado contrario en la que se encuentra e itera el texto 
          "Parar": cuando el estado del botón sea "true"
          "Empezar": cuando el estado del botón sea "False"
      */}
      <Button variant="contained" color="primary"
         style={{width: 100, margin: '3px'}}
        onClick={()=>{actEstadoBtnSimulacion()}}
      >{recorrido ? 'Parar' : 'Empezar'}</Button>

      {/* Botón de ejecución de Simulación
          Al hacer click sobre el botón este actualiza su estado al estado contrario en la que se encuentra e itera el texto 
          "Parar": cuando el estado del botón sea "true"
          "Empezar": cuando el estado del botón sea "False"
      */}
      <Button variant="contained" color="primary"
         style={{width: 100, margin: '3px'}}
        onClick={()=>{
          actualizarGrilla(filas);
          actualizarRecorrido(false);
        }}
      >Reiniciar</Button>
      <div
        // Una vez que tenemos la 1er columna armada utilizamos Grid para repetir/crear la cantidad de Columnas que se asignó
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${nroColumnas}, 25px)`
        }}
      >
        {/* Iteramos sobre el array "grilla" y "filas" para poder ir agregando cada célula en cada fila y de este modo armar una columna */}
        {grilla.map((filas, i) => 
          filas.map((columnas, j) => (
            <div
              key={`${i}-${j}`}
              onClick={()=>{actualizarEstadoGrilla(i,j)}} // Al hacer click en una célula, esta muere o revive dependiendo del estado actual
              style={{
                width: 20,
                height: 20,
                backgroundColor: grilla[i][j] ? "#007bff" : undefined, // Si el valor de la posición es 1, se pinta la celula de color Azul
                border: "solid 1px #007bff",
                borderRadius: '20px',
                margin: '3px 5px'
              }}
            />
          ))
        )}
      </div>
    </>
  );
}

export default App;
