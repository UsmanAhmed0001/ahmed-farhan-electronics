import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Fan,
  Snowflake,
  Power,
  AirVent,
  Gauge,
  Truck,
  Refrigerator,
  Tv,
  UserCog,
  Mail,
  MapPin,
  Star,
  ImageIcon,
  PhoneCall,
  ClipboardList,
  Wrench,
  ShieldCheck,
  Send,
} from "lucide-react";

const BRAND = {
  navy: "#2B2F86",
  maroon: "#8E2A33",
  sky: "#8CB0CE",
};

const LOGO_KENWOOD = `<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2500" viewBox="-6.52 78.09 205.80 36.58"><g fill-rule="evenodd" clip-rule="evenodd"><path d="M49.548 109.614v-27.87h3.818l16.893 24.721V81.744h2.864v27.87h-4.2L52.412 85.275v24.339h-2.864zM26.505 81.744v27.87h18.994v-2.481H29.368v-10.69h14.89v-2.482h-14.89v-9.735h16.131v-2.482H26.505zM2.834 81.744v27.87h2.864v-27.87H2.834zM9.661 94.868l14.078-13.124h-3.961L5.748 94.82l14.984 14.794h3.818L9.661 94.868zM75.168 81.744l12.503 29.875 5.632-12.504 5.631 12.504 12.504-29.875h-3.055l-9.641 22.907-5.439-11.835-5.441 11.93-9.64-23.002h-3.054z"/><path fill="#cc2229" d="M88.721 81.744h9.164l-4.582 10.213-4.582-10.213z"/><path d="M176.559 81.649h-9.258v27.87h10.785c6.682 0 11.836-6.299 11.836-14.412 0-7.827-6.873-13.458-13.363-13.458zm1.05 25.388h-7.445V84.13h6.109c3.721 0 10.785 3.627 10.785 11.263.001 8.017-5.537 11.644-9.449 11.644zM122.951 81.138c-7.117 0-12.889 6.617-12.889 14.78s5.771 14.78 12.889 14.78c7.119 0 12.893-6.617 12.893-14.78s-5.774-14.78-12.893-14.78zm0 26.996c-5.553 0-10.055-5.47-10.055-12.216s4.502-12.216 10.055-12.216c5.555 0 10.057 5.47 10.057 12.216s-4.502 12.216-10.057 12.216zM151.1 81.138c-7.119 0-12.889 6.617-12.889 14.78s5.77 14.78 12.889 14.78 12.891-6.617 12.891-14.78-5.772-14.78-12.891-14.78zm0 26.996c-5.553 0-10.055-5.47-10.055-12.216s4.502-12.216 10.055-12.216c5.555 0 10.057 5.47 10.057 12.216s-4.503 12.216-10.057 12.216z"/></g></svg>`;

const LOGO_GREE = `<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2500" viewBox="-0.28 75.51 193.32 41.73"><g fill-rule="evenodd" clip-rule="evenodd"><path d="M28.949 78.99c9.008 0 16.685 4.998 19.397 11.899H26.395l-9.303 19.638c-5.191-3.158-8.587-8.326-8.587-14.149-.001-9.577 9.183-17.388 20.444-17.388z" fill="#33348e"/><path d="M49.211 94.062c.12.758.183 1.531.183 2.315 0 9.577-9.184 17.388-20.445 17.388-1.546 0-3.052-.148-4.501-.428l5.313-12.137c1.122-2.561-.436-5.059-3.168-7.139h22.618v.001z" fill="#cc2229"/><path d="M93.515 85.386h-20.25c-5.333 0-12.045 5.4-13.273 10.53l-.848 3.544c-1.768 7.383 2.848 12.148 7.52 12.148H82.56c2.531 0 5.281-3.088 5.889-5.568l2.533-10.328-13.976.102-1.966 3.646h6.378c1.051 0 .524 2.133.18 3.139l-1.144 3.34c-.375 1.098-1.38 2.432-2.525 2.432h-7.594c-3.192 0-3.719-5.9-2.885-9.012l.95-3.544c.984-3.674 5.319-7.087 9.088-7.087h15.187l.84-3.342zm90.737 0h-15.699c-5.332 0-12.045 5.4-13.273 10.53l-.848 3.544c-1.768 7.383 2.848 12.148 7.52 12.148h15.896l.855-3.215h-13.152v-.027c-3.098-.088-3.631-5.811-2.836-8.92h18.023l.795-3.162H163.56l.127-.47c.984-3.674 5.318-7.087 9.088-7.087h10.637c.279-1.113.561-2.227.84-3.341zm-29.15 0h-15.699c-5.334 0-12.047 5.4-13.273 10.53l-.85 3.544c-1.768 7.383 2.85 12.148 7.521 12.148h15.896l.854-3.215h-13.152v-.027c-3.096-.088-3.629-5.811-2.836-8.92h18.023l.795-3.162H134.41l.125-.47c.984-3.674 5.32-7.087 9.088-7.087h10.637c.281-1.113.56-2.227.842-3.341zm-57.487 0l-6.479 26.122 8.403.102 5.467-22.983h10.43c1.404 0 2.172 2.365 1.924 3.746-.283 1.574-1.945 3.999-4.455 3.999h-7.67l8.277 15.137h9.416l-6.682-11.947c4.352-.629 8.77-3.92 9.012-8.507.115-2.216-2.164-5.667-6-5.667H97.615v-.002z" fill="#33348e"/></g></svg>`;

