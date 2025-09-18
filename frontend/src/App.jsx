import React, { useState, useEffect } from 'react';
import './App.css';

// --- CONTENIDO ESTÁTICO Y SIMULACIÓN DE API ---

const categories = ['Política', 'Deportes', 'Tecnología', 'Economía'];

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

// Función simulada para traer noticias de una categoría
const fetchNewsFromApi = (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNewsData[category] || []);
    }, 500);
  });
};

// Función simulada para buscar noticias en todas las categorías
const fetchNewsBySearch = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allNews = Object.values(mockNewsData).flat();
      const filtered = allNews.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.excerpt.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    }, 500);
  });
};

// --- COMPONENTE PRINCIPAL ---
function NewsroomDashboard() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsLoading(true);

    // Si hay texto en búsqueda, usar esa función
    const fetchData = searchQuery
      ? fetchNewsBySearch(searchQuery)
      : fetchNewsFromApi(activeCategory);

    fetchData
      .then((data) => {
        setNews(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar noticias:", error);
        setIsLoading(false);
      });
  }, [activeCategory, searchQuery]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Newsroom Dashboard</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
                  onClick={() => {
                    setActiveCategory(category);
                    setSearchQuery(""); // limpiar búsqueda si se cambia de categoría
                  }}
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
          ) : news.length > 0 ? (
            news.map((item) => (
              <article key={item.id} className="news-card">
                <h2>{item.title}</h2>
                <p>{item.excerpt}</p>
              </article>
            ))
          ) : (
            <p>No se encontraron noticias.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default NewsroomDashboard;
