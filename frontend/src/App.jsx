import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONTENIDO ESTÁTICO Y SIMULACIÓN DE API ---

// Lista de categorías estáticas para el menú lateral.
const categories = ['Política', 'Deportes', 'Tecnología', 'Economía'];

// Datos de ejemplo para simular la respuesta de un endpoint.
const mockNewsData = {
  Política: [
    { id: 1, title: 'El gobierno anuncia nuevas medidas económicas', excerpt: 'En una conferencia de prensa, el ministro de hacienda detalló el plan...' },
    { id: 2, title: 'Debate en el congreso sobre la reforma educativa', excerpt: 'La sesión se extendió por más de 8 horas con intensos intercambios...' },
  ],
  Deportes: [
    { id: 3, title: 'El equipo local gana el campeonato nacional', excerpt: 'Con un gol en el último minuto, se coronaron campeones por tercera vez...' },
    { id: 4, title: 'Atleta rompe récord mundial en los 100 metros planos', excerpt: 'La corredora detuvo el cronómetro en 9.50 segundos, una marca histórica...' },
    { id: 5, title: 'Anuncian la sede para los próximos Juegos Olímpicos', excerpt: 'El comité olímpico internacional tomó la decisión esta mañana...' },
  ],
  Tecnología: [
    { id: 6, title: 'Lanzamiento del nuevo smartphone insignia', excerpt: 'La compañía tecnológica presentó su nuevo dispositivo con cámara mejorada y IA...' },
    { id: 7, title: 'La inteligencia artificial generativa revoluciona el arte', excerpt: 'Artistas de todo el mundo están adoptando nuevas herramientas para crear...' },
  ],
  Economía: [
    { id: 8, title: 'La inflación muestra signos de desaceleración', excerpt: 'El índice de precios al consumidor subió un 0.2% el último mes...' },
    { id: 9, title: 'Inversión extranjera alcanza cifras récord este trimestre', excerpt: 'Los sectores de tecnología y energías renovables lideran la captación de capital...' },
  ],
};

// Función que simula una llamada a un endpoint.
// Devuelve los datos después de un breve retraso para simular la latencia de red.
const fetchNewsFromApi = (category) => {
  console.log(`Buscando noticias para la categoría: ${category}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNewsData[category] || []);
    }, 500); // Simula 500ms de espera
  });
};


// --- COMPONENTE PRINCIPAL ---

function NewsroomDashboard() {
  // Estado para guardar la categoría actualmente seleccionada.
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  // Estado para almacenar las noticias que se muestran a la derecha.
  const [news, setNews] = useState([]);
  // Estado para mostrar un mensaje de carga mientras se obtienen los datos.
  const [isLoading, setIsLoading] = useState(true);

  // useEffect se ejecuta cuando el componente se monta y cada vez que `activeCategory` cambia.
  // Aquí es donde se llama al endpoint.
  useEffect(() => {
    setIsLoading(true); // Activa el estado de carga
    
    fetchNewsFromApi(activeCategory)
      .then(data => {
        setNews(data); // Actualiza el estado con las nuevas noticias
        setIsLoading(false); // Desactiva el estado de carga
      })
      .catch(error => {
        console.error("Error al cargar las noticias:", error);
        setIsLoading(false); // También desactiva la carga si hay un error
      });
  }, [activeCategory]); // El efecto depende de `activeCategory`

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Newsroom Dashboard</h1>
        <div className="search-bar">
          <input type="text" placeholder="Buscar..." />
        </div>
      </header>
      <div className="dashboard-body">
        <aside className="sidebar">
          <nav>
            <ul>
              {categories.map((category) => (
                <li
                  key={category}
                  className={activeCategory === category ? 'active' : ''}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="news-content">
          {isLoading ? (
            <p>Cargando noticias...</p>
          ) : (
            news.map((item) => (
              <article key={item.id} className="news-card">
                <h2>{item.title}</h2>
                <p>{item.excerpt}</p>
                <div className="card-actions">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </article>
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default NewsroomDashboard;