const LOGO_ORIENT = `<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2500" viewBox="-6.52 75.31 205.80 42.14"><g fill-rule="evenodd" clip-rule="evenodd"><path d="M72.031 79.805H88.03v3.296h-2.52a2.525 2.525 0 0 0-2.519 2.52h-.001v21.514h.001a2.524 2.524 0 0 0 2.519 2.52h2.52v3.297H72.031v-3.297h2.52a2.525 2.525 0 0 0 2.52-2.52V85.621a2.525 2.525 0 0 0-2.52-2.52h-2.52v-3.296zm-15.485 0c4.785 0 8.7 3.779 8.7 8.397 0 4.209-3.252 7.72-7.451 8.309 2.423 1.092 4.039 2.518 4.802 5.037l.362 4.104c.832 2.617 2.938 3.982 5.958 4.002v3.297H57.121v-10.979c-.06-2.5-1.836-4.828-4.875-4.588H46.39v9.75a2.524 2.524 0 0 0 2.519 2.52h3.001v3.297H35.671v-3.297h3.242a2.524 2.524 0 0 0 2.519-2.52V85.621a2.525 2.525 0 0 0-2.519-2.52h-3.242v-3.296h20.875zM46.39 93.523h6.925c2.788 0 5.07-2.281 5.07-5.07 0-2.788-2.282-5.069-5.07-5.069H46.39v10.139zm44.896-13.718h29.101v12.591h-2.836c0-5.119-4.176-9.294-9.295-9.294h-6.01v10.816h3.762a2.797 2.797 0 0 0 2.791-2.792V87.32h2.838v16.491h-2.838v-3.805a2.798 2.798 0 0 0-2.791-2.793h-3.762v12.441h6.01c5.119 0 9.295-4.174 9.295-9.295v-1.545h2.836v14.137H91.286v-3.297h2.52a2.524 2.524 0 0 0 2.52-2.52V85.621a2.525 2.525 0 0 0-2.52-2.52h-2.52v-3.296zm52.603 0h14.545v3.296h-2.064a2.524 2.524 0 0 0-2.52 2.52v27.331h-5.195l-15.678-24.576v18.76h.002a2.523 2.523 0 0 0 2.518 2.52h2.52v3.297H123.38v-3.297h2.52a2.524 2.524 0 0 0 2.52-2.52V85.621a2.524 2.524 0 0 0-2.52-2.52h-2.52v-3.296h11.422l14.58 22.005V85.62a2.525 2.525 0 0 0-2.52-2.52h-2.973v-3.295zm43.197 12.591v.934h2.836V79.805h-28.598V93.33h2.838v-.934c0-4.689 3.504-8.587 8.027-9.208v23.947a2.523 2.523 0 0 1-2.518 2.52h-3.852v3.297h18.66v-3.297h-3.85a2.525 2.525 0 0 1-2.52-2.52V83.107c4.983.17 8.977 4.299 8.977 9.289zM19.235 113.938c9.034 0 16.4-7.889 16.4-17.56s-7.367-17.56-16.4-17.56-16.401 7.889-16.401 17.56 7.368 17.56 16.401 17.56zm0-4.284c5.333 0 9.684-5.963 9.684-13.276 0-7.312-4.351-13.277-9.684-13.277-5.334 0-9.684 5.964-9.684 13.277 0 7.313 4.35 13.276 9.684 13.276z"/></g></svg>`;

const LOGO_SAMSUNG = `<svg height="667" width="2500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32"><path d="M0 0h120v32H0z" fill="none"/><path d="M8 19.651v-1.14h3.994v1.45a1.334 1.334 0 0 0 1.494 1.346 1.3 1.3 0 0 0 1.444-1.007 1.833 1.833 0 0 0-.026-1.113c-.773-1.944-6.055-2.824-6.726-5.854a5.347 5.347 0 0 1-.025-2.02C8.567 8.88 10.705 8 13.359 8c2.113 0 5.025.492 5.025 3.754v1.062h-3.71v-.932a1.275 1.275 0 0 0-1.392-1.347 1.25 1.25 0 0 0-1.365 1.01 2.021 2.021 0 0 0 .026.777c.437 1.734 6.081 2.667 6.7 5.8a6.943 6.943 0 0 1 .025 2.46C18.307 23.068 16.091 24 13.412 24 10.6 24 8 22.99 8 19.651zm48.392-.051v-1.14h3.943v1.424A1.312 1.312 0 0 0 61.8 21.23a1.286 1.286 0 0 0 1.443-.984 1.759 1.759 0 0 0-.025-1.088c-.748-1.915-5.979-2.8-6.648-5.825a5.215 5.215 0 0 1-.026-1.994c.415-2.407 2.556-3.287 5.156-3.287 2.088 0 4.973.518 4.973 3.728v1.036h-3.684v-.906a1.268 1.268 0 0 0-1.365-1.346 1.2 1.2 0 0 0-1.34.984 2.017 2.017 0 0 0 .025.777c.412 1.734 6 2.641 6.623 5.747a6.806 6.806 0 0 1 .025 2.434c-.361 2.486-2.551 3.392-5.2 3.392-2.787.002-5.365-1.011-5.365-4.298zm14.121.545a5.876 5.876 0 0 1-.025-.985V8.44h3.762v11.055a4.111 4.111 0 0 0 .025.57 1.468 1.468 0 0 0 2.835 0 3.97 3.97 0 0 0 .026-.57V8.44H80.9v10.718c0 .285-.026.829-.026.985-.257 2.8-2.448 3.7-5.179 3.7s-4.924-.905-5.182-3.7zm30.974-.156a7.808 7.808 0 0 1-.052-.989v-6.288c0-.259.025-.725.051-.985.335-2.795 2.577-3.675 5.231-3.675 2.629 0 4.947.88 5.206 3.676a7.185 7.185 0 0 1 .025.985v.487h-3.762v-.824a3.1 3.1 0 0 0-.051-.57 1.553 1.553 0 0 0-2.964 0 3.088 3.088 0 0 0-.051.7v6.834a4.17 4.17 0 0 0 .026.57 1.472 1.472 0 0 0 1.571 1.09 1.406 1.406 0 0 0 1.52-1.087 2.09 2.09 0 0 0 .026-.57v-2.178h-1.52V14.99H112V19a7.674 7.674 0 0 1-.052.984c-.257 2.718-2.6 3.676-5.231 3.676s-4.973-.955-5.23-3.673zm-52.438 3.389l-.1-13.825-2.58 13.825h-3.762L40.055 9.553l-.1 13.825h-3.713l.309-14.912h6.056l1.881 11.651 1.881-11.651h6.055l.335 14.912zm-19.79 0l-2.01-13.825-2.062 13.825h-4.019L23.9 8.466h6.623l2.732 14.912zm62.977-.155L88.5 10.822l.206 12.4h-3.66V8.466h5.514l3.5 12.013-.201-12.013h3.685v14.758z"/></svg>`;

