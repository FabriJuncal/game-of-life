import React, {useState, useRef, useEffect, useCallback} from "react";
// La librería Immer ayudará a seguir el paradigma de datos inmutables
// y hará que la actualización de un Estado sea mucho mas sencilla
import produce from "immer";
// La librería Material UI se utilizará para tener un estilo definido para los botónes
import Button from '@material-ui/core/Button';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';



// Valores para los Labels del componente Slider
const marks = [
  {
    value: 100,
    label: '0,1s',
  },
  {
    value: 500,
    label: '0,5s',
  },
  {
    value: 1000,
    label: '1s',
  },
];


// Se define el tamaño de la grilla
// const nroColumnas = 50;
// const nroFilas = 30;

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

  // Cargamos los datos almacenados en el Local Storage

  let grillaGuardada1 = JSON.parse(localStorage.getItem('grilla1')) ? JSON.parse(localStorage.getItem('grilla1')) : [];
  let grillaGuardada2 = JSON.parse(localStorage.getItem('grilla2')) ? JSON.parse(localStorage.getItem('grilla2')) : [];
  let grillaGuardada3 = JSON.parse(localStorage.getItem('grilla3')) ? JSON.parse(localStorage.getItem('grilla3')) : [];

  if(grillaGuardada1.length === 0){
    localStorage.setItem('grilla1', JSON.stringify([]));
  }

  if(grillaGuardada2.length === 0){
    localStorage.setItem('grilla2', JSON.stringify([]));
  }

  if(grillaGuardada3.length === 0){
    localStorage.setItem('grilla3', JSON.stringify([]));
  }

  let grillaBase = [];
  let grillaAux;

  let cantColumnasInicial = grillaGuardada1.length > 0 ? grillaGuardada1[0].length : 50;
  let cantFilaInicial = grillaGuardada1.length  > 0 ? grillaGuardada1.length : 30;

  // Iteramos sobre la cantidad de Filas definidas para ir cargando las columnas en cada fila 
  for (let i = 0; i < cantFilaInicial; i++){

    // Creamos la cantidad de columnas asignadas con el valor 0
    let arrayColumnas = Array.from(Array(cantColumnasInicial), () => 0);
    // Cargamos las Columnas dentro de cada Fila y de esta manera se va armando la grilla
    grillaBase.push(arrayColumnas);
  }

  if(grillaGuardada1.length > 0){
    grillaAux = grillaGuardada1;
  }else{
    grillaAux = grillaBase;
  }
  // ===============================================================================================================================
  /*Definición de Hooks*/
  const [cantColumnas, actualizarCantColumnas] = useState(cantColumnasInicial);
  const [cantFila, actualizarCantFila] = useState(cantFilaInicial);
  const [grilla, actualizarGrilla] = useState(grillaAux);
  const [grillaSeleccionado1, actGrillaSeleccionado1] = useState(true);
  const [grillaSeleccionado2, actGrillaSeleccionado2] = useState(false);
  const [grillaSeleccionado3, actGrillaSeleccionado3] = useState(false);
  const [recorrido, actualizarRecorrido] = useState(false);
  const [tiempoTurno, actualizarTiempoTurno] = useState(300);


  const recorridoRef = useRef(recorrido);
  recorridoRef.current = recorrido;

  // useEffect(() => {
  //   actualizarCantColumnas(cantColumnas);
  //   actualizarCantFila(cantFila);
  // }, [cantColumnas,cantFila, grillaSeleccionado1]);

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
          for (let i = 0; i < cantFila; i++){
            for (let j = 0; j < cantColumnas; j++){
              let vecinos = 0;
              // Busca cadá célula vecina.
              // Se utiliza el array "operaciones" definido previamente para realizar la suma con la posición en la que se encuentra la secuencia (Es decir, la célula del centro)
              // y de esta manera obtener las posiciones de las 8 células vecinas que tiene cada una de estas (Excluyendo las células de los bordes)
              operaciones.forEach(([x , y]) => {
                const fila_i = i + x;
                const columna_j = j + y;
                
                // Validamos que las células vecinas se encuentren dentro del rango de la grilla
                if(fila_i >= 0 && fila_i < cantFila && columna_j >= 0 && columna_j < cantColumnas){
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
      setTimeout(correrSimulación, tiempoTurno);

    },
    [cantColumnas,cantFila, tiempoTurno]);

// ===============================================================================================================================
  /*Definición de Funciones*/

  const actualizarTamanioGrilla = (p_cantColumnas, p_cantFilas, p_grilla = []) => {
        /* Este código crea las Columnas y Filas con un valor 0 para cada Célula (Es decir, carga la grilla con células muertas)*/
        actualizarRecorrido(false);

        grillaBase = p_grilla;
        

        let nroColumnas = parseInt(p_cantColumnas != null ? p_cantColumnas : 0);
        let nroFilas = parseInt(p_cantFilas != null ? p_cantFilas : 0);

        actualizarCantColumnas(nroColumnas);
        actualizarCantFila(nroFilas);

        if( grillaBase.length === 0){
          // Iteramos sobre el total de células que se obtendrá de la multiplicación de las filas y las columnas
          for (let i = 0; i < (nroFilas); i++){
      
            // Creamos la cantidad de columnas asignadas con el valor 0
            let arrayColumnas = Array.from(Array(nroColumnas), () => 0);
            // Cargamos las Columnas dentro de cada Fila

            grillaBase.push(arrayColumnas);

            actualizarGrilla(grillaBase);
          }
        }else{
          actualizarGrilla(grillaBase);
        }

  }

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

  const guardarCargarGrilla = (nroGrillaGuardada, operacion) => {

    if(operacion === 'guardar'){
      if(nroGrillaGuardada === 1){
        localStorage.setItem('grilla1', JSON.stringify(grilla));
      }
  
      if(nroGrillaGuardada === 2){
        localStorage.setItem('grilla2', JSON.stringify(grilla));
      }
  
      if(nroGrillaGuardada === 3){
        localStorage.setItem('grilla3', JSON.stringify(grilla));
      }
    }

    if(operacion === 'cargar'){

      let nroColumnas;
      let nroFila
      ;
      if(nroGrillaGuardada === 1){
        grillaGuardada1 = JSON.parse(localStorage.getItem('grilla1'))
        nroColumnas = grillaGuardada1.length > 0 ? grillaGuardada1[0].length : 50;
        nroFila = grillaGuardada1.length  > 0 ? grillaGuardada1.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada1);
      }
  
      if(nroGrillaGuardada === 2){
        grillaGuardada2 = JSON.parse(localStorage.getItem('grilla2'))
        nroColumnas = grillaGuardada2.length > 0 ? grillaGuardada2[0].length : 50;
        nroFila = grillaGuardada2.length  > 0 ? grillaGuardada2.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada2);
      }
  
      if(nroGrillaGuardada === 3){
        grillaGuardada3 = JSON.parse(localStorage.getItem('grilla3'))
        nroColumnas = grillaGuardada3.length > 0 ? grillaGuardada3[0].length : 50;
        nroFila = grillaGuardada3.length  > 0 ? grillaGuardada3.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada3);
      }
    }
  }

  // Estilos para el componente Slider
  const estiloSlider = makeStyles({
    root: {
      width: 100,
      marginLeft: '20px',
      display: "grid",
      gridTemplateColumns: `repeat(2, 200px)`
    },
  });

  // Se declara la constante con los estilos que tendrá el componente Slider
  const claseSlider = estiloSlider();
