# Aplicación basado en el Juego de la Vida de Conway y desarrollado en React
[¡¡¡HAGA CLICK PARA INICIAR APLICACIÓN!!!](https://fabrijuncal.github.io/game-of-life/)

![](https://raw.githubusercontent.com/FabriJuncal/game-of-life/master/public/img/Gospers_glider_gun.gif)

> Más información en Wikipedia: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

El juego de la vida es un autómata celular diseñado por el matemático británico John Horton Conway en 1970. El juego es realmente una simulación, formada por una grilla de “células” que se extiende por el infinito en todas las direcciones. Por tanto, cada célula tiene 8 células "vecinas", que son las que están próximas a ella, incluidas las diagonales.<br>
Las células tienen dos estados: están "vivas" o "muertas".<br>
El estado de las células evoluciona por turnos. El estado de todas las células se tiene en cuenta para calcular el estado de las mismas al turno siguiente.

<br>

Todas las células se actualizan simultáneamente en cada turno, siguiendo estas reglas:

* Una célula muerta con exactamente 3 células vivas vecinas, “nace” (es decir, al turno
siguiente estará viva).
* Una célula viva con 2 o 3 células vecinas vivas se mantiene viva.
* Una célula viva con menos de 2 células vecinas vivas muere de “soledad”
* Una célula viva con más de 3 células vecinas vivas muere por “sobrepoblación”

## Algunos Patrones
 ![](https://raw.githubusercontent.com/FabriJuncal/game-of-life/master/public/img/algunos-patrones.JPG)

## Interfaz de la Aplicación
 ![](https://raw.githubusercontent.com/FabriJuncal/game-of-life/master/public/img/interfazApp.JPG)

La interfaz fue desarrollada con los componentes de [MATERIAL-UI](https://material-ui.com/)