const LOGO_LG = `<svg height="1222" width="2500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 268.23599999999993 131.381"><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="47.901" x2="47.901" y1="2.557" y2="101.558"><stop offset=".06" stop-color="#e3838d"/><stop offset=".385" stop-color="#ce3d61"/><stop offset=".632" stop-color="#b50a3e"/></linearGradient><linearGradient id="b" gradientUnits="userSpaceOnUse" x1="54.219" x2="54.219" y1="8.386" y2="100.904"><stop offset=".082" stop-color="#fff"/><stop offset=".35" stop-color="#fcfcfc"/><stop offset=".527" stop-color="#f3f3f3"/><stop offset=".679" stop-color="#e4e4e4"/><stop offset=".815" stop-color="#cfcfcf"/><stop offset=".941" stop-color="#b4b4b4"/><stop offset=".945" stop-color="#b3b3b3"/></linearGradient><circle cx="54.539" cy="54.539" fill="#b50a3e" r="54.539"/><path d="M93.317 52.057c0 27.338-21.886 49.5-46.417 49.5S2.484 79.395 2.484 52.057s24.969-49.5 49.5-49.5 41.333 22.162 41.333 49.5z" fill="url(#a)"/><path d="M67.728 52.705v5h28.504c-.622 10.402-5.089 19.75-12.011 26.676-7.473 7.471-17.774 12.082-29.174 12.082-11.402 0-21.701-4.611-29.176-12.082-7.469-7.477-12.083-17.775-12.083-29.175 0-11.402 4.615-21.701 12.083-29.176 7.475-7.471 17.774-12.083 29.176-12.083l2.262-.002V8.946h-2.262c-25.549.003-46.258 20.71-46.26 46.261.002 25.55 20.711 46.257 46.26 46.259 25.549-.002 46.258-20.709 46.26-46.259v-2.501H67.728zM30.712 37.916a6.831 6.831 0 1 0 13.662 0 6.831 6.831 0 0 0-13.662 0zm21.62-6.658v48.193h15.522v-5H57.332l.002-43.193z" fill="#4d4d4d" opacity=".8"/><path d="M66.9 52.145v5h28.504c-.622 10.401-5.089 19.749-12.011 26.675-7.473 7.471-17.774 12.083-29.174 12.083-11.402 0-21.701-4.612-29.176-12.083-7.468-7.476-12.083-17.775-12.083-29.174 0-11.402 4.615-21.701 12.083-29.176 7.475-7.471 17.774-12.083 29.176-12.083l2.262-.002V8.386h-2.262c-25.549.002-46.258 20.709-46.26 46.26.002 25.549 20.711 46.256 46.26 46.258 25.549-.002 46.258-20.709 46.26-46.258v-2.501zm-37.015-14.79a6.831 6.831 0 1 0 13.662 0 6.831 6.831 0 0 0-13.662 0zm21.619-6.657v48.193h15.522V73.89H56.504l.002-43.192z" fill="url(#b)"/><g fill="#6e6e70"><path d="M247.134 84.058c-8.385 4.659-17.59 6.424-27.069 6.424-24.871 0-34.815-14.076-34.815-36.112s10.693-36.367 34.815-36.367c10.208 0 19.582 2.373 27.199 11.488l-10.239 9.365c-3.871-5.245-9.76-7.742-16.96-7.742-14.257 0-19.127 10.442-19.127 23.256s3.496 22.571 19.127 22.571c6.198 0 9.696-.695 12.34-2.248V62.405h-13.111V49.719h27.841v34.339zM133.234 19.557v70h49.667v-14h-33.333V19.592zM133.539 130.944v-21.001h3.243v18.14h8.786v2.861zM147.927 113.449v-3.186h3.242v3.186zm.09 17.495V115.99h3.062v14.954zM158.586 118.556v12.388h-3.062v-12.388h-1.742v-2.301h1.742v-2.301c0-2.153 1.321-4.159 4.174-4.159h3.578v2.566h-3.008c-1.141 0-1.682.649-1.682 1.74v2.153h4.814v2.301h-4.814zM168.1 124.337c0 2.565 1.381 4.188 3.874 4.188 1.712 0 2.612-.472 3.693-1.533l1.952 1.799c-1.562 1.534-3.033 2.33-5.706 2.33-3.813 0-6.847-1.976-6.847-7.669 0-4.837 2.553-7.639 6.457-7.639 4.084 0 6.456 2.949 6.456 7.196v1.328zm6.425-4.129c-.48-1.121-1.561-1.888-3.002-1.888s-2.553.767-3.033 1.888c-.301.679-.36 1.121-.391 2.035h6.847c-.03-.914-.12-1.357-.421-2.035zM189.007 131.121c-2.493 0-4.595-.413-6.396-2.153l2.012-1.976c1.231 1.238 2.883 1.563 4.385 1.563 1.861 0 3.333-.649 3.333-2.065 0-1.003-.57-1.651-2.042-1.77l-2.433-.206c-2.853-.236-4.504-1.505-4.504-4.13 0-2.92 2.553-4.571 5.735-4.571 2.282 0 4.234.472 5.646 1.681l-1.922 1.918c-.961-.797-2.312-1.092-3.754-1.092-1.832 0-2.763.797-2.763 1.917 0 .885.48 1.563 2.103 1.711l2.402.206c2.853.236 4.534 1.563 4.534 4.219 0 3.126-2.702 4.748-6.336 4.748zM219.031 113.848c-3.037-1.556-6.298-1.221-6.298-1.221-1.432.109-2.402.501-3.152 1.298-1.052 1.121-1.292 2.301-1.292 6.519s.24 5.427 1.292 6.548c.75.796 1.892 1.269 3.152 1.269 0 0 2.735.202 4.564-.49v-5.469h-4.564v-2.713h7.808v3.215l-.048 7.519c-4.027 1.058-7.63.806-7.76.799-2.136-.106-4.144-.796-5.615-2.241-2.102-2.064-2.072-4.395-2.072-8.436s-.029-6.371 2.072-8.436c1.472-1.445 3.333-2.242 5.615-2.242 0 0 4.471-.388 8.101 1.859zM235.45 129.351c-.991 1.003-2.492 1.77-4.564 1.77s-3.543-.767-4.534-1.77c-1.441-1.475-1.802-3.362-1.802-5.899 0-2.507.36-4.395 1.802-5.869.991-1.003 2.462-1.77 4.534-1.77s3.573.767 4.564 1.77c1.441 1.475 1.802 3.362 1.802 5.869 0 2.537-.36 4.424-1.802 5.899zm-2.312-9.999c-.57-.561-1.352-.855-2.252-.855s-1.651.295-2.223.855c-.931.914-1.051 2.478-1.051 4.1 0 1.623.12 3.186 1.051 4.101.571.561 1.322.885 2.223.885s1.682-.324 2.252-.885c.932-.915 1.051-2.478 1.051-4.101-.001-1.622-.12-3.186-1.051-4.1zM251.086 129.351c-.991 1.003-2.492 1.77-4.564 1.77s-3.544-.767-4.534-1.77c-1.441-1.475-1.802-3.362-1.802-5.899 0-2.507.36-4.395 1.802-5.869.99-1.003 2.462-1.77 4.534-1.77s3.573.767 4.564 1.77c1.441 1.475 1.802 3.362 1.802 5.869 0 2.537-.361 4.424-1.802 5.899zm-2.313-9.999c-.57-.561-1.351-.855-2.252-.855s-1.651.295-2.222.855c-.932.914-1.052 2.478-1.052 4.1 0 1.623.12 3.186 1.052 4.101.57.561 1.32.885 2.222.885s1.682-.324 2.252-.885c.931-.915 1.052-2.478 1.052-4.101 0-1.622-.121-3.186-1.052-4.1zM265.234 130.944v-1.593c-1.141 1.356-2.372 1.77-4.023 1.77-1.532 0-2.883-.501-3.725-1.327-1.531-1.504-1.711-4.07-1.711-6.342 0-2.271.18-4.808 1.711-6.312.842-.826 2.162-1.327 3.694-1.327 1.621 0 2.883.383 3.993 1.681v-7.551h3.063v21.001zm-3.213-12.447c-2.763 0-3.184 2.301-3.184 4.955 0 2.655.421 4.985 3.184 4.985s3.152-2.33 3.152-4.985c.001-2.655-.389-4.955-3.152-4.955zM182.197 112.376v-2.665h-2.855v2.665s.102 2.075-.786 3.554l1.655 1.541c2.047-1.407 1.986-5.095 1.986-5.095z"/></g></svg>`;

