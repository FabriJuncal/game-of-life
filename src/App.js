import React, {useState, useRef, useCallback} from "react";
// La librería Immer ayudará a seguir el paradigma de datos inmutables
// y hará que la actualización de un Estado sea mucho mas sencilla
import produce from "immer";
// La librería Material UI se utilizará para tener un estilo definido para los componentes
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
// Botones personalizados de Guardar/Cargar Grilla
import BtnGuardarCargar from '../src/components/BtnGuardarCargar';

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
  /* 
    Este código crea las Columnas y Filas con un valor 0 para cada Célula (Es decir, carga la grilla con células muertas).
    Tambien carga las grillas almacenadas en el Local Storage.
    Si una grilla se encuentra almacenada en el Slot 1, esta se cargará de forma predeterminada al recargar la página.
  */

  // Cargamos las grillas almacenadas en el Local Storage
  let grillaGuardada1 = JSON.parse(localStorage.getItem('grilla1')) ? JSON.parse(localStorage.getItem('grilla1')) : [];
  let nroTurno1 = localStorage.getItem('nroTurno1') ? parseInt(localStorage.getItem('nroTurno1')) : 0;

  let nroTurnoActual = nroTurno1;

  if(grillaGuardada1.length === 0){
    localStorage.setItem('grilla1', JSON.stringify([]));
  }

  let grillaBase = [];
  let grillaAux;


  let cantColumnasInicial = grillaGuardada1.length > 0 ? grillaGuardada1[0].length : 50;
  let cantFilaInicial = grillaGuardada1.length  > 0 ? grillaGuardada1.length : 30;

  // Iteramos sobre la cantidad de Filas definidas para ir cargando las columnas en cada una de las filas
  for (let i = 0; i < cantFilaInicial; i++){

    // A cada valor del array de Columnas le agrega el valor 0
    let arrayColumnas = Array.from(Array(cantColumnasInicial), () => 0);
    // Cargamos las Columnas dentro de cada Fila y de esta manera se va armando la grilla
    grillaBase.push(arrayColumnas);
  }

  // En el caso que se encuentre la grilla 1 almacenada en el Local Storage, se carga automaticamente
  if(grillaGuardada1.length > 0){
    grillaAux = grillaGuardada1;
  }else{ // Sino se carga la grilla predefinida sin células vivas
    grillaAux = grillaBase;
  }
  // ===============================================================================================================================
  /*Definición de Hooks*/
  const [cantColumnas, actualizarCantColumnas] = useState(cantColumnasInicial);
  const [cantFila, actualizarCantFila] = useState(cantFilaInicial);
  const [grilla, actualizarGrilla] = useState(grillaAux);
  const [grillaSeleccionado, actGrillaSeleccionado] = useState(1);
  const [recorrido, actualizarRecorrido] = useState(false);
  const [tiempoTurno, actualizarTiempoTurno] = useState(300);
  const [contadorTurnos, actualizarContTurnos] = useState(0);


  // Se utiliza el Hook "useRef" para que no se pierda la asignación de las variable después de cada renderizado.
  // Estas variables se utilizarán en el proceso de ejecución de la simulación y por lo tanto se necesita que persistan en el tiempo con sus valores
  const recorridoRef = useRef(recorrido);
  recorridoRef.current = recorrido;

  const turnoActualRef = useRef(contadorTurnos);
  turnoActualRef.current = contadorTurnos;

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
      setTimeout(() => {
        correrSimulación();
    // Se lleva la cuenta de los turnos que se van ejecutando
        nroTurnoActual = turnoActualRef.current + 1;
        actualizarContTurnos(nroTurnoActual);
      }, tiempoTurno);

      
    },
    [cantColumnas,cantFila, tiempoTurno, contadorTurnos]);




