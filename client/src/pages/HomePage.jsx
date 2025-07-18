// client/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import styles from './HomePage.module.css';

// --- Iconos para las tarjetas de características ---
const IconHabitacion = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 12v8"/><path d="M2 18h20"/></svg>;
// ÍCONO RESTAURADO: Se vuelve a la versión original de la campana de servicio.
const IconEventos = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#FFC107" stroke="#FFC107"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;


// --- Componentes personalizados para las flechas del slider ---
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.slickArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
  );
}

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.slickArrow}`}
      style={{ ...style }}
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </div>
  );
}

const HomePage = () => {
  // --- Configuración para el carrusel de testimonios ---
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true, 
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  return (
    <div className={styles.homePage}>
      {/* --- HERO SECTION --- */}
      <header className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`${styles.heroContent} container`}>
          <h1 className={styles.animateFadeInUp}>Bienvenido a Hoteles VERANUM</h1>
          <p className={styles.animateFadeInUpDelayed}>Tu refugio de confort y elegancia. Modernizando la tradición para tu mejor estadía.</p>
          <Link to="/habitaciones">
            <button className={`${styles.heroButton} ${styles.animateFadeInUpDelayed}`}>Reservar Ahora</button>
          </Link>
        </div>
      </header>

      {/* --- SECCIÓN: BIENVENIDA / NUESTRA PROMESA --- */}
      <section className={styles.welcomeSection}>
        <div className="container">
          <h2>Una Promesa de Excelencia</h2>
          <p>
            En VERANUM, cada detalle está pensado para superar tus expectativas. Desde nuestras lujosas instalaciones hasta un servicio personalizado que te hará sentir como en casa. Vive una experiencia única que combina la calidez de la hospitalidad con la vanguardia del diseño.
          </p>
        </div>
      </section>

      {/* --- SECCIÓN DE SERVICIOS --- */}
      <section className={`${styles.features} container`}>
        <h2>Una Experiencia Completa</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><IconHabitacion /></div>
            <h3>Habitaciones de Lujo</h3>
            <p>Espacios diseñados para tu máximo confort, con vistas y amenidades de primer nivel.</p>
            <Link to="/habitaciones"><button className={styles.detailsButton}>Ver más detalles</button></Link>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}><IconEventos /></div>
            <h3>Eventos Inolvidables</h3>
            <p>Salones y personal experto para tus celebraciones y reuniones corporativas.</p>
            <Link to="/eventos"><button className={styles.detailsButton}>Cotizar Evento</button></Link>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN: TESTIMONIOS --- */}
      <section className={styles.testimonialSection}>
        <div className="container">
            <h2>Lo que dicen nuestros huéspedes</h2>
            <Slider {...sliderSettings}>
                <div className={styles.testimonialCard}>
                    <div className={styles.stars}><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
                    <p>"Una estadía simplemente perfecta. La atención al detalle y la amabilidad del personal hicieron de nuestro viaje algo inolvidable. ¡Volveremos sin dudarlo!"</p>
                    <h4>- Javiera Paz</h4>
                </div>
                 <div className={styles.testimonialCard}>
                    <div className={styles.stars}><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
                    <p>"Las instalaciones son de primer nivel y la gastronomía es espectacular. El mejor hotel en el que me he hospedado en años. Lo recomiendo al 100%."</p>
                    <h4>- Matías Rojas</h4>
                </div>
                 <div className={styles.testimonialCard}>
                    <div className={styles.stars}><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
                    <p>"Organizamos un evento corporativo y todo salió impecable. El equipo de Veranum se encargó de todo. Profesionalismo y calidad."</p>
                    <h4>- Sofía Castro</h4>
                </div>
            </Slider>
        </div>
      </section>
    </div>
  );
};

export default HomePage;