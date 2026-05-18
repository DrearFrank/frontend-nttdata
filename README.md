# Frontend NTT Data - Gestión de Productos

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) y Node.js. 
Se trata de una aplicación Frontend para el reto técnico de gestionar productos financieros, aplicando los principios de código limpio (Clean Code), SOLID y diseño adaptable a dispositivos móviles (Responsive Design).

## 🚀 Tecnologías y Entorno

- **Angular:** `v21.2.0` (Componentes Independientes, Formularios Reactivos, Programación Reactiva con RxJS)
- **Node.js:** `v24.7.0` (Recomendado)
- **NPM:** `v11.5.1`
- **Estilos:** SCSS puro (Variables CSS, Flexbox, metodología BEM ligera)
- **Pruebas:** Jest con `jest-preset-angular`

## 📦 Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/DrearFrank/frontend-nttdata.git
   cd frontend-nttdata
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**
   ```bash
   npm start
   ```
   *La aplicación correrá en `http://localhost:4200/`.*
   *Nota: Es necesario tener ejecutando el proyecto backend para que los servicios respondan correctamente, a través del proxy configurado internamente por el archivo `proxy.conf.json`.*

## ✨ Características Implementadas

1. **Catálogo y Paginación (Listado)**
   - Listado de productos recuperados desde la base de datos con presentación de fecha formateada.
   - Menú de acciones (Editar, Eliminar) desplegable por fila, ajustado de manera segura en pantallas grandes y teléfonos móviles.
   - Paginación local interactiva (`Anterior`, `Siguiente`) y selección de cantidad de resultados por página (5, 10, o 20).
   - Buscador integrado y en tiempo real filtrando (por ID, Nombre o Descripción).

2. **Gestión de Formularios (Alta y Edición)**
   - Formularios reactivos dinámicos.
   - Validaciones asíncronas para comprobar (con un retraso controlado) si el ID ingresado ya existe en la base de datos sin saturar el servidor.
   - Manejo automático de reglas de negocio: La fecha de reestructuración se autocompleta sumando 1 año exacto a la fecha de liberación ingresada.
   - Captura y adaptación amigable de los errores de validación que provienen del servidor.

3. **Arquitectura e Interfaz de Usuario (UI/UX)**
   - **Código Limpio & SOLID:** Aprovechamiento de la inyección de dependencias (`inject()`), delegación completa de obtención de datos a servicios (`ProductService`), componentes independientes y aislados sin depender de módulos centrales.
   - **Diseño Adaptable (Responsive):** La vista de tabla (añadiendo desplazamiento horizontal) y el formulario (cambio de 2 columnas a 1 columna) se adaptan de forma fluida a vistas en móviles gracias al uso de Media Queries y Flexbox. Estilos refactorizados y simplificados con SCSS.
   - **Pantallas de Precarga (Skeletons):** Se dibuja un esqueleto con animación de pulso que toma el lugar visual de la tabla (durante el listado) o de un bloque (durante la carga del formulario), evitando parpadeos bruscos y mejorando la experiencia del usuario final.

## 🧪 Ejecutar Pruebas

Para ejecutar las pruebas unitarias del proyecto:

```bash
npm run test
```
*(Utilizando Jest como runner de pruebas unitarias para Angular)*

## 📄 Estructura Principal

```text
src/
└── app/
    ├── core/               # Interfaces, Modelos y Servicios principales (API)
    ├── features/           # Componentes base agrupados por dominio de negocio
    │   └── products/
    │       ├── product-list
    │       └── product-form
    └── shared/             # Componentes genéricos y de interfaz pura
        ├── confirm-modal   # Modal de confirmación para eliminar
        └── skeleton-loader # Componente reutilizable de precarga visual
```