// ===============================================================================================================================
  return (

    <>

      <div className={claseSlider.root}>
        <div>
          <Typography id="discrete-slider-small-steps" gutterBottom>
          Tiempo de Ejecución
          </Typography>
          <Slider
            defaultValue={300}
            aria-labelledby="discrete-slider-small-steps"
            step={100}
            marks={marks}
            min={100}
            max={1000}
            valueLabelDisplay="auto"
            onChange={(e) => {
              actualizarTiempoTurno(e.target.textContent);
              // actualizarGrilla(grillaBase);
              actualizarRecorrido(false);
            }}
          />
        </div>
        <div
          style={{
            marginLeft: '50px'
          }}
        >
        <Typography id="discrete-slider-small-steps" gutterBottom>
        Tamaño de la Grilla
        </Typography>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(2, 100px)`
            }}
          >
            <TextField id="n-filas" label="Filas"
              type="number"
              // defaultValue={cantFila}
              value={cantFila}
              style={{
                width: 90
              }}
              onChange={(e) => {
                actualizarTamanioGrilla(cantColumnas, e.target.value ? e.target.value : 0);
                // actualizarGrilla(grillaBase);
                // actualizarRecorrido(false);
              }}
            />
            <TextField  id="n-columnas" label="Columnas" 
              type="number"
              // defaultValue={cantColumnas}
              value={cantColumnas}
              style={{
                width: 90,
                marginLeft: '10px'
              }}
              onChange={(e) => {
                actualizarTamanioGrilla(e.target.value ? e.target.value : 0, cantFila);
                // actualizarGrilla(grillaBase);
                // actualizarRecorrido(false);
              }}
            />
          </div>
        </div>
        
      </div>

      {/* Botón de ejecución de Simulación
          Al hacer click sobre el botón este actualiza su estado al estado contrario en la que se encuentra e itera el texto 
          "Parar": cuando el estado del botón sea "true"
          "Empezar": cuando el estado del botón sea "False"
      */}
      <div
        style={{
          margin: '5px'
        }}
      >
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
            actualizarTamanioGrilla(50,30)
          }}
        >Reiniciar</Button>

        <Button variant={grillaSeleccionado1 ? 'contained' : 'outlined'} color='primary'
          style={{width: 100, margin: '3px'}}
          onClick={()=>{
            if(grillaSeleccionado1){
              guardarCargarGrilla(1, 'guardar');
            }else if(!grillaSeleccionado1 && grillaGuardada1.length === 0){
              guardarCargarGrilla(1, 'guardar');
            }else if(!grillaSeleccionado1 && grillaGuardada1.length > 0){
              guardarCargarGrilla(1, 'cargar');
            }
            actGrillaSeleccionado1(true);
            actGrillaSeleccionado2(false);
            actGrillaSeleccionado3(false);

          }}
        >{grillaSeleccionado1 ? 'Guardar 1' : 'Cargar 1'}</Button>

        <Button variant={grillaSeleccionado2 ? 'contained' : 'outlined'} color='primary'
          style={{width: 100, margin: '3px'}}
          onClick={()=>{
            if(grillaSeleccionado2){
              guardarCargarGrilla(2, 'guardar');
            }else if(!grillaSeleccionado2 && grillaGuardada2.length === 0){
              guardarCargarGrilla(2, 'guardar');
            }else if(!grillaSeleccionado2 && grillaGuardada2.length > 0){
              guardarCargarGrilla(2, 'cargar');
            }
            actGrillaSeleccionado1(false);
            actGrillaSeleccionado2(true);
            actGrillaSeleccionado3(false);
            actualizarRecorrido(false);
          }}
          >{grillaSeleccionado2 ? 'Guardar 2' : (grillaGuardada2.length === 0 ? 'Guardar 2' : 'Cargar 2') }</Button>

        
          <Button variant={grillaSeleccionado3 ? 'contained' : 'outlined'} color='primary'
          style={{width: 100, margin: '3px'}}
          onClick={()=>{
            if(grillaSeleccionado3){
              guardarCargarGrilla(3, 'guardar');
            }else if(!grillaSeleccionado3 && grillaGuardada3.length === 0){
              guardarCargarGrilla(3, 'guardar');
            }else if(!grillaSeleccionado3 && grillaGuardada3.length > 0){
              guardarCargarGrilla(3, 'cargar');
            }
            actGrillaSeleccionado1(false);
            actGrillaSeleccionado2(false);
            actGrillaSeleccionado3(true);
            actualizarRecorrido(false);
          }}
          >{grillaSeleccionado3 ? 'Guardar 3' : (grillaGuardada3.length === 0 ? 'Guardar 3' : 'Cargar 3') }</Button>
      </div>
      <div
        // Una vez que tenemos la 1er columna armada utilizamos Grid para repetir/crear la cantidad de Columnas que se asignó
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cantColumnas}, 25px)`
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
