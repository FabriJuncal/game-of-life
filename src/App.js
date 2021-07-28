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
  let grillaGuardada2 = JSON.parse(localStorage.getItem('grilla2')) ? JSON.parse(localStorage.getItem('grilla2')) : [];
  let grillaGuardada3 = JSON.parse(localStorage.getItem('grilla3')) ? JSON.parse(localStorage.getItem('grilla3')) : [];

  let nroTurno1 = localStorage.getItem('nroTurno1') ? parseInt(localStorage.getItem('nroTurno1')) : 0;
  let nroTurno2 = localStorage.getItem('nroTurno2') ? parseInt(localStorage.getItem('nroTurno2')) : 0;
  let nroTurno3 = localStorage.getItem('nroTurno3') ? parseInt(localStorage.getItem('nroTurno3')) : 0;

  let nroTurnoActual = nroTurno1;

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
  const [grillaSeleccionado1, actGrillaSeleccionado1] = useState(true);
  const [grillaSeleccionado2, actGrillaSeleccionado2] = useState(false);
  const [grillaSeleccionado3, actGrillaSeleccionado3] = useState(false);
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
      if(nroGrillaGuardada === 1){
        localStorage.setItem('grilla1', JSON.stringify(grilla));
        localStorage.setItem('nroTurno1', contadorTurnos);
      }
  
      if(nroGrillaGuardada === 2){
        localStorage.setItem('grilla2', JSON.stringify(grilla));
        localStorage.setItem('nroTurno2', contadorTurnos);
      }
  
      if(nroGrillaGuardada === 3){
        localStorage.setItem('grilla3', JSON.stringify(grilla));
        localStorage.setItem('nroTurno3', contadorTurnos);
      }
    }

    if(operacion === 'cargar'){

      let nroColumnas;
      let nroFila
      ;
      if(nroGrillaGuardada === 1){
        grillaGuardada1 = JSON.parse(localStorage.getItem('grilla1'));
        nroTurno1 = parseInt(localStorage.getItem('nroTurno1'));
        nroTurnoActual = nroTurno1;
        actualizarContTurnos(nroTurnoActual);
        nroColumnas = grillaGuardada1.length > 0 ? grillaGuardada1[0].length : 50;
        nroFila = grillaGuardada1.length  > 0 ? grillaGuardada1.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada1);
      }
  
      if(nroGrillaGuardada === 2){
        grillaGuardada2 = JSON.parse(localStorage.getItem('grilla2'));
        nroTurno2 = parseInt(localStorage.getItem('nroTurno2'));
        nroTurnoActual = nroTurno2;
        actualizarContTurnos(nroTurnoActual);
        nroColumnas = grillaGuardada2.length > 0 ? grillaGuardada2[0].length : 50;
        nroFila = grillaGuardada2.length  > 0 ? grillaGuardada2.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada2);
      }
  
      if(nroGrillaGuardada === 3){
        grillaGuardada3 = JSON.parse(localStorage.getItem('grilla3'));
        nroTurno3 = parseInt(localStorage.getItem('nroTurno3'));
        nroTurnoActual = nroTurno3;
        actualizarContTurnos(nroTurnoActual);
        nroColumnas = grillaGuardada3.length > 0 ? grillaGuardada3[0].length : 50;
        nroFila = grillaGuardada3.length  > 0 ? grillaGuardada3.length : 30;
        actualizarTamanioGrilla(nroColumnas, nroFila, grillaGuardada3);
      }
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
                  y si ya lo tenemos seleccionado, dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
              <Button variant={grillaSeleccionado1 ? 'contained' : 'outlined'} color='primary'
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
            </Grid>
            <Grid item xs={3}>
              {/* Slot 2 para cargar o almacenar la Grilla en el Local Storage
                  Al hacer click sobre el botón este verificará que el Slot se encuentre vació o no,
                  y si ya lo tenemos seleccionado, dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
                <Button variant={grillaSeleccionado2 ? 'contained' : 'outlined'} color='primary'
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
            </Grid>
            <Grid item xs={3}>
              {/* Slot 3 para cargar o almacenar la Grilla en el Local Storage
                  Al hacer click sobre el botón este verificará que el Slot se encuentre vació o no,
                  y si ya lo tenemos seleccionado, dependiendo de estos factores se podrá Almacenar o Cargar la grilla
              */}
              <Button variant={grillaSeleccionado3 ? 'contained' : 'outlined'} color='primary'
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
