import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './App.css';
import NewsCard from './components/NewCard'
// --- (El resto del código de APIs y datos estáticos se mantiene igual) ---
const categories = ['Política', 'Deportes', 'Tecnología', 'Economía'];
const mockNewsData = {
  Política: [
    { id: 1, title: 'El gobierno anuncia nuevas medidas económicas', excerpt: 'En una conferencia de prensa, el ministro de hacienda detalló el plan...' },
    { id: 2, title: 'Debate en el congreso sobre la reforma educativa', excerpt: 'La sesión se extendió por más de 8 horas con intensos intercambios...' },
  ],
  Deportes: [
    { id: 3, title: 'El equipo local gana el campeonato nacional', excerpt: 'Con un gol en el último minuto, se coronaron campeones por tercera vez...' },
    { id: 4, title: 'Atleta rompe récord mundial en los 100 metros planos', excerpt: 'La corredora detuvo el cronómetro en 9.50 segundos, una marca histórica...' },
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

const fetchNewsFromApi = (category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockNewsData[category] || []);
    }, 500);
  });
};

// --- COMPONENTE PRINCIPAL ---

function NewsroomDashboard() {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchNewsFromApi(activeCategory)
      .then(data => {
        setNews(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error al cargar las noticias:", error);
        setIsLoading(false);
      });
  }, [activeCategory]);

  const handleShowComments = async (postId) => {
    Swal.fire({
      title: 'Cargando comentarios...',
      text: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error('La respuesta de la red no fue exitosa.');
      }
      const comments = await response.json();

      if (comments.length === 0) {
        Swal.fire('Sin comentarios', 'No se encontraron comentarios para esta noticia.', 'info');
        return;
      }
      
      const commentsHtml = comments.slice(0, 5).map(comment => 
        `<div class="comment">
           <strong>${comment.name}</strong>
           <p>${comment.body}</p>
         </div>`
      ).join('');

      Swal.fire({
        title: `Comentarios para la Noticia #${postId}`,
        html: `<div class="comments-container">${commentsHtml}</div>`,
        icon: 'success'
      });

    } catch (error) {
      console.error("Error al cargar los comentarios:", error);
      Swal.fire('Error', 'No se pudieron cargar los comentarios.', 'error');
    }
  };

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
            // MODIFICADO: Ahora mapeamos y renderizamos el componente NewsCard
            news.map((item) => (
              <NewsCard
                key={item.id}
                id={item.id}
                title={item.title}
                excerpt={item.excerpt}
                onShowComments={handleShowComments} // Le pasamos la función como prop
              />
            ))
          )}
        </main>
      </div>
    </div>
  );
}

export default NewsroomDashboard;