const LOGO_MITSUBISHI = `<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2156" viewBox="8 6 480 414"><path d="M248 6l82 139-82 139-82-138L248 6zm0 278h160l80 136H328l-80-136zm0 0H88L8 420h160l80-136z" fill="#e60012"/></svg>`;

const LOGO_HITACHI = `<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2500" viewBox="6.45 80.71 179.86 31.33"><g fill-rule="evenodd" clip-rule="evenodd"><path fill="#cf4044" d="M139.268 83.775h6.646v10.056h13.463V83.775h6.648v25.118h-6.648V97.812h-13.463v11.081h-6.646V83.775zM14.623 83.775h6.649v10.056h13.461V83.775h6.69v25.118h-6.69V97.812H21.272v11.081h-6.649V83.775zM46.922 83.775h6.732v25.118h-6.732V83.775zM171.402 83.775h6.731v25.118h-6.731V83.775zM56.116 83.775H82.26v4.186h-9.768v20.932h-6.608V87.961h-9.768v-4.186zM88.005 99.289l4.638-11.205 4.597 11.205h-9.235zm10.917 3.981l2.299 5.623h7.512L96.871 83.816h-8.414l-11.943 25.077h7.469l2.34-5.623h12.599zM128.965 92.312h6.814c-.084-4.556-4.023-8.906-13.176-8.988-6.812-.041-15.062 2.75-15.104 12.969-.041 10.137 8.373 13.297 15.104 13.133 6.197-.205 13.092-1.928 13.381-9.562l-6.855.041c-.205 4.762-4.021 5.705-6.525 5.746-2.586 0-7.881-.533-7.961-9.234-.082-8.208 4.76-9.357 7.961-9.357 3.16.04 6.32 1.518 6.361 5.252z"/></g></svg>`;

