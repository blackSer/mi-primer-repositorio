/* ============================================================
   ESTILO DE ACORDEÓN "EXTENSIONES" (Estilo Propuesta 3)
   ============================================================ */

/* 1. Limpieza del contenedor del panel para quitar bordes grises feos */
.tab_in_sec .panel-group .panel {
    background-color: transparent;
    border: none;
    box-shadow: none;
    margin-bottom: 10px; /* Espacio entre cada botón */
}

.tab_in_sec .panel-default > .panel-heading {
    background-color: transparent;
    border: none;
    padding: 0;
}

.tab_in_sec .panel-title {
    font-size: 16px;
}

/* 2. DISEÑO DEL BOTÓN (Aquí aplicamos tus colores y la forma redonda) */
.tab_in_sec .panel-title a {
    display: block;
    width: 100%;
    
    /* COLORES EXTRAÍDOS */
    background-color: #283643; /* Azul Oscuro */
    color: #D8E338;            /* Amarillo Lima */
    
    /* FORMA Y TIPOGRAFÍA */
    padding: 12px 25px;
    border-radius: 50px;       /* Esto crea el efecto "Píldora" de la imagen */
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 700;          /* Negrita para que resalte el texto */
    font-family: 'Hind', sans-serif;
    letter-spacing: 0.5px;
    
    /* EFECTOS MODERNOS */
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0,0,0,0.15); /* Sombra suave para dar volumen */
    border: 1px solid transparent; /* Prepara el borde para el hover */
    position: relative;
}

/* 3. ESTADO HOVER (Al pasar el mouse) */
.tab_in_sec .panel-title a:hover {
    background-color: #344555; /* Un tono ligeramente más claro para interacción */
    color: #fff;               /* Texto blanco al pasar el mouse para contraste */
    transform: translateY(-2px); /* Se eleva un poco */
    box-shadow: 0 6px 12px rgba(0,0,0,0.25);
    cursor: pointer;
}

/* 4. ESTADO ACTIVO (Cuando el menú está abierto) */
/* Mantenemos el estilo corporativo pero indicamos que está "presionado" */
.tab_in_sec .panel-title a[aria-expanded="true"] {
    background-color: #283643;
    color: #fff; /* Texto blanco cuando está desplegado para diferenciar */
    box-shadow: inset 0 3px 5px rgba(0,0,0,0.2); /* Sombra interior (efecto presionado) */
    border: 1px solid #D8E338; /* Borde lima brillante */
}

/* Flechita indicadora opcional (si quieres que aparezca a la derecha) */
.tab_in_sec .panel-title a:after {
    content: "\f078"; /* Código unicode de flecha hacia abajo (FontAwesome) si lo usas */
    font-family: FontAwesome; /* Asegúrate de tener FontAwesome cargado, si no, quita esto */
    float: right;
    color: #D8E338;
    font-weight: normal;
    transition: transform 0.3s;
}

.tab_in_sec .panel-title a[aria-expanded="true"]:after {
    transform: rotate(180deg); /* Gira la flecha al abrir */
}

/* 5. CONTENIDO DESPLEGABLE (La lista interna) */
.tab_in_sec .panel-collapse .panel-body {
    border-top: none !important; /* Quita la línea divisoria predeterminada */
    padding: 15px 25px;
    background: #fff;
    margin-top: -15px; /* Sube un poco para conectar visualmente */
    padding-top: 25px; /* Compensa la subida */
    border-radius: 0 0 20px 20px; /* Redondea solo abajo */
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    position: relative;
    z-index: 0; /* Asegura que quede debajo del botón */
}