// ===============================================================================================================================
/*Definición de Funciones*/

  // Función que se utiliza para actualizar el tamaño de la grilla cada vez que se modifican los valores de las Filas y Columnas
  const actualizarTamanioGrilla = (p_cantColumnas, p_cantFilas, p_grilla = []) => {
  
    // Se pausa la simulación para no generar ningún error al modificar las dimensiones de la grilla
    actualizarRecorrido(false);

    // Si la cantidad de columnas o filas es igual a cero, oculta la grilla de simulación
    // en caso contrario, lo muestra
    if(p_cantColumnas === 0 || p_cantFilas === 0){
      document.getElementById('grillaSimulacion').hidden = true
    }else{
      document.getElementById('grillaSimulacion').hidden = false
    }

    grillaBase = p_grilla;
    
    let nroColumnas = parseInt(p_cantColumnas != null ? p_cantColumnas : 0);
    let nroFilas = parseInt(p_cantFilas != null ? p_cantFilas : 0);

    actualizarCantColumnas(nroColumnas);
    actualizarCantFila(nroFilas);

    // Si se pasa como parametro una grilla cargada, no se vuelven a generar las Filas y Columnas
    if( grillaBase.length === 0){
      // Iteramos sobre el la cantidad de Filas
      for (let i = 0; i < (nroFilas); i++){
  
        // Creamos la cantidad de Columnas asignadas con el valor 0
        let arrayColumnas = Array.from(Array(nroColumnas), () => 0);
        // Cargamos las Columnas dentro de cada Fila
        grillaBase.push(arrayColumnas);
        actualizarGrilla(grillaBase);
      }
    }else{
      actualizarGrilla(grillaBase);
    }

  }

  // Función que se utiliza para actualizar el estado de la Grilla (Es decir, con esta función podemos seleccionar cada célular e ir reviviendolas o matandolas)
  const actualizarEstadoGrilla = (i,j) => {
      // Utilizamos la función "produce" de la librería "Immer" para actualizar el estado "grilla" de una manera muy sensilla
      const nuevaGrilla = produce(grilla, grillaCopia => {
        // Si la posición de la grilla que pasamos como parametro tiene un valor de 1, este se actualiza 0 y viceversa
        grillaCopia[i][j] = grillaCopia[i][j] > 0 ? 0 : 1;
      });
      actualizarGrilla(nuevaGrilla);
  }

  // Función que Inicia o Detiene la Simulación
  const actEstadoBtnSimulacion = () => {
    actualizarRecorrido(!recorrido);
    if(!recorrido){
      recorridoRef.current = true;
      correrSimulación();
    }
  }

  // Función que Carga o Almacena las grillas y el contador de turnos en el Local Storage según el Slot que se haya seleccionado
  const guardarCargarGrilla = (nroGrillaGuardada, operacion) => {

    if(operacion === 'guardar'){
        localStorage.setItem('grilla'+nroGrillaGuardada, JSON.stringify(grilla));
        localStorage.setItem('nroTurno'+nroGrillaGuardada, contadorTurnos);
    }

    if(operacion === 'cargar'){
      let nroFila, nroColumnas;
      let grillaGuardada = JSON.parse(localStorage.getItem('grilla'+nroGrillaGuardada));
      let nroTurno = parseInt(localStorage.getItem('nroTurno'+nroGrillaGuardada));
      actualizarContTurnos(nroTurno);
      nroColumnas = grillaGuardada.length > 0 ? grillaGuardada[0].length : 50;
      nroFila = grillaGuardada.length  > 0 ? grillaGuardada.length : 30;
      actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada);
    }
  }