const LOGO_DAIKIN = `<svg height="538" viewBox="1 1 298 62.617" width="2500" xmlns="http://www.w3.org/2000/svg"><path d="m68.872 1h-67.87v62.617z" fill="#44c8f5"/><path d="m34.93 1h-33.93v31.323z" fill="#231f20"/><path d="m163.645 14.591-8.86 35.422h15.654l8.853-35.422zm-35.75 20.529h-3.59l5.789-10.218 1.877 10.219zm-2.227-20.533-20.13 35.42h10.352l3.342-5.903h14.372l1.07 5.904h15.28l-6.494-35.42zm109.463.004-8.836 35.422h15.65l8.837-35.422zm-6.995 0h-16.04l-13.425 11.587 2.93-11.587h-15.003l-8.836 35.422h14.956l3.055-12.228 7.997 12.228h18.103l-13.408-18.55zm-134.882 16.097s-1.016 11.506-10.82 11.506h-5.547l4.886-19.106h5.034c1.801.011 7.015.479 6.447 7.6zm-.793-16.08-4.049-.013h-19.585l-8.837 35.407h19.448l7.694.011c10.833 0 21.494-8.064 21.494-20.416 0-14.533-16.166-14.99-16.166-14.99m195.705-.021-5.22 20.857-6.956-20.857h-17.407l-8.843 35.427h10.824l5.271-21.04 6.977 21.04h17.333l8.856-35.427z" fill="#00a0e4"/></svg>`;

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ACSketch({ drawn, className = "" }) {
  return (
    <svg
      viewBox="0 0 200 140"
      className={`sketch-icon ${drawn ? "sketch-drawn" : ""} ${className}`}
      style={{ stroke: BRAND.navy }}
    >
      <rect x="6" y="50" width="22" height="6" rx="2" fill="none" strokeWidth="2.5" opacity="0.5" />
      <rect x="172" y="50" width="22" height="6" rx="2" fill="none" strokeWidth="2.5" opacity="0.5" />
      <rect x="20" y="30" width="160" height="60" rx="14" fill="none" strokeWidth="3" />
      <line x1="20" y1="48" x2="180" y2="48" strokeWidth="2" />
      <line x1="40" y1="64" x2="160" y2="64" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="74" x2="160" y2="74" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="84" x2="160" y2="84" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="160" cy="40" r="3.5" fill="none" strokeWidth="2.5" />
    </svg>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCooling, setIsCooling] = useState(false);
  const navLinks = ["Services", "Why Us", "Areas", "Contact"];

  const panelRefs = useRef([]);
  const [panelProgress, setPanelProgress] = useState([0, 0, 0]);
  const processRefs = useRef([]);
  const [processProgress, setProcessProgress] = useState([0, 0, 0, 0]);

  useEffect(() => {
    let frame = null;
    const measure = () => {
      const vh = window.innerHeight;
      const center = vh / 2;
      const compute = (el) => {
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distance = Math.abs(elCenter - center);
        return Math.max(0, 1 - distance / (vh * 0.7));
      };
      setPanelProgress(panelRefs.current.map(compute));
      setProcessProgress(processRefs.current.map(compute));
      frame = null;
    };
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const brands = [
    { name: "Kenwood", svg: LOGO_KENWOOD },
    { name: "Gree", svg: LOGO_GREE },
    { name: "Dawlance", svg: null },
    { name: "Haier", svg: null },
    { name: "PEL", svg: null },
    { name: "Orient", svg: LOGO_ORIENT },
    { name: "Samsung", svg: LOGO_SAMSUNG },
    { name: "LG", svg: LOGO_LG },
    { name: "Mitsubishi", svg: LOGO_MITSUBISHI },
    { name: "Hitachi", svg: LOGO_HITACHI },
    { name: "Daikin", svg: LOGO_DAIKIN },
  ];

  const servicePanels = [
    { icon: AirVent, label: "Indoor Unit", caption: "Wall-mounted split units — cleaned, serviced, and gas-checked in place." },
    { icon: Fan, label: "Outdoor Unit", caption: "Condenser units serviced and re-gassed on-site, rain or heat." },
    { icon: Refrigerator, label: "Refrigerators & Freezers", caption: "Compressors, thermostats, and seals — repaired at home, same day." },
  ];

  const processSteps = [
    { icon: PhoneCall, title: "Get in Touch", text: "Call or WhatsApp us and tell us what's wrong — AC, fridge, freezer, or LED TV." },
    { icon: ClipboardList, title: "Quick Diagnosis", text: "We talk through the symptoms over the phone and give you a fair quote upfront." },
    { icon: Wrench, title: "On-Site Repair", text: "A technician comes to your home and fixes it on the spot — most jobs done same-day." },
    { icon: ShieldCheck, title: "Aftercare", text: "Got a follow-up question or the same issue comes back? We're a call away." },
  ];

  const reviews = [
    { stars: 5, text: "Customer review placeholder — swap in a real Google review once available.", name: "Customer Name" },
    { stars: 5, text: "Customer review placeholder — swap in a real Google review once available.", name: "Customer Name" },
    { stars: 4, text: "Customer review placeholder — swap in a real Google review once available.", name: "Customer Name" },
    { stars: 5, text: "Customer review placeholder — swap in a real Google review once available.", name: "Customer Name" },
    { stars: 5, text: "Customer review placeholder — swap in a real Google review once available.", name: "Customer Name" },
  ];

  const areas = [
    "Clifton", "Defence (DHA)", "Gulshan-e-Iqbal", "Nazimabad", "North Nazimabad",
    "Saddar", "Korangi", "Malir", "PECHS", "Gulistan-e-Johar", "Federal B. Area", "Shah Faisal Colony",
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: "Genuine Spare Parts" },
    { icon: UserCog, label: "Experienced Technicians" },
    { icon: Gauge, label: "Transparent Pricing" },
    { icon: Wrench, label: "Same-Day Service" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 relative overflow-hidden">
      {/* ambient liquid colour blobs (read through the glass nav/footer) */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl"
        style={{ backgroundColor: BRAND.sky, opacity: 0.3 }}
      />
      <div
        className="pointer-events-none absolute top-32 right-0 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: BRAND.navy, opacity: 0.12 }}
      />
      <div
        className="pointer-events-none absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl"
        style={{ backgroundColor: BRAND.maroon, opacity: 0.1 }}
      />

      {/* liquid-glass floating header */}
      <header className="fixed top-4 inset-x-4 lg:inset-x-0 z-50 flex justify-center">
        <nav className="relative w-full lg:max-w-5xl rounded-full bg-white/60 backdrop-blur-2xl border border-white/70 shadow-xl shadow-neutral-300/40 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent" />
          <div className="relative px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.maroon})` }}
              >
                <span className="font-display font-bold text-sm text-white">AF</span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
              </div>
              <div className="leading-tight hidden sm:block">
                <p className="font-display font-semibold text-sm tracking-tight text-neutral-900">
                  Ahmed Farhan
                </p>
                <span
                  className="inline-block text-white text-xs uppercase tracking-widest font-medium px-2 py-0.5 rounded mt-0.5"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  Electronics &amp; Refrigeration
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="relative text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 group"
                >
                  {link}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: BRAND.navy }}
                  />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                className="hidden sm:flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-shadow duration-300"
                style={{ background: `linear-gradient(to right, ${BRAND.navy}, ${BRAND.maroon})` }}
              >
                <Phone size={14} />
                Book a Repair
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white/70 border border-white/80 hover:bg-white transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-white/60 bg-white/80 backdrop-blur-xl px-6 py-5 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-neutral-700 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
              <button
                className="mt-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg"
                style={{ background: `linear-gradient(to right, ${BRAND.navy}, ${BRAND.maroon})` }}
              >
                Book a Repair
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="relative pt-28">
        {/* hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
          <Reveal>
            <div className="relative w-full aspect-video rounded-3xl border border-neutral-200 overflow-hidden mb-12 bg-gradient-to-br from-sky-950 via-neutral-900 to-neutral-950 shadow-2xl shadow-neutral-300/50">
              <span className="absolute top-4 left-4 z-10 flex items-center gap-2 text-xs text-white/50 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AT WORK
              </span>

              <div className="reel-scene-1 absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-5">
                  <UserCog size={44} className="text-sky-300" />
                  <AirVent size={56} className="text-sky-300 animate-pulse" />
                </div>
                <p className="font-display text-white/70 text-sm sm:text-base">
                  Servicing an Indoor Unit
                </p>
              </div>

              <div className="reel-scene-2 absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-5">
                  <UserCog size={44} className="text-sky-300" />
                  <Fan size={56} className="text-sky-300 animate-spin" />
                </div>
                <p className="font-display text-white/70 text-sm sm:text-base">
                  Gas-Charging an Outdoor Unit
                </p>
              </div>

              <div className="reel-scene-3 absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-5">
                  <UserCog size={44} className="text-sky-300" />
                  <Refrigerator size={56} className="text-sky-300" />
                </div>
                <p className="font-display text-white/70 text-sm sm:text-base">
                  Repairing a Refrigerator
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
                  <span className="text-neutral-900">Expert AC, Fridge &amp; LED Repair,</span>
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${BRAND.navy}, ${BRAND.maroon})` }}
                  >
                    Delivered to Your Door.
                  </span>
                </h1>
                <p className="mt-6 text-neutral-600 text-base sm:text-lg leading-relaxed max-w-md">
                  Same-day repair, servicing, and installation across Karachi — split
                  ACs, fridges, deep freezers, and LED TVs, fixed at home by Ahmed
                  Farhan's team.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="https://wa.me/923333078697"
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-400/40 transition-shadow duration-300"
                  >
                    <MessageCircle size={16} />
                    WhatsApp Us
                  </a>
                  <a
                    href="tel:+923333078697"
                    className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-shadow duration-300"
                    style={{ background: `linear-gradient(to right, ${BRAND.navy}, ${BRAND.maroon})` }}
                  >
                    <Phone size={16} />
                    Call +92 333 3078697
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex flex-col items-center gap-6">
                <div
                  className={`relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-white to-neutral-50 border border-neutral-200 p-6 shadow-xl shadow-neutral-300/40 transition-shadow duration-700`}
                  style={isCooling ? { boxShadow: `0 25px 50px -12px ${BRAND.sky}66` } : undefined}
                >
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-neutral-800 text-sm font-semibold font-display">
                      Living Room Split AC
                    </p>
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-colors duration-700"
                      style={{ backgroundColor: isCooling ? BRAND.sky : "#d4d4d4" }}
                    />
                  </div>

                  <div className="rounded-2xl bg-neutral-100 p-5">
                    <div className="flex flex-col gap-2 mb-4">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 rounded-full transition-colors duration-700"
                          style={{ backgroundColor: isCooling ? BRAND.sky : "#d4d4d4" }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <Fan
                        size={28}
                        className={isCooling ? "animate-spin" : "text-neutral-400"}
                        style={isCooling ? { color: BRAND.sky } : undefined}
                      />
                      <p
                        className="text-2xl font-display font-semibold"
                        style={{ color: isCooling ? BRAND.navy : "#404040" }}
                      >
                        {isCooling ? "18°C" : "Off"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-6 w-40 h-16 rounded-full blur-2xl transition-opacity duration-700"
                    style={{ backgroundColor: BRAND.sky, opacity: isCooling ? 0.6 : 0 }}
                  />
                </div>

                <div className="flex items-center gap-3">
                  {isCooling ? (
                    <Snowflake size={16} style={{ color: BRAND.navy }} />
                  ) : (
                    <Power size={16} className="text-neutral-400" />
                  )}
                  <span
                    className="text-sm font-medium"
                    style={{ color: isCooling ? BRAND.navy : "#737373" }}
                  >
                    {isCooling ? "Cooling" : "Standby"}
                  </span>
                  <button
                    onClick={() => setIsCooling(!isCooling)}
                    className="relative inline-flex items-center w-16 h-9 rounded-full border border-neutral-200 transition-colors duration-500"
                    style={{ backgroundColor: isCooling ? BRAND.sky : "#e5e5e5" }}
                    aria-label="Toggle AC"
                  >
                    <span
                      className={`absolute left-1 w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-500 ${
                        isCooling ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* trusted brands marquee */}
        <section className="relative py-14 overflow-hidden border-y border-neutral-200">
          <p
            className="text-xs uppercase tracking-widest font-medium text-center mb-8"
            style={{ color: BRAND.maroon }}
          >
            Trusted Brands We Service
          </p>

          <div className="marquee-wrap relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-50 to-transparent z-10" />

            <div className="flex w-max marquee-track items-center">
              {[...brands, ...brands].map((brand, i) =>
                brand.svg ? (
                  <div
                    key={i}
                    className="brand-logo h-8 sm:h-10 flex items-center px-10 shrink-0 opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300"
                    dangerouslySetInnerHTML={{ __html: brand.svg }}
                  />
                ) : (
                  <span
                    key={i}
                    className="font-display text-xl sm:text-2xl font-semibold text-neutral-400 hover:text-neutral-700 tracking-tight whitespace-nowrap px-10 transition-colors duration-300 shrink-0"
                  >
                    {brand.name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* services */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
                Services
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
                Repairs we handle, all from one team.
              </h2>
              <p className="mt-4 text-neutral-600 text-base leading-relaxed">
                From a quick gas top-up to a full TV panel fix — every job is
                carried out at your home by trained technicians.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Reveal delay={0} className="lg:col-span-2">
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl h-full">
                <span
                  className="absolute top-7 right-7 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${BRAND.maroon}14`, color: BRAND.maroon, border: `1px solid ${BRAND.maroon}33` }}
                >
                  Most requested
                </span>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <AirVent size={26} style={{ color: BRAND.navy }} />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 text-xl mb-2">
                  AC Service &amp; Deep Cleaning
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
                  Coil cleaning, dust removal, and full performance tune-ups to
                  restore cooling power on split and window units.
                </p>
              </div>
            </Reveal>

            <Reveal delay={60}>
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <Gauge size={22} style={{ color: BRAND.navy }} />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 text-lg mb-2">
                  Gas Refilling (R-22, R-410A)
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Leak detection and refrigerant top-up for older and current
                  split AC systems.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <Truck size={22} style={{ color: BRAND.navy }} />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 text-lg mb-2">
                  Installation &amp; Shifting
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Professional mounting, relocation, and re-commissioning for
                  split and window units.
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <Refrigerator size={22} style={{ color: BRAND.navy }} />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 text-lg mb-2">
                  Refrigerator Repair
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Compressor, thermostat, and cooling faults fixed for all
                  major fridge brands.
                </p>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl h-full">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <Snowflake size={22} style={{ color: BRAND.navy }} />
                </div>
                <h3 className="font-display font-semibold text-neutral-900 text-lg mb-2">
                  Deep &amp; Chest Freezers
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed">
                  Repair and servicing for commercial and home chest and deep
                  freezers.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300} className="lg:col-span-3">
              <div className="group relative rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                <div
                  className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                >
                  <Tv size={26} style={{ color: BRAND.navy }} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-neutral-900 text-lg mb-1">
                    LED TV Repair
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Panel, power supply, and display issues diagnosed and
                    repaired on-site for all major LED TV brands.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* how we work */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
              Our Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
              How We Work
            </h2>
            <p className="mt-4 text-neutral-600 text-base leading-relaxed max-w-xl mx-auto">
              Simple, transparent, and fast — from your first message to the
              job being done.
            </p>
            <div className="flex justify-center mt-6">
              <ACSketch drawn className="w-40 sm:w-52" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              const progress = processProgress[i] || 0;
              const scale = 0.85 + progress * 0.15;
              const opacity = 0.4 + progress * 0.6;
              return (
                <div
                  key={step.title}
                  ref={(el) => (processRefs.current[i] = el)}
                  className="will-change-transform"
                  style={{ transform: `scale(${scale})`, opacity }}
                >
                  <div className="rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-7 h-full shadow-lg shadow-neutral-200/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-display font-semibold text-sm"
                        style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.maroon})` }}
                      >
                        {i + 1}
                      </div>
                      <Icon size={22} style={{ color: BRAND.navy }} />
                    </div>
                    <h3 className="font-display font-semibold text-neutral-900 text-lg mb-2">
                      {step.title}
                    </h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* up close — scroll-linked zoom showcase */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal>
            <div className="max-w-2xl mb-4">
              <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
                Up Close
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
                Every system, every angle.
              </h2>
              <p className="mt-4 text-neutral-600 text-base leading-relaxed">
                From the indoor unit on your wall to the compressor outside and
                the fridge in your kitchen — here's what we actually work on.
              </p>
            </div>
          </Reveal>

          {servicePanels.map((panel, i) => {
            const Icon = panel.icon;
            const progress = panelProgress[i] || 0;
            const scale = 0.82 + progress * 0.18;
            const opacity = 0.35 + progress * 0.65;
            return (
              <div
                key={panel.label}
                ref={(el) => (panelRefs.current[i] = el)}
                className="py-20 lg:py-28 flex items-center justify-center will-change-transform"
                style={{ transform: `scale(${scale})`, opacity }}
              >
                <div className="flex flex-col items-center text-center gap-5 rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-xl px-10 py-12 max-w-md shadow-xl shadow-neutral-200/50">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                  >
                    <Icon size={36} style={{ color: BRAND.navy }} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-neutral-900">
                    {panel.label}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    {panel.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* recent works */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
                Our Work
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
                Recent Projects
              </h2>
              <p className="mt-4 text-neutral-600 text-base leading-relaxed">
                Real photos from real jobs are coming soon — this grid is ready
                to drop them into.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Reveal key={i} delay={i * 50}>
                <div
                  className="aspect-square rounded-2xl border border-neutral-200 flex flex-col items-center justify-center gap-2"
                  style={{ backgroundColor: `${BRAND.navy}08` }}
                >
                  <ImageIcon size={28} style={{ color: BRAND.navy, opacity: 0.4 }} />
                  <span className="text-xs text-neutral-400">Photo coming soon</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* testimonials */}
        <section className="relative py-16 lg:py-24 border-y border-neutral-200 overflow-hidden">
          <Reveal className="text-center max-w-2xl mx-auto px-6 mb-10">
            <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
              What Customers Say
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
              Trusted Across Karachi
            </h2>
            <p className="mt-4 text-neutral-600 text-base leading-relaxed">
              Real reviews are coming soon — these cards are placeholders ready
              to be swapped for genuine customer quotes.
            </p>
          </Reveal>

          <div className="marquee-wrap relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-neutral-50 to-transparent z-10" />
            <div className="flex w-max marquee-track-slow items-stretch gap-5 px-6">
              {[...reviews, ...reviews].map((review, i) => (
                <div
                  key={i}
                  className="w-72 shrink-0 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur-xl p-6 shadow-lg shadow-neutral-200/40"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s < review.stars ? "#f59e0b" : "none"}
                        className={s < review.stars ? "text-amber-500" : "text-neutral-300"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-500 italic leading-relaxed mb-4">
                    "{review.text}"
                  </p>
                  <p className="text-sm font-medium text-neutral-700">{review.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* areas we serve */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal>
            <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
              Coverage
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
              Areas We Serve
            </h2>
            <span
              className="inline-block text-white text-sm font-medium px-3 py-1 rounded mt-2"
              style={{ backgroundColor: BRAND.navy }}
            >
              Karachi &amp; Surrounding
            </span>
            <p className="mt-4 text-neutral-600 text-base leading-relaxed max-w-xl">
              Same-day response across most of Karachi. Call to confirm coverage
              for your specific area.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
            {areas.map((area, i) => (
              <Reveal key={area} delay={i * 30}>
                <a
                  href="#"
                  className="block text-center rounded-xl border border-neutral-200 bg-white/70 backdrop-blur-xl px-4 py-3 text-sm text-neutral-700 hover:bg-white hover:shadow-md transition-all duration-300"
                  style={{ ["--hover-color"]: BRAND.navy }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = BRAND.navy)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                >
                  {area}
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* why trust us */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: BRAND.maroon }}>
              Why Trust Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight">
              Built on honest service
            </h2>
            <p className="mt-4 text-neutral-600 text-base leading-relaxed">
              No formal certification logos to show yet — here's what we
              actually stand behind on every job.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-10">
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <Reveal key={badge.label} delay={i * 70}>
                  <div className="flex flex-col items-center text-center gap-3 rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-xl p-6">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${BRAND.navy}0f`, border: `1px solid ${BRAND.navy}26` }}
                    >
                      <Icon size={22} style={{ color: BRAND.navy }} />
                    </div>
                    <p className="text-sm font-medium text-neutral-700">{badge.label}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* newsletter */}
        <section className="px-4 lg:px-0 mb-16">
          <Reveal>
            <div
              className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden p-10 sm:p-14 text-center"
              style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.maroon})` }}
            >
              <p className="text-xs uppercase tracking-widest font-medium text-white/70 mb-3">
                Stay Informed
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Get Expert Tips Straight to Your Inbox
              </h2>
              <p className="mt-3 text-white/70 text-sm sm:text-base max-w-md mx-auto">
                Maintenance reminders and seasonal AC/fridge care tips. No spam.
              </p>
              <form
                className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 rounded-full px-5 py-3 text-sm bg-white/15 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:bg-white/20"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium"
                  style={{ color: BRAND.navy }}
                >
                  <Send size={14} />
                  Subscribe
                </button>
              </form>
              <p className="mt-3 text-xs text-white/50">
                Form UI only — connect a real signup service before going live.
              </p>
            </div>
          </Reveal>
        </section>
      </main>

      {/* liquid-glass footer */}
      <footer className="relative mt-10 px-4 lg:px-0">
        <div className="relative mx-auto max-w-6xl rounded-t-3xl bg-white/70 backdrop-blur-2xl border border-white/70 shadow-xl shadow-neutral-300/40 overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent" />

          <div className="relative px-8 py-12 grid sm:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.maroon})` }}
                >
                  <span className="font-display font-bold text-sm text-white">AF</span>
                </div>
                <div className="leading-tight">
                  <p className="font-display font-semibold text-sm text-neutral-900">
                    Ahmed Farhan
                  </p>
                  <span
                    className="inline-block text-white text-xs uppercase tracking-widest font-medium px-2 py-0.5 rounded mt-0.5"
                    style={{ backgroundColor: BRAND.navy }}
                  >
                    Electronics &amp; Refrigeration
                  </span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Same-day AC, fridge, and LED TV repair, servicing, and
                installation across Karachi.
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-4">
                Quick Links
              </p>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium mb-4">
                Get in Touch
              </p>
              <div className="flex flex-col gap-3 text-sm text-neutral-600">
                <a
                  href="tel:+923333078697"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
                >
                  <Phone size={15} style={{ color: BRAND.navy }} />
                  0333-3078697
                </a>
                <a
                  href="tel:+923218201772"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
                >
                  <Phone size={15} style={{ color: BRAND.navy }} />
                  0321-8201772
                </a>
                <a
                  href="mailto:ahmed_farhaneng@outlook.com"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
                >
                  <Mail size={15} style={{ color: BRAND.navy }} />
                  ahmed_farhaneng@outlook.com
                </a>
                <p className="flex items-center gap-2">
                  <MapPin size={15} style={{ color: BRAND.navy }} />
                  Karachi, Pakistan
                </p>
              </div>
            </div>
          </div>

          <div className="relative border-t border-neutral-200 px-8 py-5 text-center text-xs text-neutral-400">
            © 2026 Ahmed Farhan Electronics &amp; Refrigeration. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}