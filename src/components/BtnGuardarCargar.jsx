import React, {useState} from "react";
import Button from '@material-ui/core/Button';

const BtnGuardarCargar = ({nroGrilla, grillaSeleccionado, actGrillaSeleccionado, guardarCargarGrilla, actualizarRecorrido}) => {


  return(
    <Button id={"btnGuardarCargar-"+nroGrilla} variant={grillaSeleccionado === nroGrilla ? 'contained' : 'outlined'} color='primary'
      onClick={(e)=>{

        let btnSeleccionado = isNaN(e.target.parentNode.id.split('-')[1]) ? e.target.id.split('-')[1] : e.target.parentNode.id.split('-')[1];
        btnSeleccionado = parseInt(btnSeleccionado);

        let grillaGuardada = JSON.parse(localStorage.getItem('grilla'+nroGrilla)) ? JSON.parse(localStorage.getItem('grilla'+nroGrilla)) : [];

        if(btnSeleccionado !== grillaSeleccionado && grillaGuardada.length > 0){
          guardarCargarGrilla(nroGrilla, 'cargar');
        }if(btnSeleccionado !== grillaSeleccionado && grillaGuardada.length === 0){
          guardarCargarGrilla(nroGrilla, 'guardar');
        }else if(btnSeleccionado === grillaSeleccionado){
          guardarCargarGrilla(nroGrilla, 'guardar');
        }

        actGrillaSeleccionado(nroGrilla);
        actualizarRecorrido(false);
      }}
   >{grillaSeleccionado === nroGrilla ? 'Guardar '+nroGrilla : 'Cargar  '+nroGrilla}</Button>
  )


}

export default BtnGuardarCargar;