// ===============================================================================================================================
  return (

    <>
      <Grid container direction="column" justifyContent="center" >
        <Grid container direction="row" justifyContent="space-evenly" alignItems="center">
          <Grid container direction="row" item xs={3} spacing={0}>
            <Grid item xs={4}
            style={{marginRight: '-10px'}}
            >
            {/* Botón de Empezar/Parar simulación
                Al hacer click sobre el botón, este detecta si se se quiere empezar la simulación o se quiere parar
            */}
              <Button variant="contained" color="primary"
                disabled={cantColumnas === 0 || cantFila === 0 ? true : false}
                onClick={()=>{actEstadoBtnSimulacion()}}
                style={{width: '98.4px'}}
              >{recorrido ? 'Parar' : 'Empezar'}</Button>
            </Grid>
            <Grid item xs={4}>
            {/* Botón de Siguiente Turno
                Al hacer click sobre el botón, se avanza al siguiente turno en la simulación
            */}
              <Button variant="contained" color="primary"
                  disabled={cantColumnas === 0 || cantFila === 0 ? true : false}
                  onClick={()=>{
                    actualizarRecorrido(false);
                    recorridoRef.current = true;
                    correrSimulación();
                    recorridoRef.current = false;
                  }}
              ><NavigateNextIcon/></Button>
            </Grid>
            <Grid item xs={4}>
            {/* Botón Restablecer Células y dimensión de la Grilla
                Al hacer click sobre el botón, este restablece las células y el tamaño de la grilla a los valores predefinidos al inicio
            */}
              <Button variant="contained" color="primary"
                onClick={()=>{
                  actualizarTamanioGrilla(50,30);
                  actualizarContTurnos(0);
                  nroTurnoActual = 0;
                }}
              >Restablecer</Button>
            </Grid>
          </Grid>
          <Grid container direction="row" justifyContent="center" item xs={4} spacing={6}>
            <Grid item xs={3} >
              {/* Slot 1 para cargar o almacenar la Grilla en el Local Storage
                  Al hacer click sobre el botón este verificará que el Slot se encuentre vació o no,
                  y si ya lo tenemos seleccionado. Dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
              <BtnGuardarCargar
                nroGrilla={1}
                grillaSeleccionado={grillaSeleccionado}
                actGrillaSeleccionado={actGrillaSeleccionado}
                guardarCargarGrilla={guardarCargarGrilla}
                actualizarRecorrido={actualizarRecorrido}
              />
            </Grid>
            <Grid item xs={3}>
              {/* Slot 2 para cargar o almacenar la Grilla en el Local Storage
                  Al hacer click sobre el botón este verificará que el Slot se encuentre vació o no,
                  y si ya lo tenemos seleccionado. Dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
              <BtnGuardarCargar
                nroGrilla={2}
                grillaSeleccionado={grillaSeleccionado}
                actGrillaSeleccionado={actGrillaSeleccionado}
                guardarCargarGrilla={guardarCargarGrilla}
                actualizarRecorrido={actualizarRecorrido}
              />
            </Grid>
            <Grid item xs={3}>
              {/* Slot 3 para cargar o almacenar la Grilla en el Local Storage
                  Al hacer click sobre el botón este verificará que el Slot se encuentre vació o no,
                  y si ya lo tenemos seleccionado. Dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
              <BtnGuardarCargar
                nroGrilla={3}
                grillaSeleccionado={grillaSeleccionado}
                actGrillaSeleccionado={actGrillaSeleccionado}
                guardarCargarGrilla={guardarCargarGrilla}
                actualizarRecorrido={actualizarRecorrido}
              />
          </Grid>
          </Grid>
          <Grid  item xs={2}>
              {/* Slider para configurar el tiempo de ejecución de la simulación */}
              <Typography id="discrete-slider-small-steps" gutterBottom>
              Tiempo de Ejecución
              </Typography>
              <Slider
                defaultValue={300}
                aria-labelledby="discrete-slider-small-steps"
                step={100}
                marks={[
                  {value: 100,label: '0,1s'},
                  {value: 500,label: '0,5s'},
                  {value: 1000,label: '1s'}
                ]}
                min={100}
                max={1000}
                valueLabelDisplay="auto"
                onChange={(e) => {
                  let tiempo = parseInt(e.target.textContent);
                  if(!isNaN(tiempo) && tiempo !== 0){
                    actualizarTiempoTurno(tiempo);
                    actualizarRecorrido(false);
                  }
                }}
              />
          </Grid>
          <Grid container direction="column" alignItems="center" item xs={3}>
          {/* Campos para configurar el Tamaño de la Grilla */}
            <Typography id="discrete-slider-small-steps" gutterBottom>
            Tamaño de la Grilla
            </Typography>
            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Grid item xs={5}>
                <TextField id="n-filas" label="Filas"
                  type="number"
                  value={cantFila}
                  helperText="Valores permitidos entre 0 y 100"
                  onChange={(e) => {
                    if( 0 <= e.target.value && e.target.value <= 100){
                      actualizarTamanioGrilla(cantColumnas, e.target.value ? e.target.value : 0);
                    }

                  }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField  id="n-columnas" label="Columnas" 
                  type="number"
                  value={cantColumnas}
                  helperText="Valores permitidos entre 0 y 100"
                  onChange={(e) => {
                    if( 0 <= e.target.value && e.target.value <= 100){
                      actualizarTamanioGrilla(e.target.value ? e.target.value : 0, cantFila);
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>       
        <Grid  container direction="column" justifyContent="center" alignItems="center">
            <Typography variant="overline" display="block" gutterBottom>
              Turno: {contadorTurnos}
            </Typography>
          </Grid>  
        <Grid container direction="column" alignContent="center">
          <Grid id="grillaSimulacion"  item xs>
            {/* Grilla donde se verán el conjunto de células */}
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
          </Grid> 
        </Grid>
      </Grid>
    </>
  );
}

export default App;
