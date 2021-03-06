/*Componente Personalizado para Cargar o Guardar las Grillas en el LocalStorage*/
import Button from '@material-ui/core/Button';

/*
 Componente de los botones de Guardar/Cargar.
 Este identificará si cada Slot contiene una grilla almacenada en el Local Storage y según lo que encuentre, mostrará la función disponible a ejecutar
*/

const BtnGuardarCargar = ({nroGrilla, grillaSeleccionado, actGrillaSeleccionado, guardarCargarGrilla, actualizarRecorrido}) => {
  const grillaGuardada = JSON.parse(localStorage.getItem('grilla'+nroGrilla)) ? JSON.parse(localStorage.getItem('grilla'+nroGrilla)) : [];
  let operacion, texto;

  if(nroGrilla !== grillaSeleccionado && grillaGuardada.length > 0){
    operacion = 'cargar';
    texto = 'Cargar  '+nroGrilla;
  }if(nroGrilla !== grillaSeleccionado && grillaGuardada.length === 0){
    operacion = 'guardar';
    texto = 'Guardar '+nroGrilla;
  }else if(nroGrilla === grillaSeleccionado){
    operacion = 'guardar';
    texto = 'Guardar '+nroGrilla;
  }


  return(
    <Button id={"btnGuardarCargar-"+nroGrilla} variant={grillaSeleccionado === nroGrilla ? 'contained' : 'outlined'} color='primary'
      onClick={(e)=>{
        guardarCargarGrilla(nroGrilla, operacion);
        actGrillaSeleccionado(nroGrilla);
        actualizarRecorrido(false);
      }}
   >{texto}</Button>
  )
}

export default BtnGuardarCargar;